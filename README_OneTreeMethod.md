# FamilyTree OneTreeMethod

## Purpose

This package implements the OneTreeMethod discussed for Wonderful Apps FamilyTree.

The design goal is that independently created FamilyTrees can converge into the oldest authoritative FamilyTree without leaving duplicate Person records behind.

The code in this package was built from the current Wonderful Apps files in the Google Drive `wonderfulApp` project, including the current R2 image-storage, picture-delete, notification, merge/split, and FTAncestor work.

## Database change

Run:

`FamilyTree_OneTreeMethod.sql`

This creates one new permanent audit-history table:

`FTPersonMergeT`

No existing FamilyTree table is deleted.

`FTPersonMergeT` preserves the source PersonID, surviving PersonID, source and surviving FamilyTree IDs, merge user/time, conflict choices, and snapshots of both Person records before the merge.

## Files to replace

- `routes/familyTree.js`
- `httpdocs/FTPersonNew.html`
- `httpdocs/js/FTPersonNew.js`
- `httpdocs/FTPerson.html`
- `httpdocs/js/FTPerson.js`

## New files

- `httpdocs/FTOneTreeMerge.html`
- `httpdocs/js/FTOneTreeMerge.js`
- `httpdocs/FTPersonDuplicate.html`
- `httpdocs/js/FTPersonDuplicate.js`

## Main behavior

### 1. Mandatory global duplicate check

Every server-side attempt to create a Person now checks the complete active FamilyTree Person database first.

This applies to:

- the first Person entered by a user;
- later Persons entered through FTPersonNew;
- Mother;
- Father;
- Partner;
- Child;
- Person creation from FTPerson.

The user no longer has to remember to press CHECK DUPLICATES. The button remains available for an early manual check, but SAVE performs the check automatically.

If possible duplicates exist, the Person is not created until the user reviews them.

### 2. Rich duplicate display

Possible matches include:

- Profile Picture;
- PersonID;
- name;
- birth date;
- birth place;
- parents;
- partners;
- children;
- current FamilyTreeCode;
- reasons the record was considered a possible match.

The user can choose:

- `USE THIS PERSON`
- `THIS IS A DIFFERENT PERSON`

The PersonID/View control opens a read-only `FTPersonDuplicate.html` page with additional Person details, family relationships, and pictures. This avoids granting membership in another FamilyTree merely to inspect a possible duplicate.

### 3. Tree connection no longer blindly merges populated trees

If `USE THIS PERSON` would connect two different active FamilyTrees, the server does not immediately merge them.

The user is sent to:

`FTOneTreeMerge.html`

The page identifies:

- the older/authoritative FamilyTree;
- the newer FamilyTree to be combined;
- possible duplicate Person records that already exist in both trees.

### 4. User decides Person identity

For every possible duplicate pair found between the two trees, the user must decide:

- SAME PERSON; or
- DIFFERENT PERSON.

The program does not silently decide that two people are the same.

When SAME PERSON is selected, the older-tree PersonID survives.

### 5. Conflicting Person facts

For the same confirmed Person:

- a value present only on one record is retained automatically;
- identical values require no choice;
- conflicting populated values are displayed to the user.

The user can choose the older-tree value or the newer-tree value for each conflict.

Fields covered include:

- FirstName
- MiddleName
- LastName
- SuffixName
- NickName
- MaidenName
- Gender
- BirthDate
- BirthPlace
- Died
- DeathDate

### 6. Contacts and events

When two Person records are merged:

- unique contacts from both are retained;
- duplicate contact type/value pairs are collapsed;
- EventPerson links are reassigned to the surviving PersonID;
- duplicate Event/Person links are collapsed.

### 7. Pictures / Cloudflare R2

Pictures from both confirmed duplicate Person records can be retained.

The One Tree review displays the pictures for the two Person records and lets the user deselect pictures before the merge.

The existing FamilyTree rule remains:

