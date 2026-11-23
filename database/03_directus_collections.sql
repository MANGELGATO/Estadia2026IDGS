-- ============================================================================
-- PLATAFORMA ABIERTA DE INNOVACIÓN Y DESARROLLO DE JALISCO (PLAi)
-- SISTEMA DE GESTIÓN DE RECURSOS, LABORATORIOS Y ESPACIOS
-- Migración 03: Compatibilidad y Registro de Colecciones en Directus (admin.plai.mx)
-- ============================================================================
-- Script idempotente y seguro:
--   1. Agrega columnas de auditoría y ordenamiento que Directus requiere
--      (date_created, user_created, date_updated, user_updated, sort).
--   2. Registra las colecciones en las tablas del sistema de Directus
--      (directus_collections, directus_fields, directus_relations) para que
--      aparezcan y se administren automáticamente desde https://admin.plai.mx.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. ADAPTACIÓN DE TABLAS DE LA APLICACIÓN AL ESTÁNDAR DIRECTUS
-- ----------------------------------------------------------------------------

-- Categorías
ALTER TABLE IF EXISTS categorias
  ADD COLUMN IF NOT EXISTS sort INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_created VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_created TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS user_updated VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_updated TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Equipos
ALTER TABLE IF EXISTS equipos
  ADD COLUMN IF NOT EXISTS sort INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_created VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_created TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS user_updated VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_updated TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Aplicaciones
ALTER TABLE IF EXISTS aplicaciones
  ADD COLUMN IF NOT EXISTS sort INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_created VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_created TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS user_updated VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_updated TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Espacios
ALTER TABLE IF EXISTS espacios
  ADD COLUMN IF NOT EXISTS sort INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_created VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_created TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS user_updated VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_updated TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Reservaciones
ALTER TABLE IF EXISTS reservaciones
  ADD COLUMN IF NOT EXISTS sort INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_created VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_created TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS user_updated VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_updated TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Bitácora de uso
ALTER TABLE IF EXISTS bitacora_uso
  ADD COLUMN IF NOT EXISTS sort INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_created VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_created TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS user_updated VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_updated TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Incidencias de mantenimiento
ALTER TABLE IF EXISTS incidencias_mantenimiento
  ADD COLUMN IF NOT EXISTS sort INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_created VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_created TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS user_updated VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_updated TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Cursos / Agenda
ALTER TABLE IF EXISTS cursos_agenda
  ADD COLUMN IF NOT EXISTS sort INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_created VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_created TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS user_updated VARCHAR(64),
  ADD COLUMN IF NOT EXISTS date_updated TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- ----------------------------------------------------------------------------
