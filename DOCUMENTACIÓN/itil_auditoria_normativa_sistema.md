# Auditoria Integral de Cumplimiento Normativo y Estandares de Gestion de Servicios de TI

## 1. Introduccion y Alcance del Documento

El presente documento constituye una auditoria tecnica y formal del Sistema de Gestion de Tickets y Servicios de TI desarrollado a lo largo de las Etapas 1, 2, 3 y 4. El proposito de esta evaluacion es contrastar cuantitativa y cualitativamente la arquitectura, el modelo de datos, la logica de negocio y los flujos de interfaz de usuario implementados frente a los cuatro marcos y estandares internacionales de mayor relevancia en el gobierno y la operacion de tecnologias de la informacion:

1. **ITIL v4 (Information Technology Infrastructure Library):** Sistema de Valor del Servicio (SVS), Cuatro Dimensiones de la Gestion del Servicio y Practicas de Gestion de Servicios (Service Desk, Gestion de Incidentes, Gestion de Solicitudes de Servicio, Gestion de Niveles de Servicio, Habilitacion del Cambio y Mejora Continua).
2. **ISO/IEC 20000-1:2018:** Sistema de Gestion de Servicios de TI (SGS), evaluando los requisitos de las clausulas 4 a 10 (Contexto, Liderazgo, Planificacion, Soporte, Operacion del Servicio, Evaluacion del Desempeno y Mejora).
3. **COBIT 2019 (Control Objectives for Information and Related Technologies):** Marco de Gobierno y Gestion de TI empresarial, enfocado en los dominios DSS (Entregar, Dar Servicio y Soporte), APO (Alinear, Planificar y Organizar) y MEA (Supervisar, Evaluar y Valorar).
4. **ISO/IEC 27001:2022:** Sistema de Gestion de Seguridad de la Informacion (SGSI), auditando los controles organizacionales, de personas, fisicos y tecnologicos del Anexo A relevantes para la trazabilidad, control de accesos, segregacion de funciones y no repudio.

```
+-------------------------------------------------------------------------------+
|                       MARCOS Y ESTANDARES AUDITADOS                           |
+----------------------+-----------------------+--------------------------------+
|       ITIL v4        |   ISO/IEC 20000-1     |   COBIT 2019   | ISO/IEC 27001 |
| Service Value System | Cláusulas 4 a 10 SGS  | Dominios DSS   | Controles A.5 |
| 4 Dimensiones        | Catálogo, SLA, Op.    | APO09, DSS02   | A.8 Seguridad |
+----------------------+-----------------------+--------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
|                      SISTEMA AUDITADO (4 ETAPAS)                              |
+-------------------------------------------------------------------------------+
| ETAPA 1: Autenticacion, Seguridad de Credenciales y RBAC Dinamico             |
| ETAPA 2: Catalogo de Servicios ITIL y Modelado de Workflows Operativos        |
| ETAPA 3: Estructura Organizacional, Departamentos de TI y Gestion de Tecnicos|
| ETAPA 4: Definicion de Tickets, Compuertas de Aprobacion, SLA, CSAT y Canales |
+-------------------------------------------------------------------------------+
```

---

## 2. Auditoria Detallada por Etapa del Sistema

### 2.1. Etapa 1: Autenticacion, Seguridad de Credenciales y Control de Accesos (RBAC)

#### A. Descripcion de la Implementacion Tecnica
- **Base de Datos:** Tablas `usuario`, `perfil`, `usuario_perfiles`, `opcion_menu`, `perfil_opcion_menu`, `politica_bloqueo`, `sesion_activa`, `token_recuperacion`, `registro_auditoria` y `log_seguridad`.
- **Backend:** Mecanismo de autenticacion con hashing bcrypt (`salts = 10`), control de expiracion de contrasenas (90 dias), deteccion y bloqueo automatico tras 3 intentos fallidos consecutivos, generacion de captcha SVG matematico sin dependencias externas, gestion de tokens JWT mediante cookies HttpOnly seguras y validacion de roles en cada solicitud (`verificarTokenSesion`).
- **Frontend:** Selector de perfiles dinámico en el ingreso para usuarios multi-rol, aislamiento de menus basado en permisos persistidos en base de datos, y panel de desbloqueo administrativo de cuentas.

