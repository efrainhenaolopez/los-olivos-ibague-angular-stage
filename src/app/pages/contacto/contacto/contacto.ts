import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Meta, Title, DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
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
import { FormularioService } from '../../../servicios/formulario';

const STORAGE_KEY = 'contacto-fab-prefs';

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

interface FaqItem {
  id: string;
  question: string;
  /** Párrafos verbatim del WP. Pueden incluir <strong>, <a> via innerHTML. */
  answer: string[];
}

interface ContactQuickInfo {
  icon: string;
  label: string;
  value: string;
  href: string;
}

/** Modelo del formulario de contacto (template-driven con ngModel). */
interface ContactFormData {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  correo: string;
  servicio: string;
  mensaje: string;
  acepta: boolean;
}

/** URL externa del PQR (sistema Orfeo de Serfuncoop). */
const PQR_URL = 'https://serfuncoop.tisai.co/orfeo/formularioWeb/';

@Component({
  selector: 'app-contacto',
  imports: [
    FormsModule,
    RouterLink,
    HeaderPageSection,
    ContentFooter,
    PaletteFab,
    ProgressBar,
    TributeSection,
  ],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss',
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
export class Contacto implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly PQR_URL = PQR_URL;

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

  /** Vías rápidas de contacto (cards arriba del formulario). */
  readonly quickInfo = signal<ContactQuickInfo[]>([
    {
      icon: 'fa-solid fa-phone',
      label: 'Línea de atención',
      value: '(608) 277 1001',
      href: 'tel:6082771001',
    },
    {
      icon: 'fa-solid fa-envelope',
      label: 'Afiliaciones',
      value: 'afiliaciones@losolivos.com.co',
      href: 'mailto:afiliaciones@losolivos.com.co',
    },
    {
      icon: 'fa-brands fa-whatsapp',
      label: 'WhatsApp',
      value: '+57 310 417 1085',
      href: 'https://api.whatsapp.com/send/?phone=573104171085',
    },
  ]);

  /** Opciones del select "Servicio". */
  readonly servicios = signal<string[]>([
    'Planes de previsión',
    'Productos Parque Cementerio',
    'Taller de Duelo',
    'Otros',
  ]);

  /** Modelo del formulario (template-driven). */
  readonly form = signal<ContactFormData>({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    servicio: '',
    mensaje: '',
    acepta: false,
  });

  readonly submitting = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly submitError = signal<string | null>(null);

  private readonly formularioService = inject(FormularioService);

  /** URL del iframe del mapa, sanitizada para Angular SSR. */
  readonly mapUrl: SafeResourceUrl;

  /** FAQs del WP — orden y contenido verbatim. */
  readonly faqs = signal<FaqItem[]>([
    {
      id: 'reportar-fallecimiento',
      question: '¿Cómo puedo reportar el fallecimiento de un ser querido fallecido?',
      answer: [
        'Para cualquier tipo de fallecimiento, la familia puede ponerse en contacto con la línea telefónica de atención de Los Olivos <strong>(608) 277 1001</strong> y el personal de coordinación de homenajes se encargará de asesorarlo de acuerdo a su caso particular para el manejo de los trámites correspondientes.',
      ],
    },
    {
      id: 'registro-defuncion',
      question:
        '¿Cómo consulto el Número de Registro Civil de defunción de mi ser querido fallecido?',
      answer: [
        'Si el servicio funerario se ha llevado a cabo directamente por Los Olivos, el personal de homenajes te suministrará el N° del registro y la notaría en la cual puedes llevar a cabo el trámite de solicitud del <strong>Registro Civil de Defunción</strong> de tu ser querido fallecido. Recuerda que es necesario conocer el nombre completo o el número del documento de identidad que tenía el fallecido.',
      ],
    },
    {
      id: 'horario-parque',
      question: '¿Cuál es el horario de visitas del Parque Cementerio Los Olivos de Ibagué?',
      answer: [
        'Restablecimos el horario habitual de visitas al Parque Cementerio Los Olivos de Ibagué.',
        '<strong>Domingo a domingo de 9:00 a.m. a 5:00 p.m.</strong>',
        '— Sin agendamiento —',
      ],
    },
    {
      id: 'misas-conmemoraciones',
      question:
        '¿Los Olivos está realizando misas, conmemoraciones o talleres de duelo presenciales?',
      answer: [
        'Estamos invitando a las familias a participar de la misa virtual en conmemoración de los seres queridos fallecidos, que se realiza todos los lunes a las 5:00 p.m. a través de la página de <a href="https://www.facebook.com/losolivosserfuncoop" target="_blank" rel="noopener"><strong>Facebook de Los Olivos Serfuncoop</strong></a>.',
      ],
    },
    {
      id: 'asistir-velacion',
      question: '¿Es posible asistir a la velación de un ser querido fallecido?',
      answer: [
        'Sí. Los Olivos maneja un horario de <strong>7:00 a.m. a 9:00 p.m.</strong> en las salas de velación de Ibagué, El Espinal y Girardot, sin límite en el número de acompañantes.',
      ],
    },
    {
      id: 'estado-cuenta',
      question: '¿Cómo puedo conocer el estado de cuenta de mi plan de previsión exequial?',
      answer: [
        'La consulta puede realizarla el titular del plan a través de los siguientes canales disponibles para nuestros afiliados:',
        '<strong>Teléfono:</strong> (608) 277 1001 ext 1013 – 1016',
        '<strong>Correo electrónico:</strong> <a href="mailto:afiliaciones@losolivos.com.co">afiliaciones@losolivos.com.co</a>',
        '<strong>Presencial:</strong> Oficina de afiliaciones Cra 5ta con 39 en Ibagué, o en las sedes de homenajes de Girardot y El Espinal.',
      ],
    },
  ]);

  /** FAQ actualmente expandida (id) o null si todas están cerradas. */
  readonly expandedFaq = signal<string | null>(null);

  constructor() {
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://maps.google.com/maps?q=Cra.%205%20%23Calle%2040%2C%20Ibagu%C3%A9%2C%20Tolima&t=m&z=14&output=embed&iwloc=near',
    );
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
    this.title.setTitle('Contacto — Los Olivos Tolima · Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content:
        'Contáctanos en Los Olivos Tolima: PQR, formulario de contacto, sedes en Ibagué, El Espinal y Girardot, línea telefónica (608) 277 1001, WhatsApp y preguntas frecuentes.',
    });
    this.gtm.trackPageView('/contacto');
  }

  toggleFaq(id: string): void {
    const current = this.expandedFaq();
    this.expandedFaq.set(current === id ? null : id);
    if (current !== id) {
      this.gtm.push({ event: 'faq_open', faq: id, page: '/contacto' });
    }
  }

  onPqrClick(): void {
    this.gtm.push({ event: 'pqr_click', page: '/contacto', destination: PQR_URL });
  }

  onQuickContactClick(label: string): void {
    this.gtm.push({ event: 'quick_contact_click', channel: label, page: '/contacto' });
  }

  onSubmit(formRef: NgForm): void {
    if (formRef.invalid || !this.form().acepta) return;
    this.submitting.set(true);
    this.submitError.set(null);

    const data = this.form();

    this.formularioService
      .sendFormData({
        name: data.nombre,
        lastName: data.apellido,
        cedula: data.cedula,
        phone: data.telefono,
        email: data.correo,
        servicio: data.servicio,
        message: data.mensaje,
        page: '/contacto',
      })
      .subscribe({
        next: (response) => {
          this.submitting.set(false);
          if (response.status === 'success') {
            this.gtm.push({
              event: 'contact_form_submit',
              servicio: data.servicio,
              page: '/contacto',
            });
            this.submitted.set(true);
            formRef.resetForm();
            this.form.set({
              nombre: '',
              apellido: '',
              cedula: '',
              telefono: '',
              correo: '',
              servicio: '',
              mensaje: '',
              acepta: false,
            });
          } else {
            const translated = this.traducirError(response.code);
            this.submitError.set(
              translated
                ?? response.message
                ?? 'No pudimos enviar tu mensaje. Intenta nuevamente.',
            );
          }
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set('Error de red. Verifica tu conexión e intenta nuevamente.');
        },
      });
  }

  private traducirError(code?: string): string | null {
    switch (code) {
      case 'olvibg_missing_fields':
        return 'Faltan campos obligatorios.';
      case 'olvibg_invalid_email':
        return 'El correo no es válido.';
      case 'olvibg_missing_consent':
        return 'Debes aceptar el tratamiento de datos.';
      case 'olvibg_rate_limited':
        return 'Has enviado demasiados mensajes en poco tiempo. Intenta en unos minutos.';
      case 'olvibg_origin_forbidden':
        return 'Origen no autorizado. El administrador debe agregar este sitio en Ajustes del plugin → Orígenes CORS permitidos.';
      case 'network_error':
        return 'No se pudo contactar al servidor. Probablemente el origen no está en la allowlist de CORS y el preflight fue bloqueado.';
      default:
        return null;
    }
  }

  onContactPhoneClick(): void {
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/contacto' });
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
