import { NgStyle } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Sección de cabecera global del sitio.
 *
 * Recibe el logo y el color de fondo del área de contacto como inputs,
 * permitiendo que cada página personalice esos valores sin duplicar el header.
 *
 * Inputs:
 * - logo  : ruta relativa al SVG del logo, ej. '/logos/logo-olivos-cali.svg'
 * - color : color CSS para el bloque de contacto, ej. '#908e8e61'
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, NgStyle, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderSection {
  public logo = input.required<string>();
  public color = input.required<string>();

  public openNavbarMobile = false;
  public isSearch = false;

  /**
   * Abre el portal del cliente en una pestaña nueva.
   * Guard de window necesario: este método puede llamarse desde plantilla
   * y Angular Universal ejecuta la hidratación en el servidor.
   */
  openLogin(): void {
    if (typeof window === 'undefined') return;
    window.open('https://portalwebolivos.com/#/login/cali', '_blank', 'noopener');
  }

  /** Alterna la visibilidad del menú lateral en móvil. */
  openNavbar(): void {
    this.openNavbarMobile = !this.openNavbarMobile;
  }

  openSearch(): void {
    this.isSearch = true;
  }

  closeSearch(): void {
    this.isSearch = false;
  }
}
