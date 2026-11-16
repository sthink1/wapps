# BsubscriptionForm - shared-function compliance review

Authority: explicit November 16 Batch 2 authorization with two refinements (reuse unchanged component evidence; observed phase timing or unresolved). Original remaining-58 assignment sections 5-15 governs. Eight Batch 2 files only, processed sequentially. No Batch 1 examination repeated.

Source: httpdocs/BsubscriptionForm.html. SHA-256: f1b8ae9c099978449edf4e2ba3f933a8075d34a9dc60ddb93be4620062914cb4. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:01:55.924929-05:00; saved completion observed 2026-11-16T09:01:55.926084-05:00. Original count 11. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SF01 | getToken / requireLogin / BASE_URL | 44-47;78 | A | Gate page and attach current stored token to requests | Credential/session lifetime and request origin common across WA | WA.session.restore; WA.api.request | Budget endpoints and localhost development-origin compatibility | High |
| SF02 | apiFetch response and exception contract | 47;55;57-58;61-62;75 | A | Parse errors and report failures | HTTP categories and flat/nested safe-message compatibility common | WA.api.json / WA.ApiError | Budget business messages and (be) suffix compatibility | High |
| SF03 | Shared free-text sanitization | 2-3;31;60-61 | C | Sanitize normal user text before save | Project-wide defense-in-depth input contract | DOMPurify; httpdocs/js/inputSanitizer.js | To/Description/PaymentAccount/Note field schema and validation | High |
| SF04 | escapeHtml / record and frequency-preview rendering | 50;57;68;75 | C | Render database/provider results and modal controls safely | Context-aware output safety common | Native textContent/value; no equivalent shared output encoder identified | Subscription columns, date/occurrence contracts and generated recurrence markup | High |
| SF05 | CRUD / reset / draft and message lifecycle | 55;57-63 | C | Submit one mutation and retain/manage editing state | No-replay and unsaved-form/failure behavior common | WA.api.request after contract-preserving migration | Subscription payload, roundUpAmount business rule, recurrence and selected record | High |
| SF06 | requestedId / startup/edit link / navigation | 51;63;78 | C | Validate query ID and open linked record | Safe URL parameter parsing and navigation common | URLSearchParams; no equivalent shared ID/navigation helper identified | Positive Subscription record ID, Budget destination | High |
| SF07 | Frequency builder and preview integration | 54;64-76 | C | Edit recurrence and request preview | Modal/server-preview integration and asynchronous state reusable | No equivalent shared recurrence UI identified; WA.api for transport only | All frequency rules, flags, date changes, recurrence schema and summaries | High |
| SF08 | Modal / row keyboard and focus behavior | 31-35;57;73;76 | C | Operate record selection and dialog accessibly | Keyboard/focus accessibility common across WA | No shared dialog/row-selection component identified | Frequency fields and row-to-subscription mapping | High |
| SF09 | moneyDisplay / formatting boundary | 48-49;57;60 | C | Format amount while preserving saved-value rules | Numeric display formatting reusable | Native Number/Intl; no shared formatter equivalent established | Integer display, Math.ceil save rule are Budget business decisions | High |
| SF10 | Service-worker registration | 52 | A | Register shared PWA worker | Cross-WA cache/version lifecycle | httpdocs/sw.js | Root worker scope and page availability | High |
| SF11 | Platform and tracker integration | 79-80 | A | Record session-aware page/time usage | Cross-WA usage lifecycle | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Subscription page path; independent business adapter remains local | High |

B-only exclusions: B-only: Subscription schema and CRUD semantics, auto-renew/active/estimated meaning, amount ceiling, recurrence date expansion and business validation remain local. Recurrence UI included only for generic integration/rendering/accessibility boundaries; no recurrence arithmetic audit. Broad CSS/formatting excluded.

## Candidate assessments

### SF01 - Approved Migration Pending

CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D08. 45-47 read token per call rather than fixed snapshot; 46 only checks token presence and 78 invokes it at startup. BASE_URL 44 routes localhost non-8080 hosting to port 8080; same-origin WA.api is not a drop-in replacement for that development path. Caller headers can override Authorization. Shared tracker does not replace business transport.

Local responsibility: Budget endpoints and localhost development-origin compatibility.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Session restoration/logout/account-switch and localhost origin contract. Deferred modernization: Measured transport/storage migration with owner-approved compatibility design.

### SF02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. 47 converts failure to plain Error after data.error || data.message; status/code are discarded and nested error object becomes [object Object]. Callers show e.message without 401/403/503 categories. JSON parse failure becomes null, including 2xx responses. Flat Budget error strings are accepted, but central/auth nested compatibility is not.

Local responsibility: Budget business messages and (be) suffix compatibility.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09/T10; S6-008/018/033. Outstanding verification: Nested/flat/type/non-JSON/204/status/abort cases; preserve suffix and business error details. Deferred modernization: None.

### SF03 - Conforming — source verified

CS-07/09; WA-FRONT-001. 2-3 load DOMPurify/shared sanitizer. Delegated capture submit/click and blur/change handle matching form text inputs/textarea before payload 60-61; payload trims values. Numeric/date/checkbox semantics preserved. Imported script is connected through its event listeners, not an explicit WASanitize call.

Local responsibility: To/Description/PaymentAccount/Note field schema and validation.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; R17. Outstanding verification: Actual normal submit/Enter, dynamically loaded values, external script failure. Deferred modernization: None.

