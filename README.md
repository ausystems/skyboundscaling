# Skybound Scaling — Website

Production build of the Skybound Scaling site: a static, dependency-self-contained
website with GSAP-driven cinematic animation and Three.js particle scenes.

## Structure

```
├── index.html              Home — hero orb, pinned Services + Process scenes
├── contact.html            Contact — brief form + contained particle beacon
├── privacy.html            Privacy policy (PIPEDA-aligned)
├── terms.html              Terms of service
├── services/               Service hub (index.html) + 11 service pages,
│                           each with its own particle formation + FAQ schema
├── MIAMI-SEO-PLAYBOOK.md   Miami strategy: URL map, 75-topic blog calendar,
│                           internal linking, technical + local SEO ops
├── WEST-PALM-BEACH-SEO-PLAYBOOK.md
│                           Palm Beach County strategy: URL map, 100-topic
│                           blog calendar, seasonal calendar, expansion rules
├── work/index.html         Case-study hub (portfolio grid + record band)
├── industries/             Industry hub + 5 vertical pages (builders,
│                           healthcare, ecommerce, prof. services, SaaS)
├── locations/              Market guides. South Florida clusters:
│                           miami/ (hub + 7 service + 7 industry pages),
│                           west-palm-beach/ (hub + 6 service + 3 industry),
│                           boca-raton/, delray-beach/, palm-beach-gardens/,
│                           jupiter/, wellington/, boynton-beach/ city hubs.
│                           Ontario guides (Mississauga, Vaughan, Markham,
│                           Ottawa) + per-city Google Ads and Meta ads pages.
│                           All unique local copy, no city-swap templates.
├── blog/                   Resources hub + long-form guides (Article +
│                           FAQ schema, reading progress, no three.js on
│                           posts for speed)
├── about.html              Studio story, principles, record
├── pricing.html            Four budget bands + FAQ (matches brief form)
├── process.html            Audit / Strategy / Build / Scale + HowTo schema
├── careers.html            Senior-only hiring page (no open roles state)
├── 404.html                Error page — dark stage, dependency-free canvas orb
├── work/                   Case studies (Saadi Builds, VAZA, Callura,
│                           Ecom Heroes), each showing the live homepage
├── llms.txt                Structured site summary for AI answer engines
│                           (llmstxt.org format) — keep in sync with the
│                           page inventory whenever pages ship
├── robots.txt              Crawl rules (search + AI crawlers) + sitemap
├── sitemap.xml             Canonical URLs
├── site.webmanifest        PWA/manifest metadata + app icons
└── assets/
    ├── css/
    │   ├── main.css        Design system + home styles (TOC at top of file)
    │   ├── contact.css     Contact page styles
    │   ├── case.css        Case-study page styles (work/)
    │   ├── services.css    Service hub + service page styles (services/)
    │   └── blog.css        Blog hub + article styles (blog/)
    ├── js/
    │   ├── vendor/         GSAP 3.12.5, ScrollTrigger, Three.js r128, Lenis 1.1.14
    │   ├── data/           Base64 particle point-clouds for the pinned scenes
    │   ├── core.js         Shared runtime (nav, menu, reveals, titles, footer)
    │   ├── home.js         Home scenes (hero intro, orb, helix, pins, typewriter)
    │   ├── contact.js      Contact beacon + form validation / submit flow
    │   ├── case.js         Case-study site-panel tilt
    │   └── services.js     Service-page formations, tilt, counters, FAQ
    ├── fonts/              Self-hosted Archivo variable font (woff2)
    ├── icons/              favicon.svg + PNG sizes + apple-touch-icon
    └── images/             og-image.jpg (1200×630 social card)
        ├── clients/         Marquee logos, ink-on-transparent png (512px tall)
        └── work/            Client homepage screenshots (2160×1350 jpg)
                             + per-case OG cards (*-og.jpg, 1200×630)
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
- Legal pages live at `/privacy.html` and `/terms.html` — have counsel review
  the wording before launch and keep the "Last updated" dates current.
- SEO invariants: one `h1` per page, self-referencing canonicals, root-absolute
  internal links (never `index.html`), JSON-LD graph with the shared `#org`
  node on every page, and `sitemap.xml` lastmod bumped whenever a page ships.
