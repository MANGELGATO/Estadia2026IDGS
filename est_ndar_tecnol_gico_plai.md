# PLAI ÁREA DE TECNOLOGÍA E INFRAESTRUCTURA
## Estándar Tecnológico para Proyectos de Software

**Requerimientos base para prestadores de servicio que desarrollan aplicaciones a desplegar en los servidores de PLAi**

| Campo | Detalle |
| :--- | :--- |
| **Versión** | 1.0 |
| **Fecha** | 7 de octubre de 2026 |
| **Emite** | Área de Tecnología e Infraestructura, PLAI |
| **Dirigido a** | Prestadores de servicio, agencias y desarrolladores externos |
| **Aplica a** | Todo proyecto nuevo, o evolución mayor de uno existente, que se despliegue en la infraestructura de PLAi |

### Cómo leer este documento
Cada requisito lleva una etiqueta que indica su nivel de exigencia:

| Etiqueta | Significado |
| :--- | :--- |
| **[OBLIGATORIO]** | Condición para que el proyecto se acepte y se despliegue. Si no se cumple, el despliegue se detiene. |
| **[RECOMENDADO]** | Buena práctica esperada. Si no se aplica, conviene explicar el motivo en el README. |
| **[REQUIERE APROBACIÓN]** | Solo se acepta con autorización por escrito del área de Tecnología, solicitada antes de iniciar el desarrollo. |

En resumen: si el proyecto usa las tecnologías de la sección 3, se empaqueta como se describe en la sección 5 y pasa la lista de verificación de la sección 11, el área de Tecnología puede desplegarlo en horas, no en semanas.

*Documento para distribución a proveedores. Las versiones indicadas son mínimas y se revisan periódicamente.*

---

## 1. Propósito y alcance
Este documento fija las tecnologías, versiones y prácticas que deben seguir los proyectos que desarrollan prestadores de servicio para PLAi. Se basa en el stack que hoy opera en nuestros servidores de producción: portales web en Next.js, aplicaciones React, servicios en Python con FastAPI, el CMS Directus, automatizaciones con n8n e integración con Moodle.

Con este estándar buscamos:
*   **Desplegar más rápido.** Todos los proyectos llegan con la misma estructura y se publican con los mismos scripts y la misma infraestructura.
*   **Dar soporte con el equipo interno.** Solo aceptamos tecnologías en las que el área tiene experiencia, para poder operar, corregir y evolucionar el sistema cuando termine el contrato.
*   **Mantener un nivel de seguridad uniforme.** Todos los servicios se aíslan, se escanean y se protegen de la misma forma.
*   **Reducir costos.** Se reutilizan la base de datos, la autenticación, el CMS, el monitoreo y el proxy que ya existen, en lugar de crear infraestructura nueva para cada proyecto.

**[OBLIGATORIO]** Antes de iniciar el desarrollo, el prestador entrega una propuesta de arquitectura (una o dos cuartillas): componentes, tecnologías y versiones, base de datos, integraciones y dependencias externas. El área de Tecnología la valida contra este documento.

## 2. Cómo es la infraestructura de destino
Las aplicaciones se ejecutan como contenedores Docker orquestados con Docker Swarm en servidores Linux (Ubuntu LTS). El proveedor no despliega directamente en el servidor: entrega el código y la definición de contenedores, y PLAi construye, escanea y publica la imagen en su registro privado.

**Flujo de red:**
`Usuario (Navegador / API) >> Traefik v3 (Entrada única 80/443, TLS) >> Nginx de la app (8080/8443) >> Aplicación (3000 Node / 8000 Python) >> Servicios (PostgreSQL, Directus, Moodle)`

*   **Traefik v3** es el único punto de entrada (puertos 80 y 443). PLAi administra los certificados TLS y los dominios.
*   Cada aplicación tiene su propio **Nginx** como proxy, que aplica las cabeceras de seguridad, la compresión y la caché. La aplicación nunca publica puertos en el servidor.
*   Los servicios se comunican por redes internas cifradas (overlay) y se aíslan entre proyectos.
*   Las contraseñas y tokens se administran como Docker secrets, nunca como archivos dentro de la imagen.
*   Monitoreo centralizado: Promtail + Loki para logs y Prometheus + Grafana para métricas.

