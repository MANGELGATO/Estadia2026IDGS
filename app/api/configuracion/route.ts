import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfigFromDB, saveSystemConfigInDB } from '../../../lib/db';
import { logger } from '../../../lib/logger';
import { requireSession } from '../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getSystemConfigFromDB();
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
  const auth = await requireSession(req, 'admin');
  if (!auth.ok) return auth.response;
  try {
    const body = await req.json();
    const current = await getSystemConfigFromDB();
    const updated = await saveSystemConfigInDB({
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