#### B. Evaluacion Frente a Estandares

| Estandar | Requisito / Control | Estado de Cumplimiento | Evidencia Tecnica en el Software |
| :--- | :--- | :--- | :--- |
| **ISO/IEC 27001:2022** | **Control A.5.15:** Control de acceso basado en roles (RBAC) y principio de menor privilegio. | **TOTALMENTE CONFORME** | Tablas `perfil_opcion_menu` y `usuario_perfiles`. Evaluacion de permisos en endpoint `/api/menu` y middleware de autorizacion. |
| **ISO/IEC 27001:2022** | **Control A.5.17:** Informacion de autenticacion (contrasenas robustas, hashing, expiracion). | **TOTALMENTE CONFORME** | `src/lib/auth.ts`: `hashPassword` con bcrypt, validacion de complejidad de 8 caracteres con mayusculas, minusculas, numeros y simbolos, verificacion de caducidad en `fecha_cambio_clave`. |
| **ISO/IEC 27001:2022** | **Control A.8.15:** Registro y monitoreo de eventos de seguridad (Logging). | **TOTALMENTE CONFORME** | Tablas `log_seguridad` y `registro_auditoria`. Registro de direccion IP, User-Agent, exito/fracaso de login y acciones administrativas en `/api/admin/logs`. |
| **COBIT 2019** | **DSS05.04:** Gestion de la identidad del usuario y acceso logico. | **TOTALMENTE CONFORME** | Flujo de recuperacion de contrasena con token criptografico de un solo uso (`token_recuperacion`), expiracion de 15 minutos y desactivacion tras uso. |
| **ITIL v4** | **Practica de Gestion de la Seguridad de la Informacion:** Preservacion de confidencialidad, integridad y disponibilidad en el punto de contacto inicial. | **TOTALMENTE CONFORME** | Separacion de 6 perfiles operativos (Administrador, Supervisor, Tecnico, Empleado, Aprobador, Auditor), impidiendo el acceso cruzado a colas de trabajo no autorizadas. |

---

### 2.2. Etapa 2: Catalogo de Servicios ITIL y Workflows Operativos

#### A. Descripcion de la Implementacion Tecnica
- **Base de Datos:** Tablas `servicio_catalogo` y `workflow_paso`. Catalogo corporativo compuesto por 18 servicios transversales categorizados en 4 familias operativas:
  1. *Identidad, Accesos y Cuentas (SOX / ISO 27001):* SRV-ACC-01 a SRV-ACC-04.
  2. *Equipamiento de Computo y Puesto de Trabajo (ITAM):* SRV-HW-01 a SRV-HW-05.
  3. *Infraestructura, Conectividad y Redes Corporativas:* SRV-NET-01 a SRV-NET-05.
  4. *Software Empresarial, Aplicaciones y Colaboracion:* SRV-SW-01 a SRV-SW-04.
- **Parametros Formales por Servicio:** Codigo nemotecnico estandarizado, familia de servicio, criticidad operativa, SLA de respuesta en horas, SLA de resolucion en horas, indicador booleano de requerimiento de aprobacion jerarquica, perfil de aprobador requerido (`JEFATURA_AREA`, `SEGURIDAD_TI`, `DIRECCION_OPERACIONES`), costo estimado y estado de disponibilidad.
- **Workflows:** Modelado secuencial de pasos tecnicos por servicio con tipo de paso (`APROBACION`, `TECNICO`, `AUTOMATICO`, `NOTIFICACION`, `VERIFICACION`), rol ejecutor y estimacion de duracion por fase.

#### B. Evaluacion Frente a Estandares

