# Ahmad Khalid — LinkedIn Profile Final Data Pack
Target: **https://www.linkedin.com/in/ahmadkhvlid**

> **Verification note, stated plainly:** the profile's current contents could **not** be read. `/in/ahmadkhvlid` returns HTTP **999** to every automated request and a sign-up wall to a logged-out browser — LinkedIn's guest block, not a 404. What *is* verified: the profile exists, renders the name **Ahmad Khalid**, sits on the `ca.` (Canada) subdomain, and is the **only employee linked to the Skybound Scaling company page**.
>
> Everything below is therefore a **target state**, not a diff. Compare each field against what is actually on the profile and change only what does not already match. If a field already says the right thing, leave it alone.

## Headline — 3 options, one recommended

**★ RECOMMENDED**
```
Founder of Skybound Scaling | Web design, SEO, ads and AI automation for growing brands
```
Leads with the founder relationship in plain words, names the company in full, then states the category. It is a sentence a person would say out loud, it disambiguates against every other "Skybound", and it leaves room for content positioning later.

**Option B — service-led**
```
Founder of Skybound Scaling | We build websites and growth systems that turn traffic into revenue
```
Warmer, more of a hook. Slightly weaker as an entity signal because the category words arrive late.

**Option C — minimal**
```
Founder of Skybound Scaling
```
Clean and completely unambiguous. Use it if you want the profile to read as understated. Costs you the category keywords.

All three open with the exact phrase **"Founder of Skybound Scaling"** — that is the part that does the entity work. Whichever you choose, do not shorten the company to "Skybound".

## Experience entry
| Field | Value |
|---|---|
| Title | `Founder` |
| Employment type | `Self-employed` (must match the company page's type) |
| Company | `Skybound Scaling` — **select the linked company page from the dropdown**, do not type it as free text |
| Location | `Toronto, Ontario, Canada` |
| Location type | `Hybrid` or `Remote` — whichever is true |
| Start date | The month and year that is actually true (see the founding-year note in `linkedin-company-final-data.md`) |
| Currently working here | Yes |

**The dropdown step is the one that matters.** Selecting the company page from the autocomplete creates a machine-readable edge between your Person record and the Organization record, and puts the company logo on your profile. Typing "Skybound Scaling" as plain text creates a string, not a relationship, and LinkedIn will not connect the two. If your existing entry was typed as free text — or still says AuDesigns — re-link it.

### Experience description — factual, no invented responsibilities
> Founded and run Skybound Scaling, a digital marketing and growth agency in Toronto. I work directly on client engagements across web design and development, brand identity, SEO, Google Ads and Meta Ads, lead generation, and AI and CRM automation. I also run the agency's white-label program, delivering web design, development, and SEO for other marketing agencies under their brand.
>
> Website: https://www.skyboundscaling.com/

Every claim maps to a live service page. Nothing about team size, revenue, client counts, or results — none of that is verified, and none of it is needed.

## About section
Establishes founder → company → category → website without reading like a landing page.

> I'm the founder of Skybound Scaling, a digital marketing and growth agency based in Toronto.
>
> We build the systems that bring customers in and keep them coming: conversion-focused websites on Framer or custom code, brand identity, SEO, Google Ads and Meta Ads, landing pages and funnels, and AI and CRM automation. The work spans construction, healthcare AI, ecommerce, and consumer platforms, across Canada and the United States.
>
> We also work behind the scenes for other agencies — white-label web design, development, and SEO delivered under their brand, with client communication handled end to end.
>
> The idea the agency is built on is a simple one: the senior who wins your trust should be the one doing your work.
>
> Skybound Scaling: https://www.skyboundscaling.com/

The closing line is drawn from the site's own About page, so the two read as one voice. The URL is written in full, canonical form so it is quotable as a citation.

## Other profile fields
| Field | Action |
|---|---|
| **Website / Contact info** | Add `https://www.skyboundscaling.com/`, labelled `Company` |
| **Location** | `Toronto, Ontario, Canada` |
| **Industry** | `Marketing Services` — same as the company page |
| **Featured** | Optional but high value: feature `https://www.skyboundscaling.com/work/callura/` or `/work/saadi-builds/`. Featured links are crawlable and give the profile a real outbound citation |
| **Banner image** | Optional. If it still carries AuDesigns branding, replace it |
| **Profile photo** | Already present |
| **Custom URL** | `ahmadkhvlid` — already set, matches the Instagram handle exactly. **Do not change it** |

## Do not add
- ❌ Any title other than `Founder` — not CEO, Managing Partner, or Director unless it is genuinely true.
- ❌ Any employer, certification, award, or education entry that is not real.
- ❌ AuDesigns as a *current* position. If you keep it as a past role that is honest history, but the current, open-ended role is Skybound Scaling. If an old AuDesigns entry is still marked "present", close it.
- ❌ Keyword lists in the headline ("SEO | PPC | Web Design | Growth Hacking | AI | Automation | ..."). It reads as spam and does not help.
- ❌ Cities you do not serve.
