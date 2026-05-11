import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
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

const STORAGE_KEY = 'microseguros-fab-prefs';

interface StoredPrefs {
  template: FooterTemplate;
  palette: Palette | null;
  menuType: MenuType;
  shape: ShapeState;
  tributeShape: TributeShapeState;
}

/** Producto de microseguro o paquete. */
interface InsuranceProduct {
  id: string;
  /** Etiqueta corta encima del título (eyebrow), opcional. */
  eyebrow?: string;
  /** Título principal del producto. */
  title: string;
  /** Descripción HTML-safe (texto plano por seguridad). */
  description: string;
  /** Énfasis opcional debajo de la descripción (cursiva o resaltado). */
  highlight?: string;
  /** Lista numerada de coberturas (opcional). */
  coverages?: string[];
  /** Sub-productos del paquete Sinergia (opcional). */
  variants?: { name: string; description: string }[];
  /** Imagen ilustrativa local (opcional). */
  image?: string;
  /** Icono FontAwesome cuando no hay imagen. */
  icon?: string;
}

@Component({
  selector: 'app-microseguros',
  imports: [HeaderPageSection, ContentFooter, PaletteFab, ProgressBar, TributeSection],
  templateUrl: './microseguros.html',
  styleUrl: './microseguros.scss',
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
export class Microseguros implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);

  readonly activeTemplate = signal<FooterTemplate>('');
  readonly activePalette = signal<Palette | null>(null);
  readonly menuType = signal<MenuType>('tradicional');
  readonly shape = signal<ShapeState>({ ...DEFAULT_SHAPE });
  readonly tributeShape = signal<TributeShapeState>({ ...DEFAULT_TRIBUTE_SHAPE });

  // Default territorial: prevision (per mapeo del plan; coral es la plantilla
  // sugerida pero el usuario puede cambiarla con el FAB).
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

  /** 5 productos/paquetes de microseguros (orden visual). */
  readonly products = signal<InsuranceProduct[]>([
    {
      id: 'solicanasta',
      eyebrow: 'Seguro de vida',
      title: 'Solicanasta Familiar',
      description:
        'Seguro extensivo de los amparos del Seguro de vida Solicanasta a todos los integrantes del grupo familiar protegido en el Plan de Previsión Exequial, de acuerdo al estado civil del titular.',
      highlight: 'Cónyuge + padres + hijos o hermanos.',
      image: '/img/wp-migrated/microseguros/microseguros-02.webp',
    },
    {
      id: 'ap-auxilio-educativo',
      eyebrow: 'Accidentes personales',
      title: 'AP con Auxilio Educativo',
      description:
        'Seguro de accidentes personales que otorga amparo al titular de nuestro plan de previsión exequial a causa de su muerte accidental, reconociendo a sus beneficiarios el valor asegurado en el contrato que puede estar entre $1 y $10.000.000. Adicionalmente se reconocerá una suma mensual hasta 10 meses, destinada al pago de la pensión escolar de hasta tres hijos, hasta que finalice su año lectivo en que sucedió el deceso.',
      highlight:
        '*Para educación superior y en los casos de instituciones educativas donde los alumnos sean exentos de pago de pensión, se reconocerá una suma fija y por una sola vez durante la vigencia de la póliza.',
      icon: 'fa-solid fa-graduation-cap',
    },
    {
      id: 'solienvida-sos',
      eyebrow: 'Servicio Oportuno Seguro',
      title: 'Solienvida S.O.S.',
      description:
        'Un completo grupo de amparos que le permiten al titular del plan contar con cobertura en caso de:',
      coverages: [
        'Muerte accidental.',
        'Auxilio por muerte.',
        'Renta por hospitalización a causa de accidente.',
        'Auxilio de enfermedades graves.',
        'Auxilio de desempleo (permanencia en el plan exequial).',
        'Asistencia al hogar Olivos, gratuita.',
      ],
      image: '/img/wp-migrated/microseguros/microseguros-03.webp',
    },
    {
      id: 'sinergia',
      eyebrow: 'Paquetes combinados',
      title: 'Sinergia',
      description:
        'Este paquete de seguros ofrece amparos complementarios entre sí, haciendo mucho más robusta la protección para su familia. Los paquetes SINERGIA cuentan con asistencias gratuitas para disfrutar en vida.',
      variants: [
        {
          name: 'SOLIRENTA',
          description:
            'Canasta + renta por hospitalización + asistencia al hogar gratuita. Cuenta con las mismas coberturas del Seguro Solicanasta y adicionalmente indemniza al titular del plan con las sumas estipuladas en el contrato, si como consecuencia de una enfermedad o accidente se presenta hospitalización en habitación, ingreso a UCI o cirugía ambulatoria.',
        },
        {
          name: 'SOLIACCIDENTES',
          description:
            'Canasta + muerte accidental + asistencia al hogar gratuita. Otorga una doble protección, amparando al asegurado a causa de cualquier tipo de fallecimiento: muerte natural, homicidio, suicidio, muerte accidental, invalidez o desmembración a causa de esta última y por incapacidad total y permanente.',
        },
        {
          name: 'SOLINTEGRAL',
          description:
            'Canasta + renta hospitalaria + muerte accidental + asistencia al hogar gratuita.',
        },
      ],
      icon: 'fa-solid fa-layer-group',
    },
    {
      id: 'solihogar',
      eyebrow: 'Patrimonio',
      title: 'Solihogar Seguro',
      description:
        'Seguro que protege los bienes del hogar del afiliado frente a las pérdidas provenientes de los eventos amparados como terremotos, incendios, temblores entre otros, ocurridos en el inmueble de nuestro asegurado protegido.',
      icon: 'fa-solid fa-house-chimney-window',
    },
  ]);

  /** Asistencias al hogar (servicios incluidos con los microseguros). */
  readonly homeAssistance = signal<{ icon: string; text: string }[]>([
    { icon: 'fa-solid fa-window-restore',     text: 'Vidriería' },
    { icon: 'fa-solid fa-key',                text: 'Cerrajería' },
    { icon: 'fa-solid fa-bolt',               text: 'Electricidad' },
    { icon: 'fa-solid fa-house-circle-check', text: 'Inhabitabilidad de vivienda: gastos de hotel, mudanza, depósito y custodia de bienes.' },
    { icon: 'fa-solid fa-user-shield',        text: 'Vigilante sustituto' },
    { icon: 'fa-solid fa-pen-ruler',          text: 'Coordinación de remodelación con arquitectos y decoradores.' },
    { icon: 'fa-solid fa-credit-card',        text: 'Posibilidad de financiación.' },
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
    this.title.setTitle('Microseguros — Los Olivos Tolima · Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content:
        'Microseguros y asistencias que complementan el Plan de Previsión Exequial. Protección Familiar Integral respaldada por Aseguradora Solidaria de Colombia.',
    });
    this.gtm.trackPageView('/microseguros');
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
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/microseguros' });
  }

  onPartnerClick(): void {
    this.gtm.push({
      event: 'partner_click',
      partner: 'aseguradora_solidaria',
      page: '/microseguros',
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
