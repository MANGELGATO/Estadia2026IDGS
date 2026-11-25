import { describe, it, expect } from 'vitest';
import { generateFolio, generateEntityId } from './folio';

describe('Generador criptográfico de folios e IDs (sin colisiones)', () => {
  it('genera folios con formato PREFIX-YYYYMMDD-XXXXXXXX sin repeticiones en 500 muestras', () => {
    const set = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const f = generateFolio('INC');
      expect(f).toMatch(/^INC-\d{8}-[0-9A-F]{8}$/);
      set.add(f);
    }
    expect(set.size).toBe(500);
  });

  it('genera IDs UUID válidos y menores a 64 caracteres para Directus', () => {
    const id = generateEntityId('bit');
    expect(id.length).toBeLessThanOrEqual(64);
    expect(id).toMatch(/^bit-[0-9a-f-]{36}$/);
  });
});
