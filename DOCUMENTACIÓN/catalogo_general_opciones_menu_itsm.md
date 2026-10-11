# Catálogo general de opciones de menú ITSM y decisiones de alcance

**Versión:** 1 de octubre de 2026  
**Estado:** pasos 1–4 completados y aplicados; paso 5 implementado en código, pendiente de validación visual final con una sesión activa por perfil.  
**Alcance:** inventario del menú/rutas, decisiones sobre capacidades ITSM, matriz por los nueve perfiles y diferencias de vista/acción.

## Resumen de decisiones

El menú queda organizado por el trabajo que realiza cada equipo. Incidentes, solicitudes, problemas y cambios son registros distintos que pueden relacionarse entre sí; el catálogo del solicitante solo presenta incidentes y ofertas publicadas de solicitudes. Eventos, resiliencia del servicio y proveedores tienen ahora opciones visibles y páginas de trabajo propias. No se presentan como integraciones automáticas que el código todavía no tiene.

La administración configura catálogo, SLA y plantillas RFC. El Gestor de Cambios administra cada RFC y coordina su ciclo; el CAB emite dictámenes; el Supervisor gestiona colas e incidentes/eventos. El Administrador de sistema no adquiere autoridad operativa ni de aprobación por el solo hecho de administrar el software.

## Paso 1. Inventario completo

Se compararon `db/seed.sql`, `db/migrations/20261001_itsm_operacion_servicios.sql`, `opciones_menu`, `opciones_menu_perfiles`, el árbol renderizado por `Menu.tsx` y todas las páginas de `src/app`.

La base activa queda con **67 opciones de menú**, **51 destinos distintos**, **9 perfiles** y **170 asignaciones activas**. Los IDs **137 y 138** están inactivos porque apuntaban a vistas genéricas antiguas de problemas/cambios. La aplicación contiene **56 páginas**; cada destino activo del menú resuelve a una página y las cinco páginas sin opción lateral son internas/globales: `/`, `/login`, `/dashboard`, `/mi-cuenta` y `/tickets/gestion`.

### Árbol general final

#### Mesa de Servicio (100)

- Portal de Autoservicio (110)
  - Catálogo de servicios (111)
  - Registrar solicitud (112)
  - Mis solicitudes (113)
  - Guías de autoayuda (114)
- Operación y Soporte (120)
  - Mis tickets asignados (121)
  - Bandeja de pendientes (122)
  - Tickets de mi área técnica (123)
  - Historial de resueltos (124)
  - Gestión de incidentes (135)
  - Gestión de solicitudes (136)
- Supervisión y Despacho (130)
  - Centro de asignación (131)
  - Monitoreo de técnicos (132)
  - Todos los tickets (133)
  - Auditoría forense (134)
- Gobernanza de Área (140)
  - Mis aprobaciones (141)
  - Tickets de mi departamento (142)

#### Gestión de Cambios (200)

- Operación y Solicitudes RFC (210)
  - Registrar solicitud RFC (211)
  - Calendario de ventanas (212)
  - Historial consolidado (213)
- Comité Asesor CAB (220)
  - Dictamen colegiado CAB (221)

#### Activos de TI y CMDB (300)

- Inventario de activos (HAM) (310)
- Mapa de topología CMDB (320)
- Licencias de software (SAM) (330)
- Modelado de clases CI (340)

#### Configuración (500)

- Identidades y accesos (510)
  - Gestión de usuarios (511)
  - Perfiles y permisos (512)
  - Estructura del menú (513)
- Catálogo de servicios y SLAs (520)
  - Servicios de incidentes (521)
  - Servicios de solicitudes (522)
  - Categorías y ofertas publicadas (523)
  - Acceso por perfil o criterio de audiencia (524)
  - Objetivos SLA (525)
