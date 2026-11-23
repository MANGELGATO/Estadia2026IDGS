import { Pool } from 'pg';
import { env } from './env';
import { DeviceItem, mockDevices, AppItem, mockApps } from './mockData';
import { hashPassword } from './password';
import { logger } from './logger';

export type { DeviceItem };

// Pool singleton de PostgreSQL / Neon para reutilizar conexiones en Next.js
declare global {
  var __pgPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!global.__pgPool) {
    if (env.databaseUrl) {
      global.__pgPool = new Pool({
        connectionString: env.databaseUrl,
        ssl: env.dbSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    } else {
      global.__pgPool = new Pool({
        host: env.dbHost || '127.0.0.1',
        port: env.dbPort,
        user: env.dbUser || 'postgres',
        password: env.dbPassword || undefined,
        database: env.dbName,
        ssl: env.dbSsl ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    }
  }
  return global.__pgPool;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!env.hasDatabaseConfig) return false;
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

// Almacenamiento en memoria únicamente para entornos sin BD configurada (ej. pruebas unitarias).
// Cumple con Docker Swarm read_only: true (nunca escribe archivos en disco junto al código).
interface MemoryStore {
  equipos: DeviceItem[];
  aplicaciones: AppItem[];
  bitacora: BitacoraItem[];
  reservaciones: ReservacionItem[];
  incidencias: IncidenciaItem[];
  usuarios: UsuarioRecord[];
  cursos: CursoAgendaItem[];
  config: SystemConfig;
}

declare global {
  var __plaiMemoryStore: MemoryStore | undefined;
}

function getMemoryStore(): MemoryStore {
  if (!global.__plaiMemoryStore) {
    global.__plaiMemoryStore = {
      equipos: [...mockDevices],
      aplicaciones: [...mockApps],
      bitacora: [],
      reservaciones: [],
      incidencias: [],
      usuarios: [],
      cursos: [],
      config: { ...initialSystemConfig },
    };
  }
  return global.__plaiMemoryStore;
}

// Mapeos de categorías
const CATEGORY_MAP: Record<string, DeviceItem['category']> = {
  'realidad-virtual': 'Realidad Virtual',
  'robotica': 'Robótica',
  'fabricacion-digital': 'Fabricación digital',
  'drones': 'Drones',
  'computo-multimedia': 'Cómputo',
};

const CATEGORY_TO_ID_MAP: Record<string, string> = {
  'Realidad Virtual': 'realidad-virtual',
  'Robótica': 'robotica',
  'Fabricación digital': 'fabricacion-digital',
  'Drones': 'drones',
  'Cómputo': 'computo-multimedia',
};

function parseStringArray(val: unknown, fallback: string[]): string[] {
  if (Array.isArray(val)) {
    return val.map(String);
  }
  if (typeof val === 'string' && val.trim().length > 0) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return [val];
    }
  }
  return fallback;
}

// ====================================================================
// 1. EQUIPOS
// ====================================================================
interface EquipoRow {
  id: string;
  categoria_id: string;
  categoria_nombre?: string | null;
  nombre: string;
  marca: string;
  modelo: string;
  almacenamiento?: string | null;
  numero_serie: string;
  codigo_plai: string;
  estado: DeviceItem['status'];
  ubicacion: string;
  especificaciones: unknown;
  accesorios: unknown;
  imagen_emoji: string | null;
  imagen_url?: string | null;
  responsable: string | null;
  observaciones: string | null;
  created_at: string | Date | null;
}

export function mapRowToDeviceItem(row: EquipoRow): DeviceItem {
  const specs = parseStringArray(row.especificaciones, ['Sin especificaciones registradas']);
  const accessories = parseStringArray(row.accesorios, ['Equipo estándar']);
  const category =
    CATEGORY_MAP[row.categoria_id] ||
    (row.categoria_nombre as DeviceItem['category']) ||
    'Realidad Virtual';

  let dateAdded: string | undefined;
  if (row.created_at) {
    const d = new Date(row.created_at);
    if (!Number.isNaN(d.getTime())) {
      dateAdded = d.toISOString().split('T')[0];
    }
  }

  return {
    id: row.id,
    name: row.nombre,
    category,
    brand: row.marca,
    model: row.modelo,
    inventoryNumber: row.codigo_plai,
    serialNumber: row.numero_serie,
    storage: row.almacenamiento || 'N/A',
    status: row.estado || 'Disponible',
    location: row.ubicacion || 'Laboratorio de Innovación PLAi',
    specs,
    accessories,
    imageEmoji: row.imagen_emoji || '📦',
    imageUrl: row.imagen_url || undefined,
    responsible: row.responsable || 'Laboratorio de Innovación PLAi',
    observations: row.observaciones || undefined,
    dateAdded,
  };
}

export async function getEquiposFromDB(): Promise<DeviceItem[]> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const { rows } = await pool.query<EquipoRow>(`
        SELECT e.*, c.nombre AS categoria_nombre
        FROM equipos e
        LEFT JOIN categorias c ON e.categoria_id = c.id
        ORDER BY e.created_at DESC, e.id ASC
      `);
      return rows.map(mapRowToDeviceItem);
    } catch (error) {
      logger.error('Error al consultar equipos en PostgreSQL', { error: String(error) });
    }
  }
  return getMemoryStore().equipos;
}

