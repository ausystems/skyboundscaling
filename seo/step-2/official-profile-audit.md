# Official Profile Audit
Research date: 2026-08-19 · Every platform probed directly (HTTP) and via restricted search.

| Platform | URL | Official? | Public? | Indexed? | Name | Site linked? | Founder? | Problems | Priority |
|---|---|---|---|---|---|---|---|---|---|
| Instagram (company) | instagram.com/skyboundscaling | YES | YES | Not visibly (absent from social-restricted search) | "Skybound Scaling" ✓ | skyboundscaling.com ✓ (apex, not www) | Not stated | Thin bio: no category, no city, no founder | HIGH: enrich bio |
| Instagram (founder) | instagram.com/ahmadkhvlid | YES | YES | No (zero results) | "Ahmad Khalid" ✓ | **NO link** | Tag only, no role | No URL, no "Founder of Skybound Scaling" | HIGH: fix bio |
| LinkedIn company | /company/skyboundscaling | — | — | — | — | — | — | **DOES NOT EXIST (404); was falsely claimed in site schema until today** | CRITICAL: create |
| X | x.com/skyboundscaling | — | — | — | — | — | — | **DOES NOT EXIST (404); was claimed in schema** | OPTIONAL: create or leave |
| Dribbble | dribbble.com/skyboundscaling | — | — | — | — | — | — | **DOES NOT EXIST (404); was claimed in schema** | OPTIONAL |
| YouTube | — | — | — | — | — | — | — | No channel found | LOW |
| Facebook | — | — | — | — | — | — | — | No page found | LOW |
| Google Business Profile | — | — | — | — | — | — | — | No listing surfaced in brand searches. EVIDENCE INSUFFICIENT for dashboard state — only the owner can confirm | HIGH: create as service-area business |
| Bing Places | — | — | — | — | — | — | — | None found | MEDIUM (import from GBP) |
| Crunchbase | — | — | — | — | — | — | — | No record (competitors' Skybounds have records) | HIGH |
| Clutch | — | — | — | — | — | — | — | No profile | HIGH |
| G2 / Capterra | — | — | — | — | — | — | — | Not applicable: these index software products, not agencies | SKIP |
| Yelp / BBB / OpenCorporates | — | — | — | — | — | — | — | No records | LOW–MEDIUM |
| Agency directories (AgencySpotter, DesignRush, etc.) | — | — | — | — | — | — | — | None; note SkyBound Marketing (Raleigh) already occupies AgencySpotter under a confusable name | MEDIUM |
| Industry associations | — | — | — | — | — | — | — | None found | LATER |

## The five findings that matter
1. Only **one** official company profile exists on the entire public web (Instagram), and it is not visibly indexed.
2. The site's schema and footer claimed **three profiles that return 404** (LinkedIn, X, Dribbble). Asserting dead identity links is worse than asserting none — removed from the site in this step; recreate the accounts before restoring.
3. The largest entity-corroboration platform for a B2B agency (**LinkedIn**) has no company page and no discoverable founder profile.
4. No business database (Crunchbase/Clutch/registry-style directory) knows the company exists — these are precisely the sources AI retrieval leans on for "what is X" company questions.
5. The two profiles that DO exist use the exact correct brand name — the naming foundation is clean; the footprint is just missing.
