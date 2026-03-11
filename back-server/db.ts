/**
 * db.ts — Conexão PostgreSQL (Neon HTTP) e operações de telemetria
 * Usa @neondatabase/serverless (porta 443/HTTPS) em vez de TCP 5432
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('[DB] DATABASE_URL não configurada');
}

export const sql = neon(DATABASE_URL);

// ------------------------------------------------------------------ //
//  Schema                                                            //
// ------------------------------------------------------------------ //

export async function initDb(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS rpa_events (
      id               SERIAL PRIMARY KEY,
      rpa              TEXT        NOT NULL,
      event            TEXT        NOT NULL,
      session_id       TEXT        NOT NULL,
      machine          TEXT        NOT NULL,
      empresa          TEXT        NOT NULL,
      timestamp        TIMESTAMPTZ NOT NULL,
      received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status           TEXT,
      duracao_segundos NUMERIC,
      extra            JSONB       NOT NULL DEFAULT '{}'::jsonb
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_rpa_events_ts
      ON rpa_events (timestamp DESC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_rpa_events_rpa_ts
      ON rpa_events (rpa, timestamp DESC)
  `;
}

// ------------------------------------------------------------------ //
//  Operações                                                         //
// ------------------------------------------------------------------ //

const KNOWN_FIELDS = new Set([
  'rpa', 'event', 'session_id', 'machine', 'empresa',
  'timestamp', 'received_at', 'status', 'duracao_segundos',
]);

export interface TelemetryRow {
  rpa: string;
  event: string;
  session_id: string;
  machine: string;
  empresa: string;
  timestamp: string;
  received_at?: string;
  status?: string;
  duracao_segundos?: number;
  extra: Record<string, any>;
}

export async function insertEvent(payload: Record<string, any>): Promise<void> {
  const extra: Record<string, any> = {};
  for (const [key, val] of Object.entries(payload)) {
    if (!KNOWN_FIELDS.has(key)) extra[key] = val;
  }

  await sql`
    INSERT INTO rpa_events
      (rpa, event, session_id, machine, empresa, timestamp, received_at, status, duracao_segundos, extra)
    VALUES (
      ${payload.rpa},
      ${payload.event},
      ${payload.session_id},
      ${payload.machine},
      ${payload.empresa},
      ${payload.timestamp},
      NOW(),
      ${payload.status ?? null},
      ${payload.duracao_segundos ?? null},
      ${JSON.stringify(extra)}
    )
  `;
}

export async function getRecentEvents(horas: number): Promise<TelemetryRow[]> {
  const rows = await sql`
    SELECT rpa, event, session_id, machine, empresa,
           timestamp, received_at, status, duracao_segundos, extra
    FROM   rpa_events
    WHERE  timestamp >= NOW() - make_interval(hours => ${horas})
    ORDER  BY timestamp ASC
    LIMIT  200
  `;
  return rows as unknown as TelemetryRow[];
}

export async function getLastStatePerRpa(): Promise<TelemetryRow[]> {
  const rows = await sql`
    SELECT DISTINCT ON (rpa)
           rpa, event, session_id, machine, empresa,
           timestamp, received_at, status, duracao_segundos, extra
    FROM   rpa_events
    ORDER  BY rpa, timestamp DESC
  `;
  return rows as unknown as TelemetryRow[];
}
