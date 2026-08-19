# Founder ↔ Company Relationship Diagnosis — Step 3A
Verified 2026-08-19.

## Overall strength: **MODERATE**
*(Step 3 baseline scored this dimension 15/100 — "asserted on-site only, zero external corroboration". It is materially better now, and for a specific reason: two independent platforms now carry the relationship, and one of them is not owned media in the ordinary sense — LinkedIn's own employee graph.)*

Why MODERATE and not STRONG: the relationship is now **stated in two places and structurally present in a third**, but it is **asymmetric everywhere**. In every single pairing, one side carries the link and the other does not reciprocate. Nothing yet states, in a public and machine-readable way, that Ahmad Khalid is the **founder** of Skybound Scaling anywhere except the company's own website schema and the company's own Instagram bio.

Why not WEAK: three real, independent, verifiable artifacts exist — the site's Person↔Organization schema, the Instagram bio naming the founder by handle, and LinkedIn's own employee edge binding the person record to the company record. That is more than an assertion; it is a small but genuine graph.

## Link-by-link

| Direction | Strength | Evidence | Gap |
|---|---|---|---|
| **Website → Ahmad** | **STRONG** | `Person #founder` (name `Ahmad Khalid`, `jobTitle: Founder`, `worksFor → #organization`), plus `Organization.founder → #founder`, on all 105 pages. Now also `Person.sameAs` → his LinkedIn and Instagram | Machine-readable only. **Zero visible mentions** of "Ahmad Khalid" in rendered page copy anywhere on the site |
| **Skybound Instagram → Ahmad** | **STRONG** | Bio: `Founded by @ahmadkhvlid`. States the founder relationship explicitly and links the founder account | Uses the handle, not the name "Ahmad Khalid". Instagram bio links are nofollow |
| **Skybound LinkedIn → Ahmad** | **MODERATE** | Company page lists exactly one employee: **Ahmad Khalid**, linked to `ca.linkedin.com/in/ahmadkhvlid` | Establishes *employment*, not *founding*. No founder/owner designation is publicly visible on the page |
| **Ahmad LinkedIn → Skybound** | **UNKNOWN** | Cannot be read — HTTP 999 guest block. LinkedIn's employee edge implies an experience entry exists, but its **title is unverified** | If the title is not `Founder`, or the company is typed as free text rather than the linked page, this link is far weaker than it looks |
| **Ahmad Instagram → Skybound** | **WEAK** | Bio: `@skyboundscaling 👨🏽‍💻` / `Web Designs` | Tags the company but states **no role**, and the profile has **zero outbound links** — no website at all. 784 followers, the larger of the two accounts, pointing nowhere |

## The single weakest connection
**Ahmad's Instagram → Skybound Scaling.**

It is the weakest for three compounding reasons. It is the only link in the set that states no role at all — a tag is not a claim. It is the only profile in the entire identity set with **zero outbound links**, so the founder's largest audience (784 followers, versus 135 on the company account) is given no route to the canonical domain. And it is the one that is entirely within Ahmad's control, needs no approval from anyone, and takes under a minute — which makes its current state pure unforced loss.

Ahmad's LinkedIn profile is arguably a *bigger* unknown, but it cannot be called the weakest link honestly, because it cannot be measured. The evidence available — LinkedIn binding him to the company page as its sole employee — suggests something is already there. Instagram's weakness, by contrast, is **verified**.

## The single highest-value action
**Fix the Website field on the LinkedIn company page: `https://www.AuDesigns.co/` → `https://www.skyboundscaling.com/`.**

This is not the weakest link, and that is deliberate — the highest-value action and the weakest link are different things here.

The Instagram bio is a missing signal. The LinkedIn website field is an **actively wrong** one, and wrong beats missing for damage every time. Right now the company's only professional-network record — the record most likely to be retrieved for "what is Skybound Scaling?" — asserts that the company's website is a *different live domain in the same industry*. That does not merely fail to help; it teaches every crawler and answer engine to bind the Skybound Scaling name to `audesigns.co`, a site that still serves as a standalone brand with no redirect and no rebrand notice. It is also the field that most directly undercuts the reciprocal `sameAs` link the website now publishes.

It takes about sixty seconds and turns the single most contradictory signal in the entity graph into the single most corroborating one.

**Ranked immediately after it:** (2) put `Founder of Skybound Scaling` and the canonical URL in Ahmad's Instagram bio; (3) confirm the LinkedIn experience title reads `Founder` and is linked to the company page via the dropdown; (4) set the company page's location to Toronto; (5) redirect `audesigns.co` to `https://www.skyboundscaling.com/`.

## What would move this to STRONG
Every link reciprocated and role-explicit: the company page website field corrected and location set; Ahmad's LinkedIn headline and experience publicly reading `Founder of Skybound Scaling` and linked to the page; his Instagram bio stating the role and the URL; and the About page naming him in visible copy. All are within the owner's own control — no third party, no outreach, no budget. That is unusual and worth acting on quickly.

## What would move it to VERY STRONG
Only independent corroboration can: a client, directory, publication, or interview describing Ahmad Khalid as the founder of Skybound Scaling **on a domain neither of them owns**. That is Step 3B onward and deliberately out of scope here.
