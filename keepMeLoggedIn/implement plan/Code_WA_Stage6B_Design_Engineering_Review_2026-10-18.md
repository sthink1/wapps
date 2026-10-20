# Wonderful Apps — Stage 6B design engineering review and recommendations

**Prepared:** October 18, 2026  
**Role:** Project design engineer  
**Observed local branch:** `reviseLogin`  
**Local HEAD:** `c3a1233b26dd77ac6b637799b15824c6f810ed5d`  
**Scope:** Review of all seven Markdown documents in `keepMeLoggedIn/` and `implement plan/`, supplemented by targeted, read-only local source inspection.  
**Disposition:** Proceed with a corrected Stage 6B design and staged implementation. Resolve the High findings below before accepting the integrated authentication feature. This is an implementation-stage review; the later independent final review remains required.

## 1. Engineering assessment

The project has moved in the right architectural direction since the October 14 reviews. The current backend has a separate browser session for checked and unchecked logins, short access JWTs, hashed refresh credentials, database-backed revocation, and transactional password changes. These choices address the earlier concern that clearing browser storage or revoking refresh tokens alone would leave existing eight-hour access JWTs usable.

However, “Stage 6A functional safeguards passed” is a report about particular tests, not proof that every authentication lifecycle is correct. Local inspection identifies unresolved backend behavior that browser integration alone will not repair: pending verification challenges survive password changes, logout cannot revoke through a refresh cookie when the access JWT has expired, and full login clears/replaces the cookie without revoking the older browser session. These corrections belong in the Stage 6 work, before broad page changes.

I endorse the latest proposal for an explicit shared browser helper and inventory-driven integration. Keep access JWTs in the existing `localStorage.token` interface for this release, retain refresh secrets exclusively in HttpOnly cookies, and preserve all existing business, subscription, administration, and Family Tree privacy rules. A memory-only access-token migration would materially enlarge this task and complicate nonremembered sessions across page navigations.

Do not revive the earlier experimental ZIP, the universal bounce-through-Login design, or a blanket replacement of approximately 63 pages. The appropriate scope is the smallest set of changes that actually supports startup restoration and in-page renewal across the affected applications.

## 2. Materials, evidence, and limits

### Documents reviewed

| Document | Contribution and current interpretation |
|---|---|
| [Original technical summary](Tech_Summary_KeepSignedIn_Project_with_Initial_Attempts.md) | Establishes the two original features and strict non-regression requirements; its installed-experiment description is historical. |
| [C engineer review](Cl_WA_tech_response_Design_Engineer_Review.md) | Valuable narrow-change approach; its assumptions about uniform Login redirects and deferred access revocation are unsuitable as the final project-wide design. |
| [P engineer review](P_WA_KeepSignedIn_ChangePassword_Design_Engineering_Review.md) | Strong session/revocation, concurrency, failure, and release-gate framework; detailed proposals were not executable-code findings. |
| [Earlier Cod recommendations](Cod_WA_Design_Engineer_Recommendations.md) | Source-informed reconciliation of the first two reviews; identified inconsistent token consumers and challenge/version races. |
| [Three-review synthesis](implement%20plan/WA_keepMeSignedIn_Three_Engineering_Reviews_Synthesis.md) | Corrects the earlier baseline history and separates proposals from decisions. Its preimplementation branch description is now historical. |
| [Stage 6 handoff](implement%20plan/WA_Stage6_Handoff.md) | Records later decisions, expanded reset-password scope, local test outcomes, staging isolation, and the mandatory final review gate. |
| [Stage 6B technical review request](implement%20plan/WA_Stage6B_Design_Engineer_Technical_Review_2026-10-18.md) | Current design questions, preliminary browser inventory, integration groups, and remaining hosted checks. Section 6 below answers its nine questions. |

### Additional local evidence

