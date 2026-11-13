# Wonderful Apps — Standards Decision Register

**Document:** `WA_Standards_Decision_Register_v1.0_2026-11-12.md`  
**Version:** 1.0 — approved policy decisions; implementation pending  
**Decision date:** November 12, 2026  
**Project:** Wonderful Apps (WA)  
**Intended manual installation:** `My Drive/wonderfulApp/standard/`  
**Authority:** Project-owner decisions D01–D14 in the November 12, 2026 conversation  
**Status:** Decision record prepared for owner review and manual installation; **not itself a grant of permission to edit, test, deploy, or change project resources**.

## 1. Purpose and interpretation

This register records the fourteen policy and process choices expressly approved by the WA project owner during **Phase 0 — Standards Decisions and Approval**. It provides a stable basis for the proposed short **WA Core Programming Standards** (Step 2) and updated **WA Detailed Technical Standards v0.4** (Step 3).

**Authority distinctions**

- **Approved policy** means the owner selected the design direction or operating rule. It does **not** mean the current implementation complies, the complete technical design is settled, or tests have passed.
- **Selected direction, pending technical design** means the goal is approved but architecture, compatibility, test specifics, and/or migration choices remain open.
- **Explicit deferral** means the owner chose not to make the proposed improvements now. The risk remains in the findings register and should not be represented as remediated.
- **Preparation authorization** permits creating separate proposed deliverables for review. It is **not** permission to install, change a project file, execute hosted tests, merge, or deploy.
- This register is a retrospective record of the conversation, not an independently completed audit of current Google Drive, GitHub, source deployment, database contents, or device behavior.

The existing WA development restrictions remain applicable: Google Drive `My Drive/wonderfulApp` is authoritative; Google Drive, GitHub, and local WA project files are read-only to ChatGPT and reviewing engineers; separately generated deliverables may be downloaded and manually installed by the owner after review. Production and staging services, databases, repositories, and devices may not be changed by the assistant.

## 2. Decision index

| ID | Topic | Approved disposition | Nature of approval | Further work |
|---|---|---|---|---|
| D01 | Administrator access to private Family Tree data | **Full privacy access** for a centrally verified WA administrator | Policy approved | Bring nonconforming privacy checks into line; negative and positive tests |
| D02 | Administrator-transfer workflow | **Preserve existing pending/cancel/complete design**, subject to focused security review | Workflow direction approved | Define and verify exceptional transfer completion and transactional safeguards |
| D03 | Expected versus unexpected API errors | **Shared `WeakSet` provenance** plus controlled expected-error creation; generic unexpected errors | Security contract approved | Creator API, producer inventory and negative tests |
| D04 | API error-response format | **Future flat JSON** with gradual migration and compatible parsing | Format direction approved | Consumer inventory; transitional contract; scoped migrations |
| D05 | R16-75 | **Prepare narrow correction package only**, with no installation or broad envelope conversion | Preparation authorized | Separate source review, proposed files/tests/rollback, owner approval |
| D06 | Family Tree privacy codes | **Simple, recoverable, minimum four-character codes; no required encryption/hashing or forced reset** | Convenience-focused policy approved | Registered-email recovery safeguards; attempt limits; document residual exposure |
| D07 | Browser compatibility | **Expanded browser matrix**; fail-closed refresh when safe Web Locks coordination unavailable | Support policy approved | Device/browser acceptance matrix and user-facing recovery behavior |
| D08 | Browser JWT storage | **Modernization objective** to eliminate unnecessary persistent JS-readable token storage | Direction approved, mechanism open | Review architectural alternatives and staged migration |
| D09 | Web sessions | **Multiple devices, refresh rotation, replay containment, cross-tab coordination, same-browser supersession after verified new login** | Security behavior approved | Detailed replay/race policy and concurrency tests |
| D10 | TNNA native sessions | **Preserve existing native behavior; no new absolute lifetime cap** | Native policy approved | Compatibility tests for future shared-server changes |
| D11 | Public endpoints | **Preserve existing geocoding and Contact Us behavior; defer additional controls** | Explicit deferral | Keep engineers' findings open, review later |
| D12 | Standards format | **10–12 Core rules plus complete technical specification and annexes** | Document architecture approved | Draft Step 2 and Step 3, each subject to separate owner approval |
| D13 | Compliance | **Every WA code change gets a documented standards review, risk-based tests, and approval before installation** | Process approved | Practical checklist, evidence format and gates |
| D14 | Authority | **Owner-controlled standards and implementation; Drive authoritative; read-only reviewer access** | Governance approved | Version/approval controls and manual-install workflow |

