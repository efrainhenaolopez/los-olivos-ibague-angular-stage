# SKILL — Manual de Identidad de Marca · Los Olivos

**Invocación:** `/manual-de-marca`

Skill local del proyecto. Encapsula todas las reglas del Manual de Manejo de Identidad de Marca de Los Olivos. Debe consultarse antes de diseñar cualquier componente visual, sección del portal o pieza gráfica.

---

## IDENTIDAD GLOBAL

| Campo | Valor |
|-------|-------|
| Marca | Los Olivos |
| Tagline | *Un homenaje al amor* |
| Web | www.losolivos.co |
| Contexto | Empresa colombiana de servicios exequiales y previsión familiar |

**Logo principal:** Isotipo (hoja/llama en verde y dorado) + logotipo "Los Olivos" donde "Los" aparece en superíndice pequeño.

---

## ELEMENTOS GRÁFICOS COMUNES (todos los territorios)

Estos elementos son transversales a los tres territorios de comunicación.

### El Infinito

Figura formada combinando las siluetas de los dos íconos del logo. Simboliza la esperanza de vida eterna en el contexto funerario.

**Reglas:**
- Se usa para **abrir o cerrar** las piezas (parte superior o inferior)
- Un lado siempre en **blanco** — contiene el logo Los Olivos en policromía
- El lado opuesto va en **un tono del fondo** (degradé del territorio activo)
- **Nunca** se cruza con el Contenedor Orgánico

### El Contenedor Orgánico

Forma libre para enmarcar fotos o textos. Existen 3 siluetas (forma-1, forma-2, forma-3) con variaciones. Se pueden rotar o invertir libremente.

**Reglas:**
- **Siempre sangrado** por al menos uno de sus lados (nunca flotando)
- Ocupa **máximo el 40%** de la pieza
- No se cruza con el Infinito
- Cuando contiene una foto, parte de la foto sobresale del contenedor
- **Variante foto insertada:** el fondo de color es protagonista
- **Variante foto sangrada:** la foto ocupa todo el fondo, la forma orgánica enmarca el texto

### Normas Generales de Layout

- Recursos de diseño: mínimo **3**, máximo **7** por pieza
- Redes sociales e información de contacto: siempre en la **esquina inferior izquierda**
- Fondo: **degradé ligero** usando los colores del territorio activo
- El logo Los Olivos y el elemento infinito son presencia fija en toda pieza

---

## TERRITORIOS DE COMUNICACIÓN

Los Olivos opera con **tres territorios** distintos. Cada sección del portal debe identificar su territorio y aplicar sus normas específicas.

---

## TERRITORIO 1 — DUELO

**Descripción:** Comunicación del servicio exequial. Acompañamiento en el momento de la pérdida. Dignidad, serenidad, empatía.

### Paleta de Colores — DUELO

**Colores tinta plana (Pantone + HEX):**

| Pantone | HEX | RGB | Descripción |
|---------|-----|-----|-------------|
| 4168 C | `#234b50` | R:35 G:75 B:80 | Verde teal muy oscuro |
| 7475 C | `#477A7B` | R:71 G:122 B:123 | Teal medio |
| 551 C  | `#A7C9D2` | R:167 G:201 B:210 | Azul lavanda claro |
| 2343 C | `#A94D69` | R:169 G:77 B:105 | Rosa/malva |
| 681 C  | `#B7718F` | R:183 G:113 B:143 | Rosa medio |
| 667 C  | `#77608B` | R:119 G:96 B:139 | Morado medio |
| 521 C  | `#A183B5` | R:161 G:131 B:181 | Lila |

**Degradados disponibles — valores completos (claro → oscuro):**

