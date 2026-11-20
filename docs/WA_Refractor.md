# Wonderful Apps — Refactoring Project Plan

**Document:** `docs/WA_Refractor.md`  
**Status:** Owner-approved planning direction; implementation not authorized by this document  
**Decision date:** November 19, 2026  
**Future branch:** `refactor` (exact spelling; create only after the owner-authorized `reviseLogIn` → `main` merge)  
**Primary objective:** Implement the approved Wonderful Apps programming standards in controlled phases without changing existing behavior, appearance, calculations, permissions, privacy, or security except where explicitly authorized.

## 1. Purpose and boundaries

Refactor the WA application to conform to approved standards over time. **Phase 1 focuses on JavaScript standardization** across shared `.js` files and JavaScript embedded in HTML pages. The wider, comprehensive standards initiative is a *future multi-phase objective*, not authorization to revise unrelated HTML, CSS, server code, or database schemas during Phase 1.

The refactoring project begins only after Stage 6 readiness/release decisions, the controlled `reviseLogIn` → `main` merge, and a separately approved refactoring baseline. The owner creates the `refactor` branch from the approved `main` baseline. No branch creation, merge, staging deployment, production deployment, database change, or source installation is authorized by this document.

The existing **40-hour production-readiness planning ceiling does not automatically apply** to this separate future refactoring project. Scope, resource budget, and milestones will be estimated and agreed once the post-merge baseline and remaining findings are reconciled.

## 2. Mandatory authoritative references

Before each proposed change, read and identify versions of:

- Root `README.md`, particularly mandatory Section 0.
- `standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md` (owner-approved November 12, 2026 notwithstanding filename).
- `standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md` (owner-approved).
- `standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md`, including subsequent owner-approved clarifications.
- `standard/WA_File_Development_and_Delivery_Process.md` (approved A → B → C → D delivery procedure, including database-dump-first guidance).
- `CLAUDE.md`, `TechSummary.md`, relevant source, dependencies and accepted test records.
- HTML/shared-function analysis in `download/WA_Shared_Function_Review_Remaining_2026-11-16/` and the initial-five review, reconciliation, and master findings register.

The November 15–16 review considered 63 HTML pages, 516 candidate items and 124 source-level functional candidate occurrences. **These are review findings, not 124 independently demonstrated runtime defects.** Reconcile findings against the actual post-merge source; do not assume every examined file must be revised.

## 3. Primary preservation rule

**CS-01 governs every change.** No unapproved change to application design, markup, CSS, business calculations, input/output payloads, date logic, workflows, user feedback, permissions, security controls, privacy behavior, PWA/native behavior, or external interfaces. Refactoring an inline `<script>` in an HTML file is permitted within approved JavaScript scope, but unrelated HTML/CSS alteration is not.

No opportunistic cleanups, unreviewed broad formatting changes, silent behavior changes, or global find-and-replace migrations. Apparent improvements that require changed outcomes or exceptions must be presented for a separate owner decision. Comparison and tests must document any intentionally authorized changes in behavior, including error classification or handling.

## 4. Phase 1 — JavaScript standards implementation

**Goal:** Consistent, backward-compatible JavaScript behavior while keeping distinct page contracts intact.

### 4.1 Shared foundation

Inspect existing `httpdocs/js/waPlatform.js` (`WA.api`, `WA.session`), `inputSanitizer.js`, `usageTracking.js`, and relevant consumers. Decide from verified source evidence whether to adapt the current shared module or introduce a narrowly scoped companion. Do not create a redundant framework by default.

Potential work, subject to individual design verification:

1. Preserve HTTP status distinctions (401, 403, 5xx, network errors) and support existing response/error envelope variations; never blindly change `Response` versus parsed-JSON return contracts.
2. Use compatible session and token flows while protecting cross-tab/session behavior and avoiding automatic replay of uncertain POST/PUT/PATCH/DELETE mutations.
3. Preserve unsaved drafts after failed requests where relevant, without altering successful workflows.
4. Reuse safe, applicable sanitization/encoding and utility functions; **never trim or rewrite password bytes**.
5. Keep specialized page conventions, including Budget error markers, Family Tree permissions/capability tokens and TNNA distinctions.
6. Consider accessible dialog behavior as a separately assessed scope: the November review includes accessibility findings, but no blanket permission to change HTML structure or CSS.

### 4.2 Incremental adoption

First validate the shared adapter contract with representative existing pages and negative-path tests. Then migrate **cohesive, dependency-aware groups** (possible groupings: Budget, ETF, Family Tree, account/utilities). The previous seven review batches are evidence sources, **not mandatory delivery boundaries**. Prioritize risk and dependency, not page counts. Reconcile each targeted page's baseline, callers, request/response behavior and regressions before changing it.

## 5. Approved A → B → C → D implementation workflow

### A — Discuss and agree

