# forgotPassWord - Batch 7 shared-function review

Authority: November16 original remaining58 assignment, explicit final Batch7 authorization and final-batch requirements. Eleven pages sequentially; stop after Batch7 and separately authorized reconciliation. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/forgotPassWord.html; SHA-256 9232f79f56701e892439a272f4f46cb2944e4b043fbf34a08d8b9ad8de1ed721. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T14:06:46.5271723-05:00; original inventory completion 2026-11-16T14:07:25.592410-05:00. Frozen original count 8; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FR01 | Reset capability/preview purpose | httpdocs/forgotPassWord.html:58-97,118-130 | C | Validate reset link without mutating until explicit intent | WA public capability/session separation | POST validate-reset-token and reset-password | One-use account password reset | High |
| FR02 | Recovery request/anti-enumeration/external delivery | httpdocs/forgotPassWord.html:31-38,104-113 | C | Issue password reset without exposing account existence | WA auth/recovery/DB-external outcomes | users/forgot-password endpoint | Stored registered account email | High |
| FR03 | Reset authority/revocation integration | httpdocs/forgotPassWord.html:118-132 | C | Reset only bound current account and revoke old sessions | WA token/security-version/transaction contracts | users/reset-password server route | Reset/new-password policy | High |
| FR04 | Exact password/typed email boundaries | httpdocs/forgotPassWord.html:35,43-46,107,114-125 | A | Preserve passwords and normalize typed email separately | WA password/sanitizer boundaries | Raw password .value; trimmed email | Length/confirmation local | High |
| FR05 | HTTP/pending/no replay/drafts | httpdocs/forgotPassWord.html:79-103,104-113,118-132 | A | Retain status and truthful uncertain outcomes | WA API/no replay/unsaved contract | post returns ok/status/data; disable/finally | Reset token lifecycle after success/failure | High |
| FR06 | Capability exposure/cache/log hygiene | httpdocs/forgotPassWord.html:7-8,58-62,99-103,127 | A | Remove secret URL and contain sensitive requests | WA capability/referrer/cache/diagnostics | history.replaceState; no-store/no-referrer | In-memory reset token | High |
| FR07 | Safe DOM/accessible feedback | httpdocs/forgotPassWord.html:34-52,63-69,98,114-117 | A | Display safe actionable feedback and labelled form | WA DOM/accessibility | textContent/live statuses/labels | Show/hide and invalid-link UI | High |
| FR08 | Asynchronous capability/account lifecycle | httpdocs/forgotPassWord.html:59-97,104-132 | A | Keep pending link validation/reset state coherent | WA async state/identity/capability binding | Local mutable resetToken; no browser-session substitution | Current opened reset capability | High |

B-only exclusions: B-only: existing password length/confirmation/recovery copy, no new password policy. Typed email not generic free-text field; credentials/capabilities intentionally not sanitized. No WA.api import required for specialized public capability endpoints.

## Assessments

### FR01 - Conforming — source verified

CS-03/04/09; WA-AUTH-001, WA-PRIV-001. 58-97 captures hex96 capability and POST validates only; server400-413 Origin/type/hash/expiry/used/revoked/current SecurityVersion read-only check. Actual reset explicit separate POST. No current browser-login authority substituted.

Local: One-use account password reset. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-019/029; R19. Outstanding verification: Wrong/expired/used/revoked/cross-purpose/version-changed token; preview never consumes. Separate modernization: None.

### FR02 - Conforming — source verified

CS-03/06/09; WA-AUTH-001, WA-DATA-001, WA-LOG-001. Server358-395 Origin, resetLimiter call367 including unknown emails, locked account/version, random48 bytes/hash/30min/revoke prior tokens, registered DB email; commits then catches delivery failure393 and returns generic result395. Generic anti-enumeration is intentional, not ordinary committed-save-failure bug. Threshold/runtime delivery not certified.

