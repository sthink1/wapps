Wonderful Apps — Stage 6 R16 /etf/config API-key exposure correction
November 5, 2026 — review/install manually on reviseLogIn staging branch only

SECURITY FINDING
Previously /etf/config returned FINNHUB_API_KEY, POLYGON_API_KEY, and TIINGO_API_KEY to any user authenticated to that route. The ETF API Test frontend requested those values and used Finnhub's key from browser JavaScript. Credentials must remain server-side.

REVISED FILES
routes/etf.js — COMPLETE file based on authoritative Google Drive file, modified only around /etf/config (replaced with HTTP 410 generic response) and new authenticated GET /etf/finnhub-quote. Existing R16 ETF error corrections retained.
httpdocs/etfAPItest.html — COMPLETE file based on authoritative Google Drive; removes /etf/config and direct Finnhub token requests; uses authenticated /etf/finnhub-quote; preserves existing Tiingo proxy, symbol lookup, tables, and fallback.
tests/stage6.r16.etf-config-secret.offline.test.js — 10 isolated, offline regression tests.
REVIEW_etf_config.diff — unified source comparison.

BEHAVIOR
- GET /etf/config remains authenticated but returns 410 Gone with no secret fields. New /etf/finnhub-quote requires authentication and a validated ticker; server calls Finnhub and returns {price:<positive number>, adjPrice:null} only.
- 400 invalid symbol; 404 unavailable quote; 502 upstream failure; 503 absent provider key. None return provider exception messages. The frontend retains its Tiingo fallback when quote unavailable.
- No schema or environment-variable changes; only two source files. No direct provider calls added to browser.
- Existing server-wide /etf no-store middleware remains in place.

LOCAL INSTALLATION
1. Review the diff and compare both complete source files with your current reviseLogIn originals. Do not install if the originals differ materially from the referenced versions.
2. Copy the TWO revised source files and ONE new regression test into their existing relative paths yourself. Keep backups outside the proposed commit.
3. node --check .\routes\etf.js
4. node --test .\tests\stage6.r16.etf-config-secret.offline.test.js
5. git diff --check
6. Run all previously passing R08/R16 regression tests before Git review, commit, and staging deployment.
7. After staging is Live, verify the retired endpoint via an UNAUTHENTICATED GET only (should return 401) and, with an approved test login, verify only status/JSON field NAMES on /etf/config, never print the response values or tokens. Functional ETF API test via a dedicated staging identity is still required.

IMPORTANT LIMITS
- Targeted offline mocks cannot establish hosted operation, all frontend consumers, or effectiveness of application-wide authorization. Run real staging tests under approved isolated test credentials; no live destructive actions.
- Credentials potentially disclosed before this correction should be rotated after safe deployment coordination. Rotation is NOT performed by this package; any existing logs/client storage/other affected code require separate assessment. Production remains unchanged.
- This fixes the known source dependency; not a global audit of all API key usages. DO NOT open /etf/config while an unfixed service is deployed.
- No changes to production, main, TNNA, Drive, or local originals were made in preparing this package.
