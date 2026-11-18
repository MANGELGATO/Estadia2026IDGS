-- ====================================================================
-- PLAi - Plataforma de Gestión de Recursos y Espacios
-- Migración 001: esquema inicial (PostgreSQL 15/16)
-- Estándar PLAi sec. 3 y 9: PostgreSQL, migraciones versionadas y reproducibles.
-- ====================================================================

CREATE TABLE categorias (
  id            VARCHAR(64)  PRIMARY KEY,               -- slug: realidad-virtual, robotica, ...
  nombre        VARCHAR(100) NOT NULL,
  descripcion   TEXT         NOT NULL,
  color         VARCHAR(20)  NOT NULL DEFAULT '#0086ff',
  plai_usage    TEXT         NOT NULL,
  video_url     VARCHAR(255) NOT NULL,
  beneficios    JSONB        NOT NULL DEFAULT '[]',
  casos_exito   JSONB        NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Directorio institucional. NO almacena contraseñas: la identidad la resuelve
-- el proveedor que indique PLAi a través de NextAuth (estándar sec. 7).
CREATE TABLE usuarios (
  id             VARCHAR(64)  PRIMARY KEY,
  nombre         VARCHAR(120) NOT NULL,
  email          VARCHAR(150) NOT NULL UNIQUE,
  rol            VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                 CHECK (rol IN ('admin', 'usuario', 'colaborador')),
  estado         VARCHAR(20)  NOT NULL DEFAULT 'Activo'
                 CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
  telefono       VARCHAR(30),
  dependencia    VARCHAR(150),
  ultimo_acceso  DATE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE equipos (
  id               VARCHAR(64)  PRIMARY KEY,
  categoria_id     VARCHAR(64)  NOT NULL REFERENCES categorias(id) ON UPDATE CASCADE,
  nombre           VARCHAR(150) NOT NULL,
  marca            VARCHAR(100) NOT NULL,
  modelo           VARCHAR(100) NOT NULL,
  codigo_plai      VARCHAR(80)  NOT NULL UNIQUE,
  numero_serie     VARCHAR(100) NOT NULL,
  almacenamiento   VARCHAR(50)  DEFAULT 'N/A',
  estado           VARCHAR(30)  NOT NULL DEFAULT 'Disponible'
                   CHECK (estado IN ('Disponible', 'En uso', 'En mantenimiento', 'Baja', 'Reservado')),
  ubicacion        VARCHAR(150) NOT NULL DEFAULT 'Laboratorio de Innovación PLAi',
  especificaciones JSONB        NOT NULL DEFAULT '[]',
  accesorios       JSONB        NOT NULL DEFAULT '[]',
  imagen_emoji     VARCHAR(10)  DEFAULT '📦',
  imagen_url       VARCHAR(255),
  responsable      VARCHAR(120) DEFAULT 'Laboratorio de Innovación PLAi',
  observaciones    TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_equipos_categoria ON equipos (categoria_id);
CREATE INDEX idx_equipos_estado ON equipos (estado);

CREATE TABLE bitacora_uso (
  id                         VARCHAR(64)  PRIMARY KEY,
  equipo_id                  VARCHAR(64)  NOT NULL REFERENCES equipos(id) ON UPDATE CASCADE,
  codigo_plai                VARCHAR(80)  NOT NULL,
  equipo_nombre              VARCHAR(150) NOT NULL,
  usuario_nombre             VARCHAR(120) NOT NULL,
  usuario_email              VARCHAR(150) NOT NULL,
  usuario_dependencia        VARCHAR(150),
  fecha_entrega              TIMESTAMP    NOT NULL,
  fecha_devolucion_estimada  TIMESTAMP    NOT NULL,
  fecha_devolucion_real      TIMESTAMP,
  estado_prestamo            VARCHAR(20)  NOT NULL DEFAULT 'Activo'
                             CHECK (estado_prestamo IN ('Activo', 'Devuelto', 'Con Incidencia')),
  condicion_entrega          VARCHAR(20)  NOT NULL DEFAULT 'Excelente'
                             CHECK (condicion_entrega IN ('Excelente', 'Bueno', 'Regular')),
  condicion_devolucion       VARCHAR(20)
                             CHECK (condicion_devolucion IS NULL OR condicion_devolucion IN ('Excelente', 'Bueno', 'Observación', 'En revisión', 'Dañado')),
  accesorios_entregados      TEXT         NOT NULL,
  accesorios_devueltos       TEXT,
  observaciones_entrega      TEXT,
  observaciones_devolucion   TEXT,
  incidencia_generada        BOOLEAN      NOT NULL DEFAULT FALSE,
  admin_entrega              VARCHAR(120) NOT NULL,
  admin_recibe               VARCHAR(120),
  created_at                 TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_bitacora_equipo ON bitacora_uso (equipo_id);
CREATE INDEX idx_bitacora_codigo ON bitacora_uso (codigo_plai);
CREATE INDEX idx_bitacora_estado ON bitacora_uso (estado_prestamo);

CREATE TABLE aplicaciones (
  id                  VARCHAR(64)  PRIMARY KEY,
  nombre              VARCHAR(150) NOT NULL,
  desarrollador       VARCHAR(120) NOT NULL,
  version             VARCHAR(30)  NOT NULL DEFAULT '1.0',
  categoria           VARCHAR(60)  NOT NULL,
  plataforma          VARCHAR(30)  NOT NULL
                      CHECK (plataforma IN ('Meta Quest', 'PC', 'Meta Quest + PC')),
  clasificacion_edad  VARCHAR(30)  NOT NULL DEFAULT 'Todas las edades',
  descripcion         TEXT         NOT NULL,
  imagen_url          VARCHAR(255),
  equipos_instalados  INT          NOT NULL DEFAULT 1,
  estado              VARCHAR(20)  NOT NULL DEFAULT 'Activa'
                      CHECK (estado IN ('Activa', 'Inactiva')),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_apps_categoria ON aplicaciones (categoria);

CREATE TABLE reservaciones (
  id                    VARCHAR(64)  PRIMARY KEY,
  folio                 VARCHAR(40)  NOT NULL UNIQUE,
  categoria_id          VARCHAR(64)  NOT NULL,
  equipo_id             VARCHAR(64)  REFERENCES equipos(id) ON UPDATE CASCADE ON DELETE SET NULL,
  codigo_plai_asignado  VARCHAR(80),
  usuario_nombre        VARCHAR(120) NOT NULL,
  usuario_email         VARCHAR(150) NOT NULL,
  usuario_telefono      VARCHAR(30),
  usuario_institucion   VARCHAR(150),
  fecha_uso             DATE         NOT NULL,
  hora_inicio           TIME         NOT NULL,
  hora_fin              TIME         NOT NULL,
  actividad             TEXT         NOT NULL,
  estado                VARCHAR(20)  NOT NULL DEFAULT 'Pendiente'
                        CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada', 'En uso', 'Completada')),
  accesorios_incluidos  TEXT,
  condicion_salida      VARCHAR(50)  DEFAULT 'Excelente',
  observaciones_admin   TEXT,
  aprobado_por          VARCHAR(120),
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_reservas_categoria ON reservaciones (categoria_id);
CREATE INDEX idx_reservas_fecha ON reservaciones (fecha_uso);
CREATE INDEX idx_reservas_estado ON reservaciones (estado);
CREATE INDEX idx_reservas_email ON reservaciones (usuario_email);

CREATE TABLE incidencias_mantenimiento (
  id                   VARCHAR(64)  PRIMARY KEY,
  folio                VARCHAR(40)  NOT NULL UNIQUE,
  equipo_id            VARCHAR(64)  NOT NULL REFERENCES equipos(id) ON UPDATE CASCADE,
  codigo_plai          VARCHAR(80)  NOT NULL,
  equipo_nombre        VARCHAR(150) NOT NULL,
  origen               VARCHAR(40)  NOT NULL DEFAULT 'Devolución de Préstamo'
                       CHECK (origen IN ('Devolución de Préstamo', 'Revisión Periódica', 'Reporte de Usuario', 'Falla Operativa')),
  tipo_falla           VARCHAR(40)  NOT NULL
                       CHECK (tipo_falla IN ('Hardware', 'Software', 'Calibración', 'Daño Físico', 'Accesorio Faltante', 'Limpieza y Óptica')),
  severidad            VARCHAR(20)  NOT NULL DEFAULT 'Media'
                       CHECK (severidad IN ('Baja', 'Media', 'Alta', 'Crítica')),
  descripcion          TEXT         NOT NULL,
  estado               VARCHAR(30)  NOT NULL DEFAULT 'Reportada'
                       CHECK (estado IN ('Reportada', 'En diagnóstico', 'En reparación', 'Esperando piezas', 'Resuelta')),
  tecnico_responsable  VARCHAR(120) NOT NULL,
  fecha_reporte        TIMESTAMP    NOT NULL,
  fecha_resolucion     TIMESTAMP,
  acciones_realizadas  TEXT,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_incidencias_codigo ON incidencias_mantenimiento (codigo_plai);
CREATE INDEX idx_incidencias_estado ON incidencias_mantenimiento (estado);

CREATE TABLE espacios (
  id               VARCHAR(64)  PRIMARY KEY,
  nombre           VARCHAR(120) NOT NULL,
  capacidad        INT          NOT NULL,
  descripcion      TEXT         NOT NULL,
  caracteristicas  JSONB        NOT NULL DEFAULT '[]',
  color            VARCHAR(20)  NOT NULL DEFAULT '#0086ff',
  estado           VARCHAR(20)  NOT NULL DEFAULT 'Disponible'
                   CHECK (estado IN ('Disponible', 'Ocupado', 'Mantenimiento')),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Agenda de cursos, talleres y visitas (antes en data/cursos.json)
CREATE TABLE cursos (
  id                   VARCHAR(64)  PRIMARY KEY,
  titulo               VARCHAR(200) NOT NULL,
  tipo                 VARCHAR(80)  NOT NULL,
  fecha                DATE         NOT NULL,
  hora                 VARCHAR(40)  NOT NULL,
  lugar                VARCHAR(200) NOT NULL,
  asistentes           INT          NOT NULL DEFAULT 0,
  estado               VARCHAR(20)  NOT NULL DEFAULT 'En revisión'
                       CHECK (estado IN ('Confirmado', 'En revisión', 'Finalizado')),
  icon                 VARCHAR(20)  NOT NULL DEFAULT '📚',
  instructor           VARCHAR(150) NOT NULL DEFAULT 'Por asignar',
  descripcion          TEXT         NOT NULL,
  solicitante_nombre   VARCHAR(120),
  solicitante_email    VARCHAR(150),
  institucion          VARCHAR(150),
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_cursos_email ON cursos (solicitante_email);

-- Configuración general del sistema: una sola fila (antes en data/configuracion.json)
CREATE TABLE configuracion (
  id          SMALLINT     PRIMARY KEY CHECK (id = 1),
  datos       JSONB        NOT NULL,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
