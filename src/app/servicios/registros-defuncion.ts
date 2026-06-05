import { Injectable } from '@angular/core';
import { Observable, from, of, delay } from 'rxjs';
import { apiUrl } from './api-config';

/** Un registro individual devuelto por el endpoint del plugin WP. */
export interface RegistroDefuncion {
  id: string | number;
  serQuerido: string;
  numeroRegistro: string;
  notaria: string;
  documentoIdentidad?: string;
  fechaFallecimiento?: string;
}

/**
 * URL del endpoint del plugin de WordPress que devolverá el JSON con
 * la lista completa de registros. Pendiente de construcción · cuando
 * esté listo:
 *   1. Confirmar el formato (array plano o `{ records: [...] }`)
 *   2. Activar `USE_REAL_ENDPOINT = true`
 *
 * Diseño: el filtrado por nombre/cédula sucede en cliente sobre el
 * array recibido. El endpoint no necesita parámetros de búsqueda.
 *
 * Implementación: usamos `fetch()` nativo (no Angular HttpClient) para
 * evitar instalar `provideHttpClient`, que en SSR dispara el guardia
 * SSRF y rompe el routing global. El fetch nativo funciona en navegador
 * y SSR sin configuración adicional.
 */
const ENDPOINT_URL = apiUrl('/registros-defuncion');
const USE_REAL_ENDPOINT = true;

@Injectable({ providedIn: 'root' })
export class RegistrosDefuncionService {
  /**
   * Obtiene el conjunto completo de registros. El cliente filtra y
   * pagina localmente sobre la respuesta.
   *
   * Mientras el plugin WP no esté listo, retorna un dataset mock con
   * 40 registros reales tomados del WP en
   * https://ibague.losolivos.co/registros-de-defuncion/
   */
  getAll(): Observable<RegistroDefuncion[]> {
    if (USE_REAL_ENDPOINT) {
      return from(this.fetchRegistros());
    }
    return of(MOCK_REGISTROS).pipe(delay(450));
  }

