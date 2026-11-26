# WA-PR-006 / IR-09 — INSTALL (Step C and D gates)

**Date:** November 26, 2026 | **Branch:** `reviseLogIn` | **Staging reference:** `730c91d` (owner-reported)

Prepared under approved A→B→C→D process, v1.1. Step A already approved; no routine reapproval requested. Step B candidate includes complete files, per-file verification/diffs and independent offline evidence. **No automatic installation, migration, staging deployment, commit, sync, merge or production activation.** Source installation is owner-performed after review; DDL and hosted activation require separate authorization.

## 1. Manifest and destination paths

Extract ZIP to a separate temporary folder, not directly over the WA root. Only the following files are intended for WA project installation. For each REPLACE file, the Drive-original checksum must match the local pre-install file. New files must not already exist; stop on unexpected conflict. Keep separate owner `_COPY` originals. `install/INSTALL.md`, `install/WA_PR_006_manifest.json` and all `change/` evidence are package records, not instructions to overwrite any existing generic project installation files. Retain the extracted evidence or archive it in the appropriate `change/` / `install/` location under owner control. All package member paths and classifications are listed in the manifest; uniquely named change evidence may be archived without replacing other evidence.

| Classification | Exact WA-relative path | Final SHA-256 | Original SHA-256 (REPLACE only) |
|---|---|---|---|
| NEW | `docs/WA_PR_006_IR_09_acceptance_plan_2026-11-26.md` | `b8ab6d66213876675edad2b4a0998077bb640827406ea16e8461578a84569729` | `—` |
| REPLACE | `routes/users.js` | `39299e4c24d14baf394f78a2029363e0c1b236eda569a346eabbd69d40b49cfd` | `d7b3b598c7b9462e55fdf56e16ec0217f3eb9329b107b5d085c5f6a280486a17` |
| NEW | `services/clientIp.js` | `ccb5d4123c50da15ab1678b9347755360da28b36696642e3f3a8796f0db29809` | `—` |
| NEW | `services/loginIpLimiter.js` | `b4a2e5e114c61a61114b1dea0835988e48326e15b811b039d36cb92875441bb9` | `—` |
| REPLACE | `services/passwordResetClientIp.js` | `fd4e132f5fe145e5eb1c5ba9790fbdd5cfdf614df4e62ee1e1e514227eab0ae2` | `e972b57e8c22b001e9adbf38529fb903a59bf2150ea9106b772b622b794c205c` |
| REPLACE | `services/passwordResetLimiter.js` | `8e41e27047aa9dfce70f9146cbefa173dc097036837bb113db60a46ca4f3b873` | `e05451d9752ba144a7b6b8f7ff6ac8efa41bbbaccffa8d3f23b1430b73186c26` |
| REPLACE | `services/passwordResetRateCleanup.js` | `1d66b5f363ae6eabc205ac9f882c8ac6d5b7f83f3417a3d52ac47aea72fae3c1` | `98c8407dcb53c4491e57331a361eac025df8ed941620e28e6d462492de32874f` |
| NEW | `sql/WA_PR_006_IR_09_TEST_ONLY_apply.sql` | `b93af8d2f2d323f314a56843671c402226f8c2c4d1d512fc304b573e14da96cc` | `—` |
| NEW | `sql/WA_PR_006_IR_09_TEST_ONLY_preflight.sql` | `04b16b88e5cbf32c70958b60327730bc9e065e4b67d7570ec603c942f216adb4` | `—` |
| NEW | `sql/WA_PR_006_IR_09_TEST_ONLY_rollback.sql` | `a31700d44e5b3891432d0bbe1c5cdb0ae8d64b85fd565b6289334e4bac65a322` | `—` |
| REPLACE | `tests/group5e.client-ip.unit.test.js` | `dc75271740e89e4f8ed41c3276b8a128939393906cfa55d60df741adb5da0c15` | `837990d7d3dcedd56821e88d82161632eb1e45d2712064abcd36c3858d3d8f38` |
| NEW | `tests/wa-pr-006.offline.test.cjs` | `5970f0baa965607ce6ee992cd28d49009c4ecca38b705d87b26d58f16f18616a` | `—` |
| NEW | `tests/wa-pr-006.real-db.acceptance.cjs` | `253c87207a9c0cd463dce7f90cece0fd8616594449ec00eef4fb8595ca392b8a` | `—` |

5 replacements; 8 new operational/test/SQL/docs files. `change/WA_PR_006_SHA256SUMS.txt` covers every package member other than itself (a manifest cannot hash itself without recursion). Package readback verifies all listed hashes and ZIP CRCs.

## 2. Installation — files only

