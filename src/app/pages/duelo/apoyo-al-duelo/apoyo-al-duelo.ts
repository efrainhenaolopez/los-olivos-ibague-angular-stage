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

const STORAGE_KEY = 'apoyo-al-duelo-fab-prefs';

/** Plantilla por defecto según mapeo de migración (Duelo · Elegante). */
const DEFAULT_TEMPLATE: FooterTemplate = 'duelo-elegante';

/** Paleta `duelo-elegante` — replica exacta de TERRITORY_GROUPS en
 *  palette-fab.ts. Aplicada de entrada para evitar caer en los defaults
 *  globales de `[data-territory="duelo"]` (naranja CTA, propio de
 *  Previsión/Vida). El FAB puede sobrescribirla en vivo. */
const DEFAULT_PALETTE: Palette = {
  primary: '#2c2e35',
  secondary: '#4a4d57',
  accent: '#ff7a8a',
  cta: '#5a9080',
  ctaStrong: '#437366',
  bgSoft: '#f5f5f5',
  onPrimary: '#ffffff',
  gradientFrom: '#2c2e35',
  gradientTo: '#7fb8a8',
};

interface StoredPrefs {
  template: FooterTemplate;
  palette: Palette | null;
  menuType: MenuType;
  shape: ShapeState;
  tributeShape: TributeShapeState;
}

interface WorkshopBenefit {
  icon: string;
  text: string;
}

interface WorkshopMode {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  ctaLabel: string;
}

@Component({
  selector: 'app-apoyo-al-duelo',
  imports: [RouterLink, HeaderPageSection, ContentFooter, PaletteFab, ProgressBar, TributeSection],
  templateUrl: './apoyo-al-duelo.html',
  styleUrl: './apoyo-al-duelo.scss',
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
export class ApoyoAlDuelo implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);

  readonly activeTemplate = signal<FooterTemplate>(DEFAULT_TEMPLATE);
  readonly activePalette = signal<Palette | null>(DEFAULT_PALETTE);
  readonly menuType = signal<MenuType>('tradicional');
  readonly shape = signal<ShapeState>({ ...DEFAULT_SHAPE });
  readonly tributeShape = signal<TributeShapeState>({ ...DEFAULT_TRIBUTE_SHAPE });

  // Territorio por defecto: duelo (plantilla sugerida `duelo-elegante`,
  // ajustable desde el FAB).
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

  /** Beneficios del taller (orden visual). */
  readonly benefits = signal<WorkshopBenefit[]>([
    {
      icon: 'fa-solid fa-circle-check',
      text:
        'Aprender a interpretar y manejar los sentimientos experimentados luego de la pérdida de un ser querido.',
    },
    {
      icon: 'fa-solid fa-circle-check',
      text:
        'Recibir ayuda a través de ejercicios planteados para dar el primer paso hacia la sanación en el proceso de duelo.',
    },
    {
      icon: 'fa-solid fa-circle-check',
      text:
        'Aprender diferentes herramientas que permitan evolucionar con el proceso desde casa o en el lugar de trabajo.',
    },
    {
      icon: 'fa-solid fa-circle-check',
      text:
        'Compartir las experiencias personales durante este proceso con otras personas que están en la misma situación.',
    },
  ]);

  /** Modalidades del taller (individual / empresarial). */
  readonly workshops = signal<WorkshopMode[]>([
    {
      id: 'individual',
      eyebrow: 'Beneficio exclusivo para afiliados y clientes',
      title: 'Taller Individual',
      description:
        'Acompañamiento grupal guiado por nuestro equipo psicológico, dirigido a familias y personas que están atravesando la pérdida de un ser querido. Encontrarás ejercicios, herramientas y un espacio seguro para compartir tu proceso.',
      ctaLabel: 'Quiero más información',
    },
    {
      id: 'empresarial',
      eyebrow: 'Apoyo al duelo · Empresas',
      title: 'Taller Empresarial',
      description:
        'A través de una reunión virtual con un pequeño grupo de personas y bajo el direccionamiento de un psicólogo, cada participante podrá —en la medida de sus necesidades— intercambiar sus experiencias personales y aprender herramientas que le permitan superar el dolor por el que está atravesando por la pérdida de su ser querido y rehacer su entorno social y familiar.',
      image: '/img/wp-migrated/apoyo-al-duelo/taller-empresarial.webp',
      ctaLabel: 'Solicita más información',
    },
  ]);

  /** Versos del bloque "El llanto en el Duelo". */
  readonly llantoLines = signal<string[]>([
    'Las lágrimas son un alivio para el cuerpo, una caricia para el alma que sufre.',
    'Son el desahogo de esa tristeza profunda que nos invade.',
    'El llanto es liberador.',
    'Mis lágrimas son la forma en la que expreso mi estado emocional actual.',
    'Estoy en duelo, estoy triste, me permito llorar.',
    'Si contengo la tristeza, si no lloro cuando tengo muchas ganas de hacerlo, mi duelo se puede complicar.',
    'Llorar es parte de mi proceso.',
    'Lloro porque te extraño y te amo.',
    'Comparto mi dolor, no lo contengo. Me ocupo de él.',
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
    this.title.setTitle('Apoyo al duelo — Los Olivos Tolima · Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content:
        'Talleres de apoyo al duelo en Ibagué: acompañamiento individual y empresarial para superar la pérdida de un ser querido. Beneficio exclusivo para afiliados y clientes de Serfuncoop Los Olivos.',
    });
    this.gtm.trackPageView('/apoyo-al-duelo');
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

  onWorkshopCtaClick(id: string): void {
    this.gtm.push({
      event: 'workshop_cta_click',
      workshop: id,
      page: '/apoyo-al-duelo',
    });
  }

  onContactPhoneClick(): void {
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/apoyo-al-duelo' });
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