All fourteen decisions were expressly approved by the owner on **November 12, 2026**. The **source implementations, standards documents derived from these decisions, and future releases are not thereby approved**.

## 3. Detailed decisions and boundaries

### D01 — Verified-administrator access to private Family Tree information

**Approved:** A properly verified WA administrator may access all private Family Tree information without entering an individual privacy key or obtaining separate privacy authorization.

**Administrator recognition remains governed by the previously approved `WA-SEC-ADMIN-001` two-gate rule:** use `services/administratorAccess.js`; look up the current authenticated account in `UsersT`; require **both** `IsAdministrator = 1` and a current database `UserName` matching configured `ADMIN_USERNAME` after trim/case normalization. Hard-coded user IDs, username-only checks, and JWT-only administrator declarations cannot grant administrator rights. Fail closed when verification cannot be completed.

**Scope boundary:** The owner approved **access to private Family Tree information**. D01 alone does not authorize editing every record, transferring ownership, changing credentials, or otherwise expanding mutation powers. Such permissions remain subject to endpoint-specific authorization.

**Known review issue:** The independent Codex design review identified a local username-only administrator helper in `routes/ftPrivacy.js`, inconsistent with the approved central rule. This is a reported confirmed source discrepancy, not evidence of an exploited incident. A separately authorized package and scoped tests are required before claiming compliance.

### D02 — Administrator-transfer workflow

**Approved:** Preserve the existing administrator-transfer approach, including preparation, pending state, cancellation, and completion. Perform focused security review and acceptance testing rather than replacing it without justification.

**Required review:** authorized initiator, successor identity, initiator/session and capability binding, expiry, cancellation, replay resistance, transactional database changes, configuration handoff, locking, audit, recovery from failures, and negative tests.

**Necessary distinction:** Completion after `ADMIN_USERNAME` changes can require a **special, narrowly scoped transfer authorization** rather than the ordinary administrator identity check applied at the wrong point in the sequence. This is not a general exemption from D01/`WA-SEC-ADMIN-001`. The exact special procedure remains to be reviewed and documented.

### D03 — API expected-error classification

**Approved:** Standardize on the existing shared `WeakSet`-based provenance mechanism in `services/stage6ExpectedClientError.js`, coupled with a controlled factory/creator contract for **deliberately safe, expected** public client errors.

**Required behavior:**

- An HTTP 4xx status does **not** establish that an error message is safe for public display.
- Only deliberately authorized, bounded business/validation messages may be disclosed.
- Arbitrary caught exceptions must **not** be marked expected solely to expose their messages.
- Unexpected errors receive fixed, non-sensitive generic public text regardless of the attached HTTP status.
- Prevent exposure of database/provider exception text, stack traces, credentials, tokens, and internal implementation details.
- Retain correct pre-existing status semantics and domain behavior wherever possible; test expected and unexpected cases independently.

**Implementation boundary:** The precise exported factory interface, caller migration, and diagnostic logging contract still require design and test review. D03 does not itself authorize the change.

### D04 — Gradual adoption of flat JSON error responses

**Approved future preferred shape:**

```json
{
  "error": "Invalid input",
  "code": "INVALID_INPUT"
}
```

`error` is a safe human-readable string; `code`, when included, is a stable machine-readable identifier. Do not use untrusted strings as HTML.

**Migration boundary:** Preserve existing response formats and app-specific fields until the relevant producers and all consumers have been inventoried. Shared client parsing (including `WA.api`) must recognize supported flat, nested and documented domain-specific shapes during transition. Maintain established HTTP semantics; separately approve changes to those semantics. D03's safety rule applies **independently** of response structure.

### D05 — R16-75 narrow correction package

**Approved:** Prepare, but **do not install**, a focused proposed R16-75 error-disclosure correction package. No project-wide error-response format migration is included.

