import { Component, ElementRef, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { HeaderSection } from '../../../secciones/header/header';
import { FooterSection } from '../../../secciones/footer/footer';
import { FormularioContacto } from '../../../secciones/formulario-contacto/formulario-contacto';
import { LineaEtica } from '../../../popups/linea-etica/linea-etica';
import { HeaderPageSection } from '../../../secciones/header-page-section/header-page-section';
import { ProgressBar } from '../../../secciones/progress-bar/progress-bar';
import { ContactCta } from '../../../secciones/contact-cta/contact-cta';
import { Separator } from '../../../secciones/separator/separator';
import { SectionInformationContact } from '../../../secciones/section-information-contact/section-information-contact';
import { TributesGrid, Tribute } from '../../../secciones/tributes-grid/tributes-grid';
import { OptionsList, OptionItem } from '../../../secciones/options-list/options-list';
import { PlansGrid, Plan } from '../../../secciones/plans-grid/plans-grid';
import { CategoriesGrid, Category } from '../../../secciones/categories-grid/categories-grid';
import { DeathAbroad } from '../../../secciones/death-abroad/death-abroad';
import { OurTributesSection } from '../../../secciones/our-tributes-section/our-tributes-section';
import { TributeSection } from '../../../secciones/tribute-section/tribute-section';
import { ShowYourAffection } from '../../../secciones/show-your-affection/show-your-affection';
import { BuyTributeSection } from '../../../secciones/buy-tribute-section/buy-tribute-section';
import { SearchOverlay } from '../../../secciones/search-overlay/search-overlay';
import { Mapa } from '../../../secciones/mapa/mapa';
import { SliderProducts, SliderProduct } from '../../../secciones/slider-products/slider-products';
import { Lineas } from '../../../popups/lineas/lineas';
import { Principal } from '../../../popups/principal/principal';
import { Contacto } from '../../../popups/contacto/contacto';
import { Notification, NotificationData } from '../../../popups/notification/notification';
import { Tributes, TributeProtocol } from '../../../popups/tributes/tributes';
import { FuneralPlans, FuneralPlan } from '../../../popups/funeral-plans/funeral-plans';
import { Products, PopupProduct } from '../../../popups/products/products';
import { Relieves } from '../../../popups/relieves/relieves';
import { OptionsRelieves, RelievesResponse } from '../../../popups/options-relieves/options-relieves';
import { Headquarter, HeadquarterData } from '../../../popups/headquarter/headquarter';
import { GtmService } from '../../../servicios/gtm';
import { MobileService } from '../../../servicios/mobile';
import { RecaptchaService } from '../../../servicios/recaptcha';

type PopupId =
  | 'linea-etica'
  | 'lineas'
  | 'principal'
  | 'contacto'
  | 'notification'
  | 'tributes'
  | 'funeral-plans'
  | 'products'
  | 'relieves'
  | 'options-relieves'
  | 'headquarter'
  | null;

interface CanalRecaudo {
  id: number;
  icon: string;
  nombre: string;
  descripcion: string;
  detalle: string | null;
  link: string | null;
  externo: boolean;
}

interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  cta: string;
  ctaStrong: string;
  bgSoft: string;
  onPrimary: string;
  gradientFrom: string;
  gradientTo: string;
}

type TerritoryId = 'duelo' | 'prevision' | 'vida';

const DEFAULT_PALETTES: Record<string, Palette> = {
  'duelo-clasico':     { primary: '#234b50', secondary: '#5a8c8e', accent: '#a94d69', cta: '#f0a33d', ctaStrong: '#d68922', bgSoft: '#edf5f7', onPrimary: '#ffffff', gradientFrom: '#234b50', gradientTo: '#5a8c8e' },
  'duelo-moderno':     { primary: '#1e3a5f', secondary: '#4a6b8a', accent: '#b85450', cta: '#d4a857', ctaStrong: '#b88f3e', bgSoft: '#f0f4f8', onPrimary: '#ffffff', gradientFrom: '#1e3a5f', gradientTo: '#c9a96e' },
  'duelo-elegante':    { primary: '#2c2e35', secondary: '#4a4d57', accent: '#ff7a8a', cta: '#5a9080', ctaStrong: '#437366', bgSoft: '#f5f5f5', onPrimary: '#ffffff', gradientFrom: '#2c2e35', gradientTo: '#7fb8a8' },
  'prevision-coral':   { primary: '#c93a4f', secondary: '#ff7a8a', accent: '#ffd166', cta: '#d63384', ctaStrong: '#a32168', bgSoft: '#fff2f4', onPrimary: '#ffffff', gradientFrom: '#c93a4f', gradientTo: '#ffd166' },
  'prevision-energia': { primary: '#e8632f', secondary: '#f4a55b', accent: '#84cc16', cta: '#2d7dd2', ctaStrong: '#1f5fa3', bgSoft: '#fff4ed', onPrimary: '#ffffff', gradientFrom: '#e8632f', gradientTo: '#2d7dd2' },
  'prevision-natural': { primary: '#2d7d4f', secondary: '#6cb86c', accent: '#d97706', cta: '#15803d', ctaStrong: '#0f5e2c', bgSoft: '#f1f8e9', onPrimary: '#ffffff', gradientFrom: '#2d7d4f', gradientTo: '#c9a96e' },
  'vida-vibrante':     { primary: '#cf4545', secondary: '#efc45b', accent: '#6cd490', cta: '#e91e63', ctaStrong: '#b91450', bgSoft: '#fef9ef', onPrimary: '#ffffff', gradientFrom: '#cf4545', gradientTo: '#efc45b' },
  'vida-sunset':       { primary: '#b8743a', secondary: '#e5a024', accent: '#ff7a8a', cta: '#6e4f8b', ctaStrong: '#543b6c', bgSoft: '#fdf8e8', onPrimary: '#ffffff', gradientFrom: '#e5a024', gradientTo: '#6e4f8b' },
  'vida-fresco':       { primary: '#00897b', secondary: '#4ecdc4', accent: '#f97316', cta: '#e91e63', ctaStrong: '#c2185b', bgSoft: '#e0f7f7', onPrimary: '#ffffff', gradientFrom: '#00897b', gradientTo: '#4ecdc4' },
};

