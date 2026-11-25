import { directus } from './directus';
import type { DeviceItem, AppItem } from './mockData';

export type { DeviceItem };

/**
 * Capa de persistencia 100% respaldada por la API oficial de Directus (admin.plai.mx).
 * - Sin conexiones directas a PostgreSQL/Neon.
 * - Sin respaldo silencioso en memoria: cualquier fallo de Directus se propaga con error real.
 * - Colecciones prefijadas (`DIRECTUS_COLLECTION_PREFIX`, default `lab_recursos_`) para no
 *   colisionar con otras aplicaciones en la misma instancia de Directus.
 */

export async function checkDatabaseConnection(): Promise<boolean> {
  return directus.ping();
}

const CATEGORY_MAP: Record<string, DeviceItem['category']> = {
  'realidad-virtual': 'Realidad Virtual',
  robotica: 'Robótica',
  'fabricacion-digital': 'Fabricación digital',
  drones: 'Drones',
  'computo-multimedia': 'Cómputo',
};

const CATEGORY_TO_ID_MAP: Record<string, string> = {
  'Realidad Virtual': 'realidad-virtual',
  Robótica: 'robotica',
  'Fabricación digital': 'fabricacion-digital',
  Drones: 'drones',
  Cómputo: 'computo-multimedia',
};

function parseStringArray(val: unknown, fallback: string[]): string[] {
  if (Array.isArray(val)) return val.map(String);
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

function formatTimestamp(val: string | Date | null | undefined): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().slice(0, 19).replace('T', ' ');
  return String(val);
}

/**
 * Normaliza fechas provenientes de inputs (`YYYY-MM-DDTHH:mm` o `YYYY-MM-DD HH:mm:ss`)
 * a formato ISO 8601 válido para campos `timestamp` reales en Directus/PostgreSQL.
 */
function toIsoTimestamp(val: string | Date | null | undefined): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  const trimmed = String(val).trim();
  if (!trimmed) return new Date().toISOString();
  const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return trimmed;
}

// ====================================================================
// 1. EQUIPOS (colección: <prefix>equipos)
// ====================================================================
interface EquipoRow {
  id: string;
  categoria_id: string;
  nombre: string;
  marca: string;
  modelo: string;
  almacenamiento?: string | null;
  numero_serie: string;
  codigo_plai: string;
  estado: DeviceItem['status'];
  ubicacion: string;
  especificaciones?: string[] | string | null;
  accesorios?: string[] | string | null;
  imagen_emoji?: string | null;
  imagen_url?: string | null;
  responsable?: string | null;
  observaciones?: string | null;
  date_created?: string | null;
}

