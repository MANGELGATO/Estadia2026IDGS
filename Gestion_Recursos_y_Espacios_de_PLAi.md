# PROYECTO DE ESTADÍA PROFESIONAL

## Desarrollo de una Plataforma Digital para la Gestión de Recursos y Espacios de PLAI

### 1. Nombre del proyecto
Desarrollo e implementación de una plataforma digital para la gestión, consulta, disponibilidad y reservación de recursos tecnológicos y espacios del PLAI.

### 2. Área responsable
**PLAI - Laboratorio de Innovación, Robótica y Tecnologías Inmersivas**  
Programa académico: Ingeniería en Desarrollo de Software

### 3. Descripción del proyecto
El proyecto consiste en el diseño y desarrollo de una plataforma digital para centralizar la información, administración, disponibilidad y reservación de los recursos tecnológicos utilizados en PLAI.

PLAi cuenta con una amplia variedad de recursos tecnológicos destinados a actividades educativas, demostrativas, talleres, proyectos y servicios. Entre ellos se encuentran visores de realidad virtual, equipos de cómputo, drones, kits de robótica, impresoras 3D, escáneres 3D, controles, accesorios, aplicaciones y otros dispositivos.

Actualmente, la información relacionada con estos recursos puede encontrarse distribuida en diferentes registros o mecanismos de control, lo que puede dificultar la consulta rápida de información como ubicación, número de serie, estado, disponibilidad, aplicaciones asociadas o responsable del equipo.

Por ello, se propone desarrollar una plataforma que permita concentrar esta información en un solo sistema, facilitando su administración y consulta. La plataforma permitirá registrar y consultar información detallada de cada recurso, así como conocer su disponibilidad y, de acuerdo con los permisos establecidos, realizar solicitudes o reservaciones para su utilización.

Como una segunda etapa y si el avance del proyecto, el tiempo disponible y la viabilidad técnica lo permiten, la plataforma podrá ampliarse para incorporar también la gestión de los espacios físicos de PLAi, tales como auditorio, salas de juntas, áreas de coworking, salas de capacitación y otros espacios susceptibles de ser reservados. 

De esta manera, el proyecto podrá evolucionar de un sistema de inventario tecnológico hacia una plataforma integral para la gestión de recursos y espacios de PLAI.

### 4. Justificación
PLAi dispone de diversos recursos tecnológicos que son utilizados de manera recurrente para talleres, actividades, demostraciones, eventos, visitas y proyectos. La diversidad y cantidad de estos recursos hace necesario contar con una herramienta que permita mantener información organizada y actualizada, así como conocer de manera rápida su ubicación, estado y disponibilidad.

Una plataforma digital permitirá mejorar la administración de estos recursos y facilitar la colaboración entre las personas que participan en las actividades de PLAI. El proyecto permitirá:

* Centralizar la información de los recursos tecnológicos.
* Facilitar la consulta del inventario.
* Identificar equipos mediante números de serie e identificadores institucionales.
* Registrar ubicación y estado de los recursos.
* Identificar recursos disponibles, reservados o en mantenimiento.
* Consultar las aplicaciones o software asociados a determinados equipos.
* Llevar un control de accesorios y componentes.
* Facilitar la solicitud y reservación de recursos.
* Registrar el historial de utilización de los equipos.
* Generar información para apoyar la toma de decisiones.
* Mejorar la organización y aprovechamiento de los recursos tecnológicos.
* Reducir la dependencia de registros manuales o información dispersa.

Adicionalmente, la incorporación futura de los espacios físicos permitiría administrar desde una misma plataforma tanto recursos tecnológicos como espacios de trabajo, facilitando la organización de actividades y eventos.

### 5. Problemática
PLAi cuenta con una cantidad considerable de recursos tecnológicos y espacios que pueden ser utilizados por diferentes colaboradores y para distintas actividades. La información relacionada con estos elementos requiere mantenerse actualizada para conocer aspectos como:

* Qué recursos existen.
* Cuántos equipos están disponibles.
* Dónde se encuentran.
* Quién los tiene asignados o bajo resguardo.
* Cuál es su estado.
* Qué aplicaciones o accesorios tienen.
* Cuándo pueden utilizarse.
* Si se encuentran en mantenimiento.
* Cuáles son los espacios disponibles para realizar actividades.

