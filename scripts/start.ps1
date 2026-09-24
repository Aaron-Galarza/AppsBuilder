<#
.SYNOPSIS
  Alias de `pnpm start` -> delega en scripts/appsbuilder.ps1 (chequeos + install si falta
  + arranque + monitoreo en vivo del wizard).
#>
& (Join-Path $PSScriptRoot 'appsbuilder.ps1')