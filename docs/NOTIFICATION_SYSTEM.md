# Wonderful Apps Notification System

**Implementation date:** September 16, 2026  
**Branch:** `notify`

## Purpose

This implementation adds a central Wonderful Apps notification framework for:

- `ACCOUNT` — required account/security messages;
- `SUBSCRIPTION` — required subscription/account-status messages;
- `APP_NOTICE` — optional application notices;
- `FAMILY_TREE` — optional Family Tree Person edit/deletion notices;
- `MARKETING` — optional Wonderful Apps news and promotional messages.

Required account/security and necessary subscription messages are not controlled by marketing unsubscribe settings. Optional categories are checked against registered-user preferences and address-level suppression before delivery.

## Database tables

`sql/notification_schema.sql` creates:

1. `NotificationPreferencesT` — current preference switches for registered users.
2. `ConsentTextVersionsT` — versioned registration/consent wording.
3. `NotificationConsentHistoryT` — opt-in/opt-out audit history.
4. `NotificationSuppressionT` — address/category suppression, including non-users.
5. `NotificationHistoryT` — central outbound notification history.
6. `UserAgreementHistoryT` — Terms of Use and Privacy Policy acceptance history.

The sixth table is intentionally separate from notification consent because agreement to Terms/Privacy is not the same thing as optional marketing consent.

## Family Tree rules implemented

A saved edit to a Person record generates one Family Tree notification for that Save when at least one Person field actually changed. The email states:

- what changed;
- who changed it;
- when it changed;
- the FamilyTreeCode.

There is no significant/minor edit classification.

A Person deletion generates one deletion notice for each applicable recipient. Existing Family Tree recipient logic is preserved, and the email address attached to the edited/deleted Person is also included when available. Duplicate email addresses are collapsed so the same address does not receive duplicate copies from the same operation.

A Family Tree recipient may be a registered WA user or a non-user. Non-users receive the same change description, plus an explanation of why the email was sent.

Every Family Tree email contains a **Stop Family Tree Notifications** link. It does not require a WA login. Stopping notifications creates an address-level `FAMILY_TREE` suppression. The email address remains in the Person record.

## Registration rules

`register.html` now states that Wonderful Apps uses email for important account, security, subscription, and service messages. It provides optional checkboxes for:

- Wonderful Apps marketing/news email;
- Wonderful Apps marketing/news SMS.

A separate required checkbox records agreement to the Terms of Use and Privacy Policy.

Marketing consent is not required to register.

## Notification Preferences page

`notificationPreferences.html` allows a logged-in user to control:

- Family Tree email;
- other application notice email;
- marketing email;
- marketing SMS.

Account/security and necessary subscription messages are shown as required rather than editable.

## SMS status

SMS consent/preferences are stored now, but no SMS provider is configured by this implementation. The central service records attempted SMS delivery as `NOT_CONFIGURED` rather than pretending that a message was sent.

Before sending real SMS messages, add an SMS provider and implement the provider call inside `services/notificationService.js`. The opt-out path should also support inbound STOP-type replies once an SMS provider is selected.

## Environment setting required

Add this environment variable locally and in Render:

```text
PUBLIC_BASE_URL=https://your-current-wonderful-apps-domain
```

For the current Render deployment this should be the public WA origin, without a trailing slash. The notification service uses it to build unsubscribe links.

Local development can use:

```text
PUBLIC_BASE_URL=http://localhost:8080
```

## Installation order

1. Create and switch to the `notify` branch.
2. Back up the database.
3. Run `sql/notification_schema.sql` against the WA database.
4. Replace the revised existing files:
   - `server.js`
   - `send_email.js`
   - `routes/users.js`
   - `routes/familyTree.js`
   - `httpdocs/register.html`
   - `httpdocs/home.html`
5. Add the new files:
   - `routes/notifications.js`
   - `services/notificationService.js`
   - `httpdocs/notificationPreferences.html`
   - `httpdocs/unsubscribe.html`
   - `httpdocs/terms.html`
   - `httpdocs/privacy.html`
6. Add `PUBLIC_BASE_URL` to the environment.
7. Restart the Node server.
8. Test locally before pushing the branch.
9. After database migration/testing, create a fresh `wappsDump.sql` so the project dump once again becomes the complete database ground truth.

## Suggested tests

### Registration

- Register with both marketing boxes unchecked.
- Confirm the user is created.
- Confirm `NotificationPreferencesT` has marketing off and Family Tree/application notices on.
- Confirm two marketing consent-history rows show `OPT_OUT`.
- Confirm Terms and Privacy acceptance rows were created.
- Repeat with one or both marketing boxes checked and verify `OPT_IN`.

### Preferences

- Log in and open `notificationPreferences.html`.
- Turn Family Tree email off and save.
- Verify both the preference and suppression row.
- Turn it back on and verify the suppression becomes inactive.

### Family Tree edit

- Edit one field and save: one email should list the old and new values.
- Edit several fields before one Save: one email should list all changed fields.
- Save without changing data: no edit email should be generated.
- Verify `FTNotificationT` and `NotificationHistoryT`.

### Family Tree non-user

- Give a Person profile an email address that is not in `UsersT`.
- Edit that Person.
- Verify the notice includes the same what/by/when details plus the non-user explanation.
- Click **Stop Family Tree Notifications**.
- Edit again and confirm no email is sent; the central history should show `SUPPRESSED`.

### Family Tree deletion

- Delete a Person with an email address.
- Verify the deletion notice identifies what was deleted, who deleted it, and when.
- Confirm existing creator/relationship-recipient behavior is still preserved.

## Terms and Privacy pages

`terms.html` and `privacy.html` are working development drafts aligned to this notification design, including Family Tree non-user notices. They should receive legal review before Wonderful Apps is offered publicly as a commercial service.
