#!/usr/bin/env bash
# start-dev.sh - Starts backend and frontend in development mode (macOS/Linux)
# Opens two tabs/processes: Fastify (tsx watch) and Vite

set -e
root="$(cd "$(dirname "$0")" && pwd)"

echo "Starting MONITOR-RPA in DEV mode..."

# Check environment
if [ ! -f "$root/.env" ] && [ ! -f "$root/.env.local" ] && [ -z "${DATABASE_URL:-}" ]; then
    echo "WARNING: no .env/.env.local file found and DATABASE_URL is not set."
    echo "Backend may fail until DATABASE_URL is configured."
fi

# Backend - tsx watch (hot reload)
osascript -e "tell application \"Terminal\" to do script \"cd '$root/back-server' && echo '[BACKEND] Starting on http://localhost:8000' && npm run dev\"" 2>/dev/null || \
    (cd "$root/back-server" && npm run dev &)

# Frontend - Vite dev server
osascript -e "tell application \"Terminal\" to do script \"cd '$root' && echo '[FRONTEND] Starting Vite dev server...' && npm run dev\"" 2>/dev/null || \
    (cd "$root" && npm run dev &)

echo ""
echo "Two processes started:"
echo "  Backend  -> http://localhost:8000"
echo "  Frontend -> http://localhost:5173 (or port shown by Vite)"
echo ""
echo "Vite proxy forwards /api/* to backend automatically."
