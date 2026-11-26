import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { GET } from './[id]/route';
import {
  extractMediaFileId,
  deleteDirectusMediaFile,
  resetMediaFolderCacheForTests,
} from '../../../lib/directusMedia';
import * as nextAuth from 'next-auth';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('/api/media — Aislamiento en carpeta exclusiva lab_recursos', () => {
  const getServerSessionMock = vi.mocked(nextAuth.getServerSession);
  const originalEnv = process.env;
  const FOLDER_UUID = '11111111-2222-3333-4444-555555555555';
  const FILE_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

  beforeEach(() => {
    vi.restoreAllMocks();
    resetMediaFolderCacheForTests();
    process.env = {
      ...originalEnv,
      DIRECTUS_URL: 'https://directus.test.local',
      DIRECTUS_TOKEN: 'svc-token-test',
      DIRECTUS_MEDIA_FOLDER: 'lab_recursos',
    };
    delete process.env.DIRECTUS_MEDIA_FOLDER_ID;

    getServerSessionMock.mockResolvedValue({
      user: {
        id: 'kc-admin-1',
        name: 'Admin PLAi',
        email: 'admin@plai.mx',
        role: 'admin',
      },
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('POST /api/media resuelve la carpeta lab_recursos y envía folder ANTES de file en FormData', async () => {
    const capturedKeys: string[] = [];
    let capturedFolder: FormDataEntryValue | null = null;

    global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/items/lab_recursos_usuarios')) {
        return new Response(JSON.stringify({ data: { id: 'kc-admin-1', estado: 'Activo' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (url.includes('/folders?')) {
        return new Response(
          JSON.stringify({ data: [{ id: FOLDER_UUID, name: 'lab_recursos' }] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (url.endsWith('/files') && init?.method === 'POST') {
        const fd = init.body as FormData;
        for (const [k] of fd.entries()) {
          capturedKeys.push(k);
        }
        capturedFolder = fd.get('folder');
        return new Response(JSON.stringify({ data: { id: FILE_UUID } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(null, { status: 404 });
    });

    const form = new FormData();
    form.append('file', new File([new Uint8Array([137, 80, 78, 71])], 'equipo.png', { type: 'image/png' }));

    const req = new NextRequest('http://localhost:3000/api/media', {
      method: 'POST',
      body: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.url).toBe(`/api/media/${FILE_UUID}`);
    expect(capturedFolder).toBe(FOLDER_UUID);
    expect(capturedKeys.indexOf('folder')).toBeLessThan(capturedKeys.indexOf('file'));
  });

  it('GET /api/media/[id] convierte HTTP 403 de Directus (archivo de otra app) en 404', async () => {
    global.fetch = vi.fn(async () => new Response(null, { status: 403 }));

    const req = new NextRequest(`http://localhost:3000/api/media/${FILE_UUID}`);
    const res = await GET(req, { params: Promise.resolve({ id: FILE_UUID }) });

    expect(res.status).toBe(404);
  });

  it('extractMediaFileId y deleteDirectusMediaFile limpian solo archivos /api/media/<uuid>', async () => {
    expect(extractMediaFileId(`/api/media/${FILE_UUID}`)).toBe(FILE_UUID);
    expect(extractMediaFileId('/images/equipos/meta-quest-3.png')).toBeNull();
    expect(extractMediaFileId('https://otra.app/img.png')).toBeNull();

    global.fetch = vi.fn(async () => new Response(null, { status: 204 }));
    const deleted = await deleteDirectusMediaFile(FILE_UUID);
    expect(deleted).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://directus.test.local/files/${FILE_UUID}`,
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
