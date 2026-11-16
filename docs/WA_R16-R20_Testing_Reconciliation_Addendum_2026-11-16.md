# Wonderful Apps — Proposed R16–R20 Testing Reconciliation Addendum

**Prepared:** November 16, 2026  
**Status:** PROPOSED — owner review required; not an amendment to the authoritative test plan or accepted evidence  
**Project scope:** `reviseLogIn`; latest owner-confirmed local/remote-tracking HEAD `67626270f8c22e363ded83feea49d3855fd447b1`; Render Stage 6 test deployment displayed Live for `6762627` at 3:17 PM November 16  
**Change control:** No existing WA project source, Google Drive, GitHub, Render service, database, formal testing register or previous evidence was changed. No new application test was performed.

## 1. Purpose and controlling sources

This document reconciles the completed 63-page *targeted shared-function examinations* with the still-open R16–R20 Stage 6 acceptance gates, without changing prior outcomes. The 63 pages comprise five original independent examinations (49 independently discovered candidates, nine functional source-level confirmed occurrences) and 58 pages across Batches 1–7 (467 candidates, 115 confirmed occurrences). The combined 124 are **page-level functional finding occurrences**, not 124 unique defects, executed failures, or owner-approved new issue IDs.

The source of the 124 findings is `WA_Cross_Batch_Proposed_Finding_Map.csv` (128 total rows: 124 functional occurrences, one distinct existing BinForm full-scope formatting finding, three procedure/provenance exceptions). The cross-batch narrative and per-file Codex reports provide preserved source anchors and limitations. Original candidate counts total 516 (49 + 467), with remaining unconfirmed/partial/unverified requirements retained in their individual matrices. The proposed XLSX Master Findings Register preserves all 128 rows in separate sheets.

**Controlling dated acceptance sources:** `docs/WA_Stage6_R16-R20_Continuation_Handoff_2026-11-15.md`, `docs/Stage6_OpenItems.md`, `docs/Stage6_Render_TestPlan.md`, and `docs/WA_Standards_Compliance_Register.md`. The November 15 handoff and later bounded evidence supersede older R16 progress descriptions where specifically stated; they do not supersede the complete formal acceptance criteria. Core Standards v1.0, Detailed Technical Standards v0.4.1 with approved 3A–3C, D01–D14, README §0, and AI instructions remain applicable. Historical DRAFT filenames do not negate the November 12 approvals.

### Evidence boundaries

- A Codex *source-confirmed* nonconformance documents a code-path concern; it is not proof of an event on deployed hosts, a live attack, or a passing/failed browser test.
- Tests marked **NOT RUN** in this addendum are proposed only. No new R16–R20 PASS/FAIL/Closed/Deferred decision is allocated here.
- The old reviewed source HEAD was `1bc93d86...`; the newly committed and deployed `6762627` must be compared for actual application source/asset identity before the next browser acceptance. Matching local/remote commit hashes does not establish Google Drive byte equivalence.
- Work against test accounts and synthetic fixtures only, with owner-approved authorization. Never repeat uncertain POST/PUT/PATCH/DELETE automatically.

## 2. Accepted evidence — preserve without retesting

| Evidence | Preserved bounded conclusion | Limit |
|---|---|---|
| R10 / R14 / R15 | Previously accepted bounded hosted/browser results | Their acceptance does not close remaining R16–R20 or S6 security issues. |
| R16-75 T12 | **90/90 bounded offline PASS**, November 15 | No browser T09/T10 closure, no production release. |
| R16-75 T10 offline | 11/11 isolated simulation checks; earlier 47/47 suite cited by handoff | Simulated form-like data, **not** real unsaved editing behavior. |
| R16-75 T06 hosted | **3/3** parser/error probes (malformed JSON 400, URL-encoded size 413, incomplete multipart 500) | Scoped routes and outcomes only. Do not rerun absent demonstrated regression. |
| R16-75 T11 | Selected hosted log results and bounded offline checks | Not full sensitive-log inventory. |
| Historical S6-002 / S6-037 | Selected closed/accepted results in current dated register | No new closure by this work. |

The current formal status from the November 15 handoff is: **R16 IN PROGRESS; R17 OPEN; R18 PARTIAL; R19 PARTIAL; R20 PARTIAL**. Treat older register rows as dated snapshots where the November 15 handoff gives a narrower, newer result.

## 3. R16 — authentication, errors, privacy, and uncertain mutations

### R16-75 T09 — first real-browser acceptance requirement (OPEN)

