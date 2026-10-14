# Wonderful Apps — Keep Me Signed In and Change Password
## Synthesis of Three Design Engineering Reviews and Discussion Roadmap

**Date:** October 14, 2026  
**Project folder:** `keepMeSignedIn/`  
**Branch reported by project owner:** `reviseLogin` (the third review refers to `reviseLogIn`; confirm exact spelling with `git branch --show-current`)  
**Status:** Design synthesis and discussion agenda; **not** an implementation, approval to deploy, or assertion of completed runtime testing.

## 1. Baseline, authority, and correction to prior briefing

The project owner states that none of the earlier generated Keep Me Signed In / Change Password replacement files or SQL were retained or committed. The current branch has been returned to the **pre-feature application state**, apart from the new `keepMeSignedIn/` folder. The current WA files in Google Drive are the authoritative reference. **Begin new engineering work from those originals, not from a previous AI-generated ZIP or modified version.**

The earlier `Tech_Summary_KeepSignedIn_Project_with_Initial_Attempts.md` says experimental files had been installed locally. That statement describes an earlier point in the discussion and is **outdated for the current branch state**. The third engineer's direct inspection also reports no browser-session helper, Change Password page, or new session endpoints and finds original confetti behavior present. Confirm the exact working-tree state, including untracked files and database migration state, before coding; do not assume a clean branch proves the database was unchanged.

**Non-regression rule — mandatory:** No existing WA functionality, styling, animation, form validation, navigation, subscription entitlement, administrator rule, Family Tree privacy protection, API contract, service-worker behavior, or TNNA behavior may be modified except where necessary for the specifically approved features. Preserve the original login's confetti, success alert, 1.5-second redirect, email-code verification, and subscription-aware redirect; preserve the current minimum password length of **eight characters**. Generate narrowly scoped, reviewed changes and retain original-to-revised diffs. No new language or installation utility (including Python) without discussion and approval. Deliver complete revised files, new files, separate SQL, and manual installation instructions.

## 2. Materials reviewed and evidentiary weight

1. **Independent review C:** `Cl_WA_tech_response_Design_Engineer_Review.md`. Examined several actual Google Drive application/source files, but expressly did not examine all HTML pages or the full `wappsDump.sql` at that time. Favors a narrow web integration and phased revocation.
2. **Independent review P:** `P_WA_KeepSignedIn_ChangePassword_Design_Engineering_Review.md`. Detailed architecture and release-readiness critique, principally based on the technical briefing and documentation rather than an executable-code audit. Favors immediate server-enforced revocation and explicit session contracts.
3. **Project-wide review Cod:** `Cod_WA_Design_Engineer_Recommendations.md`. Considered the briefing and both independent reviews and inspected a broader local source set, including authentication paths, representative applications, and SQL DDL. Recommends synthesizing C's limited changes with P's stronger revocation and concurrency treatment. Still not a runtime or production-database audit.
4. **Background briefing, not a fourth engineering opinion:** `Tech_Summary_KeepSignedIn_Project_with_Initial_Attempts.md`; useful for requirements, history, and prior regressions, with its historical branch-state claim corrected above.

These summaries represent the **reports' assertions and proposals**. They are not independent verification that current deployed code, installed MySQL tables, Render configuration, browser behavior, or security controls work as described.

## 3. Conclusions shared by all three engineers

- **Proceed in principle, not yet in production.** Both features are feasible within the existing Node.js/Express/JavaScript/MySQL application, but the previous experimental ZIP is not an acceptable implementation baseline.
- **Retain the eight-hour access JWT** and existing username/password → email verification flow. Do **not** replace it with a 4,320-hour/180-day JWT.
- **Keep Me Signed In is optional and unchecked by default.** Only after successful email verification should the server issue a separate long-lived browser refresh credential. Keep that credential out of `localStorage`, using an appropriately scoped `HttpOnly` cookie. The existing `localStorage.token` access-JWT interface needs compatibility planning.
- **180-day renewable sign-in** remains the agreed goal. The meaning of renewal, expiry and an additional *absolute* lifetime limit must be approved explicitly.
- **Change Password** should be available only to authenticated users and require current password, new password and confirmation. Preserve the existing **8-character** minimum; do not impose 12 characters without authorization.
- **Server-side revocation is essential.** Clearing a token or cookie in a browser alone is not sufficient. Logout and password change require defined session invalidation semantics.
- **TNNA is a separate client** with its own native refresh/token storage. Reuse sound cryptographic and transaction patterns where appropriate, but do not assume a browser can reuse Android secure storage or that offline TNNA can instantly receive server revocation.
- **Avoid blanket rewrites and unintended behavior changes.** The prior attempt lost login confetti and changed password rules; an injected script on many pages and broad `fetch` interception were also cited as compatibility risks. Inventory actual token-reading and API behavior before deciding the smallest safe integration surface.
- **Security/race testing is required.** Token rotation, two or more tabs, delayed/lost responses, refresh replay, CSRF, CORS, cookie scope, local/production origins, service-worker caching, password-change races, and failure modes must be demonstrated before deployment.
- **Use staged implementation and evidence-based release gates:** verified baseline, approved policy decisions, reviewed SQL and backend, carefully scoped UI integration, regression tests, rollback plan, then production consideration.

