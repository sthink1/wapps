# Wonderful Apps — File-by-File Standards Compliance and Correction Handoff

**Date:** November 15, 2026  
**Purpose:** Begin a new ChatGPT conversation devoted to examining **every applicable Wonderful Apps project file**, determining whether it conforms to the owner-approved Core and Detailed Technical Standards, correcting nonconforming files in controlled units, and verifying each correction.  
**Status:** Handoff prepared; **the comprehensive project-wide audit has not begun or been completed**.  
**Prepared artifact:** This handoff is a new downloadable file, not a modification to the WA repository or Google Drive.

## 1. Instructions for the new chat

**Start from the user's actual objective, not another specification-writing exercise:** audit each file, determine which applicable rules it meets/fails, correct actual nonconformances while preserving behavior, deliver full revised files for manual installation, and test until verification/approved exception is complete. Use the existing register as the tracking instrument. Proceed **one file at a time**, with dependent files inspected read-only as necessary. Do not start rewriting unrelated files.

Suggested first message to paste into the new chat:

> Continue the Wonderful Apps file-by-file standards compliance audit and correction project using the attached November 15 handoff. Use the authoritative `My Drive/wonderfulApp` project folder and the installed approved standards; GitHub `sthink1/wapps` branch `reviseLogIn` is read-only corroboration. Examine each applicable WA file, assess every relevant standard, identify and correct true nonconformances with complete downloadable replacements and rigorous verification, then update the comprehensive compliance register. Proceed one file at a time, preserving all existing functionality and current Stage 6 testing evidence. Do not modify Google Drive, GitHub, my existing local WA files, databases, Render, `main`, or production. Begin with source inventory reconciliation and the first file review; do not conduct a new standards drafting exercise.

## 2. Governing authority and restrictions

- **Authoritative source files:** Google Drive **My Drive / wonderfulApp**, folder ID `1SBkEcRIb-ekv83-EoZXHkH0cderSHWec`; Windows Drive location `G:\My Drive\wonderfulApp`. Read-only to assistant.
- **Repository comparison:** GitHub `sthink1/wapps`, branch `reviseLogIn`, **read-only**. Do not create/edit/commit/push/delete or otherwise mutate the repo. Current user-reported/independently verified synchronized checkpoint: full SHA `f794eb7cf697fb29e7c0d5f2749cc113cbb2a4d3` (Nov 15). Verify the current branch/file identities afresh before each revision; this is a historical checkpoint, **not a permanent version pin**.
- **Local WA project root:** `C:\AppProjectwDB\WonderfulAppsRender`. Existing project files are read-only to assistant. User installs/downloads replacements manually. When providing the user a test command, **run it from the WA project root with relative paths** (`.\tests\...`, `.\docs\...`), **not Downloads**, and clearly disclose any evidence files a script writes.
- **Render:** `wapps-stage6-test` is staging; screenshot showed commit `f794eb7` Live Nov 15, 2026 at 8:39 AM. Do not access/change hosted deployment, service configuration, production service, or database destructively. Owner executes explicitly controlled hosted/browser checks. Never assume Live means the entire acceptance suite passed.
- **No GitHub, Google Drive, project-local, DB, Render, or production mutation by assistant.** Prepare self-contained **downloadable full files** separately; installation and deployment remain with owner. Temporary creation in the assistant's `/mnt/data` for downloadable artifacts is permitted.
- Preserve every relevant feature, appearance, behavior, data contract, navigation, form state, privacy and authorization, frontend/browser/PWA behavior, native TNNA behavior, and prior accepted regressions unless the owner explicitly approves change. No inferred policy tightening; recognize documented deferrals and compatible legacy contracts.

## 3. Normative standards / decision documents (reopen current installed copies)

Retrieve and read the actual current files, preferably from `standard/` (verify installed paths, not guessed):

