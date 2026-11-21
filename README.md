# Wonderful Apps (WA)

**Project:** Wonderful Apps  
**Repository:** `sthink1/wapps`  
**Documentation entry point:** root `README.md`  
**Standards decision date:** November 12, 2026  
**Status:** Existing application under development; Stage 6 production-readiness acceptance and independent review remain incomplete.  
**Current owner-approved priority:** Risk-based production readiness, November 16, 2026 (40-hour planning ceiling).

## 0. MANDATORY — Read before any Wonderful Apps development or review

**Every programmer, AI coding assistant, design engineer and reviewer MUST consult the approved WA programming standards before proposing or implementing any change.** Opening a repository or project file does not, by itself, prove that an assistant has read the instructions. Explicitly confirm the documents and versions reviewed in each change proposal.

### Required reading order

1. **`standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md`** — Twelve daily Core Standards. The owner approved the Step 2 approach and content; verify that this particular file has been installed and designated effective before treating its filename as authoritative.
2. **`standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md`** — Detailed technical requirements, contracts, annexes, tests and exceptions. Verify installed name, latest approved version and effective date before use.
3. **`standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md`** — Owner-approved decisions D01–D14. Later approved clarifications, including full Family Tree administrator privileges and mandatory code comparisons, must be consulted alongside the register until formally incorporated.
4. **`CLAUDE.md` and `TechSummary.md`** — Project-specific architecture and established coding instructions. Record and resolve any conflicts with approved standards; do not silently rely on outdated administrator wording.
5. **Current authoritative project files and applicable `docs/` testing records** — Inspect the exact files, dependencies and baseline relevant to the requested task.

> **Primary rule — preserve existing functionality and appearance.** Do not change existing behavior, calculations, permissions, navigation, appearance, layout, or data handling except as specifically authorized by the project owner. Necessary changes outside the approved scope require separate approval.

### Current release objective and time-budget gate — owner approved November 16, 2026

**Production readiness takes priority over comprehensive standards remediation.** Continue the remaining Stage 6 R16–R20 acceptance work; evaluate and address only demonstrated or credibly material security, privacy, authorization, credential, data-integrity, or essential-function blockers needed for a safe production decision; obtain the mandatory independent design-engineering/security review; investigate and stabilize the existing production Render `wapps` service; and make an explicit, controlled merge/release decision.

- **Planning ceiling: 40 hours total** for the remaining prioritized production-readiness effort. Track effort against this ceiling; **stop and seek owner reassessment** if a critical blocker cannot be resolved within it. The ceiling is not evidence of completion, a guarantee of readiness, or permission to waive a necessary safeguard.
- **Do not start a wholesale 124-finding correction program.** The 63-page Codex examination is a source-level risk inventory, not 124 proven runtime defects or a blanket instruction to rewrite functional files. Classify findings by user impact and release risk; retain nonblocking gaps in the approved register for separately authorized later work, without declaring them compliant or closed.
- **Release blockers must be dispositioned, not ignored.** Material privacy exposure, unsafe authorization or credentials, possible destructive/duplicate writes, essential-workflow failures, or an unsafe production deployment must be verified and resolved, safely restricted, or otherwise dispositioned with evidence and explicit owner approval before release. Do not override independent-review objections just to meet the time budget.
- **Maintain approved standards and change controls.** Any file actually revised must meet all applicable approved requirements, use the full-file/diff/verification process below, and pass relevant targeted regression tests. Phased exceptions and deferred modernization remain subject to recorded owner decisions. No scope change or production action is authorized by this README update.
- **First outstanding testing step:** R16-75 real-browser T09 on a page actually using shared `WA.api`, followed by T10 preservation of unsaved edits and no unsafe automatic mutation replay. Preserve R16-75 T12's 90/90 bounded offline PASS, hosted T06's 3/3 bounded probes, selected T11 evidence, and previously accepted R10/R14/R15 results. Do not repeat accepted tests without a specific regression reason.


### Mandatory change package and approval gate

For **every revised existing source file**, before submitting for approval:

