# Wonderful Apps — BinForm Findings and Corrective Proposals

**Revision 2 — owner clarification applied November 15, 2026.** Complete new review artifact; no application code revision.
Source: httpdocs/BinForm.html, 48,862 bytes, SHA-256 `07898f5d291b1f296fe0f0aa85fe1f91c96815bb19782d0cbe98b8c8a28700a2`.

## Governing assessment rule

Every applicable approved requirement applies to current code regardless of age/history. Approved phased migration and design/implementation deferral are recorded as outstanding work, not completed compliance. Expressly authorized exceptions require actual owner authority; none is established for BinForm. Preservation of functionality/appearance governs every proposed correction but provides no implied waiver. Earlier examination artifacts remain unchanged; this report supersedes their broad legacy disposition.

## Disposition ledger

| ID | Disposition | Impact | Implementation obligation | Topic |
| --- | --- | --- | --- | --- |
| BF-G01 | Confirmed Gap | Low | Required correction; NOT PREPARED / NOT AUTHORIZED FOR INSTALLATION | Readable whole-file formatting is not consistently met |
| BF-G02 | Confirmed Gap | Medium | Required correction; NOT PREPARED / NOT AUTHORIZED FOR INSTALLATION | Accessibility semantics contradict visible interaction state |
| BF-G03 | Confirmed Gap | Medium; session/error contract | Required correction; NOT PREPARED / NOT AUTHORIZED FOR INSTALLATION | Required failure distinctions are not carried through the business adapter |
| BF-U01 | Unverified | High verification priority | Evidence outstanding; no assumption of compliance from age/history | Session restoration and browser failure-state behavior remain unverified |
| BF-U02 | Unverified | High verification priority | Evidence outstanding; no assumption of compliance from age/history | Account-switch/logout and delayed-response identity binding |
| BF-U03 | Unverified | Medium data/UX verification priority | Evidence outstanding; no assumption of compliance from age/history | Ambiguous mutation outcomes, concurrent actions and partial-success feedback |
| BF-U04 | Unverified | Medium compatibility priority | Evidence outstanding; no assumption of compliance from age/history | PWA/mixed-version/browser and origin compatibility |
| BF-U05 | Unverified | Medium conditional security priority | Evidence outstanding; no assumption of compliance from age/history | Rendering, sanitizer availability and diagnostic confidentiality |
| BF-U06 | Unverified | High boundary/data verification priority | Evidence outstanding; no assumption of compliance from age/history | Server enforcement, schema, transactions and ancillary usage evidence |
| BF-L01 | Approved phased migration — outstanding | Required migration work; no compliance certification | Outstanding implementation/design work under cited approved sequencing; NOT COMPLETE | Shared transport adoption and D08 modernization remain outstanding |
| BF-C01 | Corrected in local source | Historical correction; acceptance open | Source correction present; broader verification/closure NOT COMPLETE | Historical nested-error coercion correction is present |
| BF-D01 | Dependency discrepancy | Medium dependency/acceptance risk | Unresolved dependency; no correction performed | Pre-existing working-tree deletion leaves a service-worker cache target absent |


**12 distinct records:** 3 Confirmed Gap;6 Unverified;1 Approved phased migration — outstanding;1 Corrected in local source;1 Dependency discrepancy. Standard rows and distinct findings have different denominators. No approved exception, standards compliance certificate or register closure is created.

## BF-G01 — Readable whole-file formatting is not consistently met

- **Disposition:** Confirmed Gap; Low.
- **Requirements:** CS-07; WA-FORMAT-001; WA-PRESERVE-001.
- **Exact current evidence:** httpdocs/BinForm.html:L14-L14; httpdocs/BinForm.html:L464-L470; httpdocs/BinForm.html:L593-L596; change/BinForm_Change_Verification.md:L19-L21.
- **Implementation status:** Required correction; NOT PREPARED / NOT AUTHORIZED FOR INSTALLATION.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** The sanitizer script indentation differs from sibling head elements; footer children/closing indentation is inconsistent; roundUpAmount is compacted as a complete one-line multi-branch function and escapeHtml begins out of the surrounding indentation. The historic parser verification acknowledges the whole-file formatting obligation but defers it without an evidenced approved exception.

