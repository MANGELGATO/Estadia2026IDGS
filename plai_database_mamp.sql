-- =============================================================================
-- PROYECTO: Plataforma de Gestión de Recursos y Espacios de PLAi
-- ESTADÍA PROFESIONAL: R-ADC-08-07 (Ingeniería en Desarrollo de Software)
-- MOTOR DE BASE DE DATOS: MySQL / MariaDB (Compatible al 100% con MAMP / phpMyAdmin)
-- JUEGO DE CARACTERES: UTF-8 Unicode (utf8mb4 / utf8mb4_unicode_ci)
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "-06:00"; -- Zona horaria Guadalajara / CDMX

-- -----------------------------------------------------------------------------
-- 1. CREACIÓN Y SELECCIÓN DE LA BASE DE DATOS
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `plai_recursos` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `plai_recursos`;

-- -----------------------------------------------------------------------------
-- 2. ELIMINACIÓN PREVIA DE TABLAS (PARA IMPORTACIÓN LIMPIA)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `solicitudes_cursos`;
DROP TABLE IF EXISTS `solicitudes_espacios`;
DROP TABLE IF EXISTS `mantenimientos`;
DROP TABLE IF EXISTS `reservaciones`;
DROP TABLE IF EXISTS `equipos_aplicaciones`;
DROP TABLE IF EXISTS `aplicaciones`;
DROP TABLE IF EXISTS `equipos`;
DROP TABLE IF EXISTS `espacios`;
DROP TABLE IF EXISTS `categorias`;
DROP TABLE IF EXISTS `usuarios`;

