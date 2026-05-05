import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-menu.html',
  styleUrl: './header-menu.scss',
})
export class HeaderMenu {
  public logo = input.required<string>();

  public openNavbarMobile = false;

  openLogin(): void {
    if (typeof window === 'undefined') return;
    window.open('https://portalwebolivos.com/#/login/cali', '_blank', 'noopener');
  }

  openNavbar(): void {
    this.openNavbarMobile = !this.openNavbarMobile;
  }
}
