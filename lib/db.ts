import type { RowDataPacketLike } from './dbTypes';
import { DeviceItem, AppItem } from './mockData';
import { getPool, withTx, Queryable, toDateStr, toDateTimeStr, toTimeStr } from './pool';

export { getPool };
export type { DeviceItem };

// Mapeos de categorías (slug <-> nombre mostrado en el catálogo)
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

type Row = RowDataPacketLike;

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [value];
    } catch {
      return [value];
    }
  }
  return [];
}

// ====================================================================
// 1. EQUIPOS
// ====================================================================
export interface EquipoRow {
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
  especificaciones: string | string[] | null;
  accesorios: string | string[] | null;
  imagen_emoji: string | null;
  imagen_url?: string | null;
  responsable: string | null;
  observaciones: string | null;
  created_at: string | Date;
}

export function mapRowToDeviceItem(row: EquipoRow): DeviceItem {
  const specs = asStringArray(row.especificaciones);
  const accessories = asStringArray(row.accesorios);
  const category =
    CATEGORY_MAP[row.categoria_id] ||
    (row.categoria_nombre as DeviceItem['category']) ||
    'Realidad Virtual';

  let dateAdded: string | undefined;
  if (row.created_at) {
    const d = new Date(row.created_at);
    if (!isNaN(d.getTime())) dateAdded = d.toISOString().split('T')[0];
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
  const { rows } = await getPool().query<EquipoRow>(`
    SELECT e.*, c.nombre AS categoria_nombre
    FROM equipos e
    LEFT JOIN categorias c ON e.categoria_id = c.id
    ORDER BY e.created_at DESC, e.id
  `);
  return rows.map(mapRowToDeviceItem);
}

export async function insertEquipoInDB(item: DeviceItem): Promise<boolean> {
  const categoriaId = CATEGORY_TO_ID_MAP[item.category] || 'realidad-virtual';

  const { rowCount } = await getPool().query(
    `
    INSERT INTO equipos (
      id, categoria_id, nombre, marca, modelo, almacenamiento,
      numero_serie, codigo_plai, estado, ubicacion, especificaciones,
      accesorios, imagen_emoji, imagen_url, responsable, observaciones
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13,$14,$15,$16)
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
      updated_at = now()
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
  return (rowCount ?? 0) > 0;
}

export async function deleteEquipoInDB(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query('DELETE FROM equipos WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

export async function getEquipoByCodigoPLAi(codigo: string): Promise<DeviceItem | null> {
  const { rows } = await getPool().query<EquipoRow>(
    `SELECT e.*, c.nombre AS categoria_nombre
     FROM equipos e LEFT JOIN categorias c ON e.categoria_id = c.id
     WHERE lower(e.codigo_plai) = lower($1)`,
    [codigo.trim()]
  );
  return rows[0] ? mapRowToDeviceItem(rows[0]) : null;
}

// ====================================================================
// 2. APLICACIONES VR / PC
// ====================================================================
export async function getAplicacionesFromDB(): Promise<AppItem[]> {
  const { rows } = await getPool().query<Row>(
    'SELECT * FROM aplicaciones ORDER BY created_at DESC, id'
  );
  return rows.map((r) => ({
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
  })) as AppItem[];
}

export async function insertAplicacionInDB(app: AppItem): Promise<boolean> {
  await getPool().query(
    `
    INSERT INTO aplicaciones (
      id, nombre, desarrollador, version, categoria, plataforma,
      clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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
      updated_at = now()
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
      app.imageUrl || null,
      app.devicesInstalled || 1,
      app.status || 'Activa',
    ]
  );
  return true;
}

export async function deleteAplicacionInDB(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query('DELETE FROM aplicaciones WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
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

export async function getBitacoraFromDB(): Promise<BitacoraItem[]> {
  const { rows } = await getPool().query<Row>(
    'SELECT * FROM bitacora_uso ORDER BY fecha_entrega DESC, id'
  );
  return rows.map((r) => ({
    id: String(r.id),
    equipoId: r.equipo_id,
    codigoPlai: r.codigo_plai,
    equipoNombre: r.equipo_nombre,
    usuarioNombre: r.usuario_nombre,
    usuarioEmail: r.usuario_email,
    usuarioDependencia: r.usuario_dependencia || undefined,
    fechaEntrega: toDateTimeStr(r.fecha_entrega),
    fechaDevolucionEstimada: toDateTimeStr(r.fecha_devolucion_estimada),
    fechaDevolucionReal: r.fecha_devolucion_real ? toDateTimeStr(r.fecha_devolucion_real) : undefined,
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

export async function insertBitacoraEntregaInDB(
  item: BitacoraItem,
  reservaId?: string
): Promise<boolean> {
  return withTx(async (db) => {
    await db.query(
      `
      INSERT INTO bitacora_uso (
        id, equipo_id, codigo_plai, equipo_nombre, usuario_nombre,
        usuario_email, usuario_dependencia, fecha_entrega, fecha_devolucion_estimada,
        estado_prestamo, condicion_entrega, accesorios_entregados, observaciones_entrega,
        admin_entrega
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (id) DO UPDATE SET
        estado_prestamo = EXCLUDED.estado_prestamo,
        condicion_entrega = EXCLUDED.condicion_entrega,
        accesorios_entregados = EXCLUDED.accesorios_entregados,
        observaciones_entrega = EXCLUDED.observaciones_entrega,
        admin_entrega = EXCLUDED.admin_entrega
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

    await db.query(
      `UPDATE equipos SET estado = 'En uso', updated_at = now()
       WHERE lower(codigo_plai) = lower($1) OR id = $2`,
      [item.codigoPlai, item.equipoId]
    );

    // Reservación vinculada (o Aprobada/Pendiente del mismo equipo) pasa a "En uso"
    const { rows } = await db.query<{ id: string }>(
      `
      SELECT id FROM reservaciones
      WHERE ($1::text IS NOT NULL AND id = $1::text)
         OR (estado IN ('Aprobada', 'Pendiente')
             AND (lower(codigo_plai_asignado) = lower($2) OR equipo_id = $3))
      ORDER BY (id = $1::text) DESC, created_at DESC
      LIMIT 1
      `,
      [reservaId ?? null, item.codigoPlai, item.equipoId]
    );
    if (rows[0]) {
      await db.query(
        `UPDATE reservaciones
         SET estado = 'En uso', codigo_plai_asignado = $2, equipo_id = $3, updated_at = now()
         WHERE id = $1`,
        [rows[0].id, item.codigoPlai, item.equipoId]
      );
    }
    return true;
  });
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
  return withTx(async (db) => {
    const estadoPrestamo = devolucion.incidenciaGenerada ? 'Con Incidencia' : 'Devuelto';
    const { rows } = await db.query<{ codigo_plai: string; equipo_id: string }>(
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
    if (!rows[0]) return false;

    const { codigo_plai: codigo, equipo_id: equipoId } = rows[0];
    const nuevoEstado = devolucion.incidenciaGenerada ? 'En mantenimiento' : 'Disponible';
    await db.query(
      'UPDATE equipos SET estado = $1, updated_at = now() WHERE lower(codigo_plai) = lower($2) OR id = $3',
      [nuevoEstado, codigo, equipoId]
    );

    // Reservación en curso de ese equipo pasa a "Completada"
    const res = await db.query<{ id: string }>(
      `
      SELECT id FROM reservaciones
      WHERE estado IN ('En uso', 'Aprobada')
        AND (lower(codigo_plai_asignado) = lower($1) OR equipo_id = $2)
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [codigo, equipoId]
    );
    if (res.rows[0]) {
      await db.query(
        "UPDATE reservaciones SET estado = 'Completada', updated_at = now() WHERE id = $1",
        [res.rows[0].id]
      );
    }
    return true;
  });
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

export async function getReservacionesFromDB(): Promise<ReservacionItem[]> {
  const { rows } = await getPool().query<Row>(`
    SELECT r.*, e.codigo_plai AS eq_codigo, e.accesorios AS eq_accesorios
    FROM reservaciones r
    LEFT JOIN equipos e ON e.id = r.equipo_id
    ORDER BY r.created_at DESC, r.id
  `);

  return rows.map((r) => ({
    id: String(r.id),
    folio: r.folio || String(r.id),
    categoriaId: r.categoria_id || 'realidad-virtual',
    equipoId: r.equipo_id || undefined,
    codigoPlaiAsignado: r.codigo_plai_asignado || r.eq_codigo || undefined,
    usuarioNombre: r.usuario_nombre || 'Usuario PLAi',
    usuarioEmail: r.usuario_email || '',
    usuarioTelefono: r.usuario_telefono || undefined,
    usuarioInstitucion: r.usuario_institucion || undefined,
    fechaUso: toDateStr(r.fecha_uso),
    horaInicio: toTimeStr(r.hora_inicio),
    horaFin: toTimeStr(r.hora_fin),
    actividad: r.actividad || 'Uso de laboratorio',
    estado: r.estado,
    accesoriosIncluidos:
      r.accesorios_incluidos || asStringArray(r.eq_accesorios).slice(0, 2).join(', ') || undefined,
    condicionSalida: r.condicion_salida || 'Excelente',
    observacionesAdmin: r.observaciones_admin || undefined,
    aprobadoPor: r.aprobado_por || undefined,
  }));
}

export async function updateReservacionInDB(
  id: string,
  update: Partial<ReservacionItem>
): Promise<boolean> {
  return withTx(async (db) => {
    const { rows } = await db.query<{ equipo_id: string | null; codigo_plai_asignado: string | null }>(
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
        fecha_uso = COALESCE($9::date, fecha_uso),
        hora_inicio = COALESCE($10::time, hora_inicio),
        hora_fin = COALESCE($11::time, hora_fin),
        actividad = COALESCE($12, actividad),
        updated_at = now()
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
    if (!rows[0]) return false;

    // Sincronizar el estado del dispositivo asignado en Inventario
    const targetCodigo = rows[0].codigo_plai_asignado;
    const targetEquipoId = rows[0].equipo_id;
    if (update.estado && (targetCodigo || targetEquipoId)) {
      const eqRes = await db.query<{ id: string; estado: string }>(
        `SELECT id, estado FROM equipos
         WHERE ($1::text IS NOT NULL AND lower(codigo_plai) = lower($1::text))
            OR ($2::text IS NOT NULL AND id = $2::text)
         LIMIT 1`,
        [targetCodigo, targetEquipoId]
      );
      const eq = eqRes.rows[0];
      if (eq) {
        let nuevoEstado: DeviceItem['status'] | null = null;
        if (update.estado === 'Aprobada' && eq.estado === 'Disponible') {
          nuevoEstado = 'Reservado';
        } else if (update.estado === 'En uso') {
          nuevoEstado = 'En uso';
        } else if (
          (update.estado === 'Completada' || update.estado === 'Rechazada') &&
          (eq.estado === 'Reservado' || eq.estado === 'En uso')
        ) {
          nuevoEstado = 'Disponible';
        }
        if (nuevoEstado) {
          await db.query('UPDATE equipos SET estado = $1, updated_at = now() WHERE id = $2', [
            nuevoEstado,
            eq.id,
          ]);
        }
      }
    }
    return true;
  });
}

async function insertReservacionWith(db: Queryable, item: ReservacionItem): Promise<boolean> {
  await db.query(
    `
    INSERT INTO reservaciones (
      id, folio, categoria_id, equipo_id, codigo_plai_asignado,
      usuario_nombre, usuario_email, usuario_telefono, usuario_institucion,
      fecha_uso, hora_inicio, hora_fin, actividad, estado,
      accesorios_incluidos, condicion_salida, observaciones_admin
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::date,$11::time,$12::time,$13,$14,$15,$16,$17)
    ON CONFLICT (id) DO UPDATE SET
      estado = EXCLUDED.estado,
      equipo_id = EXCLUDED.equipo_id,
      codigo_plai_asignado = EXCLUDED.codigo_plai_asignado,
      usuario_nombre = EXCLUDED.usuario_nombre,
      usuario_email = EXCLUDED.usuario_email,
      usuario_telefono = EXCLUDED.usuario_telefono,
      usuario_institucion = EXCLUDED.usuario_institucion,
      fecha_uso = EXCLUDED.fecha_uso,
      hora_inicio = EXCLUDED.hora_inicio,
      hora_fin = EXCLUDED.hora_fin,
      actividad = EXCLUDED.actividad,
      accesorios_incluidos = EXCLUDED.accesorios_incluidos,
      condicion_salida = EXCLUDED.condicion_salida,
      observaciones_admin = EXCLUDED.observaciones_admin,
      updated_at = now()
    `,
    [
      item.id,
      item.folio || item.id,
      item.categoriaId || 'realidad-virtual',
      item.equipoId || null,
      item.codigoPlaiAsignado || null,
      item.usuarioNombre || 'Usuario Institucional',
      item.usuarioEmail || '',
      item.usuarioTelefono || null,
      item.usuarioInstitucion || 'Comunidad PLAi',
      item.fechaUso || new Date().toISOString().split('T')[0],
      item.horaInicio || '10:00',
      item.horaFin || '12:00',
      item.actividad || 'Uso de laboratorio',
      item.estado || 'Pendiente',
      item.accesoriosIncluidos || null,
      item.condicionSalida || 'Excelente',
      item.observacionesAdmin || null,
    ]
  );
  return true;
}

export async function insertReservacionInDB(item: ReservacionItem): Promise<boolean> {
  return insertReservacionWith(getPool(), item);
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

export async function getIncidenciasFromDB(): Promise<IncidenciaItem[]> {
  const { rows } = await getPool().query<Row>(
    'SELECT * FROM incidencias_mantenimiento ORDER BY fecha_reporte DESC, id'
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
    fechaReporte: toDateTimeStr(r.fecha_reporte),
    fechaResolucion: r.fecha_resolucion ? toDateTimeStr(r.fecha_resolucion) : undefined,
    accionesRealizadas: r.acciones_realizadas || undefined,
  }));
}

export async function insertIncidenciaInDB(incidencia: IncidenciaItem): Promise<boolean> {
  return withTx(async (db) => {
    await db.query(
      `
      INSERT INTO incidencias_mantenimiento (
        id, folio, equipo_id, codigo_plai, equipo_nombre, origen,
        tipo_falla, severidad, descripcion, estado, tecnico_responsable,
        fecha_reporte, acciones_realizadas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
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
    await db.query(
      `UPDATE equipos SET estado = 'En mantenimiento', updated_at = now()
       WHERE lower(codigo_plai) = lower($1) OR id = $2`,
      [incidencia.codigoPlai, incidencia.equipoId]
    );
    return true;
  });
}

export async function updateIncidenciaStatusInDB(
  id: string,
  estado: IncidenciaItem['estado'],
  accionesRealizadas?: string
): Promise<boolean> {
  return withTx(async (db) => {
    const { rows } = await db.query<{ codigo_plai: string; equipo_id: string }>(
      `
      UPDATE incidencias_mantenimiento SET
        estado = $1::text,
        fecha_resolucion = CASE WHEN $1::text = 'Resuelta' THEN now()::timestamp ELSE fecha_resolucion END,
        acciones_realizadas = COALESCE($2, acciones_realizadas),
        updated_at = now()
      WHERE id = $3
      RETURNING codigo_plai, equipo_id
      `,
      [estado, accionesRealizadas || null, id]
    );
    if (!rows[0]) return false;

    const nuevoEstado = estado === 'Resuelta' ? 'Disponible' : 'En mantenimiento';
    await db.query(
      'UPDATE equipos SET estado = $1, updated_at = now() WHERE lower(codigo_plai) = lower($2) OR id = $3',
      [nuevoEstado, rows[0].codigo_plai, rows[0].equipo_id]
    );
    return true;
  });
}

// ====================================================================
// 6. USUARIOS INSTITUCIONALES (directorio; sin contraseñas)
// ====================================================================
export interface UsuarioItem {
  id: string;
  name: string;
  email: string;
  /** Solo por compatibilidad con formularios: NUNCA se persiste ni se devuelve. */
  password?: string;
  role: 'Administrador' | 'Colaborador' | 'Usuario Final';
  status: 'Activo' | 'Inactivo';
  dependencia?: string;
  telefono?: string;
  lastLogin: string;
  reservations: number;
}

const ROLE_TO_DB: Record<UsuarioItem['role'], string> = {
  'Administrador': 'admin',
  'Colaborador': 'colaborador',
  'Usuario Final': 'usuario',
};
const ROLE_FROM_DB: Record<string, UsuarioItem['role']> = {
  admin: 'Administrador',
  colaborador: 'Colaborador',
  usuario: 'Usuario Final',
};

function mapUsuario(r: Row): UsuarioItem {
  return {
    id: String(r.id),
    name: r.nombre,
    email: r.email,
    role: ROLE_FROM_DB[r.rol] || 'Usuario Final',
    status: r.estado === 'Activo' ? 'Activo' : 'Inactivo',
    dependencia: r.dependencia || undefined,
    telefono: r.telefono || undefined,
    lastLogin: r.ultimo_acceso ? toDateStr(r.ultimo_acceso) : '',
    reservations: Number(r.reservations || 0),
  };
}

export async function getUsuariosFromDB(): Promise<UsuarioItem[]> {
  const { rows } = await getPool().query<Row>('SELECT * FROM usuarios ORDER BY created_at DESC, id');
  const [resCountRes, bitCountRes] = await Promise.all([
    getPool().query<{ email: string; count: string }>(
      'SELECT lower(usuario_email) AS email, count(*)::text AS count FROM reservaciones GROUP BY lower(usuario_email)'
    ),
    getPool().query<{ email: string; count: string }>(
      'SELECT lower(usuario_email) AS email, count(*)::text AS count FROM bitacora_uso GROUP BY lower(usuario_email)'
    ),
  ]);
  const counts = new Map<string, number>();
  for (const r of resCountRes.rows) {
    if (r.email) counts.set(r.email, (counts.get(r.email) || 0) + Number(r.count || 0));
  }
  for (const b of bitCountRes.rows) {
    if (b.email) counts.set(b.email, (counts.get(b.email) || 0) + Number(b.count || 0));
  }
  return rows.map((u) => {
    const item = mapUsuario(u);
    item.reservations = counts.get(item.email.toLowerCase()) || 0;
    return item;
  });
}

export async function upsertUsuarioInDB(user: UsuarioItem): Promise<UsuarioItem> {
  await getPool().query(
    `
    INSERT INTO usuarios (id, nombre, email, rol, estado, dependencia, telefono, ultimo_acceso)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8::date)
    ON CONFLICT (id) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      email = EXCLUDED.email,
      rol = EXCLUDED.rol,
      estado = EXCLUDED.estado,
      dependencia = EXCLUDED.dependencia,
      telefono = EXCLUDED.telefono,
      ultimo_acceso = COALESCE(EXCLUDED.ultimo_acceso, usuarios.ultimo_acceso),
      updated_at = now()
    `,
    [
      user.id,
      user.name,
      user.email.toLowerCase(),
      ROLE_TO_DB[user.role] || 'usuario',
      user.status === 'Inactivo' ? 'Inactivo' : 'Activo',
      user.dependencia || 'Comunidad PLAi',
      user.telefono || null,
      user.lastLogin || null,
    ]
  );
  const { password: _omit, ...safe } = user;
  void _omit;
  return safe as UsuarioItem;
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

function mapCurso(r: Row): CursoAgendaItem {
  return {
    id: String(r.id),
    titulo: r.titulo,
    tipo: r.tipo,
    fecha: toDateStr(r.fecha),
    hora: r.hora,
    lugar: r.lugar,
    asistentes: Number(r.asistentes || 0),
    estado: r.estado,
    icon: r.icon,
    instructor: r.instructor,
    descripcion: r.descripcion,
    solicitanteNombre: r.solicitante_nombre || undefined,
    solicitanteEmail: r.solicitante_email || undefined,
    institucion: r.institucion || undefined,
  };
}

export async function getCursosFromDB(): Promise<CursoAgendaItem[]> {
  const { rows } = await getPool().query<Row>('SELECT * FROM cursos ORDER BY created_at DESC, id');
  return rows.map(mapCurso);
}

export async function insertCursoInDB(curso: CursoAgendaItem): Promise<CursoAgendaItem> {
  const titulo = curso.titulo.toLowerCase();
  const categoriaId = titulo.includes('rob')
    ? 'robotica'
    : titulo.includes('impres')
      ? 'fabricacion-digital'
      : 'realidad-virtual';

  await withTx(async (db) => {
    await db.query(
      `
      INSERT INTO cursos (
        id, titulo, tipo, fecha, hora, lugar, asistentes, estado, icon,
        instructor, descripcion, solicitante_nombre, solicitante_email, institucion
      ) VALUES ($1,$2,$3,$4::date,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
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

    // Registrar también en Reservaciones para que el Administrador pueda gestionar la visita o taller
    await insertReservacionWith(db, {
      id: `res-${Date.now()}`,
      folio: curso.id,
      categoriaId,
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

export const defaultSystemConfig: SystemConfig = {
  labName: 'PLAi — Laboratorio de Innovación, Robótica y Tecnologías Inmersivas',
  labLocation: 'Torre C, Ciudad Creativa Digital, Guadalajara, Jalisco',
  adminEmail: 'admin@plai.edu.mx',
  maintenanceAlertDays: 30,
  allowPublicView: true,
  requireApproval: true,
  maxReservationHours: 2,
  maxAdvanceDays: 14,
  categorias: ['Realidad Virtual', 'Robótica', 'Fabricación Digital', 'Drones', 'Cómputo'],
};

export async function getSystemConfigFromDB(): Promise<SystemConfig> {
  const { rows } = await getPool().query<{ datos: Partial<SystemConfig> }>(
    'SELECT datos FROM configuracion WHERE id = 1'
  );
  return { ...defaultSystemConfig, ...(rows[0]?.datos || {}) };
}

export async function saveSystemConfigInDB(cfg: SystemConfig): Promise<SystemConfig> {
  await getPool().query(
    `
    INSERT INTO configuracion (id, datos) VALUES (1, $1::jsonb)
    ON CONFLICT (id) DO UPDATE SET datos = EXCLUDED.datos, updated_at = now()
    `,
    [JSON.stringify(cfg)]
  );
  return cfg;
}
