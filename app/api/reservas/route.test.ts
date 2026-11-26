import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { rateLimiter, RATE_LIMIT_MUTATION } from '../../../lib/rateLimit';
import { addDaysToYmd, getMexicoTodayYmd } from '../../../lib/dateMexico';
import * as nextAuth from 'next-auth';

let mockMaxReservationHours = 2;

vi.mock('../../../lib/directus', () => ({
  directus: {
    getItemById: vi.fn(async (collection: string) => {
      if (collection === 'configuracion') {
        return {
          id: 'general',
          valor: {
            maxReservationHours: mockMaxReservationHours,
            maxAdvanceDays: 14,
          },
        };
      }
      return null;
    }),
    getItems: vi.fn(async (collection: string) => {
      if (collection === 'equipos') {
        return [
          {
            id: 'vr-01',
            categoria_id: 'realidad-virtual',
            nombre: 'Meta Quest 3',
            marca: 'Meta',
            modelo: 'Quest 3',
            numero_serie: 'SN-001',
            codigo_plai: '5151000013-1',
            estado: 'Disponible',
            ubicacion: 'Laboratorio VR',
            especificaciones: ['512 GB'],
            accesorios: ['2 Controladores Touch Plus'],
          },
        ];
      }
      return [];
    }),
    createItem: vi.fn(async (_col: string, data: Record<string, unknown>) => data),
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('POST /api/reservas Route Handler', () => {
  const getServerSessionMock = vi.mocked(nextAuth.getServerSession);

  beforeEach(() => {
    mockMaxReservationHours = 2;
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    rateLimiter.reset();
    getServerSessionMock.mockResolvedValue({
      user: {
        id: 'kc-new-user-uuid-987654',
        name: 'Laura Martinez',
        email: 'laura.martinez@plai.mx',
        role: 'usuario',
      },
    });
  });

  it('rechaza peticiones sin sesión autenticada con código 401', async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('procesa una reservación válida y responde con código 201', async () => {
    const validDate = addDaysToYmd(getMexicoTodayYmd(), 2);
    const payload = {
      deviceId: 'vr-01',
      userName: 'Laura Martinez',
      date: validDate,
      startTime: '11:00',
      endTime: '12:30',
      activity: 'Desarrollo de entorno inmersivo',
      notes: 'Requiere mandos cargados',
      accessories: ['2 Controladores Touch Plus'],
      acceptPrivacy: true,
    };

    const req = new NextRequest('http://localhost:3000/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.userName).toBe('Laura Martinez');
    expect(data.data.status).toBe('Pendiente');
    expect(data.data.reserva.usuarioEmail).toBe('laura.martinez@plai.mx');
  });

  it('rechaza una solicitud con datos inválidos con código 400 y errores de validación', async () => {
    const invalidPayload = {
      deviceId: '',
      userName: 'L',
      date: 'invalid-date',
      startTime: '10:00',
      endTime: '19:30', // excede tope técnico de 8 horas
      activity: '',
      acceptPrivacy: false,
    };

    const req = new NextRequest('http://localhost:3000/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.endTime).toBeDefined();
    expect(data.errors.userName).toBeDefined();
  });

  it('rechaza fechas pasadas y fechas que exceden maxAdvanceDays con 400', async () => {
    const pastDate = addDaysToYmd(getMexicoTodayYmd(), -2);
    const pastRes = await POST(
      new NextRequest('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: 'vr-01',
          userName: 'Laura Martinez',
          date: pastDate,
          startTime: '10:00',
          endTime: '11:00',
          activity: 'Práctica pasada',
          acceptPrivacy: true,
        }),
      })
    );
    expect(pastRes.status).toBe(400);

    const tooFarDate = addDaysToYmd(getMexicoTodayYmd(), 30);
    const farRes = await POST(
      new NextRequest('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: 'vr-01',
          userName: 'Laura Martinez',
          date: tooFarDate,
          startTime: '10:00',
          endTime: '11:00',
          activity: 'Práctica muy lejana',
          acceptPrivacy: true,
        }),
      })
    );
    expect(farRes.status).toBe(400);
  });

  it('respeta maxReservationHours configurado en Directus (tanto <= 2 h como > 2 h)', async () => {
    const validDate = addDaysToYmd(getMexicoTodayYmd(), 2);
    const threeHourBody = {
      deviceId: 'vr-01',
      userName: 'Laura Martinez',
      date: validDate,
      startTime: '10:00',
      endTime: '13:00', // 3 horas
      activity: 'Sesión extendida de simulación',
      acceptPrivacy: true,
    };

    // Con límite por defecto (2 h), 3 h debe rechazarse con 400
    mockMaxReservationHours = 2;
    const rejected = await POST(
      new NextRequest('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threeHourBody),
      })
    );
    expect(rejected.status).toBe(400);

    // Al subir configuración a 4 h, 3 h debe aceptarse con 201
    mockMaxReservationHours = 4;
    const accepted = await POST(
      new NextRequest('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threeHourBody),
      })
    );
    expect(accepted.status).toBe(201);
  });

  it('rechaza peticiones con código 429 cuando un cliente excede el rate limit normativo', async () => {
    const validDate = addDaysToYmd(getMexicoTodayYmd(), 3);
    const payload = {
      deviceId: 'vr-01',
      userName: 'Carlos Gomez',
      date: validDate,
      startTime: '10:00',
      endTime: '11:00',
      activity: 'Pruebas de software',
      acceptPrivacy: true,
    };

    for (let i = 0; i < RATE_LIMIT_MUTATION.limit; i++) {
      const req = new NextRequest('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '187.100.50.25',
        },
        body: JSON.stringify(payload),
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
    }

    const blockedReq = new NextRequest('http://localhost:3000/api/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '187.100.50.25',
      },
      body: JSON.stringify(payload),
    });

    const blockedRes = await POST(blockedReq);
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get('Retry-After')).toBeDefined();

    const data = await blockedRes.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Too Many Requests');
  });
});
