import { NextRequest, NextResponse } from 'next/server';
import { 
  getReservacionesFromDB, 
  updateReservacionInDB, 
  getEquiposFromDB,
  insertBitacoraEntregaInDB,
  ReservacionItem,
  BitacoraItem
} from '../../../lib/db';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

function normalizeStr(s?: string): string {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/-/g, ' ').trim();
}

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
    const {
      id,
      estado,
      equipoId,
      codigoPlaiAsignado,
      accesoriosIncluidos,
      condicionSalida,
      observacionesAdmin,
      aprobadoPor,
      usuarioNombre,
      fechaUso,
      horaInicio,
      horaFin,
      actividad,
      registrarEntregaEnBitacora,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'El ID de la reservación es obligatorio' },
        { status: 400 }
      );
    }

    const allReservas = await getReservacionesFromDB();
    const reserva = allReservas.find(r => r.id === id);
    const allEquipos = await getEquiposFromDB();

    let resolvedEquipoId = equipoId || reserva?.equipoId;
    let resolvedCodigo = codigoPlaiAsignado || reserva?.codigoPlaiAsignado;

    // Si se aprueba sin especificar equipo, auto-asignar el equipo solicitado o el primero disponible de la categoría
    if (estado === 'Aprobada' && !resolvedCodigo && reserva) {
      const catNorm = normalizeStr(reserva.categoriaId);
      const disponible =
        allEquipos.find(e => e.id === reserva.equipoId && e.status === 'Disponible') ||
        allEquipos.find(e => {
          const eqCatNorm = normalizeStr(e.category);
          return e.status === 'Disponible' && (eqCatNorm.includes(catNorm) || (catNorm !== '' && catNorm.includes(eqCatNorm)));
        });
      if (disponible) {
        resolvedEquipoId = disponible.id;
        resolvedCodigo = disponible.inventoryNumber;
      }
    }

    // Si se especificó código pero no ID, o viceversa, sincronizar ambos
    if (resolvedCodigo && !resolvedEquipoId) {
      const eq = allEquipos.find(e => e.inventoryNumber.toLowerCase() === resolvedCodigo.toLowerCase());
      if (eq) resolvedEquipoId = eq.id;
    } else if (resolvedEquipoId && !resolvedCodigo) {
      const eq = allEquipos.find(e => e.id === resolvedEquipoId);
      if (eq) resolvedCodigo = eq.inventoryNumber;
    }

    const updatePayload: Partial<ReservacionItem> = {
      ...(estado ? { estado } : {}),
      ...(resolvedEquipoId ? { equipoId: resolvedEquipoId } : {}),
      ...(resolvedCodigo ? { codigoPlaiAsignado: resolvedCodigo } : {}),
      ...(accesoriosIncluidos !== undefined ? { accesoriosIncluidos } : {}),
      ...(condicionSalida ? { condicionSalida } : {}),
      ...(observacionesAdmin !== undefined ? { observacionesAdmin } : {}),
      ...(aprobadoPor ? { aprobadoPor } : {}),
      ...(usuarioNombre ? { usuarioNombre } : {}),
      ...(fechaUso ? { fechaUso } : {}),
      ...(horaInicio ? { horaInicio } : {}),
      ...(horaFin ? { horaFin } : {}),
      ...(actividad ? { actividad } : {}),
    };

    await updateReservacionInDB(id, updatePayload);

    // Si pasa a "En uso" o se solicitó registrar entrega en bitácora, crear registro en bitácora_uso
    if ((estado === 'En uso' || registrarEntregaEnBitacora) && reserva) {
      const assignedDevice = allEquipos.find(e =>
        (resolvedCodigo && e.inventoryNumber.toLowerCase() === resolvedCodigo.toLowerCase()) ||
        (resolvedEquipoId && e.id === resolvedEquipoId)
      );
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const estReturn = `${fechaUso || reserva.fechaUso} ${(horaFin || reserva.horaFin || '14:00').slice(0, 5)}:00`;
      const bitItem: BitacoraItem = {
        id: `bit-${Date.now()}`,
        equipoId: assignedDevice?.id || resolvedEquipoId || 'eq-vr-001',
        codigoPlai: assignedDevice?.inventoryNumber || resolvedCodigo || 'PLAI-VR-001',
        equipoNombre: assignedDevice?.name || 'Equipo de Laboratorio PLAi',
        usuarioNombre: usuarioNombre || reserva.usuarioNombre,
        usuarioEmail: reserva.usuarioEmail || 'user@plai.edu.mx',
        usuarioDependencia: reserva.usuarioInstitucion || 'Comunidad PLAi',
        fechaEntrega: nowStr,
        fechaDevolucionEstimada: estReturn,
        estadoPrestamo: 'Activo',
        condicionEntrega: (condicionSalida || reserva.condicionSalida || 'Excelente') as BitacoraItem['condicionEntrega'],
        accesoriosEntregados: accesoriosIncluidos || reserva.accesoriosIncluidos || assignedDevice?.accessories?.join(', ') || 'Equipo completo',
        observacionesEntrega: `Entrega vinculada a reservación ${reserva.folio}: ${actividad || reserva.actividad}`,
        adminEntrega: aprobadoPor || 'Administrador PLAi',
      };
      await insertBitacoraEntregaInDB(bitItem, id);
    }

    logger.info('Reservación actualizada', { id, estado, codigoAsignado: resolvedCodigo });

    return NextResponse.json({
      success: true,
      message: `Reservación actualizada exitosamente${estado ? ` a ${estado}` : ''}`,
      data: { id, ...updatePayload },
    });
  } catch (error) {
    logger.error('Error al actualizar reservación', { path: '/api/reservaciones' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al actualizar la reservación' },
      { status: 500 }
    );
  }
}
