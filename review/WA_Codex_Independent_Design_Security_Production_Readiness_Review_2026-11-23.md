# Wonderful Apps — Independent Design, Security, and Production-Readiness Review

**Review date:** November 23, 2026  
**Reviewer:** Codex, acting as an independent design/security engineer  
**Candidate:** `reviseLogIn` commit `3fadbe0b2d4b4807e1434f526e7d6834b689f992`  
**Production comparison:** `main` commit `d92ef54428f3d6cea6e4b28eaa5237a53c3b913e`  
**Requested destination:** `review/WA_Codex_Independent_Design_Security_Production_Readiness_Review_2026-11-23.md`  
**Delivery status:** Separate proposed report for owner review/manual installation. No WA project file was created or modified by the reviewer.

## 1. Executive opinion

**Overall opinion: CONDITIONAL / NOT YET READY.**

- **Further work on isolated Render staging:** **SUITABLE**, subject to the existing staging/test-database controls and explicit authorization for any state-changing test.
- **Integration of `reviseLogIn` into `main`:** **BLOCKED** at the reviewed commit. The unchanged Family Tree/One Tree authorization defects M03-C01, M03-H02, and M03-H03 expose unauthorized or insufficiently authorized data mutation. Authentication challenge and password-guess abuse controls are also incomplete.
- **Production deployment:** **BLOCKED** independently of the branch merge. The genuine-production-data migration, subscription-grant disposition, security-table initialization, combined application/database rollback, and post-cutover recovery plan have not been completed or rehearsed.

The candidate contains substantial sound engineering: centralized live-session JWT verification; credential-version fencing; transactional refresh rotation; exact Origin checks on cookie-backed state changes; secure hosted refresh-cookie attributes; centralized two-gate administrator recognition; fail-closed environment/database identity checks; TLS and pool validation; broad response-cache protections; and meaningful bounded Stage 6 evidence. Those strengths do not neutralize the confirmed authorization defects or the uncompleted production transition.

The smallest safe path is not a redesign. Before integration, either remediate the three confirmed Family Tree authorization defects or impose a narrowly scoped, owner-approved server-side restriction on cross-tree One Tree operations while correcting the ordinary relationship-route membership checks. Add bounded authentication abuse controls. Then run only the targeted tests identified in this report. Production database migration and rollback remain a separate Workstream B.

This report is an engineering assessment only. It is not authorization to edit, commit, merge, deploy, migrate data, change Render, or operate on production.

## 2. Scope, provenance, and limitations

### 2.1 Exact baseline inspected

Read-only local Git inspection established:

- current branch: `reviseLogIn`;
- current commit: `3fadbe0b2d4b4807e1434f526e7d6834b689f992`;
- requested `main` comparison object: `d92ef54428f3d6cea6e4b28eaa5237a53c3b913e`;
- local working tree: no tracked modifications were observed; the review brief itself was untracked;
- `3fadbe0` contains no operational-source change after substantive compatibility commit `72b8ee0`; its principal later changes are evidence/documentation and removal of tracked backup copies.

The 91-row operational inventory was independently reconciled against the exact `main`–candidate tree diff for `server.js`, `dbConnection.js`, `logger.js`, `morgan.js`, `send_email.js`, `middleware/`, `routes/`, `services/`, and `httpdocs/`. After excluding intentionally removed non-source asset `httpdocs/images/logo.png`, both sets contain the same **91 paths**: **77 modified, 13 new, and 1 deleted** (`httpdocs/bday.html`). No missing or extra operational path was found.

### 2.2 Governing material reviewed

The review applied the project root `README.md` Section 0; approved Core Standards v1.0; approved Detailed Standards v0.4.1; D01–D14 and later 3A/3B/3C clarifications; `standard/WA_File_Development_and_Delivery_Process.md` v1.1; `CLAUDE.md`; `TechSummary.md`; the November 23 review brief and 91-file coverage materials; current source; current Stage 6 plans/status/evidence; the November 20 M03 security report; November 21 One Tree handoff; November 22 R20 environment/database documents; and the production transition/rollback plans.

The standards' `_DRAFT` filenames are historical. Their contents record owner approval on November 12, 2026. Approval is a policy decision, not evidence that current implementation conforms.

