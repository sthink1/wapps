# FTPerson — Partner / Existing Children Prompt — 2026-09-15

Built from the current Google Drive WA files.

## Revised files
- `httpdocs/FTPerson.html`
- `httpdocs/js/FTPerson.js`
- `httpdocs/js/FTOneTreeMerge.js`

## Change

When a Partner is added to a Person who already has biological children, FTPerson now asks:

`Which of these children, if any, are also biological children of [Partner Name]?`

The user can select none, one, some, or all eligible children.

## Which children are eligible for the prompt

A child is NOT shown when:
- the newly added Partner is already recorded as that child's biological parent; or
- the child already has both biological Mother and Father recorded; or
- the child already has two biological parent records, including older records where ancestry side may be blank.

Therefore, the user is not asked an unnecessary question for a child whose two biological parents are already known.

For selected children, the existing `/children/:childID/partner-parent` endpoint is used. No new SQL or database table changes are required.

## OneTree

If ADD PARTNER results in a OneTree merge first, the same child-selection question is preserved after returning to FTPerson.

No route or SQL changes are required.
