# Plataforma de Gestión de Recursos y Espacios — PLAi

Sistema web institucional para el catálogo, reservación, control de bitácora y mantenimiento de equipamiento tecnológico y espacios del Laboratorio de Innovación de PLAi.

## Arquitectura Técnica (Estándar PLAi v1.0)

- **Frontend y Backend:** Next.js 16 (App Router, `output: 'standalone'`), React 19, TypeScript 5, Tailwind CSS 4.
- **Autenticación y Autorización (SSO):** NextAuth.js v4 conectado exclusivamente a **Keycloak (OIDC)**, con mapeo estricto de roles de cliente (`resource_access.<client_id>.roles`) y cierre de sesión federado (SLO en `/api/auth/federated-logout`).
- **Persistencia de Datos:** **100% Directus REST API** (`lib/directus.ts`) sobre colecciones prefijadas (`lab_recursos_*`) administrables desde `admin.plai.mx`, sin acceso SQL directo a tablas internas y sin fallback en memoria.
- **Infraestructura y Red:** Proxy inverso **NGINX Unprivileged (`1.28-alpine`, puerto `8080`)** + red interna aislada (`plai_isolated_backend`, `internal: true`) + red de salida controlada (`plai_app_egress`) para Docker Swarm.

## Documentación

- **Montaje local y desarrollo:** [`INSTRUCCIONES_MONTAJE_PC.md`](./INSTRUCCIONES_MONTAJE_PC.md)
- **Despliegue en producción (Docker Swarm, Keycloak, Directus, NGINX):** [`DEPLOY_SWARM.md`](./DEPLOY_SWARM.md)
- **Variables de entorno y Docker Secrets:** [`.env.example`](./.env.example)

## Comandos Principales

```bash
pnpm install --frozen-lockfile   # Instalar dependencias
pnpm directus:setup              # Crear colecciones lab_recursos_* en Directus vía API oficial
pnpm dev                         # Desarrollo local
pnpm exec tsc --noEmit           # Verificación TypeScript
pnpm lint                        # ESLint
pnpm test                        # Suite de pruebas Vitest
pnpm build                       # Build de producción standalone
./deploy-production.sh           # Validación, escaneo Trivy y despliegue en Swarm
```
