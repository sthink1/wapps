# routes/tnna.js — original-to-final verification

Baseline: authoritative Drive `wonderfulApp/routes/tnna.js`, Git blob `60e63dfe17f744451b94f7ca9f226227ec2ed4e4`, commit `e8d3129fe652f1997084234e590e555cd373ffee`.

- Original SHA-256: `c23e20006d6377a727581f65d0bb7e6afc9e09fe0bad965b733097d8d209410b`
- Final SHA-256: `0341f54378dd010958f40aba9c8a2e0c5ae763da40fd4a019d8ad662b0c275ee`
- Full unified diff: `WA_AUTH_ABUSE_tnna.js.diff`.

## Authorized changes

1. Import shared verification service. TNNA password login already uses `/users/login`; no duplicate password handler added.
2. `/tnna/verify-code`: validate request, preserve accepted numeric/string code inputs, locate candidate, use credential fence and shared persistent challenge attempts. Commit counted failures; reject expired, stale, exhausted or used challenges. Consume successful challenge within the native session transaction. Preserve device registration, consent, refresh credential and successful response operations; release connection and handle exceptions. Denial message is shared with the web route.

No changes to remaining native handlers or token lifecycle. Automated comparison proved identical text outside the authorized handler/import; applying the diff reproduced the final delivered bytes. Syntax passed. Actual offline loopback suite tested native success, shared attempt ceilings, concurrent simulated requests and rollback (46 total cases across package). Real database/native acceptance outstanding. The authoritative native HTML differs from Git solely in CRLF versus LF line endings; no caller changes are delivered.
