# Guia Metodologica Integral para el Desarrollo de Software de Gestion de Servicios de TI (ITSM / Service Desk)

## 1. Introduccion y Marco Conceptual

El desarrollo de una solucion de software de Gestion de Servicios de TI (ITSM - IT Service Management) para el sector empresarial no puede abordarse como una aplicacion generica de registro de datos (CRUD). Un sistema de esta naturaleza es la columna vertebral operativa de una organizacion: gobierna la atencion de incidentes criticos que detienen lineas de negocio, procesa solicitudes de aprovisionamiento de accesos con implicancias de cumplimiento legal y regulatorio (SOX, GDPR, ISO 27001), supervisa acuerdos contractuales de nivel de servicio (SLA) con penalidades economicas y gestiona la capacidad y productividad del talento tecnico.

Por lo tanto, la construccion de dicho software exige una convergencia estricta entre:
1. **La Ingenieria de Software Rigurosa:** Procesos estandarizados de ingenieria de requisitos (ISO/IEC/IEEE 29148), modelos de calidad de producto (ISO/IEC 25010), arquitectura de software desacoplada (Clean Architecture y Domain-Driven Design) y practicas de programacion extrema (XP) con pruebas guiadas por el comportamiento (BDD).
2. **Los Marcos Normativos Internacionales de TI:** Buenas practicas de ITIL v4, requisitos de gestion de servicios de ISO/IEC 20000-1:2018, gobierno de TI corporativo con COBIT 2019 y controles de ciberseguridad y trazabilidad de ISO/IEC 27001:2022.

```
+----------------------------------------------------------------------------------------------------+
|                      CICLO DE VIDA METODOLOGICO END-TO-END (SDLC PARA ITSM)                         |
+----------------------------------------------------------------------------------------------------+
|  [FASE 1] Investigacion Cientifico-Tecnica, Negocio y Benchmarking                                 |
|     |                                                                                              |
|     v                                                                                              |
|  [FASE 2] Ingenieria de Requisitos Formales (ISO/IEC/IEEE 29148:2018 & ISO/IEC 25010)              |
|     |                                                                                              |
|     v                                                                                              |
|  [FASE 3] Especificacion de Historias de Usuario con Criterios de Aceptacion BDD (Gherkin)         |
|     |                                                                                              |
|     v                                                                                              |
|  [FASE 4] Marco Metodologico Agil y Calidad Continua (Scrumban + XP + TDD + CI/CD)                 |
|     |                                                                                              |
|     v                                                                                              |
|  [FASE 5] Arquitectura de Software de Alta Disponibilidad (DDD + Clean Architecture)               |
|     |                                                                                              |
|     v                                                                                              |
|  [FASE 6] Guia Exhaustiva de Construccion y Codificacion ('Como Codearlo')                         |
|     |                                                                                              |
|     v                                                                                              |
|  [FASE 7] Evaluacion Comparativa: Sistema Normativo Ideal vs. Sistema Desarrollado                 |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Fase 1: Investigacion Preliminar, Descubrimiento del Negocio y Benchmarking

### 2.1. Diagnostico Operativo: Mapeo de Procesos AS-IS vs. TO-BE
Antes de escribir una sola linea de codigo, el equipo de ingenieria debe diagnosticar la situacion actual de la organizacion.

```
                                PROCESO AS-IS (DESESTRUCTURADO)
[Usuario con Problema] ---> (Llamada informal / Correo sin estructurar / Mensaje de WhatsApp)
                                  |
                                  v (Sin ticket, sin trazabilidad, sin SLA)
                             [Técnico TI Resuelve sobre la marcha]
                                  |
                                  v (Sin registro de cambio, sin auditoría SOX)
                             [Incidente Cerrado sin Evidencia]
----------------------------------------------------------------------------------------------------
                                PROCESO TO-BE (GOBERNADO BAJO ITIL 4)
[Usuario con Problema] ---> [Portal Autoservicio / Catálogo Estandarizado / API / Correo]
                                  |
                                  v (Generación automática de Ticket con Código Único)
                             [Evaluación de Impacto x Urgencia = Prioridad Formal]
                                  |
           +----------------------+----------------------+
           | (¿Requiere Aprobación?)                     | (Incidente Técnico Directo)
           v                                             v
[Compuerta de Aprobación Jefatura/Seguridad]    [Asignación por Capacidad y Nivel N1/N2/N3]
           |                                             |
           v (Aprobado)                                  v
[Técnico Ejecuta Workflow Parametrizado] <---------------+
           |
           v
[Categorización de Solución Técnica + Registro en Base de Conocimiento]
           |
           v
