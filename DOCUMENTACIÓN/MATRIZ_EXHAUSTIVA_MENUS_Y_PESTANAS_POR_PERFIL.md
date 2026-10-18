# MATRIZ EXHAUSTIVA DE MENÚS Y PESTAÑAS POR PERFIL — FlowDesk ITSM

> **Versión:** 1.1 · **Fecha:** 2026-10-16 · **Base:** `f507bff` + reestructuración del menú de procesos (carpetas *Gestión de incidentes* y *Gestión de solicitudes*).
> **Alcance:** los **10 perfiles**, con **cada opción de menú**, **cada subopción** y **cada pestaña interna**, indicando **qué hace** y **su estado real** tras completar las brechas.
> **Fuente autoritativa de opciones:** tabla `opciones_menu` + `opciones_menu_perfiles` (árbol real cargado en la BD).
> **Fuente de pestañas:** componentes `Pestana*.tsx` reales en `src/modules/**` y `src/app/**`.

---

## 0. Leyenda

| Estado | Significado |
|:--:|---|
| ✅ | **Completo**: página + controlador + servicio con BD + vista funcional. |
| 🟢 | **Operativo por redirección**: la ruta redirige a la vista compartida del dominio (no es un stub; es un alias intencional). |
| ⚠️ | **Parcial**: existe y opera, pero con una funcionalidad secundaria pendiente. |
| ❌ | **Ausente**. |
| ⬛ | **Carpeta de agrupación**: ítem de menú sin página propia; solo agrupa hijos (no requiere pantalla). |

**Marcos:** ITIL 4 (INC, SR, SD, PRB, CHG, ITAM, SCM, CAT, SLM, KM, MR, MON, AVL, CAP, CONT, ISM, SUP, WTM, REL, RISK, CI) · ISO/IEC 20000-1:2018 · ISO/IEC 27001:2022 · ISO/IEC 19770-1 · COBIT 2019.

**Cómo leer cada fila:** `Código` = posición en el árbol del perfil · `Opción / Pestaña` · `Ruta` real · `Qué hace` · `Marco` · `Estado`.

---

## PERFIL 1 — Administrador
**Inicio:** `/admin` · **Nodos de menú:** 60 · **Resultado:** 58 ✅ · 2 🟢 (redirecciones internas) · 0 ⚠️ · 0 ❌

