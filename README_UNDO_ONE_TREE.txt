Wonderful Apps - Undo One Tree Merge implementation
Generated from the current WA files in Google Drive on September 17, 2026.

INSTALL IN THIS ORDER
1. Back up WA and the database.
2. Run sql/FamilyTree_UndoOneTreeMerge.sql ONCE.
3. Replace:
   routes/familyTree.js
   httpdocs/FamilyTree.html
   httpdocs/js/FamilyTreePage.js
   httpdocs/FTOneTreeMerge.html
4. Add:
   httpdocs/FTUndoOneTreeMerge.html
   httpdocs/js/FTUndoOneTreeMerge.js
5. httpdocs/js/FTOneTreeMerge.js is included for completeness and is functionally unchanged.
6. Restart node server.js.
7. Perform a NEW One Tree merge and test Undo One Tree Merge.

IMPORTANT
A One Tree merge completed before the new FTTreeMergeT table exists cannot be safely offered for undo because no full pre-merge snapshot was captured.

See docs/UNDO_ONE_TREE_MERGE.md for behavior and test details.
