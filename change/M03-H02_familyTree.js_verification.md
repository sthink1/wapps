# WA M03-H02 — replacement-file verification

Date: November 24, 2026

Finding: M03-H02 / WA-PR-002 / IR-02. Scope: owner-approved consolidated six corrections (Step B), `reviseLogIn` only. No installation, commit, merge, deployment, database mutation or release approval implied.

## Authoritative baseline and exact final source

| Item | Value |
| --- | --- |
| REPLACE path | `routes/familyTree.js` |
| Drive authority | `My Drive/wonderfulApp/routes/familyTree.js`, file ID `1pC_NFg6-Aq7uQF_qDynrdodnANUYk8A` |
| Verified GitHub `reviseLogIn` HEAD | `3fadbe0b2d4b4807e1434f526e7d6834b689f992` |
| Original Git blob | `f51cc5db52041a767858f0d43be0ef714537b5ef` (exact Drive bytes match) |
| Original SHA-256 | `f0b758645927d02a3dce2bb22d669124b32e8c8b0ae55b6eae1961b11063f05d` |
| Delivered SHA-256 | `7930f3165aea158891fbbda2672f9e89fbe4a33e66258f452c09cdaac61aedea` |
| Delivered Git blob | `451a790cee8b73b431cd1ac9d44a6ed044d550c6` |
| Complete source comparison | 8,499 original lines; 8,515 final lines; 51 additions, 35 removals |
| Unified diff | `change/M03-H02_familyTree.js.diff` |

Read authoritative README Section 0, Core v1.0, Detailed v0.4.1 (approved Nov 12, including revised 3B-01), Decision Register D01–D14, File Development and Delivery Process v1.1, CLAUDE.md, TechSummary.md, AGENTS.md, the Nov 20 M03 review and Nov 23 independent Codex/Claude findings, and Nov 24 handoff. Historical DRAFT names do not negate approval. Older historical code/dump observations in CLAUDE/TechSummary do not override verified current source. Governing requirements include CS-01, CS-02, CS-03, CS-04, CS-05, WA-API-001, WA-SEC-ADMIN-001, WA-PRIV-002, WA-PRESERVE-001, and safe error handling/transaction and risk-based testing obligations. No changes to those documents are proposed.

## Every substantive difference

1. Introduced the local `ordinaryRelationshipKinds` allowlist (mother, father, child, sibling, partner) and early HTTP 400 validation in both approved handlers. No new relationship types. Case normalization remains supported. Non-string kinds are rejected rather than implicitly coerced.
2. Introduced local `parseOrdinaryRelationshipPersonID`: positive safe integer numbers or decimal strings (trimmed for validation). Reject boolean, arrays, object, fractional/negative/zero/missing values and nondecimal numeric strings. Existing numeric and decimal-string UI inputs continue to work. Both existing Persons must be distinct. Invalid input returns HTTP 400.
3. Added scoped `requireRelationshipPersonInTree` using a parameterized exact `(FamilyTreeID, PersonID)` membership lookup joined to `FTPersonT`. Both Person existence and membership must be established, including for verified administrators (structural integrity, not an ordinary user ownership restriction). `FOR UPDATE` requests locking of matching membership and Person rows in the existing transaction; two existing Person IDs are checked in ascending order. This is a deliberate concurrency safeguard within the approved pre-write validation scope; actual database lock behavior is not yet tested. Does not change generic helpers used by One Tree. A foreign/nonexistent/unassociated/dangling Person yields the same safe, marked HTTP 403 message; the prior global existence-based 404 is intentionally replaced to avoid exposing whether an unauthorized Person exists.
4. `/relationships`: replaced the global Person-existence lookup with two exact selected-Tree checks, and removed the `INSERT IGNORE INTO FTFamilyTreePersonT` that could grant unauthorized membership. The route cannot attach existing Persons or create Persons. Existing parent, child, sibling, partner SQL, activity logging, notification behavior, transaction wrapper, duplicate-partner 409, success 201 and response contract retained. No replacement by `addRelationshipInTree` because its partner `INSERT IGNORE` differs from the existing handler's duplicate-partner behavior.
5. `/related-person`: authorize the requested Tree and validate the focal Person before duplicate review and any mutation. Duplicate-review 409, matches, confirmed-different flow, creation of one new Person, milestone events, membership association of the newly created Person, relationship SQL, activity and success 201 retained. Ordinary relationship creation still does not require a new privacy-code step. Existing response middleware remains unchanged.
6. All relationship-specific mutation blocks and existing business logic retained unchanged. Retain central administrator, subscription, auth, error provenance, privacy filtering, and usage middleware. No user-visible HTML, CSS, client JS, schema, data migration, new endpoint or shared module change. No One Tree merge/undo, auth-abuse, or privacy-token-forwarding correction in this package.

Formatting-only changes: none. New source is indented and documented. The entire original and final source were compared. A byte comparison proved the prefix before the new helper and suffix after the two target routes identical. The unified diff was applied to a temporary original and reproduced the exact final bytes; reverse application reproduced the exact original. No unexplained differences.

## Source/dependency and caller examination

