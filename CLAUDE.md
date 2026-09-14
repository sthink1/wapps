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
- Frontend sanitization is a defense-in-depth control and must not be treated as a replacement for backend validation, authorization, ownership checks, or parameterized SQL.

### Frontend input sanitization requirement

WA now uses a shared client-side sanitization layer for pages that accept reusable free-text input.

The shared frontend sanitizer is:

```text
httpdocs/js/inputSanitizer.js
```

Applicable HTML pages load DOMPurify together with the shared sanitizer and sanitize reusable user-controlled free-text values before normal save/submission processing.

Rules:

- Sanitize reusable free-text input such as names, descriptions, notes, addresses, usernames, email addresses, telephone numbers, URLs, and textarea content where applicable.
- Treat sanitized values as **plain text** unless a feature intentionally supports HTML.
- Do not sanitize password fields. Password values must remain byte-for-byte as entered and must never be altered by the frontend sanitizer.
- Numeric, date, checkbox, and other strongly typed fields do not need generic text sanitization merely for consistency.
- Static pages and pages that do not accept reusable user-controlled free text do not need the shared sanitizer.
- Preserve page-specific validation rules in addition to shared sanitization.
- The sanitization implementation was tested successfully on September 14, 2026, including attempts to enter HTML-like values such as `<H1>` into protected fields.

### Safe output rendering requirement

WA must also protect the point where data is displayed.

User-controlled, database-derived, and external-API text must not be inserted into executable HTML without safe handling.

Preferred order:

1. Use DOM methods and assign untrusted/plain-text values with `textContent`.
2. Where existing markup requires template-generated HTML, escape every untrusted value before assigning the markup through `innerHTML`.
3. Use DOMPurify when actual HTML rendering is intentionally required.
4. Constrain dynamically assigned URL-bearing attributes such as `src` and `href`; do not blindly trust user/database/API-provided URLs.

Rules:

- Do not place raw user, database, or API strings directly inside `innerHTML`, `outerHTML`, `insertAdjacentHTML`, or `document.write`.
- `innerHTML` remains acceptable for trusted static markup that does not contain untrusted values.
- Do not build inline event-handler attributes from user-controlled data.
- Prefer event listeners and `data-*` attributes over generated `onclick="..."` strings.
- Rendering a value safely on input does not remove the need to render it safely on output.
- Safe output handling protects against old database content, external API content, and values that might bypass normal frontend input controls.
- The project-wide safe-output revisions were tested successfully on September 14, 2026.

### Native-app / WebView security continuity

These frontend security requirements remain in force if WA is packaged as a PWA, Cordova/Capacitor application, WebView-based application, or similar native/mobile wrapper.

Packaging HTML/JavaScript inside a native application does not make browser-style injection risks disappear. The native-app version must retain:

- frontend input sanitization;
- safe output rendering;
- backend validation and authorization;
- parameterized SQL;
- ownership controls;
- safe URL handling.

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

### Frontend security conventions

When creating or modifying a frontend page or JavaScript module:

- If the page accepts reusable user-controlled free text, use the shared sanitization mechanism unless the field type is intentionally excluded.
- Never sanitize password fields.
- Prefer `textContent` for displaying untrusted/plain-text data.
- If `innerHTML` is necessary, escape untrusted interpolated values or sanitize intentionally rendered HTML.
- Review all data arriving from the database and external APIs as potentially untrusted for rendering purposes.
- Treat image URLs, links, and other dynamic URL-bearing attributes as security-sensitive.
- Preserve the shared `inputSanitizer.js` include and DOMPurify include on pages where they are required.
- Do not remove output escaping merely because input sanitization is present.
- New native/WebView-facing pages must follow the same rules.

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
│   └── js/
│       └── inputSanitizer.js
├── docs/
├── logs/
└── skills/
```

---

## 14. Change Procedure

Before changing a feature:

1. Identify the frontend page(s) and any corresponding frontend JavaScript file(s).
2. Identify the API route(s).
3. Identify the relevant database table(s).
4. Check `wappsDumps.sql` for exact names, data types, keys, and constraints.
5. Check how `UserID` ownership is enforced.
6. Check whether the operation needs a transaction.
7. Implement the smallest safe change.
8. Pretty-format all modified HTML files.
9. Verify every modified or new HTML page includes the required `only light` color-scheme declarations.
10. For reusable free-text input, verify the shared input sanitizer is present and that passwords remain excluded.
11. Review output rendering for user-, database-, and API-derived values; prefer `textContent`, escaping, or DOMPurify as appropriate.
12. Review dynamic `src`, `href`, and similar URL-bearing attributes.
13. Verify all links, IDs, field names, route names, JavaScript selectors, and API payload names.
14. Test success cases and validation/error cases.
15. Test security-sensitive input/output behavior when a feature handles reusable text.
16. Test locally.
17. Update `wappsDumps.sql` after an intentional schema change.
18. Update `CLAUDE.md` and `TechSummary.md` when architecture or development standards change.

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
- Do not remove required frontend sanitization from pages that accept reusable free-text input.
- Do not sanitize password fields.
- Do not insert raw user-, database-, or API-derived strings directly into `innerHTML`, `outerHTML`, `insertAdjacentHTML`, or `document.write`.
- Do not assume sanitized input is automatically safe for every later output context.
- Do not trust dynamic image/link URLs without appropriate validation or constraint.
- Do not weaken these frontend security controls when packaging WA as a native/WebView application.
- Do not replace a multi-table implemented feature with a simplified example design.
- Do not modify unrelated functionality while completing a focused task.

---

*End of CLAUDE.md*
