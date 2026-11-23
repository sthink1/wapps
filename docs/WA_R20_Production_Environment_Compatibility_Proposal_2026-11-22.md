# Wonderful Apps — R20 Production Environment Compatibility Proposal

**Date:** November 22, 2026  
**Status:** REVIEW-ONLY PROPOSAL — NO IMPLEMENTATION, INSTALLATION, MERGE, DEPLOYMENT, OR DATABASE CHANGE AUTHORIZED  
**Branch examined:** `reviseLogIn` at deployed commit `b751e17`  
**Production comparison:** `main` at deployed commit `d92ef54`  
**Scope:** Proposed safe transition of Stage 6's staging-only environment safeguards into a deliberately configured production-ready application, while keeping staging restricted.

## 1. Owner-approved preparation scope

The owner approved **preparing a proposal for review**. This document makes no change to authoritative files or services. Any implementation, installation, commit, staging deploy, production merge/deploy, or database switch requires its corresponding future approval. Follow the established A→B→C→D workflow; this document is a Step A design recommendation, **not** a Step B implementation ZIP or approval to change code.

The governing references reviewed are the authoritative Google Drive root `README.md`, Core Standards v1.0, Detailed Standards v0.4.1, Decision Register v1.0, file delivery process v1.1, `CLAUDE.md`, `TechSummary.md`, November 19 production database transition plan, Stage 6 implementation plan, and current files at the exact GitHub commits above. The November 22 production and test database dumps are available and were previously inspected during R20; the owner's successful isolated production dump import of 66 tables is preserved as bounded evidence.

## 2. Demonstrated compatibility blocker

At `b751e17`, `server.js` imports `services/stage6Environment.js` at startup and checks the connected database identity before listening. The imported module currently allows `WA_ENV` **only** `local` or `staging`; accepts **only** test database names; requires staging URL `https://wapps-stage6-test.onrender.com`; and requires the staging `wapps_test` database and constrained connection pool. As written, it refuses a production configuration. The historical production commit `d92ef54` does not import this test-only module.

The guard also supplies validated origin/cookie settings to `server.js` and `services/browserSession.js`. Two password-reset services import the guard solely for its startup side effect. Therefore, **a one-line removal or a production environment-variable change is unsafe and insufficient**. Simply changing `WA_ENV=production` would stop application startup, not make the branch production-ready.