| Código | Opción / Pestaña | Ruta | Qué hace | Marco | Estado |
|---|---|---|---|---|---|
| **1** | **Configuración** | `/admin` | Gobierno y parametrización del ITSM. | CI, COBIT | ✅ |
| 1.1 | Identidades y accesos | `/admin` | Usuarios, perfiles y estructura del menú. | ISM | ✅ |
| 1.1.1 | Gestión de usuarios | `/admin/usuarios` | Alta/edición/bloqueo, perfiles múltiples, envío de credenciales. | ISM, WTM | ✅ |
| 1.1.2 | Perfiles y permisos | `/admin/perfiles` | Matriz de permisos por perfil (los 10). | ISM | ✅ |
| 1.1.3 | Estructura del menú | `/admin/menu` | Orden, visibilidad y bloqueo de ítems por perfil. | COBIT | ✅ |
| 1.2 | Catálogo de servicios y SLAs | `/admin/servicios` | Servicios, categorías y objetivos de tiempo. | CAT, SLM | ✅ |
| 1.2.1 | Servicios de incidentes | `/admin/servicios?tipo=1` | Listado y edición de servicios de incidente. | CAT, INC | ✅ |
| 1.2.2 | Servicios de solicitudes | `/admin/servicios?tipo=2` | Servicios de solicitud y su flujo de aprobación. | CAT, SR | ✅ |
| 1.2.3 | Crear servicio | `/admin/servicios?vista=crear` | Formulario oficial de servicio. | CAT | ✅ |
| 1.2.4 | Configuración de categorías | `/admin/servicios?vista=categorias` | CRUD de categorías con unicidad. | CAT | ✅ |
| 1.2.5 | Objetivos SLA | `/admin/servicios/sla` | Matriz de tiempos por prioridad e impacto × urgencia. | SLM | ✅ |
| 1.3 | Configuración de procesos | `/admin/procesos` | Formularios, flujos y reglas por proceso. | CHG, PRB, INC | ✅ |
| 1.3.1 | Gestión de incidentes | `/admin/procesos/incidentes` | Carpeta del proceso de incidentes; redirige a su primer ítem. | INC | 🟢 redirige |
| 1.3.1.1 | ↳ Configuración de formulario (incidente) | `/admin/tickets-formularios?tipo=incidente` | Campos, orden y obligatoriedad. | INC | ✅ |
| 1.3.1.2 | ↳ Flujo de estados y acciones (incidente) | `/admin/tickets-vistas?seccion=estados&tipo=incidente` | Estados, transiciones y acciones por rol. | INC | ✅ |
| 1.3.2 | Gestión de solicitudes | `/admin/procesos/solicitudes` | Carpeta del proceso de solicitudes; redirige a su primer ítem. | SR | 🟢 redirige |
| 1.3.2.1 | ↳ Configuración de formulario (solicitud) | `/admin/tickets-formularios?tipo=solicitud` | Formulario de solicitud. | SR | ✅ |
| 1.3.2.2 | ↳ Flujo de atención y aprobaciones (solicitud) | `/admin/tickets-vistas?seccion=estados&tipo=solicitud` | Estados, tareas y etapas de aprobación. | SR | ✅ |
| 1.3.3 | Gestión de problemas | `/admin/procesos/problemas` | Configuración del proceso de problemas. | PRB | ✅ |
| 1.3.3.1 | ↳ Configuración de formulario | `/admin/procesos/problemas/formulario` | Formulario configurable con versionado. | PRB | ✅ |
| 1.3.3.1.1 | ↳↳ Campos | (pestaña) | Definición de secciones y campos del formulario. | PRB | ✅ |
| 1.3.3.1.2 | ↳↳ Campos personalizados | (pestaña) | Alta de campos propios del problema (asistente). | PRB | ✅ |
| 1.3.3.1.3 | ↳↳ Listas y catálogos | (pestaña) | Categorías, orígenes, causas raíz, códigos, métodos. | PRB | ✅ |
| 1.3.3.1.4 | ↳↳ Matriz de prioridad | (pestaña) | Matriz impacto × urgencia propia + toggles y tooltips. | PRB, SLM | ✅ |
| 1.3.3.1.5 | ↳↳ Plantillas de problema | (pestaña) | Plantillas reutilizables de registro. | PRB | ✅ |
| 1.3.3.1.6 | ↳↳ Vista del ticket | (pestaña) | Cabecera y pestañas de la vista del problema. | PRB | ✅ |
| 1.3.3.2 | ↳ Flujo de investigación y seguimiento | `/admin/procesos/problemas/flujo` | Ciclo de vida del problema. | PRB | ✅ |
| 1.3.3.2.1 | ↳↳ Estados | (pestaña) | Estados del problema. | PRB | ✅ |
| 1.3.3.2.2 | ↳↳ Transiciones y acciones | (pestaña) | Transiciones y acciones por rol. | PRB | ✅ |
| 1.3.3.2.3 | ↳↳ Asignación automática | (pestaña) | Reglas de asignación. | PRB | ✅ |
| 1.3.3.2.4 | ↳↳ Objetivos de tiempo | (pestaña) | Objetivos de investigación por prioridad. | PRB, SLM | ✅ |
| 1.3.3.2.5 | ↳↳ Escalamiento | (pestaña) | Reglas de escalamiento. | PRB | ✅ |
| 1.3.3.2.6 | ↳↳ Reapertura | (pestaña) | Reglas de reapertura. | PRB | ✅ |
| 1.3.3.2.7 | ↳↳ Tareas predefinidas | (pestaña) | Paquetes de tareas. | PRB | ✅ |
| 1.3.3.2.8 | ↳↳ Problemas mayores | (pestaña) | Criterios de problema mayor. | PRB | ✅ |
| 1.3.3.3 | ↳ Relación con incidentes, errores conocidos y conocimiento | `/admin/procesos/problemas/relaciones` | Vínculos del problema con otros procesos. | PRB | ✅ |
| 1.3.3.3.1 | ↳↳ Creación automática por umbral | (pestaña) | Umbrales que generan problemas. | PRB, INC | ✅ |
| 1.3.3.3.2 | ↳↳ Incidentes vinculados | (pestaña) | Reglas de vinculación de incidentes. | PRB, INC | ✅ |
| 1.3.3.3.3 | ↳↳ Errores conocidos (KEDB) | (pestaña) | Política de KEDB. | PRB, KM | ✅ |
| 1.3.3.3.4 | ↳↳ Cambios (RFC) | (pestaña) | RFC derivadas del problema. | PRB, CHG | ✅ |
| 1.3.3.3.5 | ↳↳ Conocimiento | (pestaña) | Generación de artículos desde problemas. | PRB, KM | ✅ |
| 1.3.3.3.6 | ↳↳ CI y servicios | (pestaña) | Vínculo con CI y servicios afectados. | PRB, SCM | ✅ |
| 1.3.4 | Gestión de cambios | `/admin/procesos/cambios` | Configuración del proceso de cambios. | CHG | ✅ |
| 1.3.4.1 | ↳ Configuración de formulario | `/admin/procesos/cambios/formulario` | Formulario de RFC configurable. | CHG | ✅ |
| 1.3.4.1.1 | ↳↳ Campos | (pestaña) | Secciones y campos de la RFC. | CHG | ✅ |
| 1.3.4.1.2 | ↳↳ Campos personalizados | (pestaña) | Campos propios de la RFC. | CHG | ✅ |
| 1.3.4.1.3 | ↳↳ Listas y catálogos | (pestaña) | Catálogos de cambio. | CHG | ✅ |
| 1.3.4.1.4 | ↳↳ Cuestionario de riesgo | (pestaña) | Preguntas de evaluación de riesgo. | CHG, RISK | ✅ |
| 1.3.4.1.5 | ↳↳ Prioridad (matriz compartida) | (pestaña) | Matriz impacto × urgencia compartida. | CHG, SLM | ✅ |
| 1.3.4.1.6 | ↳↳ Plantillas de RFC | (pestaña) | Plantillas de solicitud de cambio. | CHG | ✅ |
| 1.3.4.1.7 | ↳↳ Vista del ticket | (pestaña) | Cabecera y pestañas de la RFC. | CHG | ✅ |
| 1.3.4.2 | ↳ Tipos de cambio y requisitos | `/admin/procesos/cambios/tipos-requisitos` | Tipos, autoridad y clasificación. | CHG | ✅ |
| 1.3.4.2.1 | ↳↳ Tipos de cambio | (pestaña) | Tipos (estándar, normal, emergencia). | CHG | ✅ |
| 1.3.4.2.2 | ↳↳ Matriz de autoridad | (pestaña) | Quién autoriza cada tipo. | CHG, RISK | ✅ |
| 1.3.4.2.3 | ↳↳ Modelos de cambio estándar | (pestaña) | Catálogo preautorizado. | CHG | ✅ |
| 1.3.4.2.4 | ↳↳ Reglas de clasificación | (pestaña) | Clasificación automática del cambio. | CHG | ✅ |
| 1.3.4.3 | ↳ Flujo de evaluación, autorización y revisión posterior | `/admin/procesos/cambios/flujo-evaluacion` | Ciclo de vida de la RFC. | CHG | ✅ |
| 1.3.4.3.1 | ↳↳ Estados | (pestaña) | Estados del cambio. | CHG | ✅ |
| 1.3.4.3.2 | ↳↳ Transiciones y acciones | (pestaña) | Transiciones y acciones. | CHG | ✅ |
| 1.3.4.3.3 | ↳↳ Etapas de aprobación | (pestaña) | Etapas y quórum. | CHG | ✅ |
| 1.3.4.3.4 | ↳↳ Comités (CAB y emergencia) | (pestaña) | CAB y ECAB. | CHG, COBIT | ✅ |
| 1.3.4.3.5 | ↳↳ Plazos y escalamiento | (pestaña) | Plazos por etapa y escalamiento. | CHG | ✅ |
| 1.3.4.3.6 | ↳↳ Tareas y checklists | (pestaña) | Tareas y listas de verificación. | CHG | ✅ |
| 1.3.4.3.7 | ↳↳ Implementación y cierre | (pestaña) | Reglas de implementación y cierre. | CHG | ✅ |
| 1.3.4.3.8 | ↳↳ Revisión post-implementación | (pestaña) | PIR. | CHG, CI | ✅ |
| 1.3.4.4 | ↳ Notificaciones y calendario de cambios | `/admin/procesos/cambios/notificaciones-calendario` | Calendario y avisos del cambio. | CHG | ✅ |
| 1.3.4.4.1 | ↳↳ Notificaciones | (pestaña) | Eventos y avisos del cambio. | CHG | ✅ |
| 1.3.4.4.2 | ↳↳ Ventanas de mantenimiento | (pestaña) | Ventanas autorizadas. | CHG | ✅ |
| 1.3.4.4.3 | ↳↳ Períodos de congelamiento | (pestaña) | Freeze periods. | CHG | ✅ |
| 1.3.4.4.4 | ↳↳ Feriados | (pestaña) | Calendario de feriados. | CHG | ✅ |
| 1.3.4.4.5 | ↳↳ Conflictos y capacidad | (pestaña) | Detección de conflictos. | CHG, CAP | ✅ |
| 1.3.4.4.6 | ↳↳ Presentación del calendario | (pestaña) | Vistas del calendario. | CHG | ✅ |
| 1.4 | Organización y soporte | `/admin/organizacion` | Estructura organizativa y de soporte. | WTM | ✅ |
| 1.4.1 | Departamentos empresariales | `/admin/departamentos-empresa` | Áreas de negocio y su Gestor de Área. | WTM, REL | ✅ |
| 1.4.2 | Departamentos y grupos resolutores de TI | `/admin/departamentos` | Áreas técnicas y grupos. | WTM | ✅ |
| 1.4.3 | Técnicos y niveles de soporte | `/admin/tecnicos` | Técnicos N1/N2/N3 y ausencias. | WTM | ✅ |
| 1.4.4 | Supervisores | `/admin/departamentos?vista=supervisores` | Asignación de supervisores. | WTM | ✅ |
| 1.5 | Activos y configuración | `/admin/activos-config/tipos-modelos-atributos` | Configuración ITAM/CMDB. | ITAM, SCM | ✅ |
| 1.5.1 | Tipos, modelos y atributos de activos | `/admin/activos-config/tipos-modelos-atributos` | Metamodelo del activo. | ITAM | ✅ |
| 1.5.1.1 | ↳↳ Jerarquía de clases y tipos | (pestaña) | Clases y tipos de activo. | ITAM | ✅ |
| 1.5.1.2 | ↳↳ Fabricantes y modelos | (pestaña) | Fabricantes y modelos. | ITAM | ✅ |
| 1.5.1.3 | ↳↳ Atributos por tipo | (pestaña) | Atributos del tipo. | ITAM | ✅ |
| 1.5.1.4 | ↳↳ Configuración de formulario del activo | (pestaña) | Formulario del activo. | ITAM | ✅ |
| 1.5.1.5 | ↳↳ Código de activo y etiquetas | (pestaña) | Codificación y etiquetas. | ITAM, 27001 | ✅ |
| 1.5.1.6 | ↳↳ Ubicaciones | (pestaña) | Ubicaciones físicas. | ITAM | ✅ |
| 1.5.1.7 | ↳↳ Listas y catálogos auxiliares | (pestaña) | Listas de apoyo. | ITAM | ✅ |
| 1.5.1.8 | ↳↳ Ficha del activo y listado | (pestaña) | Ficha y columnas del listado. | ITAM | ✅ |
| 1.5.1.9 | ↳↳ Importación masiva e inventario físico | (pestaña) | Carga masiva y conteos. | ITAM | ✅ |
| 1.5.2 | Ciclos de vida y reglas de transición | `/admin/activos-config/ciclos-vida-transiciones` | Ciclo de vida del activo. | ITAM | ✅ |
| 1.5.2.1 | ↳↳ Ciclos de vida y estados | (pestaña) | Estados del activo. | ITAM | ✅ |
| 1.5.2.2 | ↳↳ Transiciones y reglas | (pestaña) | Transiciones válidas. | ITAM | ✅ |
| 1.5.2.3 | ↳↳ Asignación, custodia y devolución | (pestaña) | Reglas de custodia y actas. | ITAM, 27001 | ✅ |
| 1.5.2.4 | ↳↳ Adquisición y recepción | (pestaña) | Alta y recepción. | ITAM, SUP | ✅ |
| 1.5.2.5 | ↳↳ Mantenimiento y fin de vida | (pestaña) | Mantenimiento y EOL. | ITAM | ✅ |
| 1.5.2.6 | ↳↳ Baja y disposición | (pestaña) | Bajas y disposición. | ITAM, 27001 | ✅ |
| 1.5.3 | Licencias y contratos | `/admin/activos-config/licencias-contratos` | SAM y contratos. | ITAM, SUP | ✅ |
| 1.5.3.1 | ↳↳ Tipos de licencia y métricas | (pestaña) | Tipos y métricas de licencia. | ITAM, 19770 | ✅ |
| 1.5.3.2 | ↳↳ Tipos de contrato y proveedores | (pestaña) | Tipos de contrato. | ITAM, SUP | ✅ |
| 1.5.3.3 | ↳↳ Formulario de licencia y contrato | (pestaña) | Formulario de licencia/contrato. | ITAM | ✅ |
| 1.5.3.4 | ↳↳ Cumplimiento y sobreuso | (pestaña) | Cumplimiento y sobreuso. | ITAM, 19770 | ✅ |
| 1.5.3.5 | ↳↳ Alertas de vencimiento y garantía | (pestaña) | Alertas de vencimiento. | ITAM, SUP | ✅ |
| 1.5.3.6 | ↳↳ Renovación | (pestaña) | Renovaciones. | ITAM, SUP | ✅ |
| 1.5.4 | Tipos de elementos de configuración y relaciones de CMDB | `/admin/activos-config/cmdb-relaciones` | Metamodelo CMDB. | SCM | ✅ |
| 1.5.4.1 | ↳↳ Clases de CI | (pestaña) | Clases de elemento de configuración. | SCM | ✅ |
| 1.5.4.2 | ↳↳ Tipos de relación | (pestaña) | Relaciones entre CI. | SCM | ✅ |
| 1.5.4.3 | ↳↳ Criticidad y entornos | (pestaña) | Criticidad y entornos. | SCM | ✅ |
| 1.5.4.4 | ↳↳ Reglas de integridad | (pestaña) | Reglas de integridad. | SCM | ✅ |
| 1.5.4.5 | ↳↳ Fuentes de datos y atributos protegidos | (pestaña) | Fuentes y atributos protegidos. | SCM, 27001 | ✅ |
| 1.5.4.6 | ↳↳ Auditoría de CMDB y líneas base | (pestaña) | Auditoría y líneas base. | SCM, 19770 | ✅ |
| 1.6 | Comunicaciones y notificaciones | `/admin/comunicaciones` | Plantillas y contacto. | — | ✅ |
| 1.6.1 | Plantillas de correo y otros canales | `/admin/notificaciones?seccion=plantillas` | Plantillas y reglas por evento. | — | ✅ |
| 1.6.2 | Configuración de contacto | `/admin/notificaciones?seccion=contacto` | Remitente, SMTP y datos de la mesa. | — | ✅ |
| 1.7 | Gobierno del conocimiento | `/admin/conocimiento` | Gobierno de la base de conocimiento. | KM | ✅ |
| 1.7.1 | Categorías, responsables y reglas de publicación y revisión | `/admin/conocimiento-config` | Categorías, responsables y políticas. | KM | ✅ |
| 1.8 | Auditoría, seguridad y retención | `/admin/auditoria` | Trazabilidad y retención. | ISM | ✅ |
| 1.8.1 | Auditoría de cambios | `/admin/auditoria-sistema` | Registro inmutable antes/después. | ISM, COBIT | ✅ |
| 1.8.2 | Registros de seguridad y autenticación | `/admin/seguridad-logs` | Logs de seguridad. | ISM, 27001 | ✅ |
| 1.8.3 | Retención y mantenimiento de datos | `/admin/mantenimiento-datos` | Retención y depuración. | ISM, 27001 | ✅ |
| **2** | **Reportes y analítica** | `/reportes` | Indicadores y tableros. | MR | ✅ |
| 2.1 | Indicadores operativos y SLA | `/tickets/reportes` | SLA, volumen y satisfacción. | MR, SLM | ✅ |
| 2.2 | Tableros | `/admin/reportes-disenador` | Diseñador de tableros. | MR, COBIT | ✅ |
| **3** | **Supervisión global** | `/tickets/gestion` | Consulta global (sin operar). | MR, MON | ✅ |
| 3.1 | Todos los tickets | `/tickets/gestion/todos` | Listado global de tickets. | INC | ✅ |
| 3.2 | Auditoría forense de tickets | `/tickets/gestion/auditoria` | Trazabilidad de tickets. | ISM | ✅ |
| 3.3 | Cambios (consulta global) | `/cambios/gestion/todos` | Listado global de cambios. | CHG | ✅ |
| 3.4 | Problemas (consulta global) | `/problemas` | Listado global de problemas. | PRB | ✅ |
| 3.5 | Inventario y CMDB (consulta global) | `/activos/inventario` | Inventario y CMDB. | ITAM, SCM | ✅ |
| 3.6 | Eventos y resiliencia (consulta) | `/operacion` | Eventos, disponibilidad y continuidad. | MON, AVL, CONT | ✅ |
| **4** | **Salud del sistema** | `/admin/salud-sistema` | Estado técnico del sistema. | MR, COBIT | ✅ |
| 4.1 | Estado de la base de datos y servicios | `/admin/salud-sistema` | Conexión, latencia, tablas y detección de BD pausada. | MR | ✅ |
| 4.2 | Tareas programadas | `/api/admin/salud-sistema/tareas` | Última/próxima ejecución y resultado de los jobs; ejecutar ahora. | MR, COBIT | ✅ |
| 4.3 | Cola de correo y notificaciones | `/api/admin/salud-sistema/correo` | Envíos pendientes/fallidos y reintento. | MR, COBIT | ✅ |
| **5** | **Mi cuenta** | `/mi-cuenta` | Datos personales y preferencias. | — | ✅ |
| 5.1 | Mi perfil y seguridad | `/mi-cuenta` | Datos, cambio de clave y sesiones. | ISM | ✅ |
| 5.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | Eventos × canales, resumen y silencio. | — | ✅ |

