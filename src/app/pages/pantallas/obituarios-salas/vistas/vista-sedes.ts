import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Obituario } from '../../../../servicios/obituarios';

interface SedeCard {
  id: number;
  nombre: string;
  count: number;
}

@Component({
  selector: 'app-vista-sedes',
  standalone: true,
  templateUrl: './vista-sedes.html',
  styleUrl: './vista-sedes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VistaSedes {
  readonly obituarios = input.required<Obituario[]>();

  readonly sedes = computed<SedeCard[]>(() => {
    const acc = new Map<number, SedeCard>();
    for (const o of this.obituarios()) {
      if (o.sedeId == null) continue;
      const prev = acc.get(o.sedeId);
      if (prev) {
        prev.count++;
      } else {
        acc.set(o.sedeId, {
          id: o.sedeId,
          nombre: o.sedeNombre ?? `Sede ${o.sedeId}`,
          count: 1,
        });
      }
    }
    return Array.from(acc.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  });
}
