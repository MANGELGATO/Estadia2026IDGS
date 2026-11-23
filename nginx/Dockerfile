# syntax=docker/dockerfile:1
FROM nginx:1.27-alpine

# Hardening y permisos para ejecución como usuario no root
RUN rm -rf /etc/nginx/conf.d/* /etc/nginx/nginx.conf \
  && chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx

COPY nginx.conf /etc/nginx/nginx.conf

# Validar sintaxis de configuración
RUN nginx -t

USER nginx
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/api/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
