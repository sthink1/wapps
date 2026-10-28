# WA Stage 6B — Test #9D and #8B plan (local test only)

Date: 2026-10-24. Branch: `reviseLogIn`. Server: `http://localhost:8080`, started with `.env.test`; **confirm `WA_ENV=local; test DB verified`**. No production changes. No SQL schema changes. No JWT signing-key, authentication-expiry, or application-code changes.

## Test #9D: Coordinated browser restore attempt

**Required browser mode: Chrome Normal (non-Incognito).** This test uses two tabs in one normal Chrome profile, logged in as `charter`, with Keep Me Logged In selected. All testing should use **only the local test server**.

1. In *both* tabs, navigate to `http://localhost:8080/home.html`. Confirm `Logged in as: charter`.
2. In *both* tabs, open F12 > Network. Check **Preserve log**. In each tab, open Console and paste the entire `Stage6_Test9D_Console_Arm.js` code, pressing Enter. Check that both consoles say `READY`. You can leave Developer Tools on Console afterward.
3. In **one tab only**, enter `__waS6test9D.start()` and press Enter. It removes **only** `localStorage.token`, then sends a BroadcastChannel start signal to both tabs and starts a 4-second countdown. **Do not reload, close a tab, or click Logout during the countdown or test.**
4. Wait until *both* tabs print `START` and `END`. Note whether the two `START` timestamps differ by less than ~100 ms (not guaranteed; report the actual difference). Both should say `authenticated=true`.
5. Inspect Network in both tabs. Count `/users/refresh-session` requests and note HTTP status codes. **Expected: one HTTP 200 refresh total, and no refresh replay 401**; if a second request occurs, stop and report it. The second tab may not show `session-status` because its test `restore()` began without a token.
6. Reload both tabs *after the test completes* and confirm both show `Logged in as: charter`. Do not click Logout until results are recorded.
7. Share only timestamps, `authenticated` booleans, and request status codes. Never share JWTs, Cookie headers, response bodies, or Authorization headers.

**Interpretation:** Two near-simultaneous `START` timestamps establish concurrent **restore calls**, not necessarily simultaneous outbound refresh HTTP requests (those should be serialized by Web Locks). A single refresh and two successful restorations support correct cross-tab rotation coordination. If the two starts are not close, report the test as inconclusive and do not claim real concurrency was demonstrated. Timing may vary if Chrome throttles a background tab. Network logging may show incidental requests.

**Cleanup:** The snippet exists only in DevTools tab memory and disappears on reload. It does not create or modify any application files. Its BroadcastChannel closes when the tab unloads. If redoing the test, reload both pages first, re-arm both, and then trigger once.

## Test #8B: Actually expired access JWT

The 19/19 Node tests already cover the expired-token branch and nonreplay policy. Test #8A proved *missing-token* recovery in real Chrome, **not genuine expiry**. Test #9D likewise removes the token; it does not prove expiry.

**Recommended safe real-browser method:** Use a remembered login session that is naturally older than the 8-hour access-token TTL while still within its server refresh lifetime. In **Chrome Normal**, with KMLI checked, close Chrome without logging out, and after the access JWT has actually expired reopen `home.html`, using Network > Preserve log to observe `/users/refresh-session` HTTP 200 and the signed-in Home state. This can be done on a later day; no need to leave the server or browser running continuously. Note that restarting the local server might affect unrelated in-memory controls; ensure the same `.env.test` test environment and stable test secrets.

Do **not** edit or forge a JWT, change expiry configuration, set browser clocks, tamper with refresh cookies, or modify MySQL rows to simulate expiry. If timing-based browser verification is impractical, record #8B as *automated-pass, browser-pending* rather than claiming it passed in Chrome.

## Outstanding / follow-up

- #9D: synchronized browser restore attempt, pending execution and evidence.
- #8B: naturally expired access JWT, browser pending; automated coverage passed.
- Diagnostic Console tracking currently logs an object with `token`: open security concern. Do not share values, and remove token from logging in a separate reviewed code change.
- Record results and evidence in `docs/Stage6_OpenItems.md` after running each test; no IDs should be closed merely because this plan exists.
