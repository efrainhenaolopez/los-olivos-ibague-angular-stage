import { Component, OnInit, OnDestroy, inject, HostBinding } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { HeaderMenu } from '../../../secciones/header-menu/header-menu';
import { FooterSection } from '../../../secciones/footer/footer';
import { LineaEtica } from '../../../popups/linea-etica/linea-etica';
import { GtmService } from '../../../servicios/gtm';

@Component({
  selector: 'app-bienvenido-menu',
  imports: [RouterLink, HeaderMenu, FooterSection, LineaEtica],
  templateUrl: './bienvenido-menu.component.html',
  styleUrl: './bienvenido-menu.component.scss',
})
export class BienvenidoMenuComponent implements OnInit, OnDestroy {
  @HostBinding('attr.data-territory') readonly territory = 'prevision';

  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);

  public modal = false;
  public modalPhones = false;
  public modalWelcome = true;

  public currentSlide = 0;

  private slideInterval: number | undefined;

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
    this.startAutoSlide();
  }

  ngOnInit(): void {
    this.title.setTitle('Los Olivos Tolima - Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content: 'Los Olivos Tolima ofrece servicios funerarios integrales en Cali: planes exequiales, cremación, traslados y salas de velación. Atención 24 horas.',
    });
    this.gtm.trackPageView('/bienvenido-menu');
  }

  ngOnDestroy(): void {
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

  private startAutoSlide(): void {
    if (typeof window === 'undefined') return;
    this.slideInterval = window.setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.plans.length;
    }, 5000);
  }
}
