$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "== APCA SmartHelp setup ==" -ForegroundColor Cyan

if (-not (Test-Path ".venv")) {
  try {
    py -3.12 -m venv .venv
  } catch {
    python -m venv .venv
  }
}

$Py = Join-Path $Root ".venv\Scripts\python.exe"
& $Py -m pip install --upgrade pip
& $Py -m pip install -r backend\requirements.txt

if (Test-Path "frontend\package.json") {
  Push-Location frontend
  npm install
  Pop-Location
}

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
}

Write-Host "Setup complete." -ForegroundColor Green
Write-Host "Run: .\scripts\run-dev.ps1"
