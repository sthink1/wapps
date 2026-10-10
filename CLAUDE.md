# CLAUDE.md – WonderfulApps Developer Onboarding Guide

**Last updated:** October 9, 2026  
**Project:** WonderfulApps (WA)  
**Database ground truth:** `wappsDump.sql`

---

## 1. Purpose of This File

This file is the primary development guide for WonderfulApps. Before making code changes, use this document together with the current source files and `wappsDump.sql`.

When documentation conflicts with current executable code or the current SQL dump:

1. `wappsDump.sql` is authoritative for the current database schema.
2. Current source files are authoritative for application behavior.
3. This document should then be corrected to match the implementation.

Do not design from an older description when a current file is available.

---

## 2. Current Architecture

WonderfulApps is a multi-application web/PWA project built with:

- **Frontend:** HTML, CSS, and vanilla JavaScript in `httpdocs/`
- **Backend:** Node.js with Express
- **Database:** MySQL, with production SQL maintained for MySQL 5.5 compatibility
- **Authentication:** JWT bearer tokens, email verification, and bcrypt password hashing
- **Subscription / entitlement system:** hierarchical plans, per-application access rules, development entitlements, promo codes, administrator grants, and usage tracking
- **Notification / consent system:** account, subscription, application, Family Tree, and marketing notification categories; preferences; consent history; suppression; and unsubscribe processing
- **Database driver:** `mysql2`
- **Validation:** `express-validator`
- **Logging:** Morgan + Winston
- **Email:** Resend
- **External data/API support:** Axios, Yahoo Finance, geocoding and other feature-specific APIs
- **Object/image storage support:** AWS S3-compatible SDK through `r2Storage.js`
- **Image processing:** `sharp`
- **PWA:** service worker and manifest under `httpdocs/`
- **Native Android:** Town Notification Native App (TNNA) under `TNNA/`, built with Capacitor 8.5.2 plus native Java plugins/services for background location, Android text-to-speech, and secure persistent login

The application is organized around independent functional areas that share the same user, authentication, and subscription platform.

---

## 3. Current Major Application Areas

The current WA project includes:

- User registration, login, email verification, and JWT authentication
- Subscription / entitlement management
- Administrator subscription control through `SubControl.html`
- Promotional-code processing
- Per-application subscription access enforcement
- Subscription usage tracking
- Weight tracking
- Activity tracking
- Weight/activity associations
- Interest earned calculations and records
- ETF research, categories, symbols, and activity
- General usage tracking/analytics
- Property and geolocation-related tools
- Amortization / loan-payment tools
- Contact/email functions
- Notification preferences, consent history, suppression, and unsubscribe processing
- **Budget application**
- **Family Tree application**, including One Tree Merge, Undo One Tree Merge, and Family Networking
- **Town Notification Native App (TNNA) V1.1**, including WA account registration/login, email verification, secure persistent native login, offline continuation, local town/city boundary detection, background location monitoring, Android text-to-speech, version checking, and update-email preferences

Budget, Family Tree, Family Networking, Subscription, and TNNA are implemented WA components, not future placeholders.

---

## 4. Current Backend Route Modules

Current route files include:

```text
routes/
├── activities.js
├── budget.js
├── etf.js
├── familyTree.js
├── geocode.js
├── interestEarned.js
├── notifications.js
├── subscriptions.js
├── track.js
├── tnna.js
├── users.js
├── weightActivities.js
└── weights.js
```

Current `server.js` mounts the principal routes as follows:

| Route prefix | Route module | Subscription handling |
|---|---|---|
| `/users` | `routes/users.js` | Authentication / user flow |
| `/subscriptions` | `routes/subscriptions.js` | Authenticated subscription APIs |
| `/notifications` | `routes/notifications.js` | Authenticated preference APIs plus public token unsubscribe and Family Network verification endpoints |
| `/track` | `routes/track.js` | Existing general usage tracking |
| `/tnna` | `routes/tnna.js` | TNNA V1.1 account/session, version/update, device, and administrator APIs |
| `/weights` | `routes/weights.js` | `weigh_in` access required |
| `/activities` | `routes/activities.js` | `weigh_in` access required |
| `/weightActivities` | `routes/weightActivities.js` | `weigh_in` access required |
| `/interestEarned` | `routes/interestEarned.js` | `interest_earned` access required |
| `/budget` | `routes/budget.js` | `budget` access required |
| `/familytree` | `routes/familyTree.js` | `family_tree` access required |
| `/etf` | `routes/etf.js` | `etf_investing` access required |
| `/api/geocode` | `routes/geocode.js` | Currently not wrapped by subscription middleware |

`/send-email` is handled directly in `server.js`.

### Subscription APIs

`routes/subscriptions.js` currently provides user subscription APIs:

```text
GET  /subscriptions/status
GET  /subscriptions/access/:appKey
POST /subscriptions/promo
POST /subscriptions/usage
```

It also provides administrator-only subscription-control APIs:

```text
GET    /subscriptions/admin/promos
POST   /subscriptions/admin/promos
PUT    /subscriptions/admin/promos/:promoCodeId
GET    /subscriptions/admin/user/:userId
GET    /subscriptions/admin/grants
POST   /subscriptions/admin/grant
PUT    /subscriptions/admin/grants/:grantId
DELETE /subscriptions/admin/grants/:grantId
```

All subscription routes require a valid JWT. The `/admin/...` routes additionally require administrator status.

### TNNA APIs

`routes/tnna.js` provides the TNNA-native account/session and update APIs:

```text
GET  /tnna/version
POST /tnna/verify-code
POST /tnna/refresh
POST /tnna/logout
GET  /tnna/me
PUT  /tnna/update-email-preference
GET  /tnna/admin/users
POST /tnna/admin/send-update
```

