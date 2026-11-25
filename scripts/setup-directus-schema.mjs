#!/usr/bin/env node
/**
 * Script idempotente de aprovisionamiento en Directus 11 (admin.plai.mx).
 *
 * Qué hace (100% vía API oficial de Directus, sin SQL directo):
 * 1. Exige `DIRECTUS_ADMIN_TOKEN` (separado de `DIRECTUS_TOKEN` de la app).
 * 2. Crea colecciones con prefijo `DIRECTUS_COLLECTION_PREFIX` (default: `lab_recursos_`).
 * 3. Si una colección ya existe, agrega campos faltantes y sincroniza `choices` en listas.
 * 4. Usa tipos reales `timestamp` en fechas de `bitacora_uso` e `incidencias`.
 * 5. Crea relaciones y ABORTA con código 1 si alguna relación falla.
 * 6. Aprovisiona automáticamente Rol + Policy + Permisos CRUD mínimos + Usuario de servicio
 *    exclusivamente sobre las 10 colecciones `<prefix>*` (Directus 11 Access Policies).
 *
 * Uso:
 *   DIRECTUS_URL=https://admin.plai.mx \
 *   DIRECTUS_ADMIN_TOKEN=<TOKEN_ADMIN_TEMPORAL> \
 *   pnpm directus:setup
 */

import crypto from 'node:crypto';

const DIRECTUS_URL = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '');
const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || '';
const PREFIX = process.env.DIRECTUS_COLLECTION_PREFIX || 'lab_recursos_';
const SERVICE_ROLE_NAME = process.env.DIRECTUS_SERVICE_ROLE || `${PREFIX}service`;
const SERVICE_POLICY_NAME = process.env.DIRECTUS_SERVICE_POLICY || `${PREFIX}service_policy`;
const SERVICE_USER_EMAIL = process.env.DIRECTUS_SERVICE_EMAIL || 'svc-lab-recursos@plai.mx';
const SKIP_SERVICE_ACCOUNT = process.env.SKIP_SERVICE_ACCOUNT === 'true';

