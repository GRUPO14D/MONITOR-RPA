# RPA Monitor Server - TypeScript

Servidor central de monitoramento de RPAs migrado de Python/FastAPI para Node.js/TypeScript/Fastify.

## Setup

```bash
# Instalar dependências
npm install

# Desenvolvimento (auto-reload)
npm run dev

# Build para produção
npm run build
npm start
```

## Endpoints

- `POST /events` — Recebe eventos dos RPAs (compatível com telemetry.py)
- `GET /api/status` — Estado atual de todos os RPAs  
- `GET /api/events?horas=24` — Eventos das últimas N horas
- `GET /` — Página simples (frontend React roda separado)

## Estrutura

```
server.ts      # Servidor principal
package.json   # Dependências Node.js
tsconfig.json  # Configuração TypeScript
```

## Mudanças vs Python

- ✅ Mesma funcionalidade
- ✅ Mesmos endpoints e responses
- ✅ Compatibilidade total com telemetry.py
- ✅ CORS habilitado para desenvolvimento
- ✅ Tipos TypeScript para todas as interfaces

## Desenvolvimento

O servidor TypeScript roda na porta 8000 (API).  
O frontend React deve rodar separadamente na porta 3000.

```bash
# Terminal 1 - Servidor
npm run dev

# Terminal 2 - Frontend React  
cd ../frontend
npm start
```

## Produção

Em produção, o servidor pode servir os arquivos estáticos do React build:

```bash
npm run build
# Frontend build vai para pasta 'public' 
npm start
```