## 3. Stack tecnológico aprobado
**[OBLIGATORIO]** Los proyectos deben construirse con las tecnologías de esta tabla, en la versión indicada o una posterior de la misma línea mayor. Para usar otra tecnología se necesita aprobación previa (ver sección 10).

| Capa | Tecnología estándar | Versión mínima | Notas |
| :--- | :--- | :--- | :--- |
| **Portal / sitio web con SSR** | Next.js (App Router) + React + TypeScript | Next 15.5<br>React 19<br>TS 5 | Compilar con `output: 'standalone'`. Es el stack de los portales principales. |
| **Aplicación SPA (solo estática)** | React + Vite + TypeScript | React 19<br>Vite 7 | Se compila a estáticos que sirve Nginx. Sin servidor Node en producción. |
| **Estilos / UI** | Tailwind CSS | 4.x | Se permite daisyUI y lucide-react para iconos. |
| **Runtime JavaScript** | Node.js LTS | 22.x | Versiones impares o fuera de soporte no se aceptan. |
| **Gestor de paquetes JS** | pnpm | 11.x | Lockfile `pnpm-lock.yaml` versionado. Fijar `packageManager` en `package.json`. |
| **Servicio / API en Node** | Express o route handlers de Next.js | Express 4.19+ | Para servicios ligeros (pasarelas, webhooks). |
| **Backend/API/ETL en Python** | Python + FastAPI + Uvicorn + Pydantic | Py 3.12<br>FastAPI 0.111<br>Pydantic 2 | Drivers asíncronos (asyncpg, httpx). Dependencias con versión exacta. |
| **Base de datos relacional** | PostgreSQL | 15 (16 recomendado) | Motor único de base de datos relacional. |
| **Series de tiempo / métricas** | TimescaleDB (sobre PostgreSQL) | 2.17<br>PG 16 | Solo cuando el caso de uso lo requiera. |
| **CMS/backoffice de contenido** | Directus | 11.x | Se consume con `@directus/sdk` o REST con token de servicio. |
| **Autenticación (Next.js)** | NextAuth.js | 4.24 | Sesiones del lado del servidor. El proveedor de identidad lo define PLAi. |
| **Automatización de flujos** | n8n | 2.x | Para integraciones y procesos programados que no necesitan código propio. |
| **LMS** | Moodle (Web Services) | Instancia PLAI | Integración por API con token de servicio. |
| **Proxy web** | Nginx | 1.27 (alpine) | Puertos 8080/8443, usuario no root. |
| **Contenedores** | Docker + Compose (formato stack Swarm) | Engine 24<br>Compose v2 | Ver sección 5. |
| **Calidad de código** | ESLint<br>Ruff<br>Jest/Vitest<br>pytest | ESLint 9<br>Ruff 0.4 | Ver sección 9. |

## 4. Requisitos por tipo de proyecto

### 4.1 Portales y aplicaciones Next.js
*   **[OBLIGATORIO]** App Router, TypeScript y `output: 'standalone'` en `next.config.ts`.
*   **[OBLIGATORIO]** La aplicación escucha en el puerto 3000 y expone un endpoint de salud (p. ej. `/api/health`).
*   **[OBLIGATORIO]** Las variables `NEXT_PUBLIC_*` no contienen secretos: llegan al navegador.
*   **[OBLIGATORIO]** Las llamadas con tokens (Directus, Moodle, APIs internas) se hacen en el servidor (Server Components, route handlers o server actions), nunca desde el cliente.
*   **[RECOMENDADO]** Separar la lógica de acceso a datos en una capa de servicios (`src/services`, `src/lib`) y marcarla con `server-only`.

### 4.2 SPAs con React + Vite
*   **[OBLIGATORIO]** El build produce archivos estáticos que sirve nginx: `1.27-alpine`; no se usa `vite preview` ni un servidor Node en producción.
*   **[OBLIGATORIO]** Las URLs y llaves que cambian por ambiente se inyectan al arrancar el contenedor (plantilla + envsubst), no al compilar. Así una misma imagen sirve para pruebas y producción.
*   **[OBLIGATORIO]** Ninguna llave privada en el bundle. Si una API exige secreto, se accede por proxy desde Nginx o desde un backend.

