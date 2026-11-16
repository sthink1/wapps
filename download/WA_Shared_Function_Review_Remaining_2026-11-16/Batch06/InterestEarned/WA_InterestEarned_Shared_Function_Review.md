# InterestEarned - Batch 6 shared-function review

Authority: November16 original remaining58 assignment, explicit Batch6 authorization/five refinements and resume instruction. Eight pages sequentially; no Batch7. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/InterestEarned.html; SHA-256 854c4c2e8cfdffbff708820b902eaf36e52f4941adf7a6c9a5b5179c38e2421b. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T13:46:37.9569505-05:00; original inventory completion 2026-11-16T13:47:15.632733-05:00. Frozen original count 9; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| I01 | Bearer/session startup | httpdocs/InterestEarned.html:686-708,1731-1748 | A | Guard and restore current session | WA session lifecycle | Local request helper; platform loaded later | Contract load and statement state | High |
| I02 | HTTP/error/204 adapter | httpdocs/InterestEarned.html:686-708,750-777,1455-1478,1553-1567,1712-1727 | C | Parse read/mutation outcomes | WA status/category/transitional errors | WA.api related; direct fetch | Contract messages/204 shape | High |
| I03 | Record ownership/authorization | httpdocs/InterestEarned.html:753,813-815,1455-1457,1553-1556 | C | Restrict contracts to permitted user | WA server ownership/subscription | Server interestEarned routes | Contract CRUD rules | High |
| I04 | Safe contract/calculation DOM | httpdocs/InterestEarned.html:652-656,730-810,842-855,1073-1096,1160-1314 | C | Render untrusted text and numeric/date results | WA safe text/context | textContent/escaping; numeric formatting | Statement/calculation schedule presentation | High |
| I05 | Free-text/numeric/date adapters | httpdocs/InterestEarned.html:13-14,676-683,725-728,842-883,1511-1551 | C | Sanitize text, format amount/date fields | WA reusable field/date semantics | DOMPurify/inputSanitizer; local formatters | Financial arithmetic excluded | High |
| I06 | Mutation draft/committed-followup lifecycle | httpdocs/InterestEarned.html:1363-1408,1435-1478,1511-1567,1678-1727 | C | Retain drafts and distinguish save from refresh/action logging | WA no replay/uncertain outcome | Local promises/disable; no shared pending helper | Contract selection and statement draft | High |
| I07 | Account switch/selection ordering | httpdocs/InterestEarned.html:698,723-777,832-838,1411-1432,1481-1508 | A | Fence delayed identity/selection responses | WA identity/late response rules | Shared session related; contractRecords cache | Selected contract/principal state | High |
| I08 | Modal/field/status accessibility | httpdocs/InterestEarned.html:372-374,385-430,517-638,1363-1408 | C | Operate contract/principal forms and errors | WA programmatic labels/focus/keyboard | Local overlays and close spans | Calculation feedback wording | High |
| I09 | Action tracking/shared telemetry/cache | httpdocs/InterestEarned.html:658-664,711-720,971,1472,1562,1722,1747-1748 | A | Log explicit action and page/time lifecycle | WA tracking/cache/diagnostics | Legacy logAction plus shared usageTracking | Interest action names | High |

B-only exclusions: B-only: interest/compound/day-count math, financial input validation and principal-business semantics. Review field adapters/sinks only, no arithmetic certification. Functional discovery complete before any selected-page register/prior findings.

## Assessments

### I01 - Partially Conforming

CS03/08; WA-SESSION-001. 686 current-token helper;1731 guard before shared restore1747; no WA.session business delegation.

Local: Contract load and statement state. Disposition: TEST FIRST; MIGRATE LATER. Stage6: R16 S6-005/008; R17. Outstanding verification: Cookie-only/expired startup and unsaved calculation continuity. Separate modernization: D08 compatible session adoption.

### I02 - Confirmed Nonconformance

CS03/05; WA-SESSION-001, WA-API-002. 697 recognizes401/removes token,701 other responses Error(errorData.error) loses status/category and nested object type;204 preserved705. Caller strings only.

Local: Contract messages/204 shape. Disposition: CORRECT; TEST FIRST. Stage6: R16 S6-008/018/033; T09 page-only. Outstanding verification: 401/403/503/network/nonJSON/flat/nested/cancel. Separate modernization: D04 incremental errors.

