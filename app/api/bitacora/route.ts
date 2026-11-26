import { NextRequest, NextResponse } from 'next/server';
import {
  getBitacoraFromDB,
  insertBitacoraEntregaInDB,
  updateBitacoraDevolucionInDB,
  getEquipoByCodigoPLAi,
  insertIncidenciaInDB,
  EquipoStateConflictError,
  BitacoraItem,
  IncidenciaItem,
} from '../../../lib/db';
import { requireSession } from '../../../lib/authGuard';
import { logger } from '../../../lib/logger';
import { generateEntityId, generateFolio } from '../../../lib/folio';
import {
  bitacoraEntregaSchema,
  bitacoraDevolucionSchema,
} from '../../../lib/validations/schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireSession(['admin', 'colaborador']);
  if (auth.errorResponse) return auth.errorResponse;

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
  const auth = await requireSession(['admin', 'colaborador']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = bitacoraEntregaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Los datos de entrega en bitácora no son válidos.',
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
          message: `No se encontró ningún equipo con el código PLAi: ${data.codigoPlai}`,
        },
        { status: 404 }
      );
    }

    const item: BitacoraItem = {
      id: generateEntityId('bit'),
      equipoId: equipo.id,
      codigoPlai: equipo.inventoryNumber,
      equipoNombre: equipo.name,
      usuarioNombre: data.usuarioNombre,
      usuarioEmail: (data.usuarioEmail || '').toLowerCase(),
      usuarioDependencia: data.usuarioDependencia || undefined,
      fechaEntrega: data.fechaEntrega,
      fechaDevolucionEstimada: data.fechaDevolucionEstimada,
      estadoPrestamo: 'Activo',
      condicionEntrega: data.condicionEntrega,
      accesoriosEntregados:
        data.accesoriosEntregados || 'Equipo completo con accesorios originales',
      observacionesEntrega: data.observacionesEntrega || undefined,
      adminEntrega: auth.user.name,
    };

    await insertBitacoraEntregaInDB(item, data.reservaId);
    logger.info('Entrega de equipo registrada en bitácora', {
      id: item.id,
      codigo: item.codigoPlai,
      reservaId: data.reservaId,
      actor: auth.user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Entrega de dispositivo registrada correctamente',
        data: item,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof EquipoStateConflictError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    logger.error('Error al registrar entrega en bitácora', { path: '/api/bitacora' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al registrar la entrega' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireSession(['admin', 'colaborador']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = bitacoraDevolucionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Los datos de devolución no son válidos.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      id,
      fechaDevolucionReal,
      condicionDevolucion,
      accesoriosDevueltos,
      observacionesDevolucion,
      incidenciaGenerada,
      descripcionIncidencia,
    } = parsed.data;

    await updateBitacoraDevolucionInDB(id, {
      fechaDevolucionReal,
      condicionDevolucion,
      accesoriosDevueltos: accesoriosDevueltos || 'Completos',
      observacionesDevolucion,
      incidenciaGenerada,
      adminRecibe: auth.user.name,
    });

    if (incidenciaGenerada) {
      const logs = await getBitacoraFromDB();
      const item = logs.find((b) => b.id === id);
      if (item) {
        const incidencia: IncidenciaItem = {
          id: generateEntityId('inc'),
          folio: generateFolio('INC'),
          equipoId: item.equipoId,
          codigoPlai: item.codigoPlai,
          equipoNombre: item.equipoNombre,
          origen: 'Devolución de Préstamo',
          tipoFalla: 'Daño Físico',
          severidad: 'Media',
          descripcion:
            descripcionIncidencia ||
            observacionesDevolucion ||
            'Incidencia detectada durante la revisión de retorno del dispositivo.',
          estado: 'Reportada',
          tecnicoResponsable: auth.user.name,
          fechaReporte: fechaDevolucionReal,
        };
        await insertIncidenciaInDB(incidencia);
        logger.info('Incidencia automática generada desde bitácora de devolución', {
          folio: incidencia.folio,
          actor: auth.user.email,
        });
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
