# AUDITORÍA DE COBERTURA DE MENÚS Y FUNCIONALIDADES POR PERFIL
## FlowDesk ITSM frente a ITIL 4, ISO/IEC 20000-1, ISO/IEC 27001, ISO/IEC 19770-1 y COBIT 2019

> **Fecha:** 2026-10-15
> **Alcance:** inventario de todas las opciones de menú (nivel 1 y nivel 2) y de las pestañas internas de cada opción, para los 10 perfiles oficiales; evaluación de madurez frente a los marcos de referencia; identificación de opciones/capacidades faltantes.
> **Fuentes:** `ESQUEMA_MENUS_POR_PERFIL.md` (especificación), `MATRIZ_BRECHA_ACTUAL_VS_PROPUESTA_POR_PERFIL.md`, `prompt_1/2/3_*.md` (configuración de Problemas, Cambios y Activos/CMDB), y el código real en `src/app`, `src/modules`, `src/shared`.

---

## 0. Estado de sincronización con GitHub

| Rama | Commit local | Commit remoto | Estado |
|---|---|---|---|
| `main` | `1a9c7f3` | `1a9c7f3` | ✅ sincronizada |
| `feature/alexis-problemas-conocimiento` | `1a9c7f3` | `1a9c7f3` | ✅ sincronizada |
| `prueba-conexion` | `1a9c7f3` | `1a9c7f3` | ✅ sincronizada |
| `verify-junior` | `1a9c7f3` | `1a9c7f3` | ✅ sincronizada |

- **Todo el trabajo está subido a GitHub.** Las 4 ramas apuntan al mismo commit `1a9c7f3` (Fase 8 — Gestor de Problemas).
- Archivos **sin commitear** (untracked): los 3 documentos de especificación `DOCUMENTACIÓN/prompt_1_config_gestion_de_problemas.md`, `prompt_2_config_gestion_de_cambios.md`, `prompt_3_config_activos_y_cmdb.md`. Son documentos de referencia (no código); se pueden versionar cuando quieras.

---

## 1. Cómo leer este informe

| Estado | Significado |
|---|---|
| 🟢 **Completo** | Opción/pestaña implementada con página, controlador, servicio que consulta la BD y vista. |
| 🟡 **Parcial** | La opción existe, pero falta alguna pestaña, API dedicada, página de detalle o profundidad funcional respecto al marco. |
| 🔴 **Ausente** | No existe en el software actual. |

**Métricas base del código real:**
- **189 páginas** bajo `src/app/plataforma`.
- **183 de 205** rutas del esquema tienen página propia. De las 22 sin página, **21 son carpetas de agrupación** (menú padre sin página, correcto por diseño) y **1 es una brecha real** (`/problemas/[id]`).
- **116 servicios** `*Service.ts` con **646 llamadas a `query()`** → la gran mayoría del backend es real y consulta PostgreSQL.
- **82 rutas hoja** que estaban bloqueadas en el menú fueron implementadas en 8 fases; **0 rutas hoja bloqueadas** restantes (los 26 nodos bloqueados que quedan son todos carpetas de agrupación).

---

## 2. Resumen ejecutivo