### 4.3 Servicios backend en Python
*   **[OBLIGATORIO]** Python 3.12 con FastAPI y Uvicorn; dependencias con versión exacta en `requirements.txt` o `pyproject.toml`.
*   **[OBLIGATORIO]** Validación de entradas y salidas con modelos Pydantic v2; configuración con `pydantic-settings` o variables de entorno.
*   **[OBLIGATORIO]** Endpoint `/health` y rate limiting en endpoints públicos (p. ej. `slowapi`).
*   **[RECOMENDADO]** I/O asíncrono (asyncpg, httpx) y métricas en `/metrics` con `prometheus-client`.

### 4.4 Integraciones y automatizaciones
*   **[RECOMENDADO]** Hacer los flujos de integración (notificaciones, sincronizaciones, procesos programados) en n8n antes que escribir un servicio nuevo.
*   **[OBLIGATORIO]** Los datos administrables (catálogos, contenidos, configuraciones) viven en Directus, no en archivos ni en código.
*   **[OBLIGATORIO]** Los webhooks entrantes validan firma o token compartido y responden rápido; el trabajo pesado se hace en segundo plano.
*   **[OBLIGATORIO]** Las integraciones de pago se hacen a través del servicio de pagos de PLAi o con aprobación expresa del área.

## 5. Requisitos de contenerización
**[OBLIGATORIO]** Todo proyecto se entrega con su `Dockerfile` y su archivo `docker-compose` compatible con Docker Swarm. Estos puntos son los que más tiempo ahorran en el despliegue: un proyecto que no los cumple debe adaptarse antes de publicarse.

### 5.1 Dockerfile
| Requisito | Detalle |
| :--- | :--- |
| **Imagen base oficial con versión fija** | `node:22-alpine`, `python:3.12-slim`, `nginx:1.27-alpine`. Nunca: `latest`. Recomendado fijar digest `@sha256:...` |
| **Construcción multi-etapa** | Etapas `deps` >> `build` >> `runtime`. La imagen final no contiene compiladores, código fuente innecesario, dependencias de desarrollo ni herramientas de build. |
| **Usuario no root** | Usuario de sistema con UID fijo mayor o igual a 1000 (p. ej. 1001); `USER` declarado antes de `CMD`/`ENTRYPOINT`. |
| **Puerto no privilegiado** | 3000 (Node), 8000 (Python), 8080/8443 (Nginx). Nunca 80/443 dentro del contenedor. |
| **HEALTHCHECK** | Instrucción `HEALTHCHECK` contra un endpoint que responda 200 sin autenticación y sin consultas pesadas. |
| **Init y apagado limpio** | `dumb-init` o `tini` como PID 1; la aplicación atiende SIGTERM y cierra conexiones. |
| **.dockerignore** | Excluir `.git`, `node_modules`, `env*`, carpetas de secretos, pruebas y artefactos locales. |

### 5.2 docker-compose (stack de Swarm)
La aplicación debe arrancar y funcionar con esta configuración de seguridad, que PLAi aplica a todos los servicios:

| Control | Qué implica para el desarrollo |
| :--- | :--- |
| `read_only: true` | El sistema de archivos del contenedor es de solo lectura. Solo se escribe en `/tmp` (`tmpfs`) o en volúmenes declarados. No generar archivos junto al código en tiempo de ejecución. |
| `cap_drop: [ALL]` | Sin capacidades de Linux adicionales. No se puede usar puertos bajos, montar sistemas de archivos ni cambiar de usuario. |
| `no-new-privileges` | Prohibido `sudo`, `su` o binarios `setuid` en tiempo de ejecución. |
| **Límites de recursos** | Declarar `deploy.resources.limits` (memoria y CPU) y documentar el consumo esperado. |
| **Sin puertos publicados** | No usar `ports:`. El acceso entra por Traefik >> Nginx a través de redes overlay. |
| **Docker secrets** | Los secretos se montan como archivos en `/run/secrets/<nombre>`. La aplicación debe poder leerlos desde archivo (patrón `VARIABLE_FILE`). |
| **Persistencia explícita** | Solo en volúmenes con nombre y documentados. Los archivos que suben los usuarios van a Directus o al almacenamiento acordado, no al contenedor. |

**[OBLIGATORIO]** Escaneo de vulnerabilidades. Cada imagen pasa por Trivy antes de publicarse. El despliegue se bloquea si hay vulnerabilidades CRITICAL o HIGH con parche disponible. Recomendamos que el proveedor ejecute `trivy image <imagen> --severity HIGH,CRITICAL` antes de cada entrega.

