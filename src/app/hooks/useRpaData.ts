import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchRpaStatus, fetchEvents } from '../services/api';
import {
  rpaProcesses as mockProcesses,
  eventLogs as mockEvents,
  type RpaProcess,
  type EventLog,
} from '../components/mock-data';

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

interface RpaData {
  processes: RpaProcess[];
  events: EventLog[];
  stats: StatsOverview;
  isLive: boolean;
  lastSync: string;
  refresh: () => void;
  isRefreshing: boolean;
}

const POLL_INTERVAL = 5000; // 5s

function computeStats(processes: RpaProcess[]): StatsOverview {
  const running = processes.filter((p) => p.status === 'RUNNING').length;
  const completed = processes.filter((p) => p.status === 'COMPLETED').length;
  const errors = processes.filter((p) => p.status === 'ERROR').length;
  const warnings = processes.filter((p) => p.status === 'WARNING').length;
  const queued = processes.filter((p) => p.status === 'QUEUED').length;
  const idle = processes.filter((p) => p.status === 'IDLE').length;
  const totalRecords = processes.reduce((sum, p) => sum + p.records, 0);

  const successRate = processes.length > 0
    ? ((completed + running) / processes.length * 100).toFixed(1)
    : '100.0';

  return {
    totalProcesses: processes.length,
    running,
    completed,
    errors,
    warnings,
    queued,
    idle,
    totalRecords,
    uptime: `${successRate}%`,
  };
}

export function useRpaData(): RpaData {
  const [processes, setProcesses] = useState<RpaProcess[]>(mockProcesses);
  const [events, setEvents] = useState<EventLog[]>(mockEvents);
  const [isLive, setIsLive] = useState(false);
  const [lastSync, setLastSync] = useState('--:--:--');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [newProcesses, newEvents] = await Promise.all([
        fetchRpaStatus(),
        fetchEvents(24),
      ]);

      if (newProcesses.length > 0) {
        setProcesses(newProcesses);
        setIsLive(true);
      }
      if (newEvents.length > 0) {
        setEvents(newEvents);
      }
      setLastSync(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    } catch {
      // Backend unreachable — keep current data (mock or last successful fetch)
      setIsLive(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 800);
    });
  }, [fetchData]);

  // Initial fetch + polling
  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const stats = computeStats(processes);

  return { processes, events, stats, isLive, lastSync, refresh, isRefreshing };
}
