# Wonderful Apps R16-75 — user-executed, non-authenticated staging-only HTTP probe.
# No changes to WA project, DB, GitHub, Render configuration, or production.
# Safe request target is hard-coded; each POST has an intentionally invalid body.
# Store output next to this script, OUTSIDE your WA project folder.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$base = 'https://wapps-stage6-test.onrender.com'
$expectedHost = 'wapps-stage6-test.onrender.com'
if (([Uri]$base).Host -ne $expectedHost -or ([Uri]$base).Scheme -ne 'https') { throw 'Refusing non-staging target' }
$marker = 'SYNTHETIC_R16_75_INTEGRATION_MARKER'
Add-Type -AssemblyName System.Net.Http
$handler = New-Object System.Net.Http.HttpClientHandler
$handler.UseCookies = $false
$handler.AllowAutoRedirect = $false
$client = New-Object System.Net.Http.HttpClient($handler)
$client.Timeout = [TimeSpan]::FromSeconds(120) # Render free instance may need to wake
$path = '/users/session-status' # body parsing occurs before routing/auth; never a write route
$target = [Uri]($base + $path)
function Test-Request([string]$name, [string]$ctype, [string]$payload) {
  $request = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Post, $target)
  $request.Headers.TryAddWithoutValidation('Accept', 'application/json') | Out-Null
  $request.Headers.TryAddWithoutValidation('X-WA-R16-Test', 'T06-T11') | Out-Null
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
  $request.Content = New-Object System.Net.Http.ByteArrayContent -ArgumentList (,$bytes)
  $request.Content.Headers.TryAddWithoutValidation('Content-Type', $ctype) | Out-Null
  $result = [ordered]@{ case=$name; status=$null; cacheControl=$null; contentType=$null; jsonShape=$null; safeMessage=$null; noStore=$false; noSyntheticLeak=$false; nestedShape=$false; passed=$false; transportError=$null }
  try {
    $response = $client.SendAsync($request).GetAwaiter().GetResult()
    try {
      $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
      $result.status = [int]$response.StatusCode
      $result.contentType = [string]$response.Content.Headers.ContentType
      $cache = @(); if ($response.Headers.Contains('Cache-Control')) { $cache = @($response.Headers.GetValues('Cache-Control')) }
      $result.cacheControl = ($cache -join ', ')
      $result.noStore = (($cache -join ',') -match '(^|[,\s])no-store([,\s]|$)')
      $result.noSyntheticLeak = (-not $body.Contains($marker))
      try {
        $parsed = $body | ConvertFrom-Json -ErrorAction Stop
        if ($null -ne $parsed -and $null -ne $parsed.error -and $parsed.error -is [pscustomobject] -and $null -ne $parsed.error.message) {
          $result.jsonShape='nested error.message'
          $result.nestedShape = $true
          $result.safeMessage = [string]$parsed.error.message
        } else { $result.jsonShape='other JSON shape' }
      } catch { $result.jsonShape='not JSON' }
      $expectedSafe = if ($result.status -ge 500) { 'Internal Server Error' } else { 'Request failed' }
      $result.passed = ($result.status -ge 400 -and $result.status -le 599 -and $result.noStore -and $result.noSyntheticLeak -and $result.nestedShape -and $result.safeMessage -eq $expectedSafe)
    } finally { $response.Dispose() }
  } catch { $result.transportError = $_.Exception.GetType().Name } finally { $request.Dispose() }
  return [pscustomobject]$result
}
try {
  $params = (1..1050 | ForEach-Object { 'p' + $_ + '=x' }) -join '&'
  $cases = @(
    (Test-Request 'T06-JSON-invalid' 'application/json' ('{"bad":' + $marker)),
    (Test-Request 'T06-urlencoded-parameter-limit' 'application/x-www-form-urlencoded' $params),
    (Test-Request 'T06-multipart-incomplete' 'multipart/form-data; boundary=WA_R16_BOUNDARY' ("--WA_R16_BOUNDARY`r`nContent-Disposition: form-data; name=`"sample`"`r`n`r`n$marker"))
  )
  $summary = [ordered]@{
    test='R16-75-T06-T11'; environment='wapps-stage6-test'; timestampUtc=[DateTime]::UtcNow.ToString('o');
    requestCount=$cases.Count; passedCount=@($cases | Where-Object { $_.passed }).Count;
    overall=if (@($cases | Where-Object { -not $_.passed }).Count -eq 0) { 'PASS_BOUNDED' } else { 'REVIEW_REQUIRED' };
    cases=$cases
  }
  $output = Join-Path $PSScriptRoot 'WA_R16-75_T06_T11_Probe_Results.json'
  ($summary | ConvertTo-Json -Depth 6) | Set-Content -LiteralPath $output -Encoding UTF8
  Write-Host "R16-75 T06/T11 request probes: $($summary.passedCount)/$($summary.requestCount) passed; overall $($summary.overall)"
  foreach ($c in $cases) { Write-Host ("{0}: HTTP {1}; no-store={2}; nested={3}; safe-message={4}; result={5}; network-error={6}" -f $c.case,$c.status,$c.noStore,$c.nestedShape,$c.safeMessage,$c.passed,$c.transportError) }
  Write-Host "Sanitized evidence file: $output"
  Write-Host 'IMPORTANT: This does not validate browser form retention or Render log output.'
} finally { $client.Dispose(); $handler.Dispose() }
