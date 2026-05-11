import { Component, computed, input, output, signal } from '@angular/core';

export interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  cta: string;
  ctaStrong: string;
  bgSoft: string;
  onPrimary: string;
  gradientFrom: string;
  gradientTo: string;
  /** Override opcional del color del progress-bar cuando el cta queda muy
   *  cerca del primary (Coral, Natural, Vibrante). Si no se define, el
   *  progress-bar usa --color-cta. */
  progressColor?: string;
}

export type MenuType = 'tradicional' | 'desplegable';

interface TemplateOption {
  id: string;       // p.ej. "moderno"
  label: string;    // p.ej. "Moderno"
  palette: Palette;
}

interface TerritoryGroup {
  id: 'duelo' | 'prevision' | 'vida';
  label: string;
  templates: TemplateOption[];
}

/** Paletas completas — mismas que el showcase de ux ([ux.ts:78-86]). */
const TERRITORY_GROUPS: TerritoryGroup[] = [
  {
    id: 'duelo', label: 'Duelo',
    templates: [
      { id: 'clasico',  label: 'Clásico',  palette: { primary: '#234b50', secondary: '#5a8c8e', accent: '#a94d69', cta: '#f0a33d', ctaStrong: '#d68922', bgSoft: '#edf5f7', onPrimary: '#ffffff', gradientFrom: '#234b50', gradientTo: '#5a8c8e' } },
      { id: 'moderno',  label: 'Moderno',  palette: { primary: '#1e3a5f', secondary: '#4a6b8a', accent: '#b85450', cta: '#d4a857', ctaStrong: '#b88f3e', bgSoft: '#f0f4f8', onPrimary: '#ffffff', gradientFrom: '#1e3a5f', gradientTo: '#c9a96e' } },
      { id: 'elegante', label: 'Elegante', palette: { primary: '#2c2e35', secondary: '#4a4d57', accent: '#ff7a8a', cta: '#5a9080', ctaStrong: '#437366', bgSoft: '#f5f5f5', onPrimary: '#ffffff', gradientFrom: '#2c2e35', gradientTo: '#7fb8a8' } },
    ],
  },
  {
    id: 'prevision', label: 'Previsión',
    templates: [
      { id: 'coral',   label: 'Coral',   palette: { primary: '#c93a4f', secondary: '#ff7a8a', accent: '#ffd166', cta: '#d63384', ctaStrong: '#a32168', bgSoft: '#fff2f4', onPrimary: '#ffffff', gradientFrom: '#c93a4f', gradientTo: '#ffd166', progressColor: '#ffd166' } },
      { id: 'energia', label: 'Energía', palette: { primary: '#e8632f', secondary: '#f4a55b', accent: '#84cc16', cta: '#2d7dd2', ctaStrong: '#1f5fa3', bgSoft: '#fff4ed', onPrimary: '#ffffff', gradientFrom: '#e8632f', gradientTo: '#2d7dd2' } },
      { id: 'natural', label: 'Natural', palette: { primary: '#2d7d4f', secondary: '#6cb86c', accent: '#d97706', cta: '#15803d', ctaStrong: '#0f5e2c', bgSoft: '#f1f8e9', onPrimary: '#ffffff', gradientFrom: '#2d7d4f', gradientTo: '#c9a96e', progressColor: '#d97706' } },
    ],
  },
  {
    id: 'vida', label: 'Vida',
    templates: [
      { id: 'vibrante', label: 'Vibrante', palette: { primary: '#cf4545', secondary: '#efc45b', accent: '#6cd490', cta: '#e91e63', ctaStrong: '#b91450', bgSoft: '#fef9ef', onPrimary: '#ffffff', gradientFrom: '#cf4545', gradientTo: '#efc45b', progressColor: '#6cd490' } },
      { id: 'sunset',   label: 'Sunset',   palette: { primary: '#b8743a', secondary: '#e5a024', accent: '#ff7a8a', cta: '#6e4f8b', ctaStrong: '#543b6c', bgSoft: '#fdf8e8', onPrimary: '#ffffff', gradientFrom: '#e5a024', gradientTo: '#6e4f8b' } },
      { id: 'fresco',   label: 'Fresco',   palette: { primary: '#00897b', secondary: '#4ecdc4', accent: '#f97316', cta: '#e91e63', ctaStrong: '#c2185b', bgSoft: '#e0f7f7', onPrimary: '#ffffff', gradientFrom: '#00897b', gradientTo: '#4ecdc4' } },
    ],
  },
];

/** Estado de la "forma orgánica" para las flip cards de proyección.
 *  La forma siempre es 1:1 al 100% del ancho del card; controlamos
 *  rotación, posición, radio del borde y opacidad. */
export interface ShapeState {
  rotation: number;     // grados, ej. -17
  x: number;            // % desde la izquierda (top-left de la forma)
  y: number;            // % desde arriba
  borderRadius: number; // px del border-radius
  opacity: number;      // 0–1 (transparencia del backdrop sobre el bg)
}

