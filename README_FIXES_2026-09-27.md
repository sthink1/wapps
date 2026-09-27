# WA corrective fixes — September 27, 2026

This corrective package is based on the current Google Drive WA files after testing the September 27 revision.

## Files to replace

- `httpdocs/FTPerson.html`
- `httpdocs/js/FTPerson.js`
- `httpdocs/etfCompare.html`
- `httpdocs/etfAPItest.html`

## Fix 1 — FTPerson picture context menu

The current `FTPerson.html` does not contain the in-progress Network controls, while `FTPerson.js` still attempted to attach Network event handlers unconditionally. A null element error stopped the DOMContentLoaded initialization before the picture context-menu handlers were attached.

The Network event-handler wiring is now conditional. This permits the current non-Network Person page to initialize normally while remaining compatible with the Network controls when they are restored later.

The `FTPerson.js` cache-busting query string in `FTPerson.html` was also changed to `v=20260927-picturefix1`.

Expected result:
- Right-click an entered picture.
- `ZOOM IN ON PICTURE` opens the responsive phone-size viewer.
- `MAKE PROFILE PICTURE` continues to work on non-profile pictures.
- The context menu closes normally.

## Fix 2 — etfCompare.html

The prior automated tracking insertion placed the shared `usageTracking.js` script tag inside the `printWindow.document.write()` JavaScript string. Browsers therefore terminated the enclosing script early and reported `Unexpected end of input`.

The malformed insertion was removed. The normal shared tracking script remains at the bottom of the page.

## Fix 3 — etfAPItest.html

The same insertion error occurred in `printPrompt()`, producing `Invalid or unexpected token` near line 1009. The malformed embedded script tag was removed; the normal shared tracking script remains at the bottom of the page.

## Tiingo 429 warnings

The logged `429` responses mean Tiingo rate-limited fallback requests. They are separate from the JavaScript syntax failures corrected here. After these files load again, Tiingo rate limiting may still affect symbols that require the Tiingo fallback.

## SQL

No SQL changes are required for these corrective fixes.
