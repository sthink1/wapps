# Wonderful Apps — Documentation-to-Implementation Audit

**New-chat handoff — November 10, 2026**  
**Project:** Wonderful Apps (WA)  
**Purpose:** Independently compare the project's maintained architectural and development documentation with the implemented code and Stage 6 requirements **before** proceeding with R16-75.

## 1. User's decision and rationale

The user has consistently maintained `CLAUDE.md`, `TechSummary.md`, and other Markdown documents as Wonderful Apps evolved. The intent was that programmers would consult those documents, understand how the whole system fits together, and account for interactions with existing components before making changes.

Recent Stage 6 security testing revealed several related exception-message disclosure weaknesses across API modules. The user reasonably asks whether these reflect programmers not following documented architecture and instructions, incomplete documentation, or both. **Do not assume the answer in advance.** Establish it by comparing the actual current documents and code.

**User-approved decision:** Pause proposed **R16-75** central Express error-handler correction until this documentation-to-implementation audit is conducted in a new chat.

## 2. Precise audit objectives

Examine the authoritative, current versions of:

1. `CLAUDE.md` — development instructions, coding practices, architecture and cross-module responsibilities.
2. `TechSummary.md` — system architecture, security, database, routing, interfaces and technical decisions.
3. Relevant Stage 6 `.md` documents — security requirements, change history, test plans, acceptance criteria, implementation guidance and outstanding issues.
4. The relevant **actual source code**, with priority on error handling, authentication, authorization and middleware. Use the active files, **not** historical `*_COPY*` variants, as the implementation baseline.

Answer these evidence-grounded questions:

- **Already documented?** Did project documentation explicitly prohibit the newly discovered weaknesses or require a safer design? Quote the exact relevant clauses with source references and document dates where available.
- **Architecture clear?** Did it explicitly describe a common, system-wide error-handling and security contract? Distinguish *descriptive documentation* from *normative requirements*.
- **Actually implemented?** Does active code comply? Show exact file, function or route, and line references. Identify confirmed divergences versus merely possible concerns.
- **Missing requirements?** What architectural constraints or verification steps are absent, ambiguous, contradictory, stale or not enforced?
- **Why the gap?** Distinguish established facts, reasonable inferences and unknowns. **Do not accuse an original programmer of ignoring documents without evidence that the relevant instruction existed at the time and was applicable.** Historical revisions may be required to establish chronology.
- **How to prevent recurrence?** Propose a small set of enforceable repository-wide standards and test/review gates **after** comparing current documentation. Do not rewrite the documents without the user's authorization.

Deliver a clear **documentation-to-implementation traceability matrix**, with columns such as: document and section / exact requirement / code location / evidence / compliance (compliant, deviation, missing, ambiguous, requires test) / risk / recommendation / confidence. Distinguish documents' current state from what could have been in effect when code was originally authored.

## 3. Non-negotiable operating constraints

- **Read-only access to Google Drive:** do not create, edit, overwrite, move, rename or delete any Drive file or folder. This is explicit user instruction.
- **Read-only access to the user's local WA files:** never edit or remove the user's files. For future fixes, create **complete downloadable files in the assistant workspace** for the user to install manually; do not place changes into the project yourself.
- **Do not modify GitHub, any branch, Render services, test/production databases, or deployments.** In particular **do not change production or `main`**.
- Read/inspect connected Drive and GitHub source; no coding changes during the audit unless the user subsequently requests a separate correction artifact.
- Preserve all completed Stage 6 test results. Do not repeat established PASS tests without a specific reason.
- Proceed methodically, preferably **one focused step at a time**, share verified findings before suggesting changes, and state uncertainty rather than guessing.
- If browser checks later become necessary, default to **Chrome Incognito**. Explicitly say when **Chrome Normal** is required; none is required for the initial documentation review.
- Before any decision to merge into `main` or deploy to production, **independent design engineer review** is mandatory, as previously specified by the user.

## 4. Authoritative source locations

