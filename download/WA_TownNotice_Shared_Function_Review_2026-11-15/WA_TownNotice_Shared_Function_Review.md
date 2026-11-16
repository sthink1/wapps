# TownNotice — targeted shared-function review

## Frozen Phase A inventory

Local source:httpdocs/TownNotice.html;328lines;SHA-2561C640F4FB61DD62A376C0C91AFDBFCCB4A58B88E742CDD73D46CF3CD4A9E5BF0.
Branch reviseLogIn;HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c.
Independent count:**7**. A=project-wide;B=application-specific;C=mixed. Saved before current-page compliance assessment/prior findings.

### TN01 — Public reverse-geocode adapter

- Location:httpdocs/TownNotice.html:258-288
- Classification:C;confidence:High
- Purpose:Encode coordinates,call public proxy,interpret locality and report failure.
- Reuse rationale:Common public HTTP/geocoding service;preserve non-authenticated consumer contract.
- Page-specific portion:Town/city/village selection,currentTown deduplication andspoken announcement.
- Shared delegation observed:WA backend /api/geocode/reverse already shared;direct browser fetch.

### TN02 — API origin selection

- Location:httpdocs/TownNotice.html:245-248,259-263
- Classification:A;confidence:Medium
- Purpose:Use localhost8080 or current origin.
- Reuse rationale:Common permitted-host/transport configuration.
- Page-specific portion:Public geocode consumer does not need bearer injection.
- Shared delegation observed:Local BASE_URL;WA facade loaded but unused here.

### TN03 — Text status feedback

- Location:httpdocs/TownNotice.html:253-255,280-287,299,310,315,321
- Classification:C;confidence:High
- Purpose:Render current location/service state as text.
- Reuse rationale:Reusable safe status/message presentation.
- Page-specific portion:Town-specific phrases andgeolocation state.
- Shared delegation observed:Local textContent helper;no common statusmodule referenced.

### TN04 — Speech synthesis capability and delivery

- Location:httpdocs/TownNotice.html:292-301
- Classification:C;confidence:High
- Purpose:Feature-detect speech engine,create en-US utterance,speak orfallback.
- Reuse rationale:Browser speech/capability handling may serve other WA apps.
- Page-specific portion:Town entry message/voice language policy.
- Shared delegation observed:Browser API directly;no project speech service referenced.

### TN05 — Geolocation permission/watch lifecycle

- Location:httpdocs/TownNotice.html:304-322
- Classification:C;confidence:High
- Purpose:Start high-accuracy position watch,send coordinates,reportpermission/error.
- Reuse rationale:Location permission/acquisition lifecycle could be shared with other location consumers.
- Page-specific portion:Town lookup frequency/options andannouncement workflow.
- Shared delegation observed:Browser geolocation directly;no project location service referenced.

### TN06 — PWA registration and diagnostics

- Location:httpdocs/TownNotice.html:237-243
- Classification:A;confidence:High
- Purpose:Register common worker at load andreport result.
- Reuse rationale:Common site asset/cache lifecycle andbounded diagnostics.
- Page-specific portion:No Town business rule in registration.
- Shared delegation observed:Shared /sw.js with inline registration.

### TN07 — Shared session-aware usage tracking

- Location:httpdocs/TownNotice.html:325-326
- Classification:A;confidence:High
- Purpose:Load WA facade before shared tracker.
- Reuse rationale:Common authenticated page/time telemetry separate frompublic geocode.
- Page-specific portion:Page pathname only;town transitions nottracking payload.
- Shared delegation observed:js/usageTracking.js andWA facade explicitly referenced.

Excluded scope:Town-name precedence,currentTown comparisons,spoken boundary message andpage branding remain Town rules. Android native authentication/offline/detection code is not imported here;native download link/copy is not grounds to audit TNNA.

# Compliance assessment and limited reconciliation

Local-only source examination; no external sources/connectors, application tests/builds, database, hosted services or browser operations. Local HEAD identifies checkout only. Corev1.0/Detailedv0.4.1 approval November12 is recorded in local headers; retained DRAFT filenames do not negate that approval. D01-D14 and 3A-3C clarifications govern applicable clauses. README Section0, AGENTS and relevant CLAUDE/TechSummary instructions were explicitly consulted; shell tools do not prove automatic loading. Previously read approved clauses in this conversation were reused, not replaced by older implementation descriptions.

This page's independent inventory was saved before its current-page prior findings/evidence. Prior experiments were not opened or used as a candidate checklist; general WA knowledge in the same conversation is not claimed absent. No expected count or inter-experiment timing comparison.

