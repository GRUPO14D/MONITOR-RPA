# start-dev.ps1 — Inicia backend e frontend em modo desenvolvimento
# Abre duas janelas separadas: uma para o Fastify (tsx watch) e outra para o Vite

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Iniciando MONITOR-RPA em modo DEV..." -ForegroundColor Cyan

# Verifica .env
if (-not (Test-Path "$root\.env")) {
    Write-Host "AVISO: .env nao encontrado — crie o arquivo com DATABASE_URL antes de continuar." -ForegroundColor DarkYellow
}

# Backend — tsx watch (hot reload) com --env-file=../.env embutido no npm run dev
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\back-server'; Write-Host '[BACKEND] Iniciando em http://192.168.1.3:8000' -ForegroundColor Green; npm run dev"
)

# Frontend — Vite dev server
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root'; Write-Host '[FRONTEND] Iniciando Vite dev server...' -ForegroundColor Yellow; npm run dev"
)

Write-Host ""
Write-Host "Dois terminais abertos:" -ForegroundColor Cyan
Write-Host "  Backend  → http://192.168.1.3:8000" -ForegroundColor Green
Write-Host "  Frontend → http://192.168.1.3:5173  (ou porta indicada pelo Vite)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Proxy do Vite repassa /api/* para o backend automaticamente." -ForegroundColor Gray
Write-Host "DATABASE_URL carregada via --env-file=../.env (embutido em npm run dev)." -ForegroundColor Gray
