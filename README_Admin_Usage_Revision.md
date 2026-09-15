# Wonderful Apps — Admin and Usage Revision

This revision is based on the current Wonderful Apps files in Google Drive.

## Changes

- User #1 (`sthink`) and the configured `ADMIN_USERNAME` are treated as administrators.
- Administrators bypass subscription plan and development-availability restrictions, including ETF Investing.
- The Home page reports administrator access and leaves all active app buttons available.
- `subscription.html` now places the Home button directly below the page title.
- `subscription.html` now uses the standard footer including `Designed by MPG Jr`.
- `track.html` adds a **User Usage** table.
- `routes/track.js` returns per-user/per-app totals for APP_OPEN, RECORD_CREATE, RECORD_UPDATE, API_CALL, EMAIL_SENT, and FILE_UPLOAD events.
- `/track/stats` is now server-side administrator-only. Ordinary users can still submit their own page/time tracking events.

## Replace these files

- `httpdocs/home.html`
- `httpdocs/subscription.html`
- `httpdocs/track.html`
- `routes/track.js`
- `routes/subscriptions.js`
- `middleware/subscriptionAccess.js`
- `services/subscriptionService.js`

No SQL changes are required for this revision. Existing `UserUsageT` data is used.

## Important testing

1. Log in as user #1 / `sthink`. Confirm ETF Investing is enabled and opens.
2. Confirm Track Activity opens for the administrator.
3. Confirm a non-admin user cannot fetch `/track/stats` or use Track Activity from Home.
4. Open Subscription and confirm Home is immediately below the title and the standard footer is displayed.
5. Open several apps, then open Track Activity and confirm the User Usage section shows APP_OPEN totals. Other event columns will remain zero until those event types are wired into the related application routes.
