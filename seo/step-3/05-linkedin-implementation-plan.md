# LinkedIn Implementation Plan — 2026-08-19

## Verified current state
| Question | Answer | Evidence |
|---|---|---|
| Official company page exists? | **No** | `linkedin.com/company/skyboundscaling` → 404 |
| Desired handle available? | **Appears available** | 404 on the vanity URL. Final availability is confirmed only at creation time |
| Founder profile publicly identifiable? | **Not found** | No profile linking an Ahmad Khalid to Skybound Scaling surfaced |
| Founder profile identifies the company? | n/a | — |
| Page links to website / names founder? | n/a | — |

## COMPANY PAGE — exact setup
Create at `https://www.linkedin.com/company/setup/new/`

| Field | Value |
|---|---|
| Name | `Skybound Scaling` |
| Public URL | `linkedin.com/company/skyboundscaling` |
| Website | `https://www.skyboundscaling.com/` |
| Industry | `Marketing Services` |
| Company size | **USER INPUT REQUIRED** — state the true headcount band; do not inflate |
| Company type | **USER INPUT REQUIRED** (likely "Privately Held" or "Self-Employed" — must be true) |
| Location | `Toronto, Ontario, Canada`. Street address optional — **leave blank**; do not invent one |
| Founded | `2025` |
| Tagline | `Growth, engineered.` |
| About | Use the MEDIUM description from `14-external-entity-consistency-pack.md` verbatim |
| Specialties | Web design; Framer web design; Brand identity; SEO; Google Ads; Meta Ads; Landing pages and funnels; AI automation; Lead generation; Conversion rate optimization; White-label services for agencies |
| Logo | The official mark used on the site (`/assets/brand/`) |
| Cover | Optional; any existing brand asset |

## FOUNDER PROFILE — exact setup
| Field | Value |
|---|---|
| Headline | `Founder of Skybound Scaling \| Digital marketing and growth agency in Toronto` |
| Experience entry | Title `Founder` · Company `Skybound Scaling` (linked to the page) · Location `Toronto, Ontario, Canada` · Start `2025` |
| About | 2–3 sentences drawn from the consistency pack; must include the phrase "Founder of Skybound Scaling" and the website URL |
| Website link | `https://www.skyboundscaling.com/` |
| Featured | Optional: link a case study, e.g. `https://www.skyboundscaling.com/work/callura/` |

## Why this is the first external action
It creates, in one sitting, four signals that do not currently exist anywhere: an independent-platform company record, a category assignment, a founder→company relationship in machine-readable form, and a crawlable link to the canonical domain. It is also the record most likely to be retrieved for "what is X / who founded X" questions about a B2B agency.

**Do not fabricate any field.** Where a value is not verifiable, leave it blank rather than guessing.
**After creation, report the live URLs back** so the site's `sameAs` and footer can be updated to match reality.