export function mapRowToDeviceItem(row: EquipoRow): DeviceItem {
  const category = CATEGORY_MAP[row.categoria_id] || 'Realidad Virtual';
  const specs = parseStringArray(row.especificaciones, ['Especificaciones estándar PLAi']);
  const accessories = parseStringArray(row.accesorios, ['Equipo estándar']);

  let dateAdded = new Date().toISOString().split('T')[0];
  if (row.date_created) {
    dateAdded = String(row.date_created).split('T')[0];
  }

  return {
    id: row.id,
    name: row.nombre,
    category,
    brand: row.marca,
    model: row.modelo,
    storage: row.almacenamiento || 'N/A',
    serialNumber: row.numero_serie,
    inventoryNumber: row.codigo_plai,
    status: row.estado,
    location: row.ubicacion,
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
  const rows = await directus.getItems<EquipoRow>('equipos', { sort: 'nombre' });
  return rows.map(mapRowToDeviceItem);
}

export async function insertEquipoInDB(item: DeviceItem): Promise<boolean> {
  const categoriaId = CATEGORY_TO_ID_MAP[item.category] || 'realidad-virtual';
  await directus.upsertItem<EquipoRow>('equipos', item.id, {
    id: item.id,
    categoria_id: categoriaId,
    nombre: item.name,
    marca: item.brand,
    modelo: item.model,
    almacenamiento: item.storage || 'N/A',
    numero_serie: item.serialNumber,
    codigo_plai: item.inventoryNumber,
    estado: item.status,
    ubicacion: item.location,
    especificaciones: item.specs,
    accesorios: item.accessories,
    imagen_emoji: item.imageEmoji || '📦',
    imagen_url: item.imageUrl || null,
    responsable: item.responsible || 'Laboratorio de Innovación PLAi',
    observaciones: item.observations || null,
  });
  return true;
}

export async function deleteEquipoInDB(id: string): Promise<boolean> {
  await directus.deleteItem('equipos', id);
  return true;
}

export async function getEquipoByCodigoPLAi(codigo: string): Promise<DeviceItem | null> {
  const rows = await directus.getItems<EquipoRow>('equipos', {
    'filter[codigo_plai][_icontains]': codigo.trim(),
    limit: 5,
  });
  const exact = rows.find(
    (r) => r.codigo_plai.toLowerCase() === codigo.trim().toLowerCase()
  );
  return exact ? mapRowToDeviceItem(exact) : null;
}

// ====================================================================
// 2. APLICACIONES (colección: <prefix>aplicaciones)
// ====================================================================
interface AplicacionRow {
  id: string;
  nombre: string;
  desarrollador: string;
  version: string;
  categoria: string;
  plataforma: AppItem['platform'];
  clasificacion_edad?: string | null;
  descripcion?: string | null;
  imagen_url?: string | null;
  equipos_instalados?: number | null;
  estado?: 'Activa' | 'Inactiva' | null;
}

export async function getAplicacionesFromDB(): Promise<AppItem[]> {
  const rows = await directus.getItems<AplicacionRow>('aplicaciones', { sort: 'nombre' });
  return rows.map((r) => ({
    id: r.id,
    name: r.nombre,
    developer: r.desarrollador,
    version: r.version || '1.0',
    category: r.categoria,
    platform: r.plataforma || 'Meta Quest',
    ageRating: r.clasificacion_edad || 'Todas las edades',
    description: r.descripcion || '',
    imageUrl: r.imagen_url || undefined,
    devicesInstalled: Number(r.equipos_instalados ?? 1),
    status: r.estado || 'Activa',
  }));
}

export async function insertAplicacionInDB(app: AppItem): Promise<boolean> {
  const estadoVal: 'Activa' | 'Inactiva' =
    app.status === 'Inactiva' ? 'Inactiva' : 'Activa';
  await directus.upsertItem<AplicacionRow>('aplicaciones', app.id, {
    id: app.id,
    nombre: app.name,
    desarrollador: app.developer,
    version: app.version || '1.0',
    categoria: app.category,
    plataforma: app.platform || 'Meta Quest',
    clasificacion_edad: app.ageRating || 'Todas las edades',
    descripcion: app.description || '',
    imagen_url: app.imageUrl || null,
    equipos_instalados: Number(app.devicesInstalled ?? 1),
    estado: estadoVal,
  });
  return true;
}

export async function deleteAplicacionInDB(id: string): Promise<boolean> {
  await directus.deleteItem('aplicaciones', id);
  return true;
}

// ====================================================================
// 3. BITÁCORA DE USO (colección: <prefix>bitacora_uso)
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
  usuario_dependencia?: string | null;
  fecha_entrega: string;
  fecha_devolucion_estimada: string;
  fecha_devolucion_real?: string | null;
  estado_prestamo: BitacoraItem['estadoPrestamo'];
  condicion_entrega: BitacoraItem['condicionEntrega'];
  condicion_devolucion?: BitacoraItem['condicionDevolucion'] | null;
  accesorios_entregados: string;
  accesorios_devueltos?: string | null;
  observaciones_entrega?: string | null;
  observaciones_devolucion?: string | null;
  incidencia_generada?: boolean | null;
  admin_entrega: string;
  admin_recibe?: string | null;
  date_created?: string | null;
}

export async function getBitacoraFromDB(): Promise<BitacoraItem[]> {
  const rows = await directus.getItems<BitacoraRow>('bitacora_uso', {
    sort: '-fecha_entrega',
  });
  return rows.map((r) => ({
    id: r.id,
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
    createdAt: r.date_created || undefined,
  }));
}

