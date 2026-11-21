# INSTALL — WA Stage 6 R16 T09 Weights Nested Error Correction

**Owner-authorized Step B candidate — November 21, 2026.**

## Purpose and scope

Fix the nested JSON error-message presentation in the existing Weights Search browser consumer. This replaces only `httpdocs/Weights.html`. No backend, database, GitHub, Render, authentication, shared-client, or other application files are changed by this ZIP.

## Before installation (Step C: owner only)

1. Use your established manual local-install workflow. Do **not** apply to production, main, Render, or another environment without separately approved steps.
2. Confirm the target is the intended authorized local WA project and that `httpdocs/Weights.html` is the file being replaced.
3. Verify the current target file's SHA-256. Expected authoritative source hash: `e605dd4e661ae726eb401473e1399fbb7111e5ab11493549d5a9ea51b9f9d54c`. **If it differs, stop and reconcile; do not overwrite an unverified newer version.**
4. Preserve your existing known-good `_COPY` backup/rollback copy outside this package, using your normal local procedure.
5. Extract **only** the ZIP file `httpdocs/Weights.html` to the exact local relative path `httpdocs/Weights.html`, replacing the verified prior version. Do not copy `install/` or `change/` into operational folders.
6. Verify the installed file's SHA-256 matches `925982a144bba7f54821ba32f37ba2f0cccc27784562c3333ef392e27b0e5c87`. The same hash is in `change/SHA256SUMS.txt`.
7. Under your established workflow, manually synchronize the installed file into authoritative Google Drive. ChatGPT has not written to the authoritative Drive or local project.

## Step D — controlled, consolidated acceptance

After verifying intended **isolated Stage 6 test environment and test database identity**, perform one browser-session acceptance covering:

- A known-safe nested error response through a genuine Weights business-page request (not just synthetic unit/harness evidence); capture status, sanitized envelope and displayed message, without exposing tokens or private records.
- Flat error compatibility and safe fallback for malformed error content, only as needed given existing accepted evidence.
- 401/403 messages and session/entitlement continuity when safe to test; do not intentionally invalidate credentials or induce lockouts.
- A successful Weights search after the error to confirm normal recovery.
- No `[object Object]`, unexpected automatic mutation request or sensitive disclosure.

**Do not cause deliberate database outages/server exceptions, modify real records, or intercept production traffic.** If no safe genuine nested condition exists, record the coverage gap as OPEN instead of fabricating one. Preserve accepted T10/T12 evidence; no unnecessary retests.

## Rollback

If acceptance fails, close the affected browser page and manually restore the owner-preserved known-good `httpdocs/Weights.html` backup in the authorized local WA project. Confirm the restored file hash equals `e605dd4e661ae726eb401473e1399fbb7111e5ab11493549d5a9ea51b9f9d54c` if reverting to this exact baseline. Recheck the single-page behavior; follow your usual owner-controlled Google Drive resynchronization. No database migration or cleanup is associated with this package. GitHub commits, merges and deployments require separate explicit authorization.

## Evidence

- Source difference: `change/Weights.html.diff`.
- Per-file final-deliverable report: `change/Weights.html.verification.md`.
- Isolated Chromium test results: `change/R16_T09_Isolated_Chromium_Evidence.json`.
- Checksums: `change/SHA256SUMS.txt`.

**This ZIP does not itself constitute Step D or full R16 T09 completion.**
