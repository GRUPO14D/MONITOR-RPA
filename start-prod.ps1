# start-prod.ps1 — Build completo e inicialização em modo produção
# O backend Fastify serve o frontend estático + API no mesmo processo e porta

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MONITOR-RPA — Build de Producao" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# [1/5] Carrega variáveis do .env na sessão atual
Write-Host "[1/5] Carregando variaveis de ambiente (.env)..." -ForegroundColor Yellow
$envFile = "$root\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            $name  = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
    Write-Host "      .env carregado." -ForegroundColor Gray
} else {
    Write-Host "AVISO: .env nao encontrado — DATABASE_URL deve estar no ambiente." -ForegroundColor DarkYellow
}

# Garante VITE_API_URL vazio para caminhos relativos funcionarem
# (browser acessa http://192.168.1.3:8000 e /api/* resolve no mesmo host)
"# Auto-gerado por start-prod.ps1 — nao editar manualmente`nVITE_API_URL=" | `
    Out-File -FilePath "$root\.env.production.local" -Encoding utf8
Write-Host "      VITE_API_URL='' (caminhos relativos)" -ForegroundColor Gray

# [2/5] Build do frontend
Write-Host "[2/5] Buildando frontend (Vite)..." -ForegroundColor Yellow
Set-Location $root
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build do frontend falhou." -ForegroundColor Red
    exit 1
}
Write-Host "      dist/ gerado com sucesso." -ForegroundColor Gray

# [3/5] Build do backend
Write-Host "[3/5] Compilando backend (TypeScript)..." -ForegroundColor Yellow
Set-Location "$root\back-server"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build do backend falhou." -ForegroundColor Red
    exit 1
}
Write-Host "      back-server/dist/server.js gerado." -ForegroundColor Gray

# [4/5] Migração do banco de dados
Write-Host "[4/5] Executando migracao do banco..." -ForegroundColor Yellow
node "$root\back-server\dist\migrate.js"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Migracao do banco falhou. Verifique DATABASE_URL no .env" -ForegroundColor Red
    exit 1
}
Write-Host "      Banco de dados OK." -ForegroundColor Gray

# [5/5] Inicia o servidor
Write-Host "[5/5] Iniciando servidor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Acesse: http://192.168.1.3:8000" -ForegroundColor Green
Write-Host "  Frontend + API no mesmo processo" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

node "$root\back-server\dist\server.js"
