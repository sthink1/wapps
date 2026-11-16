# Weights - Batch 6 shared-function review

Authority: November16 original remaining58 assignment, explicit Batch6 authorization/five refinements and resume instruction. Eight pages sequentially; no Batch7. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/Weights.html; SHA-256 3193fa1248ccfffce8499da5bdf06a88eefb0e1e749ab57a24c6e0ab25fa939d. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T13:44:58.9110373-05:00; original inventory completion 2026-11-16T13:45:48.932800-05:00. Frozen original count 10; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| W01 | Shared authenticated transport adapter | httpdocs/Weights.html:642,681-710 | A | Delegate bearer/restoration/same-origin transport | WA shared auth contract | WA.api.request actually used; waLocalPath/waOptions | Weights URL/body/204 return shape | High |
| W02 | Caller error/status/JSON contracts | httpdocs/Weights.html:698-744,874-877,1031-1045,1470-1506,1550-1582 | C | Preserve HTTP/error/domain meanings across callers | WA status/errors/client interoperability | Shared raw Response, local parsing | Weights/Activity messages | High |
| W03 | Ownership/mutation authorization | httpdocs/Weights.html:1072-1079,1296-1303,1550-1561,1677-1685 | C | Access only owned Weight/activity associations | WA user ownership/data integrity | Server weights/weightActivities/activities routes | Record/association/range domain | High |
| W04 | Safe HTML/SVG/options/print | httpdocs/Weights.html:645-649,803-873,1105-1145,1337-1387,1855-1947 | C | Render text/numeric/date results and print safely | WA safe output/new-window contract | escapeHtml/DOM text and numeric conversion | Chart/report layout stays local | High |
| W05 | Shared free text and dynamic validation | httpdocs/Weights.html:13-14,493-507,1337-1412,1455-1484 | C | Sanitize Activity text/validate field controls | WA input defense/accessibility contracts | DOMPurify/inputSanitizer | Weights/activity limits/uniqueness local | High |
| W06 | Pending mutation/unsaved form lifecycle | httpdocs/Weights.html:1230-1311,1414-1435,1455-1583,1604-1690 | C | Save/edit/delete with no replay and retained drafts | WA uncertain outcome/draft rules | Shared transport no replay; local form handlers | User-reviewed Weight changes | High |
| W07 | Identity and asynchronous aggregation | httpdocs/Weights.html:659-679,713-877,1020-1045,1062-1227,1414-1428 | A | Keep multiple awaited datasets/drafts identity-consistent | WA account switch/late response protection | WA.session related; local caches | Joined weight/activity datasets | High |
| W08 | Modal/control/error accessibility | httpdocs/Weights.html:413-631,1023-1028,1108-1145,1426-1435 | C | Keyboard/focus/labels/error feedback across dialogs | WA frontend accessibility | Local overlays/dynamic controls | Report/form/dialog workflow | High |
| W09 | Tracking/PWA/diagnostics integration | httpdocs/Weights.html:9-14,651-657,874-877,1949 | A | Use shared tracking/cache/safe diagnostics | WA telemetry/cache/log contract | sw.js; platform; tracker; confetti | Weights attribution | High |
| W10 | Calendar/context preference adapters | httpdocs/Weights.html:659-676,769-776,910-958,1641-1648,1655-1673 | C | Preserve date-only selection and preferences | WA date/data/UI correctness | Browser Date/localStorage; no generic codec | Range and color choices local | High |

B-only exclusions: B-only: weight deltas/chart scaling/activity limits/date-range business selection. Functional markup/scripts read; CSS excluded. Procedural deviation: after source discovery completed, a narrow Compliance Register search revealed deferred S6-039 before inventory was saved. Inventory not derived from previous checklist; no concealment or claim strict freeze-before-register for this page.

## Assessments

### W01 - Conforming — source verified

CS03/08; WA-SESSION-001, WA-SHARED-001. 642 loads platform before681-697 adapter; actual WA.api.request delegates credential lifecycle; origin check684 and removes caller Authorization689;204 preserved709.

Local: Weights URL/body/204 return shape. Disposition: RETAIN; TEST FIRST. Stage6: R16 T09/T10 eligible actual shared business client; R17. Outstanding verification: Actual restore/expiry/noLocks/browser behavior; localhost split origin deliberately fails. Separate modernization: None.

### W02 - Confirmed Nonconformance

CS03/05; WA-API-002, WA-SESSION-001. 703-707 retains status and401/403 text, but details.error may object-coerce;733-744 parses auxiliary non-ok responses as data without status check;1564 invokes result.error.includes without type guard. Shared transport import does not cure caller parser gaps.

Local: Weights/Activity messages. Disposition: CORRECT caller parsing/category/visible error; TEST FIRST. Stage6: R16 T09/S6-008/018/033. Outstanding verification: Flat/nested/nonJSON/401/403/503 auxiliary calls and add-form feedback; read failure874 console-only. Separate modernization: D04 incremental envelope adoption.