export async function insertBitacoraEntregaInDB(
  item: BitacoraItem,
  reservaId?: string
): Promise<boolean> {
  await directus.createItem<BitacoraRow>('bitacora_uso', {
    id: item.id,
    equipo_id: item.equipoId,
    codigo_plai: item.codigoPlai,
    equipo_nombre: item.equipoNombre,
    usuario_nombre: item.usuarioNombre,
    usuario_email: item.usuarioEmail,
    usuario_dependencia: item.usuarioDependencia || null,
    fecha_entrega: toIsoTimestamp(item.fechaEntrega),
    fecha_devolucion_estimada: toIsoTimestamp(item.fechaDevolucionEstimada),
    estado_prestamo: item.estadoPrestamo || 'Activo',
    condicion_entrega: item.condicionEntrega || 'Excelente',
    accesorios_entregados: item.accesoriosEntregados || 'Equipo completo',
    observaciones_entrega: item.observacionesEntrega || null,
    incidencia_generada: false,
    admin_entrega: item.adminEntrega || 'Administrador PLAi',
  });

  // Sincronizar estado del equipo en Directus
  if (item.equipoId) {
    await directus.updateItem<EquipoRow>('equipos', item.equipoId, { estado: 'En uso' });
  }

  // Sincronizar reservación vinculada
  if (reservaId) {
    await directus.updateItem<ReservacionRow>('reservaciones', reservaId, {
      estado: 'En uso',
      codigo_plai_asignado: item.codigoPlai,
      equipo_id: item.equipoId,
    });
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
  const estadoPrestamo = devolucion.incidenciaGenerada ? 'Con Incidencia' : 'Devuelto';
  const updated = await directus.updateItem<BitacoraRow>('bitacora_uso', id, {
    fecha_devolucion_real: toIsoTimestamp(devolucion.fechaDevolucionReal),
    condicion_devolucion: devolucion.condicionDevolucion || null,
    accesorios_devueltos: devolucion.accesoriosDevueltos,
    observaciones_devolucion: devolucion.observacionesDevolucion || null,
    incidencia_generada: Boolean(devolucion.incidenciaGenerada),
    estado_prestamo: estadoPrestamo,
    admin_recibe: devolucion.adminRecibe,
  });

  if (updated?.equipo_id) {
    const nuevoEstadoEquipo: DeviceItem['status'] = devolucion.incidenciaGenerada
      ? 'En mantenimiento'
      : 'Disponible';
    await directus.updateItem<EquipoRow>('equipos', updated.equipo_id, {
      estado: nuevoEstadoEquipo,
    });

    // Completar reservaciones activas de ese equipo
    const activas = await directus.getItems<ReservacionRow>('reservaciones', {
      'filter[equipo_id][_eq]': updated.equipo_id,
      'filter[estado][_eq]': 'En uso',
    });
    for (const res of activas) {
      await directus.updateItem<ReservacionRow>('reservaciones', res.id, {
        estado: 'Completada',
      });
    }
  }

  return true;
}

// ====================================================================
// 4. RESERVACIONES (colección: <prefix>reservaciones)
// ====================================================================
export interface ReservacionItem {
  id: string;
  folio: string;
  categoriaId: string;
  equipoId?: string;
  codigoPlaiAsignado?: string;
  /** Identificador `sub` del usuario en Keycloak (texto sin FK local rota) */
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
  equipo_id?: string | null;
  codigo_plai_asignado?: string | null;
  usuario_keycloak_id?: string | null;
  usuario_nombre: string;
  usuario_email: string;
  usuario_telefono?: string | null;
  usuario_institucion?: string | null;
  fecha_uso: string;
  hora_inicio: string;
  hora_fin: string;
  actividad: string;
  estado: ReservacionItem['estado'];
  accesorios_incluidos?: string | null;
  condicion_salida?: string | null;
  observaciones_admin?: string | null;
  aprobado_por?: string | null;
  date_created?: string | null;
}

export async function getReservacionesFromDB(filterByEmail?: string): Promise<ReservacionItem[]> {
  const params: Record<string, string | number> = { sort: '-date_created' };
  if (filterByEmail) {
    params['filter[usuario_email][_icontains]'] = filterByEmail.trim().toLowerCase();
  }
  const rows = await directus.getItems<ReservacionRow>('reservaciones', params);
  const filtered = filterByEmail
    ? rows.filter(
        (r) => r.usuario_email.toLowerCase() === filterByEmail.trim().toLowerCase()
      )
    : rows;

  return filtered.map((r) => ({
    id: r.id,
    folio: r.folio,
    categoriaId: r.categoria_id,
    equipoId: r.equipo_id || undefined,
    codigoPlaiAsignado: r.codigo_plai_asignado || undefined,
    usuarioId: r.usuario_keycloak_id || undefined,
    usuarioNombre: r.usuario_nombre,
    usuarioEmail: r.usuario_email,
    usuarioTelefono: r.usuario_telefono || undefined,
    usuarioInstitucion: r.usuario_institucion || undefined,
    fechaUso: String(r.fecha_uso).split('T')[0],
    horaInicio: String(r.hora_inicio).slice(0, 5),
    horaFin: String(r.hora_fin).slice(0, 5),
    actividad: r.actividad,
    estado: r.estado,
    accesoriosIncluidos: r.accesorios_incluidos || undefined,
    condicionSalida: r.condicion_salida || undefined,
    observacionesAdmin: r.observaciones_admin || undefined,
    aprobadoPor: r.aprobado_por || undefined,
    createdAt: r.date_created || undefined,
  }));
}

export async function insertReservacionInDB(item: ReservacionItem): Promise<boolean> {
  await directus.createItem<ReservacionRow>('reservaciones', {
    id: item.id,
    folio: item.folio,
    categoria_id: item.categoriaId,
    equipo_id: item.equipoId || null,
    codigo_plai_asignado: item.codigoPlaiAsignado || null,
    usuario_keycloak_id: item.usuarioId || null,
    usuario_nombre: item.usuarioNombre,
    usuario_email: item.usuarioEmail.toLowerCase(),
    usuario_telefono: item.usuarioTelefono || null,
    usuario_institucion: item.usuarioInstitucion || null,
    fecha_uso: item.fechaUso,
    hora_inicio: item.horaInicio,
    hora_fin: item.horaFin,
    actividad: item.actividad,
    estado: item.estado || 'Pendiente',
    accesorios_incluidos: item.accesoriosIncluidos || null,
    condicion_salida: item.condicionSalida || 'Excelente',
    observaciones_admin: item.observacionesAdmin || null,
    aprobado_por: item.aprobadoPor || null,
  });
  return true;
}

export async function updateReservacionInDB(
  id: string,
  update: Partial<ReservacionItem>
): Promise<boolean> {
  const payload: Partial<ReservacionRow> = {};
  if (update.estado !== undefined) payload.estado = update.estado;
  if (update.equipoId !== undefined) payload.equipo_id = update.equipoId || null;
  if (update.codigoPlaiAsignado !== undefined)
    payload.codigo_plai_asignado = update.codigoPlaiAsignado || null;
  if (update.accesoriosIncluidos !== undefined)
    payload.accesorios_incluidos = update.accesoriosIncluidos;
  if (update.condicionSalida !== undefined) payload.condicion_salida = update.condicionSalida;
  if (update.observacionesAdmin !== undefined)
    payload.observaciones_admin = update.observacionesAdmin;
  if (update.aprobadoPor !== undefined) payload.aprobado_por = update.aprobadoPor;
  if (update.usuarioNombre !== undefined) payload.usuario_nombre = update.usuarioNombre;
  if (update.fechaUso !== undefined) payload.fecha_uso = update.fechaUso;
  if (update.horaInicio !== undefined) payload.hora_inicio = update.horaInicio;
  if (update.horaFin !== undefined) payload.hora_fin = update.horaFin;
  if (update.actividad !== undefined) payload.actividad = update.actividad;

  const updated = await directus.updateItem<ReservacionRow>('reservaciones', id, payload);

  const equipoId = update.equipoId || updated?.equipo_id;
  if (equipoId && update.estado) {
    if (update.estado === 'Aprobada') {
      await directus.updateItem<EquipoRow>('equipos', equipoId, { estado: 'Reservado' });
    } else if (update.estado === 'En uso') {
      await directus.updateItem<EquipoRow>('equipos', equipoId, { estado: 'En uso' });
    } else if (update.estado === 'Completada' || update.estado === 'Rechazada') {
      await directus.updateItem<EquipoRow>('equipos', equipoId, { estado: 'Disponible' });
    }
  }

  return true;
}

// ====================================================================
// 5. INCIDENCIAS DE MANTENIMIENTO (colección: <prefix>incidencias)
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
  fecha_reporte: string;
  fecha_resolucion?: string | null;
  acciones_realizadas?: string | null;
  date_created?: string | null;
}

