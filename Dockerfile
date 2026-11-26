# syntax=docker/dockerfile:1
# Estándar PLAi v1.0, sección 5.1:
# multi-etapa, base fija soportada, usuario no root (UID 1001), puerto no privilegiado,
# sin gestores de paquetes (ni apk ni npm) en runtime, HEALTHCHECK, init (tini) y apagado limpio.
# Recomendado: fijar el digest (@sha256:...) de la imagen base al publicar en el registro PLAi.

ARG NODE_IMAGE=node:22-alpine3.24
ARG PNPM_VERSION=11.28.5

# ---------- Etapa 1: dependencias ----------
FROM ${NODE_IMAGE} AS deps
ARG PNPM_VERSION
WORKDIR /app
RUN npm install -g pnpm@${PNPM_VERSION}
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- Etapa 2: build ----------
FROM ${NODE_IMAGE} AS build
ARG PNPM_VERSION
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@${PNPM_VERSION}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# ---------- Etapa 3: runtime ----------
FROM ${NODE_IMAGE} AS runtime
WORKDIR /app

# tini como PID 1, usuario no-root (UID 1001) y eliminación total de gestores de paquetes (apk, npm, yarn, corepack)
RUN apk add --no-cache tini \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001 -G nodejs \
 && mkdir -p /app/.next/cache /tmp \
 && chown -R 1001:1001 /app/.next/cache \
 && chmod 1777 /tmp \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /opt/yarn* /usr/local/bin/yarn* /usr/local/bin/corepack \
 && rm -rf /sbin/apk /etc/apk /lib/apk /usr/share/apk /var/cache/apk

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Salida standalone: solo lo necesario para ejecutar (sin código fuente ni devDependencies)
COPY --from=build --chown=1001:1001 /app/.next/standalone ./
COPY --from=build --chown=1001:1001 /app/.next/static ./.next/static
COPY --from=build --chown=1001:1001 /app/public ./public

USER 1001
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
