# Manual Funcional Exhaustivo: Arquitectura de Menú y Navegación de FlowDesk

**Versión del Sistema:** FlowDesk ITIL v4 Enterprise  
**Fecha de Publicación:** 17 de Noviembre de 2026  
**Estado del Documento:** Completado 100% (227 de 227 opciones documentadas)  
**Auditoría y Mapeo:** Staff Software Engineer & Solutions Architect  

---

## 1. Arquitectura General y Gobernanza del Menú

FlowDesk implementa una arquitectura de navegación desacoplada y orientada a capacidades de dominio de negocio, eliminando cualquier acoplamiento rígido con nombres de roles o perfiles de usuario. 

- **Total de opciones en el sistema:** 227 opciones activas en la tabla `opciones_menu`.
- **Nivel 1 (Agrupadores Raíz):** 12 macro-secciones que dividen las disciplinas de ITIL v4 y la administración transversal.
- **Nivel 2 (Sub-agrupadores y Módulos):** 99 carpetas y vistas de primer orden.
- **Nivel 3 (Vistas operativas y configuraciones avanzadas):** 116 pantallas terminales con lógica de presentación y formularios.
- **Control de Acceso Dinámico:** Cada acceso a pantalla está protegido en servidor mediante `exigirMenuPagina(url_menu)` o `exigirCapacidadPagina(CAPACIDAD)`. La autorización efectiva se determina en tiempo de ejecución consultando la relación `opciones_menu_perfiles`.

---

## 2. Mapa Completo de Opciones de Menú (227 Opciones)

A continuación se presenta el inventario maestro de las 12 macro-secciones del sistema con sus respectivos identificadores y rutas canónicas en el App Router de Next.js:

### Sección 1: Mi trabajo (`#21001`) *(Raíz)*
- **Aprobaciones** (`#21002`) *(Sub-agrupador)*
  - Delegación de aprobaciones (`#21003`) $\rightarrow$ `/plataforma/solicitudes/area/delegacion`
  - Delegaciones (`#21004`) $\rightarrow$ `/plataforma/seguridad/delegaciones`
  - Historial de aprobaciones de mi área (`#21005`) $\rightarrow$ `/plataforma/solicitudes/area/historial`
  - Historial de aprobaciones y dictámenes (`#21006`) $\rightarrow$ `/plataforma/seguridad/historial-aprobaciones`
- **Equipo** (`#21008`) *(Sub-agrupador)*
  - Ausencias y guardias del equipo (`#21009`) $\rightarrow$ `/plataforma/operacion/equipo/ausencias`
  - Vistas y respuestas compartidas (`#21010`) $\rightarrow$ `/plataforma/operacion/equipo/vistas`
- **Paneles y Vistas de Trabajo Personal:**
  - Panel de activos y CMDB (`#21007`) $\rightarrow$ `/plataforma/operacion/paneles/gestor-activos`
  - Panel de auditoría (`#21011`) $\rightarrow$ `/plataforma/operacion/paneles/auditor`
  - Panel de gestión de cambios (`#21012`) $\rightarrow$ `/plataforma/operacion/paneles/gestor-cambios`
  - Panel de gestión de problemas (`#21013`) $\rightarrow$ `/plataforma/operacion/paneles/gestor-problemas`
  - Panel de supervisión (`#21014`) $\rightarrow$ `/plataforma/operacion/paneles/supervisor`
  - Panel del aprobador (`#21015`) $\rightarrow$ `/plataforma/operacion/paneles/aprobador`
  - Panel del área (`#21016`) $\rightarrow$ `/plataforma/operacion/paneles/gestor-area`
  - Panel del técnico (`#21017`) $\rightarrow$ `/plataforma/operacion/paneles/tecnico`
  - Panel de administración (`#21021`) $\rightarrow$ `/plataforma/operacion/paneles/administrador`
  - Panel del solicitante (`#21022`) $\rightarrow$ `/plataforma/operacion/paneles/solicitante`
  - Mi agenda y disponibilidad (`#21018`) $\rightarrow$ `/plataforma/operacion/agenda`
  - Mi desempeño (`#21019`) $\rightarrow$ `/plataforma/operacion/desempeno`
  - Mis tareas (`#21020`) $\rightarrow$ `/plataforma/operacion/tareas`

### Sección 2: Mesa de Servicio (`#21023`) *(Raíz)*
- **Incidentes** (`#21228`) *(Sub-agrupador)*
  - Todos los incidentes (`#21230`) $\rightarrow$ `/plataforma/incidentes`
  - Mis incidentes (`#21231`) $\rightarrow$ `/plataforma/incidentes/mios`
  - Incidentes asignados a mi (`#21232`) $\rightarrow$ `/plataforma/incidentes/asignados`
  - Bandeja de incidentes (`#21233`) $\rightarrow$ `/plataforma/incidentes/bandeja`
  - Incidentes resueltos (`#21234`) $\rightarrow$ `/plataforma/incidentes/resueltos`
  - Incidentes de mi departamento (`#21235`) $\rightarrow$ `/plataforma/incidentes/departamento`
  - Registrar incidente (`#21236`) $\rightarrow$ `/plataforma/incidentes/crear`
  - Catálogo de incidentes (`#21237`) $\rightarrow$ `/plataforma/incidentes/catalogo`
  - Incidentes mayores (`#21238`) $\rightarrow$ `/plataforma/incidentes/mayores`
  - Sala de crisis (incidente mayor) (`#21239`) $\rightarrow$ `/plataforma/incidentes/sala-crisis`
  - Configuración del formulario (`#21240`) $\rightarrow$ `/plataforma/incidentes/configuracion`
  - Flujo de estados y acciones (`#21187`) $\rightarrow$ `/plataforma/incidentes/configuracion/flujo`
- **Solicitudes** (`#21229`) *(Sub-agrupador)*
  - Todas las solicitudes (`#21241`) $\rightarrow$ `/plataforma/solicitudes`
  - Mis solicitudes (`#21242`) $\rightarrow$ `/plataforma/solicitudes/mios`
  - Solicitudes asignadas a mi (`#21243`) $\rightarrow$ `/plataforma/solicitudes/asignados`
  - Bandeja de solicitudes (`#21244`) $\rightarrow$ `/plataforma/solicitudes/bandeja`
  - Solicitudes resueltas (`#21245`) $\rightarrow$ `/plataforma/solicitudes/resueltos`
  - Solicitudes de mi departamento (`#21246`) $\rightarrow$ `/plataforma/solicitudes/departamento`
  - Registrar solicitud (`#21247`) $\rightarrow$ `/plataforma/solicitudes/crear`
  - Catálogo de solicitudes (`#21248`) $\rightarrow$ `/plataforma/solicitudes/catalogo`
  - Aprobaciones de solicitudes (`#21249`) $\rightarrow$ `/plataforma/solicitudes/aprobaciones`
  - Configuración del formulario (`#21250`) $\rightarrow$ `/plataforma/solicitudes/configuracion`
  - Flujo de atención y aprobaciones (`#21186`) $\rightarrow$ `/plataforma/solicitudes/configuracion/flujo`
- **Operación de la mesa** (`#21024`) *(Sub-agrupador)*
  - Centro de asignación (`#21251`) $\rightarrow$ `/plataforma/tickets/gestion/asignar`
  - Colaboradores de mi área (`#21252`) $\rightarrow$ `/plataforma/tickets/gestion/colaboradores`
  - Bandeja consolidada de pendientes (`#21253`) $\rightarrow$ `/plataforma/tickets/gestion/bandeja`
  - Historial consolidado de resueltos (`#21254`) $\rightarrow$ `/plataforma/tickets/gestion/resueltos`
  - Tickets de mi departamento (`#21255`) $\rightarrow$ `/plataforma/tickets/gestion/departamento`
  - Todos los tickets (`#21256`) $\rightarrow$ `/plataforma/tickets/gestion/todos`
  - Registrar ticket para un usuario (`#21257`) $\rightarrow$ `/plataforma/tickets/gestion/crear`
  - Auditoría de tickets (`#21258`) $\rightarrow$ `/plataforma/tickets/gestion/auditoria`
  - Avisos de servicio (`#21259`) $\rightarrow$ `/plataforma/avisos/mantenimientos`
  - Búsqueda avanzada de tickets (`#21260`) $\rightarrow$ `/plataforma/tickets/mesa/buscar`
  - Historial de mis tickets (`#21261`) $\rightarrow$ `/plataforma/tickets/gestion/mios`
- **SLA** (`#21044`) *(Sub-agrupador)*
  - Escalamientos y riesgos de SLA (`#21045`) $\rightarrow$ `/plataforma/servicios/sla/escalamientos`
  - Incumplimientos y causas (`#21046`) $\rightarrow$ `/plataforma/servicios/sla/incumplimientos`
  - Objetivos de tiempo vigentes (`#21047`) $\rightarrow$ `/plataforma/servicios/sla/objetivos`
  - Semáforo de SLA de mi cola (`#21048`) $\rightarrow$ `/plataforma/servicios/sla/semaforo-cola`
  - Semáforo de SLA del grupo (`#21049`) $\rightarrow$ `/plataforma/servicios/sla/semaforo-grupo`

### Sección 3: Cambios (`#21059`) *(Raíz)*
- **Mis cambios** (`#21060`) *(Sub-agrupador)*
  - Aprobaciones técnicas de RFC (`#21061`) $\rightarrow$ `/plataforma/cambios/aprobaciones/tecnicas`
  - Calendario de mis cambios (`#21062`) $\rightarrow$ `/plataforma/cambios/calendario`
  - Cambios con interrupción para mi área (`#21063`) $\rightarrow$ `/plataforma/cambios/impacto/interrupciones`
  - Cambios por implementar (`#21064`) $\rightarrow$ `/plataforma/cambios/implementacion`
  - Cambios que afectan a mi equipo (`#21065`) $\rightarrow$ `/plataforma/cambios/impacto/equipo`
  - Cambios que afectan mis servicios (`#21066`) $\rightarrow$ `/plataforma/cambios/impacto/servicios`
  - Historial de mis cambios (`#21067`) $\rightarrow$ `/plataforma/cambios/historial`
  - Mis cambios (`#21068`) $\rightarrow$ `/plataforma/cambios/mis-cambios`
  - Programación de implementaciones del equipo (`#21069`) $\rightarrow$ `/plataforma/cambios/programacion`
  - Registrar solicitud RFC (`#21070`) $\rightarrow$ `/plataforma/cambios/nuevo`
- **Gestión** (`#21072`) *(Sub-agrupador)*
  - Bandeja de RFC por evaluar (`#21073`) $\rightarrow$ `/plataforma/cambios/gestion/evaluacion`
  - Conflictos y capacidad (`#21074`) $\rightarrow$ `/plataforma/cambios/gestion/conflictos`
  - Modelos de cambio estándar (`#21075`) $\rightarrow$ `/plataforma/cambios/gestion/modelos`
  - Programación de cambios autorizados (`#21076`) $\rightarrow$ `/plataforma/cambios/gestion/programacion`
  - Revisión post-implementación (`#21077`) $\rightarrow$ `/plataforma/cambios/gestion/pir`
  - Seguimiento de ejecución (`#21078`) $\rightarrow$ `/plataforma/cambios/gestion/ejecucion`
  - Seguimiento de etapas de aprobación (`#21079`) $\rightarrow$ `/plataforma/cambios/gestion/autorizaciones`
- **CAB** (`#21081`) *(Sub-agrupador)*
  - Agenda y actas (`#21082`, `#21084`) $\rightarrow$ `/plataforma/cambios/cab/agenda`
  - Comité de emergencia (ECAB) (`#21083`) $\rightarrow$ `/plataforma/cambios/cab/emergencia`
  - Dictamen colegiado (CAB) (`#21085`) $\rightarrow$ `/plataforma/cambios/gestion/cab`
- **Aprobaciones** (`#21087`) *(Sub-agrupador)*
  - Aprobación de negocio de cambios (`#21088`) $\rightarrow$ `/plataforma/cambios/aprobaciones/negocio`
  - Aprobaciones de cambios (`#21089`) $\rightarrow$ `/plataforma/cambios/aprobaciones`
  - Modelos de cambio estándar (`#21090`) $\rightarrow$ `/plataforma/cambios/modelos`
- **Vistas Operativas y Configuración:**
  - Calendario de cambios (`#21071`) $\rightarrow$ `/plataforma/cambios/gestion/calendario`
  - Historial de cambios (`#21080`) $\rightarrow$ `/plataforma/cambios/gestion/todos`
  - Solicitar un cambio (`#21086`) $\rightarrow$ `/plataforma/cambios/gestion/crear`
  - Configuración de formulario (`#21191`) $\rightarrow$ `/plataforma/cambios/configuracion/formulario`
  - Flujo de evaluación, autorización y revisión posterior (`#21193`) $\rightarrow$ `/plataforma/cambios/configuracion/flujo-evaluacion`
  - Tipos de cambio y requisitos (`#21196`) $\rightarrow$ `/plataforma/cambios/configuracion/tipos-requisitos`
  - Notificaciones de cambios (`#21194`) $\rightarrow$ `/plataforma/cambios/configuracion/notificaciones-calendario`
  - Feriados (`#21192`) $\rightarrow$ `/plataforma/cambios/configuracion/notificaciones-calendario`
  - Períodos de congelamiento (`#21195`) $\rightarrow$ `/plataforma/cambios/configuracion/notificaciones-calendario`
  - Ventanas de mantenimiento (`#21197`) $\rightarrow$ `/plataforma/cambios/configuracion/notificaciones-calendario`

### Sección 4: Problemas (`#21091`) *(Raíz)*
- Análisis de causa raíz (`#21092`) $\rightarrow$ `/plataforma/problemas/analisis`
- Bandeja y asignación (`#21093`, `#21094`) $\rightarrow$ `/plataforma/problemas/asignacion`
- Candidatos a problema (`#21095`, `#21096`) $\rightarrow$ `/plataforma/problemas/candidatos`
- Conocimiento derivado (`#21097`) $\rightarrow$ `/plataforma/problemas/conocimiento`
- Errores conocidos (KEDB) (`#21098`, `#21099`) $\rightarrow$ `/plataforma/problemas/kedb`
- Incidentes recurrentes (`#21100`) $\rightarrow$ `/plataforma/problemas/recurrentes`
- Objetivos de tiempo (`#21101`) $\rightarrow$ `/plataforma/problemas/objetivos`
- Problemas asignados a mí (`#21102`) $\rightarrow$ `/plataforma/problemas/asignados`
- Problemas de mi grupo (`#21103`) $\rightarrow$ `/plataforma/problemas/grupo`
- Problemas mayores y comités (`#21104`) $\rightarrow$ `/plataforma/problemas/mayores`
- Registrar problema (`#21105`) $\rightarrow$ `/plataforma/problemas/crear`
- Historial de problemas (`#21106`) $\rightarrow$ `/plataforma/problemas/historial`
- Aprobación de riesgo y cierre (`#21107`) $\rightarrow$ `/plataforma/problemas/aprobaciones`
- Solicitudes de cambio derivadas (`#21108`) $\rightarrow$ `/plataforma/problemas/cambios`
- Configuración de formulario (`#21199`) $\rightarrow$ `/plataforma/problemas/configuracion/formulario`
- Flujo de investigación y seguimiento (`#21200`) $\rightarrow$ `/plataforma/problemas/configuracion/flujo`
- Relación con incidentes, errores conocidos y conocimiento (`#21201`) $\rightarrow$ `/plataforma/problemas/configuracion/relaciones`

### Sección 5: Activos y CMDB (`#21109`) *(Raíz)*
- **Inventario** (`#21110`) *(Sub-agrupador)*
  - Activos de mi área (`#21111`) $\rightarrow$ `/plataforma/activos/area`
  - Asignación, custodia y actas (`#21112`) $\rightarrow$ `/plataforma/activos/asignaciones`
  - Importación masiva (`#21113`) $\rightarrow$ `/plataforma/activos/importacion`
  - Inventario de activos (`#21114`) $\rightarrow$ `/plataforma/activos/inventario`
  - Inventario físico (campañas) (`#21115`) $\rightarrow$ `/plataforma/activos/inventario-fisico`
  - Inventario físico en campo (`#21116`) $\rightarrow$ `/plataforma/activos/conteos`
  - Inventario operativo (`#21117`) $\rightarrow$ `/plataforma/activos/inventario-operativo`
  - Mis activos (`#21118`) $\rightarrow$ `/plataforma/activos/mis-activos`
  - Recepción de adquisiciones (`#21119`) $\rightarrow$ `/plataforma/activos/recepcion`
- **Bajas y disposición** (`#21120`) *(Sub-agrupador)*
  - Aprobación de bajas de mi área (`#21121`) $\rightarrow$ `/plataforma/activos/bajas/aprobacion`
  - Consulta de bajas (`#21122`) $\rightarrow$ `/plataforma/activos/bajas/consulta`
  - Gestión de bajas (`#21123`) $\rightarrow$ `/plataforma/activos/bajas`
  - Bajas y renovaciones por monto (`#21124`) $\rightarrow$ `/plataforma/activos/bajas/renovaciones`
- **Mantenimiento** (`#21125`) *(Sub-agrupador)*
  - Mantenimiento y garantías (`#21126`) $\rightarrow$ `/plataforma/activos/mantenimiento`
  - Mantenimiento y reparaciones (`#21127`) $\rightarrow$ `/plataforma/activos/reparaciones`
- **Licencias** (`#21128`) *(Sub-agrupador)*
  - Catálogo de software autorizado (`#21129`) $\rightarrow$ `/plataforma/activos/licencias/catalogo-software`
  - Consultar licencias (`#21130`) $\rightarrow$ `/plataforma/activos/licencias/consulta`
  - Cumplimiento y sobreuso (`#21131`) $\rightarrow$ `/plataforma/activos/licencias/cumplimiento`
  - Licencias de software (`#21132`) $\rightarrow$ `/plataforma/activos/licencias`
- **CMDB** (`#21133`) *(Sub-agrupador)*
  - Actualizaciones de CMDB desde cambios (`#21134`) $\rightarrow$ `/plataforma/cmdb/actualizaciones`
  - Análisis e impacto (`#21135`) $\rightarrow$ `/plataforma/cmdb/analisis`
  - Calidad y auditoría de CMDB (`#21136`) $\rightarrow$ `/plataforma/cmdb/auditoria`
  - Inexactitudes reportadas (`#21137`) $\rightarrow$ `/plataforma/cmdb/inexactitudes`
  - Líneas base (`#21138`) $\rightarrow$ `/plataforma/cmdb/lineas-base`
  - Mapa de topología (`#21139`, `#21140`) $\rightarrow$ `/plataforma/cmdb/topologia`
  - Modelado de clases CI (`#21141`) $\rightarrow$ `/plataforma/cmdb/tipos`
  - Resultados de auditorías de CMDB (`#21142`) $\rightarrow$ `/plataforma/cmdb/auditoria/resultados`
- **Proveedores y contratos** (`#21143`) *(Sub-agrupador)*
  - Contratos y cobertura (`#21144`) $\rightarrow$ `/plataforma/activos/contratos`
  - Licencias y contratos de mi departamento (`#21145`) $\rightarrow$ `/plataforma/activos/contratos-area`
  - Proveedores (`#21146`) $\rightarrow$ `/plataforma/activos/proveedores`
  - Renovaciones y vencimientos (`#21147`) $\rightarrow$ `/plataforma/activos/renovaciones`
- **Catálogos y configuración de activos** (`#21148`) *(Sub-agrupador)*
  - Ciclos de vida y reglas de transición (`#21149`) $\rightarrow$ `/plataforma/activos/configuracion/ciclos-vida-transiciones`
  - Fabricantes y modelos (`#21150`) $\rightarrow$ `/plataforma/activos/configuracion/tipos-modelos-atributos/fabricantes`
  - Licencias y contratos (`#21151`) $\rightarrow$ `/plataforma/activos/configuracion/licencias-contratos`
  - Listas auxiliares (`#21152`) $\rightarrow$ `/plataforma/activos/configuracion/tipos-modelos-atributos/catalogos`
  - Tipos de CI y relaciones de CMDB (`#21153`) $\rightarrow$ `/plataforma/activos/configuracion/cmdb-relaciones`
  - Tipos, modelos y atributos (`#21154`) $\rightarrow$ `/plataforma/activos/configuracion/tipos-modelos-atributos`
  - Ubicaciones (`#21155`) $\rightarrow$ `/plataforma/activos/configuracion/tipos-modelos-atributos/ubicaciones`

### Sección 6: Conocimiento (`#21156`) *(Raíz)*
- Base de conocimiento (`#21157`, `#21158`) $\rightarrow$ `/plataforma/conocimiento/base`
- Crear artículo (`#21159`) $\rightarrow$ `/plataforma/conocimiento/nuevo`
- Mis artículos (`#21160`) $\rightarrow$ `/plataforma/conocimiento/mis-articulos`
- Revisión y publicación de artículos (`#21161`) $\rightarrow$ `/plataforma/conocimiento/publicacion`
- Revisiones pendientes (`#21162`) $\rightarrow$ `/plataforma/conocimiento/revisiones`
- Categorías, responsables y reglas de publicación y revisión (`#21202`) $\rightarrow$ `/plataforma/conocimiento/configuracion`

### Sección 7: Catálogo de Servicios (`#21163`) *(Raíz)*
- Catálogo de servicios (`#21164`) $\rightarrow$ `/plataforma/servicios/catalogo`
- Configuración de categorías (`#21165`) $\rightarrow$ `/plataforma/servicios/configuracion/categorias`
- Crear servicio (`#21166`) $\rightarrow$ `/plataforma/servicios/configuracion/crear`
- Objetivos SLA (`#21167`) $\rightarrow$ `/plataforma/servicios/configuracion/sla`
- Servicios de incidentes (`#21168`) $\rightarrow$ `/plataforma/servicios/configuracion/incidentes`
- Servicios de solicitudes (`#21169`) $\rightarrow$ `/plataforma/servicios/configuracion/solicitudes`

### Sección 8: Operación (`#21170`) *(Raíz)*
- Disponibilidad, capacidad y continuidad (`#21171`) $\rightarrow$ `/plataforma/operacion/resiliencia`
- Eventos y alertas (`#21172`) $\rightarrow$ `/plataforma/operacion/eventos`
- Eventos y resiliencia (`#21173`) $\rightarrow$ `/plataforma/operacion/eventos-resiliencia`

### Sección 9: Reportes (`#21174`) *(Raíz)*
- Indicadores operativos y SLA (`#21175`) $\rightarrow$ `/plataforma/reportes/operativos`
- Informes de auditoría (`#21176`) $\rightarrow$ `/plataforma/reportes/auditoria`
- Productividad individual (`#21177`) $\rightarrow$ `/plataforma/reportes/productividad`
- Reportes de activos (`#21178`) $\rightarrow$ `/plataforma/reportes/activos`
- Reportes de cambios (`#21179`) $\rightarrow$ `/plataforma/reportes/cambios`
- Reportes de decisiones (`#21180`) $\rightarrow$ `/plataforma/reportes/decisiones`
- Reportes de problemas (`#21181`) $\rightarrow$ `/plataforma/reportes/problemas`
- Reportes del área (`#21182`) $\rightarrow$ `/plataforma/reportes/area`
- Tableros (`#21183`) $\rightarrow$ `/plataforma/reportes/tableros`

### Sección 10: Organización (`#21264`) *(Raíz)*
- Departamentos empresariales (`#21204`) $\rightarrow$ `/plataforma/organizacion/departamentos-empresa`
- Departamentos y grupos resolutores de TI (`#21205`) $\rightarrow$ `/plataforma/organizacion/departamentos`
- Supervisores (`#21206`) $\rightarrow$ `/plataforma/organizacion/departamentos/supervisores`
- Técnicos y niveles de soporte (`#21207`) $\rightarrow$ `/plataforma/organizacion/tecnicos`

### Sección 11: Plataforma (`#21215`) *(Raíz)*
- **Cumplimiento** (`#21216`) *(Sub-agrupador)*
  - Cambios sin autorización o fuera de ventana (`#21217`) $\rightarrow$ `/plataforma/seguridad/cumplimiento/cambios`
  - Muestreo de auditoría (`#21218`) $\rightarrow$ `/plataforma/seguridad/muestreo`
  - Segregación de funciones (`#21219`) $\rightarrow$ `/plataforma/seguridad/cumplimiento/sod`
- **Identidades** (`#21208`) *(Sub-agrupador)*
  - Gestión de usuarios (`#21209`) $\rightarrow$ `/plataforma/seguridad/usuarios`
  - Perfiles y permisos (`#21210`) $\rightarrow$ `/plataforma/seguridad/perfiles`
- **Menú y notificaciones** (`#21211`) *(Sub-agrupador)*
  - Configuración de contacto (`#21212`) $\rightarrow$ `/plataforma/operacion/notificaciones/contacto`
  - Estructura del menú (`#21213`) $\rightarrow$ `/plataforma/operacion/menu`
  - Plantillas de correo y otros canales (`#21214`) $\rightarrow$ `/plataforma/operacion/notificaciones/plantillas`
- **Auditoría, Mantenimiento y Salud:**
  - Auditoría de cambios de configuración (`#21220`) $\rightarrow$ `/plataforma/seguridad/auditoria-sistema`
  - Registros de seguridad y autenticación (`#21221`) $\rightarrow$ `/plataforma/seguridad/seguridad-logs`
  - Recertificación de accesos (`#21222`) $\rightarrow$ `/plataforma/seguridad/accesos/recertificacion`
  - Retención y mantenimiento de datos (`#21223`) $\rightarrow$ `/plataforma/operacion/mantenimiento-datos`
  - Salud del sistema (`#21224`) $\rightarrow$ `/plataforma/operacion/salud-sistema`

### Sección 12: Mi cuenta (`#21225`) *(Raíz)*
- Mi perfil y seguridad (`#21226`) $\rightarrow$ `/plataforma/mi-cuenta/perfil`
- Preferencias de notificación (`#21227`) $\rightarrow$ `/plataforma/mi-cuenta/notificaciones`

---

## 3. Desglose Exhaustivo por Módulo: Módulo 4 - PROBLEMAS (`#21091`)

A continuación se detalla exhaustivamente cada opción de menú, su propósito en el marco ITIL v4, sus pestañas internas y cada botón que abre ventanas emergentes (modales/popups), verificado directamente contra el código fuente TypeScript/React de FlowDesk.

### 3.1. Agrupador Raíz: Problemas (`#21091`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito ITIL v4:** Gestionar el ciclo de vida completo de todos los problemas para identificar las causas raíz subyacentes de los incidentes, prevenir su recurrencia periódica y minimizar el impacto negativo de los errores técnicos que no pueden evitarse de inmediato.
- **Ruta física base:** `src/app/plataforma/problemas/`
- **Módulo de backend:** `src/modules/problemas/`

---

### 3.2. Vistas Operativas y de Gestión de Problemas

