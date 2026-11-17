-- ====================================================================
-- PLATAFORMA ABIERTA DE INNOVACIÓN Y DESARROLLO DE JALISCO (PLAi)
-- SISTEMA DE GESTIÓN DE RECURSOS, LABORATORIOS Y ESPACIOS
-- Script DDL y DML de Inicialización (MySQL 8.0+ / MariaDB 10.5+)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS plai_recursos 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE plai_recursos;

-- --------------------------------------------------------------------
-- 1. TABLA: usuarios
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS incidencias_mantenimiento;
DROP TABLE IF EXISTS bitacora_uso;
DROP TABLE IF EXISTS reservaciones;
DROP TABLE IF EXISTS equipos;
DROP TABLE IF EXISTS aplicaciones;
DROP TABLE IF EXISTS espacios;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id VARCHAR(64) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'usuario', 'colaborador') DEFAULT 'usuario' NOT NULL,
  estado ENUM('Activo', 'Inactivo', 'Suspendido') DEFAULT 'Activo' NOT NULL,
  telefono VARCHAR(30) NULL,
  dependencia VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. TABLA: categorias
-- --------------------------------------------------------------------
CREATE TABLE categorias (
  id VARCHAR(64) PRIMARY KEY, -- Slug: realidad-virtual, robotica, etc.
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  color VARCHAR(20) DEFAULT '#0086ff' NOT NULL,
  plai_usage TEXT NOT NULL,
  video_url VARCHAR(255) NOT NULL,
  beneficios JSON NOT NULL,
  casos_exito JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. TABLA: equipos
-- --------------------------------------------------------------------
CREATE TABLE equipos (
  id VARCHAR(64) PRIMARY KEY,
  categoria_id VARCHAR(64) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  codigo_plai VARCHAR(80) UNIQUE NOT NULL,
  numero_serie VARCHAR(100) NOT NULL,
  almacenamiento VARCHAR(50) DEFAULT 'N/A',
  estado ENUM('Disponible', 'En uso', 'En mantenimiento', 'Baja', 'Reservado') DEFAULT 'Disponible' NOT NULL,
  ubicacion VARCHAR(150) DEFAULT 'Laboratorio de Innovación PLAi' NOT NULL,
  especificaciones JSON NOT NULL,
  accesorios JSON NOT NULL,
  imagen_emoji VARCHAR(10) DEFAULT '📦',
  imagen_url VARCHAR(255) NULL,
  responsable VARCHAR(120) DEFAULT 'Laboratorio de Innovación PLAi',
  observaciones TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_equipos_categoria (categoria_id),
  INDEX idx_equipos_codigo (codigo_plai),
  INDEX idx_equipos_estado (estado),
  CONSTRAINT fk_equipos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. TABLA: bitacora_uso
-- --------------------------------------------------------------------
CREATE TABLE bitacora_uso (
  id VARCHAR(64) PRIMARY KEY,
  equipo_id VARCHAR(64) NOT NULL,
  codigo_plai VARCHAR(80) NOT NULL,
  equipo_nombre VARCHAR(150) NOT NULL,
  usuario_nombre VARCHAR(120) NOT NULL,
  usuario_email VARCHAR(150) NOT NULL,
  usuario_dependencia VARCHAR(150) NULL,
  fecha_entrega DATETIME NOT NULL,
  fecha_devolucion_estimada DATETIME NOT NULL,
  fecha_devolucion_real DATETIME NULL,
  estado_prestamo ENUM('Activo', 'Devuelto', 'Con Incidencia') DEFAULT 'Activo' NOT NULL,
  condicion_entrega ENUM('Excelente', 'Bueno', 'Regular') DEFAULT 'Excelente' NOT NULL,
  condicion_devolucion ENUM('Excelente', 'Bueno', 'Observación', 'En revisión', 'Dañado') NULL,
  accesorios_entregados TEXT NOT NULL,
  accesorios_devueltos TEXT NULL,
  observaciones_entrega TEXT NULL,
  observaciones_devolucion TEXT NULL,
  incidencia_generada BOOLEAN DEFAULT FALSE,
  admin_entrega VARCHAR(120) NOT NULL,
  admin_recibe VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bitacora_equipo (equipo_id),
  INDEX idx_bitacora_codigo (codigo_plai),
  INDEX idx_bitacora_estado (estado_prestamo),
  CONSTRAINT fk_bitacora_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. TABLA: aplicaciones
-- --------------------------------------------------------------------
CREATE TABLE aplicaciones (
  id VARCHAR(64) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  desarrollador VARCHAR(120) NOT NULL,
  version VARCHAR(30) DEFAULT '1.0' NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  plataforma ENUM('Meta Quest', 'PC', 'Meta Quest + PC') NOT NULL,
  clasificacion_edad VARCHAR(30) DEFAULT 'Todas las edades' NOT NULL,
  descripcion TEXT NOT NULL,
  imagen_url VARCHAR(255) NULL,
  equipos_instalados INT DEFAULT 1 NOT NULL,
  estado ENUM('Activa', 'Inactiva') DEFAULT 'Activa' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_apps_categoria (categoria),
  INDEX idx_apps_plataforma (plataforma)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. TABLA: reservaciones
-- --------------------------------------------------------------------
CREATE TABLE reservaciones (
  id VARCHAR(64) PRIMARY KEY,
  folio VARCHAR(30) UNIQUE NOT NULL,
  categoria_id VARCHAR(64) NOT NULL,
  equipo_id VARCHAR(64) NULL,
  codigo_plai_asignado VARCHAR(80) NULL,
  usuario_nombre VARCHAR(120) NOT NULL,
  usuario_email VARCHAR(150) NOT NULL,
  usuario_telefono VARCHAR(30) NULL,
  usuario_institucion VARCHAR(150) NULL,
  fecha_uso DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  actividad TEXT NOT NULL,
  estado ENUM('Pendiente', 'Aprobada', 'Rechazada', 'En uso', 'Completada') DEFAULT 'Pendiente' NOT NULL,
  accesorios_incluidos TEXT NULL,
  condicion_salida VARCHAR(50) DEFAULT 'Excelente',
  observaciones_admin TEXT NULL,
  aprobado_por VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reservas_categoria (categoria_id),
  INDEX idx_reservas_fecha (fecha_uso),
  INDEX idx_reservas_estado (estado),
  CONSTRAINT fk_reservas_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. TABLA: incidencias_mantenimiento
-- --------------------------------------------------------------------
CREATE TABLE incidencias_mantenimiento (
  id VARCHAR(64) PRIMARY KEY,
  folio VARCHAR(30) UNIQUE NOT NULL,
  equipo_id VARCHAR(64) NOT NULL,
  codigo_plai VARCHAR(80) NOT NULL,
  equipo_nombre VARCHAR(150) NOT NULL,
  origen ENUM('Devolución de Préstamo', 'Revisión Periódica', 'Reporte de Usuario', 'Falla Operativa') DEFAULT 'Devolución de Préstamo' NOT NULL,
  tipo_falla ENUM('Hardware', 'Software', 'Calibración', 'Daño Físico', 'Accesorio Faltante', 'Limpieza y Óptica') NOT NULL,
  severidad ENUM('Baja', 'Media', 'Alta', 'Crítica') DEFAULT 'Media' NOT NULL,
  descripcion TEXT NOT NULL,
  estado ENUM('Reportada', 'En diagnóstico', 'En reparación', 'Esperando piezas', 'Resuelta') DEFAULT 'Reportada' NOT NULL,
  tecnico_responsable VARCHAR(120) NOT NULL,
  fecha_reporte DATETIME NOT NULL,
  fecha_resolucion DATETIME NULL,
  acciones_realizadas TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_incidencias_codigo (codigo_plai),
  INDEX idx_incidencias_estado (estado),
  CONSTRAINT fk_incidencias_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. TABLA: espacios
-- --------------------------------------------------------------------
CREATE TABLE espacios (
  id VARCHAR(64) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  capacidad INT NOT NULL,
  descripcion TEXT NOT NULL,
  caracteristicas JSON NOT NULL,
  color VARCHAR(20) DEFAULT '#0086ff' NOT NULL,
  estado ENUM('Disponible', 'Ocupado', 'Mantenimiento') DEFAULT 'Disponible' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- CARGA DE DATOS INICIALES (SEEDS / INSERTS OFICIALES DE PLAi)
-- ====================================================================

-- 1. Usuarios Oficiales (Req 11)
INSERT INTO usuarios (id, nombre, email, password, rol, estado, dependencia) VALUES
('usr-admin-01', 'Administrador General PLAi', 'admin@plai.edu.mx', '123admin', 'admin', 'Activo', 'Dirección de Innovación y Tecnología PLAi'),
('usr-user-01',  'Investigador / Alumno PLAi', 'user@plai.edu.mx',  '123user',  'usuario', 'Activo', 'Centro Universitario de Ciencias Exactas e Ingenierías'),
('usr-colab-01', 'Coordinador de Talleres',     'tallerista@plai.edu.mx', '123colab', 'colaborador', 'Activo', 'Laboratorio Maker Ciudad Creativa Digital');

-- 2. Categorías Oficiales
INSERT INTO categorias (id, nombre, descripcion, color, plai_usage, video_url, beneficios, casos_exito) VALUES
('realidad-virtual', 'Realidad Virtual', 'Explora nuestra colección de dispositivos de realidad virtual. Visores, controles y accesorios de última generación para experiencias inmersivas.', '#1e5ca7', 'En PLAi utilizamos los visores de Realidad Virtual para simular entornos de alto riesgo, recorridos inmersivos de arquitectura y diseño, y desarrollar competencias en metaverso e interacción 3D para instituciones educativas y empresas.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
 '["Simulación de entornos seguros", "Aprendizaje inmersivo 3D", "Reducción de costos en prototipos"]',
 '[{"title": "Recorrido Arquitectónico", "desc": "Visualización de un complejo habitacional antes de su construcción."}, {"title": "Simulador Médico", "desc": "Prácticas de cirugía para estudiantes de medicina sin riesgo."}]'),

('robotica', 'Robótica', 'Kits, brazos robóticos y componentes de automatización para aprender construyendo.', '#0ea5e9', 'Los laboratorios de robótica de PLAi permiten a los estudiantes y profesionales realizar prototipados rápidos, entender la automatización industrial (Industria 4.0) y programar desde cero algoritmos de inteligencia artificial aplicada al hardware.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
 '["Prototipado rápido", "Automatización Industrial", "Programación de hardware aplicado"]',
 '[{"title": "Brazo Clasificador", "desc": "Sistema robótico capaz de clasificar piezas por color mediante visión por computadora."}, {"title": "Vehículo Autónomo", "desc": "Prototipo a escala para navegación en almacenes logísticos."}]'),

('fabricacion-digital', 'Fabricación Digital', 'Impresoras 3D, escáneres y materiales para transformar diseños en objetos reales.', '#ed8d1b', 'Promovemos la cultura Maker en Jalisco permitiendo que emprendedores y estudiantes validen sus diseños físicos rápidamente antes de pasar a producción masiva, sin costo de maquinaria ni licencias bajo la modalidad Trae tu filamento.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
 '["Validación de diseños", "Cultura Maker", "Sin costo de maquinaria"]',
 '[{"title": "Prótesis 3D", "desc": "Desarrollo e impresión de prótesis de bajo costo para niños."}, {"title": "Moldes Industriales", "desc": "Creación de moldes rápidos para inyección de plásticos."}]'),

('drones', 'Drones', 'Drones profesionales y educativos para captura aérea, mapeo y entrenamiento de vuelo.', '#10b981', 'Con nuestra flota de Drones, apoyamos capacitaciones en fotogrametría, agricultura de precisión, seguridad y producciones audiovisuales, preparando a los asistentes para certificaciones de vuelo.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
 '["Fotogrametría avanzada", "Agricultura de precisión", "Capacitación para certificaciones"]',
 '[{"title": "Mapeo Agrícola", "desc": "Análisis de cultivos mediante cámaras multiespectrales para optimizar riego."}, {"title": "Inspección de Estructuras", "desc": "Revisión segura de puentes y torres de telecomunicaciones."}]'),

('computo-multimedia', 'Cómputo / Multimedia', 'Equipos de alto rendimiento para diseño, edición, gaming y desarrollo.', '#0086ff', 'Estaciones de trabajo de grado profesional disponibles para compilar código complejo, realizar renders arquitectónicos o desarrollar videojuegos pesados sin depender de infraestructura costosa propia.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
 '["Renders ultrarrápidos", "Desarrollo sin límites", "Edición de video 8K"]',
 '[{"title": "Desarrollo de Videojuego", "desc": "Creación de assets y compilación de un título indie en Unreal Engine 5."}, {"title": "Postproducción de Cortometraje", "desc": "Edición, colorización y renderizado de un proyecto cinematográfico local."}]');

-- 3. Equipos Oficiales de Inventario PLAi
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, codigo_plai, numero_serie, almacenamiento, estado, ubicacion, especificaciones, accesorios, imagen_emoji, responsable) VALUES
('eq-vr-001', 'realidad-virtual', 'Meta Quest 3 512GB', 'Meta', 'Quest 3', 'PLAI-VR-001', 'SN-MQ3-00892', '512 GB', 'Disponible', 'Laboratorio de Realidad Virtual (Torre C)', '["Snapdragon XR2 Gen 2", "512 GB Almacenamiento", "Resolución 4K+ Infinite Display", "Passthrough a color de alta fidelidad"]', '["2x Controladores Touch Plus", "Correa estándar", "Adaptador 18W", "Cable USB-C 1m", "Interfaz facial"]', '🥽', 'Ing. Carlos Mendoza'),
('eq-vr-002', 'realidad-virtual', 'Meta Quest 3 128GB #02', 'Meta', 'Quest 3', 'PLAI-VR-002', 'SN-MQ3-01044', '128 GB', 'Disponible', 'Laboratorio de Realidad Virtual (Torre C)', '["Snapdragon XR2 Gen 2", "128 GB Almacenamiento", "Passthrough a color"]', '["2x Controladores Touch Plus", "Cable de carga", "Adaptador corriente"]', '🥽', 'Ing. Carlos Mendoza'),
('eq-vr-003', 'realidad-virtual', 'HTC Vive Pro 2 Full Kit', 'HTC', 'Vive Pro 2', 'PLAI-VR-003', 'SN-HTC-99231', 'N/A', 'Disponible', 'Laboratorio de Realidad Virtual (Torre C)', '["Resolución 5K (4896 x 2448)", "Campo de visión de 120°", "Frecuencia 120Hz"]', '["2x Estaciones base 2.0", "2x Controles Vive", "Link Box", "Arnés de cables"]', '🥽', 'Ing. Carlos Mendoza'),
('eq-rob-001', 'robotica', 'Brazo Robótico DOBOT Magician', 'DOBOT', 'Magician Basic', 'PLAI-RB-001', 'SN-DOB-44102', 'N/A', 'Disponible', 'Laboratorio de Robótica (Torre C)', '["4 grados de libertad", "Carga útil 500g", "Repetibilidad 0.2mm", "Software DobotStudio"]', '["Módulo ventosa de vacío", "Pinza neumática", "Kit de escritura y dibujo", "Módulo de impresión 3D"]', '🤖', 'Mtro. Roberto Morales'),
('eq-rob-002', 'robotica', 'Kit de Robótica Arduino Mega Pro', 'Arduino', 'Mega 2560 R3', 'PLAI-RB-002', 'SN-ARD-88123', 'N/A', 'Disponible', 'Laboratorio de Robótica (Torre C)', '["Microcontrolador ATmega2560", "54 pines I/O digitales", "16 entradas analógicas"]', '["Chasis de 4 ruedas", "Sensor ultrasónico HC-SR04", "Shield puente H L298N", "Batería LiPo"]', '🤖', 'Mtro. Roberto Morales'),
('eq-rob-003', 'robotica', 'Placa Raspberry Pi 4 Model B 8GB', 'Raspberry Pi', 'Model B', 'PLAI-RB-003', 'SN-RPI-77114', 'MicroSD 64GB', 'Disponible', 'Laboratorio de Robótica (Torre C)', '["Procesador Broadcom BCM2711 quad-core 1.5GHz", "8GB RAM LPDDR4", "Gigabit Ethernet"]', '["Carcasa de aluminio con ventilador", "MicroSD 64GB con Raspberry Pi OS", "Fuente USB-C 5V 3A"]', '🤖', 'Mtro. Roberto Morales'),
('eq-fab-001', 'fabricacion-digital', 'Impresora 3D Bambu Lab X1-Carbon Combo', 'Bambu Lab', 'X1-Carbon', 'PLAI-FD-001', 'SN-BMB-33019', 'MicroSD 32GB', 'Disponible', 'Taller de Fabricación Digital (Torre C)', '["Velocidad hasta 500 mm/s", "Volumen 256x256x256 mm", "Cámara con IA para detección de fallos", "Boquilla de acero endurecido hasta 300°C"]', '["Sistema AMS (multimaterial 4 colores)", "Placa texturizada PEI", "Herramientas de mantenimiento", "Boquilla de repuesto 0.4mm"]', '🖨️', 'Lic. Sofía Valenzuela'),
('eq-fab-002', 'fabricacion-digital', 'Impresora 3D Prusa i3 MK3S+', 'Original Prusa', 'i3 MK3S+', 'PLAI-FD-002', 'SN-PRS-55102', 'SD Card 16GB', 'Disponible', 'Taller de Fabricación Digital (Torre C)', '["Sensor de filamento óptico", "Base magnética calefactada", "Volumen 250x210x210 mm"]', '["Lámina PEI de acero lisa", "Tarjeta SD 16GB", "Juego de llaves Allen", "Alicates de corte"]', '🖨️', 'Lic. Sofía Valenzuela'),
('eq-fab-003', 'fabricacion-digital', 'Escáner 3D Revopoint MINI', 'Revopoint', 'MINI', 'PLAI-FD-003', 'SN-REV-12903', 'N/A', 'Disponible', 'Taller de Fabricación Digital (Torre C)', '["Luz azul de grado industrial", "Precisión de hasta 0.02 mm", "Distancia de punto 0.05 mm"]', '["Mesa giratoria de doble eje", "Soporte para trípode", "Cable USB 2 en 1", "Estatua de calibración"]', '🖨️', 'Lic. Sofía Valenzuela'),
('eq-dro-001', 'drones', 'Dron DJI Mini 3 Pro con DJI RC', 'DJI', 'Mini 3 Pro', 'PLAI-DR-001', 'SN-DJI-66441', 'MicroSD 128GB', 'Disponible', 'Laboratorio de Captura Aérea (Torre C)', '["Peso menor a 249g", "Sensor 1/1.3 pulgadas CMOS 48MP", "Grabación 4K HDR a 60fps", "Detección de obstáculos tridireccional"]', '["Control remoto DJI RC con pantalla", "3x Baterías de vuelo inteligentes", "Centro de carga bidireccional", "Bolsa de transporte"]', '🛸', 'Ing. Fernando Tapia'),
('eq-dro-002', 'drones', 'Dron DJI Mavic Air 2 Fly More', 'DJI', 'Mavic Air 2', 'PLAI-DR-002', 'SN-DJI-88201', 'MicroSD 128GB', 'Disponible', 'Laboratorio de Captura Aérea (Torre C)', '["Video 4K a 60fps", "Fotos 48 MP", "FocusTrack y SmartPhoto", "Tiempo de vuelo máx. 34 min"]', '["Control remoto", "3x Baterías", "Juego de filtros ND (16/64/256)", "Maletín de viaje"]', '🛸', 'Ing. Fernando Tapia'),
('eq-com-001', 'computo-multimedia', 'Workstation Alienware Aurora R15 RTX 4090', 'Dell Alienware', 'Aurora R15', 'PLAI-PC-001', 'SN-ALW-99120', '2TB NVMe SSD + 2TB HDD', 'Disponible', 'Laboratorio Multimedia (Torre C, Piso 2)', '["Intel Core i9-13900KF", "64GB DDR5 5200MHz", "NVIDIA GeForce RTX 4090 24GB GDDR6X", "Enfriamiento líquido Alienware Cryo-tech"]', '["Teclado mecánico multimedia Alienware", "Ratón gamer óptico", "Cable de alimentación", "Monitor Dell 32 pulgadas 4K 144Hz"]', '💻', 'Ing. Daniel Orozco'),
('eq-com-002', 'computo-multimedia', 'Laptop MacBook Pro 16 M3 Max', 'Apple', 'MacBook Pro 16', 'PLAI-PC-002', 'SN-APL-44211', '1TB SSD', 'Disponible', 'Laboratorio Multimedia (Torre C, Piso 2)', '["Chip Apple M3 Max (CPU 16 núcleos, GPU 40 núcleos)", "48GB memoria unificada", "Pantalla Liquid Retina XDR 120Hz"]', '["Adaptador de corriente USB-C 140W", "Cable USB-C a MagSafe 3 (2m)", "Funda protectora acolchada"]', '💻', 'Ing. Daniel Orozco');

-- 4. Aplicaciones Oficiales VR / PC
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES
('app-01', 'Beat Saber', 'Beat Games', '1.34.0', 'Juego Interactivo', 'Meta Quest + PC', '3+', 'Juego rítmico de realidad virtual donde cortas bloques con sables de luz al ritmo de música electrónica.', '/images/apps/beat-saber.jpg', 6, 'Activa'),
('app-02', 'Gravity Sketch', 'Gravity Sketch Ltd', '6.1.2', 'Arte y Creatividad', 'Meta Quest + PC', 'Todas las edades', 'Plataforma intuitiva de diseño y modelado 3D en realidad virtual para creativos e ingenieros.', '/images/apps/gravity-sketch.jpg', 4, 'Activa'),
('app-03', 'Tilt Brush by Google', 'Google', '23.0', 'Arte y Creatividad', 'Meta Quest + PC', 'Todas las edades', 'Pinta en un espacio tridimensional con realidad virtual. Libera tu creatividad con pinceladas tridimensionales.', '/images/apps/tilt-brush.jpg', 5, 'Activa'),
('app-04', 'Robo Recall', 'Epic Games', '1.1.0', 'Experiencia VR', 'PC', '12+', 'Shooter de acción en realidad virtual con físicas avanzadas, gráficos de última generación y combate táctico.', '/images/apps/robo-recall.jpg', 2, 'Activa'),
('app-05', 'The Thrill of the Fight', 'Sealost Interactive', '2.0.4', 'Deportes VR', 'Meta Quest', '12+', 'Simulador de boxeo en realidad virtual auténtico centrado en la física y el acondicionamiento físico.', '/images/apps/thrill-fight.jpg', 3, 'Activa'),
('app-06', 'Ocean Rift', 'Picselica Ltd', '3.5.0', 'Ciencia y Naturaleza', 'Meta Quest', 'Todas las edades', 'Safari acuático en realidad virtual para explorar hábitats submarinos con tiburones, delfines y ballenas.', '/images/apps/ocean-rift.jpg', 4, 'Activa'),
('app-07', 'Unreal Engine 5.4', 'Epic Games', '5.4.1', 'Simulación', 'PC', 'Todas las edades', 'Motor líder de desarrollo 3D en tiempo real para creación de videojuegos, simulaciones y producción virtual.', '/images/apps/unreal-engine.jpg', 2, 'Activa'),
('app-08', 'Blender 4.2 LTS', 'Blender Foundation', '4.2.0', 'Arte y Creatividad', 'PC', 'Todas las edades', 'Suite de creación 3D de código abierto para modelado, rigging, animación, simulación y renderizado.', '/images/apps/blender.jpg', 3, 'Activa'),
('app-09', 'DJI Fly Simulator', 'DJI Technology', '1.8.0', 'Simulación', 'PC', 'Todas las edades', 'Simulador oficial para aprender y perfeccionar habilidades de vuelo de drones DJI en entornos virtuales.', '/images/apps/dji-fly.jpg', 2, 'Activa'),
('app-10', 'Bambu Studio', 'Bambu Lab', '1.9.1', 'Simulación', 'PC', 'Todas las edades', 'Software oficial de corte y preparación de modelos 3D para impresión de alta velocidad y multimaterial.', '/images/apps/bambu-studio.jpg', 3, 'Activa');

-- 5. Bitácora de Uso Inicial
INSERT INTO bitacora_uso (id, equipo_id, codigo_plai, equipo_nombre, usuario_nombre, usuario_email, usuario_dependencia, fecha_entrega, fecha_devolucion_estimada, fecha_devolucion_real, estado_prestamo, condicion_entrega, condicion_devolucion, accesorios_entregados, accesorios_devueltos, observaciones_entrega, admin_entrega) VALUES
('bit-001', 'eq-vr-001', 'PLAI-VR-001', 'Meta Quest 3 512GB', 'Lic. Mariana Torres', 'mariana.torres@cudi.edu.mx', 'Universidad de Guadalajara', '2026-10-10 09:30:00', '2026-10-10 13:30:00', '2026-10-10 13:15:00', 'Devuelto', 'Excelente', 'Excelente', '2 Controles Touch Plus, cargador original, cable USB-C', 'Todos completos', 'Préstamo para taller de arquitectura inmersiva', 'Ing. Carlos Mendoza'),
('bit-002', 'eq-dro-001', 'PLAI-DR-001', 'Dron DJI Mini 3 Pro con DJI RC', 'Arq. Sergio Velasco', 'svelasco@jalteca.mx', 'Secretaría de Medio Ambiente Jalisco', '2026-10-12 10:00:00', '2026-10-12 16:00:00', '2026-10-12 15:45:00', 'Devuelto', 'Excelente', 'Bueno', 'Control DJI RC, 3 baterías, cargador múltiple, maletín', 'Todos completos', 'Mapeo fotogramétrico en Ciudad Creativa Digital', 'Ing. Fernando Tapia');

-- 6. Reservaciones Iniciales
INSERT INTO reservaciones (id, folio, categoria_id, equipo_id, codigo_plai_asignado, usuario_nombre, usuario_email, usuario_telefono, usuario_institucion, fecha_uso, hora_inicio, hora_fin, actividad, estado, accesorios_incluidos, condicion_salida, observaciones_admin) VALUES
('res-001', 'RES-2026-001', 'realidad-virtual', 'eq-vr-001', 'PLAI-VR-001', 'Ana García Rivera', 'ana.garcia@alumnos.udg.mx', '33 1892 4401', 'Universidad de Guadalajara (CUAAD)', '2026-11-20', '10:00:00', '12:30:00', 'Evaluación de proyecto de grado de arquitectura espacial.', 'Aprobada', 'Controles Touch Plus y cable Link Box', 'Excelente', 'Asignado equipo Meta Quest 3 #01'),
('res-002', 'RES-2026-002', 'fabricacion-digital', 'eq-fab-001', 'PLAI-FD-001', 'Ing. Carlos Rivas', 'carlos.rivas@startupjalisco.com', '33 2201 9944', 'Startup Hub CCD', '2026-11-21', '09:00:00', '14:00:00', 'Impresión de carcasa para dispositivo IoT médico. Trae filamento PETG propio.', 'Pendiente', 'Placa texturizada PEI y boquilla 0.4mm', 'Excelente', 'Requiere revisión técnica de archivo STL previo');

-- 7. Espacios Físicos
INSERT INTO espacios (id, nombre, capacidad, descripcion, caracteristicas, color, estado) VALUES
('auditorio', 'Auditorio Principal', 150, 'Espacio ideal para conferencias magistrales, exhibiciones de proyectos y eventos corporativos con capacidad acústica profesional.', '["Proyector láser 4K", "Sistema de audio envolvente", "Iluminación escénica DMX", "Wi-Fi dedicado 1 Gbps"]', '#0086ff', 'Disponible'),
('aula-robotica', 'Aula de Robótica y Automatización', 30, 'Laboratorio equipado para prácticas de mecatrónica, cinemática, IoT y programación embebida.', '["15 Estaciones de trabajo", "Osciloscopios digitales", "Brazos DOBOT Magician", "Cautines y extractores de humo"]', '#0ea5e9', 'Disponible'),
('taller-maker', 'Taller de Fabricación Digital (FabLab)', 25, 'Espacio de prototipado rápido con impresoras 3D, escaneo tridimensional y estación de postprocesado.', '["Impresoras Bambu Lab y Prusa", "Escáneres Revopoint", "Herramientas de banco y corte", "Mesa de trabajo para 25 personas"]', '#ed8d1b', 'Disponible'),
('lab-vr', 'Laboratorio de Tecnologías Inmersivas (VR/AR)', 20, 'Área despejada de 80 m² con sensores perimetrales para simulación inmersiva y experiencias multiusuario.', '["Área despejada libre de obstáculos", "Puntos de anclaje para visores PC-VR", "Monitores auxiliares para espectadores", "Red local de baja latencia"]', '#1e5ca7', 'Disponible');
