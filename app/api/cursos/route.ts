import { NextRequest, NextResponse } from 'next/server';
import { getCursosFromDB, insertCursoInDB, CursoAgendaItem } from '../../../lib/db';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cursos = await getCursosFromDB();
    return NextResponse.json({
      success: true,
      data: cursos,
      total: cursos.length,
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
  try {
    const body = await req.json();
    const {
      titulo,
      tipo,
      fecha,
      hora,
      lugar,
      asistentes,
      descripcion,
      solicitanteNombre,
      solicitanteEmail,
      institucion,
      icon,
    } = body;

    if (!solicitanteNombre || !solicitanteEmail || !fecha) {
      return NextResponse.json(
        { success: false, message: 'Nombre, correo y fecha son obligatorios para agendar un curso o visita' },
        { status: 400 }
      );
    }

    const folio = `CUR-${Date.now().toString().slice(-4)}`;
    const nuevoCurso: CursoAgendaItem = {
      id: folio,
      titulo: titulo || 'Taller / Recorrido Tecnológico PLAi',
      tipo: tipo || 'Sesión Formativa Presencial',
      fecha,
      hora: hora || '10:00 - 13:00',
      lugar: lugar || 'Laboratorios PLAi · Ciudad Creativa Digital',
      asistentes: Number(asistentes) || 15,
      estado: 'En revisión',
      icon: icon || '🎓',
      instructor: 'Equipo Académico PLAi Jalisco',
      descripcion: descripcion || 'Solicitud de capacitación o visita guiada registrada desde el portal.',
      solicitanteNombre: String(solicitanteNombre).trim(),
      solicitanteEmail: String(solicitanteEmail).trim().toLowerCase(),
      institucion: institucion ? String(institucion).trim() : 'Comunidad PLAi',
    };

    const saved = await insertCursoInDB(nuevoCurso);
    logger.info('Curso o visita agendada exitosamente', { folio: saved.id, email: saved.solicitanteEmail });

    return NextResponse.json({
      success: true,
      message: 'Solicitud de curso / visita registrada exitosamente',
      data: saved,
    }, { status: 201 });
  } catch (error) {
    logger.error('Error al registrar curso', { path: '/api/cursos' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar solicitud de curso' },
      { status: 500 }
    );
  }
}
