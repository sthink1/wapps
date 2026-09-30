# Design Engineer Response: Node.js Version Strategy for TNNA

**Responds to:** `TNNA_Node_NVM_Technical_Review.md`
**Projects:** Wonderful Apps (WA) / Town Notification Native App (TNNA)
**Date:** September 30, 2026
**Status:** Recommendation for owner review. No system changes have been made or are required to read this document.

---

## 0. Evidence and limits of this review

**What I reviewed:** `TNNA_Node_NVM_Technical_Review.md`, `CLAUDE.md`, and `TechSummary.md` (both dated Sept 28, 2026).

**What I did not have:** WA or TNNA source code, `package.json`/lock files, the Render dashboard, or access to the Windows machine. Every command below is for you to run. Anything marked **VERIFY** is something I could not confirm from the documents.

**External facts** (Node release schedule, NVM for Windows v2 behavior, Render defaults, Capacitor 8 requirements) were checked online on Sept 30, 2026. Sources are listed in Section 10. Where sources disagreed, I say so.

---

## 1. Bottom line

| Question | Answer |
|---|---|
| Is NVM for Windows 2.0.0 appropriate? | **Workable, but not my first move.** It is a reasonable fallback. It is not the safest way to unblock TNNA today. |
| Uninstall standalone Node 18.20.5? | **Not yet.** Leave it untouched until a decision gate (Section 4, Phase 3). If you later adopt NVM, uninstall it first. |
| Recommended architecture | **Phased.** (1) Unblock TNNA with a *portable* Node 24 that changes nothing on Windows. (2) Test WA on Node 24 in an isolated clone. (3) Standardize on **one** Node (24) if WA passes. Keep NVM as the fallback if WA truly needs 18. |
| Which Node for TNNA? | **Latest Node 24.x.** Capacitor needs 22 or newer. Node 22 is already in Maintenance and reaches end of life April 30, 2027. |
| Must WA stay on Node 18? | **No technical reason is visible in the documents.** Node 18 has been end-of-life since April 30, 2025, so staying on it is the larger long-term risk. |
| Any repo trap? | **Yes.** Render reads `.node-version` / `.nvmrc` from the repo root. A root-level pin file changes production, not just your PC (Section 2.5). |

The strongest reason for this recommendation is that the Node 22+ requirement applies only to the Capacitor CLI in a terminal. That makes a zero-touch approach possible, and it removes the pressure to reconfigure the machine that WA depends on.

---

## 2. Findings that change the framing

### 2.1 Node 22+ is needed only for `npx cap ...` commands

Capacitor 8 requires Node 22 or newer for its CLI. The app that ships to a phone runs in the Android WebView and contains no Node. As far as I know, an Android Studio/Gradle build also does not call `node`; **VERIFY** this after your first successful sync.