### 2.3 Evidence classification

No test suite was rerun solely for this review. This preserves the instruction not to repeat accepted evidence and avoids unauthorized database, Render, browser-state, or filesystem effects.

- **Personally verified by read-only inspection:** commit identity; exact diff/inventory reconciliation; source hashes and controls; absence of tracked public `_COPY` files; deleted-asset references in current operational source; exact current route logic; schema-dump reconciliation documents; and test/evidence provenance.
- **Prior evidence accepted within its recorded bounds:** R10/R14/R15 bounded PASS; R16 T12 90/90 offline PASS; hosted T06 3/3; selected T11; R16 T09 isolated full-page 9/9; bounded T10 evidence; Group 5G credential lifecycle; R20 40/40 isolated environment/DB assertions; and owner-observed `72b8ee0` staging startup/login/Weights/logout.
- **Not independently witnessed:** Render dashboard state, current served bytes, live environment values, production service health, owner screenshots, live database state after the November 22 dumps, native Android behavior, and any production cutover or rollback.
- **Live staging limitation:** the reviewer’s read-only web retrieval tool could not access the Render staging URL, so this report does not claim independent confirmation that `3fadbe0` is presently served.

The November 22 production and staging SQL dumps are snapshots, not proof of current live state. The owner must confirm they remain current before Workstream B treats them as cutover baselines.

## 3. Findings

