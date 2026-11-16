# FTEmailVerification - shared-function compliance review

Authority: explicit November 16 Batch 5 authorization and five refinements: independent discovery and unchanged evidence reuse; privacy/navigation/auth/account/admin/email workflows; distinguish denied private access from bypass; commit-then-external outcome/no replay; consolidated causes, observed timing and proposed Master Register/R16-R20 mappings. Original remaining-58 assignment governs. Eight Batch 5 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTEmailVerification.html. SHA-256: c702f7c6b733269fd2ead234bc25ae46c24edf1a4d6c18bd521f8cea29547378. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:41:14.559948-05:00; saved completion observed 2026-11-16T10:41:14.560734-05:00. Original count 6. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E01 | Public email capability preview/confirm | httpdocs/FTEmailVerification.html:2-8 | C | Verify ownership through purpose-specific email link | WA public method/token authority separation | Native fetch; exact public server GET/POST bypass | Contact email ownership only | High |
| E02 | HTTP/error/disabled-state/no replay | httpdocs/FTEmailVerification.html:4-8 | C | Report invalid/failed/uncertain verification outcome | WA compatible HTTP/outcome/no replay contract | Raw response.json/textContent; no WA.api required | Valid flag and one confirmation | High |
| E03 | Stored-contact identity/expiry/one-use/commit contract | httpdocs/FTEmailVerification.html:5-8 | C | Confirm only current stored email contact under token | WA capability/DB/privacy authority | Existing contact verification issuer/GET/POST routes | Contact value/type matching, ownership verification | High |
| E04 | Token URL/cache/log/referrer/account boundary | httpdocs/FTEmailVerification.html:1-8 | A | Contain bearer capability exposure and audience | WA privacy/secret-free diagnostics/cache | Query token to same-origin relative path | Email link independent of logged-in user | High |
| E05 | Safe message/URL/input boundary | httpdocs/FTEmailVerification.html:2-8 | A | Display server messages safely and encode token path | WA safe DOM and credential handling | textContent/encodeURIComponent/hex validation | Verification display | High |
| E06 | Status/control accessibility | httpdocs/FTEmailVerification.html:1,4-8 | C | Announce readiness/invalid/outcome changes | WA accessible async statuses/focus | Named button and p#status | Email verification feedback | High |

B-only exclusions: B-only: contact-email ownership wording. No login/session restoration/tracker/free-text sanitizer requirement for public capability page; no privacy-code recovery/GO PRIVATE authority implied by email verification. No external action is issued by this page except verification HTTP.

## Candidate assessments

### E01 - Conforming — source verified

CS-04/08/09; WA-PRIV-001, WA-AUTH-001. HTML4-8 validates hex64, GET preview then explicit POST; server173-178 allows only exact GET/POST contact-email-verification hex64 public paths. No browser bearer/session requirement; no GO PRIVATE or arbitrary system permission granted by contact email ownership.

Local responsibility: Contact email ownership only.

Disposition: RETAIN public scope; TEST FIRST. Stage 6: R16 S6-017/019/029; R17. Outstanding verification: Wrong/missing/malformed/expired/reused/cross-purpose token; GET no mutation and POST only explicit intent. Deferred modernization: None.

### E02 - Partially Conforming

CS-03/05; WA-SESSION-001, WA-API-002. HTML6 enables button only r.ok AND d.valid, preserving preview HTTP check. POST8 displays server message without r.ok/category, keeps disabled on uncertainty and has catch; no automatic retry. Current server error/success strings provide distinguishable text, no source-proven non2xx success classification.

Local responsibility: Valid flag and one confirmation.

Disposition: TEST FIRST; MIGRATE LATER compatible error/outcome helper. Stage 6: R16 T10 capability-page only; S6-018/033. Outstanding verification: 400/404/500/nonJSON/network/ambiguous committed confirm and consumed-link recovery; no shared T09 claim. Deferred modernization: D04 gradual public-error interoperability.

### E03 - Conforming — source verified

CS-04/06/09; WA-PRIV-001, WA-PRIV-002, WA-DATA-001. Same-hash issuer5235-5247 validates stored email, supersedes previous, random32bytes/hash/24h. GET5268-5279 matches current contact Email/value/expiry/responded. POST5285-5299 locks capability row and rechecks current contact value/type/expiry/prior-use, commits VERIFIED only. No explicit external send after this confirmation commit (unlike issuance/save route); no invented postcommit mail failure. This verifies Contact email ownership, not D06 key recovery or full administrator privileges.

Local responsibility: Contact value/type matching, ownership verification.

Disposition: RETAIN bounded gates; TEST FIRST. Stage 6: R16 S6-017/019/029; R19 concurrency. Outstanding verification: Contact changed/deleted/unverified, duplicate confirm/expiry races/cross-purpose, transaction consistency and issuer mail-outcome covered P07. Deferred modernization: None.

### E04 - Unverified

CS-09/10; WA-PRIV-001, WA-LOG-001, WA-CACHE-001. Token stays in query/JS and enters encoded same-origin endpoint path. No console/storage/external assets in page, no explicit referrer/history cleanup/cache policy. Server/log/header/intermediary breadth not audited; do not claim actual leakage. Capability purpose independent of current logged-in account.

Local responsibility: Email link independent of logged-in user.

Disposition: TEST FIRST; OWNER DECISION exposure contract. Stage 6: R16 S6-017/019/030/024; R17; R20 cache/release. Outstanding verification: History/referrer/access logs/no-store/sensitive errors, shared browser/email link and account switch; no token values copied. Deferred modernization: None.

### E05 - Conforming — source verified

CS-07/09; WA-FRONT-001, WA-LOG-001. HTML5/8 encodeURIComponent token path,4 regex before preview;6/7/8 message/errors textContent. No HTML injection sink, free-text input/password or generic sanitizer need. Response message type/fallback remains compatibility test.

Local responsibility: Verification display.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-030; R17 DOM. Outstanding verification: Synthetic hostile/error shapes/invalidJSON and actual text display. Deferred modernization: None.

### E06 - Confirmed Nonconformance

CS-07; WA-FRONT-001. HTML1 p#status has no live/role;6-8 async enable/validity/error/confirmation text has no focus/announcement. Button has visible name, no modal needed.

Local responsibility: Email verification feedback.

Disposition: CORRECT accessible status/focus; TEST FIRST. Stage 6: R17 accessibility; owner scopes acceptance effect. Outstanding verification: Checking/ready/invalid/confirmed/uncertain announcements and keyboard. Deferred modernization: Optional shared status helper.

## Evidence reconciliation

Six original candidates frozen before selected-page register reconciliation; no additions. Unchanged contact verification evidence reused and confirmation path inspected for exact current use; no Batch4 Contact reexamination. Capability issuance/mail-send outcome is P07, not falsely attributed to this DB-only confirmation. Login/tracker absence is legitimate public contract. Preserve completed Stage6/FTPerson/Batches1-4; no new runtime PASS.

## Common causes and proposed Master Register relevance

E06 RC-ACCESS-STATUS. E01/E03 bounded source positives; E02 error/uncertain recovery partial, not another authenticated RC-HTTP defect by assumption. E04 RC-CAPABILITY-HYGIENE unverified. Proposed register keys only.

## Confirmed gaps and owner attention

One confirmed candidate: inaccessible async status. No source-confirmed verification bypass, postcommit mail exception or unsafe automatic replay. Capability/privacy/cache/identity boundaries retain specific unverified tests.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch05 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
