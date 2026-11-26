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

function getOriginSafe(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

function isHtmlNavigation(request: NextRequest): boolean {
  const accept = request.headers.get('accept') || '';
  const secFetchMode = request.headers.get('sec-fetch-mode') || '';
  return secFetchMode === 'navigate' || accept.includes('text/html');
}

/**
 * Construye una Content-Security-Policy estricta por petición en tiempo de ejecución:
 * - Elimina `'unsafe-inline'` de `script-src` usando un nonce criptográfico + `'strict-dynamic'`.
 * - Resuelve `KEYCLOAK_ISSUER` en runtime para `connect-src` y `form-action`.
 * - Declara `frame-src` exclusivamente para embeds oficiales de YouTube (sin comodines).
 * - Mantiene `img-src 'self' data: blob:` alineado con rutas locales / `/api/media/*` en Zod.
 */
export function buildCspHeader(nonce: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const keycloakOrigin = getOriginSafe(env.keycloakIssuer);

  const scriptSrc = isProd
    ? `'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`;

  const connectSrc = [
    "'self'",
    ...(keycloakOrigin ? [keycloakOrigin] : []),
    ...(!isProd ? ['http://localhost:*', 'ws://localhost:*'] : []),
  ].join(' ');

  const formActionSrc = [
    "'self'",
    ...(keycloakOrigin ? [keycloakOrigin] : []),
  ].join(' ');

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    `connect-src ${connectSrc}`,
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    `form-action ${formActionSrc}`,
    ...(isProd ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}

/**
 * Proxy de seguridad de Next.js 16 (reemplazo normativo de middleware.ts).
 * - Genera CSP estricta con nonce único por petición y origen de Keycloak en runtime.
 * - Protege las rutas privadas `/admin/*` y `/usuario/*` verificando el JWT firmado por NextAuth.js.
 * - Aplica Rate Limiting (dimensionado para salones compartiendo NAT) y protección CSRF.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // 1. Rate Limiting en inicio de sesión: cuenta SOLO `POST /api/auth/signin*` (NO `/callback`).
  //    La fuerza bruta de contraseñas la controla Keycloak; este límite protege la ruta NextAuth.
  const isAuthSignInPost =
    request.method === 'POST' && pathname.startsWith('/api/auth/signin');

  if (isAuthSignInPost) {
    const rate = checkRateLimit(`auth:${ip}`, RATE_LIMIT_LOGIN);
    if (!rate.success) {
      logger.warn('Rate limit excedido en endpoint de autenticación', {
        path: pathname,
        ip,
        limit: rate.limit,
      });
      if (isHtmlNavigation(request)) {
        return NextResponse.redirect(new URL('/login?error=TooManyRequests', request.url));
      }
      return createRateLimitResponse(rate);
    }
  }

  if (
    request.method === 'POST' &&
    (pathname === '/api/reservas' ||
      pathname === '/api/solicitudes-espacios' ||
      pathname === '/api/cursos')
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

  // Las rutas de API no requieren RBAC de páginas ni nonce HTML
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Evitar bucle de redirección cuando el usuario ya viene redirigido a /login?error=TooManyRequests
  const isRateLimitErrorView =
    pathname === '/login' && request.nextUrl.searchParams.get('error') === 'TooManyRequests';

  if (pathname === '/login' && !isRateLimitErrorView && process.env.NODE_ENV === 'production') {
    const rate = checkRateLimit(`login_page:${ip}`, RATE_LIMIT_LOGIN_PAGE);
    if (!rate.success) {
      logger.warn('Rate limit excedido en vista de inicio de sesión', {
        path: pathname,
        ip,
        limit: rate.limit,
      });
      return NextResponse.redirect(new URL('/login?error=TooManyRequests', request.url));
    }
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminOnlyRoute =
    pathname.startsWith('/admin/usuarios') || pathname.startsWith('/admin/configuracion');
  const isUsuarioRoute = pathname.startsWith('/usuario');
  const isLoginRoute = pathname === '/login';

  if (isAdminRoute || isUsuarioRoute || isLoginRoute) {
    const token = await getToken({ req: request, secret: env.nextAuthSecret });

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
  }

  // 5. CSP dinámica con nonce único por petición (Next.js 16 inyecta automáticamente el nonce en SSR)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = buildCspHeader(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
    '/api/auth/:path*',
    '/api/reservas',
    '/api/solicitudes-espacios',
    '/api/cursos',
  ],
};
