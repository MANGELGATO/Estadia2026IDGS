import { NextRequest, NextResponse } from 'next/server';
import { spaceRequestSchema } from '../../../lib/validations/schemas';
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
  const rate = checkRateLimit(`espacio_route:${ip}`, RATE_LIMIT_MUTATION);
  if (!rate.success) {
    logger.warn('Rate limit excedido en POST /api/solicitudes-espacios', {
      reqId,
      path: '/api/solicitudes-espacios',
      ip,
      status: 429,
    });
    return createRateLimitResponse(rate);
  }

  try {
    const body = await req.json();
    const parsed = spaceRequestSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn('Validación de solicitud de espacio fallida', {
        reqId,
        path: '/api/solicitudes-espacios',
        status: 400,
        errors: parsed.error.flatten().fieldErrors,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Datos de solicitud de espacio inválidos.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    logger.info('Solicitud de espacio validada y registrada', {
      reqId,
      path: '/api/solicitudes-espacios',
      status: 201,
      espacioId: parsed.data.espacioId,
      solicitante: parsed.data.nombreSolicitante,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud de espacio registrada exitosamente.',
        data: {
          id: `ESP-${Date.now()}`,
          ...parsed.data,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error al procesar solicitud de espacio', { reqId, path: '/api/solicitudes-espacios' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
