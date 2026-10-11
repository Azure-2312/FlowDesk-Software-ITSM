# Matriz de Perfiles, Permisos, Rutas y Segregación de Funciones
## Sistema de Gestión de Servicios de TI (ITSM) - ITIL v4 e ISO 27001

---

## 1. Introducción y Marco de Seguridad RBAC

El sistema de gestión de servicios de TI (ITSM) adopta una arquitectura de **Control de Acceso Basado en Roles (RBAC - Role-Based Access Control)** alineada con las mejores prácticas de **ITIL v4**, la norma **ISO/IEC 20000** (Gestión de Servicios de TI) y el estándar **ISO 27001** (Seguridad de la Información).

El modelo está regido por tres principios fundamentales de gobernanza corporativa:

1. **Principio de Menor Privilegio (Least Privilege):** Cada usuario tiene acceso estrictamente a las funciones y rutas necesarias para cumplir con sus responsabilidades operativas.
2. **Segregación Estricta de Funciones (Separation of Duties - SoD):** Ningún usuario puede completar por sí solo un ciclo operativo que represente un conflicto de interés (por ejemplo: el solicitante no puede aprobar su propia compra de hardware, ni el técnico puede auditar los tiempos contractuales de su propio desempeño).
3. **Navegación Dinámica Multirrol:** El sistema no utiliza menús estáticos en el frontend. La estructura de navegación se genera dinámicamente desde la base de datos consultando el perfil activo del usuario. Cuando un colaborador posee más de un rol asignado, debe seleccionar explícitamente con qué perfil operará mediante el componente de selector de perfil activo.

---

## 2. Modelo de Datos de Permisos y Menús

La autorización y renderizado de la barra lateral se gestionan a través de las siguientes tablas en PostgreSQL:

- **`perfiles`:** Define los roles oficiales del sistema con identificadores del 1 al 6.
- **`opciones_menu`:** Catálogo jerárquico de hasta 3 niveles que almacena las rutas URL, nombres, descripciones y orden de visualización.
- **`opciones_menu_perfiles`:** Tabla intermedia que asocia qué opciones de menú están habilitadas para cada perfil específico.
- **`usuario_perfiles`:** Tabla de asignación que vincula a cada usuario con uno o más perfiles autorizados.

---

## 3. Catálogo Detallado de Perfiles

---

### 3.1. Solicitante (`id_perfil: 3`)

#### Definición y Propósito Organizacional
Es el cliente interno o usuario final de la organización (colaboradores de cualquier área funcional o administrativa). Su propósito dentro del marco ITIL v4 es registrar peticiones formales de provisión de recursos tecnológicos, reportar incidentes de interrupción de servicio y consultar guías de autoayuda para solucionar problemas comunes de forma autónoma.

#### Atribuciones Operativas (Qué PUEDE hacer)
- **Navegar el Catálogo Corporativo de Servicios:** Explorar de forma visual las tres macro-divisiones del catálogo (Incidentes, Problemas y Peticiones de Servicio) organizadas en categorías como Equipamiento Nuevo, Hardware y Equipos, Redes, Software y Usuarios.
- **Consultar la Ficha Técnica de Servicios:** Visualizar antes de solicitar los acuerdos SLA pactados (tiempo de respuesta y resolución), el entregable oficial y si el servicio requiere autorización previa de jefatura.
- **Registrar Tickets:** Crear requerimientos detallando asunto, descripción, justificación de negocio, nivel de impacto percibido y archivos adjuntos.
- **Monitorear el Progreso Personal:** Consultar el estado en tiempo real (Abierto, Asignado, En Proceso, En Espera, Resuelto, Cerrado), el técnico responsable asignado y las notas públicas.
- **Interactuar en el Timeline:** Responder consultas de los especialistas técnicos si el ticket fue puesto "En Espera" por solicitud de información adicional.
- **Evaluar la Satisfacción del Servicio (CSAT):** Calificar con una escala de 1 a 5 estrellas la atención recibida una vez resuelto el ticket.
- **Solicitar Reapertura de Ticket:** Solicitar la reapertura dentro de las 48 horas posteriores a la resolución si la falla no fue subsanada o el servicio entregado fue insatisfactorio.
- **Consultar la Base de Autoayuda:** Acceder a artículos, instructivos y preguntas frecuentes para autoservicio.

