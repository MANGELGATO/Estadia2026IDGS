import { describe, it, expect, vi, beforeEach } from 'vitest';
import { directus } from './directus';

describe('Directus REST Client (PLAi Standard v1.0)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('obtiene items de una colección correctamente cuando la API responde 200', async () => {
    const mockData = [{ id: '1', nombre: 'Meta Quest 3' }];
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    });

    const items = await directus.getItems('equipos');
    expect(items).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('maneja respuestas de error HTTP graciosamente retornando un arreglo vacío', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const items = await directus.getItems('coleccion_inexistente');
    expect(items).toEqual([]);
  });

  it('crea un item en Directus enviando el payload JSON correspondiente', async () => {
    const newItem = { id: 'folio-001', folio: 'FOL-001', estado: 'Pendiente' };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: newItem }),
    });

    const result = await directus.createItem('reservaciones', newItem);
    expect(result).toEqual(newItem);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/items/reservaciones'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newItem),
      })
    );
  });
});
