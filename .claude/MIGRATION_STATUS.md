# Migración WordPress → Angular · Estado y convenciones

Documento de continuidad. Léelo al inicio de cada sesión nueva. Origen WP:
`https://ibague.losolivos.co/`. Destino: este repo (Angular 21 SSR).

---

## Flujo de migración (vigente)

Acordado con el usuario: **migrar todas las páginas primero, verificar al
final** (no per-página). Por cada página:

1. `curl -A "Mozilla/5.0 ..."` la URL del WP a `C:/temp/wp-migration/<slug>.html`.
2. Extraer title, meta-description, h1-h3, párrafos, imágenes (URL absoluta +
   alt), CTAs/formularios visibles. Ignorar bloques que sean ruido del WP
   (CTAs globales replicados, "preguntas frecuentes" que en realidad son
   links a obituarios/pagos, etc.).
3. Descargar imágenes con `curl` a `public/img/wp-migrated/<slug>/`.
4. Decidir territorio/plantilla por la tabla de abajo (sin pedir aprobación).
5. Editar `<pagina>.ts/.html/.scss` + `npm run build` verde.
6. Verificación visual + SSR + GTM + responsive: **al final, en pase único**.

WebFetch da 403 contra el WP. Usar `curl -A "Mozilla/5.0..."`.

---

## Páginas migradas

| Ruta             | Plantilla        | Notas                                                       |
|------------------|------------------|-------------------------------------------------------------|
| `/nosotros`      | sin plantilla    | Historia + Fechas Memorables + Proyección (flip cards M·V·P)|
| `/microseguros`  | `prevision-coral`| 5 productos + asistencias hogar + tribute-section CTA       |

## Páginas pendientes (mapa territorio → página)

| Bloque                | Páginas                                                            | Plantilla sugerida   |
|-----------------------|--------------------------------------------------------------------|----------------------|
| Duelo · Clásico       | servicio-funerario, cremacion, parque-cementerio                   | `duelo-clasico`      |
| Duelo · Elegante      | apoyo-al-duelo, taller-de-duelo, velacion-virtual                  | `duelo-elegante`     |
| Duelo · Moderno       | obituarios, condolencias, conmemoraciones, palabras-de-amor        | `duelo-moderno`      |
| Previsión · Coral     | prevision, planes-individuales                                     | `prevision-coral`    |
| Previsión · Energía   | planes-empresariales, prenecesidad                                 | `prevision-energia`  |
| Sin territorio        | contacto, sedes, pagos, registros-defuncion, otros-medios-recaudo  | defaults             |
| Sin territorio        | tratamiento-datos, gestion-financiera                              | defaults             |
| TYP (funnels)         | `gracias/*` (10 páginas)                                           | misma del origen     |

---

## Componentes nuevos creados durante la migración

- **`<app-projection-cards>`** (`src/app/secciones/projection-cards/`).
  Grid 3 cols de flip cards con forma orgánica de marca. Input
  `cards: ProjectionCard[]`. Showcased en `/ux`. Consume CSS vars del
  ancestro: `--shape-x`, `--shape-y`, `--shape-rotation`, `--color-primary`,
  `--color-cta`.
- **`<app-content-footer>`** (`src/app/secciones/content-footer/`). Wrapper
  rico del footer con logos partner band + columnas de links + el
  `<app-footer>` interno. Input `template: FooterTemplate`. Background +
  border-top responden a CSS vars (`--color-bg-light`, `--color-cta`).
- **`<app-palette-fab>`** (`src/app/secciones/palette-fab/`). FAB flotante
  que conmuta plantilla territorial, tipo de menú y ajustes de "forma
  orgánica" (proyección y tribute) en vivo. Persiste en localStorage.

## Componentes modificados estructuralmente

- **`<app-tribute-section>`**: añadidos borde blanco 6px + forma orgánica
  rotada (CSS vars `--tribute-x/y/rotation/size`). Mantiene los 2 botones
  CTA originales (WhatsApp + phoneClick).
- **`<app-header-page-section>`**: ahora acepta `<ng-content>` que se
  proyecta sobre el "ojo" blanco de la curva inferior del banner (usado
  para H1 + progress-bar de la página).
- **`<app-footer>`** (regla de marca · ver memory feedback): **NO** debe
  tener background propio. Cada página provee el backdrop.
- **`<app-progress-bar>`**: width fija 240px (antes 20%). Consume
  `var(--color-progress, var(--color-cta, #fd8e13))`.
- **`<app-header-menu>`** (botones tradicional): "Pagar factura" usa
  `--color-cta` como bg; "Iniciar sesión" usa `--color-cta` como border.

---

## Sistema de territorios

3 territorios (`duelo`, `prevision`, `vida`) × 3 plantillas cada uno = 9
plantillas combinadas (`{territorio}-{variante}`). Definidas en
`palette-fab.ts` constante `TERRITORY_GROUPS`.

