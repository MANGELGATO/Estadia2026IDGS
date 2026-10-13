# Lista de Pendientes — Alineación con el Estándar Tecnológico PLAi v1.0

> **Documento normativo de referencia:** `est_ndar_tecnol_gico_plai.md` (Área de Tecnología e Infraestructura, versión 1.0, 7 de octubre de 2026).  
> **Estado general del repositorio:** Fases 1 a 8 completadas a nivel de código y diseño. Compilación en producción `next build` (`output: 'standalone'`), linter `eslint` (0 errores) y suite de pruebas `vitest run` (17 pruebas en verde) funcionando al 100%.

---

## 1. Matriz de Cumplimiento Normativo (Sección 11 del Estándar)

Esta tabla resume el estado actual contra la **Lista de Verificación de Aceptación** oficial de PLAi:

| Criterio Normativo (Sec. 11) | Nivel de Exigencia | Estado Actual | Detalle técnico |
| :--- | :--- | :--- | :--- |
| **Arquitectura** | `[OBLIGATORIO]` | **CUMPLE** | Next.js 16.4 (App Router) + TypeScript 5 + React 19 + Tailwind CSS 4 + daisyUI 5. Sin frameworks monolíticos ni SaaS externos. |
| **Dockerfile** | `[OBLIGATORIO]` | **CUMPLE (Código)** | Multi-etapa (`deps` -> `build` -> `runner`), base fija `node:22-alpine3.22`, usuario `node` (UID 1001), PID 1 con `tini`, puerto 3000, `HEALTHCHECK`. |
| **Compose (Swarm)** | `[OBLIGATORIO]` | **CUMPLE (Código)** | `read_only: true`, `cap_drop: [ALL]`, `no-new-privileges`, `tmpfs` en `/tmp` y cache, límites de CPU/RAM, labels Traefik v3, sin `ports` publicados. |
| **Salud** | `[OBLIGATORIO]` | **CUMPLE** | Endpoint `/api/health` (`force-dynamic`) responde 200 en milisegundos sin autenticación. |
| **Configuración** | `[OBLIGATORIO]` | **CUMPLE** | `.env.example` documentado con valores ficticios; principios 12-factor; ninguna URL ni credencial quemada en el código. |
| **Secretos** | `[OBLIGATORIO]` | **CUMPLE** | Lector `lib/env.ts` implementa patrón `VARIABLE_FILE` y lectura directa desde `/run/secrets/`. Sin secretos en Git ni en la imagen. |
| **Seguridad** | `[OBLIGATORIO]` | **PENDIENTE (P2, P3)** | P1 completado (NextAuth.js + Proxy RBAC). Falta validación Zod en servidor, rate limiting y escaneo de vulnerabilidades Trivy. |
| **Autenticación** | `[OBLIGATORIO]` | **CUMPLE** | NextAuth.js 4.24.15 con sesiones JWT en servidor, proxy de seguridad `proxy.ts` (Next.js 16) protegiendo `/admin` y `/usuario` con RBAC, e interfaz `/login` con cuentas de evaluación. |
| **Calidad** | `[OBLIGATORIO]` | **CUMPLE** | ESLint 9 pasa con 0 errores y 0 advertencias; Vitest con 30 pruebas unitarias automatizadas (`pnpm test`). |
| **Datos** | `[OBLIGATORIO]` | **PENDIENTE (P4, P5)** | Datos aún provienen de `lib/mockData.ts`. Requiere integración con Directus 11 (`@directus/sdk`) y PostgreSQL con migraciones versionadas. |
| **Logs** | `[OBLIGATORIO]` | **CUMPLE** | Salida a stdout/stderr sin escribir en archivos locales; sin datos sensibles. |
| **Documentación** | `[OBLIGATORIO]` | **CUMPLE** | `README.md` completo en español con arquitectura, Swarm, Docker, variables y checklist. |
| **Entrega** | `[OBLIGATORIO]` | **PENDIENTE (P9)** | Transferencia del repositorio con su historial limpio a la infraestructura de PLAi. |

---

## 2. Requisitos [OBLIGATORIO] Pendientes para Aceptación Final

Estos puntos son **condición obligatoria** para que el área de Tecnología e Infraestructura de PLAi acepte y publique el proyecto en producción:

### 🔴 Seguridad y Autenticación
- [x] **P1. Autenticación con NextAuth.js (Sección 7.1 y 10).** *(COMPLETADO)*
  - Integrado NextAuth.js 4.24.15 con sesiones JWT en el servidor (`lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`).
  - Implementado `proxy.ts` bajo la convención normativa de Next.js 16 para protección estricta de `/admin/*` y `/usuario/*` con redirección a `/login?callbackUrl=...` y control de acceso basado en roles (RBAC).
  - Modernizada la interfaz de `/login` con soporte para credenciales institucionales y botones de acceso rápido para evaluadores.
  - Indicador de sesión activa y botón de cierre de sesión en `Navbar.tsx`, `AdminSidebar.tsx` y `UserSidebar.tsx`.
  - Cobertura con 13 pruebas unitarias nuevas en `lib/auth.test.ts` y `proxy.test.ts` (suite total: 30 pruebas en verde).
