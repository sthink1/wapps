# WA / TNNA Node Runtime Issue — Consolidated Design Review

**Date:** September 30, 2026  
**Scope:** Consolidated response to the Node.js / NVM issue described in `Chat_TNNA_Node_NVM_Technical_Review.md` and the design-engineer responses from Claude, Perplexity, and Grok.

## 1. Executive conclusion

The reviewers agree on the central facts:

- Wonderful Apps (WA) is currently developed locally with Node.js 18.20.5.
- TNNA uses Capacitor 8.5.2 and cannot proceed with the current Node 18 runtime.
- Capacitor 8 requires Node.js 22 or later.
- The existing WA source code and TNNA source code are not endangered by changing Node itself, provided the repository and lock files are committed and backed up.
- The important Windows risk is not the source code; it is PATH/executable resolution, the existing standalone Node installation, global npm packages, and stale terminals.
- If NVM for Windows is adopted, the existing standalone Node installation should not remain as a competing installation. It should first be inventoried, then removed in a controlled migration.
- WA should not remain on Node 18 indefinitely. Node 18 is end-of-life and WA should be tested on a currently supported LTS release.
- WA and TNNA can safely have separate `package.json`, `package-lock.json`, and `node_modules` trees in the same repository.

The primary disagreement is **how to get from the current state to the final state**.

## 2. Comparison of the three responses

### Claude response

Claude recommends the most conservative first step:

1. Leave the existing standalone Node 18.20.5 installation untouched.
2. Use a portable Node 24 ZIP only inside a dedicated TNNA terminal.
3. Run TNNA with Node 24 without changing the Windows PATH or installed Node.
4. Test WA on Node 24 separately.
5. If WA passes, standardize WA and TNNA on one Node 24 installation.
6. Use NVM only if WA proves that it truly must remain on Node 18.

This approach minimizes immediate risk to the known-working WA environment.

Claude also identifies two important repository/deployment concerns:

- Do not casually add a root-level `.nvmrc` or `.node-version`, because deployment services such as Render may use such files when selecting a Node runtime.
- Verify the Node version actually used by Render; local Node 18 does not prove that production is running Node 18.

### Perplexity response

Perplexity recommends moving directly to NVM for Windows:

1. Inventory the current Node/npm/PATH state.
2. Uninstall standalone Node 18.20.5.
3. Install NVM for Windows.
4. Install Node 18.20.5 under NVM as the WA fallback.
5. Install Node 24 LTS under NVM for TNNA.
6. Test WA under Node 24.
7. If WA passes, make Node 24 the shared target runtime.

Perplexity's architectural position is that one version manager controlling the active Windows Node path is cleaner than maintaining a standalone Node installation plus another mechanism.

It also expands the issue beyond Node: TNNA should be treated as a native client of WA's server-side rules, not as an independent duplicate of the web application.

### Grok response

Grok also recommends NVM as the immediate solution, but proposes:

- Node 18.20.5 for WA.
- Node 22.23.x for TNNA.
- Later test WA under Node 22 and standardize if possible.

This is technically workable because Capacitor 8 requires Node 22 or later. However, Node 24 is now an LTS release and provides a longer support runway. The other two responses therefore favor Node 24 as the better new baseline.

## 3. Independent verification of the key version question

The current Capacitor 8 documentation states that Capacitor 8 requires **Node.js 22 or greater** and recommends the latest LTS release.

As of September 30, 2026, Node 24.21.0 is an LTS release, while Node 22 remains LTS but is the older line. Node 18 is end-of-life.

Therefore, for new TNNA work, **Node 24 LTS is the better target than starting a new long-term dependency on Node 22** unless a specific TNNA plugin or dependency is found to require Node 22.

## 4. Consolidated recommendation

The safest overall course is a two-stage approach.

### Stage 1 — Do not disturb the existing WA Node installation yet

Before installing NVM or uninstalling anything:

1. Commit and push all current WA/TNNA work.
2. Confirm `node_modules` and native build outputs are excluded appropriately from Git.
3. Capture:
   - `node -v`
   - `npm -v`
   - `where.exe node`
   - `where.exe npm`
   - `where.exe npx`
   - `npm config get prefix`
   - `npm root -g`
   - `npm list -g --depth=0`
   - User PATH and Machine PATH
4. Save the Node 18.20.5 installer or otherwise make sure it can be restored.
5. Record the current Render Node version separately from the local PC version.

Then use an **isolated Node 24 environment** to prove that TNNA can proceed and to test WA under Node 24 without first changing the known-working Windows Node installation.