export async function insertEquipoInDB(item: DeviceItem): Promise<boolean> {
  const categoriaId = CATEGORY_TO_ID_MAP[item.category] || 'realidad-virtual';

  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      await pool.query(
        `
        INSERT INTO equipos (
          id, categoria_id, nombre, marca, modelo, almacenamiento,
          numero_serie, codigo_plai, estado, ubicacion, especificaciones,
          accesorios, imagen_emoji, imagen_url, responsable, observaciones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          categoria_id = EXCLUDED.categoria_id,
          nombre = EXCLUDED.nombre,
          marca = EXCLUDED.marca,
          modelo = EXCLUDED.modelo,
          almacenamiento = EXCLUDED.almacenamiento,
          numero_serie = EXCLUDED.numero_serie,
          codigo_plai = EXCLUDED.codigo_plai,
          estado = EXCLUDED.estado,
          ubicacion = EXCLUDED.ubicacion,
          especificaciones = EXCLUDED.especificaciones,
          accesorios = EXCLUDED.accesorios,
          imagen_emoji = EXCLUDED.imagen_emoji,
          imagen_url = EXCLUDED.imagen_url,
          responsable = EXCLUDED.responsable,
          observaciones = EXCLUDED.observaciones,
          updated_at = NOW()
        `,
        [
          item.id,
          categoriaId,
          item.name,
          item.brand,
          item.model,
          item.storage || 'N/A',
          item.serialNumber || `SN-${Date.now()}`,
          item.inventoryNumber,
          item.status,
          item.location,
          JSON.stringify(item.specs || []),
          JSON.stringify(item.accessories || []),
          item.imageEmoji || '📦',
          item.imageUrl || null,
          item.responsible || 'Laboratorio de Innovación PLAi',
          item.observations || null,
        ]
      );
      return true;
    } catch (error) {
      logger.error('Error al guardar equipo en PostgreSQL', { error: String(error) });
      throw error;
    }
  }

  const store = getMemoryStore();
  const idx = store.equipos.findIndex(
    (e) => e.id === item.id || e.inventoryNumber === item.inventoryNumber
  );
  if (idx >= 0) store.equipos[idx] = item;
  else store.equipos.unshift(item);
  return true;
}

export async function deleteEquipoInDB(id: string): Promise<boolean> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const result = await pool.query('DELETE FROM equipos WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error('Error al eliminar equipo en PostgreSQL', { error: String(error) });
      throw error;
    }
  }

  const store = getMemoryStore();
  const prevLen = store.equipos.length;
  store.equipos = store.equipos.filter((e) => e.id !== id);
  return store.equipos.length < prevLen;
}

export async function getEquipoByCodigoPLAi(codigo: string): Promise<DeviceItem | null> {
  const all = await getEquiposFromDB();
  const normalized = codigo.trim().toLowerCase();
  return all.find((e) => e.inventoryNumber.toLowerCase() === normalized) || null;
}

// ====================================================================
// 2. APLICACIONES VR / PC
// ====================================================================
interface AppRow {
  id: string;
  nombre: string;
  desarrollador: string;
  version: string;
  categoria: string;
  plataforma: AppItem['platform'];
  clasificacion_edad: string;
  descripcion: string;
  imagen_url: string | null;
  equipos_instalados: number;
  estado: AppItem['status'];
}

export async function getAplicacionesFromDB(): Promise<AppItem[]> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const { rows } = await pool.query<AppRow>(
        'SELECT * FROM aplicaciones ORDER BY created_at DESC, id ASC'
      );
      return rows.map((r) => ({
        id: String(r.id),
        name: r.nombre,
        developer: r.desarrollador,
        version: r.version,
        category: r.categoria as AppItem['category'],
        platform: r.plataforma,
        ageRating: r.clasificacion_edad,
        description: r.descripcion,
        imageUrl: r.imagen_url || undefined,
        iconUrl: r.imagen_url || undefined,
        devicesInstalled: Number(r.equipos_instalados || 1),
        status: r.estado,
      }));
    } catch (error) {
      logger.error('Error al consultar aplicaciones en PostgreSQL', { error: String(error) });
    }
  }
  return getMemoryStore().aplicaciones;
}

export async function insertAplicacionInDB(app: AppItem): Promise<boolean> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      await pool.query(
        `
        INSERT INTO aplicaciones (
          id, nombre, desarrollador, version, categoria, plataforma,
          clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          desarrollador = EXCLUDED.desarrollador,
          version = EXCLUDED.version,
          categoria = EXCLUDED.categoria,
          plataforma = EXCLUDED.plataforma,
          clasificacion_edad = EXCLUDED.clasificacion_edad,
          descripcion = EXCLUDED.descripcion,
          imagen_url = EXCLUDED.imagen_url,
          equipos_instalados = EXCLUDED.equipos_instalados,
          estado = EXCLUDED.estado,
          updated_at = NOW()
        `,
        [
          app.id,
          app.name,
          app.developer,
          app.version || '1.0',
          app.category,
          app.platform,
          app.ageRating || 'Todas las edades',
          app.description,
          app.imageUrl || app.iconUrl || null,
          app.devicesInstalled || 1,
          app.status || 'Activa',
        ]
      );
      return true;
    } catch (error) {
      logger.error('Error al guardar aplicación en PostgreSQL', { error: String(error) });
      throw error;
    }
  }

  const store = getMemoryStore();
  const idx = store.aplicaciones.findIndex((a) => a.id === app.id);
  if (idx >= 0) store.aplicaciones[idx] = app;
  else store.aplicaciones.unshift(app);
  return true;
}

export async function deleteAplicacionInDB(id: string): Promise<boolean> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const result = await pool.query('DELETE FROM aplicaciones WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error('Error al eliminar aplicación en PostgreSQL', { error: String(error) });
      throw error;
    }
  }

  const store = getMemoryStore();
  store.aplicaciones = store.aplicaciones.filter((a) => a.id !== id);
  return true;
}

