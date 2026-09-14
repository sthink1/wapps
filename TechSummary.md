# TechSummary.md – WonderfulApps Architecture & Technical Summary

**Last updated:** September 14, 2026  
**Project:** WonderfulApps (WA)  
**Database reference:** `wappsDumps.sql`

---

## Executive Summary

WonderfulApps is a Node.js/Express web application and PWA containing multiple functional applications behind a shared user and authentication system.

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

The September 14, 2026 SQL dump contains **38 tables**, including **13 Budget tables** and **14 Family Tree tables**.

The frontend now also follows project-wide security standards for:

- reusable free-text input sanitization;
- safe rendering of user-, database-, and API-derived output;
- safe dynamic URL handling;
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
- Current SQL dump was generated from MySQL **5.5.62**
- Schema uses InnoDB and `utf8mb4`
- Development environments may use newer MySQL, but application SQL must remain compatible with the deployed database unless an intentional migration occurs

---

## 2. High-Level Architecture

```text
Browser / PWA / future WebView-native wrapper
    |
    | HTML + CSS + JavaScript
    | input sanitization + safe output rendering
    | JSON / multipart HTTP requests
    | Authorization: Bearer <JWT>
    v
Express server (server.js)
    |
    +-- middleware
    |     +-- CORS
    |     +-- JSON / URL-encoded parsing
    |     +-- multipart handling
    |     +-- logging
    |     +-- authentication as required by routes
    |
    +-- routes/
    |     +-- users
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
    +-- shared utilities / database helpers
    |
    v
MySQL
    |
    +-- 38 current tables

Family Tree image/file workflow may also use:
Express -> r2Storage.js -> S3-compatible object storage
```

Frontend controls are defense-in-depth only. Backend authorization, validation, ownership enforcement, and parameterized SQL remain authoritative.

---

## 3. Server Routing

Current `server.js` mounts:

| API prefix | Module | Functional area |
|---|---|---|
| `/users` | `routes/users.js` | Registration/login/user functions |
| `/weights` | `routes/weights.js` | Weight records |
| `/activities` | `routes/activities.js` | Activity definitions |
| `/weightActivities` | `routes/weightActivities.js` | Weight/activity relationships |
| `/interestEarned` | `routes/interestEarned.js` | Interest records |
| `/etf` | `routes/etf.js` | ETF features |
| `/budget` | `routes/budget.js` | Budget application |
| `/familytree` | `routes/familyTree.js` | Family Tree application |
| `/track` | `routes/track.js` | Usage analytics |
| `/api/geocode` | `routes/geocode.js` | Geocoding proxy |

`POST /send-email` is defined directly in `server.js`.

The root `/` serves `httpdocs/home.html`.

HTML responses are configured for revalidation (`no-cache`) so frontend development changes are not hidden by ordinary static caching.

---

## 4. Database Inventory

### 4.1 Core user/system (4)

| Table | General purpose |
|---|---|
| `UsersT` | User accounts |
| `LoginVerificationT` | Login/verification workflow data |
| `UserSequenceT` | Per-user sequence values |
| `TrackUsageT` | Usage/page tracking |

### 4.2 Weight and activity (3)

| Table | General purpose |
|---|---|
| `WeightsT` | Weight entries |
| `ActivitiesT` | User activities |
| `WeightActivitiesT` | Links weights to activities |

### 4.3 Interest (1)

| Table | General purpose |
|---|---|
| `InterestEarnedT` | Interest-earned data |

### 4.4 ETF (3)

```text
etfActivityT
etfCategoryT
etfSymbolT
```

### 4.5 Budget (13)

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

