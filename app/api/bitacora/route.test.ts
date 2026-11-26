import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT } from './route';
import * as nextAuth from 'next-auth';

interface MockEquipo {
  id: string;
  codigo_plai: string;
  estado: string;
}

interface MockReserva {
  id: string;
  equipo_id: string;
  usuario_email: string;
  estado: string;
}

interface MockBitacora {
  id: string;
  reservacion_id: string | null;
  equipo_id: string;
  codigo_plai: string;
  equipo_nombre: string;
  usuario_nombre: string;
  usuario_email: string;
  fecha_entrega: string;
  fecha_devolucion_estimada: string;
  fecha_devolucion_real: string | null;
  estado_prestamo: 'Activo' | 'Devuelto' | 'Con Incidencia';
  condicion_entrega: 'Excelente' | 'Bueno' | 'Regular';
  condicion_devolucion: string | null;
  accesorios_entregados: string;
  accesorios_devueltos: string | null;
  admin_entrega: string;
  admin_recibe: string | null;
}

const state = {
  equipos: [] as MockEquipo[],
  reservaciones: [] as MockReserva[],
  bitacora_uso: [] as MockBitacora[],
  incidencias: [] as Record<string, unknown>[],
};

vi.mock('../../../lib/directus', () => ({
  directus: {
    getItemById: vi.fn(async (collection: string, id: string) => {
      if (collection === 'bitacora_uso') return state.bitacora_uso.find((b) => b.id === id) ?? null;
      if (collection === 'equipos') return state.equipos.find((e) => e.id === id) ?? null;
      if (collection === 'reservaciones') return state.reservaciones.find((r) => r.id === id) ?? null;
      return null;
    }),
    getItems: vi.fn(async (collection: string, params?: Record<string, string | number>) => {
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
      return [];
    }),
    updateItem: vi.fn(async (collection: string, id: string, patch: Record<string, unknown>) => {
      if (collection === 'bitacora_uso') {
        const row = state.bitacora_uso.find((b) => b.id === id);
        if (!row) throw new Error('Not found');
        Object.assign(row, patch);
        return { ...row };
      }
      if (collection === 'equipos') {
        const row = state.equipos.find((e) => e.id === id);
        if (!row) throw new Error('Not found');
        Object.assign(row, patch);
        return { ...row };
      }
      if (collection === 'reservaciones') {
        const row = state.reservaciones.find((r) => r.id === id);
        if (!row) throw new Error('Not found');
        Object.assign(row, patch);
        return { ...row };
      }
      return patch;
    }),
    createItem: vi.fn(async (collection: string, data: Record<string, unknown>) => {
      if (collection === 'incidencias') {
        state.incidencias.push(data);
      }
      return data;
    }),
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('PUT /api/bitacora — Devolución segura (404, 409 doble clic y vínculo a reservación)', () => {
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

    state.equipos = [{ id: 'vr-01', codigo_plai: '5151000013-1', estado: 'En uso' }];
    state.reservaciones = [
      { id: 'res-1', equipo_id: 'vr-01', usuario_email: 'uno@plai.mx', estado: 'En uso' },
      { id: 'res-otra', equipo_id: 'vr-01', usuario_email: 'otra@plai.mx', estado: 'En uso' },
    ];
    state.bitacora_uso = [
      {
        id: 'bit-1',
        reservacion_id: 'res-1',
        equipo_id: 'vr-01',
        codigo_plai: '5151000013-1',
        equipo_nombre: 'Meta Quest 3',
        usuario_nombre: 'Usuario Uno',
        usuario_email: 'uno@plai.mx',
        fecha_entrega: '2026-12-01T16:00:00.000Z',
        fecha_devolucion_estimada: '2026-12-01T18:00:00.000Z',
        fecha_devolucion_real: null,
        estado_prestamo: 'Activo',
        condicion_entrega: 'Excelente',
        condicion_devolucion: null,
        accesorios_entregados: '2 Controles',
        accesorios_devueltos: null,
        admin_entrega: 'Admin PLAi',
        admin_recibe: null,
      },
    ];
    state.incidencias = [];
  });

  it('responde 404 cuando el ID de préstamo no existe', async () => {
    const res = await PUT(
      new NextRequest('http://localhost:3000/api/bitacora', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'bit-inexistente',
          fechaDevolucionReal: '2026-12-01T18:00',
          condicionDevolucion: 'Excelente',
        }),
      })
    );
    expect(res.status).toBe(404);
  });

  it('cierra solo la reservación vinculada y rechaza con 409 un doble clic sin duplicar incidencias', async () => {
    const payload = {
      id: 'bit-1',
      fechaDevolucionReal: '2026-12-01T18:00',
      condicionDevolucion: 'Dañado',
      accesoriosDevueltos: 'Falta cable USB-C',
      incidenciaGenerada: true,
      descripcionIncidencia: 'Lente rayado al retornar.',
    };

    const firstReturn = await PUT(
      new NextRequest('http://localhost:3000/api/bitacora', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
    expect(firstReturn.status).toBe(200);
    expect(state.bitacora_uso[0].estado_prestamo).toBe('Con Incidencia');
    expect(state.equipos[0].estado).toBe('En mantenimiento');
    expect(state.incidencias).toHaveLength(1);
    // Solo cerró res-1 (su reservación vinculada), NO tocó res-otra
    expect(state.reservaciones.find((r) => r.id === 'res-1')?.estado).toBe('Completada');
    expect(state.reservaciones.find((r) => r.id === 'res-otra')?.estado).toBe('En uso');

    // Segundo clic / pestaña desactualizada sobre el mismo préstamo -> 409 Conflict
    const doubleClick = await PUT(
      new NextRequest('http://localhost:3000/api/bitacora', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          condicionDevolucion: 'Excelente',
        }),
      })
    );
    expect(doubleClick.status).toBe(409);
    // No sobrescribió la primera devolución ni duplicó la incidencia
    expect(state.bitacora_uso[0].condicion_devolucion).toBe('Dañado');
    expect(state.incidencias).toHaveLength(1);
  });
});