| ID | Severity | Finding and evidence | Impact | Recommendation | Gate |
|---|---|---|---|---|---|
| WA-PR-001 | **Critical** | **Arbitrary target Tree can be reviewed/merged.** Current `routes/familyTree.js:7157-7195` authorizes only the source Tree, then resolves caller-controlled `targetPersonID` globally. `POST /familytree/one-tree/merge` at `7197-7336` has no server-issued proof binding the request to a legitimate initiating relationship operation. Current file hash remains `f0b758...f05d`, identical to the November 20 M03 review baseline. | An authenticated Tree user can address an unrelated target Tree and may cause destructive merge/membership/history changes if other checks are met. | Preferred long-term fix: user/session-bound, short-lived, replay-protected merge eligibility capability. Efficient release containment: owner-approved server-side denial of **cross-tree** review/merge while preserving the same-tree branch and unrelated Family Tree operations. | **Blocks `main` and production.** |
| WA-PR-002 | **High** | **Actual relationship HTTP routes accept out-of-tree Person IDs.** `POST /familytree/relationships` (`routes/familyTree.js:4778-4901`) and `POST /familytree/related-person` (`4920-5023`) bypass the safer `addRelationshipInTree()` membership helper at `1050-1065`. | A Tree A member can attach or relate Person records outside authorized Tree scope. This affects ordinary relationship routes, not only One Tree. | Route all existing-Person writes through one validated helper, or add equivalent exact-Tree membership checks before the first write. For new related Persons, validate the focal Person before creation. | **Blocks `main` and production.** |
| WA-PR-003 | **High** | **Extra unreviewed `same` decisions are accepted.** `routes/familyTree.js:7245-7280` verifies required review groups but does not reject additional decision objects; the unfiltered original list is passed at `7304-7318` to snapshot/merge processing. | A manipulated otherwise-permitted merge can combine and delete Person records never identified as duplicates in the server review. | Reject unknown, duplicate, and extra `newerPersonID` entries; pass only a freshly normalized server-approved decision list. This becomes contained if cross-tree merge is temporarily denied server-side. | **Blocks `main` and production.** |
| WA-PR-004 | **Medium** | **Privacy authorization has a time-of-check/time-of-use window.** `routes/ftPrivacy.js:76-95` reads private/unlock state without locking; merge later performs extensive writes without a final locked revalidation. Hash remains the M03-reviewed `bd5026...2576`. | A concurrent privacy transition can race the authorization check. Runtime exploitation was not demonstrated. | Establish deterministic Tree/privacy locking and revalidate immediately before mutation, or contain through the same temporary cross-tree merge restriction. | Blocking unless contained; otherwise explicit owner risk decision after evidence. |
| WA-PR-005 | **High** | **Login and email-code verification lack bounded abuse controls.** `POST /users/login` (`routes/users.js:198-249`) performs password verification and issues/emails a challenge without account/IP/global throttle. `POST /users/verify-code` (`320-349`) checks a six-digit code but has no failed-attempt ceiling, issuance invalidation policy, or rate limiter. S6-022 remains open. | Enables credential stuffing/password guessing, verification-email abuse, and online brute force of the second step after password compromise. The 256-bit temp token helps but does not replace a challenge attempt ceiling. | Add shared database-backed, privacy-preserving limits for password attempts/challenge issuance and a small per-challenge verification-attempt ceiling; revoke/consume challenge on exhaustion. Preserve generic errors and existing successful flow. | **Blocks production-bound integration unless an independently verified edge control provides equivalent protection.** |
| WA-PR-006 | **High / Conditional** | **Password-reset client-IP provenance/fairness is unresolved.** `services/passwordResetClientIp.js:15-29` uses `req.socket.remoteAddress` by default. Its optional `CF-Connecting-IP` mode is staging-only. On a hosted reverse proxy, production may therefore group many users behind a proxy peer; alternate-ingress provenance is unverified. R11/R19 remain partial. | Shared grouping could let a small number of requests deny password resets to unrelated users; trusting an unverified header would instead permit spoofing/bypass. | Verify actual staging ingress using bounded synthetic unknown-email requests and sanitized correlation. Select one production-safe trusted-hop/header design, or document a compensating operational limit. Never enable a client-spoofable header blindly. | Conditional production blocker if shared/spoofable grouping is confirmed; otherwise recorded residual risk. |
| WA-PR-007 | **Medium** | **FP03 privacy capability forwarding is overbroad.** `httpdocs/js/FTPrivacy.js:8` injects `X-FT-Page-Token` whenever `String(url).includes('/familytree/')`, without exact same-origin and intended-path validation. | Script running in the page can cause forwarding to a cross-origin URL containing that substring if CORS permits it. No actual exfiltration was demonstrated. Existing JS-readable access tokens make XSS defense a broader known concern, but do not make this capability boundary correct. | Resolve URLs against `window.location.origin`; require exact same origin and an approved `/familytree/` pathname; handle `Request` objects explicitly. Add synthetic same-origin/foreign-origin tests. | Correct before production if the wrapper is active on released private-person flows; narrowly scoped, not a redesign. |
| WA-PR-008 | **Medium / Conditional** | **Administrator transfer design is strong but end-to-end operation is not proven.** `routes/adminManagement.js` provides current-password confirmation, current DB/config administrator revalidation, row locks, session-bound hashed one-time token, expiry/replay checks, audit rows, and two-stage Render configuration matching. `SubControl.html:962-1091` keeps the token in tab `sessionStorage`. Current test source has 22 intended offline cases, but current-revision execution evidence is not established; no hosted transfer/restoration rehearsal exists. | Main risk is operator lockout or recovery failure, not a demonstrated privilege bypass. | Run the 22-case isolated suite against exact candidate bytes. A hosted state-changing transfer is **not required before integration** if production transfer is explicitly prohibited until a separately authorized rehearsal/SOP. Before any real transfer, rehearse prepare/config-switch/complete and restore/cancel using staging-only identities and backups. | Conditional, not a security release blocker if transfer use is operationally prohibited. |
| WA-PR-009 | **High / Production** | **Production database transition is mapped but not executable or rollback-ready.** November 22 snapshots show production 66 tables vs staging 72; seven new staging tables, changed `UsersT` and `LoginVerificationT`, production-only `AdminSubscriptionGrantT` with 12 exported rows, and FK differences. The successful 66-table restore proves old-backup restorability only. | Incorrect mapping can lose entitlements, break all legacy authentication through missing `UserSecurityT`, import test sessions/tokens, mis-designate the administrator, or make old code incompatible. Restoring the old DB after new writes loses post-cutover data. | Complete Workstream B: current dumps, reviewed transformation rules, empty/seed policy for security tables, subscription/grant reconciliation, constraints/count/business invariants, production-like rehearsal, write-freeze/delta policy, code/schema compatibility, and combined rollback. | **Blocks production deployment, not isolated staging work.** |
| WA-PR-010 | **High / Production** | **PWA mixed-version and rollback behavior remains unproven.** `httpdocs/sw.js` uses cache v11, `skipWaiting()` and `clients.claim()`, deletes all older caches, serves HTML and `waPlatform.js` network-first, and caches static assets cache-first. Current source removed the old `/bday.html` precache reference, but immediate takeover can mix old open pages with a new worker/API or vice versa during rollback. | Stale tabs can execute incompatible client/server combinations; rollback may not restore prior cached behavior. No current-version failure is proved. | One controlled staging upgrade/rollback rehearsal with an already-open tab, a newly opened tab, online/offline transitions, login/logout, and one unsaved form. Verify no automatic mutation replay and document cache recovery. | Production gate; no need to rerun all offline/KMLI tests. |
| WA-PR-011 | **Medium** | **Production environment compatibility is implemented but bounded.** Commit `72b8ee0` added explicit production mode, TLS/pool/origin/database gates; current hashes match the reviewed final package. Prior 27+13 isolated assertions and staging startup/login/Weights/logout are relevant. Exact production values, host limits, and production-shaped runtime remain unverified. | Misconfiguration can refuse startup or connect to the wrong intended candidate DB; the guard cannot by itself prove owner selection, migration correctness, or capacity. | Retain the guard. Before cutover, record approved non-secret identity values, test a production-shaped isolated configuration, verify actual TLS/session timezone/pool budget, and confirm test/staging values fail closed in production mode. | Production condition, no longer the older source-level R20 blocker. |
| WA-PR-012 | **Low / Hygiene** | **Public backup cleanup is complete for the candidate.** Exact Git tree inspection found zero tracked `_COPY` paths under `httpdocs`. The only tracked `_COPY` name found anywhere was `change/home.html_COPY.diff`, outside the static web root. Current operational source contains no `bday.html` or `images/logo.png` reference. | No current public backup exposure or broken active reference was identified. Historical documentation still mentions the former risk. | Record cleanup as completed at `3fadbe0`; keep rollback originals outside `httpdocs`; ensure production artifact excludes unnecessary test/manual SQL/history files. | **Acceptable as documented.** |
| WA-PR-013 | **Low / Deferred** | **Transitional `localStorage` access tokens and CSP remain open by approved design.** The refresh token is HttpOnly, but access JWTs remain JavaScript-readable across many pages. D08 explicitly leaves the replacement mechanism unresolved. | XSS would expose the access token; no current exploit was demonstrated. | Maintain the tracked D08/CSP modernization backlog, safe rendering, and dependency provenance. Do not expand current release scope absent a concrete exploit or material regression. | Deferrable with explicit residual-risk record. |
| WA-PR-014 | **Low / Documentation** | Some authoritative guidance is stale relative to current code: for example, `verifyAccessToken.js` says it is not wired although `middleware/auth.js` uses it; older R20 proposal says production mode is unsupported although `72b8ee0` added it; older FT prose describes username-only admin checks although current source uses `administratorAccess.js`. | Reviewer/operator confusion and false reopening/closure of findings. | Reconcile documentation after release-blocker work through the approved documentation process. Do not treat stale prose as current runtime evidence. | Deferrable. |