- Configuración de procesos (5300)
  - Incidentes (5310)
    - Formularios y campos (5311)
    - Vistas previas por usuario/perfil (5312)
    - Flujo de estados y acciones (5313)
    - Reglas de notificación (5314)
  - Solicitudes de servicio (5320)
    - Formularios y campos (5321)
    - Vistas previas por usuario/perfil (5322)
    - Flujo de atención y aprobaciones (5323)
    - Reglas de notificación (5324)
  - Gestión de cambios (5330)
    - Formulario RFC (5331)
    - Tipos de cambio y requisitos (5332)
    - Flujo de evaluación, autorización y revisión posterior (5333)
    - Notificaciones y calendario de cambios (5334)
  - Gestión de problemas (5340)
    - Formularios (5341)
    - Flujo de investigación y seguimiento (5342)
    - Relación con incidentes, errores conocidos y conocimiento (5343)
- Organización y soporte (5400)
  - Departamentos empresariales (5401)
  - Departamentos y grupos resolutores de TI (5402)
  - Técnicos y niveles de soporte (5403)
  - Supervisores (5404)
- Activos y configuración (5500)
  - Tipos, modelos y atributos de activos (5501)
  - Ciclos de vida y reglas de transición (5502)
  - Licencias y contratos (5503)
  - Tipos de elementos de configuración y relaciones de CMDB (5504)
- Comunicaciones y notificaciones (5600)
  - Plantillas de correo y otros canales (5601)
  - Configuración de conexiones de correo y canales externos (5602)
- Gobierno del conocimiento (5700)
  - Categorías, responsables y reglas de publicación/revisión (5701)
- Auditoría, seguridad y retención (5800)
  - Auditoría de cambios (5801)
  - Registros de seguridad y autenticación (5802)
  - Retención y mantenimiento de datos (5803)

#### Reportes y Analítica (400)

- Indicadores operativos y SLA (410)
- Tableros (420)

#### Operación y gobierno de servicios (600)

- Eventos y alertas (610)
- Disponibilidad, capacidad y continuidad (620)

#### Gestión de problemas (700)

- Registro de problemas (710)
- Errores conocidos (KEDB) (720)

#### Proveedores y contratos TI (800)

- Registro, contratos, vencimientos y evaluación de proveedores (800)

Los grupos con hijas se muestran como acordeones; el enlace lo abre una hoja. Por esa razón, un padre y una hija pueden compartir URL sin que el nombre del padre navegue por error.

## Paso 2. Clasificación de las páginas

- **Opciones del menú:** todas las páginas funcionales listadas en el árbol anterior.
- **Acceso global:** `/mi-cuenta` (menú de usuario/encabezado).
- **Enrutamiento inicial:** `/` y `/dashboard` redirigen según sesión/perfil; `/login` autentica.
- **Contenedor interno:** `/tickets/gestion` organiza trabajo y accesos, sin ser una bandeja adicional.
- **Grupos de módulo:** `/tickets`, `/cambios`, `/activos`, `/admin`, `/operacion` son destinos de nodos padre acordeón; no son enlaces hoja independientes.
- **Páginas obsoletas retiradas:** `/tickets/gestion/problemas` y `/tickets/gestion/cambios`. Los problemas y cambios ya no se simulan filtrando un tipo de ticket genérico.

## Paso 3. Decisión sobre capacidades ITSM

