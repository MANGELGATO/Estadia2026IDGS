import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  getReservacionesFromDB,
  updateReservacionInDB,
  getEquiposFromDB,
  insertBitacoraEntregaInDB,
  ReservacionItem,
  BitacoraItem,
} from '../../../lib/db';
import { requireSession, isStaffRole } from '../../../lib/authGuard';
import { logger } from '../../../lib/logger';
import { reservacionUpdateSchema } from '../../../lib/validations/schemas';

export const dynamic = 'force-dynamic';

function normalizeStr(s?: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/-/g, ' ')
    .trim();
}

export async function GET() {
  const auth = await requireSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    // El personal (admin / colaborador) consulta todas; un usuario final solo ve sus propias reservaciones
    const filterEmail = isStaffRole(auth.user.role) ? undefined : auth.user.email;
    const reservaciones = await getReservacionesFromDB(filterEmail);
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
  const auth = await requireSession(['admin', 'colaborador']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = reservacionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos para actualizar la reservación',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      id,
      estado,
      equipoId,
      codigoPlaiAsignado,
      accesoriosIncluidos,
      condicionSalida,
      observacionesAdmin,
      usuarioNombre,
      fechaUso,
      horaInicio,
      horaFin,
      actividad,
      registrarEntregaEnBitacora,
    } = parsed.data;

    const allReservas = await getReservacionesFromDB();
    const reserva = allReservas.find((r) => r.id === id);
    const allEquipos = await getEquiposFromDB();

    let resolvedEquipoId = equipoId || reserva?.equipoId;
    let resolvedCodigo = codigoPlaiAsignado || reserva?.codigoPlaiAsignado;

    if (estado === 'Aprobada' && !resolvedCodigo && reserva) {
      const catNorm = normalizeStr(reserva.categoriaId);
      const disponible =
        allEquipos.find((e) => e.id === reserva.equipoId && e.status === 'Disponible') ||
        allEquipos.find((e) => {
          const eqCatNorm = normalizeStr(e.category);
          return (
            e.status === 'Disponible' &&
            (eqCatNorm.includes(catNorm) || (catNorm !== '' && catNorm.includes(eqCatNorm)))
          );
        });
      if (disponible) {
        resolvedEquipoId = disponible.id;
        resolvedCodigo = disponible.inventoryNumber;
      }
    }

    if (resolvedCodigo && !resolvedEquipoId) {
      const targetCode = resolvedCodigo.toLowerCase();
      const eq = allEquipos.find(
        (e) => e.inventoryNumber.toLowerCase() === targetCode
      );
      if (eq) resolvedEquipoId = eq.id;
    } else if (resolvedEquipoId && !resolvedCodigo) {
      const eq = allEquipos.find((e) => e.id === resolvedEquipoId);
      if (eq) resolvedCodigo = eq.inventoryNumber;
    }

    const updatePayload: Partial<ReservacionItem> = {
      ...(estado ? { estado } : {}),
      ...(resolvedEquipoId ? { equipoId: resolvedEquipoId } : {}),
      ...(resolvedCodigo ? { codigoPlaiAsignado: resolvedCodigo } : {}),
      ...(accesoriosIncluidos !== undefined ? { accesoriosIncluidos } : {}),
      ...(condicionSalida ? { condicionSalida } : {}),
      ...(observacionesAdmin !== undefined ? { observacionesAdmin } : {}),
      aprobadoPor: auth.user.name,
      ...(usuarioNombre ? { usuarioNombre } : {}),
      ...(fechaUso ? { fechaUso } : {}),
      ...(horaInicio ? { horaInicio } : {}),
      ...(horaFin ? { horaFin } : {}),
      ...(actividad ? { actividad } : {}),
    };

    await updateReservacionInDB(id, updatePayload);

    if ((estado === 'En uso' || registrarEntregaEnBitacora) && reserva) {
      const assignedDevice = allEquipos.find(
        (e) =>
          (resolvedCodigo && e.inventoryNumber.toLowerCase() === resolvedCodigo.toLowerCase()) ||
          (resolvedEquipoId && e.id === resolvedEquipoId)
      );
      if (assignedDevice) {
        const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const estReturn = `${fechaUso || reserva.fechaUso} ${(horaFin || reserva.horaFin || '14:00').slice(0, 5)}:00`;
        const bitItem: BitacoraItem = {
          id: `bit-${crypto.randomUUID()}`,
          equipoId: assignedDevice.id,
          codigoPlai: assignedDevice.inventoryNumber,
          equipoNombre: assignedDevice.name,
          usuarioNombre: usuarioNombre || reserva.usuarioNombre,
          usuarioEmail: reserva.usuarioEmail,
          usuarioDependencia: reserva.usuarioInstitucion || 'Comunidad PLAi',
          fechaEntrega: nowStr,
          fechaDevolucionEstimada: estReturn,
          estadoPrestamo: 'Activo',
          condicionEntrega: (condicionSalida ||
            reserva.condicionSalida ||
            'Excelente') as BitacoraItem['condicionEntrega'],
          accesoriosEntregados:
            accesoriosIncluidos ||
            reserva.accesoriosIncluidos ||
            assignedDevice.accessories?.join(', ') ||
            'Equipo completo',
          observacionesEntrega: `Entrega vinculada a reservación ${reserva.folio}: ${actividad || reserva.actividad}`,
          adminEntrega: auth.user.name,
        };
        await insertBitacoraEntregaInDB(bitItem, id);
      }
    }

    logger.info('Reservación actualizada', {
      id,
      estado,
      codigoAsignado: resolvedCodigo,
      actor: auth.user.email,
    });

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
