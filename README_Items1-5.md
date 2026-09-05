# FamilyTree Items 1-5 Revision

Built from the current `/Google Drive/wonderfulApp` files uploaded September 3, 2026.

## Implements

1. Relative-entry popup now contains the full Person fields used by FTPersonNew Part 1, including Died and Death Date, in both FTPersonNew and FTPerson. Mandatory global duplicate checking remains server-enforced.
2. FTPersonNew Part 2 Life Events now displays saved events and uses ADD EVENT to open a reusable event-entry modal. Multiple events can be added.
3. When a Child is added and the focal Person already has Partner(s), WA asks whether an existing Partner is also a Parent of that same Child. If selected, a second FTParentT relationship is created to the same Child PersonID; no duplicate child is created. This follow-up also occurs when adding the Child caused a OneTree merge.
4. Existing FTParentT rows with blank AncestrySide are now interpreted as Mother/Father from the recorded parent Gender for FTPerson and FTAncestor display. New child-parent links also store Mother/Father when it can be inferred without conflicting with an occupied ancestry slot.
5. FamilyTree BACK buttons in the revised pages use browser history first, with a safe FamilyTree/Person fallback.

## Replace

- routes/familyTree.js
- httpdocs/FTPersonNew.html
- httpdocs/js/FTPersonNew.js
- httpdocs/FTPerson.html
- httpdocs/js/FTPerson.js
- httpdocs/FTOneTreeMerge.html
- httpdocs/js/FTOneTreeMerge.js
- httpdocs/FTAncestor.html
- httpdocs/js/FTAncestor.js
- httpdocs/FTContact.html
- httpdocs/js/FTContact.js
- httpdocs/FTEvent.html
- httpdocs/js/FTEvent.js
- httpdocs/FTPersonList.html
- httpdocs/js/FTPersonList.js
- httpdocs/FTAncestorChild.html
- httpdocs/js/FTAncestorChild.js
- httpdocs/FTAncestorPartner.html
- httpdocs/js/FTAncestorPartner.js

No SQL changes, npm changes, or .env changes are required.

## Suggested testing

- Add Mother/Father/Partner/Child and verify Died + Death Date can be entered and saved.
- Add three Life Events from FTPersonNew Part 2 and confirm all three display after each save.
- Give a Person one Partner, add a Child, answer YES to the Partner-parent question, and verify the Child displays for both parents.
- Open an existing child whose FTParentT relationship predates this revision and confirm Mother/Father now display on FTPerson and FTAncestor without re-entering them.
- Navigate among Person List, Person, Ancestor, Contact, Event and confirm BACK returns to the immediately previous page.