- Identify the authoritative original file and its exact version/hash, and the authorization for the requested change.
- Deliver the **complete** revised file, a complete **original-versus-final unified `.diff`**, and a separate **`.md` change-verification report** accounting for every substantive and formatting difference, even for a one-line change.
- Record and verify the **SHA-256 checksum of the exact final file delivered**. Reconcile any changes to the authoritative original occurring after the baseline was captured.
- Analyze callers, dependencies, shared code, data behavior and appearance; document relevant tests, results, evidence, unresolved risks and rollback/install instructions.
- Obtain explicit owner approval **before installation or execution of changes**. No report or draft is self-authorizing.

**All new source files must be pretty formatted, consistently indented and human-readable.** Revised files must preserve or improve readable formatting without unapproved behavioral changes. Existing whole-file HTML formatting requirements remain applicable; disclose and separately review formatting-only differences when combined with functional changes. Do not submit minified source as the authoritative editable version.

### Authority and read-only operating restrictions

- The authoritative WA source is **Google Drive `My Drive/wonderfulApp`**. The folder `standard/` contains standards, decisions and historical audits. Filenames ending in `DRAFT` or `PROPOSAL` must not be mistaken for an effective installation merely because present.
- **ChatGPT and design engineers use Google Drive, GitHub and local WA project files strictly read-only.** Do not edit, create, overwrite, move, rename, delete, commit, push, merge or deploy project contents. Proposals must be separate downloadable files for **manual installation by the owner**.
- No changes to production, staging, Render, databases, credentials, `main`, or native devices without separate, explicit authorization.
- For source conflicts or uncertain policy applicability, identify the conflict and seek an owner decision. Do not resolve a conflict by assuming that newer timestamps imply authority.
- The final independent **Stage 6 implementation review** remains required before any merge or production decision. Standards approval, file preparation, and bounded test passes do **not** establish implementation conformance.

### AI coding assistant discovery

This README is the **human entrypoint** and must be referenced from tool-specific project instruction files when supported. `CLAUDE.md`, GitHub Copilot instruction files (for example `.github/copilot-instructions.md`), and an `AGENTS.md` file may help compatible tools discover this README and the standards. **Do not assume any tool automatically reads all of them.** Each agent must verify its own instruction-loading behavior and explicitly acknowledge the standards reviewed before work. Creating or revising any AI-instruction file is a **separate approved change**, with an original-to-final comparison if that file already exists.

## 1. Overview

Wonderful Apps is a collection of browser-based applications built on a shared Node.js/Express backend, a MySQL-compatible database, and common authentication and subscription/entitlement controls. The browser interface is written in HTML, CSS, and JavaScript and includes Progressive Web App (PWA) resources.

Principal functional areas represented in the project include:

- Weight and activity tracking
- Interest earned records and calculations
- ETF research, comparisons, and investment activity tracking
- Budget management
- Family Tree, family networking, privacy, and related person/relationship workflows
- Property information, geolocation, amortization, and utility pages
- Notifications, consent preferences, subscriptions, usage tracking, and contact/email features
- Town Notice and its related **Town Notice Native App (TNNA)** Android project

A file's presence does not necessarily mean its functionality is approved for production or that every planned workflow is complete. Consult the current source and the relevant module documentation when determining release status.

## 2. Technology and architecture

| Layer | Implementation |
| --- | --- |
| Browser/PWA | HTML, CSS, vanilla JavaScript, service worker, web manifest |
| Application server | Node.js, Express |
| Authentication | JWT-based access, browser session/refresh services, bcrypt, authorization middleware |
| Persistence | MySQL-compatible database through `mysql2` |
| Email | Resend integration |
| Images/files | S3-compatible object storage integration through `r2Storage.js` where applicable |
| Logging | Morgan and Winston |
| Android | TNNA, a separate Capacitor/Android subproject |

`server.js` mounts application routes and static content. `dbConnection.js` owns the database connection pool. Server-side access controls are implemented in the route and middleware layers; client-side button visibility alone is not an authorization control.

This README is an orientation and standards-discovery document, not a substitute for the complete architecture description in [`TechSummary.md`](TechSummary.md) or project-specific guidance in [`CLAUDE.md`](CLAUDE.md).

