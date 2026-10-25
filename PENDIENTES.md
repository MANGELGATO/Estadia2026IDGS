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
| **Seguridad** | `[OBLIGATORIO]` | **PENDIENTE (P3)** | P1 (NextAuth.js + Proxy RBAC) y P2 (Validación Zod en servidor) completados. Falta rate limiting (P3) y escaneo Trivy. |
| **Autenticación** | `[OBLIGATORIO]` | **CUMPLE** | NextAuth.js 4.24.15 con sesiones JWT en servidor, proxy de seguridad `proxy.ts` (Next.js 16) protegiendo `/admin` y `/usuario` con RBAC, e interfaz `/login` con cuentas de evaluación. |
| **Calidad** | `[OBLIGATORIO]` | **CUMPLE** | ESLint 9 pasa con 0 errores y 0 advertencias; Vitest con 60 pruebas unitarias automatizadas (`pnpm test`). |
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
- [x] **P2. Validación en el Servidor con Zod (Sección 7.2).** *(COMPLETADO)*
  - Instalado `zod 4.x` y construidos esquemas de validación estrictos en [`lib/validations/schemas.ts`](file:///c:/Users/MANGE/Estadia2026IDGS/lib/validations/schemas.ts) para reservaciones de equipo, cursos y espacios.
  - Implementado control de regla de negocio en servidor con `.superRefine`: préstamo máximo de 2 horas y coherencia temporal.
  - Creados Route Handlers [`app/api/reservas/route.ts`](file:///c:/Users/MANGE/Estadia2026IDGS/app/api/reservas/route.ts) y [`app/api/solicitudes-espacios/route.ts`](file:///c:/Users/MANGE/Estadia2026IDGS/app/api/solicitudes-espacios/route.ts) con respuesta 201/400 tipada y formateada.
  - Conectado [ReservationForm.tsx](file:///c:/Users/MANGE/Estadia2026IDGS/app/components/ReservationForm.tsx) al backend mediante `fetch('/api/reservas')` con manejo de estados de carga (`isSubmitting`) y despliegue de errores de validación.
  - 10 pruebas unitarias añadidas en `lib/validations/schemas.test.ts` y `app/api/reservas/route.test.ts`.
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

- [x] **P10. Páginas Personalizadas de Error y 404 (Sección 7.4).** *(COMPLETADO)*
  - Implementada [`app/not-found.tsx`](file:///c:/Users/MANGE/Estadia2026IDGS/app/not-found.tsx) con diseño institucional PLAi, badge 404, y enlaces directos de navegación segura.
  - Implementada [`app/error.tsx`](file:///c:/Users/MANGE/Estadia2026IDGS/app/error.tsx) (boundary `'use client'`) sanitizada para no exponer stack traces ni consultas internas en pantalla, con soporte de código digest para soporte técnico y botón de reintento.
  - Verificado con 5 pruebas unitarias en `app/not-found.test.tsx` y `app/error.test.tsx`.
- [x] **P11. Logger Estructurado en JSON (Sección 8).** *(COMPLETADO)*
  - Creado [`lib/logger.ts`](file:///c:/Users/MANGE/Estadia2026IDGS/lib/logger.ts) con métodos `info`, `warn`, `error` y `debug`.
  - Serialización directa a `stdout`/`stderr` en formato JSON (`timestamp`, `level`, `service`, `message`, `reqId`, `path`, `status`).
  - Función de sanitización recursiva `sanitizeLogData` que enmascara automáticamente contraseñas, tokens y copias de INE con `[REDACTED]` conforme a la LFPDPPP.
  - 3 pruebas unitarias añadidas en `lib/logger.test.ts`.
- [x] **P12. Reemplazar Diálogos Nativos `alert()` y `confirm()` (Sección 7 y UX).** *(COMPLETADO)*
  - Eliminados el 100% de `alert()` y `confirm()` nativos y bloqueantes en `ReservationForm.tsx`, `app/categoria/[slug]/client.tsx` y las 5 vistas administrativas.
  - Creado [`ConfirmDialog.tsx`](file:///c:/Users/MANGE/Estadia2026IDGS/app/components/admin/ConfirmDialog.tsx) con soporte completo de accesibilidad (`role="alertdialog"`, `aria-modal="true"`, tecla Escape y foco).
  - Integrados avisos accesibles con `role="alert"` en formularios para usuarios y cotizaciones.
  - Verificado con pruebas unitarias en `ConfirmDialog.test.tsx` y `ReservationForm.test.tsx`.
- [x] **P13. Accesibilidad e Integración del Botón Flotante (Sección 3).** *(COMPLETADO)*
  - Transformado [`AccessibilityButton.tsx`](file:///c:/Users/MANGE/Estadia2026IDGS/app/components/AccessibilityButton.tsx) en un widget interactivo flotante montado globalmente en [`app/layout.tsx`](file:///c:/Users/MANGE/Estadia2026IDGS/app/layout.tsx).
  - Incluye zoom tipográfico dinámico (100%, 115%, 130%), alternador de Alto Contraste, Escala de Grises y Resaltado estricto de hipervínculos con persistencia en `localStorage`.
  - Verificado con 4 pruebas unitarias en `AccessibilityButton.test.tsx`.
- [x] **P14. Publicación de Documentos Oficiales en Enlaces `href="#"`.** *(COMPLETADO)*
  - Creado componente [`PrivacyPolicyModal.tsx`](file:///c:/Users/MANGE/Estadia2026IDGS/app/components/PrivacyPolicyModal.tsx) con el texto institucional completo del Aviso de Privacidad Integral de PLAi conforme a la LFPDPPP y derechos ARCO.
  - Conectado a todos los enlaces de consentimiento en `ReservationForm.tsx`, `espacios/page.tsx` y `Footer.tsx`.
  - Generada plantilla oficial descargable en PDF de la Carta Responsiva en [`public/documentos/PLAi_Carta_Responsiva_Equipos.pdf`](file:///c:/Users/MANGE/Estadia2026IDGS/public/documentos/PLAi_Carta_Responsiva_Equipos.pdf).
  - Verificado con 4 pruebas unitarias en `PrivacyPolicyModal.test.tsx`.
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
| **Páginas 404 / Error (P10)** | Creación de `app/not-found.tsx` y boundary `app/error.tsx` con diseño institucional y sanitización estricta sin fugas de stack traces ni BD. | 5 pruebas unitarias en `not-found.test.tsx` y `error.test.tsx`. |
| **Eliminación de alert/confirm (P12)** | Creación de `ConfirmDialog.tsx` (`role="alertdialog"`) y sustitución del 100% de diálogos nativos por banners y modales accesibles daisyUI. | 4 pruebas en `ConfirmDialog.test.tsx` y actualización de `ReservationForm.test.tsx`. |
| **Widget de Accesibilidad (P13)** | Botón flotante interactivo global con ajuste tipográfico (100%-130%), alto contraste, monocromía y resaltado de enlaces con persistencia. | 4 pruebas unitarias en `AccessibilityButton.test.tsx`. |
| **Aviso de Privacidad y Carta (P14)** | Modal accesible con Aviso de Privacidad Integral LFPDPPP y generación de plantilla PDF descargable para Carta Responsiva. | 4 pruebas en `PrivacyPolicyModal.test.tsx`. |
| **Validación Zod en Servidor (P2)** | Instalación de Zod, esquemas estrictos de reservaciones y cursos con límite de 2 hrs, Route Handlers `/api/reservas` y `/api/solicitudes-espacios` y conexión a `ReservationForm`. | 10 pruebas unitarias en `schemas.test.ts` y `route.test.ts`. |
| **Logger Estructurado JSON (P11)** | Módulo `lib/logger.ts` para emisión JSON a stdout/stderr con sanitización de tokens y datos personales para Promtail/Loki. | 3 pruebas unitarias en `lib/logger.test.ts` (total suite: 60 pruebas en verde). |
