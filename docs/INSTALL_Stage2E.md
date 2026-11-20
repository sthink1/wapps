# WA Stage 2E — Installation manifest (proposal)

## Files, destinations, classification

| ZIP path | WA-relative destination | Action |
|---|---|---|
| `httpdocs/SubControl.html` | `httpdocs/SubControl.html` | REPLACE existing |
| `tests/stage2e.subcontrol.offline.test.js` | same | NEW |
| `change/SubControl.html.diff` | same | NEW verification evidence |
| `change/SubControl.html.verification.md` | same | NEW verification evidence |
| `change/SHA256.txt` | same | NEW checksum evidence |
| `change/offline-test-results.txt` | same | NEW evidence |
| `docs/INSTALL_Stage2E.md` | same | NEW installation/rollback guide |

No `.original` files are included, per the owner's current packaging rule.

## Before installation

1. Owner alone installs files in local WA and copies to authoritative Google Drive. Preserve the original as `SubControl_COPY.html` per owner's workflow.
2. Check original file SHA-256: `8827c2a7610fc60e933fe12e7aca1e10da831696f7dc9c2c8941412e3e2c3f17`. If it differs, STOP and reconcile before replacing.
3. Stage 2D backend `routes/subscriptions.js` and `services/subscriptionService.js` must be installed and operational before trying Subscription Administration.
4. Apply file to WA-relative destination only, preserve other files.

## Offline verification

From WA root, run `node --test tests/stage2e.subcontrol.offline.test.js`. Check delivered `httpdocs/SubControl.html` SHA-256 `d4a67ecfe0d6ea3c622cb338007d285517e78efda6f1770605a739e051225151`. This test does not access a server or database.

## Controlled staging validation (separate authorization)

Authenticate as verified staging administrator, retrieve a known test user, verify underlying versus effective subscription and plan options, confirm the old grant controls are absent but promo/admin management sections persist. A live save is a database mutation and must be separately approved with a rollback checkpoint; do not edit a real user merely to test.

## Rollback

Restore owner's saved `httpdocs/SubControl_COPY.html` to `httpdocs/SubControl.html`, verify the original SHA, and refresh test browser. This rolls back **the page only**, not any database changes made through the UI. If Stage 2D backend is absent or faulty, restore page and report failure; never replay a possibly committed PUT.

## Restrictions

No project, Drive, GitHub, Render or DB writes by assistant. 40-hour planning ceiling and independent review still apply. Stage 2F data migration and legacy service/table removal NOT included.
