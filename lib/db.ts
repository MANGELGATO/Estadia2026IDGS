import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { env } from './env';
import { DeviceItem, mockDevices, AppItem, mockApps } from './mockData';
export type { DeviceItem };
import { logger } from './logger';

// Pool singleton para reutilizar conexiones en Next.js
declare global {
  var __mysqlPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!global.__mysqlPool) {
    global.__mysqlPool = mysql.createPool({
      host: env.dbHost,
      port: env.dbPort,
      user: env.dbUser,
      password: env.dbPassword,
      database: env.dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      charset: 'utf8mb4',
    });
  }
  return global.__mysqlPool;
}

// Rutas de respaldo persistente en el servidor
const DATA_DIR = path.join(process.cwd(), 'data');
function ensureDataFile<T>(filename: string, initialData: T): T {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.warn(`Error al acceder al archivo de persistencia ${filename}, usando datos iniciales`, { error });
    return initialData;
  }
}

function writeDataFile<T>(filename: string, data: T): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    logger.error(`Error al persistir ${filename}`, { error });
  }
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

// ====================================================================
// 1. EQUIPOS
// ====================================================================
export interface EquipoRow extends RowDataPacket {
  id: string;
  categoria_id: string;
  categoria_nombre?: string;
  categoria_slug?: string;
  nombre: string;
  marca: string;
  modelo: string;
  almacenamiento?: string;
  numero_serie: string;
  codigo_plai: string;
  estado: DeviceItem['status'];
  ubicacion: string;
  especificaciones: string | string[] | null;
  accesorios: string | string[] | null;
  imagen_emoji: string | null;
  imagen_url?: string | null;
  responsable: string | null;
  observaciones: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export function mapRowToDeviceItem(row: EquipoRow): DeviceItem {
  let specs: string[] = [];
  if (Array.isArray(row.especificaciones)) {
    specs = row.especificaciones;
  } else if (typeof row.especificaciones === 'string') {
    try {
      const parsed = JSON.parse(row.especificaciones);
      specs = Array.isArray(parsed) ? parsed : [row.especificaciones];
    } catch {
      specs = [row.especificaciones];
    }
  }

  let accessories: string[] = [];
  if (Array.isArray(row.accesorios)) {
    accessories = row.accesorios;
  } else if (typeof row.accesorios === 'string') {
    try {
      const parsed = JSON.parse(row.accesorios);
      accessories = Array.isArray(parsed) ? parsed : [row.accesorios];
    } catch {
      accessories = [row.accesorios];
    }
  }

  const category = CATEGORY_MAP[row.categoria_id] || (row.categoria_nombre as DeviceItem['category']) || 'Realidad Virtual';

  let dateAdded: string | undefined;
  if (row.created_at) {
    const d = new Date(row.created_at);
    if (!isNaN(d.getTime())) {
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
    specs: specs.length > 0 ? specs : ['Sin especificaciones registradas'],
    accessories: accessories.length > 0 ? accessories : ['Equipo estándar'],
    imageEmoji: row.imagen_emoji || '📦',
    imageUrl: row.imagen_url || undefined,
    responsible: row.responsable || 'Laboratorio de Innovación PLAi',
    observations: row.observaciones || undefined,
    dateAdded,
  };
}

export async function getEquiposFromDB(): Promise<DeviceItem[]> {
  try {
    const pool = getPool();
    const [rows] = await pool.query<EquipoRow[]>(`
      SELECT e.*, c.nombre AS categoria_nombre, c.id AS categoria_slug 
      FROM equipos e
      LEFT JOIN categorias c ON e.categoria_id = c.id
      ORDER BY e.created_at DESC
    `);

    if (rows && rows.length > 0) {
      return rows.map(mapRowToDeviceItem);
    }
  } catch (error) {
    logger.warn('MySQL no disponible para equipos, usando almacenamiento centralizado', { error: String(error) });
  }

  return ensureDataFile<DeviceItem[]>('equipos.json', mockDevices);
}

export async function insertEquipoInDB(item: DeviceItem): Promise<boolean> {
  const categoriaId = CATEGORY_TO_ID_MAP[item.category] || 'realidad-virtual';

  try {
    const pool = getPool();
    const query = `
      INSERT INTO equipos (
        id, categoria_id, nombre, marca, modelo, almacenamiento, 
        numero_serie, codigo_plai, estado, ubicacion, especificaciones, 
        accesorios, imagen_emoji, imagen_url, responsable, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        categoria_id = VALUES(categoria_id),
        nombre = VALUES(nombre),
        marca = VALUES(marca),
        modelo = VALUES(modelo),
        almacenamiento = VALUES(almacenamiento),
        estado = VALUES(estado),
        ubicacion = VALUES(ubicacion),
        especificaciones = VALUES(especificaciones),
        accesorios = VALUES(accesorios),
        imagen_emoji = VALUES(imagen_emoji),
        imagen_url = VALUES(imagen_url),
        responsable = VALUES(responsable),
        observaciones = VALUES(observaciones)
    `;

    const values = [
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
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, values);
    if (result.affectedRows > 0) {
      // Sincronizar archivo local
      const items = ensureDataFile<DeviceItem[]>('equipos.json', mockDevices);
      const idx = items.findIndex(e => e.id === item.id || e.inventoryNumber === item.inventoryNumber);
      if (idx >= 0) items[idx] = item;
      else items.unshift(item);
      writeDataFile('equipos.json', items);
      return true;
    }
  } catch (error) {
    logger.warn('Error al persistir en MySQL equipos, guardando en respaldo local', { error: String(error) });
  }

  // Respaldo en servidor
  const items = ensureDataFile<DeviceItem[]>('equipos.json', mockDevices);
  const idx = items.findIndex(e => e.id === item.id || e.inventoryNumber === item.inventoryNumber);
  if (idx >= 0) items[idx] = item;
  else items.unshift(item);
  writeDataFile('equipos.json', items);
  return true;
}

export async function deleteEquipoInDB(id: string): Promise<boolean> {
  try {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM equipos WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      const items = ensureDataFile<DeviceItem[]>('equipos.json', mockDevices).filter(e => e.id !== id);
      writeDataFile('equipos.json', items);
      return true;
    }
  } catch (error) {
    logger.warn('Error al eliminar en MySQL equipos', { error: String(error) });
  }

  const items = ensureDataFile<DeviceItem[]>('equipos.json', mockDevices).filter(e => e.id !== id);
  writeDataFile('equipos.json', items);
  return true;
}

export async function getEquipoByCodigoPLAi(codigo: string): Promise<DeviceItem | null> {
  const all = await getEquiposFromDB();
  const normalized = codigo.trim().toLowerCase();
  return all.find(e => e.inventoryNumber.toLowerCase() === normalized) || null;
}

// ====================================================================
// 2. APLICACIONES VR / PC
// ====================================================================
export async function getAplicacionesFromDB(): Promise<AppItem[]> {
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM aplicaciones ORDER BY created_at DESC');
    if (rows && rows.length > 0) {
      return rows.map(r => ({
        id: String(r.id),
        name: r.nombre,
        developer: r.desarrollador,
        version: r.version,
        category: r.categoria,
        platform: r.plataforma,
        ageRating: r.clasificacion_edad,
        description: r.descripcion,
        imageUrl: r.imagen_url || undefined,
        iconUrl: r.imagen_url || undefined,
        devicesInstalled: Number(r.equipos_instalados || 1),
        status: r.estado,
      }));
    }
  } catch (error) {
    logger.warn('MySQL no disponible para aplicaciones, usando respaldo local', { error: String(error) });
  }

