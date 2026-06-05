/**
 * URL base del API REST del plugin WordPress `los-olivos-ibague`.
 *
 * El WordPress de Los Olivos Ibagué vive bajo el path `/es` en su servidor
 * (tanto en dev `desarrolloibague.losolivos.co/es` como en producción),
 * por eso todas las URLs incluyen ese prefijo.
 *
 * - En dev (Angular en localhost / *.local) → URL absoluta al WP de desarrollo.
 *   Requiere que el host de Angular esté en la allowlist
 *   `olvibg_allowed_origins` del plugin (WP admin → Ajustes plugin).
 * - En cualquier otro host (producción / staging) → ruta relativa, asumiendo
 *   que Angular y WP comparten dominio raíz.
 * - En SSR (sin `window`) → ruta relativa también; el servidor SSR de
 *   producción correrá en el mismo host que el WP.
 */
const isDevHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname.endsWith('.local'));

export const API_BASE_URL = isDevHost
  ? 'https://desarrolloibague.losolivos.co/es/wp-json/serfuncoop/v1'
  : '/es/wp-json/serfuncoop/v1';

/** Concatena la base con un path como `/obituarios` o `/condolencias?obituario_id=4`. */
export const apiUrl = (path: string): string => `${API_BASE_URL}${path}`;
