# Design Engineering Response: Node.js Version Management for TNNA / WonderfulApps

**Project:** Wonderful Apps (WA) + Town Notification Native App (TNNA)  
**Date:** September 30, 2026  
**Author:** Design Engineer (independent review)  
**Scope:** Response to `TNNA_Node_NVM_Technical_Review.md`  
**Status:** Recommendation ready for implementation after owner approval  

---

## 1. Recommended Architecture

**Recommended solution:** Install **NVM for Windows 2.0.0** (or the current stable 2.x release) and manage two explicit Node versions:

| Purpose | Node version | Notes |
|---------|--------------|--------|
| Existing WonderfulApps (WA) | **18.20.5** | Preserve current known-good runtime until compatibility testing on 22 is complete |
| TNNA / Capacitor 8.5.2 | **22.23.x** (latest 22 LTS patch) | Capacitor 8 officially requires Node.js ≥ 22; latest 22 LTS patch as of late September 2026 is 22.23.3 |

This satisfies the desired end state:

- WA continues on Node 18.20.5 without forced change.
- TNNA can run `npx cap add android` and subsequent Capacitor CLI commands.
- Switching is explicit (`nvm use …`) and visible in every new terminal.
- The approach is reversible.

**Why NVM for Windows is appropriate here**

- It is the Microsoft-recommended version manager for native Windows.
- It is designed exactly for coexisting project runtimes on one machine.
- NVM 2.x improves on earlier symlink-heavy behavior and supports modern workflows.
- The alternative of forcing a single Node 22 immediately is attractive long-term but carries higher short-term risk to the already-working WA stack.

**Primary alternative (preferred once risk is low):**  
After WA passes a short regression suite on Node 22, standardize both projects on the same 22 LTS line and drop the dual-version requirement. Until that test is done, dual-version management is the safer path.

---

## 2. Existing Standalone Node 18.20.5 — Uninstall First

**Yes — uninstall the current standalone Node.js 18.20.5 before installing NVM for Windows.**

Official NVM-for-Windows guidance (and Microsoft Learn) is unambiguous: the simplest and most reliable path is to remove any pre-existing Node installation first. Leaving the MSI-installed Node in place frequently produces PATH conflicts, leftover `%ProgramFiles%\nodejs` directories that block the NVM symlink/junction, and ambiguous `where.exe node` results.

Uninstalling does **not** delete project source, `package.json`, `package-lock.json`, or local `node_modules`. It only removes the global runtime that NVM will replace.

---

## 3. Precise Step-by-Step Migration Sequence

Perform the steps in order. Do not skip the inventory or the "close all terminals" steps.

### Phase 0 — Protect work (already partially done)

1. Commit and push the current `townNNA` branch (and any other open WA work).
2. Confirm `node_modules` is git-ignored (it should be).
3. Note that SQL dumps remain local/Drive references under the existing `*Dump.sql` ignore rule.

### Phase 1 — Pre-migration inventory (run in a clean PowerShell window)