## 3. Project directory guide

```text
wonderfulApp/
├── README.md                  # Required project entry point
├── standard/                  # Approved standards, decisions, drafts and review history
├── server.js                  # Express application and route mounting
├── dbConnection.js            # MySQL pool and connection checks
├── routes/                    # Application API endpoints
├── services/                  # Sessions, environment validation, business services
├── middleware/                # Authentication, access and request middleware
├── httpdocs/                  # Browser pages, JS/CSS, PWA assets
├── tests/                     # Automated and controlled test scripts
├── docs/                      # Requirements, plans, acceptance and module documentation
├── sql/                       # SQL resources
├── TNNA/                      # Capacitor/Android project (managed separately)
├── keepMeLoggedIn/            # Historical authentication design materials
├── KeppMeLoggedIn_finalTesting/ # Historical Stage 6 testing materials
├── logs/                      # Runtime log output; treat as sensitive
├── package.json
├── package-lock.json
├── .node-version
├── .gitignore
├── TechSummary.md
└── CLAUDE.md
```

Other project folders and historical artifacts may be present. The proposed `archive/` directory is for superseded documentation, test records, and snapshots, **not** for live dependencies or active tests. Do not assume archival is approved merely because a file is old.

**Important:** [`docs/README.md`](docs/README.md) is a *Family Tree-specific* document, not the root Wonderful Apps README; do not replace it with this file.

## 4. Branches and environments

### Production

- Existing Render service: `wapps`.
- The `main` branch and production database are protected from unfinished Stage 6 changes.
- The current production database and connection settings must be verified from the production environment when planning a release; do **not** infer them from a staging file or from old SQL dumps.

### Stage 6 development and staging

- Development branch: `reviseLogIn`.
- Isolated Render staging service: `wapps-stage6-test`.
- Staging URL: `https://wapps-stage6-test.onrender.com`.
- Verified staging database identity as documented on November 3, 2026: HelioHost Morty2, database/user `wapps_test`.
- Last verified hosted commit in the November 3 acceptance records: `f023cc3` (historical checkpoint). On November 16 the owner reported a clean local `reviseLogIn` working tree, with `HEAD` and `origin/reviseLogIn` both `67626270f8c22e363ded83feea49d3855fd447b1` (`6762627`, `codex review html files`); a Render screenshot showed this commit **Live** on `wapps-stage6-test`. This is a dated Git/deployment checkpoint, **not** proof of exact Google Drive file equality, application acceptance, or production deployment. Recheck live revision if necessary before further hosted assertions.

The Stage 6 environment guard deliberately restricts permitted test configurations. Do not copy staging environment guards or database identities to production, disable safety checks to make a test pass, or assume that `NODE_ENV=production` implies a production database.

### TNNA

`TNNA/` contains the Android native-app project and has its own build, signing, and testing concerns. TNNA files are **excluded from the current project-file cleanup**. Do not modify Android signing assets or installed applications as part of the Stage 6 documentation cleanup.

## 5. Current Stage 6 status — not released

Stage 6 introduces and tests browser session persistence, password change/reset, refresh-token rotation and revocation, and related security protections. Later November 2026 evidence records formal **bounded PASS** for R10, R14, and R15; R16-75 T12 **90/90 bounded offline PASS** on November 15; hosted R16 T06 **3/3** bounded malformed-parser probes; and selected T11 logging observations. **R16 real-browser T09 and T10 remain open**; R17–R20 and the final independent review are not complete. Do not promote narrower results into whole-project, native-device, or release certification. The earlier approximately 70% completion estimate is not a measured formal R01–R20 completion fraction.

Outstanding acceptance areas include cookie/Origin/CSRF and error caching, authorization failure responses, proxy trust and rate-limit fairness, additional browser coverage, native Android verification, operational recovery and rollback, and independent design/security review. These are tracked in the authoritative documents below.

**Additional current design decisions (November 12, 2026):** Owner-approved D01–D14 standards policies govern proposed future architecture; D05 authorizes preparing an R16-75 correction package **only**, not installation. D08 authorizes a browser token-storage modernization objective, not a selected replacement mechanism. D11 defers additional public geocode and email hardening. Existing bounded R10/R14/R15/R16 results remain historical evidence; implementation conformance and deployment approval are separate.

