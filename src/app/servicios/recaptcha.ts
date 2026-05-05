import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

declare global {
  interface Window {
    grecaptcha: {
      ready(cb: () => void): void;
      execute(siteKey: string, options: { action: string }): Promise<string>;
    };
  }
}

/**
 * Servicio centralizado para reCAPTCHA v3 (invisible).
 *
 * REGLA: Todo uso de reCAPTCHA debe pasar por este servicio.
 * El script se carga una sola vez de forma dinámica y solo en el navegador.
 * En SSR el servicio es no-op: los tokens se validan siempre en el servidor.
 *
 * SETUP:
 * 1. Registrar el sitio en https://www.google.com/recaptcha/admin
 * 2. Reemplazar RECAPTCHA_SITE_KEY por la clave pública (v3) del proyecto.
 * 3. En el backend, validar el token contra la API de Google con la clave secreta.
 */

@Injectable({
  providedIn: 'root',
})
export class RecaptchaService {
  private readonly siteKey = '6LfU4-YqAAAAAKliFTOlDRPb3r1hiQRveJLeNo2K';
  private readonly document = inject(DOCUMENT);

  private loaded = false;
  private readyPromise: Promise<void> | null = null;

  /**
   * Carga el script de reCAPTCHA v3 una sola vez.
   * Solo ejecuta en el navegador; es no-op en SSR.
   */
  private load(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;

    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    if (this.loaded) {
      return new Promise<void>((resolve) => window.grecaptcha.ready(resolve));
    }

    this.readyPromise = new Promise<void>((resolve) => {
      const script = this.document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.loaded = true;
        window.grecaptcha.ready(resolve);
      };
      this.document.head.appendChild(script);
    });

    return this.readyPromise;
  }

  /**
   * Genera un token de reCAPTCHA v3 para la acción indicada.
   * Devuelve cadena vacía en SSR (sin navegador).
   *
   * @param action - Identificador de la acción, ej. 'contacto', 'cotizacion'.
   *                 Solo letras, dígitos, barras y guiones bajos (máx. 100 chars).
   * @returns Token para validar en el backend. Cadena vacía en SSR.
   */
  async execute(action: string): Promise<string> {
    if (typeof window === 'undefined') return '';

    await this.load();
    return window.grecaptcha.execute(this.siteKey, { action });
  }
}
