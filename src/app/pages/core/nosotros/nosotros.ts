import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { HeaderPageSection } from '../../../secciones/header-page-section/header-page-section';
import { ContentFooter, type FooterTemplate } from '../../../secciones/content-footer/content-footer';
import { PaletteFab, type Palette, type MenuType, type ShapeState, type TributeShapeState, DEFAULT_SHAPE, DEFAULT_TRIBUTE_SHAPE } from '../../../secciones/palette-fab/palette-fab';
import { ProgressBar } from '../../../secciones/progress-bar/progress-bar';
import { ProjectionCards, type ProjectionCard } from '../../../secciones/projection-cards/projection-cards';
import { TributeSection } from '../../../secciones/tribute-section/tribute-section';
import { GtmService } from '../../../servicios/gtm';

const STORAGE_KEY = 'nosotros-fab-prefs';

interface StoredPrefs {
  template: FooterTemplate;
  palette: Palette | null;
  menuType: MenuType;
  shape: ShapeState;
  tributeShape: TributeShapeState;
}

@Component({
  selector: 'app-nosotros',
  imports: [HeaderPageSection, ContentFooter, PaletteFab, ProgressBar, ProjectionCards, TributeSection],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.scss',
  host: {
    '[attr.data-territory]':   'territoryAttr()',
    '[attr.data-template]':    'templateAttr()',
    // Inyecta la paleta activa del FAB como CSS vars (cada plantilla tiene
    // colores distintos, no solo la base territorial).
    '[style.--color-primary]':   'activePalette()?.primary',
    '[style.--color-secondary]': 'activePalette()?.secondary',
    '[style.--color-accent]':    'activePalette()?.accent',
    '[style.--color-cta]':       'activePalette()?.cta',
    '[style.--color-bg-light]':  'activePalette()?.bgSoft',
    '[style.--color-progress]':  'activePalette()?.progressColor',
    // CSS vars para el ajuste fino de la "forma orgánica" sobre las flip cards.
    '[style.--shape-rotation]':  'shapeCss().rotation',
    '[style.--shape-x]':         'shapeCss().x',
    '[style.--shape-y]':         'shapeCss().y',
    '[style.--shape-radius]':   'shapeCss().borderRadius',
    '[style.--shape-opacity]':  'shapeCss().opacity',
    // CSS vars para la forma orgánica del banner tribute-section (independiente).
    '[style.--tribute-rotation]': 'tributeShapeCss().rotation',
    '[style.--tribute-x]':        'tributeShapeCss().x',
    '[style.--tribute-y]':        'tributeShapeCss().y',
    '[style.--tribute-size]':     'tributeShapeCss().size',
    '[style.--tribute-radius]':   'tributeShapeCss().borderRadius',
    '[style.--tribute-opacity]':  'tributeShapeCss().opacity',
  },
})
export class Nosotros implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);

  /** Plantilla activa en formato "<territorio>-<variante>". */
  readonly activeTemplate = signal<FooterTemplate>('');

  /** Paleta de la plantilla activa (null = usa defaults globales). */
  readonly activePalette = signal<Palette | null>(null);

  /** Tipo de header aplicado: 'tradicional' o 'desplegable'. */
  readonly menuType = signal<MenuType>('tradicional');

  /** Estado de la forma orgánica (controlado por el FAB). */
  readonly shape = signal<ShapeState>({ ...DEFAULT_SHAPE });

  /** Estado de la forma orgánica del banner tribute-section (independiente). */
  readonly tributeShape = signal<TributeShapeState>({ ...DEFAULT_TRIBUTE_SHAPE });

  /** Datos de las 3 flip cards de Nuestra Proyección (Misión, Visión, Política). */
  readonly projectionCards = signal<ProjectionCard[]>([
    {
      id: 'mision',
      title: 'Misión',
      backTitle: 'Misión',
      description:
        'En SERFUNCOOP exaltamos la vida enfocados en la previsión integral, brindamos homenajes enmarcados en el respeto de la dignidad humana; siendo innovadores y garantizando la creación de valor para nuestros grupos de interés.',
      image: '/img/wp-migrated/nosotros/mision.webp',
      ariaLabel: 'Misión — toca para ver más',
    },
    {
      id: 'vision',
      title: 'Visión',
      backTitle: 'Visión',
      description:
        'Ser reconocidos por el liderazgo en el apoyo integral a las familias en todos los momentos de su vida, a través de un modelo sostenible e innovador.',
      image: '/img/wp-migrated/nosotros/vision.webp',
      ariaLabel: 'Visión — toca para ver más',
    },
    {
      id: 'politica',
      subtitle: 'Política de',
      title: 'Calidad',
      backTitle: 'Política de calidad',
      description:
        'Ofrecemos soluciones innovadoras en previsión integral y servicios exequiales, generando confianza al proporcionar la experiencia en forma oportuna, buscando satisfacer las necesidades y expectativas de nuestros grupos de interés, cumpliendo los requisitos aplicables y enfocados en la mejora continua.',
      image: '/img/wp-migrated/nosotros/politica-calidad.webp',
      ariaLabel: 'Política de calidad — toca para ver más',
    },
  ]);

  onContactPhoneClick(): void {
    // Placeholder: cuando exista el popup de líneas, se enganchará aquí.
    // Por ahora solo emite el evento de GTM para tracking.
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/nosotros' });
  }

  /** Valores de la forma listos para CSS (con unidades). */
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

  /** Valores de la forma del tribute listos para CSS (con unidades). */
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

  readonly territoryAttr = computed(() => {
    const value = this.activeTemplate();
    if (!value) return null;
    const idx = value.indexOf('-');
    return idx === -1 ? value : value.slice(0, idx);
  });

  readonly templateAttr = computed(() => {
    const value = this.activeTemplate();
    if (!value) return null;
    const idx = value.indexOf('-');
    return idx === -1 ? null : value.slice(idx + 1);
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
  }

  ngOnInit(): void {
    this.title.setTitle('Nosotros - Los Olivos Tolima — Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content:
        'SERFUNCOOP Los Olivos presta un servicio exequial personalizado, ágil, oportuno, humano y amable, con asesoría de personal competente en el Tolima.',
    });
    this.gtm.trackPageView('/nosotros');
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
