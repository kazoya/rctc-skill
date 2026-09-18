# Install ai-portability-advisor to user Cursor skills (single source: this repo folder)
$ErrorActionPreference = "Stop"
$src = $PSScriptRoot
$dest = Join-Path $env:USERPROFILE ".cursor\skills\ai-portability-advisor"

if (-not (Test-Path (Join-Path $src "SKILL.md"))) {
  Write-Error "SKILL.md not found. Run install from ai-portability-advisor folder."
}

$destResolved = [System.IO.Path]::GetFullPath($dest)
$skillsRoot = [System.IO.Path]::GetFullPath((Join-Path $env:USERPROFILE ".cursor\skills"))
if (-not $destResolved.StartsWith($skillsRoot, [StringComparison]::OrdinalIgnoreCase)) {
  Write-Error "Refusing to install outside user .cursor\skills"
}

New-Item -ItemType Directory -Force -Path $dest | Out-Null

$exclude = @(".git")
Get-ChildItem -Path $src -Force | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
  $target = Join-Path $dest $_.Name
  if ($_.PSIsContainer) {
    Copy-Item -Path $_.FullName -Destination $target -Recurse -Force
  } else {
    Copy-Item -Path $_.FullName -Destination $target -Force
  }
}

Write-Host "Installed ai-portability-advisor to:"
Write-Host $dest
Write-Host "Single SKILL.md source at package root."
