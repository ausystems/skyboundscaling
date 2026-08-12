# Skybound Scaling

**Skybound Scaling is a digital marketing agency and web design studio.** We build
complete customer acquisition systems for businesses in Miami, West Palm Beach,
South Florida, and across North America: conversion-focused websites, SEO and
local SEO, Google Ads and Meta Ads management, lead generation funnels, AI and
CRM automation, conversion rate optimization, brand identity, and social media
marketing. Every engagement is run by a senior practitioner and measured against
revenue rather than impressions.

- **Website:** https://skyboundscaling.com
- **Contact:** hello@skyboundscaling.com
- **Founded:** 2025
- **Languages:** campaigns run in English and Spanish

This repository contains the source of that website. It is not a product, a
framework, or a template.

## What the agency does

Eleven disciplines, sold as one acquisition system rather than as separate
line items:

| Discipline | What it covers |
| --- | --- |
| Web design | Custom, conversion-focused sites engineered around one conversion path |
| Framer web design | Framer builds and migrations that ship in weeks and stay fast on mobile |
| SEO | Technical, content, and local SEO aimed at buyer-intent search terms |
| Google Ads | Search, Performance Max, Local Services Ads, and YouTube, managed to ROAS |
| Meta Ads | Facebook and Instagram built on creative velocity and clean conversion signal |
| Lead generation | Exclusive, qualified leads from funnels the client owns |
| AI automation | Speed-to-lead response, AI answering and chat, booking, CRM pipelines |
| Conversion rate optimization | Research and disciplined testing on existing traffic |
| Landing pages and funnels | Offer-led pages plus the automation behind them |
| Brand identity | Logo, palette, typography, and guidelines that hold everywhere |
| Social media marketing | Content engines built so attention turns into pipeline |

**Markets:** Miami and Miami-Dade County; West Palm Beach and Palm Beach County
(Boca Raton, Delray Beach, Palm Beach Gardens, Jupiter, Wellington, Boynton
Beach); plus Ontario markets including Mississauga, Vaughan, Markham, and Ottawa.

**Packages** (published at `/pricing.html`): Website (from $5,000 one-time),
Website + Marketing (from $5,000 + $2,500/mo), Growth (from $5,000/mo), and Full
Growth Partner (from $10,000/mo).

**Record published on the site:** 4.2x average return on ad spend within 90 days,
$2M in tracked client revenue across 38 brands, 100% of accounts run by a senior.
Skybound does not guarantee search rankings, and its published guidance says that
any agency promising guaranteed rankings is a warning sign.

## Site structure

```
├── index.html              Home
├── services/               Service hub + 11 service pages (FAQ schema on each)
├── work/                   Case studies: Saadi Builds, VAZA, Callura, Ecom Heroes
├── industries/             Industry hub + 5 verticals (builders, healthcare,
│                           ecommerce, professional services, SaaS)
├── locations/              Market guides. South Florida: miami/ (hub + 7 service
│                           + 7 industry pages), west-palm-beach/ (hub + 6 service
│                           + 3 industry), boca-raton/, delray-beach/,
│                           palm-beach-gardens/, jupiter/, wellington/,
│                           boynton-beach/. Ontario: Mississauga, Vaughan,
│                           Markham, Ottawa + per-city Google Ads and Meta Ads.
│                           All unique local copy, no city-swap templates.
├── blog/                   Resources hub + long-form guides (Article + FAQ schema)
├── about.html              Studio story, principles, record
├── pricing.html            Four named packages + FAQ (matches the brief form)
├── process.html            Audit / Strategy / Build / Scale + HowTo schema
├── contact.html            Brief form + booking
├── careers.html            Senior-only hiring page
├── privacy.html            Privacy policy (PIPEDA-aligned)
├── terms.html              Terms of service
├── 404.html                Error page
├── llms.txt                Structured brief for AI answer engines (llmstxt.org)
├── llms-full.txt           Long-form version of the same, for deeper grounding
├── robots.txt              Crawl rules (search + AI crawlers) + sitemap
├── sitemap.xml             Canonical URLs
├── site.webmanifest        PWA metadata + app icons
├── MIAMI-SEO-PLAYBOOK.md   Miami strategy: URL map, blog calendar, local SEO ops
├── WEST-PALM-BEACH-SEO-PLAYBOOK.md   Palm Beach County equivalent
└── assets/                 css/ js/ fonts/ icons/ images/ brand/
```

