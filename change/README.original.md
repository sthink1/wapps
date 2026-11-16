# Wonderful Apps (WA)

**Project:** Wonderful Apps  
**Repository:** `sthink1/wapps`  
**Documentation entry point:** root `README.md`  
**Standards decision date:** November 12, 2026  
**Status:** Existing application under development; Stage 6 security acceptance and implementation remain incomplete.

## 0. MANDATORY — Read before any Wonderful Apps development or review

**Every programmer, AI coding assistant, design engineer and reviewer MUST consult the approved WA programming standards before proposing or implementing any change.** Opening a repository or project file does not, by itself, prove that an assistant has read the instructions. Explicitly confirm the documents and versions reviewed in each change proposal.

### Required reading order

1. **`standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md`** — Twelve daily Core Standards. The owner approved the Step 2 approach and content; verify that this particular file has been installed and designated effective before treating its filename as authoritative.
2. **`standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md`** — Detailed technical requirements, contracts, annexes, tests and exceptions. Verify installed name, latest approved version and effective date before use.
3. **`standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md`** — Owner-approved decisions D01–D14. Later approved clarifications, including full Family Tree administrator privileges and mandatory code comparisons, must be consulted alongside the register until formally incorporated.
4. **`CLAUDE.md` and `TechSummary.md`** — Project-specific architecture and established coding instructions. Record and resolve any conflicts with approved standards; do not silently rely on outdated administrator wording.
5. **Current authoritative project files and applicable `docs/` testing records** — Inspect the exact files, dependencies and baseline relevant to the requested task.

> **Primary rule — preserve existing functionality and appearance.** Do not change existing behavior, calculations, permissions, navigation, appearance, layout, or data handling except as specifically authorized by the project owner. Necessary changes outside the approved scope require separate approval.

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
- Last verified hosted commit in the November 3 acceptance records: `f023cc3`. This is a historical observation, **not** a claim that the service still runs that commit today. Later hosted commits and test observations must be reconciled from the latest evidence.

The Stage 6 environment guard deliberately restricts permitted test configurations. Do not copy staging environment guards or database identities to production, disable safety checks to make a test pass, or assume that `NODE_ENV=production` implies a production database.

### TNNA

`TNNA/` contains the Android native-app project and has its own build, signing, and testing concerns. TNNA files are **excluded from the current project-file cleanup**. Do not modify Android signing assets or installed applications as part of the Stage 6 documentation cleanup.

## 5. Current Stage 6 status — not released

Stage 6 introduces and tests browser session persistence, password change/reset, refresh-token rotation and revocation, and related security protections. The November 3 consolidated plan records successful **bounded** tests but not complete acceptance. The earlier approximately 70% completion estimate is an engineering planning estimate, not a percentage of formally passed R01–R20 tests.

Outstanding acceptance areas include cookie/Origin/CSRF and error caching, authorization failure responses, proxy trust and rate-limit fairness, additional browser coverage, native Android verification, operational recovery and rollback, and independent design/security review. These are tracked in the authoritative documents below.

**Additional current design decisions (November 12, 2026):** Owner-approved D01–D14 standards policies govern proposed future architecture; D05 authorizes preparing an R16-75 correction package **only**, not installation. D08 authorizes a browser token-storage modernization objective, not a selected replacement mechanism. D11 defers additional public geocode and email hardening. Existing bounded R10/R14/R15/R16 results remain historical evidence; implementation conformance and deployment approval are separate.

**Release rule:** Finish acceptance, reconcile remaining findings, obtain an independent design-engineer/security review of the completed implementation, then make a separate, explicit production go/no-go decision. No README update constitutes permission to merge into `main`, migrate the production database, change DNS, or deploy.

## 6. Authoritative Stage 6 documents

| File | Purpose |
| --- | --- |
| [`docs/Stage6_OpenItems.md`](docs/Stage6_OpenItems.md) | Current S6 issue register, evidence and unresolved safeguards |
| [`docs/Stage6_Render_TestPlan.md`](docs/Stage6_Render_TestPlan.md) | Formal R01–R20 acceptance matrix and hosted test observations |
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

This README preserves the original project's orientation and November 3 Stage 6 context, augmented with the November 12 standards decisions. It **does not independently certify** the current local Git working tree, the live Render deployment revision, runtime credentials, the latest database schema, or the outcome of tests performed after November 3. Confirm those facts from appropriate current sources before development, staging operations or production decisions.

---

**Change status:** This file is a separately prepared proposed replacement for owner review/manual installation. Its creation does not alter the authoritative Drive README or prove that referenced draft standards filenames have been installed under those exact names.
