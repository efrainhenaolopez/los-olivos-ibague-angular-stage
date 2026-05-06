import { Component, input, output } from '@angular/core';

export interface FuneralPlan {
  id: number | string;
  title: string;
  content: string;
  coverages: string;
  button: boolean;
}

@Component({
  selector: 'app-funeral-plans',
  imports: [],
  templateUrl: './funeral-plans.html',
  styleUrl: './funeral-plans.scss',
})
export class FuneralPlans {
  public plan = input.required<FuneralPlan>();
  public close = output<boolean>();

  closeModal(): void {
    this.close.emit(false);
  }
}
