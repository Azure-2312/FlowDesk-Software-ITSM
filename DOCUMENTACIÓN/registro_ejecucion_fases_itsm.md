# Registro de ejecución por fases ITSM

**Corte:** 2026-10-01  
**Alcance:** ejecución integral de permisos, módulos independientes de incidentes y solicitudes, catálogo administrable con formularios dinámicos, gobierno de cambios y RFC, ITAM y CMDB, notificaciones, ciclo editorial de conocimiento y auditoría. Este registro describe el estado real del código y base de datos implementados.

## Decisiones de diseño

- Incidentes y solicitudes de servicio son procesos distintos, con formularios, criterios y flujos diferenciados. Comparten la entidad técnica `ticket` para reutilizar identificadores, comentarios, adjuntos, auditoría y trazabilidad. La API ofrece rutas dedicadas (`/api/incidentes`, `/api/solicitudes`) y fija el tipo del registro en el servidor.
- El solicitante no elige el grupo resolutor. Los registros nuevos se enrutan según la configuración del servicio (`id_departamento_resolutor`) o entran por Mesa de Ayuda (N1); un supervisor solo puede enrutar a un grupo de TI que supervise.
- Los indicadores entregan datos agregados. El Administrador no recibe filas operativas de tickets para ver reportes. Supervisor y Gestor de Área ven sus ámbitos organizativos.
- El acceso al catálogo del servicio se administra mediante perfiles. El backend filtra los servicios que cada perfil puede pedir (`servicio_catalogo_perfiles`).
- El Administrador configura el sistema, formularios, reglas y modelos CMDB; los perfiles operativos conservan la lectura y gestión de sus expedientes según su alcance.

## Fases verificadas y ejecutadas

### 1. Modelo objetivo de menú y rutas

Especificado en [modelo objetivo de menú y rutas ITSM](modelo_objetivo_menu_y_rutas_itsm.md). La jerarquía muestra primero Configuración y luego Reportes al Administrador; los módulos operativos son raíces independientes. Se reemplazaron ventanas flotantes por páginas de edición completas (`/admin/servicios`, `/admin/departamentos-ti`, etc.) para garantizar espacio y usabilidad sin colisiones visuales.

### 2. Alcance por rol y por departamento

- Se quitó al Administrador de las bandejas y escrituras operativas de tickets, cambios y activos. Conserva configuración, auditoría autorizada e indicadores agregados.
- Las bandejas de tickets quedan limitadas para técnicos a su grupo de TI y para supervisores a los grupos asignados. Las decisiones empresariales de aprobación corresponden al Gestor de Área.
- El detalle de departamento TI y el catálogo de departamentos se limitan por perfil; el Administrador mantiene los datos maestros y el Supervisor coordina los grupos asignados.
- Aprobación de departamentos TI exige un usuario supervisor activo.

### 3. Módulos independientes de Incidentes y Solicitudes

- Frontend: `/incidentes` y `/solicitudes`; los antiguos enlaces `/tickets/gestion/incidentes` y `/tickets/gestion/solicitudes` redirigen a los módulos nuevos.
- El acceso directo a esas páginas se comprueba en servidor contra el menú del perfil activo; ocultar el enlace no es el único control.
- Backend: `/api/incidentes` y `/api/solicitudes`, con rutas de detalle y comentarios. El servidor fuerza el tipo del registro y devuelve 404 si se usa la ruta del módulo equivocado.
- Menú activo y seed actualizados: los módulos aparecen para Técnico y Supervisor; no se muestran al Administrador ni al Solicitante.
- Se mantiene `/tickets` como capacidad compartida para operaciones transversales donde la matriz de permisos permite consultar varios tipos.

### 4. Catálogo, audiencias, SLA y formularios dinámicos

- Se puede seleccionar perfiles autorizados al crear o editar un servicio; el API persiste y aplica la audiencia.
- Se valida que una categoría pertenezca al tipo ITIL del servicio. El SLA se precarga desde la categoría en el formulario y puede personalizarse en el servicio.
- Configuración de workflow por servicio asociada al registro del catálogo.
- Se retiró al solicitante la elección de departamento resolutor, cerrando la posibilidad de falsificar `id_departamento` en el API.
- **Formularios dinámicos por servicio:** Implementados y administrables por el Administrador desde `/admin/servicios/[id]/formulario`. Permite definir campos de tipo `texto`, `area`, `numero`, `fecha`, `correo`, `lista` y `casilla`, marcándolos obligatorios u opcionales con textos de ayuda y opciones predefinidas.
- **Enrutamiento y escalamiento por servicio:** El servicio define su grupo resolutor inicial (`id_departamento_resolutor`) y sus reglas de escalamiento automático por horas (`reglas_escalamiento`). Al crear un ticket en `/tickets/gestion/crear`, los campos dinámicos se renderizan en tiempo de ejecución, se validan en `/api/tickets` y se persisten en `ticket.campos_adicionales`.

### 5. Problemas, Cambios y Esquemas RFC

- Módulos y APIs propios (`/problemas`, `/cambios` y `/api/problemas`, `/api/cambios`) con separación estricta de responsabilidades.
- Las listas y detalles de problemas se limitan por grupo para Técnico y Supervisor; altas y cambios de problema validan el grupo y la asociación con incidentes del mismo grupo.
- **Configuración del esquema RFC:** Implementado en `/admin/rfc` con persistencia en `configuracion_rfc` y `/api/admin/rfc-config`:
  - Perfiles solicitantes administrables (Técnico, Gestor de Cambios).
  - Reglas base: exigencia de elemento de configuración afectado (`exige_ci`), plan de pruebas (`exige_plan_pruebas`), plan de reversión obligatorio (`exige_rollback`), admisión de cambios de emergencia (`permite_emergencia`) y duración máxima de ventana en horas (`duracion_maxima_horas`).
  - Campos personalizados dinámicos configurables por el Administrador, persistidos en `cambio.campos_adicionales` y validados en el servidor.
  - Vista previa interactiva de la plantilla de solicitud RFC y especificación clara de los circuitos de aprobación colegiada (Estándar, Normal con comité CAB y Emergencia con ECAB).
  - Integración en el formulario de creación `/cambios/gestion/crear` y endpoint `/api/cambios`.

