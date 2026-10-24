# Tratado Enciclopédico y Manual Maestro de FlowDesk ITSM

**Sistema Integral de Gestión de Servicios de TI, Mesa de Ayuda y Gobernanza Operativa**  
**Versión de la Plataforma:** 2.0 (Edición Corporativa Unificada)  
**Fecha de Publicación:** 24 de Octubre de 2026  
**Alineación Normativa:** ITIL 4, ISO/IEC 20000-1:2018, ISO/IEC 27001:2022, ISO/IEC 19770-1 y COBIT 2019  
**Arquitectura de Software:** Vertical Slice Modular con Contratos Públicos Estrictos en TypeScript  
**Pila Tecnológica:** Next.js 14 (App Router), React 18, Tailwind CSS, PostgreSQL 15+ (Modelo Relacional C)  

---

## 1. Fundamentos y Panorama de la Gestión de Servicios de TI (ITSM)

### 1.1. ¿Qué es la Gestión de Servicios de TI (ITSM)?
La Gestión de Servicios de TI (*IT Service Management* o ITSM) es el conjunto estructurado de capacidades organizacionales, metodológicas y tecnológicas dedicadas a diseñar, construir, entregar, operar y controlar servicios de tecnología de la información a lo largo de todo su ciclo de vida.

A diferencia del paradigma obsoleto de la "Mesa de Ayuda Reactiva" (*Help Desk* de primera generación de los años 80 y 90) —cuyo único propósito consistía en contestar llamadas telefónicas, registrar reclamos en planillas aisladas y apagar incendios técnicos de forma improvisada—, el ITSM moderno concibe a las áreas de TI como **proveedores estratégicos de servicios**. En este enfoque, el valor no se mide por la cantidad de servidores encendidos ni por las líneas de código desplegadas, sino por los resultados de negocio habilitados, la continuidad operativa asegurada y la experiencia entregada a los usuarios y clientes.

El marco global de referencia **ITIL 4** (*Information Technology Infrastructure Library*) formaliza esta visión a través del **Sistema de Valor del Servicio (SVS)** y la **Cadena de Valor del Servicio**, transformando la demanda organizacional en valor real mediante 34 prácticas de gestión estructuradas en tres grandes familias:
1. **Prácticas de Gestión General:** Gobernanza, gestión de riesgos, gestión de proveedores, gestión de la seguridad de la información y mejora continua.
2. **Prácticas de Gestión de Servicios:** Gestión de incidentes, gestión de solicitudes de servicio, gestión de problemas, gestión de cambios, gestión de activos de TI, gestión de la configuración del servicio (CMDB), gestión del catálogo de servicios y gestión de niveles de servicio (SLA).
3. **Prácticas de Gestión Técnica:** Gestión del despliegue, gestión de infraestructura y plataformas, y desarrollo y gestión de software.

De forma complementaria, normas internacionales de la Organización Internacional de Normalización (ISO) e instituciones como ISACA establecen requisitos auditables de cumplimiento:
- **ISO/IEC 20000-1:2018:** Estándar internacional auditable para Sistemas de Gestión de Servicios (SMS). Exige control estricto de catálogos, SLAs, gestión de capacidad, gestión de disponibilidad y trazabilidad de cambios.
- **ISO/IEC 27001:2022:** Estándar global para Sistemas de Gestión de Seguridad de la Información (SGSI). Demanda confidencialidad, integridad, disponibilidad, control de acceso basado en roles (RBAC), segregación de funciones (SoD) y bitácoras inmutables de auditoría.
- **ISO/IEC 19770-1:** Estándar específico para la Gestión de Activos de TI (ITAM), dividida en gestión de hardware (HAM) y gestión de licencias de software (SAM).
- **COBIT 2019:** Marco de gobernanza corporativa para alinear los objetivos de TI con las metas de gobierno de la empresa.

---

### 1.2. El Panorama del Software ITSM en la Industria Actual
En el mercado empresarial contemporáneo conviven diversos gigantes de software que han modelado la forma en que las organizaciones gestionan sus servicios tecnológicos. Sin embargo, cada una de estas soluciones presenta un perfil particular de fortalezas y severas desventajas operativas y económicas:

#### A. ServiceNow (Líder en Gran Empresa y PaaS)
- **Perfil:** Plataforma como Servicio (PaaS) empresarial dominante en el segmento Fortune 500 y corporaciones multinacionales.
- **Fortalezas:** Profundidad funcional inmensa, orquestación automatizada de flujos de trabajo (*Flow Designer*), modelo de datos canónico CSDM (*Common Service Data Model*) y capacidad para abarcar flujos de recursos humanos, atención al cliente y operaciones de seguridad en una sola plataforma.
- **Puntos Críticos y Desventajas:**
  - **Costo Exorbitante de Licenciamiento:** El modelo de licenciamiento por agente activo oscila típicamente entre 100 y 250 USD mensuales por usuario con rol resolutor, a lo que se suman tarifas anuales obligatorias de mantenimiento e infraestructura cloud propietaria.
  - **Deuda Técnica y Sobreingeniería:** Al estar basado en una arquitectura heredada con más de dos décadas de evolución, depende de scripts dispersos en lenguaje JavaScript propietario ejecutados en servidor y cliente (*Business Rules*, *Client Scripts*, *Script Includes*, *GlideRecord*), lo que suele derivar en un mantenimiento costoso y proclive a fallos en cada actualización de versión (*upgrades* de plataforma).
  - **Barrera de Entrada y Dependencia de Consultoría Especializada:** Cualquier ajuste menor en un formulario o flujo de aprobación suele requerir consultores certificados cuyos costos por hora superan los 150 USD, generando dependencia extrema del proveedor (*vendor lock-in*).

#### B. Jira Service Management - JSM de Atlassian (Foco en Desarrollo y Equipos Ágiles)
- **Perfil:** Solución construida sobre el ecosistema Jira, orientada a cerrar la brecha entre los equipos de desarrollo (DevOps) y los equipos de operaciones (ITOps).
- **Fortalezas:** Integración nativa con repositorios de código (Bitbucket, GitHub), tableros ágiles (Scrum, Kanban) y adopción acelerada en empresas nativas digitales.
- **Puntos Críticos y Desventajas:**
  - **Dependencia de Complementos (*Plugins* / *Add-ons*):** La plataforma base carece de funcionalidades ITIL profundas out-of-the-box. Funcionalidades como CMDB topológica avanzada, gestión patrimonial de activos físicos (HAM) o catálogos de servicios con lógica condicional compleja han requerido históricamente la adquisición de complementos de terceros en el Atlassian Marketplace (ej. Insight/Assets), encareciendo la factura mensual de forma acumulativa.
  - **Fricción de Usabilidad para Usuarios No Técnicos:** La interfaz y terminología conservan un fuerte sesgo orientado a programadores, lo que genera resistencia en empleados de áreas de negocio (Finanzas, Recursos Humanos, Legal) al momento de solicitar servicios corporativos.

#### C. Zendesk (Foco en Soporte al Cliente Externo - CSM)
- **Perfil:** Suite líder en atención omnicanal al cliente final (B2C / B2B) mediante tickets, chat, mensajería y telefonía.
- **Fortalezas:** Excelente interfaz conversacional, alta velocidad de implementación y capacidades avanzadas de mensajería multicanal.
- **Puntos Críticos y Desventajas:**
  - **Inadecuado para Procesos ITIL Avanzados:** No fue diseñado como una suite ITSM corporativa. Carece de una CMDB relacional nativa con análisis topológico de impacto, no implementa formalmente la gestión de cambios colegiada (comité CAB, ventanas de mantenimiento y períodos de congelamiento *freeze*), ni contempla la gestión estructurada de problemas con base de errores conocidos (KEDB).

#### D. Freshservice y BMC Helix
- **Freshservice (Freshworks):** Alternativa SaaS moderna y amigable orientada a medianas empresas. Aunque ofrece una experiencia de usuario limpia, impone límites rígidos en personalización profunda de modelos relacionales y cobra suplementos sustanciales por módulos avanzados de activos y orquestación.
- **BMC Helix (Evolución de BMC Remedy):** Pionero histórico del soporte corporativo. Aunque ofrece cumplimiento normativo exhaustivo, arrastra interfaces complejas, despliegues densos y tiempos de implementación que frecuentemente superan los doce meses.

#### E. El Gran Dilema del Mercado
Las organizaciones de hoy se encuentran atrapadas en una encrucijada: o contratan suites comerciales mastodónticas cuyos costos de licenciamiento drenan los presupuestos de innovación tecnológica y atan la empresa a contratos plurianuales inflexibles, o se resignan a herramientas básicas de ticketing que no cumplen con los estándares de auditoría ISO 20000 e ISO 27001.

---

### 1.3. FlowDesk ITSM: Filosofía, Posicionamiento y Enfoque Estratégico

**FlowDesk ITSM** nace para erradicar este dilema, ofreciendo una plataforma de clase empresarial que combina el rigor metodológico de las grandes suites con la agilidad, rendimiento y soberanía de una arquitectura web moderna de última generación.

```text
+----------------------------------------------------------------------------------------------------+
|                                    FILOSOFÍA FUNDACIONAL DE FLOWDESK                               |
+----------------------------------------------------------------------------------------------------+
| 1. SOBERANÍA TECNOLÓGICA Y CERO COSTO DE LICENCIAS POR USUARIO                                     |
|    Sin cobros por agente, sin cargos ocultos por módulos y sin ataduras a nubes propietarias.     |
|                                                                                                    |
| 2. TIPADO ESTRICTO END-TO-END CON TYPESCRIPT Y NEXT.JS 14                                          |
|    Detección temprana de errores en tiempo de compilación. Código 100% tipado, sin "any" laxos.   |
|                                                                                                    |
| 3. ARQUITECTURA VERTICAL SLICE POR DOMINIO                                                         |
|    17 módulos autónomos con contratos públicos estrictos (index.ts y ui.ts). Cero código espagueti.|
|                                                                                                    |
| 4. MODELO RELACIONAL C PURO EN POSTGRESQL                                                          |
|    Integridad referencial, claves foráneas, restricciones de chequeo y aislamiento ACID estricto.  |
|                                                                                                    |
| 5. CUMPLIMIENTO NORMATIVO NATIVO EN EL CORE                                                        |
|    ITIL 4, ISO/IEC 20000-1:2018, ISO/IEC 27001:2022, ISO/IEC 19770-1 y COBIT 2019 de fábrica.    |
+----------------------------------------------------------------------------------------------------+
```

#### Comparativa Integral de Capacidades en la Industria

| Dimensión de Análisis | ServiceNow Enterprise | Jira Service Management | Zendesk Suite | FlowDesk ITSM |
| :--- | :--- | :--- | :--- | :--- |
| **Pila de Arquitectura** | Java/Rhino JS Legacy | Java/Kotlin/React | Ruby/Go/Ember | **Next.js 14 App Router / TypeScript / PostgreSQL** |
| **Tiempo de Respuesta UI** | Variable (2.0s - 5.0s) | Moderado (1.5s - 3.0s) | Rápido (1.0s - 2.0s) | **Hiperrápido (sub-segundo, streaming RSC)** |
| **Modelo de Costos** | 100-250 USD/agente/mes | 20-55 USD/agente/mes | 55-115 USD/agente/mes | **Cero costos de licenciamiento (Open Source / On-Premise)** |
| **Arquitectura de Código** | Scripts dispersos en BD | Monolito de Plugins | Microservicios SaaS | **Vertical Slice Modular desacoplado** |
| **Modelo de Datos** | CSDM propietario | Tablas genéricas de Jira | Entidades planas | **Modelo Relacional C normalizado (PostgreSQL)** |
| **Gestión de Cambios CAB** | Nativa pero compleja | Requiere add-ons | Ausente | **Nativa con SoD, votación colegiada y calendario freeze** |
| **Gestión de Problemas / KEDB** | Nativa | Básica | Inexistente | **Nativa con Ishikawa, 5 Porqués y Workarounds KEDB** |
| **Gestión de Activos (HAM/SAM)** | Módulo adicional de pago | Módulo Assets de pago | Inexistente | **Nativa integrada: Ciclo de vida, licencias y custodios** |
| **Topología CMDB y Grafo** | Discovery costoso | Básica | Inexistente | **Nativa con CTE recursivo y detección de ciclos** |
| **SLA en Horario Hábil** | Configurable | Básico | Básico | **Nativo con calendario laboral y exclusión de feriados** |
| **Seguridad y Auditoría** | Avanzada | Moderada | Moderada | **ISO 27001 nativa: JWT deslizante, rate limit, bitácora** |

---

## 2. Definición Ontológica y Propuesta de Valor de FlowDesk ITSM

### 2.1. Misión y Propósito del Software
FlowDesk ITSM es una plataforma integral de software orientada a la gobernanza, automatización y control operativo de los servicios de tecnología en organizaciones modernas. Su misión principal es transformar las interacciones caóticas entre los usuarios de negocio y las áreas técnicas en **procesos estructurados, auditables, medibles y predecibles**, asegurando la máxima disponibilidad de la infraestructura y alineando cada esfuerzo operativo con los objetivos estratégicos de la empresa.

---

