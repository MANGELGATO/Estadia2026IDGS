import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfigFromDB, saveSystemConfigInDB } from '../../../lib/db';
import { requireSession } from '../../../lib/authGuard';
import { logger } from '../../../lib/logger';
import { systemConfigSchema } from '../../../lib/validations/schemas';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isPublicScope = searchParams.get('scope') === 'public';

  if (isPublicScope) {
    try {
      const config = await getSystemConfigFromDB();
      return NextResponse.json({
        success: true,
        data: {
          maxReservationHours: config.maxReservationHours,
          maxAdvanceDays: config.maxAdvanceDays,
          allowPublicView: config.allowPublicView,
        },
      });
    } catch (error) {
      logger.error(
        'Error al consultar parámetros públicos de configuración',
        { path: '/api/configuracion?scope=public' },
        error
      );
      return NextResponse.json(
        { success: false, message: 'Error al consultar configuración pública' },
        { status: 500 }
      );
    }
  }

  const auth = await requireSession(['admin']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const config = await getSystemConfigFromDB();
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error(
      'Error al consultar configuración del sistema',
      { path: '/api/configuracion' },
      error
    );
    return NextResponse.json(
      { success: false, message: 'Error al consultar configuración' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(['admin']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = systemConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Parámetros de configuración inválidos.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const current = await getSystemConfigFromDB();
    const updated = await saveSystemConfigInDB({
      ...current,
      ...parsed.data,
    });
    logger.info('Configuración del sistema actualizada', {
      adminEmail: updated.adminEmail,
      actor: auth.user.email,
    });
    return NextResponse.json({
      success: true,
      message: 'Configuración institucional guardada exitosamente',
      data: updated,
    });
  } catch (error) {
    logger.error(
      'Error al guardar configuración del sistema',
      { path: '/api/configuracion' },
      error
    );
    return NextResponse.json(
      { success: false, message: 'Error al guardar configuración' },
      { status: 500 }
    );
  }
}