  return ensureDataFile<AppItem[]>('aplicaciones.json', mockApps);
}

export async function insertAplicacionInDB(app: AppItem): Promise<boolean> {
  try {
    const pool = getPool();
    const query = `
      INSERT INTO aplicaciones (
        id, nombre, desarrollador, version, categoria, plataforma,
        clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        nombre = VALUES(nombre),
        desarrollador = VALUES(desarrollador),
        version = VALUES(version),
        categoria = VALUES(categoria),
        plataforma = VALUES(plataforma),
        clasificacion_edad = VALUES(clasificacion_edad),
        descripcion = VALUES(descripcion),
        imagen_url = VALUES(imagen_url),
        equipos_instalados = VALUES(equipos_instalados),
        estado = VALUES(estado)
    `;

    const values = [
      app.id,
      app.name,
      app.developer,
      app.version || '1.0',
      app.category,
      app.platform,
      app.ageRating || 'Todas las edades',
      app.description,
      app.imageUrl || null,
      app.devicesInstalled || 1,
      app.status || 'Activa',
    ];

    await pool.execute(query, values);
  } catch (error) {
    logger.warn('Error al guardar aplicación en MySQL', { error: String(error) });
  }

  const apps = ensureDataFile<AppItem[]>('aplicaciones.json', mockApps);
  const idx = apps.findIndex(a => a.id === app.id);
  if (idx >= 0) apps[idx] = app;
  else apps.unshift(app);
  writeDataFile('aplicaciones.json', apps);
  return true;
}

