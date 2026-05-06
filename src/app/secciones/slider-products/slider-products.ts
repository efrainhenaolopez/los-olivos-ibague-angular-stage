import { Component, computed, input, signal } from '@angular/core';

export interface SliderProduct {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  price?: string;
  img: string;
}

@Component({
  selector: 'app-slider-products',
  imports: [],
  templateUrl: './slider-products.html',
  styleUrl: './slider-products.scss',
})
export class SliderProducts {
  public products = input.required<SliderProduct[]>();

  readonly currentIndex = signal(0);

  readonly current = computed(() => {
    const list = this.products();
    return list[this.currentIndex() % list.length];
  });

  next(): void {
    const len = this.products().length;
    if (!len) return;
    this.currentIndex.update((i) => (i + 1) % len);
  }

  prev(): void {
    const len = this.products().length;
    if (!len) return;
    this.currentIndex.update((i) => (i - 1 + len) % len);
  }

  goTo(i: number): void {
    this.currentIndex.set(i);
  }
}
