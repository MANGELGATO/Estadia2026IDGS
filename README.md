# Plataforma de Gestión de Recursos y Espacios — PLAi

Sistema web institucional para el catálogo, reservación, control de bitácora y mantenimiento de equipamiento tecnológico y espacios del Laboratorio de Innovación de PLAi (**SOLUCIONES PLAi**).

## Arquitectura Técnica (Estándar PLAi v1.0)

- **Frontend y Backend:** Next.js 16 (App Router, `output: 'standalone'`), React 19, TypeScript 5, Tailwind CSS 4, CSP dinámica con *nonce* criptográfico por petición (`proxy.ts`) y origen de Keycloak resuelto en tiempo de ejecución.
- **Autenticación y Autorización (SSO):** NextAuth.js v4 conectado exclusivamente a **Keycloak (OIDC)**, con mapeo estricto de roles de cliente (`resource_access.<client_id>.roles`), auto-registro y verificación real del estado `Activo`/`Inactivo`, y cierre de sesión federado completo (SLO en `/api/auth/federated-logout`, limpiando cookies fragmentadas).
- **Persistencia de Datos:** **100% Directus 11 REST API** (`lib/directus.ts`) sobre colecciones prefijadas (`lab_recursos_*`) administrables desde `admin.plai.mx`, con cuenta de servicio de mínimos privilegios aprovisionada automáticamente y catálogo inicial idempotente (`pnpm directus:seed`).
- **Infraestructura y Red:** Proxy inverso **NGINX Unprivileged (`1.30.7-alpine`, servicio `nginx-plai-recursos`, puerto `8443` TLS passthrough)** + red interna aislada cifrada (`plai_isolated_backend`) + red de salida cifrada (`plai_app_egress`) + imagen `node:22-alpine3.23` sin `apk` en runtime + secretos prefijados `plai_recursos_*` para Docker Swarm.

## Documentación

- **Montaje local y desarrollo:** [`INSTRUCCIONES_MONTAJE_PC.md`](./INSTRUCCIONES_MONTAJE_PC.md)
- **Despliegue en producción (Docker Swarm, Keycloak, Directus, NGINX TLS):** [`DEPLOY_SWARM.md`](./DEPLOY_SWARM.md)
- **Variables de entorno y Docker Secrets:** [`.env.example`](./.env.example)

## Comandos Principales

```bash
pnpm install --frozen-lockfile   # Instalar dependencias
pnpm directus:setup              # Crear esquema lab_recursos_* y cuenta de servicio en Directus (usa DIRECTUS_ADMIN_TOKEN)
pnpm directus:seed               # Cargar catálogo oficial inicial (27 equipos, 15 apps, 4 espacios, categorías y configuración)
pnpm dev                         # Desarrollo local
pnpm exec tsc --noEmit           # Verificación TypeScript
pnpm lint                        # ESLint
pnpm test                        # Suite de pruebas Vitest
pnpm build                       # Build de producción standalone
./deploy-production.sh           # Validación, escaneo Trivy y despliegue en Swarm con VERSION sincronizada
```
