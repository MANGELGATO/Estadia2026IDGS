import { Pool, PoolClient, types } from 'pg';
import { env } from './env';

/**
 * Acceso a PostgreSQL (estándar PLAi sec. 3: motor único de base de datos relacional).
 * - Consultas siempre parametrizadas ($1, $2, ...).
 * - Los esquemas se gestionan únicamente con migraciones versionadas (database/migrations).
 */

// DATE y TIMESTAMP (sin zona) se devuelven como texto 'YYYY-MM-DD' / 'YYYY-MM-DD HH:MM:SS'
// para evitar desplazamientos por zona horaria en el servidor.
types.setTypeParser(1082, (v: string) => v);
types.setTypeParser(1114, (v: string) => v);

export interface Queryable {
  query<R = Record<string, unknown>>(
    text: string,
    params?: unknown[]
  ): Promise<{ rows: R[]; rowCount: number | null }>;
}

declare global {
  var __pgPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      host: env.dbHost,
      port: env.dbPort,
      user: env.dbUser,
      password: env.dbPassword,
      database: env.dbName,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: env.dbSsl ? { rejectUnauthorized: false } : undefined,
    });
  }
  return global.__pgPool;
}

/** Reemplaza el pool (uso exclusivo de pruebas automatizadas). */
export function setPoolForTests(pool: unknown): void {
  global.__pgPool = pool as Pool;
}

export async function withTx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // se ignora: se propaga el error original
    }
    throw error;
  } finally {
    client.release();
  }
}

/** Normaliza un valor DATE a 'YYYY-MM-DD'. */
export function toDateStr(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v ?? '').slice(0, 10);
}

/** Normaliza un valor TIMESTAMP a 'YYYY-MM-DD HH:MM:SS'. */
export function toDateTimeStr(v: unknown): string {
  if (v instanceof Date) return v.toISOString().replace('T', ' ').slice(0, 19);
  return String(v ?? '').replace('T', ' ').slice(0, 19);
}

/** Normaliza un valor TIME a 'HH:MM'. */
export function toTimeStr(v: unknown): string {
  return String(v ?? '').slice(0, 5);
}
