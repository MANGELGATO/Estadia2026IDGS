-- ============================================================================
-- PLATAFORMA ABIERTA DE INNOVACIÓN Y DESARROLLO DE JALISCO (PLAi)
-- SISTEMA DE GESTIÓN DE RECURSOS, LABORATORIOS Y ESPACIOS
-- Migración 02: Datos iniciales (Seeds) compatibles con PostgreSQL 15/16 y Neon
-- ============================================================================
-- Script idempotente (ON CONFLICT DO NOTHING):
--   * Puede ejecutarse múltiples veces sin duplicar ni sobrescribir registros.
--   * Ejecutar después de database/01_schema_postgresql.sql.
--   * NO incluye credenciales reales ni contraseñas en texto plano.
--     Consulte la sección 6 de este archivo e INSTRUCCIONES_MONTAJE_PC.md
--     para dar de alta el usuario administrador inicial de PLAi.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. CATEGORÍAS TECNOLÓGICAS OFICIALES
-- ----------------------------------------------------------------------------
INSERT INTO categorias (id, nombre, descripcion, color, plai_usage, video_url, beneficios, casos_exito) VALUES (
  'realidad-virtual', 'Realidad Virtual', 'Explora nuestra colección de dispositivos de realidad virtual. Visores, controles y accesorios de última generación para experiencias inmersivas.', '#1e5ca7', 'En PLAi utilizamos los visores de Realidad Virtual para simular entornos de alto riesgo, recorridos inmersivos de arquitectura y diseño, y desarrollar competencias en metaverso e interacción 3D para instituciones educativas y empresas.', '', '["Simulación de entornos seguros","Aprendizaje inmersivo 3D","Reducción de costos en prototipos"]'::jsonb, '[{"title":"Recorrido Arquitectónico","desc":"Visualización de un complejo habitacional antes de su construcción."},{"title":"Simulador Médico","desc":"Prácticas de cirugía para estudiantes de medicina sin riesgo."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nombre, descripcion, color, plai_usage, video_url, beneficios, casos_exito) VALUES (
  'robotica', 'Robótica', 'Kits, brazos robóticos y componentes de automatización para aprender construyendo.', '#0ea5e9', 'Los laboratorios de robótica de PLAi permiten a los estudiantes y profesionales realizar prototipados rápidos, entender la automatización industrial (Industria 4.0) y programar desde cero algoritmos de inteligencia artificial aplicada al hardware.', '', '["Prototipado rápido","Automatización Industrial","Programación de hardware aplicado"]'::jsonb, '[{"title":"Brazo Clasificador","desc":"Sistema robótico capaz de clasificar piezas por color mediante visión por computadora."},{"title":"Vehículo Autónomo","desc":"Prototipo a escala para navegación en almacenes logísticos."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nombre, descripcion, color, plai_usage, video_url, beneficios, casos_exito) VALUES (
  'fabricacion-digital', 'Fabricación Digital', 'Impresoras 3D, escáneres y materiales para transformar diseños en objetos reales.', '#ed8d1b', 'Promovemos la cultura Maker en Jalisco permitiendo que emprendedores y estudiantes validen sus diseños físicos rápidamente antes de pasar a producción masiva, sin costo de maquinaria ni licencias.', '', '["Validación de diseños","Cultura Maker","Sin costo de maquinaria"]'::jsonb, '[{"title":"Prótesis 3D","desc":"Desarrollo e impresión de prótesis de bajo costo para niños."},{"title":"Moldes Industriales","desc":"Creación de moldes rápidos para inyección de plásticos."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nombre, descripcion, color, plai_usage, video_url, beneficios, casos_exito) VALUES (
  'drones', 'Drones', 'Drones profesionales y educativos para captura aérea, mapeo y entrenamiento de vuelo.', '#10b981', 'Con nuestra flota de Drones, apoyamos capacitaciones en fotogrametría, agricultura de precisión, seguridad y producciones audiovisuales, preparando a los asistentes para certificaciones de vuelo.', '', '["Fotogrametría avanzada","Agricultura de precisión","Capacitación para certificaciones"]'::jsonb, '[{"title":"Mapeo Agrícola","desc":"Análisis de cultivos mediante cámaras multiespectrales para optimizar riego."},{"title":"Inspección de Estructuras","desc":"Revisión segura de puentes y torres de telecomunicaciones."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;
INSERT INTO categorias (id, nombre, descripcion, color, plai_usage, video_url, beneficios, casos_exito) VALUES (
  'computo-multimedia', 'Cómputo / Multimedia', 'Equipos de alto rendimiento para diseño, edición, gaming y desarrollo.', '#0086ff', 'Estaciones de trabajo de grado profesional disponibles para compilar código complejo, realizar renders arquitectónicos o desarrollar videojuegos pesados sin depender de infraestructura costosa propia.', '', '["Renders ultrarrápidos","Desarrollo sin límites","Edición de video 8K"]'::jsonb, '[{"title":"Desarrollo de Videojuego","desc":"Creación de assets y compilación de un título indie en Unreal Engine 5."},{"title":"Postproducción de Cortometraje","desc":"Edición, colorización y renderizado de un proyecto cinematográfico local."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. CATÁLOGO DE EQUIPOS DE LABORATORIO (27 activos oficiales)
-- ----------------------------------------------------------------------------
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'vr-01', 'realidad-virtual', 'Meta Quest 3 (512 GB)', 'Meta', 'Quest 3 512 GB', '512 GB', '1WMHH8100A01', '5151000013-1', 'Disponible', 'Área de Realidad Virtual (Laboratorio)', '["Almacenamiento 512 GB","Chip Snapdragon XR2 Gen 2","Passthrough a color alta resolución (MR)","Seguimiento de manos (Hand Tracking) con IA","Lentes Fresnel de alto rendimiento"]'::jsonb, '["2 Controladores Touch Plus","Correa estándar","Cable USB-C y adaptador de corriente"]'::jsonb, '🥽', '/images/equipos/meta-quest-3.png', 'Laboratorio de Tecnologías Inmersivas', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'vr-02', 'realidad-virtual', 'Meta Quest 3 (512 GB) - Lote #4', 'Meta', 'Quest 3 512 GB', '512 GB', '1WMHH8100A04', '5151000013-4', 'En uso', 'Área de Realidad Virtual', '["Almacenamiento 512 GB","Chip Snapdragon XR2 Gen 2","Conectividad inalámbrica PC-VR Wi-Fi 6E","Autonomía 2.2 hrs"]'::jsonb, '["2 Controladores Touch Plus","Cable de carga"]'::jsonb, '🥽', '/images/equipos/meta-quest-3.png', 'Laboratorio de Tecnologías Inmersivas', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'vr-03', 'realidad-virtual', 'Oculus Quest VR (128 GB)', 'Oculus', 'Quest VR 128 GB', '128 GB', '1WMHH8007701', '5151000077-1', 'Disponible', 'Área de Realidad Virtual', '["Almacenamiento 128 GB","Pantalla dual OLED 1440×1600 por ojo","Sistema de tracking Oculus Insight 6DoF","Audio espacial integrado"]'::jsonb, '["2 Controladores Oculus Touch","Espaciador para lentes","Cargador oficial"]'::jsonb, '🥽', '/images/equipos/meta-quest-2.png', 'Laboratorio de Tecnologías Inmersivas', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'vr-04', 'realidad-virtual', 'Oculus Quest VR (128 GB) - Incidencia', 'Oculus', 'Quest VR 128 GB', '128 GB', '1WMHH8007712', '5151000077-12', 'En mantenimiento', 'Taller de Soporte / Mantenimiento', '["128 GB","Falla reportada en inventario: Display dañado","En diagnóstico técnico"]'::jsonb, '["2 Controladores Oculus Touch"]'::jsonb, '🥽', '/images/equipos/meta-quest-2.png', 'Laboratorio de Tecnologías Inmersivas', 'Display dañado en proceso de diagnóstico técnico'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'vr-05', 'realidad-virtual', 'HTC Vive Pro 2 Kit Completo', 'HTC', 'Vive Pro 2', 'N/A (PC-VR)', 'HTC-VP2-2023-001', '5151000015-1', 'Disponible', 'Área de Realidad Virtual (Laboratorio)', '["Resolución 5K (4896×2448)","Frecuencia de actualización hasta 120 Hz","Campo de visión de 120 grados (FOV)","Tracking SteamVR 2.0 con estaciones base"]'::jsonb, '["2 Estaciones base SteamVR 2.0","2 Controladores HTC Vive Wand","Cables de enlace y Link Box"]'::jsonb, '🥽', '/images/equipos/htc-vive-pro-2.png', 'Laboratorio de Tecnologías Inmersivas', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'rob-01', 'robotica', 'Brazo Robótico DOBOT Magician', 'DOBOT', 'Magician Lite', 'N/A', 'DB-MAG-2024-011', 'PLAI-ROB-011', 'Disponible', 'Laboratorio de Robótica', '["Payload 250g","Alcance 320 mm","Repetibilidad ±0.2 mm","4 ejes articulados"]'::jsonb, '["Cabezal de pluma","Succionador de vacío","Pinza de agarre","Cable USB"]'::jsonb, '🦾', '/images/equipos/dobot-magician.png', 'Área de Automatización', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'rob-02', 'robotica', 'Kit Lego Education SPIKE (5 piezas)', 'Lego Education', 'SPIKE Prime', 'N/A', 'LEGO-SPIKE-5151', '5151000085', 'Disponible', 'Laboratorio de Robótica y Aulas STEAM', '["Robots didácticos programables","Compatibilidad oficial \"Made for iPad\" y PC","Sensores de color, distancia y fuerza","Hub inteligente con matriz LED 5×5"]'::jsonb, '["Contenedor amarillo de plástico rígido y apilable","Batería recargable","Cables y conectores"]'::jsonb, '🤖', '/images/equipos/arduino-mega.png', 'Área de Automatización', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'rob-03', 'robotica', 'OHBOT Cabeza Robótica Expresiva', 'OHBOT', 'Humanoid Head V2', 'N/A', 'OHBOT-V2-052', 'PLAI-ROB-052', 'Disponible', 'Laboratorio de Robótica', '["Servomotores acoplados laterales","Generación de expresiones faciales y giros de cabeza","Ojos esféricos con diseño realista","Boca curva en forma de sonrisa","Programable en Python y Scratch"]'::jsonb, '["Base de soporte","Cable de conexión USB"]'::jsonb, '🗣️', '/images/equipos/dobot-magician.png', 'Área de Automatización', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'rob-04', 'robotica', 'Mano Robótica con Tendones', 'PLAi Lab / Open Hardware', 'Bionic Hand Pro', 'N/A', 'PLAI-BIONIC-063', 'PLAI-ROB-063', 'Disponible', 'Laboratorio de Robótica', '["Sistema de tendones con hilos tensores en falanges","Operado mediante microcontrolador Arduino","Control de apertura y agarre articulado"]'::jsonb, '["Protoboard de pruebas","Cables de conexión tipo jumper","Placa Arduino"]'::jsonb, '🖐️', '/images/equipos/arduino-mega.png', 'Área de Automatización', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'rob-05', 'robotica', 'Robot Cuadrúpedo Tipo Araña', 'PLAi Lab', 'Spider Bot Nano', 'N/A', 'PLAI-SPIDER-074', 'PLAI-ROB-074', 'Disponible', 'Laboratorio de Robótica', '["Chasis y patas de plástico/acrílico negro","4 patas articuladas con múltiples grados de libertad","Micro servomotores en cada articulación","Arduino Nano con shield de expansión azul"]'::jsonb, '["Batería LiPo","Shield de conexiones"]'::jsonb, '🕷️', '/images/equipos/arduino-mega.png', 'Área de Automatización', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'rob-06', 'robotica', 'Robot Cuadrúpedo 3D', 'PLAi Lab', 'Quadruped SG90', 'N/A', 'PLAI-QUAD-075', 'PLAI-ROB-075', 'Disponible', 'Laboratorio de Robótica', '["Estructura impresa en 3D en PLA","Múltiples servomotores SG-90","Marcha omnidireccional"]'::jsonb, '["Controlador de servomotores","Portapilas"]'::jsonb, '🐾', '/images/equipos/arduino-mega.png', 'Área de Automatización', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'rob-07', 'robotica', 'Robot Humanoide Abilix H1 Standard', 'Abilix', 'Humanoid Robot H1 Standard Set', 'N/A', 'ABX-H1-2023-041', 'PLAI-ROB-041', 'Disponible', 'Laboratorio de Robótica', '["Robot bípedo programable","Múltiples servomotores de precisión","Control de equilibrio dinámico y coreografías"]'::jsonb, '["Caja original de empaque","Batería y cargador","Manual de programación"]'::jsonb, '🤖', '/images/equipos/dobot-magician.png', 'Área de Automatización', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'rob-08', 'robotica', 'Creative Brick C1-S Abilix', 'Abilix', 'Creative Brick C1-S', 'N/A', 'ABX-C1S-2023-042', 'PLAI-ROB-042', 'Disponible', 'Laboratorio de Robótica', '["Módulo cerebral de control robótico","Engranes y transmisión mecánica","Programación por bloques"]'::jsonb, '["Caja de almacenamiento","Sensores y motores modulares"]'::jsonb, '⚙️', '/images/equipos/arduino-mega.png', 'Área de Automatización', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'fab-01', 'fabricacion-digital', 'Impresora 3D Bambu Lab X1-Carbon', 'Bambu Lab', 'X1 Carbon AMS', '4 GB + MicroSD', 'BAMBU-X1C-9912', 'PLAI-FAB-009', 'En uso', 'Taller de Fabricación Digital', '["Sistema AMS multi-material (4 filamentos)","Cinemática Core XY de alta velocidad (500 mm/s)","Sensor Micro Lidar y cámara asistida por IA","Cámara cerrada con aislamiento térmico","Soporta Nylon, Fibra de carbono, ABS, TPU, PLA"]'::jsonb, '["Módulo AMS superior","Placa de construcción texturizada","Juego de boquillas de repuesto"]'::jsonb, '🖨️', '/images/equipos/bambu-lab-x1c.png', 'Taller de Fabricación Digital', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'fab-02', 'fabricacion-digital', 'Escáner 3D Miraco Plus', 'Revopoint 3D Technologies', 'Miraco Plus Standalone', '256 GB eMMC', 'MIRACO-PLUS-008', 'PLAI-FAB-014', 'Disponible', 'Taller de Fabricación Digital', '["Escáner 3D volumétrico autónomo","Proyección de luz infrarroja y láser estructurada","Cálculo de distancia y nube de millones de puntos","Pantalla táctil abatible","Captura fotorealista en color"]'::jsonb, '["Kit de calibración con placas cuadrícula","Tripié articulado","Cable USB-C de transferencia"]'::jsonb, '📡', '/images/equipos/revopoint-3d.png', 'Taller de Fabricación Digital', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'fab-03', 'fabricacion-digital', 'Mini Fresadora CNC de Escritorio', 'CNC Desktop Pro', '3-Axis Micro CNC', 'N/A', 'CNC-3018-091', 'PLAI-FAB-021', 'Disponible', 'Taller de Fabricación Digital', '["Mecanizado sustractivo en 3 ejes simultáneos (X, Y, Z)","Husillo giratorio de altas revoluciones","Control Numérico por Computadora (Código G)","Tallado de madera, plásticos y prototipos PCB"]'::jsonb, '["Juego de fresas y brocas","Llaves de apriete","Cable de control PC"]'::jsonb, '⚙️', '/images/equipos/prusa-i3.png', 'Taller de Fabricación Digital', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'fab-04', 'fabricacion-digital', 'Mini Torno de Escritorio Manual', 'Precision Mini Lathe', 'Benchtop Lathe 100', 'N/A', 'LATHE-100-019', 'PLAI-FAB-022', 'Disponible', 'Taller de Fabricación Digital', '["Fabricación de piezas cilíndricas y roscas","Mandril (Chuck) con mordazas ajustables","Carro transversal y bancada rectificada","Diales de precisión milimétricos en cobre","Control manual con volantes frontales"]'::jsonb, '["Llave de mandril","Juego de buriles de corte","Centro giratorio"]'::jsonb, '🔩', '/images/equipos/prusa-i3.png', 'Taller de Fabricación Digital', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'fab-05', 'fabricacion-digital', 'Mini Fresadora / Taladro Vertical Manual', 'Modular Drill Pro', 'Vertical Mill 200', 'N/A', 'MILL-200-043', 'PLAI-FAB-023', 'Disponible', 'Taller de Fabricación Digital', '["Perforado, tallado y desbastado de precisión","Mesa cruzada con manivelas en ejes X e Y","Prensa tornillo de banco para sujeción","Estructura modular en aluminio interconectable"]'::jsonb, '["Prensa de sujeción","Juego de brocas milimétricas"]'::jsonb, '🔧', '/images/equipos/prusa-i3.png', 'Taller de Fabricación Digital', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'fab-06', 'fabricacion-digital', 'Módulo de Grabado Láser Snapmaker', 'Snapmaker', 'Laser Module 200mW', 'N/A', 'SNAP-200-881', 'PLAI-FAB-024', 'Disponible', 'Taller de Fabricación Digital', '["Cabezal intercambiable para quemado y marcado","Láser de diodo 200mW a 405nm (Clase 3B)","Grabado en madera, cartón y cuero","Carcasa metálica con conectores rápidos"]'::jsonb, '["Gafas de seguridad certificadas para láser","Materiales de muestra"]'::jsonb, '⚡', '/images/equipos/bambu-lab-x1c.png', 'Taller de Fabricación Digital', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'dr-01', 'drones', 'Dron DJI Mavic 4 Pro', 'DJI', 'Mavic 4 Pro', '64 GB + MicroSD', 'DJI-MAV4-7711', 'PLAI-DR-001', 'Disponible', 'Gabinete de Drones y Filmación', '["Cámara Hasselblad profesional","Cuadricóptero para foto y video aéreo de alta resolución","Transmisión de video HD de largo alcance","Compatible con apps iOS y Android"]'::jsonb, '["Control remoto inteligente","2 Baterías de vuelo","Cargador múltiple","Estuche rígido"]'::jsonb, '🚁', '/images/equipos/dji-mini-3-pro.png', 'Coordinación de Infraestructura y Vuelo', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'dr-02', 'drones', 'Dron DJI Mini 5 Pro (4 piezas)', 'DJI', 'Mini 5 Pro', 'MicroSD hasta 512 GB', 'DJI-MINI5-2234', 'PLAI-DR-002', 'Reservado', 'Gabinete de Drones', '["Peso sub-249g (Ultraligero)","Evasión de obstáculos omnidireccional 360°","Gimbal mecánico de 3 ejes estabilizado","Vuelo autónomo y seguimiento ActiveTrack con IA"]'::jsonb, '["Control remoto con pantalla","Baterías inteligentes","Protectores de hélices"]'::jsonb, '🚁', '/images/equipos/dji-mini-3-pro.png', 'Coordinación de Infraestructura y Vuelo', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'dr-03', 'drones', 'Dron DJI FLIP Fly More Combo', 'DJI', 'DJI FLIP Fly More', 'MicroSD hasta 256 GB', 'DJI-FLIP-9011', 'PLAI-DR-003', 'Disponible', 'Gabinete de Drones', '["Categoría ultraligera 249g","Estructura con protectores de hélices circulares completas","Cámara frontal montada en estabilizador","Control remoto DJI RC 2 integrado"]'::jsonb, '["Control DJI RC 2 con pantalla","Baterías adicionales de reemplazo","Cargador de baterías"]'::jsonb, '🚁', '/images/equipos/dji-mini-3-pro.png', 'Coordinación de Infraestructura y Vuelo', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'dr-04', 'drones', 'Centro de Carga Inteligente DJI', 'DJI', 'Battery Charging Hub', 'N/A', 'DJI-HUB-4001', 'PLAI-DR-004', 'Disponible', 'Gabinete de Drones', '["Gestor inteligente para múltiples baterías de dron","Carga secuencial priorizando la batería con más carga","Modo almacenamiento al 60% para preservación de celdas","Modo Power Bank para recarga de controles y celulares","Protección térmica y bloqueo por sobrecarga"]'::jsonb, '["Cables de alimentación","Adaptador AC de alta potencia"]'::jsonb, '🔋', '/images/equipos/dji-mini-3-pro.png', 'Coordinación de Infraestructura y Vuelo', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'comp-01', 'computo-multimedia', 'Fuente de Alimentación Baku BK-1502D+', 'Baku', 'BK-1502D+ Regulable', 'N/A', 'BAKU-1502D-882', 'PLAI-COMP-001', 'Disponible', 'Área de Microelectrónica y Diagnóstico', '["Voltaje regulable de 0 a 15 Voltios","Corriente continua de hasta 2 Amperios","Pantalla digital para monitoreo de consumo en tiempo real","Alarma acústica y corte automático anti-cortocircuitos","Inyección de energía manual para revivir baterías"]'::jsonb, '["Cables con terminales banana y pinzas caimán","Cable de corriente AC"]'::jsonb, '🔌', '/images/equipos/raspberry-pi-4.png', 'Laboratorio de Microelectrónica y Diagnóstico', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'comp-02', 'computo-multimedia', 'Kit Domótico micro:bit Smart Home', 'BBC micro:bit', 'Smart Home Kit IoT', 'N/A', 'MBIT-IOT-3321', 'PLAI-COMP-002', 'Disponible', 'Laboratorio de Microelectrónica y STEAM', '["Placa micro:bit programable + placa de expansión","Sensores: temperatura, luz (LDR), sonido/ruido, humedad/nivel de agua","Actuadores: mini ventilador, lámpara LED, pantalla OLED","Educación STEAM y proyectos de Internet de las Cosas (IoT)"]'::jsonb, '["Estructura de maqueta modular de habitación","Cables dupont","Sensor kit completo"]'::jsonb, '🏠', '/images/equipos/raspberry-pi-4.png', 'Laboratorio de Microelectrónica y Diagnóstico', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'comp-03', 'computo-multimedia', 'MacBook Pro 16" M3 Max', 'Apple', 'MacBook Pro M3 Max', '1 TB SSD', 'APPL-MBP16-M3M', 'PLAI-COMP-005', 'Disponible', 'Sala de Cómputo Principal', '["Chip M3 Max 14-core","36 GB RAM unificada","1 TB SSD","Pantalla Liquid Retina XDR"]'::jsonb, '["Cargador MagSafe 140W","USB-C Hub"]'::jsonb, '💻', '/images/equipos/macbook-pro.png', 'Laboratorio de Innovación PLAi', NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO equipos (id, categoria_id, nombre, marca, modelo, almacenamiento, numero_serie, codigo_plai, estado, ubicacion, especificaciones, accesorios, imagen_emoji, imagen_url, responsable, observaciones) VALUES (
  'comp-04', 'computo-multimedia', 'Oculus Link PC Alienware Aurora', 'Alienware', 'Aurora R15', '2 TB NVMe SSD', 'ALW-AUR15-4090', 'PLAI-COMP-012', 'No disponible', 'Sala de Cómputo Principal', '["Intel Core i9-13900KF","NVIDIA RTX 4090 24GB","64 GB DDR5","2 TB NVMe SSD"]'::jsonb, '["Monitor 4K 144Hz","Teclado mecánico","Mouse gaming"]'::jsonb, '🖥️', '/images/equipos/oculus-link-pc.png', 'Laboratorio de Innovación PLAi', NULL
) ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. APLICACIONES VR Y PC (15 licencias / experiencias)
-- ----------------------------------------------------------------------------
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-1', 'Tilt Brush', 'Google', '1.0', 'Arte y Creatividad', 'Meta Quest', 'Todas las edades', 'Pinta en realidad virtual en 3D con pinceles y materiales mágicos. Ideal para talleres de arte inmersivo con niños.', '/images/apps/tilt-brush.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-2', 'Rec Room', 'Against Gravity', '1.0', 'Juego Interactivo', 'Meta Quest + PC', 'Todas las edades', 'Mundo social con minijuegos cooperativos: paintball, dodgeball, escape rooms. Excelente para grupos de niños.', '/images/apps/rec-room.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-3', 'Ocean Rift', 'Llyr ap Cenydd', '1.0', 'Ciencia y Naturaleza', 'Meta Quest', 'Todas las edades', 'Parque acuático virtual con tiburones, ballenas, delfines y tortugas. Experiencia educativa sobre el océano.', '/images/apps/ocean-rift.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-4', 'Beat Saber', 'Beat Games', '1.0', 'Juego Interactivo', 'Meta Quest', '6+', 'Juego rítmico con sables de luz. Coordina movimientos con la música. Muy popular en demostraciones para niños.', '/images/apps/beat-saber.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-5', 'Job Simulator', 'Owlchemy Labs', '1.0', 'Simulación', 'Meta Quest', 'Todas las edades', 'Simula trabajos cotidianos en un mundo futurista donde los robots hacen todo. Divertido y educativo.', '/images/apps/job-simulator.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-6', 'Vacation Simulator', 'Owlchemy Labs', '1.0', 'Simulación', 'Meta Quest', 'Todas las edades', 'Experiencia de vacaciones virtuales en playa, montaña y ciudad. Ideal para primeras experiencias VR con niños pequeños.', '/images/apps/vacation-simulator.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-7', 'National Geographic Explore VR', 'National Geographic', '1.0', 'Ciencia y Naturaleza', 'Meta Quest', 'Todas las edades', 'Explora la Antártida y Machu Picchu en VR. Kayak entre icebergs y aprende sobre ecosistemas.', '/images/apps/national-geographic.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-8', 'Spatial', 'Spatial Systems', '1.0', 'Experiencia VR', 'Meta Quest + PC', 'Todas las edades', 'Plataforma de colaboración y exhibiciones en VR. Usada para presentaciones de proyectos y galerías virtuales en PLAi.', '/images/apps/spatial.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-9', 'Richie''s Plank Experience', 'Toast VR', '1.0', 'Experiencia VR', 'Meta Quest', '10+', 'Experiencia de altura extrema en VR. Ideal para demostraciones del efecto de presencia en realidad virtual.', '/images/apps/richies-plank.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-10', 'Pistol Whip', 'Cloudhead Games', '1.0', 'Juego Interactivo', 'Meta Quest', '12+', 'Juego de acción rítmica al estilo John Wick. Muévete y dispara al ritmo de la música.', '/images/apps/pistol-whip.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-11', 'The Room VR', 'Fireproof Games', '1.0', 'Juego Educativo', 'Meta Quest', '10+', 'Juego de escape room con acertijos y puzzles en VR. Desarrolla pensamiento lógico y resolución de problemas.', '/images/apps/the-room-vr.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-12', 'Minecraft Education Edition', 'Microsoft', '1.0', 'Juego Educativo', 'PC', '6+', 'Versión educativa de Minecraft con lecciones de matemáticas, ciencias, historia y código.', '/images/apps/minecraft-education.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-13', 'Star Chart', 'Escape Velocity Limited', '1.0', 'Ciencia y Naturaleza', 'Meta Quest', 'Todas las edades', 'Planetario virtual interactivo. Explora constelaciones, planetas y galaxias. Perfecto para talleres de astronomía.', '/images/apps/star-chart.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-14', 'Fruit Ninja VR 2', 'Halfbrick Studios', '1.0', 'Juego Interactivo', 'Meta Quest', 'Todas las edades', 'Corta frutas volando con katanas en realidad virtual. Primera experiencia VR perfecta para niños pequeños.', '/images/apps/fruit-ninja-2.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO aplicaciones (id, nombre, desarrollador, version, categoria, plataforma, clasificacion_edad, descripcion, imagen_url, equipos_instalados, estado) VALUES (
  'app-15', 'Superhot VR', 'Superhot Team', '1.0', 'Juego Interactivo', 'Meta Quest', '12+', 'El tiempo solo avanza cuando te mueves. Juego de acción innovador que demuestra las capacidades únicas del VR.', '/images/apps/superhot.png', 1, 'Activa'
) ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. ESPACIOS FÍSICOS INSTITUCIONALES
-- ----------------------------------------------------------------------------
INSERT INTO espacios (id, nombre, tipo, capacidad, ubicacion, descripcion, caracteristicas, color, estado) VALUES (
  'auditorio', 'Auditorio Principal', 'Auditorio', 150, 'Torre C, Ciudad Creativa Digital, Guadalajara', 'Espacio ideal para conferencias magistrales, exhibiciones de proyectos y eventos corporativos con capacidad acústica profesional.', '["Proyector láser 4K","Sistema de audio envolvente","Iluminación escénica DMX","Wi-Fi dedicado 1 Gbps"]'::jsonb, '#0086ff', 'Disponible'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO espacios (id, nombre, tipo, capacidad, ubicacion, descripcion, caracteristicas, color, estado) VALUES (
  'aula-robotica', 'Aula de Robótica y Automatización', 'Laboratorio', 30, 'Torre C, Ciudad Creativa Digital, Guadalajara', 'Laboratorio equipado para prácticas de mecatrónica, cinemática, IoT y programación embebida.', '["15 Estaciones de trabajo","Osciloscopios digitales","Brazos DOBOT Magician","Cautines y extractores de humo"]'::jsonb, '#0ea5e9', 'Disponible'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO espacios (id, nombre, tipo, capacidad, ubicacion, descripcion, caracteristicas, color, estado) VALUES (
  'taller-maker', 'Taller de Fabricación Digital (FabLab)', 'Taller Maker', 25, 'Torre C, Ciudad Creativa Digital, Guadalajara', 'Espacio de prototipado rápido con impresoras 3D, escaneo tridimensional y estación de postprocesado.', '["Impresoras Bambu Lab y Prusa","Escáneres Revopoint","Herramientas de banco y corte","Mesa de trabajo para 25 personas"]'::jsonb, '#ed8d1b', 'Disponible'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO espacios (id, nombre, tipo, capacidad, ubicacion, descripcion, caracteristicas, color, estado) VALUES (
  'lab-vr', 'Laboratorio de Tecnologías Inmersivas (VR/AR)', 'Laboratorio VR', 20, 'Torre C, Ciudad Creativa Digital, Guadalajara', 'Área despejada de 80 m² con sensores perimetrales para simulación inmersiva y experiencias multiusuario.', '["Área despejada libre de obstáculos","Puntos de anclaje para visores PC-VR","Monitores auxiliares para espectadores","Red local de baja latencia"]'::jsonb, '#1e5ca7', 'Disponible'
) ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. CONFIGURACIÓN GENERAL DEL LABORATORIO
-- ----------------------------------------------------------------------------
INSERT INTO configuracion_sistema (clave, valor) VALUES (
  'general', '{"labName":"PLAi — Laboratorio de Innovación, Robótica y Tecnologías Inmersivas","labLocation":"Torre C, Ciudad Creativa Digital, Guadalajara, Jalisco","adminEmail":"plai.ayuda@plai.mx","maintenanceAlertDays":30,"allowPublicView":true,"requireApproval":true,"maxReservationHours":2,"maxAdvanceDays":14,"categorias":["Realidad Virtual","Robótica","Fabricación Digital","Drones","Cómputo"]}'::jsonb
) ON CONFLICT (clave) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. ALTA DE USUARIO ADMINISTRADOR INICIAL (PLANTILLA SIN CREDENCIALES EXPUESTAS)
-- ----------------------------------------------------------------------------
-- Por política de seguridad (Estándar PLAi v1.0, Secciones 6 y 7), este archivo
-- no almacena contraseñas reales ni cuentas de prueba.
-- Para crear el administrador inicial antes de conectar el proveedor de identidad
-- de PLAi, genere un hash scrypt con Node.js 22:
--
--   node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');const k=c.scryptSync(process.argv[1],s,64).toString('hex');console.log('scrypt$'+s+'$'+k)" "<CONTRASEÑA_SEGURA>"
--
-- Después ejecute el siguiente bloque en Neon / PostgreSQL:
--
-- INSERT INTO usuarios (id, nombre, email, password_hash, rol, estado, dependencia)
-- VALUES (
--   'usr-admin-plai',
--   'Administrador de Plataforma PLAi',
--   'admin@plai.mx',
--   '<HASH_SCRYPT_GENERADO>',
--   'admin',
--   'Activo',
--   'Área de Tecnología e Infraestructura PLAi'
-- ) ON CONFLICT (email) DO NOTHING;

COMMIT;