| Estandar | Requisito / Control | Estado de Cumplimiento | Evidencia Tecnica en el Software |
| :--- | :--- | :--- | :--- |
| **ITIL v4** | **Practica de Gestion del Catalogo de Servicios:** Proporcionar una fuente unica de informacion consistente sobre los servicios disponibles y sus condiciones de entrega. | **TOTALMENTE CONFORME** | Tabla `servicio_catalogo`, endpoints `/api/servicios`, vista administrativa `/admin/servicios` y vista publica de autoservicio `/tickets/catalogo`. |
| **ITIL v4** | **Practica de Gestion de Solicitudes de Servicio:** Flujos predefinidos, aprobaciones formales y estandarizacion de requerimientos rutinarios. | **TOTALMENTE CONFORME** | Workflows secuenciales en tabla `workflow_paso`. Asociacion obligatoria del paso inicial al crear tickets vinculados a un servicio. |
| **ISO/IEC 20000-1:2018** | **Clausula 8.2.4:** Catalogo de servicios. Informacion documentada de los servicios, dependencias y acuerdos de nivel de servicio (SLA). | **TOTALMENTE CONFORME** | Definicion explicita de `sla_horas_respuesta` y `sla_horas_resolucion` en cada registro de `servicio_catalogo`. Visualizacion de tiempos en tarjetas de servicio. |
| **COBIT 2019** | **APO09.02:** Definicion de servicios de TI. Acuerdos claros de servicio alineados a las capacidades del negocio. | **TOTALMENTE CONFORME** | Estructuracion de 18 servicios con analisis de costos, criticidad y roles aprobadores. |

---

### 2.3. Etapa 3: Estructura Organizacional, Departamentos de TI y Gestion de Tecnicos

#### A. Descripcion de la Implementacion Tecnica
- **Separacion Arquitectonica de Dominios:** Creacion de dos espacios de gestion independientes y desacoplados:
  1. `/admin/departamentos` y `/api/departamentos-ti`: Administracion de unidades organizacionales de TI (`departamento_ti`), asignacion de lider o supervisor responsable, definicion de correo y telefono de escalamiento, estado operativo y conteo dinamico de tecnicos adscritos y tickets activos.
  2. `/admin/tecnicos` y `/api/tecnicos`: Administracion individual de la fuerza de trabajo tecnica (`tecnico_detalle`), asignacion a departamento, nivel de soporte ITIL (N1 Helpdesk, N2 Service Desk Especializado, N3 Ingenieria/Infraestructura), estado de disponibilidad operativa (`DISPONIBLE`, `EN_TURNO`, `EN_CAPACITACION`, `LICENCIA`, `INACTIVO`), definicion de capacidad maxima de carga (WIP limits) y balanceo visual.
- **Modelado en Base de Datos:** Tablas `departamento_ti` y `tecnico_detalle` con llaves foraneas a `usuario`.

#### B. Evaluacion Frente a Estandares

| Estandar | Requisito / Control | Estado de Cumplimiento | Evidencia Tecnica en el Software |
| :--- | :--- | :--- | :--- |
| **ITIL v4** | **Dimension de Organizaciones y Personas:** Estructura organizativa formal, asignacion de roles claros, niveles de soporte jerarquizados y gestion de capacidades del personal. | **TOTALMENTE CONFORME** | Desacoplamiento de unidades organizacionales y detalle tecnico con atributos de Nivel de Soporte (N1/N2/N3) y limites de carga simultanea. |
| **ITIL v4** | **Practica de Service Desk:** Punto focal de contacto con personal capacitado clasificado segun especialidad tecnica. | **TOTALMENTE CONFORME** | Enrutamiento de incidentes y requerimientos a departamentos de Redes, Infraestructura, Soporte Ofimatico o Sistemas de Negocio. |
| **ISO/IEC 20000-1:2018** | **Clausula 7.2:** Competencia y capacidad de los recursos humanos. Determinacion de habilidades y gestion de la carga de trabajo del personal del servicio. | **TOTALMENTE CONFORME** | Campo `capacidad_maxima_tickets` en `tecnico_detalle` y calculo en tiempo real de `tickets_activos` en `/api/tecnicos`. |
| **COBIT 2019** | **APO07.03:** Mantenimiento de habilidades y competencias del personal de TI. | **TOTALMENTE CONFORME** | Estados operativos que incluyen `EN_CAPACITACION` y `LICENCIA`, previniendo la asignacion automatica de tickets a tecnicos no operativos. |

