# INSTALL_R10_14_Offline_SignedOut_Followup.md

Branch: reviseLogIn. LOCAL TEST FIRST. No production or main changes.

Replace only httpdocs/home.html with the packaged complete file. Keep httpdocs/sw.js (cache v10) unchanged. Preserve existing backup and revision files until pre-merge review.

Fix: Online signed-out visitors retain the green application buttons and Login Required popups. An offline browser never re-enables the nine restricted buttons, even when session.restore() reports login_required or explicit_logout. Offline Home shows "Offline — session cannot be verified" and "Application access unavailable while offline". Subscription and Notifications also default disabled until online verification completes. All protected navigation still depends on authentication checks and server API authorization.

Before commit, on http://localhost:8080/home.html test:
1. Signed OUT, ONLINE: 9 restricted buttons enabled/green and Loan Payment/Contact Us clicks show Login Required. Subscription/Notifications remain clickable as before.
2. Signed OUT, OFFLINE: userDisplay = Offline — session cannot be verified; subscriptionStatus = Application access unavailable while offline; restricted buttons = 9; disabled restricted = 9; Subscription/Notifications also gray/disabled.
3. Signed OUT, ONLINE recovery: return to Not Logged In and clickable Login Required buttons.
4. Signed IN as charter, ONLINE: Standard plan and original four enabled restricted buttons, five disabled.
5. Signed IN, OFFLINE and recovery: offline messages, all restricted/Other disabled, token preserved, recovery restores the original permissions.
6. No new Console errors; syntax check and git diff --check.

Do not commit/deploy until local tests pass. After the user commits and syncs, retest only on the isolated staging service.
