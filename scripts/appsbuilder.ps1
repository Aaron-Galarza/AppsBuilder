<#
.SYNOPSIS
  Comando único de AppsBuilder: chequea prerequisitos, instala si falta, verifica MongoDB,
  levanta los servicios que no estén corriendo, abre el navegador en el form y queda
  monitoreando en vivo el wizard (paso/selecciones/descargas) + las consultas al backend.

  Backend   -> http://localhost:4000
  Form      -> http://localhost:3001  (builder-ui)
  Admin     -> http://localhost:3002  (web-admin)

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/appsbuilder.ps1
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'

function Test-PortListen([int]$Port) {
  try {
    $c = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $c
  } catch {
    return $false
  }
}

function Wait-Http([string]$Url, [int]$TimeoutSec = 150) {
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

Write-Host '============================================' -ForegroundColor Cyan
Write-Host '   AppsBuilder — arranque + monitoreo' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

# 1) Prerequisitos
foreach ($cmd in @('node', 'pnpm', 'git')) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Falta '$cmd'. Instalalo para continuar." -ForegroundColor Red
    exit 1
  }
}
Write-Host "[ok] prerequisitos: node $(& node --version) / pnpm $(& pnpm --version)" -ForegroundColor Green

# 2) Instalar dependencias si falta algo
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
  Write-Host '[ok] dependencias instaladas' -ForegroundColor Green
} else {
  Write-Host '[ok] dependencias ya instaladas' -ForegroundColor Green
}

# 3) MongoDB: si no responde, el backend igual arranca y reporta db:'down'
$mongoUp = Test-PortListen 27017
if (-not $mongoUp) {
  Write-Host '[~] MongoDB local no responde en 27017 (si usás Atlas ignorá esto -> el backend usa MONGODB_URI del .env)' -ForegroundColor Yellow
}

# 4) Levantar servicios faltantes en background (cada uno con su propio log)
$services = @(
  @{ Name = 'backend';  Port = 4000; Filter = '@saas/backend'; Pattern = '@saas/backend|backend\\node_modules|backend\\src' },
  @{ Name = 'form';     Port = 3001; Filter = 'appsbuilder-ui'; Pattern = 'appsbuilder-ui|next.*-p 3001' },
  @{ Name = 'admin';    Port = 3002; Filter = 'appsbuilder-admin'; Pattern = 'appsbuilder-admin|next.*-p 3002' }
)

# Limpieza de zombies: si el puerto está caído pero quedan procesos del servicio
# colgados (p. ej. cadenas pnpm+tsx rotas de una sesión anterior con EBADF), matarlos
# antes de levantar de nuevo. Si no, el nuevo choca con ellos y muere tras el primer
# health-check (síntoma: "Esperando <svc>" colgado para siempre).
function Remove-StaleServiceProcesses([hashtable]$svc) {
  if (Test-PortListen $svc.Port) { return }
  $stale = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine -match $svc.Pattern }
  foreach ($p in $stale) {
    Write-Host "[~] Limpiando proceso zombie de $($svc.Name) (PID $($p.ProcessId))..." -ForegroundColor Yellow
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Milliseconds 500
}

$missing = @()
foreach ($svc in $services) {
  if (Test-PortListen $svc.Port) {
    Write-Host "[ok] $($svc.Name) ya está corriendo en :$($svc.Port)" -ForegroundColor Green
  } else {
    Remove-StaleServiceProcesses $svc
    $missing += $svc
  }
}