**Preparation scope:** inspect authoritative current `server.js`, the shared expected-error module, relevant `next(error)` producers and direct-response handlers, and consumers of central error shapes; define expected vs. unexpected outcomes; include safe status/body/header behavior, negative tests, complete proposed files, compatibility checks and rollback instructions.

**Status:** Earlier R16-74B synthetic unexpected-400/403 disclosure findings remain historical failing evidence. **R16-75 remains paused** until the owner separately approves the specific reviewed implementation package. Approval of D05 was not authorization to execute tests against staging or alter any source.

### D06 — Simple, recoverable Family Tree privacy codes

**Approved:** Preserve user convenience. Privacy codes may have a **minimum of four characters**, using the current simple setting process. Existing codes remain recoverable; forgetting a code does **not** force changing it. The owner explicitly declined mandatory encryption or hashing for privacy-code storage.

**Recovery rule:** Existing codes may be sent to the **registered email address** following appropriate verification of the requester's identity/authority. A newly supplied or unverified address is not sufficient. Preserve existing codes in any future migration.

**Residual protections:** Reasonable controls against repeated guessing and unnecessary exposure in URLs, logs, error messages, or unauthorized API responses remain appropriate, without adding unreasonable normal-use friction. D01 verified-administrator privacy access remains effective.

**Explicitly accepted risk:** Readable recoverable codes increase exposure if database records are improperly accessed; short human-memorable codes offer limited guess resistance. The owner prioritized ease of use over storage confidentiality. This is **not** a finding that the storage has been audited or that every recovery/attempt-limit safeguard is implemented. Exact recovery verification and rate-limit thresholds remain design work.

### D07 — Supported browsers and safe refresh coordination

**Approved support matrix:** Windows Chrome, Edge, Firefox and DuckDuckGo; Safari on macOS, iPhone and iPad; Chrome on Android.

**Required behavior:** Preserve Web Locks-based coordination for safe refresh; when required coordination is not available, **fail closed** rather than introduce untested lock-free refresh. Provide useful reload/re-login guidance. Include targeted login, Keep Me Logged In, logout, restart, refresh, multi-tab, account-switch and cookie/PWA tests as applicable, including Apple Home Screen use.

**Boundary:** Browser support is an acceptance requirement, **not** a claim that the browser/device matrix has already passed testing. Other browsers may be evaluated separately and are not automatically certified.

### D08 — Long-term browser authentication/token-storage modernization

**Approved objective:** Move away from unnecessary *persistent JavaScript-readable access tokens*, including legacy `localStorage` usage, through a staged architectural redesign.

**Not yet chosen:** The final technical design. A short-lived access token held in memory with HttpOnly refresh cookie support is a **candidate**, not the approved replacement. Alternatives and their security/operational consequences must be reviewed first.

**Required compatibility:** Login, silent restoration, logout, Keep Me Logged In, reload/navigation, unsaved forms, cross-tab coordination, usage tracking, Family Tree privacy/uploads and the D07 browser matrix. Address XSS, CSRF, cookie attributes, session revocation and stale-client behavior. TNNA has its own D10-approved native model.

**Boundary:** Existing authentication and storage remain in place until the owner approves specific architecture, migration, tests and installation. Previous Stage 6 results are retained but affected scenarios must be reverified after shared auth changes.

### D09 — Multi-device sessions, replay safety and supersession

**Approved:** Permit independent sessions on multiple devices; rotate refresh tokens on successful renewal; reject consumed/revoked credentials; contain **confirmed** replay by revoking the affected session/family as appropriate without unnecessarily terminating unrelated devices. Preserve safe concurrent tab coordination.

**Same-browser replacement:** After successful verification of a new login, supersede the previous remembered browser session; failed login/verification must not revoke the valid previous session. Old asynchronous refresh responses must not restore an earlier account after logout or account switch. Logout should revoke the applicable server-side session and distinguish confirmed from unconfirmed revocation during network failure.

**Technical details open:** Distinguishing legitimate race conditions from hostile replay, session-family scope, database transaction order/locks, exact expiry/revocation semantics, and completion of multi-browser/multi-device acceptance. Approval is not proof that the current implementation satisfies these properties.

