# Skybound Scaling — Website

Production build of the Skybound Scaling site: a static, dependency-self-contained
website with GSAP-driven cinematic animation and Three.js particle scenes.

## Structure

```
├── index.html              Home — hero orb, pinned Services + Process scenes
├── contact.html            Contact — brief form + contained particle beacon
├── 404.html                Error page — dark stage, dependency-free canvas orb
├── work/                   Case studies (Saadi Builds, VAZA, Callura,
│                           Ecom Heroes), each with its own particle formation
├── robots.txt              Crawl rules + sitemap pointer
├── sitemap.xml             Canonical URLs
├── site.webmanifest        PWA/manifest metadata + app icons
└── assets/
    ├── css/
    │   ├── main.css        Design system + home styles (TOC at top of file)
    │   ├── contact.css     Contact page styles
    │   └── case.css        Case-study page styles (work/)
    ├── js/
    │   ├── vendor/         GSAP 3.12.5, ScrollTrigger, Three.js r128, Lenis 1.1.14
    │   ├── data/           Base64 particle point-clouds for the pinned scenes
    │   ├── core.js         Shared runtime (nav, menu, reveals, titles, footer)
    │   ├── home.js         Home scenes (preloader, orb, helix, pins, typewriter)
    │   ├── contact.js      Contact beacon + form validation / submit flow
    │   └── case.js         Case-study formations (frame / matchup / voice) + stat tilt
    ├── fonts/              Self-hosted Archivo variable font (woff2)
    ├── icons/              favicon.svg + PNG sizes + apple-touch-icon
    └── images/             og-image.jpg (1200×630 social card)
```

## Deploying

The site is fully static — upload the directory to any static host
(Netlify, Vercel, Cloudflare Pages, S3 + CloudFront, nginx…). No build step.

- Serve `404.html` for unknown routes (Netlify and GitHub Pages pick it up
  automatically; on nginx use `error_page 404 /404.html;`). It uses
  root-absolute asset paths so it renders correctly at any URL depth.
- The canonical domain is `https://skyboundscaling.com` — update `robots.txt`,
  `sitemap.xml`, the `<link rel="canonical">`, and the Open Graph URLs if the
  domain changes.
- Long-cache `/assets/**` (immutable) and no-cache the HTML for instant deploys.

## Contact form

`contact.html` works out of the box by falling back to a prefilled `mailto:`
draft. To submit briefs to a real endpoint instead, set the form's
`data-endpoint` attribute (in `contact.html`) to your handler URL — Formspree,
Basin, or a serverless function. The brief is POSTed there as JSON:

```html
<form id="brief" class="contact-form rv-card" ... data-endpoint="https://formspree.io/f/XXXXXXXX">
```

A hidden `_gotcha` honeypot field silently drops bot submissions.

## Local development

Any static server works:

```bash
python3 -m http.server 5173
# → http://localhost:5173
```

## Notes for maintainers

- **Design tokens** live at the top of `assets/css/main.css` (`:root`) — paper,
  ink, blue `#2230FE`, orange `#FF4D00`, spacing, and the Archivo font stack.
- **Reduced motion** is fully supported: every scene and reveal degrades to a
  static, readable layout when `prefers-reduced-motion: reduce` is set.
- **No-WebGL / no-JS**: particle canvases skip rendering gracefully; content
  never depends on a scene. `<body class="no-js">` styling covers disabled JS.
- The pinned Services/Process point-cloud data lives in `assets/js/data/` —
  regenerating those requires re-sampling the source icons (7200 pts/icon for
  Process, 4200 pts/shape for Services), encoded as base64 Int16/byte pairs.
- Legal pages (Privacy / Terms / Cookies) are placeholder links in the footer —
  supply real documents before launch.
