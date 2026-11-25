#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue a Producción en Docker Swarm - PLAi v1.0
# Valida prerrequisitos, secretos prefijados, placeholders, escaneo Trivy y
# sincroniza ${VERSION} entre build, push y docker stack deploy.
# ==============================================================================
set -euo pipefail

STACK_NAME="${STACK_NAME:-plai-recursos}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
REGISTRY="${REGISTRY:-AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_REGISTRY_PLAI}"
export VERSION="${VERSION:-1.0.0}"
GATEWAY_NET="${GATEWAY_NET:-AQUI_HACER_CAMBIOS_CORRESPONDIENTES_CON_RED_EXTERNA_SWARM_PLAI}"

APP_IMAGE="${REGISTRY}/plai-recursos-espacios:${VERSION}"
NGINX_IMAGE="${REGISTRY}/plai-recursos-nginx:${VERSION}"

REQUIRED_SECRETS=(
  "plai_recursos_nextauth_secret"
  "plai_recursos_keycloak_id"
  "plai_recursos_keycloak_secret"
  "plai_recursos_directus_token"
  "plai_recursos_tls_cert"
  "plai_recursos_tls_key"
)

echo "=== [1/6] Verificando Docker Swarm ==="
SWARM_STATE=$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null || echo "inactive")
if [[ "${SWARM_STATE}" != "active" ]]; then
  echo "ERROR: Este nodo no forma parte de un clúster Docker Swarm activo (estado: ${SWARM_STATE})."
  exit 1
fi

echo "=== [2/6] Verificando que no queden placeholders sin reemplazar ==="
if grep -q "AQUI_HACER_CAMBIOS_CORRESPONDIENTES" "${COMPOSE_FILE}"; then
  echo "ERROR: ${COMPOSE_FILE} aún contiene valores de ejemplo (AQUI_HACER_CAMBIOS_CORRESPONDIENTES)."
  echo "Sustitúyelos por los dominios, registro y nombres de red reales de PLAi antes de desplegar."
  exit 1
fi

if [[ "${REGISTRY}" == *"AQUI_HACER_CAMBIOS_CORRESPONDIENTES"* ]] || [[ "${GATEWAY_NET}" == *"AQUI_HACER_CAMBIOS_CORRESPONDIENTES"* ]]; then
  echo "ERROR: Exporta REGISTRY y GATEWAY_NET con los valores reales de PLAi antes de ejecutar el script."
  exit 1
fi

echo "=== [3/6] Verificando Docker Secrets obligatorios (prefijo plai_recursos_) ==="
for secret in "${REQUIRED_SECRETS[@]}"; do
  if ! docker secret inspect "${secret}" >/dev/null 2>&1; then
    echo "ERROR: Falta el Docker secret '${secret}'."
    echo "Créalo sin exponer el valor en el historial de shell, leyendo desde archivo temporal o stdin oculto:"
    echo "  docker secret create ${secret} /ruta/segura/${secret}.txt"
    echo "  # o interactivo sin eco: read -rs VAL && printf '%s' \"\$VAL\" | docker secret create ${secret} - && unset VAL"
    exit 1
  fi
done
echo "Todos los secretos requeridos existen."

echo "=== [4/6] Verificando red externa '${GATEWAY_NET}' ==="
if ! docker network inspect "${GATEWAY_NET}" >/dev/null 2>&1; then
  echo "ERROR: La red overlay externa '${GATEWAY_NET}' no existe en el clúster Swarm."
  exit 1
fi

echo "=== [5/6] Construyendo imágenes versión ${VERSION} y escaneando con Trivy ==="
docker build -t "${APP_IMAGE}" -f Dockerfile .
docker build -t "${NGINX_IMAGE}" -f nginx/Dockerfile ./nginx

if command -v trivy >/dev/null 2>&1; then
  trivy image --severity HIGH,CRITICAL --exit-code 1 "${APP_IMAGE}"
  trivy image --severity HIGH,CRITICAL --exit-code 1 "${NGINX_IMAGE}"
else
  echo "ERROR: Trivy no está instalado. El escaneo de vulnerabilidades es obligatorio antes de desplegar."
  exit 1
fi

docker push "${APP_IMAGE}"
docker push "${NGINX_IMAGE}"

echo "=== [6/6] Desplegando stack '${STACK_NAME}' (VERSION=${VERSION}) en Docker Swarm ==="
docker stack deploy -c "${COMPOSE_FILE}" --with-registry-auth "${STACK_NAME}"

echo "Esperando convergencia de servicios..."
sleep 5
docker stack services "${STACK_NAME}"
echo "Despliegue completado. Verifica el estado de los contenedores con: docker stack ps ${STACK_NAME}"
