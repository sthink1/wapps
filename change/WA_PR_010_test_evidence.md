# Independent Step B test evidence — November 26, 2026

Candidate source is exact delivered bytes; SHA-256 in checksum list. Authoritative Drive original server and worker match GitHub `9d69e1a` Git blob IDs exactly. Unchanged waPlatform.js also matches; unchanged manifest differs only in CRLF versus LF (normalized Git blob `e1009c0f3bf4d0601ecc4ec88469b6656dc65201`). No manifest replacement needed. Compared whole originals and final files; no source outside two approved replacements changed. Consulted README, approved Core v1.0, Detailed v0.4.1, decision register v1.0, delivery v1.1, project CLAUDE/TechSummary references, November 23 coverage/addendum, independent review findings and historical R16 test source. T01/T02 user evidence retained.

Environment: isolated Linux container Node v22.16.0, not project Node 24. No Express dependency available locally, no real browser, no database, no Render or production execution. The harness evaluates actual server/worker files in Node VM, simulates middleware, CacheStorage, Request, fetch, lifecycle; DB startup deliberately suspended, external actions forbidden. This proves observed offline assertions only. Actual Express header delivery, real Service Worker API behavior, browser/network cache and rollback, TNNA remain owner acceptance. Neither test harness performs network/db/project writes; test evidence generated in separate package workspace.

| Command/check | Actual result |
| --- | --- |
| `node --check server.js` | PASS |
| `node --check httpdocs/sw.js` | PASS |
| `node --check tests/wa-pr-010.offline.test.cjs` | PASS |
| `node --test tests/wa-pr-010.offline.test.cjs` | 27/27 PASS; 0 fail (TAP included) |
| Existing `stage6.r16.broader-api-cache.offline.test.js`, unmodified isolated copy evaluated against exact delivered server | 7/7 PASS; 0 fail (TAP included; temporary copy not shipped) |
| Exact original/final whole-file comparisons | PASS, two approved source replacements |

The existing R16 T11 harness embeds a historical exact-source hash, and R08 cache harness predates one required dependency; do not present them as executed against this revision or edit their accepted historical records. New harness samples protected prefixes and early generic errors; unchanged central handler and route cache blocks verified by diff. Existing R16 broader cache test rerun because server shared policy changed; no broad repetition.

Residual gates: D1 Node 24 replication, D2 actual local HTTP/worker/auth/compatibility, separately authorized D3 controlled upgrade and rollback (including production-to-candidate against disposable compatible data), D4 staging and TNNA. HSTS long-lived and old worker cleanup limitations disclosed. No commit/deploy/merge/DB changes authorized by this package.
