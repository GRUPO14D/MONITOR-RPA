import { useState } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { DashboardHeader } from "./components/dashboard-header";
import { StatsSummary } from "./components/stats-summary";
import { RpaCard } from "./components/rpa-card";
import { EventsTable } from "./components/events-table";
import {
  rpaProcesses,
  eventLogs,
} from "./components/mock-data";
import type { RpaStatus } from "./components/mock-data";

const filterOptions: {
  label: string;
  value: RpaStatus | "ALL";
}[] = [
  { label: "ALL", value: "ALL" },
  { label: "RUNNING", value: "RUNNING" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "ERROR", value: "ERROR" },
  { label: "WARNING", value: "WARNING" },
  { label: "QUEUED", value: "QUEUED" },
  { label: "IDLE", value: "IDLE" },
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
  const [activeFilter, setActiveFilter] = useState<
    RpaStatus | "ALL"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredProcesses = rpaProcesses.filter((p) => {
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <DashboardHeader />

      <main className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Stats summary */}
        <StatsSummary />

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search processes, companies, IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-secondary pl-9 pr-4 py-2 font-mono text-[0.75rem] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-status-processing/50 focus:ring-1 focus:ring-status-processing/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 font-mono text-[0.7rem] text-muted-foreground hover:text-foreground hover:border-status-processing/30 transition-colors"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              REFRESH
            </button>

            {/* Filter indicator */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span className="font-mono text-[0.65rem] hidden sm:inline">
                FILTER
              </span>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={`rounded-md border px-3 py-1 font-mono text-[0.65rem] tracking-wider transition-all duration-200 ${
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
                      rpaProcesses.filter(
                        (p) => p.status === opt.value,
                      ).length
                    }
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* RPA Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProcesses.map((process) => (
            <RpaCard key={process.id} process={process} />
          ))}
        </div>

        {filteredProcesses.length === 0 && (
          <div className="text-center py-12">
            <p className="font-mono text-[0.8rem] text-muted-foreground">
              No processes match the current filter.
            </p>
          </div>
        )}

        {/* Events Log */}
        <EventsTable events={eventLogs} />

        {/* Footer */}
        <footer className="border-t border-border pt-4 pb-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-mono text-[0.6rem] text-muted-foreground">
            $ RPA_MONITOR v2.4.1 // Last sync: 10:44:12 //
            Session: 4h 22m
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