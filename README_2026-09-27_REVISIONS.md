# WA revisions — September 27, 2026

This package was built from the current Wonderful Apps files in Google Drive.

## Changes included

1. **Usage tracking**
   - Adds `httpdocs/js/usageTracking.js` as a shared page/time tracker.
   - Adds it to Town Notice, Interest Earned, all current Family Tree pages, and all current ETF pages.
   - Removes the broken Interest Earned time URL (`http:///track/log/time-spent`) and replaces that page/time logic with the shared tracker.
   - Adds `middleware/usageActivity.js` and wires it into the protected application API routes in `server.js`.
   - Requests/Actions now records successful API calls.
   - Data Activity records successful POST/PUT/PATCH/DELETE activity using CREATE/UPDATE/DELETE usage events.
   - Storage Activity records successful uploaded files.
   - Email Activity is read from successful `NotificationHistoryT` email records by `RelatedApp`, so App Usage also counts Family Tree emails sent to non-WA relatives. User Usage can associate email activity only when the notification has a UserID.
   - Adds `RECORD_DELETE` to the permitted usage events in `subscriptionService.js`.
   - No change to `track.html` is required; its existing rows will begin using the newly recorded events.

2. **SubControl Access Through date**
   - The Grant Free Usage and Edit Grant Access Through fields now accept direct `MM/DD/YYYY` typing, e.g. `12/28/2030`.
   - The page validates the date and converts it to the existing backend `YYYY-MM-DD` format before submission.

3. **FamilyTree instructions**
   - Information modals open at the top of the viewport and reset their internal scroll to the top each time.
   - The first Instructions sentence now says `Person Page` instead of `Family Tree`.
   - That sentence is displayed as a black banner with bold white uppercase text.

4. **FTPerson Picture Zoom**
   - Right-click picture menu now includes `ZOOM IN ON PICTURE`.
   - Zoom works for the Profile Picture and life-stage pictures.
   - Viewer width is responsive: `min(95vw, 320px)`. On an approximately 250px phone viewport it is about 238px wide; on desktop it never exceeds 320px.
   - Picture uses `object-fit: contain`, maximum height 75vh, and can be closed by Close, outside-click, or Escape.

## SQL

**No SQL statements are required for this revision.** The existing `UserUsageT`, `TrackUsageT`, and usage-event design are reused.

## Files to add

- `httpdocs/js/usageTracking.js`
- `middleware/usageActivity.js`

## Files to replace

- `server.js`
- `routes/track.js`
- `services/subscriptionService.js`
- `httpdocs/SubControl.html`
- `httpdocs/FamilyTree.html`
- `httpdocs/FTPerson.html`
- `httpdocs/js/FTPerson.js`
- tracking-enabled Family Tree / ETF / Town Notice / Interest Earned HTML files included in this package

## Suggested test order

1. Restart Node after replacing backend files.
2. Open Town Notice, Interest Earned, several Family Tree pages, and several ETF pages for at least 10–20 seconds each, then leave the page normally.
3. Open `track.html` and verify Total Time Used / Average Session are no longer zero for those apps.
4. Perform Family Tree/ETF/Interest/Budget data actions and verify Requests / Actions and Data Activity increase.
5. Upload a Family Tree picture and verify Storage Activity increases.
6. Trigger a Family Tree email notification to a registered relative and verify Email Activity increases.
7. Test Grant Free Usage by typing `12/28/2030`.
8. Test FamilyTree instruction modals from a scrolled page.
9. Right-click Profile and life-stage pictures and test Zoom on desktop and phone.
