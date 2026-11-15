# Wonderful Apps — Production Database Connection Resilience: Pre-Merge Review Item

**Prepared:** November 14, 2026  
**Status:** Proposed review item only — NOT approved for implementation  
**Target milestone:** Stage 6 completion / independent design-engineer review, before any `reviseLogIn` → `main` merge or production deployment  
**Proposed manual destination:** `My Drive/wonderfulApp/docs/` (or another owner-selected review-document folder)  
**Related project entry point:** root `README.md` and approved WA standards  
**Scope:** Database startup reliability and safe connection diagnostics; no immediate changes

## 1. Decision and constraints

Retain the current production and staging configurations unchanged while the Stage 6 acceptance program continues. This document preserves recommendations for later discussion; it does **not** authorize coding, installation, testing against production, merging, deployment, or database changes.

Google Drive (`My Drive/wonderfulApp`), GitHub (`sthink1/wapps`), and local WA project files remain strictly **read-only** to ChatGPT. All future proposed changed source files must be separately prepared for owner installation and reviewed under the applicable approved standards, including complete originals-to-finals, unified `.diff` files, separate `.md` verification reports, final SHA-256 checksums, targeted testing, and explicit owner authorization. Independent Stage 6 design-engineer review is required before any merge or production decision.

## 2. Evidence and open questions

- Production Render service: `wapps`; observed production commit during incidents: `d92ef54` on `main`. Database host `morty2.heliohost.org`, port 3306, pool limit 5, and `DB_SSL=required`.
- Test Render service: `wapps-stage6-test` on `reviseLogIn`; test database `wapps_test`, hosted on the same Morty2 server with the same four connection settings. Supplied November 5–8 event-history screenshots showed successful staging deployments and no corresponding instance-failure events in the portions reviewed. This is **not** a guarantee of continuous uptime or equivalent conditions.
- Production application logs on November 6, 8 and 12 showed initial MySQL connection errors, then successful connection following process restart. Render recorded `Exited with status 1` events. The underlying error code/message was not visible in the screenshots.
- On November 12, Render application logs showed a connection error at **2:16:47 PM EST** and successful connection at **2:17:02 PM EST**. Separately, Render **Events** recorded instance `pcf86` failed at **2:26 PM** and a service-recovered event at **4:16 PM**. These event intervals are **not** proven continuous downtime.
- HelioHost reported Morty2 uptime during the queried incidents. A server-side warning on November 12 at **18:58:34 UTC (1:58:34 PM EST)** reported an aborted connection involving `wapps_production`, `wapps_production` user, and Render's Virginia egress host: `Got timeout reading communication packets`. This warning preceded the Render startup error by roughly 18 minutes; their causal relationship is **unconfirmed**.
- Morty2's recorded `wait_timeout` and `interactive_timeout` were 120 seconds, `max_connections` 300, `max_connect_errors` 100, historical `Max_used_connections` 27. Server-wide counters do not attribute errors to this application.
- HelioHost detailed logs were reported to have approximately **30 hours** of retention; follow up promptly if another failure occurs.

**Open root-cause question:** Why did the production application's initial connection attempt fail? Possible contributors include remote-network interruptions, MariaDB connection handling, TLS negotiations, account-specific behavior, or startup timing. Current evidence does not isolate one.

## 3. Source-code review results

**Verified GitHub production `d92ef54`:**
- `dbConnection.js` performs an asynchronous one-shot initial database connection/session-time-zone check. On failure it logs an error and invokes `process.exit(1)`; no explicit bounded startup retry exists.
- `server.js` starts the HTTP listener independently of the asynchronous database verification, so it can briefly listen before a failed startup database check terminates the process.

**Verified GitHub `reviseLogIn`:**
- `dbConnection.js` exposes a `ready` promise for initial connection/UTC verification, but does not implement a retry loop around `pool.getConnection()`.
- `server.js` awaits `dbReady` and `stage6Env.verifyDatabaseIdentity(...)` before starting the listener. Failed startup is handled by closing the pool and setting a nonzero exit code. This is a better readiness sequence, **not** a solution to transient initial connection failures.
- `services/stage6Environment.js` currently supports `local` and `staging`, not production. This test-only guard must be redesigned, reviewed, and specifically authorized before any promotion of that branch to production.

