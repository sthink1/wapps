# Wonderful Apps — File Development and Delivery Process

**Document ID:** WA-FILE-DELIVERY  
**Version:** 1.1 — Step A database dump reference clarification, November 19, 2026  
**Process approval:** November 19, 2026, by project owner  
**Document status:** Replacement proposal prepared for owner installation; confirm current installed baseline before replacing  
**Intended WA-relative path:** `standard/WA_File_Development_and_Delivery_Process.md`

## 1. Purpose and applicability

This document records the owner's approved **four-step A → B → C → D** process for creating or revising Wonderful Apps (WA) files. It governs the discussion, separate downloadable implementation package, owner-controlled installation, and subsequent local acceptance/commit flow. It is a delivery and approval procedure, **not** authority to change source code, databases, branches, GitHub, Google Drive, Render, or production.

Apply it consistently to new and revised WA files, while observing requirements specific to source, configuration, SQL, documentation, native applications, or other assets. A high-risk or technically inseparable migration may require additional agreed controls; avoid routine stage-by-stage reapproval.

## 2. Authority and governing references

Before preparing changes, follow the current authoritative **root `README.md`, mandatory Section 0**, then inspect the applicable current versions of:

- `standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md` (Core Standards v1.0, approved November 12, 2026)
- `standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md` (Detailed Standards v0.4.1, approved November 12, 2026)
- `standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md` and later explicitly approved clarifications
- `CLAUDE.md`, `TechSummary.md`, and relevant module, testing and branch records
- The exact current authoritative files and known dependencies affected by the proposal

The authoritative WA project source is in Google Drive **`My Drive/wonderfulApp`**. The assistant's access to Google Drive, GitHub, existing local WA files, and all environments is **read-only**. Where approved sources conflict, identify the conflict and seek the owner's decision; do not silently override a governing requirement. A policy approval does not certify current-code compliance or approve deployment.

## 3. Four-step workflow

### A — Discuss and agree on the outcome

1. Identify the existing problem, desired behavior/appearance, affected scope, constraints, expected inputs/outputs, and acceptance criteria.
2. Inspect the authoritative current source, standards, dependent callers, APIs, data effects, security/privacy obligations, browser/native constraints and previous acceptance evidence as applicable.
3. Distinguish requested changes from unrelated improvements. Preserve unrelated behavior, layout, calculations, records, ownership, sessions and permissions.
4. **Database-dump-first rule:** For questions about a WA database, first consult its latest available authoritative `*dump.sql` snapshot, including its schema and recorded data, before asking the owner to execute a query for information already present in that dump. Ask the owner only to confirm whether that specific dump is current for the database and question at hand. Do not request redundant live queries. Request a targeted query only when the dump is unavailable, incomplete, confirmed outdated, or the question requires live/post-dump state. Never treat a test dump as evidence of production state, or vice versa. Review dumps strictly read-only and do not expose database secrets or sensitive records.
5. Ask only questions needed for a safe/correct result. Agree on the target outcome and obtain the owner's authorization to implement. Avoid repeated intermediate approvals for ordinary programming decisions within that authorization.
6. Obtain new approval if a material requirement, scope, security boundary, database operation, or deployment dependency changes. Do not treat discussion or document preparation as permission for mutation of protected locations.

**A exit:** An agreed, traceable scope and acceptance criteria, with implementation authorized by the owner.

### B — Independently prepare one complete implementation ZIP

1. Use the exact current authoritative original of each existing file. Record its WA-relative path and baseline version/hash where available. Reconcile any baseline change during preparation.
2. Prepare **complete final files** at their exact operational WA-relative locations. Mark each as **NEW** or **REPLACE**. Pretty-format new source; maintain readable revised source and obey applicable whole-file HTML formatting requirements. Make no unapproved behavior or appearance changes.
3. For **each REPLACE file**, compare the entire original against the exact final delivered artifact. Supply a complete unified `.diff` and separate per-file `.md` verification report. Identify every substantive and formatting-only change, its authorization, expected impact, relevant tests, and unresolved issues. A one-line change is not exempt.
4. Record SHA-256 hashes of the exact final deliverables, confirm them after packaging, and supply the evidence. New files do not require an original-to-final diff because no original exists; identify them clearly as new.
5. Perform feasible independent syntax, unit, offline, security-relevant and regression checks before delivery. Identify environments/fixtures, actual outcomes and tests still requiring the owner's local/browser validation. Never label an unexecuted test as PASS.
6. Provide one coherent ZIP containing the necessary complete files, installation manifest, tests and rollback directions. Avoid successive small packages or review-only intermediate deliveries unless a real technical or safety boundary demands separation. Do not include unrelated files or `.original` files: the owner maintains pre-change backups with a `_COPY` suffix.
7. **No assistant installation or project mutation.** The ZIP is a proposal/deliverable for the owner's manual installation, not an automatic update.

**B exit:** One downloadable, verified package containing all agreed implementation files and supporting evidence, with any limitations disclosed.

### C — Owner installs the ZIP

