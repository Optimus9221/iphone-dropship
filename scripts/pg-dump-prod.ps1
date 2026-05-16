#Requires -Version 5.1
<#
  Dump production PostgreSQL to ./dumps/ (gitignored).
  Usage:
    $env:DATABASE_URL_PROD = "postgresql://..."
    .\scripts\pg-dump-prod.ps1
  Or:
    .\scripts\pg-dump-prod.ps1 -ProdUrl "postgresql://..."
#>
param(
  [string]$ProdUrl = $env:DATABASE_URL_PROD
)

$ErrorActionPreference = "Stop"

if (-not $ProdUrl) {
  Write-Error "Set DATABASE_URL_PROD or pass -ProdUrl (production connection string)."
  exit 1
}

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDump) {
  Write-Error "pg_dump not found in PATH. Install PostgreSQL client tools or use the Docker one-liner in docs/LOCAL-PROD-DB-DUMP.md"
  exit 1
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$dumpsDir = Join-Path $repoRoot "dumps"
New-Item -ItemType Directory -Force -Path $dumpsDir | Out-Null

$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$outFile = Join-Path $dumpsDir "iphone_dropship_prod_$ts.sql"

Write-Host "Writing dump to $outFile"

# --clean --if-exists: restore can replace objects if re-applied; safe for pg-restore-local fresh DB too.
& pg_dump $ProdUrl --no-owner --no-acl --clean --if-exists -f $outFile
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "Done."
Write-Host $outFile