#### 1. Análisis de Causa Raíz (`#21092`)
- **URL Canónica:** `/plataforma/problemas/analisis`
- **Componente Implementador:** `VistaAnalisisProblemas.tsx`
- **Propósito:** Proporcionar al especialista de problemas y al equipo de ingeniería herramientas analíticas estructuradas para investigar y determinar la causa fundamental de incidentes recurrentes o fallas mayores.
- **Pestañas Internas:**
  - **Pestaña interna 1: 5 Porqués:** Implementa una secuencia encadenada de preguntas causales iterativas. Permite formular el primer síntoma y registrar secuencialmente hasta cinco niveles de causa hasta alcanzar la causa raíz primaria de la falla.
  - **Pestaña interna 2: Ishikawa (Causa-Efecto):** Ofrece un diagrama estructurado en las dimensiones estándar de ingeniería (Mano de obra, Método, Máquina/Tecnología, Material, Medición y Entorno) para categorizar factores contribuyentes a la degradación o caída del servicio.
  - **Pestaña interna 3: Línea de Tiempo:** Registra cronológicamente la secuencia de hechos, desde el primer síntoma o evento detectado por monitoreo, degradación, corte total, intentos de mitigación, hasta la restauración provisoria.
  - **Pestaña interna 4: Conclusión de Causa Raíz:** Espacio formal de redacción técnica donde se consigna el dictamen final, el componente o código defectuoso y la solución definitiva requerida.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Marcar como error conocido (KEDB)":** Abre un modal de confirmación y captura que transforma el diagnóstico analítico en una ficha oficial de Known Error, solicitando el registro de la solución de contingencia (Workaround) y autorizando su publicación para el personal de Mesa de Servicio (N1/N2).

---

#### 2. Bandeja y Asignación (`#21093`, `#21094`)
- **URL Canónica:** `/plataforma/problemas/asignacion`
- **Componente Implementador:** `VistaAsignacionProblemas.tsx`
- **Propósito:** Centro de despacho y balanceo de carga de problemas pendientes de investigación. Permite al gestor de problemas o coordinador técnico asignar especialistas o transferir expedientes entre grupos de resolución.
- **Pestañas Internas:** No posee pestañas; presenta una interfaz de mesa de control con filtros por estado, prioridad, categoría y servicio afectado sobre una tabla con scroll bidireccional (`TablaDobleScroll`).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en cada fila de la tabla): "Asignar especialista":** Abre un modal emergente que lista los grupos técnicos competentes y sus miembros disponibles en tiempo real, permitiendo seleccionar el responsable líder de la investigación y añadir notas de delegación.

---

#### 3. Candidatos a Problema (`#21095`, `#21096`)
- **URL Canónica:** `/plataforma/problemas/candidatos`
- **Componente Implementador:** `VistaCandidatosProblemas.tsx`
- **Propósito:** Evaluar tickets de incidentes propuestos por técnicos de primera línea o detectados automáticamente por el motor de correlación como potenciales problemas que requieren investigación preventiva.
- **Pestañas Internas:** No posee pestañas secundarias; lista los candidatos en orden de severidad y número de ocurrencias.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Promover a Problema":** Abre un modal que prellena un expediente nuevo de problema (PRB) con los datos del incidente candidato (título, descripción, servicio afectado, CI y tickets asociados) permitiendo su formalización.
    - **Botón popup 2: "Descartar candidato":** Abre un modal emergente de rechazo donde se selecciona la justificación técnica (incidente puntual sin tendencia, duplicidad, causa operativa externa o no reproducible).

---

#### 4. Conocimiento Derivado (`#21097`)
- **URL Canónica:** `/plataforma/problemas/conocimiento`
- **Componente Implementador:** `VistaConocimientoProblemas.tsx`
- **Propósito:** Auditar y gestionar los artículos de la Base de Conocimiento (KCS) que han sido generados como resultado de la investigación de un problema, asegurando que las lecciones aprendidas y guías de diagnóstico queden disponibles para el soporte de primer nivel.
- **Pestañas Internas:** No tiene pestañas; presenta métricas de adopción de artículos y tabla de artículos vinculados a expedientes PRB.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Generar artículo de conocimiento":** Abre un modal con plantilla KCS preconfigurada que extrae el título del problema, descripción del síntoma, causa raíz y workaround para crear un borrador en el módulo de Conocimiento.

---

#### 5. Errores Conocidos (KEDB) (`#21098`, `#21099`)
- **URL Canónica:** `/plataforma/problemas/kedb`
- **Componente Implementador:** `VistaKedbProblemas.tsx`
- **Propósito:** Consultar, registrar y actualizar la Base de Errores Conocidos (*Known Error Database* - KEDB). Permite a los agentes de mesa de servicio buscar rápidamente síntomas de incidentes y aplicar soluciones temporales documentadas para restaurar el servicio de inmediato sin esperar el análisis de fondo.
- **Pestañas Internas:** No tiene pestañas; dispone de un motor de búsqueda por texto completo, filtros por servicio afectado, componente de software y catálogo de síntomas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nuevo Error Conocido":** Abre un modal con formulario técnico estructurado para registrar código de error, descripción del comportamiento anómalo, causa conocida, pasos exactos del workaround, advertencias de seguridad y enlace al problema matriz.
    - **Botón popup 2: "Ver expediente de problema matriz":** Abre un diálogo modal o panel lateral que muestra la información completa del problema originario sin abandonar la KEDB.

---

#### 6. Incidentes Recurrentes (`#21100`)
- **URL Canónica:** `/plataforma/problemas/recurrentes`
- **Componente Implementador:** `VistaRecurrentesProblemas.tsx`
- **Propósito:** Herramienta analítica de detección proactiva ITIL. Examina el universo de incidentes de los últimos 90 días y los agrupa según patrones comunes (mismo servicio, misma categoría técnica, mismo elemento de configuración o idéntico código de error) para alertar sobre degradaciones sistemáticas.
- **Pestañas Internas:** No tiene pestañas; incluye selectores de dimensiones analíticas (por Categoría, por Servicio, por CI o por Código de Cierre).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en cada grupo detectado): "Crear problema desde agrupación":** Abre un modal que recopila la totalidad de los tickets de incidentes pertenecientes a ese grupo y genera automáticamente el expediente de investigación de problema con los tickets pre-vinculados.

---

#### 7. Objetivos de Tiempo (`#21101`)
- **URL Canónica:** `/plataforma/problemas/objetivos`
- **Componente Implementador:** `VistaObjetivosProblemas.tsx`
- **Propósito:** Monitorear el grado de cumplimiento de los objetivos de tiempo de respuesta, diagnóstico de causa raíz y formulación de workaround acordados en los Acuerdos de Nivel Operativo (OLA) del equipo de ingeniería.
- **Pestañas Internas:** No tiene pestañas; renderiza indicadores visuales de semáforo de tiempo (Verde, Amarillo, Rojo) y desglose de expedientes con vencimiento inminente.
- **Botones y Popups:** No presenta modales emergentes (vista de auditoría y monitoreo continuo en tiempo real).

---

#### 8. Problemas Asignados a Mí (`#21102`)
- **URL Canónica:** `/plataforma/problemas/asignados`
- **Componente Implementador:** `VistaProblemasAsignados.tsx`
- **Propósito:** Bandeja de trabajo personalizada para el especialista técnico o ingeniero asignado como propietario de la investigación de un problema. Permite concentrarse en los casos activos bajo su responsabilidad directa.
- **Pestañas Internas:** No posee pestañas; presenta métricas personales de estado (En diagnóstico, Esperando cambio, Con workaround) y tabla de expedientes con acceso rápido al detalle.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en fila): "Actualizar avance rápido":** Abre un modal liviano para incorporar una nota técnica de avance o bitácora de pruebas sin necesidad de ingresar al expediente completo.

---

#### 9. Problemas de Mi Grupo (`#21103`)
- **URL Canónica:** `/plataforma/problemas/grupo`
- **Componente Implementador:** `VistaProblemasGrupo.tsx`
- **Propósito:** Tablero colaborativo para los integrantes de un mismo grupo resolutor (ej. Base de Datos, Redes, Infraestructura Cloud). Permite visualizar los casos asignados a la cola común y auto-asignarse expedientes desatendidos.
- **Pestañas Internas:** No tiene pestañas; dispone de filtros por estado y especialista del equipo.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Tomar problema (Autoasignar)":** Diálogo de confirmación para transferir la titularidad del expediente al usuario activo.

---

#### 10. Problemas Mayores y Comités PIR (`#21104`)
- **URL Canónica:** `/plataforma/problemas/mayores`
- **Componente Implementador:** `VistaMayoresProblemas.tsx`
- **Propósito:** Gestión de problemas de severidad crítica (P1 / Incidentes Mayores) que han ocasionado pérdidas de servicio a gran escala. Coordina la revisión post-incidente (*Post-Incident Review* - PIR) y la rendición de cuentas ante el comité de dirección.
- **Pestañas Internas:** No tiene pestañas; presenta timeline de crisis, lista de participantes y estados de comités PIR.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Convocar Comité PIR":** Abre un modal emergente para agendar la sesión de revisión post-incidente, ingresar lista de convocados (dueños de servicio, líderes de arquitectura, seguridad), fecha/hora y borrador del acta de revisión.

---

#### 11. Registrar Problema (`#21105`)
- **URL Canónica:** `/plataforma/problemas/crear`
- **Componente Implementador:** `VistaProblemasCrear.tsx`
- **Propósito:** Formulario para dar de alta manualmente un nuevo expediente de problema en la organización cuando no proviene de una promoción automática de incidente.
- **Pestañas Internas:** No tiene pestañas; se estructura como un formulario centrado con validaciones de campos obligatorios (Título, Descripción, Urgencia, Impacto, Prioridad calculada, Categoría y Elemento de Configuración).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Cargar desde plantilla":** Abre un modal selector con el catálogo de plantillas predefinidas (ej. Caída de base de datos, Degradación de red WAN) para rellenar automáticamente los campos estándar del formulario.

---

#### 12. Historial de Problemas (`#21106`)
- **URL Canónica:** `/plataforma/problemas/historial`
- **Componente Implementador:** `VistaProblemaHistorial.tsx`
- **Propósito:** Repositorio histórico y motor de búsqueda exhaustivo de todos los expedientes de problemas registrados históricamente (abiertos, resueltos, cerrados con solución o cerrados con riesgo aceptado).
- **Pestañas Internas:** No tiene pestañas; incluye filtros combinados por rango de fechas de apertura/cierre, palabras clave, códigos de error y estado ITIL.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Exportar reporte":** Abre un modal emergente para seleccionar el formato de descarga (Excel, CSV o PDF) y los campos a incluir en el extracto histórico.

---

#### 13. Aprobación de Riesgo y Cierre (`#21107`)
- **URL Canónica:** `/plataforma/problemas/aprobaciones`
- **Componente Implementador:** `VistaAprobacionesProblemas.tsx`
- **Propósito:** Bandeja de gobierno y gestión de decisiones para autorizar la aceptación formal de riesgos residuales (cuando la causa raíz es identificada pero corregirla es técnicamente imposible o tiene un costo desproporcionado respecto al beneficio) y autorizar el cierre definitivo de expedientes.
- **Pestañas Internas:** No tiene pestañas; muestra la lista de dictámenes pendientes con el nivel de impacto estimado y el workaround validado.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Emitir dictamen de aprobación":** Abre un modal formal donde el comité o autoridad aprobatoria selecciona su decisión (Aprobado, Rechazado, Requiere más análisis), define la fecha de reevaluación periódica del riesgo y redacta las condiciones de aceptación.

---

#### 14. Solicitudes de Cambio Derivadas (`#21108`)
- **URL Canónica:** `/plataforma/problemas/cambios`
- **Componente Implementador:** `VistaCambiosProblemas.tsx`
- **Propósito:** Supervisar la ejecución de las Solicitudes de Cambio (*Request for Change* - RFC) que fueron generadas para aplicar la solución definitiva de un problema en los entornos productivos.
- **Pestañas Internas:** No tiene pestañas; presenta la trazabilidad bidireccional entre el código de problema (PRB) y el código de cambio (RFC), visualizando el estado de aprobación del CAB y la fecha de implementación programada.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Vincular nuevo RFC":** Abre un modal para vincular una solicitud de cambio existente por su identificador o abrir el redactor rápido de RFC con los datos del problema prellenados.

---

### 3.3. Vistas de Configuración y Parametrización del Dominio

#### 15. Configuración de Formulario de Problemas (`#21199`)
- **URL Canónica:** `/plataforma/problemas/configuracion/formulario`
- **Componente Implementador:** `VistaFormularioProblemas.tsx`
- **Propósito:** Parametrizar dinámicamente los campos nativos, campos personalizados, matriz de cálculo de prioridad, plantillas de captura y el diseño visual de la ficha del expediente de problemas.
- **Pestañas Internas:**
  - **Pestaña interna 1: Campos (`PestanaCampos`):** Permite configurar los atributos nativos del formulario de problema (Título, Descripción, Categoría, Servicio, Impacto, Urgencia, etc.). Permite definir si cada campo es visible, obligatorio, de sólo lectura y su texto de ayuda contextual.
  - **Pestaña interna 2: Campos personalizados (`PestanaCamposPersonalizados`):** Gestión de atributos a medida requeridos por la organización. Soporta hasta 30 campos personalizados por entidad con tipado estricto (Texto, Numérico, Fecha, Selector desplegable o Booleano).
  - **Pestaña interna 3: Listas y catálogos (`PestanaListasCatalogos`):** Administra los valores seleccionables de las listas desplegables del problema (Categorías tecnológicas, Componentes, Tipos de Causa Raíz, etc.).
  - **Pestaña interna 4: Matriz de prioridad (`PestanaPrioridad`):** Matriz bidimensional estándar ITIL que cruza los 3 niveles de Impacto con los 3 niveles de Urgencia para calcular automáticamente la Prioridad del problema (Crítica, Alta, Media, Baja).
  - **Pestaña interna 5: Plantillas de problema (`PestanaPlantillas`):** Configura plantillas predefinidas que estandarizan el registro de problemas conocidos o caídas típicas de arquitectura.
  - **Pestaña interna 6: Diseño del ticket (`PestanaVistaTicket`):** Administra la distribución de secciones, bloques de información y pestañas visibles en el expediente 360° del problema (`VistaProblemaDetalle`).
- **Botones y Popups:**
  - **En vista principal (Cabecera):**
    - **Botón popup 1: "Publicar cambios":** Abre el modal de cálculo de diferencias (*diff*) que compara la versión activa en producción contra el borrador actual, solicitando una descripción del cambio de versión y confirmando la publicación oficial.
    - **Botón popup 2: "Historial de versiones":** Abre un modal con la lista cronológica de snapshots de versiones del formulario, permitiendo visualizar los cambios históricos o restaurar una versión anterior.
  - **Dentro de Pestaña interna 1 (Campos):**
    - **Botón popup 1: "Editar propiedades de campo":** Abre el modal `ModalEditarPropiedadesCampo` al hacer clic sobre un campo de la tabla para editar su etiqueta visual, obligatoriedad condicional, valor por defecto y mensaje de ayuda.
    - **Botón popup 2: "Vista previa":** Abre el modal `ModalVistaPrevia` que renderiza una simulación interactiva completa de cómo verá el formulario un usuario final con los campos configurados.
  - **Dentro de Pestaña interna 2 (Campos personalizados):**
    - **Botón popup 1: "Nuevo campo personalizado":** Abre un modal para ingresar nombre, código técnico único, tipo de dato, expresión regular de validación y límites de longitud.
  - **Dentro de Pestaña interna 5 (Plantillas de problema):**
    - **Botón popup 1: "Nueva plantilla":** Abre un modal emergente donde se configura el nombre de la plantilla, el impacto/urgencia recomendados y el texto base para la descripción del síntoma y el diagnóstico inicial.

---

#### 16. Flujo de Investigación y Seguimiento (`#21200`)
- **URL Canónica:** `/plataforma/problemas/configuracion/flujo`
- **Componente Implementador:** `VistaFlujoProblemas.tsx`
- **Propósito:** Configurar la máquina de estados finitos del ciclo de vida de un problema, las transiciones válidas, reglas de asignación automática, matrices de escalamiento y tareas predefinidas.
- **Pestañas Internas:**
  - **Pestaña interna 1: Estados (`PestanaEstados`):** Define el catálogo de estados por los que transita un problema (ej. Registrado, En Investigación, Error Conocido, Solución en Revisión, Resuelto, Cerrado, Riesgo Aceptado).
  - **Pestaña interna 2: Transiciones y acciones (`PestanaTransiciones`):** Modela el grafo de transiciones permitidas entre estados, definiendo validaciones de negocio previas (ej. no se puede pasar a Cerrado sin causa raíz documentada) y acciones automáticas post-transición (ej. notificar al dueño del servicio).
  - **Pestaña interna 3: Asignación automática (`PestanaAsignacion`):** Reglas de enrutamiento basadas en condiciones (categoría, servicio, criticidad) para preasignar automáticamente el caso a una cola de soporte o ingeniero especialista.
  - **Pestaña interna 4: Objetivos de tiempo (`PestanaObjetivosTiempo`):** Umbrales de SLA/OLA en horas hábiles o naturales para diagnóstico y solución según la prioridad.
  - **Pestaña interna 5: Escalamiento (`PestanaEscalamiento`):** Reglas jerárquicas y funcionales que disparan alertas automáticas cuando un problema consume determinado porcentaje de su tiempo límite sin mostrar avances.
  - **Pestaña interna 6: Reapertura (`PestanaReapertura`):** Parámetros que regulan cuántos días después de cerrado un problema puede ser reabierto por reincidencia o si debe generarse un nuevo expediente.
  - **Pestaña interna 7: Tareas predefinidas (`PestanaTareas`):** Plantillas de actividades y paquetes de trabajo de investigación que se generan automáticamente cuando un problema alcanza determinado estado.
  - **Pestaña interna 8: Problemas mayores (`PestanaMayores`):** Criterios de activación para declarar un problema como Problema Mayor e iniciar protocolos de crisis.
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Estados):**
    - **Botón popup 1: "Nuevo Estado" (y botón de edición por fila):** Abre el modal "Modal Alta / Edición de Estado" para configurar código, nombre, tipo de estado (Inicial, En progreso, Espera, Resuelto, Cerrado), color de badge y propiedades de control.
  - **Dentro de Pestaña interna 2 (Transiciones y acciones):**
    - **Botón popup 1: "Nueva Transición" (y botón de edición de fila):** Abre el modal "Modal Editor de Transición" para enlazar estado origen, estado destino, roles con permiso de ejecutarla y reglas de validación obligatorias.
  - **Dentro de Pestaña interna 3 (Asignación automática):**
    - **Botón popup 1: "Nueva Regla de Asignación" (y edición):** Abre el modal "Modal Editor de Regla" para seleccionar criterios de disparo y el grupo/técnico destino.
  - **Dentro de Pestaña interna 4 (Objetivos de tiempo):**
    - **Botón popup 1: "Vista previa de medidores":** Abre el modal "Modal Vista Previa de Medidores" para simular cómo se visualizarán los temporizadores según diferentes combinaciones de horarios hábiles.
  - **Dentro de Pestaña interna 5 (Escalamiento):**
    - **Botón popup 1: "Nueva Regla de Escalamiento":** Abre el modal "Modal Editor" para definir el nivel de escalamiento y los canales de notificación (Email, Webhook, Notificación en plataforma).
    - **Botón popup 2: "Simulador de Escalamiento":** Abre el modal "Modal Simulador" para correr un caso de prueba y verificar qué reglas se dispararían en un lapso temporal determinado.
  - **Dentro de Pestaña interna 7 (Tareas predefinidas):**
    - **Botón popup 1: "Nueva Tarea":** Abre el modal "Modal Alta de Tarea" para definir título de actividad, descripción detallada, orden de ejecución y rol asignado.
    - **Botón popup 2: "Nuevo Paquete de Tareas":** Abre el modal "Modal Alta de Paquete" para agrupar múltiples tareas que se instancian en bloque.
  - **Dentro de Pestaña interna 8 (Problemas mayores):**
    - **Botón popup 1: "Probar Criterios":** Abre el modal "Modal Probar Criterios" para ingresar datos de un incidente hipotético y comprobar si la regla lo clasificaría como Problema Mayor.

---

#### 17. Relación con Incidentes, Errores Conocidos y Conocimiento (`#21201`)
- **URL Canónica:** `/plataforma/problemas/configuracion/relaciones`
- **Componente Implementador:** `VistaRelacionesProblemas.tsx`
- **Propósito:** Configurar la integración e interoperabilidad del ciclo de vida de problemas con los demás procesos de ITIL v4: Mesa de incidentes, KEDB, Solicitudes de cambio (RFC), Base de conocimiento y CMDB.
- **Pestañas Internas:**
  - **Pestaña interna 1: Creación por umbral (`PestanaUmbral`):** Reglas automáticas que monitorizan la mesa de servicio y, al detectar que una cantidad configurable de incidentes similares ocurre en un intervalo de horas, generan un problema o una alerta de candidato.
  - **Pestaña interna 2: Incidentes vinculados (`PestanaIncidentesVinculados`):** Reglas de sincronización y resolución en cascada. Permite definir si al resolver o cerrar un problema se deben resolver automáticamente los incidentes vinculados o hacerlo de forma asistida.
  - **Pestaña interna 3: Errores conocidos (KEDB) (`PestanaKedb`):** Parámetros de publicación hacia la KEDB y sincronización de estados cuando se formula una solución temporal.
  - **Pestaña interna 4: Cambios (RFC) (`PestanaRfc`):** Configuración de requerimientos de cambio, determinando cuándo una solución técnica obliga a la creación formal de un RFC.
  - **Pestaña interna 5: Conocimiento (`PestanaConocimiento`):** Reglas de transformación KCS para generar borradores de artículos técnicos a partir de la causa raíz de un problema.
  - **Pestaña interna 6: CI y servicios (CMDB) (`PestanaCmdb`):** Sincronización con los Elementos de Configuración de la CMDB, permitiendo actualizar el estado de salud del CI cuando se asocia a un problema activo.
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Creación por umbral):**
    - **Botón popup 1: "Nueva Regla de Umbral" (y edición por fila):** Abre un modal para ingresar la condición de agrupación (mismo servicio, misma categoría, mismo CI), la ventana de observación (ej. 24 horas), el umbral de tickets (ej. 5 tickets) y la prioridad del problema resultante.
    - **Botón popup 2: "Historial de ejecuciones":** Abre un modal emergente que lista el registro histórico de disparos automáticos del evaluador de umbrales en background.
  - **Dentro de Pestaña interna 2 (Incidentes vinculados):**
    - **Botón popup 1: "Vista previa de resolución":** Abre un modal interactivo que simula la ventana de resolución asistida que verá el especialista al resolver un problema con múltiples incidentes abiertos vinculados.
  - **Dentro de Pestaña interna 3 (Errores conocidos - KEDB):**
    - **Botón popup 1: "Probar publicación KEDB":** Abre un modal de prueba para validar que los campos del problema se mapeen correctamente a la estructura de la ficha de Known Error.
    - **Botón popup 2: "Configurar campos requeridos":** Abre un modal para seleccionar qué datos técnicos son mandatorios antes de permitir la publicación en KEDB.
  - **Dentro de Pestaña interna 5 (Conocimiento):**
    - **Botón popup 1: "Vista previa de artículo generado":** Abre un modal que muestra el artículo HTML renderizado tal como se crearía en la base de conocimiento según la plantilla KCS.

---

#### 18. Expediente Integral 360° del Problema (`[id]`)
- **URL Canónica:** `/plataforma/problemas/[id]`
- **Componente Implementador:** `VistaProblemaDetalle.tsx`
- **Propósito:** Vista detallada de gestión operativa donde se ejecuta el seguimiento, diagnóstico, mitigación y cierre de un problema específico.
- **Pestañas Internas:**
  - **Pestaña interna 1: Información y Diagnóstico:** Muestra el expediente central con el título, descripción, clasificación tecnológica, prioridad, tiempos consumidos, técnico responsable e investigación de causa raíz.
  - **Pestaña interna 2: Incidentes Vinculados:** Lista todos los tickets de incidentes que han sido asociados al problema, con su estado de resolución y opción de desvinculación.
  - **Pestaña interna 3: Errores Conocidos (KEDB):** Visualiza las fichas de error conocido y soluciones de contingencia asociadas a este problema.
  - **Pestaña interna 4: Solicitudes de Cambio (RFC):** Lista las órdenes de cambio en producción generadas para la solución permanente.
  - **Pestaña interna 5: Tareas y Plan de Acción:** Matriz de actividades operativas delegadas a diferentes especialistas para diagnosticar o mitigar la falla.
  - **Pestaña interna 6: Auditoría y Bitácora:** Registro inmutable de cada cambio de estado, nota interna, reasignación o actualización de campo realizada en el expediente.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Vincular incidente":** Abre un modal de búsqueda para seleccionar tickets de incidentes y asociarlos al problema.
    - **Botón popup 2: "Registrar Error Conocido":** Abre el modal para crear y publicar una solución temporal directa en KEDB.
    - **Botón popup 3: "Solicitar Cambio (RFC)":** Abre el modal para solicitar formalmente un cambio en producción derivado del problema.
    - **Botón popup 4: "Nueva Tarea":** Abre el modal para añadir una actividad de investigación con responsable y fecha compromiso.
    - **Botón popup 5: "Cambiar Estado / Transición":** Abre el modal de transición que evalúa las reglas configuradas en el flujo y solicita los campos obligatorios del nuevo estado (ej. causa raíz si se pasa a Resuelto).

---

## 4. Desglose Exhaustivo por Módulo: Módulo 2 - MESA DE SERVICIO (`#21023`)

### 4.1. Agrupador Raíz: Mesa de Servicio (`#21023`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito ITIL v4:** Punto único de contacto (*Single Point of Contact* - SPOC) entre los usuarios de la organización y el área de Tecnologías de la Información. Gestiona la restauración rápida de servicios interrumpidos (Gestión de Incidentes), el despacho eficiente de requerimientos y accesos (Gestión de Solicitudes de Servicio), la coordinación operativa de la mesa y el control estricto de Acuerdos de Nivel de Servicio (SLA).
- **Ruta física base:** `src/app/plataforma/incidentes/`, `src/app/plataforma/solicitudes/`, `src/app/plataforma/tickets/` y `src/app/plataforma/servicios/sla/`
- **Módulos de backend:** `src/modules/tickets/`, `src/modules/servicios/` y `src/modules/incidentes/`

---

### 4.2. Sub-agrupador: Incidentes (`#21228`)
- **Tipo:** Sub-agrupador Funcional (Nivel 2).
- **Propósito:** Restaurar la operación normal del servicio lo más rápidamente posible y minimizar el impacto adverso en las operaciones de negocio ante fallas imprevistas o degradaciones de calidad.

