# FTContact - shared-function compliance review

Authority: explicit November 16 Batch 4 authorization and five refinements: unchanged source-verified component reuse; distinct page occurrences/common causes; Family Tree auth, authority, privacy, navigation and account switching; observed or unresolved timing; proposed Master Register and Stage 6 mappings. Original remaining-58 assignment governs. Seven Batch 4 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTContact.html. SHA-256: ba8d2b8686eeb1c2953e5f0caa4243b1f9e9ba05440921c202da3c9f92b6df23. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:14:55.968200-05:00; saved completion observed 2026-11-16T10:14:55.969139-05:00. Original count 10. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CT01 | Startup/query/context and return navigation | 48;79-81 | C | Guard page and derive person/tree/return | WA session restoration and safe navigation | FTContact.js:23-35,78-89,194-197; WA.session related | Contact focal person/tree | High |
| CT02 | HTTP/error adapters across reads and mutations | 67-74;79-80 | C | Transport contact/person/resend/save/delete and errors | WA status/error/no replay contract | FTContact.js:78-98,118-127,164-191,204-211; WA.api related | Contact messages and verification fields | High |
| CT03 | Private focal access and server authorization integration | 53-55;79 | C | Access protected person/contact records | WA page capability/tree/admin boundaries | FTContact.js:25-29,78-98,164-188; no FTPrivacy import | Person/contact binding | High |
| CT04 | Safe output/text/URL context | 53-55;73;79 | C | Display records and edit values safely | WA context-sensitive DOM safety | FTContact.js:7-21,64-89,104-127,182,197 | Contact value/note/status | High |
| CT05 | Shared sanitizer and field normalization | 9-10;61-64;79 | C | Sanitize reusable text and normalize empty input | Common text defense-in-depth | inputSanitizer; DOMPurify; FTContact.js:37-40,142-147 | Type/value/note syntax | High |
| CT06 | Mutation/draft/pending lifecycle | 67-68;73;79 | C | Save edit/delete/resend with safe retry and inputs | WA uncertain mutation/no replay and drafts | FTContact.js:50-76,118-138,140-191 | EditContactID/contact list reconciliation | High |
| CT07 | Account-switch and late-response isolation | 79 | C | Prevent old-account contacts/context updating new session | WA session identity fencing | FTContact.js:31-35,78-138,140-191,194-213 | Contact list/edit cache | High |
| CT08 | Email verification capability workflow | 72-73;79 | C | Resend verification without replacing verified identity | WA capability/email authority/privacy contract | FTContact.js:112,118-127; server contact routes | Registered Contact email verification | High |
| CT09 | Field validation/error announcement accessibility | 61-68;74;79 | C | Label controls, focus missing fields and announce errors | WA accessible fields/status semantics | FTContact.js:149-162,198-211 | Required type/value and list statuses | High |
| CT10 | Shared platform/tracking/assets | 79-81 | A | Use shared telemetry/session integration | WA common tracking/cache contract | waPlatform; usageTracking | Family Tree page attribution | High |

B-only exclusions: B-only: contact sorting/types, primary-contact rules and email business verification rules, except mandatory capability/privacy authority integration. No upload or new backend audit beyond used route access/error/capability fragments.

## Candidate assessments

### CT01 - Partially Conforming

CS-03/08/10; WA-SESSION-001, WA-AUTH-001. Companion23-35 current local token/query or session tree;195 absent token redirects,196 prerequisites,197 encoded Person fallback/history. Business startup208-209 does not await shared restoration.

Local responsibility: Contact focal person/tree.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/008; R17. Outstanding verification: Cookie-only/expired token; return/BFCache continuity. Deferred modernization: D08/compatible shared session/navigation.

### CT02 - Confirmed Nonconformance

CS-03/05/08; WA-SESSION-001, WA-API-002. Companion84/98/124/173/188 throws plain Error(message), catches127/135/204/211 display message; status/code/category discarded. Flat/nested interoperability not implemented. No transport replay loop.

Local responsibility: Contact messages and verification fields.

Disposition: CORRECT failure categories; TEST FIRST. Stage 6: R16 T09 page-only, T10; S6-008/018/033. Outstanding verification: 401/403/423/409/503/nonJSON/network/cancel and retained domain metadata. Deferred modernization: D04 staged envelope migration.

### CT03 - Confirmed Nonconformance

CS-04/08/09; WA-PRIV-002, WA-SEC-ADMIN-001. HTML79-81 has no FTPrivacy; companion25-29 only bearer/Content-Type, loadPerson78-89 and contact GET/mutations have no page capability. Mounted server184 ftPrivacy111-117 requires unlock for private person/contact paths; no page acquisition path. Therefore nonadmin private focal access cannot complete. Server tree/person/contact binding present through protection and route5328-5333/5357-5359/5384-5386/5410-5412. Verified admin uses central dual gate, not hidden controls.

Local responsibility: Person/contact binding.

Disposition: CORRECT private access integration once per affected page; TEST FIRST. Stage 6: R16 S6-017/009; R17. Outstanding verification: Ordinary private key access, wrong-user/tree/token, admin flag0/former-name and positive CRUD/integrity. Deferred modernization: None.

### CT04 - Conforming — source verified

CS-07/09; WA-FRONT-001, WA-LOG-001. Companion7-11 escapes values/type/note/status in HTML104-115, edit fields use value68-70, person/status use textContent; no contact Website value promoted to executable href. ContactID raw data-id relies numeric DB contract; no demonstrated injection. safeImageUrl unused. Navigation197 URI-encoded.