- maximum 5 pictures per Person;
- 1 Profile Picture;
- up to 4 Life Pictures.

R2 objects are copied to the surviving PersonID naming scheme. After a successful database commit, obsolete R2 objects are deleted.

If a database operation fails after an R2 copy, the code attempts to remove the newly created R2 copy.

### 8. Relationships

Parent and Partner relationships from the newer tree are remapped to surviving PersonIDs and added to the older tree.

Exact duplicate relationships are not duplicated.

If the older tree already occupies the same parent ancestry slot, the older-tree relationship remains authoritative rather than silently replacing it with the newer relationship.

This relationship-conflict rule is intentionally conservative. It can be expanded later into a separate user-choice conflict screen if desired.

### 9. FamilyTree users

When the trees are combined, active users associated with the newer tree are added to the older authoritative tree.

The newer tree's user memberships are then made inactive.

### 10. Tree history

The newer FamilyTree record is retained as a historical merged alias:

- `Status='Merged'`
- `MergedIntoFamilyTreeID` points to the older authoritative tree
- merge user/time are preserved.

This continues the existing FamilyTree merge-history model.

### 11. Person history

For every confirmed duplicate Person merge:

- newer/source PersonID is removed as an active Person;
- surviving older-tree PersonID remains;
- `FTPersonMergeT` permanently records the identity change and the pre-merge Person data.

A `MERGE_PERSON` entry is also written to `FTFamilyTreeActivityT`.

## Duplicate matching

The duplicate finder is deliberately a candidate finder, not an automatic identity decision.

It currently gives strong weight to combinations of:

- First Name
- Last Name / Maiden Name
- Birth Date
- Birth Place
- Middle Name
- Gender
- Death Date

Only the user can confirm SAME PERSON.

## Installation order

1. Back up the current database/project.
2. Run `FamilyTree_OneTreeMethod.sql`.
3. Replace the five existing files listed above.
4. Add the four new HTML/JS files.
5. Restart locally with `node server.js`.
6. Test locally before committing.

No new npm packages are required.

## Suggested tests

### Test A — automatic duplicate before first Person

1. Use an account that has never used FamilyTree.
2. Enter information matching an existing Person.
3. Press SAVE PERSON without pressing CHECK DUPLICATES.
4. Confirm that the possible duplicate screen appears and no new Person is created.
5. Open the Person review.
6. Choose USE THIS PERSON.
7. Confirm the existing FamilyTree becomes the active tree.

### Test B — different person

1. Enter a Person who produces a possible match but is actually different.
2. Choose THIS IS A DIFFERENT PERSON.
3. Press SAVE again.
4. Confirm a new Person is created.

### Test C — populated Tree2 joins older Tree1

1. Create Tree1 with several people.
2. Create Tree2 independently with some of the same people and some different people.
3. While adding another relative in Tree2, select USE THIS PERSON for a Person in Tree1.
4. Confirm the One Tree Review opens before any tree merge.
5. Mark duplicate pairs SAME PERSON.
6. Mark false matches DIFFERENT PERSON.
7. Resolve conflicting facts.
8. Select no more than five combined pictures for each merged Person.
9. Complete the merge.
10. Confirm Tree1 remains the authoritative older code.
11. Confirm unique Tree2 people appear in Tree1.
12. Confirm duplicate Tree2 PersonIDs no longer appear as active Persons.
13. Confirm `FTPersonMergeT` contains the merge records.

### Test D — R2

After Test C:

1. Confirm surviving Person pictures display correctly.
2. Confirm R2 contains the surviving PersonID filenames.
3. Confirm obsolete merged PersonID image objects were removed.

### Test E — users

1. Sign back in as users from both former trees.
2. Confirm both now use the older authoritative FamilyTree.

## Important

This package does not change the WA-wide Notification / Consent / Opt-Out policy. That broader system remains a separate future Wonderful Apps project, as previously agreed.
