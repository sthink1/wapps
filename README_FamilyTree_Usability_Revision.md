# FamilyTree Usability / Change Tree / Adoption Revision

Built from the current `/Google Drive/wonderfulApp` files uploaded through 2026-09-07.

## Changes implemented

### FamilyTree.html
- Removed the user-facing database connection/database name display.
- Added `CHANGE TREE`.
- CHANGE TREE uses the agreed Option A:
  - current active FamilyTree membership is made inactive;
  - no people, relationships, pictures, contacts, events, or activity are deleted;
  - the user returns to an unassociated state and may enter another code, search for a person, or create a new Person/tree.
- A `LEAVE_TREE` activity is recorded for the association being ended.

### FTContact
- `ContactID` is no longer shown to the user.
- First display column is `Contact #` = 1, 2, 3... for the currently displayed list.
- Contacts sort by Contact Type, then Contact Value.
- Edit heading no longer exposes the internal ContactID.
- Contact Type and Contact Value have red required markers.
- Missing required controls receive a colored background and border.
- The highlight disappears as valid data is entered.

### FTEvent
- `EventID` is no longer shown to the user.
- First display column is `Event #` = 1, 2, 3... for the currently displayed list.
- Events sort by Event Type, then Event Date.
- Edit heading no longer exposes the internal EventID.

### FTPerson Contact/Event counts
- When FTPerson is restored from browser history after using FTContact or FTEvent, CONTACT (n) and EVENT (n) are refreshed automatically.
- A manual browser refresh should no longer be needed after adding/deleting a Contact or Event and pressing BACK.

### ADD PICTURE
- The picture modal now gives visible status when the file chooser is opened.
- After a file is available it shows the selected file name.
- During save/upload it shows `Please wait — preparing and uploading picture...`.
- Save/Cancel are temporarily disabled during the upload.
- Pictures 2–5 are labeled:
  - `Picture of YOU at various stages of your life.`

### Adopted Child
- ADD CHILD includes an `Adopted Child` checkbox.
- The adoption status is stored in `FTParentT.ParentType` as `Adopted`; ordinary parent relationships remain `Parent`.
- The child table now shows Parent Type.
- The adopted ParentType is also preserved when USE THIS PERSON triggers a OneTree merge.

### Partner as other parent
- One Partner: custom question with `YES` and `NO`.
  - NO creates no relationship between that Partner and the child.
- Multiple Partners: checkboxes allow one or more Partners to be selected.
  - `ADD SELECTED PARENT(S)` links the same Child PersonID to every selected Partner.
  - `NONE` creates no additional parent link.
- This never creates another child record.

## Replace these files

- `routes/familyTree.js`
- `httpdocs/FamilyTree.html`
- `httpdocs/js/FamilyTreePage.js`
- `httpdocs/FTContact.html`
- `httpdocs/js/FTContact.js`
- `httpdocs/FTEvent.html`
- `httpdocs/js/FTEvent.js`
- `httpdocs/FTPerson.html`
- `httpdocs/js/FTPerson.js`
- `httpdocs/js/FTOneTreeMerge.js`

No SQL, `.env`, or npm changes are required.

Restart locally with:

`node server.js`
