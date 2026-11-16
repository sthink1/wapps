# Wonderful Apps — BinForm Standards Compliance Examination

**Assignment:** first read-only examination of `httpdocs/BinForm.html`.
**Date:** November 15, 2026 (America/New_York).
**Status:** examination for independent owner/ChatGPT review; no code correction or file-level certification.

## 1. Result

The current file contains the historical nested-error correction and matches the Wave 0 baseline exactly. Two bounded gaps are supported by static source: inconsistent/compacted formatting and accessibility semantics. Six further issues require evidence rather than automatic defect labels. The independent bearer adapter is permitted legacy migration debt; loading a shared library is not proof that business operations use it.

**Coverage:** all 1,124 lines of BinForm, including HTML, CSS and the full inline JavaScript, were read. All eight direct business operations were traced to current Budget handlers; five indirect session/tracking paths and nineteen source-dependency entries are separately recorded.

**Standards:** 12 Core + **20 installed Detailed requirements** = 32 matrix rows. Dispositions are 21 Unverified, 4 Permitted Legacy, 3 Confirmed Gap rows and 4 N/A. The three Confirmed Gap standard rows map to two distinct source findings; they are not three independent defects. No standard receives blanket Conforming from source existence alone.

**Findings:** 2 Confirmed Gap, 6 Unverified, 1 Permitted Legacy, 1 Corrected in local source, 1 Dependency discrepancy. Report D gives exact evidence, rule, impact, scope, risks, tests and owner decisions for each.

## 2. Authority, versions and discovery

README.md, especially Section 0, was read first before source examination. Core v1.0, Detailed v0.4.1 consolidated 3A–3C and Decision Register v1.0/D01–D14 were explicitly reviewed, followed by AGENTS.md, CLAUDE.md, Compliance Register v1.1, the Wave 0 row/dependency/reconciliation reports and relevant Stage 6 records. TechSummary.md's established formatting/security context was also consulted; governing reference hashes remain unchanged from the prior reviewed local copies.

Core/Detailed headers and the owner's assignment confirm approved November 12 versions despite historical DRAFT basenames. D01 full verified Family Tree administration, D08 architecture-open modernization, D10 native preservation, D11 public hardening deferral and D13/D14 review/manual installation remain intact. These decisions are not independent evidence of current implementation conformance.

**COUNT-01 — count discrepancy:** the assignment/register catalog says “nineteen” Detailed Standards, but the installed approved specification has twenty named requirement headings: it includes WA-SEC-ADMIN-001 as well as the nineteen catalogued elsewhere. To satisfy “every” requirement without omission, the matrix includes all twenty, with WA-SEC-ADMIN-001 N/A to this page's own administrator decisions and its server dependency discussed. This is a documented numerical/catalog mismatch, not a choice to override a conflicting technical policy; no governing requirement is silently removed. Independent review should reconcile the count label. No substantive policy conflict prevented the bounded local examination.

The current attachment expressly permits report generation only inside the owner-created download/ directory. This is the narrow task-specific exception to general read-only project rules. Tools were explicitly used to read instructions; automatic AGENTS/README ingestion by every tool is not assumed. No GitHub, Drive, Render, database or Android write/access operation was undertaken.

## 3. Current source and Git baseline

| Fact | Verified local observation |
| --- | --- |
| Project root | C:\AppProjectwDB\WonderfulAppsRender |
| Branch | reviseLogIn |
| HEAD | 1bc93d86a194cdcc57a7280de226f1bfee10f10c |
| Primary file size | 48862 bytes |
| Primary file SHA-256 | `07898f5d291b1f296fe0f0aa85fe1f91c96815bb19782d0cbe98b8c8a28700a2` |
| Full source coverage | Lines 1–1124, no truncation in cumulative numbered reads |
| Wave 0 row | Size 48,862 and identical SHA-256; no primary-file drift |
| Historical correction blob | git show 2a92b2f:httpdocs/BinForm.html returns exact same 48,862 bytes/SHA-256 |
| Drive equivalence | Owner reports local duplication to Drive; independent exact current Drive/local comparison NOT PERFORMED |
| Deployment | Previously reported 1bc93d8 prefix matches local HEAD; actual live Render revision NOT QUERIED |


