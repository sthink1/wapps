# home - Batch 6 shared-function review

Authority: November16 original remaining58 assignment, explicit Batch6 authorization/five refinements and resume instruction. Eight pages sequentially; no Batch7. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/home.html; SHA-256 2cbc6995c6db46514f0549e77b85fab9ab9a88ec90e525fcb2661c80418feb54. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T13:52:39.7903345-05:00; original inventory completion 2026-11-16T13:53:54.477679-05:00. Frozen original count 11; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H01 | Shared restore/offline/session status startup | httpdocs/home.html:773,1207-1269 | A | Restore verified browser session and fail closed on uncertainty | WA session/native boundary/offline policy | WA.session.restore and WA.api.json actually called | Home permission readiness/KMLI label | High |
| H02 | JWT user-display decoding | httpdocs/home.html:797-837,1417-1445 | A | Render current verified account name | WA auth vs unverified claims/presentation | Local JWT decoder; shared restore precedes use | User/KMLI presentation only | High |
| H03 | Administrator/subscription access presentation | httpdocs/home.html:840-869,1056-1173,1373-1413 | C | Show current entitlement/admin controls | WA central admin/server authorization | users/is-admin/subscriptions/status routes | Home app buttons and server authority distinct | High |
| H04 | Direct HTTP/error adapters | httpdocs/home.html:848-867,1073-1090,1160-1172,1176-1204 | C | Retain failures and uncertainty vs denial | WA status/error/no replay contract | Mixed raw fetch and shared session API | Permissions/app usage response fields | High |
| H05 | Logout/revocation uncertainty lifecycle | httpdocs/home.html:1447-1471 | A | Perform logout and report server revocation truthfully | WA logout/session contract | WA.session.logout actual delegate | Home navigation/logout button lifecycle | High |
| H06 | Custom page/time telemetry lifecycle | httpdocs/home.html:1474-1587 | A | Record visit/time with current identity and delivery semantics | WA shared tracking/current-token/no replay | Legacy explicit POST/unload listener; no usageTracking import | Home page attribution | High |
| H07 | Account/async permission/response fencing | httpdocs/home.html:1056-1173,1225-1247,1373-1380,1417-1587 | A | Prevent old results removing/reviving identity/UI | WA account switch/late response safety | Local flags/const token and raw callbacks | Home user/subscription/admin state | High |
| H08 | Navigation/app-open/FT entry handoff | httpdocs/home.html:449-670,1014-1024,1176-1204,1298-1370 | C | Navigate authorized apps after usage event | WA safe navigation/specialized flow | Fixed data destinations/direct usage POST | FT instructions/menu choice; no privacy token here | High |
| H09 | Description cache/safe DOM output | httpdocs/home.html:794,872-903,931-1000,1090-1159 | C | Load local static HTML descriptions/render text safely | WA source trust/output boundary | DOMParser/local same-origin app-description/static innerHTML; textContent | Rich descriptions from maintained pages | High |
| H10 | Dialog/nav/status accessibility | httpdocs/home.html:434-442,675-757,872-910,1002-1054 | C | Provide keyboard focus/dialog/feedback semantics | WA frontend accessibility | Local modal classes/Escape/FT initial focus | Home three modals/status/nav | High |
| H11 | PWA/cache/diagnostics integration | httpdocs/home.html:9-10,775-786,828-830,991-998,1503-1582 | A | Register assets and emit bounded diagnostics | WA cache/secret-free diagnostics | sw.js; shared platform; raw console callbacks | Home deployment/lifecycle | High |

B-only exclusions: B-only: app catalog/marketing descriptions/entitlement labels/FT start choice. No editable free-text or financial forms here. No destination page examination repeated; app-description source trust checked only at integration boundary. No FamilyTree token/private-record path exposed by Home.

## Assessments

### H01 - Conforming — source verified

CS03/08; WA-SESSION-001, WA-AUTH-001. 773 loads platform;1225 awaits restore,1240 actual WA.api.json session-status,1230 distinguishes network/server/unavailable/offline from known signed-out. Access defaults disabled; shared fail-closed semantics reused.

Local: Home permission readiness/KMLI label. Disposition: RETAIN; TEST FIRST. Stage6: R16 T09 actual shared session-status consumer; R17. Outstanding verification: Real browser error display/restore/noLocks/offline and fresh/revoked state; no repeat accepted bounded tests. Separate modernization: D08 architecture pending.

### H02 - Conforming — source verified

CS03/07/09; WA-AUTH-001, WA-FRONT-001. 797 decodes JWT for display only after verified restore flag;1432 textContent username/KMLI; admin comes server endpoint840, not decoded claim. No token-object console log in this decoder path (only caught exception829).

Local: User/KMLI presentation only. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-030/037; R17. Outstanding verification: Malformed JWT/presentation/safe console markers; preserve bounded S6-037 closed result. Separate modernization: None.

### H03 - Conforming — source verified

CS04/08; WA-SEC-ADMIN-001, WA-API-001. 840 checks server is-admin; actual users route web/central dual gate. subscriptions status uses server isAdminUser, app gate UI1132. Hidden/disabled buttons are presentation only; downstream server checks remain authority.

Local: Home app buttons and server authority distinct. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-009; R17. Outstanding verification: Flag0/former-name/subscription denials, current permissions after account change; full endpoint audit excluded. Separate modernization: None.

### H04 - Confirmed Nonconformance

CS03/05; WA-SESSION-001, WA-API-002. Raw permission requests retain no typed error metadata: loadSubscription1082-1087 collapses statuses to generic Error, catches network and5xx together; isUserAdmin returns false on every failure; recordAppOpen ignores non-ok status1184-1198. Shared restore does not fix local failure categories.

