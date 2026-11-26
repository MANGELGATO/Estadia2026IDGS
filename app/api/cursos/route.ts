import { NextRequest, NextResponse } from 'next/server';
import { getCursosFromDB, insertCursoInDB, CursoAgendaItem } from '../../../lib/db';
import { requireSession, isStaffRole } from '../../../lib/authGuard';
import { logger } from '../../../lib/logger';
import { generateFolio } from '../../../lib/folio';
import { getMexicoTodayYmd } from '../../../lib/dateMexico';
import { courseRequestSchema, cursoPayloadSchema } from '../../../lib/validations/schemas';
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
  RATE_LIMIT_MUTATION,
} from '../../../lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * Elimina PII de terceros (solicitanteNombre, solicitanteEmail, institucion)
 * cuando un usuario estándar consulta cursos confirmados que no le pertenecen.
 */
function sanitizeCursoForUser(
  curso: CursoAgendaItem,
  viewerEmail: string,
  viewerIsStaff: boolean
): CursoAgendaItem {
  if (viewerIsStaff) return curso;
  const isOwner = curso.solicitanteEmail?.toLowerCase() === viewerEmail.toLowerCase();
  if (isOwner) return curso;

  const {
    solicitanteNombre: _n,
    solicitanteEmail: _e,
    institucion: _i,
    ...publicFields
  } = curso;
  void _n;
  void _e;
  void _i;
  return publicFields;
}

export async function GET() {
  const auth = await requireSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const cursos = await getCursosFromDB();
    const staff = isStaffRole(auth.user.role);
    const filtered = (
      staff
        ? cursos
        : cursos.filter(
            (c) =>
              c.estado === 'Confirmado' ||
              c.solicitanteEmail?.toLowerCase() === auth.user.email.toLowerCase()
          )
    ).map((c) => sanitizeCursoForUser(c, auth.user.email, staff));

    return NextResponse.json({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  } catch (error) {
    logger.error('Error al consultar agenda de cursos', { path: '/api/cursos' }, error);
    return NextResponse.json(
      { success: false, message: 'Error al consultar cursos agendados' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`cursos_route:${ip}`, RATE_LIMIT_MUTATION);
  if (!rate.success) {
    logger.warn('Rate limit excedido en POST /api/cursos', {
      path: '/api/cursos',
      ip,
      status: 429,
    });
    return createRateLimitResponse(rate);
  }

  const auth = await requireSession();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();

    // Acepta tanto el payload de `courseRequestSchema` como el payload de la vista de agenda
    let normalizedInput: {
      titulo: string;
      tipo: string;
      fecha: string;
      hora: string;
      lugar: string;
      asistentes: number;
      descripcion: string;
      solicitanteNombre: string;
      solicitanteEmail?: string;
      institucion: string;
      icon: string;
    };

    if ('courseType' in body || 'contactName' in body) {
      const parsedCourse = courseRequestSchema.safeParse(body);
      if (!parsedCourse.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Datos de solicitud de curso inválidos.',
            errors: parsedCourse.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }
      const d = parsedCourse.data;
      normalizedInput = {
        titulo:
          d.courseType === 'academica'
            ? `Visita Académica — ${d.institution}`
            : `Sesión Empresarial — ${d.institution}`,
        tipo: d.courseType === 'academica' ? 'Visita Académica' : 'Capacitación Privada',
        fecha: d.preferredDate,
        hora: '10:00 - 13:00',
        lugar: 'Laboratorios PLAi · Ciudad Creativa Digital',
        asistentes: d.participantsCount,
        descripcion:
          d.notes || 'Solicitud de capacitación o visita guiada registrada desde el portal.',
        solicitanteNombre: d.contactName,
        solicitanteEmail: d.contactEmail,
        institucion: d.institution,
        icon: d.courseType === 'academica' ? '🎓' : '🏢',
      };
    } else {
      const parsed = cursoPayloadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Los datos del curso o visita no son válidos.',
            errors: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }
      const d = parsed.data;
      normalizedInput = {
        titulo: d.titulo || 'Taller / Recorrido Tecnológico PLAi',
        tipo: d.tipo || 'Sesión Formativa Presencial',
        fecha: d.fecha,
        hora: d.hora || '10:00 - 13:00',
        lugar: d.lugar || 'Laboratorios PLAi · Ciudad Creativa Digital',
        asistentes: d.asistentes ?? 15,
        descripcion:
          d.descripcion || 'Solicitud de capacitación o visita guiada registrada desde el portal.',
        solicitanteNombre: d.solicitanteNombre,
        solicitanteEmail: d.solicitanteEmail || undefined,
        institucion: d.institucion || 'Comunidad PLAi',
        icon: d.icon || '🎓',
      };
    }

    const todayMexico = getMexicoTodayYmd();
    if (normalizedInput.fecha < todayMexico) {
      return NextResponse.json(
        {
          success: false,
          message: 'La fecha tentativa no puede ser anterior al día de hoy.',
          errors: { fecha: ['La fecha no puede ser anterior al día de hoy.'] },
        },
        { status: 400 }
      );
    }

    const authoritativeEmail = isStaffRole(auth.user.role)
      ? String(normalizedInput.solicitanteEmail || auth.user.email).trim().toLowerCase()
      : auth.user.email;

    const folio = generateFolio('CUR');
    const nuevoCurso: CursoAgendaItem = {
      id: folio,
      titulo: normalizedInput.titulo,
      tipo: normalizedInput.tipo,
      fecha: normalizedInput.fecha,
      hora: normalizedInput.hora,
      lugar: normalizedInput.lugar,
      asistentes: normalizedInput.asistentes,
      estado: 'En revisión',
      icon: normalizedInput.icon,
      instructor: 'Equipo Académico PLAi Jalisco',
      descripcion: normalizedInput.descripcion,
      solicitanteNombre: normalizedInput.solicitanteNombre,
      solicitanteEmail: authoritativeEmail,
      institucion: normalizedInput.institucion,
    };

    const saved = await insertCursoInDB(nuevoCurso);
    logger.info('Curso o visita agendada exitosamente', {
      folio: saved.id,
      email: saved.solicitanteEmail,
      actor: auth.user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud de curso / visita registrada exitosamente',
        data: saved,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error al registrar curso', { path: '/api/cursos' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar solicitud de curso' },
      { status: 500 }
    );
  }
}