Initial working-tree state, preserved without restoration or cleanup:

```text
 D httpdocs/bday.html
 D httpdocs/images/logo.png
?? docs/WA_Wave0_Dependency_Review.md
?? docs/WA_Wave0_Exclusions.csv
?? docs/WA_Wave0_Functional_Inventory.csv
?? docs/WA_Wave0_Reconciliation.md
```

The two deletions predate this examination. Wave 0's clean-tree observations are historical, not today's initial status. The deletion of bday.html is relevant to the current SW precache; logo.png is baseline context only. The four Wave 0 reports themselves retain the exact previously delivered hashes and were not revised. Named source dependencies match the compared Wave 0 identities; the manifest records current identities of all scoped sources.

Google Drive My Drive/wonderfulApp remains authoritative. The owner explicitly selected local files for this examination; current local identity is sufficient for bounded source conclusions, not proof of remote equality or release readiness.

## 4. Installed WA-CF-001 correction and stale evidence

The present apiFetch at `httpdocs/BinForm.html:L493-L513` selects an error only from explicit flat/nested/top-level strings, with HTTP fallback and terminal (be) stripping. It no longer coerces an arbitrary error object into display text.

The current SHA-256 equals the final proposed hash in `change/BinForm_Change_Verification.md:L9-L15` and exact Git blob at historical 2a92b2f. Reversing only the documented hunk **in memory** produces 48,607 bytes with SHA-256 `2cc183ba0d75cc1d16049511b1ccf7d2661d6bdcfcb088ce08e8fc82b0f7d4cf`, the recorded original. No original or revised source copy was written.

The correction verification still says proposed/not installed; the register follow-up records owner-reported inclusion at 2a92b2f, while other cells still say “Not proposed” and repeat the prior coercion observation. Current source/Git evidence establishes local presence of the fix, without editing those historical records or claiming current Drive/staging acceptance. waPlatform.js and verifyAccessToken.js also retain stale “not loaded/not wired” header comments contradicted by current imports; comments do not override executable references.

Historical `change/WA_CF_001_Offline_Test_Results.txt` records seven bounded parser/send-once passes. The test source was inspected, **never executed here**. Its fake-response assertions do not prove browser form retention, network failure behavior or current hosted identity. WA-CF-001 and S6-005/008/018/033 remain open within their original scopes.

R16-75 shared-client T09 corrected offline evidence is separate from this independent page adapter. The T10 report explicitly leaves real unsaved-form/browser acceptance open. R15-22–27 and R15 tracking/reload/background evidence remain bounded historical passes; they are not reopened or promoted to comprehensive certification.

## 5. Functional and frontend examination

### Page structure and visual preservation

HTML5 document with lang=en, viewport, title, manifest/favicon and light-mode meta/CSS is present (`httpdocs/BinForm.html:L1-L18`). Inline CSS covers page, grid form, table, modal, fixed footer and a 720px responsive breakpoint (`httpdocs/BinForm.html:L20-L287`). Shared raised-button CSS loads after inline style, and body enables it (`httpdocs/BinForm.html:L289-L292`). No new design, rounding policy, layout or navigation is proposed.

Static HTML parsing found no duplicate literal IDs. This is a structural observation, not HTML5 conformance, JS syntax validation or a browser render PASS. Dynamic controls are generated later from constant weekday/month/ordinal lists and require browser verification.

Formatting BF-G01 is limited to actual source readability/indentation; simple one-line CSS declarations alone are not labelled a defect. Any future edit must honor whole-HTML formatting with reviewed differences, not uncontrolled reformatting.

### Form values and validation

From/Description/Date Begin/Amount are required; From max100, Note max2000, Amount min0/step0.01. Date End is optional; Active/Estimated flags and recurrence modal accompany the item (`httpdocs/BinForm.html:L303-L349`). A positive integer URL id is validated before the detail request (`httpdocs/BinForm.html:L598-L610`).

formPayload trims text and preserves date strings/nulls, booleans and recurrence. Amount is **rounded upward to a whole number** by roundUpAmount, matching backend money()'s Math.ceil; this existing contract is not called a defect or silently changed. Display rounds/formats monetary values separately. Server normalizeSource validates required text/date/money and recurrence, with date-only ordering checks; frontend validation is not relied upon as security.

