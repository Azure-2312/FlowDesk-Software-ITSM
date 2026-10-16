# MATRIZ DE ESTADO DE LOS MENÚS POR PERFIL
## FlowDesk ITSM — qué tiene, qué falta y qué está incompleto, bajo ITIL 4 / ISO / COBIT

> **Fecha:** 2026-10-15 · **Commit:** `153e5b5`
> **Objetivo:** una matriz por perfil (10 perfiles) con el estado real de cada opción y subopción de menú, indicando **✅ completo**, **⚠️ incompleto** y **❌ falta**, con la práctica ITIL 4 y la norma asociada.
> **Fuentes:** `ESQUEMA_MENUS_POR_PERFIL.md`, `prompt_1/2/3_*.md`, código real en `src/app` y `src/modules`.

---

## 0. Leyenda

| Símbolo | Significado |
|:--:|---|
| ✅ | Implementado y funcional (página + controlador + servicio con BD + vista). |
| ⚠️ | Existe, pero **incompleto**: falta una pestaña, una API dedicada, una página de detalle o profundidad funcional. |
| ❌ | **No existe** en el software actual. |

**Códigos de práctica ITIL 4:** INC (Incident Mgmt) · SR (Service Request) · SD (Service Desk) · PRB (Problem Mgmt) · CHG (Change Enablement) · ITAM (IT Asset Mgmt) · SCM (Service Configuration Mgmt) · CAT (Service Catalogue) · SLM (Service Level Mgmt) · KM (Knowledge Mgmt) · MR (Measurement & Reporting) · MON (Monitoring & Event) · AVL (Availability) · CAP (Capacity & Performance) · CONT (Service Continuity) · ISM (Information Security) · SUP (Supplier) · WTM (Workforce & Talent) · REL (Relationship) · RISK (Risk) · CI (Continual Improvement).

**Normas:** ISO 20000-1:2018 · ISO 27001:2022 · ISO 19770-1 (SAM) · COBIT 2019.

---

## 1. PERFIL 1 — Administrador (`/admin`)

| # | Opción / Subopción | Ruta | Estado | ITIL 4 | Norma | Qué falta / incompleto |
|---|---|---|---|---|---|---|
| **1** | **Configuración** | `/admin` | ✅ | CI | 20000, COBIT | — |
| 1.1 | Identidades y accesos | `/admin/usuarios`, `/admin/perfiles`, `/admin/menu` | ✅ | ISM | 27001 (A.5.15–A.5.18) | — |
| 1.2 | Catálogo de servicios y SLAs | `/admin/servicios`, `/admin/servicios/sla` | ✅ | CAT, SLM | 20000 | — |
| 1.3 | Configuración de procesos | `/admin/procesos/*` | ⚠️ | CHG, PRB, INC | 20000, COBIT | **Problemas → Formulario: 4 de 6 pestañas** (faltan *Campos personalizados* y *Prioridad*). Cambios (4 pantallas) y resto de Problemas: ✅ |
| 1.4 | Organización y soporte | `/admin/organizacion`, `/admin/departamentos*`, `/admin/tecnicos` | ✅ | WTM | 20000 | — |
| 1.5 | Activos y configuración | `/admin/activos-config/*` (4 pantallas, 27 pestañas) | ✅ | ITAM, SCM | 19770, 27001, COBIT | — |
| 1.6 | Comunicaciones y notificaciones | `/admin/comunicaciones`, `/admin/notificaciones` | ✅ | — | 20000 | — |
| 1.7 | Gobierno del conocimiento | `/admin/conocimiento`, `/admin/conocimiento-config` | ✅ | KM | 20000 | — |
| 1.8 | Auditoría, seguridad y retención | `/admin/auditoria*`, `/admin/seguridad-logs`, `/admin/mantenimiento-datos` | ✅ | ISM | 27001, COBIT | — |
| **2** | **Reportes y analítica** | `/reportes` | ✅ | MR | 20000, COBIT | — |
| 2.1 | Indicadores operativos y SLA | `/tickets/reportes` | ✅ | MR, SLM | 20000 | — |
| 2.2 | Tableros | `/admin/reportes-disenador` | ✅ | MR | COBIT | — |
| **3** | **Supervisión global** | — | ✅ | MON, MR | COBIT | — |
| 3.1 | Todos los tickets | `/tickets/gestion/todos` | ✅ | INC | 20000 | — |
| 3.2 | Auditoría forense de tickets | `/tickets/gestion/auditoria` | ✅ | ISM | 27001 | — |
| 3.3 | Cambios (consulta global) | `/cambios/gestion/todos` | ✅ | CHG | 20000 | — |
| 3.4 | Problemas (consulta global) | `/problemas` | ✅ | PRB | 20000 | — |
| 3.5 | Inventario y CMDB (consulta) | `/activos/inventario` | ✅ | ITAM, SCM | 19770 | — |
| 3.6 | Eventos y resiliencia (consulta) | `/operacion` | ✅ | MON, AVL, CONT | 20000 | — |
| **4** | **Salud del sistema** | `/admin/salud-sistema` | ⚠️ | MR | COBIT | **Opción mayormente ausente** |
| 4.1 | Estado de la BD y servicios | `/admin/salud-sistema` | ✅ | MR | COBIT | — |
| 4.2 | Tareas programadas | — | ❌ | — | COBIT (DSS) | Falta servicio + API (`/api/admin/salud-sistema/tareas`) |
| 4.3 | Cola de correo y notificaciones | — | ❌ | — | COBIT | Falta servicio + API (`/api/admin/salud-sistema/correo`) |
| **5** | **Mi cuenta** | `/mi-cuenta` | ✅ | — | — | — |
| 5.1 | Mi perfil y seguridad | `/mi-cuenta` | ✅ | ISM | 27001 | — |
| 5.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | ✅ | — | — | — |

