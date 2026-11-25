import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import * as nextAuth from 'next-auth';

const mockCategoriesStore = new Map<string, Record<string, unknown>>();

vi.mock('../../../lib/directus', () => ({
  directus: {
    getItems: vi.fn(async () => Array.from(mockCategoriesStore.values())),
    upsertItem: vi.fn(async (_col: string, id: string, data: Record<string, unknown>) => {
      mockCategoriesStore.set(id, { id, ...data });
      return { id, ...data };
    }),
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('/api/categorias API Endpoint', () => {
  const getServerSessionMock = vi.mocked(nextAuth.getServerSession);

  beforeEach(() => {
    mockCategoriesStore.clear();
    getServerSessionMock.mockReset();
    getServerSessionMock.mockResolvedValue({
      user: {
        id: 'usr-admin-01',
        name: 'Administrador PLAi',
        email: 'admin@plai.mx',
        role: 'admin',
      },
    });
  });

  it('GET devuelve todas las categorías con éxito sin requerir autenticación', async () => {
    const req = new NextRequest('http://localhost:3000/api/categorias');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.categories).toBeDefined();
    expect(json.categories['realidad-virtual']).toBeDefined();
    expect(json.categories['robotica']).toBeDefined();
    expect(json.categories['fabricacion-digital']).toBeDefined();
  });

  it('GET con parámetro ?slug=... devuelve la categoría específica', async () => {
    const req = new NextRequest('http://localhost:3000/api/categorias?slug=realidad-virtual');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.category.id).toBe('realidad-virtual');
    expect(json.category.name).toBe('Realidad Virtual');
    expect(json.category.plaiUsage).toContain('PLAi');
  });

  it('GET con slug inexistente devuelve 404', async () => {
    const req = new NextRequest('http://localhost:3000/api/categorias?slug=categoria-inexistente');
    const res = await GET(req);
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('POST rechaza usuarios con rol estándar con código 403', async () => {
    getServerSessionMock.mockResolvedValueOnce({
      user: {
        id: 'usr-01',
        name: 'Usuario Estándar',
        email: 'usuario@plai.mx',
        role: 'usuario',
      },
    });

    const req = new NextRequest('http://localhost:3000/api/categorias', {
      method: 'POST',
      body: JSON.stringify({ id: 'realidad-virtual', name: 'Intento no autorizado' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('POST actualiza los textos y multimedia de una categoría cuando es administrador', async () => {
    const updatePayload = {
      id: 'realidad-virtual',
      name: 'Realidad Virtual Avanzada PLAi',
      description: 'Nueva descripción institucional para el laboratorio.',
      plaiUsage: 'Uso formativo en metaverso y simulación de alta fidelidad.',
      videoUrl: 'https://www.youtube.com/watch?v=example123',
      benefits: ['Beneficio 1', 'Beneficio 2', 'Beneficio 3'],
      successCases: [
        { title: 'Proyecto Médico', desc: 'Simulador quirúrgico de alta precisión.' },
      ],
    };

    const req = new NextRequest('http://localhost:3000/api/categorias', {
      method: 'POST',
      body: JSON.stringify(updatePayload),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.category.name).toBe('Realidad Virtual Avanzada PLAi');
    expect(json.category.description).toBe('Nueva descripción institucional para el laboratorio.');
    expect(json.category.benefits).toEqual(['Beneficio 1', 'Beneficio 2', 'Beneficio 3']);

    const verifyReq = new NextRequest('http://localhost:3000/api/categorias?slug=realidad-virtual');
    const verifyRes = await GET(verifyReq);
    const verifyJson = await verifyRes.json();
    expect(verifyJson.category.name).toBe('Realidad Virtual Avanzada PLAi');
  });

  it('POST rechaza solicitudes sin id de categoría', async () => {
    const req = new NextRequest('http://localhost:3000/api/categorias', {
      method: 'POST',
      body: JSON.stringify({ name: 'Sin ID' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
  });
});
