import { Component, input, output } from '@angular/core';
import { FormularioContacto } from "../../secciones/formulario-contacto/formulario-contacto";
import { NgStyle } from '@angular/common';

@Component({
  selector: 'popup-linea-etica',
  imports: [NgStyle, FormularioContacto],
  templateUrl: './linea-etica.html',
  styleUrl: './linea-etica.scss',
})
export class LineaEtica {
  public close = output<boolean>();
  public backgroundHeader = input.required<string>()

  closeModal(){
    this.close.emit(false);
  }
}