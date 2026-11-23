import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { rateLimiter } from '../../../lib/rateLimit';
import * as nextAuth from 'next-auth';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('POST /api/reservas Route Handler', () => {
  const getServerSessionMock = vi.mocked(nextAuth.getServerSession);

  beforeEach(() => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    rateLimiter.reset();
    getServerSessionMock.mockResolvedValue({
      user: {
        id: 'usr-01',
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
    const payload = {
      deviceId: 'vr-01',
      userName: 'Laura Martinez',
      date: '2026-11-10',
      startTime: '11:00',
      endTime: '12:30',
      activity: 'Desarrollo de entorno inmersivo',
      notes: 'Requiere mandos cargados',
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
      endTime: '13:30', // más de 2 horas
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

  it('rechaza peticiones con código 429 cuando un cliente excede el rate limit normativo', async () => {
    const payload = {
      deviceId: 'vr-01',
      userName: 'Carlos Gomez',
      date: '2026-11-12',
      startTime: '10:00',
      endTime: '11:00',
      activity: 'Pruebas de software',
      acceptPrivacy: true,
    };

    for (let i = 0; i < 10; i++) {
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
