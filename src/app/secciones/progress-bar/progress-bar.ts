import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class ProgressBar {
  public total = input<number>(4);
  public filled = input<number>(1);

  readonly segments = computed(() =>
    Array.from({ length: this.total() }, (_, i) => i < this.filled()),
  );
}
