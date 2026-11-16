# FTPerson — targeted shared-function review

## Frozen Phase A inventory

Local source:httpdocs/FTPerson.html;1377lines;SHA-256F75475096DDCC6AF8406738937BA289B5F38DEF0DEBCCA36FF004F46D77B46AD.
Main JS: httpdocs/js/FTPerson.js,1761lines;FTPrivacy.js62lines;FTPets.js27lines.
Branch reviseLogIn;HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c.
Independent count:**12**. A=project-wide;B=application-specific;C=mixed. Saved before compliance assessment/current-page prior evidence.

### FP01 — Current-token startup and restored-page lifecycle

- Location:httpdocs/js/FTPerson.js:23-35,1274-1291,1490-1517;httpdocs/js/FTPets.js:11,25-26;httpdocs/FTPerson.html:1370-1375
- Classification:C;confidence:High
- Purpose:Read credentials,guard initial page access,load page data andrefresh selected state on BFCache return.
- Reuse rationale:Common auth/restoration/current-identity lifecycle.
- Page-specific portion:Person/tree prerequisites andload order;Pets init is independent.
- Shared delegation observed:WA facade/tracker loaded;business calls use local token helpers.

### FP02 — HTTP/error adapters and domain response boundaries

- Location:httpdocs/js/FTPerson.js:198-223,493-505,1160-1165,1201-1209;httpdocs/js/FTPrivacy.js:23;httpdocs/js/FTPets.js:13
- Classification:C;confidence:High
- Purpose:Authenticated reads/mutations,JSON parsing,failure messages andspecial409 handling.
- Reuse rationale:Common transport/errors/no-unsafe-replay service.
- Page-specific portion:FamilyTree423privacy/409duplicate orOneTree decisions andresponsefields.
- Shared delegation observed:Direct fetch across modules;WA.api is loaded butnot used for businesstransport.

### FP03 — Page-token fetch interception and credential scope

- Location:httpdocs/js/FTPrivacy.js:4-9,32-35;httpdocs/js/FTPerson.js:1502-1512;httpdocs/FTPerson.html:1370-1375
- Classification:C;confidence:High
- Purpose:Install in-memory privacy capability andinject X-FT-Page-Token into matching fetch requests.
- Reuse rationale:Cross-app transport needs explicitscoped credential/page-context extension.
- Page-specific portion:Capability onlyfor intended FamilyTreeperson/tree routes;must not become universal bearer.
- Shared delegation observed:Shared FTPrivacy module wraps globalfetch;WA facade is separate.

### FP04 — Privacy gate,one-use navigation handoff andadmin response

- Location:httpdocs/js/FTPrivacy.js:6,23-40,41-61;httpdocs/js/FTPerson.js:185-194,1502-1507
- Classification:C;confidence:High
- Purpose:Check privacy status,prompt key,consume navigation capability,recognize serveradmin andbuild privacy controls.
- Reuse rationale:Reusable capability/access-gate andverified-admin contracts.
- Page-specific portion:Four-character recoverable privacykeys,person/tree binding,email approvals andredaction.
- Shared delegation observed:Actually uses shared FTPrivacy.ensurePageAccess/openPerson/buildControl.

### FP05 — HTML/text andimageURL rendering safety

- Location:httpdocs/js/FTPerson.js:7-20,169-182,230-251,395-427,571-588,766-785;httpdocs/js/FTPets.js:16-17
- Classification:C;confidence:High
- Purpose:Encode text,assign safe DOM content andvalidate image URLs.
- Reuse rationale:Common context-sensitive rendering/URLpolicy.
- Page-specific portion:Family rows/private placeholders,petcards andphotospecificmarkup.
- Shared delegation observed:Local escapeHtml/safeImageUrl;browsertextContent;Pets uses own image assignment.

### FP06 — Shared free-text sanitation anddynamic form integration