## 6. Configuración y secretos
*   **[OBLIGATORIO]** Toda la configuración se lee de variables de entorno (principios 12-factor). No se escriben URLs, dominios, credenciales ni IDs de ambiente en el código.
*   **[OBLIGATORIO]** Se entrega un `.env.example` con todas las variables, una descripción breve de cada una y valores ficticios. Se indica cuáles son secretos.
*   **[OBLIGATORIO]** Ningún secreto en el repositorio, en la imagen ni en el historial de Git. Si se sube uno por error, hay que avisar para rotarlo.
*   **[OBLIGATORIO]** PLAi crea y guarda las credenciales de producción. El proveedor trabaja con credenciales de desarrollo y nunca recibe ni comparte secretos por correo o chat en texto plano.

## 7. Seguridad de la aplicación
**[OBLIGATORIO]** Como mínimo, cumplir el OWASP Top 10 y estos controles:
*   **Autenticación:** en Next.js se usa NextAuth.js con el proveedor de identidad que indique PLAi. No se crean tablas propias de usuarios y contraseñas sin aprobación; las contraseñas nunca se guardan en texto plano.
*   **Validación de entradas en el servidor:** esquemas con zod (TypeScript) o Pydantic (Python). La validación del cliente no basta.
*   **Inyección:** consultas parametrizadas, SDK u ORM. Nunca concatenar SQL ni filtros con texto del usuario.
*   **XSS:** sanitizar el HTML enriquecido con DOMPurify; evitar `dangerouslySetInnerHTML` con datos sin sanitizar.
*   **Rate limiting** en login, formularios públicos y endpoints costosos.
*   **CORS** limitado a los dominios de PLAi; nunca `*` con credenciales.
*   **Errores:** no exponer trazas, consultas ni versiones de software al usuario final.
*   **Cabeceras de seguridad** (CSP, HSTS, X-Frame-Options): las aplica el Nginx de PLAi. La aplicación no debe depender de scripts en línea sin nonce ni cargar recursos de dominios no declarados.
*   **Dependencias:** sin vulnerabilidades conocidas críticas o altas al momento de la entrega, y sin paquetes abandonados.
*   **Datos personales:** tratarlos conforme a la normativa aplicable (LFPDPPP); no guardarlos en logs ni en entornos de prueba sin anonimizar.

## 8. Observabilidad
*   **[OBLIGATORIO]** Los logs se escriben en stdout/stderr, no en archivos. PLAi los recolecta con Promtail y Loki.
*   **[RECOMENDADO]** Logs estructurados en JSON con fecha y hora, nivel, mensaje e identificador de petición.
*   **[OBLIGATORIO]** Los logs no contienen contraseñas, tokens, datos de pago ni datos personales sensibles.
*   **[OBLIGATORIO]** Endpoint de salud (`/health` o `/api/health`) que responda 200 en menos de 1 segundo.
*   **[RECOMENDADO]** En servicios backend, endpoint `/metrics` en formato Prometheus, accesible solo desde la red interna.

## 9. Código fuente, calidad y entrega
*   **[OBLIGATORIO]** El código vive en un repositorio Git de PLAi, o se transfiere a PLAi al terminar, con su historial completo. Los commits son descriptivos (se recomienda Conventional Commits).
*   **[OBLIGATORIO]** `README.md` en español con: propósito, arquitectura, requisitos, cómo correr en local, variables de entorno, build, despliegue y decisiones técnicas relevantes.
*   **[OBLIGATORIO]** Lockfile versionado y dependencias con versión fija (`pnpm-lock.yaml`, `requirements.txt` con `==`).
*   **[OBLIGATORIO]** El linter pasa sin errores: ESLint 9 (JS/TS) o Ruff (Python).
*   **[OBLIGATORIO]** Pruebas automatizadas de la lógica de negocio crítica (Jest/Vitest o pytest) que se ejecutan con un solo comando.
*   **[OBLIGATORIO]** Los cambios de base de datos son migraciones versionadas y reproducibles (scripts SQL numerados o herramienta de migraciones). Nada de cambios manuales en producción.
*   **[RECOMENDADO]** TypeScript en modo strict y tipado completo de las respuestas de API.
*   **[OBLIGATORIO]** El sistema entregado no depende de cuentas, servidores, licencias ni servicios a nombre del proveedor.