TNNA begins authentication with the existing `POST /users/login` route, then completes native-app verification through `POST /tnna/verify-code`. The TNNA administrator endpoints require a valid JWT plus administrator status.

---

## 5. Current Database

The current `wappsDump.sql` is the database ground truth and contains **60 tables**. It includes the notification/consent schema, the Family Tree Undo One Tree Merge schema, the Family Networking schema, the administrator subscription-grant table, and the four TNNA V1.1 account/device/version tables.

### Core user / system tables (4)

```text
UsersT
LoginVerificationT
UserSequenceT
TrackUsageT
```

### Subscription / entitlement tables (8)

```text
AdminSubscriptionGrantT
AppT
PromoCodeT
PromoRedemptionT
SubscriptionPlanT
SystemSettingsT
UserSubscriptionT
UserUsageT
```

### Notification / consent tables (6)

```text
ConsentTextVersionsT
NotificationConsentHistoryT
NotificationHistoryT
NotificationPreferencesT
NotificationSuppressionT
UserAgreementHistoryT
```

### Weight / activity tables (3)

```text
WeightsT
ActivitiesT
WeightActivitiesT
```

### Interest table (1)

```text
InterestEarnedT
```

### ETF tables (3)

```text
etfActivityT
etfCategoryT
etfSymbolT
```

### Budget tables (13)

```text
BudgetCardT
BudgetDescriptionT
BudgetEstimateAllowanceT
BudgetInT
BudgetLeaseRentT
BudgetLoanT
BudgetMyInvestmentT
BudgetMyMoneyT
BudgetOutT
BudgetRecurrenceMonthlyDayT
BudgetRecurrenceT
BudgetRecurrenceWeeklyDayT
BudgetSubscriptionT
```

### Family Tree tables (18)

```text
FamilyTreeT
FTContactT
FTEventPersonT
FTEventT
FTFamilyTreeActivityT
FTFamilyTreePersonT
FTFamilyTreeUserT
FTImageT
FTNetworkT
FTNetworkVerificationT
FTNotificationT
FTParentT
FTPartnerT
FTPersonMergeT
FTPersonT
FTRecordArchiveT
FTSiblingT
FTTreeMergeT
```

### TNNA tables (4)

```text
TNNADeviceT
TNNARefreshTokenT
TNNAUserT
TNNAVersionT
```

TNNA account state is linked to the existing `UsersT` identity. `TNNARefreshTokenT` stores only SHA-256 hashes of refresh tokens; the plaintext refresh token is kept only on the Android device in encrypted form through Android Keystore. `TNNADeviceT` records the TNNA device ID/platform/app version, and `TNNAVersionT` is the server authority for the current downloadable TNNA release.

### Database rules

- `wappsDump.sql` is the authoritative current schema reference.
- The current dump already includes the implemented notification/consent, administrator subscription-grant, Undo One Tree Merge, and Family Networking table changes.
- Keep SQL compatible with the deployed MySQL 5.5 environment unless the database platform is intentionally changed.
- Use `utf8mb4`.
- **UTC time standard:** every MySQL connection session must run with `time_zone = '+00:00'`, and the `mysql2` pool must use `timezone: 'Z'`. Store and transmit instants in UTC. Browser UI may convert UTC timestamps to the viewer's local timezone for display (for example, with JavaScript `Date` plus `toLocaleString()`).
- Do not rewrite existing `TIMESTAMP` history merely to adopt this standard; MySQL stores `TIMESTAMP` values internally in UTC. Any historical `DATETIME` migration requires separate evidence that the stored values are not already UTC.
- Respect existing primary keys, unique keys, indexes, and foreign-key rules in `wappsDump.sql`.
- Many user-owned tables use `UserID` and database-level cascading deletes to `UsersT`.
- `UserSequenceT` supports user-scoped identifiers used by several WA modules.
- Do not invent or rename database columns without checking every route and frontend consumer.
- Family Tree relationships and merge/undo behavior are partly application-managed; do not assume SQL foreign keys alone describe all integrity rules.
- Historical implementation/migration SQL files are not the current database authority when they differ from `wappsDump.sql`.
- The current `.gitignore` rule `*Dump.sql` intentionally keeps SQL dump files out of normal Git tracking. Replacing `wappsDump.sql` locally therefore may not appear in VS Code Source Control or be pushed to GitHub/Render. Maintain the current dump separately as the schema/reference snapshot.

---

## 6. Subscription / Entitlement System

The Subscription function is now part of the merged `main` branch.

### 6.1 Plan hierarchy

Plans are hierarchical. A higher `PlanLevel` includes lower plan levels.

Current plan seed values are:

| Plan | Level |
|---|---:|
| Standard | 1 |
| Premium | 2 |
| Platinum | 3 |
| Diamond | 4 |

Do not hard-code plan meaning from display text alone. The database `PlanLevel` is the hierarchy authority.

### 6.2 Application catalog

`AppT` defines the subscription-controlled applications.

Current development classifications in `subscription_schema.sql` are:

| AppKey | Application | Minimum plan | Cost category | Development available |
|---|---|---|---|---|
| `loan_payment` | Loan Payment | Standard | A | Yes |
| `property_info` | Property Info | Standard | A | Yes |
| `town_notice` | Town Notice | Standard | A | Yes |
| `weigh_in` | Weigh In | Premium | B | Yes |
| `interest_earned` | Interest Earned | Premium | B | Yes |
| `budget` | My Money My Budget | Premium | B | Yes |
| `family_tree` | Family Tree | Platinum | C | Yes |
| `etf_investing` | ETF Investing | Diamond | D | No during current development mode |

`server.js` currently enforces subscription access on the major data/API routes listed in Section 4.

