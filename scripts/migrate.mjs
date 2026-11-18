#!/usr/bin/env node
/**
 * Ejecuta las migraciones SQL versionadas de database/migrations (orden alfabético)
 * sobre PostgreSQL. Idempotente: cada archivo se aplica una sola vez (tabla schema_migrations).
 *
 * Uso:
 *   node scripts/migrate.mjs              # aplica migraciones pendientes
 *   node scripts/migrate.mjs --seed-demo  # además carga database/seeds/demo_datos.sql (NO en producción)
 *
 * Configuración por variables de entorno (estándar PLAi sec. 6):
 *   DB_HOST, DB_PORT, DB_USER, DB_NAME, DB_SSL, DB_PASSWORD | DB_PASSWORD_FILE | /run/secrets/db_password
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function secret(name) {
  const file = process.env[`${name}_FILE`];
  if (file && fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim();
  const std = `/run/secrets/${name.toLowerCase()}`;
  if (fs.existsSync(std)) return fs.readFileSync(std, 'utf8').trim();
  return process.env[name] || '';
}

function loadDotEnvLocal() {
  // Comodidad en desarrollo: lee .env.local si existe y la variable no está definida.
  const file = path.join(root, '.env.local');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

async function main() {
  if (process.env.NODE_ENV !== 'production') loadDotEnvLocal();
  const seedDemo = process.argv.includes('--seed-demo');
  if (seedDemo && process.env.NODE_ENV === 'production') {
    throw new Error('--seed-demo no está permitido en producción.');
  }

  const client = new pg.Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'plai',
    password: secret('DB_PASSWORD'),
    database: process.env.DB_NAME || 'plai_recursos',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version     TEXT PRIMARY KEY,
        checksum    TEXT NOT NULL,
        applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    const { rows } = await client.query('SELECT version, checksum FROM schema_migrations');
    const applied = new Map(rows.map((r) => [r.version, r.checksum]));

    const dir = path.join(root, 'database', 'migrations');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

    let count = 0;
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');

      if (applied.has(file)) {
        if (applied.get(file) !== checksum) {
          throw new Error(`La migración ya aplicada ${file} fue modificada. Crea una nueva migración en su lugar.`);
        }
        continue;
      }

      console.log(`Aplicando ${file} ...`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)', [file, checksum]);
        await client.query('COMMIT');
        count++;
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Falló ${file}: ${error.message}`);
      }
    }
    console.log(count === 0 ? 'Base de datos al día: no hay migraciones pendientes.' : `Migraciones aplicadas: ${count}.`);

    if (seedDemo) {
      const seed = fs.readFileSync(path.join(root, 'database', 'seeds', 'demo_datos.sql'), 'utf8');
      await client.query(seed);
      console.log('Datos de demostración cargados.');
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