**Google Drive** — `My Drive / wonderfulApp`  
**Folder ID:** `1SBkEcRIb-ekv83-EoZXHkH0cderSHWec`  
**Windows reference path:** `G:\My Drive\wonderfulApp`  
Google Drive is the user's authoritative project-file repository. Inspect the **current** file versions; don't assume historical file names or summaries are complete.

**GitHub repository:** `sthink1/wapps`  
**Active Stage 6 branch:** `reviseLogIn`  
**Last user-confirmed Live Render staging commit:** `b5e2b06` on November 10, 2026. Pin code inspection to that commit first and check the current branch state before asserting it has not changed.

**Render Stage 6 staging service:** `wapps-stage6-test`  
**Staging URL:** `https://wapps-stage6-test.onrender.com`  
**Local development folder (user-managed):** `C:\AppProjectwDB\WonderfulAppsRender`  
**Local test-server command (user-managed):** `node --env-file=.env.test server.js`  
**Local test URL:** `http://localhost:8080`.

Local and hosted staging share the authorized test database, **not production**. Do not invoke the production environment configuration during testing.

Relevant known documentation IDs (check existence/version/current content rather than assume completeness):

- `docs/Stage6_Current_Testing_Status.md` — Drive ID `1jKtvqVGGA2nhPASsJmJZJlP11ZNFS3BB` (previously known to lag newer testing).
- `docs/Stage6_Render_TestPlan.md` — Drive ID `1DUyRKaa9vph6oetGgIVe0LC6X55vTJye` (previously identified as v2.3).
- `docs/Stage6_OpenItems.md` — Drive ID `1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh` (previously identified as rev3.3).

**Find and read `CLAUDE.md`, `TechSummary.md`, and additional directly relevant current Stage 6 documentation first.** If multiple copies or revisions exist, identify which is authoritative and date each one. Do not infer exact document wording from this handoff.

## 5. Recent Stage 6 confirmed results — preserve, do not re-run blindly

The broad Stage 6 security acceptance workflow is still underway. R16 security review is active; later browser matrix, native mobile (TNNA), concurrency, rollback and independent-design-review requirements remain outstanding or require reconciliation. An earlier planning estimate of ~70% complete was **not** a formal verified count; don't report a new completion percentage without reconciliation.

### 5.1 Accepted corrections

| Test sequence | Area | Verified evidence and limit |
|---|---|---|
| R16-55 to R16-62 | Family Tree, Notifications, Subscriptions | Initial error disclosure reproduced offline, targeted sanitization corrections tested (32/32 earlier), local and hosted representative cases PASSED. |
| R16-63 to R16-66 | Family Tree privacy | Unexpected 400 error-message disclosure reproduced offline; correction validated offline **11/11**, staged and hosted intentional-token cases passed. |
| R16-68 to R16-70A | Tracking provider notes | Source-level unexpected-error detail issue reproduced in isolated test; R16-69 sanitized three provider-status notes; offline **6/6 PASS**, local HTTP **200 / 8 rows / four provider rows present / zero unavailable**, hosted HTTP same; deployed at `72351ef`. Failure-path protection tested synthetically, not by an actual hosted provider failure. |
| R16-71 to R16-73A | `/users/refresh-session` | Unexpected 400 message disclosed in isolated offline test. R16-72 marks intentional Origin/token errors and sanitizes unexpected 4xx/5xx; offline **11/11 PASS**, local and hosted no-cookie HTTP **401 `REFRESH_INVALID` PASS**; user confirmed Render staging Live commit **`b5e2b06`**. Unexpected 4xx paths proven in offline tests, not by live fault injection. |

Previously completed R10/R14/R15 and earlier bounded R16 regression results remain preserved. Avoid overclaiming complete system security based on bounded checks.

### 5.2 Current unresolved finding: R16-74B, central Express error handler

At `b5e2b06`, active `server.js` has centralized Express error middleware that chooses public message as follows:

```js
const publicMessage = statusCode >= 500
  ? 'Internal Server Error'
  : (typeof err.message === 'string' && err.message ? err.message : 'Request failed');
```

An isolated offline test of the exact handler, using synthetic errors, produced:

