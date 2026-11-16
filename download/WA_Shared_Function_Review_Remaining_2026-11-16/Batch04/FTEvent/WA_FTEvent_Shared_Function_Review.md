# FTEvent - shared-function compliance review

Authority: explicit November 16 Batch 4 authorization and five refinements: unchanged source-verified component reuse; distinct page occurrences/common causes; Family Tree auth, authority, privacy, navigation and account switching; observed or unresolved timing; proposed Master Register and Stage 6 mappings. Original remaining-58 assignment governs. Seven Batch 4 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTEvent.html. SHA-256: 13d0d1eb70dd87595e774ca4b320cbe6576d3dd15985ed76e489c2ef45a931c2. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:16:52.331045-05:00; saved completion observed 2026-11-16T10:16:52.331884-05:00. Original count 10. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EV01 | Credentialed startup/context/navigation | 45;71-73 | C | Guard Event view and return to Person | WA auth restoration and safe navigation | FTEvent.js:23-36,234-237; WA.session related | Person/tree Event context | High |
| EV02 | Person/Event HTTP/error adapters | 58-60;71-72 | C | Transport reads/save/delete and display failures | WA typed error/status/no replay contract | FTEvent.js:115-137,191-231,238-249; WA.api related | Domain event fields/auto events | High |
| EV03 | Privacy capability and server authorization integration | 48;71 | C | Access private person/events under tree/admin rules | WA private page capability and authorization | FTEvent.js:24-28,115-137,203-228; no FTPrivacy import | Person/Event binding | High |
| EV04 | Safe DOM output boundaries | 48;60;67;71 | C | Render event/person/history text and attributes | WA safe untrusted rendering | FTEvent.js:7-21,97-128,149-186 | Event/history rows and descriptions | High |
| EV05 | Free-text sanitization and normalization | 9-10;52-55;71 | C | Sanitize editable place/description and normalize inputs | Mandatory common text defense | DOMPurify/inputSanitizer; FTEvent.js:38-40,194-201 | Event form semantics | High |
| EV06 | Calendar date display/input codec | 48;53;71 | C | Convert dates for display/input/age | WA reusable calendar semantics | FTEvent.js:43-69,102,128,145-154,173-181 | Age-at-event and chronological business rules | Medium |
| EV07 | Mutation/draft/selection lifecycle | 57-60;67;71 | C | Save/edit/delete with draft/no replay safety | WA uncertain mutation/pending lifecycle | FTEvent.js:82-113,191-231 | AutoPerson event restrictions and editEventID | High |
| EV08 | Account-switch and response fencing | 71 | C | Keep event/person cache and responses tied to identity | WA session/account isolation | FTEvent.js:30-36,115-168,191-249 | Events/currentPerson/history state | High |
| EV09 | History dialog/form/status accessibility | 52-68;71 | C | Operate modal and report validation/save errors | WA focus/keyboard/error announcements | FTEvent.js:185-189,202,234-249 | History actions and Event status | High |
| EV10 | Shared platform/tracker/assets | 71-73 | A | Use shared session telemetry with local business calls | WA common telemetry/cache integration | waPlatform; usageTracking | Family Tree page attribution | High |

B-only exclusions: B-only: event sorting/history chronology, age-at-event calculations, automatic Birth/Death business rules. Backend inspection bounded to used event access/mutation/auto-event guards; no schema/data execution or multipart flows.

## Candidate assessments

### EV01 - Partially Conforming

CS-03/08/10; WA-SESSION-001, WA-AUTH-001. Companion23/30-36 current local token/query or session tree;235 redirects before shared restore,236 prerequisites,237 encoded fallback/history. loadPerson246 before loadEvents247.

Local responsibility: Person/tree Event context.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/008; R17. Outstanding verification: Cookie-only/expired token/direct link/BFCache restore. Deferred modernization: D08/compatible startup/navigation.

### EV02 - Confirmed Nonconformance

CS-03/05/08; WA-SESSION-001, WA-API-002. Companion121/137/212/228 throws plain Error(data.message||fallback);166/238/249 shows message without status/code/categories. Shared platform loads72 but business operations do not call WA.api. No automatic mutation replay.

Local responsibility: Domain event fields/auto events.

Disposition: CORRECT failure categories; TEST FIRST. Stage 6: R16 T09 page-only; T10; S6-008/018/033. Outstanding verification: 401/403/423/409/503/network/cancel/nonJSON/flat/nested and domain-auto-event fields. Deferred modernization: D04 staged envelope migration.

### EV03 - Confirmed Nonconformance

CS-04/08/09; WA-PRIV-002, WA-SEC-ADMIN-001. HTML71-73 no FTPrivacy; companion24-28 bearer-only headers,115-137 person/events require private capability. Mounted protection111-117 blocks nonadmin private focal path without page token; no acquisition exists here. Tree/person binding from protection and5429-5437; event membership/auto protections5551-5563,5573-5580. Central admin dual gate applies; client disabled auto controls alone not relied on.

Local responsibility: Person/Event binding.

Disposition: CORRECT private page integration; TEST FIRST authorization/integrity. Stage 6: R16 S6-017/009; R17. Outstanding verification: Private authorized/wrong-key/tree/person/user/token, admin positive read/create/update/delete and flag0/former-name; full record-transfer beyond scope. Deferred modernization: None.

### EV04 - Partially Conforming

