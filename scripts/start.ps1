<#
.SYNOPSIS
  Comando unico de AppsBuilder: chequea prerequisitos, instala si falta,
  levanta los servicios que no esten corriendo y abre el navegador en el form.

  Backend   -> http://localhost:4000
  Form      -> http://localhost:3001  (builder-ui)
  Admin     -> http://localhost:3002  (web-admin)

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/start.ps1
#>

$ErrorActionPreference = 'Stop'

function Test-PortListen([int]$Port) {
  try {
    $c = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $c
  } catch {
    return $false
  }
}

function Wait-Http([string]$Url, [int]$TimeoutSec = 120) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
    try {
      $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $true }
    } catch { }
    Start-Sleep -Milliseconds 1000
  }
  return $false
}

$CurrentUrl = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $CurrentUrl
Set-Location $Root

Write-Host '=== AppsBuilder: inicio unico ===' -ForegroundColor Cyan

# 1) Prerequisitos
foreach ($cmd in @('node', 'pnpm', 'git')) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Falta '$cmd'. Instalalo para continuar." -ForegroundColor Red
    exit 1
  }
}
Write-Host "[ok] prerequisitos: node $(& node --version) / pnpm $(& pnpm --version)" -ForegroundColor Green

# 2) Instalar dependencias si falta node_modules (en raiz o en alguna app)
$needsInstall = -not (Test-Path "$Root\node_modules")
if (-not $needsInstall) {
  $missingDeps = @('apps/backend', 'apps/builder-ui', 'apps/web-admin') |
    Where-Object { -not (Test-Path "$Root\$_\node_modules") }
  $needsInstall = $missingDeps.Count -gt 0
}
if ($needsInstall) {
  Write-Host '[~] Instalando dependencias (pnpm install)...' -ForegroundColor Yellow
  & pnpm install
  if ($LASTEXITCODE -ne 0) {
    Write-Host '[ERROR] pnpm install falló.' -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host '[ok] dependencias ya instaladas' -ForegroundColor Green
}

# 3) MongoDB: si no responde, el backend igual arranca y reporta db:'down'
#    (auto-seed: al conectar una base VACÍA la siembra sola; ver apps/backend/src/scripts/seed.ts)
$mongoUp = Test-PortListen 27017
if (-not $mongoUp) {
  Write-Host '[~] MongoDB local no responde en 27017 (si usás Atlas ignorá esto -> el backend usa MONGODB_URI del .env)' -ForegroundColor Yellow
}

# 4) Levantar servicios faltantes en background (cada uno con su propio log)
$services = @(
  @{ Name = 'backend';  Port = 4000; Filter = '@saas/backend' },
  @{ Name = 'form';     Port = 3001; Filter = 'appsbuilder-ui' },
  @{ Name = 'admin';    Port = 3002; Filter = 'appsbuilder-admin' }
)

$missing = @()
foreach ($svc in $services) {
  if (Test-PortListen $svc.Port) {
    Write-Host "[ok] $($svc.Name) ya está corriendo en :$($svc.Port)" -ForegroundColor Green
  } else {
    $missing += $svc
  }
}

if ($missing.Count -gt 0) {
  Write-Host "[~] Levantando: $((($missing | ForEach-Object { $_.Name }) -join ', '))..." -ForegroundColor Yellow

  $logDir = Join-Path $Root 'logs'
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null

  $pnpmCmd = (Get-Command pnpm.cmd -ErrorAction SilentlyContinue).Source

  foreach ($svc in $missing) {
    $stdout = Join-Path $logDir "$($svc.Name).log"
    $stderr = Join-Path $logDir "$($svc.Name).err.log"
    Write-Host "[~] $($svc.Name) -> pnpm --filter $($svc.Filter) run dev (log: logs\$($svc.Name).log)" -ForegroundColor Yellow
    Start-Process -FilePath $pnpmCmd -ArgumentList '--filter', $svc.Filter, 'run', 'dev' `
      -WorkingDirectory $Root -RedirectStandardOutput $stdout `
      -RedirectStandardError $stderr -WindowStyle Hidden
  }

  foreach ($svc in $missing) {
    $url = 'http://localhost:' + $svc.Port
    Write-Host "[~] Esperando $($svc.Name) ($url)..." -ForegroundColor Yellow
    if (Wait-Http $url 150) {
      Write-Host "[ok] $($svc.Name) arriba en $url" -ForegroundColor Green
    } else {
      Write-Host "[ERROR] $($svc.Name) no respondió a tiempo. Revisá logs\$($svc.Name).log / logs\$($svc.Name).err.log" -ForegroundColor Red
    }
  }
}

Write-Host '[ok] Todo arriba. Para frenar: powershell -File scripts\stop.ps1' -ForegroundColor Green
Start-Process 'http://localhost:3001'