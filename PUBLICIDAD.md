# Documentación Técnica — Sección de Publicidad

> Archivo de referencia técnica del módulo de publicidad implementado en el footer.
> **No es un README.** Aquí se documenta el funcionamiento interno, la estructura
> y cómo extender o modificar el sistema de anuncios.
>
> **Versión actual:** Bloque compacto de publicidad a un costado del footer.
> Estética minimalista-premium: cada anuncio es una mini-tarjeta horizontal
> (thumbnail + tag + título + flecha). Sin descripciones, sin botones grandes,
> sin elementos que compitan con la información de los novios.

---

## 📍 Ubicación

La sección se renderiza **a un costado del footer** (no debajo), compartiendo
línea horizontal con los nombres, fecha y hashtag de los novios. En móvil y
tablet, las tarjetas bajan a una columna centrada debajo.

**Archivos involucrados:**

| Archivo        | Líneas aprox. | Contenido                                              |
|----------------|---------------|--------------------------------------------------------|
| `index.html`   | 402 — 433     | Layout de dos zonas: `.footer-main` + `.ads-rail`     |
| `styles.css`   | 2930 — 3180   | Estilos del rail lateral, responsive, a11y            |
| `script.js`    | 467 — 530     | Módulo `AdsManager` con render de mini-tarjetas       |

---

## 🎯 Filosofía de diseño

- **Los novios son los protagonistas**. La publicidad se ve, pero no grita.
- **Una sola línea visual** por anuncio: thumbnail + texto + flecha.
- **Sin descripciones largas**, sin CTA pesados, sin imagen grande.
- **Micro-animaciones** al hover: elevación sutil, brillo que cruza, flecha dorada.
- **Ubicación lateral** (no debajo) — el centro del footer queda libre.
- **Sin auto-rotación** ni carrusel: enlaces estáticos.

---

## 🏗️ Arquitectura

```
┌────────────────────────────────────────────────────────┐
│  index.html  →  layout de dos zonas (main + rail)      │
│  styles.css  →  estilos compactos + animaciones         │
│  script.js   →  AdsManager (render de <a class="ads-card">) │
└────────────────────────────────────────────────────────┘
            ↓
   Mini-tarjetas se inyectan al cargar la página
```

---

## 🧩 Estructura HTML

```html
<footer class="footer">
  <div class="footer-particles" id="footerParticles"></div>

  <div class="footer-layout">                <!-- flex row -->
    <div class="footer-main">                 <!-- zona principal: novios -->
      <div class="footer-hearts">…</div>
      <p class="footer-names">Yda & Emi</p>
      <p class="footer-date">…</p>
      <p class="footer-tag">#YdaYEmi2027</p>
    </div>

    <aside class="ads-rail" id="adsSection" aria-label="Publicidad">
      <span class="ads-rail-label">Publicidad</span>
      <div class="ads-rail-list" id="adsTrack">
        <!-- Inyectado por JS -->
      </div>
    </aside>
  </div>
</footer>
```

### IDs requeridos

| ID            | Función                                          |
|---------------|--------------------------------------------------|
| `adsSection`  | El `<aside>` contenedor. Se oculta si `ads = []` |
| `adsTrack`    | Lista donde se inyectan las mini-tarjetas        |

---

## 📐 Layout visual

### Desktop (≥ 900px)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                          ♥  ♥  ♥                                │
│                          Yda & Emi                              │
│                       15 de Mayo, 2027                          │
│                       #YdaYEmi2027                              │
│                              │     ╴ ╴ Publicidad ╴ ╴            │
│                              │      ┌────────────────────┐       │
│                              │      │ ♥  OFERTA          │       │
│                              │      │    Ahorra más... → │       │
│                              │      └────────────────────┘       │
│                              │      ┌────────────────────┐       │
│                              │      │ ✦  RECOMENDADO     │       │
│                              │      │    Tu luna de miel→│       │
│                              │      └────────────────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
         ↑ zona principal grande    ↑ rail de 220px (compacto)
```

### Móvil / Tablet (< 900px)

```
┌──────────────────────────────┐
│         ♥  ♥  ♥              │
│         Yda & Emi            │
│      15 de Mayo, 2027        │
│      #YdaYEmi2027            │
│                              │
│       ╴ ╴ Publicidad ╴ ╴     │
│  ┌────────────────────────┐  │
│  │ ♥  OFERTA             →│  │
│  │    Ahorra más...       │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ ✦  RECOMENDADO        →│  │
│  │    Tu luna de miel     │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

