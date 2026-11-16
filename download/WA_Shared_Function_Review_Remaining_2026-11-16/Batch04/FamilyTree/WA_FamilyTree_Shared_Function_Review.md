# FamilyTree - shared-function compliance review

Authority: explicit November 16 Batch 4 authorization and five refinements: unchanged source-verified component reuse; distinct page occurrences/common causes; Family Tree auth, authority, privacy, navigation and account switching; observed or unresolved timing; proposed Master Register and Stage 6 mappings. Original remaining-58 assignment governs. Seven Batch 4 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FamilyTree.html. SHA-256: aabbf1a3f771cdc46ec836b934f38d2acbbd286fb93aff548f3e3ee69ed38b55. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:07:03.729524-05:00; saved completion observed 2026-11-16T10:07:03.730774-05:00. Original count 6. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FT01 | HOME/MENU handoff | 318-321;665-669 | C | Move between instructional and functional pages | Same-origin navigation/session continuity | WA.session related; static anchors | Instructional entry point and destinations | High |
| FT02 | Current-tree credentialed lookup and error handling | 417-419;770-780 | C | Load current tree code using local bearer | Shared auth restoration and HTTP distinctions | WA.session/WA.api loaded later, not used here | Optional tree-code display | High |
| FT03 | Late response/account-switch protection | 770-780 | A | Prevent earlier identity response updating current display | Cross-app session isolation | WA.session identity protection related | Reset displayed current-tree code | High |
| FT04 | Instruction dialog lifecycle/accessibility | 405-410;421-432;647-669;751-768 | C | Present and dismiss instructional dialogs | Reusable dialog focus/keyboard behavior | No shared dialog helper identified | Instruction text and static samples | High |
| FT05 | Safe DOM output and static template boundaries | 425-447;450-645;657-660;673-764;775-777 | C | Render samples and fetched tree label safely | WA safe output rules | FT_INSTRUCTIONS; textContent | Fictional illustrations and instructions | High |
| FT06 | Platform/usage lifecycle integration | 782-783 | A | Record Family Tree visit using shared components | WA-wide session/tracking contract | waPlatform.js; usageTracking.js | Family Tree page attribution | High |

B-only exclusions: B-only: instructional relationship, privacy, code, networking, contact/event/history and picture explanations; fictional cards are demonstrations, not active CRUD/upload/recovery controls. No sanitizer needed for static noneditable examples.

## Candidate assessments

### FT01 - Conforming — source verified

CS-01/03/08/10; WA-SESSION-001, WA-SHARED-001. 318-321 fixed relative HOME/MENU links; 665-669 examples open instructions only. No token in navigation URL; no records mutated.

Local responsibility: Instructional entry point and destinations.

Disposition: RETAIN; TEST FIRST for remembered-session transition. Stage 6: R16 S6-005; R17. Outstanding verification: Browser restore and actual destination continuity, without repeating destination audits. Deferred modernization: Optional navigation helper only.

### FT02 - Partially Conforming

CS-03/05/08; WA-AUTH-001, WA-SESSION-001, WA-API-002. 770-780 reads local token once, returns if absent, sends direct GET, checks ok only after JSON parse and suppresses errors. waPlatform loads later at782, so tracker restore does not precede this optional lookup. Static example code remains after failure. No retry/mutation.

Local responsibility: Optional tree-code display.

Disposition: TEST FIRST; MIGRATE LATER with explicit optional-display/error policy. Stage 6: R16 T09 only tracker shared-client; S6-005/008/018. Outstanding verification: Cookie-only restore, expired token, 401/403/503/offline and sample-vs-real tree label distinction. Deferred modernization: D08/shared transport migration pending; no replacement architecture selected.

### FT03 - Unverified

CS-03/09; WA-SESSION-001; D09. 770-777 captures bearer then asynchronously replaces label without identity/generation check, storage listener or cancellation. Source shows missing local guard; actual cross-account display exposure not demonstrated.

Local responsibility: Reset displayed current-tree code.

Disposition: TEST FIRST; OWNER DECISION on account isolation remedy. Stage 6: R16 S6-007/027; R19 delayed-response interleaving. Outstanding verification: Delayed earlier-account tree-code response after account switch/logout and BFCache. Deferred modernization: None.

### FT04 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001. 405 dialog has role/aria-modal/title; 425-432 only sets content/show/scroll, with no focus transfer/trap. 766-768 dismiss without focus restoration; Escape exists. Mandatory focus/keyboard behavior incomplete in source.

Local responsibility: Instruction text and static samples.

Disposition: CORRECT within separately approved accessibility scope; TEST FIRST. Stage 6: R17 keyboard/browser; deferred standardization unless owner deems acceptance-critical. Outstanding verification: Keyboard focus entry, containment, return and screen-reader announcement; no browser result claimed. Deferred modernization: Optional shared dialog service; correction itself mandatory.

### FT05 - Conforming — source verified

CS-07/09; WA-FRONT-001, WA-LOG-001. 425 title.textContent; 427 innerHTML receives local static templates. FT_INSTRUCTIONS is fixed frozen source; sampleCard/sampleField calls use fictional literals. Actual fetched tree code uses textContent777. No private record/token logged or inserted as HTML in this page.

Local responsibility: Fictional illustrations and instructions.

Disposition: RETAIN; TEST FIRST if template provenance changes. Stage 6: R16 S6-030; R17 rendering. Outstanding verification: Browser DOM/CSP/asset availability; no comprehensive content-policy audit. Deferred modernization: Optional static-template factoring only.

### FT06 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-SESSION-001. 782 platform before783 tracker; actual tracker delegates WA.api and restores session. Page business lookup does not. Component SHA matches bounded prior batch evidence; no full reread required.

Local responsibility: Family Tree page attribution.

Disposition: RETAIN; TEST FIRST lifecycle; MIGRATE LATER where compatible. Stage 6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Expiry/logout/BFCache, exact tracking counts and mixed-version asset lifecycle. Deferred modernization: D08 staged storage; compatible shared adoption only.

## Evidence reconciliation

Independent six-candidate inventory frozen before prior FTPerson/component findings and compliance register consultation. No additions. Earlier shared platform/tracker evidence reused only for unchanged hashes and bounded properties. Current code does not load FTPrivacy, perform private CRUD, recover codes, or administer accounts: those paths are not certified. November 15 handoff preserves T12 90/90 and later T06/T11 bounds; no tests repeated. Current standards document older username-only ftPrivacy assertion is not treated as current-source fact; no such claim made for this page.

## Common causes and proposed Master Register relevance

Proposed review-local keys: B04-DIALOG (FT04 source-confirmed page-local occurrence); B04-AUTH (FT02 legacy startup/status risk); B04-IDENTITY (FT03 unverified delayed identity); RC-TRACK and RC-CACHE reuse prior common evidence. Proposed mappings only; no official Master Register ID allocated or existing register edited.

## Confirmed gaps and owner attention

One confirmed candidate: FT04 dialog focus lifecycle. FT02/03 require browser evidence and policy-specific correction scope; no demonstrated cross-account leak. Optional helper reuse and D08 migration are separate from mandatory focus behavior.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch04 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
