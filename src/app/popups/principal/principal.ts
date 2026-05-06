import { NgStyle } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-principal',
  imports: [NgStyle],
  templateUrl: './principal.html',
  styleUrl: './principal.scss',
})
export class Principal {
  public close = output<boolean>();
  public backgroundHeader = input<string>('#00966c');

  closeModal(): void {
    this.close.emit(false);
  }
}
