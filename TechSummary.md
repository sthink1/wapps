# TechSummary.md – WonderfulApps Architecture & Technical Summary

**Last updated:** September 19, 2026  
**Project:** WonderfulApps (WA)  
**Database reference:** `wappsDump.sql`

---

## Executive Summary

WonderfulApps is a Node.js/Express web application and PWA containing multiple functional applications behind a shared user, authentication, and subscription system.

The current system includes:

- Weight and activity tracking
- Interest earned records/calculations
- ETF research and tracking
- Usage analytics
- Property/geolocation tools
- Amortization and utility pages
- Contact/email functionality
- **A multi-table Budget application**
- **A multi-table Family Tree application**
- **A hierarchical Subscription / Entitlement system**
- **A centralized Notification / Consent system**
- **Family Tree One Tree Merge with snapshot-based Undo One Tree Merge**

The current `wappsDump.sql` contains **53 tables**, including:

- **7 subscription / entitlement tables**
- **6 notification / consent tables**
- **13 Budget tables**
- **16 Family Tree tables**

The current Family Tree implementation includes explicit `FTSiblingT` relationships and snapshot-based One Tree Merge history/Undo support through `FTTreeMergeT` and extended `FTPersonMergeT` records.

The frontend follows project-wide standards for:

- reusable free-text input sanitization;
- safe rendering of user-, database-, and API-derived output;
- safe dynamic URL handling;
- light-mode browser compatibility;
- readable, pretty-formatted HTML;
- continuity of those controls in future PWA/native/WebView packaging.

---

## 1. Technology Stack

### Frontend

- HTML5
- CSS
- Vanilla JavaScript
- PWA service worker and manifest
- Browser `localStorage` for client-side state such as authentication tokens where currently used
- DOMPurify-backed client-side sanitization on applicable pages
- Shared sanitization helper: `httpdocs/js/inputSanitizer.js`

### Backend

- Node.js
- Express `^5.1.0`
- `mysql2` `^3.14.1`
- `express-validator` `^7.2.1`
- JWT authentication via `jsonwebtoken` `^9.0.2`
- bcrypt `^6.0.0`
- Multer `^2.0.1`
- Morgan `^1.10.0`
- Winston `^3.17.0`

### Supporting services/libraries

- Axios `^1.13.5`
- Resend `^6.4.2`
- Yahoo Finance 2 `^2.13.4`
- AWS S3 SDK `3.750.0`
- S3 request presigner `3.750.0`
- Sharp `0.33.5`
- Dotenv `^16.5.0`

### Database

- MySQL
- Current SQL dump generated from MySQL **5.5.62**
- Schema uses InnoDB and `utf8mb4`
- Application SQL must remain compatible with the deployed database unless an intentional migration occurs

---

## 2. High-Level Architecture

```text
Browser / PWA / future WebView-native wrapper
    |
    | HTML + CSS + JavaScript
    | input sanitization + safe output rendering
    | subscription-aware UI
    | JSON / multipart HTTP requests
    | Authorization: Bearer <JWT>
    v
Express server (server.js)
    |
    +-- authentication / subscription middleware
    |     +-- authenticateToken()
    |     +-- requireAppAccess(appKey)
    |
    +-- routes/
    |     +-- users
    |     +-- subscriptions
    |     +-- notifications
    |     +-- weights
    |     +-- activities
    |     +-- weightActivities
    |     +-- interestEarned
    |     +-- etf
    |     +-- budget
    |     +-- familyTree
    |     +-- track
    |     +-- geocode
    |
    +-- services/
    |     +-- notificationService.js
    |     +-- subscriptionService.js
    |
    +-- shared utilities / database helpers
    |
    v
MySQL
    |
    +-- 53 current tables

Family Tree image/file workflow may also use:
Express -> r2Storage.js -> S3-compatible object storage
```

Frontend controls are defense-in-depth only. Backend authentication, authorization, ownership enforcement, subscription enforcement, validation, and parameterized SQL remain authoritative.

---

## 3. Server Routing and Access Enforcement

Current `server.js` mounts:

| API prefix | Module | Access model |
|---|---|---|
| `/users` | `routes/users.js` | Registration/login/verification |
| `/subscriptions` | `routes/subscriptions.js` | Authenticated subscription functions |
| `/notifications` | `routes/notifications.js` | Preferences plus public token unsubscribe flow |
| `/track` | `routes/track.js` | Existing general usage tracking |
| `/weights` | `routes/weights.js` | JWT + `weigh_in` |
| `/activities` | `routes/activities.js` | JWT + `weigh_in` |
| `/weightActivities` | `routes/weightActivities.js` | JWT + `weigh_in` |
| `/interestEarned` | `routes/interestEarned.js` | JWT + `interest_earned` |
| `/budget` | `routes/budget.js` | JWT + `budget` |
| `/familytree` | `routes/familyTree.js` | JWT + `family_tree` |
| `/etf` | `routes/etf.js` | JWT + `etf_investing` |
| `/api/geocode` | `routes/geocode.js` | Current existing route behavior |

`POST /send-email` is defined directly in `server.js`.

The root `/` serves `httpdocs/home.html`.

HTML responses are configured for revalidation (`no-cache`) so frontend development changes are not hidden by ordinary static caching.

### Subscription API endpoints

```text
GET  /subscriptions/status
GET  /subscriptions/access/:appKey
POST /subscriptions/promo
POST /subscriptions/usage
```

All subscription API endpoints pass through `authenticateToken()`.

---

## 4. Database Inventory

The current database authority is `wappsDump.sql`.

### 4.1 Core user/system (4)

```text
UsersT
LoginVerificationT
UserSequenceT
TrackUsageT
```

### 4.2 Subscription / entitlement (7)

```text
AppT
PromoCodeT
PromoRedemptionT
SubscriptionPlanT
SystemSettingsT
UserSubscriptionT
UserUsageT
```

### 4.3 Notification / consent (6)

```text
ConsentTextVersionsT
NotificationConsentHistoryT
NotificationHistoryT
NotificationPreferencesT
NotificationSuppressionT
UserAgreementHistoryT
```

### 4.4 Weight and activity (3)

```text
WeightsT
ActivitiesT
WeightActivitiesT
```

### 4.5 Interest (1)

```text
InterestEarnedT
```

### 4.6 ETF (3)

```text
etfActivityT
etfCategoryT
etfSymbolT
```

### 4.7 Budget (13)

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

### 4.8 Family Tree (16)

```text
FamilyTreeT
FTContactT
FTEventPersonT
FTEventT
FTFamilyTreeActivityT
FTFamilyTreePersonT
FTFamilyTreeUserT
FTImageT
FTNotificationT
FTParentT
FTPartnerT
FTPersonMergeT
FTPersonT
FTRecordArchiveT
FTSiblingT
FTTreeMergeT
```

**Total current tables: 53**

`wappsDump.sql` already includes the current notification/consent and Undo One Tree Merge schema changes. Historical implementation or migration dumps are not the current schema authority.

---

## 5. Database Relationship Strategy

The SQL dump contains database-enforced foreign keys for many core, subscription, Budget, ETF, login, tracking, weight, and activity relationships.

Important patterns include:

- Many user-owned tables reference `UsersT.UserID`.
- Most such relationships use `ON DELETE CASCADE`.
- `WeightActivitiesT` links `WeightsT` and `ActivitiesT`.
- Budget recurrence day tables reference `BudgetRecurrenceT`.
- Subscription app definitions reference minimum plans.
- User subscriptions reference users, plans, and optionally promo codes.
- Promo-redemption records link users to promo codes.
- Subscription usage can link usage rows to `AppT`.
- `UserSequenceT` is deleted with its owning user.

The Family Tree schema contains both database-enforced and application-managed relationship rules. Application code must not assume the database alone enforces all Family Tree integrity.

---

## 6. Subscription / Entitlement Subsystem

### 6.1 Purpose

The subscription layer controls whether an authenticated user may use a particular WA application.

The server is authoritative. Frontend button state is only a convenience.

### 6.2 Hierarchical plans

`SubscriptionPlanT` currently defines:

| PlanName | PlanLevel |
|---|---:|
| Standard | 1 |
| Premium | 2 |
| Platinum | 3 |
| Diamond | 4 |

Access is cumulative by level: a higher plan satisfies a lower application's minimum-plan requirement.

### 6.3 Application catalog

`AppT` stores:

```text
AppID
AppKey
AppName
MinimumPlanID
CostCategory
Active
DevelopmentAvailable
```

Current seeded applications are:

| AppKey | Name | Minimum plan | Category | Development |
|---|---|---|---|---|
| `loan_payment` | Loan Payment | Standard | A | Available |
| `property_info` | Property Info | Standard | A | Available |
| `town_notice` | Town Notice | Standard | A | Available |
| `weigh_in` | Weigh In | Premium | B | Available |
| `interest_earned` | Interest Earned | Premium | B | Available |
| `budget` | My Money My Budget | Premium | B | Available |
| `family_tree` | Family Tree | Platinum | C | Available |
| `etf_investing` | ETF Investing | Diamond | D | Not available during current development mode |