### 6. Activos y CMDB (ITAM y SACM)

- **Configuración de Activos y CMDB:** Enlace administrativo disponible para el Administrador para modelar tipos de CI y clases maestras.
- **Catálogo de tipos y modelos:** Catálogo maestro de tipos de activo (`tipo_activo_catalogo`) vía `/api/activos/tipos` y modelos de hardware/software (`modelo_activo`) vía `/api/activos/modelos`, incorporando método de depreciación lineal, vida útil en meses y porcentaje de valor residual.
- **Ciclo de vida y transiciones:** Matriz formal de estados y transiciones (`transicion_activo`) que impide transiciones no autorizadas y exige justificación obligatoria para transiciones restrictivas o baja de equipos.
- **Trazabilidad y custodia:** Bitácora inmutable de ciclo de vida (`activo_historial`) vía `/api/activos/[id]/historial`, registrando cada cambio de estado, motivo y traspaso de custodio, visible desde la vista de detalle de inventario en `/activos/inventario`.
- **Gestión de licencias de software (SAM):** Asignación y revocación de licencias a usuarios individuales o activos de hardware (`licencia_asignacion`) vía `/api/activos/licencias/asignaciones`, con control estricto de cupos disponibles y fecha de devolución en `/activos/licencias`.
- **Topología CMDB:** Modelado de tipos de CI (`/activos/cmdb/tipos`) y relaciones de dependencia, alojamiento y conexión (`ci_relacion`) en `/activos/cmdb`.

### 7. Comunicaciones, auditoría y gobierno del conocimiento

- **Motor de reglas de notificación:** Configuración en `/admin/notificaciones` y `/api/admin/notificaciones/reglas` vinculada a la tabla `regla_notificacion`. Permite activar eventos de disparo (`TICKET_CREADO`, `TICKET_RESUELTO`, `RFC_ENVIADA_CAB`), definir plantillas y asociar destinatarios por rol (`SOLICITANTE`, `TECNICO_ASIGNADO`, `SUPERVISOR_GRUPO`, `CAB`, `GESTOR_CAMBIO`, `GESTOR_AREA`).
- **Ciclo de vida editorial de conocimiento (KCS):** Base de artículos con versionado formal, audiencia segmentada por perfil (`audiencia_perfiles`) respetada en `/api/conocimiento`, bitácora de revisiones (`articulo_conocimiento_historial`) y flujo de retiro con motivo obligatorio en `/api/admin/conocimiento/[id]`.
- **Mantenimiento y purga histórica:** Herramienta en `/admin/mantenimiento-datos` con capacidad de simulación y purga irreversible de tickets antiguos cerrados con registro en `log_auditoria_sistema`.
- **Diseñador de reportes y tableros:** Interfaz en `/admin/reportes-disenador` para estructurar widgets e indicadores ejecutivos de gestión.
- **Seguridad e integridad de la interfaz:** Se erradicaron ventanas flotantes superpuestas reemplazándolas por flujos de página completos con botón de retorno; se garantizó cero uso de emojis en interfaces y código, y se mantuvo el uso estricto del término "usuario" (cero "cuenta").

### 8. Reconciliación de requisitos e historias

Los documentos de requisitos funcionales ([requerimientos_funcionales.md](requerimientos_funcionales.md)), reglas de negocio ([reglas_de_negocio.md](reglas_de_negocio.md)), requerimientos no funcionales ([requerimientos_no_funcionales.md](requerimientos_no_funcionales.md)), historias de usuario ([historias_de_usuario.md](historias_de_usuario.md)) y la matriz de trazabilidad ([matriz_trazabilidad_funciones_hu_rf_rn.md](matriz_trazabilidad_funciones_hu_rf_rn.md)) reflejan con precisión el comportamiento técnico, las rutas y las entidades de datos implementadas en el sistema.

### 9. Consolidación de Consola Integral y Navegación Administrativa Paramétrica

- **Consola de Todos los Tickets (`/tickets/gestion/todos` / `TablaTickets.tsx`):** Pestañas independientes para Incidentes, Solicitudes de Servicio, Problemas ITIL y Solicitudes de Cambio (RFC), permitiendo segmentar y consultar cada práctica desde sus respectivos endpoints. Modal flotante de filtrado avanzado por tipo, prioridad, estado, departamentos, solicitante, técnico y SLA.
- **Segregación SoD para el Administrador en la Ficha del Ticket:** En `VistaTicketAdministrador`, el Administrador opera en modo estricto de auditoría y gobernanza sin botones operativos (sin autoasignación, sin iniciar atención, sin elevar a problema y sin notas técnicas directas).
- **Enrutamiento Paramétrico de la Configuración Administrativa:** Integración de `useSearchParams` con límites `Suspense` en `/admin/servicios?tipo=1|2`, `/admin/tickets-formularios?tipo=...`, `/admin/tickets-vistas?seccion=estados`, `/admin/rfc?seccion=requisitos|aprobaciones` y `/admin/notificaciones?proceso=...`.
- **Diseñador del Portal de Autoservicio (`/admin/portal-autoservicio`):** Vista de tarjetas con iconografía ITIL tipificada (red, hardware, software, acceso, periféricos) y asignación granular de audiencias por perfil institucional con acciones masivas.
- **Flujo de Estados y Acciones en `/admin/tickets-vistas`:** Matriz interactiva del ciclo de vida ITIL (Abierto, Asignado, En Proceso, En Espera, Resuelto, Cerrado, Cancelado), reglas de transición por rol, pausas automáticas de SLA y ventanas temporales de reapertura y cierre tácito.

### 10. Implementación Integral de Formularios Dinámicos, Vistas Simuladas, Saneamiento de Menú y Auditoría de Seguridad (Fases A, B, C, D)

