# Breports - shared-function compliance review

Authority: explicit November 16 Batch 2 authorization with two refinements (reuse unchanged component evidence; observed phase timing or unresolved). Original remaining-58 assignment sections 5-15 governs. Eight Batch 2 files only, processed sequentially. No Batch 1 examination repeated.

Source: httpdocs/Breports.html. SHA-256: 6f01b9db80bfcdf9fc5c6a549bf5e81ddedfeea52136d003283b1d6fc8068cde. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:00:00.686193-05:00; saved completion observed 2026-11-16T09:00:00.687112-05:00. Original count 6. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R01 | getToken / requireLogin and startup gate | 38-39;45 | A | Gate menu navigation on stored credential presence | Cross-WA session restoration/identity | WA.session.restore (related; integration contract must be preserved) | Budget navigation destinations and user message | High |
| R02 | BASE_URL / apiFetch definitions (unused here) | 37;40 | A | Define generic authenticated request adapter | Transport/error contract reusable across WA | WA.api.request/json (no call here) | No Budget request is made by current menu | High |
| R03 | Dormant moneyDisplay / escapeHtml / requestedId helpers | 41-43 | C | Define formatting, escaping and ID parsing | Formatting/safe output/URL validation reusable | Native Intl/DOM; no equivalent shared formatter/ID utility established | Currency choices and Budget query contract; helpers have no callers here | High |
| R04 | Service-worker registration | 44 | A | Register shared offline/PWA worker | Cross-WA asset/cache lifecycle | httpdocs/sw.js; browser serviceWorker API | Registration scope is project root, not Budget-only | High |
| R05 | Budget and report-menu navigation | 29;45 | C | Route to selected Budget report | Navigation common; report choices application-specific | Native location and data-page handlers | Fixed Budget/report destinations | High |
| R06 | Platform and usage tracking integration | 45-46 | A | Record session-aware page/time usage | Cross-WA lifecycle tracking | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Current page path recorded by shared tracker | High |

B-only exclusions: B-only: seven Budget report destinations and menu labels; no business calculations or CRUD calls on this page. General CSS, dormant modal styles and source formatting excluded.

## Candidate assessments

### R01 - Approved Migration Pending

CS-03/08; WA-SESSION-001, WA-SHARED-001; D08. 38-39 check only token presence; 45 calls gate before wiring menu. Tracker restore runs separately. Gate does not validate token, perform restore or check explicit-logout marker; stale/missing-token behavior requires browser verification. No protected data/business request on this menu, so no demonstrated access bypass.

Local responsibility: Budget navigation destinations and user message.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Restorable missing-token session, stale/revoked token and logout/account-switch navigation. Deferred modernization: Staged shared session gate adoption; preserve menu/navigation.

### R02 - Not Applicable

CS-03/05/08; WA-SESSION-001, WA-API-002, WA-SHARED-001. 40 defines direct-fetch adapter and message/error coercion, but complete 47-line source has no apiFetch call. No business request executed by current menu. Latent error/status weaknesses are not counted as active menu defects.

Local responsibility: No Budget request is made by current menu.

Disposition: RETAIN; OWNER DECISION. Stage 6: Deferred standardization only. Outstanding verification: None. Deferred modernization: Dormant utility cleanup/transport contract review only if separately scoped.

### R03 - Not Applicable

CS-01/07/08; WA-FRONT-001, WA-SHARED-001. 41-43 helpers have no callers in menu source. Their presence establishes neither active sanitization nor unsafe rendering/URL use. No reusable user text input exists on the menu; shared sanitizer is not required merely for consistency.

Local responsibility: Currency choices and Budget query contract; helpers have no callers here.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: Optional dormant helper cleanup; no behavioral change authorized.

### R04 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. 44 registers /sw.js on load. sw.js 104-110 uses one cache.addAll for precache, including /bday.html at 62 (also HTML allowlist 16); file is already deleted locally. A failed precache response can reject installation; actual hosted availability/status and installed worker version not checked. This is one shared dependency concern, not a separate defect for every registering page.

Local responsibility: Registration scope is project root, not Budget-only.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16; S6-024. Outstanding verification: Hosted asset availability, install/update/rollback and mixed cache versions; no new probes permitted here. Deferred modernization: None.

### R05 - Conforming — source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 29 defines fixed data-page destinations; 45 reads only those local markup attributes into location.href and Budget button uses budget.html. No untrusted URL interpolation observed. Report choices remain local.

Local responsibility: Fixed Budget/report destinations.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: None.

### R06 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 45-46 platform precedes tracker. Tracker is actual WA.api.request/restore consumer, whereas dormant business adapter is not invoked. Unchanged shared hashes reuse Batch 1 bounded no-replay/current-token exit evidence.

Local responsibility: Current page path recorded by shared tracker.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding verification: Exact lifecycle events across restore/expiry/logout/BFCache and old/new assets. Deferred modernization: None.

## Evidence reconciliation

After inventory freeze, checked register WA-CF-015 and S6-024/025 and the November 15 handoff. Earlier bday deletion concern is corroborated in current sw.js precache, without repeating page examinations or hosted tests. Shared platform/tracker/sanitizer hashes equal Batch 1 identities. Registration definition is active; unused apiFetch/money/escape/id definitions are not new active defects. No previous Breports-specific report used as discovery checklist.

## Confirmed gaps and owner attention

No confirmed page-local nonconformance in active menu candidates. R04 shared service-worker missing-precache-target concern needs owner release disposition; no live outage or installation failure established. Legacy presence-only gate is phased migration/unverified behavior, not proof of unauthorized access. Dormant utilities are explicitly excluded from active defect counts.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch02 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
