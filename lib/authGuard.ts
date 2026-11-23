import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';
import type { UserRole } from '../types/next-auth';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type AuthGuardResult =
  | { user: AuthenticatedUser; errorResponse: null }
  | { user: null; errorResponse: NextResponse };

/**
 * Valida sesión activa y permisos RBAC en Route Handlers (backend/API).
 * Nunca confía en datos enviados por el cliente ni cookies no firmadas.
 */
export async function requireSession(allowedRoles?: UserRole[]): Promise<AuthGuardResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Autenticación requerida. Inicia sesión para continuar.' },
        { status: 401 }
      ),
    };
  }

  const role: UserRole = session.user.role || 'usuario';

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'No cuentas con permisos suficientes para esta operación.' },
        { status: 403 }
      ),
    };
  }

  return {
    user: {
      id: session.user.id || '',
      name: session.user.name || 'Usuario PLAi',
      email: session.user.email,
      role,
    },
    errorResponse: null,
  };
}

export function isStaffRole(role?: UserRole): boolean {
  return role === 'admin' || role === 'colaborador';
}
