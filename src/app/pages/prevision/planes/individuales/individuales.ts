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

const STORAGE_KEY = 'planes-individuales-fab-prefs';

interface StoredPrefs {
  template: FooterTemplate;
  palette: Palette | null;
  menuType: MenuType;
  shape: ShapeState;
  tributeShape: TributeShapeState;
}

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

interface MaritalPlan {
  id: 'solteros' | 'casados';
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-individuales',
  imports: [
    RouterLink,
    HeaderPageSection,
    ContentFooter,
    PaletteFab,
    ProgressBar,
    TributeSection,
  ],
  templateUrl: './individuales.html',
  styleUrl: './individuales.scss',
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
export class Individuales implements OnInit {
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

  readonly benefits = signal<Benefit[]>([
    {
      icon: 'fa-solid fa-circle-check',
      title: 'Prestación sin restricción',
      description: 'Prestación del servicio sin restricción por enfermedades preexistentes.',
    },
    {
      icon: 'fa-solid fa-map-location-dot',
      title: 'Cobertura nacional',
      description: 'Cobertura del servicio a nivel nacional a través de la Red Los Olivos.',
    },
    {
      icon: 'fa-solid fa-medal',
      title: 'Conocimiento y experiencia',
      description:
        'Más de 32 años de trabajo continuo en el sector funerario, con profundo conocimiento de la región.',
    },
    {
      icon: 'fa-solid fa-certificate',
      title: 'Alta calidad ISO 9001:2015',
      description:
        'Servicios certificados por Icontec desde 2005, con altos estándares de calidad en cada homenaje.',
    },
  ]);

  readonly maritalPlans = signal<MaritalPlan[]>([
    {
      id: 'solteros',
      title: 'Plan para solteros',
      description:
        'Cobertura para padres y hermanos, con la posibilidad de ingresar hijos, nietos, abuelos, sobrinos, tíos, primos, nueras, yernos, cuñados, padrastros, hijastros, hermanastros, ex cónyuge y ahijados bajo la figura de adicionales.',
      image: '/img/wp-migrated/planes-individuales/ind-04.webp',
    },
    {
      id: 'casados',
      title: 'Plan para casados o en unión',
      description:
        'Cobertura para cónyuge, padres, hijos y suegros, con la posibilidad de ingresar hermanos, nietos, abuelos, sobrinos, tíos, primos, nueras, yernos, cuñados, padrastros, hijastros, hermanastros, ex cónyuge y ahijados bajo la figura de adicionales.',
      image: '/img/wp-migrated/planes-individuales/ind-05.webp',
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
    this.title.setTitle('Planes Individuales de Previsión Exequial — Los Olivos Tolima');
    this.meta.updateTag({
      name: 'description',
      content:
        'Planes individuales de previsión exequial diseñados para las familias del Tolima. Cobertura sin restricciones, ámbito nacional y respaldo de 32 años de experiencia.',
    });
    this.gtm.trackPageView('/planes-individuales');
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
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/planes-individuales' });
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
