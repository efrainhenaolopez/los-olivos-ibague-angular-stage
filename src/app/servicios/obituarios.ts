import { Injectable } from '@angular/core';
import { Observable, from, of, delay } from 'rxjs';
import { apiUrl } from './api-config';

/** Foto del obituario (entrada de la Media Library de WP). */
export interface ObituarioFoto {
  id: number;
  url: string;
  alt: string;
  orden: number;
}

/**
 * Un obituario individual devuelto por el endpoint del plugin WP.
 *
 * Los campos opcionales `sedeId / salaId / fotos / ...` los entrega
 * el plugin como extras crudos para que las pantallas de sedes
 * (/obituarios-salas, /obituarios-recepcion) puedan derivar listas
 * agrupadas sin endpoints adicionales. Las páginas existentes
 * (/obituarios) los ignoran sin problemas.
 */
export interface Obituario {
  id: string | number;
  nombre: string;
  slug: string;
  fechaFallecimiento: string;
  sedeYSala: string;
  ciudad: string;
  exequias?: string;
  fechaHoraExequias?: string;
  destinoFinal?: string;
  horaDestinoFinal?: string;

  // === Extras del plugin (opcionales) · usados por las pantallas ===
  sedeId?: number;
  sedeNombre?: string;
  salaId?: number;
  salaNombre?: string;
  tipoVelacion?: 'SALA' | 'RESIDENCIA';
  direccionResidencia?: string;
  fechaexequiasRaw?: string;
  fechadestinoRaw?: string;
  estado?: 'A' | 'I';
  fotos?: ObituarioFoto[];
}

/**
 * URL del endpoint del plugin de WordPress que devolverá el JSON con
 * la lista completa de obituarios publicados. Pendiente de construcción ·
 * cuando esté listo:
 *   1. Confirmar el formato (array plano o `{ obituarios: [...] }`)
 *   2. Activar `USE_REAL_ENDPOINT = true`
 *
 * Diseño: el filtrado (por nombre/sede) sucede en cliente sobre el array
 * recibido. El endpoint no necesita parámetros de búsqueda.
 *
 * Implementación: usamos `fetch()` nativo (no Angular HttpClient) para
 * evitar instalar `provideHttpClient`, que en SSR dispara el guardia
 * SSRF y rompe el routing global.
 */
const ENDPOINT_URL = apiUrl('/obituarios');
const USE_REAL_ENDPOINT = true;

@Injectable({ providedIn: 'root' })
export class ObituariosService {
  /**
   * Obtiene la lista completa de obituarios. El cliente filtra y pagina
   * localmente.
   *
   * Mientras el plugin WP no esté listo, retorna un dataset mock con 25
   * obituarios reales tomados del WP en
   * https://ibague.losolivos.co/los-olivos-obituarios/
   */
  getAll(): Observable<Obituario[]> {
    if (USE_REAL_ENDPOINT) {
      return from(this.fetchObituarios());
    }
    return of(withSynthesizedIds(MOCK_OBITUARIOS)).pipe(delay(450));
  }

  /** Llamada real al plugin WP (activada cuando USE_REAL_ENDPOINT = true). */
  private async fetchObituarios(): Promise<Obituario[]> {
    const response = await fetch(ENDPOINT_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.obituarios ?? []);
    return list.map(mapEndpointItem);
  }
}

/**
 * Mapea un item crudo del endpoint (con `snake_case`) al interface
 * `Obituario` (camelCase). Tolera los campos extra incluso si no vienen.
 */
function mapEndpointItem(raw: Record<string, unknown>): Obituario {
  const get = <T>(key: string): T | undefined => raw[key] as T | undefined;
  return {
    id: get<string | number>('id')!,
    nombre: get<string>('nombre')!,
    slug: get<string>('slug') ?? '',
    fechaFallecimiento: get<string>('fechaFallecimiento')!,
    sedeYSala: get<string>('sedeYSala')!,
    ciudad: get<string>('ciudad')!,
    exequias: get<string>('exequias'),
    fechaHoraExequias: get<string>('fechaHoraExequias'),
    destinoFinal: get<string>('destinoFinal'),
    horaDestinoFinal: get<string>('horaDestinoFinal'),

    sedeId: get<number>('sede_id'),
    sedeNombre: get<string>('sede_nombre'),
    salaId: get<number>('sala_id'),
    salaNombre: get<string>('sala_nombre'),
    tipoVelacion: get<'SALA' | 'RESIDENCIA'>('tipo_velacion'),
    direccionResidencia: get<string>('direccion_residencia'),
    fechaexequiasRaw: get<string>('fechaexequias_raw'),
    fechadestinoRaw: get<string>('fechadestino_raw'),
    estado: get<'A' | 'I'>('estado'),
    fotos: get<ObituarioFoto[]>('fotos'),
  };
}

