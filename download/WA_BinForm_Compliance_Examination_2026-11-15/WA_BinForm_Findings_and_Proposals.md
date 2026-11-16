# Wonderful Apps — BinForm Findings and Corrective Proposals

Date: November 15, 2026. Primary file: `httpdocs/BinForm.html`.
Review-only assignment; **no revised application code is supplied or authorized**.
Current baseline: 48,862 bytes; SHA-256 `07898f5d291b1f296fe0f0aa85fe1f91c96815bb19782d0cbe98b8c8a28700a2`.
All evidence uses current local, one-based file line numbers. Dependency observations are not certifications.

## Disposition ledger

| ID | Disposition | Impact | Topic |
| --- | --- | --- | --- |
| BF-G01 | Confirmed Gap | Low | Readable whole-file formatting is not consistently met |
| BF-G02 | Confirmed Gap | Medium | Accessibility semantics contradict visible interaction state |
| BF-U01 | Unverified | High verification priority | Session restoration and failure-state UX remain unaccepted |
| BF-U02 | Unverified | High verification priority | Account-switch/logout and delayed-response identity binding |
| BF-U03 | Unverified | Medium data/UX verification priority | Ambiguous mutation outcomes, concurrent actions and partial-success feedback |
| BF-U04 | Unverified | Medium compatibility priority | PWA/mixed-version/browser and origin compatibility |
| BF-U05 | Unverified | Medium conditional security priority | Rendering, sanitizer availability and diagnostic confidentiality |
| BF-U06 | Unverified | High boundary/data verification priority | Server enforcement, schema, transactions and ancillary usage evidence |
| BF-L01 | Permitted Legacy | Tracked migration debt | Independent bearer adapter and persistent token compatibility |
| BF-C01 | Corrected in local source | Historical correction; acceptance open | Historical nested-error coercion correction is present |
| BF-D01 | Dependency discrepancy | Medium dependency/acceptance risk | Pre-existing working-tree deletion leaves a service-worker cache target absent |


There are **11 distinct records**: 2 Confirmed Gap, 6 Unverified, 1 Permitted Legacy, 1 Corrected in local source, and 1 Dependency discrepancy. These are examination-local identifiers, not new WA-CF/S6 register entries. No finding was closed or added to the project register. No approved exception was established. Candidate exceptions described below are possible owner decisions, not grants.

## Evidence and proposals

### BF-G01 — Readable whole-file formatting is not consistently met

- **Disposition / impact:** Confirmed Gap; Low.
- **Approved rules:** CS-07; WA-FORMAT-001; WA-PRESERVE-001.
- **Exact evidence:** httpdocs/BinForm.html:L14-L14; httpdocs/BinForm.html:L464-L470; httpdocs/BinForm.html:L593-L596; change/BinForm_Change_Verification.md:L19-L21.
- **Observed:** The sanitizer script indentation differs from sibling head elements; footer children/closing indentation is inconsistent; roundUpAmount is compacted as a complete one-line multi-branch function and escapeHtml begins out of the surrounding indentation. The historic parser verification acknowledges the whole-file formatting obligation but defers it without an evidenced approved exception.
- **Impact and confidence:** Readability/reviewability and compliance traceability. No functional defect or visual regression is established merely by indentation.
- **Why this is a gap:** Approved Core CS-07 and Detailed WA-FORMAT-001 require pretty, readable source and retain whole-file HTML formatting on edits. Existing TechSummary/CLAUDE whole-HTML rule remains applicable; the prior narrowly scoped parser edit does not itself waive it.

**Smallest proposed next scope:** After independent review and owner authorization, prepare one complete, pretty-formatted BinForm replacement under the existing whole-HTML rule; visibly separate formatting-only differences from any separately approved semantic correction. The smallest valid scope is the one HTML file with all required formatting differences reviewed, not an unapproved opportunistic refactor.

**Affected files/contracts:** httpdocs/BinForm.html only intended; preserve dependency order and public behavior. No shared source changes proposed.

**Preservation risks:** Whitespace-sensitive templates, visible text, DOM sequence, selectors/IDs, line-sensitive review references, embedded strings, (be) error priority, rounding and recurrence behavior must remain unchanged.

**Required verification:** Future, NOT RUN: full authoritative-original/final unified diff; per-file .md verification; exact hashes; syntax validation in isolation if authorized; representative layout/keyboard/business-regression checks. Every formatting hunk accounted for.

