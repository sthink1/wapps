# Wonderful Apps — Stage 6 Group 5E: Proxy trust decision and next acceptance gate
Date: 2026-11-01
Branch: `reviseLogIn`; test service: `wapps-stage6-test`; last cleanup commit: `c3959ca`.

## Completed
- Offline source audit 5/5 PASS: `req.ip` used for reset limiter; separate email/IP/global limits of 5/20/100 per UTC hour; no Express `trust proxy` override.
- Hosted baseline: `trustProxy=false`; `expressMatchesPeer=true`; 3 entries in XFF; first XFF HMAC tag matched CF-Connecting-IP HMAC tag.
- Hosted forged XFF: 4 entries, newly prepended fingerprint; peer and CF-Connecting-IP fingerprints unchanged.
- Temporary probe removed; endpoint HTTP 404; secret deleted from test service; Render Live on `c3959ca`.

## External-source findings
- Render guidance says inbound requests traverse Cloudflare and Render load balancers; app socket address is the proxy by default; advises forwarded headers for client addresses.
- Cloudflare states `CF-Connecting-IP` represents the address connecting to its edge, with exceptions for Worker/subrequest behavior and potential alternative paths.
- MDN warns only addresses contributed by authenticated trusted proxies should be used for security/rate limiting; naive trust of leftmost XFF is unsafe.

Sources:
- https://render.com/articles/how-render-handles-ddos-attacks
- https://developers.cloudflare.com/fundamentals/reference/http-headers/
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For

## Design recommendation (proposal, not code authorization)
- Do not set Express `trust proxy=true` globally.
- Keep existing `req.ip` fallback until forwarding-header provenance is demonstrated for every public entry path.
- After verification, isolate a `resolvePasswordResetClientIp(req)` helper to the `/users/forgot-password` route. Accept exactly one syntactically valid IPv4/IPv6 `CF-Connecting-IP` from an authenticated edge; normalize its representation; do not accept XFF values supplied by clients.
- Preserve current HMAC key hashing and three database rate limits; no schema changes.
- Never log or publish address values, secrets, cookies, or token hashes.
- In particular, a presence check for `CF-Connecting-IP` alone is insufficient: no arbitrary client may impersonate that header.

## Outstanding security gate: CF-Connecting-IP injection test
- A controlled temporary staging-only diagnostic could compare the edge-provided `CF-Connecting-IP` fingerprint before and after a request with a **client-injected fake `CF-Connecting-IP` value**. It must report only keyed pseudonymous comparison, never raw addresses or secrets, and must be removed immediately after testing.
- First check whether Render or Cloudflare can give an explicit guarantee about header replacement for the specific `onrender.com` and custom-domain ingress. If yes, this could avoid another staging deployment.
- If injection survives, DO NOT use `CF-Connecting-IP` for rate limiting without an authenticated source gate; retain socket peer fallback or use verified infrastructure-level protection.
- If injection does not survive in tested requests, this is supporting evidence, not a universal guarantee across every future network path. Document the assumed edge trust boundary and review alternatives.

## Further acceptance tests before merging
- Fake XFF, fake CF-Connecting-IP, missing/malformed headers, IPv4/IPv6 representations, alternate ingress paths and direct-origin possibility.
- Confirm different clients are bucketed separately and same client consistently, without sending live reset emails or using shared accounts.
- Existing rate-limit and fail-closed tests must continue passing.
- Mandatory independent design-engineer review before merge to `main`/production.

## Current operational state
NO code change, deployment, database mutation or environment variable modification is needed now. Existing staging service retains the secure default `trust proxy=false` while the design is validated.
