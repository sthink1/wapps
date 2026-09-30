# Technical Review Report: Node.js / NVM Version-Management Decision for TNNA

**Project:** Wonderful Apps (WA) / Town Notification Native App (TNNA)  
**Date:** September 30, 2026  
**Purpose:** Independent design-engineering review before changing the current Windows Node.js environment.

## 1. Executive Summary

Wonderful Apps (WA) is an existing Node.js web application currently developed and run on a Windows PC using **Node.js v18.20.5**.

A new native mobile application, **Town Notification Native App (TNNA)**, is being created as a separate Capacitor project inside the existing WA repository:

```text
C:\AppProjectwDB\WonderfulAppsRender\TNNA
```

The current TNNA Capacitor packages are:

```text
@capacitor/android  8.5.2
@capacitor/cli      8.5.2
@capacitor/core     8.5.2
```

When attempting to run:

```powershell
npx cap add android
```

Capacitor reported:

```text
[fatal] The Capacitor CLI requires NodeJS >=22.0.0
Please install the latest LTS version.
```

The Windows computer currently reports:

```powershell
node -v
v18.20.5
```

Therefore TNNA requires a newer Node.js runtime than the one currently used for the existing WA project.

The proposed solution has been to install **NVM for Windows 2.0.0** so that both Node.js 18.20.5 and Node.js 22 can coexist and be selected as needed.

Before proceeding, the owner wants an independent engineering review because installing NVM may change Windows PATH, symlink behavior, or the active Node.js installation and could disrupt the existing WA development environment.

No NVM installation has yet been performed.

## 2. Existing Wonderful Apps Environment

Primary project directory:

```text
C:\AppProjectwDB\WonderfulAppsRender
```

The project includes:

```text
httpdocs
routes
services
middleware
server.js
package.json
TNNA
```

WA is an existing Node.js / Express application that is already operational.

The current Windows Node.js version is:

```text
Node.js v18.20.5
```

The existing WA project has historically been developed using that Node version.

The intent is to avoid unnecessarily changing or destabilizing the existing WA project while adding TNNA.

## 3. TNNA Project

TNNA is being developed as a separate native application project inside the same Git repository:

```text
WonderfulAppsRender/
|
+-- httpdocs/
+-- routes/
+-- services/
+-- middleware/
+-- server.js
+-- package.json
|
+-- TNNA/
    +-- public/
    +-- src/
    +-- capacitor.config.json
    +-- package.json
    +-- package-lock.json
```

The Android project was initially generated once, but that generated `android` directory was subsequently deleted so it could be regenerated cleanly after correcting the Capacitor package versions.

### TNNA Capacitor configuration

```json
{
  "appId": "com.wonderfulapps.townnotification",
  "appName": "Town Notification",
  "webDir": "public"
}
```

The TNNA `public` directory contains an `index.html` test page.

## 4. Capacitor Version Issue Already Resolved

Initially, Capacitor packages were mismatched:

```text
@capacitor/android  8.5.2
@capacitor/core     8.5.2
@capacitor/cli      6.2.2
```

That mismatch caused an Android project to be generated with an older Gradle setup.

The CLI was then upgraded so that all Capacitor packages now match:

```text
@capacitor/android  8.5.2
@capacitor/cli      8.5.2
@capacitor/core     8.5.2
```

This portion of the problem is considered resolved.

## 5. Android Studio / Gradle History

Android Studio 4.1 was found on the computer but was recognized as obsolete for this work.

A current Android Studio version was installed:

```text
Android Studio Quail 4
2026.1.4 Patch 1
```

The first generated Android project used Gradle 8.2.1 and produced:

```text
Unsupported class file major version 65
```

The Gradle cache was cleared as a diagnostic step, but the same error returned.

Further investigation showed that the root issue was the mixed Capacitor major versions described above.

The Android project was therefore deleted with the intention of regenerating it using the corrected Capacitor 8.5.2 toolchain.

At that point, the Node.js version requirement became the blocking issue.

## 6. Current Blocking Issue

The following command:

```powershell
npx cap add android
```

now produces:

```text
[fatal] The Capacitor CLI requires NodeJS >=22.0.0
Please install the latest LTS version.
```

Current runtime:

```text
Node.js v18.20.5
```

Required runtime for the installed Capacitor CLI:

```text
Node.js >=22.0.0
```

Thus the immediate technical requirement is to provide Node.js 22 or later for TNNA development.

## 7. Proposed Node Version Strategy

The proposed design is to retain access to both:

```text
Node 18.20.5  -> existing Wonderful Apps project
Node 22.x     -> TNNA / Capacitor 8 development
```

The contemplated management tool is:

```text
NVM for Windows 2.0.0
```

Installer downloaded:

```text
nvm-2.0.0-amd64-setup.exe
```

The installer has **not yet been run**.

The proposed post-install configuration would conceptually be:

```powershell
nvm install 18.20.5
nvm install 22
```

and then:

```powershell
nvm use 18.20.5
```

for WA work, or:

```powershell
nvm use 22
```

for TNNA work.

## 8. Main Engineering Concern

The existing Node.js 18.20.5 installation is a normal standalone Windows Node installation.