#### Restricciones de Seguridad (Qué NO PUEDE hacer)
- No puede visualizar tickets creados por otros colaboradores de la empresa.
- No puede modificar la prioridad oficial, SLA asignado ni tiempos calculados en base de datos.
- No puede autoasignarse tickets ni derivarlos a técnicos.
- No puede visualizar las notas internas de diagnóstico intercambiadas entre técnicos.
- No puede acceder a ningún módulo administrativo, financiero ni de auditoría.

#### Rutas y Opciones de Menú Habilitadas
| Opción de Menú | Ruta URL | Nivel | Descripción Funcional |
| :--- | :--- | :---: | :--- |
| Módulo Raíz | `/tickets` | 1 | Contenedor principal de mesa de ayuda |
| Gestión de tickets | `/tickets/gestion` | 2 | Subcontenedor operativo |
| Catálogo de servicios | `/tickets/catalogo` | 3 | Portal corporativo de servicios por categorías |
| Crear ticket | `/tickets/gestion/crear` | 3 | Formulario de registro de incidentes y solicitudes |
| Mis tickets | `/tickets/gestion/mios` | 3 | Seguimiento a requerimientos creados por el usuario |
| Base de autoayuda | `/tickets/gestion/ayuda` | 3 | Artículos de conocimiento y guías de autoatención |

---

### 3.2. Técnico (`id_perfil: 2`)

#### Definición y Propósito Organizacional
Es el especialista operativo de soporte (Nivel 1 - Mesa de Ayuda, Nivel 2 - Soporte en Sitio/Infraestructura, o Nivel 3 - Ingeniería y Especialidades). Su función principal dentro de la práctica de Gestión de Incidentes y Gestión de Solicitudes de ITIL v4 es restaurar la operatividad normal del servicio dentro de los tiempos estipulados en los Acuerdos de Nivel de Servicio (SLA) y Acuerdos de Nivel Operativo (OLA).

#### Atribuciones Operativas (Qué PUEDE hacer)
- **Gestionar la Bandeja de Asignados:** Administrar la cola de incidentes y solicitudes asignadas a su nombre, ordenadas por criticidad y vencimiento de SLA.
- **Tomar Tickets Pendientes (Modelo Pull):** Autoasignarse tickets disponibles en la bandeja general siempre que no exceda su límite de trabajo en progreso (WIP).
- **Controlar el Ciclo de Vida del Ticket:**
  - Cambiar a *En Proceso* (inicia la labor técnica activa).
  - Cambiar a *En Espera* (pausa el cronómetro SLA indicando motivo justificado: información de usuario, repuesto, proveedor externo).
  - Cambiar a *Resuelto* (registra obligatoriamente el informe de solución técnica implementada).
- **Registrar Bitácora Técnica Dual:** Redactar notas internas (visibles solo para el personal técnico) y comentarios públicos dirigidos al usuario solicitante.
- **Consultar Historial de Tickets Resueltos:** Revisar tickets concluidos para reutilizar diagnósticos previos y soluciones documentadas.

#### Restricciones de Seguridad (Qué NO PUEDE hacer)
- No puede modificar SLAs corporativos ni alterar los tiempos transcurridos en los cronómetros de base de datos.
- No puede reasignar tickets a otros técnicos de manera discrecional (facultad exclusiva del Supervisor).
- No puede autorizar solicitudes que requieran aprobación de jefatura o impacto financiero.
- No puede crear ni eliminar usuarios, perfiles ni categorías del catálogo.
- No puede consultar logs de seguridad perimetral ni auditorías globales.

#### Rutas y Opciones de Menú Habilitadas
| Opción de Menú | Ruta URL | Nivel | Descripción Funcional |
| :--- | :--- | :---: | :--- |
| Módulo Raíz | `/tickets` | 1 | Contenedor principal de mesa de ayuda |
| Gestión de tickets | `/tickets/gestion` | 2 | Subcontenedor de flujos operativos de soporte |
| Tickets asignados | `/tickets/gestion/asignados` | 3 | Mesa de trabajo con casos asignados al especialista |
| Bandeja de tickets | `/tickets/gestion/bandeja` | 3 | Cola general de tickets pendientes y sin asignar |
| Tickets resueltos | `/tickets/gestion/resueltos` | 3 | Repositorio de consulta de casos cerrados y resoluciones |

