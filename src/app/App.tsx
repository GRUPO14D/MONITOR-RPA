import { useState } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { DashboardHeader } from "./components/dashboard-header";
import { StatsSummary } from "./components/stats-summary";
import { RpaCard } from "./components/rpa-card";
import { EventsTable } from "./components/events-table";
import { useRpaData } from "./hooks/useRpaData";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import type { RpaStatus } from "./components/mock-data";

const filterOptions: {
  label: string;
  value: RpaStatus | "ALL";
}[] = [
  { label: "TODOS", value: "ALL" },
  { label: "EXECUTANDO", value: "RUNNING" },
  { label: "CONCLUÍDO", value: "COMPLETED" },
  { label: "ERRO", value: "ERROR" },
  { label: "ALERTA", value: "WARNING" },
  { label: "NA FILA", value: "QUEUED" },
  { label: "INATIVO", value: "IDLE" },
];

const filterColors: Record<string, string> = {
  ALL: "text-foreground border-foreground/20",
  RUNNING: "text-status-success border-status-success/30",
  COMPLETED:
    "text-status-processing border-status-processing/30",
  ERROR: "text-status-error border-status-error/30",
  WARNING: "text-status-warning border-status-warning/30",
  QUEUED: "text-status-automation border-status-automation/30",
  IDLE: "text-status-idle border-status-idle/30",
};

const filterActiveBg: Record<string, string> = {
  ALL: "bg-foreground/10",
  RUNNING: "bg-status-success/10",
  COMPLETED: "bg-status-processing/10",
  ERROR: "bg-status-error/10",
  WARNING: "bg-status-warning/10",
  QUEUED: "bg-status-automation/10",
  IDLE: "bg-status-idle/10",
};

export default function App() {
  const { processes, events, stats, isLive, lastSync, refresh, isRefreshing } = useRpaData();
  const [activeFilter, setActiveFilter] = useState<
    RpaStatus | "ALL"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProcesses = processes.filter((p) => {
    const matchesFilter =
      activeFilter === "ALL" || p.status === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      p.company
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <DashboardHeader statsOverview={stats} isLive={isLive} />

      <main className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Resumo de estatísticas */}
        <StatsSummary statsOverview={stats} />

        {/* Barra de ferramentas */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              aria-label="Buscar processos, empresas ou IDs"
              placeholder="Buscar processos, empresas, IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 font-mono text-[0.75rem] bg-secondary border-border focus-visible:border-status-processing/50 focus-visible:ring-status-processing/20"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Atualizar */}
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="font-mono text-[0.7rem] text-muted-foreground hover:text-foreground hover:border-status-processing/30"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              ATUALIZAR
            </Button>

            {/* Indicador de filtro */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span className="font-mono text-[0.65rem] hidden sm:inline">
                FILTRO
              </span>
            </div>
          </div>
        </div>

        {/* Pills de filtro */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt.value;
            return (
              <Button
                key={opt.value}
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter(opt.value)}
                className={`font-mono text-[0.65rem] tracking-wider h-auto py-1 ${
                  filterColors[opt.value]
                } ${
                  isActive
                    ? `${filterActiveBg[opt.value]} border-current`
                    : "bg-transparent hover:bg-secondary/60"
                }`}
              >
                {opt.label}
                {opt.value !== "ALL" && (
                  <span className="ml-1.5 text-[0.6rem] opacity-60">
                    {
                      processes.filter(
                        (p) => p.status === opt.value,
                      ).length
                    }
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Grid de Cards RPA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProcesses.map((process) => (
            <RpaCard key={process.id} process={process} />
          ))}
        </div>

        {filteredProcesses.length === 0 && (
          <div className="text-center py-12">
            <p className="font-mono text-[0.8rem] text-muted-foreground">
              Nenhum processo encontrado para o filtro atual.
            </p>
          </div>
        )}

        {/* Log de Eventos */}
        <EventsTable events={events} />

        {/* Rodapé */}
        <footer className="border-t border-border pt-4 pb-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-mono text-[0.6rem] text-muted-foreground">
            $ RPA_MONITOR v2.4.1 // Última sinc: {lastSync} //
            {isLive ? ' CONECTADO' : ' OFFLINE (dados simulados)'}
          </span>
          <span className="font-mono text-[0.6rem] text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </footer>
      </main>
    </div>
  );
}
