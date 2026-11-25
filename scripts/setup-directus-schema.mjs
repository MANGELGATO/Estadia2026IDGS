#!/usr/bin/env node
/**
 * Script idempotente de aprovisionamiento de colecciones en Directus (admin.plai.mx).
 *
 * - Usa EXCLUSIVAMENTE la API oficial de Directus (/collections, /fields, /relations).
 * - NUNCA modifica tablas internas de Directus por SQL directo.
 * - Aplica el prefijo `DIRECTUS_COLLECTION_PREFIX` (default: `lab_recursos_`) para
 *   evitar cualquier colisión con colecciones de otras aplicaciones de PLAi.
 * - Si una colección ya existe, NO la sobrescribe.
 *
 * Uso:
 *   DIRECTUS_URL=https://AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_DIRECTUS_PLAI \
 *   DIRECTUS_TOKEN=TOKEN_ADMIN_DIRECTUS \
 *   pnpm directus:setup
 */

const DIRECTUS_URL = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '');
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';
const PREFIX = process.env.DIRECTUS_COLLECTION_PREFIX || 'lab_recursos_';

if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
  console.error(
    'ERROR: Debes definir DIRECTUS_URL y DIRECTUS_TOKEN (con permisos de administrador de esquema) antes de ejecutar este script.'
  );
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
};

async function api(method, path, body) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

const c = (name) => `${PREFIX}${name}`;