| Capacidad | Ubicación y decisión | Qué está disponible ahora y límite explícito |
|---|---|---|
| Monitoreo y gestión de eventos | **Operación y gobierno de servicios → Eventos y alertas**, enlazado con CI e incidentes | Registro manual de evento, severidad/estado, reconocimiento y asociación a CI/incidente. No hay conector de telemetría, deduplicación ni correlación automática; para esta entrega se ofrece un flujo manual utilizable y la opción ya figura en menú. |
| Incidente mayor | Flujo dentro de **Incidentes**, con prioridad/escalamiento/comunicación | No se crea otro tipo de registro ni menú duplicado. La coordinación mayor debe apoyarse en el mismo expediente de incidente; validar visualmente marca y comunicaciones antes de presentarlo como flujo completo. |
| SLA | Configuración en **Administración → Catálogo de servicios y SLAs**; medición en **Reportes y Analítica** | El lugar de configuración/medición queda definido. Calendarios, pausas, exclusiones, objetivos por servicio y cálculo efectivo deben validarse antes de afirmar cumplimiento completo. |
| Mejora continua | Dentro de **Reportes y Analítica**, asociada a indicadores y seguimiento | No merece un módulo de primer nivel separado. Existe visualización de indicadores; un registro completo de oportunidad, responsable, acción, resultado y revisión todavía no está implementado como flujo independiente. |
| Disponibilidad, capacidad y continuidad | **Operación y gobierno de servicios → Disponibilidad, capacidad y continuidad** | Registro por servicio de objetivo/medición de disponibilidad, RTO/RPO, umbral/consumo de capacidad, plan y pruebas de continuidad. La captura es manual; no calcula disponibilidad desde monitoreo ni ejecuta pruebas automáticamente. El Supervisor mantiene el registro; la lectura queda en Auditor, CAB, Gestor de Cambios y Gestor de Activos/Configuración por su necesidad de control o evaluación de impacto. |
| Release y despliegue | Parte de **Gestión de Cambios**, calendario/ventanas y resultado del cambio | No se agrega menú release separado. La calendarización de RFC está disponible; pipeline de despliegue, versionado y automatización requieren integración adicional. |
| Proveedores y contratos | **Proveedores y contratos TI**, accesible desde el rol de Activos y Configuración, Auditor, CAB y Gestor de Cambios con vista de consulta | Registro básico de proveedor, contrato, vencimiento, servicio soportado, compromiso SLA y evaluación. El Gestor de Activos y Configuración mantiene datos. No es procurement, gestión legal, facturación ni portal de proveedores. |
| Relación y comunicación del servicio | Comunicación desde Incidentes/Cambios; canales y plantillas en Administración | El menú agrupa ajustes globales de plantillas/canales. La comunicación operativa debe permanecer en el expediente que la origina. |
| Tareas de fulfillment | Dentro de **Solicitudes de servicio** | Se conserva la solicitud como expediente propio. La separación en tareas asignables por etapas/equipos debe ser una ampliación interna del módulo si el flujo lo requiere; no se crea una opción de menú adicional. |