// ====================================================================
// 3. BITÁCORA DE USO (ENTREGAS Y DEVOLUCIONES)
// ====================================================================
export interface BitacoraItem {
  id: string;
  equipoId: string;
  codigoPlai: string;
  equipoNombre: string;
  usuarioNombre: string;
  usuarioEmail: string;
  usuarioDependencia?: string;
  fechaEntrega: string;
  fechaDevolucionEstimada: string;
  fechaDevolucionReal?: string;
  estadoPrestamo: 'Activo' | 'Devuelto' | 'Con Incidencia';
  condicionEntrega: 'Excelente' | 'Bueno' | 'Regular';
  condicionDevolucion?: 'Excelente' | 'Bueno' | 'Observación' | 'En revisión' | 'Dañado';
  accesoriosEntregados: string;
  accesoriosDevueltos?: string;
  observacionesEntrega?: string;
  observacionesDevolucion?: string;
  incidenciaGenerada?: boolean;
  adminEntrega: string;
  adminRecibe?: string;
  createdAt?: string;
}

interface BitacoraRow {
  id: string;
  equipo_id: string;
  codigo_plai: string;
  equipo_nombre: string;
  usuario_nombre: string;
  usuario_email: string;
  usuario_dependencia: string | null;
  fecha_entrega: string | Date;
  fecha_devolucion_estimada: string | Date;
  fecha_devolucion_real: string | Date | null;
  estado_prestamo: BitacoraItem['estadoPrestamo'];
  condicion_entrega: BitacoraItem['condicionEntrega'];
  condicion_devolucion: BitacoraItem['condicionDevolucion'] | null;
  accesorios_entregados: string;
  accesorios_devueltos: string | null;
  observaciones_entrega: string | null;
  observaciones_devolucion: string | null;
  incidencia_generada: boolean;
  admin_entrega: string;
  admin_recibe: string | null;
}

function formatTimestamp(val: string | Date | null | undefined): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().slice(0, 19).replace('T', ' ');
  return String(val);
}

export async function getBitacoraFromDB(): Promise<BitacoraItem[]> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const { rows } = await pool.query<BitacoraRow>(
        'SELECT * FROM bitacora_uso ORDER BY fecha_entrega DESC'
      );
      return rows.map((r) => ({
        id: String(r.id),
        equipoId: r.equipo_id,
        codigoPlai: r.codigo_plai,
        equipoNombre: r.equipo_nombre,
        usuarioNombre: r.usuario_nombre,
        usuarioEmail: r.usuario_email,
        usuarioDependencia: r.usuario_dependencia || undefined,
        fechaEntrega: formatTimestamp(r.fecha_entrega),
        fechaDevolucionEstimada: formatTimestamp(r.fecha_devolucion_estimada),
        fechaDevolucionReal: r.fecha_devolucion_real
          ? formatTimestamp(r.fecha_devolucion_real)
          : undefined,
        estadoPrestamo: r.estado_prestamo,
        condicionEntrega: r.condicion_entrega,
        condicionDevolucion: r.condicion_devolucion || undefined,
        accesoriosEntregados: r.accesorios_entregados,
        accesoriosDevueltos: r.accesorios_devueltos || undefined,
        observacionesEntrega: r.observaciones_entrega || undefined,
        observacionesDevolucion: r.observaciones_devolucion || undefined,
        incidenciaGenerada: Boolean(r.incidencia_generada),
        adminEntrega: r.admin_entrega,
        adminRecibe: r.admin_recibe || undefined,
      }));
    } catch (error) {
      logger.error('Error al consultar bitácora en PostgreSQL', { error: String(error) });
    }
  }
  return getMemoryStore().bitacora;
}