**Owner decision / exception:** Owner must approve actual correction scope after independent review. If deferral is chosen, obtain an explicit versioned exception with affected rule/file, reason, compensating review, owner and review trigger; no such exception is established here.

**Existing traceability:** WA-CF-001 preservation context; CS-01/07; no existing register ID added or closed.

### BF-G02 — Accessibility semantics contradict visible interaction state

- **Disposition / impact:** Confirmed Gap; Medium.
- **Approved rules:** CS-07; WA-FRONT-001.
- **Exact evidence:** httpdocs/BinForm.html:L333-L337; httpdocs/BinForm.html:L356-L390; httpdocs/BinForm.html:L398-L458; httpdocs/BinForm.html:L574-L585; httpdocs/BinForm.html:L709-L722; httpdocs/BinForm.html:L814-L833.
- **Observed:** Description modal starts aria-hidden=true and open/close handlers only add/remove class show; its visible state never updates aria-hidden. By contrast Frequency modal explicitly updates it. Record rows expose click-only edit listeners without focus/key activation. X close controls are spans without focus/keyboard semantics (Cancel buttons do provide another close action). Active/Estimated and frequency-date labels lack explicit control association; visually separate header table is aria-hidden and body table has no own header. Message regions have no live-region role; dialogs have no explicit dialog role, labelled-by, focus placement/trap/return or Escape handler.
- **Impact and confidence:** Confirmed static semantic/interaction support gap; visible Description controls remain marked hidden to accessibility APIs. Keyboard row activation and robust accessible control names/headers/focus/message feedback are not implemented in the inspected source. Exact browser/assistive-technology user impact is not tested.
- **Why this is a gap:** WA-FRONT-001/CS-07 require applicable keyboard navigation, focus and error announcements with preserved frontend behavior. A visible dialog must not be statically declared hidden; loading sanitizer/shared transport does not repair these semantics.

**Smallest proposed next scope:** After review/approval, prepare bounded semantic and keyboard corrections in BinForm: synchronize Description hidden state, provide keyboard-operable record and close actions, associated labels/headers/dialog names, appropriate focus return and messages. Keep the current visual design and non-keyboard actions. Combine with required whole-HTML formatting only as separately mapped/reviewed differences.

**Affected files/contracts:** Primary BinForm markup and event handlers. Inspect wa-buttons.css for changed control element styling before proposing any CSS edit; no dependency change is currently authorized.

**Preservation risks:** Do not rename IDs, alter data actions, replace UI design, remove click behavior or change recurrence/save semantics. Native button conversion may inherit raised styling and requires visual review.

**Required verification:** Future, NOT RUN: keyboard-only select/edit/cancel/close/submit; accessibility-tree visible-dialog checks; labels/table-header relationships; initial/return focus, background reachability, Escape policy and error announcements; D07 representative browsers and unchanged visual layout.

**Owner decision / exception:** Owner approval of exact keyboard/focus interaction contract is required before correction. An exception, if requested, must be explicit and bounded; there is no approved accessibility waiver in the examined records.

**Existing traceability:** CS-07; source-local finding for independent review; not a claim of existing staged accessibility test failure.

### BF-U01 — Session restoration and failure-state UX remain unaccepted

- **Disposition / impact:** Unverified; High verification priority.
- **Approved rules:** CS-03/05; WA-AUTH-001; WA-SESSION-001; WA-API-002.
- **Exact evidence:** httpdocs/BinForm.html:L480-L513; httpdocs/BinForm.html:L1101-L1122; httpdocs/js/usageTracking.js:L84-L98; httpdocs/js/waPlatform.js:L100-L143.
- **Observed:** requireLogin only checks token presence; business requests send current storage token and present generic parsed errors. The page listener is registered before the tracker listener; async listeners do not establish a shared awaited restore barrier. Cookie-only remembered state can follow the redirect branch before page-owned recovery; expired-token business requests can race tracker refresh.
- **Impact and confidence:** Potential lost continuation/confusing 401/403/503/offline UX and unsaved-form risk, not a demonstrated authorization bypass. Direct legacy fetch is explicitly permitted migration debt.

