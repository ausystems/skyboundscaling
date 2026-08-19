# LinkedIn Entity Verification Matrix — Step 3A
Verified live 2026-08-19. Methods: HTTP probes, LinkedIn guest-HTML + JSON-LD parse, rendered-browser reads of both Instagram profiles, repository source inspection.

**Legend:** VERIFIED · PARTIAL · MISSING · CONTRADICTORY · UNKNOWN · NOT PUBLICLY VISIBLE

## The matrix

| Identity Signal | Website | LinkedIn Company | Ahmad LinkedIn | Ahmad Instagram | Skybound Instagram |
|---|---|---|---|---|---|
| Company name | VERIFIED | VERIFIED | NOT PUBLICLY VISIBLE | PARTIAL | VERIFIED |
| Founder name | PARTIAL | VERIFIED | VERIFIED | VERIFIED | PARTIAL |
| Founder relationship | VERIFIED | PARTIAL | NOT PUBLICLY VISIBLE | MISSING | VERIFIED |
| Canonical website | VERIFIED | **CONTRADICTORY** | NOT PUBLICLY VISIBLE | MISSING | PARTIAL |
| Official LinkedIn | VERIFIED | VERIFIED | VERIFIED | MISSING | MISSING |
| Official Instagram | VERIFIED | MISSING | NOT PUBLICLY VISIBLE | VERIFIED | VERIFIED |
| Business category | VERIFIED | VERIFIED | NOT PUBLICLY VISIBLE | PARTIAL | PARTIAL |
| Geography | VERIFIED | MISSING | UNKNOWN | MISSING | MISSING |
| Logo / branding | VERIFIED | **CONTRADICTORY** | UNKNOWN | UNKNOWN | UNKNOWN |

## Every discrepancy explained

### 1. Canonical website — CONTRADICTORY on LinkedIn (the single most damaging finding)
The LinkedIn company page's Website field reads **`https://www.AuDesigns.co/`**, not `https://www.skyboundscaling.com/`. Confirmed twice: in the page's own JSON-LD (`"sameAs": "https://www.AuDesigns.co/"`) and in the rendered Website field.

**Cause — confirmed by the owner:** AuDesigns was the company's former brand. Skybound Scaling is a rebrand of it. The LinkedIn page was **renamed**, not recreated, and the website field was never updated. Corroborating evidence: the page's logo asset is still named `audesignswebstudio_logo`, and every plausible `audesigns*` company slug returns 404 (the old page did not stay behind — it became this one).

**Why it matters:** the company's only professional-network record currently tells every crawler and answer engine that Skybound Scaling's website is a *different domain*. `audesigns.co` is still live and standalone, serving `AuDesigns | Web Design & Branding Studio` with no rebrand notice and no redirect. The strongest external identity signal that exists for this company points away from the canonical domain and toward a retired brand in the same industry.

### 2. Logo / branding — CONTRADICTORY on LinkedIn
The logo asset served on the company page is `.../audesignswebstudio_logo?...` — an old-brand file. Whether the *image* was replaced during the rename cannot be determined from the filename alone (LinkedIn keeps the original upload name), so the visual mark is **UNVERIFIED**; the asset provenance is confirmed old-brand. Must be confirmed by eye against `/assets/brand/logo-full.png`.

### 3. Founder relationship — PARTIAL on the LinkedIn company page
The page lists exactly one employee, **Ahmad Khalid**, linked to `https://ca.linkedin.com/in/ahmadkhvlid`. That establishes an *employment* association, which is real and valuable. It does **not** establish a *founder* relationship: LinkedIn surfaces no founder/owner designation on the company page, and his title is not publicly visible. The association exists; the role does not.

### 4. Founder relationship — MISSING on Ahmad's Instagram
Bio reads `@skyboundscaling 👨🏽‍💻` / `Web Designs`. It tags the company but states **no role**. A reader cannot conclude he founded it — only that he is connected to it. The company account carries the relationship (`Founded by @ahmadkhvlid`); the founder account does not reciprocate it.