1. `WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md` — **12 approved Core rules CS-01 through CS-12**.
2. `WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md` — **19 detailed standards**, annexes and approved clarification decisions.
3. `WA_Standards_Decision_Register_v1.0_2026-11-12.md` — approved/explicitly deferred D01–D14 decisions.
4. Root `README.md` and applicable `CLAUDE.md`, `AGENTS.md`, `copilot-instructions.md`, `TechSummary.md` as project-entry/legacy context. Resolve authoritative conflicts using approved precedence; do not silently elevate older documentation over the approved standards.
5. `docs/WA_Standards_Compliance_Register.md` — **register v1.0 prepared Nov 15**; user still needs to place it in the project. If not yet installed, ask the owner to install or use the handed-off downloadable copy, but do not presume it is authoritative without confirmation.
6. `docs/Stage6_OpenItems.md`, `docs/Stage6_Current_Testing_Status.md`, `docs/Stage6_Render_TestPlan.md`, and Nov 11 B0–B9 standardization audits; refer to exact current versions and provenance. Earlier records can contain outdated statuses.

Important interpretation:
- CS-08 / WA-SHARED-001 prefer shared helpers; **legacy direct `fetch` is a tracked migration item, not automatically a vulnerability or a mandate for untested wholesale replacement**.
- WA-SESSION-001: use `WA.session` / `WA.api` for compatible new work and migrate legacy in measured groups.
- D03: only approved expected public 4xx errors reveal bounded messages; preserve controlled provenance.
- D04: flat error envelope is a **future migration direction**; transitional clients must support existing flat/nested responses.
- D01: centrally verified WA administrator has full specified Family Tree privileges, with both DB/admin and configured-user checks as approved.
- D10: preserve TNNA native session behavior, do not invent an absolute lifetime cap.
- D11: public geocode/Contact Us safeguards intentionally deferred; do not change without scope approval.
- Distinguish: **conforming**, **nonconforming**, **legacy migration debt**, **exception candidate**, **owner-approved exception**, **insufficient evidence**. A conditional or unverified issue is not a proven defect.

## 4. Initial register and findings (do not lose)

The register `WA_Standards_Compliance_Register.md` v1.0 (Nov 15) has **12 Core Standards**, **19 Detailed Standards**, **37 detailed S6 issue cross-references**, and **18 seeded corrective findings WA-CF-001–WA-CF-018**. It is a **seeded baseline** and **not a completed file inventory/audit**.

Highlighted cross-file findings:

| Finding | File or area | Status / needed review |
|---|---|---|
| WA-CF-001 | `httpdocs/BinForm.html` | Uses direct Bearer `apiFetch` despite loading shared script; nested `{error:{message}}` can stringify as `[object Object]`; candidate for compatible correction. Preserve Budget `(be)` suffix, successful writes, form values, no mutation replay. |
| WA-CF-002 | `httpdocs/etfCompare.html` | Direct token/fetch; preserve adjusted-close anchor rules, comparisons, charts, provider/rate-limit behavior. |
| WA-CF-003 | `httpdocs/js/FTPerson.js` | Direct Bearer/fetch including uploads; preserve `X-FT-Page-Token`, private-person permissions, FormData content types. |
| WA-CF-004 | `httpdocs/js/FTPrivacy.js` | Specialized `window.fetch` interception; **exception candidate only**, privacy security integration requires careful review. |
| WA-CF-005 | `httpdocs/js/usageTracking.js` | Shared requests plus direct `keepalive`/unload path; possible intentional exception; preserve R15 lifecycle evidence. |
| WA-CF-006 | `httpdocs/js/waPlatform.js` | Nested API error parsing corrected/installed at `f794eb7`; offline T09 passed, **actual browser T09 still pending**. |
| WA-CF-007 | `server.js` | R16-75 central error sanitization/early no-store corrected at `f794eb7`; selected hosted T06/T11 bounded pass. Do not reopen without new evidence. |
| WA-CF-008 | `httpdocs/home.html` | Sampled mixed `WA.api`/direct fetch; full consumer inventory pending; retain R10 behavior. |
| WA-CF-009 | `routes/weights.js`, `routes/budget.js`, `routes/etf.js` | Potential redundant inner auth; not a proved bypass; do not remove without contract tracing. |
| WA-CF-010 | `server.js` + geocode | Documented public exception / D11 deferred policy. |
| WA-CF-011 | `services/administratorAccess.js` and Family Tree callers | Verify administrator invariant and approved full privileges; distinguish code from older conflicting documentation. |
| WA-CF-012 | `TechSummary.md` | Administrator description and formatting-rule reconciliation candidate. |
| WA-CF-013 | `httpdocs/amortization.html` | Previously reported Console token property; requires current inspection; separate unrelated day-31 issue deferred. |
| WA-CF-014 | Public verification / unsubscribe routes | Token method/security matrix outstanding, not a proved defect. |
| WA-CF-015 | HTML, SW, JS cache assets | Mixed-version/service-worker consistency review. |
| WA-CF-016 | All routes and API consumers | Complete route-to-consumer inventory missing. |
| WA-CF-017 | Web/native/staging platform | Browser/native/security acceptance incomplete. |
| WA-CF-018 | Entire project | Complete file inventory/audit/closure project. |