**Objective:** From a page actually calling `WA.api.request` or `WA.api.json` for the operation under test, observe a readable user-facing error from flat/nested error responses, retaining status/code/context and appropriate session behavior. An imported shared script or shared telemetry call alone is not sufficient. The reviews identify `Weights.html` as a direct shared business API caller and `home.html` as a shared session-status consumer; select one non-destructive, low-risk scenario after verifying its actual client source and staged version. Check for no `[object Object]`, no accidental logout on 403 or 423, and no credential/body disclosure in diagnostics. **Result: NOT RUN.**

### R16-75 T10 — first real-browser unsaved-form acceptance requirement (OPEN)

**Objective:** On one authorized reversible/synthetic form, preserve entered drafts through a failed save or offline simulation, and demonstrate that reconnect does not silently resend an uncertain mutation. Observe HTTP methods and statuses without collecting credential strings or private data. A legacy local `apiFetch` page may yield a separately labelled page-only result, **not** shared-client T10 acceptance. **Result: NOT RUN.**

### Mandatory security decisions before release

1. **M03 `FTOneTreeMerge` derived private data (P0 proposed):** In a source-confirmed conditional path, `routes/familyTree.js` places private newer-person values into untagged conflict fields under a public older candidate. PersonID-based redaction removes the private person node while retaining that candidate's conflict values; the page renders them. Test only with synthetic public-older/private-newer records, checking both raw JSON and UI, and independently assess target-tree authority. No executed exploit or real private disclosure was observed. Owner must approve a correction/disposition and negative tests before release.
2. **FP03 `FTPrivacy.js` capability-origin/path scope (P1 proposed):** Previously identified permissive URL matching for forwarding `X-FT-Page-Token` requires an origin/path restriction assessment and synthetic negative tests. Do not claim actual external forwarding from merely importing an unused wrapper. Preserve user/person/tree/expiry/consumption binding and fail-closed 423 behavior.
3. **LG04/RG01 password-byte fidelity (P1 proposed):** Login and registration share an input-sanitizer interaction when password visibility changes to `type=text`; registration also calls `.trim()` on password and confirmation. A narrowly scoped correction must preserve exact entered bytes, including whitespace and Unicode, while retaining ordinary-text sanitation and backend credential protection. Never record real password bytes in evidence.
4. **Private page integrations:** Five focal-person access omissions, two duplicate-view context omissions and one multipart/parser-order context failure require scoped correction while maintaining the server's denial behavior. Missing access workflow is **not** an authorization bypass.

### Correctness/outcome decisions

- **CT06/P07 contact verification:** Contact data can commit before email delivery; an email failure may be returned as an ordinary save failure. Preserve committed state, truthfully report delivery outcome, and reconcile before any manual retry. Shared server producer should not be counted as separate backend roots for each consuming page.
- **CU03 ContactUs provider:** The mail helper may ignore a resolved Resend error object and report success, clearing a user's draft. This is distinct from contact **postcommit** delivery.
- **NP04 notification preferences:** A commit followed by an unsuccessful reread can create uncertain success feedback; no automatic retry should follow.
- **Error classification:** Keep 401/403/409/423/503, offline/cancel, non-JSON, 204 and nested/flat response shapes distinct. Mandatory corrections to individual adapters must not be deferred solely because a future common-helper migration is considered.
- **Session identity and telemetry:** Current-token use for requests and page-exit tracking, account-switch stale responses and print snapshot identity need targeted verification; no cross-account incident is proven by the static observations.
- **Weights W10:** Source review corroborates the pre-existing `.toISOString()` on a date-string concern; register S6-039 remains **open and expressly user-deferred**. Do not silently reverse deferral or test a destructive DELETE. Source provenance for S6-039/S6-041 must be reconciled to original full rows before altering statuses.

## 4. R17 — supported browser, device, keyboard and accessibility (OPEN)

Use the approved D07 browser/device coverage, including Windows Chrome, Edge, Firefox and DuckDuckGo; Safari on supported macOS/iOS/iPadOS; and Android Chrome as applicable. Record version, account/context, case ID, exact observed behavior, PASS/PARTIAL/FAIL and limitations. Test native focus order, record/table keyboard access, dialog labels and `aria-hidden`, error announcements, zoom, clipboard rejection, password SHOW/HIDE byte fidelity, date-only inputs, print/navigation, public verification links and subscription consent. The 46 functional **ACCESS** occurrences across 63 pages represent different controls/implementations, not a single shared-helper root.

No full R17 D07 acceptance was performed during the Codex examinations. **Result: OPEN / NOT RUN in this addendum.**

## 5. R18 — TNNA native acceptance (PARTIAL)

Preserve earlier accepted hosted TNNA API evidence. The 63-page HTML review does not test native Android device/offline lifecycle, or independently establish the native privacy/location commitments. Distinguish TownNotice's browser public-proxy coordinate behavior from any native-only local-location promise. Separate safe owner approval is necessary before native device work. **Result: PARTIAL / no new device testing.**

