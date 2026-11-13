# Wonderful Apps — Core Programming Standards

**Document ID:** WA-CORE-STD  
**Version:** 1.0 — **APPROVED by project owner November 12, 2026; governing Core Standards**  
**Prepared:** November 12, 2026  
**Purpose:** Mandatory daily development checklist for owner-authorized WA work.  
**Detailed reference:** `standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md` (Step 3 consolidated and approved by the owner).  
**Approved policy record:** `standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md` (D01–D14), together with subsequently approved 3A/3B/3C clarifications.  

> **Interpretation:** The owner approved the Core v1.0 and Detailed Standards v0.4.1 documents on November 12, 2026, together with D01–D14 and Step 3A/3B/3C clarifications. These are governing rules for owner-authorized WA development. “MUST” states a normative obligation; approval does **not** certify that current code complies or grant authority to implement, install, test against live services, deploy, or waive a detailed requirement. The historical `DRAFT` filenames are retained solely for existing cross-document link compatibility pending a separately reviewed renaming/link update.

## Read before any programming work

1. Read this Core document and **CS-01** first; identify the applicable rules and the corresponding detailed clauses.
2. Read the owner-approved decisions and applicable portions of the Detailed Standards, `CLAUDE.md`, `TechSummary.md`, relevant Stage 6 records, and the **current authoritative source** in Google Drive.
3. Identify the precise change the owner authorized, its existing behavior and appearance, downstream consumers, and required evidence. If scope or standards conflict, **stop the affected change and obtain owner clarification**.
4. Under the owner's current restrictions, Google Drive, GitHub and WA local project files are **read-only for assistants/reviewers**. Create proposals separately for owner download and manual installation. No project/deployment/database changes without explicit authorization.

## Twelve numbered Core Standards

### CS-01 — Preserve functionality and appearance; prove every source difference

**Primary rule.** Change **only** what the owner expressly approved. Preserve every other WA feature, layout, style, navigation path, calculation, data operation, API behavior, authentication/session flow, privacy behavior, and existing application-specific function. Do not make opportunistic improvements or silently simplify features.

For **every revised existing file**, obtain and identify the **exact authoritative original** and compare it with the **complete final deliverable**, including one-line changes. Examine and account for **every added, removed, moved, rewritten, and formatting-only difference**. Deliver the complete replacement, a unified `.diff` (or equivalent complete machine-readable comparison), and a **separate `.md` verification report** mapping each substantive change to owner approval and separately itemizing formatting changes. Record and recheck the **SHA-256 of the exact final delivered file**. If the authoritative baseline changed, reconcile before installation. Source comparison **does not replace** functional, visual or regression tests. Unexplained or unapproved differences block submission.

**Detailed references:** `WA-PRESERVE-001`, `WA-CORE-001`, Annex D. **Policy:** Step 3A; D13/D14.

### CS-02 — Use authoritative sources and obtain explicit approval

Start from current authoritative `My Drive/wonderfulApp` files; identify the original file ID/revision and any differing GitHub, local, staging, or schema baselines. Verify the permitted task scope, callers, affected files and applicable standards before proposing changes. Never assume a historical pinned commit is current. Prepare separate downloads only. No writing to Drive, GitHub, local WA, Render, or database systems under read-only review authorization. **Owner approval is required before installation**, including for supporting changes and exceptions.

**Detailed references:** `WA-CORE-001`, `WA-REVIEW-001`; Annexes D, G. **Policy:** D13/D14.

### CS-03 — Apply the approved authentication and session contracts

Use the approved centralized credential boundaries and shared `WA.session` / `WA.api` where compatible; account for documented legacy callers and specialized clients. Preserve web versus TNNA/native distinctions, login, restoration, logout, KMLI, 401/403/network/5xx handling, unsaved forms, and identity across tabs. **Never replay an uncertain POST/PUT/PATCH/DELETE mutation automatically.** D09 requires independent sessions on multiple devices, safe rotation/replay containment, cross-tab protection, and supersession of an earlier remembered session **only after successful verification**. Fail closed if safe Web Locks coordination is unavailable. D08 mandates a **reviewed future modernization** away from unnecessary persistent JavaScript-readable tokens, **not an already selected storage implementation**.

**Detailed references:** `WA-AUTH-001`, `WA-SESSION-001`, `WA-NATIVE-001`. **Policy:** D07–D10.

### CS-04 — Enforce authorization, ownership, and full verified-admin authority

Every method/path must have defined credential scope, permissions, subscription entitlement, and applicable user/Tree/Person ownership. **Hidden buttons and subscription eligibility do not replace server authorization.** Ordinary administrator recognition MUST use `services/administratorAccess.js` and current `UsersT`: `IsAdministrator = 1` **AND** normalized database `UserName` matching configured `ADMIN_USERNAME`. Never use hard-coded administrator IDs or username/JWT claims alone. Under D01 and approved 3B-01, a properly verified administrator has **full Family Tree privileges** (view, create, edit, delete, privacy administration, record ownership transfer) without ordinary-user privacy-code or ownership restrictions, while preserving transactions, validation, relationship integrity, audits and external cleanup. Administrator **account-transfer completion** is the separately bounded D02 workflow, not an unrestricted bypass.

