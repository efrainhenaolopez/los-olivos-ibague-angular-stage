import { Component, OnInit, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { FooterSection } from '../../../secciones/footer/footer';
import { HeaderPageSection } from '../../../secciones/header-page-section/header-page-section';
import { TributesGrid, Tribute } from '../../../secciones/tributes-grid/tributes-grid';
import { DeathAbroad } from '../../../secciones/death-abroad/death-abroad';
import { SectionInformationContact } from '../../../secciones/section-information-contact/section-information-contact';
import { ContactCta } from '../../../secciones/contact-cta/contact-cta';
import { Lineas } from '../../../popups/lineas/lineas';
import { GtmService } from '../../../servicios/gtm';

@Component({
  selector: 'app-nosotros',
  imports: [
    FooterSection,
    HeaderPageSection,
    TributesGrid,
    DeathAbroad,
    SectionInformationContact,
    ContactCta,
    Lineas,
  ],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.scss',
})
export class Nosotros implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly gtm = inject(GtmService);

  readonly showLineas = signal(false);

  readonly tributes: Tribute[] = [
    { img: '/img/icons-tributes/tribute-attendance.svg', text: 'Asistencia', highlight: '24/7' },
    { img: '/img/icons-tributes/tribute-formalities.svg', text: 'Trámites', highlight: 'Legales' },
    { img: '/img/icons-tributes/tribute-transport.svg', text: 'Transporte del', highlight: 'ser querido' },
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

  ngOnInit(): void {
    this.title.setTitle('Nosotros | Los Olivos Tolima — Serfuncoop');
    this.meta.updateTag({
      name: 'description',
      content:
        'Conoce Los Olivos Tolima: 49 años protegiendo familias colombianas con servicios funerarios integrales y la mayor cobertura nacional.',
    });
    this.gtm.trackPageView('/nosotros');
  }

  openLineas(): void {
    this.showLineas.set(true);
  }

  closeLineas(): void {
    this.showLineas.set(false);
  }
}
