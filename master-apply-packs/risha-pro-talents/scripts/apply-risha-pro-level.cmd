@echo off
rem غلاف مختصر: apply-risha-pro-level.cmd E:\master E:\rctc-skill [--apply]
setlocal
if "%~2"=="" (
  echo الاستخدام: apply-risha-pro-level.cmd ^<master-path^> ^<skills-path^> [--apply] [--force]
  exit /b 2
)
node "%~dp0apply-risha-pro-level.mjs" --master "%~1" --skills "%~2" %3 %4
exit /b %ERRORLEVEL%
