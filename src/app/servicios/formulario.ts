import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ContactoPayload {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  page: string;
  recaptchaToken: string;
}

interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FormularioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://backendcali.losolivos.co/script.php';

  sendFormData(data: ContactoPayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
