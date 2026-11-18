import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import * as jwt from 'next-auth/jwt';
import { requireSession } from './apiAuth';

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

describe('requireSession (autorización en Route Handlers)', () => {
  const getTokenMock = vi.mocked(jwt.getToken);
  const req = () => new NextRequest('http://localhost:3000/api/usuarios');

  beforeEach(() => vi.clearAllMocks());

  it('responde 401 sin sesión', async () => {
    getTokenMock.mockResolvedValueOnce(null);
    const result = await requireSession(req(), 'admin');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
  });

  it('responde 403 cuando el rol no es admin', async () => {
    getTokenMock.mockResolvedValueOnce({ role: 'usuario', email: 'u@plai.mx' } as unknown as jwt.JWT);
    const result = await requireSession(req(), 'admin');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(403);
  });

  it('permite a un admin', async () => {
    getTokenMock.mockResolvedValueOnce({ role: 'admin' } as unknown as jwt.JWT);
    const result = await requireSession(req(), 'admin');
    expect(result.ok).toBe(true);
  });

  it('permite a cualquier sesión válida cuando no se exige rol', async () => {
    getTokenMock.mockResolvedValueOnce({ role: 'usuario' } as unknown as jwt.JWT);
    const result = await requireSession(req());
    expect(result.ok).toBe(true);
  });
});

describe('env en producción', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
    vi.resetModules();
  });

  it('falla si falta NEXTAUTH_SECRET', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET_FILE;
    const { env } = await import('./env');
    expect(() => env.nextAuthSecret).toThrow(/NEXTAUTH_SECRET/);
    vi.unstubAllEnvs();
  });

  it('deshabilita las cuentas demo por defecto en producción', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.DEMO_LOGIN_ENABLED;
    const { env } = await import('./env');
    expect(env.demoLoginEnabled).toBe(false);
    vi.unstubAllEnvs();
  });
});