1. **Cobertura de menú: prácticamente total.** Todas las opciones y subopciones del esquema tienen su ruta y su vista, en los 10 perfiles. Solo hay **1 página dedicada faltante** (`/problemas/[id]`, el "Detalle del problema" del Gestor de Problemas), cubierta parcialmente por un modal.
2. **Pantallas de configuración de administrador: 25 de 27 pestañas especificadas.** Los 4 procesos de configuración (Problemas, Cambios, Activos, CMDB) tienen sus pestañas internas; faltan **2 pestañas** en *Problemas → Configuración de formulario* (`Campos personalizados` y `Prioridad`), que ya existen en el módulo de Cambios y son adaptables.
3. **Marcos ITIL 4:** cobertura **fuerte** en las prácticas centrales de operación de servicios (Incident, Service Desk, Service Request, Problem, Change, IT Asset, Service Configuration, Service Catalogue, SLA, Knowledge, Measurement). Cobertura **parcial** en las prácticas de gestión (finanzas de servicio, portafolio, proyecto, arquitectura, estrategia) y en disponibilidad/capacidad/continuidad (parciales).
4. **ISO/IEC 20000-1:2018:** cobertura sólida en resolución (incidente/solicitud/problema), cambio y activos/configuración; **parcial** en diseño/transición de servicios y en gestión de la demanda/presupuesto.
5. **ISO/IEC 27001:2022:** cobertura **parcial** centrada en los controles de inventario de activos, uso aceptable, devolución, borrado seguro, control de accesos, bitácoras y retención; **no** hay un módulo de ISMS/tratamiento de riesgos de seguridad.
6. **ISO/IEC 19770-1 (SAM):** cobertura **fuerte** (derechos vs. instalaciones, cumplimiento/sobreuso, catálogo de software autorizado, renovaciones).
7. **COBIT 2019:** cobertura **parcial** en BAI06 (cambios), BAI07 (transición), BAI09 (activos), BAI10 (configuración), DSS03 (problemas) y DSS05 (seguridad).

---

## 3. Inventario por perfil

Convención: **Opción (nivel 1)** → subopciones (nivel 2) con su ruta y estado. Las rutas se muestran sin el prefijo interno `plataforma`.

### PERFIL 1 — Administrador (`/admin`)

| Opción | Subopciones | Estado |
|---|---|---|
| **1 Configuración** | 1.1 Identidades y accesos · 1.2 Catálogo de servicios y SLAs · 1.3 Configuración de procesos · 1.4 Organización y soporte · 1.5 Activos y configuración · 1.6 Comunicaciones y notificaciones · 1.7 Gobierno del conocimiento · 1.8 Auditoría, seguridad y retención | 🟢 (con 🟡 en 1.3 Problemas) |
| **2 Reportes y analítica** | 2.1 Indicadores operativos y SLA (`/tickets/reportes`) · 2.2 Tableros (`/admin/reportes-disenador`) | 🟢 |
| **3 Supervisión global** | 3.1 Todos los tickets · 3.2 Auditoría forense · 3.3 Cambios (consulta) · 3.4 Problemas (consulta) · 3.5 Inventario y CMDB · 3.6 Eventos y resiliencia | 🟢 |
| **4 Salud del sistema** | 4.1 Estado de BD y servicios (`/admin/salud-sistema`) · **4.2 Tareas programadas** · **4.3 Cola de correo y notificaciones** | 🔴 4.2 y 4.3 |
| **5 Mi cuenta** | 5.1 Mi perfil y seguridad · 5.2 Preferencias de notificación (`/mi-cuenta/notificaciones`) | 🟢 |

**Pestañas internas de configuración (1.3 y 1.5):**

| Pantalla | Ruta | Pestañas especificadas | Implementadas |
|---|---|---|---|
| Problemas → Formulario | `/admin/procesos/problemas/formulario` | 6 | **4** (faltan *Campos personalizados* y *Prioridad*) 🟡 |
| Problemas → Flujo | `/admin/procesos/problemas/flujo` | 8 | 8 🟢 |
| Problemas → Relaciones | `/admin/procesos/problemas/relaciones` | 6 | 6 🟢 |
| Cambios → Formulario | `/admin/procesos/cambios/formulario` | 7 | 7 🟢 |
| Cambios → Tipos y requisitos | `/admin/procesos/cambios/tipos-requisitos` | 4 | 4 🟢 |
| Cambios → Flujo evaluación | `/admin/procesos/cambios/flujo-evaluacion` | 8 | 8 🟢 |
| Cambios → Notificaciones y calendario | `/admin/procesos/cambios/notificaciones-calendario` | 6 | 6 🟢 |
| Activos → Tipos, modelos y atributos | `/admin/activos-config/tipos-modelos-atributos` | 9 | 9 🟢 |
| Activos → Ciclos de vida y transiciones | `/admin/activos-config/ciclos-vida-transiciones` | 6 | 6 🟢 |
| Activos → Licencias y contratos | `/admin/activos-config/licencias-contratos` | 6 | 6 🟢 |
| CMDB → CI y relaciones | `/admin/activos-config/cmdb-relaciones` | 6 | 6 🟢 |

