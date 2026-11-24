# M03-H03 — Real database test runner verification

**Date:** November 24, 2026. **Finding:** M03-H03 / WA-PR-003 / IR-03. **Artifact:** new test-only `tests/M03-H03_real_db_test.cjs`; no original or replacement operational file.

## Baseline and authority

Owner authorized synthetic mutations and cleanup in `wapps_test` and confirmed the November 22 test-schema dump remains current. Reviewed the existing reference copies of `README.md`, the M03 remediation handoff, `wappsHelioTestDump.sql` (schema, transaction engine declarations, relevant foreign keys; no dump contents are distributed), M03-H02 real DB runner, installed-candidate reference from the M03-H03 ZIP, `ftPrivacy.js`, auth, subscription, usage and administrator middleware. Route SHA-256 independently verified as `75b705aed2b6958273e03e1e0bdf97be028f96cd2fc8d860b569b1fe7a3c8906`. Local owner reported 47/47 for the installed route at baseline commit `fd2e1c3`. The test runner checks that identity again before connecting.

Reviewed relevant sections of approved Core v1.0, Detailed v0.4.1, Decision Register v1.0, and File Development and Delivery Process v1.1 from the read-only `fd2e1c3` GitHub snapshot; no new Google Drive/standards equivalence check was performed in this turn. Applicable: CS-01,02,03,04,05,06,07,09,11,12; WA-CORE-001, WA-API-001, WA-AUTH-001, WA-SEC-ADMIN-001, WA-ERROR-001, WA-PRIV-002, WA-DATA-001, WA-LOG-001, WA-ENV-001, WA-REVIEW-001, WA-FORMAT-001, D01, D03, D13, D14. Existing accepted HTTP evidence is preserved. No new global administrator or auth acceptance claims.

## Acceptance cases (owner execution NOT RUN)

1. Verify actual generated review groups and candidates.
2. Reject extra unreviewed Same decision.
3. Reject extra unreviewed Different decision.
4. Reject identical duplicate decision.
5. Reject conflicting duplicate decision, including numeric-string alias.
6. Reject malformed decision container.
7. Reject null entry.
8. Reject malformed newer Person ID.
9. Reject unsupported decision.
10. Reject missing review decision.
11. Reject stale/noncandidate older Person.
12. Reject third-Tree Person decision.
13. Execute legitimate combined Same/Different request, verify surviving Person, conflict resolution and distinct records.
14. Verify merged Tree state, memberships, remapped synthetic sibling relationship, canonical decisions in merge record/snapshot, and individual Person merge history.
15. Compare unrelated synthetic Tree, Persons, user, relationship and other scoped rows with their exact before-state.

Cases 2–12 require HTTP 409, zero allowed route DML attempts, no blocked SQL, no database errors, and an identical scoped row snapshot. All cases require no attempted external storage or notification calls and an active outer transaction. Cleanup is a separate required postcondition, not included in the 15 count.

## Isolation design

Synthetic users, Tree codes, Persons and relationships use a randomly tagged namespace/IDs; both participating Trees belong to the synthetic member. A separate sentinel Tree belongs to a second synthetic user. The route adapter restricts expected DML shapes and IDs to participating fixture Trees/Persons/user and test-created merge IDs, not the sentinel. It fails closed for unexpected write shapes. The actual route, real Express middleware, and actual database merge functions are executed; token verification and subscription access use synthetic fixtures, usage recording is stubbed, post-commit dispatch is disabled, and R2/email dependencies fail closed. No contacts, events, private records or image fixtures are created. The owner runner uses real SQL and tests existing row integrity with synthetic fixtures, not a full fingerprint of every existing row in the database. All fixture DML is inside a single outer transaction, route commits release savepoints only, rollback clears all scoped records. Runtime schema guards check all visible base tables are InnoDB and no visible triggers exist. Server metadata visibility is subject to account permissions. Auto-increment gaps are an acknowledged non-row side effect of rollback. Actual provider connectivity, SQL behavior, rollback and cleanup are still unverified until owner execution. No actual production or staging test, browser test, storage migration, privacy concurrency or persistence after a real commit is claimed. M03-C01 and M03-M04 remain open; this package does not authorize production merge functionality.

## Independent checks actually executed

- Node v22.16.0 syntax check of the exact runner: PASS.
- No-network guard self-test: PASS (test environment checks, blocked unsafe SQL/non-fixture IDs, valid read and allowed synthetic operations).
- Extracted all 17 expected reachable write-statement shapes from the exact M03-H03 handler/helpers, excluding branches for absent contact/event/image/parent/partner fixtures; checked those 17 against the SQL classifier using synthetic parameter values: 17/17 accepted. This is a statement-shape check, not executed SQL or a database test.
- Schema declaration inspection: all 72 base-table definitions in the supplied dump specify InnoDB. Runtime guard still checks the actual database.
- No local MySQL server or mysql2/Express packages available in the assistant runtime; real database cases NOT RUN here. No direct connection attempted.

New file; no original-to-final diff required. See installation instructions and SHA-256 manifest. No operational source, schema, authoritative file, repository, production or staging system was changed by the assistant. The cumulative 40-hour budget has not been reconciled; no readiness closure or release recommendation is implied.
