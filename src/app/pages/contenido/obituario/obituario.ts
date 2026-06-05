import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderPageSection } from '../../../secciones/header-page-section/header-page-section';
import { ContentFooter, type FooterTemplate } from '../../../secciones/content-footer/content-footer';
import { TributeSection } from '../../../secciones/tribute-section/tribute-section';
import { GtmService } from '../../../servicios/gtm';
import { ObituariosService, type Obituario as ObituarioModel } from '../../../servicios/obituarios';
import {
  CondolenciasService,
  type Condolencia,
} from '../../../servicios/condolencias';

const DEFAULT_TEMPLATE: FooterTemplate = 'duelo-clasico';

@Component({
  selector: 'app-obituario',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    HeaderPageSection,
    ContentFooter,
    TributeSection,
  ],
  templateUrl: './obituario.html',
  styleUrl: './obituario.scss',
  host: {
    '[attr.data-territory]': '"duelo"',
    '[attr.data-template]': '"clasico"',
    '[style.--color-primary]': '"#234b50"',
    '[style.--color-secondary]': '"#477A7B"',
    '[style.--color-accent]': '"#A94D69"',
    '[style.--color-cta]': '"#A94D69"',
    '[style.--color-bg-light]': '"#EDF5F7"',
  },
})
export class Obituario implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly route = inject(ActivatedRoute);
  private readonly gtm = inject(GtmService);
  private readonly obituariosService = inject(ObituariosService);
  private readonly condolenciasService = inject(CondolenciasService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeTemplate = signal<FooterTemplate>(DEFAULT_TEMPLATE);

  readonly obituarioId = signal<number | null>(null);
  readonly obituario = signal<ObituarioModel | null>(null);
  readonly condolencias = signal<Condolencia[]>([]);

  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly noEncontrado = signal<boolean>(false);

  readonly enviando = signal<boolean>(false);
  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  readonly fotoPrincipal = computed<string | null>(() => {
    const fotos = this.obituario()?.fotos;
    if (!fotos || fotos.length === 0) return null;
    const ordenadas = [...fotos].sort((a, b) => a.orden - b.orden);
    return ordenadas[0].url;
  });

  readonly formulario = this.fb.group({
    autorNombre: ['', Validators.required],
    autorEmail: ['', Validators.email],
    mensaje: ['', [Validators.required, Validators.minLength(8)]],
    website: [''], // honeypot
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const idRaw = params.get('id');
      const id = idRaw ? Number(idRaw) : NaN;
      if (!Number.isFinite(id) || id <= 0) {
        this.noEncontrado.set(true);
        this.loading.set(false);
        this.title.setTitle('Obituario no disponible · Los Olivos Tolima');
        return;
      }
      this.obituarioId.set(id);
      this.loadObituario(id);
      this.loadCondolencias(id);
    });
  }

  private loadObituario(id: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.noEncontrado.set(false);
    const sub = this.obituariosService.getAll().subscribe({
      next: (lista) => {
        const match = lista.find((o) => Number(o.id) === id);
        if (!match) {
          this.noEncontrado.set(true);
          this.obituario.set(null);
          this.title.setTitle('Obituario no disponible · Los Olivos Tolima');
        } else {
          this.obituario.set(match);
          this.updateMeta(match);
          this.gtm.push({
            event: 'obituario_view',
            obituario_id: match.id,
            obituario_slug: match.slug,
            page: '/obituario',
          });
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'No pudimos cargar este obituario. Intenta nuevamente en unos segundos.',
        );
        this.loading.set(false);
      },
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private loadCondolencias(id: number): void {
    const sub = this.condolenciasService.getAprobadas(id).subscribe({
      next: (lista) => this.condolencias.set(lista),
      error: () => this.condolencias.set([]),
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private updateMeta(o: ObituarioModel): void {
    this.title.setTitle(`${o.nombre} · Obituario · Los Olivos Tolima`);
    const descParts = [
      `En memoria de ${o.nombre}.`,
      o.sedeYSala ? `Homenaje en ${o.sedeYSala}.` : '',
      o.fechaHoraExequias ? `Exequias: ${o.fechaHoraExequias}.` : '',
    ].filter(Boolean);
    this.meta.updateTag({ name: 'description', content: descParts.join(' ') });
  }

  onSubmitCondolencia(): void {
    this.mensajeError.set(null);
    this.mensajeExito.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensajeError.set(
        'Por favor completa tu nombre y mensaje antes de enviar.',
      );
      return;
    }

    const id = this.obituarioId();
    if (!id) return;

    this.enviando.set(true);
    const { autorNombre, autorEmail, mensaje } = this.formulario.value;

    this.condolenciasService
      .submit({
        obituarioId: id,
        autorNombre: (autorNombre ?? '').trim(),
        autorEmail: autorEmail?.trim() || undefined,
        mensaje: (mensaje ?? '').trim(),
      })
      .subscribe({
        next: (response) => {
          this.enviando.set(false);
          this.mensajeExito.set(
            response.message ?? 'Tu condolencia será revisada antes de publicarse.',
          );
          this.formulario.reset({ autorNombre: '', autorEmail: '', mensaje: '', website: '' });
          this.gtm.push({
            event: 'condolencia_submit',
            obituario_id: id,
            page: '/obituario',
          });
        },
        error: (err) => {
          this.enviando.set(false);
          this.mensajeError.set(this.traducirError(err?.code) || 'No pudimos enviar tu mensaje. Intenta nuevamente.');
        },
      });
  }

  private traducirError(code?: string): string | null {
    switch (code) {
      case 'olvibg_missing_fields':
        return 'Faltan campos obligatorios.';
      case 'olvibg_invalid_email':
        return 'El correo no es válido.';
      case 'olvibg_obituario_not_found':
        return 'Este obituario ya no está disponible.';
      case 'olvibg_rate_limited':
        return 'Has enviado demasiadas condolencias en poco tiempo. Intenta en unos minutos.';
      case 'olvibg_origin_forbidden':
        return 'Origen no autorizado. Contacta al administrador del sitio.';
      default:
        return null;
    }
  }

  onContactPhoneClick(): void {
    this.gtm.push({ event: 'tribute_section_phone_click', page: '/obituario' });
  }
}
