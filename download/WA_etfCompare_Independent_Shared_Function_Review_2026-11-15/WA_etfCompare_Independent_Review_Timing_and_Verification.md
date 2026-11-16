# etfCompare — timing and verification

## Method, authority and missing intervals

Clock method: timestamped local PowerShell Get-Date, with America/New_York offset -05:00 (EST), November15,2026. Wall-clock intervals are differences between actual observations; displayed durations are rounded to0.001s. No timestamps are estimates.

The true assignment start is unavailable: root README and the attached assignment were read before the first reliable timing anchor18:24:35.8371850-05:00. Therefore the entire assignment duration is not fully measured. Report the measurable interval separately; it does not represent uninterrupted model computation. No timing comparison with the BinForm experiment is performed.

This experiment used only local WA files and its user-provided assignment attachment. No connector, skill, Google Drive, GitHub, external website, Render or database access occurred. No external-source wait, escalation/approval delay, sleep or user interruption occurred. Source and package operations were sequential. The shell-duration subtotal recorded through prepackaging verification is **11.587653seconds** (reported exec_command wall_time_seconds); this is a measurable shell-tool subtotal, not model computation or aggregate all-tool time. apply_patch/wrapper/model overhead and later packaging calls are outside that subtotal. Later individual tool durations remain available in the tool ledger.

## Phase ledger

| Milestone | Local timestamp with offset | Elapsed since previous milestone |
| --- | --- | --- |
| Actual assignment start | Unavailable | Unavailable initial interval |
| First reliable anchor (after initial README/attachment read) | 2026-11-15T18:24:35.8371850-05:00 | Timing anchor |
| Governing instructions reviewed | 2026-11-15T18:24:49.8698274-05:00 | 14.032 s |
| Independent inventory frozen and saved | 2026-11-15T18:26:06.0036283-05:00 | 76.134 s |
| Compliance assessment completed | 2026-11-15T18:29:14.7200218-05:00 | 188.717 s |
| Evidence reconciliation completed | 2026-11-15T18:29:46.6583791-05:00 | 31.938 s |
| Completion of all three report drafts | 2026-11-15T18:33:32.9542634-05:00 | 226.296 s |
| First complete ZIP verification | 2026-11-15T18:33:33.6622083-05:00 | 0.708 s |

Measured wall-clock total through first complete ZIP verification: **537.825 seconds**. Entire assignment duration is unavailable because initial instruction/attachment reading preceded the anchor.

Report1/CSV were drafted and hashed at18:31:22.2764594-05:00. Report3 was then prepared and the full package verified. The finalization script records the exact report-draft and first ZIP-verification timestamps above, updates this new ledger, reseals the ZIP and verifies every final entry again. That administrative sealing tail is measured in the final tool ledger separately, since an artifact cannot embed a timestamp captured after its own final bytes without another edit. No missing interval is silently counted as active examination.

## Independence, scope and preservation

Independent Phase A was saved at18:26:06.0036283-05:00, before compliance assessment and before reading prior ETF register/testing reports. Initial inventory-file SHA-256 at that milestone:046A59AD1E917E5F977C9260259C748B4894A814A170F35A13E20E61E0058371. This identifies the initial saved report before compliance material was appended, not the final report hash.

Frozen logical inventory:10 candidates,2A/8C, original IDs/locations/classifications/rationales/confidence retained. No additions or reclassifications after reconciliation. The final matrix contains exactly one row per original candidate,15 required columns. Principal excluded ETF calculations/workflows remain described in Report1. No earlier BinForm report was opened or used as a checklist for this task; prior conversation familiarity with WA is disclosed.

Outcome counts:2 confirmed nonconformance candidates;8 candidates needing targeted operational verification;6 optional deferred modernization candidates. These overlap and measure different dimensions. Primary dispositions:2 confirmed,1 approved migration pending,4 partial,3 source-verified conforming. No candidate is certified under all runtime conditions.

Source:httpdocs/etfCompare.html;769lines;28,177bytes.
Local SHA-256:091276709EF6E13761A7668A9DC2E3D49483AD758A00CA2596FCBEBD7D29977B.
Local branch:reviseLogIn.
Local Git HEAD:1bc93d86a194cdcc57a7280de226f1bfee10f10c.
These identify local files/checkouts only; no remote equality or deployed baseline is asserted.

The existing Git status at start/prepackaging retained deletions of httpdocs/bday.html and httpdocs/images/logo.png, plus untracked dated handoff/Wave0 docs and download/. These changes predate this task and were left untouched. Twenty-one reviewed local files were hashed and rechecked with no difference. Main/source/shared/standards hashes were captured at or before their source assessment; later evidence hashes after their reads but before packaging. This is bounded coverage, not a hash audit of every unrelated untracked project file.

Only these three new reports and their new sibling ZIP were written. No existing WA file, source, standards, register, prior report/ZIP or service was modified. No source reformats, branch changes, commit/push/merge, application test/build, browser action, clipboard/print operation, database access or deployment occurred.

## Exact local files examined and SHA-256

