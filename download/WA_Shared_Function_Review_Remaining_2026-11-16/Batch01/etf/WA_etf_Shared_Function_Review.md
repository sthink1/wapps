# etf ? shared-function review

Authorization: November 16 remaining-HTML assignment, Batch 1 only. Static local review; new report artifacts only. No source changes, application tests/builds, database access or service operations.

Source: httpdocs/etf.html; SHA-256 e5b70526560450b1a512d2d1e93d7a321775aebe4c7065cf1623f87ca1cc24f2. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. Local source is primary per assignment; authoritative Drive identity/revision and deployed equivalence were not compared.

Governing approval: Core v1.0 and Detailed v0.4.1 approved November 12 per their approval headers/adoption records; historical DRAFT filenames retained. Decision Register v1.0 D01?D14 read with subsequent 3A?3C clarifications. Legacy prepare-only/status statements are historical, reconciled to November 15 evidence, not new authority. README Section 0, AGENTS.md, CLAUDE.md and TechSummary.md explicitly consulted. Tools were invoked to read instructions; no assumption of automatic shell/tool instruction ingestion.

## Frozen independent discovery

Inventory completed and saved: 2026-11-16T08:28:00.785267-05:00. Original count: 3. No post-reconciliation additions. Immutable original inventory is the sibling Frozen_Inventory.json; names, ranges, classifications, rationale and confidence below retain that original.

| ID | Function / block | Lines | Class | Purpose | Shared rationale | Existing implementation | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E01 | goHome and ETF navigation handlers | 178-184 | C | Navigate to home and ETF pages | Home navigation is common; ETF destinations and inventory query remain local | None required; direct location assignment | High |
| E02 | Shared platform integration | 187-188 | A | Provide session/request facade for tracker | Shared session credential boundary | httpdocs/js/waPlatform.js | High |
| E03 | Usage tracking integration | 188 | A | Record page views and foreground duration | Project-wide tracking lifecycle | httpdocs/js/usageTracking.js | High |

B-only exclusions / responsibilities remaining local: ETF menu destinations and investment explanation are application-specific B; presentation-only CSS/notices/footer excluded from functional audit.

## Assessment

### E01 ? Conforming ? source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 178-184 use fixed relative URLs; Home is a simple location assignment; inventory query remains ETF-specific. No credential or data operation occurs in these handlers.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding: None. Deferred modernization: None.

### E02 ? Conforming ? source verified

CS-03/08/09; WA-SESSION-001, WA-SHARED-001; D07-D09. 187 precedes tracker 188. Platform does not patch global fetch. Actual facade use occurs in tracker sendNormal/start, not inline menu business logic. Narrow claim: ordered dependency and tracker integration.

Disposition: RETAIN; TEST FIRST. Stage 6: S6-005, R16/R17. Outstanding: Browser loading/cache, restore, logout/account-switch; no business session gate inferred. Deferred modernization: D08 shared storage architecture remains approved migration pending.

### E03 ? Conforming ? source verified

CS-03/08/09/10; WA-SESSION-001, WA-LOG-001, WA-SHARED-001. 188 activates tracker; usageTracking start restores session, normal POSTs call WA.api.request once; exit keepalive reads current token and suppresses explicit logout. Narrow claim: wiring/no-replay source paths.

Disposition: RETAIN; TEST FIRST. Stage 6: S6-025, R15/R16. Outstanding: Exact page/time events under expiry, BFCache, tab/account changes and uncertain delivery. Deferred modernization: None.

## Reconciliation and owner attention

Prior etfCompare timing report consulted only after frozen inventory, for measurement conventions and shared-component identities. Current platform/tracker hashes match that report and November 15 T12 platform identity. R15-49B describes script ordering, not business transport conversion. Older R16 paused/pending text is historical; November 15 continuation handoff preserves later bounded T06/T11/T12 evidence. No earlier candidate inventory used as discovery checklist.

No confirmed page-local nonconformance found in these three candidates. No claim of full runtime conformance. Shared helper cache/browser/session verification remains outstanding. The separately documented ETF /config credential-disclosure concern is not invoked by this menu; no config request performed.

## Scope and limitations

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern this read-only report process. CS-03/05/07/08/09/10 apply to session, errors, rendering and integration as identified per candidate. CS-04/06 and WA-API-001/WA-DATA-001 server authorization/data claims remain unverified unless a narrowly inspected producer is explicitly cited. Family Tree/admin-transfer/native/public-capability clauses are not applicable to this ETF page review. Styling and unrelated application calculations excluded. No revised source, .diff, installation or rollback package is applicable. No functionality or appearance change authorized.

All assessments are IMPLEMENTED-UNVERIFIED except explicitly bounded source properties; approved policies are APPROVED-POLICY. Confirmed Nonconformance means a demonstrated static requirement departure, not an executed exploit. Source-verified conforming labels cover only named source properties. D04/D08 migrations are not automatically security defects. No global compliance or release certification.

Preserve R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS. No completed tests repeated. R16-75 T09 shared-client browser display and T10 unsaved-form browser checks remain open per November 15 handoff. Stage 6 R16?R20 and independent review retain priority; deferred modernization does not defer mandatory safety findings.