**Smallest proposed next scope:** First obtain browser evidence for missing/expired/revoked token, cookie-only remembered restoration, forbidden entitlement, outages and unsaved fields. If needed, propose a compatible page adapter or explicit awaited recovery contract; do not replace every fetch or change browser token storage under this assignment.

**Affected files/contracts:** BinForm business adapter/initialization; WA facade/tracker contracts contextual only.

**Preservation risks:** Keep error-priority and terminal (be) removal, raw versus parsed Response ownership, localhost fallback, domain fields and no POST/PUT/DELETE replay.

**Required verification:** NOT RUN: real browser T09/T10-equivalent cases on this adapter plus HTTP denials; retain prior R10/R14/R15 evidence without broad reopening.

**Owner decision / exception:** Review first; owner selects migration/correction scope. D08 architecture is unresolved and not authorized here.

**Existing traceability:** WA-CF-001; S6-005/008/018/033; BF-L01.

### BF-U02 — Account-switch/logout and delayed-response identity binding

- **Disposition / impact:** Unverified; High verification priority.
- **Approved rules:** CS-03/09; WA-SESSION-001; WA-AUTH-001; WA-PRIV-001.
- **Exact evidence:** httpdocs/BinForm.html:L480-L513; httpdocs/BinForm.html:L523-L523; httpdocs/BinForm.html:L612-L635; httpdocs/BinForm.html:L666-L699.
- **Observed:** selectedId/form state are page-local while each send reads the then-current token. No storage/account-change listener, response identity check, abort/generation guard or private DOM clearing is present in the page. Old reads may resolve after another account becomes current; a later save can use a replacement token with a still-selected per-user ID.
- **Impact and confidence:** Potential display of stale private data or writing old form contents to another same-browser account record with the same per-user ID. Backend UserID ownership remains; no cross-user authorization bypass or actual corrupted record is claimed.

**Smallest proposed next scope:** Use synthetic two-account fixtures to establish behavior; only then design stale-response rejection and explicit safe handling of retained forms on identity changes. Do not silently clear unsaved input or introduce a blanket automatic retry.

**Affected files/contracts:** BinForm selection/form initialization/read/save lifecycle; shared session contract only if separately approved.

**Preservation risks:** Balance identity isolation with unsaved-value retention and current navigation; owner must approve any clearing/prompt behavior.

**Required verification:** NOT RUN: two tabs, account A->B, logout with pending GET/save, delayed old response, same UserInID across fixtures, old-form/new-token mutation and private DOM visibility.

**Owner decision / exception:** Owner must select identity-change/unsaved-form UX after evidence and independent review.

**Existing traceability:** S6-007/018/027/028; WA-CF-001; BF-L01.

### BF-U03 — Ambiguous mutation outcomes, concurrent actions and partial-success feedback

- **Disposition / impact:** Unverified; Medium data/UX verification priority.
- **Approved rules:** CS-01/06; WA-SESSION-001; WA-DATA-001; WA-FRONT-001.
- **Exact evidence:** httpdocs/BinForm.html:L493-L513; httpdocs/BinForm.html:L542-L563; httpdocs/BinForm.html:L638-L685; httpdocs/BinForm.html:L723-L741.
- **Observed:** No in-flight disable/guard for Save/Add Description. Non-JSON success returns null from apiFetch and success callers expect result.message. Save shows success then resetForm clears message; description reload catches internally, so its caller can close the modal despite a failed reload. HTTP-error catches do not themselves reset the main form.
- **Impact and confidence:** Potential duplicate user-triggered creates, uncertain committed outcome after lost/malformed response, or transient/misleading feedback. The source does not automatically replay requests; double user activation is not equivalent to a proved automatic-replay violation.

**Smallest proposed next scope:** First reproduce with fake/synthetic fixtures under later authorization; propose the minimum pending-state/uncertain-outcome/reconciliation and feedback adjustments only if accepted. Do not add automatic resend or change database/idempotency contracts without separate scope.

**Affected files/contracts:** BinForm save/delete/description handlers; backend idempotency or schema changes are not currently proposed.

**Preservation risks:** Current Amount ceil behavior is deliberate in both client/server and must remain. Successful reset/navigation semantics and (be) display require owner-approved UX decisions if altered.

**Required verification:** NOT RUN: slow/double activation, timeout-after-commit, non-JSON/204 success, 400/401/403/500/503 rejection, reload failure after successful create, exact before/after field/selection/recurrence/message state and DB row counts.

