import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react';

interface StatsOverview {
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

export function DashboardHeader({ statsOverview, isLive }: { statsOverview: StatsOverview; isLive: boolean }) {
  return (
    <header className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Terminal-style title */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-muted-foreground">$</span>
          <h1 className="font-mono tracking-tight text-foreground">
            RPA_MONITOR
          </h1>
          <div className="flex items-center gap-2 ml-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isLive ? 'bg-status-success' : 'bg-status-warning'} opacity-75`} />
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isLive ? 'bg-status-success' : 'bg-status-warning'}`} />
            </span>
            <span className={`font-mono text-[0.75rem] tracking-widest ${isLive ? 'text-status-success' : 'text-status-warning'}`}>
              {isLive ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Right: System stats */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <Wifi className="h-3.5 w-3.5 text-status-processing" />
            <span className="font-mono text-[0.75rem] text-muted-foreground">
              <span className="text-foreground">{statsOverview.totalProcesses}</span>{' '}
              AGENTS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-status-success" />
            <span className="font-mono text-[0.75rem] text-muted-foreground">
              <span className="text-status-success">{statsOverview.running}</span>{' '}
              RUNNING
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-status-error" />
            <span className="font-mono text-[0.75rem] text-muted-foreground">
              <span className="text-status-error">{statsOverview.errors}</span>{' '}
              ERRORS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-[0.75rem] text-muted-foreground">
              UPTIME{' '}
              <span className="text-foreground">{statsOverview.uptime}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mt-4 flex flex-wrap gap-3">
        <StatChip
          label="TOTAL RECORDS"
          value={statsOverview.totalRecords.toLocaleString()}
          color="text-foreground"
        />
        <StatChip
          label="COMPLETED"
          value={statsOverview.completed.toString()}
          color="text-status-success"
        />
        <StatChip
          label="WARNINGS"
          value={statsOverview.warnings.toString()}
          color="text-status-warning"
        />
        <StatChip
          label="QUEUED"
          value={statsOverview.queued.toString()}
          color="text-status-automation"
        />
        <StatChip
          label="IDLE"
          value={statsOverview.idle.toString()}
          color="text-status-idle"
        />
      </div>
    </header>
  );
}

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5">
      <span className="font-mono text-[0.65rem] tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={`font-mono text-[0.8rem] ${color}`}>{value}</span>
    </div>
  );
}
