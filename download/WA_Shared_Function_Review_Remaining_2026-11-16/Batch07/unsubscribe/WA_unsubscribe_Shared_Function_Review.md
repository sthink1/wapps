# unsubscribe - Batch 7 shared-function review

Authority: November16 original remaining58 assignment, explicit final Batch7 authorization and final-batch requirements. Eleven pages sequentially; stop after Batch7 and separately authorized reconciliation. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/unsubscribe.html; SHA-256 d26039c5b18adb4dde3f4aede9a9fa3707610ed684dbfee4b9d9eaf94f22bd33. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T14:08:13.3934399-05:00; original inventory completion 2026-11-16T14:08:40.883016-05:00. Frozen original count 6; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UN01 | Public capability GET/POST authority | httpdocs/unsubscribe.html:29-30,44-55,58-71 | C | Preview destination/category then explicit opt-out | WA public capability method/scope | notifications/unsubscribe token endpoints | Email/category opt-out purpose | High |
| UN02 | HTTP/error/pending/no replay | httpdocs/unsubscribe.html:44-48,58-80 | A | Preserve denial/failure/uncertain mutation state | WA error/outcome/no replay contract | Raw response JSON/ok checks/disabled button | Preference change outcome | High |
| UN03 | Category/registered destination/server mutation | httpdocs/unsubscribe.html:37-41,46-71 | C | Apply only token-bound permitted preference | WA authorization/privacy/DB contract | Notification service capability functions | Nonessential notification categories | High |
| UN04 | Safe DOM/accessibility | httpdocs/unsubscribe.html:19-22,50-55,67-80 | A | Display recipient and outcomes as text | WA safe output/labels/live feedback | textContent/named button/status role | Category labels | High |
| UN05 | Token URL/cache/referrer/log hygiene | httpdocs/unsubscribe.html:4-7,29-30,46,62 | A | Contain email capability exposure | WA sensitive capability/cache/diagnostic contract | URLSearchParams/encoded path; no cleanup/meta policy | Unsubscribe email link | High |
| UN06 | Capability/account/delivery lifecycle | httpdocs/unsubscribe.html:35,49,58-80 | A | Handle reused link/old preview/uncertain delivery safely | WA capability lifecycle vs current account | Local info/token independent of web auth | Destination/category preview lifetime | High |

B-only exclusions: B-only: category wording and preference semantics except mandatory auth/category boundary. No free-text or password/browser login requirement for public capability. Do not impose one-time use without checking intended contract.

## Assessments

### UN01 - Conforming — source verified

CS-04/09; WA-PRIV-001, WA-AUTH-001. 44-55 explicit GET preview,58-71 POST after named button; routes57-91 intentionally public; no login/Origin mistaken as capability identity. GET masks email67-74 and has no mutation.

Local: Email/category opt-out purpose. Disposition: RETAIN purpose-specific public link; TEST FIRST. Stage6: R16 S6-019; R17. Outstanding verification: Forged/wrong/cross-purpose token, preview no mutation; no blanket one-use imposed. Separate modernization: None.

### UN02 - Partially Conforming

CS-03/05/06; WA-API-002, WA-SESSION-001. 48/66 checks response.ok before success, POST disables until outcome, no automatic replay. Generic Error(data.message) drops status/type and nested envelopes; current route messages safe strings, no demonstrated false success. Failure73 allows explicit retry; uncertain commit needs read/reconciliation policy.

Local: Preference change outcome. Disposition: TEST FIRST compatible public parser/outcome. Stage6: R16 T10 capability-page only; S6-018/033. Outstanding verification: Lost reply/503/nonJSON/nested/cancel/duplicate explicit click, no blind automatic send. Separate modernization: D04 compatible error adapter.

### UN03 - Conforming — source verified

CS-04/06/09; WA-PRIV-001, WA-DATA-001. Service6 optional categories;427-439 token parameterized lookup;451-511 locks record, restricts optional categories, uses stored destination/category/channel, suppression/preferences/consent then commit. No arbitrary request-provided user/destination, no explicit postcommit external delivery in inspected action. Expiry/reuse design deliberately not assumed.

Local: Nonessential notification categories. Disposition: RETAIN scoped opt-out; TEST FIRST. Stage6: R16 S6-009/019; R19. Outstanding verification: Required category denial, exact destination/channel, repeated opt-out/consent/idempotence/rollback; public policy expiry remains owner contract. Separate modernization: None.

### UN04 - Conforming — source verified

CS-07/09; WA-FRONT-001. 50-55/69-80 all textContent, named button and22 status role, no editable free text/HTML sink. Exact focus/readiness announcements unverified.

Local: Category labels. Disposition: RETAIN; TEST FIRST. Stage6: R17 accessibility/DOM. Outstanding verification: Hostile masked recipient/error text, keyboard and focus after hidden button. Separate modernization: None.

### UN05 - Unverified

CS-09/10; WA-PRIV-001, WA-CACHE-001, WA-LOG-001. Token remains query and encoded endpoint path; no client logs/external assets, but no page referrer/history/cache controls. Service stores token as published UnsubscribeToken; entropy producer inspected, retention/hash/expiry/privacy operational contract not certified. No actual leakage asserted.

Local: Unsubscribe email link. Disposition: TEST FIRST; OWNER DECISION purpose-specific exposure/retention. Stage6: R16 S6-019/024/030; R17; R20. Outstanding verification: Server headers/log/referrer/history/cache/error paths and intended long-lived/reused unsubscribe policy. Separate modernization: None.

### UN06 - Unverified

CS-03/09; WA-PRIV-001. Token/info35/49 identifies original email category, independent of signed-in browser identity; server POST re-resolves stored token. Old preview/changed preferences/reused link or lost response not tested.

Local: Destination/category preview lifetime. Disposition: TEST FIRST. Stage6: R16 S6-007/019; R19. Outstanding verification: Account switch no accidental different-user scope, repeated preview/opt-out lifecycle and uncertain result. Separate modernization: None.

## Reconciliation/common causes

Six independent candidates frozen before selected-page register reconciliation; no additions. Link-specific optional category/destination scope checked. Reuse/expiry not forced into reset-token rule. No previously completed verification page or Stage6 test repeated; M03 and Batch6 exceptions preserved.

No source-confirmed candidate nonconformance established in this scope; UN02 compatibility/outcomes partial, UN05/06 operational capability hygiene unverified.

## Findings and scope

Zero confirmed candidates; six specific outstanding verification items. No unsubscribe/database/email action performed.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch07 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