**Impact / confidence:** Readability/reviewability and compliance traceability. No functional defect or visual regression is established merely by indentation.

**Requirement establishing the gap:** Approved Core CS-07 and Detailed WA-FORMAT-001 require pretty, readable source and retain whole-file HTML formatting on edits. Existing TechSummary/CLAUDE whole-HTML rule remains applicable; the prior narrowly scoped parser edit does not itself waive it.

**Smallest proposed next scope:** After independent review and owner authorization, prepare one complete, pretty-formatted BinForm replacement under the existing whole-HTML rule; visibly separate formatting-only differences from any separately approved semantic correction. The smallest valid scope is the one HTML file with all required formatting differences reviewed, not an unapproved opportunistic refactor.

**Other affected files / contracts:** httpdocs/BinForm.html only intended; preserve dependency order and public behavior. No shared source changes proposed.

**Preservation / regression risks:** Whitespace-sensitive templates, visible text, DOM sequence, selectors/IDs, line-sensitive review references, embedded strings, (be) error priority, rounding and recurrence behavior must remain unchanged.

**Required verification:** Future, NOT RUN: full authoritative-original/final unified diff; per-file .md verification; exact hashes; syntax validation in isolation if authorized; representative layout/keyboard/business-regression checks. Every formatting hunk accounted for.

**Owner decision / migration or exception authority:** Owner must approve actual correction scope after independent review. If deferral is chosen, obtain an explicit versioned exception with affected rule/file, reason, compensating review, owner and review trigger; no such exception is established here.

**Existing traceability:** WA-CF-001 preservation context; CS-01/07; no existing register ID added or closed.

## BF-G02 — Accessibility semantics contradict visible interaction state

- **Disposition:** Confirmed Gap; Medium.
- **Requirements:** CS-07; WA-FRONT-001.
- **Exact current evidence:** httpdocs/BinForm.html:L333-L337; httpdocs/BinForm.html:L356-L390; httpdocs/BinForm.html:L398-L458; httpdocs/BinForm.html:L574-L585; httpdocs/BinForm.html:L709-L722; httpdocs/BinForm.html:L814-L833.
- **Implementation status:** Required correction; NOT PREPARED / NOT AUTHORIZED FOR INSTALLATION.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** Description modal starts aria-hidden=true and open/close handlers only add/remove class show; its visible state never updates aria-hidden. By contrast Frequency modal explicitly updates it. Record rows expose click-only edit listeners without focus/key activation. X close controls are spans without focus/keyboard semantics (Cancel buttons do provide another close action). Active/Estimated and frequency-date labels lack explicit control association; visually separate header table is aria-hidden and body table has no own header. Message regions have no live-region role; dialogs have no explicit dialog role, labelled-by, focus placement/trap/return or Escape handler.

**Impact / confidence:** Confirmed static semantic/interaction support gap; visible Description controls remain marked hidden to accessibility APIs. Keyboard row activation and robust accessible control names/headers/focus/message feedback are not implemented in the inspected source. Exact browser/assistive-technology user impact is not tested.

**Requirement establishing the gap:** WA-FRONT-001/CS-07 require applicable keyboard navigation, focus and error announcements with preserved frontend behavior. A visible dialog must not be statically declared hidden; loading sanitizer/shared transport does not repair these semantics.

**Smallest proposed next scope:** After review/approval, prepare bounded semantic and keyboard corrections in BinForm: synchronize Description hidden state, provide keyboard-operable record and close actions, associated labels/headers/dialog names, appropriate focus return and messages. Keep the current visual design and non-keyboard actions. Combine with required whole-HTML formatting only as separately mapped/reviewed differences.