In practice, Node 24 is needed only when you run `npm install`, `npx cap add`, `npx cap sync`, or `npx cap copy` inside `TNNA\`. That is occasional and terminal-scoped, so a per-terminal solution fits better than a machine-wide one.

### 2.2 Node 18 is end-of-life, and production probably does not run it

Node 18 reached end of life on 2025-04-30. As of today, supported lines are Node 22 (Maintenance LTS), Node 24 (Active LTS), and Node 26 (Current, scheduled to become LTS in late October 2026).

Render selects a Node version by service creation date: services created 2024-07-09 to 2024-10-30 defaulted to 20.15.1, services from 2024-10-30 onward defaulted to 22.x, and services created on or after 2026-09-17 default to 24.21.0. Unless a `NODE_VERSION` variable or pin file overrides it, your Render service is very likely running Node 20, 22, or 24, not 18.

**Implication:** local development on 18.20.5 may already differ from production. That is a parity gap in the opposite direction from the one you are trying to protect. **VERIFY:** Render Dashboard → your WA service → Environment (`NODE_VERSION`), and the top of the latest build log ("Using Node.js version ...").

### 2.3 What NVM for Windows v2 actually is

v2 is a full rewrite, not an update of the v1 tool most guides describe. Verified points:

- **Two modes.** *Shim mode* (default) uses small executables, needs no admin rights, and no symlinks. *Link mode* uses NTFS junctions (symlink fallback for UNC paths). You can switch with `nvm use shim` / `nvm use link`.
- **Per-directory pinning** in shim mode via `.nvmrc`, `.node-version`, or `package.json`. This would solve "which version is active" for WA vs TNNA automatically.
- **Signing conflict.** The repository README says community installers are code-signed as of v2.0.0-hotfix.2. The documentation site says community builds are not code-signed. I could not reconcile these, so check the signature of *your* file (Section 5).
- **Forks and lookalikes.** Search results include several forks (`zeromake/nvm-windows`, `comeoninc/nvm-windows`, others). Download only from `github.com/nvm-windows/nvm/releases`.
- **Existing Node installations.** The classic guidance (still on the project's wiki and in Microsoft's Windows setup docs) is to uninstall existing Node first and delete `C:\Program Files\nodejs`. The wiki also says the installer's attempt to take over an existing install "can be more complex than it appears." I found nothing in the v2 documentation promising a safer takeover. Treat the old guidance as still applicable.

### 2.4 PATH-order hazard (why "silent takeover" is a fair worry)

Windows builds a process's PATH from **System** entries first, then **User** entries. The standalone Node installer places `C:\Program Files\nodejs` on the System PATH. A per-user NVM install (no admin) would add its folder to the User PATH.

If that is how the v2 installer behaves on your machine (**VERIFY**), the old Node can *win*, and `nvm use 24` would report success while `node -v` still prints `v18.20.5`. That failure is confusing but not destructive. The opposite failure (NVM removing or replacing Node without asking) is what the classic guidance warns about. Both are avoided by not layering NVM on top of the existing install.

### 2.5 Repo-root pin files affect Render

Render checks, in order: the `NODE_VERSION` environment variable, `.node-version` at the repo root, `.nvmrc` at the repo root, then `engines.node` in `package.json`.

- A `.nvmrc` with `18.20.5` added to the WA root (a natural thing to do when adopting NVM) would **pin production to Node 18** on the next deploy.
- A pin file inside `TNNA\` is *not* read by Render, so it is safe there.
- Add or change any root-level pin only as a deliberate production decision, coordinated with the Render dashboard.

### 2.6 A refinement to the Gradle history in Section 5 of the review

The error `Unsupported class file major version 65` means Java 21 bytecode. Gradle 8.2.1 cannot run on Java 21 (Gradle gained Java 21 support in 8.5). The mixed Capacitor versions produced a Gradle 8.2.1 wrapper, and Android Studio's bundled JDK is 21. So your conclusion is correct: the mismatch was the root cause, and clearing the Gradle cache could never fix it.

Capacitor 8 expects Android Studio 2025.2.1 or newer (you have 2026.1.4), Android SDK Platform 36, JDK 21 recommended (17+ supported), AGP 8.13.0, and Gradle 8.14.3. Section 7 lists the checks that keep leftovers from Android Studio 4.1 (old `JAVA_HOME`, old SDK folder) from interfering.

---

## 3. Recommended architecture

```text
Phase 1-2 (no system change)                Phase 3+ (single decision)

 Windows machine                             Preferred:  one Node 24 install
 |                                                       (standalone MSI replaces 18)
 +-- Node 18.20.5  (standalone, untouched)               WA + TNNA both on Node 24
 |     default in every existing terminal
 |     WA keeps running exactly as today     Fallback:   NVM for Windows v2
 |                                                       Node 18.20.5 (WA) + Node 24 (TNNA)
 +-- C:\Tools\node-v24.x.y-win-x64\                      pinned per directory
 |     portable, unpacked from a .zip
 |     used only in a dedicated VS Code
 |     terminal profile: "PowerShell (Node 24 - TNNA)"
 |     prompt shows [node v24.x.y]