### 4.6 Family Tree (14)

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
```

**Total current tables: 38**

---

## 5. Database Relationship Strategy

The SQL dump contains database-enforced foreign keys for many core, Budget, ETF, login, tracking, weight, and activity relationships.

Important patterns include:

- Many user-owned tables reference `UsersT.UserID`.
- Most such relationships use `ON DELETE CASCADE`.
- `WeightActivitiesT` links `WeightsT` and `ActivitiesT`.
- Budget recurrence day tables reference `BudgetRecurrenceT`.
- ETF activity/category/symbol relationships are represented through their current keys and constraints.
- `UserSequenceT` is deleted with its owning user.

The Family Tree schema contains many logical relationship tables, but not every logical relationship is represented as a SQL foreign-key constraint in the current dump. Therefore:

> Application code must not assume the database alone enforces all Family Tree relationship integrity.

Family Tree mutations should be reviewed against `routes/familyTree.js` and the exact current schema.

---

## 6. Budget Subsystem

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

### Architectural notes

- Budget data is user-scoped.
- Many Budget tables cascade when the owning user is deleted.
- Recurrence is normalized into dedicated recurrence tables.
- The schema supports active/inactive records, dates, notes, and monetary values appropriate to each record type.
- Credit-card handling has dedicated fields for statement balance, due date, minimum payment, optional alternative payment amount, and related policy choices.
- New Budget work should extend the existing data model rather than introducing a generic replacement table.

---

## 7. Family Tree Subsystem

The Family Tree application is also a first-class WA module and currently has a large dedicated backend route module.

### Main data domains

- `FamilyTreeT` – tree-level records
- `FTPersonT` – people
- `FTFamilyTreePersonT` – people associated with a tree
- `FTFamilyTreeUserT` – users associated with a tree
- `FTParentT` – parent relationships
- `FTPartnerT` – partner relationships
- `FTEventT` – events
- `FTEventPersonT` – people associated with events
- `FTContactT` – contact records
- `FTImageT` – image metadata
- `FTNotificationT` – notifications
- `FTFamilyTreeActivityT` – activity/audit-style data
- `FTPersonMergeT` – person-merge data
- `FTRecordArchiveT` – archived records

### Architectural notes

- Family Tree operations are more relationally complex than the original WA modules.
- Relationship integrity often depends on route logic in addition to SQL constraints.
- Merge and archive features should be treated as data-integrity-sensitive operations.
- Image/profile upload requests use Family Tree-specific multipart handling.
- `r2Storage.js`, AWS S3-compatible libraries, presigned URLs, and `sharp` are present in the current project and support file/image workflows.
- Family Tree HTML pages and their companion `httpdocs/js/FT*.js` rendering modules must follow the same sanitization and safe-output standards as the rest of WA.

---

## 8. Authentication and Frontend Security

Typical authenticated flow:

```text
User login
   |
   v
POST /users/login
   |
   +-- validate credentials
   +-- compare password using bcrypt
   +-- issue JWT
   |
   v
Browser stores token
   |
   v
Protected request
Authorization: Bearer <token>
   |
   v
Auth middleware / route authorization
   |
   +-- establish UserID
   +-- enforce ownership
   v
Database operation
```

Security requirements:

- Passwords are never stored in plaintext.
- JWT secrets and other credentials remain in environment variables.
- User-owned queries must be filtered/validated by `UserID`.
- SQL must be parameterized.
- Sensitive values must not be written to logs.
- File/image access must respect the corresponding Family Tree/user authorization rules.
- Frontend controls supplement but do not replace backend security.

### 8.1 Input sanitization standard

Applicable WA pages use DOMPurify and the shared:

```text
httpdocs/js/inputSanitizer.js
```

The shared sanitizer protects reusable free-text fields before normal save/submission behavior.

Current standard:

- sanitize reusable free-text values such as names, descriptions, notes, addresses, usernames, email addresses, telephone numbers, URLs, and textarea content where applicable;
- treat sanitized user text as plain text unless HTML support is an intentional feature;
- do **not** sanitize passwords;
- do not add the generic sanitizer merely to numeric/date/checkbox fields;
- retain page-specific validation;
- keep backend validation authoritative.

This project-wide sanitization change was tested successfully on September 14, 2026. HTML-like input such as `<H1>` was blocked in protected fields during testing.

### 8.2 Safe output rendering standard

Output safety is a separate requirement from input sanitization.

Data must be treated as potentially untrusted when it originates from:

- user input;
- the database;
- backend/API responses;
- third-party/external APIs.

Preferred rendering strategy:

```text
plain text -> DOM element -> textContent
```

When structured markup is required:

- construct DOM elements directly where practical;
- otherwise escape all untrusted interpolated values before assigning template-generated markup through `innerHTML`;
- use DOMPurify when actual HTML rendering is intentionally supported.

Raw untrusted values must not be inserted directly into:

```text
innerHTML
outerHTML
insertAdjacentHTML
document.write
```

Dynamic URL-bearing attributes such as:

```text
src
href
```

must also be constrained or validated rather than blindly trusted.

The September 14, 2026 safe-output review covered the current WA HTML set plus companion frontend JavaScript, including Family Tree modules where rendering occurs outside the HTML shell. The resulting revised files were tested successfully and performed as expected.

### 8.3 Native/WebView continuity

These protections are part of WA's native-app readiness.

If WA is packaged using Cordova, Capacitor, an embedded WebView, or another HTML/JavaScript native wrapper, retain:

- input sanitization;
- safe output rendering;
- URL validation/constraint;
- backend validation;
- authorization and ownership enforcement;
- parameterized SQL.

A native wrapper does not remove browser-style injection risk from HTML/JavaScript code.

---

## 9. Request Processing

A typical API request follows:

```text
Browser / PWA / native WebView
  -> frontend input sanitization where applicable
  -> CORS
  -> body parsing
  -> multipart parsing when applicable
  -> route
  -> authentication/authorization
  -> validation
  -> database operation / transaction
  -> JSON response
  -> safe frontend output rendering
  -> logging/error handling
