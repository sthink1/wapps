# TechSummary.md – WonderfulApps Architecture & Onboarding Guide

## Executive Summary

**WonderfulApps** is a personal finance and health-tracking PWA built with:
- **Frontend**: Vanilla JavaScript + HTML/CSS (PWA-ready, service worker, confetti animations)
- **Backend**: Node.js/Express with JWT auth
- **Database**: MySQL 5.5–8.0 compatible
- **Deployment**: Render (remote), Local Docker (dev)

The app tracks weight/activities, calculates loan amortization, verifies interest earned, and researches properties with geolocation alerts.

---

## 1. Core Architecture Pattern

### Pattern: Layered MVC-Adjacent Architecture

```
┌─────────────────────────────────────────────┐
│      Frontend (httpdocs/*.html)             │
│  - Vanilla JS + Canvas/Confetti             │
│  - LocalStorage (token, settings)           │
│  - Service Worker (offline-first cache)     │
└────────────────────┬────────────────────────┘
                     │ REST API + JWT
┌────────────────────▼────────────────────────┐
│   Middleware Layer (middleware/*.js)        │
│  - CORS, JSON parsing, Auth verification    │
│  - Error handling, Morgan logging           │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│   Route Layer (routes/*.js)                 │
│  - 7 routers: users, weights, activities... │
│  - Input validation, business logic         │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│   Data Access Layer (dbConnection.js)       │
│  - MySQL2/promise pool                      │
│  - Transaction management (withTransaction) │
│  - User-specific ID generation              │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│   Database (MySQL 5.5–8.0)                  │
│  - 8 core tables (Users, Weights, etc.)     │
│  - FK constraints with CASCADE rules        │
│  - UserSequenceT for ID generation          │
└─────────────────────────────────────────────┘
```

### Why This Pattern?
- **Separation of concerns**: Each layer has single responsibility
- **Testability**: Routes and data layer can be mocked
- **Scalability**: Easy to add new routes without touching core
- **Security**: Auth middleware sits at entrance to protected routes

---

## 2. Key Data Flows

### Flow 1: User Authentication (Login)
```
User Input (login.html form)
  ↓
POST /users/login { username, password }
  ↓
Route Handler:
  1. Validate input (express-validator)
  2. Query UsersT for username
  3. bcrypt.compare(password, hash)
  ↓
SUCCESS: Sign JWT { userId, username, expiresIn: 8h }
         Response: { message, token }
  ↓
Frontend: localStorage.setItem('token', token)
          Redirect to home.html
```

### Flow 2: Adding a Weight Entry (Typical Data Operation)
```
User Input (Weights.html form)
  ↓
POST /weights { DateWeight, Weight, Activities[] }
  ↓
Middleware:
  1. CORS check
  2. JSON parse
  3. Auth: extract token, verify JWT
  ↓
Route Handler (weights.js):
  1. Validate fields (date format, weight range, activities unique)
  2. Extract userId from token
  ↓
withTransaction():
  1. BEGIN TRANSACTION
  2. INSERT WeightsT (DateWeight, Weight, UserID, UserWeightID)
  3. FOR each Activity in Activities[]:
     a. SELECT from ActivitiesT (or create if new)
     b. INSERT WeightActivitiesT (WeightID, ActivityID, UserID)
  4. COMMIT
  ↓
SUCCESS: Response { success: true, WeightID, UserWeightID }
  ↓
Frontend: Trigger confetti animation
          Refresh weight list (fetchAndRenderData)
```

### Flow 3: Fetching Weight Data with Filters
```
User selects date range (Weights.html modal)
  ↓
GET /weights?startDate=2025-05-01&endDate=2025-06-01
  ↓
Route Handler:
  1. Validate date format
  2. Extract userId from token
  3. Query: SELECT WeightsT WHERE UserID=? AND DateWeight BETWEEN ? AND ?
  4. Parallel fetch: WeightActivitiesT, ActivitiesT
  ↓
Response: [
  { WeightID, DateWeight, Weight, UserWeightID, Activities: [...] }
]
  ↓
Frontend:
  1. Sort data by DateWeight
  2. Calculate weight change (delta)
  3. Color-code: red (decrease), green (increase), blue (no change)
  4. Render table + SVG chart
```

### Flow 4: Analytics Tracking
```
User navigates to any page
  ↓
Frontend DOMContentLoaded:
  1. POST /track/log/page { page: pathname }
  ↓
Route Handler:
  INSERT TrackUsageT (UserID, Page, Action='View', Timestamp)
  ↓
On page unload:
  1. Calculate duration (Date.now() - startTime)
  2. POST /track/log/time-spent { page, duration }
  ↓
GET /track/stats:
  1. Aggregate: COUNT views, MAX duration, AVG time spent
  2. Group by page, by user, by date
  3. Return tables for dashboard
```