---

### 3.3. Supervisor (`id_perfil: 4`)

#### Definición y Propósito Organizacional
Es el coordinador operativo del Service Desk o líder de equipo técnico. Su función principal es supervisar el flujo integral de atención, balancear equitativamente la carga de trabajo entre los técnicos, monitorear el cumplimiento de los tiempos de SLA y OLA, y evitar el estancamiento de tickets críticos.

#### Atribuciones Operativas (Qué PUEDE hacer)
- **Monitoreo Global de la Operación:** Acceder a la vista consolidada de todos los tickets de la organización con filtros avanzados por departamento de TI, prioridad, impacto y estado.
- **Asignación y Reasignación de Tickets:** Asignar tickets a técnicos específicos o reasignar casos estancados respetando la especialidad y el límite de capacidad de carga de cada técnico.
- **Supervisión de Carga de Técnicos en Tiempo Real:** Monitorear en tiempo real la cantidad de tickets activos por técnico versus su capacidad máxima autorizada (límite WIP).
- **Mantenimiento Operativo de Especialistas y Departamentos de TI:** Configurar los niveles técnicos (N1, N2, N3), especialidades resolutoras y límites WIP desde `/admin/tecnicos`, así como los tiempos de OLA departamentales en `/admin/departamentos`.
- **Análisis de Métricas y Rendimiento:** Evaluar paneles analíticos de cumplimiento porcentual de SLA, tiempo medio de respuesta (MTTA), tiempo medio de resolución (MTTR) e índice de satisfacción del usuario (CSAT).

#### Restricciones de Seguridad (Qué NO PUEDE hacer)
- No puede gestionar usuarios a nivel de credenciales ni perfiles de acceso al sistema (labor del Administrador).
- No puede alterar las opciones del menú dinámico del sistema.
- No puede aprobar requerimientos presupuestales que corresponden a los gerentes de las áreas solicitantes.
- No puede alterar los registros inmutables de auditoría ni logs de acceso.

#### Rutas y Opciones de Menú Habilitadas
| Opción de Menú | Ruta URL | Nivel | Descripción Funcional |
| :--- | :--- | :---: | :--- |
| Módulo Raíz | `/tickets` | 1 | Contenedor principal de soporte |
| Gestión de tickets | `/tickets/gestion` | 2 | Subcontenedor de gestión |
| Asignación de tickets | `/tickets/gestion/asignar` | 3 | Balanceo y asignación manual a especialistas |
| Supervisión de técnicos | `/tickets/gestion/tecnicos` | 3 | Tablero de control de carga WIP y disponibilidad |
| Todos los tickets | `/tickets/gestion/todos` | 3 | Auditoría visual de la totalidad de casos de la empresa |
| Tickets resueltos | `/tickets/gestion/resueltos` | 3 | Historial de soluciones para control de calidad técnica |
| Reportes | `/tickets/reportes` | 2 | Dashboard de métricas operacionales de TI |
| Administración | `/admin` | 1 | Módulo de configuraciones operativas |
| Departamentos de TI | `/admin/departamentos` | 2 | Gestión de unidades de TI, supervisores y metas OLA |
| Especialistas técnicos | `/admin/tecnicos` | 2 | Asignación de niveles N1-N3, capacidades WIP y áreas |

---

### 3.4. Gestor de Área (`id_perfil: 5`)

#### Definición y Propósito Organizacional
Es el jefe de departamento, gerente de área de negocio (Finanzas, Recursos Humanos, Operaciones, Logística) o titular de centro de costos. Es el responsable de validar la pertinencia de negocio de las solicitudes generadas por sus colaboradores antes de que comprometan recursos técnicos o económicos de la empresa.

