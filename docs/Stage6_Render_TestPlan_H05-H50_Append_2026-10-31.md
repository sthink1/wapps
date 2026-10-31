## October 31, 2026 addendum - deployed staging and hosted regression evidence

**Supersedes historical preflight statements only:** a separate Render staging service now exists: `wapps-stage6-test`, branch `reviseLogIn`, candidate `09ece26`, `WA_ENV=staging`, verified staging test DB `wapps_test`. It was user-reported Live and completed H05-H50. Older sections describing an uncreated/unauthorized staging service or the `sql5838929`-only target are historical, not current operating facts. No production deployment has been authorized.

**Evidence detail:** See companion `Stage6_H05-H50_Hosted_Evidence_2026-10-31.md` for the complete H05-H50 ledger, accounts, browser modes, observations and limitations. These H labels do not replace formal R01-R20 IDs. No full release acceptance or closure is implied.

**Dispositions requiring attention:** H20 reproduced S6-039, an existing deferred dialog error; H26 later became signed out without KMLI (behavior consistent with 8-hour design, but exact JWT expiry not checked); H50 rejected an expired password-reset link (actual server-side enforcement not traced). H30/H33/H36/H41 yielded nonblocking UI/error-handling observations. H42/H43 confirmed `users` API 403 and limited response; H44 authorized Tracking operation. Other routes and security pathways remain unverified.

**Pending formal test mapping:** Map these hosted observations to formal R01-R20 only where acceptance evidence actually matches. Preserve unresolved HTTPS cookie, origin/CSRF, proxies/rate limits, browser/device, TNNA, password reset/change/revocation, cache headers, logs, and independent-review gates.