```

**Why this order:**

1. Phase 1 gets `npx cap add android` working today with **zero** registry, PATH, or installer changes. Rollback is deleting a folder.
2. Phase 2 answers the real question ("can WA run on a supported Node?") using the same portable Node, in an isolated clone, without touching WA's working environment.
3. Only after that evidence do you choose between one supported Node (simplest to maintain) and two managed Nodes (only if WA genuinely needs 18).

This also satisfies your stated goals: it preserves WA's source and dependencies (Goal 1), avoids changing the WA runtime (2), gives TNNA Node 24 (3), touches no PATH or symlink (4), and in the end state leaves no duplicate installs (5), stays simple (6), works from VS Code PowerShell (7), and makes the active version visible in the prompt (8).

---

## 4. Precise step-by-step sequence

### Phase 0: Snapshot (10 minutes, read-only)

Run in PowerShell. Output goes outside the repo so nothing can be committed by accident.

```powershell
$dst = "C:\AppProjectwDB\_node_migration_backup\$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Force $dst | Out-Null

# Versions and resolution order
node -v                       | Out-File "$dst\node-v.txt"
npm -v                        | Out-File "$dst\npm-v.txt"
where.exe node                | Out-File "$dst\where-node.txt"
where.exe npm                 | Out-File "$dst\where-npm.txt"
where.exe npx                 | Out-File "$dst\where-npx.txt"
Get-Command node -All | Format-List * | Out-File "$dst\get-command-node.txt"
node -p "process.execPath + [char]10 + JSON.stringify(process.versions,null,2)" | Out-File "$dst\node-process.txt"

# PATH, split by scope, one entry per line
[Environment]::GetEnvironmentVariable('Path','Machine') -split ';' | Out-File "$dst\path-machine.txt"
[Environment]::GetEnvironmentVariable('Path','User')    -split ';' | Out-File "$dst\path-user.txt"
Get-ChildItem Env: | Where-Object Name -match 'NODE|NVM|NPM|JAVA|ANDROID|GRADLE' |
  Format-Table -AutoSize | Out-String | Out-File "$dst\env-relevant.txt"

# npm configuration and global packages
npm config get prefix         | Out-File "$dst\npm-prefix.txt"
npm root -g                   | Out-File "$dst\npm-root-g.txt"
npm list -g --depth=0         | Out-File "$dst\npm-global-list.txt"
npm config list               | Out-File "$dst\npm-config.txt"
Get-ChildItem "$env:APPDATA\npm" -ErrorAction SilentlyContinue | Out-File "$dst\appdata-npm-listing.txt"
foreach ($f in "$env:USERPROFILE\.npmrc") { if (Test-Path $f) { Copy-Item $f "$dst\user.npmrc" } }

# Installed Node entry in Windows Apps
Get-ItemProperty `
  HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*, `
  HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*, `
  HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* -ErrorAction SilentlyContinue |
  Where-Object DisplayName -like 'Node.js*' |
  Select-Object DisplayName, DisplayVersion, InstallLocation, UninstallString |
  Format-List | Out-File "$dst\installed-node.txt"

# Project state
Set-Location C:\AppProjectwDB\WonderfulAppsRender
git status -sb                | Out-File "$dst\git-status.txt"
git rev-parse HEAD            | Out-File "$dst\git-head.txt"
npm ls --depth=0              | Out-File "$dst\wa-npm-ls.txt"
Get-FileHash package-lock.json, TNNA\package-lock.json -Algorithm SHA256 | Out-File "$dst\lock-hashes.txt"

# Android-side environment (for Section 7)
cmd /c "java -version 2>&1"   | Out-File "$dst\java-version.txt"
```

Also do these two things now:

1. **Keep a copy of the current Node installer.** Download `node-v18.20.5-x64.msi` from `https://nodejs.org/dist/v18.20.5/` into `$dst`, and record its SHA-256 (`Get-FileHash`). Node 18 is end-of-life, so do not assume it stays easy to find.
2. **Commit and push** the `townNNA` branch (you already planned this). Confirm `git status` is clean.

Optional: create a Windows restore point (`Checkpoint-Computer -Description "Before Node change"`, elevated, requires System Protection enabled).

**Baseline proof for WA:** with Node 18 as it is today, start WA, load `/`, complete a login (including the email code), and note the commit hash. This is your "known good".

### Phase 1: Unblock TNNA with portable Node 24 (30 minutes, no system change)

