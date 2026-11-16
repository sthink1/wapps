# login — targeted shared-function review

## Frozen Phase A inventory

Local source: httpdocs/login.html;239lines;SHA-256 8794E191954E75B9B7F68B3F2A43150977FF4C2A60075C162196FAEDF1ED297C.
Branch reviseLogIn;HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c.
Independent count: **8**. A=project-wide;B=application-specific;C=mixed. Saved before compliance assessment and current-page prior findings/evidence.

### LG01 — Credential/challenge/KMLI lifecycle

- Location: httpdocs/login.html:116-126,150-160,168-208,216-225
- Classification: A;confidence High
- Purpose: Collect credentials, retain temporary challenge and remembered-device choice, verify code and reset workflow.
- Reuse rationale: Central WA identity/challenge entry service used by all protected applications.
- Page-specific portion: Login-specific two-panel presentation; no domain-app rules.
- Shared delegation observed: Shared WA.session only used at final handoff; initial POSTs direct.

### LG02 — POST transport and error parsing

- Location: httpdocs/login.html:135-164,180-212
- Classification: A;confidence High
- Purpose: JSON login/verification POSTs, HTTP rejection parsing and catch display.
- Reuse rationale: Common safe HTTP/error compatibility and uncertain-delivery contract.
- Page-specific portion: Challenge endpoints require unauthenticated credential submission.
- Shared delegation observed: Direct fetch; WA.api loaded but not called for login POSTs.

### LG03 — API origin selection

- Location: httpdocs/login.html:114,135,180
- Classification: A;confidence Medium
- Purpose: Choose localhost API port8080 or current origin.
- Reuse rationale: Consistent origin/credential/hosting contract across WA entry pages.
- Page-specific portion: Must support login cookie behavior in actual hosting mode.
- Shared delegation observed: Local constant; no shared origin selector referenced.

### LG04 — Shared input sanitizer and password visibility interaction

- Location: httpdocs/login.html:13-14,78-82,123-124,229-235
- Classification: C;confidence High
- Purpose: Sanitize text controls and toggle password input between password/text.
- Reuse rationale: Shared free-text protection must preserve credential bytes for all auth pages.
- Page-specific portion: Login password/username/code controls and Show button.
- Shared delegation observed: js/inputSanitizer.js + DOMPurify loaded; sanitizer selector behavior to inspect.

### LG05 — Successful session handoff and redirect

- Location: httpdocs/login.html:195-205;105
- Classification: A;confidence High
- Purpose: Install returned access token through shared facade and navigate to server-selected target.
- Reuse rationale: All apps depend on correct token/logout/account-switch/redirect contracts.
- Page-specific portion: Login success wording and1500ms transition.
- Shared delegation observed: Actually calls WA.session.setAccessToken; redirect local.

### LG06 — Text feedback and form-phase presentation

- Location: httpdocs/login.html:125-131,155-164,171-176,210-225
- Classification: C;confidence High
- Purpose: Display errors as text, switch panels/focus and clear UI state.
- Reuse rationale: Reusable text-message and form-flow mechanics.
- Page-specific portion: Challenge-specific panel transitions, field resets, wording.
- Shared delegation observed: Native DOM/textContent and alert; no common feedback module referenced.

### LG07 — PWA registration and diagnostic boundary

- Location: httpdocs/login.html:107-113
- Classification: A;confidence High
- Purpose: Register /sw.js on load, report outcome.
- Reuse rationale: Common protected-site PWA asset lifecycle and secret-free diagnostics.
- Page-specific portion: No login business behavior in registration.
- Shared delegation observed: Shared /sw.js with page-local registration.

### LG08 — Shared confetti success feedback

- Location: httpdocs/login.html:11-12,199-205;httpdocs/js/confetti.js:1-12
- Classification: C;confidence Medium
- Purpose: Trigger common celebration library then show success and delay navigation.
- Reuse rationale: Shared visual feedback service already reused through wrapper.
- Page-specific portion: Login success trigger andredirect timing.
- Shared delegation observed: triggerConfetti() actually calls shared wrapper.

Excluded application-specific/nonfunctional scope: Field-specific login/reset transitions remain the authentication entry workflow; no unrelated app calculations exist. Static HTML/CSS and decorative styling are excluded. No rule requires centralizing every event handler.

# Compliance assessment and limited reconciliation

Local-only source examination; no external sources/connectors, application tests/builds, database, hosted services or browser operations. Local HEAD identifies checkout only. Corev1.0/Detailedv0.4.1 approval November12 is recorded in local headers; retained DRAFT filenames do not negate that approval. D01-D14 and 3A-3C clarifications govern applicable clauses. README Section0, AGENTS and relevant CLAUDE/TechSummary instructions were explicitly consulted; shell tools do not prove automatic loading. Previously read approved clauses in this conversation were reused, not replaced by older implementation descriptions.

This page's independent inventory was saved before its current-page prior findings/evidence. Prior experiments were not opened or used as a candidate checklist; general WA knowledge in the same conversation is not claimed absent. No expected count or inter-experiment timing comparison.

