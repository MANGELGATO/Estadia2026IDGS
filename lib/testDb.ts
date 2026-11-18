import fs from 'node:fs';
import path from 'node:path';
import { newDb } from 'pg-mem';
import { setPoolForTests } from './pool';

/**
 * Base PostgreSQL en memoria (pg-mem) con las migraciones reales aplicadas.
 * Solo para pruebas automatizadas: valida el esquema y las consultas sin servidor externo.
 */
export function createTestDb(options: { demo?: boolean } = {}) {
  const db = newDb();
  const dir = path.join(process.cwd(), 'database', 'migrations');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    db.public.none(fs.readFileSync(path.join(dir, file), 'utf8'));
  }
  if (options.demo) {
    db.public.none(
      fs.readFileSync(path.join(process.cwd(), 'database', 'seeds', 'demo_datos.sql'), 'utf8')
    );
  }
  const { Pool } = db.adapters.createPg();
  const pool = new Pool();
  setPoolForTests(pool);
  return { db, pool };
}