**Other affected files / contracts:** Primary BinForm markup and event handlers. Inspect wa-buttons.css for changed control element styling before proposing any CSS edit; no dependency change is currently authorized.

**Preservation / regression risks:** Do not rename IDs, alter data actions, replace UI design, remove click behavior or change recurrence/save semantics. Native button conversion may inherit raised styling and requires visual review.

**Required verification:** Future, NOT RUN: keyboard-only select/edit/cancel/close/submit; accessibility-tree visible-dialog checks; labels/table-header relationships; initial/return focus, background reachability, Escape policy and error announcements; D07 representative browsers and unchanged visual layout.

**Owner decision / migration or exception authority:** Owner approval of exact keyboard/focus interaction contract is required before correction. An exception, if requested, must be explicit and bounded; there is no approved accessibility waiver in the examined records.

**Existing traceability:** CS-07; source-local finding for independent review; not a claim of existing staged accessibility test failure.

## BF-G03 — Required failure distinctions are not carried through the business adapter

- **Disposition:** Confirmed Gap; Medium; session/error contract.
- **Requirements:** CS-03; WA-SESSION-001; CS-05/WA-API-002 compatibility context.
- **Exact current evidence:** httpdocs/BinForm.html:L493-L513; httpdocs/BinForm.html:L560-L562; httpdocs/BinForm.html:L633-L635; httpdocs/BinForm.html:L676-L698; httpdocs/BinForm.html:L738-L740; httpdocs/BinForm.html:L1082-L1084; standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md:L111-L121.
- **Implementation status:** Required correction; NOT PREPARED / NOT AUTHORIZED FOR INSTALLATION.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** For HTTP rejection, apiFetch selects a string and throws a plain Error. If a string is present, response.status is lost entirely; no status, response or failure category is attached. Every business catch renders only err.message, with the same error style. Fetch network/cancellation rejections reach that same message-only path. No branch retains/distinguishes credential401, entitlement403, server503/5xx, network or cancellation. Useful differences in some backend messages are acknowledged, but are not an equivalent dependable failure contract.

**Impact / confidence:** This is a source-confirmed omission against the express WA-SESSION-001 distinction requirement. For two responses with the same permitted message but different statuses, callers receive the same error information; this is a static data-flow argument, not an executed fixture. No exploited leak, unauthorized write, actual duplicate or specific hosted user failure is claimed.

**Requirement establishing the gap:** WA-SESSION-001 explicitly requires distinction of401,403,network,5xx/503,cancellation while preserving unsaved input and relevant business fields. Its measured-migration sentence does not authorize waiving those invariants. Typed errors are one possible remedy, not the mandated implementation.

**Smallest proposed next scope:** After independent review and owner scope approval, preserve necessary status/transport category through apiFetch and appropriate callers, or implement an equivalent compatible adapter contract. Retain safe Budget message priority and terminal (be) stripping, distinguish recovery/denial/unavailability/cancellation without exposing diagnostics, preserve form values, and never automatically replay POST/PUT/DELETE. Do not combine this with an unapproved token-storage or backend envelope redesign.

**Other affected files / contracts:** Intended minimum: BinForm apiFetch and its seven business call sites/catches; inspect shared WA facade compatibility. Backend wire formats and shared module changes are not presumed necessary or authorized.

**Preservation / regression risks:** Changing visible guidance or recovery sequencing requires owner approval of the exact contract; keep existing success shapes, date/rounding/recurrence, layout and appearance. Include required whole-HTML formatting as separately reviewed hunks if the file is revised.

**Required verification:** Future, NOT RUN: identical safe payload at401/403/503; network and cancellation; mixed flat/nested errors; assert distinct category/status survives, safe appropriate guidance, unchanged entered fields, zero automatic mutation replay and exact single-send behavior. HTTP/browser acceptance remains separate from source proof.

