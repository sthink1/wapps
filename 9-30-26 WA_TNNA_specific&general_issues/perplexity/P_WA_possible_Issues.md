# WA and TNNA Design Issues Requiring Attention

**Projects:** WonderfulApps (WA) and Town Notification Native App (TNNA)  
**Review date:** September 30, 2026  
**Purpose:** Design-engineering issue register separate from the immediate Node/NVM decision

## 1. Executive Assessment

WA has a substantial shared platform: authentication, subscription entitlements, centralized notification/consent controls, UTC handling, safe-output rules, and multi-domain data systems. TNNA can reuse that platform, but it must not duplicate it inconsistently in a native client.

The major design concern is **boundary definition**. TNNA is described as a native Town Notification app derived from WA’s Town Notice app, yet the current supplied WA documentation identifies the `town_notice` entitlement but does not document a dedicated Town Notice route module, mobile API contract, device-registration model, push-delivery service, or native authentication model. Those missing artifacts should be designed before production feature development.

## 2. Priority Issue Register

| Priority | Issue | Why it matters | Required design action |
|---|---|---|---|
| P0 | TNNA API contract is undefined | A native client needs a stable, versioned backend interface; UI-first development risks coupling to ad hoc WA pages or internal fields | Write a Town Notice API specification: endpoints, auth, payloads, pagination, filtering, status/error codes, idempotency, and ownership/role rules |
| P0 | Native push architecture is absent | Existing email notifications and preferences are not a device push-delivery system | Design device-token registration, provider integration, token refresh/revocation, device/user mapping, delivery records, retry/error policy, and admin auditing |
| P0 | Native credential storage is unspecified | WA’s browser token/localStorage pattern is not a complete mobile credential plan | Decide secure storage, token lifetime/refresh, reauthentication, logout, lost-device handling, and no-token logging rules |
| P0 | Consent policy across push/email/app is unspecified | OS permission, centralized WA preferences, suppression, and unsubscribes can conflict | Define a consent precedence matrix and enforce it server-side for every channel |
| P0 | Town Notice server ownership is unclear | `town_notice` exists in the app catalog, but current route inventory does not show its service boundary | Identify/create the route/service/data model and make authorization/subscription rules explicit |
| P1 | Node 18 remains a temporary WA baseline | Node 18 is end of life; long-term use creates security/maintenance debt | Test and migrate WA to Node 24 LTS; pin and document exact versions locally and in deployment |
| P1 | Render runtime parity is not documented | Local runtime changes do not change production runtime automatically | Pin supported Node version in deployment configuration; test preview deployment before production |
| P1 | TNNA repository rules are incomplete | Android-generated files and native artifacts can pollute commits or be omitted incorrectly | Define `.gitignore`, tracked Android configuration, build-output rules, branch/release model, and restore/rebuild instructions |
| P1 | Mobile environment configuration is needed | Native bundles cannot safely carry mutable or secret production configuration | Define public build-time environment configuration, per-environment API origins, TLS-only policy, and no secret-in-client rule |
| P1 | Offline model is not chosen | Time-sensitive notices can be stale, duplicated, or misordered | Explicitly choose online-only, cached read-only, or queued write behavior; define cache expiry and sync conflict rules |
| P1 | Native deep links are not designed | Verification/unsubscribe/content links can expose routing and token-handling risks | Define allowed schemes/hosts/path allowlist, token handling, expired-link behavior, and WebView/native routing rules |
| P1 | Android release controls missing | Signing and release mistakes can permanently complicate app ownership and updates | Define package-ID ownership, keystore custody/backup, signing workflow, flavors, target/min SDK, beta channel, and store release checklist |
| P2 | Database platform age | WA targets MySQL 5.5 compatibility, which constrains modern schema/query options and is long obsolete | Establish a separate database-upgrade feasibility plan, testing strategy, and compatibility target; do not combine blindly with TNNA launch |
| P2 | SQL schema source is outside Git | `*Dump.sql` is ignored, so schema changes may not reach collaborators/deployments through normal code review | Introduce versioned forward migrations and a tracked schema/version record while retaining protected dumps as recovery artifacts |
| P2 | JWT strategy may need mobile evolution | An 8-hour access token with browser-oriented storage may force poor mobile UX or weak persistence choices | Define access/refresh-token policy, revocation, device sessions, and session-audit requirements before mobile launch |
| P2 | CORS and origin policy will need review | A Capacitor client may use app-specific origins and native HTTP behavior | Enumerate intended origins/transport behavior; preserve least privilege and test on device rather than broadly opening CORS |
| P2 | Town location/time policy is unspecified | Municipal notices can involve time-sensitive meetings, deadlines, and geographic applicability | Store instants in UTC, specify display/business timezone, and define geospatial jurisdiction/address rules |
| P2 | Observability is fragmented | Diagnosing delivery or access issues requires cross-system tracing | Add correlation IDs, structured event taxonomy, delivery state model, safe error reporting, and retention policy |

