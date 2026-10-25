import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, sanitizeLogData } from './logger';

describe('Logger Estructurado JSON (PLAi Standard Sec. 8)', () => {
  beforeEach(() => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('emite un log estructurado en JSON con los campos normativos obligatorios', () => {
    const entry = logger.info('Petición procesada exitosamente', {
      reqId: 'req-abc-123',
      path: '/api/reservas',
      method: 'POST',
      status: 201,
    });

    expect(entry.service).toBe('plai-recursos-espacios');
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('Petición procesada exitosamente');
    expect(entry.reqId).toBe('req-abc-123');
    expect(entry.path).toBe('/api/reservas');
    expect(entry.method).toBe('POST');
    expect(entry.status).toBe(201);
    expect(new Date(entry.timestamp).getTime()).not.toBeNaN();
    expect(process.stdout.write).toHaveBeenCalledTimes(1);
  });

  it('sanitiza automáticamente campos sensibles como contraseñas y tokens', () => {
    const dirtyData = {
      user: 'admin@plai.mx',
      password: 'SuperSecretPassword123!',
      nested: {
        api_token: 'xyz987token',
        ine_document: 'INE_SCAN_SECRET.pdf',
        normalField: 'Valor normal permitido',
      },
    };

    const sanitized = sanitizeLogData(dirtyData) as Record<string, unknown>;
    expect(sanitized.user).toBe('admin@plai.mx');
    expect(sanitized.password).toBe('[REDACTED]');

    const nested = sanitized.nested as Record<string, unknown>;
    expect(nested.api_token).toBe('[REDACTED]');
    expect(nested.ine_document).toBe('[REDACTED]');
    expect(nested.normalField).toBe('Valor normal permitido');
  });

  it('logger.error dirige el mensaje a stderr con información de error', () => {
    const error = new Error('Falla en conexión');
    const entry = logger.error('Error al procesar reserva', { path: '/api/reservas' }, error);

    expect(entry.level).toBe('error');
    expect(entry.error?.message).toBe('Falla en conexión');
    expect(process.stderr.write).toHaveBeenCalledTimes(1);
  });
});