**Owner decision / migration or exception authority:** Correction of this applicable confirmed gap is required unless the owner expressly grants a bounded exception. No such exception or failure-distinction deferral was found. Prepare code only after the independent-review/owner-approval gate; this report supplies no replacement code.

**Existing traceability:** WA-CF-001; S6-008/018/033; BF-U01; BF-L01

## BF-U01 — Session restoration and browser failure-state behavior remain unverified

- **Disposition:** Unverified; High verification priority.
- **Requirements:** CS-03/05; WA-AUTH-001; WA-SESSION-001; WA-API-002.
- **Exact current evidence:** httpdocs/BinForm.html:L480-L513; httpdocs/BinForm.html:L1101-L1122; httpdocs/js/usageTracking.js:L84-L98; httpdocs/js/waPlatform.js:L100-L143.
- **Implementation status:** Evidence outstanding; no assumption of compliance from age/history.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** requireLogin only checks token presence; business requests send current storage token and present generic parsed errors. The page listener is registered before the tracker listener; async listeners do not establish a shared awaited restore barrier. Cookie-only remembered state can follow the redirect branch before page-owned recovery; expired-token business requests can race tracker refresh.

**Impact / confidence:** Browser restoration, recoverability and form retention need evidence; the confirmed adapter failure-distinction omission is separately BF-G03. Phased migration is not an exemption, and no current authorization bypass is demonstrated.

**Smallest proposed next scope:** Required: verify missing/expired/revoked/cookie-only restoration, entitlement denial, outage and unsaved-value behavior; review a preservation-safe integration contract. Correct BF-G03 separately after approval; browser uncertainty does not erase its source evidence.

**Other affected files / contracts:** BinForm business adapter/initialization; WA facade/tracker contracts contextual only.

**Preservation / regression risks:** Keep error-priority and terminal (be) removal, raw versus parsed Response ownership, localhost fallback, domain fields and no POST/PUT/DELETE replay.

**Required verification:** NOT RUN: real browser T09/T10-equivalent cases on this adapter plus HTTP denials; retain prior R10/R14/R15 evidence without broad reopening.

**Owner decision / migration or exception authority:** Review first; owner selects migration/correction scope. D08 architecture is unresolved and not authorized here.

**Existing traceability:** WA-CF-001; S6-005/008/018/033; BF-L01.

## BF-U02 — Account-switch/logout and delayed-response identity binding

- **Disposition:** Unverified; High verification priority.
- **Requirements:** CS-03/09; WA-SESSION-001; WA-AUTH-001; WA-PRIV-001.
- **Exact current evidence:** httpdocs/BinForm.html:L480-L513; httpdocs/BinForm.html:L523-L523; httpdocs/BinForm.html:L612-L635; httpdocs/BinForm.html:L666-L699.
- **Implementation status:** Evidence outstanding; no assumption of compliance from age/history.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** selectedId/form state are page-local while each send reads the then-current token. No storage/account-change listener, response identity check, abort/generation guard or private DOM clearing is present in the page. Old reads may resolve after another account becomes current; a later save can use a replacement token with a still-selected per-user ID.

**Impact / confidence:** Potential display of stale private data or writing old form contents to another same-browser account record with the same per-user ID. Backend UserID ownership remains; no cross-user authorization bypass or actual corrupted record is claimed.

**Smallest proposed next scope:** Use synthetic two-account fixtures to establish behavior; only then design stale-response rejection and explicit safe handling of retained forms on identity changes. Do not silently clear unsaved input or introduce a blanket automatic retry.

**Other affected files / contracts:** BinForm selection/form initialization/read/save lifecycle; shared session contract only if separately approved.

**Preservation / regression risks:** Balance identity isolation with unsaved-value retention and current navigation; owner must approve any clearing/prompt behavior.

**Required verification:** NOT RUN: two tabs, account A->B, logout with pending GET/save, delayed old response, same UserInID across fixtures, old-form/new-token mutation and private DOM visibility.

