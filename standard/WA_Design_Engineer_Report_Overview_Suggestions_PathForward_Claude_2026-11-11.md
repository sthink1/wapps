# Wonderful Apps: Design Engineer Report
## Overview, Suggestions and Path Forward

**Author:** Claude, acting as design engineer
**Date:** November 11, 2026
**Status:** DRAFT FOR DISCUSSION. This report is not a standard, not an approval, and not authorization to change anything.
**Change control:** This is the only file created. No existing Drive file, source file, database, GitHub repository or deployment was modified. Every change proposed below needs your explicit agreement first.

---

## 0. Scope, method and honesty limits

**What I read (in full):** `README_Design_Engineer_Review.md`; reports B0, B1, B2, B3, B4, B6, B8; the v0.3 specification (B9); `TechSummary.md`.

**What I read in the current Drive source (not just the pinned GitHub commit `b5e2b06`):** `server.js`, `services/administratorAccess.js`, `middleware/subscriptionAccess.js`, `services/stage6ExpectedClientError.js`, `httpdocs/js/waPlatform.js`, `routes/geocode.js`.

**What I did not do:**
- I did not read B5 or B7 (earlier drafts superseded by v0.3).
- I did not read `CLAUDE.md` directly; I relied on how the reports quote it.
- I located but did not read `sw.js` or `middleware/auth.js`.
- I did not read the individual route files other than `geocode.js`, so ownership checks inside routes are not independently confirmed here.
- I ran nothing, so every statement below is static reading. Nothing is a test result.

**Evidence labels used below:** **[V]** I verified it in current Drive source. **[R]** it comes from the IT reports and I did not re-verify it. **[I]** it is my inference. **[?]** it needs checking before anyone relies on it.

---

## 1. Overview

### 1.1 Where the project stands

Your IT person has produced a rigorous body of work: a source-pinned audit (B0–B4), two review rounds (B6, B8) and a 28-clause draft standard (v0.3). Its discipline is the main strength. It separates documented rule, observed code and proposed rule, it refuses to turn bounded test passes into certifications, and it keeps the approved administrator rule (`WA-SEC-ADMIN-001`) apart from open decisions.

My independent reading agrees with the central technical findings:

| Finding | My result |
|---|---|
| Central Express error handler returns `err.message` for any 4xx | **[V] Confirmed** in the current Drive `server.js`, which was modified Nov 9, after the pinned era. Same behavior as `b5e2b06`. |
| `WA.api` mis-parses the central handler's nested error shape | **[V] Confirmed by reading.** `readError` uses `data.message \|\| data.error`. When `error` is an object, the resulting message and code become `[object Object]`-style values. IT labeled the user-visible impact "untested", but JavaScript semantics make it near-certain. |
| Administrator rule in code matches `WA-SEC-ADMIN-001` | **[V] Confirmed.** The check requires `IsAdministrator=1` **and** the configured username, read from the database, and it fails closed on DB error. |
| `TechSummary.md` §6.7 is stale on administrators | **[V] Confirmed.** It still describes `UserID===1` or a JWT-username match. |
| Expected-error marker exists but the central handler does not use it | **[V] Confirmed.** `stage6ExpectedClientError.js` exists (modified Nov 10) and `server.js` does not call it. |
| `waPlatform.js` header comment says no page loads it yet | **[V] Stale.** B3/B4 show several pages load it. |

### 1.2 My overall assessment

1. **The technical diagnosis is sound and the open defect is small.** The most important open item (R16-75, the 4xx disclosure) is a few lines in one function. It has been paused while a very large standard was drafted around it.
2. **The standard is more thorough than a small team can enforce.** v0.3 is about 60 KB, with 28 clauses plus annexes. A standard nobody can hold in their head stops working as a day-to-day control. It needs a short enforceable core (see S9).
3. **The decision backlog, not the analysis, is now the bottleneck.** Seven audit steps are complete and nearly all of the remaining open items are decisions, not investigations. That is why §5 is organized as a decision sequence.
4. **A few real risks sit outside the specification.** They are in §3. Two are on public, unauthenticated endpoints.

---

## 2. What the specification gets right (keep these)