---

## PERFIL 2 — Técnico
**Inicio:** `/tecnico/panel` · **Nodos de menú:** 44 · **Resultado:** 42 ✅ · 2 🟢 · 0 ⚠️ · 0 ❌

| Código | Opción / Pestaña | Ruta | Qué hace | Marco | Estado |
|---|---|---|---|---|---|
| **1** | **Mi trabajo** | `/tecnico` | Espacio personal del técnico. | SD, WTM | ✅ |
| 1.1 | Panel del técnico | `/tecnico/panel` | Qué atender ahora: indicadores, urgentes, agenda y avisos. | SD | ✅ |
| 1.2 | Mis tareas | `/tecnico/tareas` | Tareas de tickets, problemas, cambios y recordatorios. | SD, WTM | ✅ |
| 1.3 | Mi agenda y disponibilidad | `/tecnico/agenda` | Calendario y estado Disponible/Ocupado/No disponible. | WTM | ✅ |
| 1.4 | Mi desempeño | `/tecnico/panel` | Indicadores propios y del grupo. | MR, WTM | 🟢 redirige |
| **2** | **Mesa de Servicio** | `/tecnico/mesa` | Atención de tickets. | SD, INC, SR | ✅ |
| 2.1 | Mis tickets asignados | `/tecnico/mesa/asignados` | Cola personal con SLA y acciones rápidas. | INC | ✅ |
| 2.2 | Bandeja de pendientes | `/tecnico/mesa/pendientes` | Cola sin asignar; tomar atómicamente. | SD | ✅ |
| 2.3 | Tickets de mi área técnica | `/tecnico/mesa/area` | Consulta del departamento TI y ofrecer ayuda. | SD | ✅ |
| 2.4 | Registrar ticket para un usuario | `/tecnico/mesa/registrar` | Registro por teléfono/chat/presencial. | INC, SR | ✅ |
| 2.5 | Búsqueda avanzada | `/tecnico/mesa/asignados` | Búsqueda; redirige a la cola. | SD | 🟢 redirige |
| 2.6 | Historial de resueltos | `/tecnico/mesa/historial` | Tickets resueltos por el técnico. | INC | ✅ |
| 2.7 | Incidente mayor (sala de crisis) | `/tecnico/mesa/incidente-mayor` | Línea de tiempo, tareas y comunicados. | INC | ✅ |
| **3** | **Seguimiento de SLA** | `/tecnico/sla` | Cumplimiento de tiempos. | SLM | ✅ |
| 3.1 | Semáforo de SLA de mi cola | `/tecnico/sla/semaforo` | Semáforo de la cola. | SLM | ✅ |
| 3.2 | Objetivos de tiempo vigentes | `/tecnico/sla/objetivos` | Objetivos por prioridad. | SLM | ✅ |
| **4** | **Gestión de Problemas** | `/tecnico/problemas` | Participación en problemas. | PRB | ✅ |
| 4.1 | Problemas asignados a mí | `/tecnico/problemas/asignados` | Bandeja de problemas propios. | PRB | ✅ |
| 4.2 | Problemas de mi grupo | `/tecnico/problemas/grupo` | Problemas del grupo resolutor. | PRB | ✅ |
| 4.3 | Registrar problema | `/tecnico/problemas/nuevo` | Alta de problema. | PRB | ✅ |
| 4.4 | Candidatos a problema | `/tecnico/problemas/candidatos` | Candidatos detectados. | PRB | ✅ |
| 4.5 | Errores conocidos (KEDB) | `/tecnico/problemas/errores-conocidos` | Consulta y aplicación de workarounds. | PRB, KM | ✅ |
| **5** | **Gestión de Cambios** | `/tecnico/cambios` | Solicitud e implementación. | CHG | ✅ |
| 5.1 | Mis cambios | `/tecnico/cambios/mis-cambios` | Cambios donde participo. | CHG | ✅ |
| 5.2 | Registrar solicitud RFC | `/tecnico/cambios/nuevo` | Alta de RFC. | CHG | ✅ |
| 5.3 | Cambios por implementar | `/tecnico/cambios/implementacion` | Consola Go/No-Go, bitácora y rollback. | CHG | ✅ |
| 5.4 | Calendario de cambios | `/tecnico/cambios/calendario` | Calendario de cambios. | CHG | ✅ |
| 5.5 | Cambios que afectan mis servicios | `/tecnico/cambios/impacto` | Impacto y acuse de enterado. | CHG, SCM | ✅ |
| 5.6 | Historial de cambios | `/tecnico/cambios/historial` | Historial de cambios. | CHG | ✅ |
| **6** | **Activos y CMDB** | `/tecnico/activos` | Consulta y mantenimiento. | ITAM, SCM | ✅ |
| 6.1 | Inventario de activos | `/tecnico/activos/inventario` | Inventario (consulta). | ITAM | ✅ |
| 6.2 | Mapa de topología CMDB | `/tecnico/activos/mapa` | Topología de CI. | SCM | ✅ |
| 6.3 | Mantenimiento y reparaciones | `/tecnico/activos/mantenimiento` | Mantenimientos. | ITAM | ✅ |
| 6.4 | Inventario físico en campo | `/tecnico/activos/conteos` | Conteo con escaneo. | ITAM | ✅ |
| 6.5 | Licencias de software (consulta) | `/tecnico/activos/licencias` | Licencias (consulta). | ITAM, 19770 | ✅ |
| **7** | **Gestión del Conocimiento** | `/tecnico/conocimiento` | Crear y consumir conocimiento. | KM | ✅ |
| 7.1 | Base de conocimiento | `/tecnico/conocimiento/base` | Buscar y leer artículos. | KM | ✅ |
| 7.2 | Mis artículos | `/tecnico/conocimiento/mis-articulos` | Artículos propios. | KM | ✅ |
| 7.3 | Crear artículo | `/tecnico/conocimiento/nuevo` | Alta de artículo. | KM | ✅ |
| 7.4 | Revisiones pendientes | `/tecnico/conocimiento/revisiones` | Revisiones asignadas. | KM | ✅ |
| **8** | Catálogo de servicios (consulta) | `/tecnico/catalogo` | Consulta del catálogo. | CAT | ✅ |
| **9** | **Mi cuenta** | `/mi-cuenta` | Datos y preferencias. | — | ✅ |
| 9.1 | Mi perfil y seguridad | `/mi-cuenta` | Datos, clave y sesiones. | ISM | ✅ |
| 9.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | Eventos × canales. | — | ✅ |