I inspected the authentication portions of `routes/users.js` and `routes/tnna.js`; `services/browserSession.js`, `services/verifyAccessToken.js`, reset limiter and cleanup services; both authentication middleware files; server routing/CORS/static handling; login, relevant home and reset-page code; the service worker; Family Tree fetch integration; route authentication declarations for subscriptions, notifications, and tracking; test inventory and the password-safety test; and selected schema definitions in the local SQL dumps. This is targeted inspection, not a completed whole-project endpoint or business-authorization audit.

No application server was started, tests replayed, database connected to, email sent, Render service created, Drive original fetched, or production resource changed. Historical test passes and hosted/phone observations remain attributed to the handoff. Local source findings below are static findings, not reproduced exploits. The two local SQL dumps are snapshots, not evidence of installed live schema; their contents were not copied into this report.

The documents identify current Google Drive files as the authoritative project reference. I have not established that these local files match those versions. Record raw-file hashes and reconcile versions before implementing these findings or issuing a final source-based signoff.

### Reconciliation required

- Git reports **`reviseLogin`**, whereas several documents insist on `reviseLogIn`. Use the observed name for local work and verify the exact remote branch selected by any future test service. Do not create or rename a branch merely to match prose.
- The working tree contains modified backend files, untracked Stage 6 services/tests, backup/copy files, and the folder rename from `keepMeSignedIn/`. HEAD alone does not identify the reviewed implementation. Preserve this work and capture a candidate manifest of tracked and untracked deliverables.
- The latest review reports 63 top-level HTML pages; this local directory currently contains **64** and 21 shared JavaScript files, including a reset-page copy. Reconcile deployment files versus backups before treating any inventory count as final.
- The original two-feature scope has expanded in the handoff to include Forgot/Reset Password, notification, and account-wide TNNA online revocation. Treat these as handoff-recorded scope, without claiming the October 14 reviews originally approved them.
- The handoff records 180-day sliding/365-day absolute lifetimes and account-wide online revocation as agreed. Do not repeatedly reopen these as fresh approval questions unless contradictory owner instructions emerge. Password whitespace, rollout compatibility, and refresh recovery still need precise records.

## 3. Findings by severity

Severity expresses likely impact on this feature and its acceptance. **No Critical finding is established by this review.** “Confirmed” means visible in inspected local source; “risk” means additional execution or deployment evidence is needed. High items block feature acceptance, not preparation of this review.

