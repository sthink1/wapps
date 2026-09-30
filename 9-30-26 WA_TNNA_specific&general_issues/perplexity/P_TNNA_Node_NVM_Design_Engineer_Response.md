# TNNA Node Runtime and Version-Management Design Review

**Project:** WonderfulApps (WA) and Town Notification Native App (TNNA)  
**Review date:** September 30, 2026  
**Decision scope:** Windows Node.js runtime management needed to continue TNNA Capacitor development without destabilizing WA

## 1. Decision Summary

**Recommendation:** Adopt **NVM for Windows** as the Windows-wide Node version manager, remove the existing standalone Node.js installation as part of a controlled migration, retain a pinned Node 18.20.5 runtime only as a temporary WA compatibility baseline, and establish **Node 24 LTS** as the target runtime for TNNA and, after regression testing, for WA.

This is a valid use case for NVM for Windows: one Windows development workstation, two independent Node projects in the same repository, and a real near-term need to select different Node runtimes. TNNA cannot continue on the installed Node 18.20.5 because Capacitor 8 requires Node 22 or higher. The installed Capacitor 8.5.2 package set is already internally aligned; the immediate blocker is the runtime, not the Capacitor version set.

The current Node 18.20.5 version should **not** remain as an independent Windows installation alongside NVM. NVM for Windows selects versions by redirecting a single Node path through a Windows symlink. Leaving a conventional Node installation at the same or competing path can cause `where.exe node`, VS Code terminals, npm, and NVM to resolve different executables. The reliable architecture is one manager and one active Node path.

### Recommended end state

```text
Windows workstation
|
+-- NVM for Windows
    |
    +-- Node 18.20.5       Temporary WA baseline / rollback runtime
    |
    +-- Node 24.x LTS      Default TNNA runtime and WA migration target
    |
    +-- One NVM-controlled active Node path
          |
          +-- WA root package.json / package-lock.json
          +-- TNNA package.json / package-lock.json
```

Node 24 is the recommended strategic choice rather than beginning new TNNA work on Node 22. Node 22 is still supported but is in Maintenance LTS and reaches end of life on April 30, 2027. Node 24 is in Active LTS through October 20, 2026 and is scheduled for support through April 30, 2028. Capacitor 8 requires Node 22 or later, so Node 24 satisfies its requirement while giving the project a longer support runway. [web:15][web:22]

**Exception:** If a project dependency, Android/Capacitor plugin, organization policy, or reproducibility requirement specifically mandates Node 22, install the latest Node 22 patch—not 22.0.0—and pin it. That is an acceptable bridge, but it should not be the long-term default when Node 24 is available and passes TNNA testing.

## 2. Architecture Decision

### 2.1 Chosen approach: NVM for Windows

NVM for Windows is appropriate provided it becomes the sole Windows-managed Node installation mechanism. It provides an understandable workflow for PowerShell and VS Code:

```powershell
nvm list
nvm use 18.20.5       # WA compatibility test / rollback work
nvm use 24            # TNNA and target shared runtime
node --version
npm --version
where.exe node
where.exe npm
```

NVM for Windows changes the active runtime globally for the Windows user/session by directing the configured `NVM_SYMLINK` path to the selected Node version. That means version selection is not automatically per project. The required operating discipline is to open a **new terminal after `nvm use`**, verify the version, and run commands only from the intended project directory.

### 2.2 Why standalone Node must be removed

Do not leave the pre-NVM Node 18.20.5 installation as an equal competing installation. The NVM for Windows maintainers explicitly identify an earlier standalone Node installation as a common cause of symlink and PATH problems and recommend uninstalling prior Node installations before installing NVM. NVM adds its controlled symlink path to `PATH`; Windows uses the first matching `node.exe` found in path order. [web:23][web:24]

This is not a source-code migration. Uninstalling standalone Node does not remove WA source files, Git history, project-local `node_modules`, `package.json`, or either lockfile. However, it can remove or orphan **global npm packages**, so inventory them first and reinstall only the few genuinely required global tools under the desired NVM-managed Node versions.

### 2.3 Project-level dependency isolation

WA and TNNA already have the correct basic separation:

