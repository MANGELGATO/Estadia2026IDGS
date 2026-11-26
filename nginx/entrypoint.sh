#!/bin/sh
set -eu

SSL_CERT_FILE="${SSL_CERT_FILE:-/etc/nginx/ssl/fullchain.pem}"
SSL_KEY_FILE="${SSL_KEY_FILE:-/etc/nginx/ssl/privkey.pem}"
TRUSTED_PROXY_CIDR="${TRUSTED_PROXY_CIDR:-10.0.0.0/8}"

if [ ! -r "${SSL_CERT_FILE}" ] || [ ! -r "${SSL_KEY_FILE}" ]; then
  echo "ERROR: No se pueden leer los certificados TLS requeridos para escuchar en 8443." >&2
  echo "  SSL_CERT_FILE=${SSL_CERT_FILE}" >&2
  echo "  SSL_KEY_FILE=${SSL_KEY_FILE}" >&2
  echo "Monta los certificados TLS (read-only, legibles por UID 101) o ajusta SSL_CERT_FILE/SSL_KEY_FILE." >&2
  exit 1
fi

# Construye directivas set_real_ip_from (acepta uno o varios CIDRs separados por coma o espacio)
SET_REAL_IP_FROM_DIRECTIVES=""
OLD_IFS="$IFS"
IFS=', '
for cidr in ${TRUSTED_PROXY_CIDR}; do
  [ -z "${cidr}" ] && continue
  SET_REAL_IP_FROM_DIRECTIVES="${SET_REAL_IP_FROM_DIRECTIVES}  set_real_ip_from ${cidr};
"
done
IFS="$OLD_IFS"

if [ -z "${SET_REAL_IP_FROM_DIRECTIVES}" ]; then
  echo "ERROR: TRUSTED_PROXY_CIDR no puede estar vacío cuando PROXY protocol está activo." >&2
  exit 1
fi

export ALLOWED_HOST SSL_CERT_FILE SSL_KEY_FILE SET_REAL_IP_FROM_DIRECTIVES

# Genera la configuración final en /tmp (escribible con read_only: true y tmpfs mode: 1023)
envsubst '${ALLOWED_HOST} ${SSL_CERT_FILE} ${SSL_KEY_FILE} ${SET_REAL_IP_FROM_DIRECTIVES}' < /etc/nginx/nginx.conf.template > /tmp/nginx.conf

# Valida sintaxis y certificados antes de arrancar
nginx -t -c /tmp/nginx.conf

exec nginx -c /tmp/nginx.conf -g 'daemon off;'