La ausencia de una plataforma centralizada puede dificultar la consulta y actualización de esta información, así como la planeación de actividades que requieren utilizar simultáneamente determinados espacios y equipos. Por lo anterior, se identifica la necesidad de desarrollar una herramienta digital que permita organizar, consultar y gestionar estos recursos de manera centralizada y accesible para los usuarios autorizados.

### 6. Objetivo general
Diseñar, desarrollar e implementar una plataforma digital que permita centralizar, administrar y consultar la información de los recursos tecnológicos de PLAI, incluyendo su disponibilidad y reservación, con la posibilidad de ampliar posteriormente sus funcionalidades para incorporar la gestión y reservación de los espacios físicos del laboratorio.

### 7. Objetivos específicos

#### 7.1 Analizar las necesidades de PLAI
Identificar las necesidades actuales relacionadas con la administración, consulta, disponibilidad y utilización de los recursos tecnológicos y, posteriormente, de los espacios físicos.

#### 7.2 Realizar el levantamiento del inventario tecnológico
Identificar y clasificar los recursos tecnológicos que serán incorporados inicialmente a la plataforma. La información podrá incluir:
* Nombre del recurso.
* Categoría.
* Marca.
* Modelo.
* Número de serie.
* Número de inventario.
* Ubicación.
* Estado.
* Responsable.
* Accesorios.
* Características técnicas.
* Observaciones.

#### 7.3 Diseñar la base de datos
Diseñar e implementar una estructura de base de datos que permita almacenar, organizar y relacionar la información de los diferentes recursos tecnológicos. La estructura deberá permitir incorporar nuevos tipos de recursos conforme evolucione el inventario de PLAi.

#### 7.4 Desarrollar el módulo de inventario
Implementar un módulo que permita:
* Registrar recursos.
* Consultar recursos.
* Modificar información.
* Actualizar estados.
* Registrar bajas.
* Buscar recursos.
* Filtrar información.

#### 7.5 Implementar fichas digitales de los recursos
Desarrollar una ficha individual para cada recurso tecnológico, en la cual pueda consultarse su información relevante. Por ejemplo:
**Meta Quest 3**
* Número de inventario.
* Número de serie.
* Ubicación.
* Estado.
* Accesorios.
* Cuenta asociada.
* Aplicaciones instaladas.
* Observaciones.
* Historial.

La información mostrada dependerá del tipo de recurso y del nivel de acceso del usuario.

#### 7.6 Incorporar la gestión de aplicaciones y software
Permitir registrar, para los equipos que lo requieran, información relacionada con aplicaciones, programas, licencias o software asociados. Por ejemplo, en los visores de realidad virtual se podrá identificar qué aplicaciones se encuentran disponibles en cada dispositivo.

#### 7.7 Implementar el control de disponibilidad
Desarrollar un sistema que permita identificar el estado y disponibilidad de cada recurso. Se podrán establecer estados como:
* Disponible.
* Reservado.
* En uso.
* En mantenimiento.
* Fuera de servicio.
* No disponible.

#### 7.8 Desarrollar un sistema de reservaciones
Implementar un sistema que permita a los usuarios autorizados consultar la disponibilidad y solicitar recursos para una fecha y horario determinados. La solicitud podrá incluir:
* Usuario.
* Recurso.
* Fecha.
* Hora de inicio.
* Hora de finalización.
* Actividad.
* Observaciones.

#### 7.9 Implementar perfiles y permisos de usuario
Diseñar diferentes niveles de acceso para proteger la información y adaptar las funcionalidades disponibles a cada tipo de usuario. Se propone inicialmente considerar:

**Administrador**
* Administra recursos.
* Administra usuarios.
* Consulta información completa.
* Gestiona reservaciones.
* Actualiza estados.
* Genera reportes.

**Colaborador**
* Consulta recursos.
* Consulta disponibilidad.
* Solicita reservaciones.
* Consulta sus reservaciones.

**Usuario final**
* Consulta la información que PLAi determine como pública.
* Puede consultar determinados recursos o espacios.
* Podrá realizar solicitudes cuando esta función sea habilitada.

#### 7.10 Implementar mecanismos básicos de seguridad
Establecer mecanismos de autenticación, autorización y protección de la información. La plataforma deberá diferenciar entre información pública, información interna e información restringida. En particular, las contraseñas y credenciales asociadas a cuentas institucionales no deberán exponerse a usuarios generales. Cuando sea necesario registrar información sobre cuentas, se deberán implementar mecanismos adecuados para restringir su acceso y proteger las credenciales.