**Aplicación de la paleta**: cada página inyecta CSS vars en el host vía
host bindings de Angular:

```typescript
host: {
  '[attr.data-territory]':   'territoryAttr()',
  '[attr.data-template]':    'templateAttr()',
  '[style.--color-primary]':   'activePalette()?.primary',
  '[style.--color-secondary]': 'activePalette()?.secondary',
  '[style.--color-accent]':    'activePalette()?.accent',
  '[style.--color-cta]':       'activePalette()?.cta',
  '[style.--color-bg-light]':  'activePalette()?.bgSoft',
  '[style.--color-progress]':  'activePalette()?.progressColor',
  // Forma orgánica de proyección (flip cards M·V·P):
  '[style.--shape-rotation]':  'shapeCss().rotation',
  '[style.--shape-x]':         'shapeCss().x',
  '[style.--shape-y]':         'shapeCss().y',
  // Forma orgánica del tribute-section (banner):
  '[style.--tribute-rotation]': 'tributeShapeCss().rotation',
  '[style.--tribute-x]':        'tributeShapeCss().x',
  '[style.--tribute-y]':        'tributeShapeCss().y',
  '[style.--tribute-size]':     'tributeShapeCss().size',
}
```

`territoryAttr()` retorna el territorio base aunque no haya plantilla
activa (ej. `/microseguros` por defecto retorna `'prevision'`).

**`progressColor` (override)**: opcional en `Palette`. Solo definido en
las 3 plantillas donde el `cta` queda cromáticamente cerca del `primary`
(Coral · amarillo, Natural · naranja, Vibrante · verde menta).

---

## Convenciones de diseño establecidas

### Tipografía

- **Todos los títulos en Raleway** (override del manual que decía Hind
  Vadodara/Comfortaa para algunos territorios). Mismo lenguaje en toda
  la página.
- Patrón h1/h2 con dos líneas: primera línea `font-weight: 300`, segunda
  en `<span>` `font-weight: 700` más grande (4.25rem desktop). Ejemplo:
  `<h2>Serfuncoop <br /><span>Los Olivos</span></h2>`.
- `clamp()` para sizes responsive.

### Reglas de marca (NO negociables)

- **No usar tonos negros** ni sombras fuertes. Si necesitas oscurecer,
  usa el color primary del territorio con multiply o transparencia.
- **Footer global transparente** (`<app-footer>` sin background propio).
- Tarjetas/cards con fondo neutro usan `#f0f0f0` y hover `#eaeaea`
  (consistencia: timeline-card, mvp-card-back, assistance-grid).
- Border sutil en cards: `1px solid rgba(15, 23, 42, 0.06)` +
  `box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04)`.

### Forma orgánica de marca

Cuadrado redondeado **siempre 1:1** rotado con transparencia. Aplica:
- `border-radius: 48px`
- `opacity: 0.65`
- `background: var(--color-primary)`
- Defaults proyección: `rotation: 17deg, x: -9%, y: 65%` (forma fija 100% width)
- Defaults tribute: `rotation: -15deg, x: 60%, y: 0%, size: 35%`

El FAB tiene sliders para ajustarlos en vivo + texto copiable con los
valores actuales (rango X/Y: -100% a 150%; rotation: -180° a 180°;
tribute size: 0–1000%).

### Layouts compartidos (replicar en páginas nuevas)

- `.benefits` wrapper (padding `0 10% 60px`; mobile `0 5% 40px`).
- `.benefits-header` con h2 + progress-bar.
- `.section-tributes` (rounded card con `background-tributes.svg`).
- `.container-columns` (grid 1.4fr+1fr texto+imagen, alternancia con
  `--reverse`, full-width con `--solo`).
- `<app-header-page-section>` proyecta `<div class="page-title">` con h1 y
  progress-bar.

---

## Estado de cumplimiento por página migrada

Estos quedan pendientes de **verificación visual + SSR + responsive
1280/768**. Hasta entonces, no marcar como "done":

- `/nosotros`: build limpio, render verificado parcialmente en dev. Header
  con título proyectado, sección Historia + Fechas Memorables (timeline
  4x4 con last row vacío en col 4), sección Proyección con flip cards.
- `/microseguros`: build limpio, **no verificado en navegador todavía**.
  5 productos en `.products-list`, asistencias en grid 2 cols con FA
  icons, link inline a `aseguradorasolidaria.com.co` con tracking
  `partner_click`.

---

## Memory feedback (regla persistente del usuario)

- **Footer global transparente**: `<app-footer>` no debe tener background
  propio; cada página provee el backdrop, no se toca el componente.

---

## Plan original (referencia histórica)

Estaba en `C:/Users/.../\.claude/plans/ok-ahora-vamos-a-smooth-crayon.md`
(local de mi instalación, no transfiere). Las decisiones de proceso vivas
arriba sobreescriben lo que decía el plan inicial — sobre todo el cambio
"migrar todo antes de verificar".
