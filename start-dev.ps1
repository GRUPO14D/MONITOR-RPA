# start-dev.ps1 — Inicia backend e frontend em modo desenvolvimento
# Abre duas janelas separadas: uma para o Fastify (tsx watch) e outra para o Vite

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Iniciando MONITOR-RPA em modo DEV..." -ForegroundColor Cyan

# Backend — tsx watch (hot reload)
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