/* ─── Editor por elemento (estilo Divi/Elementor) ───────────────────────── */

type ElementPropKind = 'color' | 'size' | 'text';

interface ElementProp {
  key: string;
  label: string;
  cssVar: string;
  kind: ElementPropKind;
  placeholder?: string;
}

interface ElementCategory {
  id: string;
  label: string;
  icon: string;
  props: ElementProp[];
}

const ELEMENT_CATEGORIES: ElementCategory[] = [
  {
    id: 'btnPrimary',
    label: 'Botón primario',
    icon: 'fa-square',
    props: [
      { key: 'bg',     label: 'Fondo',  cssVar: '--el-btn-primary-bg',     kind: 'color' },
      { key: 'text',   label: 'Texto',  cssVar: '--el-btn-primary-text',   kind: 'color' },
      { key: 'border', label: 'Borde',  cssVar: '--el-btn-primary-border', kind: 'color' },
      { key: 'radius', label: 'Radio',  cssVar: '--el-btn-primary-radius', kind: 'size', placeholder: '8px' },
    ],
  },
  {
    id: 'btnSecondary',
    label: 'Botón secundario',
    icon: 'fa-square-minus',
    props: [
      { key: 'border',     label: 'Borde',       cssVar: '--el-btn-secondary-border',     kind: 'color' },
      { key: 'text',       label: 'Texto',       cssVar: '--el-btn-secondary-text',       kind: 'color' },
      { key: 'hoverBg',    label: 'Hover fondo', cssVar: '--el-btn-secondary-hover-bg',   kind: 'color' },
      { key: 'hoverText',  label: 'Hover texto', cssVar: '--el-btn-secondary-hover-text', kind: 'color' },
      { key: 'radius',     label: 'Radio',       cssVar: '--el-btn-secondary-radius',     kind: 'size', placeholder: '8px' },
    ],
  },
  {
    id: 'h1',
    label: 'Título H1',
    icon: 'fa-heading',
    props: [
      { key: 'color', label: 'Color', cssVar: '--el-h1-color', kind: 'color' },
    ],
  },
  {
    id: 'h2',
    label: 'Título H2',
    icon: 'fa-heading',
    props: [
      { key: 'color', label: 'Color', cssVar: '--el-h2-color', kind: 'color' },
    ],
  },
  {
    id: 'h3',
    label: 'Título H3',
    icon: 'fa-heading',
    props: [
      { key: 'color', label: 'Color', cssVar: '--el-h3-color', kind: 'color' },
    ],
  },
  {
    id: 'bodyText',
    label: 'Texto base',
    icon: 'fa-paragraph',
    props: [
      { key: 'color', label: 'Color', cssVar: '--el-body-color', kind: 'color' },
    ],
  },
  {
    id: 'link',
    label: 'Link',
    icon: 'fa-link',
    props: [
      { key: 'color',      label: 'Color',       cssVar: '--el-link-color', kind: 'color' },
      { key: 'hoverColor', label: 'Hover color', cssVar: '--el-link-hover', kind: 'color' },
    ],
  },
  {
    id: 'headerBar',
    label: 'Header bar',
    icon: 'fa-window-maximize',
    props: [
      { key: 'bg',   label: 'Fondo', cssVar: '--el-header-bar-bg',   kind: 'color' },
      { key: 'text', label: 'Texto', cssVar: '--el-header-bar-text', kind: 'color' },
    ],
  },
  {
    id: 'heroBanner',
    label: 'Hero / Banner',
    icon: 'fa-image',
    props: [
      { key: 'bg',   label: 'Fondo', cssVar: '--el-hero-bg',   kind: 'color' },
      { key: 'text', label: 'Texto', cssVar: '--el-hero-text', kind: 'color' },
    ],
  },
  {
    id: 'footerBottom',
    label: 'Footer bottom',
    icon: 'fa-window-minimize',
    props: [
      { key: 'bg',   label: 'Fondo', cssVar: '--el-footer-bg',   kind: 'color' },
      { key: 'text', label: 'Texto', cssVar: '--el-footer-text', kind: 'color' },
    ],
  },
  {
    id: 'popupHeader',
    label: 'Popup header',
    icon: 'fa-window-restore',
    props: [
      { key: 'bg',   label: 'Fondo', cssVar: '--el-popup-header-bg',   kind: 'color' },
      { key: 'text', label: 'Texto', cssVar: '--el-popup-header-text', kind: 'color' },
    ],
  },
];