**Owner decision / exception:** Owner approves any pending-state, success feedback, idempotency or uncertain-delivery UX changes; these are not automatically mandatory corrections from preference alone.

**Existing traceability:** S6-008/018/025; WA-CF-001; R15-22–27 bounded evidence remains intact.

### BF-U04 — PWA/mixed-version/browser and origin compatibility

- **Disposition / impact:** Unverified; Medium compatibility priority.
- **Approved rules:** CS-10; WA-CACHE-001; WA-ENV-001.
- **Exact evidence:** httpdocs/BinForm.html:L475-L478; httpdocs/BinForm.html:L515-L520; httpdocs/BinForm.html:L1121-L1122; httpdocs/sw.js:L107-L158; server.js:L68-L82; server.js:L143-L168.
- **Observed:** Page and auth facade are network-first SW resources; other shared scripts/styles are not all precache members. HTML has no-cache, ordinary static resources maxAge1d; waPlatform URL unversioned, tracker/sanitizer versioned. localhost fallback may be cross-origin while WA facade insists same origin.
- **Impact and confidence:** Potential script/cache/origin skew, not a demonstrated stale-client failure or new cache data leak. Current headers/offline/install behavior untested.

**Smallest proposed next scope:** Reconcile intended origin and deployed version set, then schedule targeted supported-browser/SW update/offline/rollback checks. Any versioning or hosting fix is separately approved.

**Affected files/contracts:** BinForm; sw.js/server/cache/shared script deployment contracts only as separately scoped dependencies.

**Preservation risks:** Do not unilaterally disable offline support or change caching/publication in a page review.

**Required verification:** NOT RUN: D07 matrix, Apple/PWA where applicable, unsupported Locks recovery, offline/restart, stale assets, SW install/update and actual success/error no-store headers.

**Owner decision / exception:** Owner selects browser/environment and later test authorization; separate missing cache-member decision BF-D01.

**Existing traceability:** WA-CF-015; S6-024/026/036; BF-D01.

### BF-U05 — Rendering, sanitizer availability and diagnostic confidentiality

- **Disposition / impact:** Unverified; Medium conditional security priority.
- **Approved rules:** CS-07/09; WA-FRONT-001; WA-LOG-001; WA-ERROR-001.
- **Exact evidence:** httpdocs/BinForm.html:L13-L14; httpdocs/BinForm.html:L517-L518; httpdocs/BinForm.html:L574-L595; httpdocs/BinForm.html:L1069-L1073; httpdocs/js/inputSanitizer.js:L24-L33; dbConnection.js:L37-L39; routes/budget.js:L93-L106; routes/budget.js:L215-L225.
- **Observed:** Names/descriptions are escaped and error messages use textContent. Date fields/preview arrays enter innerHTML without separate escaping, but inspected backend uses validated ISO dates/DATE strings and generated toIso results. DOMPurify CDN is required; sanitizer falls back to original text if missing. Page logs a raw service-worker registration error.
- **Impact and confidence:** Response-type invariants/CDN availability/Console confidentiality require verification. This is not a confirmed XSS or secret disclosure; every innerHTML use is not automatically unsafe, and constant-generated templates were distinguished.

**Smallest proposed next scope:** Validate date/response invariants and DOMPurify presence before proposing defensive rendering or sanitized diagnostics. Consider text-node date rendering only in a separately reviewed preservation-safe change. No opportunistic CSP/SRI/token-storage redesign.

**Affected files/contracts:** BinForm, existing sanitizer and response producers only as needed after evidence; dependencies not certified.

**Preservation risks:** Keep plain-text user rendering, password exclusion in shared sanitizer, expected error messages, date-only semantics and existing recurrence preview appearance.

**Required verification:** NOT RUN: malformed response/type cases, expected ISO dates, literal markup in free text/errors, CDN blocked scenario, synthetic secret marker absent from DOM/Console/log evidence.

**Owner decision / exception:** Owner chooses any additional hardening or shared-helper change after independent review.

**Existing traceability:** S6-028/030/033/041; BF-C01; D08 staged design objective only.

### BF-U06 — Server enforcement, schema, transactions and ancillary usage evidence