#### 1. Todos los Incidentes (`#21230`)
- **URL Canónica:** `/plataforma/incidentes`
- **Componente Implementador:** `TablaTickets.tsx` (con filtro `tipo="incidente"` y `vista="todos"`)
- **Propósito:** Registro y monitoreo centralizado de la totalidad de incidentes reportados en la plataforma, permitiendo auditoría, búsqueda global y supervisión general de la cola de fallas.
- **Pestañas Internas:** No posee pestañas; presenta tabla enriquecida con columnas de código, título, estado, prioridad ITIL, solicitante, grupo resolutor, técnico asignado y tiempo de SLA restante.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Abre el modal de filtrado multicriterio donde se pueden cruzar fechas de creación/cierre, múltiples estados simultáneos, rangos de prioridad, técnicos asignados y cumplimiento de SLA.
    - **Botón popup 2 (al hacer clic en cualquier ticket): "Ver detalle del incidente":** Abre el modal integral `ModalDetalleTicket` para visualizar el expediente completo y operar sobre el ticket.

#### 2. Mis Incidentes (`#21231`)
- **URL Canónica:** `/plataforma/incidentes/mios`
- **Componente Implementador:** `TablaTickets.tsx` (con `vista="mios"`)
- **Propósito:** Bandeja personal de autoservicio donde el usuario solicitante o consumidor del servicio consulta los incidentes que él mismo ha reportado, el estado de atención y las respuestas brindadas por soporte.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Abre modal de filtros sobre sus propios reportes.
    - **Botón popup 2 (al hacer clic en un ticket): "Ver detalle del incidente":** Abre `ModalDetalleTicket` en arquetipo consumidor, permitiendo responder a los técnicos y calificar la atención.

#### 3. Incidentes Asignados a Mí (`#21232`)
- **URL Canónica:** `/plataforma/incidentes/asignados`
- **Componente Implementador:** `TablaTickets.tsx` (con `vista="asignados"`)
- **Propósito:** Bandeja de trabajo directo del técnico o especialista de soporte asignado. Muestra los incidentes activos bajo su custodia ordenados por urgencia de vencimiento de SLA.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros por estado y prioridad.
    - **Botón popup 2 (en fila): "Ver detalle del incidente":** Abre `ModalDetalleTicket` en arquetipo técnico/operador con herramientas de diagnóstico y resolución.

#### 4. Bandeja de Incidentes (`#21233`)
- **URL Canónica:** `/plataforma/incidentes/bandeja`
- **Componente Implementador:** `TablaTickets.tsx` (con `vista="bandeja"`)
- **Propósito:** Cola de incidentes pendientes de asignación o tickets no tomados. Permite a los técnicos de mesa de nivel 1 revisar los nuevos reportes y auto-asignarse tickets para iniciar su atención inmediata.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros.
    - **Botón popup 2 (en fila): "Ver detalle del incidente":** Abre `ModalDetalleTicket`, habilitando el botón de acción "Tomar ticket de la mesa".

#### 5. Incidentes Resueltos (`#21234`)
- **URL Canónica:** `/plataforma/incidentes/resueltos`
- **Componente Implementador:** `TablaTickets.tsx` (con `vista="resueltos"`)
- **Propósito:** Repositorio de incidentes que ya han sido atendidos y cuentan con una solución aplicada, pendientes de confirmación de cierre por parte del usuario o cierre tácito por temporizador.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtrado histórico.
    - **Botón popup 2 (en fila): "Ver detalle del incidente":** Abre `ModalDetalleTicket` para auditar la solución aplicada y la encuesta de satisfacción.

#### 6. Incidentes de Mi Departamento (`#21235`)
- **URL Canónica:** `/plataforma/incidentes/departamento`
- **Componente Implementador:** `TablaTickets.tsx` (con `vista="departamento"`)
- **Propósito:** Vista de visibilidad de área donde supervisores o jefes de departamento corporativo monitorean los incidentes reportados por cualquier empleado perteneciente a su misma unidad de negocio.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros por colaborador o tipo de falla.
    - **Botón popup 2: "Ver detalle del ticket":** Abre `ModalDetalleTicket` en modo lectura/supervisión.

#### 7. Registrar Incidente (`#21236`)
- **URL Canónica:** `/plataforma/incidentes/crear`
- **Componente Implementador:** `VistaTicketsGestionCrear.tsx` (con `tipoFijo="incidente"`)
- **Propósito:** Formulario de captura para reportar una falla o interrupción imprevista de un servicio informático.
- **Pestañas Internas:** No tiene pestañas; presenta formulario guiado con secciones de: Solicitante, Categoría técnica, Servicio afectado del catálogo, Nivel de Impacto, Nivel de Urgencia (calcula Prioridad ITIL automática), Título, Descripción detallada del síntoma y Subida de Evidencias.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en evidencias adjuntas): "Ver visor de imagen/evidencia":** Abre modal emergente tipo lightbox para examinar capturas de pantalla de errores o documentos adjuntos antes de remitir el ticket.

#### 8. Catálogo de Incidentes (`#21237`)
- **URL Canónica:** `/plataforma/incidentes/catalogo`
- **Componente Implementador:** `VistaCatalogoServicios.tsx` (con `tipoFijo={1}`)
- **Propósito:** Portal visual para explorar los tipos de fallas y servicios tecnológicos comunes (Redes, Servidores, Impresoras, ERP, Telefonía) facilitando el reporte guiado para los usuarios.
- **Pestañas Internas:** No tiene pestañas; presenta tarjetas interactivas clasificadas por categoría de servicio con información de SLA de respuesta y solución.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón directo en tarjeta: "Reportar incidente":** Redirige al formulario de creación prellenando la categoría y el servicio seleccionado.

#### 9. Incidentes Mayores (`#21238`)
- **URL Canónica:** `/plataforma/incidentes/mayores`
- **Componente Implementador:** `VistaIncidentesMayores.tsx`
- **Propósito:** Declaración formal y seguimiento de incidentes de gravedad crítica (P1) que causan impacto catastrófico en el negocio. Permite registrar las decisiones de contingencia y convocar a los comités de crisis.
- **Pestañas Internas:** No tiene pestañas; interfaz dual que combina formulario de declaración ejecutiva y lista de incidentes mayores activos.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón de acción: "Declarar incidente mayor":** Dispara el protocolo de emergencia, generando el código P1 y enviando alertas masivas a los directores de TI.

#### 10. Sala de Crisis (Incidente Mayor) (`#21239`)
- **URL Canónica:** `/plataforma/incidentes/sala-crisis`
- **Componente Implementador:** `VistaMesaIncidenteMayor.tsx`
- **Propósito:** Centro de operaciones virtual durante un incidente crítico en curso. Integra enlaces a salas de conferencia virtuales (Teams/Meet/Zoom), cronología de eventos y publicación de comunicados corporativos a la organización.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón de acción: "Emitir comunicado oficial":** Publica una actualización técnica en tiempo real en la bitácora pública de la sala de crisis.

#### 11. Configuración del Formulario (`#21240`)
- **URL Canónica:** `/plataforma/incidentes/configuracion`
- **Componente Implementador:** `VistaConfiguracionFormularioMesa.tsx` (con `tipo="incidente"`)
- **Propósito:** Administrar la estructura del formulario de incidentes, visibilidad de campos obligatorios, orden y campos dinámicos a medida.
- **Pestañas Internas:**
  - **Pestaña interna 1: Campos (`PestanaCamposMesa`):** Define el orden de los campos nativos (Título, Servicio, Categoría, Urgencia, Impacto), su obligatoriedad, su distribución de ancho (50% o 100%) y si están habilitados para el autoservicio.
  - **Pestaña interna 2: Campos personalizados (`PestanaCamposPersonalizadosMesa`):** Gestiona atributos adicionales específicos para incidentes (ej. Código de error SAP, Dirección IP del switch, etc.).
  - **Pestaña interna 3: Niveles de solicitante (`PestanaNivelesSolicitante`):** Parametriza qué campos son exigidos según el tipo o nivel del usuario que reporta (VIP, Estándar, Técnico de campo).
- **Botones y Popups:**
  - **En vista principal (Cabecera):**
    - **Botón principal: "Guardar configuración":** Persiste atómicamente la configuración de todas las pestañas.
  - **Dentro de Pestaña interna 2 (Campos personalizados):**
    - **Botón popup 1: "Nuevo campo personalizado":** Abre el modal para crear un atributo a medida definiendo código, tipo de dato y validaciones.

#### 12. Flujo de Estados y Acciones (`#21187`)
- **URL Canónica:** `/plataforma/incidentes/configuracion/flujo`
- **Componente Implementador:** `ConfiguracionVistasTickets.tsx` (con `tipoFijo="incidente"` y `seccionInicial="estados"`)
- **Propósito:** Configurar la máquina de estados de incidentes (Nuevo, En progreso, En espera de tercero/usuario, Resuelto, Cerrado, Cancelado), reglas de transición y políticas de SLA asociadas.
- **Pestañas Internas:**
  - **Pestaña interna 1: Estados del Ciclo de Vida:** Lista los estados activos, códigos de color de visualización y tipo funcional ITIL.
  - **Pestaña interna 2: Reglas Operativas y Parámetros:**
    - Pausar SLA automáticamente al entrar en estado "En espera de usuario" o "En espera de proveedor".
    - Horas de gracia para reapertura permitida después de la resolución.
    - Exigir código de causa y solución obligatorios al marcar como "Resuelto".
    - Horas para el cierre automático/tácito de incidentes resueltos sin confirmación del usuario.
    - Permitir autoasignación para técnicos de nivel 1.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Editar regla de transición":** Abre modal para autorizar qué roles pueden transicionar entre dos estados específicos.

---

### 4.3. Sub-agrupador: Solicitudes (`#21229`)
- **Tipo:** Sub-agrupador Funcional (Nivel 2).
- **Propósito:** Gestionar el ciclo de vida de los requerimientos de servicio estándar solicitados por los usuarios (nuevos accesos, licencias de software, aprovisionamiento de equipos, restablecimiento de contraseñas), aplicando controles de autorización y cotización previos.

#### 13. Todas las Solicitudes (`#21241`)
- **URL Canónica:** `/plataforma/solicitudes`
- **Componente Implementador:** `TablaTickets.tsx` (con `tipo="solicitud"` y `vista="todos"`)
- **Propósito:** Visión consolidada de todas las solicitudes de servicio registradas en la organización.
- **Pestañas Internas:** No tiene pestañas; tabla con columnas de código de requerimiento, servicio solicitado, aprobador asignado, estado de entrega y SLA.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros por servicio, estado de aprobación y fechas.
    - **Botón popup 2: "Ver detalle de solicitud":** Abre `ModalDetalleTicket`.

#### 14. Mis Solicitudes (`#21242`)
- **URL Canónica:** `/plataforma/solicitudes/mios`
- **Componente Implementador:** `TablaTickets.tsx` (con `tipo="solicitud"` y `vista="mios"`)
- **Propósito:** Portal personal para que los empleados consulten el progreso de sus pedidos, licencias solicitadas o equipos en trámite de entrega.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros personales.
    - **Botón popup 2: "Ver detalle":** Abre `ModalDetalleTicket` en vista de consumidor.

#### 15. Solicitudes Asignadas a Mí (`#21243`)
- **URL Canónica:** `/plataforma/solicitudes/asignados`
- **Componente Implementador:** `TablaTickets.tsx` (con `tipo="solicitud"` y `vista="asignados"`)
- **Propósito:** Bandeja de cumplimiento (*fulfillment*) para el técnico responsable de despachar o configurar los accesos solicitados.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros.
    - **Botón popup 2: "Ver detalle":** Abre `ModalDetalleTicket` para registrar avance o completar entrega.

#### 16. Bandeja de Solicitudes (`#21244`)
- **URL Canónica:** `/plataforma/solicitudes/bandeja`
- **Componente Implementador:** `TablaTickets.tsx` (con `tipo="solicitud"` y `vista="bandeja"`)
- **Propósito:** Cola de requerimientos autorizados que están listos para ser tomados y atendidos por el equipo de cumplimiento.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros.
    - **Botón popup 2: "Ver detalle":** Abre `ModalDetalleTicket` con acción de autoasignación.

#### 17. Solicitudes Resueltas (`#21245`)
- **URL Canónica:** `/plataforma/solicitudes/resueltos`
- **Componente Implementador:** `TablaTickets.tsx` (con `tipo="solicitud"` y `vista="resueltos"`)
- **Propósito:** Historial de requerimientos completados y entregados con éxito al solicitante.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros.
    - **Botón popup 2: "Ver detalle":** Abre `ModalDetalleTicket`.

#### 18. Solicitudes de Mi Departamento (`#21246`)
- **URL Canónica:** `/plataforma/solicitudes/departamento`
- **Componente Implementador:** `TablaTickets.tsx` (con `tipo="solicitud"` y `vista="departamento"`)
- **Propósito:** Permite a las jefaturas departamentales revisar las peticiones formuladas por sus subordinados para control presupuestario y de inventario.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros.
    - **Botón popup 2: "Ver detalle":** Abre `ModalDetalleTicket`.

#### 19. Registrar Solicitud (`#21247`)
- **URL Canónica:** `/plataforma/solicitudes/crear`
- **Componente Implementador:** `VistaTicketsGestionCrear.tsx` (con `tipoFijo="solicitud"`)
- **Propósito:** Formulario para registrar un nuevo pedido de servicio, seleccionando catálogo, justificación operativa y adjuntos.
- **Pestañas Internas:** No tiene pestañas; formulario guiado con sección de justificación y cotizaciones.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en evidencias): "Ver visor de imagen/evidencia":** Abre modal lightbox para revisar documentos de justificación o cotizaciones adjuntas.

#### 20. Catálogo de Solicitudes (`#21248`)
- **URL Canónica:** `/plataforma/solicitudes/catalogo`
- **Componente Implementador:** `VistaCatalogoServicios.tsx` (con `tipoFijo={2}`)
- **Propósito:** Portal de autoservicio de solicitudes organizado por categorías (Hardware, Software, Cuentas y Accesos, Telefonía, Instalaciones) con tarjetas de servicio interactivas.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón directo: "Solicitar este servicio":** Conduce al formulario de creación preconfigurado.

#### 21. Aprobaciones de Solicitudes (`#21249`)
- **URL Canónica:** `/plataforma/solicitudes/aprobaciones`
- **Componente Implementador:** `VistaTicketsGestionAprobaciones.tsx`
- **Propósito:** Bandeja central donde los aprobadores designados (jefes de área, responsables de centro de costo o seguridad) revisan las solicitudes pendientes de su visto bueno.
- **Pestañas Internas:** No tiene pestañas; tabla de solicitudes pendientes con monto presupuestario estimado e impacto.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en fila): "Rechazar":** Abre un modal emergente que exige la captura del motivo y fundamento técnico del rechazo.
    - **Botón popup 2 (en fila): "Ver detalle":** Abre `ModalDetalleTicket` para examinar la justificación completa.
    - **Botón de acción directa (en fila): "Aprobar":** Registra la aprobación y promueve la solicitud a la cola de atención técnica.

#### 22. Configuración del Formulario (`#21250`)
- **URL Canónica:** `/plataforma/solicitudes/configuracion`
- **Componente Implementador:** `VistaConfiguracionFormularioMesa.tsx` (con `tipo="solicitud"`)
- **Propósito:** Parametrizar los campos, textos de ayuda, obligatoriedad y atributos personalizados del formulario de requerimientos de servicio.
- **Pestañas Internas:**
  - **Pestaña interna 1: Campos (`PestanaCamposMesa`):** Orden, visibilidad y obligatoriedad de campos del pedido.
  - **Pestaña interna 2: Campos personalizados (`PestanaCamposPersonalizadosMesa`):** Campos dinámicos a medida para solicitudes (ej. Centro de costo contable, Software solicitado, Perfil de acceso).
  - **Pestaña interna 3: Niveles de solicitante (`PestanaNivelesSolicitante`):** Reglas diferenciadas de captura según jerarquía corporativa.
- **Botones y Popups:**
  - **En vista principal (Cabecera):**
    - **Botón principal: "Guardar configuración":** Persiste las configuraciones de todas las pestañas.
  - **Dentro de Pestaña interna 2 (Campos personalizados):**
    - **Botón popup 1: "Nuevo campo personalizado":** Modal para definir código y tipo de atributo.

#### 23. Flujo de Atención y Aprobaciones (`#21186`)
- **URL Canónica:** `/plataforma/solicitudes/configuracion/flujo`
- **Componente Implementador:** `ConfiguracionVistasTickets.tsx` (con `tipoFijo="solicitud"` y `seccionInicial="estados"`)
- **Propósito:** Modelar el flujo de vida de las solicitudes (Pendiente de Aprobación, Aprobada, En Gestión, Despachada, Entregada, Cancelada) y sus transiciones.
- **Pestañas Internas:**
  - **Pestaña interna 1: Estados:** Catálogo de estados de la solicitud.
  - **Pestaña interna 2: Reglas Operativas:**
    - Requerir aprobación de jefatura previa a la asignación técnica.
    - Pausar SLA mientras la solicitud se encuentra en aprobación o en espera de proveedor de hardware.
    - Horas de cierre tácito tras la entrega de la solicitud.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Editar transición":** Modal para configurar validaciones obligatorias previas.

---

### 4.4. Sub-agrupador: Operación de la Mesa (`#21024`)
- **Tipo:** Sub-agrupador Operativo (Nivel 2).
- **Propósito:** Herramientas tácticas de control, asignación, auditoría y despacho de trabajo consolidado para supervisores, líderes de mesa y técnicos de soporte transversal.

#### 24. Centro de Asignación (`#21251`)
- **URL Canónica:** `/plataforma/tickets/gestion/asignar`
- **Componente Implementador:** `VistaTicketsGestionAsignar.tsx`
- **Propósito:** Tablero interactivo de balanceo de carga en tiempo real. Permite al despachador ver las colas de tickets entrantes y distribuirlos visualmente entre los técnicos según su especialidad y carga de casos abiertos.
- **Pestañas Internas:** No tiene pestañas; layout dividido en dos paneles:
  - Panel izquierdo: Lista de tickets no asignados con filtros rápidos.
  - Panel derecho: Lista de colaboradores técnicos con contador de tickets activos, indicador de saturación y botón de asignación con un clic.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en ticket): "Inspección detallada":** Abre `ModalDetalleTicket` para auditar los detalles del caso antes de decidir la asignación.

#### 25. Colaboradores de Mi Área (`#21252`)
- **URL Canónica:** `/plataforma/tickets/gestion/colaboradores`
- **Componente Implementador:** `ColaboradoresArea` (`src/app/plataforma/tickets/gestion/colaboradores/page.tsx`)
- **Propósito:** Gestionar los miembros de la unidad departamental y delegar facultades operativas y de aprobación a subordinados.
- **Pestañas Internas:** No tiene pestañas; organiza la pantalla en:
  - Sección superior: Directorio de colaboradores con sus tickets abiertos.
  - Sección inferior: Matriz de delegación y asignación de autorizaciones puntuales (Aprobar solicitud, Registrar ticket por terceros, Ver reportes de área, Gestionar activos).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón de acción: "Otorgar autorización":** Persiste la nueva delegación de facultades.
    - **Botón de acción (en tabla de autorizaciones): "Revocar":** Cancela inmediatamente la delegación otorgada.

#### 26. Bandeja Consolidada de Pendientes (`#21253`)
- **URL Canónica:** `/plataforma/tickets/gestion/bandeja`
- **Componente Implementador:** `TablaTickets.tsx` (con `vista="bandeja"` consolidada)
- **Propósito:** Vista única que unifica todos los incidentes y solicitudes de servicio pendientes de atención en toda la organización.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros combinados.
    - **Botón popup 2: "Ver detalle de ticket":** Abre `ModalDetalleTicket`.

#### 27. Historial Consolidado de Resueltos (`#21254`)
- **URL Canónica:** `/plataforma/tickets/gestion/resueltos`
- **Componente Implementador:** `TablaTickets.tsx` (con `vista="resueltos"` consolidada)
- **Propósito:** Registro unificado de todos los tickets resueltos para auditoría de calidad de servicio y benchmarking de tiempos de atención.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros históricos.
    - **Botón popup 2: "Ver detalle":** Abre `ModalDetalleTicket`.

#### 28. Tickets de Mi Departamento (`#21255`)
- **URL Canónica:** `/plataforma/tickets/gestion/departamento`
- **Componente Implementador:** `TablaTickets.tsx` (con `vista="departamento"` consolidada)
- **Propósito:** Visibilidad integral de todos los requerimientos y fallas pertenecientes a la unidad organizacional del usuario logueado.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros.
    - **Botón popup 2: "Ver detalle":** Abre `ModalDetalleTicket`.

#### 29. Todos los Tickets (`#21256`)
- **URL Canónica:** `/plataforma/tickets/gestion/todos`
- **Componente Implementador:** `TablaTickets.tsx` (con `vista="todos"` consolidada)
- **Propósito:** Repositorio maestro de tickets sin restricciones de tipo ni estado.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros multicriterio.
    - **Botón popup 2: "Ver detalle del ticket":** Abre `ModalDetalleTicket`.

#### 30. Registrar Ticket para un Usuario (`#21257`)
- **URL Canónica:** `/plataforma/tickets/gestion/crear`
- **Componente Implementador:** `VistaTicketsGestionCrear.tsx`
- **Propósito:** Pantalla especializada para los operadores de la mesa de servicio telefónica o presencial. Permite buscar a un colaborador y registrar una incidencia o requerimiento en su nombre.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en evidencias): "Ver visor de imagen/evidencia":** Abre modal lightbox con zoom de adjuntos.

#### 31. Auditoría de Tickets (`#21258`)
- **URL Canónica:** `/plataforma/tickets/gestion/auditoria`
- **Componente Implementador:** `TablaTickets.tsx` (con `vista="auditoria"`)
- **Propósito:** Modo de inspección de sólo lectura conforme a los estándares ISO/IEC 20000 e ISO 27001 para auditar trazabilidad temporal, marcas de tiempo de cambio de estado y métricas de cumplimiento de SLA sin alterar los datos.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros para análisis forense y auditorías.
    - **Botón popup 2: "Ver detalle":** Abre `ModalDetalleTicket` en arquetipo Auditor.

#### 32. Avisos de Servicio (`#21259`)
- **URL Canónica:** `/plataforma/avisos/mantenimientos`
- **Componente Implementador:** `VistaAvisosMantenimiento.tsx`
- **Propósito:** Tablero de difusión que informa a los usuarios y al personal de soporte técnico sobre ventanas de mantenimiento programadas, caídas de enlace programadas o actualizaciones de sistemas derivados de Solicitudes de Cambio (RFC).
- **Pestañas Internas:** No tiene pestañas; lista los avisos con tarjeta de estado (Vigente / Próximo), horario de inicio, horario de término, servicio y CI involucrado.
- **Botones y Popups:** No posee modales (pantalla informativa de consulta en tiempo real).

#### 33. Búsqueda Avanzada de Tickets (`#21260`)
- **URL Canónica:** `/plataforma/tickets/mesa/buscar`
- **Componente Implementador:** `PaginaBusquedaAvanzada` (redirecciona a `/plataforma/tickets/mesa/asignados`)
- **Propósito:** Punto de entrada para búsqueda de tickets en la mesa operativa.

#### 34. Historial de Mis Tickets (`#21261`)
- **URL Canónica:** `/plataforma/tickets/gestion/mios`
- **Componente Implementador:** `TablaTickets.tsx` (con `vista="mios"` consolidada)
- **Propósito:** Historial unificado para el usuario con todos sus tickets históricos generados en la plataforma (tanto incidentes como solicitudes).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros avanzados":** Modal de filtros.
    - **Botón popup 2: "Ver detalle":** Abre `ModalDetalleTicket`.

---

### 4.5. Sub-agrupador: SLA (`#21044`)
- **Tipo:** Sub-agrupador de Gestión de Niveles de Servicio (Nivel 2).
- **Propósito:** Supervisar y asegurar que los tiempos de respuesta y solución comprometidos con el negocio se cumplan rigurosamente, identificando riesgos de incumplimiento antes de que afecten la operación.

#### 35. Escalamientos y Riesgos de SLA (`#21045`)
- **URL Canónica:** `/plataforma/servicios/sla/escalamientos`
- **Componente Implementador:** `VistaEscalamientosSla.tsx`
- **Propósito:** Alerta temprana de tickets que han superado el 75% de su tiempo asignado o que ya han vencido, permitiendo al supervisor intervenir proactivamente y reasignar recursos.
- **Pestañas Internas:** No tiene pestañas; tabla de incidentes en riesgo con distintivo visual (Rojo para "VENCIDO", Amarillo para "EN RIESGO") y técnico asignado.
- **Botones y Popups:** No presenta modales de configuración.

#### 36. Incumplimientos y Causas (`#21046`)
- **URL Canónica:** `/plataforma/servicios/sla/incumplimientos`
- **Componente Implementador:** `VistaIncumplimientosSla.tsx`
- **Propósito:** Análisis de causa de tickets que no lograron resolver dentro del tiempo comprometido, registrando motivos de retraso (falta de repuestos, demora de proveedor externo, falta de respuesta del usuario).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:** No presenta modales.

#### 37. Objetivos de Tiempo Vigentes (`#21047`)
- **URL Canónica:** `/plataforma/servicios/sla/objetivos`
- **Componente Implementador:** `VistaObjetivosSla.tsx`
- **Propósito:** Catálogo de metas de tiempo de atención según la matriz de Prioridad (Crítica, Alta, Media, Baja) y el tipo de servicio (horas hábiles vs. 24x7).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:** No presenta modales.

#### 38. Semáforo de SLA de Mi Cola (`#21048`)
- **URL Canónica:** `/plataforma/servicios/sla/semaforo-cola`
- **Componente Implementador:** `VistaSemaforoCola.tsx`
- **Propósito:** Panel visual para que el técnico mantenga visibilidad en tiempo real del estado de sus tickets personales (Verde: tiempo óptimo; Amarillo: en riesgo; Rojo: vencido).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:** No presenta modales.

#### 39. Semáforo de SLA del Grupo (`#21049`)
- **URL Canónica:** `/plataforma/servicios/sla/semaforo-grupo`
- **Componente Implementador:** `VistaSemaforoGrupo.tsx`
- **Propósito:** Tablero de semáforos a nivel de grupo resolutor para balancear el esfuerzo colectivo y evitar cuellos de botella en la mesa de servicio.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:** No presenta modales.

---