## 3. TNNA Product Boundary

### 3.1 Recommended logical architecture

```text
TNNA Android/iOS client
    |
    | HTTPS JSON API
    | authenticated requests
    | secure device-local token storage
    v
WA API boundary
    |
    +-- JWT authentication and authorization
    +-- requireAppAccess('town_notice')
    +-- Town Notice domain routes/service
    +-- notification preference / suppression evaluation
    +-- device registration and push orchestration
    +-- audit logging and usage tracking
    v
MySQL + notification/push providers
```

TNNA should be a client of WA’s server-side rules, not an alternate rules engine. The native app must not independently decide a user’s subscription access, authorization scope, consent eligibility, or data ownership. The server already has the correct architectural position for those decisions.

### 3.2 Define whether TNNA is a new app

There are two legitimate models, but one must be selected explicitly:

| Model | Meaning | Subscription impact |
|---|---|---|
| TNNA is another client for `town_notice` | Web and native clients expose the same Town Notice product and records | Keep `town_notice` as the authoritative app key; apply the same server-side entitlement to both clients |
| TNNA is a separate commercial product | Native app has materially different features, delivery rights, or pricing | Create a distinct app key, plan/access rule, usage metric, and UI/business explanation |

For the stated goal—making a native app of the existing Town Notification/Town Notice app—the first model is preferable unless the product scope changes. Avoid creating a separate entitlement merely because the client is native.

## 4. Push and Consent Design

### 4.1 Add a device-notification domain

A native notification system normally needs a new, controlled data model. The exact schema should be designed against the current `wappsDump.sql`, but it likely needs concepts equivalent to:

- A registered device/application installation linked to a WA user.
- Platform, app version, operating-system version, push provider, opaque provider token, token status, and token-updated time.
- A device-level permission/registration state distinct from a WA account-level preference.
- Notice delivery attempts with a category, channel, provider message ID, result, failure classification, and timestamps.
- Explicit invalid-token/revocation handling.
- Auditable administrative sending/targeting records.

Provider device tokens are sensitive identifiers. Encrypt or otherwise protect them at rest as appropriate for the chosen provider/operational design, restrict administrative access, and never place them in routine logs.

### 4.2 Consent precedence matrix

Write and implement a matrix such as the following before sending real native notices:

| Condition | May send native push? | Reason |
|---|---:|---|
| User has no registered device token | No | No target device exists |
| OS permission denied | No | Platform blocks delivery/permission is absent |
| Device token invalidated | No | Provider has rejected target; mark/revoke token |
| WA account is suppressed for applicable category/channel | No | Central suppression must win |
| WA user disabled app notices | No for optional app notices | Account preference must be honored |
| Required account/security notice | Policy-specific | Must be categorized and justified; do not silently treat promotional notices as required |
| User has multiple active devices | Yes, subject to policy | Define whether all active devices receive the notice |

For TNNA, determine whether Town notices belong under existing `APP_NOTICE` or need a new, narrower category such as `TOWN_NOTICE`. A new category is preferable if users need separate control, consent language, and auditability for civic/town notifications. Do not repurpose `MARKETING` or bypass central suppression.

### 4.3 Avoid token-in-URL assumptions

WA already uses public random-token flows for unsubscribe and Family Network verification. TNNA deep links may need to open those flows, but the native app should not log, persist, or expose raw verification/unsubscribe tokens unnecessarily. Use HTTPS links to an allowlisted WA origin, validate all callback parameters server-side, and present an expiry/retry path.

## 5. Security and Data Design

### 5.1 Mobile authentication

The current WA flow issues an 8-hour JWT after email verification and browser clients may store tokens in `localStorage`. TNNA needs an explicit mobile adaptation:

- Store credentials only in an OS-backed secure-storage mechanism, not in ordinary app preferences or a WebView’s casual storage.
- Define whether the app uses short-lived access tokens plus refresh tokens or requires periodic full sign-in.
- Bind refresh/session records to a device installation where useful.
- Support logout from one device, logout from all devices, token revocation after compromise, and forced reauthentication after sensitive changes.
- Do not log JWTs, refresh tokens, authorization headers, device tokens, password values, or verification codes.
- Continue backend enforcement of `authenticateToken()`, ownership checks, validation, parameterized SQL, and `requireAppAccess('town_notice')`.