## 6. R19 — bounded asynchronous/concurrency and uncertainty (PARTIAL)

Proposed scoped synthetic scenarios: A→B account switch with delayed read/401/UI response; overlapping privacy capabilities bound to user/person/tree/expiry; single-use public email/privacy tokens with wrong/expired/reused/changed-recipient negatives; duplicate explicit actions/merge-undo; contact commit-plus-mail failure; promotion/consent committed state with failed reread; object-store upload before DB commit and compensation; no silent mutation replay. Separate real race observations from source risks. Avoid production, unbounded load, live private users or destructive stress. **Result: PARTIAL / no new execution.**

## 7. R20 — environment, version, rollback, independence (PARTIAL)

The owner showed a successful **Stage 6 test service** auto-deploy of `6762627` and a clean synchronized `reviseLogIn` local/remote-tracking HEAD. This is a staging identity fact, not functional acceptance or proof of all Drive files matching local/Git. Before browser testing: inspect actual loaded scripts/cache identity, document the post-commit source version, check `sw.js` precache reference to deleted `bday.html` for supported deployment behavior, and plan mixed-version update/reversal. Do not restore `bday.html`, alter SW or change production without separately approved scope. An independent design engineer/security review, full gate reconciliation, environment isolation and owner release approval remain mandatory. **Result: PARTIAL / no release authorization.**

## 8. Proposed next-step order (not an automatic authorization)

1. **Record owner acknowledgment of material M03, FP03 and password-byte risks**; determine safe disposition and no-release criteria. Static code correction is not authorized by the review.
2. **Resume existing Stage 6 priority:** read exact R16-75 T09/T10 prior results and verify loaded staging version; choose one non-destructive real-browser shared-client T09 scenario and execute only after owner approval; document result before T10.
3. **Plan individual scoped corrective packages** for confirmed mandatory issues. Any revised/new source must be complete and pretty-formatted, accompanied by independent original-to-final `.diff` and `.md` verification report per revised file, with manual owner installation. No bulk automatic migration.
4. **Reconcile S6-039/S6-041 original issue rows** and actual source/asset versions; distinguish owner-deferred, previously verified, and new unresolved items.
5. **Complete the remaining R16–R20 acceptance matrix** and final independent review before considering merge/main/production.

## 9. Evidence/procedure limitations retained

- Batch 6 usage interruption lost the original 974-file comparison baseline. The later 975-file resumed baseline and 37 earlier selected identity checks do **not** prove full preservation across the unobserved gap.
- Batch 6 `Weights` inventory freeze followed a limited historical register consultation, contrary to strict freeze-first order. Preserve the procedural exception; do not claim it was corrected by repeated review.
- Batch 7 began `terms.html` retrieval before `subscription.html` reporting fully ended; the exact terms discovery start and non-overlapping per-page time are unresolved. Preserve append-only supplement and original ZIP histories.
- Initial BinForm scope correction, Batch 4 FT01 corrected line references, historical timing anchors and Batch 3 additional ARIA subfinding remain distinct and count-neutral.
- No full independent source re-audit of all original 63 pages or all local, Drive and Git bytes was performed in this addendum. Existing and source-reported SHA checks retain their bounded scope.

## 10. Source reference index

- [Codex cross-batch 128-row finding proposal](https://drive.google.com/file/d/11QtRFEv9Ck6-7eok51YavOXGs32WQ5Ax/view)
- [Codex initial five / Batches 1–7 reconciliation](https://drive.google.com/file/d/1ZzWaiv8bCu4hH9H0QFop5XQO5rYg0vPe/view)
- [Codex overall package verification](https://drive.google.com/file/d/19E3kvuDyaWYKDKSoBOnHP06rCkvJW6Ux/view)
- [November 15 R16–R20 handoff](https://drive.google.com/file/d/1RFVkpAWh04V1QuhUd3hXPISTASc9hkAj/view)
- [Existing Stage 6 open-items register](https://drive.google.com/file/d/1pyw2COk7RH86dXlgDLtQo7sXqxPlFbPq/view)
- [Existing formal Stage 6 Render test plan](https://drive.google.com/file/d/1E46s2jsw65d29NN75IOAxIE5exZKVMAB/view)
- [Existing WA standards compliance register](https://drive.google.com/file/d/17ykGRkVsmrvKB4kXVd3Kh7r2DizS3zWa/view)

**STOP:** This is a proposed reconciliation/addendum only. No authoritative finding ID, issue severity, test result, standard, or production decision changes until the owner explicitly approves installation and next actions.