export async function insertBitacoraEntregaInDB(
  item: BitacoraItem,
  reservaId?: string
): Promise<boolean> {
  if (env.hasDatabaseConfig) {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `
        INSERT INTO bitacora_uso (
          id, equipo_id, codigo_plai, equipo_nombre, usuario_nombre,
          usuario_email, usuario_dependencia, fecha_entrega, fecha_devolucion_estimada,
          estado_prestamo, condicion_entrega, accesorios_entregados, observaciones_entrega,
          admin_entrega
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          item.id,
          item.equipoId,
          item.codigoPlai,
          item.equipoNombre,
          item.usuarioNombre,
          item.usuarioEmail,
          item.usuarioDependencia || null,
          item.fechaEntrega,
          item.fechaDevolucionEstimada,
          item.estadoPrestamo || 'Activo',
          item.condicionEntrega || 'Excelente',
          item.accesoriosEntregados || 'Equipo completo',
          item.observacionesEntrega || null,
          item.adminEntrega || 'Administrador PLAi',
        ]
      );

      await client.query(
        `UPDATE equipos SET estado = 'En uso', updated_at = NOW() WHERE codigo_plai = $1 OR id = $2`,
        [item.codigoPlai, item.equipoId]
      );

      if (reservaId) {
        await client.query(
          `UPDATE reservaciones SET estado = 'En uso', codigo_plai_asignado = $1, equipo_id = $2, updated_at = NOW() WHERE id = $3`,
          [item.codigoPlai, item.equipoId, reservaId]
        );
      } else {
        await client.query(
          `UPDATE reservaciones
           SET estado = 'En uso', updated_at = NOW()
           WHERE estado IN ('Aprobada', 'Pendiente')
             AND (LOWER(codigo_plai_asignado) = LOWER($1) OR equipo_id = $2)`,
          [item.codigoPlai, item.equipoId]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error al registrar entrega en PostgreSQL', { error: String(error) });
      throw error;
    } finally {
      client.release();
    }
  }

  const store = getMemoryStore();
  store.bitacora.unshift(item);
  const eq = store.equipos.find(
    (e) => e.inventoryNumber.toLowerCase() === item.codigoPlai.toLowerCase() || e.id === item.equipoId
  );
  if (eq) eq.status = 'En uso';
  return true;
}

export async function updateBitacoraDevolucionInDB(
  id: string,
  devolucion: {
    fechaDevolucionReal: string;
    condicionDevolucion: BitacoraItem['condicionDevolucion'];
    accesoriosDevueltos: string;
    observacionesDevolucion?: string;
    incidenciaGenerada?: boolean;
    adminRecibe: string;
  }
): Promise<boolean> {
  if (env.hasDatabaseConfig) {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const estadoPrestamo = devolucion.incidenciaGenerada ? 'Con Incidencia' : 'Devuelto';
      const { rows } = await client.query<{ codigo_plai: string; equipo_id: string }>(
        `
        UPDATE bitacora_uso SET
          fecha_devolucion_real = $1,
          condicion_devolucion = $2,
          accesorios_devueltos = $3,
          observaciones_devolucion = $4,
          incidencia_generada = $5,
          estado_prestamo = $6,
          admin_recibe = $7
        WHERE id = $8
        RETURNING codigo_plai, equipo_id
        `,
        [
          devolucion.fechaDevolucionReal,
          devolucion.condicionDevolucion || null,
          devolucion.accesoriosDevueltos,
          devolucion.observacionesDevolucion || null,
          Boolean(devolucion.incidenciaGenerada),
          estadoPrestamo,
          devolucion.adminRecibe,
          id,
        ]
      );

      if (rows[0]) {
        const nuevoEstado = devolucion.incidenciaGenerada ? 'En mantenimiento' : 'Disponible';
        await client.query(
          'UPDATE equipos SET estado = $1, updated_at = NOW() WHERE codigo_plai = $2 OR id = $3',
          [nuevoEstado, rows[0].codigo_plai, rows[0].equipo_id]
        );
        await client.query(
          `UPDATE reservaciones
           SET estado = 'Completada', updated_at = NOW()
           WHERE estado IN ('En uso', 'Aprobada')
             AND (LOWER(codigo_plai_asignado) = LOWER($1) OR equipo_id = $2)`,
          [rows[0].codigo_plai, rows[0].equipo_id]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error al actualizar devolución en PostgreSQL', { error: String(error) });
      throw error;
    } finally {
      client.release();
    }
  }

  const store = getMemoryStore();
  const item = store.bitacora.find((b) => b.id === id);
  if (item) {
    item.fechaDevolucionReal = devolucion.fechaDevolucionReal;
    item.condicionDevolucion = devolucion.condicionDevolucion;
    item.accesoriosDevueltos = devolucion.accesoriosDevueltos;
    item.observacionesDevolucion = devolucion.observacionesDevolucion;
    item.incidenciaGenerada = devolucion.incidenciaGenerada;
    item.estadoPrestamo = devolucion.incidenciaGenerada ? 'Con Incidencia' : 'Devuelto';
    item.adminRecibe = devolucion.adminRecibe;
  }
  return true;
}

// ====================================================================
// 4. RESERVACIONES
// ====================================================================
export interface ReservacionItem {
  id: string;
  folio: string;
  categoriaId: string;
  equipoId?: string;
  codigoPlaiAsignado?: string;
  usuarioId?: string;
  usuarioNombre: string;
  usuarioEmail: string;
  usuarioTelefono?: string;
  usuarioInstitucion?: string;
  fechaUso: string;
  horaInicio: string;
  horaFin: string;
  actividad: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'En uso' | 'Completada';
  accesoriosIncluidos?: string;
  condicionSalida?: string;
  observacionesAdmin?: string;
  aprobadoPor?: string;
  createdAt?: string;
}

interface ReservacionRow {
  id: string;
  folio: string;
  categoria_id: string;
  equipo_id: string | null;
  codigo_plai_asignado: string | null;
  usuario_id: string | null;
  usuario_nombre: string;
  usuario_email: string;
  usuario_telefono: string | null;
  usuario_institucion: string | null;
  fecha_uso: string | Date;
  hora_inicio: string;
  hora_fin: string;
  actividad: string;
  estado: ReservacionItem['estado'];
  accesorios_incluidos: string | null;
  condicion_salida: string | null;
  observaciones_admin: string | null;
  aprobado_por: string | null;
}

export async function getReservacionesFromDB(filterByEmail?: string): Promise<ReservacionItem[]> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const query = filterByEmail
        ? 'SELECT * FROM reservaciones WHERE LOWER(usuario_email) = LOWER($1) ORDER BY created_at DESC'
        : 'SELECT * FROM reservaciones ORDER BY created_at DESC';
      const params = filterByEmail ? [filterByEmail] : [];
      const { rows } = await pool.query<ReservacionRow>(query, params);
      return rows.map((r) => ({
        id: String(r.id),
        folio: r.folio || String(r.id),
        categoriaId: r.categoria_id || 'realidad-virtual',
        equipoId: r.equipo_id || undefined,
        codigoPlaiAsignado: r.codigo_plai_asignado || undefined,
        usuarioId: r.usuario_id || undefined,
        usuarioNombre: r.usuario_nombre,
        usuarioEmail: r.usuario_email,
        usuarioTelefono: r.usuario_telefono || undefined,
        usuarioInstitucion: r.usuario_institucion || undefined,
        fechaUso:
          r.fecha_uso instanceof Date
            ? r.fecha_uso.toISOString().split('T')[0]
            : String(r.fecha_uso).split('T')[0],
        horaInicio: String(r.hora_inicio || '10:00').substring(0, 5),
        horaFin: String(r.hora_fin || '12:00').substring(0, 5),
        actividad: r.actividad,
        estado: r.estado || 'Pendiente',
        accesoriosIncluidos: r.accesorios_incluidos || undefined,
        condicionSalida: r.condicion_salida || 'Excelente',
        observacionesAdmin: r.observaciones_admin || undefined,
        aprobadoPor: r.aprobado_por || undefined,
      }));
    } catch (error) {
      logger.error('Error al consultar reservaciones en PostgreSQL', { error: String(error) });
    }
  }

  const list = getMemoryStore().reservaciones;
  if (filterByEmail) {
    const norm = filterByEmail.toLowerCase().trim();
    return list.filter((r) => r.usuarioEmail?.toLowerCase().trim() === norm);
  }
  return list;
}

export async function insertReservacionInDB(item: ReservacionItem): Promise<boolean> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      await pool.query(
        `
        INSERT INTO reservaciones (
          id, folio, categoria_id, equipo_id, codigo_plai_asignado,
          usuario_id, usuario_nombre, usuario_email, usuario_telefono, usuario_institucion,
          fecha_uso, hora_inicio, hora_fin, actividad, estado,
          accesorios_incluidos, condicion_salida, observaciones_admin
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          estado = EXCLUDED.estado,
          equipo_id = EXCLUDED.equipo_id,
          codigo_plai_asignado = EXCLUDED.codigo_plai_asignado,
          updated_at = NOW()
        `,
        [
          item.id,
          item.folio || item.id,
          item.categoriaId || 'realidad-virtual',
          item.equipoId || null,
          item.codigoPlaiAsignado || null,
          item.usuarioId || null,
          item.usuarioNombre,
          item.usuarioEmail,
          item.usuarioTelefono || null,
          item.usuarioInstitucion || 'Comunidad PLAi',
          item.fechaUso,
          item.horaInicio,
          item.horaFin,
          item.actividad,
          item.estado || 'Pendiente',
          item.accesoriosIncluidos || null,
          item.condicionSalida || 'Excelente',
          item.observacionesAdmin || null,
        ]
      );
      return true;
    } catch (error) {
      logger.error('Error al guardar reservación en PostgreSQL', { error: String(error) });
      throw error;
    }
  }

  const store = getMemoryStore();
  const idx = store.reservaciones.findIndex((r) => r.id === item.id);
  if (idx >= 0) store.reservaciones[idx] = item;
  else store.reservaciones.unshift(item);
  return true;
}

export async function updateReservacionInDB(
  id: string,
  update: Partial<ReservacionItem>
): Promise<boolean> {
  if (env.hasDatabaseConfig) {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query<{ equipo_id: string | null; codigo_plai_asignado: string | null }>(
        `
        UPDATE reservaciones SET
          estado = COALESCE($1, estado),
          equipo_id = COALESCE($2, equipo_id),
          codigo_plai_asignado = COALESCE($3, codigo_plai_asignado),
          accesorios_incluidos = COALESCE($4, accesorios_incluidos),
          condicion_salida = COALESCE($5, condicion_salida),
          observaciones_admin = COALESCE($6, observaciones_admin),
          aprobado_por = COALESCE($7, aprobado_por),
          usuario_nombre = COALESCE($8, usuario_nombre),
          fecha_uso = COALESCE($9, fecha_uso),
          hora_inicio = COALESCE($10, hora_inicio),
          hora_fin = COALESCE($11, hora_fin),
          actividad = COALESCE($12, actividad),
          updated_at = NOW()
        WHERE id = $13
        RETURNING equipo_id, codigo_plai_asignado
        `,
        [
          update.estado || null,
          update.equipoId || null,
          update.codigoPlaiAsignado || null,
          update.accesoriosIncluidos ?? null,
          update.condicionSalida || null,
          update.observacionesAdmin ?? null,
          update.aprobadoPor || null,
          update.usuarioNombre || null,
          update.fechaUso || null,
          update.horaInicio || null,
          update.horaFin || null,
          update.actividad || null,
          id,
        ]
      );

      const targetEquipoId = update.equipoId || rows[0]?.equipo_id;
      const targetCodigo = update.codigoPlaiAsignado || rows[0]?.codigo_plai_asignado;
      if (update.estado && (targetEquipoId || targetCodigo)) {
        let newDeviceStatus: DeviceItem['status'] | null = null;
        if (update.estado === 'Aprobada') newDeviceStatus = 'Reservado';
        else if (update.estado === 'En uso') newDeviceStatus = 'En uso';
        else if (update.estado === 'Completada' || update.estado === 'Rechazada') {
          newDeviceStatus = 'Disponible';
        }
        if (newDeviceStatus) {
          await client.query(
            `UPDATE equipos SET estado = $1, updated_at = NOW()
             WHERE ($2::text IS NOT NULL AND id = $2) OR ($3::text IS NOT NULL AND LOWER(codigo_plai) = LOWER($3))`,
            [newDeviceStatus, targetEquipoId || null, targetCodigo || null]
          );
        }
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error al actualizar reservación en PostgreSQL', { error: String(error) });
      throw error;
    } finally {
      client.release();
    }
  }

  const store = getMemoryStore();
  const item = store.reservaciones.find((r) => r.id === id);
  if (item) Object.assign(item, update);
  return true;
}

// ====================================================================
// 5. INCIDENCIAS DE MANTENIMIENTO
// ====================================================================
export interface IncidenciaItem {
  id: string;
  folio: string;
  equipoId: string;
  codigoPlai: string;
  equipoNombre: string;
  origen: 'Devolución de Préstamo' | 'Revisión Periódica' | 'Reporte de Usuario' | 'Falla Operativa';
  tipoFalla: 'Hardware' | 'Software' | 'Calibración' | 'Daño Físico' | 'Accesorio Faltante' | 'Limpieza y Óptica';
  severidad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  descripcion: string;
  estado: 'Reportada' | 'En diagnóstico' | 'En reparación' | 'Esperando piezas' | 'Resuelta';
  tecnicoResponsable: string;
  fechaReporte: string;
  fechaResolucion?: string;
  accionesRealizadas?: string;
  createdAt?: string;
}

interface IncidenciaRow {
  id: string;
  folio: string;
  equipo_id: string;
  codigo_plai: string;
  equipo_nombre: string;
  origen: IncidenciaItem['origen'];
  tipo_falla: IncidenciaItem['tipoFalla'];
  severidad: IncidenciaItem['severidad'];
  descripcion: string;
  estado: IncidenciaItem['estado'];
  tecnico_responsable: string;
  fecha_reporte: string | Date;
  fecha_resolucion: string | Date | null;
  acciones_realizadas: string | null;
}

export async function getIncidenciasFromDB(): Promise<IncidenciaItem[]> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const { rows } = await pool.query<IncidenciaRow>(
        'SELECT * FROM incidencias_mantenimiento ORDER BY fecha_reporte DESC'
      );
      return rows.map((r) => ({
        id: String(r.id),
        folio: r.folio,
        equipoId: r.equipo_id,
        codigoPlai: r.codigo_plai,
        equipoNombre: r.equipo_nombre,
        origen: r.origen,
        tipoFalla: r.tipo_falla,
        severidad: r.severidad,
        descripcion: r.descripcion,
        estado: r.estado,
        tecnicoResponsable: r.tecnico_responsable,
        fechaReporte: formatTimestamp(r.fecha_reporte),
        fechaResolucion: r.fecha_resolucion ? formatTimestamp(r.fecha_resolucion) : undefined,
        accionesRealizadas: r.acciones_realizadas || undefined,
      }));
    } catch (error) {
      logger.error('Error al consultar incidencias en PostgreSQL', { error: String(error) });
    }
  }
  return getMemoryStore().incidencias;
}

export async function insertIncidenciaInDB(incidencia: IncidenciaItem): Promise<boolean> {
  if (env.hasDatabaseConfig) {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `
        INSERT INTO incidencias_mantenimiento (
          id, folio, equipo_id, codigo_plai, equipo_nombre, origen,
          tipo_falla, severidad, descripcion, estado, tecnico_responsable,
          fecha_reporte, acciones_realizadas
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          incidencia.id,
          incidencia.folio,
          incidencia.equipoId,
          incidencia.codigoPlai,
          incidencia.equipoNombre,
          incidencia.origen,
          incidencia.tipoFalla,
          incidencia.severidad,
          incidencia.descripcion,
          incidencia.estado,
          incidencia.tecnicoResponsable,
          incidencia.fechaReporte,
          incidencia.accionesRealizadas || null,
        ]
      );
      await client.query(
        `UPDATE equipos SET estado = 'En mantenimiento', updated_at = NOW() WHERE codigo_plai = $1 OR id = $2`,
        [incidencia.codigoPlai, incidencia.equipoId]
      );
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error al registrar incidencia en PostgreSQL', { error: String(error) });
      throw error;
    } finally {
      client.release();
    }
  }

  const store = getMemoryStore();
  store.incidencias.unshift(incidencia);
  return true;
}

