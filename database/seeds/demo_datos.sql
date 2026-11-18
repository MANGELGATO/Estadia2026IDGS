-- ====================================================================
-- Datos de DEMOSTRACIÓN (opcional, solo desarrollo / pruebas).
-- No forma parte de las migraciones: aplicar manualmente con
--   psql -f database/seeds/demo_datos.sql   o   pnpm db:seed-demo
-- No ejecutar en producción.
-- ====================================================================

INSERT INTO usuarios (id, nombre, email, rol, estado, dependencia) VALUES
('usr-admin-01', 'Administrador General PLAi', 'admin@plai.edu.mx', 'admin', 'Activo', 'Dirección de Innovación y Tecnología PLAi'),
('usr-user-01',  'Investigador / Alumno PLAi', 'user@plai.edu.mx',  'usuario', 'Activo', 'Centro Universitario de Ciencias Exactas e Ingenierías'),
('usr-colab-01', 'Coordinador de Talleres',     'tallerista@plai.edu.mx', 'colaborador', 'Activo', 'Laboratorio Maker Ciudad Creativa Digital')
ON CONFLICT (id) DO NOTHING;

INSERT INTO bitacora_uso (id, equipo_id, codigo_plai, equipo_nombre, usuario_nombre, usuario_email, usuario_dependencia, fecha_entrega, fecha_devolucion_estimada, fecha_devolucion_real, estado_prestamo, condicion_entrega, condicion_devolucion, accesorios_entregados, accesorios_devueltos, observaciones_entrega, admin_entrega) VALUES
('bit-001', 'eq-vr-001', 'PLAI-VR-001', 'Meta Quest 3 512GB', 'Lic. Mariana Torres', 'mariana.torres@cudi.edu.mx', 'Universidad de Guadalajara', '2026-10-10 09:30:00', '2026-10-10 13:30:00', '2026-10-10 13:15:00', 'Devuelto', 'Excelente', 'Excelente', '2 Controles Touch Plus, cargador original, cable USB-C', 'Todos completos', 'Préstamo para taller de arquitectura inmersiva', 'Ing. Carlos Mendoza'),
('bit-002', 'eq-dro-001', 'PLAI-DR-001', 'Dron DJI Mini 3 Pro con DJI RC', 'Arq. Sergio Velasco', 'svelasco@jalteca.mx', 'Secretaría de Medio Ambiente Jalisco', '2026-10-12 10:00:00', '2026-10-12 16:00:00', '2026-10-12 15:45:00', 'Devuelto', 'Excelente', 'Bueno', 'Control DJI RC, 3 baterías, cargador múltiple, maletín', 'Todos completos', 'Mapeo fotogramétrico en Ciudad Creativa Digital', 'Ing. Fernando Tapia')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reservaciones (id, folio, categoria_id, equipo_id, codigo_plai_asignado, usuario_nombre, usuario_email, usuario_telefono, usuario_institucion, fecha_uso, hora_inicio, hora_fin, actividad, estado, accesorios_incluidos, condicion_salida, observaciones_admin) VALUES
('res-001', 'RES-2026-001', 'realidad-virtual', 'eq-vr-001', 'PLAI-VR-001', 'Ana García Rivera', 'ana.garcia@alumnos.udg.mx', '33 1892 4401', 'Universidad de Guadalajara (CUAAD)', '2026-11-20', '10:00:00', '12:30:00', 'Evaluación de proyecto de grado de arquitectura espacial.', 'Aprobada', 'Controles Touch Plus y cable Link Box', 'Excelente', 'Asignado equipo Meta Quest 3 #01'),
('res-002', 'RES-2026-002', 'fabricacion-digital', 'eq-fab-001', 'PLAI-FD-001', 'Ing. Carlos Rivas', 'carlos.rivas@startupjalisco.com', '33 2201 9944', 'Startup Hub CCD', '2026-11-21', '09:00:00', '14:00:00', 'Impresión de carcasa para dispositivo IoT médico. Trae filamento PETG propio.', 'Pendiente', 'Placa texturizada PEI y boquilla 0.4mm', 'Excelente', 'Requiere revisión técnica de archivo STL previo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO incidencias_mantenimiento (id, folio, equipo_id, codigo_plai, equipo_nombre, origen, tipo_falla, severidad, descripcion, estado, tecnico_responsable, fecha_reporte, acciones_realizadas) VALUES
('inc-001', 'INC-2026-001', 'eq-vr-002', 'PLAI-VR-002', 'Meta Quest 3 128GB #02', 'Devolución de Préstamo', 'Calibración', 'Media', 'Controlador derecho pierde tracking espacial intermitentemente al apuntar hacia abajo.', 'En diagnóstico', 'Ing. Carlos Mendoza', '2026-10-14 11:20:00', 'Reinstalación de firmware y cambio de batería alcalina.')
ON CONFLICT (id) DO NOTHING;