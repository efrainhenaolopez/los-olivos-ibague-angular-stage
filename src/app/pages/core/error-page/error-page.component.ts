import { Component, OnInit, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderSection } from '../../../secciones/header/header';

interface ErrorConfig {
  code: number;
  heading: string;
  message: string;
  pageTitle: string;
  metaDescription: string;
}

const ERROR_CONFIGS: Record<number, Omit<ErrorConfig, 'code'>> = {
  400: {
    pageTitle: 'Solicitud incorrecta (400) | Los Olivos Tolima',
    heading: 'Solicitud incorrecta',
    message: 'La solicitud no pudo procesarse. Verifica la información e intenta nuevamente.',
    metaDescription: 'Error 400 - Solicitud incorrecta en Los Olivos Tolima.',
  },
  401: {
    pageTitle: 'No autorizado (401) | Los Olivos Tolima',
    heading: 'Acceso no autorizado',
    message: 'Necesitas autenticarte para acceder a este recurso.',
    metaDescription: 'Error 401 - Acceso no autorizado en Los Olivos Tolima.',
  },
  403: {
    pageTitle: 'Acceso denegado (403) | Los Olivos Tolima',
    heading: 'Acceso denegado',
    message: 'No tienes permisos para ver esta página.',
    metaDescription: 'Error 403 - Acceso denegado en Los Olivos Tolima.',
  },
  404: {
    pageTitle: 'Página no encontrada (404) | Los Olivos Tolima',
    heading: 'Página no encontrada',
    message: 'La página que buscas no existe o fue movida. Vuelve al inicio y encuentra los servicios funerarios de Los Olivos Tolima.',
    metaDescription: 'Error 404 - Página no encontrada en Los Olivos Tolima. Vuelve al inicio para conocer nuestros servicios funerarios.',
  },
  500: {
    pageTitle: 'Error del servidor (500) | Los Olivos Tolima',
    heading: 'Error interno del servidor',
    message: 'Ocurrió un error inesperado. Por favor intenta de nuevo más tarde.',
    metaDescription: 'Error 500 - Error interno del servidor en Los Olivos Tolima.',
  },
  503: {
    pageTitle: 'Servicio no disponible (503) | Los Olivos Tolima',
    heading: 'Servicio no disponible',
    message: 'El servicio está temporalmente fuera de línea. Intenta de nuevo en unos minutos.',
    metaDescription: 'Error 503 - Servicio no disponible en Los Olivos Tolima.',
  },
};

const DEFAULT_CONFIG = ERROR_CONFIGS[404];

@Component({
  selector: 'app-error-page',
  imports: [RouterLink, HeaderSection],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
})
export class ErrorPageComponent implements OnInit {
  private titleService = inject(Title);
  private meta = inject(Meta);
  private route = inject(ActivatedRoute);

  errorConfig: ErrorConfig = { code: 404, ...DEFAULT_CONFIG };

  ngOnInit(): void {
    const code = (this.route.snapshot.data['code'] as number) ?? 404;
    const config = ERROR_CONFIGS[code] ?? DEFAULT_CONFIG;

    this.errorConfig = { code, ...config };

    this.titleService.setTitle(config.pageTitle);
    this.meta.updateTag({ name: 'description', content: config.metaDescription });
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }
}