- Location:httpdocs/FTPerson.html:4-7;httpdocs/js/FTPerson.js:456-474,708-724,1419-1429;httpdocs/js/FTPrivacy.js:15,20,54-57;httpdocs/js/FTPets.js:20-21
- Classification:C;confidence:High
- Purpose:Sanitize static/dynamic reusable textbefore button handlers.
- Reuse rationale:Existing common defense-in-depth must compose withdynamic controls andsecretkey policy.
- Page-specific portion:Names/notes/captions;privacykey handling requiresseparate contract.
- Shared delegation observed:DOMPurify/inputSanitizer loadedbefore page modules.

### FP07 — Date-only presentation andfield-value adapters

- Location:httpdocs/js/FTPerson.js:146-163,434-474;httpdocs/js/FTPets.js:14-15
- Classification:C;confidence:Medium
- Purpose:Format calendar dates,prepareinput date strings,andnormalize emptytext.
- Reuse rationale:Reusable calendar-date/normalization primitives.
- Page-specific portion:Age,deceased-person/pet rules anddate labels remain FamilyTree-specific.
- Shared delegation observed:Local functions;no genericdatecodec module referenced.

### FP08 — URL/query context andnavigation hygiene

- Location:httpdocs/js/FTPerson.js:37-43,755-764,1220-1224,1518-1547;httpdocs/js/FTPets.js:4-8
- Classification:C;confidence:High
- Purpose:Read person/tree context,encode navigation andremovecompleted actionqueryparameters.
- Reuse rationale:Reusable parameter parsing/safe navigation/context restoration.
- Page-specific portion:Separated-tree/current-tree semantics,OneTree andrelationship returnquestions.
- Shared delegation observed:Browser URLSearchParams/history/sessionStorage directly.

### FP09 — Multipart media upload andpending operationstate

- Location:httpdocs/js/FTPerson.js:525-569,621-705,1705-1709;httpdocs/js/FTPets.js:20,23-24
- Classification:C;confidence:High
- Purpose:Build multipartrequests,block selected controls,andrefresh mediastate.
- Reuse rationale:Common filetransport/progress/error/uncertain-mutation lifecycle.
- Page-specific portion:Photo limits,profileselection,pet media endpoint andfamilytree tokenbinding.
- Shared delegation observed:Native FormData/fetch;privacy wrappermay addpageheader.

### FP10 — Dialog,promise-choice andimage-viewer lifecycle

- Location:httpdocs/js/FTPerson.js:295-335,835-941,1634-1640,1734-1760;httpdocs/js/FTPrivacy.js:10-22;httpdocs/js/FTPets.js:20
- Classification:C;confidence:High
- Purpose:Open/close overlays,resolveuserchoices,showzoom anddismiss contextmenus.
- Reuse rationale:Reusable dialog/focus/promise-choice service.
- Page-specific portion:Relationship questions,privacy prompts andspecific forms remain local.
- Shared delegation observed:Module-local dialogs;no general WA dialogservice referenced.

### FP11 — Text status/feedback service

- Location:httpdocs/js/FTPerson.js:165-167,453,478-489,1548-1549,1662-1729;httpdocs/js/FTPets.js:12,18-24;httpdocs/js/FTPrivacy.js:13-14,49,59
- Classification:C;confidence:High
- Purpose:Present errors/success/pendingmessages as text.
- Reuse rationale:Common safe feedback/status conventions.
- Page-specific portion:Contextspecific element IDs andwording.
- Shared delegation observed:Local textContent helpers/catches;no commonfeedbackservice exposed.

### FP12 — Shared tracking andscript/asset composition

- Location:httpdocs/FTPerson.html:1370-1375;httpdocs/js/usageTracking.js
- Classification:A;confidence:High
- Purpose:Load session facade andshared page/time tracker afterdomain scripts.
- Reuse rationale:Project-wide telemetry/current-token/lifecycle service.
- Page-specific portion:Page identity only;private personcontentnot a requiredpayload.
- Shared delegation observed:WA.session/WA.api usedby tracker;business/privacy fetchcomposition separate.

Excluded scope:Person name ordering,ages/deceased styling,biological relationship constraints,duplicate review,OneTree questions,network eligibility/verification,business payloads andfour-pet/photo limits remain domain-specific. No general HTML/CSS audit orcomplete backend/DB/relationship examination. Reusable transport/safety/lifecycle services embedded in those workflows are included.

