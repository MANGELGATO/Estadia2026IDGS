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
  // 1. VARIABLE_FILE explícita (p. ej. DATABASE_URL_FILE=/run/secrets/database_url)
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
 * Configuración de entorno tipada de la aplicación (Estándar PLAi v1.0)
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
    return process.env.DIRECTUS_URL || 'https://admin.plai.mx';
  },
  get directusToken(): string {
    return getEnvSecret('DIRECTUS_TOKEN');
  },
  // Keycloak OIDC / SSO Institucional PLAi
  get keycloakClientId(): string {
    return getEnvSecret('KEYCLOAK_ID') || getEnvSecret('KEYCLOAK_CLIENT_ID') || 'plai-recursos';
  },
  get keycloakClientSecret(): string {
    return getEnvSecret('KEYCLOAK_SECRET') || getEnvSecret('KEYCLOAK_CLIENT_SECRET');
  },
  get keycloakIssuer(): string {
    return process.env.KEYCLOAK_ISSUER || 'https://auth.plai.mx/realms/plai';
  },
  get isKeycloakConfigured(): boolean {
    return Boolean(
      (process.env.KEYCLOAK_ISSUER || process.env.KEYCLOAK_ID || process.env.KEYCLOAK_ID_FILE) &&
      (this.keycloakClientSecret || !this.isProduction)
    );
  },
  get nextAuthUrl(): string {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  },
  get nextAuthSecret(): string {
    const configured = getEnvSecret('NEXTAUTH_SECRET');
    if (configured) {
      return configured;
    }
    if (this.isProduction) {
      throw new Error(
        'CRÍTICO: NEXTAUTH_SECRET es obligatorio en producción (usar Docker secret /run/secrets/nextauth_secret o NEXTAUTH_SECRET_FILE).'
      );
    }
    return 'plai-local-development-secret-only-change-in-production';
  },
  // PostgreSQL / Neon (Estándar PLAi: PostgreSQL 15/16)
  get databaseUrl(): string {
    return getEnvSecret('DATABASE_URL');
  },
  get dbHost(): string {
    return process.env.PGHOST || process.env.DB_HOST || '';
  },
  get dbPort(): number {
    const p = parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10);
    return Number.isNaN(p) ? 5432 : p;
  },
  get dbUser(): string {
    return process.env.PGUSER || process.env.DB_USER || '';
  },
  get dbPassword(): string {
    return getEnvSecret('PGPASSWORD') || getEnvSecret('DB_PASSWORD');
  },
  get dbName(): string {
    return process.env.PGDATABASE || process.env.DB_NAME || 'plai_recursos';
  },
  get dbSsl(): boolean {
    if (process.env.DB_SSL === 'true') return true;
    if (process.env.DB_SSL === 'false') return false;
    const url = this.databaseUrl.toLowerCase();
    return url.includes('sslmode=require') || url.includes('neon.tech');
  },
  get hasDatabaseConfig(): boolean {
    return Boolean(this.databaseUrl || (this.dbHost && this.dbUser));
  },
};