```text
WonderfulAppsRender\package.json
WonderfulAppsRender\package-lock.json
WonderfulAppsRender\node_modules\

WonderfulAppsRender\TNNA\package.json
WonderfulAppsRender\TNNA\package-lock.json
WonderfulAppsRender\TNNA\node_modules\
```

A single active Node runtime does not merge those dependency trees. `npm ci` or `npm install` executed in the WA root affects the WA tree; the same command executed in `TNNA` affects the TNNA tree. Do not run npm commands from the repository root when the intended target is TNNA, and do not copy `node_modules` between the two projects.

The important compatibility rule is different: native or platform-sensitive packages can be compiled or selected for the active Node ABI. After switching major Node versions, reinstall dependencies from each project’s lockfile before treating the environment as validated. For clean repeatability, prefer `npm ci` where the lockfile is authoritative.

## 3. Required Pre-Migration Controls

### 3.1 First: create recoverable project checkpoints

Before modifying Windows Node tooling:

1. Confirm the current TNNA work is on the intended `townNNA` branch.
2. Review `git status` at the WA repository root.
3. Commit all intended WA/TNNA source, `package.json`, and `package-lock.json` changes.
4. Push the branch to the remote repository and confirm the remote commit is visible.
5. Do **not** commit `node_modules`, Gradle caches, Android build outputs, credentials, `.env` files, or generated secrets.
6. Make a local copy or export of any important environment configuration, especially `.env` values, database connection settings, signing material, and Android SDK/JDK configuration. This is separate from NVM but is prudent before tooling work.

The Git branch protects code and lockfiles. It does not preserve global npm packages, environment variables, Windows PATH, Android Studio settings, or local secrets—hence the separate inventory below.

### 3.2 Capture the current Node state

Run the following in a normal PowerShell terminal **before** uninstalling anything. Save the output in a dated text file outside the repository or in a local untracked `docs/local-environment/` location.

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$report = "$HOME\Desktop\WA-TNNA-Node-Before-$stamp.txt"

"=== Date ===" | Out-File $report
Get-Date | Out-File $report -Append

"`n=== Executables ===" | Out-File $report -Append
where.exe node 2>&1 | Out-File $report -Append
where.exe npm 2>&1 | Out-File $report -Append
where.exe npx 2>&1 | Out-File $report -Append
Get-Command node -All 2>&1 | Format-List * | Out-File $report -Append
Get-Command npm -All 2>&1 | Format-List * | Out-File $report -Append

"`n=== Current versions ===" | Out-File $report -Append
node --version 2>&1 | Out-File $report -Append
npm --version 2>&1 | Out-File $report -Append
npx --version 2>&1 | Out-File $report -Append

"`n=== npm global configuration ===" | Out-File $report -Append
npm config get prefix 2>&1 | Out-File $report -Append
npm root -g 2>&1 | Out-File $report -Append
npm list -g --depth=0 2>&1 | Out-File $report -Append
npm config list -l 2>&1 | Out-File $report -Append

"`n=== Environment ===" | Out-File $report -Append
Get-ChildItem Env: | Sort-Object Name | Out-File $report -Append

"`n=== User PATH ===" | Out-File $report -Append
[Environment]::GetEnvironmentVariable('Path', 'User') | Out-File $report -Append

"`n=== Machine PATH ===" | Out-File $report -Append
[Environment]::GetEnvironmentVariable('Path', 'Machine') | Out-File $report -Append

"`n=== Node-related installed applications ===" | Out-File $report -Append
Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* , HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* , HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* -ErrorAction SilentlyContinue |
  Where-Object { $_.DisplayName -match 'Node|NVM' } |
  Select-Object DisplayName, DisplayVersion, InstallLocation, UninstallString |
  Format-List | Out-File $report -Append

"`nSaved report: $report" | Tee-Object -FilePath $report -Append
```

Also record the output of the following project checks:

```powershell
Set-Location C:\AppProjectwDB\WonderfulAppsRender
git status
git branch --show-current
node --version
npm ci
npm test
npm run

