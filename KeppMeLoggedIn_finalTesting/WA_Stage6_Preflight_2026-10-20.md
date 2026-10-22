# Wonderful Apps — Stage 6 Preflight

**Date:** October 20, 2026  
**Status:** Read-only preflight partly completed; local Git and live test configuration verification remain pending.  
**Scope:** Stage 6B Keep Me Logged In and Change/Reset Password. **No implementation or deployment is authorized by this document.**

## 1. Non-negotiable boundaries

- Only the approved Stage 6 working branch, pending exact spelling verification (`reviseLogIn` in the handoff, `reviseLogin` in Claude's October 19 report).
- Test MySQL database `sql5838929` only. Do not run SQL against production.
- Do not modify `main`, production database, existing production Render service, or installed TNNA production phones.
- A new independent Render test service is planned but not yet established or authorized as a production equivalent.
- After **all** Stage 6 implementation and local/hosted tests, a separate independent design-engineer review is mandatory before any merge or production decision.

## 2. Read-only Google Drive verification (completed)

The following exact Drive items were found. Google Drive is the project reference, but this does **not** prove it matches the local working tree or branch.

| Item | Last modified in Drive (UTC) | Verification |
|---|---|---|
| `server.js` | 2026-10-18 15:59:11 | File ID `1WPCna9iiz06MXistRZR8Cjqc5_V29Nxf`; 6,986 bytes |
| `services/browserSession.js` | 2026-10-16 18:14:50 | File ID `1_u_AYHMn76AKkUlposxkHtQlZjhT_Tby`; 5,899 bytes |
| `services/passwordResetLimiter.js` | 2026-10-18 15:38:00 | File ID `1uqnwOBDHpatr5ORMdJlZKP5TfglsToFX`; 2,180 bytes |
| `services/passwordResetRateCleanup.js` | 2026-10-18 17:07:18 | File ID `1HOoz5RK-8uEkag0HHknAHoq8dUlraBLd`; 2,175 bytes |
| `dbConnection.js` | 2026-09-28 22:23:48 | File ID `1Wo9s468FguyVDvFsyCRwxn_T99_WjSV0`; 3,861 bytes |
| `wappsDump.sql` (PRODUCTION snapshot) | 2026-10-18 16:22:59 | File ID `1azflH6-gR13B1tMkZAiMuWuJFaDq1Jxz`; 2,192,089 bytes |
| `wappsTestDump.sql` (TEST snapshot) | 2026-10-18 16:22:59 | File ID `1wQOGZo7f3zLRhLoUbbivFQ_-QQw8bWdX`; 2,223,167 bytes |

**Handoff baseline:** production dump 66 tables; test dump 71 tables, with five new Stage 6 tables in test: `UserSecurityT`, `WebSessionT`, `WebRefreshTokenT`, `PasswordResetT`, `PasswordResetRateT`. `TNNARefreshTokenT` is present in both. Counts reflect the October 18 handoff comparison, not a new independent dump parsing or a live database query.

**Engineering review synthesis found:** `WA_Stage6B_Engineering_Reviews_Synthesis_Implementation_Plan_2026-10-19.md`, Drive file ID `1ommy-zYdakkLGKqm4cr6khzhADCidKBy`, uploaded October 20. Both source reviews are also present in the requested `implement plan` folder.

## 3. Local Git branch and tree check (PENDING)

In **PowerShell**, from your Windows development machine, run the following **read-only** commands. Do not run `git checkout`, `git reset`, `git clean`, `git pull`, `git merge`, or `git push` in preflight.

```powershell
Set-Location 'C:\AppProjectwDB\WonderfulAppsRender'
git rev-parse --show-toplevel
git remote -v
git branch --show-current
git branch -a
git status --short
git rev-parse HEAD
git log -1 --format='%h %cs %s'
git ls-remote --heads origin 'reviseLogIn' 'reviseLogin'
```

Check exact case and the remote ref before deciding the target branch. `git status --short` may show uncommitted or untracked files; **preserve them**. If `git ls-remote` cannot authenticate, record that result rather than treating it as branch absence. Do not print tokenized remote URLs publicly; redact credentials if `git remote -v` contains them.

## 4. Local environment isolation (PENDING)

These commands do **not** start Node or connect to either database. They inspect only nonsecret configuration indicators:

```powershell
Set-Location 'C:\AppProjectwDB\WonderfulAppsRender'
Test-Path '.env.test'
Test-Path '.env'
Test-Path '.gitignore'
git ls-files -- '.env' '.env.test' '.env.production'
Get-Content '.env.test' | Where-Object { $_ -match '^\s*(DB_NAME|NODE_ENV|APP_PUBLIC_ORIGIN)\s*=' } | ForEach-Object {
  if ($_ -match '^\s*DB_NAME\s*=') { if ($_ -match '^\s*DB_NAME\s*=\s*sql5838929\s*$') { 'DB_NAME: matches test allowlist' } else { 'DB_NAME: DOES NOT MATCH test allowlist' } }
  elseif ($_ -match '^\s*NODE_ENV\s*=') { 'NODE_ENV: present (value not printed)' }
  elseif ($_ -match '^\s*APP_PUBLIC_ORIGIN\s*=') { 'APP_PUBLIC_ORIGIN: present (value not printed)' }
}
```

The test file may contain credentials: **do not share its contents**. Confirm that `DB_NAME` is exactly `sql5838929` before any later test server invocation; environment overrides and the actual selected connection must still be checked separately at runtime. The documented local launch command, **later and only after safeguards are verified**, is `node --env-file=.env.test server.js`, not `node server.js`.

## 5. Baseline source-control manifest (PENDING)

After branch and local files are verified, generate **read-only hashes** to identify the code that will be changed. Hashes of source files are not secrets, but do **not** hash/share `.env` files as part of the published package.

```powershell
Get-FileHash 'server.js','routes\users.js','routes\tnna.js','services\browserSession.js','services\verifyAccessToken.js','services\passwordResetLimiter.js','services\passwordResetRateCleanup.js','middleware\auth.js','middleware\subscriptionAccess.js','httpdocs\login.html','httpdocs\home.html','httpdocs\subscription.html' -Algorithm SHA256 | Select-Object Path,Hash
```

Check for local-only changes and untracked files before preparing packages. Google Drive modified time/size alone is **not** byte-level identity proof.

## 6. Security and operational blocking checks before Group 0

1. Exact branch spelling and active local branch unresolved.
2. Whether Google Drive source exactly matches local `reviseLogIn` candidate unresolved.
3. `.env.test` presence and actual DB isolation unresolved.
4. No current live MySQL query has been executed; test DB schema and connectivity remain to verify in a later explicitly guarded test.
5. No separate Stage 6 Render test service has been configured; origin, secure cookies, email suppression, proxy trust and secrets remain to verify.
6. Engineer-recommended backend fixes (credential-version fencing, challenge client scoping, logout with expired JWT, cookie/session supersession, replay response and attempt throttling) remain implementation work, **not** preflight passes.
7. Tentative decisions (recognized refresh reuse family revocation, password reuse rule, web legacy cutover, TNNA lifetime policy) remain proposals requiring explicit decision before shipping.

## 7. Preflight exit criteria

- [x] Locate engineering synthesis and both reports in Drive.
- [x] Locate authoritative Drive source and both SQL dump snapshots.
- [ ] Capture local `HEAD`, branch listing, and clean/dirty/untracked working-tree status.
- [ ] Verify case-sensitive target branch name and remote branch availability.
- [ ] Verify `.env.test` exists, is not tracked, and selects `sql5838929`.
- [ ] Reconcile code identities/hashes between the intended working tree and the Drive authority.
- [ ] Approve baseline and first **test-only** Group 0 changes.

**Recommendation:** do not generate or install revised backend files until the first five outstanding checks pass. No source, SQL, Git, or Render mutation occurred during this preflight.