### 3.1 Administrator-control assessment

Current central administrator identity is correctly based on both the live `UsersT.IsAdministrator=1` row and normalized `ADMIN_USERNAME`; JWT username alone, a hard-coded ID, or a subscription plan is insufficient. `routes/familyTree.js:218-260` now permits a verified administrator through the central helper, `routes/ftPrivacy.js` uses the same service, and merge-undo paths include an administrator exception. This corrects several older descriptive concerns.

The remaining gap is acceptance breadth, not an identified username-only bypass: positive full Family Tree administrator CRUD/privacy/ownership-transfer coverage has not been comprehensively demonstrated. Because the critical ordinary-user One Tree defects already block integration, add only targeted administrator regression assertions to the eventual Family Tree correction; do not start a separate broad administrator rewrite.

### 3.2 Authentication/session assessment

Positive design elements include:

- HS256 verification restricted to the expected algorithm;
- live `UserSecurityT.SecurityVersion` validation on every authenticated request;
- live web-session existence, revocation, sliding expiry, and absolute expiry checks;
- refresh-token hashes rather than raw tokens in the database;
- transactional token rotation, consumed-token replay denial, account fence locking, and one-time replacement;
- password reset tokens stored hashed, 30-minute expiry, version binding, one-use/revocation checks, and all-session/TNNA revocation after password change/reset;
- hosted refresh cookie `Secure`, `HttpOnly`, host-only by omission of `Domain`, `SameSite=Lax`, and `Path=/users`;
- exact Origin checks for refresh, logout, password change, password reset, and admin transfer state changes;
- no-store protections on sensitive route families and early parser failures.