export async function deleteAplicacionInDB(id: string): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.execute('DELETE FROM aplicaciones WHERE id = ?', [id]);
  } catch (error) {
    logger.warn('Error al eliminar aplicación en MySQL', { error: String(error) });
  }

  const apps = ensureDataFile<AppItem[]>('aplicaciones.json', mockApps).filter(a => a.id !== id);
  writeDataFile('aplicaciones.json', apps);
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

const initialBitacora: BitacoraItem[] = [
  {
    id: 'bit-001',
    equipoId: 'eq-vr-001',
    codigoPlai: 'PLAI-VR-001',
    equipoNombre: 'Meta Quest 3 512GB',
    usuarioNombre: 'Lic. Mariana Torres',
    usuarioEmail: 'mariana.torres@cudi.edu.mx',
    usuarioDependencia: 'Universidad de Guadalajara',
    fechaEntrega: '2026-10-10 09:30:00',
    fechaDevolucionEstimada: '2026-10-10 13:30:00',
    fechaDevolucionReal: '2026-10-10 13:15:00',
    estadoPrestamo: 'Devuelto',
    condicionEntrega: 'Excelente',
    condicionDevolucion: 'Excelente',
    accesoriosEntregados: '2 Controles Touch Plus, cargador original, cable USB-C',
    accesoriosDevueltos: 'Todos completos',
    observacionesEntrega: 'Préstamo para taller de arquitectura inmersiva',
    adminEntrega: 'Ing. Carlos Mendoza',
    adminRecibe: 'Ing. Carlos Mendoza',
  },
  {
    id: 'bit-002',
    equipoId: 'eq-dro-001',
    codigoPlai: 'PLAI-DR-001',
    equipoNombre: 'Dron DJI Mini 3 Pro con DJI RC',
    usuarioNombre: 'Arq. Sergio Velasco',
    usuarioEmail: 'svelasco@jalteca.mx',
    usuarioDependencia: 'Secretaría de Medio Ambiente Jalisco',
    fechaEntrega: '2026-10-12 10:00:00',
    fechaDevolucionEstimada: '2026-10-12 16:00:00',
    fechaDevolucionReal: '2026-10-12 15:45:00',
    estadoPrestamo: 'Devuelto',
    condicionEntrega: 'Excelente',
    condicionDevolucion: 'Bueno',
    accesoriosEntregados: 'Control DJI RC, 3 baterías, cargador múltiple, maletín',
    accesoriosDevueltos: 'Todos completos',
    observacionesEntrega: 'Mapeo fotogramétrico en Ciudad Creativa Digital',
    adminEntrega: 'Ing. Fernando Tapia',
    adminRecibe: 'Ing. Fernando Tapia',
  }
];

