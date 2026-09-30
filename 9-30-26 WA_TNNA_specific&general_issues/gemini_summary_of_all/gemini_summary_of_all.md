A. Summary of Responses to the WA TNNA Issue (Node / NVM Requirement)

The core issue involves the Town Notification Native App (TNNA) project running Capacitor 8. Executing npx cap add android fails because Capacitor CLI 8.5.2 requires Node.js ≥ 22.0.0, while the workstation is running Node.js 18.20.5.   

The models provided the following recommendations:

Grok (G_WA_possible_Issues.md): Recommends installing NVM for Windows 2.0.0 to manage Node 18.20.5 for WA and Node 22.23.x for TNNA. Emphasizes uninstalling standalone Node 18 first to avoid PATH/symlink conflicts, and standardizing on Node 22 once WA passes testing.   

Perplexity (P_TNNA_Node_NVM_Design_Engineer_Response.md): Recommends NVM for Windows as the sole version manager, adopting Node 24 LTS for TNNA (and as the long-term target for WA) while keeping Node 18 temporarily for WA. Notes Node 24 offers support through April 2028, whereas Node 22 reaches EOL in April 2027.   

Claude (C_TNNA_Node_NVM_Design_Engineer_Response.md): Highlights that Node 22+ is only required for local CLI commands (npx cap ...), not for web/production or Android Studio builds. Recommends a terminal-scoped portable Node 24 setup to avoid machine-wide changes, and warns that placing .nvmrc at the repo root will alter Render production builds.   

B. Summary of WA_possible_Issues (Secondary Architectural Risks)

Across all models, key secondary risks were identified:   

Missing Town Notice API Contract & Data Model: The town_notice entitlement exists, but no clear town_notice route module or table exists in documented WA routes. A defined schema (TownNoticeT, TownT, UserTownFollowT) and mobile API contract are required before native UI development.   

Native Push Notification System: WA currently relies on email notifications (via Resend) and database suppression. No native device token registration or FCM/APNs push delivery mechanism exists.   

Authentication & Credentials in Native Client: Browser-oriented localStorage and 8-hour access tokens must be adapted for mobile WebView secure storage (e.g., Capacitor Preferences) and refresh token mechanics.   

WebView CORS & Hosting Configurations: WebView origins (capacitor://localhost, http://localhost) must be added to the backend CORS allowlist.   

Obsolete Database Target (MySQL 5.5): WA maintains compatibility with MySQL 5.5.62, restricting modern SQL features (JSON columns, CTEs). A planned database migration path is recommended.   

Lack of Automated Testing & Version-Controlled Schema: The absence of tests increases risk during Node upgrades, and ignored database dumps (*Dump.sql) mean schema updates are not tracked via version-controlled migrations.