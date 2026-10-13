import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import { getEnvSecret, env } from './env';

vi.mock('node:fs', () => {
  const existsSync = vi.fn();
  const readFileSync = vi.fn();
  return {
    default: { existsSync, readFileSync },
    existsSync,
    readFileSync,
  };
});

describe('getEnvSecret (Patrón VARIABLE_FILE y Docker Secrets)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.mocked(fs.existsSync).mockReturnValue(false);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('retorna la variable de entorno directa cuando no hay archivo', () => {
    process.env.TEST_SECRET = 'direct-value-123';
    expect(getEnvSecret('TEST_SECRET')).toBe('direct-value-123');
  });

  it('retorna fallback cuando la variable no existe', () => {
    expect(getEnvSecret('INEXISTENTE', 'mi-default')).toBe('mi-default');
  });

  it('prioriza leer el archivo especificado en <NAME>_FILE si existe', () => {
    process.env.TEST_TOKEN = 'token-directo';
    process.env.TEST_TOKEN_FILE = '/run/secrets/custom_token';

    vi.mocked(fs.existsSync).mockImplementation((path) => path === '/run/secrets/custom_token');
    vi.mocked(fs.readFileSync).mockReturnValue('token-desde-archivo\n');

    expect(getEnvSecret('TEST_TOKEN')).toBe('token-desde-archivo');
  });

  it('lee desde /run/secrets/<nombre_minusculas> si existe por defecto', () => {
    vi.mocked(fs.existsSync).mockImplementation((path) => path === '/run/secrets/directus_token');
    vi.mocked(fs.readFileSync).mockReturnValue('directus-secret-from-swarm ');

    expect(getEnvSecret('DIRECTUS_TOKEN')).toBe('directus-secret-from-swarm');
  });

  it('hace fallback a variable directa si la lectura del archivo falla', () => {
    process.env.FAIL_TOKEN_FILE = '/run/secrets/fail_token';
    process.env.FAIL_TOKEN = 'fallback-val';

    vi.mocked(fs.existsSync).mockImplementation((path) => path === '/run/secrets/fail_token');
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    expect(getEnvSecret('FAIL_TOKEN')).toBe('fallback-val');
  });
});

describe('env accessor object', () => {
  it('resuelve los puertos y urls predeterminados adecuadamente', () => {
    expect(env.port).toBe(3000);
    expect(env.siteUrl).toBe('http://localhost:3000');
    expect(typeof env.isProduction).toBe('boolean');
  });
});