export async function getBitacoraFromDB(): Promise<BitacoraItem[]> {
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM bitacora_uso ORDER BY fecha_entrega DESC');
    if (rows && rows.length > 0) {
      return rows.map(r => ({
        id: String(r.id),
        equipoId: r.equipo_id,
        codigoPlai: r.codigo_plai,
        equipoNombre: r.equipo_nombre,
        usuarioNombre: r.usuario_nombre,
        usuarioEmail: r.usuario_email,
        usuarioDependencia: r.usuario_dependencia || undefined,
        fechaEntrega: String(r.fecha_entrega),
        fechaDevolucionEstimada: String(r.fecha_devolucion_estimada),
        fechaDevolucionReal: r.fecha_devolucion_real ? String(r.fecha_devolucion_real) : undefined,
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
    }
  } catch (error) {
    logger.warn('MySQL no disponible para bitácora, usando respaldo local', { error: String(error) });
  }

  return ensureDataFile<BitacoraItem[]>('bitacora.json', initialBitacora);
}

export async function insertBitacoraEntregaInDB(item: BitacoraItem): Promise<boolean> {
  try {
    const pool = getPool();
    const query = `
      INSERT INTO bitacora_uso (
        id, equipo_id, codigo_plai, equipo_nombre, usuario_nombre,
        usuario_email, usuario_dependencia, fecha_entrega, fecha_devolucion_estimada,
        estado_prestamo, condicion_entrega, accesorios_entregados, observaciones_entrega,
        admin_entrega
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
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
    ];

    await pool.execute(query, values);
    // Actualizar estado del equipo a "En uso"
    await pool.execute('UPDATE equipos SET estado = "En uso" WHERE codigo_plai = ?', [item.codigoPlai]);
  } catch (error) {
    logger.warn('Error al guardar bitácora en MySQL', { error: String(error) });
  }

  const log = ensureDataFile<BitacoraItem[]>('bitacora.json', initialBitacora);
  log.unshift(item);
  writeDataFile('bitacora.json', log);

  // Actualizar también estado de equipo en respaldo
  const equipos = ensureDataFile<DeviceItem[]>('equipos.json', mockDevices);
  const eq = equipos.find(e => e.inventoryNumber === item.codigoPlai);
  if (eq) {
    eq.status = 'En uso';
    writeDataFile('equipos.json', equipos);
  }

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
  try {
    const pool = getPool();
    const estadoPrestamo = devolucion.incidenciaGenerada ? 'Con Incidencia' : 'Devuelto';
    await pool.execute(`
      UPDATE bitacora_uso SET
        fecha_devolucion_real = ?,
        condicion_devolucion = ?,
        accesorios_devueltos = ?,
        observaciones_devolucion = ?,
        incidencia_generada = ?,
        estado_prestamo = ?,
        admin_recibe = ?
      WHERE id = ?
    `, [
      devolucion.fechaDevolucionReal,
      devolucion.condicionDevolucion || null,
      devolucion.accesoriosDevueltos,
      devolucion.observacionesDevolucion || null,
      devolucion.incidenciaGenerada ? 1 : 0,
      estadoPrestamo,
      devolucion.adminRecibe,
      id
    ]);

    // Consultar código del equipo para restaurar su estado
    const [rows] = await pool.query<RowDataPacket[]>('SELECT codigo_plai FROM bitacora_uso WHERE id = ?', [id]);
    if (rows && rows[0]) {
      const nuevoEstado = devolucion.incidenciaGenerada ? 'En mantenimiento' : 'Disponible';
      await pool.execute('UPDATE equipos SET estado = ? WHERE codigo_plai = ?', [nuevoEstado, rows[0].codigo_plai]);
    }
  } catch (error) {
    logger.warn('Error al actualizar devolución en MySQL', { error: String(error) });
  }

  const log = ensureDataFile<BitacoraItem[]>('bitacora.json', initialBitacora);
  const item = log.find(b => b.id === id);
  if (item) {
    item.fechaDevolucionReal = devolucion.fechaDevolucionReal;
    item.condicionDevolucion = devolucion.condicionDevolucion;
    item.accesoriosDevueltos = devolucion.accesoriosDevueltos;
    item.observacionesDevolucion = devolucion.observacionesDevolucion;
    item.incidenciaGenerada = devolucion.incidenciaGenerada;
    item.estadoPrestamo = devolucion.incidenciaGenerada ? 'Con Incidencia' : 'Devuelto';
    item.adminRecibe = devolucion.adminRecibe;
    writeDataFile('bitacora.json', log);

    // Actualizar equipo
    const equipos = ensureDataFile<DeviceItem[]>('equipos.json', mockDevices);
    const eq = equipos.find(e => e.inventoryNumber === item.codigoPlai);
    if (eq) {
      eq.status = devolucion.incidenciaGenerada ? 'En mantenimiento' : 'Disponible';
      writeDataFile('equipos.json', equipos);
    }
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

const initialReservaciones: ReservacionItem[] = [
  {
    id: 'res-001',
    folio: 'RES-2026-001',
    categoriaId: 'realidad-virtual',
    equipoId: 'eq-vr-001',
    codigoPlaiAsignado: 'PLAI-VR-001',
    usuarioNombre: 'Ana García Rivera',
    usuarioEmail: 'ana.garcia@alumnos.udg.mx',
    usuarioTelefono: '33 1892 4401',
    usuarioInstitucion: 'Universidad de Guadalajara (CUAAD)',
    fechaUso: '2026-11-20',
    horaInicio: '10:00',
    horaFin: '12:30',
    actividad: 'Evaluación de proyecto de grado de arquitectura espacial.',
    estado: 'Aprobada',
    accesoriosIncluidos: 'Controles Touch Plus y cable Link Box',
    condicionSalida: 'Excelente',
    observacionesAdmin: 'Asignado equipo Meta Quest 3 #01',
  },
  {
    id: 'res-002',
    folio: 'RES-2026-002',
    categoriaId: 'fabricacion-digital',
    equipoId: 'eq-fab-001',
    codigoPlaiAsignado: 'PLAI-FD-001',
    usuarioNombre: 'Ing. Carlos Rivas',
    usuarioEmail: 'carlos.rivas@startupjalisco.com',
    usuarioTelefono: '33 2201 9944',
    usuarioInstitucion: 'Startup Hub CCD',
    fechaUso: '2026-11-21',
    horaInicio: '09:00',
    horaFin: '14:00',
    actividad: 'Impresión de carcasa para dispositivo IoT médico. Trae filamento PETG propio.',
    estado: 'Pendiente',
    accesoriosIncluidos: 'Placa texturizada PEI y boquilla 0.4mm',
    condicionSalida: 'Excelente',
    observacionesAdmin: 'Requiere revisión técnica de archivo STL previo',
  }
];

export async function getReservacionesFromDB(): Promise<ReservacionItem[]> {
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT r.*, 
             e.categoria_id AS equipo_categoria_id,
             e.nombre AS equipo_nombre,
             e.codigo_plai AS equipo_codigo_plai
      FROM reservaciones r
      LEFT JOIN equipos e ON (r.recurso_id = e.id)
      ORDER BY r.created_at DESC
    `);
    if (rows && rows.length > 0) {
      return rows.map(r => ({
        id: String(r.id),
        folio: r.folio || String(r.id),
        categoriaId: r.categoria_id || r.equipo_categoria_id || 'realidad-virtual',
        equipoId: r.equipo_id || r.recurso_id || undefined,
        codigoPlaiAsignado: r.codigo_plai_asignado || r.equipo_codigo_plai || undefined,
        usuarioNombre: r.usuario_nombre || r.nombre_solicitante || 'Usuario PLAi',
        usuarioEmail: r.usuario_email || r.email_solicitante || '',
        usuarioTelefono: r.usuario_telefono || undefined,
        usuarioInstitucion: r.usuario_institucion || undefined,
        fechaUso: String(r.fecha_uso || r.fecha || new Date().toISOString().split('T')[0]).split('T')[0],
        horaInicio: String(r.hora_inicio || '10:00:00').substring(0, 5),
        horaFin: String(r.hora_fin || '12:00:00').substring(0, 5),
        actividad: r.actividad || 'Uso de laboratorio',
        estado: r.estado || 'Pendiente',
        accesoriosIncluidos: r.accesorios_incluidos || undefined,
        condicionSalida: r.condicion_salida || undefined,
        observacionesAdmin: r.observaciones_admin || r.notas || undefined,
        aprobadoPor: r.aprobado_por || undefined,
      }));
    }
  } catch (error) {
    logger.warn('MySQL no disponible para reservaciones, usando respaldo local', { error: String(error) });
  }

  const localReservations = ensureDataFile<ReservacionItem[]>('reservaciones.json', initialReservaciones);
  return localReservations.map(r => ({
    ...r,
    categoriaId: r.categoriaId || 'realidad-virtual',
    folio: r.folio || r.id,
    fechaUso: r.fechaUso || new Date().toISOString().split('T')[0],
    horaInicio: r.horaInicio || '10:00',
    horaFin: r.horaFin || '12:00',
  }));
}

export async function updateReservacionInDB(
  id: string,
  update: Partial<ReservacionItem>
): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.execute(`
      UPDATE reservaciones SET
        estado = COALESCE(?, estado),
        equipo_id = COALESCE(?, equipo_id),
        codigo_plai_asignado = COALESCE(?, codigo_plai_asignado),
        accesorios_incluidos = COALESCE(?, accesorios_incluidos),
        condicion_salida = COALESCE(?, condicion_salida),
        observaciones_admin = COALESCE(?, observaciones_admin),
        aprobado_por = COALESCE(?, aprobado_por)
      WHERE id = ?
    `, [
      update.estado || null,
      update.equipoId || null,
      update.codigoPlaiAsignado || null,
      update.accesoriosIncluidos || null,
      update.condicionSalida || null,
      update.observacionesAdmin || null,
      update.aprobadoPor || null,
      id
    ]);
  } catch (error) {
    logger.warn('Error al actualizar reservación en MySQL', { error: String(error) });
  }

  const items = ensureDataFile<ReservacionItem[]>('reservaciones.json', initialReservaciones);
  const item = items.find(r => r.id === id);
  if (item) {
    Object.assign(item, update);
    writeDataFile('reservaciones.json', items);
  }
  return true;
}

