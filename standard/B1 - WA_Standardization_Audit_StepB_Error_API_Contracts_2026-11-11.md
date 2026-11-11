# Wonderful Apps — Documentation-to-Implementation Audit
## Step B1: Standardization of backend error handling and HTTP API responses

**Assessment date:** November 11, 2026  
**Status:** Detailed **read-only assessment for owner/engineering review**. Not an approved implementation standard, release decision, or correction package.  
**Authority:** Current root-level Google Drive `CLAUDE.md` and `TechSummary.md`; current Stage 6 documents, compared with **GitHub `sthink1/wapps` commit `b5e2b06`** (last user-confirmed Live staging commit in November 10 handoff). Google Drive remains the authoritative project-file repository. GitHub is inspected solely for committed implementation evidence.  
**Scope:** Error classification; public HTTP error sanitization; HTTP status and response formats; overlapping shared/local utilities; dependency on authentication, authorization, logging and regression gates. **Not** a full security certification.

## 1. Executive findings

1. **Confirmed cross-module mismatch:** The central `server.js` error handler emits `err.message` for an HTTP 400–499 exception **without checking** whether that exception is approved for public disclosure. The shared `stage6ExpectedClientError` marker is instead checked by several recently corrected route modules. A prior isolated R16-74B test reportedly reproduced disclosure for synthetic unexpected 400 and 403; it did not prove actual hosted or production sensitive-data leakage.
2. **Confirmed classification duplication:** Family Tree, Notifications, subscriptions, refresh-session, and privacy use the shared `services/stage6ExpectedClientError.js` classification in selected flows. ETF uses its **own WeakSet** and Budget uses a **module-local `budgetExpected` property** for certain validation paths. This diversity is an objective standardization finding; it does **not** alone prove a vulnerability in those paths.
3. **Confirmed response-shape diversity:** Public error bodies include `{error:'...'}`, `{message:'...'}`, `{error:{message:'...'}}`, and specific structured application codes/fields. No single comprehensive HTTP error-envelope contract was identified in the examined primary architecture documentation. **Do not blindly change formats:** existing callers may depend on them.
4. **Documentary distinction:** `CLAUDE.md` says to keep backend error handling consistent and avoid duplicate utilities; `TechSummary.md` portrays a shared request-processing architecture. The Stage 6 issue register more specifically requires an agreed error-response policy and standardized API error envelope. However, those documents do not presently demonstrate a single enforceable, fully specified exception-to-public-response policy already binding every module at the time it was authored.
5. **Prior-test preservation:** R16-55–73A targeted fixes and bounded PASS results remain accepted as described in the November 10 handoff. S6-041 is not closed. R16-75 stays paused. Independent design-engineer review is required before any `main`/production decision.

## 2. Exact source and authority references

### 2.1 Current authoritative documentation

