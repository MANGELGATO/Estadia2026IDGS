import { NextRequest, NextResponse } from 'next/server';
import {
  getCotizaciones3DFromDB,
  insertCotizacion3DInDB,
  updateCotizacion3DInDB,
  Cotizacion3D,
} from '../../../lib/db';
import { logger } from '../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getCotizaciones3DFromDB();
    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (error) {
    logger.error('Error al obtener cotizaciones 3D', { path: '/api/cotizaciones' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar cotizaciones 3D' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.nombre_solicitante || !body.email_solicitante || !body.archivo_nombre) {
      return NextResponse.json(
        {
          success: false,
          message: 'Faltan campos obligatorios: nombre, correo institucional y archivo 3D.',
        },
        { status: 400 }
      );
    }

    const nuevaCotizacion = await insertCotizacion3DInDB({
      nombre_solicitante: String(body.nombre_solicitante).trim(),
      email_solicitante: String(body.email_solicitante).trim(),
      telefono: body.telefono ? String(body.telefono).trim() : undefined,
      archivo_nombre: String(body.archivo_nombre).trim(),
      material: String(body.material || 'PLA'),
      color_preferido: body.color_preferido ? String(body.color_preferido) : 'Cualquiera',
      relleno: body.relleno ? String(body.relleno) : '20%',
      detalles: body.detalles ? String(body.detalles).trim() : undefined,
      estado: 'Pendiente',
    });

    logger.info('Nueva cotización de impresión 3D registrada', {
      id: nuevaCotizacion.id,
      solicitante: nuevaCotizacion.nombre_solicitante,
      archivo: nuevaCotizacion.archivo_nombre,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud de cotización registrada con éxito en el sistema.',
        data: nuevaCotizacion,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error al registrar cotización 3D', { path: '/api/cotizaciones' }, error);
    return NextResponse.json(
      { success: false, message: 'Ocurrió un error al procesar la cotización 3D' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, estado, precio_estimado, tiempo_estimado_horas, notas_tecnicas } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'El identificador id es obligatorio' },
        { status: 400 }
      );
    }

    const updates: Partial<Cotizacion3D> = {};
    if (estado !== undefined) updates.estado = estado;
    if (precio_estimado !== undefined) updates.precio_estimado = Number(precio_estimado);
    if (tiempo_estimado_horas !== undefined) updates.tiempo_estimado_horas = Number(tiempo_estimado_horas);
    if (notas_tecnicas !== undefined) updates.notas_tecnicas = notas_tecnicas;

    const ok = await updateCotizacion3DInDB(id, updates);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: 'No se pudo actualizar la cotización en MySQL' },
        { status: 404 }
      );
    }

    logger.info('Cotización 3D actualizada por administrador', { id, updates });

    return NextResponse.json({
      success: true,
      message: 'Cotización actualizada correctamente',
      data: { id, ...updates },
    });
  } catch (error) {
    logger.error('Error al actualizar cotización 3D', { path: '/api/cotizaciones' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al actualizar cotización' },
      { status: 500 }
    );
  }
}
