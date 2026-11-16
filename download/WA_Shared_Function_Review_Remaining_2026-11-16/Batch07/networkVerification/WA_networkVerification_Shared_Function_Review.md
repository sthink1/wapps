# networkVerification - Batch 7 shared-function review

Authority: November16 original remaining58 assignment, explicit final Batch7 authorization and final-batch requirements. Eleven pages sequentially; stop after Batch7 and separately authorized reconciliation. Local source primary. Corev1.0, Detailedv0.4.1/3A-3C approved November12 despite DRAFT filenames; D01-D14. README Section0/AGENTS explicitly read, tool auto-loading not assumed; CLAUDE/TechSummary and relevant Stage6 evidence consulted. No source revision or application tests authorized.

Local httpdocs/networkVerification.html; SHA-256 f63ad045b441ccba7688eb24edaaa2d110fe2dee5da50da4eb951d1707162046. Branch reviseLogIn; HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Not proof of Drive/deployment revision. No unnecessary remote retrieval.

## Preserved independent discovery

Start 2026-11-16T14:16:20.7208425-05:00; original inventory completion 2026-11-16T14:16:39.459253-05:00. Frozen original count 6; post-reconciliation additions0. Frozen before selected-page prior reports/register consultation. Source locations include exact HTML/companion ranges.

| ID | Name | Source locations | A/C | Purpose | Shared rationale | Shared implementation | Local responsibilities | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NV01 | Public verification capability/preview | httpdocs/networkVerification.html:100-102,148-178 | C | Read scoped email request | Public token authority contract | Encoded token GET; no bearer | Person/tree consent preview | High |
| NV02 | Explicit consent mutation/outcome | httpdocs/networkVerification.html:113-145,180-203 | C | Approve/decline once confirmed | No automatic mutation/replay; HTTP outcome contract | Explicit POST; no WA.api | Consent choice semantics | High |
| NV03 | Async failure/recovery | httpdocs/networkVerification.html:180-207 | A | Retain useful state on failure | Shared user-facing error rules | Load catch only; click promises uncaught | Pending choice UI | High |
| NV04 | Safe DOM/accessibility | httpdocs/networkVerification.html:85-96,117-145,150-173,197-206 | A | Render prompt and status safely | Common DOM and live feedback | textContent; named buttons | Choice-specific wording | High |
| NV05 | Capability privacy/cache boundary | httpdocs/networkVerification.html:4-7,79,100-102,154-156,184-195 | C | Protect link capability | Public token/referrer/cache policy | URL query remains; local CSS | Email link workflow | High |
| NV06 | Session-independent authorization boundary | httpdocs/networkVerification.html:100-111,154-166,184-195 | C | Separate emailed permission from browser login | Capability binding/revocation and account switch | No browser identity storage | Network inclusion only | High |

B-only exclusions: B-only consent prompt wording/tree network business rules. Token/enum are protocol capability values, not ordinary free-text fields; do not indiscriminately sanitize tokens.

## Assessments

### NV01 - Conforming — source verified

CS-03/09; WA-AUTH-001. GET preview only;requestedChoice changes confirmation wording, never sends automatic POST. Server hashes token96-111,404unknown/410expired115,returns limited person/tree fields. No login requirement for emailed capability.

Local: Person/tree consent preview. Disposition: RETAIN explicit confirmation; TEST FIRST. Stage6: R16 S6-019; R17. Outstanding verification: Expired/invalid/responded/choice mismatch previews and email scanner GETs. Separate modernization: None.

### NV02 - Confirmed Nonconformance

CS-03/05; WA-API-002. POST184-199 never checks response.ok;parsed error payload uses message or unconditional recorded-success fallback. Non2xx with missing message can be labelled recorded;401/403/409/410/500 status/category discarded. No automatic replay exists.

Local: Consent choice semantics. Disposition: CORRECT typed HTTP outcome; TEST FIRST. Stage6: R16 S6-008/018/033; T09 page-only. Outstanding verification: Error shapes/nonJSON/lost success; preserve explicit consent/no replay. Separate modernization: D04 compatible adapter.