## 10. Tecnologías que requieren aprobación previa
**[REQUIERE APROBACIÓN]** Las siguientes opciones no se aceptan en proyectos nuevos, salvo autorización por escrito. No aplica a plataformas de terceros que PLAi ya opera, como Moodle.

| No aceptado por defecto | Alternativa estándar |
| :--- | :--- |
| PHP, Laravel, WordPress u otros CMS monolíticos | Next.js + Directus |
| MySQL, MariaDB, MongoDB, SQL Server, Firebase | PostgreSQL |
| Python 2, Django 3.x o frameworks sin soporte vigente | Python 3.12 + FastAPI |
| Node.js anterior a 22, npm o yarn sin lockfile | Node.js 22 LTS + pnpm |
| Firebase Auth, Auth0, Cognito u otros servicios de identidad externos | NextAuth.js con el proveedor que indique PLAI |
| Hosting externo (Vercel, Netlify, Heroku, servidores del proveedor) | Infraestructura de PLAi (Docker Swarm) |
| Imágenes con `:latest` o contenedores que corren como root | Versión fija y usuario no root |
| Contenedores privilegiados, acceso a `docker.sock` o puertos 80/443 propios | Detrás de Traefik y Nginx, sin privilegios |
| SaaS de pago o con datos de usuarios fuera de PLAI | Evaluación de costo, seguridad y privacidad |

*Dudas y excepciones. Cualquier duda sobre este estándar, o una solicitud de excepción, se envía al área de Tecnología e Infraestructura de PLAi antes de iniciar el desarrollo. Este documento se actualiza cuando cambia el stack de producción; el proveedor debe trabajar con la versión vigente al firmar el contrato.*

## 11. Lista de verificación para aceptar el despliegue
El proveedor completa esta lista y la adjunta a cada entrega. El área de Tecnología la valida antes de publicar.

| Área | Criterio |
| :--- | :--- |
| **Arquitectura** | Propuesta validada y stack dentro de la sección 3, o desviación aprobada por escrito. |
| **Dockerfile** | Multi-etapa, imagen base con versión fija, usuario no root, puerto no privilegiado, HEALTHCHECK. |
| **Compose** | Funciona con `read_only`, `cap_drop ALL` y `no-new-privileges`; límites de recursos; sin `ports` publicados. |
| **Salud** | El endpoint `/health` responde 200 sin autenticación. |
| **Configuración** | `.env.example` completo y documentado; ninguna configuración de ambiente escrita en el código. |
| **Secretos** | Ninguno en el repo ni en la imagen; se leen desde Docker secrets (`/run/secrets`). |
| **Seguridad** | Escaneo Trivy sin vulnerabilidades CRITICAL/HIGH corregibles; dependencias actualizadas. |
| **Autenticación** | NextAuth.js con el proveedor de identidad indicado por PLAi (si el sistema tiene usuarios). |
| **Calidad** | Linter sin errores y pruebas automatizadas que pasan. |
| **Datos** | Migraciones versionadas y script o instrucciones de datos iniciales. |
| **Logs** | Salida a stdout/stderr, sin datos sensibles. |
| **Documentación** | README en español con build, despliegue, variables y arquitectura. |
| **Entrega** | [ ] Código completo en el repositorio de PLAi, sin dependencias de cuentas del proveedor. |

## 12. Anexo: imágenes de referencia en producción
Estas son las imágenes base y de servicios que hoy usa PLAI. Usarlas, o versiones más recientes de la misma línea, asegura la compatibilidad con la plataforma.

| Uso | Imagen |
| :--- | :--- |
| **Aplicaciones Node.js / Next.js** | `node:22-alpine3.22` |
| **Servicios Python** | `python:3.12-slim` |
| **Proxy y SPAs estáticas** | `nginx:1.27-alpine` |
| **Base de datos** | `postgres:16` / `timescale/timescaledb:2.17.2-pg16` |
| **CMS** | `directus/directus:11.x` |
| **Automatización** | `n8nio/n8n:2.x` |
| **Edge / proxy inverso** | `traefik:v3` |
| **Monitoreo** | `grafana/loki:3.4`, `grafana/promtail:3.4`, `prom/prometheus:v3`, `grafana/grafana:11` |