-- ============================================================================
-- PLATAFORMA ABIERTA DE INNOVACIÓN Y DESARROLLO DE JALISCO (PLAi)
-- SISTEMA DE GESTIÓN DE RECURSOS, LABORATORIOS Y ESPACIOS
-- Migración 01: Esquema completo compatible con PostgreSQL 15/16 y Neon
-- ============================================================================
-- Script idempotente y seguro para ejecución repetida:
--   * No ejecuta DROP TABLE ni elimina registros existentes.
--   * Compatible con PostgreSQL 15/16 (Estándar Tecnológico PLAi v1.0) y Neon.
-- ============================================================================

BEGIN;

-- Función utilitaria para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. TABLA: usuarios
-- Gestión de usuarios y control de acceso basado en roles (RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(64) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario'
    CHECK (rol IN ('admin', 'colaborador', 'usuario')),
  estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
    CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
  telefono VARCHAR(30),
  dependencia VARCHAR(150) DEFAULT 'Comunidad PLAi',
  ultimo_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email_lower ON usuarios (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios (rol);

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. TABLA: categorias
-- Familias tecnológicas y contenido administrable de categorías
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id VARCHAR(64) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#0086ff',
  plai_usage TEXT NOT NULL DEFAULT '',
  video_url VARCHAR(255) NOT NULL DEFAULT '',
  beneficios JSONB NOT NULL DEFAULT '[]'::jsonb,
  casos_exito JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_categorias_updated_at ON categorias;
CREATE TRIGGER trg_categorias_updated_at
  BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. TABLA: equipos
-- Inventario patrimonial de dispositivos tecnológicos de PLAi
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipos (
  id VARCHAR(64) PRIMARY KEY,
  categoria_id VARCHAR(64) NOT NULL REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  nombre VARCHAR(150) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  almacenamiento VARCHAR(80) DEFAULT 'N/A',
  numero_serie VARCHAR(100) NOT NULL,
  codigo_plai VARCHAR(80) NOT NULL UNIQUE,
  estado VARCHAR(30) NOT NULL DEFAULT 'Disponible'
    CHECK (estado IN ('Disponible', 'Reservado', 'En uso', 'En mantenimiento', 'Fuera de servicio', 'No disponible')),
  ubicacion VARCHAR(150) NOT NULL DEFAULT 'Laboratorio de Innovación PLAi',
  especificaciones JSONB NOT NULL DEFAULT '[]'::jsonb,
  accesorios JSONB NOT NULL DEFAULT '[]'::jsonb,
  imagen_emoji VARCHAR(20) DEFAULT '📦',
  imagen_url VARCHAR(255),
  responsable VARCHAR(120) DEFAULT 'Laboratorio de Innovación PLAi',
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipos_categoria ON equipos (categoria_id);
CREATE INDEX IF NOT EXISTS idx_equipos_estado ON equipos (estado);
CREATE INDEX IF NOT EXISTS idx_equipos_codigo_lower ON equipos (LOWER(codigo_plai));

DROP TRIGGER IF EXISTS trg_equipos_updated_at ON equipos;
CREATE TRIGGER trg_equipos_updated_at
  BEFORE UPDATE ON equipos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. TABLA: aplicaciones
-- Software, licencias y experiencias inmersivas instaladas en equipos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aplicaciones (
  id VARCHAR(64) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  desarrollador VARCHAR(120) NOT NULL,
  version VARCHAR(50) NOT NULL DEFAULT '1.0',
  categoria VARCHAR(60) NOT NULL,
  plataforma VARCHAR(30) NOT NULL DEFAULT 'Meta Quest'
    CHECK (plataforma IN ('Meta Quest', 'PC', 'Meta Quest + PC')),
  clasificacion_edad VARCHAR(40) NOT NULL DEFAULT 'Todas las edades',
  descripcion TEXT NOT NULL DEFAULT '',
  imagen_url VARCHAR(255),
  equipos_instalados INTEGER NOT NULL DEFAULT 1 CHECK (equipos_instalados >= 0),
  estado VARCHAR(20) NOT NULL DEFAULT 'Activa'
    CHECK (estado IN ('Activa', 'Inactiva')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aplicaciones_categoria ON aplicaciones (categoria);
CREATE INDEX IF NOT EXISTS idx_aplicaciones_plataforma ON aplicaciones (plataforma);

DROP TRIGGER IF EXISTS trg_aplicaciones_updated_at ON aplicaciones;
CREATE TRIGGER trg_aplicaciones_updated_at
  BEFORE UPDATE ON aplicaciones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. TABLA: espacios
-- Aulas, laboratorios y auditorios disponibles en PLAi
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS espacios (
  id VARCHAR(64) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  tipo VARCHAR(80) NOT NULL DEFAULT 'Sala / Laboratorio',
  capacidad INTEGER NOT NULL CHECK (capacidad > 0),
  ubicacion VARCHAR(150) NOT NULL DEFAULT 'Torre C, Ciudad Creativa Digital, Guadalajara',
  descripcion TEXT NOT NULL,
  caracteristicas JSONB NOT NULL DEFAULT '[]'::jsonb,
  color VARCHAR(20) NOT NULL DEFAULT '#0086ff',
  estado VARCHAR(25) NOT NULL DEFAULT 'Disponible'
    CHECK (estado IN ('Disponible', 'Ocupado', 'Mantenimiento')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_espacios_updated_at ON espacios;
CREATE TRIGGER trg_espacios_updated_at
  BEFORE UPDATE ON espacios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. TABLA: reservaciones
-- Solicitudes de préstamo de equipos, impresión 3D, espacios y visitas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservaciones (
  id VARCHAR(64) PRIMARY KEY,
  folio VARCHAR(40) NOT NULL UNIQUE,
  categoria_id VARCHAR(64) NOT NULL REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  equipo_id VARCHAR(64) REFERENCES equipos(id) ON UPDATE CASCADE ON DELETE SET NULL,
  codigo_plai_asignado VARCHAR(80),
  usuario_id VARCHAR(64) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
  usuario_nombre VARCHAR(120) NOT NULL,
  usuario_email VARCHAR(150) NOT NULL,
  usuario_telefono VARCHAR(30),
  usuario_institucion VARCHAR(150),
  fecha_uso DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  actividad TEXT NOT NULL,
  estado VARCHAR(25) NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada', 'En uso', 'Completada')),
  accesorios_incluidos TEXT,
  condicion_salida VARCHAR(50) DEFAULT 'Excelente',
  observaciones_admin TEXT,
  aprobado_por VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservaciones_categoria ON reservaciones (categoria_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_fecha ON reservaciones (fecha_uso);
CREATE INDEX IF NOT EXISTS idx_reservaciones_estado ON reservaciones (estado);
CREATE INDEX IF NOT EXISTS idx_reservaciones_email_lower ON reservaciones (LOWER(usuario_email));

DROP TRIGGER IF EXISTS trg_reservaciones_updated_at ON reservaciones;
CREATE TRIGGER trg_reservaciones_updated_at
  BEFORE UPDATE ON reservaciones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. TABLA: bitacora_uso
-- Registro físico de entregas y devoluciones de equipamiento
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bitacora_uso (
  id VARCHAR(64) PRIMARY KEY,
  equipo_id VARCHAR(64) NOT NULL REFERENCES equipos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  codigo_plai VARCHAR(80) NOT NULL,
  equipo_nombre VARCHAR(150) NOT NULL,
  usuario_nombre VARCHAR(120) NOT NULL,
  usuario_email VARCHAR(150) NOT NULL,
  usuario_dependencia VARCHAR(150),
  fecha_entrega TIMESTAMP NOT NULL,
  fecha_devolucion_estimada TIMESTAMP NOT NULL,
  fecha_devolucion_real TIMESTAMP,
  estado_prestamo VARCHAR(25) NOT NULL DEFAULT 'Activo'
    CHECK (estado_prestamo IN ('Activo', 'Devuelto', 'Con Incidencia')),
  condicion_entrega VARCHAR(25) NOT NULL DEFAULT 'Excelente'
    CHECK (condicion_entrega IN ('Excelente', 'Bueno', 'Regular')),
  condicion_devolucion VARCHAR(25)
    CHECK (condicion_devolucion IS NULL OR condicion_devolucion IN ('Excelente', 'Bueno', 'Observación', 'En revisión', 'Dañado')),
  accesorios_entregados TEXT NOT NULL,
  accesorios_devueltos TEXT,
  observaciones_entrega TEXT,
  observaciones_devolucion TEXT,
  incidencia_generada BOOLEAN NOT NULL DEFAULT FALSE,
  admin_entrega VARCHAR(120) NOT NULL,
  admin_recibe VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bitacora_equipo ON bitacora_uso (equipo_id);
CREATE INDEX IF NOT EXISTS idx_bitacora_codigo ON bitacora_uso (codigo_plai);
CREATE INDEX IF NOT EXISTS idx_bitacora_estado ON bitacora_uso (estado_prestamo);

-- ----------------------------------------------------------------------------
-- 8. TABLA: incidencias_mantenimiento
-- Reportes técnicos, diagnósticos y seguimiento de reparaciones
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidencias_mantenimiento (
  id VARCHAR(64) PRIMARY KEY,
  folio VARCHAR(40) NOT NULL UNIQUE,
  equipo_id VARCHAR(64) NOT NULL REFERENCES equipos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  codigo_plai VARCHAR(80) NOT NULL,
  equipo_nombre VARCHAR(150) NOT NULL,
  origen VARCHAR(40) NOT NULL DEFAULT 'Devolución de Préstamo'
    CHECK (origen IN ('Devolución de Préstamo', 'Revisión Periódica', 'Reporte de Usuario', 'Falla Operativa')),
  tipo_falla VARCHAR(40) NOT NULL
    CHECK (tipo_falla IN ('Hardware', 'Software', 'Calibración', 'Daño Físico', 'Accesorio Faltante', 'Limpieza y Óptica')),
  severidad VARCHAR(20) NOT NULL DEFAULT 'Media'
    CHECK (severidad IN ('Baja', 'Media', 'Alta', 'Crítica')),
  descripcion TEXT NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Reportada'
    CHECK (estado IN ('Reportada', 'En diagnóstico', 'En reparación', 'Esperando piezas', 'Resuelta')),
  tecnico_responsable VARCHAR(120) NOT NULL,
  fecha_reporte TIMESTAMP NOT NULL,
  fecha_resolucion TIMESTAMP,
  acciones_realizadas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidencias_codigo ON incidencias_mantenimiento (codigo_plai);
CREATE INDEX IF NOT EXISTS idx_incidencias_estado ON incidencias_mantenimiento (estado);

DROP TRIGGER IF EXISTS trg_incidencias_updated_at ON incidencias_mantenimiento;
CREATE TRIGGER trg_incidencias_updated_at
  BEFORE UPDATE ON incidencias_mantenimiento
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 9. TABLA: cursos_agenda
-- Agenda de talleres, recorridos académicos y sesiones empresariales
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cursos_agenda (
  id VARCHAR(64) PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  hora VARCHAR(40) NOT NULL,
  lugar VARCHAR(180) NOT NULL,
  asistentes INTEGER NOT NULL DEFAULT 1 CHECK (asistentes > 0),
  estado VARCHAR(25) NOT NULL DEFAULT 'En revisión'
    CHECK (estado IN ('Confirmado', 'En revisión', 'Finalizado')),
  icon VARCHAR(20) NOT NULL DEFAULT '🎓',
  instructor VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  solicitante_nombre VARCHAR(120),
  solicitante_email VARCHAR(150),
  institucion VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cursos_fecha ON cursos_agenda (fecha);

DROP TRIGGER IF EXISTS trg_cursos_updated_at ON cursos_agenda;
CREATE TRIGGER trg_cursos_updated_at
  BEFORE UPDATE ON cursos_agenda
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 10. TABLA: configuracion_sistema
-- Parámetros operativos administrables del laboratorio
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracion_sistema (
  clave VARCHAR(64) PRIMARY KEY,
  valor JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_configuracion_updated_at ON configuracion_sistema;
CREATE TRIGGER trg_configuracion_updated_at
  BEFORE UPDATE ON configuracion_sistema
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
