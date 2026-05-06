import { Component, output } from '@angular/core';

@Component({
  selector: 'app-tribute-section',
  imports: [],
  templateUrl: './tribute-section.html',
  styleUrl: './tribute-section.scss',
})
export class TributeSection {
  public phoneClick = output<void>();
}
