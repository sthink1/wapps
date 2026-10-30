# Stage 6 documentation update — append-only, idempotent; no application or database changes.
$ErrorActionPreference = 'Stop'
$repo = (Get-Location).Path
$docs = Join-Path $repo 'docs'
$entries = @(
    @{
        Name = 'Stage6_OpenItems.md'
        Marker = '<!-- S6-041: Stage 6 API error-response disclosure -->'
        Text = @'

<!-- S6-041: Stage 6 API error-response disclosure -->
### S6-041 — Review API error responses that include exception messages

- **Status:** Open. **Priority:** High (security review; actual disclosure not demonstrated). **Stage:** 6B security / independent design-engineer review.
- **Confirmed source finding (October 30, 2026):** In `routes/familyTree.js`, the Favorite Pets error handler returns `res.status(e.status || 500).json({message:e.message || 'Favorite Pets request failed.'})`. The consolidated logging revision changes the associated `console.error` statement only; the HTTP response remains unchanged. Other API error-response patterns were not exhaustively adjudicated in this logging-only review.
- **Risk to evaluate:** Unexpected exception messages may expose internal implementation or data details to API clients. This is a potential exposure, not evidence of a real incident.
- **Required action:** Review public and authenticated API error responses, starting with the Favorite Pets handler and `routes/notifications.js`; distinguish explicitly approved user-facing validation messages from unexpected 5xx exception details. Design and implement safe responses without altering intended validation/HTTP contracts.
- **Acceptance criteria:** Reviewed route inventory, agreed error-response policy, targeted tests for validation and unexpected exceptions, and independent design-engineer sign-off. Do not mark Verified Closed until these are recorded.
- **Production:** No production changes authorized.
'@
    },
    @{
        Name = 'Stage6_Render_TestPlan.md'
        Marker = '<!-- STAGE6-LOGGING-HOSTED-2026-10-30 -->'
        Text = @'

<!-- STAGE6-LOGGING-HOSTED-2026-10-30 -->
### October 30, 2026 — Logging-security regression and outstanding checks

- `reviseLogIn` Render test service `wapps-stage6-test` was verified Live at commit `8fa035f`, using `WA_ENV=staging` and verified HelioHost test DB `wapps_test`; production and `main` unchanged. This supersedes older planning-only staging assumptions for current testing; retain historical entries as historical context.
- Logging fix in `server.js` and `morgan.js`: local redaction smoke test confirmed omission of a synthetic token-like URL query from `access.log`, `error.log`, and `combined.log`; hosted raw filesystem logs were not independently accessed on the free Render service.
- Hosted H01 normal login, H02 remembered-session reload, H03 restoration after removing access token, and H04 logout/reload: user-reported passed on commit `8fa035f` (Chrome Incognito, `charter` test account). These targeted regressions do not replace the formal hosted test matrix.
- Consolidated logging-only changes in 14 additional JS files: local `git diff --check` passed (line-ending warnings only), `node --check` passed 14/14, diff summary 69 additions / 69 deletions, and all proposed diffs reviewed. **Not yet committed, deployed or functionally regression-tested.** Preserve working tree and `_COPY.js` backups.
- Pending: local startup/functional checks, reviewed commit, isolated staging deployment and targeted hosted regressions for the consolidated revision. Do not claim hosted testing of the uncommitted revision.
- Add negative API-error-response security tests after the independent review of S6-041 (`routes/familyTree.js` Favorite Pets, plus related routes). Do not record actual credentials, tokens, cookies, reset links or sensitive exception text.
'@
    },
    @{
        Name = 'Stage6_Production_Implementation_Plan.md'
        Marker = '<!-- STAGE6-LOGGING-RELEASE-GATE-2026-10-30 -->'
        Text = @'

<!-- STAGE6-LOGGING-RELEASE-GATE-2026-10-30 -->
### October 30, 2026 — Logging / API error-response release gate

- Commit `8fa035f` contains the earlier `server.js` / `morgan.js` HTTP URL logging fix, with H01–H04 targeted hosted login regressions reported passed. This evidence does **not** certify all application logging or response handling.
- A further consolidated logging-only revision modifies 14 JS files (69 logging replacements), currently **uncommitted and not deployed**. Local whitespace, syntax and code-diff review passed; local startup, representative functional tests and isolated hosted checks remain required. Preserve backups and the existing production environment.
- **Open security item S6-041:** `routes/familyTree.js` Favorite Pets handler returns raw `e.message` in a JSON API response; separate from server-side logging. Review potentially similar exception-to-client paths, define approved safe error-response behavior and regression-test before independent design-engineer review and any production decision.
- Do not merge to `main`, redeploy production, modify production SQL, or change TNNA devices without explicit approval and the existing Stage 6 release gates.
'@
    }
)
foreach ($entry in $entries) {
    $path = Join-Path $docs $entry.Name
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing document: $path. No file changes made for this entry." }
    $content = [System.IO.File]::ReadAllText($path)
    if ($content.Contains($entry.Marker)) {
        Write-Host "ALREADY PRESENT: $($entry.Name)"
        continue
    }
    if ($entry.Name -eq 'Stage6_OpenItems.md' -and $content -match '(?m)^###?\s+(?:New item )?S6-041\b') {
        throw 'S6-041 already exists with another representation. Inspect manually before changing the register.'
    }
    $backup = "$path.before-logging-tracking-2026-10-30.bak"
    if (-not (Test-Path -LiteralPath $backup)) { Copy-Item -LiteralPath $path -Destination $backup }
    [System.IO.File]::AppendAllText($path, $entry.Text + "`r`n", [System.Text.UTF8Encoding]::new($false))
    Write-Host "UPDATED: $($entry.Name) (backup saved)"
}
Write-Host 'Review with: git diff -- docs/Stage6_OpenItems.md docs/Stage6_Render_TestPlan.md docs/Stage6_Production_Implementation_Plan.md'