The frontend may disable unavailable buttons for usability, but **server-side middleware is the actual access/security gate**.

### 6.3 Development entitlement

The current first-successful-login workflow is implemented in `routes/users.js` and `services/subscriptionService.js`.

After the user successfully completes email verification:

1. `getOrCreateDevelopmentTrial(UserID)` checks whether a `UserSubscriptionT` row already exists.
2. If one exists, it is not reset.
3. If none exists and `AllowNewDevelopmentTrials = 1`, a development entitlement is created.
4. The entitlement currently uses the **Platinum** plan.
5. `DevelopmentTrialDays` controls its normal duration and currently defaults to 30 days.
6. `DevelopmentEntitlementEndDate`, when populated, acts as an earlier global cutoff for `DEVELOPMENT_TRIAL` access.
7. A newly created entitlement redirects the user to `subscription.html`.
8. An expired user is also directed to `subscription.html`.
9. An active returning user normally proceeds to `home.html`.

Important rule:

> **After development, all free development entitlements expire.**

This is implemented through the development settings rather than by recreating or silently extending existing subscriptions.

### 6.4 Development settings

Current `SystemSettingsT` seed keys are:

```text
DevelopmentMode
AllowNewDevelopmentTrials
DevelopmentTrialDays
DevelopmentEntitlementEndDate
```

Do not bypass these settings with hard-coded development dates in frontend pages.

### 6.5 Promotional codes

Promo-code processing is implemented transactionally in `redeemPromoCode()`.

`PromoCodeT` includes:

```text
Code
PlanID
StartDate
EndDate
Active
MaxUses
Uses
CreatedDate
```

Rules currently enforced include:

- Code must exist and be active.
- Current date must be within the code's date range.
- `MaxUses`, when non-null, limits total redemptions.
- `Uses` is incremented after successful redemption.
- A user may redeem a particular code only once; `PromoRedemptionT` enforces this.
- A promo may upgrade plan level and/or extend the user's end date.
- A promo cannot reduce an existing better entitlement.
- Redemption, subscription update, redemption record, and use-count update are handled in one transaction.

The current development seed promo should be treated as configurable database data, not application logic.

### 6.6 Subscription access middleware

`middleware/subscriptionAccess.js` contains:

```text
authenticateToken()
requireAppAccess(appKey)
isAdminUser()
```

`requireAppAccess()` calls `getAppAccess()` in `services/subscriptionService.js`.

Possible access-denial conditions include:

```text
APP_NOT_CONFIGURED
APP_INACTIVE
NOT_AVAILABLE_DURING_DEVELOPMENT
SUBSCRIPTION_EXPIRED
PLAN_TOO_LOW
```

The current admin override recognizes UserID 1 or the configured `ADMIN_USERNAME` value.

Do not rely on a frontend-only subscription check.

### 6.7 Usage tracking

Subscription-related usage is stored in `UserUsageT`.

Allowed event types currently include:

```text
APP_OPEN
RECORD_CREATE
RECORD_UPDATE
API_CALL
EMAIL_SENT
FILE_UPLOAD
```

This is separate from the pre-existing `TrackUsageT` / `/track` functionality. Do not merge the two concepts casually; review their current purposes first.

### 6.8 Administrator grants and Sub Control

Administrator-granted free access is stored separately in `AdminSubscriptionGrantT`; it is not written over the user's underlying development-trial or promo entitlement.

`SubControl.html` is the administrator UI for:

- listing, creating, and editing promo codes;
- looking up a user's subscription status;
- listing active administrator grants;
- granting a selected plan through a specified end date;
- editing an existing grant's plan/end date;
- revoking a grant without deleting its audit history.

Important rules:

- Administrator grants use the effective access type `ADMIN_GRANT`.
- A grant may use any current plan, including Diamond.
- Grant edits may raise or lower the grant plan and extend or shorten its end date.
- Revocation is a soft revoke: `Active` is cleared and revoke metadata is retained.
- `getCurrentSubscription()` / effective-subscription calculation considers an active administrator grant separately from the base `UserSubscriptionT` entitlement.
- When an administrator grant expires or is revoked, the underlying development-trial/promo entitlement can again become effective if it is otherwise valid.
- Do not collapse `AdminSubscriptionGrantT` into `UserSubscriptionT`; the separation preserves provenance and history.

### 6.9 Current Plans monitoring

The administrator Track Activity page now uses **Current Plans** rather than the former Free Tier label.

Current backend endpoint:

```text
GET /track/current-plans
```

The prior endpoint remains temporarily for compatibility:

```text
GET /track/free-tier-usage
```

Both are administrator-only. `routes/track.js` currently reports plan/capacity information for FreeSQLdatabase, Resend, Render, and Cloudflare R2, using automatic usage values where available and provider/dashboard values where automatic measurement is unavailable.

Current source data in `routes/track.js` records the FreeSQLdatabase database plan as paid MySQL Full starting at 100 MB and `$21.15/year`. Pricing metadata in this route was reviewed on `2026-09-20`; treat provider pricing as time-sensitive and re-check before changing displayed plan information.

### 6.10 Payment status

Payment subscription processing is **not yet implemented**. `subscription.html` currently states that payment subscriptions will be available later.

Do not create `payment.html`, payment-provider logic, or recurring billing behavior unless that work is specifically requested.

---

## 7. Notification / Consent System

The notification system is implemented through `routes/notifications.js`, `services/notificationService.js`, registration logic in `routes/users.js`, notification-aware Family Tree logic, and the notification/consent tables in `wappsDump.sql`.

### 7.1 Notification categories

Current categories are:

```text
ACCOUNT
SUBSCRIPTION
APP_NOTICE
FAMILY_TREE
MARKETING
```

