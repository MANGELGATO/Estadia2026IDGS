import { describe, it, expect } from 'vitest';
import { validateTimeRange, toMinutes, MAX_LOAN_MINUTES } from './reservation';

describe('toMinutes', () => {
  it('convierte HH:MM a minutos', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('09:30')).toBe(570);
    expect(toMinutes('23:59')).toBe(1439);
  });
});

describe('validateTimeRange', () => {
  it('acepta un rango dentro del máximo de 2 horas', () => {
    expect(validateTimeRange('10:00', '11:00')).toEqual({ valid: true });
  });

  it('acepta exactamente 2 horas', () => {
    expect(MAX_LOAN_MINUTES).toBe(120);
    expect(validateTimeRange('10:00', '12:00')).toEqual({ valid: true });
  });

  it('rechaza más de 2 horas', () => {
    expect(validateTimeRange('10:00', '12:01')).toEqual({ valid: false, reason: 'too-long' });
  });

  it('rechaza fin igual al inicio', () => {
    expect(validateTimeRange('10:00', '10:00')).toEqual({ valid: false, reason: 'non-positive' });
  });

  it('rechaza fin anterior al inicio', () => {
    expect(validateTimeRange('10:00', '09:00')).toEqual({ valid: false, reason: 'non-positive' });
  });
});
