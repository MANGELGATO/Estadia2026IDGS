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
import { logger } from './lib/logger';
import { env } from './lib/env';

/**
 * Proxy de seguridad de Next.js 16 (reemplazo normativo de middleware.ts).
 * Protege las rutas privadas `/admin/*` y `/usuario/*`, verifica los roles
 * institucionales y redirige usuarios no autenticados hacia `/login`.
 * Aplica además Rate Limiting normativo en endpoints sensibles (Sección 7.3).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // 1. Rate Limiting en endpoints sensibles (Sección 7.3 Estándar PLAi)
  // A) Endpoints de Autenticación (/api/auth/signin, callback o POST)
  // Previene ataques de fuerza bruta en credenciales sin bloquear el sondeo de sesión legítimo (GET /api/auth/session)
  const isAuthAttempt =
    pathname.startsWith('/api/auth') &&
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

  // B) Formularios públicos de reservación y solicitudes (POST)
  if (
    request.method === 'POST' &&
    (pathname === '/api/reservas' || pathname === '/api/solicitudes-espacios' || pathname === '/api/cursos')
  ) {
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

  // C) Vista de inicio de sesión (/login) - En producción
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
  const isUsuarioRoute = pathname.startsWith('/usuario');
  const isLoginRoute = pathname === '/login';
  const isLogout = isLoginRoute && request.nextUrl.searchParams.get('logout') === 'true';

  // 2. Acceso a rutas protegidas sin sesión activa
  if (!token && (isAdminRoute || isUsuarioRoute)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Control de acceso basado en roles (RBAC):
  // Un usuario estándar no debe tener acceso a las herramientas administrativas
  if (token && isAdminRoute && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/usuario', request.url));
  }

  // 4. Manejo de /login:
  // Si el usuario solicitó cerrar sesión o no tiene sesión real, se limpia la cookie y se muestra /login
  if (isLoginRoute) {
    if (isLogout || !token) {
      const response = NextResponse.next();
      return response;
    }

    const destination = token.role === 'admin' ? '/admin' : '/usuario';
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
    '/api/cursos',
  ],
};