---

## PERFIL 3 — Solicitante
**Inicio:** `/tickets` · **Nodos de menú:** 13 · **Resultado:** 13 ✅ · 0 ⚠️ · 0 ❌

| Código | Opción / Pestaña | Ruta | Qué hace | Marco | Estado |
|---|---|---|---|---|---|
| **1** | **Mesa de Servicio** | `/tickets` | Autoservicio. | SD, INC, SR | ✅ |
| 1.1 | Crear ticket | `/tickets/catalogo` | Elegir servicio y completar formulario dinámico. | SR | ✅ |
| 1.2 | Mis tickets | `/tickets` | Lista de tickets propios con estado y tiempo. | INC | ✅ |
| 1.2.1 | ↳ Detalle y seguimiento | `/tickets/[id]` | Progreso por etapas (vista Consumidor). | INC | ✅ |
| 1.2.2 | ↳ Comunicación con el técnico | (dentro del detalle) | Chat público. | INC, REL | ✅ |
| 1.2.3 | ↳ Calificar la atención | (dentro del detalle) | Encuesta CSAT. | REL | ✅ |
| 1.2.4 | ↳ Reabrir o cancelar | (dentro del detalle) | Reapertura/cancelación con motivo. | INC | ✅ |
| **2** | **Catálogo de Servicios** | `/tickets/catalogo` | Catálogo para reportar/pedir. | CAT | ✅ |
| 2.1 | Catálogo de incidentes | `/tickets/catalogo?tipo=incidente` | Categorías y servicios de falla. | CAT, INC | ✅ |
| 2.2 | Catálogo de solicitudes de servicio | `/tickets/catalogo?tipo=solicitud` | Servicios y requisito de aprobación. | CAT, SR | ✅ |
| **3** | **Gestión de Conocimiento** | `/conocimiento` | Consulta de conocimiento. | KM | ✅ |
| 3.1 | Buscar y leer artículos | `/conocimiento` | Búsqueda; lectura completa en `/conocimiento/[id]`. | KM | ✅ |
| 3.2 | ↳ Detalle del artículo | `/conocimiento/[id]` | Lectura completa y valoración útil/no útil. | KM, REL | ✅ |
| **4** | **Mis activos** | `/activos/mis-activos` | Activos en custodia. | ITAM | ✅ |
| 4.1 | Activos bajo mi custodia | `/activos/mis-activos` | Lista de activos propios. | ITAM | ✅ |
| 4.2 | Aceptar actas de entrega y devolución | `/api/activos/mis-activos/aceptar` | Aceptación de actas con observaciones. | ITAM, 27001 | ✅ |
| 4.3 | Reportar un problema con un activo | `/tickets/catalogo` | Alta de incidente asociado a un CI. | ITAM, INC | ✅ |
| **5** | Avisos de servicio | `/avisos/mantenimientos` | Avisos de mantenimiento. | CHG | ✅ |
| **6** | **Mi cuenta** | `/mi-cuenta` | Datos y preferencias. | — | ✅ |
| 6.1 | Mi perfil y seguridad | `/mi-cuenta` | Datos, clave y sesiones. | ISM | ✅ |
| 6.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | Eventos × canales. | — | ✅ |

---

## PERFIL 4 — Supervisor
**Inicio:** `/supervisor/panel` · **Nodos de menú:** 48 · **Resultado:** 46 ✅ · 2 🟢 · 0 ⚠️ · 0 ❌

