# CLAUDE.md

Guía oficial para trabajar este proyecto con Claude Code.

---

## Contexto del Proyecto
- Angular 21 (standalone components, sin NgModules)
- SSR + Prerender con `@angular/ssr`
- Enfoque: SEO técnico + performance + conversión
- Proyecto: Los Olivos Tolima (servicios funerarios)
---

## Comandos
npm start                          # Dev server
npm run build                      # Build producción
npm run watch                      # Build en desarrollo
npm test                           # Tests (Vitest)
npm run serve:ssr:los-olivos-tolima  # SSR en puerto 4000
---

## Arquitectura
- src/main.ts → bootstrap navegador
- src/main.server.ts → bootstrap SSR
- src/server.ts → Express + SSR

Config:
- app.config.ts
- app.config.server.ts
- app.routes.ts
- app.routes.server.ts
---

## SSR y Renderizado
- Todas las páginas deben ser SSR o prerender
- Configurar en: app.routes.server.ts

Modos:
- RenderMode.Prerender → default (SEO)
- RenderMode.Server → dinámico
- RenderMode.Client → evitar
---

## SEO (CRÍTICO)
Cada página debe tener:

- title único
- meta description
- estructura semántica (h1, h2, h3)
- contenido visible en SSR

Reglas:
- URLs limpias (/servicios/x, /componentes/x,)
- No contenido crítico cargado solo por JS
- No bloquear render con scripts
- Cada vez que crees un componente, optimízalo para SEO de acuerdo al skill seo-angular
- Crear los componentes en blanco (*.html, *.scss y *.ts), esperar indicaciones sobre su contenido.
---

## PERFORMANCE (PRIORIDAD ALTA)

### Fuentes
- Máximo 2–3 fuentes activas
- Reducir pesos (no usar 100–900 completos)
- Evaluar self-hosting en producción

### Scripts
- No cargar scripts externos en HTML directamente
- GTM solo via GtmService
- Evitar librerías innecesarias

### Angular
- Lazy loading en rutas
- Componentes livianos
- Evitar lógica pesada en ngOnInit

### DOM
- NO usar document.querySelector
- NO manipulación manual del DOM
---

## Tracking (GTM)

- dataLayer se define en index.html
- Script GTM se carga desde GtmService
- No duplicar gtm.start

Uso:

this.gtm.push({ event: 'lead' });
this.gtm.trackPageView(url);
---

## Testing

- Vitest
- Archivos *.spec.ts
- Tests junto al código
---

## Estilos

- SCSS
- Global: src/styles.scss
- Componentes encapsulados
---

## TypeScript

- strict mode activo
- evitar any
- código tipado
---

## REGLAS PARA CLAUDE (OBLIGATORIO)

### Arquitectura
- SIEMPRE standalone components
- NO NgModules
- Seguir estructura existente

### Código
- Funciones pequeñas
- No duplicar lógica
- Usar servicios

### Angular
- No manipular DOM
- Validar SSR:

if (typeof window !== 'undefined')

### Routing
- Lazy loading obligatorio en features grandes
- URLs SEO-friendly

### Performance
- No agregar librerías innecesarias
- Reducir peso de fuentes
- Evitar múltiples requests externos

### Tracking
- Usar solo GtmService
- No duplicar eventos

### SEO
- No páginas sin metadata
- No romper SSR
- Priorizar contenido renderizado

---

## PROHIBIDO

- NgModules
- jQuery
- DOM manual
- duplicar GTM
- scripts inline innecesarios
- fuentes excesivas
---

## Convenciones
- feature-name.component.ts
- feature-name.service.ts
- estructura por feature

## Estructura de carpetas
- src/app/componentes/nombre/  → componentes y páginas
- src/app/servicios/           → servicios Angular
---

## Prioridades
1. Performance
2. SEO
3. Código limpio
4. Escalabilidad
---

## Objetivo
- Posicionamiento orgánico
- Generación de leads
- Alta velocidad de carga
- Experiencia fluida
---

Mantener código limpio, rápido y optimizado.