Counts: 8 independent candidates; 2 confirmed-gap candidates; 6 with targeted operational verification; 3 optional deferred modernization candidates. These dimensions overlap. Zero post-reconciliation additions or reclassifications. Source-verified dispositions cover only stated requirements, not entire functions in all runtime conditions.

## LG01 — Credential/challenge/KMLI lifecycle

**Location/classification:** httpdocs/login.html:116-126,150-160,168-208,216-225;A.

**Standards:** CS-03/09; WA-AUTH-001, WA-SESSION-001; D07/D09.

**Disposition: Partially Conforming.** login:121-160,168-208 carries username/password then tempToken/code/KMLI; no automatic POST retry loop. Back clears challenge126/223-225. Concurrent/stale submits and successful remembered-session supersession depend on server transaction. routes/users.js:320-348 creates session then returns fixed local destinations.

**Existing related/shared service:** WA.session.setAccessToken is actual shared handoff; challenge endpoints need unauthenticated adapter, not WA.api auto-refresh.

**Action:** RETAIN; TEST FIRST. **Stage6:** R16 input/error state;R17 browsers;R19 challenge/account-switch races.

**Outstanding verification (NOT RUN):** Wrong/expired/reused code, two submissions, failed verification preserving remembered session, cookie flags/Origin and restart. NOT RUN.

**Modernization/approval:** Required auth-contract acceptance; no workflow rewrite.

## LG02 — POST transport and error parsing

**Location/classification:** httpdocs/login.html:135-164,180-212;A.

**Standards:** CS-03/05; WA-API-002, WA-SESSION-001.

**Disposition: Confirmed Nonconformance.** login:144-145,189-190 constructs Error(errorData.error) without string/nested/message checks. Nested error object is coerced into object text; top-level message and non-JSON fallback unsupported. Status/category is not retained; catches163/211 render only message. Source violates typed transitional error contract; no browser incident claimed.

**Existing related/shared service:** waPlatform.js:41-55 implements related typed parsing, but readError is internal and WA.api assumes authenticated session.

**Action:** CORRECT; TEST FIRST; OWNER DECISION. **Stage6:** Direct R16 T09/error-display relevance;login's raw fetch is not proof of shared-client acceptance.

**Outstanding verification (NOT RUN):** Supported flat/nested/message/non-JSON,401/403/503/network/abort and retained fields; no auto-retry of either POST.

**Modernization/approval:** Required parser/failure correction after scope approval; not blanket WA.api migration.

## LG03 — API origin selection

**Location/classification:** httpdocs/login.html:114,135,180;A.

**Standards:** CS-03/10; WA-SESSION-001, WA-ENV-001.

**Disposition: Unverified.** login:114 selects cross-port localhost API when applicable. Both fetches omit credentials; browser default permits same-origin cookies, not cross-origin refresh-cookie participation. Production/same-origin behavior and intended local hosting mode not verified.

**Existing related/shared service:** WA facade assertPath/raw34-39,57-62 is same-origin; it is not a direct replacement for this host selector.

**Action:** TEST FIRST; OWNER DECISION; MIGRATE LATER. **Stage6:** R17 cookie/browser;R16 deployed asset/origin consistency.

**Outstanding verification (NOT RUN):** Intended localhost ports, credentialed CORS, Set-Cookie and KMLI under actual browser configurations; no network executed.

**Modernization/approval:** Optional origin configuration consolidation after preserving approved hosting modes.

## LG04 — Shared input sanitizer and password visibility interaction

**Location/classification:** httpdocs/login.html:13-14,78-82,123-124,229-235;C.

**Standards:** CS-07/09; WA-FRONT-001; CLAUDE §11 password byte preservation.

**Disposition: Confirmed Nonconformance.** login:229-235 changes password input type to text. inputSanitizer.js:14-21 selects input[type=text],36-44 replaces value,65-79 captures submit/button clicks. While password is visible, next click/submit sanitizes it before login:124 reads it. Even Hide click captures first. This permits password-byte alteration, contrary to explicit prohibition; ordinary hidden type exclusion does not protect shown passwords.

**Existing related/shared service:** Shared inputSanitizer.js actually installs capture listeners; DOMPurify precedes it at13-14.

**Action:** CORRECT; TEST FIRST; OWNER DECISION. **Stage6:** Security-sensitive login invariant;R17 browser regression;not a token architecture migration.

**Outstanding verification (NOT RUN):** Synthetic markup-like credential with Show/Hide/submit and Enter; verify exact bytes retained; no real passwords or tests used.

**Modernization/approval:** Required narrow exclusion/visibility contract correction; no new generic sanitizer rewrite authorized.

## LG05 — Successful session handoff and redirect

**Location/classification:** httpdocs/login.html:195-205;105;A.

**Standards:** CS-03/07/08; WA-AUTH-001, WA-SESSION-001, WA-FRONT-001.

**Disposition: Partially Conforming.** login:198 calls setter. waPlatform.js:28-32 checks nonempty string,stores token and clears logout marker; no JWT authenticity claim from setter. redirect204 trusts server string; scoped backend routes/users.js:348 uses subscription.html/home.html. Broad redirect injection not established. Delayed redirect/stale response/account switch need tests.

