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
