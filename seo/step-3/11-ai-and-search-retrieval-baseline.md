# AI & Search Retrieval Baseline — 2026-08-19

## Methodology, and what it can and cannot show
Available: one US web-search backend (the class of index AI search products query) and this assistant's own model knowledge. **Not available:** scripted access to ChatGPT, Gemini, Perplexity, or Google/Bing SERPs directly. Results below are therefore **observations of one retrieval surface**, not measurements of any product's ranking algorithm. No claim here should be read as "X is an AI ranking factor."

## Tests run
| Platform | Query | Official site returned? | What returned instead | Correct entity? | Wrong entity? |
|---|---|---|---|---|---|
| Web search backend | "Skybound Scaling" digital marketing agency | **No** | Skybound Digital LLC, SkyBound Marketing (Raleigh), Skybound Socials, Skybound Media Management, SkyBound Strategies | No | Yes |
| Web search backend | skyboundscaling.com Skybound Scaling Toronto | **No** | **Skybound Realty Toronto**, Transformers scaling, Skybound Entertainment | No | Yes |
| Web search backend | "Ahmad Khalid" founder Skybound | **No** | Khalid Yassin (Skybound CX), unrelated Khalid Ahmads | No | Yes |
| Web search backend | Who founded Skybound Scaling | **No** | Skybound Entertainment (Kirkman/Alpert) | No | Yes |
| Web search backend | "Growth, engineered" + service string | **No** | Unrelated agencies with similar service mixes | No | Yes |
| Model knowledge (this assistant, cutoff May 2026) | internal | — | No knowledge of the agency | No | — |

## The five layers, separated as required
- **RETRIEVAL:** the official site was **not retrieved** for any brand query tested.
- **RANKING:** not applicable — nothing to rank.
- **ENTITY IDENTIFICATION:** **failed.** The systems confidently resolve the name — to Skybound Entertainment, Skybound Realty, or Transformers content.
- **CITATION:** none.
- **GENERATIVE ANSWER:** would state facts about the wrong entity.
- **MODEL KNOWLEDGE / PRETRAINING:** absent, consistent with a 2025 founding and a near-zero footprint.

## The important nuance about "indexed"
The owner reports GSC shows the sitemap processed, 105 pages discovered, homepage on Google. That is **not contradicted** by these results. Indexed and retrievable-for-a-query are different states: a page can be in the index yet never selected for a competitive query when stronger entities own the terms and the page has no external corroboration. **Do not read these findings as "the site is not indexed."** Read them as: *the site is not yet winning retrieval for its own brand name.*

## What would change these results
Not more on-site schema — that layer is already correct and live. What is missing is **independent documents that state the entity's identity**. Retrieval systems select and cite sources; today there are no third-party sources to select. The corroboration ladder in `13-entity-corroboration-ladder.md` is the mechanism.

**Re-run this exact test set after the LinkedIn page, GBP, and first client credits go live** — that is the measurable check on whether corroboration moves retrieval.