### 5. Canonical website — MISSING on Ahmad's Instagram
The profile has **zero outbound links** (verified: no external URL element in the rendered DOM). The founder asset with the largest audience of the two (784 followers vs 135) links to nothing.

### 6. Canonical website — PARTIAL on the company Instagram
The link target is `http://skyboundscaling.com/` — **apex host, HTTP scheme**. It reaches the site via two redirects (`http://apex` → `https://apex` → `https://www`), so it works for humans, but it is not the canonical form and spends redirect hops on the company's only outbound link.

### 7. Founder name — PARTIAL on the website
`Ahmad Khalid` appears on all 105 pages **inside JSON-LD only**. In visible copy, the name never appears; the About page says *"We started Skybound in 2025"* and testimonials say *"Ahmad"* (first name). A human visitor cannot answer "who founded Skybound Scaling?" from the rendered page — only a parser can.

### 8. Company name — PARTIAL on Ahmad's Instagram
The company appears as the handle `@skyboundscaling`, not as the two-word name "Skybound Scaling". Handles are weak name evidence; against a contested brand name they do not disambiguate.

### 9. Geography — MISSING on the LinkedIn company page
No location is set. The site states Toronto, Ontario throughout. This is a filled-in-nowhere gap, not a contradiction — but it forfeits the strongest available counter-signal to the Toronto namesake (Skybound Realty, founded the same year).

### 10. Founding year — CONTRADICTORY across sources
LinkedIn says **Founded 2024**; the website says **Est. 2025** in the footer, on About and Careers, and as `foundingDate: "2025"` in schema on all 105 pages. Both may be honest under a rebrand — 2024 for the original entity, 2025 for the Skybound Scaling brand. Publicly they still conflict. **The correct year is a factual question only the owner can settle; it is not inferred here.**

### 11. Business category — consistent, and this is the one bright spot
LinkedIn's industry is **Marketing Services**; the site self-describes as a digital marketing agency and web design studio; the company Instagram says `Websites • AI • Growth`. These agree. Category is the signal most likely to separate this entity from Skybound Entertainment, Skybound Realty, and the other namesakes, and it is already aligned.

### 12. Cross-profile handle match — evidence in favour of identity
The LinkedIn vanity slug `ahmadkhvlid` is character-identical to the Instagram handle `ahmadkhvlid`, an unusual spelling unlikely to collide by chance. Combined with the `ca.` (Canada) subdomain and the display name "Ahmad Khalid", this is strong evidence the LinkedIn profile is the same person as the verified founder Instagram.

## Duplicate / competing entity check — result: NONE FOUND
All 404, i.e. no competing or leftover page exists:
`linkedin.com/company/` + `skybound-scaling` · `skyboundscaling-agency` · `skybound-scaling-agency` · `skyboundscalingofficial` · `audesigns` · `audesigns-web-studio` · `au-designs`

No second Skybound Scaling company page, and no surviving AuDesigns page. Public search surfaced no other Ahmad Khalid profile claiming Skybound Scaling; the profiles returned belong to unrelated people (civil engineer, recruiter, banker) and none reference this company.

## What could not be verified, and why
| Item | Status | Reason |
|---|---|---|
| Ahmad's LinkedIn headline, title, About, experience entries, website field | **NOT PUBLICLY VISIBLE** | `/in/ahmadkhvlid` returns HTTP **999** to every automated request (LinkedIn's guest block) and a sign-up wall in a logged-out browser. 999 is a block, **not** a 404 — it is not evidence of absence. Verifying these requires Ahmad to open his own profile while signed in. |
| Whether the LinkedIn logo *image* is the current Skybound mark | **UNKNOWN** | Only the asset filename is exposed, and it is the old-brand name. |
| LinkedIn follower count | **UNKNOWN** | Not exposed to guests. |
| Whether the page is indexed by any engine | **UNKNOWN** | Not claimed. Existence ≠ indexation. |

---

# Appendix — Repository naming-consistency scan
Scanned all 106 production HTML files for every variant. **No text was globally replaced**; this is a classification, and the conclusion is that the site's naming is sound.

