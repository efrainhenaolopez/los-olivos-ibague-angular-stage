import { Component, input } from '@angular/core';

@Component({
  selector: 'app-header-page-menu',
  imports: [],
  templateUrl: './header-page-menu.html',
  styleUrl: './header-page-menu.scss',
})
export class HeaderPageMenu {

  public background = input.required<string>();

}
