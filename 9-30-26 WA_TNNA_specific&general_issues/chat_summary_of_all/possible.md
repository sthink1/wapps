# WA / TNNA Possible Issues — Consolidated Design Review

**Date:** September 30, 2026  
**Scope:** Consolidation of the WA/TNNA design concerns identified in the Claude, Perplexity, and Grok possible-issues reviews.

## 1. Executive summary

The three reviews overlap heavily. Their common message is that the Node/NVM issue is only a tooling blocker. The larger TNNA design work is still ahead.

The most important design principle is:

> **TNNA should be a native client of the existing WA backend and its server-side rules, not a second implementation of WA business logic.**

That means authentication, authorization, subscription entitlement, consent, notice ownership, suppression, audit rules, and data integrity should remain server-controlled.

The highest-priority work is to define the **Town Notification domain itself**, the **TNNA-to-WA API boundary**, **mobile authentication**, and **native push delivery** before substantial native screens are built.

## 2. Highest-priority TNNA issues

### A. Define exactly what Town Notification / Town Notice is

All reviewers identified uncertainty in the documented Town Notice backend.

The existing WA material refers to the `town_notice` application entitlement, but the reviewed documentation does not clearly establish:

- the authoritative Town Notice tables;
- the authoritative route/service;
- who creates notices;
- what geographic entity a notice belongs to;
- whether users follow one or more towns;
- how notices expire;
- whether TNNA is merely another client for the existing `town_notice` product.

**Recommended action:** create a short `TNNA_Architecture.md` or Town Notice domain document before substantial native UI development.

It should state:

- source of Town Notice data;
- notice author/administrator model;
- town/jurisdiction model;
- server-side ownership and authorization;
- subscription AppKey;
- web/native relationship;
- online/offline expectations.

### B. Establish a stable TNNA API boundary

A native app cannot safely depend on whatever internal URL patterns happen to work in the current web pages.

Define a versioned API contract such as:

- list notices;
- retrieve a notice;
- follow/unfollow a town;
- read/unread or acknowledgment state if needed;
- register/update/remove a mobile device;
- retrieve account/preferences;
- authentication/session refresh;
- stable error codes.

Do not expose database structure as the API contract.

### C. Fix API-base/origin assumptions for a Capacitor client

Several current WA web conventions may not transfer directly to Capacitor.

In particular:

- `window.location.origin` inside the Capacitor WebView points to the app's local origin, not automatically to the WA server.
- The current server CORS configuration may not include the Capacitor origin.
- Native HTTP and WebView HTTP have different CORS behavior.

**Recommended action:** create one environment-aware API-base configuration and test one real authenticated request from an Android debug build before building many screens.

### D. Design mobile authentication and secure session storage

The existing browser pattern of an 8-hour JWT after email verification and browser storage is not a complete native-mobile session design.

Before release, decide:

- access-token lifetime;
- whether refresh/device sessions are used;
- secure device storage mechanism;
- sign-out from one device;
- sign-out from all devices;
- lost-device revocation;
- password-change/session invalidation;
- reauthentication rules;
- whether a trusted device can avoid repeated email-code login.

Sensitive tokens should not be stored as ordinary WebView/localStorage data if an OS-backed secure storage option is available.

### E. Native push notifications are a new subsystem

Existing email notification functionality is not the same as mobile push.

A production push design likely needs:

- registered-device table;
- user/device association;
- platform and app version;
- push provider token;
- token hash/index strategy compatible with the current database;
- token refresh/revocation;
- per-device active state;
- push preference;
- suppression handling;
- notification category;
- delivery-attempt/history table;
- provider response/error state;
- deduplication;
- retry policy;
- administrative audit trail.

Use the existing centralized notification/consent architecture rather than sending push directly from individual routes.

### F. Reconcile OS permission, WA consent, and suppression

The system needs one explicit precedence model.

For example, a push should not be sent when:

- no valid device token exists;
- OS notification permission is denied;
- the device token has been invalidated;
- the relevant WA notification preference is disabled;
- the user/channel/category is suppressed.

Decide whether Town Notification needs its own notification category rather than sharing a broader `APP_NOTICE` category.

## 3. TNNA product and release decisions

### A. TNNA entitlement

For the current stated goal, the cleanest model is:

**TNNA is another client for the existing `town_notice` product.**

That means the server continues to apply the existing `town_notice` entitlement to both web and native clients.

A separate AppKey is justified only if TNNA becomes a materially different commercial product.

### B. Canonical API domain

A mobile application will retain its API address until the app is updated.

