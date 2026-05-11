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

const STORAGE_KEY = 'servicio-funerario-fab-prefs';

/** Plantilla por defecto según mapeo de migración (Duelo · Clásico). */
const DEFAULT_TEMPLATE: FooterTemplate = 'duelo-clasico';

/** Paleta `duelo-clasico` corregida según manual de marca: el territorio
 *  DUELO usa teales, malvas y rosas/borgoñas — el naranja `#F0A33D` que
 *  TERRITORY_GROUPS asigna por defecto al cta es de Previsión/Vida (ver
 *  `.claude/skills/manual-de-marca/SKILL.md`). Aquí el cta usa el accent
 *  oficial `#A94D69` (Pantone 2343 C rosa/malva). */
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

/** Etapa del homenaje (4 protocolos del servicio funerario). */
interface ProtocolStage {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  description: string;
  services: string[];
  image: string;
}

/** Sala de velación virtual con stream URL. */
interface VirtualRoom {
  id: string;
  label: string;
  streamUrl: string;
}

@Component({
  selector: 'app-servicio-funerario',
  imports: [HeaderPageSection, ContentFooter, PaletteFab, ProgressBar, TributeSection],
  templateUrl: './servicio-funerario.html',
  styleUrl: './servicio-funerario.scss',
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
export class ServicioFunerario implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);

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

  /** 4 etapas del homenaje · combina narrativa (homenaje-al-amor) +
   *  servicios concretos (servicio-funerario). */
  readonly stages = signal<ProtocolStage[]>([
    {
      id: 'desprendimiento',
      number: '01',
      name: 'Desprendimiento',
      subtitle: 'En el deceso',
      description:
        'Es el punto de partida del homenaje: creamos las condiciones para que la familia pueda entregar a su ser querido fallecido en nuestras manos. Acompañamos cada decisión y trámite con la calma que el momento requiere.',
      services: [
        'Atención y orientación telefónica y/o presencial para el reporte de fallecidos.',
        'Traslado local del fallecido para su preservación y presentación.',
        'Traslado del fallecido a nivel nacional.',
        'Impuestos y diligencias legales y notariales.',
        'Preservación y presentación del ser querido fallecido.',
        'Suministro de cofre.',
      ],
      image: '/img/wp-migrated/servicio-funerario/etapa-desprendimiento.webp',
    },
    {
      id: 'encuentro',
      number: '02',
      name: 'Encuentro y Entronización',
      subtitle: 'Durante el cortejo y la velación',
      description:
        'En la sala de homenajes iniciamos el acompañamiento personalizado, definiendo los elementos que reflejarán el amor de la familia hacia su ser querido. Apoyamos rituales, oraciones y exaltaciones para construir un recuerdo memorable.',
      services: [
        'Sala de velación (24 horas)*.',
        'Ofrenda floral, carteles y cinta personalizada para la carroza.',
        'Kit recordatorio: libro de oraciones, denario, registro de asistencia y tarjetas de agradecimiento.',
        'Servicio de cafetería (tinto, aromática y agua) o kit de cafetería.',
        'Celebración religiosa en iglesia local.',
        'Transporte urbano para acompañantes (25 personas)**.',
        'Traslado del fallecido en carroza fúnebre a exequias y campo santo.',
      ],
      image: '/img/wp-migrated/servicio-funerario/etapa-encuentro.webp',
    },
    {
      id: 'destino-final',
      number: '03',
      name: 'Destino Final',
      subtitle: 'Despedida',
      description:
        'Acompañamos a la familia y allegados en la disposición final del ser querido durante el cortejo fúnebre hasta el campo santo. Cada etapa se realiza con la dignidad y respeto que el momento amerita.',
      services: [
        'Inhumación en bóveda.',
        'Cremación.',
      ],
      image: '/img/wp-migrated/servicio-funerario/etapa-despedida.webp',
    },
    {
      id: 'renacimiento',
      number: '04',
      name: 'Renacimiento',
      subtitle: 'Postexequiales',
      description:
        'Ceremonias póstumas y talleres de apoyo emocional que permiten a la familia continuar honrando la memoria de su ser querido, mientras retoma y recupera la normalidad de su vida.',
      services: [
        'Ceremonia de entrega de cenizas.',
        'Celebraciones especiales y conmemoraciones.',
        'Taller para manejo del duelo.',
      ],
      image: '/img/wp-migrated/servicio-funerario/etapa-renacimiento.webp',
    },
  ]);

  /** Etapa actualmente seleccionada (índice 0..3). */
  readonly selectedStageIndex = signal(0);

  readonly selectedStage = computed(() => this.stages()[this.selectedStageIndex()]);

  /** Salas de velación virtual disponibles. */
  readonly virtualRooms = signal<VirtualRoom[]>([
    { id: 'sala-e', label: 'Sala E', streamUrl: 'http://190.107.23.122:9902/' },
    { id: 'sala-f', label: 'Sala F', streamUrl: 'http://190.107.23.122:9900/' },
    { id: 'sala-g', label: 'Sala G', streamUrl: 'http://190.107.23.122:9901/' },
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
    this.title.setTitle('Servicio funerario — Los Olivos Tolima · Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content:
        'Un homenaje al amor, más que una despedida: las 4 etapas del servicio funerario de Los Olivos en Ibagué — desprendimiento, encuentro, destino final y renacimiento — con velación virtual incluida.',
    });
    this.gtm.trackPageView('/servicio-funerario');
  }

  selectStage(index: number): void {
    if (index < 0 || index >= this.stages().length) return;
    this.selectedStageIndex.set(index);
    this.gtm.push({
      event: 'stage_select',
      stage: this.stages()[index].id,
      page: '/servicio-funerario',
    });
  }

  onRoomClick(roomId: string): void {
    this.gtm.push({
      event: 'virtual_room_click',
      room: roomId,
      page: '/servicio-funerario',
    });
  }

  onContactPhoneClick(): void {
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/servicio-funerario' });
  }

  onCoordinarHomenajeClick(): void {
    this.gtm.push({
      event: 'phone_click',
      destination: '6082771001',
      cta: 'coordinar_homenaje',
      page: '/servicio-funerario',
    });
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