Local: Permissions/app usage response fields. Disposition: CORRECT typed uncertain-vs-denied outcome; TEST FIRST preserve fail-closed. Stage6: R16 S6-008/018/033. Outstanding verification: 401/403/503/network/nonJSON/cancel/business vs session shared-client display. Separate modernization: D04 compatible request migration.

### H05 - Partially Conforming

CS03/08; WA-SESSION-001. 1455 actual WA.session.logout;1456-1459 accurately distinguishes confirmed server revocation;finally enables. Listener installed inside initial token branch1427/1447, no signed-out/cross-tab late listener update; maps existing S6-001 without inventing regression.

Local: Home navigation/logout button lifecycle. Disposition: RETAIN truthful revocation; TEST FIRST lifecycle. Stage6: R16 S6-001/004/020; R17. Outstanding verification: Expired/offline/late restore/new-account button lifecycle; shared logout unexpected throw feedback. Separate modernization: Optional lifecycle wiring.

### H06 - Confirmed Nonconformance

CS03/08/09; WA-SESSION-001, WA-SHARED-001. 1417 captures initial token;1519 unload closure sends that captured credential1556 plus redundant JSONtoken1540 rather than reading current identity at send. No logout/session listener clears it. Mandatory current-session tracking contract violated in source; no actual cross-account log/exfiltration asserted. Duration uses full wall until unload and fetch lacks keepalive, so exact/loss behavior unverified.

Local: Home page attribution. Disposition: CORRECT current-session telemetry lifecycle/no replay; TEST FIRST. Stage6: R16 S6-025/007/030; R17; R20 assets. Outstanding verification: Account switch/logout/expiry before unload, BFCache/background/exact counts/uncertain delivery; no secret logging claims from body alone. Separate modernization: Compatible shared tracker migration with tests.

### H07 - Unverified

CS03/09; WA-SESSION-001. 1085 late subscription401 unconditionally removes current token; raw subscription/admin callbacks update flags/buttons without identity-generation checks or storage listener. Shared restore protections alone do not fence old UI responses. Actual session resurrection/incorrect authority not demonstrated.

Local: Home user/subscription/admin state. Disposition: TEST FIRST; OWNER DECISION. Stage6: R16 S6-007/027; R19. Outstanding verification: Delayed old401/new login, late permission results/logout and stale username/BFCache. Separate modernization: None.

### H08 - Partially Conforming

CS01/03/08; WA-SESSION-001, WA-SHARED-001. Fixed data destinations;1319 awaits app-open POST before navigation, no retry/status-check/deadline. FT choice1014 explicit instructions/menu with fixed destinations and no Person capability: no existing FP04/M03 code reexamined.

Local: FT instructions/menu choice; no privacy token here. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-005/025; R17. Outstanding verification: Hung/failed usage POST must not misrepresent app access, popup/FT entry and route case, no destination audits repeated. Separate modernization: Optional navigation/telemetry boundary.

### H09 - Partially Conforming

CS07/09; WA-FRONT-001. 893/1100 user/server messages textContent;931 fetches static same-origin declared page .app-description, DOMParser then copies source HTML989. Trust is maintained static page markup, not user/API text; no known untrusted injection alleged. Cache/request lacks ordering guard, prior description can replace newer title.

Local: Rich descriptions from maintained pages. Disposition: RETAIN documented trust; TEST FIRST. Stage6: R17 DOM; R16 S6-030. Outstanding verification: Static source allowlist/provenance/CSP/error descriptions/overlapping modals; no unnecessary sanitizer for rich trusted docs. Separate modernization: Optional description load contract.

### H10 - Confirmed Nonconformance

CS07; WA-FRONT-001. 435-437 anchor-wrapped buttons; accessDenied676 lacks dialog semantics; info/FT roles present but no focus trap/return. FT initial focus1016 and Escape1048 positive, no full completion. User/subscription status441-442 no live/error announcements.

Local: Home three modals/status/nav. Disposition: CORRECT scoped semantic/focus/errors; TEST FIRST. Stage6: R17 accessibility. Outstanding verification: Tab/reader/three modals/focus return/status/nested controls. Separate modernization: Optional shared dialog/status service.

### H11 - Partially Conforming

CS09/10; WA-CACHE-001, WA-LOG-001. 775 registers same SW; source console1543 outputs only page/duration, not token field; route track log response fixed message.1575 logs raw response, exceptions/raw paths require markers but no credential disclosure established from inspected response. Historical token logging not assumed current.

Local: Home deployment/lifecycle. Disposition: RETAIN safe subsets; TEST FIRST diagnostics/assets. Stage6: R16 S6-024/030; R17; R20. Outstanding verification: Secret markers/runtime diagnostics, mixed platform/HTML/SW, no blanket release certification. Separate modernization: Asset/diagnostic policy.

## Reconciliation/common causes

Eleven independent candidates frozen before selected-page prior register reconciliation. Existing WA-CF-008 mixed adoption and S6-001 listener issue linked; preserved R10/R14/R15/S6-037 bounded tests not reopened. Actual shared calls distinguished from raw fetch and legacy unload telemetry. M03 mandatory security disposition preserved, no source modification/re-audit.

H04 RC-HTTP; H06 B06-TRACK-CAPTURED-TOKEN; H10 RC-ACCESS. H07 account-race consequences and H09 description ordering unverified. Shared restore/logout bounded positives.

## Findings and scope

Three confirmed candidates: local failure contract, captured-token unload tracking, accessibility. No executed exploit, new token-console leak claim, or overall admin/session certification.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch06 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
