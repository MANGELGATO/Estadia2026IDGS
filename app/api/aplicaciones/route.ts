import { NextRequest, NextResponse } from 'next/server';
import {
  getAplicacionesFromDB,
  insertAplicacionInDB,
  deleteAplicacionInDB,
} from '../../../lib/db';
import { AppItem } from '../../../lib/mockData';
import { requireSession } from '../../../lib/authGuard';
import { logger } from '../../../lib/logger';
import { generateEntityId } from '../../../lib/folio';
import { aplicacionSchema } from '../../../lib/validations/schemas';

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
  const auth = await requireSession(['admin']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = aplicacionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de aplicación inválidos.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const resolvedImg = d.imageUrl || d.iconUrl || '/images/apps/beat-saber.png';
    const appToSave: AppItem = {
      id: d.id || generateEntityId('app'),
      name: d.name,
      developer: d.developer,
      version: d.version,
      category: d.category,
      platform: d.platform,
      ageRating: d.ageRating,
      description: d.description,
      imageUrl: resolvedImg,
      iconUrl: resolvedImg,
      devicesInstalled: d.devicesInstalled,
      status: d.status,
    };

    await insertAplicacionInDB(appToSave);
    logger.info('Aplicación guardada exitosamente', {
      id: appToSave.id,
      name: appToSave.name,
      actor: auth.user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Aplicación registrada correctamente en Directus',
        data: appToSave,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error al guardar aplicación', { path: '/api/aplicaciones' }, error);
    return NextResponse.json(
      { success: false, message: 'Error al persistir aplicación' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSession(['admin']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id')?.trim();

    if (!id || id.length > 64) {
      return NextResponse.json(
        { success: false, message: 'Parámetro id es obligatorio y válido' },
        { status: 400 }
      );
    }

    await deleteAplicacionInDB(id);
    logger.info('Aplicación eliminada', { id, actor: auth.user.email });

    return NextResponse.json({
      success: true,
      message: 'Aplicación eliminada de Directus',
    });
  } catch (error) {
    logger.error('Error al eliminar aplicación', { path: '/api/aplicaciones' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al eliminar aplicación' },
      { status: 500 }
    );
  }
}
