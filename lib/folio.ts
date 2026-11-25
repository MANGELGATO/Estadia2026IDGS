import crypto from 'node:crypto';

/**
 * Genera folios institucionales criptográficamente únicos:
 * `<PREFIX>-YYYYMMDD-<8 caracteres hex aleatorios>` (4 bytes = 4.29 × 10^9 combinaciones/día).
 * Elimina las colisiones del cumpleaños que existían con `Date.now().toString().slice(-4)`.
 */
export function generateFolio(prefix: 'RES' | 'ESP' | 'INC' | 'CUR'): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
}

/**
 * Genera llaves primarias únicas (`max_length: 64`) compatibles con Directus.
 */
export function generateEntityId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
