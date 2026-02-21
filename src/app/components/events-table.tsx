import { Terminal } from 'lucide-react';
import type { EventLog } from './mock-data';
import { StatusDot } from './status-badge';

export function EventsTable({ events }: { events: EventLog[] }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Cabeçalho da tabela */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
        <Terminal className="h-4 w-4 text-status-processing" />
        <h2 className="font-mono text-[0.85rem] text-foreground tracking-tight">
          LOG_EVENTOS
        </h2>
        <span className="font-mono text-[0.65rem] text-muted-foreground ml-auto">
          {events.length} registros
        </span>
      </div>

      {/* Conteúdo da tabela */}
      <div className="divide-y divide-border">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 px-4 py-3 transition-colors duration-200 hover:bg-secondary/20"
          >
            {/* Indicador de status */}
            <div className="mt-1.5 shrink-0">
              <StatusDot status={event.status} />
            </div>

            {/* Conteúdo */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                <span className="font-mono text-[0.7rem] text-muted-foreground">
                  {event.timestamp}
                </span>
                <span className="font-mono text-[0.75rem] text-foreground">
                  {event.processName}
                </span>
              </div>
              <p className="text-[0.75rem] text-foreground/80 mb-0.5">
                {event.message}
              </p>
              <p className="font-mono text-[0.65rem] text-muted-foreground">
                {event.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
