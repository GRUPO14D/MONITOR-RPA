import type { RpaStatus } from '../types/rpa';
import { Badge } from './ui/badge';

const statusStyles: Record<
  RpaStatus,
  string
> = {
  RUNNING:
    'bg-status-success/10 text-status-success border-status-success/30 shadow-[0_0_8px_rgba(0,255,136,0.3)]',
  COMPLETED:
    'bg-status-processing/10 text-status-processing border-status-processing/30',
  ERROR:
    'bg-status-error/10 text-status-error border-status-error/30 shadow-[0_0_8px_rgba(255,71,87,0.3)]',
  WARNING:
    'bg-status-warning/10 text-status-warning border-status-warning/30',
  QUEUED:
    'bg-status-automation/10 text-status-automation border-status-automation/30',
  IDLE:
    'bg-status-idle/10 text-status-idle border-status-idle/30',
};

const statusLabel: Record<RpaStatus, string> = {
  RUNNING: 'EXECUTANDO',
  COMPLETED: 'CONCLUÍDO',
  ERROR: 'ERRO',
  WARNING: 'ALERTA',
  QUEUED: 'NA FILA',
  IDLE: 'INATIVO',
};

export function StatusBadge({ status }: { status: RpaStatus }) {
  return (
    <Badge
      variant="outline"
      className={`font-mono text-[0.65rem] tracking-widest ${statusStyles[status]}`}
    >
      {(status === 'RUNNING' || status === 'ERROR') && (
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              status === 'RUNNING' ? 'bg-status-success' : 'bg-status-error'
            }`}
          />
          <span
            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
              status === 'RUNNING' ? 'bg-status-success' : 'bg-status-error'
            }`}
          />
        </span>
      )}
      {statusLabel[status]}
    </Badge>
  );
}

export function StatusDot({ status }: { status: RpaStatus }) {
  const colorMap: Record<RpaStatus, string> = {
    RUNNING: 'bg-status-success',
    COMPLETED: 'bg-status-processing',
    ERROR: 'bg-status-error',
    WARNING: 'bg-status-warning',
    QUEUED: 'bg-status-automation',
    IDLE: 'bg-status-idle',
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colorMap[status]}`} />;
}

export function getStatusBarColor(status: RpaStatus): string {
  switch (status) {
    case 'RUNNING':
      return 'bg-status-success';
    case 'COMPLETED':
      return 'bg-status-processing';
    case 'ERROR':
      return 'bg-status-error';
    case 'WARNING':
      return 'bg-status-warning';
    case 'QUEUED':
      return 'bg-status-automation';
    case 'IDLE':
      return 'bg-status-idle';
  }
}

export function getStatusHoverBorder(status: RpaStatus): string {
  switch (status) {
    case 'RUNNING':
      return 'hover:border-status-success/40';
    case 'COMPLETED':
      return 'hover:border-status-processing/40';
    case 'ERROR':
      return 'hover:border-status-error/40';
    case 'WARNING':
      return 'hover:border-status-warning/40';
    case 'QUEUED':
      return 'hover:border-status-automation/40';
    case 'IDLE':
      return 'hover:border-status-idle/40';
  }
}

export function getStatusGlow(status: RpaStatus): string {
  switch (status) {
    case 'RUNNING':
      return 'hover:shadow-[0_0_20px_rgba(0,255,136,0.08)]';
    case 'COMPLETED':
      return 'hover:shadow-[0_0_20px_rgba(59,158,255,0.08)]';
    case 'ERROR':
      return 'hover:shadow-[0_0_20px_rgba(255,71,87,0.08)]';
    case 'WARNING':
      return 'hover:shadow-[0_0_20px_rgba(255,140,66,0.08)]';
    case 'QUEUED':
      return 'hover:shadow-[0_0_20px_rgba(165,94,234,0.08)]';
    case 'IDLE':
      return 'hover:shadow-[0_0_20px_rgba(107,114,128,0.05)]';
  }
}
