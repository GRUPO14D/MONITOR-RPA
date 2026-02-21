import type { RpaStatus } from './mock-data';

const statusConfig: Record<
  RpaStatus,
  { bg: string; text: string; border: string; glow: string }
> = {
  RUNNING: {
    bg: 'bg-status-success/10',
    text: 'text-status-success',
    border: 'border-status-success/30',
    glow: 'shadow-[0_0_8px_rgba(0,255,136,0.3)]',
  },
  COMPLETED: {
    bg: 'bg-status-processing/10',
    text: 'text-status-processing',
    border: 'border-status-processing/30',
    glow: '',
  },
  ERROR: {
    bg: 'bg-status-error/10',
    text: 'text-status-error',
    border: 'border-status-error/30',
    glow: 'shadow-[0_0_8px_rgba(255,71,87,0.3)]',
  },
  WARNING: {
    bg: 'bg-status-warning/10',
    text: 'text-status-warning',
    border: 'border-status-warning/30',
    glow: '',
  },
  QUEUED: {
    bg: 'bg-status-automation/10',
    text: 'text-status-automation',
    border: 'border-status-automation/30',
    glow: '',
  },
  IDLE: {
    bg: 'bg-status-idle/10',
    text: 'text-status-idle',
    border: 'border-status-idle/30',
    glow: '',
  },
};

export function StatusBadge({ status }: { status: RpaStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[0.65rem] tracking-widest border ${config.bg} ${config.text} ${config.border} ${config.glow}`}
    >
      {status === 'RUNNING' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-success" />
        </span>
      )}
      {status === 'ERROR' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-error opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-error" />
        </span>
      )}
      {status}
    </span>
  );
}

export function StatusDot({ status }: { status: RpaStatus }) {
  const config = statusConfig[status];
  return <span className={`inline-block h-2 w-2 rounded-full ${config.text} bg-current`} />;
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
