import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { reservationSchema } from '../../../lib/validations/schemas';
import { logger } from '../../../lib/logger';
import {
  getEquiposFromDB,
  getSystemConfigFromDB,
  insertReservacionInDB,
  ReservacionItem,
} from '../../../lib/db';
import { requireSession, isStaffRole } from '../../../lib/authGuard';
import { generateEntityId, generateFolio } from '../../../lib/folio';
import { addDaysToYmd, getMexicoTodayYmd } from '../../../lib/dateMexico';
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
  RATE_LIMIT_MUTATION,
} from '../../../lib/rateLimit';

export const dynamic = 'force-dynamic';

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export async function POST(req: NextRequest) {
  const reqId = req.headers.get('x-request-id') || `req-${crypto.randomUUID()}`;
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

    // Aplicar configuración real del sistema en servidor: fechas pasadas, maxAdvanceDays y maxReservationHours
    const sysConfig = await getSystemConfigFromDB();
    const todayMexico = getMexicoTodayYmd();

    if (parsed.data.date < todayMexico) {
      return NextResponse.json(
        {
          success: false,
          message: 'No es posible registrar reservaciones en fechas pasadas.',
          errors: { date: ['La fecha de reservación no puede ser anterior a hoy.'] },
        },
        { status: 400 }
      );
    }

    const maxAdvanceDays = Math.max(1, Number(sysConfig.maxAdvanceDays || 14));
    const maxAllowedDate = addDaysToYmd(todayMexico, maxAdvanceDays);
    if (parsed.data.date > maxAllowedDate) {
      return NextResponse.json(
        {
          success: false,
          message: `Las reservaciones solo pueden realizarse con hasta ${maxAdvanceDays} días de anticipación.`,
          errors: {
            date: [`La fecha excede el límite máximo de ${maxAdvanceDays} días de anticipación.`],
          },
        },
        { status: 400 }
      );
    }

    const maxReservationHours = Math.max(1, Number(sysConfig.maxReservationHours || 2));
    const durationMinutes =
      timeToMinutes(parsed.data.endTime) - timeToMinutes(parsed.data.startTime);
    if (durationMinutes <= 0 || durationMinutes > maxReservationHours * 60) {
      return NextResponse.json(
        {
          success: false,
          message: `La duración máxima permitida por reservación es de ${maxReservationHours} hora(s).`,
          errors: {
            endTime: [
              `La duración máxima configurada para préstamos es de ${maxReservationHours} hora(s).`,
            ],
          },
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
        parsed.data.accessories && parsed.data.accessories.length > 0
          ? parsed.data.accessories.join(', ')
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
