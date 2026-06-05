import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { apiUrl } from './api-config';

/** Payload que el componente envía para crear una condolencia. */
export interface CondolenciaSubmit {
  obituarioId: number;
  autorNombre: string;
  autorEmail?: string;
  mensaje: string;
}

/** Respuesta al POST exitoso. */
export interface CondolenciaSubmitResponse {
  ok: true;
  id: number;
  message: string;
}

/** Condolencia aprobada que se muestra en la pared del obituario.
 *  El plugin no devuelve email/IP en el GET público (PII filtrada). */
export interface Condolencia {
  id: number;
  autorNombre: string;
  mensaje: string;
  fecha: string;
}

/** Error tipado del backend (mapea los códigos del plugin). */
export interface CondolenciaError {
  code: string;
  message: string;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class CondolenciasService {
  /** Envía una nueva condolencia (queda en `estado='pending'` hasta moderación). */
  submit(payload: CondolenciaSubmit): Observable<CondolenciaSubmitResponse> {
    return from(this.postCondolencia(payload));
  }

  /** Obtiene las condolencias aprobadas de un obituario para mostrar la pared. */
  getAprobadas(obituarioId: number): Observable<Condolencia[]> {
    return from(this.fetchAprobadas(obituarioId));
  }

  private async postCondolencia(p: CondolenciaSubmit): Promise<CondolenciaSubmitResponse> {
    const body = {
      obituario: p.obituarioId,
      autor_nombre: p.autorNombre,
      autor_email: p.autorEmail ?? '',
      mensaje: p.mensaje,
      website: '', // honeypot · el plugin acepta vacío y rechaza con contenido
    };
    const response = await fetch(apiUrl('/condolencias'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err: CondolenciaError = {
        code: data?.code ?? 'unknown_error',
        message: data?.message ?? `Error ${response.status}`,
        status: response.status,
      };
      throw err;
    }
    return data as CondolenciaSubmitResponse;
  }

  private async fetchAprobadas(obituarioId: number): Promise<Condolencia[]> {
    const response = await fetch(
      apiUrl(`/condolencias?obituario=${encodeURIComponent(obituarioId)}`),
      { method: 'GET', headers: { Accept: 'application/json' } },
    );
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const list = Array.isArray(data) ? data : (data?.condolencias ?? []);
    return list.map(mapCondolencia);
  }
}

function mapCondolencia(raw: Record<string, unknown>): Condolencia {
  const get = <T>(key: string): T | undefined => raw[key] as T | undefined;
  return {
    id: Number(get<string | number>('id')),
    autorNombre: get<string>('autor_nombre') ?? '',
    mensaje: get<string>('mensaje') ?? '',
    fecha: get<string>('fecha') ?? '',
  };
}