| Nombre | HEX claro | CMYK claro | HEX oscuro | CMYK oscuro |
|--------|-----------|------------|------------|-------------|
| Teal oscuro | `#234b50` | C:86 M:30 Y:37 K:55 | `#182e39` | C:88 M:30 Y:60 K:70 |
| Teal medio | `#477A7B` | C:70 M:25 Y:36 K:21 | `#274149` | C:82 M:38 Y:48 K:60 |
| Azul claro | `#A7C9D2` | C:35 M:6 Y:4 K:0 | `#5F9793` | C:65 M:10 Y:45 K:10 |
| Rosa/malva | `#A94D69` | C:14 M:80 Y:31 K:17 | `#5B132C` | C:20 M:100 Y:40 K:70 |
| Rosa medio | `#B7718F` | C:22 M:66 Y:15 K:5 | `#712B48` | C:25 M:90 Y:23 K:45 |
| Morado | `#77608B` | C:55 M:68 Y:8 K:8 | `#240E36` | C:90 M:100 Y:0 K:70 |
| Lila | `#A183B5` | C:40 M:55 Y:0 K:0 | `#3E2455` | C:80 M:95 Y:0 K:45 |

**Colores de texto:**
- Crema/amarillo suave `#EEF6F8` aprox. — sobre fondos oscuros del territorio
- Teal oscuro `#234b50`
- Negro `#000000`
- Blanco `#ffffff`
- Borgoña/vino `#5B132C`

> **Color más claro para fondos digitales:** `#EDF5F7` (tint muy suave del azul claro `#A7C9D2`). Aplicar en body, navbar y footer del portal.

**Variables CSS sugeridas:**
```css
:root[data-territory="duelo"] {
  --color-primary:   #234b50;
  --color-secondary: #477A7B;
  --color-accent:    #A94D69;
  --color-bg-from:   #234b50;
  --color-bg-to:     #182e39;
  --color-bg-light:  #EDF5F7;  /* body / navbar / footer digital */
  --color-text:      #ffffff;
  --color-text-alt:  #A7C9D2;
  --font-headline:   'Hind Vadodara', 'Comfortaa', sans-serif;
  --font-body:       'Raleway', sans-serif;
}
```

### Tipografía — DUELO

| Rol | Fuente | Pesos |
|-----|--------|-------|
| Titulares | **Hind Vadodara** o **Comfortaa** (negrita o normal) | Light · Regular · Medium · Semibold · **Bold** |
| Cuerpo | **Raleway** o **Comfortaa** | Thin · Extralight · Light · Regular · Medium · Semibold · **Bold** · **Extrabold** · Black |

### Íconos Complementarios — DUELO

- **Hoja (leaf):** En amarillo o desenfocada como sombra — uso **facultativo**
- **Prohibido:** círculos rayados, asteriscos ornamentales, líneas onduladas (son de Previsión/Vida)

### Estilo Fotográfico — DUELO

**Usar:**
- Equilibrio emocional: ni triste ni alegre. Sobria, empática
- Apoyo familiar, compañía, unión
- Personas **siempre acompañadas** — nunca solas en actitud de soledad
- Rasgos **latinoamericanos**
- Tonalidades claras, buena iluminación, sin contrastes muy fuertes
- Pueden evocar momentos importantes de la vida del difunto

**NUNCA usar en DUELO:**
- Niños
- Otoño o atardecer como cliché
- Simbología religiosa (cruces, vírgenes, santos)
- Imágenes de dolor, angustia, llanto
- Féretros o ceremonias fúnebres
- Personas aisladas en actitud de sufrimiento

### Tono de Voz — DUELO
Sobrio · Digno · Empático · Acompañante

Transmite presencia humana en el momento difícil. Evita eufemismos vacíos. Cercano sin invadir. Nunca frío ni corporativo.

---

## TERRITORIO 2 — PREVISIÓN

**Descripción:** Planes de previsión exequial. Venta de tranquilidad y protección familiar a futuro. Emocional, positivo, esperanzador.

### Paleta de Colores — PREVISIÓN

**Colores tinta plana (Pantone + HEX):**

| Pantone | HEX | Descripción |
|---------|-----|-------------|
| 421 C  | `#C8CCCC` | Gris claro |
| 2298 C | `#8CE63C` | Verde lima vibrante |
| 709 C  | `#EB6E82` | Rosa coral |
| 2008 C | `#F0A33D` | Naranja cálido |
| 1645 C | `#E65C36` | Naranja intenso |
| 7472 C | `#59AB9B` | Verde agua/menta |

**Degradados disponibles (claro → oscuro):**

