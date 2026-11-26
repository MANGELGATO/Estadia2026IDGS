import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy, buildCspHeader } from './proxy';
import * as jwt from 'next-auth/jwt';
import { rateLimiter, RATE_LIMIT_LOGIN, RATE_LIMIT_MUTATION } from './lib/rateLimit';

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
    it('cuenta solo POST /api/auth/signin (no /callback) y bloquea al superar RATE_LIMIT_LOGIN', async () => {
      // GET /callback nunca debe descontar del límite de login grupal
      for (let i = 0; i < 10; i++) {
        const cbReq = new NextRequest('http://localhost:3000/api/auth/callback/keycloak', {
          method: 'GET',
          headers: { 'x-forwarded-for': '192.168.1.100' },
        });
        const cbRes = await proxy(cbReq);
        expect(cbRes.status).not.toBe(429);
      }

      for (let i = 0; i < RATE_LIMIT_LOGIN.limit; i++) {
        const req = new NextRequest('http://localhost:3000/api/auth/signin/keycloak', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.168.1.100' },
        });
        const res = await proxy(req);
        expect(res.status).not.toBe(429);
      }

      // Al exceder el límite en API JSON responde 429
      const blockedReq = new NextRequest('http://localhost:3000/api/auth/signin/keycloak', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.168.1.100' },
      });
      const blockedRes = await proxy(blockedReq);

      expect(blockedRes.status).toBe(429);
      const data = await blockedRes.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Too Many Requests');
      expect(blockedRes.headers.get('Retry-After')).toBeDefined();

      // En navegación HTML redirige a /login?error=TooManyRequests en lugar de JSON crudo
      const navReq = new NextRequest('http://localhost:3000/api/auth/signin/keycloak', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.100',
          accept: 'text/html',
        },
      });
      const navRes = await proxy(navReq);
      expect(navRes.status).toBe(307);
      expect(navRes.headers.get('location')).toBe('http://localhost:3000/login?error=TooManyRequests');
    });

    it('bloquea saturación en formularios públicos POST /api/reservas y /api/cursos al superar RATE_LIMIT_MUTATION', async () => {
      for (let i = 0; i < RATE_LIMIT_MUTATION.limit; i++) {
        const req = new NextRequest('http://localhost:3000/api/reservas', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.168.1.200' },
        });
        const res = await proxy(req);
        expect(res.status).not.toBe(429);
      }

      const blockedReq = new NextRequest('http://localhost:3000/api/cursos', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.168.1.200' },
      });
      const blockedRes = await proxy(blockedReq);

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.headers.get('X-RateLimit-Limit')).toBe(String(RATE_LIMIT_MUTATION.limit));
    });

    it('rechaza POST /api/cursos con origen cruzado (protección CSRF)', async () => {
      const req = new NextRequest('https://recursos.plai.mx/api/cursos', {
        method: 'POST',
        headers: {
          host: 'recursos.plai.mx',
          origin: 'https://atacante.evil',
        },
      });
      const res = await proxy(req);
      expect(res.status).toBe(403);
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

  describe('CSP dinámica con nonce y origen Keycloak en runtime', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalKeycloakIssuer = process.env.KEYCLOAK_ISSUER;

    afterEach(() => {
      vi.stubEnv('NODE_ENV', originalNodeEnv ?? 'test');
      if (originalKeycloakIssuer === undefined) {
        delete process.env.KEYCLOAK_ISSUER;
      } else {
        process.env.KEYCLOAK_ISSUER = originalKeycloakIssuer;
      }
    });

    it('emite CSP con nonce único por petición sin unsafe-inline en script-src en producción', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      process.env.KEYCLOAK_ISSUER = 'https://sso.plai.mx/realms/plai';

      const res1 = await proxy(new NextRequest('https://recursos.plai.mx/'));
      const res2 = await proxy(new NextRequest('https://recursos.plai.mx/'));

      const csp1 = res1.headers.get('Content-Security-Policy') || '';
      const csp2 = res2.headers.get('Content-Security-Policy') || '';

      expect(csp1).toContain("script-src 'self' 'nonce-");
      expect(csp1).toContain("'strict-dynamic'");
      expect(csp1).not.toContain("script-src 'self' 'unsafe-inline'");
      expect(csp1).not.toContain("'unsafe-eval'");
      expect(csp1).toContain('connect-src \'self\' https://sso.plai.mx');
      expect(csp1).toContain('form-action \'self\' https://sso.plai.mx');
      expect(csp1).toContain('upgrade-insecure-requests');
      expect(csp1).not.toBe(csp2);
    });

    it('buildCspHeader resuelve KEYCLOAK_ISSUER en tiempo de ejecución', () => {
      vi.stubEnv('NODE_ENV', 'production');
      process.env.KEYCLOAK_ISSUER = 'https://auth.institucional.plai.mx/realms/lab';

      const csp = buildCspHeader('test-nonce-123');
      expect(csp).toContain("script-src 'self' 'nonce-test-nonce-123' 'strict-dynamic'");
      expect(csp).toContain("frame-src https://www.youtube.com https://www.youtube-nocookie.com");
      expect(csp).toContain("connect-src 'self' https://auth.institucional.plai.mx");
      expect(csp).toContain("form-action 'self' https://auth.institucional.plai.mx");
    });
  });
});
