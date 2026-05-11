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

const STORAGE_KEY = 'pagos-fab-prefs';

/** Plantilla por defecto: PREVISIÓN — la página de medios de pago es
 *  parte del territorio Previsión (planes de previsión exequial). */
const DEFAULT_TEMPLATE: FooterTemplate = 'prevision-coral';

/** Paleta Previsión según manual de marca (skill manual-de-marca):
 *  - primary `#DC4C5A` (Pantone 709 C, rosa coral)
 *  - secondary `#EB6E82` (rosa claro del mismo par)
 *  - accent `#8CE63C` (Pantone 2298 C, verde lima)
 *  - cta `#F0A33D` (Pantone 2008 C, naranja cálido — CTA oficial Previsión)
 *  - ctaStrong `#E65C36` (Pantone 1645 C, naranja intenso) */
const DEFAULT_PALETTE: Palette = {
  primary: '#DC4C5A',
  secondary: '#EB6E82',
  accent: '#8CE63C',
  cta: '#F0A33D',
  ctaStrong: '#E65C36',
  bgSoft: '#FFF2F4',
  onPrimary: '#ffffff',
  gradientFrom: '#EB6E82',
  gradientTo: '#DC4C5A',
  progressColor: '#8CE63C',
};

interface StoredPrefs {
  template: FooterTemplate;
  palette: Palette | null;
  menuType: MenuType;
  shape: ShapeState;
  tributeShape: TributeShapeState;
}

/** Detalle de un campo dentro de un canal (código, cuenta, referencia…). */
interface ChannelField {
  label: string;
  value: string;
}

/** Categoría del canal para el filtro segmentador. */
type ChannelCategory = 'online' | 'corresponsales' | 'bancos' | 'aliados';

/** Canal de pago. `external=true` => link con CTA; `external=false` =>
 *  card informativa con datos para consignar. */
interface PaymentChannel {
  id: string;
  category: ChannelCategory;
  logo: string;
  logoAlt: string;
  brand: string;
  title: string;
  description?: string;
  fields?: ChannelField[];
  maxAmount?: string;
  url?: string;
  ctaLabel?: string;
  external: boolean;
}

interface CategoryOption {
  id: 'todos' | ChannelCategory;
  label: string;
}

