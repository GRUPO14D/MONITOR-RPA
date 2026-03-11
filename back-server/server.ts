/**
 * server.ts — Servidor central de monitoramento de RPAs (TypeScript + Fastify)
 * Grupo 14D — Infraestrutura de telemetria
 *
 * Migrado de Python/FastAPI para Node.js/TypeScript/Fastify
 * Mantém compatibilidade total com telemetry.py dos RPAs
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fsSync from 'fs';
import path from 'path';
import { initDb, insertEvent, getRecentEvents, getLastStatePerRpa } from './db';
import { buildRpaStatus } from './helpers';
import type { TelemetryEvent, RPAStatus } from './helpers';

// ------------------------------------------------------------------ //
//  Types & Interfaces                                                //
// ------------------------------------------------------------------ //

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

const API_KEY = process.env.RPA_API_KEY;
if (!API_KEY) {
  console.error('[RPA Monitor] ERRO: RPA_API_KEY nao configurada. Defina no .env antes de iniciar.');
  process.exit(1);
}

// Estado em memória: rpa_name → último estado (reconstruído do DB no startup)
const estado = new Map<string, RPAStatus>();

// ------------------------------------------------------------------ //
//  Server Setup                                                      //
// ------------------------------------------------------------------ //

const server: FastifyInstance = Fastify({ logger: { level: 'warn' } });

const getCorsOrigin = (): string | boolean => {
  if (process.env.NODE_ENV !== 'production') return true;
  return process.env.FRONTEND_URL || 'http://localhost:3000';
};

server.register(import('@fastify/cors'), { origin: getCorsOrigin() });

// Serve o frontend buildado se dist/ existir (modo standalone)
const FRONTEND_DIST = path.resolve(__dirname, '..', '..', 'dist');
if (fsSync.existsSync(FRONTEND_DIST)) {
  server.register(import('@fastify/static'), {
    root: FRONTEND_DIST,
    prefix: '/',
    wildcard: false,
  });
}

// ------------------------------------------------------------------ //
//  Auth                                                              //
// ------------------------------------------------------------------ //

function requireApiKey(request: FastifyRequest, reply: FastifyReply, done: () => void): void {
  const key = request.headers['x-api-key'];
  if (!key || key !== API_KEY) {
    reply.status(401).send({ ok: false, error: 'Unauthorized' });
    return;
  }
  done();
}

// ------------------------------------------------------------------ //
//  Routes                                                            //
// ------------------------------------------------------------------ //

const eventSchema = {
  body: {
    type: 'object',
    required: ['rpa', 'event', 'session_id', 'machine', 'empresa', 'timestamp'],
    properties: {
      rpa:              { type: 'string' },
      event:            { type: 'string' },
      session_id:       { type: 'string' },
      machine:          { type: 'string' },
      empresa:          { type: 'string' },
      timestamp:        { type: 'string' },
      status:           { type: 'string' },
      duracao_segundos: { type: 'number' },
    },
  },
};

// POST /events — Recebe eventos dos RPAs (requer X-Api-Key)
server.post('/events', { schema: eventSchema, onRequest: requireApiKey }, async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as TelemetryEvent;
    payload.received_at = new Date().toISOString();

    await insertEvent(payload);

    // Atualiza estado em memória
    const extra: Record<string, any> = {};
    const knownFields = new Set(['rpa', 'event', 'session_id', 'machine', 'empresa', 'timestamp', 'received_at', 'status', 'duracao_segundos']);
    for (const [k, v] of Object.entries(payload)) {
      if (!knownFields.has(k)) extra[k] = v;
    }
    estado.set(payload.rpa, buildRpaStatus(payload, extra));

    return { ok: true };
  } catch (error) {
    return reply.status(400).send({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/status — Retorna estado atual de todos os RPAs
server.get('/api/status', async (_request: FastifyRequest, _reply: FastifyReply) => {
  const response: ApiStatusResponse = {
    rpas: Array.from(estado.values()),
    updated_at: new Date().toISOString(),
  };
  return response;
});

// GET /api/events — Retorna eventos recentes
server.get<{ Querystring: { horas?: string } }>('/api/events', async (request) => {
  const horas = parseInt(request.query.horas || '24', 10);
  const rows = await getRecentEvents(horas);

  // Recompõe TelemetryEvent achatado para compatibilidade com o frontend
  const events: TelemetryEvent[] = rows.map((row) => ({
    rpa:              row.rpa,
    event:            row.event,
    session_id:       row.session_id,
    machine:          row.machine,
    empresa:          row.empresa,
    timestamp:        typeof row.timestamp === 'string' ? row.timestamp : (row.timestamp as any).toISOString(),
    received_at:      row.received_at,
    status:           row.status ?? undefined,
    duracao_segundos: row.duracao_segundos ?? undefined,
    ...row.extra,
  }));

  const response: ApiEventsResponse = { events };
  return response;
});

// GET /health — Verificação de saúde
server.get('/health', async () => ({ ok: true, ts: Date.now() }));

// Fallback SPA
if (fsSync.existsSync(FRONTEND_DIST)) {
  server.setNotFoundHandler(async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.type('text/html').sendFile('index.html');
  });
}

// ------------------------------------------------------------------ //
//  Server Start                                                      //
// ------------------------------------------------------------------ //

const start = async (): Promise<void> => {
  try {
    // 1. Inicializa DB e schema
    await initDb();
    console.log('[RPA Monitor] PostgreSQL conectado (Neon)');

    // 2. Reconstrói estado em memória a partir do último evento de cada RPA
    const lastStates = await getLastStatePerRpa();
    for (const row of lastStates) {
      estado.set(row.rpa, buildRpaStatus(
        { ...row, ...row.extra },
        row.extra,
      ));
    }
    console.log(`[RPA Monitor] Estado reconstruído: ${estado.size} RPA(s) carregados do DB`);

    // 3. Inicia servidor
    await server.listen({ host: HOST, port: PORT });
    console.log(`[RPA Monitor] Servidor rodando em http://${HOST}:${PORT}`);
  } catch (error) {
    console.error('[RPA Monitor] Falha ao iniciar:', error);
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
