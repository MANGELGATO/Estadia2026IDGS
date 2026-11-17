import { NextRequest, NextResponse } from 'next/server';
import { getUsuariosFromDB, upsertUsuarioInDB, UsuarioItem } from '../../../lib/db';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
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
  try {
    const body = await req.json();
    const { id, name, email, password, role, status, dependencia, telefono } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Nombre y correo electrónico son obligatorios' },
        { status: 400 }
      );
    }

    const user: UsuarioItem = {
      id: id ? String(id) : `usr-${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: password ? String(password) : undefined,
      role: role || 'Usuario Final',
      status: status || 'Activo',
      dependencia: dependencia ? String(dependencia).trim() : 'Comunidad PLAi',
      telefono: telefono ? String(telefono).trim() : undefined,
      lastLogin: new Date().toISOString().split('T')[0],
      reservations: 0,
    };

    await upsertUsuarioInDB(user);
    const updatedList = await getUsuariosFromDB();
    const saved = updatedList.find(u => u.email.toLowerCase() === user.email.toLowerCase()) || user;

    logger.info('Usuario institucional guardado', { id: saved.id, email: saved.email, role: saved.role });

    return NextResponse.json({
      success: true,
      message: 'Usuario guardado exitosamente',
      data: saved,
    }, { status: 201 });
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
