# Skybound Scaling — logo files

Concept: **Clearance.** One disc, cut once on a 45 degree rising axis; the cap has already
moved 16 units clear along the normal of that cut. One radius, one angle, one operation.

Colours: black `#000000` · white `#FFFFFF` · blue `#155EEF`.
Blue takes the risen cap, or the wordmark's full stop. Never both.

## Which file to use

| File | Use it for |
| --- | --- |
| `skybound-logo-horizontal-black.svg` | default logo, light backgrounds |
| `skybound-logo-horizontal-white.svg` | default logo, dark backgrounds |
| `skybound-logo-horizontal-mono.svg` | single-colour print, faxes, stamps |
| `skybound-logo-stacked-black.svg` / `-white.svg` | square-ish spaces, app stores, merch |
| `skybound-mark.svg` | symbol alone, inherits CSS `color` |
| `skybound-mark-black.svg` / `-white.svg` / `-blue.svg` | symbol, fixed colour |
| `skybound-mark-small.svg` | **any use under 32px** — channel widened to survive |
| `favicon.svg` | browser tab; flips to white in dark mode automatically |

The lockup SVGs carry the Archivo variable font embedded, so they render correctly
anywhere with no font install. They are self-contained — no external requests.

## Putting it in the site nav (recommended)

Your site already loads Archivo, so set the wordmark as **live text** and inline only the
symbol. It stays crisp at every size, scales with the type, and stays selectable.

```html
<a class="sbs-logo" href="/" aria-label="Skybound Scaling">
  <svg viewBox="0 0 131.3137 131.3137" aria-hidden="true">
    <path d="M86.8428 13.3581A60 60 0 1 1 13.3581 86.8428Z"/>
    <path d="M2.0444 75.5291A60 60 0 0 1 75.5291 2.0444Z"/>
  </svg>
  <span>SKYBOUND SCALING<i>.</i></span>
</a>
```

```css
.sbs-logo{
  display:flex; align-items:baseline; gap:.4em;
  font-size:20px;            /* the one value that resizes the whole lockup */
  color:#000; text-decoration:none;
}
.sbs-logo svg{
  height:1.04em; width:1.04em; margin-bottom:-.165em;
  flex:none; fill:currentColor;
}
.sbs-logo span{
  font-family:Archivo, system-ui, sans-serif;
  font-weight:600; font-variation-settings:'wght' 620,'wdth' 112;
  letter-spacing:.05em; word-spacing:.12em; line-height:1; white-space:nowrap;
}
.sbs-logo i{ color:#155EEF; font-style:normal; margin-left:-.105em }
.sbs-logo.on-dark{ color:#fff }
.sbs-logo.on-dark i{ color:#fff }
```

## Favicon and app icons

```html
<link rel="icon" href="/logo/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/logo/icon-180.png">
```

## Rules

- Clear space on all sides: one clearance (16 units, or 12% of the mark's width).
- Minimum sizes: symbol 24px (use `-small` below 32px), full lockup 96px wide.
- Never rotate the axis, never close the channel, never outline or box the mark,
  never add a third form, never rebuild the wordmark in another typeface.