[Verificación de SLA (Respuesta / Resolución) + Encuesta de Satisfacción CSAT]
```

### 2.2. Analisis de Viabilidad Multidimensional (Modelo TELOS)
Toda iniciativa de construccion de un software ITSM debe ser validada contra las cinco dimensiones del modelo TELOS:
1. **Viabilidad Tecnica (Technical):** Determinar si el stack tecnologico propuesto (PostgreSQL relacional para integridad transaccional ACID, Node.js/Next.js con TypeScript estricto para evitar errores en tiempo de ejecucion, contenedores Docker para portabilidad) soporta la concurrencia y el volumen de eventos requerido por la organizacion.
2. **Viabilidad Economica (Economic):** Analisis de Costo-Beneficio (ROI). Comparar el Costo Total de Propiedad (TCO) de desarrollar una plataforma propia frente a licencias comerciales (ServiceNow, Jira Service Management, Zendesk). La reduccion del tiempo medio de recuperacion (MTTR) y la automatizacion de aprobaciones amortizan la inversion de desarrollo.
3. **Viabilidad Legal y Regulatoria (Legal):** Garantizar que el sistema cumpla con la legislacion de proteccion de datos personales (e.g., Ley 29733 en Peru, GDPR en Europa) para la anonimizacion de datos de usuarios y con la ley Sarbanes-Oxley (SOX seccion 404) para la inmutabilidad de los registros de aprobacion de accesos a sistemas financieros.
4. **Viabilidad Operativa (Operational):** Evaluar si los usuarios finales y los tecnicos de soporte adoptaran la interfaz. Requiere disenar flujos de autoservicio intuitivos, reduciendo la friccion frente al canal informal tradicional.
5. **Viabilidad de Cronograma (Schedule):** Estructurar el desarrollo en sprints iterativos e incrementales bajo un plan de entregas continuas de valor.

### 2.3. Mapeo de la Cadena de Valor del Servicio (ITIL v4 Service Value Chain)
El software a disenar debe soportar las 6 actividades fundamentales de la cadena de valor:
- **Planificar (Plan):** Reportes de demanda, SLAs y distribucion de tickets por servicio para que la direccion planifique inversiones en hardware y personal.
- **Mejorar (Improve):** Evaluacion de calificaciones CSAT y categorias de resolucion para identificar cuellos de botella y fallas de software recurrentes.
- **Comprometer (Engage):** Canal de comunicacion omnicanal entre el usuario final, el service desk y los especialistas tecnicos.
- **Disenar y Transicionar (Design & Transition):** Catalogo de servicios parametrizado con flujos de aprobacion y tiempos comprometidos antes del pase a produccion.
- **Obtener/Construir (Obtain/Build):** Gestion de solicitudes de equipamiento (ITAM) y adquisicion de licencias vinculadas a departamentos.
- **Entregar y Soportar (Deliver & Support):** Monitoreo continuo de tickets abiertos, pausas de SLA por responsabilidad externa y resolucion clasificada.

---

## 3. Fase 2: Ingenieria de Requisitos Formales segun ISO/IEC/IEEE 29148:2018

La norma internacional ISO/IEC/IEEE 29148:2018 establece que cada requisito debe poseer caracteristicas obligatorias de calidad: ser necesario, no ambiguo, consistente, verificable/testeable, completo y trazable.

### 3.1. Catalogo de Requisitos Funcionales (RF)

A continuacion se presenta la especificacion exhaustiva de los requisitos funcionales medulares del sistema:

#### RF-01: Autenticacion Segura con Bloqueo Progresivo y Evaluacion de Politicas
- **Descripcion:** El sistema debe autenticar la identidad de los usuarios mediante credenciales corporativas unicas (correo electronico y contrasena cifrada). Tras 3 intentos fallidos consecutivos de inicio de sesion dentro de una ventana de 15 minutos, la cuenta debe ser bloqueada automaticamente, requiriendo un captcha matematico de verificacion o intervencion administrativa para su restablecimiento.
- **Entradas:** Correo electronico corporativo, contrasena en texto plano, respuesta a desafio captcha (si esta activado).
- **Procesamiento:**
  1. Verificar si la cuenta se encuentra en estado `bloqueado = true` o inactiva. En caso afirmativo, denegar autenticacion con mensaje explicito.
  2. Consultar el hash bcrypt almacenado en la tabla `usuario`.
  3. Ejecutar la comparacion criptografica en tiempo constante mediante `bcrypt.compare`.
  4. Si la contrasena no coincide: incrementar el contador de intentos fallidos en `politica_bloqueo`, registrar evento de auditoria en `log_seguridad` con IP y User-Agent. Si el contador llega a 3, marcar la cuenta como bloqueada.
  5. Si la contrasena coincide: reiniciar el contador de intentos fallidos, verificar si la contrasena ha superado los 90 dias de vigencia (`fecha_cambio_clave`). Si ha expirado, forzar redireccion a cambio obligatorio de clave.
  6. Generar token JWT firmado criptograficamente conteniendo el identificador de usuario, nombre y listado de perfiles autorizados.
  7. Inyectar el token en una cookie de respuesta con directivas `HttpOnly`, `SameSite=Lax` y `Secure` (en entornos HTTPS).
- **Salidas:** Cookie de sesion cifrada, redireccion al dashboard o al selector de perfil activo.
- **Manejo de Excepciones:** Credenciales invalidas (HTTP 401), cuenta bloqueada temporalmente (HTTP 403), servidor de base de datos no disponible (HTTP 503).
- **Prioridad MoSCoW:** Must Have (Obligatorio).

#### RF-02: Gestion de Perfiles Basados en Roles (RBAC Dinamico) y Aislamiento de Menus
- **Descripcion:** El sistema debe controlar el acceso a modulos, pantallas y endpoints API en funcion del perfil activo seleccionado por el usuario. Un usuario puede poseer multiples perfiles asignados (e.g., Tecnico y Empleado), pero en cada momento opera bajo un unico perfil activo con permisos independientes.
- **Entradas:** Identificador de perfil seleccionado (`id_perfil`).
- **Procesamiento:** Validar que el usuario tenga efectivamente asignado el perfil en `usuario_perfiles`. Emitir nuevo token JWT con el perfil activo actualizado. Filtrar las opciones de navegacion consultando `perfil_opcion_menu`.
- **Salidas:** Arbol de navegacion dinamico en formato JSON, bloqueo de rutas no autorizadas por middleware.
- **Prioridad MoSCoW:** Must Have (Obligatorio).

#### RF-03: Catalogo Corporativo de Servicios con SLAs y Workflows Parametrizados
- **Descripcion:** El sistema debe proveer una estructura jerarquica de servicios de TI clasificados en familias operativas, especificando codigos unicos (nemotecnicos), criticidad del negocio, tiempos objetivo de SLA (horas de respuesta y resolucion), costo financiero estimado y requerimiento de aprobacion previa.
- **Entradas:** Datos del servicio (codigo, nombre, descripcion, familia, criticidad, SLA respuesta, SLA resolucion, indicador de aprobacion, rol aprobador, costo).
- **Procesamiento:** Validar unicidad del codigo de servicio. Registrar el servicio en `servicio_catalogo`. Si se definen pasos de workflow, registrar la secuencia ordenada en `workflow_paso`.
- **Salidas:** Registro persistido en base de datos, exposicion en vistas publicas de autoservicio y de administracion.
- **Prioridad MoSCoW:** Must Have (Obligatorio).

#### RF-04: Registro y Tipificacion Formal de Tickets (Incidentes vs. Solicitudes)
- **Descripcion:** El sistema debe permitir la creacion de tickets diferenciando estrictamente entre Incidentes (restauracion de una falla de servicio) y Solicitudes de Servicio (requerimientos rutinarios de hardware, software o accesos).
- **Entradas:** Tipo de ticket (`INCIDENTE` o `SOLICITUD`), servicio del catalogo (opcional para incidentes genericos, obligatorio para solicitudes), departamento responsable, titulo, descripcion, canal de comunicacion (`PORTAL_WEB`, `CORREO_ELECTRONICO`, `TELEFONO_HELPDESK`, `CHATBOT_TEAMS_SLACK`, `PRESENCIAL`, `MONITOREO_AUTOMATICO`), niveles de impacto y urgencia.
- **Procesamiento:**
  1. Generar codigo unico correlativo secuencial con formato `INC-YYYY-XXXXX` o `REQ-YYYY-XXXXX`.
  2. Determinar la prioridad final aplicando la matriz matricial:
     - Impacto Alto x Urgencia Alta = Prioridad Critica.
     - Impacto Alto x Urgencia Media = Prioridad Alta.
     - Impacto Medio x Urgencia Media = Prioridad Media.
     - Impacto Bajo x Urgencia Baja = Prioridad Baja.
  3. Si el ticket proviene de un servicio del catalogo con `requiere_aprobacion = true`: establecer el estado inicial en `PENDIENTE_APROBACION` y asignar el paso inicial del workflow correspondiente.
  4. En caso contrario: establecer el estado inicial en `ABIERTO` o `NUEVO`.
  5. Calcular y asignar la `fecha_limite_respuesta` y `fecha_limite_resolucion` a partir de los tiempos configurados en el servicio o la prioridad.
- **Salidas:** Ticket registrado con trazabilidad de creacion y emision de notificaciones.
- **Prioridad MoSCoW:** Must Have (Obligatorio).

#### RF-05: Compuertas de Aprobacion Jerarquica con Auditoria SOX/ISO 27001
- **Descripcion:** Los tickets que involucren cambios en accesos, erogaciones financieras o modificaciones de infraestructura critica deben someterse a compuertas de aprobacion obligatorias antes de que el personal tecnico pueda iniciar labores.
- **Entradas:** Identificador del ticket, decision del aprobador (`APROBADO` o `RECHAZADO`), comentario de justificacion formal.
- **Procesamiento:**
  1. Verificar que el usuario que ejecuta la decision posea perfil de Aprobador, Supervisor o Administrador.
  2. Insertar registro inmutable en `ticket_aprobacion` con `id_ticket`, `id_usuario_aprobador`, `decision`, `comentario` y `fecha_decision = now()`.
  3. Si la decision es `APROBADO`: actualizar `estado_aprobacion = 'APROBADO'`, cambiar el estado del ticket a `ASIGNADO` o `EN_PROGRESO`, e insertar nota en la bitacora de auditoria.
  4. Si la decision es `RECHAZADO`: actualizar `estado_aprobacion = 'RECHAZADO'`, cambiar el estado del ticket a `CANCELADO` o `RECHAZADO`, cerrando el requerimiento.
- **Salidas:** Ticket desbloqueado para atencion tecnica o archivado como rechazado, registro de auditoria completo.
- **Prioridad MoSCoW:** Must Have (Obligatorio).

#### RF-06: Cronometro de SLA con Suspension por Espera de Terceros (Stop-the-Clock)
- **Descripcion:** El sistema debe contabilizar el tiempo transcurrido frente a los compromisos de SLA de respuesta y resolucion. Si el ticket pasa al estado `EN_ESPERA` debido a requerimiento de informacion al usuario o espera de un proveedor externo, el cronometro de SLA debe detenerse, registrando la marca temporal de inicio de pausa. Al retornar a `EN_PROGRESO`, se deben calcular los minutos transcurridos en pausa, sumarlos al acumulador historico `tiempo_pausado_minutos` y aplazar la fecha de vencimiento proporcionalmente.
- **Entradas:** Transicion de estado de ticket a `EN_ESPERA` o reanudacion desde `EN_ESPERA` a `EN_PROGRESO`.
- **Procesamiento:**
  1. Al pausar: registrar `fecha_ultima_pausa = now()`.
  2. Al reanudar: calcular `diferencia_minutos = extract(epoch from (now() - fecha_ultima_pausa)) / 60`.
  3. Actualizar `tiempo_pausado_minutos = tiempo_pausado_minutos + diferencia_minutos`.
  4. Desplazar `fecha_limite_resolucion = fecha_limite_resolucion + interval '1 minute' * diferencia_minutos`.
  5. Restablecer `fecha_ultima_pausa = NULL`.
- **Salidas:** Metricas de SLA justas y auditables sin penalizacion injustificada al equipo de soporte.
- **Prioridad MoSCoW:** Must Have (Obligatorio).

#### RF-07: Asignacion y Balanceo de Carga de Trabajo Tecnico (WIP Limits)
- **Descripcion:** El sistema debe controlar la asignacion de tickets considerando el departamento responsable, el nivel de soporte requerido (N1, N2, N3), el estado operativo del tecnico (`DISPONIBLE`, `EN_TURNO`, `EN_CAPACITACION`, `LICENCIA`) y el limite de tickets simultaneos permitidos (`capacidad_maxima_tickets`).
- **Entradas:** Identificador de ticket, identificador del tecnico asignado.
- **Procesamiento:** Validar que el tecnico pertenezca al departamento correspondiente y que su conteo actual de tickets activos no supere su capacidad maxima establecida.
- **Salidas:** Ticket asignado formalmente con actualizacion de `id_usuario_asignado`.
- **Prioridad MoSCoW:** Should Have (Importante).

#### RF-08: Categorizacion de la Solucion y Cierre Formal del Ticket
- **Descripcion:** Todo ticket que transicione a estado `RESUELTO` debe incluir de forma mandatoria una descripcion textual de la solucion tecnica ejecutada y la seleccion de una clasificacion tipificada (`categoria_resolucion`), tal como `CAMBIO_CONFIGURACION`, `REEMPLAZO_HARDWARE`, `PARCHE_SOFTWARE`, `CAPACITACION_USUARIO`, `WORKAROUND_APLICADO` o `FALSA_ALARMA`.
- **Entradas:** Texto de solucion tecnica, valor enum de categoria de resolucion.
- **Procesamiento:** Validar que la descripcion posea al menos 10 caracteres significativos. Registrar `fecha_resolucion = now()`. Si el tiempo transcurrido excede `fecha_limite_resolucion`, marcar la bandera de incumplimiento de SLA.
- **Salidas:** Ticket en estado `RESUELTO`, habilitacion del formulario CSAT para el usuario solicitante.
- **Prioridad MoSCoW:** Must Have (Obligatorio).

#### RF-09: Evaluacion de Satisfaccion del Usuario (CSAT)
- **Descripcion:** Una vez que un ticket ha sido marcado como `RESUELTO`, el usuario final creador del ticket debe poder calificar el servicio en una escala del 1 al 5 estrellas, acompanada de comentarios cualitativos sobre la atencion recibida.
- **Entradas:** Puntuacion numerica (1 a 5), texto de comentario opcional.
- **Procesamiento:** Validar que el usuario que califica sea el creador del ticket. Actualizar `calificacion_csat`, `comentario_csat` y `fecha_csat = now()`. Si la calificacion es deficiente (1 o 2 estrellas), emitir alerta al supervisor de soporte para seguimiento de calidad.
- **Salidas:** Calificacion registrada y disponibilidad para metricas agregadas de satisfaccion.
- **Prioridad MoSCoW:** Should Have (Importante).

---

### 3.2. Catalogo de Requisitos No Funcionales (RNF) segun ISO/IEC 25010

| Identificador | Categoria ISO 25010 | Requisito No Funcional Especifico | Metrica de Verificacion Cuantificable |
| :--- | :--- | :--- | :--- |
| **RNF-01** | **Rendimiento:** Comportamiento Temporal | El tiempo de respuesta de los endpoints API de consulta de tickets y catalogos debe ser menor a 500 ms bajo carga normal. | Percentil 95 (P95) < 500 ms medido con pruebas de carga en k6 para 100 usuarios concurrentes. |
| **RNF-02** | **Seguridad:** Confidencialidad y Criptografia | Las contrasenas deben almacenarse utilizando el algoritmo bcrypt con un factor de trabajo (salt rounds) minimo de 10. | Inspeccion automatizada de codigo y verificacion de hashes generados en base de datos. |
| **RNF-03** | **Seguridad:** Proteccion contra Vulnerabilidades Web | La aplicacion debe ser inmune a ataques de inyeccion SQL, Cross-Site Scripting (XSS) y falsificacion de peticiones (CSRF). | Consultas SQL 100% parametrizadas en backend, cookies con flag `HttpOnly` y `SameSite=Lax`. Cero alertas en analisis estatico SAST (SonarQube). |
| **RNF-04** | **Fiabilidad:** Tolerancia a Fallos e Integridad | El motor de base de datos debe operar bajo aislamiento transaccional READ COMMITTED o SERIALIZABLE para evitar condiciones de carrera en la asignacion de tickets. | Pruebas de concurrencia simulando asignacion simultanea del mismo ticket a dos tecnicos distintos. |
| **RNF-05** | **Mantenibilidad:** Modularidad y Cohesion | La arquitectura del software debe presentar desacoplamiento entre las capas de presentacion, logica de negocio y acceso a datos. | Cero dependencias circulares, compilacion TypeScript sin errores en modo estricto (`strict: true`). |
| **RNF-06** | **Usabilidad:** Accesibilidad y Responsividad | La interfaz de usuario debe adaptarse fluidamente a resoluciones de escritorio (1920x1080) y dispositivos moviles (375x667) cumpliendo lineamientos WCAG 2.1 nivel AA. | Auditoria de accesibilidad Lighthouse con puntaje minimo de 90/100 en todas las vistas principales. |
| **RNF-07** | **Seguridad:** Trazabilidad e Inmutabilidad | Todos los cambios de estado, decisiones de aprobacion y accesos administrativos deben quedar registrados en bitacoras inmutables. | Tabla `registro_auditoria` con politicas que impidan sentencias `UPDATE` o `DELETE` a nivel de base de datos (Write-Once-Read-Many). |
| **RNF-08** | **Disponibilidad:** Continuidad Operativa | El sistema debe mantener una disponibilidad operativa minima del 99.5% durante el horario comercial pactado (8x5 o 24x7 segun el SLA institucional). | Monitoreo sintactico de salud mediante endpoint `/api/health` con alerta automatica si el tiempo de caida supera 5 minutos. |

---

## 4. Fase 3: Especificacion de Historias de Usuario con Criterios de Aceptacion BDD (Gherkin)

A continuacion se detallan las Historias de Usuario principales con sus correspondientes criterios de aceptacion estructurados en sintaxis formal Gherkin (`Dado que... Cuando... Entonces...`).

### HU-01: Creacion de Solicitud de Acceso con Compuerta de Aprobacion Obligatoria
- **Como:** Empleado corporativo de la organizacion.
- **Quiero:** Solicitar acceso privilegiado al sistema ERP a traves del catalogo de servicios de TI.
- **Para:** Desempenar mis labores financieras sin demoras y garantizando que mi jefatura autorice formalmente los privilegios solicitados.

#### Criterio de Aceptacion 1: Creacion exitosa e ingreso en estado de aprobacion
```gherkin
Escenario: Registro exitoso de solicitud que requiere aprobacion previa
  Dado que el usuario "carlos.mendoza" con perfil "EMPLEADO" ha iniciado sesion
  Y se encuentra en la vista de seleccion de servicios del catalogo
  Cuando selecciona el servicio "SRV-ACC-01" correspondiente a "Accesos y Privilegios en Sistemas Corporativos"
  Y completa el formulario con:
    | Campo               | Valor                                            |
    | Departamento        | "Sistemas de Informacion y Aplicaciones"         |
    | Canal               | "PORTAL_WEB"                                     |
    | Justificacion       | "Requiero modulo contable para cierre de mes"    |
    | Impacto             | "MEDIO"                                          |
    | Urgencia            | "ALTA"                                           |
  Y presiona el boton "Crear Ticket"
  Entonces el sistema genera un codigo unico con prefijo "REQ-"
  Y el ticket se crea con estado_aprobacion "PENDIENTE_APROBACION"
  Y el estado operativo del ticket se establece en "PENDIENTE_APROBACION" (id_estado = 8)
  Y el paso actual de workflow se inicializa en "Aprobacion de Jefatura de Area"
  Y el sistema calcula fecha_limite_resolucion sumando 8 horas laborables a la fecha actual
  Y se emite una notificacion de correo electronico al aprobador designado del departamento
