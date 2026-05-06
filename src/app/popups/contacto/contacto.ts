import { NgStyle } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormularioContacto } from '../../secciones/formulario-contacto/formulario-contacto';

@Component({
  selector: 'app-contacto',
  imports: [NgStyle, FormularioContacto],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss',
})
export class Contacto {
  public close = output<boolean>();
  public backgroundHeader = input<string>('#f5821f');
  public demoMode = input<boolean>(false);

  closeModal(): void {
    this.close.emit(false);
  }
}