- **Provenance discipline:** documented, observed, tested and approved stay separate fields.
- **No false certification:** bounded R10/R14/R15 results are never stretched.
- **Legitimate exceptions respected:** public email-token flows, Family Tree privacy, native TNNA and uploads are not forced into web-session middleware.
- **Safety invariant independent of mechanism:** "status 4xx alone never makes an error displayable" is correct and can be adopted now.
- **Retry rule:** no automatic replay of mutations is exactly right for billing and finance-style data.
- **Authorization layering:** authentication, entitlement, admin and row ownership are separate layers, with the explicit note that a subscription is not an ownership check.

---

## 3. Findings from my source review

### F1. Error handler: confirmed, and a minimal fix is available **[V]**

The final handler in `server.js` returns the raw message for any error carrying a 4xx status. The marker module (a `WeakSet`) is already written and is **sound for this purpose**: it cannot be forged from JSON, request bodies or object properties, and it is process-local. That answers most of DEC-03 (see S1).

Related observation: the 404 fallback emits `{ error: 'Endpoint not found' }` while the central handler emits `{ error: { message } }`. That is a fourth envelope shape inside the same file.

### F2. `WA.api` error parsing **[V]**

`readError` builds the message from `data.message || data.error` and the code from `data.code || data.error`. This breaks on the shape the central handler produces. Because this is client-side and a pure tolerance fix (accept a string or an object), it is the lowest-risk change in the whole program and should come first (S2).

Smaller items in the same file **[V]**:
- `tokenExpired` trusts the browser clock with no skew tolerance. A wrong device clock could cause repeated refresh attempts or early expiry.
- The "Candidate only" header comment is stale.

### F3. Public, unauthenticated endpoints outside the specification's focus

**F3a. `GET /api/geocode/reverse` [V].** It has no authentication. IT recorded this as an intentional "cost-model deferral" (B3-11). But cost is not the only concern:
- `lat` and `lon` come straight from the query string and are concatenated into the upstream URL with no numeric validation. A value containing `&` can inject extra Nominatim parameters.
- The `timeout: 8000` option has no effect on Node's built-in `fetch`. A stalled upstream will hold the request open. An `AbortSignal.timeout(...)` is the working mechanism.
- There is no caching and no rate limit. Nominatim's usage policy limits anonymous bulk use. Anyone can drive traffic through your server under your identifying User-Agent and get it blocked.
- The host is fixed, so this is not SSRF, and the error path correctly omits details.

**F3b. `POST /send-email` [V for existence, ? for controls].** My reading of `server.js` is that this public route is mounted directly there and I saw no limiter in that file. Please have IT confirm whether a limiter exists elsewhere. If not, an unauthenticated mail relay-style endpoint can be abused. It also returns 400 on provider failure, which is a server-side failure and probably should not be a 4xx.

### F4. Missing browser security headers **[V for server.js, ? for hosting layer]**

I saw no security-header middleware (no `helmet`-style headers, no CSP) in `server.js`. This matters because the access token lives in `localStorage` (DEC-09, S6-028), and a strict CSP is the main compensating control against token theft via XSS. Headers may be set by the hosting layer, which I cannot see. Note also that the project's own HTML formatting rule leads to a lot of inline script, which makes a strict CSP harder (see S6).

### F5. Static asset caching and version skew **[V for the pattern, ? for exact values]**

From `server.js`, JavaScript is served with a one-day max-age while HTML is not cached. That combination can serve new HTML with old JS, which is exactly the S6-024 / B6-08 concern. `sw.js` makes this more sensitive. I did not read `sw.js`, so I cannot say how the two interact.

### F6. Administrator path **[V]**

The rule itself is correct and fails closed. Two engineering notes, neither a security flaw:
- `requireAppAccess` does an extra database lookup for the administrator check **on every protected request for every user**, including non-admins. That costs a query per request.
- The admin override bypasses entitlement for all apps. That matches the approved design, but it is worth stating explicitly in the standard.

### F7. Hygiene items **[V]**

- `subscriptionAccess.js` has an unused `jwt` import and a `require` inside a function.
- CORS allowed-methods in `server.js` omit `PATCH`, while the specification discusses PATCH. If a PATCH route exists it would fail cross-origin; if none exists, remove PATCH from the spec's wording.
- `/send-email` aside, `express.json()` has no explicit size limit (the default is 100 KB, which is fine, but state it).

### F8. Platform versions **[? needs checking]**

An older design review in your Drive mentions Node 24, Express 5 and MySQL 5.5. If the database really is MySQL 5.5, it has been end-of-life for years. It may be MariaDB or a hosted variant. Please confirm. Express 5 is a positive: async handler errors reach the central handler automatically.

