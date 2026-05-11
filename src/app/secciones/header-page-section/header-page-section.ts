import { Component, input } from '@angular/core';
import { HeaderSection } from '../header/header';
import { HeaderMenu } from '../header-menu/header-menu';

/** Tipo de header: 'tradicional' usa app-header, 'desplegable' usa app-header-menu. */
export type HeaderMenuType = 'tradicional' | 'desplegable';

@Component({
  selector: 'app-header-page-section',
  imports: [HeaderSection, HeaderMenu],
  templateUrl: './header-page-section.html',
  styleUrl: './header-page-section.scss',
})
export class HeaderPageSection {
  public background = input.required<string>();
  public logo = input.required<string>();
  public color = input.required<string>();
  /** Conmuta entre `<app-header>` (tradicional) y `<app-header-menu>` (desplegable). */
  public menuType = input<HeaderMenuType>('tradicional');
}
