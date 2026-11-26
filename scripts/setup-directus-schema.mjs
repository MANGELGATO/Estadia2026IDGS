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
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CLI_ARGS = process.argv.slice(2);
function getArgValue(flag) {
  const idx = CLI_ARGS.indexOf(flag);
  return idx >= 0 && CLI_ARGS[idx + 1] ? CLI_ARGS[idx + 1] : '';
}

const DIRECTUS_URL = (process.env.DIRECTUS_URL || '').replace(/\/+$/, '');
const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || '';
const PREFIX = process.env.DIRECTUS_COLLECTION_PREFIX || 'lab_recursos_';
const SERVICE_ROLE_NAME = process.env.DIRECTUS_SERVICE_ROLE || `${PREFIX}service`;
const SERVICE_POLICY_NAME = process.env.DIRECTUS_SERVICE_POLICY || `${PREFIX}service_policy`;
const SERVICE_USER_EMAIL = process.env.DIRECTUS_SERVICE_EMAIL || 'svc-lab-recursos@plai.mx';
const MEDIA_FOLDER_NAME = (process.env.DIRECTUS_MEDIA_FOLDER || 'lab_recursos').trim();
const SKIP_SERVICE_ACCOUNT = process.env.SKIP_SERVICE_ACCOUNT === 'true';
const ROTATE_TOKEN =
  CLI_ARGS.includes('--rotate-token') || process.env.ROTATE_SERVICE_TOKEN === 'true';
const TOKEN_OUT_FILE =
  getArgValue('--token-out') ||
  process.env.SERVICE_TOKEN_OUT_FILE ||
  path.join(os.tmpdir(), 'plai-recursos-directus-service-token.tmp');

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

// Colecciones donde la app realmente ejecuta deleteItem (mínimo privilegio)
const DELETABLE_COLLECTIONS = new Set([c('equipos'), c('aplicaciones')]);

function assertOk(res, context) {
  if (!res.ok) {
    console.error(
      `  [ERROR] Falló ${context} (HTTP ${res.status}):`,
      JSON.stringify(res.json)
    );
    process.exit(1);
  }
}

