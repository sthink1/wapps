# TNNA v1.1 — Registration, Persistent Login, User Identification, and Updates

This package was generated from the current Wonderful Apps / TNNA files in Google Drive on 2026-10-08.

## What this implements

- TNNA requires a Wonderful Apps account before the native app screen is available.
- New users register through the existing `/users/register` backend and accept the existing Wonderful Apps Terms and Privacy Policy.
- Existing users log in through the existing `/users/login` credential + emailed 6-digit verification-code flow.
- TNNA completes verification through the new `/tnna/verify-code` endpoint.
- A short-lived 8-hour JWT access token is used for authenticated TNNA API calls.
- A random 180-day refresh token is stored only as a SHA-256 hash in MySQL.
- The refresh token itself is encrypted on Android with an AES key held by Android Keystore.
- Refresh tokens rotate whenever they are successfully used.
- A successful login is remembered on the device. If the backend is temporarily unreachable, TNNA can continue offline for up to 30 days after the last successful online validation.
- Town/city lookup remains local. No ride location or ride history is added to the server database.
- TNNA records the Wonderful Apps UserID, a TNNA-specific random device ID, app version/version code, first/last-seen times, and the user's TNNA update-email preference.
- TNNA checks `/tnna/version` when online and displays an Update Available box when the server version code is newer.
- The update button opens `TownNotice.html`; Android performs the signed APK update normally.
- Admin endpoints can list TNNA users and send an update email to users who opted in.

## Files to add

- `routes/tnna.js`
- `TNNA/android/app/src/main/java/com/wonderfulapps/townnotification/TnnaAccountPlugin.java`
- `sql/TNNA_v1_1_schema.sql` (run the SQL; it is not a runtime project file requirement)

## Files to replace

- `server.js`
- `TNNA/public/index.html`
- `TNNA/public/config.js`
- `TNNA/android/app/build.gradle`
- `TNNA/android/app/src/main/java/com/wonderfulapps/townnotification/MainActivity.java`
- `httpdocs/TownNotice.html`
- `httpdocs/privacy.html`

No change is made to `TownLocationService.java`, `TownLocationPlugin.java`, `BoundaryIndex.java`, or the local boundary files. The detailed Status and Speech diagnostics remain in the TNNA UI.

## Database changes

Run `sql/TNNA_v1_1_schema.sql` before a v1.1 client is allowed to use the new TNNA endpoints. It creates:

- `TNNAUserT`
- `TNNADeviceT`
- `TNNARefreshTokenT`
- `TNNAVersionT`

It also adds an active `TNNA_UPDATE_EMAIL` consent-text version and makes the revised 2026-10-08 Privacy Policy the active privacy consent version.

## Version / APK

The Android build is advanced to:

- `versionCode 2`
- `versionName "1.1"`

After building and verifying the signed release APK with the permanent TNNA key, copy it to:

`httpdocs/downloads/tnna/TownNotification-v1.1-development.apk`

The revised `TownNotice.html` points to that exact filename. Do not publish the revised `TownNotice.html` until that APK exists at the matching path.

Because v1.0 and v1.1 use the same application ID and permanent release signing key, the v1.1 release APK should install as an update over the signed v1.0 release APK. Do not uninstall v1.0 for the normal update test.

## Recommended implementation/test order

1. Create a new working branch from the current `main` (for example `tnna-v1.1`).
2. Add/replace the files in this package.
3. Run the SQL schema against the test/local database first, then the production database when ready.
4. Start the WA Node server and test `GET /tnna/version`.
5. In `TNNA`, run `npx cap sync android`.
6. Build the signed release APK using the existing JDK 21 / permanent signing-key process.
7. Install v1.1 over the signed v1.0 app on A8 and A15; confirm Android treats it as an update.
8. Test a brand-new WA registration through TNNA, then login + email verification.
9. Test an existing WA account login.
10. Close/reopen TNNA and confirm it remains logged in.
11. Disconnect internet after a successful online login and confirm TNNA still opens and location alerts work in offline mode.
12. Confirm Status, Speech, status-bar TN indicator, background use, and screen-off behavior are unchanged.
13. Confirm the TNNA user/device/version records are updated in MySQL.
14. Test the update-email checkbox on/off.
15. Build/copy the final APK as `TownNotification-v1.1-development.apk`.
16. Only then publish the revised `TownNotice.html` and deploy the backend changes.
17. Test the live download and update path on both phones.

## New TNNA API endpoints

- `GET /tnna/version` — current TNNA release metadata.
- `POST /tnna/verify-code` — completes the existing WA email-code login for TNNA and creates persistent credentials.
- `POST /tnna/refresh` — rotates the saved TNNA refresh token and returns a new 8-hour access token.
- `POST /tnna/logout` — revokes the supplied refresh token.
- `GET /tnna/me` — current TNNA account record.
- `PUT /tnna/update-email-preference` — changes TNNA update-email opt-in.
- `GET /tnna/admin/users` — admin-only TNNA user/version list.
- `POST /tnna/admin/send-update` — admin-only email notification to TNNA users who opted in.

## Existing WA authentication reused

No change is required to `routes/users.js`. TNNA deliberately reuses the existing WA registration and username/password login endpoint so TNNA users remain Wonderful Apps users rather than a separate account population.
