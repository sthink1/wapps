# Wonderful Apps (WA)

**Project:** Wonderful Apps
**Repository:** `sthink1/wapps`
**Project documentation baseline:** November 4, 2026
**Status:** Existing web application with ongoing feature development and a separate, unfinished Stage 6 authentication/security acceptance program.

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

This README is an orientation document, not a substitute for the complete architecture description in [`TechSummary.md`](TechSummary.md) or project-specific guidance in [`CLAUDE.md`](CLAUDE.md).

## 3. Project directory guide

```text
wonderfulApp/
├── README.md                  # Project entry point (this file)
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
├── KeppMeLoggedIn_finalTesting/# Historical Stage 6 testing materials
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
- Last verified hosted commit in the November 3 acceptance records: `f023cc3`. This is a historical observation, **not** a claim that the service still runs that commit today.

The Stage 6 environment guard deliberately restricts permitted test configurations. Do not copy staging environment guards or database identities to production, disable safety checks to make a test pass, or assume that `NODE_ENV=production` implies a production database.

### TNNA

`TNNA/` contains the Android native-app project and has its own build, signing, and testing concerns. TNNA files are **excluded from the current project-file cleanup**. Do not modify Android signing assets or installed applications as part of the Stage 6 documentation cleanup.

## 5. Current Stage 6 status — not released

Stage 6 introduces and tests browser session persistence, password change/reset, refresh-token rotation and revocation, and related security protections. The November 3 consolidated plan records successful **bounded** tests but not complete acceptance. The earlier approximately 70% completion estimate is an engineering planning estimate, not a percentage of formally passed R01–R20 tests.

Outstanding acceptance areas include cookie/Origin/CSRF and error caching, authorization failure responses, proxy trust and rate-limit fairness, additional browser coverage, native Android verification, operational recovery and rollback, and independent design/security review. These are tracked in the authoritative documents below.

**Release rule:** Finish acceptance, reconcile remaining findings, obtain an independent design-engineer/security review, then make a separate, explicit production go/no-go decision. No README update constitutes permission to merge into `main`, migrate the production database, change DNS, or deploy.

## 6. Authoritative Stage 6 documents

| File | Purpose |
| --- | --- |
| [`docs/Stage6_OpenItems.md`](docs/Stage6_OpenItems.md) | Current S6 issue register, evidence and unresolved safeguards |
| [`docs/Stage6_Render_TestPlan.md`](docs/Stage6_Render_TestPlan.md) | Formal R01–R20 acceptance matrix and hosted test observations |
| [`docs/Stage6_Production_Implementation_Plan.md`](docs/Stage6_Production_Implementation_Plan.md) | Release gates, migration considerations and rollback planning; plan only |
| [`docs/Stage6_Document_Cleanup_Review_2026-11-03.md`](docs/Stage6_Document_Cleanup_Review_2026-11-03.md) | Documentation consolidation and cleanup history |
| [`TechSummary.md`](TechSummary.md) | Technical architecture and module details; review dated facts against current source |
| [`CLAUDE.md`](CLAUDE.md) | Project development guidance; verify against current implementation |

Historical H05–H50, Group 5D–5G, and engineering-review records must be preserved for auditability even if a master document also contains their text. A dated README or test script is not automatically a current installation instruction.

## 7. Local development — cautious starting procedure

This project uses npm. Verify the active Node.js version against [`.node-version`](.node-version) and installed dependencies before running commands.

```powershell
# From the actual local Wonderful Apps repository root
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

This README reflects the reviewed Drive project snapshot and November 3 Stage 6 documents. It **does not independently certify** the current local Git working tree, the live Render deployment revision, runtime credentials, the latest database schema, or the outcome of tests performed after November 3. Confirm those facts from the appropriate current sources before development, staging operations or production decisions.
