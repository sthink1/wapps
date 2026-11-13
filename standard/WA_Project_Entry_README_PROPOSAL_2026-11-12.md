# Wonderful Apps — Development Entry Instructions

**PROPOSED root `README.md` content — NOT INSTALLED; NOT YET APPROVED AS A ROOT-FILE REPLACEMENT**  
**Prepared:** November 12, 2026  
**Placement target (only after baseline reconciliation and owner approval):** root of `My Drive/wonderfulApp`.

> **READ BEFORE STARTING ANY WONDERFUL APPS PROGRAMMING OR REVIEW TASK.** This proposed entrypoint must be reconciled with the actual current root `README.md`, if present. It is **not** permission to replace an existing file. Follow the project's mandatory original-to-final comparison procedure, including `.diff`, separate `.md` verification, SHA-256 and owner approval, before installing a replacement.

## Where the project standards live

1. `standard/WA_Core_Programming_Standards.md` — **approved version once adopted**, the mandatory daily checklist. At present the prepared file `WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md` is **a draft**, not an authoritative replacement.
2. `standard/WA_Detailed_Technical_Standards.md` — **approved version once adopted**, the full requirements and annexes. At present `WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md` remains a **draft pending whole-document approval**.
3. `standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md` — recorded owner-approved decisions D01–D14. Later explicit owner approvals of 3A/3B/3C also apply.
4. Root `CLAUDE.md`, `TechSummary.md`, relevant Stage 6 plans, open items, and latest approved exception/decision records — existing architecture and behavior. Conflicts require owner resolution; draft text never silently displaces approved instructions.
5. **Current authoritative code:** Google Drive `My Drive/wonderfulApp`. GitHub/local/staging are supporting evidence and may differ; do not assume an old SHA is current.

## The most important rule — CS-01

**Never alter existing functionality, behavior, appearance, navigation, calculations or business rules except as expressly approved by the owner.** Every revised source file must be compared **in full** with its exact authoritative original. Deliver the **complete proposed file**, a **unified `.diff`**, a **separate `.md` verification report**, and a **verified SHA-256 checksum of the exact final deliverable**, including for one-line fixes. Account for every substantive and formatting-only difference. Run the relevant behavior/appearance/regression tests. If the baseline changes, reconcile before installation.

**All new hand-maintained source files must be pretty formatted**, consistently indented, readable and syntax-valid. Existing mandatory HTML whole-file formatting requirements remain applicable; separately identify and obtain approval for out-of-scope formatting changes.

## Mandatory task start

- Identify the exact owner-approved change and the current source files, dependent applications, interfaces and schema.
- Read the approved Core and the applicable Detailed Standards requirements. Record each applicable CS / WA ID, or `N/A` with a reason.
- Read the approved decisions and project architecture. Preserve domain exceptions, particularly Family Tree privacy, TNNA and browser session handling.
- Define acceptance and regression tests. No PASS claim without an executed, documented test.
- Submit **separate downloadable proposals only**, with required full-file comparison and evidence, and obtain approval before owner installation.

## Non-negotiable access and release boundaries

Google Drive, GitHub and local WA project files are **read-only for ChatGPT and reviewing design engineers**. Do not create/modify/delete files in those project locations, commit/push/merge, change databases/configuration, or modify staging/production unless the owner separately authorizes the specific action. Current proposals are prepared outside project locations for manual owner review. Existing Stage 6 test evidence must be preserved; independent final implementation review is still required before a production decision.

## Why this entrypoint exists

A root `README.md` makes standards discoverable for humans, but **opening a folder does not guarantee automatic reading** by programmers or AI systems. Compatible tool-specific instruction files can point here, and task-review checklists must provide compliance evidence. Project standards become authoritative only when the owner approves the precise version and it is installed through the approved manual process.

**Status:** Root entry text proposal. No baseline comparison of an existing root `README.md` is claimed in this document. No root-file installation authorized.