if (!DIRECTUS_URL || !DIRECTUS_ADMIN_TOKEN) {
  console.error(
    'ERROR: Debes definir DIRECTUS_URL y DIRECTUS_ADMIN_TOKEN (token temporal de administrador de Directus).'
  );
  console.error(
    'IMPORTANTE: No reutilices DIRECTUS_ADMIN_TOKEN como DIRECTUS_TOKEN de la aplicación en producción.'
  );
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}`,
};

async function api(method, path, body) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
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

function dropdownChoices(values) {
  return {
    choices: values.map((v) => ({ text: v, value: v })),
  };
}

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
      {
        field: 'estado',
        type: 'string',
        schema: { max_length: 30, default_value: 'Disponible' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices([
            'Disponible',
            'Reservado',
            'En uso',
            'En mantenimiento',
            'Fuera de servicio',
            'No disponible',
          ]),
        },
      },
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
      {
        field: 'plataforma',
        type: 'string',
        schema: { max_length: 30, default_value: 'Meta Quest' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices(['Meta Quest', 'PC', 'Meta Quest + PC']),
        },
      },
      { field: 'clasificacion_edad', type: 'string', schema: { max_length: 40, default_value: 'Todas las edades' }, meta: { interface: 'input' } },
      { field: 'descripcion', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'imagen_url', type: 'string', schema: { max_length: 255 }, meta: { interface: 'input' } },
      { field: 'equipos_instalados', type: 'integer', schema: { default_value: 1 }, meta: { interface: 'input' } },
      {
        field: 'estado',
        type: 'string',
        schema: { max_length: 20, default_value: 'Activa' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices(['Activa', 'Inactiva']),
        },
      },
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
      {
        field: 'estado',
        type: 'string',
        schema: { max_length: 25, default_value: 'Disponible' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices(['Disponible', 'Ocupado', 'Mantenimiento']),
        },
      },
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
      {
        field: 'estado',
        type: 'string',
        schema: { max_length: 25, default_value: 'Pendiente' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices(['Pendiente', 'Aprobada', 'Rechazada', 'En uso', 'Completada']),
        },
      },
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
      { field: 'fecha_entrega', type: 'timestamp', meta: { interface: 'datetime', required: true } },
      { field: 'fecha_devolucion_estimada', type: 'timestamp', meta: { interface: 'datetime', required: true } },
      { field: 'fecha_devolucion_real', type: 'timestamp', meta: { interface: 'datetime' } },
      {
        field: 'estado_prestamo',
        type: 'string',
        schema: { max_length: 25, default_value: 'Activo' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices(['Activo', 'Devuelto', 'Con Incidencia']),
        },
      },
      {
        field: 'condicion_entrega',
        type: 'string',
        schema: { max_length: 25, default_value: 'Excelente' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices(['Excelente', 'Bueno', 'Regular']),
        },
      },
      {
        field: 'condicion_devolucion',
        type: 'string',
        schema: { max_length: 25 },
        meta: {
          interface: 'select-dropdown',
          options: dropdownChoices(['Excelente', 'Bueno', 'Observación', 'En revisión', 'Dañado']),
        },
      },
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
      {
        field: 'origen',
        type: 'string',
        schema: { max_length: 40, default_value: 'Devolución de Préstamo' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices([
            'Devolución de Préstamo',
            'Revisión Periódica',
            'Reporte de Usuario',
            'Falla Operativa',
          ]),
        },
      },
      {
        field: 'tipo_falla',
        type: 'string',
        schema: { max_length: 40 },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices([
            'Hardware',
            'Software',
            'Calibración',
            'Daño Físico',
            'Accesorio Faltante',
            'Limpieza y Óptica',
          ]),
        },
      },
      {
        field: 'severidad',
        type: 'string',
        schema: { max_length: 20, default_value: 'Media' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices(['Baja', 'Media', 'Alta', 'Crítica']),
        },
      },
      { field: 'descripcion', type: 'text', meta: { interface: 'input-multiline' } },
      {
        field: 'estado',
        type: 'string',
        schema: { max_length: 30, default_value: 'Reportada' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices([
            'Reportada',
            'En diagnóstico',
            'En reparación',
            'Esperando piezas',
            'Resuelta',
          ]),
        },
      },
      { field: 'tecnico_responsable', type: 'string', schema: { max_length: 120 }, meta: { interface: 'input' } },
      { field: 'fecha_reporte', type: 'timestamp', meta: { interface: 'datetime', required: true } },
      { field: 'fecha_resolucion', type: 'timestamp', meta: { interface: 'datetime' } },
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
      {
        field: 'estado',
        type: 'string',
        schema: { max_length: 25, default_value: 'En revisión' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices(['Confirmado', 'En revisión', 'Finalizado']),
        },
      },
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
      {
        field: 'rol',
        type: 'string',
        schema: { max_length: 20, default_value: 'usuario' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices(['admin', 'colaborador', 'usuario']),
        },
      },
      {
        field: 'estado',
        type: 'string',
        schema: { max_length: 20, default_value: 'Activo' },
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: dropdownChoices(['Activo', 'Inactivo']),
        },
      },
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

async function syncMissingFields(col) {
  const existingRes = await api('GET', `/fields/${encodeURIComponent(col.collection)}`);
  if (!existingRes.ok) {
    console.error(`  [ERROR] No se pudieron leer campos de "${col.collection}" (HTTP ${existingRes.status}).`);
    process.exit(1);
  }
  const existingFields = new Map(
    (existingRes.json?.data || []).map((f) => [f.field, f])
  );

  for (const fieldDef of col.fields) {
    const existing = existingFields.get(fieldDef.field);
    if (!existing) {
      const created = await api('POST', `/fields/${encodeURIComponent(col.collection)}`, fieldDef);
      if (!created.ok) {
        console.error(
          `  [ERROR] No se pudo agregar campo "${col.collection}.${fieldDef.field}" (HTTP ${created.status}):`,
          JSON.stringify(created.json)
        );
        process.exit(1);
      }
      console.log(`    [CAMPO+]  ${col.collection}.${fieldDef.field}`);
      continue;
    }

    // Si es un campo select-dropdown y carece de opciones `choices`, actualizar metadatos
    if (fieldDef.meta?.options?.choices && !existing.meta?.options?.choices) {
      const patched = await api(
        'PATCH',
        `/fields/${encodeURIComponent(col.collection)}/${encodeURIComponent(fieldDef.field)}`,
        { meta: { ...existing.meta, options: fieldDef.meta.options } }
      );
      if (!patched.ok) {
        console.error(
          `  [ERROR] No se pudieron actualizar opciones de "${col.collection}.${fieldDef.field}" (HTTP ${patched.status}).`
        );
        process.exit(1);
      }
      console.log(`    [CHOICES] ${col.collection}.${fieldDef.field} actualizado`);
    }
  }
}

async function provisionServiceAccount() {
  console.log(`\nConfigurando cuenta de servicio con permisos mínimos (${SERVICE_ROLE_NAME})...`);

  // 1. Rol de servicio
  const roleCheck = await api(
    'GET',
    `/roles?filter[name][_eq]=${encodeURIComponent(SERVICE_ROLE_NAME)}&limit=1`
  );
  let roleId = roleCheck.json?.data?.[0]?.id;
  if (!roleId) {
    const roleCreated = await api('POST', '/roles', {
      name: SERVICE_ROLE_NAME,
      description: `Rol de servicio mínimo para ${PREFIX}* (sin acceso administrativo ni app Directus)`,
    });
    if (!roleCreated.ok) {
      console.error(`  [ERROR] No se pudo crear el rol "${SERVICE_ROLE_NAME}" (HTTP ${roleCreated.status}):`, JSON.stringify(roleCreated.json));
      process.exit(1);
    }
    roleId = roleCreated.json?.data?.id;
    console.log(`  [ROL]     Creado rol "${SERVICE_ROLE_NAME}" (${roleId})`);
  } else {
    console.log(`  [ROL]     Rol "${SERVICE_ROLE_NAME}" ya existe (${roleId})`);
  }

  // 2. Policy de permisos mínimos (Directus 11 Access Policies)
  const policyCheck = await api(
    'GET',
    `/policies?filter[name][_eq]=${encodeURIComponent(SERVICE_POLICY_NAME)}&limit=1`
  );
  let policyId = policyCheck.json?.data?.[0]?.id;
  if (!policyId) {
    const policyCreated = await api('POST', '/policies', {
      name: SERVICE_POLICY_NAME,
      description: `Acceso CRUD restringido exclusivamente a colecciones ${PREFIX}*`,
      app_access: false,
      admin_access: false,
      roles: [roleId],
    });
    if (!policyCreated.ok) {
      console.error(`  [ERROR] No se pudo crear la policy "${SERVICE_POLICY_NAME}" (HTTP ${policyCreated.status}):`, JSON.stringify(policyCreated.json));
      process.exit(1);
    }
    policyId = policyCreated.json?.data?.id;
    console.log(`  [POLICY]  Creada policy "${SERVICE_POLICY_NAME}" (${policyId})`);
  } else {
    console.log(`  [POLICY]  Policy "${SERVICE_POLICY_NAME}" ya existe (${policyId})`);
  }

  // 3. Permisos CRUD exclusivamente sobre las 10 colecciones <prefix>*
  const actions = ['create', 'read', 'update', 'delete'];
  const existingPermsRes = await api(
    'GET',
    `/permissions?filter[policy][_eq]=${encodeURIComponent(policyId)}&limit=-1`
  );
  const existingPerms = new Set(
    (existingPermsRes.json?.data || []).map((p) => `${p.collection}:${p.action}`)
  );

  let permsCreated = 0;
  for (const col of COLLECTIONS) {
    for (const action of actions) {
      const key = `${col.collection}:${action}`;
      if (existingPerms.has(key)) continue;

      const permRes = await api('POST', '/permissions', {
        policy: policyId,
        collection: col.collection,
        action,
        fields: ['*'],
      });
      if (!permRes.ok) {
        console.error(
          `  [ERROR] No se pudo crear permiso ${key} (HTTP ${permRes.status}):`,
          JSON.stringify(permRes.json)
        );
        process.exit(1);
      }
      permsCreated += 1;
    }
  }
  console.log(`  [PERMS]   Permisos verificados para ${COLLECTIONS.length} colecciones (${permsCreated} nuevos).`);

  // 4. Usuario de servicio dedicado
  const userCheck = await api(
    'GET',
    `/users?filter[email][_eq]=${encodeURIComponent(SERVICE_USER_EMAIL)}&limit=1`
  );
  const existingUser = userCheck.json?.data?.[0];
  if (!existingUser) {
    const generatedToken = crypto.randomBytes(32).toString('base64url');
    const userCreated = await api('POST', '/users', {
      first_name: 'Servicio',
      last_name: 'PLAi Recursos',
      email: SERVICE_USER_EMAIL,
      role: roleId,
      status: 'active',
      token: generatedToken,
    });
    if (!userCreated.ok) {
      console.error(
        `  [ERROR] No se pudo crear usuario de servicio "${SERVICE_USER_EMAIL}" (HTTP ${userCreated.status}):`,
        JSON.stringify(userCreated.json)
      );
      process.exit(1);
    }
    console.log(`  [USER]    Usuario de servicio creado: ${SERVICE_USER_EMAIL}`);
    console.log('  [TOKEN]   Guarda el siguiente token en el Docker secret `plai_recursos_directus_token` (no se volverá a mostrar):');
    console.log(`            ${generatedToken}`);
  } else {
    console.log(`  [USER]    Usuario de servicio "${SERVICE_USER_EMAIL}" ya existe (token conservado).`);
  }
}

async function main() {
  console.log(`Aprovisionando colecciones con prefijo "${PREFIX}" en ${DIRECTUS_URL} vía API oficial de Directus 11...`);

  for (const col of COLLECTIONS) {
    const check = await api('GET', `/collections/${encodeURIComponent(col.collection)}`);
    if (check.ok) {
      console.log(`  [EXISTE]  Colección "${col.collection}" encontrada; verificando campos faltantes y opciones...`);
      await syncMissingFields(col);
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
      console.error(
        `  [ERROR] No se pudo crear relación ${rel.collection}.${rel.field} -> ${rel.related_collection} (HTTP ${created.status}):`,
        JSON.stringify(created.json)
      );
      process.exit(1);
    }
    console.log(`  [CREADA]  Relación ${rel.collection}.${rel.field} -> ${rel.related_collection}`);
  }

  if (!SKIP_SERVICE_ACCOUNT) {
    await provisionServiceAccount();
  }

  console.log('\nAprovisionamiento en Directus finalizado correctamente.');
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
