#!/bin/sh
set -eu

SSL_CERT_FILE="${SSL_CERT_FILE:-/run/secrets/plai_recursos_tls_cert}"
SSL_KEY_FILE="${SSL_KEY_FILE:-/run/secrets/plai_recursos_tls_key}"

if [ ! -r "${SSL_CERT_FILE}" ] || [ ! -r "${SSL_KEY_FILE}" ]; then
  echo "ERROR: No se pueden leer los certificados TLS requeridos para escuchar en 8443." >&2
  echo "  SSL_CERT_FILE=${SSL_CERT_FILE}" >&2
  echo "  SSL_KEY_FILE=${SSL_KEY_FILE}" >&2
  echo "Monta los Docker secrets plai_recursos_tls_cert y plai_recursos_tls_key o ajusta SSL_CERT_FILE/SSL_KEY_FILE." >&2
  exit 1
fi

export ALLOWED_HOST SSL_CERT_FILE SSL_KEY_FILE

# Genera la configuración final en /tmp (escribible con read_only: true y tmpfs mode: 1023)
envsubst '${ALLOWED_HOST} ${SSL_CERT_FILE} ${SSL_KEY_FILE}' < /etc/nginx/nginx.conf.template > /tmp/nginx.conf

# Valida sintaxis y certificados antes de arrancar
nginx -t -c /tmp/nginx.conf

exec nginx -c /tmp/nginx.conf -g 'daemon off;'