Therefore:

- choose one canonical production host;
- prefer a domain under project control rather than relying indefinitely on an infrastructure-generated hostname;
- use that canonical domain for the native API and deep links;
- keep environment-specific configuration for development/test/production.

### C. Application ID and signing

Before store distribution:

- confirm that `com.wonderfulapps.townnotification` is the permanent intended package/application ID;
- establish Android signing;
- protect and back up keystore material;
- define debug/test/release environments;
- define version-code/version-name policy;
- keep signing secrets out of Git.

### D. Store/privacy requirements

Before publication, review current Google Play and later Apple requirements for:

- privacy policy;
- account deletion if accounts can be created;
- data-safety disclosure;
- push/device identifiers;
- Family Tree or other personal data if TNNA exposes any of it;
- digital subscription/payment rules if paid access is introduced.

These policies change, so they should be verified at release time rather than treated as permanently fixed.

## 4. WebView/native security concerns

WA's existing safe-output/sanitization standards should continue, but TNNA adds native concerns:

- HTTPS-only production communication;
- no arbitrary remote URL loading;
- navigation/deep-link host allowlists;
- validation of all deep-link parameters;
- no logging of JWTs, refresh tokens, device tokens, verification codes, or authorization headers;
- release WebView debugging disabled;
- no unnecessary cleartext traffic;
- cautious backup behavior for credentials;
- safe-area/system-bar behavior;
- explicit decision about service-worker registration inside TNNA;
- CSP/navigation controls appropriate to bundled Capacitor pages.

## 5. Offline and location policy

### Offline

Choose explicitly among:

- online-only;
- read-only short-lived cache;
- offline queued actions.

For an initial release, online-only or a carefully bounded read-only cache is much simpler than queued writes.

If cached notices are used, show refresh age and avoid presenting stale time-sensitive information as current.

### Location

Do not assume Town Notification requires background GPS.

First define the actual targeting rule:

- selected town;
- account address;
- verified residence;
- administrator assignment;
- one-time location;
- geofence;
- some other jurisdiction rule.

Collect only the location data actually required by that rule.

## 6. Time-zone policy

Continue WA's UTC storage standard.

For Town Notification, also record the authoritative human-facing timezone for each town/jurisdiction.

A resident traveling to another timezone should still see a town meeting or deadline in the town's intended local time.

## 7. WA platform issues raised by the reviews

### A. MySQL 5.5 technical debt

All reviewers identify the old database platform as a long-term constraint.

It affects:

- modern SQL features;
- index design;
- JSON support;
- TLS/security expectations;
- future migration tooling;
- push-token schema design.

Do not combine a database migration blindly with the first TNNA release, but create a separate modernization track.

### B. Schema-change governance

The current database dump may be the practical schema authority, while dumps are intentionally outside Git.

That makes TNNA's future tables harder to review and reproduce.

Recommended improvement:

- keep protected data dumps outside Git;
- add versioned, forward migration scripts to Git;
- record which migrations have been applied;
- optionally maintain a schema-only representation;
- test migrations against the currently supported database until it is upgraded.

### C. Automated regression coverage

WA has increasingly complex behavior, especially Family Tree, subscriptions, authentication, and notifications.

A small automated smoke/regression suite would reduce risk for:

- Node upgrades;
- TNNA API additions;
- database changes;
- Family Tree refactoring;
- authentication/session changes.

High-value tests include login, subscription allow/deny, promo/admin grant, notification preference, and Family Tree merge/undo.

### D. Public endpoint/rate-limit/security review

The reviews specifically recommend verifying:

- `/send-email`;
- geocoding endpoints;
- login/code verification;
- promo redemption;
- public token flows.

Check that authentication/authorization is appropriate and add abuse protection/rate limiting where needed.

### E. Token revocation

An 8-hour JWT with no documented revocation becomes more problematic on mobile.

The mobile-auth design should solve both TNNA and WA session revocation in one coherent design.

### F. Sensitive tokens in URLs/logs

Unsubscribe and verification flows may place tokens in request URLs.

Ensure access logs redact sensitive token paths where appropriate and use a restrictive referrer policy.

### G. Admin identity model

The current single-admin approach may be sufficient for now, but long term a formal role/permission field is more maintainable than hard-coded user ID/username checks.

### H. Tracking-table overlap

`TrackUsageT` and `UserUsageT` serve different purposes today.

Document that distinction rather than merging them accidentally. Consolidate only as a deliberate future design decision.

### I. Family Tree complexity and privacy