| ID | Severity / evidence | Finding and required resolution | Acceptance criterion |
|---|---|---|---|
| DE6-01 | **High — confirmed** | Pending email verification challenges are not invalidated or bound to credential version on password change/reset. A previously established challenge can mint credentials using the new current version. Bind challenge creation and consumption to credential state for both web and TNNA. | Challenges created before a successful password change/reset fail afterward on both verification endpoints, including concurrent execution. |
| DE6-02 | **High — confirmed** | `/users/logout` requires `auth`; an expired access JWT prevents revocation even with a valid refresh cookie. Add cookie-based current-session revocation with request defenses, alongside validated web Bearer logout. | An expired-JWT remembered browser can log out without refreshing first; no subsequent restore succeeds; another device remains signed in. |
| DE6-03 | **High — confirmed** | `/users/verify-code` creates a new session and sets/clears its cookie, but does not revoke the old browser session represented by the incoming cookie. Clearing the cookie does not invalidate a copied old refresh secret. | A checked login followed by an unchecked or different-account verified login revokes the superseded session; failed verification leaves it intact. |
| DE6-04 | **High — confirmed** | Authenticated password change does not revoke outstanding password-reset links. `revokeAll()` updates only web sessions, TNNA refresh rows, and SecurityVersion; reset consumption does not check version. Invalidate earlier reset authorization on credential change. | A reset link issued before Change Password is unusable afterward; a newly requested link works; races cannot preserve stale authorization. |
| DE6-05 | **High — confirmed gap, concurrency risk** | Refresh reuse is rejected, but does **not** revoke the recognized session family. There is also no browser coordinator yet. Define rejection versus theft-response semantics and implement coordinated refresh before page rollout. | Concurrent cooperating tabs do not compete; approved recognized-reuse policy is enforced on the family; random tokens cannot revoke other sessions. |
| DE6-06 | **High — confirmed** | Existing browser pages do not implement the proposed shared restoration lifecycle; login does not send `keepMeLoggedIn`, and home logout only removes the JWT. Change Password UI/shared helper are absent from the inspected paths. | End-to-end checked/unchecked login, direct page startup, in-page expiry, account navigation, and server logout pass without input loss. |
| DE6-07 | **High — confirmed** | Six-digit login codes still use `Math.random()`; no login, verification-code, or current-password attempt limiter is visible in `routes/users.js`. The reset limiter does not protect these operations. | Cryptographic code generation, bounded guesses, challenge exhaustion, and approved login/current-password throttling are tested, including restart/shared-instance behavior. |
| DE6-08 | **High — unresolved release dependency** | Legacy web/native JWTs lack required version/session structure. New verification rejects them. Native refresh can issue a versioned token, but actual installed-client recovery is unproved. | Approved cutover and rollback behavior demonstrated with a dedicated staging TNNA client and representative legacy credentials, without modifying installed production phones. |
| DE6-09 | **High before hosted testing — confirmed config gap** | Origin checks derive expected origin from request Host/protocol; CORS lacks credential support and the future test host; test guards prohibit production-mode execution in limiter/cleanup. | Explicit test environment/DB/origin allowlists fail closed; hosted HTTPS cookies, approved origins, and email isolation pass. |
| DE6-10 | **Medium — confirmed** | Wrong current password returns 401, indistinguishable by status from invalid session. Shared JWT verification also combines invalid/expired tokens in one code. Define actionable error codes before automatic refresh/retry. | Wrong current password leaves the valid session/form intact; revoked and malformed tokens do not trigger blind mutation retries; dependency failures remain recoverable. |
| DE6-11 | **Medium — confirmed behavior, capacity risk** | Global reset budget is exhaustible; blocked requests still increment/create limiter keys. Daily deletion of 3,000 old rows is not a bound on attacker-driven growth. | Measure key creation, rejected requests, oldest expired row and backlog; document overload behavior and verify a sustained-load cleanup plan. |
| DE6-12 | **Medium — confirmed evidence defect** | `tests/stage6a.password-safety.test.js:31` asserts obsolete in-memory-throttle comments that are absent from current routes. Historical passes cannot describe this exact suite unchanged. | Remove obsolete assertions and replace them with behavioral limiter tests; publish exact commands/results against the candidate manifest. |
| DE6-13 | **Medium — unresolved concurrency risk** | Issuance, refresh, reset, and revocation use different row-lock sequences; some credential-version reads are ordinary SELECTs. Join locking and transaction snapshots need proof, not assumptions. Bcrypt work is held inside password transactions. | Common lock order and credential rechecks documented; concurrent operations and deadlock/rollback tests prove no stale authorization escapes. |
| DE6-14 | **Low / informational — confirmed** | Shared verifier's introductory “NOT wired” comment is obsolete; copy files and document links/names can confuse packaging. | Correct stale comments/document references and issue an explicit package manifest excluding backups. |

### DE6-01: why challenge binding is necessary

`routes/users.js:196–240` validates the password and creates an unversioned `LoginVerificationT` challenge. Web verification at `routes/users.js:284–349` conditionally consumes it and then calls `sessions.create()`, which reads the **current** security version. Native verification at `routes/tnna.js:133–240` likewise reads the current version after consuming a challenge. Password change/reset calls `revokeAll()` but leaves those challenges untouched.

Consequently, someone retaining a valid pending challenge and its email code can complete verification after a password change, without submitting the new password. Atomic single consumption now protects the web double-submit path; it does not solve credential-state binding.

Record the credential version established when the password was checked, then require the same version while atomically consuming the challenge and issuing credentials. Coordinate challenge creation with password changes too: a login that checked an old hash must not insert a newly usable challenge after revocation. Web and native consumers share the challenge table, so review both. Deleting currently visible challenges alone leaves in-flight creation/consumption races.