export async function getIncidenciasFromDB(): Promise<IncidenciaItem[]> {
  const rows = await directus.getItems<IncidenciaRow>('incidencias', {
    sort: '-fecha_reporte',
  });
  return rows.map((r) => ({
    id: r.id,
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
    createdAt: r.date_created || undefined,
  }));
}

export async function insertIncidenciaInDB(incidencia: IncidenciaItem): Promise<boolean> {
  await directus.createItem<IncidenciaRow>('incidencias', {
    id: incidencia.id,
    folio: incidencia.folio,
    equipo_id: incidencia.equipoId,
    codigo_plai: incidencia.codigoPlai,
    equipo_nombre: incidencia.equipoNombre,
    origen: incidencia.origen,
    tipo_falla: incidencia.tipoFalla,
    severidad: incidencia.severidad,
    descripcion: incidencia.descripcion,
    estado: incidencia.estado || 'Reportada',
    tecnico_responsable: incidencia.tecnicoResponsable,
    fecha_reporte: toIsoTimestamp(incidencia.fechaReporte),
    fecha_resolucion: incidencia.fechaResolucion ? toIsoTimestamp(incidencia.fechaResolucion) : null,
    acciones_realizadas: incidencia.accionesRealizadas || null,
  });

  if (incidencia.equipoId) {
    await directus.updateItem<EquipoRow>('equipos', incidencia.equipoId, {
      estado: 'En mantenimiento',
    });
  }

  return true;
}

