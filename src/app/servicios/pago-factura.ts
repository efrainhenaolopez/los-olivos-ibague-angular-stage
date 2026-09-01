import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { apiUrl } from './api-config';

/**
 * Cliente del proxy de pagos alojado en el plugin WordPress
 * `los-olivos-ibague` (endpoint `POST /serfuncoop/v1/payment-login`).
 *
 * El sitio Angular se publica estático, así que las credenciales de la
 * pasarela pública (Olivos Web Gateway) NUNCA llegan al bundle: viven
 * server-side en WordPress. Este servicio solo dispara el POST; el plugin
 * proxyea contra la pasarela y devuelve un JSON con `response.url` (enlace
 * firmado con JWT temporal) que el componente abre en una pestaña nueva.
 *
 * Se usa `fetch()` nativo (no `HttpClient`) por la misma razón que el resto
 * de servicios del proyecto — ver nota en `app.config.ts`.
 */

/**
 * Forma del JSON devuelto por el endpoint. El plugin reenvía 1:1 lo que
 * responde la pasarela, así que cubrimos el formato de éxito
 * (`success` + `response.url`) y el de error (`status` + `title` + `errors`).
 */
export interface PagoLoginResponse {
  success?: boolean;
  status?: number;
  /** Solo presente en éxito: `url` con JWT temporal para abrir la pasarela. */
  response?: { url: string } | null;
  errors?: string[] | null;
  title?: string;
  /** Código del plugin cuando el rechazo es local (ej. `olvibg_origin_forbidden`). */
  code?: string;
}

@Injectable({ providedIn: 'root' })
export class PagoFacturaService {
  private readonly endpoint = apiUrl('/payment-login');

  /**
   * Solicita una sesión de pago al proxy de WordPress.
   *
   * WordPress reintenta ante el cold-start de Azure, así que la latencia
   * percibida puede llegar a ~25 s. El componente que consume este Observable
   * debe mostrar un indicador de carga.
   */
  iniciarLogin(): Observable<PagoLoginResponse> {
    return from(this.postLogin());
  }

  private async postLogin(): Promise<PagoLoginResponse> {
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ website: '' }), // honeypot vacío
      });
      const json = (await res.json().catch(() => ({}))) as PagoLoginResponse;
      if (!res.ok && json.success === undefined) {
        json.success = false;
        json.status = res.status;
      }
      return json;
    } catch (e) {
      return {
        success: false,
        code: 'network_error',
        errors: [e instanceof Error ? e.message : 'Error de red'],
      };
    }
  }
}