**Detailed references:** `WA-SEC-ADMIN-001`, `WA-API-001`, `WA-PRIV-002`, Annexes A/E. **Policy:** D01/D02; revised 3B-01.

### CS-05 — Use safe API contracts and controlled error disclosure

Only deliberately created, **approved public client errors** may disclose bounded, safe business/validation messages via the D03 shared `WeakSet` classification and controlled creation contract. **Never disclose unexpected exception text, even with HTTP 4xx status.** Preserve existing response and HTTP semantics during narrowly scoped changes. D04 chooses `{ "error": "Safe message", "code": "OPTIONAL_CODE" }` as the **future flat format**, with gradual producer migration and compatibility parsing for existing string, nested and domain-specific responses. Do not conflate R16-75 package **preparation approval** with installation authority.

**Detailed references:** `WA-ERROR-001`, `WA-API-002`, `WA-LOG-001`, Annex B. **Policy:** D03–D05.

### CS-06 — Protect database integrity and external side effects

Validate all untrusted input on the server; use parameterized SQL values and allowlisted dynamic identifiers; enforce authorized record/Tree relationships. Preserve supported database/schema versions, UTC and date-only semantics, transaction/lock boundaries, affected-row expectations, connection release, rollback, and compensating handling for external objects and email. Never turn a uniqueness or provider failure into unsafe disclosure or unauthorized access.

**Detailed references:** `WA-DATA-001`, `WA-ENV-001`, `WA-API-001`. **Policy:** D13; existing database standards.

### CS-07 — Deliver pretty-formatted, safe frontend/source code

**Every new hand-maintained source file must be pretty formatted**, consistently indented, human-readable and syntax-valid, whether HTML, CSS, JS, SQL, JSON, PowerShell, Java, Markdown or another language. Do not use minified/obfuscated code as authoritative source. Revised files must remain readable and comply with applicable existing style requirements. **Existing HTML whole-file formatting rules still apply**, but any unrelated formatting differences require separate identification/review and approval; formatting must not alter UI or behavior. Preserve light-mode, script order, IDs/selectors and safe DOM rendering. Never sanitize passwords in ways that change entered bytes. Follow established free-text sanitization and backend validation.

**Detailed references:** `WA-FORMAT-001`, `WA-FRONT-001`, `WA-PRESERVE-001`. **Policy:** Step 3A; existing `TechSummary.md` §14.

### CS-08 — Reuse shared components without breaking specialized flows

Prefer approved shared components for authentication, error provenance, request transport, administrator verification, logging and tracking. **Using or loading a shared script is not proof that the page actually uses its API.** Record direct-fetch legacy consumers and migrate incrementally with tests; do not globally rewrite `fetch`. Preserve Family Tree page-token injection, related-person redaction, multipart uploads, public email-link workflows, usage tracking, and TNNA behavior. Each exception must be justified, bounded and tested.

**Detailed references:** `WA-SHARED-001`, `WA-PRIV-002`, `WA-SESSION-001`, Annexes A/C. **Policy:** D03/D07–D10/D13.

### CS-09 — Protect privacy, credentials, and diagnostics

Do not leak passwords, tokens, secrets, private records, sensitive URLs or exception diagnostics to logs, responses, browser Console or reports. Apply controlled capability tokens, Origin/CSRF, safe rendering and sensitive cache policies. **Honor the owner's explicit D06 policy:** Family Tree privacy codes may be four characters, remain recoverable, and need not be encrypted/hashed or forcibly reset; recovery of the existing code may go only to the registered verified email after appropriate authorization. Preserve attempt controls and document the accepted residual risks. This **does not** weaken protections for high-entropy capability tokens.

**Detailed references:** `WA-PRIV-001`, `WA-PRIV-002`, `WA-LOG-001`, `WA-CACHE-001`, `WA-FRONT-001`. **Policy:** D06 and Step 3B-02.

### CS-10 — Maintain browser, PWA, native, and public-API compatibility

Respect the D07 support targets: Windows Chrome/Edge/Firefox/DuckDuckGo, macOS/iOS/iPadOS Safari, and Android Chrome; supported-platform tests are **not assumed passed**. Preserve PWA/script/service-worker version compatibility, protected cache behavior, browser reload/restoration and the separate D10 TNNA lifetime/offline model. Inventory endpoints by method and consumer; preserve public email/geocoding behavior. **D11 expressly defers new hardening for `/send-email` and `/api/geocode/reverse`; keep the findings visible, do not quietly change or remove current controls.**