Global/system plus user-owned active descriptions are obtained from current DB-driven route logic, not hardcoded lists. Add Description captures reusable text sanitization before the button handler, and backend applies required/length/duplicate controls. No schema was read from a database or inferred current from an old dump.

### Rendering, sanitizer and diagnostic boundaries

DOMPurify and inputSanitizer load before page logic. Sanitizer uses capture listeners for blur/change/submit/button/Enter and excludes passwords/strongly typed controls; the modal's outside-form save is covered by the document-scope click handler. That static wiring is not proof the external CDN successfully loads. The helper's unavailable-library fallback is a separate conditional risk under BF-U05, not an asserted exploitable incident.

Names/descriptions in table cells are escaped, description options use textContent, and form/description/frequency error regions use textContent. Constant-generated recurrence controls are distinguished from untrusted HTML. Date fields and preview dates use innerHTML interpolation, but current backend validates/returns DATE/ISO strings; no injection is demonstrated. Review invariants and malicious/malformed fixtures before any rendering correction claim.

No token/credential Console logging was found in the primary source. Service-worker registration catch logs the raw error object, requiring scoped diagnostic verification; actual secrets were not obtained or placed in reports. No password field/public capability URL/native credential flow belongs to BinForm.

### Accessibility and feedback

BF-G02 records a source-confirmed contradiction: Description modal remains aria-hidden=true when class show displays it. Frequency modal does update aria-hidden. Click-only row edit actions, span X controls, label associations, visually separate hidden headers, dialog/focus semantics and live error announcements require review. Cancel buttons provide an existing keyboard-accessible close action; the report does not falsely claim there is no keyboard close route at all.

Save success calls showMessage then resetForm, which clears that message; internal description reload errors can be swallowed before modal close. These are observed control-flow/UX verification issues under BF-U03, not invented security failures. Modal and responsive/keyboard/assistive-technology behavior were not executed.

## 6. Authentication, data and API assessment

requireLogin checks only current localStorage token presence and redirects to home otherwise. apiFetch sends current bearer, parses JSON and has no status-specific recovery or automatic retry. Loading WA at the end of the page does not change that business adapter. Tracker restoration is a separate async listener, not an awaited business-initialization barrier. This is permitted legacy migration debt with BF-U01/BF-U02 acceptance risks, not an automatic standards failure.

Server Budget mounting is web-only auth + entitlement + usage, with inner handler auth and UserID-filtered SQL. Administrator entitlement override does not remove Budget record ownership checks. UserInID is user-scoped; the URL or selectedId is never sufficient identity. Actual missing/expired/revoked/native/wrong-owner/forbidden outcomes remain unverified.

All direct operations:

| ID | Caller | Method/path | Backend |
| --- | --- | --- | --- |
| API-01 | loadDescriptions(selectedText) | GET `/budget/descriptions?inOrOut=In` | routes/budget.js:L498-L509 |
| API-02 | loadRecords | GET `/budget/in?status=all` | routes/budget.js:L398-L405 |
| API-03 | editRecord(id,tr) | GET `/budget/in/{UserInID}` | routes/budget.js:L407-L419 |
| API-04 | entryForm submit; selectedId null | POST `/budget/in` | routes/budget.js:L421-L442 |
| API-05 | entryForm submit; selectedId set | PUT `/budget/in/{selectedId}` | routes/budget.js:L444-L473 |
| API-06 | deleteBtn click after confirm | DELETE `/budget/in/{selectedId}` | routes/budget.js:L475-L493 |
| API-07 | saveDescription click | POST `/budget/descriptions` | routes/budget.js:L512-L530 |
| API-08 | previewRecurrence(false/true) | POST `/budget/recurrence/preview` | routes/budget.js:L905-L923 |


There are seven concrete page call sites, one of which selects POST or PUT, yielding eight operations. No description PUT/DELETE, health, payment or Family Tree API is called by this file. The API CSV separately records method, body, credentials/ownership, success/error wire forms, display behavior, session outcome, replay, side effects, unsaved-state limits and backend evidence for every operation.