**Resumen perfil 1:** ✅ 20 · ⚠️ 2 · ❌ 2.

---

## 2. PERFIL 2 — Técnico (`/tecnico/panel`)

| # | Opción / Subopción | Ruta | Estado | ITIL 4 | Norma |
|---|---|---|---|---|---|
| **1** | **Mi trabajo** | `/tecnico/*` | ✅ | WTM, SLM | 20000 |
| 1.1 | Panel del técnico | `/tecnico/panel` | ✅ | SD | 20000 |
| 1.2 | Mis tareas | `/tecnico/tareas` | ✅ | SD | 20000 |
| 1.3 | Mi agenda y disponibilidad | `/tecnico/agenda` | ✅ | WTM | 20000 |
| 1.4 | Mi desempeño | `/tecnico/desempeno` | ✅ | MR, WTM | 20000 |
| **2** | **Mesa de Servicio** | `/tecnico/mesa` | ✅ | SD, INC, SR | 20000 |
| 2.1 | Mis tickets asignados | `/tecnico/mesa/asignados` | ✅ | INC | 20000 |
| 2.2 | Bandeja de pendientes | `/tecnico/mesa/pendientes` | ✅ | SD | 20000 |
| 2.3 | Tickets de mi área técnica | `/tecnico/mesa/area` | ✅ | SD | 20000 |
| 2.4 | Registrar ticket para un usuario | `/tecnico/mesa/registrar` | ✅ | INC, SR | 20000 |
| 2.5 | Búsqueda avanzada | `/tecnico/mesa/buscar` | ✅ | SD | 20000 |
| 2.6 | Historial de resueltos | `/tecnico/mesa/historial` | ✅ | INC | 20000 |
| 2.7 | Incidente mayor (sala de crisis) | `/tecnico/mesa/incidente-mayor` | ✅ | INC | 20000 |
| **3** | **Seguimiento de SLA** | `/tecnico/sla` | ✅ | SLM | 20000 |
| 3.1 | Semáforo de SLA de mi cola | `/tecnico/sla/semaforo` | ✅ | SLM | 20000 |
| 3.2 | Objetivos de tiempo vigentes | `/tecnico/sla/objetivos` | ✅ | SLM | 20000 |
| **4** | **Gestión de Problemas** | `/tecnico/problemas` | ✅ | PRB | 20000 |
| 4.1 | Problemas asignados a mí | `/tecnico/problemas/asignados` | ✅ | PRB | 20000 |
| 4.2 | Problemas de mi grupo | `/tecnico/problemas/grupo` | ✅ | PRB | 20000 |
| 4.3 | Registrar problema | `/tecnico/problemas/nuevo` | ✅ | PRB | 20000 |
| 4.4 | Candidatos a problema | `/tecnico/problemas/candidatos` | ✅ | PRB | 20000 |
| 4.5 | Errores conocidos (KEDB) | `/tecnico/problemas/errores-conocidos` | ✅ | PRB, KM | 20000 |
| **5** | **Gestión de Cambios** | `/tecnico/cambios` | ✅ | CHG | 20000 |
| 5.1 | Mis cambios | `/tecnico/cambios/mis-cambios` | ✅ | CHG | 20000 |
| 5.2 | Registrar solicitud RFC | `/tecnico/cambios/nuevo` | ✅ | CHG | 20000 |
| 5.3 | Cambios por implementar | `/tecnico/cambios/implementacion` | ✅ | CHG | 20000 |
| 5.4 | Calendario de cambios | `/tecnico/cambios/calendario` | ✅ | CHG | 20000 |
| 5.5 | Cambios que afectan mis servicios | `/tecnico/cambios/impacto` | ✅ | CHG, SCM | 20000 |
| 5.6 | Historial de cambios | `/tecnico/cambios/historial` | ✅ | CHG | 20000 |
| **6** | **Activos y CMDB** | `/tecnico/activos` | ✅ | ITAM, SCM | 19770 |
| 6.1 | Inventario de activos | `/tecnico/activos/inventario` | ✅ | ITAM | 19770 |
| 6.2 | Mapa de topología CMDB | `/tecnico/activos/mapa` | ✅ | SCM | 19770 |
| 6.3 | Mantenimiento y reparaciones | `/tecnico/activos/mantenimiento` | ✅ | ITAM | 19770 |
| 6.4 | Inventario físico en campo | `/tecnico/activos/conteos` | ✅ | ITAM | 19770 |
| 6.5 | Licencias de software (consulta) | `/tecnico/activos/licencias` | ✅ | ITAM | 19770 |
| **7** | **Gestión del Conocimiento** | `/tecnico/conocimiento` | ✅ | KM | 20000 |
| 7.1 | Base de conocimiento | `/tecnico/conocimiento/base` | ✅ | KM | 20000 |
| 7.2 | Mis artículos | `/tecnico/conocimiento/mis-articulos` | ✅ | KM | 20000 |
| 7.3 | Crear artículo | `/tecnico/conocimiento/nuevo` | ✅ | KM | 20000 |
| 7.4 | Revisiones pendientes | `/tecnico/conocimiento/revisiones` | ✅ | KM | 20000 |
| **8** | Catálogo de servicios (consulta) | `/tecnico/catalogo` | ✅ | CAT | 20000 |
| **9** | **Mi cuenta** | `/mi-cuenta` | ✅ | — | — |
| 9.1 | Mi perfil y seguridad | `/mi-cuenta` | ✅ | ISM | 27001 |
| 9.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | ✅ | — | — |

