# changePassword - Batch 7 shared-function review

Authority: November16 original remaining58 assignment, explicit final Batch7 authorization and final-batch requirements. Eleven pages sequentially; stop after Batch7 and separately authorized reconciliation. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/changePassword.html; SHA-256 e0a3afe25b4a8f1e36b63e080ba6f4b1bf3b3ae64c2bf0a4c7a1377573511900. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T14:05:10.9445988-05:00; original inventory completion 2026-11-16T14:05:54.873582-05:00. Frozen original count 8; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP01 | Session verification and startup | httpdocs/changePassword.html:53-67,101 | A | Verify authenticated web session before form | WA auth/restoration/current session | Direct session-status; no WA.session import | Password-change web-only form | High |
| CP02 | HTTP/error/auth-denial contract | httpdocs/changePassword.html:60-66,80-98 | C | Distinguish credential/permission/network/error shapes | WA API/session failure categories | Local fetch/raw JSON/status branches | Incorrect-current-password special case | High |
| CP03 | Password byte preservation and visibility | httpdocs/changePassword.html:35-41,68-77,83 | A | Preserve exact password input and confirmation | WA credential sanitation boundaries | Raw .value; no generic sanitizer | Existing length/different policy local | High |
| CP04 | Server current-password/revocation authority | httpdocs/changePassword.html:80-95 | C | Change current account and revoke sessions safely | WA auth/ownership/DB/session guarantees | users/change-password server route | Revocation/all-device success statement | High |
| CP05 | Pending mutation/draft/uncertain outcome | httpdocs/changePassword.html:73-100 | A | Submit once and preserve failure input/no replay | WA no replay/unsaved/committed outcome | Disable+try/finally; direct POST | Password form reset on success | High |
| CP06 | Account switch/late response isolation | httpdocs/changePassword.html:53-65,82,87,95 | A | Bind credential/clearing/UI to active identity | WA session identity fencing | Captured token; unconditional clearLogin | Current account/password outcome | High |
| CP07 | Accessible messages/forms/navigation | httpdocs/changePassword.html:34-45,54,68-72 | A | Label fields/announce outcome/control visibility | WA accessible fields/status/focus | Labels/live status/textContent | Password visibility control and return link | High |
| CP08 | Sensitive caching/referrer/log boundaries | httpdocs/changePassword.html:7-8,60,81-83,97-98 | A | Contain credentials/error/token exposure | WA cache/privacy/diagnostics | No-store requests/meta, no-referrer | Authenticated password mutation | High |

B-only exclusions: B-only: password reuse/length policy remains existing behavior, no new policy approval inferred. Password inputs intentionally unsanitized including SHOW type=text. No generic text sanitizer/usage tracking requirement invented for security form.

## Assessments

### CP01 - Partially Conforming

CS-03/08; WA-SESSION-001, WA-AUTH-001. 53 captures bearer;57-67 directly verifies web session; no restore before missing-token redirect. Backend273-289 validates current web session. Phased legacy transport permitted.

Local: Password-change web-only form. Disposition: TEST FIRST; MIGRATE LATER preserving credentials. Stage6: R16 S6-005/008; R17. Outstanding verification: Cookie-only/expired JWT/current session/503 availability. Separate modernization: D08 compatible restoration.

### CP02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. 61/91-95 treats403 like invalid credential and clears login, even server296-297 uses403 for web-scope/Origin denials.97 untyped data.error may object-coerce and misses nested messages. Wrong-password401 special branch is retained.

Local: Incorrect-current-password special case. Disposition: CORRECT category/parser distinctions; TEST FIRST. Stage6: R16 S6-008/018/033. Outstanding verification: 401 wrong current vs invalid session,403 origin/permission,503/nonJSON/nested/network; preserve typed meanings. Separate modernization: D04 gradual errors.

### CP03 - Conforming — source verified

CS-03/07/09; WA-AUTH-001, WA-FRONT-001. 75 raw .value,83 JSON strings, no trim/sanitizer even when visibility70 changes type. Confirmation/length/different checks are existing policy, no new policy inferred.

Local: Existing length/different policy local. Disposition: RETAIN byte fidelity; TEST FIRST. Stage6: R17 password/IME/browser; R16 auth. Outstanding verification: Spaces/Unicode/password manager/show-hide exact bytes; backend hashing compatibility. Separate modernization: None.

### CP04 - Conforming — source verified

CS-03/04/06; WA-AUTH-001, WA-DATA-001. Server295-317 auth web+Origin,current user locked/fence304/password compare306/hash308/update309/revokeAll310/commit311. Email failure312-313 caught after commit, success remains. Full revokeAll security-version behavior not re-certified.

Local: Revocation/all-device success statement. Disposition: RETAIN gates/commit notice distinction; TEST FIRST. Stage6: R16 S6-009/018/029; R19. Outstanding verification: Wrong account/current password,all-device revocation/rollback/notification failure and session concurrency; accepted prior revocation tests preserved. Separate modernization: None.

### CP05 - Partially Conforming

CS-03/06; WA-SESSION-001. 78 disabled until finally99, no automatic replay; failure input preserved, success reset/hide87. Network failure98 gives retry guidance without explicit possible-commit state; this uncertainty needs browser evidence.

Local: Password form reset on success. Disposition: RETAIN no replay; TEST FIRST committed outcome recovery. Stage6: R16 T10/S6-018. Outstanding verification: Lost response after changed password, no duplicate automatic send, current draft/state. Separate modernization: Optional pending/outcome helper.

### CP06 - Unverified

CS-03/09; WA-SESSION-001. 53 captured bearer and clearLogin55/87/95 unconditionally removes current storage; no identity fence after verify/change. Late old-account response can affect a new login; actual incident not observed.

Local: Current account/password outcome. Disposition: TEST FIRST; OWNER DECISION. Stage6: R16 S6-007/027; R19. Outstanding verification: Account switch/logout during verification/change and late401/success. Separate modernization: None.

### CP07 - Partially Conforming

CS-07; WA-FRONT-001. 35-40 labels,44 role/status/live,54 textContent; visibility button has text but no pressed/controls state. No source-proved unusable form; exact screen-reader/focus behavior unverified.

Local: Password visibility control and return link. Disposition: RETAIN named/live controls; TEST FIRST. Stage6: R17 accessibility. Outstanding verification: Focus on validity/reset/hidden form,visibility state/password manager. Separate modernization: Optional accessible visibility primitive.

### CP08 - Partially Conforming

CS-09/10; WA-CACHE-001, WA-LOG-001. 7 meta no-store/8 no-referrer,requests60/81 no-store; no client console/password/token log. Actual HTTP/no-store error middleware/log breadth not established from meta alone.

Local: Authenticated password mutation. Disposition: RETAIN; TEST FIRST. Stage6: R16 S6-030/024; R17. Outstanding verification: Headers/error/cache/browser history and synthetic secret markers. Separate modernization: None.

## Reconciliation/common causes

Eight candidates independently frozen before prior/register reconciliation; no additions. Shared server evidence reused only by current identity; this page has no WA.api actual call. Narrow server contract checked for new integration, no completed password/login examination or accepted tests repeated. Initial attempted securityFence filename did not exist; no evidence inferred from that failed lookup. M03 and Batch6 exceptions carried forward.

CP02 RC-HTTP-DENIAL/PARSER. CP06 RC-IDENTITY unverified; password bytes and postcommit mail catch bounded positives.

## Findings and scope

One confirmed candidate: failure semantics/parser. No passwords processed, reset, session changed, or tests executed.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch07 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