### 2.2. Problemas Críticos que Resuelve en la Operación Diaria
1. **Erradicación de la "Caja Negra" de Atención:** En organizaciones sin un ITSM formal, las solicitudes técnicas se gestionan mediante correos electrónicos, llamadas telefónicas o mensajes informales de chat. Esto provoca solicitudes perdidas, nula visibilidad del estado de atención, duplicación de esfuerzos y frustración en el personal de negocio. FlowDesk canaliza el 100% de la demanda a través de un Portal de Autoservicio con formularios estructurados y seguimiento transparente en tiempo real.
2. **Control Inquebrantable de Plazos (SLA Dinámico en Horas Hábiles):** Las herramientas genéricas calculan los tiempos de atención en horas cronológicas continuas, penalizando injustamente a los técnicos durante fines de semana, noches o días festivos. FlowDesk implementa un motor de cálculo matemático que descuenta de forma automática los períodos no laborables, las pausas justificadas por espera de usuario y el calendario oficial de feriados institucionales, emitiendo alarmas visuales tempranas al 75% y 90% del plazo.
3. **Segregación de Funciones y Cumplimiento Normativo Auditado (SoD e ISO 27001):** En sistemas mal controlados, el mismo usuario que solicita un permiso sensible o la compra de un servidor suele tener la capacidad de autoaprobarse o ejecutar la acción técnica. FlowDesk aplica restricciones estrictas de Segregación de Funciones (*Segregation of Duties* - SoD) a nivel de servidor: ningún usuario puede aprobar sus propios requerimientos, los técnicos no modifican SLAs y los auditores operan bajo un esquema inquebrantable de solo lectura (*read-only*).
4. **Unificación Total del Ecosistema de TI (Incidentes, Cambios, Activos y CMDB):** Los incidentes no ocurren en el vacío; se originan por cambios no autorizados en la infraestructura o por fallas en activos físicos deteriorados. FlowDesk conecta el ciclo de vida del incidente con la Base de Datos de Gestión de la Configuración (CMDB), permitiendo al analista visualizar qué servidor o aplicación causó la falla, qué cambios recientes se desplegaron sobre él y qué impacto colateral se propaga en cascada sobre los servicios del negocio.
5. **Capitalización del Conocimiento Organizacional (KEDB y KCS):** Evita reinventar la rueda ante problemas recurrentes. Cuando un problema técnico complejo es investigado, el equipo documenta la solución temporal (*Workaround*) y el error conocido (*Known Error*) en la base KEDB, poniéndola a disposición inmediata de los analistas de primera línea para resolver incidentes futuros en cuestión de minutos.

---

### 2.3. Indicadores Clave de Desempeño (KPIs) Gobernados por la Suite
FlowDesk calcula, monitorea y expone de forma continua las métricas fundamentales exigidas por ITIL 4 y COBIT:
- **MTTR (*Mean Time to Resolve*):** Tiempo medio transcurrido entre el registro de un incidente y su restauración efectiva.
- **MTTA (*Mean Time to Acknowledge*):** Tiempo medio entre la creación de un ticket y su primera asignación o respuesta formal por parte del equipo de soporte.
- **FCR (*First Contact Resolution*):** Porcentaje de incidentes y solicitudes resueltos satisfactoriamente en el primer nivel de contacto sin requerir escalamientos posteriores.
- **Tasa de Cumplimiento de SLA (%):** Porcentaje de tickets cuya primera respuesta y resolución se ejecutaron dentro del umbral acordado en el Catálogo de Servicios.
- **CSAT (*Customer Satisfaction Score*):** Calificación promedio otorgada por los usuarios solicitantes al término de la atención mediante encuestas obligatorias de satisfacción de 1 a 5 estrellas.
- **Tasa de Éxito de Cambios (%):** Proporción de Solicitudes de Cambio (RFC) implementadas satisfactoriamente sin generar incidentes no planificados ni requerir la activación de planes de retroceso (*Rollback*).
- **Utilización y Cumplimiento de Licencias SAM (%):** Relación matemática entre licencias de software adquiridas e instaladas, detectando situaciones de sublicenciamiento (riesgo legal) o sobrelicenciamiento (desperdicio financiero).

---

## 3. Manual Exhaustivo de Uso Operativo — Guía Paso a Paso por Perfil

FlowDesk ITSM implementa un modelo de Control de Acceso Basado en Roles (RBAC) con **10 perfiles oficiales**. Cada perfil dispone de una consola especializada, permisos rigurosamente delimitados por el backend y una ruta de entrada canónica. A continuación se describe minuciosamente cómo se utiliza el sistema desde la perspectiva de cada actor.

---

### 3.1. Perfil 1: Solicitante (Empleado / Usuario Final)

#### Misión y Propósito
El Solicitante es el usuario de negocio o cliente interno de la organización. Su experiencia en el sistema está diseñada para ser intuitiva, rápida y orientada al autoservicio, eliminando la necesidad de interactuar con correos o llamadas.

#### Acceso y Navegación
- **Ruta de Entrada Canónica:** \`/plataforma/operacion/paneles/solicitante\` (Redirigida automáticamente al iniciar sesión o acceder a \`/dashboard\`).
- **Opciones de Menú Disponibles:**
  - *Mi trabajo:* Panel del solicitante, Mis solicitudes y fallas, Encuestas pendientes.
  - *Mesa de Servicio:* Catálogo de Servicios, Reportar Falla Técnica (Incidente), Solicitar Servicio, Mis Tickets.
  - *Conocimiento:* Base de Conocimiento de Autoayuda (Artículos públicos).
  - *Mi cuenta:* Mi perfil, Seguridad, Preferencias de notificación.

#### Flujos Operativos Paso a Paso

```text
[Inicio: Necesidad del Usuario]
         │
         ├──► ¿Es una duda común? ──► Consulta Base de Conocimiento ──► Resuelve solo (Autoservicio)
         │
         ├──► ¿Se rompió algo? ──► Formulario de Reporte de Incidente
         │                                │
         │                                ├── Selecciona Servicio y Urgencia
         │                                └── Adjunta Captura/Evidencia
         │
         └──► ¿Requiere un recurso? ──► Catálogo de Solicitudes
                                          │
                                          ├── Llena Formulario Dinámico
                                          └── Se activa Aprobación de Área
```

##### A. Búsqueda de Autoayuda en la Base de Conocimiento
1. El solicitante accede a \`/plataforma/conocimiento\`.
2. Escribe una palabra clave en el buscador inteligente (ej. "configurar vpn", "impresora atascada").
3. El sistema lista artículos aprobados con soluciones paso a paso.
4. Si el artículo resuelve su inquietud, hace clic en "Sí, me fue útil", incrementando el contador de utilidad del artículo y evitando la apertura innecesaria de un ticket.

##### B. Reporte de un Incidente Técnico (Falla no planificada)
1. Navega a \`/plataforma/incidentes/crear\` (o selecciona "Reportar Incidente" en el panel).
2. **Selección del Servicio:** Elige el servicio afectado dentro del catálogo (ej. "Conectividad de Red", "Correo Corporativo").
3. **Impacto y Urgencia Percibida:** Selecciona el grado en que la falla le impide trabajar (ej. *Urgencia: Alta - No puedo continuar mis labores*).
4. **Descripción del Problema:** Ingresa un título claro y un detalle pormenorizado del comportamiento anómalo.
5. **Evidencias Adjuntas:** Utiliza el componente de carga para adjuntar capturas de pantalla, archivos de registro o mensajes de error en formato PNG, JPG o PDF.
6. **Envío y Confirmación:** Presiona el botón "Enviar Incidente". El backend ejecuta la validación Zod, registra el registro en las tablas \`ticket\` y \`ticket_incidente\`, calcula la prioridad automática mediante la matriz ITIL (Impacto × Urgencia), inicia el temporizador de SLA en horario hábil y le asigna un código correlativo inmutable (ej. \`INC-2026-0042\`).

##### C. Radicación de una Solicitud de Servicio
1. Navega a \`/plataforma/solicitudes/crear\` o consulta el Catálogo de Servicios en \`/plataforma/servicios/catalogo\`.
2. Selecciona el servicio deseado (ej. "Asignación de Licencia Microsoft 365 Copilot", "Acceso a Carpeta Compartida").
3. **Diligenciamiento de Formulario Dinámico:** La interfaz renderiza dinámicamente los campos requeridos por ese servicio específico (justificación de negocio, centro de costos, perfil de acceso solicitado).
4. Hace clic en "Enviar Solicitud". Si el servicio requiere autorización de jefatura, el sistema coloca automáticamente el ticket en estado \`pendiente_aprobacion\` y notifica de inmediato a su Gestor de Área.

##### D. Seguimiento y Comunicación en "Mis Tickets"
1. El solicitante consulta \`/plataforma/tickets/gestion/mis-tickets\`.
2. Hace clic sobre cualquier ticket para abrir la vista detallada.
3. **Stepper Visual de Progreso:** Visualiza con claridad en qué etapa se encuentra su solicitud: *Registrado -> En Aprobación -> En Atención -> Resuelto -> Cerrado*.
4. **Línea de Vida y Conversación:** Puede leer las notas públicas redactadas por el técnico resolutor y escribir respuestas o adjuntar nuevas evidencias en el hilo de comentarios. Los comentarios internos de los técnicos están rigurosamente filtrados y jamás son visibles para este perfil.

##### E. Aceptación de la Solución y Encuesta de Satisfacción (CSAT)
1. Cuando el técnico concluye la atención, el ticket pasa a estado \`resuelto\`.
2. El solicitante recibe un aviso en pantalla y una notificación por correo electrónico.
3. Al entrar al ticket, se le presentan dos opciones:
   - **Confirmar Solución y Calificar:** Si la falla fue superada, califica el servicio con 1 a 5 estrellas, selecciona etiquetas de percepción ("Rapidez", "Amabilidad", "Eficacia") e ingresa un comentario final. Al confirmar, el ticket pasa inmediatamente a estado \`cerrado\`.
   - **Reclamar y Reabrir:** Si la falla persiste, hace clic en "La solución no funcionó", ingresa obligatoriamente el motivo de reapertura y el ticket retorna al estado \`en_progreso\` asignado al mismo técnico, reactivando los cronómetros de SLA.

---

### 3.2. Perfil 2: Técnico (Analista de Mesa de Ayuda N1 / Soporte Especializado N2 y N3)

#### Misión y Propósito
El Técnico es el agente resolutor de primera línea (N1) o especialista de soporte avanzado (N2/N3). Su responsabilidad fundamental es diagnosticar, atender y restaurar los servicios interrumpidos dentro de los acuerdos de nivel de servicio (SLA), registrar información técnica precisa y alimentar la base de conocimiento corporativa.

#### Acceso y Navegación
- **Ruta de Entrada Canónica:** \`/plataforma/operacion/paneles/tecnico\`.
- **Opciones de Menú Disponibles:**
  - *Mi trabajo:* Panel del técnico, Mis tickets asignados, Bandeja de casos libres, Calendario de intervenciones.
  - *Mesa de Servicio:* Bandeja de Incidentes, Bandeja de Solicitudes, Consulta de Tickets, Catálogo de Servicios.
  - *Cambios:* Registrar Solicitud de Cambio RFC, Mis cambios asignados para ejecución.
  - *Problemas:* Consultar Problemas Conocidos (KEDB), Reportar Candidato a Problema.
  - *Activos y CMDB:* Inventario de Activos asignados a soporte, Mantenimiento preventivo.
  - *Conocimiento:* Base de Conocimiento, Crear nuevo artículo técnico.
  - *Mi cuenta:* Perfil, Disponibilidad operativa (activo/receso/turno).

#### Flujos Operativos Paso a Paso

```text
[Cola de Tickets Libres / Asignados]
                 │
                 ├──► Toma Ticket ("Autoasignar")
                 │           │
                 │           └──► Estado cambia a "En Progreso"
                 │
                 ├──► Diagnóstico Técnico: Consulta KEDB / CMDB
                 │
                 ├──► ¿Requiere insumos o respuesta del usuario?
                 │           │
                 │           └──► Cambia a "En Espera" (Pausa de SLA con justificación)
                 │
                 ├──► ¿Requiere cambio en infraestructura? ──► Registra RFC operativa
                 │
                 └──► Solución aplicada ──► Ingresa diagnóstico y causa raíz
                                                └──► Estado "Resuelto" ──► Notifica al usuario
