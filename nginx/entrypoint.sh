#!/bin/sh
set -eu

# Genera la configuración final en /tmp (escribible incluso con read_only: true)
envsubst '${ALLOWED_HOST}' < /etc/nginx/nginx.conf.template > /tmp/nginx.conf

# Valida sintaxis antes de arrancar
nginx -t -c /tmp/nginx.conf

exec nginx -c /tmp/nginx.conf -g 'daemon off;'