```

#### Criterio de Aceptacion 2: Aprobacion jerarquica autorizada por supervisor
```gherkin
Escenario: Aprobador autoriza la concesion de privilegios
  Dado que el usuario "ana.torres" con perfil "SUPERVISOR" ha iniciado sesion
  Y tiene asignado el ticket "REQ-2026-00042" en su bandeja de "Aprobaciones Pendientes"
  Cuando ingresa al detalle del ticket
  Y selecciona la accion "Aprobar Requerimiento"
  Y escribe el comentario: "Privilegios validados conforme al puesto laboral"
  Y confirma la transaccion
  Entonces el sistema registra una fila en "ticket_aprobacion" con:
    | decision   | "APROBADO"                                                 |
    | usuario    | "ana.torres"                                               |
    | comentario | "Privilegios validados conforme al puesto laboral"         |
  Y el estado_aprobacion del ticket cambia a "APROBADO"
  Y el estado del ticket transiciona a "ASIGNADO" (id_estado = 2)
  Y el ticket queda desbloqueado para que el tecnico N2 inicie el aprovisionamiento
```

#### Criterio de Aceptacion 3: Rechazo justificado de requerimiento
```gherkin
Escenario: Aprobador deniega el requerimiento por falta de sustento
  Dado que el usuario "ana.torres" con perfil "SUPERVISOR" revisa el ticket "REQ-2026-00043"
  Cuando selecciona la accion "Rechazar Requerimiento"
  Y escribe el comentario de rechazo: "No cuenta con la capacitacion contable previa requerida"
  Y confirma la transaccion
  Entonces el sistema registra la fila en "ticket_aprobacion" con decision "RECHAZADO"
  Y el estado_aprobacion del ticket cambia a "RECHAZADO"
  Y el estado del ticket transiciona directamente a "CANCELADO" (id_estado = 7)
  Y el flujo de atencion se da por finalizado sin pasar a la cola de los tecnicos
