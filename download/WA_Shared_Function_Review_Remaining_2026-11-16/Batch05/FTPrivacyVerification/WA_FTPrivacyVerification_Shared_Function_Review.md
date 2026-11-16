# FTPrivacyVerification - shared-function compliance review

Authority: explicit November 16 Batch 5 authorization and five refinements: independent discovery and unchanged evidence reuse; privacy/navigation/auth/account/admin/email workflows; distinguish denied private access from bypass; commit-then-external outcome/no replay; consolidated causes, observed timing and proposed Master Register/R16-R20 mappings. Original remaining-58 assignment governs. Eight Batch 5 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTPrivacyVerification.html. SHA-256: f3b34b9f89ac138ae4af06c814df2fa6c43f8621d9d790f9b162e9ec860d9dee. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:39:38.382148-05:00; saved completion observed 2026-11-16T10:39:38.383052-05:00. Original count 6. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V01 | Public capability GET-preview/POST-decision contract | httpdocs/FTPrivacyVerification.html:2-5 | C | Preview request and approve/decline without browser account | WA public-link purpose/scope/authority | Native fetch; privacy publicRouter; no WA bearer required | Privacy approval decision | High |
| V02 | HTTP/error/pending/no replay lifecycle | httpdocs/FTPrivacyVerification.html:3-5 | C | Report preview/decision failures and uncertain outcome | WA compatible error/outcome/no replay | Direct fetch JSON and disabled controls | Valid flag/decision completion | High |
| V03 | Approval authorization and commit/external notification | httpdocs/FTPrivacyVerification.html:3-5 | C | Apply only verified-authority privacy change | WA capability/privacy/DB side effects/admin distinctions | Server private-request/public-approval routes | Verified primary contact and exact privacy setting | High |
| V04 | Capability URL/referrer/cache/identity boundaries | httpdocs/FTPrivacyVerification.html:1-4 | A | Limit token exposure/audience and account confusion | WA secret-free diagnostics/capability privacy | URLSearchParams and relative capability endpoint | Email-link token separate from web identity | High |
| V05 | Safe response DOM/input scope | httpdocs/FTPrivacyVerification.html:1-5 | A | Display server messages without HTML execution | WA safe text and secret input distinctions | textContent; no generic free-text form | Approval text and buttons | High |
| V06 | Async status/keyboard accessibility | httpdocs/FTPrivacyVerification.html:1,3-5 | C | Announce validity/action/outcome and focus control | WA focus/status/error accessibility | Local p#status and buttons | Privacy decision UX | High |

B-only exclusions: B-only: privacy-request action wording and setting semantics. No login/tracker/WA.api import is expected for this public email-capability page; no editable free text, sanitizer inapplicable. Do not treat D06 human code as random capability policy.

## Candidate assessments

### V01 - Conforming — source verified

CS-04/08/09; WA-PRIV-001, WA-PRIV-002, WA-AUTH-001. HTML2-5 extracts hex64 capability, GET preview then explicit POST decision; no browser bearer/storage/session restoration requirement. Server181 publicRouter intentionally mounted; no generic account auth needed. GET ftPrivacy93 only reads; POST94-102 mutation. Code is random email capability, not D06 human privacy key.

Local responsibility: Privacy approval decision.

Disposition: RETAIN public scope; TEST FIRST. Stage 6: R16 S6-017/019/029; R17. Outstanding verification: Missing/malformed/wrong/expired/reused tokens, GET no mutation, no cross-purpose token acceptance. Deferred modernization: None.

### V02 - Partially Conforming

CS-03/05/08; WA-SESSION-001, WA-API-002. HTML3/4 parses JSON and displays d.message with no r.ok/status retention; current server errors14-20 provide fixed/safe message and no valid flag, so GET error leaves buttons disabled. POST disables both before await and never auto-replays. Keeping disabled after uncertain delivery avoids blind retry; recovery requires explicit later read/review. No source proof non2xx shown as success.

Local responsibility: Valid flag/decision completion.