### 8. Segunda etapa: incorporación de espacios físicos
Como ampliación del proyecto, y si el tiempo disponible y el avance del desarrollo lo permiten, se podrá incorporar la gestión de espacios físicos de PLAi. Esta etapa podrá contemplar:
* Auditorio.
* Salas de juntas.
* Coworking.
* Salas de capacitación.
* Laboratorios.
* Áreas de trabajo.
* Otros espacios disponibles.

Cada espacio podrá contar con información como:
* Nombre.
* Capacidad.
* Ubicación.
* Características.
* Equipamiento disponible.
* Horarios disponibles.
* Estado.
* Reglas de utilización.

También podrá incorporarse un sistema de reservación de espacios.

### 9. Integración de recursos y espacios
Como una funcionalidad de crecimiento, la plataforma podrá permitir relacionar recursos tecnológicos con espacios físicos. 
Por ejemplo:
> **Reserva de actividad**  
> Actividad: Taller de Realidad Virtual  
> Fecha: 15 de octubre  
> Horario: 10:00 - 12:00  
> Espacio: Sala de capacitación  
> Participantes: 20  
> **Recursos requeridos:**  
> * 15 Meta Quest 3.  
> * 1 computadora.  
> * 1 proyector.  

El sistema podría verificar la disponibilidad tanto del espacio como de los recursos. Esto permitiría que la plataforma evolucione hacia una herramienta de apoyo para la planeación y organización de actividades de PLAI.

### 10. Ejemplo de funcionamiento
Un colaborador ingresa a la plataforma y selecciona:
**"Recursos tecnológicos"**

El sistema muestra diferentes categorías:
* Realidad Virtual
* Robótica
* Cómputo
* Drones
* Fabricación digital
* Escaneo 3D
* Accesorios

El usuario selecciona:
**Realidad Virtual → Meta Quest 3**

Puede consultar:
> **Meta Quest 3 #15**  
> Estado: Disponible  
> Ubicación: Área de Realidad Virtual  
> Número de serie: XXXXX  
> Aplicaciones: Beat Saber, Job Simulator, Ocean Rift...  
> Accesorios: XXXXX  

Posteriormente puede seleccionar:
**"Consultar disponibilidad"**
Y visualizar los horarios disponibles.

Finalmente, si cuenta con los permisos correspondientes:
**"Solicitar reservación"**

### 11. Alcance del proyecto

**Alcance principal**
La primera versión del proyecto deberá enfocarse en:
* Levantamiento del inventario.
* Clasificación de recursos.
* Base de datos.
* Plataforma de consulta.
* Fichas de recursos.
* Búsqueda y filtros.
* Control de estados.
* Disponibilidad.
* Reservaciones.
* Usuarios y permisos.
* Registro de aplicaciones y software.
* Información de mantenimiento.
* Reportes básicos.

**Alcance complementario**
Si el avance del proyecto lo permite:
* Incorporación de espacios físicos.
* Consulta de disponibilidad de espacios.
* Reservación de espacios.
* Relación entre espacios y recursos.
* Planeación de actividades que requieran ambos.

La incorporación de esta segunda etapa no deberá comprometer el cumplimiento de los objetivos principales de la estadía.

### 12. Entregables esperados

**Entregables principales**
1. Documento de análisis de requerimientos.
2. Diseño de la base de datos.
3. Plataforma digital funcional.
4. Catálogo digital de recursos tecnológicos.
5. Fichas individuales de recursos.
6. Sistema de búsqueda y filtros.
7. Sistema de disponibilidad.
8. Sistema de reservaciones.
9. Gestión de usuarios y permisos.
10. Registro de aplicaciones y software.
11. Registro de mantenimiento e incidencias.
12. Reportes básicos.
13. Documentación técnica.
14. Manual de usuario.
15. Manual básico de administración.
16. Presentación y demostración funcional.

**Entregables opcionales**
En función del avance:
17. Catálogo de espacios físicos.
18. Sistema de disponibilidad de espacios.
19. Reservación de espacios.
20. Relación entre espacios y recursos.