**Codex examination checkpoint (November 15–16, 2026):** 63 HTML pages examined (five initial pages plus seven batches covering 58 pages), 516 source-level functional candidates, 124 confirmed source-level candidate findings, and separately recorded formatting/procedure exceptions. The owner approved a Master Findings Register and R16–R20 Testing Reconciliation Addendum for risk-based release triage. These artifacts are not executed acceptance tests, do not prove 124 independent defects, and do not require remediation of all findings before release. Verify their manual installation in `docs/` before citing them as installed project documents.

**Release rule:** Complete risk-based acceptance, resolve or explicitly disposition material release blockers, verify production Render health and a safe rollback plan, obtain the mandatory independent design-engineer/security review of the completed implementation, and then make a separate explicit production go/no-go decision. The `reviseLogIn` → `main` merge and any production action require distinct owner authorization. No README update constitutes permission to merge, migrate the production database, change DNS, or deploy.

## 6. Authoritative Stage 6 documents

| File | Purpose |
| --- | --- |
| [`docs/Stage6_OpenItems.md`](docs/Stage6_OpenItems.md) | Current S6 issue register, evidence and unresolved safeguards |
| [`docs/Stage6_Render_TestPlan.md`](docs/Stage6_Render_TestPlan.md) | Formal R01–R20 acceptance matrix and hosted test observations |
| [`docs/WA_Master_Findings_Register_2026-11-16.xlsx`](docs/WA_Master_Findings_Register_2026-11-16.xlsx) | Owner-approved Codex findings and priority reconciliation; verify installed presence and version |
| [`docs/WA_R16-R20_Testing_Reconciliation_Addendum_2026-11-16.md`](docs/WA_R16-R20_Testing_Reconciliation_Addendum_2026-11-16.md) | Owner-approved risk-based R16–R20 testing addendum; verify installed presence and version |
| [`docs/WA_Master_Findings_Register_Review_Notes_2026-11-16.md`](docs/WA_Master_Findings_Register_Review_Notes_2026-11-16.md) | Interpretation limits and proposed priorities for the Master Register; verify installed presence |
| [`docs/Stage6_Production_Implementation_Plan.md`](docs/Stage6_Production_Implementation_Plan.md) | Release gates, migration considerations and rollback planning; plan only |
| [`docs/Stage6_Document_Cleanup_Review_2026-11-03.md`](docs/Stage6_Document_Cleanup_Review_2026-11-03.md) | Documentation consolidation and cleanup history |
| [`TechSummary.md`](TechSummary.md) | Technical architecture and module details; review dated facts against current source |
| [`CLAUDE.md`](CLAUDE.md) | Project development guidance; verify against current implementation |
| [`standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md`](standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md) | Owner-approved D01–D14 policy decisions; verify later clarifications |

Historical H05–H50, Group 5D–5G, and engineering-review records must be preserved for auditability even if a master document also contains their text. A dated README or test script is not automatically a current installation instruction.

## 7. Local development — cautious starting procedure

This project uses npm. Verify the active Node.js version against [`.node-version`](.node-version) and installed dependencies before running commands. The following is descriptive historical guidance, **not authority for an assistant to run commands or change files**:

```powershell
# From the actual local Wonderful Apps repository root, if separately authorized
node --version
npm --version
git branch --show-current
git status --short
npm ci
```

`npm ci` installs dependencies according to the lockfile. It does not configure a database or make an environment safe to run. Before starting any server, confirm that the local test configuration and `services/stage6Environment.js` permit **only** the intended test database and origin.

`package.json` defines:

```powershell
npm run dev   # nodemon server.js
npm start     # node server.js
```

Do not use these start commands casually during Stage 6 security testing. A correctly configured test-only environment and verified database identity are prerequisites. The package's default `npm test` command is a placeholder, **not** the Stage 6 acceptance suite. Consult `docs/Stage6_Render_TestPlan.md` for controlled test selection, prerequisites, evidence requirements and safety restrictions. Never run a `--run-live`, database-mutating, installer, or concurrency script merely because it appears under `tests/`.

