$ErrorActionPreference = "Stop"
$src = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$dest = Join-Path $env:USERPROFILE ".cursor\portfolio"
$skillDest = Join-Path $env:USERPROFILE ".cursor\skills\portfolio-commander"

New-Item -ItemType Directory -Force -Path "$dest\scripts","$dest\dashboard","$dest\requests" | Out-Null
Copy-Item "$src\scripts\scan_projects.py" "$dest\scripts\" -Force
Copy-Item "$src\dashboard\index.template.html" "$dest\dashboard\" -Force
if (-not (Test-Path "$dest\config.yaml")) {
  Copy-Item "$src\config.example.yaml" "$dest\config.yaml"
}
if (-not (Test-Path "$dest\projects-registry.xml")) {
  Copy-Item "$src\projects-registry.example.xml" "$dest\projects-registry.xml"
}
if (-not (Test-Path "$dest\requests\inbox.xml")) {
  @"
<?xml version="1.0" encoding="UTF-8"?>
<requests generated="install"></requests>
"@ | Set-Content "$dest\requests\inbox.xml" -Encoding UTF8
}

New-Item -ItemType Directory -Force -Path $skillDest | Out-Null
Copy-Item "$src\skill\SKILL.md" "$skillDest\SKILL.md" -Force

Write-Host "Installed to $dest"
Write-Host "Skill: $skillDest"
Write-Host "Run: python `"$dest\scripts\scan_projects.py`""
