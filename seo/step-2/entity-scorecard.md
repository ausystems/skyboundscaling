# Entity Authority Scorecard — 2026-08-19 baseline
Scores are deliberately conservative; evidence beats optimism. "After deploy" notes assume the already-committed Step 1+2 code ships.

| # | Dimension | Score | Evidence | What raises it |
|---|---|---|---|---|
| 1 | Website identity clarity | 72/100 | Strong titles/meta/copy; category explicit; founder now in schema but still invisible in page copy | Visible founder section on About; keep descriptions consistent |
| 2 | Indexability | 40/100 | Code fully fixed and validated locally, but **production still serves pre-fix canonicals**; index shows zero pages | Deploy; submit sitemap in GSC + Bing; expect 85+ once pages index |
| 3 | Organization structured data | 90/100 | #organization/#website/#webpage graph on all 105 pages; founder Person added; dead sameAs purged | Nothing urgent; extend Person schema when founder pages exist |
| 4 | Social profile consistency | 30/100 | 1 of 4 claimed profiles actually existed (IG, correct name+link); 3 were 404s (now removed from site) | Create LinkedIn (company+personal), enrich both IG bios, optionally X |
| 5 | Founder association | 20/100 | Site never names "Ahmad Khalid" visibly; his IG tags company w/o role or link; zero external connection | IG bio fix (2 min), LinkedIn role, About mention, first interview |
| 6 | External mentions | 4/100 | Zero found beyond own profiles | Client credits, directories, first editorial |
| 7 | Referring domains | 4/100 | Only the (nofollow, unindexed) IG bio link; full crawl EVIDENCE INSUFFICIENT w/o paid index | Client credits + profiles + directories |
| 8 | Independent editorial | 0/100 | None exists | Source-request quotes, podcast, local business media |
| 9 | Business directory presence | 0/100 | Crunchbase/Clutch/GBP/BBB/OpenCorporates: nothing | Crunchbase + Clutch + GBP (the three that matter) |
| 10 | Client corroboration | 12/100 | 7 real clients; 3 on-site testimonials prove warm relationships; 0 reciprocal public mentions | 2-3 footer credits + consented case features |
| 11 | Brand search demand | 5/100 | No measurable branded demand (new brand; no data source here) | Grows with visibility; monitor in GSC |
| 12 | Entity disambiguation | 10/100 | Exact phrase pre-owned by Transformers fan content; 6+ same-industry near-namesakes outrank the brand | Consistent 5-part identity formula everywhere; corroborators |
| 13 | Search-engine recognition | 5/100 | Absent from every branded query tested, incl. exact-match | Fix 2, then 4/6/9 |
| 14 | AI retrieval presence | 5/100 | Retrieval returns wrong entities; auditing model confirms zero pretraining knowledge | Same as 13 — indexed + corroborated sources are the only path |
| 15 | Source diversity | 5/100 | One source type exists (own properties) | Each new class: professional network, database, directory, client, editorial |

**Weighted reality check:** the on-site machine-readable layer (3) is now ahead of everything external (4-15). The constraint is no longer what the site says — it is that almost nobody independent says anything, and the index cannot yet see the site itself.
