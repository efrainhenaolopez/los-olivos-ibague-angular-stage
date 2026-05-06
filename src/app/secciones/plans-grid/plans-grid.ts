import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Plan {
  id: number;
  title: string;
  description: string;
  img: string;
  link: string;
}

@Component({
  selector: 'app-plans-grid',
  imports: [RouterLink],
  templateUrl: './plans-grid.html',
  styleUrl: './plans-grid.scss',
})
export class PlansGrid {
  public plans = input.required<Plan[]>();
}