GitHub `main` HEAD `d92ef54428f3d6cea6e4b28eaa5237a53c3b913e` contains the same underlying pre-existing membership defect in both handlers; older administrator/authentication behavior differs. Production deployment identity was not confirmed; this package does not correct `main` or production.

Reviewed effective `server.js` mount (auth, `family_tree` entitlement, usage, privacy, route-level auth), `requireTree`, alias resolution, `userHasTree`, `treeHasPerson`, `getPersonTree`, `addRelationshipInTree`, duplicate review, `withTx`, relationship writers and activity functions. Current Drive copies of `administratorAccess.js`, `auth.js`, `subscriptionAccess.js`, `stage6ExpectedClientError.js` match pinned Git blobs. `ftPrivacy.js` and `usageActivity.js` match after CRLF-to-LF normalization. The verified central administrator can act on any selected Tree without becoming an ordinary user-member but cannot create inconsistent Tree/Person membership through these two ordinary relationship operations.

Scanned 32 FamilyTree*/FT* HTML/JS files from Drive (16 pages, 16 scripts). Direct new-related-Person POST callers found in `httpdocs/js/FTPerson.js` (saveRelatedPerson) and `httpdocs/js/FTPersonNew.js` (saveRelated); existing-Person selection uses `/use-existing-person` in both. Their Drive contents match pinned Git blobs after LF normalization. Person-specific GET `/persons/:id/relationships` is separate from the affected POST. No direct browser POST `/familytree/relationships` found in the scanned files. FamilyTree.html, FamilyTree2.html, FamilyTreePage.js, FTOneTreeMerge.js were included; no caller modification needed. This is a module-focused inventory, not proof of absence of unknown external/legacy API consumers.

Examined schema definitions and indexes in authoritative November 22 `wappsHelioTestDump.sql` and `wappsHelioProductionDump.sql`: identical InnoDB definitions for membership, parent, partner and sibling tables; unique membership pair `(FamilyTreeID,PersonID)` and relationship keys. Existing schema does not itself enforce exact membership for each relationship endpoint; application validation needed. The new lookup uses the existing membership pair index and Person key; no schema alteration required. Snapshot currency for live environments not yet owner-confirmed; no live queries made. Do not infer actual lock semantics or live data integrity from the dump alone.

## Executed verification

- `node --check` for final route and offline test harness: PASS (Node v22.16.0; project target v24.22.1 still to be exercised locally).
- `node change/M03-H02_offline_test.cjs --project /mnt/data/wa_baseline --flat --baseline /mnt/data/wa_baseline/familyTree.js`: 100/100 cases PASS, 0 failures. `--flat` was internal only (materialized dependency copies). Raw log: `change/M03-H02_offline_test.log`.
- 98 candidate test cases, including all five relationship kinds on both routes, exact selected-Tree membership denials, other accessible Tree, nonexistent/dangling membership, malformed values, unsupported types, missing/invalid/native credentials, missing entitlement, alias, second authorized Tree, verified admin and both invalid administrator gates, private same-Tree relationship, duplicate review and private redaction/admin visibility, confirmed-different, birth milestone, downstream rollback, safe unexpected errors, duplicate-partner 409 and unchanged same-Tree `/use-existing-person` selection.
- Two additional original-baseline cases independently reproduce unsupported-kind SQL write attempts followed by rollback. Ten positive candidate cases also compare original responses, relationship write parameters and SQL sequence (except deliberately removed membership INSERT); existing-Person selection compares all writes and response to baseline.
- Denial assertions count attempted INSERT/UPDATE/DELETE/REPLACE SQL, not only committed rows, plus usage and external notification sinks. Unauthorized focal rejects before duplicate-review SQL. Downstream failure and duplicate conflict tests intentionally permit attempted authorized SQL but require rollback and no committed writes.
- Full diff forward/reverse and byte-preservation checks: PASS. SHA-256 of final source checked again in packaged ZIP.

## Test boundaries and release status

The full authoritative route module and actual auth, subscription, usage, privacy, administrator and expected-error middleware sources were loaded and invoked over genuine loopback HTTP. The assistant environment lacked Express and npm registry DNS access failed; tests therefore used a small native HTTP adapter dispatching registered handlers, not the actual Express router or complete production server. Database/token verification/entitlement/usage/email/storage adapters were synthetic; no genuine data, credentials or provider calls. Actual database query execution, InnoDB lock/concurrency behavior, real token/session handling, browser/PWA, full server mount, and hosted environment acceptance are NOT certified. Node 24 + actual Express offline execution is the immediate local test using the included harness; database/browser state-changing acceptance needs the owner-approved isolated synthetic fixture/test procedure and separate authorization where appropriate. Existing Stage 6 accepted evidence is retained. No prior result is downgraded without specific regression risk.

M03-H02 candidate is prepared, not installed or accepted. M03-C01, M03-H03, M03-M04, FP03 and auth abuse controls and migration/release gates remain separate. No production or `main` fix, no cross-tree redesign, no commit/merge/deploy. No authoritative Drive/local/GitHub/Render/DB modification. Reconcile baseline changes before installation. Rollback restores the exact owner backup of `routes/familyTree.js`; it cannot undo any data already committed by a later real-world test or earlier vulnerability.
