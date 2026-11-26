import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '../../../lib/authGuard';
import { env } from '../../../lib/env';
import { logger } from '../../../lib/logger';
import { resolveMediaFolderId } from '../../../lib/directusMedia';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Sube una imagen a Directus Files desde el servidor (el token de servicio nunca sale al navegador).
 * Devuelve `{ id, url: '/api/media/<id>' }` para servirla desde el mismo origen (CSP `img-src 'self'`).
 */
export async function POST(req: NextRequest) {
  const auth = await requireSession(['admin']);
  if (auth.errorResponse) return auth.errorResponse;

  if (!env.hasDirectusConfig) {
    return NextResponse.json(
      { success: false, message: 'Directus no está configurado en este entorno.' },
      { status: 503 }
    );
  }

  try {
    const incomingForm = await req.formData();
    const file = incomingForm.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'Debes adjuntar un archivo de imagen en el campo "file".' },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Formato de imagen no permitido. Usa PNG, JPG, WEBP o GIF.',
        },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: 'La imagen debe pesar entre 1 byte y 5 MB.',
        },
        { status: 400 }
      );
    }

    const folderId = await resolveMediaFolderId();

    const safeFileName = (file.name || 'imagen-plai')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 120);

    const bytes = await file.arrayBuffer();
    const outboundForm = new FormData();
    // IMPORTANTE en Directus multipart POST /files: `folder` y `title` DEBEN ir antes de `file`
    outboundForm.append('folder', folderId);
    outboundForm.append('title', safeFileName);
    outboundForm.append('file', new Blob([bytes], { type: file.type }), safeFileName);

    const directusRes = await fetch(`${env.directusUrl}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.directusToken}`,
        Accept: 'application/json',
      },
      body: outboundForm,
      cache: 'no-store',
    });

    const json = await directusRes.json().catch(() => null);
    const fileId = json?.data?.id;

    if (!directusRes.ok || typeof fileId !== 'string') {
      logger.error('Error al subir archivo a Directus Files', {
        path: '/api/media',
        status: directusRes.status,
      });
      return NextResponse.json(
        {
          success: false,
          message: 'No fue posible almacenar la imagen en Directus Files.',
        },
        { status: 502 }
      );
    }

    logger.info('Imagen subida a Directus Files', {
      fileId,
      mimeType: file.type,
      size: file.size,
      actor: auth.user.email,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: fileId,
          url: `/api/media/${fileId}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error inesperado al subir imagen a Directus Files', { path: '/api/media' }, error);
    return NextResponse.json(
      { success: false, message: 'Error interno al procesar la imagen.' },
      { status: 500 }
    );
  }
}