Set-Location C:\AppProjectwDB\WonderfulAppsRender\TNNA
node --version
npm ci
npm run
```

If either project has no `test` script, `npm test` may exit with an expected “missing script” result. Record that fact rather than treating it as a pass. Use the project’s actual development/start/build scripts listed by `npm run`.

### 3.3 Preserve global tools deliberately

Capture global packages, but do not assume all need restoration. Global packages are tied to the active Node installation under NVM. In most projects, prefer project-local dev dependencies invoked through `npx` or npm scripts rather than a globally installed CLI.

Potential candidates for reinstallation only if actually used include a preferred formatter, a diagnostic utility, or legacy command-line tool. Capacitor should remain project-local inside `TNNA`; use `npx cap ...` from that directory. That guarantees the project’s installed Capacitor CLI version is used.

### 3.4 Stop running Node processes

Before uninstalling Node or adding NVM:

```powershell
Get-Process node -ErrorAction SilentlyContinue
Get-Process | Where-Object { $_.ProcessName -match 'node|npm|java|gradle' }
```

Stop only processes that are known to be your local development server, Vite/Capacitor process, or related build process. Close VS Code terminals that are running WA/TNNA commands. Then close VS Code itself before the actual Node uninstall/NVM install. This avoids locked files and ensures new environment variables are picked up cleanly later.

## 4. Exact Migration Sequence

### Phase A — Prepare

1. Complete the Git/backup/inventory actions in Section 3.
2. Confirm `where.exe node` shows only the expected existing standalone Node location, typically a Node installation directory such as `C:\Program Files\nodejs\node.exe`.
3. Confirm no work depends on an unrecorded global npm tool.
4. Keep the official standalone Node installer for 18.20.5 available only as an emergency rollback aid; do not run it unless NVM rollback is required.

### Phase B — Remove the competing standalone Node install

1. In **Windows Settings → Apps → Installed apps**, locate the existing **Node.js** installation corresponding to v18.20.5.
2. Uninstall that standalone Node.js installation.
3. Do not manually delete `C:\Program Files\nodejs` before using the Windows uninstaller. Let the uninstaller remove it first.
4. If remnants remain after uninstall, do not delete them yet. First inspect them and confirm they are the obsolete standalone Node location, not a newly created NVM symlink.
5. Open a new elevated PowerShell window and check:

```powershell
where.exe node
where.exe npm
node --version
npm --version
```

At this intermediate point, `node` and `npm` may correctly be unavailable. That confirms the old executable is no longer silently winning PATH resolution.

### Phase C — Install NVM for Windows

1. Run the downloaded NVM for Windows installer **as Administrator**.
2. Choose an NVM home directory with no spaces and no pre-existing Node contents, for example:

```text
C:\nvm
```

3. Choose the Node symlink path deliberately. The common default is:

```text
C:\Program Files\nodejs
```

Use that location only if the old standalone directory has been successfully removed and the path is available for NVM to control. If it is not cleanly available, use a different dedicated, stable path such as:

```text
C:\nodejs
```

The NVM symlink path must not be an existing physical Node installation directory. It will become the single PATH-visible location selected by NVM.

4. Complete installation without installing any Node version through a separate Node MSI installer.
5. Close **all** PowerShell, Command Prompt, Git Bash, and VS Code windows. Reopen a fresh **Administrator PowerShell** window. Existing terminals retain the old environment.
6. Verify NVM exists:

```powershell
nvm version
nvm root
nvm list
Get-ChildItem Env:NVM_HOME, Env:NVM_SYMLINK
where.exe nvm
```

If `nvm` is not recognized after a new terminal is opened, inspect PATH before making any other changes:

```powershell
[Environment]::GetEnvironmentVariable('Path', 'User')
[Environment]::GetEnvironmentVariable('Path', 'Machine')
```

### Phase D — Install exact runtimes under NVM

Install the known WA baseline first, then the target TNNA runtime.

```powershell
nvm install 18.20.5
nvm install 24
nvm list
```

If `nvm install 24` is not accepted by the installed NVM version, use the latest available **24.x LTS patch** reported by `nvm list available` or the Node release site, for example:

```powershell
nvm list available
nvm install 24.x.x
```

Do not use an unpinned `latest` in project documentation. Once installed and verified, record the concrete Node 24 patch in both projects’ developer documentation.

If TNNA must temporarily use Node 22 for a tested plugin/toolchain reason, install the latest 22.x patch as well:

```powershell
nvm install 22.x.x
```

### Phase E — Verify the Node selector and npm origin

Switch to Node 18 and verify every executable path:

```powershell
nvm use 18.20.5
node --version
npm --version
npx --version
where.exe node
where.exe npm
where.exe npx
npm config get prefix
npm root -g
```

Then switch to Node 24 and run the same commands:

```powershell
nvm use 24
node --version
npm --version
npx --version
where.exe node
where.exe npm
where.exe npx
npm config get prefix
npm root -g
```

Expected result:

- `node --version` changes to the selected version.
- `where.exe node` returns one NVM-controlled active Node location first; ideally it returns only that one executable.
- npm/npx resolve from the selected runtime’s installation.
- No old standalone Node path appears before the NVM symlink path.

If `where.exe node` reports two locations, do not proceed with project installation until the extra standalone path has been removed from PATH or otherwise resolved. Do not “fix” the condition by randomly reordering PATH entries until the physical installation and symlink architecture are understood.

### Phase F — Restore project dependencies from lockfiles

Do not reuse dependencies blindly across a Node-major change. From fresh terminals, reinstall each tree separately.

For WA baseline validation:

```powershell
nvm use 18.20.5
Set-Location C:\AppProjectwDB\WonderfulAppsRender
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm ci
npm run
```

For TNNA:

```powershell
nvm use 24
Set-Location C:\AppProjectwDB\WonderfulAppsRender\TNNA
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm ci
npm run
npx cap --version
npx cap add android
```

Run `npx cap add android` only after confirming that the old generated `TNNA\android` directory is truly absent and that `capacitor.config.json`, `package.json`, and the `public` web assets are correct. The command creates project state; it should be run from the `TNNA` directory with the intended Node version shown immediately beforehand.

After `npx cap add android`, run the appropriate Capacitor synchronization/build commands from the same TNNA directory. Do not use a global Capacitor installation.

## 5. WA Compatibility and Standardization

### 5.1 No documented hard reason to remain on Node 18

Based on the supplied WA architecture, no component is inherently pinned to Node 18. WA uses current-generation packages such as Express 5, mysql2 3.x, jsonwebtoken 9, bcrypt 6, multer 2, Sharp 0.33.5, and AWS SDK v3. The supplied documentation does not identify a Node-18-only dependency or a host constraint requiring that runtime.

However, absence of a documented pin is not proof of runtime compatibility. WA includes native/sensitive components (`bcrypt`, `sharp`), MySQL access, file uploads, PWA behavior, R2/S3 integrations, email, JWT flow, and complex multi-table Family Tree operations. A controlled regression test is necessary before declaring Node 24 the WA standard.

### 5.2 Recommended transition policy

Use this policy:

| Stage | WA runtime | TNNA runtime | Decision meaning |
|---|---|---|---|
| Immediate recovery baseline | 18.20.5 | Not applicable | Preserves the already known WA development runtime under NVM |
| TNNA enablement | 18.20.5 | 24.x LTS | Unblocks Capacitor while WA remains unchanged |
| Compatibility test | 24.x LTS | 24.x LTS | Proves whether one shared runtime is safe |
| Target standard | 24.x LTS | 24.x LTS | Simplifies onboarding, CI, scripts, and security maintenance |
| Fallback | 18.20.5 | 24.x LTS | Use only if a specific WA incompatibility is identified and tracked |

Node 18 reached end of life in April 2025. It should not be treated as a permanent production/development standard. The preferred outcome is a common supported LTS runtime after WA testing. [web:17][web:22]

### 5.3 WA regression gate for Node 24

Create a temporary test checklist and run it with a clean WA dependency install under Node 24. A pass requires both automated checks that exist and focused manual functional checks:

```powershell
nvm use 24
Set-Location C:\AppProjectwDB\WonderfulAppsRender
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm ci
node --version
npm run
```

Then validate:

- Server starts without module-load, native-module, TLS, configuration, or MySQL connection errors.
- User registration, email-code verification, login, JWT issuance, and authenticated API requests work.
- Subscription status, app-access checks, promo redemption, admin grant paths, and authorization-denied behavior work.
- Notification preferences, suppression/unsubscribe links, and a safe test email flow work.
- One representative read/write workflow succeeds in Weight/Activity, Budget, ETF or Interest, and the Town Notice web feature.
- Family Tree person/relationship edits, an authorized image upload/read, Family Networking verification/search, and a nonproduction merge/undo test behave correctly.
- PWA static assets, service worker update behavior, and the intended light-mode pages load correctly.
- The existing Render/deployment build command is run in a nonproduction or preview environment before any production runtime change.

Record the exact Node 24 patch, npm version, OS, JDK version, Android Studio version, command results, and defects. If all critical paths pass, make Node 24 the documented default for both projects. If a failure occurs, identify the dependency or API incompatibility; do not retain Node 18 indefinitely without a dated remediation issue.

## 6. TNNA-Specific Engineering Controls

### 6.1 Node/Capacitor decision

TNNA’s Capacitor 8 requirement is satisfied by Node 24 LTS. Capacitor’s official upgrade guidance states that Capacitor 8 requires Node 22 or greater and recommends the latest LTS version. [web:15]

The prior mismatch among Capacitor packages was correctly addressed: `@capacitor/android`, `@capacitor/core`, and `@capacitor/cli` should remain on the same Capacitor major and preferably the same patch version. Preserve that rule in `TNNA/package.json`; do not mix a global CLI version with an unrelated local package version.

### 6.2 Android toolchain reproducibility

The earlier `Unsupported class file major version 65` symptom indicates a Java/Gradle/Android Gradle Plugin compatibility issue, not merely an NVM issue. Regenerating Android after the matched Capacitor package correction is reasonable, but add a toolchain inventory before and after regeneration:

```powershell
java -version
javac -version
npx cap --version
npx cap doctor
```

Also record inside the generated Android project:

```powershell
Set-Location C:\AppProjectwDB\WonderfulAppsRender\TNNA\android
.\gradlew --version
```

Do not manually upgrade generated Gradle files merely to suppress an error until the newly generated Capacitor 8 Android project and current JDK are evaluated together. The `java -version` output must be compatible with the generated Gradle wrapper and Android Gradle Plugin version.

### 6.3 TNNA is not merely a build wrapper

The larger architectural risk is not Node switching: it is allowing a “native Town Notification app” to diverge unintentionally from WA’s existing Town Notice product and its shared controls. Before real feature implementation, document the native boundary:

```text
TNNA native UI / Capacitor shell
    |
    +-- authenticated API calls to WA backend
    +-- subscription enforcement remains server-side using town_notice
    +-- notification preference/consent service remains centralized
    +-- native device notification registration and delivery requires new design