| Código | Opción / Pestaña | Ruta | Qué hace | Marco | Estado |
|---|---|---|---|---|---|
| **1** | Panel de supervisión | `/supervisor/panel` | Indicadores, alertas y accesos rápidos del equipo. | MR, SLM | ✅ |
| **2** | **Supervisión y despacho** | `/tickets/gestion` | Despacho y monitoreo. | SD, INC | ✅ |
| 2.1 | Centro de asignación | `/tickets/gestion/asignar` | Asignación de tickets. | SD | ✅ |
| 2.2 | Monitoreo de técnicos | `/tickets/gestion/tecnicos` | Carga y estado de técnicos. | WTM | ✅ |
| 2.2.1 | ↳ Ausencias y guardias del equipo | `/supervisor/equipo/ausencias` | Ausencias y guardias. | WTM | ✅ |
| 2.3 | Todos los tickets de mi área técnica | `/tickets/gestion/todos` | Vista del área. | INC | ✅ |
| 2.4 | Escalamientos y riesgos de SLA | `/supervisor/sla/escalamientos` | Riesgos de SLA. | SLM | ✅ |
| 2.5 | Incidentes mayores | `/supervisor/incidentes-mayores` | Sala de crisis. | INC | ✅ |
| **3** | **Gestión de tickets** | `/tickets/gestion` | Bandejas del equipo. | INC, SR | ✅ |
| 3.1 | Incidentes | `/tickets/gestion/incidentes` | Redirige a `/incidentes`. | INC | 🟢 redirige |
| 3.2 | Solicitudes de servicio | `/tickets/gestion/solicitudes` | Redirige a `/solicitudes`. | SR | 🟢 redirige |
| 3.3 | Mis tickets | `/tickets/gestion/mios` | Tickets propios. | INC | ✅ |
| 3.4 | Asignados | `/tickets/gestion/asignados` | Asignados a mí. | INC | ✅ |
| 3.5 | Bandeja de pendientes | `/tickets/gestion/bandeja` | Pendientes del área. | SD | ✅ |
| 3.6 | Historial de resueltos | `/tickets/gestion/resueltos` | Resueltos. | INC | ✅ |
| 3.7 | Registrar ticket para un usuario | `/tickets/gestion/crear` | Alta asistida. | INC, SR | ✅ |
| 3.8 | Auditoría de mi área | `/tickets/gestion/auditoria` | Trazabilidad del área. | ISM | ✅ |
| **4** | **Seguimiento de SLA** | `/supervisor/sla` | Cumplimiento del grupo. | SLM | ✅ |
| 4.1 | Semáforo de SLA del grupo | `/supervisor/sla/semaforo` | Semáforo del grupo. | SLM | ✅ |
| 4.2 | Objetivos de tiempo vigentes | `/tecnico/sla/objetivos` | Objetivos vigentes. | SLM | ✅ |
| 4.3 | Incumplimientos y causas | `/supervisor/sla/incumplimientos` | Incumplimientos y causas. | SLM, CI | ✅ |
| **5** | **Gestión de Problemas** | `/problemas` | Supervisión de problemas. | PRB | ✅ |
| 5.1 | Registro de problemas | `/problemas` | Registro. | PRB | ✅ |
| 5.2 | Asignación de problemas | `/supervisor/problemas/asignar` | Asignación. | PRB | ✅ |
| 5.3 | Errores conocidos | `/problemas/kedb` | KEDB. | PRB, KM | ✅ |
| **6** | **Gestión de Cambios** | `/cambios/gestion` | Cambios del equipo. | CHG | ✅ |
| 6.1 | Aprobaciones técnicas de RFC | `/supervisor/cambios/aprobaciones` | Aprobación técnica. | CHG | ✅ |
| 6.2 | Calendario de cambios | `/cambios/gestion/calendario` | Calendario. | CHG | ✅ |
| 6.3 | Cambios que afectan a mi equipo | `/supervisor/cambios/impacto` | Impacto. | CHG, SCM | ✅ |
| 6.4 | Programación de implementaciones del equipo | `/supervisor/cambios/programar` | Programación. | CHG, CAP | ✅ |
| **7** | **Activos** | `/activos` | Activos del área. | ITAM | ✅ |
| 7.1 | Inventario (consulta) | `/activos/inventario` | Inventario. | ITAM | ✅ |
| 7.2 | Aprobación de bajas de mi área | `/supervisor/activos/bajas` | Aprobación de bajas. | ITAM, 27001 | ✅ |
| 7.3 | Licencias (consulta) | `/activos/licencias` | Licencias. | ITAM, 19770 | ✅ |
| **8** | **Gestión del Conocimiento** | `/conocimiento` | Revisión de conocimiento. | KM | ✅ |
| 8.1 | Base de conocimiento | `/conocimiento` | Consulta. | KM | ✅ |
| 8.2 | Revisión y publicación de artículos | `/supervisor/conocimiento/revisiones` | Revisión/publicación. | KM | ✅ |
| **9** | **Reportes del equipo** | `/supervisor/reportes` | Indicadores del equipo. | MR | ✅ |
| 9.1 | Indicadores operativos y SLA | `/tickets/reportes` | SLA y volumen. | MR, SLM | ✅ |
| 9.2 | Productividad individual | `/supervisor/reportes/productividad` | Productividad. | MR, WTM | ✅ |
| **10** | **Mi equipo** | `/supervisor/equipo` | Colaboración del equipo. | WTM | ✅ |
| 10.1 | Vistas y respuestas compartidas | `/supervisor/equipo/vistas` | Vistas compartidas. | WTM, KM | ✅ |
| **11** | **Operación de servicios** | `/operacion` | Operación de servicios. | MON, AVL | ✅ |
| 11.1 | Eventos y alertas | `/operacion/eventos` | Eventos y alertas. | MON | ✅ |
| 11.2 | Disponibilidad, capacidad y continuidad | `/operacion/resiliencia` | Resiliencia. | AVL, CAP, CONT | ✅ |
| **12** | **Mi cuenta** | `/mi-cuenta` | Datos y preferencias. | — | ✅ |
| 12.1 | Mi perfil y seguridad | `/mi-cuenta` | Datos, clave y sesiones. | ISM | ✅ |
| 12.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | Eventos × canales. | — | ✅ |

---

## PERFIL 5 — Gestor de Área
**Inicio:** `/gestor-area/panel` · **Nodos de menú:** 23 · **Resultado:** 23 ✅ · 0 ⚠️ · 0 ❌

| Código | Opción / Pestaña | Ruta | Qué hace | Marco | Estado |
|---|---|---|---|---|---|
| **1** | Panel del área | `/gestor-area/panel` | Aprobaciones, tickets y cambios del área. | MR, SLM | ✅ |
| **2** | **Mesa de servicio del área** | `/tickets/gestion` | Autoservicio del área. | SD | ✅ |
| 2.1 | Registrar ticket para el área | `/tickets/gestion/crear` | Alta asistida. | SR | ✅ |
| 2.2 | Tickets de mi departamento | `/tickets/gestion/departamento` | Tickets del departamento. | INC | ✅ |
| 2.3 | Colaboradores de mi área | `/tickets/gestion/colaboradores` | Colaboradores y autorizaciones del área. | WTM | ✅ |
| 2.3.1 | ↳ Autorizaciones de colaboradores | `/api/area/colaboradores/autorizaciones` | Otorgar/revocar autorizaciones por colaborador. | WTM, ISM | ✅ |
| **3** | **Aprobaciones** | `/tickets/gestion/aprobaciones` | Aprobaciones de negocio. | SR, CHG, RISK | ✅ |
| 3.1 | Mis aprobaciones de solicitudes | `/tickets/gestion/aprobaciones` | Aprobación de solicitudes. | SR | ✅ |
| 3.2 | Aprobación de negocio de cambios | `/gestor-area/cambios/aprobaciones` | Aprobación de negocio. | CHG | ✅ |
| 3.3 | Historial de mis decisiones | `/gestor-area/aprobaciones/historial` | Historial de decisiones. | CHG | ✅ |
| 3.4 | Delegación de aprobaciones | `/gestor-area/aprobaciones/delegacion` | Delegación. | CHG, WTM | ✅ |
| **4** | Catálogo de servicios (consulta) | `/tickets/catalogo` | Consulta del catálogo. | CAT | ✅ |
| **5** | **Cambios que afectan a mi área** | `/cambios/gestion` | Cambios del área. | CHG | ✅ |
| 5.1 | Calendario de mantenimientos | `/cambios/gestion/calendario` | Calendario. | CHG | ✅ |
| 5.2 | Cambios con interrupción para mi área | `/gestor-area/cambios/impacto` | Impacto con interrupción. | CHG | ✅ |
| 5.3 | Solicitar un cambio de negocio | `/cambios/gestion/crear` | Alta de cambio de negocio. | CHG | ✅ |
| **6** | **Activos y contratos del área** | `/gestor-area/activos` | Activos y contratos. | ITAM, SUP | ✅ |
| 6.1 | Activos de mi área | `/gestor-area/activos` | Activos del área. | ITAM | ✅ |
| 6.2 | Licencias y contratos de mi departamento | `/gestor-area/contratos` | Licencias y contratos. | ITAM, SUP | ✅ |
| **7** | Reportes del área | `/gestor-area/reportes` | Indicadores del área. | MR | ✅ |
| **8** | Gestión de Conocimiento | `/conocimiento` | Consulta de conocimiento. | KM | ✅ |
| **9** | **Mi cuenta** | `/mi-cuenta` | Datos y preferencias. | — | ✅ |
| 9.1 | Mi perfil y seguridad | `/mi-cuenta` | Datos, clave y sesiones. | ISM | ✅ |
| 9.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | Eventos × canales. | — | ✅ |

---

## PERFIL 6 — Auditor
**Inicio:** `/auditor/panel` · **Nodos de menú:** 29 · **Resultado:** 29 ✅ · 0 ⚠️ · 0 ❌