---

## 4. Suggestions

### S1. Resolve the error-classifier mechanism (closes DEC-03, unblocks R16-75)

Adopt the existing `WeakSet` marker, with a small factory such as `expectedError(status, message, code)` that creates the error and marks it. Rule for the central handler:

- Marked error: return its status and its approved message.
- Unmarked error: never return `err.message`, whatever the status.
  - Keep the status class (4xx stays 4xx) only if you want status preservation, with a generic message.
  - Otherwise return 500.
- Log `err.name` and code server-side. Do not log raw messages that could contain tokens or SQL.

*Illustration only (not applied anywhere):*

```js
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (isExpectedClientError(err)) {
    return res.status(status).json({ error: err.message, code: err.code });
  }
  console.error('Unexpected request error', { name: err.name, status, method: req.method, path: req.path });
  const generic = status >= 500 ? 'Internal Server Error' : 'Request could not be processed';
  return res.status(status).json({ error: generic });
});
```

### S2. Fix the client parser first, then choose the envelope (DEC-02)

Make `readError` tolerant: accept `data.error` as a string **or** an object with `message`/`code`. This is client-only, additive and safe for every producer. After that, there are two envelope options:

- **Option A (recommended): flat strings, additive.** The central handler emits `{ error: '<string>', code: '<string>' }`. It matches the shape most routes already use and what `WA.api` already reads. Existing consumers keep working.
- **Option B: nested and versioned.** `{ error: { code, message } }` everywhere. Cleaner long term, but it touches every producer and consumer.

**Precondition for A:** a repository search for any consumer that reads `error.message` from central-handler responses. I have not done that search.

### S3. Replace the stale administrator wording (closes the B6-02 / B8-10 documentation drift)

Proposed replacement for `TechSummary.md` §6.7 is in Appendix B. It is review-only and I have not installed it.

### S4. Decide the browser baseline for Web Locks (DEC-05)

Web Locks is supported in all current mainstream browsers. Document a minimum-browser baseline, keep the current fail-closed behavior and add a human-readable "please reload or update your browser" message. Do not build a lock-free fallback, because that could allow refresh-token races.

### S5. Treat `WA.api` adoption as "migrate on touch", not a mass migration

Do not mass-migrate `BinForm`, `etfCompare` and `FTPerson`. Add a compatibility test harness first, then move each page when it is next edited. Preserve the Family Tree `window.fetch` wrapper and `X-FT-Page-Token` behavior exactly. Adoption means calling `WA.api`, not merely loading the script.

### S6. Make the localStorage-token risk an explicit decision (DEC-09)

Record "accepted, transitional" with compensating controls. Stage it in this order:
1. Ship baseline headers (`X-Content-Type-Options`, `Referrer-Policy`, frame protection).
2. Introduce CSP in **report-only** mode and inventory the inline scripts it flags.
3. Tighten later with nonces or hashes.

Also confirm the access-token lifetime (I did not verify it), because a short lifetime is itself a mitigation.

### S7. Harden geocode and send-email minimally

Neither change needs a subscription or pricing decision:
- Geocode: validate `lat`/`lon` as bounded numbers, use `AbortSignal.timeout`, add a small in-memory cache and a per-IP rate limit.
- Send-email: confirm a rate limit and a size limit exist, and return 5xx for provider failures.

### S8. Cache policy for scripts

Pick one deployment unit for HTML, JS and `sw.js`: versioned filenames or query strings, or short max-age for scripts. This removes the skew class of bugs rather than testing around it.

### S9. Add a short enforceable core on top of v0.3

Keep v0.3 as the reference document. Add a 2–3 page "Core" containing only the invariants a programmer must remember at edit time (about 10 rules). For example: every route has a declared access class; ownership checks use `req.user.userId`; no `err.message` from unmarked errors; no mutation replay; no secrets in logs or URLs; HTML stays pretty-formatted. Everything else lives in the annexes.

### S10. Generate the endpoint registry instead of hand-writing it

Hand-built route inventories go stale and cannot cover dynamically generated routes such as `budget.js`. A small read-only script that walks the Express router stack at test time can emit the registry (method, path, middleware names). That closes the B8-05 gap and can fail CI when a new route has no declared access class.

### S11. Start with a small executable test set

Convert the best-defined cases from B8 into real tests first: `ERR-T04`, `API-T03`, `ADMIN-T02`, `ADMIN-T03`, `ADMIN-T09`, `SESSION-T07`. They run in-process with mocked DB, so no staging data is touched.