- **Disposition / impact:** Unverified; High boundary/data verification priority.
- **Approved rules:** CS-04/06; WA-API-001; WA-DATA-001; WA-ENV-001.
- **Exact evidence:** server.js:L143-L168; middleware/subscriptionAccess.js:L4-L30; routes/budget.js:L398-L529; routes/budget.js:L905-L923; middleware/usageActivity.js:L19-L50; utils.js:L38-L50.
- **Observed:** Current guards/SQL bind authenticated UserID; data mutations use recurrence transactions except standalone description insert/sequence helper. Preview is compute-only for Budget state but POST is counted as RECORD_CREATE by generic usage middleware. Local budgetExpected marker differs from central WeakSet producer classification.
- **Impact and confidence:** Actual denial/no-write/rollback/rows/schema/concurrency and telemetry meaning remain unverified. These are dependency review topics, not newly certified backend defects attributable to BinForm.

**Smallest proposed next scope:** Use per-operation matrix to define owner-controlled negative and data-integrity cases; separate routes/budget, usageActivity, allocation/transaction and error-provenance examination if needed. Do not remove apparently duplicated auth without a reviewed contract.

**Affected files/contracts:** Budget/auth/subscription/DB utilities/telemetry dependencies; no full-file backend certification or correction authorized.

**Preservation risks:** Keep ownership, global/system description availability, schema compatibility, UTC/date-only values, Amount ceil and permitted public/native separation.

**Required verification:** NOT RUN: no/expired/wrong-client token, denied subscription, cross-user UserInID, admin entitlement without ownership bypass, validation, recurrence children, duplicate descriptions, rollback/concurrency, bounded preview resource use and exact telemetry.

**Owner decision / exception:** Any database/service/test or backend correction needs separate explicit scope and environment authorization.

**Existing traceability:** S6-009/019/031/033; WA-CF-009/016; D03; BF-U03.

### BF-L01 — Independent bearer adapter and persistent token compatibility

- **Disposition / impact:** Permitted Legacy; Tracked migration debt.
- **Approved rules:** CS-03/08; WA-AUTH-001; WA-SESSION-001; WA-SHARED-001.
- **Exact evidence:** httpdocs/BinForm.html:L475-L513; httpdocs/BinForm.html:L1121-L1122; httpdocs/js/usageTracking.js:L25-L58; httpdocs/js/waPlatform.js:L119-L143.
- **Observed:** Business API calls use apiFetch, not WA.api. Tracker uses shared APIs after WA load. Token storage remains localStorage compatibility. Legacy fetch is expressly permitted by the approved standards; D08 selects an objective, not a replacement architecture.
- **Impact and confidence:** Migration/verification debt with risks documented separately; not automatically a vulnerability, standards failure or approved long-term exception.

**Smallest proposed next scope:** If owner later approves migration, propose a narrow adapter preserving raw/parsed response contract, legacy error priority, terminal (be) handling, current body/headers, localhost choice, field retention and no uncertain mutation replay. Shared APIs may safely coexist in the meantime under the documented legacy scope.

**Affected files/contracts:** BinForm only intended; avoid global fetch patch or shared-library rewrite.

**Preservation risks:** WA.api.request returns Response and WA.api.json returns parsed payload; direct substitution is not contract-equivalent. Shared parser prioritizes top-level message before error while local page does the reverse.

**Required verification:** Future representative adapter/browser failures and targeted regression if approved; no evidence from script loading alone.

**Owner decision / exception:** No new exception is approved by this report; any lasting variance from mandatory safety invariants needs explicit owner exception. No token storage design selected.

**Existing traceability:** WA-CF-001; S6-005/008/018/033; D08; BF-U01/BF-U02.

### BF-C01 — Historical nested-error coercion correction is present

- **Disposition / impact:** Corrected in local source; Historical correction; acceptance open.
- **Approved rules:** CS-01/05; WA-API-002; WA-REVIEW-001.
- **Exact evidence:** httpdocs/BinForm.html:L493-L513; change/BinForm.original-to-final.diff:L1-L16; change/BinForm_Change_Verification.md:L9-L25; change/WA_CF_001_Offline_Test_Results.txt:L1-L8; docs/WA_Standards_Compliance_Register.md:L168-L180.
- **Observed:** Current 48,862-byte SHA-256 equals recorded proposed final and Git blob at 2a92b2f. Reversing only documented parser hunk in memory reconstructs 48,607 bytes with recorded original hash. The local code has typed flat/nested/top-level fallback; old ambiguous error-object coercion is absent.
- **Impact and confidence:** Historical parser defect should not be reported as still present in current local source. Existing 7/7 isolated result is documentary evidence only; no current test/hosted/Drive certification.

