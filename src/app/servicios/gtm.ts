import { Injectable } from '@angular/core';

/**
 * Contrato de un evento enviado al dataLayer de GTM.
 * Se usa Record<string, unknown> en lugar de `any` para mantener
 * compatibilidad con la estructura abierta de GTM sin perder type-safety.
 */
export type GtmEvent = Record<string, unknown>;

// Extiende Window para que TypeScript reconozca dataLayer sin casting.
declare global {
  interface Window {
    dataLayer: GtmEvent[];
  }
}

/**
 * Servicio centralizado para Google Tag Manager.
 *
 * REGLA: Todo tracking del sitio debe pasar por este servicio.
 * No insertar scripts GTM directamente en el HTML ni duplicar gtm.start
 * (el dataLayer inicial ya se inicializa en index.html).
 */
@Injectable({
  providedIn: 'root',
})
export class GtmService {
  private readonly gtmId = 'GTM-WQZ34CBV';

  // Evita cargar el script más de una vez en navegaciones SPA.
  private loaded = false;

  /**
   * Inyecta el script de GTM en el <head>.
   * Solo ejecuta en el navegador; es no-op en SSR.
   * Debe llamarse una única vez desde App.ngOnInit.
   */
  load(): void {
    if (typeof window === 'undefined' || this.loaded) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${this.gtmId}`;
    document.head.appendChild(script);

    this.loaded = true;
  }

  /**
   * Empuja un evento al dataLayer de GTM.
   * Solo ejecuta en el navegador; es no-op en SSR.
   *
   * @param event - Objeto con al menos la propiedad `event` para GTM.
   */
  push(event: GtmEvent): void {
    if (typeof window === 'undefined') return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  }

  /**
   * Registra un page_view manual.
   * Necesario en SPAs porque GTM no detecta cambios de ruta automáticamente.
   *
   * @param url - Ruta de la página, ej. '/bienestar-integral'.
   */
  trackPageView(url: string): void {
    this.push({ event: 'page_view', page_path: url });
  }
}
