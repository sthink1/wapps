# Activities - Batch 6 shared-function review

Authority: November16 original remaining58 assignment, explicit Batch6 authorization/five refinements and resume instruction. Eight pages sequentially; no Batch7. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/Activities.html; SHA-256 1aab675b9fed480976c1acf9f0c2cdb3feda1ff575152acf6cb6a2f7a41e52d7. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T10:52:48.2421617-05:00; original inventory completion 2026-11-16T10:53:40.262904-05:00. Frozen original count 10; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A01 | Current-token startup and session lifecycle | httpdocs/Activities.html:283-310,353,637-647 | A | Authorize startup/API requests and handle lost credential | WA restoration/current identity contract | makeAuthenticatedRequest; WA.session loaded later | Activity initial list/load state | High |
| A02 | Authenticated HTTP/error/204 contract | httpdocs/Activities.html:284-310,318-350,431-445,493-507,619-634 | C | Parse responses and report typed failures | WA status/error/unsafe replay contract | WA.api related but not business delegate | 204 success and activity-domain messages | High |
| A03 | User-owned activity authorization | httpdocs/Activities.html:465-475,493-495,520-525,593-598,619-622 | C | Read/change/delete only permitted records | WA endpoint/user ownership/subscription gates | Server middleware/activities routes related | Activity/Weights reference integrity | High |
| A04 | Safe rows/text/field output | httpdocs/Activities.html:269-273,333-349,475,568-579,595-598 | C | Render server activity names/IDs/counts safely | WA context-sensitive DOM safety | Local escapeHtml/textContent/value | Activity rows and in-use counts | High |
| A05 | Shared free-text sanitization | httpdocs/Activities.html:13-14,162-165,248-253,420-452,605-622 | C | Sanitize text inputs before submits | WA common free-text defense | DOMPurify/inputSanitizer | Activity name/50-character semantics | High |
| A06 | Draft/pending/destructive mutation lifecycle | httpdocs/Activities.html:415-445,454-545,583-634 | C | Preserve input/confirm delete/no replay | WA uncertain mutation and unsaved state | Local form/catch/confirm flows | In-use activity deletion/Weight effects | High |
| A07 | Async identity and response ordering | httpdocs/Activities.html:285-309,312-350,465-545,593-634 | A | Keep responses/token removal aligned with identity | WA logout/account-switch/late-response safety | Shared session related; local promises | Activity list/edit/delete context | High |
| A08 | Modal/field/status accessibility | httpdocs/Activities.html:158-255,374-405,420-445 | C | Operate six modal dialogs and validation feedback | WA keyboard/focus/labels/error announcements | Local modal DOM/events | Activity actions and confirmation wording | High |
| A09 | Service worker/shared tracking/assets | httpdocs/Activities.html:9-14,275-281,646-647 | A | Register PWA and record visit/time using shared code | WA session/tracking/cache compatibility | sw.js; waPlatform; usageTracking; confetti | Activities attribution and local success decoration | High |
| A10 | Diagnostics/success-notification boundary | httpdocs/Activities.html:278-279,347-349,435-445 | C | Report errors and decorate successful save without secrets | WA bounded secret-free logs/external effects | confetti.js/triggerConfetti and console | Activity saved state and success alert | High |

B-only exclusions: B-only: activity sorting/in-use choice, Activity-Weights relationship business policy, confetti appearance. CSS bodies skipped as outside functional audit; all functional markup/scripts read. No DB/service/test execution.

## Assessments

### A01 - Partially Conforming

CS03/08; WA-SESSION-001. 285 reads token per send; initial fetch353 precedes guard637/platform646. Missing token throws synchronously before startup listeners, no shared restore awaited.

Local: Activity initial list/load state. Disposition: TEST FIRST; MIGRATE LATER. Stage6: R16 S6-005/008; R17. Outstanding verification: Cookie-only/expired startup and synchronous failure guidance. Separate modernization: D08/compatible startup.

### A02 - Confirmed Nonconformance

CS03/05; WA-SESSION-001, WA-API-002. 297 recognizes401/removes token; other statuses301-303 lose category/code in plain Error(errorData.error), nested objects can coerce; 204 handled305-307.

Local: 204 success and activity-domain messages. Disposition: CORRECT; TEST FIRST preserve204. Stage6: R16 S6-008/018/033; T09 page-only. Outstanding verification: 401/403/503/network/cancel/flat/nested/nonJSON. Separate modernization: D04 gradual envelopes.

### A03 - Conforming — source verified

