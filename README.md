# Plataforma de Gestión de Recursos y Espacios de PLAi

Sistema web institucional de la **Plataforma Abierta de Innovación (PLAi)** para el catálogo, préstamo de equipamiento tecnológico, reserva de espacios, bitácora operativa y seguimiento de mantenimiento del Laboratorio de Innovación, Robótica y Tecnologías Inmersivas.

Construido conforme al **Estándar Tecnológico para Proyectos de Software de PLAi v1.0**.

## Stack Tecnológico

- **Frontend / SSR:** Next.js 16 (App Router, `output: 'standalone'`), React 19, TypeScript 5, Tailwind CSS 4 + daisyUI 5.
- **Autenticación y RBAC:** NextAuth.js 4.24 (JWT en servidor, hash `scrypt` con `timingSafeEqual`, roles `admin`, `colaborador` y `usuario` validados en proxy, layouts y APIs).
- **Base de Datos:** PostgreSQL 15/16 / Neon (`pg` con `DATABASE_URL` y soporte para Docker secrets `VARIABLE_FILE`).
- **Infraestructura:** Contenedor multi-etapa `node:22-alpine3.22` (no root, `read_only`, `tini`, `HEALTHCHECK` en `/api/health`) listo para Docker Swarm + Traefik v3.

## Documentación y Base de Datos

- **Guía completa de instalación, variables de entorno, Neon/PostgreSQL, Docker Swarm e integración con PLAi:**  
  [`INSTRUCCIONES_MONTAJE_PC.md`](./INSTRUCCIONES_MONTAJE_PC.md)
- **Esquema e inicialización de base de datos (PostgreSQL / Neon, idempotentes):**
  - [`database/01_schema_postgresql.sql`](./database/01_schema_postgresql.sql)
  - [`database/02_seed_postgresql.sql`](./database/02_seed_postgresql.sql)
- **Plantilla de variables de entorno:**  
  [`.env.example`](./.env.example)

## Inicio Rápido

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
# Configurar DATABASE_URL, NEXTAUTH_URL y NEXTAUTH_SECRET en .env.local
# Ejecutar database/01_schema_postgresql.sql y database/02_seed_postgresql.sql
pnpm dev
```

## Scripts Principales

| Comando | Descripción |
| :--- | :--- |
| `pnpm dev` | Servidor de desarrollo (`http://localhost:3000`) |
| `pnpm build` | Compilación de producción (`standalone`) |
| `pnpm start` | Arranque en producción |
| `pnpm lint` | Análisis estático con ESLint 9 |
| `pnpm test` | Pruebas automatizadas con Vitest |
