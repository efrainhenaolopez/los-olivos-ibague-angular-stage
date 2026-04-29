---
name: security-angular
description: Aplica buenas prácticas de seguridad en Angular (SSR, frontend y manejo de datos)
---

# Security Angular Skill

Este skill garantiza código seguro, robusto y listo para producción en aplicaciones Angular con SSR.
---

## OBJETIVO

- Prevenir vulnerabilidades frontend y SSR
- Proteger datos sensibles
- Asegurar integraciones externas
- Reducir superficie de ataque
---

## REGLAS OBLIGATORIAS

### 1. VALIDACIÓN DE ENTORNO (SSR)

Validar siempre acceso a APIs del navegador:

if (typeof window !== 'undefined')

Nunca usar directamente:
- window
- document
- localStorage
- sessionStorage
---

### 2. MANEJO DEL DOM

PROHIBIDO:

- document.querySelector
- innerHTML sin control
- manipulación manual del DOM

USAR:
- bindings de Angular
- directivas
- Renderer2 (solo si es necesario)
---

### 3. PREVENCIÓN DE XSS

- No usar [innerHTML] con contenido dinámico
- Angular ya sanitiza automáticamente → confiar en ello

IMPORTANTE:
- Evitar bypassSecurityTrustHtml excepto en casos controlados y seguros
---

### 4. DATOS DEL USUARIO

- Nunca confiar en inputs del cliente
- Validar y sanitizar en frontend y backend
- Aplicar validaciones estrictas
---

### 5. DATOS SENSIBLES

PROHIBIDO:

- API keys en frontend
- tokens expuestos
- credenciales en código

USAR:
- backend
- variables de entorno seguras
---

### 6. REQUESTS Y APIs

- Validar respuestas con tipado estricto
- Manejar errores siempre

Ejemplo:

if (!response || typeof response !== 'object') return;

- No confiar en datos externos
---

### 7. HEADERS DE SEGURIDAD (SSR)

Configurar en servidor:

- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Referrer-Policy
- Permissions-Policy
---

### 8. PROTECCIÓN CSRF

- Usar tokens CSRF en formularios sensibles
- Validar en backend
---

### 9. INTEGRACIONES EXTERNAS

- Centralizar scripts (ej: GtmService)
- No insertar scripts sin control
- No duplicar cargas
---

### 10. STORAGE

- No guardar datos sensibles en localStorage
- Preferir cookies httpOnly desde backend
---

### 11. LOGS

PROHIBIDO en producción:

- console.log con datos sensibles
- exponer errores internos
---

## BUENAS PRÁCTICAS

- Código defensivo
- Tipado estricto
- Manejo de errores
- Separación de responsabilidades
---

## CASOS COMUNES

### Formularios

- Validación estricta
- Sanitización
- Protección CSRF
- Imperativo: reCAPTCHA en endpoints críticos
---

### Tracking

- No enviar datos sensibles
- Centralizar eventos
---

### SSR

- Evitar lógica dependiente del navegador
- Validar entorno
---

## PROHIBIDO

- Manipulación directa del DOM
- Uso inseguro de innerHTML
- Exponer tokens
- Confiar en datos del cliente
- Scripts externos sin control
---

## VALIDACIÓN AUTOMÁTICA

Antes de generar código, verificar:

- ¿Hay riesgo de XSS?
- ¿Se valida SSR?
- ¿Se exponen datos sensibles?
- ¿Se validan inputs?
- ¿Se usan headers de seguridad?

---

## RESULTADO ESPERADO

Código:

- Seguro
- Estable
- Sin vulnerabilidades comunes
- Compatible con SSR
- Listo para producción
---

Aplicar siempre estas reglas sin excepción.