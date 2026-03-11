#!/usr/bin/env bash
# start-prod.sh — Build completo e inicialização em modo produção (macOS/Linux)
# O backend Fastify serve o frontend estático + API no mesmo processo e porta

set -e
root="$(cd "$(dirname "$0")" && pwd)"

echo "========================================"
echo "  MONITOR-RPA — Build de Producao"
echo "========================================"
echo ""

# [1/5] Carrega variáveis do .env na sessão atual
echo "[1/5] Carregando variaveis de ambiente (.env)..."
envFile="$root/.env"
if [ -f "$envFile" ]; then
    set -o allexport
    source "$envFile"
    set +o allexport
    echo "      .env carregado."
else
    echo "AVISO: .env nao encontrado — DATABASE_URL deve estar no ambiente."
fi

# Garante VITE_API_URL vazio para caminhos relativos funcionarem
printf "# Auto-gerado por start-prod.sh — nao editar manualmente\nVITE_API_URL=\n" \
    > "$root/.env.production.local"
echo "      VITE_API_URL='' (caminhos relativos)"

# [2/5] Build do frontend
echo "[2/5] Buildando frontend (Vite)..."
cd "$root"
npm run build
echo "      dist/ gerado com sucesso."

# [3/5] Build do backend
echo "[3/5] Compilando backend (TypeScript)..."
cd "$root/back-server"
npm run build
echo "      back-server/dist/server.js gerado."

# [4/5] Migração do banco de dados
echo "[4/5] Executando migracao do banco..."
node "$root/back-server/dist/migrate.js"
echo "      Banco de dados OK."

# [5/5] Inicia o servidor
echo "[5/5] Iniciando servidor..."
echo ""
echo "========================================"
echo "  Acesse: http://192.168.1.3:8000"
echo "  Frontend + API no mesmo processo"
echo "========================================"
echo ""

node "$root/back-server/dist/server.js"