---

## 3. Important Dependencies

### Critical (App Cannot Run Without)
| Package | Version | Why | Used Where |
|---------|---------|-----|-----------|
| `express` | ^4.18.2 | Web framework | server.js, routes/* |
| `mysql2/promise` | ^3.6.5 | DB driver | dbConnection.js |
| `jsonwebtoken` | ^9.0.2 | JWT signing | routes/users.js, middleware/auth.js |
| `bcrypt` | ^5.1.1 | Password hashing | routes/users.js, hash.js |
| `dotenv` | ^16.3.1 | Env var loading | All files via require() |

### Important (Core Features Depend On)
| Package | Version | Why | Used Where |
|---------|---------|-----|-----------|
| `express-validator` | ^7.3.1 | Input validation | routes/* |
| `cors` | ^2.8.5 | Cross-origin requests | server.js |
| `morgan` | ^1.10.0 | HTTP request logging | server.js |
| `winston` | ^3.11.0 | Error/info logging | logger.js |
| `multer` | ^1.4.5-lts.1 | File upload (future) | server.js |

### Supporting (PWA & UX)
| Package | Version | Why | Used Where |
|---------|---------|-----|-----------|
| `canvas-confetti` | @1.9.3 (CDN) | Celebration animation | httpdocs/js/confetti.js |
| `dompurify` | 2.3.10 (CDN) | Input sanitization | httpdocs/propertyInfo.html |
| `resend` | ^3.x | Email via HTTP API (replaced nodemailer; Render blocked SMTP Sep 2025) | send_email.js, contact forms |

### External APIs
| Service | Purpose | Used Where | Notes |
|---------|---------|-----------|-------|
| Nominatim (OSM) | Reverse geocoding | TownNotice.html, geocode.js | — |
| NOAA Flood Maps | Property research | propertyInfo.html | — |
| Zillow | Property info | propertyInfo.html | — |
| CrimeGrade | Crime statistics | propertyInfo.html | — |
| Resend | Transactional & contact emails | ContactUs.html, send_email.js | API-based (HTTPS); no SMTP ports required; uses `RESEND_API_KEY` in .env |

---

## 4. Feature Extension Path

### Adding a New Page (e.g., "Budget Tracker")

#### Step 1: Create Frontend (httpdocs/)
```html
<!-- httpdocs/Budget.html -->
<!DOCTYPE html>
<html>
<head>...</head>
<body>
  <h1>Budget Tracker</h1>
  <form id="budgetForm">
    <input type="month" id="month" required>
    <input type="number" id="amount" required>
    <button>Save</button>
  </form>
  <script>
    const BASE_URL = window.location.origin;
    const token = localStorage.getItem('token');
    document.getElementById('budgetForm').onsubmit = async (e) => {
      e.preventDefault();
      const response = await fetch(`${BASE_URL}/budgets`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, amount })
      });
      const data = await response.json();
      // Handle response
    };
  </script>
</body>
</html>
```

#### Step 2: Create Database Table
```sql
CREATE TABLE BudgetsT (
  BudgetID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL,
  Month VARCHAR(7),        -- YYYY-MM format
  Amount DECIMAL(10,2),
  UserBudgetID INT,        -- User-specific sequence
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (UserID)
);

INSERT INTO UserSequenceT (UserID, TableName, NextID) VALUES (?, 'BudgetsT', 1);
```

#### Step 3: Create Route (routes/budgets.js)
```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { pool, getNextUserSpecificID } = require('../dbConnection');
const auth = require('../middleware/auth');
const { handleDbError, withTransaction } = require('../utils');

// GET all budgets for user
router.get('/', auth, async (req, res) => {
  const userId = req.user.userId;
  try {
    const [budgets] = await pool.query(
      'SELECT * FROM BudgetsT WHERE UserID = ? ORDER BY Month DESC',
      [userId]
    );
    res.json(budgets);
  } catch (err) {
    handleDbError(err, res, 'Error fetching budgets');
  }
});

// POST new budget
router.post('/',
  auth,
  [
    body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be YYYY-MM(be)'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive(be)')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const userId = req.user.userId;
    const { month, amount } = req.body;

    try {
      await withTransaction(async (connection) => {
        const userBudgetId = await getNextUserSpecificID(userId, 'BudgetsT', 'UserBudgetID');
        const [result] = await connection.query(
          'INSERT INTO BudgetsT (UserID, Month, Amount, UserBudgetID) VALUES (?, ?, ?, ?)',
          [userId, month, amount, userBudgetId]
        );
        res.status(201).json({ message: 'Budget created', id: result.insertId });
      });
    } catch (err) {
      handleDbError(err, res, 'Error creating budget');
    }
  }
);

module.exports = router;
```

#### Step 4: Register Route in server.js
```javascript
const budgetsRoutes = require('./routes/budgets');
app.use('/budgets', budgetsRoutes);
```

#### Step 5: Add Link to home.html
```html
<a href="Budget.html"><button>Budget Tracker</button></a>
```

---

## 5. Core Logical Flow: Weight Entry to Database

### Complete Request Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│ 1. USER INITIATES (Weights.html)                        │
├─────────────────────────────────────────────────────────┤
│ User fills form:                                        │
│  - DateWeight: "2025-05-15"                             │
│  - Weight: "175.5"                                       │
│  - Activities: ["Running", "Yoga"]                       │
│ Clicks "SAVE" button                                    │
│ Client-side validation: Check date, weight range       │
│ Payload construction: { DateWeight, Weight, Activities }│
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 2. FRONTEND NETWORK REQUEST                             │
├─────────────────────────────────────────────────────────┤
│ fetch(`${BASE_URL}/weights`, {                          │
│   method: 'POST',                                       │
│   headers: {                                            │
│     'Authorization': 'Bearer eyJhbGc...',               │
│     'Content-Type': 'application/json'                  │
│   },                                                    │
│   body: JSON.stringify({...})                           │
│ })                                                      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP POST
┌────────────────────▼────────────────────────────────────┐
│ 3. SERVER RECEIVES (server.js)                          │
├─────────────────────────────────────────────────────────┤
│ Express middleware stack:                               │
│  a) CORS middleware: Check origin (localhost:8080 OK)  │
│  b) JSON parser: Parse body                             │
│  c) Morgan: Log request                                 │
│  d) Static files: Not applicable                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 4. ROUTING & MOUNTING (server.js)                       │
├─────────────────────────────────────────────────────────┤
│ POST /weights matches route in weights.js              │
│ app.use('/weights', weightsRoutes)                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 5. ROUTE HANDLER (routes/weights.js POST /)             │
├─────────────────────────────────────────────────────────┤
│ a) Validation Chains:                                   │
│    - DateWeight: isISO8601() → "must be YYYY-MM-DD"    │
│    - Weight: isFloat(1,1000) → "must be 1-1000"        │
│    - Activities: isArray(0,5) → "max 5 activities"     │
│                                                         │
│ b) validationResult(req):                               │
│    IF errors: return 400 { error: "..." }               │
│                                                         │
│ c) Extract from req.body:                               │
│    { DateWeight, Weight, Activities }                   │
│                                                         │
│ d) Auth middleware (injected earlier):                  │
│    - Extract token from Authorization header            │
│    - Verify JWT signature with process.env.JWT_SECRET  │
│    - Extract userId: req.user.userId = decoded.userId  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 6. BUSINESS LOGIC (routes/weights.js)                   │
├─────────────────────────────────────────────────────────┤
│ a) Check unique activities:                             │
│    activityNames = Activities.map(a => a.ActivityName)  │
│    IF duplicates: return 400 { error: "not unique" }   │
│                                                         │
│ b) Prepare transaction:                                 │
│    await withTransaction(async (connection) => {        │
│      // All DB operations use 'connection', not pool     │
│      // Auto-commit on success, auto-rollback on error   │
│    })                                                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 7. DATABASE TRANSACTION (dbConnection.js)               │
├─────────────────────────────────────────────────────────┤
│ Step A: BEGIN TRANSACTION                               │
│                                                         │
│ Step B: Generate user-specific ID                       │
│   userWeightID = await getNextUserSpecificID(            │
│     userId, 'WeightsT', 'UserWeightID'                  │
│   )                                                     │
│   → Executes: UPDATE UserSequenceT SET NextID=NextID+1  │
│   → Returns: NextID value (e.g., 42)                    │
│                                                         │
│ Step C: Insert weight                                   │
│   INSERT INTO WeightsT                                  │
│   (DateWeight, Weight, UserID, UserWeightID)            │
│   VALUES ('2025-05-15', 175.5, 123, 42)                 │
│   → Returns: WeightID (auto-increment, e.g., 1856)      │
│                                                         │
│ Step D: Process activities                              │
│   FOR each activity in Activities:                      │
│     D1: Check if activity exists                        │
│         SELECT ActivityID FROM ActivitiesT              │
│         WHERE Activity = 'Running' AND UserID = 123     │
│                                                         │
│     D2a: IF exists → use ActivityID                     │
│     D2b: IF not exists → create new:                    │
│           userActivityID = getNextUserSpecificID(...)   │
│           INSERT INTO ActivitiesT                       │
│           (Activity, UserID, UserActivityID)            │
│           → Returns: ActivityID (e.g., 456)             │
│                                                         │
│     D3: Link weight to activity                         │
│         INSERT INTO WeightActivitiesT                   │
│         (WeightID, ActivityID, UserID)                  │
│         VALUES (1856, 456, 123)                         │
│                                                         │
│ Step E: COMMIT TRANSACTION                              │
│   All changes permanent; connection released            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 8. RESPONSE (routes/weights.js)                         │
├─────────────────────────────────────────────────────────┤
│ res.status(201).json({                                  │
│   success: true,                                        │
│   message: 'Weight added successfully',                 │
│   WeightID: 1856,                                       │
│   UserWeightID: 42                                      │
│ })                                                      │
│                                                         │
│ OR on error:                                            │
│ res.status(400).json({                                  │
│   error: 'Activities must be unique(be)'                │
│ })                                                      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP 201 + JSON
┌────────────────────▼────────────────────────────────────┐
│ 9. FRONTEND RESPONSE HANDLING (Weights.html)            │
├─────────────────────────────────────────────────────────┤
│ .then(response => response.json())                      │
│   IF not response.ok:                                   │
│     return response.json()                              │
│     .then(errorData => throw new Error(...))            │
│   ELSE:                                                 │
│     return response.json()                              │
│                                                         │
│ .then(data => {                                         │
│   IF data.success:                                      │
│     - triggerConfetti() ✨                              │
│     - alert('Weight Saved!')                            │
│     - addWeightModal.style.display = 'none'             │
│     - fetchAndRenderData() (refresh table)              │
│ })                                                      │
│                                                         │
│ .catch(error => {                                       │
│   errorMessage.textContent = error.message              │
│   (Display to user in modal)                            │
│ })                                                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 10. UI UPDATE & REFRESH (Weights.html)                  │
├─────────────────────────────────────────────────────────┤
│ fetchAndRenderData():                                   │
│   - Fetch /weights (GET)                                │
│   - Fetch /weightActivities (parallel)                  │
│   - Sort data by DateWeight                             │
│   - Calculate weight delta (change from previous)       │
│   - Create table rows with color coding:                │
│     • Decrease → #f3fa92 (yellow)                       │
│     • Increase → #cdf9d6 (green)                        │
│     • No change → #abc4f9 (blue)                        │
│   - Render SVG line chart                               │
│   - Display "Weight Saved!" summary                     │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Development Hotspots

### Most Central Files (Modify When Adding Features)

| File | Reason | Frequency |
|------|--------|-----------|
| `server.js` | Route mounting, middleware setup | Per new route |
| `routes/*.js` | Business logic, validation | Every feature |
| `dbConnection.js` | ID generation, pool config | Rare |
| `utils.js` | Error handling, transaction logic | Per route |
| `middleware/auth.js` | JWT verification | Rare (stable) |
| `httpdocs/home.html` | Navigation hub | Per new page |
| `.env` | Config secrets | Setup only |

### Most Actively Modified Files (During Development)

| File | Why | Who Touches |
|------|-----|-----------|
| `routes/weights.js` | Weight tracking logic | Backend dev |
| `httpdocs/Weights.html` | Weight UI, forms | Frontend dev |
| `routes/activities.js` | Activity CRUD | Backend dev |
| `routes/interestEarned.js` | Interest calculations | Feature dev |
| `logger.js` | Debugging | Anyone |
| `.env` | Local config | All devs |

### Testing Hot Zones

| Area | Test Priority | How |
|------|----------------|----|
| Authentication | **Critical** | POST /users/login with valid/invalid creds |
| Weight operations | **Critical** | POST /weights, GET /weights with filters, DELETE /weights/range |
| Activity linking | **High** | Verify WeightActivitiesT constraints (max 5) |
| Transaction rollback | **High** | Simulate DB error mid-transaction |
| Date format handling | **High** | Test YYYY-MM-DD parsing on MySQL 5.5 |
| Token expiry | **Medium** | Wait 8+ hours or mock JWT expiry |

---

## 7. Onboarding Map: Request Flow

### Visual Request Journey

```
BROWSER (User Action)
    │
    ├─ User Input
    │  └─ Form submission / Button click
    │
    ▼
HTTP REQUEST (GET/POST/PUT/DELETE)
    │
    ├─ Headers: { Authorization: Bearer <token>, Content-Type: application/json }
    ├─ Body: JSON payload (if POST/PUT)
    │
    ▼
SERVER.JS (Express App)
    │
    ├─ Middleware Stack:
    │  ├─ CORS (Check origin)
    │  ├─ JSON Parser (Parse body)
    │  ├─ Morgan (Log request)
    │  └─ Static Files (Serve if applicable)
    │
    ▼
ROUTE MATCHING
    │
    ├─ GET /weights → routes/weights.js GET /
    ├─ POST /weights → routes/weights.js POST /
    ├─ POST /users/login → routes/users.js POST /login
    └─ ... (etc.)
    │
    ▼
MIDDLEWARE/AUTH (Per Route)
    │
    ├─ Auth middleware (middleware/auth.js)
    │  ├─ Extract Authorization header
    │  ├─ Verify JWT
    │  └─ Attach userId to req.user
    │
    ├─ Validation middleware (express-validator chains)
    │  ├─ body(), param(), query() validators
    │  ├─ Check validationResult()
    │  └─ Return 400 if errors
    │
    ▼
ROUTE HANDLER (routes/*.js)
    │
    ├─ Extract userId from req.user.userId
    ├─ Extract/validate request data
    ├─ Apply business logic
    │
    ▼
DATABASE TRANSACTION (withTransaction)
    │
    ├─ BEGIN TRANSACTION
    ├─ Execute queries on 'connection' object
    ├─ Generate user-specific IDs (getNextUserSpecificID)
    ├─ Handle relationships (FK constraints enforced)
    │
    ├─ ON SUCCESS: COMMIT
    │  └─ Return response { success: true, data }
    │
    ├─ ON ERROR: ROLLBACK
    │  └─ Return error response { error: "message(be)" }
    │
    ▼
HTTP RESPONSE
    │
    ├─ Status Code (200, 201, 400, 401, 404, 500)
    ├─ JSON Body
    │
    ▼
FRONTEND (Weights.html, Activities.html, etc.)
    │
    ├─ Parse response
    ├─ Check status/error
    │
    ├─ ON SUCCESS:
    │  ├─ triggerConfetti()
    │  ├─ Update UI (refresh table)
    │  └─ Clear modal/form
    │
    ├─ ON ERROR:
    │  └─ Display error message in modal
    │
    ▼
ANALYTICS (Optional)
    │
    ├─ POST /track/log/page (record page view)
    ├─ beforeunload event (record time spent)
    │
    ▼
USER SEES RESULT
    │
    └─ Confetti animation ✨ + success message
      OR error toast

```

### Key Decision Points

| Condition | Action |
|-----------|--------|
| No token? | Redirect to login.html |
| Invalid token? | Middleware auth.js returns 401 |
| Validation fails? | Route handler returns 400 with error |
| DB query fails? | utils.js handleDbError() → 500 |
| Duplicate activity? | Route handler catches, rollback, return 400 |
| Success? | Return 200/201 + data |

---

## 8. Constraints to Respect

### ✅ Foreign Key Constraints with CASCADE Rules

**Configuration:** All child tables include `ON DELETE CASCADE ON UPDATE CASCADE` constraints:
- `ActivitiesT` → `UsersT`
- `InterestEarnedT` → `UsersT`
- `TrackUsageT` → `UsersT`
- `WeightsT` → `UsersT`
- `WeightActivitiesT` → `WeightsT`, `ActivitiesT`, `UsersT`
- `UserSequenceT` → `UsersT`

**Impact:**
- Deleting a user automatically deletes all related weights, activities, interest records, and tracking data
- Deleting an activity automatically removes all weight-activity links
- The database enforces referential integrity at the constraint level

**Best Practice: Transactions**
Even with CASCADE constraints, use transactions in your code for data consistency:
```javascript
// ✅ CORRECT (with transaction wrapper)
await withTransaction(async (connection) => {
  // Application-level validation and coordination
  const result = await connection.query('DELETE FROM WeightsT WHERE WeightID = ? AND UserID = ?', [weightId, userId]);
  // FK CASCADE automatically handles WeightActivitiesT cleanup
});
```

**When Adding New Tables:**
```sql
-- ✅ DO THIS (with FK constraint)
CREATE TABLE MyTable (
  MyID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL,
  ActivityID INT,
  INDEX idx_user (UserID),
  CONSTRAINT MyTable_ibfk_1 FOREIGN KEY (UserID) REFERENCES UsersT (UserID) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT MyTable_ibfk_2 FOREIGN KEY (ActivityID) REFERENCES ActivitiesT (ActivityID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ❌ DON'T DO THIS (omitting FK constraints)
ALTER TABLE MyTable 
ADD CONSTRAINT fk_user FOREIGN KEY (UserID) REFERENCES UsersT(UserID);
```

---

### ⚠️ CRITICAL: MySQL 5.5 Compatibility

**Remote Host Limitation:** Provider uses MySQL 5.5.x with NO Performance Schema

**Implications:**

| Feature | MySQL 8.0 (Local) | MySQL 5.5 (Remote) | Action |
|---------|-------------------|-------------------|--------|
| JSON data type | ✅ | ❌ | Use VARCHAR + manual parsing |
| GENERATED columns | ✅ | ❌ | Use triggers or app logic |
| Window functions | ✅ | ❌ | Use application-level grouping |
| Date/Time literals | ✅ | ✅ | Always use YYYY-MM-DD format |
| AUTO_INCREMENT | ✅ | ✅ | Still supported |
| TRANSACTIONS | ✅ | ✅ | Fully supported |
| SSL/TLS | ✅ | ❌ | Use on local only |

**Date String Handling (Critical for MySQL 5.5):**
```javascript
// ✅ CORRECT: Pass as YYYY-MM-DD string
const dateWeight = '2025-05-15';
await pool.query('INSERT INTO WeightsT (DateWeight) VALUES (?)', [dateWeight]);

// On fetch, MySQL 5.5 returns as: '2025-05-15' (string)
const [rows] = await pool.query('SELECT DateWeight FROM WeightsT');
// rows[0].DateWeight === '2025-05-15' (not a Date object)

// ❌ WRONG: Passing JavaScript Date object
const date = new Date('2025-05-15');
// MySQL 5.5 may misinterpret timezone

// ❌ WRONG: Using ISO format without T
const date = '2025-05-15T00:00:00Z';
// MySQL 5.5 may fail on timezone parsing
```

**Never Use in Queries:**
```sql
-- ❌ JSON operations
SELECT JSON_EXTRACT(data, '$.field') FROM table;

-- ❌ Window functions
SELECT weight, ROW_NUMBER() OVER (ORDER BY date) FROM weights;

-- ❌ GENERATED columns
ALTER TABLE users ADD updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- Use triggers instead on MySQL 5.5

-- ❌ CTE (Common Table Expressions)
WITH ranked_weights AS (...) SELECT * FROM ranked_weights;
```

---

### ⚠️ IMPORTANT: User-Specific ID Pattern

**Why Not Auto-Increment?**
- Isolate user data (user 1 has ID 1–50, user 2 has ID 1–50)
- Prevent ID enumeration attacks
- Enable portable data exports

**Usage Pattern:**
```javascript
// When creating a weight entry:
const userWeightID = await getNextUserSpecificID(userId, 'WeightsT', 'UserWeightID');
await pool.query(
  'INSERT INTO WeightsT (DateWeight, Weight, UserID, UserWeightID) VALUES (?,?,?,?)',
  [dateWeight, weight, userId, userWeightID]
);

// ALWAYS use getNextUserSpecificID for user-scoped tables:
// - WeightsT → UserWeightID
// - ActivitiesT → UserActivityID
// - InterestEarnedT → UserIntErndID

// NEVER use for non-user tables or system tables:
// - TrackUsageT (can use auto-increment)
// - UserSequenceT itself (auto-increment OK)
```

---

### ⚠️ IMPORTANT: Transaction Pattern

**When to Use:**
- Multi-step operations (INSERT weight + INSERT activities)
- Atomicity required (all-or-nothing)
- Cascading deletes (delete weight, then activities)

**Always Use:**
```javascript
try {
  await withTransaction(async (connection) => {
    // Use 'connection', NOT 'pool'
    const [result] = await connection.query(sql, params);
    // Auto-commits on success
    // Auto-rollbacks on error
  });
} catch (err) {
  handleDbError(err, res, 'Custom message');
}
```

**Do NOT Mix:**
```javascript
// ❌ WRONG: Using pool instead of connection
await withTransaction(async (connection) => {
  const [result] = await pool.query(sql, params);  // WRONG!
});

// ❌ WRONG: Manual commit/rollback
await connection.beginTransaction();
await connection.query(sql);
// Forgot to commit/rollback!
```

---

### ⚠️ IMPORTANT: Validation & Error Messages

**Convention:** All backend error messages end with `(be)`

```javascript
// ✅ CORRECT
return res.status(400).json({ error: 'Weight must be between 1 and 1000(be)' });

// ❌ WRONG
return res.status(400).json({ error: 'Invalid weight' });
```

**Why?** Frontend can distinguish backend errors from network errors:
```javascript
if (error.message.endsWith('(be)')) {
  // Display to user (backend validation failed)
  document.getElementById('error').textContent = error.message;
} else {
  // Log (network/client error)
  console.error('Unexpected error:', error);
}
```

---

### ⚠️ IMPORTANT: JWT Token Security

**Token Structure:**
```javascript
{
  userId: 123,
  username: 'johndoe',
  iat: 1234567890,         // issued at
  exp: 1234571490          // expires in 8 hours
}
```

**Storage:**
```javascript
// ✅ CORRECT: Stored in localStorage (client-side)
localStorage.setItem('token', token);

// ❌ WRONG: Never log token values
console.log('Token:', token);  // SECURITY BREACH!
logger.info('User token: ' + token);  // SECURITY BREACH!

// ❌ WRONG: Never send in URL
fetch(`/api/endpoint?token=${token}`);  // INSECURE!
```

**Expiry Handling:**
```javascript
// Frontend should check expiry before each request
// If token is missing or expired → redirect to login.html
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}
```

---

## 9. Common Patterns & Anti-Patterns

### ✅ CORRECT: Validating Before DB Query

```javascript
router.post('/', auth, 
  [
    body('weight')
      .isFloat({ min: 1, max: 1000 })
      .withMessage('Weight must be 1-1000(be)'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    // Now safe to use req.body.weight
  }
);
```

### ❌ ANTI-PATTERN: Validating Inside Route Without Early Return

```javascript
router.post('/', async (req, res) => {
  if (!req.body.weight) {
    res.status(400).json({ error: 'Weight required(be)' });
    // Missing return! Code continues...
  }
  // WRONG: Still tries to insert!
  await pool.query('INSERT INTO WeightsT (Weight) VALUES (?)', [req.body.weight]);
});
```

### ✅ CORRECT: Handling Async Errors

```javascript
try {
  await pool.query(sql, params);
  res.status(200).json({ success: true });
} catch (err) {
  handleDbError(err, res, 'Error message');
}
```

### ❌ ANTI-PATTERN: Swallowing Errors

```javascript
try {
  await pool.query(sql, params);
  res.status(200).json({ success: true });
} catch (err) {
  res.status(500).json({ error: 'Server error' });
  // Didn't log!
  // Didn't identify root cause!
}
```

### ✅ CORRECT: Checking User Ownership

```javascript
const userId = req.user.userId;  // From JWT
const [weight] = await pool.query(
  'SELECT * FROM WeightsT WHERE WeightID = ? AND UserID = ?',
  [weightId, userId]
);
if (weight.length === 0) {
  return res.status(404).json({ error: 'Weight not found(be)' });
}
```

### ❌ ANTI-PATTERN: Trust User Input for Ownership

```javascript
// WRONG: User could pass another user's weightId
const [weight] = await pool.query(
  'SELECT * FROM WeightsT WHERE WeightID = ?',
  [req.params.weightId]
);
// No check that this belongs to req.user.userId!
```

---

## 10. Quick Reference: File Changes for New Feature

### Checklist for Adding a New Endpoint

```
☐ Database: Create table in wappsDump.sql (respect MySQL 5.5 limits)
☐ Database: Add row to UserSequenceT for ID generation (if user-scoped)
☐ Backend: Create routes/myfeature.js with GET/POST/PUT/DELETE
☐ Backend: Import + register in server.js: app.use('/myfeature', ...)
☐ Frontend: Create httpdocs/MyFeature.html with form
☐ Frontend: Fetch logic with token auth + error handling
☐ Validation: Add express-validator chains for all inputs
☐ Security: Verify userId ownership before responding
☐ Testing: Test with valid/invalid/missing inputs
☐ Logging: Add logger.info() at key steps
☐ Error Messages: All backend errors end with (be)
```

---

## Glossary of Key Terms

| Term | Meaning |
|------|---------|
| **JWT** | JSON Web Token; stateless auth mechanism |
| **Bearer Token** | Token sent in `Authorization: Bearer <token>` header |
| **withTransaction** | Function that wraps DB operations in BEGIN/COMMIT/ROLLBACK |
| **UserSequenceT** | Table that tracks next available user-specific ID per table |
| **getNextUserSpecificID** | Function that increments and returns next user-scoped ID |
| **handleDbError** | Utility function that logs and responds with standardized error format |
| **express-validator** | Middleware library for input validation chains |
| **validationResult** | Function that collects validation errors from request |
| **Pool** | Connection pool managed by mysql2/promise |
| **PWA** | Progressive Web App; works offline via service worker |

---

## 11. Schema Evolution & Extensibility

### Adding New Tables with Foreign Keys

**Best Practice: Always include FK constraints with CASCADE**

```sql
CREATE TABLE NewFeatureT (
  FeatureID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL,
  ParentFeatureID INT,
  Data VARCHAR(1000),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Always add indexes for foreign keys
  INDEX idx_user (UserID),
  INDEX idx_parent (ParentFeatureID),
  
  -- Add FK constraints with CASCADE
  CONSTRAINT NewFeatureT_ibfk_1 
    FOREIGN KEY (UserID) REFERENCES UsersT (UserID) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  CONSTRAINT NewFeatureT_ibfk_2 
    FOREIGN KEY (ParentFeatureID) REFERENCES NewFeatureT (FeatureID) 
    ON DELETE CASCADE ON UPDATE CASCADE
);
```

**Why CASCADE?**
- Automatic cleanup: Deleting a user removes all related feature records
- No orphaned data: Child records can't reference missing parents
- Consistent with existing schema: All current tables use CASCADE
- Less code: No need to manually handle cascades in transactions

### Testing FK Behavior (Especially on MySQL 5.5)

```javascript
// Test deletion cascade
test('DELETE user should cascade to new table', async () => {
  const userId = 123;
  
  // Insert test data
  await pool.query('INSERT INTO NewFeatureT (FeatureID, UserID, Data) VALUES (?, ?, ?)', 
    [1, userId, 'test']);
  
  // DELETE user
  await pool.query('DELETE FROM UsersT WHERE UserID = ?', [userId]);
  
  // Verify CASCADE deleted child records
  const [remaining] = await pool.query('SELECT * FROM NewFeatureT WHERE UserID = ?', [userId]);
  expect(remaining.length).toBe(0);
});
```

### Altering Existing Tables (Advanced)

**Never disable foreign key checks in production.** Test changes locally & on remote MySQL 5.5 before deploying.

```javascript
// Safe way to add a new FK constraint
await withTransaction(async (connection) => {
  // First, verify no orphaned data exists
  const [orphans] = await connection.query(
    `SELECT * FROM WeightsT WHERE ActivityID NOT IN (SELECT ActivityID FROM ActivitiesT)`
  );
  if (orphans.length > 0) {
    throw new Error('Orphaned data detected; cannot add FK constraint');
  }
  
  // If safe, add constraint
  await connection.query(
    'ALTER TABLE WeightsT ADD CONSTRAINT...' 
  );
});
```

### Common Schema Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Omitting FK constraints | Orphaned data possible | Always include CASCADE constraints |
| Circular dependencies | Deadlocks on deletion | Design hierarchically (avoid cycles) |
| Testing only on MySQL 8.0 | Fails on MySQL 5.5 | Test on both local & remote |
| Manual cascade logic | Code duplication & bugs | Use database FK CASCADE |
| Not using transactions | Partial deletes if error occurs | Wrap in withTransaction |

---

## Support & Debugging

### Common Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| Token expired | 401 Unauthorized | User logs out, then logs back in |
| MySQL 5.5 date error | DATE parsing fails | Ensure YYYY-MM-DD format in code |
| Duplicate entry | 400 error with "(be)" | Check unique constraints; may need to delete old entry |
| Activity limit (5) | Weight save fails | Remove extra activities before saving |
| FK violation | 1451 error | Check FK definitions; ensure ON DELETE CASCADE is applied; use transactions for complex deletes |
| Pool exhausted | Request timeout | Increase connectionLimit in dbConnection.js |

### Logging for Debugging

```javascript
// Add to route handlers
logger.info(`Starting weight creation for userId=${userId}`);
logger.info(`Weight data: ${JSON.stringify(req.body)}`);
// Check logs at: logs/combined.log and logs/error.log
```

---

## Deployment Checklist

```
☐ Set NODE_ENV=production in remote server
☐ Verify .env is loaded (DB_HOST, JWT_SECRET, etc.)
☐ Test on remote MySQL 5.5 (date handling, FK CASCADE, etc.)
☐ Disable SSL in connection if remote is MySQL 5.5
☐ Run full test suite (login, weight CRUD, activities, etc.)
☐ Verify CORS origins are set correctly for production domain
☐ Monitor logs for errors
☐ Set up uptime monitoring
```

---

*End of TechSummary.md*

Last Updated: February 09, 2026
Maintained by: MPG Jr and Development Team