```

Family Tree multipart uploads are a special case: `server.js` bypasses the general no-file multipart parser for matching `/familytree/` multipart requests so the Family Tree route can use its own upload middleware.

---

## 10. Transaction Guidance

Transactions should be used whenever multiple writes form one logical operation.

Important candidates include:

- Weight plus activity-link inserts
- Budget parent/recurrence/detail changes
- Family Tree person/relationship changes
- Merge operations
- Archive operations
- Multi-table deletes
- Any operation where a partial write would create inconsistent state

The transaction boundary should cover the complete logical unit of work.

---

## 11. HTML / Frontend Source Standard

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

Pretty formatting is a source-maintenance requirement, not merely a cosmetic preference.

Formatting must never change:

- Element IDs
- `name` attributes
- form field values
- route URLs
- script behavior
- event bindings
- API payload names
- CSS selectors relied upon by JavaScript

### Light-mode compatibility standard

WonderfulApps currently has an intentionally **light visual design**. Some mobile browsers can apply automatic or algorithmic darkening when the browser itself is set to dark mode, which can override author-defined colors even though the page renders correctly in desktop browsers.

WA prevents this browser-generated recoloring by requiring every HTML page to include both of the following:

```html
<meta name="color-scheme" content="only light">
```

```css
:root {
  color-scheme: only light;
}
```

This is a compatibility control, not a redesign. Existing page colors remain authoritative.

The issue was reproduced on an Android phone using the DuckDuckGo browser with dark-mode page display enabled. Symptoms included black text rendering as white and table/background colors being changed from their designed values. Desktop DuckDuckGo, Chrome, Edge, and Firefox displayed the site normally.

The project-wide `only light` change was tested successfully on Android DuckDuckGo on **September 14, 2026**, and the WA pages then displayed with the intended colors.

Accordingly:

- New HTML pages must include both declarations.
- Existing declarations must be retained during future edits.
- Desktop-only testing is not sufficient reason to remove the rule.
- If WA later implements a true application-controlled dark theme, this standard should be revisited intentionally across the full frontend.

### Input sanitization standard

For pages that accept reusable free-text input:

- load the project's required DOMPurify include;
- load `js/inputSanitizer.js`;
- preserve the shared sanitizer during future edits;
- do not sanitize passwords;
- do not assume numeric/date fields require generic text sanitization;
- test HTML-like input during development.

### Safe output rendering standard

For data displayed in the frontend:

- prefer `textContent` for plain text;
- avoid raw database/API/user interpolation into `innerHTML`;
- where `innerHTML` is needed, escape interpolated untrusted values or sanitize intentionally rendered HTML;
- avoid `document.write` with dynamic data;
- constrain dynamic `src`, `href`, and similar URLs;
- review companion `.js` files, not only HTML shells;
- preserve safe rendering helpers when changing existing pages.

Input sanitization and output rendering are complementary controls; neither replaces the other.

---

## 12. Frontend Design and API Contract

General frontend rules:

- Maintain the existing page appearance unless redesign is requested.
- Reuse current WA layout and controls where appropriate.
- Keep API URLs consistent with mounted backend routes.
- Use JSON for normal API bodies.
- Use multipart only where file upload requires it.
- Send JWT bearer tokens on protected requests.
- Keep dates in formats expected by the current routes/database.
- Do not rename fields on one side of the API without updating every caller/consumer.
- Preserve the shared frontend sanitization and output-safety conventions on new and modified pages.
- Treat external API response text as untrusted for rendering purposes.

---

## 13. Current Package Baseline

Current `package.json`:

```text
name: WonderfulApps
version: 1.0.0
main: server.js
```

Key dependency values:

| Dependency | Version/spec |
|---|---:|
| `express` | `^5.1.0` |
| `mysql2` | `^3.14.1` |
| `jsonwebtoken` | `^9.0.2` |
| `bcrypt` | `^6.0.0` |
| `express-validator` | `^7.2.1` |
| `cors` | `^2.8.5` |
| `dotenv` | `^16.5.0` |
| `axios` | `^1.13.5` |
| `multer` | `^2.0.1` |
| `morgan` | `^1.10.0` |
| `winston` | `^3.17.0` |
| `resend` | `^6.4.2` |
| `rotating-file-stream` | `^3.2.6` |
| `sharp` | `0.33.5` |
| `yahoo-finance2` | `^2.13.4` |
| `@aws-sdk/client-s3` | `3.750.0` |
| `@aws-sdk/s3-request-presigner` | `3.750.0` |

The current dependencies differ materially from older WA documentation. In particular, the project now uses Express 5.x, bcrypt 6.x, Multer 2.x, newer mysql2/axios/Resend packages, and AWS S3-compatible storage libraries.

---

## 14. Deployment and Environment

`server.js` currently allows these CORS origins:

```text
http://localhost
http://localhost:8080
https://wapps.helioho.st
https://wapps-ypez.onrender.com
```

Environment configuration should continue to hold:

- database credentials
- JWT secret
- email/Resend credentials
- external API credentials
- object-storage credentials
- deployment-specific settings

Never place live secrets in committed HTML, JavaScript, Markdown, or SQL files.

---

## 15. Static Files and Caching

`server.js` serves `httpdocs/` as the static frontend.

Current behavior includes:

- ordinary static assets may be cached
- HTML is sent with `Cache-Control: no-cache`
- service worker files are sent with no-cache behavior
- manifest content type is explicitly handled

This is intended to make HTML changes visible on normal refresh while allowing ordinary static asset caching.

---

## 16. Project Structure

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
├── wappsDumps.sql
├── CLAUDE.md
├── TechSummary.md
├── routes/
│   ├── activities.js
│   ├── budget.js
│   ├── etf.js
│   ├── familyTree.js
│   ├── geocode.js
│   ├── interestEarned.js
│   ├── track.js
│   ├── users.js
│   ├── weightActivities.js
│   └── weights.js
├── middleware/
├── httpdocs/
│   ├── *.html
│   └── js/
│       ├── inputSanitizer.js
│       └── Family Tree and shared frontend scripts
├── docs/
├── logs/
└── skills/
```