```

---

### HU-02: Gestion de Suspension de Cronometro SLA (Stop-the-Clock) por Espera de Usuario
- **Como:** Tecnico de Soporte N1 asignado a un incidente.
- **Quiero:** Marcar un ticket en estado de espera cuando he solicitado informacion adicional al usuario solicitante.
- **Para:** Congelar el cronometro de resolucion y evitar penalizaciones de SLA imputables al retraso de terceros.

#### Criterio de Aceptacion 1: Pausado del cronometro al transicionar a En Espera
```gherkin
Escenario: Tecnico pausa el ticket por requerir evidencia al usuario
  Dado que el tecnico "roberto.diaz" esta atendiendo el incidente "INC-2026-00105"
  Y el ticket se encuentra en estado "EN_PROCESO" (id_estado = 3)
  Y el ticket tiene una fecha_limite_resolucion fijada a las 18:00 horas del dia de hoy
  Cuando el tecnico cambia el estado a "EN_ESPERA" (id_estado = 4)
  Y selecciona el motivo de espera "ESPERA_CLIENTE"
  Y anade la nota interna: "Se solicita captura de pantalla con el codigo de error exacto"
  Entonces el sistema registra "fecha_ultima_pausa = now()" en el registro del ticket
  Y el contador de SLA detiene su acumulacion activa
