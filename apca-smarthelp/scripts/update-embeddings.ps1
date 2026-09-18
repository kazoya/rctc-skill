$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$contentRoot = Join-Path (Split-Path -Parent $projectRoot) 'embeddings'
$apiUrl = if ($env:BELT_API_URL) { $env:BELT_API_URL.TrimEnd('/') } else { 'http://127.0.0.1:8788' }
$serverRunning = $false
try {
    Invoke-WebRequest -UseBasicParsing -Uri "$apiUrl/docs" -TimeoutSec 2 | Out-Null
    $serverRunning = $true
} catch {
    $serverRunning = $false
}

if ($serverRunning) {
    $files = @(
        Get-ChildItem (Join-Path $contentRoot 'pdf') -Filter '*.pdf' -File -ErrorAction SilentlyContinue
        Get-ChildItem (Join-Path $contentRoot 'epub') -Filter '*.epub' -File -ErrorAction SilentlyContinue
    )
    foreach ($file in $files) {
        Write-Host "Indexing $($file.Name)..."
        & curl.exe --fail --silent --show-error --max-time 600 -X POST "$apiUrl/api/documents/import" -F "file=@$($file.FullName)"
        if ($LASTEXITCODE -ne 0) { throw "Failed to index $($file.FullName)" }
        Write-Host
    }
    exit 0
}

$env:PYTHONPATH = $projectRoot
& "$projectRoot\.venv\Scripts\python.exe" "$PSScriptRoot\update_embeddings.py"
exit $LASTEXITCODE
