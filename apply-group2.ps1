# Wonderful Apps Stage 6B-2 Group 2 - corrected, guarded Login/Home patch.
# Run from WonderfulAppsRender root. No network, database, or Git operations.
# Uses exact source anchors verified against the current WA Google Drive copies.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root = (Get-Location).Path
$homeFile = Join-Path $root 'httpdocs/home.html'
$loginFile = Join-Path $root 'httpdocs/login.html'
$moduleFile = Join-Path $root 'httpdocs/js/waPlatform.js'
$homeBackup = "$homeFile.group2-before"
$loginBackup = "$loginFile.group2-before"

foreach ($path in @($homeFile, $loginFile, $moduleFile)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing required file: $path" }
}
if ((Test-Path -LiteralPath $homeBackup) -or (Test-Path -LiteralPath $loginBackup)) {
    throw 'A .group2-before backup already exists. Stop and inspect before continuing.'
}

$h = [IO.File]::ReadAllText($homeFile)
$l = [IO.File]::ReadAllText($loginFile)
if ($h.Contains('WA.session.restore()') -or $h.Contains('WA.session.logout()') -or $l.Contains('WA.session.setAccessToken')) {
    throw 'Group 2 integration appears to be present already. Stop.'
}
if (-not $l.Contains("localStorage.setItem('token', data.token);") -or
    -not $l.Contains('keepMeLoggedIn') -or -not $l.Contains('verificationCode')) {
    throw 'Login does not match expected Group 0a login/verification source. Stop.'
}
if (-not $h.Contains('await loadSubscriptionAccess();') -or
    -not $h.Contains("'logoutBtn'") -or -not $h.Contains("localStorage.removeItem(")) {
    throw 'Home does not match expected Group 0a initialization/logout source. Stop.'
}

# Enforce unique anchors: do not patch if project structure differs from the reviewed source.
function Replace-Once([string]$source, [string]$pattern, [string]$replacement, [string]$label) {
    $regex = [regex]::new($pattern, [Text.RegularExpressions.RegexOptions]::Singleline)
    $matches = $regex.Matches($source)
    if ($matches.Count -ne 1) { throw "${label}: expected one match, found $($matches.Count). Stop." }
    # MatchEvaluator ensures that replacement text is literal (no $-expansion).
    return $regex.Replace($source, [Text.RegularExpressions.MatchEvaluator]{ param($m) $replacement }, 1)
}

# Add module once immediately before the expected inline script in each HTML page.
# Only modify a single inline-script location; preserve remaining HTML/CSS/script blocks.
$tagPattern = '(?m)^([ \t]*)<script>\s*$'
foreach ($kind in @('home', 'login')) {
    $source = if ($kind -eq 'home') { $h } else { $l }
    $all = [regex]::Matches($source, $tagPattern)
    if ($all.Count -ne 1) { throw "$kind`: expected one plain inline <script> block, found $($all.Count). Stop." }
    $newline = if ($source.Contains("`r`n")) { "`r`n" } else { "`n" }
    $m = $all[0]
    $indent = $m.Groups[1].Value
    $addition = $indent + '<script src="js/waPlatform.js"></script>' + $newline
    $source = $source.Insert($m.Index, $addition)
    if ($kind -eq 'home') { $h = $source } else { $l = $source }
}

$l = Replace-Once $l "localStorage\.setItem\('token',\s*data\.token\);" `
    'WA.session.setAccessToken(data.token);' 'Login token assignment'

# Place restore before subscription and user-display initialization, without relying on CRLF or indentation width.
$restorePattern = '(document\.addEventListener\(\s*''DOMContentLoaded''\s*,\s*async\s+function\s*\(\s*\)\s*\{\s*)(?=await\s+loadSubscriptionAccess\(\);)'
$restoreMatches = [regex]::Matches($h, $restorePattern, [Text.RegularExpressions.RegexOptions]::Singleline)
if ($restoreMatches.Count -ne 1) { throw "Home restore hook: expected one match, found $($restoreMatches.Count). Stop." }
$rm = $restoreMatches[0]
$matched = $rm.Value
$newlineHome = if ($h.Contains("`r`n")) { "`r`n" } else { "`n" }
$indentHome = '                '
$restoreCode = 'const waRestore = await WA.session.restore();' + $newlineHome +
    $indentHome + "if (!waRestore.authenticated && waRestore.reason === 'restore_unavailable') console.warn('WA session restoration unavailable.');" + $newlineHome + $indentHome
$h = $h.Substring(0, $rm.Index) + $matched + $restoreCode + $h.Substring($rm.Index + $rm.Length)

# Replace the reviewed multiline Logout callback; do not replace other click handlers.
$logoutPattern = '(?s)(\.getElementById\(\s*''logoutBtn''\s*\)\s*\.addEventListener\(\s*''click''\s*,\s*)\(\s*\)\s*=>\s*\{\s*localStorage\.removeItem\(\s*''token''\s*\);\s*alert\(\s*''You have been logged out\.''\s*\);\s*window\.location\.href\s*=\s*''home\.html''\s*;\s*\}'
$matches = [regex]::Matches($h, $logoutPattern)
if ($matches.Count -ne 1) { throw "Home logout handler: expected one match, found $($matches.Count). Stop." }
$logoutCallback = @'
async () => {
    const button = document.getElementById('logoutBtn');
    button.disabled = true;
    try {
        const result = await WA.session.logout();
        if (result.serverRevoked) {
            alert('You have been logged out.');
        } else {
            alert('Signed out of this browser. Server logout could not be confirmed.');
        }
        window.location.href = 'home.html';
    } finally {
        button.disabled = false;
    }
}
'@
$m = $matches[0]
$replacement = $m.Groups[1].Value + $logoutCallback
$h = $h.Substring(0, $m.Index) + $replacement + $h.Substring($m.Index + $m.Length)

# Postconditions before any disk write.
foreach ($check in @(
    @{ test = $h.Contains('const waRestore = await WA.session.restore();'); label = 'Home restore' },
    @{ test = $h.Contains('await WA.session.logout();'); label = 'Home server logout' },
    @{ test = $l.Contains('WA.session.setAccessToken(data.token);'); label = 'Login token setter' },
    @{ test = $h.Contains('src="js/waPlatform.js"'); label = 'Home module reference' },
    @{ test = $l.Contains('src="js/waPlatform.js"'); label = 'Login module reference' }
)) { if (-not $check.test) { throw "Postcondition failed: $($check.label)" } }

# Backups only after all transforms and checks succeed; restore automatically on partial write error.
Copy-Item -LiteralPath $homeFile -Destination $homeBackup -ErrorAction Stop
try { Copy-Item -LiteralPath $loginFile -Destination $loginBackup -ErrorAction Stop }
catch { Remove-Item -LiteralPath $homeBackup -ErrorAction SilentlyContinue; throw }
try {
    [IO.File]::WriteAllText($homeFile, $h, [Text.UTF8Encoding]::new($false))
    [IO.File]::WriteAllText($loginFile, $l, [Text.UTF8Encoding]::new($false))
} catch {
    Copy-Item -LiteralPath $homeBackup -Destination $homeFile -Force
    Copy-Item -LiteralPath $loginBackup -Destination $loginFile -Force
    throw 'File write failed; originals restored from Group 2 backups.'
}
Write-Host 'Group 2 Login/Home patch completed. Backups: *.group2-before'
Write-Host 'Review: git diff -- httpdocs/home.html httpdocs/login.html'
Write-Host 'Do not commit, push, or run production deployment.'
