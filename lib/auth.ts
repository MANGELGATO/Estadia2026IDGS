import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { env } from './env';
import { getUsuarioByEmailForAuth, updateUsuarioLastLogin } from './db';
import { verifyPassword } from './password';
import { logger } from './logger';
import type { UserRole } from '../types/next-auth';

/**
 * Mapea los roles y claims OIDC emitidos por Keycloak al RBAC interno de PLAi:
 * ('admin' | 'colaborador' | 'usuario').
 */
export function extractKeycloakRole(
  profile: Record<string, unknown> | undefined,
  clientId: string
): UserRole {
  if (!profile) return 'usuario';

  const realmAccess = profile.realm_access as { roles?: string[] } | undefined;
  const resourceAccess = profile.resource_access as Record<string, { roles?: string[] }> | undefined;
  const groups = Array.isArray(profile.groups) ? profile.groups : [];
  const customRoles = Array.isArray(profile.roles) ? profile.roles : [];

  const realmRoles = Array.isArray(realmAccess?.roles) ? realmAccess.roles : [];
  const clientRoles = Array.isArray(resourceAccess?.[clientId]?.roles)
    ? resourceAccess[clientId].roles
    : [];

  const all = [...realmRoles, ...clientRoles, ...groups, ...customRoles].map((r) =>
    String(r).toLowerCase().trim()
  );

  if (all.some((r) => r === 'admin' || r === 'plai_admin' || r.includes('admin'))) {
    return 'admin';
  }
  if (
    all.some(
      (r) =>
        r === 'colaborador' ||
        r === 'plai_colaborador' ||
        r === 'staff' ||
        r.includes('colaborador')
    )
  ) {
    return 'colaborador';
  }
  return 'usuario';
}

/**
 * Configuración definitiva de NextAuth.js v4 (Estándar Tecnológico PLAi v1.0, Sección 7).
 * - Proveedor principal: Keycloak SSO OIDC Institucional de PLAi.
 * - Proveedor secundario: Credenciales locales con hash scrypt (desarrollo / contingencia).
 * - Sesiones JWT firmadas en servidor (8 horas).
 * - RBAC ('admin', 'colaborador', 'usuario') mapeado automáticamente.
 */
export const authOptions: NextAuthOptions = {
  secret: env.nextAuthSecret,
  useSecureCookies: env.isProduction,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas de jornada laboral estándar
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    // 1. Proveedor Institucional Keycloak (OIDC)
    KeycloakProvider({
      id: 'keycloak',
      name: 'Keycloak SSO PLAi',
      clientId: env.keycloakClientId,
      clientSecret: env.keycloakClientSecret || 'plai-keycloak-client-secret-placeholder',
      issuer: env.keycloakIssuer,
      profile(profile) {
        return {
          id: String(profile.sub),
          name: profile.name || profile.preferred_username || 'Usuario PLAi',
          email: profile.email,
          role: extractKeycloakRole(profile as Record<string, unknown>, env.keycloakClientId),
        };
      },
    }),
    // 2. Proveedor de credenciales locales (desarrollo y soporte técnico)
    CredentialsProvider({
      id: 'credentials',
      name: 'Credenciales Institucionales PLAi',
      credentials: {
        email: { label: 'Correo Institucional', type: 'email', placeholder: 'correo@plai.mx' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const user = await getUsuarioByEmailForAuth(normalizedEmail);

        if (!user) {
          return null;
        }

        if (user.status !== 'Activo') {
          logger.warn('Intento de acceso con cuenta inactiva o suspendida', {
            userId: user.id,
          });
          return null;
        }

        const isValid = verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        await updateUsuarioLastLogin(user.id);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
        if (user) {
          token.id = user.id;
          token.role = user.role;
        }
        if (account && profile) {
          token.accessToken = account.access_token;
          token.idToken = account.id_token;
          if (!token.role || token.role === 'usuario') {
            token.role = extractKeycloakRole(
              profile as Record<string, unknown>,
              env.keycloakClientId
            );
          }
        }
        return token;
      },
    async session({ session, token }) {
        if (session.user) {
          session.user.id = (token.id as string) || (token.sub as string);
          session.user.role = (token.role as UserRole) || 'usuario';
        }
        return session;
      },
    },
  };
