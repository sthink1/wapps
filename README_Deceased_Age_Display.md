# FamilyTree Deceased Age Display Rule — 2026-09-09

Built from the current `/Google Drive/wonderfulApp` files.

## FamilyTree-wide rule
Whenever a person's Age is displayed and that person is deceased, the Age value/cell is displayed with a black background and white text. Living persons retain the normal Age display.

For display purposes, a person is treated as deceased when `Died = 1` or when a `DeathDate` exists.

## Current FamilyTree Age displays revised
- FTPerson
  - focal Person Age
  - Biological Parent ages
  - Biological Sibling ages
  - Partner ages
  - Biological Child ages
- FTAncestor
  - Biological Siblings, Partners, Biological Children, Grandchildren, Nephews/Nieces, and Cousins
- FTAncestorChild
  - Child Age
- FTAncestorPartner
  - Partner Age
- FTEvent
  - Age at Event cells; when the focal Person is deceased, the age-at-event values use the same black/white deceased-age treatment

## Audited but no Age field currently displayed
- FamilyTree.html
- FTPersonList
- FTPersonDuplicate
- FTPersonNew
- FTOneTreeMerge
- FTContact

## Replace these files
- `httpdocs/FTPerson.html`
- `httpdocs/js/FTPerson.js`
- `httpdocs/FTAncestor.html`
- `httpdocs/js/FTAncestor.js`
- `httpdocs/FTAncestorChild.html`
- `httpdocs/js/FTAncestorChild.js`
- `httpdocs/FTAncestorPartner.html`
- `httpdocs/js/FTAncestorPartner.js`
- `httpdocs/FTEvent.html`
- `httpdocs/js/FTEvent.js`

No route, SQL, database, npm, or environment changes are required.