The primary missing safeguard is abuse throttling for `/login` and `/verify-code`, followed by verified proxy provenance/fairness. The existing password-reset database limiter is technically stronger than an in-memory counter, but its client identity source must be validated for production hosting.

## 4. Change-to-test coverage assessment

### 4.1 Inventory conclusion

The 91-file operational ledger is accurate and complete for the operational-source definition used by the review. It remains applicable to `3fadbe0` because no operational source changed after `72b8ee0`. Its baseline label and `_COPY` narrative should be updated, but its rows should not be expanded into 91 separate hosted tests.

### 4.2 Evidence sufficient without repetition

The following evidence is sufficient for its bounded purpose and should be retained:

- R10 signed-out/offline/fail-closed behavior;
- R14 representative administrator/subscription authorization;
- R15 representative Budget, ETF, Weights, Family Tree, upload, and tracking workflows;
- R16 T12 90/90 offline preservation suite;
- R16 T06 3/3 hosted parser/error/cache observations and selected T11 logs;
- R16 T09 isolated browser presentation 9/9 and T10 bounded no-auto-replay evidence;
- Group 5G hosted password change/reset/session/TNNA API lifecycle;
- environment and DB construction 40/40 isolated assertions plus staging startup/login/Weights/logout after `72b8ee0`;
- static confirmation that v11 no longer precaches deleted `bday.html`;
- exact candidate cleanup of public `_COPY` paths.

These results do **not** prove the remaining One Tree manipulation paths, login/challenge throttling, proxy fairness, native Android behavior, mixed-version rollback, migration, or recovery after new production writes.

### 4.3 Minimum additional tests