if ($missing.Count -gt 0) {
  Write-Host "[~] Levantando: $((($missing | ForEach-Object { $_.Name }) -join ', '))..." -ForegroundColor Yellow

  $logDir = Join-Path $Root 'logs'
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null

  foreach ($svc in $missing) {
    $stdout = Join-Path $logDir "$($svc.Name).log"
    $stderr = Join-Path $logDir "$($svc.Name).err.log"
    Write-Host "[~] $($svc.Name) -> pnpm --filter $($svc.Filter) run dev (log: logs\$($svc.Name).log)" -ForegroundColor Yellow
    # tsx watch lee stdin para su modo interactivo; Start-Process deja el fd 0
    # roto -> EBADF. Se lanza vía cmd /c con stdin desde NUL. Ojo: el comando
    # NO debe empezar con comillas (bug de parsing de cmd /c que las descarta).
    $cmdLine = "pnpm --filter $($svc.Filter) run dev < NUL > `"$stdout`" 2> `"$stderr`""
    Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $cmdLine `
      -WorkingDirectory $Root -WindowStyle Hidden
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

Write-Host '[ok] Todo arriba. Abriendo el form...' -ForegroundColor Green
Start-Process 'http://localhost:3001'

# 5) Monitoreo en vivo: eventos del wizard (logs/wizard.ndjson) + consultas al backend (logs/backend.log)
#    Queda corriendo hasta que presiones 'q' (o Ctrl+C). No mata los servicios.
$wizardLog = Join-Path $Root 'logs\wizard.ndjson'
$backendLog = Join-Path $Root 'logs\backend.log'

$state = @{
  wizard  = @{ Path = $wizardLog;  Lines = 0 }
  backend = @{ Path = $backendLog; Lines = 0 }
}

$script:barActive = $false

function Get-NewLines([hashtable]$track) {
  if (-not (Test-Path -LiteralPath $track.Path)) { return @() }
  try {
    $total = (Get-Content -LiteralPath $track.Path -Encoding UTF8).Count
    if ($total -le $track.Lines) { return @() }
    $new = Get-Content -LiteralPath $track.Path -Encoding UTF8 | Select-Object -Skip $track.Lines
    $track.Lines = $total
    return ,$new
  } catch {
    return @()
  }
}

function Write-Bar([int]$Pct, [string]$Label) {
  $width = 20
  $filled = [math]::Min($width, [math]::Max(0, [math]::Floor($Pct / 100 * $width)))
  $bar = '[' + ('#' * $filled) + ('-' * ($width - $filled)) + ']'
  $line = (' {0,3}% {1} {2}' -f $Pct, $bar, $Label)
  Write-Host -NoNewline ("`r" + (" " * $script:barW) + "`r")
  Write-Host -NoNewline $line
  $script:barW = $line.Length
  $script:barActive = $true
}

function Write-MonitorLine([string]$prefix, [string]$text, [ConsoleColor]$color) {
  if ($script:barActive) {
    Write-Host ''
    $script:barActive = $false
  }
  Write-Host ('[{0}] {1}' -f $prefix, $text) -ForegroundColor $color
}

Write-Host ''
Write-Host '=== Monitoreo en vivo (paso/selecciones/descargas + consultas API) ===' -ForegroundColor White
Write-Host "  presioná 'q' para volver al prompt (los servicios quedan corriendo; frenalos con pnpm stop)" -ForegroundColor DarkGray

$script:barW = 0
try {
  while ($true) {
    # a) Eventos del wizard
    $wizLines = Get-NewLines $state['wizard']
    foreach ($ln in $wizLines) {
      $ln = $ln.Trim()
      if ($ln -eq '') { continue }
      try {
        $ev = $ln | ConvertFrom-Json
        $pct = if ($null -ne $ev.data.pct) { [int]$ev.data.pct } else { -1 }
        if ($ev.source -eq 'zip') {
          if ($pct -ge 0 -and $pct -lt 100) { Write-Bar $pct ([string]$ev.msg) }
          else { Write-MonitorLine 'zip' ([string]$ev.msg) Yellow }
        } else {
          $color = if ($ev.msg -match 'error') { Red } else { Cyan }
          Write-MonitorLine 'wizard' ([string]$ev.msg) $color
        }
      } catch {
        Write-MonitorLine 'wizard' $ln Gray
      }
    }

    # b) Consultas al backend (el preview y las apps la usan en :4000)
    $beLines = Get-NewLines $state['backend']
    foreach ($ln in $beLines) {
      $ln = $ln.Trim()
      if ($ln -eq '') { continue }
      if ($ln -match '^\s*(GET|POST|PUT|DELETE|PATCH)\s+/') {
        Write-MonitorLine 'api' $ln Green
      } elseif ($ln -match '(error|Error|ERR_|failed|Failed)') {
        Write-MonitorLine 'backend' $ln Red
      } else {
        Write-MonitorLine 'backend' $ln DarkGray
      }
    }

    # c) Tecla 'q' para salir del monitoreo
    try {
      if ([Console]::KeyAvailable) {
        $key = [Console]::ReadKey($true)
        if ($key.Key -eq 'Q' -or $key.Key -eq 'q') { break }
      }
    } catch { }

    Start-Sleep -Milliseconds 300
  }
} finally {
  if ($script:barActive) { Write-Host '' }
  Write-Host '' -ForegroundColor DarkGray
  Write-Host '[~] Monitoreo finalizado. Los servicios siguen corriendo (:4000 :3001 :3002).' -ForegroundColor Yellow
  Write-Host "    Para frenarlos: powershell -File scripts\stop.ps1" -ForegroundColor Yellow
}