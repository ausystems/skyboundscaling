# LinkedIn — Realistic Search & Discovery Impact
Written to be honest about mechanism and uncertainty. No ranking guarantees appear in this document, because none can be made.

## What this is not
Connecting LinkedIn will not "make Google rank Skybound Scaling #1". LinkedIn is not a ranking lever, it does not pass meaningful link equity (company page links carry `nofollow`), and no amount of profile completion overrides the actual constraint documented in Step 3: **almost nothing on the public web describes this company**.

What it does is narrower, real, and worth doing.

## DIRECT EFFECTS — mechanically true, observable

**1. A second indexable document describing the entity now exists.**
Public LinkedIn company pages are crawlable and are routinely indexed. Before this, the only web documents describing Skybound Scaling were on `skyboundscaling.com` and two Instagram bios. Now there is one more, on a high-authority third-party domain, that states the name, the category, and (once corrected) the website. Whether it *is* indexed is **UNKNOWN** and is not claimed here — existence is verified, indexation is not.

**2. A machine-readable category assignment on a third-party domain.**
The page carries `Industry: Marketing Services` and its own Organization JSON-LD. Category is the specific signal that separates this entity from Skybound Entertainment, Skybound Realty, Skybound Digital, and the rest of the namesake field. Having it asserted somewhere other than the company's own site is a genuine gain.

**3. A person↔organization edge that is not self-asserted in the ordinary sense.**
LinkedIn's employee graph binds `Ahmad Khalid` to the `Skybound Scaling` company record structurally, not just as text. That is a different *kind* of statement from a sentence on an About page.

**4. Reciprocal `sameAs` confirmation.**
The website now declares the LinkedIn page as the organization's profile, and the founder profile as the person's. When both endpoints agree, an entity resolver has a confirmed pair rather than an unverified claim. **This effect is currently undermined** by the page's website field pointing at `audesigns.co` — the pair does not agree until that is fixed, which is why it is the top action.

**5. A crawlable link to the canonical domain — once corrected.**
Nofollowed, so no PageRank. Still a discovery path and a corroborating co-occurrence of the brand name with the canonical URL.

## INDIRECT EFFECTS — plausible, not guaranteed

- **Brand-query result quality.** LinkedIn company pages often surface for "<company name> + linkedin" and sometimes for the bare brand name. If it surfaces for "Skybound Scaling", that is one more correct result crowding out namesakes. **Not guaranteed** — it depends on competition for the string and on the page having enough substance to rank.
- **Knowledge-panel eligibility.** Consistent, corroborated entity data across independent sources is part of what makes an entity resolvable. LinkedIn is one such source. **No claim is made that LinkedIn is a Google Knowledge Graph source** — that relationship is not publicly documented and is not asserted here.
- **Namesake separation.** Every additional source pairing "Skybound Scaling" with "Marketing Services" and "Toronto" shifts the balance of evidence against Skybound Realty and Skybound Entertainment. Incremental, cumulative, not decisive on its own.
- **Referral traffic and B2B discovery.** People do look up agencies on LinkedIn before buying. Real, and unrelated to search ranking.

## UNKNOWN — stated as unknown

- Whether the page is currently indexed by Google, Bing, or any other engine.
- Whether it will ever rank for the brand name.
- How any engine weights LinkedIn relative to other sources.
- Whether a knowledge panel will ever be produced for this entity.
- How long any of this takes. Entity consolidation is not a deploy; there is no completion event to observe.

## The damage being repaired, which is the real story here
The most important search effect of this work is **not** additive. It is the removal of an active contradiction.

Until the website field is corrected, the company's only professional-network record tells crawlers that Skybound Scaling's website is `audesigns.co` — a live, standalone site for a retired brand in the same industry, with no redirect and no rebrand notice. That is worse than having no LinkedIn page at all: it is a high-authority source actively binding the brand name to the wrong domain, and it directly contradicts the `sameAs` the website now publishes.

Fixing one field converts the single most contradictory external signal into the single most corroborating one. That is the highest-value search outcome available in this entire step, and it costs about a minute.

## Honest expected outcome
Correctly finished, LinkedIn moves the external-entity picture from "one platform, owned social only" to "two platform types, one of them the standard professional-identity record for B2B companies". Measured against `17-external-entity-scorecard.md`, it should move **Source diversity** (5), **Professional profile presence** (0), and **Founder→company connection** (15).

It will not by itself fix brand-query discoverability, because that is blocked by something LinkedIn cannot supply: **independent sources that are not the company describing the company**. That remains the constraint, and it remains Step 3B onward.
