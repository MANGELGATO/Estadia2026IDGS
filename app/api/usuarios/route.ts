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

export async function POST(req: NextRequest) {
  const auth = await requireSession(['admin']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { id, name, email, password, role, status, dependencia, telefono } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Nombre y correo electrónico son obligatorios' },
        { status: 400 }
      );
    }

    const isNew = !id;
    if (isNew && (!password || String(password).trim().length < 8)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Para crear un usuario nuevo se requiere una contraseña de al menos 8 caracteres.',
        },
        { status: 400 }
      );
    }

    const user: UsuarioItem & { password?: string } = {
      id: id ? String(id) : `usr-${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: password ? String(password).trim() : undefined,
      role: role || 'Usuario Final',
      status: status || 'Activo',
      dependencia: dependencia ? String(dependencia).trim() : 'Comunidad PLAi',
      telefono: telefono ? String(telefono).trim() : undefined,
      lastLogin: new Date().toISOString().split('T')[0],
      reservations: 0,
    };

    const saved = await upsertUsuarioInDB(user);

    logger.info('Usuario institucional guardado', {
      id: saved.id,
      email: saved.email,
      role: saved.role,
      actor: auth.user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario guardado exitosamente',
        data: saved,
      },
      { status: 201 }
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
