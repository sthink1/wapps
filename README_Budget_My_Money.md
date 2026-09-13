# Budget My Money / My Investments Implementation

Built from the current Google Drive versions of `budget.html`, `BmonthBudget.html`, and `routes/budget.js`.

## Install order

1. Run `Budget_My_Money_Tables.sql`.
2. Replace `routes/budget.js`.
3. Replace `httpdocs/budget.html`.
4. Replace `httpdocs/BmonthBudget.html`.
5. Add new `httpdocs/BMoney.html`.
6. Restart the Node server.

## What changed

### New tables
- `BudgetMyMoneyT`
- `BudgetMyInvestmentT`

Both are user-owned and use the existing `UserSequenceT` / `getNextUserSpecificID()` pattern.

### New Budget API
- `GET /budget/money`
- `POST /budget/money`
- `PUT /budget/money/:UserMoneyID`
- `DELETE /budget/money/:UserMoneyID`
- `GET /budget/investments`
- `POST /budget/investments`
- `PUT /budget/investments/:UserInvestmentID`
- `DELETE /budget/investments/:UserInvestmentID`

`GET /budget/monthly/summary` is extended to return:
- `MyMoneyCurrentBalance`
- `ProjectedMyMoney` for each month
- `MyMoneyShortage` for each month

The existing Monthly Net calculation remains exactly `In - Out`.

### New BMoney.html
Four-section page:
1. MY MONEY header + BUDGET button.
2. My Money explanation.
3. MY MONEY entry/list/total plus current-month + next-11-month projection.
4. MY INVESTMENTS explanation and entry/list/total.

Both My Money and My Investments use 3-column tables:
- Account / Pocket or Account
- Balance Current
- Delete

Each section has an ADD control. Clicking an existing account/balance loads it into the entry controls for UPDATE without adding a fourth table column.

### BmonthBudget.html
- Adds the agreed descriptive text below the Budget Page button.
- Adds `MY MONEY current balance` above the Month / In / Out / Net headings.
- Keeps the existing Net value calculation.
- Existing negative-Net pink row remains.
- If the cumulative projected My Money balance is below zero for a month, that month's Net cell becomes black with white text.

### budget.html
- My Money button now opens `BMoney.html` instead of the previously reserved `MyMoney.html`.

No `server.js`, npm, environment, or other route-mount changes are required because the existing `/budget` router is extended.
