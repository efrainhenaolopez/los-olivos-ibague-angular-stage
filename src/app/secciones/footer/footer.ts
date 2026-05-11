import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterSection {
  /** Color/imagen de fondo opcional para `.footer-bottom`. Si se omite queda transparente (caso bienvenido). */
  background = input<string>('');
}
