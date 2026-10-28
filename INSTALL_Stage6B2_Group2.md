# WA Stage 6B-2 Group 2 — TEST ONLY

Scope: `reviseLogIn`, local `.env.test`, `sql5838929`. Never push, sync, merge, or deploy here.

## Why a guarded local patch rather than replacement HTML files?
Current Google Drive is a reference, but the local Group 0a commit `d91d76b` is definitive; the snapshot mounted for authoring had an earlier login.html without the Keep Me Logged In checkbox. The patch retains the ACTUAL local login and home source, refuses to proceed when anchors differ, and creates backups. It does not intentionally touch layouts, styles, or the checkbox payload. Review its source before running.

## Files
- `httpdocs/js/waPlatform.js`: Group 1A + expired-remembered-session logout refresh fix
- `tests/waPlatform.unit.test.js`: updated and expanded tests
- `apply-group2.ps1`: guarded local Home/Login patcher (run only after inspection)

## Installation
1. Verify clean baseline and back up: `git branch --show-current`, `git status --short`.
2. Copy the two JavaScript files to corresponding WA paths. Existing Group 1A files will be replaced.
3. Run: `node --check httpdocs/js/waPlatform.js` and `node --test tests/waPlatform.unit.test.js`.
4. Inspect `apply-group2.ps1`; then from project root `powershell -NoProfile -ExecutionPolicy Bypass -File .\apply-group2.ps1`.
5. Inspect `git diff -- httpdocs/home.html httpdocs/login.html` and verify checkbox payload, modal functions, admin/usage logic, and logout changes. Do NOT continue on surprising diffs.
6. Run local server using `node --env-file=.env.test server.js` and only test on disposable TEST account. Use Chrome devtools Network for `/users/session-status`, `/users/refresh-session`, `/users/logout`. Test remembered yes/no, refresh, restart, two tabs, offline logout, permissions, subscriptions. Do NOT test against production.

## Remaining / deliberate limitations
- Existing Home inline direct calls have not all been migrated to `WA.api`; this group is the first integration only.
- If backend logout cannot be confirmed (including expired ordinary session, network outage), local browser is cleared but server session might remain active until expiry. The UI reports this accurately.
- Chrome multi-tab test with real network and MySQL remains mandatory. Web Locks unsupported -> remembered refresh fails closed.
- Home still exposes several legacy localStorage and direct fetch calls; later groups replace them systematically.
- Review `sw.js` caching to ensure it never serves stale platform JS during testing.
- Never run blanket `node --test tests/*.js` against a real database.

## Rollback
Stop test server. Restore `httpdocs/home.html.group2-before` and `httpdocs/login.html.group2-before`. Restore Group 1A versions of platform and test scripts. No SQL rollback needed.
