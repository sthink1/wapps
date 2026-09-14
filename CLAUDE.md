# CLAUDE.md – WonderfulApps Developer Onboarding Guide

**Last updated:** September 14, 2026  
**Project:** WonderfulApps (WA)  
**Database ground truth:** `wappsDumps.sql`

---

## 1. Purpose of This File

This file is the primary development guide for WonderfulApps. Before making code changes, use this document together with the current source files and `wappsDumps.sql`.

When documentation conflicts with current executable code or the current SQL dump:

1. `wappsDumps.sql` is authoritative for the current database schema.
2. Current source files are authoritative for application behavior.
3. This document should then be corrected to match the implementation.

Do not design from an older description when a current file is available.

---

## 2. Current Architecture

WonderfulApps is a multi-application web/PWA project built with:

- **Frontend:** HTML, CSS, and vanilla JavaScript in `httpdocs/`
- **Backend:** Node.js with Express
- **Database:** MySQL, with the production/remote schema maintained for MySQL 5.5 compatibility
- **Authentication:** JWT bearer tokens and bcrypt password hashing
- **Database driver:** `mysql2`
- **Validation:** `express-validator`
- **Logging:** Morgan + Winston
- **Email:** Resend
- **External data/API support:** Axios, Yahoo Finance, geocoding and other feature-specific APIs
- **Object/image storage support:** AWS S3-compatible SDK through `r2Storage.js`
- **Image processing:** `sharp`
- **PWA:** service worker and manifest under `httpdocs/`

The application is organized around independent functional areas that share the same user/authentication platform.

---

## 3. Current Major Application Areas

The current WA project includes, among other features:

- User registration, login, verification, and authentication
- Weight tracking
- Activity tracking
- Weight/activity associations
- Interest earned calculations and records
- ETF research, categories, symbols, and activity
- Usage tracking/analytics
- Property and geolocation-related tools
- Amortization tools
- Contact/email functions
- **Budget application**
- **Family Tree application**