`ACCOUNT` and `SUBSCRIPTION` are required categories. `APP_NOTICE`, `FAMILY_TREE`, and `MARKETING` are optional categories subject to user preference/suppression rules.

### 7.2 Preferences and consent

`NotificationPreferencesT` stores current user preferences for:

```text
MarketingEmail
MarketingSMS
FamilyTreeEmail
AppNoticeEmail
```

Registration records the user's explicit marketing email/SMS choices and requires acceptance of the current Terms of Use and Privacy Policy. Consent/agreement history is retained in `NotificationConsentHistoryT` and `UserAgreementHistoryT`, with versioned text in `ConsentTextVersionsT`.

Phone 1 remains required by the current registration implementation.

### 7.3 History, suppression, and unsubscribe

`NotificationHistoryT` records notification attempts and results. `NotificationSuppressionT` stores destination/category/channel suppressions so a recipient's stop request can continue to be honored independently of a particular user record.

`routes/notifications.js` provides authenticated preference endpoints and public token-based unsubscribe endpoints. Public unsubscribe links do not require login.

It also provides the public Family Network verification endpoints used by `networkVerification.html`. These links do not require a WA login, but they are protected by random token values whose SHA-256 hashes are stored in `FTNetworkVerificationT` and are subject to expiration and current-email checks.

`PUBLIC_BASE_URL` controls the public URL used when notification links are generated. Local testing should use the local server origin; production should use the production WA origin.

### 7.4 Family Tree notifications

Family Tree edit/delete notification behavior is integrated with `routes/familyTree.js` and uses the central notification service. The Family Tree-specific `FTNotificationT` remains part of the Family Tree audit/delivery workflow while central notification history and suppression rules are also applied.

Do not bypass the central notification service when adding new optional email/SMS notification behavior.

---

## 8. Budget Application

The Budget application is implemented through `routes/budget.js`, Budget HTML pages, and the Budget tables in `wappsDump.sql`.

The current schema covers:

- Money/accounts
- Investments
- Income
- Outgoing items
- Descriptions
- Recurrence definitions
- Weekly recurrence days
- Monthly recurrence days
- Loans
- Credit/debit cards
- Lease/rent obligations
- Subscriptions
- Estimated allowances

Budget changes must preserve:

- Per-user data isolation through `UserID`
- Existing recurrence behavior
- Existing handling of active/inactive records
- Existing credit-card payment policy and related fields
- Existing date and amount semantics
- MySQL 5.5 compatibility
- Subscription middleware protection through the `budget` app key

Do not replace the existing Budget schema with a generic single `BudgetsT` table.

---

## 9. Family Tree Application

The Family Tree application is implemented through `routes/familyTree.js`, Family Tree HTML pages, companion `httpdocs/js/FT*.js` modules, and the Family Tree tables in `wappsDump.sql`.

The current schema includes support for:

- Family trees
- People
- People associated with trees
- Users associated with trees
- Parents
- Partners
- **Explicit sibling relationships**
- Events
- People associated with events
- Contacts
- Images
- Notifications
- Family Tree activity
- Person merge operations
- Archived records
- **Family Networking profiles and search participation**
- **Family Network email verification history**

### Family Networking

Family Networking is implemented as part of the Family Tree application. The principal frontend files are:

```text
httpdocs/FTPerson.html
httpdocs/FTNetwork.html
httpdocs/networkVerification.html
httpdocs/js/FTPerson.js
httpdocs/js/FTNetwork.js
```

The backend logic is split between `routes/familyTree.js` for authenticated profile/search functions and `routes/notifications.js` for public token-based verification responses.

Current authenticated Family Networking endpoints are:

```text
GET    /familytree/persons/:id/network
PUT    /familytree/persons/:id/network
DELETE /familytree/persons/:id/network
GET    /familytree/network/search
```

Current public verification endpoints are:

```text
GET  /notifications/network-verification/:token
POST /notifications/network-verification/:token
```

`FTNetworkT` stores one Network profile per Person. Important fields include:

```text
PersonID
IncludeInSearch
NetworkNote
PreferredContactType
BusinessSeekingVendor
VendorSeekingBusiness
SeekingProfessionalServices
ProfessionalOfferingServices
CustomerSeekingBusiness
BusinessSeekingCustomers
PeopleNeedJobs
JobsNeedPeople
SeekingRelativesInArea
SeekingSchoolConnection
VerificationStatus
VerifiedEmail
VerificationRequestedAt
VerifiedAt
DeclinedAt
CreatedByUserID / CreatedAt
UpdatedByUserID / UpdatedAt
```

`FTNetworkVerificationT` stores verification requests and responses, including a SHA-256 token hash, requested email address, requesting user, request/expiration/response timestamps, and the response state.

Important Networking behavior:

- Networking is available only for living Persons. The Person page disables Networking and Search Networking for a deceased Person, and the backend independently rejects Networking changes/searches for a deceased Person.
- A Network profile may exist even when `IncludeInSearch=0`. The Person page shows whether Networking information is active/inactive separately from verification state.
- Selecting **Include this Person in Family Network Search** requires a current Email contact before the Person can become searchable.
- Verification is tied to the specific email address that was verified. If the Person's Email contact changes, the prior verified state is not considered effective and a new verification is required.
- Verification links use random tokens; only the SHA-256 token hash is stored in `FTNetworkVerificationT`. Current verification requests expire after seven days.
- Approval sets the profile to `VERIFIED` for the verified email. Declining clears `IncludeInSearch` and marks the profile `DECLINED`. A newer request can supersede an older pending request.
- Verification email delivery goes through the central notification service under the `FAMILY_TREE` category and therefore continues to honor central suppression/delivery rules.
- Network add/edit/delete operations are logged in `FTFamilyTreeActivityT` and use Family Tree notification processing. Network information is treated as one logical Network item for change-notification purposes rather than separate Education/Career/Skill/etc. notification categories.