Family Tree now has a large behavioral and privacy surface:

- merge/undo;
- siblings;
- networking;
- living-person data;
- images;
- archive/history;
- notifications.

Maintain a regression checklist and separately define retention/access/deletion policy for living-person information.

### J. Family Tree module size

Refactoring the very large Family Tree route/module may be worthwhile, but only after tests protect the current behavior.

## 8. Repository and deployment hygiene

TNNA is inside the WA repository, which is workable, but rules should be explicit.

Review `.gitignore` for at least:

- `TNNA/node_modules/`;
- Gradle caches;
- Android build outputs;
- `local.properties`;
- keystores;
- signing-property files;
- service-account secrets.

At the same time, do not ignore all of the generated Android project. Once the Capacitor Android project is correct, the project configuration should generally be preserved so it can be reproduced and maintained rather than regenerated unnecessarily.

Also verify whether TNNA-only commits can trigger WA deployments and whether Render build filters or branch rules should be adjusted.

## 9. Runtime and deployment parity

The local PC runtime and Render runtime are separate decisions.

Record and deliberately control:

- WA Node version;
- TNNA Node version;
- Render Node version;
- npm version;
- Capacitor version;
- Android Studio version;
- JDK;
- Gradle;
- Android Gradle Plugin;
- Android SDK targets.

Avoid relying indefinitely on provider defaults.

## 10. Documentation updates

After the Node/TNNA foundation is established, update `CLAUDE.md` and `TechSummary.md`, or create focused TNNA documentation, to include:

- TNNA directory and purpose;
- Node/runtime policy;
- how TNNA communicates with WA;
- AppKey/entitlement rule;
- mobile authentication design;
- push architecture;
- environment configuration;
- build commands;
- Android/iOS packaging requirements;
- signing/release procedure.

Avoid duplicating large blocks of the same text in multiple project documents; link from concise rules to the authoritative design document.

## 11. Consolidated priority order

### Priority 0 — before meaningful TNNA feature development

1. Resolve the Node runtime blocker.
2. Define Town Notice data ownership and server-side domain.
3. Define whether TNNA is another client of `town_notice`.
4. Define the native API base/environment model.
5. Prove one authenticated API request from the Android app.
6. Define mobile authentication/session storage.
7. Design the push/device/consent model.

### Priority 1 — before beta/release

8. Establish migration/schema governance for new TNNA tables.
9. Add basic automated regression/smoke tests.
10. Establish canonical production domain.
11. Define deep links.
12. Define Android signing/release controls.
13. Define app version compatibility / API versioning.
14. Review security hardening, CORS/origin behavior, rate limits, and endpoint protection.
15. Define offline and timezone behavior.

### Priority 2 — parallel platform improvements

16. Plan MySQL modernization.
17. Improve formal admin roles when needed.
18. Document tracking-table ownership.
19. Continue Family Tree regression/privacy work.
20. Reduce documentation drift and clarify runtime/deployment versions.

## 12. Recommended design documents

The following would provide a clean next layer of project authority:

1. `TNNA_Architecture.md`
2. `TNNA_Town_Notice_API.md`
3. `TNNA_Mobile_Auth_Design.md`
4. `TNNA_Push_Notification_Design.md`
5. `TNNA_Android_Release_Runbook.md`
6. `WA_Node_Upgrade_Test_Plan.md`
7. `WA_Schema_Migration_Policy.md`

These do not all need to be large. A few well-defined pages will reduce the risk of coding the native application before its boundaries are settled.

## 13. Final assessment

The reviews are broadly consistent.

The **Node problem is solvable and should be handled conservatively**, but it is not the main architectural risk.

The main risk is beginning TNNA implementation before defining:

- the Town Notice backend;
- the stable native API;
- mobile sessions;
- secure credential storage;
- push delivery;
- consent precedence;
- entitlement continuity;
- schema migration;
- app release/security rules.

WA already has useful foundations—server-side authorization, subscription controls, notification preferences, UTC discipline, and established data logic. TNNA should reuse those foundations through an explicit API rather than reproduce them inside the native client.

## 14. Source documents reviewed

- `C_WA_possible_Issues.md`
- `P_WA_possible_Issues.md`
- `G_WA_possible_Issues.md`
- `G_WA_TNNA_Additional_Design_Issues.md`
- `C_TNNA_Node_NVM_Design_Engineer_Response.md`
- `P_TNNA_Node_NVM_Design_Engineer_Response.md`
- `Chat_TNNA_Node_NVM_Technical_Review.md`
