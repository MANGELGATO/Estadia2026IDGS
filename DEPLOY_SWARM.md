# Guía de Despliegue en Docker Swarm — PLAi (`DEPLOY_SWARM.md`)

**Proyecto:** Plataforma de Gestión de Recursos y Espacios de PLAi (`plai-recursos-espacios`)  
**Arquitectura:** Traefik (TLS passthrough) → `nginx-plai-recursos` Unprivileged (`:8443` TLS 1.2/1.3) → Red Aislada Cifrada (`internal: true`, `encrypted: true`) → Next.js 16 Standalone (`:3000`, `start_period: 40s`) → Directus API & Keycloak OIDC.

---

## 1. Placeholders Institucionales a Sustituir

Antes de desplegar, reemplaza **todas** las cadenas en MAYÚSCULAS (`AQUI_HACER_CAMBIOS_CORRESPONDIENTES_...`) en [`docker-compose.yml`](./docker-compose.yml) y al exportar variables para [`deploy-production.sh`](./deploy-production.sh):

| Placeholder | Qué colocar |
| :--- | :--- |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_REGISTRY_PLAI` | Host del registro privado de imágenes Docker de PLAi (se inyecta vía `${REGISTRY}`) |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_DOMINIO_INSTITUCIONAL_PLAI` | Dominio FQDN definitivo de la app (ej. `recursos.plai.mx`) |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_KEYCLOAK_INSTITUCIONAL` | Host de Keycloak institucional + `/realms/<REALM>` |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_DIRECTUS_ADMIN_PLAI` | URL base de Directus (ej. `https://admin.plai.mx`) |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_RED_EXTERNA_SWARM_PLAI` | Nombre real de la red overlay donde escucha Traefik en Swarm |

---

## 2. Aprovisionamiento y Seed de Directus 11 (Vía API Oficial)

> **Importante:** Nunca se escriben tablas ni metadatos por SQL directo en la base de datos de Directus. Todo el esquema se crea vía API REST oficial con prefijo `lab_recursos_` para no colisionar con otras aplicaciones en `admin.plai.mx`.  
> **Separación de tokens:** Los scripts usan **`DIRECTUS_ADMIN_TOKEN`** (nunca `DIRECTUS_TOKEN`) para no exponer un token administrativo en producción.

1. **Crear/actualizar esquema y cuenta de servicio de mínimo privilegio:**
   ```bash
   DIRECTUS_URL=https://AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_DIRECTUS_ADMIN_PLAI \
   DIRECTUS_ADMIN_TOKEN="<TOKEN_ADMIN_TEMPORAL>" \
   DIRECTUS_COLLECTION_PREFIX=lab_recursos_ \
   pnpm directus:setup -- --token-out /tmp/plai_recursos_directus_token.tmp
   ```
   - Vincula el rol y la policy en Directus 11 mediante la tabla intermedia **`directus_access`** (`POST /access` con `{ role, policy }`).
   - Aplica **mínimo privilegio**: otorga `delete` **únicamente** en `lab_recursos_equipos` y `lab_recursos_aplicaciones` (donde la app realmente borra registros) y revoca cualquier `delete` sobrante en las otras 8 colecciones (solo `create`, `read`, `update`).
   - **No imprime el token en consola/logs:** lo guarda con permisos `0600` en la ruta indicada por `--token-out` (por defecto `.directus-service-token.tmp`) y ejecuta automáticamente una **prueba de humo** (`GET /items/lab_recursos_equipos?limit=1` → HTTP `200`).
   - **Rotación de token ante filtración:** ejecuta el mismo comando añadiendo `--rotate-token` (o `ROTATE_SERVICE_TOKEN=true`), crea un nuevo secret o actualiza el servicio, y destruye el archivo temporal con `shred -u`.

2. **Cargar catálogo inicial oficial:**
   ```bash
   DIRECTUS_URL=https://AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_DIRECTUS_ADMIN_PLAI \
   DIRECTUS_ADMIN_TOKEN="<TOKEN_ADMIN_TEMPORAL>" \
   DIRECTUS_COLLECTION_PREFIX=lab_recursos_ \
   pnpm directus:seed
   ```

---

## 3. Configuración en Keycloak (OIDC + RBAC Estricto + SLO + Fail-Closed)

1. Crea un cliente **Confidential** en el realm institucional de PLAi y activa la verificación de correo (`Verify Email`).
2. Configura las URIs permitidas:
   - **Valid Redirect URIs:** `https://<DOMINIO>/api/auth/callback/keycloak`
   - **Valid Post Logout Redirect URIs:** `https://<DOMINIO>/login`
3. Define los **Client Roles** exactos en `resource_access.<client_id>.roles`:
   - `admin`, `colaborador`, `usuario` (se ignoran `realm_access.roles` y `groups` globales).
