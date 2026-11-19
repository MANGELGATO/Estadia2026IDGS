import { describe, it, expect, vi, afterEach } from 'vitest';
import { getPool } from './pool';

describe('lib/pool Resilience & Memory Fallback', () => {
  afterEach(() => {
    delete (global as any).__pgPool;
    delete (global as any).__memPool;
    delete (global as any).__useMemPool;
    delete process.env.DB_DRIVER;
  });

  it('cambia a pg-mem automáticamente cuando DB_DRIVER=memory', async () => {
    process.env.DB_DRIVER = 'memory';
    const pool = getPool();
    const res = await pool.query('SELECT count(*) FROM equipos');
    expect(res.rows).toBeDefined();
    expect(Number((res.rows[0] as any).count)).toBe(13);
  });

  it('soporta transacciones con withTx en el pool de memoria', async () => {
    process.env.DB_DRIVER = 'memory';
    const { withTx } = await import('./pool');
    const result = await withTx(async (client) => {
      const res = await client.query('SELECT 99 as val');
      return (res.rows[0] as any).val;
    });
    expect(result).toBe(99);
  });
});
