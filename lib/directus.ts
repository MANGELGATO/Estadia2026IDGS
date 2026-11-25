import { env } from './env';
import { logger } from './logger';

export interface DirectusResponse<T> {
  data: T;
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

export class DirectusError extends Error {
  public readonly status: number;
  public readonly collection: string;
  public readonly details?: unknown;

  constructor(message: string, status: number, collection: string, details?: unknown) {
    super(message);
    this.name = 'DirectusError';
    this.status = status;
    this.collection = collection;
    this.details = details;
  }
}

/**
 * Resuelve el nombre completo de una colección con el prefijo exclusivo de esta app
 * (`DIRECTUS_COLLECTION_PREFIX`, por defecto `lab_recursos_`) para evitar cualquier
 * colisión con colecciones de otras aplicaciones alojadas en admin.plai.mx.
 */
export function directusCollection(baseName: string): string {
  const prefix = env.directusCollectionPrefix;
  if (baseName.startsWith(prefix)) return baseName;
  return `${prefix}${baseName}`;
}

/**
 * Cliente REST estricto para la API oficial de Directus (admin.plai.mx).
 * - Todas las lecturas usan `cache: 'no-store'` para evitar datos obsoletos tras escrituras.
 * - Todos los errores HTTP o de red se propagan mediante `DirectusError` (nunca se ocultan).
 * - No contiene URL de producción por defecto: exige `DIRECTUS_URL` y `DIRECTUS_TOKEN`.
 */
class DirectusClient {
  private ensureConfigured(collection: string): string {
    const baseUrl = env.directusUrl;
    if (!baseUrl) {
      throw new DirectusError(
        'DIRECTUS_URL no está configurado. Define la URL de Directus en las variables de entorno.',
        503,
        collection
      );
    }
    if (!env.directusToken) {
      throw new DirectusError(
        'DIRECTUS_TOKEN no está configurado (usar Docker secret /run/secrets/directus_token o DIRECTUS_TOKEN_FILE).',
        503,
        collection
      );
    }
    return baseUrl;
  }

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${env.directusToken}`,
    };
  }

  private async parseErrorBody(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      try {
        return await response.text();
      } catch {
        return undefined;
      }
    }
  }

  async ping(): Promise<boolean> {
    if (!env.hasDirectusConfig) return false;
    try {
      const response = await fetch(`${env.directusUrl}/server/ping`, {
        method: 'GET',
        cache: 'no-store',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getItems<T>(
    collection: string,
    queryParams: Record<string, string | number> = {}
  ): Promise<T[]> {
    const col = directusCollection(collection);
    const baseUrl = this.ensureConfigured(col);

    const url = new URL(`${baseUrl}/items/${encodeURIComponent(col)}`);
    if (!('limit' in queryParams)) {
      url.searchParams.set('limit', '-1');
    }
    for (const [key, value] of Object.entries(queryParams)) {
      url.searchParams.set(key, String(value));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const details = await this.parseErrorBody(response);
      logger.error(`Error HTTP ${response.status} al consultar colección Directus: ${col}`, {
        status: response.status,
        collection: col,
      });
      throw new DirectusError(
        `Error al consultar Directus (${col}): HTTP ${response.status}`,
        response.status,
        col,
        details
      );
    }

    const json: DirectusResponse<T[]> = await response.json();
    return Array.isArray(json.data) ? json.data : [];
  }

  async getItemById<T>(collection: string, id: string | number): Promise<T | null> {
    const col = directusCollection(collection);
    const baseUrl = this.ensureConfigured(col);

    const response = await fetch(
      `${baseUrl}/items/${encodeURIComponent(col)}/${encodeURIComponent(String(id))}`,
      {
        method: 'GET',
        headers: this.headers,
        cache: 'no-store',
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const details = await this.parseErrorBody(response);
      logger.error(`Error HTTP ${response.status} al leer item Directus: ${col}/${id}`, {
        status: response.status,
        collection: col,
      });
      throw new DirectusError(
        `Error al leer item en Directus (${col}/${id}): HTTP ${response.status}`,
        response.status,
        col,
        details
      );
    }

    const json: DirectusResponse<T> = await response.json();
    return json.data ?? null;
  }

  async createItem<T>(collection: string, data: Partial<T>): Promise<T> {
    const col = directusCollection(collection);
    const baseUrl = this.ensureConfigured(col);

    const response = await fetch(`${baseUrl}/items/${encodeURIComponent(col)}`, {
      method: 'POST',
      headers: this.headers,
      cache: 'no-store',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const details = await this.parseErrorBody(response);
      logger.error(`Error HTTP ${response.status} al crear item en Directus: ${col}`, {
        status: response.status,
        collection: col,
      });
      throw new DirectusError(
        `Error al crear registro en Directus (${col}): HTTP ${response.status}`,
        response.status,
        col,
        details
      );
    }

    const json: DirectusResponse<T> = await response.json();
    return json.data;
  }

  async updateItem<T>(
    collection: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    const col = directusCollection(collection);
    const baseUrl = this.ensureConfigured(col);

    const response = await fetch(
      `${baseUrl}/items/${encodeURIComponent(col)}/${encodeURIComponent(String(id))}`,
      {
        method: 'PATCH',
        headers: this.headers,
        cache: 'no-store',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const details = await this.parseErrorBody(response);
      logger.error(`Error HTTP ${response.status} al actualizar item Directus: ${col}/${id}`, {
        status: response.status,
        collection: col,
      });
      throw new DirectusError(
        `Error al actualizar registro en Directus (${col}/${id}): HTTP ${response.status}`,
        response.status,
        col,
        details
      );
    }

    const json: DirectusResponse<T> = await response.json();
    return json.data;
  }

  async upsertItem<T>(
    collection: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    const existing = await this.getItemById<T>(collection, id);
    if (existing) {
      return this.updateItem<T>(collection, id, data);
    }
    return this.createItem<T>(collection, { id, ...data } as Partial<T>);
  }

  async deleteItem(collection: string, id: string | number): Promise<void> {
    const col = directusCollection(collection);
    const baseUrl = this.ensureConfigured(col);

    const response = await fetch(
      `${baseUrl}/items/${encodeURIComponent(col)}/${encodeURIComponent(String(id))}`,
      {
        method: 'DELETE',
        headers: this.headers,
        cache: 'no-store',
      }
    );

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      const details = await this.parseErrorBody(response);
      logger.error(`Error HTTP ${response.status} al eliminar item Directus: ${col}/${id}`, {
        status: response.status,
        collection: col,
      });
      throw new DirectusError(
        `Error al eliminar registro en Directus (${col}/${id}): HTTP ${response.status}`,
        response.status,
        col,
        details
      );
    }
  }
}

export const directus = new DirectusClient();
