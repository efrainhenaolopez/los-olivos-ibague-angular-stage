import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { HeaderPageSection } from '../../../../secciones/header-page-section/header-page-section';
import { ContentFooter, type FooterTemplate } from '../../../../secciones/content-footer/content-footer';
import {
  PaletteFab,
  type Palette,
  type MenuType,
  type ShapeState,
  type TributeShapeState,
  DEFAULT_SHAPE,
  DEFAULT_TRIBUTE_SHAPE,
} from '../../../../secciones/palette-fab/palette-fab';
import { ProgressBar } from '../../../../secciones/progress-bar/progress-bar';
import { TributeSection } from '../../../../secciones/tribute-section/tribute-section';
import { GtmService } from '../../../../servicios/gtm';

const STORAGE_KEY = 'planes-empresariales-fab-prefs';

interface StoredPrefs {
  template: FooterTemplate;
  palette: Palette | null;
  menuType: MenuType;
  shape: ShapeState;
  tributeShape: TributeShapeState;
}

interface Advantage {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-empresariales',
  imports: [
    RouterLink,
    HeaderPageSection,
    ContentFooter,
    PaletteFab,
    ProgressBar,
    TributeSection,
  ],
  templateUrl: './empresariales.html',
  styleUrl: './empresariales.scss',
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
    '[style.--tribute-rotation]': 'tributeShapeCss().rotation',
    '[style.--tribute-x]':        'tributeShapeCss().x',
    '[style.--tribute-y]':        'tributeShapeCss().y',
    '[style.--tribute-size]':     'tributeShapeCss().size',
  },
})
export class Empresariales implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);

  readonly activeTemplate = signal<FooterTemplate>('');
  readonly activePalette = signal<Palette | null>(null);
  readonly menuType = signal<MenuType>('tradicional');
  readonly shape = signal<ShapeState>({ ...DEFAULT_SHAPE });
  readonly tributeShape = signal<TributeShapeState>({ ...DEFAULT_TRIBUTE_SHAPE });

  readonly territoryAttr = computed(() => {
    const value = this.activeTemplate();
    if (!value) return 'prevision';
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
    return { rotation: `${s.rotation}deg`, x: `${s.x}%`, y: `${s.y}%` };
  });

  readonly tributeShapeCss = computed(() => {
    const s = this.tributeShape();
    return {
      rotation: `${s.rotation}deg`,
      x: `${s.x}%`,
      y: `${s.y}%`,
      size: `${s.size}%`,
    };
  });

  /** 4 ventajas de los planes empresariales. */
  readonly advantages = signal<Advantage[]>([
    {
      icon: 'fa-solid fa-piggy-bank',
      title: 'Cultura de ahorro',
      description:
        'Promovemos al interior de la empresa la cultura del ahorro para todas las situaciones de la vida.',
    },
    {
      icon: 'fa-solid fa-hands-holding-circle',
      title: 'Apoyo al empleado',
      description:
        'Brindamos apoyo al colaborador en el momento en que lo necesita, con servicio integral para su familia.',
    },
    {
      icon: 'fa-solid fa-people-group',
      title: 'Beneficios para todos',
      description:
        'Un beneficio que motiva y retiene talento al interior de su empresa: bienestar tangible para todos los afiliados.',
    },
    {
      icon: 'fa-solid fa-shield-halved',
      title: 'Coberturas exclusivas',
      description:
        'Tanto los colaboradores y/o afiliados, como el empresario, reciben beneficios y coberturas exclusivas.',
    },
  ]);

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
  }

  ngOnInit(): void {
    this.title.setTitle('Planes Empresariales de Previsión Exequial — Los Olivos Tolima');
    this.meta.updateTag({
      name: 'description',
      content:
        'Planes empresariales de previsión exequial a la medida para empresas, cooperativas y asociaciones del Tolima. Cultura de ahorro, apoyo al empleado y coberturas exclusivas.',
    });
    this.gtm.trackPageView('/planes-empresariales');
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

  onContactPhoneClick(): void {
    this.gtm.push({
      event: 'tribute_section_phone_click',
      page: '/planes-empresariales',
    });
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
      if (prefs.shape) this.shape.set(prefs.shape);
      if (prefs.tributeShape) this.tributeShape.set(prefs.tributeShape);
    } catch {
      // localStorage corrupto o no disponible
    }
  }

  private saveToStorage(prefs: StoredPrefs): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // quota exceeded
    }
  }
}
