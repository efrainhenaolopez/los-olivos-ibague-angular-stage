import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
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
import {
  RegistrosDefuncionService,
  type RegistroDefuncion,
} from '../../../servicios/registros-defuncion';

const STORAGE_KEY = 'registros-defuncion-fab-prefs';
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
  serQuerido: string;
  documento: string;
}

@Component({
  selector: 'app-registros-defuncion',
  imports: [
    FormsModule,
    HeaderPageSection,
    ContentFooter,
    PaletteFab,
    ProgressBar,
    TributeSection,
  ],
  templateUrl: './registros-defuncion.html',
  styleUrl: './registros-defuncion.scss',
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
export class RegistrosDefuncion implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);
  private readonly registrosService = inject(RegistrosDefuncionService);

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
  readonly allRecords = signal<RegistroDefuncion[]>([]);

  /** Estado de carga inicial. */
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  /** Valores del formulario de búsqueda (filtros acumulativos en cliente). */
  readonly form = signal<SearchFormData>({ serQuerido: '', documento: '' });

  /** Página actual del paginador (sobre el set ya filtrado). */
  readonly currentPage = signal<number>(1);

  /** Registros filtrados según los criterios del formulario.
   *  - Si ambos campos están vacíos: retorna todos.
   *  - Si solo uno tiene valor: filtra por ese.
   *  - Si los dos tienen valor: AND (acumulativo). */
  readonly filteredRecords = computed<RegistroDefuncion[]>(() => {
    const all = this.allRecords();
    const serQuery = this.form().serQuerido.trim().toLowerCase();
    const docQuery = this.form().documento.trim();
    if (!serQuery && !docQuery) return all;
    return all.filter((r) => {
      const matchSer = !serQuery || r.serQuerido.toLowerCase().includes(serQuery);
      const matchDoc = !docQuery || (r.documentoIdentidad ?? '').includes(docQuery);
      return matchSer && matchDoc;
    });
  });

  /** Total de registros tras aplicar filtros. */
  readonly total = computed<number>(() => this.filteredRecords().length);

  /** Número total de páginas (sobre el filtrado). */
  readonly totalPages = computed<number>(() =>
    Math.max(1, Math.ceil(this.filteredRecords().length / this.PAGE_SIZE)),
  );

  /** Slice visible · página actual sobre el filtrado. */
  readonly pageRecords = computed<RegistroDefuncion[]>(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredRecords().slice(start, start + this.PAGE_SIZE);
  });

  /** Páginas chunked para el slider (cada página es un array de hasta 9 registros). */
  readonly pages = computed<RegistroDefuncion[][]>(() => {
    const filtered = this.filteredRecords();
    if (filtered.length === 0) return [];
    const result: RegistroDefuncion[][] = [];
    for (let i = 0; i < filtered.length; i += this.PAGE_SIZE) {
      result.push(filtered.slice(i, i + this.PAGE_SIZE));
    }
    return result;
  });

  /** Transform CSS del track del slider · `currentPage` es 1-indexed. */
  readonly trackTransform = computed<string>(() =>
    `translateX(-${(this.currentPage() - 1) * 100}%)`,
  );

  /** Muestra flechas y dots solo si hay más de 1 página. */
  readonly showSliderControls = computed<boolean>(() => this.totalPages() > 1);

  /** Indica si hay algún filtro activo. */
  readonly hasActiveFilters = computed<boolean>(() => {
    const f = this.form();
    return f.serQuerido.trim().length > 0 || f.documento.trim().length > 0;
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

    // Cada vez que cambian los filtros, vuelve a la página 1.
    effect(() => {
      this.form();
      this.currentPage.set(1);
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Registros de Defunción — Los Olivos Tolima · Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content:
        'Consulta el número de Registro Civil de Defunción y la notaría donde quedó registrado tu ser querido. Filtra por nombre y/o cédula. Información de servicios prestados por Serfuncoop Los Olivos.',
    });
    this.gtm.trackPageView('/registros-defuncion');
    this.loadRecords();
  }

  /** Carga la lista completa una vez. Errores se exponen vía errorMessage. */
  private loadRecords(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.registrosService.getAll().subscribe({
      next: (records) => {
        this.allRecords.set(records);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'No pudimos cargar los registros. Intenta nuevamente en unos segundos o contacta a Servicio al Cliente.',
        );
        this.allRecords.set([]);
        this.loading.set(false);
      },
    });
  }

  /** Cambia el valor de un campo del filtro. */
  updateSerQuerido(value: string): void {
    this.form.update((f) => ({ ...f, serQuerido: value }));
  }

  updateDocumento(value: string): void {
    this.form.update((f) => ({ ...f, documento: value }));
  }

  /** Limpia los filtros y vuelve a la primera página. */
  clearFilters(): void {
    this.form.set({ serQuerido: '', documento: '' });
  }

  /** Navega a una página específica (0-indexed para los dots, normalizado a 1-indexed). */
  goToPage(index: number): void {
    const target = index + 1;
    if (target < 1 || target > this.totalPages() || target === this.currentPage()) return;
    this.currentPage.set(target);
    this.gtm.push({
      event: 'registro_defuncion_paginate',
      page_index: target,
      page: '/registros-defuncion',
    });
  }

  /** Avanza una página · botón se deshabilita en la última (sin wrap). */
  nextPage(): void {
    const current = this.currentPage();
    if (current >= this.totalPages()) return;
    this.currentPage.set(current + 1);
    this.gtm.push({
      event: 'registro_defuncion_paginate',
      page_index: current + 1,
      direction: 'next',
      page: '/registros-defuncion',
    });
  }

  /** Retrocede una página · botón se deshabilita en la primera (sin wrap). */
  prevPage(): void {
    const current = this.currentPage();
    if (current <= 1) return;
    this.currentPage.set(current - 1);
    this.gtm.push({
      event: 'registro_defuncion_paginate',
      page_index: current - 1,
      direction: 'prev',
      page: '/registros-defuncion',
    });
  }

  /** Reintenta la carga (cuando falló) sin recargar la página. */
  retryLoad(): void {
    this.loadRecords();
  }

  onContactPhoneClick(): void {
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/registros-defuncion' });
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
      // quota exceeded o storage deshabilitado: ignora
    }
  }
}