- **Diseñador de Formularios Dinámicos con Selector Superior de Usuario/Perfil (`/admin/tickets-formularios`):**
  - Selector superior horizontal que permite gobernar por Perfil Base o por Usuario individual del directorio institucional.
  - Comprobación de estado habilitado con banner de alerta visual y botón de activación a la izquierda (*"Habilitar para este usuario"*).
  - Activación y desactivación de botones normativos predeterminados (`btn_guardar_enviar`, `btn_guardar_borrador`, `btn_cancelar`, `btn_adjuntos_rapidos`, `btn_limpiar_formulario`) con sus roles en el flujo.
  - Parametrización de visibilidad y obligatoriedad de campos estándar ITIL.
  - Constructor de campos dinámicos personalizados (texto, área, número, fecha, lista desplegable, casilla) con validación y guardado persistente en `configuracion_sistema` (`formularios_ticket_config`).
- **Simulador Interactivo de Vistas de Ticket por Usuario/Perfil (`/admin/tickets-vistas`):**
  - Selector superior de usuarios y perfiles institucionales.
  - Verificación de habilitación para el tipo de caso (Incidentes, Solicitudes, Problemas, Cambios).
  - Interruptores de control para notas técnicas internas (work notes confidenciales), respuestas públicas, panel CMDB, reloj de SLA y botones operativos de transición.
  - Renderizado en tiempo real de la ficha exacta de cómo ese usuario específico observará el ticket en producción, permitiendo validar la privacidad de apuntes internos y la segregación SoD.
- **Saneamiento Exhaustivo de Colisiones de URLs en Menú (Migración `20261010_saneamiento_colisiones_urls_menu.sql`):**
  - Se erradicaron las 29 colisiones de URLs en `opciones_menu`, logrando **cero duplicados** en toda la jerarquía activa.
  - Se desactivaron registros legados y huérfanos sin asignación de perfiles (IDs 533, 550, 551, 552, 560, 561, 572, 573, 580, 581, 582, 590, 591, 5200).
  - Se asignaron URLs unívocas y parametrizadas para opciones operativas y administrativas (`/admin/servicios?vista=categorias`, `/admin/servicios?vista=sla`, `/admin/departamentos?vista=supervisores`, `/activos/inventario?seccion=tipos`, `/activos/inventario?seccion=ciclo-vida`, `/admin/notificaciones?seccion=plantillas`, etc.).
- **Gobernanza de Activos y Modelado CMDB para Administrador (`/activos/inventario` y `/activos/cmdb/tipos`):**
  - Pestañas dedicadas en inventario para "Inventario Operativo (HAM)", "Tipos, Modelos y Reglas de Depreciación" y "Ciclo de Vida y Transiciones Autorizadas".
  - Gestión de modelos de hardware homologados con vida útil en meses, método de depreciación lineal contable y valor residual porcentual.
  - Matriz de estados y transiciones permitidas con compuertas de seguridad y sustento obligatorio.
  - Límite `Suspense` y modo administrativo en el modelado de clases de CI (`/activos/cmdb/tipos?modo=admin`).
- **Plantillas de Notificación y Eventos de Seguridad ISO 27001 (`/admin/notificaciones` y APIs de Autenticación):**
  - Incorporación en el diseñador de notificaciones de las plantillas HTML para "Recuperación de Contraseña" y "Entrega de Credenciales de Nuevo Usuario".
  - Registro automático en `log_auditoria_sistema` ante eventos de restablecimiento de contraseña vía código de seguridad verificado, modificación administrativa de contraseñas, activación/suspensión de usuarios y bloqueo preventivo tras superar 3 intentos fallidos.

### 11. Auditoría Forense con Diff Paramétrico, Base de Conocimientos KCS Tripartita, Segregación SoD en Aprobaciones y Visualización Ejecutiva en Dashboards

- **Auditoría Forense con Diff Paramétrico e Inspección Forense (`/admin/auditoria-sistema`):**
  - Registro automático y granular de mutaciones de configuración en `log_auditoria_sistema` con pares `{ anterior, nuevo }`:
    - Cambios en objetivos SLA (`sla_horas_resolucion`, `sla_horas_respuesta`), nombres y estados de servicios en catálogo (`/api/servicios/[id]` y `/api/servicios`).
    - Reglas del esquema RFC (rollback obligatorio, plan de pruebas, duración máxima de ventana) en `/api/admin/rfc-config`.
    - Reglas y plantillas de notificación institucional en `/api/admin/notificaciones/reglas`.
    - Publicación y audiencias de autoservicio en `/api/admin/portal-config`.
    - Asignación de supervisores y configuración de departamentos técnicos en `/api/departamentos-ti/[id]`.
  - Filtros por rango de fechas (`fecha_desde`, `fecha_hasta`) y tipología de acción en `/api/admin/auditoria-sistema`.
  - Inspector forense modal en `/admin/auditoria-sistema` con visor de cambios tabulados para valores anteriores vs nuevos, y exportación de bitácora a CSV estructurado con codificación UTF-8 BOM.
- **Gobierno y Gestión del Conocimiento KCS (`/admin/conocimiento-config`):**
  - Arquitectura tripartita con tres pestañas operativas y de gobernanza:
    1. *Artículos y Ciclo de Vida Editorial:* Catálogo de artículos con código `KCS-XXXX`, filtros por estado (Borrador, En Revisión, Publicado, Retirado), modal de redacción con soporte Markdown, transiciones de estado asistidas y bitácora de trazabilidad histórica.
    2. *Categorías de Ayuda:* Maestro administrable vía `/api/admin/conocimiento/categorias` con conteo en tiempo real de artículos vinculados, control de activación y auditoría.
    3. *Gobernanza y Políticas KCS:* Matriz interactiva de los 9 perfiles institucionales para autoría y aprobación vía `/api/admin/conocimiento/politicas` persistida en `configuracion_sistema`, compuerta de aprobación previa obligatoria y frecuencia de auditoría de vigencia.