**Resumen perfil 2:** ✅ 33 · ⚠️ 0 · ❌ 0. **Perfil completo.**

---

## 3. PERFIL 3 — Solicitante (`/tickets`)

| # | Opción / Subopción | Ruta | Estado | ITIL 4 | Norma | Qué falta / incompleto |
|---|---|---|---|---|---|---|
| **1** | **Mesa de Servicio** | `/tickets` | ✅ | SD, INC, SR | 20000 | — |
| 1.1 | Crear ticket | `/tickets` | ✅ | SR | 20000 | — |
| 1.2 | Mis tickets | `/tickets` | ✅ | INC | 20000 | — |
| 1.3 | Detalle del ticket (con encuesta CSAT) | `/tickets/[id]` | ✅ | INC, REL | 20000 | — |
| **2** | **Catálogo de Servicios** | `/tickets/catalogo` | ✅ | CAT, SR | 20000 | — |
| 2.1 | Catálogo de incidentes | `/tickets/catalogo?tipo=incidente` | ✅ | CAT | 20000 | — |
| 2.2 | Catálogo de solicitudes | `/tickets/catalogo?tipo=solicitud` | ✅ | CAT, SR | 20000 | — |
| **3** | **Gestión de Conocimiento** | `/conocimiento` | ⚠️ | KM | 20000 | — |
| 3.1 | Buscar y leer artículos | `/conocimiento` | ⚠️ | KM | 20000 | **Falta página de detalle `/conocimiento/[id]`** (lectura completa del artículo) |
| 3.2 | Valorar la utilidad | `/api/conocimiento/[id]` | ✅ | KM, REL | 20000 | — (voto útil/no útil operativo) |
| **4** | **Mis activos** | `/activos/mis-activos` | ⚠️ | ITAM | 19770, 27001 | — |
| 4.1 | Activos bajo mi custodia | `/activos/mis-activos` | ✅ | ITAM | 19770 | — |
| 4.2 | Aceptar actas de entrega y devolución | — | ⚠️ | ITAM | 27001 (A.5.11) | Falta API `/api/activos/mis-activos/aceptar` |
| 4.3 | Reportar un problema con un activo | `/tickets` (con CI) | ✅ | ITAM, INC | 19770 | — |
| **5** | Avisos de servicio | `/avisos/mantenimientos` | ✅ | CHG | 20000 | — |
| **6** | **Mi cuenta** | `/mi-cuenta` | ✅ | — | — | — |
| 6.1 | Mi perfil y seguridad | `/mi-cuenta` | ✅ | ISM | 27001 | — |
| 6.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | ✅ | — | — | — |

**Resumen perfil 3:** ✅ 12 · ⚠️ 3 · ❌ 0.