---

## ⚙️ El módulo `AdsManager`

```js
const AdsManager = {
    ads: [ /* EDITAR AQUÍ */ ],
    init() { /* oculta si vacío, renderiza */ },
    renderCards(container) { /* inyecta <a class="ads-card"> */ }
};
```

Sin carrusel, sin auto-rotación, sin indicadores: cada tarjeta es un enlace
estático. La discreción es por **diseño compacto** y **ubicación lateral**, no
por funcionalidad limitada.

---

## 📦 Esquema de un anuncio

| Campo            | Tipo     | Obligatorio | Descripción                                              |
|------------------|----------|-------------|----------------------------------------------------------|
| `id`             | `string` | ✅           | Identificador único                                      |
| `image`          | `string` | ❌           | URL del thumbnail. Si falta/falla, se muestra fallback   |
| `imageFallback`  | `string` | ❌           | Carácter/emoji si no hay imagen. Default: `★`            |
| `tag`            | `string` | ❌           | Etiqueta superior (ej: "Oferta")                         |
| `title`          | `string` | ✅           | Título principal (h3). Máximo ~28 chars o se trunca      |
| `url`            | `string` | ✅           | Destino del enlace                                       |
| `target`         | `string` | ❌           | `_blank` (defecto) o `_self`                             |

### Ejemplo

```js
{
    id: 'luna-miel-2027',
    image: 'https://ejemplo.com/thumb.jpg',
    imageFallback: '✦',
    tag: 'Recomendado',
    title: 'Tu luna de miel',
    url: 'https://ejemplo.com',
    target: '_blank'
}
```

> **El título se trunca con ellipsis** si es muy largo (`text-overflow: ellipsis`).
> Mantenlo en ~28 caracteres para que se vea bien en una sola línea.

---

## 🎨 Estilos y diseño

### Paleta usada (variables CSS existentes)

```css
var(--navy)         /* Fondo del footer */
var(--navy-light)   /* Degradados oscuros */
var(--sky-light)    /* Texto secundario */
var(--sky-dark)     /* Fondo del thumbnail fallback */
var(--gold)         /* Acento: tag, flecha hover */
var(--gold-lt)      /* Acento claro (fallback glyph) */
var(--ease)         /* Curva de animación */
```

### Anatomía de la mini-tarjeta

```
┌────────────────────────────────────────────┐
│ ┌──┐  ETIQUETA                          →  │
│ │♥ │  Título del anuncio                   │
│ └──┘                                       │
└────────────────────────────────────────────┘
  ↑   ↑                                     ↑
  │   │                                     └─ Flecha dorada (aparece en hover)
  │   └─ Texto (tag + título en una línea)
  └─ Thumbnail 42×42px
```

### Principios de la mini-tarjeta

| Elemento          | Estilo                                                   |
|-------------------|----------------------------------------------------------|
| Dimensiones       | 220px ancho × ~62px alto (desktop)                      |
| Padding           | 10px 12px                                                |
| Fondo             | `backdrop-filter: blur(10px)` + gradiente muy sutil      |
| Borde             | `1px solid rgba(168,197,217,0.12)` → dorado en hover    |
| Bordes redondeados| 12px                                                     |
| Thumbnail         | 42×42px cuadrado, gradiente navy, glyph dorado fallback  |
| Título            | 0.85rem, blanco, truncado con ellipsis                   |
| Tag               | 0.58rem, dorado, uppercase, tracking ancho               |
| Flecha            | Oculta por defecto; aparece en hover con color dorado    |
| Hover             | `translateY(-2px)` + borde dorado + brillo cruza         |

### Breakpoints responsive

| Pantalla              | Cambios                                              |
|-----------------------|------------------------------------------------------|
| `≤ 900px`             | Footer columna. Rail 100% ancho, max 320px          |
| `≤ 480px`             | Thumbnail 38px, padding reducido, font-size menor   |
| `prefers-reduced-motion` | Desactiva transiciones                            |

---

## ♿ Accesibilidad

