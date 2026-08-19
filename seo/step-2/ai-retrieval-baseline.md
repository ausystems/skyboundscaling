# AI / LLM Retrieval Baseline
Research date: 2026-08-19

## Framework: six different things that get conflated
1. **Search retrieval** — does a retrieval system fetch any page about the entity for the query?
2. **Ranking** — does that page beat other candidates?
3. **Citation** — does the AI answer cite it?
4. **Entity identification** — does the system resolve "Skybound Scaling" to one specific organization?
5. **Model knowledge** — does the model know the entity without browsing?
6. **Pretraining presence** — was the entity in training corpora (upstream cause of 5)?

## Tests performed here (honest scope)
Available in this environment: the live web-search retrieval layer (the same class of index AI search products query) and one frontier model's internal knowledge (the assistant performing this audit). Not available: scripted querying of ChatGPT/Gemini/Perplexity products. Their answers are expected to track the retrieval evidence below because, for unknown entities, product answers are retrieval-grounded; treat that as an inference, not a measurement.

| Probe | Result |
|---|---|
| Retrieval: "What is Skybound Scaling?" | Returns Transformers/Skybound-comics power-scaling content and Skybound Entertainment pages. The agency does not appear. A grounded AI answer would describe comic-fan character scaling. **Wrong entity surfaced: YES.** |
| Retrieval: "Who is Skybound Scaling?" / brand+founder joint query | No page connecting the two exists in the index; answer would be "no clear entity" or a wrong Skybound/Khalid. |
| Retrieval: domain-restricted | Zero pages of skyboundscaling.com retrievable — the official source cannot be cited even when directly relevant. |
| Model knowledge (Claude, knowledge cutoff May 2026, tested directly by the auditing model itself) | **No pretraining knowledge of "Skybound Scaling" the agency exists in this model.** Founded 2025 with near-zero web footprint — consistent with absence from training corpora. Skybound Entertainment, by contrast, is deeply known. |
| llms.txt / llms-full.txt | Present and well-formed on the site (good), but AI crawlers only benefit once they fetch the site at all; no evidence of external discovery paths pointing crawlers there. |

## Why "What is Skybound Scaling?" fails today (layer by layer)
A. Indexed: **NO** (site pages absent) → B. Retrieved: **NO** → C. Ranked: moot → D. Entity-identified: **NO** (no corroborating records anywhere) → E. Cited: **NO** → F. In training data: **NO** (post-cutoff, footprint too small).
Every layer fails, and the earliest failing layer (A) is the one the company fully controls.

## What Skybound Scaling can influence, in order of control
1. **A/B (index & retrieval):** deploy the committed canonical fix; submit sitemap in Google Search Console + Bing Webmaster Tools; keep robots/llms files as-is. Fully controllable.
2. **D (entity identification):** consistent Organization/founder schema (done on-site this step) + creation of the missing corroborators (LinkedIn page, GBP, Crunchbase, Clutch, client credits) using one identical identity block. Highly influenceable.
3. **C/E (rank & citation):** driven by independent mentions and topical authority; influenceable over months via legitimate corroboration and content, never guaranteed.
4. **F (training data):** not directly controllable; broad, durable public presence raises the odds in future model refreshes. No tactic guarantees inclusion in any AI product — treat all such promises as false.
