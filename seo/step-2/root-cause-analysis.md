# Root Cause Analysis
## Why did "What is Skybound Scaling?" / "Who is Skybound Scaling?" fail without the URL?
Date: 2026-08-19. Every cause below is evidenced in the step-2 audit files.

### Ranked causes
**#1 — The official site is not in the index (Category I / A).**
Evidence: domain-restricted search returns zero pages; the domain query itself surfaces nothing; the backend labels the domain as having no significant presence. Contributors: (a) the live deployment STILL serves the pre-Step-1 canonical conflict — every www page declares an apex canonical that 308-redirects back to www, a loop that suppresses canonical selection; (b) no confirmed sitemap submission (GSC state unverifiable from here); (c) domain is months old with zero inbound links to force discovery. Severity: CRITICAL. Confidence: HIGH. Contribution: ~40%. Fix: deploy the committed build; verify domain property in GSC; submit sitemap; request indexing on priority pages.

**#2 — Zero independent corroboration (Categories B, C, K, I).**
Evidence: no directory records, no editorial, no client mentions (7/7 client homepages checked), no third-party pages of any kind; the only external asset is an unindexed 135-follower Instagram. Even with perfect indexing, an AI has no independent document from which to say who this company is. Severity: CRITICAL. Confidence: HIGH. Contribution: ~30%.

**#3 — Extreme brand-name ambiguity (Category D).**
Evidence: the exact phrase "Skybound scaling" already means Transformers character power-scaling in indexed content; Skybound Entertainment dominates the token; at least six other marketing agencies use Skybound-variant names and ARE indexed. Retrieval confidently resolves the query — to the wrong entities. Severity: HIGH. Confidence: HIGH. Contribution: ~15%.

**#4 — Founder-company connection absent (Category E).**
Evidence: "Ahmad Khalid" appears nowhere on the site (testimonials say "Ahmad" only); his IG has no role statement, no site link, and is unindexed; joint searches return unrelated people. Founder queries dead-end. Severity: HIGH. Confidence: HIGH. Contribution: ~8%.

**#5 — Missing/contradictory official profile layer (Category F).**
Evidence: LinkedIn/X/Dribbble URLs asserted in schema returned 404 (contradictory identity signals, now removed); no LinkedIn page exists at all; no GBP surfaced. Severity: MEDIUM-HIGH. Confidence: HIGH. Contribution: ~5%.

**#6 — No branded demand, no knowledge-graph substrate, no topical authority yet (G, H, J).**
Real but downstream: these cannot exist for a 2025 company with #1-#5 unresolved. Contribution: ~2% today.

### Direct answers to the checklist
- Technically crawlable? **YES** (robots open, 200s, real 404s, no noindex).
- Indexed? **NO** (observed).
- Externally corroborated? **NO.**
- Disambiguated? **NO** — actively confused with stronger entities.
- Founder relationship established? **NO** (until this step's schema, and still not visibly).
- Enough independent sources? **NO — zero.**
- Other Skybound entities dominating retrieval? **YES — demonstrably.**
- Official site authoritative enough for AI selection? **Moot while unindexed; afterwards, authority must come from #2.**

### Verdict
**Answer: L — a compound failure, dominated by A+I (invisible official source) and B/C/K (zero independent corroboration), amplified by D (severe name collision) and E/F (missing founder and profile layer).** It was never primarily an on-page technical-SEO problem beyond the canonical trap — and after deployment, the remaining work is almost entirely EXTERNAL.
