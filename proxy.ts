import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
  RATE_LIMIT_LOGIN,
  RATE_LIMIT_LOGIN_PAGE,
  RATE_LIMIT_MUTATION,
} from './lib/rateLimit';
import { env } from './lib/env';
import { logger } from './lib/logger';

/**
 * Proxy de seguridad de Next.js 16 (reemplazo normativo de middleware.ts).
 * Protege las rutas privadas `/admin/*` y `/usuario/*` verificando exclusivamente
 * el JWT firmado por NextAuth.js y aplica Rate Limiting en endpoints sensibles (Sección 7.3).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // 1. Rate Limiting en endpoints sensibles (Estándar PLAi v1.0, Sección 7.3)
  const isAuthAttempt =
    pathname.startsWith('/api/auth') &&
    pathname !== '/api/auth/federated-logout' &&
    (pathname.includes('/signin') || pathname.includes('/callback') || request.method === 'POST');

  if (isAuthAttempt) {
    const rate = checkRateLimit(`auth:${ip}`, RATE_LIMIT_LOGIN);
    if (!rate.success) {
      logger.warn('Rate limit excedido en endpoint de autenticación', {
        path: pathname,
        ip,
        limit: rate.limit,
      });
      return createRateLimitResponse(rate);
    }
  }

  if (
    request.method === 'POST' &&
    (pathname === '/api/reservas' || pathname === '/api/solicitudes-espacios')
  ) {
    // 1.1 Protección CSRF: validación de origen contra el host de la petición
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          logger.warn('Intento de mutación con origen cruzado no autorizado (posible CSRF)', {
            path: pathname,
            origin,
            host,
          });
          return NextResponse.json(
            { success: false, message: 'Origen de petición no autorizado (protección CSRF activa).' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, message: 'Cabecera de origen malformada.' },
          { status: 400 }
        );
      }
    }

    const rate = checkRateLimit(`mutations:${ip}`, RATE_LIMIT_MUTATION);
    if (!rate.success) {
      logger.warn('Rate limit excedido en formulario público', {
        path: pathname,
        ip,
        limit: rate.limit,
      });
      return createRateLimitResponse(rate);
    }
  }

  if (pathname === '/login' && process.env.NODE_ENV === 'production') {
    const rate = checkRateLimit(`login_page:${ip}`, RATE_LIMIT_LOGIN_PAGE);
    if (!rate.success) {
      logger.warn('Rate limit excedido en vista de inicio de sesión', {
        path: pathname,
        ip,
        limit: rate.limit,
      });
      return createRateLimitResponse(rate);
    }
  }

  const token = await getToken({ req: request, secret: env.nextAuthSecret });

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminOnlyRoute =
    pathname.startsWith('/admin/usuarios') || pathname.startsWith('/admin/configuracion');
  const isUsuarioRoute = pathname.startsWith('/usuario');
  const isLoginRoute = pathname === '/login';

  // 2. Acceso a rutas protegidas sin sesión válida
  if (!token && (isAdminRoute || isUsuarioRoute)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Control de acceso basado en roles (RBAC)
  if (token && isAdminRoute) {
    const role = token.role;
    if (role !== 'admin' && role !== 'colaborador') {
      return NextResponse.redirect(new URL('/usuario', request.url));
    }
    if (isAdminOnlyRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 4. Redirección automática si el usuario ya está autenticado y visita /login
  if (isLoginRoute && token) {
    const destination =
      token.role === 'admin' || token.role === 'colaborador' ? '/admin' : '/usuario';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/usuario/:path*',
    '/login',
    '/api/auth/:path*',
    '/api/reservas',
    '/api/solicitudes-espacios',
  ],
};
