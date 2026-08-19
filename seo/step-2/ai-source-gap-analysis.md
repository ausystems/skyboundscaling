# AI Citation / Source Gap Analysis
Research date: 2026-08-19

Question: what would a retrieval-grounded AI need in its index to answer "What is Skybound Scaling?" correctly and confidently — and which of those sources exist today?

| Source class | Role in an AI answer | Status today | Evidence |
|---|---|---|---|
| Official website, indexed | Primary self-description; the URL the answer cites | **MISSING (exists but unindexed; fix committed, not deployed)** | Domain-restricted search: 0 results; live canonicals still pre-fix |
| Organization + founder structured data | Machine-readable identity the engines reconcile | **PRESENT (as of Step 1 + this step)** — ships with next deploy | Schema validated locally: #organization / #website / #webpage / founder Person |
| Professional-network company page (LinkedIn) | The most-cited third-party identity record for B2B "what is X" answers | **MISSING** (claimed handle 404s) | Direct probe |
| Founder profile stating the role | Resolves "who founded X" and disambiguates the person | **PARTIAL** — IG exists, tags the company, but no role, no link, unindexed | Direct fetch |
| Business databases (Crunchbase-class) | High-trust structured corroboration AI systems retrieve for company queries | **MISSING** | Restricted search: no record |
| Agency directory with reviews (Clutch-class) | Category + location + client-proof corroboration | **MISSING** | Restricted search: no record |
| Google Business Profile | Anchors name+category+geo in Google's entity systems | **MISSING (no public evidence of one)** | Brand searches surface none |
| Client corroboration (credits/case mentions on client domains) | Independent, topically-relevant proof the company does what it claims | **MISSING** (7 candidate domains, 0 mentions) | Direct fetches |
| Independent editorial / interview / podcast | The "reliable third party said so" layer; heavily weighted in AI answers | **MISSING** | All searches |
| Wikipedia / Wikidata | Knowledge-graph backbone | **MISSING — and NOT appropriate yet** (no independent coverage to cite; pursuing now would fail notability review) | Search + policy |
| Social profiles beyond IG (X, YouTube, FB) | Secondary corroboration, minor | MISSING | Probes |
| llms.txt / llms-full.txt | AI-crawler convenience layer | **PRESENT** | On-site |
| Branded search demand | Behavioral signal engines use to learn an entity is sought | **MISSING / EVIDENCE INSUFFICIENT** (no data source here; company is new) | — |

## The minimum viable citation set (what to build first)
For a confident AI answer, roughly this set must exist and agree: indexed official site + LinkedIn company page + founder profile stating the role + one business database record + one agency directory record + two client credits + (later) one editorial mention. Today the score is **1.5 of 7** (schema ready; founder profile partial). Everything in the set is legitimately buildable within weeks except editorial, which takes outreach time.
