import { NextRequest, NextResponse } from 'next/server';
import { reservationSchema } from '../../../lib/validations/schemas';
import { logger } from '../../../lib/logger';
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

    logger.info('Solicitud de reservación validada y procesada', {
      reqId,
      path: '/api/reservas',
      status: 201,
      deviceId: String(parsed.data.deviceId),
      userName: parsed.data.userName,
      date: parsed.data.date,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Reservación procesada exitosamente conforme a los lineamientos institucionales.',
        data: {
          id: `RES-${Date.now()}`,
          ...parsed.data,
          status: 'Pendiente',
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
