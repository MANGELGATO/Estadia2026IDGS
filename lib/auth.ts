import type { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { env, isBuildPhase } from './env';
import { logger } from './logger';
import { syncKeycloakUserInDB } from './db';
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

function resolveRoleFromKeycloakLogin(
  accessToken: string | undefined,
  profile: Record<string, unknown> | undefined,
  clientId: string
): UserRole {
  const accessClaims = decodeJwtPayload(accessToken);
  const roleFromAccessToken = extractKeycloakRole(accessClaims, clientId);
  if (roleFromAccessToken !== 'usuario') {
    return roleFromAccessToken;
  }
  if (profile) {
    return extractKeycloakRole(profile, clientId);
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
 * 4. NO persistir `access_token` en el JWT de sesión para mantener la cookie compacta.
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
      async signIn({ user, account, profile }) {
        if (!user.email) {
          return false;
        }
        if (!env.hasDirectusConfig) {
          return true;
        }

        const profileObj = profile as Record<string, unknown> | undefined;
        const accessClaims = decodeJwtPayload(account?.access_token);
        const emailVerified =
          profileObj?.email_verified === true || accessClaims?.email_verified === true;

        const resolvedRole = resolveRoleFromKeycloakLogin(
          account?.access_token,
          profileObj,
          clientId
        );

        try {
          const syncResult = await syncKeycloakUserInDB({
            id: user.id,
            name: user.name || 'Usuario PLAi',
            email: user.email,
            role: resolvedRole,
            emailVerified,
          });

          if (!syncResult.allowed) {
            if (syncResult.reason === 'email_unverified') {
              logger.warn(
                'Inicio de sesión denegado: correo no verificado en Keycloak para cuenta pre-registrada',
                { userId: user.id }
              );
              return '/login?error=EmailNotVerified';
            }
            logger.warn('Inicio de sesión denegado: cuenta marcada como Inactiva en el directorio', {
              userId: user.id,
            });
            return '/login?error=AccountInactive';
          }
        } catch (error) {
          // Política FAIL-CLOSED: si Directus no responde, no se permite iniciar sesión
          // para garantizar que una cuenta marcada como Inactiva jamás evada el bloqueo.
          logger.error(
            'Error al verificar/sincronizar usuario Keycloak en Directus durante signIn (fail-closed)',
            {
              userId: user.id,
              error: String(error),
            }
          );
          return '/login?error=ServiceUnavailable';
        }

        return true;
      },
      async jwt({ token, user, account, profile }) {
        if (user) {
          token.id = user.id;
          token.role = user.role;
        }
        if (account) {
          // Solo conservamos idToken (necesario para id_token_hint en SLO de Keycloak).
          // NO guardamos access_token porque no se utiliza y fragmenta innecesariamente la cookie.
          token.idToken = account.id_token;
          token.role = resolveRoleFromKeycloakLogin(
            account.access_token,
            profile as Record<string, unknown> | undefined,
            clientId
          );
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
