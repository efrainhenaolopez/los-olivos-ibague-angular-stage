import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
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

const STORAGE_KEY = 'prevision-overview-fab-prefs';

interface StoredPrefs {
  template: FooterTemplate;
  palette: Palette | null;
  menuType: MenuType;
  shape: ShapeState;
  tributeShape: TributeShapeState;
}

interface PlanType {
  id: 'individuales' | 'empresariales';
  title: string;
  description: string;
  image: string;
  route: string;
}

interface RitualStage {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-overview',
  imports: [
    RouterLink,
    HeaderPageSection,
    ContentFooter,
    PaletteFab,
    ProgressBar,
    TributeSection,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
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
    '[style.--shape-radius]':   'shapeCss().borderRadius',
    '[style.--shape-opacity]':  'shapeCss().opacity',
    '[style.--tribute-rotation]': 'tributeShapeCss().rotation',
    '[style.--tribute-x]':        'tributeShapeCss().x',
    '[style.--tribute-y]':        'tributeShapeCss().y',
    '[style.--tribute-size]':     'tributeShapeCss().size',
    '[style.--tribute-radius]':   'tributeShapeCss().borderRadius',
    '[style.--tribute-opacity]':  'tributeShapeCss().opacity',
  },
})
export class Overview implements OnInit {
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
    return { rotation: `${s.rotation}deg`, x: `${s.x}%`, y: `${s.y}%`, borderRadius: `${s.borderRadius}px`, opacity: `${s.opacity}` };
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

  readonly planes = signal<PlanType[]>([
    {
      id: 'individuales',
      title: 'Planes Individuales',
      description:
        'Protege a tu familia, realizando la afiliación directamente en nuestras sedes de homenajes a través de las opciones que ofrecemos.',
      image: '/img/wp-migrated/prevision/individuales-card.webp',
      route: '/planes-individuales',
    },
    {
      id: 'empresariales',
      title: 'Planes Empresariales',
      description:
        'Planes de previsión a la medida, especialmente diseñados para las necesidades de las empresas, cooperativas y asociaciones tanto privadas como públicas.',
      image: '/img/wp-migrated/prevision/empresariales-card.webp',
      route: '/planes-empresariales',
    },
  ]);

  readonly stages = signal<RitualStage[]>([
    {
      id: 'desprendimiento',
      number: '1',
      title: 'Etapa de Desprendimiento',
      description:
        'Acompañamiento al núcleo familiar desde el momento del fallecimiento, con asistencia integral y orientación personalizada.',
      image: '/img/wp-migrated/prevision/etapa-1-desprendimiento.webp',
    },
    {
      id: 'encuentro',
      number: '2',
      title: 'Etapa de Encuentro y Entronización',
      description:
        'Ceremonia de homenaje al ser querido en nuestras salas de velación, dignificando el momento con elogios y exaltaciones.',
      image: '/img/wp-migrated/prevision/etapa-2-encuentro.webp',
    },
    {
      id: 'destino-final',
      number: '3',
      title: 'Etapa de Destino Final',
      description:
        'Inhumación o cremación según la elección de la familia, en nuestro Parque Cementerio o en los destinos finales acordados.',
      image: '/img/wp-migrated/prevision/etapa-3-destino-final.webp',
    },
    {
      id: 'renacimiento',
      number: '4',
      title: 'Etapa de Renacimiento',
      description:
        'Acompañamiento posterior al servicio: apoyo al duelo, conmemoraciones y espacios para honrar la memoria de quien ya no está.',
      image: '/img/wp-migrated/prevision/etapa-4-renacimiento.webp',
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
    this.title.setTitle('Previsión Exequial — Los Olivos Tolima · Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content:
        'Planes de previsión exequial Los Olivos Tolima: cobertura individual y empresarial diseñada para proteger a tu familia con tranquilidad, dignidad y servicio integral.',
    });
    this.gtm.trackPageView('/prevision');
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
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/prevision' });
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