```

##### A. Gestión de Colas y Autoasignación de Casos
1. El técnico ingresa a su panel y revisa el componente "Tickets Libres en Cola".
2. Los tickets se visualizan ordenados con base en su prioridad ITIL (P1 Crítico a P4 Bajo) y tiempo restante de SLA. Los casos P1 y P2 aparecen resaltados con insignias rojas y anaranjadas.
3. Hace clic en el botón **"Tomar Ticket"** (Autoasignación). El backend actualiza la fila en la tabla \`ticket\` estableciendo el campo \`id_tecnico_asignado\` con el ID del técnico en sesión y cambia el estado de \`abierto\` a \`en_progreso\`.

##### B. Ejecución de Diagnóstico y Consulta de KEDB
1. Dentro del detalle del ticket, el técnico examina los datos aportados por el usuario, el servicio afectado y los CIs asociados en la CMDB.
2. Hace clic en la pestaña "Base de Errores Conocidos (KEDB)" ubicada en el panel lateral.
3. El sistema realiza una búsqueda contextual cruzando el servicio del ticket con los registros de la KEDB.
4. Si existe un *Workaround* publicado, el técnico sigue los pasos documentados, reduciendo drásticamente el tiempo de investigación.

##### C. Registro de Notas Técnicas vs. Comentarios Públicos
1. El técnico dispone de un editor de bitácora con dos modos estrictamente diferenciados:
   - **Nota de Trabajo Interna (Confidencial):** Marcada con fondo amarillo pálido y candado. Permite registrar comandos ejecutados en servidores, contraseñas temporales, hipótesis técnicas o coordinaciones con otros ingenieros. Estas notas se guardan con \`es_privado = true\` y ningún solicitante podrá verlas.
   - **Comentario Público:** Dirigido al solicitante para solicitar aclaraciones, confirmar pruebas o brindar instrucciones de configuración.

##### D. Transición de Estados y Suspensión Justificada de SLA
1. Si el técnico requiere que el usuario entregue información adicional o debe esperar la llegada de una pieza de repuesto encargada a un proveedor:
   - Cambia el estado a \`en_espera\`.
   - El sistema despliega un diálogo modal que exige seleccionar el motivo (\`espera_usuario\`, \`espera_proveedor\`, \`espera_aprobacion\`) y redactar una justificación obligatoria de al menos 15 caracteres.
   - **Efecto en el Motor de SLA:** El temporizador de resolución detiene su cuenta regresiva de horas hábiles de forma automática mientras el ticket permanezca en espera, garantizando justicia en la evaluación del rendimiento del técnico.
2. Al recibir la respuesta o pieza, el técnico retorna el estado a \`en_progreso\`, reanudando el cronómetro con precisión de segundos.

##### E. Resolución Formal y Cierre Técnico
1. Aplicada la solución correctiva, el técnico hace clic en **"Marcar como Resuelto"**.
2. **Requisitos Obligatorios de Salida:**
   - Seleccionar el código de categoría de cierre (ej. "Reconfiguración de Software", "Reemplazo de Hardware", "Capacitación a Usuario").
   - Detallar la solución final aplicada y la causa raíz identificada.
   - Indicar si amerita redactar un artículo de conocimiento o registrar un problema.
3. El ticket pasa a estado \`resuelto\`, se registra la marca de tiempo exacta de fin de resolución para el SLA y se envía la invitación de confirmación al solicitante.

---

### 3.3. Perfil 3: Supervisor Operativo (Team Lead / Líder de Mesa de Ayuda)

#### Misión y Propósito
El Supervisor es el líder operativo de la mesa de ayuda. Su función no es atender tickets individuales, sino vigilar la salud global de la operación, distribuir equitativamente la carga de trabajo entre los analistas, prevenir violaciones de SLA mediante alarmas tempranas y garantizar la disciplina operativa y calidad del servicio.

#### Acceso y Navegación
- **Ruta de Entrada Canónica:** \`/plataforma/operacion/paneles/supervisor\`.
- **Opciones de Menú Disponibles:**
  - *Mi trabajo:* Panel del supervisor, Monitor de Colas en Tiempo Real, Asignación y Rebalanceo, Monitoreo de Turnos y Ausencias.
  - *Mesa de Servicio:* Gestión Integral de Incidentes, Gestión de Solicitudes, Auditoría Operativa de Tickets, Control de Alarmas de SLA.
  - *Cambios:* Aprobación Técnica de Cambios Estándar y Menores, Calendario de Cambios.
  - *Problemas:* Asignación de Casos de Problema a Especialistas.
  - *Activos y CMDB:* Fiscalización de Bajas de Hardware, Inventario de la Mesa.
  - *Conocimiento:* Revisión Editorial y Aprobación de Artículos Técnicos.
  - *Reportes:* Tableros de Rendimiento Operativo, Productividad de Técnicos, Reporte de SLA por Departamento.
  - *Mi cuenta:* Perfil, Parámetros de supervisión.

#### Flujos Operativos Paso a Paso

```text
[Monitor Operativo en Tiempo Real]
                 │
                 ├──► Alerta de SLA al 75% o 90% ──► Intervención y Reasignación Forzada
                 │
                 ├──► Sobrecarga de un Técnico (WIP > Límite) ──► Rebalanceo hacia Técnicos Libres
                 │
                 ├──► Ausencia Imprevista de Técnico ──► Reasignación Masiva de Casos
                 │
                 └──► Artículo Técnico en Borrador ──► Revisión Editorial ──► Publicación en Base
```

##### A. Monitoreo en Tiempo Real y Balanceo de Carga (WIP)
1. El supervisor accede al "Tablero de Carga y Capacidad" en su consola.
2. Visualiza la matriz de técnicos activos, su estado de turno (disponible, en atención, en receso) y el número de tickets asignados en progreso (*Work In Progress* - WIP).
3. Si un técnico acumula un número excesivo de casos mientras otro tiene baja asignación, selecciona los tickets en exceso y ejecuta una **Reasignación Asistida**, seleccionando al técnico con menor carga disponible dentro del grupo de competencia adecuado.

##### B. Intervención Preventiva ante Alarmas de SLA (Umbrales 75% y 90%)
1. La consola del supervisor destaca la sección **"Riesgo Crítico de SLA"**.
2. El sistema lista todos los tickets cuyo tiempo transcurrido supera el 75% del límite comprometido (alarma amarilla) o el 90% (alarma roja intermitente).
3. El supervisor hace clic en el ticket en peligro, evalúa el cuello de botella e interactúa directamente:
   - Puede agregar una instrucción urgente mediante nota interna.
   - Puede reasignar el caso a un especialista Senior de N2/N3.
   - Puede declarar un Incidente Mayor si la falla tiene impacto masivo no advertido inicialmente.

##### C. Control de Calidad Post-Atención y Revisiones Aleatorias
1. Mediante la opción \`/plataforma/tickets/gestion/auditoria\`, el supervisor efectúa auditorías de calidad sobre tickets en estado \`resuelto\` o \`cerrado\`.
2. Evalúa si la solución técnica fue documentada conforme a los estándares institucionales, si la categorización fue correcta y analiza las calificaciones CSAT inferiores a 3 estrellas emitidas por los usuarios, abriendo planes de acción con los analistas responsables.

##### D. Revisión Editorial de Artículos de Conocimiento
1. Los técnicos redactan borradores de artículos de conocimiento tras resolver incidentes novedosos.
2. El supervisor accede a la bandeja editorial en \`/plataforma/conocimiento/gestion\`.
3. Revisa la claridad pedagógica, la exactitud técnica de los procedimientos, aprueba el contenido y cambia el estado a \`publicado\`, haciéndolo disponible de inmediato para toda la organización.

---

### 3.4. Perfil 4: Gestor de Área (Jefe Departamental / Aprobador Funcional)

#### Misión y Propósito
El Gestor de Área representa a las jefaturas y gerencias de las unidades funcionales de la empresa (Finanzas, Recursos Humanos, Operaciones, Ventas, Legal). Su responsabilidad es evaluar la pertinencia operativa y presupuestaria de las solicitudes realizadas por los colaboradores de su departamento, actuando como filtro de gobierno antes de que TI consuma recursos.

#### Acceso y Navegación
- **Ruta de Entrada Canónica:** \`/plataforma/operacion/paneles/gestor-area\`.
- **Opciones de Menú Disponibles:**
  - *Mi trabajo:* Panel del gestor, Solicitudes pendientes de mi aprobación, Consumo departamental de TI.
  - *Mesa de Servicio:* Solicitudes de mi equipo, Incidentes que afectan mi área.
  - *Cambios:* Aprobaciones de negocio para cambios en sistemas departamentales.
  - *Activos y CMDB:* Inventario de activos asignados al personal de mi área.
  - *Reportes:* Reporte mensual de cumplimiento de servicio a mi área.
  - *Mi cuenta:* Perfil, Delegación temporal de firma de aprobación por vacaciones.

#### Flujos Operativos Paso a Paso

```text
[Solicitud de Colaborador del Área (ej. Software Especializado)]
                        │
                        ▼
       [Bandeja de Aprobaciones del Gestor]
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
   [Aprobar]                         [Rechazar]
       │                                 │
       ├── Ingresa justificación         ├── Ingresa motivo obligatorio
       └── Pasa a Mesa de TI para        └── Ticket cancelado formalmente;
           atención técnica                  notifica al empleado con causa
```

##### A. Dictamen de Solicitudes Departamentales
1. Cuando un empleado radica una solicitud que compromete recursos (ej. compra de periféricos, accesos a sistemas con licencias de costo por usuario, permisos a carpetas confidenciales), el Gestor de Área recibe una alerta en su panel.
2. Ingresa a la pantalla de detalle de aprobación.
3. Evalúa la información: colaborador solicitante, cargo, centro de costos que absorberá el gasto, justificación del empleado y valor económico estimado si aplica.
4. **Dictamen con Firma Electrónica Interna:**
   - **Aprobar:** Presiona "Aprobar Solicitud". Puede añadir observaciones sobre el centro de costos. La solicitud se desbloquea y avanza a la cola de atención de los técnicos de TI.
   - **Rechazar:** Presiona "Rechazar Solicitud". El sistema exige de manera obligatoria redactar el motivo del rechazo. El ticket finaliza su ciclo de vida como cancelado/rechazado, notificando al empleado las razones de la negativa y evitando cualquier consumo innecesario de tiempo por parte del equipo de TI.

##### B. Principio de Segregación de Funciones (SoD) en Aprobaciones
- Si el propio Gestor de Área radica una solicitud para sí mismo (ej. solicita un nuevo portátil corporativo), el sistema aplica la regla **RN-06 / RN-21 de Segregación de Funciones**: el software deshabilita automáticamente los botones de aprobación para ese ticket específico. El gestor no puede autoaprobarse; la solicitud se enruta jerárquicamente a la gerencia superior o al suplente configurado.

##### C. Delegación Temporal de Autoridad por Vacaciones o Licencia
1. Antes de iniciar un período de ausencia, el Gestor de Área accede a \`/plataforma/mi-cuenta/delegacion\`.
2. Selecciona a un colega con rango equivalente como aprobador interino e indica el rango de fechas de inicio y fin.
3. Durante ese lapso, todas las solicitudes dirigidas a su área se duplican en la bandeja del interino con registro auditado en la tabla \`auditoria_sistema\`.

---

### 3.5. Perfil 5: Auditor de Cumplimiento (Compliance, Seguridad y Auditoría Interna)

#### Misión y Propósito
El Auditor tiene como misión fiscalizar de manera objetiva e independiente la operación integral de TI, verificando la adherencia estricta a las políticas corporativas, los marcos de referencia (ITIL, COBIT) y las certificaciones normativas internacionales (ISO/IEC 20000-1 e ISO/IEC 27001).

#### Acceso y Navegación
- **Ruta de Entrada Canónica:** \`/plataforma/operacion/paneles/auditor\`.
- **Régimen de Acceso:** **Read-Only Absoluto (Solo Lectura)**. En el backend, todos los endpoints de mutación (\`POST\`, \`PUT\`, \`DELETE\`) rechazan de forma tajante cualquier petición proveniente de un token de sesión con perfil de auditor.
- **Opciones de Menú Disponibles:**
  - *Mi trabajo:* Panel de cumplimiento y auditoría, Muestreo de casos.
  - *Mesa de Servicio:* Vista global de todos los tickets e incidentes, Historial de atenciones.
  - *Cambios:* Pista de auditoría de cambios RFC, Verificación de firmas CAB, Revisión de PIRs.
  - *Problemas:* Registro de problemas, Auditoría de aceptación de riesgos mayores.
  - *Activos y CMDB:* Verificación de inventario físico vs. contable, Cumplimiento de licencias SAM.
  - *Plataforma:* Bitácora inmutable de auditoría (\`auditoria_sistema\`), Registro de intentos de inicio de sesión y bloqueos, Matriz de perfiles y accesos asignados.
  - *Reportes:* Suite completa de reportes de gobernanza, exportación masiva de datos en Excel/PDF.
  - *Mi cuenta:* Perfil y seguridad.

#### Flujos Operativos Paso a Paso

```text
[Misión de Auditoría / Fiscalización ISO]
                   │
                   ├──► Inspección Forense en Bitácora Inmutable (auditoria_sistema)
                   │           └── Verifica: Quién, Cuándo, Qué cambió, IP origen, Valor anterior/nuevo
                   │
                   ├──► Muestreo Aleatorio de Tickets
                   │           └── Verifica: Respaldos de solución, Evidencias, Tiempos SLA reales
                   │
                   ├──► Fiscalización de Gestión de Cambios (CAB)
                   │           └── Verifica: ¿Se desplegó algún cambio sin aprobación colegiada?
                   │
                   └──► Recertificación Periódica de Usuarios y Permisos RBAC
