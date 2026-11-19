import { Pool, PoolClient, types } from 'pg';
import { env } from './env';
import { logger } from './logger';

/**
 * Acceso a PostgreSQL (estándar PLAi sec. 3: motor único de base de datos relacional).
 * - Consultas siempre parametrizadas ($1, $2, ...).
 * - Los esquemas se gestionan únicamente con migraciones versionadas (database/migrations).
 * - En desarrollo local, si no hay un servidor PostgreSQL activo en el puerto 5432,
 *   cuenta con fallback automático a base de datos PostgreSQL en memoria (pg-mem)
 *   sembrada con las migraciones y catálogos oficiales para permitir el flujo sin errores.
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
  var __memPool: Pool | undefined;
  var __useMemPool: boolean | undefined;
}

function isConnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string; message?: string; cause?: { code?: string } };
  const code = err.code || err.cause?.code;
  const msg = err.message || '';
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('Connection terminated')
  );
}

function initMemoryPool(): Pool {
  if (global.__memPool) return global.__memPool;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('node:fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('node:path');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { newDb } = require('pg-mem');

    const db = newDb();
    const dir = path.join(process.cwd(), 'database', 'migrations');
    if (fs.existsSync(dir)) {
      for (const file of fs.readdirSync(dir).filter((f: string) => f.endsWith('.sql')).sort()) {
        db.public.none(fs.readFileSync(path.join(dir, file), 'utf8'));
      }
    }

    const seedFile = path.join(process.cwd(), 'database', 'seeds', 'demo_datos.sql');
    if (fs.existsSync(seedFile)) {
      db.public.none(fs.readFileSync(seedFile, 'utf8'));
    }

    const { Pool: MemPool } = db.adapters.createPg();
    global.__memPool = new MemPool() as unknown as Pool;
    return global.__memPool;
  } catch (err) {
    logger.error('No se pudo inicializar el pool en memoria de desarrollo', undefined, err);
    throw err;
  }
}

export function getPool(): Pool {
  if (global.__pgPool) {
    return global.__pgPool;
  }

  // Modo memoria forzado explícitamente en variables de entorno para desarrollo
  if (global.__useMemPool || process.env.DB_DRIVER === 'memory' || env.dbHost === 'memory') {
    return initMemoryPool();
  }

  // En producción: conexión estricta al clúster PostgreSQL de PLAi
  if (env.isProduction) {
    const realPool = new Pool({
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
    global.__pgPool = realPool;
    return realPool;
  }

  // En desarrollo: pool con auto-detección y fallback a pg-mem
  const realPool = new Pool({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 1_500, // Timeout corto en desarrollo para conmutación inmediata
    ssl: env.dbSsl ? { rejectUnauthorized: false } : undefined,
  });

  realPool.on('error', (err) => {
    if (isConnError(err)) {
      if (!global.__useMemPool) {
        logger.warn('PostgreSQL local no disponible. Conmutando a base de datos en memoria para desarrollo.');
      }
      global.__useMemPool = true;
    }
  });

  const resilientPool = new Proxy(realPool, {
    get(target, prop, receiver) {
      if (prop === 'query') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return async (...args: any[]) => {
          if (global.__useMemPool) {
            return initMemoryPool().query(args[0], args[1]);
          }
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (target.query as any)(...args);
          } catch (error) {
            if (isConnError(error)) {
              logger.warn(
                `PostgreSQL local (${env.dbHost}:${env.dbPort}) no detectado. Conmutando a PostgreSQL en memoria con catálogos oficiales.`
              );
              global.__useMemPool = true;
              return initMemoryPool().query(args[0], args[1]);
            }
            throw error;
          }
        };
      }

      if (prop === 'connect') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return async (...args: any[]) => {
          if (global.__useMemPool) {
            return initMemoryPool().connect();
          }
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await (target.connect as any)(...args);
          } catch (error) {
            if (isConnError(error)) {
              logger.warn('PostgreSQL local no detectado al abrir transacción. Conmutando a base de datos en memoria.');
              global.__useMemPool = true;
              return initMemoryPool().connect();
            }
            throw error;
          }
        };
      }

      const val = Reflect.get(target, prop, receiver);
      return typeof val === 'function' ? val.bind(target) : val;
    },
  });

  global.__pgPool = resilientPool as unknown as Pool;
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
