$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$Py = Join-Path $Root ".venv\Scripts\python.exe"
if (-not (Test-Path $Py)) {
  Write-Error "Missing .venv. Run .\scripts\setup.ps1 first."
}

$env:PYTHONPATH = $Root

# Start backend
$backend = Start-Process -FilePath $Py -ArgumentList @(
  "-m", "uvicorn", "backend.app.main:app",
  "--host", "127.0.0.1",
  "--port", "8787",
  "--reload"
) -PassThru -NoNewWindow

Write-Host "Backend PID $($backend.Id) on http://127.0.0.1:8787" -ForegroundColor Green

if (Test-Path "frontend\package.json") {
  Push-Location frontend
  Write-Host "Frontend on http://127.0.0.1:5173" -ForegroundColor Green
  npm run dev -- --host 127.0.0.1 --port 5173
  Pop-Location
}