Family Network search starts from a specific Person and a specific Family Tree. Search results are intentionally limited to verified participating biological blood relatives of that focal Person within that Tree.

Blood-line scope is derived from non-adopted parent relationships plus explicit `FTSiblingT` biological-sibling links. It includes descendants of biological ancestors (for example parents, grandparents, siblings, cousins, children and grandchildren) while avoiding spouses/co-parents who are connected only by partnership/shared-child relationships. The focal Person is excluded from their own results. Search results also exclude deceased Persons.

A candidate is searchable only when all of the following are true:

1. the candidate is in the selected Family Tree;
2. the candidate is in the focal Person's calculated biological blood line;
3. the candidate is living;
4. `IncludeInSearch=1`;
5. `VerificationStatus='VERIFIED'`; and
6. the verified email still matches a current Email contact for that Person.

Networking matching uses complementary choices for four paired categories and mutual matching for two categories:

| Search choice | Candidate match |
|---|---|
| Business looking for vendor | Vendor looking for business |
| Vendor looking for business | Business looking for vendor |
| Looking for professional services | Professional offering services |
| Professional offering services | Looking for professional services |
| Customer looking for business | Business looking for customers |
| Business looking for customers | Customer looking for business |
| People need jobs | Jobs need people |
| Jobs need people | People need jobs |
| Looking to contact relatives in an area | Same choice |
| Looking for someone going to my school | Same choice |

`FTNetwork.html` can accept multiple criteria in one search. A result may therefore contain more than one "Why Matched" reason.

When changing Networking code, preserve the privacy boundary: Network search is not a public directory, verification consent is required, the search must stay within authorized Family Tree context, and only verified biological blood-line participants may be returned.

### One Tree Merge and Undo One Tree Merge

The One Tree Method can merge a newer/source Tree into an older/surviving Tree. The current implementation records reversible merge history in `FTTreeMergeT` and links person-level merge records through `FTPersonMergeT.TreeMergeID`.

`FTTreeMergeT` stores the source Tree, surviving Tree, merge user/time, status, bridge/decision data, a pre-merge snapshot, generated R2 keys, and undo metadata.

Current Undo API endpoints in `routes/familyTree.js` include:

```text
GET  /familytree/one-tree/undo-options
GET  /familytree/one-tree/undo-review/:treeMergeID
POST /familytree/one-tree/undo
```

Undo is a structural reversal of a recorded merge event. It restores the source Tree and its people/relationships from the recorded merge snapshot while preserving the older surviving Tree. A merge that predates the snapshot-based implementation is not safely inferred as undoable.

Important implementation rules:

- Record the Tree merge snapshot within the same transaction as the merge.
- Preserve source Tree identity and original relationship/membership data needed for reversal.
- Preserve later changes where the undo logic is specifically designed to do so; do not replace current data blindly without reviewing the merge/undo rules.
- Handle parent, partner, sibling, contact, event, image, Tree-user, and person-merge data consistently.
- Keep `FTTreeMergeT` and linked `FTPersonMergeT` history intact for auditability.
- Multiple dependent merges must be undone in a valid order; do not bypass dependency checks.
- R2 image/object cleanup must distinguish pre-existing objects from merge-generated objects.
- `moveComponentToTree()` uses the current MySQL-5.5-compatible membership-copy logic; do not reintroduce the earlier self-`INSERT ... SELECT ... ON DUPLICATE KEY UPDATE` ambiguity involving `OriginFamilyTreeID`.

The current Undo workflow was successfully exercised end-to-end during September 2026 testing: a newer Tree was merged into an older Tree, Undo restored the newer Tree's seven-person family structure, and those people were no longer listed in the older Tree.

### Current Tree, separated Tree, and split behavior

Family Tree membership and the user's **current** Tree are intentionally separate concepts.

Current rules in `routes/familyTree.js`:

- `FTFamilyTreeUserT.IsActive=1` identifies the user's current/default Tree; it is **not** the authorization flag for every Tree the user can access.
- A user may retain membership in a separated Tree while the original Tree remains current.
- `ENTER FAMILY CODE` / `USE THIS TREE` changes which Tree is current. It must **not** merge Trees.
- Tree merging is performed only through the dedicated **One Tree Merge** workflow.
- `POST /familytree/change-tree` ends the current Tree association by deactivating the current membership; it does not delete Family Tree data.
- When deletion of a connecting/bridge person leaves disconnected components, the original/first-created branch remains the current Tree and other components become or reactivate separated Trees.
- `GET /familytree/split-view` is read-only. It derives the current Tree plus related separated branches from database memberships and `OriginFamilyTreeID`, so the display survives refresh, logout/login, and loss of browser session storage.
- Viewing a person in a separated Tree must not by itself change the current Tree.
- Person List may therefore display more than one related FamilyTreeCode at the same time.

Do not use ordinary navigation or person viewing as a hidden Tree-switch or merge operation.

### FTSiblingT

`FTSiblingT` is now part of the current schema. It supports explicit biological sibling relationships, including cases where parents are not yet known.

Important behavior in `routes/familyTree.js`:

- Biological siblings may be derived from a shared recorded biological parent.
- Biological siblings may also come from explicit `FTSiblingT` relationships.
- Explicit sibling links are normalized so the lower PersonID is stored first.
- Duplicate tree/person/sibling relationships are prevented by the table's unique key.
- Family Tree merge and move logic must preserve, remap, and clean up sibling relationships along with parent and partner relationships.
- Ancestor/relationship calculations use explicit sibling edges as well as parent-derived sibling relationships.

