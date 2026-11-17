import { NextRequest, NextResponse } from 'next/server';
import { reservationSchema } from '../../../lib/validations/schemas';
import { logger } from '../../../lib/logger';
import { getEquiposFromDB, insertReservacionInDB, ReservacionItem } from '../../../lib/db';
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

  // Rate Limiting en servidor (Sección 7.3 Estándar PLAi)
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
    const device = allEquipos.find(e => e.id === String(parsed.data.deviceId));

    const categorySlugMap: Record<string, string> = {
      'Realidad Virtual': 'realidad-virtual',
      'Robótica': 'robotica',
      'Cómputo': 'computo-multimedia',
      'Drones': 'drones',
      'Fabricación digital': 'fabricacion-digital',
    };
    const catSlug = device ? (categorySlugMap[device.category] || 'realidad-virtual') : 'realidad-virtual';

    const timestamp = Date.now();
    const id = `res-${timestamp}`;
    const folio = `RES-${timestamp.toString().slice(-4)}`;

    const newReserva: ReservacionItem = {
      id,
      folio,
      categoriaId: catSlug,
      equipoId: String(parsed.data.deviceId),
      usuarioId: body.userId || 'usr-standard-01',
      usuarioNombre: parsed.data.userName,
      usuarioEmail: parsed.data.userEmail || body.userEmail || (parsed.data.userName.includes('@') ? parsed.data.userName : 'user@plai.edu.mx'),
      usuarioInstitucion: parsed.data.userInstitution || body.userInstitution || 'Comunidad PLAi',
      fechaUso: parsed.data.date,
      horaInicio: parsed.data.startTime,
      horaFin: parsed.data.endTime,
      actividad: parsed.data.activity,
      estado: 'Pendiente',
      accesoriosIncluidos: device?.accessories ? device.accessories.slice(0, 2).join(', ') : 'Equipo base con accesorios originales',
      condicionSalida: 'Excelente',
      observacionesAdmin: parsed.data.notes || `Solicitud para ${device ? device.name : 'equipo'} enviada desde el portal institucional.`,
    };

    await insertReservacionInDB(newReserva);

    logger.info('Solicitud de reservación validada y persistida en base de datos', {
      reqId,
      path: '/api/reservas',
      status: 201,
      folio: newReserva.folio,
      deviceId: String(parsed.data.deviceId),
      userName: parsed.data.userName,
      userEmail: newReserva.usuarioEmail,
      date: parsed.data.date,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Reservación procesada exitosamente conforme a los lineamientos institucionales.',
        data: {
          id: folio,
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
      {
        success: false,
        message: 'Ocurrió un error interno al procesar la solicitud.',
      },
      { status: 500 }
    );
  }
}
