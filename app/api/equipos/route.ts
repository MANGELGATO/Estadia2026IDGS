import { NextRequest, NextResponse } from 'next/server';
import { getEquiposFromDB, insertEquipoInDB, deleteEquipoInDB } from '../../../lib/db';
import { DeviceItem } from '../../../lib/mockData';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const equipos = await getEquiposFromDB();
    return NextResponse.json({
      success: true,
      data: equipos,
      total: equipos.length,
    });
  } catch (error) {
    logger.error('Error al obtener equipos de la base de datos', { path: '/api/equipos' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar equipos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const item = (await req.json()) as DeviceItem;

    if (!item.name || !item.inventoryNumber || !item.category) {
      return NextResponse.json(
        { success: false, message: 'Faltan campos obligatorios (nombre, código PLAi, categoría)' },
        { status: 400 }
      );
    }

    const saved = await insertEquipoInDB(item);
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'No se pudo guardar el equipo en la base de datos' },
        { status: 500 }
      );
    }

    logger.info('Equipo registrado o actualizado en base de datos MySQL', {
      id: item.id,
      codigo_plai: item.inventoryNumber,
      nombre: item.name
    });

    return NextResponse.json({
      success: true,
      message: 'Equipo guardado correctamente en MySQL',
      data: item,
    }, { status: 201 });
  } catch (error) {
    logger.error('Error al guardar equipo en base de datos', { path: '/api/equipos' }, error);
    return NextResponse.json(
      { success: false, message: 'Error al persistir equipo en MySQL' },
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

    const deleted = await deleteEquipoInDB(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'No se encontró el equipo o no se pudo eliminar' },
        { status: 404 }
      );
    }

    logger.info('Equipo eliminado de la base de datos MySQL', { id });

    return NextResponse.json({
      success: true,
      message: 'Equipo eliminado de la base de datos MySQL',
      data: { id },
    });
  } catch (error) {
    logger.error('Error al eliminar equipo de MySQL', { path: '/api/equipos' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al eliminar equipo' },
      { status: 500 }
    );
  }
}