- **Autoexclusión SoD en Bandeja de Aprobaciones de Negocio (`/tickets/gestion/aprobaciones`):**
  - Implementación en cliente de control preventivo de Segregación de Funciones (SoD) conforme a ISO 27001.
  - Detección automática en la bandeja cuando el Gestor de Área logueado es el solicitante original del requerimiento (`t.id_usuario_solicitante === idUsuarioActual`).
  - Ocultamiento de controles de aprobación/rechazo y despliegue del badge y panel de alerta de *Autoexclusión SoD*.
  - Validación complementaria en servidor en `PATCH /api/tickets/[id]` retornando HTTP 403 Forbidden si el solicitante intenta aprobar su propia solicitud.
- **Diseñador de Dashboards y Reportes Ejecutivos (`/admin/reportes-disenador` y `/tickets/reportes`):**
  - Persistencia de configuración y widgets de reportes en `configuracion_sistema` (`reportes_tablero_config`) vía `/api/admin/reportes-disenador`.
  - Nuevas métricas en `/api/reportes/indicadores` desglosando resolución y cumplimiento de SLA por tipo ITIL (Incidentes vs Solicitudes) y carga activa por prioridad (P1 a P4).
  - Renderizado en `/tickets/reportes` de gráficos de pastel SVG puros y accesibles para demanda por tipo ITIL y carga activa por prioridad.
  - Barras comparativas de SLA con indicador visual frente a la meta institucional del 80% y pipeline de tickets activos.
- **Normalización de Botones de Guardado y Navegación Estricta por Proceso:**
  - Reubicación uniforme del botón de guardar al fondo absoluto de la configuración en `/admin/tickets-formularios`, `/admin/tickets-vistas` y `/admin/rfc`, eliminando colisiones de envoltura visual en la cabecera superior y asegurando que el guardado corone el fin de la parametrización.
  - Erradicación de pestañas y botones cruzados entre procesos dentro de páginas específicas (ej. eliminados selectores a problemas y cambios dentro del configurador de incidentes), respetando que cada proceso cuenta con su propia opción jerárquica en el menú lateral.

### 12. Reestructuración de Catálogo por Categorías Técnicas y Depuración Estricta de Autoservicio

- **Catálogo de Servicios Agrupado por Categorías Técnicas (`/admin/servicios?tipo=1` y `?tipo=2`):**
  - Navegación por catálogo en dos niveles:
    1. *Nivel 1 (Taxonomía Técnica):* Cuadrícula de tarjetas con iconos vectoriales SVG para cada dominio tecnológico (Redes y Conectividad, Seguridad de la Información, Hardware y Estaciones de Trabajo, Software Ofimático y Aplicaciones, Infraestructura y Servidores, Bases de Datos y Almacenamiento, Telefonía IP, Impresión y Periféricos, Correo y Colaboración Cloud, Servicios Cloud y DevOps, Aprovisionamiento Cloud, Telefonía IP Móvil, Impresión y Consumibles, Certificados Digitales y Firma Electrónica, Capacitación y Asistencia Técnica). Cada tarjeta expone nombre, descripción técnica, volumen de servicios configurados y estado de disponibilidad.
    2. *Nivel 2 (Servicios por Categoría):* Vista focalizada al seleccionar cualquier categoría técnica, con migas de pan y botón de retorno contextual (`← Volver a Categorías...`), cabecera con resumen del SLA base de la categoría, y botón de acción directa `+ Nuevo Servicio en esta Categoría`.
  - Eliminación de selectores cruzados redundantes entre Incidentes y Solicitudes en la barra de filtros, manteniendo el filtro de ciclo de vida (Servicios Activos, Servicios Deshabilitados, Todos los Estados).
  - Ampliación en base de datos `categoria_ticket` incorporando las categorías oficiales ITIL v4 tanto para Incidentes (`id_tipo_ticket = 1`) como para Solicitudes de Servicio (`id_tipo_ticket = 2`).
- **Eliminación Definitiva de "Acceso por perfil o criterio de audiencia":**
  - Depuración completa en base de datos eliminando la opción de menú `id_opcion_menu = 524` y sus relaciones jerárquicas en `opciones_menu_perfiles` y `opciones_menu`.
  - Supresión del frontend `/admin/portal-autoservicio` y de la API backend `/api/admin/portal-config`.
  - Retiro de tarjetas de acceso en el panel principal de administración (`/admin`).
- **Eliminación de "Categorías y ofertas publicadas" y Consolidación del Menú:**
  - Depuración en base de datos eliminando la opción redundante `id_opcion_menu = 523` de `opciones_menu_perfiles` y `opciones_menu`, debido a que la navegación taxonómica por categorías ya está integrada nativamente dentro de cada tipo de servicio.
  - Reordenamiento de la opción `id_opcion_menu = 525` ("Objetivos SLA") a orden 3 bajo "Catálogo de servicios y SLAs" (`id_padre = 520`).
- **Módulo Integral de Objetivos SLA (`/admin/servicios?vista=sla` y `/api/admin/sla`):**
  - Parametrización de la matriz institucional de tiempos por prioridad (P1 Crítica, P2 Alta, P3 Media, P4 Baja) con persistencia en `prioridad_ticket`.
  - Configuración de metas institucionales de cumplimiento porcentual (% Target), régimen de cómputo (Hábil vs 24x7) y ventana de jornada laboral en `configuracion_sistema` (`politica_sla_global`).
  - Reglas de congelación automática de temporizador (Stop-the-clock) para estados "En Espera del Solicitante" y "En Espera de Proveedor Externo".
  - Umbrales de alerta preventiva y escalamiento crítico antes de vencimiento formal.
  - Botón de guardado ubicado obligatoriamente al fondo absoluto de toda la configuración, con registro inmutable en `log_auditoria_sistema`.

### 13. Rediseño en Pantalla Dividida de Configuración de Formularios de Creación, Reubicación del Perfil y Desacople de Navegación

