import { NextRequest, NextResponse } from 'next/server';
import { getAplicacionesFromDB, insertAplicacionInDB, deleteAplicacionInDB } from '../../../lib/db';
import { AppItem } from '../../../lib/mockData';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apps = await getAplicacionesFromDB();
    return NextResponse.json({
      success: true,
      data: apps,
      total: apps.length,
    });
  } catch (error) {
    logger.error('Error al obtener aplicaciones', { path: '/api/aplicaciones' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar aplicaciones' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AppItem;

    if (!body.name || !body.category || !body.platform) {
      return NextResponse.json(
        { success: false, message: 'Faltan campos obligatorios: nombre, categoría o plataforma' },
        { status: 400 }
      );
    }

    const appToSave: AppItem = {
      id: body.id || `app-${Date.now()}`,
      name: body.name.trim(),
      developer: body.developer?.trim() || 'Desarrollador Oficial',
      version: body.version?.trim() || '1.0',
      category: body.category,
      platform: body.platform,
      ageRating: body.ageRating || 'Todas las edades',
      description: body.description?.trim() || 'Sin descripción',
      imageUrl: body.imageUrl?.trim() || '/images/apps/default.jpg',
      devicesInstalled: Number(body.devicesInstalled || 1),
      status: body.status || 'Activa',
    };

    await insertAplicacionInDB(appToSave);
    logger.info('Aplicación guardada exitosamente', { id: appToSave.id, name: appToSave.name });

    return NextResponse.json({
      success: true,
      message: 'Aplicación registrada correctamente en la base de datos',
      data: appToSave,
    }, { status: 201 });
  } catch (error) {
    logger.error('Error al guardar aplicación', { path: '/api/aplicaciones' }, error);
    return NextResponse.json(
      { success: false, message: 'Error al persistir aplicación' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Parámetro id es obligatorio' },
        { status: 400 }
      );
    }

    await deleteAplicacionInDB(id);
    return NextResponse.json({
      success: true,
      message: 'Aplicación eliminada de la base de datos',
    });
  } catch (error) {
    logger.error('Error al eliminar aplicación', { path: '/api/aplicaciones' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al eliminar aplicación' },
      { status: 500 }
    );
  }
}
