import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Estándar Tecnológico PLAi v1.0 — Sección 7: Seguridad de la Aplicación.
 * Requisito [OBLIGATORIO] P3: Rate Limiting en Login, Formularios Públicos y Endpoints Costosos.
 *
 * Implementación de ventana deslizante en memoria (Sliding Window Log)
 * para mitigar ataques de fuerza bruta (credential stuffing), spam de reservaciones
 * y denegación de servicio (DoS) sin requerir dependencias externas adicionales.
 */

export interface RateLimitOptions {
  /** Número máximo de solicitudes permitidas dentro de la ventana de tiempo */
  limit: number;
  /** Duración de la ventana en milisegundos */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp en milisegundos cuando la ventana se libera
}

// Presets recomendados según la criticidad del endpoint
export const RATE_LIMIT_LOGIN: RateLimitOptions = {
  limit: 5, // Máximo 5 intentos por minuto para prevenir fuerza bruta
  windowMs: 60 * 1000,
};

export const RATE_LIMIT_LOGIN_PAGE: RateLimitOptions = {
  limit: 30, // Máximo 30 peticiones por minuto para la vista /login
  windowMs: 60 * 1000,
};

export const RATE_LIMIT_MUTATION: RateLimitOptions = {
  limit: 10, // Máximo 10 solicitudes de reservación o espacios por minuto por IP
  windowMs: 60 * 1000,
};

export class MemoryRateLimiter {
  private hits = new Map<string, number[]>();
  private lastCleanup = Date.now();

  /**
   * Verifica y registra una petición contra el identificador de cliente dado.
   */
  public check(key: string, options: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    this.maybeCleanup(now);

    const windowStart = now - options.windowMs;
    const timestamps = (this.hits.get(key) || []).filter((time) => time > windowStart);

    if (timestamps.length >= options.limit) {
      const oldestInWindow = timestamps[0] || now;
      const reset = oldestInWindow + options.windowMs;

      return {
        success: false,
        limit: options.limit,
        remaining: 0,
        reset,
      };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);

    const oldestInWindow = timestamps[0];
    const reset = oldestInWindow + options.windowMs;

    return {
      success: true,
      limit: options.limit,
      remaining: Math.max(0, options.limit - timestamps.length),
      reset,
    };
  }

  /**
   * Limpia el registro para pruebas o restablecimiento manual.
   */
  public reset(key?: string): void {
    if (key) {
      this.hits.delete(key);
    } else {
      this.hits.clear();
    }
  }

  /**
   * Limpieza perezosa para evitar fugas de memoria por llaves antiguas.
   */
  private maybeCleanup(now: number): void {
    // Ejecutar limpieza como máximo una vez cada 5 minutos
    if (now - this.lastCleanup < 5 * 60 * 1000) {
      return;
    }

    this.lastCleanup = now;
    const maxWindow = 15 * 60 * 1000; // 15 minutos de tolerancia
    const cutoff = now - maxWindow;

    for (const [key, timestamps] of this.hits.entries()) {
      const active = timestamps.filter((time) => time > cutoff);
      if (active.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, active);
      }
    }
  }
}

// Instancia singleton compartida en el runtime
export const rateLimiter = new MemoryRateLimiter();

/**
 * Función utilitaria rápida para verificar límites con la instancia global.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  return rateLimiter.check(key, options);
}

/**
 * Extrae la dirección IP del cliente a partir de los encabezados del proxy o socket.
 * Compatible con la topología de red de PLAi: Traefik v3 -> Nginx -> Next.js.
 */
export function getClientIp(request: Request | NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }

  if ('ip' in request && typeof (request as unknown as { ip?: string }).ip === 'string') {
    const ip = (request as unknown as { ip?: string }).ip;
    if (ip) return ip;
  }

  return '127.0.0.1';
}

/**
 * Genera una respuesta estándar HTTP 429 Too Many Requests con cabeceras normativas.
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const now = Date.now();
  const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - now) / 1000));

  return NextResponse.json(
    {
      success: false,
      error: 'Too Many Requests',
      message: 'Has excedido el límite de solicitudes permitidas. Por favor, espera unos momentos antes de reintentar.',
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
      },
    }
  );
}