@Component({
  selector: 'app-pagos',
  imports: [HeaderPageSection, ContentFooter, PaletteFab, ProgressBar, TributeSection],
  templateUrl: './pagos.html',
  styleUrl: './pagos.scss',
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
export class Pagos implements OnInit {
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

  /** Email institucional para enviar soporte de pago. */
  readonly afiliacionesEmail = 'afiliaciones@losolivos.com.co';

  /** Sentinela del filtro "Todos" (muestra todos los canales). */
  readonly ALL_CATEGORIES = 'todos' as const;

  /** Cuántos canales muestra cada página del slider. */
  readonly PAGE_SIZE = 3;

  /** Lista plana de canales con campo `category` para el filtro. */
  readonly channels = signal<PaymentChannel[]>([
    {
      id: 'pse',
      category: 'online',
      logo: '/img/wp-migrated/pagos/logo-pse.svg',
      logoAlt: 'Logo PSE — Pagos Seguros en Línea',
      brand: 'PSE',
      title: 'Pagos PSE',
      description:
        'Paga tu cuota de afiliación o servicios directamente con tu cuenta bancaria a través del portal de PSE Scotiabank Colpatria.',
      url: 'https://www.banco.scotiabankcolpatria.com/PagosElectronicos/Referencias.aspx?IdConvenio=4376',
      ctaLabel: 'Pagar con PSE',
      external: true,
    },
    {
      id: 'credibanco',
      category: 'online',
      logo: '/img/wp-migrated/pagos/logo-credibanco.svg',
      logoAlt: 'Logo Credibanco — Pagos con tarjeta de crédito',
      brand: 'Credibanco',
      title: 'Tarjeta de crédito',
      description:
        'Realiza tu pago en línea con tarjeta de crédito a través de la pasarela Credibanco habilitada para Los Olivos.',
      url: 'https://ibague.losolivos.co/credibanco/',
      ctaLabel: 'Pagar con tarjeta de crédito',
      external: true,
    },
    {
      id: 'banco-bogota-corresponsal',
      category: 'corresponsales',
      logo: '/img/wp-migrated/pagos/logo-banco-bogota.jpg',
      logoAlt: 'Logo Banco de Bogotá',
      brand: 'Banco de Bogotá',
      title: 'Corresponsal Bancario',
      fields: [
        { label: 'Código NURA', value: '2207' },
        { label: 'Referencia', value: 'N° de C.C. del titular o NIT de la empresa' },
      ],
      external: false,
    },
    {
      id: 'bancolombia-corresponsal',
      category: 'corresponsales',
      logo: '/img/wp-migrated/pagos/logo-bancolombia.png',
      logoAlt: 'Logo Bancolombia',
      brand: 'Bancolombia',
      title: 'Corresponsal Bancario',
      fields: [
        { label: 'Código NURA', value: '76442' },
        { label: 'Referencia', value: 'N° de C.C. del titular o NIT de la empresa' },
      ],
      maxAmount: 'Pagos hasta $3.000.000',
      external: false,
    },
    {
      id: 'cuenta-banco-bogota',
      category: 'bancos',
      logo: '/img/wp-migrated/pagos/logo-banco-bogota.jpg',
      logoAlt: 'Logo Banco de Bogotá',
      brand: 'Banco de Bogotá',
      title: 'Cuenta de ahorros',
      fields: [
        { label: 'Cuenta de ahorros', value: '255025538' },
        { label: 'Formato', value: 'Pago universal individual' },
        { label: 'Referencia', value: 'N° de C.C. del titular o NIT de la empresa' },
      ],
      external: false,
    },
    {
      id: 'cuenta-colpatria',
      category: 'bancos',
      logo: '/img/wp-migrated/pagos/logo-colpatria.jpg',
      logoAlt: 'Logo Colpatria',
      brand: 'Colpatria',
      title: 'Cuenta de ahorros',
      fields: [
        { label: 'Cuenta de ahorros', value: '1652147824' },
        { label: 'Formato', value: 'Transacciones caja-depósito' },
        { label: 'Referencia', value: 'N° de C.C. del titular o NIT de la empresa' },
      ],
      external: false,
    },
    {
      id: 'gana',
      category: 'aliados',
      logo: '/img/wp-migrated/pagos/logo-gana.png',
      logoAlt: 'Logo Gana-Gana',
      brand: 'Gana-Gana',
      title: 'Puntos Gana-Gana',
      description: 'Habilitado como corresponsal bancario Banco de Bogotá.',
      fields: [
        { label: 'Código NURA', value: '2207' },
        { label: 'Referencia', value: 'N° de C.C. del titular o NIT de la empresa' },
      ],
      maxAmount: 'Pagos hasta $1.000.000',
      external: false,
    },
  ]);

  /** Categorías del filtro segmentador, en orden de aparición. */
  readonly categories: CategoryOption[] = [
    { id: 'todos',          label: 'Todos' },
    { id: 'online',         label: 'En línea' },
    { id: 'corresponsales', label: 'Corresponsales' },
    { id: 'bancos',         label: 'Bancos' },
    { id: 'aliados',        label: 'Aliados' },
  ];

  /** Categoría actualmente seleccionada (por defecto: Todos). */
  readonly selectedCategory = signal<'todos' | ChannelCategory>('todos');

  /** Página actual del slider (0-indexed). */
  readonly currentPage = signal<number>(0);

  /** Canales filtrados por la categoría seleccionada. */
  readonly filteredChannels = computed<PaymentChannel[]>(() => {
    const cat = this.selectedCategory();
    if (cat === 'todos') return this.channels();
    return this.channels().filter((c) => c.category === cat);
  });

  /** Canales agrupados en páginas de PAGE_SIZE. */
  readonly pages = computed<PaymentChannel[][]>(() => {
    const all = this.filteredChannels();
    const result: PaymentChannel[][] = [];
    for (let i = 0; i < all.length; i += this.PAGE_SIZE) {
      result.push(all.slice(i, i + this.PAGE_SIZE));
    }
    return result;
  });

  readonly totalPages = computed<number>(() => this.pages().length);

  readonly trackTransform = computed<string>(
    () => `translateX(-${this.currentPage() * 100}%)`,
  );

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
    this.title.setTitle('Medios de Pago — Los Olivos Tolima · Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content:
        'Paga tu cuota de previsión exequial y homenajes de Los Olivos en Ibagué: PSE, tarjeta de crédito (Credibanco), corresponsales bancarios, cuentas de ahorro y puntos Gana-Gana.',
    });
    this.gtm.trackPageView('/pagos');
  }

  onChannelClick(channelId: string): void {
    this.gtm.push({ event: 'payment_channel_click', channel: channelId, page: '/pagos' });
  }

  selectCategory(categoryId: 'todos' | ChannelCategory): void {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(0);
    this.gtm.push({
      event: 'payment_category_select',
      category: categoryId,
      page: '/pagos',
    });
  }

  nextPage(): void {
    const total = this.totalPages();
    if (total <= 1) return;
    this.currentPage.update((p) => (p + 1) % total);
    this.gtm.push({
      event: 'payment_slider_advance',
      direction: 'next',
      page_index: this.currentPage(),
      category: this.selectedCategory(),
      page: '/pagos',
    });
  }

  prevPage(): void {
    const total = this.totalPages();
    if (total <= 1) return;
    this.currentPage.update((p) => (p - 1 + total) % total);
    this.gtm.push({
      event: 'payment_slider_advance',
      direction: 'prev',
      page_index: this.currentPage(),
      category: this.selectedCategory(),
      page: '/pagos',
    });
  }

  goToPage(index: number): void {
    const total = this.totalPages();
    if (index < 0 || index >= total || index === this.currentPage()) return;
    this.currentPage.set(index);
    this.gtm.push({
      event: 'payment_slider_dot',
      page_index: index,
      category: this.selectedCategory(),
      page: '/pagos',
    });
  }

  onContactPhoneClick(): void {
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/pagos' });
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
