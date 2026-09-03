<#  Master Brain — portable bootstrap.
    Finds Node.js; if missing, downloads a PORTABLE copy into <root>\.node (no admin, no installer,
    nothing added to PATH, nothing registered in Windows). Then initialises the platform and starts
    the dashboard.  Usage:  .\run.cmd        or   powershell -ExecutionPolicy Bypass -File scripts\bootstrap-node.ps1
    Switches: -NoServe (setup only)  -Port 4545  -Force (re-download portable Node)
#>
param([switch]$NoServe, [int]$Port = 0, [switch]$Force)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root
Write-Host ""
Write-Host "  Master Brain — $Root" -ForegroundColor Cyan
Write-Host ""

function Get-NodeExe {
  # 1) portable copy we installed earlier
  $portable = Join-Path $Root ".node\node.exe"
  if ((Test-Path $portable) -and -not $Force) { return $portable }
  # 2) node already on PATH
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd -and -not $Force) {
    try { $v = (& $cmd.Source --version).TrimStart('v').Split('.')[0]; if ([int]$v -ge 18) { return $cmd.Source } } catch {}
  }
  # 3) common install locations
  foreach ($p in @("$env:ProgramFiles\nodejs\node.exe", "${env:ProgramFiles(x86)}\nodejs\node.exe", "$env:LOCALAPPDATA\Programs\nodejs\node.exe")) {
    if ((Test-Path $p) -and -not $Force) { return $p }
  }
  return $null
}

$node = Get-NodeExe
if (-not $node) {
  Write-Host "  Node.js not found - fetching a portable copy (no admin needed)..." -ForegroundColor Yellow
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $arch = if ([Environment]::Is64BitOperatingSystem) { if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "x64" } } else { "x86" }
  $ver = $null
  try {
    $idx = Invoke-RestMethod -Uri "https://nodejs.org/dist/index.json" -UseBasicParsing -TimeoutSec 40
    $ver = ($idx | Where-Object { $_.lts -ne $false } | Select-Object -First 1).version
  } catch { Write-Host "  (could not read the version index: $($_.Exception.Message))" -ForegroundColor DarkYellow }
  if (-not $ver) { $ver = "v22.11.0" }   # fallback LTS
  $zipName = "node-$ver-win-$arch"
  $url = "https://nodejs.org/dist/$ver/$zipName.zip"
  $tmp = Join-Path $env:TEMP "$zipName.zip"
  Write-Host "  -> $url"
  try {
    $pw = $ProgressPreference; $ProgressPreference = "SilentlyContinue"
    Invoke-WebRequest -Uri $url -OutFile $tmp -UseBasicParsing -TimeoutSec 900
    $ProgressPreference = $pw
  } catch {
    Write-Host ""
    Write-Host "  Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Install Node.js yourself, then run this again:" -ForegroundColor Yellow
    Write-Host "      winget install OpenJS.NodeJS.LTS      (or download from https://nodejs.org)" -ForegroundColor Yellow
    Write-Host "  You can still open dashboard-offline.html - it needs nothing installed." -ForegroundColor Yellow
    Read-Host "  Press Enter to close"; exit 1
  }
  $dest = Join-Path $Root ".node"
  if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
  $stage = Join-Path $env:TEMP "mb-node-stage"
  if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
  Expand-Archive -Path $tmp -DestinationPath $stage -Force
  Move-Item (Join-Path $stage $zipName) $dest
  Remove-Item $tmp, $stage -Recurse -Force -ErrorAction SilentlyContinue
  $node = Join-Path $dest "node.exe"
  Write-Host "  Portable Node installed at .node\ ($ver, $arch)" -ForegroundColor Green
}

$nodeVer = & $node --version
Write-Host "  Node $nodeVer  ($node)" -ForegroundColor Green

# make `mb` work with whichever node we found
$shim = @"
@echo off
setlocal
set "MB_NODE=%~dp0.node\node.exe"
if exist "%MB_NODE%" ( "%MB_NODE%" "%~dp0bin\mb.js" %* ) else ( node "%~dp0bin\mb.js" %* )
"@
Set-Content (Join-Path $Root "mb.cmd") $shim -Encoding ASCII

# first run: config + projects + skills + Claude wiring
if (-not (Test-Path (Join-Path $Root "config.json"))) {
  Write-Host "  First run - setting up..." -ForegroundColor Cyan
  & powershell -ExecutionPolicy Bypass -File (Join-Path $Root "scripts\install.ps1")
} else {
  & $node (Join-Path $Root "bin\mb.js") init | Out-Null
}
& $node (Join-Path $Root "bin\mb.js") doctor

if (-not $NoServe) {
  if ($Port -gt 0) { $env:MB_PORT = "$Port" }
  Write-Host ""
  Write-Host "  Starting the dashboard - keep this window open. Ctrl+C to stop." -ForegroundColor Cyan
  & $node (Join-Path $Root "bin\mb.js") serve --open
}
