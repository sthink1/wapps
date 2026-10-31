# Wonderful Apps Stage 6 — H109: HelioHost exact-identity update and read-only preflight

## Included revisions (only files needed)
- `tests/stage6.h109.disposable-integration.test.js` — replacement for the previously installed H109 test. It now requires exact `johnny.heliohost.org`, database `wapps_h109_test`, and account `wapps_h109_user`, retains the existing two-switch live gate, and checks authenticated identity and TLS.
- `tests/stage6.h109.connection-preflight.test.js` — NEW read-only H109 connection/privilege preflight. The only SQL statements are SELECT, SHOW STATUS and SHOW GRANTS. No database schema or records are changed.

**Do not change `.env.test`. Do not run H109 integration with either live switch yet.**

## Install
Copy only those two files into `C:\AppProjectwDB\WonderfulAppsRender\tests`. This replaces the earlier H109 integration test. Keep your other Group 5B test files unchanged.

## PowerShell verification (first)
```powershell
git branch --show-current
git diff --check
node --check .\tests\stage6.h109.disposable-integration.test.js
node --check .\tests\stage6.h109.connection-preflight.test.js
node --env-file=.env.test .\tests\stage6.h109.connection-preflight.test.js
node --env-file=.env.test .\tests\stage6.h109.disposable-integration.test.js
```
Both execution commands must SAFE STOP with no connections.

## Set dedicated H109 credentials in the current PowerShell process only
Your **H109 database password**, not your HelioHost dashboard password, is required. Do not paste it into chat or Git. The following PowerShell securely prompts (it is converted to a plaintext process environment variable in memory only, as Node.js requires a password string):

```powershell
$env:H109_DB_HOST = 'johnny.heliohost.org'
$env:H109_DB_PORT = '3306'
$env:H109_DB_NAME = 'wapps_h109_test'
$env:H109_DB_USER = 'wapps_h109_user'
$secure = Read-Host 'H109 MariaDB password' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $env:H109_DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    Remove-Variable secure -ErrorAction SilentlyContinue
}
```

Only after the two SAFE STOP results pass, run the **read-only** preflight:

```powershell
node --env-file=.env.test .\tests\stage6.h109.connection-preflight.test.js --check-connection
```

It verifies host configuration, current authenticated user, database identity, TLS, empty schema, and the visible grant scope. The test rejects global privileges except normal `GRANT USAGE ON *.*`; it does not modify data or establish actual CREATE/DROP permissions. A failed grant check may need Plesk review; do not weaken the checks without inspecting the grant text privately. **Do not share passwords or raw secrets in output.**

When finished with the check, clear process environment credentials:

```powershell
Remove-Item Env:H109_DB_PASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:H109_DB_HOST, Env:H109_DB_PORT, Env:H109_DB_NAME, Env:H109_DB_USER -ErrorAction SilentlyContinue
```

## Hold point
Send the nonsecret output of the preflight. We will examine it **before** permitting `--run-live --confirm-empty-disposable-db`. The integration test creates and drops tables; it has not been run or validated against HelioHost here.
