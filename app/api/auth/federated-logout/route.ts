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
 * Seguridad:
 * - Solo acepta método POST (rechaza GET con 405 para impedir Logout CSRF vía <img> o enlaces).
 * - Valida cabecera Origin contra Host para mitigar CSRF entre sitios.
 * - Expira TODAS las cookies locales de NextAuth (incluyendo chunks .0, .1, ...).
 * - Devuelve `{ success: true, logoutUrl }` para que el cliente navegue al end_session_endpoint.
 */
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        logger.warn('Intento de logout con origen cruzado rechazado (Logout CSRF)', {
          origin,
          host,
        });
        return NextResponse.json(
          { success: false, message: 'Origen de petición no autorizado.' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, message: 'Cabecera Origin malformada.' },
        { status: 400 }
      );
    }
  }

  const postLogoutRedirect = new URL('/login', env.siteUrl).toString();
  let logoutUrl = postLogoutRedirect;

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

      logoutUrl = keycloakLogoutUrl.toString();
    }
  } catch (error) {
    logger.warn('No se pudo construir la URL de cierre federado en Keycloak', {
      error: String(error),
    });
  }

  const response = NextResponse.json({ success: true, logoutUrl });

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
