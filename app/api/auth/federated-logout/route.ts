import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { env } from '../../../../lib/env';
import { logger } from '../../../../lib/logger';

export const dynamic = 'force-dynamic';

const BASE_NEXTAUTH_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  '__Host-next-auth.session-token',
  'next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  'next-auth.pkce.code_verifier',
  '__Secure-next-auth.pkce.code_verifier',
  'next-auth.state',
  '__Secure-next-auth.state',
];

function isNextAuthCookie(name: string): boolean {
  return (
    name.startsWith('next-auth.') ||
    name.startsWith('__Secure-next-auth.') ||
    name.startsWith('__Host-next-auth.')
  );
}

/**
 * Cierre de sesión federado (Single Sign-Out / SLO) contra Keycloak.
 * 1. Obtiene el `idToken` desde el JWT de servidor (nunca expuesto al navegador).
 * 2. Expira TODAS las cookies de sesión locales de NextAuth, incluyendo fragmentos
 *    chunked (`.0`, `.1`, `.2`, ...) que existan en la petición.
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

  // Recolectar nombres base + todas las cookies reales de NextAuth presentes (incluyendo .0, .1, ...)
  const cookiesToClear = new Set<string>(BASE_NEXTAUTH_COOKIES);
  for (const cookie of req.cookies.getAll()) {
    if (isNextAuthCookie(cookie.name)) {
      cookiesToClear.add(cookie.name);
    }
  }

  for (const name of cookiesToClear) {
    const mustBeSecure =
      env.isProduction || name.startsWith('__Secure-') || name.startsWith('__Host-');
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
      secure: mustBeSecure,
    });
  }

  return response;
}