### W03 - Partially Conforming

CS04/06; WA-API-001, WA-DATA-001. Mounted user/app guards; weights root31/search93-104/id135 and creation183/user Activity190/198, range247-263 restrict UserID. weightActivities14/42/50/97 ownership checks. Full PUT transaction/schema breadth not audited.

Local: Record/association/range domain. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-009; R19. Outstanding verification: Wrong user IDs/associations/range, transaction commit/integrity and full update gates. Separate modernization: None.

### W04 - Partially Conforming

CS07/09; WA-FRONT-001. 645 escapes Activity text/options, numeric values parsed; raw date1107 and ID805 rely typed DB contract. Print copies generated table1939; popup/CSP/invalid data unverified, no XSS proved.

Local: Chart/report layout stays local. Disposition: RETAIN; TEST FIRST. Stage6: R17 DOM/print. Outstanding verification: Hostile values/IDs/dates/CSS preferences and popup denial. Separate modernization: Optional common escaping/date helper.

### W05 - Partially Conforming

CS07/08; WA-FRONT-001. 13-14 shared sanitizer covers Activity free text500/1455 before submit, typed inputs excluded. Dynamic select escaping retained.

Local: Weights/activity limits/uniqueness local. Disposition: RETAIN; TEST FIRST. Stage6: R17 input. Outstanding verification: Dynamic events/CDN/IME/name semantics. Separate modernization: Optional field validation helper.

### W06 - Partially Conforming

CS03/06; WA-SESSION-001. Shared transport no automatic unsafe replay; local catches retain form values until explicit opening/reset. No pending fence against duplicate clicks/new edits. Success followed by confetti/read may throw after commit; no executed failure claimed.

Local: User-reviewed Weight changes. Disposition: RETAIN no replay; TEST FIRST. Stage6: R16 T10/S6-018; R19. Outstanding verification: Real unsaved forms/offline/late success/new draft and duplicate explicit clicks. Separate modernization: Optional pending helper.

### W07 - Unverified

CS03/09; WA-SESSION-001. Local activity/currentWeight caches;733 multiple API calls may cross an account change and results applied without local identity fence. Shared credential protections do not certify joined UI consistency.

Local: Joined weight/activity datasets. Disposition: TEST FIRST; OWNER DECISION. Stage6: R16 S6-007/027; R19. Outstanding verification: Account switch between joined GETs/edit selection/BFCache and overlapping reloads. Separate modernization: None.

### W08 - Confirmed Nonconformance

CS07; WA-FRONT-001. Overlays413-631 no dialog semantics/trap/return; close spans514/528/584 keyboard-inaccessible; edit checkboxes/date inputs1108-1145 lack associated names, errors not announced. Expand control has aria-expanded1585 (positive).

Local: Report/form/dialog workflow. Disposition: CORRECT; TEST FIRST. Stage6: R17 accessibility. Outstanding verification: Keyboard modal/date/control names/errors/focus. Separate modernization: Optional dialog/status helper.

### W09 - Partially Conforming

CS08/09/10; WA-CACHE-001, WA-LOG-001. 651 registers unchanged SW,1949 tracking actual shared;875 safe access text but other errors logged raw. No observed token value logged, sensitivity unverified.

Local: Weights attribution. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-025/030; R17; R20 S6-024. Outstanding verification: Exact lifecycle/secret markers/mixed asset versions. Separate modernization: Asset/diagnostic policy.

### W10 - Confirmed Nonconformance

CS01/06/07; WA-DATA-001, WA-FRONT-001. 771/772 earliestDate/latestDate assigned date strings;1647/1648 calls .toISOString directly on them when nonempty: source-guaranteed TypeError for normal loaded dataset when Delete opens. Later duplicate submit1655 supersedes1604; mixed Date/string comparisons1671 need separate review.

Local: Range and color choices local. Disposition: CORRECT scoped date adapter; TEST FIRST preserve business range rules. Stage6: R16 S6-039 contextual deferred issue (original row provenance unresolved); R17. Outstanding verification: Loaded/empty range dialogue/timezones/default dates; no test performed. Separate modernization: Optional common date-only codec; correction mandatory.

## Reconciliation/common causes

Ten candidates from independent source discovery. Procedural deviation explicitly preserved: narrow register excerpt exposing S6-039 was shown before saved inventory, after functional source reading. No inventory from a previous checklist, no concealment. Current shared hashes match earlier evidence. Existing range-delete finding retains its prior deferred status; no authoritative edit or test closure. M03 mandatory security-disposition preserved.

W02 RC-HTTP-CALLER; W08 RC-ACCESS; W10 B06-DATE-TYPE. W07 identity consequences unverified. Actual shared API adoption is a bounded positive.

## Findings and scope

Three confirmed candidates: caller response contract, accessibility, date-string TypeError. Prior test passes not repeated; no code revision.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch06 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