### 6.4 Development entitlement lifecycle

After credentials are accepted, WA still requires email verification.

On successful `/users/verify-code`:

```text
verify code
    |
    v
getOrCreateDevelopmentTrial(UserID)
    |
    +-- existing subscription? -> preserve it
    |
    +-- no subscription?
           |
           +-- AllowNewDevelopmentTrials = 1
                   |
                   +-- create Platinum DEVELOPMENT_TRIAL
                   +-- duration = DevelopmentTrialDays
    |
    v
issue final JWT (8 hours)
    |
    +-- newly created or expired -> subscription.html
    +-- active returning user -> home.html
```

Current development settings are stored in `SystemSettingsT`:

```text
DevelopmentMode
AllowNewDevelopmentTrials
DevelopmentTrialDays
DevelopmentEntitlementEndDate
```

`DevelopmentEntitlementEndDate`, when populated, can shorten all `DEVELOPMENT_TRIAL` entitlements to a common development cutoff.

Project rule:

> After development, all free development entitlements expire.

### 6.5 Subscription status calculation

`services/subscriptionService.js` contains the subscription business logic.

Key functions include:

```text
getCurrentSubscription()
getEffectiveEndDate()
buildSubscriptionStatus()
getOrCreateDevelopmentTrial()
getAppAccess()
getStatusWithApps()
redeemPromoCode()
recordUsage()
```

An application may be denied because of:

```text
APP_NOT_CONFIGURED
APP_INACTIVE
NOT_AVAILABLE_DURING_DEVELOPMENT
SUBSCRIPTION_EXPIRED
PLAN_TOO_LOW
```

### 6.6 Promo-code system

`PromoCodeT` contains the promo definition, including:

```text
StartDate
EndDate
Active
MaxUses
Uses
```

`PromoRedemptionT` prevents a user from redeeming the same promo more than once.

`redeemPromoCode()` executes within a database transaction and:

1. locks/reads the promo;
2. validates date, active state, and use limit;
3. checks prior use by the same user;
4. creates or improves the user's entitlement;
5. inserts the redemption row;
6. increments `PromoCodeT.Uses`;
7. commits all changes together.

A promo may extend the end date or increase plan level, but should not downgrade a user's existing access.

### 6.7 Admin override

`middleware/subscriptionAccess.js` currently recognizes an administrator when:

- `UserID === 1`, or
- the JWT username matches configured `ADMIN_USERNAME`.

The admin override reports Diamond-equivalent access for subscription evaluation.

### 6.8 Subscription usage

`UserUsageT` stores subscription-related events.

Allowed event types currently include:

```text
APP_OPEN
RECORD_CREATE
RECORD_UPDATE
API_CALL
EMAIL_SENT
FILE_UPLOAD
```

`UserUsageT` is separate from the pre-existing `TrackUsageT`. Their purposes should remain distinct unless a deliberate redesign is made.

### 6.9 Payment state

Payment processing is not yet implemented. The subscription UI explicitly indicates that payment subscriptions will be available later.

There is currently no production payment-provider workflow.

---

## 7. Notification / Consent Subsystem

The centralized notification system is implemented by `routes/notifications.js`, `services/notificationService.js`, registration logic in `routes/users.js`, and notification-aware application code such as Family Tree.

### 7.1 Categories and preference model

Current categories are:

```text
ACCOUNT
SUBSCRIPTION
APP_NOTICE
FAMILY_TREE
MARKETING
```

`ACCOUNT` and `SUBSCRIPTION` are required categories. `MARKETING`, `APP_NOTICE`, and `FAMILY_TREE` are optional categories governed by preference/suppression rules.

`NotificationPreferencesT` stores the current user settings for marketing email, marketing SMS, Family Tree email, and application-notice email.

### 7.2 Consent and agreements

Registration requires Terms of Use and Privacy Policy acceptance and records explicit marketing email/SMS choices. Versioned consent text is stored in `ConsentTextVersionsT`; notification consent actions are retained in `NotificationConsentHistoryT`; Terms/Privacy acceptance history is stored in `UserAgreementHistoryT`.

The current registration route continues to require `Phone1`.

### 7.3 Delivery history and suppression