CS-07/09; WA-FRONT-001, WA-LOG-001. Companion7-11 escapes type/place/description153/156-157 and history180-182; person/status textContent125-128; edit fields value101-104. IDs raw numeric DB contract. dateUS result154/180 enters HTML unescaped: malformed non-date fallback43-46 would be unsafe, but inspected API5421-5457 supplies DB EventDate and no present arbitrary-string exploit is established. safeImageUrl unused.

Local responsibility: Event/history rows and descriptions.

Disposition: RETAIN safe text sinks; TEST FIRST date/output contract; no unsupported XSS finding. Stage 6: R16 S6-030; R17 DOM. Outstanding verification: Synthetic malformed date/IDs/hostile text, DB date response shape and browser DOM; no schema queried. Deferred modernization: Optional shared output helper.

### EV05 - Partially Conforming

CS-07/08; WA-FRONT-001, WA-SHARED-001. HTML9-10 sanitizer before page; text/place/textarea54-55 capture events covered; date input53 excluded as typed date. nullable38-40 then saves194-201. No privacy-key prompt on this page.

Local responsibility: Event form semantics.

Disposition: RETAIN; TEST FIRST. Stage 6: R17 input/asset matrix. Outstanding verification: Save/history edit behavior, CDNavailability and exact description/place preservation. Deferred modernization: Optional normalization helper.

### EV06 - Partially Conforming

CS-01/06/08; WA-DATA-001, WA-SHARED-001. Companion43-50 slices date-only display/input,63-64 local-midnight age primitives. No automatic UTC-instant conversion introduced. dateUS fallback/schema validity unverified; biological age and chronological sort business rules excluded.

Local responsibility: Age-at-event and chronological business rules.

Disposition: RETAIN; TEST FIRST. Stage 6: R17 timezone/browser. Outstanding verification: Null/invalid/leap/date-only timezone and display/input roundtrip; no broad calculations audit. Deferred modernization: Optional date-only codec.

### EV07 - Partially Conforming

CS-03/06/08; WA-SESSION-001, WA-DATA-001. Companion206-215 sends once, clears only after ok and reloads events; no retry. Errors retain draft. No in-flight guard; active edit can change while response pending, success clear213 may clear newer edit. Server mutations transaction/audit and auto-event guards5466-5584 observed; no mail post-commit chain here.

Local responsibility: AutoPerson event restrictions and editEventID.

Disposition: RETAIN no replay; TEST FIRST draft/repeated-click lifecycle. Stage 6: R16 T10 page-adapter only; R19 UI concurrency. Outstanding verification: Failed/ambiguous save, late success vs new draft, repeated explicit clicks and server integrity; no mutation executed. Deferred modernization: Optional pending-operation helper.

### EV08 - Unverified

CS-03/09; WA-SESSION-001, WA-PRIV-002. Companion30-36 caches user-sensitive currentPerson/events/edit; async122-168/213-231 no identity generation fence, abort or storage logout listener. No observed cross-account disclosure; backend authorization does not itself fence earlier responses.

Local responsibility: Events/currentPerson/history state.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19 async interleaving. Outstanding verification: Account switch/logout/BFCache during person/events/save/history, stale form/data cleanup. Deferred modernization: None.

### EV09 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001. HTML52-55 labels correct; history63 role/title present; companion188-189 shows/hides without focus transfer/trap/return,244 Escape exists. HTML58/60 status lacks live/role association;202 validation updates text without focus/association. History delete errors186 go behind open modal to listStatus. One candidate with distinct modal/error subfindings.

Local responsibility: History actions and Event status.

Disposition: CORRECT dialog and error accessibility; TEST FIRST. Stage 6: R17; owner separately scopes acceptance-critical fixes. Outstanding verification: Focus entry/containment/return, history delete error announcement, required field and screen-reader state. Deferred modernization: Optional shared dialog/status service.

### EV10 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. 71 page/72 platform/73 tracker; actual tracker WA.api and session restore, Event business fetch local. Unchanged component evidence reused; no privacy wrapper active here.

Local responsibility: Family Tree page attribution.

Disposition: RETAIN; TEST FIRST lifecycle/versioning. Stage 6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Tracking exact counts/expiry/logout/BFCache and mixed module versions/rollback. Deferred modernization: D08/compatible adoption and asset policy.

## Evidence reconciliation

Ten original candidates frozen before selected-page register/prior-findings reconciliation; zero additions. Same-hash shared sanitizer/platform/tracker/protection/admin evidence reused with independently inspected Event use. Used event route fragments show transactions, person association and server-enforced auto-event limits; no broad DB audit or test claimed. No existing completed tests, FTPerson or Batch5 page examination repeated. Older ftPrivacy username-only description is drift; full administrator action matrix remains unverified.

## Common causes and proposed Master Register relevance

EV02 RC-HTTP; EV03 B04-PRIVATE-DETAIL; EV09 B04-DIALOG plus RC-STATUS subfindings under one candidate. EV08 B04-IDENTITY unverified; EV04 date fallback is an unverified contract risk, not a demonstrated XSS count. Proposed review-local mappings only.

## Confirmed gaps and owner attention

Three confirmed candidate occurrences: HTTP category loss; no private-person capability acquisition; history-dialog/error accessibility. No claim of an active private-data bypass, date-string exploit, completed admin CRUD acceptance or native TNNA testing.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch04 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
