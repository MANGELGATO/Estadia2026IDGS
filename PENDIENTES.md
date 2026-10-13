# Pendientes — Alineación con el Estándar PLAi v1.0

Actualizado tras completar las Fases 1–8 y migración integral a Tailwind CSS 4.x + daisyUI 5.  
Estado verificado: `pnpm lint` (0 errores), `pnpm test` (17 pruebas en verde) y `pnpm build` (`output: 'standalone'`, 26 rutas estáticas).

## Estado por fase

| Fase | Tema | Estado |
| :--- | :--- | :--- |
| 1 | ESLint y tipado | **Completada**: Lint en 0, `DataTable.tsx` tipado con genéricos `<T>` |
| 2 | Standalone + `/api/health` | **Completada**: Next.js 16.4 en standalone, endpoint probado |
| 3 | Firebase y `.env.example` | **Completada**: Sin residuos de Firebase ni `package-lock.json` |
| 4 | pnpm + Node 22 | **Completada**: pnpm 11.28.5 + Node 22 LTS en engines |
| 5 | Docker / Swarm | **Completada**: Dockerfile multi-etapa, Swarm compose; pendiente validación en host con Docker (P1) |
| 6 | Vitest | **Completada**: 17 pruebas unitarias automatizadas (`lib/reservation`, `lib/env`, `/api/health`, `ReservationForm`) |
| 7 | Tailwind 4 + daisyUI | **Completada**: 100% de los 36 módulos `.module.css` migrados y eliminados |
| 8 | Documentación técnica | **Completada**: `README.md` reescrito con arquitectura Swarm y checklist normativo |

## Bloqueantes para aceptar el despliegue

- [ ] **P1. Verificar el contenedor en Docker.** Docker no está instalado en la máquina local de desarrollo (`CommandNotFoundException`). Falta ejecutar `docker build`, comprobar estado `(healthy)`, verificar arranque con `--read-only --cap-drop ALL` y ejecutar escaneo de vulnerabilidades `trivy image ... --severity HIGH,CRITICAL`.
- [x] **P2. Genéricos en DataTable:** Resuelto. `DataTable.tsx` tipado con `<T extends Record<string, any>>`.
- [ ] **P3. Autenticación (sección 7).** No hay NextAuth.js. `/admin` y `/usuario` son accesibles sin sesión. Requiere el proveedor de identidad que indique PLAi, `middleware`/`proxy` que proteja las rutas y rate limiting en login.
- [ ] **P4. Datos administrables en Directus (sección 4.4).** Todo viene de `lib/mockData.ts`. Cargar equipos, categorías y espacios desde Directus con `@directus/sdk`, solo desde el servidor y con `server-only`.
- [x] **P5. Lector de secretos `VARIABLE_FILE` (sección 6).** Resuelto. Implementado en `lib/env.ts` con soporte para `<NAME>_FILE`, `/run/secrets/<name>` y fallback directo, con 6 pruebas unitarias dedicadas en `lib/env.test.ts`.
- [ ] **P6. Validación en el servidor (sección 7).** Los 8 formularios solo validan en el cliente y no envían nada. Crear route handlers o server actions con esquemas zod para reservas, agendado de cursos y login.
- [ ] **P7. Persistencia y migraciones (sección 9).** Las reservas se pierden al recargar. Definir el modelo en Directus/PostgreSQL con migraciones versionadas y datos iniciales.
- [ ] **P8. Subida de archivos.** INE y carta responsiva (`ReservationForm`) hoy no se guardan. Deben ir a Directus, nunca al contenedor (que es de solo lectura). Considerar LFPDPPP: son datos personales sensibles.
- [ ] **P9. Repositorio y entrega.** Transferir el código con su historial a PLAi y completar el checklist de la sección 11. Hay cambios pendientes de commit en Git.

## Estado de Estilos (Fase 7: 100% Completada)

- [x] **Migración total a Tailwind CSS 4.x + daisyUI 5:**
  - 36 de 36 módulos CSS eliminados del repositorio.
  - Componentes públicos y compartidos: `Navbar`, `SubHeader`, `HeroSection`, `Footer`, `AccessibilityButton`, `CategoryCarousel`, `AppCarousel`, `CourseCallout`, `EquipmentCard`, `EquipmentFilterGrid`, `EquipmentDetailModal`, `ReservationForm`.
  - Componentes de administración y usuario: `AdminSidebar`, `UserSidebar`, `StatCard`, `DataTable`.
  - Vistas públicas: `login`, `espacios`, `aplicaciones`, `categoria/[slug]`, `agendar-curso/[type]`.
  - Módulo `/usuario`: `layout`, `dashboard`, `agenda`, `prestamos`.
  - Módulo `/admin`: `layout`, `dashboard`, `inventario`, `reservaciones`, `usuarios`, `categorias`, `aplicaciones`, `mantenimiento`, `reportes`, `configuracion`.
  - Limpieza de `globals.css`: variables `:root` redundantes depuradas y selector `.navLink` retirado.
- [ ] **P11. Revisión visual en navegador.** Recorrer todas las pantallas interactivamente para afinar padding o márgenes tras el preflight de Tailwind.
- [x] **P12. Lógica de UI en CSS:** Selector global `.navLink` eliminado de `globals.css`.

## Calidad y buenas prácticas

- [ ] **P13. Ampliar pruebas.** Cobertura actual: `lib/reservation.ts` (6), `lib/env.ts` (6), `/api/health` (1) y `ReservationForm` (4). Faltan pruebas para componentes visuales de filtrado y nuevas rutas de backend.
- [ ] **P14. Reemplazar `alert()`** (`ReservationForm`, `admin/usuarios`) por componentes daisyUI (`alert`/`toast`) con `role="alert"` para accesibilidad.
- [ ] **P15. `localStorage` en `admin/categorias`** (URL de video por categoría): migrar a Directus (datos administrables, sección 4.4).
- [ ] **P16. Enlaces `href="#"`** (plantilla de carta responsiva y aviso de privacidad en `ReservationForm`): publicar los documentos reales oficiales.
- [ ] **P17. Accesibilidad.** Asignar `htmlFor` explícito a todos los `label` en modales y configurar toggle de accesibilidad.
- [ ] **P18. Imágenes.** Evaluar optimización de imágenes locales si se instala `sharp`.
- [ ] **P19. Logs estructurados en JSON** (sección 8) y `/metrics` para Prometheus si se implementa backend propio.
- [ ] **P20. Cabeceras de seguridad y CSP.** Verificar integración con el proxy Nginx institucional de PLAi.
- [ ] **P21. Fijar el digest `@sha256` de `node:22-alpine3.22`** al momento de publicar la imagen en el registro privado de PLAi.
- [ ] **P22. Pipeline CI/CD** (lint + test + build + Trivy) en GitLab/GitHub de PLAi.
- [ ] **P23. Metadata de páginas:** Añadir `metadata` en rutas pendientes y páginas personalizadas `not-found.tsx` y `error.tsx`.

## Entorno

- [ ] **P24.** La máquina de desarrollo usa Node 24 (`v24.13.1`); el estándar exige Node 22 LTS (`engines: { "node": "22.x" }`). Utilizar Node 22 para el empaquetado de producción.
- [ ] **P25.** Instalar Docker Desktop en la máquina local o desplegar y validar en el servidor Swarm de PLAi.
