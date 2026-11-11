# Wonderful Apps — Step B6 Technical Completeness and Consistency Review

**Document ID:** WA-STD-REVIEW-B6  
**Version:** 1.0 — Review findings, not an adopted standard  
**Date:** November 11, 2026  
**Review target:** `WA_Programming_Security_Standardization_Specification_DRAFT_2026-11-11.md` (B5, version 0.1, 28,260 bytes)  
**Disposition:** **REVISIONS REQUIRED BEFORE APPROVAL**. B5 remains a proposal. This review does not change it, amend authoritative project documents, or authorize implementation.

## 1. Review mandate and limits

**Primary priority: standardization.** Determine whether B5 is a technically complete, internally coherent, testable governing standard for WA programmers and reviewers. The review compares B5 against authoritative `CLAUDE.md`, `TechSummary.md`, the Stage 6 open-items register, and selected read-only code at GitHub commit `b5e2b06`. It explicitly separates **documented existing rule**, **verified code behavior**, **proposed future rule**, and **not yet proven**.

This is a *targeted consistency audit*, **not** an exhaustive inventory of all source, installed devices, database contents, history at the time a feature was written, current Render deployment, or all R01–R20 evidence. No runtime tests were executed and no existing PASS was reclassified. Google Drive, GitHub, local WA project, databases, and Render remain read-only/unmodified. The only created file is this standalone report for download.

### Grounding and source-of-truth hierarchy

