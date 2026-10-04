# TNNA Version 1.0 — Apply, Build, and Test

**Date:** October 4, 2026  
**Project:** `C:\AppProjectwDB\WonderfulAppsRender\TNNA`  
**Node:** 24.21.0  
**npm:** 11.19.0  
**Capacitor:** 8.5.2

## 1. What this Version 1.0 does

TNNA Version 1.0 is a standalone Android app. During a ride it does **not** need the WA website, Render, MySQL, or an internet connection to determine the current town/city/community.

The phone obtains GPS coordinates and checks them against locally bundled U.S. Census boundary polygons. When the named area changes, the app says:

`You have entered: Orlando`

There is **no county fallback**. If the GPS point is outside a recognized named area, TNNA says nothing. Leaving a named area clears the current-area state so entering that same place again later will be announced.

Version 1.0 has no registration, login, subscription check, or ride-history storage.

## 2. Nationwide boundary coverage

The included builder retrieves January 1, 2026 U.S. Census Bureau TIGERweb geometry for all 50 states plus the District of Columbia.

It includes:

- incorporated places;
- consolidated cities;
- Census Designated Places (CDPs);
- general-purpose MCD/county-subdivision geography in Connecticut, Maine, Massachusetts, Michigan, Minnesota, New Hampshire, New Jersey, New York, Pennsylvania, Rhode Island, Vermont, and Wisconsin.

It does **not** include county polygons.

The generated data is divided into state-sized JSON files. Android loads only state shards whose bounding boxes could contain the current GPS point. This avoids loading the full U.S. dataset into memory at once.

The October 17 ride cities—Winter Park, Eatonville, Maitland, Casselberry, and Orlando—are ordinary Census place polygons. There is no special code or mandatory five-city validation in Version 1.0.

## 3. WA `server.js` status

You already revised the WA CORS list to include:

- `https://localhost`
- `capacitor://localhost`

No further `server.js` change from this package is required now.

## 4. `api.wonderfulappscompany.com`

TNNA is configured in `public/config.js` with:

`https://api.wonderfulappscompany.com`

You still need to configure this custom domain in Render and DNS. That does **not** block testing of the local town/city detection, because Version 1.0 does not call Render to identify the place.

See `WA_changes\api-domain-setup.txt`.

## 5. Before copying files

From PowerShell:

```powershell
cd C:\AppProjectwDB\WonderfulAppsRender
git status
node -v
npm -v
```

Expected Node result:

```text
v24.21.0
```

Commit or otherwise preserve any current work before replacing TNNA files.

## 6. Copy the Version 1.0 files

Extract the Version 1.0 ZIP somewhere outside the project first.

Copy the contents of the package's `TNNA` folder into:

```text
C:\AppProjectwDB\WonderfulAppsRender\TNNA
```

Preserve the folder paths. These are the principal Version 1.0 files:

```text
TNNA\
  capacitor.config.json
  package.json
  assets\icon\logoWA.jpg
  public\index.html
  public\config.js
  public\data\README.txt
  public\data\us\BUILD_REQUIRED.txt
  tools\build-us-boundaries.mjs
  android\app\src\main\AndroidManifest.xml
  android\app\src\main\java\com\wonderfulapps\townnotification\MainActivity.java
  android\app\src\main\java\com\wonderfulapps\townnotification\TownLocationPlugin.java
  android\app\src\main\java\com\wonderfulapps\townnotification\TownLocationService.java
  android\app\src\main\java\com\wonderfulapps\townnotification\BoundaryIndex.java
  android\app\src\main\res\... launcher icon resources ...
```

Do **not** delete your existing generated Android Gradle project. This package overlays the files that TNNA Version 1.0 changes.

## 7. Confirm Node and Capacitor

```powershell
cd C:\AppProjectwDB\WonderfulAppsRender\TNNA
node -v
npm -v
npx cap --version
```

Expected:

```text
v24.21.0
11.19.0
8.5.2
```

Run:

```powershell
npm install
```

This keeps `package-lock.json` synchronized with `package.json`.

## 8. Build the nationwide local boundary files

Internet access is required for this **development-time** step because the builder retrieves the official Census geometry. The installed TNNA app does not need internet for place detection afterward.

Run:

```powershell
npm run build:boundaries
```

The builder creates:

