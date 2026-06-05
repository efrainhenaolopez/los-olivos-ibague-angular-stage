import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { apiUrl } from './api-config';

/**
 * Payload que el componente envía al servicio. Los nombres siguen
 * la convención que ya usa [formulario-contacto.ts] (camelCase, en
 * inglés en algunos campos por compatibilidad con el componente
 * existente). El servicio se encarga de mapear al shape snake_case
 * que el endpoint POST /contacto del plugin WP espera.
 */
export interface ContactoPayload {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  page: string;
  recaptchaToken?: string;
  cedula?: string;
  servicio?: string;
}

export interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  /** Código del plugin cuando hay error (ej. `olvibg_missing_fields`). */
  code?: string;
}

@Injectable({ providedIn: 'root' })
export class FormularioService {
  private readonly endpoint = apiUrl('/contacto');

  sendFormData(data: ContactoPayload): Observable<ApiResponse> {
    return from(this.postContacto(data));
  }

  private async postContacto(data: ContactoPayload): Promise<ApiResponse> {
    const body = {
      nombre: data.name,
      apellido: data.lastName,
      cedula: data.cedula ?? '',
      telefono: data.phone,
      correo: data.email,
      servicio: data.servicio ?? '',
      mensaje: data.message,
      pagina: data.page,
      // El usuario acepta el tratamiento de datos al usar el formulario;
      // el texto legal está visible debajo de los inputs (ver template).
      aceptaTratamientoDatos: true,
      recaptcha_token: data.recaptchaToken ?? '',
      website: '', // honeypot
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('[FormularioService] POST /contacto fail', {
          status: response.status,
          code: json?.code,
          message: json?.message,
          endpoint: this.endpoint,
        });
        return {
          status: 'error',
          code: json?.code,
          message: json?.message ?? `Error ${response.status}`,
        };
      }
      // Plugin responde { ok: true, id: N }
      return { status: 'success' };
    } catch (e) {
      console.error('[FormularioService] POST /contacto threw (probable CORS preflight block)', e, {
        endpoint: this.endpoint,
      });
      return {
        status: 'error',
        code: 'network_error',
        message: e instanceof Error ? e.message : 'Error de red',
      };
    }
  }
}
