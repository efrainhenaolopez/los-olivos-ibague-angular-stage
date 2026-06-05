import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Fallback a prerender estático para URLs de rutas (sin extensión).
 *
 * El SSR runtime de Angular 21 (`AngularNodeAppEngine.handle`) rechaza
 * URLs cuyo host es `localhost` o loopback con "URL with hostname X is
 * not allowed" (guardia SSRF) y hace fallback a CSR, sirviendo el shell
 * `/index.html` (que prerendera la página de bienvenida) para CUALQUIER
 * ruta. Resultado: el usuario navega a `/sedes`, `/registros-defuncion`,
 * etc., y siempre ve la página principal hasta que la hidratación JS
 * arranque (y aun así puede no recuperar si el route data ya está
 * congelado).
 *
 * Solución: como `npm run build` ya prerendera todas las rutas a
 * `dist/.../browser/<ruta>/index.html`, sirvamos esos archivos
 * directamente en lugar de invocar el SSR runtime. Si el path no tiene
 * un index.html prerendereado (ej. una ruta dinámica futura), recién
 * delegamos a AngularNodeAppEngine.
 */
app.use((req, res, next) => {
  const url = req.path;
  if (url === '/' || url.includes('.')) return next();
  const candidate = join(browserDistFolder, url, 'index.html');
  if (existsSync(candidate)) {
    return res.sendFile(candidate);
  }
  return next();
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
