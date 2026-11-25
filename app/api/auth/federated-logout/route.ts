import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { env } from '../../../../lib/env';
import { logger } from '../../../../lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Cierre de sesión federado (Single Sign-Out / SLO) contra Keycloak.
 * 1. Obtiene el `idToken` desde el JWT de servidor (nunca expuesto al navegador).
 * 2. Invalida las cookies de sesión locales de NextAuth.
 * 3. Redirige al endpoint `end_session_endpoint` de Keycloak para revocar la sesión SSO.
 */
export async function GET(req: NextRequest) {
  const postLogoutRedirect = new URL('/login', env.siteUrl).toString();

  let redirectTarget = postLogoutRedirect;

  try {
    const token = await getToken({
      req,
      secret: env.nextAuthSecret,
      secureCookie: env.isProduction,
    });

    if (env.keycloakIssuer) {
      const keycloakLogoutUrl = new URL(
        `${env.keycloakIssuer}/protocol/openid-connect/logout`
      );
      keycloakLogoutUrl.searchParams.set('post_logout_redirect_uri', postLogoutRedirect);

      if (token?.idToken) {
        keycloakLogoutUrl.searchParams.set('id_token_hint', String(token.idToken));
      } else if (env.keycloakClientId) {
        keycloakLogoutUrl.searchParams.set('client_id', env.keycloakClientId);
      }

      redirectTarget = keycloakLogoutUrl.toString();
    }
  } catch (error) {
    logger.warn('No se pudo construir la URL de cierre federado en Keycloak', {
      error: String(error),
    });
  }

  const response = NextResponse.redirect(redirectTarget);

  // Limpiar cookies de sesión de NextAuth (desarrollo y producción)
  const cookiesToClear = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.session-token',
    'next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
  ];

  for (const name of cookiesToClear) {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
      secure: env.isProduction,
    });
  }

  return response;
}
