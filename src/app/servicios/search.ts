import { Injectable } from '@angular/core';

export interface SearchResult {
  id: number;
  title: string;
  description: string;
  link: string;
}

/**
 * Búsqueda local sobre catálogo estático.
 * Cada item expone title + description; los términos se matchean contra
 * ambos campos (case-insensitive).
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly catalogue: SearchResult[] = [
    {
      id: 1,
      title: 'Bienestar integral',
      description: 'Conoce los planes de previsión exequial para tu familia.',
      link: '/bienestar-integral',
    },
    {
      id: 2,
      title: 'Apoyo inmediato',
      description: 'Servicio cuando ha ocurrido un fallecimiento.',
      link: '/apoyo-inmediato',
    },
    {
      id: 3,
      title: 'Demuestra tu afecto',
      description: 'Productos para acompañar y memorializar.',
      link: '/demuestra-tu-afecto',
    },
    {
      id: 4,
      title: 'Sedes',
      description: 'Directorio de sedes en Ibagué y el Tolima.',
      link: '/sedes',
    },
    {
      id: 5,
      title: 'Canales de recaudo',
      description: 'PSE, Efecty, Baloto, corresponsales y tarjeta.',
      link: '/otros-medios-recaudo',
    },
    {
      id: 6,
      title: 'Tratamiento de datos',
      description: 'Política de tratamiento de datos personales.',
      link: '/tratamiento-datos',
    },
    {
      id: 7,
      title: 'Contáctenos',
      description: 'Envíanos tus comentarios, peticiones o reclamos.',
      link: '/contacto',
    },
  ];

  search(query: string): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.catalogue.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q),
    );
  }
}