`NotificationHistoryT` records central notification attempts, outcomes, unsubscribe tokens, and failure details. `NotificationSuppressionT` stores destination/category/channel suppressions so opt-out state can persist independently of a specific delivery.

`routes/notifications.js` exposes:

```text
GET  /notifications/preferences
PUT  /notifications/preferences
GET  /notifications/unsubscribe/:token
POST /notifications/unsubscribe/:token
```

The preference routes require authentication. The token unsubscribe routes are public by design.

`PUBLIC_BASE_URL` is used to build public links. Production and local test environments must use the correct origin.

### 7.4 Family Tree integration

Family Tree edit/delete notices use the central notification service while `FTNotificationT` continues to hold Family Tree-specific notification records. This keeps application-level audit information while honoring the centralized preference/suppression model.

---

## 8. Budget Subsystem

The Budget application is a first-class WA module.

### Main data domains

- `BudgetMyMoneyT` – money/account records
- `BudgetMyInvestmentT` – investment records
- `BudgetInT` – income
- `BudgetOutT` – outgoing items
- `BudgetDescriptionT` – descriptions/categories
- `BudgetRecurrenceT` – recurrence definition
- `BudgetRecurrenceWeeklyDayT` – selected weekdays
- `BudgetRecurrenceMonthlyDayT` – selected monthly days
- `BudgetLoanT` – loans
- `BudgetCardT` – credit/debit card records
- `BudgetLeaseRentT` – lease/rent records
- `BudgetSubscriptionT` – subscriptions
- `BudgetEstimateAllowanceT` – estimated allowances

Architectural notes:

- Budget data is user-scoped.
- Many Budget tables cascade when the owning user is deleted.
- Recurrence is normalized into dedicated recurrence tables.
- Credit-card handling has dedicated statement, due-date, minimum-payment, and alternative-payment fields.
- The Budget API is now guarded by the `budget` subscription app key.

---

## 9. Family Tree Subsystem

The Family Tree application is a first-class WA module with a large dedicated backend route module.

### Main data domains

- `FamilyTreeT` – tree-level records
- `FTPersonT` – people
- `FTFamilyTreePersonT` – people associated with a tree
- `FTFamilyTreeUserT` – users associated with a tree
- `FTParentT` – parent relationships
- `FTPartnerT` – partner relationships
- `FTSiblingT` – explicit sibling relationships
- `FTEventT` – events
- `FTEventPersonT` – people associated with events
- `FTContactT` – contact records
- `FTImageT` – image metadata
- `FTNotificationT` – notifications
- `FTFamilyTreeActivityT` – activity/audit-style data
- `FTPersonMergeT` – person-merge data
- `FTRecordArchiveT` – archived records

### One Tree Merge and Undo One Tree Merge

The One Tree Method can consolidate a newer/source Tree into an older/surviving Tree. The current implementation records a Tree-level merge event in `FTTreeMergeT` and can link person-level merge history through `FTPersonMergeT.TreeMergeID`.

`FTTreeMergeT` records:

```text
TreeMergeID
SourceFamilyTreeID
SurvivingFamilyTreeID
MergedByUserID
MergedAt
Status
BridgeJSON
DecisionsJSON
MergeSnapshot
CreatedR2KeysJSON
UndoneByUserID
UndoneAt
UndoNote
```

Undo-related person merge data in `FTPersonMergeT` includes `TreeMergeID`, the source and surviving person snapshots, the surviving-person post-merge snapshot, and undo audit fields.

Current backend endpoints are:

```text
GET  /familytree/one-tree/undo-options
GET  /familytree/one-tree/undo-review/:treeMergeID
POST /familytree/one-tree/undo
```

The undo operation is snapshot-based and transactional. Its purpose is to structurally reverse a recorded One Tree Merge: reactivate the source Tree, return source memberships/relationships to it, keep the older surviving Tree intact, and preserve the merge/undo audit history.

The current implementation also includes the MySQL-5.5-compatible `moveComponentToTree()` membership-copy fix that avoids the earlier ambiguous `OriginFamilyTreeID` self-insert/update form.

A September 2026 end-to-end test successfully merged a seven-person newer Tree into an older Tree and then restored the newer Tree through Undo; the seven people were present in the restored Tree and absent from the older Tree afterward.

### Explicit sibling relationships

`FTSiblingT` adds a first-class explicit sibling relationship:

```text
SiblingRelationshipID
FamilyTreeID
PersonID
SiblingPersonID
Notes
CreatedByUserID
CreatedAt
UpdatedByUserID
UpdatedAt
```