### I03 - Conforming — source verified

CS04/06; WA-API-001, WA-DATA-001. Server root54/id76/update169/delete214 scoped to current UserID; create115 inserts user. Mounted interest subscription/auth guard; parameters used, no client-ID-only authorization reliance.

Local: Contract CRUD rules. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-009; R19. Outstanding verification: Wrong-user contracts/affected rows/current schema/concurrent ID allocator. Separate modernization: None.

### I04 - Conforming — source verified

CS07/09; WA-FRONT-001. 730-810 options/details textContent, edit values1499; schedule dates sourced typed date inputs, amounts numeric formatters, not arbitrary DB text HTML. No raw contract HTML sink observed.

Local: Statement/calculation schedule presentation. Disposition: RETAIN; TEST FIRST. Stage6: R17 DOM. Outstanding verification: Hostile contract/name/notes and malformed typed data; arithmetic outside scope. Separate modernization: Optional output helper.

### I05 - Partially Conforming

CS07/08; WA-FRONT-001, WA-DATA-001. 13-14 shared sanitizer applies static and dynamic free text; amount blur/keypress863-882 separate numeric codec, calendar split725. Do not standardize financial rounding/day count without scope.

Local: Financial arithmetic excluded. Disposition: RETAIN; TEST FIRST. Stage6: R17 input/timezone. Outstanding verification: IME/CDN/typed numeric paste/roundtrip/date-only behavior. Separate modernization: Optional field/date codecs only.

### I06 - Partially Conforming

CS03/06; WA-SESSION-001. Delete disables1452 catch restores; no automatic replay. Successful CRUD then dropdown refresh/log/confetti may fail in same promise and show ordinary error after persisted success; drafts retain until explicit open/reset, update has no pending guard.

Local: Contract selection and statement draft. Disposition: TEST FIRST explicit committed-vs-refresh outcome. Stage6: R16 T10/S6-018; R19. Outstanding verification: Lost response, duplicate clicks, postcommit GET failure, draft/new selection vs late completion. Separate modernization: Optional pending/outcome helper.

### I07 - Unverified

CS03/09; WA-SESSION-001. 698 unconditional token removal on delayed401; cached contracts and asynchronous edit1496 may fill stale record after dropdown changes then submit uses current id1514. No identity/request fence; actual overwrite/disclosure not tested.

Local: Selected contract/principal state. Disposition: TEST FIRST; OWNER DECISION. Stage6: R16 S6-007/027; R19. Outstanding verification: Account switch/late401, out-of-order selection vs save, statement cache cleanup. Separate modernization: None.

### I08 - Confirmed Nonconformance

CS07; WA-FRONT-001. 517-638 overlays no role/focus trap/return/Escape; close spans click-only. Statement fields397-422/principal1088 and selects372/550/575 lack associated names; error feedback not live.

Local: Calculation feedback wording. Disposition: CORRECT; TEST FIRST. Stage6: R17 accessibility. Outstanding verification: Field names/keyboard/dialog/error/validation focus. Separate modernization: Optional dialog/status helper.

### I09 - Partially Conforming

CS08/09/10; WA-SHARED-001, WA-LOG-001, WA-CACHE-001. 711 logs extra action POST /track/log/page via legacy helper alongside actual shared telemetry1748; no blind retries. Same SW/platform/tracker hashes retained. Raw error messages logged719; no token value observed.

Local: Interest action names. Disposition: RETAIN; TEST FIRST lifecycle/diagnostics. Stage6: R16 S6-025/030; R17; R20 S6-024. Outstanding verification: Action-vs-view attribution/exact accounting/expiry/log secrets/mixed assets. Separate modernization: Bounded tracking/asset policy.

## Reconciliation/common causes

Nine independent candidates frozen before selected-page register reconciliation. Shared identical helper pattern compared only after discovery, no repeated whole-module audit. Current backend user predicates narrowly checked. M03 security disposition and all accepted tests preserved; no financial calculations tested or certified.

I02 RC-HTTP same failure-contract family as A02, distinct local helper copy; I08 RC-ACCESS. I07 RC-IDENTITY/selection races unverified; I06 partial outcome risk.

## Findings and scope

Two confirmed candidates: HTTP contract and accessibility. Ownership static positive, no runtime authorization pass claimed.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch06 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