### DE6-02 through DE6-04: complete invalidation, not only local cleanup

Source anchors: logout and password change in `routes/users.js:246–280`, verification issuance at `:324–337`, reset consumption at `:414–439`, and `services/browserSession.js:64–65`.

For logout, resolve the current browser session from a refresh hash, including retained consumed generations when needed to identify that same family, or from a validated web access token. Never accept a client-supplied user/session ID as authority. Require the agreed origin/CSRF defenses for the cookie-authorized path. Do not require refresh as a prerequisite to logout. Make repeated logout safe and clear the cookie consistently. Define behavior if cookie and Bearer identities disagree during account switching.

After successful full verification, revoke the incoming cookie's prior session and create the replacement in a coordinated transaction. An unchecked replacement creates only an eight-hour nonrefreshable session. The older account's other devices must remain unaffected. If an unchecked session has no cookie, use an explicitly authenticated current-session mechanism if superseding it is part of the agreed browser-switch policy.

On password change, invalidate outstanding reset links as well as access/refresh credentials and prior login challenges. Reset already consumes its own link and revokes other unused links; bring authenticated Change Password to an equivalent stale-reset-authorization guarantee. Do not accidentally delete a newly authorized post-change request because transaction ordering is undefined.

### DE6-05: distinguish replay rejection from family revocation

`services/browserSession.js:45–62` rejects a consumed token through the common `REFRESH_INVALID` branch, rolls back, and leaves its successor/session usable. This provides single-use rejection. It is **not** the stronger family-revocation response proposed in earlier reviews. The handoff's “replay rejected” test does not establish that stronger property.

Recommend strict single-use rotation and recognized-reuse family revocation after browser coordination is in place. Revocation must commit before returning rejection; throwing into a generic rollback path must not undo it. If the project deliberately chooses rejection-only behavior, record the theft-detection limitation and obtain explicit acceptance before release. Do not introduce a 30-second grace window implicitly.

## 4. Recommended design decision record

| Topic | Recommended disposition |
|---|---|
| Naming | User-facing “Keep Me Logged In”; request field `keepMeLoggedIn`; retain implemented `wa_refresh` cookie. Choose one helper name, preferably the proposed `waAuth.js`; do not ship competing helper APIs. |
| Access lifetime | Retain eight-hour JWTs, with server session/version checks. Near idle/absolute expiry, effective authorization ends at the earlier session boundary even if JWT `exp` is later. |
| Remember lifetime | Apply handoff-recorded 180-day sliding/365-day absolute limits. Specify renewal on successful foreground restoration/renewal, not hidden heartbeat polling. |
| Unchecked behavior | Eight-hour revocable session; no refresh credential. Browser restart may retain the access JWT until expiry, matching the existing storage interface. |
| Revocation | Current-browser logout; all-web and TNNA **online** credential invalidation on password change/reset as recorded in handoff. Include prior challenges/reset authorizations. |
| Storage | Retain `localStorage.token` for compatibility during Stage 6. Refresh secrets only in HttpOnly cookies; never in JSON, URLs, localStorage or broadcasts. |
| Refresh | Strict serialized rotation; no automatic repeated refresh after ambiguous network failure; separately document recognized-replay response. |
| Retry | At most one approved retry after a precise, pre-handler access-expiry rejection. Default mutations/uploads to no automatic replay. |
| Navigation | Explicit protected-page startup, current-token lookup per request, no automatic page reload. Allowlisted same-origin return URLs only. |
| Password rules | Preserve eight-character minimum and bcrypt cost 10. Reconcile registration trimming versus byte-preserving change/reset explicitly; do not silently sanitize passwords. |
| Extra password rules | Current code rejects a new password equal to the old one. Record its authorization and consistent UI behavior rather than presenting it as part of the original eight-character rule. |
| Source/version | Hash the reconciled candidate, including untracked files. Record baseline and proposed diffs before issuing complete revised files. |