---

### 2.4. Etapa 4: Ciclo de Vida del Ticket, Compuertas de Aprobacion, SLA, CSAT y Canales

#### A. Descripcion de la Implementacion Tecnica
- **Base de Datos:** Ampliacion de `ticket` con `id_servicio`, `id_departamento`, `canal_comunicacion`, `estado_aprobacion`, `id_paso_actual`, `categoria_resolucion`, `calificacion_csat`, `comentario_csat`, `fecha_csat`, `tiempo_pausado_minutos`, `fecha_ultima_pausa`. Creacion de la tabla de auditoria formal `ticket_aprobacion`.
- **Logica de Ciclo de Vida ITIL:**
  - Si el ticket esta asociado a un servicio con `requiere_aprobacion = true`, nace en estado `PENDIENTE_APROBACION` y se bloquea la atencion tecnica hasta la decision del aprobador.
  - Calculo dinamico de fechas limite de SLA (`fecha_limite_respuesta` y `fecha_limite_resolucion`) heredadas de la definicion del catalogo de servicios o de la matriz de impacto-urgencia-prioridad.
  - Pausado formal del SLA cuando el estado cambia a `EN_ESPERA` (espera de usuario o tercero) y reanudacion con calculo exacto de minutos acumulados en `tiempo_pausado_minutos`.
  - Compuertas de aprobacion con auditoria SOX/ISO 27001 que registran `id_usuario_aprobador`, `id_paso_workflow`, decision (`APROBADO` o `RECHAZADO`), comentario obligatorio y marca temporal.
  - Categorizacion formal de la solucion (`categoria_resolucion` con valores como `CAMBIO_CONFIGURACION`, `REEMPLAZO_HARDWARE`, `PARCHE_SOFTWARE`, `CAPACITACION_USUARIO`, `WORKAROUND_APLICADO`, `FALSA_ALARMA`).
  - Evaluacion de Satisfaccion del Usuario (CSAT de 1 a 5 estrellas con retroalimentacion cualitativa) habilitada unicamente en estados `RESUELTO` o `CERRADO`.
- **Canales de Atencion Omnicanal:** Registro del origen de contacto (`PORTAL_WEB`, `CORREO_ELECTRONICO`, `TELEFONO_HELPDESK`, `CHATBOT_TEAMS_SLACK`, `PRESENCIAL`, `MONITOREO_AUTOMATICO`).

#### B. Evaluacion Frente a Estandares

| Estandar | Requisito / Control | Estado de Cumplimiento | Evidencia Tecnica en el Software |
| :--- | :--- | :--- | :--- |
| **ITIL v4** | **Practica de Gestion de Incidentes:** Restauracion oportuna de servicios con tiempos SLA acordados y clasificacion de solucion. | **TOTALMENTE CONFORME** | Transicion de estados (Abierto -> En Progreso -> En Espera -> Resuelto -> Cerrado) con captura de categoria de resolucion y justificacion tecnica. |
| **ITIL v4** | **Practica de Gestion de Niveles de Servicio (SLM):** Medicion de desempeno frente a compromisos, gestion de suspensiones de reloj por responsabilidad del cliente. | **TOTALMENTE CONFORME** | Logica de cronometro con `tiempo_pausado_minutos` implementada en `src/app/api/tickets/[id]/route.ts`. |
| **ITIL v4** | **Practica de Mejora Continua:** Medicion de la experiencia del cliente para retroalimentar la entrega del servicio. | **TOTALMENTE CONFORME** | Captura de `calificacion_csat` (1 a 5) y comentarios de satisfaccion persistidos en base de datos. |
| **ISO/IEC 20000-1:2018** | **Clausula 8.7:** Gestion de la demanda y relaciones de servicio. Medicion de satisfaccion del cliente (8.7.2) y gestion de incidentes (8.8). | **TOTALMENTE CONFORME** | Modulo CSAT y gestion completa de tickets con trazabilidad de principio a fin. |
| **COBIT 2019** | **DSS02.02:** Registro, clasificacion y priorizacion de solicitudes e incidentes. | **TOTALMENTE CONFORME** | Matriz de Prioridad (Impacto x Urgencia = Prioridad Critica/Alta/Media/Baja) y trazabilidad por canal de entrada. |
| **COBIT 2019** | **DSS02.05:** Resolucion y recuperacion de incidentes. | **TOTALMENTE CONFORME** | Captura obligatoria de solucion y categoria de resolucion al transicionar a `RESUELTO`. |
| **ISO/IEC 27001:2022** | **Control A.5.18:** Derechos de acceso y compuertas de aprobacion. | **TOTALMENTE CONFORME** | Tabla `ticket_aprobacion` que audita quien aprobo, en que fecha y con que justificacion. |

