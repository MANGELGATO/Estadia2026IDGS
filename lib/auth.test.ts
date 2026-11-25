import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAuthOptions, extractKeycloakRole, decodeJwtPayload } from './auth';

function makeFakeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe('NextAuth.js + Keycloak OIDC Security (PLAi Standard v1.0)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      KEYCLOAK_ID: 'plai-recursos',
      KEYCLOAK_SECRET: 'test-secret',
      KEYCLOAK_ISSUER: 'https://sso.example.test/realms/plai',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('usa únicamente Keycloak como proveedor de identidad (sin puerta trasera de contraseña local)', () => {
    const opts = getAuthOptions();
    expect(opts.providers).toHaveLength(1);
    expect(opts.providers[0].id).toBe('keycloak');
  });

  it('configura estrategia JWT de 8 horas y páginas institucionales', () => {
    const opts = getAuthOptions();
    expect(opts.session?.strategy).toBe('jwt');
    expect(opts.session?.maxAge).toBe(8 * 60 * 60);
    expect(opts.pages?.signIn).toBe('/login');
  });

  it('extrae roles EXCLUSIVAMENTE de resource_access[clientId].roles con coincidencia exacta', () => {
    expect(
      extractKeycloakRole(
        { resource_access: { 'plai-recursos': { roles: ['admin'] } } },
        'plai-recursos'
      )
    ).toBe('admin');

    expect(
      extractKeycloakRole(
        { resource_access: { 'plai-recursos': { roles: ['colaborador'] } } },
        'plai-recursos'
      )
    ).toBe('colaborador');

    expect(
      extractKeycloakRole(
        { resource_access: { 'plai-recursos': { roles: ['usuario'] } } },
        'plai-recursos'
      )
    ).toBe('usuario');
  });

  it('bloquea escalamiento de privilegios desde realm_access, grupos u otras apps del mismo realm', () => {
    // Rol admin en realm global NO debe dar admin en esta app
    expect(
      extractKeycloakRole({ realm_access: { roles: ['admin', 'plai_admin'] } }, 'plai-recursos')
    ).toBe('usuario');

    // Rol admin en OTRA app del mismo realm NO debe dar admin aquí
    expect(
      extractKeycloakRole(
        { resource_access: { 'otra-app-plai': { roles: ['admin'] } } },
        'plai-recursos'
      )
    ).toBe('usuario');

    // Grupos o roles con subcadena "admin" NO deben dar admin
    expect(
      extractKeycloakRole(
        {
          groups: ['/administracion', 'super-admin'],
          resource_access: { 'plai-recursos': { roles: ['cursos-admin', 'administrativo'] } },
        },
        'plai-recursos'
      )
    ).toBe('usuario');
  });

  it('decodifica access_token de Keycloak en el callback jwt para leer resource_access', async () => {
    const opts = getAuthOptions();
    const jwtCallback = opts.callbacks?.jwt;
    expect(jwtCallback).toBeDefined();

    const accessToken = makeFakeJwt({
      sub: 'kc-uuid-999',
      resource_access: {
        'plai-recursos': { roles: ['admin'] },
      },
    });

    expect(decodeJwtPayload(accessToken)?.sub).toBe('kc-uuid-999');

    // @ts-expect-error mock de parámetros del callback jwt
    const token = await jwtCallback({
      token: {},
      user: { id: 'kc-uuid-999', role: 'usuario', email: 'admin@plai.mx' },
      account: {
        provider: 'keycloak',
        type: 'oauth',
        providerAccountId: 'kc-uuid-999',
        access_token: accessToken,
        id_token: 'fake-id-token-for-slo',
      },
      profile: { sub: 'kc-uuid-999' }, // /userinfo sin roles
    });

    expect(token.id).toBe('kc-uuid-999');
    expect(token.role).toBe('admin');
    expect(token.idToken).toBe('fake-id-token-for-slo');
  });

  it('el callback session propaga id y role a session.user sin exponer idToken al navegador', async () => {
    const opts = getAuthOptions();
    const sessionCallback = opts.callbacks?.session;
    expect(sessionCallback).toBeDefined();

    // @ts-expect-error mock simplificado
    const session = await sessionCallback({
      session: { user: { name: 'Admin', email: 'admin@plai.mx' }, expires: '' },
      token: { id: 'kc-uuid-999', role: 'admin', idToken: 'secret-id-token' },
    });

    const enrichedUser = session.user as { id?: string; role?: string } | undefined;
    expect(enrichedUser?.id).toBe('kc-uuid-999');
    expect(enrichedUser?.role).toBe('admin');
    expect((session as unknown as Record<string, unknown>).idToken).toBeUndefined();
  });
});
