import { Component, input } from '@angular/core';

export interface Tribute {
  img: string;
  text: string;
  highlight?: string;
  small?: string;
}

@Component({
  selector: 'app-tributes-grid',
  imports: [],
  templateUrl: './tributes-grid.html',
  styleUrl: './tributes-grid.scss',
})
export class TributesGrid {
  public tributes = input.required<Tribute[]>();
}