```

##### A. Inspección Forense en la Bitácora Inmutable
1. El auditor accede a \`/plataforma/admin/auditoria\`.
2. Filtra por rango de fechas, módulo (ej. \`seguridad\`, \`cambios\`, \`identidades\`) o usuario sospechoso.
3. La interfaz expone la traza completa de cada evento:
   - Identificador del evento y marca temporal con precisión de milisegundos.
   - Usuario actor, dirección IP de origen y agente de usuario (*User-Agent*).
   - Acción ejecutada (\`INSERT\`, \`UPDATE\`, \`DELETE\`, \`LOGIN_FAILED\`, \`PERMISSION_DENIED\`).
   - Diferencia detallada (*Diff*): Estructura JSON mostrando el valor exacto del campo antes de la modificación y el nuevo valor asentado en la base de datos.
4. Cualquier intento de alteración manual directa sobre la base de datos es detectable al no contar con la firma y correlación de la aplicación.

##### B. Verificación de Cumplimiento de Segregación de Funciones en Cambios
1. El auditor consulta la lista de cambios ejecutados en producción en \`/plataforma/cambios/gestion/todos\`.
2. Filtra aquellos cambios de clasificación "Normal" o "Emergencia".
3. Revisa la pestaña de dictamen del CAB:
   - Comprueba que el solicitante del cambio sea un usuario distinto a los miembros del comité que emitieron los votos aprobatorios.
   - Comprueba que la fecha de ejecución registrada en producción sea posterior a la fecha del dictamen favorable del CAB.
   - Si detecta un cambio ejecutado sin votación colegiada previa, genera un hallazgo de no conformidad mayor según ISO 20000 cláusula 8.5.

##### C. Recertificación de Accesos y Privilegios RBAC
1. Accede a \`/plataforma/admin/usuarios\` y \`/plataforma/admin/perfiles\`.
2. Extrae la matriz consolidada de usuarios y perfiles asignados.
3. Cruza la lista de cuentas activas contra la nómina de personal vigente de la empresa para comprobar que todos los exempleados hayan sido dados de baja de inmediato en el sistema (\`activo = false\`), mitigando riesgos de fuga de información según ISO 27001 control A.9.

---

### 3.6. Perfil 6: Aprobador CAB (Miembro del Comité Consultivo de Cambios)

#### Misión y Propósito
El Aprobador CAB (*Change Advisory Board Member*) es un especialista de alto nivel o directivo que representa los intereses técnicos, de seguridad y de negocio de la organización. Su cometido es analizar las Solicitudes de Cambio (RFC) significativas que podrían amenazar la estabilidad de los servicios críticos, emitiendo un voto fundado y colegiado.

#### Acceso y Navegación
- **Ruta de Entrada Canónica:** \`/plataforma/operacion/paneles/aprobador\`.
- **Opciones de Menú Disponibles:**
  - *Mi trabajo:* Panel del aprobador, Solicitudes de cambio pendientes de mi voto, Sesiones de comité programadas.
  - *Cambios:* Bandeja de Cambios Normales y de Emergencia, Calendario de Cambios hacia Adelante (FSC), Historial de dictámenes emitidos.
  - *Problemas:* Consulta y dictamen sobre Aceptación de Riesgos en Problemas Mayores.
  - *Activos y CMDB:* Autorización de Bajas de Activos por obsolescencia o montos mayores.
  - *Reportes:* Reporte de efectividad y riesgos de cambios en comités CAB.
  - *Mi cuenta:* Perfil, Disponibilidad para convocatorias de emergencia (ECAB).

#### Flujos Operativos Paso a Paso

```text
[Convocatoria a Sesión CAB para Cambio en Producción]
                           │
                           ▼
          [Análisis Técnico y de Riesgos de la RFC]
                           │
         ├── Revisa: Plan de Implantación detallado
         ├── Revisa: Plan de Marcha Atrás (Rollback) probado
         ├── Revisa: Ventana de Mantenimiento y Conflicto Freeze
         └── Revisa: CIs de la CMDB y Servicios afectados
                           │
                           ▼
          [Emisión de Voto Individual en Plataforma]
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   [Voto Favorable]  [Con Observaciones] [Voto Rechazado]
```

##### A. Análisis de Solicitud de Cambio (RFC) en Evaluación
1. El aprobador ingresa a su bandeja de votaciones en \`/plataforma/cambios/aprobaciones\`.
2. Abre la solicitud de cambio (ej. "Migración de Base de Datos del ERP a Cluster PostgreSQL 16").
3. **Inspección de Cuatro Dimensiones Críticas de la RFC:**
   - **Evaluación de Riesgo e Impacto:** Analiza la probabilidad de caída y la severidad estimada para los usuarios finales.
   - **Plan de Trabajo e Implantación:** Verifica que los pasos a ejecutar en la ventana estén desglosados en tareas secuenciales con responsables asignados.
   - **Plan de Rollback (Retirada de Emergencia):** Comprueba que exista un procedimiento claro para devolver el sistema a su estado original previo si el despliegue fracasa, con un tiempo máximo fijado antes de que culmine la ventana.
   - **Impacto Topológico en CMDB:** Revisa el grafo interactivo de CIs para constatar qué otros servicios o aplicaciones dependen de la base de datos a modificar.

##### B. Emisión del Voto Colegiado en el Comité
1. Dentro de la RFC, el aprobador dispone del panel oficial de deliberación.
2. Si el aprobador figura como solicitante, implementador o promotor del cambio, el sistema ejecuta la regla de autoexclusión SoD y deshabilita su voto.
3. El aprobador selecciona su postura:
   - **Favorable (Aprobado):** Considera que el cambio está maduro, el riesgo está controlado y la ventana es idónea.
   - **Favorable con Observaciones:** Aprueba sujeto a condiciones técnicas específicas (ej. "Aprobado siempre que se realice un backup completo a frío una hora antes").
   - **Desfavorable (Rechazado):** Considera que el plan es deficiente, el riesgo para el negocio es inaceptable o colisiona con el cierre contable de fin de mes.
4. Ingresa un sustento obligatorio en el campo de justificación y firma su voto. El sistema registra el voto individual en la tabla \`cambio_votacion_cab\`.
5. Cuando todos los miembros convocados registran su voto, el Gestor de Cambios procesa el dictamen definitivo colegiado.

---

### 3.7. Perfil 7: Gestor de Cambios (Change Manager)

#### Misión y Propósito
El Gestor de Cambios es el custodio del proceso de Habilitación del Cambio (*Change Enablement* de ITIL 4). Su responsabilidad es maximizar la cantidad de cambios exitosos en la infraestructura tecnológica y minimizar el número y severidad de incidentes provocados por modificaciones deficientemente planificadas.

#### Acceso y Navegación
- **Ruta de Entrada Canónica:** \`/plataforma/operacion/paneles/gestor-cambios\`.
- **Opciones de Menú Disponibles:**
  - *Mi trabajo:* Panel del gestor de cambios, Coordinación del CAB, Calendario de intervenciones.
  - *Cambios:* Registro maestro de RFCs, Calendario hacia Adelante (FSC), Períodos de Congelamiento (*Freeze*), Programación de Ventanas de Mantenimiento, Revisiones Post-Implementación (PIR), Modelos de Cambio Estándar.
  - *Reportes:* Métricas de cambios, Tasa de cambios exitosos vs. fallidos, Incidentes atribuibles a cambios.
  - *Mi cuenta:* Perfil y seguridad.

#### Flujos Operativos Paso a Paso

```text
[Ciclo de Vida Integral de la Gestión de Cambios]
                        │
      1. Recepción y Clasificación: ¿Estándar, Normal o Emergencia?
                        │
      2. Planificación en Calendario FSC: Detección de Conflictos / Freeze
                        │
      3. Coordinación y Dictamen del Comité CAB
                        │
      4. Autorización y Despliegue en Ventana de Mantenimiento
                        │
      5. Verificación de Resultados y Cierre con Revisión PIR
```

##### A. Clasificación de la Solicitud de Cambio (RFC)
1. El Gestor de Cambios revisa las nuevas RFC radicadas en el sistema.
2. Determina el flujo correspondiente según ITIL 4:
   - **Cambio Estándar:** Modificación preautorizada, rutinaria, de bajo riesgo y con procedimiento probado (ej. renovación de certificado SSL de entorno secundario, parcheo mensual de antivirus en estaciones). No requiere reunión del CAB y pasa directo a programación.
   - **Cambio Normal:** Requiere evaluación técnica completa, análisis de riesgos, programación en el calendario FSC y dictamen formal del comité CAB.
   - **Cambio de Emergencia:** Diseñado para solucionar un incidente P1 activo o vulnerabilidad crítica de seguridad. Omite los plazos ordinarios y convoca de inmediato al Comité de Emergencia (ECAB) para aprobación express verbal o digital.

##### B. Administración del Calendario hacia Adelante (FSC) y Reglas de Freeze
1. El gestor accede a \`/plataforma/cambios/calendario\`.
2. La vista expone un calendario interactivo con las ventanas de mantenimiento autorizadas.
3. **Detección Automática de Conflictos:** Si dos ingenieros intentan programar cambios simultáneos sobre el mismo CI o servidores interconectados en la CMDB, el motor de colisiones de FlowDesk emite una advertencia visual inmediata.
4. **Configuración de Períodos de Congelamiento (*Change Freeze*):** Durante fechas críticas para el negocio (ej. Black Friday, cierre fiscal o balance anual), el gestor establece una regla de congelamiento en el sistema. Mientras la regla esté activa, la plataforma bloquea la programación de cambios normales en las fechas restringidas, permitiendo exclusivamente cambios de emergencia debidamente autorizados por la alta dirección.

##### C. Consolidación del Dictamen CAB y Autorización de Despliegue
1. Al concluir la votación del comité, el gestor evalúa la matriz de votos registrados.
2. Si la mayoría requerida fue alcanzada y no existen vetos de seguridad, el gestor emite el dictamen formal: cambia el estado de la RFC a \`aprobado\` y \`programado\`.
3. El sistema asigna automáticamente la orden de implementación al equipo técnico correspondiente.

##### D. Fiscalización Post-Implementación (PIR - Post-Implementation Review)
1. Culminada la ventana de mantenimiento y finalizado el despliegue técnico:
   - Si el cambio se completó con éxito, el gestor registra los resultados de las pruebas funcionales de aceptación y pasa el estado a \`exitoso\`.
   - Si el despliegue falló y se ejecutó el plan de Rollback, o si el cambio generó incidentes en producción durante las 24 horas posteriores, el gestor convoca a una sesión obligatoria de **Revisión Post-Implementación (PIR)**.
2. En la pantalla de PIR (\`/plataforma/cambios/gestion/pir\`), documenta las causas del fracaso, las lecciones aprendidas y crea un registro de Problema para subsanar los defectos antes de reintentar el despliegue.

---

### 3.8. Perfil 8: Gestor de Activos y Configuración (Asset & Configuration Manager)

#### Misión y Propósito
Este perfil unifica las disciplinas de Gestión de Activos de TI (ITAM) —tanto hardware físico (HAM) como licencias de software (SAM)— y Gestión de la Configuración del Servicio (SACM / CMDB). Su misión es mantener un inventario exacto y actualizado de los recursos tecnológicos, sus relaciones de dependencia y su ciclo de vida financiero y operacional, protegiendo a la empresa contra auditorías de software, desperdicio de capital y fallas imprevistas.

#### Acceso y Navegación
- **Ruta de Entrada Canónica:** \`/plataforma/operacion/paneles/gestor-activos\`.
- **Opciones de Menú Disponibles:**
  - *Mi trabajo:* Panel de activos y configuración, Auditorías de inventario pendientes, Alertas de vencimiento de garantías y licencias.
  - *Activos y CMDB:*
    - *Hardware (HAM):* Inventario patrimonial, Altas de equipos, Asignación a custodios, Transferencias, Plan de mantenimiento preventivo, Tramitación de Bajas.
    - *Software (SAM):* Catálogo de Licencias, Asignaciones por puesto/usuario, Auditoría de cumplimiento y brechas de uso.
    - *Configuración (CMDB):* Elementos de Configuración (CIs), Mapa y Grafo Topológico de Dependencias, Tipos de CI y Familias, Reconciliación Activo-CI.
    - *Proveedores y Contratos:* Proveedores de TI, Contratos de Mantenimiento y Soporte.
  - *Reportes:* Reporte patrimonial de activos, Semáforo de obsolescencia, Balance de cumplimiento de licencias SAM.
  - *Mi cuenta:* Perfil y seguridad.

#### Flujos Operativos Paso a Paso

```text
[Ciclo de Vida de Activos de Hardware - HAM]
                  │
        1. Alta Patrimonial ──► Registro de Marca, Modelo, Serial, Factura y QR/Barcode
                  │
        2. Almacenamiento en Stock ──► Estado "En Almacén"
                  │
        3. Entrega a Empleado ──► Asignación a Custodio con Acta Digital Firmada
                  │
        4. Operación y Soporte ──► Vinculación en Incidentes y Mantenimientos Preventivos
                  │
        5. Fin de Vida Útil ──► Desincorporación formal, Borrado Seguro y Acta de Baja
```

##### A. Alta Patrimonial y Gestión del Hardware (HAM)
1. Al recibir nuevos equipos tecnológicos (laptops, servidores, conmutadores de red), el gestor accede a \`/plataforma/activos/hardware/crear\`.
2. Registra los metadatos técnicos y financieros: tipo de activo, fabricante, modelo, número de serie único de fábrica, código de placa institucional, orden de compra, fecha de adquisición, costo monetario, proveedor y fecha de vencimiento de la garantía oficial.
3. El activo se inicializa en estado \`en_almacen\`.
4. Al entregar el equipo a un trabajador:
   - Ejecuta la acción "Asignar Custodio".
   - Selecciona el usuario beneficiario y la sede física.
   - El sistema genera un comprobante digital de entrega que vincula la responsabilidad del equipo al perfil del empleado.

##### B. Control de Cumplimiento de Software y Licencias (SAM)
1. El gestor administra el catálogo de software en \`/plataforma/activos/software\`.
2. Registra las compras de contratos y suscripciones (ej. Adobe Creative Cloud, Oracle Database Enterprise, Microsoft 365 E5), especificando:
   - Métrica de licenciamiento (por usuario nombrado, por núcleo de procesador, por dispositivo concurrente).
   - Cantidad neta de derechos adquiridos (*entitlements*).
   - Claves de producto (*product keys*) y fechas de vencimiento de soporte.
3. Al asociar licencias a computadoras o empleados, la plataforma actualiza en tiempo real el **Semáforo SAM**:
   - **Verde:** Cumplimiento óptimo (Licencias instaladas <= Licencias compradas).
   - **Amarillo:** Ocupación superior al 85% de las licencias disponibles (riesgo de agotamiento).
   - **Rojo:** Sublicenciamiento detectado (Más instalaciones que derechos adquiridos). Genera un riesgo legal severo ante una auditoría del fabricante de software (ej. BSA / Microsoft Audit).

##### C. Modelado Topológico de Servicios en la CMDB
1. Un activo físico representa una propiedad contable; un **Elemento de Configuración (CI)** en la CMDB representa un componente que presta un servicio de TI y cómo se comunica con los demás.
2. El gestor accede a \`/plataforma/cmdb/inventario\`.
3. Crea un CI (ej. Servidor Web \`SRV-WEB-01\`, Base de Datos \`DB-PROD-CLUSTER\`, Servicio de Negocio \`Portal de Pagos en Línea\`).
4. **Construcción del Grafo de Dependencias:**
   - En la pestaña de relaciones, vincula: *\`Portal de Pagos en Línea\` DEPENDE_DE \`SRV-WEB-01\`* y *\`SRV-WEB-01\` CONECTA_CON \`DB-PROD-CLUSTER\`*.
   - El motor de FlowDesk dibuja el mapa topológico interactivo.
   - Si un técnico reporta un incidente en la base de datos, el sistema informa de inmediato que el *Portal de Pagos* está en riesgo directo de degradación.

---

### 3.9. Perfil 9: Gestor de Problemas y KEDB (Problem & Known Error Manager)

#### Misión y Propósito
El Gestor de Problemas persigue la causa raíz de las interrupciones operativas. A diferencia del técnico —que busca restaurar el servicio en el menor tiempo posible aunque sea mediante parches provisionales—, el Gestor de Problemas analiza por qué ocurrió el fallo, identifica fallas de diseño o defectos estructurales y busca la erradicación permanente de los incidentes recurrentes.

#### Acceso y Navegación
- **Ruta de Entrada Canónica:** \`/plataforma/operacion/paneles/gestor-problemas\`.
- **Opciones de Menú Disponibles:**
  - *Mi trabajo:* Panel del gestor de problemas, Candidatos a problema pendientes de clasificación, Investigaciones en curso.
  - *Problemas:* Registro maestro de problemas, Base de Errores Conocidos (KEDB), Gestión de Soluciones Temporales (*Workarounds*), Análisis de Causa Raíz (RCA), Solicitudes de Cambio (RFC) derivadas.
  - *Reportes:* Incidentes recurrentes sin causa identificada, Tasa de resolución de problemas, Impacto de la KEDB en el MTTR de la mesa.
  - *Mi cuenta:* Perfil y seguridad.

#### Flujos Operativos Paso a Paso

```text
[Detección de Incidentes Repetitivos / Falla Masiva]
                         │
                         ▼
             [Apertura de Registro de Problema]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   [Análisis Reactivo]              [Análisis Proactivo]
   (Post-Incidente Mayor P1)        (Tendencias en Reportes BI)
                        │
                        ▼
   [Investigación Estructurada de Causa Raíz (RCA)]
        ├── Metodología de los 5 Porqués
        └── Diagrama de Causa y Efecto (Ishikawa)
                        │
                        ▼
   [Publicación de Solución Temporal (Workaround) en KEDB]
   (Permite a los técnicos restaurar casos futuros en minutos)
                        │
                        ▼
   [Solución Definitiva: Genera RFC de infraestructura o software]
                        │
                        ▼
   [Cierre de Problema y Actualización de Estado en la KEDB]
