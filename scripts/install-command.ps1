<#
.SYNOPSIS
  Habilita el comando `appsbuilder` desde cualquier lugar: agrega la raíz del repo al
  PATH del usuario actual (CurrentUser, persistente) y crea los wrappers que faltan.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\install-command.ps1
#>

$ErrorActionPreference = 'Stop'

$CurrentUrl = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $CurrentUrl

# Wrappers (bash para Git Bash/MINGW, cmd para PowerShell/Windows Terminal)
$bash = Join-Path $Root 'appsbuilder'
$cmd = Join-Path $Root 'appsbuilder.cmd'

$bashContent = @'
#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$SCRIPT_DIR/scripts/appsbuilder.ps1"
'@
$cmdContent = @'
@echo off
set "SCRIPT_DIR=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%scripts\appsbuilder.ps1"
'@

if (-not (Test-Path $bash)) { Set-Content -Path $bash -Value $bashContent -Encoding UTF8 }
if (-not (Test-Path $cmd))  { Set-Content -Path $cmd  -Value $cmdContent  -Encoding ASCII }

# En Git Bash/MINGW el wrapper sin extensión necesita bit de ejecución
if (Get-Command bash -ErrorAction SilentlyContinue) {
  bash -c "cd '$($Root.Replace("'", "'\''"))' && chmod +x appsbuilder" 2>$null
}

# Agregar la raíz al PATH persistente del usuario si no está
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -split ';' | Where-Object { $_.TrimEnd('\') -ieq $Root }) {
  Write-Host '[ok] La raíz ya está en el PATH del usuario.' -ForegroundColor Green
} else {
  $newPath = if ($userPath) { $userPath.TrimEnd(';') + ';' + $Root } else { $Root }
  [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
  # Aplica al proceso actual para que funcione ya en esta consola
  [Environment]::SetEnvironmentVariable('Path', $newPath, 'Process')
  Write-Host '[ok] Raíz agregada al PATH del usuario. Abrí una terminal nueva o ya podés tipear: appsbuilder' -ForegroundColor Green
}

Write-Host '[ok] Listo. Desde la raíz del proyecto tipeá:  appsbuilder' -ForegroundColor Cyan
Write-Host "    (o equivalente a pnpm start -> monitoreo en vivo del wizard)" -ForegroundColor DarkGray