import { Component, input } from '@angular/core';

@Component({
  selector: 'app-header-page',
  imports: [],
  templateUrl: './header-page.html',
  styleUrl: './header-page.scss',
})
export class HeaderPage {

  public background = input.required<string>();
}