### 5.2 Native/WebView output safety

If TNNA uses a Capacitor WebView for portions of its UI, WA’s established safe-output rules remain relevant. User/database/API text must continue to be rendered using `textContent`, escaping, or deliberate sanitization; raw strings must not be placed directly into `innerHTML` or dangerous URL-bearing attributes.

Native-specific additions should include:

- HTTPS-only API endpoints in production.
- An allowlist for navigable external links and deep-link hosts.
- No arbitrary URL loading in a WebView.
- Content-security and navigation policy appropriate to Capacitor.
- Sensitive-screen behavior when the app is backgrounded, if resident/account information is displayed.

### 5.3 API versioning and error contract

Define a versioned Town Notice API before the native UI becomes dependent on internal routes. At minimum, standardize:

```text
/api/v1/town-notices
/api/v1/town-notices/{id}
/api/v1/town-notices/{id}/read-state
/api/v1/mobile/devices
/api/v1/mobile/devices/{id}
```

The eventual path names may differ, but the design should include:

- JWT/entitlement/role requirements.
- Pagination, sorting, and filter rules.
- UTC timestamps and display timezone fields where relevant.
- Stable identifiers and immutable notice publication semantics.
- Read/unread acknowledgment semantics and idempotency.
- Standard JSON error shapes and status-code behavior.
- Rate limits, input validation, and auditing.

Do not expose the raw 56-table WA database structure as the native API contract.

## 6. Platform and Delivery Controls

### 6.1 Node and build version policy

- Use Node 24 LTS as the target development standard after WA regression testing.
- Preserve Node 18.20.5 under NVM only as a temporary known-good WA fallback.
- Use the project-local Capacitor CLI through `npx cap`.
- Keep all Capacitor packages on the same major and patch where practical.
- Record Node, npm, JDK, Android Studio, Gradle wrapper, Android Gradle Plugin, Capacitor, and SDK versions in `TNNA/README.md`.
- Rebuild/reinstall project dependencies after a Node-major switch rather than assuming old `node_modules` remains valid.

Capacitor 8 requires Node 22 or later and recommends the latest LTS release. Node 24 is the longer-lived active LTS option as of this review; Node 22 remains supported only through April 30, 2027. [web:15][web:22]

### 6.2 CI and release pipeline

The project needs a repeatable build pipeline, even if initially it is simple:

1. Install the pinned Node version.
2. Run `npm ci` in WA and TNNA separately.
3. Run lint/test/build scripts that exist.
4. Run a Capacitor sync/build step from TNNA.
5. Build Android debug/release variants in a controlled environment.
6. Run a small automated or scripted API smoke test against a nonproduction environment.
7. Publish only signed, versioned artifacts from a protected release process.

For WA, pin the Node major used by Render or any other deployment platform and confirm it matches tested runtime assumptions. Do not rely on a provider’s changing default Node version.

### 6.3 Android signing and ownership

Before distributing outside local test devices:

- Confirm ownership/control of `com.wonderfulapps.townnotification`.
- Generate or adopt a release keystore under controlled custody.
- Keep redundant encrypted backups of keystore and credentials separate from the repository.
- Define who can sign releases and what happens if access is lost.
- Establish build flavors for local/development, test/preview, and production API environments.
- Define app version-code/version-name policy and minimum supported Android version.
- Decide crash/error reporting and privacy disclosure before adding SDKs.

## 7. Data, Time, and Offline Behavior

### 7.1 Town notice time policy

WA’s UTC database standard should continue unchanged: store instants in UTC and transmit ISO-8601 UTC timestamps. Town notices also need explicit fields/logic for the human-facing timezone—likely the town’s official timezone—for publication, meeting, and deadline display.

Do not use the device timezone as the authoritative town timezone. A resident traveling outside the area should still see a meeting scheduled in the town’s stated local time, while the underlying instant remains unambiguous.

### 7.2 Offline policy

Choose one of these explicitly:

| Policy | Benefits | Risks | Recommended use |
|---|---|---|---|
| Online-only | Simplest correctness/security; no stale local notice store | Poor connectivity means no content | Acceptable early beta if clearly communicated |
| Read-only cache | Better user experience for recently viewed notices | Stale notices and cache privacy require policy | Good likely baseline if expiry/refresh indicators are implemented |
| Offline queued actions | Allows acknowledgments/submissions while offline | Requires idempotency, conflict resolution, retry ordering, and audit design | Defer unless a user need clearly requires it |