export async function updateIncidenciaStatusInDB(
  id: string,
  estado: IncidenciaItem['estado'],
  accionesRealizadas?: string
): Promise<boolean> {
  const fechaResolucion = estado === 'Resuelta' ? new Date().toISOString() : undefined;

  const payload: Partial<IncidenciaRow> = { estado };
  if (fechaResolucion) payload.fecha_resolucion = fechaResolucion;
  if (accionesRealizadas !== undefined) payload.acciones_realizadas = accionesRealizadas;

  const updated = await directus.updateItem<IncidenciaRow>('incidencias', id, payload);

  if (updated?.equipo_id) {
    const nuevoEstado: DeviceItem['status'] =
      estado === 'Resuelta' ? 'Disponible' : 'En mantenimiento';
    await directus.updateItem<EquipoRow>('equipos', updated.equipo_id, {
      estado: nuevoEstado,
    });
  }

  return true;
}

// ====================================================================
// 6. DIRECTORIO DE USUARIOS (colección: <prefix>usuarios — sin contraseñas; auth vive en Keycloak)
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

interface UsuarioRow {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'colaborador' | 'usuario';
  estado: 'Activo' | 'Inactivo';
  telefono?: string | null;
  dependencia?: string | null;
  ultimo_login?: string | null;
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

export async function getUsuariosFromDB(): Promise<UsuarioItem[]> {
  const [rows, reservaciones] = await Promise.all([
    directus.getItems<UsuarioRow>('usuarios', { sort: 'nombre' }),
    directus.getItems<ReservacionRow>('reservaciones'),
  ]);

  const countByEmail = new Map<string, number>();
  for (const r of reservaciones) {
    const key = r.usuario_email.toLowerCase();
    countByEmail.set(key, (countByEmail.get(key) || 0) + 1);
  }

  return rows.map((u) => ({
    id: u.id,
    name: u.nombre,
    email: u.email,
    role: mapDbRoleToLabel(u.rol),
    status: u.estado === 'Inactivo' ? 'Inactivo' : 'Activo',
    dependencia: u.dependencia || undefined,
    telefono: u.telefono || undefined,
    lastLogin: u.ultimo_login ? formatTimestamp(u.ultimo_login) : 'Administrado por Keycloak',
    reservations: countByEmail.get(u.email.toLowerCase()) || 0,
  }));
}

export async function upsertUsuarioInDB(user: UsuarioItem): Promise<UsuarioItem> {
  const dbRol = mapLabelToDbRole(user.role);
  await directus.upsertItem<UsuarioRow>('usuarios', user.id, {
    id: user.id,
    nombre: user.name,
    email: user.email.toLowerCase(),
    rol: dbRol,
    estado: user.status,
    telefono: user.telefono || null,
    dependencia: user.dependencia || 'Comunidad PLAi',
  });
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

/**
 * Sincroniza automáticamente un usuario autenticado por Keycloak en `<prefix>usuarios`.
 * - Si el usuario ya existe y está marcado como `Inactivo`, devuelve `{ allowed: false }`
 *   para bloquear su acceso al laboratorio.
 * - Si existe y está `Activo`, actualiza nombre, rol (desde Keycloak) y `ultimo_login`.
 * - Si no existe, lo registra automáticamente para que aparezca en el directorio operativo.
 */
export async function syncKeycloakUserInDB(params: {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'colaborador' | 'usuario';
}): Promise<{ allowed: boolean; status: 'Activo' | 'Inactivo' }> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const nowIso = new Date().toISOString();

  // Buscar por ID (sub de Keycloak) o por correo si fue pre-registrado manualmente
  let existing = await directus.getItemById<UsuarioRow>('usuarios', params.id);
  if (!existing) {
    const byEmail = await directus.getItems<UsuarioRow>('usuarios', {
      'filter[email][_eq]': normalizedEmail,
      limit: 1,
    });
    existing = byEmail[0] ?? null;
  }

  if (existing) {
    if (existing.estado === 'Inactivo') {
      return { allowed: false, status: 'Inactivo' };
    }
    await directus.updateItem<UsuarioRow>('usuarios', existing.id, {
      nombre: params.name,
      rol: params.role,
      ultimo_login: nowIso,
    });
    return { allowed: true, status: 'Activo' };
  }

  await directus.createItem<UsuarioRow>('usuarios', {
    id: params.id,
    nombre: params.name,
    email: normalizedEmail,
    rol: params.role,
    estado: 'Activo',
    dependencia: 'Comunidad PLAi',
    ultimo_login: nowIso,
  });

  return { allowed: true, status: 'Activo' };
}

/**
 * Verifica si un usuario autenticado sigue habilitado (`Activo`) en el directorio local.
 * Si un administrador lo marcó como `Inactivo`, revoca inmediatamente el acceso a las APIs.
 */
export async function isUsuarioActiveInDB(email: string, id?: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  if (id) {
    const byId = await directus.getItemById<UsuarioRow>('usuarios', id);
    if (byId) return byId.estado !== 'Inactivo';
  }
  const byEmail = await directus.getItems<UsuarioRow>('usuarios', {
    'filter[email][_eq]': normalizedEmail,
    limit: 1,
  });
  if (byEmail[0]) {
    return byEmail[0].estado !== 'Inactivo';
  }
  return true;
}

// ====================================================================
// 7. CURSOS Y AGENDA (colección: <prefix>cursos_agenda)
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
  fecha: string;
  hora: string;
  lugar: string;
  asistentes: number;
  estado: CursoAgendaItem['estado'];
  icon?: string | null;
  instructor: string;
  descripcion: string;
  solicitante_nombre?: string | null;
  solicitante_email?: string | null;
  institucion?: string | null;
}