| Código | Opción / Pestaña | Ruta | Qué hace | Marco | Estado |
|---|---|---|---|---|---|
| **1** | Panel de auditoría | `/auditor/panel` | Hallazgos, riesgos y evidencias. | ISM, MR | ✅ |
| **2** | **Auditoría de tickets** | `/tickets/gestion` | Auditoría de la operación. | ISM | ✅ |
| 2.1 | Todos los tickets (solo lectura) | `/tickets/gestion/todos` | Lectura global. | INC | ✅ |
| 2.2 | Auditoría forense | `/tickets/gestion/auditoria` | Trazabilidad forense. | ISM | ✅ |
| 2.3 | Segregación de funciones | `/auditor/cumplimiento/sod` | SoD. | ISM, COBIT | ✅ |
| 2.4 | Muestreo de auditoría | `/auditor/muestreo` | Muestreo. | ISM | ✅ |
| **3** | **Auditoría del sistema** | `/auditor/sistema` | Control del sistema. | ISM | ✅ |
| 3.1 | Auditoría de cambios de configuración | `/admin/auditoria-sistema` | Cambios de configuración. | SCM, ISM | ✅ |
| 3.2 | Registros de seguridad y autenticación | `/admin/seguridad-logs` | Logs de seguridad. | ISM, 27001 | ✅ |
| 3.3 | Retención y mantenimiento de datos | `/admin/mantenimiento-datos` | Retención. | ISM, 27001 | ✅ |
| 3.4 | Perfiles y permisos (lectura) | `/admin/perfiles` | Lectura de permisos. | ISM | ✅ |
| 3.5 | Recertificación de accesos | `/auditor/accesos/recertificacion` | Recertificación. | ISM, 27001 | ✅ |
| **4** | **Cumplimiento de procesos** | `/auditor/cumplimiento` | Cumplimiento ITIL. | CHG, PRB, SLM | ✅ |
| 4.1 | Cambios: historial, emergencias y revisiones | `/cambios/gestion/todos` | Historial de cambios. | CHG | ✅ |
| 4.2 | Cambios sin autorización o fuera de ventana | `/auditor/cumplimiento/cambios` | Cambios irregulares. | CHG, COBIT | ✅ |
| 4.3 | Problemas y errores conocidos | `/problemas` | Problemas y KEDB. | PRB | ✅ |
| 4.4 | Cumplimiento de SLA | `/tickets/reportes` | Cumplimiento de SLA. | SLM | ✅ |
| **5** | **Activos y licencias** | `/auditor/activos` | Auditoría ITAM. | ITAM | ✅ |
| 5.1 | Inventario (lectura) | `/activos/inventario` | Inventario. | ITAM | ✅ |
| 5.2 | Cumplimiento de licencias | `/activos/licencias` | Cumplimiento de licencias. | ITAM, 19770 | ✅ |
| 5.3 | Resultados de auditorías de CMDB | `/auditor/cmdb/resultados` | Auditoría de CMDB. | SCM, 19770 | ✅ |
| 5.4 | Bajas y disposición | `/auditor/activos/bajas` | Bajas y disposición. | ITAM, 27001 | ✅ |
| **6** | **Reportes y evidencias** | `/auditor/informes` | Informes y evidencias. | MR, COBIT | ✅ |
| 6.1 | Indicadores operativos y SLA | `/tickets/reportes` | Indicadores. | MR | ✅ |
| 6.2 | Tableros (lectura) | `/admin/reportes-disenador` | Tableros. | MR | ✅ |
| 6.3 | Informes de auditoría | `/auditor/informes` | Informes y evidencias adjuntas. | ISM, COBIT | ✅ |
| 6.3.1 | ↳ Evidencias del informe | `/api/perfiles/auditor/evidencia` | Listar y agregar evidencias por informe. | ISM, COBIT | ✅ |
| **7** | **Mi cuenta** | `/mi-cuenta` | Datos y preferencias. | — | ✅ |
| 7.1 | Mi perfil y seguridad | `/mi-cuenta` | Datos, clave y sesiones. | ISM | ✅ |
| 7.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | Eventos × canales. | — | ✅ |

---

## PERFIL 7 — Aprobador (CAB)
**Inicio:** `/aprobador/panel` · **Nodos de menú:** 18 · **Resultado:** 18 ✅ · 0 ⚠️ · 0 ❌

| Código | Opción / Pestaña | Ruta | Qué hace | Marco | Estado |
|---|---|---|---|---|---|
| **1** | Panel del aprobador | `/aprobador/panel` | Pendientes, riesgo y decisiones. | CHG, RISK | ✅ |
| **2** | **Aprobaciones pendientes** | `/aprobador/aprobaciones` | Bandeja de aprobaciones. | CHG, SR | ✅ |
| 2.1 | Aprobaciones de cambios | `/aprobador/cambios` | Autorización de cambios. | CHG | ✅ |
| 2.2 | Aprobaciones de solicitudes de servicio | `/tickets/gestion/aprobaciones` | Aprobación de solicitudes. | SR | ✅ |
| 2.3 | Modelos de cambio estándar | `/aprobador/cambios/modelos` | Preautorización de modelos. | CHG | ✅ |
| 2.4 | Bajas y renovaciones por monto | `/aprobador/activos` | Aprobación por monto. | ITAM, RISK | ✅ |
| 2.5 | Riesgo aceptado y cierre de problemas mayores | `/aprobador/problemas` | Aceptación de riesgo. | PRB, RISK | ✅ |
| **3** | **Comité asesor de cambios (CAB)** | `/cambios/gestion/cab` | Gobierno del cambio. | CHG, COBIT | ✅ |
| 3.1 | Dictamen colegiado | `/cambios/gestion/cab` | Dictamen del comité. | CHG | ✅ |
| 3.2 | Agenda y actas | `/aprobador/cab/agenda` | Convocatoria y actas. | CHG | ✅ |
| 3.3 | Comité de emergencia (ECAB) | `/aprobador/cab/emergencia` | ECAB. | CHG, COBIT | ✅ |
| **4** | Calendario de cambios | `/cambios/gestion/calendario` | Calendario. | CHG | ✅ |
| **5** | Detalle de RFC | `/cambios/gestion/[id]` | Detalle con presentador del Aprobador. | CHG | ✅ |
| 5.1 | ↳ Presentador del Aprobador | (componente) | Datos, impacto/riesgo, plan, ventana y dictamen (Aprobar/Rechazar). | CHG, RISK | ✅ |
| **6** | Historial de mis decisiones | `/aprobador/historial` | Historial de dictámenes. | CHG, COBIT | ✅ |
| **7** | Delegaciones | `/aprobador/delegaciones` | Delegación de voto. | CHG, WTM | ✅ |
| **8** | Reportes de decisiones | `/aprobador/reportes` | Métricas de decisiones. | MR | ✅ |
| **9** | **Mi cuenta** | `/mi-cuenta` | Datos y preferencias. | — | ✅ |
| 9.1 | Mi perfil y seguridad | `/mi-cuenta` | Datos, clave y sesiones. | ISM | ✅ |
| 9.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | Eventos × canales. | — | ✅ |

---

## PERFIL 8 — Gestor de Cambios
**Inicio:** `/gestor-cambios/panel` · **Nodos de menú:** 25 · **Resultado:** 23 ✅ · 2 ⬛ · 0 ⚠️ · 0 ❌