Local: Stored registered account email. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-022/029/030; R19. Outstanding verification: Known/unknown generic response/timing, limiter fairness/counters, delivery-failure recovery; no email sent. Separate modernization: None.

### FR03 - Conforming — source verified

CS-03/04/06; WA-AUTH-001, WA-DATA-001. Server416-445 Origin, token/password types, locked account+capability/current version, use/revoke other reset grants, password update/revokeAll then commit. Changed notice after commit caught; browser cookie cleared only after successful transaction.

Local: Reset/new-password policy. Disposition: RETAIN gates; TEST FIRST. Stage6: R16 S6-009/029; R19. Outstanding verification: Simultaneous reset/password change, rollback, all-device/version revocation and expired/reused denial; prior passes not rerun. Separate modernization: None.

### FR04 - Conforming — source verified

CS-03/07/09; WA-FRONT-001, WA-AUTH-001. 120-125 raw password/confirmation values, SHOW115 only changes type;107 trims typed email separately. No generic sanitizer or password byte rewrite.

Local: Length/confirmation local. Disposition: RETAIN; TEST FIRST. Stage6: R17 credential/browser. Outstanding verification: Unicode/spaces/password managers/visibility and server compare fidelity. Separate modernization: None.

### FR05 - Partially Conforming

CS-03/05/08; WA-SESSION-001, WA-API-002. 99-103 preserves ok/status/data; disable/finally105/123, no auto replay, draft retained on failure.130 untyped data.error and generic network text omit detailed uncertainty; current server string errors safe, no source proof error presented as success.

Local: Reset token lifecycle after success/failure. Disposition: TEST FIRST; MIGRATE LATER compatible outcome/parser. Stage6: R16 T10 public-page only; S6-018/033. Outstanding verification: Lost reply after reset commit vs invalid token,503/nonJSON/nested errors, fields retained/no replay. Separate modernization: D04 compatible public parser.

### FR06 - Conforming — source verified

CS-09/10; WA-PRIV-001, WA-CACHE-001, WA-LOG-001. 7 no-referrer/8meta no-store;61 immediately history.replaceState removes query;token memory only;100 request no-store, server sensitive handlers explicit no-store. No client logs. HTTP early-error/cache/logger breadth unverified.

Local: In-memory reset token. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-019/024/030; R17. Outstanding verification: Original email URL logs/referrer/history/error cache and synthetic secret markers. Separate modernization: None.

### FR07 - Partially Conforming

CS-07; WA-FRONT-001. Labelled email/password controls,38/49 live status,98 textContent. Visibility button has dynamic name;focus after invalid/hidden/reset and pressed/controls state unverified, no unsupported severe accessibility claim.

Local: Show/hide and invalid-link UI. Disposition: RETAIN; TEST FIRST. Stage6: R17 accessibility. Outstanding verification: Screen-reader hidden sections/password visibility/status/focus. Separate modernization: Optional accessible visibility helper.

### FR08 - Unverified

CS-03/09; WA-SESSION-001, WA-PRIV-001. Local resetToken cleared on validation outage88/92 and success127; no login mutation in page. Public capability remains for target account independent of current browser account. Late validation/reset/reopened-link behavior not executed.

Local: Current opened reset capability. Disposition: TEST FIRST. Stage6: R16 S6-007/029; R19. Outstanding verification: Account switch/other device reset, stale validity response/used token and recovery of uncertain result. Separate modernization: None.

## Reconciliation/common causes

Eight candidates independently frozen before register/prior-page evidence; no additions. Specialized public capability flow correctly does not require WA.api/browser login. Narrow current users/fence/revocation source checked; no completed login/password test repeated. M03/Batch6 exceptions carried forward unchanged.

No confirmed candidate departure established within this bounded source review. FR05 public parser/outcome partial; FR08 runtime capability/identity verification open. Shared positive patterns not universal certification.

## Findings and scope

Zero confirmed candidates; all eight still have specific verification needs. No account/password/token operation executed.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch07 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
