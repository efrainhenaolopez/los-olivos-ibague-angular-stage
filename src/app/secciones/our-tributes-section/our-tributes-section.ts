import { Component, output } from '@angular/core';

@Component({
  selector: 'app-our-tributes-section',
  imports: [],
  templateUrl: './our-tributes-section.html',
  styleUrl: './our-tributes-section.scss',
})
export class OurTributesSection {
  public phoneClick = output<void>();
}