> **Total: 25 de 27 pestañas** de configuración implementadas.

### PERFIL 2 — Técnico (`/tecnico/panel`) — 🟢

| Opción | Subopciones | Estado |
|---|---|---|
| 1 Mi trabajo | Panel, mis tareas, agenda/disponibilidad, desempeño | 🟢 |
| 2 Mesa de Servicio | Asignados, pendientes, área, registrar, búsqueda, historial, **incidente mayor (sala de crisis)** | 🟢 |
| 3 Seguimiento de SLA | Semáforo, objetivos de tiempo | 🟢 |
| 4 Gestión de Problemas | Asignados, grupo, nuevo, candidatos, KEDB | 🟢 |
| 5 Gestión de Cambios | Mis cambios, nuevo, implementación, calendario, impacto, historial | 🟢 |
| 6 Activos y CMDB | Inventario, mapa, mantenimiento, conteos, licencias | 🟢 |
| 7 Conocimiento | Base, mis artículos, crear, revisiones | 🟢 |
| 8 Catálogo (consulta) | `/tecnico/catalogo` | 🟢 |
| 9 Mi cuenta | Perfil, preferencias | 🟢 |

### PERFIL 3 — Solicitante (`/tickets`) — 🟢 con 🟡

| Opción | Subopciones | Estado |
|---|---|---|
| 1 Mesa de Servicio | Crear ticket, mis tickets, detalle `/tickets/[id]` (con **encuesta CSAT**) | 🟢 |
| 2 Catálogo de Servicios | Incidentes, solicitudes de servicio | 🟢 |
| 3 Gestión de Conocimiento | 3.1 Buscar/leer artículos · 3.2 Valorar utilidad | 🟡 (falta página de detalle `/conocimiento/[id]`; el voto sí funciona vía API) |
| 4 Mis activos | 4.1 Activos bajo custodia · 4.2 **Aceptar actas** · 4.3 Reportar problema con activo | 🟡 (falta API dedicada de aceptación) |
| 5 Avisos de servicio | `/avisos/mantenimientos` | 🟢 |
| 6 Mi cuenta | Perfil, preferencias | 🟢 |

### PERFIL 4 — Supervisor (`/supervisor/panel`) — 🟢

12 opciones / 56 ítems: Panel de supervisión (indicadores, alertas, accesos rápidos), Supervisión y despacho, Gestión de tickets, SLA (semáforo, objetivos, incumplimientos), Problemas (registro/asignación), Cambios (aprobaciones técnicas, calendario, impacto, programación), Activos (inventario, bajas, licencias), Conocimiento (base, revisión/publicación), Reportes del equipo (productividad), Mi equipo (vistas compartidas), Operación (eventos, resiliencia), Mi cuenta. **Todo implementado.**

### PERFIL 5 — Gestor de Área (`/gestor-area/panel`) — 🟢 con 🟡

9 opciones / 29 ítems: Panel del área, Mesa de servicio del área (registrar, departamento, colaboradores), Aprobaciones (solicitudes, cambios de negocio, historial, delegación), Catálogo, Cambios que afectan al área, Activos y contratos del área, Reportes, Conocimiento, Mi cuenta. **🟡 menor:** falta API dedicada `/api/area/colaboradores/autorizaciones`.

### PERFIL 6 — Auditor (`/auditor/panel`) — 🟢 con 🟡

7 opciones / 30 ítems: Panel de auditoría, Auditoría de tickets (todos, forense, **SoD**, muestreo), Auditoría del sistema (cambios de configuración, seguridad/autenticación, retención, perfiles, recertificación de accesos), Cumplimiento (historial/emergencias, cambios fuera de ventana, problemas/KEDB, SLA), Activos y licencias (inventario, cumplimiento, resultados CMDB, bajas), Reportes y evidencias, Mi cuenta. **🟡 menor:** falta `/api/auditor/evidencia`.

### PERFIL 7 — Aprobador / CAB (`/aprobador/panel`) — 🟢 con 🟡