| Test ID | Environment | Required test | Acceptance criterion | Side effects / cleanup |
|---|---|---|---|---|
| FT-GATE-01 | Offline routed HTTP, then isolated test DB | After correction/containment, call cross-tree review/merge with arbitrary target; call ordinary relationship routes with third-Tree IDs; submit extra merge decisions. | Correct 4xx/feature-unavailable result; **zero writes**. Same-tree positive relationship behavior remains intact. | Synthetic rows only; transaction rollback or fixture deletion; owner authorization for DB mutation. |
| FT-GATE-02 | Isolated test DB | One legitimate same-tree relationship positive case; if cross-tree merge remains enabled after remediation, one legitimate merge and undo plus one privacy-race test. | Intended behavior preserved; exact row/snapshot/integrity checks; cleanup verified. | State-changing; explicit approval and fixture manifest required. Skip merge/undo if feature is server-side restricted. |
| AUTH-ABUSE-01 | Offline deterministic tests | Login/challenge limiter: correct/incorrect password, resend ceiling, per-challenge wrong-code ceiling, expiry, concurrency, recovery after window, generic response. | Limits enforced atomically across connections/process models; successful valid login remains unchanged; no account enumeration. | No network/DB for first layer. Follow with synthetic isolated-DB concurrency only if approved. |
| ORIGIN-01 | Render staging, bounded read/negative probes | Wrong and missing Origin for refresh/logout/admin state; allowed Origin without valid credential; inspect cookie attributes. | 403/401 as designed; no credential leakage; `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/users`, no-store. | No valid mutation required. Do not repeat already accepted positive credential lifecycle. |
| PROXY-01 | Render staging with synthetic unknown emails | Compare sanitized limiter identity behavior from two independent client networks and a spoofed forwarded-header attempt. | Distinct legitimate clients are not collapsed unexpectedly; spoofed input cannot select arbitrary identity; bounded counters only. | Writes rate-counter rows and may consume hourly quota; explicit approval, unique synthetic emails, scheduled window, no real email recipients. |
| PWA-01 | Render staging browser | Controlled v11-to-next-version deployment and rollback with old/new tabs; online/offline navigation; login/logout; one unsaved draft; inspect caches. | No stale authenticated UI, no cached API responses, no automatic mutation replay, recoverable cache after rollback. | Requires separately approved staging deployments. Use synthetic/reversible draft; clear test browser caches afterward. |
| ADMIN-01 | Offline exact candidate | Execute the existing 22 administrator-transfer cases against exact candidate hashes. | 22 pass/0 fail; password/session/token/expiry/replay/cancel/atomicity assertions retained. | No network or DB. |
| ADMIN-02 | Render staging, deferred until transfer will be used | Full prepare → Render setting switch → complete → sign-in → restoration/retransfer/cancel drill. | No dual/no administrator state outside planned transition; audit rows and session behavior correct; recovery SOP succeeds. | High-impact staging state/config change. Explicit approval, backups, named operator, and restoration checklist required. Not necessary before integration if transfer use is prohibited. |
| DB-B-01 | Isolated production-like DB | Execute reviewed Workstream B migration from a fresh current production backup into the final candidate schema. | Counts, keys/FKs, subscriptions, admin, `UserSecurityT`, login/reset/session policy, representative app data, and TNNA-linked accounts pass. No staging tokens/test identities imported. | State-changing only in disposable DB; destroy/retain per approved evidence plan. |
| DB-B-02 | Isolated production-like DB + staged app | Forward cutover and combined rollback rehearsal, including writes after cutover and explicit delta/write-freeze handling. | Old and new app/schema compatibility understood; rollback does not silently lose post-cutover writes; recovery time and operator steps recorded. | Explicit authorization and disposable environment. |
| TNNA-01 | Approved isolated Android device/account | Login/refresh/rotation/revocation, restart, offline/screen-off notification behavior, and server 401 versus network-unavailable distinction. | Existing TNNA contract preserved; no production device/account affected. | Separate device authorization; restore test credentials/configuration. |

No separate Render test is justified for every Budget/ETF/Family Tree page or every documentation/test file. After a narrow source correction, rerun only directly affected routes and one representative positive regression per shared dependency.

## 5. Database, rollback, and One Tree disposition

### 5.1 Database transition

The November 22 reconciliation is a sound preliminary inventory, not a migration specification. Mandatory pre-production decisions include:

1. confirm fresh source and target snapshots;
2. preserve genuine production records and IDs;
3. map the 12 exported `AdminSubscriptionGrantT` rows into the approved `UserSubscriptionT` semantics before any table retirement;
4. initialize `UserSecurityT` for every genuine user and decide disposition of legacy `LoginVerificationT` rows;
5. initialize new session/reset/admin tables with an explicit empty/seed/retention policy—never with staging secrets or test sessions;
6. designate exactly one administrator consistently with production `ADMIN_USERNAME`;
7. preserve TNNA users/devices/refresh behavior and decide intended session invalidation at cutover;
8. reconcile FK/index/constraint differences, not just column equality;
9. define cutover ordering, write freeze or delta reconciliation, validation, and abort thresholds;
10. rehearse application plus database rollback after representative new writes.

The prior 66-table restore is useful backup evidence. It is not proof of a 72-table forward migration, application compatibility, or rollback after production writes.

### 5.2 One Tree disposition

Deferring the future One Tree redesign to `oneTreeM` is reasonable for scope control, but does not permit the vulnerable endpoints to enter production unchanged.

The smallest practical containment is:

- server-side deny cross-tree `GET /familytree/one-tree/review` and cross-tree `POST /familytree/one-tree/merge` after resolving both Trees, while preserving the existing same-tree branch;
- correct membership validation in `POST /familytree/relationships` and `POST /familytree/related-person` before the first write;
- test zero writes for arbitrary target, third-Tree IDs, and extra decisions;
- keep the later eligibility-capability, conflict-resolution, preview, concurrency, and complete merge/undo design in `oneTreeM`.

