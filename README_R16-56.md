# Wonderful Apps — R16-56: Expected HTTP 4xx Error Classification

Prepared 2026-11-10. Source reference: `sthink1/wapps` branch `reviseLogIn` commit `0cb38b238d8da82019914926299a24911f986c69`.

## Findings and scope

R16-55 identified three source-level cases where an unexpected error that carried an HTTP 400 status could cause an exception message to appear in a response. This ZIP is a **proposed correction**, not a deployment or acceptance result. No live 500/400 failures were induced and no actual data disclosure was observed.

A shared `WeakSet` in **new** `services/stage6ExpectedClientError.js` marks only application-created expected 4xx errors. A `status` property or a message string by itself never marks an error. Intended Family Tree 400/403/404/409 responses, subscription validation errors, and the unsubscribe invalid-token 404 retain their messages. Unexpected 4xx errors in Family Tree/Notifications produce a generic response; Subscriptions replaces the unexpected 4xx exception with a generic message before forwarding it to the existing central Express error handler. Explicit 5xx sanitization remains in place. **HTTP response statuses remain unchanged** in these paths.

## Source files (complete replacements)

- `routes/familyTree.js`: mark the 70 explicit intentional 4xx errors and nine Favorite Pets validation constructions; require that marker to expose message or response detail.
- `routes/notifications.js`: require marker for 4xx exception messages.
- `routes/subscriptions.js`: only expose messages for marked expected 4xx errors; forward *generic* errors for unexpected 4xx to central handler.
- `services/notificationService.js`: mark the deliberately generated invalid-unsubscribe-token 404.
- `services/subscriptionService.js`: mark 29 explicitly created validation errors.
- `services/stage6ExpectedClientError.js`: **new** shared WeakSet marker module.

The five original files were verified against GitHub at commit `0cb38b2` (content is identical; Drive service files used Windows CRLF line endings). The ZIP uses LF; Git may print an informational line-ending warning.

## Regression tests (complete replacements/new test)

- `tests/stage6.r16-47.error-response-sanitization.offline.test.js`: updated for marked expected errors; keeps all eight R16-47 checks.
- `tests/stage6.r16-55.unexpected-4xx.offline.test.js`: updated to distinguish marked expected errors; keeps all nine R16-55 checks.
- `tests/stage6.r16-56.expected-4xx.offline.test.js`: **new** 15 checks; includes tests for actual requireTree and subscription-service validation errors, synthetic unexpected 4xx/5xx, route forwarding, and marking coverage.

The older R16-47 and R16-55 tests MUST be replaced at the same time as the source files, since their original synthetic expected-error fixtures did not carry explicit provenance markers.

## Installation (user manually; test branch only)

1. Confirm current branch is `reviseLogIn` and source matches commit `0cb38b2` or stop and reconcile any later work before installing. Do not apply directly to `main`, production, or TNNA.
2. Extract this ZIP into `C:\AppProjectwDB\WonderfulAppsRender`, preserving `routes`, `services`, `tests` paths. It contains five revised existing source files, one new helper module, three test files, this README, and source diffs.
3. Do not use the local production `.env`. Do **not** deploy or commit until all regression tests pass and the changes have been reviewed.
4. From project root, run:

```powershell
node --check routes/familyTree.js
node --check routes/notifications.js
node --check routes/subscriptions.js
node --check services/notificationService.js
node --check services/subscriptionService.js
node --check services/stage6ExpectedClientError.js
node --test tests/stage6.r16-47.error-response-sanitization.offline.test.js tests/stage6.r16-55.unexpected-4xx.offline.test.js tests/stage6.r16-56.expected-4xx.offline.test.js
git diff --check
git status --short
git diff --stat
```

Expected **32 automated tests, 32 passed, 0 failed**. Offline tests do not start the app, connect to a DB, or perform HTTP requests. All tests passed against the packaged source in an isolated local harness; this does not replace testing in your actual project.

5. Report the results and changed-file inventory before staging or committing. Next steps will be a bounded local/hosted integration check, followed by independent design-engineer review before any production decision.

## Other considerations

- Do not assume a general route-wide security audit is complete: the central Express error handler still preserves unmarked 4xx messages, and other middleware/route paths must be evaluated separately before S6-041 closure. Subscriptions explicitly neutralizes unexpected 4xx errors before invoking that handler.
- R16-47 and R16-55's expected-error fixtures were revised to reflect the new intended rule; their original versions will no longer be valid regression fixtures after this change.
- No user files, Google Drive files, GitHub branches, or Render services were changed in producing the download.