```

#### Criterio de Aceptacion 2: Reanudacion del cronometro y aplazamiento automatico del SLA
```gherkin
Escenario: Usuario adjunta la informacion requerida y se reanuda la atencion
  Dado que el ticket "INC-2026-00105" permanecio en "EN_ESPERA" durante exactamente 120 minutos
  Cuando el tecnico retoma el ticket y cambia su estado a "EN_PROCESO" (id_estado = 3)
  Entonces el sistema calcula 120 minutos de pausa
  Y actualiza "tiempo_pausado_minutos = tiempo_pausado_minutos + 120"
  Y desplaza la fecha_limite_resolucion sumandole exactamente 120 minutos a su valor previo
  Y restablece "fecha_ultima_pausa = NULL"
  Y registra en la bitacora de auditoria el aplazamiento justificado del vencimiento
```

---

### HU-03: Resolucion Tecnica con Clasificacion Obligatoria y Evaluacion CSAT
- **Como:** Supervisor de Calidad del Service Desk.
- **Quiero:** Que todo tecnico documente la causa y clasificacion de la solucion antes de cerrar el ticket, y que el usuario califique el servicio.
- **Para:** Alimentar la base de mejora continua (KEDB) y medir la satisfaccion del cliente segun ISO 20000 e ITIL 4.

#### Criterio de Aceptacion 1: Cierre tecnico con validacion de categoria
```gherkin
Escenario: Tecnico intenta resolver el ticket sin especificar clasificacion de solucion
  Dado que el ticket "INC-2026-00120" esta en estado "EN_PROCESO"
  Cuando el tecnico intenta cambiar el estado a "RESUELTO" (id_estado = 5)
  Y deja vacio el selector "categoria_resolucion"
  Entonces el sistema rechaza la peticion con un error de validacion 400
  Y muestra el mensaje en pantalla: "Debe seleccionar una categoria de resolucion tecnica obligatoria"
  Y el ticket permanece en estado "EN_PROCESO"
```

#### Criterio de Aceptacion 2: Calificacion CSAT exitosa por el usuario
```gherkin
Escenario: Usuario final califica la atencion recibida
  Dado que el ticket "INC-2026-00120" se encuentra en estado "RESUELTO"
  Y el usuario creador accede a la vista de detalle del ticket
  Cuando selecciona una calificacion de 5 estrellas
  Y escribe el comentario: "Excelente rapidez en la atencion del problema de red"
  Y presiona "Enviar Evaluacion"
  Entonces el sistema guarda "calificacion_csat = 5", "comentario_csat" y "fecha_csat = now()"
  Y bloquea la re-emision de una nueva calificacion sobre el mismo ticket
```

---

## 5. Fase 4: Metodologias de Gestion y Desarrollo Agil (SDLC)

El desarrollo de software para plataformas ITSM de alta criticidad requiere un marco hibrido que combine la predictibilidad del flujo continuo con la flexibilidad del desarrollo iterativo.

```
+----------------------------------------------------------------------------------------------------+
|                               MARCO METODOLOGICO INTEGRADO                                         |
+------------------------------------+---------------------------------------------------------------+
| Metodologia / Practica             | Rol en el Proyecto                                            |
+------------------------------------+---------------------------------------------------------------+
| Scrumban (Scrum + Kanban)          | Sprints de 2 semanas para Epicas + Tableros Kanban continuos. |
| eXtreme Programming (XP)           | TDD, Pair Programming en logica de SLA y Refactorizacion.     |
| Continuous Integration (CI)        | Verificacion automatizada de tipos, lints y tests unitarios.  |
| Continuous Delivery (CD)           | Despliegues automatizados con migraciones de esquema seguras. |
+------------------------------------+---------------------------------------------------------------+
```

### 5.1. Implementacion de Scrumban
- **Cadencia de Scrum:** Se establecen iteraciones (Sprints) fijas de 2 semanas para la planificacion y entrega de modulos estructurales (e.g., Sprint 1: Autenticacion y RBAC; Sprint 2: Catalogo y Workflows; Sprint 3: Departamentos y Tecnicos; Sprint 4: Ciclo de Vida del Ticket y SLA).
- **Flujo Continuo de Kanban:** Para la resolucion de defectos y solicitudes de cambio menores, se utiliza un tablero Kanban con limites estrictos de trabajo en curso (WIP - Work in Progress) por columna:
  - *Backlog Refinado:* Sin limite.
  - *Diseno & Especificacion BDD:* Limite maximo de 3 items.
  - *Desarrollo Activo (Coding):* Limite maximo de 4 items simultaneos.
  - *Code Review & Verificacion de Seguridad:* Limite maximo de 2 items.
  - *Testing & Staging:* Limite maximo de 2 items.
  - *Pase a Produccion (Done):* Continuo.

### 5.2. Definicion de Listo (DoR - Definition of Ready)
Una Historia de Usuario solo puede entrar a la columna de desarrollo si cumple con:
1. Formato estandar ("Como... Quiero... Para...").
2. Criterios de Aceptacion redactados en lenguaje Gherkin sin ambiguedades.
3. Identificacion explicita de impactos en base de datos (tablas afectadas).
4. Evaluacion de cumplimiento de marcos normativos (ITIL, ISO 20000, ISO 27001).
5. Estimacion acordada en puntos de historia por el equipo de ingenieria.

### 5.3. Definicion de Hecho (DoD - Definition of Done)
Un incremento de software solo se considera completado y listo para produccion si:
1. El codigo compila al 100% en TypeScript estricto sin directivas `any` no justificadas.
2. `npm run build` concluye con codigo de salida 0.
3. Se han ejecutado pruebas unitarias e integrales con cobertura superior al 80%.
4. No se detectan vulnerabilidades criticas en el analisis de dependencias (`npm audit`).
5. Se incluye script de migracion SQL reversible con idempotencia garantizada.
6. Cero caracteres o representaciones no profesionales (prohibicion de emojis en codigo de produccion).

---

## 6. Fase 5: Arquitectura de Software y Patrones de Diseno

Para garantizar que el sistema soporte miles de transacciones concurrentes sin degradacion ni acoplamiento rigido, se debe implementar una **Arquitectura Limpia (Clean Architecture)** complementada con los conceptos estrategicos y tacticos del **Diseno Guiado por el Dominio (DDD - Domain-Driven Design)**.

### 6.1. Mapa de Contextos Delimitados (Bounded Contexts de DDD)

```
+----------------------------------------------------------------------------------------------------+
|                                    BOUNDED CONTEXTS DEL SISTEMA                                     |
+------------------------------------+---------------------------------------------------------------+
| 1. Contexto de Identidad & Accesos | Autenticacion, hashing de claves, control de sesiones,       |
|    (IAM Bounded Context)           | politicas de bloqueo, perfiles y permisos RBAC.               |
+------------------------------------+---------------------------------------------------------------+
| 2. Contexto del Catalogo de Serv.  | Definicion de servicios, familias, tiempos SLA, costos       |
|    (Service Catalog Context)       | financieros y modelado secuencial de workflows.               |
+------------------------------------+---------------------------------------------------------------+
| 3. Contexto Organizacional & Staff | Departamentos de TI, niveles de soporte (N1-N3), estados      |
|    (Organizational Context)        | operativos de tecnicos y control de capacidad maxima.         |
+------------------------------------+---------------------------------------------------------------+
| 4. Contexto del Ciclo de Vida      | Maquina de estados del ticket, compuertas de aprobacion,      |
|    (Ticket Lifecycle Context)      | cronometros de SLA, categorizacion de soluciones y CSAT.      |
+------------------------------------+---------------------------------------------------------------+
| 5. Contexto de Auditoria y Control | Registro inmutable de eventos, monitoreo de accesos,         |
|    (Audit & Governance Context)    | reportes regulatorios SOX/ISO 27001.                          |
+------------------------------------+---------------------------------------------------------------+
```

### 6.2. Diagrama de Capas de la Arquitectura Limpia

```
               [CAPA 4: INFRAESTRUCTURA Y FRAMEWORK]
       (Next.js App Router, PostgreSQL pg Driver, bcrypt, JWT, HTTP)
                               |
                               v
                  [CAPA 3: ADAPTADORES DE INTERFAZ]
        (Controladores API REST, Repositorios SQL, Presenters UI)
                               |
                               v
                    [CAPA 2: CASOS DE USO / APLICACION]
       (CrearTicketUseCase, AprobarTicketUseCase, ResolverTicketUseCase)
                               |
                               v
                       [CAPA 1: DOMINIO PURO]
         (Entidades de Dominio, Value Objects, Reglas de Negocio,
             Excepciones del Dominio - 100% Independiente de Frameworks)
