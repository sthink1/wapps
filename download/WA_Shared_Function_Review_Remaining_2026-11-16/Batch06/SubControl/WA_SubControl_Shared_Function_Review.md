# SubControl - Batch 6 shared-function review

Authority: November16 original remaining58 assignment, explicit Batch6 authorization/five refinements and resume instruction. Eight pages sequentially; no Batch7. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/SubControl.html; SHA-256 8827c2a7610fc60e933fe12e7aca1e10da831696f7dc9c2c8941412e3e2c3f17. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T13:49:37.7474833-05:00; original inventory completion 2026-11-16T13:50:27.443008-05:00. Frozen original count 10; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SC01 | Captured bearer/admin startup | httpdocs/SubControl.html:506-522,714-758,1206-1220 | C | Authenticate admin view and requests | WA current credential/session contracts | Local const token; no platform import | Admin page verification and pending-transfer fallback | High |
| SC02 | HTTP/error/JSON adapter | httpdocs/SubControl.html:530-546,702-758,1086-1093 | A | Preserve status/response/errors | WA type-safe transitional error contract | Local readJson/direct fetch | Admin domain fields | High |
| SC03 | Central admin/record authorization | httpdocs/SubControl.html:714-758,769-799,913-1063 | C | Protect promo/grants/user lookup server-side | WA administrator dual-gate/API contracts | Server admin guards; users/is-admin | Subscription grant/promo business rules | High |
| SC04 | Administrator transfer capability/password flow | httpdocs/SubControl.html:279-313,1076-1204 | C | Prepare/check/cancel/complete approved transfer | WA D02 bounded transfer/security/session rules | admin-management endpoints/sessionStorage capability | Manual configured-name transition and password | High |
| SC05 | Safe DOM/status/attribute rendering | httpdocs/SubControl.html:524-528,623-678,801-877,995-1008,1094-1120 | A | Render user/admin/subscription fields safely | WA untrusted output/secret hygiene | textContent/DOM nodes/value | Admin rows/status | High |
| SC06 | Text inputs/password preservation | httpdocs/SubControl.html:296-300,345-346,422,468,769-780,1123-1130 | C | Sanitize reusable text without altering password | WA frontend sanitizer/credential boundaries | No DOMPurify/inputSanitizer; local date formatting | Promo code/password/transfer secrets distinct | High |
| SC07 | Mutation pending/draft/committed outcomes | httpdocs/SubControl.html:769-799,913-970,1019-1063,1145-1204 | C | Prevent replay/duplicate intent and reconcile completed actions | WA no unsafe replay/unsaved forms | Direct explicit fetch; no retries | Grant/promo/transfer response state | High |
| SC08 | Identity/selection/response fencing | httpdocs/SubControl.html:506-510,975-1063,1076-1078,1132-1204 | A | Keep selection/capability/result bound to account | WA account-switch/late response safety | Local caches/sessionStorage; no listeners | Target user/proposed admin/current transfer | High |
| SC09 | Calendar-date display/input codec | httpdocs/SubControl.html:548-609,1066-1072 | C | Parse/display date-only grants without timezone drift | WA calendar data contract | UTC component roundtrip; local MMDDYYYY adapter | Subscription end-date semantics | High |
| SC10 | Status/control accessibility | httpdocs/SubControl.html:267,277-313,391,430,452,476,485,524-528 | C | Announce admin/forms/errors/status changes | WA accessible focus/status contract | Live initial verification; local statuses | Admin control feedback | High |

B-only exclusions: B-only: promo rules/better-plan economics, grant expiration policy and transfer business decisions. No platform/tracker or PWA business integration present; lack of telemetry is not automatically a source defect without admin-page mapping policy. No source changes/admin actions performed.

## Assessments

### SC01 - Partially Conforming

CS03/08; WA-SESSION-001, WA-AUTH-001. 506 captures bearer once;512 reuses it for all operations even if shared browser credential changes elsewhere. verifyAdmin gates initial body, pending-transfer path intentionally bounded; no silent restoration. Source capture confirmed, cross-account/expiry consequences unverified.

Local: Admin page verification and pending-transfer fallback. Disposition: TEST FIRST; MIGRATE LATER preserving D02 initiating-session binding. Stage6: R16 S6-005/007/008; R17. Outstanding verification: Credential rotation/account switch/expired JWT during manual transfer waiting; no blanket current-session substitution. Separate modernization: D08 compatible auth adoption.

### SC02 - Confirmed Nonconformance

CS03/05; WA-API-002. 530-546 retains status541 and catches invalid JSON, but539 uses data.error without type checks/nested message support; new Error coerces object. Supported transitional errors not preserved.

Local: Admin domain fields. Disposition: CORRECT typed parser; TEST FIRST preserve raw contract. Stage6: R16 T09 page-adapter only; S6-008/018/033. Outstanding verification: Flat/nested/string/message/nonJSON and403/503 typed feedback. Separate modernization: D04 gradual migration.

### SC03 - Conforming — source verified

CS04/06; WA-SEC-ADMIN-001, WA-API-001. users448-456 web-only central getAdministratorStatus; subscriptions21-29 authenticate plus isAdminUser central delegate and per-admin routes guards. Client hidden/disabled controls not relied on for authority. Current central flag/name policy unchanged.

