# Wonderful Apps — R16-34 Logging Redaction (candidate)

Date: November 9, 2026. Candidate based on GitHub `sthink1/wapps` branch `reviseLogIn`, commit `9117a4006d6de186513b3602617b55c9c6c22e57`.

## Scope

Replace exactly four dynamic logging expressions in three files. The change does not alter request routing, authentication, API requests, database queries, ETF cache keys or cache contents, or user-facing HTTP responses.

- `routes/etf.js`: omit user/category cache key from successful cache-hit log; omit user-supplied symbol/date from Polygon 429 log.
- `routes/weights.js`: omit record ID from DELETE diagnostic; preserve Express validation and authorization.
- `httpdocs/js/usageTracking.js`: omit JavaScript exception text from browser warning; preserve fixed route path and fail-closed/no-retry behavior.

## Source verification

The three files are complete replacement files. Base files came from the authoritative read-only Drive copy and each was verified byte-for-byte against the exact GitHub `9117a40` blob after normalizing CRLF/LF as appropriate. The included `R16-34_changes.diff` shows only the four intentional lines.

## Manual installation (user-controlled)

**Do not copy these files into production or main.** Confirm `git branch --show-current` reports `reviseLogIn`, and `git status --short` before installation. Compare the installed original to the GitHub `9117a40` baseline or inspect the supplied diff; if the local source has moved on, do not overwrite newer changes. Back up as appropriate using your existing workflow; do not commit backup copies.

Install complete replacements at:

- `routes/etf.js`
- `routes/weights.js`
- `httpdocs/js/usageTracking.js`

Install the new test at `tests/stage6.r16.logging-redaction.offline.test.js`.

Run from the WA project root:

```powershell
node --check .\routes\etf.js
node --check .\routes\weights.js
node --check .\httpdocs\js\usageTracking.js
node --test .\tests\stage6.r16.logging-redaction.offline.test.js
git diff --check
git diff -- routes/etf.js routes/weights.js httpdocs/js/usageTracking.js
git status --short
```

The offline test includes source-level invariants and one isolated browser-script execution with a synthetic token-shaped marker. It does not provide full authenticated API or deployment verification. After local acceptance, staging testing should verify ETF comparison cache hits, Polygon rate-limit behavior when naturally occurring (do not force vendor limits), weights deletion only with disposable test data and explicit user decision, and browser usage-tracking warnings if they occur naturally. Do not run destructive actions just to test logging.

## Rollback

Restore the original three files from an approved backup or the `9117a40` GitHub commit. Re-run the pre-existing test suite as appropriate. Do not modify production or main as part of this Stage 6 candidate.