9 opciones / 19 ítems: Panel, Aprobaciones pendientes (cambios, solicitudes, modelos estándar, bajas/renovaciones por monto, riesgo aceptado), CAB (dictamen colegiado, agenda/actas, ECAB), Calendario de cambios, Detalle de RFC, Historial, Delegaciones, Reportes, Mi cuenta. **🟡 menor:** no existe `PresentadorRfcAprobador.tsx` (el detalle se apoya en `VistaTicketGobernanza`).

### PERFIL 8 — Gestor de Cambios (`/gestor-cambios/panel`) — 🟢

10 opciones / 27 ítems: Panel, RFC (registrar, bandeja por evaluar, historial, detalle), Evaluación y autorización (etapas, reclasificación/excepciones), Programación e implementación (ventanas, programación, conflictos/capacidad, ejecución), CAB (presidencia, convocatoria/actas), PIR, Modelos de cambio estándar, Reglas de calendario (ventanas, congelamiento, feriados), Reportes, Mi cuenta. **Todo implementado.**

### PERFIL 9 — Gestor de Activos y Configuración (`/gestor-activos/panel`) — 🟢

8 opciones / 35 ítems: Panel, Inventario HAM (listado/ficha, alta/edición, importación masiva, etiquetas, recepción, asignación/custodia, mantenimiento/garantías, bajas/disposición, inventario físico), SAM (licencias/asignaciones, cumplimiento/sobreuso, catálogo de software), Proveedores y contratos (proveedores, contratos/cobertura, renovaciones), CMDB (mapa, relaciones, clases CI, actualizaciones desde cambios, calidad/auditoría, líneas base, inexactitudes), Catálogos (fabricantes/modelos, ubicaciones, listas auxiliares), Reportes, Mi cuenta. **Todo implementado.**

### PERFIL 10 — Gestor de Problemas (`/gestor-problemas/panel`) — 🟢 con 🟡

12 opciones / 18 ítems: Panel, Registro (registrar, **detalle**), Bandeja y asignación, Identificación proactiva (candidatos, recurrentes), Análisis de causa raíz, KEDB, Problemas mayores y revisión, Solicitudes de cambio derivadas, Conocimiento derivado, Objetivos de tiempo, Reportes, Mi cuenta. **🟡:** falta la página dedicada `/problemas/[id]` (el presentador `PresentadorProblemaGestor.tsx` sí existe y se usa en un modal).

---

## 4. Cobertura por marcos

### 4.1 ITIL 4 — 34 prácticas de gestión