**Detailed references:** `WA-CACHE-001`, `WA-NATIVE-001`, `WA-API-001`, `WA-ABUSE-001`, `WA-ENV-001`, Annexes A/C. **Policy:** D07/D10/D11; Step 3B-04.

### CS-11 — Prove changes using risk-based tests and preserved evidence

For **every change**, define the affected requirements, test fixtures, exact baseline, stimulus, expected result, prohibited effects and evidence. Run appropriate source/syntax/functional/visual/integration tests; security changes require negative, misuse, error and concurrency cases. Confirm no unapproved feature/appearance regression. A proposed acceptance case is **not a PASS**. Keep prior bounded R10/R14/R15/R16 test evidence, and rerun only assertions affected by new code or dependencies, with stated rationale. Require independent final Stage 6 implementation review prior to merge/production decisions.

**Detailed references:** `WA-REVIEW-001`, `WA-PRESERVE-001`, Annexes D/E/H. **Policy:** D13/D14.

### CS-12 — Maintain standards, traceability, and owner-controlled release

Every deliverable must identify applicable Core IDs, Detailed IDs, D01–D14 decisions, authorized scope, exact file versions, complete per-file diffs/verification reports, formatting review, tests, risks, rollback and outstanding questions. Keep a versioned decision/exception/drift record. The root project entrypoint and compatible AI instructions should direct workers to the **approved** Core, Detailed Standards and Decision Register before work; neither a README nor tool-specific conventions guarantees automatic reading by all tools. Do not declare conformance, install, modify project repositories or deploy based on a draft or unverified test. **Explicit owner approval** remains the final change gate.

**Detailed references:** `WA-CORE-001`, `WA-REVIEW-001`, Annexes D/G/H. **Policy:** D12–D14; Step 3C-05.

## Daily change compliance checklist (copy into every proposed change report)

- [ ] **CS-01:** Authorized scope and existing appearance/behavior identified; every original-to-final source difference accounted for.
- [ ] **CS-02:** Exact authoritative baseline and current-version identity verified; read-only restrictions followed.
- [ ] **CS-03:** Auth/session/token impacts assessed (or documented not applicable).
- [ ] **CS-04:** Endpoint/admin/ownership/subscription impacts assessed (or not applicable).
- [ ] **CS-05:** Errors, statuses, public messages and API consumer compatibility assessed.
- [ ] **CS-06:** Input, SQL, transactions, schemas, data integrity and external side effects assessed.
- [ ] **CS-07:** Pretty formatting, frontend behavior, accessibility, syntax, and formatting-only diffs reviewed.
- [ ] **CS-08:** Shared modules, specialized exceptions and dependent consumers reviewed.
- [ ] **CS-09:** Credentials, privacy, logs, error/cache disclosure and D06 policy checked.
- [ ] **CS-10:** Browser/PWA/native/public endpoint and D11 deferral effects checked.
- [ ] **CS-11:** Risk-based tests specified/performed; evidence and prior-test impact stated.
- [ ] **CS-12:** Approval, exception, rollback and manual-install status documented.
- [ ] For **each revised file**: complete proposed file + complete unified `.diff` + separate `.md` verification summary + final SHA-256 recorded and rechecked.
- [ ] For **each new file**: complete pretty-formatted source, purpose, dependency review and applicable syntax/acceptance checks.
- [ ] Final baseline reconfirmed immediately before any owner installation; if stale, stop and reconcile.
- [ ] No installation or deployment claim without explicit approval and recorded evidence.

### Required report footer

```text
Task / owner-approved scope:
Core standards checked: CS-01 ... CS-12 (applicable or N/A with reason)
Detailed standards checked:
Original authoritative Drive file IDs/revisions:
Original file hashes / reconciliation status:
Revised file names and exact final SHA-256 values:
Complete .diff and separate .md verification-summary paths:
Intended behavior/appearance changes:
All other substantive changes: NONE / individually authorized references
Formatting-only changes, especially whole-file HTML:
Tests (NOT RUN / PASS-BOUNDED / FAIL / BLOCKED) and evidence:
Affected previous Stage 6 assertions:
Residual risks / rollback instructions:
Owner approval / installation status: NOT AUTHORIZED unless expressly approved
```

## Cross-reference / effective status

The Detailed Standards clauses are the full technical reference and cannot be weakened by this shortened index. If a Core summary conflicts with an approved detailed or owner decision, **stop** and resolve the discrepancy; no automated precedence choice. The Detailed Standards v0.4.1 and this Core v1.0 were **approved by the owner on November 12, 2026**. Their historical `DRAFT` filenames remain as installed reference paths; any later rename and related link changes require a separately compared, owner-approved package. The standards approval does not authorize changes to root README, `CLAUDE.md`, GitHub, project files, staging or production.

**Change history:** v1.0 drafted November 12, 2026; owner-approved November 12, 2026. November 13, 2026: approval-status text reconciled without changing the twelve rules. This separate document revision is for manual owner installation; no application-code change or runtime test is implied.