A portable Node 24 ZIP in a dedicated TNNA terminal is a reasonable temporary engineering tool for this stage because it can be removed simply by closing the terminal and deleting the portable folder.

### Stage 2 — Decide the permanent runtime architecture after testing WA on Node 24

There are two possible outcomes.

#### Preferred outcome: WA works on Node 24

If WA passes regression testing on Node 24:

- Standardize both WA and TNNA on Node 24 LTS.
- Use one supported Node line.
- Pin/document the exact version deliberately.
- Align the Render runtime with the tested Node major.
- Avoid maintaining Node 18 as a permanent development dependency.

This is the simplest long-term architecture.

#### Fallback outcome: WA has a genuine Node 24 incompatibility

If WA cannot reasonably be moved immediately:

- Adopt NVM for Windows.
- First uninstall the existing standalone Node installation.
- Install Node 18.20.5 under NVM for WA.
- Install Node 24 LTS under NVM for TNNA.
- Keep Node 18 only as a temporary compatibility runtime while the WA incompatibility is corrected.

## 5. Why I do not recommend installing NVM on top of the current standalone Node installation

This is the strongest area of agreement among the responses.

A pre-existing standalone Node installation can create:

- duplicate `node.exe` locations;
- PATH precedence problems;
- an old Node executable being selected after `nvm use`;
- conflicts with the directory NVM wants to control;
- confusing npm and npx resolution;
- stale VS Code terminals that retain the previous environment.

Therefore, **if and when NVM is installed, treat it as a controlled replacement of the standalone Node installation, not as an additional independent Node installation.**

The pre-migration inventory is what makes this reversible.

## 6. Recommended WA Node 24 regression gate

Before adopting Node 24 for WA, test at least:

- server startup;
- database connection and representative reads/writes;
- registration;
- email verification;
- login and JWT authentication;
- subscription/access checks;
- promo redemption/admin entitlement paths;
- notification preferences and unsubscribe flows;
- uploads, including Family Tree/R2 paths if applicable;
- bcrypt login/hash behavior;
- Sharp/image handling if used;
- Family Tree read/write;
- Family Tree merge and undo;
- networking verification/search;
- external ETF/API calls;
- static files/PWA behavior;
- Render preview or equivalent deployment test.

Native packages should be installed cleanly under the Node version being tested. Prefer `npm ci` from the existing lockfile rather than allowing a test to rewrite dependencies casually.

## 7. TNNA toolchain checks after Node is resolved

After Node 24 is available:

1. Confirm all three Capacitor packages remain on the same version line.
2. Run `npx cap --version`.
3. Confirm the current JDK/Android Studio environment.
4. Run `npx cap add android` only if the Android project is currently absent.
5. After the first clean Android project is generated, normally use `npx cap sync android` rather than repeatedly deleting and re-adding Android.
6. Record the working Node, npm, Capacitor, Android Studio, JDK, Gradle, AGP, compile SDK, and target SDK versions in TNNA documentation.

## 8. Rollback principle

The rollback strategy should be established before system changes:

- If using only portable Node 24, rollback is simply removing the portable environment; standalone Node 18 remains untouched.
- If later adopting NVM, preserve the pre-migration inventory and Node 18 installer.
- If NVM fails, remove NVM and its PATH/environment entries, reinstall standalone Node 18.20.5, reopen VS Code, and verify `where.exe node`, `node -v`, and `npm -v`.
- Project source should not need restoration because source and lock files are protected by Git.

## 9. Final decision

**Recommended immediate path:**

1. Preserve the existing Node 18 environment.
2. Use an isolated Node 24 LTS environment to unblock TNNA and test WA.
3. If WA passes, move both projects to Node 24 and avoid dual runtimes.
4. If WA does not pass, then perform a controlled NVM migration and manage Node 18 + Node 24 under NVM.

This combines the strongest part of Claude's response—the lowest-risk first step—with the strongest part of the Perplexity/Grok responses—the clean NVM architecture if two runtimes are genuinely required.

The permanent goal should be **one supported Node runtime for both WA and TNNA**, not an indefinite Node 18/24 split.

## 10. Source documents reviewed

- `Chat_TNNA_Node_NVM_Technical_Review.md`
- `issue_note.txt`
- `C_TNNA_Node_NVM_Design_Engineer_Response.md`
- `P_TNNA_Node_NVM_Design_Engineer_Response.md`
- `G_WA_TNNA_Additional_Design_Issues.md`
- Related WA/TNNA possible-issues documents reviewed separately in `possible.md`.
