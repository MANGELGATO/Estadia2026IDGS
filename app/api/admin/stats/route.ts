import { NextResponse } from 'next/server';
import { getDashboardStats } from '../../../../lib/db';
import { logger } from '../../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error al obtener estadísticas del dashboard', { path: '/api/admin/stats' }, error);
    return NextResponse.json(
      { success: false, message: 'Error al consultar métricas del sistema' },
      { status: 500 }
    );
  }
}
