<#
.SYNOPSIS
  Detiene todos los procesos AppsBuilder (node, pnpm)

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/stop.ps1
#>

Write-Host '=== AppsBuilder: deteniendo procesos ===' -ForegroundColor Cyan

$killed = 0

# Matar todos los node
Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
  Stop-Process -Id $_.Id -Force
  $killed++
}

# Matar todos los pnpm
Get-Process pnpm -ErrorAction SilentlyContinue | ForEach-Object {
  Stop-Process -Id $_.Id -Force
  $killed++
}

if ($killed -gt 0) {
  Write-Host "[ok] Se mataron $killed procesos" -ForegroundColor Green
} else {
  Write-Host "[~] No había procesos corriendo" -ForegroundColor Yellow
}

# Verificar que los puertos estén libres
Write-Host "[~] Verificando puertos..." -ForegroundColor Yellow
$portsOk = $true
foreach ($port in 3000, 3001, 3002, 4000) {
  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if ($null -ne $conn) {
    Write-Host "  [ERROR] Puerto $port sigue ocupado" -ForegroundColor Red
    $portsOk = $false
  } else {
    Write-Host "  [ok] Puerto $port libre" -ForegroundColor Green
  }
}

if ($portsOk) {
  Write-Host '[ok] Todos los puertos están libres' -ForegroundColor Green
} else {
  Write-Host '[WARNING] Algunos puertos aún están ocupados. Espera unos segundos e intenta de nuevo.' -ForegroundColor Yellow
}