type ElementOverrides = Record<string, Record<string, string>>;

@Component({
  selector: 'app-ux',
  imports: [
    RouterLink,
    HeaderSection,
    FooterSection,
    FormularioContacto,
    LineaEtica,
    HeaderPageSection,
    ProgressBar,
    ContactCta,
    Separator,
    SectionInformationContact,
    TributesGrid,
    OptionsList,
    PlansGrid,
    CategoriesGrid,
    DeathAbroad,
    OurTributesSection,
    TributeSection,
    ShowYourAffection,
    BuyTributeSection,
    SearchOverlay,
    Mapa,
    SliderProducts,
    Lineas,
    Principal,
    Contacto,
    Notification,
    Tributes,
    FuneralPlans,
    Products,
    Relieves,
    OptionsRelieves,
    Headquarter,
  ],
  templateUrl: './ux.html',
  styleUrl: './ux.scss',
  host: {
    '[attr.data-territory]':  'territory()',
    '[attr.data-template]':   'template()',
    '[style.--t-primary]':    'activePalette().primary',
    '[style.--t-secondary]':  'activePalette().secondary',
    '[style.--t-accent]':     'activePalette().accent',
    '[style.--t-cta]':        'activePalette().cta',
    '[style.--t-cta-strong]': 'activePalette().ctaStrong',
    '[style.--t-bg-soft]':    'activePalette().bgSoft',
    '[style.--t-on-primary]': 'activePalette().onPrimary',
    '[style.--t-gradient]':   'activeGradient()',
  },
})
export class Ux implements OnInit {
  readonly territoryThemes: Array<{
    id: TerritoryId;
    label: string;
    templates: Array<{ id: string; label: string }>;
  }> = [
    {
      id: 'duelo',
      label: 'Duelo',
      templates: [
        { id: 'clasico', label: 'Clásico' },
        { id: 'moderno', label: 'Moderno' },
        { id: 'elegante', label: 'Elegante' },
      ],
    },
    {
      id: 'prevision',
      label: 'Previsión',
      templates: [
        { id: 'coral', label: 'Coral' },
        { id: 'energia', label: 'Energía' },
        { id: 'natural', label: 'Natural' },
      ],
    },
    {
      id: 'vida',
      label: 'Vida',
      templates: [
        { id: 'vibrante', label: 'Vibrante' },
        { id: 'sunset', label: 'Sunset' },
        { id: 'fresco', label: 'Fresco' },
      ],
    },
  ];

  readonly paletteFields: Array<{ key: keyof Palette; label: string }> = [
    { key: 'primary',      label: 'Primary' },
    { key: 'secondary',    label: 'Secondary' },
    { key: 'accent',       label: 'Accent' },
    { key: 'cta',          label: 'CTA' },
    { key: 'ctaStrong',    label: 'CTA hover' },
    { key: 'bgSoft',       label: 'BG suave' },
    { key: 'onPrimary',    label: 'Texto sobre primary' },
    { key: 'gradientFrom', label: 'Gradient from' },
    { key: 'gradientTo',   label: 'Gradient to' },
  ];

  private readonly STORAGE_KEY = 'ux-custom-palettes';
  private readonly ELEMENTS_KEY = 'ux-element-overrides';
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  readonly elementCategories = ELEMENT_CATEGORIES;

  readonly territory = signal<TerritoryId>('duelo');
  readonly template = signal<string>('clasico');
  readonly territoryPanelOpen = signal(false);
  readonly editorOpen = signal(false);
  readonly editorTab = signal<'paleta' | 'elementos'>('paleta');
  readonly customPalettes = signal<Record<string, Palette>>({});
  readonly elementOverrides = signal<ElementOverrides>({});
  readonly expandedCategory = signal<string>('btnPrimary');
  readonly importError = signal<string>('');

  readonly activeKey = computed(() => `${this.territory()}-${this.template()}`);
  readonly activePalette = computed<Palette>(
    () => this.customPalettes()[this.activeKey()] ?? DEFAULT_PALETTES[this.activeKey()],
  );
  readonly activeGradient = computed(() => {
    const p = this.activePalette();
    return `linear-gradient(135deg, ${p.gradientFrom} 0%, ${p.gradientTo} 100%)`;
  });
  readonly hasCustomActive = computed(() => this.activeKey() in this.customPalettes());

