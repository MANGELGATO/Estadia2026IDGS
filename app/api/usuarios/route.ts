import { NextRequest, NextResponse } from 'next/server';
import { getUsuariosFromDB, upsertUsuarioInDB, UsuarioItem } from '../../../lib/db';
import { requireSession } from '../../../lib/authGuard';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireSession(['admin']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const usuarios = await getUsuariosFromDB();
    return NextResponse.json({
      success: true,
      data: usuarios,
      total: usuarios.length,
    });
  } catch (error) {
    logger.error('Error al consultar usuarios', { path: '/api/usuarios' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar usuarios' },
      { status: 500 }
    );
  }
}

/**
 * Crea o actualiza un perfil operativo en el directorio `<prefix>usuarios`.
 * Nota de seguridad: las contraseñas y los roles efectivos (RBAC) son administrados
 * exclusivamente por Keycloak; aquí solo se gestionan metadatos operativos
 * (dependencia, teléfono) y el estado local `Activo`/`Inactivo` dentro del laboratorio.
 */
export async function POST(req: NextRequest) {
  const auth = await requireSession(['admin']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { id, name, email, status, dependencia, telefono } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Nombre y correo electrónico son obligatorios' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingList = await getUsuariosFromDB();
    const existing = existingList.find(
      (u) => (id && u.id === String(id)) || u.email.toLowerCase() === normalizedEmail
    );

    // El rol efectivo proviene de Keycloak; conservar el último rol sincronizado (o 'Usuario Final' si es pre-registro)
    const preservedRole: UsuarioItem['role'] = existing?.role || 'Usuario Final';

    // Evitar que un administrador se desactive a sí mismo o a otro administrador desde esta pantalla
    if (status === 'Inactivo' && preservedRole === 'Administrador') {
      return NextResponse.json(
        {
          success: false,
          message:
            'No es posible desactivar una cuenta con rol Administrador desde el portal; revoca el rol en Keycloak.',
        },
        { status: 400 }
      );
    }

    const user: UsuarioItem = {
      id: existing?.id || (id ? String(id) : `usr-${Date.now()}`),
      name: String(name).trim(),
      email: normalizedEmail,
      role: preservedRole,
      status: status === 'Inactivo' ? 'Inactivo' : 'Activo',
      dependencia: dependencia ? String(dependencia).trim() : 'Comunidad PLAi',
      telefono: telefono ? String(telefono).trim() : undefined,
      lastLogin: existing?.lastLogin || 'Pendiente de primer acceso SSO',
      reservations: existing?.reservations || 0,
    };

    const saved = await upsertUsuarioInDB(user);

    logger.info('Perfil operativo de usuario actualizado', {
      id: saved.id,
      email: saved.email,
      accountStatus: saved.status,
      actor: auth.user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Perfil operativo guardado correctamente',
        data: saved,
      },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    logger.error('Error al guardar usuario', { path: '/api/usuarios' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al guardar usuario' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
