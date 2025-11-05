param(
  [string]$BaseUrl = 'http://localhost:4002',
  [string]$DatabaseUrl = 'postgres://postgres:postgres@localhost:5432/telecomai',
  [switch]$StartBackend,
  [switch]$StopStartedBackend,
  [int]$TimeoutSec = 60
)

$ErrorActionPreference = 'Stop'

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }

function Wait-Health($url, [int]$timeout = 60) {
  $deadline = (Get-Date).AddSeconds($timeout)
  while ((Get-Date) -lt $deadline) {
    try {
      $res = Invoke-RestMethod -Uri "$url/health" -Method GET -TimeoutSec 5
      if ($res.status -eq 'ok') { return $true }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  return $false
}

$root = Split-Path -Path $PSScriptRoot -Parent
$backendDir = Join-Path $root 'backend'

Write-Step "Checando backend em $BaseUrl"
$serverUp = $false
try {
  $serverUp = Wait-Health $BaseUrl $TimeoutSec
} catch { $serverUp = $false }

$startedProc = $null
if (-not $serverUp -and $StartBackend) {
  Write-Step "Subindo backend com envs e workers habilitados"
  $cmd = @"
`$env:DATABASE_URL='$DatabaseUrl';
`$env:JWT_SECRET='changeme';
`$env:WEBHOOK_PROCESSOR_ENABLED='true';
`$env:OUTBOUND_SENDER_ENABLED='true';
`$env:ENABLE_DEBUG_ROUTES='true';
cd '$backendDir';
npm run dev
"@
  $startedProc = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile","-Command",$cmd -WindowStyle Hidden -PassThru
  Write-Step "Aguardando health"
  $serverUp = Wait-Health $BaseUrl $TimeoutSec
}

if (-not $serverUp) {
  throw "Servidor não disponível em $BaseUrl"
}

Write-Step "Aplicando migrations e seed (se necessário)"
Push-Location $backendDir
try {
  $env:DATABASE_URL = $DatabaseUrl
  npm run prisma:migrate | Out-Null
  npm run prisma:seed | Out-Null
} finally {
  Pop-Location
}

Write-Step "Executando webhook inbound Evolution"
$timestamp = [int]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
$evoBody = @{ type='message'; messageId='ev-'+([guid]::NewGuid().ToString()); from='+5511999999999'; to='+5500000000000'; text='Inbound via script'; timestamp=$timestamp } | ConvertTo-Json
$inboundRes = Invoke-RestMethod -Uri "$BaseUrl/api/integrations/webhooks/whatsapp/evolution" -Method POST -ContentType 'application/json' -Body $evoBody
$inboundRes | ConvertTo-Json -Depth 6 | Write-Output

Write-Step "Enfileirando mensagem outbound"
$sendBody = @{ to='+5511999999999'; message='Outbound via script'; provider='evolution' } | ConvertTo-Json
$outboundRes = Invoke-RestMethod -Uri "$BaseUrl/api/integrations/whatsapp/send" -Method POST -ContentType 'application/json' -Body $sendBody
$outboundRes | ConvertTo-Json -Depth 6 | Write-Output

Write-Step "Consultando conversas recentes"
$convs = Invoke-RestMethod -Uri "$BaseUrl/api/debug/conversations?limit=5" -Method GET
$convs | ConvertTo-Json -Depth 8 | Write-Output

Write-Step "Consultando mensagens recentes"
$msgs = Invoke-RestMethod -Uri "$BaseUrl/api/debug/messages?limit=10" -Method GET
$msgs | ConvertTo-Json -Depth 8 | Write-Output

if ($startedProc -and $StopStartedBackend) {
  Write-Step "Encerrando backend iniciado pelo script (PID $($startedProc.Id))"
  try { Stop-Process -Id $startedProc.Id -Force } catch {}
}

Write-Step "Concluído"