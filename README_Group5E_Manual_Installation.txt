WA Stage 6 Group 5E – TEMPORARY hosted diagnostic
MANUAL INSTALLATION: NO PS1 OR AUTOMATIC FILE MODIFICATION

Package paths correspond to WA project root:
  server.js                                  COMPLETE revised file
  services/stage6ClientIpVerify.js          NEW temporary diagnostic module

For branch reviseLogIn ONLY; test Render wapps-stage6-test ONLY.

1. Confirm the local branch is reviseLogIn and commit ff6eef2 or its intended descendant.
2. Compare the supplied full server.js with YOUR LOCAL server.js before replacement.
   The ONLY intended changes are these two lines immediately before
   app.use('/users', userRoutes);:

   // TEMPORARY Stage 6 Group 5E diagnostic -- remove after verification.
   app.get('/_stage6_group5e_ip_verify', require('./services/stage6ClientIpVerify').handler);

   If your local server.js differs elsewhere, DO NOT overwrite local changes.
   Keep your current file and insert ONLY the two lines manually instead.
3. Optionally make your own backup of server.js, then copy BOTH packaged files
   to the corresponding WA locations. No installer script is included.
4. Examine git diff -- server.js and git status --short. Verify only the two
   intended lines changed and only the new module was added.
5. Before staging or deployment, verify no previous debug endpoint remains,
   run appropriate offline checks, and review the diff with ChatGPT.
6. Commit and push ONLY to reviseLogIn after approval. Deploy only on
   wapps-stage6-test. No production or main changes.

Diagnostic use:
- Create a NEW random secret of 32+ characters and set WA_GROUP5E_VERIFY_KEY
  on the STAGING Render service only. Never put it in code, commands saved to
  history, screenshots, or Git.
- WA_TRUST_RENDER_CF_IP=1 and correct staging environment are prerequisites.
- GET /_stage6_group5e_ip_verify with X-WA-Stage6-Diagnostic-Key header.
- Unauthorized requests return 404. Authorized requests return only Boolean
  comparisons from the ACTUAL clientIpForReset() resolver; no IP literals,
  hashes, emails, DB updates, or rate limiter actions are involved.

MANDATORY CLEANUP AFTER TEST:
- Remove the marked two lines from server.js and delete
  services/stage6ClientIpVerify.js.
- Commit/push cleanup to reviseLogIn; verify test Render Live and endpoint 404.
- Delete WA_GROUP5E_VERIFY_KEY from test Render.
- Evaluate resetting WA_TRUST_RENDER_CF_IP to absent until independent review.

Limitation: this proves which value the handler selects on the tested request,
NOT the authenticity of a CF-Connecting-IP header on every possible ingress.