**Existing related/shared service:** Actually uses WA.session.setAccessToken; no duplicate direct storage write in login success path.

**Action:** RETAIN; TEST FIRST. **Stage6:** R16 session display/state;R17 restart;R19 delayed-login/account-switch race.

**Outstanding verification (NOT RUN):** Invalid/late response, concurrent logout/new login, token setter failure, approved local redirect destinations and cookies.

**Modernization/approval:** D08 storage architecture goal pending; no final replacement mechanism selected.

## LG06 — Text feedback and form-phase presentation

**Location/classification:** httpdocs/login.html:125-131,155-164,171-176,210-225;C.

**Standards:** CS-07/08; WA-FRONT-001, WA-SHARED-001.

**Disposition: Conforming — source verified.** login:128/131/163/173/176/211/221-222 assigns textContent;160 focuses code input. Error strings do not execute as HTML. This verifies text sink/focus-on-phase-entry only, not provenance or whole accessibility compliance.

**Existing related/shared service:** Local DOM/alert; no shared message component exposed by imports.

**Action:** RETAIN; MIGRATE LATER. **Stage6:** Text-safety supports R16;feedback helper extraction deferred.

**Outstanding verification (NOT RUN):** Future feedback change:literal markup,keyboard/focus,panel/reset and retained input regressions.

**Modernization/approval:** Optional text-feedback/phase-view helper; challenge rules stay local.

## LG07 — PWA registration and diagnostic boundary

**Location/classification:** httpdocs/login.html:107-113;A.

**Standards:** CS-09/10; WA-CACHE-001, WA-LOG-001.

**Disposition: Partially Conforming.** login:107-113 registers shared worker and logs raw registration err. sw.js:123-128 bypasses authenticated/nonGET requests;137 bypasses unlisted APIs;141 handles HTML/auth module network-first. Precache references missing local bday.html16/62;cache.addAll109 is a dependency risk,not proved deployed install failure. No secret leak observed.

**Existing related/shared service:** /sw.js shared;registration inline. Script versions/worker coherence not runtime-tested.

**Action:** RETAIN; TEST FIRST; OWNER DECISION. **Stage6:** Direct R16/S6-024 asset/cache;R17 PWA compatibility.

**Outstanding verification (NOT RUN):** Mixed assets,worker installation/update,missing-resource deployment response and sanitized Console;do not rerun prior parser probes.

**Modernization/approval:** Optional registration wrapper;cache/dependency verification remains acceptance work.

## LG08 — Shared confetti success feedback

**Location/classification:** httpdocs/login.html:11-12,199-205;httpdocs/js/confetti.js:1-12;C.

**Standards:** CS-01/08; WA-SHARED-001, WA-PRESERVE-001.

**Disposition: Conforming — source verified.** login:200 calls triggerConfetti;confetti.js:1-12 checks library function and triggers fixed options. Missing library returns without exception. Page alert/navigation stays separate. No external CDN availability or visual result tested.

**Existing related/shared service:** Shared confetti.js already used;external canvas-confetti reference only read as source.

**Action:** RETAIN. **Stage6:** No direct R16-R20 blocker;preserve appearance.

**Outstanding verification (NOT RUN):** Future change:library present/absent and unchanged redirect/visual timing.

**Modernization/approval:** Retain existing shared implementation;no modernization proposed.

## Reconciliation

Limited local register/test-plan excerpts confirm R16 T09/T10 browser acceptance remains open and historical R17/R19/R20 gates remain unclosed. No existing login-specific finding was located by the bounded register search. Backend verify-code source320-348 corroborates transactional challenge consumption, KMLI session creation and local redirect whitelist; it does not establish live cookie/session safety. T12 TAP footer preserves November15 90/90 bounded offline PASS; no tests rerun. LG04 arises from the current page/sanitizer composition, not a previous report. No candidate additions or reclassifications.

## Limits and controls

Scope is functional services, not comprehensive HTML/CSS, backend/schema, authorization, device or dependency auditing. Only direct modules and necessary source fragments were followed; no current remote/deployment/database identity checked. No demonstrated exploit, secret disclosure or runtime PASS is asserted from source inspection. Any source-confirmed defect is bounded by its cited path and invariant. Purely local utilities are not automatically mandatory migrations.

CS-01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance, preservation, bounded evidence and owner control. Other requirements apply only as cited; unrelated native/administrator/public-endpoint contracts are not assumed applicable. D08 design direction selects no storage mechanism; D07 fail-closed refresh remains mandatory where used; D10 native model is separate; D11 public email/geocode changes remain deferred. R18 native and R20 release acceptance are not closed by this page review.

All source behavior, appearance, calculations, APIs, private data and existing evidence remain untouched. R10/R14/R15 and November15 R16-75 T12 90/90 bounded offline PASS preserved; none rerun. Prior shared-client tests do not certify independent raw fetch consumers. Required corrections need explicit scope approval; optional helper extractions remain deferred after Stage6/independent review. No revised source, installer or .diff is delivered because no source modification is authorized. Only this new report, CSV, timing report and ZIP are written.

