# Wonderful Apps Family Tree — Undo One Tree Merge

## Purpose

This addition makes future One Tree merges reversible when a user later realizes that two Family Trees were combined by mistake.

The design preserves the existing One Tree rule: the older Tree remains authoritative after a merge. The new feature adds a separate **UNDO ONE TREE MERGE** workflow; entering an old merged FamilyTreeCode through CHANGE TREE does not silently reverse a merge.

## Database changes

Run `sql/FamilyTree_UndoOneTreeMerge.sql` once before using the revised Family Tree code.

The migration creates:

- `FTTreeMergeT` — one row for each reversible Tree-level One Tree merge.

It also extends `FTPersonMergeT` with:

- `TreeMergeID` — links Person merges to the Tree merge that caused them;
- `SurvivingPersonSnapshotAfter` — supports safe field-by-field reversal;
- `UndoByUserID`, `UndoAt`, `UndoReason` — permanent undo history.

The old unique index on `FTPersonMergeT.SourcePersonID` is changed to a normal index. A Person restored by an undo may later be correctly merged again, so merge history must allow more than one historical merge event for the same source PersonID.

## Merge snapshot

Immediately before a One Tree merge changes data, the backend stores a snapshot containing:

- source Tree metadata;
- source Tree Person memberships;
- source Person records;
- source parent, partner and sibling relationships;
- source Tree user memberships;
- the surviving Tree's pre-merge membership and relationship baseline;
- each SAME PERSON pair;
- source and surviving Person contacts;
- source and surviving EventPerson links;
- source and surviving image metadata;
- the duplicate decisions and bridge relationship that caused the Tree connection.

The Tree merge record is created inside the same database transaction as the merge. If the merge fails, the snapshot row rolls back with it.

## R2 image protection

For reversible One Tree merges, pre-merge R2 objects are no longer physically deleted during the merge, even when an image metadata row is removed or the source image is copied to a surviving PersonID filename. This is intentional: the original object may be needed if the Tree merge is later undone.

New R2 objects created by the merge are recorded in `FTTreeMergeT.CreatedR2KeysJSON`. After an undo commits, WA deletes a recorded generated object only when no current `FTImageT` row still references that storage key.

This trades some storage retention for safe reversibility. A future maintenance policy can purge retained merge objects after a deliberately chosen retention period, but no purge is included in this implementation.

## User workflow

The Family Tree main page now contains:

`UNDO ONE TREE MERGE`

The undo page lists active reversible merges for the current Tree that the user is authorized to reverse. The user can review:

- the Tree code to be restored;
- the Tree from which it will be separated;
- merge date/time and user;
- how many people were in the source Tree;
- every SAME PERSON pair that will be separated again.

The user must explicitly confirm the undo.

## Authorization

An undo is allowed only for:

- the creator of the source Tree; or
- the user who completed that One Tree merge.

The user must also currently have authorized access through the active surviving Tree in order to reach the undo options.

## Multiple merges

Undo follows stack order. If a newer active Tree merge depends on the surviving Tree, the older merge cannot be undone first. The user must undo the newer merge first.

This prevents an older snapshot from being applied underneath a later active merge.

## What undo does

The operation:

1. restores the source `FamilyTreeT` row to `Status='Active'` and clears its merged-alias fields;
2. restores source Person records that were removed by SAME PERSON merges;
3. moves source-origin Person memberships back to the source Tree;
4. restores the source Tree's parent, partner and sibling relationships;
5. removes relationship rows that were added to the surviving Tree solely by the source merge, while preserving relationships that existed in the surviving Tree before the merge;
6. removes the bridge relationship that caused the incorrect Tree connection;
7. restores original source Tree user memberships;
8. restores source contacts, EventPerson links and image metadata for merged Persons;
9. restores surviving baseline images that were removed during the merge review;
10. reverts surviving Person fields only when the current value still equals the value produced by the merge; a field changed later by a user is preserved;
11. marks `FTPersonMergeT` history rows as undone instead of deleting history;
12. marks `FTTreeMergeT.Status='UNDONE'` and records who undid it and when;
13. records `UNDO_MERGE` entries in Family Tree activity history;
14. makes the restored source Tree the undoing user's current Tree.

## Important limitation for merges that already happened

`FTTreeMergeT` did not exist before this migration. Therefore, a One Tree merge completed **before this feature is installed** has no full pre-merge snapshot and is not offered by the new Undo page.

Do not attempt to manufacture a snapshot for an old merge by guessing from current rows. For reliable testing, install the migration first and then perform a new One Tree merge.

## Files

### Revised

- `routes/familyTree.js`
- `httpdocs/FamilyTree.html`
- `httpdocs/js/FamilyTreePage.js`
- `httpdocs/FTOneTreeMerge.html`

### New

- `httpdocs/FTUndoOneTreeMerge.html`
- `httpdocs/js/FTUndoOneTreeMerge.js`
- `sql/FamilyTree_UndoOneTreeMerge.sql`
- `docs/UNDO_ONE_TREE_MERGE.md`

`FTOneTreeMerge.js` is included in the package unchanged except for packaging consistency; no JavaScript behavior change was required on that page.

## Installation / testing order

1. Back up the database and project.
2. Run `sql/FamilyTree_UndoOneTreeMerge.sql`.
3. Replace the revised files and add the new files.
4. Restart local Node with `node server.js`.
5. Create two test Trees.
6. Use a duplicate Person to complete a One Tree merge.
7. Confirm the older Tree code becomes current.
8. Return to `FamilyTree.html` and select **UNDO ONE TREE MERGE**.
9. Review and confirm the merge.
10. Confirm the newer Tree's original code is active again.
11. Confirm its original people, relationships, contacts, events and pictures are present.
12. Confirm the older Tree remains active and retains its own original data.
13. Confirm the incorrect bridge relationship is gone.
14. Confirm `FTTreeMergeT.Status` is `UNDONE` and related `FTPersonMergeT` rows contain `UndoAt`.

For a high-value regression test, use the scenario that exposed the need for this feature: a populated newer Tree with parents, partners and children that is merged after an eighth Person is mistakenly declared to be a duplicate in an older Tree.
