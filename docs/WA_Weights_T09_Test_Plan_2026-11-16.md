# R16-75 T09 — Weights load-error acceptance plan

**Status:** Proposed; NOT RUN. No production testing or live mutation approved by this document.

1. Record staging commit, live `Weights.html` SHA/response, loaded `waPlatform.js` and active service worker; confirm test account/environment isolation.
2. With an authorized test account, verify `GET /weights` 200, existing table/chart behavior and **no** load-error banner.
3. Simulate offline via Chrome DevTools (no form submission). Reload once. Confirm visible readable connection guidance, `role=alert`, no `[object Object]` or sensitive payload, and a failed GET. Restore No throttling and reload; confirm records return and error clears.
4. For nested/flat HTTP error envelopes, use only an approved safe deterministic stimulus. Do not provoke rate limits, deliberately corrupt data or trigger lockout. The proposed correction intentionally shows bounded status-specific text, not raw server error bodies.
5. If feasible in isolated authorization-controlled test setup, check 401/403/423 status semantics; do not use another user's real records.
6. Confirm date-range re-read and all existing Weight add/edit/search/delete handlers have not changed by source diff. Regression execution and broader R16 T09 acceptance remain outstanding.

**Outcome required:** Record browser/version, test ID, commit/hash, URL/method/status, redacted screenshot, observed message and remaining gaps. Keep prior 90/90 T12 and other bounded passes unchanged.
