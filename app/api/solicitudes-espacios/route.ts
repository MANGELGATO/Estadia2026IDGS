import { NextRequest, NextResponse } from 'next/server';
import { spaceRequestSchema } from '../../../lib/validations/schemas';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const reqId = req.headers.get('x-request-id') || `req-${Date.now()}`;

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
