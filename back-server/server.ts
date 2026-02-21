/**
 * server.ts — Servidor central de monitoramento de RPAs (TypeScript + Fastify)
 * Grupo 14D — Infraestrutura de telemetria
 * 
 * Migrado de Python/FastAPI para Node.js/TypeScript/Fastify
 * Mantém compatibilidade total com telemetry.py dos RPAs
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
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
const PORT = 8000;
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

// CORS para desenvolvimento
server.register(import('@fastify/cors'), {
  origin: true
});

// ------------------------------------------------------------------ //
//  Routes                                                            //
// ------------------------------------------------------------------ //

// POST /events - Recebe eventos dos RPAs
server.post('/events', async (request: FastifyRequest, reply: FastifyReply) => {
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

// GET /api/events - Retorna eventos recentes
server.get<{ Querystring: { horas?: string } }>('/api/events', async (request, reply) => {
  const horas = parseInt(request.query.horas || '24', 10);
  const events = await lerEventosRecentes(horas);
  
  const response: ApiEventsResponse = { events };
  return response;
});

// GET / - Serve o frontend React
server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
  return reply.type('text/html').send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RPA Monitor — Grupo 14D</title>
    </head>
    <body>
      <div id="root">
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
          <div style="text-align: center;">
            <h1>RPA Monitor</h1>
            <p>Frontend React deve ser servido separadamente em desenvolvimento</p>
            <p>API disponível em:</p>
            <ul style="list-style: none; padding: 0;">
              <li><a href="/api/status">/api/status</a></li>
              <li><a href="/api/events">/api/events</a></li>
            </ul>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

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