The concern is whether installing NVM for Windows will:

- remove the existing Node installation;
- alter PATH entries;
- replace the active `node.exe`;
- create or replace a symlink used for Node;
- conflict with the existing standalone Node installation;
- make the current WA project temporarily or permanently unable to run;
- require uninstalling the standalone Node installation first;
- interfere with global npm packages;
- change npm's global package location;
- change behavior in existing VS Code terminals or scripts.

The owner specifically wants to avoid a situation where the NVM installer silently takes control of the existing Node installation without a clear opportunity to approve or reject that change.

## 9. Desired End State

```text
Windows development computer
|
+-- Node.js 18.20.5
|      |
|      +-- existing Wonderful Apps development
|
+-- Node.js 22.x
       |
       +-- TNNA / Capacitor 8 development
```

with a reliable and reversible method to switch between them.

The solution should:

1. Preserve the existing WA source code and dependencies.
2. Avoid unnecessary changes to the current WA development runtime.
3. Allow TNNA to use Node 22 or later.
4. Avoid PATH and symlink conflicts.
5. Avoid duplicate or ambiguous Node installations.
6. Be simple enough to maintain over time.
7. Support use from VS Code PowerShell terminals.
8. Make it clear which Node version is active at any given time.

## 10. Questions for the Reviewing Design Engineer

### A. NVM architecture

Is **NVM for Windows 2.0.0** an appropriate solution for maintaining both:

```text
Node 18.20.5
Node 22.x
```

on this development PC?

If not, what alternative version-management approach would be preferable?

### B. Existing Node installation

Should the current standalone Node.js 18.20.5 installation be:

- left installed;
- uninstalled before installing NVM;
- migrated into NVM;
- or handled another way?

Please describe the safest exact sequence.

### C. PATH and symlink risk

What Windows PATH or symlink conflicts should be anticipated when introducing NVM after a standalone Node installation already exists?

What should be checked before and after installation?

Suggested diagnostics include:

```powershell
where.exe node
where.exe npm
node -v
npm -v
```

Are additional checks recommended?

### D. Existing WA project compatibility

Is there any technical reason the existing WA project must remain on Node 18.20.5?

Would it be preferable instead to test WA under Node 22 and, if compatible, standardize both WA and TNNA on Node 22?

If so, what regression testing should be performed before making Node 22 the default?

### E. Global npm packages

Will changing to NVM affect globally installed npm packages?

If yes:

- should a list of global packages be captured before migration;
- should any global packages be reinstalled per Node version;
- and what commands should be used to inventory them?

### F. npm dependencies

The existing WA project uses its own `package.json` and `package-lock.json`.

TNNA has its own:

```text
TNNA\package.json
TNNA\package-lock.json
```

Is there any concern about switching Node versions while maintaining two separate project-level dependency trees?

### G. Recommended Node 22 release

Should TNNA use:

- the latest Node 22 LTS patch;
- a specific Node 22 patch version;
- or a newer LTS version?

Please identify the preferred version and why.

### H. Rollback plan

If NVM installation or Node migration causes a problem, what is the recommended rollback procedure to restore:

```text
Node.js 18.20.5
npm
VS Code terminal behavior
existing WA development
```

### I. Alternative isolation approaches

Would any of the following be preferable to NVM for this situation?

- Volta
- fnm
- a portable Node installation
- Windows containers
- WSL
- separate Windows user environment
- separate development machine
- upgrading WA to Node 22 and using one version only

Please explain advantages and disadvantages for this specific project.

## 11. Files and Data Already Protected

Before changing the Node installation, the TNNA work is being developed on a separate Git branch:

```text
townNNA
```

The intent is to commit and push current project changes before modifying the Node environment.

`node_modules` is not intended to be stored in Git.

Project source and lock files are intended to be retained:

```text
package.json
package-lock.json
TNNA/package.json
TNNA/package-lock.json
```

## 12. Recommended Pre-Migration Inventory for Review

Before any Node/NVM change, the following information can be captured if the engineer considers it useful:

```powershell
node -v
npm -v
where.exe node
where.exe npm
npm config get prefix
npm root -g
npm list -g --depth=0
```

Potential additional environment information:

```powershell
$env:Path
```

and the Windows Installed Apps entry for Node.js.

No system changes should be made until the recommended migration sequence is confirmed.

## 13. Current Decision Point

Development is paused at this command:

```powershell
npx cap add android
```

because Capacitor 8.5.2 requires Node.js 22 or later.

The purpose of this review is **not** to redesign TNNA or WA. The immediate request is to determine the safest Windows Node.js version-management strategy so TNNA can proceed without disrupting the established Wonderful Apps development environment.

## 14. Requested Engineering Deliverable

Please provide:

1. The recommended Node version-management architecture.
2. Whether the existing standalone Node 18.20.5 should be uninstalled.
3. A precise step-by-step migration sequence.
4. Pre-migration checks.
5. Post-migration verification commands.
6. Rollback procedure.
7. Any concerns about using Node 18 for WA and Node 22 for TNNA in the same repository.
8. Whether standardizing both projects on Node 22 would be preferable after compatibility testing.
