# syntax=docker/dockerfile:1
# Imagen oficial unprivileged fijada al estándar del ecosistema PLAi (1.30.7-alpine).
# Corre como UID 101 en puerto 8443 (TLS passthrough desde Traefik) y 8080 (solo healthcheck/redirect).
# Recomendado: fijar digest @sha256:... tras pasar escaneo Trivy en el registro privado de PLAi.
FROM nginxinc/nginx-unprivileged:1.30.7-alpine

COPY --chown=101:101 nginx.conf.template /etc/nginx/nginx.conf.template
COPY --chown=101:101 entrypoint.sh /usr/local/bin/nginx-entrypoint.sh

USER root
RUN chmod +x /usr/local/bin/nginx-entrypoint.sh \
 && rm -rf /etc/nginx/conf.d/* \
 && mkdir -p /var/cache/nginx /var/run /tmp \
 && chown -R 101:101 /var/cache/nginx /var/run \
 && chmod 1777 /tmp \
 && rm -rf /sbin/apk /etc/apk /lib/apk /usr/share/apk /var/cache/apk
USER 101

ENV ALLOWED_HOST=localhost \
    SSL_CERT_FILE=/etc/nginx/ssl/fullchain.pem \
    SSL_KEY_FILE=/etc/nginx/ssl/privkey.pem \
    TRUSTED_PROXY_CIDR=10.0.0.0/8

EXPOSE 8443 8080

# Healthcheck desacoplado de la app Next.js y de los certificados TLS externos
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/nginx-health || exit 1

ENTRYPOINT ["/usr/local/bin/nginx-entrypoint.sh"]