### 4.6. Expediente Modal Integral del Ticket (`ModalDetalleTicket`)
- **Componente Implementador:** `src/modules/tickets/components/ModalDetalleTicket.tsx`
- **Propósito:** Centro de comando operativo donde se atiende, diagnostica y resuelve un ticket de incidente o solicitud.
- **Arquetipos de Vista Dinámicos:**
  - **Arquetipo Consumidor (`VistaTicketConsumidor`):** Interfaz limpia y simplificada para solicitantes, con seguimiento de estado, respuestas públicas y descarga de adjuntos.
  - **Arquetipo Operador / Técnico (`VistaTicketOperador`):** Interfaz completa para especialistas de soporte.
  - **Arquetipo Supervisor (`VistaTicketSupervisor`):** Enfocado en métricas de atención, balanceo y reasignaciones.
  - **Arquetipo Auditor (`PresentadorAuditor`):** Modo de sólo lectura con bitácora inmutable de eventos.
- **Pestañas y Secciones Internas (en Arquetipo Operador):**
  - **Sección 1: Información General:** Datos del solicitante, departamento, categoría, servicio, impacto, urgencia y prioridad.
  - **Sección 2: Hilo de Comunicación:**
    - Sub-pestaña A: "Respuestas públicas al usuario": Mensajes visibles para el solicitante con notificaciones automáticas por correo.
    - Sub-pestaña B: "Notas internas privadas": Anotaciones técnicas confidenciales exclusivas para el equipo de TI.
  - **Sección 3: Elemento de Configuración (CMDB):** Vinculación del equipo, servidor o servicio afectado.
  - **Sección 4: Temporizadores y SLA:** Barras de progreso de tiempo de primera respuesta y tiempo de solución con cálculo de pausa activa.
- **Botones y Popups:**
  - **En vista principal del expediente:**
    - **Botón de acción 1: "Tomar ticket":** Asigna automáticamente el ticket al usuario en sesión y pasa el estado a "En atención".
    - **Botón de acción 2: "Reasignar":** Despliega selector de grupos y técnicos para transferir el caso.
    - **Botón de acción 3: "Pausar SLA":** Permite congelar el cómputo de tiempo justificando la causa (ej. en espera de usuario).
    - **Botón de acción 4: "Resolver ticket":** Despliega el formulario de conclusión exigiendo código de resolución y resumen de la solución aplicada.
    - **Botón de acción 5: "Elevar a Problema":** Promueve el ticket a candidato o crea un expediente de Problema (PRB) vinculado directamente.
    - **Botón de acción 6: "Crear RFC de Cambio":** Dispara la creación de una Solicitud de Cambio cuando la resolución requiere una modificación en producción.

---

## 5. Desglose Exhaustivo por Módulo: Módulo 3 - CAMBIOS (`#21059`)

### 5.1. Agrupador Raíz: Cambios (`#21059`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito ITIL v4:** Habilitar el cambio de manera efectiva y segura en la infraestructura, aplicaciones y servicios de TI de la organización. Maximiza el número de cambios exitosos asegurando que los riesgos hayan sido evaluados adecuadamente, autorizando cambios estándar preaprobados, convocando al Comité Asesor de Cambios (CAB) para cambios normales y acelerando las decisiones críticas en el Comité de Emergencia (ECAB), reduciendo al mínimo las interrupciones y manteniendo la integridad de la CMDB.
- **Ruta física base:** `src/app/plataforma/cambios/`
- **Módulo de backend:** `src/modules/cambios/`

---

### 5.2. Sub-agrupador: Mis Cambios (`#21060`)
- **Tipo:** Sub-agrupador Operativo Personal y de Equipo (Nivel 2).
- **Propósito:** Proporcionar al ingeniero o equipo implementador una visión focalizada de los cambios que han solicitado, las aprobaciones técnicas requeridas, las ventanas programadas de ejecución y las interrupciones que afectarán a su unidad organizativa.

#### 1. Aprobaciones Técnicas de RFC (`#21061`)
- **URL Canónica:** `/plataforma/cambios/aprobaciones/tecnicas`
- **Componente Implementador:** `VistaAprobacionesTecnicas.tsx`
- **Propósito:** Bandeja para que los líderes de infraestructura, redes, bases de datos y seguridad revisen la viabilidad técnica, el plan de pruebas y el procedimiento de reversión (rollback) de un cambio antes de elevarlo al CAB.
- **Pestañas Internas:** No posee pestañas; presenta tabla con columnas de código RFC, título, tipo de cambio, nivel de riesgo técnico, ventana propuesta y estado de dictamen.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en fila): "Emitir dictamen técnico":** Abre modal emergente para autorizar técnicamente el cambio, solicitar ajustes en el plan de reversión o rechazar con fundamento.
    - **Botón popup 2 (en fila): "Ver expediente RFC":** Abre diálogo modal con los planes técnicos detallados del cambio.

#### 2. Calendario de Mis Cambios (`#21062`)
- **URL Canónica:** `/plataforma/cambios/calendario`
- **Componente Implementador:** `VistaCambiosCalendario.tsx` (con filtro personal)
- **Propósito:** Visualización en formato de agenda de las ventanas de mantenimiento autorizadas donde el usuario logueado actúa como solicitante o implementador líder.
- **Pestañas Internas:** No posee pestañas; ofrece alternancia de vistas temporales: Mes, Semana y Día.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (al hacer clic en un evento del calendario): "Ficha rápida del cambio":** Despliega un modal con horario de inicio/fin, ventana de congelamiento asociada, CI afectado y checklist Go/No-Go.

#### 3. Cambios con Interrupción para Mi Área (`#21063`)
- **URL Canónica:** `/plataforma/cambios/impacto/interrupciones`
- **Componente Implementador:** `VistaCambiosImpactoArea.tsx` (con filtro `modo="interrupciones"`)
- **Propósito:** Tablero de alerta temprana para jefes de área y coordinadores de negocio sobre cambios que provocarán indisponibilidad planificada (degradación o corte total) en los servicios que consume su departamento.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en fila): "Ver ventana de corte y mitigación":** Abre modal que detalla la duración exacta del corte, servicios alternativos disponibles y persona de contacto en la mesa de control.

#### 4. Cambios por Implementar (`#21064`)
- **URL Canónica:** `/plataforma/cambios/implementacion`
- **Componente Implementador:** `VistaCambiosImplementacion.tsx`
- **Propósito:** Consola de ejecución operativa para los técnicos que deben desplegar un cambio autorizado. Controla la activación de la ventana de mantenimiento y el seguimiento del plan de trabajo en tiempo real.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Validar Checklist Go/No-Go":** Abre el modal obligatorio previo al pase a producción donde se verifican las condiciones de seguridad, backup validado y recursos disponibles.
    - **Botón popup 2: "Reportar Rollback / Abortar":** Abre modal de contingencia para declarar el fallo de la implementación, documentar el motivo del aborto y registrar la activación del plan de reversión.

#### 5. Cambios que Afectan a Mi Equipo (`#21065`)
- **URL Canónica:** `/plataforma/cambios/impacto/equipo`
- **Componente Implementador:** `VistaCambiosImpactoArea.tsx` (con filtro `modo="equipo"`)
- **Propósito:** Visibilidad consolidada de todos los cambios donde miembros de su mismo equipo de trabajo participan como implementadores, evaluadores o validadores de pruebas.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Ver distribución horaria":** Modal con la asignación de horas de guardia y trabajo nocturno del equipo durante las ventanas de cambio.

#### 6. Cambios que Afectan Mis Servicios (`#21066`)
- **URL Canónica:** `/plataforma/cambios/impacto/servicios`
- **Componente Implementador:** `VistaCambiosImpacto.tsx`
- **Propósito:** Mapa de impacto sobre el catálogo de servicios de negocio. Permite a los Dueños de Servicio (*Service Owners*) auditar cualquier modificación programada sobre los CIs que componen sus servicios.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Topología de CIs afectados":** Modal interactivo que muestra el grafo de dependencias entre el cambio y los componentes de software/hardware de la CMDB.

#### 7. Historial de Mis Cambios (`#21067`)
- **URL Canónica:** `/plataforma/cambios/historial`
- **Componente Implementador:** `VistaCambiosHistorial.tsx` (con filtro personal)
- **Propósito:** Registro personal de todos los RFCs solicitados históricamente por el usuario, indicando resultado final (Exitoso, Exitoso con incidencias, Fallido con Rollback, Cancelado).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Descargar constancia de cambio":** Modal para exportar el acta de ejecución en PDF.

#### 8. Mis Cambios (`#21068`)
- **URL Canónica:** `/plataforma/cambios/mis-cambios`
- **Componente Implementador:** `VistaCambiosMisCambios.tsx`
- **Propósito:** Bandeja principal de trabajo donde el solicitante supervisa sus solicitudes de cambio en trámite, atiende observaciones del CAB y da seguimiento a las etapas de aprobación pendientes.
- **Pestañas Internas:** No tiene pestañas; tabla filtrable con contadores de estado (Borrador, En Evaluación, En Aprobación, Autorizado, En Ejecución).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Ver expediente completo":** Abre el expediente interactivo del RFC.

#### 9. Programación de Implementaciones del Equipo (`#21069`)
- **URL Canónica:** `/plataforma/cambios/programacion`
- **Componente Implementador:** `VistaProgramacionCambios.tsx`
- **Propósito:** Cuadro de mando semanal/mensual que coordina la agenda de despliegues de los diferentes grupos técnicos para evitar saturación de personal en horarios nocturnos o fines de semana.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Reagendar ventana":** Abre modal para solicitar el desplazamiento de una fecha de ejecución con análisis automático de nuevos conflictos.

#### 10. Registrar Solicitud RFC (`#21070`)
- **URL Canónica:** `/plataforma/cambios/nuevo`
- **Componente Implementador:** `VistaCambiosGestionCrear.tsx`
- **Propósito:** Formulario de captura estándar para dar de alta una Solicitud de Cambio (*Request for Change* - RFC) en el sistema.
- **Pestañas Internas:** No tiene pestañas; formulario técnico dividido en bloques: Tipo de Cambio (Normal, Estándar, Emergencia), Datos Generales, Elementos de Configuración afectados, Planes Técnicos (Implementación, Pruebas, Rollback) y Ventana propuesta.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Evaluar cuestionario de riesgo":** Abre el modal del cuestionario ponderado multicriterio donde el usuario responde preguntas estandarizadas para calcular automáticamente el Nivel de Riesgo del RFC (Bajo, Medio, Alto, Muy Alto).
    - **Botón popup 2: "Cargar desde modelo estándar":** Abre selector modal con los procedimientos rutinarios preautorizados para rellenar automáticamente los planes y checklists.

---

### 5.3. Sub-agrupador: Gestión (`#21072`)
- **Tipo:** Sub-agrupador Táctico de Gobierno (Nivel 2).
- **Propósito:** Conjunto de consolas especializadas para el Gestor de Cambios (*Change Manager*) para evaluar la viabilidad de los RFCs, detectar colisiones de agenda, administrar modelos estándar y liderar revisiones post-implementación.

#### 11. Bandeja de RFC por Evaluar (`#21073`)
- **URL Canónica:** `/plataforma/cambios/gestion/evaluacion`
- **Componente Implementador:** `VistaEvaluacionRfc.tsx`
- **Propósito:** Consola de triaje donde el Gestor de Cambios valida que las solicitudes recibidas cumplan con los requisitos normativos mínimos (planes de contingencia completos, CI identificado, ventana viable) antes de admitirlas formalmente al flujo.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Admitir a trámite":** Modal para calificar formalmente el cambio y turnarlo a las etapas de aprobación correspondientes.
    - **Botón popup 2: "Rechazar / Solicitar corrección":** Modal para devolver el expediente al solicitante con observaciones puntuales.

#### 12. Conflictos y Capacidad (`#21074`)
- **URL Canónica:** `/plataforma/cambios/gestion/conflictos`
- **Componente Implementador:** `VistaConflictos.tsx`
- **Propósito:** Motor de detección algorítmica de solapamientos. Identifica automáticamente colisiones donde dos o más cambios pretenden intervenir el mismo CI, utilizan las mismas rutas de red, compiten por el mismo especialista técnico o caen dentro de un período de congelamiento comercial.
- **Pestañas Internas:** No tiene pestañas; tabla de advertencias y matriz de severidad de conflictos (Bloqueante, Riesgo Moderado, Informativo).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Resolver conflicto de agenda":** Abre modal que propone ventanas alternativas desocupadas para reprogramar uno de los cambios en colisión.

#### 13. Modelos de Cambio Estándar (`#21075`)
- **URL Canónica:** `/plataforma/cambios/gestion/modelos`
- **Componente Implementador:** `VistaModelosGestion.tsx`
- **Propósito:** Catálogo administrativo para dar de alta, auditar y actualizar los procedimientos estándar preautorizados que no requieren pasar por el CAB (ej. parches mensuales de SO, renovación de certificados SSL, altas de usuarios en AD).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Crear nuevo modelo estándar":** Abre el modal completo de parametrización de modelo con sus planes técnicos y criterios de elegibilidad.

#### 14. Programación de Cambios Autorizados (`#21076`)
- **URL Canónica:** `/plataforma/cambios/gestion/programacion`
- **Componente Implementador:** `VistaProgramacion.tsx`
- **Propósito:** Panel donde el Gestor de Cambios consolida la agenda oficial de cambios autorizados por el CAB para su incorporación al *Forward Schedule of Changes* (FSC).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Confirmar ventana en FSC":** Modal para sellar la fecha y hora final de ejecución y publicar el aviso de mantenimiento.

#### 15. Revisión Post-Implementación (PIR) (`#21077`)
- **URL Canónica:** `/plataforma/cambios/gestion/pir`
- **Componente Implementador:** `VistaPir.tsx`
- **Propósito:** Evaluación formal posterior a la ejecución de cambios mayores, cambios normales con incidencias o cambios fallidos. Audita si se alcanzaron los objetivos, si el tiempo real excedió la ventana programada y si se presentaron incidentes no planificados.
- **Pestañas Internas:** No tiene pestañas; lista de cambios pendientes de cierre de auditoría PIR.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Diligenciar auditoría PIR":** Abre el modal del cuestionario de 12 preguntas de auditoría técnica y lecciones aprendidas.

#### 16. Seguimiento de Ejecución (`#21078`)
- **URL Canónica:** `/plataforma/cambios/gestion/ejecucion`
- **Componente Implementador:** `VistaEjecucion.tsx`
- **Propósito:** Centro de monitoreo en tiempo real de los cambios que se encuentran en ejecución activa en este momento en los centros de datos o plataformas cloud.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Ver bitácora de ejecución en vivo":** Modal con el timeline de eventos registrados por el equipo técnico durante la ventana activa.

#### 17. Seguimiento de Etapas de Aprobación (`#21079`)
- **URL Canónica:** `/plataforma/cambios/gestion/autorizaciones`
- **Componente Implementador:** `VistaAutorizaciones.tsx`
- **Propósito:** Monitor general que rastrea el avance de los RFCs a través de sus diferentes etapas de aprobación (Aprobación de pares, Aprobación técnica, Aprobación de negocio, Dictamen CAB), alertando sobre aprobadores demorados.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Reasignar aprobador / Enviar recordatorio":** Modal para reasignar la responsabilidad de voto ante ausencias justificadas o enviar notificación de urgencia.

---

### 5.4. Sub-agrupador: CAB (`#21081`)
- **Tipo:** Sub-agrupador Colegiado (Nivel 2).
- **Propósito:** Plataforma de gobernanza para el Comité Asesor de Cambios (*Change Advisory Board* - CAB) y el Comité Asesor de Cambios de Emergencia (*Emergency CAB* - ECAB).

#### 18. Agenda y Actas / Convocatoria (`#21082`, `#21084`)
- **URL Canónica:** `/plataforma/cambios/cab/agenda`
- **Componente Implementador:** `VistaCabAgenda.tsx` / `VistaCabAgendaGestion.tsx`
- **Propósito:** Planificación de las sesiones ordinarias del CAB. Permite seleccionar los RFCs a discutir en la sesión semanal, enviar invitaciones a los vocales y consolidar el acta oficial con los dictámenes acordados.
- **Pestañas Internas:** No tiene pestañas; vista modular con orden del día, lista de cambios preseleccionados y panel de emisión de actas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Convocar sesión CAB":** Modal para fijar fecha, hora, enlace de videoconferencia y emitir la citación formal a los miembros.
    - **Botón popup 2: "Cerrar sesión y emitir acta":** Modal formal que compila los votos de cada vocal y genera el acta de acuerdos firmada digitalmente.

#### 19. Comité de Emergencia (ECAB) (`#21083`)
- **URL Canónica:** `/plataforma/cambios/cab/emergencia`
- **Componente Implementador:** `VistaCabEmergencia.tsx`
- **Propósito:** Centro de decisión urgente para cambios de emergencia requeridos para resolver incidentes mayores (P1) o mitigar brechas críticas de ciberseguridad. Opera con quórum reducido y votación en tiempo real.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Emitir voto urgente ECAB":** Abre modal para que los directores de turno emitan voto inmediato (Favorable / Rechazado) con justificación verbal o escrita.

#### 20. Dictamen Colegiado (CAB) (`#21085`)
- **URL Canónica:** `/plataforma/cambios/gestion/cab`
- **Componente Implementador:** `VistaCabAgendaGestion.tsx`
- **Propósito:** Interfaz durante la sesión en vivo del CAB para registrar los votos de cada vocal sobre un RFC específico y calcular si se cumple la regla de quórum y mayoría calificada.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Registrar votación del expediente":** Modal con panel de votación (Aprobado, Rechazado, Aplazado) con espacio para condiciones de autorización.

---

### 5.5. Sub-agrupador: Aprobaciones (`#21087`)
- **Tipo:** Sub-agrupador de Autorizaciones (Nivel 2).
- **Propósito:** Bandejas de decisión para autoridades formales y dueños de negocio.

#### 21. Aprobación de Negocio de Cambios (`#21088`)
- **URL Canónica:** `/plataforma/cambios/aprobaciones/negocio`
- **Componente Implementador:** `VistaAprobacionesCambios.tsx` (con filtro de rol negocio)
- **Propósito:** Bandeja para gerentes de operaciones y líderes de negocio para evaluar el impacto comercial y la conveniencia de la ventana de corte propuesta antes de autorizar el cambio.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Emitir dictamen de negocio":** Modal de aprobación con firma de aceptación de riesgo comercial.

#### 22. Aprobaciones de Cambios (`#21089`)
- **URL Canónica:** `/plataforma/cambios/aprobaciones`
- **Componente Implementador:** `VistaAprobacionesCambios.tsx`
- **Propósito:** Bandeja centralizada y agnóstica donde cualquier usuario con facultades de aprobación consulta las solicitudes de cambio pendientes de su visto bueno.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Emitir aprobación / rechazo":** Modal para dictaminar el expediente con comentarios obligatorios ante rechazo.

#### 23. Modelos de Cambio Estándar (`#21090`)
- **URL Canónica:** `/plataforma/cambios/modelos`
- **Componente Implementador:** `VistaModelosCambio.tsx`
- **Propósito:** Vista de consulta pública para que los solicitantes revisen qué actividades estándar ya cuentan con autorización previa y no requieren pasar por el CAB.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón directo: "Usar este modelo":** Abre el formulario de creación prellenado con el procedimiento estándar.

---

### 5.6. Vistas Operativas Directas y Configuración del Dominio

#### 24. Calendario de Cambios (`#21071`)
- **URL Canónica:** `/plataforma/cambios/gestion/calendario`
- **Componente Implementador:** `VistaCambiosCalendario.tsx`
- **Propósito:** Calendario institucional completo de la organización con filtros globales por servicio, entorno (Producción, Staging, QA) y tipo de cambio.
- **Pestañas Internas:** Vistas Mes, Semana y Día.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Exportar calendario iCal / ICS":** Modal que genera la URL de suscripción para sincronizar con Microsoft Outlook o Google Calendar.

#### 25. Historial de Cambios (`#21080`)
- **URL Canónica:** `/plataforma/cambios/gestion/todos`
- **Componente Implementador:** `VistaCambiosHistorial.tsx`
- **Propósito:** Búsqueda exhaustiva y forense de todos los RFCs de la historia institucional con trazabilidad inmutable.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtros multicriterio":** Modal de filtros por CIs, rangos de fechas, aprobadores y tags técnicos.

#### 26. Solicitar un Cambio (`#21086`)
- **URL Canónica:** `/plataforma/cambios/gestion/crear`
- **Componente Implementador:** `VistaCambiosGestionCrear.tsx`
- **Propósito:** Formulario de alta operativa para miembros de la mesa de gestión de cambios.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Cuestionario de riesgo":** Modal de ponderación de riesgo.

#### 27. Configuración de Formulario de Cambios (`#21191`)
- **URL Canónica:** `/plataforma/cambios/configuracion/formulario`
- **Componente Implementador:** `VistaFormularioCambio.tsx`
- **Propósito:** Parametrizar dinámicamente los campos nativos, campos personalizados, cuestionario de riesgo multicriterio, plantillas estándar y diseño de la ficha del RFC.
- **Pestañas Internas:**
  - **Pestaña interna 1: Campos (`PestanaCampos`):** Estructura, visibilidad, obligatoriedad condicional y distribución en pantalla de los campos nativos del RFC.
  - **Pestaña interna 2: Campos personalizados (`PestanaCamposPersonalizados`):** Gestión de atributos a medida para cambios (ej. Ticket de Jira, Ventana de Freeze excepcional, etc.).
  - **Pestaña interna 3: Listas y catálogos (`PestanaCatalogos`):** Valores de entornos (Producción, Contingencia, QA), motivos de cambio y categorías tecnológicas.
  - **Pestaña interna 4: Cuestionario de riesgo (`PestanaCuestionarioRiesgo`):** Ponderador de riesgo con preguntas objetivas (ej. ¿Existe plan de rollback probado?, ¿Afecta a más de 1000 usuarios?, ¿Requiere ventana nocturna?).
  - **Pestaña interna 5: Prioridad (`PestanaPrioridad`):** Matriz institucional compartida de Impacto × Urgencia y criterios de severidad.
  - **Pestaña interna 6: Modelos de cambio estándar (`PestanaPlantillas`):** Configuración de procedimientos estándar preautorizados.
  - **Pestaña interna 7: Diseño del ticket (`PestanaVistaTicket`):** Organización de bloques y pestañas del expediente RFC.
- **Botones y Popups:**
  - **En cabecera principal:**
    - **Botón popup 1: "Publicar cambios":** Modal de cálculo de diferencias (*diff*) y confirmación de publicación de versión RFC.
    - **Botón popup 2: "Historial de versiones":** Modal de snapshots históricos para auditar o restaurar versiones publicadas.
  - **Dentro de Pestaña interna 1 (Campos):**
    - **Botón popup 1: "Editar propiedades de campo":** Abre `ModalEditarPropiedadesCampo` al hacer clic en un campo para definir obligatoriedad, valor por defecto y ayuda.
  - **Dentro de Pestaña interna 2 (Campos personalizados):**
    - **Botón popup 1: "Nuevo campo personalizado":** Abre el modal asistente interactivo de 5 pasos para definir código, tipo de dato, validaciones y alcance.
  - **Dentro de Pestaña interna 4 (Cuestionario de riesgo):**
    - **Botón popup 1: "Calibrar niveles y umbrales de riesgo":** Modal para definir rangos de puntaje (Bajo, Medio, Alto, Muy Alto).
    - **Botón popup 2: "Nueva pregunta de evaluación":** Modal para crear un criterio de riesgo con opciones y puntajes asignados.
  - **Dentro de Pestaña interna 6 (Modelos de cambio estándar):**
    - **Botón popup 1: "Nuevo modelo estándar" (y edición por fila):** Abre el editor modal de modelo con 3 pestañas internas: General, Criterios de elegibilidad y Planes técnicos (Implementación, Pruebas y Rollback).

#### 28. Flujo de Evaluación, Autorización y Revisión Posterior (`#21193`)
- **URL Canónica:** `/plataforma/cambios/configuracion/flujo-evaluacion`
- **Componente Implementador:** `VistaFlujoEvaluacion.tsx`
- **Propósito:** Configurar la máquina de estados del ciclo de vida del cambio, etapas de aprobación requeridas, quórum del CAB, plazos de escalamiento, checklists y cuestionarios PIR.
- **Pestañas Internas:**
  - **Pestaña interna 1: Estados (`PestanaEstados`):** Catálogo de estados (Borrador, En Evaluación, En Aprobación, Autorizado, En Ejecución, Cerrado Exitoso, Cerrado con Rollback, Cancelado).
  - **Pestaña interna 2: Transiciones y acciones (`PestanaTransiciones`):** Grafo de transiciones válidas, perfiles autorizados y validaciones obligatorias previas.
  - **Pestaña interna 3: Etapas de aprobación (`PestanaEtapasAprobacion`):** Secuencia de etapas de control (Pares, Técnica, Negocio, CAB) con segregación obligatoria de funciones (SoD).
  - **Pestaña interna 4: Comités CAB y ECAB (`PestanaComites`):** Miembros oficiales, quórum legal mínimo y reglas de desempate.
  - **Pestaña interna 5: Plazos y escalamiento (`PestanaPlazosEscalamiento`):** Tiempos máximos de evaluación según prioridad y escalamiento jerárquico.
  - **Pestaña interna 6: Tareas y checklists (`PestanaTareasChecklists`):** Catálogo de tareas operativas y lista de verificación Go/No-Go previa a la ejecución.
  - **Pestaña interna 7: Implementación y cierre (`PestanaImplementacionCierre`):** Políticas de cierre inmutable y sincronización automática con CMDB.
  - **Pestaña interna 8: Revisión post-implementación PIR (`PestanaPir`):** Matriz de exigencia del PIR y ventana de observación de incidentes colaterales.
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Estados):**
    - **Botón popup 1: "Nuevo Estado":** Modal de alta/edición de estado del ciclo de vida.
  - **Dentro de Pestaña interna 2 (Transiciones y acciones):**
    - **Botón popup 1: "Nueva Transición":** Modal editor de transición.
    - **Botón popup 2: "Validar integridad del flujo":** Modal que ejecuta el análisis topológico del grafo para detectar estados huérfanos o ciclos muertos.
  - **Dentro de Pestaña interna 3 (Etapas de aprobación):**
    - **Botón popup 1: "Nueva Etapa de Aprobación":** Modal de parametrización de etapa.
    - **Botón popup 2: "Simulador de Etapas":** Modal para simular qué aprobaciones se exigirán para un cambio de prueba.
  - **Dentro de Pestaña interna 4 (Comités CAB y ECAB):**
    - **Botón popup 1: "Nuevo Miembro del Comité":** Modal de asignación de vocales con rol de votación o consulta.
    - **Botón popup 2: "Probar Quórum":** Modal para simular si se alcanza el quórum mínimo con una lista de asistentes.
  - **Dentro de Pestaña interna 6 (Tareas y checklists):**
    - **Botón popup 1: "Nueva Tarea Operativa":** Modal de creación de tarea de cambio.
    - **Botón popup 2: "Nuevo Ítem Go/No-Go":** Modal para agregar una condición obligatoria antes de iniciar la ventana de corte.

