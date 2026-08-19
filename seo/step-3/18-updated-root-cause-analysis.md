# Updated Root Cause Analysis — 2026-08-19
Re-evaluated now that the site is deployed, clean URLs are live, GSC has processed the sitemap, and the homepage is reported on Google.

## The question
Why did "What is Skybound Scaling?" / "Who is Skybound Scaling?" fail, and why does it still fail today?

## Updated ranking

### #1 — Lack of independent corroboration · Severity **VERY HIGH** · Confidence **HIGH**
No source that is not owned by the company describes it. Verified: 0/7 clients mention it (rendered-DOM checked), no editorial, no podcast, no partner page, no verified database record. A retrieval system asked to explain an entity selects and cites *documents*; for this entity, none exist to select.
**Fix:** Levels 1–2 of the corroboration ladder — profiles, then client credits.

### #2 — Brand ambiguity against better-established namesakes · Severity **VERY HIGH** · Confidence **HIGH**
This has been **upgraded from Step 2**. The exact phrase "Skybound scaling" already denotes Transformers power-scaling; "Skybound" is owned by Skybound Entertainment; and Step 3 newly identified **Skybound Realty, a Toronto brokerage founded in 2025** — which invalidates "Skybound + Toronto" as a disambiguator. At least eight same-industry namesakes are better indexed. The systems are not failing to find *an* answer; they are confidently returning a *different* entity.
**Fix:** industry-first identity formula, repeated identically across independent sources.

### #3 — Weak founder→company association · Severity **HIGH** · Confidence **HIGH**
Verified: no public source outside the company's own schema connects Ahmad Khalid to Skybound Scaling. His Instagram tags the brand but states no role and links no site. Founder-name queries return other people, including **Khalid Yassin of Skybound CX** — a name-plus-Skybound collision.
**Fix:** IG bio, LinkedIn founder position, and a visible on-site mention.

### #4 — Missing professional/database profile layer · Severity **HIGH** · Confidence **HIGH**
No LinkedIn company page (404 verified). Crunchbase/Clutch unverified (403). These are the records most commonly retrieved for company-identity questions.
**Fix:** create them; verify the 403s manually.

### #5 — Original technical / indexability issue · Severity **LOW (now largely resolved)** · Confidence **HIGH**
This was ranked #1 in Step 2 and has been **substantially fixed**: canonical host, HTTPS, clean URLs, redirects, sitemap, entity graph all verified live today, and GSC has processed the sitemap. It is no longer the binding constraint.
**Important nuance:** being indexed is not the same as being retrieved for a query. The site can be in the index and still lose every brand query to stronger entities. Do not re-open technical work to chase this.

### #6 — Insufficient authority / source diversity · Severity **MEDIUM** · Confidence **MEDIUM-HIGH**
Downstream of #1 and #4; cannot be addressed directly, only as a consequence of them.

### #7 — Search demand · Severity **LOW** · Confidence **MEDIUM**
A 2025 brand has little branded search volume. Real but not actionable now, and not a cause of the original failure.

## The headline change since Step 2
**The diagnosis has shifted from "technical + external" to "almost entirely external."** Step 1 and 1.5 fixed what the company controls on its own property, and that work verifies clean today. What remains is that **the public web contains no independent evidence this company exists**, while a crowded field of better-documented namesakes — now including one in the same city — occupies the name. No further website change materially moves this.