#### Atribuciones Operativas (Qué PUEDE hacer)
- **Compuerta de Aprobaciones Departamentales:** Revisar en su bandeja exclusiva (`/tickets/gestion/aprobaciones`) todas las peticiones de servicio tramitadas por colaboradores de su departamento que requieran autorización formal (por ejemplo: asignación de laptops de alto costo, accesos con privilegios elevados a ERPs, licencias especializadas de pago).
- **Decisión Formal de Negocio:** Aprobar o rechazar la solicitud registrando un motivo obligatorio de justificación. La aprobación desbloquea automáticamente el ticket para su atención técnica; el rechazo cancela el ticket y notifica al solicitante de forma inmediata.
- **Seguimiento Departamental:** Monitorear en `/tickets/gestion/departamento` el estado de todos los tickets abiertos por el personal bajo su cargo, verificando que los servicios contratados a TI se cumplan en tiempo y forma.
- **Autoservicio Personal:** Navegar el catálogo y crear requerimientos propios para su gestión diaria.
- **Reportes de Consumo Departamental:** Analizar en `/tickets/reportes` el volumen de requerimientos e incidentes generados por su departamento.

#### Restricciones de Seguridad (Qué NO PUEDE hacer)
- No puede aprobar tickets de departamentos ajenos al suyo.
- No puede modificar parámetros técnicos, asignar técnicos ni cambiar estados de resolución técnica.
- No puede ver notas internas de infraestructura de TI ni logs de seguridad perimetral.
- No puede acceder a configuraciones de administración del sistema ni mantenimiento de usuarios.

#### Rutas y Opciones de Menú Habilitadas
| Opción de Menú | Ruta URL | Nivel | Descripción Funcional |
| :--- | :--- | :---: | :--- |
| Módulo Raíz | `/tickets` | 1 | Contenedor principal |
| Gestión de tickets | `/tickets/gestion` | 2 | Subcontenedor de gestión |
| Mis aprobaciones | `/tickets/gestion/aprobaciones` | 3 | Bandeja de control y autorización de peticiones pendientes |
| Tickets de mi área | `/tickets/gestion/departamento` | 3 | Visibilidad integral de tickets del equipo departamental |
| Catálogo de servicios | `/tickets/catalogo` | 3 | Portal corporativo para solicitar servicios propios |
| Crear ticket | `/tickets/gestion/crear` | 3 | Registro de requerimientos personales |
| Mis tickets | `/tickets/gestion/mios` | 3 | Seguimiento a solicitudes propias del gestor |
| Reportes | `/tickets/reportes` | 2 | Métricas de consumo de servicios de su área |

---

### 3.5. Auditor (`id_perfil: 6`)

#### Definición y Propósito Organizacional
Es el oficial de cumplimiento normativo, auditor interno/externo o analista de aseguramiento de calidad (QA). Su rol responde a los estándares **ISO/IEC 20000**, **ISO 27001** y **SOX**. Su propósito es fiscalizar la trazabilidad total del servicio, validar que los tickets no hayan sido manipulados de forma irregular, comprobar la justificación de pausas de SLA y verificar los accesos al sistema.

#### Atribuciones Operativas (Qué PUEDE hacer)
- **Consulta Integral de Auditoría de Tickets:** Inspeccionar en `/tickets/gestion/auditoria` la trazabilidad cronológica de cada ticket: quién lo creó, quién lo autorizó, cuándo se detuvo el SLA, qué motivos de espera se registraron y qué solución técnica cerró el caso.
- **Inspección de Logs de Seguridad:** Acceder a `/admin/seguridad-logs` para revisar el registro inmutable de autenticaciones, intentos fallidos, bloqueos de usuarios, direcciones IP de origen y marcas de tiempo UTC.
- **Fiscalización de Catálogo de Servicios y SLAs:** Consultar en `/admin/servicios` las condiciones contractuales pactadas de cada servicio (SLA respuesta, SLA solución, obligatoriedad de aprobación) en modo estricto de lectura.
- **Análisis Estadístico de Cumplimiento:** Inspeccionar en `/tickets/reportes` las desviaciones de SLA, volumen de reaperturas no justificadas e indicadores históricos de calidad.