- **Configuración de Formulario en Pantalla Dividida (`/admin/tickets-formularios`):**
  - Erradicación definitiva de los modos "por usuario específico" y los botones de activación/desactivación por usuario, restringiendo la parametrización estrictamente al nivel de rol institucional (perfil).
  - Selector desplegable único conteniendo exclusivamente los perfiles autorizados para interactuar con cada proceso ITIL (ej. Solicitante, Técnico, Gestor de Área, Supervisor, Administrador).
  - Eliminación total de "botones normativos y predeterminados".
  - Separación formal entre **Campos Obligatorios Inmutables del Formulario de Registro** (Servicio del Catálogo, Título/Asunto, Nivel de Urgencia, Descripción Detallada, Carga de Evidencias / Archivos Adjuntos, y Línea de Tiempo Dinámica del Ciclo del Caso) y **Elementos del Formulario Configurables por Perfil** (Registrar en nombre de otro usuario, Elemento de Configuración CMDB, Evaluación técnica de impacto institucional, Asignación técnica inicial directa, Justificación de negocio / Centro de costos, Fecha límite deseada, y Campos dinámicos personalizados).
  - Integración en dos columnas sincronizadas en tiempo real: configuración a la izquierda y simulador de la pantalla de registro (formulario de creación) a la derecha, mostrando la línea de tiempo dinámica de 5 hitos (Registro, Triaje, Atención, Resuelto, Cierre) y la zona de evidencias.
  - Botón de guardado reubicado al fondo absoluto de la columna de configuración.
- **Unificación de Opciones de Menú en Procesos:**
  - En Incidentes (`id_padre = 5310`), la opción 5311 fue renombrada a "Configuración de formulario", se eliminó la opción redundante 5312 ("Vistas previas"), y se reordenaron las opciones a: 1. Configuración de formulario, 2. Flujo de estados y acciones, 3. Reglas de notificación.
  - En Solicitudes (`id_padre = 5320`), la opción 5321 fue renombrada a "Configuración de formulario", se eliminó la opción redundante 5322 ("Vistas previas"), y se reordenaron a: 1. Configuración de formulario, 2. Flujo de atención y aprobaciones, 3. Reglas de notificación.
- **Reglas de Notificación sin Enlaces Cruzados (`/admin/notificaciones`):**
  - Ocultamiento de pestañas a plantillas de correo y canales externos cuando se accede desde la opción contextual de un proceso específico (`?proceso=incidente` o `?proceso=solicitud`), garantizando que no existan botones redundantes que dupliquen entradas del menú principal.
  - Reubicación de todos los botones de guardado al fondo de cada formulario y panel.
- **Reubicación Ergonómica del Perfil de Usuario en Barra Lateral:**
  - Eliminación de la barra superior horizontal (`.encabezado`) que ocupaba espacio vertical en todas las vistas de la aplicación.
  - Integración del botón de perfil con iniciales, nombre y correo en el pie de la barra lateral (`.barra-lateral-pie`), ubicado a la izquierda, acompañado a la derecha por el botón compacto de cerrar sesión.

### 14. Parametrización de Formularios de Creación, Prioridad Institucional de Usuarios y Trazabilidad Post-Registro

- **Formularios de Creación Especializados (`/admin/tickets-formularios`):**
  - *Incidentes:* Catálogo oficial de TI, Título o Asunto, Descripción con texto guía contextual (frecuencia de la falla, pasos previos, hora/duración y mensaje/código de error), Nivel de Urgencia (Alta/Media/Baja), Nivel de Impacto (Alta/Media/Baja), Prioridad deducida automáticamente por matriz ITIL 4, Selector de Ítems Tecnológicos CMDB asignados al usuario (hardware y software, opcional), Carga fija de evidencias y archivos adjuntos, y Panel visual del SLA comprometido (Primera Respuesta y Solución Definitiva).
  - *Solicitudes de Servicio:* Catálogo oficial de TI, Título o Asunto, Descripción con texto guía orientativo, Justificación de Negocio / Motivo institucional, Selector de Ítems Tecnológicos CMDB del usuario (opcional), Carga fija de evidencias de respaldo y Selector de Fecha Límite Deseada de Cumplimiento.
- **Escala Institucional de Prioridad de Usuario (5 Niveles):**
  - Incorporación de la columna `nivel_prioridad` (INTEGER DEFAULT 5) en la tabla `usuario`.
  - Escala parametrizada sin importar los perfiles asignados:
    1. *Nivel 1: Prioridad VIP* (Directorio, Gerencia General, Presidencia).
    2. *Nivel 2: Prioridad Ejecutiva* (Gerencias de Área y Subgerencias).
    3. *Nivel 3: Prioridad Preferente* (Jefaturas y Coordinadores de Departamento).
    4. *Nivel 4: Prioridad Operativa* (Especialistas y Analistas Clave de Negocio).
    5. *Nivel 5: Prioridad Estándar* (Colaboradores y Usuarios Generales).
  - Integración en la interfaz de creación y edición de usuarios (`/admin/usuarios`), visualización mediante insignias en la tabla de usuarios, y persistencia en los endpoints `/api/usuarios` y `/api/usuarios/[id]`.
  - Esta prioridad se asocia al ticket para gobernar los tiempos de escalamiento, manteniéndose completamente invisible para el usuario solicitante común.
- **Ficha de Consulta y Seguimiento Post-Registro (`/admin/tickets-vistas`):**
  - Código único del ticket (`#INC-...` / `#SOL-...`).
  - Línea de tiempo secuencial de estado del ticket con 5 puntos formalizados:
    $$\text{Abierto} \longrightarrow \text{Asignado} \longrightarrow \text{En Pausa} \longrightarrow \text{Terminado} \longrightarrow \text{Cancelado}$$
  - Bloque de Técnico Asignado o por Asignar.
  - Nombre del Usuario Solicitante y su Nivel de Prioridad Institucional (visible solo para técnicos y supervisores; oculto al solicitante).
  - En Solicitudes: Campo de *Usuario Beneficiario* (colaborador del mismo departamento empresarial) y sección de *Aprobador Designado* con estado de visto bueno.
  - Espacio de Comunicación Pública: Mensajería bidireccional transparente entre el solicitante y el técnico resolutor.
  - Espacio de Comunicación Interna: Registro privado de notas técnicas (work notes) exclusivo entre especialistas y administradores (oculto al solicitante).