## 8. Configuration, credentials and backups

- Keep passwords, JWT secrets, API keys, credentials and signing material out of Git, shared screenshots and documentation.
- Use environment variables appropriate to the selected environment. Do not copy a production `.env` into staging or vice versa.
- Treat logs and SQL dumps as potentially sensitive; exclude them from public distribution and follow an approved retention/backup procedure.
- Use fresh, verified backups and migration rehearsals before any production data change. A snapshot in the project directory is not an independent offsite backup.
- Check `git status`, `git diff` and the active branch before applying changes. Preserve unrelated changes and avoid altering production or `main` during Stage 6.

## 9. Documentation and archive policy

The project root `README.md` is the **current general project entry point**. Keep ongoing plans and acceptance requirements in `docs/`. Store superseded installation notes and historical evidence in a clearly separated `archive/` tree only after verifying references, active dependencies, and retention needs. Keep the original filename or a manifest mapping to its previous path.

For the November 2026 cleanup, old installation-package READMEs should be archived rather than used as current setup instructions. Preserve applicable review and test evidence until the independent Stage 6 review is complete. TNNA remains out of scope.

## 10. Verification before using this README for an actual release

This README preserves the original project's orientation, November 12 standards decisions, and November 16 owner-approved 40-hour production-readiness priority. It **does not independently certify** today's local/remote Git state, Google Drive file equality, a currently Live Render deployment, production service health, runtime credentials, the current database schema, or post-November 16 test outcomes. Confirm those facts from authoritative current evidence before development, staging operations or production decisions. **At the 40-hour limit or on discovery of an unresolved critical blocker, stop and obtain an owner decision rather than silently relaxing acceptance or safety requirements.**

---

**Change status (November 16, 2026):** Complete replacement README prepared for owner review and manual installation under the previously approved documentation-update scope. The existing authoritative Drive/local/Git files remain unchanged by this package. Referenced standards and reconciliation-file names require verification of actual installed versions.

**Future production database transition — planning decision November 19, 2026**

The owner approved constructing a new production database using the final tested `wapps_test` schema, then populating it with appropriately analyzed and transformed data from the existing production database.

See `docs/WA_Production_Database_Transition_Plan.md` for the agreed approach, safeguards, and future decision points.

This is a planning approval only. No database migration, production cutover, deployment, or branch operation is authorized by this decision.

## Future standards refactoring — planning decision November 19, 2026

After completion of Stage 6 release requirements and the separately authorized `reviseLogIn` → `main` merge, the owner plans to create a new development branch named `refactor`. Its long-term objective is implementation of the approved Wonderful Apps programming standards, beginning with **Phase 1: JavaScript shared-function standardization** based on the findings in `download/WA_Shared_Function_Review_Remaining_2026-11-16/`. Existing functionality, design, privacy, security and business behavior remain protected under CS-01; unrelated HTML/CSS and later standards work require separately approved scope.

See `docs/WA_Refractor.md` for the phased approach, controls and acceptance evidence. All development follows `standard/WA_File_Development_and_Delivery_Process.md` (A → B → C → D). Codex in VS Code may inspect local WA source **read-only** and generate proposed replacements and verification packages in a separate directory outside the project; the owner manually installs, tests, and authorizes commits. **This planning decision does not authorize branch creation, source edits, database changes, hosted testing, merges or deployments.** The current production-readiness 40-hour planning ceiling is separate from any future refactoring budget.

## Deferred One Tree merge redesign — planning decision November 21, 2026

**Status: deferred; not implemented or security-cleared.** The owner considers One Tree essential to Family Tree functionality but has directed that further One Tree adjustments **not interrupt unrelated Stage 6 R16–R20 testing**. Resume comprehensive One Tree design and remediation in a new branch, **`oneTreeM`**, intended to be created **after** a separately approved `reviseLogIn` → `main` merge and **before** broader standards refactoring. Neither that merge nor branch creation is authorized by this note; verify the actual branch state when work resumes.