Counts: 7 independent candidates; 0 confirmed-gap candidates; 6 with targeted operational verification; 5 optional deferred modernization candidates. These dimensions overlap. Zero post-reconciliation additions or reclassifications. Source-verified dispositions cover only stated requirements, not entire functions in all runtime conditions.

## TN01 — Public reverse-geocode adapter

**Location/classification:** httpdocs/TownNotice.html:258-288;C.

**Standards:** CS-08/09/10; WA-SHARED-001, WA-LOG-001, WA-ABUSE-001;D11.

**Disposition: Partially Conforming.** TownNotice:259-268 encodes lat/lon,checks HTTP status,parses success JSON. Town selection270-283 is domain-specific. Browser sends coordinates to WA proxy;routes/geocode.js:10-43 forwards them to external provider (not executed). server.js:190 preserves public mount. morgan.js:15-19 omits request URL/query in logged errors. Raw page caught errors286 remain diagnostic verification boundary,not proven leak.

**Existing related/shared service:** Existing public /api/geocode/reverse service;authenticated WA.api would change public behavior and must not be substituted blindly.

**Action:** RETAIN; TEST FIRST; OWNER DECISION. **Stage6:** R16 diagnostic/privacy boundary;R17 connectivity;D11 expressly defers newpublic endpoint hardening.

**Outstanding verification (NOT RUN):** Provider/non-JSON/network/429/5xx,coordinate confidentiality in actuallogs,late out-of-order responses. No coordinates obtained or sent.

**Modernization/approval:** D11 additional validation/rate/cache/deadline controls remain open/deferred;no new extraction proposed.

## TN02 — API origin selection

**Location/classification:** httpdocs/TownNotice.html:245-248,259-263;A.

**Standards:** CS-08/10; WA-ENV-001, WA-SHARED-001.

**Disposition: Unverified.** TownNotice:245-248 implements localhost port8080 fallback and same-origin default. Only public GET uses it;no token forwarding in getTown. Actual CORS/hosting support notchecked.

**Existing related/shared service:** WA facade same-origin paths;not an equivalent public-origin configurator.

**Action:** RETAIN; TEST FIRST; MIGRATE LATER. **Stage6:** R17 configured-origin/browser acceptance.

**Outstanding verification (NOT RUN):** Intended local serving modes,HTTPS andCORS;no external verification performed.

**Modernization/approval:** Optional common origin selector after preserving hostcontract.

## TN03 — Text status feedback

**Location/classification:** httpdocs/TownNotice.html:253-255,280-287,299,310,315,321;C.

**Standards:** CS-07/08; WA-FRONT-001, WA-SHARED-001.

**Disposition: Conforming — source verified.** TownNotice:254 uses textContent for every status,including provider town names andgeo error315. This establishes non-HTML rendering forstatus,not provider correctness or error confidentiality.

**Existing related/shared service:** Local textContent helper;no imported message service.

**Action:** RETAIN; MIGRATE LATER. **Stage6:** Supports safe R16 display;helper extraction deferred.

**Outstanding verification (NOT RUN):** Future change:literal markup,missingtown/error text andstatus announcements;no browser claim.

**Modernization/approval:** Optional status-message helper;Town wording remainslocal.

## TN04 — Speech synthesis capability and delivery

**Location/classification:** httpdocs/TownNotice.html:292-301;C.

**Standards:** CS-01/08/10; WA-FRONT-001, WA-SHARED-001.

**Disposition: Partially Conforming.** TownNotice:292-301 feature-detects speechSynthesis,sets en-US,speaks orreports unsupported engine. Queueing,voice availability,mobile activation andlate announcements notverified. No HTML sink in utterance.

**Existing related/shared service:** Browser speech API;no project-wide speech wrapper referenced or exposed by imports.

**Action:** RETAIN; TEST FIRST; MIGRATE LATER. **Stage6:** R17 browser/device capabilities;does not establish native R18 TTS behavior.

**Outstanding verification (NOT RUN):** Permission/autoplay/voice/background/queued messages andunavailable engine under supported browsers.

**Modernization/approval:** Optional speech capability/delivery adapter;Town text andvoice policy remainlocal.

## TN05 — Geolocation permission/watch lifecycle

**Location/classification:** httpdocs/TownNotice.html:304-322;C.

**Standards:** CS-01/08/09/10; WA-FRONT-001, WA-SHARED-001, WA-LOG-001.

