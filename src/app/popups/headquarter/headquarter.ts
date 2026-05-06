import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export interface HeadquarterImage {
  url: string;
  alt: string;
}

export interface HeadquarterData {
  name: string;
  imgs: HeadquarterImage[];
}

interface ServiceItem {
  img: string;
  text: string;
}

@Component({
  selector: 'app-headquarter',
  imports: [],
  templateUrl: './headquarter.html',
  styleUrl: './headquarter.scss',
})
export class Headquarter implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  public headquarter = input.required<HeadquarterData>();
  public close = output<boolean>();

  readonly currentSlide = signal(0);
  readonly images = computed(() => this.headquarter().imgs);

  readonly services: ServiceItem[] = [
    { img: '/img/icons-tributes/tribute-attendance.svg', text: 'Asistencia <br /><span>24/7</span>' },
    { img: '/img/icons-tributes/tribute-formalities.svg', text: 'Trámites <br /><span>Legales</span>' },
    { img: '/img/icons-tributes/tribute-transport.svg', text: 'Transporte del <br /><span>ser querido</span>' },
    { img: '/img/icons-tributes/tribute-presentation.svg', text: 'Presentación <br />del <span>ser querido</span>' },
    { img: '/img/icons-tributes/tribute-chest.svg', text: '<span>Cofre</span>' },
    { img: '/img/icons-tributes/tribute-arrangement.svg', text: 'Arreglo <br /><span>floral</span>' },
    { img: '/img/icons-tributes/tribute-cafe.svg', text: 'Servicio de <br />cafetería' },
    { img: '/img/icons-tributes/tribute-logistics.svg', text: 'Logística <br /><span>personalizada</span>' },
    { img: '/img/icons-tributes/tribute-rooms.svg', text: '<span>Salas</span> <br />de homenajes' },
    { img: '/img/icons-tributes/tribute-protocols.svg', text: 'Protocolos para <br /><span>el homenaje</span>' },
    { img: '/img/icons-tributes/tribute-honors.svg', text: 'Honras <br /><span>fúnebres</span>' },
    { img: '/logos/logo_olivos_color.svg', text: 'Los Olivos' },
  ];

  private intervalId: number | undefined;

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
    }
  }

  closeModal(): void {
    this.close.emit(false);
  }

  next(): void {
    this.currentSlide.update((i) => (i + 1) % this.images().length);
    this.cdr.markForCheck();
  }

  prev(): void {
    const len = this.images().length;
    this.currentSlide.update((i) => (i - 1 + len) % len);
    this.cdr.markForCheck();
  }

  setSlide(i: number): void {
    this.currentSlide.set(i);
    this.restartAutoSlide();
    this.cdr.markForCheck();
  }

  private startAutoSlide(): void {
    if (typeof window === 'undefined') return;
    this.intervalId = window.setInterval(() => {
      this.next();
    }, 5000);
  }

  private restartAutoSlide(): void {
    if (this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
    }
    this.startAutoSlide();
  }
}
