<#
.SYNOPSIS
  Detiene los servicios de AppsBuilder que estén escuchando en 4000/3001/3002.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/stop.ps1
#>

$ports = 4000, 3001, 3002
$stopped = 0

foreach ($p in $ports) {
  Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object {
      Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
      $stopped++
    }
}

if ($stopped -gt 0) {
  Write-Host "[ok] Servicios detenidos (procesos en :4000 :3001 :3002)" -ForegroundColor Green
} else {
  Write-Host '[~] No había servicios corriendo en :4000 :3001 :3002' -ForegroundColor Yellow
}