Browser-readable JWTs remain exposed to successful same-origin script injection. HttpOnly refresh cookies reduce direct secret extraction but do not stop malicious scripts acting as the user. Preserve existing sanitization and safe rendering; plan CSP changes separately because current inline/CDN code requires compatibility work. This limitation follows the [OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

## 5. Shared browser contract

Use an explicit namespace and closure so page-level `BASE_URL` declarations cannot conflict. Loading the script must not replace `window.fetch`, reload the page, or start unrelated work.

| Interface | Required behavior |
|---|---|
| `restoreSession()` / `ensureSession()` | Resolve authenticated, signed out, or temporarily unavailable. Honor pending logout before restoring. Protected startup awaits this result. |
| `getAccessToken()` | Read the current token when needed; never return a stale captured token or construct `Bearer null`. JWT decoding is a scheduling hint, not server authorization. |
| `authenticatedFetch()` | Enforce explicit API-origin/path scope, preserve Request/init semantics and app headers, and implement the documented retry contract. |
| `refreshSession()` | Per-tab single flight plus browser-wide serialization; no-store responses; bounded failure behavior; refresh secret remains cookie-only. |
| `getSessionStatus()` | Authoritative identity/session validation for account controls; unavailable must not be shown as definitively signed out. |
| `logout()` | Block restoration locally, coordinate tabs/in-flight work, request server revocation, clear browser access state, and accurately report pending versus completed revocation. |

Public pages may render while checking. Hide/disable Change Password until authenticated validation completes; preserve the original requirement to place its navigation on authenticated home. Inspect the existing home grouping before adding a page/link; no broad menu redesign is needed. The new form must require current/new/confirmation values, Show controls, autocomplete attributes, and server validation. On success, notify tabs and require fresh password/email verification.

Keep the original verified-login confetti, success alert, 1.5-second delay, back/reset/show handlers, scripts, styles, and subscription-aware redirect. Silent restoration must not trigger interactive-login confetti. Refresh must never create or extend development trials.

## 6. Answers to the nine Stage 6B engineering questions

### 1. Explicit wrapper and Family Tree compatibility

**Yes, endorse `waAuth.authenticatedFetch()` over a new global interceptor.** `FTPrivacy.js:8` already captures `window.fetch` and adds `X-FT-Page-Token` using a string URL test. A helper that constructs a `Request` object or captures fetch before that wrapper installs could bypass the existing injection even without recursion.

Define one explicit integration seam for Family Tree page-token headers, using the existing privacy module's interface where appropriate. Preserve `Authorization`, `X-FT-Page-Token`, abort signals, multipart boundaries and upload behavior. Do not broadly refactor the privacy system. Test both script-loading orders, Request and URL inputs, public verification paths, and rejected foreign-origin requests. Do not pass arbitrary third-party URLs through a helper that attaches credentials.

### 2. Access-token storage

**Keep localStorage access tokens for Stage 6.** Memory-only tokens disappear on normal full-page navigation. Without a remembered refresh cookie, that would break the eight-hour unchecked session or demand another architecture. SessionStorage also changes cross-tab behavior. Revisit storage as separately scoped work after this feature stabilizes. Handle storage exceptions explicitly; if pending-logout state cannot persist, do not promise protection across browser restart.

### 3. Cross-tab refresh coordination

Use a single Promise within each tab and a named **Web Lock** shared by same-origin tabs. Acquire the lock, re-read shared state, skip renewal if another tab already provided a usable token, otherwise complete refresh and token publication before releasing it. Use storage events/BroadcastChannel for state notifications, not as proof of mutual exclusion. [Web Locks documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) describes origin-scoped locks and secure-context requirements.

Coordinate full verification, account switching, and logout with the same authentication lifecycle. Maintain a local generation/account identity; discard delayed responses after generation changes. This protects browser storage, while server revocation remains necessary because JavaScript cannot prevent a delayed Set-Cookie from arriving.

If locks are unavailable, use a separately proven coordinator or a documented full-login fallback rather than racing strict rotation. Test the actual browser/PWA baseline. A crashed tab, aborted refresh, or missing successor cookie may require full login. Hash-only storage cannot reconstruct the successor. Do not automatically repeat an uncertain refresh request.

### 4. Safe request retry

First refresh proactively when access expiry is known, before sending a mutation. Following an HTTP response, retry only for an explicit authentication-expiry code guaranteed to originate **before** handlers or side effects. The current combined `TOKEN_INVALID_OR_EXPIRED` code needs refinement if clients use that distinction.

Allow at most one retry for audited read-only operations with replayable inputs. Enable mutation retry only per audited endpoint where pre-mutation rejection and body replay are proved, or with an explicitly designed idempotency contract. Default POST/PUT/PATCH/DELETE, multipart uploads and streams to no automatic replay. Clone replayable Requests before their bodies are consumed. Do not retry network timeouts, uncertain password changes, ordinary 403s, 429s or 503s automatically. Preserve unsaved fields and explain uncertainty.

### 5. Logout when revocation fails

Set persistent logout-pending state and increment the browser auth generation before clearing access storage; notify other tabs and stop protected work. Request current-session revocation without first refreshing. On failure, retain the pending marker, block restoration, and tell the user that local sign-out completed while server sign-out is unconfirmed. Retry revocation when connectivity returns, ahead of restoration.

Do not erase the marker merely because an expired JWT produced 401. The corrected cookie-authorized endpoint must resolve this. The marker cannot revoke a copied credential or protect a browser after its storage is erased. Account switching requires a reviewed transition so a pending logout cannot later revoke the newly selected account accidentally.

### 6. Origin, CSRF, cookie and proxy sufficiency

**Current configuration is insufficient for hosted acceptance.** Replace Host-derived origin trust with an explicit configured browser-origin policy, aligned with credentialed CORS. Use JSON plus an enforced custom request header or an equivalent reviewed CSRF control on cookie-authorized operations, including logout and verification that sets/supersedes a cookie. Define missing/null Origin handling; preserve separate native token/body contracts. CORS alone does not prevent every state-changing request. These recommendations follow [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

Retain host-only `wa_refresh`, HttpOnly, SameSite=Lax and Path=/users. Require Secure for hosted HTTPS; clear with matching scope; cap cookie lifetime at remaining server authorization. Mark authentication success **and error** responses no-store. Prefer same-origin browser hosting. Cross-origin localhost development needs an explicitly approved port/origin and credential support; do not grant all native CORS origins cookie authorization automatically.

Configure proxy trust only from a verified deployment topology. Test actual `req.ip` resolution and forged forwarding headers; do not assume unconditional `trust proxy=true` or one fixed hop is safe. IP limiting remains supplementary until proved, and without correct proxy configuration multiple users may share the same apparent proxy IP.

### 7. Reset limits and maintenance capacity

**Not enough evidence for operational approval.** The global 100/hour budget can deny all users after an attacker uses it. Preserve generic responses, but distinguish delivery failures, rate denials, and infrastructure failures in redacted operational metrics. Choose overload and alert policies using measured traffic; do not solve this by merely removing all bounds.

The limiter inserts/increments email, IP and global keys even on rejection. Unique rejected addresses can therefore grow the table beyond the global mail budget. Record attempts, permitted/denied counts by scope, key-creation rate, table/index size, oldest expired row, cleanup duration/backlog, DB latency and email outcomes. Count session/refresh/reset history too: current inspected cleanup only maintains the rate table. Establish retention, indexes and bounded cleanup for other security tables without deleting replay evidence prematurely. Test sustained arrival rates and backlog recovery on MySQL 5.5.

### 8. Legacy sessions, TNNA and rollback

Record one approved web cutover strategy; the present verifier rejects legacy shape. Prefer a clearly communicated fresh website login rather than accepting unversioned credentials indefinitely. Installed native clients require separate proof: determine whether a legacy-access rejection causes them to use their stored refresh credential or destroys it. Backend ability to issue a new versioned token does not establish client recovery.

Use dedicated staging accounts/client configuration to prove online refresh, password revocation and offline/screen-off announcements. Do not redirect production phones or change their credentials. Server revocation cannot immediately stop disconnected local announcements. Requests already authorized before revocation may complete; define the boundary and revalidate security-sensitive mutations in their transactions.

Keep new security state through rollback. Reverting to the old stateless verifier can resurrect revoked but unexpired JWTs. Use a revocation-aware rollback build or maintenance mode; never restore old password hashes or drop security tables as routine rollback. Additive MySQL 5.5 DDL is not assumed transactionally reversible.

### 9. Additional evidence and approval boundaries

Before expanding browser revisions, demonstrate backend challenge/version binding, expired-access logout, supersession, stale-reset invalidation, refresh concurrency/replay policy, and durable attempt limits. Capture exact candidate hashes and test commands. Then accept browser groups only against the criteria below.

After all Stage 6 phases and separate hosted testing, obtain the required independent review of the complete candidate. This report cannot satisfy that later gate, and does not grant merge, migration, deployment or service-creation authorization.

## 7. Scope and implementation order

The latest page list is a useful starting inventory, not an instruction to edit every listed file. Produce one row per deployable file with current behavior, required change or no-change reason, relevant endpoints/scripts, regression cases, and status. Exclude `_COPY`/backup files from deployment unless deliberately selected; preserve them locally until the owner decides otherwise.

| Group | Files/areas | Exit evidence |
|---|---|---|
| **0 — Correct backend contracts** | `routes/users.js`, `routes/tnna.js`, browser-session/verifier services, necessary challenge/reset schema, auth middleware, relevant tests | DE6-01–05/07 corrected; common locking/error contracts; targeted HTTP and real-test-DB concurrency/rollback tests. No UI bulk changes yet. |
| **1 — Browser foundation** | New `httpdocs/js/waAuth.js`; login, home, subscription; new `changePassword.html`; narrowly required server/config updates | Original login preserved; checked/unchecked issuance; startup and in-place renewal; expired-token logout; offline pending logout; cross-tab/account-switch/lost-response behavior. |
| **2 — Account/admin** | Tracking, `SubControl.html`, notification preferences, forgot/reset page and account navigation | No privilege/subscription bypass; stable 401/403/503 behavior; password forms and reset lifecycle; no protected actions while state is unknown. |
| **3 — Application batches** | ETF; Budget; Family Tree/Networking; Weights/Activities/InterestEarned/property and remaining actual consumers | Each touched application's reads/writes/navigation pass; unsaved input survives renewal; uploads and privacy-page tokens preserved; public links still work. |
| **4 — Hosted/TNNA acceptance** | Isolated test configuration/service, test-client setup, service-worker/static update checks, operations/migration drafts | Real HTTPS/origin/cookie/proxy behavior, restart persistence, mail isolation, legacy/native recovery, offline announcements, quotas and security-preserving rollback demonstrated. |

The backend endpoint audit must trace authorization and ownership beyond router declarations. `subscriptions.js` uses router-wide web authentication; notifications/tracking use shared auth on protected routes and also have deliberate public token routes. Confirm native versus web eligibility route by route, and preserve public unsubscribe/network/privacy verification exceptions.

Do not change service-worker caching merely because authentication changed. Current `sw.js` bypasses non-GET/Authorization/API requests and uses network-first HTML; the new helper is not in its static allowlist. Test online upgrade, stale HTTP-cached helper versions, offline HTML, installed PWA startup and back-forward cache. Version the helper URL or adjust its HTTP cache policy if evidence requires it. Do not force reload an active form to apply updates.

## 8. Acceptance evidence required

Use remembered browser A with multiple tabs, unchecked browser B, separate device C, administrator/nonadministrator accounts, and new/active/expired subscription states. Exercise expiry through controlled test clocks/configuration, never by changing production clocks or waiting months.

| Test ID | Required result |
|---|---|
| A01 — Baseline | Original login code flow, wrong/expired codes, Show/Back/reset, styling/scripts, confetti, success alert, 1.5-second delay and entitlement redirect preserved. |
| A02 — Issuance/supersession | No persistence before verification; strict boolean opt-in; unchecked replacement revokes previous persistence; failed login does not supersede. |
| A03 — Time boundaries | Eight-hour unchecked expiry; 180-day sliding/365-day cap; cookie/server boundaries; no hidden-poll-only extension. |
| A04 — Challenge/reset state | Prior challenges and reset links fail after credential change; concurrent web/native creation/consumption cannot escape invalidation. |
| A05 — Rotation | Multi-tab single flight, unavailable locks, tab crash, delayed response, missing successor, known replay, random token and approved family response. |
| A06 — Logout/switch | Expired access plus live cookie; repeat logout; offline/pending logout; delayed refresh; another account/browser unaffected; no silent restoration after completed logout. |
| A07 — Password | Wrong current password remains a field error; seven/eight-character boundary, confirmation, whitespace/Unicode policy, reuse policy, throttling, lost response and concurrent change. |
| A08 — Revocation | All targeted checked/unchecked web JWTs, refresh credentials and TNNA online credentials rejected after committed password change/reset; DB outage fails closed. |
| A09 — Requests | One approved read retry; no duplicate mutation/upload; custom headers, abort, Request/body semantics and unsaved form text preserved. |
| A10 — Permissions/apps | Admin/subscription/ownership and Family Tree GO PRIVATE protections intact; public links, every touched app, uploads and original navigation pass. |
| A11 — Environment | Test-only DB/service, distinct secrets/origins, HTTPS cookie scope/deletion, forged/missing/null Origin, CORS, proxy headers, email isolation and cache/log redaction. |
| A12 — Operations | Limiter overload/backlog, security-table retention, connection pressure, restart behavior, MySQL deadlocks/rollback, migration pre/postflight and secure rollback. |
| A13 — Clients | Supported desktop/mobile browsers, PWA and back-forward cache; legacy native recovery; real staging offline/screen-off announcement behavior. |

For each result retain environment, candidate hash, command/scenario, expected/actual outcome and redacted evidence. Source-regex tests may detect missing wiring, but do not establish runtime correctness. `npm test` remains a failing placeholder; do not present it as the regression harness. Publish explicit reviewed test commands, separating isolated tests from scripts that connect to MySQL, send email or alter test accounts. Do not run all `tests/*.js` blindly.

The existing rollback, rate-limit and cleanup evidence is useful. Reuse it where the candidate is unchanged, and repeat affected tests after corrections. Historical reports and syntax checks do not replace browser/hosted acceptance.

## 9. Staging, delivery and final recommendation

Design a positive environment matrix: local-test HTTP, hosted-test HTTPS, and a future separately authorized production configuration. Retain fail-closed startup DB isolation, require hosted test to identify `sql5838929`, verify actual connected database identity, and separate staging secrets/hostnames and mail recipients. Adapt the current NODE_ENV guards coherently; neither blanket guard deletion nor setting hosted staging to development merely to start it is an acceptable design. Verify current hosting tier/cost at setup time; no pricing or availability is assumed here.

Each implementation group should deliver complete revised/new files, an exact baseline diff and change ledger, a deployment-file manifest, separate reviewed SQL where necessary, manual installation instructions, backups/rollback steps, and its test evidence. Capture new challenge/schema changes in the migration plan as well as the handoff's five added tables. Retain the permanent test database and protect production TNNA records. Do not import a test dump into production.

**Recommendation:** continue Stage 6 on the observed `reviseLogin` branch, starting with Group 0 and the High findings. Then implement the shared browser contract in measured application batches. The architecture is suitable for continued development once those contracts are corrected; the integrated feature is not ready for release acceptance on present evidence.

The eventual review packet must contain the complete source diff, decision record, schema/migration and secure rollback plans, file inventory, local and separate hosted test evidence, native compatibility results, and unresolved risks. The independent engineer must review that finished candidate and recheck material corrections before the owner makes any merge or production decision. This document authorizes no production action and does not replace that final review.