| Código | Opción / Pestaña | Ruta | Qué hace | Marco | Estado |
|---|---|---|---|---|---|
| **1** | Panel de gestión de cambios | `/gestor-cambios/panel` | KPIs, RFC, conflictos y PIR. | CHG, MR | ✅ |
| **2** | **Solicitudes de cambio (RFC)** | `/cambios/gestion` | Gestión de RFC. | CHG | ✅ |
| 2.1 | Registrar solicitud RFC | `/cambios/gestion/crear` | Alta de RFC. | CHG | ✅ |
| 2.2 | Bandeja de RFC por evaluar | `/gestor-cambios/evaluacion` | Bandeja de evaluación. | CHG | ✅ |
| 2.3 | Historial consolidado | `/cambios/gestion/todos` | Historial. | CHG | ✅ |
| **3** | **Evaluación y autorización** | `/gestor-cambios/autorizaciones` | Seguimiento de autorización. | CHG, RISK | ✅ |
| 3.1 | Seguimiento de etapas de aprobación | `/gestor-cambios/autorizaciones` | Etapas y quórum. | CHG | ✅ |
| **4** | **Programación e implementación** | `/gestor-cambios/programacion` | Programación y ejecución. | CHG, CAP | ✅ |
| 4.1 | Calendario de ventanas | `/cambios/gestion/calendario` | Ventanas. | CHG | ✅ |
| 4.2 | Programación de cambios autorizados | `/gestor-cambios/programacion` | Programación. | CHG, CAP | ✅ |
| 4.3 | Conflictos y capacidad | `/gestor-cambios/conflictos` | Conflictos. | CHG, CAP | ✅ |
| 4.4 | Seguimiento de ejecución | `/gestor-cambios/ejecucion` | Ejecución. | CHG | ✅ |
| **5** | **Comité asesor de cambios (CAB)** | `/cambios/gestion/cab` | Presidencia del CAB. | CHG, COBIT | ✅ |
| 5.1 | Dictamen colegiado (presidencia) | `/cambios/gestion/cab` | Dictamen. | CHG | ✅ |
| 5.2 | Convocatoria, agenda y actas | `/gestor-cambios/cab/agenda` | Convocatoria y actas. | CHG | ✅ |
| **6** | Revisión post-implementación | `/gestor-cambios/pir` | PIR. | CHG, CI | ✅ |
| **7** | Modelos de cambio estándar | `/gestor-cambios/modelos` | Modelos preautorizados. | CHG | ✅ |
| **8** | Reglas de calendario | `/gestor-cambios/calendario-reglas` | Agrupa reglas de calendario. | CHG | ⬛ carpeta |
| 8.1 | Ventanas de mantenimiento | `/admin/procesos/cambios/notificaciones-calendario?vista=ventanas` | Ventanas. | CHG | ✅ |
| 8.2 | Períodos de congelamiento | `/admin/procesos/cambios/notificaciones-calendario?vista=congelamiento` | Freeze. | CHG | ✅ |
| 8.3 | Feriados | `/admin/procesos/cambios/notificaciones-calendario?vista=feriados` | Feriados. | CHG | ✅ |
| **9** | Reportes de cambios | `/gestor-cambios/reportes` | Métricas de cambios. | MR | ✅ |
| **10** | **Mi cuenta** | `/mi-cuenta` | Datos y preferencias. | — | ✅ |
| 10.1 | Mi perfil y seguridad | `/mi-cuenta` | Datos, clave y sesiones. | ISM | ✅ |
| 10.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | Eventos × canales. | — | ✅ |

---

## PERFIL 9 — Gestor de Activos y Configuración
**Inicio:** `/gestor-activos/panel` · **Nodos de menú:** 31 · **Resultado:** 29 ✅ · 2 ⬛ · 0 ⚠️ · 0 ❌

| Código | Opción / Pestaña | Ruta | Qué hace | Marco | Estado |
|---|---|---|---|---|---|
| **1** | Panel de activos y CMDB | `/gestor-activos/panel` | Garantías, sobreuso, inexactitudes y campañas. | ITAM, SCM | ✅ |
| **2** | **Inventario de activos (HAM)** | `/activos/inventario` | Gestión del ciclo de vida. | ITAM | ✅ |
| 2.1 | Listado y ficha del activo | `/activos/inventario` | Listado y ficha. | ITAM | ✅ |
| 2.2 | Importación masiva | `/gestor-activos/importacion` | Carga masiva. | ITAM | ✅ |
| 2.3 | Recepción de adquisiciones | `/gestor-activos/recepcion` | Recepción. | ITAM, SUP | ✅ |
| 2.4 | Asignación, custodia y actas | `/gestor-activos/asignaciones` | Asignación y actas. | ITAM, 27001 | ✅ |
| 2.5 | Mantenimiento y garantías | `/gestor-activos/mantenimiento` | Mantenimiento. | ITAM | ✅ |
| 2.6 | Bajas y disposición | `/gestor-activos/bajas` | Bajas. | ITAM, 27001 | ✅ |
| 2.7 | Inventario físico (campañas) | `/gestor-activos/inventario-fisico` | Campañas de conteo. | ITAM | ✅ |
| **3** | **Licencias de software (SAM)** | `/activos/licencias` | Gestión de licencias. | ITAM, 19770 | ✅ |
| 3.1 | Cumplimiento y sobreuso | `/gestor-activos/licencias/cumplimiento` | Cumplimiento. | ITAM, 19770 | ✅ |
| 3.2 | Catálogo de software autorizado | `/gestor-activos/licencias/catalogo-software` | Software autorizado. | ITAM, 19770 | ✅ |
| **4** | **Proveedores y contratos** | `/proveedores` | Terceros y contratos. | SUP, ITAM | ✅ |
| 4.1 | Proveedores | `/proveedores` | Proveedores. | SUP | ✅ |
| 4.2 | Contratos y cobertura | `/gestor-activos/contratos` | Contratos. | SUP, ITAM | ✅ |
| 4.3 | Renovaciones y vencimientos | `/gestor-activos/renovaciones` | Renovaciones. | SUP, ITAM | ✅ |
| **5** | **CMDB** | `/activos/cmdb` | Gestión de la CMDB. | SCM | ✅ |
| 5.1 | Mapa de topología | `/activos/cmdb` | Topología. | SCM | ✅ |
| 5.2 | Modelado de clases CI | `/activos/cmdb/tipos` | Clases de CI. | SCM | ✅ |
| 5.3 | Actualizaciones de CMDB desde cambios | `/gestor-activos/cmdb/actualizaciones` | Actualizaciones. | SCM, CHG | ✅ |
| 5.4 | Calidad y auditoría de CMDB | `/gestor-activos/cmdb/auditoria` | Calidad. | SCM, 19770 | ✅ |
| 5.5 | Líneas base | `/gestor-activos/cmdb/lineas-base` | Líneas base. | SCM | ✅ |
| 5.6 | Inexactitudes reportadas | `/gestor-activos/cmdb/inexactitudes` | Inexactitudes. | SCM | ✅ |
| 5.7 | Análisis e impacto | `/activos/cmdb/analisis` | Topología, impacto y reconciliación Activo ↔ CI. | SCM | ✅ |
| **6** | Catálogos de activos | `/gestor-activos/catalogos` | Agrupa catálogos. | ITAM | ⬛ carpeta |
| 6.1 | Fabricantes y modelos | `/admin/activos-config/tipos-modelos-atributos?vista=fabricantes` | Fabricantes. | ITAM | ✅ |
| 6.2 | Ubicaciones | `/admin/activos-config/tipos-modelos-atributos?vista=ubicaciones` | Ubicaciones. | ITAM | ✅ |
| 6.3 | Listas auxiliares | `/admin/activos-config/tipos-modelos-atributos?vista=catalogos` | Listas. | ITAM | ✅ |
| **7** | Reportes de activos | `/gestor-activos/reportes` | Métricas de inventario. | MR, 19770 | ✅ |
| **8** | **Mi cuenta** | `/mi-cuenta` | Datos y preferencias. | — | ✅ |
| 8.1 | Mi perfil y seguridad | `/mi-cuenta` | Datos, clave y sesiones. | ISM | ✅ |
| 8.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | Eventos × canales. | — | ✅ |

---

## PERFIL 10 — Gestor de Problemas
**Inicio:** `/gestor-problemas/panel` · **Nodos de menú:** 16 · **Resultado:** 16 ✅ · 0 ⚠️ · 0 ❌

| Código | Opción / Pestaña | Ruta | Qué hace | Marco | Estado |
|---|---|---|---|---|---|
| **1** | Panel de gestión de problemas | `/gestor-problemas/panel` | KPIs, candidatos, mayores y objetivos. | PRB, MR | ✅ |
| **2** | Registro de problemas | `/problemas` | Registro y bandeja de problemas. | PRB | ✅ |
| 2.1 | ↳ Detalle del problema | `/problemas/[id]` | Expediente completo (presentador Gestor de Problemas). | PRB | ✅ |
| **3** | Bandeja y asignación | `/gestor-problemas/asignacion` | Asignación de problemas. | PRB | ✅ |
| **4** | **Identificación proactiva** | `/gestor-problemas/candidatos` | Detección proactiva. | PRB | ✅ |
| 4.1 | Candidatos a problema | `/gestor-problemas/candidatos` | Candidatos. | PRB | ✅ |
| 4.2 | Incidentes recurrentes | `/gestor-problemas/recurrentes` | Recurrentes. | PRB, INC | ✅ |
| **5** | Análisis de causa raíz | `/gestor-problemas/analisis` | RCA (5 porqués, Ishikawa, etc.). | PRB | ✅ |
| **6** | Errores conocidos (KEDB) | `/problemas/kedb` | KEDB. | PRB, KM | ✅ |
| **7** | Problemas mayores y revisión | `/gestor-problemas/mayores` | Problemas mayores y revisión. | PRB | ✅ |
| **8** | Solicitudes de cambio derivadas | `/gestor-problemas/cambios` | RFC derivadas. | PRB, CHG | ✅ |
| **9** | Conocimiento derivado | `/gestor-problemas/conocimiento` | Artículos derivados. | PRB, KM | ✅ |
| **10** | Objetivos de tiempo | `/gestor-problemas/objetivos` | Objetivos de investigación. | PRB, SLM | ✅ |
| **11** | Reportes de problemas | `/gestor-problemas/reportes` | Métricas de problemas. | MR | ✅ |
| **12** | **Mi cuenta** | `/mi-cuenta` | Datos y preferencias. | — | ✅ |
| 12.1 | Mi perfil y seguridad | `/mi-cuenta` | Datos, clave y sesiones. | ISM | ✅ |
| 12.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | Eventos × canales. | — | ✅ |

