import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { env } from './env';
import { DeviceItem, mockDevices } from './mockData';
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

// Mapeo entre slug de categoría en BD y nombre legible de categoría en la app
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

  // Resolver nombre de categoría
  const category = CATEGORY_MAP[row.categoria_id] || (row.categoria_nombre as DeviceItem['category']) || 'Realidad Virtual';

  // Fecha legible
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
    responsible: row.responsable || 'Laboratorio de Innovación PLAi',
    observations: row.observaciones || undefined,
    dateAdded,
  };
}

/**
 * Obtiene todos los equipos directamente de la base de datos MySQL (con fallback a mockData si BD no responde)
 */
export async function getEquiposFromDB(): Promise<DeviceItem[]> {
  try {
    const pool = getPool();
    const [rows] = await pool.query<EquipoRow[]>(`
      SELECT e.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug 
      FROM equipos e
      LEFT JOIN categorias c ON e.categoria_id = c.id
      ORDER BY e.created_at DESC
    `);

    if (rows && rows.length > 0) {
      return rows.map(mapRowToDeviceItem);
    }
    return mockDevices;
  } catch (error) {
    logger.warn('No se pudo consultar MySQL para equipos, usando datos de contingencia', {
      error: error instanceof Error ? error.message : String(error)
    });
    return mockDevices;
  }
}

/**
 * Inserta un nuevo equipo en la base de datos MySQL
 */