Se eligen módulos propios cuando el equipo requiere una cola, permisos y datos de trabajo propios; las funciones transversales quedan dentro del proceso relacionado o de administración. ITIL 4 describe prácticas que la organización adapta; ISO/IEC 20000-1 establece requisitos para un sistema de gestión de servicios, no un menú obligatorio. La organización propuesta es una decisión de producto alineada con esos marcos, no una certificación. ([PeopleCert — ITIL 4](https://www.peoplecert.org/-/media/peoplecert/images/landing-pages/pink23/itil4-explained.pdf), [ISO/IEC 20000-1](https://www.iso.org/cms/%20render/live/en/sites/isoorg/contents/data/standard/07/06/70636.html)).

## Paso 4. Asignación por perfil

La asignación final está en la base y se detalla en [Matriz de menú, vistas y acciones por perfil](matriz_menu_y_vistas_por_rol_2026-10-01.md). La decisión general es:

1. **Administrador:** configuración de plataforma, identidades, catálogo/SLA, RFC, formularios/vistas, portal, comunicaciones, auditoría técnica e informes. Sin operación de tickets por defecto.
2. **Técnico:** trabajo asignado/de equipo, incidentes, solicitudes operativas, problemas/KEDB, registro RFC cuando corresponda, CI/eventos y resiliencia en alcance operativo. Sin despacho/reasignación de compañeros.
3. **Solicitante:** catálogo publicado, crear solicitud, mis solicitudes y guías. No ve problemas, cambios, eventos, proveedores ni herramientas internas.
4. **Supervisor:** colas/despacho, asignación y supervisión del soporte, eventos, problemas, resiliencia, estructura/capacidad de soporte y métricas de su ámbito.
5. **Gestor de Área:** catálogo, solicitudes propias/departamento, aprobaciones e indicadores. No consulta planes técnicos de continuidad ni asigna técnicos; una vista ejecutiva futura requiere relación explícita entre servicios y áreas para limitar sus datos.
6. **Auditor:** consulta de trazas, tickets, cambios, activos, problemas, eventos, resiliencia y proveedores. Solo lectura, exportación controlada y sin modificar registros.
7. **Aprobador CAB:** RFC y dictámenes; lectura contextual de CI, servicio, eventos y riesgos pertinentes. No edita RFC ni aprueba solicitudes ordinarias.
8. **Gestor de Cambios:** registra y coordina RFC, calendario, CAB y revisiones; consulta CI, incidentes/eventos, problemas conocidos, resiliencia y proveedores para evaluar impacto. No vota su propio cambio.
9. **Gestor de Activos y Configuración:** inventario, licencias, CMDB/modelo CI, cambios relacionados, problemas/KEDB en lectura, resiliencia/eventos de contexto y mantenimiento del registro de proveedores. No atiende colas de soporte.

La persona que tenga varios perfiles debe usar el perfil activo correspondiente. Ocultar una opción del menú no sustituye la comprobación de permisos y ámbito en página y API.

## Paso 5. Vistas y acciones por perfil

- **Solicitante:** solo registros propios; descripción y categoría amigables, estado, prioridad visible, mensajes públicos, adjuntos permitidos y acciones de respuesta/cancelación que permita el estado. Sin nota interna, despacho o botones de asignación.
- **Técnico:** registros asignados o de su equipo; diagnóstico, CI relacionado, actividad interna, solución y transiciones permitidas. El botón **Asignar/Reasignar técnico** se oculta y la API lo rechaza para Técnico; puede autoasignarse solo donde la regla lo permita.
- **Supervisor:** colas de su ámbito, datos de asignación/carga, notas internas, reasignación/escalamiento y acciones de coordinación. La API limita asignaciones y campos a sus permisos.
- **Gestor de Área:** registros de su departamento y solicitudes que debe aprobar; decisión/comentario de aprobación y métricas. No ve notas técnicas privadas ni reasigna técnicos.
- **Auditor:** expediente e historial de solo lectura; sin controles de edición, comentarios ni transiciones. Campos sensibles y adjuntos siguen sujetos a las restricciones de API.
- **Aprobador CAB:** detalle del RFC y evidencia necesaria para votar; acciones de dictamen solo sobre RFC asignadas y con control de conflicto de interés.
- **Gestor de Cambios:** formulario RFC, riesgo, calendario, coordinación y revisión posterior; no dispone de voto CAB sobre su propio RFC.
- **Gestor de Activos y Configuración:** CI, relaciones, inventario, licencias y proveedores; puede mantener esos registros según API, sin acciones de mesa de ayuda.
- **Administrador:** interfaz de configuración; la vista de ticket es de soporte solo si activa expresamente otro perfil autorizado. Administrar roles no equivale a aprobar/ejecutar cambios.

Las rutas y API ya contienen guardas de servidor para los módulos incorporados y acciones de ticket diferencian botones por rol. La lista es la especificación de aceptación para revisar con una sesión visual de cada perfil; esta revisión estática no demuestra por sí sola que la interfaz completa haya sido probada en navegador.

## Resultado de los cinco pasos

1. Inventario de menú y páginas: **completado y sincronizado**.
2. Clasificación de rutas: **completada**; quedan cinco rutas globales/internas justificadas.
3. Menú maestro: **decidido e implementado** en `seed.sql`, migración y base activa.
4. Asignación a nueve perfiles: **implementada**, con 170 relaciones activas.
5. Diferencias de vistas/acciones: **corregidas en los módulos/tickets cubiertos y especificadas aquí**; queda hacer el recorrido visual final con credenciales de los nueve perfiles para detectar cualquier discrepancia residual.

## Fuentes de orientación

- [PeopleCert — explicación de ITIL 4](https://www.peoplecert.org/-/media/peoplecert/images/landing-pages/pink23/itil4-explained.pdf)
- [ServiceNow — IT Service Management](https://www.servicenow.com/products/itsm.html)
- [ServiceNow — Event Management](https://www.servicenow.com/products/event-management.html)
- [ServiceNow — Business Continuity Management](https://www.servicenow.com/products/business-continuity-management.html)
- [ISO — ISO/IEC 20000-1:2018](https://www.iso.org/cms/%20render/live/en/sites/isoorg/contents/data/standard/07/06/70636.html)


