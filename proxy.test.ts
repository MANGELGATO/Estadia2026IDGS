import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';
import * as jwt from 'next-auth/jwt';
import { rateLimiter } from './lib/rateLimit';

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

describe('Proxy Security and RBAC (Next.js 16)', () => {
  const getTokenMock = vi.mocked(jwt.getToken);

  beforeEach(() => {
    vi.clearAllMocks();
    rateLimiter.reset();
  });

  describe('Control de Acceso y RBAC', () => {
    it('redirige a /login cuando un usuario anónimo intenta entrar a /admin', async () => {
      getTokenMock.mockResolvedValueOnce(null);

      const req = new NextRequest('http://localhost:3000/admin');
      const res = await proxy(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/login?callbackUrl=%2Fadmin');
    });

    it('redirige a /login cuando un usuario anónimo intenta entrar a /usuario', async () => {
      getTokenMock.mockResolvedValueOnce(null);

      const req = new NextRequest('http://localhost:3000/usuario/prestamos');
      const res = await proxy(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/login?callbackUrl=%2Fusuario%2Fprestamos');
    });

    it('bloquea a un usuario estándar que intenta entrar a /admin y lo redirige a /usuario', async () => {
      getTokenMock.mockResolvedValueOnce({
        id: 'usr-standard-01',
        role: 'usuario',
        email: 'usuario@plai.mx',
      } as unknown as jwt.JWT);

      const req = new NextRequest('http://localhost:3000/admin/inventario');
      const res = await proxy(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/usuario');
    });

    it('permite el acceso a /admin a un usuario con rol admin', async () => {
      getTokenMock.mockResolvedValueOnce({
        id: 'usr-admin-01',
        role: 'admin',
        email: 'admin@plai.mx',
      } as unknown as jwt.JWT);

      const req = new NextRequest('http://localhost:3000/admin');
      const res = await proxy(req);

      // NextResponse.next() no redirecciona (status 200 y sin cabecera location)
      expect(res.headers.get('location')).toBeNull();
    });

    it('redirige a su dashboard a un usuario ya autenticado que visita /login', async () => {
      getTokenMock.mockResolvedValueOnce({
        id: 'usr-admin-01',
        role: 'admin',
        email: 'admin@plai.mx',
      } as unknown as jwt.JWT);

      const req = new NextRequest('http://localhost:3000/login');
      const res = await proxy(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/admin');
    });
  });

  describe('Rate Limiting en Proxy (Sección 7.3 Estándar PLAi)', () => {
    it('bloquea intentos de fuerza bruta en /api/auth con código 429 tras exceder el límite', async () => {
      // RATE_LIMIT_LOGIN permite 5 peticiones
      for (let i = 0; i < 5; i++) {
        const req = new NextRequest('http://localhost:3000/api/auth/signin', {
          headers: { 'x-forwarded-for': '192.168.1.100' },
        });
        const res = await proxy(req);
        expect(res.status).not.toBe(429);
      }

      // La petición 6 debe ser bloqueada con 429
      const blockedReq = new NextRequest('http://localhost:3000/api/auth/signin', {
        headers: { 'x-forwarded-for': '192.168.1.100' },
      });
      const blockedRes = await proxy(blockedReq);

      expect(blockedRes.status).toBe(429);
      const data = await blockedRes.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Too Many Requests');
      expect(blockedRes.headers.get('Retry-After')).toBeDefined();
    });

    it('bloquea saturación en formulario público POST /api/reservas con código 429 tras 10 peticiones', async () => {
      // RATE_LIMIT_MUTATION permite 10 peticiones
      for (let i = 0; i < 10; i++) {
        const req = new NextRequest('http://localhost:3000/api/reservas', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.168.1.200' },
        });
        const res = await proxy(req);
        expect(res.status).not.toBe(429);
      }

      const blockedReq = new NextRequest('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.168.1.200' },
      });
      const blockedRes = await proxy(blockedReq);

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.headers.get('X-RateLimit-Limit')).toBe('10');
    });

    it('no aplica limitación de mutaciones a peticiones GET hacia /api/reservas', async () => {
      const req = new NextRequest('http://localhost:3000/api/reservas', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.200' },
      });
      const res = await proxy(req);
      expect(res.status).not.toBe(429);
    });
  });
});