export async function getCursosFromDB(): Promise<CursoAgendaItem[]> {
  const rows = await directus.getItems<CursoRow>('cursos_agenda', { sort: 'fecha' });
  return rows.map((r) => ({
    id: r.id,
    titulo: r.titulo,
    tipo: r.tipo,
    fecha: String(r.fecha).split('T')[0],
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
}

export async function insertCursoInDB(curso: CursoAgendaItem): Promise<CursoAgendaItem> {
  await directus.createItem<CursoRow>('cursos_agenda', {
    id: curso.id,
    titulo: curso.titulo,
    tipo: curso.tipo,
    fecha: curso.fecha,
    hora: curso.hora,
    lugar: curso.lugar,
    asistentes: curso.asistentes,
    estado: curso.estado,
    icon: curso.icon || '🎓',
    instructor: curso.instructor,
    descripcion: curso.descripcion,
    solicitante_nombre: curso.solicitanteNombre || null,
    solicitante_email: curso.solicitanteEmail || null,
    institucion: curso.institucion || null,
  });

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
// 8. CONFIGURACIÓN GENERAL DEL SISTEMA (colección: <prefix>configuracion)
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

interface ConfigRow {
  id: string;
  valor: SystemConfig;
}

export async function getSystemConfigFromDB(): Promise<SystemConfig> {
  const row = await directus.getItemById<ConfigRow>('configuracion', 'general');
  if (row?.valor) {
    return { ...initialSystemConfig, ...row.valor };
  }
  return { ...initialSystemConfig };
}

export async function saveSystemConfigInDB(cfg: SystemConfig): Promise<SystemConfig> {
  await directus.upsertItem<ConfigRow>('configuracion', 'general', {
    id: 'general',
    valor: cfg,
  });
  return cfg;
}
