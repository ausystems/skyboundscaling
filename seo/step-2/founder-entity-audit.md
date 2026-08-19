# Founder Entity Audit: Ahmad Khalid
Research date: 2026-08-19

## Verified founder assets
| Asset | Status | Evidence |
|---|---|---|
| Instagram https://www.instagram.com/ahmadkhvlid | LIVE | Display name "Ahmad Khalid"; bio: "@skyboundscaling 👨🏽‍💻"; 784 followers; **no website link; no "Founder" statement** |
| Company site naming him | **ABSENT** | "Ahmad Khalid" appears nowhere on skyboundscaling.com. Three client testimonials say "Ahmad and his team at Skybound Scaling" (first name only, no surname, no title) |
| Organization schema founder | **ADDED THIS STEP** | `Organization.founder` → Person "Ahmad Khalid" (@id /#founder, jobTitle "Founder", sameAs → his Instagram) now ships on every page |
| LinkedIn personal profile | EVIDENCE INSUFFICIENT | No LinkedIn profile connecting an Ahmad Khalid to Skybound Scaling was found in search. Whether a personal profile exists but is unindexed/unlinked cannot be determined from here |
| X / YouTube / personal site | NONE FOUND | No results |
| Search for "ahmadkhvlid" | ZERO results | The handle has no indexed footprint |
| "Skybound Scaling" "Ahmad Khalid" joint search | ZERO joint results | Surfaced only unrelated Khalid Ahmads (a physician, a software engineer, a Wikipedia poet) and unrelated Skybound companies — a live demonstration of both name-collision risks |

## DO-NOT-MERGE list (same or similar name, different people)
khalidahmad.dev (software engineer) · Khalid Ahmad MD (Allied Physicians) · Khalid Ahmed / Khalid Ahmad (Wikipedia entries) · Mohammed Kamil Khan (Skybound Wealth) · Khalid Yassin (Skybound CX). None of these are the founder. Any future bio/profile must include the company name and domain so machines can separate him from these.

## Assessment
- Founder identity clarity: **Weak.** One live profile, minimal bio, no role stated, no URL.
- Founder → company relationship: **One-directional and informal.** His IG tags the company; the company (until today) never named him. After this step the site's schema states the relationship on every page; the visible site still does not.
- External corroboration: **Zero.** No third-party source connects Ahmad Khalid to Skybound Scaling.
- Cross-profile consistency: **N/A** — there is only one profile.
- Missing signals: full name + "Founder of Skybound Scaling" + www URL in his IG bio; a personal LinkedIn stating the role and linking the domain; a visible founder mention on the site's About page; any single independent source (interview, podcast, directory) stating "founded by Ahmad Khalid".

## Highest-value legitimate improvements (in order)
1. His IG bio → "Founder of Skybound Scaling" + website link https://www.skyboundscaling.com/ (2 minutes, closes the loop his own profile half-opens).
2. Personal LinkedIn profile with the role "Founder, Skybound Scaling" linked to a new company page (the single strongest founder-entity instrument on the professional web).
3. A short founder section or byline on the About page naming "Ahmad Khalid, Founder" (visible text to match the new schema; owner's copy decision — see human checklist).
4. First external interview/podcast where he is introduced with the full disambiguation formula.