**Disposition: Partially Conforming.** TownNotice:304-322 checks geolocation,starts watchPosition withexplicit highaccuracy/timeout/cache options,handles errors. Watch ID is notretained;no clearWatch orduplicate-start guard. These are lifecycle concerns,not demonstrated mandatory defect orauthorized behavior change. Native-only privacy statement215 must not be applied to browser coordinate query311.

**Existing related/shared service:** Browser geolocation;no common location service imported.

**Action:** RETAIN; TEST FIRST; OWNER DECISION; MIGRATE LATER. **Stage6:** R17 permission/background/lifecycle;R16 coordinate diagnostics. Native app is separate.

**Outstanding verification (NOT RUN):** Denied/unavailable permission,repeat Enable clicks,late callbacks,pause/navigation/privacy andnetwork;all NOT RUN.

**Modernization/approval:** Optional geolocation lifecycle adapter;do not add stop/throttle behavior withoutscope approval.

## TN06 — PWA registration and diagnostics

**Location/classification:** httpdocs/TownNotice.html:237-243;A.

**Standards:** CS-09/10; WA-CACHE-001, WA-LOG-001.

**Disposition: Partially Conforming.** TownNotice:237-243 registers common worker andlogs raw registrationerr. Worker:116-139 excludes cross-origin,Authorization,nonGET andunlisted API paths;thus reverse-geocode not worker-cached. Script/HTML coherence,registration Console andinstall/update unverified. Source cache policy != runtimeHTTP header proof.

**Existing related/shared service:** Existing /sw.js;page-localregistration.

**Action:** RETAIN; TEST FIRST; MIGRATE LATER. **Stage6:** Direct R16/S6-024 cache/asset acceptance;R17 PWA.

**Outstanding verification (NOT RUN):** Stale script/worker combinations,offlinefallback andsanitizedConsole;no tests rerun.

**Modernization/approval:** Optional common registration helper;asset acceptance still outstanding.

## TN07 — Shared session-aware usage tracking

**Location/classification:** httpdocs/TownNotice.html:325-326;A.

**Standards:** CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001.

**Disposition: Conforming — source verified.** TownNotice:325-326 loads facade before tracker. usageTracking.js:25-38 actually invokes WA.api.request for POSTonce;43-58 uses current-token keepalive exit withlogout gate/no retry;84-98 restores tracking session. Payload is pathname/duration,not GPS coordinates;public getTown remains separate. End-to-end delivery notcertified.

**Existing related/shared service:** Shared usageTracking.js plus WA.session/WA.api;exit fetch is justified unload adapter.

**Action:** RETAIN; TEST FIRST. **Stage6:** R16 logging/cache;R17 BFCache/timing;preserve accepted R15tracking.

**Outstanding verification (NOT RUN):** Expiry/accountswitch/logout,BFCache,duplicate lifecycle delivery onlywhere unresolved;no existing accepted test repeated.

**Modernization/approval:** Existing sharedtracker retained;no optional rewrite.

## Reconciliation

Limited register evidence WA-CF-010 confirms the public geocode exception/deferred D11 risk,not an authorization to force WA.api/authentication or add throttling. Stage6_TestPlan R15-47 records bounded Town Notice dashboard time and H15 normal-interface observation;neither proves live boundary detection,speech,permission orprivacy outcomes. S6-025 retains expiry/duplicate/lifecycle gaps. Existing T12 footer90/90 PASS preserved without rerun. No newcandidate orclassification change;no standalone earlier TownNotice review used.

## Limits and controls

Scope is functional services, not comprehensive HTML/CSS, backend/schema, authorization, device or dependency auditing. Only direct modules and necessary source fragments were followed; no current remote/deployment/database identity checked. No demonstrated exploit, secret disclosure or runtime PASS is asserted from source inspection. Any source-confirmed defect is bounded by its cited path and invariant. Purely local utilities are not automatically mandatory migrations.

CS-01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance, preservation, bounded evidence and owner control. Other requirements apply only as cited; unrelated native/administrator/public-endpoint contracts are not assumed applicable. D08 design direction selects no storage mechanism; D07 fail-closed refresh remains mandatory where used; D10 native model is separate; D11 public email/geocode changes remain deferred. R18 native and R20 release acceptance are not closed by this page review.

All source behavior, appearance, calculations, APIs, private data and existing evidence remain untouched. R10/R14/R15 and November15 R16-75 T12 90/90 bounded offline PASS preserved; none rerun. Prior shared-client tests do not certify independent raw fetch consumers. Required corrections need explicit scope approval; optional helper extractions remain deferred after Stage6/independent review. No revised source, installer or .diff is delivered because no source modification is authorized. Only this new report, CSV, timing report and ZIP are written.

