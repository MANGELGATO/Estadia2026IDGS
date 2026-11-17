import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfigFromDB, saveSystemConfigInDB } from '../../../lib/db';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getSystemConfigFromDB();
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error('Error al consultar configuración del sistema', { path: '/api/configuracion' }, error);
    return NextResponse.json(
      { success: false, message: 'Error al consultar configuración' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = getSystemConfigFromDB();
    const updated = saveSystemConfigInDB({
      ...current,
      ...body,
    });
    logger.info('Configuración del sistema actualizada', { adminEmail: updated.adminEmail });
    return NextResponse.json({
      success: true,
      message: 'Configuración institucional guardada exitosamente',
      data: updated,
    });
  } catch (error) {
    logger.error('Error al guardar configuración del sistema', { path: '/api/configuracion' }, error);
    return NextResponse.json(
      { success: false, message: 'Error al guardar configuración' },
      { status: 500 }
    );
  }
}
