# Wonderful Apps — Stage 6 remaining-test inventory and safety audit
Date: 2026-10-31
Source: authoritative Google Drive `My Drive/wonderfulApp/tests` (folder ID `1Gb1qH-FkReNoOpFw77D39FFjsDD6Cl-w`).
Scope: source audit only; no remaining tests executed, database changed, or application source modified.

## Inventory reconciliation
29 items listed in Drive test folder. 16 have been migrated and accepted based on prior user-reported test output (Groups 1–4 plus two previously fixed rate-limit unit tests). 13 have not been accepted through the same controlled test-migration workflow. This is a **test-folder inventory**, not proof all project tests anywhere in the repository have been found. Drive copies were reviewed; current local Git working tree could have newer changes.

## Remaining 13 files — risk and disposition

| File | Source observations | Risk | Recommended disposition |
|---|---|---|---|
| `group0a.http-concurrency.local.js` | Local HTTP at localhost:8080; fixed `charter`/62 and `sql5838929`; prompts for current and temporary passwords; changes account password and sessions; restore path is not guaranteed on all failures | CRITICAL | BLOCK. Redesign with dedicated disposable test identity and explicit recovery, or replace with simulated handler concurrency where feasible. Never run on shared staging user. |
| `group0a.tnna-http.local.js` | Local HTTP; fixed charter/62; requests password; creates TNNA registration/consent/device/refresh records left in DB | HIGH | BLOCK. Use disposable fixture/account and own-key cleanup; audit all side effects first. |
| `group0a.refresh-replay.local.js` | Reads then clears Windows clipboard containing refresh cookie, connects to DB and posts to local refresh endpoint; charter/62 and old database guard; consumes live session token | HIGH | BLOCK. Replace clipboard/real-session dependency with newly-created isolated test session and explicit cleanup; avoid existing browser session. |
| `group0a.mysql-concurrency.test.js` | Uses charter SecurityVersion row; opens two real MySQL connections; transaction updates and rolls back row while another connection waits | HIGH | BLOCK. Use temporary InnoDB tables with synthetic row and dual-connection contention, or uniquely owned dedicated fixture. |
| `stage6a.live-replay.test.js` | Creates remembered sessions for charter/62, rotates and races refresh tokens; revokes test sessions in cleanup; outdated `sql5838929` guard | HIGH | BLOCK pending dedicated test identity and reliable cleanup; never use charter on staging. |
| `stage6a.http-failure.test.js` | Exercises real route callbacks using mocked DB/mail/HTTP responses; no real DB/HTTP | LOW | Candidate for first non-live migration: verify current route contracts, no unexpected file or network activity; then run. |
| `group0a.credential-fence.test.js` | In-memory adapter and source assertions for web/TNNA credential version fences; no DB connection | LOW | Candidate for first non-live migration: compare source patterns with current Drive route versions, then run. |
| `verifyAccessToken.test.js` | Uses synthetic JWTs, fake database adapter and no live MySQL | LOW | Candidate for first non-live migration: check verifier implementation signatures, then run. |
| `waPlatform.unit.test.js` | Browser-front-end unit harness; mocks requests and storage in local JS, no identified live DB | LOW | Candidate for first non-live migration: inspect harness side effects and execute locally. |
| `stage6a.proxy-ip.audit.test.js` | Reads server.js, runs loopback Express probes; no Render access; previously passed H101, but external proxy hops remain unverified | LOW / OPEN FINDING | Retain as previous read-only audit; rerun after any server/proxy changes. Distinguish source observation from hosted hop verification. |
| `Stage6_Test9D_ControlledLock.js` | DevTools script for signed-in localhost tabs; manipulates local access-token state and Web Locks; not a Node test | MEDIUM | Manual-only; use dedicated test session, explicit browser setup, no production execution. |
| `Stage6_Test9D_Console_Arm.js` | DevTools two-tab refresh restoration and BroadcastChannel diagnostic; not a Node test | MEDIUM | Manual-only; inspect against current waPlatform.js and record results separately. |
| `apply-stage6b2-revocation-fix.cjs` | One-time source patcher writes `httpdocs/home.html` and backup; not a test; may fail or alter current code | HIGH (file mutation) | DO NOT EXECUTE during audit. Archive or segregate from executable regression-test suite; review prior application and Git history. |

## Recommended controlled sequence
1. **Group 5A read-only unit/source tests**: `verifyAccessToken.test.js`, `group0a.credential-fence.test.js`, `stage6a.http-failure.test.js`, `waPlatform.unit.test.js`. Review current dependencies then execute individually; complete revised files only if source contracts have drifted.
2. **Group 5B synthetic concurrency**: redesign `group0a.mysql-concurrency.test.js` around temporary tables and second connection, and `stage6a.live-replay.test.js` around uniquely owned disposable test identity/session; do not run live before preflight checks.
3. **Group 5C high-impact HTTP**: redesign `group0a.http-concurrency.local.js`, `group0a.tnna-http.local.js`, `group0a.refresh-replay.local.js` so no existing password, browser cookie, user account or TNNA enrollment is involved. Consider offline mocked route equivalents first and segregated dedicated identities for later full HTTP tests.
4. **Group 5D browser/manual + tooling**: retain Test9D scripts as manual acceptance tools; segregate source-patching `.cjs` from tests and mark non-runnable by default.
5. **Cross-cutting issue**: Render client IP attribution remains unresolved from proxy audit; a localhost result is not evidence of hosted behavior. Preserve the independent design-engineer review requirement before merging or deploying.

## Control rules for upcoming changes
- Stay on `reviseLogIn`; `wapps_test` only, no production/main/TNNA deploy or mutation.
- Avoid `charter`, UserID 62, fixed legacy IDs, browser clipboard credentials and current-hour shared limiter counters.
- No blanket replacement of database names; audit SQL, commits/rollbacks, side effects, and cleanup first.
- For live tests require explicit opt-in argument, identity/TLS preflight, dedicated owned fixture, bounded concurrency, and exact cleanup with verification; never infer safe isolation from a rollback alone.
- No tests were run for this audit; file classification is static based on Drive copies.