#### Restricciones de Seguridad (Qué NO PUEDE hacer)
- **Acceso Estricto de Solo Lectura (Read-Only):** No tiene botones de creación, edición, eliminación o modificación de datos en ninguna pantalla.
- No puede transicionar estados de tickets, ni registrar notas ni aprobar solicitudes.
- No puede modificar configuraciones del sistema, usuarios ni opciones de menú.
- Los logs de seguridad no pueden ser borrados ni purgados por ningún usuario, incluido el auditor.

#### Rutas y Opciones de Menú Habilitadas
| Opción de Menú | Ruta URL | Nivel | Descripción Funcional |
| :--- | :--- | :---: | :--- |
| Módulo Raíz | `/tickets` | 1 | Contenedor principal |
| Gestión de tickets | `/tickets/gestion` | 2 | Subcontenedor de gestión |
| Auditoría de tickets | `/tickets/gestion/auditoria` | 3 | Módulo de fiscalización de trazas, tiempos y eventos |
| Reportes | `/tickets/reportes` | 2 | Métricas históricas e informes de cumplimiento SLA |
| Administración | `/admin` | 1 | Módulo de administración |
| Log de seguridad | `/admin/seguridad-logs` | 2 | Visor de eventos de inicio de sesión, bloqueos e IPs |
| Catálogo de servicios | `/admin/servicios` | 2 | Consulta de especificaciones de servicios corporativos |

---

### 3.6. Administrador (`id_perfil: 1`)

#### Definición y Propósito Organizacional
Es el custodio global de la plataforma tecnológica y el oficial de gobierno de TI. Su responsabilidad es garantizar la disponibilidad de la aplicación, gestionar el ciclo de vida de los usuarios, gobernar el Catálogo Oficial de Servicios, definir la estructura de perfiles y menús, y administrar la infraestructura lógica de los departamentos de soporte.

#### Atribuciones Operativas (Qué PUEDE hacer)
- **Mantenimiento Integral de Usuarios:** Crear nuevos usuarios, editar datos corporativos, resetear contraseñas bajo políticas seguras, activar o desactivar usuarios (baja lógica preservando integridad referencial en `estado_registro`) y asociar los perfiles correspondientes.
- **Gestión de la Matriz de Roles y Perfiles:** Administrar los perfiles del sistema (`/admin/perfiles`) y supervisar qué opciones de menú tiene asignadas cada perfil.
- **Gobierno del Menú Dinámico:** Configurar la jerarquía de 3 niveles del menú (`/admin/menu`), asociando rutas URL, iconos y descripciones a perfiles específicos.
- **Administración del Catálogo de Servicios Corporativos:** Crear y actualizar servicios en `/admin/servicios`, definir códigos de servicio (ej. `SRV-HW-01`), categorización (Incidentes, Problemas, Peticiones), tiempos de SLA de respuesta y resolución, flujos de workflow y compuertas de aprobación.
- **Gestión de Departamentos de TI y OLAs:** Configurar áreas resolutoras en `/admin/departamentos`, asignar supervisores responsables y fijar tiempos de Acuerdos de Nivel Operativo (OLA horas estándar y OLA horas críticas).
- **Gestión de Técnicos y Especialidades:** Configurar en `/admin/tecnicos` la adscripción de técnicos a departamentos, nivel técnico (N1, N2, N3) y límites de capacidad WIP.
- **Inspección de Seguridad y Auditoría Operativa:** Monitorear los logs de acceso en `/admin/seguridad-logs` y supervisar la totalidad de tickets registrados en `/tickets/gestion/todos`.

#### Restricciones de Seguridad (Qué NO PUEDE hacer)
- Aunque tiene control administrativo, las reglas de negocio ITIL restringen que el Administrador apruebe requerimientos presupuestales de áreas de negocio sin tener la asignación formal de jefatura de ese departamento.
- Por estricta Segregación de Funciones (SoD - ISO 27001 / ITIL 4), el Administrador no origina solicitudes de cambio operativas (`/cambios/gestion/crear`) ni actúa como autoridad votante en el comité (`/cambios/gestion/cab`). Su función en Cambios se circunscribe a la consulta de ventanas de corte para mantenimiento de infraestructura (`/cambios/gestion/calendario`) y la auditoría histórica consolidada (`/cambios/gestion/todos`).
- No puede alterar cronómetros históricos de tickets resueltos para falsear métricas de SLA (los cálculos se basan en marcas de tiempo inmutables en base de datos).
- No puede eliminar físicamente registros con histórico de tickets debido a restricciones de integridad referencial foráneas en PostgreSQL.

