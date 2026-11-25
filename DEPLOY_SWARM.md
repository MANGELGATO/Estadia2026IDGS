# Guía de Despliegue en Docker Swarm — PLAi (`DEPLOY_SWARM.md`)

**Proyecto:** Plataforma de Gestión de Recursos y Espacios de PLAi (`plai-recursos-espacios`)  
**Arquitectura:** Traefik (TLS externo) → NGINX Unprivileged (`:8080`) → Red Aislada (`internal: true`) → Next.js 16 Standalone (`:3000`) → Directus API & Keycloak OIDC.

---

## 1. Placeholders Institucionales a Sustituir

Antes de desplegar, reemplaza **todas** las cadenas en MAYÚSCULAS (`AQUI_HACER_CAMBIOS_CORRESPONDIENTES_...`) en [`docker-compose.yml`](./docker-compose.yml) y [`deploy-production.sh`](./deploy-production.sh):

| Placeholder | Qué colocar |
| :--- | :--- |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_REGISTRY_PLAI` | Host del registro privado de imágenes Docker de PLAi |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_DOMINIO_INSTITUCIONAL_PLAI` | Dominio FQDN definitivo de la app (ej. `recursos.plai.mx`) |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_KEYCLOAK_INSTITUCIONAL` | Host de Keycloak institucional + `/realms/<REALM>` |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_DIRECTUS_ADMIN_PLAI` | URL base de Directus (ej. `https://admin.plai.mx`) |
| `AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_RED_EXTERNA_SWARM_PLAI` | Nombre real de la red overlay donde escucha Traefik en Swarm |

---

## 2. Aprovisionamiento de Colecciones en Directus (Vía API Oficial)

> **Importante:** Nunca se escriben tablas ni metadatos por SQL directo en la base de datos de Directus. Todo el esquema se crea vía API REST oficial con prefijo `lab_recursos_` para no colisionar con otras aplicaciones en `admin.plai.mx`.

1. Ejecuta el script idempotente con un token temporal de administrador de esquema:
   ```bash
   DIRECTUS_URL=https://AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_URL_DIRECTUS_ADMIN_PLAI \
   DIRECTUS_TOKEN=<TOKEN_ADMIN_TEMPORAL> \
   DIRECTUS_COLLECTION_PREFIX=lab_recursos_ \
   pnpm directus:setup
   ```
2. Crea un rol/usuario de servicio en Directus con permisos **exclusivamente** sobre las 10 colecciones `lab_recursos_*` y genera su token estático (`directus_token`).

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

---

## 4. Creación de Docker Secrets en Swarm

```bash
printf '%s' "$(openssl rand -base64 32)" | docker secret create nextauth_secret -
printf '%s' "<CLIENT_ID_KEYCLOAK>"       | docker secret create keycloak_id -
printf '%s' "<CLIENT_SECRET_KEYCLOAK>"   | docker secret create keycloak_secret -
printf '%s' "<TOKEN_SERVICIO_DIRECTUS>"  | docker secret create directus_token -
```

---

## 5. Topología de Red y Enrutamiento con Traefik

- **`plai_gateway_net` (externa):** Conecta Traefik exclusivamente con el servicio `nginx` en el puerto no privilegiado `8080`.
  - Si Traefik usa *file provider*, apunta el backend del router a `http://plai-recursos_nginx:8080` preservando `X-Forwarded-Proto: https` y `X-Forwarded-Port: 443`.
- **`plai_isolated_backend` (`internal: true`):** Red completamente aislada entre `nginx` y `app:3000`. Ningún servicio externo puede alcanzar `app` directamente.
- **`plai_app_egress`:** Permite únicamente tráfico saliente desde `app` hacia Keycloak (OIDC discovery/token) y Directus API (`admin.plai.mx`), sin publicar puertos entrantes.

---

## 6. Ejecución del Despliegue

```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

El script valida automáticamente:
1. Estado activo de Docker Swarm.
2. Ausencia de placeholders `AQUI_HACER_CAMBIOS_CORRESPONDIENTES`.
3. Existencia de los 4 Docker Secrets y de la red overlay externa.
4. Build multi-etapa (`Dockerfile` y `nginx/Dockerfile`) y escaneo obligatorio con **Trivy** (`HIGH,CRITICAL`).
5. Despliegue del stack y verificación de réplicas.
