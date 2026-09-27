# WA Family Tree Network - First Attempt

## Files

### Revised
- `routes/familyTree.js`
- `routes/notifications.js`
- `httpdocs/FamilyTree2.html`
- `httpdocs/js/FamilyTreePage.js`
- `httpdocs/FTPerson.html`
- `httpdocs/js/FTPerson.js`

### New
- `httpdocs/FTNetwork.html`
- `httpdocs/js/FTNetwork.js`
- `httpdocs/networkVerification.html`
- `sql/network_schema.sql`

## Install order
1. Back up the WA database.
2. Run `sql/network_schema.sql`.
3. Copy the revised/new files into the matching WA folders.
4. Confirm `PUBLIC_BASE_URL` is set to the public WA origin on Render. The existing notification system already uses this setting.
5. Restart the Node server.
6. Hard-refresh/reload the browser as needed for JavaScript changes.

## First-pass behavior
- `FamilyTree2.html` has a **NETWORK** button, enabled only when there is a current FamilyTreeCode.
- `FTNetwork.html` searches only the current Family Tree.
- Search results show the Person symbol; clicking it opens that Person's `FTPerson.html` page.
- Only Persons whose Network profile is checked for inclusion and verified by email are searchable.
- The Person page has a **NETWORK** button that opens the Network modal.
- Network includes Education, Career/Profession, Skills/Interests/Organizations, Can Help Relatives With, Network Note, and Preferred Contact Type.
- Checking **Include this Person in Family Network Search** sends a verification request to the Person's selected Email contact unless the same email is already verified.
- Changing/deleting the selected Person email invalidates the old verification and, if inclusion remains checked and another email is available, sends a new verification request.
- Approval/decline works without a WA login through `networkVerification.html` and `/notifications/network-verification/:token`.
- Network search also searches existing Person, Contact, and Event information for verified Network participants.

## Notification expansion in this first pass
`familyTree.js` now uses the existing Family Tree activity log to send notifications after a successful commit for:
- Contact added/edited/deleted
- Event added/edited/deleted
- Picture added/deleted/profile-picture changed
- Direct relationship additions recorded by the current relationship workflow (biological parent, biological child, biological sibling, partner, and current shared-parent helper actions)

Network itself sends one user-facing notification per Network save/delete:
- Network Added
- Network Edited
- Network Deleted

Education/Career/Skill/Help changes remain details inside the single Network notification, not separate notification categories.

## Suggested first test
1. Use a test Family Tree with two or more relatives.
2. Give one Person an Email contact you control.
3. Open that Person and choose NETWORK.
4. Add one Education item, one Career item, one Skill/Interest item, and one Can Help category.
5. Check **Include this Person in Family Network Search** and save.
6. Verify the Family Network email arrives and approve it.
7. Open FAMILY TREE > NETWORK and search for one of the values entered.
8. Confirm the Person appears and the Person symbol opens the correct Person page.
9. Change the Person's primary Email contact and confirm the old verification no longer permits search and a new verification request is generated.
10. Test Contact/Event/Picture/direct relationship changes and confirm the Family Tree change notification is produced.

## Deliberate first-pass limits
- Network data is attached to `PersonID`; search scope is always constrained by current `FamilyTreeCode` membership on the server.
- The modal uses one Save for the entire Network profile. Adding/removing rows in the modal does not touch the database until **SAVE NETWORK** is clicked.
- Network verification proves control of the email address that approved the request; it does not independently prove legal identity.