| Nombre | HEX claro | HEX oscuro |
|--------|-----------|------------|
| Gris | `#E7E7E7` | `#C8CCCC` |
| Rosa/coral | `#EB6E82` | `#DC4C5A` |
| Vino/rojo oscuro | `#9B2A40` | `#6B1028` |
| Naranja | `#F0A33D` | `#E65C36` |
| Verde lima | `#B4FF5A` | `#8CE63C` |
| Amarillo | `#FEF88B` | `#F9D886` |
| Verde agua | `#8FDDAA` | `#59AB9B` |

> **Nota:** El degradado Vino `#9B2A40 → #6B1028` es la variante más oscura del territorio Previsión, aceptable para contextos solemnes o institucionales dentro de este territorio.

**Colores de texto:**
- Gris `#C8CCCC`
- Verde lima `#B4FF5A`
- Negro `#000000`
- Rosa/coral `#DC4C5A`
- Dorado/naranja `#F0A33D`
- Blanco `#ffffff`

> **Color más claro para fondos digitales:** `#FFF2F4` para temas cálidos (coral/vino), `#F5FDE8` para temas fríos (lima/menta). Aplicar en body, navbar y footer del portal.

**Variables CSS sugeridas:**
```css
:root[data-territory="prevision"] {
  --color-primary:   #DC4C5A;
  --color-secondary: #8CE63C;
  --color-accent:    #F0A33D;
  --color-bg-from:   #EB6E82;
  --color-bg-to:     #DC4C5A;
  --color-bg-light:  #FFF2F4;  /* body / navbar / footer digital (tema cálido) */
  --color-text:      #000000;
  --color-text-alt:  #ffffff;
  --font-headline:   'Comfortaa', sans-serif;
  --font-body:       'Raleway', sans-serif;
}
```

### Tipografía — PREVISIÓN

| Rol | Fuente | Pesos |
|-----|--------|-------|
| Titulares | **Comfortaa** | Light · Regular · **Bold** |
| Cuerpo | **Raleway** | Thin · Extralight · Light · Regular · Medium · Semibold · **Bold** · Extrabold · Black |

### Íconos Complementarios — PREVISIÓN (USO OBLIGATORIO)

Deben aparecer en toda pieza del territorio previsión:

| Ícono | Color | Obligatoriedad |
|-------|-------|----------------|
| Círculo con rayas diagonales | Rosa/coral | Obligatorio |
| Asteriscos ornamentales (*) | Amarillo dorado | Obligatorio |
| Líneas onduladas (olas) | Rosa/coral | Obligatorio |

- **Prohibido:** Hoja (leaf)

### Estilo Fotográfico — PREVISIÓN

**Usar:**
- Escenas de familia: día a día, cariñosas, sobresalientes
- **Siempre con personas** (mascotas cuentan como personas)
- Emociones reales y positivas, sentimentales
- Rasgos latinoamericanos
- Tonalidades claras, buena iluminación sin contrastes fuertes

**NUNCA usar:**
- Simbología religiosa
- Personas con rasgos muy marcados, asiáticos o pelirrojos

### Tono de Voz — PREVISIÓN
Familiar · Emocional · Esperanzador · Reflexivo

Habla del amor por la familia y la tranquilidad de protegerlos. Cercano, sin tecnicismos. Invita a reflexionar sobre el legado que se quiere dejar.

---

## TERRITORIO 3 — VIDA

**Descripción:** Beneficios y experiencias para afiliados. Programa "Más vida para ti". Vitalidad, alegría, disfrute del presente.

### Paleta de Colores — VIDA

**Colores tinta plana (Pantone + HEX):**

| Pantone | HEX | RGB | Descripción |
|---------|-----|-----|-------------|
| 198 C  | `#E97783` | R:233 G:119 B:131 | Rosa vibrante |
| 1645 C | `#F0A33D` | R:240 G:163 B:61  | Naranja cálido |
| 2011 C | `#EFC45B` | R:239 G:196 B:91  | Ámbar/dorado |
| 134 C  | `#F8E5B0` | R:248 G:229 B:176 | Crema/amarillo suave |
| 2268 C | `#B4E379` | R:180 G:227 B:121 | Verde claro/lima |
| 7472 C | `#8FDDAA` | R:143 G:221 B:170 | Verde agua/menta |

**Degradados disponibles — valores completos (claro → oscuro):**

