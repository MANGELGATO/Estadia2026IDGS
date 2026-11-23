import { env } from './env';
import { logger } from './logger';

export interface DirectusResponse<T> {
  data: T;
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

/**
 * Cliente REST ligero y seguro para interactuar con la instancia Directus de PLAi
 * (https://admin.plai.mx) conforme al Estándar Tecnológico v1.0.
 */
class DirectusClient {
  private get baseUrl(): string {
    return env.directusUrl.replace(/\/+$/, '');
  }

  private get headers(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (env.directusToken) {
      headers['Authorization'] = `Bearer ${env.directusToken}`;
    }
    return headers;
  }

  /**
   * Consulta una colección en Directus con filtros y parámetros opcionales
   */
  async getItems<T>(collection: string, queryParams: Record<string, string | number> = {}): Promise<T[]> {
    if (!this.baseUrl) {
      return [];
    }

    try {
      const url = new URL(`${this.baseUrl}/items/${collection}`);
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers,
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        logger.warn(`Error al consultar colección Directus: ${collection}`, {
          status: response.status,
          url: url.toString(),
        });
        return [];
      }

      const json: DirectusResponse<T[]> = await response.json();
      return json.data || [];
    } catch (error) {
      logger.error(`Fallo en conexión con Directus API (${collection})`, undefined, error);
      return [];
    }
  }

  /**
   * Crea un nuevo registro en una colección de Directus
   */
  async createItem<T>(collection: string, data: Partial<T>): Promise<T | null> {
    if (!this.baseUrl) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/items/${collection}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        logger.warn(`Error al crear item en Directus: ${collection}`, {
          status: response.status,
        });
        return null;
      }

      const json: DirectusResponse<T> = await response.json();
      return json.data;
    } catch (error) {
      logger.error(`Fallo al enviar item a Directus (${collection})`, undefined, error);
      return null;
    }
  }

  /**
   * Actualiza un registro existente en Directus
   */
  async updateItem<T>(collection: string, id: string | number, data: Partial<T>): Promise<T | null> {
    if (!this.baseUrl) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/items/${collection}/${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        logger.warn(`Error al actualizar item en Directus: ${collection}/${id}`, {
          status: response.status,
        });
        return null;
      }

      const json: DirectusResponse<T> = await response.json();
      return json.data;
    } catch (error) {
      logger.error(`Fallo al actualizar item en Directus (${collection}/${id})`, undefined, error);
      return null;
    }
  }
}

export const directus = new DirectusClient();
