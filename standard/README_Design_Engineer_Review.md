# Wonderful Apps — Independent Design Engineer Review

**Review package:** Programming and Security Standardization  
**Date:** November 11, 2026  
**Project:** Wonderful Apps (WA)  
**Review status:** Independent technical review requested  
**Document location:** `wonderfulApp/standard/`

## 1. Purpose of This Review

Wonderful Apps has undergone substantial development, particularly in its Stage 6 authentication, authorization, session management, and security implementation.

During Stage 6 testing, several application-specific corrections revealed an important architectural concern: although Wonderful Apps has existing development standards and shared components, some programming practices are not applied consistently across all applications and backend routes.

Rather than continue making isolated corrections, we initiated a comprehensive **Documentation-to-Implementation Standardization Audit**.

The objective is to establish technically detailed, consistent, enforceable programming and security standards that will govern future Wonderful Apps development.

An important question underlying the audit is whether previously identified implementation weaknesses resulted from:

- Failure to follow existing documented requirements.
- Requirements that were insufficiently detailed or ambiguous.
- Inconsistent implementation of otherwise appropriate shared architecture.
- Legitimate application-specific requirements that were not adequately documented.
- Missing review, verification, or enforcement procedures.

The independent design engineer is requested to assess these questions objectively, using both the audit documentation and the actual project source code.

## 2. Review Materials

The `standard` folder contains the B1–B9 documentation prepared during the standardization assessment.

The documents collectively cover:

- Existing standards and their implementation.
- Backend error handling and API response contracts.
- Shared authentication and session management.
- Middleware and authorization architecture.
- Frontend compatibility and application-specific requirements.
- Endpoint access classifications and exceptions.
- Proposed programming and security standards.
- Technical completeness and consistency findings.
- Successive revisions of the proposed governing specification.

**The principal document for review is:**

`WA_Programming_Security_Standardization_Specification_DRAFT_v0.3_B9_2026-11-11.md`

Version 0.3 is the most recent proposed specification. Earlier drafts and reviews are included to preserve the engineering rationale, findings, and decisions leading to it.

The engineer should also consult the authoritative project documents `CLAUDE.md`, `TechSummary.md`, and relevant Stage 6 test plans, open-items registers, and implementation files.

The standardization audit previously used GitHub Stage 6 commit `b5e2b06` as a pinned implementation baseline. This is a historical reference for reproducible comparisons, not proof that it represents the latest project source or current deployment.

The authoritative current project files are maintained in Google Drive under `My Drive/wonderfulApp`.

## 3. Approved Administrator Recognition Standard

One specific design requirement has already been approved by the project owner.

**WA-SEC-ADMIN-001 — Administrator Recognition**

Administrator recognition must use the centralized `services/administratorAccess.js` service.

The service must:

1. Query the current `UsersT` database record using the authenticated user's `UserID`.
2. Verify that `UsersT.IsAdministrator = 1`.
3. Verify that the database `UserName` matches the configured `ADMIN_USERNAME`, using case-insensitive comparison with surrounding whitespace trimmed.
4. Grant administrator privileges only when both conditions are satisfied.

Hard-coded administrator IDs, username-only authorization, and JWT-only administrator claims are prohibited.

The engineer should verify that this standard is accurately represented in Version 0.3 and identify any implementation or documentation inconsistencies.

The existing `TechSummary.md` description of administrator recognition has previously been identified as requiring reconciliation with the current implementation.

## 4. Requested Engineering Assessment

Please conduct an independent assessment of the proposed standards, giving particular attention to the following questions.

### A. Technical completeness

Are the standards sufficiently detailed to direct future development without requiring programmers to invent their own security or architectural conventions?

Are important programming, database, frontend, backend, logging, session, privacy, testing, or deployment requirements missing?

### B. Consistency and enforceability

Are the proposed requirements internally consistent and unambiguous?

Can compliance with each mandatory standard be verified objectively through source review, automated tests, integration tests, or documented acceptance procedures?

Are overlapping standards consolidated appropriately?

### C. Architectural appropriateness

Does the specification promote appropriate reuse of shared modules without eliminating necessary application-specific behavior?