| Variant | Occurrences | Classification | Notes |
|---|---|---|---|
| `Skybound Scaling` | dominant, sitewide | **CORRECT** | Titles, headings, schema `name`, meta, copy. The canonical form is used consistently |
| `Ahmad Khalid` | 105 (JSON-LD only) | **NEEDS REVIEW** | Correct wherever it appears, but appears **only** in structured data. Zero visible-copy mentions — see the About page finding |
| `Skybound` (bare, in body copy) | ~290 | **CONTEXTUAL / LEGITIMATE** | Brand voice on the company's own domain: *"Skybound builds…"*, *"Skybound runs…"*. Every page already establishes the full name in its title, `<h1>` region, schema, and footer, so the short form is unambiguous **in this context**. The never-abbreviate rule governs **external** profiles, where that context is absent. **Do not bulk-replace** — it would flatten the site's voice for no entity gain |
| `Skybound` (footer wordmark) | 105 | **CONTEXTUAL / LEGITIMATE** | Decorative display type, already `aria-hidden="true"`. Not a naming claim |
| `Skybound Scaling Inc.` | 221 (105 schema `legalName` + 105 footer copyright + 11 legal pages) | **NEEDS REVIEW** | The incorporated name has never been verified against a registry. Left unchanged — removing it risks being wrong if the company *is* incorporated under it. **Must not be used externally** until confirmed |
| `Skybound Marketing` | 0 | — | Clean |
| `Skybound Digital` | 0 | — | Clean |
| `Skybound Agency` | 0 | — | Clean |
| `Skybound Growth` | 0 | — | Clean |
| `Skybound Media` | 0 | — | Clean |
| `AuDesigns` / `AU Designs` | 0 | — | Clean. **No old-brand residue exists anywhere in the website codebase** — the residue is confined to the LinkedIn page and the still-live old domain |

**Result: no INCORRECT usages found in production HTML.** The two NEEDS REVIEW items are both pre-existing, both documented, and neither is a naming error — one is a visibility gap, the other an unverified legal name.

---

# Appendix — About page founder signal

**CURRENT — what a visitor actually sees**
The About page opens *"A Toronto studio, built for altitude"* and tells the origin story as **"We started Skybound in 2025 because we kept watching the same movie."** The founder is never named. `Ahmad Khalid` appears on the page only inside JSON-LD. The only visible occurrence of the name anywhere on the site is the first name "Ahmad" inside two client testimonials.

**PROBLEM**
A human visitor — or a journalist, podcast host, directory reviewer, or anyone verifying the company — **cannot answer "who founded Skybound Scaling?" from the rendered page.** Only a parser can. This matters more than usual here: the site's schema asserts a founder that its own visible copy never corroborates, and there is no citable on-site source for the relationship that a person could quote. Against a contested brand name, with retrieval tests currently returning Skybound Entertainment's founders for this exact question, that is a real gap.

**RECOMMENDED — exact wording, matching the page's existing voice**
Append one sentence to the end of the existing "The story" section:

> Skybound Scaling was founded in 2025 by Ahmad Khalid, who still runs every engagement the way the pitch promised.

Or, if a plainer line is preferred:

> Skybound Scaling was founded in 2025 by Ahmad Khalid.

*(Both carry the founding year. If item 7 of the manual checklist resolves the year to 2024, the wording changes accordingly — which is a further reason to settle that question first.)*

**WHY it improves entity clarity**
It makes visible copy agree with the structured data instead of merely not contradicting it; it gives any third party a quotable on-site source for the founder relationship; and it puts the full name "Ahmad Khalid" next to the full name "Skybound Scaling" in prose, which is the pairing every retrieval system is currently failing to make.

**STATUS: NOT IMPLEMENTED — awaiting owner approval.**
This is a copy change in the owner's own voice on the owner's own About page, and the brief for this step directs that it be reported rather than applied unilaterally. `24-website-code-changes.md` reached the same conclusion in the previous step and it has not been approved since. It is a two-minute change once the wording and the founding year are confirmed.
