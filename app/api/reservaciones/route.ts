import { NextRequest, NextResponse } from 'next/server';
import { 
  getReservacionesFromDB, 
  updateReservacionInDB, 
  getEquiposFromDB,
  ReservacionItem 
} from '../../../lib/db';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reservaciones = await getReservacionesFromDB();
    return NextResponse.json({
      success: true,
      data: reservaciones,
      total: reservaciones.length,
    });
  } catch (error) {
    logger.error('Error al obtener reservaciones', { path: '/api/reservaciones' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar reservaciones' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, estado, equipoId, codigoPlaiAsignado, accesoriosIncluidos, condicionSalida, observacionesAdmin, aprobadoPor } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'El ID de la reservación es obligatorio' },
        { status: 400 }
      );
    }

    // Si se asignó un equipo o se aprueba automáticamente
    let resolvedEquipoId = equipoId;
    let resolvedCodigo = codigoPlaiAsignado;

    // Si se aprueba sin especificar equipo, auto-asignar el primer equipo disponible de la categoría
    if (estado === 'Aprobada' && !resolvedCodigo) {
      const allReservas = await getReservacionesFromDB();
      const reserva = allReservas.find(r => r.id === id);
      if (reserva) {
        const allEquipos = await getEquiposFromDB();
        const catNorm = (reserva.categoriaId || '').toLowerCase().replace(/-/g, ' ');
        const disponible = allEquipos.find(e => 
          e.status === 'Disponible' && 
          (e.category.toLowerCase().includes(catNorm) || (catNorm !== '' && catNorm.includes(e.category.toLowerCase())))
        );
        if (disponible) {
          resolvedEquipoId = disponible.id;
          resolvedCodigo = disponible.inventoryNumber;
        }
      }
    }

    await updateReservacionInDB(id, {
      estado,
      equipoId: resolvedEquipoId,
      codigoPlaiAsignado: resolvedCodigo,
      accesoriosIncluidos,
      condicionSalida: condicionSalida || 'Excelente',
      observacionesAdmin,
      aprobadoPor: aprobadoPor || 'Administrador PLAi',
    });

    logger.info('Reservación actualizada', { id, estado, codigoAsignado: resolvedCodigo });

    return NextResponse.json({
      success: true,
      message: `Reservación actualizada exitosamente a ${estado}`,
      data: { id, estado, codigoPlaiAsignado: resolvedCodigo },
    });
  } catch (error) {
    logger.error('Error al actualizar reservación', { path: '/api/reservaciones' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al actualizar la reservación' },
      { status: 500 }
    );
  }
}