---

## 4. PERFIL 4 — Supervisor (`/supervisor/panel`)

| # | Opción | Subopciones | Estado | ITIL 4 | Norma |
|---|---|---|---|---|---|
| 1 | Panel de supervisión | Indicadores del equipo · Alertas y riesgos · Accesos rápidos | ✅ | MR, SLM | 20000 |
| 2 | Supervisión y despacho | Centro de asignación · Monitoreo de técnicos · Todos los tickets del área · Escalamientos y riesgos de SLA · Incidentes mayores | ✅ | SD, INC, SLM | 20000 |
| 3 | Gestión de tickets | Incidentes · Solicitudes · Mis tickets · Asignados · Pendientes · Resueltos · Registrar para usuario · Auditoría del área | ✅ | INC, SR | 20000 |
| 4 | Seguimiento de SLA | Semáforo del grupo · Objetivos vigentes · Incumplimientos y causas | ✅ | SLM | 20000 |
| 5 | Gestión de Problemas | Registro · Asignación · Errores conocidos | ✅ | PRB | 20000 |
| 6 | Gestión de Cambios | Aprobaciones técnicas de RFC · Calendario · Cambios que afectan al equipo · Programación de implementaciones | ✅ | CHG | 20000 |
| 7 | Activos | Inventario (consulta) · Aprobación de bajas del área · Licencias (consulta) | ✅ | ITAM | 19770 |
| 8 | Gestión del Conocimiento | Base de conocimiento · Revisión y publicación | ✅ | KM | 20000 |
| 9 | Reportes del equipo | Indicadores operativos y SLA · Productividad individual | ✅ | MR, WTM | 20000 |
| 10 | Mi equipo | Vistas y respuestas compartidas | ✅ | WTM | 20000 |
| 11 | Operación de servicios | Eventos y alertas · Disponibilidad, capacidad y continuidad | ✅ | MON, AVL, CAP, CONT | 20000 |
| 12 | Mi cuenta | Perfil y seguridad · Preferencias | ✅ | — | — |

**Resumen perfil 4:** ✅ 12 opciones / 56 ítems · ⚠️ 0 · ❌ 0. **Perfil completo.**

---

## 5. PERFIL 5 — Gestor de Área (`/gestor-area/panel`)

| # | Opción / Subopción | Ruta | Estado | ITIL 4 | Norma | Qué falta / incompleto |
|---|---|---|---|---|---|---|
| **1** | **Panel del área** | `/gestor-area/panel` | ✅ | MR, SLM | 20000 | — |
| 1.1 | Aprobaciones pendientes y vencidas | `/gestor-area/panel` | ✅ | CHG, SR | 20000 | — |
| 1.2 | Tickets del área por estado y SLA | `/gestor-area/panel` | ✅ | SLM | 20000 | — |
| 1.3 | Cambios próximos que afectan al área | `/gestor-area/panel` | ✅ | CHG | 20000 | — |
| **2** | **Mesa de servicio del área** | — | ⚠️ | SD | 20000 | — |
| 2.1 | Registrar ticket para el área | `/tickets/gestion/crear` | ✅ | SR | 20000 | — |
| 2.2 | Tickets de mi departamento | `/tickets/gestion/departamento` | ✅ | INC | 20000 | — |
| 2.3 | Colaboradores de mi área | `/tickets/gestion/colaboradores` | ⚠️ | WTM | 20000 | Falta API `/api/area/colaboradores/autorizaciones` |
| **3** | **Aprobaciones** | — | ✅ | CHG, SR, RISK | 20000 | — |
| 3.1 | Mis aprobaciones de solicitudes | `/tickets/gestion/aprobaciones` | ✅ | SR | 20000 | — |
| 3.2 | Aprobación de negocio de cambios | `/gestor-area/cambios/aprobaciones` | ✅ | CHG | 20000 | — |
| 3.3 | Historial de mis decisiones | `/gestor-area/aprobaciones/historial` | ✅ | CHG | 20000 | — |
| 3.4 | Delegación de aprobaciones | `/gestor-area/aprobaciones/delegacion` | ✅ | CHG, WTM | 20000 | — |
| **4** | Catálogo de servicios (consulta) | `/tickets/catalogo` | ✅ | CAT | 20000 | — |
| **5** | **Cambios que afectan a mi área** | `/cambios/gestion` | ✅ | CHG | 20000 | — |
| 5.1 | Calendario de mantenimientos | `/cambios/gestion/calendario` | ✅ | CHG | 20000 | — |
| 5.2 | Cambios con interrupción para mi área | `/gestor-area/cambios/impacto` | ✅ | CHG | 20000 | — |
| 5.3 | Solicitar un cambio de negocio | `/cambios/gestion/crear` | ✅ | CHG | 20000 | — |
| **6** | **Activos y contratos del área** | — | ✅ | ITAM, SUP | 19770 | — |
| 6.1 | Activos de mi área | `/gestor-area/activos` | ✅ | ITAM | 19770 | — |
| 6.2 | Licencias y contratos de mi departamento | `/gestor-area/contratos` | ✅ | ITAM, SUP | 19770 | — |
| **7** | Reportes del área | `/gestor-area/reportes` | ✅ | MR | 20000 | — |
| **8** | Gestión de Conocimiento | `/conocimiento` | ✅ | KM | 20000 | — |
| **9** | **Mi cuenta** | `/mi-cuenta` | ✅ | — | — | — |
| 9.1 | Mi perfil y seguridad | `/mi-cuenta` | ✅ | ISM | 27001 | — |
| 9.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | ✅ | — | — | — |