```

---

## 7. Fase 6: Guia Exhaustiva de Construccion y Codificacion ("Como Codearlo")

A continuacion se presenta la implementacion tecnica detallada de los componentes arquitectonicos cardinales en TypeScript y Node.js, siguiendo estrictamente los principios SOLID y la separacion de responsabilidades.

### 7.1. Definicion de Entidades y Objetos de Valor (Value Objects) en el Dominio

Un Objeto de Valor no tiene identidad conceptual; se define exclusivamente por sus atributos y es inmutable.

#### Archivo: `src/core/domain/value-objects/CodigoTicket.ts`
```typescript
export class CodigoTicket {
  private readonly valor: string;

  private constructor(valor: string) {
    this.valor = valor;
  }

  public static crear(tipo: "INCIDENTE" | "SOLICITUD", anio: number, correlativo: number): CodigoTicket {
    const prefijo = tipo === "INCIDENTE" ? "INC" : "REQ";
    const numeroFormateado = correlativo.toString().padStart(5, "0");
    const codigoGenerado = `${prefijo}-${anio}-${numeroFormateado}`;
    
    if (!/^(INC|REQ)-\d{4}-\d{5}$/.test(codigoGenerado)) {
      throw new Error(`Formato de codigo de ticket invalido: ${codigoGenerado}`);
    }

    return new CodigoTicket(codigoGenerado);
  }

  public static desdeString(codigo: string): CodigoTicket {
    if (!/^(INC|REQ)-\d{4}-\d{5}$/.test(codigo)) {
      throw new Error(`El valor '${codigo}' no cumple con la nomenclatura corporativa de tickets`);
    }
    return new CodigoTicket(codigo);
  }

  public getValor(): string {
    return this.valor;
  }
}
```

#### Archivo: `src/core/domain/entities/Ticket.ts`
```typescript
import { CodigoTicket } from "../value-objects/CodigoTicket";

export type EstadoTicketEnum = 
  | "NUEVO" 
  | "ASIGNADO" 
  | "EN_PROCESO" 
  | "EN_ESPERA" 
  | "RESUELTO" 
  | "CERRADO" 
  | "CANCELADO" 
  | "PENDIENTE_APROBACION";

export type CategoriaResolucionEnum =
  | "CAMBIO_CONFIGURACION"
  | "REEMPLAZO_HARDWARE"
  | "PARCHE_SOFTWARE"
  | "CAPACITACION_USUARIO"
  | "WORKAROUND_APLICADO"
  | "FALSA_ALARMA";

export interface TicketPropiedades {
  idTicket?: number;
  codigo: CodigoTicket;
  idTipoTicket: number;
  idServicio?: number;
  idDepartamento?: number;
  idUsuarioSolicitante: number;
  idUsuarioAsignado?: number;
  titulo: string;
  descripcion: string;
  idImpacto: number;
  idUrgencia: number;
  idPrioridad: number;
  idEstado: number;
  estadoAprobacion: "NO_APLICA" | "PENDIENTE" | "APROBADO" | "RECHAZADO";
  canalComunicacion: string;
  fechaLimiteRespuesta: Date;
  fechaLimiteResolucion: Date;
  tiempoPausadoMinutos: number;
  fechaUltimaPausa?: Date;
  solucionTecnica?: string;
  categoriaResolucion?: CategoriaResolucionEnum;
  calificacionCsat?: number;
  comentarioCsat?: string;
}

export class Ticket {
  private props: TicketPropiedades;

  constructor(props: TicketPropiedades) {
    this.props = props;
  }

  public pausarSLA(): void {
    if (this.props.idEstado !== 4) { // 4 = EN_ESPERA
      throw new Error("Solo es posible suspender el SLA si el ticket transiciona a estado EN_ESPERA");
    }
    if (this.props.fechaUltimaPausa) {
      throw new Error("El cronometro de este ticket ya se encuentra en pausa");
    }
    this.props.fechaUltimaPausa = new Date();
  }

  public reanudarSLA(): void {
    if (!this.props.fechaUltimaPausa) {
      return; // No estaba pausado
    }
    const ahora = new Date();
    const milisegundosDiferencia = ahora.getTime() - this.props.fechaUltimaPausa.getTime();
    const minutosTranscurridos = Math.max(1, Math.round(milisegundosDiferencia / 60000));

    this.props.tiempoPausadoMinutos += minutosTranscurridos;

    // Desplazar fecha limite proporcionalmente
    const nuevaFechaLimite = new Date(this.props.fechaLimiteResolucion.getTime() + (minutosTranscurridos * 60000));
    this.props.fechaLimiteResolucion = nuevaFechaLimite;
    this.props.fechaUltimaPausa = undefined;
  }