Local responsibility: Contact value/note/status.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-030; R17 DOM. Outstanding verification: Synthetic hostile strings/IDs/email statuses and DOM output. Deferred modernization: Optional common escaping helper.

### CT05 - Partially Conforming

CS-07/08; WA-FRONT-001, WA-SHARED-001. HTML9-10 loads shared sanitizer before page; text inputs62-63 and capture clicks/changes covered by unchanged component. nullable37-40 trims/normalizes only after capture. Not backend validation or output proof.

Local responsibility: Type/value/note syntax.

Disposition: RETAIN; TEST FIRST. Stage 6: R17 input/asset matrix. Outstanding verification: Dynamic resend/edit/save, CDN loss and exact contact-value/note semantics. Deferred modernization: Optional shared normalization.

### CT06 - Confirmed Nonconformance

CS-03/06/08; WA-SESSION-001, WA-DATA-001. Client140-176 sends once and clears only after ok, retaining draft on catch; no automatic retry and no in-flight guard. Distinct source defect: server5356-5374 commits withTx contact/email-request then awaits sendContactVerification5372; mail failure returns ordinary error5374 despite persisted contact. PUT5383-5403 same. Client173 treats this as failed save with no committed-record/partial-success state. Resend5306-5316 also commits new verification then can fail delivery.

Local responsibility: EditContactID/contact list reconciliation.

Disposition: CORRECT committed-vs-delivery outcome reporting under explicit scope; TEST FIRST; preserve no replay/drafts. Stage 6: R16 T10/S6-018/041; R19 repeated explicit clicks. Outstanding verification: Synthetic mail failure after commit, subsequent reconciliation/no duplicate manual retry; ambiguous network delivery and edit-load race. Deferred modernization: Optional pending-operation helper; safety correction mandatory.

### CT07 - Unverified

CS-03/09; WA-SESSION-001, WA-PRIV-002. Companion34-35 caches edit ID/contacts; per-call bearer changes but asynchronous callbacks/load85-117/save174-176 lack account/request fence/storage listener. Existing valid response could update or clear a changed account/draft; runtime not shown.

Local responsibility: Contact list/edit cache.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19 delayed UI races. Outstanding verification: Account switch/logout during load/save/resend; edit changes before save completion; BFCache. Deferred modernization: None.

### CT08 - Partially Conforming

CS-04/06/09; WA-PRIV-001, WA-PRIV-002, WA-DATA-001. Companion112/118-127 POST resend uses contact ID/current tree. Backend5235-5247 random32 bytes/hash/24h/supersede;5307-5312 binds stored ContactValue/person/tree. Public preview5268-5279 no mutation; POST5282-5299 lock/expiry/responded/current-address match. Server173-178 only exact GET/POST hex64 paths bypass auth. Email ownership verification is not privacy authorization or D06 existing-code recovery.

Local responsibility: Registered Contact email verification.

Disposition: RETAIN bounded capability design; TEST FIRST; no Batch5 page audit. Stage 6: R16 S6-017/019/029/030; R17; R19 reuse/concurrency. Outstanding verification: Wrong/expired/reused/changed-address links, delivery/log/cache/referrer controls; no email sent; public FTEmailVerification page not examined. Deferred modernization: None.

### CT09 - Confirmed Nonconformance

CS-07; WA-FRONT-001. HTML61-64 labels present; companion149-162 highlights and focuses first missing field. HTML68/74 statuses have no live/role/description association; toggled class151-152 lacks aria-invalid. Async catch204/211 updates text without announcement/focus. Separate subfindings, one candidate.

Local responsibility: Required type/value and list statuses.

Disposition: CORRECT accessible errors; TEST FIRST. Stage 6: R17; owner risk disposition before scope expansion. Outstanding verification: Screen reader validation/asynchronous failures, field associations and focus after edit. Deferred modernization: Optional shared field/status helper.

### CT10 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. 79 page/80 platform/81 tracker: actual telemetry WA.api, business fetch direct. Bounded module hashes unchanged; no global fetch wrapper on Contact.

Local responsibility: Family Tree page attribution.

Disposition: RETAIN; TEST FIRST lifecycle/versioning. Stage 6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Logout/expiry/BFCache/tracking exact counts and old-new assets. Deferred modernization: D08/compatible transport and asset adoption.

## Evidence reconciliation

Ten candidates frozen before selected-page register reconciliation. No additions. Same-hash platform/tracker/sanitizer/admin/protection evidence reused, with actual Contact call sites independently examined. New bounded contact-email dependency inspection establishes post-commit mail failure outcome and capability issuance properties. No Batch5 verification page or completed FTPerson examination repeated. No current username-only admin defect asserted; full administrator CRUD/record transfer acceptance remains open.

## Common causes and proposed Master Register relevance

CT02 RC-HTTP; CT03 B04-PRIVATE-DETAIL; CT06 B04-CONTACT-DELIVERY (create/update/resend subfindings under one original lifecycle candidate); CT09 RC-STATUS (announcement and aria-invalid subfindings). CT07 B04-IDENTITY unverified. Proposed common causes/register keys only; no authoritative statuses changed.

## Confirmed gaps and owner attention

Four confirmed candidate occurrences. Owner attention: CT06 committed database change plus ordinary mail-delivery error can mislead save/retry; CT03 private access flow incomplete. HTTP/error accessibility are separate local occurrences. Capability source checks are bounded positives, not runtime certification.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch04 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