This containment changes functionality and therefore requires explicit owner approval and the full WA replacement/diff/verification process. A UI-only hide, undocumented operational promise, or feature deferral is insufficient.

## 6. Prioritized recommendations and estimated effort

Estimates are planning ranges, not measured work or authorization.

### Priority 0 — release blockers

1. **Owner decision on One Tree containment versus full narrow remediation** — 1–2 hours design/review.
2. **Prepare and independently review the selected Family Tree correction package** — approximately 6–12 hours for containment plus H02 membership repair and targeted tests; a complete eligibility-capability redesign likely exceeds this range and should trigger the 40-hour reassessment gate.
3. **Add login/challenge abuse controls** — approximately 4–8 hours including database/test design, depending on reuse of the password-reset limiter pattern.
4. **Run only FT-GATE-01/02 and AUTH-ABUSE-01** — approximately 2–5 hours, excluding approval/wait time.

### Priority 1 — production conditions

5. **Verify proxy/IP provenance and choose production behavior** — approximately 1–3 hours plus an approved bounded staging window.
6. **Complete Workstream B migration specification and rehearsal** — likely 8–16+ hours; this is the item most likely to consume or exceed the remaining 40-hour planning ceiling. Stop and reassess if reconciliation reveals collisions or irreversible transformations.
7. **Perform one PWA mixed-version/rollback rehearsal** — approximately 2–4 hours plus staged deployment coordination.
8. **Finalize combined rollback runbook and production-shaped startup checks** — approximately 3–6 hours.
9. **Perform approved isolated TNNA device acceptance** — approximately 2–4 hours if a safe device/account is available.

### Priority 2 — safe deferrals

- broad CSP/D08 token-storage modernization;
- comprehensive shared-fetch conversion;
- formatting/standards cleanup unrelated to a release blocker;
- full endpoint-by-endpoint error-message modernization after the high-risk paths remain sanitized;
- administrator-transfer hosted rehearsal if the operation is prohibited until later;
- owner-deferred Weights dialog correction, unless the owner designates it an essential production workflow;
- documentation drift cleanup after the runtime candidate is stable.

## 7. Release-gate conclusion

### Done or acceptable within recorded scope

- exact candidate and `main` baseline identified;
- 91-path operational inventory independently reconciled;
- public `_COPY` cleanup verified at `3fadbe0`;
- deleted `bday.html`/logo references absent from current operational source;
- staging environment guard, TLS/pool validation, and production-compatible gated mode implemented and bounded-tested;
- substantial authentication/session, subscription, error/cache, representative application, and hosted credential-lifecycle evidence exists;
- accepted R10/R14/R15 and bounded R16 evidence need not be rerun wholesale.

### Blocks `reviseLogIn` → `main`

- WA-PR-001 / M03-C01 arbitrary target Tree;
- WA-PR-002 / M03-H02 out-of-tree relationship IDs;
- WA-PR-003 / M03-H03 extra merge decisions;
- WA-PR-004 unless cross-tree merge is contained or the race is corrected/expressly accepted;
- WA-PR-005 login/challenge abuse controls, absent verified equivalent edge protection;
- fresh independent review of the exact corrected hashes and focused test results.

### Additional blocks before production

- confirmed current production configuration and service health;
- proxy/limiter provenance disposition;
- production-shaped environment/startup verification;
- current production-data migration transformation and rehearsal;
- subscription/admin/security-table/TNNA transition decisions;
- combined application/database rollback after new writes;
- one mixed-version PWA upgrade/rollback test or explicit owner risk acceptance;
- applicable native TNNA acceptance or explicit supported-scope decision;
- owner review of exact release manifest, approvals, and post-deploy smoke/monitoring plan.

### Final decision

`3fadbe0` is a credible **staging release candidate**, but it is **not ready for integration into `main` and not ready for production deployment**. The branch can become integration-ready through a small number of targeted, owner-authorized corrections and tests; it does not require a comprehensive rewrite or repetition of the accepted test matrix.

The owner retains exclusive authority over installation of this report, source changes, test execution with side effects, Git operations, Render settings, database work, merge, deployment, and production release.
