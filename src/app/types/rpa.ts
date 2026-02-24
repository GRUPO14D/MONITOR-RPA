export type RpaStatus = 'RUNNING' | 'COMPLETED' | 'ERROR' | 'IDLE' | 'WARNING' | 'QUEUED';

export interface RpaProcess {
  id: string;
  name: string;
  status: RpaStatus;
  company: string;
  machine: string;
  startTime: string;
  duration: string;
  records: number;
  totalRecords: number;
  description: string;
  lastUpdate: string;
  cpu: number;
  memory: number;
}

export interface EventLog {
  id: string;
  timestamp: string;
  processName: string;
  status: RpaStatus;
  message: string;
  details: string;
}

export interface StatsOverview {
  totalProcesses: number;
  running: number;
  completed: number;
  errors: number;
  warnings: number;
  queued: number;
  idle: number;
  totalRecords: number;
  uptime: string;
}
