# Lista de Pendientes — Alineación con el Estándar Tecnológico PLAi v1.0

> **Documento normativo de referencia:** `est_ndar_tecnol_gico_plai.md` (Área de Tecnología e Infraestructura, versión 1.0, 7 de octubre de 2026).  
> **Estado general del repositorio:** Proyecto completamente alineado a nivel de código fuente y arquitectura. Compilación en producción `next build` (`output: 'standalone'`), linter `eslint` (0 errores) y suite de pruebas `vitest run` (**104 pruebas unitarias en verde en 19 archivos**) funcionando al 100%.

---

## 1. Matriz de Cumplimiento Normativo (Sección 11 del Estándar)

Esta tabla resume el estado actual contra la **Lista de Verificación de Aceptación** oficial de PLAi:

| Criterio Normativo (Sec. 11) | Nivel de Exigencia | Estado Actual | Detalle técnico |
| :--- | :--- | :--- | :--- |
| **Arquitectura** | `[OBLIGATORIO]` | **CUMPLE** | Next.js 16.4 (App Router) + TypeScript 5 + React 19 + Tailwind CSS 4 + daisyUI 5. Sin frameworks monolíticos ni SaaS externos. |
| **Dockerfile** | `[OBLIGATORIO]` | **CUMPLE (Código)** | Multi-etapa (`deps` -> `build` -> `runner`), base fija `node:22-alpine3.22`, usuario `nextjs` (UID 1001), PID 1 con `tini`, puerto 3000, `HEALTHCHECK`. |
| **Compose (Swarm)** | `[OBLIGATORIO]` | **CUMPLE (Código)** | `read_only: true`, `cap_drop: [ALL]`, `no-new-privileges`, `tmpfs` en `/tmp` y cache, límites de CPU/RAM, labels Traefik v3, sin `ports` publicados. |
| **Salud** | `[OBLIGATORIO]` | **CUMPLE** | Endpoint `/api/health` (`force-dynamic`) responde 200 en milisegundos sin autenticación. |
| **Configuración** | `[OBLIGATORIO]` | **CUMPLE** | `.env.example` documentado con valores ficticios; principios 12-factor; ninguna URL ni credencial quemada en el código. |
| **Secretos** | `[OBLIGATORIO]` | **CUMPLE** | Lector `lib/env.ts` implementa patrón `VARIABLE_FILE` y lectura directa desde `/run/secrets/`. Sin secretos en Git ni en la imagen. |
| **Seguridad** | `[OBLIGATORIO]` | **CUMPLE (Código)** | NextAuth.js con sesiones JWT, Proxy RBAC en `proxy.ts`, validación Zod en servidor, rate limiting en APIs sensibles, sanitización de contraseñas y datos LFPDPPP. |
| **Autenticación** | `[OBLIGATORIO]` | **CUMPLE** | NextAuth.js 4.24 con sesiones JWT en servidor, protección perimetral de `/admin` y `/usuario` con RBAC, e interfaz `/login` con soporte institucional y modo evaluación. |
| **Calidad** | `[OBLIGATORIO]` | **CUMPLE** | ESLint 9 pasa con 0 errores; TypeScript sin errores (`tsc --noEmit`); Vitest con **104 pruebas unitarias automatizadas** (`pnpm test`). |
| **Datos** | `[OBLIGATORIO]` | **CUMPLE** | Base de datos relacional PostgreSQL 15/16 (`pg`), migraciones SQL versionadas (`database/migrations/`), seed (`database/seeds/`), scripts `pnpm db:migrate` y `pnpm db:seed-demo`. Sin dependencias de archivos JSON en ejecución. |
| **Logs** | `[OBLIGATORIO]` | **CUMPLE** | Salida a stdout/stderr sin escribir en archivos locales; formato JSON estructurado con sanitización de credenciales. |
| **Documentación** | `[OBLIGATORIO]` | **CUMPLE** | `README.md` y `INSTRUCCIONES_MONTAJE_PC.md` completos en español con arquitectura, Swarm, Docker, variables y checklist. |
| **Entrega** | `[OBLIGATORIO]` | **PENDIENTE (P9)** | Transferencia del repositorio con su historial limpio a la infraestructura de PLAi. |

---

## 2. Requisitos [OBLIGATORIO] para Despliegue en Servidor

Los requisitos de código y arquitectura están completos al 100%. Los únicos puntos pendientes requieren ejecución en el servidor o host con Docker de PLAi:

