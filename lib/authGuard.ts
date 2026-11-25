import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { getAuthOptions } from './auth';
import { env } from './env';
import { isUsuarioActiveInDB } from './db';
import { logger } from './logger';
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
 * Valida sesión activa, estado operativo en el directorio y permisos RBAC en Route Handlers.
 * Nunca confía en datos enviados por el cliente ni cookies no firmadas.
 */
export async function requireSession(allowedRoles?: UserRole[]): Promise<AuthGuardResult> {
  const session = await getServerSession(getAuthOptions());

  if (!session?.user?.email) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Autenticación requerida. Inicia sesión para continuar.' },
        { status: 401 }
      ),
    };
  }

  // Verificar que la cuenta no haya sido marcada como Inactiva por un administrador
  if (env.hasDirectusConfig) {
    try {
      const isActive = await isUsuarioActiveInDB(session.user.email, session.user.id);
      if (!isActive) {
        return {
          user: null,
          errorResponse: NextResponse.json(
            {
              success: false,
              message: 'Tu cuenta se encuentra desactivada en el laboratorio PLAi.',
            },
            { status: 403 }
          ),
        };
      }
    } catch (error) {
      logger.warn('No se pudo verificar estado activo del usuario en Directus', {
        error: String(error),
      });
    }
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