## 4. Material differences among the recommendations

| Question | C review | P review | Cod project-wide review | Discussion consequence |
|---|---|---|---|---|
| **How much frontend code changes?** | Prefer `login.html` as silent-restore point and `home.html` as entry; leave other ~60 HTML pages unchanged, no global `fetch` wrapper. | Define explicit protected-page startup and request lifecycle; review affected consumers. | C's universal login bounce is insufficient for some token-capturing pages and may lose unsaved work; integrate selectively where necessary, not by injecting into every page blindly. | Perform a page/route integration inventory before choosing file count. |
| **Immediate access JWT invalidation?** | Phase 1 may revoke refresh credentials but let preissued JWTs survive up to eight hours; add revocation epoch later by approval. | Treat immediate revocation of targeted website access and refresh sessions as required for logout/password change. | Recommends P's revocation-aware sessions for target release; deferral requires explicit acceptance of eight-hour exposure. | **Major security/release decision.** |
| **Session database model** | Browser refresh-token lineage modeled after TNNA. | Explicit web session for *every* login, including unchecked logins, plus renewable token records for remembered sessions. | Supports revocable web session records and one shared verification contract, while avoiding duplicate/conflicting stores. | Design schema using actual `wappsDump.sql` and installed DDL. |
| **Concurrent refresh / replay** | Proposes browser lock plus 30-second access-only grace for a just-rotated token; beyond grace revoke lineage. | Prefers strict one-time rotation with coordinated tabs; warns against unspecified grace/replay allowances. | Strict serial rotation; optionally narrowly bounded access-only grace with explicit theft tradeoff; lost successor cookie cannot be reconstructed from a hash. | Approve precise state machine, lock order, replay, network-loss and recovery policy. |
| **TNNA after password change** | Recommends revoking TNNA refresh rows as well; initially describes this as SQL-only. | Recommends account-wide invalidation only with explicit user approval and native compatibility testing; offline operation remains possible. | Agrees on coordinated account-wide choice, but cautions SQL refresh revocation alone cannot immediately invalidate existing native JWTs or control offline monitoring. | Decide website-only vs account-wide and distinguish online/offline guarantees. |
| **Session duration** | 180-day sliding inactivity, proposed 365-day absolute cap. | Same proposed cap, explicitly not yet agreed. | Also recommends 365-day cap as a separate policy decision. | User has approved 180-day renewable behavior, **not yet the 365-day cap**. |
| **Security scope** | Favor smaller Phase 1, defer several other hardening items. | Treat revocation/cookie/CSRF/rotation/transition as release-blocking, not cosmetic. | Include necessary foundational hardening (e.g. single-use challenge/rate limits) with explicit scope and approval; no opportunistic feature expansion. | Define minimum safe release requirements and separate optional work. |

## 5. Decisions required before writing implementation files

These are **proposals from engineering reports**, not previously approved features.

1. **Lifetime:** What counts as authorized activity for rolling 180-day renewal? Approve or decline the proposed 365-day absolute cap requiring full password/email verification.
2. **Logout scope:** Revoke only the browser session being logged out, including the relevant access JWT? Define behavior when offline or the API cannot be reached.
3. **Password-change scope:** Revoke all website sessions immediately, including the eight-hour access JWTs of remembered and nonremembered logins? Require complete re-login afterwards?
4. **TNNA scope:** Should website Change Password invalidate native sessions too? If so, specify online JWT invalidation and honestly characterize offline continuity.
5. **Existing tokens at rollout:** Require one fresh website login after deployment or accept legacy tokens until their remaining eight-hour expiration? Either choice has user-experience and revocation implications.
6. **Concurrency/replay:** Strict one-time rotation only, or strictly bounded 30-second access-only grace? How should lost responses, cookie write ordering, two tabs, and stale clients recover?
7. **Password input semantics:** Preserve existing registration/login handling (including any whitespace conventions); any additional policy like rejecting reuse of the current password requires separate approval.
8. **Security hardening needed for safe issuance:** Confirm email verification challenge single-use enforcement, guessing limits, CSRF/origin/cookie requirements, and transaction lock order, and decide what must be included in the same release.
9. **Production topology and performance:** Verify actual site/API origins, HTTPS, proxy settings, CORS, cookies, MySQL version/constraints, pool limits, latency, and any service-worker caching of authentication code.

**Proposed starting discussion order:** First settle (1) lifetime, (2–4) revocation/clients, and (5) cutover; then settle (6–9) implementation details. Document choices in a short signed-off design decision record before coding.