- [ ] **P2. Validación en el Servidor con Zod (Sección 7.2).**
  - Actualmente los 8 formularios del sistema (reserva de equipos, solicitudes de cursos, gestión de inventario, mantenimientos, etc.) solo validan en el cliente mediante atributos HTML5 o `useState`.
  - **Acción:** Instalar `zod` y crear esquemas de validación estrictos en route handlers (`/api/...`) o Server Actions para sanitizar y validar todas las entradas antes de procesarlas.
- [ ] **P3. Rate Limiting en Endpoints Sensibles (Sección 7.3).**
  - Proteger los endpoints de login y de envío de solicitudes públicas contra ataques de fuerza bruta o saturación (mediante middleware en Next.js o integración con el proxy Nginx institucional).

### 🔴 Datos, Persistencia e Integración con Directus
- [ ] **P4. Conexión de Catálogos y Contenidos a Directus 11 (Secciones 4.4 y 10).**
  - El estándar exige que todos los datos administrables (catálogos de equipos, espacios, categorías, cursos y aplicaciones) residan en el CMS Directus y no en archivos locales (`lib/mockData.ts`).
  - **Acción:** Conectar el cliente `@directus/sdk` exclusivamente desde Server Components y route handlers (`server-only`), utilizando el token de servicio provisto por PLAi leído mediante `lib/env.ts` (`DIRECTUS_TOKEN` / `/run/secrets/directus_token`).
- [ ] **P5. Persistencia de Solicitudes y Migraciones de Base de Datos (Sección 9).**
  - Las reservaciones y solicitudes se pierden al recargar la página.
  - **Acción:** Definir el modelo de datos en PostgreSQL / Directus para solicitudes, préstamos e incidencias; documentar las migraciones versionadas y scripts de datos iniciales (seed).
- [ ] **P6. Almacenamiento Seguro de Archivos y Cumplimiento LFPDPPP (Secciones 5.2 y 7.7).**
  - En `ReservationForm`, la carga de credencial oficial (INE) y carta responsiva no se almacena.
  - **Acción:** Los archivos deben subirse directamente a las colecciones de archivos de Directus (nunca al contenedor, que opera bajo `read_only: true`). Al contener identificaciones personales oficiales, deben tratarse bajo la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).

### 🔴 Verificación en Servidor / Host con Docker
- [ ] **P7. Construcción y Verificación del Contenedor (Sección 5.1).**
  - El entorno de desarrollo local carece del binario `docker` (`CommandNotFoundException`).
  - **Acción:** En un host con Docker / servidor de pruebas de PLAi:
    1. Ejecutar `docker build -t plai-recursos-espacios:0.1.0 .`
    2. Probar ejecución con las banderas de seguridad exigidas: `docker run --rm --read-only --cap-drop ALL --security-opt no-new-privileges:true --tmpfs /tmp --tmpfs /app/.next/cache:size=64M -p 3000:3000 plai-recursos-espacios:0.1.0`
    3. Verificar que el `HEALTHCHECK` marque estado `(healthy)`.
- [ ] **P8. Escaneo de Vulnerabilidades con Trivy (Secciones 5.2 y 7.6).**
  - **Acción:** Ejecutar `trivy image plai-recursos-espacios:0.1.0 --severity HIGH,CRITICAL` y asegurar que no existan vulnerabilidades críticas o altas con parche disponible.

### 🔴 Entrega del Repositorio
- [ ] **P9. Transferencia del Repositorio a PLAi (Sección 9).**
  - Realizar commit de todos los cambios de las Fases 1 a 8 con mensajes descriptivos bajo *Conventional Commits* y transferir/vincular el repositorio a la cuenta institucional de PLAi, asegurando que no dependa de credenciales ni servicios a nombre del desarrollador.

---

## 3. Requisitos [RECOMENDADO] y Buenas Prácticas Pendientes

Aspectos que mejoran la observabilidad, accesibilidad y robustez de la plataforma según el estándar:

- [ ] **P10. Páginas Personalizadas de Error y 404 (Sección 7.4).**
  - Crear `app/not-found.tsx` y `app/error.tsx` con diseño institucional PLAi para asegurar que errores inesperados no revelen trazas de código, versiones de dependencias ni consultas internas al usuario final.