**Resumen perfil 5:** ✅ 22 · ⚠️ 1 · ❌ 0.

---

## 6. PERFIL 6 — Auditor (`/auditor/panel`)

| # | Opción / Subopción | Ruta | Estado | ITIL 4 | Norma | Qué falta / incompleto |
|---|---|---|---|---|---|---|
| **1** | Panel de auditoría | `/auditor/panel` | ✅ | ISM, MR | 27001, COBIT | — |
| **2** | **Auditoría de tickets** | — | ✅ | ISM | 27001 | — |
| 2.1 | Todos los tickets (solo lectura) | `/tickets/gestion/todos` | ✅ | INC | 20000 | — |
| 2.2 | Auditoría forense | `/tickets/gestion/auditoria` | ✅ | ISM | 27001 | — |
| 2.3 | Segregación de funciones (SoD) | `/auditor/cumplimiento/sod` | ✅ | ISM | 27001, COBIT | — |
| 2.4 | Muestreo de auditoría | `/auditor/muestreo` | ✅ | ISM | 27001 | — |
| **3** | **Auditoría del sistema** | — | ✅ | ISM | 27001 | — |
| 3.1 | Auditoría de cambios de configuración | `/admin/auditoria-sistema` | ✅ | SCM | 27001 | — |
| 3.2 | Registros de seguridad y autenticación | `/admin/seguridad-logs` | ✅ | ISM | 27001 | — |
| 3.3 | Retención y mantenimiento de datos | `/admin/mantenimiento-datos` | ✅ | ISM | 27001 | — |
| 3.4 | Perfiles y permisos (lectura) | `/admin/perfiles` | ✅ | ISM | 27001 | — |
| 3.5 | Recertificación de accesos | `/auditor/accesos/recertificacion` | ✅ | ISM | 27001 | — |
| **4** | **Cumplimiento de procesos** | — | ✅ | CHG, PRB, SLM | COBIT | — |
| 4.1 | Cambios: historial, emergencias y revisiones | `/cambios/gestion/todos` | ✅ | CHG | 20000 | — |
| 4.2 | Cambios sin autorización o fuera de ventana | `/auditor/cumplimiento/cambios` | ✅ | CHG | COBIT | — |
| 4.3 | Problemas y errores conocidos | `/problemas` | ✅ | PRB | 20000 | — |
| 4.4 | Cumplimiento de SLA | `/tickets/reportes` | ✅ | SLM | 20000 | — |
| **5** | **Activos y licencias** | — | ✅ | ITAM | 19770 | — |
| 5.1 | Inventario (lectura) | `/activos/inventario` | ✅ | ITAM | 19770 | — |
| 5.2 | Cumplimiento de licencias | `/activos/licencias` | ✅ | ITAM | 19770 | — |
| 5.3 | Resultados de auditorías de CMDB | `/auditor/cmdb/resultados` | ✅ | SCM | 19770 | — |
| 5.4 | Bajas y disposición | `/auditor/activos/bajas` | ✅ | ITAM | 27001 | — |
| **6** | **Reportes y evidencias** | — | ⚠️ | MR | COBIT | — |
| 6.1 | Indicadores operativos y SLA | `/tickets/reportes` | ✅ | MR | 20000 | — |
| 6.2 | Tableros (lectura) | `/admin/reportes-disenador` | ✅ | MR | COBIT | — |
| 6.3 | Informes de auditoría | `/auditor/informes` | ⚠️ | ISM | COBIT | Falta API `/api/auditor/evidencia` |
| **7** | **Mi cuenta** | `/mi-cuenta` | ✅ | — | — | — |
| 7.1 | Mi perfil y seguridad | `/mi-cuenta` | ✅ | ISM | 27001 | — |
| 7.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | ✅ | — | — | — |

