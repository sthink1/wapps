# Installation manifest — Weights T09 load-error presentation

**Proposal prepared:** 2026-11-16. **Not installed and not independently browser-tested.**

## Destination map

| ZIP path | WA-relative destination | Type |
|---|---|---|
| `httpdocs/Weights.html` | `httpdocs/Weights.html` | **REPLACE existing source**, only with owner approval |
| `change/Weights.original.html` | `change/Weights.original.html` | NEW reference copy; **do not deploy** |
| `change/Weights.html.diff` | `change/Weights.html.diff` | NEW comparison evidence; **do not deploy** |
| `change/Weights.html.verification.md` | `change/Weights.html.verification.md` | NEW verification report; **do not deploy** |
| `change/SHA256SUMS.txt` | `change/SHA256SUMS.txt` | NEW checksum evidence; **do not deploy** |
| `docs/WA_Weights_T09_Test_Plan_2026-11-16.md` | same path | NEW documentation; **do not deploy** |

No operational source is placed in the project root. Do not install the reference original over the proposed final file.

## Provenance

- Baseline: Google Drive `My Drive/wonderfulApp/httpdocs/Weights.html`, file ID `1_VDYqMNRqP5Buh4kmKHC1Dv3N71UwuLL`, downloaded read-only November 16, 2026, size 79444 bytes.
- Baseline SHA-256: `3193fa1248ccfffce8499da5bdf06a88eefb0e1e749ab57a24c6e0ab25fa939d`.
- Proposed final SHA-256: `e605dd4e661ae726eb401473e1399fbb7111e5ab11493549d5a9ea51b9f9d54c`.
- **Important:** Google Drive baseline was used; byte-for-byte equality with your post-`8e66567` *local current* `httpdocs/Weights.html` is NOT yet verified. Verify the baseline SHA-256 against current local original before installation. If it differs, stop and reconcile; do not overwrite current work.

## Owner-controlled installation (after approval)

1. Read the separate verification report and test plan. Verify the current local `httpdocs/Weights.html` hash equals baseline SHA-256 above; otherwise do not install this replacement.
2. Back up the current source outside the project installation path and record its checksum.
3. Copy the package's `httpdocs/Weights.html` to `httpdocs/Weights.html` in the WA root, replacing only that file. Preserve subfolder paths. Place change evidence and documentation at their stated destinations if desired; they are not runtime dependencies.
4. Check the installed final SHA-256 matches the proposed final SHA-256; inspect `git diff -- httpdocs/Weights.html` and `git diff --check`.
5. Execute targeted authenticated/unauthenticated, offline and recovery browser tests in the **isolated staging environment only after separate authorization**. Do not test in production or mutate records.
6. Commit, push, deploy only upon separate owner authorization; Stage 6 T09 remains OPEN until runtime evidence is collected.

## Rollback

Reinstall the verified backed-up original `httpdocs/Weights.html` and confirm its SHA-256; restore the previous staging revision through the owner-controlled deployment process if any rollout occurred. Verify normal authenticated read and previously accepted functions. No automatic database rollback or data mutation is part of this change.

## Limitations

- No staged runtime verification was performed.
- Current Git/Render versions and staging asset cache may differ from the Drive baseline; do not assume equivalence.
- Existing WA technical standards call for whole-file HTML pretty formatting, while the owner has specifically constrained this correction to minimal scope. This package deliberately avoids unrelated formatting changes to preserve behavior and minimize risk; **whole-file formatting conformance remains unresolved and requires owner decision/exception**, not a claim of compliance.
