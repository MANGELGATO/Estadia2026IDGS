import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { spaceRequestSchema } from '../../../lib/validations/schemas';
import { logger } from '../../../lib/logger';
import {
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

const ESPACIO_NAMES: Record<string, string> = {
  auditorio: 'Auditorio Principal (150 personas)',
  'aula-robotica': 'Aula de Robótica y Automatización',
  'workshop-vr': 'Workshop de Realidad Virtual',
  'sala-juntas': 'Sala de Juntas Creativa',
};

export async function POST(req: NextRequest) {
  const reqId = req.headers.get('x-request-id') || `req-${crypto.randomUUID()}`;
  const ip = getClientIp(req);

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

  const auth = await requireSession();
  if (auth.errorResponse) return auth.errorResponse;

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

    // Validar fecha contra hoy (CDMX) y maxAdvanceDays de configuración
    const sysConfig = await getSystemConfigFromDB();
    const todayMexico = getMexicoTodayYmd();
    if (parsed.data.fecha < todayMexico) {
      return NextResponse.json(
        {
          success: false,
          message: 'No es posible solicitar espacios en fechas pasadas.',
          errors: { fecha: ['La fecha no puede ser anterior al día de hoy.'] },
        },
        { status: 400 }
      );
    }

    const maxAdvanceDays = Math.max(1, Number(sysConfig.maxAdvanceDays || 14));
    const maxAllowedDate = addDaysToYmd(todayMexico, maxAdvanceDays);
    if (parsed.data.fecha > maxAllowedDate) {
      return NextResponse.json(
        {
          success: false,
          message: `Las solicitudes de espacio pueden realizarse con hasta ${maxAdvanceDays} días de anticipación.`,
          errors: {
            fecha: [`La fecha excede el límite máximo de ${maxAdvanceDays} días de anticipación.`],
          },
        },
        { status: 400 }
      );
    }

    const folio = generateFolio('ESP');
    const espacioNombre = ESPACIO_NAMES[parsed.data.espacioId] || parsed.data.espacioId;
    const catSlug = parsed.data.espacioId.includes('robot')
      ? 'robotica'
      : parsed.data.espacioId.includes('vr')
      ? 'realidad-virtual'
      : 'computo-multimedia';

    const [h, m] = parsed.data.hora.split(':').map(Number);
    const endH = Math.min((h || 10) + 2, 20);
    const horaFin = `${String(endH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;

    const authoritativeEmail = isStaffRole(auth.user.role)
      ? parsed.data.email
      : auth.user.email;

    const nuevaReservaEspacio: ReservacionItem = {
      id: generateEntityId('esp'),
      folio,
      categoriaId: catSlug,
      codigoPlaiAsignado: `ESPACIO-${parsed.data.espacioId.toUpperCase()}`,
      usuarioId: auth.user.id || undefined,
      usuarioNombre: parsed.data.nombreSolicitante,
      usuarioEmail: authoritativeEmail,
      usuarioTelefono: parsed.data.telefono || undefined,
      usuarioInstitucion: parsed.data.institucion || parsed.data.nombreSolicitante,
      fechaUso: parsed.data.fecha,
      horaInicio: parsed.data.hora,
      horaFin,
      actividad: `[ESPACIO: ${espacioNombre}] ${parsed.data.proposito}`,
      estado: 'Pendiente',
      accesoriosIncluidos: 'Proyector 4K, Audio, Conectividad Wi-Fi Dedicada',
      condicionSalida: 'Excelente',
      observacionesAdmin: `Solicitud de espacio físico (${espacioNombre}). Contacto: ${parsed.data.telefono || authoritativeEmail}.`,
    };

    await insertReservacionInDB(nuevaReservaEspacio);

    logger.info('Solicitud de espacio validada y persistida en base de datos', {
      reqId,
      path: '/api/solicitudes-espacios',
      status: 201,
      folio,
      espacioId: parsed.data.espacioId,
      actor: auth.user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud de espacio registrada exitosamente.',
        data: {
          id: folio,
          ...parsed.data,
          reserva: nuevaReservaEspacio,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error(
      'Error al procesar solicitud de espacio',
      { reqId, path: '/api/solicitudes-espacios' },
      error
    );
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
