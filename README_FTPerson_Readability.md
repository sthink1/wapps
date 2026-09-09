# FTPerson Readability + Sibling Table Revision — 2026-09-09

Built from the current `/Google Drive/wonderfulApp` FTPerson files.

## Changes

### Biological Siblings
- Removed the Picture column.
- Renamed `Person` to `PersonID`.
- PersonID now displays the actual numeric ID and remains clickable.
- Columns are:
  - PersonID
  - Gender
  - Age
  - Name
- Long sibling names may wrap instead of being clipped.

### PERSON section
The PERSON section was redesigned to be more compact and easier to scan, inspired by the prior Access layout while preserving the current web functions.

- Two aligned label/value pairs are used across the factual information.
- ANCESTOR / CONTACT / EVENT are in their own action column beside the profile picture.
- Profile picture remains on the right.
- Labels improved:
  - First Name
  - Middle Name
  - Last Name
  - Suffix
  - Nickname
  - Maiden Name
- Born / Died and Birth Place / Age remain visually paired.
- EDIT PERSON and DELETE PERSON remain below the data.
- Long names are specifically accommodated:
  - value columns use flexible widths;
  - long names can wrap;
  - no fixed short-width boxes are used for First, Middle, Last, or Maiden Name.
  - names such as `Pedro Gonzales Humane Maduro` can display without forcing the rest of the layout off-screen.

## Replace

- `httpdocs/FTPerson.html`
- `httpdocs/js/FTPerson.js`

No route, SQL, npm, or environment changes are required.