  constructor() {
    if (typeof window !== 'undefined') {
      const savedPalette = window.localStorage.getItem(this.STORAGE_KEY);
      if (savedPalette) {
        try {
          const parsed = JSON.parse(savedPalette);
          if (parsed && typeof parsed === 'object') {
            this.customPalettes.set(parsed);
          }
        } catch {
          /* ignore corrupt JSON */
        }
      }
      const savedElements = window.localStorage.getItem(this.ELEMENTS_KEY);
      if (savedElements) {
        try {
          const parsed = JSON.parse(savedElements);
          if (parsed && typeof parsed === 'object') {
            this.elementOverrides.set(parsed);
          }
        } catch {
          /* ignore corrupt JSON */
        }
      }
      effect(() => {
        const data = this.customPalettes();
        try {
          window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch {
          /* localStorage lleno o bloqueado */
        }
      });
      effect(() => {
        const data = this.elementOverrides();
        try {
          window.localStorage.setItem(this.ELEMENTS_KEY, JSON.stringify(data));
        } catch {
          /* localStorage lleno o bloqueado */
        }
      });
      effect(() => {
        const overrides = this.elementOverrides();
        const host = this.hostRef.nativeElement;
        if (!host || !host.style) return;
        for (const cat of ELEMENT_CATEGORIES) {
          for (const prop of cat.props) {
            host.style.removeProperty(prop.cssVar);
          }
        }
        for (const [catId, props] of Object.entries(overrides)) {
          const cat = ELEMENT_CATEGORIES.find((c) => c.id === catId);
          if (!cat) continue;
          for (const [propKey, value] of Object.entries(props)) {
            const prop = cat.props.find((p) => p.key === propKey);
            if (!prop || !value) continue;
            host.style.setProperty(prop.cssVar, value);
          }
        }
      });
    }
  }

  paletteOf(territoryId: TerritoryId, templateId: string): Palette {
    const key = `${territoryId}-${templateId}`;
    return this.customPalettes()[key] ?? DEFAULT_PALETTES[key];
  }

  setTheme(territoryId: TerritoryId, templateId: string): void {
    this.territory.set(territoryId);
    this.template.set(templateId);
  }

  toggleTerritoryPanel(): void {
    this.territoryPanelOpen.update((v) => !v);
  }

  toggleEditor(): void {
    this.editorOpen.update((v) => !v);
  }

  setEditorTab(tab: 'paleta' | 'elementos'): void {
    this.editorTab.set(tab);
  }

  toggleCategory(id: string): void {
    this.expandedCategory.update((current) => (current === id ? '' : id));
  }

  getElementValue(catId: string, propKey: string): string {
    return this.elementOverrides()[catId]?.[propKey] ?? '';
  }

  hasElementOverride(catId: string, propKey: string): boolean {
    return Boolean(this.elementOverrides()[catId]?.[propKey]);
  }

  updateElementProp(catId: string, propKey: string, value: string): void {
    const trimmed = value.trim();
    this.elementOverrides.update((map) => {
      const cat = { ...(map[catId] ?? {}) };
      if (!trimmed) {
        delete cat[propKey];
      } else {
        cat[propKey] = trimmed;
      }
      const next = { ...map };
      if (Object.keys(cat).length === 0) {
        delete next[catId];
      } else {
        next[catId] = cat;
      }
      return next;
    });
  }

  resetElementProp(catId: string, propKey: string): void {
    this.updateElementProp(catId, propKey, '');
  }

  resetAllElements(): void {
    this.elementOverrides.set({});
  }

  /** Normaliza un hex del input de texto (acepta con o sin # y 3/6 chars). */
  normalizeHex(value: string): string {
    const v = value.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(v)) {
      return '#' + v.split('').map((c) => c + c).join('').toLowerCase();
    }
    if (/^[0-9a-fA-F]{6}$/.test(v)) {
      return '#' + v.toLowerCase();
    }
    return '';
  }

  updateColor(field: keyof Palette, value: string): void {
    const key = this.activeKey();
    const base = this.customPalettes()[key] ?? DEFAULT_PALETTES[key];
    this.customPalettes.update((map) => ({ ...map, [key]: { ...base, [field]: value } }));
  }

  resetActivePalette(): void {
    const key = this.activeKey();
    this.customPalettes.update((map) => {
      if (!(key in map)) return map;
      const next = { ...map };
      delete next[key];
      return next;
    });
  }

  resetAll(): void {
    this.customPalettes.set({});
  }

  /** Devuelve las 9 paletas con overrides aplicados (configuración completa). */
  allResolvedPalettes(): Record<string, Palette> {
    const out: Record<string, Palette> = {};
    const overrides = this.customPalettes();
    for (const key of Object.keys(DEFAULT_PALETTES)) {
      out[key] = overrides[key] ?? DEFAULT_PALETTES[key];
    }
    return out;
  }

  private downloadFile(filename: string, content: string, mime: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Descarga un bundle con las 9 paletas resueltas + overrides por elemento. */
  exportJson(): void {
    const bundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      palettes: this.allResolvedPalettes(),
      elements: this.elementOverrides(),
    };
    const json = JSON.stringify(bundle, null, 2);
    const stamp = new Date().toISOString().slice(0, 10);
    this.downloadFile(`tema-ux-${stamp}.json`, json, 'application/json');
  }

