import { NextRequest, NextResponse } from 'next/server';
import { 
  getBitacoraFromDB, 
  insertBitacoraEntregaInDB, 
  updateBitacoraDevolucionInDB,
  getEquipoByCodigoPLAi,
  insertIncidenciaInDB,
  BitacoraItem,
  IncidenciaItem 
} from '../../../lib/db';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await getBitacoraFromDB();
    return NextResponse.json({
      success: true,
      data: logs,
      total: logs.length,
    });
  } catch (error) {
    logger.error('Error al obtener bitácora de uso', { path: '/api/bitacora' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar bitácora de uso' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.codigoPlai || !body.usuarioNombre || !body.fechaEntrega || !body.fechaDevolucionEstimada) {
      return NextResponse.json(
        { success: false, message: 'Faltan campos obligatorios para registrar la entrega del dispositivo' },
        { status: 400 }
      );
    }

    // Validar existencia del equipo
    const equipo = await getEquipoByCodigoPLAi(body.codigoPlai);
    if (!equipo) {
      return NextResponse.json(
        { success: false, message: `No se encontró ningún equipo con el código PLAi: ${body.codigoPlai}` },
        { status: 404 }
      );
    }

    const item: BitacoraItem = {
      id: `bit-${Date.now()}`,
      equipoId: equipo.id,
      codigoPlai: equipo.inventoryNumber,
      equipoNombre: equipo.name,
      usuarioNombre: String(body.usuarioNombre).trim(),
      usuarioEmail: String(body.usuarioEmail || 'usuario@plai.mx').trim(),
      usuarioDependencia: body.usuarioDependencia ? String(body.usuarioDependencia).trim() : undefined,
      fechaEntrega: body.fechaEntrega,
      fechaDevolucionEstimada: body.fechaDevolucionEstimada,
      estadoPrestamo: 'Activo',
      condicionEntrega: body.condicionEntrega || 'Excelente',
      accesoriosEntregados: body.accesoriosEntregados || 'Equipo completo con accesorios originales',
      observacionesEntrega: body.observacionesEntrega ? String(body.observacionesEntrega).trim() : undefined,
      adminEntrega: body.adminEntrega || 'Administrador PLAi',
    };

    await insertBitacoraEntregaInDB(item);
    logger.info('Entrega de equipo registrada en bitácora', { id: item.id, codigo: item.codigoPlai });

    return NextResponse.json({
      success: true,
      message: 'Entrega de dispositivo registrada correctamente',
      data: item,
    }, { status: 201 });
  } catch (error) {
    logger.error('Error al registrar entrega en bitácora', { path: '/api/bitacora' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar la entrega' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, fechaDevolucionReal, condicionDevolucion, accesoriosDevueltos, observacionesDevolucion, incidenciaGenerada, adminRecibe, descripcionIncidencia } = body;

    if (!id || !fechaDevolucionReal || !condicionDevolucion) {
      return NextResponse.json(
        { success: false, message: 'ID, fecha de devolución real y condición de retorno son obligatorios' },
        { status: 400 }
      );
    }

    await updateBitacoraDevolucionInDB(id, {
      fechaDevolucionReal,
      condicionDevolucion,
      accesoriosDevueltos: accesoriosDevueltos || 'Completos',
      observacionesDevolucion,
      incidenciaGenerada: Boolean(incidenciaGenerada),
      adminRecibe: adminRecibe || 'Administrador PLAi',
    });

    // Si se reportó incidencia al devolver, registrar automáticamente en el módulo de mantenimiento (Req 5)
    if (incidenciaGenerada) {
      const logs = await getBitacoraFromDB();
      const item = logs.find(b => b.id === id);
      if (item) {
        const incidencia: IncidenciaItem = {
          id: `inc-${Date.now()}`,
          folio: `INC-${Date.now().toString().slice(-4)}`,
          equipoId: item.equipoId,
          codigoPlai: item.codigoPlai,
          equipoNombre: item.equipoNombre,
          origen: 'Devolución de Préstamo',
          tipoFalla: 'Daño Físico',
          severidad: 'Media',
          descripcion: descripcionIncidencia || observacionesDevolucion || 'Incidencia detectada durante la revisión de retorno del dispositivo.',
          estado: 'Reportada',
          tecnicoResponsable: adminRecibe || 'Técnico de Laboratorio PLAi',
          fechaReporte: fechaDevolucionReal,
        };
        await insertIncidenciaInDB(incidencia);
        logger.info('Incidencia automática generada desde bitácora de devolución', { folio: incidencia.folio });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Devolución registrada exitosamente en la bitácora',
    });
  } catch (error) {
    logger.error('Error al registrar devolución en bitácora', { path: '/api/bitacora' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar devolución' },
      { status: 500 }
    );
  }
}
