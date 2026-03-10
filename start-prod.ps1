# start-prod.ps1 — Build completo e inicialização em modo produção
# O backend Fastify serve o frontend estático + API no mesmo processo e porta

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MONITOR-RPA — Build de Producao" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Garante VITE_API_URL vazio para caminhos relativos funcionarem
# (browser acessa http://192.168.1.3:8000 e /api/* resolve no mesmo host)
Write-Host "[1/4] Configurando variaveis de ambiente..." -ForegroundColor Yellow
"# Auto-gerado por start-prod.ps1 — nao editar manualmente`nVITE_API_URL=" | `
    Out-File -FilePath "$root\.env.production.local" -Encoding utf8
Write-Host "      VITE_API_URL='' (caminhos relativos)" -ForegroundColor Gray

# Build do frontend
Write-Host "[2/4] Buildando frontend (Vite)..." -ForegroundColor Yellow
Set-Location $root
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build do frontend falhou." -ForegroundColor Red
    exit 1
}
Write-Host "      dist/ gerado com sucesso." -ForegroundColor Gray

# Build do backend
Write-Host "[3/4] Compilando backend (TypeScript)..." -ForegroundColor Yellow
Set-Location "$root\back-server"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build do backend falhou." -ForegroundColor Red
    exit 1
}
Write-Host "      back-server/dist/server.js gerado." -ForegroundColor Gray

# Inicia o servidor
Write-Host "[4/4] Iniciando servidor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Acesse: http://192.168.1.3:8000" -ForegroundColor Green
Write-Host "  Frontend + API no mesmo processo" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

node "$root\back-server\dist\server.js"