CS04/06; WA-API-001, WA-DATA-001. Current activities route14/58/82/124/167/183/209/217 scopes queries by req.user.userId; mounted server164-166 auth/app entitlement; ownership checked before mutation. No cross-user bypass found in bounded checks.

Local: Activity/Weights reference integrity. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-009; R19 data. Outstanding verification: Wrong user/IDs, in-use FK/delete rollback/concurrency and no side-effects; DB schema unqueried. Separate modernization: None.

### A04 - Partially Conforming

CS07/09; WA-FRONT-001. 269 escapes names/errorHTML;475/595 textContent,596 value. Raw numeric IDs335/571 and count573 rely DB numeric contract; no demonstrated injection.

Local: Activity rows and in-use counts. Disposition: RETAIN; TEST FIRST. Stage6: R17 DOM; R16 S6-030. Outstanding verification: Hostile name/ID/count output and DOM. Separate modernization: Optional escaping helper.

### A05 - Partially Conforming

CS07/08; WA-FRONT-001. 13-14 shared sanitizer before static text forms; capture submit covers name163/edit251; numeric/date excluded.

Local: Activity name/50-character semantics. Disposition: RETAIN; TEST FIRST. Stage6: R17 input. Outstanding verification: CDN failure/IME/50-char/value preservation. Separate modernization: Optional field adapter.

### A06 - Partially Conforming

CS03/06; WA-SESSION-001, WA-DATA-001. 431/493/523/619 explicit mutations with catch retain draft until success; no auto replay. No pending guard. Delete backend responds204 inside withTransaction callback before helper commit; commit/response ordering needs specific follow-up, not inferred executed loss.

Local: In-use activity deletion/Weight effects. Disposition: RETAIN no replay; TEST FIRST. Stage6: R16 T10/S6-018; R19. Outstanding verification: Ambiguous delivery/double-click/new draft vs late success; transaction completion and in-use delete integrity. Separate modernization: Optional pending helper.

### A07 - Unverified

CS03/09; WA-SESSION-001. 298 unconditionally removes current token on any delayed401; list/edit/delete promises have no identity fence. Runtime earlier-account response clearing new token not executed.

Local: Activity list/edit/delete context. Disposition: TEST FIRST; OWNER DECISION. Stage6: R16 S6-007/027; R19. Outstanding verification: Late401 after new login, overlapping reads/edit responses/BFCache. Separate modernization: None.

### A08 - Confirmed Nonconformance

CS07; WA-FRONT-001. Six overlays158-255 lack dialog semantics/focus trap/return/Escape; close spans160 etc click-only; add field163 placeholder only; errors not live/associated.

Local: Activity actions and confirmation wording. Disposition: CORRECT; TEST FIRST. Stage6: R17 accessibility. Outstanding verification: Keyboard/reader labels/modal/error/focus. Separate modernization: Optional dialog/status service.

### A09 - Partially Conforming

CS03/08/10; WA-SHARED-001, WA-CACHE-001. 275 registers unchanged SW;646 platform647 tracker actual shared telemetry, business calls direct. Shared evidence hash-verified.

Local: Activities attribution and local success decoration. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Tracking exact counts/expiry/logout and mixed assets/SW update. Separate modernization: D08/asset policy.

### A10 - Partially Conforming

CS05/09; WA-LOG-001, WA-DATA-001. 348 logs raw Error;279 SW exception logged. No explicit credential value logged on observed path, sensitivity not proved. confetti.js checks missing library then returns; successful save decoration can throw if library implementation fails, leading catch after commit.

Local: Activity saved state and success alert. Disposition: TEST FIRST diagnostic/committed-vs-decoration boundary. Stage6: R16 S6-030/018; R17. Outstanding verification: Synthetic secret markers/safe diagnostics, missing CDN/runtime confetti after save; no live failures claimed. Separate modernization: Optional bounded diagnostics.

## Reconciliation/common causes

Original Activities discovery and ten-candidate JSON retained from10:53:40 before interruption. No re-discovery/replacement. Reused recorded source reads and completed missing narrow delete/authority assessment after resumption. Same shared hashes compared to prior batch evidence. No selected-page prior inventory used as discovery checklist. M03 remains mandatory security disposition.

A02 RC-HTTP; A08 RC-ACCESS. A07 RC-IDENTITY unverified; A06 transaction/outcome test gap, not extra confirmed candidate.

## Findings and scope

Two confirmed candidates: failure contract and accessibility. Runtime account-switch, transaction/side-effect consequences unverified. No app tests.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch06 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