**Owner decision / migration or exception authority:** Owner must select identity-change/unsaved-form UX after evidence and independent review.

**Existing traceability:** S6-007/018/027/028; WA-CF-001; BF-L01.

## BF-U03 — Ambiguous mutation outcomes, concurrent actions and partial-success feedback

- **Disposition:** Unverified; Medium data/UX verification priority.
- **Requirements:** CS-01/06; WA-SESSION-001; WA-DATA-001; WA-FRONT-001.
- **Exact current evidence:** httpdocs/BinForm.html:L493-L513; httpdocs/BinForm.html:L542-L563; httpdocs/BinForm.html:L638-L685; httpdocs/BinForm.html:L723-L741.
- **Implementation status:** Evidence outstanding; no assumption of compliance from age/history.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** No in-flight disable/guard for Save/Add Description. Non-JSON success returns null from apiFetch and success callers expect result.message. Save shows success then resetForm clears message; description reload catches internally, so its caller can close the modal despite a failed reload. HTTP-error catches do not themselves reset the main form.

**Impact / confidence:** Potential duplicate user-triggered creates, uncertain committed outcome after lost/malformed response, or transient/misleading feedback. The source does not automatically replay requests; double user activation is not equivalent to a proved automatic-replay violation.

**Smallest proposed next scope:** First reproduce with fake/synthetic fixtures under later authorization; propose the minimum pending-state/uncertain-outcome/reconciliation and feedback adjustments only if accepted. Do not add automatic resend or change database/idempotency contracts without separate scope.

**Other affected files / contracts:** BinForm save/delete/description handlers; backend idempotency or schema changes are not currently proposed.

**Preservation / regression risks:** Current Amount ceil behavior is deliberate in both client/server and must remain. Successful reset/navigation semantics and (be) display require owner-approved UX decisions if altered.

**Required verification:** NOT RUN: slow/double activation, timeout-after-commit, non-JSON/204 success, 400/401/403/500/503 rejection, reload failure after successful create, exact before/after field/selection/recurrence/message state and DB row counts.

**Owner decision / migration or exception authority:** Owner approves any pending-state, success feedback, idempotency or uncertain-delivery UX changes; these are not automatically mandatory corrections from preference alone.

**Existing traceability:** S6-008/018/025; WA-CF-001; R15-22–27 bounded evidence remains intact.

## BF-U04 — PWA/mixed-version/browser and origin compatibility

- **Disposition:** Unverified; Medium compatibility priority.
- **Requirements:** CS-10; WA-CACHE-001; WA-ENV-001.
- **Exact current evidence:** httpdocs/BinForm.html:L475-L478; httpdocs/BinForm.html:L515-L520; httpdocs/BinForm.html:L1121-L1122; httpdocs/sw.js:L107-L158; server.js:L68-L82; server.js:L143-L168.
- **Implementation status:** Evidence outstanding; no assumption of compliance from age/history.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** Page and auth facade are network-first SW resources; other shared scripts/styles are not all precache members. HTML has no-cache, ordinary static resources maxAge1d; waPlatform URL unversioned, tracker/sanitizer versioned. localhost fallback may be cross-origin while WA facade insists same origin.

**Impact / confidence:** Potential script/cache/origin skew, not a demonstrated stale-client failure or new cache data leak. Current headers/offline/install behavior untested.

**Smallest proposed next scope:** Reconcile intended origin and deployed version set, then schedule targeted supported-browser/SW update/offline/rollback checks. Any versioning or hosting fix is separately approved.

**Other affected files / contracts:** BinForm; sw.js/server/cache/shared script deployment contracts only as separately scoped dependencies.

**Preservation / regression risks:** Do not unilaterally disable offline support or change caching/publication in a page review.

**Required verification:** NOT RUN: D07 matrix, Apple/PWA where applicable, unsupported Locks recovery, offline/restart, stale assets, SW install/update and actual success/error no-store headers.