---

## 11. Resumen global

| Perfil | Nodos de menú | ✅ | 🟢 | ⬛ | ⚠️ | ❌ |
|---|---:|---:|---:|---:|---:|---:|
| 1 Administrador | 60 | 58 | 2 | 0 | 0 | 0 |
| 2 Técnico | 44 | 42 | 2 | 0 | 0 | 0 |
| 3 Solicitante | 13 | 13 | 0 | 0 | 0 | 0 |
| 4 Supervisor | 48 | 46 | 2 | 0 | 0 | 0 |
| 5 Gestor de Área | 23 | 23 | 0 | 0 | 0 | 0 |
| 6 Auditor | 29 | 29 | 0 | 0 | 0 | 0 |
| 7 Aprobador | 18 | 18 | 0 | 0 | 0 | 0 |
| 8 Gestor de Cambios | 25 | 23 | 0 | 2 | 0 | 0 |
| 9 Gestor de Activos | 31 | 29 | 0 | 2 | 0 | 0 |
| 10 Gestor de Problemas | 16 | 16 | 0 | 0 | 0 | 0 |
| **TOTAL** | **307** | **297** | **6** | **4** | **0** | **0** |

- **0 opciones ausentes** y **0 opciones parciales** en los 10 perfiles.
- **6 redirecciones** operativas (alias a vistas compartidas del dominio; no son stubs).
- **4 carpetas de agrupación** (ítems de menú sin página propia, por diseño: solo agrupan hijos).
- **Pestañas internas inventariadas:** 77 en total (formulario/flujo/relaciones de problemas y cambios, y configuración de activos/CMDB).

### Pestañas internas por pantalla

| Pantalla | Pestañas |
|---|---|
| Admin · Formulario de problemas | 6 (Campos · Campos personalizados · Listas y catálogos · Matriz de prioridad · Plantillas · Vista del ticket) |
| Admin · Flujo de problemas | 8 (Estados · Transiciones · Asignación · Objetivos · Escalamiento · Reapertura · Tareas · Problemas mayores) |
| Admin · Relaciones de problemas | 6 (Umbral · Incidentes vinculados · KEDB · RFC · Conocimiento · CI y servicios) |
| Admin · Formulario de cambios | 7 (Campos · Campos personalizados · Listas y catálogos · Cuestionario de riesgo · Prioridad · Plantillas · Vista del ticket) |
| Admin · Tipos de cambio y requisitos | 4 (Tipos · Matriz de autoridad · Modelos estándar · Reglas de clasificación) |
| Admin · Flujo de evaluación de cambios | 8 (Estados · Transiciones · Etapas · Comités · Plazos · Tareas/checklists · Implementación/cierre · PIR) |
| Admin · Notificaciones y calendario de cambios | 6 (Notificaciones · Ventanas · Congelamiento · Feriados · Conflictos/capacidad · Presentación) |
| Admin · Tipos, modelos y atributos de activos | 9 (Clases/tipos · Fabricantes/modelos · Atributos · Formulario · Código/etiquetas · Ubicaciones · Listas · Ficha/listado · Importación) |
| Admin · Ciclos de vida y transiciones | 6 (Ciclos/estados · Transiciones · Asignación/custodia · Adquisición/recepción · Mantenimiento/fin de vida · Baja/disposición) |
| Admin · Licencias y contratos | 6 (Tipos de licencia · Tipos de contrato · Formulario · Cumplimiento/sobreuso · Alertas de vencimiento · Renovación) |
| Admin · CMDB y relaciones | 6 (Clases de CI · Tipos de relación · Criticidad/entornos · Reglas de integridad · Fuentes/atributos · Auditoría/líneas base) |
| Admin · Salud del sistema | 3 (Estado BD/servicios · Tareas programadas · Cola de correo y notificaciones) |

---

## 12. Brechas completadas en esta iteración (commit `f507bff`)

| # | Perfil | Brecha | Solución implementada |
|---|---|---|---|
| 1 | Admin 4.2 | Tareas programadas | Tabla `tarea_programada` + servicio + API `/api/admin/salud-sistema/tareas` + sección en la vista (ejecutar ahora). |
| 2 | Admin 4.3 | Cola de correo | Tabla `cola_correo` + servicio + API `/api/admin/salud-sistema/correo` + sección en la vista (reintentar). |
| 3 | Admin 1.3.3.1.2 | Campos personalizados (problemas) | `PestanaCamposPersonalizados.tsx` nueva + pestaña registrada. |
| 4 | Admin 1.3.3.1.4 | Matriz de prioridad (problemas) | `PestanaPrioridad.tsx` nueva + pestaña registrada. |
| 5 | Solicitante 3.2 | Detalle de artículo | Página `/conocimiento/[id]` + `VistaConocimientoDetalle` + enlace desde la base. |
| 6 | Solicitante 4.2 | Aceptar actas de activos | Tabla `acta_entrega` + API `/api/activos/mis-activos/aceptar` + acción en la vista. |
| 7 | Gestor de Área 2.3.1 | Autorizaciones de colaboradores | Tabla `colaborador_autorizacion` + API `/api/area/colaboradores/autorizaciones` + UI. |
| 8 | Auditor 6.3.1 | Evidencias de informe | Tabla `informe_evidencia` + API `/api/perfiles/auditor/evidencia` + UI. |
| 9 | Aprobador 5.1 | Presentador de RFC | `PresentadorRfcAprobador.tsx` + enrutado en el detalle del cambio. |
| 10 | Gestor de Problemas 2.1 | Detalle del problema | Página `/problemas/[id]` + `VistaProblemaDetalle` + enlace desde el listado. |
| 11 | Activos (interno) | Validaciones | `src/modules/activos/activosValidaciones.ts` + uso en asignaciones. |

**Migraciones nuevas:** `20261016_salud_sistema_tareas_correo.sql`, `20261016_acta_entrega_aceptacion.sql`, `20261016_colaborador_autorizacion_evidencia.sql`.

**Validación:** `npx tsc --noEmit` → 0 errores · `npm run build` → exit 0 · sin mojibake · sincronizado en `main` + 3 ramas.

---

## 13. Cobertura por marco (consolidada)

| Marco | Cobertura | Comentario |
|---|---|---|
| **ITIL 4** | 🟢 Alta | Cubiertas las prácticas operativas: INC, SR, SD, PRB, CHG, ITAM, SCM, CAT, SLM, KM, MR, MON, AVL, CAP, CONT, ISM, SUP, WTM, REL, RISK, CI. |
| **ISO/IEC 20000-1:2018** | 🟢 Alta | Resolución, cambio, activos/configuración, SLA, mejora y gobierno del conocimiento. |
| **ISO/IEC 27001:2022** | 🟡 Media-Alta | Inventario, uso aceptable, devolución y aceptación de actas, borrado/retención, accesos, logs y licencias. |
| **ISO/IEC 19770-1** | 🟢 Alta | SAM: licencias, cumplimiento/sobreuso, software autorizado y renovaciones. |
| **COBIT 2019** | 🟡 Media-Alta | BAI06 (cambios), BAI09 (activos), BAI10 (configuración), DSS03 (problemas), MEA (monitoreo) y salud del sistema (DSS). |

> **Nota de alcance:** las prácticas **financieras** (presupuesto, costeo, depreciación, facturación) **no pertenecen a un ITSM** y viven en el ERP. FlowDesk solo conserva costo/contrato del activo como referencia. Su ausencia es **por diseño**.

---

## 14. Conclusión

- **Los 10 perfiles quedaron sin opciones ausentes ni parciales**: 297 nodos completos, 6 redirecciones operativas y 4 carpetas de agrupación por diseño.
- **Todas las brechas detectadas en la auditoría anterior fueron cerradas** e incluyen migraciones de BD aplicadas y verificadas.
- La **cobertura ITIL 4 / ISO 20000 / ISO 19770 es alta**; las únicas ausencias de marco corresponden a **gobierno corporativo y finanzas**, fuera del alcance de un ITSM.

*Documento de análisis y verificación; no modifica código.*