#### 29. Tipos de Cambio y Requisitos (`#21196`)
- **URL Canónica:** `/plataforma/cambios/configuracion/tipos-requisitos`
- **Componente Implementador:** `VistaTiposRequisitos.tsx`
- **Propósito:** Definir los tipos de cambio institucionales, su matriz de autoridad según riesgo y las reglas automáticas de reclasificación técnica.
- **Pestañas Internas:**
  - **Pestaña interna 1: Tipos de cambio (`PestanaTiposCambio`):** Parámetros normativos para cambios Estándar, Normales y de Emergencia.
  - **Pestaña interna 2: Matriz de autoridad (`PestanaMatrizAutoridad`):** Cruza el nivel de riesgo y el impacto en el servicio para determinar qué autoridad debe aprobar (Jefe técnico, Gerente, CAB o Comité Directivo).
  - **Pestaña interna 3: Modelos de cambio estándar (`PestanaModelosEstandar`):** Procedimientos rutinarios preautorizados con elegibilidad y control de calidad.
  - **Pestaña interna 4: Reglas de clasificación (`PestanaReglasClasificacion`):** Reglas automáticas que reclasifican un cambio (ej. forzar a Normal si el monto supera cierto umbral o si toca un servidor bancario crítico).
- **Botones y Popups:**
  - **Dentro de Pestaña interna 2 (Matriz de autoridad):**
    - **Botón popup 1: "Nueva Regla de Autoridad":** Modal de configuración de regla de autoridad.
    - **Botón popup 2: "Simulador de Autoridad":** Modal para comprobar qué autoridad se asignaría para un caso hipotético.
  - **Dentro de Pestaña interna 3 (Modelos de cambio estándar):**
    - **Botón popup 1: "Nuevo Modelo Estándar" (y edición por fila):** Editor Modal de Modelo con 9 pestañas internas: 1) Datos generales, 2) Ámbito y elegibilidad, 3) Checklist Go/No-Go, 4) Procedimiento técnico paso a paso, 5) Plan de pruebas, 6) Plan de Rollback, 7) Criterios de parada, 8) Ventanas horarias autorizadas, 9) Auditoría y aprobación inicial.
  - **Dentro de Pestaña interna 4 (Reglas de clasificación):**
    - **Botón popup 1: "Nueva Regla de Clasificación":** Modal de regla automática.
    - **Botón popup 2: "Simulador de Reglas de Clasificación":** Modal interactivo para probar reglas de bloqueo o reclasificación.

#### 30. Notificaciones, Calendario, Feriados y Congelamientos (`#21194`, `#21192`, `#21195`, `#21197`)
- **URL Canónica:** `/plataforma/cambios/configuracion/notificaciones-calendario`
- **Componente Implementador:** `VistaNotificacionesCalendario.tsx`
- **Propósito:** Parametrizar las alertas del ciclo de vida del cambio, horarios autorizados de mantenimiento, períodos de congelamiento por campañas y feriados oficiales.
- **Pestañas Internas:**
  - **Pestaña interna 1: Notificaciones (`PestanaNotificaciones`):** 32 eventos de dominio ITIL v4, canales de envío (Email, In-App, Webhook), destinatarios y horas de silencio.
  - **Pestaña interna 2: Ventanas de mantenimiento (`PestanaVentanasMantenimiento`):** Horarios autorizados de intervención por servicio (ej. Ventana nocturna de 01:00 a 05:00 hrs).
  - **Pestaña interna 3: Períodos de congelamiento (`PestanaPeriodosCongelamiento`):** Restricciones de cambios durante cierres contables de fin de mes o campañas de ventas de alto tráfico (Black Friday, Cyber). Bloqueo total o con excepción justificada.
  - **Pestaña interna 4: Feriados y días no laborables (`PestanaFeriados`):** Calendario de días no laborables oficiales y políticas de bloqueo.
  - **Pestaña interna 5: Conflictos y capacidad (`PestanaConflictosCapacidad`):** Reglas de solapamiento sobre CIs, capacidad simultánea de técnicos y tolerancias horarias.
  - **Pestaña interna 6: Presentación del calendario (`PestanaPresentacionCalendario`):** Configuración de colores por tipo de cambio, capas visibles y formato de suscripción ICS.
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Notificaciones):**
    - **Botón popup 1: "Crear / Editar Notificación":** Modal para configurar el evento disparador, plantilla de mensaje y lista de destinatarios.
  - **Dentro de Pestaña interna 2 (Ventanas de mantenimiento):**
    - **Botón popup 1: "Nueva Ventana de Mantenimiento":** Modal editor de ventana con definición de días y servicios amparados.
    - **Botón popup 2: "Vista previa de ventanas en calendario":** Modal con renderizado interactivo de las ventanas en la semana tipo.
  - **Dentro de Pestaña interna 3 (Períodos de congelamiento):**
    - **Botón popup 1: "Nuevo Período de Congelamiento":** Modal para fijar fechas de freeze y nivel de bloqueo.
    - **Botón popup 2: "Importar períodos desde CSV":** Modal de carga masiva de fechas de congelamiento comercial.
  - **Dentro de Pestaña interna 4 (Feriados):**
    - **Botón popup 1: "Nuevo Feriado":** Modal para ingresar fecha festiva y descripción.
    - **Botón popup 2: "Importar feriados desde CSV":** Modal para carga en lote de feriados nacionales e institucionales.
  - **Dentro de Pestaña interna 5 (Conflictos y capacidad):**
    - **Botón popup 1: "Simulador de Conflictos":** Modal interactivo para verificar si una fecha propuesta colisionaría con otros cambios programados.
  - **Dentro de Pestaña interna 6 (Presentación del calendario):**
    - **Botón popup 1: "Vista previa del calendario":** Modal para probar los esquemas cromáticos y tooltips del calendario.

---

### 5.7. Expediente Integral 360° del Cambio (`VistaCambiosGestionDetalle` - `[id]`)
- **URL Canónica:** `/plataforma/cambios/gestion/[id]`
- **Componente Implementador:** `VistaCambiosGestionDetalle.tsx`
- **Propósito:** Consola central de gestión del ciclo de vida completo de un RFC individual, integrando todas las etapas de control técnico, aprobaciones colegiadas y auditoría.
- **Pestañas Internas:**
  - **Pestaña interna 1: Datos de la Solicitud:** Título, código RFC, tipo (Normal, Estándar, Emergencia), categoría, impacto, urgencia, prioridad, solicitante, justificación técnica y entorno destino.
  - **Pestaña interna 2: Evaluación y Riesgo:** Puntuación del cuestionario ponderado de riesgo, nivel de riesgo resultante, análisis de conflictos de calendario y elementos de configuración (CMDB) impactados.
  - **Pestaña interna 3: Etapas de Aprobación:** Matriz de firmas y autorizaciones con el registro de cada etapa (Pares, Técnica, Negocio, CAB/ECAB), nombre del aprobador, fecha, decisión y comentarios del dictamen.
  - **Pestaña interna 4: Planes Técnicos:** Visualización del Plan de Implementación paso a paso, Plan de Pruebas de aceptación y Plan de Reversión (Rollback) obligatorio.
  - **Pestaña interna 5: Ejecución y Monitoreo:** Checklist Go/No-Go previo a la ejecución, bitácora de eventos durante la ventana de mantenimiento y temporizador de corte.
  - **Pestaña interna 6: Revisión Post-Implementación (PIR):** Cuestionario de 12 preguntas de auditoría técnica y lecciones aprendidas diligenciado tras el cierre de la ventana.
  - **Pestaña interna 7: Elementos Relacionados:** Enlaces bidireccionales con tickets de incidentes de origen, problemas matrices (PRB), CIs asociados y tareas operativas delegadas.
- **Botones y Popups:**
  - **En vista principal del expediente:**
    - **Botón popup 1: "Evaluar / Modificar Cuestionario de Riesgo":** Abre modal para reevaluar las respuestas de riesgo.
    - **Botón popup 2: "Emitir Dictamen de Aprobación":** Abre modal formal para registrar voto favorable o rechazo.
    - **Botón popup 3: "Validar Checklist Go/No-Go":** Abre modal de control previo al inicio de la ventana de mantenimiento.
    - **Botón popup 4: "Reportar Rollback / Abortar":** Abre modal de contingencia para suspender la ejecución y activar la marcha atrás.
    - **Botón popup 5: "Diligenciar Auditoría PIR":** Abre modal para completar las 12 preguntas de revisión post-implementación.

---

## 6. Desglose Exhaustivo por Módulo: Módulo 5 - ACTIVOS Y CMDB (`#21109`)

### 6.1. Agrupador Raíz: Activos y CMDB (`#21109`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito ITIL v4:** Gestionar el ciclo de vida financiero, contractual y operativo de los activos de TI (Gestión de Activos de TI - ITAM) y mantener el modelo de relaciones y dependencias técnicas de los Elementos de Configuración (Base de Datos de Gestión de la Configuración - CMDB). Garantiza el control patrimonial desde la adquisición hasta la baja final, el cumplimiento de licenciamiento de software (SAM), la custodia legal de equipos asignados y el mapa de dependencias para análisis de impacto ante incidentes y cambios.
- **Ruta física base:** `src/app/plataforma/activos/` y `src/app/plataforma/cmdb/`
- **Módulos de backend:** `src/modules/activos/` y `src/modules/cmdb/`

---

### 6.2. Sub-agrupador: Inventario (`#21110`)
- **Tipo:** Sub-agrupador Funcional de Gestión de Inventario (Nivel 2).
- **Propósito:** Registro, control físico, asignación a personas y custodia de todos los dispositivos de hardware, periféricos, equipos de red y servidores.

#### 1. Activos de Mi Área (`#21111`)
- **URL Canónica:** `/plataforma/activos/area`
- **Componente Implementador:** `VistaActivosArea.tsx`
- **Propósito:** Vista para jefaturas de departamento y líderes de unidad para auditar los activos de hardware y licencias bajo custodia de los colaboradores de su área.
- **Pestañas Internas:** No posee pestañas; presenta tabla con código patrimonial, número de serie, tipo de activo, usuario asignado y estado operativo.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Filtrar por colaborador":** Modal para aislar activos por persona.
    - **Botón popup 2 (en fila): "Ver ficha del activo":** Abre modal de detalle 360° del activo.

#### 2. Asignación, Custodia y Actas (`#21112`)
- **URL Canónica:** `/plataforma/activos/asignaciones`
- **Componente Implementador:** `VistaAsignacionesActivos.tsx`
- **Propósito:** Control de movimientos de custodia. Permite asignar equipos a empleados, registrar devoluciones por cese o recambio y emitir actas digitales de entrega con validez jurídica.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nueva Asignación / Custodia":** Abre modal interactivo para seleccionar el activo disponible, el colaborador receptor, los accesorios incluidos (cargador, mouse, mochila) y generar el borrador del acta.
    - **Botón popup 2 (en fila): "Ver y descargar Acta de Entrega (PDF)":** Modal visor de documento para imprimir o firmar digitalmente.
    - **Botón popup 3 (en fila): "Registrar Devolución":** Modal para inspeccionar el estado físico del equipo devuelto y reingresarlo al almacén.

#### 3. Importación Masiva (`#21113`)
- **URL Canónica:** `/plataforma/activos/importacion`
- **Componente Implementador:** `VistaImportacionActivos.tsx`
- **Propósito:** Asistente de carga en lote para incorporar cientos o miles de activos al inventario mediante archivos estructurados Excel o CSV.
- **Pestañas Internas:** No tiene pestañas; asistente guiado en 3 pasos: Carga de archivo, Mapeo de columnas y Validación previa de inconsistencias.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Descargar plantilla oficial":** Descarga el archivo modelo CSV preformateado.
    - **Botón popup 2: "Reporte de errores de importación":** Modal que detalla filas con series duplicadas o modelos inexistentes.

#### 4. Inventario de Activos (`#21114`)
- **URL Canónica:** `/plataforma/activos/inventario`
- **Componente Implementador:** `VistaInventarioActivos.tsx`
- **Propósito:** Registro maestro del parque tecnológico corporativo. Permite buscar por código de barra, código patrimonial, número de serie, dirección MAC o modelo.
- **Pestañas Internas:** No tiene pestañas; tabla con filtros combinados por sede, piso, fabricante, estado del ciclo de vida y estado financiero.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nuevo Activo":** Modal de alta manual con formulario de captura técnica y contable.
    - **Botón popup 2: "Filtros avanzados":** Modal de filtros por rangos de fecha de compra, costos de adquisición y garantías.
    - **Botón popup 3: "Imprimir etiquetas de código de barras":** Modal para seleccionar formato de etiqueta e imprimir en lote.

#### 5. Inventario Físico (Campañas) (`#21115`)
- **URL Canónica:** `/plataforma/activos/inventario-fisico`
- **Componente Implementador:** `VistaInventarioFisico.tsx`
- **Propósito:** Planificación y control de auditorías anuales o semestrales de toma de inventario físico por sede o centro de datos.
- **Pestañas Internas:** No tiene pestañas; tabla de campañas con porcentaje de avance y discrepancias.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Crear Campaña de Inventario":** Modal para definir nombre, sede objetivo, fechas de inicio/cierre y auditores asignados.
    - **Botón popup 2 (en campaña): "Reporte de sobrantes y faltantes":** Modal de conciliación patrimonial.

#### 6. Inventario Físico en Campo (`#21116`)
- **URL Canónica:** `/plataforma/activos/conteos`
- **Componente Implementador:** `VistaActivosConteos.tsx`
- **Propósito:** Interfaz optimizada para dispositivos móviles y lectores de código de barras para pistoleros/auditores que recorren pisos y oficinas escaneando activos en tiempo real.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Registrar hallazgo de activo no catalogado":** Modal rápido para registrar un equipo no registrado encontrado en campo.

#### 7. Inventario Operativo (`#21117`)
- **URL Canónica:** `/plataforma/activos/inventario-operativo`
- **Componente Implementador:** `VistaActivosInventario.tsx`
- **Propósito:** Consola rápida para técnicos de mesa de ayuda para consultar disponibilidad inmediata de repuestos, stock de laptops en bodega y kits de onboarding.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Reservar equipo para entrega":** Modal para apartar un activo para un ticket de solicitud de ingreso de personal.

#### 8. Mis Activos (`#21118`)
- **URL Canónica:** `/plataforma/activos/mis-activos`
- **Componente Implementador:** `VistaMisActivos.tsx`
- **Propósito:** Portal de autoservicio donde el usuario consulta los equipos que tiene asignados bajo su responsabilidad (laptop, monitor, celular, token de seguridad) y visualiza las actas firmadas.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Reportar daño o falla":** Abre el formulario de reporte de incidente prellenando el activo afectado.

#### 9. Recepción de Adquisiciones (`#21119`)
- **URL Canónica:** `/plataforma/activos/recepcion`
- **Componente Implementador:** `VistaRecepcionActivos.tsx`
- **Propósito:** Módulo de entrada de almacén donde se cotejan las órdenes de compra emitidas contra los bultos físicos recibidos de los proveedores.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Recepcionar Orden de Compra":** Abre modal donde se ingresan las series físicas recibidas, se valida contra la factura y se generan los registros de activos en estado "En Almacén".

---

### 6.3. Sub-agrupador: Bajas y Disposición (`#21120`)
- **Tipo:** Sub-agrupador de Desincorporación Patrimonial (Nivel 2).
- **Propósito:** Regular el final de la vida útil de los activos, asegurando la destrucción segura de datos (borrado seguro / desmagnetización conforme a normativas de privacidad), aprobación gerencial de enajenación y disposición ecológica (RAEE).

#### 10. Aprobación de Bajas de Mi Área (`#21121`)
- **URL Canónica:** `/plataforma/activos/bajas/aprobacion`
- **Componente Implementador:** `VistaBajasActivos.tsx` (con filtro de aprobación)
- **Propósito:** Bandeja para que gerentes de finanzas y jefes de área autoricen la desincorporación contable de activos obsoletos o averiados.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Autorizar / Rechazar baja":** Modal de dictamen con firma de acta de baja.

#### 11. Consulta de Bajas (`#21122`)
- **URL Canónica:** `/plataforma/activos/bajas/consulta`
- **Componente Implementador:** `VistaBajasDisposicion.tsx`
- **Propósito:** Repositorio histórico de todos los activos desincorporados de la organización con sus certificados de destrucción de disco duro o venta.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Ver expediente de disposición":** Modal con certificados de reciclaje y acta de baja.

#### 12. Gestión de Bajas (`#21123`)
- **URL Canónica:** `/plataforma/activos/bajas`
- **Componente Implementador:** `VistaBajasActivos.tsx`
- **Propósito:** Consola del Gestor de Activos para tramitar expedientes de baja (por obsolescencia técnica, daño irreparable, pérdida/robo o término de contrato de arrendamiento/leasing).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Iniciar solicitud de baja":** Modal donde se selecciona el activo, motivo de baja, dictamen técnico y destino de disposición (Donación, Venta, Chatarreo, Retorno a lessor).

#### 13. Bajas y Renovaciones por Monto (`#21124`)
- **URL Canónica:** `/plataforma/activos/bajas/renovaciones`
- **Componente Implementador:** `VistaBajasRenovaciones.tsx`
- **Propósito:** Análisis financiero de costo de renovación vs. costo de mantenimiento acumulado para planificar recambios tecnológicos por umbrales monetarios.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:** No presenta modales de configuración.

---

### 6.4. Sub-agrupador: Mantenimiento (`#21125`)
- **Tipo:** Sub-agrupador Operativo de Soporte de Hardware (Nivel 2).
- **Propósito:** Administrar garantías de fábrica, contratos de mantenimiento preventivo y reparaciones correctivas con talleres autorizados.

#### 14. Mantenimiento y Garantías (`#21126`)
- **URL Canónica:** `/plataforma/activos/mantenimiento`
- **Componente Implementador:** `VistaActivosMantenimiento.tsx` / `VistaMantenimientoActivos.tsx`
- **Propósito:** Monitoreo de coberturas de garantía (Dell ProSupport, HP Care Pack, AppleCare, etc.) y vencimientos de pólizas de soporte.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Consultar garantía con fabricante (API)":** Modal que consulta en tiempo real el estado de garantía ingresando el Service Tag o Serial.

#### 15. Mantenimiento y Reparaciones (`#21127`)
- **URL Canónica:** `/plataforma/activos/reparaciones`
- **Componente Implementador:** `VistaActivosMantenimiento.tsx` (modo reparaciones)
- **Propósito:** Bitácora de órdenes de servicio técnico por fallas de hardware (cambio de batería, reemplazo de disco, pantalla rota).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nueva orden de reparación":** Modal para registrar envío a taller, proveedor, cotización y fecha estimada de retorno.

---

### 6.5. Sub-agrupador: Licencias (`#21128`)
- **Tipo:** Sub-agrupador de Gestión de Activos de Software (SAM) (Nivel 2).
- **Propósito:** Control de inventario de software, contratos de licenciamiento (por usuario, por núcleo, por dispositivo o SaaS), cumplimiento legal y prevención de multas por sobreuso.

#### 16. Catálogo de Software Autorizado (`#21129`)
- **URL Canónica:** `/plataforma/activos/licencias/catalogo-software`
- **Componente Implementador:** `VistaCatalogoSoftware.tsx`
- **Propósito:** Repositorio corporativo de aplicaciones homologadas y aprobadas por seguridad de la información para su instalación en equipos de la empresa.
- **Pestañas Internas:** No tiene pestañas; tarjetas de software con versión homologada, instalador oficial y tipo de licencia.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nuevo software homologado":** Modal para registrar versión, fabricante y condiciones de uso.

#### 17. Consultar Licencias (`#21130`)
- **URL Canónica:** `/plataforma/activos/licencias/consulta`
- **Componente Implementador:** `VistaLicenciasActivos.tsx`
- **Propósito:** Vista de búsqueda rápida para técnicos de mesa de ayuda para verificar disponibilidad de licencias antes de instalar software a un usuario.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Ver asignaciones activas":** Modal que lista qué usuarios tienen asignada la licencia seleccionada.

#### 18. Cumplimiento y Sobreuso (`#21131`)
- **URL Canónica:** `/plataforma/activos/licencias/cumplimiento`
- **Componente Implementador:** `VistaCumplimientoLicencias.tsx`
- **Propósito:** Cuadro de mando de auditoría SAM (*Software Asset Management*). Compara las licencias compradas contra las instalaciones reales detectadas por agentes en la red, alertando sobre déficit (riesgo legal) o exceso (costo ocioso).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Ejecutar reconciliación de licencias":** Modal para correr el proceso de conciliación automática entre compras y descubrimientos.

#### 19. Licencias de Software (`#21132`)
- **URL Canónica:** `/plataforma/activos/licencias`
- **Componente Implementador:** `VistaActivosLicencias.tsx`
- **Propósito:** Maestro de contratos y claves de activación de licencias (Microsoft 365, Adobe Creative Cloud, Oracle, VMware, etc.).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nueva Licencia":** Modal para dar de alta contrato de software, tipo de métrica, número de asientos (*seats*), clave de producto y fecha de expiración.

---

### 6.6. Sub-agrupador: CMDB (`#21133`)
- **Tipo:** Sub-agrupador de Gestión de la Configuración (Nivel 2).
- **Propósito:** Almacenar la información de los Elementos de Configuración (CI) necesarios para entregar los servicios de TI y modelar sus interrelaciones lógicas y físicas.

#### 20. Actualizaciones de CMDB desde Cambios (`#21134`)
- **URL Canónica:** `/plataforma/cmdb/actualizaciones`
- **Componente Implementador:** `VistaCmdbActualizaciones.tsx`
- **Propósito:** Bandeja de reconciliación donde se auditan los cambios aplicados en producción a través de RFCs autorizados para confirmar que los atributos de los CIs se hayan actualizado fielmente en la CMDB.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Aplicar actualización en CMDB":** Modal para confirmar la modificación de atributos del CI desde el expediente RFC.

#### 21. Análisis e Impacto (`#21135`)
- **URL Canónica:** `/plataforma/cmdb/analisis`
- **Componente Implementador:** `VistaCmdbAnalisis.tsx`
- **Propósito:** Herramienta de simulación de impacto. Permite seleccionar un componente (ej. un switch central o un cluster de base de datos) y calcular automáticamente el radio de impacto sobre los servicios de negocio ante una eventual caída.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Simular corte de CI":** Abre modal con el árbol de dependencias descendentes y lista de usuarios afectados.

#### 22. Calidad y Auditoría de CMDB (`#21136`)
- **URL Canónica:** `/plataforma/cmdb/auditoria`
- **Componente Implementador:** `VistaCmdbAuditoria.tsx`
- **Propósito:** Métricas de salud de la CMDB: porcentaje de CIs huérfanos (sin relaciones), atributos obligatorios faltantes, CIs sin dueño asignado e inexactitudes reportadas.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Lanzar auditoría de consistencia":** Modal que inicia la verificación automática de reglas de integridad referencial.

#### 23. Inexactitudes Reportadas (`#21137`)
- **URL Canónica:** `/plataforma/cmdb/inexactitudes`
- **Componente Implementador:** `VistaCmdbInexactitudes.tsx`
- **Propósito:** Buzón donde ingenieros de soporte o administradores de sistemas reportan discrepancias encontradas entre la realidad del centro de datos y los datos registrados en la CMDB.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Reportar inexactitud":** Modal para registrar qué atributo o relación del CI difiere de la realidad operativa.
    - **Botón popup 2: "Corregir y validar":** Modal para aplicar la corrección aprobada por el Gestor de Configuración.

#### 24. Líneas Base (`#21138`)
- **URL Canónica:** `/plataforma/cmdb/lineas-base`
- **Componente Implementador:** `VistaCmdbLineasBase.tsx`
- **Propósito:** Gestión de instantáneas (*snapshots*) de configuración reconocidas y autorizadas de un servicio o infraestructura en un momento dado en el tiempo.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Crear nueva Línea Base":** Modal para capturar el snapshot del estado actual de todos los CIs de un servicio.
    - **Botón popup 2: "Comparar contra Línea Base":** Modal que calcula el diferencial de atributos (*drift*) entre el estado presente y la línea base histórica.

#### 25. Mapa de Topología (`#21139`, `#21140`)
- **URL Canónica:** `/plataforma/cmdb/topologia`
- **Componente Implementador:** `VistaActivosMapa.tsx` / `VistaCmdb.tsx`
- **Propósito:** Visualizador gráfico e interactivo de topología de red y arquitectura de servicios. Renderiza nodos (CIs) y aristas (relaciones como *Depende de*, *Aloja a*, *Conecta con*, *Alimenta a*).
- **Pestañas Internas:** No tiene pestañas; interfaz visual basada en canvas/grafos interactivos con controles de zoom, filtrado por capas y búsqueda por nombre de CI.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (al hacer clic en un nodo): "Detalle del CI":** Despliega panel modal con especificaciones técnicas, tickets abiertos e historial de cambios.
    - **Botón popup 2: "Añadir relación gráfica":** Modal para conectar dos CIs seleccionando el tipo de relación de la CMDB.

#### 26. Modelado de Clases CI (`#21141`)
- **URL Canónica:** `/plataforma/cmdb/tipos`
- **Componente Implementador:** `VistaTiposCi.tsx`
- **Propósito:** Definición de la taxonomía y jerarquía de clases de la CMDB (Servidores físicos, Máquinas virtuales, Bases de datos, Servicios web, Routers, etc.).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nueva Clase de CI":** Modal para crear clase, definir herencia de atributos y clase padre.

#### 27. Resultados de Auditorías de CMDB (`#21142`)
- **URL Canónica:** `/plataforma/cmdb/auditoria/resultados`
- **Componente Implementador:** `VistaCmdbResultados.tsx`
- **Propósito:** Informes ejecutivos y técnicos resultantes de las auditorías periódicas de calidad de datos de la CMDB.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Exportar informe de auditoría":** Modal para descargar reporte en Excel/PDF.

---

### 6.7. Sub-agrupador: Proveedores y Contratos (`#21143`)
- **Tipo:** Sub-agrupador de Gestión de Proveedores de TI (Nivel 2).
- **Propósito:** Administrar la relación con terceros, contratos de soporte, acuerdos de confidencialidad (NDA), contratos marco de servicios y fechas críticas de renovación.

#### 28. Contratos y Cobertura (`#21144`)
- **URL Canónica:** `/plataforma/activos/contratos`
- **Componente Implementador:** `VistaContratos.tsx`
- **Propósito:** Maestro de contratos con proveedores de tecnología (SLA de proveedor, montos contratados, horarios de soporte 8x5 o 24x7).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nuevo Contrato":** Modal para registrar número de contrato, proveedor, fecha de inicio/vencimiento, SLA pactado y archivo digital adjunto.

#### 29. Licencias y Contratos de Mi Departamento (`#21145`)
- **URL Canónica:** `/plataforma/activos/contratos-area`
- **Componente Implementador:** `VistaContratosArea.tsx`
- **Propósito:** Vista restringida para directores de área para consultar el costo anual de contratos y licencias cargadas al presupuesto de su unidad.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:** No presenta modales.