### 15. Catálogo de Servicios: Alta Oficial de Servicios y Asignación Dinámica por Selección Múltiple

- **Opción de Menú Oficial "Crear servicio" (`/admin/servicios?vista=crear`):**
  - Registro en base de datos de la opción `id_opcion_menu = 526` bajo el nodo maestro 520 ("Catálogo de servicios y SLAs"), con asignación al perfil Administrador (1).
  - Permite dar de alta servicios técnicos tanto con categoría asignada como sin categoría inicial (`id_categoria IS NULL`), habilitando la gestión desacoplada del catálogo corporativo.
  - Generación de código estándar: `SRV-INC-[CAT]-NNN` / `SRV-SOL-[CAT]-NNN` o `SRV-[TIPO]-GEN-NNN` para servicios generales pendientes de categorización.
- **Navegación y Acciones en Categorías Vacías (`/admin/servicios`):**
  - Al ingresar a una categoría sin servicios registrados, el sistema presenta un panel informativo con dos acciones operativas:
    1. *Botón "Ir a registrar servicio":* Redirecciona al formulario oficial de creación (`/admin/servicios?vista=crear`) para registrar un nuevo servicio desde cero.
    2. *Botón "+ nuevo servicio en esta categoria":* Abre la vista especializada de asignación con la lista general de todos los servicios sin categoría existente para ese tipo de ticket.
- **Vista de Asignación por Selección Múltiple (Checkboxes):**
  - Presenta la tabla completa de servicios huérfanos/no categorizados (`id_categoria IS NULL`) del tipo de ticket correspondiente (Incidentes o Solicitudes).
  - Casillas de verificación individuales a la izquierda de cada fila y selector global en la cabecera ("Seleccionar todos").
  - Barra de búsqueda reactiva por código, nombre o entregable.
  - *Botón "Agregar servicios":* Ubicado en la esquina inferior derecha de la pantalla. Al confirmar, ejecuta una petición `PATCH /api/servicios` que actualiza en lote los registros seleccionados (`UPDATE servicio_catalogo SET id_categoria = $1 WHERE id_servicio = ANY(...)`), emite una entrada inmutable de auditoría institucional en `log_auditoria_sistema` y refresca la categoría seleccionada.
- **Fundamentación Pedagógica de Objetivos SLA (4 Niveles de Prioridad vs. Escala 1-3 de Urgencia e Impacto):**
  - Documentación de la matriz ITIL 4 / ISO/IEC 20000: la urgencia (1 a 3) y el impacto (1 a 3) componen una matriz de 9 celdas que se consolida en 4 prioridades operativas (P1 Crítica, P2 Alta, P3 Media, P4 Baja).
  - La escala de 4 prioridades previene que incidentes mayores de parálisis corporativa total (P1) se mezclen o compitan en cola con fallas departamentales significativas (P2), garantizando SLAs diferenciados de intervención inmediata en salas de crisis técnica.

### 16. Rediseño de Configuración de Formularios y Acceso de Solicitantes por Prioridad de Usuario

- **Paradigma Funcional Centrado en el Solicitante (`/admin/tickets-formularios`):**
  - Descarte definitivo de la configuración por perfiles internos: los roles de TI (Técnico, Supervisor, Gestor de Área, Auditor y Administrador) visualizan por diseño funcional la totalidad del ticket y sus campos operativos.
  - La parametrización se enfoca exclusivamente en calibrar qué campos, opciones y comunicaciones puede visualizar e interactuar el **usuario solicitante** según su nivel institucional de prioridad (`nivel_prioridad` de 1 a 5: VIP, Ejecutiva, Preferente, Operativa y Estándar).
- **Columna Izquierda: Creación y Gestión Granular de Campos:**
  - *Sección "Crear Nuevo Campo":* Permite incorporar dinámicamente atributos personalizados (texto, área multilínea, número, fecha, lista desplegable con opciones o casilla).
  - *Lista de Campos Configurables:* Cada campo (preconfigurado o personalizado) dispone de:
    1. Control de activación: Habilitado o Deshabilitado para el solicitante.
    2. Control de obligatoriedad: Obligatorio u Opcional en el registro.
    3. Selección múltiple interactiva de niveles de prioridad de usuario que tienen autorización para visualizarlo o usarlo (VIP, Ejecutiva, Preferente, Operativa, Estándar).
  - Erradicación absoluta de textos o advertencias de "campos fijos obligatorios".
  - *Botón de Confirmación:* Ubicado al fondo de toda la configuración para persistir los cambios mediante `/api/admin/configuracion`.
- **Columna Derecha: Doble Vista Previa Interactiva:**
  - Dos selectores principales en la cabecera: **"Vista de Formulario"** y **"Vista de Ticket Creado"**.
  - Simulador reactivo de prioridad de solicitante (permite alternar entre VIP, Ejecutiva, Preferente, Operativa y Estándar para inspeccionar la respuesta visual en tiempo real).
  - *Vista de Formulario:*
    - *Incidentes:* Servicio de catálogo, Título, Descripción con guía de fondo estructurada (frecuencia, pasos previos, hora/duración y mensaje de error), Nivel de Urgencia (Alta/Media/Baja), Nivel de Impacto (Alta/Media/Baja), Prioridad deducida por matriz ITIL 4, Elemento CMDB asignado (hardware/software/periféricos del usuario, opcional), Carga de evidencias de archivos y SLAs asociados, junto con los campos adicionales habilitados para la prioridad simulada.
    - *Solicitudes:* Servicio de catálogo, Título, Descripción contextual, Justificación formal de necesidad, Elemento CMDB asignado, Carga de evidencias y Fecha límite deseada, junto con los campos adicionales activos.
  - *Vista de Ticket Creado (Post-Registro):*
    - Código único de ticket (`#INC-2026-...` / `#SOL-2026-...`).
    - Línea de tiempo secuencial ITIL con 5 puntos formalizados: Abierto, Asignado, En Pausa, Terminado y Cancelado.
    - Bloque de Técnico Asignado.
    - Nombre del Usuario Solicitante e insignia distintiva de su nivel de prioridad institucional.
    - Prioridad calculada del ticket.
    - En solicitudes: Usuario Beneficiario (mismo departamento) y sección de Aprobador con estado de visto bueno.
    - Resumen de atributos y valores registrados en el formulario.
    - Espacio de Comunicación Pública: Mensajería bidireccional entre solicitante y técnico.
    - Espacio de Comunicación Interna: Registro privado de notas técnicas (work notes), visible para el solicitante si cuenta con nivel autorizado (ej. VIP / Ejecutiva) o adecuadamente oculto con panel de restricción para solicitantes estándar.