| Path | SHA-256 |
| --- | --- |
| README.md | AEEF796D5710FB0A892D48C1C07326937D15FE62495D5C2D642584C23E0C517D |
| AGENTS.md | F1DC56F8D5EF961C7195BDB36DE5C016EF804771DDA00DFB6474667A652BD3DD |
| CLAUDE.md | 1C585AFD6CC6AC63941188A451E965B1300ADAEA97615393D8333E27F332C18E |
| TechSummary.md | 62283CFAA0959AB05A9DE1F13E4A6108354B42457C573BCF5B4A14F58C9E57C6 |
| standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md | 02CCC4B35E9CC0DE4218E23082CF17F0FBA444E6F1B9B088A778266FAE125361 |
| standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md | F6BB22BAC44707BC2EC74E7111D0B3C1E73256958011974CF19929F6D0A50FD0 |
| standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md | 48D944DECA7C4D03B465CF66C9082117E187AA8DB0221107FFFB8812E00E8FB2 |
| httpdocs/etfCompare.html | 091276709EF6E13761A7668A9DC2E3D49483AD758A00CA2596FCBEBD7D29977B |
| httpdocs/js/holidays.js | 88A61357B421F11AD9D66707A99F9389475B71A5EFB4BDC9ACC2610D4AD25D23 |
| httpdocs/js/waPlatform.js | 57A5AAE55188AB89D279DC69466414F14F2B3965B8C17F8F64EEB7D568ECC17D |
| httpdocs/js/usageTracking.js | 717E04C20FD1E56E7013AAFA9F020FB70304C4D466B2B21F9B6A1434F2BCD138 |
| server.js | 00B8FE5E521AB65CD41DCA62D48968D8739D7282F8B0458F79660D06DD60CC81 |
| routes/etf.js | 40F93B922E06FF3F8ADC528DFE6C40ABC6EF9FA97136A7ACDC8CD4687FC86264 |
| dbConnection.js | A16086C538CF93E87F60768E8912D4416F97EA3B15B1654953DBD95C5720BEB6 |
| docs/Stage6_OpenItems.md | EFA544FE603CA97C4DAA9909BB9A9214772DF9AE86C2F29EACD1E895A8137447 |
| docs/Stage6_Render_TestPlan.md | 67545A4732D3714D8948F081DC495DD61E6EA7137C1BB1CCF5C4EEDE3B771923 |
| docs/WA_Standards_Compliance_Register.md | 94DCE444AED2F2679AE2579189680A863FA34FE01F19ED993A30FAFC327DB344 |
| docs/WA_R16-75_T12_Offline_Results_2026-11-15.md | 93ADFF06C568E16E957DEA0C36FEA91CD13D8F0F1E6E6B8EFA3FA816A0A432DF |
| docs/WA_R16-75_T12_Full_Regression_2026-11-15.tap | 25C06E0FF7D97B836C0BDCC77406F146DFA29F2FDE25535AB37A0ED2099FE37E |
| change/README_R15-49B_ETF_Tracking.txt | 09539C56E0F7BC4D74226408C9CAE6622808F351E480C89C9D5576B389669C98 |
| change/README_R16_ETF_HTTP_Error.txt | FF69CD4A124B539DCBCE58F6739D787AF130F313290802CDD8C14623B2D5DB27 |

Target JavaScript and its three imports were read in full. Root README, Core and AGENTS were explicitly read; relevant Detailed/Register/CLAUDE/TechSummary policy and frontend clauses were consulted. server.js mounted ETF lines and selected routes/etf.js/dbConnection.js producer/cache/date portions only were inspected. Evidence documents were read selectively for ETF/R16-R20/T12 contracts, not as a comprehensive audit. Filename-only searches do not certify all prior review material was found. The assignment attachment was read outside the project and is not a WA source baseline.

## Prior evidence and actual checks

- R16-75 T12 November15 **90/90 bounded offline PASS,0fail** is preserved. Existing report and TAP footer read; no tests rerun. Local server.js and waPlatform.js hashes match cited T12 identities. No page-wide/browser/live-state acceptance is inferred.
- Prior R10/R14/R15 bounded acceptances remain intact. R15-49B tracking evidence corroborates ETF ordered scripts and representative page/time results. It does not certify this page's independent business session handling.
- WA-CF-002 corroborates source token snapshot/adoption gap. Later local-register T06/T11 observations are historical documentation only; actual T09 shared-client and T10 unsaved-form browser acceptance remains open.
- Application tests/builds:NOT RUN, expressly prohibited. Proposed checks in Report1/CSV are unexecuted.
- Packaging checks:matrix10 unique IDs,15 required nonempty columns; frozen inventory names/locations/classifications preserved; exactly3 staged reports/ZIP entries; each final ZIP-entry SHA-256 equals the staged file bytes. No ZIP extraction/additional output files needed.
- Initial source-preservation check:all21 reviewed hashes unchanged. Final verification rechecks them and Git status. This is review evidence, not runtime certification.

## Report hashes and ZIP verification

Report1 SHA-256:
4EDAE9578C9D2C36D04653BECB65B784A79A211A8807893BF63B6B8DC8AC7C26.

CSV SHA-256:
96D68589284E8F7C1024E71E66C8AF4EA2CDF55F62D76F673BE630A2EE974F7E.

Timing report/ZIP exact final hashes are emitted after sealing in the final tool ledger. A file cannot contain its own exact final SHA-256 or the enclosing ZIP SHA-256 without changing those bytes.

ZIP:download/WA_etfCompare_Independent_Shared_Function_Review_2026-11-15.zip.
Exactly three members:
- WA_etfCompare_Independent_Shared_Function_Review.md
- WA_etfCompare_Independent_Shared_Function_Matrix.csv
- WA_etfCompare_Independent_Review_Timing_and_Verification.md

PASS: three reports present; ten unique matrix rows; fifteen nonempty columns; frozen Phase A prefix unchanged; twenty-one source/evidence hashes unchanged; three ZIP members exactly match staged bytes. Final sealing/readback results and later endpoint are emitted in the tool ledger.

No installable source or unified .diff is applicable because no existing source is revised. Later corrections, optional migrations, tests or further examinations require owner authorization. Stop after this report-only package.

