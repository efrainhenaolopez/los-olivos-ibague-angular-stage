---
name: performance-angular
description: Optimiza rendimiento en Angular para Core Web Vitals, carga rápida y eficiencia de recursos
---

# Performance Angular Skill

Este skill optimiza la velocidad, eficiencia y experiencia de usuario en aplicaciones Angular.
---

## OBJETIVO

- Mejorar Core Web Vitals
- Reducir tiempo de carga
- Minimizar peso de la aplicación
- Optimizar experiencia percibida
---

## REGLAS OBLIGATORIAS

### 1. CORE WEB VITALS (CRÍTICO)

Optimizar siempre:

- LCP < 2.5s
- CLS < 0.1
- INP < 200ms

Todo código debe contribuir directamente a estos valores.
---

### 2. CARGA INICIAL

- Reducir JS bloqueante
- Minimizar bundle inicial
- Priorizar contenido visible inmediato

EVITAR:
- loaders innecesarios
- render tardío de contenido crítico
---

### 3. FUENTES

- Máximo 2–3 familias
- Usar solo pesos necesarios
- Evitar rangos completos (100–900)

OPTIMIZAR:
- display=swap
- preconnect
---

### 4. IMÁGENES

- Usar webp o avif
- Lazy loading en imágenes no críticas

Ejemplo:
<img src="..." loading="lazy" alt="...">

- Optimizar imagen principal (LCP)
- No cargar imágenes fuera de viewport inicial
---

### 5. SCRIPTS

- Minimizar scripts externos
- Cargar de forma asíncrona

EVITAR:
- scripts que bloqueen render
- múltiples integraciones innecesarias
---

### 6. LAZY LOADING

- Implementar lazy loading en rutas

Ejemplo:
loadComponent: () => import('./page.component')

- Dividir features grandes
---

### 7. COMPONENTES

- Componentes pequeños
- Sin lógica pesada en ciclo de vida

EVITAR:
- procesamiento en ngOnInit
- cálculos complejos en render
---

### 8. CHANGE DETECTION

- Usar OnPush cuando sea posible

changeDetection: ChangeDetectionStrategy.OnPush

- Evitar renders innecesarios
---

### 9. REQUESTS

- Reducir número de requests
- Evitar duplicados
- Cachear cuando sea posible
---

### 10. RENDER Y DOM

- Usar bindings de Angular
- Evitar estructuras profundas innecesarias
- Minimizar re-renderizado
---

### 11. CSS

- CSS ligero
- Evitar frameworks pesados
- Eliminar estilos no usados
---

### 12. RESOURCE HINTS

Usar estratégicamente:

<link rel="preconnect">
<link rel="preload">

Solo para recursos críticos
---

## BUENAS PRÁCTICAS

- Mobile-first
- Código simple = mejor performance
- Reducir dependencias externas
- Evitar sobreingeniería
---

## CASOS COMUNES

### Página principal

- contenido visible inmediato
- optimizar LCP (imagen principal)
- evitar bloqueos de render
---

### Listados

- usar trackBy en *ngFor
- evitar render masivo
---

### Formularios

- validación ligera
- no bloquear UI
- evitar lógica pesada en submit
- evitar re-render completo
---

## PROHIBIDO

- librerías pesadas sin justificación
- múltiples fuentes
- imágenes sin optimizar
- lógica pesada en componentes
- requests redundantes
---

## VALIDACIÓN AUTOMÁTICA

Antes de generar código, verificar:

- ¿Reduce tiempo de carga?
- ¿Minimiza JS inicial?
- ¿Optimiza LCP?
- ¿Evita CLS?
- ¿Evita bloqueos de render?
- ¿Es ligero?

Si falla, optimizar antes de entregar.
---

## RESULTADO ESPERADO

Código:

- rápido
- ligero
- eficiente
- optimizado para Core Web Vitals
- listo para producción
---

Aplicar siempre estas reglas sin excepción.