  importJson(text: string): void {
    if (!text.trim()) {
      this.importError.set('');
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') {
        this.importError.set('JSON debe ser un objeto');
        return;
      }
      // Bundle nuevo: { version, palettes, elements }
      if (parsed.palettes || parsed.elements) {
        if (parsed.palettes && typeof parsed.palettes === 'object') {
          this.customPalettes.set(parsed.palettes);
        }
        if (parsed.elements && typeof parsed.elements === 'object') {
          this.elementOverrides.set(parsed.elements);
        }
      } else {
        // Legacy: el JSON es solo el mapa de paletas
        this.customPalettes.set(parsed);
      }
      this.importError.set('');
    } catch (e) {
      this.importError.set((e as Error).message);
    }
  }

  importFromFile(file: File | null | undefined): void {
    if (!file || typeof FileReader === 'undefined') return;
    const reader = new FileReader();
    reader.onload = () => this.importJson(String(reader.result ?? ''));
    reader.onerror = () => this.importError.set('No se pudo leer el archivo');
    reader.readAsText(file);
  }

  copyScss(): void {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    const p = this.activePalette();
    const t = this.territory();
    const tpl = this.template();
    const block = `app-ux[data-territory='${t}'][data-template='${tpl}'] {
  --t-primary:    ${p.primary};
  --t-secondary:  ${p.secondary};
  --t-accent:     ${p.accent};
  --t-cta:        ${p.cta};
  --t-cta-strong: ${p.ctaStrong};
  --t-bg-soft:    ${p.bgSoft};
  --t-on-primary: ${p.onPrimary};
  --t-gradient:   linear-gradient(135deg, ${p.gradientFrom} 0%, ${p.gradientTo} 100%);
}`;
    navigator.clipboard.writeText(block);
  }

  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);
  private readonly mobile = inject(MobileService);
  private readonly recaptcha = inject(RecaptchaService);

  readonly openPopup = signal<PopupId>(null);
  readonly mobileResult = signal<boolean | null>(null);
  readonly gtmLog = signal<string[]>([]);
  readonly recaptchaToken = signal<string>('');

  readonly logosColor = [
    'logo-olivos-color',
    'logo-alivia-color',
    'logo-vida-color',
    'logo-aseguradora-color',
  ];

  readonly logosGris = [
    'logo-olivos-gris',
    'logo-alivia-gris',
    'logo-vida-gris',
    'logo-aseguradora-gris',
  ];

  readonly logosSueltos = [
    { src: '/logos/logo-olivos.svg', alt: 'Olivos Tolima' },
    { src: '/logos/logo-alivia.svg', alt: 'Alivia' },
    { src: '/logos/logo-insurance.svg', alt: 'Insurance' },
    { src: '/logos/apoyo-inmediato.svg', alt: 'Apoyo Inmediato' },
    { src: '/logos/bienestar-integral.svg', alt: 'Bienestar Integral' },
    { src: '/logos/demuestra-afecto.svg', alt: 'Demuestra tu Afecto' },
    { src: '/logos/logo_olivos_color.svg', alt: 'Olivos color' },
    { src: '/logos/logo_vida_color.svg', alt: 'Vida color' },
  ];

  readonly iconosCategorias = [
    'category-emotional-health',
    'category-health',
    'category-personal',
    'category-pets',
    'category-third-age',
    'category-youths',
  ];

  readonly iconosSueltos = [
    { src: '/icons/iphone.svg', alt: 'iPhone' },
    { src: '/icons/location.svg', alt: 'Location' },
    { src: '/icons/Mapa-solo.svg', alt: 'Mapa' },
  ];

  readonly headersDoc = [
    {
      titulo: 'Header principal',
      selector: 'app-header',
      desc: 'Cabecera global con navegación, menú móvil, búsqueda y dropdown.',
      inputs: 'logo (string, required), color (string, required)',
      snippet:
        '<app-header\n  logo="/logos/logo-olivos.svg"\n  color="#908e8e61"\n></app-header>',
    },
    {
      titulo: 'Header con menú expandido',
      selector: 'app-header-menu',
      desc: 'Variante con barra superior (ubicación, teléfono, búsqueda) y barra principal con CTAs.',
      inputs: '— (sin inputs públicos)',
      snippet: '<app-header-menu></app-header-menu>',
    },
    {
      titulo: 'Header de página interna',
      selector: 'app-header-page',
      desc: 'Header alternativo para páginas con hero y fondo.',
      inputs: '— (sin inputs públicos)',
      snippet: '<app-header-page></app-header-page>',
    },
    {
      titulo: 'Header de página con menú',
      selector: 'app-header-page-menu',
      desc: 'Combina la variante de página interna con menú expandido.',
      inputs: '— (sin inputs públicos)',
      snippet: '<app-header-page-menu></app-header-page-menu>',
    },
  ];

  readonly popupsPendientes = [
    {
      titulo: 'Popup principal (bienvenida)',
      selector: 'app-principal',
      desc: 'Modal de bienvenida. Pendiente de definición de contenido.',
    },
    {
      titulo: 'Popup líneas de atención',
      selector: 'app-lineas',
      desc: 'Modal con teléfonos de atención. Pendiente de contenido.',
    },
    {
      titulo: 'Popup contacto',
      selector: 'app-contacto',
      desc: 'Modal con formulario de contacto. Pendiente de contenido.',
    },
  ];

  readonly serviciosDoc = [
    {
      nombre: 'FormularioService',
      api: 'sendFormData(data) → Observable<ApiResponse>',
      desc: 'POST al endpoint de WP. Lo invoca FormularioContacto al enviar.',
    },
    {
      nombre: 'FontAwesomeService',
      api: 'load()',
      desc: 'Inyecta el CDN de Font Awesome. Se carga una sola vez desde App.',
    },
  ];

  // Datos de Bienvenido (Tolima) — slider mobile estático.
  readonly plansBienvenido = [
    {
      id: 1,
      title: 'Bienestar integral',
      description:
        '¡Conoce nuestros planes de previsión! Porque garantizar el bienestar de tu familia es el mejor regalo que puedes darle.',
      img: '/logos/bienestar-integral.svg',
      link: '/bienestar-integral',
    },
    {
      id: 2,
      title: 'Apoyo Inmediato',
      description: '¿Ha ocurrido un fallecimiento o está cerca de suceder?',
      img: '/logos/apoyo-inmediato.svg',
      link: '/apoyo-inmediato',
    },
    {
      id: 3,
      title: 'Demuestra tu afecto',
      description:
        'Manifiesta tu solidaridad y empatía, compra un detalle y hazte presente en este difícil momento.',
      img: '/logos/demuestra-afecto.svg',
      link: '/demuestra-tu-afecto',
    },
  ];

  // Datos de Inicio (Tolima) — slides del background + tarjetas laterales.
  readonly slidesInicio = [
    { src: '/img/slides/slide-1.png', alt: 'Slide 1' },
    { src: '/img/slides/slide-2.png', alt: 'Slide 2' },
    { src: '/img/slides/slide-3.png', alt: 'Slide 3' },
  ];

  // Datos portados de Cali → Canales de Recaudo.
  readonly canales: CanalRecaudo[] = [
    {
      id: 1,
      icon: 'fa-solid fa-building',
      nombre: 'Nuestras Sedes',
      descripcion:
        'Realiza tu pago de forma presencial en cualquiera de nuestras sedes. Atención de lunes a sábado.',
      detalle: 'Ver directorio de sedes',
      link: '/sedes',
      externo: false,
    },
    {
      id: 2,
      icon: 'fa-solid fa-laptop',
      nombre: 'Pago en Línea (PSE)',
      descripcion:
        'Paga de forma segura con débito bancario a través de PSE desde cualquier dispositivo.',
      detalle: 'Ir a pago en línea',
      link: 'https://www.losolivoscali.com/pago-en-linea/',
      externo: true,
    },
    {
      id: 3,
      icon: 'fa-solid fa-store',
      nombre: 'Efecty',
      descripcion:
        'Cancela tu cuota en más de 8.000 puntos Efecty en todo el país. Sin necesidad de cuenta bancaria.',
      detalle: null,
      link: null,
      externo: false,
    },
    {
      id: 4,
      icon: 'fa-solid fa-ticket',
      nombre: 'Baloto',
      descripcion:
        'Paga en los puntos Baloto distribuidos en supermercados, droguerías y tiendas de conveniencia.',
      detalle: null,
      link: null,
      externo: false,
    },
    {
      id: 5,
      icon: 'fa-solid fa-university',
      nombre: 'Corresponsales Bancarios',
      descripcion:
        'Disponible en corresponsales de Bancolombia y Davivienda en supermercados y droguerías aliadas.',
      detalle: null,
      link: null,
      externo: false,
    },
    {
      id: 6,
      icon: 'fa-solid fa-credit-card',
      nombre: 'Tarjeta Débito / Crédito',
      descripcion:
        'Paga con tarjeta Visa, Mastercard o débito en cualquiera de nuestras sedes físicas.',
      detalle: null,
      link: null,
      externo: false,
    },
  ];

  // Ejemplo de configuración de error (404 — el resto sigue el mismo patrón).
  readonly errorConfigEjemplo = {
    code: 404,
    heading: 'Página no encontrada',
    message:
      'La página que buscas no existe o fue movida. Vuelve al inicio y encuentra los servicios funerarios de Los Olivos Tolima.',
  };

  // Demos de bloques temáticos.
  readonly progressFilled = signal(2);
  readonly pageBackgrounds = [
    { label: 'Nosotros', src: '/img/page-backgrounds/background-us.png' },
    { label: 'Homenajes', src: '/img/page-backgrounds/background-tributes.png' },
    { label: 'Más vida', src: '/img/page-backgrounds/background-life-for-you.png' },
    { label: 'Alivia', src: '/img/page-backgrounds/background-relieves.png' },
    { label: 'Apoyo inmediato', src: '/img/page-backgrounds/immediate-support-fund.png' },
    { label: 'Repatriación', src: '/img/page-backgrounds/repatriation-fund.png' },
    { label: 'Canales', src: '/img/page-backgrounds/background-channels.png' },
    { label: 'Red nacional', src: '/img/page-backgrounds/national-network-fund.png' },
    { label: 'Empresas', src: '/img/page-backgrounds/background-our-companies.png' },
    { label: 'Sedes', src: '/img/page-backgrounds/background-our-headquarters.png' },
    { label: 'Demuestra afecto', src: '/img/page-backgrounds/background-show-your-affection.png' },
  ];
  readonly currentBackground = signal(this.pageBackgrounds[0].src);

  // Iteración 3 — datos de demo para los bloques dinámicos.

  readonly tributesDemo: Tribute[] = [
    { img: '/img/icons-tributes/tribute-attendance.svg', text: 'Asistencia', highlight: '24/7' },
    { img: '/img/icons-tributes/tribute-formalities.svg', text: 'Trámites', highlight: 'Legales' },
    { img: '/img/icons-tributes/tribute-transport.svg', text: 'Trasporte del', highlight: 'ser querido' },
    { img: '/img/icons-tributes/tribute-presentation.svg', text: 'Presentación del', highlight: 'ser querido' },
    { img: '/img/icons-tributes/tribute-chest.svg', text: '', highlight: 'Cofre' },
    { img: '/img/icons-tributes/tribute-arrangement.svg', text: 'Arreglo', highlight: 'floral' },
    { img: '/img/icons-tributes/tribute-cafe.svg', text: 'Servicio de', highlight: 'cafetería' },
    { img: '/img/icons-tributes/tribute-logistics.svg', text: 'Logística', highlight: 'personalizada' },
    { img: '/img/icons-tributes/tribute-rooms.svg', text: 'Salas', highlight: 'de homenajes' },
    { img: '/img/icons-tributes/tribute-protocols.svg', text: 'Protocolos para', highlight: 'el homenaje' },
    { img: '/img/icons-tributes/tribute-honors.svg', text: 'Honras', highlight: 'fúnebres' },
    { img: '/img/icons-tributes/tribute-transportation-companions.svg', text: 'Transporte para', highlight: 'acompañantes' },
    { img: '/img/icons-tributes/tribute-legacies.svg', text: 'Legados', highlight: 'de amor' },
    { img: '/img/icons-tributes/tribute-destination.svg', text: 'Elección de', highlight: 'destino final', small: '(donde exista convenio)' },
    { img: '/img/icons-tributes/tribute-urns.svg', text: '', highlight: 'Urnas para cenizas' },
    { img: '/img/icons-tributes/tribute-support.svg', text: '', highlight: 'Unidad de Apoyo al Duelo' },
  ];

  readonly optionsProtocolsDemo: OptionItem[] = [
    { number: 1, label: 'Desprendimiento', link: '/homenajes', fragment: 'Desprendimiento' },
    { number: 2, label: 'Acogida', link: '/homenajes', fragment: 'Acogida' },
    { number: 3, label: 'Despedida', link: '/homenajes', fragment: 'Despedida' },
    { number: 4, label: 'Renacimiento', link: '/homenajes', fragment: 'Renacimiento' },
  ];

  readonly optionsProductsDemo: OptionItem[] = [
    { number: 1, label: 'Solicanasta tradicional', link: '/club-mas-vida-para-ti', fragment: '1' },
    { number: 2, label: 'Accidentes personales auxilio educativo', link: '/club-mas-vida-para-ti', fragment: '2' },
    { number: 3, label: 'Solicanasta Familiar', link: '/club-mas-vida-para-ti', fragment: '3' },
    { number: 4, label: 'Solienvida S.O.S. Servicio Oportuno', link: '/club-mas-vida-para-ti', fragment: '4' },
  ];

  readonly plansDemo: Plan[] = this.plansBienvenido;

  readonly categoriesDemo: Category[] = [
    { img: '/icons/icons-categorys/category-youths.svg', text: 'Jóvenes', background: '#fd8e13' },
    { img: '/icons/icons-categorys/category-pets.svg', text: 'Mascotas', background: '#2bad9a' },
    { img: '/icons/icons-categorys/category-third-age.svg', text: 'Tercera edad', background: '#ed1c24' },
    { img: '/icons/icons-categorys/category-personal.svg', text: 'Personales', background: '#6b4e7b' },
    { img: '/icons/icons-categorys/category-health.svg', text: 'Salud', background: '#1374e6' },
    { img: '/icons/icons-categorys/category-emotional-health.svg', text: 'Salud emocional', background: '#d94426' },
  ];

  // Iteración 4 — slider de productos demo.
  readonly productsDemo: SliderProduct[] = [
    {
      id: 1,
      title: 'Plan Bienestar Integral',
      subtitle: 'Para toda la familia',
      description:
        'Cobertura exequial completa con beneficios adicionales para tu familia. Incluye traslados, salas, cofre y servicio cementerial.',
      price: 'Desde $35.000/mes',
      img: '/logos/bienestar-integral.svg',
    },
    {
      id: 2,
      title: 'Apoyo Inmediato',
      subtitle: 'Servicio funerario individual',
      description:
        'Servicio integral cuando lo necesitas: gestión de trámites, transporte, cofre, sala de velación y cremación o destino final.',
      price: 'Tarifa según servicio',
      img: '/logos/apoyo-inmediato.svg',
    },
    {
      id: 3,
      title: 'Demuestra tu afecto',
      subtitle: 'Productos de memorialización',
      description:
        'Coronas, ofrendas florales, urnas y detalles para acompañar a las familias en el momento más difícil.',
      price: 'Catálogo desde $60.000',
      img: '/logos/demuestra-afecto.svg',
    },
  ];

  // Toggle local para mostrar el search-overlay como demo.
  readonly searchOverlayOpen = signal(false);

  // Iteración 5 — datos demo para popups.

  readonly notificationDemo: NotificationData = {
    title: 'Operación exitosa',
    message:
      'Tu solicitud fue recibida correctamente. Pronto un asesor se pondrá en contacto contigo. Gracias por confiar en Los Olivos.',
    background: '#699392',
  };

  readonly tributeProtocolDemo: TributeProtocol = {
    id: 1,
    title: 'Acogida',
    content:
      'En el protocolo de Acogida brindamos un acompañamiento cálido y respetuoso desde el primer instante. Recibimos a la familia con empatía, le explicamos cada paso del proceso y la guiamos para que pueda enfocarse en el homenaje y la despedida de su ser querido sin preocupaciones logísticas.',
  };

  readonly funeralPlanDemo: FuneralPlan = {
    id: 1,
    title: 'Plan Familiar',
    content:
      '<strong>Cobertura integral</strong> diseñada para acompañar a tu familia con todos los servicios funerarios necesarios sin costos adicionales.',
    coverages:
      '<ul><li>Asistencia 24/7</li><li>Transporte del ser querido</li><li>Cofre estándar</li><li>Sala de velación</li><li>Servicio de cafetería</li><li>Trámites legales</li></ul>',
    button: true,
  };

  readonly popupProductDemo: PopupProduct = {
    title: 'Plan Olivos Familiar',
    description:
      'Plan exequial integral para todo el grupo familiar (titular + cónyuge + hijos + padres). Cobertura inmediata con renovación automática mensual.',
    informationPopUP: {
      holder: '<strong>Titular:</strong> de 18 a 65 años. Cobertura inmediata.',
      affiliate:
        '<strong>Afiliado adicional:</strong> hasta 4 más (cónyuge, hijos, padres).',
      paymentMethods: [
        { pay: 'Mensual:', price: '$45.000' },
        { pay: 'Trimestral:', price: '$130.000' },
        { pay: 'Anual:', price: '$500.000' },
      ],
      additional:
        'Aplica con la afiliación de mínimo el grupo familiar básico.',
      img: '/img/image-popUp-products.png',
    },
  };

  readonly relievesResponseDemo: RelievesResponse = {
    title: 'Más cerca de ti',
    option: 'optionThree',
  };

  readonly headquarterDemo: HeadquarterData = {
    name: 'Sede Macarena — Ibagué',
    imgs: [
      { url: '/img/page-backgrounds/background-our-headquarters.png', alt: 'Sede 1' },
      { url: '/img/page-backgrounds/background-our-companies.png', alt: 'Sede 2' },
      { url: '/img/page-backgrounds/background-tributes.png', alt: 'Sede 3' },
    ],
  };

  ngOnInit(): void {
    this.title.setTitle('UX Showcase — Los Olivos Tolima');
    this.meta.updateTag({
      name: 'description',
      content:
        'Catálogo visual de los componentes, popups y servicios reutilizables del proyecto Los Olivos Tolima.',
    });
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.gtm.trackPageView('/ux');
  }

  open(id: Exclude<PopupId, null>): void {
    this.openPopup.set(id);
  }

  close(): void {
    this.openPopup.set(null);
  }

  testGtm(): void {
    this.gtm.push({ event: 'ux_showcase_test', ts: Date.now() });
    const stamp = new Date().toLocaleTimeString();
    this.gtmLog.update((log) =>
      [`Push 'ux_showcase_test' @ ${stamp}`, ...log].slice(0, 5),
    );
  }

  testMobile(): void {
    this.mobileResult.set(this.mobile.isMobile());
  }

  async testRecaptcha(): Promise<void> {
    const token = await this.recaptcha.execute('ux_demo');
    this.recaptchaToken.set(
      token ? token.slice(0, 24) + '…' : '(sin token; SSR o error)',
    );
  }

  setProgress(n: number): void {
    this.progressFilled.set(n);
  }

  setBackground(src: string): void {
    this.currentBackground.set(src);
  }

  onContactPhoneClick(): void {
    this.openPopup.set('lineas');
  }

  openSearchOverlay(): void {
    this.searchOverlayOpen.set(true);
  }

  closeSearchOverlay(): void {
    this.searchOverlayOpen.set(false);
  }
}
