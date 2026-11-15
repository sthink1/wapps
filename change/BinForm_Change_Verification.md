# WA-CF-001 — BinForm.html Change Verification

**Date:** 2026-11-15  
**State:** Proposed correction only; NOT owner-installed or browser/hosted tested.  
**Scope:** Error-message compatibility for flat/nested Budget API responses. Legacy shared-client migration remains open.

## Authoritative baseline and provenance

- Source: Google Drive `My Drive/wonderfulApp/httpdocs/BinForm.html`; Drive ID `1-9ysHpMH39XiDhv0RTQR0DrqkyVRE-eR`.
- Google Drive reported modified time `2026-11-08T23:58:30.000Z`; size 48607 bytes.
- Original SHA-256: `2cc183ba0d75cc1d16049511b1ccf7d2661d6bdcfcb088ce08e8fc82b0f7d4cf`.
- Final proposed SHA-256: `07898f5d291b1f296fe0f0aa85fe1f91c96815bb19782d0cbe98b8c8a28700a2`.
- GitHub and owner-local exact-byte equivalence: **not independently established**. Reconcile immediately before owner installation.

## Approved requirements and issue mapping

CS-01, CS-02, CS-03, CS-05, CS-07, CS-08, CS-11, CS-12; WA-PRESERVE-001, WA-CORE-001, WA-SESSION-001, WA-API-002, WA-ERROR-001, WA-FORMAT-001, WA-REVIEW-001; WA-CF-001 and S6-005/008/018/033. Other Core/technical controls unchanged by this narrow change, not certified by it.

## Exact original-to-final differences

Single edit at original line 504: replace ambiguous `(data.error || data.message)` stringification with explicitly recognized flat string, nested `error.message`, top-level `message`, or HTTP fallback. Keep current error priority, `(be)` suffix removal, fetch headers, token handling, request method/body, and all DOM/rendering logic. No other bytes changed. See `change/BinForm.original-to-final.diff` for complete comparison. **Formatting-only diffs: none outside the edited expression;** the inserted multiline block is formatted readably. Existing whole-file HTML formatting rule remains a separately reviewable obligation; no discretionary global reformatting is authorized in this narrow patch.

## Dependencies, behavior and limitations

- Inspected relevant current Drive copies of `httpdocs/js/waPlatform.js` and `routes/budget.js` read-only. Budget endpoints return flat legacy `(be)` errors and central handler may produce nested error envelopes. Shared `WA.api` already supports nested errors; however BinForm uses its own `apiFetch` and shared-script loading alone does not migrate calls.
- Does not change the existing login check, localStorage token use, expired-token refresh behavior, 401/403 presentation choices, API transport, post/put/delete replay logic, form preservation, success handling, recurrence preview or Budget data contracts.
- Real browser, staging and visual regression **not run**. The tests below are isolated/fake-response assertions, not network evidence.
- This proposal fixes one confirmed error-display bug but does not close WA-CF-001 or S6-005.

## Tests and evidence

Run from project root `C:\AppProjectwDB\WonderfulAppsRender` after reviewing/installing the proposed file:

```powershell
node .\tests\WA_CF_001_BinForm_Error_Offline.test.cjs
```

The script **reads** `httpdocs/BinForm.html`, makes no network calls, and writes **no files**. Isolated test result: 7/7 bounded isolated tests passed. Fixture coverage: flat string, nested string, top-level fallback, malformed object, missing error payload, successful POST contract and one send/no replay. Output preserved under `change/WA_CF_001_Offline_Test_Results.txt`.

## Rollback / manual installation

Keep a secure local copy of the owner's actual current `httpdocs/BinForm.html` before replacement. Confirm its SHA-256 matches the original above or stop/rebase. Owner reviews and separately approves before manually copying the proposed full file; after installation test unsaved fields, Budget create/update/delete, nested and flat validation errors, browser authentication and UI under the permitted staging/local setup. To rollback restore the owner's pre-install original; never deploy automatically.

**Closure:** NOT CLOSED. Owner installation, browser compatibility and broader legacy migration acceptance remain pending.
