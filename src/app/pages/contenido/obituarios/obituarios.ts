import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderPageSection } from '../../../secciones/header-page-section/header-page-section';
import { ContentFooter, type FooterTemplate } from '../../../secciones/content-footer/content-footer';
import {
  PaletteFab,
  type Palette,
  type MenuType,
  type ShapeState,
  type TributeShapeState,
  DEFAULT_SHAPE,
  DEFAULT_TRIBUTE_SHAPE,
} from '../../../secciones/palette-fab/palette-fab';
import { ProgressBar } from '../../../secciones/progress-bar/progress-bar';
import { TributeSection } from '../../../secciones/tribute-section/tribute-section';
import { GtmService } from '../../../servicios/gtm';
import { ObituariosService, type Obituario } from '../../../servicios/obituarios';

const STORAGE_KEY = 'obituarios-fab-prefs';
const DEFAULT_TEMPLATE: FooterTemplate = 'duelo-clasico';

/** Paleta `duelo-clasico` corregida (cta accent rosa/malva). */
const DEFAULT_PALETTE: Palette = {
  primary: '#234b50',
  secondary: '#477A7B',
  accent: '#A94D69',
  cta: '#A94D69',
  ctaStrong: '#5B132C',
  bgSoft: '#EDF5F7',
  onPrimary: '#ffffff',
  gradientFrom: '#234b50',
  gradientTo: '#5a8c8e',
};

interface StoredPrefs {
  template: FooterTemplate;
  palette: Palette | null;
  menuType: MenuType;
  shape: ShapeState;
  tributeShape: TributeShapeState;
}

interface SearchFormData {
  nombre: string;
  sede: string;
}