#### Rutas y Opciones de Menú Habilitadas
| Opción de Menú | Ruta URL | Nivel | Descripción Funcional |
| :--- | :--- | :---: | :--- |
| Módulo Raíz | `/tickets` | 1 | Contenedor principal de soporte |
| Gestión de tickets | `/tickets/gestion` | 2 | Subcontenedor de gestión |
| Todos los tickets | `/tickets/gestion/todos` | 3 | Vista completa de todos los tickets del sistema |
| Reportes | `/tickets/reportes` | 2 | Tableros ejecutivos e indicadores de rendimiento |
| Administración | `/admin` | 1 | Panel central de administración |
| Usuarios | `/admin/usuarios` | 2 | ABM de usuarios, claves y asignación de perfiles |
| Perfiles | `/admin/perfiles` | 2 | Gestión de roles y matriz de permisos |
| Opciones de menú | `/admin/menu` | 2 | Estructuración del menú dinámico de 3 niveles |
| Log de seguridad | `/admin/seguridad-logs` | 2 | Auditoría forense de accesos y bloqueos de seguridad |
| Catálogo de servicios | `/admin/servicios` | 2 | Mantenimiento de servicios, tiempos SLA y compuertas |
| Departamentos de TI | `/admin/departamentos` | 2 | Parametrización de áreas de TI y acuerdos OLA |
| Especialistas técnicos | `/admin/tecnicos` | 2 | Configuración de especialistas, niveles N1-N3 y WIP |
| Gestión de cambios | `/cambios` | 1 | Contenedor de Change Enablement |
| Solicitudes de cambio | `/cambios/gestion` | 2 | Subcontenedor de cambios |
| Calendario de ventanas | `/cambios/gestion/calendario` | 3 | Cronograma de ventanas de mantenimiento para TI |
| Historial de cambios | `/cambios/gestion/todos` | 3 | Registro consolidado y auditoría de todos los RFCs |
| Activos y CMDB | `/activos` | 1 | Contenedor de Configuration Management |
| Inventario de activos | `/activos/inventario` | 2 | Catálogo patrimonial de hardware |
| Mapa CMDB | `/activos/cmdb` | 2 | Elementos de Configuración CI y dependencias |
| Licencias de software | `/activos/licencias` | 2 | Auditoría de licencias y garantías |

---

### 3.7. Aprobador (CAB) (`id_perfil: 7`)

#### Definición y Propósito Organizacional
Es la Autoridad de Cambio (Change Authority) o miembro del Comité Asesor de Cambios (Change Advisory Board - CAB). Su misión en ITIL v4 es evaluar colegiadamente el impacto técnico, financiero y operativo de las solicitudes de cambio (RFCs) normales o de emergencia, autorizando o rechazando su pase a producción.

#### Atribuciones Operativas
- Evaluar solicitudes de cambio mayores y normales en la bandeja CAB (`/cambios/gestion/cab`).
- Analizar planes de implementación, planes de contingencia (rollback) y planes de pruebas.
- Consultar el calendario de ventanas de cambio (`/cambios/gestion/calendario`) para evitar colisiones.
- Consultar el historial integral de cambios (`/cambios/gestion/todos`).

#### Restricciones de Seguridad (Regla de Autoexclusión SoD)
- El Aprobador no puede autorizar una solicitud de cambio en la que figure como solicitante o técnico ejecutor asignado.
- No puede modificar parámetros del sistema ni resolver tickets de soporte.

#### Rutas Habilitadas
`/cambios`, `/cambios/gestion`, `/cambios/gestion/cab`, `/cambios/gestion/calendario`, `/cambios/gestion/todos`.

---

### 3.8. Gestor de Cambios (`id_perfil: 8`)

