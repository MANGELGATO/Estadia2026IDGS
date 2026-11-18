import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { createTestDb } from '../../../lib/testDb';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { getAllCategoriesConfig, defaultCategoriesConfig, updateCategoryConfig } from '../../../lib/categoriesConfig';

vi.mock('../../../lib/apiAuth', () => ({
  requireSession: vi.fn(async () => ({ ok: true, token: { role: 'admin', email: 'admin@plai.edu.mx' } })),
}));

describe('/api/categorias API Endpoint', () => {
  beforeEach(() => {
    createTestDb({ demo: true });
  });
  afterAll(async () => {
    // Restaurar los valores oficiales de PLAi tras la ejecución de los tests
    await updateCategoryConfig('realidad-virtual', defaultCategoriesConfig['realidad-virtual']);
  });

  it('GET devuelve todas las categorías con éxito', async () => {
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

  it('POST actualiza los textos y multimedia de una categoría en el servidor', async () => {
    const updatePayload = {
      id: 'realidad-virtual',
      name: 'Realidad Virtual Avanzada PLAi',
      description: 'Nueva descripción institucional para el laboratorio.',
      plaiUsage: 'Uso formativo en metaverso y simulación de alta fidelidad.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      benefits: ['Beneficio 1', 'Beneficio 2', 'Beneficio 3'],
      successCases: [
        { title: 'Proyecto Médico', desc: 'Simulador quirúrgico de alta precisión.' }
      ]
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

    // Verificar que se persista en la consulta siguiente
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