# Compliance assessment and limited reconciliation

Local-only source examination; no external sources/connectors, application tests/builds, database, hosted services or browser operations. Local HEAD identifies checkout only. Corev1.0/Detailedv0.4.1 approval November12 is recorded in local headers; retained DRAFT filenames do not negate that approval. D01-D14 and 3A-3C clarifications govern applicable clauses. README Section0, AGENTS and relevant CLAUDE/TechSummary instructions were explicitly consulted; shell tools do not prove automatic loading. Previously read approved clauses in this conversation were reused, not replaced by older implementation descriptions.

This page's independent inventory was saved before its current-page prior findings/evidence. Prior experiments were not opened or used as a candidate checklist; general WA knowledge in the same conversation is not claimed absent. No expected count or inter-experiment timing comparison.

Counts: 12 independent candidates; 3 confirmed-gap candidates; 10 with targeted operational verification; 6 optional deferred modernization candidates. These dimensions overlap. Zero post-reconciliation additions or reclassifications. Source-verified dispositions cover only stated requirements, not entire functions in all runtime conditions.

## FP01 — Current-token startup and restored-page lifecycle

**Location/classification:** httpdocs/js/FTPerson.js:23-35,1274-1291,1490-1517;httpdocs/js/FTPets.js:11,25-26;httpdocs/FTPerson.html:1370-1375;C.

**Standards:** CS-03/08/10; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001;D07-D09.

**Disposition: Approved Migration Pending.** FTPerson.js:23 reads current storage per call;1490-1505 checks presence then privacy gate,without awaiting WA.session.restore. Pets.js:25-26 starts independent DOMContentLoaded load before main module's async access flow;private server protection can return423 before unlock. pageshow1274-1291 reloads selected counts/status only. No source-level automatic mutation retry found;cross-account,BFCache andstale render safety unverified.

**Existing related/shared service:** WA.session.restore/getAccessToken in waPlatform.js:26,100-117,168;actually usedby tracker,not business startup. Local BASE_URL andprivacy/Pets base selectors preserve localhost mode.

**Action:** TEST FIRST; MIGRATE LATER; OWNER DECISION. **Stage6:** R16 session/error/retained state;R17 restoration;R19 account-switch/late responses;S6-005/018.

**Outstanding verification (NOT RUN):** Cookie-only/expired token,private Pets initial denial/reload after unlock,account switch,BFCache/delayed responses;no runtime failure asserted.

**Modernization/approval:** Required measured session integration,not permission forglobalfetch/storage redesign.

## FP02 — HTTP/error adapters and domain response boundaries

**Location/classification:** httpdocs/js/FTPerson.js:198-223,493-505,1160-1165,1201-1209;httpdocs/js/FTPrivacy.js:23;httpdocs/js/FTPets.js:13;C.

**Standards:** CS-03/05/08; WA-SESSION-001, WA-API-002, WA-SHARED-001.

**Disposition: Confirmed Nonconformance.** FTPerson.js:219-222,502-505,FTPrivacy.js:23,FTPets.js:13 parse only domain message forerror anddrop HTTP category/code in ordinary failures. Supported flat error/nested error.message fall back to generic orobject coercion when message itself isobject. Credential401/permission403/outage/cancellation not reliably carried to UI. Existing deliberate409 branches1161/1203 must remain. This is failure-contract nonconformance,not a violation merely becausefetch isdirect.

**Existing related/shared service:** WA.api/request/json andtyped readError41-55/119-143 provide relatedcontract,not a drop-in duepage-token andmultipart boundaries.

**Action:** CORRECT; TEST FIRST; OWNER DECISION. **Stage6:** Direct R16 T09/T10 contract;S6-008/018/033;R17 failure handling.

**Outstanding verification (NOT RUN):** Flat/nested/domain errors,401/403/423/409/503,malformedJSON,204,network/abort,retained fields andno POST/PUT/DELETE replay.

**Modernization/approval:** Required bounded error/transport correction;retain FamilyTreebusiness fields andprivacy outcomes.

## FP03 — Page-token fetch interception and credential scope

