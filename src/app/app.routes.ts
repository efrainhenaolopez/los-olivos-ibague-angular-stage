import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta principal
  {
    path: '',
    loadComponent: () =>
      import('./pages/core/bienvenido/bienvenido.component').then((m) => m.BienvenidoComponent),
  },
  {
    path: 'bienvenido-menu',
    loadComponent: () =>
      import('./pages/core/bienvenido-menu/bienvenido-menu.component').then((m) => m.BienvenidoMenuComponent),
  },

  // Core
  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/core/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'ux',
    loadComponent: () =>
      import('./pages/core/ux/ux').then((m) => m.Ux),
  },
  {
    path: 'page-menu',
    loadComponent: () =>
      import('./pages/core/page-menu/page-menu').then((m) => m.PageMenu),
  },
  {
    path: 'nosotros',
    loadComponent: () =>
      import('./pages/core/nosotros/nosotros').then((m) => m.Nosotros),
  },

  // Duelo
  {
    path: 'servicio-funerario',
    loadComponent: () =>
      import('./pages/duelo/servicio-funerario/servicio-funerario').then((m) => m.ServicioFunerario),
  },
  {
    path: 'cremacion',
    loadComponent: () =>
      import('./pages/duelo/cremacion/cremacion').then((m) => m.Cremacion),
  },
  {
    path: 'parque-cementerio',
    loadComponent: () =>
      import('./pages/duelo/parque-cementerio/parque-cementerio').then((m) => m.ParqueCementerio),
  },
  {
    path: 'apoyo-al-duelo',
    loadComponent: () =>
      import('./pages/duelo/apoyo-al-duelo/apoyo-al-duelo').then((m) => m.ApoyoAlDuelo),
  },
  {
    path: 'taller-de-duelo',
    loadComponent: () =>
      import('./pages/duelo/taller-de-duelo/taller-de-duelo').then((m) => m.TallerDeDuelo),
  },
  {
    path: 'velacion-virtual',
    loadComponent: () =>
      import('./pages/duelo/velacion-virtual/velacion-virtual').then((m) => m.VelacionVirtual),
  },

  // Previsión
  {
    path: 'prevision',
    loadComponent: () =>
      import('./pages/prevision/overview/overview').then((m) => m.Overview),
  },
  {
    path: 'microseguros',
    loadComponent: () =>
      import('./pages/prevision/microseguros/microseguros').then((m) => m.Microseguros),
  },
  {
    path: 'planes-individuales',
    loadComponent: () =>
      import('./pages/prevision/planes/individuales/individuales').then((m) => m.Individuales),
  },
  {
    path: 'planes-empresariales',
    loadComponent: () =>
      import('./pages/prevision/planes/empresariales/empresariales').then((m) => m.Empresariales),
  },
  {
    path: 'prenecesidad',
    loadComponent: () =>
      import('./pages/prevision/prenecesidad/prenecesidad').then((m) => m.Prenecesidad),
  },

  // Contenido
  {
    path: 'obituarios',
    loadComponent: () =>
      import('./pages/contenido/obituarios/obituarios').then((m) => m.Obituarios),
  },
  {
    path: 'condolencias',
    loadComponent: () =>
      import('./pages/contenido/condolencias/condolencias').then((m) => m.Condolencias),
  },
  {
    path: 'conmemoraciones',
    loadComponent: () =>
      import('./pages/contenido/conmemoraciones/conmemoraciones').then((m) => m.Conmemoraciones),
  },
  {
    path: 'palabras-de-amor',
    loadComponent: () =>
      import('./pages/contenido/palabras-de-amor/palabras-de-amor').then((m) => m.PalabrasDeAmor),
  },

  // Contacto
  {
    path: 'contacto',
    loadComponent: () =>
      import('./pages/contacto/contacto/contacto').then((m) => m.Contacto),
  },

  // Sedes
  {
    path: 'sedes',
    loadComponent: () =>
      import('./pages/sedes/listado/listado').then((m) => m.Listado),
  },

  // Legal
  {
    path: 'tratamiento-datos',
    loadComponent: () =>
      import('./pages/legal/tratamiento-datos/tratamiento-datos').then((m) => m.TratamientoDatos),
  },
  {
    path: 'gestion-financiera',
    loadComponent: () =>
      import('./pages/legal/gestion-financiera/gestion-financiera').then((m) => m.GestionFinanciera),
  },

  // Utilidades
  {
    path: 'pagos',
    loadComponent: () =>
      import('./pages/utilidades/pagos/pagos').then((m) => m.Pagos),
  },
  {
    path: 'registros-defuncion',
    loadComponent: () =>
      import('./pages/utilidades/registros-defuncion/registros-defuncion').then((m) => m.RegistrosDefuncion),
  },
  // Slug del WP original `/otros-medios-de-recaudo`: redirige a la página
  // canónica de medios de pago para preservar enlaces externos legacy.
  {
    path: 'otros-medios-recaudo',
    redirectTo: '/pagos',
    pathMatch: 'full',
  },
  {
    path: 'otros-medios-de-recaudo',
    redirectTo: '/pagos',
    pathMatch: 'full',
  },

  // Funnels — Thank You Pages
  {
    path: 'gracias/contacto',
    loadComponent: () =>
      import('./pages/funnels/typ/contacto/contacto').then((m) => m.Contacto),
  },
  {
    path: 'gracias/cremacion',
    loadComponent: () =>
      import('./pages/funnels/typ/cremacion/cremacion').then((m) => m.Cremacion),
  },
  {
    path: 'gracias/duelo-corporativo',
    loadComponent: () =>
      import('./pages/funnels/typ/duelo-corporativo/duelo-corporativo').then((m) => m.DueloCorporativo),
  },
  {
    path: 'gracias/duelo-individual',
    loadComponent: () =>
      import('./pages/funnels/typ/duelo-individual/duelo-individual').then((m) => m.DueloIndividual),
  },
  {
    path: 'gracias/homenaje',
    loadComponent: () =>
      import('./pages/funnels/typ/homenaje/homenaje').then((m) => m.Homenaje),
  },
  {
    path: 'gracias/microseguros',
    loadComponent: () =>
      import('./pages/funnels/typ/microseguros/microseguros').then((m) => m.Microseguros),
  },
  {
    path: 'gracias/parque',
    loadComponent: () =>
      import('./pages/funnels/typ/parque/parque').then((m) => m.Parque),
  },
  {
    path: 'gracias/prenecesidad',
    loadComponent: () =>
      import('./pages/funnels/typ/prenecesidad/prenecesidad').then((m) => m.Prenecesidad),
  },
  {
    path: 'gracias/prevision-empresarial',
    loadComponent: () =>
      import('./pages/funnels/typ/prevision-empresarial/prevision-empresarial').then((m) => m.PrevisionEmpresarial),
  },
  {
    path: 'gracias/prevision-individual',
    loadComponent: () =>
      import('./pages/funnels/typ/prevision-individual/prevision-individual').then((m) => m.PrevisionIndividual),
  },

  // Errores
  {
    path: '400',
    loadComponent: () =>
      import('./pages/core/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 400 },
  },
  {
    path: '401',
    loadComponent: () =>
      import('./pages/core/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 401 },
  },
  {
    path: '403',
    loadComponent: () =>
      import('./pages/core/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 403 },
  },
  {
    path: '404',
    loadComponent: () =>
      import('./pages/core/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 404 },
  },
  {
    path: '500',
    loadComponent: () =>
      import('./pages/core/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 500 },
  },
  {
    path: '503',
    loadComponent: () =>
      import('./pages/core/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 503 },
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];