| Reference | Verified location | Review use / currency caveat |
|---|---|---|
| B5 version 0.1 | Local standalone generated draft, exact path stated above | Review target, **not** policy |
| `CLAUDE.md` | [Drive authoritative root file](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view) | Existing written instructions; modified October 13 |
| `TechSummary.md` | [Drive authoritative root file](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view) | Descriptions and explicit frontend source rule; modified October 13 |
| `Stage6_OpenItems.md` | [Drive current registered file](https://drive.google.com/file/d/1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh/view) | Revision 3.3 content, last Drive modification November 10; historical text and partial results retained |
| `Stage6_Render_TestPlan.md` | [Drive current plan](https://drive.google.com/file/d/1DUyRKaa9vph6oetGgIVe0LC6X55vTJye/view) | Revision 2.3; bounded R10/R14/R15 evidence preserved |
| Pinned source baseline | [GitHub `sthink1/wapps` at `b5e2b06`](https://github.com/sthink1/wapps/tree/b5e2b06) | Handoff-confirmed baseline, **not automatically current Drive/worktree/Live** |

**Conflict principle:** Current code confirms implementation at its commit, but does **not** silently repeal a normative security requirement. Older descriptive documentation is not proof of current code. Resolve contradictions through a documented review decision and dated source reconciliation.

## 2. Executive disposition

**Decision: B5 is a useful architecture-level proposal but is not approval-ready as a comprehensive authoritative WA standard.** Its 14 requirements cover the central security themes and correctly preserve necessary exceptions; however, several existing WA requirements and Stage 6 gates are absent or insufficiently explicit, and some draft wording could be misread as implying a chosen policy or completed test.

**Five priority findings:**

1. **B6-01 (High): Existing mandatory HTML pretty-formatting standard omitted.** `TechSummary.md` §14 lines 1150–1169 says *all HTML must remain pretty formatted* and an edited HTML file must be formatted completely without altering behavior. B5 does not reproduce or cross-reference this mandatory rule as an enforceable requirement.
2. **B6-02 (Critical documentation discrepancy): Administrator identity in `TechSummary.md` is stale relative to pinned implementation.** TechSummary lines 504–511 say administrator is `UserID===1` **or** JWT username matches `ADMIN_USERNAME`; `services/administratorAccess.js` at `b5e2b06`, lines 11–29, uses a database-confirmed `IsAdministrator===1` **and** configured username match. B5 appropriately demands verified administrator checks, but does not document this confirmed discrepancy or demand a resolution before standardizing admin authority.
3. **B6-03 (High): TNNA refresh *duration* and absolute-lifetime *policy* need separate normative language.** `CLAUDE.md` §10.4 lines 827–839 explicitly documents an 8-hour access JWT, a 180-day refresh token, rotation and up-to-30-day network-offline mode under conditions. `tnna.js` at pinned commit lines 17 and 28 declares/uses a 180-day refresh issuance duration. S6-032 (Open) asks whether to add an **absolute cap**; B5's “absolute lifetime question remains open” is accurate but incomplete unless it explicitly preserves existing documented timing and distinguishes sliding issuance from cap decisions.
4. **B6-04 (High): B5 lacks explicit standards for several open Stage 6 controls:** origin/CSRF, browser cache/version skew, refresh replay family, service-worker updates, test DB/environment identity, rate limiting/IP provenance, challenge and reset-token integrity, token-in-`localStorage` XSS/CSP, and rollback/migration gates. Some appear as acceptance hints but not independently testable mandatory contracts.
5. **B6-05 (High): Approval and conformance states are insufficiently separated.** B5 uses `DOC + SRC` in a requirement table that might be misread as compliance despite each `WA-STD-*` being a proposal. A formal policy needs independent columns for normative provenance, implementation evidence, tests, exception decision, and approval status.

**R16-75 remains paused.** `server.js` L199–215 at `b5e2b06` can expose unexpected 4xx `err.message` in its central response; the prior isolated synthetic 400/403 result is preserved as *source-level and test-reported risk*, **not** proof of a live sensitive-data incident. B5 correctly proposes explicitly marking expected user-facing errors and compatible response parsing; it does not authorize fixes.

## 3. Findings register — detailed and actionable

Severity refers to **importance for completing the standard**, not proof of an exploited security vulnerability. Changes below are **recommended edits to a separately prepared B5 revision**, not direct edits to user files.

| ID | Severity | Finding | Evidence | Required disposition before approval |
|---|---|---|---|---|
| B6-01 | High | Existing mandatory whole-file HTML readability/format rule omitted | TechSummary §14 L1150–1169 | Add WA-STD-FRONTEND-SOURCE; preserve IDs/selectors/logic and verify formatting-only diff |
| B6-02 | Critical | Descriptive administrator identity rule conflicts with pinned current source | TechSummary §6.7 L504–511; `services/administratorAccess.js` L11–29 | Reconcile historical/current authority; specify administrator verification invariant; forbid implicit UserID=1 privilege |
| B6-03 | High | Native 180-day issuance vs proposed absolute lifetime may be conflated | CLAUDE §10.4 L827–839; `tnna.js` L17–28; S6-032 L174 | Distinguish currently documented issuance/rotation/offline policy from unapproved absolute cap; no native change |
| B6-04 | High | Shared API retry rules don't formally cover idempotency and ambiguous delivery for all callers | B5 WA-STD-05; S6-006/007/018/020/025/027 | Define read retry, mutation replay, idempotency, late-response and uncertain delivery tests separately |
| B6-05 | High | CSRF/Origin and cookie constraints too dispersed | B5 WA-STD-08/09; S6-019 L161 | Dedicated policy with exact-origin validation, Secure/SameSite/HttpOnly behavior by environment and negative tests |
| B6-06 | High | Missing formal lifecycle/credential scope for reset/login challenges and refresh replay | S6-006, S6-021–023, S6-029 | Dedicated challenge/refresh token family policy and tests, with unapproved choices marked `DECISION REQUIRED` |
| B6-07 | High | `localStorage.token` XSS/CSP risk only contextual | B5 WA-STD-04; S6-028 L170 | Explicit transitional-storage risks, output encoding, third-party scripts, CSP feasibility and migration decision |
| B6-08 | High | Client asset/service worker versioning missing as enforceable rollout contract | S6-024 L166; TechSummary frontend source rules | Specify compatible deployment units, SW cache invalidation and stale-client acceptance |
| B6-09 | High | Environment/database identity and deployment rollback not detailed | S6-011–013, S6-031; B5 WA-STD-01/14 | Explicit development/staging/prod identity, secret separation, startup refusal and rollback test gates |
| B6-10 | Medium | Rate limiting / trustworthy client IP lacks independent standard | S6-012 L154 | Define proxy trust, abuse fairness, lockout, rate limit and diagnostic constraints |
| B6-11 | High | Error envelope examples could be treated as approved external contract | B5 WA-STD-07 example; current `{error:string}`, `{message:string}`, `{error:{message}}` | Keep illustrative example, add explicit `UNDECIDED` envelope and consumer-specific compatibility matrix before coding |
| B6-12 | Medium | “Only explicitly created errors may be displayed” needs strong provenance control | B5 WA-STD-06; `server.js` L207–213 | Define approved factory/class/marker semantics, 4xx exception adversarial cases and anti-forgery trust boundary; no broad raw message propagation |
| B6-13 | Medium | Exceptions registry has no assigned review owner, test IDs, expiry/reevaluation date | B5 §3 | Add reviewer, scope, contract, test refs, risk, expiration/review trigger and approval status columns |
| B6-14 | High | Full HTML/JS and backend source conventions not all captured | CLAUDE §14 L1003–1018; TechSummary §14 L1150–1169; B5 | Include shared conventions for naming, formatting, existing module reuse and avoiding unrelated changes |
| B6-15 | High | Database rules are too broad for authoritative schema authority and backward compatibility | CLAUDE §12 and §17; TechSummary §13; B5 WA-STD-12 | Specify schema snapshot/version, `UserID`, UTC, transactions, parameterization and partial-write rollback acceptance |
| B6-16 | High | R10/R14/R15/R16 evidence is not mapped test-by-test into conformance | B5 §7; Stage6 plan and open items | Build evidence register that never treats bounded PASS as whole-project certification |
| B6-17 | High | `DOC+SRC` in B5 traceability can be misunderstood as test-complete | B5 §4 | Split columns for rule history, source observation, offline/local/hosted test, approval and open gap |
| B6-18 | Medium | Test browser matrix missing explicit platforms | S6-026 L168, S6-036 L178 | Define Chrome Normal/Incognito, Edge, Firefox, dedicated DuckDuckGo Windows, unsupported Web Locks behaviors |
| B6-19 | Medium | Privacy public-token exceptions need more explicit information-leak and token-route controls | S6-017/019 and `server.js` L172–183 | Require exact method, token expiration/reuse, URL/referrer/logging and negative path matrix |
| B6-20 | High | Policy precedence and drift remediation not fully governed | CLAUDE §1/17; TechSummary §21; B5 §5 | Explicit policy effective date, owner, version, conflict-resolution workflow, review cycles, and adoption gate |

**Interpretation safeguards:** Item severity does not certify a live security exposure. `Technical missing standard` is not equivalent to `code lacks the defense`. Existing code and earlier tests must be inspected before assigning an implementation defect.

## 4. Coverage matrix: Stage 6 register to B5

| Stage 6 item | Existing B5 coverage | B6 disposition |
|---|---|---|
| S6-005 Shared session and API | WA-STD-04/05 | **Partial** — migration inventory and page-specific callers still outstanding |
| S6-006 Replay/token family | WA-STD-05 hints | **Insufficient** — decide family revocation policy and safe concurrency |
| S6-007/027 Account switch races | WA-STD-05 | **Partial** — late-response browser tests and identity fences needed |
| S6-008/018 401/403/503/network/unsaved data | WA-STD-04/05/07 | **Partial** — normative result-state model and browser cases needed |
| S6-009 Subscription/admin | WA-STD-03 | **Partial** — stale admin description, cross-account permissions test inventory |
| S6-010 Native continuity | WA-STD-11 | **Partial** — clarify existing durations and device rollouts |
| S6-011/031 Hosted isolation | WA-STD-01/14 | **Partial** — startup identity guard, wrong-target reject and secret/origin matrix |
| S6-012 Proxy/rate limits | Not substantive | **Missing independent standard** |
| S6-013 Migration/rollback | WA-STD-14 mentions | **Insufficient** — no detailed gate |
| S6-014/035 Independent review/traceability | WA-STD-13/14 | **Covered in principle**, evidence matrix incomplete |
| S6-015/016 Login/recovery UI preservation | WA-STD-04/13 hints | **Partial** — UI functional contract and unsaved form specifics needed |
| S6-017 Family Tree | WA-STD-10 | **Substantial**, detailed token/interceptor matrix remains |
| S6-019 Origin/CSRF | WA-STD-08/09 hints | **Insufficient dedicated standard** |
| S6-020 Logout uncertainty | WA-STD-05/13 | **Partial** — explicit confirmed vs unconfirmed revocation outcome |
| S6-021 New login supersession | Not explicit | **Missing decision and tests** |
| S6-022/023/029 Challenges/password policy | WA-STD-03/12 generic | **Missing detailed contract** |
| S6-024 Service worker versioning | Not explicit | **Missing independent standard** |
| S6-025 Tracking delivery | WA-STD-04/05/13 | **Partial** — no-exactly-once claim without proof |
| S6-026/036 Browser matrix | WA-STD-05 | **Insufficient platform-specific plan** |
| S6-028 XSS/CSP | WA-STD-04 acknowledgment | **Partial** — add explicit risk/mitigation gate |
| S6-030 Logging | WA-STD-08 | **Covered in principle**, complete source+runtime evidence lacking |
| S6-032 Native absolute lifetime | WA-STD-11 | **Decision open**, retain established issuance period |
| S6-033 Naming/error envelope | WA-STD-04/07/14 | **Substantial proposal**, adoption and compatibility open |
| S6-034 Provenance | WA-STD-01 | **Covered in principle**, actual source reconciliation outstanding |
| S6-041 Unexpected error disclosure | WA-STD-06/07 | **Covered in principle**, unresolved code risk remains |

This is a **standards coverage** matrix. It is not an assertion that any Stage 6 item has been completed or closed.

## 5. Required normative precision for a B5 v0.2 revision

The following are **proposed additions** for review. They do not automatically become authorized instructions.

### 5.1 Authorization identity and access classes

**Proposal:** The authoritative administrator standard should require server-side identity verification using the dedicated current administrator-access service, authenticated request context, matching configured administrator identity and current database state, rather than trusting a user ID, JWT username alone, or UI rendering. Describe the current source behavior independently of any historic documentation. Before approval, reconcile `TechSummary.md` §6.7 against current `administratorAccess.js` and test admin/non-admin/previous-admin scenarios. Do not equate subscription entitlement with record ownership.

### 5.2 Error contract and expected/unexpected errors

**Proposal:** A single explicit trust-protected error category determines which user-facing message may be returned. Status `400–499` **alone** never establishes that an error is expected. Keep HTTP status and client-readable code decisions separate; unexpected messages and stacks never reach callers. Record selected standard response schema only after enumerating all frontend and TNNA consumers. For each endpoint identify direct JSON responses, central forwarding, and middleware-specific error handling. Tests must cover unexpected 400/403/500/503, expected 400/401/403/404/409, nested/string formats, and unchanged successful payloads. R16-75 blocked until policy and client contract approved.

### 5.3 Frontend source formatting and behavior preservation

**Proposal:** Preserve the *already documented* `TechSummary.md` §14 HTML source-format requirement in the new standards, including consistent indentation, readable HTML/CSS/JS, no minification and whole-file formatting when edited; specifically prohibit functional changes to IDs, URL paths, event bindings, selectors, names and payloads as a side effect. Because whole-file reformatting can make security diffs harder to review, require a diff strategy separating formatting changes from semantic changes. This last review strategy is a **new proposal**, not a claim that existing documentation requires separate commits.

### 5.4 Session credential lifecycle and browser state

**Proposal:** Define `401` as auth failure requiring careful session handling, `403` as authorization/subscription denial that must not trigger token refresh, and network/5xx as potentially recoverable service failures without automatic logout. Do not automatically replay mutations; capture whether a request might already have reached the server. Preserve form data, stale-account guards, and explicit logout uncertainty. Document cross-tab concurrency, browser Web Locks support, named browser acceptance cases, and the temporary `localStorage` XSS/CSP review. Existing app behavior may need a staged compatibility exception.

### 5.5 Native TNNA lifetime policy

**Proposal:** Write existing `CLAUDE.md` facts separately: current documented 8-hour access JWT, 180-day refresh token issuance/rotation and conditional 30-day network-offline access; then explicitly label **whether to impose an independent absolute lifetime cap** as `POLICY DECISION OPEN — S6-032`. Do not interpret “180 days” as proof of an absolute cap. Test current source, device encryption and installed-client compatibility before any approved change. Other web KMLI lifetimes must be stated separately, as they are different contracts.

### 5.6 Origin, cookies, deployment and rollout

**Proposal:** Dedicated standards should specify per-route Origin/CSRF controls and appropriate cookie attributes; verify rejecting forged/untrusted Origins before sensitive mutations. Require environment identity at startup, staging-only test DB guard, segregated secrets, proxy IP provenance, explicit service-worker/cache version compatibility, backups, rollback rehearsals and explicit authorization before any production transition. Do not infer that passing selected R08 checks covers all cross-origin paths.

### 5.7 Evidence and exception approvals

**Proposal:** Each requirement/exception must have a unique ID, version/effective date, owner, reviewer, rationale, exact path/method and scope, source references, tests, risk if unsatisfied, authorization status and re-review trigger. Use separate evidence columns: `Documentation existing?`, `Source observed?`, `Unit/offline?`, `Local?`, `Hosted?`, `Independent review?`, `User approval?`. Approval of a standard is not certification of code conformance; passing a bounded test is not release authorization.

## 6. Duplications and internal consistency points

| Overlap in B5 | Risk | Proposed editorial resolution |
|---|---|---|
| WA-STD-03 vs 02 vs 09/10/11 | Generic authentication could override legitimate public/native/privacy routes | One access-class table as normative index; specialized sections add constraints without silently weakening generic rules |
| WA-STD-04 vs 05 | Session API adoption confused with safe retry policy | Separate *API caller contract* from *session lifecycle/replay invariants* |
| WA-STD-06 vs 07 vs 08 | Error classification, shape and logging intertwined | Define independent requirements: trust classification, public envelope, private diagnostics |
| WA-STD-01 vs 13 vs 14 | Baseline validation, test artifacts, authority and release gates repeated | Distinct lifecycle: source provenance → acceptance evidence → approval → rollout |
| B5 prose “MUST” and “SHOULD” while draft unapproved | Unintended attribution of new rules to earlier programmers | Retain bold **PROPOSED** banner, provenance per requirement and **effective date only after approval** |

**No current duplicate is a proven fatal contradiction** within the B5 draft; several provisions overlap and would benefit from cleaner allocation of authority.

## 7. Evidence-based change history / attribution caution

B5's strongest conclusions concern *current* pinned implementation and older existing documents, not historical culpability. For example, `CLAUDE.md` §14 says keep error handling consistent; the more precise marker-based sanitizer policy emerged during Stage 6. Therefore it would be incorrect to claim an earlier developer necessarily violated a detailed sanitizer rule unless a contemporaneous revision containing that rule is recovered. Likewise, a `TechSummary.md` descriptive statement made October 13 may be outdated by a later November implementation; the discrepancy requires updating documentation after approval, not assuming the implementation is wrong.

## 8. Concrete pre-approval decision register

| Decision ID | Decision needed | Recommended position for engineering discussion | Authority now |
|---|---|---|---|
| DEC-01 | Separate standards document vs full rules copied to guides | Versioned standards document as single normative source, guides link to it | **Not approved** |
| DEC-02 | Safe public API error schema | Choose after endpoint/front-end inventory; preserve existing clients during migration | **Not approved** |
| DEC-03 | Error marker/factory/class | Choose one explicit trusted classifier after compatibility review | **Not approved** |
| DEC-04 | Administrator identity rule | Reconcile older TechSummary and verified DB/config-based service; approve invariant | **Not approved** |
| DEC-05 | Browser support/Web Locks policy | Fail safe without token replay; test supported browsers | **Not approved** |
| DEC-06 | TNNA absolute refresh lifetime | Preserve current issuance while separately deciding cap and migration | **Open S6-032** |
| DEC-07 | Session supersession, family replay and logout uncertainty | Decide documented security semantics before cross-module change | **Open** |
| DEC-08 | Exception approvals and ownership | No exception becomes approved by appearing in the draft | **Not approved** |
| DEC-09 | Security, browser and environment test minimum | Define evidence gates; preserve bounded PASS findings | **Not approved** |
| DEC-10 | Policy approval and release authorization | Separate standards approval, code-conformance certification, independent review and user rollout consent | **Not approved** |

## 9. Ordered next actions — recommendations, not execution approvals

1. **Prepare B5 version 0.2 as a complete standalone downloadable Markdown replacement** that incorporates the approved-for-review corrections above. It must remain marked `DRAFT — NOT APPROVED` until the user expressly adopts it.
2. Add a formal **documentation discrepancy register**, beginning with administrator identity and TNNA duration/cap distinctions. Cite exact Drive sections and pinned source. Do not silently overwrite authoritative documentation.
3. Incorporate the missing existing frontend source rule, and add missing Stage 6 security/operational standards with test IDs and explicit undecided policies.
4. Publish an endpoint-level *contract annex*, not assumed to be complete from existing representative sampling. Identify exact route methods, auth class, object ownership, origin behavior, request/error shapes, frontend caller and existing tests.
5. After standards review, reconcile source versions and determine a minimally invasive R16-75 correction design. No code changes or live tests without separate authorization.
6. Preserve separate independent design-engineer review and release gate before any `main`/production step.

## 10. Formal outcome

**Step B6 result: REVISIONS REQUIRED BEFORE B5 APPROVAL.** The existing draft is a sound starting framework but omits an explicit pre-existing source rule and significant Stage 6 requirements. It must not be promoted to authority, nor may proposed behavior be described as implemented or verified. The current central unexpected-4xx disclosure concern remains open, and no live sensitive-data disclosure is established by this review. The user's project sources and services were neither edited nor tested in this step.

---

**Review completed:** November 11, 2026. **Next proposed artifact:** B5 specification v0.2, separately generated for user review. **No automatic approval or modification implied.**