const COLLECTIONS = [
  {
    collection: c('categorias'),
    meta: { icon: 'category', note: 'Categorías tecnológicas del Laboratorio PLAi', color: '#1e5ca7' },
    schema: {},
    fields: [
      { field: 'id', type: 'string', schema: { is_primary_key: true, max_length: 64 }, meta: { interface: 'input', required: true } },
      { field: 'nombre', type: 'string', schema: { max_length: 100, is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'descripcion', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'color', type: 'string', schema: { max_length: 20, default_value: '#0086ff' }, meta: { interface: 'select-color' } },
      { field: 'plai_usage', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'video_url', type: 'string', schema: { max_length: 255 }, meta: { interface: 'input' } },
      { field: 'beneficios', type: 'json', meta: { interface: 'tags' } },
      { field: 'casos_exito', type: 'json', meta: { interface: 'input-code', options: { language: 'json' } } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], readonly: true, hidden: true } },
      { field: 'date_updated', type: 'timestamp', meta: { special: ['date-updated'], readonly: true, hidden: true } },
    ],
  },
  {
    collection: c('equipos'),
    meta: { icon: 'devices', note: 'Inventario patrimonial de equipos de laboratorio PLAi', display_template: '{{nombre}} ({{codigo_plai}})', color: '#0086ff' },
    schema: {},
    fields: [
      { field: 'id', type: 'string', schema: { is_primary_key: true, max_length: 64 }, meta: { interface: 'input', required: true } },
      { field: 'categoria_id', type: 'string', schema: { max_length: 64, is_nullable: false }, meta: { interface: 'select-dropdown-m2o', required: true } },
      { field: 'nombre', type: 'string', schema: { max_length: 150, is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'marca', type: 'string', schema: { max_length: 100 }, meta: { interface: 'input' } },
      { field: 'modelo', type: 'string', schema: { max_length: 100 }, meta: { interface: 'input' } },
      { field: 'almacenamiento', type: 'string', schema: { max_length: 80, default_value: 'N/A' }, meta: { interface: 'input' } },
      { field: 'numero_serie', type: 'string', schema: { max_length: 100 }, meta: { interface: 'input' } },
      { field: 'codigo_plai', type: 'string', schema: { max_length: 80, is_unique: true, is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'estado', type: 'string', schema: { max_length: 30, default_value: 'Disponible' }, meta: { interface: 'select-dropdown' } },
      { field: 'ubicacion', type: 'string', schema: { max_length: 150 }, meta: { interface: 'input' } },
      { field: 'especificaciones', type: 'json', meta: { interface: 'tags' } },
      { field: 'accesorios', type: 'json', meta: { interface: 'tags' } },
      { field: 'imagen_emoji', type: 'string', schema: { max_length: 20, default_value: '📦' }, meta: { interface: 'input' } },
      { field: 'imagen_url', type: 'string', schema: { max_length: 255 }, meta: { interface: 'input' } },
      { field: 'responsable', type: 'string', schema: { max_length: 120 }, meta: { interface: 'input' } },
      { field: 'observaciones', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], readonly: true, hidden: true } },
      { field: 'date_updated', type: 'timestamp', meta: { special: ['date-updated'], readonly: true, hidden: true } },
    ],
  },
  {
    collection: c('aplicaciones'),
    meta: { icon: 'apps', note: 'Software y experiencias inmersivas instaladas en equipos PLAi', color: '#0ea5e9' },
    schema: {},
    fields: [
      { field: 'id', type: 'string', schema: { is_primary_key: true, max_length: 64 }, meta: { interface: 'input', required: true } },
      { field: 'nombre', type: 'string', schema: { max_length: 150, is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'desarrollador', type: 'string', schema: { max_length: 120 }, meta: { interface: 'input' } },
      { field: 'version', type: 'string', schema: { max_length: 50, default_value: '1.0' }, meta: { interface: 'input' } },
      { field: 'categoria', type: 'string', schema: { max_length: 60 }, meta: { interface: 'input' } },
      { field: 'plataforma', type: 'string', schema: { max_length: 30, default_value: 'Meta Quest' }, meta: { interface: 'select-dropdown' } },
      { field: 'clasificacion_edad', type: 'string', schema: { max_length: 40, default_value: 'Todas las edades' }, meta: { interface: 'input' } },
      { field: 'descripcion', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'imagen_url', type: 'string', schema: { max_length: 255 }, meta: { interface: 'input' } },
      { field: 'equipos_instalados', type: 'integer', schema: { default_value: 1 }, meta: { interface: 'input' } },
      { field: 'estado', type: 'string', schema: { max_length: 20, default_value: 'Activa' }, meta: { interface: 'select-dropdown' } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], readonly: true, hidden: true } },
      { field: 'date_updated', type: 'timestamp', meta: { special: ['date-updated'], readonly: true, hidden: true } },
    ],
  },
  {
    collection: c('espacios'),
    meta: { icon: 'meeting_room', note: 'Aulas, laboratorios y auditorios disponibles en PLAi', color: '#10b981' },
    schema: {},
    fields: [
      { field: 'id', type: 'string', schema: { is_primary_key: true, max_length: 64 }, meta: { interface: 'input', required: true } },
      { field: 'nombre', type: 'string', schema: { max_length: 120, is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'tipo', type: 'string', schema: { max_length: 80 }, meta: { interface: 'input' } },
      { field: 'capacidad', type: 'integer', meta: { interface: 'input' } },
      { field: 'ubicacion', type: 'string', schema: { max_length: 150 }, meta: { interface: 'input' } },
      { field: 'descripcion', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'caracteristicas', type: 'json', meta: { interface: 'tags' } },
      { field: 'color', type: 'string', schema: { max_length: 20 }, meta: { interface: 'select-color' } },
      { field: 'estado', type: 'string', schema: { max_length: 25, default_value: 'Disponible' }, meta: { interface: 'select-dropdown' } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], readonly: true, hidden: true } },
    ],
  },
  {
    collection: c('reservaciones'),
    meta: { icon: 'event_available', note: 'Reservaciones de equipos, espacios y visitas PLAi', display_template: '{{folio}} - {{usuario_nombre}}', color: '#ed8d1b' },
    schema: {},
    fields: [
      { field: 'id', type: 'string', schema: { is_primary_key: true, max_length: 64 }, meta: { interface: 'input', required: true } },
      { field: 'folio', type: 'string', schema: { max_length: 40, is_unique: true, is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'categoria_id', type: 'string', schema: { max_length: 64 }, meta: { interface: 'select-dropdown-m2o' } },
      { field: 'equipo_id', type: 'string', schema: { max_length: 64 }, meta: { interface: 'select-dropdown-m2o' } },
      { field: 'codigo_plai_asignado', type: 'string', schema: { max_length: 80 }, meta: { interface: 'input' } },
      { field: 'usuario_keycloak_id', type: 'string', schema: { max_length: 128 }, meta: { interface: 'input', note: 'Claim sub del usuario en Keycloak (sin FK local)' } },
      { field: 'usuario_nombre', type: 'string', schema: { max_length: 120, is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'usuario_email', type: 'string', schema: { max_length: 150, is_nullable: false }, meta: { interface: 'input', required: true } },
      { field: 'usuario_telefono', type: 'string', schema: { max_length: 30 }, meta: { interface: 'input' } },
      { field: 'usuario_institucion', type: 'string', schema: { max_length: 150 }, meta: { interface: 'input' } },
      { field: 'fecha_uso', type: 'date', meta: { interface: 'datetime', required: true } },
      { field: 'hora_inicio', type: 'string', schema: { max_length: 10 }, meta: { interface: 'input', required: true } },
      { field: 'hora_fin', type: 'string', schema: { max_length: 10 }, meta: { interface: 'input', required: true } },
      { field: 'actividad', type: 'text', meta: { interface: 'input-multiline', required: true } },
      { field: 'estado', type: 'string', schema: { max_length: 25, default_value: 'Pendiente' }, meta: { interface: 'select-dropdown' } },
      { field: 'accesorios_incluidos', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'condicion_salida', type: 'string', schema: { max_length: 50, default_value: 'Excelente' }, meta: { interface: 'input' } },
      { field: 'observaciones_admin', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'aprobado_por', type: 'string', schema: { max_length: 120 }, meta: { interface: 'input' } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], readonly: true, hidden: true } },
      { field: 'date_updated', type: 'timestamp', meta: { special: ['date-updated'], readonly: true, hidden: true } },
    ],
  },
  {
    collection: c('bitacora_uso'),
    meta: { icon: 'assignment_turned_in', note: 'Bitácora de entregas y devoluciones físicas de equipo', color: '#f59e0b' },
    schema: {},
    fields: [
      { field: 'id', type: 'string', schema: { is_primary_key: true, max_length: 64 }, meta: { interface: 'input', required: true } },
      { field: 'equipo_id', type: 'string', schema: { max_length: 64 }, meta: { interface: 'select-dropdown-m2o' } },
      { field: 'codigo_plai', type: 'string', schema: { max_length: 80 }, meta: { interface: 'input' } },
      { field: 'equipo_nombre', type: 'string', schema: { max_length: 150 }, meta: { interface: 'input' } },
      { field: 'usuario_nombre', type: 'string', schema: { max_length: 120 }, meta: { interface: 'input' } },
      { field: 'usuario_email', type: 'string', schema: { max_length: 150 }, meta: { interface: 'input' } },
      { field: 'usuario_dependencia', type: 'string', schema: { max_length: 150 }, meta: { interface: 'input' } },
      { field: 'fecha_entrega', type: 'string', schema: { max_length: 40 }, meta: { interface: 'input' } },
      { field: 'fecha_devolucion_estimada', type: 'string', schema: { max_length: 40 }, meta: { interface: 'input' } },
      { field: 'fecha_devolucion_real', type: 'string', schema: { max_length: 40 }, meta: { interface: 'input' } },
      { field: 'estado_prestamo', type: 'string', schema: { max_length: 25, default_value: 'Activo' }, meta: { interface: 'select-dropdown' } },
      { field: 'condicion_entrega', type: 'string', schema: { max_length: 25, default_value: 'Excelente' }, meta: { interface: 'select-dropdown' } },
      { field: 'condicion_devolucion', type: 'string', schema: { max_length: 25 }, meta: { interface: 'select-dropdown' } },
      { field: 'accesorios_entregados', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'accesorios_devueltos', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'observaciones_entrega', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'observaciones_devolucion', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'incidencia_generada', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean' } },
      { field: 'admin_entrega', type: 'string', schema: { max_length: 120 }, meta: { interface: 'input' } },
      { field: 'admin_recibe', type: 'string', schema: { max_length: 120 }, meta: { interface: 'input' } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], readonly: true, hidden: true } },
    ],
  },
  {
    collection: c('incidencias'),
    meta: { icon: 'build', note: 'Incidencias técnicas y mantenimiento de equipos', color: '#ef4444' },
    schema: {},
    fields: [
      { field: 'id', type: 'string', schema: { is_primary_key: true, max_length: 64 }, meta: { interface: 'input', required: true } },
      { field: 'folio', type: 'string', schema: { max_length: 40, is_unique: true }, meta: { interface: 'input', required: true } },
      { field: 'equipo_id', type: 'string', schema: { max_length: 64 }, meta: { interface: 'select-dropdown-m2o' } },
      { field: 'codigo_plai', type: 'string', schema: { max_length: 80 }, meta: { interface: 'input' } },
      { field: 'equipo_nombre', type: 'string', schema: { max_length: 150 }, meta: { interface: 'input' } },
      { field: 'origen', type: 'string', schema: { max_length: 40 }, meta: { interface: 'select-dropdown' } },
      { field: 'tipo_falla', type: 'string', schema: { max_length: 40 }, meta: { interface: 'select-dropdown' } },
      { field: 'severidad', type: 'string', schema: { max_length: 20, default_value: 'Media' }, meta: { interface: 'select-dropdown' } },
      { field: 'descripcion', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'estado', type: 'string', schema: { max_length: 30, default_value: 'Reportada' }, meta: { interface: 'select-dropdown' } },
      { field: 'tecnico_responsable', type: 'string', schema: { max_length: 120 }, meta: { interface: 'input' } },
      { field: 'fecha_reporte', type: 'string', schema: { max_length: 40 }, meta: { interface: 'input' } },
      { field: 'fecha_resolucion', type: 'string', schema: { max_length: 40 }, meta: { interface: 'input' } },
      { field: 'acciones_realizadas', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], readonly: true, hidden: true } },
    ],
  },
  {
    collection: c('cursos_agenda'),
    meta: { icon: 'school', note: 'Agenda de talleres, cursos y recorridos PLAi', color: '#8b5cf6' },
    schema: {},
    fields: [
      { field: 'id', type: 'string', schema: { is_primary_key: true, max_length: 64 }, meta: { interface: 'input', required: true } },
      { field: 'titulo', type: 'string', schema: { max_length: 200 }, meta: { interface: 'input', required: true } },
      { field: 'tipo', type: 'string', schema: { max_length: 100 }, meta: { interface: 'input' } },
      { field: 'fecha', type: 'date', meta: { interface: 'datetime' } },
      { field: 'hora', type: 'string', schema: { max_length: 40 }, meta: { interface: 'input' } },
      { field: 'lugar', type: 'string', schema: { max_length: 180 }, meta: { interface: 'input' } },
      { field: 'asistentes', type: 'integer', schema: { default_value: 1 }, meta: { interface: 'input' } },
      { field: 'estado', type: 'string', schema: { max_length: 25, default_value: 'En revisión' }, meta: { interface: 'select-dropdown' } },
      { field: 'icon', type: 'string', schema: { max_length: 20, default_value: '🎓' }, meta: { interface: 'input' } },
      { field: 'instructor', type: 'string', schema: { max_length: 120 }, meta: { interface: 'input' } },
      { field: 'descripcion', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'solicitante_nombre', type: 'string', schema: { max_length: 120 }, meta: { interface: 'input' } },
      { field: 'solicitante_email', type: 'string', schema: { max_length: 150 }, meta: { interface: 'input' } },
      { field: 'institucion', type: 'string', schema: { max_length: 150 }, meta: { interface: 'input' } },
      { field: 'date_created', type: 'timestamp', meta: { special: ['date-created'], readonly: true, hidden: true } },
    ],
  },
  {
    collection: c('usuarios'),
    meta: { icon: 'people', note: 'Directorio operativo de perfiles (autenticación administrada por Keycloak)', color: '#64748b' },
    schema: {},
    fields: [
      { field: 'id', type: 'string', schema: { is_primary_key: true, max_length: 64 }, meta: { interface: 'input', required: true } },
      { field: 'nombre', type: 'string', schema: { max_length: 120 }, meta: { interface: 'input', required: true } },
      { field: 'email', type: 'string', schema: { max_length: 150, is_unique: true }, meta: { interface: 'input', required: true } },
      { field: 'rol', type: 'string', schema: { max_length: 20, default_value: 'usuario' }, meta: { interface: 'select-dropdown' } },
      { field: 'estado', type: 'string', schema: { max_length: 20, default_value: 'Activo' }, meta: { interface: 'select-dropdown' } },
      { field: 'telefono', type: 'string', schema: { max_length: 30 }, meta: { interface: 'input' } },
      { field: 'dependencia', type: 'string', schema: { max_length: 150 }, meta: { interface: 'input' } },
      { field: 'ultimo_login', type: 'timestamp', meta: { interface: 'datetime' } },
    ],
  },
  {
    collection: c('configuracion'),
    meta: { icon: 'settings', note: 'Parámetros operativos generales del laboratorio', color: '#475569' },
    schema: {},
    fields: [
      { field: 'id', type: 'string', schema: { is_primary_key: true, max_length: 64 }, meta: { interface: 'input', required: true } },
      { field: 'valor', type: 'json', meta: { interface: 'input-code', options: { language: 'json' } } },
      { field: 'date_updated', type: 'timestamp', meta: { special: ['date-updated'], readonly: true, hidden: true } },
    ],
  },
];

