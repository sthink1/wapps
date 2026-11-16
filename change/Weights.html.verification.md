# Per-file change verification — `httpdocs/Weights.html`

**Change:** R16-75 T09 visible data-load failure feedback. **Proposal only, not installed or runtime-tested.**

## Source provenance and identity

- Authoritative source: Drive `My Drive/wonderfulApp/httpdocs/Weights.html` (file ID `1_VDYqMNRqP5Buh4kmKHC1Dv3N71UwuLL`); retrieved read-only 2026-11-16.
- Baseline: `79444` bytes; SHA-256 `3193fa1248ccfffce8499da5bdf06a88eefb0e1e749ab57a24c6e0ab25fa939d`.
- Final proposed: `80270` bytes; SHA-256 `e605dd4e661ae726eb401473e1399fbb7111e5ab11493549d5a9ea51b9f9d54c`.
- Reference copy: `change/Weights.original.html`.
- Full unified diff: `change/Weights.html.diff`.
- Local/Git equality: NOT independently verified. Confirm before installation.

## Complete original-to-final differences

1. Added a hidden `role="alert"` element immediately after the date-range label. It has no visible impact when data loads normally and displays a readable message on failure.
2. At the beginning of `fetchAndRenderData()`, added a reference to that element. All existing request paths and methods remain unchanged.
3. On successful completion of chart/table rendering, clears/hides the load-error message.
4. In the existing `catch`, uses fixed status-specific and network/generic messages with `.textContent`, marks the alert visible, and preserves existing console logging. Raw untrusted server exception text is never displayed. 401, 403 and 423 have bounded messages; other failures show generic guidance.

**Formatting-only differences:** None. Existing formatting has been preserved byte-for-byte outside these insertions; there is no whole-file reformatting. Existing full-HTML pretty-formatting requirement remains a documented owner-decision/exception gate.

## Dependency/behavior review

- Existing `WA.api.request` and `authenticatedResponse` call paths unchanged.
- Existing Weight/Activity list, chart, date-range and add/edit/delete/search handlers unchanged.
- No credentials or response bodies added to the DOM. No record mutations, new endpoints, refresh/retry logic, or automatic replay added.
- CSS reuses existing `.error` styling; `hidden` preserves normal visual appearance; alert announces failures to assistive technologies.
- One limitation: existing ancillary `/activities` and `/weightActivities` fetch response-status handling is not redesigned under this narrow change.

## Verification and limitations

- Full diff generated from exact retrieved original and final bytes; diff has three hunks, all changes accounted for above.
- Parsed 1 nonempty inline JavaScript block(s) using local `node --check`: PASS. Node version 22.16.0 (artifact-container syntax check only).
- Hashes computed after writing exact packaged byte content; package manifest provides independent verification targets.
- Browser tests, owner-local equality, hosted commit and visual regression: NOT RUN/NOT VERIFIED. See `docs/WA_Weights_T09_Test_Plan_2026-11-16.md`.
- Owner approval of installation, Git action, staging deployment or production action is NOT implied.