## 6. Recommended way forward — discussion to implementation

### Stage A — Ground truth and scope freeze

- Confirm exact branch name and `git status`; list contents and hashes of all authoritative files and check uncommitted/untracked files.
- Verify originals directly from Google Drive and working branch, with real raw-file diffs rather than flattened connector display text; compare known baseline `login.html`, `home.html`, `register.html`, `routes/users.js`, authentication middleware, `server.js`, `routes/tnna.js`, service worker, and all access-token consumers.
- Verify actual `wappsDump.sql` definitions **and installed test database**, including whether any experimental `WebRefreshTokenT` table ever existed. Do not run migration against production yet.
- Produce a one-page change-scope manifest and regression baseline; mark every existing capability that must remain unchanged.

### Stage B — Approve policy and precise contracts

- Record responses to Section 5. Agree on endpoints, token claims/session IDs, refresh-cookie scope, session lifetime, logout/password-change revocation, browser tab coordination, failure outcomes, and TNNA boundaries.
- Resolve JWT verification consistency: the reviews identify more than one JWT validation location (`middleware/auth.js`, `middleware/subscriptionAccess.js`, and `/users/is-admin`). One bypass could invalidate a revocation guarantee.
- Define a **minimal sufficient set of files**, rather than promising exactly two/four files before reviewing token consumers.

### Stage C — Implement in small reviewable steps

- First add test database schema, server-side session/refresh and revocation routines, and API tests. Keep original login issuance, email-code workflow, subscription trial and redirect behavior intact.
- Add the Change Password route/page with the existing eight-character rule, current password check, and approved session revocation behavior.
- Integrate optional Keep Me Signed In by carefully modifying original `login.html` and the smallest justified startup/request paths. No page reload or broad global `fetch` interception without proven need and tests; preserve unsaved forms.
- Review each changed file with a **hunk-by-hunk original-to-revised diff** and a reason for every alteration. Deliver complete files + separate SQL + manual copy instructions, **not a Python installer**.

### Stage D — Test and release gates

- Authenticate with checkbox unchecked and checked; exercise password+email verification, confetti, alert, 1.5-second delay, subscription first-login redirect, logouts, expiration and renewal.
- Test concurrent tabs and refreshes; delayed/lost responses; replay/revocation; offline failures; cookie attributes; CSRF/CORS/origin; restart and service-worker upgrade behavior.
- Test Change Password wrong-current-password, short/long/whitespace/new-confirm mismatch, successful change, simultaneous changes and refreshes, and targeted device/JWT invalidation.
- Regress critical application areas (Family Tree **GO PRIVATE** protections, admin and subscription controls, ETF, Budget, Weights/Activities, tracking, TNNA online/offline). Existing page code and UI must remain intact.
- Confirm MySQL 5.5-compatible DDL, cleanup, query load, privacy of token logs, and **security-preserving rollback** (rolling back must not resurrect revoked sessions). Keep an explicit record of unresolved risks and approval before merging/deploying.

## 7. Proposed agenda for our next discussion

Rather than write more code immediately, discuss these topics in sequence:

1. **Desired user experience:** 180-day rolling renewal, proposed 365-day cap, what an unchecked login means, and whether a password change forces re-login.
2. **Revocation guarantees:** current-device logout, all-web-session password change, and whether both must invalidate already-issued eight-hour JWTs at once.
3. **TNNA independence:** whether password changes should sign out TNNA; consequences when a rider is offline.
4. **What to do with simultaneous tabs and failed network responses:** prefer exact, testable behavior instead of generic assurances.
5. **Smallest safe implementation:** which existing files truly need modifications, how to preserve confetti/forms/app navigation, and what extra verification/security infrastructure is indispensable.
6. **Approval gate:** finalize decisions in a versioned decision record, then authorize implementation on `reviseLogin`/`reviseLogIn` with staged tests and manual installation.

**Recommended immediate next artifact:** a short `keepMeSignedIn/Design_Decisions.md` listing each open decision, selected option, rationale, acceptance criterion, and whether it affects TNNA or existing JWTs. No software changes until those decisions are accepted.

## 8. Source documents in Google Drive

- [C design engineer review](https://drive.google.com/file/d/1o_sIkZm8IomiashALHUMbvP1bwjcHvei/view)
- [P design engineering review](https://drive.google.com/file/d/1ApphdzC1NPibgmptM-c5HYDRe_1zHvU-/view)
- [Cod project-wide design recommendations](https://drive.google.com/file/d/1lpBEMNslHTYb9cMX1FLU2EHIlKYrjk3r/view)
- [Original technical briefing and history](https://drive.google.com/file/d/1Dm0aPLgGAlbIgcLLD7qvuI5aoJVRUA5V/view)

*This synthesis deliberately separates shared conclusions, disputed technical approaches, engineering proposals, and decisions requiring project-owner approval. It creates no application code or SQL and makes no changes to Google Drive or the branch.*
