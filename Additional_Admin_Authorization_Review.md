# Wonderful Apps — Related administrator-authority file review

Date: November 12, 2026. This is a source-observed **review list**, not permission to modify any additional files.

## 1. Confirmed follow-up: `routes/familyTree.js` — highest priority
- `requireTree()` currently rejects users who do not appear in `FTFamilyTreeUserT` (even when they are verified administrators); `userHasTree()` is membership-only.
- The Family Tree selection/list and several endpoints depend on membership; full administrator access to every Tree therefore requires scoped review.
- One Tree merge-undo operations impose creator/merging-user conditions in addition to membership, including `undoOneTreeMerge()` and the undo-history/review routes.
- **Proposed change**: incorporate centralized `isVerifiedAdministrator` in the appropriate authorization gates, while retaining object integrity, workflow restrictions and the ordinary-user rules.
- Do not change all instances of ownership checks mechanically: distinguish security checks, record attribution, notification ownership and valid business rules.
- Because this is a large module (~302 KB), review endpoint-by-endpoint, preserve all original behavior for nonadmins, and furnish full-file diff and regression tests.

## 2. Possible UI/documentation follow-up (not yet a confirmed required functional change)
- `httpdocs/js/FTPrivacy.js` currently checks the server `IsAdmin` status and bypasses asking administrators for the privacy key in its entry flows; this **already supports** the policy if the backend is corrected. No automatic rewrite recommended.
- `httpdocs/FamilyTree.html` explains privacy keys as required on every private Person visit; explanatory wording should acknowledge the verified administrator exception in a separate approved UI-documentation revision.
- `httpdocs/js/FTPerson.js` and `httpdocs/js/FTUndoOneTreeMerge.js` should receive targeted review **after** any `familyTree.js` authorization change, to ensure admin actions are exposed correctly without unapproved visual alterations.
- The email-approved GO PRIVATE / GO PUBLIC workflow in `routes/ftPrivacy.js` has **not** been replaced by a new admin-direct override. Any direct admin privacy-management workflow requires a separately scoped design and acceptance tests; don't silently bypass verified-email approval.

## 3. Reviewed central paths: no equivalent hard-coded-admin repair indicated
- `services/administratorAccess.js`: `isVerifiedAdministrator()` checks both current DB flag and configured administrator username.
- `middleware/subscriptionAccess.js`: uses the central service for subscription override.
- `routes/adminManagement.js`: imports central status/requireAdministrator and additionally verifies current designation for the pending/cancel/complete transfer procedure. The transfer protocol still needs its independent risk-based acceptance tests, but it is **not** a username-only `sthink` bypass.
- `routes/subscriptions.js` and `services/subscriptionService.js`: no local hard-coded `sthink` identity check found in the reviewed material; broader endpoint coverage remains to be certified.

## 4. Implementation and testing priorities
1. Review and test the proposed `routes/ftPrivacy.js` replacement in isolation before manual installation.
2. Prepare separate controlled `routes/familyTree.js` authorization package, tracking precise endpoint methods and before/after membership decisions.
3. Examine affected client-side admin flows, especially privacy and merge-undo; change only when demonstrated necessary.
4. Confirm no other route contains a hard-coded administrator identity by completing the method-level endpoint registry and access-control audit; this list is **not** an exhaustive full-project certification.

No runtime tests, database writes, deployments, or modifications to Google Drive, GitHub or local WA project files were performed.
