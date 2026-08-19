# Manual Action Checklist — Ahmad
Step 3A. Everything here needs a logged-in account and cannot be done from the codebase.
**Total time for the DO NOW block: about 12 minutes.**

---

# DO NOW

## 1. Fix the website field on the LinkedIn company page ⚠️ MOST IMPORTANT
| | |
|---|---|
| **Platform** | LinkedIn (company page admin) |
| **URL** | https://www.linkedin.com/company/skyboundscaling → Admin tools → Edit page → Overview |
| **Field** | Website |
| **Current value** | `https://www.AuDesigns.co/` |
| **Set to** | `https://www.skyboundscaling.com/` |
| **Mandatory** | **YES** |
| **Why** | Your only professional-network record currently tells every crawler and answer engine that Skybound Scaling's website is a different domain. `audesigns.co` is still live as a standalone site with no redirect, so this actively binds the Skybound Scaling name to a retired brand. It also contradicts the `sameAs` the website now publishes. This one field is the difference between the page helping and hurting. |
| **Do not enter** | Anything but the exact canonical URL. No tracking parameters, no shortener, no apex-only, no `http://`. |

## 2. Replace the "About us" text on the company page
| | |
|---|---|
| **Platform** | LinkedIn (company page admin) |
| **URL** | Same page → Overview → About us |
| **Current value** | `Premium Web Design and Marketing for High Performing Brands.` |
| **Set to** | The paragraph in `linkedin-company-final-data.md` → "About us — paste this verbatim" |
| **Mandatory** | Strongly recommended |
| **Why** | The current line describes a web design studio, names no founder, no city, and no service range. It is the sentence an answer engine is most likely to quote when asked what Skybound Scaling is. The replacement carries industry, founder, city, and service span in one pass, and matches every other profile word for word. |
| **Do not enter** | Anything from the AuDesigns site, especially `100+ clients worldwide` — unverified for this entity. |

## 3. Set the company page location
| | |
|---|---|
| **Platform** | LinkedIn (company page admin) |
| **URL** | Same page → Locations |
| **Field** | Location |
| **Current value** | Not set |
| **Set to** | `Toronto, Ontario, Canada` — city and region only |
| **Mandatory** | Recommended |
| **Why** | Toronto is your strongest disambiguator against Skybound Entertainment and Skybound Digital, and the page currently forfeits it entirely. |
| **Do not enter** | **A street address. None exists publicly — do not invent one.** Leave the street field blank. |

## 4. Replace the company page logo
| | |
|---|---|
| **Platform** | LinkedIn (company page admin) |
| **Field** | Logo |
| **Current value** | Asset still named `audesignswebstudio_logo` — old-brand file |
| **Set to** | Re-upload from the repo: `/assets/brand/logo-full.png`, or `/assets/brand/logo-mark.png` for a square crop |
| **Mandatory** | Only if the visible mark is still the AuDesigns logo — **check this by eye first** |
| **Why** | The filename proves the asset predates the rebrand. Whether the image was swapped during the rename can't be determined from outside, so confirm visually. Visual identity is a real corroboration signal; a mismatched logo reads as a stale or abandoned page. |

## 5. Check and fix your own LinkedIn profile
Your profile can't be read from outside — LinkedIn returns HTTP 999 to everything automated, and a sign-up wall when logged out. So this is a **check, then fix only what's wrong**, not a rewrite.

| | |
|---|---|
| **Platform** | LinkedIn (personal profile) |
| **URL** | https://www.linkedin.com/in/ahmadkhvlid |
| **Fields** | Headline · Experience · Contact info · Location · Industry |
| **Mandatory** | **YES for the Experience entry** |

Confirm each, and change only what doesn't already match:

- **Headline** → `Founder of Skybound Scaling | Web design, SEO, ads and AI automation for growing brands` (two alternates in `ahmad-khalid-linkedin-final-data.md`). Must open with the exact words **"Founder of Skybound Scaling"**.
- **Experience** → Title `Founder`, Company `Skybound Scaling`. **Pick the company from the autocomplete dropdown — do not type it as text.** This is the step that matters: the dropdown creates a real relationship between your profile and the company page; typed text creates only a string. If the entry is currently free text, or still says AuDesigns, re-link it.
- **If an AuDesigns role is still marked "present"** → close it with an end date. Keeping it as past history is honest; leaving it open-ended creates a second current employer and splits your identity.
- **Contact info → Website** → add `https://www.skyboundscaling.com/`, labelled `Company`.
- **Location** → `Toronto, Ontario, Canada`. **Industry** → `Marketing Services`.
- **About section** → the text in `ahmad-khalid-linkedin-final-data.md`.

**Why it matters:** LinkedIn already lists you as the company's only employee, so a connection exists — but your *title* is not publicly visible, which means nothing on LinkedIn currently says you **founded** it. That word is the whole point of this step.

**Do not enter:** any title other than `Founder`; keyword-stuffed headlines; fake certifications, awards, or education.

