import { NextRequest, NextResponse } from 'next/server';
import {
  getIncidenciasFromDB,
  insertIncidenciaInDB,
  updateIncidenciaStatusInDB,
  getEquipoByCodigoPLAi,
  IncidenciaItem,
} from '../../../lib/db';
import { requireSession } from '../../../lib/authGuard';
import { logger } from '../../../lib/logger';
import { generateEntityId, generateFolio } from '../../../lib/folio';
import {
  incidenciaCreateSchema,
  incidenciaUpdateSchema,
} from '../../../lib/validations/schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireSession(['admin', 'colaborador']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const incidencias = await getIncidenciasFromDB();
    return NextResponse.json({
      success: true,
      data: incidencias,
      total: incidencias.length,
    });
  } catch (error) {
    logger.error('Error al obtener incidencias', { path: '/api/mantenimiento' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar incidencias' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(['admin', 'colaborador']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = incidenciaCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de incidencia inválidos.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const equipo = await getEquipoByCodigoPLAi(data.codigoPlai);
    if (!equipo) {
      return NextResponse.json(
        {
          success: false,
          message: `No se encontró ningún equipo registrado con el código: ${data.codigoPlai}`,
        },
        { status: 404 }
      );
    }

    const incidencia: IncidenciaItem = {
      id: generateEntityId('inc'),
      folio: generateFolio('INC'),
      equipoId: equipo.id,
      codigoPlai: equipo.inventoryNumber,
      equipoNombre: equipo.name,
      origen: data.origen,
      tipoFalla: data.tipoFalla,
      severidad: data.severidad,
      descripcion: data.descripcion,
      estado: data.estado,
      tecnicoResponsable: data.tecnicoResponsable || auth.user.name,
      fechaReporte: data.fechaReporte || new Date().toISOString(),
      accionesRealizadas: data.accionesRealizadas || undefined,
    };

    await insertIncidenciaInDB(incidencia);
    logger.info('Incidencia registrada y equipo puesto en mantenimiento', {
      folio: incidencia.folio,
      codigo: equipo.inventoryNumber,
      actor: auth.user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Incidencia ${incidencia.folio} registrada. El equipo ${equipo.inventoryNumber} pasó a estado "En mantenimiento".`,
        data: incidencia,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error al registrar incidencia', { path: '/api/mantenimiento' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar la incidencia' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireSession(['admin', 'colaborador']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = incidenciaUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID o estado de incidencia inválidos.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { id, estado, accionesRealizadas } = parsed.data;
    await updateIncidenciaStatusInDB(id, estado, accionesRealizadas);
    logger.info('Estado de incidencia actualizado', { id, estado, actor: auth.user.email });

    return NextResponse.json({
      success: true,
      message: `Incidencia actualizada a estado: ${estado}`,
    });
  } catch (error) {
    logger.error('Error al actualizar incidencia', { path: '/api/mantenimiento' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al actualizar estado de la incidencia' },
      { status: 500 }
    );
  }
}
