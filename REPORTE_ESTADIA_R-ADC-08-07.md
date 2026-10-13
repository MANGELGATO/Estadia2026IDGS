# FORMATO OFICIAL R-ADC-08-07
## REPORTE DE ESTADÍA PROFESIONAL
### NIVEL: INGENIERÍA EN DESARROLLO Y GESTIÓN DE SOFTWARE (ING DGS)

---

**Proyecto:**  
Desarrollo e Implementación de una Plataforma Digital para la Gestión, Consulta y Reservación de Recursos Tecnológicos y Espacios de PLAi

**Organización Receptora:**  
Plataforma Abierta de Innovación (PLAi) — Secretaría de Innovación, Ciencia y Tecnología (SICyT) del Gobierno del Estado de Jalisco

**Área de Desarrollo:**  
Laboratorio de Innovación, Robótica y Tecnologías Inmersivas

---

## Índice General

1. [Introducción](#1-introducción)  
   1.1 [Antecedentes](#11-antecedentes)  
   1.2 [Planteamiento del Problema](#12-planteamiento-del-problema)  
   1.3 [Objetivo](#13-objetivo)  
   &nbsp;&nbsp;&nbsp;&nbsp;1.3.1 [Objetivos Específicos](#131-objetivos-específicos)  
   1.4 [Hipótesis o Supuesto](#14-hipótesis-o-supuesto)  
   1.5 [Justificación](#15-justificación)  
   1.6 [Alcance del Proyecto](#16-alcance-del-proyecto)  
2. [Marco Teórico y de Referencia](#2-marco-teórico-y-de-referencia)  
   2.1 [Marco Teórico](#21-marco-teórico)  
   2.2 [Marco Contextual e Institucional](#22-marco-contextual-e-institucional)  
3. [Desarrollo: Métodos y Técnicas](#3-desarrollo-métodos-y-técnicas)  
   3.1 [Metodología de Desarrollo](#31-metodología-de-desarrollo)  
   3.2 [Especificación de Requerimientos](#32-especificación-de-requerimientos)  
   3.3 [Arquitectura General del Sistema](#33-arquitectura-general-del-sistema)  
   3.4 [Diseño Conceptual del Modelo de Datos](#34-diseño-conceptual-del-modelo-de-datos)  
   3.5 [Diseño de Interfaces de Usuario](#35-diseño-de-interfaces-de-usuario)  
4. [Análisis de Resultados](#4-análisis-de-resultados) *(Por desarrollar)*  
5. [Conclusiones y Recomendaciones](#5-conclusiones-y-recomendaciones) *(Por desarrollar)*  
6. [Glosario de Términos](#6-glosario-de-términos)  
7. [Bibliografía](#7-bibliografía) *(En formato APA 7ma Edición)*  
8. [Anexos](#8-anexos) *(Por desarrollar)*  

---

# 1. Introducción

El presente reporte de estadía profesional documenta el análisis, diseño, desarrollo e implementación de una plataforma digital web concebida para la gestión integral, consulta de especificaciones, control de disponibilidad y reservación de los recursos tecnológicos y espacios físicos de la Plataforma Abierta de Innovación (PLAi), organismo público adscrito a la Secretaría de Innovación, Ciencia y Tecnología (SICyT) del Gobierno del Estado de Jalisco.

En el marco de la formación profesional de la carrera de Ingeniería en Desarrollo y Gestión de Software, este proyecto surge como respuesta directa a una necesidad operativa prioritaria dentro del Laboratorio de Innovación, Robótica y Tecnologías Inmersivas de PLAi. Dicha entidad resguarda y opera una diversidad significativa de activos de hardware especializado —tales como visores de realidad virtual Meta Quest 3, drones, estaciones de cómputo de alto rendimiento, impresoras 3D y kits de robótica—, además de salones, auditorio y zonas de trabajo colaborativo que dan servicio constante a instituciones educativas, dependencias gubernamentales y empresas del sector productivo.

A través de la ingeniería de software aplicada, el proyecto transita de una dinámica de administración tradicional basada en registros aislados y hojas de cálculo hacia un sistema web moderno, seguro y escalable, alineado con las directrices normativas del *Estándar Tecnológico para Proyectos de Software de PLAi v1.0*. La plataforma centraliza el catálogo técnico, automatiza la asignación y préstamo de dispositivos bajo reglas de negocio anti-colisión, asegura la trazabilidad documental de cada resguardo y facilita la programación simultánea de espacios físicos y equipamiento especializado.

A lo largo de este primer capítulo se establecen las bases contextuales y metodológicas del proyecto. En primer término, se exponen los **antecedentes** históricos e institucionales de PLAi y su laboratorio; posteriormente, se detalla el **planteamiento del problema** diagnosticado en la gestión cotidiana; se definen con precisión el **objetivo general y los objetivos específicos** que orientan el desarrollo técnico; se postula la **hipótesis o supuesto** de trabajo; se fundamenta la **justificación** operativa, institucional y de seguridad que sustenta la solución propuesta; y, finalmente, se delimita el **alcance del proyecto**, distinguiendo con claridad sus entregables esenciales de los módulos complementarios de consolidación.

---

## 1.1 Antecedentes
La Plataforma Abierta de Innovación (PLAi) es un organismo público descentralizado del Estado de Jalisco, adscrito y coordinado bajo el marco institucional de la Secretaría de Innovación, Ciencia y Tecnología (SICyT) del Gobierno del Estado de Jalisco. Concebida como una iniciativa de vanguardia con sede en la Zona Metropolitana de Guadalajara, PLAi tiene como propósito fundamental impulsar la formación de talento especializado, cerrar brechas de competencias digitales avanzadas y fomentar la articulación estratégica entre la academia, el sector productivo y la administración pública.

Dentro de su oferta sustantiva, PLAi diseña e imparte programas de formación continua, diplomados, talleres de especialización técnica, programas de aceleración tecnológica, demostraciones y visitas guiadas interinstitucionales. Para hacer posible esta oferta de alto impacto, la institución dispone del **Laboratorio de Innovación, Robótica y Tecnologías Inmersivas**, una instalación equipada con infraestructura y activos tecnológicos de última generación. Entre su equipamiento destacan visores de realidad virtual de última generación (como Meta Quest 3), estaciones de cómputo de alto rendimiento para modelado y renderizado, drones para captura aérea y programación, kits de robótica educativa y colaborativa, impresoras 3D con tecnología FDM y resina, escáneres tridimensionales de alta precisión, así como un catálogo de licencias y aplicaciones informáticas de uso inmersivo y técnico.

De manera paralela, la infraestructura del laboratorio contempla la disposición de espacios físicos diseñados para el trabajo colaborativo y la impartición de eventos, tales como un auditorio principal, aulas tipo *maker*, salas de capacitación técnica, salas de juntas ejecutivas y zonas de *coworking*.

Las operaciones cotidianas del laboratorio dan servicio a tres perfiles de usuarios bien diferenciados:
1. **Instituciones Académicas:** Universidades públicas y privadas, institutos tecnológicos y bachilleratos técnicos que solicitan visitas guiadas, demostraciones de realidad virtual y talleres curriculares.
2. **Sector Público:** Secretarías de estado, dependencias de salud y organismos gubernamentales que requieren capacitación técnica y espacios equipados para actividades institucionales.
3. **Sector Privado y Ecosistema Emprendedor:** Empresas, comunidades tecnológicas y *startups* que demandan el uso de equipamiento especializado para pruebas de concepto, prototipado y eventos de innovación.

Para coordinar estas demandas, el personal del laboratorio gestiona habitualmente cuatro dinámicas operativas:
* **Atención y agendamiento formativo:** Recepción, evaluación y calendarización de solicitudes de cursos y talleres mediante flujos adaptados al tipo de institución solicitante.
* **Asignación y préstamo de equipamiento:** Preparación, calibración y entrega física de lotes de dispositivos y sus respectivos accesorios a instructores o colaboradores autorizados.
* **Control y resguardo de activos:** Seguimiento de la ubicación física de los equipos en almacén o en sala, registro de números de serie e identificadores de inventario estatal, asignación de responsables por resguardo, control de estados operativos (*Disponible, Reservado, En uso, En mantenimiento, Fuera de servicio*) y la supervisión del software cargado en cada terminal.
* **Coordinación de espacios físicos:** Programación de aulas y auditorios para evitar empalmes entre actividades formativas paralelas.

Históricamente, la gestión de esta información se ha realizado a través de registros en hojas de cálculo compartidas, libretas de control de resguardos y comunicaciones informales. Con el incremento acelerado en la oferta académica y en el volumen de dispositivos bajo resguardo del laboratorio, estos métodos tradicionales han comenzado a generar cuellos de botella administrativos y riesgos de extravío o descoordinación.

---

## 1.2 Planteamiento del Problema
A pesar de contar con equipamiento tecnológico y áreas físicas de clase mundial, el Laboratorio de Innovación de PLAi carece de un sistema informático centralizado que gobierne de manera automatizada el ciclo de vida de los activos y la reservación de sus instalaciones.

Esta situación ha derivado en una problemática operativa evidente en los siguientes puntos críticos:
* **Dispersión y fragmentación de los registros:** La información técnica y administrativa reside en archivos digitales locales aislados, lo que impide mantener una base de datos fidedigna y actualizada en tiempo real.
* **Invisibilidad de la disponibilidad inmediata:** Ante la solicitud de un curso o evento, el personal debe acudir físicamente al almacén o consultar con varios colaboradores para verificar si un lote de equipos (p. ej., 15 visores VR) está disponible, si ya fue apartado para otra sesión o si se encuentra en diagnóstico de mantenimiento.
* **Deficiencia en la trazabilidad y custodia:** Ausencia de un historial digital auditable que registre qué colaborador o usuario solicitó un equipo, con qué accesorios se entregó, en qué fecha debe devolverse y bajo qué carta responsiva quedó asignado.
* **Desvinculación operativa entre espacios físicos y recursos tecnológicos:** Falta de un mecanismo que garantice que, al reservar un aula o auditorio, se verifique y reserve al mismo tiempo el lote de equipamiento necesario para la actividad, generando escenarios donde se tiene la sala pero no los dispositivos disponibles, o viceversa.

---

## 1.3 Objetivo

### 1.3.1 Objetivo General
Diseñar, desarrollar e implementar una plataforma digital web centralizada para la gestión del inventario tecnológico, consulta de fichas técnicas, control de disponibilidad en tiempo real y reservación de equipos y espacios del Laboratorio de Innovación de PLAi, garantizando la integridad de los datos institucionales y optimizando los tiempos de respuesta operativa.

### 1.3.2 Objetivos Específicos
* **Estructurar un catálogo digital normalizado** de los recursos tecnológicos del laboratorio, detallando especificaciones técnicas, números de serie, códigos institucionales, aplicaciones instaladas, estado operativo y accesorios asociados.
* **Diseñar e implementar una arquitectura de software web moderna y escalable** basada en Next.js (App Router), TypeScript y Tailwind CSS, cumpliendo con los estándares de diseño institucional y accesibilidad web.
* **Desarrollar un módulo de gestión de préstamos y reservaciones** con lógica de negocio orientada a la validación de colisiones de horario, control de duraciones máximas de préstamo y confirmación estructurada de solicitudes.
* **Implementar un sistema de Control de Acceso Basado en Roles (RBAC)** con perfiles diferenciados (*Administrador, Colaborador y Usuario Final*), restringiendo las operaciones sensibles de inventario y edición a personal con permisos explícitos.
* **Construir un panel de control administrativo (*Dashboard*)** con visualización gráfica de métricas clave sobre el uso de recursos, equipos más demandados, estados del inventario e incidencias de mantenimiento preventivo y correctivo.
* **Empaquetar y desplegar el sistema conforme al Estándar Tecnológico Oficial de PLAi**, aplicando contenedores Docker multi-etapa, usuario sin privilegios de root, sistema de archivos de solo lectura y orquestación para Docker Swarm.

---

## 1.4 Hipótesis o Supuesto
La implementación de una plataforma web centralizada y automatizada permitirá reducir en al menos un 80% los tiempos administrativos dedicados a la consulta y asignación de equipos en el Laboratorio de PLAi, eliminando al 100% las colisiones de horario en la reservación de recursos y garantizando la trazabilidad documental de cada activo bajo resguardo institucional.

---

## 1.5 Justificación
La transición desde una administración manual y reactiva hacia una plataforma web centralizada representa una decisión estratégica de alto valor para PLAi:

* **Fuente Única de Verdad (*Single Source of Truth*):** Garantiza que toda la organización consulte los mismos datos sobre cantidades, estados y características del equipamiento, erradicando discrepancias entre departamentos.
* **Optimización del Tiempo Operativo:** El personal técnico y de vinculación puede consultar de forma instantánea la viabilidad de un taller o préstamo desde cualquier navegador, agilizando la atención a universidades y empresas.
* **Toma de Decisiones Estratégica Basada en Datos:** Al registrar sistemáticamente el uso de cada equipo y sus reportes de averías, la dirección de PLAi contará con métricas fidedignas para planear presupuestos futuros de mantenimiento, reemplazo o adquisición de hardware.
* **Integración Integral de Experiencias Formativas (Equipos + Espacios):** Resuelve la necesidad de sincronizar salas de trabajo con lotes de hardware especializado (por ejemplo, validar de forma automática que para un taller de fabricación digital se cuente simultáneamente con el Aula Maker y las impresoras 3D operativas).
* **Cumplimiento Normativo y Seguridad Informática:** El proyecto se alinea estrictamente al *Estándar Tecnológico para Proyectos de Software v1.0* de PLAi, asegurando que la aplicación sea segura frente a vulnerabilidades OWASP Top 10, no guarde secretos en código fuente y pueda ser orquestada sin fricción en los servidores gubernamentales de Docker Swarm.

---

## 1.6 Alcance del Proyecto

Para asegurar la viabilidad técnica y el cumplimiento de los tiempos de estadía profesional, el proyecto se delimita en dos vertientes:

### Alcance Principal (Núcleo Operativo):
1. **Módulo de Catálogo e Inventario Tecnológico:** Consulta y administración de equipos clasificados en: Realidad Virtual, Robótica, Fabricación Digital, Drones, Cómputo / Multimedia y Electrónica.
2. **Módulo de Fichas Técnicas Digitales:** Visualización detallada de características, manuales, software asociado y galería multimedia de casos de uso.
3. **Módulo de Solicitudes y Reservación de Dispositivos:** Formulario interactivo con reglas de préstamo (límite de tiempo, motivo de uso, resguardo institucional) y confirmación de estatus.
4. **Módulo Administrativo (*Backoffice*):** Paneles para dar de alta activos, actualizar estados operativos, programar bitácoras de mantenimiento y administrar usuarios mediante RBAC.

### Alcance Complementario (Módulo de Expansión):
1. **Gestión de Espacios Físicos:** Módulo de reservación de áreas como Auditorio, Salas de Capacitación y Coworking, enlazando la disponibilidad del espacio con el equipamiento tecnológico solicitado.
2. **Métricas y Reportes de Gestión:** Módulo de analítica con gráficos interactivos que muestran la tasa de disponibilidad y utilización mensual de los recursos.

---

# 2. Marco Teórico y de Referencia

## 2.1 Marco Teórico

### 2.1.1 Arquitectura Web Moderna Basada en Componentes y Next.js
Tradicionalmente, las aplicaciones web han oscilado entre el renderizado tradicional del lado del servidor (*Server-Side Rendering*, SSR) de páginas monolíticas y las aplicaciones de página única (*Single Page Applications*, SPA) renderizadas en el navegador mediante JavaScript. 

El presente proyecto adopta **Next.js 16 (App Router)** junto con **React 19**, una arquitectura moderna que integra lo mejor de ambos paradigmas a través de **React Server Components (RSC)**:
* **Renderizado Híbrido:** Las vistas estáticas y la obtención de datos sensibles se ejecutan en el servidor, generando HTML ligero y seguro que se transmite al navegador sin exponer credenciales ni tokens de base de datos.
* **Interactividad en el Cliente (*Client Components*):** Los elementos interactivos como filtros dinámicos, carruseles y formularios modales se hidratan selectivamente en el cliente, logrando una experiencia de usuario fluida e instantánea sin recargas de página.

### 2.1.2 Sistemas de Diseño Atómico con Tailwind CSS y daisyUI
La construcción de la interfaz gráfica se basa en **Tailwind CSS 4.x**, un framework de utilidades CSS de última generación que compila únicamente las clases utilizadas, optimizando el peso de las hojas de estilo y erradicando conflictos de especificidad global. Se complementa con **daisyUI 5**, permitiendo implementar componentes semánticos y accesibles (*modales, tarjetas, botones, badges de estado*) que siguen fielmente la guía de estilo institucional de PLAi (paleta basada en `#a81e71` y `#1B365D`, con tipografías *Montserrat* para encabezados y *Mulish* para lectura).

### 2.1.3 Gestión de Activos de Tecnologías de la Información (ITAM)
La disciplina *IT Asset Management* (ITAM) define las prácticas requeridas para rastrear, gestionar y mantener el ciclo de vida de los activos tecnológicos de una organización. El proyecto implementa los principios de ITAM para garantizar la trazabilidad integral de los equipos:
* Identificación unívoca (número de serie y clave de inventario).
* Ciclo de vida operativo (*Alta -> Operación -> Mantenimiento preventivo/correctivo -> Baja definitiva*).
* Custodia y responsabilidad mediante cartas responsivas digitales.

### 2.1.4 Modelo de Seguridad y Control de Acceso Basado en Roles (RBAC)
El modelo RBAC (*Role-Based Access Control*) desacopla los privilegios de acceso de los usuarios concretos, asignando permisos a roles definidos formalmente en el sistema:
* **Administrador:** Control total sobre altas, bajas, modificaciones de inventario, cambio de estados, aprobación de solicitudes y gestión de usuarios.
* **Colaborador:** Capacidad de solicitar préstamos de equipo, reservar espacios para sus actividades y consultar bitácoras de asignación.
* **Usuario Final / Visitante:** Acceso de solo lectura al catálogo público de recursos, especificaciones y experiencias tecnológicas disponibles.

### 2.1.5 Contenerización Segura y Despliegue en Docker Swarm
Conforme a la norma técnica de PLAi, el software se empaqueta como un microservicio en un contenedor Docker optimizado:
* **Construcción Multi-Etapa (*Multi-stage build*):** Separa las dependencias de compilación del entorno final de producción, reduciendo el tamaño de la imagen final a menos de 180 MB sobre Alpine Linux.
* **Principio de Menor Privilegio:** Ejecución bajo un usuario del sistema sin privilegios de administrador (`UID 1001`), sistema de archivos montado en modo de solo lectura (`read_only: true`), descarte total de capacidades de kernel (`cap_drop: [ALL]`) y lectura de secretos mediante Docker Secrets montados en tiempo de ejecución.

---

## 2.2 Marco Contextual e Institucional

### 2.2.1 La Plataforma Abierta de Innovación (PLAi)
PLAi representa una de las apuestas de política pública más relevantes del Gobierno del Estado de Jalisco en materia de innovación y tecnología. Diseñada como un nodo articulador entre los ecosistemas de talento de las universidades y las demandas del sector tecnológico en Ciudad Creativa Digital y el corredor tecnológico de Guadalajara, PLAi ofrece un entorno donde la teoría académica se encuentra con el hardware de vanguardia.

### 2.2.2 El Laboratorio de Innovación, Robótica y Tecnologías Inmersivas
El laboratorio no es un almacén pasivo de equipos, sino un centro de experimentación activa donde convergen investigadores, docentes, desarrolladores independientes y estudiantes. Esta dinámica abierta exige que sus procesos de control tecnológico no sean burocráticos ni lentos, sino ágiles, transparentes y digitales, proyectando la misma innovación que promueven sus propios talleres.

---

# 3. Desarrollo: Métodos y Técnicas

## 3.1 Metodología de Desarrollo
Para el desarrollo de la plataforma se implementa una adaptación de la metodología ágil **Scrum**, organizada en ciclos iterativos e incrementales (*Sprints* de dos semanas). Esta metodología permite validar de manera temprana las pantallas y la lógica de negocio con los responsables del laboratorio de PLAi, ajustando requerimientos de forma ágil antes de la entrega final.

El ciclo de desarrollo contempla las siguientes fases:
1. **Fase 1: Análisis y Levantamiento de Requerimientos:** Entrevistas con el personal de PLAi, categorización del inventario y definición de reglas de préstamo.
2. **Fase 2: Diseño de Arquitectura y Prototipado:** Modelado de entidades relacionales, diseño de componentes en Tailwind CSS y validación visual de la experiencia de usuario (UX).
3. **Fase 3: Desarrollo Incremental del Frontend y Lógica de Negocio:** Construcción de módulos de catálogo, panel de control administrativo, agenda y reservaciones.
4. **Fase 4: Pruebas Unitarias y Aseguramiento de Calidad:** Implementación de pruebas automatizadas con Vitest para validar las reglas de colisión de préstamos y la configuración de entorno.
5. **Fase 5: Contenerización y Alineación al Estándar PLAi:** Generación del Dockerfile multi-etapa, configuración de Docker Swarm compose y verificación de endpoints de salud.

## 3.2 Especificación de Requerimientos

### 3.2.1 Requerimientos Funcionales (RF)
* **RF-01 (Catálogo Público de Recursos):** El sistema debe permitir a cualquier usuario explorar el inventario de equipos clasificados por tecnología, visualizando fotografías, descripciones técnicas y casos de éxito.
* **RF-02 (Búsqueda y Filtrado Dinámico):** El sistema debe permitir filtrar equipos por categoría (*VR, Robótica, Impresión 3D, Cómputo*) y disponibilidad en tiempo real sin recargar la página.
* **RF-03 (Ficha Técnica y Detalle del Activo):** El sistema debe desplegar la información completa de cada dispositivo, incluyendo identificador institucional, especificaciones de hardware y aplicaciones compatibles.
* **RF-04 (Módulo de Solicitud de Préstamo):** Los usuarios autorizados deben poder solicitar la reserva de uno o más equipos seleccionando fecha, franja horaria y motivo de uso.
* **RF-05 (Validación de Reglas de Préstamo):** El sistema debe validar de manera automática que el horario de término sea posterior al de inicio y que la duración máxima del préstamo no exceda el límite permitido (2 horas por defecto).
* **RF-06 (Gestión Administrativa de Inventario):** Los administradores deben poder crear, editar, dar de baja o cambiar el estado operativo de los equipos (*Disponible, Reservado, En mantenimiento, Inactivo*).
* **RF-07 (Control de Mantenimientos e Incidencias):** El sistema debe permitir registrar incidencias técnicas, asignar técnicos responsables y monitorear el estado de reparación de los dispositivos.
* **RF-08 (Panel de Analítica y Estadísticas):** El sistema debe generar gráficas sobre el uso de recursos, porcentaje de disponibilidad y actividades mensuales.

### 3.2.2 Requerimientos No Funcionales (RNF)
* **RNF-01 (Rendimiento y Tiempo de Respuesta):** El endpoint de salud (`/api/health`) y la carga inicial de catálogos deben responder en menos de 1 segundo.
* **RNF-02 (Seguridad y Menor Privilegio):** La aplicación debe ejecutarse en contenedores bajo usuario no root (`node:22-alpine` con UID 1001) y con sistema de archivos en modo `read_only`.
* **RNF-03 (Compatibilidad y Responsividad):** La interfaz debe adaptarse fluidamente a dispositivos móviles, tabletas y pantallas de escritorio mediante diseño responsivo.
* **RNF-04 (Mantenibilidad y Calidad de Código):** El código fuente debe apegarse a tipado estricto con TypeScript, pasar el linter ESLint 9 con 0 errores y contar con pruebas automatizadas en Vitest.

## 3.3 Arquitectura General del Sistema
El sistema se organiza en una arquitectura de capas moderna y desacoplada:

```
[ Navegador Web del Usuario ]
           │  (HTTPS / TLS 1.3)
           ▼
[ Proxy Traefik v3 (Entrada única PLAi) ]
           │  (Red Overlay interna)
           ▼
[ Contenedor Next.js 16 (Standalone, Puerto 3000) ]
   ├── Capa de Presentación (React 19 + Tailwind CSS + daisyUI)
   ├── Capa de Enrutamiento y Middleware (App Router + RBAC)
   ├── Capa de Lógica de Negocio (lib/reservation.ts, lib/env.ts)
   └── Capa de Persistencia y Acceso a Datos (Directus SDK / Route Handlers)
```

## 3.4 Diseño Conceptual del Modelo de Datos
El modelo de datos relacional organiza las siguientes entidades clave:
* **`Equipos` / `Recursos`:** (`id`, `nombre`, `categoria_id`, `numero_serie`, `codigo_institucional`, `estado`, `fecha_adquisicion`, `especificaciones`).
* **`Categorias`:** (`id`, `nombre`, `slug`, `icono`, `video_url`).
* **`Reservaciones`:** (`id`, `usuario_id`, `recurso_id`, `fecha`, `hora_inicio`, `hora_fin`, `actividad`, `observaciones`, `estado_solicitud`).
* **`Espacios`:** (`id`, `nombre`, `capacidad_aforo`, `ubicacion`, `estado`).
* **`Mantenimientos`:** (`id`, `equipo_id`, `reportado_por`, `tecnico_asignado`, `fecha_reporte`, `fecha_resolucion`, `prioridad`, `estado`).
* **`Usuarios`:** (`id`, `nombre`, `email`, `rol`, `estado`, `ultimo_acceso`).

## 3.5 Diseño de Interfaces de Usuario
Las interfaces fueron maquetadas siguiendo una jerarquía visual estructurada y accesible:
* **Cabecera Institucional y Navegación:** Acceso rápido a categorías, búsqueda y autenticación.
* **Catálogo en Malla Dinámica:** Tarjetas visuales de equipos con indicadores de estado mediante códigos de color semánticos (verde: disponible; amarillo: en mantenimiento; rojo: ocupado).
* **Formulario Modal de Reservación:** Formulario asistido con selección visual de fecha, hora y confirmación de lineamientos de uso.
* **Módulo Administrativo:** Tablas de datos con paginación, acciones contextuales de edición y estadísticas de inventario.

---

# 6. Glosario de Términos

*(Términos técnicos seleccionados para investigación, definición y estandarización académica en el documento final)*:

* **Next.js (App Router)**
* **React Server Components (RSC)**
* **Client Components**
* **TypeScript**
* **Tailwind CSS**
* **daisyUI**
* **Docker y Contenedores Multi-Etapa**
* **Docker Swarm**
* **Traefik v3**
* **Directus CMS**
* **Control de Acceso Basado en Roles (RBAC)**
* **IT Asset Management (ITAM)**
* **API RESTful**
* **Vitest**
* **Linting / ESLint**
* **Meta Quest 3 (Tecnología Inmersiva)**
* **Single Source of Truth (SSOT)**
* **LFPDPPP (Ley Federal de Protección de Datos Personales)**

---

# 7. Bibliografía
*(En formato APA 7ma Edición)*

1. Bass, L., Clements, P., & Kazman, R. (2021). *Software Architecture in Practice* (4th ed.). Addison-Wesley Professional.
2. Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
3. Open Web Application Security Project. (2021). *OWASP Top 10:2021 - The Ten Most Critical Web Application Security Risks*. https://owasp.org/Top10/
4. Plataforma Abierta de Innovación. (2026). *Estándar Tecnológico para Proyectos de Software (Versión 1.0)*. Dirección de Tecnología e Infraestructura, PLAi.
5. Pressman, R. S., & Maxim, B. R. (2020). *Software Engineering: A Practitioner's Approach* (9th ed.). McGraw-Hill Education.
6. React Core Team. (2024). *React Documentation: Server Components and Architecture*. Meta Open Source. https://react.dev
7. Vercel Inc. (2026). *Next.js Documentation: App Router and Standalone Deployment*. https://nextjs.org/docs
