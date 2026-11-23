import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions } from './auth';
import { hashPassword, verifyPassword } from './password';
import * as db from './db';

vi.mock('./db', async () => {
  const actual = await vi.importActual<typeof db>('./db');
  return {
    ...actual,
    getUsuarioByEmailForAuth: vi.fn(),
    updateUsuarioLastLogin: vi.fn().mockResolvedValue(undefined),
  };
});

describe('NextAuth.js & Password Security (PLAi Standard v1.0)', () => {
  const getUsuarioMock = vi.mocked(db.getUsuarioByEmailForAuth);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('genera y valida hashes scrypt con sal única (sin contraseñas en texto plano)', () => {
    const hash1 = hashPassword('ClaveSegura2026!');
    const hash2 = hashPassword('ClaveSegura2026!');

    expect(hash1.startsWith('scrypt$')).toBe(true);
    expect(hash1).not.toBe(hash2);
    expect(verifyPassword('ClaveSegura2026!', hash1)).toBe(true);
    expect(verifyPassword('ClaveIncorrecta', hash1)).toBe(false);
    expect(verifyPassword('ClaveSegura2026!', 'ClaveSegura2026!')).toBe(false);
  });

  it('configura la estrategia de sesión basada en JWT', () => {
    expect(authOptions.session?.strategy).toBe('jwt');
  });

  it('cuenta con las páginas de autenticación institucionales configuradas', () => {
    expect(authOptions.pages?.signIn).toBe('/login');
    expect(authOptions.pages?.error).toBe('/login');
  });

  it('valida credenciales válidas contra la base de datos y retorna el rol real', async () => {
    const storedHash = hashPassword('PlaiProdPass#2026');
    getUsuarioMock.mockResolvedValueOnce({
      id: 'usr-admin-01',
      name: 'Administrador PLAi',
      email: 'admin@plai.mx',
      passwordHash: storedHash,
      role: 'admin',
      status: 'Activo',
    });

    const credentialsProvider = authOptions.providers.find((p) => p.id === 'credentials') as {
      options?: { authorize: (credentials: unknown, req: unknown) => Promise<unknown> };
      authorize?: (credentials: unknown, req: unknown) => Promise<unknown>;
    };
    const authorize = credentialsProvider.options?.authorize || credentialsProvider.authorize;

    const result = (await authorize!(
      { email: 'admin@plai.mx', password: 'PlaiProdPass#2026' },
      {}
    )) as { id: string; email: string; role: string } | null;

    expect(result).not.toBeNull();
    expect(result?.id).toBe('usr-admin-01');
    expect(result?.email).toBe('admin@plai.mx');
    expect(result?.role).toBe('admin');
  });

  it('rechaza usuarios con cuenta inactiva aunque la contraseña sea correcta', async () => {
    const storedHash = hashPassword('PlaiProdPass#2026');
    getUsuarioMock.mockResolvedValueOnce({
      id: 'usr-inactivo',
      name: 'Cuenta Suspendida',
      email: 'inactivo@plai.mx',
      passwordHash: storedHash,
      role: 'usuario',
      status: 'Inactivo',
    });

    const credentialsProvider = authOptions.providers.find((p) => p.id === 'credentials') as {
      options?: { authorize: (credentials: unknown, req: unknown) => Promise<unknown> };
      authorize?: (credentials: unknown, req: unknown) => Promise<unknown>;
    };
    const authorize = credentialsProvider.options?.authorize || credentialsProvider.authorize;

    const result = await authorize!(
      { email: 'inactivo@plai.mx', password: 'PlaiProdPass#2026' },
      {}
    );

    expect(result).toBeNull();
  });

  it('rechaza credenciales con contraseña incorrecta', async () => {
    const storedHash = hashPassword('PlaiProdPass#2026');
    getUsuarioMock.mockResolvedValueOnce({
      id: 'usr-admin-01',
      name: 'Administrador PLAi',
      email: 'admin@plai.mx',
      passwordHash: storedHash,
      role: 'admin',
      status: 'Activo',
    });

    const credentialsProvider = authOptions.providers.find((p) => p.id === 'credentials') as {
      options?: { authorize: (credentials: unknown, req: unknown) => Promise<unknown> };
      authorize?: (credentials: unknown, req: unknown) => Promise<unknown>;
    };
    const authorize = credentialsProvider.options?.authorize || credentialsProvider.authorize;

    const result = await authorize!(
      { email: 'admin@plai.mx', password: 'password-invalida' },
      {}
    );

    expect(result).toBeNull();
  });

  it('rechaza usuarios inexistentes', async () => {
    getUsuarioMock.mockResolvedValueOnce(null);

    const credentialsProvider = authOptions.providers.find((p) => p.id === 'credentials') as {
      options?: { authorize: (credentials: unknown, req: unknown) => Promise<unknown> };
      authorize?: (credentials: unknown, req: unknown) => Promise<unknown>;
    };
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

  it('mapea correctamente roles de Keycloak (realm_access y resource_access)', async () => {
    const { extractKeycloakRole } = await import('./auth');
    
    // Admin en realm
    expect(extractKeycloakRole({ realm_access: { roles: ['default-roles-plai', 'admin'] } }, 'plai-recursos')).toBe('admin');
    
    // Colaborador en client roles
    expect(extractKeycloakRole({ resource_access: { 'plai-recursos': { roles: ['colaborador'] } } }, 'plai-recursos')).toBe('colaborador');
    
    // Usuario estándar por defecto
    expect(extractKeycloakRole({ realm_access: { roles: ['offline_access'] } }, 'plai-recursos')).toBe('usuario');
  });
});
