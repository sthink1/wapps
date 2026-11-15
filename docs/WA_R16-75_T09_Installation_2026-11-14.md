# R16-75-T09 — Installation and File Map

**Corrected bundle:** full proposed client replacement with source comparison, isolated test evidence, and rollback instructions.  
**Target root:** `G:\My Drive\wonderfulApp\` (**owner copies manually**, isolated test installation only).

| Bundled relative path | Purpose | Replacement? |
|---|---|---|
| `httpdocs/js/waPlatform.js` | Complete corrected browser client source | **YES**, after original SHA check |
| `tests/stage6.r16-75.t09.additional-regression.offline.test.js` | New supplementary regression test | New |
| `tests/stage6.r16-75.t09.offline.test.js` | Unchanged original failed T09 test now used for revalidation | Identical existing test; do not overwrite if same hash |
| `tests/waPlatform.unit.test.js` | Unchanged pre-existing auth/session test for reproducibility | Identical existing test; do not overwrite if same hash |
| `change/waPlatform.js.diff` | Exact complete unified source change | New evidence |
| `change/waPlatform.js_Change_Verification.md` | Original-to-final report, risk, rollback | New evidence |
| `change/SHA256SUMS.json` | Package checksums | New evidence |
| `docs/WA_R16-75_T09_Correction_Results_2026-11-14.md` | T09 result summary | New evidence |
| `docs/WA_R16-75_T09_Original_Baseline_Test_2026-11-14.tap` | Original 8/10 failing test raw output | New evidence |
| `docs/WA_R16-75_T09_Corrected_Combined_Tests_2026-11-14.tap` | Corrected 36/36 passing raw output | New evidence |
| `docs/WA_R16-75_T09_Installation_2026-11-14.md` | This file | New evidence |

**Verified original SHA-256:** `e88dd8f9afff24e4a7b16e107619ba36fd8d01f3dd3a9ba284600aecf35304a5`  
**Revised SHA-256:** `57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d`

**Do not install on production or modify `main`**. The verified GitHub source establishes the branch baseline; the currently running Render service was not directly inspected. Confirm your local original SHA-256 before installation. All user-owned locations stay read-only to the assistant.