Family Tree work must preserve existing ownership, relationship, sibling, merge, archive, event, notification, and image behavior.

Profile/image uploads use Family Tree-specific multipart handling rather than the general no-file multipart middleware in `server.js`.

The entire Family Tree API is currently protected through the `family_tree` subscription app key.

---


## 10. Town Notification Native App (TNNA)

TNNA is the native Android Town Notification application located under `TNNA/`. It is a Capacitor application that reuses HTML/CSS/JavaScript for its UI while using native Java plugins/services for secure account storage, background location, notification status, and Android text-to-speech.

### 10.1 Current release

Current native release configuration:

```text
App name: Town Notification
Application ID: com.wonderfulapps.townnotification
Capacitor: 8.5.2
Android versionCode: 2
Android versionName: 1.1
TNNA config version: 1.1.0
API base URL: https://wonderfulappscompany.com
Download page: https://wonderfulappscompany.com/TownNotice.html
```

The release APK must continue to use the same Android application ID and the same permanent TNNA signing key so Android recognizes future APKs as updates rather than unrelated applications. Signing passwords belong only in the local ignored `TNNA/keystore.properties`; never commit credentials or expose them in documentation/output.

### 10.2 Native structure

Principal TNNA files include:

```text
TNNA/
├── capacitor.config.json
├── package.json
├── public/
│   ├── config.js
│   └── index.html
└── android/app/src/main/java/com/wonderfulapps/townnotification/
    ├── BoundaryIndex.java
    ├── TnnaAccountPlugin.java
    ├── TownLocationPlugin.java
    └── TownLocationService.java
```

`TownLocationService` is an Android foreground service. While monitoring is active it keeps the TN status-bar notification visible, requests live GPS updates plus network-provider updates when available, and can use a recent last-known location no more than 30 seconds old. The service is `START_STICKY` while actively monitoring and is intended to continue while another application is in the foreground or the screen is off.

`TownLocationService` implements the legacy `LocationListener` callbacks required for Android 8 compatibility, including `onStatusChanged`, `onProviderEnabled`, and `onProviderDisabled`. Do not remove these as unused modern-Android code without re-testing Android 8.

### 10.3 Local town/city detection and speech

Town/city lookup is performed locally through `BoundaryIndex`; ride-time town detection does not depend on a server geocoding request. When the detected named area changes, the native service speaks:

```text
You have entered: <town/city name>
```

If no named town/city is detected, TNNA continues monitoring without an announcement. The current V1.1 design does not announce counties.

Android `TextToSpeech` is configured as navigation guidance (`USAGE_ASSISTANCE_NAVIGATION_GUIDANCE`) and the app records detailed TTS state/error information for display in the TNNA UI. Audio routing through Bluetooth/Android Auto is partly controlled by Android/car audio routing and must be road-tested separately when changed.

### 10.4 Registration, login, and persistent native session

TNNA uses the existing Wonderful Apps identity rather than a separate account system:

1. Registration uses `POST /users/register`.
2. Username/password validation and delivery of the six-digit email code use `POST /users/login`.
3. `POST /tnna/verify-code` validates the code and creates the TNNA user/device/session state.
4. The server returns an 8-hour access JWT plus a 180-day refresh token.
5. The refresh token is rotated whenever `POST /tnna/refresh` succeeds.
6. Server-side refresh-token storage is SHA-256 hash only.
7. The plaintext refresh token is encrypted on Android with AES/GCM using a key held in `AndroidKeyStore` by `TnnaAccountPlugin`.
8. A random persistent TNNA device UUID binds the saved session to the device.
9. Explicit Log Out revokes the server refresh token and clears the encrypted local token.

Passwords are never stored by TNNA.

If refresh fails because the server/network is unavailable rather than because the token was rejected with HTTP 401, `public/index.html` may continue in offline authenticated mode for up to `offlineLoginMaxDays` (currently 30 days) from the last successful online authentication. A 401 invalid/expired-token response clears the saved login and requires a new login.

### 10.5 Version/update workflow

`TNNAVersionT` is the server authority for the current native release. `GET /tnna/version` returns the current version code/name, minimum supported version, download URL, release notes, and release date.

After entering the native app, `public/index.html` compares the server `versionCode` with `TNNA_CONFIG.versionCode`. If the server version is newer, the app displays an **Update Available** box and a **Download Update** button that opens the configured download page.

For a new release, keep these values coordinated:

- `TNNA/android/app/build.gradle` -> `versionCode` and `versionName`;
- `TNNA/public/config.js` -> `version` and `versionCode`;
- `TNNAVersionT` -> current release metadata;
- published signed APK and the download page in `httpdocs/`.

Future updates must be signed with the same permanent release key. Do not test the update mechanism by uninstalling the existing app, because uninstalling destroys the in-place-update and persistent-login conditions that must be verified.

### 10.6 TNNA update-email and administration

Users may opt in to important TNNA update emails during verification or later under Account & Updates. Preference changes are recorded in `TNNAUserT` and the central consent-history system using the TNNA update consent/version data.

Administrator APIs can list TNNA users/devices/version information and send an update email to eligible opted-in users.

### 10.7 Privacy and network boundary

The backend stores TNNA account, device identifier, platform/app version, refresh-token hash, login/update preference, and version metadata. The native town-monitoring path is local; precise ride coordinates and ride history are not intentionally uploaded by the TNNA location service. Preserve this separation unless a future feature explicitly changes the privacy design.

### 10.8 Current validation baseline

As of October 9, 2026, V1.1 has been validated on both an Android 15 phone and an Android 8 phone. Testing confirmed registration/login verification, persistent login across app close and phone restart, native location monitoring, spoken town announcements, and road operation alongside Ride with GPS. The V1.1 APK was also recognized by Android as an update to V1.0.

