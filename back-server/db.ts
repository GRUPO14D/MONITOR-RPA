/**
 * db.ts — Conexão PostgreSQL (Neon HTTP) e operações de telemetria
 * Usa @neondatabase/serverless (porta 443/HTTPS) em vez de TCP 5432
 */

import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

const ENV_FILENAMES = ['.env', '.env.local', '.env.production', '.env.production.local'];

function parseAndApplyEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const normalized = trimmed.startsWith('export ')
      ? trimmed.slice('export '.length).trim()
      : trimmed;
    const separatorIndex = normalized.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = normalized.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = normalized.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function loadEnvFallbacks(): void {
  if (process.env.DATABASE_URL) return;

  const searchDirs = [
    process.cwd(),
    path.resolve(process.cwd(), '..'),
    __dirname,
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '..', '..'),
  ];

  const seenDirs = new Set<string>();
  for (const dir of searchDirs) {
    const resolvedDir = path.resolve(dir);
    if (seenDirs.has(resolvedDir)) continue;
    seenDirs.add(resolvedDir);

    for (const envFileName of ENV_FILENAMES) {
      parseAndApplyEnvFile(path.join(resolvedDir, envFileName));
      if (process.env.DATABASE_URL) return;
    }
  }
}

loadEnvFallbacks();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('[DB] DATABASE_URL not configured. Set it in environment or in .env/.env.local.');
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