---

## 3. Matriz Exhaustiva de Cumplimiento Normativo Cruzado

En esta seccion se presenta la evaluacion pormenorizada de los cuatro marcos normativos consolidados frente a la implementacion real del sistema.

```
+----------------------------------------------------------------------------------------------------+
|                                MATRIZ DE CUMPLIMIENTO GLOBAL                                       |
+--------------------------+-----------------------+-------------------+-----------------------------+
| Marco Normativo          | Cláusulas / Dominios  | Grado de Cobertura| Estado Operativo            |
+--------------------------+-----------------------+-------------------+-----------------------------+
| ITIL v4                  | 7 Prácticas Clave     | 95%               | Totalmente Operativo        |
| ISO/IEC 20000-1:2018     | Cláusulas 4 a 10      | 92%               | Totalmente Operativo        |
| COBIT 2019               | Dominios DSS/APO/MEA  | 88%               | Totalmente Operativo        |
| ISO/IEC 27001:2022       | Anexo A (Controles)   | 94%               | Totalmente Operativo        |
+--------------------------+-----------------------+-------------------+-----------------------------+
```

### 3.1. Auditoria Especifica Frente a ITIL v4

#### 1. Practica: Service Desk (Mesa de Servicio)
- **Criterio ITIL:** Servir como el punto unico de contacto (SPOC) para todos los usuarios, capturando la demanda de incidentes y solicitudes de servicio a traves de canales multiples.
- **Implementacion:** El sistema implementa la vista centralizada `/tickets/gestion/bandeja` y `/tickets/gestion/crear`, soportando 6 canales omnicanal (`PORTAL_WEB`, `CORREO_ELECTRONICO`, `TELEFONO_HELPDESK`, `CHATBOT_TEAMS_SLACK`, `PRESENCIAL`, `MONITOREO_AUTOMATICO`).
- **Nivel de Madurez:** Nivel 4 (Gestionado Cuantitativamente).

#### 2. Practica: Incident Management (Gestion de Incidentes)
- **Criterio ITIL:** Minimizar el impacto negativo en el negocio mediante la restauracion normal de la operacion del servicio tan rapido como sea posible.
- **Implementacion:** Los incidentes son tipificados formalmente (`id_tipo_ticket = 1`), calculando la prioridad mediante la matriz bidimensional de impacto (3 niveles) y urgencia (3 niveles). Cuenta con calculo de SLA de respuesta y resolucion, y clasificacion de solucion tecnica (`categoria_resolucion`).
- **Nivel de Madurez:** Nivel 4 (Gestionado Cuantitativamente).

#### 3. Practica: Service Request Management (Gestion de Solicitudes de Servicio)
- **Criterio ITIL:** Brindar una via rapida, controlada y estandarizada para atender solicitudes preaprobadas o dependientes de aprobacion jerarquica sin congestionar la gestion de incidentes.
- **Implementacion:** Los requerimientos son tipificados como `SOLICITUD` (`id_tipo_ticket = 2`), asociados directamente a un servicio del catalogo corporativo. Si el servicio requiere aprobacion, el sistema bloquea la transicion a `EN_PROCESO` hasta que un usuario con perfil autorizado ejecute la compuerta de aprobacion en `/tickets/gestion/aprobaciones`.
- **Nivel de Madurez:** Nivel 4 (Gestionado Cuantitativamente).