| Nombre | HEX claro | CMYK claro | HEX oscuro | CMYK oscuro |
|--------|-----------|------------|------------|-------------|
| Rosa/coral | `#E97783` | C:0 M:65 Y:30 K:0 | `#CF4545` | C:0 M:90 Y:65 K:0 |
| Naranja | `#F0A33D` | C:0 M:40 Y:90 K:0 | `#E65C36` | C:0 M:78 Y:80 K:0 |
| Ámbar/dorado | `#EFC45B` | C:0 M:16 Y:68 K:0 | `#EE943A` | C:0 M:50 Y:93 K:0 |
| Crema | `#F8E5B0` | C:0 M:1 Y:29 K:0 | `#F4C24B` | C:0 M:20 Y:77 K:0 |
| Verde claro | `#B4E379` | C:29 M:0 Y:64 K:0 | `#6CD490` | C:50 M:0 Y:50 K:0 |
| Verde agua | `#8FDDAA` | C:40 M:2 Y:38 K:0 | `#59AB9B` | C:65 M:11 Y:26 K:5 |

**Colores de texto:**
- Crema/amarillo `#F8E5B0` — (el más claro, para texto sobre fondos oscuros)
- Verde lima `#B4E379`
- Blanco `#ffffff`
- Rojo/coral `#CF4545`
- Teal oscuro `#234b50`
- Negro `#000000`

> **Color más claro para fondos digitales:** `#FEF9EF` (tint suave de la crema `#F8E5B0`). Para temas verdes usar `#F2FAF5`. Aplicar en body, navbar y footer del portal.

**Variables CSS sugeridas:**
```css
:root[data-territory="vida"] {
  --color-primary:   #CF4545;
  --color-secondary: #EFC45B;
  --color-accent:    #6CD490;
  --color-bg-from:   #E97783;
  --color-bg-to:     #CF4545;
  --color-bg-light:  #FEF9EF;  /* body / navbar / footer digital */
  --color-text:      #ffffff;
  --color-text-alt:  #F8E5B0;
  --font-headline:   'Comfortaa', sans-serif;
  --font-body:       'Raleway', sans-serif;
}
```

### Tipografía — VIDA

| Rol | Fuente |
|-----|--------|
| Titulares | **Comfortaa** |
| Cuerpo | **Raleway** |

### Logo Adicional — "Más vida para ti" (OBLIGATORIO en VIDA)

- Logo propio del territorio: script "vida" + "Más" + "para ti"
- Subtítulo: *Experiencias para disfrutar*
- Puede usarse en cualquier color de la paleta VIDA
- **Posición:** siempre en el lado **opuesto** al logo Los Olivos
  - Los Olivos abajo → "Más vida para ti" arriba
  - Los Olivos arriba → "Más vida para ti" abajo

### Íconos Complementarios — VIDA (uso facultativo)

- Círculo con rayas diagonales
- Asteriscos ornamentales
- Líneas onduladas
- **Prohibido:** Hoja (leaf)

### Estilo Fotográfico — VIDA

**Usar:**
- Vitales, alegres, placenteras
- Disfrutar la vida, aprovechar lo que se tiene, experiencias
- Preferiblemente con personas (no obligatorio)
- Planos variados: abiertos, medios, close-up
- Rasgos latinoamericanos
- Tonalidades claras, buena iluminación

**NUNCA usar:**
- Simbología religiosa
- Personas con rasgos no latinoamericanos marcados

### Tono de Voz — VIDA
Vital · Energético · Positivo · Experiencial

Celebra el presente y los momentos únicos. Activo, cercano, moderno. Invita a disfrutar y a vivir intensamente cada etapa de la vida.

---

## TABLA COMPARATIVA DE TERRITORIOS

| Elemento | DUELO | PREVISIÓN | VIDA |
|----------|:-----:|:---------:|:----:|
| Paleta dominante | Teales, malvas, morados | Rosas, limas, naranjas | Rosas, naranjas, dorados |
| Titular | Hind Vadodara / Comfortaa | Comfortaa | Comfortaa |
| Cuerpo | Raleway / Comfortaa | Raleway | Raleway |
| Hoja (leaf) | Facultativo ✓ | ✗ | ✗ |
| Círculo rayado + asteriscos + ondas | ✗ | **Obligatorio** | Facultativo ✓ |
| "Más vida para ti" | ✗ | ✗ | **Obligatorio** |
| Niños en fotos | **NUNCA** | ✓ | ✓ |
| Personas solas | **NUNCA** | Solo con mascotas | ✓ |
| Tono emocional | Sobrio / empático | Familiar / esperanzador | Vital / alegre |