For an initial TNNA release, use a short-lived read-only cache only if the user need justifies it, label last-refresh time, expire sensitive items appropriately, and keep mutation workflows online-only until idempotency and conflict behavior are fully designed.

### 7.3 Location and targeting

If Town Notification means notices targeted by municipality, zone, address, or geofence, define the authority and privacy model before collecting location data:

- What location source is authoritative: account address, manually selected town, verified residence, GPS, or administrator assignment?
- Does the app need continuous location, one-time location, or no device location at all?
- What minimum data is retained and for how long?
- How are boundary changes, duplicate residences, and users in multiple towns handled?
- How does an administrator prove why a recipient was included in a notice audience?

Do not request background location solely because it is technically available.

## 8. WA Platform Issues

### 8.1 Schema governance

`wappsDump.sql` is documented as the schema ground truth, but the project’s `.gitignore` excludes `*Dump.sql`. That protects a local dump from casual source control but creates a governance risk: intentional schema changes may not be reviewable, reproducible, or deployable from Git alone.

Recommended evolution:

- Keep recovery dumps protected as needed.
- Add ordered, tracked, forward-only migration scripts with unique IDs.
- Maintain a schema-version table or deployment ledger.
- Document how local, test, and production schemas are compared and migrated.
- Test every migration against MySQL 5.5 compatibility until the database platform is intentionally upgraded.

This is especially important before adding mobile-device registration, push delivery, and town-notice data structures.

### 8.2 MySQL 5.5 compatibility debt

The active requirement to retain MySQL 5.5 compatibility limits SQL options and reflects a database version that has been obsolete for a long time. Do not combine a database upgrade with TNNA’s first release, but open a separately planned modernization track:

- Inventory actual provider/version constraints.
- Identify incompatible SQL, charset/collation, timestamp, indexing, TLS, and driver behavior.
- Build a representative restore/test environment.
- Validate all WA modules, especially Family Tree merge/undo and subscription transactions.
- Plan rollback and data backup/restore verification.

### 8.3 Authorization model review

WA correctly documents that subscription access does not replace ownership/authorization. Maintain that separation as TNNA is added:

- Subscription app key answers whether a user may use a product.
- Route/domain authorization answers whether that user may access this notice, town, record, device, or administrative action.
- Ownership/tenant/jurisdiction validation answers whether the resource belongs to the requested account/scope.

A native client’s possession of a token must never be treated as sufficient authority to query a broader town/resident directory.

## 9. Recommended Design Deliverables

Create these short, reviewable Markdown artifacts before substantial TNNA implementation:

1. **`TNNA_Architecture.md`** — client/backend/provider boundary, deployment environments, trust boundaries, and sequence diagrams.
2. **`TNNA_Town_Notice_API.md`** — versioned endpoint contract, schemas, errors, pagination, authorization, and idempotency.
3. **`TNNA_Push_Notification_Design.md`** — device registration, consent matrix, category mapping, provider choice, retry/error states, and audit records.
4. **`TNNA_Mobile_Auth_Design.md`** — token/session/storage/refresh/revocation/logout model.
5. **`TNNA_Android_Release_Runbook.md`** — SDK/JDK/Gradle/Capacitor versions, signing, flavors, build commands, and release/rollback steps.
6. **`WA_Schema_Migration_Policy.md`** — migrations, schema authority, testing, deployment, backup, and rollback process.
7. **`WA_Node_Upgrade_Test_Plan.md`** — Node 24 regression scope, exact environment, results, defects, and standardization decision.

## 10. Recommended Next Sequence

1. Complete the controlled NVM migration and unblock Capacitor on Node 24.
2. Regenerate the Android project with the aligned Capacitor 8 project-local dependencies.
3. Establish a simple TNNA shell that proves environment configuration, authenticated API calls, and safe error handling—without implementing push delivery yet.
4. Document the Town Notice API contract and clarify whether TNNA shares the existing `town_notice` entitlement.
5. Design the push/consent/device-registration system and review it before database changes.
6. Run WA’s Node 24 regression plan and standardize on Node 24 if it passes.
7. Add migration governance before introducing the new notification/device tables.
8. Define Android signing/release controls before any distribution beyond developer test devices.

## 11. Final Position

The immediate Node/Cordova-Capacitor tooling issue is solvable and should not drive the architecture. The critical next work is to define TNNA as a secure, server-governed native client of a documented Town Notice domain—not as a loosely connected mobile copy of web pages.

If the project addresses the API contract, native authentication, push delivery, consent precedence, entitlement continuity, schema governance, and release controls early, it can reuse WA’s strongest existing assets: centralized authorization, notification controls, UTC data discipline, and shared operational logic.
