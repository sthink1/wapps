# Wonderful Apps — R16-75-T08 Bounded Offline Test Evidence

**Date:** November 14, 2026  
**Status:** **TEST-PASS-BOUNDED** for nine isolated checks; **integrated route execution remains unverified**.

## Scope and source pinning

T08 checks representative Family Tree, Family Tree privacy, notifications, subscriptions, Budget, ETF and Users error contracts, focusing on expected vs unexpected messages, response status and JSON shape. The test uses previously retrieved read-only copies of the authoritative Google Drive route files and the proposed R16-75 central handler in an isolated temporary workspace. It does not start Express, connect to a database, authenticate a real user, or contact Render.

- Proposed `server.js` SHA-256: `00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81` (unchanged from prior T01–T07 proposal).
- Original authoritative Google Drive `server.js` SHA-256, earlier reconciled against GitHub `reviseLogIn`: `b6c6ec291ffc7674590cccb83d627c0dc9dac0431129ba017b991c7e8156f1e1`.
- Shared `services/stage6ExpectedClientError.js` uses object-identity WeakSet classification.
- Read-only source copies reviewed: `routes/familyTree.js`, `routes/ftPrivacy.js`, `routes/notifications.js`, `routes/subscriptions.js`, `routes/budget.js`, `routes/etf.js`, and `routes/users.js`.

## Executed results

Command (isolated copy): `node --test tests/stage6.r16-75.t08.offline.test.js`  
Node version: `v22.16.0`. Results: **9 passed, 0 failed**.

| Case | Subject | Level of verification | Result |
|---|---|---|---|
| T08-A | Family Tree marked 400/403/404/409 and selective domain fields | Actual extracted helper execution | PASS |
| T08-B | Family Tree unmarked errors suppress message and domain fields | Actual extracted helper execution | PASS |
| T08-C | FT privacy expected 403/404 and unmarked 400/403/500 | Actual extracted helper execution | PASS |
| T08-D | Notification 404 and unexpected 400/404/500/503 | Actual extracted helper execution | PASS |
| T08-E | Subscription `/promo` expected and unexpected errors | Actual mocked route handler plus central handler execution | PASS |
| T08-F | Budget own expected marker and flat `error` branch | Marker execution plus source-pattern assertion | PASS |
| T08-G | ETF own expected WeakSet and flat `message` branch | Marker execution plus source-pattern assertion | PASS |
| T08-H | Users refresh-session flat envelope and expected-error check | Source-only assertion, not handler execution | PASS (source check) |
| T08-I | Proposed central handler nested envelope for marked/unmarked 403 | Actual extracted handler execution | PASS |

## Compatibility findings

Family Tree and notifications use `message` fields in represented cases; privacy uses `message`; subscription promo and Budget use `error`; ETF uses `message`; Users refresh-session uses flat `error`. The central handler retains `{error:{message:...}}` where invoked. Existing deliberate local route behavior must not be changed by a wholesale envelope migration. Budget and ETF's local expected-error classification are not equivalent to the shared WeakSet; do not mark arbitrary external exceptions as approved.

## Limitations and outstanding acceptance

The test contains representative samples rather than exhaustive route coverage. The Budget and ETF tests validate classifier behavior and response-shape source branches, but do **not** execute actual database-backed route handlers. The Users test validates source structure only. Thus positive and negative real-world route behavior, domain record validations, administrator/privacy authorization and endpoint-consumer interactions remain for integrated testing or follow-up targeted tests. No source change was indicated by these bounded results. The earlier T01–T05 offline passes remain preserved; T06 remains PARTIAL until actual Express/Multer parser HTTP integration testing. T07 passed its bounded offline checks.

## Delivery / install

Evidence-only archive. The new test belongs in `wonderfulApp/tests/`, this report and raw TAP log under `wonderfulApp/docs/`, and checksum manifest under `wonderfulApp/change/`. Test requires the corresponding source tree or isolated copy containing the seven route files, proposed `server.js`, and shared classifier; its source references are relative to project root. **Do not mistake this evidence ZIP for an application-source installation.** No Google Drive, GitHub, local WA project, Render instance or database was modified.
