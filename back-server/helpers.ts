/**
 * helpers.ts — Funções puras de mapeamento de estado dos RPAs.
 * Separadas do server.ts para facilitar testes unitários.
 */

export interface TelemetryEvent {
  rpa: string;
  event: string;
  session_id: string;
  machine: string;
  empresa: string;
  timestamp: string;
  received_at?: string;
  status?: string;
  duracao_segundos?: number;
  [key: string]: any;
}

export interface RPAStatus {
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

const STATUS_MAP: Record<string, string> = {
  rpa_started:        'running',
  rpa_error:          'error',
  automation_started: 'automating',
};

export function resolveStatus(event: string, payloadStatus?: string): string {
  if (event === 'rpa_finished' || event === 'automation_finished') {
    return payloadStatus || 'success';
  }
  return STATUS_MAP[event] || 'unknown';
}

export function buildRpaStatus(
  payload: TelemetryEvent,
  extra: Record<string, any> = {},
): RPAStatus {
  return {
    rpa:              payload.rpa || 'desconhecido',
    status:           resolveStatus(payload.event || '', payload.status),
    event:            payload.event || '',
    empresa:          payload.empresa || '',
    machine:          payload.machine || '',
    timestamp:        payload.timestamp || new Date().toISOString(),
    session_id:       payload.session_id || '',
    duracao_segundos: payload.duracao_segundos,
    detalhes:         extra,
  };
}
