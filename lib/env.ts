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
  /**
   * Secreto de firma de NextAuth. En producción es OBLIGATORIO (Docker secret
   * 
extauth_secret o NEXTAUTH_SECRET); sin él la aplicación se niega a firmar
   * sesiones. El valor de respaldo solo existe fuera de producción.
   */
  get nextAuthSecret(): string {
    const secret = getEnvSecret('NEXTAUTH_SECRET');
    if (secret) return secret;
    if (this.isProduction) {
      throw new Error('NEXTAUTH_SECRET no está configurado (requerido en producción).');
    }
    return 'plai-dev-only-secret-not-for-production';
  },
  /**
   * Cuentas de demostración. Habilitadas por defecto solo fuera de producción;
   * en producción requieren DEMO_LOGIN_ENABLED=true de forma explícita.
   */
  get demoLoginEnabled(): boolean {
    return !this.isProduction || process.env.DEMO_LOGIN_ENABLED === 'true';
  },
  get demoAdminPassword(): string {
    return getEnvSecret('DEMO_ADMIN_PASSWORD', this.isProduction ? '' : 'demo-admin-local');
  },
  get demoUserPassword(): string {
    return getEnvSecret('DEMO_USER_PASSWORD', this.isProduction ? '' : 'demo-user-local');
  },
  get dbHost(): string {
    return process.env.DB_HOST || '127.0.0.1';
  },
  get dbPort(): number {
    const p = parseInt(process.env.DB_PORT || '5432', 10);
    return Number.isNaN(p) ? 5432 : p;
  },
  get dbUser(): string {
    return process.env.DB_USER || 'plai';
  },
  get dbPassword(): string {
    return getEnvSecret('DB_PASSWORD');
  },
  get dbSsl(): boolean {
    return process.env.DB_SSL === 'true';
  },
  get dbName(): string {
    return process.env.DB_NAME || 'plai_recursos';
  },
};