Disposition: TEST FIRST; MIGRATE LATER compatibility-safe outcome helper. Stage 6: R16 T10 capability-page only, S6-018/033. Outstanding verification: 403/409/500/nonJSON/network/lost response after commit, explicit consumed-state recovery; no WA.api/shared T09 claim. Deferred modernization: D04 gradual public-error interoperability.

### V03 - Conforming — source verified

CS-04/06/09; WA-PRIV-001, WA-PRIV-002, WA-DATA-001; D06. Same-hash request producer65-77 checks verified primary email54-59, random32bytes/hashed token/24h72. Public fetchRequest90-92 matches hash/current primary email/expiry/responded; POST95 lock,96-97 rechecks current verified email;100 privacy update,101 invalidates unlocks,102 consumes request in transaction24. notifyCreator50 catches external failure, so explicit postcommit notice does not ordinarily change committed success into500. No readable-code hashing/reset requirement invented. Full admin privacy-setting interface coverage separate.

Local responsibility: Verified primary contact and exact privacy setting.

Disposition: RETAIN gates/transactions; TEST FIRST delivery and capability matrix. Stage 6: R16 S6-017/009/029/030; R19 capability concurrency. Outstanding verification: Primary email change/unverify between GET/POST, duplicate decisions/expiry/rollback, no code disclosure, admin full privileges and notification failure recovery. Deferred modernization: None.

### V04 - Unverified

CS-09/10; WA-PRIV-001, WA-LOG-001, WA-CACHE-001. Token remains in location.search/JS memory and is appended to relative same-origin endpoint path. No console/storage writes or external asset requests in page. No explicit Referrer-Policy/history cleanup/cache policy in HTML; headers/loggers/intermediaries not completely audited. Capability ownership independent of current browser account, so switching account must not silently substitute bearer authority.

Local responsibility: Email-link token separate from web identity.

Disposition: TEST FIRST; OWNER DECISION token-exposure contract. Stage 6: R16 S6-017/019/030/024; R17; R20 cache/release. Outstanding verification: URL/history/referrer/access logs/no-store/error headers/token retention, account switch with same email link; no secret values collected. Deferred modernization: None.

### V05 - Conforming — source verified

CS-07/09; WA-FRONT-001, WA-LOG-001. HTML3/4 response/errors assigned textContent, no innerHTML or editable free-text. Token regex before preview; POST UI enabled only after valid response. Existing renderer does not log capability; does not establish server log hygiene.

Local responsibility: Approval text and buttons.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-030; R17 DOM. Outstanding verification: Synthetic HTML-like messages/invalidJSON and actual display; message type fallback interoperability unverified. Deferred modernization: None.

### V06 - Confirmed Nonconformance

CS-07; WA-FRONT-001. HTML1 p#status has no live/role;3/4 asynchronously enables controls/replaces outcomes without focus/announcement. Named buttons exist; no modal. Required validity/approval/failure feedback is not announced in source.

Local responsibility: Privacy decision UX.

Disposition: CORRECT accessible status/focus; TEST FIRST. Stage 6: R17 accessibility; owner scopes acceptance impact. Outstanding verification: Screen-reader checking/valid/expired/decision/uncertain state and keyboard focus. Deferred modernization: Optional shared status helper.

## Evidence reconciliation

Six independent candidates frozen before register reconciliation; zero additions. Reuse unchanged privacy producer/helper facts only after inspecting actual public-link composition and relevant new decision path. No login/tracker absence finding: public capability is legitimate specialized contract. Explicit contact-verification email failure in Batch4 differs from caught notifyCreator here. Preserve existing Stage6 results; no tests performed or statuses changed.

## Common causes and proposed Master Register relevance

V06 RC-ACCESS-STATUS confirmed. V01/V03 bounded static capability positives with remaining tests; V02 public error/pending distinctions partial (not automatically duplicate authenticated RC-HTTP finding); V04 RC-CAPABILITY-HYGIENE unverified. Proposed mappings only.

## Confirmed gaps and owner attention

One confirmed candidate: status accessibility. Capability checks/source commit-notice catch are bounded positives. No public/private access bypass or erroneous non2xx success proved; lost-response recovery/log/cache/referrer and full admin privileges remain unverified.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch05 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