1. Confirm the current 24.x patch at `https://nodejs.org/en/download`. (Render's default was 24.21.0 as of Sept 17, 2026; the commands below use it, so adjust if a newer 24.x exists.)
2. Download the Windows x64 **zip** (not the MSI):
   ```powershell
   New-Item -ItemType Directory -Force C:\Tools | Out-Null
   Invoke-WebRequest https://nodejs.org/dist/v24.21.0/node-v24.21.0-win-x64.zip -OutFile C:\Tools\node-v24.21.0-win-x64.zip
   Invoke-WebRequest https://nodejs.org/dist/v24.21.0/SHASUMS256.txt -OutFile C:\Tools\SHASUMS256.txt
   Get-FileHash C:\Tools\node-v24.21.0-win-x64.zip -Algorithm SHA256   # must match the line in SHASUMS256.txt
   Expand-Archive C:\Tools\node-v24.21.0-win-x64.zip -DestinationPath C:\Tools
   ```
3. Add a dedicated terminal profile so the version is explicit and other terminals are unaffected. Put this in `.vscode\settings.json` (workspace) or in your user settings:
   ```json
   {
     "terminal.integrated.profiles.windows": {
       "PowerShell (Node 24 - TNNA)": {
         "source": "PowerShell",
         "args": [
           "-NoExit",
           "-Command",
           "$env:Path = 'C:\\Tools\\node-v24.21.0-win-x64;' + $env:Path; $env:NPM_CONFIG_PREFIX = 'C:\\Tools\\npm-global-24'; $script:nv = (node -v); function global:prompt { '[node ' + $script:nv + '] ' + (Get-Location) + '> ' }"
         ]
       }
     }
   }
   ```
   `NPM_CONFIG_PREFIX` keeps any global npm installs made under Node 24 out of `%APPDATA%\npm`, which Node 18 uses. Avoid global installs entirely if you can.
4. Open a terminal from that profile (Terminal → new terminal dropdown) and check:
   ```powershell
   node -v                 # v24.21.0
   npm -v
   where.exe node          # C:\Tools\node-v24.21.0-win-x64\node.exe first, then C:\Program Files\nodejs\node.exe
   cd C:\AppProjectwDB\WonderfulAppsRender\TNNA
   npm ci                  # or npm install if no lock is trusted yet
   npx cap --version       # 8.5.2
   npx cap add android
   ```
5. In TNNA only, add guard rails so a wrong-Node run fails clearly:
   - `TNNA\package.json`: `"engines": { "node": ">=22" }`
   - `TNNA\.npmrc`: `engine-strict=true`
   - `TNNA\.node-version`: `24` (harmless to Render, useful to NVM/fnm later)

**Phase 1 acceptance:** in a normal terminal, `node -v` is still `v18.20.5`; WA still starts; `path-machine.txt` and `path-user.txt` re-captured are identical to the snapshot.

### Phase 2: Test WA on Node 24 in an isolated clone (half a day)

Do **not** install or rebuild in the live WA folder. Use a separate work tree so `node_modules` and `package-lock.json` in the working project cannot be disturbed.

```powershell
Set-Location C:\AppProjectwDB\WonderfulAppsRender
git worktree add ..\WA-node24-test main        # use the branch that Render deploys
Set-Location ..\WA-node24-test
# use the Node 24 terminal profile here
npm ci                                          # not "npm install": do not rewrite the lockfile
node --trace-deprecation server.js
```

- Copy `.env` in manually (it is not in Git) and point the database settings at a **non-production copy**. The Family Tree tests write data.
- Node 24 ships a newer npm than Node 18 (npm 11 vs 10). Never commit a lockfile change that came from this test tree.
- Run one server at a time on the port your CORS list expects (`localhost:8080`).

**Test matrix** (each row is a pass/fail against the Node 18 baseline):

| Area | What to exercise | Why it matters on Node 24 |
|---|---|---|
| Startup | `server.js` boots, no removed-API errors; review `--trace-deprecation` output | Node 24 runtime-deprecates `url.parse()`, `SlowBuffer`, and other legacy APIs |
| Database | Connect to the dev DB; confirm each connection runs `SET time_zone = '+00:00'`; read and write a `TIMESTAMP` | mysql2 and the UTC standard are core to WA |
| **Database TLS** | If the DB connection uses TLS: connect and query | Node 24 uses OpenSSL 3.5 at security level 2, which rejects short RSA/DSA/DH keys and RC4. A MySQL 5.5 server with a 1024-bit certificate would fail. **VERIFY** whether `dbConnection.js` enables `ssl` |
| Auth | Register, login, email code (Resend), JWT, protected call, 8-hour expiry | bcrypt 6 native module; jsonwebtoken |
| Native modules | bcrypt hash and compare on an existing user; sharp image processing | Prebuilt binaries must exist for Node 24 on win32-x64 |
| Uploads | Family Tree profile image upload (multipart bypass in `server.js`), R2 upload and retrieval | Multer 2, AWS SDK 3.750.0, sharp |
| Subscription | Allowed and denied paths for each `AppKey`; promo redemption; admin grant | Express 5 middleware chain |
| Notifications | Preference save, public unsubscribe (GET and POST), network verification (GET and POST) | Public token flows |
| Family Tree | One Tree Merge, then Undo, then split-view persistence after logout/login | Largest transactional code path in WA |
| External APIs | ETF calls (Yahoo/Finnhub/Polygon/Tiingo), geocode, `/send-email` | axios, yahoo-finance2, HTTPS behavior |
| Logging | Winston and Morgan write; no crash on log rotation | Runtime behavior |
| Static/PWA | `httpdocs` served; HTML `no-cache`; service worker and manifest headers | Express 5 static behavior |
| Audit | `npm audit`, `npm ls` with no unmet peers | Baseline hygiene |

Record results in a short table (pass, fail, notes). If everything passes, WA is ready to standardize on Node 24.

### Phase 3: Decision gate

| Outcome | Action |
|---|---|
| WA passes on Node 24 | **Phase 4A:** one Node for both projects. |
| WA fails on Node 24, and the fix is small | Fix in a normal branch, retest, then **Phase 4A**. |
| WA fails and needs a large change | Keep 18.20.5 for WA for now. Adopt **Phase 4B (NVM)** and schedule the upgrade as its own project. |

### Phase 4A: Standardize on Node 24 (preferred end state)

1. Quit VS Code fully, stop any running Node process (`Get-Process node`), and stop dev servers. A running `node.exe` locks files.
2. Download the official Node 24 **MSI** from nodejs.org and install over the existing Node in the default location. On the optional-tools page, **do not** tick "Automatically install the necessary tools" (it installs a large Chocolatey/Visual Studio toolchain you do not need).
3. Open a new terminal and verify (Section 6). Expect a single `where.exe node` entry.
4. In WA: delete `node_modules` and run `npm ci` under Node 24. Re-reinstall any global packages you actually use, from the inventory in Phase 0.
5. Retire `C:\Tools\node-v24...` and the terminal profile, or keep them as a spare.
6. **Only now** make the production decision (Section 2.5): set `NODE_VERSION` in Render, or add a root `.node-version`, so local and production match. Deploy and watch the build log.
7. Add an `engines` field to the WA `package.json` reflecting the real supported range.

### Phase 4B: NVM fallback

If you end up here, use Appendix A. It requires removing the standalone Node 18 first.

---

## 5. Answers to the review questions

### A. NVM architecture

NVM for Windows v2 is appropriate **if you truly need two Node versions long term**. It is actively developed, needs no admin rights in shim mode, and supports per-directory pinning. Its costs for you: it is a fresh rewrite, its signing status is unclear (Section 2.3), and it requires removing the existing Node 18 install.

Alternatives are ranked in Question I. My preference order for this project is: single Node 24 (preferred), portable Node 24 as a stepping stone, then NVM v2 or fnm if two versions are still needed.

If you download the v2 installer anyway, check it before running:

```powershell
Get-AuthenticodeSignature .\nvm-2.0.0-amd64-setup.exe | Format-List Status, SignerCertificate
Get-FileHash .\nvm-2.0.0-amd64-setup.exe -Algorithm SHA256   # compare with the release page
```

### B. Existing Node installation

Leave it untouched now. It is your rollback, and Phases 1 and 2 do not need it removed. If NVM is adopted later, **uninstall it first** through Windows Settings → Apps, then delete leftover `C:\Program Files\nodejs`. Do not rely on NVM to "migrate" it. The safest exact sequence is Appendix A.

### C. PATH and symlink risk

What to anticipate:

- **PATH order** (System before User): the old Node can shadow NVM (Section 2.4).
- **Leftover directory:** the classic link mode cannot replace an existing `C:\Program Files\nodejs`, even an empty one.
- **Locked files:** a running `node.exe` (dev server, nodemon, VS Code extension host) blocks switching or uninstalling.
- **Stale environment in VS Code:** VS Code captures its environment when it starts. After any PATH change, quit *all* VS Code windows and reopen. A new terminal tab alone is not enough.
- **Global packages:** the old global folder is `%APPDATA%\npm`. It is not removed by the Node uninstaller.

Checks before and after (extend your suggested list):

```powershell
where.exe node; where.exe npm; where.exe npx
Get-Command node -All | Select-Object Source, Version
node -v; npm -v
node -p "process.execPath"
npm config get prefix; npm root -g
[Environment]::GetEnvironmentVariable('Path','Machine') -split ';'
[Environment]::GetEnvironmentVariable('Path','User')    -split ';'
Get-Process node -ErrorAction SilentlyContinue
```

The **first** line of `where.exe node` is the one that runs. Compare `path-machine.txt` and `path-user.txt` against the Phase 0 snapshot after any change.

### D. Existing WA compatibility

- **Any reason WA must stay on 18?** None is visible in `CLAUDE.md` or `TechSummary.md`. The stated dependencies (Express 5, mysql2 3, bcrypt 6, sharp 0.33.5, multer 2, AWS SDK 3.750.0, yahoo-finance2 2.13, and others) are all mainstream, and none is documented as Node-18-only. Unknowns: undocumented dependencies, code using APIs removed in newer Node, and TLS behavior toward MySQL 5.5. That is exactly what the Phase 2 matrix tests.
- **Reasons to move:** Node 18 has received no security fixes since April 2025; production probably runs a newer Node; and the pinned AWS SDK will keep working but you are cut off from newer SDK releases, since AWS has been dropping Node 18 support (**VERIFY** its current policy).
- **Recommendation:** yes, test WA under Node 24 and standardize on it if it passes. Run the Section 4 Phase 2 matrix before making Node 24 the default.

### E. Global npm packages

Yes, they are affected. Global packages live in `%APPDATA%\npm` (per the `npm config get prefix` output in your snapshot) and belong to whichever Node installed them. Version managers keep globals per Node version.

- Inventory now: `npm list -g --depth=0` and `Get-ChildItem "$env:APPDATA\npm"` (both in the Phase 0 script).
- Reinstall per version only what you actually use.
- Prefer project-local tools (`npx`, `devDependencies`) over globals. Capacitor's CLI is already local to TNNA, which is the right pattern. If `nodemon` or similar is global today, make it a `devDependency`.

### F. Two separate dependency trees

No conflict in principle: WA and TNNA each resolve against their own `package.json`, lockfile, and `node_modules`. Practical cautions:

- Install with `npm ci`, and don't let a different npm version rewrite a lockfile. Different Node versions ship different npm versions.
- WA's native modules (bcrypt, sharp) should be reinstalled with `npm ci` after a Node major change.
- Node resolves `require()` by walking up the folder tree. TNNA lives inside the WA folder, so a missing TNNA dependency could accidentally resolve from WA's `node_modules`. Keep TNNA's `package.json` complete.
- Root `.gitignore` must cover `TNNA/node_modules` and Android build output (see the companion document, item T12).

### G. Recommended Node release

**Use the latest Node 24.x patch.**

- Node 24 is Active LTS today, supported through April 30, 2028.
- Node 22 is already in Maintenance and ends April 30, 2027, about seven months from now, so it would be a short-lived baseline.
- Node 26 is scheduled to become LTS in late October 2026. Sources gave different exact dates (Oct 20 vs Oct 28). Revisit 26 in H1 2027 once Capacitor, sharp, and bcrypt are confirmed on it.
- Capacitor 8's minimum is Node 22, so 24 is within support.

Pin the exact patch in your notes (for example 24.21.0), and update patches deliberately.

### H. Rollback

| Situation | Rollback |
|---|---|
| Phase 1 (portable Node) | Close the terminal, delete `C:\Tools\node-v24...` and `C:\Tools\npm-global-24`, remove the VS Code profile. Nothing else changed. |
| Phase 4A (MSI upgrade to 24) | Uninstall Node 24 in Apps, then run the saved `node-v18.20.5-x64.msi`. Confirm `where.exe node`, restart VS Code. |
| Phase 4B (NVM) | See Appendix A, step R. |
| Repo | `git` on branch `townNNA`; WA `main` is untouched. Pin file changes in Render can be reverted from the dashboard. |

After any rollback, run the verification commands in Section 6 and the WA baseline test from Phase 0.

### I. Alternative isolation approaches

| Option | Advantages | Disadvantages for this project | Verdict |
|---|---|---|---|
| **Single Node 24 (upgrade WA)** | Simplest; matches supported LTS and likely production | Needs the Phase 2 regression pass | **Preferred end state** |
| **Portable Node zip + terminal profile** | Zero system change; trivially reversible; version shown in prompt | Manual patch updates; must open the right terminal | **Best first step** |
| **NVM for Windows v2** | Two versions, pinning, no admin in shim mode | Must remove existing Node; new rewrite; signing unclear; root pin files hit Render | Fallback |
| **fnm** | Per-session PATH, no machine-wide link, reads `.node-version`/`.nvmrc`; can leave standalone Node in place | Two Node installs coexist (ambiguity); needs profile setup | Reasonable alternative |
| **Volta** | Per-project pinning; Capacitor's docs mention it | Windows setup needs symlink permission; **VERIFY** current maintenance status before adopting | Not recommended now |
| **WSL** | Linux-like tooling | The Android toolchain and emulator run on the Windows host; the repo is on `C:\`; slow cross-boundary file access | No |
| **Windows containers / Docker** | Strong isolation | Poor fit for Android Studio, emulator, and USB device work; heavy | No |
| **Separate Windows user** | Full isolation | Duplicates Android Studio and the SDK; awkward daily use | No |
| **Separate machine** | Complete separation | Cost and sync burden for a two-project solo setup | No |

---

## 6. Post-change verification (acceptance checklist)

Run in **both** a default terminal and, where relevant, the Node 24 terminal.

```powershell
node -v
npm -v
where.exe node
where.exe npm
Get-Command node -All | Select-Object Source, Version
npm config get prefix
npm root -g
```

| # | Check | Pass criterion |
|---|---|---|
| 1 | Default terminal (Phase 1-3) | `node -v` = `v18.20.5` |
| 2 | Node 24 terminal | `node -v` = `v24.x.y`, prompt shows `[node v24.x.y]` |
| 3 | PATH unchanged (Phase 1-3) | `path-machine.txt` and `path-user.txt` match the snapshot |
| 4 | WA runs | Server boots, login and a protected API call work |
| 5 | TNNA CLI | `npx cap --version` = 8.5.2; `npx cap add android` succeeds |
| 6 | Git clean | Only intended changes; no lockfile churn in WA |
| 7 | End state (Phase 4A) | Exactly one `node.exe` in `where.exe node` |
| 8 | Prod parity (Phase 4A) | Render build log shows the same major Node as local |

---

## 7. Adjacent checks before `npx cap add android`

These are outside the Node question but block the same goal. Run after Node 24 is available in the terminal.

```powershell
java -version                      # or check Android Studio: Settings > Build Tools > Gradle > Gradle JDK (use the bundled JDK 21)
$env:JAVA_HOME
$env:ANDROID_HOME; $env:ANDROID_SDK_ROOT
Get-ChildItem "$env:LOCALAPPDATA\Android\Sdk" -ErrorAction SilentlyContinue
```

- If `JAVA_HOME` points to an old JDK (for example JDK 8 left by Android Studio 4.1), fix it or clear it. Prefer the Gradle JDK selected inside Android Studio.
- In Android Studio's SDK Manager, install **Android SDK Platform 36** and current command-line tools. Old SDK folders from 4.1 can carry very old tools.
- After `npx cap add android`, expect Gradle 8.14.3 and AGP 8.13.0. Do not hand-edit the Gradle wrapper back to an older version.
- Commit the generated `android/` project (minus build output) so it never has to be regenerated from scratch again.
- Delete-and-regenerate was a good move given the mismatched versions. From now on, use `npx cap sync android`, not `add`, for changes.

---

## 8. Concerns about Node 18 for WA and Node 24 for TNNA in one repo

The two-version setup is technically fine. Practical risks:

1. **Human error:** running `npm install` in the wrong terminal. The `engines` + `engine-strict` guard in TNNA and the visible prompt reduce this.
2. **Production drift:** WA on 18 locally while Render runs something newer (Section 2.2).
3. **Pin-file leakage:** a root `.nvmrc` or `.node-version` changes Render (Section 2.5).
4. **Lockfile churn:** two npm major versions touching the same repo over time.
5. **Long-term:** maintaining two runtimes is recurring cost for no product benefit once WA passes on Node 24.

**Would standardizing on Node 24 be preferable?** Yes, after the Phase 2 test. It eliminates all five risks.

---

## 9. What I recommend you do next

1. Run **Phase 0** now (read-only).
2. Check the **Render dashboard** for the Node version in use in production.
3. Do **Phase 1** to unblock `npx cap add android`.
4. Schedule **Phase 2** as its own session, with a non-production database copy.
5. Decide at the **Phase 3 gate**.

I would not run the NVM installer until Phase 3 says two versions are actually needed.

---

## 10. Sources (checked Sept 30, 2026)

- Node.js release schedule and end-of-life dates: `github.com/nodejs/Release`, `github.com/nodejs/LTS`, and secondary summaries (HeroDevs, PocketLantern, endoflife.ai write-ups)
- Node 24 breaking changes (OpenSSL 3.5 security level 2, runtime deprecations): Node 22-to-24 migration notes, NodeSource, Red Hat Node 24 release notes
- NVM for Windows: `github.com/nvm-windows/nvm` (README), `docs.nvm-windows.com` (What's new in v2, Operating Modes, Installers), project wiki (Common Issues), Microsoft Learn "Set up Node.js on native Windows"
- Render: `render.com/docs/node-version` (precedence order and default version history), `render.com/docs/language-support`
- Capacitor 8: `capacitorjs.com/docs/getting-started/environment-setup`, `capacitorjs.com/docs/updating/8-0`, `capacitorjs.com/docs/updating/plugins/8-0`

---

## Appendix A: NVM for Windows v2 fallback sequence

Use only if Phase 3 concludes WA must stay on Node 18. Confirm exact command names with `nvm --help`; I verified `nvm use shim`, `nvm use link`, `nvm cfg set mode=...`, and `nvm alias`.

**Before:**

1. Complete Phase 0 (snapshot, saved 18.20.5 MSI, clean `git status`, pushed branch).
2. Download the NVM installer only from `github.com/nvm-windows/nvm/releases`. Check its signature and hash (Section 5, Question A). Prefer the newest stable release over 2.0.0 if one exists (a 2.0.1 beta is listed; do not use betas here).
3. Close VS Code and every terminal. Confirm `Get-Process node` returns nothing.

**Install:**

4. Uninstall Node.js from Settings → Apps. Delete `C:\Program Files\nodejs` if it remains.
5. Open a new terminal. `node -v` should now say "not recognized". Do not proceed if it still resolves.
6. Run the NVM installer. Use the default per-user location. Choose **shim mode** (the default).
7. Open a new terminal. Install versions:
   ```powershell
   nvm install 18.20.5
   nvm install 24        # or the exact 24.x.y
   nvm use 18.20.5
   node -v               # v18.20.5
   where.exe node        # one NVM-managed entry first
   ```
8. Restore only the global packages you actually need, per version.

**Pin per directory (shim mode):**

9. In `TNNA\` add `.node-version` containing `24` (already done in Phase 1).
10. For WA, prefer **no** root pin file until you also want Render to change. Use `nvm use 18.20.5` as the default instead. If you do add a root pin, treat it as a production change (Section 2.5).

**Verify:** run Section 6 checks and the WA baseline test.

**R. Rollback:**

1. Close VS Code and terminals. Stop Node processes.
2. Uninstall NVM with its own uninstaller (Settings → Apps).
3. Remove leftover NVM folders (`%APPDATA%\nvm` or the folder you chose) and any `NVM_*` user environment variables and PATH entries.
4. Reinstall Node 18.20.5 from the saved MSI.
5. Restart VS Code, verify with Section 6, and re-run the WA baseline test.