### 17. Catálogo de Servicios: Sincronización Reactiva de URL y Aislamiento de Estado en Navegación

- **Diagnóstico del Comportamiento Anómalo:**
  - Al acceder a la opción "Crear servicio" (`/admin/servicios?vista=crear`), el componente `VistaCatalogoServicios` establecía su estado interno `vista` en `"nuevo"`.
  - Al hacer clic posterior en el menú lateral para ir a "Servicios de Incidentes" (`/admin/servicios?tipo=1`) o "Servicios de Solicitudes" (`/admin/servicios?tipo=2`), Next.js actualizaba la URL en el navegador pero el estado interno `vista` permanecía estancado en `"nuevo"`, impidiendo que el usuario viera las tarjetas de categorías técnicas.
- **Solución Implementada:**
  - *Clave de Montaje Dinámica (`key`):* En el componente contenedor `ContenidoAdminServicios` se asignó a `VistaCatalogoServicios` una clave única basada en los parámetros de búsqueda: `key={`${vistaParam || "catalogo"}-${tipoParam || "1"}`}`. Esto garantiza que cualquier cambio de sección o tipo remonte limpiamente el componente con su estado prístino.
  - *Sincronización Reactiva en `useEffect`:* Se parametrizó la escucha directa de `[vistaParam, tipoParam]` en `VistaCatalogoServicios`. Si `vistaParam === "crear"` se activa el formulario oficial de alta; si no está presente (e.g. `?tipo=1` o `?tipo=2`), se resetea incondicionalmente el modo a `"tabla"`, se limpia cualquier selección residual de categoría y se reinician los filtros, permitiendo una transición instantánea entre vistas.

### 18. Configuración de Formularios: Diseño Compacto en Fila Única, Prioridad Mínima Requerida y SLAs Dinámicos en Inputs No Editables

- **Diseño Compacto en Fila Única por Campo (`/admin/tickets-formularios`):**
  - Cada elemento del formulario se presenta en una sola fila horizontal optimizada y ergonómica, eliminando tarjetas sobredimensionadas:
    1. *Nombre y descripción breve:* Etiqueta del campo en negrita, tipo de dato y descripción breve justo debajo con corte elíptico.
    2. *Check de activación:* Casilla rápida a la derecha del nombre para habilitar o deshabilitar el campo para el solicitante.
    3. *Botón de obligatoriedad:* Botón interactivo que alterna inmediatamente entre *"Obligatorio"* (resaltado) y *"Opcional"*.
    4. *Selector desplegable de prioridad mínima requerida:* Menú desplegable con las 5 prioridades institucionales para definir el umbral mínimo que debe poseer el usuario solicitante para visualizar el campo (Prioridad Estándar = Todos, Prioridad Operativa = Operativa o superior, Prioridad Preferente = Jefaturas o superior, Prioridad Ejecutiva = Gerencias y VIP, Prioridad VIP = Exclusivo VIP).
    5. *Botón de tacho de basura:* Botón de acción con icono SVG para eliminar el campo de la configuración del formulario con diálogo de confirmación previo.
  - Se eliminó completamente el botón de edición y su modal, permitiendo gobernar todas las propiedades directamente sobre la fila.
- **Creación de Nuevos Campos con Selector de Prioridad Mínima:**
  - El formulario de alta de campos incorpora el selector desplegable de prioridad mínima requerida en lugar de listas de casillas múltiples, simplificando la parametrización.
- **Campos de SLA Formales, Dinámicos y No Editables en Formulario:**
  - Sustitución de los contenedores de texto plano estático por **campos de formulario formales (inputs)** con atributo de solo lectura (`readOnly`) y estilo de campo institucional protegido (`backgroundColor: "#f1f5f9"`, cursor bloqueado).
  - Integración interactiva del selector de "Servicio de Catálogo" en la Vista de Formulario:
    - *Incidentes:* Conectividad y Red Cableada Corporativa, Incidente de Seguridad / Malware, Falla de Hardware en Equipo de Cómputo, y Error Crítico en Sistema ERP / Facturación.
    - *Solicitudes:* Aprovisionamiento de Usuario y Correo Institucional, Asignación de Laptop Corporativa para Nuevo Ingreso, Instalación de Software Especializado y Licencias, y Modificación de Permisos en Carpetas Compartidas y VPN.
  - Al cambiar el servicio seleccionado en el desplegable, los inputs formales de SLA se recalculan y actualizan en tiempo real:
    1. *SLA Primera Respuesta Comprometido:* Tiempo normativo comprometido para el diagnóstico inicial.
    2. *SLA Solución Definitiva / Entrega:* Tiempo normativo comprometido para el restablecimiento operativo o despacho.
    3. *Banner Normativo:* Horario de cobertura del catálogo (8x5 o 24x7) y certificación de compromiso ISO/IEC 20000 vigente.
  - Sincronización automática de estos mismos parámetros dinámicos de SLA en la pestaña de "Vista de Ticket Creado" (resumen del caso, detalle registrado y respuestas técnicas en el canal de soporte).

### 19. Desacople Estricto de Navegación por Menú, Erradicación de Botones Cruzados y Circuito de Aprobación de Solicitudes

