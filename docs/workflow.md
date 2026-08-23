# FamilyTree Workflow

## Project Direction

FamilyTree will be rebuilt as a branch/module of the Wonderful Apps (WA) Node.js project.

The Microsoft Access application, `FamilyTree.accdb`, is a legacy source/reference system only. Its useful genealogy concepts and workflows may be retained, but the new application is not intended to reproduce Access forms, subforms, VBA, macros, or Access-specific table design constraints.

The web application will use the same general architecture as Wonderful Apps:

- Node.js / Express backend
- MySQL-compatible database hosted with the WA database environment
- Frontend pages under the WA `httpdocs` structure
- JavaScript API calls between browser pages and the backend
- Image files stored outside the SQL database

Existing Access data will be migrated only after the new workflow, table design, API, pages, and relationship behavior have been tested.

---

# 1. Main Application Entry

`FamilyTree.html` is the FamilyTree menu/home page.

Primary choices will include:

- New Person
- Person List
- Search

Additional navigation may be added as the application develops.

---

# 2. New Person Workflow

## Stage 1 — Create the Person

Selecting **NEW PERSON** opens:

`FTPersonNew.html`

This page is the dedicated new-person data-entry page.

It asks for the information that belongs directly to the person record in `FTPersonT`.

Expected person information includes:

- First Name
- Middle Name
- Last Name
- Suffix Name
- Nick Name
- Maiden Name
- Gender
- Birth Date
- Died
- Death Date, when applicable

The exact `FTPersonT` table fields will be finalized during table design.

The user selects **SAVE PERSON**.

The database creates the person and assigns a `PersonID`.

After the first successful save, the application automatically opens:

`FTPerson.html?PersonID=<new PersonID>`

---

# 3. Existing Person Dashboard

`FTPerson.html` is the principal display, navigation, and maintenance page for an existing person.

It is not the primary page for initially creating a new person.

The page displays the person's core information and provides access to:

- Parents
- Partners
- Children
- Photographs
- Contacts
- Events
- Ancestor Tree

Calculated age is displayed but is not stored permanently.

For a living person, age is calculated from Birth Date to the current date.

For a deceased person, age is calculated from Birth Date to Death Date and may be labeled **Age at death**.

---

# 4. Common Select Person Workflow

Adding a Parent, Partner, or Child uses one reusable person-selection workflow.

The common page will be:

`FTPersonSelect.html`

The calling page tells `FTPersonSelect.html` what relationship is being created and which person is the current focal person.

The user can:

1. Search for an existing person.
2. Select that person.
3. Or choose to create a new person if the desired person does not yet exist.

When an existing person is selected, the appropriate relationship is created and the application returns to the original focal person's `FTPerson.html` page.

When a new person must be created, the application opens the new-person workflow, creates the person, establishes the intended relationship, and returns to the original focal person's page.

This same selection workflow is used for:

- ADD PARENT
- ADD PARTNER
- ADD CHILD

Users should not normally be required to know or manually type another person's `PersonID`.

---

# 5. Parent Workflow

The Parents section displays the people recorded as parents of the current person.

The parent display will include information such as:

- PersonID
- Gender
- Age
- FirstName
- MiddleName
- LastName
- SuffixName
- NickName
- MaidenName

Gender displays the person's actual gender value, such as Male or Female. The display does not force one parent to be labeled Mother and the other Father.

Selecting **ADD PARENT** opens `FTPersonSelect.html`.

Parent relationships are stored separately from `FTPersonT` so the application is not limited by the old Access `MotherID` / `FatherID` design.

---

# 6. Partner Workflow

The Partners section displays zero, one, or multiple partners for the current person.

Selecting **ADD PARTNER** opens `FTPersonSelect.html`.

Partner relationships are stored separately from `FTPersonT`.

A partnership should be stored once and must be retrievable from either person's record.

---

# 7. Child Workflow

The Children section displays people for whom the current person is recorded as a parent.

Selecting **ADD CHILD** opens `FTPersonSelect.html`.

A child may have multiple parent relationships.

The Parent and Child displays are two views of the same parent-child relationship data.

---

# 8. Person-to-Person Navigation

A consistent navigation rule applies throughout FamilyTree:

When a displayed person is selected from a parent, partner, child, person-list, search-result, or ancestor-tree display, the application opens that person's dashboard:

`FTPerson.html?PersonID=<selected PersonID>`

The selected person then becomes the new focal person.

---

# 9. Ancestor Tree Workflow

`FTAncestor.html` displays the genealogy tree for the focal person.

The user must choose one of two blood-line views:

- **Mother**
- **Father**

There is no combined or "Both" blood-line view.

The application calculates the selected ancestry dynamically.

If **Mother** is selected, the tree follows the focal person's mother-side ancestry.

If **Father** is selected, the tree follows the focal person's father-side ancestry.

People belonging to the selected blood line are displayed using the agreed colored background:

`#FCE6D4`

Blood-line status is display logic only. It is not stored permanently as a `BloodLine` field in `FTPersonT`.

Changing the Mother/Father selection recalculates which people receive the colored background.

The focal person's Profile Picture is also used in the ancestor genealogy display.

---

# 10. Photograph Workflow

FamilyTree anticipates up to five photographs for each person.

One photograph is the **Profile Picture**.

The Profile Picture is used on:

- `FTPerson.html`
- `FTAncestor.html`
- other places where a single representative photograph is needed

Up to four additional photographs may show the same person at different stages of life.

Examples include photographs at approximately ages 10, 30, 50, and 70, but exact ages are not required.

Additional photographs may carry information such as:

- approximate age
- image date, when known
- caption
- display order

PDF documents and general document storage are not currently part of the FamilyTree scope.

## Development Image Storage

During development, image files are stored on the user's personal desktop computer and served through the development environment.

The SQL database should not store a Windows filesystem path such as:

`C:\FamilyTree\images\...`

Instead, the database should store a portable storage key/path such as:

`people/27/profile.jpg`

or

`people/27/age-10.jpg`

## Production Image Storage

The intended production image-storage service is an off-site cloud object store such as Cloudflare R2.

The same storage key should work in development and production. Only the storage provider/base location changes.

This allows local development without consuming cloud-storage capacity or operations while the image workflow is still being tested.

---

# 11. Contact Workflow

Contacts belong to a person and are managed separately from the person's core record.

`FTContact.html` displays and maintains repeatable contact information for the focal person.

Possible contact items include:

- address
- phone
- email
- website
- other contact notes

The exact table fields will be determined during table design.

---

# 12. Event Workflow

`FTEvent.html` displays and maintains life events associated with the focal person.

Possible events include:

- Birth
- Marriage
- Divorce
- Graduation
- Military Service
- Employment
- Residence
- Death
- Other

Age at the time of an event is calculated from the person's Birth Date and the Event Date; it is not permanently stored as the person's age.

During table design, the project will decide whether an event may be related to more than one person, for example a marriage involving two people.

---

# 13. Person List and Search

`FTPersonList.html` provides browsing and filtering of people.

`FTSearchMultiple.html` provides more advanced searching.

Search results should allow the user to open the selected person's `FTPerson.html` page.

Relationship searches should use relationship tables rather than old Access fields such as `MotherID`, `FatherID`, or `PartnerID` stored directly on the person record.

---

# 14. Development Sequence

The agreed development order is:

1. Finalize workflow.
2. Design the new FamilyTree tables for the Wonderful Apps database environment.
3. Finalize page responsibilities and navigation.
4. Design API routes.
5. Build the backend and frontend as a Wonderful Apps branch/module.
6. Test with a small set of temporary records.
7. Test parent, partner, child, blood-line, image, contact, event, list, and search workflows.
8. Validate important genealogy behavior against the legacy Access project and CLZ concepts where useful.
9. Migrate existing Access data last.
10. Validate migrated records before retiring the Access application as an operational source.

---

# 15. Legacy Access Role

`FamilyTree.accdb` remains useful as:

- a source of the existing person's data for later migration
- a historical reference for useful genealogy behavior
- a reference for the Computer Learning Zone-inspired design

The new application is not required to reproduce Access-specific implementation choices.

Access forms, queries, macros, modules, combo boxes, subforms, and self-join mechanics should be treated as historical implementation details unless they reveal useful functional behavior that should be preserved in the web application.
