# FP03 — installation and rollback (November 24, 2026)

Baseline: reviseLogIn at a85aa107778b4a871e04fa193e432f0c756d9177. Owner performs installation manually. No deployment or commit authorization implied.

| Destination (WA-relative) | Action |
|---|---|
| httpdocs/js/FTPrivacy.js | Replace |
| change/FP03_FTPrivacy.js.diff | New |
| change/FP03_FTPrivacy.js_verification.md | New |
| change/FP03_offline_test.cjs | New |
| change/FP03_offline_test.log | New |
| change/FP03_SHA256SUMS.txt | New |
| install/INSTALL.md | Package reference only; do not overwrite existing project instructions |

Before replacement verify branch and HEAD and original SHA-256 `5355f41f25534c8dd8e6d42f37b9a67c932bcc2300ba65148451b179d1eafced`. If different, stop and reconcile (including line endings). Keep owner _COPY backup outside httpdocs to avoid publicly served backup. Check manifest hashes from extracted ZIP root before installing. Manually install replacement and new change files and synchronize authoritative Drive following established procedure.

After installation, from WA root:

```powershell
if ((git branch --show-current) -ne 'reviseLogIn') { throw 'Wrong branch' }
if ((git rev-parse HEAD) -ne 'a85aa107778b4a871e04fa193e432f0c756d9177') { throw 'Baseline changed' }
if ((Get-FileHash .\httpdocs\js\FTPrivacy.js -Algorithm SHA256).Hash -ne '6dd2db2a4a5fd8fa7cf5adee433901c0b129aaae8ea5fe5511802f31141f8824') { throw 'Replacement mismatch' }
node --check .\httpdocs\js\FTPrivacy.js
if ($LASTEXITCODE -ne 0) { throw 'Syntax failed' }
node .\change\FP03_offline_test.cjs
if ($LASTEXITCODE -ne 0) { throw 'Tests failed' }
```
Expected: RESULT: 40 passed, 0 failed, 40 cases. No DB connection. Then conduct targeted private Person browser acceptance on localhost:8080 using test DB; disable cache in DevTools and verify corrected script content before testing. Do not share privacy keys or tokens. Owner approval required before commit/sync. No production actions.

Rollback: restore owner's original backup and verify original SHA-256 above; remove new FP03 change files only if abandoning package; reload with cache disabled. This restores vulnerable behavior, so do not treat rollback as release-ready.