---

## 17. Development Checklist

Before completing a code change:

```text
[ ] Identify every frontend HTML page affected
[ ] Identify every companion frontend JavaScript file affected
[ ] Identify every backend route affected
[ ] Check exact table/column names in wappsDumps.sql
[ ] Check UserID ownership rules
[ ] Check existing backend validation
[ ] Check whether a transaction is required
[ ] Preserve current security behavior
[ ] Preserve API field names unless intentionally changing the contract
[ ] Pretty-format every modified HTML file
[ ] Verify every new or modified HTML page retains the required `only light` color-scheme declarations
[ ] For reusable free-text input, verify DOMPurify/shared inputSanitizer.js usage
[ ] Verify password fields are excluded from sanitization
[ ] Review innerHTML/outerHTML/insertAdjacentHTML/document.write usage
[ ] Prefer textContent for user/database/API text
[ ] Escape or sanitize untrusted data where generated HTML remains necessary
[ ] Review dynamic src/href and other URL-bearing attributes
[ ] Verify links, IDs, form names and JavaScript selectors
[ ] Test success cases
[ ] Test validation/error cases
[ ] Test malicious/HTML-like input on applicable fields
[ ] Test rendered database/API values on dynamic-output pages
[ ] Test unauthorized/wrong-user access where applicable
[ ] Update wappsDumps.sql for intentional schema changes
[ ] Update CLAUDE.md / TechSummary.md for architectural changes
```

---

## 18. Current Documentation Principles

For future WA work:

1. Treat current code as the behavioral reference.
2. Treat `wappsDumps.sql` as the schema reference.
3. Keep Budget and Family Tree documentation current as they evolve.
4. Do not copy obsolete dependency versions from older documentation.
5. Do not use generic example tables when a feature already has an implemented schema.
6. Preserve MySQL 5.5 compatibility until the deployed database is intentionally upgraded.
7. Keep HTML source pretty formatted.
8. Keep the required `only light` browser-compatibility declarations in all HTML pages unless WA intentionally adopts a supported dark theme.
9. Retain shared frontend input sanitization on applicable pages and never sanitize passwords.
10. Render user-, database-, and API-derived text safely; prefer `textContent` and avoid raw interpolation into executable HTML.
11. Review companion frontend JavaScript files whenever page rendering occurs outside the HTML file.
12. Carry these frontend security standards forward into Cordova/Capacitor/WebView/native packaging.
13. Record major architecture changes in both `CLAUDE.md` and `TechSummary.md`.

---

*End of TechSummary.md*