### D10 — Preserve existing Town Notification Native App (TNNA) sessions

**Approved:** Keep the documented native authentication design: **8-hour access JWT**, **180-day refresh-token validity and rotation**, conditional offline authenticated operation for **up to 30 days after the last successful online authentication**, device binding, Android Keystore-backed refresh credential encryption, and server-side logout revocation with local credential clearing.

Do **not** add a new absolute lifetime cap at this time. A rejected server session (HTTP 401) requires reauthentication according to the existing native flow; a temporary offline/network failure is not the same event. Keep TNNA separate from the D08 browser token-storage modernization unless a new proposal is expressly approved.

**Boundary:** Preserve native app and installed-device compatibility; do not infer that pending phone lifecycle acceptance has been completed.

### D11 — Defer additional public-endpoint protections

**Approved:** **Preserve current functionality and public access**, and **defer** further changes to `/api/geocode/reverse` and `/send-email`.

The owner did **not** authorize new input-validation rules, rate limits, upstream deadlines, geocode caching, or changed error status behavior as part of this phase. Existing protections must remain intact; the absence of new controls must not be presented as an approved security certification.

**Risk record:** The engineers identified potential geocode coordinate/query handling, ineffective upstream timeout, resource abuse, and public email abuse concerns. These findings remain **open/deferred**, not resolved or accepted as harmless. Reconsider when independently prioritized or if a material incident requires review. No new protections were installed under D11.

### D12 — Two-tier standards documentation

**Approved document architecture:**

1. **Core Programming Standards:** about **10–12 numbered, mandatory daily rules**, cross-referenced to the full technical standards.
2. **Detailed Technical Standards:** comprehensive normative engineering requirements, design contracts, exceptions, and verification requirements.
3. **Technical annexes and development compliance checklist:** implementation details, test cases, evidence, and practical review controls.

The concise Core must **not** contradict or weaken the detailed standard. Prepare Step 2 and Step 3 as **separate draft deliverables**; neither is adopted solely because D12 is approved.

### D13 — Mandatory compliance review for every change

**Approved:** Every WA code change receives a documented standards applicability check, source/impact review, suitable risk-based tests, review evidence, and explicit owner approval **before installation**.

**Expected record:** current authoritative source baseline; applicable Core and detailed requirement IDs; affected paths/routes/UI/DB/shared modules; expected behavior and regression risk; complete proposed files delivered separately; test procedures, results and gaps; rollback plan where needed; owner decision and installation/evidence status.

**Proportionality:** Minor documentation/formatting changes require proportionate review; shared, authentication, privacy, DB, and deployment changes warrant expanded negative, integration, concurrency and/or regression testing. Earlier test results survive as historical evidence; rerun only affected claims when a dependency changes. The exact template and automated/local enforcement mechanism remain to be drafted.

### D14 — Owner-controlled authority and read-only review

**Approved:** Google Drive `My Drive/wonderfulApp` remains authoritative. The owner controls adoption of standards versions, exceptions, proposed replacements, installation, and deployment. ChatGPT and design engineers may inspect Google Drive, GitHub and local WA files read-only; all new/revised proposed files are delivered **outside the project** for the owner's manual installation following approval.

**Versioned governance:** Each standards release needs version, effective date after approval, change history, applicability, exceptions and traceability to findings/tests. Do not alter repositories, source, folders, services, accounts, databases or installed devices as part of the present review. Preserve independent engineering review before Stage 6 merge/production approval.

**Boundary:** This register is a documentation deliverable for manual installation. The owner has **not** authorized Step 2, Step 3, R16-75 installation, production rollout, or any testing in a live environment by approving D14.

## 4. Open technical design and engineering questions

The following are **not undecided Phase 0 option selections**. They are detailed design/verification tasks remaining under the approved policies.