### NV03 - Confirmed Nonconformance

CS-03/06; WA-SESSION-001. 180 hides actions and says Saving;click handlers202-203 do not catch respond promise. Network/JSON rejection leaves Saving and hidden actions;load.catch205 only covers initial GET. Separate pending recovery subfinding under shared error/outcome root.

Local: Pending choice UI. Disposition: CORRECT caught pending/uncertain outcome without automatic replay. Stage6: R16 S6-018; T10 page-only; R17. Outstanding verification: Offline/timeout/parse failure/double click and manual reconciliation before retry. Separate modernization: Optional pending helper separate from mandatory recovery.

### NV04 - Confirmed Nonconformance

CS-07; WA-FRONT-001. textContent prevents raw HTML;buttons named. Intro85 and status96 lack live/status roles or managed focus;async updates150-173/198 unannounced.

Local: Choice-specific wording. Disposition: CORRECT accessible asynchronous feedback. Stage6: R17 accessibility. Outstanding verification: Screen reader/keyboard/status/prompt changes; source text encoding to confirm in browser. Separate modernization: Optional status helper.

### NV05 - Unverified

CS-09/10; WA-CACHE-001, WA-LOG-001. Token stays in query/history;no page no-referrer/no-store policy shown. No actual headers/referrer/log capture, so leak not established. Capability strings encoded for path.

Local: Email link workflow. Disposition: TEST FIRST token/referrer/cache/log boundaries. Stage6: R16 S6-024/030; R20. Outstanding verification: Deployed headers/browser history/access-log minimization synthetic markers only. Separate modernization: Optional public capability policy.

### NV06 - Conforming — source verified

CS-03/06/09; WA-AUTH-001. Server POST127-154 locks token row,validates allowed response/expiry/current stored email,approval requires current IncludeInSearch;repeat returns recorded result. Updates scoped PersonID/verification ID then commits149;no explicit subsequent external action. Browser account independent by design.

Local: Network inclusion only. Disposition: RETAIN fail-closed capability checks; TEST FIRST. Stage6: R16 S6-009/017/019; R19. Outstanding verification: Concurrent approve/decline/email changes/stale token/revocation/schema constraints; no database probe. Separate modernization: None.

## Reconciliation/common causes

Six candidates frozen before selected-page register/prior consultation. Route handler independently inspected for this public capability; broad notification service search found no matching handler there, resolved to actual route code. No previous Family Tree review repeated.

NV02/NV03 preserve two distinct HTTP outcome and async recovery subfindings under RC-HTTP-OUTCOME; NV04 RC-ACCESS-STATUS. Three confirmed candidate occurrences, not three independent system causes.

## Findings and scope

Three source nonconformances in page error/pending/accessibility integration. Server capability gates source-positive within named boundaries, no confirmed privacy bypass here. Batch5 M03 remains separate mandatory security issue.

APPROVED-POLICY is distinct from implementation observation and TEST-PASS-BOUNDED. Source-verified covers named static properties only; confirmed nonconformance is a demonstrated source departure, not necessarily an observed exploit. Runtime/data/schema/provider consequences remain unverified unless explicitly supported. Direct fetch/helper duplication alone is not a vulnerability; D04/D08 phased design remains. Preserve domain-specific rules and appearance; no unnecessary shared helper proposed.

CS01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance/preservation/approval. Other standards mapped per candidate; unrelated FamilyTree privacy/admin transfer/native rules N/A unless actual integration cited. Batch5 FTOneTreeMerge M03 remains a mandatory Stage6 security-disposition item, not optional modernization; source unchanged, examination not repeated.

R10/R14/R15, November15 R16-75 T12 90/90 bounded offline PASS, later T06 3/3 and selected T11 log evidence preserved, not rerun. Actual browser shared-client T09 and real unsaved-form T10 remain open. R17-R20 and independent implementation review remain required. No application tests/builds/probes, DB/Render/network/browser/deployment or Git mutations. Only new Batch07 reports/ZIP; existing files/registers/tests read-only. No replacement/diff applies: no source revised.
