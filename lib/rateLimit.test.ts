import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MemoryRateLimiter,
  getClientIp,
  createRateLimitResponse,
} from './rateLimit';
import { NextRequest } from 'next/server';

describe('Rate Limiter Module (Estándar PLAi - Sección 7.3)', () => {
  let limiter: MemoryRateLimiter;

  beforeEach(() => {
    limiter = new MemoryRateLimiter();
  });

  describe('MemoryRateLimiter & Sliding Window', () => {
    it('permite peticiones dentro del límite establecido y calcula remanentes', () => {
      const options = { limit: 3, windowMs: 10000 };

      const r1 = limiter.check('client-1', options);
      expect(r1.success).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = limiter.check('client-1', options);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = limiter.check('client-1', options);
      expect(r3.success).toBe(true);
      expect(r3.remaining).toBe(0);
    });

    it('bloquea peticiones cuando se supera el límite con success: false', () => {
      const options = { limit: 2, windowMs: 5000 };

      limiter.check('client-attacker', options);
      limiter.check('client-attacker', options);

      const blocked = limiter.check('client-attacker', options);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.limit).toBe(2);
      expect(blocked.reset).toBeGreaterThan(Date.now());
    });

    it('aísla contadores entre clientes distintos', () => {
      const options = { limit: 2, windowMs: 5000 };

      limiter.check('client-a', options);
      limiter.check('client-a', options);
      const blockedA = limiter.check('client-a', options);
      expect(blockedA.success).toBe(false);

      const allowedB = limiter.check('client-b', options);
      expect(allowedB.success).toBe(true);
      expect(allowedB.remaining).toBe(1);
    });

    it('limpia contadores individuales con reset(key) o globales con reset()', () => {
      const options = { limit: 1, windowMs: 5000 };

      limiter.check('client-x', options);
      expect(limiter.check('client-x', options).success).toBe(false);

      limiter.reset('client-x');
      expect(limiter.check('client-x', options).success).toBe(true);

      limiter.check('client-y', options);
      limiter.reset();
      expect(limiter.check('client-y', options).success).toBe(true);
    });

    it('permite nuevas peticiones después de que expira la ventana de tiempo', () => {
      vi.useFakeTimers();
      try {
        const options = { limit: 1, windowMs: 1000 };

        const r1 = limiter.check('time-user', options);
        expect(r1.success).toBe(true);

        const r2 = limiter.check('time-user', options);
        expect(r2.success).toBe(false);

        // Avanzar el tiempo 1.5 segundos
        vi.advanceTimersByTime(1500);

        const r3 = limiter.check('time-user', options);
        expect(r3.success).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('getClientIp', () => {
    it('obtiene la primera IP de la cabecera x-forwarded-for en proxies inversos', () => {
      const req = new NextRequest('http://localhost:3000/api/reservas', {
        headers: { 'x-forwarded-for': '187.189.12.34, 10.0.0.1, 10.0.0.2' },
      });
      expect(getClientIp(req)).toBe('187.189.12.34');
    });

    it('obtiene la IP desde x-real-ip si x-forwarded-for está ausente', () => {
      const req = new NextRequest('http://localhost:3000/api/reservas', {
        headers: { 'x-real-ip': '201.120.45.67' },
      });
      expect(getClientIp(req)).toBe('201.120.45.67');
    });

    it('obtiene la IP desde cf-connecting-ip si está presente', () => {
      const req = new NextRequest('http://localhost:3000/api/reservas', {
        headers: { 'cf-connecting-ip': '189.200.10.5' },
      });
      expect(getClientIp(req)).toBe('189.200.10.5');
    });

    it('devuelve 127.0.0.1 por defecto si no existen cabeceras de proxy', () => {
      const req = new NextRequest('http://localhost:3000/api/reservas');
      expect(getClientIp(req)).toBe('127.0.0.1');
    });
  });

  describe('createRateLimitResponse', () => {
    it('genera una respuesta HTTP 429 con cabeceras estándar de rate limiting', async () => {
      const now = Date.now();
      const mockResult = {
        success: false,
        limit: 5,
        remaining: 0,
        reset: now + 30000, // 30 segundos restantes
      };

      const res = createRateLimitResponse(mockResult);

      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBeDefined();
      expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(res.headers.get('X-RateLimit-Reset')).toBe(String(Math.ceil((now + 30000) / 1000)));

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Too Many Requests');
      expect(body.message).toContain('Has excedido el límite');
      expect(body.retryAfter).toBeGreaterThanOrEqual(1);
    });
  });
});