### SF04 - Partially Conforming

CS-07/09; WA-FRONT-001. 50 encodes five metacharacters; record strings To/Description/PaymentAccount escaped at 57, values assigned through value/textContent elsewhere. DateBegin/DateEnd and preview Occurrences enter innerHTML without local escaping at 57/75; generator validates dates and produces occurrence array in budget.js 344-379/905-922, but current schema/serialized date shape and generator internals not exhaustively verified. Constant recurrence markup 68 does not interpolate arbitrary free text.

Local responsibility: Subscription columns, date/occurrence contracts and generated recurrence markup.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; no demonstrated XSS. Outstanding verification: Date-only producer/schema/serialization and occurrence output type before complete rendering-safety claim. Deferred modernization: Optional common Budget rendering contract; no universal plainText substitution.

### SF05 - Partially Conforming

CS-03/06; WA-SESSION-001, WA-DATA-001. 61/62 send each POST/PUT/DELETE once; resetForm runs only after apiFetch success, failed mutation catch leaves fields intact. editRecord 58 asynchronously overwrites form on response without response-version/dirty guard; actual late-response/account-switch effects not tested. Post-save loadRecords catches errors internally, so successful mutation message can replace refresh error; no claim server transaction failed.

Local responsibility: Subscription payload, roundUpAmount business rule, recurrence and selected record.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 T10; S6-008/018. Outstanding verification: Failed save/offline retains all drafts; late edit responses, double-submit and refresh-failure messaging. Deferred modernization: None.

### SF06 - Conforming — source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 51 rejects missing/empty/noninteger/nonpositive id; 78 avoids edit for invalid ID and uses parsed number in selector; 63 fixed budget.html navigation. Backend registerSource 407-418 scopes selected subscription to req.user.userId. No full authorization runtime acceptance inferred.

Local responsibility: Positive Subscription record ID, Budget destination.

Disposition: RETAIN; TEST FIRST. Stage 6: R14; S6-009. Outstanding verification: Record-not-found/cross-owner denial and large integer/schema limits. Deferred modernization: None.

### SF07 - Partially Conforming

CS-01/03/08; WA-PRESERVE-001, WA-SESSION-001, WA-SHARED-001. 64-76 keep recurrence schema/rules local; preview POST sent once at 75, result updates date and optional recurrence state, errors use textContent. Generic transport/messaging issues tracked SF02; no justified WA-wide recurrence replacement identified. Preview before Use can change form dates under explicit existing business rules.

Local responsibility: All frequency rules, flags, date changes, recurrence schema and summaries.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 T10 integration; domain calculation audit excluded. Outstanding verification: Concurrent previews, cancellation/date mutation and malformed/error response preserving unsaved fields. Deferred modernization: None.

### SF08 - Confirmed Nonconformance

CS-07; WA-FRONT-001. 32 close span is click-only (handler 76), no tabindex/key handler; 57 clickable record rows have no keyboard equivalent or keydown handler in full page. open/close 73 only toggles class, without focus management. Header table aria-hidden at 31 also removes column headings from accessibility tree of separate body table. Native Cancel still exists; no claim every operation is inaccessible.

Local responsibility: Frequency fields and row-to-subscription mapping.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Mandatory accessibility triage; preserve Stage 6 priority. Outstanding verification: Keyboard/focus/screen-reader severity and scope; row selection and modal regression. Deferred modernization: None.

### SF09 - Conforming — source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 48 rounds integer display; 49/60 Math.ceil is saved-value business behavior, not an interchangeable formatting helper. Preserve both; no generic currency modernization authorized.

Local responsibility: Integer display, Math.ceil save rule are Budget business decisions.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: Optional display-only formatter reuse after preserving integer/ceiling contract.

### SF10 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. 52 registers unchanged /sw.js. Reuse newly bounded shared worker analysis: missing local bday target remains in precache at 62, addAll 109; private Authorization/API paths bypass caching. No hosted install failure established.

Local responsibility: Root worker scope and page availability.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16; S6-024. Outstanding verification: Worker install/update/mixed assets and hosted target availability. Deferred modernization: None.

### SF11 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 79-80 load platform before tracker; unchanged hashes equal Batch 1. Tracker uses shared request/restore; all Subscription CRUD/preview use local apiFetch. No duplicate shared-module defect counted.

Local responsibility: Subscription page path; independent business adapter remains local.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding verification: Exact lifecycle/expiry/logout/BFCache and asset-version behavior on this page. Deferred modernization: None.

## Evidence reconciliation

After independent inventory and assessment, register S6-008/018, WA-CF-001/006 and later R16-75 evidence were reconciled. BinForm history used only to distinguish page-local adapter from shared-client T09, not to rediscover or repeat BinForm. Current Budget producer generated Subscription CRUD returns flat error/message strings and scopes UserID; central/auth errors remain distinct integration paths. Unchanged platform/tracker/sanitizer/worker SHA-256 reuse bounded evidence; no browser PASS or whole-Budget authorization certification inferred.

## Confirmed gaps and owner attention

Two confirmed candidate-level gaps: SF02 loses error categories and coerces nested error objects; SF08 contains pointer-only editing/close and missing accessible table heading linkage. Rendering producer types, late response/draft state and shared worker installation remain unverified. No demonstrated secret disclosure, XSS exploit or cross-user write. Keep mandatory safety/accessibility corrections separate from optional display-helper reuse; no source correction authorized.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch02 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