The unique relationship key is based on:

```text
FamilyTreeID + PersonID + SiblingPersonID
```

Application code normalizes sibling IDs so one logical sibling pair is stored consistently.

Family Tree relationship calculations can determine biological siblings from either:

1. a shared recorded biological parent; or
2. an explicit `FTSiblingT` relationship.

This permits sibling information to be entered before parents are known.

Merge/move logic in `routes/familyTree.js` now carries sibling relationships with the other Family Tree relational data. Code that moves, merges, archives, deletes, or remaps people must account for `FTSiblingT`.

### Other architectural notes

- Relationship integrity often depends on route logic in addition to SQL constraints.
- Merge and archive features are data-integrity-sensitive operations.
- Image/profile upload requests use Family Tree-specific multipart handling.
- `r2Storage.js`, AWS S3-compatible libraries, presigned URLs, and `sharp` support image/file workflows.
- Family Tree HTML pages and companion `FT*.js` rendering modules must follow the same sanitization and safe-output standards as the rest of WA.
- The Family Tree API is now guarded by the `family_tree` subscription app key.

---

## 10. Authentication and Frontend Security

Typical authenticated flow:

```text
User login
   |
   v
POST /users/login
   |
   +-- validate credentials
   +-- bcrypt comparison
   +-- send email verification code
   v
POST /users/verify-code
   |
   +-- verify code
   +-- create development entitlement once, if eligible
   +-- issue JWT (8h)
   +-- return redirect destination
   v
Browser stores token
   |
   v
Protected request
Authorization: Bearer <token>
   |
   +-- authenticateToken
   +-- requireAppAccess(appKey), when applicable
   +-- route-specific ownership / validation
   v
Database operation
```

Security requirements:

- Passwords are never stored in plaintext.
- JWT secrets and other credentials remain in environment variables.
- User-owned queries must be filtered/validated by `UserID`.
- Subscription access does not replace ownership checks.
- SQL must be parameterized.
- Sensitive values must not be written to logs.
- File/image access must respect Family Tree/user authorization rules.
- Frontend controls supplement but do not replace backend security.

### Input sanitization

Applicable WA pages use DOMPurify and:

```text
httpdocs/js/inputSanitizer.js
```

Sanitize reusable free-text values where applicable. Do not sanitize passwords.

### Safe output rendering

Treat data as potentially untrusted when it originates from:

- user input;
- the database;
- backend/API responses;
- third-party/external APIs.

Prefer:

```text
plain text -> DOM element -> textContent
```

If structured markup is necessary, escape or sanitize untrusted interpolated values.

Raw untrusted values must not be inserted directly into:

```text
innerHTML
outerHTML
insertAdjacentHTML
document.write
```

Dynamic `src` and `href` values must also be constrained or validated.

---

## 11. Request Processing

A subscription-controlled API request follows:

```text
Browser / PWA / native WebView
  -> frontend input sanitization where applicable
  -> CORS
  -> body parsing / multipart handling
  -> authenticateToken
  -> requireAppAccess(appKey)
  -> route-specific authorization and validation
  -> database operation / transaction
  -> JSON response
  -> safe frontend rendering
  -> logging/error handling
```

Family Tree multipart uploads remain a special case: `server.js` bypasses the general no-file multipart parser for matching `/familytree/` multipart requests so the Family Tree route can use its own upload middleware.

---

## 12. Transaction Guidance

Transactions should be used whenever multiple writes form one logical operation.

Important examples include:

- Promo-code redemption
- Weight plus activity-link inserts
- Budget parent/recurrence/detail changes
- Family Tree person/relationship changes
- Family Tree sibling/parent/partner migration during merges
- Merge operations
- Archive operations
- Multi-table deletes

The transaction boundary should cover the complete logical unit of work.

---

## 13. HTML / Frontend Source Standard

### Pretty formatting is mandatory

All `.html` files in WonderfulApps must remain **pretty formatted and human-readable**.

Required standard:

- Consistent indentation throughout the file
- Prefer 2 spaces per nesting level unless an existing page uses another consistent convention
- Nested HTML tags on readable separate lines
- Correct indentation of child elements
- Readable attribute layout
- Properly formatted embedded CSS
- Properly formatted embedded JavaScript
- No minified source HTML/CSS/JavaScript
- No long single-line page markup
- When an HTML page is edited, format the whole file before completion

