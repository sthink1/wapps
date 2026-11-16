# Batch 5 - common causes, component reuse and proposed findings mappings

Read-only evidence/proposals; no authoritative register edits.62 original A/C candidates,24 confirmed candidate occurrences,0 additions. Eight primary confirmed families, with distinct subcauses retained.

| Family | Confirmed original candidates | Implementation/common cause and distinctions |
| --- | --- | --- |
| HTTP |N02 M02 D02 L02 P02 U02|Six local adapters discard status/code/network categories; domain409 branches retained separately. U02 uncaught async review and P02 uncaught handlers are explicit subfindings, not extra candidates. Public verification V02/E02 partial, not automatically counted as identical failures.|
| ACCESS-FLOW |N03 D03 P03 P08|N03 private focal lacks capability; D03/P03 duplicate view omits required tree context (caller+destination occurrences); P08 multipart code unavailable before route multer. All fail closed; preserve denial.|
| DERIVED-PRIVATE |M03|New material conditional conflict newerValue provenance/redaction leak. Public older candidate contains private newer facts without PersonID tagging. Separate target-tree mutation authority unverified.|
| HANDOFF |L03|Same unchanged FP04 shared opt.headers overwrite; List actually calls openPerson. Correct once with authorized consumer testing; do not count earlier FTPerson/Ancestor again.|
| SANITIZER |L05|Filter-only free text lacks mandatory reusable sanitizer. Safe output exists; no demonstrated XSS. Preserve matching behavior.|
| PENDING |M05 P06|Distinct local implementations: merge disables before awaited fetch/JSON and misses thrown-error reset; New main submit/Event handlers uncaught, including success-then-read failures. No replay; preserve drafts and reconcile committed states.|
| CONTACT-DELIVERY |P07|Same server contact producer as Batch4 CT06. Verification-mail send outside committed transaction returns ordinary failure. Create/update/resend prior subfindings preserved; current New uses create.|
| ACCESSIBILITY |N06 M07 D06 L08 P10 U07 V06 E06|Separate status implementations; M dynamic select labels, L filter label/shared popup, P form labels/dialog focus. Preserve all subfindings; do not pretend one shared fix covers all.|

## Privacy producer-consumer trace and proposed owner disposition

M03 exact path: backend ONE_TREE_PERSON_FIELDS1862-1876 includes BirthPlace/CurrentCity/etc; duplicateScore1918-1927 FirstName20+LastName25 meets>=45 filter2147. personConflictList2178-2193 records differing nonempty newerValue. buildOneTreeReview2237-2249 returns private newerPerson separately and public older candidates with conflicts. GET7140-7171 requires source membership, resolves target; /one-tree/ route not path-specific person423. Generic redactor private-person identification124 and sanitize129 redact newerPerson but not untagged conflict child of public candidate. Frontend29 renders text safely but still reveals protected data. Escaping is not privacy authorization.

Proposed verification NOT RUN: synthetic member of source tree, public older match/private newer match, same names/different protected place. No page token. Expected no protected conflict value in raw JSON or UI; admin positive two-gate case; converse private older; wrong tree/user; stale capability. Define authorized target-tree/merge consent separately; no exploit probes/live private data. Owner must disposition material issue before release, and approve any scoped correction package separately.

## Commit/external effects: do not flatten unlike outcomes

Contact verification issuance: familyTree5356-5374 commits then explicit sendContactVerification; mail throws -> ordinary error, current client33 says failed. Same producer reused, not separately counted as new root for every page. General logActivity341-350 queues notices; withTx98-118 catches queued task failures.

OneTree merge: transaction7180-7288 then cleanup7290-7295 uses safelyDelete812-820 catch; ordinary cleanup rejection does not enter failure path as Contact mail does. Undo7432-7448 commits,7450-7462 catches postcommit reference/cleanup errors. Privacy approval ftPrivacy102 commits then notifyCreator50 catches notices. These need operational delivery/cleanup recovery verification, but no unsupported ordinary500 claim. Email confirmation5285-5300 DB-only, no explicit send. Profile upload5711 puts object before SQL/commit; replacement rollback/compensation unverified under bounded inspection.

No automatic mutation replay observed. Explicit409 upload replacement after user confirmation is a new authorized request, not uncertain network replay. Pending reset must distinguish definite failure from ambiguous transmission; do not blindly re-enable/retry a possibly committed merge.

## Reused shared evidence registry

Exact same SHA-256 as completed evidence. Reuse only named properties; actual per-page imports/calls/order independently examined. Prior FTPerson HTML/JS never reopened. Companion backend fragments re-read only for new scope/call composition, not full repeated audits.

