// Postbuild: clona el index.html raíz a cada ruta declarada con
// `RenderMode.Client` o `RenderMode.Server` en `app.routes.server.ts`.
//
// Por qué: el host de producción sirve archivos estáticos (HTML/JS/CSS)
// sin reescritura de URLs hacia /index.html. Sin esto, los hits directos
// a `/obituarios-salas?sede=2` u `/obituario?id=5` devuelven 404 porque
// el build de Angular no genera HTML físico para esas rutas (solo para
// las Prerender).
//
// Cada copia es un shell idéntico al index.html raíz: Angular se monta
// en el cliente, lee los queryparams y renderiza la pantalla. Mismo
// comportamiento que en local con `ng serve`.

import { readFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const BROWSER_DIR = join(REPO_ROOT, 'dist/los-olivos-tolima/browser');
const SERVER_ROUTES_TS = join(REPO_ROOT, 'src/app/app.routes.server.ts');

/** Extrae las rutas con renderMode Client o Server del .ts fuente. */
function extractClientAndServerRoutes(source) {
  const routes = [];
  // Match objetos { path: '...', renderMode: RenderMode.Client|Server }
  const regex = /path:\s*['"]([^'"]+)['"][^}]*renderMode:\s*RenderMode\.(Client|Server)/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    const path = match[1];
    if (path === '**' || path === '') continue;
    routes.push(path);
  }
  return routes;
}

function main() {
  const indexPath = join(BROWSER_DIR, 'index.html');
  if (!existsSync(indexPath)) {
    console.error(`[clone-shells] No se encontró ${indexPath}. ¿Ejecutaste el build antes?`);
    process.exit(1);
  }

  const serverRoutesSource = readFileSync(SERVER_ROUTES_TS, 'utf8');
  const routes = extractClientAndServerRoutes(serverRoutesSource);

  if (routes.length === 0) {
    console.log('[clone-shells] No hay rutas Client/Server declaradas. Nada que clonar.');
    return;
  }

  for (const path of routes) {
    const targetDir = join(BROWSER_DIR, path);
    const targetFile = join(targetDir, 'index.html');
    mkdirSync(targetDir, { recursive: true });
    copyFileSync(indexPath, targetFile);
    console.log(`[clone-shells] /${path}/index.html`);
  }
  console.log(`[clone-shells] ${routes.length} shell(s) generado(s) para static host.`);
}

main();