/** Estado de la forma orgánica del banner tribute-section.
 *  Extiende ShapeState con `size` porque la proporción del banner exige
 *  controlar también el tamaño relativo de la forma (rango 0–1000%). */
export interface TributeShapeState extends ShapeState {
  size: number;
}

export const DEFAULT_SHAPE: ShapeState = {
  rotation: 17,
  x: -9,
  y: 65,
  borderRadius: 48,
  opacity: 0.65,
};
export const DEFAULT_TRIBUTE_SHAPE: TributeShapeState = {
  rotation: 16,
  x: 26,
  y: 17.5,
  size: 99,
  borderRadius: 300,
  opacity: 0.5,
};

/** Helper para formatear ShapeState (sin size) como texto copiable. */
function fmtShape(s: ShapeState): string {
  return `rotation: ${s.rotation}deg · x: ${s.x.toFixed(2)}% · y: ${s.y.toFixed(2)}% · radius: ${s.borderRadius.toFixed(0)}px · opacity: ${s.opacity.toFixed(2)}`;
}

/** Helper para formatear TributeShapeState (con size) como texto copiable. */
function fmtTributeShape(s: TributeShapeState): string {
  return `rotation: ${s.rotation}deg · x: ${s.x.toFixed(2)}% · y: ${s.y.toFixed(2)}% · size: ${s.size.toFixed(0)}% · radius: ${s.borderRadius.toFixed(0)}px · opacity: ${s.opacity.toFixed(2)}`;
}

@Component({
  selector: 'app-palette-fab',
  templateUrl: './palette-fab.html',
  styleUrl: './palette-fab.scss',
})
export class PaletteFab {
  /** Plantilla seleccionada en formato "<territorio>-<variante>". */
  template = input<string>('');

  /** Tipo de menú seleccionado para el footer. */
  menuType = input<MenuType>('tradicional');

  /** Estado actual de la forma orgánica de las flip cards (proyección). */
  shape = input<ShapeState>(DEFAULT_SHAPE);

  /** Estado actual de la forma orgánica del banner tribute-section. */
  tributeShape = input<TributeShapeState>(DEFAULT_TRIBUTE_SHAPE);

  /** Emite { id, palette } cuando el usuario selecciona una plantilla. */
  templateChange = output<{ id: string; palette: Palette }>();

  /** Emite el nuevo tipo de menú cuando cambia. */
  menuTypeChange = output<MenuType>();

  /** Emite el nuevo estado de la forma orgánica de proyección. */
  shapeChange = output<ShapeState>();

  /** Emite el nuevo estado de la forma orgánica del tribute. */
  tributeShapeChange = output<TributeShapeState>();

  readonly groups = TERRITORY_GROUPS;
  readonly open = signal(false);
  readonly copied = signal<'shape' | 'tribute' | null>(null);

  readonly activeTerritory = computed(() => {
    const value = this.template();
    if (!value) return null;
    const idx = value.indexOf('-');
    return idx === -1 ? value : value.slice(0, idx);
  });

  readonly activeVariant = computed(() => {
    const value = this.template();
    if (!value) return null;
    const idx = value.indexOf('-');
    return idx === -1 ? null : value.slice(idx + 1);
  });

  /** Texto copiable con los valores actuales de la forma de proyección. */
  readonly shapeText = computed(() => fmtShape(this.shape()));

  /** Texto copiable con los valores actuales de la forma del tribute. */
  readonly tributeShapeText = computed(() => fmtTributeShape(this.tributeShape()));

  toggle(): void {
    this.open.update((v) => !v);
  }

  select(territoryId: string, tpl: TemplateOption): void {
    this.templateChange.emit({ id: `${territoryId}-${tpl.id}`, palette: tpl.palette });
  }

  isActive(territoryId: string, variantId: string): boolean {
    return this.activeTerritory() === territoryId && this.activeVariant() === variantId;
  }

  onMenuTypeChange(value: string): void {
    this.menuTypeChange.emit(value as MenuType);
  }

  onShapeChange(field: keyof ShapeState, raw: string): void {
    const value = Number.parseFloat(raw);
    if (Number.isNaN(value)) return;
    this.shapeChange.emit({ ...this.shape(), [field]: value });
  }

  onTributeShapeChange(field: keyof TributeShapeState, raw: string): void {
    const value = Number.parseFloat(raw);
    if (Number.isNaN(value)) return;
    this.tributeShapeChange.emit({ ...this.tributeShape(), [field]: value });
  }

  copyShape(which: 'shape' | 'tribute'): void {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    const text = which === 'shape' ? this.shapeText() : this.tributeShapeText();
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(which);
      setTimeout(() => this.copied.set(null), 1500);
    }).catch(() => {
      // clipboard bloqueado: ignora silenciosamente
    });
  }

  resetShape(): void {
    this.shapeChange.emit({ ...DEFAULT_SHAPE });
  }

  resetTributeShape(): void {
    this.tributeShapeChange.emit({ ...DEFAULT_TRIBUTE_SHAPE });
  }
}
