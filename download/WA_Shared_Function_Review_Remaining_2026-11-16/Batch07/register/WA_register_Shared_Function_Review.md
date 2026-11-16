# register - Batch 7 shared-function review

Authority: November16 original remaining58 assignment, explicit final Batch7 authorization and final-batch requirements. Eleven pages sequentially; stop after Batch7 and separately authorized reconciliation. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/register.html; SHA-256 ca1dba27484c13d04c85e23e0296eec4828ebff1184a923b9a1295799c889283. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T14:09:37.1891673-05:00; original inventory completion 2026-11-16T14:10:10.773949-05:00. Frozen original count 9; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RG01 | Password bytes/visibility/sanitizer composition | httpdocs/register.html:11-12,151-185,266-278,308-309,387-395 | A | Preserve exact entered passwords through submit | WA password-byte/credential boundaries | Loaded generic sanitizer plus shown password controls | Password confirmation/length local | High |
| RG02 | Reusable text/typed data validation | httpdocs/register.html:11-12,147-198,285-302,307-368 | C | Sanitize ordinary registration fields and validate typed data | WA shared free-text/backend-validation contract | DOMPurify/inputSanitizer; local email/phone validators | Username/contact/consent fields | High |
| RG03 | HTTP/error response adapter | httpdocs/register.html:382-423 | A | Preserve status/error categories/interoperability | WA API/no replay/error contract | Direct fetch/JSON/Error | Exact registration success message | High |
| RG04 | Server registration/consent/side effects | httpdocs/register.html:200-244,382-408 | C | Create account/consents safely without assuming current login | WA auth/data/privacy/external-action rules | users/register server route | Consent version/trial/account allocation | High |
| RG05 | Mutation pending/draft/commit-outcome lifecycle | httpdocs/register.html:304-424 | A | Prevent replay/duplicate intent and report committed outcome | WA no automatic replay/unsaved form safety | Explicit POST promise; no pending guard | Registration/login redirect/confetti | High |
| RG06 | Account/late-response/session continuity | httpdocs/register.html:382-423 | A | Keep existing remembered session intact on failed action | WA D09 supersession/async identity | No browser token mutation in page | New registration vs existing browser account | High |
| RG07 | Input/error accessibility | httpdocs/register.html:147-198,250,266-302,371-423 | A | Label fields and announce all errors/success | WA accessible labels/status/focus | Labels/email live warning/password aria states | Registration feedback | High |
| RG08 | Safe DOM/links output | httpdocs/register.html:235-237,319,371-423 | A | Display errors/consent links without executing input | WA context-safe rendering/navigation | DOM nodes/textContent; static legal links | Terms/privacy presentation | High |
| RG09 | PWA/assets/diagnostics | httpdocs/register.html:8-12,254-260,408 | A | Register SW and handle dependencies safely | WA cache/browser/secret-free logs | sw.js; confetti; sanitizer; no session tracker | Registration assets | High |

B-only exclusions: B-only: username/phone format, password length, consent copy and trial business policy. Typed email/secret fields distinct from reusable text. No login or registration action executed, no completed login examination repeated.

## Assessments

### RG01 - Confirmed Nonconformance

CS-03/07/09; WA-AUTH-001, WA-FRONT-001. 308-309 trims password+confirmation before POST, contrary byte preservation. Additional actual composition: SHOW271 changes secret to type=text; unchanged inputSanitizer selectors14-22/36-44 and capture click/submit65-79 then sanitize shown secrets (including HIDE click). HTML-like password bytes may be stripped. One candidate/two subfindings; no credential operation executed.

Local: Password confirmation/length local. Disposition: CORRECT mandatory credential-byte handling/secret exclusions; OWNER DECISION; TEST FIRST. Stage6: R16 auth/input compatibility; R17 passwords; independent security review. Outstanding verification: Spaces/Unicode/markup-like secrets hidden/shown/HIDE/submit/Enter/password managers, login compatibility; no actual password data used. Separate modernization: None - mandatory byte-fidelity correction.

### RG02 - Partially Conforming

CS-07/08; WA-FRONT-001. 11-12 sanitizer loaded and covers ordinary username/phone/email; typed email validation285 and explicit optional consent controls. Capture handler text defense present, but credential exclusion fails when shown as RG01.

Local: Username/contact/consent fields. Disposition: RETAIN ordinary-text defense; TEST FIRST separate secret contract. Stage6: R17 input. Outstanding verification: IME/phone/email/username/required flags/CDN availability; backend validation independent. Separate modernization: Optional field adapters.

### RG03 - Partially Conforming

