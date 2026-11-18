import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb } from './testDb';
import {
  getEquiposFromDB,
  insertEquipoInDB,
  deleteEquipoInDB,
  getAplicacionesFromDB,
  insertAplicacionInDB,
  getBitacoraFromDB,
  insertBitacoraEntregaInDB,
  updateBitacoraDevolucionInDB,
  getReservacionesFromDB,
  insertReservacionInDB,
  updateReservacionInDB,
  getIncidenciasFromDB,
  insertIncidenciaInDB,
  updateIncidenciaStatusInDB,
  getUsuariosFromDB,
  upsertUsuarioInDB,
  getCursosFromDB,
  insertCursoInDB,
  getSystemConfigFromDB,
  saveSystemConfigInDB,
  defaultSystemConfig,
  type DeviceItem,
  type ReservacionItem,
} from './db';
import { getAllCategoriesConfig, getCategoryConfig, updateCategoryConfig } from './categoriesConfig';

const estadoEquipo = async (id: string) => (await getEquiposFromDB()).find((e) => e.id === id)?.status;

describe('Capa de datos PostgreSQL (migraciones reales sobre pg-mem)', () => {
  beforeEach(() => {
    createTestDb({ demo: true });
  });

  it('las migraciones siembran los catálogos oficiales', async () => {
    const equipos = await getEquiposFromDB();
    expect(equipos).toHaveLength(13);
    expect(equipos.find((e) => e.id === 'eq-vr-001')).toMatchObject({
      inventoryNumber: 'PLAI-VR-001',
      category: 'Realidad Virtual',
      status: 'Disponible',
    });
    expect((await getAplicacionesFromDB()).length).toBe(10);
    expect(Object.keys(await getAllCategoriesConfig())).toHaveLength(5);
    expect((await getSystemConfigFromDB()).maxReservationHours).toBe(2);
  });

  it('equipos: inserta, actualiza (upsert) y elimina', async () => {
    const item: DeviceItem = {
      id: 'eq-test-1',
      name: 'Equipo de prueba',
      category: 'Drones',
      brand: 'ACME',
      model: 'X1',
      inventoryNumber: 'PLAI-TST-001',
      serialNumber: 'SN-1',
      storage: 'N/A',
      status: 'Disponible',
      location: 'Lab',
      specs: ['a', 'b'],
      accessories: ['c'],
      imageEmoji: '🛸',
      responsible: 'Tester',
    } as DeviceItem;
    expect(await insertEquipoInDB(item)).toBe(true);
    expect(await insertEquipoInDB({ ...item, name: 'Renombrado' })).toBe(true);
    const found = (await getEquiposFromDB()).find((e) => e.id === 'eq-test-1');
    expect(found?.name).toBe('Renombrado');
    expect(found?.specs).toEqual(['a', 'b']);
    expect(await deleteEquipoInDB('eq-test-1')).toBe(true);
    expect(await deleteEquipoInDB('eq-test-1')).toBe(false);
  });

  it('aplicaciones: upsert', async () => {
    await insertAplicacionInDB({
      id: 'app-x',
      name: 'App X',
      developer: 'Dev',
      version: '1.0',
      category: 'Simulación',
      platform: 'PC',
      ageRating: 'Todas las edades',
      description: 'Descripción',
      devicesInstalled: 2,
      status: 'Activa',
    } as never);
    expect((await getAplicacionesFromDB()).some((a) => a.id === 'app-x')).toBe(true);
  });

  it('reservaciones: ciclo aprobar → entregar (bitácora) → devolver sincroniza equipo y reservación', async () => {
    const reserva: ReservacionItem = {
      id: 'res-t1',
      folio: 'RES-T-1',
      categoriaId: 'drones',
      equipoId: 'eq-dro-002',
      usuarioNombre: 'Laura',
      usuarioEmail: 'laura@plai.mx',
      fechaUso: '2026-12-01',
      horaInicio: '10:00',
      horaFin: '12:00',
      actividad: 'Mapeo',
      estado: 'Pendiente',
    };
    await insertReservacionInDB(reserva);

    let r = (await getReservacionesFromDB()).find((x) => x.id === 'res-t1')!;
    expect(r.fechaUso).toBe('2026-12-01');
    expect(r.horaInicio).toBe('10:00');
    expect(r.horaFin).toBe('12:00');
    expect(r.codigoPlaiAsignado).toBe('PLAI-DR-002');

    expect(await updateReservacionInDB('res-t1', { estado: 'Aprobada', aprobadoPor: 'Admin' })).toBe(true);
    expect(await estadoEquipo('eq-dro-002')).toBe('Reservado');

    await insertBitacoraEntregaInDB(
      {
        id: 'bit-t1',
        equipoId: 'eq-dro-002',
        codigoPlai: 'PLAI-DR-002',
        equipoNombre: 'Dron DJI Mavic Air 2 Fly More',
        usuarioNombre: 'Laura',
        usuarioEmail: 'laura@plai.mx',
        fechaEntrega: '2026-12-01 10:00:00',
        fechaDevolucionEstimada: '2026-12-01 12:00:00',
        estadoPrestamo: 'Activo',
        condicionEntrega: 'Excelente',
        accesoriosEntregados: 'Todo',
        adminEntrega: 'Admin',
      },
      'res-t1'
    );
    expect(await estadoEquipo('eq-dro-002')).toBe('En uso');
    r = (await getReservacionesFromDB()).find((x) => x.id === 'res-t1')!;
    expect(r.estado).toBe('En uso');

    expect(
      await updateBitacoraDevolucionInDB('bit-t1', {
        fechaDevolucionReal: '2026-12-01 11:50:00',
        condicionDevolucion: 'Excelente',
        accesoriosDevueltos: 'Completos',
        adminRecibe: 'Admin',
      })
    ).toBe(true);
    expect(await estadoEquipo('eq-dro-002')).toBe('Disponible');
    r = (await getReservacionesFromDB()).find((x) => x.id === 'res-t1')!;
    expect(r.estado).toBe('Completada');

    const bit = (await getBitacoraFromDB()).find((b) => b.id === 'bit-t1')!;
    expect(bit.estadoPrestamo).toBe('Devuelto');
    expect(bit.fechaEntrega).toBe('2026-12-01 10:00:00');
    expect(bit.fechaDevolucionReal).toBe('2026-12-01 11:50:00');
  });

  it('devolución con incidencia deja el equipo en mantenimiento', async () => {
    await insertBitacoraEntregaInDB({
      id: 'bit-t2',
      equipoId: 'eq-vr-003',
      codigoPlai: 'PLAI-VR-003',
      equipoNombre: 'HTC Vive Pro 2',
      usuarioNombre: 'Pepe',
      usuarioEmail: 'pepe@plai.mx',
      fechaEntrega: '2026-12-02 09:00:00',
      fechaDevolucionEstimada: '2026-12-02 11:00:00',
      estadoPrestamo: 'Activo',
      condicionEntrega: 'Bueno',
      accesoriosEntregados: 'Kit',
      adminEntrega: 'Admin',
    });
    await updateBitacoraDevolucionInDB('bit-t2', {
      fechaDevolucionReal: '2026-12-02 10:30:00',
      condicionDevolucion: 'Dañado',
      accesoriosDevueltos: 'Incompleto',
      incidenciaGenerada: true,
      adminRecibe: 'Admin',
    });
    expect(await estadoEquipo('eq-vr-003')).toBe('En mantenimiento');
    expect((await getBitacoraFromDB()).find((b) => b.id === 'bit-t2')?.estadoPrestamo).toBe('Con Incidencia');
  });

  it('updateReservacionInDB devuelve false si no existe', async () => {
    expect(await updateReservacionInDB('no-existe', { estado: 'Aprobada' })).toBe(false);
  });

  it('incidencias: alta marca mantenimiento y resolver libera el equipo', async () => {
    await insertIncidenciaInDB({
      id: 'inc-t1',
      folio: 'INC-T-1',
      equipoId: 'eq-rob-001',
      codigoPlai: 'PLAI-RB-001',
      equipoNombre: 'Brazo Robótico DOBOT Magician',
      origen: 'Reporte de Usuario',
      tipoFalla: 'Hardware',
      severidad: 'Alta',
      descripcion: 'No enciende',
      estado: 'Reportada',
      tecnicoResponsable: 'Tec',
      fechaReporte: '2026-12-03 08:00:00',
    });
    expect(await estadoEquipo('eq-rob-001')).toBe('En mantenimiento');

    expect(await updateIncidenciaStatusInDB('inc-t1', 'En reparación', 'Cambio de fuente')).toBe(true);
    expect(await estadoEquipo('eq-rob-001')).toBe('En mantenimiento');

    expect(await updateIncidenciaStatusInDB('inc-t1', 'Resuelta')).toBe(true);
    expect(await estadoEquipo('eq-rob-001')).toBe('Disponible');
    const inc = (await getIncidenciasFromDB()).find((i) => i.id === 'inc-t1')!;
    expect(inc.estado).toBe('Resuelta');
    expect(inc.fechaResolucion).toBeTruthy();
    expect(inc.accionesRealizadas).toBe('Cambio de fuente');
  });

  it('usuarios: no persiste ni devuelve contraseñas y cuenta reservaciones', async () => {
    const saved = await upsertUsuarioInDB({
      id: 'usr-t1',
      name: 'Nueva Persona',
      email: 'Nueva@Plai.mx',
      password: 'secreta',
      role: 'Colaborador',
      status: 'Activo',
      lastLogin: '2026-12-01',
      reservations: 0,
    });
    expect(saved).not.toHaveProperty('password');
    const list = await getUsuariosFromDB();
    const u = list.find((x) => x.id === 'usr-t1')!;
    expect(u).not.toHaveProperty('password');
    expect(u.email).toBe('nueva@plai.mx');
    expect(u.role).toBe('Colaborador');

    const demo = list.find((x) => x.email === 'user@plai.edu.mx');
    expect(demo).toBeDefined();
  });

  it('cursos: inserta y registra la reservación asociada', async () => {
    await insertCursoInDB({
      id: 'CUR-T1',
      titulo: 'Taller de Robótica',
      tipo: 'Taller',
      fecha: '2026-12-10',
      hora: '09:00 - 11:00',
      lugar: 'Aula',
      asistentes: 20,
      estado: 'En revisión',
      icon: '🤖',
      instructor: 'Por asignar',
      descripcion: 'Intro',
      solicitanteNombre: 'Escuela X',
      solicitanteEmail: 'escuela@x.mx',
    });
    const cursos = await getCursosFromDB();
    expect(cursos.find((c) => c.id === 'CUR-T1')?.fecha).toBe('2026-12-10');
    const res = (await getReservacionesFromDB()).find((r) => r.folio === 'CUR-T1');
    expect(res?.categoriaId).toBe('robotica');
    expect(res?.estado).toBe('Pendiente');
  });

  it('configuración: guarda y relee', async () => {
    await saveSystemConfigInDB({ ...defaultSystemConfig, maxReservationHours: 3 });
    expect((await getSystemConfigFromDB()).maxReservationHours).toBe(3);
  });

  it('categorías: actualiza en base de datos', async () => {
    const updated = await updateCategoryConfig('drones', { name: 'Drones PLAi', benefits: ['x'] });
    expect(updated.name).toBe('Drones PLAi');
    const again = await getCategoryConfig('drones');
    expect(again?.benefits).toEqual(['x']);
    expect(again?.successCases.length).toBeGreaterThan(0);
    expect(await getCategoryConfig('inexistente')).toBeNull();
  });
});