export async function insertReservacionInDB(item: ReservacionItem): Promise<boolean> {
  try {
    const pool = getPool();
    const query = `
      INSERT INTO reservaciones (
        id, recurso_id, usuario_id, nombre_solicitante, email_solicitante,
        fecha, hora_inicio, hora_fin, actividad, notas, estado, acepto_privacidad
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE
        nombre_solicitante = VALUES(nombre_solicitante),
        email_solicitante = VALUES(email_solicitante),
        fecha = VALUES(fecha),
        hora_inicio = VALUES(hora_inicio),
        hora_fin = VALUES(hora_fin),
        actividad = VALUES(actividad),
        notas = VALUES(notas),
        estado = VALUES(estado)
    `;

    const values = [
      item.id || item.folio || `RES-${Date.now()}`,
      item.equipoId || 'vr-01',
      item.usuarioId || 'usr-standard-01',
      item.usuarioNombre || 'Usuario Institucional',
      item.usuarioEmail || 'user@plai.edu.mx',
      item.fechaUso || new Date().toISOString().split('T')[0],
      item.horaInicio || '10:00:00',
      item.horaFin || '12:00:00',
      item.actividad || 'Uso de laboratorio',
      item.observacionesAdmin || item.actividad || '',
      item.estado || 'Pendiente',
    ];

    await pool.execute(query, values);
  } catch (error) {
    logger.warn('Error al guardar reservación en MySQL', { error: String(error) });
  }

  const items = ensureDataFile<ReservacionItem[]>('reservaciones.json', initialReservaciones);
  const idx = items.findIndex(r => r.id === item.id);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.unshift(item);
  }
  writeDataFile('reservaciones.json', items);
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

