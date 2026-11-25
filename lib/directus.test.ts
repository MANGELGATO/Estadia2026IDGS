import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { directus, DirectusError, directusCollection } from './directus';

describe('Directus REST Client (PLAi Standard v1.0)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = {
      ...originalEnv,
      DIRECTUS_URL: 'https://directus.test.local',
      DIRECTUS_TOKEN: 'test-token-123',
      DIRECTUS_COLLECTION_PREFIX: 'lab_recursos_',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('aplica el prefijo de colección para evitar colisiones en admin.plai.mx', () => {
    expect(directusCollection('equipos')).toBe('lab_recursos_equipos');
    expect(directusCollection('lab_recursos_equipos')).toBe('lab_recursos_equipos');
  });

  it('consulta items con cache: no-store y Authorization Bearer', async () => {
    const mockData = [{ id: '1', nombre: 'Meta Quest 3' }];
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    });

    const items = await directus.getItems('equipos');
    expect(items).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://directus.test.local/items/lab_recursos_equipos?limit=-1',
      expect.objectContaining({
        method: 'GET',
        cache: 'no-store',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      })
    );
  });

  it('propaga DirectusError cuando Directus responde con error HTTP (no oculta fallos)', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ errors: [{ message: 'Internal error' }] }),
    });

    await expect(directus.getItems('equipos')).rejects.toThrow(DirectusError);
  });

  it('lanza DirectusError 503 si DIRECTUS_URL no está configurada (sin default a producción)', async () => {
    delete process.env.DIRECTUS_URL;
    await expect(directus.getItems('equipos')).rejects.toMatchObject({
      name: 'DirectusError',
      status: 503,
    });
  });

  it('crea un item en Directus con prefijo y cache: no-store', async () => {
    const newItem = { id: 'folio-001', folio: 'FOL-001', estado: 'Pendiente' };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: newItem }),
    });

    const result = await directus.createItem('reservaciones', newItem);
    expect(result).toEqual(newItem);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://directus.test.local/items/lab_recursos_reservaciones',
      expect.objectContaining({
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify(newItem),
      })
    );
  });
});
