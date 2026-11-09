# Wonderful Apps — R15 bounded-acceptance documentation update

Prepared: 2026-11-09. Download-only for user inspection/manual installation. **No Google Drive or local WA project files were edited.**

## Files

- `docs/Stage6_Render_TestPlan.md` — complete replacement, consolidated version 2.3; updates R15 master row to PASSED (bounded) and inserts November 9 R15 evidence supplement.
- `docs/Stage6_OpenItems.md` — complete replacement, consolidated revision 3.3; inserts November 9 R15 linked-issue reconciliation; preserves S6-005 and S6-017 Open and S6-025 In Progress.

## Installation

1. Review diffs against your current working branch copies (which could be newer than the Drive versions used here).
2. **Do not overwrite a newer local version without reconciling any changes made since the Google Drive snapshot.**
3. If source versions align, copy the complete replacements to `C:\AppProjectwDB\WonderfulAppsRender\docs\`, retaining their names.
4. Review `git diff --check`, `git diff -- docs/Stage6_Render_TestPlan.md docs/Stage6_OpenItems.md`, and status. Stage explicitly if approved.

## Scope limits

- No app code, test DB, production service, Git branch or TNNA changes.
- Historic statements remain in place as dated evidence; the Nov 9 supplement supersedes earlier R15 status only.
- R15 is PASSED (bounded), not a certification of all R15-linked S6 issues.
- `_COPY` cleanup and amortization day-31 behavior remain separate work.
- Independent engineering/security review and user approval remain release gates.
