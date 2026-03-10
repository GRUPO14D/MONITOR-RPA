/**
 * server.ts — Servidor central de monitoramento de RPAs (TypeScript + Fastify)
 * Grupo 14D — Infraestrutura de telemetria
 * 
 * Migrado de Python/FastAPI para Node.js/TypeScript/Fastify
 * Mantém compatibilidade total com telemetry.py dos RPAs
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

// ------------------------------------------------------------------ //
//  Types & Interfaces                                                //
// ------------------------------------------------------------------ //

interface TelemetryEvent {
  rpa: string;
  event: string;
  session_id: string;
  machine: string;
  empresa: string;
  timestamp: string;
  received_at?: string;
  status?: string;
  duracao_segundos?: number;
  [key: string]: any; // Extra fields
}

interface RPAStatus {
  rpa: string;
  status: string;
  event: string;
  empresa: string;
  machine: string;
  timestamp: string;
  session_id: string;
  duracao_segundos?: number;
  detalhes: Record<string, any>;
}

interface ApiStatusResponse {
  rpas: RPAStatus[];
  updated_at: string;
}

interface ApiEventsResponse {
  events: TelemetryEvent[];
}

// ------------------------------------------------------------------ //
//  Configuration                                                     //
// ------------------------------------------------------------------ //

const HOST = '0.0.0.0';
const PORT = parseInt(process.env.PORT || '8000', 10);
const LOG_FILE = path.join(__dirname, 'rpa_events.jsonl');

// Estado em memória: rpa_name → último estado
const estado = new Map<string, RPAStatus>();

// ------------------------------------------------------------------ //
//  Helpers                                                          //
// ------------------------------------------------------------------ //

async function salvarEvento(payload: TelemetryEvent): Promise<void> {
  const linha = JSON.stringify(payload) + '\n';
  await fs.appendFile(LOG_FILE, linha, 'utf-8');
}

function atualizarEstado(payload: TelemetryEvent): void {
  const rpa = payload.rpa || 'desconhecido';
  const event = payload.event || '';

  const STATUS_MAP: Record<string, string> = {
    'rpa_started': 'running',
    'rpa_finished': payload.status || 'success',
    'rpa_error': 'error',
    'automation_started': 'automating',
    'automation_finished': payload.status || 'success',
  };

  const novoEstado: RPAStatus = {
    rpa,
    status: STATUS_MAP[event] || 'unknown',
    event,
    empresa: payload.empresa || '',
    machine: payload.machine || '',
    timestamp: payload.timestamp || new Date().toISOString(),
    session_id: payload.session_id || '',
    duracao_segundos: payload.duracao_segundos,
    detalhes: Object.fromEntries(
      Object.entries(payload).filter(([key]) => 
        !['rpa', 'event', 'empresa', 'machine', 'timestamp', 'session_id', 'status'].includes(key)
      )
    ),
  };

  estado.set(rpa, novoEstado);
}

async function lerEventosRecentes(horas: number = 24): Promise<TelemetryEvent[]> {
  try {
    const data = await fs.readFile(LOG_FILE, 'utf-8');
    const linhas = data.trim().split('\n').filter(Boolean);
    const corte = new Date(Date.now() - horas * 60 * 60 * 1000);
    
    const eventos: TelemetryEvent[] = [];
    for (const linha of linhas) {
      try {
        const evento = JSON.parse(linha) as TelemetryEvent;
        const timestamp = new Date(evento.timestamp);
        if (timestamp >= corte) {
          eventos.push(evento);
        }
      } catch (parseError) {
        // Ignora linhas corrompidas
        continue;
      }
    }
    
    return eventos.slice(-200); // máximo 200 eventos
  } catch (error) {
    return [];
  }
}

// ------------------------------------------------------------------ //
//  Server Setup                                                      //
// ------------------------------------------------------------------ //

const server: FastifyInstance = Fastify({
  logger: {
    level: 'warn'
  }
});

// CORS:
//   production remoto  → FRONTEND_URL obrigatório (ex: Railway/Vercel)
//   production local   → fallback para localhost:3000 se FRONTEND_URL ausente
//   development        → aceita qualquer origem
const getCorsOrigin = (): string | boolean => {
  if (process.env.NODE_ENV !== 'production') return true;
  return process.env.FRONTEND_URL || 'http://localhost:3000';
};

server.register(import('@fastify/cors'), {
  origin: getCorsOrigin(),
});

// Serve o frontend buildado se dist/ existir (modo standalone)
const FRONTEND_DIST = path.resolve(__dirname, '..', 'dist');
if (fsSync.existsSync(FRONTEND_DIST)) {
  server.register(import('@fastify/static'), {
    root: FRONTEND_DIST,
    prefix: '/',
    // Não conflita com rotas de API registradas depois
    wildcard: false,
  });
}

// ------------------------------------------------------------------ //
//  Routes                                                            //
// ------------------------------------------------------------------ //

// POST /events - Recebe eventos dos RPAs
const eventSchema = {
  body: {
    type: 'object',
    required: ['rpa', 'event', 'session_id', 'machine', 'empresa', 'timestamp'],
    properties: {
      rpa: { type: 'string' },
      event: { type: 'string' },
      session_id: { type: 'string' },
      machine: { type: 'string' },
      empresa: { type: 'string' },
      timestamp: { type: 'string' },
      status: { type: 'string' },
      duracao_segundos: { type: 'number' },
    },
  },
};

server.post('/events', { schema: eventSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as TelemetryEvent;
    payload.received_at = new Date().toISOString();

    await salvarEvento(payload);
    atualizarEstado(payload);

    return { ok: true };
  } catch (error) {
    return reply.status(400).send({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/status - Retorna estado atual de todos os RPAs
server.get('/api/status', async (request: FastifyRequest, reply: FastifyReply) => {
  const response: ApiStatusResponse = {
    rpas: Array.from(estado.values()),
    updated_at: new Date().toISOString()
  };
  return response;
});

// GET /health - Verificação de saúde da API (usado pelo frontend em build)
server.get('/health', async () => ({
  ok: true,
  ts: Date.now(),
}));

// GET /api/events - Retorna eventos recentes
server.get<{ Querystring: { horas?: string } }>('/api/events', async (request, reply) => {
  const horas = parseInt(request.query.horas || '24', 10);
  const events = await lerEventosRecentes(horas);
  
  const response: ApiEventsResponse = { events };
  return response;
});

// Fallback SPA — rotas do React Router que não são arquivos estáticos
// Só registra se o dist/ existir (modo standalone)
if (fsSync.existsSync(FRONTEND_DIST)) {
  server.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    // Não intercepta rotas de API
    if (request.url.startsWith('/api') || request.url.startsWith('/events')) {
      return reply.status(404).send({ error: 'Not found' });
    }
    return reply.type('text/html').sendFile('index.html');
  });
}

// ------------------------------------------------------------------ //
//  Server Start                                                      //
// ------------------------------------------------------------------ //

const start = async (): Promise<void> => {
  try {
    await server.listen({ host: HOST, port: PORT });
    console.log(`[RPA Monitor] Servidor TypeScript iniciando em http://${HOST}:${PORT}`);
    console.log(`[RPA Monitor] Eventos salvos em: ${path.resolve(LOG_FILE)}`);
    console.log(`[RPA Monitor] Frontend React deve rodar separadamente (ex: porta 3000)`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[RPA Monitor] Encerrando servidor...');
  await server.close();
  process.exit(0);
});

start();
