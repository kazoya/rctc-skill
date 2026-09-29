$dash = Join-Path $env:USERPROFILE ".cursor\portfolio\dashboard"
if (-not (Test-Path (Join-Path $dash "index.html"))) {
  Write-Host "Missing index.html. Run: python $env:USERPROFILE\.cursor\portfolio\scripts\scan_projects.py"
  exit 1
}
$url = "http://127.0.0.1:8765/index.html"
Write-Host "Serving $dash at $url"
$proc = Start-Process -FilePath python -ArgumentList @(
  "-m", "http.server", "8765", "--bind", "127.0.0.1"
) -WorkingDirectory $dash -PassThru
$ready = $false
foreach ($i in 1..30) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch { Start-Sleep -Milliseconds 200 }
}
if (-not $ready) {
  Write-Host "Server did not start. Check: python --version ; port 8765 not in use."
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  exit 1
}
Start-Process $url
Write-Host "Server running (PID $($proc.Id)). Press Enter here to stop."
Read-Host
Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