**Location/classification:** httpdocs/js/FTPrivacy.js:4-9,32-35;httpdocs/js/FTPerson.js:1502-1512;httpdocs/FTPerson.html:1370-1375;C.

**Standards:** CS-03/08/09; WA-PRIV-002, WA-SHARED-001, WA-SESSION-001.

**Disposition: Confirmed Nonconformance.** FTPrivacy.js:8 injects X-FT-Page-Token whenever String(url).includes('/familytree/'),without URL origin/path validation. Same-origin/intended-route constraint ismandatory in WA-PRIV-002. A cross-origin URL containing substring also qualifies;no actual token exfiltration ornetwork stimulus performed. waPlatform.js:17 captures fetch before async ensurePageAccess installs wrapper;future WA.api FamilyTree migration could bypass injection.

**Existing related/shared service:** Existing FTPrivacy installPageToken isreused by main rawfetch;WA facade's boundfetch composition isseparate.

**Action:** CORRECT; TEST FIRST; OWNER DECISION. **Stage6:** Direct R16 credential/cache privacy boundary;S6-017/033;R17 integration.

**Outstanding verification (NOT RUN):** Same-origin intended routes versus externalorigin/querysubstring/Request-object;reload/token expiry andactualcallcomposition. Use syntheticcapabilities only under laterauthorization.

**Modernization/approval:** Required scoped token-forwarding contract;do not indiscriminately replacewindow.fetch ormass migrate.

## FP04 — Privacy gate,one-use navigation handoff andadmin response

**Location/classification:** httpdocs/js/FTPrivacy.js:6,23-40,41-61;httpdocs/js/FTPerson.js:185-194,1502-1507;C.

**Standards:** CS-04/08/09; WA-PRIV-002, WA-SEC-ADMIN-001, WA-SHARED-001;D01/D06.

**Disposition: Confirmed Nonconformance.** FTPrivacy.js:29 removes stored handoff;30 supplies issued header via bearerWithPageToken;but api23 uses {...opt,headers:bearer()},discarding opt.headers. On new page currentPageToken5 isnull,so issued capability isnot sent forstatus validation. Server routes/ftPrivacy.js:51-63 reads x-ft-page-token toauthorize nonadminprivate data;validhandoff cannot prove itself throughthis path. This is a source-confirmed navigation/capability propagation gap,not accessbypass. Current serverisAdmin49 delegates centralservice;status63 usesit.

**Existing related/shared service:** Actually uses FTPrivacy gate/control. services/administratorAccess.js:10-28 queries current row andrequiresflag1 AND normalized configuredname;no username-only fallback in inspectedprivacyhelper.

**Action:** CORRECT; TEST FIRST; OWNER DECISION. **Stage6:** R16 privacy access/state;S6-017;R17 navigation;R19 capability expiry/accountbinding;fulladminCRUD notaudited.

**Outstanding verification (NOT RUN):** Consume valid/wrong/expired handoff,unchanged reload newkey rule,ordinary nonadmin versusdual-gateadmin,private nestedredaction. Serverrecovery/emailflows notfullyexamined.

**Modernization/approval:** Required handoffheader correction;four-character recoverability retained;no codehashing/reset mandate.

## FP05 — HTML/text andimageURL rendering safety

**Location/classification:** httpdocs/js/FTPerson.js:7-20,169-182,230-251,395-427,571-588,766-785;httpdocs/js/FTPets.js:16-17;C.

**Standards:** CS-07/08/09; WA-FRONT-001, WA-PRIV-002, WA-SHARED-001.

**Disposition: Partially Conforming.** FTPerson.js:7-20 encodes text andallowlists http/https/blob URLs;230-251,395-419 use textContent;deletePictureCard584-586 escapes URLs/captions. Some numericID attributes169-182/781-782 are raw;type invariants needproducer evidence. FTPets.js:17 uses textContent butassigns pictureUrl/open directly withoutlocal safeImageUrl;routes/familyTree.js:8384-8391 produces petURL fromsignedimagehelper808-810. No demonstrated XSS orunsafe actualURL.

