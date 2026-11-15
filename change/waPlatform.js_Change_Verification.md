# R16-75-T09 — `waPlatform.js` Change Verification

**Date:** 2026-11-14  
**Classification:** Proposed isolated client compatibility correction; owner manual installation only.  
**Source change:** One existing file, `httpdocs/js/waPlatform.js`.  
**Status:** Source baseline verified; offline regression PASS (36/36); live/browser deployment unverified.

## 1. Authority and verified source

- Authoritative original: `My Drive/wonderfulApp/httpdocs/js/waPlatform.js` (Google Drive ID `1UYqbOViwtFnng4T-JeP9PJ00MKG7-hww`).
- Read-only GitHub comparator: `sthink1/wapps`, branch `reviseLogIn`, `httpdocs/js/waPlatform.js`, matching Git blob `336cbfb369f20990bf5dc4f407e07f436862033b`.
- The exact Google Drive original (8,232 bytes) and fetched GitHub source have the **same Git blob ID**. No source baseline difference was found for this file.
- Original SHA-256: `e88dd8f9afff24e4a7b16e107619ba36fd8d01f3dd3a9ba284600aecf35304a5`.
- Revised SHA-256: `57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d`.
- Render deployment was not directly inspected. No installed local project file was read or changed. Confirm the local installation checksum before replacing it. If it differs, STOP and reconcile before installation.
- The existing unit test baseline `tests/waPlatform.unit.test.js` also matched GitHub blob `28859f539132fe2c593063f600cc80cc669137e1` and was used without modification.

## 2. Exact original-to-final comparison

- Complete original and complete replacement were compared, not snippets.
- A complete line-level unified patch is at `change/waPlatform.js.diff`.
- Only `readError(response)` changed; `ApiError`, `raw`, `refresh`, `restore`, `request`, `json`, and `logout` were **not** edited.
- Preserves the existing public `WA.api` and `WA.session` exports.
- New reader accepts `{error:{message:'…',code:'…'}}` without rendering `[object Object]`.
- Existing flat `{error:'…',code:'…'}` and `{message:'…'}` contracts remain valid. Explicit top-level message/code take precedence. Missing/non-JSON body uses `HTTP <status>` fallback. Structured object with no valid message also uses fallback.
- No transport, token-storage, authentication, refresh, replay, cache, request method, or credential changes.

## 3. Dependency and consumer safety

- Central `server.js` emits nested `{error:{message}}` for forwarded errors; this fix parses that existing contract rather than changing server responses.
- Existing route response envelopes remain mixed and are not migrated in this change.
- This `waPlatform.js` file includes the existing comment that it is a candidate, not yet loaded by WA pages. The correction **does not** authorize enabling it on pages or implementing new integrations.
- Code path is executed when `WA.api.json`, refresh-session error handling, or logout error handling reads a failed HTTP response.
- `WA.api.request` continues returning the raw response to its callers; it does not itself parse errors.

## 4. Executed checks and reproducibility

Environment: Node.js v22.16.0, local isolated files only, no network, MySQL, Render or app startup.

- Reproduction on verified original: `node --test tests/stage6.r16-75.t09.offline.test.js` → **8 pass, 2 fail** (nested error cases).
- Corrected source: `node --test tests/waPlatform.unit.test.js tests/stage6.r16-75.t09.offline.test.js tests/stage6.r16-75.t09.additional-regression.offline.test.js` → **36 pass, 0 fail**.
- Component breakdown: 19 pre-existing session/auth unit tests + 10 original T09 compatibility tests + 7 supplementary regression tests.
- Node `--check` syntax checks passed for corrected source and supplementary test.
- Logs: `docs/WA_R16-75_T09_Original_Baseline_Test_2026-11-14.tap` and `docs/WA_R16-75_T09_Corrected_Combined_Tests_2026-11-14.tap`.
- These are bounded VM/browser-facade tests; no actual browser or hosted HTTP integration was performed.

## 5. Security and regression constraints

- Session token validation, same-origin checks, Authorization header override prevention, browser lock and refresh flow unchanged.
- Existing unit tests cover session restoration, 401 GET controlled retry, 403 no rotation, POST no automatic replay, logout failure handling, and other session safeguards.
- New tests assert: nested error message/code, missing nested message fallback, top-level precedence, 401 GET one refresh and retry, rejected POST never replayed, 403 no refresh, and off-origin request rejection.
- Ensure no secret information is present in *server-provided* safe error messages; this patch is a shape parser, not a data-classification or sanitization boundary.

## 6. Installation and rollback

1. Review this report and `change/waPlatform.js.diff`.
2. Verify local original `httpdocs/js/waPlatform.js` SHA-256 equals `e88dd8f9afff24e4a7b16e107619ba36fd8d01f3dd3a9ba284600aecf35304a5` before installation. **Do not overwrite any differing local source.**
3. Owner installs full replacement `httpdocs/js/waPlatform.js` into isolated WA test project only. Do not deploy to production or `main`.
4. Install new `tests/stage6.r16-75.t09.additional-regression.offline.test.js` and ensure original T09 and existing unit tests are present (both provided in package; **identical original test files, not source revisions**).
5. Install change/ and docs/ evidence in their included destinations. Keep checksum manifest in `change/`.
6. Execute offline regression commands from WA project root with existing Node.js runtime, then perform separately authorized integrated browser/hosted tests if/when appropriate.
7. Rollback by restoring the verified original `httpdocs/js/waPlatform.js` (the version whose SHA-256 is listed above); do not use a guessed prior version. Repeat applicable regression after rollback. No database migration or schema rollback applies.

**Scope restrictions:** User-controlled installation; do not alter Google Drive, GitHub, local WA project files, Render, database, or production from assistant tools.
