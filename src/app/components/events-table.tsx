import { Terminal } from 'lucide-react';
import type { EventLog } from '../types/rpa';
import { StatusDot } from './status-badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './ui/table';

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
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-6 font-mono text-[0.6rem] tracking-wider text-muted-foreground" />
            <TableHead className="font-mono text-[0.6rem] tracking-wider text-muted-foreground">
              HORÁRIO
            </TableHead>
            <TableHead className="font-mono text-[0.6rem] tracking-wider text-muted-foreground">
              PROCESSO
            </TableHead>
            <TableHead className="font-mono text-[0.6rem] tracking-wider text-muted-foreground hidden sm:table-cell">
              MENSAGEM
            </TableHead>
            <TableHead className="font-mono text-[0.6rem] tracking-wider text-muted-foreground hidden lg:table-cell">
              DETALHES
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow
              key={event.id}
              className="transition-colors duration-200 hover:bg-secondary/20"
            >
              <TableCell className="w-6">
                <StatusDot status={event.status} />
              </TableCell>
              <TableCell className="font-mono text-[0.7rem] text-muted-foreground">
                {event.timestamp}
              </TableCell>
              <TableCell className="font-mono text-[0.75rem] text-foreground">
                {event.processName}
              </TableCell>
              <TableCell className="text-[0.75rem] text-foreground/80 hidden sm:table-cell">
                {event.message}
              </TableCell>
              <TableCell className="font-mono text-[0.65rem] text-muted-foreground hidden lg:table-cell">
                {event.details}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