**Existing related/shared service:** Existing local escapeHtml/safeImageUrl;Pets hasseparate textrenderer. Context encoder != input sanitizer.

**Action:** RETAIN; TEST FIRST; OWNER DECISION; MIGRATE LATER. **Stage6:** R16 safe display/private records;R17 URL/popup behavior.

**Outstanding verification (NOT RUN):** Malicious-looking text/IDs,imageURLschemes,server signedURL contract,redactedrows;no actual images/private records obtained.

**Modernization/approval:** Optional text/URLhelper consolidation;separate producer contract beforeclaiming broadergap.

## FP06 — Shared free-text sanitation anddynamic form integration

**Location/classification:** httpdocs/FTPerson.html:4-7;httpdocs/js/FTPerson.js:456-474,708-724,1419-1429;httpdocs/js/FTPrivacy.js:15,20,54-57;httpdocs/js/FTPets.js:20-21;C.

**Standards:** CS-07/08/09; WA-FRONT-001, WA-PRIV-002;D06.

**Disposition: Partially Conforming.** HTML:4-7 loads DOMPurify/sanitizer before modules. inputSanitizer.js:55-85 captureevents cover dynamically inserted Pets textareas/names andmain forms. FTPrivacy popup15 creates textinput;20 permitsletters/numbers/symbols length4-128. Generic sanitizer alsoselects thatinput andmay change markup-like privacykeys before Verify. Exact accepted-key compatibility andCDNavailability unverified;no forcedkey reset/hashingisauthorized.

**Existing related/shared service:** Shared WASanitize registered globally;main savebuttonpayloads actually pass itscaptureeventboundary.

**Action:** RETAIN; TEST FIRST; OWNER DECISION. **Stage6:** R16 input/privacycode compatibility;R17 dynamic eventordering;D06 accepted codepolicy.

**Outstanding verification (NOT RUN):** Synthetic symbol/markup-like existingkey,confirmation,ordinary names/notes,programmatic saves,DOMPurifymissing. No realkeys/testsused.

**Modernization/approval:** Retainshared sanitizer;decide a credential/privacy-key exception contract ifneeded,not broadmodernization.

## FP07 — Date-only presentation andfield-value adapters

**Location/classification:** httpdocs/js/FTPerson.js:146-163,434-474;httpdocs/js/FTPets.js:14-15;C.

**Standards:** CS-01/06/08; WA-DATA-001, WA-SHARED-001.

**Disposition: Conforming — source verified.** FTPerson.js:146-157 formats input date components byslice/split,without convertingdate-only string toUTC instant.160-163 normalizesemptytext. FTPets.js:14 similarlysplits dates;its age15 usesUTCtoday,while personage58-82 useslocaltoday. Age/deceasedrules remain domainpolicy,not automaticallyequivalent. Sourceverifiescomponent-only datepresentation forsupported ISOinputs,notcalendar/age correctnessallcases.

**Existing related/shared service:** Local date helpers;no shared genericcodec exposed byimports.

**Action:** RETAIN; MIGRATE LATER. **Stage6:** No direct R16-R20 blocker;deferred standardizeddatecodec onlyifuseful.

**Outstanding verification (NOT RUN):** Futurechange:date-only/leap/invalid/null/date-string input,local/UTCboundary andunknown-deathage preservation.

**Modernization/approval:** Optional datepresentation/emptyvaluecodec;never unify businessagepolicies silently.

## FP08 — URL/query context andnavigation hygiene

**Location/classification:** httpdocs/js/FTPerson.js:37-43,755-764,1220-1224,1518-1547;httpdocs/js/FTPets.js:4-8;C.

**Standards:** CS-01/08/09; WA-FRONT-001, WA-PRIV-002, WA-SHARED-001.

**Disposition: Partially Conforming.** FTPerson.js:37-43 gets Number(PersonID),treequery/sessioncontext;1496 checks truthiness,notinteger/positive;Pets25 checks positiveinteger. navigateTo1220-1224 andOneTree755-764 encodecontext.1518-1547 removes consumedquestionquerykeys with history.replaceState. Sourcepreserves separatedtree view comment228;identifierparameters do not confer serverauthorization.