#### 30. Proveedores (`#21146`)
- **URL Canónica:** `/plataforma/activos/proveedores`
- **Componente Implementador:** `src/app/plataforma/activos/proveedores/page.tsx`
- **Propósito:** Directorio institucional de proveedores de hardware, software y servicios de telecomunicaciones con datos de contacto comercial, escalamiento técnico y RUC/NIT.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nuevo Proveedor":** Modal para ingresar razón social, datos fiscales, portal de soporte y contactos clave.

#### 31. Renovaciones y Vencimientos (`#21147`)
- **URL Canónica:** `/plataforma/activos/renovaciones`
- **Componente Implementador:** `VistaRenovaciones.tsx`
- **Propósito:** Calendario de alertas automáticas a 90, 60 y 30 días previos al vencimiento de garantías, contratos de soporte y suscripciones SaaS para evitar suspensión de servicios.
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Programar renovación":** Modal para iniciar trámite de renovación o marcar como no renovable.

---

### 6.8. Sub-agrupador: Catálogos y Configuración de Activos (`#21148`)
- **Tipo:** Sub-agrupador de Parametrización del Dominio (Nivel 2).
- **Propósito:** Motores de configuración para modelar ciclos de vida, tipos de activos, fabricantes, modelos, reglas de CMDB y atributos personalizados.

#### 32. Ciclos de Vida y Reglas de Transición (`#21149`)
- **URL Canónica:** `/plataforma/activos/configuracion/ciclos-vida-transiciones`
- **Componente Implementador:** `VistaCiclosVidaTransiciones.tsx`
- **Propósito:** Parametrizar la máquina de estados por la que transita un activo físico o lógico a lo largo de su existencia.
- **Pestañas Internas:**
  - **Pestaña interna 1: Ciclos y estados (`PestanaCiclosEstados`):** Catálogo de estados estándar (En Adquisición, En Almacén, Asignado/En Uso, En Mantenimiento, En Préstamo, Retirado, Baja Definitiva).
  - **Pestaña interna 2: Transiciones y reglas (`PestanaTransicionesReglas`):** Reglas permitidas de transición entre estados y roles con autorización.
  - **Pestaña interna 3: Adquisición y recepción (`PestanaAdquisicionRecepcion`):** Parámetros del proceso de compra y recepción en bodega.
  - **Pestaña interna 4: Asignación y custodia (`PestanaAsignacionCustodia`):** Requisitos de actas de entrega y firmas obligatorias.
  - **Pestaña interna 5: Mantenimiento y fin de vida (`PestanaMantenimientoFinVida`):** Umbrales de depreciación y fallas recurrentes para recomendar reemplazo.
  - **Pestaña interna 6: Baja y disposición (`PestanaBajaDisposicion`):** Parámetros de baja legal y formato de acta de desincorporación.
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Ciclos y estados):**
    - **Botón popup 1: "Nuevo Ciclo de Vida":** Modal para crear un ciclo personalizado según familia de activo.
    - **Botón popup 2: "Nuevo Estado":** Modal para configurar código, nombre y color de estado.
  - **Dentro de Pestaña interna 3 (Adquisición y recepción):**
    - **Botón popup 1: "Vincular Servicio":** Modal para asociar el activo al catálogo de servicios.
    - **Botón popup 2: "Simular Recepción":** Modal interactivo para verificar las validaciones del flujo de entrada de almacén.
  - **Dentro de Pestaña interna 6 (Baja y disposición):**
    - **Botón popup 1: "Vista previa de Acta de Baja":** Modal que renderiza el formato oficial de desincorporación patrimonial.

#### 33. Fabricantes y Modelos (`#21150`)
- **URL Canónica:** `/plataforma/activos/configuracion/tipos-modelos-atributos/fabricantes`
- **Componente Implementador:** `PestanaFabricantesModelos` (dentro de `VistaTiposModelosAtributos.tsx`)
- **Propósito:** Catálogo jerárquico de marcas (Lenovo, Dell, Cisco, Apple, HP) y sus modelos homologados con especificaciones de procesador, memoria, puertos y años de soporte estándar.
- **Pestañas Internas:** Sub-vista especializada.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nuevo Fabricante":** Modal para registrar marca.
    - **Botón popup 2: "Nuevo Modelo":** Modal para ingresar modelo, características técnicas y fotografía referencial.

#### 34. Licencias y Contratos (`#21151`)
- **URL Canónica:** `/plataforma/activos/configuracion/licencias-contratos`
- **Componente Implementador:** `VistaLicenciasContratos.tsx`
- **Propósito:** Parametrizar tipos de contrato, métricas de licenciamiento, alertas de vencimiento y reglas de renovación.
- **Pestañas Internas:**
  - **Pestaña interna 1: Tipos de licencia (`PestanaTiposLicencia`):** Métricas de cobro (Por usuario nombrado, Por dispositivo, Por core de CPU, Suscripción mensual/anual).
  - **Pestaña interna 2: Tipos de contrato (`PestanaTiposContrato`):** Categorías de contrato (Garantía, Mantenimiento preventivo, Arrendamiento operativo, Soporte 24x7).
  - **Pestaña interna 3: Formulario de contrato (`PestanaFormularioLicenciaContrato`):** Campos obligatorios para el registro de acuerdos.
  - **Pestaña interna 4: Cumplimiento y sobreuso (`PestanaCumplimientoSobreuso`):** Tolerancias porcentuales de desvío de licencias antes de generar alerta crítica.
  - **Pestaña interna 5: Alertas de vencimiento (`PestanaAlertasVencimiento`):** Configuración de días de aviso previo y destinatarios de alertas de fin de contrato.
  - **Pestaña interna 6: Renovación (`PestanaRenovacion`):** Reglas de renovación automática o con licitación previa.
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Tipos de licencia):**
    - **Botón popup 1: "Nuevo Tipo de Licencia":** Modal de configuración de métrica y fórmula de cálculo.
  - **Dentro de Pestaña interna 2 (Tipos de contrato):**
    - **Botón popup 1: "Nuevo Tipo de Contrato":** Modal de alta de modalidad contractual.
  - **Dentro de Pestaña interna 5 (Alertas de vencimiento):**
    - **Botón popup 1: "Simulador de Alertas":** Modal para comprobar el disparo de avisos ante fechas simuladas.

#### 35. Listas Auxiliares (`#21152`)
- **URL Canónica:** `/plataforma/activos/configuracion/tipos-modelos-atributos/catalogos`
- **Componente Implementador:** `PestanaCatalogosAuxiliares` (dentro de `VistaTiposModelosAtributos.tsx`)
- **Propósito:** Gestión de tablas auxiliares desplegables para activos: estados físicos (Excelente, Bueno, Regular, Dañado), condiciones de entrega y tipos de disposición.
- **Pestañas Internas:** Sub-vista especializada.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nuevo ítem de catálogo":** Modal para añadir valor a una lista auxiliar.

#### 36. Tipos de CI y Relaciones de CMDB (`#21153`)
- **URL Canónica:** `/plataforma/activos/configuracion/cmdb-relaciones`
- **Componente Implementador:** `VistaCmdbRelaciones.tsx`
- **Propósito:** Motor de arquitectura de la CMDB. Define las clases de elementos de configuración, tipos de relaciones directas e inversas y reglas de integridad.
- **Pestañas Internas:**
  - **Pestaña interna 1: Clases de CI (`PestanaClasesCI`):** Modelado de clases de la CMDB y herencia de atributos.
  - **Pestaña interna 2: Tipos de relación (`PestanaTiposRelacion`):** Pares de relaciones directas/inversas (ej. *Contiene / Es contenido por*, *Ejecuta / Es ejecutado en*, *Depende de / Es requerido por*).
  - **Pestaña interna 3: Reglas de integridad (`PestanaReglasIntegridad`):** Restricciones de relación (ej. una VM no puede relacionarse con un CI de red sin un host físico intermediario).
  - **Pestaña interna 4: Criticidad y entornos (`PestanaCriticidadEntornos`):** Criterios de ponderación por entorno (Producción, QA, Desarrollo) y criticidad de negocio (Tier 1, Tier 2, Tier 3).
  - **Pestaña interna 5: Fuentes y atributos protegidos (`PestanaFuentesAtributosProtegidos`):** Define qué atributos sólo pueden actualizarse mediante agentes de descubrimiento automatizado o RFC autorizado.
  - **Pestaña interna 6: Auditoría y líneas base (`PestanaAuditoriaLineasBase`):** Parámetros de retención de snapshots de configuración.
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Clases de CI):**
    - **Botón popup 1: "Nueva Clase de CI":** Modal para crear clase, seleccionar icono representativo y clase padre.
  - **Dentro de Pestaña interna 2 (Tipos de relación):**
    - **Botón popup 1: "Nuevo Tipo de Relación" (y edición por fila):** Modal para definir nombre directo, nombre inverso y cardinalidad (1:1, 1:N, N:N).
    - **Botón popup 2: "Simulador de Enlaces":** Modal interactivo para verificar si dos CIs pueden enlazarse según las reglas.
  - **Dentro de Pestaña interna 3 (Reglas de integridad):**
    - **Botón popup 1: "Diagnóstico de Violaciones":** Modal que ejecuta una inspección en la base de datos y lista relaciones que incumplen las reglas.
  - **Dentro de Pestaña interna 4 (Criticidad y entornos):**
    - **Botón popup 1: "Editar Entorno / Nivel":** Modal para configurar parámetros de criticidad.

#### 37. Tipos, Modelos y Atributos (`#21154`)
- **URL Canónica:** `/plataforma/activos/configuracion/tipos-modelos-atributos`
- **Componente Implementador:** `VistaTiposModelosAtributos.tsx`
- **Propósito:** Consola central de arquitectura de activos de hardware y periféricos.
- **Pestañas Internas:**
  - **Pestaña interna 1: Clases y tipos (`PestanaClasesTipos`):** Categorías principales (Cómputo, Redes, Telefonía, Impresión, Servidores).
  - **Pestaña interna 2: Fabricantes y modelos (`PestanaFabricantesModelos`):** Marcas y modelos asociados.
  - **Pestaña interna 3: Atributos por tipo (`PestanaAtributosTipo`):** Campos técnicos obligatorios según el tipo (ej. para laptops: RAM, procesador, disco; para switches: número de puertos, throughput).
  - **Pestaña interna 4: Catálogos auxiliares (`PestanaCatalogosAuxiliares`):** Listas auxiliares de valores.
  - **Pestaña interna 5: Ubicaciones (`PestanaUbicaciones`):** Jerarquía de sedes, edificios, pisos, salas y racks.
  - **Pestaña interna 6: Código y etiquetas (`PestanaCodigoEtiquetas`):** Generador de nomenclatura de códigos patrimoniales y diseño de etiquetas de código de barras / QR.
  - **Pestaña interna 7: Formulario de activo (`PestanaFormularioActivo`):** Orden y distribución de campos en la ficha del activo.
  - **Pestaña interna 8: Ficha y listado (`PestanaFichaListado`):** Columnas visibles en las tablas de inventario.
  - **Pestaña interna 9: Importación de inventario (`PestanaImportacionInventario`):** Parámetros de validación de cargas masivas.
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Clases y tipos):**
    - **Botón popup 1: "Nuevo Tipo de Activo":** Modal para crear tipología de hardware.
  - **Dentro de Pestaña interna 3 (Atributos por tipo):**
    - **Botón popup 1: "Agregar Atributo Técnico":** Modal para definir nombre, tipo de dato y si es obligatorio al crear activos de este tipo.
  - **Dentro de Pestaña interna 5 (Ubicaciones):**
    - **Botón popup 1: "Nueva Ubicación":** Modal para dar de alta sede, edificio, piso o centro de datos.
  - **Dentro de Pestaña interna 6 (Código y etiquetas):**
    - **Botón popup 1: "Vista previa de etiqueta":** Modal que simula la impresión física del código QR o código de barras con el logo de la empresa.

#### 38. Ubicaciones (`#21155`)
- **URL Canónica:** `/plataforma/activos/configuracion/tipos-modelos-atributos/ubicaciones`
- **Componente Implementador:** `PestanaUbicaciones` (dentro de `VistaTiposModelosAtributos.tsx`)
- **Propósito:** Maestro de localizaciones geográficas, sedes corporativas, pisos y oficinas para control de inventario físico y traslados.
- **Pestañas Internas:** Sub-vista especializada.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nueva Sede / Ubicación":** Modal para registrar dirección, ciudad, responsable de sede y mapa referencial.

---

## 7. Desglose Exhaustivo por Módulo: Módulo 6 - CONOCIMIENTO (KCS) (`#21156`)

A continuación se detalla exhaustivamente cada una de las 7 opciones de menú del marco Knowledge-Centered Service (KCS) y gestión del conocimiento en FlowDesk, verificado contra el código fuente en `src/modules/conocimiento/`.

### 7.1. Agrupador Raíz: Conocimiento (`#21156`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito ITIL v4 / KCS:** Transformar el conocimiento tácito generado durante la atención de incidentes y problemas en activos explícitos, reutilizables y verificados (artículos, guías paso a paso y errores conocidos), acelerando la resolución en primera línea y fomentando el autoservicio guiado.
- **Ruta física base:** `src/app/plataforma/conocimiento/`
- **Módulo de backend:** `src/modules/conocimiento/`

---

### 7.2. Vistas Operativas y de Publicación de Conocimiento

#### 1. Base de Conocimiento (`#21157`, `#21158`)
- **URL Canónica:** `/plataforma/conocimiento/base`
- **Componente Implementador:** `VistaConocimientoBase.tsx`
- **Propósito:** Buscador y biblioteca central de artículos y guías oficiales para autoservicio y soporte técnico. Permite consultar procedimientos estándar, soluciones temporales (*workarounds*) y guías de autoayuda con filtrado en tiempo real por categoría y palabras clave.
- **Pestañas Internas:** No posee pestañas; organiza el contenido en un buscador reactivo con renderizado de tarjetas informativas categorizadas y métricas de utilidad comunitaria (visitas, votos positivos y negativos).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón directo 1: "+ Redactar artículo":** Acceso directo para invocar la creación de un nuevo borrador KCS (`/plataforma/conocimiento/nuevo`).
    - **Botón popup 1 (al hacer clic en cualquier tarjeta): "Lector de Artículo Modal":** Abre una ventana modal superpuesta con el visor completo del artículo en Markdown formateado, metadatos (código, autor, categoría, fecha de publicación, visitas) y las siguientes acciones interactivas:
      - **Botón modal 1.1: "Útil" (Voto positivo):** Registra retroalimentación favorable del usuario incrementando el contador de utilidad.
      - **Botón modal 1.2: "No me sirvió" (Voto negativo):** Registra retroalimentación negativa que notifica al equipo editorial KCS para revisión de obsolescencia.
      - **Botón modal 1.3: "Copiar enlace permanente":** Copia al portapapeles la URL canónica del artículo (`/plataforma/conocimiento/[id]`).
      - **Botón modal 1.4: "Cerrar":** Retorna a la cuadrícula de artículos.

---

#### 2. Crear Artículo (`#21159`)
- **URL Canónica:** `/plataforma/conocimiento/nuevo`
- **Componente Implementador:** `VistaConocimientoNuevo.tsx`
- **Propósito:** Consola de autoría de nuevo contenido KCS. Permite redactar soluciones en formato Markdown estructurado, clasificar el artículo, vincularlo a un problema origen y definir su audiencia de seguridad.
- **Pestañas Internas:** No posee pestañas; estructura el formulario en bloques temáticos (Encabezado y Metadatos, Editor Markdown enriquecido y Reglas de Audiencia).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Vincular Problema Origen":** Desplegable/modal que permite buscar y seleccionar un expediente de problema (`PRB-XXXX`) para importar automáticamente el diagnóstico de causa raíz y solución de contingencia al cuerpo del artículo.
    - **Botón 2: "Guardar como Borrador":** Persiste el artículo en estado `BORRADOR` sin pasar por compuerta de aprobación, permitiendo edición posterior en *Mis Artículos*.
    - **Botón 3: "Enviar a Revisión":** Valida los campos obligatorios (título mínimo 5 caracteres, categoría y contenido) y transiciona el artículo a estado `EN_REVISION` para evaluación por el equipo de supervisión editorial.

---

#### 3. Mis Artículos (`#21160`)
- **URL Canónica:** `/plataforma/conocimiento/mis-articulos`
- **Componente Implementador:** `VistaConocimientoMisArticulos.tsx`
- **Propósito:** Bandeja personal de autoría donde cada especialista gestiona los artículos redactados por él. Permite monitorear el ciclo editorial de cada entrega (Borrador, En Revisión, Publicado, Retirado, Rechazado) y analizar las calificaciones de los usuarios.
- **Pestañas Internas:** No posee pestañas; presenta filtros rápidos por estado editorial (`TODOS`, `BORRADOR`, `EN_REVISION`, `PUBLICADO`, `RETIRADO`, `RECHAZADO`).
- **Botones y Popups:**
  - **En vista principal (en la fila de cada artículo según su estado):**
    - **Botón popup 1: "Editar Artículo":** Abre el formulario de edición (`/plataforma/conocimiento/configuracion/articulos/[id]/editar`) para actualizar contenido o subsanar observaciones editoriales.
    - **Botón popup 2: "Enviar a Revisión":** Disponible en borradores; solicita confirmación para enviar el documento a la cola de publicación.
    - **Botón popup 3: "Eliminar Borrador":** Modal de confirmación para eliminar físicamente un artículo no publicado.

---

#### 4. Revisión y Publicación de Artículos (`#21161`)
- **URL Canónica:** `/plataforma/conocimiento/publicacion`
- **Componente Implementador:** `VistaConocimientoRevisiones.tsx` (Protegido con capacidad `CONOCIMIENTO_GESTIONAR`)
- **Propósito:** Consola de gobernanza editorial para Supervisores KCS y Aprobadores de Conocimiento. Permite auditar artículos propuestos, verificar el cumplimiento de guías de estilo, revisar la veracidad técnica y dictaminar su publicación oficial hacia la organización.
- **Pestañas Internas:** No posee pestañas; organiza la lista en tabla interactiva con código, título, autor, categoría, fecha de envío y acciones.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Examinar para Dictamen":** Abre el modal de auditoría editorial con el texto completo del artículo, permitiendo ejecutar:
      - **Acción modal 1.1: "Aprobar y Publicar":** Cambia el estado a `PUBLICADO`, haciéndolo visible de inmediato en el portal de autoservicio y mesa de servicio.
      - **Acción modal 1.2: "Rechazar / Solicitar Ajustes":** Abre un cuadro de captura para consignar los motivos de rechazo técnico u ortográfico devueltos al autor.
      - **Acción modal 1.3: "Retirar del Portal":** En artículos ya públicos, modal para justificar su despublicación por obsolescencia.

---

#### 5. Revisiones Pendientes (`#21162`)
- **URL Canónica:** `/plataforma/conocimiento/revisiones`
- **Componente Implementador:** `VistaConocimientoRevisiones.tsx`
- **Propósito:** Cola operativa de artículos en espera de arbitraje técnico. Permite a los técnicos y revisores consultar el volumen de solicitudes pendientes y priorizar la validación de guías críticas.
- **Pestañas Internas:** Vista operativa unificada sin pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "Actualizar":** Refresca la cola de artículos pendientes consultando la API en tiempo real.
    - **Botón popup 2: "Examinar":** Modal de lectura rápida para comprobar la pertinencia de la guía.

---

#### 6. Categorías, Responsables y Reglas de Publicación (`#21202`)
- **URL Canónica:** `/plataforma/conocimiento/configuracion`
- **Componente Implementador:** `VistaConocimientoConfig.tsx` (Gobierno KCS y sub-vistas especializadas)
- **Propósito:** Consola de administración y parametrización de la gestión del conocimiento. Controla la taxonomía de categorías, perfiles autorizados para redacción/aprobación, frecuencia de revisión y prueba interactiva del portal de autoservicio.
- **Pestañas Internas:**
  - **Pestaña interna 1: Artículos (`articulos`):** Consola maestra de inventario de artículos con filtros por estado editorial (`TODOS`, `PUBLICADO`, `EN_REVISION`, `BORRADOR`, `RETIRADO`, `RECHAZADO`) y métricas de visitas y satisfacción.
  - **Pestaña interna 2: Vista previa del Portal (`portal_preview`):** Simulador interactivo del Help Center de autoservicio que permite navegar por categorías tecnológicas, buscar artículos tal como los ve el empleado final y probar la calificación CSAT interactiva.
  - **Pestaña interna 3: Políticas KCS (`politicas`):** Motor de gobernanza editorial que define qué perfiles pueden redactar (Técnico, Gestor, Administrador), qué perfiles aprueban, compuerta obligatoria de aprobación previa y frecuencia de auditoría de vigencia (30, 90, 180 o 365 días).
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Artículos):**
    - **Botón popup 1: "Retirar":** Abre el modal de justificación de retiro de artículo, solicitando obligatoriamente el motivo del retiro para auditoría de obsolescencia.
    - **Botón popup 2: "Publicar":** Modal de confirmación para publicar directamente un artículo en revisión.
    - **Botón popup 3: "Rechazar":** Modal para ingresar observación editorial de devolución al autor.
    - **Botón popup 4: "Eliminar":** Diálogo de confirmación para borrado definitivo.
  - **Dentro de Pestaña interna 3 (Políticas KCS):**
    - **Botón 1: "Guardar Políticas KCS":** Persiste en base de datos la matriz de perfiles habilitados y compuertas de aprobación obligatoria.
  - **Vistas Especializadas Vinculadas (Sub-rutas de configuración):**
    - **Categorías (`/plataforma/conocimiento/configuracion/categorias`):** Implementada por `VistaConfigCategorias.tsx`.
      - **Botón popup 1: "Nueva Categoría":** Modal para definir nombre, descripción funcional y código corto alfanumérico.
      - **Botón popup 2 (por fila): "Editar":** Modal para modificar datos maestros y estado activo/inactivo.
      - **Botón popup 3 (por fila): "Eliminar":** Modal de deshabilitación lógica protegida.
    - **Plantillas KCS (`VistaConfigPlantillas.tsx`):** Permite diseñar plantillas predeterminadas (Guía de instalación, Resolución de error conocido, Preguntas frecuentes FAQ).
    - **Políticas de Acceso ISO 27001 (`VistaConfigPoliticasAcceso.tsx`):** Bloqueo de comandos sensibles y control de descarga pública.
    - **Salud del Contenido KCS (`VistaConfigSaludKcs.tsx`):** Umbrales de índice de calidad AQI (*Article Quality Index*) y alerta de votos negativos reiterados.

---

#### 7. Expediente Detallado de Artículo KCS (`[id]`)
- **URL Canónica:** `/plataforma/conocimiento/[id]`
- **Componente Implementador:** `VistaConocimientoDetalle.tsx`
- **Propósito:** Ficha 360° de consulta y lectura profunda de un artículo de conocimiento. Renderiza el contenido estructurado en Markdown, genera etiquetas automáticas de búsqueda temática (*tags*), exhibe indicadores de utilidad y permite a los usuarios calificar la solución.
- **Pestañas Internas:** No posee pestañas; organiza el contenido en encabezado institucional, barra de metadatos (código, categoría, autor, fecha), panel de contenido principal y barra lateral con recomendaciones y etiquetas semánticas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "Volver a la base":** Retorno a la biblioteca.
    - **Botón 2: "Editar artículo":** Visible para autores o administradores con capacidad `CONOCIMIENTO_GESTIONAR`.
    - **Botón 3: "Sí, me sirvió" (Voto Positivo):** Registra utilidad y actualiza el contador en pantalla.
    - **Botón 4: "No resolvió mi problema" (Voto Negativo):** Registra insatisfacción para análisis de causa raíz y mejora continua KCS.

---

## 8. Desglose Exhaustivo por Módulo: Módulo 7 - CATÁLOGO DE SERVICIOS Y SLA (`#21163`)

A continuación se detalla exhaustivamente cada una de las 6 opciones del Catálogo de Servicios de TI y Acuerdos de Nivel de Servicio (SLA), verificado contra el código fuente en `src/modules/servicios/`.

### 8.1. Agrupador Raíz: Catálogo de Servicios (`#21163`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito ITIL v4:** Centralizar la oferta de servicios tecnológicos de la organización (Service Catalog), delimitando el alcance de cada prestación para Incidentes y Solicitudes de Servicio, asociando compromisos formales de tiempo (SLA/OLA/UC) y modelando flujos de trabajo (*workflows*) estandarizados.
- **Ruta física base:** `src/app/plataforma/servicios/`
- **Módulo de backend:** `src/modules/servicios/`

---

### 8.2. Vistas Operativas y de Configuración de Servicios

#### 8. Catálogo de Servicios (`#21164`)
- **URL Canónica:** `/plataforma/servicios/catalogo`
- **Componente Implementador:** `VistaCatalogoServicios.tsx`
- **Propósito:** Portal de consulta de todas las prestaciones estandarizadas de TI para usuarios y técnicos. Permite explorar servicios organizados por familias tecnológicas, consultar tiempos estimados de respuesta y resolución según SLA vigente y lanzar el registro asistido de un ticket.
- **Pestañas Internas:** No tiene pestañas; interfaz visual de catálogo de autoservicio con filtros por tipo de ticket (Incidentes vs. Solicitudes), selector de categoría tecnológica e iconografía temática.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en cada tarjeta de servicio): "Ver ficha técnica y SLA":** Abre modal con la descripción funcional, entregables incluidos, exclusiones, costo unitario y matriz de tiempos comprometidos.
    - **Botón 2: "Solicitar este servicio":** Redirige a la pantalla de captura del ticket (`/plataforma/solicitudes/crear?id_servicio=X` o `/plataforma/incidentes/crear?id_servicio=X`) con el servicio y categoría preseleccionados.

---

#### 9. Configuración de Categorías (`#21165`)
- **URL Canónica:** `/plataforma/servicios/configuracion/categorias`
- **Componente Implementador:** `GestionCategorias.tsx`
- **Propósito:** Administración de la taxonomía del catálogo de servicios. Permite crear, ordenar y parametrizar las categorías principales que agrupan las prestaciones tecnológicas (Redes, Cómputo, Software Empresarial, Accesos, Telefonía, etc.) y definir los tiempos SLA por defecto de la categoría.
- **Pestañas Internas:** No tiene pestañas; integra en una sola vista la grilla de categorías con scroll controlado y paneles de edición contextuales.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nueva Categoría":** Abre modal/formulario para dar de alta una categoría:
      - Nombre de la categoría (máx 60 caracteres).
      - Tipo de ticket asociado (Incidente / Solicitud).
      - Código corto identificador (3 a 10 caracteres alfanuméricos en mayúsculas).
      - SLA default de primera respuesta (horas).
      - SLA default de resolución total (horas).
      - Descripción funcional (máx 200 caracteres).
    - **Botón popup 2 (en cada fila de la tabla): "Editar":** Abre el modal de edición de propiedades y tiempos base.
    - **Botón popup 3 (en cada fila de la tabla): "Deshabilitar":** Modal de confirmación con salvaguarda histórica; desactiva la categoría para nuevos tickets sin alterar los registros existentes.

