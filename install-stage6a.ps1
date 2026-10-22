param([Parameter(Mandatory=$true)][string]$ProjectRoot)
$ErrorActionPreference='Stop'
$ProjectRoot=(Resolve-Path $ProjectRoot).Path
$source=Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path (Join-Path $ProjectRoot '.env.test'))) { throw 'Missing .env.test in project root' }
$branch = (& git -C $ProjectRoot branch --show-current).Trim()
if ($branch -ne 'reviseLogIn') { throw "Expected reviseLogIn branch. Actual: $branch" }
$testEnv = Join-Path $ProjectRoot ".env.test"

$database = & node "--env-file=$testEnv" -p 'process.env.DB_NAME'

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($database)) {
    throw "Unable to read DB_NAME from .env.test. Installation cancelled."
}

$database = $database.Trim()

if ($database -ne 'sql5838929') {
    throw "Refusing install: test DB expected sql5838929; got $database"
}
$stamp=Get-Date -Format 'yyyyMMdd_HHmmss'
$backup=Join-Path $ProjectRoot ".stage6a-backups/$stamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null
$files=@('services/browserSession.js','services/verifyAccessToken.js','middleware/auth.js','middleware/subscriptionAccess.js','routes/users.js','routes/tnna.js','send_email.js','tests/stage6a.test.js')
foreach ($file in $files) {
 $target=Join-Path $ProjectRoot $file; $src=Join-Path $source $file
 if(-not(Test-Path $src)){throw "Missing package file: $file"}
 $saved=Join-Path $backup $file
 New-Item -ItemType Directory -Force -Path (Split-Path $saved -Parent) | Out-Null
 if(Test-Path $target){Copy-Item $target $saved -Force}else{ New-Item -ItemType File -Path ($saved+'.was-absent') -Force | Out-Null }
}
foreach ($file in $files) {
 $target=Join-Path $ProjectRoot $file
 New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
 Copy-Item (Join-Path $source $file) $target -Force
}
Write-Host "Stage 6A files installed. BACKUP: $backup"
Write-Host 'Do not run with production .env. Next: node tests/stage6a.test.js'