```

The current WA documents identify `town_notice` in `AppT` as a subscription-controlled application, but do not describe an existing Town Notice route module, native API contract, push-token schema, mobile notification delivery service, or native authentication storage design. Those gaps must be resolved before TNNA moves past the test-shell phase.

## 7. Rollback Procedure

### 7.1 Operational rollback: use Node 18 inside NVM

If Node 24 causes a WA-only incompatibility after NVM itself works:

```powershell
nvm use 18.20.5
Set-Location C:\AppProjectwDB\WonderfulAppsRender
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm ci
node --version
npm run
```

This is the preferred rollback because it preserves the single-manager architecture. It does not require reinstalling the original standalone Node MSI.

### 7.2 Full NVM rollback: return to conventional Node 18

Use this only if NVM installation itself cannot be made reliable.

1. Commit/push project changes and close VS Code and all terminals.
2. Record `nvm list`, `nvm root`, `NVM_HOME`, `NVM_SYMLINK`, and PATH entries.
3. Uninstall NVM for Windows from Windows Installed Apps.
4. Inspect User and Machine PATH and remove stale NVM-specific entries only after confirming the uninstall did not remove them.
5. Remove the former NVM symlink directory only if it is clearly a stale NVM-created symlink/path and no longer used. Do not delete a directory until its type and contents are verified.
6. Reinstall the official standalone Node 18.20.5 installer.
7. Open a fresh PowerShell terminal and verify:

```powershell
where.exe node
where.exe npm
node --version
npm --version
npm config get prefix
```

8. Restore WA project packages from the lockfile:

```powershell
Set-Location C:\AppProjectwDB\WonderfulAppsRender
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm ci
npm run
```

9. Reinstall any intentionally retained global tools from the pre-migration inventory.

This full rollback is reversible but less desirable than continuing with NVM and choosing Node 18 temporarily for WA. Avoid repeated toggling between standalone Node and NVM; it reintroduces the PATH/symlink ambiguity that this design eliminates.

## 8. Alternatives Considered

| Option | Fit for WA/TNNA | Advantages | Disadvantages | Decision |
|---|---|---|---|---|
| NVM for Windows | Strong | Familiar Windows workflow; direct Node 18/24 switching; works in PowerShell and VS Code; solves current block | Global active version; PATH/symlink discipline; admin rights commonly needed | **Adopt** |
| Upgrade both projects directly to Node 24 | Strong final state, insufficient immediate migration method | One runtime; least long-term complexity | WA must first pass regression testing; does not by itself manage fallback | **Target state after testing** |
| Volta | Viable alternative | Can pin Node per project and reduce accidental wrong-version use | Adds another tool model; migration and Windows team workflow need validation | Consider only if per-project automatic pinning becomes essential |
| fnm | Viable alternative | Fast, modern version manager; can support per-directory workflows | Shell initialization/configuration can be less transparent for a Windows-first workflow | Not first choice for this workstation |
| Portable Node | Weak | Avoids touching system Node initially | Manual PATH management; easy to run wrong binary; poor long-term maintenance | Do not use |
| WSL | Partial | Good Linux build/dev isolation | Adds a separate filesystem, tooling, Android SDK integration, and device-debugging complexity | Not for this immediate Windows Android workflow |
| Containers | Weak for native Android dev | Repeatable backend environments | Does not simplify Android Studio/emulator/device tooling; extra complexity | Not for this immediate issue |
| Separate Windows user or machine | Technically safe, operationally costly | Strong isolation | Duplicate tooling/data; inconvenient for one developer | Not needed unless existing machine PATH cannot be cleaned safely |

## 9. Other Risks Found During Review

The Node decision exposes several TNNA/WA design matters that should be formally tracked. They are not blockers to installing NVM, but they are blockers or risks for a production-quality native Town Notification app.

1. **Runtime support baseline:** Node 18 is already end of life. The project needs a dated WA migration plan to Node 24 rather than treating dual runtimes as permanent.
2. **Repository boundary:** TNNA is inside the WA repository, which is workable, but it needs explicit root-level documentation for commands, Node versions, generated-file ignore rules, Android artifact handling, and release tagging. Add a root README section and a `TNNA/README.md`.
3. **Version pinning:** Add a version declaration such as `.nvmrc` for each project or documented `engines` fields. Because NVM for Windows does not necessarily auto-switch by directory, use it as documentation and enforce versions in scripts/CI where practical.
4. **CI/deployment parity:** Render’s Node runtime must be explicitly pinned and upgraded separately from the local Windows runtime. A local Node 24 pass does not upgrade the deployed backend. Ensure the production build/runtime is supported and matches the tested major version before release.
5. **Native auth storage:** WA currently uses browser `localStorage` where tokens are used. A native Capacitor app needs a separate mobile token-storage decision. Do not assume browser `localStorage` is a sufficient production credential vault in a native container. Define token lifetime, refresh/re-authentication, logout, device loss, and secure-storage behavior.
6. **API client boundary:** TNNA needs a defined API base URL/environment model (local, preview, production), TLS-only transport, request timeout/retry behavior, centralized auth-header injection, and server-side authorization identical to WA. Do not hard-code a Render host in the app bundle.
7. **Town Notice backend contract:** The supplied WA documentation lists a `town_notice` subscription app but does not identify a dedicated route module or stable Town Notice API contract. Create an explicit API specification before building native screens.
8. **Push notifications are a new subsystem:** Email/consent infrastructure is not a native push-notification architecture. TNNA requires device-token registration, platform/device metadata, token rotation/revocation, user-level and device-level opt-in state, push provider selection, delivery/receipt/error history, rate limits, topic/geographic targeting rules, and administrative audit controls.
9. **Consent consistency:** Native OS permission consent, WA’s `APP_NOTICE` preference, unsubscribe/suppression state, and notification category rules must be reconciled. An OS-granted push permission must not override WA-level suppression or user preferences; a WA opt-out should prevent app-initiated push delivery where policy requires it.
10. **Subscription enforcement:** TNNA must use the existing `town_notice` entitlement server-side. It must not rely on hiding native UI controls. Also define whether TNNA itself requires a new app key or is merely another client for the existing `town_notice` entitlement.
11. **Mobile security continuity:** Existing sanitization, safe output rendering, backend validation, ownership checks, parameterized SQL, and entitlement checks remain mandatory in the WebView/native context. Add Android network-security and deep-link validation requirements to the TNNA design.
12. **Android release security:** Define Android application signing, keystore backup and access controls, application-ID ownership, build flavor separation, minimum SDK/target SDK policy, crash reporting/privacy posture, and Play Store account/release process before beta distribution.
13. **Offline behavior:** Decide explicitly whether TNNA is online-only, read-through cached, or supports offline queueing. Town notifications are time-sensitive; offline data and retry behavior can create stale, duplicate, or out-of-order notices unless designed deliberately.
14. **Time and locality:** WA’s UTC storage rule is sound. Town notices need an explicit public-display timezone and locale policy, especially for municipal deadlines. Store instants in UTC; identify the town/business timezone for rendering and scheduling.
15. **Observability:** Add a correlation/request ID strategy across native client, WA API, email/push delivery, and administrative records. Existing logging must continue not to capture credentials, JWTs, verification tokens, or sensitive resident data.

## 10. Acceptance Criteria and Next Actions

### Acceptance criteria for the Node migration

The migration is accepted only when all items below are true:

- The original standalone Node installation is removed and no duplicate Node executable competes in PATH.
- `nvm version` works from a fresh PowerShell terminal.
- `nvm use 18.20.5` and `nvm use 24.x` each change `node --version` as expected.
- `where.exe node`, `where.exe npm`, and `where.exe npx` resolve to the intended NVM-controlled runtime path.
- WA installs and starts under Node 18.20.5 using a clean `npm ci`.
- TNNA installs under Node 24 using a clean `npm ci`.
- `npx cap --version` reports the project-local Capacitor version.
- `npx cap add android` succeeds from `TNNA` under Node 24.
- The generated Android project opens/builds using a documented compatible JDK/Gradle toolchain.
- Global tools required by actual workflows are restored intentionally, not by copying global folders.
- A short migration record documents NVM location, Node versions, Node default, npm versions, and the cleanup verification.

### Recommended execution order

1. Commit and push current `townNNA` work.
2. Capture the pre-migration inventory.
3. Remove standalone Node 18.20.5.
4. Install NVM for Windows with a deliberate, clean NVM home and symlink path.
5. Install Node 18.20.5 and latest tested Node 24 LTS patch under NVM.
6. Verify PATH and executable resolution before installing project packages.
7. Revalidate WA under Node 18.20.5.
8. Use Node 24 to run TNNA `npm ci` and `npx cap add android`.
9. Record Android JDK/Gradle versions and build results.
10. Run the WA Node 24 regression gate.
11. If the gate passes, standardize both projects on Node 24 and retain Node 18 only briefly as an explicit rollback runtime.
12. Open design tasks for the native auth, API, push, consent, offline, deployment, and release-control decisions identified above.

## 11. Final Engineering Position

Proceed with NVM for Windows, but treat it as a **controlled replacement** for—not an addition to—the standalone Windows Node installation. Preserve Node 18.20.5 inside NVM for immediate WA stability, use Node 24 LTS for TNNA, and actively validate WA on Node 24 so a single supported runtime becomes the project standard.

The current TNNA blocker is straightforward: Capacitor 8 needs Node 22 or later. The higher-value engineering work is to prevent TNNA from becoming an unbounded WebView copy of WA. Its backend contract, secure mobile authentication, push-notification lifecycle, consent integration, app entitlement model, release pipeline, and offline/timezone behavior must be designed explicitly before it becomes a production native application.