**Owner decision / migration or exception authority:** Owner selects browser/environment and later test authorization; separate missing cache-member decision BF-D01.

**Existing traceability:** WA-CF-015; S6-024/026/036; BF-D01.

## BF-U05 — Rendering, sanitizer availability and diagnostic confidentiality

- **Disposition:** Unverified; Medium conditional security priority.
- **Requirements:** CS-07/09; WA-FRONT-001; WA-LOG-001; WA-ERROR-001.
- **Exact current evidence:** httpdocs/BinForm.html:L13-L14; httpdocs/BinForm.html:L517-L518; httpdocs/BinForm.html:L574-L595; httpdocs/BinForm.html:L1069-L1073; httpdocs/js/inputSanitizer.js:L24-L33; dbConnection.js:L37-L39; routes/budget.js:L93-L106; routes/budget.js:L215-L225.
- **Implementation status:** Evidence outstanding; no assumption of compliance from age/history.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** Names/descriptions are escaped and error messages use textContent. Date fields/preview arrays enter innerHTML without separate escaping, but inspected backend uses validated ISO dates/DATE strings and generated toIso results. DOMPurify CDN is required; sanitizer falls back to original text if missing. Page logs a raw service-worker registration error.

**Impact / confidence:** Response-type invariants/CDN availability/Console confidentiality require verification. This is not a confirmed XSS or secret disclosure; every innerHTML use is not automatically unsafe, and constant-generated templates were distinguished.

**Smallest proposed next scope:** Validate date/response invariants and DOMPurify presence before proposing defensive rendering or sanitized diagnostics. Consider text-node date rendering only in a separately reviewed preservation-safe change. No opportunistic CSP/SRI/token-storage redesign.

**Other affected files / contracts:** BinForm, existing sanitizer and response producers only as needed after evidence; dependencies not certified.

**Preservation / regression risks:** Keep plain-text user rendering, password exclusion in shared sanitizer, expected error messages, date-only semantics and existing recurrence preview appearance.

**Required verification:** NOT RUN: malformed response/type cases, expected ISO dates, literal markup in free text/errors, CDN blocked scenario, synthetic secret marker absent from DOM/Console/log evidence.

**Owner decision / migration or exception authority:** Owner chooses any additional hardening or shared-helper change after independent review.

**Existing traceability:** S6-028/030/033/041; BF-C01; D08 staged design objective only.

## BF-U06 — Server enforcement, schema, transactions and ancillary usage evidence

- **Disposition:** Unverified; High boundary/data verification priority.
- **Requirements:** CS-04/06; WA-API-001; WA-DATA-001; WA-ENV-001.
- **Exact current evidence:** server.js:L143-L168; middleware/subscriptionAccess.js:L4-L30; routes/budget.js:L398-L529; routes/budget.js:L905-L923; middleware/usageActivity.js:L19-L50; utils.js:L38-L50.
- **Implementation status:** Evidence outstanding; no assumption of compliance from age/history.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** Current guards/SQL bind authenticated UserID; data mutations use recurrence transactions except standalone description insert/sequence helper. Preview is compute-only for Budget state but POST is counted as RECORD_CREATE by generic usage middleware. Local budgetExpected marker differs from central WeakSet producer classification.

**Impact / confidence:** Actual denial/no-write/rollback/rows/schema/concurrency and telemetry meaning remain unverified. These are dependency review topics, not newly certified backend defects attributable to BinForm.

**Smallest proposed next scope:** Use per-operation matrix to define owner-controlled negative and data-integrity cases; separate routes/budget, usageActivity, allocation/transaction and error-provenance examination if needed. Do not remove apparently duplicated auth without a reviewed contract.

**Other affected files / contracts:** Budget/auth/subscription/DB utilities/telemetry dependencies; no full-file backend certification or correction authorized.

**Preservation / regression risks:** Keep ownership, global/system description availability, schema compatibility, UTC/date-only values, Amount ceil and permitted public/native separation.