export async function updateIncidenciaStatusInDB(
  id: string,
  estado: IncidenciaItem['estado'],
  accionesRealizadas?: string
): Promise<boolean> {
  if (env.hasDatabaseConfig) {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const fechaResolucion =
        estado === 'Resuelta' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;
      const { rows } = await client.query<{ codigo_plai: string; equipo_id: string }>(
        `
        UPDATE incidencias_mantenimiento SET
          estado = $1,
          fecha_resolucion = COALESCE($2, fecha_resolucion),
          acciones_realizadas = COALESCE($3, acciones_realizadas),
          updated_at = NOW()
        WHERE id = $4
        RETURNING codigo_plai, equipo_id
        `,
        [estado, fechaResolucion, accionesRealizadas || null, id]
      );
      if (rows[0]) {
        const nuevoEstado = estado === 'Resuelta' ? 'Disponible' : 'En mantenimiento';
        await client.query(
          'UPDATE equipos SET estado = $1, updated_at = NOW() WHERE codigo_plai = $2 OR id = $3',
          [nuevoEstado, rows[0].codigo_plai, rows[0].equipo_id]
        );
      }
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error al actualizar incidencia en PostgreSQL', { error: String(error) });
      throw error;
    } finally {
      client.release();
    }
  }

  const store = getMemoryStore();
  const inc = store.incidencias.find((i) => i.id === id);
  if (inc) {
    inc.estado = estado;
    if (accionesRealizadas) inc.accionesRealizadas = accionesRealizadas;
  }
  return true;
}