**Existing related/shared service:** BrowserURLSearchParams/history/sessionStorage;FTPrivacy.openPerson ownsprivacyhandoff.

**Action:** RETAIN; TEST FIRST; MIGRATE LATER; OWNER DECISION. **Stage6:** R17 navigation/BFCache;R16 capabilitycontext;S6-017.

**Outstanding verification (NOT RUN):** Negative/huge/malformedPersonID,mismatchedtree,query/sessionfallback,OneTree returnandno implicitcurrenttreechange;serverdenialrequired.

**Modernization/approval:** Optional query/context helper;FamilyTree semantics andpage-specificactionsstaylocal.

## FP09 — Multipart media upload andpending operationstate

**Location/classification:** httpdocs/js/FTPerson.js:525-569,621-705,1705-1709;httpdocs/js/FTPets.js:20,23-24;C.

**Standards:** CS-01/03/08; WA-SESSION-001, WA-PRIV-002, WA-SHARED-001.

**Disposition: Partially Conforming.** FTPerson.js:537-552 andPets23 build FormDatawithoutforcingJSON Content-Type,allowingbrowsermultipartboundary. Mainupload disablesbuttons534-535;HTTPfailure558-559/success565-566 restorethem. Fetch rejection/JSON parsefailure reaches1707-1708 statuscatch withoutreenabling;uncertainoutcome remainsunhandled. No automatic replay isimplemented. Petsmodal20 hasfinallysaveenable.

**Existing related/shared service:** NativeFormData/currentbearer plusFTPrivacywrapper;WA.api migrationmustpreservepageheaderandbodyboundary.

**Action:** RETAIN; TEST FIRST; OWNER DECISION; MIGRATE LATER. **Stage6:** Direct R16 T10 unsaved/uncertainmutation;R17 file/browsers;S6-017/018.

**Outstanding verification (NOT RUN):** Network lossafterdelivery,JSON failure,423/401,button/cancelstate,retainedfile/formandsingle-send;do not resubmit uncertainuploadautomatically.

**Modernization/approval:** Optional media/progressadapterafterbounded failurecontract;photo/petbusinessrulesretainlocal.

## FP10 — Dialog,promise-choice andimage-viewer lifecycle

**Location/classification:** httpdocs/js/FTPerson.js:295-335,835-941,1634-1640,1734-1760;httpdocs/js/FTPrivacy.js:10-22;httpdocs/js/FTPets.js:20;C.

**Standards:** CS-01/07/08; WA-FRONT-001, WA-SHARED-001.

**Disposition: Partially Conforming.** Main zoom295-335/1734-1760 supportsbackdrop/Escape andclearssrc;relationshipchoices835-941 resolvepromises throughspecificbuttons. Privacy10-22 andPets20 constructDOMdialogs. Focusreturn,keyboardtrap,modalcancellation/promisecompletion,browsera11y unverified. Missinggeneralcontrolleraloneisnotmandatorygap.

**Existing related/shared service:** Three localdialogimplementations;no genericWAmodalcomponentimported.

**Action:** RETAIN; TEST FIRST; OWNER DECISION; MIGRATE LATER. **Stage6:** Mostlydeferredstandardization;R17 keyboard/mobile ifselected;privatepromptsafetyimportant.

**Outstanding verification (NOT RUN):** Keyboardopen/close/return,Escape/background,pendingchoicecleanup,DOMremoval andpreservedbusinessquestions.

**Modernization/approval:** Optional dialog/promise-choice framework;do notcentralizegenealogy/privacypolicy.

## FP11 — Text status/feedback service

**Location/classification:** httpdocs/js/FTPerson.js:165-167,453,478-489,1548-1549,1662-1729;httpdocs/js/FTPets.js:12,18-24;httpdocs/js/FTPrivacy.js:13-14,49,59;C.

**Standards:** CS-07/08; WA-FRONT-001, WA-SHARED-001.

**Disposition: Conforming — source verified.** FTPerson.js:166 anderrors1665/1708/1723 usetextContent;Pets12 doeslikewise;Privacy13-14/49/59 uses text nodes/status. This verifies safe message sinksoncitedpaths,notservererrorprovenanceorwholea11y. Privateuserfieldsnotloggedhere.

