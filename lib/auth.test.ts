import { describe, it, expect } from 'vitest';
import { authOptions, DEMO_USERS } from './auth';

describe('NextAuth.js Configuration (PLAi Standard v1.0)', () => {
  it('configura la estrategia de sesión basada en JWT', () => {
    expect(authOptions.session?.strategy).toBe('jwt');
  });

  it('cuenta con las páginas de autenticación institucionales configuradas', () => {
    expect(authOptions.pages?.signIn).toBe('/login');
    expect(authOptions.pages?.error).toBe('/login');
  });

  it('incluye los usuarios de demostración con sus roles correctos', () => {
    const admin = DEMO_USERS.find((u) => u.email === 'admin@plai.mx');
    const user = DEMO_USERS.find((u) => u.email === 'usuario@plai.mx');

    expect(admin).toBeDefined();
    expect(admin?.role).toBe('admin');

    expect(user).toBeDefined();
    expect(user?.role).toBe('usuario');
  });

  it('valida credenciales válidas en el proveedor de autenticación', async () => {
    const credentialsProvider = authOptions.providers.find(
      (p) => p.id === 'credentials'
    ) as { options?: { authorize: (credentials: unknown, req: unknown) => Promise<unknown> }; authorize?: (credentials: unknown, req: unknown) => Promise<unknown> };
    expect(credentialsProvider).toBeDefined();

    const authorize = credentialsProvider.options?.authorize || credentialsProvider.authorize;
    expect(authorize).toBeDefined();

    const result = (await authorize!(
      { email: 'admin@plai.mx', password: 'AdminPlai2026!' },
      {}
    )) as { email: string; role: string } | null;

    expect(result).not.toBeNull();
    expect(result?.email).toBe('admin@plai.mx');
    expect(result?.role).toBe('admin');
  });

  it('rechaza credenciales con contraseña incorrecta', async () => {
    const credentialsProvider = authOptions.providers.find(
      (p) => p.id === 'credentials'
    ) as { options?: { authorize: (credentials: unknown, req: unknown) => Promise<unknown> }; authorize?: (credentials: unknown, req: unknown) => Promise<unknown> };

    const authorize = credentialsProvider.options?.authorize || credentialsProvider.authorize;

    const result = await authorize!(
      { email: 'admin@plai.mx', password: 'password-invalida' },
      {}
    );

    expect(result).toBeNull();
  });

  it('rechaza usuarios inexistentes', async () => {
    const credentialsProvider = authOptions.providers.find(
      (p) => p.id === 'credentials'
    ) as { options?: { authorize: (credentials: unknown, req: unknown) => Promise<unknown> }; authorize?: (credentials: unknown, req: unknown) => Promise<unknown> };

    const authorize = credentialsProvider.options?.authorize || credentialsProvider.authorize;

    const result = await authorize!(
      { email: 'desconocido@plai.mx', password: 'password' },
      {}
    );

    expect(result).toBeNull();
  });

  it('el callback jwt propaga id y role', async () => {
    const jwtCallback = authOptions.callbacks?.jwt;
    expect(jwtCallback).toBeDefined();

    // @ts-expect-error testing jwt callback
    const token = await jwtCallback({
      token: {},
      user: { id: 'usr-123', role: 'admin', email: 'admin@plai.mx' },
    });

    expect(token.id).toBe('usr-123');
    expect(token.role).toBe('admin');
  });

  it('el callback session propaga id y role a session.user', async () => {
    const sessionCallback = authOptions.callbacks?.session;
    expect(sessionCallback).toBeDefined();

    // @ts-expect-error invocar callback con mock simplificado
    const session = await sessionCallback({
      session: { user: { name: 'Admin', email: 'admin@plai.mx' }, expires: '' },
      token: { id: 'usr-123', role: 'admin' },
    });

    const enrichedUser = session?.user as { id?: string; role?: string } | undefined;
    expect(enrichedUser?.id).toBe('usr-123');
    expect(enrichedUser?.role).toBe('admin');
  });
});
