import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Obituario } from '../../../../servicios/obituarios';

type Scene = 'datos' | 'fotos' | 'mensaje';

/** Duración de cada escena en milisegundos. */
const SCENE_DURATIONS: Record<Scene, number> = {
  datos: 10_000,
  fotos: 6_000,
  mensaje: 6_000,
};

const SCENE_ORDER: Scene[] = ['datos', 'fotos', 'mensaje'];

const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Vista del obituario individual en una sala específica.
 *
 * Reproduce el ciclo de la plantilla Canva del cliente:
 * 1. **Datos** — "En memoria de" + cinta morada + nombre + sala + exequias + destino final
 * 2. **Fotos** — Hasta 3 polaroids con las fotos del fallecido
 * 3. **Mensaje** — "Honramos tu amor" entre 2 polaroids
 *
 * Las escenas se rotan automáticamente solo en browser (no SSR). El
 * polling de datos del padre actualiza el obituario; la animación
 * intra-escena se re-dispara con CSS transitions cuando cambia el data.
 */
@Component({
  selector: 'app-vista-obituario',
  standalone: true,
  templateUrl: './vista-obituario.html',
  styleUrl: './vista-obituario.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VistaObituario {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly obituarios = input.required<Obituario[]>();
  readonly sedeId = input.required<number>();
  readonly salaId = input.required<number>();

  /** Escena actualmente visible. */
  readonly currentScene = signal<Scene>('datos');

  readonly obituario = computed<Obituario | undefined>(() =>
    this.obituarios().find(
      (o) => o.sedeId === this.sedeId() && o.salaId === this.salaId(),
    ),
  );

  /** Fotos ordenadas (máximo 3 para las escenas). */
  readonly fotos = computed(() => {
    const o = this.obituario();
    if (!o?.fotos?.length) return [];
    return [...o.fotos].sort((a, b) => a.orden - b.orden).slice(0, 3);
  });

  /** Si no hay fotos, la rotación de escenas se simplifica a solo 'datos'. */
  readonly tieneFotos = computed(() => this.fotos().length > 0);

  readonly fechaExequias = computed(() => formatearFechaLarga(this.obituario()?.fechaHoraExequias));
  readonly horaExequias = computed(() => extraerHora(this.obituario()?.fechaHoraExequias));
  readonly fechaDestino = computed(() => formatearFechaLarga(this.obituario()?.horaDestinoFinal));
  readonly horaDestino = computed(() => this.obituario()?.horaDestinoFinal ?? '');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.startSceneRotation();
    }
  }

  private startSceneRotation() {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let idx = 0;

    const advance = () => {
      const scene = SCENE_ORDER[idx];
      this.currentScene.set(scene);
      timer = setTimeout(() => {
        // Si no hay fotos, saltar 'fotos' y 'mensaje' y quedarse en 'datos'.
        if (!this.tieneFotos()) {
          idx = 0;
        } else {
          idx = (idx + 1) % SCENE_ORDER.length;
        }
        advance();
      }, SCENE_DURATIONS[scene]);
    };

    advance();

    this.destroyRef.onDestroy(() => {
      if (timer) clearTimeout(timer);
    });
  }
}

/** Convierte "29/05/2026 - 14:00" o "29/05/2026" → "29 de Mayo de 2026". */
function formatearFechaLarga(s: string | undefined): string {
  if (!s) return '';
  const fechaPart = s.split(' - ')[0].trim();
  const m = fechaPart.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return fechaPart;
  const dia = parseInt(m[1], 10);
  const mes = MESES_ES[parseInt(m[2], 10) - 1] ?? m[2];
  return `${dia} de ${mes} de ${m[3]}`;
}

/** Extrae "14:00" de "29/05/2026 - 14:00". Tolera "2:00 p.m." sin prefijo. */
function extraerHora(s: string | undefined): string {
  if (!s) return '';
  const parts = s.split(' - ');
  return (parts[1] ?? '').trim();
}
