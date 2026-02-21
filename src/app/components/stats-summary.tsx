import { BarChart3, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

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

export function StatsSummary({ statsOverview }: { statsOverview: StatsOverview }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <SummaryCard
        icon={<Zap className="h-4 w-4 text-status-success" />}
        label="Ativos"
        value={statsOverview.running}
        subtext="processos executando"
        accent="border-status-success/20"
      />
      <SummaryCard
        icon={<BarChart3 className="h-4 w-4 text-status-processing" />}
        label="Registros"
        value={statsOverview.totalRecords}
        subtext="processados hoje"
        accent="border-status-processing/20"
        formatNumber
      />
      <SummaryCard
        icon={<AlertTriangle className="h-4 w-4 text-status-warning" />}
        label="Alertas"
        value={statsOverview.warnings + statsOverview.errors}
        subtext="precisam de atenção"
        accent="border-status-warning/20"
      />
      <SummaryCard
        icon={<TrendingUp className="h-4 w-4 text-status-automation" />}
        label="Sucesso"
        value={98.2}
        subtext="taxa de hoje"
        accent="border-status-automation/20"
        suffix="%"
      />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  subtext,
  accent,
  formatNumber,
  suffix = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext: string;
  accent: string;
  formatNumber?: boolean;
  suffix?: string;
}) {
  return (
    <div
      className={`rounded-lg border ${accent} bg-card p-4 transition-colors duration-200 hover:bg-secondary/40`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
      </div>
      <div className="font-mono text-[1.4rem] text-foreground">
        {formatNumber ? value.toLocaleString() : value}
        {suffix && (
          <span className="text-[0.85rem] text-muted-foreground">{suffix}</span>
        )}
      </div>
      <span className="text-[0.65rem] text-muted-foreground">{subtext}</span>
    </div>
  );
}
