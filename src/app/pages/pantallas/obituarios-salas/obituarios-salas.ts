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
import { VistaSedes } from './vistas/vista-sedes';
import { VistaSalas } from './vistas/vista-salas';
import { VistaObituario } from './vistas/vista-obituario';

const POLL_MS = 60_000;

@Component({
  selector: 'app-obituarios-salas',
  standalone: true,
  imports: [VistaSedes, VistaSalas, VistaObituario],
  templateUrl: './obituarios-salas.html',
  styleUrl: './obituarios-salas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-territory]': "'duelo'",
    '[attr.data-template]': "'duelo-clasico'",
    '[style.--color-primary]': "'#234b50'",
    '[style.--color-secondary]': "'#8a9a96'",
    '[style.--color-accent]': "'#a94d69'",
    '[style.--color-cta]': "'#f0a33d'",
    '[style.--color-bg-light]': "'#f5efe6'",
  },
})
export class ObituariosSalas {
  private readonly service = inject(ObituariosService);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  /** Lista actualizada vía polling (solo en browser). */
  readonly obituarios = signal<Obituario[]>([]);

  /** Queryparams reactivos. */
  private readonly qp = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly sedeId = computed(() => {
    const raw = this.qp().get('sede');
    return raw ? Number(raw) : null;
  });

  readonly salaId = computed(() => {
    const raw = this.qp().get('sala');
    return raw ? Number(raw) : null;
  });

  /** Vista a renderizar: 'sedes' | 'salas' | 'obituario'. */
  readonly view = computed<'sedes' | 'salas' | 'obituario'>(() => {
    if (this.salaId() != null) return 'obituario';
    if (this.sedeId() != null) return 'salas';
    return 'sedes';
  });

  constructor() {
    this.title.setTitle('Pantalla de salas · Los Olivos');
    this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });

    // Carga inicial inmediata; el polling solo arranca en el browser.
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