---

## TIPOGRAFÍAS — RESUMEN GLOBAL

Las tres fuentes se cargan desde Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;700&family=Raleway:wght@100;200;300;400;500;600;700;800;900&family=Hind+Vadodara:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

| Fuente | Rol | Territorios |
|--------|-----|-------------|
| Comfortaa | Titulares principales | Duelo, Previsión, Vida |
| Hind Vadodara | Titulares alternativos | Solo DUELO |
| Raleway | Cuerpo de texto | Duelo, Previsión, Vida |

---

## APLICACIÓN DIGITAL — PORTAL WEB

Reglas específicas para la implementación de los territorios en el portal web (AdminLTE + themes.css).

### Regla de color para fondos digitales

> **El color más claro de cada territorio es el fondo del body, la navbar superior y el footer.**

| Territorio | Sidebar (degradado) | Body / Navbar / Footer |
|------------|---------------------|------------------------|
| DUELO — Teal | `#234b50 → #182e39` | `#EDF5F7` |
| DUELO — Rosa/Púrpura | `#A94D69 → #5B132C` y variantes | `#FBF0F5` |
| PREVISIÓN — Cálido | `#9B2A40 → #6B1028` / `#EB6E82 → #DC4C5A` | `#FFF2F4` |
| PREVISIÓN — Natural | `#B4FF5A → #8CE63C` / `#8FDDAA → #59AB9B` | `#F5FDE8` |
| VIDA — Cálida | `#E97783 → #CF4545` / naranja / dorado | `#FEF9EF` |
| VIDA — Natural | `#B4E379 → #6CD490` / `#8FDDAA → #59AB9B` | `#F2FAF5` |

### Sidebars por tipo

**Sidebar oscuro (texto blanco):** Todos los degradados cuya versión clara tiene luminosidad < 60%. El texto del menú va en blanco o tint claro del color.

**Sidebar claro (texto oscuro):** Degradados cuya versión clara es muy luminosa — azul claro `#A7C9D2`, crema `#F8E5B0`, verde lima `#B4E379`/`#B4FF5A`, menta `#8FDDAA`. El texto del menú va en el color oscuro del mismo par.

### Acento de enlace activo (regla de contraste entre familias)

- Sidebar teal → acento rosa/borgoña del territorio
- Sidebar rosa/borgoña → acento teal del territorio
- Sidebar púrpura → acento rosa del territorio
- Sidebar cálido (naranja/rojo) → acento verde/menta del territorio
- Sidebar verde/menta → acento rojo/coral del territorio

### Referencia de implementación

El archivo `public/assets/css/themes.css` implementa los 18 temas (7 DUELO + 6 VIDA + 5 PREVISIÓN) usando `body[data-theme="nombre"]`. La selección se persiste en `localStorage` con la clave `olivos_theme`. La lista de temas disponibles está en `app/Views/layout/header.php`.

---

## CHECKLIST DE VALIDACIÓN

Antes de entregar cualquier componente visual o pantalla del portal:

- [ ] Territorio identificado (Duelo / Previsión / Vida)
- [ ] Paleta de colores correcta para el territorio
- [ ] Tipografía de titulares: Hind Vadodara o Comfortaa
- [ ] Tipografía de cuerpo: Raleway
- [ ] Contenedor orgánico sangrado por al menos un lado
- [ ] Contenedor orgánico ≤ 40% del espacio disponible
- [ ] Infinito presente (superior o inferior), no en el centro
- [ ] Fotos con rasgos latinoamericanos y equilibrio emocional correcto
- [ ] Íconos obligatorios presentes si es Previsión (círculo rayado, asteriscos, ondas)
- [ ] "Más vida para ti" en lado opuesto al logo Los Olivos si es Vida
- [ ] Redes/contacto en esquina inferior izquierda
- [ ] Sin simbología religiosa
- [ ] Sin niños en territorio Duelo
- [ ] 3 a 7 recursos de diseño por pieza