// ====================================================================
// 6. USUARIOS INSTITUCIONALES (CON HASH CRIPTOGRÁFICO DE CONTRASEÑAS)
// ====================================================================
export interface UsuarioItem {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Colaborador' | 'Usuario Final';
  status: 'Activo' | 'Inactivo';
  dependencia?: string;
  telefono?: string;
  lastLogin: string;
  reservations: number;
}

export interface UsuarioAuthRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'colaborador' | 'usuario';
  status: 'Activo' | 'Inactivo' | 'Suspendido';
}

interface UsuarioRecord extends UsuarioItem {
  passwordHash: string;
}

interface UsuarioRow {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: 'admin' | 'colaborador' | 'usuario';
  estado: 'Activo' | 'Inactivo' | 'Suspendido';
  telefono: string | null;
  dependencia: string | null;
  ultimo_login: string | Date | null;
  created_at: string | Date | null;
}

function mapDbRoleToLabel(rol: string): UsuarioItem['role'] {
  if (rol === 'admin') return 'Administrador';
  if (rol === 'colaborador') return 'Colaborador';
  return 'Usuario Final';
}

function mapLabelToDbRole(role: UsuarioItem['role']): 'admin' | 'colaborador' | 'usuario' {
  if (role === 'Administrador') return 'admin';
  if (role === 'Colaborador') return 'colaborador';
  return 'usuario';
}