- **Location pages must never be city-name swaps.** Every location page carries
  substance specific to that market (local industries, buyer behavior, seasonality,
  neighborhoods used in service of a point). Google treats swap-templates as
  doorway pages. Before adding a new city page, confirm it would fail the test
  "could this page exist for another city if the name changed?"
- **No em dashes** in any page copy, metadata, or schema. Client style rule.
  Legacy pages predating this rule (`privacy.html`, `terms.html`, `work/*.html`)
  still contain a few and were intentionally left untouched.
- **No ranking guarantees** in copy or FAQ answers. SEO is framed as earned.
- The two SEO playbooks at the repo root document the URL architecture, blog
  calendars, internal linking maps, and the operational (non-code) tasks such as
  Google Business Profile setup and review generation.

### AI search visibility

- **One entity, everywhere.** The shared `#org` node is byte-identical on all 99
  pages: same description, `knowsAbout`, `areaServed`, `sameAs`. AI systems
  resolve entities by consistency, so if you edit that node, edit it everywhere
  (`scratchpad/ai_optimize.py` pattern: parse the JSON-LD, swap the node, reserialize).
  The homepage alone carries the 11-service `hasOfferCatalog`.
- **No postal address is published**, deliberately, because there is no real one
  to publish. When a street address exists, add it to the `#org` node, the footer,
  and Google Business Profile *in the same change* so the three never disagree.
- `llms.txt` is the plain-language brief for answer engines. It states what the
  company is, what it is not (not just a web design shop), pricing bands, service
  areas, and the honest "no ranking guarantees" line, then links every key page
  with a description. **Every URL in it must resolve** — validate after page changes.
- `<meta name="robots" content="... max-snippet:-1, max-image-preview:large ...">`
  is on every page. This permits unlimited snippet length, which is what lets
  AI Overviews and answer engines quote a full passage rather than a truncated one.
- `robots.txt` explicitly allows the answer engines (OAI-SearchBot, PerplexityBot,
  Claude-SearchBot, DuckAssistBot and friends) and the training crawlers (GPTBot,
  ClaudeBot, Google-Extended, Applebot-Extended). Note that `Google-Extended` does
  **not** affect Google Search or AI Overviews — those use plain Googlebot. To opt
  out of model training while keeping AI search visibility, flip only the training
  group to `Disallow`.
- FAQ sections are the highest-value AI real estate on the site: `FAQPage` schema
  answers are byte-matched to the visible copy, which is exactly the format answer
  engines lift. Keep new pages to that pattern.
  `core.js` removes `no-js` as its first statement — do not reintroduce the
  inline remover into `<head>`/`<body>`, it regresses LCP on slow devices.

## Launch checklist (host-level)

1. **Redirects (301):** `http → https`, `www → apex`, and `/index.html → /`.
   Netlify `_redirects`: `/index.html / 301!` · nginx: `return 301` blocks.
2. **404 status:** wire `404.html` to real 404 responses (see Deploying).
3. **Compression + cache:** enable Brotli/gzip; `Cache-Control: public,
   max-age=31536000, immutable` for `/assets/**`, `no-cache` for HTML.
4. **Security headers:** `Strict-Transport-Security`, `X-Content-Type-Options:
   nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
5. **Form endpoint:** set `data-endpoint` on the contact form (see below) —
   without it, briefs fall back to a `mailto:` draft only.
6. **Search Console:** verify the domain, submit
   `https://skyboundscaling.com/sitemap.xml`, confirm coverage after a week.
7. **Analytics:** add GA4 or a privacy-first tool (Plausible/Fathom) + a
   form-submit conversion event; then update `privacy.html` to disclose it.
8. **Validate socials:** run the homepage + one case page through the Meta
   Sharing Debugger and a Twitter/X card validator; test rich results at
   https://search.google.com/test/rich-results.
9. **Google Business Profile:** create/claim the Toronto listing — it carries
   most local "agency near me" visibility.
