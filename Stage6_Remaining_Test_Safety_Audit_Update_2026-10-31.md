# Wonderful Apps — Stage 6 remaining-test safety audit UPDATE

**Date:** 2026-10-31  
**Scope:** Updated disposition against the existing `Stage6_Remaining_Test_Safety_Audit_2026-10-31.md` (original retained). Inspected the latest accessible Drive test sources and user-reported execution evidence. **No test was run and no database or application source was changed by this audit.**

## Reconciliation with original audit

The original audit recorded 13 unaccepted items and treated `stage6a.live-replay.test.js`, `group0a.refresh-replay.local.js`, and `group0a.mysql-concurrency.test.js` as high-risk legacy scripts. Their **current Drive copies have since been revised**. The old classifications no longer apply verbatim. The audit is not proof all repository tests are accounted for; this covers the identified tests folder and recent H109 files.

| File or group | Current verified implementation / outcome | Decision |
|---|---|---|
| `stage6a.live-replay.test.js` | Current source only reads `browserSession.js` and runs an in-memory replay model; user-reported PASS | ACCEPT as **offline source/model coverage**, not live DB replay |
| `group0a.refresh-replay.local.js` | Current source starts isolated ephemeral `127.0.0.1` mock HTTP server, uses synthetic token/cookie; user-reported PASS | ACCEPT as **loopback mock**, not real WA endpoint |
| `group0a.mysql-concurrency.test.js` | Current source requires explicit `--run-live`, checks staging/host/TLS, then intentionally `SAFE HOLD`s because connection-local temp tables cannot establish cross-connection locks | DO NOT use it to claim real contention; **H109 supplies actual real-DB cross-connection coverage** |
| `stage6.h109.connection-preflight.test.js` | Read-only live preflight passed identity, TLS, empty schema, grant scope | ACCEPT as connection/isolation evidence |
| `stage6.h109.disposable-integration.test.js` | Live H109 failed with `ER_CHECKREAD` before fix; rerun after candidate code fix passed one rotation, one rejected replay (401), exactly one successor, cleanup | ACCEPT **H109 scenario PASS**; not general release approval |
| `stage6a.test.js`, `stage6a.supplemental.test.js`, `stage6a.tnna-revocation.test.js`, `stage6a.password-safety.test.js`, `group0d.environment.test.js` | User-reported PASS after H109 fix | ACCEPT within stated simulation/source-check limitations |
| `group0a.http-concurrency.local.js` | Still references `charter` / UserID `62`, `sql5838929`; changes real password and sessions; restoration not guaranteed | **BLOCK — DO NOT EXECUTE** |
| `group0a.tnna-http.local.js` | Still references `charter` and `sql5838929`, prompts for password and creates persistent TNNA data | **BLOCK — DO NOT EXECUTE** |
| `stage6a.http-failure.test.js` | Current source loads real route callbacks in a VM with mocked SQL/email, injects revocation failures; no DB pool or listener | LOW RISK; candidate for separately controlled offline run (not yet reported here) |
| `group0a.credential-fence.test.js`, `verifyAccessToken.test.js`, `waPlatform.unit.test.js` | Classified as offline candidates in prior audit; prior Group 5A coverage referenced in conversation | Avoid counting as newly rerun without fresh output; no blanket runner |
| `stage6a.proxy-ip.audit.test.js` | Source/localhost proxy assertions, external hop behavior not verified | OPEN hosted proxy attribution finding |
| `Stage6_Test9D_ControlledLock.js`, `Stage6_Test9D_Console_Arm.js` | Interactive DevTools/browser tools, not batch Node tests | Group 5D manual-only on dedicated test sessions; prohibit production use |
| `apply-stage6b2-revocation-fix.cjs` | One-time source patcher can write `httpdocs/home.html` | **BLOCK** in test/regression runners; archive/segregate without running |

## Ordered next phase

1. **Group 5C — safe redesign only:** inspect current `routes/users.js`, TNNA routes, and stage-test service setup; replace legacy fixed-account HTTP tests with a disposable identity and guaranteed independent cleanup. Prefer offline actual-handler fault injection first. Do not copy old `charter` flows to `wapps_test`.
2. **Group 5C acceptance criteria:** bounded local HTTP routes, origin/cookie correctness, rotation/replay, password-change revocation, TNNA registration and refresh behavior, and recovery of exactly test-owned records. No shared account password alterations.
3. **Group 5D:** plan browser manual tests around separate disposable sessions, including multi-tab Web Locks and BroadcastChannel. Require explicit operator action and rollback/recovery procedure.
4. **Cross-cutting:** hosted proxy/IP attribution remains open. H109's focused concurrency result does not resolve this.
5. **Release gate:** independent design-engineer review after all Stage 6 testing and before any branch merge or production deployment.

## Controls

Keep `reviseLogIn` as the sole development branch. Shared staging (`wapps_test`) and existing accounts must not be modified by new test automation. Use disposable fixtures, explicit live-test opt-in and preflight isolation checks, redacted diagnostics, and post-test cleanup verification. Never infer zero side effects solely from `rollback()`; DDL may commit implicitly and email/HTTP/browser state is external to transactions.

**This update is documentation only** and makes no claim that Group 5C/5D live acceptance testing has been completed.