| ID | Remaining issue | Governing decisions | Suggested next artifact |
|---|---|---|---|
| O-01 | Precisely enumerate Family Tree private-data read versus mutation permissions for verified administrators | D01 | Endpoint/permission matrix and FT negative tests |
| O-02 | Define and verify transfer-completion capability, transaction and recovery | D02 | Transfer authorization contract |
| O-03 | Define the controlled expected-error factory, producer contracts and logging limits | D03 | R16-75 review package / error-provenance annex |
| O-04 | Inventory consumers of nested/flat errors and design safe transitional parser | D04, D05 | Error producer–consumer inventory |
| O-05 | Complete read-only baseline and compatibility review before preparing R16-75 replacements | D05 | Bounded correction package; **no installation** |
| O-06 | Verify registered-email recovery authority and set proportionate guessing limits for short codes | D06 | Privacy recovery contract and risk acceptance note |
| O-07 | Define concrete browser versions and browser/device acceptance fixtures | D07 | Supported-browser test matrix |
| O-08 | Select final browser token architecture and stage an auditable migration | D08 | Authentication architecture decision record |
| O-09 | Specify replay/race detection, family revocation and supersession transaction rules | D09 | Session lifecycle and concurrency test plan |
| O-10 | Preserve TNNA compatibility during future shared-server changes | D10 | TNNA regression matrix |
| O-11 | Record and periodically revisit deferred public-route findings | D11 | Deferred-risk register |
| O-12 | Produce concise Core and detailed v0.4 without weakening existing documented obligations | D12 | Separate Step 2 and Step 3 drafts |
| O-13 | Define compliance checklist, test evidence, and owner-install gates | D13 | Standard change-review checklist |
| O-14 | Maintain approval/version/effective-date and exception register | D14 | Standards governance header/ledger |

Additional Stage 6 requirements—including cross-app `WA.api` adoption, privacy-token propagation, early-parser cache behavior, public/error-response inventory, service-worker asset versioning, resource limits, and final independent implementation review—remain tracked separately. No new PASS/closed status is conferred by this record.

## 5. Implementation and acceptance sequencing

**Step 1 — This document:** Record owner-approved D01–D14. Provide a standalone file for review and manual installation into `standard`. **No code changes.**

**Step 2 — Separate future approval:** Prepare **`WA_Core_Programming_Standards_DRAFT_v1.0.md`** with approximately 10–12 numbered daily rules mapped to relevant D IDs and detailed requirements. Owner reviews and approves document content before it becomes authoritative.

**Step 3 — Separate future approval:** Prepare **`WA_Detailed_Technical_Standards_DRAFT_v0.4.md`** incorporating B9, both independent engineering reports and D01–D14, while preserving established `CLAUDE.md`/`TechSummary.md` obligations, identifying exceptions, and listing unimplemented/untested requirements. Owner separately approves it.

**Later implementation:** Prepare individual technical packages only within approved scope; review complete source replacements, tests, effects and rollback before installation. D05 permits **preparation** of a narrow R16-75 package but **not** the correction's installation or staging tests. The final Stage 6 implementation remains subject to a separate independent engineering and owner release gate.

## 6. Evidence and source references

The primary evidence for approval is the owner's explicit D01–D14 selections in the current conversation dated November 12, 2026. This register does not depend on the contents of files that have not been separately reverified in this document-preparation step.

Supporting project documents, retained as **reference material** rather than automatically approved revisions:

- `standard/WA_Programming_Security_Standardization_Specification_DRAFT_v0.3_B9_2026-11-11.md` (actual installed basename may include a B9 prefix).
- `standard/WA_Independent_Design_Engineer_Review_Codex_2026-11-11.md`.
- `standard/WA_Design_Engineer_Report_Overview_Suggestions_PathForward_Claude_2026-11-11.md`.
- Root authoritative `CLAUDE.md` and `TechSummary.md`.
- `docs/Stage6_OpenItems.md` and `docs/Stage6_Render_TestPlan.md` and later Stage 6 handoffs/results.

No assertion is made here that current source/deployment, all security fixes, or all acceptance tests already conform to these approved policies.

## 7. Change history and adoption record

| Version | Date | Change | Status |
|---|---|---|---|
| 1.0 | 2026-11-12 | First formal consolidation of the fourteen expressly approved Phase 0 owner decisions | **Prepared for owner review/manual installation** |

**Adoption note:** D01–D14 decisions are approved. This file is a formatted record offered for owner review. Installing this document in `standard` does not install or approve any code change, does not approve Step 2/3 documents, and does not close Stage 6 test items.

---

*End of WA Standards Decision Register v1.0.*