- [`CLAUDE.md`](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view), root of `My Drive/wonderfulApp`, **last updated October 13, 2026**, §14 lines **1003–1018**: follow route/module style; return suitable HTTP status codes; **“Keep error handling consistent with the project.”**; avoid duplicating shared utilities; update both principal documents when architecture or standards change.
- Same document, §11 lines **882–890**: do not log secrets/tokens, validate user input, use parameterized SQL, preserve CORS restrictions and ownership/security checks; §17 lines **1114–1134** requires examining frontend, backend route(s), schema, ownership, validation and related application effects prior to changes.
- [`TechSummary.md`](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view), root, **last updated October 13, 2026**, §12 lines **1109–1127**: request pipeline traverses CORS, parsing, authentication, subscription/route authorization, DB, JSON response, frontend rendering, and logging/error handling. §20 lines **1343–1369** supplies a development checklist. The diagram is **descriptive**, not a complete exception/error-envelope specification.
- [`Stage6_OpenItems.md`](https://drive.google.com/file/d/1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh/view), internal consolidated **revision 3.3 / November 9, 2026** (Drive metadata last modified November 10): **S6-005** shared authenticated request/session handling (line 147); **S6-008** 401/403 behavior (line 150); **S6-018** refresh/login/network/503 handling and unsaved form preservation (line 160); **S6-030** sensitive error payloads/logs (line 172); **S6-033** common API error envelope/naming (line 175). At lines **369–375**, **S6-041** explicitly requests a reviewed route inventory, an **agreed error-response policy**, targeted validation/unexpected-exception tests, and independent engineering approval.
- [`Stage6_Render_TestPlan.md`](https://drive.google.com/file/d/1DUyRKaa9vph6oetGgIVe0LC6X55vTJye/view), consolidated v2.3, internal November 9, 2026: formal R01–R20 plan and historical evidence; bounded results must not be promoted to whole-system acceptance.
- [`Stage6_Current_Testing_Status.md`](https://drive.google.com/file/d/1jKtvqVGGA2nhPASsJmJZJlP11ZNFS3BB/view), prepared November 10, 2026, is a **working snapshot with an earlier cutoff**. The November 10 attached handoff supplies later R16-55–74B continuity evidence; do not overwrite either ledger.

### 2.2 Pinned implementation evidence

All following code links are read-only observations at **`b5e2b06`**, **not** a claim that the current branch HEAD, uncommitted Drive/local source or currently Live Render revision is byte-identical. Source line numbers refer to that pinned commit.

| Reference | Exact observation |
|---|---|
| [`server.js` L199–215](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L199-L215) | Central middleware preserves valid 4xx/5xx status. Public message is fixed for 5xx, but a nonempty `err.message` is returned for **any** 4xx. Handler logs a redacted status-only line. |
| [`stage6ExpectedClientError.js` L1–18](https://github.com/sthink1/wapps/blob/b5e2b06/services/stage6ExpectedClientError.js#L1-L18) | Shared `WeakSet`, with `markExpectedClientError` and `isExpectedClientError`. Comment explicitly says unexpected exception status alone is insufficient. |
| [`routes/users.js` L263–270](https://github.com/sthink1/wapps/blob/b5e2b06/routes/users.js#L263-L270) | `/refresh-session` retains approved message only for 4xx marked expected; unexpected failure returns public fallback while keeping the chosen status. |
| [`routes/familyTree.js` L39–55](https://github.com/sthink1/wapps/blob/b5e2b06/routes/familyTree.js#L39-L55) | Family Tree helper retains expected marked 4xx text and suppresses unexpected exception details. Also has guarded detail classification. |
| [`routes/familyTree.js` L8436–8448](https://github.com/sthink1/wapps/blob/b5e2b06/routes/familyTree.js#L8436-L8448) | Multer error-handler directly returns `err.message` for `multer.MulterError`; whether every possible library message is suitable for disclosure remains **unassessed**, not a confirmed defect. |
| [`routes/ftPrivacy.js` L6–19](https://github.com/sthink1/wapps/blob/b5e2b06/routes/ftPrivacy.js#L6-L19) | Helper uses shared marker and fallback `Privacy request failed.` for unmarked/unexpected errors. |
| [`routes/notifications.js` L6–25](https://github.com/sthink1/wapps/blob/b5e2b06/routes/notifications.js#L6-L25) | Shared marker used to decide public 4xx message; fallback sanitization for other cases. |
| [`routes/subscriptions.js` L49–60](https://github.com/sthink1/wapps/blob/b5e2b06/routes/subscriptions.js#L49-L60) | Expected 4xx may be sent directly; unexpected 4xx are forwarded with a replacement safe message. This compensates for the present central handler and thus establishes a cross-module integration dependency. |
| [`routes/etf.js` L12–25](https://github.com/sthink1/wapps/blob/b5e2b06/routes/etf.js#L12-L25) | **Separate ETF-specific WeakSet** marks local expected errors, rather than importing the shared marker. Some catch blocks use this to allow 400 messages; e.g. L118–125. |
| [`routes/budget.js` L77–92](https://github.com/sthink1/wapps/blob/b5e2b06/routes/budget.js#L77-L92) | **Separate `budgetExpected` boolean** plus status-specific predicate. This is distinct from shared WeakSet classification. |
| [`utils.js` L30–36](https://github.com/sthink1/wapps/blob/b5e2b06/utils.js#L30-L36) | `handleDbError` logs a fixed line and emits a fixed duplicate error or caller-supplied public error; it is not the central Express exception middleware. |
| [`routes/track.js` L566–603](https://github.com/sthink1/wapps/blob/b5e2b06/routes/track.js#L566-L603) | Tracking routes emit fixed error text on sampled 500 paths. These paths were not fault-injected here. |

## 3. Standardization traceability matrix — error/response phase

**Legend:** `C` compliant within sampled scope; `D` confirmed implementation difference; `G` documentary specification gap; `T` further implementation/test confirmation required. `D` is not automatically a security incident. Risk is provisional.

| ID | Normative or descriptive documentary basis | Observed implementation | Result | Risk / confidence | Next review decision |
|---|---|---|---|---|---|
| ERR-01 | CLAUDE §14 “Keep error handling consistent”; S6-041 demands agreed policy | Central 4xx outputs raw unmarked exception message; shared-marked route helpers are stricter | **D + G** | High / high | Agree on global expected-versus-unexpected classification semantics before R16-75 |
| ERR-02 | CLAUDE §14 avoids duplicated shared utilities | Shared WeakSet vs ETF WeakSet vs Budget boolean flag | **D** (multiple approaches), not a proven exploitation | Medium / high | Define an approved interoperable classifier; map callers and migration risks |
| ERR-03 | S6-033 explicitly requires common HTTP error envelope | `error` string vs `message` string vs `error.message` object; privacy-specific `code` + message | **G + D** | Medium / high | Inventory frontend consumers and decide versioning/backward-compatible envelope |
| ERR-04 | CLAUDE §14 suitable status codes; S6-008/018 status distinctions | `/refresh-session` preserves status with safe fallback; central handler preserves unexpected 4xx status | **T** | High / medium | Decide whether unexpected 4xx should retain status or transform; preserve auth/authorization meaning |
| ERR-05 | CLAUDE §11 sensitive logging prohibition, S6-030 | Central and sampled routes log redacted static messages; broader logs not exhaustively read | **C** in sample + **T** overall | High / high for sample | Separate exhaustive log-source and hosted-runtime review |
| ERR-06 | S6-041 public messages must separate approved validation from internal exception detail | Family Tree/Notification/Privacy selected helpers comply; `multer.MulterError` has direct library message output | **C** sampled helpers; **T** Multer | Medium / high | Inspect possible Multer error types and public-copy requirements; no premature conclusion |
| ERR-07 | CLAUDE §17, TechSummary §20 require cross-module impact and regression consideration | `subscriptions.js` currently depends on central handler behavior, special local fallback | **T** | High / high for dependency | Trace every `next(err)` path before changing central middleware |
| ERR-08 | S6-018 requires correct 401/403/503 and unsaved forms | Limited routes and handoff tests; frontend consumer matrix not yet completed | **T** | High / medium | Contract tests with representative frontend clients, including unsafe mutations |
| ERR-09 | S6-041 acceptance requires route inventory and targeted tests | This step samples a focused set of modules, not all endpoints/catch blocks | **T** | High / high | Do not mark S6-041 verified/closed |
| ERR-10 | CLAUDE §14 says architecture changes update both principal guides | October 13 guides precede newer R16 helper conventions | **G** (out-of-sync descriptions) | Medium / high | Determine intentional standards ownership and amendment procedure, without modifying docs yet |

## 4. Architecture interpretation and causal analysis

### Verified facts

- The October 13 primary documents require consistency and existing shared-utility reuse, but do not furnish a field-by-field global response schema or trust-based eligibility rule for exception `message` exposure in the examined sections.
- The Stage 6 register explicitly records common error-envelope work under **S6-033** as **Open** and an API-response disclosure review under **S6-041** as **Open**.
- At the pinned November 10 staging commit, three distinct ways of designating expected application errors are present in sampled modules; the central handler does not use the common marker.
- A prior **isolated synthetic R16-74B** test, documented in the handoff, showed `unexpected400Disclosed=true` and `unexpected403Disclosed=true`. No live leak was established.

### Reasonable inferences (not proof)

- The **broad wording** of the earlier development guide and the **later, open Stage 6 requirements** could allow separate programmers to implement locally consistent fixes without an integrated repository-wide error policy.
- Multiple local classifiers and different response JSON formats raise regression cost when a central handler is modified.

### Not established

- Whether the relevant rules existed in materially identical form **when each affected handler was originally authored**; whether the author read them; whether any separate instruction explicitly approved current behavior.
- Whether all active Google Drive source copies match the pinned GitHub commit, or whether the branch/Render deployment has advanced since the handoff.
- Whether a real public endpoint has exposed a sensitive error message in production or hosted staging.
- Whether every error envelope can be standardized without changes to deployed frontend, PWA cache state, or TNNA clients.

**Attribution:** Current evidence supports **both an implementation inconsistency and an incomplete enforceable specification**, but is insufficient to assign personal responsibility or establish the entire causal history.

## 5. Proposed standards for technical review — NOT YET APPROVED

The following are **candidate requirements for reviewer approval**, not requirements already found verbatim in the October 13 guides and **not** code-change authorization.

**STD-ERR-A: Error provenance.** Distinguish application-authored expected client outcomes from arbitrary exceptions using an explicitly approved, shared mechanism. A 4xx `status` property **alone** must never authorize publishing arbitrary exception text. Explicitly enumerate allowed exceptions for authentication, validation, and third-party/library errors.

**STD-ERR-B: Public error policy.** On unexpected failure, disclose no `stack`, SQL text, secret, URL with token, raw message, or internal diagnostic payload. Define stable fallback messages and statuses. Keep intended validation messages and preexisting authorization semantics where reviewed/approved.

**STD-ERR-C: Error response envelope.** Specify one versioned canonical schema (e.g., a stable `code` plus safe `message` and optional safe `details`) **only after** inventorying existing frontend/native parsing. Specify compatibility rules for old `error` strings, `message` strings, structured `error.message`, HTTP 401/403/409/422/429/500/503, and legacy `(be)` suffixes. No silent breaking change.

**STD-ERR-D: Middleware handoff.** Define exactly when a module sends responses itself versus calls `next(err)`; central middleware must not undo a route's sanitization. Define committed response, headers/cache policy, and no-double-send behavior. Special middleware such as Multer must have an audited public-error mapping.

**STD-ERR-E: Shared classifiers.** Maintain one approved public-error classification contract; local Budget/ETF behavior can be bridged only after inventory of all marked errors and call-site semantics. Avoid assuming the different local tags can be globally replaced without regression.

**STD-ERR-F: Coverage gates.** Negative tests must cover *expected 400/401/403/404/409*, **unexpected** 400/403/500/503 (synthetically as needed), status and JSON shape, logging/caching, missing/invalid Origin, permissions, and retry-safe request behavior. Include a static cross-route search gate for suspicious `err.message` responses plus manual adjudication of matches; string searches alone are not a complete audit.

**STD-ERR-G: Change-control/evidence.** Every architecture or shared-contract change records: approved rule ID, exact affected paths/consumers, Git commit baseline and Drive/source correspondence, backward compatibility, unit/integration/hosted test scopes and limitations, documentation revision, independent design review, and user installation approval.

## 6. Preservation of completed Stage 6 evidence

As stated in the attached **November 10 handoff**: R16-55–62 Family Tree/Notifications/Subscriptions targeted sanitization, R16-63–66 privacy offline 11/11, R16-68–70A Tracking provider offline 6/6 plus local/hosted samples, R16-71–73A refresh-session offline 11/11 and hosted/local no-cookie 401 all retain their respective bounded PASS status. Synthetic unexpected-path tests are **not** upgraded into live fault-injection PASS claims. R10/R14/R15 bounded PASS results remain. Prior planning **~70%** is not an audited formal completion fraction. **R16-75 is paused**; S6-041, S6-033 and final independent review remain open.

## 7. Next focused read-only step

**Step B2 — Consumer and middleware traceability:** Review shared `WA.session`/`WA.api` and representative frontend Budget/ETF/Family Tree/Notifications callers; examine auth/subscription middleware and `next(error)` flows to establish concrete backward-compatibility constraints for canonical HTTP response semantics. Then proceed to common logging and test/review gates. Before considering any implementation, reconcile current Google Drive source with pinned code and relevant historical revisions.

No WA project file, Google Drive file, GitHub item, database, Render deployment, or user local file was altered to produce this assessment. This Markdown report is a **separate download-only review artifact**.
