#Requires -Version 5.1
<#
  Restore a pg_dump SQL file into local PostgreSQL (drops & recreates target DB).
  Works with dumps created by pg-dump-prod.ps1.

  Usage:
    .\scripts\pg-restore-local.ps1 -DumpFile .\dumps\iphone_dropship_prod_20260101_120000.sql

  Default local admin URL matches README Docker example (user postgres, db postgres for admin commands).
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$DumpFile,

  [string]$LocalAdminUrl = "postgresql://postgres:postgres@localhost:5432/postgres",

  [string]$TargetDb = "iphone_dropship"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $DumpFile)) {
  Write-Error "Dump file not found: $DumpFile"
  exit 1
}

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  Write-Error "psql not found in PATH. Install PostgreSQL client tools."
  exit 1
}

$absDump = (Resolve-Path -LiteralPath $DumpFile).Path
Write-Host "Target database: $TargetDb (will be dropped if exists)"
Write-Host "Restoring from: $absDump"

$sqlTerminate = @"
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$TargetDb' AND pid <> pg_backend_pid();
"@

& psql $LocalAdminUrl -v ON_ERROR_STOP=1 -c $sqlTerminate
& psql $LocalAdminUrl -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS $TargetDb;"
& psql $LocalAdminUrl -v ON_ERROR_STOP=1 -c "CREATE DATABASE $TargetDb;"

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

# Build URL to new database (replace last path segment with TargetDb)
$uri = [Uri]$LocalAdminUrl
$userInfo = $uri.UserInfo
$hostPort = $uri.Host
if ($uri.Port -gt 0) { $hostPort += ":$($uri.Port)" }
$scheme = $uri.Scheme
$newUrl = if ($userInfo) { "${scheme}://${userInfo}@${hostPort}/${TargetDb}" } else { "${scheme}://${hostPort}/${TargetDb}" }
if ($uri.Query) { $newUrl += $uri.Query }

& psql $newUrl -v ON_ERROR_STOP=1 -f $absDump
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "Restore finished. Set DATABASE_URL to:"
Write-Host "  $newUrl"
