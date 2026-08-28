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

# 3) MongoDB: si no responde, arrancar backend directo contra el mock (sin 5 reintentos)
$mongoUp = Test-PortListen 27017
if (-not $mongoUp) {
  Write-Host '[~] MongoDB no responde en 27017 -> backend usará mock store (data.json) sin espera' -ForegroundColor Yellow
  $env:MONGODB_MAX_RETRIES = '1'
  $env:MONGODB_SELECTION_TIMEOUT_MS = '800'
}

# 4) Levantar servicios faltantes en paralelo
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
  $logDir = Join-Path $Root '.devlogs'
  if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

  $filters = $missing | ForEach-Object { "--filter=$($_.Filter)" }
  $args = @('-r', '--parallel') + $filters + @('run', 'dev')
  $stdout = Join-Path $logDir 'dev.stdout.log'
  $stderr = Join-Path $logDir 'dev.stderr.log'

  # pnpm.cmd (no la shim .ps1) porque Start-Process no ejecuta scripts de PowerShell
  $pnpmCmd = (Get-Command pnpm.cmd -ErrorAction SilentlyContinue).Source
  if (-not $pnpmCmd) { $pnpmCmd = (Get-Command pnpm -ErrorAction SilentlyContinue).Source }

  $proc = Start-Process -FilePath $pnpmCmd -ArgumentList $args -WorkingDirectory $Root -PassThru -NoNewWindow -RedirectStandardOutput $stdout -RedirectStandardError $stderr
  Write-Host "[~] pnpm dev en background (pid $($proc.Id)); logs en .devlogs/"

  # Esperar el form y el backend
  $formOk = Wait-Http 'http://localhost:3001'
  $backOk = Wait-Http 'http://localhost:4000/api/health'
  if (-not $formOk) {
    Write-Host '[ERROR] El form (3001) no respondió a tiempo. Revisá .devlogs/dev.stderr.log' -ForegroundColor Red
    Get-Content $stderr -Tail 30 -ErrorAction SilentlyContinue | Write-Host -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host '[ok] Todo arriba' -ForegroundColor Green
}

# 5) Abrir el navegador en el form
Write-Host "[ok] Abriendo http://localhost:3001 ..." -ForegroundColor Green
Start-Process 'http://localhost:3001'

Write-Host ''
Write-Host 'Servicios:' -ForegroundColor Cyan
Write-Host "  Form     -> http://localhost:3001"
Write-Host "  Admin    -> http://localhost:3002"
Write-Host "  Backend  -> http://localhost:4000"
Write-Host ''
Write-Host 'Para detener todo: Ctrl+C en la ventana donde corre pnpm dev, o matá el proceso pnpm.' -ForegroundColor DarkGray