Source evidence:
- [`server.js` at b751e17](https://github.com/sthink1/wapps/blob/b751e17/server.js)
- [`services/stage6Environment.js` at b751e17](https://github.com/sthink1/wapps/blob/b751e17/services/stage6Environment.js)
- [`services/browserSession.js` at b751e17](https://github.com/sthink1/wapps/blob/b751e17/services/browserSession.js)
- [`dbConnection.js` at b751e17](https://github.com/sthink1/wapps/blob/b751e17/dbConnection.js)

## 3. Proposed minimal production-safe design (subject to implementation approval)

1. **Retain a fail-closed stage/production identity gate.** Extend or narrowly replace the existing central environment contract to support an explicit `production` mode *only* when all approved production identity conditions are satisfied. Production must never be the default or reached through a loose fallback. Keep the existing staging contract and exact staging origin/database checks unchanged.
2. **Explicit approved database identity.** Validate `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PORT`, TLS policy, and expected session time zone against separately approved deployment-specific production values, before any HTTP listener or state-changing background job begins. Do not embed database passwords or other secrets. Production target must be the **future owner-approved new production database**, not automatically today's `wapps_production` or the staging `wapps_test`. Configuration identity must be pinned at cutover, not inferred from a permissive host match. Do not establish connections in source-only or unit tests.
3. **Origin and cookies.** Require production's *exact approved HTTPS public origin*; enforce one explicitly permitted browser origin for credentialed requests, reject wrong Origin on protected mutations, and require `Secure`, `HttpOnly`, and the existing `SameSite=Lax` refresh-cookie contract for hosted production. Preserve approved native/TNNA public/non-cookie access and existing legacy CORS distinctions without treating broad CORS as proof of authorization. Verify generated email/reset/public URLs against the intended production origin.
4. **MySQL connection and TLS.** Reconcile `dbConnection.js` with both versions: `d92ef54` has a general `DB_SSL=required` TLS option and validates connection limits/ports, while `b751e17` enforces TLS only for the exact test identity and uses a less strict generic fallback. Proposal should preserve/improve validation for both environments, require certificate-validated TLS for hosted production, and retain test's verified 5-connection limit. Production pool sizing must be approved based on actual hosting limits; do not assume 50 is safe.
5. **Preserve authentication and side effects.** Keep established JWT, browser refresh cookie, password reset, email, TNNA/session revocation, authorization, subscription, privacy, cache, and PWA contracts unchanged except for necessary environment wiring. Never modify real account, session, or subscription data as a compatibility test.
6. **Keep production and staging distinct.** The approved design must be tested as *the same proposed build* in controlled isolated modes or through an equivalent safely pinned production-mode mock. Staging remains unable to reach production databases or URLs; production mode cannot start with staging/test credentials.
7. **Never bypass unresolved release findings.** Existing deferred One Tree critical/high findings, missing fully rehearsed migration/rollback, and mandatory independent security review remain separate release blockers. This proposal does not waive or fix them.

## 4. Source impact inventory (proposed; verify final exact baselines before Step B)

| File (WA-relative) | Relevant GitHub `b751e17` blob SHA | Proposed action | Basis |
|---|---|---|---|
| `services/stage6Environment.js` | `b1cd07cdef65fa4fb0d2493393441b52db1bff9c` | **Likely REPLACE** | Current module refuses production; define separately pinned production identity and retain test safeguards. |
| `server.js` | `a784533a1e3c09c29c139ffd9321e69d4d8fdc8c` | **Likely REPLACE** | Startup verification, mode-specific logging, existing origin integration and safe background job sequencing. |
| `dbConnection.js` | `0766a7e2bf4344332faab462b768446376d970fa` | **Likely REPLACE** | Reconcile host/TLS/pool validation across intended environments. |
| `services/browserSession.js` | `d51780ccc364d17c34887d555d3349fbf64406b5` | **Review; replace only if necessary** | Uses environment-derived cookie security and exact origin; proposed contract may be sufficient without change. |
| `services/passwordResetLimiter.js` | `732c8b342f492dc3bef62dcc1529d94674c3bd95` | **Review; avoid change** | Imports guard; should remain compatible after guarded production mode support. |
| `services/passwordResetRateCleanup.js` | `f0d469d9e1556c82e7bf2f37bdbb16fbb7fee6c3` | **Review; avoid change** | Imports guard; scheduler timing and behavior must remain unchanged. |
| `routes/users.js` | `025adb25194a2f83c7ecd5b19952a3afdbfadfb1` | **Review; avoid change** | Uses current session/origin and public URL for reset email. |
| Targeted new offline tests | Not applicable | **NEW** | Positive/negative startup matrix and cookie/origin/DB identity checks. |

Google Drive authoritative IDs for primary sources: `server.js` `1Yihhzsei9ek4tJh6mztXiWLk9t101Toz`; `dbConnection.js` `1cVTuK5hDmiv4WvOadVDbr4NyZEdTl1sh`; `stage6Environment.js` `18aEUeQsafncacJqV8NouqiIOn9_7LmFZ`; `browserSession.js` `1YgybRfplH1eVnJczWZMzrNeUsB5zNvSk`. GitHub SHA above is an examined deployed commit, **not proof those Drive bytes match exactly today**. Reconcile against fresh authoritative originals before building.

Do not revise PWA or frontend files merely as part of this environment fix. No SQL migration is in scope.

## 5. Acceptance and regression test proposal

**Offline source/test-only, no database contact:**

- Explicit `local` with correct test origin, only permitted test DB identity: PASS startup validation.
- Explicit `staging` with exactly current tested host, user, DB, HTTPS URL, allowed origins, TLS, pool size: PASS without weakening existing checks.
- Explicit `production` with independently approved synthetic production identity, HTTPS origin, valid TLS/pool/port: PASS mode validation and cookie contract in test doubles; must not touch a live production database.
- Missing, ambiguous, or unknown mode: fail closed before listener/pool/side effects.
- Production mode with `wapps_test` or wrong host/user/DB, test origin, missing TLS, malformed port/pool, mismatched public URLs or CORS: fail closed.
- Staging mode with production database/user/origin: fail closed.
- Authenticated session cookie `Secure`, `HttpOnly`, `SameSite=Lax`; rejected cross-origin state-changing requests; current native/TNNA supported clients remain compatible.
- Review email-generated links and startup/exception logging for environment-specific secret or URL leaks. Do not emit secrets in evidence.

**Owner-controlled later acceptance:** use an isolated production-shaped candidate (future approved database schema, no real production credentials) for targeted startup, login, refresh, logout, reset, TNNA, application permissions, subscription and one PWA update/rollback transition test. Preserve previously accepted results unless relevant modified dependencies warrant targeted retesting.

**Release go/no-go:** the proposed build must pass full applicable tests, independently reviewed production schema/data migration, a demonstrably recoverable rollback with write-cutoff/reconciliation, compatibility for installed TNNA clients, and mandatory independent security/security implementation review (including deferred One Tree risks). Owner separately approves merge, production deployment, and database cutover.

## 6. Rollback and deployment boundaries

- **Proposal review:** no change to services or files.
- **Step B (only if implementation approved):** one coherent ZIP of complete final files at exact WA-relative locations, per-revised-file `.diff` and `.md` verification, SHA-256 sums, independent test evidence, `install/INSTALL.md` and manifest, rollback instructions. No `.original` copies, secrets, production migrations, or unnecessary files.
- **Step C:** owner installs ZIP locally and synchronizes to authoritative Google Drive; existing GitHub, production, and staging remain untouched by ChatGPT.
- **Step D:** targeted local tests. Development commit/push, staging deployment, and release actions remain separate owner-controlled approvals. Note: staging's Auto-Deploy currently runs on `reviseLogIn` commits, so owner must explicitly coordinate any commit against automatic staging deployment.
- **Production rollback:** retain last known deployed code `d92ef54` and old production database, but **do not** represent code-only reversion as sufficient after schema migration or user writes. Pin exact release artifacts, backup, migration delta strategy, validation checklist, and recovery operator instructions before cutover.

## 7. Decisions needed before implementation

**Proposed approval scope:** authorize preparing a *production-compatible, staging-preserving* candidate restricted initially to `services/stage6Environment.js`, `server.js`, `dbConnection.js`, and necessary isolated tests. Add `services/browserSession.js` or other dependencies only if a documented concrete gap justifies it and owner approves expansion. This is not approval to install the candidate.

**Deferred environment choices:** exact future production database name/user/host, production public URL, TLS setting, approved pool cap, and release coordination must be grounded from a separately approved new-production plan. Do not ask for secret values; no need to finalize production target now for safe offline design.

**Recommended status:** R20 production compatibility **BLOCKED for current code**, proposal ready for scope/implementation review. This is distinct from the earlier R20 recovery restore's bounded PASS.
