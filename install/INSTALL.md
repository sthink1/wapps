# Wonderful Apps — M03-H02 relationship authorization package

November 24, 2026 | Step B delivery | `reviseLogIn`

Owner approved all six corrections in one package with offline testing. This ZIP does not authorize production, main, database writes, commit, merge or deployment. No automatic installer is included.

## Manifest

| WA-relative destination | Classification | Purpose |
| --- | --- | --- |
| `routes/familyTree.js` | REPLACE | Complete operational source, the only changed WA operational file |
| `change/M03-H02_familyTree.js.diff` | NEW | Full unified original-to-final comparison |
| `change/M03-H02_familyTree.js_verification.md` | NEW | Separate per-file verification, baseline, scope and evidence |
| `change/M03-H02_offline_test.cjs` | NEW | Synthetic offline HTTP test runner (test evidence, not application source) |
| `change/M03-H02_offline_test.log` | NEW | Actual executed test results |
| `change/M03-H02_SHA256SUMS.txt` | NEW | SHA-256 manifest of other ZIP files; cannot hash itself |
| `install/INSTALL.md` | NEW, package-only | Instructions/manifest; keep in extracted package, do not overwrite any existing project install document |

The SHA-256 manifest records the exact final hash of each other package file including the installation instructions. Verify the archive checksum separately as supplied with the download. Keep all paths; do not copy unrelated files or use a bulk overwrite of the project. No `.original` files included. Preserve any existing unrelated evidence; stop on a destination collision rather than overwrite it.

Required original baseline:

- `reviseLogIn` HEAD `3fadbe0b2d4b4807e1434f526e7d6834b689f992` (if HEAD changes, reconcile before installing).
- Original `routes/familyTree.js` SHA-256: `f0b758645927d02a3dce2bb22d669124b32e8c8b0ae55b6eae1961b11063f05d`.
- Replacement SHA-256: `7930f3165aea158891fbbda2672f9e89fbe4a33e66258f452c09cdaac61aedea`.
- No npm install, package.json, environment variable, configuration, SQL or database changes required for the replacement.

## 1. Read-only pre-install verification and one local test

Extract the ZIP into a separate temporary/download folder, not the WA root. Open PowerShell at the existing WA project root. Adjust `$pkg` to the actual extracted directory containing `routes`, `change`, `install`.

```powershell
$pkg = 'C:\path\to\extracted\WA_M03-H02'
$project = (Get-Location).Path
$original = Join-Path $project 'routes\familyTree.js'
$candidate = Join-Path $pkg 'routes\familyTree.js'
$oldHash = 'f0b758645927d02a3dce2bb22d669124b32e8c8b0ae55b6eae1961b11063f05d'
$newHash = '7930f3165aea158891fbbda2672f9e89fbe4a33e66258f452c09cdaac61aedea'
if ((git branch --show-current) -ne 'reviseLogIn') { throw 'Wrong branch' }
if ((git rev-parse HEAD) -ne '3fadbe0b2d4b4807e1434f526e7d6834b689f992') { throw 'Baseline HEAD changed; reconcile before proceeding' }
if ((Get-FileHash $original -Algorithm SHA256).Hash -ne $oldHash) { throw 'Original hash mismatch; do not install' }
if ((Get-FileHash $candidate -Algorithm SHA256).Hash -ne $newHash) { throw 'Replacement hash mismatch; do not install' }
Get-Content (Join-Path $pkg 'change\M03-H02_SHA256SUMS.txt') | ForEach-Object {
    if ($_ -notmatch '^([a-fA-F0-9]{64})  (.+)$') { throw 'Invalid checksum manifest' }
    $expected = $Matches[1]
    $relative = $Matches[2]
    if ((Get-FileHash (Join-Path $pkg $relative) -Algorithm SHA256).Hash -ne $expected) { throw "Package checksum mismatch: $relative" }
}
node --version
node --check $candidate
if ($LASTEXITCODE -ne 0) { throw 'Syntax check failed' }
node (Join-Path $pkg 'change\M03-H02_offline_test.cjs') --project $project --candidate $candidate --baseline $original --express
if ($LASTEXITCODE -ne 0) { throw 'Offline HTTP test failed; do not install' }
```

Expected: actual Express mode, local Node version printed, `RESULT: 100 passed, 0 failed, 100 cases.` This command reads project dependency source and uses locally installed Express but never imports the actual database connection, reads actual credentials, starts `server.js`, connects to an external site, sends email or changes source/database. All fixtures and tokens are synthetic and the listener binds only to 127.0.0.1 on an ephemeral port. No npm install is requested. If the test fails or a dependency is unavailable, report the actual output; do not label it PASS or install a mismatched candidate. Do not run the harness using a production URL.

Assistant executed native loopback HTTP mode (100/100), not actual Express. Node v22.16.0 was available internally, while target Node v24.22.1 needs local confirmation. The full source and middleware were executed with synthetic sinks. No real database or browser test has been executed yet.

## 2. Owner-controlled manual installation (Step C)

After successful local offline verification and package review, owner retains the existing `routes/familyTree.js` backup using the usual `_COPY` convention (do not overwrite an older backup), verifies its original SHA-256, and manually copies the single replacement to `routes/familyTree.js`. Copy the five new `change/` evidence files to their exact paths if no conflicting file already exists; keep the package-only installation instructions with the extracted package. Verify installed source hash is the final SHA-256 above. Owner then follows the already approved manual copy/synchronization procedure to authoritative Google Drive. No assistant writes to project locations. No Git commit/sync of branch until successful acceptance and explicit owner approval.

## 3. Step D controlled acceptance and release gates

After installation report the actual offline result and installed hash. Confirm the November 22 test and production dumps remain current for the relevant schema. No live SQL query is requested at this step. A targeted real-browser/local isolated test with synthetic Persons/Tree(s) is still needed for legitimate new related-Person creation, same-Tree existing-Person selection, and the real database membership lookup/transaction. Validate exact environment identity and agree on synthetic fixture and cleanup before any state-changing test. Do not use actual production data or perform a production vulnerability probe. No previously accepted unrelated tests need repeating. Record actual results and limitations. Full real-server/Express, live database locking, browser and release acceptance are not established by offline results alone.

Other Family Tree/One Tree findings and migration/auth-abuse gates remain open; this package does not approve a merge or release. Current `main` separately contains the H02 defect; production deployment identity and disposition remain to be verified separately.

## 4. Rollback

If installation fails, stop the affected work, manually restore the owner's exact pre-install `_COPY` backup to `routes/familyTree.js`, verify the original SHA-256, and synchronize the restored file to Drive by the owner-controlled procedure if necessary. Preserve test evidence. A file rollback cannot undo already committed data or notifications; if later test writes occurred, use only the separately approved isolated test cleanup/recovery procedure. Do not roll back `main`, production or database by using this ZIP. No deployment or restart is automated.
