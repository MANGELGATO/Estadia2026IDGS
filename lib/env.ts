import fs from 'node:fs';

/**
 * Lee un valor de configuración que puede provenir de:
 * 1. La variable de archivo `<NAME>_FILE` (Docker Swarm secret montado).
 * 2. La ruta directa de secretos de Docker Swarm `/run/secrets/<name_lower>`.
 * 3. La variable de entorno directa `process.env[NAME]`.
 * 4. El valor por defecto (fallback).
 *
 * Cumple con el estándar PLAi v1.0, secciones 5.2 y 6 (patrón VARIABLE_FILE).
 */
export function getEnvSecret(name: string, fallback = ''): string {
  // 1. VARIABLE_FILE explícita (p. ej. DIRECTUS_TOKEN_FILE=/run/secrets/directus_token)
  const fileVar = process.env[`${name}_FILE`];
  if (fileVar && fs.existsSync(fileVar)) {
    try {
      return fs.readFileSync(fileVar, 'utf-8').trim();
    } catch {
      // Ignora error de lectura y pasa al siguiente método
    }
  }

  // 2. Ruta estándar de Docker secrets (/run/secrets/<nombre_en_minusculas>)
  const defaultSecretPath = `/run/secrets/${name.toLowerCase()}`;
  if (fs.existsSync(defaultSecretPath)) {
    try {
      return fs.readFileSync(defaultSecretPath, 'utf-8').trim();
    } catch {
      // Ignora error y pasa a variable de entorno
    }
  }

  // 3. Variable de entorno directa
  const directValue = process.env[name];
  if (directValue !== undefined && directValue !== '') {
    return directValue;
  }

  return fallback;
}

/**
 * Configuración de entorno tipada de la aplicación
 */
export const env = {
  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  },
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
  get port(): number {
    const p = parseInt(process.env.PORT || '3000', 10);
    return Number.isNaN(p) ? 3000 : p;
  },
  get siteUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  },
  get directusUrl(): string {
    return process.env.DIRECTUS_URL || '';
  },
  get directusToken(): string {
    return getEnvSecret('DIRECTUS_TOKEN');
  },
  get nextAuthUrl(): string {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  },
  get nextAuthSecret(): string {
    return getEnvSecret('NEXTAUTH_SECRET');
  },
};