| Path | Bounded properties / standards | Findings and limits | SHA-256 |
| --- | --- | --- | --- |
| httpdocs/js/waPlatform.js | WA.session/WA.api/readError; CS03/05/08 SESSION/API | Same-origin/current credential, Web Locks fail closed, no automatic mutation replay, supported flat/nested parsing; six authenticated page business adapters do not delegate. Public capability pages correctly do not import. Browser T09/T10 and full lifecycle open. | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |
| httpdocs/js/usageTracking.js | restore/start/normal POST/exit keepalive; SHARED/SESSION | Actual telemetry shared use on six authenticated pages; public email pages have none. Expiry/logout/BFCache/exact duplicate/loss accounting unverified. | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| httpdocs/js/inputSanitizer.js | DOMPurify capture handlers; FRONT/SHARED | New text/modal inputs covered; Network checkboxes need no free-text sanitation; List filter missing import. CDN loss/IME/value semantics and output/server defense separate. | eec2fa21e13fb1a3d831d12ffa38a35a72a3fa391ed612cb46553a5743e481c0 |
| httpdocs/js/FTPrivacy.js | api/status/unlock/openPerson/ensurePageAccess/popup; PRIV/SHARED | Existing FP04 header overwrite affects List handoff. Existing substring-only URL scope known but install not called on selected List. Shared popup accessibility active through List. No new active wrapper exfiltration claimed. | 5355f41f25534c8dd8e6d42f37b9a67c932bcc2300ba65148451b179d1eafced |
| routes/ftPrivacy.js | protection/redactPerson/request/approval; PRIV/ADMIN/DATA | Central admin, path-specific423, nested PersonID redaction, capability hash/expiry/verified contact gates. New derived conflict value not PersonID-bound so escapes generic redactor; no universal privacy certification. | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| services/administratorAccess.js | getAdministratorStatus/isVerifiedAdministrator; ADMIN | Current DB flag1 AND configured normalized name; missing/failed gates not admin. Undo inspected callers use it. Full FamilyTree CRUD/privacy/ownership-transfer/integrity runtime matrix remains. | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |
| httpdocs/sw.js | prior network/cache bypass/allowlist; CACHE | Hash unchanged; prior bounded evidence reused only. Full install/update/mixed asset/rollback/browser caching not certified; no reread or application execution. | 2fc7d3ad3cdd8f528695fec9b77be8cd5eb4634f695ec19536ec0acd0b05bd5e |

RC-IDENTITY candidates N05 M06 D05 L07 P09 U06 lack local response fences/account-keyed context. Source observation is not proof of cross-account disclosure. Public links V04/E04 use capability identity independent of browser account; test purpose/expected recipient/context without forcing account login. RC-CAPABILITY-HYGIENE token URL/log/referrer/cache controls remain unverified, no token values collected.

Current username-only prose in CLAUDE/TechSummary/older standard observations is documentation drift; current admin code verified at same hash. D06 plaintext/recoverable four-character code accepted; do not apply to random64hex email/page capabilities. No new source replacement/global fetch rewrite/token architecture chosen.

## Master Register / remaining Stage 6

62-row CSV maps every original candidate, exact source evidence, status, primary family, distinct subfindings, existing IDs and proposed next action. B05/RC labels are proposed review-local keys only. Existing Stage6_OpenItems Master register read-only; no separate broader schema found in bounded docs/standard search, not absence proof. WA-CF-003/004/005/011/014/016 remain their original status. S6-041 original full-row provenance unresolved.

Prioritize R16 material privacy M03, incomplete flows N03/D03/P03/P08, failure categories/no-replay/drafts/outcomes, capability hygiene; R16 T09 shared-client display/T10 real unsaved forms still open. R17 supported-browser/keyboard/field/modal/navigation/email links. R18 no native/device changes or tests. R19 controlled capability-use/transaction/async identity/repeated explicit action cases, not completed replay failure. R20 recovery/versioning/isolation/independent implementation review and owner release gates remain. Accepted R10/R14/R15/T12 90/90/T06 3/3/selected T11 preserved, not rerun.

## Exact governing/reused/source identities

These hashes identify bounded examined/reused evidence, not full audits of entire backend or evidence documents.

