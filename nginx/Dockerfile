# syntax=docker/dockerfile:1
# Imagen oficial unprivileged actualizada (corre como UID 101 en puerto 8080 sin CAP_NET_BIND_SERVICE).
# Recomendado: fijar digest @sha256:... al publicar en el registro privado de PLAi.
FROM nginxinc/nginx-unprivileged:1.28-alpine

COPY --chown=101:101 nginx.conf.template /etc/nginx/nginx.conf.template
COPY --chown=101:101 entrypoint.sh /usr/local/bin/nginx-entrypoint.sh

USER root
RUN chmod +x /usr/local/bin/nginx-entrypoint.sh \
 && rm -rf /etc/nginx/conf.d/*
USER 101

ENV ALLOWED_HOST=localhost

EXPOSE 8080

# Healthcheck desacoplado de la app Next.js (evita reinicios en cascada si app tarda en arrancar)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/nginx-health || exit 1

ENTRYPOINT ["/usr/local/bin/nginx-entrypoint.sh"]