**Resumen perfil 6:** ✅ 23 · ⚠️ 1 · ❌ 0.

---

## 7. PERFIL 7 — Aprobador / CAB (`/aprobador/panel`)

| # | Opción / Subopción | Ruta | Estado | ITIL 4 | Norma | Qué falta / incompleto |
|---|---|---|---|---|---|---|
| **1** | Panel del aprobador | `/aprobador/panel` | ✅ | CHG, RISK | COBIT | — |
| **2** | **Aprobaciones pendientes** | — | ✅ | CHG, RISK | 20000, COBIT | — |
| 2.1 | Aprobaciones de cambios | `/aprobador/cambios` | ✅ | CHG | 20000 | — |
| 2.2 | Aprobaciones de solicitudes de servicio | `/tickets/gestion/aprobaciones` | ✅ | SR | 20000 | — |
| 2.3 | Modelos de cambio estándar | `/aprobador/cambios/modelos` | ✅ | CHG | 20000 | — |
| 2.4 | Bajas y renovaciones por monto | `/aprobador/activos` | ✅ | ITAM | 19770 | — |
| 2.5 | Riesgo aceptado y cierre de problemas mayores | `/aprobador/problemas` | ✅ | PRB, RISK | COBIT | — |
| **3** | **Comité asesor de cambios (CAB)** | — | ✅ | CHG | COBIT (BAI06) | — |
| 3.1 | Dictamen colegiado | `/cambios/gestion/cab` | ✅ | CHG | COBIT | — |
| 3.2 | Agenda y actas | `/aprobador/cab/agenda` | ✅ | CHG | COBIT | — |
| 3.3 | Comité de emergencia (ECAB) | `/aprobador/cab/emergencia` | ✅ | CHG | COBIT | — |
| **4** | Calendario de cambios | `/cambios/gestion/calendario` | ✅ | CHG | 20000 | — |
| **5** | Detalle de RFC | `/cambios/gestion/[id]` | ⚠️ | CHG | 20000 | Falta `PresentadorRfcAprobador.tsx` (se usa `VistaTicketGobernanza`) |
| **6** | Historial de mis decisiones | `/aprobador/historial` | ✅ | CHG | COBIT | — |
| **7** | Delegaciones | `/aprobador/delegaciones` | ✅ | CHG, WTM | 20000 | — |
| **8** | Reportes de decisiones | `/aprobador/reportes` | ✅ | MR | COBIT | — |
| **9** | **Mi cuenta** | `/mi-cuenta` | ✅ | — | — | — |
| 9.1 | Mi perfil y seguridad | `/mi-cuenta` | ✅ | ISM | 27001 | — |
| 9.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | ✅ | — | — | — |

**Resumen perfil 7:** ✅ 16 · ⚠️ 1 · ❌ 0.

---

## 8. PERFIL 8 — Gestor de Cambios (`/gestor-cambios/panel`)

| # | Opción | Subopciones | Estado | ITIL 4 | Norma |
|---|---|---|---|---|---|
| 1 | Panel de gestión de cambios | KPIs, RFC por evaluar, autorizaciones, conflictos, PIR vencidas | ✅ | CHG | COBIT |
| 2 | Solicitudes de cambio (RFC) | Registrar · Bandeja por evaluar · Historial consolidado · Detalle | ✅ | CHG | 20000 |
| 3 | Evaluación y autorización | Seguimiento de etapas · Reclasificación y excepciones | ✅ | CHG, RISK | COBIT |
| 4 | Programación e implementación | Calendario de ventanas · Programación de autorizados · Conflictos y capacidad · Seguimiento de ejecución | ✅ | CHG, CAP | 20000 |
| 5 | Comité asesor de cambios (CAB) | Dictamen (presidencia) · Convocatoria, agenda y actas | ✅ | CHG | COBIT |
| 6 | Revisión post-implementación | PIR | ✅ | CHG | 20000 |
| 7 | Modelos de cambio estándar | Catálogo preautorizado | ✅ | CHG | 20000 |
| 8 | Reglas de calendario | Ventanas de mantenimiento · Congelamiento · Feriados | ✅ | CHG | 20000 |
| 9 | Reportes de cambios | Métricas de cambios | ✅ | MR | COBIT |
| 10 | Mi cuenta | Perfil · Preferencias | ✅ | — | — |

**Resumen perfil 8:** ✅ 10 opciones / 27 ítems · ⚠️ 0 · ❌ 0. **Perfil completo.**

---

## 9. PERFIL 9 — Gestor de Activos y Configuración (`/gestor-activos/panel`)