export async function getUsuarioByEmailForAuth(email: string): Promise<UsuarioAuthRecord | null> {
  const normalized = email.trim().toLowerCase();
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const { rows } = await pool.query<UsuarioRow>(
        'SELECT id, nombre, email, password_hash, rol, estado FROM usuarios WHERE LOWER(email) = $1 LIMIT 1',
        [normalized]
      );
      if (!rows[0]) return null;
      return {
        id: rows[0].id,
        name: rows[0].nombre,
        email: rows[0].email,
        passwordHash: rows[0].password_hash,
        role: rows[0].rol,
        status: rows[0].estado,
      };
    } catch (error) {
      logger.error('Error al consultar usuario para autenticación en PostgreSQL', { error: String(error) });
      return null;
    }
  }

  const found = getMemoryStore().usuarios.find((u) => u.email.toLowerCase() === normalized);
  if (!found) return null;
  return {
    id: found.id,
    name: found.name,
    email: found.email,
    passwordHash: found.passwordHash,
    role: mapLabelToDbRole(found.role),
    status: found.status,
  };
}

export async function updateUsuarioLastLogin(userId: string): Promise<void> {
  if (!env.hasDatabaseConfig) return;
  try {
    const pool = getPool();
    await pool.query('UPDATE usuarios SET ultimo_login = NOW(), updated_at = NOW() WHERE id = $1', [
      userId,
    ]);
  } catch (error) {
    logger.warn('No se pudo actualizar último acceso del usuario', { userId, error: String(error) });
  }
}

export async function getUsuariosFromDB(): Promise<UsuarioItem[]> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const { rows } = await pool.query<UsuarioRow & { total_reservas: string }>(`
        SELECT
          u.id, u.nombre, u.email, u.rol, u.estado, u.telefono, u.dependencia, u.ultimo_login, u.created_at,
          (
            SELECT COUNT(*) FROM reservaciones r WHERE LOWER(r.usuario_email) = LOWER(u.email)
          ) AS total_reservas
        FROM usuarios u
        ORDER BY u.created_at DESC, u.nombre ASC
      `);
      return rows.map((r) => ({
        id: r.id,
        name: r.nombre,
        email: r.email,
        role: mapDbRoleToLabel(r.rol),
        status: r.estado === 'Activo' ? 'Activo' : 'Inactivo',
        dependencia: r.dependencia || 'Comunidad PLAi',
        telefono: r.telefono || undefined,
        lastLogin: r.ultimo_login
          ? formatTimestamp(r.ultimo_login).split(' ')[0]
          : r.created_at
          ? formatTimestamp(r.created_at).split(' ')[0]
          : 'Sin registro',
        reservations: Number(r.total_reservas || 0),
      }));
    } catch (error) {
      logger.error('Error al consultar usuarios en PostgreSQL', { error: String(error) });
    }
  }

  return getMemoryStore().usuarios.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    dependencia: u.dependencia,
    telefono: u.telefono,
    lastLogin: u.lastLogin,
    reservations: u.reservations,
  }));
}

export async function upsertUsuarioInDB(
  user: UsuarioItem & { password?: string }
): Promise<UsuarioItem> {
  const dbRol = mapLabelToDbRole(user.role);
  const hashed = user.password && user.password.trim().length > 0 ? hashPassword(user.password.trim()) : null;

  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      if (hashed) {
        await pool.query(
          `
          INSERT INTO usuarios (id, nombre, email, password_hash, rol, estado, telefono, dependencia)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            nombre = EXCLUDED.nombre,
            email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            rol = EXCLUDED.rol,
            estado = EXCLUDED.estado,
            telefono = EXCLUDED.telefono,
            dependencia = EXCLUDED.dependencia,
            updated_at = NOW()
          `,
          [
            user.id,
            user.name,
            user.email.toLowerCase(),
            hashed,
            dbRol,
            user.status,
            user.telefono || null,
            user.dependencia || 'Comunidad PLAi',
          ]
        );
      } else {
        // Actualización sin modificar password_hash existente
        const updated = await pool.query(
          `
          UPDATE usuarios SET
            nombre = $1,
            email = $2,
            rol = $3,
            estado = $4,
            telefono = $5,
            dependencia = $6,
            updated_at = NOW()
          WHERE id = $7
          `,
          [
            user.name,
            user.email.toLowerCase(),
            dbRol,
            user.status,
            user.telefono || null,
            user.dependencia || 'Comunidad PLAi',
            user.id,
          ]
        );
        if ((updated.rowCount ?? 0) === 0) {
          throw new Error('Se requiere una contraseña para registrar un nuevo usuario.');
        }
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email.toLowerCase(),
        role: user.role,
        status: user.status,
        dependencia: user.dependencia,
        telefono: user.telefono,
        lastLogin: user.lastLogin,
        reservations: user.reservations,
      };
    } catch (error) {
      logger.error('Error al guardar usuario en PostgreSQL', { error: String(error) });
      throw error;
    }
  }

  const store = getMemoryStore();
  const idx = store.usuarios.findIndex(
    (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
  );
  if (idx >= 0) {
    store.usuarios[idx] = {
      ...store.usuarios[idx],
      ...user,
      passwordHash: hashed || store.usuarios[idx].passwordHash,
    };
  } else {
    if (!hashed) {
      throw new Error('Se requiere una contraseña para registrar un nuevo usuario.');
    }
    store.usuarios.push({
      ...user,
      passwordHash: hashed,
    });
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email.toLowerCase(),
    role: user.role,
    status: user.status,
    dependencia: user.dependencia,
    telefono: user.telefono,
    lastLogin: user.lastLogin,
    reservations: user.reservations,
  };
}

