import { ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MobileService } from '../../../servicios/mobile';
import { HeaderSection } from '../../../secciones/header/header';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, HeaderSection],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnDestroy {
  private readonly mobileService = inject(MobileService);
  private readonly cdr = inject(ChangeDetectorRef);

  public slides: { src: string; alt: string }[] = [
    { src: '/img/slides/slide-1.png', alt: 'Slide 1' },
    { src: '/img/slides/slide-2.png', alt: 'Slide 2' },
    { src: '/img/slides/slide-3.png', alt: 'Slide 3' },
  ];

  public slidesMobile: { src: string; alt: string }[] = [
    { src: '/img/slides/slide-mobile-1.png', alt: 'Slide 1' },
    { src: '/img/slides/slide-mobile-2.png', alt: 'Slide 2' },
    { src: '/img/slides/slide-mobile-3.png', alt: 'Slide 3' },
  ];

  public sliderSelect: { src: string; alt: string }[] = [];
  public currentSlide = 0;
  public isMobile = false;
  public readonly logo = '/logos/logo_vida_color.svg';
  private intervalId: number | undefined;

  public plans = [
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
    this.isMobile = this.mobileService.isMobile();
    this.sliderSelect = this.isMobile ? this.slidesMobile : this.slides;
    this.startSlideShow();
  }

  ngOnDestroy(): void {
    if (this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
    }
  }

  private startSlideShow(): void {
    if (typeof window !== 'undefined') {
      this.intervalId = window.setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.sliderSelect.length;
        this.cdr.markForCheck(); // dispara CD en zoneless mode
      }, 3000);
    }
  }
}
