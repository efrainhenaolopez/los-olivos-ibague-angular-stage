import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { interval, startWith, switchMap } from 'rxjs';

import { ObituariosService, Obituario } from '../../../servicios/obituarios';

interface SedeCard {
  id: number;
  nombre: string;
  count: number;
}

const POLL_MS = 60_000;

/**
 * Pantalla de recepción · LANDSCAPE.
 *
 * Sin queryparam → selector de sedes (grid).
 * Con `?sede=N`  → lobby tipo tablero con todos los obituarios vigentes
 *                  de esa sede (réplica del screenshot del cliente).
 */
@Component({
  selector: 'app-obituarios-recepcion',
  standalone: true,
  templateUrl: './obituarios-recepcion.html',
  styleUrl: './obituarios-recepcion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-territory]': "'duelo'",
    '[attr.data-template]': "'duelo-clasico'",
    '[style.--color-primary]': "'#1f2c4a'",
    '[style.--color-secondary]': "'#8a9a96'",
    '[style.--color-accent]': "'#a94d69'",
    '[style.--color-cta]': "'#f0a33d'",
    '[style.--color-bg-light]': "'#f5efe6'",
    '[style.--color-bg-row]': "'#ece4d4'",
  },
})
export class ObituariosRecepcion {
  private readonly service = inject(ObituariosService);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly obituarios = signal<Obituario[]>([]);

  private readonly qp = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly sedeId = computed(() => {
    const raw = this.qp().get('sede');
    return raw ? Number(raw) : null;
  });

  readonly view = computed<'selector' | 'lobby'>(() =>
    this.sedeId() != null ? 'lobby' : 'selector',
  );

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

  /** Obituarios vigentes filtrados por sede. */
  readonly obituariosDeSede = computed<Obituario[]>(() => {
    const id = this.sedeId();
    if (id == null) return [];
    return this.obituarios().filter((o) => o.sedeId === id);
  });

  readonly sedeNombre = computed<string>(() => {
    const id = this.sedeId();
    if (id == null) return '';
    const first = this.obituarios().find((o) => o.sedeId === id);
    return first?.sedeNombre ?? `Sede ${id}`;
  });

  constructor() {
    this.title.setTitle('Recepción · Los Olivos');
    this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });

    this.service.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((list) => {
      this.obituarios.set(list);
    });

    if (isPlatformBrowser(this.platformId)) {
      interval(POLL_MS)
        .pipe(
          startWith(0),
          switchMap(() => this.service.getAll()),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((list) => this.obituarios.set(list));
    }
  }
}