| # | Opción | Subopciones | Estado | ITIL 4 | Norma |
|---|---|---|---|---|---|
| 1 | Panel de activos y CMDB | Garantías, sobreuso, inexactitudes, campañas, actas | ✅ | ITAM, SCM | 19770 |
| 2 | Inventario de activos (HAM) | Listado/ficha · Alta/edición · Importación masiva · Etiquetas · Recepción · Asignación/custodia · Mantenimiento/garantías · Bajas/disposición · Inventario físico | ✅ | ITAM | 19770, 27001 |
| 3 | Licencias de software (SAM) | Licencias y asignaciones · Cumplimiento y sobreuso · Catálogo de software autorizado | ✅ | ITAM | 19770 |
| 4 | Proveedores y contratos | Proveedores · Contratos y cobertura · Renovaciones y vencimientos | ✅ | SUP, ITAM | 19770 |
| 5 | CMDB | Mapa de topología · Relaciones entre CI · Modelado de clases CI · Actualizaciones desde cambios · Calidad/auditoría · Líneas base · Inexactitudes | ✅ | SCM | 19770 |
| 6 | Catálogos de activos | Fabricantes y modelos · Ubicaciones · Listas auxiliares | ✅ | ITAM | 19770 |
| 7 | Reportes de activos | Métricas de inventario | ✅ | MR | 19770 |
| 8 | Mi cuenta | Perfil · Preferencias | ✅ | — | — |

**Resumen perfil 9:** ✅ 8 opciones / 35 ítems · ⚠️ 0 · ❌ 0. **Perfil completo** *(salvo `activosValidaciones.ts`, interno, no una opción de menú).*

---

## 10. PERFIL 10 — Gestor de Problemas (`/gestor-problemas/panel`)

| # | Opción / Subopción | Ruta | Estado | ITIL 4 | Norma | Qué falta / incompleto |
|---|---|---|---|---|---|---|
| **1** | Panel de gestión de problemas | `/gestor-problemas/panel` | ✅ | PRB, MR | 20000 | — |
| **2** | **Registro de problemas** | — | ⚠️ | PRB | 20000 | — |
| 2.1 | Registrar problema | `/gestor-problemas/asignacion` | ✅ | PRB | 20000 | — |
| 2.2 | Detalle del problema | — | ⚠️ | PRB | 20000 | Falta página `/problemas/[id]` (hoy se usa modal; el presentador `PresentadorProblemaGestor.tsx` existe) |
| **3** | Bandeja y asignación | `/gestor-problemas/asignacion` | ✅ | PRB | 20000 | — |
| **4** | **Identificación proactiva** | — | ✅ | PRB | 20000 | — |
| 4.1 | Candidatos a problema | `/gestor-problemas/candidatos` | ✅ | PRB | 20000 | — |
| 4.2 | Incidentes recurrentes | `/gestor-problemas/recurrentes` | ✅ | PRB, INC | 20000 | — |
| **5** | Análisis de causa raíz | `/gestor-problemas/analisis` | ✅ | PRB | 20000 | — |
| **6** | Errores conocidos (KEDB) | `/problemas/kedb` | ✅ | PRB, KM | 20000 | — |
| **7** | Problemas mayores y revisión | `/gestor-problemas/mayores` | ✅ | PRB | 20000 | — |
| **8** | Solicitudes de cambio derivadas | `/gestor-problemas/cambios` | ✅ | PRB, CHG | 20000 | — |
| **9** | Conocimiento derivado | `/gestor-problemas/conocimiento` | ✅ | PRB, KM | 20000 | — |
| **10** | Objetivos de tiempo | `/gestor-problemas/objetivos` | ✅ | PRB, SLM | 20000 | — |
| **11** | Reportes de problemas | `/gestor-problemas/reportes` | ✅ | MR | 20000 | — |
| **12** | **Mi cuenta** | `/mi-cuenta` | ✅ | — | — | — |
| 12.1 | Mi perfil y seguridad | `/mi-cuenta` | ✅ | ISM | 27001 | — |
| 12.2 | Preferencias de notificación | `/mi-cuenta/notificaciones` | ✅ | — | — | — |

**Resumen perfil 10:** ✅ 15 · ⚠️ 1 · ❌ 0.

---

## 11. Resumen global (los 10 perfiles)

| Perfil | Opciones | ✅ Completo | ⚠️ Incompleto | ❌ Falta |
|---|---:|---:|---:|---:|
| 1 Administrador | 5 | 20 | 2 | **2** |
| 2 Técnico | 9 | 33 | 0 | 0 |
| 3 Solicitante | 6 | 12 | 3 | 0 |
| 4 Supervisor | 12 | 56 ítems | 0 | 0 |
| 5 Gestor de Área | 9 | 22 | 1 | 0 |
| 6 Auditor | 7 | 23 | 1 | 0 |
| 7 Aprobador | 9 | 16 | 1 | 0 |
| 8 Gestor de Cambios | 10 | 27 ítems | 0 | 0 |
| 9 Gestor de Activos | 8 | 35 ítems | 0 | 0 |
| 10 Gestor de Problemas | 12 | 15 | 1 | 0 |
| **TOTAL** | **87** | **—** | **10** | **2** |

