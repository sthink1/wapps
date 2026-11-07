# INSTALL_R10_14_SignedOut_Popup_Fix.md

## Purpose
Follow-up correction to the R10-14 offline Home safeguards. The R10-14 change set made all nine restricted buttons initially disabled, which correctly fails closed during offline startup but prevented the pre-existing Login Required modal when a visitor is confirmed signed out.

## Install
Branch: `reviseLogIn`. Apply ONLY to the local WA project; do not touch `main` or production.

- Replace `httpdocs/home.html` with the packaged complete file.
- No change to `httpdocs/sw.js` is required. Retain the existing R10-14 cache-v10 revision.
- Keep existing backup and historical files for planned pre-merge cleanup.

## What changed
After session restoration finishes and the result is explicitly `login_required` or `explicit_logout`, Home re-enables its restricted buttons solely as *Login Required modal triggers*. Its existing click handler checks `isUserLoggedIn()` before any application navigation. During `network`, `server_error`, `restore_unavailable`, or missing authentication module, the buttons remain disabled.

## Test before committing
1. Online, signed out: application and Contact Us buttons should look green. Clicking Loan Payment and Budget should show Login Required; neither should open the protected application.
2. Online, signed in as Standard-plan `charter`: verify Plan Standard, Loan Payment/Property Info/Town Notice/Contact Us enabled and other plan-restricted apps disabled.
3. Offline reload while token retained: verify Offline — session cannot be verified, Application access unavailable while offline, nine restricted buttons disabled, token preserved.
4. Restore online and reload: verify session and permissions recover.
5. `git diff --check -- httpdocs/home.html` and JavaScript syntax check; only then commit/push and manually or deliberately deploy to the isolated Render staging service.

## Limitation
The login popup is a UI/navigation affordance, not the security boundary. Protected APIs must continue enforcing authorization. R10 remains open pending hosted retests.
