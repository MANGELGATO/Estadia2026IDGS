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
  // A) Endpoints de Autenticación (/api/auth/*)
  if (pathname.startsWith('/api/auth')) {
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
    (pathname === '/api/reservas' || pathname === '/api/solicitudes-espacios' || pathname === '/api/cotizaciones')
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

  // C) Vista de inicio de sesión (/login)
  if (pathname === '/login') {
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

  const secret = process.env.NEXTAUTH_SECRET || 'plai-dev-secret-key-32chars-min-2026';
  const token = await getToken({ req: request, secret });

  const isAdminRoute = pathname.startsWith('/admin');
  const isUsuarioRoute = pathname.startsWith('/usuario');
  const isLoginRoute = pathname === '/login';

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

  // 4. Usuario ya autenticado intentando acceder a /login
  if (token && isLoginRoute) {
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
    '/api/cotizaciones',
  ],
};
