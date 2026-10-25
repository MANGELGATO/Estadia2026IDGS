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
   2.1 [Contexto Institucional y Marco de Referencia (PLAi y SSOT)](#21-contexto-institucional-y-marco-de-referencia)  
   2.2 [Paradigmas Web y Selección del Stack Tecnológico (Análisis Comparativo)](#22-paradigmas-web-y-selección-del-stack-tecnológico-análisis-comparativo)  
   2.3 [Diseño de Interfaz, Estilos y Experiencia de Usuario (UI/UX)](#23-diseño-de-interfaz-estilos-y-experiencia-de-usuario-uiux)  
   2.4 [Gestión de Persistencia y Bases de Datos (RDBMS, ACID y Directus)](#24-gestión-de-persistencia-y-bases-de-datos)  
   2.5 [Gobernanza de Datos, Seguridad, RBAC y Rate Limiting](#25-gobernanza-de-datos-seguridad-y-control-de-acceso)  
   2.6 [Metodología de Desarrollo Ágil y Despliegue en la Nube (Scrum y Docker Swarm)](#26-metodología-de-desarrollo-y-despliegue-en-la-nube)  
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

---

## 2.1 Contexto Institucional y Marco de Referencia

### 2.1.1 La Plataforma Abierta de Innovación y Desarrollo de Jalisco (PLAi)
La **Plataforma Abierta de Innovación y Desarrollo de Jalisco (PLAi)** se constituye como un organismo público descentralizado y ecosistema estratégico del Gobierno del Estado de Jalisco, diseñado para impulsar el aprendizaje continuo, el emprendimiento y el desarrollo profesional con un marcado énfasis en la innovación, la tecnología y la creatividad (PLAi, s. f.). Concebida para elevar la competitividad regional y cultivar el talento local para la era digital, PLAi articula sus soluciones mediante tres ejes rectores: **Aprender, Conectar e Innovar** (PLAi, s. f.).

Para el cumplimiento de sus objetivos institucionales, PLAi no solo ofrece programas de capacitación virtual, sino que dispone de instalaciones físicas de uso público en la Ciudad Creativa Digital de Guadalajara, destinadas a fomentar el trabajo colaborativo, generar un ambiente de creatividad y propiciar la creación de soluciones e ideas innovadoras (PLAi, s. f.). Entre estas instalaciones se encuentran auditorios, aulas maker, salas de juntas y laboratorios equipados con tecnología de vanguardia (PLAi, s. f.). 

La administración eficiente de este patrimonio tecnológico y espacio físico exige un control operativo riguroso que evite la falta de visibilidad en tiempo real sobre la ubicación, número de serie, estado y disponibilidad de los equipos (Guía R-ADC-08-07, s. f.). Por consiguiente, el proyecto busca la transición desde esquemas de gestión manuales hacia una infraestructura digital unificada siguiendo la estructura oficial del formato **R-ADC-08-07** (Guía R-ADC-08-07, s. f.).

---

### 2.1.2 Del Registro Disperso a la Fuente Única de la Verdad (SSOT)
Históricamente, las organizaciones han gestionado sus inventarios y recursos mediante archivos de hoja de cálculo aislados o bitácoras manuales que generan **silos de datos**, definidos como bases de datos que forman parte de la misma empresa pero que están aisladas y no comparten información entre ellas (Single Source of Truth, s. f.). La existencia de silos de datos puede provocar efectos negativos en una organización, tales como la toma de decisiones erróneas, la duplicación de esfuerzos o inconsistencias en los registros (Single Source of Truth, s. f.).

Para erradicar la fragmentación operativa en PLAi, la plataforma digital se fundamenta en el principio de **Single Source of Truth (SSOT)** o Fuente Única de la Verdad. Una SSOT se define como una biblioteca centralizada de datos que almacena la información más actualizada, completa y precisa de una organización, agregando datos provenientes de distintos sistemas y aplicaciones (Single Source of Truth, s. f.).

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUENTES REGISTRALES PREVIAS                  │
│   Hoja de Cálculo A       Hoja de Cálculo B     Bitácora Física │
└─────────────────┬──────────────────┬──────────────────┬─────────┘
                  │                  │                  │
                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SILOS DE DATOS Y DUPLICIDAD                 │
│        (Registros inconsistentes, colisión de horarios)         │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼  [Implementación de SSOT]
┌─────────────────────────────────────────────────────────────────┐
│              SINGLE SOURCE OF TRUTH (PLATAFORMA PLAi)            │
│      Catálogo Único · Fichas Técnicas · Reservaciones en Vivo    │
└─────────────────────────────────────────────────────────────────┘
```

La adopción del modelo SSOT aporta ventajas estratégicas fundamentales:
1. **Reducción de costes:** Hace más sencilla la gestión de datos dentro de una empresa y reduce los recursos destinados a infraestructura y personal (Single Source of Truth, s. f.).
2. **Eliminación de la duplicación de datos:** Optimiza el espacio de almacenamiento e integra los datos para evitar que entren en contradicción (Single Source of Truth, s. f.).
3. **Aceleración en la recuperación de datos:** Simplifica la detección e identificación de información alterada o requerida (Single Source of Truth, s. f.).
4. **Aumento de la transparencia:** Promueve la cultura de la transparencia al garantizar que todos los miembros del equipo tengan acceso a la misma fuente de datos sin diferencias (Single Source of Truth, s. f.).

---

## 2.2 Paradigmas Web y Selección del Stack Tecnológico (Análisis Comparativo)

### 2.2.1 Lenguajes de Programación y Entornos de Ejecución: JavaScript / Node.js vs. PHP
**JavaScript (JS)** es un lenguaje de programación ligero, interpretado o compilado justo-a-tiempo (*JIT*), dinámico y basado en prototipos, utilizado ampliamente en el desarrollo web (MDN, s. f.). Creado por Ryan Dahl en 2009, **Node.js** nació como respuesta a la necesidad de ejecutar código JavaScript del lado del servidor (*server-side*), fuera del navegador web (Alura Cursos Online, 2025).

Node.js es un entorno de ejecución (*runtime*) que utiliza el motor **V8 de Google** (desarrollado en C++) para interpretar y traducir el código en un bytecode optimizado para la máquina (Alura Cursos Online, 2025). A diferencia de los entornos de servidor tradicionales basados en **PHP** (PHP Documentation, s. f.), Node.js destaca por ser un sistema asíncrono, *single-threaded* (de un solo hilo) y orientado a eventos (Alura Cursos Online, 2025). Al ser un sistema de un solo hilo, Node.js no necesita administrar múltiples hilos en paralelo, lo que optimiza el proceso y el consumo de memoria de la aplicación al manejar operaciones no bloqueantes (Alura Cursos Online, 2025).

##### Tabla 2.1: Comparativa Técnica entre Node.js (JavaScript) y PHP Tradicional

| Criterio / Modelo | Node.js (JavaScript Runtime) | PHP (Servidor Web Tradicional) | Impacto en el Proyecto PLAi |
| :--- | :--- | :--- | :--- |
| **Modelo de Concurrencia** | Asíncrono, *Non-Blocking I/O*, basado en bucle de eventos (Alura Cursos Online, 2025). | Síncrono por petición en servidor web (PHP Documentation, s. f.). | Permite atender múltiples solicitudes de reservación simultáneas sin bloquear el servidor. |
| **Consumo de Memoria** | Ligero; optimiza el consumo al no administrar hilos paralelos (Alura Cursos Online, 2025). | Mayor sobrecarga por proceso e hilo instanciado. | Optimiza la infraestructura de contenedores en el despliegue institucional. |
| **Ecosistema y Lenguaje** | Lenguaje unificado en *Frontend* y *Backend* mediante JS (Alura Cursos Online, 2025). | Lenguaje exclusivo del lado del servidor (PHP Documentation, s. f.). | Reduce la curva de desarrollo utilizando JavaScript y TypeScript en toda la pila. |
| **Gestión de Paquetes** | pnpm / NPM (*Node Package Manager*) (Alura Cursos Online, 2025). | Composer (*PHP Dependency Manager*) (Laravel, s. f.). | Facilita la integración de librerías modernas de interfaz y validación estricta. |

---

### 2.2.2 Frameworks y Arquitecturas Web: Next.js (React) vs. Laravel (PHP)

#### **React y el Paradigma de Componentes**
**React** es una biblioteca de JavaScript diseñada para construir interfaces de usuario interactivas mediante piezas individuales y reutilizables llamadas componentes (React, s. f.). Los desarrolladores combinan estos elementos utilizando la sintaxis de marcado **JSX**, una extensión de JavaScript que facilita la creación y mantenimiento de componentes (React, s. f.). Aunque React permite agrupar componentes, no prescribe cómo hacer el enrutamiento o la obtención de datos, recomendando el uso de un framework *full-stack* (React, s. f.).

#### **Next.js y el Renderizado Híbrido Full-Stack**
**Next.js** es un framework de React diseñado para construir aplicaciones web *full-stack* que configura automáticamente herramientas subyacentes como compiladores y empaquetadores (Next.js Docs, s. f.). A través de su arquitectura **App Router**, Next.js soporta capacidades modernas de React como los **React Server Components (RSC)**, permitiendo ejecutar componentes y obtener datos directamente en el servidor sin exponer credenciales ni tokens sensibles en el cliente (Next.js Docs, s. f.).

#### **Laravel y la Arquitectura Monolítica MVC Tradicional**
Por su parte, **Laravel** es un framework de aplicaciones web en PHP con sintaxis expresiva y elegante, diseñado para construir aplicaciones monolíticas (mediante plantillas Blade) o arquitecturas API backend (Laravel, s. f.).

##### Tabla 2.2: Comparativa de Arquitectura: Next.js (App Router / RSC) vs. Laravel (MVC / Blade)

| Característica | Next.js (App Router + RSC) | Laravel (MVC + Blade Monolítico) | Sustento para la Elección en PLAi |
| :--- | :--- | :--- | :--- |
| **Arquitectura Principal** | Híbrida: *Server Components* (RSC) y componentes de cliente (Next.js Docs, s. f.). | Monolítica MVC con motor de plantillas en servidor (*Blade*) (Laravel, s. f.). | **Next.js:** Permite procesar datos pesados en servidor entregando una interfaz ágil. |
| **Navegación e Interactividad** | Reactiva y fluida; basada en componentes reactivos (React, s. f.). | Renderización de vistas completas en servidor por petición (Laravel, s. f.). | Mejora la experiencia de usuario (UX) al consultar disponibilidad en tiempo real. |
| **Obtención de Datos** | *Data fetching* integrado en componentes asíncronos de servidor (React, s. f.). | Consultas integradas en controladores y capa Eloquent (Laravel, s. f.). | Next.js simplifica el flujo de datos directo a la interfaz del inventario. |

---

## 2.3 Diseño de Interfaz, Estilos y Experiencia de Usuario (UI/UX)

### 2.3.1 Hoja de Estilos en Cascada (CSS) y los Desafíos de Escalabilidad
**CSS (Hojas de Estilo en Cascada)** es el lenguaje de estilos utilizado para describir la presentación visual y maquetación de documentos estructurados en HTML o XML (MDN, s. f.). A medida que las aplicaciones web crecen, el manejo de CSS tradicional puede presentar problemas de especificidad global y mantenimiento en las hojas de estilo.

---

### 2.3.2 Enfoque Utility-First con Tailwind CSS y daisyUI
**Tailwind CSS** opera mediante un enfoque *zero-runtime* que escanea los archivos HTML y componentes JavaScript del proyecto para detectar clases de utilidad, generando únicamente los estilos correspondientes en un archivo CSS estático (Tailwind CSS, s. f.). La integración de Tailwind CSS v4 mediante `@tailwindcss/postcss` y el motor de compilación Turbopack de Next.js ofrece un flujo de compilación ágil y optimizado para proyectos web modernos sin sobrecarga de estilos en tiempo de ejecución (Tailwind CSS, s. f.). Asimismo, la biblioteca de componentes semánticos **daisyUI** aporta elementos accesibles (*modales, tarjetas, badges semánticos*) que respetan la paleta institucional de PLAi.

##### Tabla 2.3: Comparativa Técnica: CSS Tradicional vs. Utility-First CSS (Tailwind CSS)

| Criterio | CSS Tradicional / Metodología BEM | Utility-First CSS (Tailwind CSS) | Impacto e Integración en PLAi |
| :--- | :--- | :--- | :--- |
| **Generación de Estilos** | Hojas de estilo globales escritas manualmente (MDN, s. f.). | Escaneo de clases y generación estática *zero-runtime* (Tailwind CSS, s. f.). | Elimina código no utilizado y optimiza el tamaño del archivo CSS. |
| **Mantenibilidad** | Riesgo de colisiones globales por la cascada. | Clases de utilidad aplicadas directamente en el marcado (Tailwind CSS, s. f.). | Garantiza modularidad en los componentes JSX del catálogo. |
| **Velocidad de Desarrollo** | Cambio de contexto constante entre HTML y CSS. | Estilizado ágil e inmediato sobre los componentes de React (Tailwind CSS, s. f.). | Acelera la construcción del panel de reservaciones y tablas. |

---

## 2.4 Gestión de Persistencia y Bases de Datos

### 2.4.1 Paradigma Relacional (RDBMS) vs. Paradigma Orientado a Documentos (NoSQL)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      EVALUACIÓN DE PARADIGMAS DE BD                      │
├────────────────────────────────────┬────────────────────────────────────┤
│     MODELO RELACIONAL (RDBMS)      │    MODELO DOCUMENTAL (NOSQL)      │
│  (PostgreSQL / MySQL)              │          (MongoDB)                 │
├────────────────────────────────────┼────────────────────────────────────┤
│ • Esquema estricto con Tablas/FKs  │ • Colecciones de documentos JSON   │
│ • Transacciones ACID nativas       │ • Esquema flexible sin esquemas    │
│ • Validaciones de integridad       │ • Inserción rápida no estructurada │
└─────────────────┬──────────────────┴────────────────────────────────────┘
                  │
                  ▼  [Requerimiento Crítico en PLAi]
┌─────────────────────────────────────────────────────────────────────────┐
│               EXIGENCIA OPERATIVA: CONTROL DE RESERVACIONES              │
│       Prevención de colisiones dobles + Integridad referencial estricta  │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼  [Selección Justificada]
┌─────────────────────────────────────────────────────────────────────────┐
│               SISTEMA DE GESTIÓN DE BASE DE DATOS RELACIONAL            │
└─────────────────────────────────────────────────────────────────────────┘
```

#### **Bases de Datos Documentales (NoSQL: MongoDB)**
**MongoDB** es una base de datos operativa orientada a documentos diseñada como alternativa a las bases de datos relacionales, permitiendo almacenar documentos enriquecidos tipo JSON (MongoDB Docs, s. f.). Aunque MongoDB ofrece soporte para **transacciones ACID estrictas** y escalado horizontal (MongoDB Docs, s. f.), el modelado de datos sin esquemas relacionales estrictos dificulta el control de reglas relacionales complejas entre usuarios y recursos.

#### **Bases de Datos Relacionales (RDBMS: PostgreSQL / MySQL)**
Por otro lado, los motores relacionales como **MySQL** (MySQL Documentation, s. f.) o **PostgreSQL** (PostgreSQL Documentation, s. f.) organizan la información mediante esquemas basados en tablas y relaciones explícitas, garantizando la integridad referencial a nivel de motor.

---

### 2.4.2 Análisis de Consistencia (ACID) y Manejo de Reservaciones
Para evitar la asignación duplicada de aulas o visores VR, las propiedades **ACID** (Atomicidad, Consistencia, Aislamiento y Durabilidad) garantizan que las operaciones compuestas en la base de datos se ejecuten sin errores ni interferencias concurrentes (MongoDB Docs, s. f.).

##### Tabla 2.4: Comparativa de Motores de Base de Datos: Relacionales vs. Documental (MongoDB)

| Característica | Relacional (PostgreSQL / MySQL) | Documental NoSQL (MongoDB) | Justificación para el Proyecto PLAi |
| :--- | :--- | :--- | :--- |
| **Estructura de Datos** | Tablas estructuradas con tipos estrictos y claves foráneas (MySQL Documentation, s. f.). | Documentos JSON flexibles mapeados a objetos (MongoDB Docs, s. f.). | **Relacional:** Atributos fijos y conocidos para el inventario tecnológico. |
| **Integridad Referencial** | Restricciones nativas entre tablas a nivel de base de datos (PostgreSQL Documentation, s. f.). | Manejo manual de referencias interdocumentales. | **Relacional:** Garantiza la consistencia entre solicitudes, usuarios y equipos. |
| **Concurrencia y ACID** | Bloqueo estricto de transacciones relacionales y claves únicas. | Soporte para transacciones ACID estrictas (MongoDB Docs, s. f.). | **Relacional:** Previene la sobreposición de horarios en reservaciones simultáneas. |

---

### 2.4.3 Paradigma Headless CMS (Directus 11 sobre PostgreSQL)
Conforme a las directrices normativas del *Estándar Tecnológico para Proyectos de Software de PLAi v1.0*, los catálogos y contenidos administrables deben operar bajo el paradigma de **Headless CMS** mediante **Directus 11** conectado a la base de datos PostgreSQL. Esta arquitectura desacopla el almacenamiento y modelado de datos respecto a la capa de presentación visual. Los administradores gestionan los activos, categorías y fichas técnicas a través de la interfaz autogenerada de Directus, mientras que la aplicación Next.js consume los datos de manera segura mediante `@directus/sdk` del lado del servidor (*Server-Side*), eliminando la exposición de credenciales y centralizando la gobernanza del inventario.

---

## 2.5 Gobernanza de Datos, Seguridad y Control de Acceso

### 2.5.1 Principios de Seguridad Web y el Estándar OWASP Top 10:2025
El **Proyecto Abierto de Seguridad de Aplicaciones Web (OWASP)** es una organización internacional sin fines de lucro enfocada en mejorar la seguridad del software web mediante recursos de libre acceso (Cloudflare, s. f.). Su publicación insignia, el **OWASP Top 10**, es un informe actualizado periódicamente que representa el consenso global sobre los riesgos de seguridad más críticos para aplicaciones web (OWASP Top 10:2025, s. f.).

En la versión **OWASP Top 10:2025**, la vulnerabilidad **A01:2025 – Broken Access Control (Pérdida o Fallo en el Control de Acceso)** encabeza la lista de riesgos prioritarios (OWASP Top 10:2025, s. f.). El control de acceso rige los mecanismos que conceden o restringen permisos sobre la información y funcionalidades; sus fallos permiten a un atacante eludir la autorización y actuar como un usuario privilegiado (Cloudflare, s. f.).

---

### 2.5.2 Control de Acceso Basado en Roles (RBAC), Rate Limiting y Protección LFPDPPP
Los controles de acceso se aseguran garantizando que la aplicación utilice **tokens de autorización** y establezca restricciones estrictas sobre los mismos (Cloudflare, s. f.). La adopción del modelo de **Control de Acceso Basado en Roles (RBAC)** asigna permisos específicos a roles del sistema (Administrador, Colaborador, Usuario General), asegurando que cada perfil interactúe exclusivamente con los módulos autorizados (Cloudflare, s. f.).

##### Tabla 2.5: Comparativa de Modelos de Control de Acceso en Software

| Modelo | Definición y Funcionamiento | Aplicabilidad en el Proyecto PLAi |
| :--- | :--- | :--- |
| **DAC** *(Discretionary Access Control)* | El propietario asigna accesos a su discreción. | **Inadecuado:** Generaría falta de control centralizado sobre el patrimonio institucional. |
| **RBAC** *(Role-Based Access Control)* | Permisos asignados a roles definidos por la organización (Cloudflare, s. f.). | **Seleccionado:** Mitiga el riesgo *OWASP A01:2025* al restringir módulos según el rol (OWASP Top 10:2025, s. f.). |
| **ABAC** *(Attribute-Based Access Control)* | Evaluación dinámica por atributos y contexto. | **Innecesario:** Añade complejidad técnica innecesaria para el alcance actual. |

Asimismo, en cumplimiento con el estándar de seguridad de PLAi y la **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)**, la plataforma resguarda las identificaciones oficiales (INE) y cartas responsivas requeridas para los préstamos con estricto control de confidencialidad y sanitización de registros. Adicionalmente, se implementa una política activa de **Rate Limiting** (limitación de tasa de solicitudes) con algoritmo de ventana deslizante en memoria, mitigando eficazmente intentos de fuerza bruta en los endpoints de autenticación y previniendo la saturación maliciosa en los formularios públicos de reservación.

---

## 2.6 Metodología de Desarrollo y Despliegue en la Nube

### 2.6.1 Marco de Trabajo Ágil Scrum (Guía de Scrum 2020)
**Scrum** es un marco de trabajo liviano desarrollado por Ken Schwaber y Jeff Sutherland que ayuda a personas, equipos y organizaciones a generar valor mediante soluciones adaptativas para problemas complejos (Schwaber y Sutherland, 2020). Se fundamenta en el **empirismo** (el conocimiento proviene de la experiencia) y el **pensamiento Lean** (reducción de desperdicios), sosteniéndose sobre tres pilares: **Transparencia, Inspección y Adaptación** (Schwaber y Sutherland, 2020).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CICLO DE SPRINT EN SCRUM                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐    │
│   │ Product      │ ──► │ Sprint Planning  │ ──► │ Daily Scrum      │    │
│   │ Backlog      │     │ (3 Temas)        │     │ (15 min diarios) │    │
│   └──────────────┘     └────────┬─────────┘     └────────┬─────────┘    │
│                                 │                        │              │
│                                 ▼                        ▼              │
│                        ┌──────────────────┐     ┌──────────────────┐    │
│                        │ Incremento de    │ ◄── │ Trabajo de       │    │
│                        │ Valor (Done)     │     │ Desarrollo       │    │
│                        └────────┬─────────┘     └──────────────────┘    │
│                                 │                                       │
│                                 ▼                                       │
│                        ┌──────────────────┐     ┌──────────────────┐    │
│                        │ Sprint Review    │ ──► │ Retrospectiva    │    │
│                        └──────────────────┘     └──────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### **Estructura del Equipo y Responsabilidades**
La unidad fundamental es el **Scrum Team**, un pequeño equipo constituido por un **Product Owner**, un **Scrum Master** y los **Developers**, sin jerarquías ni subequipos (Schwaber y Sutherland, 2020):
* **Product Owner:** Responsable de maximizar el valor del producto resultante y gestionar el *Product Backlog* (Schwaber y Sutherland, 2020).
* **Developers:** Se comprometen a crear un *Increment* utilizable y de calidad que cumpla con la *Definición de Terminado* en cada Sprint (Schwaber y Sutherland, 2020).
* **Scrum Master:** Responsable de lograr la efectividad del equipo guiándolo en la teoría y práctica de Scrum (Schwaber y Sutherland, 2020).

#### **Eventos de Scrum**
El desarrollo se realiza en iteraciones fijas denominadas **Sprints**, que integran eventos como *Sprint Planning*, *Daily Scrum*, *Sprint Review* y *Sprint Retrospective* (Schwaber y Sutherland, 2020).

---

### 2.6.2 Contenedorización y Orquestación con Docker y Docker Swarm
Para garantizar la ejecutabilidad homogénea de la aplicación entre entornos, se utiliza la tecnología de **contenedorización** de Docker (Docker Docs, s. f.). Para la orquestación en producción se utiliza **Docker Swarm**, el orquestador nativo que permite gestionar, escalar y asegurar clústeres de contenedores mediante comandos CLI (Docker Docs, s. f.).

##### Tabla 2.6: Beneficios Técnicos de la Orquestación con Docker Swarm en el Proyecto

| Capacidad de Swarm | Descripción Técnica | Impacto en la Plataforma PLAi |
| :--- | :--- | :--- |
| **Gestión de Clúster** | Comandos para inicializar e integrar nodos en un clúster (`docker swarm init / join`) (Docker Docs, s. f.). | Facilita la administración centralizada de los servidores de producción. |
| **Alta Disponibilidad** | Tolerancia a fallos distribuyendo réplicas de los contenedores (Docker Docs, s. f.). | Mantiene el servicio activo ante caídas imprevistas de un servidor físico. |
| **Despliegues Progresivos** | Permite realizar actualizaciones sin interrumpir la operación (*Rolling Updates*) (Docker Docs, s. f.). | Permite publicar mejoras en la plataforma sin suspender la atención en almacén. |

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

1. Alura Cursos Online. (2025, 29 de julio). *Node.JS: qué es, cómo funciona este entorno de ejecución de JavaScript y una guía para empezar*. https://www.aluracursos.com/blog/node-js-que-es-como-funciona-este-entorno-de-ejecucion-de-javascript-y-una-guia-para-empezar
2. Bass, L., Clements, P., & Kazman, R. (2021). *Software Architecture in Practice* (4th ed.). Addison-Wesley Professional.
3. Cloudflare. (s. f.). *¿Qué es el OWASP? ¿Qué es el OWASP Top 10?* Cloudflare Learning Center. Recuperado el 20 de octubre de 2026, de https://www.cloudflare.com/es-es/learning/security/threats/owasp-top-10/
4. Directus. (s. f.). *Directus documentation: The open source data platform*. Recuperado el 20 de octubre de 2026, de https://docs.directus.io/
5. Docker Docs. (s. f.). *Docker documentation: Swarm mode overview*. Recuperado el 20 de octubre de 2026, de https://docs.docker.com/engine/swarm/
6. Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
7. Guía R-ADC-08-07. (s. f.). *Guía de redacción del reporte de estadía profesional (R-ADC-08-07)*. Universidad Tecnológica.
8. Laravel. (s. f.). *Laravel documentation: The clean stack for Artisans and agents*. Recuperado el 20 de octubre de 2026, de https://laravel.com/framework/docs/
9. MDN Web Docs. (s. f.). *CSS: Cascading Style Sheets*. Mozilla Developer Network. Recuperado el 20 de octubre de 2026, de https://developer.mozilla.org/es/docs/Web/CSS
10. MDN Web Docs. (s. f.). *JavaScript*. Mozilla Developer Network. Recuperado el 20 de octubre de 2026, de https://developer.mozilla.org/es/docs/Web/JavaScript
11. MongoDB Docs. (s. f.). *Bienvenido a la documentación de MongoDB*. Recuperado el 20 de octubre de 2026, de https://www.mongodb.com/es/docs/
12. MySQL Documentation. (s. f.). *MySQL reference manuals*. Oracle Corporation. Recuperado el 20 de octubre de 2026, de https://dev.mysql.com/doc/
13. OWASP Foundation. (2025). *OWASP Top 10:2025 release*. Recuperado el 20 de octubre de 2026, de https://top10.owasp.org/2025/
14. PHP Documentation. (s. f.). *PHP manual*. PHP Group. Recuperado el 20 de octubre de 2026, de https://www.php.net/manual/es/
15. Plataforma Abierta de Innovación. (2026). *Estándar Tecnológico para Proyectos de Software (Versión 1.0)*. Dirección de Tecnología e Infraestructura, PLAi.
16. Plataforma Abierta de Innovación. (s. f.). *Plataforma Abierta de Innovación y Desarrollo de Jalisco*. Gobierno del Estado de Jalisco. Recuperado el 20 de octubre de 2026, de https://plai.mx/
17. PostgreSQL Global Development Group. (s. f.). *PostgreSQL 16 manual*. Recuperado el 20 de octubre de 2026, de https://www.postgresql.org/docs/
18. Pressman, R. S., & Maxim, B. R. (2020). *Software Engineering: A Practitioner's Approach* (9th ed.). McGraw-Hill Education.
19. React Core Team. (s. f.). *React: La biblioteca para interfaces de usuario web y nativas*. Meta Platforms, Inc. Recuperado el 20 de octubre de 2026, de https://es.react.dev/
20. Schwaber, K., & Sutherland, J. (2020). *La Guía de Scrum: Las reglas del juego*. Scrum.org. https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-Spanish-Latin-South-American.pdf
21. Single Source of Truth. (s. f.). *Single Source of Truth: qué es, ejemplos y cómo implementarla*. Cyberclick. Recuperado el 20 de octubre de 2026, de https://www.cyberclick.es/numerical-blog/single-source-of-truth-que-es-ejemplos-y-como-implementarla
22. Tailwind Labs Inc. (s. f.). *Tailwind CSS v4 documentation*. Recuperado el 20 de octubre de 2026, de https://tailwindcss.com/docs
23. Vercel Inc. (2026). *Next.js Documentation: App Router and Standalone Deployment*. https://nextjs.org/docs
