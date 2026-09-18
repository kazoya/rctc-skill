$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$env:PYTHONPATH = $Root
$Py = Join-Path $Root ".venv\Scripts\python.exe"
& $Py -m pytest tests\backend -q
if (Test-Path "frontend\package.json") {
  Push-Location frontend
  npm test -- --run
  Pop-Location
}
