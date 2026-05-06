import { Component, input } from '@angular/core';

export interface Category {
  img: string;
  text: string;
  background: string;
}

@Component({
  selector: 'app-categories-grid',
  imports: [],
  templateUrl: './categories-grid.html',
  styleUrl: './categories-grid.scss',
})
export class CategoriesGrid {
  public categories = input.required<Category[]>();
  public columns = input<number>(6);
}
