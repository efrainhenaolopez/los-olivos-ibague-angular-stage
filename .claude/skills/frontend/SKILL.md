---
name: frontend-angular
description: Genera componentes Angular consistentes, reutilizables y alineados al diseño del proyecto
---

# Frontend Angular Skill

Genera componentes, páginas y secciones UI consistentes con la arquitectura del proyecto.
---

## OBJETIVO

- Crear interfaces limpias y reutilizables
- Mantener consistencia visual
- Seguir buenas prácticas Angular
- Facilitar mantenimiento y escalabilidad
---

## REGLAS OBLIGATORIAS

### 1. COMPONENTES

- Usar standalone components
- Sin NgModules
- Imports explícitos

Ejemplo:

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
})
---

### 2. ESTRUCTURA

Separar correctamente:

- paginas → vistas completas
- componentes → reutilizables
- secciones → bloques de página
- servicios → lógica
---

### 3. NOMENCLATURA

- Archivos: kebab-case
- Clases: PascalCase
- Selectores: app-nombre

Ejemplo:

home-page.component.ts  
HomePageComponent  
app-home-page  
---

### 4. HTML

- Estructura semántica clara
- Evitar divs innecesarios
- Código limpio y legible
- Usar Angular directives correctamente
- Usar recomendaciones SEO Skill

Ejemplo:

<header></header>
<main></main>
<section></section>
---

### 5. SCSS

- SCSS por componente
- Uso de anidación controlada
- Evitar estilos globales innecesarios

- Breakpoint base:

@media (max-width: 768px)
---

### 6. DISEÑO

- Consistencia visual obligatoria
- Uso de variables de color
- Tipografía coherente
---

### 7. REUTILIZACIÓN

- Evitar duplicar UI
- Extraer componentes comunes
- Usar inputs/outputs
---

### 8. INTERACCIÓN

- Manejar eventos con métodos claros
- Evitar lógica compleja en template
---

### 9. FORMULARIOS

- Usar ReactiveFormsModule
- Validaciones claras
- Feedback visual al usuario
---

### 10. ROUTING

- Lazy loading en páginas
- Rutas claras y organizadas
---

## PROHIBIDO

- frameworks UI externos (Material, Bootstrap, etc.)
- lógica compleja en HTML
- estilos inline
- duplicación de componentes
---

## BUENAS PRÁCTICAS

- Componentes pequeños
- Código legible
- Separación de responsabilidades
- Reutilización constante
---

## PATRONES COMUNES

### Evento

onClick(): void {}
---

## REGLAS OBLIGATORIAS

### TIPADO

- PROHIBIDO usar `any`
- Usar interfaces o tipos explícitos

Ejemplo:

items: ItemInterface[] = [];

---

### CONDICIONALES

USAR:

Nueva sintaxis (preferido):

@if (condition) {
  <div></div>
}

Alternativa válida:

<div *ngIf="condition"></div>

- Mantener consistencia en todo el proyecto

---

### LISTADOS

USAR:

@for (item of items; track item.id) {
  <div></div>
}

EVITAR:

*ngFor sin trackBy

## CHECKLIST

Antes de generar:

- ¿Es standalone?
- ¿Está bien nombrado?
- ¿Es reutilizable?
- ¿Tiene SCSS propio?
- ¿Está limpio y legible?

---

## RESULTADO ESPERADO

Componentes:

- consistentes
- escalables
- reutilizables
- alineados al proyecto
---

Aplicar siempre estas reglas sin excepción.