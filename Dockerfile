# syntax=docker/dockerfile:1
# Estándar PLAi, sección 5.1: multi-etapa, base con versión fija, usuario no root,
# puerto no privilegiado, HEALTHCHECK, init (tini) y apagado limpio.
# Recomendado: fijar el digest (@sha256:...) de la imagen base al publicar.

ARG NODE_IMAGE=node:22-alpine3.22
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

# tini como PID 1 (manejo de señales y procesos zombi)
RUN apk add --no-cache tini \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001 -G nodejs

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Salida standalone: solo lo necesario para ejecutar (sin código fuente ni devDependencies)
COPY --from=build --chown=1001:1001 /app/.next/standalone ./
COPY --from=build --chown=1001:1001 /app/.next/static ./.next/static
COPY --from=build --chown=1001:1001 /app/public ./public

USER 1001
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

ENTRYPOINT ["/sbin/tini", "--"]
# Docker sobrescribe HOSTNAME con el id del contenedor; se fuerza 0.0.0.0 para que
# Next escuche en todas las interfaces. 'exec' deja a node recibiendo SIGTERM.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