CS-03/05; WA-API-002. 398 checks HTTP ok,401 throws plain Error(errorData.error||message), loses status/type/cause and nested compatibility; success exact known message407 then redirect. Current server flat safe error contract, no source false-success classification established.

Local: Exact registration success message. Disposition: TEST FIRST compatible parser/outcome; MIGRATE LATER. Stage6: R16 S6-018/033; T09 page-only. Outstanding verification: 400 duplicate vs500/network/nonJSON/nested/cancel and safe error text. Separate modernization: D04 incremental public error support.

### RG04 - Conforming — source verified

CS-03/04/06/09; WA-AUTH-001, WA-DATA-001. Server register validation/transaction (users57-196), case-insensitive duplicate user/email checks, bcrypt119, preferences/consent/version agreements, UserSecurity initial version184 then commit185. Registration creates no final login/JWT187-189. No explicit postcommit mail send in inspected register chain.

Local: Consent version/trial/account allocation. Disposition: RETAIN gates/consents; TEST FIRST. Stage6: R16 S6-009/022/029/030; R19. Outstanding verification: Concurrency/uniqueness/consent versions/rollback/trial policy and no unexpected session supersession; current schema unqueried. Separate modernization: None.

### RG05 - Partially Conforming

CS-03/06; WA-SESSION-001. One explicit POST, no auto replay, but submit not disabled; success triggers confetti then redirect. Decoration could throw after committed registration and report error, repeated explicit submit/duplicate user recovery not tested. Values retained on failure.

Local: Registration/login redirect/confetti. Disposition: TEST FIRST pending/uncertain outcome without replay. Stage6: R16 T10 page-only; S6-018; R19. Outstanding verification: Lost201/double click/postcommit decoration/redirect and preserved draft. Separate modernization: Optional pending/outcome helper.

### RG06 - Conforming — source verified

CS-03/09; WA-SESSION-001; D09. Page never writes/removes browser bearer/refresh state; server register no login/cookie supersession. Failed registration does not explicitly revoke existing remembered session in this path. Later login email verification is outside scope, no repeat initial login examination.

Local: New registration vs existing browser account. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-007/021; R17. Outstanding verification: Existing valid browser session with failed/successful new registration, late redirect/account intent. Separate modernization: None.

### RG07 - Confirmed Nonconformance

CS-07; WA-FRONT-001. Labels and show aria-pressed present; email warning192 live/described/invalid291 positive. General error container250 lacks live/role/association/focus,371-423 appends async error list without announcement, so other validation/server errors not announced.

Local: Registration feedback. Disposition: CORRECT accessible general feedback; TEST FIRST. Stage6: R17 accessibility. Outstanding verification: Non-email validation/server error/redirect announcement/keyboard and secret visibility. Separate modernization: Optional status/error focus helper.

### RG08 - Conforming — source verified

CS-07/09; WA-FRONT-001. 319 clears HTML only;371-378 and418-422 creates textContent li, no raw servererror HTML;235-237 fixed legal links relnoopener.

Local: Terms/privacy presentation. Disposition: RETAIN; TEST FIRST. Stage6: R17 DOM. Outstanding verification: Hostile error/field values, consent links and no unsafe HTML. Separate modernization: None.

### RG09 - Partially Conforming

CS-09/10; WA-CACHE-001, WA-LOG-001. 254 registers same SW; no credential values logged in page. Confetti helper handles missing library but provider errors/asset version lifecycle not certified. Shared sanitizer hash unchanged; new shown-password behavior specifically rechecked to resolve new integration.

Local: Registration assets. Disposition: RETAIN bounded evidence; TEST FIRST. Stage6: R16 S6-024/030; R17; R20. Outstanding verification: Mixed SW/CDN/cache/CSP and synthetic secret markers; no module execution. Separate modernization: Asset/dependency policy.

## Reconciliation/common causes

Nine candidates frozen before prior/register reconciliation. Same sanitizer hash retained; new password visibility/capture behavior investigated for this page, not a repeated blanket component audit. Exact server registration/consent commit inspected; existing initial login examination/tests not repeated. M03 mandatory and Batch6 exceptions preserved.

RG01 B07-PASSWORD-BYTES has trim and type-based shared-sanitizer secret exposure subfindings under one candidate. RG07 RC-ACCESS-STATUS. RG03 compatibility partial, not automatically another authenticated HTTP defect.

## Findings and scope

Two confirmed candidates: mandatory password byte preservation and general error accessibility. Conditional input mutation is source-confirmed; no account compromise or executed password test claimed.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch07 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