| Check | Result |
|---|---|
| `unexpected400Disclosed` | **true** — failed security expectation |
| `unexpected403Disclosed` | **true** — failed security expectation |
| `unexpected500Sanitized` | true — PASS |
| `unexpected503Sanitized` | true — PASS |
| `statusCodesPreserved` | true — PASS |

**Interpretation:** Confirmed **source-level** risk of returning unexpected internal messages on 4xx exceptions through the central handler. **No live sensitive-data exposure was established.** A proposed **R16-75** fix is **paused** pending this audit.

Other source observations from the read-only review at `b5e2b06`:

- `utils.js` `handleDbError` returns fixed errors, not raw exception messages (it uses a distinct duplicate-entry error message).
- `routes/budget.js` and `routes/etf.js` implement intentional-client-error classifications. They were not re-certified exhaustively in R16-74.
- `routes/familyTree.js` has a `multer.MulterError` handler that returns `err.message`; whether this is an acceptable library-defined validation string or broader concern **requires assessment**, not an assumed finding.
- Some handlers call `next(error)` into the central handler, making the central handler especially important.
- A broad textual scan is **not** a complete control-flow or historical compliance audit. Check the actual current source and routing graph.

## 6. Suggested first work package in the new chat

**Step A — Read-only document inventory and baseline.** Discover the exact current Drive locations of `CLAUDE.md`, `TechSummary.md`, and relevant Stage 6 Markdown files. Record file names, path, modification dates and whether multiple copies exist. Read each authoritative file in full or in clearly defined relevant sections. Build a short indexed requirement list with citations. If the documents are large, start with their architecture/security/developer-process sections and explicitly record what has not yet been read.

**Step B — Trace concrete S6-041 examples.** Compare those requirements with `server.js` (central error handler), `routes/users.js` + `services/browserSession.js` (refresh-session), and the shared marker `services/stage6ExpectedClientError.js`. Then trace relevant Family Tree/privacy, subscriptions, notifications, and Tracking handlers. Look specifically at whether the system-wide rules were documented and whether earlier corrections obeyed them.

**Step C — Assess broader developer process.** Check whether the documents require pre-change impact analysis, cross-module security review, regression-test updates, consistency with project standards, and source/version verification. Note any gaps and recommendations; do not modify documents yet.

**Step D — Present factual matrix and decisions.** Categorize deviations, documentation omissions, stale/contradictory instructions, and unknown historical factors. Recommend whether R16-75 should follow the existing shared expected-error marker pattern and whether additional intentional 4xx errors need explicit classification first. Defer actual revision until approved.

## 7. Communication and evidence standards

- Explicitly label **Confirmed from current documents**, **Confirmed from source**, **Confirmed by isolated test**, **Inference**, and **Not yet established**.
- Cite exact connected file or GitHub source identifiers and line ranges where available. Do not fabricate citations or claim that a current version of a document existed when older code was written without revision evidence.
- Avoid attributing fault to any person without evidence. The user's maintained documentation framework should be examined before characterizing original architectural quality.
- Keep the new audit distinct from R16-75 remediation. The audit is an evidence-gathering and process-review project, **not** permission to change code or documentation.

## 8. Suggested opening instruction for the new chat

> Continue Wonderful Apps with the attached **Documentation-to-Implementation Audit handoff (November 10, 2026)**. Before proceeding with R16-75, conduct a read-only audit of the current authoritative Google Drive `CLAUDE.md`, `TechSummary.md`, and relevant Stage 6 Markdown documents against active code at GitHub `reviseLogIn` commit `b5e2b06`. Determine whether the identified security weaknesses violated existing documented requirements, reflected documentation gaps, or are not yet explainable. Cite exact evidence, preserve all Stage 6 PASS results, proceed one step at a time, and do not modify Google Drive, user local files, GitHub, Render, databases, `main`, or production.

---

**Status at handoff:** Documentation-to-implementation audit approved; **not yet conducted**. R16-75 correction **not started**. R16-74B central-handler disclosure **confirmed by isolated test**. The last R16-72 change is user-confirmed deployed Live on staging at `b5e2b06`.