```text
public\data\us\manifest.json
public\data\us\01-AL.json
public\data\us\02-AK.json
...
public\data\us\56-WY.json
```

The last lines of the builder output report the total named-area count and the total JSON size. Keep that output for our review.

If this command reports an HTTP/Census error, stop there and send the complete output before proceeding.

## 9. Copy the web assets into Android

After the boundary build succeeds:

```powershell
npx cap sync android
```

This copies `public`—including all generated U.S. boundary files—into the Android app assets and refreshes Capacitor configuration.

## 10. Open Android Studio

Run:

```powershell
npx cap open android
```

Android Studio should open the existing TNNA Android project.

Allow Gradle sync to complete. Do not downgrade Gradle, Android Gradle Plugin, Java, or Capacitor versions.

## 11. Prepare the physical Android phone

You previously installed the TNNA test APK on your physical Android phone, so USB debugging may already be enabled.

If Android Studio does not see the phone:

1. Connect the Android phone to the Windows 10 development computer with a USB data cable.
2. Unlock the phone.
3. Make sure **Developer options** are enabled.
4. In Developer options, turn on **USB debugging**.
5. If the phone displays **Allow USB debugging?**, choose **Allow**. You may select **Always allow from this computer**.
6. In Android Studio, look at the device selector near the top toolbar. Your phone should appear by model/device name.

## 12. Install and run the debug Version 1.0 on the phone

In Android Studio:

1. Select your physical phone in the device selector.
2. Make sure the run configuration is `app`.
3. Click the green **Run** triangle.
4. Android Studio will build the debug APK, install it on the phone, and open **Town Notification**.

The launcher should use the Wonderful Apps `logoWA` artwork rather than the original Capacitor icon.

## 13. First permission/start test

On the phone:

1. Open **Town Notification**.
2. Confirm the UI resembles `TownNotice.html`, without a Home button.
3. Confirm the blue section is `#CDE8FF`.
4. Confirm `WonderfulAppsCompany.com` appears below the blue section.
5. Tap **Enable Location Alerts** while TNNA is visible.
6. When Android asks for location permission, allow **precise** location while using the app.

TNNA starts a location foreground service. Android should show an ongoing Town Notification system notification while monitoring is active.

## 14. Background and screen-off test

After monitoring starts:

1. Press Home or open the cycling/map application you intend to use during the ride.
2. Confirm the Town Notification foreground-service notification remains present.
3. Turn the phone screen off for a period, then turn it back on.
4. Reopen TNNA and confirm it still reports monitoring as active.
5. Travel across a known named-area boundary and listen for:

`You have entered: [name]`

Version 1.0 intentionally has no bounce/debounce suppression, so GPS movement near a boundary can cause repeated changes. We will evaluate that from actual testing.

## 15. Outside a named area

When GPS does not fall within one of the locally stored place/community polygons:

- no spoken county message occurs;
- TNNA says nothing aloud;
- monitoring continues;
- entering the next recognized town/city/community triggers the normal announcement.

## 16. Wonderful Apps link test

Tap `WonderfulAppsCompany.com` in TNNA.

It should leave the TNNA WebView and open the website in the phone's normal browser.

## 17. `api.wonderfulappscompany.com` setup

Before calling Version 1.0 release-ready, configure the API subdomain:

1. Render Dashboard -> Wonderful Apps web service -> **Settings**.
2. Under **Custom Domains**, add `api.wonderfulappscompany.com`.
3. At your DNS provider, create a CNAME record named `api` pointing to the current WA `*.onrender.com` hostname.
4. Return to Render and verify the domain.
5. Confirm HTTPS works.

Keep the Render `onrender.com` hostname enabled while testing.

Again, failure or delay in this domain setup does not stop the local ride announcements.

## 18. Database / SQL

There are **no SQL statements to run** for TNNA Version 1.0.

See `TNNA_v1_0_no_database_changes.sql` for the documented decision.

## 19. Recommended first command after applying this package

Because Node 24.21.0 is now permanently installed, there is no special Node terminal and no Node 18 step.

Start here:

```powershell
cd C:\AppProjectwDB\WonderfulAppsRender\TNNA
node -v
npx cap --version
npm install
npm run build:boundaries
```

After the boundary builder finishes successfully, review its output before moving on to `npx cap sync android`.
