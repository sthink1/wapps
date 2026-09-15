# FamilyTree Explicit Siblings + Parent Sharing + FTAncestor Layout

Built from the current `/Google Drive/wonderfulApp` files on 2026-09-15.

## Install order

1. Run `FamilyTree_Explicit_Sibling_Table.sql`.
2. Replace `routes/familyTree.js`.
3. Replace `httpdocs/FTPerson.html`.
4. Replace `httpdocs/js/FTPerson.js`.
5. Replace `httpdocs/FTAncestor.html`.
6. Replace `httpdocs/js/FTAncestor.js`.
7. Replace `httpdocs/js/FTOneTreeMerge.js`.
8. Restart the Node server.

## Explicit biological siblings

New table: `FTSiblingT`.

A biological sibling can now be recorded even when neither parent is known.

The Biological Siblings display is the union of:
- siblings derived from a shared recorded biological parent; and
- siblings explicitly recorded in `FTSiblingT`.

Duplicates are removed from the display.

`FTSiblingT` also participates in:
- Tree connectivity / split decisions;
- ordinary Tree merges;
- disconnected-component moves/restores;
- OneTree tree merges and Person remapping;
- Person deletion and empty-Tree cleanup.

## ADD SIBLING

`FTPerson.html` now has an **ADD SIBLING** button in BIOLOGICAL SIBLINGS.

It uses the same related-person / duplicate-review / USE EXISTING / OneTree workflow as the other relationship buttons.

Adding a sibling does not invent or automatically copy a parent.

If the focal Person already has known biological parents, after the sibling is added the page asks which of those parent(s), if any, are also biological parents of the new sibling.

## Adding a parent when siblings exist

After a biological mother or father is added to a Person who has biological siblings, the page asks which sibling(s), if any, also have that Person as their biological parent.

The user may select none, one, some, or all siblings.

The server prevents silently replacing a different biological mother/father already recorded for a selected sibling.

## FTAncestor layout

Family sections are now stacked vertically:

1. Biological Siblings
2. Partners
3. Biological Children
4. Grandchildren
5. Nephews and Nieces
6. Cousins

The relationship tables are reduced to a centered 760px maximum working width. The first four columns have compact widths and Name receives the remaining width. Names may wrap instead of requiring unnecessary blank width.

## SQL / schema

Only one new table is required:
- `FTSiblingT`

No other table changes are required.
