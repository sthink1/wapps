# FP03 / WA-PR-007 — FTPrivacy.js verification

Date: November 24, 2026. Owner approved the narrow Step A correction. Baseline: reviseLogIn, a85aa107778b4a871e04fa193e432f0c756d9177. Authoritative Google Drive file ID: 1ooB8vbj2o2IySN4IpWfXWTXWqupX-P7E. Git blob a8a21773266c3a09174b56efa481db3a9add9d87 matches the Drive source after CRLF-to-LF normalization. Exact Drive SHA-256: `5355f41f25534c8dd8e6d42f37b9a67c932bcc2300ba65148451b179d1eafced`. Final SHA-256: `6dd2db2a4a5fd8fa7cf5adee433901c0b129aaae8ea5fe5511802f31141f8824`.

## Governing references
Root README; Core Standards v1.0; Detailed Technical Standards v0.4.1; Decision Register v1.0; WA_File_Development_and_Delivery_Process v1.1; CLAUDE.md and TechSummary.md; November 23 independent review and November 24 handoff. Applicable CS-01,02,03,05,07,09,10,11,12; WA-PRESERVE-001, FORMAT-001, CORE-001, API-001, AUTH-001, PRIV-002, FRONT-001, LOG-001, CACHE-001, REVIEW-001; D01, D06, D13, D14. No blanket standards compliance claim.

## Complete change accounting
- First hunk: replace substring matching with URL resolution, exact origin/protocol and path checks, rejecting embedded credentials. Preserve explicitly supported split-port localhost origin. Preserve Request input, effective headers, method and body. Install one wrapper per page and use the current token rather than the initial closure value. Preserve explicit handoff token precedence. Strip capability headers from nonapproved requests handled by the wrapper. Disallow redirects on approved capability-bearing requests. Formatting limited to changed code.
- Second hunk: preserve explicit API headers (formerly discarded) so existing one-time handoff verification can work. Block redirects on that API request even before the wrapper is installed. Preserve response parsing/error semantics.
- Remaining bytes unchanged, including popup, key validation, navigation, privacy controls and exported methods. CRLF preserved. See full unified diff.

## Dependencies and impact
FTPerson.js and FamilyTreePage.js use the privacy helper; FTPerson.html loads FTPrivacy.js before waPlatform.js. waPlatform.js captures native fetch and does not globally override it. Server mounts Family Tree APIs at /familytree and privacy at /familytree/privacy. No backend, database, administrator policy, HTML, CSS, service worker or One Tree changes. The fix protects the wrapper boundary, not arbitrary malicious scripts or all other credential transport. Redirect-dependent requests with a token now fail rather than follow redirects. Existing HTTP cache may retain old JS; use cache-disabled reload and inspect the actual served script in local browser acceptance. Broader cache/versioning issue remains open.

## Evidence and remaining acceptance
Node v22.16.0 syntax check and 40/40 offline tests run against complete replacement. VM synthetic browser fixtures cover origin/path normalization, Request headers, handoff, renewed token, public/admin paths and local development; actual Fetch redirect test uses two loopback servers, no external network or real credentials. See log. Forward and reverse diff verified. Local Node 24 and real browser private Person workflow remain outstanding. No production or database operation performed. Previously accepted M03 results remain bounded and unchanged.

## Rollback
Owner restores exact pre-install _COPY backup (outside public web root), verifies original checksum, reloads with cache disabled, and removes only new FP03 support files if abandoning candidate. Rollback restores original FP03 vulnerability; do not release that version as corrected. No GitHub, Drive or hosted writes by assistant.
