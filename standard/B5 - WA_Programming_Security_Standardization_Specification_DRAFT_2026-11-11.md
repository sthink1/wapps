# Wonderful Apps — Programming and Security Standardization Specification

**Document ID:** WA-STD-DRAFT-B5  
**Version:** 0.1 — DRAFT FOR ENGINEERING REVIEW  
**Prepared:** November 11, 2026  
**Scope:** Wonderful Apps (WA) Node.js/Express backend, browser/PWA frontend, Family Tree, ETF, Budget, Tracking, authentication and subscription middleware, and interfaces used by TNNA.  
**Authority:** **PROPOSED STANDARD — NOT APPROVED OR IMPLEMENTED.** This document is a separate review artifact. It does not supersede `CLAUDE.md`, `TechSummary.md`, or the Stage 6 registers. No code, project document, repository, database, or deployment has been changed.

## 1. Purpose, baseline, and interpretation

The purpose is to make WA standards **consistent, technically specific, enforceable, and verifiable** without losing application behavior. A consistent rule can have defined exceptions; it does not require all routes to use identical middleware, status codes, or payloads. In particular, Family Tree page-token privacy, public email verification, TNNA credentials, multipart uploads, and tracking have distinct contracts.

**Current authoritative documentation inspected read-only:**

- [CLAUDE.md](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view), updated October 13, 2026: §11 lines 871–890 (backend security), §14 lines 1003–1018 (coding standards), §17 lines 1114–1134 (change procedure).
- [TechSummary.md](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view), updated October 13, 2026: §11 lines 1024–1067, §12 lines 1109–1127 (request chain), §20 lines 1343–1370 (development checklist), §21 lines 1374–1396 (documentation principles).
- [Stage6_OpenItems.md](https://drive.google.com/file/d/1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh/view), consolidated revision 3.3, November 9 text and November 10 Drive modification metadata: S6-005 (line 147), S6-008 (150), S6-009 (151), S6-014 (156), S6-017 (159), S6-018 (160), S6-019 (161), S6-030 (172), S6-033 (175), S6-041 (368–376). This document contains historical material and statuses; newest verified evidence must be reconciled separately.
- [Stage6_Render_TestPlan.md](https://drive.google.com/file/d/1DUyRKaa9vph6oetGgIVe0LC6X55vTJye/view), consolidated v2.3 dated November 9, 2026, with preserved bounded R10/R14/R15 acceptance.

**Implementation reference:** GitHub [`sthink1/wapps`, commit `b5e2b06`](https://github.com/sthink1/wapps/tree/b5e2b06), the last handoff-confirmed staging code reference. This audit **does not prove** that Google Drive, an uncommitted local worktree, present branch HEAD, or current Render Live service still exactly match the pinned commit. Any later implementation or remediation requires renewed source/deployment reconciliation.

**Evidence labels:** `DOC` = stated in the authoritative documentation; `SRC` = seen at pinned code commit; `TEST-HIST` = previously recorded Stage 6 test result, not retested here; `PROPOSED` = standard to approve; `UNKNOWN` = requires further evidence. A requirement is not described as a historical programmer obligation unless its existence at that date is proven.

### 1.1 Normative words

After approval, **MUST / MUST NOT** are mandatory, **SHOULD** requires a documented exception when not followed, and **MAY** is optional. Until approval, every numbered `WA-STD-*` item below is **PROPOSED**, even where it restates an existing documented rule. Existing documented requirements are separately identified in the traceability table.

### 1.2 Standardization success criteria

Approval must ultimately produce (1) a documented contract for each interface, (2) an inventory of endpoint access classes and consumers, (3) source and runtime conformance evidence, (4) a recorded exception decision, (5) preservation of earlier bounded PASS tests and proof for newly affected behaviors, and (6) independent design-engineer review before any `main` or production decision. Passing a single representative route does not certify all routes.

## 2. Standards and acceptance criteria

### WA-STD-01 — Change baseline and cross-module impact analysis

**PROPOSED requirement.** Before a change, identify the exact authoritative Drive files, committed SHA and local differences (if made available by the user); record all relevant routes, middleware, services, HTML/JS consumers, database tables, and mobile interfaces. Confirm that the baseline is current. Never silently treat a `_COPY` file as active. Preserve any local uncommitted work. No modification in GitHub, Drive, local user files, Render, or databases is authorized through this audit.

**Acceptance:** Review record includes baseline SHA, source file inventory, impact matrix, environment, backward compatibility and affected regression cases. If versions conflict, mark `BLOCKED — SOURCE RECONCILIATION` rather than generating a supposedly authoritative replacement. **Origin:** CLAUDE §1 and §17; S6-034; Stage 6 handoff.

### WA-STD-02 — Every endpoint receives an explicit access classification

**PROPOSED requirement.** Maintain an endpoint catalog with HTTP verb, path, entry router, auth class, session client scope, subscription AppKey if any, admin requirements, object-ownership check, CSRF/Origin rules, response/error envelope, cache rules and named frontend/native consumers.

Use these **proposed** access classes:

- `PUBLIC_NONCREDENTIAL`: only explicitly listed no-login operations (e.g. published TNNA version metadata), with scoped information disclosure.
- `PUBLIC_BEARER_LINK`: narrow email-link/token verification and unsubscribe workflows; token entropy, expiry, one-time use and leakage checks are route-specific.
- `AUTH_WEB`: valid web access session required.
- `AUTH_APP(appKey)`: valid web session plus entitlement to the named app; ownership separately enforced.
- `AUTH_ADMIN`: valid session plus verified administrator authorization (and separate application scope when applicable).
- `AUTH_NATIVE`: TNNA-bound credentials and device scope; **not interchangeable** with web refresh cookies.

**Acceptance:** Catalog reviewed against all mounts in `server.js` and all route methods. A deliberate exception gets an ID, owner, rationale, expiration/review trigger, and tests. **Origin:** CLAUDE §11/§14; TechSummary §12; S6-009/017/019.

### WA-STD-03 — Authorization is layered, never UI-only

**PROPOSED requirement.** Protected requests MUST be authenticated server-side; subscription-controlled operations MUST pass `requireAppAccess(appKey)` or an approved equivalent, and user-owned resources MUST verify `UserID` or applicable tree membership for the actual requested record. Administrative overrides MUST be narrowly authorized and must not grant unreviewed access to unrelated personal data. A protected route's shared middleware does not by itself prove record ownership. Denial MUST fail closed before sensitive data or mutations are exposed.

**Acceptance:** For each route family, test anonymous, wrong client, wrong user, authorized owner, insufficient subscription, expired subscription, and administrator where applicable. Preserve the previously verified bounded R14 results; add only gaps. **Origin:** CLAUDE lines 882–890; TechSummary 1051–1067; R14 and S6-009.

### WA-STD-04 — Shared browser session and API usage

**PROPOSED requirement.** New or materially revised browser clients SHOULD use the approved `WA.session` / `WA.api` contract. Any direct `fetch` plus manual `localStorage`/Bearer path MUST be inventoried with a migration or explicit compatibility exception. Do not assume loading `waPlatform.js` proves adoption. A direct `fetch` exception may be needed for special upload/privacy behavior, but must still obey token, error, and retry controls.

The existing implementation uses `localStorage.token` as temporary compatibility storage. This draft **does not approve** immediate elimination of that storage or change the token lifecycle. Do not log access tokens. **Acceptance:** For affected pages verify renewal, explicit logout, network failure, 401, 403, 5xx, no stale-account presentation, correct user-scoped header, and no loss of unsaved data. **Origin:** S6-005/008/018/033.

### WA-STD-05 — Request replay and session-state semantics

**PROPOSED requirement.** Do not automatically repeat POST/PUT/PATCH/DELETE or requests with a body after a 401. A read-only GET/HEAD may be retried once after successful approved refresh, only if the caller's account/session is still current. Failed refresh must not cause unsafe replay or silently convert permission 403 into login 401. Without supported cross-tab lock, fail closed in accordance with an explicit browser support policy.

**Acceptance:** Controlled simulations and representative browser tests for expired JWT, valid/invalid refresh, logout during refresh, account switch, absent Web Locks, network interruption, 401 versus 403, and unsaved form state; defer broader claims until completed. **Origin:** observed `waPlatform.js` behavior, S6-008/018/026/027; normative extension proposed.

### WA-STD-06 — Unified intentional-error classification

**PROPOSED requirement.** Only explicitly created and vetted validation/business-rule errors may expose authored user-facing messages. Unexpected exceptions, including those carrying a 400–499 `status`, MUST NOT have their raw `.message`, `.stack`, SQL, URL, or provider data automatically returned. Classification MUST be explicit, not derived solely from `status`, property names, `(be)` suffixes, or arbitrary thrown text. The shared Stage 6 marker is an existing candidate but is **not yet approved** as the final permanent API.

**Acceptance:** Isolated tests for unexpected 400/403/500/503 and approved 400/403/404/409; verify status preservation where required and no unexpected message exposure. Map Budget and ETF custom classifiers to the chosen architecture only after caller compatibility analysis. **Origin:** CLAUDE §14 general consistency; S6-041; source findings below.

### WA-STD-07 — Canonical API error envelope and compatibility

**PROPOSED requirement.** Define one versioned external error contract with a stable machine-readable code, safe display message, HTTP status and optional documented contextual fields. Do **not** assert that a proposed canonical shape is already deployed. An illustrative proposal is:

```json
{
  "error": { "code": "REQUEST_FAILED", "message": "Request failed" }
}
```

This example is **not** permission to alter existing endpoints. Current callers consume `{error: "..."}`, `{message: "..."}`, and `{error:{message:"..."}}`. A migration MUST inventory consumers and may require a dual-compatible parser or versioned rollout; avoid changing 401/403 semantics, special `reason`, `app`, `code`, `valid`, or other fields without explicitly designed compatibility.

**Acceptance:** API-to-frontend contract tests for successful and failed responses, nested/string errors, non-JSON failures, all required status codes and field-specific legacy screens. **Origin:** S6-033; source comparison.

### WA-STD-08 — Response privacy, cache and logging

**PROPOSED requirement.** No secret, token, password, API key, database connection detail, private Person data, reset link, or raw exception internals in logs or public errors. Redact path/query fragments that may carry credentials. Sensitive API success and failure responses SHOULD use `Cache-Control: no-store`, with an explicitly reviewed exception for safe public/static content. Logs should retain bounded event type, route identity without sensitive path values, status, and a safe correlation identifier if designed/approved. Do not log or display actual credential samples in review artifacts.

**Acceptance:** Source and hosted sanitized-log inspection, synthetic exception tests, representative HTTP cache-header checks, DevTools checks; new telemetry must not reveal tokens. **Origin:** CLAUDE 883–884; S6-019/030/041 and Stage 6 R16.

### WA-STD-09 — Public token-based exceptions

**PROPOSED requirement.** Public email verification, unsubscribe, Family Tree contact verification, privacy approval, and TNNA version checks MUST have their exact public methods and routes documented. Do not broaden a public bypass to neighboring paths or methods. Any one-time token workflow must use case-appropriate expiry and anti-replay safeguards. A link opened without login must not expose records beyond its purpose.

**Acceptance:** Anonymous positive/negative, wrong method/path, malformed/expired/consumed token, cross-account effects and leak checks. **Origin:** `server.js` narrow Family Tree bypass and `routes/notifications.js`/`ftPrivacy.js` public routers; detail and coverage require independent tests.

### WA-STD-10 — Family Tree privacy and media compatibility

**PROPOSED requirement.** Maintain Tree membership/record-access checks in addition to subscriptions. Preserve `X-FT-Page-Token` enforcement for private Person pages, fresh-open key behavior, safe response redaction of other private Persons, approved admin exception, and public privacy approval/contact verification. Multipart file uploads must preserve `FormData` boundaries and route-owned Multer processing; shared request wrappers MUST NOT force a JSON Content-Type or erase the page token. Global request interception must be explicitly tested for interactions with token refresh and other interceptors.

**Acceptance:** Missing/invalid/valid page-token tests, Person-open/reopen, wrong Tree, contacts, privacy approval/decline, ancestor/relationship responses, image upload/reload/delete, no unauthorized private content, no accidental automatic replay. **Origin:** CLAUDE Family Tree instructions; TechSummary 1415–1420; S6-017 and previous bounded R15 tests.

### WA-STD-11 — TNNA native authentication boundary

**PROPOSED requirement.** Native device-refresh credentials MUST retain device-bound session handling and never be treated as web cookie credentials. Keep the existing `AUTH_NATIVE` route contract and Android version/signing compatibility. Do not introduce a shared browser helper into TNNA without a separate approved native architecture review. The absolute lifetime question remains open, not implicitly resolved by standardization.

**Acceptance:** Explicit native route catalog, version compatibility tests, replay/revocation and device-scope tests, confirmed non-impact on installed devices. **Origin:** CLAUDE mobile rules, TechSummary principles, S6-010/032.

### WA-STD-12 — Controlled user data and mutation safety

**PROPOSED requirement.** Validate types, ranges, identifiers and ownership before mutations; use parameterized MySQL queries and full transactions for multi-write logical operations. Distinguish an expected duplicate-entry condition from an unforeseen database error without echoing database details. Maintain UTC rules, current schema authority and applicable MySQL compatibility constraints. Do not change data models merely to make error envelopes uniform.

**Acceptance:** Negative validation, cross-owner, duplicate, rollback, failed-update, and partial-failure tests with table/schema reconciliation. **Origin:** CLAUDE §11/14/17; TechSummary §13 and §20.

### WA-STD-13 — Test and evidence gate

**PROPOSED requirement.** Every standard or exception must map to source locations, exact tests, evidence timestamps, commit/ref, and status: `Documented`, `Source Verified`, `Tested Offline`, `Tested Local`, `Tested Hosted`, `Reviewed/Approved`, or `Open`. A test pass is bounded to its assertions and environment. Preserve prior R10/R14/R15/R16 evidence; do not repeat passing tests without an identified regression dependency. No percent-complete estimate substitutes for traceability.

**Acceptance:** Independent review can reproduce the reported evidence and distinguish live testing from synthetic injection and source-only inspection. **Origin:** Stage6_Render_TestPlan and Stage6_OpenItems.

### WA-STD-14 — Documentation authority, change approval, and release

**PROPOSED requirement.** After approval, give each standard an ID and version history; link normative rules from `CLAUDE.md` and summarize architectural consequences in `TechSummary.md`. Record every approved exception. Do not overwrite the user's documents without direct authorization. Require complete downloadable replacement artifacts for any future revisions, installed manually by user. Before merge into `main` or production deployment, finish acceptance reconciliation, rollback readiness and independent design-engineer/security review, then obtain express user approval.

**Acceptance:** Approved standard status, review sign-offs, changelog, conflict resolution, cross-references, source-to-requirement matrix and no unauthorized project writes. **Origin:** user operating constraints and S6-014/035.

## 3. Explicit exceptions and compatibility registry — draft

| Exception ID | Scope | Why not uniform | Required invariant | Status |
|---|---|---|---|---|
| EX-FT-01 | Public Family Tree contact-email verification | Recipient may not be signed in | Exact GET/POST token paths only; no adjacent public route | `SRC`, tests incomplete |
| EX-FT-02 | Public Family Tree privacy approval | Link-driven email workflow | Exact public router; approval validation; no disclosure | `SRC`, tests incomplete |
| EX-FT-03 | Private Person API | Requires per-visit page token and redaction | Tree membership, `X-FT-Page-Token`, response privacy | `DOC`+`SRC`, broader S6-017 open |
| EX-FT-04 | Multipart image uploads | `FormData`, route-specific Multer | Authorization and privacy checks, correct multipart boundary | `DOC`+`SRC`, prior bounded tests |
| EX-NT-01 | Notification unsubscribe and network verification | Public bearer-link access | Token limited to intended notification/network action | `SRC`, full negative matrix open |
| EX-TN-01 | TNNA auth, refresh and version | Device credentials unlike browser cookies | Native client/device separation; secure revocation | `DOC`+`SRC`, native acceptance open |
| EX-AD-01 | Admin management | Distinct verified-admin and Origin checks | Authenticated web context and approved admin permissions | `SRC`, negative breadth open |
| EX-TR-01 | Tracking page/time uploads | Telemetry needs session-aware lifecycle | Authenticated writes; no unsafe retry or credential leak | `SRC`, S6-025 incomplete |
| EX-LEG-01 | Direct Bearer `fetch` in existing pages | Transitional compatibility | Explicit migration inventory; preserve unsaved forms | `SRC`, S6-005 open |

**Exception approvals:** None granted by this draft. Registry describes current architectural distinctions; whether any specific nonconformity is formally permitted requires user/design-review decision.

## 4. Evidence-backed implementation traceability matrix

| Requirement / status | Baseline source evidence | What is established | What is NOT established | Priority |
|---|---|---|---|---|
| WA-STD-01 `DOC + SRC` | [CLAUDE §17](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view); pinned SHA | Source/change review required | No guarantee local/Drive/Render equality | High |
| WA-STD-02 `SRC` | [`server.js` L123–189](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L123-L189) | Mount paths and notable public bypasses | Exhaustive endpoint catalogue not completed | High |
| WA-STD-03 `DOC + SRC` | [`subscriptionAccess.js` L8–33](https://github.com/sthink1/wapps/blob/b5e2b06/middleware/subscriptionAccess.js#L8-L33), [`server.js` L163–185](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L163-L185) | Shared auth/entitlement gates for major routes | Every internal object-level ownership path not proven | Critical |
| WA-STD-04 `SRC` | [`waPlatform.js` L110–141](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js#L110-L141), [`BinForm.html` L480–507](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/BinForm.html#L480-L507) | Shared facade exists; some direct Bearer calls persist | Full frontend adoption and semantics | High |
| WA-STD-05 `SRC` | [`waPlatform.js` L112–132](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js#L112-L132) | Mutations are not automatically replayed by shared facade | Direct fetch callers and real-world race cases | Critical |
| WA-STD-06 `SRC + TEST-HIST` | [`server.js` L199–215](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L199-L215); [`stage6ExpectedClientError.js`](https://github.com/sthink1/wapps/blob/b5e2b06/services/stage6ExpectedClientError.js); [`users.js` L263–270](https://github.com/sthink1/wapps/blob/b5e2b06/routes/users.js#L263-L270) | Central 4xx fallback returns unmarked `.message`; handoff reports isolated unexpected 400/403 disclosure | Actual live sensitive disclosure not proven; R16-75 paused | Critical |
| WA-STD-06 `SRC` | [`budget.js` L77–92](https://github.com/sthink1/wapps/blob/b5e2b06/routes/budget.js#L77-L92); [`etf.js` L13–24](https://github.com/sthink1/wapps/blob/b5e2b06/routes/etf.js#L13-L24) | Distinct budget flag and ETF WeakSet alongside shared marker | These are not automatically unsafe; migration unapproved | High |
| WA-STD-07 `SRC` | [`waPlatform.js` L39–48](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js#L39-L48), [`server.js` L211–215](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L211-L215) | Nested central error response vs parser expecting string or top-level message | Runtime display for each caller not tested | High |
| WA-STD-08 `DOC + SRC` | [`server.js` L123–156](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L123-L156), [`track.js` L561–591](https://github.com/sthink1/wapps/blob/b5e2b06/routes/track.js#L561-L591) | Selected API mounts set no-store; sampled tracking error logs omit internals | Full log/cache disclosure review not done | High |
| WA-STD-09 `SRC` | [`server.js` L172–183](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L172-L183); [`notifications.js` L58–93](https://github.com/sthink1/wapps/blob/b5e2b06/routes/notifications.js#L58-L93) | Public path/method exceptions exist | Full token lifecycle and adversarial testing not complete | High |
| WA-STD-10 `DOC + SRC` | [`ftPrivacy.js` L102–130](https://github.com/sthink1/wapps/blob/b5e2b06/routes/ftPrivacy.js#L102-L130), [`familyTree.js` L8344–8405](https://github.com/sthink1/wapps/blob/b5e2b06/routes/familyTree.js#L8344-L8405) | Page-token gate/redaction and pet membership checks exist | Entire Family Tree surface not independently certified | Critical |
| WA-STD-11 `DOC + SRC` | [`tnna.js` L115–148](https://github.com/sthink1/wapps/blob/b5e2b06/routes/tnna.js#L115-L148); TechSummary §21 | Native version/verification endpoints separate | Full native replay/device tests pending | High |
| WA-STD-12 `DOC + SRC` | [`weights.js` L10–48](https://github.com/sthink1/wapps/blob/b5e2b06/routes/weights.js#L10-L48); [`utils.js` L30–36](https://github.com/sthink1/wapps/blob/b5e2b06/utils.js#L30-L36) | Parametrized, user-scoped sample; fixed DB error response | Comprehensive mutation/rollback coverage not established | High |
| WA-STD-13 `DOC` | Stage6_Render_TestPlan v2.3; Stage6_OpenItems rev3.3 | Bounded acceptance evidence and outstanding register | No new tests executed in this drafting step | High |
| WA-STD-14 `DOC` | Stage6_OpenItems S6-014/035; user's handoff | Independent review is an explicit release gate | No release approval conferred | Critical |

## 5. Review decisions required before treating this as policy

1. **Adopt authoritative standards model:** Should this be an independent `WA_Programming_Security_Standards.md` with references from `CLAUDE.md` and `TechSummary.md`, or should those documents themselves hold the complete normative wording? Recommendation for consideration: dedicated versioned standards + cross-reference, avoiding contradictory duplicate instructions.
2. **Choose intentional-error representation:** Existing shared WeakSet marker versus a versioned class/factory. Avoid silently assuming that untrusted `error.status` is safe.
3. **Select API error envelope and migration strategy:** Preserve current consumers until inventoried and tested; no blanket payload change.
4. **Approve endpoint classification and exception register:** Public tokens, Family Tree, TNNA, admin, tracking, and legacy direct fetch must be explicitly documented.
5. **Decide browser support and compatibility policy:** Web Locks fallback, token storage transition, cache/service worker version synchronization.
6. **Set minimum evidence gates:** Source review, safe synthetic failure tests, representative local and hosted checks, UI regressions, negative permission tests, independent design review.

No item above is an authorization to make a code or document change. A separate user decision is required to promote this draft to authoritative standards.

## 6. Implementation sequencing — proposal only

**Phase 0 — Baseline:** Reconcile GitHub pinned `b5e2b06` against authoritative current Drive source, current branch head and actual staging deployment (read-only). Record discrepancy before recommending edits.

**Phase 1 — Contract design:** Approve external error envelope, expected-error classification and access/exception catalog. Identify every consumer of existing error shapes and direct fetch paths. Map existing R16-74B and S6-041 findings; preserve R16-55–73A accepted evidence.

**Phase 2 — Controlled corrections after separate approval:** Design compatibility-safe changes as complete downloadable artifacts, not direct project edits. Central-handler issue R16-75 remains blocked until approved contract and impact review.

**Phase 3 — Verification:** Synthetic unexpected 400/403/500/503, expected validation and status tests, browser UI error parsing and preservation of form state, permissions, page token, multipart, TNNA scope, and no-unsafe-replay regression; targeted hosted staging only with user authorization.

**Phase 4 — Independent review and disposition:** Obtain independent design-engineer/security review after full Stage 6 test reconciliation; record disposition and user approval before `main` or production consideration.

## 7. Stage 6 historical test preservation and limits

Preserve completed bounded R10, R14 and R15 results; R16-55–62 Family Tree/Notifications/Subscriptions targeted sanitization; R16-63–66 privacy correction offline 11/11 plus staged checks; R16-68–70A tracking provider notes offline 6/6 and bounded HTTP checks; R16-71–73A refresh-session offline 11/11 and hosted no-cookie 401 `REFRESH_INVALID`. These are **handoff-reported prior results, not rerun in B5**. R16-74B central-handler synthetic unexpected 400/403 disclosure remains open; no real sensitive-data incident established. Do not add a new completion percentage.

## 8. Draft review checklist

- [ ] Confirm latest authoritative version of each existing `.md` and active implementation source.
- [ ] Validate entire endpoint inventory, not just representative routes.
- [ ] Cross-check required `UserID`, tree-membership, admin and subscription gates against handlers.
- [ ] Identify every frontend API caller and expected HTTP/JSON structure.
- [ ] List all explicit exception paths with owner, rationale and tests.
- [ ] Choose common expected-error classifier and public error contract with compatible rollout.
- [ ] Define safe logging, cache, and diagnostics policies.
- [ ] Check cross-tab session lifecycle, unauthorized mutations and unsaved forms.
- [ ] Review TNNA/mobile and Family Tree special contracts.
- [ ] Link each standard to tests and evidence; preserve bounded PASS records.
- [ ] Complete independent design-engineer/security review before any release decision.
- [ ] Obtain express user approval before adopting this draft or generating code revisions.

---

**Final B5 disposition:** **DRAFT PREPARED FOR TECHNICAL REVIEW, NOT APPROVED.** Code implementation has not been certified to conform to these standards. R16-75 remains paused. All inspection was read-only; the only new artifact is this standalone Markdown report outside the user's project repositories and folders.
