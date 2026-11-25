import type { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { env, isBuildPhase } from './env';
import { logger } from './logger';
import type { UserRole } from '../types/next-auth';

/**
 * Decodifica el payload de un JWT (Base64URL) recibido directamente del backchannel TLS
 * de Keycloak (`account.access_token`) para inspeccionar `resource_access[clientId].roles`.
 * En Keycloak, los roles de cliente viajan por defecto en el access_token y NO en /userinfo.
 */
export function decodeJwtPayload(jwtToken?: string): Record<string, unknown> | null {
  if (!jwtToken || typeof jwtToken !== 'string') return null;
  const parts = jwtToken.split('.');
  if (parts.length !== 3) return null;
  try {
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    const parsed = JSON.parse(payloadJson);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Extrae el rol institucional del usuario EXCLUSIVAMENTE desde los roles asignados
 * a ESTE cliente en Keycloak (`resource_access[clientId].roles`), con coincidencia EXACTA.
 *
 * Seguridad:
 * - NO lee `realm_access.roles` ni `groups` globales para impedir escalamiento de privilegios
 *   proveniente de roles/grupos de otras aplicaciones que compartan el mismo realm de PLAi.
 * - NO usa `.includes()` ni coincidencias parciales.
 */
export function extractKeycloakRole(
  claims: Record<string, unknown> | null | undefined,
  clientId: string
): UserRole {
  if (!claims || !clientId) return 'usuario';

  const resourceAccess = claims.resource_access as
    | Record<string, { roles?: unknown }>
    | undefined;
  const rawClientRoles = resourceAccess?.[clientId]?.roles;

  if (!Array.isArray(rawClientRoles)) {
    return 'usuario';
  }

  const clientRoles = new Set(
    rawClientRoles.map((r) => String(r).trim().toLowerCase())
  );

  if (clientRoles.has('admin')) {
    return 'admin';
  }
  if (clientRoles.has('colaborador')) {
    return 'colaborador';
  }
  return 'usuario';
}

/**
 * Construye las opciones de NextAuth en tiempo de ejecución (lazy) para:
 * 1. Evitar que `next build` dentro del Dockerfile falle cuando los Docker secrets
 *    aún no están montados en `/run/secrets/`.
 * 2. Validar estrictamente en runtime de producción que existan `NEXTAUTH_SECRET`
 *    y las credenciales de Keycloak sin valores por defecto hardcodeados.
 * 3. Mantener Keycloak como ÚNICO proveedor de identidad (sin puerta trasera local).
 */
export function getAuthOptions(): NextAuthOptions {
  if (env.isProduction && !isBuildPhase()) {
    if (!env.isKeycloakConfigured) {
      logger.error(
        'Configuración incompleta de Keycloak en producción (KEYCLOAK_ISSUER, KEYCLOAK_ID, KEYCLOAK_SECRET).'
      );
      throw new Error(
        'CRÍTICO: KEYCLOAK_ISSUER, KEYCLOAK_ID y KEYCLOAK_SECRET son obligatorios en producción.'
      );
    }
  }

  const clientId = env.keycloakClientId;
  const clientSecret = env.keycloakClientSecret;
  const issuer = env.keycloakIssuer;

  return {
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
      KeycloakProvider({
        id: 'keycloak',
        name: 'Keycloak SSO PLAi',
        clientId: clientId || 'unconfigured-keycloak-client',
        clientSecret: clientSecret || '',
        issuer: issuer || 'https://unconfigured-keycloak-issuer.invalid',
        profile(profile) {
          return {
            id: String(profile.sub),
            name: profile.name || profile.preferred_username || 'Usuario PLAi',
            email: profile.email,
            role: extractKeycloakRole(profile as Record<string, unknown>, clientId),
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
        if (account) {
          token.accessToken = account.access_token;
          token.idToken = account.id_token;

          // 1. Prioridad: extraer roles del access_token JWT de Keycloak (donde vive resource_access)
          const accessClaims = decodeJwtPayload(account.access_token);
          const roleFromAccessToken = extractKeycloakRole(accessClaims, clientId);

          if (roleFromAccessToken !== 'usuario') {
            token.role = roleFromAccessToken;
          } else if (profile) {
            // 2. Respaldo: si el cliente de Keycloak tiene mapper hacia ID Token / UserInfo
            token.role = extractKeycloakRole(profile as Record<string, unknown>, clientId);
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
}

/**
 * Instancia compatible para llamadas de `getServerSession(authOptions)`.
 * Se delega a `getAuthOptions()` usando un getter seguro para no romper `next build`.
 */
export const authOptions: NextAuthOptions = getAuthOptions();
