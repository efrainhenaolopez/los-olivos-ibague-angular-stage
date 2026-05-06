import { NgStyle } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-lineas',
  imports: [NgStyle],
  templateUrl: './lineas.html',
  styleUrl: './lineas.scss',
})
export class Lineas {
  public close = output<boolean>();
  public backgroundHeader = input<string>('#00966c');

  closeModal(): void {
    this.close.emit(false);
  }
}
