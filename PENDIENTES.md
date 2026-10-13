# Pendientes — Alineación con el Estándar PLAi v1.0

Actualizado tras las fases 1–8. Estado verificado: `pnpm lint`, `pnpm test` (11 pruebas) y `pnpm build` pasan.

## Estado por fase

| Fase | Tema | Estado |
| :--- | :--- | :--- |
| 1 | ESLint y tipado | Lint en 0, pero quedan `any` en `DataTable.tsx` (ver P2) |
| 2 | Standalone + `/api/health` | Hecha |
| 3 | Firebase y `.env.example` | Hecha (sin residuos de Firebase ni `package-lock`) |
| 4 | pnpm + Node 22 | Hecha |
| 5 | Docker / Swarm | Archivos hechos; **sin verificar** (P1) |
| 6 | Vitest | Hecha; cobertura baja (P6) |
| 7 | Tailwind 4 + daisyUI | **En progreso**: 17 de 36 módulos CSS migrados (todo `app/components/` al 100%) |
| 8 | README | Hecha; se actualiza al cerrar los pendientes |

## Bloqueantes para aceptar el despliegue

- [ ] **P1. Verificar el contenedor.** Docker no está instalado en la máquina de desarrollo. Falta `docker build`, comprobar `(healthy)`, arrancar con `--read-only --cap-drop ALL` y ejecutar `trivy image ... --severity HIGH,CRITICAL`.
- [ ] **P2. Quitar los `any` de `app/components/admin/DataTable.tsx`** (genérico `<T extends Record<string, unknown>>`, Fase 1.4) y activar la regla `@typescript-eslint/no-explicit-any` sin excepciones.
- [ ] **P3. Autenticación (sección 7).** No hay NextAuth.js. `/admin` y `/usuario` son accesibles sin sesión. Requiere el proveedor de identidad que indique PLAi, `middleware`/`proxy` que proteja las rutas y rate limiting en login.
- [ ] **P4. Datos administrables en Directus (sección 4.4).** Todo viene de `lib/mockData.ts`. Cargar equipos, categorías y espacios desde Directus con `@directus/sdk`, solo desde el servidor y con `server-only`.
- [ ] **P5. Lector de secretos `VARIABLE_FILE` (sección 6).** El código aún no lee `/run/secrets/*`. Crear `lib/env.ts` que valide variables (zod) y soporte `X_FILE`; descomentar `secrets` en `docker-compose.yml`.
- [ ] **P6. Validación en el servidor (sección 7).** Los 8 formularios solo validan en el cliente y no envían nada. Crear route handlers o server actions con esquemas zod para reservas, agendado de cursos y login.
- [ ] **P7. Persistencia y migraciones (sección 9).** Las reservas se pierden al recargar. Definir el modelo en Directus/PostgreSQL con migraciones versionadas y datos iniciales.
- [ ] **P8. Subida de archivos.** INE y carta responsiva (`ReservationForm`) hoy no se guardan. Deben ir a Directus, nunca al contenedor (que es de solo lectura). Considerar LFPDPPP: son datos personales sensibles.
- [ ] **P9. Repositorio y entrega.** Transferir el código con su historial a PLAi y completar el checklist de la sección 11. Hay cambios sin commit (`git status`).

## Estilos (Fase 7)

- [ ] **P10. Migrar los 19 módulos CSS restantes a Tailwind/daisyUI:**
  - [x] **Completado (17 módulos):**
    - Layout y Core: `Navbar`, `SubHeader`, `HeroSection`, `Footer`, `AccessibilityButton`.
    - Carruseles y Secciones: `CategoryCarousel`, `AppCarousel`, `CourseCallout`.
    - Tarjetas y Catálogo: `EquipmentCard`, `EquipmentFilterGrid`.
    - Modales y Formularios: `EquipmentDetailModal`, `ReservationForm`.
    - Componentes Admin & Usuario: `AdminSidebar`, `UserSidebar`, `StatCard`, `DataTable`.
    - Limpieza: `page.module.css` (eliminado boilerplate no utilizado).
  - [ ] **Restantes (19 vistas/páginas):**
    - Páginas públicas: `app/login/login.module.css`, `app/espacios/Espacios.module.css`, `app/aplicaciones/AplicacionesPage.module.css`, `app/categoria/[slug]/CategoryPage.module.css`, `app/agendar-curso/[type]/AgendarCurso.module.css`.
    - Vistas Admin (10 módulos): `app/admin/layout.module.css` y las 9 subpáginas (`dashboard`, `aplicaciones`, `categorias`, `configuracion`, `inventario`, `mantenimiento`, `reportes`, `reservaciones`, `usuarios`).
    - Vistas Usuario (4 módulos): `app/usuario/layout.module.css`, `page.module.css`, `agenda`, `prestamos`.
  - [ ] Al terminar, limpiar variables obsoletas en `globals.css` (`:root`).
- [ ] **P11. Revisión visual.** Tailwind trae su propio reset (Preflight), que cambia el tamaño por defecto de `h1`–`h6`, listas, imágenes y botones. Recorrer todas las páginas con navegador para detectar regresiones; no se hizo en esta sesión.
- [ ] **P12. Lógica de UI en CSS:** `.navLink` se usa como selector global en `globals.css`; retirar al migrar todo.

## Calidad y buenas prácticas

- [ ] **P13. Ampliar pruebas.** Hoy cubren `lib/reservation.ts`, `/api/health` y `ReservationForm`. Faltan `DataTable`, filtros de `EquipmentFilterGrid`, las reglas de `admin/usuarios` y las rutas nuevas del servidor (P6).
- [ ] **P14. Reemplazar `alert()`** (`ReservationForm`, `admin/usuarios`) por mensajes en pantalla (daisyUI `alert`/`toast`), con `role="alert"` para accesibilidad.
- [ ] **P15. `localStorage` en `admin/categorias`** (URL de video por categoría): pasa a Directus (datos administrables, sección 4.4).
- [ ] **P16. Enlaces `href="#"`** (plantilla de carta responsiva y aviso de privacidad en `ReservationForm`): publicar los documentos reales.
- [ ] **P17. Accesibilidad.** `AccessibilityButton` no hace nada todavía; los `label` de `ReservationForm` no usan `htmlFor`.
- [ ] **P18. Imágenes.** `images.unoptimized: true`; evaluar `next/image` optimizado (requiere `sharp` en la imagen) o mantenerlo documentado.
- [ ] **P19. Logs estructurados en JSON** (recomendado, sección 8) y `/metrics` si se añade backend.
- [ ] **P20. Cabeceras y CSP.** Las aplica el Nginx de PLAi; verificar que no hay scripts en línea sin nonce ni recursos de dominios no declarados (Google Fonts se descarga en build con `next/font`, correcto).
- [ ] **P21. Fijar el digest `@sha256` de `node:22-alpine3.22`** al publicar (recomendado) y dejar la versión de pnpm sincronizada entre `package.json` y el `Dockerfile`.
- [ ] **P22. CI** (lint + test + build + Trivy) en el repositorio de PLAi.
- [ ] **P23. Metadata** de `layout.tsx` (`title`, `description`) y una página `not-found` y `error` propias.

## Entorno

- [ ] **P24.** La máquina de desarrollo usa Node 24; el proyecto exige 22.x (`engines`). Usar Node 22 (p. ej. con `nvm`/`fnm`) para el build final.
- [ ] **P25.** Instalar Docker Desktop o validar en el servidor de PLAi.
