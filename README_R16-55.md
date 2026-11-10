# Wonderful Apps — Stage 6 R16-55: Unexpected HTTP 4xx Error Classification

## Purpose
Run **offline**, **read-only**, source-backed negative tests on three representative API error-handling paths:

- `routes/familyTree.js`: `safeFamilyTreeErrorMessage`
- `routes/notifications.js`: `sendSafeNotificationError`
- `routes/subscriptions.js`: `POST /promo` exception handler

The test loads the two small helper functions from their source text, and executes the subscriptions route in a `vm` sandbox with mocked dependencies. It **does not** run the server, connect to any database, use live credentials, call any API, or change source code.

## Source verification
The authoritative Google Drive `wonderfulApp/routes` files were compared byte-for-byte via Git blob SHA with `sthink1/wapps` commit `0cb38b2` (`reviseLogIn`):

- `familyTree.js`: `b3e6f32b95cff47abf572518323e3313de3873f4`
- `notifications.js`: `05a50eb0dfc38f314490abec5654c7806a87de8b`
- `subscriptions.js`: `e1e5d98f5233baf84f16dca37e8635b378cebbe6`

The test reads the user's **currently installed files**; if those differ, interpret results against the local source and inspect the difference before changing anything.

## Installation
Extract the ZIP into the Wonderful Apps project root so the test file appears at:

`C:\AppProjectwDB\WonderfulAppsRender\tests\stage6.r16-55.unexpected-4xx.offline.test.js`

Only a new test file is provided; do not replace any application source.

## Run
From `C:\AppProjectwDB\WonderfulAppsRender`:

```powershell
node --test tests/stage6.r16-55.unexpected-4xx.offline.test.js
```

## Baseline expectations (unmodified commit `0cb38b2`)
**Nine tests**: six expected PASS and **three expected FAIL** (`R16-55C`, `R16-55F`, `R16-55I`).

The three negative cases deliberately inject an **unexpected** exception carrying `status:400` with the synthetic message `SYNTHETIC_INTERNAL_DETAILS_R16_55`. Existing handlers expose the synthetic string under that condition. This proves a classification gap under controlled test conditions, **not** that a real client can induce it or that any real secrets were exposed.

These are deliberately failing *security assertions*, not failures of the test harness. The test makes **no changes**. After inspecting results, any proposed correction must separately preserve existing 4xx contracts and undergo targeted regression testing.

Please return the test summary, including failing test names. Do not deliberately induce 5xx errors in hosted staging or production.