Budget and Family Tree are current implemented WA components, not future placeholder examples.

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
├── track.js
├── users.js
├── weightActivities.js
└── weights.js
```

Current `server.js` mounts the principal API routes as follows:

| Route prefix | Route module |
|---|---|
| `/weights` | `routes/weights.js` |
| `/activities` | `routes/activities.js` |
| `/weightActivities` | `routes/weightActivities.js` |
| `/users` | `routes/users.js` |
| `/track` | `routes/track.js` |
| `/interestEarned` | `routes/interestEarned.js` |
| `/etf` | `routes/etf.js` |
| `/budget` | `routes/budget.js` |
| `/familytree` | `routes/familyTree.js` |
| `/api/geocode` | `routes/geocode.js` |

`/send-email` is handled directly in `server.js`.

---

## 5. Current Database

The September 14, 2026 `wappsDumps.sql` contains **38 tables**.

### Core user / system tables

```text
UsersT
LoginVerificationT
UserSequenceT
TrackUsageT
```

### Weight / activity tables

```text
WeightsT
ActivitiesT
WeightActivitiesT
```

### Interest table

```text
InterestEarnedT
```

### ETF tables

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

### Family Tree tables (14)

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

### Database rules

- Keep SQL compatible with the production MySQL environment unless the hosting/database platform is intentionally changed.
- Do not assume modern MySQL-only features are available.
- Use `utf8mb4`.
- Respect existing primary keys, unique keys, indexes, and foreign-key rules in `wappsDumps.sql`.
- Many user-owned tables use `UserID` and database-level cascading deletes to `UsersT`.
- `UserSequenceT` supports user-scoped identifiers used by several WA modules.
- Do not invent or rename database columns without checking every route and frontend consumer.
- Family Tree relationships must be handled according to the actual Family Tree schema and route logic; do not assume every logical Family Tree relationship is enforced by a SQL foreign key.
- Treat `wappsDumps.sql` as the schema reference before writing SQL.

---

## 6. Budget Application

The Budget application is implemented through `routes/budget.js`, Budget HTML pages, and the Budget tables in `wappsDumps.sql`.

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

Do not replace the existing Budget schema with a generic single `BudgetsT` table.

---

## 7. Family Tree Application

The Family Tree application is implemented through `routes/familyTree.js`, Family Tree HTML pages, and the Family Tree tables in `wappsDumps.sql`.

The current schema includes support for:

- Family trees
- People
- People associated with trees
- Users associated with trees
- Parents
- Partners
- Events
- People associated with events
- Contacts
- Images
- Notifications
- Family Tree activity
- Person merge operations
- Archived records

Family Tree work must preserve existing ownership, relationship, merge, archive, event, notification, and image behavior.

Profile/image uploads use Family Tree-specific multipart handling rather than the general no-file multipart middleware in `server.js`.

---

## 8. Authentication and Security

- JWT tokens are used for authenticated API requests.
- Protected frontend calls send:

```http
Authorization: Bearer <token>
```

- Passwords must be hashed with bcrypt.
- Secrets and API credentials belong in environment variables, never committed source files.
- Never log passwords, JWT tokens, API keys, database passwords, or other secrets.
- Always enforce `UserID` ownership in routes that read or modify user-specific data.
- Validate user-controlled input before SQL execution.
- Use parameterized SQL; do not concatenate untrusted input into queries.
- Preserve current CORS restrictions unless a deployment change requires an intentional update.

---

## 9. Transactions and Database Access

Use the existing database helpers and patterns in the project.

For operations that must succeed or fail as one unit, use a transaction. Examples include:

- Parent + child inserts
- Multi-table Budget operations
- Multi-table Family Tree changes
- Merge/archive operations
- Weight entries with activity mappings

Do not partially commit a multi-step operation that would leave inconsistent data.

---

## 10. Frontend Standards

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

WonderfulApps currently uses an intentionally **light visual design**. All current and future `.html` pages must opt out of browser-generated or algorithmic dark-mode recoloring unless WA intentionally adopts a supported dark theme in the future.

Every HTML page should include this declaration in `<head>`:

```html
<meta name="color-scheme" content="only light">
```

Each page must also declare the same policy in CSS:

```css
:root {
  color-scheme: only light;
}
```

These declarations are a project-wide browser-compatibility requirement. They prevent browsers that apply automatic darkening from changing WA's intended text, background, table, button, and form colors.

Implementation rules:

- Preserve each page's existing WA colors; do not redesign pages merely to address browser dark mode.
- Do not remove the `only light` declarations because a page appears correct in desktop Chrome, Edge, Firefox, or DuckDuckGo.
- The original issue was observed on Android DuckDuckGo with browser dark mode enabled, where black text and table/background colors were automatically altered.
- The `color-scheme: only light` fix was tested successfully on Android DuckDuckGo on September 14, 2026.
- When creating a new WA HTML page, include both declarations from the beginning.
- If WA later introduces a true application-controlled dark theme, revise this rule deliberately across the project rather than removing it page by page.

### Frontend conventions

- Preserve the visual design of the page unless a redesign is requested.
- Reuse existing WA header, navigation, button, panel, and footer patterns where practical.
- Use `window.location.origin` or the project's existing base-URL pattern rather than hard-coding a deployment host unless required.
- Keep authenticated API calls consistent with the existing token mechanism.
- Validate important input in the frontend for usability, but treat backend validation as authoritative.
- Keep page names and capitalization consistent with existing links.

---

## 11. Backend Coding Standards

- Follow the existing route/module style before introducing a new pattern.
- Use `async/await`.
- Use parameterized `mysql2` queries.
- Validate request parameters and body values.
- Return suitable HTTP status codes.
- Keep error handling consistent with the project.
- Use transactions for multi-step database mutations.
- Avoid duplicating utilities already provided by shared modules.
- Keep routes user-scoped where the underlying records are user-owned.
- Update `server.js` when adding a new route module.
- Update the SQL dump/documentation when schema changes are made.

---

## 12. Current Package Baseline

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

## 13. File Structure – High-Level

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
├── docs/
├── logs/
└── skills/
```

---

## 14. Change Procedure

Before changing a feature:

1. Identify the frontend page(s).
2. Identify the API route(s).
3. Identify the relevant database table(s).
4. Check `wappsDumps.sql` for exact names, data types, keys, and constraints.
5. Check how `UserID` ownership is enforced.
6. Check whether the operation needs a transaction.
7. Implement the smallest safe change.
8. Pretty-format all modified HTML files.
9. Verify every modified or new HTML page includes the required `only light` color-scheme declarations.
10. Verify all links, IDs, field names, route names, and API payload names.
11. Test locally.
12. Update `wappsDumps.sql` after an intentional schema change.
13. Update `CLAUDE.md` and `TechSummary.md` when architecture or development standards change.

---

## 15. Important “Do Not” Rules

- Do not invent database table or column names.
- Do not assume an old example schema is current.
- Do not remove fields merely because their purpose is not immediately obvious.
- Do not change URL or API naming casually.
- Do not weaken authentication or per-user filtering.
- Do not expose secrets in source code or logs.
- Do not add MySQL features incompatible with the deployed database without first changing the database platform.
- Do not minify or poorly format source HTML.
- Do not remove the required `color-scheme: only light` compatibility declarations from WA HTML pages unless the project intentionally adopts a supported dark-theme design.
- Do not replace a multi-table implemented feature with a simplified example design.
- Do not modify unrelated functionality while completing a focused task.

---

*End of CLAUDE.md*
