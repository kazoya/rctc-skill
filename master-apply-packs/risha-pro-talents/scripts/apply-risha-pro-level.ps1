<#
.SYNOPSIS
  غلاف ويندوز لتطبيق حزمة ريشة برو (مستوى تسويق المواهب) على مشروع master.

.DESCRIPTION
  المنطق كله في apply-risha-pro-level.mjs (مختبَر). هذا الملف يمرر الوسائط إلى Node فقط،
  حتى لا يوجد تنفيذان متباعدان لنفس القواعد.
  جفاف افتراضي: لا يُكتب شيء بلا -Apply. لا حذف. لا استبدال لملف قائم إلا مع -Force.

.EXAMPLE
  .\apply-risha-pro-level.ps1 -MasterPath E:\master -SkillsPath E:\rctc-skill
  .\apply-risha-pro-level.ps1 -MasterPath E:\master -SkillsPath E:\rctc-skill -Apply
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)] [string] $MasterPath,
  [Parameter(Mandatory = $true)] [string] $SkillsPath,
  [string] $LevelId = 'risha-pro-talents',
  [switch] $Apply,
  [switch] $Force
)

$ErrorActionPreference = 'Stop'

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Error 'Node.js غير مثبت أو غير موجود في PATH. ثبّت Node 18+ ثم أعد المحاولة.'
  exit 1
}

$runner = Join-Path $PSScriptRoot 'apply-risha-pro-level.mjs'
if (-not (Test-Path -LiteralPath $runner)) {
  Write-Error "ملف التنفيذ مفقود: $runner"
  exit 1
}

$argv = @($runner, '--master', $MasterPath, '--skills', $SkillsPath, '--level', $LevelId)
if ($Apply) { $argv += '--apply' }
if ($Force) { $argv += '--force' }

& $node.Source @argv
exit $LASTEXITCODE
