# ContactUs - Batch 7 shared-function review

Authority: November16 original remaining58 assignment, explicit final Batch7 authorization and final-batch requirements. Eleven pages sequentially; stop after Batch7 and separately authorized reconciliation. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/ContactUs.html; SHA-256 bee3e0affaa27340b79cce171b9599786074b2a525befc745c3f08b77baf3a77. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T14:19:17.8403161-05:00; original inventory completion 2026-11-16T14:19:40.539514-05:00. Frozen original count 7; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CU01 | Public contact submit/session scope | httpdocs/ContactUs.html:167-175,288-299 | C | Submit public support message | Public boundary and server authority | FormData same-origin POST; no bearer | Support contact workflow | High |
| CU02 | Ordinary text sanitation/validation | httpdocs/ContactUs.html:10-11,180-237,293-299 | A | Clean/validate contact fields | Mandatory text defense vs backend validation | Same inputSanitizer/DOMPurify | Name/email/phone/subject/message | High |
| CU03 | HTTP/error display/outcome | httpdocs/ContactUs.html:296-311 | A | Report delivery result | Shared API/status/error contract | response.json without ok; result.status | Support result wording | High |
| CU04 | Draft/pending/explicit mutation | httpdocs/ContactUs.html:167-175,288-312 | C | Preserve unsent message and avoid duplicate sends | Unsaved/pending/no replay | No pending/dirty guards; reset on success | User-composed support message | High |
| CU05 | Field/navigation accessibility | httpdocs/ContactUs.html:167-175,178-237,242-247,302-310 | A | Label inputs and navigate/announce results | Common accessible form rules | Table cells;alert;anchor nested button | Public contact form | High |
| CU06 | Safe output/privacy diagnostics | httpdocs/ContactUs.html:293-311 | A | Render server result and log failures safely | DOM/log/privacy boundary | alert result;console.error error | Contact PII and server error | High |
| CU07 | Assets/environment/cache integration | httpdocs/ContactUs.html:8-11,146-147,156,271-286 | C | Load shared components/select endpoint | Shared cache/environment contract | SW registration;unused BASE_URL | Public utility assets | High |

B-only exclusions: B-only contact prose/phone-format/domain support policy. Server mail validation/abuse/disposition inspected only as endpoint integration; no email sent. Approved animation146-147 preserved.

## Assessments

### CU01 - Partially Conforming

CS-03/09; WA-AUTH-001. Public form175 posts without token;server88-113 validates required string fields and safe errors. Public contact role appropriate. Abuse/rate/origin/deployment boundaries not established by this bounded chain, no privilege bypass claimed.

Local: Support contact workflow. Disposition: RETAIN public support; TEST FIRST abuse controls. Stage6: R16 S6-019/022; R19. Outstanding verification: Unauthenticated allowed use/malformed/oversized/rate/Origin/cross-origin policy. Separate modernization: Optional explicit public endpoint adapter.

### CU02 - Conforming — source verified

CS-07/08; WA-FRONT-001. DOMPurify10/inputSanitizer11 unchanged hash;ordinary text/textarea cleaned on capture before form submit;no secret fields. HTML required/email/phone pattern and backend required string checks independent;mail helper7-14/38-42 HTML-escapes fields.

Local: Name/email/phone/subject/message. Disposition: RETAIN layered text defense; TEST FIRST. Stage6: R17 input. Outstanding verification: CDN unavailable/IME/Unicode/phone/email/markup and template safety. Separate modernization: None.

### CU03 - Confirmed Nonconformance

CS-03/05; WA-API-002. Client300 skips HTTP ok/status, uses result.status for reset. Material delivery subfinding: send_email46-60 awaits resend.emails.send but ignores resolved error and returns success;installed Resend6.4.2 dist744-756/1108-1165/1184 returns {data:null,error} on provider/nonJSON/network failures. Therefore route103-104 can return success and page304-305 reset despite failed send. Source-confirmed conditional path, no email/provider call made.

Local: Support result wording. Disposition: CORRECT provider result check and compatible client outcomes; TEST FIRST; no auto replay. Stage6: R16 S6-018/033; R19 external outcomes; R20. Outstanding verification: Synthetic resolved error/success/reject/lost response with draft preserved; no delivery test run. Separate modernization: D04 API adapter separate from mandatory false-success correction.

### CU04 - Partially Conforming

CS-03/06; WA-SESSION-001. Explicit submit only/no auto retry;form resets only reported success304. No pending/draft/navigation guard;multiple submissions/provider-accepted lost response can be uncertain. CU03 already counts false-success reset, not a new confirmed candidate here.

Local: User-composed support message. Disposition: TEST FIRST pending/draft/manual reconciliation without replay. Stage6: R16 T10 page-only; S6-018. Outstanding verification: Rapid submit/navigation/lost accepted reply;retain composed message. Separate modernization: Optional pending/draft helper.

### CU05 - Confirmed Nonconformance

CS-07; WA-FRONT-001. Fields180-237 have only adjacent table-cell labels/placeholders, no label for/aria-label/labelledby;required subject/message lack even placeholder name. Nested anchor/button167-169 invalid interactive nesting. Alerts302/310 announce modal feedback but do not fix missing field names. One candidate with distinct naming/navigation subfindings.

Local: Public contact form. Disposition: CORRECT semantic names/navigation; preserve layout. Stage6: R17 accessibility. Outstanding verification: Screen reader field names/required/errors/keyboard home/focus/zoom. Separate modernization: Optional form accessibility helper.

### CU06 - Partially Conforming

CS-07/09/10; WA-FRONT-001, WA-LOG-001. alert(result.message) no raw HTML;server safe generic failure,mail generic logs. Browser console.error309 logs Error not FormData;no source logging field data. Provider success bug tracked CU03 separately.

Local: Contact PII and server error. Disposition: RETAIN safe rendering; TEST FIRST diagnostics. Stage6: R16 S6-030; R17. Outstanding verification: Hostile server/name text and synthetic PII log markers; deployed collection unverified. Separate modernization: Optional safe diagnostics.

### CU07 - Partially Conforming

CS-09/10; WA-CACHE-001. SW274 same hash;BASE_URL282 unused because fetch(form.action) uses current origin, so localhost split-host behavior unresolved. Explicitly requested animation exception146 preserved.

Local: Public utility assets. Disposition: RETAIN behavior; TEST FIRST assets/origin. Stage6: R17; R20; S6-024. Outstanding verification: Local split-port/current hosted origin/cache/CDN/CSP/mixed SW. Separate modernization: Optional environment/asset helper.

## Reconciliation/common causes

Seven candidates frozen before selected-page prior/register reconciliation. Backend inspected for actual support endpoint; initial broad route search resolved to server.js. New provider result subfinding lies inside existing CU03, not added inventory candidate. Installed SDK source read only, no execution/network/application test. SDK hash first captured during this review (excluded node_modules from initial bounded baseline), checked again during report generation/final verification.

CU03 RC-PROVIDER-RESULT confirmed material false-success path;client raw HTTP compatibility is another subfinding, not count inflation. CU05 RC-ACCESS-NAMES. CU04 uncertainty/draft consequences remain unverified.

## Findings and scope

Two confirmed candidates: provider failure can be reported as success/reset, and inaccessible field names/interactive nesting. No email sent, no production/runtime failure claimed. Existing security/privacy obligations retained.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch07 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