| # | Práctica | Cobertura | Dónde vive en FlowDesk |
|---|---|---|---|
| **Gestión general** | | | |
| 1 | Architecture Management | 🔴 | — |
| 2 | Continual Improvement | 🟡 | Config. de procesos y reportes (no hay registro formal de mejoras/CSI) |
| 3 | Information Security Management | 🟡 | Logs de seguridad, auditoría, retención, RBAC, SoD (auditor); sin ISMS/riesgos de seguridad |
| 4 | Knowledge Management | 🟢 | Módulo Conocimiento (base, artículos, revisiones, gobierno) + KEDB |
| 5 | Measurement and Reporting | 🟢 | Reportes, tableros, diseñador de reportes, KPIs y SLA |
| 6 | Organizational Change Management | 🟡 | Organización, departamentos, colaboradores, ausencias |
| 7 | Portfolio Management | 🔴 | — |
| 8 | Project Management | 🔴 | — |
| 9 | Relationship Management | 🟡 | Proveedores/contratos; CSAT por ticket; sin gestión de stakeholders |
| 10 | Risk Management | 🟡 | Cuestionario de riesgo y matriz de autoridad de cambios; sin registro de riesgos |
| 11 | Service Financial Management | 🔴 | Costos en activos/contratos, pero sin presupuesto/costeo/facturación |
| 12 | Strategy Management | 🔴 | — |
| 13 | Supplier Management | 🟡 | Proveedores, contratos, renovaciones, evaluación 1–5 |
| 14 | Workforce and Talent Management | 🟡 | Técnicos, desempeño, agenda/ausencias; sin formación/talento |
| **Gestión de servicios** | | | |
| 15 | Availability Management | 🟡 | Operación/Resiliencia |
| 16 | Business Analysis | 🔴 | — |
| 17 | Capacity and Performance Management | 🟡 | Resiliencia/Capacidad |
| 18 | **Change Enablement** | 🟢 | Módulo Cambios completo + CAB/ECAB + PIR + modelos estándar |
| 19 | **Incident Management** | 🟢 | Mesa de servicio, incidentes mayores, escalamiento |
| 20 | **IT Asset Management** | 🟢 | HAM + SAM + ciclo de vida + bajas + licencias/contratos |
| 21 | Monitoring and Event Management | 🟡 | Operación/Eventos (sin descubrimiento/agentes) |
| 22 | **Problem Management** | 🟢 | Módulo Problemas completo + KEDB + causa raíz + mayores |
| 23 | Release Management | 🟡 | Se cubre vía Cambios/Implementación; sin módulo de release |
| 24 | **Service Catalogue Management** | 🟢 | Catálogo de servicios, tipos, SLAs, solicitudes |
| 25 | **Service Configuration Management** | 🟢 | CMDB: relaciones, líneas base, auditoría, actualizaciones desde cambios |
| 26 | Service Continuity Management | 🟡 | Resiliencia (sin BIA/planes de continuidad formales) |
| 27 | Service Design | 🟡 | Config. de servicios y SLAs |
| 28 | **Service Desk** | 🟢 | Mesa de servicio, bandejas, registro |
| 29 | **Service Level Management** | 🟢 | SLAs, objetivos, semáforos, incumplimientos |
| 30 | **Service Request Management** | 🟢 | Catálogo de solicitudes y aprobaciones |
| 31 | Service Validation and Testing | 🟡 | Planes de prueba en RFC y PIR |
| **Gestión técnica** | | | |
| 32 | Deployment Management | 🟡 | Implementación de cambios |
| 33 | Infrastructure and Platform Management | 🟡 | Inventario/CMDB/mantenimiento |
| 34 | Software Development and Management | 🔴 | — |

**Resumen ITIL 4:** 🟢 11 · 🟡 15 · 🔴 8. Las prácticas **nucleares del ITSM operativo están completas**; las ausencias son prácticas de gobierno corporativo (arquitectura, portafolio, proyecto, estrategia, finanzas de servicio, análisis de negocio, desarrollo de software) que exceden el alcance de una mesa de servicio.

> **Nota sobre las prácticas "financieras".** *Service Financial Management*, presupuesto, costeo de servicios, facturación/chargeback y depreciación **no corresponden a un ITSM**: en la práctica viven en el **ERP** de la organización. FlowDesk (ITSM) solo almacena los datos de costo, contrato y proveedor del activo como referencia; no lleva contabilidad ni activos fijos. Por eso esas prácticas se marcan como ausentes **por diseño**, no como carencia del producto.

### 4.2 ISO/IEC 20000-1:2018

| Tema | Cobertura | Nota |
|---|---|---|
| Sistema de gestión de servicios (SGS) | 🟡 | Gobernanza y auditoría presentes; sin política/objetivos formales del SGS |
| Gestión del catálogo y acuerdos (SLA) | 🟢 | Catálogo, SLAs, objetivos, incumplimientos |
| Gestión de relaciones y proveedores | 🟡 | Proveedores/contratos; evaluación de desempeño básica |
| Gestión de activos (citada como 8.2.5) | 🟢 | HAM/SAM completos |
| Gestión de la configuración (8.2.6) | 🟢 | CMDB con integridad, líneas base, auditoría |
| Presupuesto y demanda | 🔴 | Sin presupuesto ni gestión de demanda formales |
| Diseño, construcción y transición (8.5.2/8.5.3) | 🟡 | Cambios y transición cubiertos; diseño de servicio formal no |
| Gestión de cambios (8.5.1) | 🟢 | Completo con segregación, emergencias, PIR |
| Resolución y cumplimiento (8.6.x) | 🟢 | Incidentes, solicitudes y problemas (8.6.3) completos |
| Garantía de servicio (disponibilidad, continuidad, seguridad, capacidad) | 🟡 | Parcial vía Operación/Resiliencia y controles de seguridad |

