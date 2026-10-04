# TNNA Version 1.0 — Apply and Test

## Scope

This package implements the agreed October 17, 2026 ride build:

- no registration, login, or subscription check;
- TownNotice-style UI with no Home button;
- `#CDE8FF` Town Notification area;
- WonderfulAppsCompany.com link opening in the system browser;
- background/screen-off Android operation through a location foreground service;
- local Florida incorporated-place lookup first, county fallback second;
- spoken text: `You have entered: <place>`;
- no anti-bounce logic yet;
- no ride/location history stored;
- `https://api.wonderfulappscompany.com` configured as the permanent API base.

## Files to copy

Copy the contents under `TNNA/` into:

`C:\AppProjectwDB\WonderfulAppsRender\TNNA`

Preserve the relative paths. The four Java files belong under:

`TNNA\android\app\src\main\java\com\wonderfulapps\townnotification\`

Replace the generated `AndroidManifest.xml` and `MainActivity.java` with the supplied versions.

The supplied `package.json` is based on the current TNNA package versions (Capacitor 8.5.2) and adds only build/helper scripts plus Node >=24 metadata.

## Build the official Florida boundary data

From a Node 24 terminal:

```powershell
cd C:\AppProjectwDB\WonderfulAppsRender\TNNA
npm run build:boundaries
```

The script downloads the official U.S. Census Bureau TIGERweb BAS 2026 Florida layers and writes:

- `public\data\florida-municipalities.json`
- `public\data\florida-counties.json`

It stops with an error unless these five ride municipalities are present and internally validate against their own Census polygons:

- Winter Park
- Eatonville
- Maitland
- Casselberry
- Orlando

Then copy web assets into Android:

```powershell
npx cap sync android
```

## Build/run

```powershell
npx cap open android
```

Run the debug build on the physical Android phone.

## First phone test

1. Open Town Notification while it is visible on screen.
2. Tap **Enable Location Alerts**.
3. Grant precise location when Android asks.
4. Confirm Android shows the persistent "Town Notification is active" notification.
5. Confirm the status changes to the current municipality or county.
6. Open a different navigation/cycling app.
7. Turn the screen off for several minutes.
8. Move/drive through a known municipal boundary and verify speech continues.
9. Reopen TNNA and confirm it still shows monitoring as active.
10. Tap **Stop Location Alerts** when finished.

## Boundary behavior

Lookup priority is:

1. incorporated municipality polygon;
2. county polygon only if no municipality contains the GPS point.

Examples:

- inside Winter Park -> `You have entered: Winter Park`
- inside Casselberry -> `You have entered: Casselberry`
- unincorporated Orange County -> `You have entered: Orange County`

No boundary stabilization is included in Version 1.0, by design. GPS bouncing near a border can therefore cause repeated area changes; that is the next refinement only if testing shows it is needed.

## Android background-location design

The service is deliberately started only from the visible TNNA screen when the user taps the button. It remains a location foreground service afterward, which is the Android-supported pattern for long-running navigation/location work while another app is foregrounded or the screen is off.

## CORS and API domain

Apply `WA_changes\server-cors-change.txt` to the current WA `server.js` CORS origin list.

Configure the Render custom domain using `WA_changes\api-domain-setup.txt`.

The ride-critical municipality/county lookup does not call Render, so custom-domain setup does not block local boundary testing.

## Database

No SQL change is required. See `TNNA_v1_0_no_database_changes.sql`.