**Existing related/shared service:** LocalstatushelpersandDOM;no commonfeedbackmoduleexposed.

**Action:** RETAIN; MIGRATE LATER. **Stage6:** SupportssafeR16display;helperextractiondeferred.

**Outstanding verification (NOT RUN):** Futurechange:HTML-lookingtext,aria/focus,progressandretainedinput;no runtimePASSclaimed.

**Modernization/approval:** Optional commonfeedbackhelperwithmodule-specificmessage/placement.

## FP12 — Shared tracking andscript/asset composition

**Location/classification:** httpdocs/FTPerson.html:1370-1375;httpdocs/js/usageTracking.js;A.

**Standards:** CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001, WA-CACHE-001.

**Disposition: Conforming — source verified.** HTML:1374-1375 ordersfacadebeforetracker;usageTracking.js25-38 actuallycallsWA.api.request;43-58 exitusescurrenttoken/keepalive/no retry;84-98 restoresfortracking. pagepath/durationpayloaddoesnotcontainpersonrecord/treequery. Privacywrapper isinstalledlater thanfacadecapturenativefetch17,sofuturebusinessadoptionneedsFP03compositionreview. Mixedasset/PWAacceptanceunverified.

**Existing related/shared service:** Existing sharedtrackerandWA.session/API;notproofbusinessfetchadoption.

**Action:** RETAIN; TEST FIRST. **Stage6:** R16 diagnostics/cache;R17 lifecycle;R19 authracesasapplicable;preserveboundedR15.

**Outstanding verification (NOT RUN):** Restoration/accountswitch,lifecycleduplicates,worker-old/newassets;noacceptedtestsrepeated.

**Modernization/approval:** Retainsharedtracking;no optionalrewrite.

## Reconciliation

The local compliance register WA-CF-003 and WA-CF-004 corroborates independently found business-session adoption and specialized privacy interception; it does not approve an exception or certify safe header scope. WA-CF-011 records administrator coverage as open. Current local routes/ftPrivacy.js:49 and services/administratorAccess.js now show centralized dual-gate verification, contrary to older descriptive assertions in standards/CLAUDE/TechSummary about a username-only helper. This is documentation/implementation drift, not a conflict with the approved two-gate policy and not a claim all administrator CRUD/ownership-transfer endpoints pass. The handoff header overwrite remains a separately source-established defect. R15-01–05 and S6-017 records preserve selected navigation/missing-header and upload passes, explicitly leaving propagation and interception review open. Existing T12 footer documents 90/90 bounded offline PASS on November15; it was read, never rerun. No additional candidates or classification changes; no earlier experiment report was used as a checklist. FP02/FP03/FP04 are three confirmed functional areas; multiple observations within one area are not inflated into extra candidates.

## Limits and controls

Scope is functional services, not comprehensive HTML/CSS, backend/schema, authorization, device or dependency auditing. Only direct modules and necessary source fragments were followed; no current remote/deployment/database identity checked. No demonstrated exploit, secret disclosure or runtime PASS is asserted from source inspection. Any source-confirmed defect is bounded by its cited path and invariant. Purely local utilities are not automatically mandatory migrations.

CS-01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern provenance, preservation, bounded evidence and owner control. Other requirements apply only as cited; unrelated native/administrator/public-endpoint contracts are not assumed applicable. D08 design direction selects no storage mechanism; D07 fail-closed refresh remains mandatory where used; D10 native model is separate; D11 public email/geocode changes remain deferred. R18 native and R20 release acceptance are not closed by this page review.

All source behavior, appearance, calculations, APIs, private data and existing evidence remain untouched. R10/R14/R15 and November15 R16-75 T12 90/90 bounded offline PASS preserved; none rerun. Prior shared-client tests do not certify independent raw fetch consumers. Required corrections need explicit scope approval; optional helper extractions remain deferred after Stage6/independent review. No revised source, installer or .diff is delivered because no source modification is authorized. Only this new report, CSV, timing report and ZIP are written.