  public resolver(solucion: string, categoria: CategoriaResolucionEnum): void {
    if (!solucion || solucion.trim().length < 10) {
      throw new Error("La solucion tecnica debe contener una justificacion detallada de al menos 10 caracteres");
    }
    if (!categoria) {
      throw new Error("Debe tipificar la resolucion con una categoria tecnica formal");
    }
    this.props.idEstado = 5; // RESUELTO
    this.props.solucionTecnica = solucion.trim();
    this.props.categoriaResolucion = categoria;
  }

  public registrarCSAT(calificacion: number, comentario?: string): void {
    if (this.props.idEstado !== 5 && this.props.idEstado !== 6) {
      throw new Error("La encuesta de satisfaccion solo puede responderse en tickets Resueltos o Cerrados");
    }
    if (calificacion < 1 || calificacion > 5) {
      throw new Error("La evaluacion CSAT debe situarse en la escala de 1 a 5");
    }
    this.props.calificacionCsat = calificacion;
    this.props.comentarioCsat = comentario?.trim();
  }

  public getProps(): TicketPropiedades {
    return Object.freeze({ ...this.props });
  }
}
```

### 7.2. Capa de Casos de Uso (Logica de Negocio Orquestada)

#### Archivo: `src/core/application/use-cases/CrearTicketUseCase.ts`
```typescript
import { Ticket, TicketPropiedades } from "../../domain/entities/Ticket";
import { CodigoTicket } from "../../domain/value-objects/CodigoTicket";
import { ITicketRepositorio } from "../ports/ITicketRepositorio";
import { IServicioCatalogoRepositorio } from "../ports/IServicioCatalogoRepositorio";

export interface CrearTicketComando {
  idTipoTicket: number;
  idServicio?: number;
  idDepartamento?: number;
  idUsuarioSolicitante: number;
  titulo: string;
  descripcion: string;
  idImpacto: number;
  idUrgencia: number;
  canalComunicacion: string;
}

export class CrearTicketUseCase {
  constructor(
    private readonly ticketRepo: ITicketRepositorio,
    private readonly catalogoRepo: IServicioCatalogoRepositorio
  ) {}

  public async ejecutar(comando: CrearTicketComando): Promise<Ticket> {
    // 1. Validar reglas de catalogos
    let requiereAprobacion = false;
    let slaRespuestaHoras = 4;
    let slaResolucionHoras = 24;

    if (comando.idServicio) {
      const servicio = await this.catalogoRepo.obtenerPorId(comando.idServicio);
      if (!servicio) {
        throw new Error(`El servicio de catalogo ID ${comando.idServicio} no existe o esta inactivo`);
      }
      requiereAprobacion = servicio.requiere_aprobacion;
      slaRespuestaHoras = servicio.sla_horas_respuesta || slaRespuestaHoras;
      slaResolucionHoras = servicio.sla_horas_resolucion || slaResolucionHoras;
    }

    // 2. Calcular prioridad segun matriz Impacto x Urgencia
    const idPrioridad = this.calcularPrioridadMatricial(comando.idImpacto, comando.idUrgencia);

    // 3. Generar codigo unico correlativo
    const anioActual = new Date().getFullYear();
    const correlativo = await this.ticketRepo.obtenerSiguienteCorrelativo(anioActual);
    const tipo = comando.idTipoTicket === 1 ? "INCIDENTE" : "SOLICITUD";
    const codigoTicket = CodigoTicket.crear(tipo, anioActual, correlativo);

    // 4. Calcular fechas de SLA iniciales
    const ahora = new Date();
    const fechaLimiteRespuesta = new Date(ahora.getTime() + (slaRespuestaHoras * 3600000));
    const fechaLimiteResolucion = new Date(ahora.getTime() + (slaResolucionHoras * 3600000));

    // 5. Instanciar Entidad con su estado inicial
    const estadoInicial = requiereAprobacion ? 8 : 1; // 8 = PENDIENTE_APROBACION, 1 = NUEVO
    const estadoAprobacion = requiereAprobacion ? "PENDIENTE" : "NO_APLICA";

    const nuevoTicket = new Ticket({
      codigo: codigoTicket,
      idTipoTicket: comando.idTipoTicket,
      idServicio: comando.idServicio,
      idDepartamento: comando.idDepartamento,
      idUsuarioSolicitante: comando.idUsuarioSolicitante,
      titulo: comando.titulo,
      descripcion: comando.descripcion,
      idImpacto: comando.idImpacto,
      idUrgencia: comando.idUrgencia,
      idPrioridad: idPrioridad,
      idEstado: estadoInicial,
      estadoAprobacion: estadoAprobacion,
      canalComunicacion: comando.canalComunicacion,
      fechaLimiteRespuesta: fechaLimiteRespuesta,
      fechaLimiteResolucion: fechaLimiteResolucion,
      tiempoPausadoMinutos: 0
    });

    // 6. Persistir en la infraestructura
    return await this.ticketRepo.guardar(nuevoTicket);
  }

  private calcularPrioridadMatricial(impacto: number, urgencia: number): number {
    // 1: Alta, 2: Media, 3: Baja
    if (impacto === 1 && urgencia === 1) return 1; // Critica
    if (impacto === 1 || urgencia === 1) return 2; // Alta
    if (impacto === 2 && urgencia === 2) return 3; // Media
    return 4; // Baja
  }
}
```

### 7.3. Capa de Infraestructura y Acceso Transaccional a Base de Datos (PostgreSQL)

#### Archivo: `src/infrastructure/repositories/PostgresTicketRepositorio.ts`
```typescript
import { query } from "@/lib/db";
import { Ticket } from "@/core/domain/entities/Ticket";
import { ITicketRepositorio } from "@/core/application/ports/ITicketRepositorio";

export class PostgresTicketRepositorio implements ITicketRepositorio {
  public async obtenerSiguienteCorrelativo(anio: number): Promise<number> {
    const res = await query<{ max_val: number }>(
      `SELECT COALESCE(COUNT(*), 0) + 1 AS max_val 
       FROM ticket 
       WHERE EXTRACT(YEAR FROM fecha_registro) = $1`,
      [anio]
    );
    return res[0]?.max_val || 1;
  }

