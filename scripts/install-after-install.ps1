# Ejecutado tras pnpm install en la raíz
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
try {
  & "$root\scripts\install-command.ps1"
} catch {
  Write-Warning ($_.Exception.Message)
}
