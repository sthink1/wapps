# Wonderful Apps - R15 Budget Tracking Local-Only Candidate
Date: 2026-11-08
Status: Static validation PASSED. Browser/database integration NOT YET TESTED.

## Verified findings
- R15-44B: Local BinForm.html did not request usageTracking.js.
- Today's UserID 1 test: /budget.html 4 View records and 3 TimeSpent records totaling 19 seconds; no B*.html events.
- Current routes/track.js already groups budget.html and B*.html into the Budget column. No route replacement is necessary for this correction. Retain the previously tested FamilyTree2.html fix in your local routes/track.js.

## What is in the ZIP
- httpdocs/: 18 complete revised Budget subpage HTML files. These are the only files intended for installation.
- reference_only_do_not_overwrite_without_diff/budget.html: copy from the original pilot for comparison only. The local main budget.html already has the tracker and is NOT part of this install.
- MANIFEST.json: inventory and structural change record.

The sole change to each subpage is insertion of:
  <script src="js/waPlatform.js"></script>
  <script src="js/usageTracking.js?v=20261108-1"></script>
before the actual closing </body> tag, after its existing application scripts.
No existing inline JS, UI, SQL schema, finance logic, form validation, event handlers or navigation were modified.
No server files or shared JavaScript files are included or replaced.

## User-controlled installation
1. Verify your current project files against the Google Drive snapshot used here. If local code differs, STOP and reconcile the differences first, rather than replacing newer local changes.
2. Copy ONLY the 18 files in ZIP/httpdocs to LOCAL project httpdocs.
3. Ensure httpdocs/js/waPlatform.js and httpdocs/js/usageTracking.js already exist (both were installed for the preceding pilot).
4. Run only against isolated wapps_test database using node --env-file=.env.test server.js. Confirm WA_ENV=local and test DB verified.
5. Do not deploy to Render staging/production or merge main at this step. Do not alter authoritative Drive or local project directly with assistant tools.

## Test protocol (one at a time)
R15-45A: log in as sthink; navigate budget.html -> BinForm.html; in Network -> All confirm both scripts load HTTP 200 and POST /track/log/page returns 200 with {page:"/BinForm.html"}. No Console errors.
R15-45B: stay ~70 sec on BinForm.html (no modifications); navigate back to budget.html and use read-only SQL to check positive TimeSpent rows and no overlapping/duplicate timed intervals. Do not assume each page reload equals a new session.
R15-45C: navigate to one report and one other form, confirm logging and existing UI behavior without saving records.
R15-45D: verify combined Budget dashboard total reflects budget.html and B*.html time in the isolated test database.
Finally, audit all remaining authenticated WA pages including ETF; this candidate does not certify project-wide S6-025 closure.

## Validation
All 18 resulting HTML pages parsed to a single body; each contains exactly one waPlatform.js and one usageTracking.js import, with session script first; each page's inline JS passed `node --check`. Output outside inserted tags is byte-identical to its source text after UTF-8 decode/encode. Real browser and DB behavior not yet verified.

## Important architectural caveats
- The installed shared tracker uses 30-second foreground checkpoints and `keepalive` for final sends; their exact-once persistence under abrupt closure, token expiry, multi-tab use and intermittent connectivity remains to be tested.
- Action tracking is distinct from page duration. Do not replace existing accounting workflows with the time tracker.
- Page-level tracking counts authenticated page loads, not necessarily one per high-level application session. Track usage definition and session aggregation remain separate review items.
- If a page's JS is broken or browser errors occur, stop and investigate before further installs. No financial data writes are required for tracking smoke tests.