### S12. Keep the formatting rule and its review hazard together

The whole-file HTML formatting rule (TechSummary §14) buries behavioral diffs inside formatting diffs. Keep the rule, but require formatting-only edits to be a separate step from behavioral edits.

---

## 5. Path forward

Every phase needs your approval before it starts. Nothing here begins automatically.

### Phase 0: Decisions (no code, no file changes)

| # | Decision | My recommendation | Why first |
|---|---|---|---|
| 1 | Error classifier (DEC-03) | `WeakSet` marker plus factory (S1) | Unblocks R16-75 |
| 2 | Envelope (DEC-02) | Option A, flat strings, after the consumer search | Unblocks the parser and handler work |
| 3 | Accept the safe-output invariant as adopted now | Yes, independent of #2 | Costs nothing, closes the policy gap |
| 4 | Browser baseline (DEC-05) | Document modern-browser minimum (S4) | Removes a standing ambiguity |
| 5 | localStorage token (DEC-09) | Accept as transitional, stage headers/CSP (S6) | Lets security work be scheduled |
| 6 | Document form | Add the short Core (S9), keep v0.3 as reference | Makes the standard usable |

### Phase 1: Documentation only

Install the corrected administrator wording (Appendix B), adopt the Core, and fix stale comments such as the `waPlatform.js` header. Each is a one-file edit that you approve individually.

### Phase 2: Test scaffolding in isolation

Add the S10 registry script and the S11 test set as **new files only**, with no changes to existing source. Run them against pinned and current Drive code and compare results.

### Phase 3: Smallest code changes, one per release

1. Tolerant `readError` (client-only, additive).
2. Central handler per S1/S2. This is R16-75 un-paused.
3. Geocode and send-email hardening (S7).

For each: a written rollback, the isolated tests first, then staging, and nothing batched.

### Phase 4: Adoption and hardening

Migrate-on-touch for `BinForm`, `etfCompare` and `FTPerson`. Baseline headers, then CSP report-only. Script cache policy (S8).

### Phase 5: Steady state

Registry check in CI, a pull-request checklist built from the Core, and the independent design-engineer review gate before any production step.

---

## 6. Questions for you now

1. Do you agree to resolve decisions 1–3 in Phase 0 this week?
2. Can IT run the repository search for consumers that read `error.message` from central-handler responses? It determines Option A versus B.
3. Is there a rate limiter on `/send-email` and on login anywhere outside `server.js`?
4. What is the actual database engine and version, and the access-token lifetime?
5. Do you want me to draft the Core (S9) and the Appendix B text as separate files for review? I will not create them without your go-ahead.

---

## Appendix A: Evidence table

| File (Drive) | What I verified | Notes |
|---|---|---|
| `server.js` (modified Nov 9) | Central 4xx handler returns `err.message`; 404 shape differs; no security-header middleware; CORS methods; `/send-email` mounted here | Same handler behavior as pinned commit |
| `services/administratorAccess.js` | DB `IsAdministrator=1` AND configured username; fails closed | Matches `WA-SEC-ADMIN-001` |
| `middleware/subscriptionAccess.js` | Admin override; per-request admin DB lookup; unused import | Hygiene only |
| `services/stage6ExpectedClientError.js` (modified Nov 10) | `WeakSet` marker | Not used by central handler |
| `httpdocs/js/waPlatform.js` (modified Nov 8) | `readError` parsing defect; clock-skew handling; stale header comment | Client-only fix |
| `routes/geocode.js` (modified Oct 30) | Unauthenticated; unvalidated query values; ineffective `timeout`; no cache or limiter | |

## Appendix B: Proposed replacement wording for `TechSummary.md` §6.7 (review only, not installed)

> **Administrator recognition.** A request is treated as administrator only when the server verifies, from the database at request time, that the authenticated account's `UsersT.IsAdministrator` is `1` **and** its current user name matches the configured `ADMIN_USERNAME` (normalized comparison), using `services/administratorAccess.js`. Neither a hard-coded `UserID`, nor a username claim in the JWT alone, nor anything rendered in the UI confers administrator rights. If the verification cannot be completed, access is denied. An administrator override applies to app-subscription entitlement only; it does not bypass row ownership or Family Tree privacy controls.

---
*End of report. No source, documentation or deployment was changed in producing it.*
