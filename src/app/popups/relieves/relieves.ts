import { Component, output } from '@angular/core';

@Component({
  selector: 'app-relieves',
  imports: [],
  templateUrl: './relieves.html',
  styleUrl: './relieves.scss',
})
export class Relieves {
  public close = output<boolean>();

  closeModal(): void {
    this.close.emit(false);
  }
}
