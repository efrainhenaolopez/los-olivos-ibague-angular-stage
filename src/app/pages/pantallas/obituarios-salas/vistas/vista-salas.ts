import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Obituario } from '../../../../servicios/obituarios';

interface SalaCard {
  id: number;
  nombre: string;
  ocupada: boolean;
  nombreFallecido?: string;
}

@Component({
  selector: 'app-vista-salas',
  standalone: true,
  templateUrl: './vista-salas.html',
  styleUrl: './vista-salas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VistaSalas {
  readonly obituarios = input.required<Obituario[]>();
  readonly sedeId = input.required<number>();

  /** Nombre de la sede (derivado del primer obituario de la sede). */
  readonly sedeNombre = computed<string>(() => {
    const first = this.obituarios().find((o) => o.sedeId === this.sedeId());
    return first?.sedeNombre ?? `Sede ${this.sedeId()}`;
  });

  readonly salas = computed<SalaCard[]>(() => {
    const acc = new Map<number, SalaCard>();
    for (const o of this.obituarios()) {
      if (o.sedeId !== this.sedeId() || o.salaId == null) continue;
      if (acc.has(o.salaId)) continue;
      acc.set(o.salaId, {
        id: o.salaId,
        nombre: o.salaNombre ?? `Sala ${o.salaId}`,
        ocupada: true,
        nombreFallecido: o.nombre,
      });
    }
    return Array.from(acc.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  });
}
