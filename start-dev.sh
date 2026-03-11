#!/usr/bin/env bash
# start-dev.sh — Inicia backend e frontend em modo desenvolvimento (macOS/Linux)
# Abre duas abas/processos separados: Fastify (tsx watch) e Vite

set -e
root="$(cd "$(dirname "$0")" && pwd)"

echo "Iniciando MONITOR-RPA em modo DEV..."

# Verifica .env
if [ ! -f "$root/.env" ]; then
    echo "AVISO: .env nao encontrado — crie o arquivo com DATABASE_URL antes de continuar."
fi

# Backend — tsx watch (hot reload) com --env-file=../.env embutido no npm run dev
osascript -e "tell application \"Terminal\" to do script \"cd '$root/back-server' && echo '[BACKEND] Iniciando em http://192.168.1.3:8000' && npm run dev\"" 2>/dev/null || \
    (cd "$root/back-server" && npm run dev &)

# Frontend — Vite dev server
osascript -e "tell application \"Terminal\" to do script \"cd '$root' && echo '[FRONTEND] Iniciando Vite dev server...' && npm run dev\"" 2>/dev/null || \
    (cd "$root" && npm run dev &)

echo ""
echo "Dois processos iniciados:"
echo "  Backend  → http://192.168.1.3:8000"
echo "  Frontend → http://192.168.1.3:5173  (ou porta indicada pelo Vite)"
echo ""
echo "Proxy do Vite repassa /api/* para o backend automaticamente."
echo "DATABASE_URL carregada via --env-file=../.env (embutido em npm run dev)."
