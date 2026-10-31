# Wonderful Apps — H109 concurrency finding and regression record

**Date:** 2026-10-31  
**Branch/checkpoint:** `reviseLogIn`, synchronized commit `6769974` (user-verified)  
**Environment:** Dedicated disposable HelioHost MariaDB `wapps_h109_test`, account `wapps_h109_user`; not `wapps_test` or production.  
**Evidence basis:** User-supplied PowerShell outputs in the Stage 6 conversation, plus inspected Google Drive test/application source. No commands or database writes were performed while compiling this document.

## Initial failure

The first live H109 run passed database identity/grant checks, actual InnoDB credential-row lock contention, and sequential refresh/replay checks. Simultaneous `browserSession.rotate()` calls using the same remembered-session token produced one success and a failure other than the required `REFRESH_INVALID`/401. Cleanup reported the dedicated database empty.

A diagnostic rerun confirmed:
- Concurrent request 1: fulfilled; successor present.
- Concurrent request 2: rejected with MariaDB `ER_CHECKREAD`, errno `1020`, SQLSTATE `HY000`, message `Record has changed since last read in table 'WebRefreshTokenT'; try restarting transaction`; no HTTP status.
- Exactly **one successor token** was present.
- Cleanup reported zero remaining tables.

Thus the initial issue was **unexpected database-error propagation under concurrent rotation**, not evidence of duplicate token issuance.

## Candidate correction and validation

`services/browserSession.js`, function `rotate(pool,secret)`: move the initial **nonlocking** candidate-account SELECT to before `await c.beginTransaction()`. Keep the credential-fence lock, locked token/security checks, token consumption, successor insertion, session update, and commit inside the transaction. No database schema change.

Rationale (working explanation): under MariaDB's default repeatable-read isolation, a nonlocking SELECT inside the transaction can establish an older snapshot prior to waiting for the account lock; the subsequent locking read may conflict with an updated token row. The successful H109 rerun strongly supports the fix for the observed test case, but does not independently prove the server's internal causal mechanism or cover every isolation level.

**User-reported live H109 result after correction:**
- Exact empty disposable database and grants: PASS.
- Real `credentialFence.lock()` waiting/recovery: PASS.
- Sequential `browserSession.rotate()` and consumed-token rejection: PASS.
- Concurrent request 1: fulfilled.
- Concurrent request 2: `REFRESH_INVALID`, status `401` (no database error code): PASS.
- Successor count: exactly `1`: PASS.
- Cleanup: dedicated database empty: PASS.

## Offline regression results after H109 fix

The user executed these seven files locally with `node --env-file=.env.test` and supplied successful output:

| Test | Reported result | Limitation |
|---|---|---|
| `tests/stage6a.test.js` | PASS, 12 simulation groups | Mocked JWT/SQL, no live DB |
| `tests/stage6a.supplemental.test.js` | PASS, 14 simulation groups | In-memory SQL, not actual routes/MySQL |
| `tests/stage6a.tnna-revocation.test.js` | PASS, synthetic TNNA revoke/verify | Not real TNNA HTTP or DB transaction |
| `tests/stage6a.password-safety.test.js` | PASS, 15 source/unit groups | Not live password/email flow |
| `tests/stage6a.live-replay.test.js` | PASS source assertions/replay model | Not actual concurrent DB rotation |
| `tests/group0a.refresh-replay.local.js` | PASS local mock HTTP replay | Not WA server or live cookie flow |
| `tests/group0d.environment.test.js` | PASS, 15 tests | Simulated connected-identity adapter, not DB login |

**Disposition:** H109's specifically reproduced concurrency scenario is **PASS** after the correction; the Stage 6 release gate is **NOT COMPLETE**. Pending: Group 5C real HTTP/TNNA strategy, Group 5D browser/manual checks, further relevant regression coverage, hosted behavior validation, and independent design engineer review **before merge/production decision**.

## Invariants and restrictions

- Preserve `REFRESH_INVALID`/401 for consumed token replay; do not make arbitrary `ER_CHECKREAD` or other SQL errors appear as authentication failures.
- Require exactly one concurrent success and one rejected replay, exactly one successor, and zero remaining test tables.
- For future live testing use only disposable `wapps_h109_test` with exact host/user/TLS/grants, zero-table preflight, and explicit dual CLI authorization.
- Do not modify `main`, production/Render, shared `wapps_test`, or `.env.test` as part of H109.
- No new application change is requested by this report. Local branch remains the source for the committed implementation; Google Drive copies may lag the Git checkpoint.
