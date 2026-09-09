# FamilyTree Biological-Only + Siblings Revision — 2026-09-09

Built from the current WA files in `/Google Drive/wonderfulApp`.

## Policy implemented

FamilyTree now treats recorded parent-child ancestry as biological only.

A prominent notice on `FamilyTree.html` states:

> FamilyTree records biological family relationships only. Parents, children, siblings and ancestry shown in FamilyTree are biological relationships. Adoptive, step and other non-biological parent-child relationships are not included.

The recently-added Adopted Child option has been removed.

New parent-child relationships are saved only as biological `Parent` relationships. Existing rows whose `FTParentT.ParentType` is `Adopted` are not automatically deleted, but the revised primary relationship/ancestor/sibling graph queries exclude them. This avoids silently converting an adopted relationship into a biological one.

## Siblings

`FTPerson.html` and `FTAncestor.html` now include:

`BIOLOGICAL SIBLINGS (n)`

Placement is after PERSON and before PARTNER.

Columns:
- Picture
- Person
- Gender
- Age
- Name

A sibling is calculated from `FTParentT`: two people are siblings when they share at least one recorded biological parent. Full and half siblings are both included, but there is no Full/Half display column. A person sharing both biological parents is counted only once.

## Other wording

- PARENTS -> BIOLOGICAL PARENTS
- CHILDREN -> BIOLOGICAL CHILDREN
- ADD MOTHER/FATHER/CHILD -> ADD BIOLOGICAL MOTHER/FATHER/CHILD
- Partner co-parent question now asks whether the Partner is also a biological parent.
- One Tree Review labels Parents/Children as Biological Parents/Biological Children.
- FTPersonNew Part 2 uses biological parent/child wording.

## Files to replace

- `routes/familyTree.js`
- `httpdocs/FamilyTree.html`
- `httpdocs/FTPerson.html`
- `httpdocs/js/FTPerson.js`
- `httpdocs/FTPersonNew.html`
- `httpdocs/js/FTPersonNew.js`
- `httpdocs/FTAncestor.html`
- `httpdocs/js/FTAncestor.js`
- `httpdocs/js/FTOneTreeMerge.js`

No SQL, `.env`, or npm changes are required.

## Suggested tests

1. FamilyTree.html shows the biological-only notice prominently.
2. FTPerson shows BIOLOGICAL SIBLINGS with the correct unique count and profile pictures.
3. FTAncestor shows BIOLOGICAL SIBLINGS after PERSON and before PARTNERS.
4. A full sibling appears once, not twice.
5. A half sibling appears in the sibling list.
6. Clicking the sibling P button opens FTPerson; on FTAncestor, clicking the sibling name makes that sibling the focal person.
7. Adding a child creates only a biological Parent relationship; there is no Adopted Child option.
8. Partner question explicitly asks whether the Partner is also a biological parent.


## Restored `httpdocs/js` folder verification

This replacement package was rechecked after the current `/Google Drive/wonderfulApp/httpdocs/js`
folder was restored on 2026-09-09.

The restored current Drive copies of:

- `FTPerson.js`
- `FTPersonNew.js`
- `FTAncestor.js`
- `FTOneTreeMerge.js`

were compared byte-for-byte (SHA-256) with the current-source copies used to build the prior
biological-only/siblings revision. All four matched exactly. Therefore no additional functional
changes were required because of the restored folder; this package is a newly verified complete
replacement for the prior ZIP.