Successful descriptions return an array; item list returns owned rows; item detail attaches Recurrence; create/update/delete return message/data envelopes; preview returns effective EndDate, at most100 Occurrences and Truncated. Error status/body variants were read from actual handlers, not fabricated from an imagined future envelope. Local parser prioritizes error over message, while the shared parser prioritizes message first. A future shared adapter must preserve current Budget conventions including terminal (be) removal and correct handling of raw Response versus parsed JSON.

**Mutation/replay:** direct adapter contains one fetch and no automatic retry. Failed mutation catches do not reset the main form, but actual preservation is unverified under identity races, partial read success or uncertain delivered response. Duplicate manual/concurrent activation is not automatic replay. No in-flight guard is present; no duplicate record or DB write was produced here. A broad claim that all failure scenarios preserve values would be unsupported.

POST/PUT/DELETE handler transactions cover recurrence/item state, with separate sequence helper calls; description creation is standalone. Date normalization and UTC/DATE-string declarations support the observed contract, without certifying present schema, transaction behavior, row counts, cascades, concurrency or recovery. Preview makes no Budget business save, but usageActivity writes telemetry and treats successful POST as RECORD_CREATE; even GET business reads have ancillary API_CALL telemetry. That middleware meaning and local Budget error provenance are separate dependency-review topics.

## 7. Shared and indirect dependencies

External declaration order: DOMPurify CDN → inputSanitizer → inline page logic → waPlatform → usageTracking. wa-buttons.css, manifest, favicon, home/budget navigation and sw.js are also referenced. All page-local referenced targets were present at baseline; the transitive precache issue below is separate.

| Indirect ID | Caller | Method/path |
| --- | --- | --- |
| API-I01 | usageTracking.start/sendNormal | POST `/track/log/page` |
| API-I02 | usageTracking.checkpoint(false)/sendNormal | POST `/track/log/time-spent` |
| API-I03 | usageTracking.pause/checkpoint(true)/sendExit | POST `/track/log/time-spent` |
| API-I04 | usageTracking.start -> WA.session.restore | GET `/users/session-status` |
| API-I05 | WA.session.restore/request -> refreshUnderLock | POST `/users/refresh-session` |


Tracker normal POSTs use WA.api; exit time-spent uses a current-token keepalive fetch with no awaited refresh. Shared restore uses session-status and may rotate a refresh cookie under Web Locks; missing Locks fail closed. No request to WA.logout is initiated by this page/tracker; exposing the shared method is not a call. Direct business calls remain independent.

A shared adapter can coexist safely if its contract is reviewed; direct substitution with WA.api.request would return Response instead of the object callers expect, and WA.api.json still differs in error priority/suffix and same-origin constraints. No global fetch patch, browser token redesign, native flow change, public-endpoint hardening or backend refactor is proposed.

Dependency metadata and the 19 contextual rows in the API matrix identify observed contracts, not certification of those files. Additional source reads were limited to the justified server/auth/DB/session/telemetry chain and historical evidence.

## 8. Cache/browser/dependency discrepancies

Server source declares no-store on Budget responses and central protected early errors; SW bypasses Authorization, non-GET and unlisted API requests. Cache Storage, ordinary HTTP caching and private DOM retention remain distinct boundaries. Page HTML/auth module are network-first SW resources, while tracker/sanitizer and styles are not all in the explicit precache set. Script URL versions differ. Source declarations alone do not establish live headers, safe mixed-version deployment or offline acceptance.

**BF-D01:** initial working tree already lacks bday.html, yet current sw.js includes /bday.html in its cache lists and cache.addAll install path. This is a confirmed local missing dependency with **unverified hosted/install impact**. No restoration/removal/SW edit was made. logo.png deletion is not a BinForm dependency; it is recorded only to preserve baseline evidence.

Supported Windows Chrome/Edge/Firefox/DuckDuckGo, macOS/iOS/iPadOS Safari, Android Chrome and applicable PWA/restart/unsupported-lock cases remain acceptance targets. This assignment executed none of them. Current local HEAD matching a reported staging prefix does not prove deployment equality.

## 9. Standard-by-standard assessment

Assessment scope is the primary file, with dependent contracts as context. N/A explains absent primary features, not waiver of dependency safety. “Permitted Legacy” is documented migration status, not long-term exemption from mandatory safety. All Unverified rows name required future evidence in the CSV.

