---
name: seo-angular
description: Optimiza aplicaciones Angular (SSR) para indexación, estructura semántica y posicionamiento orgánico
---

# SEO Angular Skill

Este skill asegura que todo el código generado esté optimizado para indexación, visibilidad en buscadores y conversión.
---

## OBJETIVO

- Maximizar indexación en buscadores
- Mejorar visibilidad orgánica
- Aumentar tráfico cualificado
- Optimizar contenido para conversión
---

## REGLAS OBLIGATORIAS

### 1. SSR / PRERENDER (CRÍTICO)

- Todo contenido SEO debe renderizarse en servidor
- No depender de JavaScript para contenido principal

USAR:
- RenderMode.Prerender (preferido)
- RenderMode.Server (si es dinámico)

EVITAR:
- RenderMode.Client en páginas importantes
---

### 2. METADATA (OBLIGATORIO POR PÁGINA)

Cada página debe incluir:

- title único (50–60 caracteres)
- meta description (140–160 caracteres)

Ejemplo:

this.title.setTitle('Servicios funerarios en Cali | Los Olivos');

this.meta.updateTag({
  name: 'description',
  content: 'Servicios funerarios en Cali con acompañamiento integral y atención humana.'
});
---

### 3. ESTRUCTURA SEMÁNTICA

- 1 solo h1 por página
- jerarquía correcta: h1 → h2 → h3

USAR:

<header>
<main>
<section>
<article>
<footer>
---

### 4. URLs SEO-FRIENDLY

- cortas y descriptivas
- sin parámetros innecesarios
- usar palabras clave naturales

Ejemplo:
SI: /servicios-funerarios  
NO: /page?id=123  
---

### 5. CONTENIDO INDEXABLE

- contenido visible en HTML SSR
- contenido presente en el render inicial

EVITAR:
- contenido cargado solo en cliente
- contenido dependiente de APIs sin SSR
---

### 6. ENLACES INTERNOS

- conectar páginas estratégicamente
- usar anchor text descriptivo

Ejemplo:

<a href="/servicios-funerarios">Servicios funerarios en Cali</a>
---

### 7. DATOS ESTRUCTURADOS (SCHEMA)

Incluir JSON-LD cuando aplique:

- Organization
- LocalBusiness
- Service

Ejemplo:

{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Los Olivos Cali"
}
---

### 8. INDEXACIÓN

- sitemap.xml actualizado
- robots.txt configurado
- evitar contenido duplicado

IMPORTANTE:
- actualizar sitemap cuando se creen nuevas páginas indexables
---

## BUENAS PRÁCTICAS

- contenido claro y útil
- evitar keyword stuffing
- optimizar títulos para CTR
- escribir para intención de búsqueda
- contenido escaneable (listas, subtítulos)
---

## CASOS COMUNES

### Página de servicio

- h1 claro
- descripción del servicio
- beneficios
- CTA
---

### Página de blog

- título optimizado
- subtítulos (h2)
- contenido estructurado
- enlaces internos
---

## PROHIBIDO

- múltiples h1
- metadata duplicada
- contenido sin SSR
- páginas sin description
- contenido oculto
- URLs con parámetros innecesarios
---

## VALIDACIÓN AUTOMÁTICA

Antes de generar código, verificar:

- ¿Tiene title único?
- ¿Tiene meta description?
- ¿Tiene h1?
- ¿Está renderizado en SSR?
- ¿Tiene estructura semántica?
- ¿Es indexable?

Si falla alguno, corregir antes de entregar.
---

## 🎯 RESULTADO ESPERADO

Código:

- indexable por Google
- semántico
- optimizado para CTR
- orientado a intención de búsqueda
- listo para posicionar
---

Aplicar siempre estas reglas sin excepción.