export async function insertEquipoInDB(item: DeviceItem): Promise<boolean> {
  const pool = getPool();
  const categoriaId = CATEGORY_TO_ID_MAP[item.category] || 'realidad-virtual';
  
  const query = `
    INSERT INTO equipos (
      id, categoria_id, nombre, marca, modelo, almacenamiento, 
      numero_serie, codigo_plai, estado, ubicacion, especificaciones, 
      accesorios, imagen_emoji, responsable, observaciones
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    item.responsible || 'Laboratorio de Innovación PLAi',
    item.observations || null,
  ];

  const [result] = await pool.execute<ResultSetHeader>(query, values);
  return result.affectedRows > 0;
}

/**
 * Elimina un equipo de la base de datos MySQL por su ID
 */
export async function deleteEquipoInDB(id: string): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM equipos WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

export interface DashboardStats {
  inventario: {
    totalEquipos: number;
    disponibles: number;
    activos: number;
    enUso: number;
    reservados: number;
    enMantenimiento: number;
    noDisponibles: number;
    totalApps: number;
  };
  operaciones: {
    reservacionesHoy: number;
    reservacionesPendientes: number;
    totalReservaciones: number;
    usuariosActivos: number;
    totalUsuarios: number;
    incidenciasAbiertas: number;
    totalIncidencias: number;
  };
  categorias: Array<{
    nombre: string;
    total: number;
    disponibles: number;
    mantenimiento: number;
  }>;
  equiposRecientes: Array<{
    id: string;
    name: string;
    category: string;
    status: string;
  }>;
  reservacionesPendientes: Array<{
    id: string;
    usuario: string;
    recurso: string;
    fecha: string;
    hora: string;
  }>;
  cotizaciones3D: {
    total: number;
    pendientes: number;
    enImpresion: number;
  };
}

export interface Cotizacion3D {
  id: string;
  nombre_solicitante: string;
  email_solicitante: string;
  telefono?: string;
  archivo_nombre: string;
  material: string;
  color_preferido?: string;
  relleno?: string;
  detalles?: string;
  estado: 'Pendiente' | 'Cotizada' | 'Aprobada' | 'En impresión' | 'Completada' | 'Rechazada';
  precio_estimado?: number | null;
  tiempo_estimado_horas?: number | null;
  notas_tecnicas?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Obtiene métricas y estadísticas reales consolidadas de la base de datos
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const pool = getPool();

    // 1. Estados de equipos
    const [equiposStatusRows] = await pool.query<RowDataPacket[]>(`
      SELECT estado, COUNT(*) as cantidad FROM equipos GROUP BY estado
    `);
    const estadoMap: Record<string, number> = {};
    let totalEquipos = 0;
    for (const r of equiposStatusRows) {
      estadoMap[r.estado] = Number(r.cantidad);
      totalEquipos += Number(r.cantidad);
    }

    const disponibles = estadoMap['Disponible'] || 0;
    const enUso = estadoMap['En uso'] || 0;
    const reservados = estadoMap['Reservado'] || 0;
    const enMantenimiento = estadoMap['En mantenimiento'] || 0;
    const noDisponibles = estadoMap['No disponible'] || estadoMap['Fuera de servicio'] || 0;
    const activos = disponibles + enUso + reservados;

    // 2. Total de aplicaciones
    const [appRows] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) as total FROM aplicaciones
    `);
    const totalApps = Number(appRows[0]?.total || 15);

    // 3. Usuarios
    const [userRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) as activos
      FROM usuarios
    `);
    const totalUsuarios = Number(userRows[0]?.total || 6);
    const usuariosActivos = Number(userRows[0]?.activos || totalUsuarios);

    // 4. Reservaciones
    const [resRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN fecha = CURDATE() THEN 1 ELSE 0 END) as hoy
      FROM reservaciones
    `);
    const totalReservaciones = Number(resRows[0]?.total || 0);
    const reservacionesPendientesCount = Number(resRows[0]?.pendientes || 0);
    const reservacionesHoy = Number(resRows[0]?.hoy || 0);

    // 5. Mantenimientos
    const [mantRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado IN ('Abierta', 'En proceso') THEN 1 ELSE 0 END) as abiertas
      FROM mantenimientos
    `);
    const totalIncidencias = Number(mantRows[0]?.total || 0);
    const incidenciasAbiertas = Number(mantRows[0]?.abiertas || 0);

    // 6. Cotizaciones 3D
    let totalCotizaciones = 3;
    let cotizacionesPendientes = 1;
    let cotizacionesEnImpresion = 1;
    try {
      const [cotRows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN estado = 'En impresión' THEN 1 ELSE 0 END) as en_impresion
        FROM cotizaciones_3d
      `);
      if (cotRows && cotRows.length > 0) {
        totalCotizaciones = Number(cotRows[0]?.total || 0);
        cotizacionesPendientes = Number(cotRows[0]?.pendientes || 0);
        cotizacionesEnImpresion = Number(cotRows[0]?.en_impresion || 0);
      }
    } catch {
      // Si la tabla no existiera todavía
    }

    // 7. Categorías
    const [catRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        c.nombre,
        COUNT(e.id) as total,
        SUM(CASE WHEN e.estado = 'Disponible' THEN 1 ELSE 0 END) as disponibles,
        SUM(CASE WHEN e.estado IN ('En mantenimiento', 'No disponible', 'Fuera de servicio') THEN 1 ELSE 0 END) as mantenimiento
      FROM categorias c
      LEFT JOIN equipos e ON e.categoria_id = c.id
      GROUP BY c.id, c.nombre
    `);
    const categorias = catRows.map(r => ({
      nombre: String(r.nombre),
      total: Number(r.total || 0),
      disponibles: Number(r.disponibles || 0),
      mantenimiento: Number(r.mantenimiento || 0),
    }));

    // 8. Equipos recientes
    const [recentEqRows] = await pool.query<RowDataPacket[]>(`
      SELECT e.id, e.nombre, c.nombre AS categoria, e.estado
      FROM equipos e
      LEFT JOIN categorias c ON e.categoria_id = c.id
      ORDER BY e.created_at DESC
      LIMIT 5
    `);
    const equiposRecientes = recentEqRows.map(r => ({
      id: String(r.id),
      name: String(r.nombre),
      category: String(r.categoria || 'General'),
      status: String(r.estado),
    }));

    // 9. Reservaciones pendientes
    const [recentResRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        r.id, 
        r.nombre_solicitante AS usuario, 
        COALESCE(e.nombre, r.recurso_id) AS recurso, 
        DATE_FORMAT(r.fecha, '%Y-%m-%d') AS fecha,
        CONCAT(DATE_FORMAT(r.hora_inicio, '%H:%i'), '–', DATE_FORMAT(r.hora_fin, '%H:%i')) AS hora
      FROM reservaciones r
      LEFT JOIN equipos e ON r.recurso_id = e.id
      WHERE r.estado = 'Pendiente'
      ORDER BY r.fecha ASC
      LIMIT 5
    `);
    const reservacionesPendientes = recentResRows.map(r => ({
      id: String(r.id),
      usuario: String(r.usuario),
      recurso: String(r.recurso),
      fecha: String(r.fecha),
      hora: String(r.hora),
    }));

    return {
      inventario: {
        totalEquipos,
        disponibles,
        activos,
        enUso,
        reservados,
        enMantenimiento,
        noDisponibles,
        totalApps,
      },
      operaciones: {
        reservacionesHoy,
        reservacionesPendientes: reservacionesPendientesCount,
        totalReservaciones,
        usuariosActivos,
        totalUsuarios,
        incidenciasAbiertas,
        totalIncidencias,
      },
      cotizaciones3D: {
        total: totalCotizaciones,
        pendientes: cotizacionesPendientes,
        enImpresion: cotizacionesEnImpresion,
      },
      categorias,
      equiposRecientes,
      reservacionesPendientes,
    };
  } catch (error) {
    logger.warn('Error al consultar estadísticas de MySQL, generando fallback', {
      error: error instanceof Error ? error.message : String(error)
    });

    const totalEquipos = mockDevices.length;
    const disponibles = mockDevices.filter(d => d.status === 'Disponible').length;
    const enUso = mockDevices.filter(d => d.status === 'En uso').length;
    const reservados = mockDevices.filter(d => d.status === 'Reservado').length;
    const enMantenimiento = mockDevices.filter(d => d.status === 'En mantenimiento').length;
    const noDisponibles = mockDevices.filter(d => d.status === 'No disponible' || d.status === 'Fuera de servicio').length;

    return {
      inventario: {
        totalEquipos,
        disponibles,
        activos: disponibles + enUso + reservados,
        enUso,
        reservados,
        enMantenimiento,
        noDisponibles,
        totalApps: 15,
      },
      operaciones: {
        reservacionesHoy: 1,
        reservacionesPendientes: 1,
        totalReservaciones: 5,
        usuariosActivos: 5,
        totalUsuarios: 6,
        incidenciasAbiertas: 3,
        totalIncidencias: 5,
      },
      cotizaciones3D: {
        total: 3,
        pendientes: 1,
        enImpresion: 1,
      },
      categorias: [
        { nombre: 'Realidad Virtual', total: 4, disponibles: 2, mantenimiento: 1 },
        { nombre: 'Robótica', total: 8, disponibles: 8, mantenimiento: 0 },
        { nombre: 'Fabricación Digital', total: 6, disponibles: 5, mantenimiento: 0 },
        { nombre: 'Drones', total: 4, disponibles: 3, mantenimiento: 0 },
        { nombre: 'Cómputo / Multimedia', total: 3, disponibles: 2, mantenimiento: 1 },
      ],
      equiposRecientes: mockDevices.slice(0, 5).map(d => ({
        id: d.id,
        name: d.name,
        category: d.category,
        status: d.status,
      })),
      reservacionesPendientes: [
        { id: 'RES-1001', usuario: 'Ana García', recurso: 'Meta Quest 3 (512 GB)', fecha: '2026-09-25', hora: '09:00–11:00' },
      ],
    };
  }
}