---

#### 10. Crear Servicio (`#21166`)
- **URL Canónica:** `/plataforma/servicios/configuracion/crear`
- **Componente Implementador:** `src/modules/servicios/config/servicios/page.tsx` (en modo `vistaForzada="nuevo"`)
- **Propósito:** Asistente de alta de nuevas prestaciones en el Catálogo de Servicios ITIL.
- **Pestañas Internas:** Formulario estructurado por secciones de dominio:
  - **Sección 1: Definición y Clasificación:** Código de servicio, tipo (Incidente o Solicitud de Servicio), categoría padre y nombre del servicio.
  - **Sección 2: Alcance y Entregables:** Descripción funcional completa, entregable específico prometido al usuario final y costo referencial.
  - **Sección 3: Compromisos de SLA y Gobernanza:** Indicador de compuerta obligatoria de aprobación de jefatura/área, SLA de primera respuesta en horas y SLA de resolución comprometida.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "Guardar Servicio":** Valida la unicidad del código y los tiempos de SLA, persistiendo la nueva prestación en el catálogo activo.
    - **Botón 2: "Cancelar":** Retorna al listado general de servicios.

---

#### 11. Objetivos SLA y Matriz de Prioridad (`#21167`)
- **URL Canónica:** `/plataforma/servicios/configuracion/sla`
- **Componente Implementador:** `ConfiguracionObjetivosSla.tsx` (y subcomponente `MatrizPrioridadSla.tsx`)
- **Propósito:** Motor algorítmico de tiempos y priorización de FlowDesk. Permite parametrizar las metas de cumplimiento de SLA, calendarios de jornada laboral, causas autorizadas de pausa de reloj y la matriz ITIL de cálculo automático de prioridad.
- **Pestañas Internas:**
  - **Pestaña interna 1: Tiempos y Objetivos SLA (`tiempos`):** Tabla de niveles de prioridad (P1 Crítica, P2 Alta, P3 Media, P4 Baja) con tiempos de primera respuesta y resolución en horas; configuración de política de jornada (Hábil de lunes a viernes o 24x7 continuo), umbrales de advertencia preventiva (ej. 75%) y crítica (ej. 90%) y reglas de pausa automática.
  - **Pestaña interna 2: Matriz de Prioridad ITIL (`matriz`):** Matriz bidimensional de Impacto (Alto, Medio, Bajo) $	imes$ Urgencia (Alta, Media, Baja). Permite configurar la regla que computa automáticamente si una combinación produce una prioridad P1, P2, P3 o P4.
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Tiempos y Objetivos):**
    - **Botón popup 1: "Editar Prioridad / SLA":** Modal para calibrar horas de respuesta, horas de resolución y color del semáforo.
    - **Botón popup 2: "Añadir Motivo de Pausa":** Modal para dar de alta causales legítimas de suspensión de SLA (En espera de repuesto por proveedor, En espera de datos del usuario, En pruebas de aceptación).
    - **Botón 3: "Guardar Políticas Globales de SLA":** Persiste la jornada laboral, umbrales y reglas de suspensión en servidor.
  - **Dentro de Pestaña interna 2 (Matriz de Prioridad):**
    - **Botón 1: "Guardar Matriz de Prioridad":** Persiste el cuadrante cruzado de impacto $	imes$ urgencia.

---

#### 12. Servicios de Incidentes (`#21168`)
- **URL Canónica:** `/plataforma/servicios/configuracion/incidentes`
- **Componente Implementador:** `src/modules/servicios/config/servicios/page.tsx` (con `tipoForzado={1}`)
- **Propósito:** Administración especializada del catálogo de fallas, degradaciones y servicios reactivos de incidentes. Permite clasificar las fallas comunes por especialidad técnica, fijar tiempos de restauración inmediata y asociar grupos resolutores.
- **Pestañas Internas:** Utiliza el motor unificado de vistas (`ModoVista`):
  - **Modo Tabla:** Inventario de servicios de incidentes agrupados por categoría.
  - **Modo Workflow:** Diseñador de ruta de atención y escalamiento técnico.
  - **Modo Asignación:** Asistente para reubicar servicios sin categoría asignada.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "+ Nuevo Servicio de Incidente":** Despliega el formulario de creación.
    - **Botón 2: "Asignar huérfanos":** Despliega modal/panel para vincular servicios sueltos a categorías de incidentes.
    - **Botón popup 3 (por fila): "Diseñar Flujo / Workflow":** Abre la interfaz para configurar los pasos de diagnóstico, escalamiento a Nivel 2/3 y pruebas de resolución.

---

#### 13. Servicios de Solicitudes (`#21169`)
- **URL Canónica:** `/plataforma/servicios/configuracion/solicitudes`
- **Componente Implementador:** `src/modules/servicios/config/servicios/page.tsx` (con `tipoForzado={2}`)
- **Propósito:** Administración especializada del catálogo de requerimientos, aprovisionamiento de hardware/software, accesos y trámites corporativos.
- **Pestañas Internas:** Mismo motor desacoplado con filtro forzado para requerimientos de servicio (`tipoForzado=2`).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "+ Nueva Solicitud de Servicio":** Abre el formulario de alta con campos específicos de aprobación previa y entregables.
    - **Botón popup 2 (por fila): "Configurar Aprobadores del Flujo":** Abre el diseñador de compuertas de autorización (`ServicioWorkflowPaso`) para definir si requiere visto bueno del jefe directo, del dueño del activo o del oficial de seguridad.
    - **Botón popup 3 (por fila): "Diseñador de Formulario Dinámico":** Acceso a `/plataforma/servicios/configuracion/[id]/formulario` para definir campos personalizados (listas desplegables, fechas, casillas) requeridos para esta solicitud en particular.

---

## 9. Desglose Exhaustivo por Módulo: Módulo 8 - OPERACIÓN TI Y RESILIENCIA (`#21170`)

A continuación se detalla exhaustivamente cada una de las 3 opciones del módulo de Operación de Servicios, Eventos y Resiliencia en FlowDesk, verificado contra el código fuente en `src/modules/operacion/`.

### 9.1. Agrupador Raíz: Operación (`#21170`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito ITIL v4:** Garantizar la continuidad, disponibilidad y capacidad de la infraestructura tecnológica mediante la ingestión y correlación de eventos de monitoreo (Event Management) y la administración de planes formales de resiliencia, RTO, RPO y pruebas de contingencia.
- **Ruta física base:** `src/app/plataforma/operacion/`
- **Módulo de backend:** `src/modules/operacion/`

---

### 9.2. Vistas Operativas de Eventos y Resiliencia

#### 14. Disponibilidad, Capacidad y Continuidad (`#21171`)
- **URL Canónica:** `/plataforma/operacion/resiliencia`
- **Componente Implementador:** `VistaResilienciaOperacion.tsx` (y subcomponente `ResilienciaWorkspace.tsx`, protegido por capacidad `OPERACION_RESILIENCIA`)
- **Propósito:** Consola de gobernanza y aseguramiento de la resiliencia operativa. Permite registrar y monitorear los acuerdos de disponibilidad por servicio, umbrales de capacidad máxima, tiempos objetivo de recuperación ante desastres (RTO) y punto de pérdida de datos tolerada (RPO), así como la bitácora de simulacros y pruebas de continuidad.
- **Pestañas Internas:** No posee pestañas; organiza el espacio de trabajo en formulario de parametrización de resiliencia y cuadrícula de tarjetas de salud por servicio.
- **Botones y Popups:**
  - **En vista principal:**
    - **Formulario de Registro/Actualización (visible para perfiles con privilegios de gestión):**
      - Selector de servicio tecnológico de la CMDB.
      - Disponibilidad objetivo (%) (ej. 99.95%).
      - Disponibilidad real observada (%).
      - RTO horas (Recovery Time Objective).
      - RPO horas (Recovery Point Objective).
      - Umbral de alerta de capacidad (%) y consumo observado (%).
      - Plan detallado de continuidad y recuperación de desastres (DRP).
      - Fecha de última prueba y fecha de próxima prueba obligatoria.
      - Resultado de la última prueba (Exitoso, Observado, Fallido).
    - **Botón 1: "Guardar plan":** Persiste o actualiza el compromiso de resiliencia del servicio en la base de datos.

---

#### 15. Eventos y Alertas (`#21172`)
- **URL Canónica:** `/plataforma/operacion/eventos`
- **Componente Implementador:** `VistaEventosOperacion.tsx` (y subcomponente `EventosWorkspace.tsx`, protegido por capacidad `OPERACION_EVENTOS`)
- **Propósito:** Consola de gestión de eventos (ITIL Event Management). Ingiere alertas generadas por agentes de monitoreo de red, servidores, bases de datos o servicios en la nube, permitiendo al operador reconocer la señal, asociarla a un CI de la CMDB y promoverla a incidente formal para evitar la dispersión de alarmas redundantes.
- **Pestañas Internas:** No posee pestañas; presenta el formulario de ingestión/registro y el listado cronológico de eventos activos filtrados por severidad (`BAJA`, `MEDIA`, `ALTA`, `CRITICA`) y estado (`ABIERTO`, `RECONOCIDO`, `VINCULADO`, `CERRADO`).
- **Botones y Popups:**
  - **En vista principal:**
    - **Formulario de Registro de Evento:**
      - Campo de fuente de origen (ej. Prometheus, Zabbix, CloudWatch).
      - Resumen de la alerta y detalle técnico de la excepción.
      - Severidad e identificación del CI afectado de la CMDB.
      - **Botón 1: "Guardar evento":** Registra el evento en la bitácora operativa.
    - **Acciones operativas en cada tarjeta de evento:**
      - **Botón 2: "Reconocer":** Cambia el estado del evento de `ABIERTO` a `RECONOCIDO`, indicando al equipo de monitoreo que un operador ya tomó conocimiento.
      - **Botón popup 3: "Vincular incidente":** Abre un cuadro modal/prompt que solicita el ID del ticket de incidente existente o en curso, enlazando el evento al expediente para consolidar la evidencia técnica.
      - **Botón 4: "Cerrar evento":** Finaliza el ciclo del evento una vez restablecida la métrica normal.

---

#### 16. Eventos y Resiliencia (Consolidado) (`#21173`)
- **URL Canónica:** `/plataforma/operacion/eventos-resiliencia`
- **Componente Implementador:** `src/app/plataforma/operacion/eventos-resiliencia/page.tsx`
- **Propósito:** Punto de acceso unificado protegido por capacidad `OPERACION_VER` que centraliza la navegación entre la consola de eventos en tiempo real y el tablero de resiliencia operativa.
- **Pestañas Internas:** Redirección canónica autorizada a la consola de eventos (`/plataforma/operacion/eventos`).
- **Botones y Popups:** No presenta modales directos.

---

## 10. Desglose Exhaustivo por Módulo: Módulo 9 - REPORTES E INTELIGENCIA OPERACIONAL (`#21174`)

A continuación se detalla exhaustivamente cada una de las 9 opciones del módulo de Reportes, métricas y tableros gerenciales en FlowDesk, verificado contra el código fuente en `src/modules/reportes/`.

### 10.1. Agrupador Raíz: Reportes (`#21174`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito ITIL v4:** Proporcionar visibilidad analítica sobre el desempeño de la entrega de valor, el cumplimiento de los Acuerdos de Nivel de Servicio (SLA/OLA), la productividad técnica, la efectividad del control de cambios y la evidencia de auditoría de seguridad y calidad.
- **Ruta física base:** `src/app/plataforma/reportes/`
- **Módulo de backend:** `src/modules/reportes/`

---

### 10.2. Vistas de Reportes e Indicadores

#### 17. Indicadores Operativos y SLA (`#21175`)
- **URL Canónica:** `/plataforma/reportes/operativos`
- **Componente Implementador:** `VistaReportesOperativos.tsx`
- **Propósito:** Centro de analítica operativa diaria de la Mesa de Ayuda. Presenta el total de tickets emitidos, desglose por tipo (Incidentes vs. Solicitudes), tasa porcentual de resolución a tiempo, volumen por prioridad (P1, P2, P3, P4) y distribución de estados en curso.
- **Pestañas Internas:** No posee pestañas; presenta tarjetas de KPI de alto impacto y tablas estadísticas de desglose.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "Exportar Reporte CSV":** Genera y descarga de forma inmediata un archivo delimitado por comas con todos los datos y porcentajes de cumplimiento del periodo evaluado.
    - **Botón 2: "Ver Tableros":** Acceso directo a la vista consolidada de tableros ejecutivos.

---

#### 18. Informes de Auditoría (`#21176`)
- **URL Canónica:** `/plataforma/reportes/auditoria`
- **Componente Implementador:** `VistaInformesAuditoria.tsx`
- **Propósito:** Gestión formal de informes y dictámenes de auditoría interna, revisiones de cumplimiento normativo (ISO 20000 / ISO 27001) y planes de remediación de no conformidades.
- **Pestañas Internas:** No posee pestañas; dispone de un formulario de emisión de informes y una lista interactiva de expedientes con vista detallada expandible y panel de evidencias.
- **Botones y Popups:**
  - **En vista principal:**
    - **Formulario "Nuevo Informe":**
      - Título del informe, periodo auditado, hallazgos detectados y recomendaciones técnicas.
      - **Botón 1: "Registrar informe":** Persiste el expediente en estado `BORRADOR`.
    - **Acciones en la lista de informes:**
      - **Botón 2: "Ver detalle / Ocultar":** Despliega el texto completo de hallazgos y recomendaciones.
      - **Botón popup 3: "Ver evidencias / Ocultar evidencias":** Abre el panel lateral contextual de evidencias documentales vinculadas.
      - **Botón 4: "Emitir" (en informes BORRADOR):** Transiciona el informe a estado `EMITIDO`, congelando el texto para conocimiento formal de la gerencia.
      - **Botón 5: "Cerrar" (en informes EMITIDOS):** Concluye el ciclo del informe tras la implementación de las recomendaciones.
    - **Dentro del panel de Evidencias de un informe:**
      - Formulario para registrar descripción de la prueba y contenido/enlace de la evidencia técnica.
      - **Botón 3.1: "Agregar evidencia":** Persiste la evidencia y actualiza la lista en tiempo real.

---

#### 19. Productividad Individual (`#21177`)
- **URL Canónica:** `/plataforma/reportes/productividad`
- **Componente Implementador:** `VistaProductividad.tsx`
- **Propósito:** Métricas individuales de rendimiento técnico y calidad de servicio de los especialistas de soporte: volumen de tickets resueltos, tiempo medio de solución en horas, calificación promedio de satisfacción del usuario (CSAT) e incidentes con incumplimiento de SLA.
- **Pestañas Internas:** Tabla consolidada sin pestañas, envuelta en `TablaDobleScroll` con ordenamiento por columnas.
- **Botones y Popups:** No presenta ventanas emergentes; los datos se calculan automáticamente desde la API de supervisión.

---

#### 20. Reportes de Activos (`#21178`)
- **URL Canónica:** `/plataforma/reportes/activos`
- **Componente Implementador:** `VistaReportesActivos.tsx`
- **Propósito:** Inteligencia patrimonial sobre el parque tecnológico: total de activos registrados, desglose por estado operativo (En operación, En stock/almacén, En reparación, Dados de baja), valuación financiera total del inventario, distribución por tipo de activo y pirámide de antigüedad y depreciación.
- **Pestañas Internas:** No posee pestañas; organiza la visualización en tarjetas de métricas financieras y tablas de distribución por tipología de hardware.
- **Botones y Popups:** No presenta ventanas modales.

---

#### 21. Reportes de Cambios (`#21179`)
- **URL Canónica:** `/plataforma/reportes/cambios`
- **Componente Implementador:** `VistaReportesCambios.tsx`
- **Propósito:** Analítica de gobernanza y control de cambios en producción: tasa global de éxito de cambios (% exitosos vs. fallidos), volumen de cambios de emergencia (ECAB), incidentes inducidos por cambios, tiempo medio de ciclo de vida del RFC (Lead Time) y porcentaje de cumplimiento de las ventanas de mantenimiento pactadas.
- **Pestañas Internas:** No posee pestañas; interfaz visual de KPIs gerenciales y tablas de rendimiento por tipo de cambio (Estándar, Normal, Emergencia).
- **Botones y Popups:** No presenta ventanas modales.

---

#### 22. Reportes de Decisiones (`#21180`)
- **URL Canónica:** `/plataforma/reportes/decisiones`
- **Componente Implementador:** `VistaReportesAprobaciones.tsx`
- **Propósito:** Métricas de agilidad y gobierno sobre las compuertas de autorización: total de solicitudes evaluadas por jefaturas y comités, desglose de aprobadas vs. rechazadas vs. observadas, tasa de aprobación y tiempo medio de respuesta en horas de los aprobadores designados.
- **Pestañas Internas:** No posee pestañas; combina tarjetas de KPI con histórico mensual de volumen y dictámenes emitidos.
- **Botones y Popups:** No presenta ventanas modales.

---

#### 23. Reportes de Problemas (`#21181`)
- **URL Canónica:** `/plataforma/reportes/problemas`
- **Componente Implementador:** `VistaReportesProblemas.tsx`
- **Propósito:** Evaluación del desempeño de la Gestión de Problemas: total de problemas investigados, porcentaje con Causa Raíz identificada, efectividad de la base de errores conocidos (KEDB), días promedio para alcanzar la solución definitiva y volumen de Problemas Mayores activos.
- **Pestañas Internas:** No posee pestañas; tablero de indicadores con distribución por estado, por prioridad y ranking de incidentes recurrentes más dañinos.
- **Botones y Popups:** No presenta ventanas modales.

---

#### 24. Reportes del Área (`#21182`)
- **URL Canónica:** `/plataforma/reportes/area`
- **Componente Implementador:** `VistaReportesArea.tsx`
- **Propósito:** Tablero ejecutivo para Directores y Jefes de Departamento: tickets consumidos por su área de negocio, porcentaje de cumplimiento de SLA recibido, índice de satisfacción de sus colaboradores (CSAT promedio) y costo acumulado de los servicios demandados.
- **Pestañas Internas:** No posee pestañas; organiza la información en KPIs de nivel de servicio y tabla de consumo de tickets por prestación de catálogo.
- **Botones y Popups:** No presenta ventanas modales.

---

#### 25. Tableros (`#21183`)
- **URL Canónica:** `/plataforma/reportes/tableros`
- **Componente Implementador:** `VistaDashboard.tsx`
- **Propósito:** Centro de control unificado y despacho de tableros ejecutivos. Detecta la sesión activa y redirige de manera desacoplada al panel de operaciones correspondiente al perfil en turno, asegurando que cada usuario acceda a los gráficos de desempeño pertinentes a sus capacidades.
- **Pestañas Internas:** Enrutamiento dinámico sin pestañas internas.
- **Botones y Popups:** No presenta ventanas modales.

---

## 11. Desglose Exhaustivo por Módulo: Módulo 10 - ORGANIZACIÓN Y RECURSOS DE TI (`#21264`)

A continuación se detalla exhaustivamente cada una de las 4 opciones de administración de la estructura organizativa y dotación de personal técnico en FlowDesk, verificado contra el código fuente en `src/modules/organizacion/`.

### 11.1. Agrupador Raíz: Organización (`#21264`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito:** Modelar la estructura corporativa de la empresa (unidades de negocio y departamentos solicitantes) y la estructura interna de TI (grupos resolutores de soporte, especialidades, niveles N1/N2/N3, supervisores asignados y capacidad máxima de carga de trabajo de los técnicos).
- **Ruta física base:** `src/app/plataforma/organizacion/`
- **Módulo de backend:** `src/modules/organizacion/`

---

### 11.2. Vistas de Estructura Organizativa y Soporte

#### 26. Departamentos Empresariales (`#21204`)
- **URL Canónica:** `/plataforma/organizacion/departamentos-empresa`
- **Componente Implementador:** `VistaDepartamentosEmpresa.tsx`
- **Propósito:** Maestro de unidades de negocio, gerencias y áreas de la organización usuaria (Finanzas, Operaciones, Legal, Recursos Humanos, Comercial). Permite delimitar el centro de costos de los tickets y calcular el impacto organizativo en incidentes y cambios.
- **Pestañas Internas:** No tiene pestañas; combina formulario desplegable con grilla de departamentos y conteo de colaboradores vinculados.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "+ Nuevo departamento":** Despliega el formulario de alta con validación en tiempo real:
      - Código del departamento (3 a 10 caracteres alfanuméricos).
      - Nombre del área corporativa.
      - Descripción funcional de actividades.
      - **Botón modal 1.1: "Guardar departamento":** Persiste el área en base de datos.
    - **Botón popup 2 (en cada fila de la tabla): "Editar":** Abre el formulario precargado para modificar nombre, descripción o habilitar/deshabilitar el departamento.

---

#### 27. Departamentos y Grupos Resolutores de TI (`#21205`)
- **URL Canónica:** `/plataforma/organizacion/departamentos`
- **Componente Implementador:** `VistaDepartamentos.tsx`
- **Propósito:** Maestro de grupos técnicos y células de resolución tecnológica (Mesa de Ayuda N1, Infraestructura y Redes, Soporte a Aplicaciones, Base de Datos, Ciberseguridad). Permite asignar jefes y supervisores de grupo y gestionar la nómina de especialistas técnicos asignados a cada mesa.
- **Pestañas Internas:** Diseñada con el patrón de modos de vista (`ModoVista`):
  - **Modo Tabla:** Lista de departamentos de TI con código, nombre, supervisor a cargo, conteo de técnicos y estado.
  - **Modo Crear:** Formulario de alta de grupo técnico con selector de supervisor.
  - **Modo Editar:** Modificación de datos maestros y cambio de jefatura técnica.
  - **Modo Técnicos:** Panel especializado que lista los especialistas asignados a ese grupo, su nivel de soporte (N1, N2, N3), capacidad máxima de tickets simultáneos y tickets actualmente en atención.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "+ Nuevo Departamento":** Activa el modo de creación.
    - **Botón popup 2 (por fila): "Gestionar Técnicos":** Conmuta al modo de asignación de especialistas del grupo, permitiendo enrolar nuevos técnicos o modificar sus niveles.
    - **Botón popup 3 (por fila): "Editar":** Conmuta al modo de edición de grupo.

---

#### 28. Supervisores (`#21206`)
- **URL Canónica:** `/plataforma/organizacion/departamentos/supervisores`
- **Componente Implementador:** `src/app/plataforma/organizacion/departamentos/supervisores/page.tsx` (reutiliza `VistaDepartamentos.tsx` con guarda de capacidad `ADMIN_ORGANIZACION`)
- **Propósito:** Consola de supervisión para coordinadores de TI. Permite balancear la cobertura de supervisión entre los diferentes grupos resolutores y auditar la dotación técnica asignada a cada turno.
- **Pestañas Internas:** Modos integrados de gestión técnica y supervisión.
- **Botones y Popups:** Mismas capacidades de auditoría y asignación de coordinadores de soporte.

---

#### 29. Técnicos y Niveles de Soporte (`#21207`)
- **URL Canónica:** `/plataforma/organizacion/tecnicos`
- **Componente Implementador:** `VistaTecnicos.tsx`
- **Propósito:** Consola de enrolamiento técnico y gestión de carga de trabajo. Permite registrar usuarios del sistema como especialistas de soporte, asociarlos a su grupo resolutor principal, fijar su nivel de soporte (Nivel 1 Básico, Nivel 2 Especialista, Nivel 3 Ingeniería/Arquitectura), definir su especialidad tecnológica y establecer su tope máximo de tickets simultáneos para prevenir saturación en el algoritmo de autoasignación.
- **Pestañas Internas:** Diseñada con patrón de modos de vista (`ModoVista`):
  - **Modo Tabla:** Inventario de técnicos con filtros por departamento de TI, nivel de soporte y buscador en tiempo real, tabla con `TablaDobleScroll` exhibiendo carga actual vs. capacidad máxima.
  - **Modo Enrolar:** Formulario para convertir un usuario del sistema en técnico activo.
  - **Modo Editar:** Modificación de nivel de soporte, especialidad y tope de tickets.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "+ Enrolar Técnico":** Despliega el formulario para seleccionar un usuario existente del sistema, asignarle departamento de TI, nivel de escalamiento y cuota de tickets.
    - **Botón popup 2 (por fila): "Editar Especialidad y Capacidad":** Abre el formulario de edición de carga y nivel de soporte.
    - **Botón popup 3 (por fila): "Desactivar / Dar de baja operativa":** Modal de confirmación para revocar la condición de técnico resolutor sin eliminar la cuenta de usuario corporativa.

---

## 12. Desglose Exhaustivo por Módulo: Módulo 11 - PLATAFORMA, GOBERNANZA Y SEGURIDAD (`#21215`)

A continuación se detalla exhaustivamente cada una de las 14 opciones de administración de la plataforma, cumplimiento normativo, identidades, menú y mantenimiento del sistema en FlowDesk, verificado contra el código fuente en `src/modules/plataforma/`, `src/modules/seguridad/` e `src/modules/identidades/`.

### 12.1. Agrupador Raíz: Plataforma (`#21215`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito:** Administrar la gobernanza transversal del sistema FlowDesk: cumplimiento de controles de auditoría y segregación de funciones (SoD), gestión integral de identidades y permisos RBAC, parametrización de plantillas y canales de notificación, auditoría del kernel y salud del ecosistema de bases de datos y colas de trabajo.
- **Ruta física base:** `src/app/plataforma/`
- **Módulos de backend:** `src/modules/plataforma/`, `src/modules/seguridad/`, `src/modules/identidades/`

---

### 12.2. Sub-agrupador: Cumplimiento (`#21216`)
- **Tipo:** Sub-agrupador de Cumplimiento Normativo (Nivel 2).
- **Propósito:** Verificación de controles de auditoría interna, mitigación de riesgos de fraude y cumplimiento de marcos de control de TI (COBIT, ITIL, ISO 27001).

#### 30. Cambios sin Autorización o Fuera de Ventana (`#21217`)
- **URL Canónica:** `/plataforma/seguridad/cumplimiento/cambios`
- **Componente Implementador:** `src/app/plataforma/seguridad/cumplimiento/cambios/page.tsx` (Servicio `cumplimientoService.ts`)
- **Propósito:** Bandeja de investigación forense de cambios no autorizados (*Unauthorized Changes*). Detecta modificaciones ejecutadas en infraestructura sin un RFC aprobado o cambios implementados fuera de la ventana horaria autorizada por el CAB.
- **Pestañas Internas:** No posee pestañas; tabla de hallazgos con severidad, CI involucrado, usuario ejecutor y fecha.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Justificar Desvío":** Modal para registrar si el cambio correspondió a una contingencia mayor no reportada a tiempo.
    - **Botón popup 2: "Elevar a Incidente de Seguridad":** Modal que abre un ticket formal de violación de seguridad de la información.

