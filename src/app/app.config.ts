import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      })
    ),
    // NOTA: no usamos `provideHttpClient` porque dispara el guardia
    // SSRF de Angular SSR al servir las rutas (rechaza URLs con
    // hostname `localhost`, hace fallback a CSR para TODAS las páginas
    // y rompe el routing). Para llamadas HTTP usamos `fetch()` nativo
    // dentro de los servicios — funciona en navegador y SSR.
    provideClientHydration(withEventReplay())
  ]
};
