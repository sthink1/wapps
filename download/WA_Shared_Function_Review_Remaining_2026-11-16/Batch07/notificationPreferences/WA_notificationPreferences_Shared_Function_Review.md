# notificationPreferences - Batch 7 shared-function review

Authority: November16 original remaining58 assignment, explicit final Batch7 authorization and final-batch requirements. Eleven pages sequentially; stop after Batch7 and separately authorized reconciliation. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/notificationPreferences.html; SHA-256 b9c38c7d95c0c2f6c6d3c260af4d2575f7c0106cb42b89d37f3bfbf23f3fe324. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T14:17:18.4590995-05:00; original inventory completion 2026-11-16T14:17:38.214079-05:00. Frozen original count 7; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NP01 | Captured authenticated startup/restore | httpdocs/notificationPreferences.html:133-148,158-170,196-198 | A | Load signed-in preferences | WA session restoration contract | Raw fetch/token snapshot | Current preference values | High |
| NP02 | HTTP error/denial classification | httpdocs/notificationPreferences.html:158-169,181-193 | A | Distinguish authorization and transient failure | Shared API outcome/error contract | Plain Errors;401 startup clear | Preference error wording | High |
| NP03 | Identity and asynchronous response fencing | httpdocs/notificationPreferences.html:136-147,151-169,182-190 | A | Prevent stale identity/state application | Current-account asynchronous contract | No identity/version fence | Loaded/saved checkbox state | High |
| NP04 | Draft/pending/explicit save lifecycle | httpdocs/notificationPreferences.html:101-129,151-170,172-198 | C | Preserve preference edits/outcomes | Unsaved/pending/no replay | No dirty/pending guards | Four boolean preferences | High |
| NP05 | Server user and required-message authority | httpdocs/notificationPreferences.html:89-121,174-189 | C | Update only own optional consent | Server authorization/consent contract | Authenticated routes; no client user ID | Required vs optional category policy | High |
| NP06 | Safe accessible boolean input/output | httpdocs/notificationPreferences.html:99-129,151-155,190-197 | A | Label controls and announce status | Common accessibility/DOM rules | Wrapped labels;role=status;textContent | Boolean controls no ordinary text | High |
| NP07 | Environment/cache/log scope | httpdocs/notificationPreferences.html:4-7,133-148,158-161,182-185 | C | Select origin and protect session | Environment/headers/log policies | Localhost fallback; bearer header | Utility page assets | High |

B-only exclusions: B-only category business policy/SMS provider status. Checkbox booleans not free-text sanitation targets. CSS independently seen, no layout alterations proposed.

## Assessments

### NP01 - Partially Conforming

CS-03/09; WA-SESSION-001; D08. 136 captures token;missing token139 redirects without WA.session restoration;raw requests158/182. Incremental adoption permitted, no runtime remembered-session result claimed.

Local: Current preference values. Disposition: RETAIN; TEST FIRST; MIGRATE LATER. Stage6: R16 S6-005/007. Outstanding verification: Remembered/expired session initialization. Separate modernization: D08 phased session integration.

### NP02 - Confirmed Nonconformance

CS-03/05; WA-API-002. Startup clears token on401 only;168/188 plain Error loses HTTP status/category/type and nested safe errors. PUT401 never follows startup path;authorization vs transient handling inconsistent. Both check ok, no false-success allegation.

Local: Preference error wording. Disposition: CORRECT compatible status/category; TEST FIRST. Stage6: R16 S6-008/018/033; T09 page-only. Outstanding verification: 401/403/503/network/nonJSON/nested payload; retain edits/no auto replay. Separate modernization: D04 compatible API adoption.

### NP03 - Unverified

CS-03/09; WA-SESSION-001. Snapshot136;late401 removes current token163 andlate load/save169/189 overwrite checkbox state without account/revision fencing. Source absence confirmed; cross-account data incident not observed.

Local: Loaded/saved checkbox state. Disposition: TEST FIRST current identity/version fence. Stage6: R16 S6-007/027; R17. Outstanding verification: A-to-B switch and edit-during-load/save race. Separate modernization: Optional identity adapter.

### NP04 - Partially Conforming

CS-03/06; WA-SESSION-001. Explicit PUT no replay;no dirty/pending/navigation guard;late responses applyPreferences. Server updatePreferences commits417 then awaits getPreferences418;read failure enters rollback/catch after commit and can report failure despite changed consent. Source-confirmed ambiguous-outcome path, runtime consequence unverified.

Local: Four boolean preferences. Disposition: TEST FIRST draft/pending/reconciliation; no automatic replay. Stage6: R16 S6-018; T10 page-only; R19. Outstanding verification: Lost reply/postcommit read failure/repeated explicit save/edit during pending/navigation. Separate modernization: Optional pending/outcome helper; preserve page consent rules.

### NP05 - Conforming — source verified

CS-03/06/09; WA-AUTH-001. Routes27-50 require auth,current req.user.userId;allowlist four boolean optional fields andreject nonbooleans. Required ACCOUNT/SUBSCRIPTION categories service7/93 cannot be disabled through this form. Scoped update/suppression/consent in transaction357-417.

Local: Required vs optional category policy. Disposition: RETAIN authority; TEST FIRST. Stage6: R16 S6-009/019; R19. Outstanding verification: Cross-account/unknown fields/booleans/concurrent unsubscribe/preference save and log linkage. Separate modernization: None.

### NP06 - Conforming — source verified

CS-07; WA-FRONT-001. Wrapped labels101-119 androle=status129;textContent190/192/197. Boolean inputs do not need free-text sanitation. Explicitly requested animation exemption70-71 preserved; no generic motion change proposed.

Local: Boolean controls no ordinary text. Disposition: RETAIN labels/live region and approved appearance; TEST FIRST. Stage6: R17 accessibility/DOM. Outstanding verification: Keyboard/announcements/zoom/animation ownership record and false-valued state. Separate modernization: None.

### NP07 - Unverified

CS-09/10; WA-CACHE-001, WA-LOG-001. Localhost-origin rule133-135;bearer header only, no credential logging shown. No deployment/header/CORS/cache evidence obtained.

Local: Utility page assets. Disposition: TEST FIRST release environment/headers. Stage6: R16 S6-024/030; R20. Outstanding verification: Local/hosted origin/CORS/cache and synthetic secret logs. Separate modernization: Optional environment/asset policy.

## Reconciliation/common causes

Seven candidates frozen before selected-page register/prior reconciliation. Backend optional-consent/commit chain independently inspected; no DB calls/tests executed. Explicit animation exception retained. Postcommit getPreferences is a read-after-commit failure path, not an external email send or demonstrated rollback failure.

NP02 RC-HTTP-CLASSIFICATION. NP03 RC-IDENTITY-FENCE and NP04 RC-DRAFT/COMMIT-OUTCOME remain bounded unverified consequences. Required-message controls server-owned, not bypassed.

## Findings and scope

One confirmed error-contract candidate. Important source-confirmed commit-then-read ambiguity retained for future tests; actual failure/consent loss not observed.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch07 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
