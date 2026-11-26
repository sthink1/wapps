# INSTALL — WA-PR-010 / IR-06 and IR-10

November 26, 2026. Step A approved; Step B verified candidate. Target `reviseLogIn` baseline `9d69e1a`. Owner only, manually install. No merge, commit, staging deployment, production deployment, DB operation, or environment change is authorized by this ZIP. No new dependencies. Read the verification reports and acceptance plan before installing. Preserve accepted results and approved 40-hour planning ceiling; cumulative hours not reconciled.

## Exact destinations

Every entry below is relative to WA root. REPLACE only two operational files. NEW supporting files must not overwrite a different existing file; if conflict stop and reconcile. `install/INSTALL.md` is the installation manifest itself; checksum file and manifest self-hashes are excluded from the manifest table to avoid recursive hashing. SHA256SUMS includes the manifest but not itself. All other entries are hashed below. Do not place backup source under the served `httpdocs` tree; retain owner `_COPY` rollback copies outside public root and Git.

| WA-relative path | Action | Final SHA-256 |
| --- | --- | --- |
| `change/WA_PR_010_existing_cache_regression.tap` | NEW | `ec0bda9285a146652794b33300784b5ec95824a56830417f1ec9cb4bb729d71e` |
| `change/WA_PR_010_offline_results.tap` | NEW | `b6bc2eaae8c95c1dadf06f8836315371e46fc5a07b10923b082ef7483cd181e5` |
| `change/WA_PR_010_server.diff` | NEW | `48ead10a211e38b54cf9b8e78f618674d12177b2a468a0af7bd813f9f7ceab7e` |
| `change/WA_PR_010_server_verification.md` | NEW | `7e5b00c05ac91f55485038daec293cf2049ceaa65fa6096323497a01ac1f1329` |
| `change/WA_PR_010_sw.diff` | NEW | `f3fad2a27199c4b11446a112079a4e3b9cd65ff7b8a686ffcb92274933e86f7f` |
| `change/WA_PR_010_sw_verification.md` | NEW | `ea78516ac47336baaeb02b9fb33aab1e4c0d1ff7984f4f61b21917309c7f9306` |
| `change/WA_PR_010_test_evidence.md` | NEW | `a9fbe44f7841db02eabe5ce9f691929b1cfecab724f55bccb676c66afb82f9db` |
| `docs/WA_PR_010_acceptance_plan_2026-11-26.md` | NEW | `d7ec3fdd3524b37b761f21d1c75808d53a4de73bcca031b976a365db77cda9de` |
| `httpdocs/sw.js` | REPLACE | `1a1799e2edda8a0199e8b35406793517c6ffb657205280cb113451cf1ee550a5` |
| `server.js` | REPLACE | `801f35c8baea6f02bfc5bfe671fbaf79a4627f6b5cb10383dff40bcbd6ba8db1` |
| `tests/wa-pr-010.offline.test.cjs` | NEW | `7e33f175180f4b7c19428663d90bea8ab01919a6c3a68aeaaa4f63ffdb1c4070` |
| `install/INSTALL.md` | NEW | In SHA256SUMS |
| `change/WA_PR_010_SHA256SUMS.txt` | NEW | Self-excluded; ZIP integrity verified |

## Baseline and installation

1. Confirm local branch/commit `git branch --show-current`, `git log -1 --oneline`. Check `Get-FileHash server.js, httpdocs/sw.js -Algorithm SHA256` against originals below. If different, stop and reconcile (line endings may differ; don't silently overwrite). Preserve owner backups of both originals outside the public web root, verify backup hashes.

| Original | SHA-256 | Git blob at 9d69e1a |
| --- | --- | --- |
| `server.js` | `69d05f74d6e82bb4aa6e99f0f0d89417493b6750d5945956ad86fb6b2f09fa70` | `5d71cfb3ea307ad8d745230c360355f538fa1989` |
| `httpdocs/sw.js` | `4676eac85a974033cb47f729df388202aedfbb32c094b4b74418ae722da29279` | `febdae360e522967418dd1c2af3ee2376d4df391` |

2. Extract separately. Manually copy only the two complete source replacements and listed new test/docs/evidence at exact relative paths. Synchronize to authoritative Drive per established owner procedure. No root INSTALL.md. Preserve other files.
3. From WA root verify every package entry (except checksum list itself):

```powershell
Get-Content .\change\WA_PR_010_SHA256SUMS.txt | ForEach-Object {
    $parts = $_ -split '  ', 2
    $actual = (Get-FileHash -LiteralPath $parts[1] -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $parts[0]) { throw "Checksum mismatch: $($parts[1])" }
    Write-Host "PASS $($parts[1])"
}
```

4. D1 only, no server or DB needed. Run `node -v`, `node --check server.js`, `node --check httpdocs/sw.js`, `node --test tests/wa-pr-010.offline.test.cjs tests/stage6.r16.broader-api-cache.offline.test.js`. Expected 34/34; preserve exact output. Report installation and D1 results before subsequent controlled acceptance. See `docs/WA_PR_010_acceptance_plan_2026-11-26.md`. Independent tests: 27 new + 7 existing PASS on Node 22; project Node 24, live Express/real browser/native/staging not yet tested.

## Rollback

Stop affected local test service, restore both original files together from verified owner backups, verify original hashes above, remove only newly installed package files if rollback calls for removing test/support evidence (prefer preserving evidence separately). Restore Drive copy manually if appropriate. Browser cache recovery and old worker limitations are in acceptance plan; merely restoring files does not reset installed worker/cache or HSTS state. Use disposable profile; no indiscriminate cache deletion. No data/schema change in this package. Any hosted rollback, commit/sync, merge, database operation or production release is separately authorized. Retain evidence of failure and stop before further action. No automatic rollback scripts.