  public async guardar(ticket: Ticket): Promise<Ticket> {
    const p = ticket.getProps();

    const sql = `
      INSERT INTO ticket (
        codigo, id_tipo_ticket, id_servicio, id_departamento,
        id_usuario_solicitante, id_usuario_asignado, titulo, descripcion,
        id_impacto, id_urgencia, id_prioridad, id_estado, estado_aprobacion,
        canal_comunicacion, fecha_limite_respuesta, fecha_limite_resolucion,
        tiempo_pausado_minutos, fecha_registro, estado_registro
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, now(), true
      ) RETURNING id_ticket;
    `;

    const params = [
      p.codigo.getValor(),
      p.idTipoTicket,
      p.idServicio || null,
      p.idDepartamento || null,
      p.idUsuarioSolicitante,
      p.idUsuarioAsignado || null,
      p.titulo,
      p.descripcion,
      p.idImpacto,
      p.idUrgencia,
      p.idPrioridad,
      p.idEstado,
      p.estadoAprobacion,
      p.canalComunicacion,
      p.fechaLimiteRespuesta,
      p.fechaLimiteResolucion,
      p.tiempoPausadoMinutos
    ];

    const result = await query<{ id_ticket: number }>(sql, params);
    
    // Retornar la entidad rehidratada con su ID asignado
    return new Ticket({
      ...p,
      idTicket: result[0].id_ticket
    });
  }
}
```

---

## 8. Fase 7: Evaluacion Comparativa: Sistema Normativo Ideal vs. Sistema Desarrollado

A continuacion se presenta la matriz comparativa de alto detalle que sintetiza las capacidades tecnicas que deberia poseer un sistema ITSM de clase mundial segun los estandares (Estado Ideal) frente al sistema real construido y validado en las Etapas 1, 2, 3 y 4 (Estado Desarrollado).

| Dimension de Analisis | Capacidad Ideal de Clase Mundial (ITIL v4 / ISO 20000 / COBIT / ISO 27001) | Implementacion Real en el Software Desarrollado (Etapas 1 a 4) | Nivel de Cobertura | Accion de Evolucion / Roadmap |
| :--- | :--- | :--- | :--- | :--- |
| **Autenticacion e Identidad** | Soporte para Single Sign-On (SSO) corporativo con SAML 2.0 / OpenID Connect y Azure Active Directory. | Autenticacion nativa con bcrypt (10 salts), JWT en cookies HttpOnly seguras, captcha matematico propio y bloqueo por 3 intentos. | **90%** | Integrar proveedor OAuth2 / Okta para federacion de identidades en despliegues corporativos. |
| **Control de Accesos (RBAC)** | Asignacion granular de permisos a nivel de recurso y atributos de usuario (ABAC - Attribute-Based Access Control). | Modelo RBAC con 6 perfiles corporativos (Admin, Supervisor, Tecnico, Empleado, Aprobador, Auditor) y menus dinamicos por base de datos. | **95%** | Anadir permisos por grupo funcional o sede geografica. |
| **Catalogo de Servicios** | Catalogo multinivel con 4 familias de servicios, costeo detallado, criticidad de negocio y flujos BPMN parametrizados. | 18 servicios transversales en 4 familias, codigos formales (SRV-ACC, SRV-HW, SRV-NET, SRV-SW), SLAs, costos y pasos de workflow secuenciales. | **100%** | Implementar disenador grafico drag-and-drop de workflows en el panel administrativo. |
| **Estructura Organizacional** | Jerarquia de areas de TI, niveles de soporte N1/N2/N3 y gestion de la capacidad simultanea de tecnicos (WIP limits). | Entidades separadas `departamento_ti` y `tecnico_detalle`, clasificacion de soporte, estados de disponibilidad y limites de carga activa. | **100%** | Incorporar balanceador automatico round-robin ponderado por especialidad tecnica. |
| **Ciclo de Vida de Tickets** | Separacion estricta de incidentes vs solicitudes, codificacion correlativa anual y matriz de prioridad bidimensional. | Prefijos `INC-YYYY` y `REQ-YYYY`, matriz automatica Impacto x Urgencia = Prioridad, trazabilidad de estados y comentarios internos/publicos. | **100%** | Totalmente completado y alineado a ITIL v4. |
| **Compuertas de Aprobacion** | Trazabilidad inmutable de aprobaciones para auditorias SOX y controles de acceso ISO 27001. | Tabla `ticket_aprobacion`, decision aprobatoria o de rechazo con justificacion obligatoria y bloqueo preventivo de atencion tecnica. | **100%** | Anadir aprobaciones escalonadas multinivel (e.g., Jefatura de Area + CISO de Seguridad). |
| **Gestion de SLAs** | Computo de metas temporales de respuesta y resolucion, con suspension automatica de reloj por espera de cliente (Stop-the-Clock). | Calculo dinamico de SLAs desde catalogo o matriz, acumulador de minutos pausados (`tiempo_pausado_minutos`) y desplazamiento de vencimiento. | **100%** | Integrar calendario laboral formal excluyendo fines de semana y feriados del computo. |
| **Canales de Atencion** | Soporte omnicanal estandarizado para captura de incidentes desde diversos medios corporativos. | Selector formal de canales (`PORTAL_WEB`, `CORREO_ELECTRONICO`, `TELEFONO_HELPDESK`, `CHATBOT_TEAMS_SLACK`, `PRESENCIAL`, `MONITOREO_AUTOMATICO`). | **95%** | Implementar webhooks de integracion directa con bot de Microsoft Teams y canal Slack. |
| **Categorizacion de Solucion** | Registro estandarizado de la solucion tecnica para analisis de causa raiz (RCA) y reduccion de deuda tecnica. | Campo obligatorio `categoria_resolucion` con 6 valores tipificados de la industria y descripcion tecnica de la intervencion. | **100%** | Totalmente completado. |
| **Mejora Continua y CSAT** | Evaluacion cuantitativa y cualitativa de satisfaccion del cliente segun ISO 20000-1 clausula 8.7.2. | Encuesta CSAT interactiva de 1 a 5 estrellas con comentarios, persistida en base de datos al resolver o cerrar tickets. | **100%** | Anadir calculo automatizado de Net Promoter Score (NPS) y dashboards de correlacion CSAT vs SLA. |

---

## 9. Conclusiones y Recomendaciones para la Sustentacion

1. **Rigor Ingenieril Demostrado:** La aplicacion no es un formulario generico, sino una plataforma con arquitectura desacoplada, tipos estrictos en TypeScript, base de datos relacional con llaves foraneas e integridad referencial, y logica de negocio encapsulada.
2. **Defensa Basada en Estandares:** Toda decision de diseno implementada en el codigo (la compuerta de aprobacion, el calculo de SLA con pausa, la encuesta CSAT, el RBAC con politicas de bloqueo) encuentra su sustento directo en un articulo especifico de **ITIL v4**, una clausula auditable de **ISO/IEC 20000-1**, un objetivo de control de **COBIT 2019** o un control tecnologico de **ISO/IEC 27001:2022**.
3. **Escalabilidad y Evolucion:** El sistema cuenta con bases solidas para evolucionar a una plataforma SaaS multi-inquilino (multi-tenant) agregando aislamiento a nivel de esquema de base de datos e integracion con colas de mensajeria asincrona (RabbitMQ o Apache Kafka) para la notificacion y procesamiento masivo de eventos de tickets.