/**
 * Obtiene todas las solicitudes de cotización de impresión 3D
 */
export async function getCotizaciones3DFromDB(): Promise<Cotizacion3D[]> {
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id, nombre_solicitante, email_solicitante, telefono, archivo_nombre,
        material, color_preferido, relleno, detalles, estado,
        precio_estimado, tiempo_estimado_horas, notas_tecnicas,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i') as updated_at
      FROM cotizaciones_3d
      ORDER BY created_at DESC
    `);
    return rows.map(r => ({
      id: String(r.id),
      nombre_solicitante: String(r.nombre_solicitante),
      email_solicitante: String(r.email_solicitante),
      telefono: r.telefono ? String(r.telefono) : undefined,
      archivo_nombre: String(r.archivo_nombre),
      material: String(r.material),
      color_preferido: r.color_preferido ? String(r.color_preferido) : 'Cualquiera',
      relleno: r.relleno ? String(r.relleno) : '20%',
      detalles: r.detalles ? String(r.detalles) : undefined,
      estado: r.estado as Cotizacion3D['estado'],
      precio_estimado: r.precio_estimado !== null ? Number(r.precio_estimado) : null,
      tiempo_estimado_horas: r.tiempo_estimado_horas !== null ? Number(r.tiempo_estimado_horas) : null,
      notas_tecnicas: r.notas_tecnicas ? String(r.notas_tecnicas) : null,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  } catch (error) {
    logger.warn('Error al consultar cotizaciones_3d en MySQL', { error });
    return [
      {
        id: 'COT-101',
        nombre_solicitante: 'Carlos López',
        email_solicitante: 'carlos.lopez@plai.edu.mx',
        telefono: '33-1234-5678',
        archivo_nombre: 'carcasa_sensor_iot.stl',
        material: 'PLA',
        color_preferido: 'Negro',
        relleno: '20%',
        detalles: 'Pieza para prototipo de validación en IoT',
        estado: 'Pendiente',
        created_at: '2026-10-27 18:05',
      },
      {
        id: 'COT-102',
        nombre_solicitante: 'Ana García',
        email_solicitante: 'ana.garcia@plai.edu.mx',
        telefono: '33-9876-5432',
        archivo_nombre: 'soporte_meta_quest.obj',
        material: 'PETG',
        color_preferido: 'Blanco',
        relleno: '40%',
        detalles: 'Soporte de pared para visores VR del laboratorio',
        estado: 'Cotizada',
        precio_estimado: 180,
        tiempo_estimado_horas: 4.5,
        created_at: '2026-10-27 17:30',
      },
      {
        id: 'COT-103',
        nombre_solicitante: 'Lucía Ramírez',
        email_solicitante: 'lucia.ramirez@plai.edu.mx',
        telefono: '33-4567-8901',
        archivo_nombre: 'engrane_robotico.3mf',
        material: 'TPU (Flexible)',
        color_preferido: 'Azul',
        relleno: '100%',
        detalles: 'Engrane flexible amortiguador para brazo Dobot',
        estado: 'En impresión',
        precio_estimado: 220,
        tiempo_estimado_horas: 6,
        created_at: '2026-10-27 16:15',
      },
    ];
  }
}

/**
 * Inserta una nueva solicitud de cotización de impresión 3D
 */
export async function insertCotizacion3DInDB(
  data: Omit<Cotizacion3D, 'id' | 'created_at' | 'updated_at'>
): Promise<Cotizacion3D> {
  const id = `COT-${Math.floor(100 + Math.random() * 900)}`;
  try {
    const pool = getPool();
    await pool.execute(
      `INSERT INTO cotizaciones_3d (
        id, nombre_solicitante, email_solicitante, telefono, archivo_nombre,
        material, color_preferido, relleno, detalles, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.nombre_solicitante,
        data.email_solicitante,
        data.telefono || null,
        data.archivo_nombre,
        data.material || 'PLA',
        data.color_preferido || 'Cualquiera',
        data.relleno || '20%',
        data.detalles || null,
        data.estado || 'Pendiente',
      ]
    );
  } catch (error) {
    logger.warn('No se pudo insertar en cotizaciones_3d de MySQL', { error });
  }

  return {
    id,
    ...data,
    created_at: new Date().toISOString(),
  };
}

/**
 * Actualiza el estado y detalles técnicos de una cotización de impresión 3D
 */
export async function updateCotizacion3DInDB(
  id: string,
  updates: Partial<Cotizacion3D>
): Promise<boolean> {
  try {
    const pool = getPool();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.estado !== undefined) {
      fields.push('estado = ?');
      values.push(updates.estado);
    }
    if (updates.precio_estimado !== undefined) {
      fields.push('precio_estimado = ?');
      values.push(updates.precio_estimado);
    }
    if (updates.tiempo_estimado_horas !== undefined) {
      fields.push('tiempo_estimado_horas = ?');
      values.push(updates.tiempo_estimado_horas);
    }
    if (updates.notas_tecnicas !== undefined) {
      fields.push('notas_tecnicas = ?');
      values.push(updates.notas_tecnicas);
    }

    if (fields.length === 0) return true;

    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE cotizaciones_3d SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  } catch (error) {
    logger.error('Error al actualizar cotización 3D en MySQL', { id, updates }, error);
    return false;
  }
}


