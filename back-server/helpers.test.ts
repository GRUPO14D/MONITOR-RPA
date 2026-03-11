import { describe, it, expect } from 'vitest';
import { resolveStatus, buildRpaStatus } from './helpers';
import type { TelemetryEvent } from './helpers';

describe('resolveStatus', () => {
  it('retorna "running" para rpa_started', () => {
    expect(resolveStatus('rpa_started')).toBe('running');
  });

  it('retorna "error" para rpa_error', () => {
    expect(resolveStatus('rpa_error')).toBe('error');
  });

  it('retorna "automating" para automation_started', () => {
    expect(resolveStatus('automation_started')).toBe('automating');
  });

  it('usa payloadStatus para rpa_finished', () => {
    expect(resolveStatus('rpa_finished', 'success')).toBe('success');
    expect(resolveStatus('rpa_finished', 'warning')).toBe('warning');
    expect(resolveStatus('rpa_finished', 'error')).toBe('error');
  });

  it('usa payloadStatus para automation_finished', () => {
    expect(resolveStatus('automation_finished', 'success')).toBe('success');
    expect(resolveStatus('automation_finished', 'warning')).toBe('warning');
  });

  it('default "success" para rpa_finished sem payloadStatus', () => {
    expect(resolveStatus('rpa_finished')).toBe('success');
    expect(resolveStatus('automation_finished')).toBe('success');
  });

  it('retorna "unknown" para evento desconhecido', () => {
    expect(resolveStatus('evento_invalido')).toBe('unknown');
    expect(resolveStatus('')).toBe('unknown');
  });
});

describe('buildRpaStatus', () => {
  const basePayload: TelemetryEvent = {
    rpa: 'rpa-teste',
    event: 'rpa_started',
    session_id: 'sess-001',
    machine: 'MAQUINA-01',
    empresa: 'Empresa Teste',
    timestamp: '2026-03-11T14:00:00Z',
  };

  it('constrói RPAStatus com campos corretos', () => {
    const result = buildRpaStatus(basePayload);
    expect(result.rpa).toBe('rpa-teste');
    expect(result.status).toBe('running');
    expect(result.event).toBe('rpa_started');
    expect(result.empresa).toBe('Empresa Teste');
    expect(result.machine).toBe('MAQUINA-01');
    expect(result.session_id).toBe('sess-001');
    expect(result.timestamp).toBe('2026-03-11T14:00:00Z');
    expect(result.detalhes).toEqual({});
  });

  it('popula detalhes com campos extras', () => {
    const extra = { records: 150, totalRecords: 200, cpu: 42.5 };
    const result = buildRpaStatus(basePayload, extra);
    expect(result.detalhes).toEqual(extra);
  });

  it('usa "desconhecido" quando rpa está vazio', () => {
    const result = buildRpaStatus({ ...basePayload, rpa: '' });
    expect(result.rpa).toBe('desconhecido');
  });

  it('calcula status correto para rpa_finished com warning', () => {
    const payload: TelemetryEvent = {
      ...basePayload,
      event: 'rpa_finished',
      status: 'warning',
    };
    const result = buildRpaStatus(payload);
    expect(result.status).toBe('warning');
  });

  it('propaga duracao_segundos quando presente', () => {
    const result = buildRpaStatus({ ...basePayload, duracao_segundos: 125 });
    expect(result.duracao_segundos).toBe(125);
  });

  it('duracao_segundos é undefined quando ausente', () => {
    const result = buildRpaStatus(basePayload);
    expect(result.duracao_segundos).toBeUndefined();
  });
});
