@echo off
rem AppsBuilder — arranque + monitoreo (wrapper para cmd / PowerShell).
rem Requiere que la raiz del repo este en el PATH (p. ej. tras correr scripts\install-command.ps1).
set "SCRIPT_DIR=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%scripts\appsbuilder.ps1"