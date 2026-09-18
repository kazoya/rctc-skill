$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$data = Join-Path $Root "backend\data"
if (Test-Path $data) {
  Get-ChildItem $data -Exclude "models" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force -Path @(
    "$data\pdfs", "$data\vectors", "$data\packages", "$data\topics", "$data\tmp"
  ) | Out-Null
}
Write-Host "Local generated data reset (models cache preserved if present)." -ForegroundColor Yellow
