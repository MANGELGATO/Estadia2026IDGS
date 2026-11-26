import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../lib/env';
import { logger } from '../../../../lib/logger';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_SERVED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

/**
 * Proxy de solo lectura para servir imágenes almacenadas en Directus Files desde el mismo origen.
 * - Valida UUID estricto en `id` para evitar path traversal / SSRF.
 * - El token de Directus nunca sale del servidor y su policy en Directus 11 restringe `read`
 *   de `directus_files` EXCLUSIVAMENTE a la carpeta `lab_recursos` (`folder._eq = <folderId>`).
 * - Para archivos pertenecientes a otras apps en `admin.plai.mx`, Directus responde 403
 *   y esta ruta lo traduce a 404 para no filtrar existencia de UUIDs ajenos.
 * - Solo permite tipos de imagen rasterizados (bloquea SVG/HTML para prevenir XSS).
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { success: false, message: 'Identificador de archivo inválido.' },
      { status: 400 }
    );
  }

  if (!env.hasDirectusConfig) {
    return NextResponse.json(
      { success: false, message: 'Directus no está configurado.' },
      { status: 503 }
    );
  }

  try {
    const upstream = await fetch(`${env.directusUrl}/assets/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.directusToken}`,
      },
      cache: 'no-store',
    });

    if (upstream.status === 404 || upstream.status === 403) {
      return NextResponse.json(
        { success: false, message: 'Imagen no encontrada.' },
        { status: 404 }
      );
    }

    if (!upstream.ok) {
      logger.error('Error al consultar asset en Directus', {
        path: `/api/media/${id}`,
        status: upstream.status,
      });
      return NextResponse.json(
        { success: false, message: 'Error al recuperar la imagen.' },
        { status: 502 }
      );
    }

    const rawContentType = (upstream.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!SAFE_SERVED_MIME_TYPES.has(rawContentType)) {
      return NextResponse.json(
        { success: false, message: 'Tipo de archivo no permitido.' },
        { status: 415 }
      );
    }

    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': rawContentType,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    logger.error('Error inesperado al servir imagen desde Directus', { path: `/api/media/${id}` }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al servir la imagen.' },
      { status: 500 }
    );
  }
}
