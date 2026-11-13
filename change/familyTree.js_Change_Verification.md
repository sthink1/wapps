# WA — `routes/familyTree.js` Complete-File Change Verification

**Status:** REVIEW CANDIDATE; NOT INSTALLED; NO HOSTED OR DATABASE TESTS.
**Date:** November 12, 2026

## Authoritative baseline

- Read-only Google Drive: `My Drive/wonderfulApp/routes/familyTree.js`.
- Original: 302,186 bytes, 8,448 lines.
- SHA-256: `f32072d3d4bb5f86fdbdbbe571e0ccf3425d46775eaafd798175eec9bc7bf590`.

## Exact final replacement

- Deliverable: `routes/familyTree.js` in this review package.
- Final: 302,709 bytes, 8,456 lines.
- SHA-256: `0af2b52700afdcc49e9d3068bd000e4f7c350895237c55a3a81c07d6617d6bb0`.
- The accompanying `familyTree.js.diff` compares **the complete original** to **the exact complete delivered replacement**, not snippets.
- `node --check` result: **PASS** (Node.js v22.16.0; isolated syntax check only).

## Approved basis

Owner-approved D01 / Step 3B-01: centrally verified WA administrator has full Family Tree read/create/modify/delete/privacy/ownership authority, without ordinary-user Tree membership and creator/merger limitations, subject to unchanged validation and database integrity rules.

## All proposed source changes

1. Import existing `isVerifiedAdministrator` from `services/administratorAccess.js`.
2. `userHasTree`: preserve membership check; when no membership row exists, allow only a database-and-config-verified administrator. This also covers `requireTree` and the `use-existing-person` focal Tree branch; it does not add the administrator as a Tree member.
3. `undoOneTreeMerge`: allow a verified administrator to pass the creator/merger authorization gate; retain later dependent-merge and integrity checks.
4. `GET /one-tree/undo-options`: include otherwise hidden merge entries when verified administrator; retain user-specific filtering otherwise.
5. `GET /one-tree/undo-review/:treeMergeID`: allow a verified administrator past the creator/merger restriction; preserve other return conditions and payloads.

## Intentionally unchanged

- Every endpoint URL, method, request field and response structure.
- Ordinary-user Tree membership checks, creator/merger rights and error text.
- Tree alias resolution, database SQL writes and transaction boundaries, rollback, references, merge-integrity rules, R2 image handling, logging, notification and privacy-code workflows.
- `current-tree` and `split-view` remain **user-context selectors**, rather than enumerating all Trees for administrators. This prevents presenting other people's Trees as the administrator's personal current Tree.
- `enter-code` continues to use its existing code-to-Tree workflow; this change does not silently alter user memberships or create administrator UI.

## Important limits

- This revision does NOT automatically add UI controls for administrators, change browser exposure of Tree selection, or implement a dedicated administrative Tree management interface.
- No authorization/security change is certified until the complete endpoint registry, privacy middleware integration and controlled regressions are checked.
- `routes/ftPrivacy.js` is a separate proposed correction, not bundled into this file; both packages must be reviewed together for full privacy behavior.
- Prior-to-installation baseline reconciliation is required if the source has changed.

## Required test evidence (NOT RUN)

1. Verified administrator (matching `ADMIN_USERNAME` **and** `UsersT.IsAdministrator=1`) can access and modify a Tree not joined as an ordinary member, without changing membership records.
2. Username-only, flag-only, missing config, deleted account and failed DB lookup cannot bypass membership or creator/merger restrictions.
3. Ordinary member still succeeds, and ordinary nonmember still receives the same forbidden error and safe error response.
4. Verified administrator can see eligible merge undo options, review and undo a merge not initiated by themselves while all dependency/rollback protections remain effective.
5. Non-admin cannot see or undo others' merges.
6. Creation, modification, deletion, relationship and One Tree flows retain domain validation, audit trails, notifications, R2 cleanup and safe failure handling.
7. Review existing `current-tree`, `split-view` and UI workflows to confirm a verified administrator can actually reach the desired nonmember Tree via existing flows before declaring end-to-end completion.
8. Integrate the separate `ftPrivacy.js` policy correction and verify private fields are handled correctly.

**No repository, local WA project file, Drive object, test database, server or deployment was modified.**