---
## 11. Authentication and Security

- JWT tokens are used for authenticated API requests.
- Final JWTs are currently issued after successful email-code verification.
- Final JWT expiration is currently 8 hours.
- Protected frontend calls send:

```http
Authorization: Bearer <token>
```

- Passwords must be hashed with bcrypt.
- Secrets and API credentials belong in environment variables, never committed source files.
- Never log passwords, JWT tokens, API keys, database passwords, promo-code administration secrets, or other sensitive credentials.
- Always enforce `UserID` ownership in routes that read or modify user-specific data.
- Validate user-controlled input before SQL execution.
- Use parameterized SQL; do not concatenate untrusted input into queries.
- Preserve current CORS restrictions unless a deployment change requires an intentional update.
- Subscription checks do not replace ownership/authorization checks inside an application.
- Frontend sanitization is a defense-in-depth control and must not be treated as a replacement for backend validation, authorization, ownership checks, subscription access checks, or parameterized SQL.

### Frontend input sanitization requirement

WA uses a shared client-side sanitization layer for pages that accept reusable free-text input.

The shared frontend sanitizer is:

```text
httpdocs/js/inputSanitizer.js
```

Applicable HTML pages load DOMPurify together with the shared sanitizer and sanitize reusable user-controlled free-text values before normal save/submission processing.

Rules:

- Sanitize reusable free-text input such as names, descriptions, notes, addresses, usernames, email addresses, telephone numbers, URLs, and textarea content where applicable.
- Treat sanitized values as **plain text** unless a feature intentionally supports HTML.
- Do not sanitize password fields. Password values must remain byte-for-byte as entered.
- Numeric, date, checkbox, and other strongly typed fields do not need generic text sanitization merely for consistency.
- Static pages and pages that do not accept reusable user-controlled free text do not need the shared sanitizer.
- Preserve page-specific validation rules in addition to shared sanitization.

### Safe output rendering requirement

User-controlled, database-derived, and external-API text must not be inserted into executable HTML without safe handling.

Preferred order:

1. Use DOM methods and assign untrusted/plain-text values with `textContent`.
2. Where existing markup requires template-generated HTML, escape every untrusted value before assigning markup through `innerHTML`.
3. Use DOMPurify when actual HTML rendering is intentionally required.
4. Constrain dynamically assigned URL-bearing attributes such as `src` and `href`.

Do not place raw user, database, or API strings directly inside `innerHTML`, `outerHTML`, `insertAdjacentHTML`, or `document.write`.

### Native-app / WebView security continuity

These frontend security requirements remain in force if WA is packaged as a PWA, Cordova/Capacitor application, WebView-based application, or similar native/mobile wrapper.

---

## 12. Transactions and Database Access

Use the existing database helpers and patterns in the project.

For operations that must succeed or fail as one unit, use a transaction. Examples include:

- Promo-code redemption
- Parent + child inserts
- Multi-table Budget operations
- Multi-table Family Tree changes
- Family Tree merge/archive/move operations
- Weight entries with activity mappings

Do not partially commit a multi-step operation that would leave inconsistent data.

---

## 13. Frontend Standards

### HTML pretty-formatting requirement

**All HTML files must use pretty formatting.**

When creating or modifying an `.html` file:

- Use consistent indentation throughout the entire file.
- Prefer **2 spaces** per indentation level unless the file already has another consistent project convention.
- Put nested elements on separate, logically readable lines.
- Indent child elements under their parent elements.
- Keep attributes readable; wrap unusually long attribute sets when useful.
- Format embedded `<style>` and `<script>` blocks so CSS and JavaScript are readable.
- Do **not** minify HTML, CSS, or JavaScript in source files.
- Do **not** collapse a page into long single-line markup.
- After editing an HTML file, format the **whole file**, not just the newly inserted section.
- Preserve behavior while formatting; pretty formatting must not change IDs, names, event bindings, URLs, form fields, or JavaScript behavior.

Readable source is a project requirement.

### Light-mode browser compatibility requirement

WonderfulApps currently uses an intentionally **light visual design**.

Every HTML page should include:

```html
<meta name="color-scheme" content="only light">
```

and CSS:

```css
:root {
  color-scheme: only light;
}
```

These declarations prevent browser-generated dark-mode recoloring from changing WA's intended colors.

### Frontend conventions

- Preserve the visual design of a page unless a redesign is requested.
- Reuse existing WA header, navigation, button, panel, and footer patterns where practical.
- Use `window.location.origin` or the project's existing base-URL pattern rather than hard-coding a deployment host unless required.
- Keep authenticated API calls consistent with the existing token mechanism.
- Subscription-aware pages should obtain current access from the server rather than duplicating plan logic independently in every page.
- UI-disabled buttons are a convenience only; the backend must remain authoritative.
- Validate important input in the frontend for usability, but treat backend validation as authoritative.
- Keep page names and capitalization consistent with existing links.

---

## 14. Backend Coding Standards

- Follow the existing route/module style before introducing a new pattern.
- Use `async/await`.
- Use parameterized `mysql2` queries.
- Validate request parameters and body values.
- Return suitable HTTP status codes.
- Keep error handling consistent with the project.
- Use transactions for multi-step database mutations.
- Avoid duplicating utilities already provided by shared modules.
- Keep routes user-scoped where the underlying records are user-owned.
- Do not bypass `requireAppAccess()` for subscription-controlled application routes.
- When adding a subscription-controlled application, update the database app catalog and server-side route mapping together.
- Update `server.js` when adding a new route module.
- Update `wappsDump.sql` after intentional schema changes.
- Update `CLAUDE.md` and `TechSummary.md` when architecture or standards change.