1. The owner downloads the package and follows `install/INSTALL.md`.
2. The owner manually copies source/document files to their listed local WA project-relative destinations, replacing only the files marked **REPLACE** and adding only those marked **NEW**.
3. The owner copies/synchronizes the installed project files into the authoritative Google Drive `My Drive/wonderfulApp` location as part of the established manual procedure.
4. The assistant does not modify local files, Google Drive or GitHub. Do not ask the owner to re-explain this already agreed procedure. Request version/hash confirmation only if it materially affects a subsequent safe/correct test or decision.
5. Keep the owner's `_COPY` backups, verification evidence and rollback directions available as appropriate. When version mismatch or unexpected files are found, stop the affected installation and resolve the difference before proceeding.

**C exit:** Owner reports the intended installation has been performed. This report is not by itself an independent byte-for-byte verification of the installed files.

### D — Test locally; commit and synchronize only after success

1. Conduct agreed controlled local acceptance tests using the intended branch/database/environment; distinguish read-only prechecks from actions with side effects.
2. Verify desired outcomes and relevant preservation, regression, security/privacy and data-integrity assertions. Record actual outcomes and unresolved risks.
3. Preserve previously accepted bounded results unless new changes/dependencies make specific retesting necessary. Do not confuse local acceptance with production certification.
4. If a failure occurs, investigate and prepare an appropriately consolidated corrective ZIP under the same evidence and install rules; retest affected assertions.
5. **Only after successful testing and explicit owner authorization** does the owner commit and synchronize on the appropriate development branch. GitHub remains read-only for the assistant.
6. A merge, staging/production deployment, production database change, or release is a **separate approval decision** with its own compatibility, testing, rollback and release gates.

**D exit:** Relevant tests accepted, outstanding limitations documented, and any authorized commit/synchronization performed by the owner. No merge/deployment is implied.

## 4. Mandatory package layout and artifact placement

For example, if a package replaces a page and a service, and adds a standard:

```text
WA_Change_Package.zip
├── httpdocs/
│   └── RevisedPage.html
├── services/
│   └── revisedService.js
├── standard/
│   └── NewStandard.md
├── install/
│   └── INSTALL.md
├── change/
│   ├── RevisedPage.diff
│   ├── RevisedPage_verification.md
│   ├── revisedService.diff
│   ├── revisedService_verification.md
│   ├── SHA256SUMS.txt
│   └── test_evidence.md
└── docs/
    └── [only needed project documentation]
```

**Folder responsibilities:**

| WA-relative folder | Required purpose |
| --- | --- |
| Functional paths such as `httpdocs/`, `services/`, `routes/`, `standard/` | Complete final operational source and newly approved standards at their actual destinations |
| `install/` | `INSTALL.md`, manifest, destination and classification list, verification instructions, and rollback guidance |
| `change/` | Original-to-final unified diffs, separate per-revised-file `.md` reports, test/checksum evidence; no `.original` source copies |
| `docs/` | Relevant general plans, design documents, standards tracking and module documentation |

Do **not** place `INSTALL.md` or installation reports in the ZIP/project root. Do not place unnecessary files in the root. Directories not needed for a specific package may be omitted. A package may also contain a `change/` record for a new file, but it must not misrepresent a nonexistent baseline as a modified original.

## 5. Required installation manifest

Each `install/INSTALL.md` must state at minimum:

- Package title, date, change purpose, approved scope, intended branch and prerequisite baseline
- For **every** installed file: exact WA-relative destination; **NEW** versus **REPLACE**; final SHA-256; and the source of its baseline where relevant
- Prerequisites, installation order and any manual environment/SQL steps **only when separately approved**
- Verification commands or comparison steps and expected results, including checksums
- Tests performed before delivery, tests still needed after installation, and any stated limitations
- Recovery/rollback instructions, including the owner's `_COPY` original backups, with any database/external side-effect limitations explicitly identified
- Explicit distinction between file installation, local acceptance, Git commit/sync, merge, and deployment approval

Never include secrets, private credentials or sensitive production records in a deliverable.

## 6. Change-control safeguards and exclusions

- Keep the approved Core/Detailed Standards fully applicable. In particular, preserve functionality/appearance, inspect complete source differences, maintain traceability and obey risk-based tests.
- The process minimizes **unnecessary** approval cycles; it does not waive explicit owner authorization or create permission for destructive changes.
- Existing tested results, subscription acceptance evidence and Stage 6 testing records remain valid within their documented bounds. New code may require targeted retesting, not automatic repetition of everything already passed.
- Source-file preparation is distinct from running changes against any database or production environment; those actions need their own safeguards and approval.
- GitHub, Google Drive and local WA remain read-only for the assistant. The owner performs installation and authorized version-control operations.
- Do not introduce `.original` files into ZIPs. Owner-maintained `_COPY` files are separate rollback originals, not replacement deliverables.

## 7. Adoption and maintenance

The **A → B → C → D process**, including the mandatory `install/` directory, was explicitly approved by the owner on **November 19, 2026**. Version 1.1 adds the subsequently approved Step A database-dump-first clarification. This replacement is **prepared separately** and does not claim that the earlier version was installed; the owner must verify the current authoritative baseline before replacing the file.

Any future change to this procedure requires owner agreement and, if this file already exists in the authoritative project, a full replacement-file diff, per-file verification report, checksum and appropriate tests. A future cross-reference from the root `README.md` can be proposed separately; this package does **not** modify `README.md`.
