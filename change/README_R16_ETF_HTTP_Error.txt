Wonderful Apps — Stage 6 R16 — ETF HTTP Error Classification
Date: 2026-11-05
Source reviewed: Authoritative Google Drive My Drive/wonderfulApp/routes/etf.js
Development branch: reviseLogIn

PURPOSE
The ten existing ETF category, symbol, and activity error handlers used
err.message.endsWith('(be)') to decide whether the exception could be
returned to a client as HTTP 400. However, (be) signifies that the
message originated in the backend; it does not mean client-safe.

This package preserves intentional validation messages and the (be)
convention, but marks app-created validation errors explicitly with a
module-private WeakSet. Only those marked errors may reach the user as
HTTP 400 from the ten affected exception handlers. Unexpected exceptions,
even if their text ends with (be), get the existing generic HTTP 500
message. Missing/non-string error messages are handled without a new
secondary exception. The existing ER_DUP_ENTRY HTTP 400 branches in buy
and sell remain unchanged.

Polygon symbol lookup: confirmed invalid/inactive/missing symbols and
upstream HTTP 404 still report the preexisting client-safe not-found
message. Other upstream failures (including 429/5xx) no longer masquerade
as invalid-symbol HTTP 400; they reach the existing generic 500 path.
This is an intentional correction in classification, not a price or
business logic rewrite.

ARCHIVE CONTENTS
routes/etf.js — complete replacement source
 tests/stage6.r16.etf-http-error.offline.test.js — isolated 8-test Node suite
REVIEW_etf.diff — unified diff from authoritative Drive version
README_R16_ETF_HTTP_Error.txt — this guide

USER INSTALLATION (assistant does NOT write project or Google Drive)
1. On reviseLogIn, verify your local original matches the Drive source
   snapshot represented by REVIEW_etf.diff before replacement. Reconcile
   any differences manually rather than overwriting newer modifications.
2. Make a local backup under your own procedure; extract complete files
   into matching paths after inspecting the diff.
3. In PowerShell at C:\AppProjectwDB\WonderfulAppsRender:
   node --check .\routes\etf.js
   node --test .\tests\stage6.r16.etf-http-error.offline.test.js
   git diff --check
4. Report the output before running broader Stage 6 regression tests,
   reviewing the Git diff, committing or deploying. Never use production
   accounts or live transaction mutations for security experiments.

TEST LIMITATIONS
Eight isolated tests run the actual router with mocked Express and
transaction dependencies, not a real database or external pricing API.
No hosted endpoint was tested by these tests. A full functional ETF
regression remains appropriate before merging to main.

HIGH PRIORITY SEPARATE FINDING — API KEY DISCLOSURE
The CURRENT SOURCE's GET /etf/config endpoint returns values of
FINNHUB_API_KEY, POLYGON_API_KEY and TIINGO_API_KEY to any user passing
its ordinary auth middleware. This code remains UNCHANGED IN THIS PATCH.
The impact depends on middleware, key scope and frontend use, which
require further investigation. Do not call /etf/config on production to
retrieve keys, and never paste keys into chat or test logs. Prioritize
containment, frontend dependency review, and potential rotation once
server-side-only use can be established. No key rotation or configuration
change has been performed.

SAFETY
No WA Google Drive or local project files, production systems, Git main,
or TNNA were modified by the assistant. This archive is solely for the
user to inspect and place into their project.