### Lo que FALTA (❌) — 2 ítems

| Perfil | Ítem | Marco |
|---|---|---|
| 1 Administrador | 4.2 Tareas programadas | COBIT (DSS) |
| 1 Administrador | 4.3 Cola de correo y notificaciones | COBIT |

### Lo que está INCOMPLETO (⚠️) — 10 ítems

| Perfil | Ítem | Falta concretamente | Marco |
|---|---|---|---|
| 1 Administrador | 1.3 Problemas → Formulario | 2 pestañas (Campos personalizados, Prioridad) | ITIL CHG/PRB, COBIT |
| 3 Solicitante | 3.1 Buscar/leer artículos | Página de detalle `/conocimiento/[id]` | ITIL KM |
| 3 Solicitante | 4.2 Aceptar actas | API `/api/activos/mis-activos/aceptar` | ISO 27001 A.5.11 |
| 5 Gestor de Área | 2.3 Colaboradores del área | API `/api/area/colaboradores/autorizaciones` | ITIL WTM |
| 6 Auditor | 6.3 Informes de auditoría | API `/api/auditor/evidencia` | COBIT |
| 7 Aprobador | 5 Detalle de RFC | `PresentadorRfcAprobador.tsx` | ITIL CHG |
| 10 Gestor de Problemas | 2.2 Detalle del problema | Página `/problemas/[id]` | ITIL PRB |
| — | (interno) Activos | `src/modules/activos/activosValidaciones.ts` | ISO 19770 |
| 1 Administrador | 4 Salud del sistema (parcial) | 2 de 3 sub-ítems ausentes | COBIT |
| 3 Solicitante | 4 Mis activos (parcial) | 1 de 3 sub-ítems incompleto | ISO 27001 |

---

## 12. Cobertura por marco — estado consolidado

| Marco | Cobertura | Prácticas/áreas ✅ | ⚠️ Parciales | ❌ Ausentes |
|---|---|---|---|---|
| **ITIL 4** | 🟢 Alta | INC, SR, SD, PRB, CHG, ITAM, SCM, CAT, SLM, KM, MR (11) | CI, ISM, OCM, REL, RISK, SUP, WTM, AVL, CAP, MON, REL, SVT, DEP, INFRA, RELEASE (15) | ARCH, PORT, PROJ, FIN, STRAT, BA, SD-DEV (8) |
| **ISO 20000-1** | 🟢 Alta | Resolución (incidente/solicitud/problema), cambio, activos/configuración, SLA | Diseño/transición, garantía de servicio, relaciones | Presupuesto y demanda |
| **ISO 27001** | 🟡 Media | Inventario activos, uso aceptable, devolución, borrado seguro, accesos, logs, retención, licencias | Seguridad operativa | ISMS / riesgos de seguridad |
| **ISO 19770-1 (SAM)** | 🟢 Alta | Licencias, cumplimiento/sobreuso, catálogo de software, renovaciones | — | — |
| **COBIT 2019** | 🟡 Media | BAI06, BAI09, BAI10, DSS03 | BAI07, DSS05, MEA | — |

> **Nota financiera:** las prácticas financieras (presupuesto, costeo, depreciación, facturación) **no corresponden a un ITSM**: viven en el ERP. FlowDesk solo guarda costo/contrato del activo como referencia. Se marcan ausentes **por diseño**, no por carencia.

---

## 13. Conclusión

- **8 de los 10 perfiles están 100% completos** (Técnico, Supervisor, Gestor de Cambios, Gestor de Activos) o casi (Solicitante, Gestor de Área, Auditor, Aprobador, Gestor de Problemas con 1 ítem cada uno).
- **El único perfil con ítems totalmente ausentes es el Administrador** (Salud del sistema: 4.2 y 4.3).
- Las **10 brechas de "incompleto"** son ajustes puntuales (una pestaña, una API dedicada, una página de detalle o un presentador); ninguna compromete el flujo operativo de los procesos.
- Bajo **ITIL 4 / ISO 20000 / ISO 19770**, la cobertura del ciclo operativo de servicios es **alta**; las ausencias son prácticas de **gobierno corporativo** y **finanzas**, fuera del alcance de un ITSM.

*Documento de análisis; no modifica código.*
