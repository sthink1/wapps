# propertyInfo - Batch 6 shared-function review

Authority: November16 original remaining58 assignment, explicit Batch6 authorization/five refinements and resume instruction. Eight pages sequentially; no Batch7. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/propertyInfo.html; SHA-256 b99ebfaadf2f617994c8ab3cc476a67adc0df94e4163fcd5f35f00725af1b09f. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T13:48:03.8913175-05:00; original inventory completion 2026-11-16T13:48:55.112384-05:00. Frozen original count 7; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PR01 | Shared text sanitation/local DOM persistence | httpdocs/propertyInfo.html:13-14,216-239,329-334,347-425 | C | Sanitize address fields and save/load local rows | WA input/output defense | DOMPurify/inputSanitizer; local sanitizeInput/textContent | Address assembly/parsing and ephemeral saved table | High |
| PR02 | Clipboard asynchronous outcomes | httpdocs/propertyInfo.html:226,232,335-346,447-480 | A | Copy data only with truthful outcome | WA async external-action feedback | navigator.clipboard; unawaited writes | ZIP/full address instructions | High |
| PR03 | Safe external URL/navigation | httpdocs/propertyInfo.html:427-531 | C | Open intended providers without untrusted URL execution | WA URL/credential/privacy boundary | Fixed https providers/URI encoding/noopener noreferrer | Provider queries/workflows local | High |
| PR04 | Text-only print/window lifecycle | httpdocs/propertyInfo.html:532-546 | A | Print current saved addresses safely | WA safe output/window lifecycle | DOM pre.textContent; window.open/print | Selected address rows | High |
| PR05 | Dialog/keyboard/status accessibility | httpdocs/propertyInfo.html:204-215,226-233,245-295,547-552 | C | Operate instructional overlays and copy controls | WA focus/keyboard/announcements | Local show/hide handlers | Property help text | High |
| PR06 | Repeated-event/unsaved local-state lifecycle | httpdocs/propertyInfo.html:368-394,440-490,547-552 | C | Avoid repeated handler side effects/preserve local draft | WA async lifecycle/correctness | Nested addEventListener installs | User-initiated external lookup/address state | High |
| PR07 | Shared platform/tracking/PWA/session scope | httpdocs/propertyInfo.html:321-327,555-556 | A | Record current-session usage while local page remains local | WA session/telemetry/cache compatibility | waPlatform; usageTracking; sw.js | No business backend data/authorization boundary | High |

B-only exclusions: B-only: address splitting/provider instructions and field layout. Saved rows are DOM-only, no DB or storage persistence promised by source. No business API, app mutation, private server-record authorization or HTTP adapter to audit.

## Assessments

### PR01 - Conforming — source verified

CS07/08; WA-FRONT-001. 13-14 shared sanitizer plus plain-text local DOMPurify329; saved row375 textContent and load fields.value. No raw untrusted HTML or backend write. Duplicate local sanitizer is not itself a violation.

Local: Address assembly/parsing and ephemeral saved table. Disposition: RETAIN; TEST FIRST. Stage6: R17 input/DOM. Outstanding verification: CDN/IME/address roundtrip; no property data sent during review. Separate modernization: Optional dedup only if useful.

### PR02 - Confirmed Nonconformance

CS01/07; WA-FRONT-001, WA-DATA-001. 338/344 starts clipboard Promise but339/345 immediately asserts copied; rejected copy still claims success/unhandled rejection.458/480 similarly assumes copy before instructions. Source-confirmed false feedback path, no actual clipboard operation performed.

Local: ZIP/full address instructions. Disposition: CORRECT truthful async outcome; TEST FIRST. Stage6: R17 clipboard/browser; R16 general outcome relevance. Outstanding verification: Denied permission/insecure context/clipboard rejection, no false success. Separate modernization: Optional outcome helper.

### PR03 - Conforming — source verified

CS07/09; WA-FRONT-001, WA-PRIV-001. All dynamic providers fixed https with encoded query and noopener,noreferrer437/466/488/509/517/527. No bearer/capability forwarded; user address intentionally shared on explicit lookup.

Local: Provider queries/workflows local. Disposition: RETAIN; TEST FIRST. Stage6: R17 navigation; R16 privacy review scope. Outstanding verification: Provider availability/popup policies/consent and URL correctness; no live providers accessed. Separate modernization: None.

### PR04 - Partially Conforming

CS07/09; WA-FRONT-001. 532-546 prints DOM text through pre.textContent, no executable HTML. Popup null not checked539; synchronous print/close readiness unverified.

Local: Selected address rows. Disposition: RETAIN; TEST FIRST. Stage6: R17 print. Outstanding verification: Popup blocked, print readiness/cancel and expected row selection. Separate modernization: Optional print lifecycle helper.

### PR05 - Confirmed Nonconformance

CS07; WA-FRONT-001. Overlays no dialog semantics/focus trap/return/Escape; copy buttons226/232 tabindex=-1 exclude sequential keyboard. Named inputs positive; no modal announcements.

Local: Property help text. Disposition: CORRECT; TEST FIRST. Stage6: R17 accessibility. Outstanding verification: Keyboard/tab/copy controls, modal focus/reader feedback. Separate modernization: Optional dialog helper.

### PR06 - Confirmed Nonconformance

CS01/07/08; WA-FRONT-001. FEMA/NOAA open-button listeners464/486 are added on every parent-link click; reopening twice installs two handlers then one Open click issues two window.open calls. Close listeners also accumulate. DOM rows/drafts disappear on reload by local design, not DB loss.

Local: User-initiated external lookup/address state. Disposition: CORRECT one-handler lifecycle; TEST FIRST preserve provider workflow. Stage6: R17 async UI. Outstanding verification: Repeated open/close -> one intended external action; no popup executed. Separate modernization: Optional listener lifecycle factoring.

### PR07 - Partially Conforming

CS03/08/10; WA-SHARED-001, WA-CACHE-001. 555/556 actual shared usage logging;321 registers unchanged SW. No app-business fetch or local token guard: not automatic authorization defect for local-only address tool. User session needed only for tracking component contracts.

Local: No business backend data/authorization boundary. Disposition: RETAIN; TEST FIRST session/asset scope. Stage6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Signed-out/restore tracking and mixed assets/local-state navigation. Separate modernization: D08 tracking/asset policy.

## Reconciliation/common causes

Seven candidates independently frozen before limited register reconciliation. No business route or unrelated geocode request exists, so D11 geocode changes N/A and no backend auth absence defect invented. Hash-matched shared evidence reused; local text/URL/print/clipboard uses independently examined. M03 mandatory security disposition preserved.

PR02 B06-CLIPBOARD-OUTCOME; PR05 RC-ACCESS; PR06 B06-EVENT-DUPLICATION. No repeated source issue count per provider.

## Findings and scope

Three confirmed candidates: copy false-success, inaccessible dialogs/controls, repeated nested handlers causing multiple external opens. No network or clipboard execution.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch06 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