@Component({
  selector: 'app-obituarios',
  imports: [
    FormsModule,
    RouterLink,
    HeaderPageSection,
    ContentFooter,
    PaletteFab,
    ProgressBar,
    TributeSection,
  ],
  templateUrl: './obituarios.html',
  styleUrl: './obituarios.scss',
  host: {
    '[attr.data-territory]':   'territoryAttr()',
    '[attr.data-template]':    'templateAttr()',
    '[style.--color-primary]':   'activePalette()?.primary',
    '[style.--color-secondary]': 'activePalette()?.secondary',
    '[style.--color-accent]':    'activePalette()?.accent',
    '[style.--color-cta]':       'activePalette()?.cta',
    '[style.--color-bg-light]':  'activePalette()?.bgSoft',
    '[style.--color-progress]':  'activePalette()?.progressColor',
    '[style.--shape-rotation]':  'shapeCss().rotation',
    '[style.--shape-x]':         'shapeCss().x',
    '[style.--shape-y]':         'shapeCss().y',
    '[style.--shape-radius]':    'shapeCss().borderRadius',
    '[style.--shape-opacity]':   'shapeCss().opacity',
    '[style.--tribute-rotation]': 'tributeShapeCss().rotation',
    '[style.--tribute-x]':        'tributeShapeCss().x',
    '[style.--tribute-y]':        'tributeShapeCss().y',
    '[style.--tribute-size]':     'tributeShapeCss().size',
    '[style.--tribute-radius]':   'tributeShapeCss().borderRadius',
    '[style.--tribute-opacity]':  'tributeShapeCss().opacity',
  },
})
export class Obituarios implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);
  private readonly obituariosService = inject(ObituariosService);

  /** 3 filas × 3 cards por fila = 9 cards por página. */
  readonly PAGE_SIZE = 9;

  readonly activeTemplate = signal<FooterTemplate>(DEFAULT_TEMPLATE);
  readonly activePalette = signal<Palette | null>(DEFAULT_PALETTE);
  readonly menuType = signal<MenuType>('tradicional');
  readonly shape = signal<ShapeState>({ ...DEFAULT_SHAPE });
  readonly tributeShape = signal<TributeShapeState>({ ...DEFAULT_TRIBUTE_SHAPE });

  readonly territoryAttr = computed(() => {
    const value = this.activeTemplate();
    if (!value) return 'duelo';
    const idx = value.indexOf('-');
    return idx === -1 ? value : value.slice(0, idx);
  });

  readonly templateAttr = computed(() => {
    const value = this.activeTemplate();
    if (!value) return null;
    const idx = value.indexOf('-');
    return idx === -1 ? null : value.slice(idx + 1);
  });

  readonly shapeCss = computed(() => {
    const s = this.shape();
    return {
      rotation: `${s.rotation}deg`,
      x: `${s.x}%`,
      y: `${s.y}%`,
      borderRadius: `${s.borderRadius}px`,
      opacity: `${s.opacity}`,
    };
  });

  readonly tributeShapeCss = computed(() => {
    const s = this.tributeShape();
    return {
      rotation: `${s.rotation}deg`,
      x: `${s.x}%`,
      y: `${s.y}%`,
      size: `${s.size}%`,
      borderRadius: `${s.borderRadius}px`,
      opacity: `${s.opacity}`,
    };
  });

  /** Dataset completo recibido del plugin WP. */
  readonly allObituarios = signal<Obituario[]>([]);

  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  /** Filtros acumulativos en cliente. */
  readonly form = signal<SearchFormData>({ nombre: '', sede: '' });

  readonly currentPage = signal<number>(1);

  /** Filtrado acumulativo (AND). */
  readonly filteredObituarios = computed<Obituario[]>(() => {
    const all = this.allObituarios();
    const nombreQuery = this.form().nombre.trim().toLowerCase();
    const sedeQuery = this.form().sede.trim().toLowerCase();
    if (!nombreQuery && !sedeQuery) return all;
    return all.filter((o) => {
      const matchNombre = !nombreQuery || o.nombre.toLowerCase().includes(nombreQuery);
      const matchSede = !sedeQuery || o.sedeYSala.toLowerCase().includes(sedeQuery);
      return matchNombre && matchSede;
    });
  });

  readonly total = computed<number>(() => this.filteredObituarios().length);

  readonly totalPages = computed<number>(() =>
    Math.max(1, Math.ceil(this.filteredObituarios().length / this.PAGE_SIZE)),
  );

  /** Páginas chunked para el slider (cada página = hasta 9 obituarios). */
  readonly pages = computed<Obituario[][]>(() => {
    const filtered = this.filteredObituarios();
    if (filtered.length === 0) return [];
    const result: Obituario[][] = [];
    for (let i = 0; i < filtered.length; i += this.PAGE_SIZE) {
      result.push(filtered.slice(i, i + this.PAGE_SIZE));
    }
    return result;
  });

  readonly trackTransform = computed<string>(() =>
    `translateX(-${(this.currentPage() - 1) * 100}%)`,
  );

  readonly showSliderControls = computed<boolean>(() => this.totalPages() > 1);

  readonly hasActiveFilters = computed<boolean>(() => {
    const f = this.form();
    return f.nombre.trim().length > 0 || f.sede.trim().length > 0;
  });

  constructor() {
    this.restoreFromStorage();
    effect(() => {
      this.saveToStorage({
        template: this.activeTemplate(),
        palette: this.activePalette(),
        menuType: this.menuType(),
        shape: this.shape(),
        tributeShape: this.tributeShape(),
      });
    });

    // Reset a la página 1 cuando cambian los filtros.
    effect(() => {
      this.form();
      this.currentPage.set(1);
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Obituarios — Los Olivos Tolima · Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content:
        'Obituarios Los Olivos · conoce los nombres de los seres queridos a quienes hoy hacemos un homenaje y exaltamos su legado. Filtra por nombre o sede para ubicar el lugar del homenaje.',
    });
    this.gtm.trackPageView('/obituarios');
    this.loadObituarios();
  }

  private loadObituarios(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.obituariosService.getAll().subscribe({
      next: (data) => {
        this.allObituarios.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'No pudimos cargar los obituarios. Intenta nuevamente en unos segundos o contacta a Servicio al Cliente.',
        );
        this.allObituarios.set([]);
        this.loading.set(false);
      },
    });
  }

  updateNombre(value: string): void {
    this.form.update((f) => ({ ...f, nombre: value }));
  }

  updateSede(value: string): void {
    this.form.update((f) => ({ ...f, sede: value }));
  }

  clearFilters(): void {
    this.form.set({ nombre: '', sede: '' });
  }

  goToPage(index: number): void {
    const target = index + 1;
    if (target < 1 || target > this.totalPages() || target === this.currentPage()) return;
    this.currentPage.set(target);
    this.gtm.push({
      event: 'obituario_paginate',
      page_index: target,
      page: '/obituarios',
    });
  }

  nextPage(): void {
    const current = this.currentPage();
    if (current >= this.totalPages()) return;
    this.currentPage.set(current + 1);
    this.gtm.push({
      event: 'obituario_paginate',
      page_index: current + 1,
      direction: 'next',
      page: '/obituarios',
    });
  }

  prevPage(): void {
    const current = this.currentPage();
    if (current <= 1) return;
    this.currentPage.set(current - 1);
    this.gtm.push({
      event: 'obituario_paginate',
      page_index: current - 1,
      direction: 'prev',
      page: '/obituarios',
    });
  }

  retryLoad(): void {
    this.loadObituarios();
  }

  onCondolenceClick(obituario: Obituario): void {
    this.gtm.push({
      event: 'obituario_condolencia_click',
      obituario_id: obituario.id,
      obituario_slug: obituario.slug,
      page: '/obituarios',
    });
  }

  onContactPhoneClick(): void {
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/obituarios' });
  }

  onTemplateChange(event: { id: string; palette: Palette }): void {
    this.activeTemplate.set(event.id as FooterTemplate);
    this.activePalette.set(event.palette);
  }

  onMenuTypeChange(value: MenuType): void {
    this.menuType.set(value);
  }

  onShapeChange(value: ShapeState): void {
    this.shape.set(value);
  }

  onTributeShapeChange(value: TributeShapeState): void {
    this.tributeShape.set(value);
  }

  private restoreFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const prefs = JSON.parse(raw) as Partial<StoredPrefs>;
      if (prefs.template !== undefined) this.activeTemplate.set(prefs.template);
      if (prefs.palette !== undefined) this.activePalette.set(prefs.palette);
      if (prefs.menuType) this.menuType.set(prefs.menuType);
      if (prefs.shape) this.shape.set({ ...DEFAULT_SHAPE, ...prefs.shape });
      if (prefs.tributeShape) this.tributeShape.set({ ...DEFAULT_TRIBUTE_SHAPE, ...prefs.tributeShape });
    } catch {
      // localStorage corrupto o no disponible: ignora
    }
  }

  private saveToStorage(prefs: StoredPrefs): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // quota exceeded: ignora
    }
  }
}
