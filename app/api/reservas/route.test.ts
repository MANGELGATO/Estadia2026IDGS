import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/reservas Route Handler', () => {
  beforeEach(() => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  it('procesa una reservación válida y responde con código 201', async () => {
    const payload = {
      deviceId: 'dev-meta-quest-3',
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
});