- [ ] **P11. Logger Estructurado en JSON (Sección 8).**
  - Implementar un logger ligero que serialice logs en formato JSON hacia `stdout`/`stderr` con campos `timestamp`, `level`, `message`, `path` y `reqId`, facilitando su ingesta en Grafana Loki y Promtail.
- [ ] **P12. Reemplazar Diálogos Nativos `alert()` y `confirm()` (Sección 7 y UX).**
  - Reemplazar las alertas nativas del navegador en [ReservationForm.tsx](file:///c:/Users/MANGE/Estadia2026IDGS/app/components/ReservationForm.tsx) y vistas de administración por toasts o componentes visuales daisyUI (`alert`/`modal`) con `role="alert"` para accesibilidad.
- [ ] **P13. Accesibilidad e Integración del Botón Flotante (Sección 3).**
  - Asociar `AccessibilityButton.tsx` a controles de accesibilidad reales (alto contraste, incremento de tipografía) y verificar que todos los `<label>` de modales cuenten con `htmlFor` apuntando al `id` del input.
- [ ] **P14. Publicación de Documentos Oficiales en Enlaces `href="#"`.**
  - Enlazar la plantilla oficial de la Carta Responsiva y el Aviso de Privacidad oficial de PLAi en los enlaces correspondientes de `ReservationForm.tsx`.
- [ ] **P15. Pipeline CI/CD Automatizado (Sección 9).**
  - Crear workflow de GitHub Actions o GitLab CI (`.gitlab-ci.yml`) que ejecute en cada Pull Request: `pnpm lint`, `pnpm test`, `pnpm build` y escaneo Trivy.
- [ ] **P16. Ampliar Cobertura de Pruebas Unitarias (Sección 9).**
  - Sumar pruebas en Vitest para `EquipmentFilterGrid.tsx`, `DataTable.tsx` y los route handlers futuros que validen esquemas Zod.
- [ ] **P17. Validación Visual Interactiva (Preflight de Tailwind).**
  - Recorrer todas las rutas en navegador para validar que los tamaños tipográficos y márgenes se mantengan consistentes tras la migración a Tailwind CSS 4.

---

## 4. Requisitos Completados al 100% (Historial Verificado)

| Fase / Requisito | Descripción | Verificación |
| :--- | :--- | :--- |
| **Fase 1: Linting y Tipado** | Corrección de ESLint 9, eliminación de errores y configuración de tipado. | `pnpm lint` sale con código 0. |
| **Fase 2: Standalone & Health** | `output: 'standalone'` en `next.config.ts` y creación de `/api/health`. | Verificado en build Turbopack y prueba en Vitest. |
| **Fase 3: Limpieza de Firebase** | Eliminación de dependencias y código de Firebase; limpieza de `package-lock.json`; creación de `.env.example`. | Sin referencias a Firebase en todo el proyecto. |
| **Fase 4: Gestor pnpm y Node 22** | Transición a `pnpm@11.28.5`, lockfile versionado y engines fijados a Node `22.x`. | Verificado en `package.json` y lockfile. |
| **Fase 5: Contenerización Docker** | `Dockerfile` multi-etapa alpine con usuario no root (1001), `tini` y `docker-compose.yml` para Swarm con `read_only: true`. | Archivos validados sintácticamente contra la norma. |
| **Fase 6: Pruebas con Vitest** | Configuración de Vitest con jsdom y creación de 17 pruebas unitarias automatizadas (`pnpm test`). | 17 pruebas pasan en verde en 1.8 segundos. |
| **Fase 7: Tailwind CSS 4 & daisyUI** | Migración integral de los 36 módulos CSS a Tailwind 4.x + daisyUI 5; depuración de variables en `globals.css`. | 0 archivos `.module.css` restantes; build sin advertencias. |
| **Fase 8: Documentación** | `README.md` reescrito con arquitectura, comandos, variables y checklist de aceptación. | Archivo validado en raíz del proyecto. |
| **Lector de Secretos (P5)** | Creación de `lib/env.ts` para soportar `VARIABLE_FILE` y `/run/secrets/` de Docker Swarm. | 6 pruebas unitarias específicas en `lib/env.test.ts`. |
| **Genéricos en DataTable (P2)** | Tipado de [DataTable.tsx](file:///c:/Users/MANGE/Estadia2026IDGS/app/components/admin/DataTable.tsx) mediante genéricos `<T extends Record<string, any>>`. | Compilación exitosa en `pnpm build`. |
| **Autenticación NextAuth.js (P1)** | Integración de `next-auth@4.24.15`, sesiones JWT del lado del servidor, roles institucionales (`admin`, `usuario`), protección con `proxy.ts` (Next.js 16) y formulario interactivo `/login` con cuentas de demostración. | 13 pruebas unitarias nuevas (30/30 en verde en `pnpm test`), compilación limpia `output: 'standalone'` y linter en 0. |