```powershell
node -v
npm -v
where.exe node
where.exe npm
npm config get prefix
npm root -g
npm list -g --depth=0
$env:Path -split ';' | Where-Object { $_ -match 'node|npm|nvm' }

Phase 2 — Clean removal of standalone Node
1 Close all VS Code windows, terminals, and any process that might hold node.exe.
2 settings → Apps → Installed apps → uninstall Node.js.
3 Manually delete residual folders if they still exist:
> C:\Program Files\nodejs
> %AppData%\npm (optional but recommended if you want a clean global slate)
> %AppData%\npm-cache (optional)

Open a new PowerShell window and confirm:
where.exe node   # should return nothing
node -v          # should fail

5 Inspect PATH and remove any leftover Node entries if present.

Phase 3 — Install NVM for Windows 2.0.0
1 Run the already-downloaded nvm-2.0.0-amd64-setup.exe (or the current stable 2.x installer).
2 Accept defaults for NVM root and the Node symlink/junction path (commonly C:\Program Files\nodejs or the path the installer suggests). Prefer paths without spaces when possible.
3 Finish the installer.
4 Close the installer and open a brand-new PowerShell window (important — PATH changes are not visible in old shells).
Verify:
nvm version

Phase 4 — Install the two Node versions

nvm install 18.20.5
nvm install 22.23.3
# or simply: nvm install 22   (resolves to latest 22.x at the time)

Confirm both appear:

nvm list

Phase 5 — Establish working defaults and project pinning

Recommended default for day-to-day WA work:

nvm use 18.20.5
node -v   # v18.20.5
npm -v

For TNNA work:

cd C:\AppProjectwDB\WonderfulAppsRender\TNNA
nvm use 22.23.3
node -v   # v22.23.x

Optional but highly recommended:

> Add a .nvmrc file containing 18.20.5 at the WA repository root.
> Add a .nvmrc file containing 22.23.3 (or 22) inside the TNNA folder.
> NVM 2.x can use these for per-directory resolution when configured.

Phase 6 — Reinstall project dependencies under the correct runtime

From WA root (Node 18 active):

# only if node_modules looks stale or you prefer a clean slate
# Remove-Item -Recurse -Force node_modules
npm ci
# or npm install

From TNNA folder (Node 22 active):

cd TNNA
# Remove-Item -Recurse -Force node_modules   # if needed
npm ci
# or npm install
npx cap add android

Phase 7 — Post-migration verification

In a new terminal for each context:

# WA context
nvm use 18.20.5
where.exe node
node -v
npm -v
# start the WA server and smoke-test login + one protected route

# TNNA context
nvm use 22.23.3
where.exe node
node -v
npm -v
cd TNNA
npx cap --version
npx cap add android   # should now succeed

Also run nvm debug (if available in your NVM 2.x build) to surface PATH conflicts.

4. Pre-Migration Checks (summary)

Already listed in Phase 1. Additional useful checks:
> Confirm no other version managers (fnm, Volta, asdf, etc.) are present.
> Confirm Android Studio Quail / current JDK is still on PATH and independent of Node.
> Confirm the townNNA branch is pushed.

5. Post-Migration Verification Commands

nvm version
nvm list
nvm use 18.20.5 ; node -v ; npm -v ; where.exe node
nvm use 22.23.3 ; node -v ; npm -v ; where.exe node
npm config get prefix
npm root -g

Then functional checks:
> WA: node server.js (or normal start script) → login → one subscription-protected API.
> TNNA: npx cap add android → open the generated Android project in Android Studio → Gradle sync.

6. Rollback Procedure
If anything goes wrong:

> Uninstall NVM for Windows via its uninstaller (unins000.exe in the NVM install directory) or Settings → Apps.
> Delete the NVM root folder and the Node symlink/junction folder if they remain.
> Clear NVM_HOME / NVM_SYMLINK (or equivalent) environment variables if present.
> Re-install Node.js 18.20.5 from the official Node.js Windows MSI (exact same version you had).
> Open a new terminal, confirm node -v → v18.20.5, then re-run npm ci in the WA root if needed.
> VS Code terminals will pick up the restored PATH after a full restart of VS Code.

Because project source and lock files were never deleted, WA returns to its previous state.

7. Concerns About Node 18 (WA) + Node 22 (TNNA) in the Same Repository

Low concern, provided process discipline is maintained.

Topic & Assessment
Separate package.json / lock files
Correct and expected. No shared dependency tree problem.
Accidental npm install under wrong Node
Possible. Mitigate with .nvmrc files and a short team convention: "always run node -v before install."
Global npm packages
Globals become per-Node-version under NVM. Reinstall any needed globals after each nvm use if you rely on them.
CI / Render deployment
Production WA runtime is independent of the developer's laptop Node version. Confirm the Render (or other host) Node version separately; do not assume laptop Node 18 is what production uses.
Capacitor Android artifacts
Generated under Node 22; keep them inside TNNA/android and do not mix with WA root scripts.

The dual-version setup is a temporary operational cost, not an architectural defect.

8. Prefer Standardizing Both Projects on Node 22?

Yes — as the medium-term target, after a controlled compatibility test.

Reasons:

> Capacitor 8 already forces Node ≥ 22 for TNNA.
> Node 18 is past its active LTS window; security support ends April 2027, but staying on an older major indefinitely increases future friction.
> One runtime reduces cognitive load and PATH mistakes.
> Modern Express 5 / mysql2 / current dependency set is very likely to run cleanly on Node 22.

Suggested WA Node-22 regression checklist (before making 22 the default):

> Fresh npm ci under Node 22.
> Server starts without warnings that indicate broken native modules.
> Registration → email verification → JWT issuance.
> Subscription status + one requireAppAccess protected route (e.g. budget or family tree).
> Promo redemption transaction path.
> One Family Tree read and one write that touches relationships.
> Notification preference read/update.
> Any sharp / R2 / multer upload path used by Family Tree.
> Confirm no reliance on removed Node 18-only APIs or ancient native addons.

If the checklist is green, switch the default to Node 22 for both projects and keep Node 18 only as a temporary fallback (nvm install 18.20.5 remains available).
Until that test is done, keep dual-version management.

Answers to Specific Review Questions (A–I)

A. NVM architecture
Yes — NVM for Windows 2.0 is an appropriate solution. Prefer it over ad-hoc portable ZIPs for day-to-day switching. After WA is validated on 22, a single-version setup becomes even better.

B. Existing Node installation
Uninstall the standalone 18.20.5 before installing NVM. Then reinstall 18.20.5 through NVM.
C. PATH / symlink risk
Main risks: leftover C:\Program Files\nodejs, duplicate PATH entries, old terminals that still see the previous Node. Mitigations: uninstall first, delete residual folders, always open new terminals after PATH changes, run where.exe node and nvm debug.
D. WA compatibility with Node 18
No hard technical requirement forces WA to stay on 18 beyond "it works today." Prefer testing and moving WA to 22 once the regression list above is green.
E. Global npm packages
Yes — they become version-specific. Capture npm list -g --depth=0 before migration and reinstall needed globals under each Node version after the switch.
F. npm dependencies / two package trees
No material concern. Keep the trees separate; never run WA npm install while Node 22 is active (or vice versa) without intention.
G. Recommended Node 22 release
Use the latest Node 22 LTS patch (currently 22.23.3 as of 23 Sep 2026). Prefer the LTS line over Current (26.x) for stability.
H. Rollback
Described in Section 6. Reinstall the official Node 18.20.5 MSI after removing NVM.
I. Alternatives
Option & Verdict for this project
Volta
Good cross-platform tool; slightly less common on pure Windows shops. Acceptable alternative.
fnm
Fast, modern, reads .nvmrc. Strong alternative if you prefer a lighter tool.
Portable Node ZIP
Possible for a one-off, but weak for ongoing switching and PATH hygiene.
Windows containers
Overkill for a single developer machine.
WSL2 + Linux nvm
Excellent isolation, but adds a second environment and complicates Android Studio / Windows path integration.
Separate Windows user / machine
Unnecessary cost.
Upgrade WA to Node 22 only
Best long-term end state; do it after the regression checklist.

Recommendation ranking for this machine right now:  

> NVM for Windows + dual versions (immediate)  
> Validate WA on 22 → single Node 22 (near-term)  
> fnm or Volta only if NVM installation proves problematic.

Final Engineering Recommendation

1 Commit current work on townNNA.
2 Capture the inventory.
3 Uninstall standalone Node 18.20.5 completely.
4 Install NVM for Windows 2.0.
5 Install Node 18.20.5 and Node 22.23.3 via NVM.
6 Use 18.20.5 for WA and 22.23.3 for TNNA.
7 Re-run npx cap add android under Node 22.
8 Schedule a short WA Node-22 compatibility pass; if green, standardize on 22.

No changes to WA application architecture, subscription model, Family Tree rules, or database schema are required for this runtime decision.