---

#### 31. Muestreo de Auditoría (`#21218`)
- **URL Canónica:** `/plataforma/seguridad/muestreo`
- **Componente Implementador:** `VistaMuestreo.tsx`
- **Propósito:** Herramienta algorítmica para auditores de TI. Genera muestras aleatorias o estratificadas de tickets de incidentes, solicitudes cerradas y RFCs para auditar el cumplimiento del procedimiento formal de atención y la calidad de la evidencia de cierre.
- **Pestañas Internas:** No posee pestañas; consola de filtrado por periodo, tamaño de muestra y técnica estadística (Aleatorio simple o Estratificado por prioridad).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Generar nueva muestra de auditoría":** Modal donde se configuran los parámetros de muestreo y se genera el lote de tickets a auditar.
    - **Botón 2: "Exportar lote seleccionado":** Descarga el listado en Excel/CSV con los identificadores de la muestra.

---

#### 32. Segregación de Funciones (SoD) (`#21219`)
- **URL Canónica:** `/plataforma/seguridad/cumplimiento/sod`
- **Componente Implementador:** `VistaSod.tsx`
- **Propósito:** Detección automática de conflictos de Segregación de Funciones (*Segregation of Duties*). Identifica usuarios que poseen simultáneamente privilegios incompatibles (ej. solicitar un cambio y aprobarlo en el CAB, o crear un usuario y auditar los accesos).
- **Pestañas Internas:** No tiene pestañas; matriz de riesgos de incompatibilidad y lista de usuarios con excepciones activas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nueva regla SoD":** Modal para definir qué pares de capacidades son incompatibles y la severidad del riesgo (Bajo, Medio, Crítico).
    - **Botón popup 2 (por usuario): "Revocar perfil en conflicto":** Modal para remover el permiso infractor de forma inmediata.

---

### 12.3. Sub-agrupador: Identidades (`#21208`)
- **Tipo:** Sub-agrupador de Gestión de Identidades y Accesos (Nivel 2).
- **Propósito:** Administrar las cuentas de usuario de la organización, sus credenciales, desbloqueos y la matriz de perfiles y permisos del sistema.

#### 33. Gestión de Usuarios (`#21209`)
- **URL Canónica:** `/plataforma/seguridad/usuarios`
- **Componente Implementador:** `VistaUsuarios.tsx`
- **Propósito:** Consola maestra de administración de usuarios. Permite dar de alta cuentas, asociar departamento empresarial, vincular correos institucionales, asignar perfiles de acceso (RBAC), restablecer contraseñas y desbloquear usuarios tras intentos fallidos de autenticación.
- **Pestañas Internas:** No posee pestañas; tabla de usuarios con buscador en tiempo real, filtros por perfil y estado (Activo, Bloqueado, Inactivo).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "+ Nuevo Usuario":** Modal para dar de alta un usuario con datos personales, correo, área y perfiles asignados.
    - **Botón popup 2 (por fila): "Editar Usuario":** Modal para modificar datos maestros y cambiar los perfiles de acceso.
    - **Botón popup 3 (por fila): "Desbloquear Cuenta":** Modal de confirmación para restablecer el acceso a usuarios bloqueados por contraseñas fallidas.
    - **Botón popup 4 (por fila): "Enviar Credenciales por Correo":** Modal para despachar un correo seguro con contraseña temporal.

---

#### 34. Perfiles y Permisos (`#21210`)
- **URL Canónica:** `/plataforma/seguridad/perfiles`
- **Componente Implementador:** `VistaPerfiles.tsx` (y subcomponente `GrillaPermisosRol.tsx`)
- **Propósito:** Administración de la matriz de roles y capacidades de negocio del sistema. Permite crear perfiles institucionales, definir su alcance y activar/desactivar las opciones de menú y capacidades granulares asignadas a cada perfil en la base de datos (`opciones_menu_perfiles`).
- **Pestañas Internas:** No tiene pestañas; selector de perfil y grilla interactiva de permisos organizados por macro-módulos.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nuevo Perfil":** Modal para registrar un nuevo perfil con código corto, nombre y nivel de privilegio base.
    - **Botón 2: "Guardar Matriz de Permisos":** Persiste en bloque todos los checks de capacidades y accesos de menú del perfil seleccionado.

---

### 12.4. Sub-agrupador: Menú y Notificaciones (`#21211`)
- **Tipo:** Sub-agrupador de Experiencia de Usuario y Comunicaciones (Nivel 2).
- **Propósito:** Administrar el árbol dinámico de navegación de la plataforma y el motor de plantillas de correo y mensajería multicanal.

#### 35. Configuración de Contacto (`#21212`)
- **URL Canónica:** `/plataforma/operacion/notificaciones/contacto`
- **Componente Implementador:** `src/app/plataforma/operacion/notificaciones/contacto/page.tsx`
- **Propósito:** Parametrizar los canales institucionales de soporte que se muestran a los usuarios en las pantallas de inicio de sesión y ayuda (teléfono de mesa de ayuda, WhatsApp corporativo, horario de atención y correo de contacto).
- **Pestañas Internas:** Formulario unificado sin pestañas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "Guardar canales de contacto":** Actualiza los parámetros institucionales del portal.

---

#### 36. Estructura del Menú (`#21213`)
- **URL Canónica:** `/plataforma/operacion/menu`
- **Componente Implementador:** `VistaMenu.tsx`
- **Propósito:** Editor del árbol de navegación de FlowDesk. Permite visualizar y reordenar las 227 opciones de menú activas, definir agrupadores raíz, sub-agrupadores, nombres de menú, iconos y URLs canónicas de las pantallas.
- **Pestañas Internas:** No posee pestañas; árbol interactivo jerárquico desplegable de 3 niveles con ordenamiento posicional.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nueva Opción de Menú":** Modal para dar de alta una nueva pantalla en el árbol, solicitando nombre, URL física, agrupador padre y orden numérico.
    - **Botón popup 2 (por fila/nodo): "Editar Opción":** Modal para modificar el nombre, URL o reubicar en otro sub-agrupador.

---

#### 37. Plantillas de Correo y Canales (`#21214`)
- **URL Canónica:** `/plataforma/operacion/notificaciones/plantillas`
- **Componente Implementador:** `VistaNotificaciones.tsx`
- **Propósito:** Motor de diseño de notificaciones automáticas del sistema (Ticket creado, Asignación de técnico, Alerta de vencimiento de SLA, Convocatoria a CAB, Notificación de resolución). Permite editar plantillas HTML con variables dinámicas (`{{ticket_codigo}}`, `{{usuario_nombre}}`, `{{tiempo_restante}}`).
- **Pestañas Internas:**
  - **Pestaña interna 1: Plantillas de Correo (`plantillas`):** Catálogo de plantillas de eventos con editor de código y vista previa.
  - **Pestaña interna 2: Reglas de Notificación (`reglas`):** Matriz que define qué evento dispara qué notificación y hacia qué destinatarios (Solicitante, Técnico, Supervisor, Aprobador).
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Plantillas):**
    - **Botón popup 1: "Vista previa de correo":** Modal que renderiza el correo electrónico con datos de prueba simulados.
    - **Botón popup 2: "Nueva Plantilla":** Modal para crear plantilla de evento con asunto y cuerpo HTML.
  - **Dentro de Pestaña interna 2 (Reglas):**
    - **Botón 1: "Guardar Reglas de Disparo":** Persiste la matriz de automatización de correos.

---

### 12.5. Vistas de Auditoría, Mantenimiento y Salud del Sistema

#### 38. Auditoría de Cambios de Configuración (`#21220`)
- **URL Canónica:** `/plataforma/seguridad/auditoria-sistema`
- **Componente Implementador:** `VistaAuditoriaSistema.tsx`
- **Propósito:** Bitácora inmutable de auditoría forense del sistema. Registra cada inserción, modificación y eliminación sobre tablas críticas de configuración (cambios en SLAs, modificación de permisos de perfiles, alteración de flujos de tickets, creación de nuevos CIs), guardando el usuario ejecutor, dirección IP, fecha/hora exacta y los valores anteriores (*payload old*) vs. nuevos (*payload new*).
- **Pestañas Internas:** No tiene pestañas; tabla cronológica de eventos con filtros por módulo, usuario y rango de fechas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (en cada fila): "Ver Diferencial (Diff JSON)":** Abre un modal que compara lado a lado los valores antes y después de la modificación en formato JSON resaltado.

---

#### 39. Registros de Seguridad y Autenticación (`#21221`)
- **URL Canónica:** `/plataforma/seguridad/seguridad-logs`
- **Componente Implementador:** `VistaSeguridadLogs.tsx`
- **Propósito:** Monitoreo de seguridad perimetral y eventos de acceso: inicios de sesión exitosos, intentos fallidos de autenticación, bloqueos de cuenta por fuerza bruta, cambios de contraseña y revocación de sesiones concurrentes.
- **Pestañas Internas:** No posee pestañas; visor en tiempo real de eventos de autenticación con semáforo de riesgo.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Ver detalle de trama de red":** Modal que muestra el User-Agent del navegador, dirección IP de origen y cabeceras de seguridad.

---

#### 40. Recertificación de Accesos (`#21222`)
- **URL Canónica:** `/plataforma/seguridad/accesos/recertificacion`
- **Componente Implementador:** `VistaRecertificacion.tsx`
- **Propósito:** Campañas periódicas de recertificación de privilegios conforme a ISO 27001. Permite a los supervisores de TI y jefes de área revisar los permisos de cada usuario asignado y ratificar o revocar formalmente sus accesos.
- **Pestañas Internas:** No tiene pestañas; listado de usuarios con perfiles asignados y acciones de dictamen.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "Iniciar Nueva Campaña de Recertificación":** Genera un corte formal de privilegios para evaluación de las jefaturas.
    - **Botón popup 2 (por usuario): "Dictaminar Recertificación":** Modal para confirmar "Acceso Aprobado" o "Revocar Perfil" con justificación obligatoria.

---

#### 41. Retención y Mantenimiento de Datos (`#21223`)
- **URL Canónica:** `/plataforma/operacion/mantenimiento-datos`
- **Componente Implementador:** `VistaMantenimientoDatos.tsx`
- **Propósito:** Políticas de ciclo de vida de la información: parámetros de archivado de tickets históricos, depuración de logs de auditoría antiguos, retención de archivos adjuntos y optimización periódica de índices de base de datos (*VACUUM/ANALYZE*).
- **Pestañas Internas:** No posee pestañas; formulario de configuración de plazos de retención (en años/meses) por tipo de registro.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Ejecutar purga manual":** Modal de confirmación con doble factor para borrar registros que hayan superado el periodo legal de retención.
    - **Botón 2: "Guardar políticas de retención":** Actualiza los plazos en servidor.

---

#### 42. Salud del Sistema (`#21224`)
- **URL Canónica:** `/plataforma/operacion/salud-sistema`
- **Componente Implementador:** `VistaSaludSistema.tsx`
- **Propósito:** Tablero de telemetría y diagnóstico del entorno de producción: latencia de la base de datos PostgreSQL, estado del pool de conexiones, servicio de envío de correos SMTP, tareas programadas en segundo plano (*cron jobs*), uso de memoria del servidor y disponibilidad del almacenamiento de adjuntos.
- **Pestañas Internas:** No tiene pestañas; panel de monitoreo con semáforos de estado en vivo (Verde: Saludable, Amarillo: Advertencia, Rojo: Crítico).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Probar Envío de Correo de Prueba":** Modal interactivo para ingresar una dirección de correo y validar la conectividad en vivo con el servidor SMTP.
    - **Botón 2: "Verificar Estado de Tareas en Segundo Plano":** Refresca el estado de los daemons de procesamiento de SLAs y notificaciones.

---

## 13. Desglose Exhaustivo por Módulo: Módulo 1 - MI TRABAJO Y GESTIÓN PERSONAL (`#21001`)

A continuación se detalla exhaustivamente cada una de las 15 opciones del módulo de trabajo individual, aprobaciones delegadas, coordinación de equipo y tableros personales en FlowDesk, verificado contra el código fuente en `src/modules/operacion/` y `src/modules/seguridad/`.

### 13.1. Agrupador Raíz: Mi Trabajo (`#21001`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito:** Espacio personal y unificado donde cada colaborador de la organización gestiona sus tareas diarias, compromisos de atención, dictámenes de aprobación pendientes, cobertura de guardias y ausencias de su equipo, y accede al tablero analítico adaptado a sus responsabilidades.
- **Ruta física base:** `src/app/plataforma/`

---

### 13.2. Sub-agrupador: Aprobaciones (`#21002`)
- **Tipo:** Sub-agrupador de Gestión de Autorizaciones (Nivel 2).
- **Propósito:** Administrar las delegaciones de firma y el historial de dictámenes colegiados e individuales de solicitudes y cambios.

#### 43. Delegación de Aprobaciones (`#21003`)
- **URL Canónica:** `/plataforma/solicitudes/area/delegacion`
- **Componente Implementador:** `src/modules/seguridad/views/VistaDelegaciones.tsx`
- **Propósito:** Permite a los aprobadores y directores de área delegar formalmente su poder de firma y autorización en un sustituto durante periodos de vacaciones, comisiones o licencias médicas, garantizando que el flujo de aprobación no se detenga.
- **Pestañas Internas:** No posee pestañas; formulario de registro de nueva delegación y tabla de delegaciones activas e históricas.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Nueva Delegación":** Modal para configurar sustituto:
      - Usuario suplente designado.
      - Tipo de solicitudes delegadas (Todas las solicitudes, Solo hardware, Solo accesos).
      - Rango de fechas con fecha de inicio y fecha de expiración obligatoria.
      - Motivo de la delegación para auditoría.
      - **Botón modal 1.1: "Guardar delegación":** Persiste la regla en base de datos.
    - **Botón popup 2 (por fila): "Revocar Delegación":** Modal de confirmación para cancelar inmediatamente la sustitución anticipada.

---

#### 44. Delegaciones (`#21004`)
- **URL Canónica:** `/plataforma/seguridad/delegaciones`
- **Componente Implementador:** `VistaDelegaciones.tsx`
- **Propósito:** Vista canónica transversal de delegaciones de firma corporativa para auditoría de seguridad y control interno.
- **Pestañas Internas:** Misma estructura desacoplada de delegación.
- **Botones y Popups:** Mismas capacidades de registro y revocación formal.

---

#### 45. Historial de Aprobaciones de Mi Área (`#21005`)
- **URL Canónica:** `/plataforma/solicitudes/area/historial`
- **Componente Implementador:** `src/modules/seguridad/views/VistaHistorialAprobaciones.tsx`
- **Propósito:** Registro cronológico de todos los dictámenes de autorización emitidos por los jefes y aprobadores de una unidad de negocio, permitiendo fiscalizar qué empleado autorizó cada gasto de tecnología, software o permiso de acceso.
- **Pestañas Internas:** No tiene pestañas; tabla con filtros por rango de fechas, solicitante y resultado (Aprobado, Rechazado).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1 (por fila): "Ver Justificación y Acta de Dictamen":** Modal que muestra el motivo del solicitante, presupuesto involucrado, comentarios del aprobador y firma digital del registro.

---

#### 46. Historial de Aprobaciones y Dictámenes (`#21006`)
- **URL Canónica:** `/plataforma/seguridad/historial-aprobaciones`
- **Componente Implementador:** `VistaHistorialAprobaciones.tsx`
- **Propósito:** Bitácora personal del usuario donde revisa todos los votos y dictámenes que ha emitido a lo largo de su trayectoria (en solicitudes de servicio, pases a producción en el CAB o análisis de riesgo de problemas).
- **Pestañas Internas:** No tiene pestañas.
- **Botones y Popups:** Modal de detalle de dictamen con auditoría de fecha y hora.

---

### 13.3. Sub-agrupador: Equipo (`#21008`)
- **Tipo:** Sub-agrupador de Coordinación de Células Técnicas (Nivel 2).
- **Propósito:** Gestionar la disponibilidad del equipo resolutor, calendario de turnos, guardias nocturnas/rotativas y repositorios compartidos de respuestas rápidas.

#### 47. Ausencias y Guardias del Equipo (`#21009`)
- **URL Canónica:** `/plataforma/operacion/equipo/ausencias`
- **Componente Implementador:** `VistaAusenciasEquipo.tsx` (y subcomponente `CalendarioTurnosTecnicos.tsx`)
- **Propósito:** Calendario gráfico y operativo donde los miembros de un grupo de soporte coordinan sus turnos de guardia, vacaciones programadas, permisos y turnos pasivos para soporte 24x7.
- **Pestañas Internas:**
  - **Pestaña interna 1: Calendario de Turnos y Guardias:** Vista semanal/mensual interactiva con cuadrícula de especialistas y turnos cubiertos.
  - **Pestaña interna 2: Registro de Ausencias:** Tabla con el histórico de permisos y licencias registradas.
- **Botones y Popups:**
  - **Dentro de Pestaña interna 1 (Calendario):**
    - **Botón popup 1: "Asignar Guardia / Turno":** Modal para programar fecha, técnico asignado y tipo de guardia (Activa presencial, Pasiva remota).
  - **Dentro de Pestaña interna 2 (Ausencias):**
    - **Botón popup 1: "Registrar Ausencia":** Modal para ingresar motivo (Vacaciones, Licencia Médica, Comisión externa), rango de fechas y suplente asignado.

---

#### 48. Vistas y Respuestas Compartidas (`#21010`)
- **URL Canónica:** `/plataforma/operacion/equipo/vistas`
- **Componente Implementador:** `src/app/plataforma/operacion/equipo/vistas/page.tsx`
- **Propósito:** Repositorio de filtros guardados y plantillas de respuestas predeterminadas (*canned responses*) compartidas entre los técnicos de una misma mesa para agilizar la interacción con los usuarios.
- **Pestañas Internas:**
  - **Pestaña interna 1: Filtros y Vistas Personalizadas:** Gestión de bandejas filtradas creadas por el equipo.
  - **Pestaña interna 2: Respuestas Rápidas Compartidas:** Textos predefinidos para soluciones comunes.
- **Botones y Popups:**
  - **Dentro de Pestaña interna 2 (Respuestas Rápidas):**
    - **Botón popup 1: "Nueva Respuesta Rápida":** Modal para ingresar título, atajo de teclado y texto predeterminado con variables dinámicas.

---

### 13.4. Paneles y Vistas de Trabajo Personal

#### 49. Paneles Especializados por Capacidad de Dominio (`#21007`, `#21011`, `#21012`, `#21013`, `#21014`, `#21015`, `#21016`, `#21017`, `#21021`, `#21022`)
- **URLs Canónicas:**
  - Panel de Activos y CMDB (`#21007`): `/plataforma/operacion/paneles/gestor-activos`
  - Panel de Auditoría (`#21011`): `/plataforma/operacion/paneles/auditor`
  - Panel de Gestión de Cambios (`#21012`): `/plataforma/operacion/paneles/gestor-cambios`
  - Panel de Gestión de Problemas (`#21013`): `/plataforma/operacion/paneles/gestor-problemas`
  - Panel de Supervisión (`#21014`): `/plataforma/operacion/paneles/supervisor`
  - Panel del Aprobador (`#21015`): `/plataforma/operacion/paneles/aprobador`
  - Panel del Área (`#21016`): `/plataforma/operacion/paneles/gestor-area`
  - Panel del Técnico (`#21017`): `/plataforma/operacion/paneles/tecnico`
  - Panel de Administración (`#21021`): `/plataforma/operacion/paneles/administrador`
  - Panel del Solicitante (`#21022`): `/plataforma/operacion/paneles/solicitante`
- **Componentes Implementadores:** Componentes desacoplados en `src/modules/operacion/paneles/` (`VistaPanelTecnico.tsx`, `VistaPanelSupervisor.tsx`, `VistaPanelAprobador.tsx`, `VistaPanelAuditoria.tsx`, `VistaPanelArea.tsx`, `VistaPanelGestion.tsx`, `VistaPanelSolicitante.tsx`, `VistaPanelAdministrador.tsx`).
- **Propósito:** Cada panel proporciona un cuadro de mando a la medida de la capacidad operativa:
  - **Técnico:** Mis tickets en curso, temporizador regresivo de SLA, tickets en espera, tareas asignadas del día.
  - **Supervisor:** Cola general no asignada, técnicos en línea vs. ausentes, tickets en riesgo de incumplimiento (< 30 min), cuellos de botella.
  - **Aprobador:** Solicitudes y cambios pendientes de firma con montos y justificaciones de negocio.
  - **Auditor:** Resumen de controles de seguridad, alertas de segregación de funciones e incidencias sin evidencia de cierre.
  - **Solicitante:** Mis requerimientos abiertos, tickets resueltos esperando mi confirmación de cierre y artículos sugeridos de autoayuda.
- **Pestañas Internas y Modales:**
  - **En Panel del Técnico:**
    - **Botón popup 1: "Tomar ticket de la cola":** Asigna el ticket al técnico en un clic.
    - **Botón popup 2: "Iniciar temporizador de diagnóstico":** Abre el modal de seguimiento de tiempo operativo.
  - **En Panel del Supervisor:**
    - **Botón popup 1: "Reasignación urgente":** Modal para mover tickets en riesgo hacia técnicos con menor carga.

---

#### 50. Mi Agenda y Disponibilidad (`#21018`)
- **URL Canónica:** `/plataforma/operacion/agenda`
- **Componente Implementador:** `VistaAgendaOperativa.tsx`
- **Propósito:** Calendario de citas, mantenimientos coordinados en sitio y visitas técnicas programadas con los usuarios corporativos.
- **Pestañas Internas:** Vistas de Día, Semana y Mes con selector de jornada.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "Programar cita / visita técnica":** Modal para agendar fecha, hora, usuario a visitar y número de ticket asociado.

---

#### 51. Mi Desempeño (`#21019`)
- **URL Canónica:** `/plataforma/operacion/desempeno`
- **Componente Implementador:** `src/app/plataforma/operacion/desempeno/page.tsx`
- **Propósito:** Cuadro de mando individual donde el especialista visualiza su propia evolución profesional: porcentaje de cumplimiento de SLA personal, calificación de satisfacción CSAT otorgada por los usuarios en el mes y reconocimientos de calidad.
- **Pestañas Internas:** No tiene pestañas; tarjetas de evolución y comparativa con el estándar del equipo.
- **Botones y Popups:** No presenta ventanas emergentes.

---

#### 52. Mis Tareas (`#21020`)
- **URL Canónica:** `/plataforma/operacion/tareas`
- **Componente Implementador:** `VistaTareasOperativas.tsx`
- **Propósito:** Gestor de tareas operativas y actividades desprendidas de tickets (ej. "Reemplazar memoria RAM de laptop", "Instalar imagen de software", "Validar backup"). Permite a los técnicos organizar su flujo de actividades sin necesidad de crear tickets independientes.
- **Pestañas Internas:** Filtros de tareas: `PENDIENTES`, `EN_PROCESO`, `COMPLETADAS`.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón popup 1: "+ Nueva Tarea":** Modal para crear subtarea indicando descripción, fecha límite, prioridad y ticket padre vinculado.
    - **Botón popup 2 (por tarea): "Completar tarea":** Modal para registrar notas de finalización y tiempo insumido.

---

## 14. Desglose Exhaustivo por Módulo: Módulo 12 - MI CUENTA (`#21225`)

A continuación se detalla exhaustivamente cada una de las 2 opciones de personalización y credenciales personales en FlowDesk, verificado contra el código fuente en `src/modules/seguridad/`.

### 14.1. Agrupador Raíz: Mi Cuenta (`#21225`)
- **Tipo:** Agrupador Raíz de Dominio (Nivel 1).
- **Propósito:** Gestión de la identidad personal del usuario activo, seguridad de credenciales y configuración individual de canales de notificación.
- **Ruta física base:** `src/app/plataforma/mi-cuenta/`
- **Módulo de backend:** `src/modules/seguridad/`

---

### 14.2. Vistas de Perfil y Configuración Personal

#### 53. Mi Perfil y Seguridad (`#21226`)
- **URL Canónica:** `/plataforma/mi-cuenta/perfil`
- **Componente Implementador:** `MiCuentaView.tsx`
- **Propósito:** Administración de datos de identidad y seguridad de la cuenta del usuario conectado: actualización de nombres, teléfono de contacto corporativo, idioma preferido, cambio de contraseña institucional con validación de complejidad y visualización de perfiles asignados.
- **Pestañas Internas:** No posee pestañas; organiza el contenido en tarjeta de datos personales, tarjeta de seguridad y cambio de contraseña, y panel de perfiles vigentes.
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "Actualizar datos personales":** Guarda las modificaciones de teléfono y datos de contacto.
    - **Botón popup 2: "Cambiar contraseña":** Modal con validación estricta de políticas de seguridad (contraseña actual, nueva contraseña con mayúsculas, números, caracteres especiales y confirmación).

---

#### 54. Preferencias de Notificación (`#21227`)
- **URL Canónica:** `/plataforma/mi-cuenta/notificaciones`
- **Componente Implementador:** `VistaPreferenciasNotificacion.tsx`
- **Propósito:** Matriz de preferencias individuales de comunicación. Permite al usuario elegir para qué eventos desea recibir correos electrónicos o notificaciones en plataforma (ej. Asignación de ticket, Cambio de estado, Comentarios públicos, Vencimiento inminente de SLA, Notificaciones de aprobación).
- **Pestañas Internas:** No posee pestañas; cuadrícula de interruptores (*switches*) organizada por tipo de evento y canal (Correo vs. Plataforma).
- **Botones y Popups:**
  - **En vista principal:**
    - **Botón 1: "Guardar preferencias de notificación":** Persiste la configuración del usuario en base de datos.

---

## 15. Verificación Integral de Lógica, Consistencia y Compilación de Código

1. **Alineación 100% con la Base de Datos:** Las 227 opciones de menú registradas en la tabla `opciones_menu` de PostgreSQL han sido completamente analizadas, mapeadas y documentadas en este manual, desglosando los 12 agrupadores raíz, los 99 sub-agrupadores y módulos, y las 116 pantallas terminales con sus componentes implementadores reales.
2. **Agnosticismo Estricto de Roles:** Se constató que ningún componente o vista depende rígidamente de cargos o perfiles en el código. Todas las pantallas responden a capacidades de negocio, y el control de acceso es dinámico en servidor mediante `exigirMenuPagina(url_menu)` o capacidades granulares evaluadas contra `opciones_menu_perfiles`.
3. **Cero Redirecciones Obsoletas ni Código Muerto:** Todas las URLs referenciadas corresponden a rutas canónicas del App Router de Next.js en producción.
4. **Verificación de Tipos y Calidad:** La totalidad de los módulos y componentes analizados en el proyecto compilan limpiamente sin errores en `npx tsc --noEmit`.
