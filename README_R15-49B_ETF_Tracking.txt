Wonderful Apps — R15-49B ETF tracking standardization
Date: 2026-11-09

Download-only replacement package, generated from the six HTML files read from authoritative Google Drive My Drive/wonderfulApp/httpdocs. No source project files or Drive items were changed.

INSTALLATION (performed manually by project owner):
- Back up or compare the current local branch files before replacement. The reference source is the Google Drive snapshot; do not overwrite newer local changes without comparing.
- Copy the six complete HTML files from the ZIP httpdocs/ folder into the corresponding local project's httpdocs/ folder.
- Ensure the existing shared files httpdocs/js/waPlatform.js and httpdocs/js/usageTracking.js are present; this ZIP does not modify them.
- Do not install to main or production. Test locally on reviseLogIn and the isolated test database first.

CHANGE (each of 6 HTML pages):
- Replace <script src="js/usageTracking.js?v=20260927-1"></script>
  with two ordered script tags:
    <script src="js/waPlatform.js"></script>
    <script src="js/usageTracking.js?v=20261108-1"></script>
- No other source bytes changed.

Verify: scripts return HTTP 200, authenticated POST /track/log/page returns 200, POST /track/log/time-spent arrives every ~30 seconds, dashboard aggregates elapsed time, ETF functions still work normally.

Out of scope: amortization.html day-31 issue; future correction should be handled separately after browser reproduction.