S6-005 is the primary existing shared-API migration issue. S6-008, S6-018, S6-017, S6-025, S6-033 are particularly relevant. **S6-002 and S6-037 were Verified Closed only within bounded historic scope**. The inspected open-items register's formal detailed table reaches S6-037; references to S6-039 and S6-041 exist elsewhere but original S6-038–041 definitions/statuses need reconciliation; never invent them.

## 5. R16-75 and accepted test history — do not reset

- T01–T05: bounded offline PASS.
- T06: initial simulated coverage partial; **Nov 15 actual hosted probe 3/3 PASS**: malformed JSON HTTP 400/no-store/safe `Request failed`; URL-encoded parameter-limit HTTP 413/no-store/safe `Request failed`; incomplete multipart HTTP 500/no-store/safe `Internal Server Error`. This is **bounded**, not every parser/request type.
- T07–T08: bounded offline PASS.
- T09: corrected shared `waPlatform.js` nested error compatibility, offline PASS; **real-browser shared-client error presentation pending**.
- T10: 11/11 isolated offline, combined earlier 47/47; **real-browser unsaved-form / session failure acceptance pending**. In particular, `BinForm.html` currently calls its own `apiFetch()` and is **not evidence of shared `WA.api` behavior**.
- T11: bounded offline 6/6 and hosted malformed-response no-store 3/3; Render log evidence:
  `2026-11-15 13:56:14 [ERROR]: Request error (HTTP 400; message omitted)`
  `2026-11-15 13:56:14 [ERROR]: Request error (HTTP 413; message omitted)`
  `2026-11-15 13:56:14 [ERROR]: Request error (HTTP 500; message omitted)`.
  No raw exception details in these three shown entries. Do not claim all logging paths audited.
- T12: 90/90 combined bounded offline regressions; R10/R14/R15 previously accepted **bounded** and not to be automatically rerun or reclassified.
- Current R16-75 remaining browser work: T09 and T10. Project-wide acceptance, independent reviewer gate, and other Stage 6 items remain open. **New standards effort must not silently close them.**

## 6. Required one-file-at-a-time workflow

**Wave 0 — inventory foundation:** First obtain a **complete, reconciled file inventory** of authoritative `My Drive/wonderfulApp`, recursively. List path, file type, size/revision/hash where supported, source category, applicability, audit state, existing issue links and disposition. Do not call folder names and file counts a complete inventory unless traversal/pagination completes. Identify generated, dependency, binary, backup, historical, copied and documentation files; categorize their audit requirements, and **do not delete or assume obsolete**. Ensure no source file omitted. Preserve the registry's initial 18 findings and add per-file rows rather than replacing history.

**For each review unit:**