const initialIncidencias: IncidenciaItem[] = [
  {
    id: 'inc-001',
    folio: 'INC-2026-001',
    equipoId: 'eq-vr-002',
    codigoPlai: 'PLAI-VR-002',
    equipoNombre: 'Meta Quest 3 128GB #02',
    origen: 'Devolución de Préstamo',
    tipoFalla: 'Calibración',
    severidad: 'Media',
    descripcion: 'Controlador derecho pierde tracking espacial intermitentemente al apuntar hacia abajo.',
    estado: 'En diagnóstico',
    tecnicoResponsable: 'Ing. Carlos Mendoza',
    fechaReporte: '2026-10-14 11:20:00',
    accionesRealizadas: 'Reinstalación de firmware y cambio de batería alcalina.',
  }
];

export async function getIncidenciasFromDB(): Promise<IncidenciaItem[]> {
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM incidencias_mantenimiento ORDER BY fecha_reporte DESC');
    if (rows && rows.length > 0) {
      return rows.map(r => ({
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
        fechaReporte: String(r.fecha_reporte),
        fechaResolucion: r.fecha_resolucion ? String(r.fecha_resolucion) : undefined,
        accionesRealizadas: r.acciones_realizadas || undefined,
      }));
    }
  } catch (error) {
    logger.warn('MySQL no disponible para incidencias, usando respaldo local', { error: String(error) });
  }

  return ensureDataFile<IncidenciaItem[]>('incidencias.json', initialIncidencias);
}

