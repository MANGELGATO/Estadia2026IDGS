import { env } from './env';
import { logger } from './logger';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MEDIA_URL_REGEX =
  /^\/api\/media\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

declare global {
  var __plaiMediaFolderCache: { key: string; id: string } | undefined;
}

/**
 * Extrae el UUID del archivo de Directus si la URL apunta al proxy interno `/api/media/<uuid>`.
 * Devuelve `null` para imágenes locales (`/images/...`) o URLs externas.
 */
export function extractMediaFileId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(MEDIA_URL_REGEX);
  return match ? match[1] : null;
}

/**
 * Resuelve el UUID de la carpeta exclusiva de medios de esta aplicación en Directus
 * (por defecto `lab_recursos`), para aislar sus archivos del resto de aplicaciones
 * que comparten `admin.plai.mx`.
 *
 * Prioridad:
 * 1. `DIRECTUS_MEDIA_FOLDER_ID` si está definido y es un UUID válido.
 * 2. Consulta `GET /folders?filter[name][_eq]=<DIRECTUS_MEDIA_FOLDER>` usando el token de servicio
 *    (la policy solo concede `read` sobre esa carpeta exacta) y cachea el resultado en memoria.
 */
export async function resolveMediaFolderId(): Promise<string> {
  if (env.directusMediaFolderId) {
    if (!UUID_REGEX.test(env.directusMediaFolderId)) {
      throw new Error('DIRECTUS_MEDIA_FOLDER_ID no es un UUID válido.');
    }
    return env.directusMediaFolderId;
  }

  const folderName = env.directusMediaFolderName;
  const cacheKey = `${env.directusUrl}|${folderName}`;
  if (global.__plaiMediaFolderCache?.key === cacheKey) {
    return global.__plaiMediaFolderCache.id;
  }

  if (!env.hasDirectusConfig) {
    throw new Error('Directus no está configurado para resolver la carpeta de medios.');
  }

  const url = `${env.directusUrl}/folders?filter[name][_eq]=${encodeURIComponent(
    folderName
  )}&fields=id,name&limit=1`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${env.directusToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(
      `No se pudo resolver la carpeta "${folderName}" en Directus (HTTP ${res.status}). Ejecuta pnpm directus:setup.`
    );
  }

  const json = (await res.json().catch(() => null)) as {
    data?: Array<{ id?: string; name?: string }>;
  } | null;
  const folderId = json?.data?.[0]?.id;

  if (!folderId || !UUID_REGEX.test(folderId)) {
    throw new Error(
      `La carpeta exclusiva "${folderName}" no existe o no es accesible en Directus. Ejecuta pnpm directus:setup.`
    );
  }

  global.__plaiMediaFolderCache = { key: cacheKey, id: folderId };
  return folderId;
}

/**
 * Elimina un archivo de Directus Files perteneciente a la carpeta aislada `lab_recursos`.
 * Como la policy restringe `delete` sobre `directus_files` a `{ folder: { _eq: folderId } }`,
 * Directus garantiza que nunca se pueda borrar un archivo de otra aplicación.
 * Operación best-effort: si falla o ya no existe, registra advertencia sin abortar el flujo.
 */
export async function deleteDirectusMediaFile(fileId: string): Promise<boolean> {
  if (!UUID_REGEX.test(fileId) || !env.hasDirectusConfig) {
    return false;
  }

  try {
    const res = await fetch(`${env.directusUrl}/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${env.directusToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok || res.status === 404) {
      return true;
    }

    logger.warn('No se pudo eliminar archivo huérfano en Directus Files', {
      fileId,
      status: res.status,
    });
    return false;
  } catch (error) {
    logger.warn('Error de red al eliminar archivo huérfano en Directus Files', {
      fileId,
      error: String(error),
    });
    return false;
  }
}

/** Limpia la caché de carpeta (uso exclusivo en pruebas unitarias). */
export function resetMediaFolderCacheForTests(): void {
  global.__plaiMediaFolderCache = undefined;
}