```

##### A. Detección y Creación de Registros de Problema
1. El gestor detecta problemas por dos vías:
   - **Reactiva:** Cuando ocurre un Incidente Mayor P1 (ej. caída total de la red central), al resolverse el ticket, el sistema ofrece crear automáticamente un caso de problema vinculado.
   - **Proactiva:** El gestor revisa el reporte de recurrencia en \`/plataforma/reportes/incidentes-recurrentes\`. Si detecta que 20 usuarios reportaron el mismo fallo de bloqueo en el sistema de facturación durante la semana, agrupa dichos incidentes y abre formalmente un registro de Problema.

##### B. Investigación de Causa Raíz (RCA) Mediante Herramientas Nativas
1. El gestor accede a la vista de análisis del problema (\`/plataforma/problemas/detalle/[id]/rca\`).
2. Utiliza las herramientas metodológicas provistas por la interfaz:
   - **Técnica de los 5 Porqués (*5 Whys*):** Registra de forma encadenada la secuencia de causas que llevaron al fallo hasta alcanzar la falla de raíz humana, lógica o física.
   - **Diagrama de Causa y Efecto (Ishikawa / Espina de Pescado):** Clasifica las hipótesis de fallo en 6 ramas fundamentales: *Método, Mano de Obra (Personal), Máquinas (Hardware), Materiales (Datos), Medición y Medio Ambiente*.

##### C. Documentación y Publicación en la KEDB
1. Una vez identificada la causa y mientras se desarrolla la corrección estructural definitiva:
   - El gestor formula una **Solución Temporal (*Workaround*)**.
   - Redacta los pasos operativos para restaurar el servicio de inmediato cuando el síntoma reaparezca.
   - Marca el registro como **Error Conocido (*Known Error*)** y lo publica en la KEDB corporativa (\`/plataforma/problemas/kedb\`).
   - A partir de este instante, cualquier técnico que atienda un caso similar contará con el botón "Aplicar Workaround de KEDB", reduciendo los tiempos de atención en más de un 70%.

##### D. Erradicación Definitiva y Derivación a Cambios (RFC)
1. Para eliminar la causa raíz de raíz (ej. parchar un bug en el código fuente de un microservicio o sustituir un router con memorias defectuosas), el gestor hace clic en **"Generar Solicitud de Cambio Derivada"**.
2. El sistema precarga una nueva RFC en el módulo de Cambios enlazada al Problema.
3. Cuando el equipo técnico ejecuta exitosamente el cambio y se comprueba la estabilidad del servicio durante 30 días sin recurrencia del fallo, el gestor procede al **Cierre Definitivo del Problema**. Todos los incidentes vinculados pendientes se marcan como completamente resueltos de forma sincronizada.

---

### 3.10. Perfil 10: Administrador del Sistema (System Administrator / ITSM Platform Owner)

#### Misión y Propósito
El Administrador es la máxima autoridad técnica y funcional sobre la plataforma FlowDesk. Es responsable de la gobernanza de la plataforma, la gestión de identidades y accesos (IAM), el diseño visual de formularios y catálogos, la parametrización de las políticas de SLA, el diseño del árbol del menú y la configuración de las reglas de seguridad perimetral.

#### Acceso y Navegación
- **Ruta de Entrada Canónica:** \`/plataforma/operacion/paneles/administrador\`.
- **Régimen de Operación:** Configura y gobierna, pero según las reglas SoD **no atiende tickets operativos, no vota en comités CAB ni aprueba solicitudes departamentales**.
- **Opciones de Menú Disponibles:**
  - *Mi trabajo:* Panel maestro de administración, Métricas globales de salud del sistema, Alertas de infraestructura.
  - *Mesa de Servicio:* Diseñador de Formularios de Incidentes y Solicitudes, Gestión de Categorías del Catálogo, Flujo de Estados y Transiciones de Tickets.
  - *Cambios:* Plantillas y Tipos de RFC, Políticas de Notificación de Cambios.
  - *Problemas:* Plantillas de RCA, Parámetros de la KEDB.
  - *Catálogo de Servicios:* Diseñador del Catálogo, Políticas de SLA (Horas hábiles, Feriados nacionales).
  - *Organización:* Sedes, Departamentos de la empresa, Grupos Resolutores de TI, Asignación de Supervisores.
  - *Plataforma:*
    - *Identidades:* Gestión de Usuarios, Asignación de Perfiles RBAC, Desbloqueo de cuentas.
    - *Navegación:* Diseñador del Árbol del Menú (\`opciones_menu\`), Matriz de Visibilidad por Perfil (\`opciones_menu_perfiles\`).
    - *Seguridad:* Parámetros de Sesión JWT, Políticas de Fuerza Bruta y Rate Limiting, Verificación de CAPTCHA.
    - *Auditoría:* Monitor de Eventos Forenses, Políticas de Retención y Purga de Datos.
  - *Mi cuenta:* Perfil y seguridad de administrador.

#### Flujos Operativos Paso a Paso

```text
[Gobierno y Configuración de la Suite]
                     │
      ├── 1. Diseñador de Menús: Asigna qué pantallas ve cada rol (opciones_menu_perfiles)
      │
      ├── 2. Diseñador de Formularios: Crea campos dinámicos validados con Zod
      │
      ├── 3. Calendario y SLAs: Configura feriados y umbrales de horas hábiles
      │
      ├── 4. Gestión de Identidades (IAM): Crea usuarios y asigna perfiles RBAC
      │
      └── 5. Monitoreo de Seguridad: Revisa intentos fallidos y logs de auditoría