const RELATIONS = [
  { collection: c('equipos'), field: 'categoria_id', related_collection: c('categorias') },
  { collection: c('reservaciones'), field: 'categoria_id', related_collection: c('categorias') },
  { collection: c('reservaciones'), field: 'equipo_id', related_collection: c('equipos') },
  { collection: c('bitacora_uso'), field: 'equipo_id', related_collection: c('equipos') },
  { collection: c('incidencias'), field: 'equipo_id', related_collection: c('equipos') },
];

async function main() {
  console.log(`Aprovisionando colecciones con prefijo "${PREFIX}" en ${DIRECTUS_URL} vía API oficial...`);

  for (const col of COLLECTIONS) {
    const check = await api('GET', `/collections/${encodeURIComponent(col.collection)}`);
    if (check.ok) {
      console.log(`  [OMITIDA] La colección "${col.collection}" ya existe (no se modifica).`);
      continue;
    }

    const created = await api('POST', '/collections', col);
    if (!created.ok) {
      console.error(`  [ERROR] No se pudo crear "${col.collection}" (HTTP ${created.status}):`, JSON.stringify(created.json));
      process.exit(1);
    }
    console.log(`  [CREADA]  Colección "${col.collection}" registrada en Directus.`);
  }

  for (const rel of RELATIONS) {
    const check = await api(
      'GET',
      `/relations/${encodeURIComponent(rel.collection)}/${encodeURIComponent(rel.field)}`
    );
    if (check.ok) {
      console.log(`  [OMITIDA] Relación ${rel.collection}.${rel.field} -> ${rel.related_collection} ya existe.`);
      continue;
    }

    const created = await api('POST', '/relations', rel);
    if (!created.ok) {
      console.warn(`  [AVISO] No se pudo crear relación ${rel.collection}.${rel.field} (HTTP ${created.status})`);
    } else {
      console.log(`  [CREADA]  Relación ${rel.collection}.${rel.field} -> ${rel.related_collection}`);
    }
  }

  console.log('Aprovisionamiento en Directus finalizado correctamente.');
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
