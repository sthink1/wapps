# Wonderful Apps — H67 Logout Origin Guard: Historical Record

**Record date:** November 3, 2026  
**Purpose:** Preserve the complete historical `H67_logout_origin.patch` contents and deletion rationale so the standalone patch can be removed from the active project.  
**Scope:** Documentation only; no code, Git, deployment, or database modification.

## Historical issue and decision

The `POST /users/logout` handler already required a web Bearer-authenticated session, but did not explicitly validate the request Origin. H67 proposed a defense-in-depth Origin check consistent with refresh-session and change-password. This was **not** evidence of an exploitable CSRF vulnerability.

The patch adds an Origin check between the web-client check and revocation. Missing or disallowed Origin returns HTTP 403 with `ORIGIN_NOT_ALLOWED`; the normal authorized logout code remains unchanged.

## Exact original patch (preserved verbatim)

```diff
--- a/routes/users.js
+++ b/routes/users.js
@@ -254,6 +254,7 @@
 
 router.post('/logout', auth, async (req,res)=>{
   if(req.user.client!=='web')return res.status(403).json({error:'WEB_SESSION_REQUIRED'});
+  try { sessions.requireOrigin(req); } catch(e) { return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'}); }
   try { await sessions.revokeCurrent(pool,req.user);sessions.clearCookie(res,req);res.json({message:'Logged out successfully'}); }
   catch(e){handleDbError(e,res,'Error logging out');}
 });
```

## Verification of current source

The authoritative Google Drive copy of `routes/users.js` was inspected on November 3, 2026. The precise added line appears in its `/logout` handler at line 257, before `sessions.revokeCurrent(...)`. The historical rationale and local testing steps also remain in `README_H67.md`.

**Not verified by this record:** whether the line is included in a particular committed Git revision, whether H67-specific hosted negative-Origin tests have passed, or whether the broader Stage 6 S6-019 requirement has been closed. Do not infer any of those from a source comparison.

## Disposition

- **Keep:** operational `routes/users.js` and the historical `README_H67.md` (preferably archived with other Stage 6 notes).
- **Delete candidate:** root `H67_logout_origin.patch`, after placing this record in the user's local Stage 6 historical documentation and checking the local Git status/references.
- If `git grep` finds references to `H67_logout_origin.patch`, update their wording to refer to this historical record rather than a live installation patch; `README_H67.md` currently names the patch in its *historical installation instructions*, which should not be mistaken for instructions to reapply it.
- No changes to production, `main`, staging, or TNNA are authorized or implied.