## 6. Fix your Instagram bio
| | |
|---|---|
| **Platform** | Instagram |
| **URL** | https://www.instagram.com/ahmadkhvlid → Edit profile |
| **Fields** | Bio · Website |
| **Current bio** | `@skyboundscaling 👨🏽‍💻` / `Web Designs` |
| **Current website** | **Empty — the profile has zero outbound links** |
| **Set bio to** | `Founder of Skybound Scaling` / `Websites • SEO • Ads • AI` / `@skyboundscaling` |
| **Set website to** | `https://www.skyboundscaling.com/` |
| **Mandatory** | **YES** |
| **Why** | This is the verified weakest link in the entire identity set. It states no role — a tag is not a claim — and your 784 followers, the larger of your two audiences, are given no route to the site at all. It takes under a minute and needs nobody's approval. |
| **Do not enter** | Keyword lists, fake location, or a link-in-bio aggregator in place of the real domain. |

---

# DO IF NEEDED

## 7. Settle the founding year — DECISION REQUIRED
LinkedIn says **Founded 2024**. The website says **Est. 2025** everywhere, including schema on all 105 pages. Under a rebrand both can be honest — 2024 for the business as AuDesigns, 2025 for the Skybound Scaling brand. **Only you can settle which is true.**

- Business trading continuously since 2024 → the honest date is **2024**, and the *website* should change. Say the word and it'll be done as a separate focused change across footer, About, Careers, and `foundingDate`.
- Skybound Scaling genuinely began in 2025 → set **LinkedIn to 2025**. Lower effort, consistent with everything already published.

Do not leave them contradicting each other.

## 8. Redirect the old domain — HIGH VALUE
Point `audesigns.co` (and `www.audesigns.co`) at `https://www.skyboundscaling.com/` with a **301 permanent redirect**.

Right now it serves a full standalone site — *"AuDesigns | Web Design & Branding Studio ... trusted by 100+ clients worldwide"* — with no rebrand notice and no redirect. While it stays up, it competes with Skybound Scaling for the same identity, in the same industry, run by the same person, and it is where LinkedIn currently sends anyone looking for your website. A 301 consolidates any accumulated authority into the canonical domain and makes the rebrand real to search engines rather than only to people. This is the single biggest remaining item after the LinkedIn fixes.

*(If you want to keep AuDesigns alive as a separate business, that is a legitimate choice — but then it needs its own LinkedIn page, and the Skybound Scaling page must stop pointing at it.)*

## 9. Verify the incorporated name
The site footer and schema use `Skybound Scaling Inc.` as `legalName`. This has never been checked against a corporate registry. Confirm it in the Ontario or federal registry. Until confirmed, keep it out of every external profile — LinkedIn included.

## 10. Company Instagram link — minor normalization
The company IG website link is `http://skyboundscaling.com/` — apex host, HTTP scheme. It works, via two redirects. Change to `https://www.skyboundscaling.com/` next time you're in there. Low priority, thirty seconds.

---

# DO NOT DO

- ❌ **Do not create a second LinkedIn company page.** Checked: no duplicate exists, and the page you have is the right one. A second page would split the entity permanently.
- ❌ **Do not delete or rename the existing page.** The rename from AuDesigns preserved its history and its employee edge. Starting over would destroy both.
- ❌ **Do not enter a street address** anywhere. None exists publicly.
- ❌ **Do not use `Skybound Scaling Inc.`** externally until the registry confirms it.
- ❌ **Do not invent** employee counts, revenue, client counts, awards, certifications, partnerships, or founding details to fill a field. Leave it blank instead.
- ❌ **Do not carry AuDesigns claims across** — `100+ clients worldwide` is not verified for this entity.
- ❌ **Do not shorten the name to "Skybound"** in any external profile. Skybound Entertainment, Skybound Realty (Toronto, founded the same year), Skybound Digital, and Skybound Marketing all exist. Always both words.
- ❌ **Do not keyword-stuff** headline, specialties, or bios. LinkedIn allows 20 specialties; use 14 real ones.
- ❌ **Do not move on to Crunchbase, Clutch, Google Business Profile, client outreach, press, or podcasts yet.** Those are Step 3B onward, and they depend on the identity being consistent first.

---

# Verification after you're done
Open `https://www.linkedin.com/company/skyboundscaling` in a **private/incognito window** (logged out — that's what a crawler sees) and confirm:

1. Website reads `https://www.skyboundscaling.com/` ✓
2. About us is the new paragraph ✓
3. Location shows Toronto, Ontario ✓
4. Logo is the Skybound mark ✓
5. Industry still reads Marketing Services ✓
6. Ahmad Khalid still appears under employees ✓

Then open `https://www.linkedin.com/in/ahmadkhvlid` in the same private window and confirm your headline and Founder title are publicly visible. **If the profile doesn't render for a logged-out visitor, your public-profile visibility is off** — turn it on under Settings → Visibility → Edit your public profile. A profile that only signed-in members can see does nothing for entity resolution.

Report back what each field shows and the site's records will be updated to match.
