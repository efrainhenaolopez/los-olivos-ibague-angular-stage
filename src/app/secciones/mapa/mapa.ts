import { Component, computed, signal } from '@angular/core';

interface Ciudad {
  ciudad: string;
  departamento: string;
}

interface Region {
  region: string;
  seccion: Ciudad[];
}

@Component({
  selector: 'app-mapa',
  imports: [],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss',
})
export class Mapa {
  readonly regiones: Region[] = [
    {
      region: 'Centro',
      seccion: [
        { ciudad: 'Bogotá', departamento: 'Cundinamarca' },
        { ciudad: 'Duitama', departamento: 'Boyacá' },
        { ciudad: 'Ibagué', departamento: 'Tolima' },
        { ciudad: 'Neiva', departamento: 'Huila' },
        { ciudad: 'Sogamoso', departamento: 'Boyacá' },
        { ciudad: 'Tunja', departamento: 'Boyacá' },
      ],
    },
    {
      region: 'Costa Pacífica',
      seccion: [
        { ciudad: 'Cali', departamento: 'Valle del Cauca' },
        { ciudad: 'Palmira', departamento: 'Valle del Cauca' },
        { ciudad: 'Buenaventura', departamento: 'Valle del Cauca' },
        { ciudad: 'Tuluá', departamento: 'Valle del Cauca' },
        { ciudad: 'Santander de Quilichao', departamento: 'Cauca' },
        { ciudad: 'Popayán', departamento: 'Cauca' },
        { ciudad: 'Pasto', departamento: 'Nariño' },
      ],
    },
    {
      region: 'Eje Cafetero',
      seccion: [
        { ciudad: 'Cartago', departamento: 'Valle del Cauca' },
        { ciudad: 'Pereira', departamento: 'Risaralda' },
        { ciudad: 'Dosquebradas', departamento: 'Risaralda' },
        { ciudad: 'Armenia', departamento: 'Quindío' },
        { ciudad: 'Calarcá', departamento: 'Quindío' },
        { ciudad: 'Manizales', departamento: 'Caldas' },
      ],
    },
    {
      region: 'Caribe',
      seccion: [
        { ciudad: 'Barranquilla', departamento: 'Atlántico' },
        { ciudad: 'Cartagena', departamento: 'Bolívar' },
        { ciudad: 'Montería', departamento: 'Córdoba' },
        { ciudad: 'Riohacha', departamento: 'La Guajira' },
        { ciudad: 'Santa Marta', departamento: 'Magdalena' },
        { ciudad: 'Valledupar', departamento: 'Cesar' },
      ],
    },
    {
      region: 'Santanderes',
      seccion: [
        { ciudad: 'Barrancabermeja', departamento: 'Santander' },
        { ciudad: 'Bucaramanga', departamento: 'Santander' },
        { ciudad: 'Cúcuta', departamento: 'Norte de Santander' },
      ],
    },
    {
      region: 'Llano y sur',
      seccion: [
        { ciudad: 'Florencia', departamento: 'Caquetá' },
        { ciudad: 'Villavicencio', departamento: 'Meta' },
        { ciudad: 'Yopal', departamento: 'Casanare' },
      ],
    },
  ];

  readonly currentRegion = signal('Centro');

  readonly selectedCities = computed(
    () =>
      this.regiones.find((r) => r.region === this.currentRegion())?.seccion ?? [],
  );

  selectRegion(region: string): void {
    this.currentRegion.set(region);
  }
}
