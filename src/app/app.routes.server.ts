import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Pantallas de sedes: contenido depende de queryparams y polling.
  // Client-rendered porque (a) son internas (noindex, no necesitan SEO)
  // y (b) los queryparams no se pueden prerenderizar exhaustivamente.
  // Esto genera un HTML shell estático que el JS hidrata al cargar,
  // así que funciona en static host (nginx/cPanel/Hostinger) sin Node.
  {
    path: 'obituarios-salas',
    renderMode: RenderMode.Client,
  },
  {
    path: 'obituarios-recepcion',
    renderMode: RenderMode.Client,
  },

  // Detalle de obituario: depende de ?id=N y arrastra condolencias.
  // Server porque necesita meta dinámica para SEO (compartir en redes).
  // Si se sirve desde static host puro, configurar fallback nginx:
  //   `try_files $uri $uri/ /index.html` para que /obituario?id=N caiga
  //   al shell y Angular tome control en CSR (pierde meta dinámica
  //   pero funciona).
  {
    path: 'obituario',
    renderMode: RenderMode.Server,
  },

  // Catch-all: el resto de páginas son estáticas.
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
