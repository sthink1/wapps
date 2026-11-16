# amortization - shared-function compliance review

Authority: explicit November 16 Batch 3 authorization and four refinements (unchanged shared evidence; distinguish page copies/common causes; observed or unresolved timing; Stage 6 and proposed Master Register mapping). Original remaining-58 assignment sections 5-15 governs. Eleven Batch 3 files only, processed sequentially. No completed examination repeated.

Source: httpdocs/amortization.html. SHA-256: 55c9bd92580a0614ca35a9f57e024f98cb720aaf79ef204f1ec6d6bdc3c1d2c5. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:48:42.126686-05:00; saved completion observed 2026-11-16T09:48:42.127597-05:00. Original count 6. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AM01 | formatNumber | 210-212;250-254 | C | Format numeric schedule output | Number display reusable | Native Number/Intl; no shared formatter equivalent identified | Two-decimal comma formatting; financial arithmetic stays local | High |
| AM02 | Shared sanitizer / typed input boundary | 10-11;180-188;221-229 | C | Clean ordinary text before calculation | Input defense and type conversion reusable | DOMPurify; httpdocs/js/inputSanitizer.js | Principal/rate/term validation and date business rule | High |
| AM03 | Schedule table rendering | 233-263 | C | Render calculated values safely | DOM output context safety common | Native textContent/DOM; no shared schedule renderer equivalent identified | Amortization columns/generated payment dates and amounts | High |
| AM04 | Home navigation / keyboard semantics | 174-176 | C | Return to Home | Safe navigation and accessible controls common | Native anchor/home.html | Nested button/anchor behavior and focus | High |
| AM05 | Service-worker registration / diagnostics | 202-209 | A | Register common PWA worker | Shared cache/version and secret-free diagnostics | httpdocs/sw.js | Fixed registration message and error path | High |
| AM06 | Platform and usage-tracking integration | 266-267 | A | Track authenticated calculator usage | Cross-WA session/usage lifecycle | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Local calculation has no business transport or credential gate | High |

B-only exclusions: B-only: payment/interest/principal/remaining-balance calculations and term loop; validateDate213-220 rejecting29/30/31 is calculator-specific, existing historical concern not reopened. No business API requests, credentials/DB operations or reusable text persisted. Styling/formatting/financial arithmetic audit excluded.

## Candidate assessments

### AM01 - Conforming — source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 210-212 formats numeric .toFixed(2) then commas; actual250-254 callers use computed numbers. No universal formatter mandate; avoid changing schedule precision/calculation as helper cleanup.

Local responsibility: Two-decimal comma formatting; financial arithmetic stays local.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: Optional display-only formatting reuse preserving exact precision.

### AM02 - Conforming — source verified

CS-07/09; WA-FRONT-001. 10-11 shared sanitizer loaded; capture Calculate click188 sanitizes text principal/rate/term before222-224 Number parsing. Date typed native field; no password mutation. Numeric correctness/business validation excluded, not certified.

Local responsibility: Principal/rate/term validation and date business rule.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; R17. Outstanding verification: Capture/Enter/dependency failure and valid type conversion behavior. Deferred modernization: None.

### AM03 - Partially Conforming

CS-07/09; WA-FRONT-001. 233-263 template uses fixed markup, numeric loop/calculation values and generated date pieces; no arbitrary free-text account/name/message interpolated. PaymentDate day slice239 remains string tied to date control, no local output encoder; actual date-type/invalid-number and browser DOM behavior unverified. No demonstrated XSS or financial-correctness finding.

Local responsibility: Amortization columns/generated payment dates and amounts.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; R17. Outstanding verification: Native date value/type boundary and malformed numbers without reauditing financial formula. Deferred modernization: None.

### AM04 - Partially Conforming

CS-07/08; WA-FRONT-001, WA-SHARED-001. 175 fixed home.html native href has no untrusted URL. Button is nested inside anchor (interactive elements nested); keyboard/focus semantics need bounded browser/accessibility check. Not equated to click-only nonoperable controls or counted as confirmed runtime failure.

Local responsibility: Nested button/anchor behavior and focus.

Disposition: TEST FIRST. Stage 6: Accessibility verification; R17. Outstanding verification: Keyboard/focus/assistive navigation and proposed preserved markup correction if warranted. Deferred modernization: None.

### AM05 - Unverified

CS-09/10; WA-CACHE-001, WA-LOG-001, WA-ENV-001. RC-PWA:202-208 registers unchanged worker; shared missing-local-bday precache concern applies.205 logs fixed string (reg variable unused),206 logs worker error object; no token or credential value logged in page source/tracker inspected paths. This does not close historical project logging issue.209 BASE_URL unused.

Local responsibility: Fixed registration message and error path.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16/S6-024/030; R20 rollback relevance. Outstanding verification: Hosted precache/version behavior and bounded sanitized registration error diagnostics. Deferred modernization: None.

### AM06 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 266-267 platform before tracker; actual shared request/restore is tracker. No localStorage credential reads or business fetch in calculator; no missed transport migration asserted. Unchanged tracker source has redacted exception diagnostics/no uncertain retry.

Local responsibility: Local calculation has no business transport or credential gate.

Disposition: RETAIN; TEST FIRST. Stage 6: S6-025; R16/R17; previous R15 retained. Outstanding verification: Exact lifecycle/expiry/logout/BFCache and supported browser assets. Deferred modernization: None.

## Evidence reconciliation

Frozen independent inventory before historical finding reconciliation. WA-CF-013 remains historical/current-state-unverified; Stage6_Current_Testing_Status R16-22 source check and R16-23/24 bounded no-token observations preserved, not repeated. Day31 concern explicitly deferred. No current business API parser defect or confirmed credential disclosure inferred. Shared hashes unchanged; Master proposal links S6-024/025/030/R17 with these limits.

## Common causes and proposed Master Register relevance

No RC-HTTP-BUDGET/HTTP-variant occurrence because local calculator makes no business API request. No confirmed RC-KEYBOARD occurrence; nested native controls require verification, not automatic failure label. AM05 references shared RC-PWA and retains historical logging verification without repeating tests. Proposed Master mapping separates positive source properties, verification gaps and optional formatter work.

## Confirmed gaps and owner attention

No confirmed candidate-level nonconformance established in this bounded shared-function review. Native Home markup, date/number output, tracking/PWA and diagnostics require targeted verification. Historical Amortization token-console/day31 concerns preserved with exact evidence limits; no leak or formula defect newly demonstrated and no completed test repeated.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch03 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