  /** Llamada real al plugin WP (activada cuando USE_REAL_ENDPOINT = true). */
  private async fetchRegistros(): Promise<RegistroDefuncion[]> {
    const response = await fetch(ENDPOINT_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    // El plugin puede responder con un array plano o con { records: [...] }.
    // Aceptamos ambas formas para no atarnos a una decisión que aún no se toma.
    return Array.isArray(data) ? data : (data.records ?? []);
  }
}

/** Dataset de muestra (40 registros) extraídos del WP en
 *  https://ibague.losolivos.co/registros-de-defuncion/ — primera página
 *  SSR'd. Valores verbatim (incluye typos del origen como "NOTARIA
 *  DEQUIBDO" o "NOTARIA DE GUAVIARE"). Reemplazar por la respuesta del
 *  plugin WP cuando esté listo. */
const MOCK_REGISTROS: RegistroDefuncion[] = [
  { id: 1,  serQuerido: 'LUISA FERNANDA MARTINEZ BARRERO',     numeroRegistro: 'N.A / PENDIENTE', notaria: 'REGISTRADURIA DE IBAGUÉ',     documentoIdentidad: '31792808',   fechaFallecimiento: '4/10/2023' },
  { id: 2,  serQuerido: 'OFELIA LEILA RONDON',                 numeroRegistro: '10333506',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '28873607',   fechaFallecimiento: '4/10/2023' },
  { id: 3,  serQuerido: 'JOSE JAIRO BONILLA BUITRAGO',         numeroRegistro: '10333505',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '14198761',   fechaFallecimiento: '4/10/2023' },
  { id: 4,  serQuerido: 'GILBERTO GONGORA MOLANO',             numeroRegistro: '10333504',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '5799917',    fechaFallecimiento: '4/10/2023' },
  { id: 5,  serQuerido: 'LIGIA REYES DE ALVAREZ',              numeroRegistro: '10333503',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '28781405',   fechaFallecimiento: '4/10/2023' },
  { id: 6,  serQuerido: 'CECILIA GALEANO CADENA',              numeroRegistro: '10333501',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '28795801',   fechaFallecimiento: '4/10/2023' },
  { id: 7,  serQuerido: 'YOLANDA MONTEALEGRE',                 numeroRegistro: '10333502',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '28782805',   fechaFallecimiento: '4/10/2023' },
  { id: 8,  serQuerido: 'BLANCA FLOR AVENDAÑO AVENDAÑO',       numeroRegistro: '10329417',        notaria: 'NOTARIA SEGUNDA DE GIRARDOT', documentoIdentidad: '1075628062', fechaFallecimiento: '4/10/2023' },
  { id: 9,  serQuerido: 'CRISTIAN DAVID CASTAÑEDA OSPINA',     numeroRegistro: 'N.A / PENDIENTE', notaria: 'N.A / PENDIENTE',             documentoIdentidad: '1057305792', fechaFallecimiento: '4/10/2023' },
  { id: 10, serQuerido: 'ROBERT ANDRES MONTOYA ABELLA',        numeroRegistro: 'N.A / PENDIENTE', notaria: 'NOTARIA DE VILLAVICENCIO',    documentoIdentidad: '81735242',   fechaFallecimiento: '4/9/2023'  },
  { id: 11, serQuerido: 'JOHAN STIVEN VARON CARTAGENA',        numeroRegistro: 'N.A / PENDIENTE', notaria: 'REGISTRADURIA DEL ESPINAL',   documentoIdentidad: '1007557316', fechaFallecimiento: '4/9/2023'  },
  { id: 12, serQuerido: 'JOSE RESURRECCION PINILLA BALLEN',    numeroRegistro: '10333500',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '2236216',    fechaFallecimiento: '4/9/2023'  },
  { id: 13, serQuerido: 'ARGELIA OSORNO DE UNIVIO',            numeroRegistro: 'N.A / PENDIENTE', notaria: 'NOTARIA DE GUAVIARE',         documentoIdentidad: '28834494',   fechaFallecimiento: '4/9/2023'  },
  { id: 14, serQuerido: 'ALONSO BONILLA GUALTERO',             numeroRegistro: '10333499',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '5803524',    fechaFallecimiento: '4/8/2023'  },
  { id: 15, serQuerido: 'ANA LILIA CASTAÑO DE CASTAÑO',        numeroRegistro: '10329401',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '24255912',   fechaFallecimiento: '4/8/2023'  },
  { id: 16, serQuerido: 'ELIZABETH GARCIA SALAS',              numeroRegistro: '10329399',        notaria: 'NOTARIA SEGUNDA DE GIRARDOT', documentoIdentidad: '51686975',   fechaFallecimiento: '4/8/2023'  },
  { id: 17, serQuerido: 'DANIEL ORLANDO ALVAREZ LONDOÑO',      numeroRegistro: '10329400',        notaria: 'NOTARIA SEGUNDA DE GIRARDOT', documentoIdentidad: '70097350',   fechaFallecimiento: '4/8/2023'  },
  { id: 18, serQuerido: 'TRINIDAD TAPIERO DE LOAIZA',          numeroRegistro: '10442511',        notaria: 'NOTARIA PRIMERA DE ESPINAL',  documentoIdentidad: '28861471',   fechaFallecimiento: '4/8/2023'  },
  { id: 19, serQuerido: 'JAIME JARAMILLO CRIOLLO',             numeroRegistro: 'N.A / PENDIENTE', notaria: 'NOTARIA DE CALI',             documentoIdentidad: '14934775',   fechaFallecimiento: '4/8/2023'  },
  { id: 20, serQuerido: 'OLGA GUARNIZO ALMARIO',               numeroRegistro: '10333498',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '30343106',   fechaFallecimiento: '4/7/2023'  },
  { id: 21, serQuerido: 'MARIA MELIDA PERDOMO DE ZARABANDA',   numeroRegistro: '10333496',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '28675081',   fechaFallecimiento: '4/7/2023'  },
  { id: 22, serQuerido: 'MARIA TRINIDAD AREVALO CANO',         numeroRegistro: '10333495',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '23729305',   fechaFallecimiento: '4/7/2023'  },
  { id: 23, serQuerido: 'LUZ MIRIAN DIAZ TRUJILLO',            numeroRegistro: '10333511',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '65777614',   fechaFallecimiento: '4/7/2023'  },
  { id: 24, serQuerido: 'MAURICIO RODRIGUEZ RIVERA',           numeroRegistro: '10329398',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '79408764',   fechaFallecimiento: '4/7/2023'  },
  { id: 25, serQuerido: 'ALEJANDRO FIDEL MALAGON TORRES',      numeroRegistro: '10329402',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '3267726',    fechaFallecimiento: '4/7/2023'  },
  { id: 26, serQuerido: 'MARIA DEL CARMEN HORTA DE RINCON',    numeroRegistro: '10333497',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '28511591',   fechaFallecimiento: '4/7/2023'  },
  { id: 27, serQuerido: 'VIRGELINA OTALVARO DE ROJAS',         numeroRegistro: 'N.A / PENDIENTE', notaria: 'NOTARIA DE ARMENIA',          documentoIdentidad: '29325266',   fechaFallecimiento: '4/7/2023'  },
  { id: 28, serQuerido: 'GUILLERMO OLAYA',                     numeroRegistro: 'N.A / PENDIENTE', notaria: 'NOTARIA DE MONTERÍA',         documentoIdentidad: '2337559',    fechaFallecimiento: '4/7/2023'  },
  { id: 29, serQuerido: 'CARLOS GALEANO ROBLES',               numeroRegistro: 'N.A / PENDIENTE', notaria: 'REGISTRADURIA GIRARDOT',      documentoIdentidad: '17417156',   fechaFallecimiento: '4/6/2023'  },
  { id: 30, serQuerido: 'CARMEN EMILIA PALOMO DE BERMUDEZ',    numeroRegistro: 'N.A / PENDIENTE', notaria: 'NOTARIA DEQUIBDO',            documentoIdentidad: '28738634',   fechaFallecimiento: '4/6/2023'  },
  { id: 31, serQuerido: 'OFELIA SALAZAR DE VILLADA',           numeroRegistro: '10333494',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '24274668',   fechaFallecimiento: '4/6/2023'  },
  { id: 32, serQuerido: 'AMPARO VELASQUEZ DE GARCIA',          numeroRegistro: '10333493',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '25013420',   fechaFallecimiento: '4/6/2023'  },
  { id: 33, serQuerido: 'JOSE ALEJANDRO BONILLA LOZANO',       numeroRegistro: '10333491',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '5803239',    fechaFallecimiento: '4/6/2023'  },
  { id: 34, serQuerido: 'HENRY AUGUSTO TOVAR ARCINIEGAS',      numeroRegistro: 'N.A / PENDIENTE', notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '14229496',   fechaFallecimiento: '4/6/2023'  },
  { id: 35, serQuerido: 'PRIMITIVO ARCINIEGAS OSPINA',         numeroRegistro: 'N.A / PENDIENTE', notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '2230967',    fechaFallecimiento: '4/6/2023'  },
  { id: 36, serQuerido: 'RUTH REYES ROMERO',                   numeroRegistro: '10333490',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '39560710',   fechaFallecimiento: '4/6/2023'  },
  { id: 37, serQuerido: 'ALBERTO LIZARAZO HINCAPIE',           numeroRegistro: '10333492',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '5960295',    fechaFallecimiento: '4/6/2023'  },
  { id: 38, serQuerido: 'REINALDO HENAO PABON',                numeroRegistro: '10333488',        notaria: 'NOTARIA SEGUNDA DE IBAGUÉ',   documentoIdentidad: '14197827',   fechaFallecimiento: '4/6/2023'  },
  { id: 39, serQuerido: 'MARIA ANA LUCIA BAUTISTA DE CALDERON', numeroRegistro: '10329397',       notaria: 'NOTARIA SEGUNDA DE GIRARDOT', documentoIdentidad: '39554651',   fechaFallecimiento: '4/6/2023'  },
  { id: 40, serQuerido: 'JUAN DE JESUS RAMIREZ FORERO',        numeroRegistro: '10329403',        notaria: 'NOTARIA SEGUNDA DE GIRARDOT', documentoIdentidad: '245142',     fechaFallecimiento: '4/6/2023'  },
];