function writeTokenSecurely(token) {
  const dir = path.dirname(TOKEN_OUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
  fs.writeFileSync(TOKEN_OUT_FILE, token, { encoding: 'utf8', mode: 0o600 });
  try {
    fs.chmodSync(TOKEN_OUT_FILE, 0o600);
  } catch {
    // En Windows NTFS chmod puede no aplicar igual que POSIX
  }
}

async function verifyServiceToken(token, expectedFolderId) {
  const testCollection = c('equipos');
  const res = await fetch(`${DIRECTUS_URL}/items/${encodeURIComponent(testCollection)}?limit=1`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    console.error(
      `  [ERROR] Prueba de humo falló: el token de servicio recibió HTTP ${res.status} al leer ${testCollection}.`
    );
    console.error('          Verifica el vínculo en directus_access (rol <-> policy) y permisos.');
    process.exit(1);
  }
  console.log(`  [VERIFY]  Token de servicio verificado: GET /items/${testCollection} -> HTTP 200 OK.`);

  if (expectedFolderId) {
    const filesRes = await fetch(`${DIRECTUS_URL}/files?fields=id,folder&limit=10`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!filesRes.ok) {
      console.error(
        `  [ERROR] Prueba de humo falló: GET /files recibió HTTP ${filesRes.status} con el token de servicio.`
      );
      process.exit(1);
    }
    const filesJson = await filesRes.json().catch(() => null);
    const leaked = (filesJson?.data || []).filter((f) => f.folder !== expectedFolderId);
    if (leaked.length > 0) {
      console.error(
        `  [ERROR] Fallo de aislamiento: el token de servicio pudo ver ${leaked.length} archivo(s) fuera de la carpeta "${MEDIA_FOLDER_NAME}" (${expectedFolderId}).`
      );
      process.exit(1);
    }
    console.log(
      `  [VERIFY]  Aislamiento de archivos verificado: GET /files solo expone la carpeta "${MEDIA_FOLDER_NAME}" (${expectedFolderId}).`
    );
  }
}

async function provisionServiceAccount() {
  console.log(`\nConfigurando cuenta de servicio con permisos mínimos (${SERVICE_ROLE_NAME})...`);

  // 1. Rol de servicio
  const roleCheck = await api(
    'GET',
    `/roles?filter[name][_eq]=${encodeURIComponent(SERVICE_ROLE_NAME)}&limit=1`
  );
  assertOk(roleCheck, `GET /roles (${SERVICE_ROLE_NAME})`);

  let roleId = roleCheck.json?.data?.[0]?.id;
  if (!roleId) {
    const roleCreated = await api('POST', '/roles', {
      name: SERVICE_ROLE_NAME,
      description: `Rol de servicio mínimo para ${PREFIX}* (sin acceso administrativo ni app Directus)`,
    });
    assertOk(roleCreated, `POST /roles (${SERVICE_ROLE_NAME})`);
    roleId = roleCreated.json?.data?.id;
    console.log(`  [ROL]     Creado rol "${SERVICE_ROLE_NAME}" (${roleId})`);
  } else {
    console.log(`  [ROL]     Rol "${SERVICE_ROLE_NAME}" ya existe (${roleId})`);
  }

  // 2. Policy de permisos mínimos (Directus 11 Access Policies)
  // IMPORTANTE: En Directus 11, el vínculo rol <-> policy se almacena en la tabla intermedia
  // `directus_access` mediante el endpoint `/access` (NO pasando `roles: [roleId]` en /policies).
  const policyCheck = await api(
    'GET',
    `/policies?filter[name][_eq]=${encodeURIComponent(SERVICE_POLICY_NAME)}&limit=1`
  );
  assertOk(policyCheck, `GET /policies (${SERVICE_POLICY_NAME})`);

  const existingPolicy = policyCheck.json?.data?.[0];
  let policyId = existingPolicy?.id;
  if (!policyId) {
    const policyCreated = await api('POST', '/policies', {
      name: SERVICE_POLICY_NAME,
      description: `Acceso mínimo restringido exclusivamente a colecciones ${PREFIX}*`,
      app_access: false,
      admin_access: false,
    });
    assertOk(policyCreated, `POST /policies (${SERVICE_POLICY_NAME})`);
    policyId = policyCreated.json?.data?.id;
    console.log(`  [POLICY]  Creada policy "${SERVICE_POLICY_NAME}" (${policyId})`);
  } else if (existingPolicy.app_access !== false || existingPolicy.admin_access !== false) {
    const policyPatched = await api('PATCH', `/policies/${encodeURIComponent(policyId)}`, {
      app_access: false,
      admin_access: false,
    });
    assertOk(policyPatched, `PATCH /policies/${policyId} (restaurar app_access=false, admin_access=false)`);
    console.log(
      `  [POLICY]  Policy "${SERVICE_POLICY_NAME}" (${policyId}) endurecida: app_access=false, admin_access=false.`
    );
  } else {
    console.log(
      `  [POLICY]  Policy "${SERVICE_POLICY_NAME}" ya existe (${policyId}) con app_access=false y admin_access=false.`
    );
  }

  // 2.1 Vínculo explícito rol <-> policy en directus_access (/access)
  const accessCheck = await api(
    'GET',
    `/access?filter[role][_eq]=${encodeURIComponent(roleId)}&filter[policy][_eq]=${encodeURIComponent(policyId)}&limit=1`
  );
  assertOk(accessCheck, 'GET /access (verificación de vínculo rol <-> policy)');

  const existingAccess = accessCheck.json?.data?.[0];
  if (!existingAccess) {
    const accessCreated = await api('POST', '/access', {
      role: roleId,
      policy: policyId,
    });
    assertOk(accessCreated, 'POST /access (vincular rol con policy en directus_access)');
    console.log(`  [ACCESS]  Vínculo rol (${roleId}) <-> policy (${policyId}) creado en directus_access.`);
  } else {
    console.log(`  [ACCESS]  Vínculo rol <-> policy ya existe (${existingAccess.id}).`);
  }

  // 3. Permisos de mínimo privilegio exclusivamente sobre las colecciones <prefix>*
  //    Solo `equipos` y `aplicaciones` reciben `delete`; el resto recibe `create`, `read`, `update`.
  const existingPermsRes = await api(
    'GET',
    `/permissions?filter[policy][_eq]=${encodeURIComponent(policyId)}&limit=-1`
  );
  assertOk(existingPermsRes, 'GET /permissions');

  const existingPermsList = existingPermsRes.json?.data || [];
  const existingPermsMap = new Map(
    existingPermsList.map((p) => [`${p.collection}:${p.action}`, p])
  );

  let permsCreated = 0;
  let permsRevoked = 0;
  for (const col of COLLECTIONS) {
    const allowedActions = DELETABLE_COLLECTIONS.has(col.collection)
      ? ['create', 'read', 'update', 'delete']
      : ['create', 'read', 'update'];

    for (const action of allowedActions) {
      const key = `${col.collection}:${action}`;
      if (existingPermsMap.has(key)) continue;

      const permRes = await api('POST', '/permissions', {
        policy: policyId,
        collection: col.collection,
        action,
        fields: ['*'],
      });
      assertOk(permRes, `POST /permissions (${key})`);
      permsCreated += 1;
    }

    // Revocar permiso `delete` sobrante en colecciones donde la app nunca borra registros
    if (!DELETABLE_COLLECTIONS.has(col.collection)) {
      const excessDelete = existingPermsMap.get(`${col.collection}:delete`);
      if (excessDelete?.id) {
        const delRes = await api('DELETE', `/permissions/${encodeURIComponent(excessDelete.id)}`);
        assertOk(delRes, `DELETE /permissions/${excessDelete.id} (revocar delete innecesario)`);
        permsRevoked += 1;
      }
    }
  }

  // 3.1 Carpeta exclusiva de medios en Directus (`directus_folders`) para aislar archivos del ecosistema compartido
  const folderCheck = await api(
    'GET',
    `/folders?filter[name][_eq]=${encodeURIComponent(MEDIA_FOLDER_NAME)}&filter[parent][_null]=true&limit=1`
  );
  assertOk(folderCheck, `GET /folders (${MEDIA_FOLDER_NAME})`);

  let mediaFolderId = folderCheck.json?.data?.[0]?.id;
  if (!mediaFolderId) {
    const folderCreated = await api('POST', '/folders', {
      name: MEDIA_FOLDER_NAME,
    });
    assertOk(folderCreated, `POST /folders (${MEDIA_FOLDER_NAME})`);
    mediaFolderId = folderCreated.json?.data?.id;
    console.log(`  [FOLDER]  Creada carpeta exclusiva de medios "${MEDIA_FOLDER_NAME}" (${mediaFolderId}).`);
  } else {
    console.log(`  [FOLDER]  Carpeta exclusiva de medios "${MEDIA_FOLDER_NAME}" ya existe (${mediaFolderId}).`);
  }

  // 3.2 Permisos estrictamente aislados sobre `directus_folders` y `directus_files` (solo carpeta `mediaFolderId`)
  //     Si ya existían permisos previos sin filtro, se actualizan con PATCH para cerrar cualquier exposición.
  const folderFilter = { folder: { _eq: mediaFolderId } };
  const scopedMediaPerms = [
    {
      collection: 'directus_folders',
      action: 'read',
      payload: {
        policy: policyId,
        collection: 'directus_folders',
        action: 'read',
        fields: ['id', 'name'],
        permissions: { id: { _eq: mediaFolderId } },
      },
    },
    {
      collection: 'directus_files',
      action: 'read',
      payload: {
        policy: policyId,
        collection: 'directus_files',
        action: 'read',
        fields: ['*'],
        permissions: folderFilter,
      },
    },
    {
      collection: 'directus_files',
      action: 'create',
      payload: {
        policy: policyId,
        collection: 'directus_files',
        action: 'create',
        fields: ['*'],
        validation: folderFilter,
        presets: { folder: mediaFolderId },
      },
    },
    {
      collection: 'directus_files',
      action: 'delete',
      payload: {
        policy: policyId,
        collection: 'directus_files',
        action: 'delete',
        permissions: folderFilter,
      },
    },
  ];

  let permsUpdated = 0;
  for (const spec of scopedMediaPerms) {
    const key = `${spec.collection}:${spec.action}`;
    const existingPerm = existingPermsMap.get(key);
    if (!existingPerm) {
      const permRes = await api('POST', '/permissions', spec.payload);
      assertOk(permRes, `POST /permissions (${key})`);
      permsCreated += 1;
    } else {
      const patchRes = await api(
        'PATCH',
        `/permissions/${encodeURIComponent(existingPerm.id)}`,
        spec.payload
      );
      assertOk(patchRes, `PATCH /permissions/${existingPerm.id} (${key} con filtro de carpeta)`);
      permsUpdated += 1;
    }
  }

  console.log(
    `  [PERMS]   Permisos mínimos verificados para ${COLLECTIONS.length} colecciones + medios aislados en "${MEDIA_FOLDER_NAME}" (${permsCreated} nuevos, ${permsUpdated} reforzados, ${permsRevoked} revocados).`
  );
  console.log(`  [ENV]     Opcional en docker-compose.yml: DIRECTUS_MEDIA_FOLDER_ID=${mediaFolderId}`);

  // 4. Usuario de servicio dedicado (verifica rol/estado y soporta rotación con --rotate-token)
  const userCheck = await api(
    'GET',
    `/users?filter[email][_eq]=${encodeURIComponent(SERVICE_USER_EMAIL)}&limit=1`
  );
  assertOk(userCheck, `GET /users (${SERVICE_USER_EMAIL})`);

  const existingUser = userCheck.json?.data?.[0];
  let activeServiceToken = null;

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
    assertOk(userCreated, `POST /users (${SERVICE_USER_EMAIL})`);
    activeServiceToken = generatedToken;
    writeTokenSecurely(generatedToken);
    console.log(`  [USER]    Usuario de servicio creado: ${SERVICE_USER_EMAIL}`);
    console.log(`  [TOKEN]   Token guardado con permisos 0600 en: ${TOKEN_OUT_FILE}`);
    console.log('            Crea el Docker secret sin imprimirlo en consola y luego elimina el archivo:');
    console.log(`            docker secret create plai_recursos_directus_token "${TOKEN_OUT_FILE}" && shred -u "${TOKEN_OUT_FILE}"`);
  } else {
    const patchBody = {};
    if (existingUser.role !== roleId) patchBody.role = roleId;
    if (existingUser.status !== 'active') patchBody.status = 'active';
    if (ROTATE_TOKEN) {
      activeServiceToken = crypto.randomBytes(32).toString('base64url');
      patchBody.token = activeServiceToken;
    }

    if (Object.keys(patchBody).length > 0) {
      const patched = await api('PATCH', `/users/${encodeURIComponent(existingUser.id)}`, patchBody);
      assertOk(patched, `PATCH /users/${existingUser.id}`);
      if (activeServiceToken) {
        writeTokenSecurely(activeServiceToken);
        console.log(`  [USER]    Usuario "${SERVICE_USER_EMAIL}" verificado y token ROTADO.`);
        console.log(`  [TOKEN]   Nuevo token guardado con permisos 0600 en: ${TOKEN_OUT_FILE}`);
        console.log('            Actualiza el Docker secret y elimina el archivo temporal con shred -u.');
      } else {
        console.log(`  [USER]    Usuario "${SERVICE_USER_EMAIL}" reparado (rol/estado verificados).`);
      }
    } else {
      console.log(
        `  [USER]    Usuario "${SERVICE_USER_EMAIL}" ya existe con rol y estado correctos (usa --rotate-token para rotar su token).`
      );
    }
  }

  // 5. Prueba de humo contra la API con el token generado/rotado (o VERIFY_SERVICE_TOKEN si se provee)
  const tokenToVerify = activeServiceToken || process.env.VERIFY_SERVICE_TOKEN || '';
  if (tokenToVerify) {
    await verifyServiceToken(tokenToVerify, mediaFolderId);
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