### 13. Competencias que desarrollará el estudiante
Durante el desarrollo del proyecto, el estudiante podrá fortalecer competencias relacionadas con:
* Análisis de requerimientos.
* Diseño de soluciones de software.
* Diseño y administración de bases de datos.
* Desarrollo web o de aplicaciones.
* Diseño de interfaces.
* Desarrollo de sistemas de información.
* Autenticación y autorización.
* Gestión de usuarios.
* Desarrollo de sistemas de reservación.
* Manejo y protección de información.
* Pruebas de software.
* Control de versiones.
* Documentación técnica.
* Resolución de problemas reales.
* Desarrollo de soluciones centradas en el usuario.

### 14. Indicadores de cumplimiento

| Indicador | Meta |
| :--- | :--- |
| Levantamiento de recursos incluidos en el alcance | 100% |
| Base de datos | Implementada |
| Plataforma funcional | 1 |
| Catálogo de recursos | Implementado |
| Fichas de recursos | Implementadas |
| Búsqueda y filtros | Implementados |
| Control de disponibilidad | Implementado |
| Sistema de reservaciones | Implementado |
| Gestión de usuarios | Implementada |
| Control de permisos | Implementado |
| Registro de aplicaciones | Implementado |
| Registro de mantenimiento | Implementado |
| Reportes básicos | Implementados |
| Pruebas de funcionamiento | Realizadas |
| Documentación técnica | Entregada |
| Manual de usuario | Entregado |
| Demostración final | Realizada |

**Indicadores complementarios, sujetos al avance del proyecto:**

| Indicador | Meta |
| :--- | :--- |
| Espacios físicos incorporados | Según alcance aprobado |
| Disponibilidad de espacios | Implementada |
| Reservación de espacios | Implementada |
| Relación recurso-espacio | Implementada |

### 15. Proyección a futuro
Una vez desarrollada la primera versión de la plataforma, esta podrá continuar evolucionando de acuerdo con las necesidades de PLAI. Entre las posibles líneas de crecimiento se encuentran:
* Incorporación de códigos QR para identificación de equipos.
* Consulta de información mediante dispositivos móviles.
* Historial de préstamos.
* Firma digital de resguardos.
* Notificaciones y recordatorios.
* Alertas de mantenimiento.
* Estadísticas de utilización.
* Dashboard administrativo.
* Gestión de consumibles.
* Integración con calendarios.
* Aplicación móvil.
* Gestión de espacios físicos.
* Gestión de actividades y eventos.
* Relación automática entre espacios, recursos y actividades.

Estas funcionalidades podrán desarrollarse en etapas posteriores y no forman parte necesariamente de la primera versión de la plataforma.

### 16. Resultado final esperado
Al finalizar la estadía, PLAi deberá contar con una primera versión funcional de una plataforma digital que centralice la información y facilite la gestión de sus recursos tecnológicos. 

El sistema deberá permitir que un colaborador autorizado pueda responder de manera rápida preguntas como:
* ¿Qué equipos tenemos?
* ¿Cuántos tenemos?
* ¿Dónde están?
* ¿Cuál es su número de serie?
* ¿En qué estado se encuentran?
* ¿Qué aplicaciones tiene cada equipo?
* ¿Está disponible?
* ¿Cuándo puedo utilizarlo?
* ¿Quién lo tiene reservado?

Como resultado de una segunda etapa, si el tiempo y las condiciones del proyecto lo permiten, estas mismas capacidades podrán aplicarse a los espacios físicos de PLAI, permitiendo consultar y reservar tanto equipos como espacios desde una misma plataforma.

### 17. Conclusión
El desarrollo de esta plataforma representa una oportunidad para implementar una solución tecnológica orientada a una necesidad real de PLAi: la organización, disponibilidad y aprovechamiento eficiente de sus recursos.

El proyecto permitirá al estudiante aplicar conocimientos de Ingeniería en Desarrollo de Software en un entorno real, desarrollando una solución que podrá ser utilizada y mejorada posteriormente por PLAI.

La primera etapa estará enfocada en consolidar un sistema de inventario, disponibilidad y reservación de recursos tecnológicos, estableciendo una base sólida para que, posteriormente, puedan integrarse los espacios físicos y otras funcionalidades. De esta manera, el proyecto podrá evolucionar gradualmente hacia una plataforma integral de gestión de recursos y espacios de PLAi, sin comprometer los objetivos fundamentales establecidos para la estadía profesional.