For each coherent phase or group, establish issue, proposed outcomes, exact scope/exclusions, acceptance criteria, relevant authoritative versions, and necessary implementation authorization. One approved group can cover numerous related files; avoid repeated micro-approvals. Material scope, security, privacy or behavior changes require separate approval. For database questions first inspect the appropriate latest authoritative `*dump.sql`; ask whether it is current and request queries only when information is missing, outdated, or genuinely requires a live check.

### B — Build, independently verify, and deliver

**Preferred proposed implementation environment: Codex operating inside VS Code**, with read-only access to the owner's *local WA project source*. Codex may inspect the authorized branch and files, but **must never write, edit, create, rename or delete anything within the local WA project**, its Git worktree or `.git` directory, Google Drive, GitHub or any database/environment. All generated work must be written to a **separate, owner-designated output directory outside WA project paths**. The owner may review that directory and download/copy the resulting ZIP for manual installation. The same rule applies to ChatGPT and other assistants.

For each approved coherent group, deliver **one ZIP** including:

- Complete, readable final new/replacement source files at exact WA-relative operational paths (such as `httpdocs/`, `services/`, `standard/`).
- `install/INSTALL.md` and installation manifest identifying every file, `NEW` or `REPLACE`, its WA-relative destination, compatibility prerequisites, installation checks and rollback steps.
- For **each revised file**, a complete authoritative-original-versus-exact-final unified `.diff` and a separate `.md` verification report accounting for substantive and formatting changes, relevant dependencies, permitted outcomes, unverified effects and actual tests.
- SHA-256 evidence for exact delivered final files, plus factual test evidence under `change/`.
- `docs/` for general documentation, only if needed. No `.original` files, unrelated files, or root-level `INSTALL.md`.

Codex may automate evidence generation and run feasible source, parser, syntax, unit and offline regression tests **without mutating WA directories or databases**. Record tests actually executed, results, environment and limitations. Do not claim that unexecuted browser/hosted tests passed. Before delivery, verify exact final bytes against the diff and checksums. Reconcile any authoritative-source drift; do not silently overwrite intervening work.

Large Step B tasks must be divided into durable, independently testable deliverables with a clear status ledger and resumable handoff. **Do not assume an AI service can run indefinitely, without quota interruption or across closed conversations.** Packaging can be automated without waiving the mandatory per-file evidence.

### C — Owner installs

The owner manually copies the approved ZIP's operational files into the correct local WA paths, then copies/synchronizes them to authoritative Google Drive `My Drive/wonderfulApp` according to the established process. Assistants do not install, commit, sync or change authoritative files. Confirm a particular installed version only where necessary for safety or acceptance.

### D — Local acceptance, then controlled branch actions

Perform targeted local browser/API acceptance and regression tests against the designated **test** environment (established command: `node --env-file=.env.test server.js`, after confirming safe configuration). Preserve previously accepted bounded evidence unless relevant regression risk exists. Address failures through consolidated corrective ZIPs. Only after successful tests and the owner's explicit approval does the **owner** commit/synchronize to the `refactor` branch. Hosted staging tests, independent review, merging, deployments and database actions require separate authorizations and release gates.

## 6. Suggested milestones (planning only)

1. **Baseline and inventory:** Confirm Stage 6 completion/merge state and clean `main` baseline; owner creates `refactor`; reconcile the November findings against exact current files and test evidence.
2. **Shared JS contract:** Define and verify adapter compatibility and offline test fixtures; deliver package; perform local acceptance.
3. **Incremental page groups:** Refactor affected JavaScript by cohesive group; deliver, install, test, resolve and approve each group before committing.
4. **Integration review:** Test the combined branch, preservation requirements, PWA/browser cases, error paths and security/privacy regressions; independently review relevant changes.
5. **Future phases:** Discuss and authorize remaining standards implementation separately; define scope and budget, rather than assuming all findings are Phase 1 work.
6. **Release decision:** Distinct staging/production planning and explicit owner-authorized merge/deployment only after required gates.

## 7. Evidence and acceptance register

For every group maintain a concise ledger listing: authoritative baseline and file hashes, approved scope, files affected, findings addressed or deferred, shared-contract dependencies, ZIP identifier, per-file diff/report/checksum, executed offline checks, owner-run local tests, known limitations, regressions and rollback readiness, owner acceptance, and any subsequent commit ID. This ledger supplements and does **not replace** mandatory individual verification reports.

A group is ready for an owner commit only if its approved scope is implemented, all delivered differences are explained, feasible tests are recorded, local acceptance succeeds, no unapproved regression is outstanding, and the owner authorizes the commit. A phase is not production-certified merely because the group tests passed.

## 8. Open decisions deferred until commencement

- Exact post-merge baseline, branch creation date and current approved standards versions.
- Reconciled finding inventory, specific pages needing change, shared helper/API design and group sequencing.
- Per-phase scope and estimates, resource/usage constraints and interruption-safe checkpoints.
- Test cases, device/browser matrix, fixture strategy, security regression coverage, and hosted staging availability.
- Any scope expansion (markup/accessibility, backend or data) and the corresponding separate approval.

**No implementation or environment mutation is authorized by this document.** It is a future-work planning reference for the owner-approved A → B → C → D process.
