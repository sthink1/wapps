9-23-26 reviseFT implementation package

SOURCE AUTHORITY
This package was generated from the current Wonderful Apps files in Google Drive on 2026-09-23.

INSTALL ORDER
1. Back up the WA database.
2. Run: sql/20260923_FamilyTree_CurrentHome.sql
3. Copy the revised/new files into the matching project folders.
4. Restart/redeploy the Node application.
5. Run the tests in TEST_CHECKLIST.txt.

NEW FILES
  httpdocs/FamilyTree2.html
  httpdocs/js/FTInstructions.js
  httpdocs/images/person.svg
  httpdocs/images/tree.svg
  httpdocs/images/person-placeholder.svg
  sql/20260923_FamilyTree_CurrentHome.sql

MAJOR REVISED FILES
  httpdocs/FamilyTree.html
  httpdocs/FTPerson.html
  httpdocs/FTPersonNew.html
  httpdocs/FTAncestor.html
  httpdocs/js/FTPerson.js
  httpdocs/js/FTPersonNew.js
  httpdocs/js/FTAncestor.js
  routes/familyTree.js

NAVIGATION REVISIONS
  httpdocs/home.html
  httpdocs/FTPersonList.html
  httpdocs/FTContact.html
  httpdocs/FTEvent.html
  httpdocs/FTOneTreeMerge.html
  httpdocs/FTUndoOneTreeMerge.html
  httpdocs/FTPersonDuplicate.html
  httpdocs/FTAncestorChild.html
  httpdocs/FTAncestorPartner.html
  httpdocs/js/FTPersonList.js
  httpdocs/js/FTOneTreeMerge.js
  httpdocs/js/FTUndoOneTreeMerge.js

NOT INCLUDED IN THIS REVISION
This package intentionally does NOT change the Person-deletion / duplicate-search / separated-tree behavior discovered while testing Test Person. That should be investigated as a separate focused issue after the redesign is installed and stable.
