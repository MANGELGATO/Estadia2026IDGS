import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';
import { env } from './env';

export type ApiRole = 'admin' | 'usuario';

export type ApiAuthResult =
  | { ok: true; token: JWT }
  | { ok: false; response: NextResponse };

/**
 * Verifica la sesión (JWT de NextAuth) en un Route Handler.
 * - Sin sesión válida: 401.
 * - Con sesión pero rol insuficiente: 403.
 * Estándar PLAi sec. 7 (autenticación / control de acceso en servidor).
 */
export async function requireSession(
  req: NextRequest,
  role?: ApiRole
): Promise<ApiAuthResult> {
  const token = await getToken({ req, secret: env.nextAuthSecret });

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Autenticación requerida' },
        { status: 401 }
      ),
    };
  }

  if (role === 'admin' && token.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'No tienes permisos para esta operación' },
        { status: 403 }
      ),
    };
  }

  return { ok: true, token };
}
