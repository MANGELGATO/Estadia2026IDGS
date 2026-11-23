# Guía de Montaje, Base de Datos e Integración con PLAi

**Proyecto:** Plataforma de Gestión de Recursos y Espacios de PLAi (`plai-recursos-espacios`)  
**Alineación normativa:** Estándar Tecnológico para Proyectos de Software de PLAi v1.0  
**Stack:** Next.js 16 (App Router, `output: 'standalone'`) · React 19 · TypeScript 5 · Tailwind CSS 4 · NextAuth.js 4.24 · PostgreSQL 16 / Neon · Docker Swarm

---

## 1. Requisitos Previos

| Herramienta | Versión requerida | Uso |
| :--- | :--- | :--- |
| **Node.js** | `22.x` LTS | Runtime de desarrollo y compilación (`engines.node: 22.x`). |
| **pnpm** | `11.x` | Gestor de paquetes (`corepack enable` respeta `packageManager`). |
| **PostgreSQL / Neon** | PostgreSQL `15` o `16` (Neon compatible) | Base de datos relacional única del sistema. |
| **psql** (opcional) | PostgreSQL client 15+ | Ejecución directa de scripts SQL desde terminal (también puede usarse el SQL Editor de Neon). |
| **Docker Engine + Compose v2** | `24+` | Construcción de imagen multi-etapa y despliegue en Docker Swarm de PLAi. |
| **Trivy** (producción) | Reciente | Escaneo obligatorio de vulnerabilidades antes de publicar la imagen. |

---

## 2. Instalación de Dependencias

Clona el repositorio e instala las dependencias respetando exactamente el lockfile (`pnpm-lock.yaml`):

```bash
git clone <URL_DEL_REPOSITORIO_PLAI>
cd Estadia2026IDGS
corepack enable
pnpm install --frozen-lockfile
```

---

## 3. Configuración de Variables de Entorno

Crea el archivo local a partir de la plantilla documentada [`.env.example`](./.env.example):

```bash
cp .env.example .env.local
```

> **Seguridad (Estándar PLAi v1.0, Sección 6):** Nunca almacenes credenciales reales en el repositorio ni dentro de la imagen Docker. En producción, PLAi crea los secretos en Docker Swarm y los monta en `/run/secrets/<nombre>` utilizando el patrón `VARIABLE_FILE` implementado en [`lib/env.ts`](./lib/env.ts).

| Variable | ¿Secreta? | Obligatoria | Descripción y ejemplo |
| :--- | :---: | :---: | :--- |
| `NODE_ENV` | No | Sí | `development` en local, `production` en servidor. |
| `PORT` | No | Sí | Puerto interno de escucha (`3000`). |
| `HOSTNAME` | No | Sí | Interfaz de escucha dentro del contenedor (`0.0.0.0`). |
| `NEXT_TELEMETRY_DISABLED` | No | Recomendado | `1` para desactivar telemetría de Next.js. |
| `NEXT_PUBLIC_SITE_URL` | No | Sí | URL pública del portal (ej. `https://recursos.plai.mx`). No colocar secretos aquí. |
| `NEXTAUTH_URL` | No | Sí | URL canónica para callbacks de NextAuth (ej. `https://recursos.plai.mx`). |
| `NEXTAUTH_SECRET` / `NEXTAUTH_SECRET_FILE` | **Sí** | Sí | Clave aleatoria de al menos 32 bytes para firmar JWT (`openssl rand -base64 32`). En Swarm: `/run/secrets/nextauth_secret`. |
| `DATABASE_URL` / `DATABASE_URL_FILE` | **Sí** | Sí | Cadena de conexión PostgreSQL/Neon (`postgresql://usuario:clave@host/db?sslmode=require`). En Swarm: `/run/secrets/database_url`. |
| `DB_SSL` | No | Opcional | `true` o `false`. Se activa automáticamente si `DATABASE_URL` contiene `neon.tech` o `sslmode=require`. |
| `DIRECTUS_URL` / `DIRECTUS_TOKEN(_FILE)` | **Token** | Opcional | Reservadas para sincronización futura con el CMS Directus de PLAi (solo servidor). |

---

## 4. Configuración de la Base de Datos (Neon / PostgreSQL 16)

