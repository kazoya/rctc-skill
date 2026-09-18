$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
& "$PSScriptRoot\reset-local-data.ps1"