**Smallest proposed next scope:** Retain installed parser behavior and prior evidence. Review browser acceptance and stale register/correction labels separately; no fresh parser rewrite proposed.

**Affected files/contracts:** BinForm; existing verification/register/handoff history referenced but never edited.

**Preservation risks:** Existing (be) suffix convention remains; no success response changes or broad error-envelope migration.

**Required verification:** Current source identity comparison and reverse-hunk reconstruction are static checks performed; application tests NOT RUN. Independent current browser flat/nested/failure evidence still needed.

**Owner decision / exception:** Owner/independent review reconciles provenance and later status updates. Do not close WA-CF-001/S6-005 from this correction.

**Existing traceability:** WA-CF-001; S6-005/008/018/033; historical 2a92b2f; T09/T10 distinction.

### BF-D01 — Pre-existing working-tree deletion leaves a service-worker cache target absent

- **Disposition / impact:** Dependency discrepancy; Medium dependency/acceptance risk.
- **Approved rules:** CS-02/10; WA-CACHE-001; WA-ENV-001.
- **Exact evidence:** httpdocs/sw.js:L16-L16; httpdocs/sw.js:L62-L62; httpdocs/sw.js:L107-L111; docs/WA_Wave0_Reconciliation.md:L40-L62.
- **Observed:** At examination start Git status already had D httpdocs/bday.html and D httpdocs/images/logo.png. The current SW URLs include /bday.html and install uses cache.addAll. This differs from the historical clean Wave 0 tree. BinForm source and named dependencies match the Wave 0 hashes compared.
- **Impact and confidence:** Confirmed local missing precache member, with possible install/update consequences if equivalent hosted deletion exists. No network request, service-worker install or hosted-state claim. logo.png is unrelated to primary page and is recorded only as pre-existing baseline context.

**Smallest proposed next scope:** Owner decides whether deletion is intended and later reconciles the SW dependency in a separately approved review. Do not restore, delete more files or rewrite Wave 0 snapshots here.

**Affected files/contracts:** sw.js/bday.html dependency outside primary correction scope; no change proposed in this package.

**Preservation risks:** Preserve current working-tree changes and historical Wave 0 evidence; no assumption that remote deployment has same missing file.

**Required verification:** Static path/reference and start-status observations performed; current hosted cache.addAll/install outcomes NOT RUN.

**Owner decision / exception:** Owner must resolve intended source/deployment cache set before later PWA acceptance.

**Existing traceability:** S6-024; WA-CF-015; BF-U04.

## Review and correction sequence

1. Independent review accepts, rejects or narrows these findings, including the Detailed Standards count discrepancy recorded in Report A. Reconcile current Drive/hosted identity before preparing any replacement.
2. Resolve the pre-existing missing precache member separately; do not silently repair another primary file during a BinForm correction.
3. Review BF-G02 accessibility semantics and BF-G01 required whole-file formatting. A future approved package must preserve current visuals and map semantic versus formatting-only hunks separately. No code is produced in this examination.
4. Obtain authorized evidence for BF-U01/BF-U02 identity/recovery and BF-U03 uncertain mutations before choosing transport or UX changes. Direct fetch remains permitted migration debt.
5. Define narrowly scoped validation for BF-U04–U06 and preserve accepted R10/R14/R15/R16 results. Run only affected assertions after explicit authorization; no testing is authorized by this document.
6. If the owner later approves a correction, deliver the complete replacement at its intended project-relative installation path, original-to-final .diff, standalone .md verification, exact original/final hashes, callers, risks, tests and rollback. Do not bundle unrelated shared-module, database, token-architecture, public-service or deployment changes.

## Scope and certification limits

No source, dependency, UI, schema, service, cache, register, deployment or installed device was changed. No application, tests, build, installer, DB operation, hosted probe or CDN request was executed. Static source observations and historical documentary PASS results are distinct. This package is submitted for independent review only; it does not certify BinForm compliant, approve an exception, close WA-CF-001/S6 items or authorize implementation.
