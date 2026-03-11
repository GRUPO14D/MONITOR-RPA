import { describe, it, expect } from 'vitest';
import { mapStatus, formatDuration } from './api';

describe('mapStatus', () => {
  it('mapeia status conhecidos corretamente', () => {
    expect(mapStatus('running')).toBe('RUNNING');
    expect(mapStatus('success')).toBe('COMPLETED');
    expect(mapStatus('error')).toBe('ERROR');
    expect(mapStatus('automating')).toBe('RUNNING');
    expect(mapStatus('warning')).toBe('WARNING');
    expect(mapStatus('unknown')).toBe('IDLE');
  });

  it('retorna IDLE para status desconhecido', () => {
    expect(mapStatus('qualquer-coisa')).toBe('IDLE');
    expect(mapStatus('')).toBe('IDLE');
  });
});

describe('formatDuration', () => {
  it('retorna "--:--" quando segundos é undefined ou zero', () => {
    expect(formatDuration(undefined)).toBe('--:--');
    expect(formatDuration(0)).toBe('--:--');
  });

  it('formata horas e minutos corretamente', () => {
    expect(formatDuration(3600)).toBe('01h 00m');
    expect(formatDuration(3725)).toBe('01h 02m');
    expect(formatDuration(7200)).toBe('02h 00m');
    expect(formatDuration(59)).toBe('00h 00m');
    expect(formatDuration(3599)).toBe('00h 59m');
  });

  it('formata duração de sessão longa', () => {
    expect(formatDuration(36000)).toBe('10h 00m');
  });
});
