@echo off
title Master Brain
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\bootstrap-node.ps1" %*
if errorlevel 1 pause