**Latest owner-directed functional policy (future design, not current behavior):**

- An authorized ordinary user may change relationships among Persons in their own Family Tree without individual privacy codes; the server must still enforce exact Tree/Person authorization.
- A legitimate cross-tree One Tree merge should be simple and **should not require** membership in both Trees, separate approval by the other Tree's owner, or individual private-Person codes during the merge.
- Within a **legitimate** One Tree review, the owner selected **full Person information** even for private Persons. This does **not** authorize arbitrary access to other Trees, general editing rights, or disclosures outside the review. The eligibility and disclosure boundaries are **unresolved security-design questions**.
- Private status and applicable access protections must survive merging. Exact rules for combined records, permissions, and conflicting privacy settings remain to be defined.
- Future One Tree review must reconcile differences in Person fields **and** parents, partners, children, siblings, and other relationships. Multiple valid partners or additional relatives must not be treated as automatic errors. Preview consequences, protect against incorrect identity consolidation and invalid relationship structures, and support controlled rollback/undo.
- Consider whether **multiple credible Person matches** should be required before a Tree merge, while accommodating legitimate one-match cases and relationships between distinct Persons. **No threshold has been approved.**
- Explicitly review whether, how, and for how long someone may **enter, view, or modify another Tree** before, during, and after a merge; separate limited review access from ordinary membership and mutation permissions.

**Unresolved security findings — not waived:** Codex's independent M03 review on November 20, 2026 was **FAIL**: **M03-C01 Critical** (arbitrary target Tree review/merge without independent eligibility proof), **M03-H02 High** (actual `/relationships` and `/related-person` HTTP paths can bypass exact Person membership validation), **M03-H03 High** (unreviewed extra `same` decisions), and **M03-M04 Medium** (privacy-state concurrency window). The H02 issue affects ordinary relationship routes as well as One Tree. These findings remain open, subject to fresh verification and explicit, evidence-backed **release-blocker disposition** (correction, effective server-side restriction, or approved risk decision) before any affected functionality is promoted. **Deferring implementation is not a security PASS and does not itself authorize a commit, merge, or deployment.** A UI-only restriction is not adequate to address server-side authorization defects.

**Current source versus future policy:** On November 21, read-only inspection of the authoritative Google Drive `routes/familyTree.js` confirmed that the existing cross-tree merge path **still enforces privacy authorization for private Persons**. The owner's later decision to remove merge privacy-code prompts is **not installed**. Do not describe planned rules as current implementation.

**Superseded package:** `WA_M03_Codex_Four_Finding_Consolidated_Candidate_2026-11-20.zip` is **HOLD — DO NOT INSTALL**; it retains the former privacy-code design and does not fully resolve C01. Preserve previous bounded test evidence, but do not equate passing helper-level tests with complete HTTP or committed merge/undo acceptance.

**Authoritative design and evidence references:**

- [`docs/WA_OneTree_Merge_Deferred_Design_and_Security_Handoff_2026-11-21.md`](docs/WA_OneTree_Merge_Deferred_Design_and_Security_Handoff_2026-11-21.md) — full decisions, open questions, examples, sequencing, and future acceptance outline.
- [`review/WA_M03_Codex_Independent_Security_Review_2026-11-20.md`](review/WA_M03_Codex_Independent_Security_Review_2026-11-20.md) — independent FAIL findings; verify installed location and version before relying on it.
- Root `README.md` §0 and §5 — risk-based readiness, 40-hour planning ceiling, and mandatory disposition of material release blockers.
- `standard/WA_File_Development_and_Delivery_Process.md` — A → B → C → D change process and independent verification requirements.

**Next action now:** Continue the first genuinely outstanding R16–R20 acceptance item, preserving prior passes. Any safety disposition needed for `reviseLogIn` → `main` must be addressed **separately from** the deferred One Tree feature redesign. The future `oneTreeM` work begins with Step A: review the authoritative source, data model, permissions, matching criteria, conflict-resolution and undo requirements, and the Codex findings; decide requirements before authorizing any build.

**No source change, test execution, database modification, branch creation, merge, or deployment is authorized by this README addendum.**
