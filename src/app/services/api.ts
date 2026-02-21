import type { RpaProcess, RpaStatus, EventLog } from '../components/mock-data';

// ------------------------------------------------------------------ //
//  Backend types (from server.ts)                                     //
// ------------------------------------------------------------------ //

interface BackendRPAStatus {
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

interface BackendStatusResponse {
  rpas: BackendRPAStatus[];
  updated_at: string;
}

interface BackendTelemetryEvent {
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

interface BackendEventsResponse {
  events: BackendTelemetryEvent[];
}

// ------------------------------------------------------------------ //
//  Mappers: backend → frontend types                                  //
// ------------------------------------------------------------------ //

const STATUS_MAP: Record<string, RpaStatus> = {
  running: 'RUNNING',
  success: 'COMPLETED',
  error: 'ERROR',
  automating: 'RUNNING',
  unknown: 'IDLE',
};

function mapStatus(backendStatus: string): RpaStatus {
  return STATUS_MAP[backendStatus] || 'IDLE';
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

function mapRpa(rpa: BackendRPAStatus, index: number): RpaProcess {
  const status = mapStatus(rpa.status);
  const isActive = status === 'RUNNING';
  return {
    id: `RPA-${String(index + 1).padStart(3, '0')}`,
    name: rpa.rpa,
    status,
    company: rpa.empresa || 'N/A',
    machine: rpa.machine || 'N/A',
    startTime: rpa.timestamp,
    duration: formatDuration(rpa.duracao_segundos),
    records: rpa.detalhes?.records ?? 0,
    totalRecords: rpa.detalhes?.totalRecords ?? 0,
    description: rpa.detalhes?.description ?? rpa.event,
    lastUpdate: new Date(rpa.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    cpu: isActive ? (rpa.detalhes?.cpu ?? Math.floor(Math.random() * 50 + 10)) : 0,
    memory: isActive ? (rpa.detalhes?.memory ?? Math.floor(Math.random() * 40 + 20)) : 0,
  };
}

function mapEventToLog(evt: BackendTelemetryEvent, index: number): EventLog {
  const eventStatusMap: Record<string, RpaStatus> = {
    rpa_started: 'RUNNING',
    rpa_finished: 'COMPLETED',
    rpa_error: 'ERROR',
    automation_started: 'RUNNING',
    automation_finished: 'COMPLETED',
  };

  return {
    id: `EVT-${String(index + 1).padStart(3, '0')}`,
    timestamp: new Date(evt.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    processName: evt.rpa,
    status: eventStatusMap[evt.event] || 'IDLE',
    message: evt.event.replace(/_/g, ' '),
    details: evt.empresa ? `${evt.empresa} | ${evt.machine}` : evt.machine || '',
  };
}

// ------------------------------------------------------------------ //
//  API fetch functions                                                //
// ------------------------------------------------------------------ //

export async function fetchRpaStatus(): Promise<RpaProcess[]> {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const data: BackendStatusResponse = await res.json();
  return data.rpas.map(mapRpa);
}

export async function fetchEvents(horas: number = 24): Promise<EventLog[]> {
  const res = await fetch(`/api/events?horas=${horas}`);
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const data: BackendEventsResponse = await res.json();
  return data.events.map(mapEventToLog).reverse();
}
