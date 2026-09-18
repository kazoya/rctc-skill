# Install safety checks (run from repo root ai-portability-advisor)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$install = Join-Path $root "install.ps1"
$dest = Join-Path $env:USERPROFILE ".cursor\skills\ai-portability-advisor"

# Dry-run destination check
$skillsRoot = [System.IO.Path]::GetFullPath((Join-Path $env:USERPROFILE ".cursor\skills"))
$destResolved = [System.IO.Path]::GetFullPath($dest)
if (-not $destResolved.StartsWith($skillsRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Destination would be outside skills root"
}

& $install | Out-Null
if (-not (Test-Path (Join-Path $dest "SKILL.md"))) {
  throw "SKILL.md missing after install"
}

$hash1 = (Get-FileHash (Join-Path $root "SKILL.md")).Hash
$hash2 = (Get-FileHash (Join-Path $dest "SKILL.md")).Hash
if ($hash1 -ne $hash2) {
  throw "Installed SKILL.md hash mismatch"
}

# Idempotent second run
& $install | Out-Null
$hash3 = (Get-FileHash (Join-Path $dest "SKILL.md")).Hash
if ($hash2 -ne $hash3) {
  throw "Second install changed SKILL.md unexpectedly"
}

Write-Host "OK install safety tests"
