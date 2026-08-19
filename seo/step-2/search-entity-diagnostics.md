# Search Engine Entity Diagnostics
Research date: 2026-08-19 · Tooling: one US web-search backend + live HTTP probes. (Direct Google/Bing SERP scraping and Knowledge-Graph API access are not available here; findings below are from the available index and are internally consistent.)

## Observed results by query
| Query | Official site? | Official socials? | Third-party refs? | What dominates instead |
|---|---|---|---|---|
| "Skybound Scaling" (exact) | **NO** | NO | NO | Transformers power-scaling Quora posts; Skybound Entertainment invest pages |
| What is Skybound Scaling | **NO** | NO | NO | Same fan-content interpretation, answered as comics scaling |
| skyboundscaling.com | **NO** | NO | NO | skybound.com, skyboundcapital.com, skybound.cx; backend suggests the domain "may not have significant web presence or indexing" |
| "Skybound Scaling" marketing agency Toronto | **NO** | NO | NO | Toronto agency listicles + five unrelated Skybound-named agencies |
| "Skybound Scaling" "Ahmad Khalid" | **NO** | NO | NO | Unrelated Khalid Ahmads; Skybound CX; Skybound Wealth |
| Domain-restricted: site pages only | **ZERO results** | — | — | The index returns no pages from skyboundscaling.com at all |
| Social-restricted (LinkedIn/IG/X/FB/YT) | — | **NO** | — | Skybound Entertainment/Games accounts; unrelated Skybound agencies |
| Directory-restricted (Crunchbase/Clutch/G2/Yelp/BBB/OpenCorporates) | — | — | **NO** | Other Skybound companies' records |

## Interpretation (observable-evidence only)
1. **Indexing:** the canonical site is effectively absent from the index tested — consistent with a young domain that (a) still serves the pre-fix canonical conflict in production (live pages on www still declare apex canonicals that 308 back to www — verified live today; the Step-1 repair is committed but NOT yet deployed), and (b) has zero external links to trigger discovery, and (c) has no confirmed Search Console / sitemap submission (EVIDENCE INSUFFICIENT — only the owner can check GSC).
2. **Entity recognition:** no evidence any search engine models "Skybound Scaling" as a business entity: no profile results, no category association, no knowledge-panel-style corroborators (no Wikipedia/Wikidata/Crunchbase/GBP records exist to power one).
3. **Category understanding:** for agency-intent queries the engines return *other* Skybound agencies — the category slot next to this name is being filled by competitors.
4. **HTTPS/host layer:** healthy (HTTP→HTTPS and apex→www 308s verified). Not a contributor.

## What this rules in/out
Rules OUT "the site is penalized/blocked": robots.txt is fully permissive, pages return 200, 404s are real, no noindex anywhere (verified in Step 1). Rules IN: young + unsubmitted + canonical-trapped in production + externally uncorroborated. The entity problem cannot even begin to resolve until the pages themselves are indexed.
