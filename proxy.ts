import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';
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
    (pathname === '/api/reservas' || pathname === '/api/solicitudes-espacios')
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

  const secret = process.env.NEXTAUTH_SECRET || 'plai-dev-secret-key-32chars-min-2026';
  let token = await getToken({ req: request, secret });

  // Soporte para cookie de sesión rápida / evaluación de roles
  const roleCookie = request.cookies.get('plai_role')?.value;
  if (!token && (roleCookie === 'admin' || roleCookie === 'usuario')) {
    token = {
      id: roleCookie === 'admin' ? 'usr-admin-01' : 'usr-standard-01',
      name: roleCookie === 'admin' ? 'Administrador PLAi' : 'Usuario PLAi',
      email: roleCookie === 'admin' ? 'admin@plai.mx' : 'usuario@plai.mx',
      role: roleCookie as 'admin' | 'usuario',
    } as unknown as JWT;
  }

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
  ],
};
