import { Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RecaptchaService } from '../../servicios/recaptcha';
import { ContactoPayload, FormularioService } from '../../servicios/formulario';

interface Notificacion {
  title: string;
  message: string;
  background: string;
}

@Component({
  selector: 'app-formulario-contacto',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './formulario-contacto.html',
  styleUrl: './formulario-contacto.scss',
})
export class FormularioContacto {
  readonly tipoFormulario = input.required<string>();

  private readonly fb = inject(FormBuilder);
  private readonly formularioService = inject(FormularioService);
  private readonly recaptcha = inject(RecaptchaService);

  readonly formulario = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  enviando = false;
  modalNotification = false;
  notificacion: Notificacion | null = null;

  async onSubmit(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mostrarError();
      return;
    }

    this.enviando = true;
    const token = await this.recaptcha.execute('contacto');
    const { name, lastName, phone, email, message } = this.formulario.value;

    const data: ContactoPayload = {
      name: name ?? '',
      lastName: lastName ?? '',
      phone: phone ?? '',
      email: email ?? '',
      message: message ?? '',
      page: this.tipoFormulario(),
      recaptchaToken: token,
    };

    this.formularioService.sendFormData(data).subscribe({
      next: (response) => {
        this.enviando = false;
        if (response.status === 'success') {
          this.formulario.reset();
          this.mostrarExito();
        } else {
          this.mostrarError();
        }
      },
      error: () => {
        this.enviando = false;
        this.mostrarError();
      },
    });
  }

  closeModal(): void {
    this.modalNotification = false;
  }

  private mostrarExito(): void {
    this.notificacion = {
      title: 'Formulario enviado correctamente',
      message: 'Muy pronto, uno de nuestros asesores se comunicará contigo. Muchas gracias por contactarnos.',
      background: '#699392',
    };
    this.modalNotification = true;
  }

  private mostrarError(): void {
    this.notificacion = {
      title: 'Error al enviar el formulario',
      message: 'Por favor, asegúrate de completar todos los campos requeridos antes de intentarlo nuevamente.',
      background: '#d34848',
    };
    this.modalNotification = true;
  }
}
