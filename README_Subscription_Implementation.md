# Wonderful Apps Subscription Function — Development Implementation

## Purpose

This package implements the development-stage Wonderful Apps subscription / entitlement system discussed on September 15, 2026.

The design uses four hierarchical plans:

1. Standard
2. Premium
3. Platinum
4. Diamond

During development, a user's **first successful login** creates a **30-day Platinum development trial**. ETF Investing is assigned to Diamond and is marked unavailable during development. Promotional codes can extend or improve access, but never reduce existing access.

The user-facing notice is:

> After development, all free development entitlements expire.

## Files in this package

### New files

- `subscription_schema.sql`
- `routes/subscriptions.js`
- `middleware/subscriptionAccess.js`
- `services/subscriptionService.js`
- `httpdocs/subscription.html`

### Revised files

- `routes/users.js`
- `server.js`
- `httpdocs/home.html`
- `httpdocs/login.html`
- `httpdocs/register.html`

No new npm package is required.

## Database tables added

The SQL file creates:

- `SubscriptionPlanT`
- `AppT`
- `SystemSettingsT`
- `UserSubscriptionT`
- `PromoCodeT`
- `PromoRedemptionT`
- `UserUsageT`

It also inserts the four plans, the current app classifications, development settings, and the promotional code `22FreeForMe22!`.

`MaxUses = NULL` means unlimited uses. The code's initial end date is `2026-12-31`. You can change it directly in `PromoCodeT` without changing application code.

Example:

```sql
UPDATE PromoCodeT
SET EndDate = '2027-06-30'
WHERE Code = '22FreeForMe22!';
```

The system-wide development entitlement cutoff is intentionally left blank until you choose a firm date. When ready:

```sql
UPDATE SystemSettingsT
SET SettingValue = '2026-12-31'
WHERE SettingKey = 'DevelopmentEntitlementEndDate';
```

To stop giving new users automatic development trials:

```sql
UPDATE SystemSettingsT
SET SettingValue = '0'
WHERE SettingKey = 'AllowNewDevelopmentTrials';
```

## Login workflow

The revised workflow is:

**Registration → Login → Email verification → Subscription check → Subscription page or Home**

Registration no longer issues an authenticated JWT. After registration, `register.html` sends the user to `login.html`.

After the user enters the email verification code successfully:

- If no `UserSubscriptionT` row exists, a 30-day Platinum `DEVELOPMENT_TRIAL` row is created once.
- If that new trial was created, the user is sent to `subscription.html`.
- If an existing entitlement is active, the user goes to `home.html`.
- If an existing entitlement has expired, the user goes to `subscription.html` so a promotional code can be entered.

Existing subscription dates are never reset merely because the user logs in again.

## Promotional-code rules

A code is accepted only when:

- it exists;
- it is active;
- the current date is between its start and end dates;
- it has not exceeded `MaxUses` (unless `MaxUses` is `NULL`);
- the user has not already redeemed it; and
- it actually improves the user's current access by extending the end date, increasing the plan level, or reactivating expired access.

The effective result uses the better of the user's existing access and the promotional access. A promo code never shortens an existing entitlement.

## Home-page behavior

`home.html` now requests `/subscriptions/status` after login and:

- displays the current plan and access expiration;
- leaves unavailable apps visible but disables their buttons;
- disables ETF Investing during development;
- adds a **Subscription** button;
- records `APP_OPEN` usage events when an enabled app button is used.

## Server-side enforcement

The following API route groups are protected by both JWT authentication and subscription checks in `server.js`:

- `/weights`, `/activities`, `/weightActivities` → Weigh In / Premium
- `/interestEarned` → Premium
- `/budget` → Premium
- `/familytree` → Platinum
- `/etf` → Diamond and unavailable during development

This is the important cost/security control. A user cannot bypass these protected data/API operations merely by typing an application page URL.

The static HTML files themselves remain normal static files because the current WA authentication token is stored in browser `localStorage`, which is not automatically sent with a normal page request. The protected database/API operations are therefore enforced on the server. A future cookie-based authentication redesign could also server-gate static HTML if that ever becomes desirable.

`/api/geocode` is intentionally unchanged in this first implementation because Property Info is presently classified as Category A / Standard. Revisit that route if its third-party cost model changes.

## Usage tracking

`UserUsageT` supports these event types:

- `APP_OPEN`
- `RECORD_CREATE`
- `RECORD_UPDATE`
- `API_CALL`
- `EMAIL_SENT`
- `FILE_UPLOAD`

The initial implementation actively records `APP_OPEN` from the Home page. The other event types are available for later insertion at meaningful cost-generating points. This avoids counting every internal SQL query as a user usage event.

## Recommended installation order

1. Create and switch to the Git branch `Subscripe` before changing the working project.
2. Make sure the current branch has no uncommitted work you need to preserve.
3. Run `subscription_schema.sql` against the **local development database first**.
4. Copy the new and revised files into the matching project folders.
5. Restart the Node.js server.
6. Test locally before committing or pushing.
7. After successful local testing, commit and push the `Subscripe` branch.
8. Apply the SQL to the hosted database only after the local tests pass.

## VS Code / GitHub branch: `Subscripe`

### Using the VS Code interface

1. Open the Wonderful Apps project in VS Code.
2. Look at the branch name in the lower-left corner of VS Code.
3. Make sure your current work is committed or otherwise safely preserved.
4. Click the current branch name.
5. Choose **Create new branch...**.
6. Enter exactly:

   `Subscripe`

7. Choose `main` as the source branch if VS Code asks for a source.
8. VS Code should switch to `Subscripe` immediately.
9. After the subscription files are copied and tested, open **Source Control**.
10. Stage the changed files, enter a commit message such as:

    `Add development subscription and entitlement system`

11. Commit.
12. Choose **Publish Branch** / **Push** so GitHub receives the `Subscripe` branch.

### Equivalent terminal commands

Run these from the Wonderful Apps project folder:

```bash
git status
git switch main
git pull origin main
git switch -c Subscripe
git push -u origin Subscripe
```

Do **not** run `git switch main` if `git status` shows uncommitted changes that you still need and you are uncertain how Git will handle them. Commit or stash those changes first.

After copying and testing the subscription implementation:

```bash
git status
git add .
git commit -m "Add development subscription and entitlement system"
git push
```

## Local test checklist

1. Register a brand-new test user.
2. Confirm registration redirects to Login, not directly into WA.
3. Log in and complete the email verification code.
4. Confirm the first successful login creates one `UserSubscriptionT` row:
   - Plan = Platinum
   - AccessType = `DEVELOPMENT_TRIAL`
   - StartDate = current date
   - EndDate = current date + 30 days
5. Confirm the new user is sent to `subscription.html`.
6. Confirm Subscription shows Platinum and the correct Access Expires date.
7. Confirm Home shows the plan and expiration.
8. Confirm Standard, Premium, and Platinum app buttons are enabled.
9. Confirm ETF Investing remains visible but disabled.
10. Log out and log back in. Confirm the 30-day period is **not reset**.
11. Apply `22FreeForMe22!` and confirm the expiration changes to the later applicable date.
12. Confirm the same user cannot redeem the same code twice.
13. Confirm a Home app opening adds an `APP_OPEN` row to `UserUsageT`.
14. Temporarily set a test subscription's EndDate to yesterday and confirm login sends the user to Subscription.
15. Confirm expired users receive HTTP 403 from protected data/API routes.
