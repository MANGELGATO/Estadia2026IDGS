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
  // 1. VARIABLE_FILE explícita (p. ej. DIRECTUS_TOKEN_FILE=/run/secrets/plai_recursos_directus_token)
  const fileVar = process.env[`${name}_FILE`];
  if (fileVar && fs.existsSync(/*turbopackIgnore: true*/ fileVar)) {
    try {
      return fs.readFileSync(/*turbopackIgnore: true*/ fileVar, 'utf-8').trim();
    } catch {
      // Ignora error de lectura y pasa al siguiente método
    }
  }

  // 2. Rutas estándar de Docker secrets (con prefijo de la app y nombre base)
  const candidatePaths = [
    `/run/secrets/plai_recursos_${name.toLowerCase()}`,
    `/run/secrets/${name.toLowerCase()}`,
  ];
  for (const secretPath of candidatePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ secretPath)) {
      try {
        return fs.readFileSync(/*turbopackIgnore: true*/ secretPath, 'utf-8').trim();
      } catch {
        // Ignora error y prueba el siguiente origen
      }
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
 * Indica si Next.js se encuentra en fase de compilación (`next build`).
 * Evita que la validación estricta de secretos de runtime aborte el `docker build`.
 */
export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

/**
 * Configuración de entorno tipada de la aplicación.
 * IMPORTANTE: Ningún endpoint de producción (Directus ni Keycloak) tiene valores
 * por defecto que apunten a servidores reales para evitar escrituras accidentales desde local.
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

  // --- Directus CMS (sin default a producción para evitar escrituras accidentales) ---
  get directusUrl(): string {
    return (process.env.DIRECTUS_URL || '').replace(/\/+$/, '');
  },
  get directusToken(): string {
    return getEnvSecret('DIRECTUS_TOKEN');
  },
  get directusCollectionPrefix(): string {
    return process.env.DIRECTUS_COLLECTION_PREFIX || 'lab_recursos_';
  },
  get directusMediaFolderName(): string {
    return (process.env.DIRECTUS_MEDIA_FOLDER || 'lab_recursos').trim();
  },
  get directusMediaFolderId(): string {
    return (process.env.DIRECTUS_MEDIA_FOLDER_ID || '').trim();
  },
  get hasDirectusConfig(): boolean {
    return Boolean(this.directusUrl && this.directusToken);
  },

  // --- Keycloak OIDC / SSO Institucional PLAi (sin secretos/URLs hardcodeados) ---
  get keycloakClientId(): string {
    return getEnvSecret('KEYCLOAK_ID') || getEnvSecret('KEYCLOAK_CLIENT_ID');
  },
  get keycloakClientSecret(): string {
    return getEnvSecret('KEYCLOAK_SECRET') || getEnvSecret('KEYCLOAK_CLIENT_SECRET');
  },
  get keycloakIssuer(): string {
    return (process.env.KEYCLOAK_ISSUER || '').replace(/\/+$/, '');
  },
  get isKeycloakConfigured(): boolean {
    return Boolean(this.keycloakIssuer && this.keycloakClientId && this.keycloakClientSecret);
  },

  // --- NextAuth.js ---
  get nextAuthUrl(): string {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  },
  get nextAuthSecret(): string {
    const configured = getEnvSecret('NEXTAUTH_SECRET');
    if (configured) {
      return configured;
    }
    // Durante `next build` dentro del Dockerfile no existen Docker secrets montados
    if (isBuildPhase()) {
      return 'build-time-placeholder-never-used-at-runtime';
    }
    if (this.isProduction) {
      throw new Error(
        'CRÍTICO: NEXTAUTH_SECRET es obligatorio en producción (usar Docker secret /run/secrets/plai_recursos_nextauth_secret o NEXTAUTH_SECRET_FILE).'
      );
    }
    return 'plai-local-development-secret-only-change-in-production';
  },
};
