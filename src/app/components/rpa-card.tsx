import { Clock, Database, Monitor, Building2, Cpu, MemoryStick } from 'lucide-react';
import type { RpaProcess } from './mock-data';
import {
  StatusBadge,
  getStatusBarColor,
  getStatusHoverBorder,
  getStatusGlow,
} from './status-badge';

export function RpaCard({ process }: { process: RpaProcess }) {
  const barColor = getStatusBarColor(process.status);
  const hoverBorder = getStatusHoverBorder(process.status);
  const glowEffect = getStatusGlow(process.status);
  const progress =
    process.totalRecords > 0
      ? Math.round((process.records / process.totalRecords) * 100)
      : 0;

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 ${hoverBorder} ${glowEffect}`}
    >
      {/* Barra de status superior */}
      <div className={`h-1 w-full ${barColor}`} />

      <div className="p-4">
        {/* Cabeçalho: ID + Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <span className="font-mono text-[0.65rem] text-muted-foreground block">
              {process.id}
            </span>
            <h3 className="font-mono text-[0.9rem] text-foreground tracking-tight truncate">
              {process.name}
            </h3>
          </div>
          <StatusBadge status={process.status} />
        </div>

        {/* Descrição */}
        <p className="text-[0.75rem] text-muted-foreground mb-4 line-clamp-1">
          {process.description}
        </p>

        {/* Grid de métricas */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MetricItem
            icon={<Clock className="h-3 w-3" />}
            label="Duração"
            value={process.duration}
          />
          <MetricItem
            icon={<Database className="h-3 w-3" />}
            label="Registros"
            value={`${process.records.toLocaleString()}/${process.totalRecords.toLocaleString()}`}
          />
        </div>

        {/* Barra de progresso (apenas para processos ativos) */}
        {process.totalRecords > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[0.6rem] text-muted-foreground">
                PROGRESSO
              </span>
              <span className="font-mono text-[0.6rem] text-foreground">
                {progress}%
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Uso de recursos (apenas para executando) */}
        {(process.status === 'RUNNING' || process.status === 'WARNING') && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <ResourceBar
              icon={<Cpu className="h-3 w-3" />}
              label="CPU"
              value={process.cpu}
            />
            <ResourceBar
              icon={<MemoryStick className="h-3 w-3" />}
              label="MEM"
              value={process.memory}
            />
          </div>
        )}

        {/* Detalhes do rodapé */}
        <div className="border-t border-border pt-3 space-y-1.5">
          <DetailRow
            icon={<Building2 className="h-3 w-3" />}
            value={process.company}
          />
          <DetailRow
            icon={<Monitor className="h-3 w-3" />}
            value={process.machine}
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.6rem] text-muted-foreground">
              Última atualização
            </span>
            <span className="font-mono text-[0.65rem] text-muted-foreground">
              {process.lastUpdate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-secondary/60 px-3 py-2">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-muted-foreground">{icon}</span>
        <span className="font-mono text-[0.55rem] tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
      </div>
      <span className="font-mono text-[0.8rem] text-foreground">{value}</span>
    </div>
  );
}

function ResourceBar({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const barColor =
    value > 80 ? 'bg-status-error' : value > 60 ? 'bg-status-warning' : 'bg-status-success';

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-0.5">
          <span className="font-mono text-[0.55rem] text-muted-foreground">
            {label}
          </span>
          <span className="font-mono text-[0.55rem] text-foreground">
            {value}%
          </span>
        </div>
        <div className="h-0.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-300`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[0.7rem] text-muted-foreground truncate">
        {value}
      </span>
    </div>
  );
}