```

##### A. Diseñador del Catálogo de Servicios y Acuerdos de Nivel de Servicio (SLA)
1. El administrador accede a \`/plataforma/servicios/gestion\`.
2. Para cada servicio del catálogo (ej. "Aprovisionamiento de Servidor Cloud"):
   - Establece la categoría jerárquica a la que pertenece.
   - Define el tiempo máximo comprometido para la **Primera Respuesta** (ej. 2 horas hábiles) y para la **Resolución Definitiva** (ej. 24 horas hábiles).
   - Asigna el Grupo Resolutor responsable predeterminado (ej. "Equipo de Infraestructura y Redes").
   - Define si el servicio exige aprobación previa obligatoria de la jefatura de área.
3. En \`/plataforma/admin/sla/calendario\`, actualiza la lista oficial de feriados nacionales e institucionales del año en curso.

##### B. Diseñador Visual de Formularios Dinámicos con Esquema Zod
1. Cuando un nuevo proceso requiere campos especiales que no existen en el formulario básico de tickets (ej. un campo para seleccionar "Tamaño de RAM en GB" o "Tipo de Base de Datos"):
2. El administrador accede al configurador de formularios en \`/plataforma/admin/procesos/formularios\`.
3. Arrastra y suelta nuevos campos indicando: nombre de variable, etiqueta visible, tipo de dato (texto, numérico, selección desplegable, casilla de verificación, fecha, archivo adjunto) y si es obligatorio.
4. El backend traduce esta configuración en una especificación JSON de esquema y genera dinámicamente un validador en tiempo de ejecución sustentado en la librería Zod, previniendo que peticiones manipuladas ingresen datos corruptos a la base relacional.

##### C. Administración del Menú y Matriz de Visibilidad RBAC
1. Toda pantalla en FlowDesk está gobernada por el catálogo único \`opciones_menu\`.
2. El administrador accede a \`/plataforma/admin/menu\` (alias público \`/admin/menu\`).
3. Puede crear nuevas opciones, editar títulos, reorganizar el orden numérico de despliegue, mover pantallas entre carpetas o activar/desactivar opciones completas.
4. En la **Matriz de Visibilidad N:M**, marca o desmarca casillas para conceder o revocar el acceso a una pantalla para cualquiera de los 10 perfiles oficiales, impactando instantáneamente la barra lateral de navegación (*sidebar*) y las guardas de autorización del servidor (\`page-auth.ts\`).

##### D. Auditoría de Seguridad, Fuerza Bruta y Gestión de Accesos
1. Accede al monitor de seguridad en \`/plataforma/admin/seguridad\`.
2. Monitorea los intentos fallidos de inicio de sesión. Si una dirección IP o cuenta acumula más de 3 a 5 intentos fallidos consecutivos, el sistema activa automáticamente el desafío visual de CAPTCHA matemático y/o procede al bloqueo temporal de la cuenta según la regla **RN-01**.
3. El administrador puede desbloquear la cuenta previa validación de la identidad del usuario o forzar la expiración inmediata de la contraseña para exigir un cambio obligatorio en el siguiente inicio de sesión.

---

## 4. Análisis Detallado de los 17 Módulos de Dominio del Sistema

FlowDesk ITSM se estructura bajo una arquitectura **Vertical Slice** compuesta por 17 módulos de dominio independientes. Cada módulo encapsula su lógica de negocio, controladores HTTP, servicios de persistencia, vistas de cliente y contratos públicos.

```text
src/modules/
├── activos/          # Gestión de Activos de Hardware (HAM) y Software (SAM)
├── cambios/          # Gestión de Solicitudes de Cambio (RFC), CAB y Calendario
├── cmdb/             # Elementos de Configuración (CIs) y Grafo Topológico
├── conocimiento/     # Base de Conocimiento Corporativo y Publicaciones KCS
├── identidades/      # Usuarios, Autenticación, Roles y Credenciales
├── incidentes/       # Restauración de Interrupciones y Clasificación de Fallas
├── notificaciones/   # Motor de Avisos en Pantalla y Notificaciones por Correo
├── operacion/        # Paneles de Control Unificados, Turnos y Monitoreo
├── organizacion/     # Sedes, Departamentos, Centros de Costos y Grupos
├── plataforma/       # Shell Global, Navegación, Preferencias y Layouts
├── problemas/        # Análisis de Causa Raíz (RCA), Ishikawa y KEDB
├── proveedores/      # Gestión de Terceros, Contratos y Acuerdos UC
├── reportes/         # BI Operativo, Métricas de Desempeño y Exportación
├── seguridad/        # Sesiones JWT, Rate Limiting, Bloqueo y Auditoría Forense
├── servicios/        # Catálogo de Servicios y Acuerdos de Nivel de Servicio (SLA)
├── solicitudes/      # Gestión de Requerimientos y Flujos de Aprobación
└── tickets/          # Entidad Transaccional Central, Máquina de Estados y SLA
```

A continuación se describe la responsabilidad, estructura y tablas de cada módulo:

---

### 4.1. Módulo: \`tickets\` (Motor Central Transaccional)
- **Dueño del Módulo:** Miguel (Tech Lead).
- **Misión Operativa:** Es el núcleo transaccional congelado y más crítico de la plataforma. Gestiona la tabla maestra \`ticket\`, los estados de ciclo de vida comunes, el motor de cálculo de prioridad ITIL (Impacto × Urgencia), la bandeja de entrada unificada, el visualizador detallado con stepper y el hilo de bitácora que separa notas de trabajo técnicas privadas de comentarios públicos para el usuario.
- **Estructura Interna:**
  - \`api/\`: \`ticketsController.ts\`, \`ticketDetalleController.ts\`, \`ticketComentariosController.ts\`, \`catalogosController.ts\`.
  - \`services/\`: \`ticketService.ts\`, \`ticketDetalleService.ts\`, \`ticketComentarioService.ts\`, \`prioridadService.ts\`.
  - \`views/\`: \`VistaTicketsLista.tsx\`, \`VistaTicketsDetalle.tsx\`, \`VistaTicketsCrear.tsx\`.
  - \`components/\`: \`TablaTickets.tsx\`, \`StepperTicket.tsx\`, \`BitacoraComentarios.tsx\`, \`BadgeEstadoTicket.tsx\`, \`FiltrosTickets.tsx\`.
- **Contratos:**
  - Servidor (\`index.ts\`): \`listarTickets\`, \`crearTicket\`, \`obtenerDetalleTicket\`, \`actualizarTicket\`, \`calcularPrioridadITIL\`, \`ticketsGet\`, \`ticketsPost\`.
  - Cliente (\`ui.ts\`): \`TablaTickets\`, \`StepperTicket\`, \`BadgeEstadoTicket\`.
- **Tablas Relacionales:** \`ticket\`, \`ticket_comentario\`, \`ticket_adjunto\`, \`ticket_historial_estado\`.

---

### 4.2. Módulo: \`incidentes\` (Gestión de Incidentes y Restauración)
- **Dueño del Módulo:** Miguel.
- **Misión Operativa:** Manejo integral de interrupciones no planificadas o degradaciones de servicios según ITIL 4. Especializa el ticket base mediante el Modelo Relacional C en la tabla \`ticket_incidente\`. Gestiona la declaración de Incidentes Mayores P1, la activación de la Sala de Crisis y los enlaces con problemas conocidos en la KEDB.
- **Estructura Interna:** Controladores de bandeja de incidentes, catálogo de fallas comunes, vistas de sala de crisis y configuración de formularios de captura de incidentes.
- **Contratos:**
  - Servidor (\`index.ts\`): Servicios de creación y resolución de incidentes, clasificación de severidad y enlace con KEDB.
  - Cliente (\`ui.ts\`): Componentes de alerta de incidentes mayores y formularios de captura.
- **Tablas Relacionales:** \`ticket_incidente\`, \`incidente_categoria\`, \`incidente_mayor_sala\`.

---

### 4.3. Módulo: \`solicitudes\` (Gestión de Solicitudes y Aprobaciones)
- **Dueño del Módulo:** Miguel.
- **Misión Operativa:** Gestión de peticiones formales de usuarios que no representan una falla (adquisiciones, aprovisionamiento de accesos, nuevas cuentas, cambios de permisos). Especializa el ticket en la tabla \`ticket_solicitud\`. Implementa el flujo de validación previa por el Gestor de Área y la entrega de recursos.
- **Estructura Interna:** Controladores de bandeja de solicitudes, servicios de integración con formularios dinámicos y vistas de seguimiento de aprobaciones.
- **Contratos:**
  - Servidor (\`index.ts\`): Servicios de procesamiento de solicitudes, verificación de requisitos y orquestación de aprobaciones.
  - Cliente (\`ui.ts\`): Formularios de captura de solicitudes y componentes de estado de aprobación.
- **Tablas Relacionales:** \`ticket_solicitud\`, \`solicitud_aprobacion\`, \`solicitud_item_catalogo\`.

---

### 4.4. Módulo: \`servicios\` (Catálogo y Acuerdos de Nivel de Servicio - SLA)
- **Dueño del Módulo:** Lourdes.
- **Misión Operativa:** Custodia del Catálogo Corporativo de Servicios (público para solicitantes y operativo para técnicos). Administra las categorías de servicios, los acuerdos SLA formalmente pactados (tiempos de respuesta y resolución en horas hábiles), y la parametrización de calendarios laborales.
- **Estructura Interna:** \`services/serviciosService.ts\`, \`services/categoriasService.ts\`, \`services/slaService.ts\`, vistas de catálogo interactivo en acordeón y configurador administrativo.
- **Contratos:**
  - Servidor (\`index.ts\`): \`obtenerCatalogoPublico\`, \`obtenerServicioPorId\`, \`calcularMetaSla\`, \`serviciosGet\`.
  - Cliente (\`ui.ts\`): \`CatalogoAcordeon\`, \`SelectorServicio\`, \`TarjetaServicio\`.
- **Tablas Relacionales:** \`servicio\`, \`servicio_categoria\`, \`politica_sla\`, \`calendario_feriados\`.

---

### 4.5. Módulo: \`activos\` (Hardware HAM y Software SAM)
- **Dueño del Módulo:** Lourdes.
- **Misión Operativa:** Gestión patrimonial del ciclo de vida de los activos tecnológicos de hardware (HAM) y licencias de software (SAM) según ISO 19770. Controla el inventario físico, asignación a empleados custodios, compras, garantías oficiales, mantenimiento preventivo, desincorporación de bajas y semáforo de cumplimiento de licenciamiento.
- **Estructura Interna:** \`services/activosService.ts\`, \`services/licenciasService.ts\`, \`services/bajasService.ts\`, vistas de inventario patrimonial, tarjetas de equipo y actas digitales de entrega y baja.
- **Contratos:**
  - Servidor (\`index.ts\`): \`listarActivos\`, \`crearActivoHardware\`, \`asignarCustodio\`, \`verificarLicenciasSoftware\`.
  - Cliente (\`ui.ts\`): \`TablaActivos\`, \`SemaforoLicencias\`, \`SelectorActivo\`.
- **Tablas Relacionales:** \`activo_hardware\`, \`activo_software\`, \`activo_licencia\`, \`activo_asignacion\`, \`activo_mantenimiento\`, \`activo_baja\`.

---

### 4.6. Módulo: \`cambios\` (Gestión de Cambios ITIL 4 y CAB)
- **Dueño del Módulo:** Nain.
- **Misión Operativa:** Control estricto de todas las modificaciones en la infraestructura de producción mediante Solicitudes de Cambio (RFC). Clasifica cambios en Estándar, Normal y Emergencia. Administra la votación colegiada del comité CAB/ECAB con autoexclusión SoD, el Calendario hacia Adelante (FSC), la detección de colisiones en ventanas de mantenimiento, períodos de congelamiento (*freeze*) y revisiones PIR.
- **Estructura Interna:** \`services/cambiosService.ts\`, \`services/cabService.ts\`, \`services/calendarioCambiosService.ts\`, \`services/pirService.ts\`, vistas de calendario interactivo y actas de votación.
- **Contratos:**
  - Servidor (\`index.ts\`): \`crearRfc\`, \`evaluarVotoCab\`, \`programarCambio\`, \`cerrarCambioConPir\`.
  - Cliente (\`ui.ts\`): \`CalendarioFsc\`, \`PanelVotacionCab\`, \`BadgeTipoCambio\`.
- **Tablas Relacionales:** \`cambio_rfc\`, \`cambio_votacion_cab\`, \`cambio_ventana_mantenimiento\`, \`cambio_periodo_freeze\`, \`cambio_revision_pir\`.

---

### 4.7. Módulo: \`cmdb\` (Base de Datos de Configuración del Servicio)
- **Dueño del Módulo:** Nain.
- **Misión Operativa:** Mapeo de la topología técnica y servicios de TI mediante Elementos de Configuración (CIs) y sus interdependencias. Permite evaluar de forma visual y programática el impacto en cascada de fallas o cambios sobre la infraestructura, implementando consultas SQL recursivas con corte de ciclos para garantizar la resiliencia del grafo.
- **Estructura Interna:** \`services/cmdbService.ts\`, \`services/cmdbAnalisisService.ts\`, \`services/cmdbRelacionesService.ts\`, vistas del mapa topológico y matrices de impacto.
- **Contratos:**
  - Servidor (\`index.ts\`): \`obtenerTopologia\`, \`analizarImpactoCi\`, \`crearRelacionCmdb\`, \`eliminarRelacionCmdb\`.
  - Cliente (\`ui.ts\`): \`MapaTopologiaCi\`, \`SelectorCi\`, \`VisualizadorImpacto\`.
- **Tablas Relacionales:** \`elemento_configuracion\`, \`ci_relacion\`, \`ci_tipo\`, \`ci_linea_base\`.

---

### 4.8. Módulo: \`problemas\` (Gestión de Problemas y KEDB)
- **Dueño del Módulo:** Alexis / Darhien.
- **Misión Operativa:** Identificación y gestión de las causas subyacentes de los incidentes. Provee herramientas integradas para Análisis de Causa Raíz (RCA) mediante las metodologías de los 5 Porqués y Diagrama de Ishikawa. Custodia la Base de Errores Conocidos (KEDB) y las soluciones temporales (*Workarounds*) para acelerar el restablecimiento del servicio.
- **Estructura Interna:** \`services/problemasService.ts\`, \`services/rcaService.ts\`, \`services/kedbService.ts\`, vistas de investigación de problemas y diagramas de Ishikawa.
- **Contratos:**
  - Servidor (\`index.ts\`): \`crearProblema\`, \`registrarRca\`, \`publicarErrorConocido\`, \`vincularIncidentesAProblema\`.
  - Cliente (\`ui.ts\`): \`BuscadorKedb\`, \`DiagramaIshikawa\`, \`FormularioCincoPorques\`.
- **Tablas Relacionales:** \`problema\`, \`problema_rca\`, \`problema_error_conocido_kedb\`, \`problema_incidente_relacion\`.

---

### 4.9. Módulo: \`conocimiento\` (Base de Conocimiento y KCS)
- **Dueño del Módulo:** Alexis / Darhien.
- **Misión Operativa:** Gestión del capital intelectual técnico de la empresa siguiendo las mejores prácticas de KCS (*Knowledge-Centered Service*). Administra el ciclo de vida editorial de artículos (Borrador -> Revisión -> Aprobado -> Publicado -> Obsoleto), el motor de búsqueda indexada, el control de versiones y las métricas de utilidad y valoración emitidas por los usuarios.
- **Estructura Interna:** \`services/conocimientoService.ts\`, \`services/editorialService.ts\`, vistas de centro de ayuda de autoservicio y editor enriquecido de artículos.
- **Contratos:**
  - Servidor (\`index.ts\`): \`buscarArticulos\`, \`crearArticulo\`, \`aprobarArticulo\`, \`calificarArticulo\`.
  - Cliente (\`ui.ts\`): \`BuscadorConocimiento\`, \`VisorArticulo\`, \`BotonesUtilidadArticulo\`.
- **Tablas Relacionales:** \`articulo_conocimiento\`, \`articulo_categoria\`, \`articulo_valoracion\`, \`articulo_historial_version\`.

---

### 4.10. Módulo: \`seguridad\` (Autenticación, JWT, Rate Limit y Auditoría)
- **Dueño del Módulo:** Junior.
- **Misión Operativa:** Núcleo de ciberseguridad perimetral y gobernanza de accesos en estricto cumplimiento con ISO/IEC 27001. Gestiona la autenticación con cookies HTTP-only, tokens JWT deslizantes con renovación automática, protección contra ataques de fuerza bruta mediante bloqueo temporal progresivo, generación y validación de CAPTCHAs matemáticos SVG y registro forense inmutable de eventos en la tabla \`auditoria_sistema\`.
- **Estructura Interna:** \`services/authService.ts\`, \`services/auditoriaService.ts\`, \`services/seguridadService.ts\`, vistas de bitácora de auditoría y controles de seguridad.
- **Contratos:**
  - Servidor (\`index.ts\`): \`autenticarUsuario\`, \`verificarSesionJwt\`, \`registrarAuditoria\`, \`verificarCaptchaCriptografico\`.
  - Cliente (\`ui.ts\`): \`ComponenteCaptcha\`, \`BadgeNivelSeguridad\`.
- **Tablas Relacionales:** \`usuario_sesion\`, \`auditoria_sistema\`, \`seguridad_intento_fallido\`, \`seguridad_bloqueo_ip\`.

---

### 4.11. Módulo: \`identidades\` (Usuarios, Roles y RBAC)
- **Dueño del Módulo:** Junior.
- **Misión Operativa:** Administración de Identidades y Control de Acceso (IAM). Centraliza el registro de usuarios corporativos, su pertenencia a departamentos, la asignación de perfiles oficiales RBAC, la administración de contraseñas con hashing criptográfico seguro (Bcrypt), la activación/suspensión de cuentas y la delegación temporal de funciones.
- **Estructura Interna:** \`services/usuariosService.ts\`, \`services/perfilesService.ts\`, vistas de administración de personal y asignación de credenciales.
- **Contratos:**
  - Servidor (\`index.ts\`): \`crearUsuario\`, \`actualizarUsuario\`, \`asignarPerfilRbac\`, \`cambiarEstadoCuenta\`.
  - Cliente (\`ui.ts\`): \`TablaUsuarios\`, \`SelectorPerfil\`, \`TarjetaUsuario\`.
- **Tablas Relacionales:** \`usuario\`, \`perfil\`, \`usuario_perfil\`, \`usuario_delegacion\`.

---

### 4.12. Módulo: \`organizacion\` (Estructura Departamental y Grupos)
- **Dueño del Módulo:** Junior.
- **Misión Operativa:** Modelado de la estructura organizativa de la empresa. Gestiona sedes físicas, departamentos funcionales, centros de costos contables y grupos resolutores de TI (ej. Soporte N1, Redes, Servidores, Base de Datos, Ciberseguridad), estableciendo las relaciones de subordinación y liderazgo.
- **Estructura Interna:** \`services/departamentosService.ts\`, \`services/gruposService.ts\`, \`services/sedesService.ts\`, vistas de organigrama y asignación de técnicos a cuadrillas.
- **Contratos:**
  - Servidor (\`index.ts\`): \`listarDepartamentos\`, \`listarGruposResolutores\`, \`obtenerMiembrosGrupo\`.
  - Cliente (\`ui.ts\`): \`SelectorDepartamento\`, \`SelectorGrupoResolutor\`.
- **Tablas Relacionales:** \`departamento\`, \`sede\`, \`centro_costo\`, \`grupo_resolutor\`, \`grupo_resolutor_miembro\`.

---

### 4.13. Módulo: \`proveedores\` (Gestión de Terceros y Contratos UC)
- **Dueño del Módulo:** Junior.
- **Misión Operativa:** Gestión de proveedores tecnológicos externos y contratos de respaldo (*Underpinning Contracts* - UC de ITIL 4). Permite vincular contratos de mantenimiento, garantías de hardware y licencias de software con terceros, controlando los SLAs acordados con los proveedores y sus datos de contacto de escalamiento.
- **Estructura Interna:** \`services/proveedoresService.ts\`, \`services/contratosService.ts\`, vistas de ficha de proveedor y control de contratos vigentes.
- **Contratos:**
  - Servidor (\`index.ts\`): \`listarProveedores\`, \`crearProveedor\`, \`vincularContratoProveedor\`.
  - Cliente (\`ui.ts\`): \`TablaProveedores\`, \`SelectorProveedor\`.
- **Tablas Relacionales:** \`proveedor\`, \`proveedor_contrato\`, \`proveedor_contacto_escalamiento\`.

---

### 4.14. Módulo: \`reportes\` (BI Operativo y Analítica Gerencial)
- **Dueño del Módulo:** Miguel.
- **Misión Operativa:** Centralización de las 9 rutas canónicas de inteligencia operativa del sistema. Genera estadísticas en tiempo real, distribuciones de tickets por categoría, cumplimiento de SLAs, cálculo de MTTR/MTTA, productividad por técnico y tableros ejecutivos para la toma de decisiones, con capacidades de exportación de datos.
- **Estructura Interna:** \`services/reportesService.ts\`, \`services/metricasSlaService.ts\`, vistas de gráficos con barras y líneas de tendencia, y exportadores tabulares.
- **Contratos:**
  - Servidor (\`index.ts\`): \`obtenerMetricasGenerales\`, \`obtenerReporteSla\`, \`obtenerProductividadTecnicos\`.
  - Cliente (\`ui.ts\`): \`GraficoCumplimientoSla\`, \`TablaMetricasOperativas\`, \`BotonExportarReporte\`.
- **Tablas Relacionales:** Consume vistas analíticas y tablas de auditoría (\`vista_ticket\`, \`ticket\`, \`auditoria_sistema\`).

---

### 4.15. Módulo: \`operacion\` (Consolas Unificadas y Turnos)
- **Dueño del Módulo:** Miguel.
- **Misión Operativa:** Aloja los paneles unificados de control de los 10 perfiles bajo la ruta \`/plataforma/operacion/paneles/<rol>\`. Administra la supervisión de turnos de la mesa de ayuda, disponibilidades de los técnicos, relevos de guardia y monitoreo de resiliencia del servicio.
- **Estructura Interna:** \`views/paneles/\` con las 10 consolas de rol, servicios de turnos y componentes de alarma operativa.
- **Contratos:**
  - Servidor (\`index.ts\`): \`obtenerResumenPanelRol\`, \`registrarRelevoTurno\`.
  - Cliente (\`ui.ts\`): \`WidgetResumenOperativo\`, \`MonitorAlertasTempranas\`.
- **Tablas Relacionales:** \`operacion_turno\`, \`operacion_relevo\`, \`operacion_alerta\`.

---

### 4.16. Módulo: \`plataforma\` (Shell, Navegación y Preferencias)
- **Dueño del Módulo:** Miguel.
- **Misión Operativa:** Shell visual global de la aplicación. Provee el Sidebar dinámico alimentado por base de datos (\`opciones_menu\`), el Navbar con notificaciones y cambio de tema, la gestión de preferencias personales del usuario y las guardas de autorización de páginas en el cliente.
- **Estructura Interna:** \`components/Sidebar.tsx\`, \`components/Navbar.tsx\`, \`components/LayoutPlataforma.tsx\`, servicios de menú dinámico.
- **Contratos:**
  - Servidor (\`index.ts\`): \`construirArbolMenuParaUsuario\`, \`obtenerOpcionesMenuActivas\`.
  - Cliente (\`ui.ts\`): \`Sidebar\`, \`Navbar\`, \`LayoutPlataforma\`.
- **Tablas Relacionales:** \`opciones_menu\`, \`opciones_menu_perfiles\`, \`usuario_preferencia\`.

---

### 4.17. Módulo: \`notificaciones\` (Motor de Avisos In-App y Correo)
- **Dueño del Módulo:** Miguel.
- **Misión Operativa:** Despacho automatizado de alertas ante eventos del ciclo de vida de los tickets y cambios. Administra las notificaciones en pantalla tipo campana (*In-App bell*) y el envío asíncrono de correos electrónicos transaccionales estructurados con plantillas HTML limpias.
- **Estructura Interna:** \`services/notificacionesService.ts\`, \`services/emailService.ts\`, \`components/CampanaNotificaciones.tsx\`.
- **Contratos:**
  - Servidor (\`index.ts\`): \`despacharNotificacion\`, \`marcarNotificacionLeida\`, \`enviarCorreoTransaccional\`.
  - Cliente (\`ui.ts\`): \`CampanaNotificaciones\`, \`ListaNotificacionesFlotante\`.
- **Tablas Relacionales:** \`notificacion\`, \`notificacion_plantilla\`, \`notificacion_registro_envio\`.

---

## 5. Mecanismos y Motores Internos de la Plataforma

### 5.1. Motor Dinámico de SLA en Horario Hábil con Exclusión de Feriados

El cómputo de los Acuerdos de Nivel de Servicio en FlowDesk se rige por la regla de negocio **RN-10** y se encuentra implementado con precisión de milisegundos en \`src/shared/lib/sla.ts\`.

#### Parámetros Institucionales:
- **Jornada Hábil Oficial:** Lunes a Viernes de 08:00:00 a 18:00:00 (10 horas hábiles netas por jornada laboral).
- **Días Inhábiles:** Sábados y Domingos completos.
- **Exclusión de Feriados:** El motor descuenta automáticamente los feriados nacionales e institucionales registrados en la tabla \`calendario_feriados\` (ej. 1 de Enero, 1 de Mayo, 28 y 29 de Julio, 25 de Diciembre). Cuenta con una caché en memoria con un tiempo de vida (TTL) de 10 minutos para optimizar las consultas repetitivas.

#### Algoritmo de Adición de Horas Hábiles (\`sumarHorasHabiles\`):
Dado un instante de inicio $T_0$ y un plazo objetivo de $H$ horas:
1. Si $T_0$ ocurre antes del inicio de la jornada (antes de las 08:00), se adelanta a las 08:00 del mismo día si es hábil.
2. Si $T_0$ ocurre después del fin de la jornada (después de las 18:00) o en un día inhábil/feriado, se avanza secuencialmente hasta las 08:00 del siguiente día hábil oficial.
3. Se calcula el tiempo hábil disponible en el día en curso:
   $$\Delta t_{\text{disponible}} = \min(18:00 - T_{\text{actual}}, H_{\text{restante}})$$
4. Se descuenta $\Delta t_{\text{disponible}}$ del saldo pendiente de $H$. Si el saldo llega a cero, la fecha límite calculada es $T_{\text{actual}} + \Delta t_{\text{disponible}}$.
5. Si el saldo sigue siendo mayor a cero, se salta al siguiente día hábil a las 08:00 y se itera hasta consumir la totalidad del tiempo pactado.

#### Pausa Automática del Cronómetro:
Cuando un ticket pasa a estado \`en_espera\`, el sistema registra la marca temporal de inicio de pausa (\`sla_pausa_inicio\`). Al reactivarse a \`en_progreso\`, el lapso transcurrido en horas hábiles durante la pausa se añade al vencimiento original, garantizando una medición justa e inobjetable.

---

### 5.2. Motor de Formularios Dinámicos con Esquema Zod en Runtime

Para permitir que la plataforma incorpore nuevos servicios sin requerir migraciones complejas en la base de datos:
1. Las especificaciones de los campos se almacenan como esquemas JSON en la tabla \`servicio\`.
2. Al renderizar la pantalla, el componente \`FormularioDinamico\` genera los inputs visuales correspondientes.
3. Al recibir la petición HTTP en el backend, la función validadora construye un esquema dinámico mediante la librería **Zod**:
   - Campos de texto se transforman en \`z.string().min(1).max(500)\`.
   - Campos numéricos se validan con límites superior e inferior \`z.number()\`.
   - Campos desplegables se validan contra los valores permitidos del catálogo \`z.enum([...])\`.
4. Si la carga útil (*payload*) no cumple la estructura, el servidor rechaza la transacción con código HTTP 400 y una descripción exacta del campo erróneo, protegiendo la base de datos contra inyecciones o datos truncados.

---

### 5.3. Grafo Topológico CMDB con Consulta Recursiva Anti-Ciclos (DFS)

El mapeo de dependencias de la CMDB en \`src/modules/cmdb/services/cmdbAnalisisService.ts\` utiliza consultas avanzadas con Expresiones de Tabla Común Recursivas (**Recursive CTE**) sobre PostgreSQL:

```sql
WITH RECURSIVE descendientes AS (
    SELECT cr.id_ci_hijo AS id_ci, 1 AS nivel
    FROM ci_relacion cr WHERE cr.id_ci_padre = $1
    UNION
    SELECT cr.id_ci_hijo, d.nivel + 1
    FROM ci_relacion cr JOIN descendientes d ON cr.id_ci_padre = d.id_ci
    WHERE d.nivel < $2
),
ascendientes AS (
    SELECT cr.id_ci_padre AS id_ci, 1 AS nivel
    FROM ci_relacion cr WHERE cr.id_ci_hijo = $1
    UNION
    SELECT cr.id_ci_padre, a.nivel + 1
    FROM ci_relacion cr JOIN ascendientes a ON cr.id_ci_hijo = a.id_ci
    WHERE a.nivel < $2
)
```

#### Mecanismos de Protección:
- **Uso estricto de \`UNION\` (en lugar de \`UNION ALL\`):** Elimina registros duplicados en cada iteración del grafo, previniendo bucles infinitos si dos elementos presentan relaciones bidireccionales.
- **Profundidad Acotada (\`WHERE d.nivel < $2\`):** Limita la recursión a una profundidad máxima configurable (por defecto 2 o 3 niveles), protegiendo la CPU del servidor contra sobrecargas.
- **Restricción de Integridad:** Se prohíbe que un CI se relacione consigo mismo mediante una validación de dominio (\`id_ci_padre !== id_ci_hijo\`).

---

### 5.4. Motor de Segregación de Funciones (SoD) y Matriz de Aprobaciones

La gobernanza de FlowDesk implementa reglas programáticas para prevenir fraudes operativos y conflictos de interés:
1. **Regla de Autoexclusión del Solicitante:** Si \`ticket.id_solicitante === usuario_sesion.id_usuario\`, el endpoint de aprobación bloquea la petición con error 403 (*"Un usuario no puede dictaminar su propia solicitud"*).
2. **Regla de Autoexclusión en Cambios CAB:** Si el usuario figura como solicitante o implementador en \`cambio_rfc\`, su ID se excluye de la lista de miembros votantes autorizados para esa RFC en particular.
3. **Inmutabilidad del Auditor:** Cualquier intento de enviar una mutación de datos con un token cuyo perfil sea \`Auditor\` es interceptado a nivel de middleware y rechazado antes de alcanzar el controlador.

---

### 5.5. Motor Perimetral de Ciberseguridad: JWT, Rate Limit y CAPTCHA SVG

Implementado en \`src/shared/lib/security.ts\` y \`src/shared/lib/auth.ts\`:
- **Sesión Deslizante (*Sliding Session*):** La sesión del usuario se empaqueta en un token JWT firmado criptográficamente con HMAC-SHA256, almacenado en una cookie \`HttpOnly\`, \`Secure\`, \`SameSite=Lax\`. Cada interacción válida dentro del umbral de actividad renueva la vigencia de la cookie de forma transparente.
- **Defensa Anti-Fuerza Bruta:** Tras 3 intentos fallidos consecutivos de inicio de sesión desde una misma IP o cuenta, la plataforma exige resolver obligatoriamente un desafío de seguridad CAPTCHA. Si los intentos fallidos alcanzan 5, la cuenta queda temporalmente suspendida durante 15 minutos, asentando el evento en \`seguridad_intento_fallido\`.
- **Generador Criptográfico de CAPTCHA en SVG:**
  - El servidor genera un código alfanumérico aleatorio de 5 caracteres excluyendo caracteres ambiguos (sin 0, O, 1, I, L).
  - Produce una imagen vectorial SVG con rotaciones aleatorias de caracteres (-15° a +15°), colores aleatorios y múltiples líneas y puntos de interferencia visual (*ruido gaussiano*).
  - Firma el código con HMAC-SHA256 y un tiempo de expiración de 3 minutos, devolviendo el SVG y el token firmado. El cliente no puede descifrar el código sin el secreto del servidor.
  - La verificación utiliza comparación en tiempo constante (\`crypto.timingSafeEqual\`) para prevenir ataques de canal lateral (*timing attacks*).

---

### 5.6. Sistema de Auditoría y Trazabilidad Forense Inmutable

Cada acción que altera el estado de la base de datos ejecuta la función \`registrarAuditoria\` que inserta un registro en la tabla \`auditoria_sistema\`:
- \`id_auditoria\`: Clave primaria secuencial autoincremental.
- \`fecha_hora\`: Timestamp con zona horaria generado por el motor de base de datos (\`CURRENT_TIMESTAMP\`).
- \`id_usuario\`: Usuario que ejecutó la operación (o \`NULL\` si fue un proceso del sistema).
- \`ip_origen\`: Dirección IP extraída de las cabeceras HTTP seguras (\`x-forwarded-for\` o \`remoteAddress\`).
- \`modulo\`: Módulo de procedencia (ej. \`cambios\`, \`seguridad\`, \`activos\`).
- \`accion\`: Verbo de acción (\`CREAR\`, \`ACTUALIZAR\`, \`ELIMINAR\`, \`APROBAR\`, \`RECHAZAR\`).
- \`detalles\`: Campo de tipo \`JSONB\` que almacena el identificador del registro afectado y el *diff* completo entre los valores antiguos y los nuevos.

---

## 6. Arquitectura Técnica, Directorios y Modelo de Datos

### 6.1. Principios de Vertical Slice Architecture y Aislamiento Modular
FlowDesk adopta el patrón de **Rebanadas Verticales por Dominio**. Cada uno de los 17 módulos reside en \`src/modules/<modulo>/\` y funciona como una unidad de entrega autónoma.

#### Reglas de Dependencia:
1. **Contratos Públicos Obligatorios:** Ningún archivo externo puede importar subcarpetas internas de otro módulo. Las únicas importaciones permitidas son hacia la raíz del contrato:
   - Para lógica y servicios de servidor: \`import { ... } from "@/modules/<modulo>"\` (apunta a \`index.ts\`).
   - Para componentes visuales de cliente: \`import { ... } from "@/modules/<modulo>/ui"\` (apunta a \`ui.ts\`).
2. **Regla de Hoja Transversal (\`src/shared/\`):** La carpeta \`src/shared/\` es un nodo terminal estricto. Provee utilidades comunes a toda la aplicación (base de datos, JWT, SLA, errores), pero **JAMÁS importa nada desde \`src/modules/*\` ni desde \`src/app/*\`**.
3. **Cascarones Delgados en \`src/app/\`:** Las páginas en \`src/app/\` no contienen lógica de negocio ni sentencias SQL; simplemente autentican la página con \`exigirMenuPagina\` y renderizan la vista provista por el módulo.

---

### 6.2. Mapa Completo de la Jerarquía de Directorios del Repositorio

```text
SISTEMA DE TICKETS/
├── src/                                  # Código fuente de la plataforma
│   ├── app/                              # Rutas del App Router de Next.js 14
│   │   ├── (public)/                     # Rutas públicas sin autenticación
│   │   │   ├── login/                    # Pantalla de inicio de sesión
│   │   │   └── recuperar-clave/          # Flujo de recuperación de credenciales
│   │   ├── api/                          # 209 Route Handlers (Endpoints REST)
│   │   │   ├── admin/                    # Endpoints administrativos
│   │   │   ├── auth/                     # Endpoints de login, logout y captcha
│   │   │   ├── cambios/                  # Endpoints del módulo de cambios y CAB
│   │   │   ├── cmdb/                     # Endpoints de CIs y relaciones
│   │   │   ├── incidentes/               # Endpoints especializados de incidentes
│   │   │   ├── solicitudes/              # Endpoints especializados de solicitudes
│   │   │   ├── tickets/                  # Endpoints del núcleo de tickets
│   │   │   └── ...                       # Endpoints del resto de dominios
│   │   ├── plataforma/                   # 312 Páginas operativas autenticadas
│   │   │   ├── admin/                    # Pantallas de gobernanza y configuración
│   │   │   ├── cambios/                  # Pantallas de gestión de cambios y calendario
│   │   │   ├── cmdb/                     # Pantallas de inventario CI y topología
│   │   │   ├── conocimiento/             # Pantallas de base de conocimiento
│   │   │   ├── incidentes/               # Pantallas especializadas de incidentes
│   │   │   ├── solicitudes/              # Pantallas especializadas de solicitudes
│   │   │   ├── operacion/paneles/        # Los 10 paneles de rol unificados
│   │   │   └── ...                       # Pantallas del resto de módulos
│   │   ├── layout.tsx                    # Layout raíz HTML y proveedores de tema
│   │   ├── not-found.tsx                 # Manejador amigable 404
│   │   └── globals.css                   # Variables CSS y estilos base Tailwind
│   ├── modules/                          # Los 17 Módulos Vertical Slice
│   │   ├── activos/                      # (94 archivos TS/TSX - Lourdes)
│   │   ├── cambios/                      # (134 archivos TS/TSX - Nain)
│   │   ├── cmdb/                         # (34 archivos TS/TSX - Nain)
│   │   ├── conocimiento/                 # (29 archivos TS/TSX - Alexis / Darhien)
│   │   ├── identidades/                  # (22 archivos TS/TSX - Junior)
│   │   ├── incidentes/                   # (12 archivos TS/TSX - Miguel)
│   │   ├── notificaciones/               # (6 archivos TS/TSX - Miguel)
│   │   ├── operacion/                    # (34 archivos TS/TSX - Miguel)
│   │   ├── organizacion/                 # (32 archivos TS/TSX - Junior)
│   │   ├── plataforma/                   # (29 archivos TS/TSX - Miguel)
│   │   ├── problemas/                    # (94 archivos TS/TSX - Alexis / Darhien)
│   │   ├── proveedores/                  # (6 archivos TS/TSX - Junior)
│   │   ├── reportes/                     # (24 archivos TS/TSX - Miguel)
│   │   ├── seguridad/                    # (36 archivos TS/TSX - Junior)
│   │   ├── servicios/                    # (33 archivos TS/TSX - Lourdes)
│   │   ├── solicitudes/                  # (14 archivos TS/TSX - Miguel)
│   │   └── tickets/                      # (60 archivos TS/TSX - Miguel)
│   ├── shared/                           # Infraestructura transversal (Nodo hoja)
│   │   ├── components/                   # Componentes visuales genéricos
│   │   ├── lib/                          # db.ts, auth.ts, sla.ts, security.ts, menu.ts
│   │   └── types/                        # Tipos globales de TypeScript
│   └── middleware.ts                     # Interceptor perimetral de cookies HTTP
├── db/                                   # Persistencia relacional en PostgreSQL
│   ├── schema.sql                        # DDL maestro inicial
│   ├── seed.sql                          # Datos iniciales canónicos
│   └── migrations/                       # 40 scripts incrementales versionados
├── scripts/                              # Automatizaciones de prueba y verificación
│   └── test_e2e_lifecycle.js             # Suite E2E oficial de 30 pruebas ITIL 4
└── DOCUMENTACIÓN/                        # Suite canónica de documentación técnica
```

---

### 6.3. El Modelo Relacional C en PostgreSQL

FlowDesk adopta el **Modelo Relacional C**, el cual combina la robustez de un esquema relacional fuertemente tipado en tercera forma normal (3NF) con la flexibilidad de campos \`JSONB\` para atributos dinámicos controlados.

```text
                               +----------------------+
                               |       usuario        |
                               +----------------------+
                               | id_usuario (PK)      |
                               | nombre, correo, clave|
                               | id_departamento (FK) |
                               +----------+-----------+
                                          |
                +-------------------------+-------------------------+
                | 1:N                                               | 1:N
                ▼                                                   ▼