**Required verification:** NOT RUN: no/expired/wrong-client token, denied subscription, cross-user UserInID, admin entitlement without ownership bypass, validation, recurrence children, duplicate descriptions, rollback/concurrency, bounded preview resource use and exact telemetry.

**Owner decision / migration or exception authority:** Any database/service/test or backend correction needs separate explicit scope and environment authorization.

**Existing traceability:** S6-009/019/031/033; WA-CF-009/016; D03; BF-U03.

## BF-L01 — Shared transport adoption and D08 modernization remain outstanding

- **Disposition:** Approved phased migration — outstanding; Required migration work; no compliance certification.
- **Requirements:** CS-03/08; WA-AUTH-001; WA-SESSION-001; WA-SHARED-001.
- **Exact current evidence:** httpdocs/BinForm.html:L475-L513; httpdocs/BinForm.html:L1121-L1122; httpdocs/js/usageTracking.js:L25-L58; httpdocs/js/waPlatform.js:L119-L143.
- **Implementation status:** Outstanding implementation/design work under cited approved sequencing; NOT COMPLETE.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** Business API calls use apiFetch while only tracking uses WA.api. Persistent localStorage access tokens remain. These are current implementation observations, not proof of compliance. Detailed WA-SESSION-001 expressly authorizes measured migration groups; D08 retains current storage pending approved architecture/compatibility decisions.

**Impact / confidence:** Shared-adoption work is incomplete. The sequencing provisions do not excuse confirmed current safety gaps (including BF-G03), close WA-CF-001/S6-005 or establish a page-specific exception. Storage modernization is an approved objective with a design gate, not an already-selected remedy or completed requirement.

**Smallest proposed next scope:** Required next work is a reviewed migration contract and owner-approved implementation unit: compare compatible shared transport or a justified adapter; preserve parser priority, terminal (be), Response/data ownership, origin behavior, unsaved forms and non-replay. Independently correct confirmed applicable gaps; do not defer them merely because the page is old.

**Other affected files / contracts:** BinForm only intended; avoid global fetch patch or shared-library rewrite.

**Preservation / regression risks:** WA.api.request returns Response and WA.api.json returns parsed payload; direct substitution is not contract-equivalent. Shared parser prioritizes top-level message before error while local page does the reverse.

**Required verification:** NOT RUN: compatibility/expiry/identity/error/mutation/browser regressions. Source loading and historical operation are not acceptance evidence.

**Owner decision / migration or exception authority:** Authority for phased sequencing: CS-08 and Detailed WA-SESSION-001 measured-groups clause. D08 authority covers design direction/selection gate only. No express BinForm exception or blanket safety deferral is established. Owner approval remains required before any implementation.

**Existing traceability:** WA-CF-001; S6-005/008/018/033; D08; BF-G03; BF-U01/BF-U02

## BF-C01 — Historical nested-error coercion correction is present

- **Disposition:** Corrected in local source; Historical correction; acceptance open.
- **Requirements:** CS-01/05; WA-API-002; WA-REVIEW-001.
- **Exact current evidence:** httpdocs/BinForm.html:L493-L513; change/BinForm.original-to-final.diff:L1-L16; change/BinForm_Change_Verification.md:L9-L25; change/WA_CF_001_Offline_Test_Results.txt:L1-L8; docs/WA_Standards_Compliance_Register.md:L168-L180.
- **Implementation status:** Source correction present; broader verification/closure NOT COMPLETE.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** Current 48,862-byte SHA-256 equals recorded proposed final and Git blob at 2a92b2f. Reversing only documented parser hunk in memory reconstructs 48,607 bytes with recorded original hash. The local code has typed flat/nested/top-level fallback; old ambiguous error-object coercion is absent.

**Impact / confidence:** Historical parser defect should not be reported as still present in current local source. Existing 7/7 isolated result is documentary evidence only; no current test/hosted/Drive certification.