1. Choose the next file by documented stable order/priority. **Suggested first focused file:** `httpdocs/BinForm.html` (WA-CF-001) because a specific live source inconsistency has been demonstrated. It is permissible to prioritize a critical auth/privacy file first if the owner prefers; do not require broad new clarification merely to start the inventory.
2. Fetch the **complete current authoritative Drive file**, record ID/path/revision/modified date/hash when available, and read approved standards. Compare byte-for-byte with the current relevant GitHub branch and owner's installed baseline if possible; report discrepancies instead of picking one silently.
3. Trace dependencies and all callers, endpoint methods, auth state, data reads/writes, UI selectors, DOM, CSS/JS and caches as applicable. Review **each applicable standard**, recording Not applicable with rationale where needed. Classify each finding as confirmed failure, permitted legacy requiring migration, possible risk, or approved exception.
4. Present a concise **file-specific compliance report**: confirmed compliant aspects; exact deficiencies with line references; relevant CS/WA IDs and S6/WA-CF IDs; security/data/UI impact; fix approach; test plan; anything not yet verifiable. For a genuinely conforming file, record audited/verified evidence and move on; do not refactor for cosmetic preference alone.
5. When a correction is within the owner's approved standardization scope and no new policy choice is required, prepare a **complete revised downloadable file**. Do not request redundant broad approval on every ordinary mechanical correction; seek explicit owner decision for material contract changes, unresolved security policy/exception, data migrations, unusual scope expansion or production operations.
6. Preserve unrelated code exactly where feasible. Pretty-format new code per WA-FORMAT-001 without uncontrolled changes. Generate **original-to-final complete `.diff`**, individual **`*_Change_Verification.md`**, reproducible tests/evidence, relevant dependency report, rollback/install notes and a `change/SHA256SUMS.json` including all payload files other than manifest. Verify original and final SHA-256, archive completeness and integrity.
7. Keep all artifacts in appropriate structure (for a project-rooted package: `wonderfulApp/httpdocs/...`, `wonderfulApp/tests/...`, `wonderfulApp/docs/...`, `wonderfulApp/change/...`); no direct overwrite. The owner installs the download and reports results. Provide Windows commands from `C:\AppProjectwDB\WonderfulAppsRender` using project-relative paths; disclose any test-generated files in advance.
8. Test on isolation first, then owner-authorized local/staging/browser where the change needs it. Preserve R10/R14/R15/R16 bounded results but perform relevant change-specific regression. Never claim hosted/browser pass based on simulation.
9. Update a **separate downloadable full register replacement** or append-only reconciled update reflecting each reviewed file's actual audit/correction/installation/test/closure evidence. Do not mark `Verified Closed` until owner installation, required tests and exception/review gates complete; an uninstalled proposed file is not compliant in production.
10. Proceed to the next file. Periodically report counts for *inventoried, audited, conforming, nonconforming, corrections prepared, owner-installed, verified closed, approved exceptions and unresolved* using **verified denominators** only.

## 7. First new-chat deliverable and stop point

**Begin with Wave 0**: retrieve the current approved documents and the actual register; conduct a bounded but real recursive inventory of authoritative Drive project files. If full traversal cannot complete in one turn, issue a transparent partial inventory with coverage and continue. Then begin **WA-CF-001 `httpdocs/BinForm.html`** (unless audit priority is demonstrably higher elsewhere). The first review should present actual source-specific findings and an approved-standard mapping. Do not revise the file before checking current complete source and dependent API contracts. For a safe, understood nonconformance, produce a downloadable complete replacement and its evidence in the same workflow when feasible. The intended outcome is file correction, not just a list of problems.

**Non-goals:** rewriting standards afresh; duplicating R16-75 T01–T12 offline work; declaring all Stage 6 issues closed; automatically rewriting all `fetch` calls; weakening Family Tree privacy; changing browser/TNNA token policy; modifying production; or editing connected authoritative stores.

## 8. Handoff source inventory

- Downloadable `WA_Standards_Compliance_Register.md` v1.0 prepared in prior conversation on Nov 15; reopen its exact bytes in the new chat if uploaded or installed, do not infer from title alone.
- Google Drive approved standards and decision register (Nov 12), reviewed in prior conversation; reopen actual current copies.
- Google Drive `docs/Stage6_OpenItems.md` consolidated v3.3; `docs/Stage6_Render_TestPlan.md` and `docs/Stage6_Current_Testing_Status.md` review record.
- Google Drive Nov 11 B0–B9 audit documents, especially B2 Session/API/Authorization, B3 Route/Middleware/Frontend Traceability, B4 Endpoint Contract Inventory and B8 Validation Review. Recheck current source as these describe earlier commit snapshots.
- GitHub `sthink1/wapps` `reviseLogIn`, verified Nov 15 at `f794eb7` (historical checkpoint only).
- User-reported staging probe and Render log output from Nov 15 (bounded pass, as recorded above).

**File naming for this handoff:** `WA_File_by_File_Standards_Review_Handoff_2026-11-15.md`.
