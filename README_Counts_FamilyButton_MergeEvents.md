# FamilyTree Revision — Counts, FAMILY TREE Buttons, OneTree Events

Built from the current `/Google Drive/wonderfulApp` files uploaded on 2026-09-04, including the working Items 1–5 revision.

## Changes

1. FTAncestor relationship counts
   - PARTNERS, CHILDREN, GRANDCHILDREN, NEPHEWS AND NIECES, and COUSINS labels now show counts.
   - Examples: `CHILDREN (5)`, `GRANDCHILDREN (10)`.

2. FAMILY TREE button
   - Added to each active FamilyTree work page included in this package.
   - Opens `FamilyTree.html`.
   - BACK remains previous-page behavior.

3. OneTree merge review Events
   - Each Person shown on the OneTree review now includes Events.
   - Event Type, Date, Place, and Description display when available.

4. Test C
   - This revision deliberately does not make a speculative merge-engine change for the earlier duplicate-parent-key error.
   - The earlier Test C occurred before Items 1–5 were installed.
   - Rerun Test C after this revision. If the duplicate-key error remains, record the exact message and current test steps.

## Replace

- routes/familyTree.js
- httpdocs/FTAncestor.html
- httpdocs/js/FTAncestor.js
- httpdocs/FTOneTreeMerge.html
- httpdocs/js/FTOneTreeMerge.js
- httpdocs/FTPerson.html
- httpdocs/FTPersonNew.html
- httpdocs/FTPersonList.html
- httpdocs/FTContact.html
- httpdocs/FTEvent.html
- httpdocs/FTAncestorChild.html
- httpdocs/FTAncestorPartner.html
- httpdocs/FTPersonDuplicate.html

No SQL, `.env`, or npm changes are required.

Restart with:

`node server.js`
