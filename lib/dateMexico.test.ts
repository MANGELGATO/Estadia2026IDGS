import { describe, it, expect } from 'vitest';
import {
  mexicoLocalToUtcIso,
  formatMexicoDateTime,
  getMexicoDateTimeLocalInput,
  getMexicoTodayYmd,
  addDaysToYmd,
} from './dateMexico';

describe('Utilidades de fecha/hora America/Mexico_City (independientes de TZ del contenedor)', () => {
  it('convierte fecha y hora local de México a ISO-8601 UTC correctamente', () => {
    // 2026-11-26 11:30 hora de CDMX (UTC-6) === 2026-11-26T17:30:00.000Z
    expect(mexicoLocalToUtcIso('2026-11-26', '11:30')).toBe('2026-11-26T17:30:00.000Z');
    expect(mexicoLocalToUtcIso('2026-11-26T14:00')).toBe('2026-11-26T20:00:00.000Z');
    expect(mexicoLocalToUtcIso('2026-11-26 14:00:00')).toBe('2026-11-26T20:00:00.000Z');
  });

  it('respeta timestamps que ya contienen sufijo Z u offset explícito sin desplazarlos dos veces', () => {
    expect(mexicoLocalToUtcIso('2026-11-26T17:30:00.000Z')).toBe('2026-11-26T17:30:00.000Z');
    expect(mexicoLocalToUtcIso('2026-11-26T11:30:00-06:00')).toBe('2026-11-26T17:30:00.000Z');
  });

  it('formatea timestamps UTC en zona horaria America/Mexico_City (no UTC recortado)', () => {
    // 17:30 UTC === 11:30 en CDMX (el bug original mostraba 17:30)
    const formatted = formatMexicoDateTime('2026-11-26T17:30:00.000Z');
    expect(formatted).toContain('26/11/2026');
    expect(formatted).toContain('11:30');
    expect(formatted).not.toContain('17:30');
  });

  it('genera valores por defecto para datetime-local en hora de México', () => {
    const fixedUtc = new Date('2026-11-26T17:30:00.000Z'); // 11:30 CDMX
    expect(getMexicoDateTimeLocalInput(fixedUtc)).toBe('2026-11-26T11:30');
    expect(getMexicoDateTimeLocalInput(fixedUtc, 2 * 60 * 60 * 1000)).toBe('2026-11-26T13:30');
  });

  it('calcula el día actual en CDMX incluso cerca de medianoche UTC', () => {
    // 2026-11-27 02:30 UTC todavía es 2026-11-26 20:30 en CDMX
    const lateEveningMexico = new Date('2026-11-27T02:30:00.000Z');
    expect(getMexicoTodayYmd(lateEveningMexico)).toBe('2026-11-26');
    expect(addDaysToYmd('2026-11-26', 14)).toBe('2026-12-10');
  });
});
