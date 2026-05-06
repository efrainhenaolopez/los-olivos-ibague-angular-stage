import { Component, input, output } from '@angular/core';

export interface TributeProtocol {
  id: number | string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-tributes',
  imports: [],
  templateUrl: './tributes.html',
  styleUrl: './tributes.scss',
})
export class Tributes {
  public protocol = input.required<TributeProtocol>();
  public close = output<boolean>();

  closeModal(): void {
    this.close.emit(false);
  }
}