- **Erradicación de Botones Cruzados en Configuración de Formularios (`/admin/tickets-formularios`):**
  - Se eliminó por completo el bloque superior de botones alternadores `[ Incidentes ] [ Solicitudes de Servicio ]`, respetando que la selección del proceso corresponde exclusivamente al menú de opciones del usuario.
  - El encabezado presenta de forma estricta y unívoca el proceso activo (`Configuración de Formulario: Incidentes` o `Configuración de Formulario: Solicitudes de Servicio`), acompañado de un chip informativo de solo lectura (`PROCESO: INCIDENTES` o `PROCESO: SOLICITUDES DE SERVICIO`).
- **Corrección de Ruta del Menú en "Flujo de atención y aprobaciones" (`id_opcion_menu = 5323`):**
  - La opción de menú 5323 apuntaba erróneamente a `/admin/servicios?vista=flujo` (cargando por defecto servicios de incidentes).
  - Se actualizó en base de datos la ruta a `/admin/tickets-vistas?seccion=estados&tipo=solicitud`, manteniendo simetría total con la opción de Incidentes (`/admin/tickets-vistas?seccion=estados&tipo=incidente`).
- **Especialización del Flujo de Atención y Aprobaciones para Solicitudes (`/admin/tickets-vistas`):**
  - Cuando se accede al flujo con `tipo=solicitud`, el sistema despliega el ciclo de vida y circuito de aprobaciones formal de Solicitudes de Servicio ITIL v4:
    1. *Abierto / Registrado (1):* Enrutamiento al Gestor de Área para validación de jefatura si el servicio tiene costo o requiere licencias.
    2. *Pendiente de Aprobación (2):* Bloqueo preventivo de actividades técnicas y pausa del reloj de SLA hasta dictamen formal.
    3. *Aprobado / Asignado (3):* Visto bueno registrado en bandeja de negocio, habilitando asignación al técnico especialista.
    4. *En Proceso / Aprovisionamiento (4):* Labores de instalación, compras o configuración de accesos.
    5. *En Espera (5):* Pausa de SLA por demora de proveedor o datos faltantes del solicitante.
    6. *Cumplido / Entregado (6):* Entrega formal de activos o credenciales con comprobante.
    7. *Cerrado (7):* Conformidad del solicitante o aceptación tácita automática tras 48 horas.
    8. *Rechazado / Cancelado:* Registro obligatorio de sustento de no aprobación que notifica al solicitante y cierra el caso.

### 20. Consolidación de Medios de Contacto Institucionales y Depuración de Reglas de Notificación

- **Eliminación del Gobierno de Disparo de Eventos y Desactivación de Reglas Redundantes:**
  - Se eliminó por completo la sección/pestaña de gobierno de disparo de eventos y los formularios de reglas acoplados por proceso, considerando que los canales de comunicación y medios de contacto institucionales son únicos para toda la organización y no varían por proceso individual (incidentes, solicitudes, cambios).
  - Se desactivaron en base de datos (`estado_registro = false`) las opciones de menú 5314 y 5324 ("Reglas de notificación") dependientes de los módulos de Incidentes y Solicitudes de Servicio.
- **Creación de la Sección "Configuración de Contacto":**
  - Se renombró la opción 5602 a *"Configuración de contacto"* con ruta directa `/admin/notificaciones?seccion=contacto`, bajo la categoría *"Comunicaciones y notificaciones"*.
  - En `/admin/notificaciones/page.tsx`, se implementó la interfaz de gestión de medios corporativos predeterminados: WhatsApp Business API (teléfono emisor), SMS Gateway (Sender ID), Slack Webhook (URL del canal) y Microsoft Teams (URL del canal).
  - Cada tarjeta de medio de contacto cuenta con control de activación/desactivación y su campo de texto asociado directamente debajo de la descripción.
- **Incorporación Dinámica de Nuevos Medios de Contacto:**
  - Se implementó el botón interactivo **"+ Agregar otro medio de contacto"**, el cual despliega un modal institucional para dar de alta canales personalizados (ej. Discord, Telegram, Correo Institucional Alternativo, PBX).
  - El modal solicita de forma estructurada:
    1. *Nombre del medio de contacto:* Denominación oficial del servicio.
    2. *Descripción breve:* Finalidad técnica del canal.
    3. *¿Qué se requiere ingresar en el campo de texto?:* Etiqueta parametrizada que define el dato exacto a ingresar (ej. "URL del Webhook de Discord", "Correo institucional", etc.).
    4. *Valor inicial opcional.*
  - Al guardar en el modal, el nuevo medio se incorpora de inmediato a la lista visual, renderizando debajo el campo de texto con la etiqueta parametrizada para su configuración y un botón de eliminación en caso de ser necesario descartarlo.
- **Gobernanza y Persistencia:**
  - Botón de guardado posicionado de manera uniforme al fondo de toda la configuración.
  - Persistencia de los medios activos y sus valores en la tabla `configuracion_sistema` bajo la clave `canales_comunicacion`.

## Verificación efectuada

- `npx tsc --noEmit` completó con 0 errores de tipado TypeScript.
- `npm run build` completó la compilación de producción con éxito en todas las rutas estáticas, dinámicas y de API (86/86 rutas optimizadas).
- Se aplicó y verificó la migración `20261010_saneamiento_colisiones_urls_menu.sql` con 0 colisiones restantes en base de datos.
- Se verificó la consistencia estricta de la terminología "usuario" / "usuarios" (cero uso de "cuenta").
- Ausencia total de emojis en interfaces, código y documentación.

## Referentes de diseño

Se utilizaron ITIL 4 para la separación funcional de prácticas (Gestión de Incidentes, Solicitudes de Servicio, Gestión de Problemas, Habilitación del Cambio, Gestión del Catálogo de Servicios, Gestión de Activos de TI y Gestión de la Configuración del Servicio); ISO/IEC 20000-1 para la operación y control del ciclo de servicios; ISO/IEC 27001 para el control de acceso, mínimo privilegio y trazabilidad de eventos; y OWASP ASVS para la validación y autorización robusta del lado del servidor.


