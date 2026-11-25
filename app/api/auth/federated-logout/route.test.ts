import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import * as federatedLogout from './route';

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(async () => ({ idToken: 'test-id-token-123' })),
}));

describe('POST /api/auth/federated-logout (anti-Logout CSRF)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SITE_URL: 'https://recursos.test.local',
      KEYCLOAK_ISSUER: 'https://sso.test.local/realms/plai',
      KEYCLOAK_ID: 'plai-recursos',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('NO expone handler GET (bloquea Logout CSRF mediante <img> o enlaces)', () => {
    expect((federatedLogout as Record<string, unknown>).GET).toBeUndefined();
    expect(typeof federatedLogout.POST).toBe('function');
  });

  it('rechaza peticiones POST con cabecera Origin de otro dominio (403)', async () => {
    const req = new NextRequest('https://recursos.test.local/api/auth/federated-logout', {
      method: 'POST',
      headers: {
        host: 'recursos.test.local',
        origin: 'https://sitio-atacante.evil',
      },
    });

    const res = await federatedLogout.POST(req);
    expect(res.status).toBe(403);
  });

  it('limpia cookies y devuelve logoutUrl de Keycloak en POST del mismo origen (200)', async () => {
    const req = new NextRequest('https://recursos.test.local/api/auth/federated-logout', {
      method: 'POST',
      headers: {
        host: 'recursos.test.local',
        origin: 'https://recursos.test.local',
      },
    });

    const res = await federatedLogout.POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.logoutUrl).toContain('https://sso.test.local/realms/plai/protocol/openid-connect/logout');
    expect(json.logoutUrl).toContain('id_token_hint=test-id-token-123');
  });
});
