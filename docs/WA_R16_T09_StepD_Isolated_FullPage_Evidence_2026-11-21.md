# Wonderful Apps — R16 T09 Step D acceptance evidence

**Date:** November 21, 2026
**Status:** Isolated full-page browser UI PASS (9/9); hosted real-server nested-error coverage remains OPEN.

## Source integrity

- Authoritative Drive `httpdocs/Weights.html` SHA-256: `925982a144bba7f54821ba32f37ba2f0cccc27784562c3333ef392e27b0e5c87`.
- Source matched the approved Step B replacement byte-for-byte.

## Environment and method

- Browser: Chromium 144.0.7559.96.
- Used complete actual HTML and its Search modal handlers, with external scripts excluded, an in-memory synthetic API facade, and location-origin substitution (about:blank).
- Network blocked; no requests to WA, Render, GitHub, Drive, or databases during browser execution.
- These fixture substitutions mean this is not a deployed full-stack or real-session test.

## Checks

| Case | HTTP | Result | Browser observation |
|---|---:|---|---|
| `nested_400` | 400 | PASS | Search failed: Safe synthetic validation message |
| `flat_400` | 400 | PASS | Search failed: Safe synthetic flat message |
| `unauthorized_401` | 401 | PASS | Search failed: Please log in to use Weights. |
| `forbidden_403` | 403 | PASS | Search failed: Your subscription does not include Weights. |
| `nested_500` | 500 | PASS | Search failed: Internal Server Error |
| `malformed_400` | 400 | PASS | Search failed: Request failed (HTTP 400) |
| `null_400` | 400 | PASS | Search failed: Request failed (HTTP 400) |
| `success_empty_200` | 200 | PASS | No matching entries found. |
| `success_row_200` | 200 | PASS | 1 result row |

- Each scenario exercised the Weights Search modal and `GET /weights/search?weight=172.5`.
- Each modal opening also performed the existing `GET /activities?choice=all`.
- Only GET methods were observed in synthetic request capture.
- No `[object Object]` or captured page JavaScript error appeared.
- Successful result path rendered one synthetic row.

## Explicit limitations / outstanding acceptance

- No genuine nested response was produced by a running WA server.
- No hosted staging deployment identity was confirmed.
- 401/403 tests verified UI messages only; they did not test actual WA.session or token rotation.
- Existing accepted T10, T12, T06 and earlier flat T09 evidence was not rerun.
- R16 T09 hosted nested-error real-browser coverage remains OPEN.

## Single next safe step

Before testing against the isolated staging service, verify its served `Weights.html` contains the approved nested-error correction. Open `https://wapps-stage6-test.onrender.com/Weights.html` in a browser, view page source, and search for `const detail = details && typeof details ===`. Do not trigger record changes or synthetic server failures. If the line is absent, do not mistake a stale staging deployment for a failure of the installed Drive file.

## Authorization boundaries

No changes made to authoritative/local WA, Google Drive, GitHub, staging configuration, databases, or production. No commit, merge, deploy, or server fault injection authorized or executed.