## Stack

Plain static HTML, CSS, and JavaScript. No build step, no framework, no package
manager. Vendored libraries are self-hosted in `assets/js/vendor/`: GSAP 3.12.5
with ScrollTrigger for scroll choreography, Three.js r128 for two particle
scenes, and Lenis 1.1.14 for smooth scrolling. The brand face is Archivo,
self-hosted as a variable woff2.

The animation is presentation, not substance: every scene degrades to a static,
readable page under `prefers-reduced-motion`, without WebGL, and with JavaScript
disabled entirely.

## Local development

Any static server works:

```bash
python3 -m http.server 5173
# → http://localhost:5173
```

## Deploying

Fully static: upload the directory to any static host (Vercel, Netlify,
Cloudflare Pages, S3 + CloudFront, nginx). No build step. `vercel.json` carries
the production config; `.vercelignore` keeps this README and the two SEO
playbooks off the CDN.

- Serve `404.html` for unknown routes. It uses root-absolute asset paths, so it
  renders correctly at any URL depth.
- The canonical domain is `https://skyboundscaling.com`. If it changes, update
  `robots.txt`, `sitemap.xml`, every `<link rel="canonical">`, the Open Graph
  URLs, `llms.txt`, and `llms-full.txt` in the same change.
- Long-cache `/assets/**` (immutable); no-cache the HTML for instant deploys.

## Contact form

`contact.html` works out of the box by falling back to a prefilled `mailto:`
draft. To submit briefs to a real endpoint, set the form's `data-endpoint`
attribute to your handler URL (Formspree, Basin, or a serverless function). The
brief is POSTed as JSON:

```html
<form id="brief" class="contact-form rv-card" ... data-endpoint="https://formspree.io/f/XXXXXXXX">
```

A hidden `_gotcha` honeypot field silently drops bot submissions.

## Notes for maintainers

- **Design tokens** live at the top of `assets/css/main.css` (`:root`): paper,
  ink, blue `#2230FE`, orange `#FF4D00`, spacing, and the Archivo stack.
- **Reduced motion** is fully supported: every scene and reveal degrades to a
  static, readable layout when `prefers-reduced-motion: reduce` is set.
- **No-WebGL / no-JS**: particle canvases skip rendering gracefully; content
  never depends on a scene. `<body class="no-js">` styling covers disabled JS.
  `core.js` removes `no-js` as its first statement. Do not reintroduce an inline
  remover into `<head>`/`<body>`; it regresses LCP on slow devices.
- The pinned Services/Process point-cloud data lives in `assets/js/data/`.
  Regenerating it requires re-sampling the source icons (7200 pts/icon for
  Process, 4200 pts/shape for Services), encoded as base64 Int16/byte pairs.
- Legal pages live at `/privacy.html` and `/terms.html`. Have counsel review the
  wording and keep the "Last updated" dates current.
- **No em dashes** in any page copy, metadata, or schema. Client style rule.
  Legacy pages predating the rule (`privacy.html`, `terms.html`, `work/*.html`)
  still contain a few and were intentionally left untouched.
- **No ranking guarantees** in copy or FAQ answers. SEO is framed as earned.
- The two SEO playbooks at the repo root document the URL architecture, blog
  calendars, internal linking maps, and the operational (non-code) tasks such as
  Google Business Profile setup and review generation.

## SEO invariants