| Path | SHA-256 |
| --- | --- |
| AGENTS.md | f1dc56f8d5ef961c7195bdb36de5c016ef804771dda00dfb6474667a652bd3dd |
| CLAUDE.md | 1c585afd6cc6ac63941188a451e965b1300adaea97615393d8333e27f332c18e |
| README.md | aeef796d5710fb0a892d48c1c07326937d15fe62495d5c2d642584c23e0c517d |
| TechSummary.md | 62283cfaa0959ab05a9de1f13e4a6108354b42457c573bcf5b4a14f58c9e57c6 |
| docs/Stage6_OpenItems.md | efa544fe603ca97c4daa9909bb9a9214772df9ae86c2f29eacd1e895a8137447 |
| docs/Stage6_Render_TestPlan.md | 67545a4732d3714d8948f081dc495dd61e6ea7137c1bb1ccf5c4eede3b771923 |
| docs/WA_Stage6_R16-R20_Continuation_Handoff_2026-11-15.md | fa1f943aabddad0fd4862ae6653c1ecffaf65f0a4dbd1ff7e143900e6a44b4a4 |
| docs/WA_Standards_Compliance_Register.md | 94dce444aed2f2679ae2579189680a863fa34fe01f19ed993a30fafc327db344 |
| download/WA_FTPerson_Shared_Function_Review_2026-11-15/WA_FTPerson_Review_Timing_and_Verification.md | e66738384483f347b4f5acf2b07f89ae4c99f1f5ad31ed3abd540c2f1d16e217 |
| download/WA_FTPerson_Shared_Function_Review_2026-11-15/WA_FTPerson_Shared_Function_Review.md | feb267e28e5bc031e2ea627acca769d140d87954b75848a2bb14884a051c914c |
| download/WA_Shared_Function_Review_Remaining_2026-11-16/Batch04/WA_Batch04_Common_Cause_and_Master_Register_Mapping.md | c0e9f377462f2e1056825ddd7d9a7807d7207a8b03ec1211d6568fcef355bcb3 |
| httpdocs/FTEmailVerification.html | c702f7c6b733269fd2ead234bc25ae46c24edf1a4d6c18bd521f8cea29547378 |
| httpdocs/FTNetwork.html | 0ef50876cb680cafbd9725c1a296c21f8c198a516f68eb2e7140ddf9c4f356ad |
| httpdocs/FTOneTreeMerge.html | 1d78a09658bbb4a2119e2deae2a3a0c167b9fe4310a617b0f101cdf3b6d4c8b4 |
| httpdocs/FTPersonDuplicate.html | 0496dea16d2b1423f300083d84a86ad607afff6d0dce9df43833434e9b7132ec |
| httpdocs/FTPersonList.html | 23e52db32f3cf6a6e380db34d1605bf889487a6dfcc5dea1ece8fd5ad9c3fde9 |
| httpdocs/FTPersonNew.html | e73ca8906c5cbd181b6be16a85e064a8272f9494e81f49d8ff2a750e4b2b38e6 |
| httpdocs/FTPrivacyVerification.html | f3b34b9f89ac138ae4af06c814df2fa6c43f8621d9d790f9b162e9ec860d9dee |
| httpdocs/FTUndoOneTreeMerge.html | 87da01982de94c5698584c2d0055b6fedfb46d6ef6f560658a1d002fed47d533 |
| httpdocs/js/FTNetwork.js | 47e7498829cc8af49c919fca467b4744127a3f7c0c4b48e9a6a86acf636b25eb |
| httpdocs/js/FTOneTreeMerge.js | a831e5006291db4b41ed51332bed630f6180ef25db016cbf5bd5231b23262ac3 |
| httpdocs/js/FTPersonDuplicate.js | 30fcf381fcf8dedb1bba45250d416465d200c04621b1c3863f262557146755f8 |
| httpdocs/js/FTPersonList.js | fa7e6ee386fafbddacae0f8bbe6c57e055598110b52457609585410f89243d4c |
| httpdocs/js/FTPersonNew.js | ec8101fbeef3b0dc99dd98fad24f63138b9733c19472e7b575f81035dd9e5304 |
| httpdocs/js/FTPrivacy.js | 5355f41f25534c8dd8e6d42f37b9a67c932bcc2300ba65148451b179d1eafced |
| httpdocs/js/FTUndoOneTreeMerge.js | e26e5f8f4ba7c1d1d5a91e58c35ea4ac46aa1d40728d854e6068f26a77eb26e5 |
| httpdocs/js/inputSanitizer.js | eec2fa21e13fb1a3d831d12ffa38a35a72a3fa391ed612cb46553a5743e481c0 |
| httpdocs/js/usageTracking.js | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| httpdocs/js/waPlatform.js | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |
| httpdocs/sw.js | 2fc7d3ad3cdd8f528695fec9b77be8cd5eb4634f695ec19536ec0acd0b05bd5e |
| routes/familyTree.js | 0af2b52700afdcc49e9d3068bd000e4f7c350895237c55a3a81c07d6617d6bb0 |
| routes/ftPrivacy.js | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| server.js | 00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81 |
| services/administratorAccess.js | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |
| standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md | 02ccc4b35e9cc0de4218e23082cf17f0fba444e6f1b9b088a778266fae125361 |
| standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md | f6bb22bac44707bc2ec74e7111d0b3c1e73256958011974cf19929f6d0a50fd0 |
| standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md | 48d944deca7c4d03b465cf66c9082117e187aa8db0221107fffb8812e00e8fb2 |