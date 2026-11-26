# routes/users.js — original-to-final verification

Baseline: authoritative Drive `wonderfulApp/routes/users.js`, Git blob `025adb25194a2f83c7ecd5b19952a3afdbfadfb1`, commit `e8d3129fe652f1997084234e590e555cd373ffee`.

- Original SHA-256: `5699a086dbc184dc3d84618d4cdbfc9c4b6239f992f2593cec3fee552f680998`
- Final SHA-256: `caa87507d275a561fd7f953f80935d13d12ca96a1f2bdaa4e289c289a03c56d8`
- Full unified diff: `WA_AUTH_ABUSE_users.js.diff`.

## Authorized changes

1. Import new shared limiter and verification services.
2. `/users/login`: validate credential types; resolve account by database identity; re-read current account under existing credential fence; enforce five failed password attempts and three email reservations in rolling 15-minute windows. Commit failure increments, reserve email and insert the challenge in the same transaction, send email only after commit and do not refund failed/uncertain delivery. Use database UTC time for ten-minute challenge expiry. Preserve successful response fields. Generic 401 for invalid or blocked login; 429 after valid password when email quota exhausted. No raw password or token in new diagnostics.
3. `/users/verify-code`: delegate to shared verification service. Persist failed attempts, refuse exhausted/expired/stale/consumed challenges, and keep successful session creation in the transaction. Preserve existing Keep Me Logged In, cookie and subscription response operations. Reject malformed inputs safely; catch database failures. Format rewritten handler for readability.

No unrelated handler or import changes beyond the identified new imports. Automated comparison proved that removing only these authorized ranges yields identical original and final text; applying the full diff to an exact original reproduced the delivered file byte-for-byte. Syntax check passed. Actual loopback HTTP suite: 46/46 across both routes and services (simulated dependencies). Real database, Node 24, Express and browser acceptance outstanding.
