# subscription - Batch 7 shared-function review

Authority: November16 original remaining58 assignment, explicit final Batch7 authorization and final-batch requirements. Eleven pages sequentially; stop after Batch7 and separately authorized reconciliation. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/subscription.html; SHA-256 927f1de6a867b4ad2f9c9596c174c0b2d1c34df5b982121549265a77908566ec. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T14:11:31.5617994-05:00; original inventory completion 2026-11-16T14:12:09.651552-05:00. Frozen original count 8; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SU01 | Captured bearer/status startup | httpdocs/subscription.html:438,450-479,521 | A | Load current subscription under authenticated session | WA restore/current identity contract | Raw fetch/local token; no WA.session | Current access panel | High |
| SU02 | HTTP/error/denial parsing | httpdocs/subscription.html:457-478,495-513 | A | Retain failure categories/domain metadata | WA API/session/error contracts | Local JSON/Error branches | Promo redemption messages | High |
| SU03 | Server entitlement/promo authorization | httpdocs/subscription.html:450-475,495-510 | C | Restrict status/redemption to current account | WA API/ownership/admin/DB contract | subscriptions routes/service | Plan/uses/redemption business rules | High |
| SU04 | Promo text sanitation | httpdocs/subscription.html:289,482-501 | C | Sanitize reusable free text before submit | WA shared text defense | No DOMPurify/inputSanitizer; trim only | Promo syntax local | High |
| SU05 | Mutation pending/unsaved/outcome | httpdocs/subscription.html:482-515 | A | Submit once and retain failures without replay | WA no replay/draft/uncertain commit | Explicit POST; no pending guard | Cleared code/refresh current plan | High |
| SU06 | Account switch/late-response isolation | httpdocs/subscription.html:438,458-475,499-510 | A | Fence stale credential/401/UI updates | WA identity/session safety | Captured token; no storage/request generation | Subscription data/promo target account | High |
| SU07 | Safe text/accessibility/navigation | httpdocs/subscription.html:262,268-292,472-478,507-518 | A | Display access/errors safely and name controls | WA safe DOM/live feedback | textContent/aria-labelled input/live message | Plan presentation/Home | High |
| SU08 | Sensitive cache/assets/diagnostic scope | httpdocs/subscription.html:8-9,457-458,495-504 | A | Protect account data/API/error cache | WA privacy/cache/log/asset contract | Manifest/assets; direct requests | Subscription UI | High |

B-only exclusions: B-only: development trial/plan hierarchy/promotional economics/future price placeholders. No live financial recommendation or pricing certification. No actual payment provider/mutation beyond promo exists; no new payment behavior proposed.

## Assessments

### SU01 - Partially Conforming

CS-03/09; WA-SESSION-001; D08. 438 snapshots bearer;451 missing token redirects;457 calls raw fetch without WA.session restoration. Phased migration allowed; no runtime restoration result inferred.

Local: Current access panel. Disposition: RETAIN; TEST FIRST; MIGRATE LATER. Stage6: R16 S6-005/007; R17. Outstanding verification: Expired/remembered/absent session startup and redirect. Separate modernization: D08 session adoption.

### SU02 - Confirmed Nonconformance

CS-03/05; WA-API-002. 461-464 clears login only on401, but other authenticated failures467 collapse to generic Error;505 throws data.error without status/category/type/nested contract. Current API authorization vs transient outcomes are not preserved for callers.

Local: Promo redemption messages. Disposition: CORRECT compatible classification; TEST FIRST. Stage6: R16 S6-008/018/033; T09 page-only. Outstanding verification: 401/403/503/network/nonJSON/nested errors with draft retained; no automatic retry. Separate modernization: D04 shared API adoption separate.

### SU03 - Conforming — source verified

CS-03/06/09; WA-AUTH-001. Routes authenticated globally;status32-34 and promo49-52 use req.user.userId, not browser supplied user ID. Existing admin service evidence hash matches; server owns entitlement/admin decision. Promo transaction locks source rows. No live subscription/admin entitlement verified.

Local: Plan/uses/redemption business rules. Disposition: RETAIN authority; TEST FIRST. Stage6: R16 S6-009; R19. Outstanding verification: Cross-account/promo eligibility/concurrency/expiry; no DB probe performed. Separate modernization: None.

### SU04 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001. Promo reusable free text289 trimmed483 and posted499; no DOMPurify/inputSanitizer or equivalent field sanitation imported. Required ordinary-text defense absent; preserve server validation/code semantics.

Local: Promo syntax local. Disposition: CORRECT text defense; TEST FIRST. Stage6: R17 input. Outstanding verification: Promo syntax/Unicode/markup-like invalid data and unchanged valid codes. Separate modernization: Optional adapter separate from mandatory defense.

### SU05 - Partially Conforming

CS-03/06; WA-SESSION-001. Explicit promo POST, no automatic replay, no pending disable;code cleared509 after response then loadStatus510 catches refresh failures. Committed promo/lost response may be uncertain, not an observed duplicate grant.

Local: Cleared code/refresh current plan. Disposition: TEST FIRST outcome/pending/draft recovery. Stage6: R16 T10 page-only; R19. Outstanding verification: Double click/lost response/postcommit refresh; reconcile before explicit retry. Separate modernization: Optional pending/outcome helper.

### SU06 - Unverified

CS-03/09; WA-SESSION-001. Captured token438 and delayed401 removes current storage462; no identity response fence. Stale entitlement response may render after account switch; no runtime cross-account incident demonstrated.

Local: Subscription data/promo target account. Disposition: TEST FIRST identity fence. Stage6: R16 S6-007/027; R17. Outstanding verification: A-to-B switch during status/promo and late401/success. Separate modernization: Optional identity-aware adapter.

### SU07 - Conforming — source verified

CS-07; WA-FRONT-001. Control labels and promoMessage live region292;dynamic output472-478/507-518 via textContent. Explicit fixed navigation, no raw server HTML.

Local: Plan presentation/Home. Disposition: RETAIN; TEST FIRST. Stage6: R17 accessibility/DOM. Outstanding verification: Keyboard/focus/status panel changes/announcement and hostile text. Separate modernization: None.

### SU08 - Unverified

CS-09/10; WA-CACHE-001, WA-LOG-001. No page credential logging or bearer URL;manifest8-9 not proof of response cache policy or telemetry coverage. No application executed.

Local: Subscription UI. Disposition: TEST FIRST asset/header/log policy. Stage6: R16 S6-024/030; R20. Outstanding verification: Headers/cache/CSP/CDN/mixed versions and synthetic log markers. Separate modernization: Optional asset/telemetry integration.

## Reconciliation/common causes

Eight candidates frozen before selected-page register reconciliation. Shared admin authority reused only on matching hash. No subscription calculations/prices audited as shared functions. Terms source retrieval overlapped report composition; per-phase assessment boundaries remain unresolved.

SU02 repeated RC-HTTP-CLASSIFICATION; SU04 RC-TEXT-DEFENSE; SU06 RC-IDENTITY-FENCE unverified. Two confirmed occurrences, no multiplication by endpoint.

## Findings and scope

Two confirmed candidates: authenticated error classification and missing ordinary promo-text sanitation. Server entitlement authority remains bounded source-positive; runtime account-switch consequences unverified.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch07 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
