/**
 * Handler único para /api/status e /api/events (Vercel Serverless).
 * Compatível com o contrato do back-server (Fastify); estado em memória por instância.
 */

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
  [key: string]: unknown;
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
  detalhes: Record<string, unknown>;
}

const cors = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

const estado = new Map<string, RPAStatus>();
const eventos: TelemetryEvent[] = [];
const MAX_EVENTOS = 200;

function atualizarEstado(payload: TelemetryEvent): void {
  const rpa = (payload.rpa as string) || 'desconhecido';
  const event = (payload.event as string) || '';
  const STATUS_MAP: Record<string, string> = {
    rpa_started: 'running',
    rpa_finished: (payload.status as string) || 'success',
    rpa_error: 'error',
    automation_started: 'automating',
    automation_finished: (payload.status as string) || 'success',
  };
  estado.set(rpa, {
    rpa,
    status: STATUS_MAP[event] || 'unknown',
    event,
    empresa: (payload.empresa as string) || '',
    machine: (payload.machine as string) || '',
    timestamp: (payload.timestamp as string) || new Date().toISOString(),
    session_id: (payload.session_id as string) || '',
    duracao_segundos: payload.duracao_segundos as number | undefined,
    detalhes: Object.fromEntries(
      Object.entries(payload).filter(
        ([key]) =>
          !['rpa', 'event', 'empresa', 'machine', 'timestamp', 'session_id', 'status'].includes(key)
      )
    ) as Record<string, unknown>,
  });
}

function eventosRecentes(horas: number): TelemetryEvent[] {
  const corte = Date.now() - horas * 60 * 60 * 1000;
  return eventos
    .filter((e) => new Date((e.timestamp as string) || 0).getTime() >= corte)
    .slice(-MAX_EVENTOS);
}

function getStatus(): Response {
  const body = {
    rpas: Array.from(estado.values()),
    updated_at: new Date().toISOString(),
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors() },
  });
}

function getEvents(request: Request): Response {
  const url = new URL(request.url);
  const horas = Math.min(168, Math.max(1, parseInt(url.searchParams.get('horas') || '24', 10) || 24));
  const body = { events: eventosRecentes(horas) };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors() },
  });
}

async function postEvents(request: Request): Promise<Response> {
  try {
    const payload = (await request.json()) as TelemetryEvent;
    payload.received_at = new Date().toISOString();
    if (
      !payload.rpa ||
      !payload.event ||
      !payload.session_id ||
      !payload.machine ||
      !payload.empresa ||
      !payload.timestamp
    ) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Campos obrigatórios: rpa, event, session_id, machine, empresa, timestamp' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...cors() } }
      );
    }
    eventos.push(payload);
    atualizarEstado(payload);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors() },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...cors() } }
    );
  }
}

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path');
  if (path === 'status') return getStatus();
  if (path === 'events') return getEvents(request);
  return new Response('Not Found', { status: 404, headers: cors() });
}

export async function POST(request: Request) {
  const path = new URL(request.url).searchParams.get('path');
  if (path === 'events') return await postEvents(request);
  return new Response('Not Found', { status: 404, headers: cors() });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors() });
}