Formatting must never change element IDs, `name` attributes, route URLs, script behavior, event bindings, payload names, or selectors used by JavaScript.

### Light-mode compatibility

Every WA HTML page should retain:

```html
<meta name="color-scheme" content="only light">
```

and:

```css
:root {
  color-scheme: only light;
}
```

This prevents browser-generated dark-mode recoloring from altering the intended design.

---

## 14. Frontend Design and API Contract

- Preserve existing page appearance unless redesign is requested.
- Use current WA navigation/header/footer patterns where practical.
- Preserve exact API parameter names and expected response shapes.
- Use the current JWT mechanism for authenticated calls.
- Subscription-aware pages should call the subscription API rather than independently re-implementing plan logic.
- Disabled frontend controls do not replace backend entitlement checks.
- Maintain safe rendering for subscription plan names, app names, promo responses, and other database-derived content.
- Maintain page-name capitalization used by existing links.

---

## 15. Current Package Baseline

Current `package.json` identifies WonderfulApps version `1.0.0`.

Important dependencies include:

| Package | Version expression |
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

Check `package.json` before changing dependency assumptions.

---

## 16. Deployment and Environment

Current CORS origins in `server.js` include:

```text
http://localhost
http://localhost:8080
https://wapps.helioho.st
https://wapps-ypez.onrender.com
```

Environment configuration should continue to hold secrets and deployment-specific values such as:

- database credentials;
- `JWT_SECRET`;
- `ADMIN_USERNAME`;
- Resend/API credentials;
- object-storage credentials;
- other third-party service credentials.

Do not move secrets into frontend JavaScript or committed source files.

Subscription plan definitions and development-entitlement controls belong in the database, not `.env`, unless a future redesign explicitly changes that model.

---

## 17. Static Files and Caching

`server.js` serves `httpdocs/` as static content.

Current behavior includes:

- ordinary static assets may be cached;
- HTML files use `Cache-Control: no-cache`;
- service-worker content is served in a way intended to avoid stale development behavior;
- manifest content type is set appropriately.

When diagnosing apparent frontend inconsistency, distinguish:

- browser cache;
- service-worker cache;
- stale deployed file;
- stale backend deployment;
- current subscription/API state.

---

## 18. Project Structure

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
│   ├── FTAncestor.html
│   ├── FTPerson.html
│   └── js/
│       ├── inputSanitizer.js
│       ├── FTPerson.js
│       └── FTOneTreeMerge.js
├── docs/
├── logs/
└── skills/
```

This is intentionally a high-level architecture view rather than a complete inventory.

---

## 19. Development Checklist

```text
[ ] Read current source files before editing
[ ] Check exact table/column names in wappsDump.sql
[ ] Identify whether the feature is subscription-controlled
[ ] Check the correct AppT.AppKey and plan requirement
[ ] Check UserID ownership rules
[ ] Check backend validation
[ ] Use parameterized SQL
[ ] Use a transaction for multi-write operations
[ ] Preserve Family Tree sibling/parent/partner integrity where applicable
[ ] Preserve input sanitization
[ ] Preserve safe output rendering
[ ] Preserve light-mode declarations
[ ] Pretty-format the entire edited HTML file
[ ] Test allowed and denied subscription paths
[ ] Test expired entitlement behavior where relevant
[ ] Test promo-code limits/duplicate redemption when promo logic changes
[ ] Update wappsDump.sql for intentional schema changes
[ ] Update CLAUDE.md / TechSummary.md for architectural changes
```

---

## 20. Current Documentation Principles

1. Current executable code is authoritative for behavior.
2. `wappsDump.sql` is authoritative for the database schema.
3. `subscription_schema.sql` documents/creates the subscription subsystem, but does not replace the full SQL dump as database authority.
4. Subscription access is server-enforced.
5. Plan hierarchy is data-driven through `SubscriptionPlanT.PlanLevel`.
6. First-login development entitlement must only be created once.
7. Free development entitlements must be capable of ending globally after development.
8. Promo redemption is a transactional operation.
9. Family Tree sibling relationships are first-class data and must survive relationship-sensitive operations.
10. User ownership remains separate from subscription eligibility.
11. Frontend sanitization and safe rendering are mandatory defense-in-depth controls.
12. HTML source remains pretty formatted.
13. WA currently uses an intentional light visual design.
14. Native/WebView packaging must preserve the same security rules.
15. Record major architecture changes in both `CLAUDE.md` and `TechSummary.md`.

---

*End of TechSummary.md*