**Smallest proposed next scope:** Retain installed parser behavior and prior evidence. Review browser acceptance and stale register/correction labels separately; no fresh parser rewrite proposed.

**Other affected files / contracts:** BinForm; existing verification/register/handoff history referenced but never edited.

**Preservation / regression risks:** Existing (be) suffix convention remains; no success response changes or broad error-envelope migration.

**Required verification:** Current source identity comparison and reverse-hunk reconstruction are static checks performed; application tests NOT RUN. Independent current browser flat/nested/failure evidence still needed.

**Owner decision / migration or exception authority:** Owner/independent review reconciles provenance and later status updates. Do not close WA-CF-001/S6-005 from this correction.

**Existing traceability:** WA-CF-001; S6-005/008/018/033; historical 2a92b2f; T09/T10 distinction.

## BF-D01 — Pre-existing working-tree deletion leaves a service-worker cache target absent

- **Disposition:** Dependency discrepancy; Medium dependency/acceptance risk.
- **Requirements:** CS-02/10; WA-CACHE-001; WA-ENV-001.
- **Exact current evidence:** httpdocs/sw.js:L16-L16; httpdocs/sw.js:L62-L62; httpdocs/sw.js:L107-L111; docs/WA_Wave0_Reconciliation.md:L40-L62.
- **Implementation status:** Unresolved dependency; no correction performed.
- **Express exception authority:** No expressly authorized BinForm exception established..

**Observed implementation:** At examination start Git status already had D httpdocs/bday.html and D httpdocs/images/logo.png. The current SW URLs include /bday.html and install uses cache.addAll. This differs from the historical clean Wave 0 tree. BinForm source and named dependencies match the Wave 0 hashes compared.

**Impact / confidence:** Confirmed local missing precache member, with possible install/update consequences if equivalent hosted deletion exists. No network request, service-worker install or hosted-state claim. logo.png is unrelated to primary page and is recorded only as pre-existing baseline context.

**Smallest proposed next scope:** Owner decides whether deletion is intended and later reconciles the SW dependency in a separately approved review. Do not restore, delete more files or rewrite Wave 0 snapshots here.

**Other affected files / contracts:** sw.js/bday.html dependency outside primary correction scope; no change proposed in this package.

**Preservation / regression risks:** Preserve current working-tree changes and historical Wave 0 evidence; no assumption that remote deployment has same missing file.

**Required verification:** Static path/reference and start-status observations performed; current hosted cache.addAll/install outcomes NOT RUN.

**Owner decision / migration or exception authority:** Owner must resolve intended source/deployment cache set before later PWA acceptance.

**Existing traceability:** S6-024; WA-CF-015; BF-U04.

## Required review/correction sequence

1. Independently review all12 records, including the bounded source proof for BF-G03; reconcile current authoritative Drive/hosted identity without claiming unverified byte equality.
2. Approve exact correction scopes for BF-G03, BF-G02 and BF-G01, with required whole-HTML formatting differences separately mapped. Preserve existing safe messages, (be), form state, calculations, recurrence, layout and appearance; do not replay uncertain mutations.
3. Define the outstanding phased shared-adoption work with owner-approved unit, compatibility contract, milestones and acceptance. D08 architecture/design gate and D04 gradual producer migration remain outstanding, not complete. No broad token/backend/shared rewrite is authorized.
4. Obtain authorized session/identity/ambiguous-mutation/browser/data evidence for BF-U01–U06; source-confirmed gaps are not downgraded just because execution is prohibited.
5. Resolve BF-D01 as a separate dependency scope. Existing owner changes and historical evidence remain preserved.
6. Only after independent review and explicit owner approval prepare complete correction source at intended project-relative installation paths, full original/final diff, standalone verification, hashes, dependency review, rollback and authorized tests. No correction source or installation ZIP is delivered now.

No existing project file, register, prior report/ZIP or service is modified. No application, tests, builds, DB, hosted or deployment operations occurred. Stop for independent owner review.