export async function insertIncidenciaInDB(incidencia: IncidenciaItem): Promise<boolean> {
  try {
    const pool = getPool();
    const query = `
      INSERT INTO incidencias_mantenimiento (
        id, folio, equipo_id, codigo_plai, equipo_nombre, origen,
        tipo_falla, severidad, descripcion, estado, tecnico_responsable,
        fecha_reporte, acciones_realizadas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
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
    ];

    await pool.execute(query, values);
    // Cambiar estado del equipo a "En mantenimiento"
    await pool.execute('UPDATE equipos SET estado = "En mantenimiento" WHERE codigo_plai = ?', [incidencia.codigoPlai]);
  } catch (error) {
    logger.warn('Error al guardar incidencia en MySQL', { error: String(error) });
  }

  const items = ensureDataFile<IncidenciaItem[]>('incidencias.json', initialIncidencias);
  items.unshift(incidencia);
  writeDataFile('incidencias.json', items);

  // Actualizar estado del equipo
  const equipos = ensureDataFile<DeviceItem[]>('equipos.json', mockDevices);
  const eq = equipos.find(e => e.inventoryNumber === incidencia.codigoPlai);
  if (eq) {
    eq.status = 'En mantenimiento';
    writeDataFile('equipos.json', equipos);
  }

  return true;
}

export async function updateIncidenciaStatusInDB(
  id: string,
  estado: IncidenciaItem['estado'],
  accionesRealizadas?: string
): Promise<boolean> {
  try {
    const pool = getPool();
    const fechaResolucion = estado === 'Resuelta' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;
    await pool.execute(`
      UPDATE incidencias_mantenimiento SET
        estado = ?,
        fecha_resolucion = COALESCE(?, fecha_resolucion),
        acciones_realizadas = COALESCE(?, acciones_realizadas)
      WHERE id = ?
    `, [estado, fechaResolucion, accionesRealizadas || null, id]);

    // Si se resuelve, devolver equipo a disponible
    if (estado === 'Resuelta') {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT codigo_plai FROM incidencias_mantenimiento WHERE id = ?', [id]);
      if (rows && rows[0]) {
        await pool.execute('UPDATE equipos SET estado = "Disponible" WHERE codigo_plai = ?', [rows[0].codigo_plai]);
      }
    }
  } catch (error) {
    logger.warn('Error al actualizar incidencia en MySQL', { error: String(error) });
  }

  const items = ensureDataFile<IncidenciaItem[]>('incidencias.json', initialIncidencias);
  const inc = items.find(i => i.id === id);
  if (inc) {
    inc.estado = estado;
    if (estado === 'Resuelta') {
      inc.fechaResolucion = new Date().toISOString();
      const equipos = ensureDataFile<DeviceItem[]>('equipos.json', mockDevices);
      const eq = equipos.find(e => e.inventoryNumber === inc.codigoPlai);
      if (eq) {
        eq.status = 'Disponible';
        writeDataFile('equipos.json', equipos);
      }
    }
    if (accionesRealizadas) inc.accionesRealizadas = accionesRealizadas;
    writeDataFile('incidencias.json', items);
  }

  return true;
}
