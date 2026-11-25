# Guía de Despliegue en Docker Swarm — PLAi (`DEPLOY_SWARM.md`)

**Proyecto:** Plataforma de Gestión de Recursos y Espacios de PLAi (`plai-recursos-espacios`)  
**Arquitectura:** Traefik (TLS passthrough) → `nginx-plai-recursos` Unprivileged `1.30.7-alpine` (`:8443` TLS 1.2/1.3) → Red Aislada Cifrada (`internal: true`, `encrypted: true`) → Next.js 16 Standalone (`:3000`, `node:22-alpine3.23` sin `apk`) → Directus API & Keycloak OIDC.

---

## 1. Placeholders Institucionales a Sustituir

Antes de desplegar, reemplaza **todas** las cadenas en MAYÚSCULAS (`AQUI_HACER_CAMBIOS_CORRESPONDIENTES_...`) en [`docker-compose.yml`](./docker-compose.yml) y al exportar variables para [`deploy-production.sh`](./deploy-production.sh):

| Placeholder | Qué colocar |
| :--- | :--- |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_REGISTRY_PLAI` | Host del registro privado de imágenes Docker de PLAi |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_DOMINIO_INSTITUCIONAL_PLAI` | Dominio FQDN definitivo de la app (ej. `recursos.plai.mx`) |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_KEYCLOAK_INSTITUCIONAL` | Host de Keycloak institucional + `/realms/<REALM>` |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_DIRECTUS_ADMIN_PLAI` | URL base de Directus (ej. `https://admin.plai.mx`) |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_RED_EXTERNA_SWARM_PLAI` | Nombre real de la red overlay donde escucha Traefik en Swarm |

---

## 2. Aprovisionamiento y Seed de Directus (Vía API Oficial)

> **Importante:** Nunca se escriben tablas ni metadatos por SQL directo en la base de datos de Directus. Todo el esquema se crea vía API REST oficial con prefijo `lab_recursos_` para no colisionar con otras aplicaciones en `admin.plai.mx`.  
> **Separación de tokens:** Los scripts de aprovisionamiento usan **`DIRECTUS_ADMIN_TOKEN`** (nunca `DIRECTUS_TOKEN`) para evitar desplegar por error el token de administrador en el contenedor de producción.

1. **Crear/actualizar esquema, listas con opciones válidas, columnas `timestamp` y cuenta de servicio con permisos mínimos:**
   ```bash
   DIRECTUS_URL=https://AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_DIRECTUS_ADMIN_PLAI \
   DIRECTUS_ADMIN_TOKEN="<TOKEN_ADMIN_TEMPORAL>" \
   DIRECTUS_COLLECTION_PREFIX=lab_recursos_ \
   pnpm directus:setup
   ```
   - El script crea las 10 colecciones, agrega campos faltantes si las colecciones ya existen, aborta con código de salida `1` si falla alguna relación, y aprovisiona automáticamente el rol/política/usuario de servicio con permisos exclusivamente CRUD sobre `lab_recursos_*`.
   - En la primera ejecución imprimirá el **token estático de servicio** para guardarlo como el Docker secret `plai_recursos_directus_token`.
2. **Cargar catálogo inicial oficial (27 equipos, 15 aplicaciones, 4 espacios, 5 categorías y configuración `general`):**
   ```bash
   DIRECTUS_URL=https://AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_DIRECTUS_ADMIN_PLAI \
   DIRECTUS_ADMIN_TOKEN="<TOKEN_ADMIN_TEMPORAL>" \
   DIRECTUS_COLLECTION_PREFIX=lab_recursos_ \
   pnpm directus:seed
   ```
   - El script es idempotente: consulta existencia con filtros Directus 11 (`filter[id][_eq]`) y omite registros ya existentes sin duplicarlos.

---

## 3. Configuración en Keycloak (OIDC + RBAC estricto + SLO)

1. Crea un cliente **Confidential** en el realm institucional de PLAi.
2. Configura las URIs permitidas:
   - **Valid Redirect URIs:** `https://<DOMINIO>/api/auth/callback/keycloak`
   - **Valid Post Logout Redirect URIs:** `https://<DOMINIO>/login`
