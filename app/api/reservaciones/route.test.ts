import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT } from './route';
import * as nextAuth from 'next-auth';

interface MockEquipo {
  id: string;
  categoria_id: string;
  nombre: string;
  marca: string;
  modelo: string;
  codigo_plai: string;
  estado: string;
  ubicacion: string;
  especificaciones: string[];
  accesorios: string[];
}

interface MockReserva {
  id: string;
  folio: string;
  categoria_id: string;
  equipo_id: string | null;
  codigo_plai_asignado: string | null;
  usuario_keycloak_id: string | null;
  usuario_nombre: string;
  usuario_email: string;
  fecha_uso: string;
  hora_inicio: string;
  hora_fin: string;
  actividad: string;
  estado: string;
}

interface MockBitacora {
  id: string;
  equipo_id: string;
  estado_prestamo: string;
}

const state = {
  equipos: [] as MockEquipo[],
  reservaciones: [] as MockReserva[],
  bitacora_uso: [] as MockBitacora[],
};

vi.mock('../../../lib/directus', () => ({
  directus: {
    getItems: vi.fn(async (collection: string, params?: Record<string, string | number>) => {
      if (collection === 'equipos') return [...state.equipos];
      if (collection === 'reservaciones') {
        return state.reservaciones.filter((r) => {
          if (params?.['filter[equipo_id][_eq]'] && r.equipo_id !== params['filter[equipo_id][_eq]']) {
            return false;
          }
          if (params?.['filter[estado][_eq]'] && r.estado !== params['filter[estado][_eq]']) {
            return false;
          }
          return true;
        });
      }
      if (collection === 'bitacora_uso') {
        return state.bitacora_uso.filter((b) => {
          if (params?.['filter[equipo_id][_eq]'] && b.equipo_id !== params['filter[equipo_id][_eq]']) {
            return false;
          }
          if (
            params?.['filter[estado_prestamo][_eq]'] &&
            b.estado_prestamo !== params['filter[estado_prestamo][_eq]']
          ) {
            return false;
          }
          return true;
        });
      }
      return [];
    }),
    getItemById: vi.fn(async (collection: string, id: string) => {
      if (collection === 'equipos') return state.equipos.find((e) => e.id === id) ?? null;
      if (collection === 'reservaciones') return state.reservaciones.find((r) => r.id === id) ?? null;
      if (collection === 'bitacora_uso') return state.bitacora_uso.find((b) => b.id === id) ?? null;
      return null;
    }),
    updateItem: vi.fn(async (collection: string, id: string, patch: Record<string, unknown>) => {
      if (collection === 'equipos') {
        const eq = state.equipos.find((e) => e.id === id);
        if (!eq) throw new Error('Equipo not found');
        Object.assign(eq, patch);
        return { ...eq };
      }
      if (collection === 'reservaciones') {
        const res = state.reservaciones.find((r) => r.id === id);
        if (!res) throw new Error('Reserva not found');
        Object.assign(res, patch);
        return { ...res };
      }
      return patch;
    }),
    createItem: vi.fn(async (collection: string, data: Record<string, unknown>) => {
      if (collection === 'bitacora_uso') {
        state.bitacora_uso.push({
          id: String(data.id),
          equipo_id: String(data.equipo_id),
          estado_prestamo: String(data.estado_prestamo || 'Activo'),
        });
      }
      return data;
    }),
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('PUT /api/reservaciones — Máquina de estados de equipos (integridad)', () => {
  const getServerSessionMock = vi.mocked(nextAuth.getServerSession);

  beforeEach(() => {
    vi.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: {
        id: 'kc-admin-1',
        name: 'Admin PLAi',
        email: 'admin@plai.mx',
        role: 'admin',
      },
    });

    state.equipos = [
      {
        id: 'vr-01',
        categoria_id: 'realidad-virtual',
        nombre: 'Meta Quest 3 #1',
        marca: 'Meta',
        modelo: 'Quest 3',
        codigo_plai: '5151000013-1',
        estado: 'Disponible',
        ubicacion: 'Laboratorio VR',
        especificaciones: ['512 GB'],
        accesorios: ['2 Controles'],
      },
    ];

    state.reservaciones = [
      {
        id: 'res-1',
        folio: 'RES-001',
        categoria_id: 'realidad-virtual',
        equipo_id: 'vr-01',
        codigo_plai_asignado: '5151000013-1',
        usuario_keycloak_id: 'kc-usr-1',
        usuario_nombre: 'Usuario Uno',
        usuario_email: 'uno@plai.mx',
        fecha_uso: '2026-12-01',
        hora_inicio: '10:00',
        hora_fin: '12:00',
        actividad: 'Práctica VR 1',
        estado: 'Pendiente',
      },
      {
        id: 'res-2',
        folio: 'RES-002',
        categoria_id: 'realidad-virtual',
        equipo_id: 'vr-01',
        codigo_plai_asignado: '5151000013-1',
        usuario_keycloak_id: 'kc-usr-2',
        usuario_nombre: 'Usuario Dos',
        usuario_email: 'dos@plai.mx',
        fecha_uso: '2026-12-01',
        hora_inicio: '10:00',
        hora_fin: '12:00',
        actividad: 'Práctica VR 2',
        estado: 'Pendiente',
      },
    ];

    state.bitacora_uso = [];
  });

  it('al aprobar y entregar la primera reserva y rechazar la segunda, el equipo sigue "En uso" y no se corrompe', async () => {
    // 1. Aprobar primera reserva: Disponible -> Reservado
    const approve1 = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-1',
          estado: 'Aprobada',
          equipoId: 'vr-01',
          codigoPlaiAsignado: '5151000013-1',
        }),
      })
    );
    expect(approve1.status).toBe(200);
    expect(state.equipos[0].estado).toBe('Reservado');

    // 2. Intentar aprobar la segunda reserva sobre el mismo visor ya Reservado -> 409 Conflict
    const approve2Conflict = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-2',
          estado: 'Aprobada',
          equipoId: 'vr-01',
          codigoPlaiAsignado: '5151000013-1',
        }),
      })
    );
    expect(approve2Conflict.status).toBe(409);
    expect(state.equipos[0].estado).toBe('Reservado');

    // 3. Entregar la primera reserva: Reservado -> En uso (crea registro Activo en bitácora)
    const deliver1 = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-1',
          estado: 'En uso',
          registrarEntregaEnBitacora: true,
        }),
      })
    );
    expect(deliver1.status).toBe(200);
    expect(state.equipos[0].estado).toBe('En uso');
    expect(state.bitacora_uso).toHaveLength(1);

    // 4. Rechazar la segunda reserva (que estaba Pendiente): el equipo DEBE seguir "En uso"
    const reject2 = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-2',
          estado: 'Rechazada',
          observacionesAdmin: 'Equipo ocupado en otra sesión.',
        }),
      })
    );
    expect(reject2.status).toBe(200);
    expect(state.reservaciones.find((r) => r.id === 'res-2')?.estado).toBe('Rechazada');
    expect(state.equipos[0].estado).toBe('En uso');
  });

  it('devuelve 404 si se intenta actualizar una reservación inexistente', async () => {
    const res = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-inexistente',
          estado: 'Rechazada',
        }),
      })
    );
    expect(res.status).toBe(404);
  });

  it('permite editar una reservación ya "En uso" sin dar 409 ni duplicar entrada de bitácora', async () => {
    // 1. Aprobar y entregar res-1
    await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-1',
          estado: 'Aprobada',
          equipoId: 'vr-01',
          codigoPlaiAsignado: '5151000013-1',
        }),
      })
    );
    await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-1',
          estado: 'En uso',
          registrarEntregaEnBitacora: true,
        }),
      })
    );
    expect(state.bitacora_uso).toHaveLength(1);

    // 2. Editar observaciones/horario mandando el formulario completo (que siempre envía estado: 'En uso')
    const editRes = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-1',
          estado: 'En uso',
          observacionesAdmin: 'Se agregó adaptador USB-C adicional',
          horaFin: '12:30',
        }),
      })
    );
    expect(editRes.status).toBe(200);
    // No se creó una segunda bitácora duplicada
    expect(state.bitacora_uso).toHaveLength(1);
    expect(state.equipos[0].estado).toBe('En uso');
  });

  it('valida la máquina de estados de la reservación y rechaza transiciones ilegales con 409', async () => {
    // Aprobar res-1 (Pendiente -> Aprobada)
    const approve = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-1',
          estado: 'Aprobada',
          equipoId: 'vr-01',
          codigoPlaiAsignado: '5151000013-1',
        }),
      })
    );
    expect(approve.status).toBe(200);

    // Intentar regresar Aprobada -> Pendiente -> 409 (evita dejar equipo atorado en Reservado)
    const backToPending = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'res-1', estado: 'Pendiente' }),
      })
    );
    expect(backToPending.status).toBe(409);
    expect(state.reservaciones[0].estado).toBe('Aprobada');

    // Pasar Aprobada -> En uso
    const toInUse = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'res-1', estado: 'En uso' }),
      })
    );
    expect(toInUse.status).toBe(200);

    // Intentar pasar En uso -> Completada manualmente (sin devolución en Bitácora) -> 409
    const manualComplete = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'res-1', estado: 'Completada' }),
      })
    );
    expect(manualComplete.status).toBe(409);
    expect(state.reservaciones[0].estado).toBe('En uso');
    expect(state.equipos[0].estado).toBe('En uso');

    // Rechazar res-2 (Pendiente -> Rechazada) y luego intentar reabrirla -> 409
    await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'res-2', estado: 'Rechazada' }),
      })
    );
    const reopen = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'res-2', estado: 'Aprobada' }),
      })
    );
    expect(reopen.status).toBe(409);
  });

  it('sincroniza equipoId al cambiar codigoPlaiAsignado y rechaza códigos inexistentes o contradictorios con 400', async () => {
    state.equipos.push({
      id: 'vr-02',
      categoria_id: 'realidad-virtual',
      nombre: 'Meta Quest 3 #2',
      marca: 'Meta',
      modelo: 'Quest 3',
      codigo_plai: '5151000013-2',
      estado: 'Disponible',
      ubicacion: 'Laboratorio VR',
      especificaciones: ['512 GB'],
      accesorios: ['2 Controles'],
    });

    // Aprobar res-1 con vr-01
    const approve1 = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'res-1', estado: 'Aprobada', equipoId: 'vr-01' }),
      })
    );
    expect(approve1.status).toBe(200);
    expect(state.equipos.find((e) => e.id === 'vr-01')?.estado).toBe('Reservado');

    // Cambiar solo codigoPlaiAsignado al de vr-02: debe sincronizar equipo_id a vr-02 y liberar vr-01
    const reassign = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-1',
          estado: 'Aprobada',
          codigoPlaiAsignado: '5151000013-2',
        }),
      })
    );
    expect(reassign.status).toBe(200);
    expect(state.reservaciones[0].equipo_id).toBe('vr-02');
    expect(state.reservaciones[0].codigo_plai_asignado).toBe('5151000013-2');
    expect(state.equipos.find((e) => e.id === 'vr-01')?.estado).toBe('Disponible');
    expect(state.equipos.find((e) => e.id === 'vr-02')?.estado).toBe('Reservado');

    // Código inexistente -> 400
    const unknownCode = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-1',
          estado: 'Aprobada',
          codigoPlaiAsignado: 'NO-EXISTE-999',
        }),
      })
    );
    expect(unknownCode.status).toBe(400);

    // Código que no coincide con equipoId -> 400
    const mismatch = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'res-1',
          estado: 'Aprobada',
          equipoId: 'vr-01',
          codigoPlaiAsignado: '5151000013-2',
        }),
      })
    );
    expect(mismatch.status).toBe(400);
  });

  it('rechaza con 409 aprobar una reservación de equipo sin dispositivo disponible y permite cerrar espacios desde "En uso"', async () => {
    // Reservación de equipo sin equipo asignado y sin ningún equipo Disponible en su categoría
    state.equipos[0].estado = 'En mantenimiento';
    state.reservaciones.push({
      id: 'res-sin-equipo',
      folio: 'RES-20261126-ABCDEF12',
      categoria_id: 'realidad-virtual',
      equipo_id: null,
      codigo_plai_asignado: null,
      usuario_keycloak_id: 'kc-usr-3',
      usuario_nombre: 'Usuario Tres',
      usuario_email: 'tres@plai.mx',
      fecha_uso: '2026-12-01',
      hora_inicio: '10:00',
      hora_fin: '12:00',
      actividad: 'Práctica VR sin equipo',
      estado: 'Pendiente',
    });

    const approveWithoutDevice = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'res-sin-equipo', estado: 'Aprobada' }),
      })
    );
    expect(approveWithoutDevice.status).toBe(409);

    // Reservación de espacio físico (sin equipo): Pendiente -> Aprobada -> En uso -> Completada
    state.reservaciones.push({
      id: 'esp-1',
      folio: 'ESP-20261126-11223344',
      categoria_id: 'computo-multimedia',
      equipo_id: null,
      codigo_plai_asignado: 'ESPACIO-AUDITORIO',
      usuario_keycloak_id: 'kc-usr-4',
      usuario_nombre: 'Usuario Cuatro',
      usuario_email: 'cuatro@plai.mx',
      fecha_uso: '2026-12-01',
      hora_inicio: '10:00',
      hora_fin: '12:00',
      actividad: '[ESPACIO: Auditorio Principal] Conferencia',
      estado: 'Pendiente',
    });

    const espApprove = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'esp-1', estado: 'Aprobada' }),
      })
    );
    expect(espApprove.status).toBe(200);

    const espStart = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'esp-1', estado: 'En uso' }),
      })
    );
    expect(espStart.status).toBe(200);
    expect(state.bitacora_uso).toHaveLength(0);

    const espComplete = await PUT(
      new NextRequest('http://localhost:3000/api/reservaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'esp-1', estado: 'Completada' }),
      })
    );
    expect(espComplete.status).toBe(200);
    expect(state.reservaciones.find((r) => r.id === 'esp-1')?.estado).toBe('Completada');
  });
});
