import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterSection } from '../footer/footer';

/**
 * Plantillas válidas: combinación territorio-variante (3 por territorio).
 *  - duelo:     'duelo-clasico' | 'duelo-moderno' | 'duelo-elegante'
 *  - prevision: 'prevision-coral' | 'prevision-energia' | 'prevision-natural'
 *  - vida:      'vida-vibrante' | 'vida-sunset' | 'vida-fresco'
 *
 * NOTA: este input se mantiene como informativo / API estable, pero
 * actualmente NO se refleja como [data-territory] en el host porque
 * eso dispararía las reglas territoriales de styles.scss y enmascararía
 * la paleta inline que la página padre (ej. nosotros) inyecta. Si se
 * usa standalone en el futuro, la página debe setear data-territory en
 * un ancestro (o inyectar las CSS vars inline).
 */
export type FooterTemplate =
  | 'duelo-clasico' | 'duelo-moderno' | 'duelo-elegante'
  | 'prevision-coral' | 'prevision-energia' | 'prevision-natural'
  | 'vida-vibrante' | 'vida-sunset' | 'vida-fresco'
  | '';

@Component({
  selector: 'app-content-footer',
  imports: [RouterLink, FooterSection],
  templateUrl: './content-footer.html',
  styleUrl: './content-footer.scss',
})
export class ContentFooter {
  /** Plantilla en formato "<territorio>-<variante>", p.ej. "duelo-moderno". */
  template = input<FooterTemplate>('');
}
