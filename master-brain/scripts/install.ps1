# Master Brain — Windows installer (run from the platform root, e.g. E:\master)
#   .\scripts\install.ps1 [-ProjectsRoot D:\projects] [-AddToPath] [-NoDesktop] [-NoSkills]
param(
  [string]$ProjectsRoot = "",
  [switch]$AddToPath,
  [switch]$NoDesktop,
  [switch]$NoSkills
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Write-Host "Master Brain root: $Root"

# 0) Node
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Write-Error "Node.js not found. Install Node.js 18+ from https://nodejs.org then re-run."; exit 1 }
$ver = (& node -p "process.versions.node.split('.')[0]")
if ([int]$ver -lt 18) { Write-Error "Node.js $ver is too old — need 18+"; exit 1 }
Write-Host "Node.js $(& node --version) ✔"

# 1) config.json
$cfgPath = Join-Path $Root "config.json"
if (-not (Test-Path $cfgPath)) { Copy-Item (Join-Path $Root "config.example.json") $cfgPath; Write-Host "config.json created from example" }
if ($ProjectsRoot) {
  $cfg = Get-Content $cfgPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $cfg.projectsRoot = $ProjectsRoot
  $cfg | ConvertTo-Json -Depth 6 | Set-Content $cfgPath -Encoding UTF8
  Write-Host "projectsRoot → $ProjectsRoot"
}

# 2) shims
$shim = Join-Path $Root "mb.cmd"
"@echo off`r`nnode `"%~dp0bin\mb.js`" %*" | Set-Content $shim -Encoding ASCII
"@echo off`r`nnode `"%~dp0bin\mb.js`" serve --open" | Set-Content (Join-Path $Root "start-dashboard.cmd") -Encoding ASCII
Write-Host "mb.cmd + start-dashboard.cmd ✔"

# 3) .mcp.json for Claude Code (absolute path of this install)
$mcpPath = Join-Path $Root ".mcp.json"
$mcp = @{ mcpServers = @{ "master-brain" = @{ command = "node"; args = @((Join-Path $Root "bin\mcp.js")) } } }
$mcp | ConvertTo-Json -Depth 6 | Set-Content $mcpPath -Encoding UTF8
Write-Host ".mcp.json → $mcpPath ✔"

# 4) Claude Desktop config merge (backup first)
if (-not $NoDesktop) {
  $desktopDir = Join-Path $env:APPDATA "Claude"
  $desktopCfg = Join-Path $desktopDir "claude_desktop_config.json"
  if (Test-Path $desktopDir) {
    $obj = $null
    if (Test-Path $desktopCfg) {
      Copy-Item $desktopCfg "$desktopCfg.bak-$(Get-Date -Format yyyyMMddHHmmss)"
      try { $obj = Get-Content $desktopCfg -Raw -Encoding UTF8 | ConvertFrom-Json } catch { $obj = $null }
    }
    if (-not $obj) { $obj = [pscustomobject]@{} }
    if (-not ($obj.PSObject.Properties.Name -contains "mcpServers")) { $obj | Add-Member -NotePropertyName mcpServers -NotePropertyValue ([pscustomobject]@{}) }
    $entry = [pscustomobject]@{ command = "node"; args = @((Join-Path $Root "bin\mcp.js")) }
    if ($obj.mcpServers.PSObject.Properties.Name -contains "master-brain") { $obj.mcpServers."master-brain" = $entry } else { $obj.mcpServers | Add-Member -NotePropertyName "master-brain" -NotePropertyValue $entry }
    $obj | ConvertTo-Json -Depth 10 | Set-Content $desktopCfg -Encoding UTF8
    Write-Host "Claude Desktop: master-brain registered in $desktopCfg ✔ (restart Claude Desktop)"
  } else { Write-Host "Claude Desktop config folder not found ($desktopDir) — skipped (run again after installing Claude Desktop, or use: mb context)" }
}

# 5) Claude Code user skills
if (-not $NoSkills) {
  $skillsDir = Join-Path $env:USERPROFILE ".claude\skills"
  foreach ($s in @("start-skill", "master-brain")) {
    $dst = Join-Path $skillsDir $s
    New-Item -ItemType Directory -Force -Path $dst | Out-Null
    Copy-Item (Join-Path $Root "skills\$s\*") $dst -Recurse -Force
    Write-Host "skill $s → $dst ✔"
  }
  # Cursor (optional, only if Cursor skills folder exists)
  $cursor = Join-Path $env:USERPROFILE ".cursor\skills"
  if (Test-Path $cursor) { foreach ($s in @("start-skill", "master-brain")) { $dst = Join-Path $cursor $s; New-Item -ItemType Directory -Force -Path $dst | Out-Null; Copy-Item (Join-Path $Root "skills\$s\*") $dst -Recurse -Force }; Write-Host "Cursor skills ✔" }
}

# 6) PATH (optional)
if ($AddToPath) {
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  if ($userPath -notlike "*$Root*") { [Environment]::SetEnvironmentVariable("Path", "$userPath;$Root", "User"); Write-Host "Added $Root to user PATH (open a new terminal) ✔" }
}

# 7) init projects (creates projectsRoot + seeds if seed/initial-projects.json exists)
& node (Join-Path $Root "bin\mb.js") init
& node (Join-Path $Root "bin\mb.js") doctor

Write-Host ""
Write-Host "Done. Next:  .\start-dashboard.cmd   (or: mb serve --open)"