/**
 * Hash determinístico (djb2 truncado) usado para sintetizar `sedeId`
 * y `salaId` cuando el dataset es mock (el plugin aún no entrega IDs).
 * Garantiza que el mismo string de sede/sala siempre produzca el mismo ID,
 * lo que permite agrupar por igualdad numérica en los componentes de
 * pantalla sin importar si el origen es mock o endpoint real.
 */
function hashId(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Parte "Sala Imperial Sede Cadiz" en {sala: "Sala Imperial", sede: "Sede Cadiz"}
 * usando heurística: la palabra "Sede" inicia el segmento de la sede.
 * Tolera variantes (mayúsculas, comas, sin espacio).
 */
function splitSedeYSala(combined: string): { sala: string; sede: string } {
  const match = combined.match(/^(.*?)[\s,]+sede\s+(.+)$/i);
  if (match) {
    return { sala: match[1].trim(), sede: 'Sede ' + match[2].trim() };
  }
  return { sala: combined.trim(), sede: '—' };
}

/**
 * Enriquece el mock con `sedeId / salaId / sedeNombre / salaNombre`
 * sintetizados a partir de `sedeYSala`. Solo aplica si los campos no
 * están ya presentes (idempotente).
 */
function withSynthesizedIds(list: Obituario[]): Obituario[] {
  return list.map((o) => {
    if (o.sedeId != null && o.salaId != null) return o;
    const { sala, sede } = splitSedeYSala(o.sedeYSala);
    return {
      ...o,
      sedeNombre: o.sedeNombre ?? sede,
      salaNombre: o.salaNombre ?? sala,
      sedeId: o.sedeId ?? hashId(sede),
      salaId: o.salaId ?? hashId(sede + '::' + sala),
    };
  });
}

/** Dataset de muestra (25 obituarios) extraídos del WP en
 *  https://ibague.losolivos.co/los-olivos-obituarios/ — valores verbatim
 *  (incluye typos del origen como "07/05//2026" o "HUmberto").
 *  Reemplazar por la respuesta del plugin WP cuando esté listo. */
const MOCK_OBITUARIOS: Obituario[] = [
  { id: 47000, nombre: 'Jorge Alberto Rojas Cotrino',     slug: 'jorge-alberto-rojas-cotrino',     fechaFallecimiento: '11/05/2026', sedeYSala: 'Sala Gerencial Sede Cadiz',          ciudad: 'IBAGUÉ', exequias: 'Ceremonia Cristiana en sala',                            fechaHoraExequias: '13/05/2026 - 15:00',     destinoFinal: 'Cremación, Parque Memorial Los Olivos',    horaDestinoFinal: '17:00' },
  { id: 46999, nombre: 'Jose Humberto Vanegas',           slug: 'jose-humberto-vanegas',           fechaFallecimiento: '10/05/2026', sedeYSala: 'Sala Presidencial, Sede Cadiz',      ciudad: 'IBAGUÉ', exequias: 'Parroquia San Roque',                                   fechaHoraExequias: '13/05/2026 - 09:00',     destinoFinal: 'Cremación, Parque Memorial Los Olivos',    horaDestinoFinal: '11:00 a.m.' },
  { id: 46989, nombre: 'Rafael Antonio Castillo Caicedo', slug: 'rafael-antonio-castillo-caicedo', fechaFallecimiento: '10/05/2026', sedeYSala: 'Sala Imperial Sede Cadiz',           ciudad: 'IBAGUÉ', exequias: 'Parroquia La Catedral',                                 fechaHoraExequias: '12/05/2026 - 3:00 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',    horaDestinoFinal: '5:00 p.m.' },
  { id: 46984, nombre: 'Aura Maria Martinez',             slug: 'aura-maria-martinez',             fechaFallecimiento: '11/05/2026', sedeYSala: 'Sala Preferencial 3 sede Cra 5',     ciudad: 'Ibagué', exequias: 'Parroquia Espíritu Santo B/Jordán Octava Etapa',        fechaHoraExequias: '12/05/2026 - 03:00 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '04:30 p.m.' },
  { id: 46983, nombre: 'Jose Antonio Riveros Caicedo',    slug: 'jose-antonio-riveros-caicedo',    fechaFallecimiento: '10/05/2026', sedeYSala: 'Sala Preferencial 2 sede Cra 5',     ciudad: 'Ibagué', exequias: 'Parroquia Ntra Sra de Chiquinquira B/Piedra Pintada',  fechaHoraExequias: '12/05/2026 - 01:40 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '03:30 p.m.' },
  { id: 46982, nombre: 'Carmen Celia Sanchez De Morales', slug: 'carmen-celia-sanchez-de-morales', fechaFallecimiento: '10/05/2026', sedeYSala: 'Sala Ejecutiva 2 sede Cra 5',        ciudad: 'Ibagué', exequias: 'Parroquia San Roque B/Centro',                          fechaHoraExequias: '12/05/2026 - 11:30 a.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '01:30 p.m.' },
  { id: 46972, nombre: 'Olga Lucia Prada Uribe',          slug: 'olga-lucia-prada-uribe',          fechaFallecimiento: '10/05/2026', sedeYSala: 'Sala Ejecutiva 4 sede Cra 5',        ciudad: 'Ibagué', exequias: 'Parroquia Inmaculado Corazón de María B/Ricaurte',     fechaHoraExequias: '11/05/2026 - 01:30 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '03:30 p.m.' },
  { id: 46970, nombre: 'Mariel Jakeline Diaz',            slug: 'mariel-jakeline-diaz',            fechaFallecimiento: '08/05/2026', sedeYSala: 'Sala Ejecutiva 1 sede Cra 5',        ciudad: 'Ibagué', exequias: 'Parroquia La Catedral · Parque Simón Bolivar',         fechaHoraExequias: '11/05/2026 - 02:00 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '04:00 p.m.' },
  { id: 46968, nombre: 'Martha Consuelo Reyes Bernal',    slug: 'martha-consuelo-reyes-bernal',    fechaFallecimiento: '09/05/2026', sedeYSala: 'Sala Ejecutiva 3 sede Cra 5',        ciudad: 'Ibagué', exequias: 'Parroquia Maria Auxiliadora B/Cádiz',                   fechaHoraExequias: '10/05/2026 - 03:00 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '04:30 p.m.' },
  { id: 46967, nombre: 'Olga Lucia Borrero Buenaventura', slug: 'olga-lucia-borrero-buenaventura', fechaFallecimiento: '08/05/2026', sedeYSala: 'Sala Ejecutiva 4 sede Cra 5',        ciudad: 'Ibagué', exequias: 'Parroquia Santos Angeles Custodios',                    fechaHoraExequias: '10/05/2026 - 01:00 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '02:30 p.m.' },
  { id: 46966, nombre: 'Cristian Zambrano Perez',         slug: 'cristian-zambrano-perez',         fechaFallecimiento: '08/05/2026', sedeYSala: 'Sala Ejecutiva 2 sede Cra 5',        ciudad: 'Ibagué', exequias: 'Parroquia San Juan Bautista B/Jordan 2da Etapa',       fechaHoraExequias: '11/05/2026 - 10:00 a.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '11:30 a.m.' },
  { id: 46964, nombre: 'Luis Eduardo Rodriguez',          slug: 'luis-eduardo-rodriguez',          fechaFallecimiento: '07/05/2026', sedeYSala: 'Sede Cadiz Sala Gerencial',          ciudad: 'IBAGUÉ', exequias: 'Parroquia Inmaculado Corazón De Maria B/ Ricaurte',     fechaHoraExequias: '10/05/2026 - 14:00',     destinoFinal: 'Camposanto San Bonifacio',                  horaDestinoFinal: '16:00' },
  { id: 46961, nombre: 'Heriberto Caro Arias',            slug: 'heriberto-caro-arias',            fechaFallecimiento: '08/05/2026', sedeYSala: 'Sede Cadiz Sala Presidencial',       ciudad: 'Ibagué', exequias: 'Parroquia Maria Auxiliadora B/Cadíz',                   fechaHoraExequias: '10/05/2026 - 02:00 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '03:30 p.m.' },
  { id: 46959, nombre: 'Hugo De La Cruz Murillo',         slug: 'hugo-de-la-cruz-murillo',         fechaFallecimiento: '07/05/2026', sedeYSala: 'Sala Preferencial 3 sede Cra 5',     ciudad: 'Ibagué', exequias: 'Parroquia Catedral, Plaza Bolivar',                     fechaHoraExequias: '09/05/2026 - 04:00 p.m.', destinoFinal: 'Inhumación, Parque Memorial Los Olivos',  horaDestinoFinal: '06:00 p.m.' },
  { id: 46958, nombre: 'Jose Francisco Palomar Orjuela',  slug: 'jose-francisco-palomar-orjuela',  fechaFallecimiento: '06/05/2026', sedeYSala: 'Sala Ejecutiva 1 sede Cra 5',        ciudad: 'Ibagué', exequias: 'Parroquia Ntra Sra de Chiquinquira B/Piedra Pintada',  fechaHoraExequias: '09/05/2026 - 03:00 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '04:30 p.m.' },
  { id: 46957, nombre: 'Omar Vaquiro Capera',             slug: 'omar-vaquiro-capera',             fechaFallecimiento: '07/05/2026', sedeYSala: 'Sala Preferencial 1 sede Cra 5',     ciudad: 'Ibagué', exequias: 'Parroquia Catedral, Plaza Bolivar',                     fechaHoraExequias: '09/05/2026 - 02:00 p.m.', destinoFinal: 'Inhumación Camposanto Jardines la Milagrosa' },
  { id: 46956, nombre: 'Rebeca Rodriguez Martinez',       slug: 'rebeca-rodriguez-martinez',       fechaFallecimiento: '07/05/2026', sedeYSala: 'Sala Ejecutiva 3 sede Cra 5',        ciudad: 'Ibagué', exequias: 'Parroquia Espíritu Santo B/Jordán Octava Etapa',        fechaHoraExequias: '09/05/2026 - 12:30 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '02:00 p.m.' },
  { id: 46955, nombre: 'Herminda Morales',                slug: 'herminda-morales',                fechaFallecimiento: '07/05/2026', sedeYSala: 'Sala Ejecutiva 4 sede Cra 5',        ciudad: 'Ibagué', exequias: 'Parroquia Ntra. Sra. del Carmen B/ El Carmen',          fechaHoraExequias: '09/05/2026 - 10:00 a.m.', destinoFinal: 'Inhumación Camposanto San Bonifacio' },
  { id: 46954, nombre: 'Angee Maritza Ibarra Usma',       slug: 'angee-maritza-ibarra-usma',       fechaFallecimiento: '07/05/2026', sedeYSala: 'Sala Ejecutiva 2 sede Cra 5',        ciudad: 'Ibagué', exequias: 'Parroquia San Roque B/Centro',                          fechaHoraExequias: '09/05/2026 - 09:00 a.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '11:00 a.m.' },
  { id: 46948, nombre: 'Juan De Dios Gomez Escobar',      slug: 'juan-de-dios-gomez-escobar',      fechaFallecimiento: '07/05/2026', sedeYSala: 'Sede Cadiz Sala Gerencial',          ciudad: 'Ibagué', exequias: 'Parroquia San Judas Tadeo B/ Santa Helena',             fechaHoraExequias: '09/05/2026 - 01:30 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '03:00 p.m.' },
  { id: 46947, nombre: 'Zoila Perdomo De Arias',          slug: 'zoila-perdomo-de-arias',          fechaFallecimiento: '07/05/2026', sedeYSala: 'Sala Imperial Sede Cadiz',           ciudad: 'Ibagué', exequias: 'Parroquia Maria Auxiliadora B/Cadíz',                   fechaHoraExequias: '09/05/2026 - 01:00 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '02:30 p.m.' },
  { id: 46946, nombre: 'Argenis Berrio Saavedra',         slug: 'argenis-berrio-saavedra',         fechaFallecimiento: '07/05/2026', sedeYSala: 'Sala Presidencial, Sede Cadiz',      ciudad: 'IBAGUÉ', exequias: 'Parroquia San Judas Tadeo',                             fechaHoraExequias: '09/05/2026 - 11:00 a.m.', destinoFinal: 'Inhumación Camposanto Jardines la Milagrosa', horaDestinoFinal: '12:30 p.m.' },
  { id: 46916, nombre: 'Carlos Lopez Hernandez',          slug: 'carlos-lopez-hernandez',          fechaFallecimiento: '05/05/2026', sedeYSala: 'Sala Presidencial Sede Cadiz',       ciudad: 'IBAGUÉ', exequias: 'Parroquia Inmaculado Corazón De Maria B/ Ricaurte',     fechaHoraExequias: '07/05/2026 - 01:30 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '03:30 p.m.' },
  { id: 46915, nombre: 'Reinel Humberto Mora Orozco',     slug: 'reinel-humberto-mora-orozco',     fechaFallecimiento: '05/05/2026', sedeYSala: 'Sala Imperial Sede Cadiz',           ciudad: 'IBAGUÉ', exequias: 'Parroquia San Judas Tadeo B/ Santa Helena',             fechaHoraExequias: '07/05/2026 - 12:30 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '02:00 p.m.' },
  { id: 46914, nombre: 'Luis Roberto Cuesta Garcia',      slug: 'luis-roberto-cuesta-garcia',      fechaFallecimiento: '05/05/2026', sedeYSala: 'Sala Gerencial Sede Cadiz',          ciudad: 'IBAGUÉ', exequias: 'Parroquia San Isidro Labrador B/ Salado',               fechaHoraExequias: '07/05/2026 - 01:30 p.m.', destinoFinal: 'Cremación, Parque Memorial Los Olivos',   horaDestinoFinal: '03:00 p.m.' },
];
