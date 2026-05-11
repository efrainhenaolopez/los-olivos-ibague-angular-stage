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

const STORAGE_KEY = 'sedes-fab-prefs';

const DEFAULT_TEMPLATE: FooterTemplate = 'duelo-clasico';

/** Paleta `duelo-clasico` corregida por manual de marca (cta accent rosa/malva,
 *  no el naranja de Previsión/Vida). */
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

interface SedeHours {
  label: string;
  value: string;
}

interface Sede {
  id: string;
  name: string;
  city: string;
  address: string;
  mapUrl?: string;
  phones: string[];
  email?: string;
  hours: SedeHours[];
  services: string[];
  image?: string;
  inactive?: boolean;
}

@Component({
  selector: 'app-listado',
  imports: [HeaderPageSection, ContentFooter, PaletteFab, ProgressBar, TributeSection],
  templateUrl: './listado.html',
  styleUrl: './listado.scss',
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
export class Listado implements OnInit {
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

  /** Las 10 sedes de Los Olivos Tolima. Normalizaciones aplicadas:
   *  - Espinal: rango "7:00 pm a 6:00 pm" corregido a "2:00 pm a 6:00 pm".
   *  - Girardot: "No°" normalizado a "N°".
   *  - Parque Cementerio: rango inconsistente reducido al primero. */
  readonly sedes = signal<Sede[]>([
    {
      id: 'cra-5ta',
      name: 'Sede de homenajes Cra 5ta',
      city: 'Ibagué',
      address: 'Carrera 5 con Calle 39 esquina',
      mapUrl: 'https://www.google.com/maps/place/Los+olivos/@4.4364697,-75.2145762,20.25z',
      phones: ['(608) 277 1001 ext 1100', '(608) 265 0742'],
      email: 'atencioncra5@losolivos.com.co',
      hours: [
        { label: 'Atención administrativa', value: 'Domingo a domingo · 7:00 am - 7:00 pm' },
        { label: 'Horario para velaciones', value: 'Domingo a domingo · 7:00 am - 9:00 pm' },
      ],
      services: [
        'Salas de homenajes',
        'Coordinación de homenajes',
        'Ascensor',
        'Oratorios',
        'Cafetería autoservicio',
        'Velación virtual',
        'Entrega de cenizas',
      ],
      image: '/img/wp-migrated/sedes/ibague-cra5ta.webp',
    },
    {
      id: 'cadiz',
      name: 'Sede de homenajes Cádiz',
      city: 'Ibagué',
      address: 'Carrera 4 A N° 33 – 185, Barrio Cádiz',
      mapUrl: 'https://www.google.com/maps/place/Serfuncoop+Los+Olivos+Sede+C%C3%A1diz/@4.4354658,-75.2216377,17z',
      phones: ['(608) 277 1001 ext 1500', '(608) 264 8900'],
      email: 'atencioncadiz@losolivos.com.co',
      hours: [
        { label: 'Atención administrativa', value: 'Domingo a domingo · 7:00 am - 7:00 pm' },
        { label: 'Horario para velaciones', value: 'Domingo a domingo · 7:00 am - 9:00 pm' },
      ],
      services: [
        'Salas de homenajes',
        'Coordinación de homenajes',
        'Cafetería autoservicio',
        'Pago de homenajes',
      ],
      image: '/img/wp-migrated/sedes/ibague-cadiz.webp',
    },
    {
      id: 'parque-cementerio',
      name: 'Parque Cementerio',
      city: 'Ibagué',
      address: 'Km 13 vía Picaleña',
      mapUrl: 'https://www.google.com/maps/place/Parque+Cementerio+Los+Olivos/@4.3583723,-75.1120337,17z',
      phones: ['(608) 277 1001 ext 1400', '(608) 269 5882'],
      email: 'atencionparque@losolivos.com.co',
      hours: [
        { label: 'Atención administrativa', value: 'Domingo a domingo · 9:00 am - 5:00 pm' },
        { label: 'Horario de visitas', value: 'Domingo a domingo · 9:00 am - 5:00 pm' },
      ],
      services: [
        'Trámites administrativos del Parque',
        'Pago de productos y servicios del Parque',
        'Entrega de cenizas',
      ],
      image: '/img/wp-migrated/sedes/parque-cementerio.webp',
    },
    {
      id: 'oficina-afiliaciones',
      name: 'Oficina de afiliaciones',
      city: 'Ibagué',
      address: 'Carrera 5 con Calle 39 esquina',
      phones: ['(608) 277 1001 ext 1015'],
      email: 'afiliaciones@losolivos.com.co',
      hours: [
        { label: 'Lunes a viernes', value: '8:00 am - 12:00 m · 2:00 pm - 5:30 pm' },
        { label: 'Sábados', value: '9:00 am - 2:00 pm (jornada continua)' },
      ],
      services: [
        'Asesoría y afiliación a planes de previsión',
        'Atención de afiliados',
        'Renovación de contratos de afiliación',
        'Servicios de caja (homenajes, planes, entre otros)',
      ],
    },
    {
      id: 'cae',
      name: 'CAE — Centro de Atención al Enlutado',
      city: 'Ibagué',
      address: 'Zona El Papayo, a un costado de la oficina de Medicina Legal',
      phones: ['(608) 277 1001'],
      email: 'caeibague@losolivos.com.co',
      hours: [
        { label: 'Lunes a viernes', value: '9:00 am - 5:00 pm (jornada continua)' },
        { label: 'Sábados', value: '9:00 am - 3:00 pm (jornada continua)' },
      ],
      services: [
        'Asesoría a familias para retiro de seres queridos de Medicina Legal',
        'Asesoría para exhumación y cremación en el Parque Cementerio',
      ],
    },
    {
      id: 'sede-administrativa',
      name: 'Sede Administrativa',
      city: 'Ibagué',
      address: 'Carrera 4i N° 41-64, Barrio La Macarena',
      mapUrl: 'https://www.google.com/maps/place/Cra.+4i+%2341-64,+Ibagu%C3%A9,+Tolima/@4.4350639,-75.2137533,19z',
      phones: ['(608) 277 1001 ext 1000', '(608) 264 1320'],
      email: 'servicioalcliente@losolivos.com.co',
      hours: [
        { label: 'Lunes a viernes', value: '8:00 am - 12:00 m · 2:00 pm - 6:00 pm' },
      ],
      services: ['Radicación de documentación'],
    },
    {
      id: 'espinal',
      name: 'Sede de homenajes El Espinal',
      city: 'Espinal',
      address: 'Carrera 9 N° 6 - 84',
      mapUrl: 'https://www.google.com/maps/place/Funeraria+Los+Olivos/@4.1488186,-74.8816122,18.5z',
      phones: ['(608) 277 1001 ext 1300', '(608) 248 0310'],
      email: 'atencionespinal@losolivos.com.co',
      hours: [
        { label: 'Atención administrativa', value: 'Lunes a sábado · 8:00 am - 12:00 m · 2:00 pm - 6:00 pm' },
        { label: 'Horario para velaciones', value: 'Domingo a domingo · 7:00 am - 9:00 pm' },
      ],
      services: [
        'Salas de homenajes',
        'Coordinación de homenajes',
        'Cafetería autoservicio',
        'Pago de homenajes',
        'Asesoría y afiliación a planes de previsión',
      ],
      image: '/img/wp-migrated/sedes/espinal.webp',
    },
    {
      id: 'girardot',
      name: 'Sede de homenajes Girardot',
      city: 'Girardot',
      address: 'Carrera 9 N° 17 - 34',
      mapUrl: 'https://www.google.com/maps/place/Funeraria+Los+Olivos/@4.2957591,-74.8049431,20z',
      phones: ['(601) 888 6 888', '(608) 277 1001 ext 1200'],
      email: 'atenciongirardot@losolivos.com.co',
      hours: [
        { label: 'Atención administrativa', value: 'Lunes a sábado · 8:00 am - 12:00 m · 2:00 pm - 6:00 pm' },
        { label: 'Horario para velaciones', value: 'Domingo a domingo · 7:00 am - 9:00 pm' },
      ],
      services: [
        'Salas de homenajes',
        'Coordinación de homenajes',
        'Cafetería autoservicio',
        'Pago de homenajes',
        'Asesoría y afiliación a planes de previsión',
      ],
      image: '/img/wp-migrated/sedes/girardot.webp',
    },
    {
      id: 'fresno',
      name: 'Oficina Fresno',
      city: 'Fresno',
      address: 'Carrera 5 N° 3 - 49 local 7 — Hotel Andino',
      phones: ['315 266 1367'],
      email: 'atencioncra5@losolivos.com.co',
      hours: [
        { label: 'Atención presencial', value: 'No se presta atención presencial por el momento' },
      ],
      services: [
        'Asesoría y afiliación a planes de previsión',
        'Atención de afiliados',
        'Renovación de contratos de afiliación',
        'Recaudo de pagos de planes de previsión',
      ],
    },
    {
      id: 'venadillo',
      name: 'Sede Venadillo',
      city: 'Venadillo',
      address: 'Calle 3 N° 3 - 76, Barrio Caracoli',
      phones: ['Pendiente'],
      email: 'atencioncra5@losolivos.com.co',
      hours: [
        { label: 'Atención presencial', value: 'No se presta atención presencial por el momento' },
      ],
      services: ['Sede sin servicio por el momento'],
      inactive: true,
    },
  ]);

  /** Sentinela del filtro "Todas" (muestra todas las sedes sin filtrar). */
  readonly ALL_CITIES = 'Todas';

  /** Cuántas sedes muestra cada página del slider. */
  readonly PAGE_SIZE = 3;

  /** Ciudad seleccionada en el filtro. Por defecto: Todas. */
  readonly selectedCity = signal<string>(this.ALL_CITIES);

  /** Página actual del slider (0-indexed). Se resetea al cambiar de ciudad. */
  readonly currentPage = signal<number>(0);

  /** Lista de ciudades con "Todas" primero, luego Ibagué (sede principal),
   *  y después el resto en el orden en que aparecen las sedes. */
  readonly cities = computed<string[]>(() => {
    const ordered: string[] = [this.ALL_CITIES];
    const remaining: string[] = [];
    for (const sede of this.sedes()) {
      if (sede.city === 'Ibagué' && !ordered.includes('Ibagué')) {
        ordered.push('Ibagué');
      } else if (sede.city !== 'Ibagué' && !remaining.includes(sede.city)) {
        remaining.push(sede.city);
      }
    }
    return [...ordered, ...remaining];
  });

  /** Sedes filtradas por la ciudad seleccionada (o todas si está "Todas"). */
  readonly filteredSedes = computed(() => {
    const city = this.selectedCity();
    if (city === this.ALL_CITIES) return this.sedes();
    return this.sedes().filter((s) => s.city === city);
  });

  /** Sedes agrupadas en páginas de tamaño PAGE_SIZE (chunks). */
  readonly pages = computed<Sede[][]>(() => {
    const all = this.filteredSedes();
    const result: Sede[][] = [];
    for (let i = 0; i < all.length; i += this.PAGE_SIZE) {
      result.push(all.slice(i, i + this.PAGE_SIZE));
    }
    return result;
  });

  /** Total de páginas del slider. */
  readonly totalPages = computed<number>(() => this.pages().length);

  /** Transform CSS para deslizar la pista del slider. */
  readonly trackTransform = computed<string>(
    () => `translateX(-${this.currentPage() * 100}%)`,
  );

  /** Mostrar controles solo cuando hay más de 1 página. */
  readonly showSliderControls = computed<boolean>(() => this.totalPages() > 1);

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
    this.title.setTitle('Sedes Funerarias — Los Olivos Tolima · Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content:
        'Encuentra la ubicación, teléfonos, horarios y servicios de las sedes funerarias de Los Olivos en Ibagué, El Espinal, Girardot, Fresno y Venadillo.',
    });
    this.gtm.trackPageView('/sedes');
  }

  selectCity(city: string): void {
    this.selectedCity.set(city);
    this.currentPage.set(0);
    this.gtm.push({ event: 'sede_city_select', city, page: '/sedes' });
  }

  nextPage(): void {
    const total = this.totalPages();
    if (total <= 1) return;
    this.currentPage.update((p) => (p + 1) % total);
    this.gtm.push({
      event: 'sede_slider_advance',
      direction: 'next',
      page_index: this.currentPage(),
      city: this.selectedCity(),
      page: '/sedes',
    });
  }

  prevPage(): void {
    const total = this.totalPages();
    if (total <= 1) return;
    this.currentPage.update((p) => (p - 1 + total) % total);
    this.gtm.push({
      event: 'sede_slider_advance',
      direction: 'prev',
      page_index: this.currentPage(),
      city: this.selectedCity(),
      page: '/sedes',
    });
  }

  goToPage(index: number): void {
    const total = this.totalPages();
    if (index < 0 || index >= total || index === this.currentPage()) return;
    this.currentPage.set(index);
    this.gtm.push({
      event: 'sede_slider_dot',
      page_index: index,
      city: this.selectedCity(),
      page: '/sedes',
    });
  }

  onMapClick(sedeId: string): void {
    this.gtm.push({ event: 'sede_map_click', sede: sedeId, page: '/sedes' });
  }

  onPhoneClick(sedeId: string, phone: string): void {
    this.gtm.push({ event: 'sede_phone_click', sede: sedeId, phone, page: '/sedes' });
  }

  onContactPhoneClick(): void {
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/sedes' });
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

  /** Convierte un número telefónico a formato tel: (sólo dígitos). */
  toTelHref(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits ? `tel:${digits}` : '#';
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
