import { Component, input } from '@angular/core';
import { HeaderSection } from '../header/header';

@Component({
  selector: 'app-header-page-section',
  imports: [HeaderSection],
  templateUrl: './header-page-section.html',
  styleUrl: './header-page-section.scss',
})
export class HeaderPageSection {
  public background = input.required<string>();
  public logo = input.required<string>();
  public color = input.required<string>();
}