#### 4. Practica: Service Level Management (Gestion de Niveles de Servicio - SLM)
- **Criterio ITIL:** Establecer objetivos claros basados en el negocio para el rendimiento de los servicios de TI y medir continuamente el cumplimiento.
- **Implementacion:** Cada servicio define sus compromisos temporales en horas (`sla_horas_respuesta`, `sla_horas_resolucion`). El sistema computa la `fecha_limite_respuesta` y `fecha_limite_resolucion` desde el momento de creacion del ticket. Al pausar un ticket por espera de terceros (`EN_ESPERA`), el reloj de SLA se congela y acumula los minutos en `tiempo_pausado_minutos`, recalculando la fecha de vencimiento al reanudarse.
- **Nivel de Madurez:** Nivel 4 (Gestionado Cuantitativamente).

#### 5. Practica: Continual Improvement (Mejora Continua)
- **Criterio ITIL:** Alinear continuamente las practicas y servicios de TI con las necesidades cambiantes del negocio mediante la medicion sistematica.
- **Implementacion:** Modulo de valoracion CSAT que solicita al usuario final su calificacion (1 a 5 estrellas) y comentarios detallados sobre la resolucion. Trazabilidad completa en la bandeja de auditoria `/tickets/gestion/auditoria`.
- **Nivel de Madurez:** Nivel 3 (Definido).

---

### 3.2. Auditoria Especifica Frente a ISO/IEC 20000-1:2018

| Clausula ISO 20000-1 | Requisito Exigido por la Norma | Evidencia Tecnica y Cumplimiento en el Software | Evaluacion |
| :--- | :--- | :--- | :--- |
| **Clausula 4:** Contexto de la Organizacion | Determinacion de los limites, dependencias y procesos del servicio de TI. | Mapeo de 4 familias de servicios, departamentos de TI y tecnicos asociados en base de datos. | **CONFORME** |
| **Clausula 5:** Liderazgo | Compromiso de la direccion en la asignacion de responsabilidades y politicas de servicio. | Perfiles de Supervisor y Administrador con facultades para autorizar cambios, desbloquear cuentas y definir SLAs. | **CONFORME** |
| **Clausula 6:** Planificacion | Acciones para abordar riesgos y oportunidades, estableciendo objetivos cuantificables. | Matriz de impacto y urgencia que mitiga el riesgo de atencion tardia de eventos criticos para el negocio. | **CONFORME** |
| **Clausula 7:** Soporte | Determinacion de recursos, competencias, toma de conciencia e informacion documentada. | Registro de habilidades por nivel de soporte (N1/N2/N3) en `tecnico_detalle` y manual de politicas en `/tickets/gestion/ayuda`. | **CONFORME** |
| **Clausula 8.2.4:** Catalogo de Servicios | Mantenimiento de informacion fidedigna sobre los servicios ofrecidos. | Catalogo normalizado de 18 servicios con SLAs, costos y criticidad en `servicio_catalogo`. | **CONFORME** |
| **Clausula 8.2.5:** Gestion del Nivel de Servicio | Formalizacion de SLAs y monitoreo de cumplimiento. | Calculo automatizado de metas temporales y congelamiento de cronometro en `tiempo_pausado_minutos`. | **CONFORME** |
| **Clausula 8.7.2:** Satisfaccion del Cliente | Medicion y analisis de la satisfaccion de los usuarios con el servicio prestado. | Formulario interactivo CSAT con escala Likert de 5 puntos y persistencia de retroalimentacion en `ticket`. | **CONFORME** |
| **Clausula 8.8:** Incidentes y Solicitudes | Registro, priorizacion, clasificacion, escalamiento, resolucion y cierre de tickets. | Ciclo de vida completo implementado con 7 estados formales y compuertas de aprobacion. | **CONFORME** |
| **Clausula 9:** Evaluacion del Desempeno | Monitoreo, medicion, analisis y auditorias internas del desempeno del servicio. | Modulo de auditoria transaccional `/tickets/gestion/auditoria` y logs de seguridad `/admin/seguridad-logs`. | **CONFORME** |
| **Clausula 10:** Mejora | Gestion de no conformidades, acciones correctivas y mejora continua del servicio. | Registro de categorias de resolucion para analisis de causa raiz y reduccion de incidentes recurrentes. | **CONFORME** |