4. **Vinculación segura por correo (`email_verified`):** En el primer inicio de sesión, un perfil pre-registrado manualmente por correo solo se vincula si Keycloak confirma `email_verified: true`. Si no está verificado, se deniega el acceso (`EmailNotVerified`).
5. **Política Fail-Closed ante caída de Directus:** Si Directus no responde durante `signIn` (`lib/auth.ts`) o durante `requireSession` (`lib/authGuard.ts`), el sistema **deniega el acceso** (`ServiceUnavailable` / HTTP `503`) en lugar de permitir el paso, garantizando que una cuenta marcada como `Inactivo` nunca pueda evadir el bloqueo durante una interrupción de Directus.
6. **Cierre de sesión federado (anti-Logout CSRF):** `/api/auth/federated-logout` solo acepta **`POST`** con validación de `Origin` contra `Host` (rechaza `GET` con `405`), expira todas las cookies locales (incluidos fragmentos `.0`, `.1`, ...) y devuelve la URL de `end_session_endpoint` de Keycloak.

---

## 4. Docker Secrets y Certificados TLS (Renovación Let's Encrypt)

### 4.1 Docker Secrets (prefijo `plai_recursos_`)

```bash
# 1. Secreto de sesión NextAuth (sin historial de shell)
openssl rand -base64 32 | tr -d '\n' | docker secret create plai_recursos_nextauth_secret -

# 2. Credenciales Keycloak sin eco en terminal
read -rs -p "KEYCLOAK_ID: " VAL && echo && printf '%s' "$VAL" | docker secret create plai_recursos_keycloak_id - && unset VAL
read -rs -p "KEYCLOAK_SECRET: " VAL && echo && printf '%s' "$VAL" | docker secret create plai_recursos_keycloak_secret - && unset VAL

# 3. Token de servicio de Directus desde el archivo 0600 generado por directus:setup
docker secret create plai_recursos_directus_token /tmp/plai_recursos_directus_token.tmp && shred -u /tmp/plai_recursos_directus_token.tmp
```

### 4.2 Certificados TLS en el host (sin Docker Secrets inmutables)

Los certificados de Let's Encrypt se renuevan cada 90 días y los Docker Secrets de Swarm son inmutables. Por ello, `nginx-plai-recursos` monta los certificados como **bind mount de solo lectura (`read_only: true`)** desde el directorio estándar del ecosistema PLAi:

```
/opt/plai/plai-recursos/ssl/<DOMINIO>/
├── fullchain.pem   (legible por UID 101 / nginx)
└── privkey.pem     (legible por UID 101 / nginx, ej. chgrp 101 && chmod 640)
```

En cada renovación automática de Let's Encrypt, el script de renovación de PLAi solo copia los nuevos archivos en esa ruta y recarga/reinicia el servicio `plai-recursos_nginx-plai-recursos` (`docker service update --force plai-recursos_nginx-plai-recursos`).

---

## 5. Topología de Red, HSTS, Rate Limiting y Seguridad Swarm

- **`plai_gateway_net` (externa):** Conecta Traefik exclusivamente con `nginx-plai-recursos:8443` mediante **TLS passthrough**.
- **`plai_isolated_backend` (`internal: true`, `encrypted: true`):** Red privada, aislada y cifrada entre `nginx-plai-recursos` y `app:3000`.
- **`plai_app_egress` (`encrypted: true`):** Tráfico saliente desde `app` hacia Keycloak y Directus sin puertos publicados.
- **HSTS único:** `Strict-Transport-Security` se envía **exclusivamente desde NGINX** (capa TLS `8443`) y no se duplica desde Next.js.
- **Rate Limiting resistente a spoofing:** NGINX sobrescribe `X-Real-IP` y `X-Forwarded-For` únicamente con `$remote_addr` (nunca `$proxy_add_x_forwarded_for`), y `getClientIp` prioriza `x-real-ip` para impedir que un cliente evada el límite inyectando IPs falsas.
- **Healthcheck de arranque:** `app` usa `start_period: 40s` (alineado con el arranque de Next.js con `0.50 CPU`).

---

## 6. Ejecución del Despliegue

```bash
chmod +x deploy-production.sh
VERSION=1.0.0 \
REGISTRY=AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_REGISTRY_PLAI \
DOMAIN=AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_DOMINIO_INSTITUCIONAL_PLAI \
GATEWAY_NET=AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_RED_EXTERNA_SWARM_PLAI \
./deploy-production.sh
```

El script exporta `REGISTRY` y `VERSION` (consumidos directamente por `docker-compose.yml`), verifica los 4 Docker Secrets, los certificados TLS en `/opt/plai/plai-recursos/ssl/${DOMAIN}/`, la red externa, escanea ambas imágenes con **Trivy** (`HIGH,CRITICAL`) y despliega el stack en Swarm.
