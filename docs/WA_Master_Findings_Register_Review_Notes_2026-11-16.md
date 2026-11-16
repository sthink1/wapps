# Wonderful Apps — Master Findings Register: Review and Disposition Notes

**November 16, 2026 — PROPOSED / no source, register or testing-document edits**

## Executive reconciliation

| Scope | Pages | Independent functional candidates | Source-confirmed functional occurrences |
|---|---:|---:|---:|
| Five original independent examinations | 5 | 49 | 9 |
| Batches 1–7 | 58 | 467 | 115 |
| **Combined** | **63** | **516** | **124** |

The workbook's **Functional Findings** tab contains one row for each of the 124 source-confirmed candidate occurrences from the Codex cross-batch proposal. The **Other Evidence** tab contains four **nonfunctional-count** rows: one pre-existing BinForm full-scope formatting finding and three documented evidence/procedure exceptions. The workbook therefore preserves the entire 128-row cross-batch proposal **without asserting 128 unique software defects**. All 516 independently discovered candidate evaluations remain in the original individual matrices; the current register concentrates on confirmed findings, linking them back to source reports. It is not a replacement for the 516-row original inventory.

## Topic-level aggregation

| Broad topic | Functional occurrences | Qualification |
|---|---:|---|
| ERROR-OUTCOME | 48 | Distinct local adapters and caller contracts; not one universal bug |
| ACCESS | 46 | Different keyboard, focus, labeling and announcements |
| FT-ACCESS-FLOW | 8 | Five focal-person, two duplicate-context and one multipart-context occurrences |
| DRAFT-OUTCOME | 4 | Independent pending/draft/uncertain-outcome mechanisms |
| FT-HANDOFF | 3 | Shared `FTPrivacy.js` header-overwrite cause represented in three consumers |
| TEXT-DEFENSE | 3 | Ordinary text inputs only; excludes password/capability bytes |
| MAIL-AFTER-COMMIT | 2 | Shared contact producer, distinct page consumers |
| DATE-TYPE | 2 | Different date mismatch causes; existing Weights deferral retained |
| PASSWORD-BYTES | 2 | Shared visibility/sanitizer interaction plus registration trimming |
| Remaining six topics | 6 | DERIVED-PRIVATE, CAPABILITY-ORIGIN, TRACK-IDENTITY, CLIPBOARD-OUTCOME, EVENT-LIFECYCLE, PROVIDER-RESULT |
| **Total** | **124** | **Not 124 unique root causes** |

The 15 categories above are **canonical topic labels**, not 15 independently proven shared root defects. Before coding, a designated reviewer should assign canonical implementation-level root identities where common source/behavior is demonstrated, retain independently faulty local adapters, and decide whether any findings should be split or merged without altering original evidence keys.

## Release-critical proposed ordering

1. **P0 owner release disposition** — M03 `FTOneTreeMerge`: private newer-person conflict values can be attached to public older candidate fields and survive privacy redaction. No real exploit was executed.
2. **P1 mandatory security** — FP03 `FTPrivacy.js` origin/path capability forwarding; LG04 + RG01 login/registration exact password bytes. No external-token leak or account compromise was demonstrated.
3. **P1 mandatory correctness/security** — Missing private focal/context workflows, existing shared Family Tree handoff, contact commit-versus-email delivery truthfulness, `ContactUs` provider-result handling, Home tracking token freshness. Preserve server denial, no replay, and actual administrator dual-gate policy.
4. **P2 scoped compatibility and usability** — Real HTTP error categories, accessible controls/dialogs/status, draft pending, sanitation of ordinary text fields, date-specific corrections, clipboard outcome and repeated event handlers. `Weights` S6-039 remains deferred by owner; this register does not silently reauthorize correction.
5. **Separate modernization** — Potential consolidation of `waPlatform.js`, `usageTracking.js`, `inputSanitizer.js`, form/dialog helpers or D04/D08 phase migrations. The design is *not* authorized and cannot replace mandatory current defects without equivalent tests.

These P0–P2 labels are **recommendations for owner review**, not official WA classifications, accepted risk severities, or completed releases.

## Recorded preservation and limitations

- Staging and local Git are shown at `reviseLogIn` commit `6762627` based on the owner's shell output and Render screenshot. This does not independently certify byte equality with Google Drive.
- Accepted: R16 T12 **90/90 bounded offline PASS**, hosted T06 **3/3** and selected T11, plus prior R10/R14/R15 bounded acceptances. R16 T09/T10 actual real-browser acceptance remains open.
- Preserve Batch 6 interrupted baseline/unknown gap, Weights freeze sequence exception, Batch 7 subscription/terms overlap and prior scoped timing exceptions. They are not new functional gaps.
- The Codex mapping is proposed source interpretation. This register does not independently rerun the 63 examinations, browser actions, provider mail, API calls or DB transactions.
- Existing `Stage6_OpenItems.md` and formal test plan remain unchanged, including owner deferrals, unresolved S6-039/041 provenance, and release gates.

## Workbook tabs

`Read Me` — authority and limits. `Functional Findings` — 124 traceable candidate occurrences, source evidence, provisional priority and owner-decision column. `Other Evidence` — four count-neutral supporting items. `Topic Summary` — grouped counts. `R16-R20 Gate Matrix` — carried acceptance status and unclosed requirements. `Proposed Test Cases` — sixteen candidate scenarios, all **NOT RUN**. `Source Index` — links to the exact Drive evidence and formal handoff.

## Owner decisions needed before implementation

Confirm the proposed order, identify any explicitly accepted/deferred items, decide which findings need a common root implementation vs isolated page-level correction, and authorize each test or source-correction scope separately. Do not install this as an authoritative register until reviewed. If corrections are authorized, require complete revised files, separate original-to-final `.diff` and per-file verification `.md`, pretty formatting, user-controlled local installation, and independent review before release.
