$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
Write-Host "Build helper: export an .apcahelp via the UI or POST /api/packages/export" -ForegroundColor Cyan