-- 2. TABLAS DE SISTEMA DIRECTUS (CREACIÓN DEFENSIVA SI NO EXISTEN)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS directus_collections (
  collection VARCHAR(64) PRIMARY KEY,
  icon VARCHAR(64),
  note TEXT,
  display_template VARCHAR(255),
  hidden BOOLEAN DEFAULT FALSE,
  singleton BOOLEAN DEFAULT FALSE,
  translations JSON,
  archive_field VARCHAR(64),
  archive_app_filter BOOLEAN DEFAULT TRUE,
  archive_value VARCHAR(255),
  unarchive_value VARCHAR(255),
  sort_field VARCHAR(64),
  accountability VARCHAR(64) DEFAULT 'all',
  color VARCHAR(255),
  item_duplication_fields JSON,
  sort INTEGER,
  group_name VARCHAR(64),
  collapse VARCHAR(64) DEFAULT 'open',
  preview_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS directus_fields (
  id SERIAL PRIMARY KEY,
  collection VARCHAR(64) NOT NULL,
  field VARCHAR(64) NOT NULL,
  special VARCHAR(64),
  interface VARCHAR(64),
  options JSON,
  display VARCHAR(64),
  display_options JSON,
  readonly BOOLEAN DEFAULT FALSE,
  hidden BOOLEAN DEFAULT FALSE,
  sort INTEGER,
  width VARCHAR(30) DEFAULT 'full',
  translations JSON,
  note TEXT,
  conditions JSON,
  required BOOLEAN DEFAULT FALSE,
  group_name VARCHAR(64),
  validation JSON,
  validation_message TEXT,
  UNIQUE(collection, field)
);

CREATE TABLE IF NOT EXISTS directus_relations (
  id SERIAL PRIMARY KEY,
  many_collection VARCHAR(64) NOT NULL,
  many_field VARCHAR(64) NOT NULL,
  one_collection VARCHAR(64),
  one_field VARCHAR(64),
  one_collection_field VARCHAR(64),
  one_allowed_collections TEXT,
  junction_field VARCHAR(64),
  sort_field VARCHAR(64),
  one_deselect_action VARCHAR(64) DEFAULT 'nullify'
);

-- ----------------------------------------------------------------------------
-- 3. REGISTRO DE COLECCIONES DE PLAi EN DIRECTUS
-- ----------------------------------------------------------------------------
INSERT INTO directus_collections (collection, icon, note, display_template, sort_field, color) VALUES
  ('categorias', 'category', 'Familias tecnológicas y áreas del Laboratorio PLAi', '{{nombre}}', 'sort', '#1e5ca7'),
  ('equipos', 'devices', 'Inventario patrimonial de equipos de alta tecnología PLAi', '{{nombre}} ({{codigo_plai}})', 'sort', '#0086ff'),
  ('aplicaciones', 'apps', 'Software, licencias y experiencias inmersivas VR/PC', '{{nombre}} (v{{version}})', 'sort', '#0ea5e9'),
  ('espacios', 'meeting_room', 'Aulas, laboratorios y auditorios de innovación', '{{nombre}} (Cap. {{capacidad}})', 'sort', '#10b981'),
  ('reservaciones', 'event_available', 'Solicitudes de préstamo de equipos y espacios', 'Folio: {{folio}} - {{usuario_nombre}}', 'created_at', '#ed8d1b'),
  ('bitacora_uso', 'assignment_turned_in', 'Bitácora física de entregas y devoluciones de equipos', '{{codigo_plai}} - {{usuario_nombre}} ({{estado_prestamo}})', 'fecha_entrega', '#f59e0b'),
  ('incidencias_mantenimiento', 'build', 'Reportes de fallas técnicas y seguimiento de mantenimiento', 'Folio: {{folio}} - {{codigo_plai}} ({{estado}})', 'fecha_reporte', '#ef4444'),
  ('cursos_agenda', 'school', 'Agenda de talleres, recorridos y capacitaciones', '{{titulo}} - {{fecha}}', 'fecha', '#8b5cf6'),
  ('configuracion_sistema', 'settings', 'Parámetros y horarios operativos del laboratorio', 'Clave: {{clave}}', 'clave', '#64748b')
ON CONFLICT (collection) DO UPDATE SET
  note = EXCLUDED.note,
  display_template = EXCLUDED.display_template,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- ----------------------------------------------------------------------------
-- 4. REGISTRO DE CAMPOS CLAVE EN DIRECTUS_FIELDS
-- ----------------------------------------------------------------------------
INSERT INTO directus_fields (collection, field, interface, display, width, required, note) VALUES
  -- Equipos
  ('equipos', 'id', 'input', 'formatted-value', 'half', true, 'Identificador único del equipo'),
  ('equipos', 'nombre', 'input', 'raw-value', 'half', true, 'Nombre comercial del equipo'),
  ('equipos', 'codigo_plai', 'input', 'raw-value', 'half', true, 'Código de inventario oficial PLAi'),
  ('equipos', 'categoria_id', 'select-dropdown-m2o', 'related-values', 'half', true, 'Categoría tecnológica'),
  ('equipos', 'estado', 'select-dropdown', 'labels', 'half', true, 'Estado operativo del activo'),
  ('equipos', 'marca', 'input', 'raw-value', 'half', true, 'Marca del fabricante'),
  ('equipos', 'modelo', 'input', 'raw-value', 'half', true, 'Modelo exacto'),
  ('equipos', 'numero_serie', 'input', 'raw-value', 'half', true, 'Número de serie de fábrica'),
  ('equipos', 'ubicacion', 'input', 'raw-value', 'full', true, 'Ubicación física en Torre C CCD'),
  ('equipos', 'especificaciones', 'tags', 'raw-value', 'full', false, 'Ficha técnica / características'),
  ('equipos', 'accesorios', 'tags', 'raw-value', 'full', false, 'Accesorios incluidos'),

  -- Reservaciones
  ('reservaciones', 'folio', 'input', 'raw-value', 'half', true, 'Folio oficial de solicitud'),
  ('reservaciones', 'estado', 'select-dropdown', 'labels', 'half', true, 'Estado de la reservación'),
  ('reservaciones', 'usuario_nombre', 'input', 'raw-value', 'half', true, 'Nombre completo del solicitante'),
  ('reservaciones', 'usuario_email', 'input', 'raw-value', 'half', true, 'Correo institucional o personal'),
  ('reservaciones', 'fecha_uso', 'datetime', 'datetime', 'half', true, 'Fecha de uso programada'),
  ('reservaciones', 'hora_inicio', 'input', 'raw-value', 'half', true, 'Hora de inicio (HH:MM)'),
  ('reservaciones', 'hora_fin', 'input', 'raw-value', 'half', true, 'Hora de término (HH:MM)'),
  ('reservaciones', 'actividad', 'textarea', 'raw-value', 'full', true, 'Descripción del proyecto o actividad')
ON CONFLICT (collection, field) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. REGISTRO DE RELACIONES EN DIRECTUS_RELATIONS
-- ----------------------------------------------------------------------------
INSERT INTO directus_relations (many_collection, many_field, one_collection, one_field) VALUES
  ('equipos', 'categoria_id', 'categorias', 'equipos'),
  ('reservaciones', 'categoria_id', 'categorias', 'reservaciones'),
  ('reservaciones', 'equipo_id', 'equipos', 'reservaciones'),
  ('bitacora_uso', 'equipo_id', 'equipos', 'bitacoras'),
  ('incidencias_mantenimiento', 'equipo_id', 'equipos', 'incidencias')
ON CONFLICT DO NOTHING;

COMMIT;