### 4.3 ISO/IEC 27001:2022

| Control / tema | Cobertura | Nota |
|---|---|---|
| Inventario de activos (A.5.9) | 🟢 | HAM/SAM/CMDB |
| Uso aceptable (A.5.10) y devolución de activos (A.5.11) | 🟢 | Asignación, custodia, devolución, actas |
| Disposición segura / borrado (A.7.14, A.8.10) | 🟢 | Bajas con borrado seguro y evidencia |
| Propiedad intelectual / licencias (A.5.32) | 🟢 | SAM y cumplimiento |
| Control de accesos y perfiles | 🟢 | RBAC, perfiles, recertificación de accesos |
| Registro y monitoreo (logging) | 🟢 | Logs de seguridad, auditoría, retención |
| Gestión de riesgos de seguridad / ISMS | 🔴 | No hay módulo de riesgos ni tratamiento/SGS de seguridad |

### 4.4 ISO/IEC 19770-1 (SAM)

🟢 Cobertura **fuerte**: derechos vs. instalaciones, métricas de licencia, cumplimiento/sobreuso, umbral de riesgo, catálogo de software autorizado, asignación/liberación, renovaciones y alertas de vencimiento.

### 4.5 COBIT 2019

| Objetivo | Cobertura |
|---|---|
| BAI06 — Managed IT Changes | 🟢 |
| BAI07 — Managed IT Change Acceptance and Transitioning | 🟡 |
| BAI09 — Managed Assets | 🟢 |
| BAI10 — Managed Configuration | 🟢 |
| DSS03 — Managed Problems | 🟢 |
| DSS05 — Managed Security Services | 🟡 |
| MEA (monitorización/evaluación) | 🟡 |

---

## 5. Estado de las 3 áreas profundas frente a los prompts

Los 3 documentos (`prompt_1/2/3`) describen la configuración **desde el punto de vista del administrador** y fueron escritos en la arquitectura anterior. Se usaron como referencia de "qué debería existir". Resultado del contraste:

### 5.1 Gestión de Problemas (`prompt_1`)

| Pantalla de configuración | Pestañas especificadas | Implementadas |
|---|---|---|
| 1.3.3.1 Configuración de formulario | 6 | **4** (faltan *Campos personalizados* y *Prioridad*) |
| 1.3.3.2 Flujo de investigación y seguimiento | 8 | 8 |
| 1.3.3.3 Relación con incidentes, KEDB y conocimiento | 6 | 6 |

Pantallas operativas (bandejas, registro, análisis de causa raíz, mayores, KEDB, recurrentes, candidatos, RFC derivadas, conocimiento derivado, objetivos, reportes): **implementadas** (perfil 10 + Técnico).
**Brecha:** página dedicada `/problemas/[id]` (detalle del problema) — hoy se resuelve con un modal.

### 5.2 Gestión de Cambios (`prompt_2`)

| Pantalla de configuración | Pestañas especificadas | Implementadas |
|---|---|---|
| 1.3.4.1 Configuración de formulario | 7 | 7 |
| 1.3.4.2 Tipos de cambio y requisitos | 4 | 4 |
| 1.3.4.3 Flujo de evaluación, autorización y PIR | 8 | 8 |
| 1.3.4.4 Notificaciones y calendario | 6 | 6 |

Formulario de registro RFC, ticket RFC (10 pestañas), CAB/ECAB, modelos estándar, reglas de clasificación, conflictos/capacidad, PIR: **implementados**.
**Brecha:** `PresentadorRfcAprobador.tsx` (detalle de RFC para el Aprobador).

### 5.3 Activos y CMDB (`prompt_3`)

| Pantalla de configuración | Pestañas especificadas | Implementadas |
|---|---|---|
| 1.5.1 Tipos, modelos y atributos | 9 | 9 |
| 1.5.2 Ciclos de vida y transiciones | 6 | 6 |
| 1.5.3 Licencias y contratos | 6 | 6 |
| 1.5.4 CI y relaciones CMDB | 6 | 6 |