#### Definición y Propósito Organizacional
Es el Change Manager. Su responsabilidad es coordinar el ciclo de vida completo de las solicitudes de cambio, programar las ventanas de mantenimiento en el calendario corporativo, detectar periodos de congelamiento (Change Freeze) y supervisar la revisión post-implementación (PIR).

#### Atribuciones Operativas
- Registrar y coordinar solicitudes RFC (`/cambios/gestion/crear`).
- Programar y mantener el calendario de ventanas de cambio (`/cambios/gestion/calendario`).
- Monitorear el progreso y el resultado post-implementación de todas las RFCs (`/cambios/gestion/todos`).

#### Restricciones de Seguridad
- No puede sustituir a la autoridad CAB para auto-aprobar cambios normales o de alto impacto.

#### Rutas Habilitadas
`/cambios`, `/cambios/gestion`, `/cambios/gestion/crear`, `/cambios/gestion/calendario`, `/cambios/gestion/todos`.

---

### 3.9. Gestor de Activos y Configuración (`id_perfil: 9`)

#### Definición y Propósito Organizacional
Es el IT Asset & Configuration Manager. Su función bajo ITIL v4 e ISO/IEC 20000 es mantener la integridad de la Base de Datos de Gestión de Configuración (CMDB), registrar los activos tecnológicos desde su adquisición hasta su baja, y supervisar el cumplimiento de licencias de software.

#### Atribuciones Operativas
- Gestionar el inventario patrimonial de hardware y equipos (`/activos/inventario`).
- Mapear y mantener los Elementos de Configuración (CI) y sus relaciones lógicas (`/activos/cmdb`).
- Supervisar el licenciamiento de software y fechas de garantía (`/activos/licencias`).

#### Restricciones de Seguridad
- No puede autorizar cambios en producción ni aprobar adquisiciones financieras de forma unilateral.

#### Rutas Habilitadas
`/activos`, `/activos/inventario`, `/activos/cmdb`, `/activos/licencias`.

---

## 4. Matriz Comparativa General de los 9 Perfiles vs Capacidades

| Capacidad Funcional / Módulo | Solicitante (3) | Técnico (2) | Supervisor (4) | Gestor Área (5) | Auditor (6) | Admin (1) | Aprobador CAB (7) | Gestor Cambios (8) | Gestor Activos (9) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Explorar catálogo de servicios** | Sí | Sí | Sí | Sí | Solo lectura | Sí | No | No | No |
| **Crear tickets / solicitudes** | Sí | No | No | Sí | No | No | No | No | No |
| **Resolver tickets asignados** | No | Sí | Sí | No | No | No | No | No | No |
| **Tomar tickets de bandeja (pull)** | No | Sí | No | No | No | No | No | No | No |
| **Reasignar tickets / balancear WIP**| No | No | Sí | No | No | No | No | No | No |
| **Aprobar Solicitudes de Servicio** | No | No | No | Sí | No | No | No | No | No |
| **Crear RFC (Solicitud de Cambio)** | No | Sí | No | No | No | No | No | Sí | No |
| **Aprobar / rechazar Cambios (CAB)** | No | No | No | No | No | No | Sí | No | No |
| **Programar calendario de cambios** | No | No | No | No | No | Sí | No | Sí | No |
| **Mantener inventario de activos** | No | No | No | No | No | Sí | No | No | Sí |
| **Mapear relaciones CMDB** | No | No | No | No | No | Sí | No | No | Sí |
| **Auditar licencias y garantías** | No | No | No | No | Sí | Sí | No | No | Sí |
| **Consultar logs de auditoría** | No | No | Sí | No | Sí | Sí | No | No | No |
| **Gestionar usuarios y perfiles** | No | No | No | No | No | Sí | No | No | No |

---

## 5. Matriz de Rutas de Navegación por Perfil

