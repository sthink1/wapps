# Wonderful Apps — Future Production Database Transition: Approved Planning Approach

**Decision date:** November 19, 2026  
**Status:** Owner-approved planning approach only; execution and detailed SQL are **not authorized**  
**Project-relative destination:** `docs/WA_Production_Database_Transition_Plan.md`  
**Related development branch:** `reviseLogIn`  
**Future application branch target:** `main`

## 1. Decision and objective

The owner approved the following **planning approach** for the eventual transition to a new Wonderful Apps production database:

1. Continue development and testing against the isolated **test database**, originally copied from the production database. The test database's schema will be adjusted and tested as development proceeds.
2. When development and relevant acceptance testing are complete, treat the **final approved and tested test-database schema** as the intended schema for the replacement production database.
3. Create an **entirely new database**, provisionally called **FINAL PRODUCTION** (a descriptive planning name, not a confirmed physical database identifier), using that final test schema.
4. Use the **existing production database as the source of genuine production data**. Before importing, analyze production data against the new schema, identify required transformations, and adapt the data as needed so that it can be imported correctly and securely.
5. Populate the new database with properly migrated production data and necessary approved reference/configuration data, **not automatically with test-only records**.
6. Validate the new database and its compatibility with the intended application release before any independently authorized production cutover.

**Key distinction:** This is **not** a request to overwrite the existing production database with test data, nor a request to modify the test database in place. Preserve both original databases during planning, rehearsal, and verification.

## 2. Why this approach was selected

The test database began as a copy of production, but its structure and some contents have changed during `reviseLogIn` work and will continue to change. Its **schema** is the tested target design. The existing production database remains the source for real production user data. Keeping these roles separate may reduce the risks of importing artificial test records into production or overwriting legitimate production activity.

The approach remains subject to confirmation from final source/target database comparisons and a successful migration rehearsal. It is a **planning decision**, not a conclusion that every current production row is already compatible with the new schema.

## 3. Future preparation sequence (not execution authorization)

### Phase 1 — Establish authoritative baselines

- Finish the relevant `reviseLogIn` development, Stage 6 testing, and applicable independent review/release gates. Preserve accepted test results within their documented scope.
- Inspect the latest authoritative `*dump.sql` for **each distinct database** before requesting queries; ask the owner whether the dumps are current. Request new queries only where the dumps are incomplete, outdated, or live information is materially necessary.
- Capture contemporaneous, restorable backups/snapshots of the then-current **test and production** databases. Record their actual identities, hosting, database-engine versions, collation and applicable application revisions without exposing secrets.
- Inventory and compare all tables, columns, indexes, primary/foreign keys, defaults, constraints, triggers, views, routines where present, row counts, and relevant content.

### Phase 2 — Design and review data mapping

- For each production table, classify the intended treatment: import unchanged; transform before import; split/merge; retain as approved reference/configuration data; omit only with explicit owner approval.
- Preserve production user IDs and dependent relationships wherever required, including authentication, sessions, subscriptions, promotional records, Family Tree, weight/activity, financial records, and file/object-storage references.
- Reconcile any changes to subscription/entitlement behavior and structure, including the tested `UserSubscriptionT` design and the test database's removal of the obsolete `AdminSubscriptionGrantT`. Do not assume old production rows can simply be inserted into a changed schema.
- Identify production-only changes, data quality issues, auto-increment requirements, timezone/date semantics, foreign-key import order, environment-specific settings, and references to external Cloudflare R2 or other stored objects.
- Produce a reviewable **table-by-table migration matrix** with row counts, mappings, transformations, exceptions, checks, and disposition of excluded data.

### Phase 3 — Build and rehearse independently

- Provision the separate replacement candidate using the verified final test schema, without changing or deleting existing test or production databases.
- Prepare understandable, separately reviewable SQL/data transformation steps; the owner's preference is **manual execution in phpMyAdmin**, not an automatic destructive `--apply` tool.
- Rehearse data loading and application tests against an isolated disposable/candidate environment using the proposed new schema and copied production data. Recognize that DDL in MySQL/MariaDB may implicitly commit, so do not promise that a multistatement migration is wholly transactional.
- Reconcile row counts, key/foreign-key integrity, business invariants, subscriptions, administrator recognition, authentication, permissions, critical app functions, and file references. Record failures, corrections, and retest evidence.

### Phase 4 — Coordinate final cutover (requires separate authorization)

- The `reviseLogIn` → `main` merge, deployment of application code, creation/population of a new production database, and production database switch are **separate authorization gates**. The precise release order must be planned for compatibility; a Git merge alone does not change the running database.
- Establish the final production write cutoff or other reliable delta-capture strategy. Reconcile changes after the rehearsal export to avoid dropping live production transactions.
- Take and verify final recoverable backups, define cutover/rollback triggers, and verify candidate compatibility with the intended deployed code.
- Only with the owner's explicit authorization, execute the controlled connection cutover; perform production smoke tests, validate row counts and essential user flows, monitor for errors, and retain the original production database for rollback during an agreed recovery period.

## 4. Safeguards and acceptance gates

- **No deletion or overwrite** of existing test or production databases merely to create the replacement.
- **No automatic bulk transfer** of test-only content into the new production database.
- **No assumption that all production data will fit unchanged.** Transformations and any deliberate exclusions must be reviewed and explicitly approved.
- Validate that genuine production records, relationships, permissions, authentication, subscriptions, and application behavior are preserved or changed only as approved.
- A database dump is evidence of its export-time state, not proof of a live current state; confirm its currency when consequential.
- A successful SQL import is not equivalent to complete migration acceptance. Backups must be demonstrably restorable, and an actionable rollback must be ready before cutover.
- Preserve all previous development, standards, subscription acceptance, and Stage 6 evidence. Do not repeat accepted tests without a relevant regression risk.
- ChatGPT's project, Drive, GitHub, branch, databases, Render, and production access remains read-only. The owner executes approved installation, SQL, branch, merge, and deployment operations.

## 5. Decisions intentionally deferred

The following are **not yet decided** and will be addressed when final `reviseLogIn` work and database comparisons are available:

- Actual name, host, and permissions for the new candidate/FINAL PRODUCTION database.
- Final schema snapshot/version and the exact production source snapshot.
- Per-table transformations, reference/configuration data to seed, exclusions, and import order.
- Final production-write freeze/delta synchronization method and cutover window.
- Whether database candidate validation precedes or follows the Git merge, and exact app-deployment/database-switch sequencing.
- Exact SQL, backup restoration procedure, validation checklist, rollback procedure, and acceptance sign-offs.

## 6. Reference and governance

At execution planning time, first consult:

1. Root `README.md` and current approved WA standards and decisions.
2. `standard/WA_File_Development_and_Delivery_Process.md` — approved A→B→C→D delivery and database-dump-first process.
3. The current authoritative test and production `*dump.sql` files and relevant migration/test evidence.
4. Current application source, schema dependencies, and the approved Stage 6/release records.

**Scope of approval on November 19, 2026:** Adopt this new-database construction and production-data migration concept as the preferred **future planning approach**. No database, application, branch, Google Drive, GitHub, Render, or production changes are authorized by this document.
