# FTAncestor — Remove Blood Line Feature — 2026-09-11

Built from the current `/Google Drive/wonderfulApp` versions of FTAncestor.

## Change

Because FamilyTree now records biological family relationships only, the optional
`Highlight Blood Line` feature is no longer needed.

Removed from `FTAncestor.html`:
- `Highlight Blood Line` selector
- None / Mother / Father choices
- Blood Line CSS variable
- special Blood Line highlighting CSS

Removed from `FTAncestor.js`:
- `applyBloodLineHighlight()`
- Blood Line sessionStorage read/write logic
- selector onchange handling
- post-load Blood Line highlighting call

The actual biological ancestry display is unchanged:
- maternal grandparents
- paternal grandparents
- biological mother
- biological father
- current Person
- siblings, partners, children, grandchildren, nephews/nieces and cousins

## Replace

- `httpdocs/FTAncestor.html`
- `httpdocs/js/FTAncestor.js`

No route, SQL, database, npm, or environment changes are required.