| Ruta URL | Solicitante (3) | Técnico (2) | Supervisor (4) | Gestor Área (5) | Auditor (6) | Admin (1) | Aprobador CAB (7) | Gestor Cambios (8) | Gestor Activos (9) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `/tickets` | Sí | Sí | Sí | Sí | Sí | Sí | No | No | No |
| `/tickets/catalogo` | Sí | No | No | Sí | No | No | No | No | No |
| `/tickets/gestion` | Sí | Sí | Sí | Sí | Sí | Sí | No | No | No |
| `/tickets/gestion/crear` | Sí | No | No | Sí | No | No | No | No | No |
| `/tickets/gestion/mios` | Sí | No | No | Sí | No | No | No | No | No |
| `/tickets/gestion/ayuda` | Sí | No | No | No | No | No | No | No | No |
| `/tickets/gestion/asignados` | No | Sí | No | No | No | No | No | No | No |
| `/tickets/gestion/bandeja` | No | Sí | No | No | No | No | No | No | No |
| `/tickets/gestion/resueltos` | No | Sí | Sí | No | No | No | No | No | No |
| `/tickets/gestion/aprobaciones` | No | No | No | Sí | No | No | No | No | No |
| `/tickets/gestion/departamento` | No | No | No | Sí | No | No | No | No | No |
| `/tickets/gestion/asignar` | No | No | Sí | No | No | No | No | No | No |
| `/tickets/gestion/tecnicos` | No | No | Sí | No | No | No | No | No | No |
| `/tickets/gestion/todos` | No | No | Sí | No | No | Sí | No | No | No |
| `/tickets/gestion/auditoria` | No | No | No | No | Sí | No | No | No | No |
| `/tickets/reportes` | No | No | Sí | Sí | Sí | Sí | No | No | No |
| `/admin` | No | No | Sí | No | Sí | Sí | No | No | No |
| `/admin/usuarios` | No | No | No | No | No | Sí | No | No | No |
| `/admin/perfiles` | No | No | No | No | No | Sí | No | No | No |
| `/admin/menu` | No | No | No | No | No | Sí | No | No | No |
| `/admin/seguridad-logs` | No | No | No | No | Sí | Sí | No | No | No |
| `/admin/servicios` | No | No | No | No | Sí (Lectura) | Sí | No | No | No |
| `/admin/departamentos` | No | No | Sí | No | No | Sí | No | No | No |
| `/admin/tecnicos` | No | No | Sí | No | No | Sí | No | No | No |
| `/cambios` | No | Sí | No | No | Sí | Sí | Sí | Sí | No |
| `/cambios/gestion` | No | Sí | No | No | Sí | Sí | Sí | Sí | No |
| `/cambios/gestion/crear` | No | Sí | No | No | No | No | No | Sí | No |
| `/cambios/gestion/cab` | No | No | No | No | No | No | Sí | No | No |
| `/cambios/gestion/calendario` | No | No | No | No | No | Sí | Sí | Sí | No |
| `/cambios/gestion/todos` | No | Sí | No | No | Sí | Sí | Sí | Sí | No |
| `/activos` | No | No | No | No | Sí | Sí | No | No | Sí |
| `/activos/inventario` | No | No | No | No | Sí | Sí | No | No | Sí |
| `/activos/cmdb` | No | No | No | No | No | Sí | No | No | Sí |
| `/activos/licencias` | No | No | No | No | Sí | Sí | No | No | Sí |

---

## 6. Cumplimiento Normativo y Auditoría

La arquitectura descrita asegura el cumplimiento de auditorías nacionales e internacionales en los siguientes puntos:

1. **ITIL v4 - Sistema de Valor del Servicio (SVS):** Delimita con precisión los roles en los flujos de valor: Solicitantes (demanda), Gestores de Área (gobernanza), Técnicos y Supervisores (entrega y soporte), Administradores (diseño y transición) y Auditores (mejora continua).
2. **ISO 27001 - Control A.9.2 (Gestión de acceso de usuarios) y A.9.4 (Control de acceso a sistemas y aplicaciones):** Prohíbe el uso de credenciales genéricas o privilegios desmedidos, exigiendo asignación nominal y perfiles circunscritos a funciones operativas reales.
3. **Inmutabilidad de Trazas:** Las operaciones sensibles (cambios de estado, pausas de SLA, firmas de aprobación) se registran con marcas de tiempo automáticas generadas por PostgreSQL (`CURRENT_TIMESTAMP`), imposibilitando la alteración manual por parte de los operadores.
