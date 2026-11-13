# `routes/ftPrivacy.js` — Change verification (proposal)

Date: November 12, 2026. Status: **NOT INSTALLED — STATIC TESTS ONLY**.

## Authoritative source baseline
- Source: `My Drive/wonderfulApp/routes/ftPrivacy.js` (Google Drive; inspected read-only).
- Original bytes: 17075; SHA-256: `2cb8201404ad3797297fb98bfe5c3d804740882efcdacca7a5da7c67b6f44c10`.
- The authoritative original uses CRLF line endings, preserved in the proposed replacement.

## Exact final deliverable
- File: `routes/ftPrivacy.js`; 17394 bytes.
- **Final SHA-256:** `149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b`.
- Unified complete-file comparison: `change/ftPrivacy.js.diff`.

## All proposed differences
1. Import `isVerifiedAdministrator` from the existing `services/administratorAccess.js`.
2. Replace the hard-coded username-only `isAdmin()` with the centralized two-gate verification using the existing database connection.
3. Allow centrally verified administrators to invoke the existing privacy `/unlock/:personID` path without furnishing a privacy key; ordinary-user key validation remains unchanged.
4. In JSON response filtering, let a centrally verified administrator see complete nested private Person details instead of applying ordinary-user redaction.

## Deliberately unchanged
- Existing privacy approval-by-email workflow, privacy-code storage and recovery behavior, session tokens, attempt limits, and public capability routes.
- SQL writes and relationship checks, authenticated route mounting, response envelopes, administrator-transfer procedure, HTML/JS appearance, and other route modules.
- This change alone does **not** implement full administrator access across the main `routes/familyTree.js` authorization checks. In particular, `requireTree()` continues to enforce membership, and merge-undo has additional creator constraints.

## Verification and approval gates
- No live server, database, staging, production, or application tests have been executed.
- Syntax check and automated source/diff/hash checks should be completed before manual installation.
- In isolated test DB: verify both admin gates; negative tests for hard-coded username, flag only, missing config, DB error; admin unlock without key; non-admin key/attempt behavior; private focal and nested Person response; all ordinary redaction; unauthorized Tree checks.
- Confirm final authoritative original hash and rerun diff before replacing any local project file. Owner approval and manual installation are required.
