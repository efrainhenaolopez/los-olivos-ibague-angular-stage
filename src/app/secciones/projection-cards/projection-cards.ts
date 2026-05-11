import { Component, input } from '@angular/core';

/** Una flip card del grid de proyección (M·V·P u otras tríadas de valores). */
export interface ProjectionCard {
  /** Identificador único usado para el track en el @for. */
  id: string;
  /** Texto pequeño encima del título (ej. "Política de"). Opcional. */
  subtitle?: string;
  /** Palabra principal en grande, dentro de la forma orgánica (ej. "Misión"). */
  title: string;
  /** Título completo mostrado al voltear el card (ej. "Política de calidad"). */
  backTitle: string;
  /** Descripción justificada que aparece al voltear. */
  description: string;
  /** URL de la imagen de fondo del front. */
  image: string;
  /** aria-label del article (accesibilidad / lectores de pantalla). */
  ariaLabel: string;
}

@Component({
  selector: 'app-projection-cards',
  imports: [],
  templateUrl: './projection-cards.html',
  styleUrl: './projection-cards.scss',
})
export class ProjectionCards {
  /** Array de cards a renderizar (típicamente 3: Misión, Visión, Política). */
  cards = input.required<ProjectionCard[]>();
}
