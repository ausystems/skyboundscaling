# LinkedIn — AI / LLM Entity Signal Assessment
Deliberately conservative. Where a mechanism is speculative it is labelled speculative.

## The failure this addresses
Step 3 tested retrieval and recorded total failure (`00-current-baseline.md`, row N):

- *"Who founded Skybound Scaling"* → returned **Skybound Entertainment** (Robert Kirkman / David Alpert)
- *"Skybound Scaling Toronto"* → returned **Skybound Realty** and Transformers fan content
- *"Ahmad Khalid founder Skybound"* → returned **Khalid Yassin of Skybound CX**

The cause is not obscurity alone. It is that a heavily contested name has **no corroborated record** attached to the correct entity, so any retrieval system resolves the string to whichever Skybound *does* have records. Re-running these queries during this session confirmed the pattern is unchanged: searching `"Skybound Scaling" LinkedIn Ahmad Khalid founder` returned Skybound Entertainment and unrelated people named Khalid.

## What LinkedIn plausibly contributes

### Retrieval source — LIKELY, not guaranteed
AI systems that answer with live web retrieval (search-grounded assistants, AI Overviews, Copilot, Perplexity-style products) fetch from the indexed web at answer time. A public LinkedIn company page is the kind of document such systems commonly retrieve for company questions, because it is structured, on a high-authority domain, and predictable in shape.

**Precondition:** it must be indexed and retrievable. That is **UNKNOWN** and is not claimed. Existence is verified; retrievability is not.

### Entity corroboration — REAL
The mechanism that resolves an ambiguous name is not any single strong source; it is **the same facts appearing in several independent places**. LinkedIn adds a second platform stating: name `Skybound Scaling`, category `Marketing Services`, and (once corrected) website `https://www.skyboundscaling.com/`, with `Ahmad Khalid` bound to that record. That is the shape of evidence that lets a system distinguish this Skybound from the entertainment company and the realty brokerage.

### Source diversity — REAL, and the specific gap it fills
`17-external-entity-scorecard.md` scored source diversity **5/100**: one source type (owned social) out of seven categories. LinkedIn is the *professional-network* category — the one a B2B agency is most expected to occupy. Its absence was conspicuous in a way that actively signalled "this company may not be real". Occupying it removes that signal.

### Public consistency — REAL, and currently working against the entity
Retrieval systems weigh agreement between sources. Consistent facts reinforce; contradictory facts suppress. **Right now the LinkedIn page contradicts the website on two fields** — website (`audesigns.co` vs `skyboundscaling.com`) and founding year (2024 vs 2025). A system that retrieves both is being shown a conflict, which is a reason to trust neither and to fall back to the better-corroborated namesake.

This is the crux: **an inconsistent LinkedIn page can make AI retrieval worse, not better.** The page in its current state is not a neutral asset. Correcting it is not polish; it is the difference between the page helping and hurting.

### Citation availability — REAL
When these systems answer, they cite retrievable URLs. A correct LinkedIn page is a citable source for "Skybound Scaling is a marketing services company founded by Ahmad Khalid, website skyboundscaling.com". Today there is essentially nothing citable about this entity that is not the company's own website.

## What is explicitly NOT claimed

- ❌ **Not** that a LinkedIn page enters any model's training data. Training-set composition is not public, and LinkedIn actively restricts automated access — the founder profile returns HTTP 999 to every automated request, which is a signal *against* casual bulk ingestion, not for it.
- ❌ **Not** that this improves rankings or citation rates in ChatGPT, Gemini, Claude, or any other system. No such guarantee is available from anyone.
- ❌ **Not** that LinkedIn is a Google Knowledge Graph input. That relationship is not publicly documented.
- ❌ **Not** that any model "knows" the company now. Models do not update on profile edits.
- ❌ **Not** that the retrieval tests above will start passing. One corrected profile against a contested name is unlikely to flip them alone.

## Realistic expectation
The correct mental model is **eligibility, not ranking**.

An answer engine cannot cite a source that does not exist, and will not trust facts asserted by only one party — least of all when that party's own profiles disagree with each other. Finishing LinkedIn does not make the entity retrievable. It makes it *eligible* to be retrieved correctly, and it removes a contradiction that currently pushes in the wrong direction.

The retrieval tests in `11-ai-and-search-retrieval-baseline.md` should be re-run after the manual actions are complete and again after independent sources exist. **Expect no change from this step alone.** The measurable movement should come when sources that are not owned by the company begin describing it — which is precisely why the client-credit and directory work in `19-priority-action-plan.md` outranks everything else that remains.

## One asymmetry worth noting
Of everything in the Step 3 backlog, this step is unusual: it is the only one where the company already *has* the asset and simply has not finished it. Outreach requires other people to say yes. Directories require review and approval. Correcting four fields on a page you already control requires nobody's permission — and it is currently the only external source that exists, which makes its accuracy disproportionately important.
