# Wonderful Apps — R16-75-T11 Offline Test Results

**Date:** November 15, 2026  
**Disposition:** PASS — bounded offline, NOT hosted/integrated acceptance  
**Definition:** HTTP response caching and logs across protected route prefixes; `no-store` for sensitive outcomes and omission of synthetic secret data from status/log output.  
**Source used:** Proposed complete `server.js` from R16-75 T01 corrected ZIP; SHA-256 `00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81`. Existing `services/stage6ExpectedClientError.js` classifier loaded unchanged. Original source previously reconciled against Google Drive and GitHub `reviseLogIn` commit `73722f1`.

## Execution

`node --test tests/stage6.r16-75.t11.cache-log.offline.test.js` from an isolated extracted test tree. Node.js v22.16.0. The test uses JavaScript VM and controlled substitutes, evaluates source registrations without invoking `start()` or opening Express, database, HTTP sockets or deployment services. No authoritative WA files were written.

| Check | Result | Evidence scope |
|---|---|---|
| T11-A | PASS | 13 protected API prefixes, root and child paths, 400 and 500 simulated parser-stage errors (52 combinations); `no-store`, no synthetic unmarked secret disclosed |
| T11-B | PASS | 13 protected prefixes, root and child; route-level middleware guard plus simulated 401/403 response (52 auth-error combinations) |
| T11-C | PASS | Seven non-protected/public/look-alike request paths not newly flagged as `no-store` by central handler |
| T11-D | PASS | Four representative protected paths × seven HTTP statuses × marked/unmarked errors; captured central logger contains status only, no synthetic exception details (56 combinations) |
| T11-E | PASS | `headersSent` delegates exact error, no second body/status/cache header write |
| T11-F | PASS | Source assertions: catch-all logger omits request URL; central logger omits error messages |

**TAP outcome:** 6 tests passed; 0 failed. Test source syntax check passed. Synthetic test marker: `T11_SYNTHETIC_NONREAL_SECRET__DO_NOT_EXPOSE`.

## Interpretation / limits

- T11-A/B simulate route and central middleware behavior. They do **not** send real HTTP requests through Express, body-parser or Multer; cannot independently establish actual deployed HTTP headers.
- T11-D captures only the central handler's mocked logger, **not** third-party middleware logs, actual Render logs or every route-local logging path.
- Marked/approved 4xx messages may deliberately be returned as the public error message. The redaction checks correctly apply to unexpected errors and all 5xx errors, not to approved marked 4xx messages.
- The T06 real malformed-request integration requirement and the T10 real-browser unsaved-form check remain outstanding.
- T01–T10 results are unchanged and not rerun here. T12 and integrated/hosted acceptance remain pending.

## Installation / rollback

This package adds only `tests/stage6.r16-75.t11.cache-log.offline.test.js` and evidence records. There is **no replacement** `server.js`. Manually copy the relative files from the ZIP beneath the WA project root only after confirming the target installation uses the proposed `server.js` checksum. Do not change production or `main`. Rollback consists of removing this newly added test and evidence files, if desired; no application runtime source changes are included.
