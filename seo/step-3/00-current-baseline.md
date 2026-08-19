# Step 3 Baseline — verified 2026-08-19 06:08 UTC
Method: live HTTP probes, live JSON-LD parse, web search (one US backend), headless-Chrome rendered-DOM checks of client sites. Every row marked VERIFIED / ESTIMATED / UNKNOWN / INSUFFICIENT EVIDENCE.

| # | Metric | Status | Evidence |
|---|---|---|---|
| A | Canonical website `https://www.skyboundscaling.com/` | **VERIFIED** | 200. `http://apex` 308→https; `https://apex` 308→www. HSTS present |
| B | Sitemap page count | **VERIFIED 105** | Parses as XML; 105 `<loc>`, 105 unique, 100% www, 0 `.html` |
| C | Indexed status | **PARTIAL / MIXED** | Owner reports GSC processed the sitemap, 105 discovered, homepage "on Google" (**not independently verifiable from here — no GSC access**). Independently: the site did **not** surface for any brand query in the search backend tested. Indexed ≠ retrievable for a given query |
| D | Official social profiles | **VERIFIED** | Live: instagram.com/skyboundscaling (200), instagram.com/ahmadkhvlid (200). Still 404: linkedin.com/company/skyboundscaling, x.com/skyboundscaling, dribbble.com/skyboundscaling |
| E | Founder→company relationship | **VERIFIED on-site only** | Live homepage JSON-LD: Person `#founder` "Ahmad Khalid", jobTitle Founder, sameAs → his Instagram; Organization.founder → `#founder`. Not stated in visible page copy; not corroborated off-site |
| F | External mentions | **NONE FOUND** (methodology-limited) | No independent mention of the agency found in the searches run. Not proof of non-existence |
| G | Referring domains | **1 observable** | Instagram bio link (platform-nofollow). No commercial backlink index authenticated → **INSUFFICIENT EVIDENCE** for a complete count |
| H | Client mentions | **VERIFIED ZERO across 7 clients** | Rendered-DOM check (headless Chrome, JS executed) of saadibuilds.com, vaza.vote, calluravoice.ai, ecomheroes.io, seenbymany.com, backlit.media, orcamanagement.agency: 0 "skybound" occurrences, 0 links. Note: "Hina Ahmad" on ecomheroes.io is **unrelated staff**, not the founder |
| I | Third-party profiles | **UNKNOWN for Crunchbase/Clutch** | Both returned **403 to automated requests** — bot protection, *not* evidence of absence. Manual check required |
| J | Editorial coverage | **NONE FOUND** | No article/interview surfaced |
| K | Podcast/interview | **NONE FOUND** | No result |
| L | Business database presence | **INSUFFICIENT EVIDENCE** | See row I |
| M | Brand ambiguity | **VERIFIED SEVERE, and worse than Step 2 recorded** | New this round: **Skybound Realty, Brokerage — Toronto**, founded Aug 2025 (realtor.ca, rate-my-agent, multiple agent sites). Also Skybound Digital LLC (OKC, has Crunchbase+UpCity+Facebook), Skybound Media Management, SkyBound Strategies, Skybound Socials, SkyBound Marketing (Raleigh), skybound-marketing.com, plus Skybound Entertainment/Games and Transformers "Skybound scaling" fan content |
| N | AI/search discovery tests | **VERIFIED FAILING** | "Who founded Skybound Scaling" → Skybound Entertainment (Kirkman/Alpert). "Skybound Scaling Toronto" → Skybound Realty Toronto + Transformers scaling. "Ahmad Khalid founder Skybound" → Khalid Yassin of Skybound CX. Correct entity: not returned in any test |

## Regressions from Steps 1 / 1.5
**None.** Canonical host, HTTPS, clean URLs, redirects, sitemap, robots, and the entity graph all verified intact.

## The single most important change since Step 2
Nothing external changed (Step 2 ran hours earlier). The material change is **on-site only**: the founder is now a first-class entity in the graph, and the three 404 profile claims were removed. The external footprint is unchanged, and the disambiguation problem is now documented as **worse** than Step 2 recorded, because of the Toronto namesake.
