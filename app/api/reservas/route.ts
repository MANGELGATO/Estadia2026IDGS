import { NextRequest, NextResponse } from 'next/server';
import { reservationSchema } from '../../../lib/validations/schemas';
import { logger } from '../../../lib/logger';
import { getEquiposFromDB, insertReservacionInDB, ReservacionItem } from '../../../lib/db';
import { requireSession, isStaffRole } from '../../../lib/authGuard';
import { generateEntityId, generateFolio } from '../../../lib/folio';
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
  RATE_LIMIT_MUTATION,
} from '../../../lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const reqId = req.headers.get('x-request-id') || `req-${Date.now()}`;
  const ip = getClientIp(req);

  const rate = checkRateLimit(`reserva_route:${ip}`, RATE_LIMIT_MUTATION);
  if (!rate.success) {
    logger.warn('Rate limit excedido en POST /api/reservas', {
      reqId,
      path: '/api/reservas',
      ip,
      status: 429,
    });
    return createRateLimitResponse(rate);
  }

  const auth = await requireSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = reservationSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn('Validación de reservación fallida en servidor', {
        reqId,
        path: '/api/reservas',
        status: 400,
        errors: parsed.error.flatten().fieldErrors,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Los datos enviados no cumplen con las reglas normativas de reservación.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const allEquipos = await getEquiposFromDB();
    const device = allEquipos.find((e) => e.id === String(parsed.data.deviceId));

    const categorySlugMap: Record<string, string> = {
      'Realidad Virtual': 'realidad-virtual',
      Robótica: 'robotica',
      Cómputo: 'computo-multimedia',
      Drones: 'drones',
      'Fabricación digital': 'fabricacion-digital',
    };
    const catSlug = device
      ? categorySlugMap[device.category] || 'realidad-virtual'
      : 'realidad-virtual';

    const id = generateEntityId('res');
    const folio = generateFolio('RES');

    // Vincular correo e ID del usuario autenticado (evita suplantación por usuarios estándar)
    const authoritativeEmail = isStaffRole(auth.user.role)
      ? parsed.data.userEmail || auth.user.email
      : auth.user.email;

    const newReserva: ReservacionItem = {
      id,
      folio,
      categoriaId: catSlug,
      equipoId: device ? device.id : undefined,
      codigoPlaiAsignado: device?.inventoryNumber,
      usuarioId: auth.user.id || undefined,
      usuarioNombre: parsed.data.userName || auth.user.name,
      usuarioEmail: authoritativeEmail,
      usuarioInstitucion: parsed.data.userInstitution || 'Comunidad PLAi',
      fechaUso: parsed.data.date,
      horaInicio: parsed.data.startTime,
      horaFin: parsed.data.endTime,
      actividad: parsed.data.activity,
      estado: 'Pendiente',
      accesoriosIncluidos:
        Array.isArray(body.accessories) && body.accessories.length > 0
          ? body.accessories.join(', ')
          : device?.accessories
          ? device.accessories.join(', ')
          : 'Equipo base con accesorios originales',
      condicionSalida: 'Excelente',
      observacionesAdmin:
        parsed.data.notes ||
        `Solicitud para ${device ? `${device.name} (${device.inventoryNumber})` : 'equipo'} enviada desde el portal institucional.`,
    };

    await insertReservacionInDB(newReserva);

    logger.info('Solicitud de reservación validada y persistida en base de datos', {
      reqId,
      path: '/api/reservas',
      status: 201,
      folio: newReserva.folio,
      deviceId: String(parsed.data.deviceId),
      userEmail: newReserva.usuarioEmail,
      date: parsed.data.date,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud de reservación registrada correctamente.',
        data: {
          id: newReserva.folio,
          ...parsed.data,
          status: 'Pendiente',
          reserva: newReserva,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error al procesar la reservación', { reqId, path: '/api/reservas' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al procesar la solicitud de reservación.' },
      { status: 500 }
    );
  }
}
