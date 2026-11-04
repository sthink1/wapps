# Wonderful Apps Stage 6 — Render client IP / reset limiter review

## Confirmed from authoritative Google Drive code
- `server.js`: no explicit Express `trust proxy` setting.
- `routes/users.js`: `/forgot-password` passes `req.ip` to `passwordResetLimiter.allow`.
- `services/passwordResetLimiter.js`: IP=20, email=5, global=100 attempts per UTC-hour bucket.
- Read-only source checks: 5/5 passed against reviewed source snapshots.

## Meaning
With default Express proxy trust disabled, `req.ip` is the immediate peer address. Hosted reverse proxies may cause separate clients to share this IP-based limiter. We have **not** established the actual forwarding chain or spoof resistance on Render. This is an open acceptance issue, not a validated active vulnerability. Never set `trust proxy=true` blindly or take untrusted `X-Forwarded-For` directly.

## Install and run (read-only)
Copy `group5e.proxy.source.offline.test.js` to `<project>/tests/`. Then run:

```powershell
node --test .\tests\group5e.proxy.source.offline.test.js
```

Expected 5/5. Assertions are current-source observations; if application code has changed, failures require review, not a bypass. No server startup, DB, HTTP requests, or email.

## Hosted evaluation plan (NOT YET RUN)
1. Read Render's current proxy-header documentation for the exact deployment path and supported trust boundary.
2. Choose an explicit, bounded trusted-hop configuration only after verifying it is correct for the service.
3. Add a **temporary staging-only**, authenticated, response-minimal probe if required. It should report only whether the selected `req.ip` matches trusted-source expectations and whether a spoofed `X-Forwarded-For` is rejected; never return full raw headers or IP addresses. Review and deploy separately.
4. Validate from two independent external networks and a deliberately spoofed forwarded header, record anonymized equivalence/not-equality results, then remove the probe.
5. Re-run read-only tests and bounded rate-limiter acceptance checks, subject to explicit test identity/cleanup controls.

Do not invoke `/users/forgot-password` merely to inspect proxy IPs: it increments rate counters and can send emails.

No application code was changed by this package. Do not merge into `main` or production before the independent design-engineer review.
