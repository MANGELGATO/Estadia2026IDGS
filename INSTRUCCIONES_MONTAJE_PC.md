# Guía de Montaje Local e Integración — PLAi

**Proyecto:** Plataforma de Gestión de Recursos y Espacios de PLAi (`plai-recursos-espacios`)  
**Stack:** Next.js 16 (App Router, `output: 'standalone'`) · React 19 · TypeScript 5 · Tailwind CSS 4 · NextAuth.js 4 (Keycloak OIDC + SLO federado) · Directus 11 REST API · NGINX Unprivileged `1.30.7-alpine` (TLS `:8443`) · Docker Swarm.

> Para el despliegue en producción en Docker Swarm consulta [`DEPLOY_SWARM.md`](./DEPLOY_SWARM.md).

---

## 1. Requisitos Previos

| Herramienta | Versión requerida | Uso |
| :--- | :--- | :--- |
| **Node.js** | `22.x` LTS | Runtime de desarrollo y compilación (`engines.node: 22.x`). |
| **pnpm** | `11.x` | Gestor de paquetes (`corepack enable`). |
| **Docker Engine + Swarm** | `24+` | Construcción de imágenes multi-etapa (`nginx-plai-recursos` + `app`) y despliegue. |
| **Trivy** | Reciente | Escaneo obligatorio de vulnerabilidades antes de publicar imágenes. |

---

## 2. Instalación de Dependencias

```bash
git clone <URL_DEL_REPOSITORIO_PLAI>
cd Estadia2026IDGS
corepack enable
pnpm install --frozen-lockfile
```

---

## 3. Configuración de Variables de Entorno

Copia la plantilla [`.env.example`](./.env.example) a `.env.local` y sustituye los placeholders en MAYÚSCULAS (`AQUI_HACER_CAMBIOS_CORRESPONDIENTES_...`) por las direcciones de tu entorno de pruebas (Keycloak y Directus):

```bash
cp .env.example .env.local
```

> **Seguridad:**
> - Ni `DIRECTUS_URL` ni `KEYCLOAK_ISSUER` tienen valores por defecto apuntando a producción para evitar modificaciones accidentales desde equipos locales.
> - `DIRECTUS_TOKEN` (runtime de la app) debe ser exclusivamente el **token de la cuenta de servicio** con permisos limitados a `lab_recursos_*`. El token de administrador se utiliza únicamente en `DIRECTUS_ADMIN_TOKEN` al ejecutar los scripts de setup y seed.

---

## 4. Aprovisionamiento y Seed de Directus 11

La persistencia es **100% vía API REST de Directus** (no existe conexión directa a PostgreSQL ni almacenamiento temporal en memoria). Para inicializar esquema, cuenta de servicio con permisos mínimos y datos oficiales iniciales (27 equipos, 15 aplicaciones, 4 espacios, 5 categorías y configuración `general`):

```bash
# 1. Crear/actualizar colecciones lab_recursos_*, listas con opciones, fechas timestamp y cuenta de servicio
DIRECTUS_URL=https://AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_DIRECTUS_ADMIN_PLAI \
DIRECTUS_ADMIN_TOKEN="<TOKEN_ADMIN_DIRECTUS>" \
pnpm directus:setup

# 2. Cargar catálogo inicial oficial (idempotente)
DIRECTUS_URL=https://AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_DIRECTUS_ADMIN_PLAI \
DIRECTUS_ADMIN_TOKEN="<TOKEN_ADMIN_DIRECTUS>" \
pnpm directus:seed
```

---

## 5. Ejecución y Verificación de Calidad

```bash
pnpm dev                 # Servidor de desarrollo en http://localhost:3000
pnpm exec tsc --noEmit   # Verificación estricta de TypeScript
pnpm lint                # ESLint 9
pnpm test                # Suite automatizada Vitest
pnpm build               # Compilación standalone (funciona sin secretos de runtime)
```

---

## 6. Matriz de Permisos (RBAC vía Keycloak Client Roles)

Los roles se asignan únicamente en Keycloak bajo `resource_access.<client_id>.roles` y se sincronizan automáticamente en `lab_recursos_usuarios` al iniciar sesión. Desactivar un usuario (`Inactivo`) en `/admin/usuarios` bloquea inmediatamente su acceso tanto en nuevos inicios de sesión como en llamadas API activas.

| Recurso / Endpoint | Público | `usuario` | `colaborador` | `admin` |
| :--- | :---: | :---: | :---: | :---: |
| `/`, `/categorias`, `/equipos`, `/aplicaciones`, `/espacios`, `/api/health` | Lectura | Lectura | Lectura | Lectura |
| `/usuario/*`, `POST /api/reservas`, `POST /api/solicitudes-espacios`, `/api/cursos` | No (401) | Sí (propios) | Sí | Sí |
| `/admin`, `/admin/inventario`, `/admin/bitacora`, `/admin/mantenimiento`, `/admin/reservaciones`, `/admin/reportes` | No | No (redir.) | Sí | Sí |
| `/admin/usuarios`, `/admin/configuracion`, `/admin/categorias`, mutaciones de catálogo | No (401) | No (403) | No (403) | Sí |