Particular attention should be given to `WA.session`, `WA.api`, centralized error classification, authentication and authorization middleware, Family Tree privacy, and TNNA native authentication.

### D. Security architecture

Evaluate whether the proposed requirements adequately address:

- Authentication, token storage, session renewal, and logout.
- Administrator verification and subscription authorization.
- Individual user and Family Tree data ownership.
- Unexpected exception disclosure and public API errors.
- CSRF, Origin verification, CORS, and cookie protections.
- Logging, diagnostic disclosure, and secret protection.
- Concurrency, token replay, and cross-tab session behavior.
- Database and environment isolation.
- XSS, content security, and frontend compatibility.

### E. Compatibility and regression risks

Identify standards that could create compatibility problems if implemented without careful planning.

Distinguish mandatory security properties from interface-format choices that may need transitional compatibility support.

Review proposed exceptions to ensure they are justified, narrowly scoped, documented, and testable.

### F. Documentation authority and development process

Evaluate whether the proposed standards establish a sufficiently clear hierarchy between governing requirements, technical documentation, source code, approved exceptions, and test evidence.

Recommend an effective process for keeping these materials synchronized as Wonderful Apps evolves.

## 5. Special Attention — Error Handling

Stage 6 testing identified inconsistent handling of unexpected HTTP 4xx exceptions and differences in public API error-response structures.

The central Express error handler and selected application modules have used different error-classification mechanisms.

Please determine whether Version 0.3 establishes an appropriate common security contract, including explicit distinctions between expected client errors and unexpected exceptions.

Evaluate how that contract should interact with existing frontend consumers without changing established application behavior unnecessarily.

The previously proposed R16-75 central error-handler correction remains paused pending the standards assessment.

## 6. Requested Deliverables

Please provide a written engineering review containing:

1. An executive summary and overall assessment of Version 0.3.
2. A numbered findings register with severity, affected standard IDs, evidence, and recommended actions.
3. Identification of missing, ambiguous, conflicting, or technically inappropriate requirements.
4. Specific proposed wording for necessary standards changes.
5. An assessment of whether the specification can become authoritative after the identified issues are resolved.
6. An explicit list of unresolved decisions requiring approval by the project owner.
7. A clear distinction between specification defects, implementation defects, documentation discrepancies, and unverified potential risks.

Please distinguish confirmed source evidence from engineering inference and recommendations.

The goal is not simply to approve the existing draft, but to improve it wherever necessary.

## 7. Project Restrictions

This is a **review-only assignment**.

Google Drive, GitHub, and local Wonderful Apps project files must remain read-only. Do not create, edit, overwrite, move, rename, delete, commit, push, merge, or deploy changes to those project resources.

Do not modify production or staging services, databases, credentials, or configurations.

Any suggested changes should be delivered separately for project-owner review and manual installation.

No new implementation is authorized by this request.

Previously completed Stage 6 test results must be preserved. Do not declare a requirement fully implemented or tested merely because its wording has been approved.

## 8. Relationship to Stage 6 Final Approval

This assignment concerns the proposed **programming and security standards**.

It is separate from the independent engineering review required after completion of Stage 6 implementation and acceptance testing.

Approval of the standards will not constitute approval of the current implementation, closure of remaining Stage 6 issues, authorization to merge, or authorization for production deployment.

Those decisions remain subject to their own evidence and approval requirements.

## 9. Expected Outcome

The intended result is a comprehensive and technically precise set of Wonderful Apps programming and security standards that:

- Establishes consistent development practices.
- Eliminates avoidable duplication and conflicting approaches.
- Preserves necessary application-specific functionality.
- Provides objective and repeatable compliance tests.
- Reduces the likelihood of recurring architectural and security defects.
- Supports reliable future development, maintenance, and independent review.

**The project owner will consider the engineer's findings and retain final authority over acceptance of the standards and any subsequent implementation changes.**

---

## Suggested Review Order

Start with Version 0.3, then consult B1–B8 for the evidence, rationale, and decisions. Deliver a separate written findings report rather than editing the proposed specification or WA project files directly.
