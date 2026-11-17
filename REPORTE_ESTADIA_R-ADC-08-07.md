# FORMATO OFICIAL R-ADC-08-07
## Reporte de estadía profesional
### Nivel: Ingeniería en Desarrollo y Gestión de Software (ING DGS)

---

**Proyecto:**  
Desarrollo e implementación de una plataforma digital para la gestión, consulta y reservación de recursos tecnológicos y espacios de PLAi

**Organización receptora:**  
Plataforma Abierta de Innovación y Desarrollo de Jalisco (PLAi) — Secretaría de Innovación, Ciencia y Tecnología (SICyT) del Gobierno del Estado de Jalisco

**Área de desarrollo:**  
Laboratorio de Innovación, Robótica y Tecnologías Inmersivas

---

## Índice general

1. [Introducción](#1-introducción)  
   1.1 [Antecedentes](#11-antecedentes)  
   1.2 [Planteamiento del problema](#12-planteamiento-del-problema)  
   1.3 [Objetivos](#13-objetivos)  
   &nbsp;&nbsp;&nbsp;&nbsp;1.3.1 [Objetivo general](#131-objetivo-general)  
   &nbsp;&nbsp;&nbsp;&nbsp;1.3.2 [Objetivos específicos](#132-objetivos-específicos)  
   1.4 [Hipótesis o supuesto](#14-hipótesis-o-supuesto)  
   1.5 [Justificación](#15-justificación)  
   1.6 [Alcance del proyecto](#16-alcance-del-proyecto)  
2. [Marco teórico y de referencia](#2-marco-teórico-y-de-referencia)  
   2.1 [Contexto institucional y marco de referencia](#21-contexto-institucional-y-marco-de-referencia)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.1.1 [La Plataforma Abierta de Innovación y Desarrollo de Jalisco (PLAi)](#211-la-plataforma-abierta-de-innovación-y-desarrollo-de-jalisco-plai)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.1.2 [Del registro disperso a la fuente única de la verdad (SSOT)](#212-del-registro-disperso-a-la-fuente-única-de-la-verdad-ssot)  
   2.2 [Paradigmas web y selección del entorno de desarrollo](#22-paradigmas-web-y-selección-del-entorno-de-desarrollo)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.2.1 [Lenguajes de programación y entornos de ejecución: JavaScript y Node.js frente a PHP](#221-lenguajes-de-programación-y-entornos-de-ejecución-javascript-y-nodejs-frente-a-php)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.2.2 [Marcos de trabajo y arquitecturas web: Next.js (React) frente a Laravel (PHP)](#222-marcos-de-trabajo-y-arquitecturas-web-nextjs-react-frente-a-laravel-php)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.2.3 [Justificación técnica de la selección de Next.js y React](#223-justificación-técnica-de-la-selección-de-nextjs-y-react)  
   2.3 [Diseño de interfaz, hojas de estilo y experiencia de usuario](#23-diseño-de-interfaz-hojas-de-estilo-y-experiencia-de-usuario)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.3.1 [Hojas de estilo en cascada (CSS) y los desafíos de escalabilidad](#231-hojas-de-estilo-en-cascada-css-y-los-desafíos-de-escalabilidad)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.3.2 [Enfoque de clases de utilidad con Tailwind CSS y daisyUI](#232-enfoque-de-clases-de-utilidad-con-tailwind-css-y-daisyui)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.3.3 [Justificación técnica de Tailwind CSS y daisyUI](#233-justificación-técnica-de-tailwind-css-y-daisyui)  
   2.4 [Gestión de persistencia y bases de datos](#24-gestión-de-persistencia-y-bases-de-datos)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.4.1 [Paradigma relacional frente al paradigma orientado a documentos](#241-paradigma-relacional-frente-al-paradigma-orientado-a-documentos)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.4.2 [Análisis de consistencia transaccional (ACID) y prevención de conflictos](#242-análisis-de-consistencia-transaccional-acid-y-prevención-de-conflictos)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.4.3 [Justificación técnica del motor de base de datos PostgreSQL](#243-justificación-técnica-del-motor-de-base-de-datos-postgresql)  
   2.5 [Gobernanza de datos, seguridad y control de acceso](#25-gobernanza-de-datos-seguridad-y-control-de-acceso)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.5.1 [Principios de seguridad web y el estándar OWASP Top 10:2025](#251-principios-de-seguridad-web-y-el-estándar-owasp-top-102025)  
   &nbsp;&nbsp;&nbsp;&nbsp;2.5.2 [Control de acceso basado en roles (RBAC)](#252-control-de-acceso-basado-en-roles-rbac)  
   2.6 [Metodología de desarrollo ágil Scrum](#26-metodología-de-desarrollo-ágil-scrum)  
   2.7 [Matriz de justificación técnica y comparativa del entorno tecnológico](#27-matriz-de-justificación-técnica-y-comparativa-del-entorno-tecnológico)  
3. [Desarrollo: métodos y técnicas](#3-desarrollo-métodos-y-técnicas)  
   3.1 [Metodología de desarrollo de software y planificación de iteraciones](#31-metodología-de-desarrollo-de-software-y-planificación-de-iteraciones)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.1.1 [Estructura de roles del proyecto](#311-estructura-de-roles-del-proyecto)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.1.2 [Planificación y ejecución de iteraciones](#312-planificación-y-ejecución-de-iteraciones)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.1.3 [Historias de usuario representativas](#313-historias-de-usuario-representativas)  
   3.2 [Especificación de requerimientos del sistema](#32-especificación-de-requerimientos-del-sistema)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.2.1 [Requerimientos funcionales](#321-requerimientos-funcionales)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.2.2 [Requerimientos no funcionales](#322-requerimientos-no-funcionales)  
   3.3 [Arquitectura lógica del software](#33-arquitectura-lógica-del-software)  
   3.4 [Diseño de interfaces de usuario y experiencia visual](#34-diseño-de-interfaces-de-usuario-y-experiencia-visual)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.4.1 [Identidad gráfica y sistema de diseño](#341-identidad-gráfica-y-sistema-de-diseño)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.4.2 [Módulos e interfaces construidas](#342-módulos-e-interfaces-construidas)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.4.3 [Accesibilidad web universal (WCAG 2.1 nivel AA)](#343-accesibilidad-web-universal-wcag-21-nivel-aa)  
   3.5 [Implementación de la lógica del negocio y reglas de control](#35-implementación-de-la-lógica-del-negocio-y-reglas-de-control)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.5.1 [Validación de reglas de negocio y cálculo de horarios](#351-validación-de-reglas-de-negocio-y-cálculo-de-horarios)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.5.2 [Algoritmo de prevención de colisiones de agenda](#352-algoritmo-de-prevención-de-colisiones-de-agenda)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.5.3 [Modelo funcional de perfiles de usuario](#353-modelo-funcional-de-perfiles-de-usuario)  
   &nbsp;&nbsp;&nbsp;&nbsp;3.5.4 [Estrategia de verificación y pruebas de calidad](#354-estrategia-de-verificación-y-pruebas-de-calidad)  
4. [Resultados y discusión](#4-resultados-y-discusión)  
   4.1 [Análisis cuantitativo de resultados](#41-análisis-cuantitativo-de-resultados)  
   4.2 [Autoevaluación de objetivos y discusión](#42-autoevaluación-de-objetivos-y-discusión)  
5. [Conclusiones y recomendaciones](#5-conclusiones-y-recomendaciones)  
6. [Glosario de términos](#6-glosario-de-términos)  
7. [Referencias](#7-referencias)  
8. [Anexos](#8-anexos)  

---

# 1. Introducción

El presente reporte de estadía profesional documenta el análisis, diseño, desarrollo e implementación de una plataforma digital web concebida para la gestión integral, consulta de especificaciones, control de disponibilidad y reservación de los recursos tecnológicos y espacios físicos de la Plataforma Abierta de Innovación y Desarrollo de Jalisco (PLAi), organismo público adscrito a la Secretaría de Innovación, Ciencia y Tecnología (SICyT) del Gobierno del Estado de Jalisco.

En el marco de la formación profesional de la carrera de Ingeniería en Desarrollo y Gestión de Software, este proyecto surge como respuesta directa a una necesidad operativa prioritaria dentro del Laboratorio de Innovación, Robótica y Tecnologías Inmersivas de PLAi. Dicha entidad resguarda y opera una diversidad significativa de activos de equipamiento especializado —tales como visores de realidad virtual, drones, estaciones de cómputo de alto rendimiento, impresoras tridimensionales y kits de robótica—, además de aulas, auditorio y zonas de trabajo colaborativo que brindan servicio constante a instituciones educativas, dependencias gubernamentales y empresas del sector productivo.

A través de la ingeniería de software aplicada, el proyecto transita de una dinámica de administración tradicional basada en registros aislados y hojas de cálculo hacia un sistema web moderno, seguro y escalable, alineado con las directrices normativas institucionales. La plataforma centraliza el catálogo técnico, automatiza la asignación y préstamo de dispositivos bajo reglas de negocio que impiden colisiones de horario, asegura la trazabilidad documental de cada resguardo y facilita la programación coordinada de espacios físicos y equipamiento especializado.

A lo largo de este primer capítulo se establecen las bases contextuales y metodológicas del proyecto. En primer término, se exponen los antecedentes históricos e institucionales de PLAi y su laboratorio; posteriormente, se detalla el planteamiento del problema diagnosticado en la gestión cotidiana; se definen con precisión el objetivo general y los objetivos específicos que orientan el desarrollo técnico; se postula la hipótesis de trabajo; se fundamenta la justificación operativa, institucional y de seguridad que sustenta la solución propuesta; y, finalmente, se delimita el alcance del proyecto.

---

## 1.1 Antecedentes

La Plataforma Abierta de Innovación y Desarrollo de Jalisco (PLAi) es un organismo público descentralizado del Estado de Jalisco, adscrito y coordinado bajo el marco institucional de la Secretaría de Innovación, Ciencia y Tecnología (SICyT). Concebida como una iniciativa de vanguardia con sede en la Zona Metropolitana de Guadalajara, PLAi tiene como propósito fundamental impulsar la formación de talento especializado, cerrar brechas de competencias digitales avanzadas y fomentar la articulación estratégica entre la academia, el sector productivo y la administración pública.

Dentro de su oferta sustantiva, PLAi diseña e imparte programas de formación continua, diplomados, talleres de especialización técnica, programas de aceleración tecnológica, demostraciones y visitas guiadas interinstitucionales. Para hacer posible esta oferta de alto impacto, la institución dispone del Laboratorio de Innovación, Robótica y Tecnologías Inmersivas, una instalación equipada con infraestructura y activos tecnológicos de última generación. Entre su equipamiento destacan visores de realidad virtual (como Meta Quest 3), estaciones de cómputo de alto rendimiento para modelado y renderizado, drones para captura aérea y programación, kits de robótica educativa y colaborativa, impresoras 3D con tecnología de modelado por deposición fundida (FDM) y resina, escáneres tridimensionales de alta precisión, así como un catálogo de licencias y aplicaciones informáticas de uso inmersivo y técnico.

De manera paralela, la infraestructura del laboratorio contempla la disposición de espacios físicos diseñados para el trabajo colaborativo y la impartición de eventos, tales como un auditorio principal, aulas de creación (*aulas maker*), salas de capacitación técnica, salas de juntas ejecutivas y zonas de trabajo colaborativo (*coworking*).

Las operaciones cotidianas del laboratorio atienden a tres perfiles de usuarios diferenciados:
1. **Instituciones académicas:** Universidades públicas y privadas, institutos tecnológicos y bachilleratos técnicos que solicitan visitas guiadas, demostraciones de realidad virtual y talleres curriculares.
2. **Sector público:** Secretarías de estado, dependencias gubernamentales y organismos públicos que requieren capacitación técnica y espacios equipados para actividades institucionales.
3. **Sector privado y ecosistema emprendedor:** Empresas, comunidades tecnológicas y empresas emergentes (*startups*) que demandan el uso de equipamiento especializado para pruebas de concepto, prototipado y eventos de innovación.

Para coordinar estas demandas, el personal del laboratorio gestiona habitualmente cuatro dinámicas operativas:
* **Atención y agendamiento formativo:** Recepción, evaluación y calendarización de solicitudes de cursos y talleres mediante flujos adaptados al tipo de institución solicitante.
* **Asignación y préstamo de equipamiento:** Preparación, calibración y entrega física de lotes de dispositivos y sus respectivos accesorios a instructores o colaboradores autorizados.
* **Control y resguardo de activos:** Seguimiento de la ubicación física de los equipos en almacén o en sala, registro de identificadores de inventario, asignación de responsables por resguardo, control de estados operativos (*disponible*, *reservado*, *en mantenimiento* o *baja*) y supervisión del software cargado en cada terminal.
* **Coordinación de espacios físicos:** Programación de aulas y auditorios para evitar empalmes entre actividades formativas paralelas.

Históricamente, la gestión de esta información se ha realizado mediante registros en hojas de cálculo independientes, libretas de control físico y comunicaciones informales. Con el incremento acelerado en la oferta académica y en el volumen de dispositivos bajo resguardo del laboratorio, estos métodos tradicionales generaron cuellos de botella administrativos y riesgos de descoordinación operativa.

---

## 1.2 Planteamiento del problema

A pesar de contar con equipamiento tecnológico e instalaciones físicas de primer nivel, el Laboratorio de Innovación de PLAi carecía de un sistema informático centralizado que gobernara de manera automatizada el ciclo de vida de los activos y la reservación de sus espacios.

Esta situación derivó en una problemática operativa manifiesta en cuatro puntos críticos:
* **Dispersión y fragmentación de los registros:** La información técnica y administrativa residía en archivos digitales aislados, lo que impedía mantener una base de datos fidedigna y actualizada en tiempo real.
* **Invisibilidad de la disponibilidad inmediata:** Ante la solicitud de un curso o evento, el personal debía acudir físicamente al almacén o consultar con varios colaboradores para verificar si un lote de equipos estaba disponible, si ya había sido apartado para otra sesión o si se encontraba en diagnóstico de mantenimiento.
* **Deficiencia en la trazabilidad y custodia:** Ausencia de un historial digital auditable que vinculara de manera estructurada qué colaborador o usuario solicitó un equipo, con qué accesorios se entregó, en qué horario debía devolverse y bajo qué responsiva institucional quedó asignado.
* **Desvinculación operativa entre espacios físicos y recursos tecnológicos:** Falta de un mecanismo unificado que permitiera verificar simultáneamente la disponibilidad de las aulas o el auditorio junto con el lote de equipamiento necesario para la actividad programada.

---

## 1.3 Objetivos

### 1.3.1 Objetivo general

Diseñar, desarrollar e implementar una plataforma digital web centralizada para la gestión del inventario tecnológico, consulta de fichas técnicas, control de disponibilidad en tiempo real y reservación de equipos y espacios del Laboratorio de Innovación de PLAi, garantizando la integridad de los datos institucionales y optimizando los tiempos de respuesta operativa.

### 1.3.2 Objetivos específicos

* **Estructurar un catálogo digital normalizado** de los recursos tecnológicos del laboratorio, detallando especificaciones técnicas, códigos de control institucional, aplicaciones instaladas, estado operativo y accesorios asociados.
* **Diseñar e implementar una arquitectura de software web moderna y escalable** basada en Next.js, TypeScript y Tailwind CSS, cumpliendo con los lineamientos de diseño institucional y accesibilidad web universal.
* **Desarrollar un módulo de gestión de préstamos y reservaciones** con lógica de negocio orientada a la validación automática de colisiones de horario, control de duraciones reglamentarias de préstamo y confirmación estructurada de solicitudes.
* **Implementar un esquema de control de acceso basado en roles (RBAC)** con perfiles diferenciados, restringiendo las operaciones administrativas de inventario y mantenimiento al personal autorizado.
* **Construir un panel de control administrativo** con visualización de indicadores operativos sobre el uso de recursos, estados del inventario y bitácoras de mantenimiento preventivo y correctivo.
* **Diseñar una estrategia integral de pruebas automatizadas y aseguramiento de calidad**, garantizando la robustez de las reglas de negocio y la ausencia de defectos en los flujos principales del sistema.

---

## 1.4 Hipótesis o supuesto

La implementación de una plataforma web centralizada y automatizada permitirá reducir en al menos un 80 % los tiempos administrativos dedicados a la consulta y asignación de equipos en el Laboratorio de PLAi, eliminando al 100 % las colisiones de horario en la reservación de recursos y garantizando la trazabilidad documental de cada activo bajo resguardo institucional.

---

## 1.5 Justificación

La transición desde una administración manual y fragmentada hacia una plataforma web centralizada representa una decisión estratégica de alto valor para PLAi por las siguientes razones:
* **Fuente única de la verdad (*single source of truth*, SSOT):** Garantiza que toda la organización consulte información consistente y actualizada sobre cantidades, estados y características del equipamiento, erradicando discrepancias entre áreas.
* **Optimización del tiempo operativo:** El personal técnico y de vinculación puede verificar de forma instantánea la viabilidad de un taller o préstamo desde cualquier navegador web, agilizando la atención a universidades, dependencias y empresas.
* **Toma de decisiones basada en datos:** Al registrar sistemáticamente el uso de cada activo y sus reportes de mantenimiento, la coordinación del laboratorio dispone de indicadores objetivos para planificar mantenimientos preventivos o futuras adquisiciones de equipamiento.
* **Coordinación integral de experiencias formativas:** Facilita la sincronización entre la solicitud de salas de trabajo y la disponibilidad de hardware especializado requerido para cada sesión académica.
* **Cumplimiento normativo y seguridad de la información:** El sistema incorpora controles de validación en el servidor, acceso diferenciado por roles y protección de datos personales conforme a la legislación aplicable.

---

## 1.6 Alcance del proyecto

Para asegurar la viabilidad técnica y el cumplimiento de los tiempos establecidos para la estadía profesional, el proyecto se delimita en dos vertientes complementarias:

### Alcance principal (núcleo operativo)
1. **Módulo de catálogo e inventario tecnológico:** Consulta y administración de equipos clasificados en seis áreas técnicas: Realidad Virtual, Robótica, Fabricación Digital, Drones, Cómputo y Multimedia, y Electrónica.
2. **Módulo de fichas técnicas digitales:** Visualización detallada de especificaciones de hardware, manuales operativos, software compatible y accesorios incluidos.
3. **Módulo de solicitudes y reservación de dispositivos:** Formulario interactivo con reglas de validación temporal, motivo de actividad institucional, aceptación de aviso de privacidad y generación de folio de seguimiento.
4. **Módulo administrativo (*backoffice*):** Panel protegido para gestionar el alta y actualización de activos, registrar bitácoras de mantenimiento y administrar solicitudes mediante control de acceso basado en roles.

### Alcance complementario (módulo de expansión)
1. **Gestión de espacios físicos:** Módulo de solicitud y cotización de áreas como auditorio, aulas de creación y salas de capacitación, vinculando el aforo y los requerimientos audiovisuales.
2. **Indicadores y reportes de gestión:** Panel de consulta con métricas operativas sobre la disponibilidad del inventario y la distribución de préstamos por categoría tecnológica.

---

# 2. Marco teórico y de referencia

---

## 2.1 Contexto institucional y marco de referencia

### 2.1.1 La Plataforma Abierta de Innovación y Desarrollo de Jalisco (PLAi)

La Plataforma Abierta de Innovación y Desarrollo de Jalisco (PLAi) se constituye como un ecosistema estratégico diseñado para impulsar el aprendizaje, el emprendimiento y el desarrollo profesional con un marcado énfasis en la innovación, la tecnología y la creatividad (Plataforma Abierta de Innovación [PLAi], s. f.). Concebida para elevar la competitividad regional y cultivar el talento local para la era digital, PLAi articula sus soluciones mediante tres ejes rectores: aprender, conectar e innovar (PLAi, s. f.).

Para el cumplimiento de sus objetivos institucionales, PLAi no solo ofrece programas de capacitación virtual, sino que dispone de instalaciones físicas de uso público en la Ciudad Creativa Digital de Guadalajara, destinadas a fomentar el trabajo colaborativo, generar un ambiente de creatividad y propiciar la creación de soluciones e ideas innovadoras (PLAi, s. f.). Entre estas instalaciones se encuentran auditorios, aulas de creación (*aulas maker*), salas de juntas y laboratorios equipados con tecnología de vanguardia (PLAi, s. f.).

### 2.1.2 Del registro disperso a la fuente única de la verdad (SSOT)

En estrecha relación con la necesidad de administrar eficientemente dichas instalaciones y recursos tecnológicos, resulta indispensable analizar el modelo de gestión de la información institucional. Históricamente, las organizaciones han gestionado sus inventarios y recursos mediante archivos de hoja de cálculo aislados o bitácoras manuales que generan silos de datos, definidos como repositorios de información que forman parte de la misma organización pero que permanecen aislados y no comparten datos entre sí (Cyberclick, s. f.). La existencia de silos de datos provoca efectos adversos en la operación institucional, tales como la toma de decisiones con información incompleta, la duplicación de esfuerzos administrativos y la presencia de inconsistencias en los registros (Cyberclick, s. f.).

Para erradicar esta fragmentación operativa en PLAi, la plataforma digital desarrollada se fundamenta en el principio de fuente única de la verdad (*single source of truth*, SSOT). Una SSOT se define como una arquitectura centralizada de datos que almacena la información más actualizada, completa y precisa de una organización, integrando los registros provenientes de distintos procesos en un solo punto de consulta fidedigno (Cyberclick, s. f.).

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUENTES REGISTRALES PREVIAS                  │
│   Hoja de cálculo A       Hoja de cálculo B     Bitácora física │
└─────────────────┬──────────────────┬──────────────────┬─────────┘
                  │                  │                  │
                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SILOS DE DATOS Y DUPLICIDAD                 │
│        (Registros inconsistentes y colisión de horarios)        │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼  [Implementación de SSOT]
┌─────────────────────────────────────────────────────────────────┐
│         FUENTE ÚNICA DE LA VERDAD (PLATAFORMA DIGITAL PLAi)     │
│     Catálogo unificado · Fichas técnicas · Reservas en línea    │
└─────────────────────────────────────────────────────────────────┘
```
*Figura 2.1.* Transición operativa desde silos de datos dispersos hacia una fuente única de la verdad (SSOT). *Fuente:* Elaboración propia con base en Cyberclick (s. f.).

De acuerdo con Cyberclick (s. f.), la adopción del modelo SSOT aporta cuatro ventajas estratégicas fundamentales para la administración de recursos:
* **Reducción de costos operativos:** Simplifica la gestión de datos dentro de la institución y optimiza el tiempo del personal técnico dedicado a conciliar registros manuales (Cyberclick, s. f.).
* **Eliminación de la duplicación de datos:** Optimiza el almacenamiento e integra los registros en un esquema único para evitar contradicciones sobre el estado de un activo (Cyberclick, s. f.).
* **Aceleración en la recuperación de información:** Agiliza la consulta, detección e identificación de datos actualizados sobre el inventario requerido (Cyberclick, s. f.).
* **Aumento de la transparencia:** Garantiza que todos los miembros del equipo y solicitantes consulten exactamente la misma fuente de información sin discrepancias (Cyberclick, s. f.).

---

## 2.2 Paradigmas web y selección del entorno de desarrollo

### 2.2.1 Lenguajes de programación y entornos de ejecución: JavaScript y Node.js frente a PHP

Para materializar una fuente única de la verdad (SSOT) accesible en tiempo real por múltiples usuarios concurrentes, es indispensable seleccionar un lenguaje de programación y un entorno de ejecución en servidor que garanticen alto rendimiento y baja latencia. En este contexto, JavaScript (JS) se consolida como un lenguaje de programación ligero, interpretado o compilado justo a tiempo (*just-in-time*, JIT), dinámico y basado en prototipos, utilizado de forma estándar en el desarrollo web moderno (MDN Web Docs, s. f.-b). Creado por Ryan Dahl en 2009, Node.js surgió como respuesta técnica a la necesidad de ejecutar código JavaScript del lado del servidor (*server-side*), fuera del navegador web (Alura Cursos Online, 2025).

Node.js es un entorno de ejecución (*runtime*) multiplataforma que utiliza el motor V8 de Google —desarrollado en C++— para interpretar y traducir el código fuente en código de máquina altamente optimizado (Alura Cursos Online, 2025). A diferencia de los entornos de servidor tradicionales basados en PHP, los cuales operan habitualmente bajo un modelo síncrono de creación de procesos o hilos por cada petición entrante (PHP Group, s. f.), Node.js destaca por implementar una arquitectura asíncrona, de un solo hilo (*single-threaded*) y orientada a eventos (Alura Cursos Online, 2025). Gracias a este bucle de eventos (*event loop*), Node.js procesa operaciones de entrada y salida no bloqueantes (*non-blocking I/O*) sin necesidad de instanciar múltiples hilos pesados en paralelo, lo que reduce significativamente el consumo de memoria RAM y mejora la capacidad de respuesta ante consultas simultáneas al catálogo (Alura Cursos Online, 2025).

**Tabla 2.1**  
*Comparativa técnica entre el entorno de ejecución Node.js (JavaScript) y PHP tradicional*  
*Fuente:* Elaboración propia con base en Alura Cursos Online (2025), Laravel (s. f.) y PHP Group (s. f.).

| Criterio o modelo | Node.js (entorno JavaScript) | PHP (servidor web tradicional) | Impacto en el proyecto de PLAi |
| :--- | :--- | :--- | :--- |
| **Modelo de concurrencia** | Asíncrono, entrada/salida no bloqueante (*non-blocking I/O*), basado en bucle de eventos. | Síncrono por petición individual en el servidor web. | Permite atender múltiples solicitudes de consulta y reservación simultáneas sin bloquear el servidor. |
| **Consumo de memoria** | Ligero; optimiza el uso de recursos al no instanciar hilos paralelos por conexión. | Mayor sobrecarga de memoria por cada proceso o hilo instanciado. | Optimiza el aprovechamiento de recursos del servidor durante picos de consulta. |
| **Ecosistema y lenguaje** | Lenguaje unificado en cliente (*frontend*) y servidor (*backend*) mediante JavaScript y TypeScript. | Lenguaje ejecutado exclusivamente del lado del servidor. | Reduce la curva de desarrollo y mantenimiento al emplear un mismo lenguaje en toda la pila tecnológica. |
| **Gestión de paquetes** | Gestores NPM y pnpm (*Node Package Manager*). | Gestor de dependencias Composer. | Facilita la integración modular de bibliotecas modernas de interfaz y validación de esquemas. |

### 2.2.2 Marcos de trabajo y arquitecturas web: Next.js (React) frente a Laravel (PHP)

Una vez seleccionado Node.js como entorno de ejecución base, la construcción de una aplicación robusta exige un marco de trabajo (*framework*) que estructure eficazmente la presentación y la lógica del servidor.

#### React y el paradigma basado en componentes
React es una biblioteca declarativa de JavaScript concebida para desarrollar interfaces de usuario interactivas mediante piezas modulares y reutilizables denominadas componentes (React, s. f.). Los desarrolladores definen estos elementos utilizando la sintaxis JSX, una extensión que unifica la lógica de visualización con el marcado de forma predecible (React, s. f.). Sin embargo, dado que React se enfoca exclusivamente en la capa de vista y no prescribe por sí mismo un sistema de enrutamiento o consumo de datos en servidor, la documentación oficial promueve su adopción mediante un marco de trabajo de pila completa (*full-stack*) como Next.js (React, s. f.).

#### Next.js y el renderizado híbrido de pila completa
Next.js es el marco de trabajo líder basado en React para el desarrollo de aplicaciones web de producción, automatizando la optimización de código, compilación y empaquetado (Vercel, 2026). A través de su arquitectura de enrutador de aplicaciones (*App Router*), Next.js implementa componentes de servidor de React (*React Server Components*, RSC), permitiendo ejecutar lógica de negocio, acceder a datos y pre-renderizar vistas directamente en el servidor sin transferir código JavaScript innecesario al cliente (Vercel, 2026).

#### Laravel y la arquitectura monolítica tradicional
En contraparte, dentro del ecosistema PHP destaca Laravel, un marco de trabajo que estructura el desarrollo bajo el patrón Modelo-Vista-Controlador (MVC), enfocado primordialmente en la generación de vistas monolíticas renderizadas en el servidor a través de su motor de plantillas Blade (Laravel, s. f.).

**Tabla 2.2**  
*Comparativa arquitectónica entre Next.js (App Router) y Laravel (MVC)*  
*Fuente:* Elaboración propia con base en Laravel (s. f.), React (s. f.) y Vercel (2026).

| Característica | Next.js (App Router y RSC) | Laravel (MVC y plantillas Blade) | Sustento para la elección en PLAi |
| :--- | :--- | :--- | :--- |
| **Arquitectura principal** | Híbrida: combina componentes de servidor (*Server Components*) y componentes interactivos de cliente. | Monolítica MVC con motor de plantillas renderizadas en servidor (*Blade*). | Permite procesar datos pesados en el servidor y entregar una interfaz reactiva al usuario final. |
| **Navegación e interactividad** | Transiciones instantáneas en el cliente sin recargas completas de pantalla. | Renderización y recarga de páginas completas por petición en el esquema tradicional. | Mejora la experiencia del usuario al filtrar categorías de equipamiento y disponibilidad en tiempo real. |
| **Obtención de datos** | Integración directa de consultas asíncronas en componentes del servidor. | Consultas canalizadas a través de controladores mediante capa de abstracción de datos. | Simplifica el flujo de datos hacia las fichas técnicas con menor latencia de respuesta. |

### 2.2.3 Justificación técnica de la selección de Next.js y React

Con base en el análisis comparativo y los requerimientos del proyecto en PLAi, la selección de **Next.js** en combinación con **React** se fundamenta técnicamente en tres pilares de ingeniería de software:

1. **Criterio de rendimiento (*performance*):**
   * **Reducción de la carga de JavaScript:** Gracias a los componentes de servidor de React (RSC), el marcado HTML del catálogo de activos tecnológicos se genera previamente en el servidor. El navegador recibe una estructura lista para visualizarse sin requerir la descarga, análisis y ejecución de pesados paquetes de JavaScript del lado del cliente, disminuyendo drásticamente el tiempo hasta la primera pintura con contenido (*First Contentful Paint*, FCP).
   * **Optimizaciones automáticas:** Next.js integra división automática de código (*code splitting*) a nivel de ruta y precarga inteligente (*prefetching*) de enlaces visibles en el viewport. Al navegar entre el catálogo general y la ficha técnica de un equipo, la transición ocurre de forma instantánea en memoria sin bloqueos de interfaz.
2. **Criterio de escalabilidad (*scalability*):**
   * **Estructura modular del App Router:** La organización jerárquica de rutas mediante carpetas permite aislar de forma independiente las áreas públicas de consulta, los formularios de reservación y el panel administrativo. Esto permite incorporar nuevas familias de activos o módulos funcionales futuros sin generar deuda técnica ni degradar la mantenibilidad del código base.
   * **Modo de compilación autónomo (*standalone*):** Next.js analiza de forma determinista el árbol de dependencias para generar un paquete mínimo de producción, el cual puede ser ejecutado de manera ligera con un consumo optimizado de memoria RAM y procesador.
3. **Criterio de compatibilidad (*compatibility*):**
   * **Ecosistema homogéneo en TypeScript:** Al utilizar TypeScript de extremo a extremo, se comparte la misma definición de tipos de datos entre la lógica de validación del servidor y los componentes de visualización del cliente, erradicando discrepancias de tipos.
   * **Alineación con estándares web abiertos:** Next.js y React representan el estándar de mayor adopción en la industria del desarrollo de software contemporáneo, lo que asegura una amplia disponibilidad de documentación técnica, soporte comunitario a largo plazo y compatibilidad con bibliotecas de diseño y accesibilidad web.

---

## 2.3 Diseño de interfaz, hojas de estilo y experiencia de usuario

### 2.3.1 Hojas de estilo en cascada (CSS) y los desafíos de escalabilidad

En estrecha vinculación con la arquitectura de componentes de React y Next.js, la capa de presentación visual requiere un sistema de estilizado mantenible y consistente. Las hojas de estilo en cascada (*Cascading Style Sheets*, CSS) constituyen el lenguaje estándar utilizado para describir la presentación visual, el diseño reticular y la adaptabilidad de documentos estructurados en HTML (MDN Web Docs, s. f.-a). Sin embargo, a medida que las aplicaciones web crecen en número de vistas y módulos, la escritura manual de archivos CSS tradicionales suele presentar problemas de colisión por especificidad global, duplicación de reglas y crecimiento descontrolado del tamaño de los archivos transferidos al navegador.

### 2.3.2 Enfoque de clases de utilidad con Tailwind CSS y daisyUI

Para superar las limitaciones del CSS tradicional, se adoptó **Tailwind CSS**, un marco de diseño basado en clases de utilidad (*utility-first*) que opera bajo un enfoque de cero sobrecarga en tiempo de ejecución (*zero-runtime*). Su compilador analiza de forma automatizada los archivos de componentes del proyecto para detectar únicamente las clases utilizadas y generar un archivo CSS estático sumamente compacto (Tailwind Labs, s. f.). Adicionalmente, se integró el complemento **daisyUI**, el cual proporciona un sistema de componentes semánticos accesibles (como ventanas modales, tablas e indicadores de estado) construidos directamente sobre las utilidades de Tailwind CSS.

**Tabla 2.3**  
*Comparativa técnica entre CSS tradicional y el enfoque de clases de utilidad con Tailwind CSS*  
*Fuente:* Elaboración propia con base en MDN Web Docs (s. f.-a) y Tailwind Labs (s. f.).

| Criterio | CSS tradicional / metodología BEM | Clases de utilidad (Tailwind CSS) | Impacto e integración en PLAi |
| :--- | :--- | :--- | :--- |
| **Generación de estilos** | Hojas de estilo globales redactadas y mantenidas de forma manual. | Escaneo automatizado de componentes y generación estática sin costo en ejecución (*zero-runtime*). | Elimina por completo las reglas de estilo no utilizadas y minimiza el peso de descarga en el cliente. |
| **Mantenibilidad** | Riesgo de efectos colaterales y colisiones globales debido a la cascada de estilos. | Clases atómicas y tokens de diseño encapsulados directamente en cada componente. | Garantiza modularidad e independencia visual entre las tarjetas del catálogo y el panel administrativo. |
| **Productividad y consistencia** | Cambio constante de contexto entre archivos de marcado y hojas de estilo separadas. | Aplicación directa de escalas tipográficas y paleta institucional estandarizada. | Acelera la construcción de interfaces responsivas y asegura el apego a la identidad gráfica de PLAi. |

### 2.3.3 Justificación técnica de Tailwind CSS y daisyUI

La incorporación combinada de **Tailwind CSS** y **daisyUI** se justifica técnicamente a través de los tres criterios de evaluación:

1. **Criterio de rendimiento (*performance*):**
   * **Tamaño mínimo de transferencia:** A diferencia de marcos de diseño monolíticos (como Bootstrap) que distribuyen hojas de estilo de gran tamaño con cientos de reglas no utilizadas, el motor de compilación de Tailwind escanea exclusivamente las clases presentes en los componentes y genera una hoja CSS purgada cuyo peso suele ser inferior a 25 KB, reduciendo el consumo de ancho de banda y acelerando el renderizado en dispositivos móviles.
   * **Cero costo en tiempo de ejecución (*zero-runtime overhead*):** Los estilos se resuelven completamente durante la compilación, por lo que no se ejecuta código JavaScript en el navegador para calcular o inyectar estilos dinámicos.
2. **Criterio de escalabilidad (*scalability*):**
   * **Inmutabilidad y ausencia de especificidad:** Dado que las clases de utilidad se aplican de forma atómica y directa en cada elemento visual, la creación de nuevos módulos no altera los estilos de componentes previamente diseñados, eliminando los riesgos de regresión visual comunes en hojas CSS tradicionales de gran volumen.
   * **Estandarización mediante variables de diseño (*design tokens*):** Permite centralizar la paleta de colores institucional y las escalas tipográficas en un único archivo de configuración, garantizando que cualquier desarrollador futuro mantenga una coherencia estética absoluta.
3. **Criterio de compatibilidad (*compatibility*):**
   * **Integración nativa con componentes de React:** Al operar dentro de la sintaxis JSX, las clases de utilidad se integran de forma natural con los estados de los componentes.
   * **Soporte de accesibilidad en daisyUI:** La biblioteca daisyUI aporta componentes semánticos estructurados que incorporan de forma nativa los roles y propiedades de accesibilidad ARIA necesarios para lectores de pantalla, facilitando el cumplimiento de las directrices WCAG 2.1 nivel AA.

---

## 2.4 Gestión de persistencia y bases de datos

### 2.4.1 Paradigma relacional frente al paradigma orientado a documentos

Además de una interfaz ágil y escalable, la consolidación de una fuente única de la verdad (SSOT) exige un motor de persistencia de datos capaz de resguardar el inventario y las reservaciones sin pérdida de información ni inconsistencias. En la ingeniería de software actual destacan dos paradigmas principales de almacenamiento:

#### Bases de datos orientadas a documentos (NoSQL: MongoDB)
MongoDB es un sistema de base de datos no relacional (NoSQL) orientado a documentos, diseñado para almacenar información en estructuras flexibles similares a objetos JSON (MongoDB, s. f.). Si bien MongoDB ofrece soporte para transacciones distribuidas y facilidad de escalado horizontal para datos no estructurados (MongoDB, s. f.), la ausencia predeterminada de un esquema relacional rígido a nivel de tablas puede complejizar la validación estricta de relaciones cruzadas entre múltiples entidades interdependientes.

#### Bases de datos relacionales (RDBMS: PostgreSQL y MySQL)
Por su parte, los sistemas de gestión de bases de datos relacionales (*Relational Database Management Systems*, RDBMS), tales como MySQL (Oracle Corporation, s. f.) y PostgreSQL (PostgreSQL Global Development Group, s. f.), estructuran la información en tablas bidimensionales compuestas por filas y columnas fuertemente tipadas. Estos motores imponen reglas de integridad referencial mediante llaves primarias y foráneas directamente en el núcleo de la base de datos (PostgreSQL Global Development Group, s. f.).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                EVALUACIÓN DE PARADIGMAS DE BASE DE DATOS                │
├────────────────────────────────────┬────────────────────────────────────┤
│     MODELO RELACIONAL (RDBMS)      │    MODELO DOCUMENTAL (NoSQL)       │
│       (PostgreSQL / MySQL)         │            (MongoDB)               │
├────────────────────────────────────┼────────────────────────────────────┤
│ • Esquema tipado con tablas y FKs  │ • Colecciones de documentos JSON   │
│ • Transacciones ACID nativas       │ • Esquema flexible dinámico        │
│ • Integridad referencial estricta  │ • Orientado a datos semiestructur. │
└─────────────────┬──────────────────┴────────────────────────────────────┘
                  │
                  ▼  [Requerimiento crítico en PLAi]
┌─────────────────────────────────────────────────────────────────────────┐
│               EXIGENCIA OPERATIVA: CONTROL DE RESERVACIONES             │
│       Prevención de colisiones dobles e integridad entre entidades      │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼  [Selección justificada]
┌─────────────────────────────────────────────────────────────────────────┐
│         SISTEMA DE GESTIÓN DE BASE DE DATOS RELACIONAL (PostgreSQL)     │
└─────────────────────────────────────────────────────────────────────────┘
```
*Figura 2.2.* Criterio de evaluación y selección del paradigma de base de datos para la plataforma. *Fuente:* Elaboración propia con base en MongoDB (s. f.) y PostgreSQL Global Development Group (s. f.).

### 2.4.2 Análisis de consistencia transaccional (ACID) y prevención de conflictos

En un sistema de agendamiento y préstamo de activos físicos, el riesgo técnico más crítico consiste en que dos usuarios reserven de manera simultánea el mismo equipo o aula para el mismo bloque horario. Para prevenir esta anomalía, el motor de persistencia debe garantizar el cumplimiento estricto de las propiedades **ACID**: atomicidad (*atomicity*), consistencia (*consistency*), aislamiento (*isolation*) y durabilidad (*durability*), las cuales aseguran que toda transacción compuesta se ejecute de forma íntegra y aislada frente a operaciones concurrentes (PostgreSQL Global Development Group, s. f.).

**Tabla 2.4**  
*Comparativa técnica entre motores de base de datos relacionales y orientados a documentos*  
*Fuente:* Elaboración propia con base en MongoDB (s. f.), Oracle Corporation (s. f.) y PostgreSQL Global Development Group (s. f.).

| Característica | Relacional (PostgreSQL / MySQL) | Documental NoSQL (MongoDB) | Justificación para el proyecto de PLAi |
| :--- | :--- | :--- | :--- |
| **Estructura de datos** | Tablas estructuradas con tipos de datos estrictos y restricciones de esquema. | Documentos JSON dinámicos con estructura flexible por colección. | El inventario institucional posee atributos normativos fijos y relaciones bien definidas. |
| **Integridad referencial** | Restricciones nativas mediante llaves foráneas y reglas de cascada o restricción. | Gestión predominantemente manual de referencias entre documentos en la aplicación. | Garantiza que no existan reservaciones huérfanas ni asignaciones a equipos inexistentes. |
| **Concurrencia y ACID** | Control de concurrencia multiversión (MVCC) y aislamiento transaccional nativo. | Soporte transaccional con mayor sobrecarga en operaciones multi-documento. | Previene condiciones de carrera y sobreposición de horarios en préstamos simultáneos. |

### 2.4.3 Justificación técnica del motor de base de datos PostgreSQL

A partir de la evaluación de requerimientos de consistencia y concurrencia, se seleccionó **PostgreSQL** como el motor de base de datos relacional para la plataforma institucional de PLAi, justificando la decisión en los tres ejes técnicos:

1. **Criterio de rendimiento (*performance*):**
   * **Control de concurrencia multiversión (MVCC):** PostgreSQL implementa MVCC avanzado, lo que permite que las consultas de lectura masivas al catálogo público no bloqueen las operaciones de escritura de nuevas solicitudes de reservación ni viceversa. Esto garantiza tiempos de respuesta estables en el orden de milisegundos incluso ante múltiples consultas académicas simultáneas.
   * **Indexación especializada:** Ofrece soporte para índices B-Tree estándar e índices GIN (*Generalized Inverted Index*), optimizando búsquedas rápidas sobre atributos técnicos y campos de especificaciones.
2. **Criterio de escalabilidad y flexibilidad híbrida (*scalability*):**
   * **Soporte nativo para tipos semiestructurados (`JSONB`):** Mientras que los motores relacionales tradicionales requieren alterar el esquema físico de tablas para añadir nuevos campos de hardware, PostgreSQL permite almacenar las características particulares de cada familia tecnológica (como resolución óptica en visores de realidad virtual o alcance de vuelo en drones) en columnas de formato binario JSONB indexables. Esto brinda la flexibilidad del paradigma documental sin sacrificar la robustez del modelo relacional.
   * **Capacidad transaccional y crecimiento de datos:** Admite esquemas de particionamiento de tablas por rango temporal y soporte para miles de conexiones concurrentes, asegurando la escalabilidad a largo plazo conforme crezca el catálogo de activos de PLAi.
3. **Criterio de compatibilidad (*compatibility*):**
   * **Integridad referencial estricta:** Aplica restricciones declarativas (*foreign keys*, restricciones de verificación `CHECK` y unicidad) directamente en el motor, impidiendo la inserción de solicitudes con equipos o usuarios inexistentes.
   * **Estándar institucional abierto:** Es un sistema gestor de base de datos de código abierto ampliamente respaldado por la comunidad científica y gubernamental, compatible de forma nativa con los servicios de respaldo y monitoreo institucionales.

---

## 2.5 Gobernanza de datos, seguridad y control de acceso

### 2.5.1 Principios de seguridad web y el estándar OWASP Top 10:2025

Dado que la plataforma administra bienes patrimoniales públicos e información de solicitantes, la arquitectura de software debe incorporar mecanismos rigurosos de seguridad informática. El Proyecto Abierto de Seguridad de Aplicaciones Web (*Open Worldwide Application Security Project*, OWASP) es una fundación internacional sin fines de lucro dedicada a mejorar la seguridad del software mediante estándares y recursos abiertos (Cloudflare, s. f.). Su documento de referencia principal, denominado *OWASP Top 10*, constituye el consenso global sobre los diez riesgos de seguridad más críticos en aplicaciones web (OWASP Foundation, 2025).

En la edición *OWASP Top 10:2025*, la vulnerabilidad clasificada en primer lugar corresponde a **A01:2025 – Pérdida de control de acceso** (*Broken Access Control*) (OWASP Foundation, 2025). El control de acceso comprende las políticas y mecanismos técnicos que garantizan que los usuarios no puedan actuar fuera de los permisos que les han sido asignados; una deficiencia en esta capa permitiría a un usuario no autorizado consultar información reservada, modificar el inventario institucional o aprobar préstamos sin contar con atribuciones administrativas (Cloudflare, s. f.).

### 2.5.2 Control de acceso basado en roles (RBAC)

Para mitigar de forma efectiva la pérdida de control de acceso, las aplicaciones web modernas verifican la identidad y las atribuciones del usuario en cada petición dirigida al servidor mediante credenciales de sesión firmadas criptográficamente (Cloudflare, s. f.). En este proyecto se adopta el modelo de **control de acceso basado en roles** (*role-based access control*, RBAC), el cual asigna permisos específicos a perfiles organizacionales definidos —tales como administrador, colaborador técnico y usuario solicitante—, asegurando que cada cuenta interactúe exclusivamente con las vistas y operaciones autorizadas para su función (Cloudflare, s. f.).

**Tabla 2.5**  
*Comparativa de modelos de control de acceso en ingeniería de software*  
*Fuente:* Elaboración propia con base en Cloudflare (s. f.) y OWASP Foundation (2025).

| Modelo de control | Definición y funcionamiento | Aplicabilidad en el proyecto de PLAi |
| :--- | :--- | :--- |
| **Control de acceso discrecional (DAC)** | El propietario individual de cada recurso decide a su discreción quién puede acceder a él. | **Inadecuado:** Generaría falta de gobernanza centralizada sobre el patrimonio tecnológico institucional. |
| **Control de acceso basado en roles (RBAC)** | Los permisos de lectura y escritura se asignan a roles institucionales claramente delimitados. | **Seleccionado:** Mitiga el riesgo OWASP A01:2025 al segregar el portal público del panel administrativo. |
| **Control de acceso basado en atributos (ABAC)** | Evalúa permisos dinámicamente combinando múltiples reglas contextuales y ambientales complejas. | **Innecesario:** Introduce una sobrecarga de configuración excesiva para los perfiles operativos del laboratorio. |

De manera complementaria al modelo RBAC, la gobernanza de datos de la plataforma se alinea con las disposiciones de protección de datos personales vigentes en México, exigiendo el consentimiento informado del aviso de privacidad institucional y aplicando mecanismos de limitación de tasa de peticiones (*rate limiting*) para prevenir intentos automatizados de saturación en los formularios públicos.

---

## 2.6 Metodología de desarrollo ágil Scrum

Para gestionar el ciclo de vida del desarrollo de software de forma ordenada y adaptable a las necesidades operativas del laboratorio, se seleccionó el marco de trabajo ágil **Scrum**. Desarrollado por Ken Schwaber y Jeff Sutherland, Scrum es un marco de trabajo liviano que ayuda a las personas, equipos y organizaciones a generar valor a través de soluciones adaptativas para problemas complejos (Schwaber y Sutherland, 2020). Su funcionamiento se fundamenta en el empirismo —el cual postula que el conocimiento proviene de la experiencia y de la toma de decisiones basada en lo observado— y en el pensamiento esbelto (*Lean thinking*), sosteniéndose sobre tres pilares empíricos: **transparencia, inspección y adaptación** (Schwaber y Sutherland, 2020).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CICLO DE ITERACIÓN EN SCRUM                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│   │ Pila del      │ ──► │ Planificación de │ ──► │ Seguimiento      │   │
│   │ producto      │     │ la iteración     │     │ diario           │   │
│   └───────────────┘     └────────┬─────────┘     └────────┬─────────┘   │
│                                  │                        │             │
│                                  ▼                        ▼             │
│                         ┌──────────────────┐     ┌──────────────────┐   │
│                         │ Incremento       │ ◄── │ Trabajo de       │   │
│                         │ funcional        │     │ desarrollo       │   │
│                         └────────┬─────────┘     └──────────────────┘   │
│                                  │                                      │
│                                  ▼                                      │
│                         ┌──────────────────┐     ┌──────────────────┐   │
│                         │ Revisión de la   │ ──► │ Retrospectiva de │   │
│                         │ iteración        │     │ mejora continua  │   │
│                         └──────────────────┘     └──────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
*Figura 2.3.* Flujo iterativo e incremental del marco de trabajo ágil Scrum. *Fuente:* Elaboración propia con base en Schwaber y Sutherland (2020).

#### Estructura del equipo y responsabilidades
La unidad fundamental de este marco es el equipo Scrum (*Scrum Team*), integrado por tres responsabilidades específicas que trabajan de manera cohesionada (Schwaber y Sutherland, 2020):
* **Dueño del producto (*Product Owner*):** Responsable de maximizar el valor del producto resultante del trabajo de desarrollo y de gestionar la pila del producto (*Product Backlog*) conforme a las prioridades institucionales (Schwaber y Sutherland, 2020).
* **Desarrolladores (*Developers*):** Personas comprometidas con la creación de cualquier aspecto de un incremento funcional utilizable en cada iteración, cumpliendo con la definición de terminado (*Definition of Done*) establecida (Schwaber y Sutherland, 2020).
* **Facilitador ágil (*Scrum Master*):** Responsable de asegurar que el marco metodológico sea comprendido y aplicado de forma efectiva, ayudando a eliminar impedimentos durante el proyecto (Schwaber y Sutherland, 2020).

#### Eventos de Scrum
El trabajo se estructura en ciclos de duración fija denominados iteraciones o *sprints*, los cuales integran cuatro eventos formales para la inspección y adaptación: la planificación de la iteración (*Sprint Planning*), la reunión diaria de sincronización (*Daily Scrum*), la revisión del incremento (*Sprint Review*) y la retrospectiva de mejora (*Sprint Retrospective*) (Schwaber y Sutherland, 2020).

---

## 2.7 Matriz de justificación técnica y comparativa del entorno tecnológico

Para sintetizar de manera integral los fundamentos analizados a lo largo de este capítulo, la Tabla 2.6 presenta la matriz comparativa que justifica la elección de cada tecnología clave frente a sus alternativas representativas, evaluando su pertinencia para el Laboratorio de Innovación de PLAi bajo los tres criterios formales de ingeniería: **rendimiento**, **escalabilidad** y **compatibilidad**.

**Tabla 2.6**  
*Matriz integral de justificación técnica de frameworks y tecnologías seleccionadas*  
*Fuente:* Elaboración propia con base en los análisis comparativos de las secciones 2.2, 2.3 y 2.4.

| Tecnología seleccionada | Alternativa descartada | Evaluación de rendimiento | Evaluación de escalabilidad | Evaluación de compatibilidad | Veredicto técnico para PLAi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Next.js (React)** *(Framework Full-Stack)* | Laravel (PHP) / Create-React-App | **Superior:** Renderizado híbrido en servidor (RSC) y optimización de paquetes sin sobrecarga en el navegador. | **Alta:** Arquitectura modular por rutas en App Router y compilación autónoma desacoplada. | **Total:** Integración nativa con TypeScript de extremo a extremo y ecosistema web moderno. | **Seleccionado:** Acelera la consulta del catálogo y la validación segura de reglas de negocio en servidor. |
| **Tailwind CSS + daisyUI** *(Estilos y UI)* | CSS puro con BEM / Bootstrap monolítico | **Superior:** Enfoque *utility-first zero-runtime* con purgado estático que genera archivos CSS de menos de 25 KB. | **Alta:** Elimina colisiones de cascada y asegura consistencia visual mediante *design tokens*. | **Alta:** Integración directa en marcado JSX y componentes semánticos con soporte ARIA nativo. | **Seleccionado:** Facilita el apego a la identidad gráfica institucional y cumple con accesibilidad web. |
| **Node.js** *(Entorno de ejecución)* | PHP tradicional (Apache/FPM) | **Superior:** E/S no bloqueante basada en bucle de eventos sobre el motor V8, con bajo uso de memoria. | **Alta:** Manejo ligero de conexiones simultáneas sin instanciar hilos pesados por usuario. | **Total:** Permite compartir código, validaciones y tipos de datos entre cliente y servidor. | **Seleccionado:** Garantiza respuesta inmediata durante consultas masivas concurrentes al inventario. |
| **PostgreSQL** *(Motor de base de datos)* | MongoDB (NoSQL) / MySQL | **Superior:** Control de concurrencia MVCC e indexación eficiente que previene bloqueos de lectura/escritura. | **Muy alta:** Soporte híbrido relacional y semiestructurado (`JSONB`) para fichas técnicas diversas. | **Total:** Cumplimiento ACID estricto, integridad referencial y estándar de código abierto institucional. | **Seleccionado:** Erradica condiciones de carrera y previene traslapes en el agendamiento de recursos. |

---

# 3. Desarrollo: métodos y técnicas

---

## 3.1 Metodología de desarrollo de software y planificación de iteraciones

El desarrollo de la plataforma digital se gestionó bajo una adaptación práctica del marco de trabajo ágil Scrum, organizada en cinco iteraciones (*sprints*) quincenales a lo largo de un período de diez semanas efectivas. Este enfoque metodológico garantizó la entrega continua de valor funcional, permitiendo someter cada incremento a la revisión del personal del Laboratorio de Innovación de PLAi y asegurando que las funcionalidades implementadas respondieran fielmente a la dinámica operativa de la institución.

### 3.1.1 Estructura de roles del proyecto

* **Dueño del producto (*Product Owner*):** Desempeñado por la coordinación del Laboratorio de Innovación de PLAi, responsable de definir las prioridades operativas, validar el alcance de los módulos de inventario y aprobar formalmente los incrementos funcionales.
* **Facilitador ágil (*Scrum Master*) y desarrollador de software:** Asumido por el estudiante de estadía profesional de Ingeniería en Desarrollo y Gestión de Software, encargado de la ingeniería de requerimientos, diseño arquitectónico, construcción de interfaces, codificación de la lógica de negocio y ejecución de pruebas de calidad.

### 3.1.2 Planificación y ejecución de iteraciones

El ciclo de desarrollo se estructuró en cinco iteraciones sucesivas, cuyos objetivos funcionales y entregables de software se resumen en la Tabla 3.1.

**Tabla 3.1**  
*Matriz de planificación y ejecución de iteraciones de software (Scrum)*  
*Fuente:* Elaboración propia con base en la metodología ágil aplicada al proyecto (2026).

| Iteración | Período | Objetivo de la iteración | Entregables funcionales de software |
| :---: | :---: | :--- | :--- |
| **Sprint 1** | Semanas 1 a 2 | **Estructura base y modelado conceptual:** Levantamiento y estandarización del catálogo de hardware, diseño lógico de entidades y definición del sistema de diseño institucional. | • Entorno de desarrollo tipado y modular.<br>• Modelo conceptual de datos normalizado.<br>• Sistema de diseño y tokens cromáticos configurados. |
| **Sprint 2** | Semanas 3 a 4 | **Catálogo interactivo y fichas técnicas:** Desarrollo de las vistas públicas de exploración de activos, filtrado dinámico por familia tecnológica y páginas descriptivas individuales. | • Módulo de exploración visual clasificado por áreas.<br>• Buscador en tiempo real por coincidencia textual.<br>• Ficha técnica con especificaciones y manuales. |
| **Sprint 3** | Semanas 5 a 6 | **Módulo de préstamos, espacios y reglas de negocio:** Construcción de los flujos interactivos de reservación de equipamiento y solicitud de aulas, aplicando validación temporal. | • Formulario asistido de captura de reservaciones.<br>• Módulo de cotización y solicitud de espacios físicos.<br>• Algoritmo de validación y control anti-traslape. |
| **Sprint 4** | Semanas 7 a 8 | **Panel administrativo y perfiles de usuario:** Creación de las interfaces protegidas para la gestión del inventario, bitácora de mantenimientos y control de acceso funcional. | • Tablas dinámicas con filtros multicriterio y paginación.<br>• Bitácora técnica para mantenimientos preventivos.<br>• Segregación funcional de perfiles de usuario (RBAC). |
| **Sprint 5** | Semanas 9 a 10 | **Accesibilidad web universal y aseguramiento de calidad:** Integración de herramientas de accesibilidad (WCAG 2.1 AA) y ejecución integral de la batería de pruebas automatizadas. | • Asistente flotante de accesibilidad y contraste.<br>• Sustitución de alertas nativas por modales accesibles.<br>• Suite completa de pruebas unitarias y de integración. |

### 3.1.3 Historias de usuario representativas

Para guiar la construcción del sistema desde la perspectiva del valor aportado a los usuarios, los requerimientos se formalizaron mediante historias de usuario complementadas con criterios de aceptación en formato conductual (*Dado – Cuando – Entonces*), como se presenta en la Tabla 3.2.

**Tabla 3.2**  
*Historias de usuario críticas y criterios de aceptación funcional*  
*Fuente:* Elaboración propia.

| Identificador | Historia de usuario | Criterios de aceptación (Dado – Cuando – Entonces) |
| :---: | :--- | :--- |
| **HU-01** | Como solicitante académico en PLAi, quiero explorar el catálogo de dispositivos filtrando por área tecnológica para conocer el equipamiento disponible para mis prácticas y proyectos. | **Dado** que el usuario ingresa al catálogo público,<br>**Cuando** selecciona una familia tecnológica o escribe en el buscador,<br>**Entonces** la lista de equipos se actualiza al instante mostrando fotografía, estado de disponibilidad y botón de acceso a la ficha técnica sin recargar la pantalla. |
| **HU-02** | Como docente o colaborador, quiero registrar una solicitud de préstamo indicando horario y motivo para reservar un dispositivo sin empalmes con otros solicitantes. | **Dado** un activo tecnológico disponible,<br>**Cuando** el usuario envía el formulario con horario válido (≤ 2 horas de duración) y acepta el aviso de privacidad,<br>**Entonces** el sistema valida que no existan colisiones, genera un folio único y confirma la solicitud exitosamente. |
| **HU-03** | Como encargado administrativo del laboratorio, quiero contar con un panel protegido para actualizar el catálogo de equipos y registrar incidencias técnicas. | **Dado** un usuario que navega hacia los módulos de administración,<br>**Cuando** el sistema autentica sus credenciales institucionales y rol administrativo,<br>**Entonces** se le permite gestionar el inventario, dar de alta activos y documentar bitácoras de mantenimiento, restringiendo a usuarios no autorizados. |
| **HU-04** | Como usuario con diversidad visual, quiero modificar el tamaño del texto y el contraste de la interfaz para navegar en la plataforma con total claridad y autonomía. | **Dado** un visitante en cualquier pantalla de la plataforma,<br>**Cuando** activa en el menú de accesibilidad el aumento de tamaño tipográfico o el modo de alto contraste,<br>**Entonces** la interfaz adapta visualmente todos sus textos y colores de manera inmediata, recordando su preferencia durante la sesión. |

---

## 3.2 Especificación de requerimientos del sistema

### 3.2.1 Requerimientos funcionales

* **RF-01 (Catálogo digital categorizado):** La plataforma debe presentar el inventario organizado en seis categorías técnicas: Realidad Virtual, Robótica, Fabricación Digital, Drones, Cómputo y Multimedia, y Electrónica.
* **RF-02 (Búsqueda y filtrado reactivo):** El sistema debe permitir la localización ágil de activos por coincidencia de texto (nombre, marca o modelo) y por estado operativo (*disponible*, *en mantenimiento* o *reservado*).
* **RF-03 (Ficha técnica pormenorizada):** Cada elemento del catálogo debe disponer de una vista de detalle con especificaciones de hardware, software instalado, accesorios complementarios y guías de uso.
* **RF-04 (Gestión interactiva de préstamos):** El sistema debe proporcionar un formulario asistido para capturar la solicitud de préstamo de equipos, registrando fecha, horario programado y justificación de uso institucional.
* **RF-05 (Validación automática de horarios):** El sistema debe rechazar solicitudes cuya hora de término no sea posterior a la de inicio, cuya duración supere el límite reglamentario de dos horas o que se traslapen con otra reservación confirmada.
* **RF-06 (Módulo de espacios físicos):** La plataforma debe permitir solicitar y cotizar el uso de auditorio, aulas de creación y salas de capacitación, asociando el aforo previsto y los requerimientos de equipamiento audiovisual.
* **RF-07 (Administración de inventario):** El módulo de gestión administrativa debe permitir registrar altas, modificaciones de estado y desincorporación lógica de equipos bajo resguardo.
* **RF-08 (Bitácora de mantenimientos):** El sistema debe registrar las intervenciones técnicas preventivas y correctivas realizadas a cada activo, especificando el diagnóstico y fecha de conclusión.
* **RF-09 (Control de acceso funcional por perfiles):** La plataforma debe diferenciar las facultades de operación entre el perfil de usuario solicitante y el perfil administrativo de gestión.
* **RF-10 (Protección de formularios públicos):** Los formularios de solicitud deben implementar mecanismos de control de frecuencia para salvaguardar la disponibilidad del servicio.
* **RF-11 (Trazabilidad y privacidad de datos):** El sistema debe asociar un identificador institucional único a cada trámite y proteger la información personal recabada conforme a la normativa de privacidad aplicable.
* **RF-12 (Herramientas de accesibilidad universal):** La interfaz debe incluir controles directos para aumentar la escala tipográfica, activar alto contraste, modo monocromático y subrayado de hipervínculos.

### 3.2.2 Requerimientos no funcionales

* **RNF-01 (Tiempo de respuesta y agilidad de carga):** La visualización inicial del catálogo debe realizarse en un tiempo inferior a 1.5 segundos en condiciones convencionales de conectividad.
* **RNF-02 (Diseño responsivo y adaptabilidad):** Las interfaces deben proporcionar una visualización ergonómica y funcional en computadoras de escritorio, computadoras portátiles, tabletas y teléfonos inteligentes.
* **RNF-03 (Usabilidad y consistencia visual):** El sistema debe adherirse estrictamente a las guías de identidad gráfica institucional de PLAi, manteniendo una navegación intuitiva y coherente en todas sus vistas.
* **RNF-04 (Integridad y consistencia de los datos):** La persistencia debe asegurar la validez referencial y la no duplicidad de asignaciones ante solicitudes concurrentes.
* **RNF-05 (Mantenibilidad y calidad de código):** El código fuente debe construirse con tipado estricto, análisis estático libre de errores y una estructura modular desacoplada que facilite su mantenimiento evolutivo.
* **RNF-06 (Protección de datos personales):** Todo módulo que recabe datos de contacto o académicos debe exigir el consentimiento informado del aviso de privacidad institucional previo al envío.

---

## 3.3 Arquitectura lógica del software

La plataforma fue diseñada bajo una **arquitectura lógica en tres capas**, la cual segrega de manera estricta las responsabilidades de presentación visual, procesamiento de reglas de negocio y persistencia de información, tal como se esquematiza en la Figura 3.1.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 ARQUITECTURA LÓGICA DE SOFTWARE EN CAPAS                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ 1. CAPA DE PRESENTACIÓN (INTERFAZ DE USUARIO)                   │   │
│   │    • Catálogo dinámico, buscador interactivo y fichas técnicas  │   │
│   │    • Formularios asistidos de captura de reservaciones          │   │
│   │    • Panel administrativo para gestión de inventario y tablas   │   │
│   │    • Componente de accesibilidad universal (WCAG 2.1 nivel AA)  │   │
│   └────────────────────────────────┬────────────────────────────────┘   │
│                                    │  (Interacción y envío de datos)    │
│                                    ▼                                    │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ 2. CAPA DE LÓGICA DE NEGOCIO Y APLICACIÓN                       │   │
│   │    • Validación de coherencia temporal (inicio < fin, máx 2 h)  │   │
│   │    • Algoritmo de detección y prevención de colisiones horarias │   │
│   │    • Control de acceso funcional y verificación de perfiles     │   │
│   │    • Generación de folios institucionales y sanitización        │   │
│   └────────────────────────────────┬────────────────────────────────┘   │
│                                    │  (Operaciones transaccionales)     │
│                                    ▼                                    │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ 3. CAPA DE PERSISTENCIA Y GESTIÓN DE DATOS                      │   │
│   │    • Modelo relacional: activos, categorías, reservas, usuarios │   │
│   │    • Integridad referencial estricta y transacciones ACID       │   │
│   │    • Fuente única de la verdad (SSOT) del laboratorio de PLAi   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
*Figura 3.1.* Diagrama de arquitectura lógica de software en tres capas de la plataforma. *Fuente:* Elaboración propia.

1. **Capa de presentación (interfaz de usuario):** Diseñada bajo el paradigma declarativo de componentes de React. Ofrece vistas reactivas que combinan la visualización rápida del inventario con componentes interactivos para la búsqueda en tiempo real, modales de confirmación accesibles y paneles administrativos adaptables a cualquier dispositivo.
2. **Capa de lógica de negocio y aplicación:** Ejecutada en el entorno de servidor Node.js mediante controladores de Next.js. Es responsable de recibir las solicitudes de los usuarios, validar rigurosamente los tipos y rangos de datos, aplicar el algoritmo de detección de conflictos de agenda, gestionar las restricciones según el perfil del usuario y emitir respuestas estructuradas hacia la interfaz.
3. **Capa de persistencia y gestión de datos:** Centralizada en el motor relacional PostgreSQL. Resguarda de forma unificada las entidades del dominio (categorías, equipamiento tecnológico, solicitudes de préstamo, espacios físicos, bitácoras técnicas y usuarios), garantizando la consistencia transaccional y actuando como la fuente única de la verdad (SSOT) para toda la institución.

---

## 3.4 Diseño de interfaces de usuario y experiencia visual

### 3.4.1 Identidad gráfica y sistema de diseño

Para proyectar formalidad institucional y garantizar una experiencia visual armónica, el diseño de la plataforma adoptó los lineamientos oficiales de identidad gráfica de PLAi y del Gobierno del Estado de Jalisco, implementando un sistema de variables de diseño (*design tokens*) estructurado en Tailwind CSS:
* **Color primario institucional (`#a81e71`):** Utilizado en botones de acción principal (*call-to-action*), elementos activos de navegación e indicadores de relevancia.
* **Color secundario institucional (`#1B365D`):** Empleado en barras superiores de navegación, encabezados estructurales y paneles de resumen.
* **Lienzos neutros de confort visual (`#F4F6F9` y `#E9ECEF`):** Aplicados en fondos de pantalla y contenedores para mitigar la fatiga visual durante jornadas prolongadas de consulta y administración.
* **Jerarquía tipográfica normativa:** Combinación de la fuente tipográfica *Montserrat* para títulos y encabezados principales, con la fuente *Mulish* para textos de lectura continua, fichas descriptivas y formularios.

### 3.4.2 Módulos e interfaces construidas

La plataforma distribuye sus funcionalidades en dos entornos claramente delimitados de cara a los usuarios, cuya organización visual se ilustra en la Figura 3.2.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DISTRIBUCIÓN MODULAR DE LA INTERFAZ                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [ Cabecera institucional: Logotipo PLAi · Menú de navegación · Acceso ]│
│  [ Asistente flotante de accesibilidad: Contraste y tamaño tipográfico ]│
│                                                                         │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐│
│  │ PORTAL PÚBLICO INSTITUCIONAL    │ │ PANEL ADMINISTRATIVO PRIVADO    ││
│  ├─────────────────────────────────┤ ├─────────────────────────────────┤│
│  │ 1. Catálogo interactivo de red  │ │ 1. Inventario integral y altas  ││
│  │    (Filtros por área y buscador)│ │    (Control de estado de activo)││
│  │ 2. Ficha descriptiva de detalle │ │ 2. Gestión de reservaciones     ││
│  │    (Hardware, software y guías) │ │    (Autorización y seguimiento) ││
│  │ 3. Formulario de reservación    │ │ 3. Bitácora de mantenimiento    ││
│  │    (Validación de horarios)     │ │    (Preventivo y correctivo)    ││
│  │ 4. Solicitud de espacios        │ │ 4. Indicadores de disponibilidad││
│  │    (Auditorio, aulas maker)     │ │    (Métricas de ocupación)      ││
│  └─────────────────────────────────┘ └─────────────────────────────────┘│
│                                                                         │
│  [ Pie institucional: Aviso de privacidad · Términos · Enlaces SICyT ]  │
└─────────────────────────────────────────────────────────────────────────┘
```
*Figura 3.2.* Estructura modular de pantallas y navegación en la plataforma de PLAi. *Fuente:* Elaboración propia.

* **Catálogo interactivo de activos:** Cuadrícula de tarjetas visuales que despliegan la fotografía del dispositivo, su nombre comercial, categoría y un semáforo de disponibilidad inmediata (*verde: disponible*; *amarillo: en mantenimiento*; *rojo: reservado*).
* **Ficha descriptiva pormenorizada:** Despliegue de especificaciones de procesador, memoria, sensores o conectividad, acompañado del listado de aplicaciones instaladas y accesos directos a manuales operativos en formato PDF.
* **Formularios interactivos de solicitud:** Asistentes de captura paso a paso provistos de selectores de fecha y horario, campos de justificación de la actividad y aceptación obligatoria del aviso de privacidad antes de la emisión del folio institucional.
* **Panel de administración (*backoffice*):** Espacio provisto de tablas dinámicas con ordenamiento por columnas, filtrado multicriterio, paginación y ventanas de confirmación para salvaguardar operaciones sobre el inventario.

### 3.4.3 Accesibilidad web universal (WCAG 2.1 nivel AA)

Para asegurar la inclusión de personas con debilidad visual o requerimientos especiales de ergonomía, la plataforma incorporó tres herramientas clave en estricto cumplimiento del estándar internacional WCAG 2.1 nivel AA:
1. **Asistente flotante de accesibilidad:** Menú accesible desde cualquier sección del portal que permite escalar el tamaño de la tipografía en tres niveles predeterminados (100 %, 115 % y 130 %), alternar un modo de alto contraste para mejorar la lectura sobre fondos oscuros, cambiar la visualización a escala monocromática y forzar el subrayado explícito de todos los hipervínculos navegables.
2. **Modales accesibles con retención de foco:** Sustitución de las alertas nativas del navegador por ventanas modales semánticas provistas de soporte ARIA (`role="alertdialog"`), las cuales capturan y retienen el foco del teclado mientras permanecen abiertas y permiten su cierre rápido mediante la tecla *Escape*.
3. **Módulo de lectura transparente de privacidad:** Despliegue íntegro del texto del Aviso de Privacidad en una vista accesible de alto contraste para dar certidumbre sobre el tratamiento de datos personales.

---

## 3.5 Implementación de la lógica del negocio y reglas de control

### 3.5.1 Validación de reglas de negocio y cálculo de horarios

Para asegurar que la plataforma opere como una fuente única de la verdad confiable, la integridad de las solicitudes no depende de las verificaciones del navegador, sino que se ejecuta de manera determinista en la capa de lógica de negocio del servidor mediante esquemas de validación estricta:
* **Coherencia temporal cronológica:** El sistema valida matemáticamente que la hora de término sea estrictamente superior a la hora de inicio de la actividad, rechazando solicitudes que introduzcan horarios invertidos o incongruentes.
* **Restricción de duración reglamentaria:** De acuerdo con las políticas internas del Laboratorio de PLAi orientadas a democratizar el acceso al equipamiento inmersivo y de cómputo, la duración de cada préstamo no puede exceder el límite máximo de 120 minutos (dos horas continuas), garantizando una rotación equitativa entre alumnos e investigadores.
* **Validación de campos obligatorios:** Se comprueba que el solicitante proporcione un nombre completo, motivo pedagógico o técnico claro y la aceptación explícita de los términos de custodia del activo.

### 3.5.2 Algoritmo de prevención de colisiones de agenda

El núcleo funcional para garantizar la erradicación total de empalmes de horario se sustenta en un algoritmo de intersección de intervalos temporales implementado en la lógica del servidor. Cuando un usuario envía una solicitud de reservación para un recurso $R$ en una fecha específica $F$, con intervalo horario $[H_{inicio\_solicitada}, H_{fin\_solicitada}]$, el sistema ejecuta los siguientes pasos:
1. Comprueba que el recurso solicitado $R$ se encuentre en condición operativa *disponible* (descartando activos en baja o mantenimiento).
2. Consulta en el repositorio de datos todas las reservaciones confirmadas o activas para el activo $R$ en la fecha $F$.
3. Evalúa si existe alguna reservación existente con intervalo $[H_{inicio\_activa}, H_{fin\_activa}]$ que cumpla la condición de solapamiento temporal:
   $$\max(H_{inicio\_solicitada}, H_{inicio\_activa}) < \min(H_{fin\_solicitada}, H_{fin\_activa})$$
4. Si la condición de solapamiento se cumple con cualquier registro previo, el sistema rechaza la solicitud de forma atómica e informa al usuario el conflicto de horario.
5. Únicamente si el intervalo se encuentra completamente libre de traslapes, la transacción es autorizada y se emite el folio digital de apartado.

### 3.5.3 Modelo funcional de perfiles de usuario

Para mitigar el riesgo de pérdida de control de acceso (OWASP A01), la plataforma implementa una separación rigurosa de atribuciones mediante el modelo RBAC:
* **Perfil solicitante institucional:** Facultado exclusivamente para explorar el catálogo técnico, consultar fichas descriptivas, registrar solicitudes de préstamo de equipos, tramitar reservaciones de espacios y consultar el estado de sus propios trámites.
* **Perfil de administración y laboratorio:** Facultado para ingresar al panel de control, registrar altas y modificaciones de equipamiento, actualizar el estado operativo de los activos, documentar bitácoras de mantenimiento técnico preventivo y autorizar o rechazar formalmente las solicitudes de préstamo recibidas.

El sistema verifica los permisos en el servidor antes de permitir la ejecución de cualquier acción administrativa, redirigiendo de inmediato al portal público a cualquier usuario sin privilegios.

### 3.5.4 Estrategia de verificación y pruebas de calidad

Para garantizar que el software opere sin defectos funcionales ni regresiones en sus reglas de negocio, se diseñó una batería exhaustiva de **74 pruebas automatizadas** distribuidas en 15 suites de pruebas. La estrategia de verificación cubrió tres niveles esenciales:
* **Pruebas de reglas de validación:** Verifican el cumplimiento del límite de dos horas, la coherencia de fechas y horas, y el rechazo automático de datos incompletos.
* **Pruebas del algoritmo anti-colisión:** Simulan escenarios de concurrencia donde múltiples solicitudes compiten por un mismo recurso en bloques horarios coincidentes, comprobando que ninguna reservación empalmada sea aceptada.
* **Pruebas de interfaz y accesibilidad:** Comprueban la navegación por teclado, el correcto funcionamiento del alternador de alto contraste, el escalado tipográfico y el comportamiento de las ventanas modales de confirmación.

---

# 4. Resultados y discusión

---

## 4.1 Análisis cuantitativo de resultados

La evaluación del impacto de la plataforma web se llevó a cabo contrastando los indicadores de operación previos —caracterizados por la gestión manual en hojas de cálculo y bitácoras de papel— frente a los resultados obtenidos tras la puesta en marcha del sistema digital en el Laboratorio de Innovación de PLAi. La Tabla 4.1 sintetiza los indicadores cuantitativos clave recolectados durante la fase de validación.

**Tabla 4.1**  
*Resumen de indicadores cuantitativos de desempeño e impacto operativo de la plataforma*  
*Fuente:* Elaboración propia a partir de las métricas de implementación y validación del proyecto (2026).

| Indicador evaluado | Línea base (gestión manual previa) | Meta establecida | Resultado obtenido | Impacto cuantitativo observado |
| :--- | :---: | :---: | :---: | :--- |
| **Tiempo de consulta y solicitud de equipo** | 15.0 a 20.0 min | ≤ 3.5 min (reducción ≥ 80 %) | **1.2 a 1.5 min** | **Reducción del 91.6 %** en el tiempo administrativo por solicitud. |
| **Incidencia de colisiones de horario** | 2 a 4 empalmes semanales | 0 colisiones (eliminación 100 %) | **0 colisiones** | **100 % de empalmes erradicados** mediante validación algorítmica. |
| **Trazabilidad documental de préstamos** | Parcial y dispersa en papel/hojas | 100 % de solicitudes foliadas | **100 %** | Asignación unívoca de folio digital, responsable y horario. |
| **Pruebas automatizadas de software** | Sin pruebas automatizadas | 100 % de aprobación | **100 % (74/74)** | Verificación integral en 15 suites de prueba (ejecución en 3.83 s). |
| **Evaluación de usabilidad (escala SUS)** | No aplicable | ≥ 68.0 puntos (estándar aceptable) | **88.5 / 100 puntos** | Nivel de aceptación **Grado A (Excelente)** con 90 % de promotores. |

El análisis cuantitativo de estas métricas demuestra beneficios sustanciales en la operación institucional. El tiempo promedio invertido para consultar la disponibilidad de un dispositivo y formalizar su solicitud descendió de 17.5 minutos a tan solo 1.35 minutos, lo que representa una **disminución del 91.6 %** en la carga de tiempo administrativo, superando ampliamente el compromiso del 80 % planteado en la hipótesis. Asimismo, la incorporación del algoritmo de validación temporal en la lógica de negocio **eliminó el 100 % de las colisiones de horario**, erradicando por completo los empalmes semanales que afectaban la impartición de talleres de realidad virtual y robótica.

En el ámbito del aseguramiento de la calidad del software, la suite de **74 pruebas automatizadas** alcanzó un índice de aprobación del 100 %, certificando la estabilidad de los módulos de cálculo y control de acceso. Por último, la aplicación del instrumento estandarizado *System Usability Scale* (SUS) (Brooke, 1996) sobre una muestra de diez usuarios representativos del recinto (cinco solicitantes externos y cinco operadores del laboratorio) arrojó una puntuación media de **88.5 sobre 100 puntos**. Este resultado ubica a la plataforma en el percentil superior (*Grado A - Nivel Excelente*), ratificando que el diseño visual intuitivo y las herramientas de accesibilidad universal minimizan la fricción cognitiva durante el proceso de consulta y reservación.

---

## 4.2 Autoevaluación de objetivos y discusión

Al confrontar los resultados descritos con los objetivos definidos al inicio de la estadía profesional, se determina un cumplimiento integral del **100 % de las metas trazadas**, confirmando empíricamente la hipótesis formulada en el Capítulo 1. La transición hacia una **fuente única de la verdad (SSOT)** centralizada en PostgreSQL y accesible mediante una interfaz ágil en Next.js transformó radicalmente la administración del laboratorio, dotando a la institución de certeza patrimonial y agilidad operativa.

Entre los principales **factores de éxito** que impulsaron estos resultados destacan:
1. La selección acertada del marco tecnológico (Next.js, React, Tailwind CSS y PostgreSQL), el cual ofreció una combinación óptima de renderizado acelerado en servidor, modularidad de componentes y solidez transaccional para la prevención de traslapes.
2. La disciplina iterativa del marco de trabajo Scrum, cuyas entregas quincenales permitieron afinar las reglas de negocio en conjunto con el personal de PLAi, garantizando que el límite de dos horas por préstamo y los flujos de solicitud se adaptaran a la operación real.
3. El enfoque centrado en la accesibilidad web universal (WCAG 2.1 AA) y la protección de datos personales desde las primeras fases de diseño, fortaleciendo el carácter inclusivo y normativo del producto final.

No obstante, un análisis reflexivo y honesto exige documentar también las **limitantes encontradas** a lo largo del proyecto. La disparidad en los registros históricos y fichas técnicas existentes representó un reto inicial que demandó un trabajo exhaustivo de depuración y normalización de especificaciones antes de poblar la base de datos. Por otro lado, la delimitación temporal de diez semanas impuso concentrar los esfuerzos en los flujos principales de préstamo, catálogo y administración del laboratorio, dejando como líneas de mejora futura la integración de recordatorios automáticos por correo electrónico y la generación de etiquetas QR físicas para los activos. Pese a estas delimitaciones, la solución desarrollada provee una plataforma estable, extensible y lista para evolucionar conforme crezca el patrimonio tecnológico de PLAi.

---

# 5. Conclusiones y recomendaciones

## 5.1 Conclusiones

1. Se cumplió satisfactoriamente el objetivo general del proyecto mediante el diseño, desarrollo e implementación de una plataforma digital web que centraliza el catálogo tecnológico, las fichas técnicas y el flujo de reservación de equipos y espacios del Laboratorio de Innovación de PLAi bajo el modelo de fuente única de la verdad (SSOT).
2. Se demostró empíricamente la hipótesis de trabajo al alcanzar una reducción del 91.6 % en los tiempos administrativos de consulta y solicitud de equipamiento, eliminando por completo los empalmes de horario mediante reglas de validación automatizadas en el servidor.
3. La selección tecnológica integrada por Node.js, Next.js, TypeScript, Tailwind CSS y PostgreSQL probó ser altamente pertinente bajo criterios de rendimiento, escalabilidad y compatibilidad, logrando tiempos de respuesta inmediatos, integridad referencial estricta y una calificación de usabilidad sobresaliente de 88.5 puntos en la escala SUS.
4. La aplicación del control de acceso basado en roles (RBAC), la protección de datos personales y el empaquetado modular garantizaron un producto de software robusto, seguro y alineado con las directrices normativas de la institución receptora.

## 5.2 Recomendaciones

1. **Integración de notificaciones automatizadas:** Se recomienda incorporar en una segunda fase un servicio de mensajería institucional por correo electrónico que notifique automáticamente a los solicitantes cuando el estado de su reservación cambie o cuando se aproxime el horario de devolución del equipo.
2. **Digitalización mediante códigos QR en almacén:** Se sugiere generar etiquetas con códigos QR vinculadas a la ficha técnica de cada activo dentro de la plataforma, con el fin de agilizar aún más el registro de entrega y recepción física en la ventanilla del laboratorio.
3. **Ampliación de analítica predictiva de mantenimiento:** Aprovechando el historial acumulado de préstamos y bitácoras técnicas, se aconseja programar alertas preventivas automáticas cada determinado número de horas de uso en dispositivos de alta demanda, tales como visores de realidad virtual e impresoras 3D.

---

# 6. Glosario de términos

Con el propósito de unificar criterios terminológicos entre los conceptos en español y los tecnicismos en inglés empleados en la literatura de ingeniería de software, se presenta el siguiente glosario normativo:

* **ACID (*Atomicity, Consistency, Isolation, Durability*):** Conjunto de cuatro propiedades (atomicidad, consistencia, aislamiento y durabilidad) que garantizan que las transacciones en una base de datos se procesen de manera fiable e íntegra.
* **Componentes de servidor de React (*React Server Components*, RSC):** Arquitectura de renderizado que permite ejecutar componentes de interfaz directamente en el servidor, reduciendo la cantidad de código JavaScript enviado al navegador del cliente.
* **Control de acceso basado en roles (*role-based access control*, RBAC):** Modelo de seguridad informática que restringe el acceso al sistema y a sus funciones en función del perfil o rol asignado a cada usuario dentro de una organización.
* **Enfoque de clases de utilidad (*utility-first CSS*):** Metodología de diseño web basada en la composición de interfaces mediante clases CSS atómicas de propósito único aplicadas directamente en el marcado del componente.
* **Entorno de ejecución (*runtime*):** Conjunto de servicios e infraestructura de software que proporciona los recursos necesarios para que un programa sea ejecutado en un sistema informático (como Node.js para JavaScript).
* **Entrada/salida no bloqueante (*non-blocking I/O*):** Modelo de procesamiento asíncrono en el que el servidor puede continuar atendiendo nuevas peticiones mientras espera que se completen operaciones de lectura o escritura en disco o red.
* **Fuente única de la verdad (*single source of truth*, SSOT):** Práctica arquitectónica que consiste en estructurar los modelos de información de tal manera que cada elemento de dato se almacene y consulte desde un único repositorio centralizado y fidedigno.
* **Limitación de tasa de peticiones (*rate limiting*):** Técnica de control de tráfico de red utilizada para restringir el número de solicitudes que un cliente puede realizar a un servidor dentro de un intervalo de tiempo determinado, previniendo abusos o ataques de saturación.
* **Marco de trabajo (*framework*):** Estructura conceptual y tecnológica estandarizada que sirve como base para el desarrollo y organización de aplicaciones de software.
* **Pérdida de control de acceso (*broken access control*):** Vulnerabilidad crítica de seguridad web (clasificada como A01 en el estándar OWASP) que ocurre cuando las restricciones sobre lo que los usuarios autenticados pueden hacer no se aplican correctamente en el servidor.
* **Un solo hilo (*single-threaded*):** Modelo de ejecución en el cual las instrucciones se procesan a través de una única secuencia principal de control, apoyándose en un bucle de eventos para gestionar la concurrencia asíncrona.

---

# 7. Referencias

Alura Cursos Online. (2025, 29 de julio). *Node.js: qué es, cómo funciona este entorno de ejecución de JavaScript y una guía para empezar*. https://www.aluracursos.com/blog/node-js-que-es-como-funciona-este-entorno-de-ejecucion-de-javascript-y-una-guia-para-empezar

Brooke, J. (1996). SUS: A "quick and dirty" usability scale. En P. W. Jordan, B. Thomas, B. A. Weerdmeester y I. L. McClelland (Eds.), *Usability evaluation in industry* (pp. 189–194). Taylor & Francis.

Cloudflare. (s. f.). *¿Qué es el OWASP? ¿Qué es el OWASP Top 10?* Cloudflare Learning Center. Recuperado el 20 de octubre de 2026, de https://www.cloudflare.com/es-es/learning/security/threats/owasp-top-10/

Cyberclick. (s. f.). *Single Source of Truth: qué es, ejemplos y cómo implementarla*. Recuperado el 20 de octubre de 2026, de https://www.cyberclick.es/numerical-blog/single-source-of-truth-que-es-ejemplos-y-como-implementarla

Laravel. (s. f.). *Laravel documentation*. Recuperado el 20 de octubre de 2026, de https://laravel.com/docs

MDN Web Docs. (s. f.-a). *CSS: Hojas de estilo en cascada*. Mozilla Foundation. Recuperado el 20 de octubre de 2026, de https://developer.mozilla.org/es/docs/Web/CSS

MDN Web Docs. (s. f.-b). *JavaScript*. Mozilla Foundation. Recuperado el 20 de octubre de 2026, de https://developer.mozilla.org/es/docs/Web/JavaScript

MongoDB. (s. f.). *Bienvenido a la documentación de MongoDB*. Recuperado el 20 de octubre de 2026, de https://www.mongodb.com/es/docs/

Oracle Corporation. (s. f.). *MySQL reference manual*. Recuperado el 20 de octubre de 2026, de https://dev.mysql.com/doc/

OWASP Foundation. (2025). *OWASP Top 10:2025*. https://top10.owasp.org/2025/

PHP Group. (s. f.). *Manual de PHP*. Recuperado el 20 de octubre de 2026, de https://www.php.net/manual/es/

Plataforma Abierta de Innovación. (s. f.). *Plataforma Abierta de Innovación y Desarrollo de Jalisco (PLAi)*. Gobierno del Estado de Jalisco. Recuperado el 20 de octubre de 2026, de https://plai.mx/

PostgreSQL Global Development Group. (s. f.). *PostgreSQL documentation*. Recuperado el 20 de octubre de 2026, de https://www.postgresql.org/docs/

React. (s. f.). *React: La biblioteca para interfaces de usuario web y nativas*. Meta Platforms. Recuperado el 20 de octubre de 2026, de https://es.react.dev/

Schwaber, K., y Sutherland, J. (2020). *La Guía de Scrum: Las reglas del juego*. Scrum.org. https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-Spanish-Latin-South-American.pdf

Tailwind Labs. (s. f.). *Tailwind CSS documentation*. Recuperado el 20 de octubre de 2026, de https://tailwindcss.com/docs

Vercel. (2026). *Next.js documentation: App Router*. https://nextjs.org/docs

---

# 8. Anexos

*(Espacio reservado para la inclusión de capturas de pantalla de la interfaz final, formatos de carta responsiva institucional y cuestionario de evaluación de usabilidad SUS aplicado).*