| ID | Applicability | Assessment | Evidence / reason |
| --- | --- | --- | --- |
| CS-01 | Applicable | Unverified | httpdocs/BinForm.html:L1-L1124; change/BinForm_Change_Verification.md:L9-L25 — Current examination changes no source. Historic comparison supports one parser change; complete visual/functional preservation is not proved by hashes. |
| CS-02 | Applicable | Unverified | README.md:L40-L49; httpdocs/BinForm.html:L1-L1124; docs/WA_Wave0_Reconciliation.md:L40-L62 — Read-only process followed; full source-authority correspondence remains unverified, so no blanket Conforming label. |
| CS-03 | Applicable | Permitted Legacy | httpdocs/BinForm.html:L475-L513; httpdocs/BinForm.html:L666-L699; httpdocs/BinForm.html:L1101-L1122; httpdocs/js/waPlatform.js:L100-L143 — Direct fetch is expressly allowed migration debt. Recovery and identity safety need evidence, rather than automatic noncompliance. |
| CS-04 | Applicable | Unverified | server.js:L143-L168; middleware/subscriptionAccess.js:L4-L30; routes/budget.js:L398-L491 — Source maps guards and ownership. DB role/cross-user outcomes have not been executed. BinForm has no FT administrative workflow. |
| CS-05 | Applicable | Unverified | httpdocs/BinForm.html:L493-L513; httpdocs/BinForm.html:L525-L529; routes/budget.js:L77-L91; server.js:L202-L234 — Prior source parsing defect is corrected locally. Runtime error confidentiality, error statuses and consumers still require validation. |
| CS-06 | Applicable | Unverified | httpdocs/BinForm.html:L652-L663; routes/budget.js:L344-L379; routes/budget.js:L421-L491; utils.js:L38-L50; dbConnection.js:L37-L39 — Existing rounding is preserved, not a defect. Schema, concurrency, affected rows and rollback are not certified. |
| CS-07 | Applicable | Confirmed Gap | httpdocs/BinForm.html:L14-L14; httpdocs/BinForm.html:L333-L337; httpdocs/BinForm.html:L398-L458; httpdocs/BinForm.html:L593-L596; httpdocs/BinForm.html:L709-L722 — BF-G01/G02 are bounded static source defects. No XSS exploit or exact visual regression is inferred. |
| CS-08 | Applicable | Permitted Legacy | httpdocs/BinForm.html:L493-L513; httpdocs/BinForm.html:L1121-L1122; httpdocs/js/usageTracking.js:L21-L58; httpdocs/js/waPlatform.js:L119-L143 — Incremental migration allowed. Raw Response, parser precedence, (be) stripping and localhost base behavior must survive any adapter proposal. |
| CS-09 | Applicable | Unverified | httpdocs/BinForm.html:L480-L518; httpdocs/BinForm.html:L574-L595; httpdocs/BinForm.html:L1069-L1073; httpdocs/js/inputSanitizer.js:L24-L33 — Persistent storage is D08 migration objective, not new violation. Typed-date pipeline lowers injection concern; browser/CDN/logging negative cases remain unverified. |
| CS-10 | Applicable | Unverified | httpdocs/BinForm.html:L7-L17; httpdocs/BinForm.html:L280-L286; httpdocs/BinForm.html:L515-L520; httpdocs/sw.js:L1-L46; httpdocs/sw.js:L107-L158 — No device/browser/SW execution. Native and public endpoint contracts not changed by page. |
| CS-11 | Applicable | Unverified | change/WA_CF_001_Offline_Test_Results.txt:L1-L8; docs/Stage6_Render_TestPlan.md:L49-L70; docs/WA_R16-75_T10_Offline_Test_Results_2026-11-15.md:L32-L53 — Existing evidence remains bounded and preserved. Current comprehensive acceptance missing; examination cannot certify it. |
| CS-12 | Applicable | Unverified | docs/WA_Standards_Compliance_Register.md:L168-L180; change/BinForm_Change_Verification.md:L1-L44; httpdocs/BinForm.html:L493-L513 — This package follows examination governance, but historical authority/closure remains unresolved. No file-level certification or installation authorized. |
| WA-PRESERVE-001 | Applicable | Unverified | httpdocs/BinForm.html:L1-L1124; change/BinForm.original-to-final.diff:L1-L16 — Static historical byte evidence does not prove behavior/visual preservation; this assignment makes no source change. |
| WA-FORMAT-001 | Applicable | Confirmed Gap | httpdocs/BinForm.html:L14-L14; httpdocs/BinForm.html:L464-L470; httpdocs/BinForm.html:L593-L596 — Static readability gap; prior verification acknowledges whole-file formatting obligation, but no explicit approved waiver was established. |
| WA-SEC-ADMIN-001 | Not Applicable | N/A | httpdocs/BinForm.html:L475-L513; middleware/subscriptionAccess.js:L4-L19; services/administratorAccess.js:L10-L29 — N/A to primary page implementation; server dependency still requires separate audit and runtime denial tests. Not an exemption from ownership. |
| WA-CORE-001 | Applicable | Unverified | httpdocs/BinForm.html:L1-L1124; README.md:L40-L49; change/BinForm_Change_Verification.md:L9-L15 — Authorized local source is sufficient for bounded examination; not a certification of synchronized stores. |
| WA-API-001 | Applicable | Unverified | httpdocs/BinForm.html:L542-L742; httpdocs/BinForm.html:L1046-L1085; routes/budget.js:L398-L529; routes/budget.js:L905-L922 — Static method/handler map complete for page; all negative authorization/runtime results remain unverified. |
| WA-AUTH-001 | Applicable | Unverified | httpdocs/BinForm.html:L480-L513; middleware/subscriptionAccess.js:L8-L25; services/verifyAccessToken.js:L33-L76 — Source gates exist but do not prove runtime rejection or restoration behavior; D08 replacement not selected. |
| WA-SESSION-001 | Applicable | Permitted Legacy | httpdocs/BinForm.html:L493-L513; httpdocs/BinForm.html:L666-L699; httpdocs/BinForm.html:L1101-L1118; httpdocs/js/waPlatform.js:L119-L137 — Legacy transport itself permitted; race recovery, form identity and actual browser retention unverified. |
| WA-ERROR-001 | Applicable | Unverified | httpdocs/BinForm.html:L493-L513; routes/budget.js:L77-L91; utils.js:L30-L35; server.js:L223-L234 — Consumer parser is not provenance sanitizer. Local budget marker differs from shared D03 mechanism, requiring separate routes/budget examination rather than a new BinForm violation. |
| WA-API-002 | Applicable | Unverified | httpdocs/BinForm.html:L493-L513; httpdocs/BinForm.html:L679-L695; httpdocs/js/waPlatform.js:L41-L55 — Historical object-coercion defect corrected. No requirement to wholesale replace compatible legacy parser; current browser/error-shape matrix not run. |
| WA-PRIV-001 | Applicable | Unverified | httpdocs/BinForm.html:L475-L513; httpdocs/js/waPlatform.js:L71-L115; routes/users.js:L263-L291; services/browserSession.js:L20-L26 — Applicable indirectly to shared session path; do not force cookie-only controls onto each bearer call or claim CORS authorizes records. |
| WA-PRIV-002 | Not Applicable | N/A | httpdocs/BinForm.html:L542-L742; httpdocs/BinForm.html:L1046-L1085 — No Family Tree contract implemented by primary file. Shared adapter changes later must still avoid project-wide effects. |
| WA-NATIVE-001 | Not Applicable | N/A | httpdocs/BinForm.html:L475-L513; server.js:L168-L168 — TNNA code not examined or changed; compatibility of future shared changes needs separate scope. |
| WA-DATA-001 | Applicable | Unverified | httpdocs/BinForm.html:L652-L663; routes/budget.js:L344-L379; routes/budget.js:L421-L529; utils.js:L38-L50; dbConnection.js:L37-L39 — No current schema/affected-row/concurrency execution. GET/preview are business reads but successful Budget calls have telemetry side effects. |
| WA-FRONT-001 | Applicable | Confirmed Gap | httpdocs/BinForm.html:L333-L337; httpdocs/BinForm.html:L356-L390; httpdocs/BinForm.html:L398-L458; httpdocs/BinForm.html:L709-L722; httpdocs/BinForm.html:L814-L833 — Confirmed source semantics gap, not a claim of executed screen-reader/visual failure. Most user strings escaped or textContent; date rendering separately unverified. |
| WA-SHARED-001 | Applicable | Permitted Legacy | httpdocs/BinForm.html:L493-L513; httpdocs/BinForm.html:L1121-L1122; httpdocs/js/usageTracking.js:L25-L58 — Existing legacy migration path is permitted. Any proposed adapter needs owner review of response ownership, base origin and suffix/priority. |
| WA-LOG-001 | Applicable | Unverified | httpdocs/BinForm.html:L480-L518; httpdocs/BinForm.html:L525-L529; httpdocs/js/usageTracking.js:L34-L38; server.js:L202-L234 — Static search cannot establish absence of secrets in actual browser/platform exceptions, CDN execution or all downstream logs. |
| WA-CACHE-001 | Applicable | Unverified | httpdocs/BinForm.html:L10-L14; httpdocs/BinForm.html:L515-L520; httpdocs/BinForm.html:L1121-L1122; server.js:L68-L82; server.js:L143-L168; httpdocs/sw.js:L107-L158 — Header code is not observed runtime headers. Mixed-version/load/install and private DOM retention require tests. |
| WA-ENV-001 | Applicable | Unverified | httpdocs/BinForm.html:L13-L14; httpdocs/BinForm.html:L475-L478; server.js:L237-L251 — Runtime/DB/hosted/CDN identities not verified. Existing project deletions are preserved and disclosed. |
| WA-ABUSE-001 | Not Applicable | N/A | httpdocs/BinForm.html:L542-L742; httpdocs/BinForm.html:L1046-L1085 — No credential/public-service redesign in scope. Preview computational limits are a Budget resource question under ENV/DATA, not evidence of a credential-control defect. |
| WA-REVIEW-001 | Applicable | Unverified | docs/WA_Standards_Compliance_Register.md:L168-L180; change/BinForm_Change_Verification.md:L1-L44; docs/WA_R16-75_T10_Offline_Test_Results_2026-11-15.md:L32-L53 — Process artifacts do not certify full functional/visual/security acceptance of current file. |


