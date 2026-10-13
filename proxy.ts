import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Proxy de seguridad de Next.js 16 (reemplazo normativo de middleware.ts).
 * Protege las rutas privadas `/admin/*` y `/usuario/*`, verifica los roles
 * institucionales y redirige usuarios no autenticados hacia `/login`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const secret = process.env.NEXTAUTH_SECRET || 'plai-dev-secret-key-32chars-min-2026';
  const token = await getToken({ req: request, secret });

  const isAdminRoute = pathname.startsWith('/admin');
  const isUsuarioRoute = pathname.startsWith('/usuario');
  const isLoginRoute = pathname === '/login';

  // 1. Acceso a rutas protegidas sin sesión activa
  if (!token && (isAdminRoute || isUsuarioRoute)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Control de acceso basado en roles (RBAC):
  // Un usuario estándar no debe tener acceso a las herramientas administrativas
  if (token && isAdminRoute && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/usuario', request.url));
  }

  // 3. Usuario ya autenticado intentando acceder a /login
  if (token && isLoginRoute) {
    const destination = token.role === 'admin' ? '/admin' : '/usuario';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/usuario/:path*', '/login'],
};