// ====================================================================
// 7. AGENDA DE CURSOS Y TALLERES
// ====================================================================
export interface CursoAgendaItem {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  hora: string;
  lugar: string;
  asistentes: number;
  estado: 'Confirmado' | 'En revisión' | 'Finalizado';
  icon: string;
  instructor: string;
  descripcion: string;
  solicitanteNombre?: string;
  solicitanteEmail?: string;
  institucion?: string;
}

interface CursoRow {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string | Date;
  hora: string;
  lugar: string;
  asistentes: number;
  estado: CursoAgendaItem['estado'];
  icon: string;
  instructor: string;
  descripcion: string;
  solicitante_nombre: string | null;
  solicitante_email: string | null;
  institucion: string | null;
}

export async function getCursosFromDB(): Promise<CursoAgendaItem[]> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const { rows } = await pool.query<CursoRow>(
        'SELECT * FROM cursos_agenda ORDER BY fecha ASC, created_at DESC'
      );
      return rows.map((r) => ({
        id: r.id,
        titulo: r.titulo,
        tipo: r.tipo,
        fecha:
          r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : String(r.fecha).split('T')[0],
        hora: r.hora,
        lugar: r.lugar,
        asistentes: Number(r.asistentes || 1),
        estado: r.estado,
        icon: r.icon || '🎓',
        instructor: r.instructor,
        descripcion: r.descripcion,
        solicitanteNombre: r.solicitante_nombre || undefined,
        solicitanteEmail: r.solicitante_email || undefined,
        institucion: r.institucion || undefined,
      }));
    } catch (error) {
      logger.error('Error al consultar cursos en PostgreSQL', { error: String(error) });
    }
  }
  return getMemoryStore().cursos;
}

export async function insertCursoInDB(curso: CursoAgendaItem): Promise<CursoAgendaItem> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      await pool.query(
        `
        INSERT INTO cursos_agenda (
          id, titulo, tipo, fecha, hora, lugar, asistentes, estado, icon,
          instructor, descripcion, solicitante_nombre, solicitante_email, institucion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          curso.id,
          curso.titulo,
          curso.tipo,
          curso.fecha,
          curso.hora,
          curso.lugar,
          curso.asistentes,
          curso.estado,
          curso.icon,
          curso.instructor,
          curso.descripcion,
          curso.solicitanteNombre || null,
          curso.solicitanteEmail || null,
          curso.institucion || null,
        ]
      );
    } catch (error) {
      logger.error('Error al guardar curso en PostgreSQL', { error: String(error) });
      throw error;
    }
  } else {
    getMemoryStore().cursos.unshift(curso);
  }

  // Vincular solicitud de curso/visita en reservaciones para aprobación administrativa
  await insertReservacionInDB({
    id: `res-${Date.now()}`,
    folio: curso.id,
    categoriaId: curso.titulo.toLowerCase().includes('rob')
      ? 'robotica'
      : curso.titulo.toLowerCase().includes('impres')
      ? 'fabricacion-digital'
      : 'realidad-virtual',
    usuarioNombre: curso.solicitanteNombre || 'Solicitante Institucional',
    usuarioEmail: curso.solicitanteEmail || '',
    usuarioInstitucion: curso.institucion || curso.tipo,
    fechaUso: curso.fecha,
    horaInicio: '10:00',
    horaFin: '12:00',
    actividad: `[CURSO / VISITA] ${curso.titulo} (${curso.asistentes} asistentes) — ${curso.descripcion}`,
    estado: 'Pendiente',
    observacionesAdmin: `Solicitud de curso/visita para ${curso.institucion || 'institución'} (${curso.asistentes} participantes).`,
  });

  return curso;
}

// ====================================================================
// 8. CONFIGURACIÓN GENERAL DEL SISTEMA
// ====================================================================
export interface SystemConfig {
  labName: string;
  labLocation: string;
  adminEmail: string;
  maintenanceAlertDays: number;
  allowPublicView: boolean;
  requireApproval: boolean;
  maxReservationHours: number;
  maxAdvanceDays: number;
  categorias: string[];
}

const initialSystemConfig: SystemConfig = {
  labName: 'PLAi — Laboratorio de Innovación, Robótica y Tecnologías Inmersivas',
  labLocation: 'Torre C, Ciudad Creativa Digital, Guadalajara, Jalisco',
  adminEmail: 'plai.ayuda@plai.mx',
  maintenanceAlertDays: 30,
  allowPublicView: true,
  requireApproval: true,
  maxReservationHours: 2,
  maxAdvanceDays: 14,
  categorias: [
    'Realidad Virtual',
    'Robótica',
    'Fabricación Digital',
    'Drones',
    'Cómputo',
  ],
};

export async function getSystemConfigFromDB(): Promise<SystemConfig> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      const { rows } = await pool.query<{ valor: SystemConfig }>(
        `SELECT valor FROM configuracion_sistema WHERE clave = 'general' LIMIT 1`
      );
      if (rows[0]?.valor) {
        return { ...initialSystemConfig, ...rows[0].valor };
      }
    } catch (error) {
      logger.error('Error al consultar configuración en PostgreSQL', { error: String(error) });
    }
  }
  return getMemoryStore().config;
}

export async function saveSystemConfigInDB(cfg: SystemConfig): Promise<SystemConfig> {
  if (env.hasDatabaseConfig) {
    try {
      const pool = getPool();
      await pool.query(
        `
        INSERT INTO configuracion_sistema (clave, valor, updated_at)
        VALUES ('general', $1::jsonb, NOW())
        ON CONFLICT (clave) DO UPDATE SET
          valor = EXCLUDED.valor,
          updated_at = NOW()
        `,
        [JSON.stringify(cfg)]
      );
      return cfg;
    } catch (error) {
      logger.error('Error al guardar configuración en PostgreSQL', { error: String(error) });
      throw error;
    }
  }

  getMemoryStore().config = cfg;
  return cfg;
}