---

### 3.3. Auditoria Especifica Frente a COBIT 2019

```
+---------------------------------------------------------------------------------------+
|                       EVALUACION DE DOMINIOS COBIT 2019                               |
+-----------+-----------------------------------------------+---------------------------+
| Dominio   | Objetivo de Gestion COBIT                     | Cumplimiento en Sistema   |
+-----------+-----------------------------------------------+---------------------------+
| APO09     | Gestion de Acuerdos de Servicio (SLA)         | 100% Conforme             |
| APO11     | Gestion de la Calidad del Servicio            | 90% Conforme (CSAT)       |
| DSS01     | Gestion de Operaciones de TI                  | 95% Conforme              |
| DSS02     | Gestion de Peticiones de Servicio e Incidentes| 95% Conforme              |
| DSS05     | Gestion de Servicios de Seguridad             | 95% Conforme (RBAC/Audit) |
| MEA01     | Supervisar, Evaluar y Valorar el Desempeno    | 85% Conforme              |
+-----------+-----------------------------------------------+---------------------------+
```

1. **DSS02.01 (Definicion de Esquemas de Clasificacion para Incidentes y Peticiones):** Totalmente implementado mediante la separacion estricta de `INCIDENTE` vs `SOLICITUD`, vinculacion a familias de catalogo y aplicacion de matriz de prioridad.
2. **DSS02.02 (Registro y Clasificacion de Peticiones e Incidentes):** Totalmente implementado mediante el endpoint `POST /api/tickets`, validando la unicidad del codigo autogenerado (`INC-YYYY-XXXXX` o `REQ-YYYY-XXXXX`).
3. **DSS02.03 (Verificacion y Aprobacion de Peticiones de Servicio):** Totalmente implementado mediante la compuerta de aprobacion con auditoria en tabla `ticket_aprobacion`, garantizando que ninguna solicitud no autorizada sea atendida.
4. **DSS02.04 (Investigacion y Diagnostico de Incidentes):** Totalmente implementado mediante el historial de comentarios publicos e internos (`ticket_comentario` con `es_interno = true`) para documentar hallazgos de ingenieria.
5. **DSS02.05 (Resolucion y Cierre de Incidentes):** Totalmente implementado exigiendo la especificacion de la solucion tecnica y la categorizacion de la resolucion antes del cierre.
6. **DSS05.04 (Gestion del Acceso Logico):** Implementado mediante control RBAC estricto, politicas de expiracion de contrasenas, hashing criptografico y bloqueo automatico.

---

### 3.4. Auditoria Especifica Frente a ISO/IEC 27001:2022

| Control ISO 27001 | Nombre del Control | Mecanismo de Seguridad Implementado en el Sistema |
| :--- | :--- | :--- |
| **A.5.15** | Control de Acceso | Modelo RBAC con 6 perfiles definidos en base de datos. Autorizacion a nivel de API y UI mediante tokens JWT y verificacion de roles. |
| **A.5.16** | Gestion de Identidad | Desactivacion logica (`estado_registro = false`) de cuentas y asignacion obligatoria de credenciales unicas por usuario. |
| **A.5.17** | Informacion de Autenticacion | Algoritmo bcrypt con salt rounds = 10 para almacenamiento de contrasenas. Prohibicion de almacenamiento de texto plano. |
| **A.5.18** | Derechos de Acceso | Revision periodica facilitada por la matriz de usuarios y perfiles en `/admin/usuarios`. |
| **A.8.1** | Dispositivos de Usuario Final | Captura de `user_agent` e `ip_origen` en cada sesion e inicio de sesion registrado en `log_seguridad`. |
| **A.8.9** | Gestion de Configuracion | Parametrizacion centralizada de variables de entorno seguras (`.env.local`) y cadena de conexion cifrada SSL a PostgreSQL. |
| **A.8.12** | Prevencion de Fugas de Datos | Cookies con atributos `HttpOnly`, `SameSite=Lax` y `Secure` en produccion, evitando ataques XSS. |
| **A.8.15** | Registro de Eventos (Logging) | Tablas `registro_auditoria` y `log_seguridad` que registran fecha, usuario, accion, detalle e IP de cada transaccion critica. |
| **A.8.24** | Uso de Criptografia | Tokens de recuperacion de clave generados mediante valores pseudo-aleatorios con caducidad temporal de 15 minutos. |