Report B contains the complete requirement, observation, explanation, severity/impact, related findings and required verification for each row. No Conforming label is awarded from source existence. Process checks proving the examination did not write source are reported separately from application compliance.

## 10. Evidence preservation and next gate

Relevant S6-005/008/018/033 remain as recorded; R15 app mutation/tracking and R16-75 parser/session histories remain bounded documentary evidence. No issue was closed, no register changed and no old PASS automatically reopened. Current source correction is acknowledged without treating old proposal labels as proof of current runtime behavior.

Report D details the two confirmed gaps and every unverified/legacy/dependency record. The recommended sequence is independent review, current Drive/hosted provenance and PWA dependency reconciliation, bounded formatting/accessibility scope approval, then targeted identity/session/mutation evidence before selecting any adapter or UX change. No revised BinForm or correction ZIP is included.

## 11. Methods, limitations and integrity

Permitted methods used: explicit file reads, numbered line inspection, read-only Git status/history/blob retrieval with --no-optional-locks, Python standard-library hash/HTML/CSV/text analysis, in-memory reverse-hunk reconstruction, and report/ZIP construction only under download/. No app modules, tests, builds, installers or database clients were executed; no dependencies installed, no cache created, no service or deployed device accessed.

Not established: exact current Drive/local/hosted equality, live schema/DB identity, actual response/cache headers, exhaustive downstream error safety, CDN success, browser/assistive-technology behavior, no cross-tab data pollution, no duplicate business records, full unsaved-form preservation, native compatibility or final Stage 6 acceptance.

The verification manifest pins scoped file hashes and report identities, initial Git state, original-tree aggregate and validation method. All five review files are packaged without application source, credentials, environment contents, tokens or private records. The final ZIP SHA-256 is supplied in completion; the manifest's own SHA-256 is recorded in the ZIP comment to avoid self-reference.

**Stop:** read-only examination complete; owner/ChatGPT independent review required. No source correction, certification, exception approval, register closure, installation or deployment is authorized.
