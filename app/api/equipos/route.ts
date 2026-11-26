import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getEquiposFromDB, insertEquipoInDB, deleteEquipoInDB } from '../../../lib/db';
import { DeviceItem } from '../../../lib/mockData';
import { requireSession, isStaffRole } from '../../../lib/authGuard';
import { getAuthOptions } from '../../../lib/auth';
import { logger } from '../../../lib/logger';
import { generateEntityId } from '../../../lib/folio';
import { equipoSchema } from '../../../lib/validations/schemas';

export const dynamic = 'force-dynamic';

/**
 * Devuelve una versión pública reducida del equipo para visitantes y usuarios estándar,
 * ocultando metadatos internos sensibles (`serialNumber`, `observations`, `responsible`).
 */
function sanitizeEquipoForPublic(device: DeviceItem): DeviceItem {
  const {
    serialNumber: _sn,
    observations: _obs,
    responsible: _resp,
    ...publicFields
  } = device;
  void _sn;
  void _obs;
  void _resp;
  return publicFields;
}

export async function GET() {
  try {
    const session = await getServerSession(getAuthOptions());
    const viewerIsStaff = Boolean(session?.user && isStaffRole(session.user.role));
    const equipos = await getEquiposFromDB();
    const payload = viewerIsStaff ? equipos : equipos.map(sanitizeEquipoForPublic);
    return NextResponse.json({
      success: true,
      data: payload,
      total: payload.length,
    });
  } catch (error) {
    logger.error('Error al obtener equipos en Directus', { path: '/api/equipos' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al consultar equipos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(['admin']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const parsed = equipoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos de equipo inválidos.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const item: DeviceItem = {
      id: d.id || generateEntityId('eq'),
      name: d.name,
      category: d.category,
      brand: d.brand,
      model: d.model,
      inventoryNumber: d.inventoryNumber,
      serialNumber: d.serialNumber,
      storage: d.storage,
      status: d.status,
      location: d.location,
      specs: d.specs,
      accessories: d.accessories,
      imageEmoji: d.imageEmoji,
      imageUrl: d.imageUrl || undefined,
      responsible: d.responsible,
      observations: d.observations,
      dateAdded: d.dateAdded,
    };

    const saved = await insertEquipoInDB(item);
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'No se pudo guardar el equipo en Directus' },
        { status: 500 }
      );
    }

    logger.info('Equipo registrado o actualizado en Directus', {
      id: item.id,
      codigo_plai: item.inventoryNumber,
      actor: auth.user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Equipo guardado correctamente',
        data: item,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error al guardar equipo en Directus', { path: '/api/equipos' }, error);
    return NextResponse.json(
      { success: false, message: 'Error al persistir equipo en Directus' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireSession(['admin']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id')?.trim();

    if (!id || id.length > 64) {
      return NextResponse.json(
        { success: false, message: 'Parámetro id es obligatorio y válido' },
        { status: 400 }
      );
    }

    const deleted = await deleteEquipoInDB(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'No se encontró el equipo o no se pudo eliminar' },
        { status: 404 }
      );
    }

    logger.info('Equipo eliminado de Directus', { id, actor: auth.user.email });

    return NextResponse.json({
      success: true,
      message: 'Equipo eliminado correctamente',
      data: { id },
    });
  } catch (error) {
    logger.error('Error al eliminar equipo', { path: '/api/equipos' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al eliminar equipo' },
      { status: 500 }
    );
  }
}
