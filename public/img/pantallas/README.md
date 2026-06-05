# Assets · Pantallas de sedes

Estos archivos los consumen las vistas de `/obituarios-salas` y
`/obituarios-recepcion`. Los `.svg` actuales son **placeholders
geométricos** para que la página funcione mientras se obtienen los
archivos definitivos del cliente (la plantilla Canva original).

## Reemplazar por los del cliente

Cuando lleguen los assets oficiales, conservar **el nombre y la
extensión** para que el HTML no requiera cambios:

| Archivo               | Uso                                      | Tamaño sugerido |
|-----------------------|------------------------------------------|-----------------|
| `cinta-morada.svg`    | Cinta de seda morada centrada            | 200×280 px      |
| `flores-superior.svg` | Rama de cerezo · esquina superior izq.   | 400×400 px      |
| `flores-inferior.svg` | Rama de cerezo · esquina inferior der.   | 400×400 px      |
| `logo-olivos.svg`     | Logotipo "Los Olivos · Un homenaje al amor" | 220×70 px    |

Si los archivos originales son PNG, renombrar la extensión también en
[`vista-obituario.html`](../../../src/app/pages/pantallas/obituarios-salas/vistas/vista-obituario.html)
(buscar `.svg` y reemplazar por `.png`).

## Tipografía script (cursive)

Los títulos cursive ("En memoria de", "Sala:", "Exequias", "Destino Final",
"Honramos tu amor") usan la familia `'Great Vibes', 'Brush Script MT', cursive`.
Si quieres que se vea **idéntico** en todas las pantallas (en lugar de caer
al fallback del sistema), self-hostea Great Vibes:

1. Descarga `GreatVibes-Regular.woff2` desde Google Fonts.
2. Colócalo en `public/fonts/GreatVibes-Regular.woff2`.
3. Añade en `src/styles.scss`:

```scss
@font-face {
  font-family: 'Great Vibes';
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/GreatVibes-Regular.woff2') format('woff2');
}
```