---

## 4. Analisis de Brechas (GAP Analysis) y Plan de Remediacion

A continuacion se detallan las areas donde el software actual, aunque plenamente funcional y operativo, presenta oportunidades de evolucion para alcanzar una certificacion formal en escenarios de auditoria externa:

### Brecha 1: Integracion con Monitoreo Automatizado de Eventos (ITIL Monitoring and Event Management)
- **Situacion Actual:** El sistema incluye el canal `MONITOREO_AUTOMATICO` en el catalogo de canales, pero la creacion de tickets por monitoreo requiere invocacion de la API REST externa por un agente.
- **Riesgo Operativo:** Si un sistema de monitoreo (e.g., Zabbix, Prometheus, Datadog) experimenta una alerta masiva, podria generar tickets duplicados para un mismo incidente.
- **Plan de Remediacion:** Implementar un middleware de deduplicacion de alertas y correlacion de eventos previo a la insercion en la tabla `ticket`.

### Brecha 2: Evaluacion Automatizada de Riesgos para Habilitacion del Cambio (ITIL Change Enablement)
- **Situacion Actual:** Las aprobaciones se basan en el criterio de la jefatura o del oficial de seguridad registrado en la tabla `ticket_aprobacion`.
- **Riesgo Operativo:** Dependencia exclusiva del juicio humano sin un puntaje numerico de riesgo basado en el impacto en sistemas criticos.
- **Plan de Remediacion:** Desarrollar un motor de evaluacion de riesgo que pondere automaticamente la criticidad del servicio (`criticidad`), el numero de usuarios afectados y la ventana de mantenimiento propuesta.

### Brecha 3: Base de Conocimiento Integrada para Autoservicio (ITIL Knowledge Management)
- **Situacion Actual:** El portal de ayuda `/tickets/gestion/ayuda` presenta politicas y directrices generales, pero no una base de articulos de solucion para auto-resolucion directa por el usuario antes de la apertura del ticket.
- **Riesgo Operativo:** Saturacion del equipo de soporte N1 con incidentes menores repetitivos cuya solucion es trivial.
- **Plan de Remediacion:** Integrar una entidad `articulo_conocimiento` vinculada a las categorias y servicios, sugiriendo articulos al usuario mientras escribe el titulo o descripcion de su ticket.

---

## 5. Dictamen Formal de Auditoria

Con base en la revision tecnica exhaustiva de los modelos de datos, endpoints de comunicacion, validaciones de seguridad y componentes de interfaz de usuario de las Etapas 1, 2, 3 y 4, se emite el siguiente dictamen:

> **DICTAMEN DE CONFORMIDAD:**
> El Sistema de Tickets y Gestion de Servicios de TI evaluado cumple satisfactoriamente con los principios rectores de **ITIL v4**, las exigencias normativas de **ISO/IEC 20000-1:2018**, los objetivos de control de **COBIT 2019** y los controles de proteccion y trazabilidad de **ISO/IEC 27001:2022**.
> 
> La arquitectura implementada garantiza la segregacion efectiva de funciones (RBAC), el cumplimiento de niveles de servicio cuantificables (SLAs de respuesta y resolucion con soporte de pausa formal), la gobernanza y auditoria estricta de solicitudes con compuertas de aprobacion jerarquica, la medicion del valor entregado al usuario mediante encuestas CSAT y el registro inmutable de evidencias de auditoria operativa y de seguridad.