-- -----------------------------------------------------------------------------
-- 3. TABLA: usuarios
-- Gestión de usuarios y control de acceso basado en roles (RBAC)
-- -----------------------------------------------------------------------------
CREATE TABLE `usuarios` (
  `id` VARCHAR(64) NOT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `password_hash` VARCHAR(255) NULL COMMENT 'Hash bcrypt para autenticación local si aplica',
  `rol` ENUM('Administrador', 'Colaborador', 'Usuario Final') NOT NULL DEFAULT 'Usuario Final',
  `departamento` VARCHAR(100) NOT NULL DEFAULT 'Laboratorio de Innovación',
  `estado` ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
  `ultimo_login` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. TABLA: categorias
-- Familias tecnológicas de equipos en el laboratorio
-- -----------------------------------------------------------------------------
CREATE TABLE `categorias` (
  `id` VARCHAR(64) NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `icono` VARCHAR(50) DEFAULT '🥽',
  `video_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categorias_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. TABLA: equipos
-- Catálogo patrimonial de dispositivos tecnológicos
-- -----------------------------------------------------------------------------
CREATE TABLE `equipos` (
  `id` VARCHAR(64) NOT NULL,
  `categoria_id` VARCHAR(64) NOT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `marca` VARCHAR(80) NOT NULL,
  `modelo` VARCHAR(80) NOT NULL,
  `almacenamiento` VARCHAR(80) NULL,
  `numero_serie` VARCHAR(80) NOT NULL,
  `codigo_plai` VARCHAR(60) NOT NULL COMMENT 'Código de resguardo patrimonial del Estado de Jalisco',
  `estado` ENUM('Disponible', 'Reservado', 'En uso', 'En mantenimiento', 'Fuera de servicio', 'No disponible') NOT NULL DEFAULT 'Disponible',
  `ubicacion` VARCHAR(150) NOT NULL DEFAULT 'Laboratorio de Innovación PLAi',
  `especificaciones` JSON NULL COMMENT 'Lista de atributos técnicos en formato JSON',
  `accesorios` JSON NULL COMMENT 'Lista de accesorios incluidos en formato JSON',
  `imagen_emoji` VARCHAR(20) DEFAULT '📦',
  `responsable` VARCHAR(120) DEFAULT 'Laboratorio de Tecnologías Inmersivas',
  `observaciones` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_equipos_numero_serie` (`numero_serie`),
  UNIQUE KEY `uk_equipos_codigo_plai` (`codigo_plai`),
  KEY `idx_equipos_categoria` (`categoria_id`),
  KEY `idx_equipos_estado` (`estado`),
  CONSTRAINT `fk_equipos_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. TABLA: aplicaciones
-- Software, licencias y experiencias inmersivas preinstaladas
-- -----------------------------------------------------------------------------
CREATE TABLE `aplicaciones` (
  `id` VARCHAR(64) NOT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `desarrollador` VARCHAR(100) NOT NULL,
  `version` VARCHAR(50) DEFAULT '1.0',
  `categoria` VARCHAR(80) NOT NULL COMMENT 'Educativo, VR, Simulación, etc.',
  `plataforma` ENUM('Meta Quest', 'PC', 'Meta Quest + PC') NOT NULL DEFAULT 'Meta Quest',
  `clasificacion_edad` VARCHAR(30) DEFAULT 'Todas las edades',
  `icono` VARCHAR(20) DEFAULT '🎮',
  `descripcion` TEXT NULL,
  `estado` ENUM('Activa', 'Inactiva') NOT NULL DEFAULT 'Activa',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. TABLA PIVOTE: equipos_aplicaciones (Relación N:M)
-- Mapeo de software instalado en cada dispositivo físico
-- -----------------------------------------------------------------------------
CREATE TABLE `equipos_aplicaciones` (
  `equipo_id` VARCHAR(64) NOT NULL,
  `aplicacion_id` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`equipo_id`, `aplicacion_id`),
  KEY `idx_ea_aplicacion` (`aplicacion_id`),
  CONSTRAINT `fk_ea_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_ea_aplicacion` FOREIGN KEY (`aplicacion_id`) REFERENCES `aplicaciones` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. TABLA: espacios
-- Aulas, salas y auditorio para actividades y talleres
-- -----------------------------------------------------------------------------
CREATE TABLE `espacios` (
  `id` VARCHAR(64) NOT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `tipo` VARCHAR(60) NOT NULL DEFAULT 'Sala / Laboratorio',
  `capacidad` INT NOT NULL,
  `ubicacion` VARCHAR(150) NOT NULL DEFAULT 'Edificio PLAi - Ciudad Creativa Digital',
  `descripcion` TEXT NULL,
  `caracteristicas` JSON NULL COMMENT 'Lista de equipamiento en formato JSON',
  `color` VARCHAR(20) DEFAULT '#0ea5e9',
  `estado` ENUM('Disponible', 'Ocupado', 'Mantenimiento') NOT NULL DEFAULT 'Disponible',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_espacios_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. TABLA: reservaciones
-- Solicitudes de préstamo de equipo (máx. 2 hrs conforme a regla normativa)
-- -----------------------------------------------------------------------------
CREATE TABLE `reservaciones` (
  `id` VARCHAR(64) NOT NULL COMMENT 'Folio institucional tipo RES-XXXXXX',
  `recurso_id` VARCHAR(64) NOT NULL,
  `usuario_id` VARCHAR(64) NULL,
  `nombre_solicitante` VARCHAR(120) NOT NULL,
  `email_solicitante` VARCHAR(120) NULL,
  `fecha` DATE NOT NULL,
  `hora_inicio` TIME NOT NULL,
  `hora_fin` TIME NOT NULL,
  `actividad` VARCHAR(250) NOT NULL,
  `notas` TEXT NULL,
  `estado` ENUM('Pendiente', 'Aprobada', 'Rechazada', 'En uso', 'Completada') NOT NULL DEFAULT 'Pendiente',
  `carta_responsiva_url` VARCHAR(255) NULL,
  `acepto_privacidad` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Consentimiento LFPDPPP',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reservaciones_recurso` (`recurso_id`),
  KEY `idx_reservaciones_usuario` (`usuario_id`),
  KEY `idx_reservaciones_fecha_hora` (`fecha`, `hora_inicio`, `hora_fin`),
  KEY `idx_reservaciones_estado` (`estado`),
  CONSTRAINT `fk_reservaciones_recurso` FOREIGN KEY (`recurso_id`) REFERENCES `equipos` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_reservaciones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. TABLA: solicitudes_espacios
-- Solicitudes para uso y apartado de auditorio, aulas y salas
-- -----------------------------------------------------------------------------
CREATE TABLE `solicitudes_espacios` (
  `id` VARCHAR(64) NOT NULL COMMENT 'Folio institucional tipo ESP-XXXXXX',
  `espacio_id` VARCHAR(64) NOT NULL,
  `nombre_solicitante` VARCHAR(120) NOT NULL,
  `email_solicitante` VARCHAR(120) NOT NULL,
  `fecha` DATE NOT NULL,
  `hora` TIME NOT NULL,
  `proposito` TEXT NOT NULL,
  `estado` ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
  `acepto_privacidad` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Consentimiento LFPDPPP',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_se_espacio` (`espacio_id`),
  KEY `idx_se_fecha` (`fecha`),
  KEY `idx_se_estado` (`estado`),
  CONSTRAINT `fk_se_espacio` FOREIGN KEY (`espacio_id`) REFERENCES `espacios` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. TABLA: mantenimientos
-- Bitácora de incidencias, reparaciones correctivas y preventivas
-- -----------------------------------------------------------------------------
CREATE TABLE `mantenimientos` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `equipo_id` VARCHAR(64) NOT NULL,
  `reportado_por` VARCHAR(120) NOT NULL,
  `tecnico_asignado` VARCHAR(120) NULL,
  `tipo` ENUM('Preventivo', 'Correctivo') NOT NULL DEFAULT 'Correctivo',
  `prioridad` ENUM('Alta', 'Media', 'Baja') NOT NULL DEFAULT 'Media',
  `estado` ENUM('Abierta', 'En proceso', 'Resuelta', 'Cerrada') NOT NULL DEFAULT 'Abierta',
  `descripcion` TEXT NOT NULL,
  `fecha_reporte` DATE NOT NULL,
  `fecha_resolucion` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mant_equipo` (`equipo_id`),
  KEY `idx_mant_estado` (`estado`),
  KEY `idx_mant_prioridad` (`prioridad`),
  CONSTRAINT `fk_mant_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. TABLA: solicitudes_cursos
-- Solicitudes de capacitación y visitas (Académica / Privada)
-- -----------------------------------------------------------------------------
CREATE TABLE `solicitudes_cursos` (
  `id` VARCHAR(64) NOT NULL COMMENT 'Folio institucional tipo CUR-XXXXXX',
  `tipo_curso` ENUM('academica', 'privada') NOT NULL,
  `institucion` VARCHAR(150) NOT NULL,
  `contacto_nombre` VARCHAR(120) NOT NULL,
  `contacto_email` VARCHAR(120) NOT NULL,
  `contacto_telefono` VARCHAR(30) NULL,
  `participantes` INT NOT NULL DEFAULT 1,
  `fecha_preferida` DATE NOT NULL,
  `notas` TEXT NULL,
  `estado` ENUM('Pendiente', 'Confirmada', 'Rechazada') NOT NULL DEFAULT 'Pendiente',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sc_tipo` (`tipo_curso`),
  KEY `idx_sc_fecha` (`fecha_preferida`),
  KEY `idx_sc_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- INSERCIÓN DE DATOS INICIALES (SEEDS / CATÁLOGOS BASE)
-- =============================================================================

-- --- 1. USUARIOS ---
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol`, `departamento`, `estado`, `ultimo_login`) VALUES
('usr-01', 'Juan Pérez', 'juan.perez@plai.edu.mx', '$2a$12$e80yVv69y6qQ2F8jG36l1ODpQp1V5qCqB8rC7iG4G8pQ1V5qCqB8r', 'Administrador', 'Dirección de Tecnología', 'Activo', '2026-09-21 10:30:00'),
('usr-02', 'Ana García', 'ana.garcia@plai.edu.mx', '$2a$12$e80yVv69y6qQ2F8jG36l1ODpQp1V5qCqB8rC7iG4G8pQ1V5qCqB8r', 'Colaborador', 'Tecnologías Inmersivas', 'Activo', '2026-09-21 09:15:00'),
('usr-03', 'Carlos López', 'carlos.lopez@plai.edu.mx', '$2a$12$e80yVv69y6qQ2F8jG36l1ODpQp1V5qCqB8rC7iG4G8pQ1V5qCqB8r', 'Colaborador', 'Fabricación Digital', 'Activo', '2026-09-20 16:45:00'),
('usr-04', 'María Torres', 'maria.torres@plai.edu.mx', '$2a$12$e80yVv69y6qQ2F8jG36l1ODpQp1V5qCqB8rC7iG4G8pQ1V5qCqB8r', 'Colaborador', 'Robótica y Automatización', 'Activo', '2026-09-19 14:20:00'),
('usr-05', 'Pedro Sánchez', 'pedro.sanchez@plai.edu.mx', '$2a$12$e80yVv69y6qQ2F8jG36l1ODpQp1V5qCqB8rC7iG4G8pQ1V5qCqB8r', 'Usuario Final', 'Comunidad PLAi', 'Activo', '2026-09-18 11:10:00'),
('usr-06', 'Lucía Ramírez', 'lucia.ramirez@plai.edu.mx', '$2a$12$e80yVv69y6qQ2F8jG36l1ODpQp1V5qCqB8rC7iG4G8pQ1V5qCqB8r', 'Usuario Final', 'Comunidad PLAi', 'Inactivo', '2026-08-05 18:00:00');

-- --- 2. CATEGORÍAS ---
INSERT INTO `categorias` (`id`, `nombre`, `slug`, `descripcion`, `icono`, `video_url`) VALUES
('realidad-virtual', 'Realidad Virtual', 'realidad-virtual', 'Visores autónomos y tethered de alta gama para experiencias inmersivas, desarrollo 3D e investigación.', '🥽', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('robotica', 'Robótica', 'robotica', 'Brazos mecánicos de precisión, controladores programables, sensores y microcontroladores para automatización.', '🦾', ''),
('fabricacion-digital', 'Fabricación Digital', 'fabricacion-digital', 'Impresoras 3D multi-material, cortadoras láser y escáneres tridimensionales para prototipado rápido.', '🖨️', ''),
('drones', 'Drones', 'drones', 'Aeronaves no tripuladas con cámaras 4K y sensores tridimensionales para fotogrametría e inspección.', '🚁', ''),
('computo-multimedia', 'Cómputo / Multimedia', 'computo-multimedia', 'Estaciones de trabajo de alto rendimiento gráfico (GPU RTX) y laptops profesionales para desarrollo inmersivo.', '💻', '');

-- --- 3. EQUIPOS (CATÁLOGO REAL EXTRAÍDO DE INVENTARIO PLAi) ---
INSERT INTO `equipos` (`id`, `categoria_id`, `nombre`, `marca`, `modelo`, `numero_serie`, `codigo_plai`, `estado`, `ubicacion`, `especificaciones`, `accesorios`, `imagen_emoji`, `responsable`) VALUES
-- Realidad Virtual
('vr-01', 'realidad-virtual', 'Meta Quest 3 (512 GB)', 'Meta', 'Quest 3 512 GB', '1WMHH8100A01', '5151000013-1', 'Disponible', 'Área de Realidad Virtual (Laboratorio)', 
 '["Almacenamiento 512 GB", "Chip Snapdragon XR2 Gen 2", "Passthrough a color alta resolución (MR)", "Hand Tracking con IA", "Lentes Fresnel"]', 
 '["2 Controladores Touch Plus", "Correa estándar", "Cable USB-C y adaptador de corriente"]', '🥽', 'Laboratorio de Tecnologías Inmersivas'),

('vr-02', 'realidad-virtual', 'Meta Quest 3 (512 GB) - Lote #4', 'Meta', 'Quest 3 512 GB', '1WMHH8100A04', '5151000013-4', 'En uso', 'Área de Realidad Virtual', 
 '["Almacenamiento 512 GB", "Chip Snapdragon XR2 Gen 2", "Conectividad inalámbrica PC-VR Wi-Fi 6E", "Autonomía 2.2 hrs"]', 
 '["2 Controladores Touch Plus", "Cable de carga"]', '🥽', 'Laboratorio de Tecnologías Inmersivas'),

('vr-03', 'realidad-virtual', 'Oculus Quest VR (128 GB)', 'Oculus', 'Quest VR 128 GB', '1WMHH8007701', '5151000077-1', 'Disponible', 'Área de Realidad Virtual', 
 '["Almacenamiento 128 GB", "Pantalla dual OLED 1440x1600", "Tracking Oculus Insight 6DoF", "Audio espacial integrado"]', 
 '["2 Controladores Oculus Touch", "Espaciador para lentes", "Cargador oficial"]', '🥽', 'Laboratorio de Tecnologías Inmersivas'),

('vr-04', 'realidad-virtual', 'Oculus Quest VR (128 GB) - Incidencia', 'Oculus', 'Quest VR 128 GB', '1WMHH8007712', '5151000077-12', 'En mantenimiento', 'Taller de Soporte / Mantenimiento', 
 '["128 GB", "Falla reportada en inventario: Display dañado", "En diagnóstico técnico"]', 
 '["2 Controladores Oculus Touch"]', '🥽', 'Laboratorio de Tecnologías Inmersivas'),

-- Robótica
('rob-01', 'robotica', 'Brazo Robótico DOBOT Magician', 'DOBOT', 'Magician Lite', 'DB-MAG-2024-011', 'PLAI-ROB-011', 'Disponible', 'Laboratorio de Robótica', 
 '["Payload 250g", "Alcance 320 mm", "Repetibilidad ±0.2 mm", "4 ejes articulados"]', 
 '["Cabezal de pluma", "Succionador de vacío", "Pinza de agarre", "Cable USB"]', '🦾', 'Área de Automatización'),

('rob-02', 'robotica', 'Kit Lego Education SPIKE (5 piezas)', 'Lego Education', 'SPIKE Prime', 'LEGO-SPIKE-5151', '5151000085', 'Disponible', 'Laboratorio de Robótica y Aulas STEAM', 
 '["Robots didácticos programables", "Compatibilidad oficial Made for iPad y PC", "Sensores de color, distancia y fuerza", "Hub inteligente con matriz LED 5x5"]', 
 '["Contenedor amarillo de plástico rígido y apilable", "Batería recargable", "Cables y conectores"]', '🤖', 'Área de Automatización'),

('rob-03', 'robotica', 'OHBOT Cabeza Robótica Expresiva', 'OHBOT', 'Humanoid Head V2', 'OHBOT-V2-052', 'PLAI-ROB-052', 'Disponible', 'Laboratorio de Robótica', 
 '["Servomotores acoplados laterales", "Expresiones faciales y giros de cabeza", "Ojos esféricos realistas", "Boca curva en sonrisa", "Programable en Python/Scratch"]', 
 '["Base de soporte", "Cable de conexión USB"]', '🗣️', 'Área de Automatización'),

('rob-04', 'robotica', 'Mano Robótica con Tendones', 'PLAi Lab', 'Bionic Hand Pro', 'PLAI-BIONIC-063', 'PLAI-ROB-063', 'Disponible', 'Laboratorio de Robótica', 
 '["Sistema de tendones con hilos tensores en falanges", "Microcontrolador Arduino", "Control de apertura y agarre articulado"]', 
 '["Protoboard de pruebas", "Cables de conexión jumper", "Placa Arduino"]', '🖐️', 'Área de Automatización'),

('rob-05', 'robotica', 'Robot Cuadrúpedo Tipo Araña', 'PLAi Lab', 'Spider Bot Nano', 'PLAI-SPIDER-074', 'PLAI-ROB-074', 'Disponible', 'Laboratorio de Robótica', 
 '["Chasis y patas en acrílico negro", "4 patas articuladas", "Micro servomotores en articulaciones", "Arduino Nano con shield azul"]', 
 '["Batería LiPo", "Shield de conexiones"]', '🕷️', 'Área de Automatización'),

('rob-06', 'robotica', 'Robot Cuadrúpedo 3D', 'PLAi Lab', 'Quadruped SG90', 'PLAI-QUAD-075', 'PLAI-ROB-075', 'Disponible', 'Laboratorio de Robótica', 
 '["Estructura impresa en 3D en PLA", "Múltiples servomotores SG-90", "Marcha omnidireccional"]', 
 '["Controlador de servomotores", "Portapilas"]', '🐾', 'Área de Automatización'),

('rob-07', 'robotica', 'Robot Humanoide Abilix H1 Standard', 'Abilix', 'H1 Standard Set', 'ABX-H1-2023-041', 'PLAI-ROB-041', 'Disponible', 'Laboratorio de Robótica', 
 '["Robot bípedo programable", "Múltiples servomotores de precisión", "Control de equilibrio dinámico y coreografías"]', 
 '["Caja original de empaque", "Batería y cargador", "Manual de programación"]', '🤖', 'Área de Automatización'),

('rob-08', 'robotica', 'Creative Brick C1-S Abilix', 'Abilix', 'Creative Brick C1-S', 'ABX-C1S-2023-042', 'PLAI-ROB-042', 'Disponible', 'Laboratorio de Robótica', 
 '["Módulo cerebral de control robótico", "Engranes y transmisión mecánica", "Programación por bloques"]', 
 '["Caja de almacenamiento", "Sensores y motores modulares"]', '⚙️', 'Área de Automatización'),

-- Fabricación Digital
('fab-01', 'fabricacion-digital', 'Impresora 3D Bambu Lab X1-Carbon', 'Bambu Lab', 'X1 Carbon AMS', '01P00A3810009', 'PLAI-FAB-009', 'En uso', 'Taller de Fabricación Digital', 
 '["Sistema AMS multi-material (4 filamentos)", "Cinemática Core XY a 500 mm/s", "Sensor Micro Lidar y cámara IA", "Cámara cerrada con aislamiento térmico", "Soporta Nylon, Fibra de carbono, ABS, TPU, PLA"]', 
 '["Módulo AMS superior", "Placa de construcción texturizada", "Juego de boquillas de repuesto"]', '🖨️', 'Taller de Fabricación'),

('fab-02', 'fabricacion-digital', 'Escáner 3D Miraco Plus', 'Revopoint 3D Technologies', 'Miraco Plus Standalone', 'REV-MIRACO-014', 'PLAI-FAB-014', 'Disponible', 'Taller de Fabricación Digital', 
 '["Escáner 3D volumétrico autónomo", "Proyección de luz infrarroja y láser estructurada", "Nube de millones de puntos", "Pantalla táctil abatible", "Captura fotorealista en color"]', 
 '["Kit de calibración con placas cuadrícula", "Tripié articulado", "Cable USB-C"]', '📡', 'Taller de Fabricación'),

('fab-03', 'fabricacion-digital', 'Mini Fresadora CNC de Escritorio', 'CNC Desktop Pro', '3-Axis Micro CNC', 'CNC-3AX-2023-021', 'PLAI-FAB-021', 'Disponible', 'Taller de Fabricación Digital', 
 '["Mecanizado sustractivo en 3 ejes (X, Y, Z)", "Husillo giratorio alta velocidad", "Control Numérico Código G", "Tallado de madera, plásticos y prototipos PCB"]', 
 '["Juego de fresas y brocas", "Llaves de apriete", "Cable de control PC"]', '⚙️', 'Taller de Fabricación'),

('fab-04', 'fabricacion-digital', 'Mini Torno de Escritorio Manual', 'Precision Mini Lathe', 'Benchtop Lathe 100', 'LATHE-MINI-022', 'PLAI-FAB-022', 'Disponible', 'Taller de Fabricación Digital', 
 '["Fabricación de piezas cilíndricas y roscas", "Mandril con mordazas ajustables", "Carro transversal y bancada rectificada", "Diales milimétricos en cobre", "Control manual por manivelas"]', 
 '["Llave de mandril", "Juego de buriles de corte", "Centro giratorio"]', '🔩', 'Taller de Fabricación'),

('fab-05', 'fabricacion-digital', 'Mini Fresadora / Taladro Vertical', 'Modular Drill Pro', 'Vertical Mill 200', 'DRILL-VERT-023', 'PLAI-FAB-023', 'Disponible', 'Taller de Fabricación Digital', 
 '["Perforado, tallado y desbastado", "Mesa cruzada con manivelas X e Y", "Prensa tornillo de banco", "Estructura modular en aluminio interconectable"]', 
 '["Prensa de sujeción", "Juego de brocas milimétricas"]', '🔧', 'Taller de Fabricación'),

('fab-06', 'fabricacion-digital', 'Módulo de Grabado Láser Snapmaker', 'Snapmaker', 'Laser Module 200mW', 'SNAP-LASER-024', 'PLAI-FAB-024', 'Disponible', 'Taller de Fabricación Digital', 
 '["Cabezal intercambiable para quemado y marcado", "Láser diodo 200mW 405nm (Clase 3B)", "Grabado en madera, cartón y cuero", "Carcasa metálica con conectores rápidos"]', 
 '["Gafas de seguridad certificadas para láser", "Materiales de muestra"]', '⚡', 'Taller de Fabricación'),

-- Drones
('dr-01', 'drones', 'Dron DJI Mavic 4 Pro', 'DJI', 'Mavic 4 Pro', 'DJI-M4P-2023-001', 'PLAI-DR-001', 'Disponible', 'Gabinete de Drones y Filmación', 
 '["Cámara Hasselblad profesional", "Cuadricóptero foto y video aéreo alta resolución", "Transmisión HD de largo alcance", "Compatible con apps iOS y Android"]', 
 '["Control remoto inteligente", "2 Baterías de vuelo", "Cargador múltiple", "Estuche rígido"]', '🚁', 'Coordinación de Operaciones'),

('dr-02', 'drones', 'Dron DJI Mini 5 Pro (4 piezas)', 'DJI', 'Mini 5 Pro', 'DJI-M5P-2024-002', 'PLAI-DR-002', 'Reservado', 'Gabinete de Drones', 
 '["Peso sub-249g (Ultraligero sin licencia)", "Evasión de obstáculos omnidireccional 360°", "Gimbal mecánico 3 ejes estabilizado", "ActiveTrack con IA"]', 
 '["Control remoto con pantalla", "Baterías inteligentes", "Protectores de hélices"]', '🚁', 'Coordinación de Operaciones'),

('dr-03', 'drones', 'Dron DJI FLIP Fly More Combo', 'DJI', 'DJI FLIP Fly More', 'DJI-FLIP-2024-003', 'PLAI-DR-003', 'Disponible', 'Gabinete de Drones', 
 '["Categoría ultraligera 249g", "Protectores de hélices circulares completas", "Cámara frontal montada en estabilizador", "Control remoto DJI RC 2 integrado"]', 
 '["Control DJI RC 2 con pantalla", "Baterías adicionales de reemplazo", "Cargador de baterías"]', '🚁', 'Coordinación de Operaciones'),

('dr-04', 'drones', 'Centro de Carga Inteligente DJI', 'DJI', 'Battery Charging Hub', 'DJI-HUB-2023-004', 'PLAI-DR-004', 'Disponible', 'Gabinete de Drones', 
 '["Gestor inteligente múltiples baterías dron", "Carga secuencial priorizada", "Modo almacenamiento 60% para celdas", "Modo Power Bank para recarga externa", "Protección térmica"]', 
 '["Cables de alimentación", "Adaptador AC de alta potencia"]', '🔋', 'Coordinación de Operaciones'),

-- Cómputo y Microelectrónica
('comp-01', 'computo-multimedia', 'Fuente de Alimentación Baku BK-1502D+', 'Baku', 'BK-1502D+ Regulable', 'BAKU-1502-001', 'PLAI-COMP-001', 'Disponible', 'Área de Microelectrónica y Diagnóstico', 
 '["Voltaje regulable 0 a 15V", "Corriente continua hasta 2A", "Pantalla digital monitoreo en tiempo real", "Alarma acústica y corte anti-cortocircuitos", "Inyección de energía manual"]', 
 '["Cables banana y pinzas caimán", "Cable AC"]', '🔌', 'Área de Cómputo y Electrónica'),

('comp-02', 'computo-multimedia', 'Kit Domótico micro:bit Smart Home', 'BBC micro:bit', 'Smart Home Kit IoT', 'MBIT-HOME-002', 'PLAI-COMP-002', 'Disponible', 'Laboratorio de Microelectrónica y STEAM', 
 '["Placa micro:bit programable + placa expansión", "Sensores: temperatura, luz LDR, sonido, humedad/nivel agua", "Actuadores: mini ventilador, lámpara LED, pantalla OLED", "Proyectos IoT y STEAM"]', 
 '["Estructura modular de habitación", "Cables dupont", "Sensor kit completo"]', '🏠', 'Área de Cómputo y Electrónica'),

('comp-03', 'computo-multimedia', 'MacBook Pro 16" M3 Max', 'Apple', 'MacBook Pro M3 Max', 'C02G90PL005', 'PLAI-COMP-005', 'Disponible', 'Sala de Cómputo Principal', 
 '["Chip M3 Max 14-core", "36 GB RAM unificada", "1 TB SSD", "Pantalla Liquid Retina XDR"]', 
 '["Cargador MagSafe 140W", "USB-C Hub"]', '💻', 'Área de Cómputo'),

('comp-04', 'computo-multimedia', 'Oculus Link PC Alienware Aurora', 'Alienware', 'Aurora R15', 'AW-R15-2023-012', 'PLAI-COMP-012', 'No disponible', 'Sala de Cómputo Principal', 
 '["Intel Core i9-13900KF", "NVIDIA RTX 4090 24GB", "64 GB DDR5", "2 TB NVMe SSD"]', 
 '["Monitor 4K 144Hz", "Teclado mecánico", "Mouse gaming"]', '🖥️', 'Área de Cómputo');

-- --- 4. APLICACIONES ---
INSERT INTO `aplicaciones` (`id`, `nombre`, `desarrollador`, `version`, `categoria`, `plataforma`, `clasificacion_edad`, `icono`, `descripcion`, `estado`) VALUES
('app-1', 'Tilt Brush', 'Google', '22.0', 'Arte y Creatividad', 'Meta Quest', 'Todas las edades', '🎨', 'Pinta en realidad virtual en 3D con pinceles y materiales mágicos. Ideal para talleres de arte inmersivo.', 'Activa'),
('app-2', 'Rec Room', 'Against Gravity', '2026.2', 'Juego Interactivo', 'Meta Quest + PC', 'Todas las edades', '⚡', 'Mundo social con minijuegos cooperativos: paintball, dodgeball, escape rooms.', 'Activa'),
('app-3', 'Ocean Rift', 'Llyr ap Cenydd', '3.1', 'Ciencia y Naturaleza', 'Meta Quest', 'Todas las edades', '🌊', 'Parque acuático virtual con tiburones, ballenas, delfines y tortugas.', 'Activa'),
('app-4', 'Beat Saber', 'Beat Games', '1.34', 'Juego Interactivo', 'Meta Quest', '6+', '⚡', 'Juego rítmico con sables de luz. Coordina movimientos con la música.', 'Activa'),
('app-5', 'Job Simulator', 'Owlchemy Labs', '1.8', 'Simulación', 'Meta Quest', 'Todas las edades', '🎮', 'Simula trabajos cotidianos en un mundo futurista donde los robots hacen todo.', 'Activa'),
('app-6', 'Vacation Simulator', 'Owlchemy Labs', '1.4', 'Simulación', 'Meta Quest', 'Todas las edades', '🎮', 'Experiencia de vacaciones virtuales en playa, montaña y ciudad.', 'Activa'),
('app-7', 'National Geographic Explore VR', 'National Geographic', '2.0', 'Ciencia y Naturaleza', 'Meta Quest', 'Todas las edades', '🌊', 'Explora la Antártida y Machu Picchu en VR.', 'Activa'),
('app-8', 'Spatial', 'Spatial Systems', '5.10', 'Experiencia VR', 'Meta Quest + PC', 'Todas las edades', '🥽', 'Plataforma de colaboración y exhibiciones en VR para presentaciones y galerías virtuales.', 'Activa'),
('app-9', "Richie's Plank Experience", 'Toast VR', '2.1', 'Experiencia VR', 'Meta Quest', '10+', '🥽', 'Experiencia de altura extrema en VR para demostraciones de inmersión y presencia.', 'Activa'),
('app-10', 'Pistol Whip', 'Cloudhead Games', '1.9', 'Juego Interactivo', 'Meta Quest', '12+', '⚡', 'Juego de acción rítmica y movimiento corporal.', 'Activa'),
('app-11', 'The Room VR', 'Fireproof Games', '1.2', 'Juego Educativo', 'Meta Quest', '10+', '🎓', 'Escape room con acertijos y puzzles en VR. Fomenta el pensamiento lógico.', 'Activa'),
('app-12', 'Minecraft Education Edition', 'Microsoft', '1.20', 'Juego Educativo', 'PC', '6+', '🎓', 'Versión educativa de Minecraft con lecciones de ciencias y programación.', 'Activa'),
('app-13', 'Star Chart', 'Escape Velocity Limited', '3.5', 'Ciencia y Naturaleza', 'Meta Quest', 'Todas las edades', '🌊', 'Planetario virtual interactivo para talleres de astronomía.', 'Activa'),
('app-14', 'Fruit Ninja VR 2', 'Halfbrick Studios', '1.1', 'Juego Interactivo', 'Meta Quest', 'Todas las edades', '⚡', 'Corta frutas volando con katanas en realidad virtual.', 'Activa'),
('app-15', 'Superhot VR', 'Superhot Team', '2.0', 'Juego Interactivo', 'Meta Quest', '12+', '⚡', 'El tiempo solo avanza cuando te mueves.', 'Activa');

-- --- 5. RELACIÓN EQUIPOS - APLICACIONES ---
INSERT INTO `equipos_aplicaciones` (`equipo_id`, `aplicacion_id`) VALUES
('vr-01', 'app-1'), -- Meta Quest 3 con Tilt Brush
('vr-01', 'app-4'), -- Meta Quest 3 con Beat Saber
('vr-01', 'app-5'), -- Meta Quest 3 con Job Simulator
('vr-01', 'app-8'), -- Meta Quest 3 con Spatial
('vr-02', 'app-1'), -- HTC Vive con Tilt Brush
('vr-02', 'app-2'), -- HTC Vive con Rec Room
('vr-03', 'app-3'), -- Meta Quest 2 con Ocean Rift
('comp-02', 'app-8'), -- Oculus Link PC con Spatial
('comp-02', 'app-12'); -- Oculus Link PC con Minecraft Education

-- --- 6. ESPACIOS ---
INSERT INTO `espacios` (`id`, `nombre`, `tipo`, `capacidad`, `ubicacion`, `descripcion`, `caracteristicas`, `color`, `estado`) VALUES
('auditorio', 'Auditorio Principal', 'Auditorio', 150, 'Edificio PLAi - Nivel 1', 
 'Espacio ideal para conferencias, presentaciones y eventos corporativos con capacidad para 150 personas.', 
 '["Proyector 4K", "Sistema de audio profesional", "Iluminación escénica", "Wi-Fi de alta velocidad"]', '#E91E8C', 'Disponible'),

('aula-robotica', 'Aula de Robótica', 'Laboratorio', 25, 'Edificio PLAi - Nivel 2', 
 'Laboratorio equipado para prácticas de automatización, electrónica y programación de brazos robóticos.', 
 '["Estaciones de trabajo equipadas", "Kits de electrónica", "Brazos robóticos DOBOT", "Pizarrones interactivos"]', '#0ea5e9', 'Disponible'),

('workshop-vr', 'Workshop de VR', 'Sala Inmersiva', 15, 'Edificio PLAi - Nivel 2', 
 'Sala inmersiva para desarrollo y prueba de experiencias de realidad virtual, aumentada y mixta.', 
 '["PC Gamers de alto rendimiento", "Visores Meta Quest 3", "Sensores de movimiento", "Pantallas de monitoreo"]', '#7c3aed', 'Disponible'),

('sala-juntas', 'Sala de Juntas Creativa', 'Sala de Juntas', 10, 'Edificio PLAi - Nivel 3', 
 'Un entorno diseñado para sesiones de lluvia de ideas y planeación estratégica.', 
 '["Pantalla de 75 pulgadas", "Pintarrón de cristal", "Mobiliario ergonómico", "Coffee break opcional"]', '#F59E0B', 'Disponible');

-- --- 7. RESERVACIONES (HISTORIAL Y EJEMPLOS) ---
INSERT INTO `reservaciones` (`id`, `recurso_id`, `usuario_id`, `nombre_solicitante`, `email_solicitante`, `fecha`, `hora_inicio`, `hora_fin`, `actividad`, `notas`, `estado`, `carta_responsiva_url`, `acepto_privacidad`) VALUES
('RES-1001', 'vr-01', 'usr-02', 'Ana García', 'ana.garcia@plai.edu.mx', '2026-09-25', '09:00:00', '11:00:00', 'Taller de Realidad Virtual para estudiantes', 'Requiere Beat Saber y Spatial preinstalados', 'Pendiente', '/docs/responsiva_ana.pdf', 1),
('RES-1002', 'fab-01', 'usr-03', 'Carlos López', 'carlos.lopez@plai.edu.mx', '2026-09-23', '14:00:00', '16:00:00', 'Proyecto de prototipado rápido', 'Necesita filamento PLA color azul', 'Aprobada', '/docs/responsiva_carlos.pdf', 1),
('RES-1003', 'rob-01', 'usr-04', 'María Torres', 'maria.torres@plai.edu.mx', '2026-09-22', '10:00:00', '12:00:00', 'Demostración robótica para visita gubernamental', 'Cabezal con pluma y pinza de agarre', 'En uso', '/docs/responsiva_maria.pdf', 1),
('RES-1004', 'dr-01', 'usr-05', 'Pedro Sánchez', 'pedro.sanchez@plai.edu.mx', '2026-09-20', '08:00:00', '09:00:00', 'Captura audiovisual institucional para reel de PLAi', 'Uso en patio central exterior', 'Completada', '/docs/responsiva_pedro.pdf', 1),
('RES-1005', 'comp-01', 'usr-06', 'Lucía Ramírez', 'lucia.ramirez@plai.edu.mx', '2026-09-21', '13:00:00', '15:00:00', 'Edición de video en Final Cut Pro', 'Equipo reservado fuera de horario permitido', 'Rechazada', NULL, 1);

-- --- 8. MANTENIMIENTOS ---
INSERT INTO `mantenimientos` (`id`, `equipo_id`, `reportado_por`, `tecnico_asignado`, `tipo`, `prioridad`, `estado`, `descripcion`, `fecha_reporte`, `fecha_resolucion`) VALUES
(1, 'vr-04', 'Inventario Laboratorio', 'Luis Martínez', 'Correctivo', 'Alta', 'En proceso', 'Falla física reportada en plantilla oficial de inventario: Display dañado en visor Oculus Quest 128GB (serie 5151000077-12). En revisión técnica.', '2026-09-15', NULL),
(2, 'fab-01', 'Carlos López', 'Luis Martínez', 'Correctivo', 'Media', 'Abierta', 'Extrusor con obstrucción parcial, no deposita material continuo a temperatura estándar.', '2026-09-18', NULL),
(3, 'comp-02', 'María Torres', NULL, 'Correctivo', 'Baja', 'Abierta', 'La fuente de poder no retiene carga adecuada en pruebas de estrés.', '2026-09-20', NULL),
(4, 'rob-01', 'Pedro Sánchez', 'Ana Rodríguez', 'Preventivo', 'Alta', 'Resuelta', 'Calibración periódica de servomotores y lubricación de engranes de 4 ejes.', '2026-09-10', '2026-09-21'),
(5, 'fab-03', 'Lucía Ramírez', 'Luis Martínez', 'Correctivo', 'Media', 'Cerrada', 'Falla de reconocimiento en puerto USB-C; reinstalación de controladores propietaria.', '2026-09-08', '2026-09-12');

-- --- 9. SOLICITUDES DE ESPACIOS ---
INSERT INTO `solicitudes_espacios` (`id`, `espacio_id`, `nombre_solicitante`, `email_solicitante`, `fecha`, `hora`, `proposito`, `estado`, `acepto_privacidad`) VALUES
('ESP-5001', 'auditorio', 'Universidad de Guadalajara', 'vinculacion@udg.mx', '2026-10-15', '10:00:00', 'Conferencia Magistral: Retos de la Inteligencia Artificial en Jalisco', 'Aprobada', 1),
('ESP-5002', 'workshop-vr', 'Estudio Inmersivo Pixel', 'contacto@pixelstudio.mx', '2026-10-18', '14:00:00', 'Pruebas de concepto y testeo con usuarios de videojuego en VR', 'Pendiente', 1),
('ESP-5003', 'aula-robotica', 'UTJ - Carrera IDGS', 'soporte@utj.edu.mx', '2026-10-20', '09:00:00', 'Taller práctico de IoT y robótica colaborativa', 'Aprobada', 1);

-- --- 10. SOLICITUDES DE CURSOS ---
INSERT INTO `solicitudes_cursos` (`id`, `tipo_curso`, `institucion`, `contacto_nombre`, `contacto_email`, `contacto_telefono`, `participantes`, `fecha_preferida`, `notas`, `estado`) VALUES
('CUR-3001', 'academica', 'Universidad Tecnológica de Jalisco (UTJ)', 'Prof. Héctor Rivera', 'hrivera@utj.edu.mx', '33-1234-5678', 35, '2026-11-05', 'Visita guiada para estudiantes de 8vo cuatrimestre de software con taller de realidad virtual', 'Confirmada'),
('CUR-3002', 'privada', 'Tech Innovations Hub', 'Ing. Sofía Morales', 'smorales@techhub.com', '33-9876-5432', 15, '2026-11-12', 'Capacitación ejecutiva en modelado e impresión 3D industrial', 'Pendiente');

-- -----------------------------------------------------------------------------
-- REACTIVACIÓN DE RESTRICCIONES DE INTEGRIDAD REFERENCIAL
-- -----------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- FIN DEL SCRIPT: plai_recursos
-- Importación finalizada con éxito.
-- -----------------------------------------------------------------------------
