# WA root → `change/` candidate relocation list

**Inspection:** Authoritative Google Drive root `My Drive/wonderfulApp` as listed 2026-11-12; 160 immediate root entries. `change/` already exists.

## A. Clear candidates — all 29 root `.diff` files

These 29 files are change-review artifacts, not executable source. **Recommended relocation only after checking relative-path references in scripts and reports.** Proposed destinations are `change/<same filename>`.

- `users.js.R16-72.diff`
- `browserSession.js.R16-72.diff`
- `R16-69_track.diff`
- `R16-64_ftPrivacy.diff`
- `subscriptionService.js.R16-56.diff`
- `subscriptions.js.R16-56.diff`
- `notifications.js.R16-56.diff`
- `notificationService.js.R16-56.diff`
- `familyTree.js.R16-56.diff`
- `R16-50_users_changes.diff`
- `R16-34_changes.diff`
- `R16-28_server.js.diff`
- `R10_14_Offline_SignedOut_Followup.diff`
- `R10_14_SignedOut_Popup_Fix.diff`
- `sw.js.diff`
- `home.html.diff`
- `home.html_COPY.diff`
- `REVIEW_Stage6_R16_Contact_Email.diff`
- `REVIEW_Stage6_Admin_Dual_Verification.diff`
- `REVIEW_tnna_update_email.diff`
- `REVIEW_familyTree_upload.diff`
- `REVIEW_etf_config.diff`
- `REVIEW_etf.diff`
- `REVIEW_budget.diff`
- `REVIEW_subscriptions.diff`
- `REVIEW_ftPrivacy.diff`
- `REVIEW_notificationService.js.diff`
- `REVIEW_familyTree.js.diff`
- `REVIEW_familyTree.diff`

## B. Already in `change/` — DO NOT MOVE AGAIN

- `README.md.diff`
- `CLAUDE.md.diff`
- `copilot-instructions.md.diff`
- `WA_AI_Standards_Integration_Change_Verification.md`

## C. Other root change-related text documents — REVIEW individually, NOT automatically moved

Numerous `README_R16-*.md`, `README_R16_*.txt`, `INSTALL_*.md`, `REVIEW_*.diff` companion documents, and `WA_Stage6_*.md` provide installation instructions, test results or historical evidence. Their names alone do not prove they are `.md` *change-verification summaries* under the new policy. Preserve them in their current location unless contents, links and active dependencies are checked and a specific relocation is approved.

In particular retain `README.md`, `CLAUDE.md`, `TechSummary.md`, `AGENTS.md`, all live `.js`, `.json`, `.sql`, `.ps1`, `.node-version`, and architecture/acceptance records in place. Do not move root source or executable scripts into `change/`.

## D. New artifacts from this package (owner installs only)

- `change/CLAUDE.md.diff` (replaces/reconciles any existing same-named artifact only after checking content)
- `change/CLAUDE.md.change-verification.md`
- `change/TechSummary.md.diff`
- `change/TechSummary.md.change-verification.md`

## E. Safe relocation sequence

1. Search project files for each `.diff` filename and determine any referenced relative paths.
2. Confirm no test/install script loads it from the project root.
3. Record original path, new path and checksum in a move manifest.
4. Move only after owner approval; update any affected documentation links as **separate approved changes**.
5. Verify unchanged checksums and check Stage 6 evidence links.

**No move is carried out by this report.**
