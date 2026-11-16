# track - Batch 6 shared-function review

Authority: November16 original remaining58 assignment, explicit Batch6 authorization/five refinements and resume instruction. Eight pages sequentially; no Batch7. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/track.html; SHA-256 10dedac524873af5bb763a0b09f89e2ae6704f4c53701c9224f7cd606e49994b. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T13:51:35.5632255-05:00; original inventory completion 2026-11-16T13:52:03.867577-05:00. Frozen original count 7; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Current-token dashboard startup | httpdocs/track.html:346-348,650-655,710-726 | A | Guard current session before dashboard reads | WA restoration/identity contract | Raw fetch/current local token; no platform import | Admin dashboard readiness | High |
| T02 | GET/status/error parser | httpdocs/track.html:350-363,579-614,627-647 | A | Distinguish denial/transport/failure | WA type-safe HTTP/status contract | apiGet local adapter | Admin/domain response messages | High |
| T03 | Central administrator/privacy authorization | httpdocs/track.html:607-624,639-643,710-717 | C | Read aggregated app/all-user usage only as admin | WA central admin/record data permissions | Server /track guards; loadUsers authorizes body | Usage data and provider plan summaries | High |
| T04 | Safe HTML/table/options output | httpdocs/track.html:323-327,378-396,445-510,616-624 | A | Encode all server/display values | WA safe DOM/context rendering | escapeHtml/textContent; constant plan rows | Metric matrix/table schema | High |
| T05 | Account/selection/period async ordering | httpdocs/track.html:319-321,602-647,657-705 | A | Prevent stale identity/selection results | WA response fencing/session continuity | Local period/user state; no generation fence | Independent dashboard filters | High |
| T06 | Status/filter accessibility | httpdocs/track.html:224,240-278,296,579-647,657-705 | C | Announce loading/results/errors/filter state | WA programmatic status/focus semantics | Live initial gate, remaining local status/buttons | Dashboard feedback | High |
| T07 | Date/duration/capacity presentation adapters | httpdocs/track.html:329-344,400-442,589-595 | C | Format numeric duration/date safely | WA data presentation/date vs instant contract | Local numeric conversion/Date locale | Usage duration/cost/business values not audited | High |

B-only exclusions: B-only: provider prices/capacity planning, metric definitions and matrix economics; values are code observations, not current pricing recommendations. Read-only dashboard; no free-text controls, mutation or shared tracker import to require. No provider queries performed.

## Assessments

### T01 - Partially Conforming

CS03/08; WA-SESSION-001. 346 reads token each send,650 guard before restoration, no WA.session/platform use. Redirect guidance present.

Local: Admin dashboard readiness. Disposition: TEST FIRST; MIGRATE LATER. Stage6: R16 S6-005/008; R17. Outstanding verification: Cookie-only/expired token/refresh/dashboard readiness. Separate modernization: D08 compatible transport.

### T02 - Confirmed Nonconformance

CS03/05; WA-SESSION-001, WA-API-002. 352/356 deliberately redirect401/403, but361 other errors coerce data.error/drop status/code; nested error.message unsupported; no typed cancellation/network feedback.

Local: Admin/domain response messages. Disposition: CORRECT parser/category; TEST FIRST. Stage6: R16 S6-008/018/033; T09 page-only. Outstanding verification: 403/401/503/network/nonJSON/flat/nested and no object coercion. Separate modernization: D04 incremental envelope.

### T03 - Conforming — source verified

CS04/09; WA-SEC-ADMIN-001, WA-API-001. Server track8-10 calls central isVerifiedAdministrator; actual app-usage596/users608/user-usage628/current-plans655 routes all auth+requireAdmin. Body class added after protected loadUsers, not authority itself.

Local: Usage data and provider plan summaries. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-009/030. Outstanding verification: Flag0/former-name/native/ordinary user denies; all-route/no-store/cache breadth and private data fixture. Separate modernization: None.

### T04 - Conforming — source verified

CS07/09; WA-FRONT-001. 323 escapes all HTML table cells/class/title; user options622 textContent; datesfallback formatDate escaped by caller391; no untrusted URL or HTML errors.

Local: Metric matrix/table schema. Disposition: RETAIN; TEST FIRST. Stage6: R17 DOM; R16 S6-030. Outstanding verification: Hostile server strings/malformed metric types and DOM. Separate modernization: Optional output helper only.

### T05 - Unverified

CS03/09; WA-SESSION-001. 602/627 reads mutable period/user then asynchronously renders without identity/request generation. Old result may replace newer selection; delayed denial redirects even if account changed. No actual disclosure shown.

Local: Independent dashboard filters. Disposition: TEST FIRST; OWNER DECISION. Stage6: R16 S6-007/027; R19. Outstanding verification: Out-of-order period/user results, account switch/logout/BFCache cleanup. Separate modernization: None.

### T06 - Confirmed Nonconformance

CS07; WA-FRONT-001. Initial224 live gate is positive;247/278/296 statuses not live and dynamic tables/results no focused announcement. Active period classes change without pressed/current semantics.

Local: Dashboard feedback. Disposition: CORRECT status/filter accessibility; TEST FIRST. Stage6: R17 accessibility. Outstanding verification: Loading/results/errors/user lookup and keyboard/filter state. Separate modernization: Optional status helper.

### T07 - Partially Conforming

CS06/08; WA-DATA-001. 329 numeric duration conversion,339 Date local instant format with safe fallback,400 bytes finite-check; provider plan values remain planning references, no provider validation or pricing certification.

Local: Usage duration/cost/business values not audited. Disposition: RETAIN; TEST FIRST. Stage6: R17 locale/browser. Outstanding verification: Null/invalid timestamps/large durations/numeric schema and localization. Separate modernization: Optional numeric/instant helpers only.

## Reconciliation/common causes

Seven candidates independently frozen before register reconciliation. Exact current admin guards traced; no pricing/service calls. Shared component absence not a defect by assumption for admin read-only dashboard. M03 preserved mandatory and prior accepted tests untouched.

T02 RC-HTTP; T06 RC-ACCESS-STATUS/FILTER. T05 RC-IDENTITY/ORDER unverified; central admin bounded positive.

## Findings and scope

Two confirmed candidates: error contract and accessibility. No app/database/provider tests or admin reads executed.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch06 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
