import { NextRequest, NextResponse } from 'next/server';
import { 
  getIncidenciasFromDB, 
  insertIncidenciaInDB, 
  updateIncidenciaStatusInDB,
  getEquipoByCodigoPLAi,
  IncidenciaItem 
} from '../../../lib/db';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
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
  try {
    const body = await req.json();

    if (!body.codigoPlai || !body.descripcion || !body.tipoFalla) {
      return NextResponse.json(
        { success: false, message: 'Código PLAi, tipo de falla y descripción son requeridos' },
        { status: 400 }
      );
    }

    // Localizar equipo en la base de datos (Req 5)
    const equipo = await getEquipoByCodigoPLAi(body.codigoPlai);
    if (!equipo) {
      return NextResponse.json(
        { success: false, message: `No se encontró ningún equipo registrado con el código: ${body.codigoPlai}` },
        { status: 404 }
      );
    }

    const incidencia: IncidenciaItem = {
      id: `inc-${Date.now()}`,
      folio: `INC-${Date.now().toString().slice(-4)}`,
      equipoId: equipo.id,
      codigoPlai: equipo.inventoryNumber,
      equipoNombre: equipo.name,
      origen: body.origen || 'Revisión Periódica',
      tipoFalla: body.tipoFalla,
      severidad: body.severidad || 'Media',
      descripcion: body.descripcion.trim(),
      estado: body.estado || 'Reportada',
      tecnicoResponsable: body.tecnicoResponsable?.trim() || 'Técnico de Laboratorio PLAi',
      fechaReporte: body.fechaReporte || new Date().toISOString().slice(0, 19).replace('T', ' '),
      accionesRealizadas: body.accionesRealizadas?.trim() || undefined,
    };

    await insertIncidenciaInDB(incidencia);
    logger.info('Incidencia registrada y equipo puesto en mantenimiento', { folio: incidencia.folio, codigo: equipo.inventoryNumber });

    return NextResponse.json({
      success: true,
      message: `Incidencia ${incidencia.folio} registrada. El equipo ${equipo.inventoryNumber} pasó a estado "En mantenimiento".`,
      data: incidencia,
    }, { status: 201 });
  } catch (error) {
    logger.error('Error al registrar incidencia', { path: '/api/mantenimiento' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar la incidencia' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, estado, accionesRealizadas } = body;

    if (!id || !estado) {
      return NextResponse.json(
        { success: false, message: 'ID y nuevo estado son obligatorios' },
        { status: 400 }
      );
    }

    await updateIncidenciaStatusInDB(id, estado, accionesRealizadas);
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