| Característica             | Implementación                                       |
|----------------------------|------------------------------------------------------|
| Lectores de pantalla       | `aria-label="Publicidad"` en el `<aside>`            |
| Descripción del anuncio    | `aria-label="<title>"` en cada `<a>`                 |
| Texto semántico            | `<aside>` para contenido tangencial                  |
| Enlace seguro              | `rel="noopener noreferrer"` si `target="_blank"`     |
| Movimiento reducido        | `@media (prefers-reduced-motion: reduce)`            |
| Foco visible               | `:focus-visible` con borde y elevación               |
| Imágenes decorativas       | `alt=""` en thumbnails (son decorativos)             |
| Carga diferida             | `loading="lazy"` en cada `<img>`                     |
| Fallback robusto           | `onerror` cambia al glyph dorado                      |
| Título truncado            | `text-overflow: ellipsis` (no se pierde info, solo se recorta visualmente) |

---

## ➕ Cómo añadir un nuevo anuncio

1. Abre `script.js`.
2. Localiza el array `ads` dentro de `AdsManager` (línea ~478).
3. Añade un nuevo objeto al final:

   ```js
   {
       id: 'mi-anuncio-3',
       image: 'https://mi-cdn.com/thumb.jpg',  // opcional
       imageFallback: '★',
       tag: 'Promoción',
       title: 'Titulo del anuncio',
       url: 'https://destino.com',
       target: '_blank'
   }
   ```

4. **Listo.** Las mini-tarjetas se reconstruyen automáticamente.

---

## ➖ Cómo quitar todos los anuncios

Establece el array `ads` como vacío:

```js
ads: []
```

El `<aside id="adsSection">` se ocultará automáticamente
(`section.style.display = 'none'`), y el footer volverá a su layout
centrado original.

---

## 🛠️ Casos especiales

### Quiero un anuncio sin imagen (solo glyph)

```js
{
    id: 'anuncio-sin-img',
    image: '',        // vacío
    imageFallback: '★',
    title: 'Mi anuncio',
    url: '#'
}
```

### Quiero cambiar la posición del rail (ej. izquierda en vez de derecha)

En `styles.css`, el `.footer-layout` usa flex con `justify-content: center`.
Solo cambia el orden de los hijos en `index.html` o usa `flex-direction: row-reverse`.

### Quiero añadir/quitar campos en el esquema

El render usa `innerHTML` con condicionales, por lo que los campos opcionales
simplemente no se renderizan si están vacíos. Para añadir un campo nuevo (ej.
un precio), edita el HTML de la tarjeta en `renderCards()` y el CSS.

---

## 🔍 Rendimiento

- **`loading="lazy"`** en cada `<img>` (carga diferida).
- **`backdrop-filter`** solo en la mini-tarjeta (no en el contenedor completo).
- **Sin librerías externas** añadidas. GSAP (ya estaba) solo se usa para la
  animación de entrada con `ScrollTrigger`.
- **Sin listeners** en el módulo.
- **Cero impacto** si el array `ads` está vacío (sección se oculta).
- **CSS mínimo**: ~250 líneas para todo el rail, incluyendo responsive y a11y.

---

## 🧪 Pruebas recomendadas

| Caso                              | Resultado esperado                          |
|-----------------------------------|---------------------------------------------|
| `ads = []`                        | El rail desaparece, footer queda centrado   |
| 1 anuncio                         | Se muestra una sola mini-tarjeta lateral    |
| 2+ anuncios                      | Lista vertical de mini-tarjetas             |
| Hover sobre tarjeta               | Elevación + borde dorado + brillo + flecha  |
| Imagen rota                       | Se muestra el `imageFallback` (glyph)      |
| Título largo                      | Se trunca con ellipsis "..."                |
| Click en tarjeta                  | Abre en nueva pestaña (si `target="_blank"`)|
| Pantalla < 900px                  | Rail baja a columna centrada                |
| Pantalla < 480px                  | Padding y fuentes reducidos                 |
| `prefers-reduced-motion`          | Sin transiciones de hover                   |
| Pantalla < 480px + título largo   | Sigue truncándose con ellipsis              |

---

## 📌 Notas de mantenimiento

- Si renombras IDs en `index.html`, actualiza los `getElementById` en `AdsManager`.
- Si cambias la paleta del proyecto, los colores se ajustan automáticamente
  porque usan variables CSS (`--gold`, `--navy`, `--sky-light`).
- El rail es **completamente independiente** del resto de la app. Si decides
  eliminar la publicidad, basta con poner `ads: []` o quitar `AdsManager.init()`
  de `App.startModules()`.
- El layout `flex` del footer puede ajustarse libremente — cambiar el `gap`,
  la alineación o el ancho máximo del rail no afecta al resto de la página.
- Si en el futuro necesitas añadir más anuncios, considera aumentar el `gap`
  entre ellos o el `width` del rail para mantener la legibilidad.