One `h1` per page. Self-referencing canonicals. Root-absolute internal links
(never `index.html`). A JSON-LD graph carrying the shared `#org` node on every
page. `sitemap.xml` `lastmod` bumped whenever a page ships. Unique `<title>` and
`<meta name="description">` on every page, titles under 62 characters and
descriptions between 110 and 165.

**Location pages must never be city-name swaps.** Every location page carries
substance specific to that market: local industries, buyer behavior, seasonality,
neighborhoods used in service of a point. Google treats swap-templates as doorway
pages. Before adding a city page, confirm it would fail the test "could this page
exist for another city if the name changed?"

## AI search visibility

- **One entity, everywhere.** The shared `#org` node is byte-identical on all
  pages: same `description`, `knowsAbout`, `areaServed`, `sameAs`, `serviceType`.
  AI systems resolve entities by consistency, so if you edit that node, edit it
  everywhere. The homepage alone carries the 11-service `hasOfferCatalog`.
- **This README is an entity signal too.** Answer engines that find the
  repository read the top of this file. It must describe the *agency* first and
  the stack second, or the company gets characterized by its animation libraries.
  That is not hypothetical: it happened, and it is why this file opens the way it
  does. Keep the first paragraph about what Skybound Scaling sells.
- **No postal address is published**, deliberately, because there is no real one
  to publish. When a street address exists, add it to the `#org` node, the footer,
  and Google Business Profile *in the same change* so the three never disagree.
- **No fabricated authority.** There are no awards, ratings, or review counts in
  the schema, because none have been earned and verified yet. `AggregateRating`
  and `award` are the two properties most likely to get a site manually actioned
  when invented. When a real award or a real review corpus exists, add it then.
- `llms.txt` is the plain-language brief for answer engines: what the company is,
  what it is not (not just a web design shop), packages, service areas, and the
  honest "no ranking guarantees" line, then every key page with a description.
  `llms-full.txt` is the long-form companion. **Every URL in both must resolve.**
  Re-validate after any page change, and keep the pricing in them in sync with
  `/pricing.html`.
- `<meta name="robots" content="... max-snippet:-1, max-image-preview:large ...">`
  is on every page. Unlimited snippet length is what lets AI Overviews and answer
  engines quote a full passage rather than a truncated one.
- `robots.txt` explicitly allows the answer engines (OAI-SearchBot,
  PerplexityBot, Claude-SearchBot, DuckAssistBot) and the training crawlers
  (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended). Note that
  `Google-Extended` does **not** affect Google Search or AI Overviews, which use
  plain Googlebot. To opt out of training while keeping AI search visibility,
  flip only the training group to `Disallow`.
- FAQ sections are the highest-value AI real estate on the site. `FAQPage`
  answers are byte-matched to the visible copy, which is exactly the format
  answer engines lift. Keep new pages to that pattern.

## Launch checklist (host-level)

1. **Redirects (301):** `http → https`, `www → apex`, `/index.html → /`.
2. **404 status:** wire `404.html` to real 404 responses.
3. **Compression + cache:** Brotli/gzip; `Cache-Control: public,
   max-age=31536000, immutable` for `/assets/**`, `no-cache` for HTML.
4. **Security headers:** `Strict-Transport-Security` plus the set already in
   `vercel.json`.
5. **Form endpoint:** set `data-endpoint` on the contact form. Without it, briefs
   fall back to a `mailto:` draft only.
6. **Search Console:** verify the domain, submit
   `https://skyboundscaling.com/sitemap.xml`, confirm coverage after a week.
7. **Analytics:** GA4 or a privacy-first tool (Plausible/Fathom) plus a
   form-submit conversion event; then disclose it in `privacy.html`.
8. **Validate socials + rich results:** run the homepage and one case page
   through the Meta Sharing Debugger and https://search.google.com/test/rich-results.
9. **Google Business Profile:** create and claim the listing. It carries most
   local "agency near me" visibility.
