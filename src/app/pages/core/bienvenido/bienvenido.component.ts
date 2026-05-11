import { Component, OnInit, OnDestroy, inject, HostBinding } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { HeaderSection } from '../../../secciones/header/header';
import { FooterSection } from '../../../secciones/footer/footer';
import { LineaEtica } from '../../../popups/linea-etica/linea-etica';
import { GtmService } from '../../../servicios/gtm';

/**
 * Página de bienvenida (ruta raíz '/').
 *
 * Muestra las tres líneas de negocio principales: Bienestar Integral,
 * Apoyo Inmediato y Demuestra tu Afecto. En desktop se despliegan en
 * columna fija; en mobile rotan automáticamente cada 5 segundos.
 *
 * SEO: título y meta description se setean en ngOnInit para SSR.
 */
@Component({
  selector: 'app-bienvenido',
  imports: [RouterLink, HeaderSection, FooterSection, LineaEtica],
  templateUrl: './bienvenido.component.html',
  styleUrl: './bienvenido.component.scss',
})
export class BienvenidoComponent implements OnInit, OnDestroy {
  @HostBinding('attr.data-territory') readonly territory = 'prevision';

  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);

  // Estado de los modales (pendientes de implementar los componentes popup).
  public modal = false;
  public modalPhones = false;
  public modalWelcome = true;

  public currentSlide = 0;

  // number: window.setInterval retorna number en el browser (no NodeJS.Timeout).
  private slideInterval: number | undefined;

  /** Datos de las tarjetas de servicio para el slider mobile. */
  public readonly plans = [
    {
      id: 1,
      title: 'Bienestar integral',
      description: '¡Conoce nuestros planes de previsión! Porque garantizar el bienestar de tu familia es el mejor regalo que puedes darle.',
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
      description: 'Manifiesta tu solidaridad y empatía, compra un detalle y hazte presente en este difícil momento.',
      img: '/logos/demuestra-afecto.svg',
      link: '/demuestra-tu-afecto',
    },
  ];

  constructor() {
    // startAutoSlide se llama en constructor para que el intervalo
    // arranque antes del primer ciclo de detección de cambios.
    this.startAutoSlide();
  }

  ngOnInit(): void {
    this.title.setTitle('Los Olivos Tolima - Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content: 'Los Olivos Tolima ofrece servicios funerarios integrales en Cali: planes exequiales, cremación, traslados y salas de velación. Atención 24 horas.',
    });
    this.gtm.trackPageView('/');
  }

  ngOnDestroy(): void {
    // Limpia el intervalo al destruir el componente para evitar memory leaks.
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  openModal(): void { this.modal = true; }
  closeModal(): void { this.modal = false; }

  openModalWelcome(): void { this.modalWelcome = true; }
  closeModalWelcome(): void { this.modalWelcome = false; }

  openModalPhones(): void { this.modalPhones = true; }
  closeModalPhones(): void { this.modalPhones = false; }

  /**
   * Inicia la rotación automática del slider mobile.
   * Guard de window requerido: el constructor se ejecuta en SSR.
   */
  private startAutoSlide(): void {
    if (typeof window === 'undefined') return;
    this.slideInterval = window.setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.plans.length;
    }, 5000);
  }
}