1. Confirm local working tree is `reviseLogIn`; run read-only `git branch --show-current`, `git status --short`, and `node --version`. Do not discard unrelated changes. Confirm expected local version 24.22.1 per authoritative `.node-version`; if different, use the project-approved runtime before Step D.
2. Verify downloaded archive SHA-256 against the value supplied in chat if available; extract to a separate folder. Verify listed final hashes. For a specific file, from its directory or WA root use PowerShell: `Get-FileHash -Algorithm SHA256 -LiteralPath '.\routes\users.js'`. Repeat for all five originals (compare to Original column); do not overwrite if mismatched.
3. Keep `_COPY` backups outside the delivered files; copy NEW `services/clientIp.js` and `services/loginIpLimiter.js` first. With the local WA server stopped, copy all REPLACE files plus remaining NEW tests/SQL/docs to exact listed paths. Verify each final hash. Do not install a partial service set.
4. Keep `WA_LOGIN_IP_LIMIT_ENABLED` unset or `0`; do not set the new production ingress flag. Do not change the existing staging trust opt-in or production environment. No new dependency, package.json/lockfile, Node version, database connection, server.js, loginLimiter.js, verification-code service, TNNA or UI change.
5. Manually copy/synchronize installed project files to authoritative Drive according to established workflow; no assistant writes. Source copying is not commit, deployment, or DB authorization. No automatic change to Render.

## 3. Immediate safe offline acceptance

From the installed local WA root in PowerShell (no WA server, no real env file needed):

```powershell
node --version
node --check routes/users.js
node --check services/clientIp.js
node --check services/loginIpLimiter.js
node --check services/passwordResetClientIp.js
node --check services/passwordResetLimiter.js
node --check services/passwordResetRateCleanup.js
node --check tests/wa-pr-006.real-db.acceptance.cjs
node --test tests/wa-pr-006.offline.test.cjs tests/group5e.client-ip.unit.test.js tests/group5e.proxy.source.offline.test.js
```

Expected: all syntax checks exit 0 and 31 test cases PASS, 0 FAIL (26 package cases + 5 existing source-audit cases). The offline suite uses stubbed dependencies and a local loopback transport fixture; it does not load actual WA credentials or connect to DB, Render or email. Tests require local Node 24 re-run, because independent container had Node 22.16.0. See actual independent evidence under `change/`. If any failure, stop and report output without secrets.

## 4. Database and hosted testing — SEPARATE AUTHORIZATION REQUIRED

Do not execute migration, rollback DDL, guarded live fixture or change Render yet. The November 25 authoritative dump is pre-PR-005 schema; compare against latest dump / accepted migration and verify live schema only at the migration gate. Confirm Morty2 `wapps_test`, TLS, UTC, backup, absence of new table, and existing accepted LoginRateT/LoginVerificationT FailedAttempts/PasswordResetRateT. The read-only preflight file can be used when current dump is insufficient. Separate test DB approval is required to run `sql/WA_PR_006_IR_09_TEST_ONLY_apply.sql`. DDL auto-commits, stop on any error; never rerun PR-005 migration.

After test migration and separately authorized live test writes, use the guarded script with the **existing verified local test-only env file** (example filename `.env.test`, not an instruction to create or expose credentials):

```powershell
node --env-file=.env.test tests/wa-pr-006.real-db.acceptance.cjs --run-live-test-db
```

Script requires local mode, exact Morty2 `wapps_test` user/database/host/port/TLS and explicit flag. Only two random synthetic login-IP keys are created/seeded/deleted; no actual account, reset, email or session rows touched. If cleanup cannot be confirmed, report and stop. This script was syntax-checked and its refusal guard passed; live execution has NOT been performed.

Then, only under separate staging authorization, deploy candidate to isolated staging, keep existing `WA_TRUST_RENDER_CF_IP=1` only if staging assurance remains valid, and enable `WA_LOGIN_IP_LIMIT_ENABLED=1` **after** verifying migration. Production-only gate remains unset. Controlled boundary and compatibility test instructions are in `docs/WA_PR_006_IR_09_acceptance_plan_2026-11-26.md`. Preserve earlier staged probe evidence; do not repeat without regression need.

## 5. Rollback

- Stop affected local/staging service if separately authorized; disable new login IP feature. Do not change other flags or environment settings without separate approval. Restore all five REPLACE originals from owner-managed `_COPY` backups, verify exact original hashes, remove only new source/test/doc/SQL files if appropriate (retain audit evidence). Restore coordinated set, not one service alone.
- The new table can remain inert when feature is disabled. Do not automatically drop it. A separately authorized test-only rollback can execute `sql/WA_PR_006_IR_09_TEST_ONLY_rollback.sql` after verifying identity, backup, stopped relevant traffic/maintenance, and dependency removal. DDL auto-commits and permanently deletes new counter history. Do not drop or alter previously accepted LoginRateT/FailedAttempts/reset tables.
- Reset fallback behavior returns to previous baseline upon restoring old resolver/limiter; prior shared-proxy behavior/risk would return. Document this residual risk if rollback is necessary.
- No commit/sync until successful Step D acceptance and explicit owner authorization; no merge/deployment/production migration or activation without separate authorization. Production ingress assurance is still open.