### 🔴 Verificación en Servidor / Host con Docker
- [ ] **P7. Construcción y Verificación del Contenedor (Sección 5.1).**
  - **Acción:** En un host con Docker / servidor de pruebas de PLAi:
    1. Ejecutar `docker build -t plai-recursos-espacios:0.1.0 .`
    2. Probar ejecución con las banderas de seguridad exigidas: `docker run --rm --read-only --cap-drop ALL --security-opt no-new-privileges:true --tmpfs /tmp --tmpfs /app/.next/cache:size=64M -p 3000:3000 plai-recursos-espacios:0.1.0`
    3. Verificar que el `HEALTHCHECK` marque estado `(healthy)`.
- [ ] **P8. Escaneo de Vulnerabilidades con Trivy (Secciones 5.2 y 7.6).**
  - **Acción:** Ejecutar `trivy image plai-recursos-espacios:0.1.0 --severity HIGH,CRITICAL` y asegurar que no existan vulnerabilidades críticas o altas con parche disponible.

### 🔴 Entrega del Repositorio
- [ ] **P9. Transferencia del Repositorio a PLAi (Sección 9).**
  - Realizar commit de todos los cambios con mensajes descriptivos bajo *Conventional Commits* y transferir/vincular el repositorio a la cuenta institucional de PLAi, asegurando que no dependa de credenciales ni servicios a nombre del desarrollador.

---

## 3. Requisitos Completados al 100% (Historial Verificado)

| Fase / Requisito | Descripción | Verificación |
| :--- | :--- | :--- |
| **Fase 1: Linting y Tipado** | Corrección de ESLint 9, eliminación de errores y configuración de tipado. | `pnpm lint` sale con código 0 (0 errores). |
| **Fase 2: Standalone & Health** | `output: 'standalone'` en `next.config.ts` y creación de `/api/health`. | Verificado en build Turbopack y prueba en Vitest. |
| **Fase 3: Limpieza de Firebase** | Eliminación de dependencias y código de Firebase; limpieza de `package-lock.json`; creación de `.env.example`. | Sin referencias a Firebase en todo el proyecto. |
| **Fase 4: Gestor pnpm y Node 22** | Transición a `pnpm@11.28.5`, lockfile versionado y engines fijados a Node `22.x`. | Verificado en `package.json` y lockfile. |
| **Fase 5: Contenerización Docker** | `Dockerfile` multi-etapa alpine con usuario no root (1001), `tini` y `docker-compose.yml` para Swarm con `read_only: true`. | Archivos validados sintácticamente contra la norma. |
| **Fase 6: Pruebas con Vitest** | Configuración de Vitest con jsdom y creación de **104 pruebas unitarias automatizadas** (`pnpm test`). | 104 pruebas pasan en verde en 19 archivos. |
| **Fase 7: Tailwind CSS 4 & daisyUI** | Migración integral de los 36 módulos CSS a Tailwind 4.x + daisyUI 5; depuración de variables en `globals.css`. | 0 archivos `.module.css` restantes; build sin advertencias. |
| **Fase 8: Documentación** | `README.md` e `INSTRUCCIONES_MONTAJE_PC.md` reescritos con arquitectura, comandos, variables y checklist de aceptación. | Archivos validados en raíz del proyecto. |
| **Seguridad de Autenticación** | Eliminación de cookies bypass (`plai_role`), saneamiento de contraseñas de demostración y eliminación de secretos hardcodeados. | Verificado en `proxy.ts`, `lib/auth.ts`, `app/login/page.tsx` y tests. |
| **Protección de APIs Sensibles** | Implementación de `requireSession` con verificación de sesión JWT y roles (`admin`, `usuario`) en todos los Route Handlers administrativos. | Verificado en `lib/apiAuth.ts` y pruebas de integración. |
| **Migración a PostgreSQL** | Reemplazo de MySQL por PostgreSQL 15/16 (`pg`), driver singleton transaccional (`lib/pool.ts` y `lib/db.ts`), eliminación de persistencia en archivos JSON. | Verificado con 11 pruebas sobre base de datos en memoria (`pg-mem`). |
| **Migraciones Versionadas (P5)** | Scripts DDL y DML numerados e idempotentes (`database/migrations/001_...`, `002_...`), runner `scripts/migrate.mjs` y comandos `pnpm db:migrate` y `pnpm db:seed-demo`. | Tabla `schema_migrations` verificada. |