---

## 15. Current Package Baseline

Current `package.json` identifies WonderfulApps version `1.0.0`.

Important installed dependencies include:

| Package | Current package.json value |
|---|---:|
| Express | `^5.1.0` |
| mysql2 | `^3.14.1` |
| jsonwebtoken | `^9.0.2` |
| bcrypt | `^6.0.0` |
| express-validator | `^7.2.1` |
| cors | `^2.8.5` |
| dotenv | `^16.5.0` |
| axios | `^1.13.5` |
| multer | `^2.0.1` |
| winston | `^3.17.0` |
| morgan | `^1.10.0` |
| resend | `^6.4.2` |
| sharp | `0.33.5` |
| yahoo-finance2 | `^2.13.4` |
| @aws-sdk/client-s3 | `3.750.0` |

Do not rely on older documentation for dependency versions; check `package.json`.

---

## 16. File Structure – High-Level

```text
wonderfulApp/
├── server.js
├── dbConnection.js
├── utils.js
├── logger.js
├── morgan.js
├── send_email.js
├── r2Storage.js
├── package.json
├── package-lock.json
├── wappsDump.sql
├── subscription_schema.sql
├── CLAUDE.md
├── TechSummary.md
├── routes/
│   ├── activities.js
│   ├── budget.js
│   ├── etf.js
│   ├── familyTree.js
│   ├── notifications.js
│   ├── geocode.js
│   ├── interestEarned.js
│   ├── subscriptions.js
│   ├── track.js
│   ├── users.js
│   ├── weightActivities.js
│   └── weights.js
├── services/
│   ├── notificationService.js
│   └── subscriptionService.js
├── middleware/
│   ├── auth.js
│   ├── handleValidationErrors.js
│   └── subscriptionAccess.js
├── httpdocs/
│   ├── home.html
│   ├── login.html
│   ├── register.html
│   ├── subscription.html
│   ├── SubControl.html
│   ├── track.html
│   ├── FTAncestor.html
│   ├── FTPerson.html
│   └── js/
│       ├── inputSanitizer.js
│       ├── FTPerson.js
│       └── FTOneTreeMerge.js
├── TNNA/
│   ├── public/
│   │   ├── config.js
│   │   └── index.html
│   └── android/
├── docs/
├── logs/
└── skills/
```

This is a high-level guide, not an exhaustive file listing.

---

## 17. Change Procedure

Before changing an existing feature:

1. Read the current frontend file.
2. Read its backend route(s).
3. Check the exact current table and column names in `wappsDump.sql`.
4. If subscription-controlled, identify the correct `AppT.AppKey` and current minimum plan.
5. Check `UserID` ownership rules.
6. Check backend validation and transaction boundaries.
7. Check frontend sanitization and safe-output behavior.
8. Check whether the change affects Family Tree relationship integrity, including `FTSiblingT`.
9. Preserve MySQL 5.5 compatibility.
10. Preserve pretty formatting across any edited HTML file.
11. Preserve the `only light` color-scheme declarations.
12. Test both an allowed and denied subscription path when subscription logic is involved.
13. Test merge/archive behavior when Family Tree relationship structures are involved.
14. Update `wappsDump.sql` for intentional schema changes.
15. When TNNA changes, keep Android `versionCode`/`versionName`, `TNNA_CONFIG`, `TNNAVersionT`, APK signing, and download metadata coordinated.
16. Re-test Android 8 compatibility for native location-service changes.
17. Update `CLAUDE.md` and `TechSummary.md` for architectural changes.

---

## 18. Important “Do Not” Rules

- Do not design from an old schema when `wappsDump.sql` is available.
- Do not rename or remove fields without tracing all consumers.
- Do not assume frontend-disabled controls enforce subscription security.
- Do not hard-code entitlement expiration dates into pages.
- Do not silently reset a user's development entitlement on later logins.
- Do not create payment-provider functionality unless specifically requested.
- Do not collapse the Budget schema into a generic replacement table.
- Do not treat explicit Family Tree siblings as if they can always be reconstructed from known parents.
- Do not lose `FTSiblingT` relationships during Family Tree merge/move/archive work.
- Do not treat `FTFamilyTreeUserT.IsActive` as the sole authorization test for every Tree membership.
- Do not make `ENTER FAMILY CODE`, Person List navigation, or person viewing perform an implicit One Tree Merge.
- Do not overwrite a base `UserSubscriptionT` entitlement when the intended action is a temporary administrator grant.
- Do not insert raw untrusted strings into executable HTML.
- Do not sanitize passwords.
- Do not remove the light-mode compatibility declarations.
- Do not minify source HTML.
- Do not commit secrets.
- Do not weaken `UserID` ownership controls.
- Do not modify unrelated functionality while completing a focused task.
- Do not store TNNA passwords or plaintext refresh tokens in MySQL, JavaScript storage, logs, or source files.
- Do not remove Android 8 `LocationListener` compatibility callbacks without device testing.
- Do not change the TNNA application ID or release signing key for an ordinary version update.
- Do not send TNNA GPS coordinates or ride history to the server unless a separately approved feature explicitly requires it.

## 19. Instructions for Budget global Description dropdown values

- Budget global Description dropdown values are controlled by BudgetDescriptionT. Before changing global Budget descriptions, review docs/ BudgetDescription_Global_List.sql. Do not hard-code global Description values in HTML forms.

## 20. HTML Formatting Standard

- All new or revised HTML files must be saved in readable, pretty-formatted form. Do not minify or compact HTML, CSS, or inline JavaScript. Formatting changes must preserve existing functionality, IDs, classes, event handlers, script references, and page structure.

---

*End of CLAUDE.md*
