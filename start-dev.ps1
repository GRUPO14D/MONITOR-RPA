# start-dev.ps1 - Starts backend and frontend in development mode
# Opens two separate windows: one for Fastify (tsx watch) and one for Vite

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting MONITOR-RPA in DEV mode..." -ForegroundColor Cyan

$hasEnvFile = (Test-Path "$root\.env") -or (Test-Path "$root\.env.local")
if (-not $hasEnvFile -and -not $env:DATABASE_URL) {
    Write-Host "WARNING: no .env/.env.local file found and DATABASE_URL is not set in the current shell." -ForegroundColor DarkYellow
    Write-Host "Backend may fail until DATABASE_URL is configured." -ForegroundColor DarkYellow
}

# Backend - tsx watch (hot reload)
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\back-server'; Write-Host '[BACKEND] Starting on http://localhost:8000' -ForegroundColor Green; npm run dev"
)

# Frontend - Vite dev server
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root'; Write-Host '[FRONTEND] Starting Vite dev server...' -ForegroundColor Yellow; npm run dev"
)

Write-Host ""
Write-Host "Two terminals opened:" -ForegroundColor Cyan
Write-Host "  Backend  -> http://localhost:8000" -ForegroundColor Green
Write-Host "  Frontend -> http://localhost:5173 (or the port shown by Vite)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Vite proxy forwards /api/* to backend automatically." -ForegroundColor Gray