Los scripts SQL viven en la carpeta [`database/`](./database/) y son **100% compatibles con PostgreSQL 15/16 y Neon**, además de ser **idempotentes y repetibles** (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ON CONFLICT DO NOTHING`): no borran tablas ni duplican registros al re-ejecutarse.

### 4.1 Orden de ejecución de scripts

1. **[`database/01_schema_postgresql.sql`](./database/01_schema_postgresql.sql):** crea las 10 tablas del sistema (`usuarios`, `categorias`, `equipos`, `aplicaciones`, `espacios`, `reservaciones`, `bitacora_uso`, `incidencias_mantenimiento`, `cursos_agenda`, `configuracion_sistema`), sus llaves foráneas, restricciones `CHECK`, índices y triggers `updated_at`.
2. **[`database/02_seed_postgresql.sql`](./database/02_seed_postgresql.sql):** inserta de manera segura las 5 categorías tecnológicas, los 27 activos de laboratorio, las 15 aplicaciones VR/PC, los 4 espacios físicos y la configuración general inicial.

### 4.2 Ejecución en Neon o PostgreSQL

**Opción A — Desde terminal con `psql`:**

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/01_schema_postgresql.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/02_seed_postgresql.sql
```

**Opción B — Desde Neon Console (SQL Editor):**

1. Crea un proyecto en [console.neon.tech](https://console.neon.tech/) con **PostgreSQL 16**.
2. Abre **SQL Editor**, pega y ejecuta `database/01_schema_postgresql.sql`.
3. A continuación pega y ejecuta `database/02_seed_postgresql.sql`.
4. Copia la cadena de conexión **Pooled** (`?sslmode=require`) en `DATABASE_URL` (local) o en el Docker secret `database_url` (producción).

### 4.3 Alta del usuario administrador inicial (sin contraseñas en texto plano)

El repositorio **no contiene cuentas de demostración ni contraseñas en texto plano**. Para dar de alta el primer administrador institucional:

1. Genera el hash `scrypt` seguro con Node.js 22:

```bash
node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');const k=c.scryptSync(process.argv[1],s,64).toString('hex');console.log('scrypt$'+s+'$'+k)" "TU_CONTRASEÑA_SEGURA"
```

2. Ejecuta el `INSERT` en Neon / PostgreSQL sustituyendo `<HASH_SCRYPT_GENERADO>`:

```sql
INSERT INTO usuarios (id, nombre, email, password_hash, rol, estado, dependencia)
VALUES (
  'usr-admin-plai',
  'Administrador de Plataforma PLAi',
  'admin@plai.mx',
  '<HASH_SCRYPT_GENERADO>',
  'admin',
  'Activo',
  'Área de Tecnología e Infraestructura PLAi'
)
ON CONFLICT (email) DO NOTHING;
```

Una vez dentro de `/admin/usuarios`, el administrador podrá dar de alta cuentas adicionales con rol **Administrador** (`admin`), **Colaborador** (`colaborador`) o **Usuario Final** (`usuario`), guardando siempre sus contraseñas con hash `scrypt`.

---

## 5. Ejecución en Desarrollo Local

1. Verifica que `.env.local` tenga configurados `DATABASE_URL`, `NEXTAUTH_URL` y `NEXTAUTH_SECRET`.
2. Levanta el servidor de desarrollo:

```bash
pnpm dev
```

3. Abre `http://localhost:3000`.
4. Comandos de verificación de calidad antes de cada commit o entrega:

```bash
pnpm exec tsc --noEmit   # Verificación estricta de TypeScript
pnpm lint                # ESLint 9 (debe pasar sin errores)
pnpm test                # Suite automatizada Vitest
pnpm build               # Compilación standalone de producción
```

---

## 6. Preparación y Despliegue para Producción (Docker Swarm PLAi)

El proyecto cumple los controles de la Sección 5 del Estándar PLAi v1.0:

- **Dockerfile multi-etapa** ([`Dockerfile`](./Dockerfile)): base fija `node:22-alpine3.22`, salida `standalone`, usuario no root (`UID 1001`), `tini` como PID 1, puerto `3000` y `HEALTHCHECK` contra `/api/health`.
- **Stack Swarm** ([`docker-compose.yml`](./docker-compose.yml)): `read_only: true`, `cap_drop: [ALL]`, `no-new-privileges: true`, límites de recursos (`0.50 CPU`, `512M RAM`), `tmpfs` únicamente en `/tmp` y `/app/.next/cache`, sin puertos publicados (tráfico mediante Traefik v3 y red overlay cifrada).

### Construcción, prueba local con restricciones Swarm y escaneo Trivy

```bash
# 1. Construir imagen con etiqueta fija (nunca :latest)
docker build -t plai-recursos-espacios:1.0.0 .

# 2. Escaneo obligatorio de vulnerabilidades (bloquea CRITICAL/HIGH corregibles)
trivy image plai-recursos-espacios:1.0.0 --severity HIGH,CRITICAL

# 3. Prueba local simulando restricciones de Docker Swarm
docker run --rm -p 3000:3000 \
  --read-only --tmpfs /tmp --tmpfs /app/.next/cache \
  --cap-drop ALL --security-opt no-new-privileges:true \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e NEXTAUTH_SECRET="<secreto-32-bytes>" \
  -e DATABASE_URL="<cadena-postgresql-neon>" \
  plai-recursos-espacios:1.0.0

# 4. Verificar endpoint de salud (debe responder 200 sin autenticación en < 1s)
curl http://localhost:3000/api/health
```

---

## 7. Pasos Exactos para Integración con el Sistema Principal de PLAi

1. **Publicar imagen en registro privado de PLAi:**
   ```bash
   docker tag plai-recursos-espacios:1.0.0 <REGISTRY_PLAI>/plai-recursos-espacios:1.0.0
   docker push <REGISTRY_PLAI>/plai-recursos-espacios:1.0.0
   ```
2. **Aprovisionar base de datos PostgreSQL 16 / Neon:**
   - Ejecutar `database/01_schema_postgresql.sql` y `database/02_seed_postgresql.sql`.
   - Dar de alta el usuario administrador inicial (Sección 4.3).
3. **Crear Docker Secrets en el clúster Swarm de PLAi:**
   ```bash
   printf '%s' "<VALOR_NEXTAUTH_SECRET>" | docker secret create nextauth_secret -
   printf '%s' "<CADENA_POSTGRESQL_O_NEON>" | docker secret create database_url -
   ```
4. **Ajustar valores de entorno en [`docker-compose.yml`](./docker-compose.yml):**
   - Sustituir `image` por la ruta del registro privado de PLAi.
   - Sustituir `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_URL` y la regla `Host(...)` de Traefik por el dominio institucional definitivo.
   - Confirmar el nombre exacto de la red overlay (`plai_internal`).
5. **Desplegar el stack:**
   ```bash
   docker stack deploy -c docker-compose.yml plai-recursos
   ```
6. **Integración opcional de SSO / Proveedor de Identidad institucional:**
   - Agregar el proveedor OIDC/OAuth de PLAi en `providers` dentro de [`lib/auth.ts`](./lib/auth.ts) mapeando el rol devuelto por el IdP a `'admin' | 'colaborador' | 'usuario'` en el callback `jwt`.
7. **Verificación post-despliegue:**
   - `GET /api/health` responde `200 {"status":"ok",...}`.
   - Acceso anónimo a `/admin` y `/usuario` redirige a `/login`.
   - Petición sin sesión a `POST /api/equipos` o `GET /api/usuarios` responde `401`.
   - Usuario con rol `usuario` recibe `403` en endpoints administrativos y es redirigido a `/usuario` si intenta abrir `/admin`.

---

## 8. Matriz de Permisos (RBAC — Frontend + Backend)

| Recurso / Endpoint | Público | `usuario` | `colaborador` | `admin` |
| :--- | :---: | :---: | :---: | :---: |
| `/`, `/categorias`, `/equipos`, `/aplicaciones`, `/espacios`, `/api/health` | Lectura | Lectura | Lectura | Lectura |
| `GET /api/equipos`, `GET /api/aplicaciones`, `GET /api/categorias` | Sí | Sí | Sí | Sí |
| `/usuario/*`, `POST /api/reservas`, `POST /api/solicitudes-espacios`, `GET/POST /api/cursos` | No (401) | Sí (propios) | Sí | Sí |
| `GET /api/reservaciones` | No (401) | Solo propias | Todas | Todas |
| `/admin`, `/admin/inventario`, `/admin/bitacora`, `/admin/mantenimiento`, `/admin/reservaciones`, `/admin/reportes` | No | No (redir.) | Sí | Sí |
| `PUT /api/reservaciones`, `/api/bitacora`, `/api/mantenimiento` | No (401) | No (403) | Sí | Sí |
| `/admin/usuarios`, `/admin/configuracion`, `/admin/categorias`, `POST/DELETE /api/equipos`, `POST/DELETE /api/aplicaciones`, `POST /api/categorias`, `/api/usuarios`, `/api/configuracion` | No (401) | No (403) | No (403) | Sí |

---

## 9. Errores Comunes y Soluciones

| Síntoma / Error | Causa probable | Solución |
| :--- | :--- | :--- |
| `no pg_hba.conf entry for host ... SSL off` o fallo TLS en Neon | Neon exige conexiones SSL cifradas. | Asegúrate de incluir `?sslmode=require` en `DATABASE_URL` o definir `DB_SSL=true`. |
| `Credenciales inválidas` al intentar iniciar sesión | No existe registro en `usuarios` o `password_hash` no tiene formato `scrypt$<salt>$<hash>`. | Ejecuta el alta de administrador de la Sección 4.3 usando el generador `scrypt` de Node.js 22. |
| `EROFS: read-only file system` dentro de Docker | Algún proceso intenta escribir fuera de `/tmp` o `/app/.next/cache`. | Verifica que `DATABASE_URL` esté configurado (la app persiste únicamente en PostgreSQL/Neon y nunca escribe en disco). |
| `429 Too Many Requests` en `/login` o `/api/reservas` | Se activó el Rate Limiting normativo (5 intentos/min en auth, 10/min en reservas). | Esperar el tiempo indicado en la cabecera `Retry-After` (60 s). |
| `500` al construir o iniciar en producción sin sesión | Falta `NEXTAUTH_SECRET` o `NEXTAUTH_SECRET_FILE`. | Crea el Docker secret `nextauth_secret` con al menos 32 bytes aleatorios. |
| Imágenes del footer rotas (404) en servidor Linux | Diferencia de mayúsculas/minúsculas en rutas de `public/images/FOOTERIMG/`. | Mantener la ruta exacta `/images/FOOTERIMG/...` (ya corregida en `Footer.tsx`). |