+-------------------------------+                   +-------------------------------+
|            ticket             |                   |          cambio_rfc           |
+-------------------------------+                   +-------------------------------+
| id_ticket (PK)                |                   | id_rfc (PK)                   |
| codigo_ticket (UNIQUE)        |                   | codigo_rfc (UNIQUE)           |
| titulo, descripcion           |                   | tipo_cambio (ENUM)            |
| tipo_ticket (ENUM)            |                   | estado (ENUM)                 |
| estado (ENUM)                 |                   | fecha_inicio_programada       |
| prioridad (ENUM)              |                   | id_solicitante (FK)           |
| id_solicitante (FK -> usuario)|                   | id_ci_afectado (FK -> ci)     |
| id_tecnico_asignado (FK)      |                   +---------------+---------------+
| id_servicio (FK -> servicio)  |                                   |
| fecha_creacion, sla_limite    |                                   | 1:N
+---------------+---------------+                                   ▼
                |                                   +-------------------------------+
       +--------+--------+                          |      cambio_votacion_cab      |
   1:1 |             1:1 |                          +-------------------------------+
       ▼                 ▼                          | id_votacion (PK)              |
+--------------+  +--------------+                  | id_rfc (FK -> cambio_rfc)     |
|ticket_incid. |  |ticket_solic. |                  | id_aprobador (FK -> usuario)  |
+--------------+  +--------------+                  | voto, comentario, fecha_voto  |
| id_ticket(PK)|  | id_ticket(PK)|                  +-------------------------------+
| causa_raiz   |  | id_aprobador |
| id_ci_afect. |  | justificacion|
+--------------+  +--------------+
```

#### Ventajas del Modelo C Frente a Esquemas Antiguos:
- **Especialización Limpia 1:1:** La tabla central \`ticket\` almacena los atributos universales de ciclo de vida, trazabilidad, solicitante y SLA. Los atributos específicos de fallas viven en \`ticket_incidente\` y los de requerimientos en \`ticket_solicitud\`, evitando tablas con columnas nulas dispersas.
- **Integridad Referencial Absoluta:** Todas las llaves foráneas declaran cláusulas explícitas \`ON DELETE RESTRICT\` para entidades transaccionales (impidiendo que se elimine un usuario si tiene tickets asociados) y \`ON DELETE CASCADE\` para detalles dependientes (adjuntos, comentarios).
- **Tipos Enumerados Nativos (PostgreSQL ENUM):** Los estados de ciclo de vida y prioridades se restringen a nivel de motor de base de datos mediante tipos enum (\`tipo_ticket_enum\`, \`estado_ticket_enum\`, \`prioridad_ticket_enum\`, \`tipo_cambio_enum\`), imposibilitando estados inconsistentes.

---

### 6.4. Quality Gates y Suite de Pruebas E2E ITIL 4

Para asegurar que ninguna modificación al código introduzca regresiones operativas, FlowDesk implementa tres compuertas de calidad innegociables:
1. **Verificación Estricta de Tipos en TypeScript (\`npx tsc --noEmit\`):** Cero errores permitidos. Todo el código debe compilar con tipado estricto.
2. **Compilación de Producción (\`npm run build\`):** Valida que las 335 páginas del sistema empaqueten limpiamente sin dependencias huérfanas.
3. **Suite Oficial de Pruebas E2E (\`scripts/test_e2e_lifecycle.js\`):** Suite automatizada de **30 pruebas dinámicas** que simula el ciclo de vida completo de extremo a extremo:
   - Autenticación con los distintos roles.
   - Radicación de un incidente técnico con cálculo de prioridad.
   - Creación de solicitud con flujo de aprobación de área.
   - Evaluación y votación en el comité CAB de cambios.
   - Mapeo y análisis de impacto en la CMDB.
   - Cierre con encuesta CSAT.
   - **Resultado Actual:** 30 de 30 pruebas aprobadas exitosamente (100% de efectividad).

---

## 7. Índice y Mapa de Navegación del Paquete Documental Canónico

La documentación integral de FlowDesk ITSM se estructura en un conjunto de documentos canónicos especializados ubicados en la carpeta \`DOCUMENTACIÓN/\`:

| Documento | Enlace Directo | Propósito y Contenido Principal |
| :--- | :--- | :--- |
| **README Raíz del Proyecto** | [README.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/README.md) | Visión ejecutiva, guía de inicio rápido, instalación local y comandos de compilación. |
| **Arquitectura y Código** | [ARQUITECTURA_Y_CODIGO.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/ARQUITECTURA_Y_CODIGO.md) | Guía técnica profunda de la estructura de directorios, contratos de módulos y directivas para desarrolladores e inteligencias artificiales. |
| **Menús, Perfiles y Cobertura** | [MENUS_Y_PERFILES.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/MENUS_Y_PERFILES.md) | Catálogo único de 230 opciones de menú, matriz de visibilidad de los 10 perfiles RBAC y árbol visual colapsado. |
| **Requerimientos y Reglas** | [REQUERIMIENTOS.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/REQUERIMIENTOS.md) | Especificación formal de Requerimientos Funcionales (RF-01 a RF-45), Criterios No Funcionales y Reglas de Negocio (RN-01 a RN-48). |
| **Historias de Usuario** | [HISTORIAS_DE_USUARIO.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/HISTORIAS_DE_USUARIO.md) | 35 historias de usuario estructuradas (Sprint 1, Sprint 2 y Product Backlog) con tarjetas de metadatos y criterios Given-When-Then. |
| **Matriz de Trazabilidad** | [TRAZABILIDAD.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/TRAZABILIDAD.md) | Matriz de impacto y cobertura bidireccional entre funcionalidades, requerimientos, reglas, rutas de pantalla y pruebas. |
| **Plan de Equipo y Scrum** | [PLAN_EQUIPO_Y_SCRUM.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/PLAN_EQUIPO_Y_SCRUM.md) | Metodología ágil del equipo de 5 ingenieros, propiedad balanceada de los 17 módulos y estrategia de ramas en Git. |
| **Catálogo de Servicios y Datos** | [CATALOGO_SERVICIOS_DATOS.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/CATALOGO_SERVICIOS_DATOS.md) | Definición formal de los 30 servicios de referencia (14 solicitudes y 16 incidentes), SLAs y categorías maestras. |
| **Bitácora Daily Scrum** | [BITACORA_DAILY_SCRUM.xlsx](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/BITACORA_DAILY_SCRUM.xlsx) | Libro de cálculo Excel con las respuestas diarias de los 5 integrantes durante los 12 días del Sprint 2 (12/10 al 23/10). |
| **Historias para Trello** | [Historia de Usuario trello.txt](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/Historia%20de%20Usuario%20trello.txt) | Exportación en texto plano de las 35 historias de usuario optimizada para importación ágil en tableros Trello. |
| **Asignaciones Individuales** | [ASIGNACION_MIGUEL.md](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/ASIGNACION_MIGUEL.md) | Especificaciones de alcance y archivos asignados a cada ingeniero ([Miguel](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/ASIGNACION_MIGUEL.md), [Lourdes](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/ASIGNACION_LOURDES.md), [Alexis / Darhien](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/ASIGNACION_ALEXIS.md), [Junior](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/ASIGNACION_JUNIOR.md), [Nain](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/DOCUMENTACI%C3%93N/ASIGNACION_NAIN.md)). |

---

> **Compromiso de Calidad y Mantenimiento:**  
> FlowDesk ITSM es una plataforma en evolución continua. Cada nueva versión funcional o ajuste arquitectónico debe reflejarse sincronizadamente en este tratado y en los documentos normativos correspondientes, preservando la coherencia entre el código fuente, la base relacional y la documentación técnica de clase mundial.