3. Define los **Client Roles** exactos dentro de este cliente (`resource_access.<client_id>.roles`):
   - `admin` → Acceso completo a `/admin/*` y endpoints administrativos.
   - `colaborador` → Gestión operativa (reservaciones, bitácora, mantenimiento).
   - `usuario` → Portal `/usuario/*` y solicitudes propias (rol por defecto).
   - *Seguridad:* La app **ignora** `realm_access.roles` y `groups` globales para impedir escalamiento de privilegios desde otras apps del mismo realm.
   - *Sincronización y bloqueo:* Al iniciar sesión vía Keycloak, cada usuario queda registrado automáticamente en `lab_recursos_usuarios` con su rol real de Keycloak. Si un administrador marca una cuenta como `Inactivo`, el acceso queda bloqueado tanto en nuevos logins como en sesiones activas.
   - *Logout federado:* Todos los botones de cierre de sesión redirigen a `/api/auth/federated-logout`, limpiando dinámicamente todas las cookies de sesión (incluidos fragmentos `.0`, `.1`, etc.) y cerrando la sesión en Keycloak.

---

## 4. Creación Segura de Docker Secrets en Swarm (Prefijo `plai_recursos_`)

> **Nunca** escribas el valor real del secreto como argumento en la línea de comandos (quedaría en `~/.bash_history`). Usa archivos temporales con permisos `600` (y elimínalos con `shred -u`) o lectura silenciosa con `read -rs`:

```bash
# 1. Secreto de sesión NextAuth (generado sin pasar por historial)
openssl rand -base64 32 | tr -d '\n' | docker secret create plai_recursos_nextauth_secret -

# 2. Credenciales interactivas sin eco en terminal ni historial
read -rs -p "KEYCLOAK_ID: " VAL && echo && printf '%s' "$VAL" | docker secret create plai_recursos_keycloak_id - && unset VAL
read -rs -p "KEYCLOAK_SECRET: " VAL && echo && printf '%s' "$VAL" | docker secret create plai_recursos_keycloak_secret - && unset VAL
read -rs -p "DIRECTUS_SERVICE_TOKEN: " VAL && echo && printf '%s' "$VAL" | docker secret create plai_recursos_directus_token - && unset VAL

# 3. Certificado y llave privada TLS para nginx-plai-recursos (puerto 8443)
docker secret create plai_recursos_tls_cert /ruta/segura/fullchain.pem
docker secret create plai_recursos_tls_key  /ruta/segura/privkey.pem
```

*(Si la infraestructura de PLAi monta los certificados TLS por volumen/config corporativo en otra ruta, ajusta únicamente `SSL_CERT_FILE` y `SSL_KEY_FILE` en `docker-compose.yml`.)*

---

## 5. Topología de Red, TLS Passthrough y Seguridad Swarm

- **`plai_gateway_net` (externa):** Conecta Traefik exclusivamente con **`nginx-plai-recursos:8443`** mediante **TLS passthrough** (router TCP con `HostSNI` del dominio institucional).
  - El puerto `8080` de `nginx-plai-recursos` atiende únicamente `/nginx-health` (healthcheck local) y redirección `301` a HTTPS; **nunca** sirve la aplicación por HTTP plano, garantizando la persistencia de cookies `__Secure-` de NextAuth.
- **`plai_isolated_backend` (`internal: true`, `encrypted: true`):** Red privada, aislada y cifrada entre `nginx-plai-recursos` y `app:3000`. Ningún servicio externo alcanza `app` directamente.
- **`plai_app_egress` (`encrypted: true`):** Permite únicamente tráfico saliente desde `app` hacia Keycloak (OIDC) y Directus API (`admin.plai.mx`), sin puertos publicados.
- **Contenedores endurecidos:** `read_only: true`, `cap_drop: [ALL]`, `security_opt` activos (`no-new-privileges:true`, `apparmor:docker-default` y perfil seccomp por defecto o corporativo), `tmpfs` con `mode: 1023` (equivalente decimal de `01777` compatible con Docker Swarm) e imágenes sin `apk` en runtime.

---

## 6. Ejecución del Despliegue

```bash
chmod +x deploy-production.sh
VERSION=1.0.0 \
REGISTRY=AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_REGISTRY_PLAI \
GATEWAY_NET=AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_RED_EXTERNA_SWARM_PLAI \
./deploy-production.sh
```

El script exporta `VERSION` (sincronizada con `${VERSION:-1.0.0}` en `docker-compose.yml`) y valida automáticamente:
1. Estado activo de Docker Swarm.
2. Ausencia de placeholders `AQUI_HACER_CAMBIOS_CORRESPONDIENTES`.
3. Existencia de los 6 Docker Secrets prefijados (`plai_recursos_*`) y de la red overlay externa.
4. Build multi-etapa (`Dockerfile` sobre `node:22-alpine3.23` y `nginx/Dockerfile` sobre `nginxinc/nginx-unprivileged:1.30.7-alpine`) y escaneo obligatorio con **Trivy** (`HIGH,CRITICAL`).
5. Push al registro privado, despliegue del stack y verificación de réplicas.