**Conclusion:** `reviseLogIn` does **not** by itself resolve initial-connection failures. The observed staging reliability does not demonstrate that it would.

## 4. Recommendations to discuss at pre-merge review — NOT authorized changes

### R1 — Bounded startup retries

Design explicit retries for **transient connection-establishment failures** before giving up. Proposed parameters (attempt count, delays, jitter, maximum startup duration) must be selected and approved at design review; no values are approved by this document.

- Verify TLS, database identity, and session time zone on a successful attempt.
- Do not accept HTTP traffic, run maintenance, or perform application jobs before readiness verification succeeds.
- If retry budget is exhausted, close resources safely and fail startup with nonzero exit status so Render can recover.
- Do not disguise persistent credentials, TLS certificate, or wrong-database errors as harmless intermittent failures. Categorize failures before deciding retryability.

### R2 — Safe diagnostic logging

Record bounded, nonsecret structured startup diagnostics sufficient to distinguish connection failures, including:
- event timestamp in UTC, phase (`DNS/TCP/TLS/authentication/query/identity` **only where reliably determined**), retry attempt number, elapsed duration, and stable sanitized error code/category;
- final startup-failure outcome and the reason a failure was considered transient versus permanent.

Never log raw exception objects, SQL parameter values, DB passwords, user data, tokens, stack traces or full credential-bearing URLs. Follow the existing Stage 6 logging/security constraints; any additional diagnostic fields require an explicit information-disclosure review.

### R3 — Established pooled connection recovery

Separately test `mysql2` behavior after the server closes an idle connection (Morty2 timeout setting: 120 seconds). Confirm that a later operation can obtain a fresh connection and that failed operations receive controlled error responses.

Do **not** automatically retry writes, transactions, or other non-idempotent operations without a specific safety design: a retry could duplicate business actions. Inspect actual routes, transaction boundaries, and callers before proposing any per-operation retry.

### R4 — Production-representative staging acceptance tests

In an isolated test database and controlled test environment, verify:
1. first connection fails transiently; later attempt succeeds before the bounded deadline;
2. persistent connection refusal, invalid authentication, invalid TLS, or wrong DB identity ultimately fails closed;
3. the HTTP listener remains unavailable until DB identity and UTC checks pass;
4. connection pool release/cleanup and startup exit behavior are deterministic;
5. safe logs distinguish test cases without disclosing secrets;
6. dropped idle connections and in-flight transaction failures are handled without duplicate writes;
7. repeat cold-start and redeployment tests, recording test count, results and limitations.

Do not induce faults in the production database or production service. Do not mix these tests with outstanding Stage 6 acceptance items without a scoped, owner-approved plan.

### R5 — Evidence capture upon recurrence

If Render reports another instance failure:
- preserve Render **Events** (instance ID, exact timestamp, deployment SHA, failure/recovery) separately from **Application Logs** (error and successful connection times);
- request HelioHost diagnostics promptly within its short retention window, specifying both local and UTC timestamps;
- ask for relevant aborted-connection, authentication, TLS, and host-blocking diagnostics for the production account, without requesting account privileges or configuration changes;
- record whether the event was a cold start, deploy, crash, or other lifecycle transition if independently verifiable.

### R6 — Promotion and release gates

Before any `reviseLogIn` → `main` merge:
- independently reconcile the source state of `server.js`, `dbConnection.js`, `logger.js`, `services/stage6Environment.js`, and dependent modules;
- make an explicit production environment design decision; never copy the staging-only `WA_ENV` guard directly to production;
- execute the approved full-file comparison, `.diff`, `.md` verification and checksum process for **each changed existing source file**;
- complete applicable Stage 6 tests, independent design-engineer review, owner approval, and a separately approved production deployment/rollback plan.

## 5. Current disposition

**Deferred for pre-merge discussion.** No source-code change has been authored here, and no Render, HelioHost, GitHub, Google Drive, or local WA project asset has been changed. This standalone document is a *proposed* review record for the owner to place manually in the authoritative WA project.