Local: Subscription grant/promo business rules. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-009; R19. Outstanding verification: Flag0/former-name/wrong-user/web-native scope, all grant/promo mutations and economic invariants beyond bounded guard inspection. Separate modernization: None.

### SC04 - Conforming — source verified

CS03/04/06/09; WA-AUTH-001, WA-PRIV-001, WA-DATA-001; D02. Server adminManagement21 auth/webOnly; prepare38-72 Origin/central admin/password/row locks/random32bytes/hash/2h, binds initiating user and session. Pending81-83 verifies token/session/expiry; cancel99-116 restores configured initiator requirement; complete129-148 checks name transition/current actor/target/locks/audit and consumes capability. UI stores capability1076-1157, never URL/log, clears password; no unsafe auto replay. No Render/DB action performed.

Local: Manual configured-name transition and password. Disposition: RETAIN D02 boundaries; TEST FIRST. Stage6: R16 S6-009/019/030; R19 concurrency; R20 recovery. Outstanding verification: Wrong session/expired/consumed token, cancellation/complete race, lost commit response, rollback, manual transition recovery; no full test certification. Separate modernization: None.

### SC05 - Conforming — source verified

CS07/09; WA-FRONT-001, WA-LOG-001. 524/665/819/870/1007 textContent; user/promo/admin facts never raw HTML; fields value and DOMnodes. Password/capability not logged by page.

Local: Admin rows/status. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-030; R17 DOM. Outstanding verification: Synthetic hostile fields/error types and secret markers; server diagnostic breadth separate. Separate modernization: Optional safe status/DOM helper.

### SC06 - Confirmed Nonconformance

CS07/08/09; WA-FRONT-001. Promo text346 receives trim only775, no shared sanitizer import anywhere. Mandatory reusable free-text defense missing; passwords298 must remain byte-exact, including SHOW toggled text1127. Future sanitizer must explicitly exclude this credential by identity regardless type; no automatic blanket sanitizer recommendation.

Local: Promo code/password/transfer secrets distinct. Disposition: CORRECT promo sanitation only; preserve password and capability; TEST FIRST. Stage6: R17 input; R16 credential compatibility. Outstanding verification: Promo text/IME/typed date and unchanged password bytes before/after visibility toggle. Separate modernization: Optional common input adapter.

### SC07 - Partially Conforming

CS03/06; WA-SESSION-001, WA-DATA-001. Explicit mutations only, no retry. Promo closes editor793 then awaits reload794; failure shows ordinary error after committed success. Admin prepare/cancel/complete UI state may be uncertain on lost reply; server guards constrain replay, not excuse blind retries. Draft/pending buttons not generally fenced.

Local: Grant/promo/transfer response state. Disposition: TEST FIRST separate committed/reload/uncertain outcomes. Stage6: R16 T10/S6-018; R19. Outstanding verification: Lost reply/new draft/double-click, reload errors and capability recovery without automatic replay. Separate modernization: Optional pending/outcome helper.

### SC08 - Unverified

CS03/09; WA-SESSION-001. Cached selectedUser/proposedAdmin/pendingTransfer and async lookup993/1138 lack account/request generation checks. Stale lookup can replace new target selection; sessionStorage capability remains browser-session scoped but server binds user/session. No actual privilege bypass/incorrect grant demonstrated.

Local: Target user/proposed admin/current transfer. Disposition: TEST FIRST; OWNER DECISION. Stage6: R16 S6-007/027; R19. Outstanding verification: Overlapping lookup/new identity/session transfer, stale admin page presentation, no retained secret on logout. Separate modernization: None.

### SC09 - Conforming — source verified

CS06/08; WA-DATA-001. 571-608 parse allowlisted calendar formats and UTC component equality rejects impossible dates, returns date-only string; no instant timezone conversion. Local subscription-date rules remain domain-specific.

Local: Subscription end-date semantics. Disposition: RETAIN; TEST FIRST. Stage6: R17 calendar/browser. Outstanding verification: Leap/invalid/null/year limits and display/input roundtrip. Separate modernization: Optional date-only primitive only.

### SC10 - Confirmed Nonconformance

CS07; WA-FRONT-001. Initial267 has role/status/live (positive), password toggle labelled/pressed1129. Remaining async page/form/grant/transfer statuses277/307/391/430/452/476/485 no live/role/focus association; setStatus merely text/class. Errors outside initial verification not announced.

Local: Admin control feedback. Disposition: CORRECT accessible status/error focus; TEST FIRST. Stage6: R17 accessibility. Outstanding verification: Screen-reader async grant/admin/validation results and keyboard. Separate modernization: Optional status helper.

## Reconciliation/common causes

Ten independent candidates frozen before register reconciliation. Bounded guard and D02 server contract examined; full subscription economic logic/schema not audited. Client token capture not elevated to executed privilege failure. Approved D02 exception preserved; administrator transfer is different from FT record ownership transfer. M03 mandatory security disposition remains open and unchanged.

SC02 RC-HTTP-PARSER; SC06 RC-SAN-MISSING; SC10 RC-ACCESS-STATUS. SC08 identity/selection consequences unverified, D02 bounded positive.

## Findings and scope

Three confirmed candidates: error parser interoperability, missing promo free-text sanitation, status accessibility. No transfer/admin operation or test executed.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch06 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