Formulario de activo/CI, ficha del activo (11 pestañas), importación masiva, inventario físico, etiquetas, bajas/disposición, SAM, contratos, CMDB (relaciones, integridad, atributos protegidos, líneas base, auditoría): **implementados**.
**Brecha:** `src/modules/activos/activosValidaciones.ts` (módulo de validaciones de activos). *(Descubrimiento automático, agentes de inventario e integración con sistemas contables externos —p. ej. un ERP, para depreciación y activos fijos— están **explícitamente fuera de alcance** del prompt. FlowDesk es un ITSM, no un ERP: registra los datos de costo/contrato del activo, pero no lleva contabilidad ni depreciación.)*

---

## 6. Brechas concretas (lista accionable)

| # | Perfil / área | Brecha | Tipo |
|---|---|---|---|
| 1 | Admin — Salud del sistema (4.2, 4.3) | Faltan *Tareas programadas* y *Cola de correo/notificaciones* (servicio + APIs) | 🔴 Ausente |
| 2 | Admin — Problemas → Formulario | Faltan pestañas *Campos personalizados* y *Prioridad* | 🟡 Parcial |
| 3 | Gestor de Problemas — Registro (2.2) | Falta página `/problemas/[id]` (detalle) | 🟡 Parcial |
| 4 | Solicitante — Conocimiento (3.1) | Falta página de detalle `/conocimiento/[id]` (el voto sí funciona) | 🟡 Parcial |
| 5 | Solicitante — Mis activos (4.2) | Falta API `/api/activos/mis-activos/aceptar` | 🟡 Parcial |
| 6 | Gestor de Área — Colaboradores (2.3) | Falta API `/api/area/colaboradores/autorizaciones` | 🟡 Parcial |
| 7 | Auditor — Reportes/evidencias (6.3) | Falta API `/api/auditor/evidencia` | 🟡 Parcial |
| 8 | Aprobador — Detalle de RFC (5) | Falta `PresentadorRfcAprobador.tsx` | 🟡 Parcial |
| 9 | Activos | Falta `src/modules/activos/activosValidaciones.ts` | 🟡 Parcial |
| 10 | Marco (ITIL 4 / ISO 20000) | Sin gestión financiera de servicios (presupuesto, costeo, facturación) | 🔴 Marco |
| 11 | Marco (ITIL 4) | Sin portafolio, proyecto, estrategia, arquitectura, análisis de negocio | 🔴 Marco |
| 12 | Marco (ITIL 4) | Sin registro formal de mejora continua (CSI) ni de riesgos | 🟡 Marco |
| 13 | Marco (ISO 27001) | Sin ISMS / tratamiento de riesgos de seguridad | 🔴 Marco |
| 14 | Marco (ITIL 4 / 20000) | Continuidad, capacidad y disponibilidad solo parciales | 🟡 Marco |
| 15 | Marco (ITIL 4) | Sin módulo de Release separado de Change | 🟡 Marco |

---

## 7. Recomendaciones priorizadas

1. **Cerrar las brechas operativas de bajo esfuerzo** (filas 2–9): son adaptaciones pequeñas, varias ya existen en otro módulo (p. ej. las pestañas *Campos personalizados* y *Prioridad* del módulo de Cambios se pueden portar a Problemas).
2. **Completar Salud del sistema** (4.2 tareas programadas y 4.3 cola de correo): cierra la única opción de menú totalmente ausente en el Administrador.
3. **Página de detalle de problema** `/problemas/[id]`: mejora la navegación y el enlazado profundo (hoy todo pasa por modales).
4. **Decidir alcance de gobierno**: si el proyecto quiere cubrir ITIL 4/ISO 20000 completos, faltaría añadir (a) gestión financiera de servicios, (b) registro de mejora continua y de riesgos, (c) gestión de continuidad/capacidad formal. Si el objetivo es una mesa de servicio ITSM operativa, la cobertura actual es **adecuada y muy superior a la media**.
5. **No implementar** descubrimiento automático ni agentes de inventario sin decisión explícita: están fuera de alcance por diseño.

---

*Informe generado a partir del estado real del código en el commit `1a9c7f3` y de la documentación del repositorio. No modifica código.*
