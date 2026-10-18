# Plan de Trabajo — 5 Integrantes sobre los 16 Módulos Libres

**Documento operativo.** Reparte los **16 módulos sin cruces** entre los 5 integrantes.
Cada persona recibe módulos 100 % independientes (no importan ni son importados por
otro módulo), de modo que puede trabajar su carpeta completa sin colisionar con nadie.

> **Fuera de alcance de este reparto (los trabaja el responsable del núcleo):**
> `tickets`, `incidentes`, `solicitudes`, `cambios`, `problemas`, `seguridad` y
> `plataforma` tienen cruces y no se asignan aquí.

Complementa a `DOCUMENTACIÓN/ARQUITECTURA_MODULAR_Y_CONTRATOS.md` (reglas de contrato e
importación) y a `DISTRIBUCION_EQUIPO_Y_METODOLOGIA_SCRUM.md` (plan Scrum).

**Regla de oro:** entre módulos **solo** se importa desde el contrato
`@/modules/<modulo>` (y `@/modules/<modulo>/ui` para componentes de cliente). Nunca rutas
profundas. Antes de commitear: `npx tsc --noEmit` y `npm run build` en verde.

---

## Matriz de separación de trabajos — módulos × integrante

| Módulo (libre, sin cruces) | Archivos | Persona 1<br>Miguel | Persona 2<br>Lourdes | Persona 3<br>Alexis | Persona 4<br>Nain | Persona 5<br>Junior |
| :--- | --: | :--: | :--: | :--: | :--: | :--: |
| `servicios` | 16 | **X** | | | | |
| `operacion` | 10 | **X** | | | | |
| `supervisor` | 20 | **X** | | | | |
| `aprobador` | 23 | **X** | | | | |
| `configuracion` | 24 | | **X** | | | |
| `tecnico` | 39 | | **X** | | | |
| `gestor-area` | 17 | | **X** | | | |
| `conocimiento` | 13 | | | **X** | | |
| `reportes` | 4 | | | **X** | | |
| `activos` | 78 | | | | **X** | |
| `cmdb` | 30 | | | | **X** | |
| `gestor-cambios` | 24 | | | | **X** | |
| `proveedores` | 6 | | | | **X** | |
| `identidades` | 15 | | | | | **X** |
| `organizacion` | 22 | | | | | **X** |
| `auditor` | 22 | | | | | **X** |
| **TOTAL (16)** | **383** | **4** | **3** | **2** | **4** | **3** |

> Nota de carga: el reparto es por **dominio funcional**, no por número de archivos.
> El bloque de Alexis tiene menos archivos pero sus dos módulos son los más vacíos
> (`reportes` = 4, `conocimiento` = 13), es decir, el mayor potencial de construcción.
> El bloque de Nain es el más pesado (ITAM + CMDB). Si se quiere equilibrar, se puede
> mover `proveedores` a Alexis o `gestor-area` entre Lourdes y Alexis.

---

# Persona 1 — Miguel

**Rol:** Tech Lead / Arquitecto. Además del núcleo (fuera de este reparto), asume el
**ciclo de vida del servicio, la operación, el gobierno de SLA/OLA y las aprobaciones**.

## Lo que trabajará

Módulos: **`servicios`**, **`operacion`**, **`supervisor`**, **`aprobador`**.

### `src/modules/servicios/` (16 archivos) — Catálogo de Servicios y SLA
- **Carpetas:** `services/` (3: `servicioService`, `slaService`, `matrizSlaService`),
  `api/` (5: `serviciosController`, `servicioDetalleController`,
  `servicioDetalleWorkflowController`, `api/admin/slaController`, `api/admin/matrizController`),
  `admin/` (7: `GestionCategorias.tsx`, `ConfiguracionObjetivosSla.tsx`,
  `MatrizPrioridadSla.tsx`, `admin/servicios/page.tsx`,
  `admin/servicios/sla/page.tsx`, `admin/servicios/[id]/formulario/page.tsx`, `ui.tsx`),
  `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/admin/servicios/**`
  (`/admin/servicios`, `/admin/servicios/sla`, `/admin/servicios/[id]/formulario`),
  `src/app/api/servicios/**`, `src/app/api/admin/sla/**`, `src/app/api/admin/sla/matriz/**`.
- **Qué hará:** catálogo de servicios (alta/edición, categorías, estado del ciclo de vida),
  definición de SLA y matriz de prioridad (impacto × urgencia), formulario dinámico por
  servicio, workflow por servicio.

### `src/modules/operacion/` (10 archivos) — Operación y Resiliencia
- **Carpetas:** `services/` (2: `eventoService`, `resilienciaService`),
  `api/` (3: `eventoController`, `eventoDetalleController`, `resilienciaController`),
  `components/` (2: `EventosWorkspace`, `ResilienciaWorkspace`),
  `views/` (2: `VistaEventosOperacion`, `VistaResilienciaOperacion`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/operacion/eventos`,
  `src/app/plataforma/operacion/resiliencia`, `src/app/api/operacion/eventos/**`,
  `src/app/api/operacion/resiliencia/**`.
- **Qué hará:** gestión de eventos operativos (monitoreo, correlación, alertas) y planes
  de resiliencia / continuidad del servicio.

### `src/modules/supervisor/` (20 archivos) — Supervisión, SLA/OLA y equipo
- **Carpetas:** `services/` (1: `supervisionService`),
  `api/` (9: `panelController`, `escalamientosController`, `incumplimientosController`,
  `productividadController`, `recursosController`, `programacionController`,
  `aprobacionesController`, `problemasController`, `bajasController`),
  `views/` (10: `VistaPanelSupervisor`, `VistaEscalamientosSla`, `VistaIncumplimientosSla`,
  `VistaProductividad`, `VistaRecursosEquipo`, `VistaProgramacionCambios`,
  `VistaAprobacionesTecnicas`, `VistaAsignacionProblemas`, `VistaBajasActivos`,
  `VistaAusenciasEquipo`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/supervisor/**` y `src/app/api/supervisor/**`.
- **Qué hará:** panel de supervisión, incumplimientos y escalamientos de SLA, productividad
  del equipo, recursos/capacidad, programación de cambios y aprobaciones técnicas.

### `src/modules/aprobador/` (23 archivos) — CAB / Aprobaciones
- **Carpetas:** `services/` (3: `aprobacionesService`, `cabService`, `montoService`),
  `api/` (10: `panelController`, `cambiosController`, `agendaController`,
  `emergenciaController`, `delegacionesController`, `historialController`,
  `modelosController`, `problemasController`, `activosController`, `reportesController`),
  `views/` (10: `VistaPanelAprobador`, `VistaAprobacionesCambios`, `VistaCabAgenda`,
  `VistaCabEmergencia`, `VistaDelegacionesAprobador`, `VistaHistorialAprobador`,
  `VistaModelosCambio`, `VistaProblemasMayores`, `VistaBajasRenovaciones`,
  `VistaReportesAprobador`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/aprobador/**` y `src/app/api/aprobador/**`.
- **Qué hará:** agenda de CAB, comité de emergencia (ECAB), umbrales de monto,
  delegaciones de aprobación, historial de decisiones y segregación de funciones (SoD).

## Estado actual (ITIL v4 / ITSM)

| Módulo | Práctica ITIL v4 / marco | Cubierto hoy | Brechas a cerrar |
| :--- | :--- | :--- | :--- |
| `servicios` | Service Catalogue Management · Service Level Management (SLM) · Service Design | Catálogo + categorías, objetivos de SLA, matriz de prioridad (impacto × urgencia), formulario dinámico por servicio, workflow por servicio. | Ciclo de vida del servicio (pipeline/retiro), versionado y publicación del catálogo, **OLA** (acuerdos internos), catálogo por perfil/portal de autoservicio, KPIs de catálogo y de cumplimiento de SLA. |
| `operacion` | Monitoring & Event Management · Service Continuity Management | Gestión de eventos y espacios de trabajo de resiliencia (estado inicial y con poco contenido). | Correlación y deduplicación de eventos, umbrales/alertas, escalado automático a incidentes, **BIA** (análisis de impacto en el negocio), planes de continuidad y pruebas de recuperación. |
| `supervisor` | Service Level Management · Workforce & Resource Management · Continual Improvement | Panel, incumplimientos y escalamientos de SLA, productividad, recursos, programación de cambios, aprobaciones técnicas y ausencias del equipo. | **OLA** entre áreas, alertas proactivas de vencimiento, capacidad/forecast del equipo, tendencias históricas y tableros de mejora continua. |
| `aprobador` | Change Enablement (CAB/ECAB) · Segregation of Duties | Agenda de CAB, comité de emergencia, umbral de monto, delegaciones, historial y modelos de cambio. | Quórum y votación formal, actas de CAB, SLA de decisión, detección automática de conflictos de interés y trazabilidad de la autorización. |

**Referencias:** ITIL 4 (Service Catalogue, SLM, Monitoring & Event Management, Service
Continuity, Change Enablement), ISO/IEC 20000-1 cláusulas de servicio y cambio.

## PROMPT

```text
Actúa como Desarrollador Senior ITSM/ITIL v4 dentro del proyecto FlowDesk
(Next.js App Router + TypeScript + PostgreSQL). Eres el responsable del bloque
"SERVICIOS, OPERACIÓN, SLA Y APROBACIONES".

MÓDULOS Y CARPETAS QUE TE TOCAN (edítalos completos, son tuyos):
- src/modules/servicios/   (services/, api/, admin/, index.ts)
- src/modules/operacion/   (services/, api/, components/, views/, index.ts)
- src/modules/supervisor/  (services/, api/, views/, index.ts)
- src/modules/aprobador/   (services/, api/, views/, index.ts)

RUTAS DE src/app QUE DEPENDEN DE TUS MÓDULOS (son cascarones delgados; no meten lógica):
- /plataforma/admin/servicios/** , /plataforma/admin/servicios/sla ,
  /plataforma/admin/servicios/[id]/formulario
- /api/servicios/** , /api/admin/sla/** , /api/admin/sla/matriz/**
- /plataforma/operacion/eventos , /plataforma/operacion/resiliencia ,
  /api/operacion/eventos/** , /api/operacion/resiliencia/**
- /plataforma/supervisor/** , /api/supervisor/**
- /plataforma/aprobador/** , /api/aprobador/**

ESTADO ACTUAL (según ITIL v4 / ITSM) DE LO QUE TE TOCA:
- servicios: catálogo + categorías, objetivos de SLA, matriz de prioridad
  (impacto × urgencia), formulario dinámico por servicio y workflow por servicio.
  FALTA: ciclo de vida del servicio, versionado/publicación del catálogo, OLA,
  catálogo por perfil (autoservicio), KPIs de catálogo y cumplimiento de SLA.
- operacion: gestión de eventos y espacio de resiliencia, aún muy incipiente.
  FALTA: correlación de eventos, umbrales/alertas, escalado a incidentes, BIA,
  planes de continuidad y pruebas de recuperación.
- supervisor: panel, incumplimientos y escalamientos de SLA, productividad, recursos,
  programación de cambios, aprobaciones técnicas y ausencias del equipo.
  FALTA: OLA entre áreas, alertas proactivas, forecast de capacidad y tendencias.
- aprobador: agenda CAB, comité de emergencia (ECAB), umbral de monto, delegaciones,
  historial y modelos de cambio. FALTA: quórum/votación, actas de CAB, SLA de decisión
  y detección de conflictos de interés.

REGLAS DEL PROYECTO (obligatorias):
1. La lógica vive en src/modules/<modulo>/. Las rutas de src/app solo montan el módulo.
2. NO toques módulos de otros integrantes ni el núcleo (tickets, incidentes,
   solicitudes, cambios, problemas, seguridad, plataforma).
3. Si necesitas algo de otro módulo, impórtalo SOLO por su contrato
   "@/modules/<modulo>" (o "@/modules/<modulo>/ui" para componentes cliente).
   Nunca rutas profundas.
4. La lógica transversal (db, auth, capacidades, errores, validaciones) se importa de
   "@/shared/lib/*". Los guards de API se importan de "@/shared/lib/api-auth"
   (sesionConCapacidad / autorizarApi). NO crees guards propios.
5. Envuelve los errores de dominio con ErrorDominio y responde con respuestaError.
6. Antes de dar por cerrado un cambio: ejecuta "npx tsc --noEmit" y "npm run build"
   y déjalos en verde.
7. Rama de trabajo: feature/miguel-servicios-operacion-sla. Miguel integra a las
   ramas protegidas (main, feature/alexis-problemas-conocimiento, prueba-conexion,
   verify-junior).

ENTREGABLES POR MÓDULO (uno a la vez, en este orden: servicios → supervisor →
aprobador → operacion):
- Servicio: ciclo de vida del servicio (borrador/activo/en retiro) y publicación del
  catálogo; OLA por servicio; catálogo visible por perfil.
- Supervisor: alertas proactivas de SLA próximo a vencer y tablero de tendencias.
- Aprobador: registro de decisión de CAB (quórum, acta, motivo) y SLA de decisión.
- Operación: umbrales/correlación de eventos y escalado automático a incidentes.

Para cada entrega: crea los servicios en services/, los controladores en api/ (o api/admin/),
las vistas en views/ (o admin/), las rutas de src/app, mantén el contrato de index.ts y
verifica tsc + build. Explica brevemente qué práctica ITIL v4 cubre cada cambio.
```

---

# Persona 2 — Lourdes

**Rol:** Líder de Frontend / Experiencia. Asume la **consola de trabajo del técnico**,
la **configuración funcional del sistema** y la **consola del gestor de área**.

## Lo que trabajará

Módulos: **`configuracion`**, **`tecnico`**, **`gestor-area`**.

### `src/modules/configuracion/` (24 archivos) — Configuración funcional
- **Carpetas:** `services/` (6: `categoriaService`, `categoriaDetalleService`,
  `configuracionSistemaService`, `menuAdminService`, `menuAdminDetalleService`,
  `reglasNotificacionService`), `api/` (7: `api/admin/categoriaController`,
  `api/admin/categoriaDetalleController`, `api/admin/configuracionController`,
  `api/admin/reglasController`, `menuController`, `menuAdminController`,
  `menuAdminDetalleController`), `categorias/` (3: `categoriasService`,
  `categoriasTypes`, `categoriasValidaciones`), `components/` (2:
  `ConfiguracionFormulariosTickets`, `ConfiguracionVistasTickets`),
  `config/` (5: `menu/VistaMenu`, `notificaciones/VistaNotificaciones`,
  `tickets-formularios/VistaTicketsFormularios`, `tickets-vistas/VistaTicketsVistas`,
  `conocimiento/VistaConocimientoConfig`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/admin/menu`,
  `src/app/plataforma/admin/notificaciones`, `src/app/plataforma/admin/tickets-formularios`,
  `src/app/plataforma/admin/tickets-vistas`,
  `src/app/plataforma/admin/conocimiento-config`,
  `src/app/api/menu/**`, `src/app/api/admin/categorias/**`,
  `src/app/api/admin/configuracion`, `src/app/api/admin/notificaciones/reglas`.
- **Qué hará:** constructor del menú lateral, categorías, formularios y vistas de tickets,
  reglas de notificación y parámetros del sistema.

### `src/modules/tecnico/` (39 archivos) — Consola del técnico
- **Carpetas (espejo de las rutas):** `panel/`, `mesa/` (`area`, `asignados`,
  `pendientes`, `historial`, `incidente-mayor`), `cambios/` (`calendario`, `historial`,
  `impacto`, `implementacion`, `mis-cambios`), `activos/` (`conteos`, `inventario`,
  `licencias`, `mantenimiento`, `mapa`), `problemas/` (`asignados`, `candidatos`,
  `errores-conocidos`, `grupo`, `nuevo`), `sla/` (`objetivos`, `semaforo`),
  `agenda/`, `tareas/`, `catalogo/`, `api/` (6), `services/` (6), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/tecnico/**`
  (`/tecnico/panel`, `/tecnico/mesa/*`, `/tecnico/cambios/*`, `/tecnico/activos/*`,
  `/tecnico/problemas/*`, `/tecnico/sla/*`, `/tecnico/agenda`, `/tecnico/tareas`,
  `/tecnico/catalogo`) y `src/app/api/tecnico/**`.
- **Qué hará:** la estación de trabajo del técnico: bandeja/mesa, atención de cambios,
  activos, problemas, semáforo de SLA, agenda, tareas y catálogo.

### `src/modules/gestor-area/` (17 archivos) — Consola del gestor de área (negocio)
- **Carpetas:** `services/` (1: `areaService`),
  `api/` (8: `panelController`, `aprobacionesController`, `cambiosImpactoController`,
  `contratosController`, `delegacionController`, `historialController`,
  `activosController`, `reportesController`),
  `views/` (8: `VistaPanelArea`, `VistaAprobacionesNegocio`, `VistaCambiosImpactoArea`,
  `VistaContratosArea`, `VistaDelegacionAprobaciones`, `VistaHistorialDecisiones`,
  `VistaActivosArea`, `VistaReportesArea`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/gestor-area/**`
  (`/gestor-area/panel`, `/gestor-area/aprobaciones/*`, `/gestor-area/cambios/*`,
  `/gestor-area/contratos`, `/gestor-area/activos`, `/gestor-area/reportes`) y
  `src/app/api/gestor-area/**`.
- **Qué hará:** consola del área de negocio: panel, aprobaciones de negocio, impacto de
  cambios, contratos, activos del área, delegaciones e historial de decisiones.

## Estado actual (ITIL v4 / ITSM)

| Módulo | Práctica ITIL v4 / marco | Cubierto hoy | Brechas a cerrar |
| :--- | :--- | :--- | :--- |
| `configuracion` | Service Design · Process Configuration · Knowledge (config) | Constructor del menú, categorías, formularios y vistas de tickets, reglas de notificación, parámetros del sistema, categorías internas (`categorias/`). | Versionado y publicación de formularios, validaciones por campo, plantillas, auditoría de cambios de configuración y programación de notificaciones. |
| `tecnico` | Service Desk · Incident Management · Request Fulfilment · Change Implementation | Consola muy completa: mesa (área/asignados/pendientes/historial/incidente mayor), cambios, activos (incl. conteo y mapa), problemas, semáforo y objetivos de SLA, agenda, tareas y catálogo. | **CSAT** al cierre, sugerencia de artículos de conocimiento en línea, plantillas de respuesta, línea de tiempo unificada del caso y cronómetro de trabajo. |
| `gestor-area` | Business Relationship Management · Demand Management | Panel de área, aprobaciones de negocio, impacto de cambios, contratos y activos del área, delegaciones, historial y reportes. | Portal de demanda del negocio, presupuesto/costos por área, SLA de negocio y encuestas de satisfacción por área. |

**Referencias:** ITIL 4 (Service Desk, Incident Management, Request Management, BRM, Demand),
ISO/IEC 20000-1 (gestión del servicio y satisfacción del cliente).

## PROMPT

```text
Actúa como Líder de Frontend / Desarrolladora de Experiencia dentro del proyecto
FlowDesk (Next.js App Router + TypeScript + PostgreSQL). Eres la responsable del bloque
"CONFIGURACIÓN, CONSOLA TÉCNICA Y CONSOLA DE ÁREA".

MÓDULOS Y CARPETAS QUE TE TOCAN (edítalos completos, son tuyos):
- src/modules/configuracion/ (services/, api/, categorias/, components/, config/, index.ts)
- src/modules/tecnico/       (panel/, mesa/, cambios/, activos/, problemas/, sla/,
                              agenda/, tareas/, catalogo/, api/, services/, index.ts)
- src/modules/gestor-area/   (services/, api/, views/, index.ts)

RUTAS DE src/app QUE DEPENDEN DE TUS MÓDULOS (cascarones delgados, sin lógica):
- /plataforma/admin/menu , /plataforma/admin/notificaciones ,
  /plataforma/admin/tickets-formularios , /plataforma/admin/tickets-vistas ,
  /plataforma/admin/conocimiento-config
- /api/menu/** , /api/admin/categorias/** , /api/admin/configuracion ,
  /api/admin/notificaciones/reglas
- /plataforma/tecnico/** y /api/tecnico/**
- /plataforma/gestor-area/** y /api/gestor-area/**

ESTADO ACTUAL (según ITIL v4 / ITSM) DE LO QUE TE TOCA:
- configuracion: constructor de menú, categorías, formularios y vistas de tickets,
  reglas de notificación, parámetros del sistema y categorías internas.
  FALTA: versionado/publicación de formularios, validaciones por campo, plantillas,
  auditoría de cambios de configuración y programación de notificaciones.
- tecnico: consola muy completa (mesa, cambios, activos incluso conteo y mapa, problemas,
  semáforo/objetivos de SLA, agenda, tareas, catálogo).
  FALTA: encuesta CSAT al cierre, sugerencia de artículos de conocimiento en el caso,
  plantillas de respuesta, línea de tiempo unificada y cronómetro de trabajo.
- gestor-area: panel de área, aprobaciones de negocio, impacto de cambios, contratos y
  activos del área, delegaciones, historial y reportes.
  FALTA: portal de demanda, costos por área, SLA de negocio y CSAT por área.

REGLAS DEL PROYECTO (obligatorias):
1. La lógica vive en src/modules/<modulo>/. Las rutas de src/app solo montan el módulo.
2. NO toques módulos de otros integrantes ni el núcleo (tickets, incidentes, solicitudes,
   cambios, problemas, seguridad, plataforma).
3. Si necesitas algo de otro módulo, impórtalo SOLO por su contrato "@/modules/<modulo>"
   (o "@/modules/<modulo>/ui" para componentes cliente). Nunca rutas profundas.
4. Reutiliza los componentes genéricos de administración desde
   "@/shared/components/admin" (BarraAccionesComun, ModalPublicacion,
   ModalHistorialVersiones, ModalRestaurarFabrica, ModalVistaPrevia).
5. La lógica transversal se importa de "@/shared/lib/*". Los guards de API se importan de
   "@/shared/lib/api-auth" (sesionConCapacidad / autorizarApi). NO crees guards propios.
6. Envuelve errores de dominio con ErrorDominio y responde con respuestaError.
7. Antes de cerrar un cambio: "npx tsc --noEmit" y "npm run build" en verde.
8. Rama de trabajo: feature/lourdes-config-tecnico. Integra a las ramas protegidas
   (main, feature/alexis-problemas-conocimiento, prueba-conexion, verify-junior).

ENTREGABLES (en orden: configuracion → tecnico → gestor-area):
- Configuración: versionado/publicación de formularios de tickets + validaciones por campo.
- Técnico: CSAT al cierre de ticket y sugerencia de artículos de conocimiento en el caso.
- Gestor de área: portal de demanda y costos/consumo por área.

Para cada entrega: servicios en services/, controladores en api/, vistas en views/
(o config/), rutas de src/app, contrato de index.ts y verificación tsc + build.
Mantén el estilo visual y de componentes ya existente en el proyecto.
```

---

# Persona 3 — Alexis

**Rol:** Desarrollador de **Gestión del Conocimiento y Mejora Continua (CSI)**.

## Lo que trabajará

Módulos: **`conocimiento`**, **`reportes`**.
_(Bloque con menos archivos pero el mayor potencial de construcción: son los módulos más
vacíos del sistema.)_

### `src/modules/conocimiento/` (13 archivos) — Base de Conocimiento
- **Carpetas:** `services/` (1: `conocimientoService`),
  `api/` (6: `conocimientoController`, `conocimientoDetalleController`,
  `api/admin/conocimientoController`, `api/admin/conocimientoDetalleController`,
  `api/admin/categoriasController`, `api/admin/politicasController`),
  `views/` (5: `VistaConocimientoBase`, `VistaConocimientoDetalle`,
  `VistaConocimientoMisArticulos`, `VistaConocimientoNuevo`,
  `VistaConocimientoRevisiones`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/conocimiento` y
  `src/app/plataforma/conocimiento/[id]`,
  `src/app/plataforma/tecnico/conocimiento/**` (base, mis-articulos, nuevo, revisiones),
  `src/app/plataforma/supervisor/conocimiento/revisiones`,
  `src/app/api/conocimiento/**`, `src/app/api/admin/conocimiento/**`.
- **Qué hará:** artículos de conocimiento, flujo editorial (borrador → revisión →
  publicación), políticas y categorías de conocimiento, y la revisión desde supervisión.

### `src/modules/reportes/` (4 archivos) — Indicadores y Dashboards
- **Carpetas:** `services/` (1: `indicadoresService`), `api/` (1: `indicadoresController`),
  `views/` (1: `VistaDashboard`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/dashboard`, `src/app/api/reportes/indicadores`.
- **Qué hará:** catálogo de KPIs, dashboard por perfil, reportes exportables y comparativos
  por periodo/servicio.

## Estado actual (ITIL v4 / ITSM)

| Módulo | Práctica ITIL v4 / marco | Cubierto hoy | Brechas a cerrar |
| :--- | :--- | :--- | :--- |
| `conocimiento` | Knowledge Management (ITIL 4) · ISO/IEC 20000-1 (información documentada) | Base de artículos, detalle, "mis artículos", creación y revisiones; administración de categorías y políticas de conocimiento. | Búsqueda efectiva (indexación), votos de utilidad (feedback), revisión/vencimiento programado, vínculo formal con KEDB (problemas) y versionado de artículos. |
| `reportes` | Measurement & Reporting · Continual Improvement (CSI) | Prácticamente vacío: un endpoint de indicadores y un dashboard genérico. | Catálogo de KPIs (SLA, MTTR, MTBF, FCR, CSAT, reapertura), exportación CSV/Excel, reportes programados, filtros por periodo/servicio/perfil y comparativos de tendencia. |

**Referencias:** ITIL 4 (Knowledge Management, Measurement & Reporting, Continual
Improvement), ISO/IEC 20000-1 cláusulas de reporte de servicio.

## PROMPT

```text
Actúa como Desarrollador de Gestión del Conocimiento y Mejora Continua (CSI) dentro del
proyecto FlowDesk (Next.js App Router + TypeScript + PostgreSQL). Eres el responsable del
bloque "CONOCIMIENTO Y REPORTES".

MÓDULOS Y CARPETAS QUE TE TOCAN (edítalos completos, son tuyos):
- src/modules/conocimiento/ (services/, api/, views/, index.ts)
- src/modules/reportes/     (services/, api/, views/, index.ts)

RUTAS DE src/app QUE DEPENDEN DE TUS MÓDULOS (cascarones delgados, sin lógica):
- /plataforma/conocimiento , /plataforma/conocimiento/[id]
- /plataforma/tecnico/conocimiento/base , /mis-articulos , /nuevo , /revisiones
- /plataforma/supervisor/conocimiento/revisiones
- /api/conocimiento/** , /api/admin/conocimiento/**
- /plataforma/dashboard , /api/reportes/indicadores

ESTADO ACTUAL (según ITIL v4 / ITSM) DE LO QUE TE TOCA:
- conocimiento: base de artículos, detalle, "mis artículos", creación y revisiones;
  administración de categorías y políticas. FALTA: búsqueda/indexación, votos de utilidad,
  revisión y vencimiento programados, vínculo formal con la KEDB de problemas y versionado.
- reportes: casi vacío (1 endpoint de indicadores + 1 dashboard). FALTA prácticamente todo:
  catálogo de KPIs (SLA, MTTR, MTBF, FCR, CSAT, reapertura), exportación CSV/Excel,
  reportes programados, filtros por periodo/servicio y comparativos de tendencia.

REGLAS DEL PROYECTO (obligatorias):
1. La lógica vive en src/modules/<modulo>/. Las rutas de src/app solo montan el módulo.
2. NO toques módulos de otros integrantes ni el núcleo (tickets, incidentes, solicitudes,
   cambios, problemas, seguridad, plataforma).
3. Si necesitas datos de otro módulo, impórtalo SOLO por su contrato "@/modules/<modulo>".
   Nunca rutas profundas. Si necesitas KPIs de tickets/incidentes, léelos por SQL en tu
   propio servicio (patrón ya usado en el proyecto) en lugar de acoplarte.
4. La lógica transversal se importa de "@/shared/lib/*". Los guards de API se importan de
   "@/shared/lib/api-auth" (sesionConCapacidad / autorizarApi). NO crees guards propios.
5. Envuelve errores de dominio con ErrorDominio y responde con respuestaError.
6. Antes de cerrar un cambio: "npx tsc --noEmit" y "npm run build" en verde.
7. Rama de trabajo: feature/alexis-conocimiento-reportes. Integra a las ramas protegidas
   (main, feature/alexis-problemas-conocimiento, prueba-conexion, verify-junior).

ENTREGABLES (en orden: conocimiento → reportes):
- Conocimiento: búsqueda indexada de artículos + votos de utilidad + revisión/vencimiento
  programado (con aviso a supervisión).
- Reportes: catálogo de KPIs con exportación CSV/Excel y un dashboard por perfil, con
  filtro por periodo y servicio.

Para cada entrega: servicios en services/, controladores en api/, vistas en views/,
rutas de src/app, contrato de index.ts y verificación tsc + build. Explica qué práctica
ITIL v4 cubre cada cambio. Prioriza reportes como tu módulo estrella (es el más vacío).
```

---

# Persona 4 — Nain

**Rol:** Desarrollador de **Gestión de Activos (ITAM/SAM), CMDB (SACM), Proveedores y
Gestión del Cambio (consola del gestor)**.

## Lo que trabajará

Módulos: **`activos`**, **`cmdb`**, **`gestor-cambios`**, **`proveedores`**.

### `src/modules/activos/` (78 archivos) — ITAM / SAM
- **Carpetas:** `services/` (13: activos, historial, contratos, licencias y asignaciones,
  cumplimiento, modelos, tipos, ciclos de vida, configuración ITAM, panel, mis activos),
  `api/` (23, incl. `api/admin/` para ciclos de vida, licencias-contratos y
  tipos-modelos-atributos), `views/` (16: `VistaActivos`, `VistaInventarioActivos`,
  `VistaAsignacionesActivos`, `VistaBajasActivos`, `VistaCatalogoSoftware`,
  `VistaContratos`, `VistaCumplimientoLicencias`, `VistaImportacionActivos`,
  `VistaInventarioFisico`, `VistaLicenciasActivos`, `VistaMantenimientoActivos`,
  `VistaMisActivos`, `VistaPanelGestorActivos`, `VistaRecepcionActivos`,
  `VistaRenovaciones`, `VistaReportesActivos`),
  `config/` (24: ciclos-vida-transiciones, licencias-contratos, tipos-modelos-atributos),
  `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/activos/**`,
  `src/app/plataforma/gestor-activos/**` (incl. `/gestor-activos/*`),
  `src/app/plataforma/admin/activos-config/**`, `src/app/api/activos/**`,
  `src/app/api/gestor-activos/**`, `src/app/api/admin/activos-config/**`.
- **Qué hará:** inventario de activos, asignaciones y custodia, bajas/disposición,
  recepción, mantenimiento, contratos, licencias (catálogo de software y cumplimiento/
  sobreuso), inventario físico, importación, etiquetas, ciclos de vida y configuración ITAM.

### `src/modules/cmdb/` (30 archivos) — SACM
- **Carpetas:** `services/` (6: `cmdbService`, `cmdbTiposService`, `cmdbRelacionesService`,
  `cmdbRelacionesConfiguracionService`, `cmdbGestionService`, `cmdbAnalisisService`),
  `api/` (9, incl. `api/admin/cmdbTiposController` y
  `api/admin/cmdbRelacionesConfiguracionController`),
  `views/` (7: `VistaCmdb`, `VistaTiposCi`, `VistaCmdbActualizaciones`,
  `VistaCmdbAuditoria`, `VistaCmdbInexactitudes`, `VistaCmdbLineasBase`,
  `VistaCmdbAnalisis`), `config/cmdb-relaciones/` (7, con 6 pestañas), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/activos/cmdb/**`
  (incl. `/activos/cmdb/analisis`), `src/app/plataforma/gestor-activos/cmdb/**`,
  `src/app/plataforma/admin/activos-config/cmdb-relaciones`,
  `src/app/api/activos/cmdb/**`, `src/app/api/gestor-activos/cmdb/**`,
  `src/app/api/admin/cmdb/tipos`, `src/app/api/admin/activos-config/cmdb-relaciones/**`.
- **Qué hará:** elementos de configuración (CI) y sus tipos, relaciones/topología, líneas
  base, inexactitudes, auditoría de exactitud, actualizaciones desde cambios y el análisis
  de impacto/topología/reconciliación.

### `src/modules/gestor-cambios/` (24 archivos) — Consola del gestor de cambios
- **Carpetas:** `services/` (3: `cambiosGestionService`, `cabGestionService`,
  `conflictosService`), `api/` (11: panel, evaluación, autorizaciones, cab-agenda,
  programación, conflictos, ejecución, pir, excepciones, modelos, reportes),
  `views/` (10: `VistaPanelGestion`, `VistaEvaluacionRfc`, `VistaAutorizaciones`,
  `VistaCabAgendaGestion`, `VistaProgramacion`, `VistaConflictos`, `VistaEjecucion`,
  `VistaPir`, `VistaModelosGestion`, `VistaReportesCambios`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/gestor-cambios/**` y
  `src/app/api/gestor-cambios/**`.
- **Qué hará:** evaluación de RFC, autorizaciones, agenda de CAB, programación, detección
  de conflictos, ejecución, revisión post-implementación (PIR) y excepciones.

### `src/modules/proveedores/` (6 archivos) — Supplier Management
- **Carpetas:** `services/` (1: `proveedorService`), `api/` (2: `proveedorController`,
  `proveedorDetalleController`), `components/` (1: `ProveedoresWorkspace`),
  `views/` (1: `VistaProveedores`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/proveedores`, `src/app/api/proveedores/**`.
- **Qué hará:** proveedores, evaluación de desempeño y su relación con contratos.

## Estado actual (ITIL v4 / ITSM)

| Módulo | Práctica ITIL v4 / marco | Cubierto hoy | Brechas a cerrar |
| :--- | :--- | :--- | :--- |
| `activos` | IT Asset Management (ITAM) · Software Asset Management (ISO/IEC 19770) | Muy completo: inventario, asignaciones/custodia, bajas, recepción, mantenimiento, contratos, licencias (catálogo de software y cumplimiento/sobreuso), inventario físico, importación, etiquetas, ciclos de vida y configuración de tipos/modelos/atributos. | Depreciación/TCO y costos, **descubrimiento automático** de activos, integración con compras y AMDB, y trazabilidad de ciclo de vida end-to-end. |
| `cmdb` | Service Configuration Management (SACM) · ISO/IEC 20000-1 cl. 8.7 | CIs y tipos, relaciones/topología, líneas base, inexactitudes, auditoría de exactitud, actualizaciones desde cambios y **análisis de impacto/topología/reconciliación** (recién añadido). | Descubrimiento automático de CIs, **servicios como CI raíz**, actualización automática al cerrar un cambio, métricas históricas de exactitud y federación de CMDB. |
| `gestor-cambios` | Change Enablement (ITIL 4) | Evaluación de RFC, autorizaciones, agenda CAB, programación, conflictos, ejecución, PIR y excepciones. | Ventanas de congelamiento (change freeze), detección automática de colisiones, análisis de impacto automático vía CMDB, cambio estándar preautorizado y métricas de éxito/rollback. |
| `proveedores` | Supplier Management (ITIL 4) | CRUD básico de proveedores y un workspace inicial. | Contratos vinculados, evaluación de desempeño (scorecards), catálogo de servicios del proveedor, riesgos y cumplimiento. |

**Referencias:** ITIL 4 (ITAM, SACM, Change Enablement, Supplier Management),
ISO/IEC 19770 (SAM), ISO/IEC 20000-1 cl. 8.7 (control de configuración).

## PROMPT

```text
Actúa como Desarrollador de ITAM/SAM, CMDB (SACM) y Gestión del Cambio dentro del proyecto
FlowDesk (Next.js App Router + TypeScript + PostgreSQL). Eres el responsable del bloque
"ACTIVOS, CMDB, GESTOR DE CAMBIOS Y PROVEEDORES".

MÓDULOS Y CARPETAS QUE TE TOCAN (edítalos completos, son tuyos):
- src/modules/activos/        (services/, api/ incl. api/admin/, views/, config/, index.ts)
- src/modules/cmdb/           (services/, api/ incl. api/admin/, views/, config/, index.ts)
- src/modules/gestor-cambios/ (services/, api/, views/, index.ts)
- src/modules/proveedores/    (services/, api/, components/, views/, index.ts)

RUTAS DE src/app QUE DEPENDEN DE TUS MÓDULOS (cascarones delgados, sin lógica):
- /plataforma/activos/** , /plataforma/gestor-activos/** , /plataforma/admin/activos-config/**
- /api/activos/** , /api/gestor-activos/** , /api/admin/activos-config/**
- /plataforma/activos/cmdb/** , /plataforma/gestor-activos/cmdb/** ,
  /plataforma/admin/activos-config/cmdb-relaciones
- /api/activos/cmdb/** , /api/gestor-activos/cmdb/** , /api/admin/cmdb/tipos ,
  /api/admin/activos-config/cmdb-relaciones/**
- /plataforma/gestor-cambios/** , /api/gestor-cambios/**
- /plataforma/proveedores , /api/proveedores/**

ESTADO ACTUAL (según ITIL v4 / ITSM) DE LO QUE TE TOCA:
- activos: muy completo (ITAM + SAM): inventario, asignaciones/custodia, bajas, recepción,
  mantenimiento, contratos, licencias (catálogo de software, cumplimiento/sobreuso),
  inventario físico, importación, etiquetas, ciclos de vida y configuración de tipos/
  modelos/atributos. FALTA: depreciación/TCO, descubrimiento automático, integración con
  compras y AMDB.
- cmdb: CIs y tipos, relaciones/topología, líneas base, inexactitudes, auditoría de
  exactitud, actualizaciones desde cambios y análisis de impacto/topología/reconciliación.
  FALTA: descubrimiento automático de CIs, servicios como CI raíz, actualización automática
  al cerrar un cambio y métricas históricas de exactitud.
- gestor-cambios: evaluación de RFC, autorizaciones, agenda CAB, programación, conflictos,
  ejecución, PIR y excepciones. FALTA: ventanas de congelamiento, colisiones automáticas,
  análisis de impacto automático vía CMDB, cambio estándar preautorizado y métricas de
  éxito/rollback.
- proveedores: CRUD básico + workspace inicial. FALTA: contratos vinculados, scorecards,
  catálogo de servicios del proveedor, riesgos y cumplimiento.

REGLAS DEL PROYECTO (obligatorias):
1. La lógica vive en src/modules/<modulo>/. Las rutas de src/app solo montan el módulo.
2. NO toques módulos de otros integrantes ni el núcleo (tickets, incidentes, solicitudes,
   cambios, problemas, seguridad, plataforma). Ojo: el módulo "cambios" (núcleo, RFC) NO es
   tuyo; tú tienes "gestor-cambios" (consola del gestor). Si necesitas datos de "cambios",
   léelos por SQL o pide ampliar su contrato.
3. Si necesitas algo de otro módulo, impórtalo SOLO por su contrato "@/modules/<modulo>".
   La CMDB ya es un módulo independiente: la relación Activo↔CI es por dato
   (elemento_configuracion.id_activo -> activo), no por código.
4. La lógica transversal se importa de "@/shared/lib/*". Los guards de API se importan de
   "@/shared/lib/api-auth" (sesionConCapacidad / autorizarApi). NO crees guards propios.
5. Envuelve errores de dominio con ErrorDominio y responde con respuestaError.
6. Antes de cerrar un cambio: "npx tsc --noEmit" y "npm run build" en verde.
7. Rama de trabajo: feature/nain-activos-cmdb. Integra a las ramas protegidas (main,
   feature/alexis-problemas-conocimiento, prueba-conexion, verify-junior).

ENTREGABLES (en orden: cmdb → gestor-cambios → activos → proveedores):
- CMDB: servicios como CI raíz, actualización automática de la CMDB al cerrar un cambio y
  métricas históricas de exactitud (reusa cmdbAnalisisService).
- Gestor de cambios: ventanas de congelamiento y detección automática de colisiones.
- Activos: depreciación/TCO y descubrimiento/conciliación con la CMDB.
- Proveedores: contratos vinculados y evaluación de desempeño (scorecard).

Para cada entrega: servicios en services/, controladores en api/ (o api/admin/), vistas en
views/ (o config/), rutas de src/app, contrato de index.ts y verificación tsc + build.
No rompas los KPIs de activos que consultan las tablas CMDB por SQL.
```

---

# Persona 5 — Junior

**Rol:** Desarrollador de **Identidad y Acceso (IAM), Organización y Auditoría**.

## Lo que trabajará

Módulos: **`identidades`**, **`organizacion`**, **`auditor`**.

### `src/modules/identidades/` (15 archivos) — IAM
- **Carpetas:** `services/` (6: `usuarioService`, `usuarioDetalleService`,
  `usuarioDetalleDesbloquearService`, `enviarCredencialesService`, `perfilService`,
  `perfilDetalleService`), `api/` (6: `usuarioController`, `usuarioDetalleController`,
  `usuarioDetalleDesbloquearController`, `enviarCredencialesController`,
  `perfilController`, `perfilDetalleController`),
  `config/` (2: `usuarios/VistaUsuarios`, `perfiles/VistaPerfiles`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/admin/usuarios`,
  `src/app/plataforma/admin/perfiles`, `src/app/api/usuarios/**`,
  `src/app/api/perfiles/**` (incl. `desbloquear` y `enviar-credenciales`).
- **Qué hará:** usuarios, perfiles y permisos, credenciales y desbloqueo de cuentas.

### `src/modules/organizacion/` (22 archivos) — Organización y personas
- **Carpetas:** `services/` (9: `departamentoTiService`, `departamentoTiDetalleService`,
  `departamentoEmpresaService`, `departamentoEmpresaDetalleService`, `tecnicoService`,
  `tecnicoDetalleService`, `colaboradoresService`, `colaboradoresAutorizacionesService`,
  `ausenciasService`), `api/` (9, incl. `api/admin/ausenciasController`),
  `config/` (3: `departamentos/VistaDepartamentos`,
  `departamentos-empresa/VistaDepartamentosEmpresa`, `tecnicos/VistaTecnicos`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/admin/departamentos`,
  `src/app/plataforma/admin/departamentos-empresa`,
  `src/app/plataforma/admin/tecnicos`, `src/app/api/departamentos-ti/**`,
  `src/app/api/departamentos-empresa/**`, `src/app/api/tecnicos/**`,
  `src/app/api/admin/tecnicos/ausencias`, `src/app/api/supervisor/ausencias`,
  `src/app/api/area/colaboradores/**`.
- **Qué hará:** departamentos (TI y empresa), técnicos, colaboradores y sus autorizaciones,
  y ausencias.

### `src/modules/auditor/` (22 archivos) — Auditoría y cumplimiento
- **Carpetas:** `services/` (5: `auditoriaService`, `accesosService`, `cumplimientoService`,
  `cmdbAuditoriaService`, `evidenciaService`),
  `api/` (9: `panelController`, `accesosController`, `cumplimientoController`,
  `cambiosController`, `cmdbController`, `evidenciaController`, `informesController`,
  `muestreoController`, `recertificacionController`, `sodController`),
  `views/` (8: `VistaPanelAuditoria`, `VistaSod`, `VistaCambiosIrregulares`,
  `VistaCmdbResultados`, `VistaBajasDisposicion`, `VistaRecertificacion`,
  `VistaMuestreo`, `VistaInformesAuditoria`), `index.ts`.
- **Rutas que maneja:** `src/app/plataforma/auditor/**` (`/auditor/panel`,
  `/auditor/cumplimiento/*`, `/auditor/accesos/recertificacion`,
  `/auditor/cmdb/resultados`, `/auditor/activos/bajas`, `/auditor/evidencia`,
  `/auditor/informes`, `/auditor/muestreo`) y `src/app/api/auditor/**`.
- **Qué hará:** panel de auditoría, cumplimiento (cambios y SoD), recertificación de
  accesos, evidencia, muestreo, informes y auditoría de CMDB.

## Estado actual (ITIL v4 / ITSM)

| Módulo | Práctica ITIL v4 / marco | Cubierto hoy | Brechas a cerrar |
| :--- | :--- | :--- | :--- |
| `identidades` | Identity & Access Management (IAM) · RBAC · Segregation of Duties | CRUD de usuarios y perfiles, permisos por perfil, envío de credenciales y desbloqueo de cuentas. | MFA, políticas de contraseña y caducidad, **ciclo de vida de cuentas (joiner/mover/leaver)**, recertificación periódica de accesos, SSO. |
| `organizacion` | Organization & People · Workforce Management | CRUD de departamentos TI y de empresa, técnicos, colaboradores, autorizaciones y ausencias. | Organigrama, calendarios/horarios y turnos, matriz de habilidades (skills) y capacidad por equipo. |
| `auditor` | Governance & Continual Improvement · ISO/IEC 20000 · ISO/IEC 27001 (evidencia) | Amplio: panel de auditoría, cumplimiento de cambios y **SoD**, recertificación de accesos, evidencia, muestreo, bajas y auditoría de CMDB. | Inmutabilidad/append-only formal y firma/hash de evidencia, marcos configurables (p. ej. anexos ISO 27001), hallazgos con plan de acción y seguimiento, informes exportables. |

**Referencias:** ITIL 4 (IAM, Continual Improvement, Governance),
ISO/IEC 20000-1 (gestión del servicio), ISO/IEC 27001 (control de acceso y evidencia).

## PROMPT

```text
Actúa como Desarrollador de Identidad y Acceso (IAM), Organización y Auditoría dentro del
proyecto FlowDesk (Next.js App Router + TypeScript + PostgreSQL). Eres el responsable del
bloque "IDENTIDADES, ORGANIZACIÓN Y AUDITORÍA".

MÓDULOS Y CARPETAS QUE TE TOCAN (edítalos completos, son tuyos):
- src/modules/identidades/  (services/, api/, config/, index.ts)
- src/modules/organizacion/ (services/, api/ incl. api/admin/, config/, index.ts)
- src/modules/auditor/      (services/, api/, views/, index.ts)

RUTAS DE src/app QUE DEPENDEN DE TUS MÓDULOS (cascarones delgados, sin lógica):
- /plataforma/admin/usuarios , /plataforma/admin/perfiles
- /api/usuarios/** , /api/perfiles/** (incl. [id]/desbloquear, enviar-credenciales)
- /plataforma/admin/departamentos , /plataforma/admin/departamentos-empresa ,
  /plataforma/admin/tecnicos
- /api/departamentos-ti/** , /api/departamentos-empresa/** , /api/tecnicos/** ,
  /api/admin/tecnicos/ausencias , /api/supervisor/ausencias , /api/area/colaboradores/**
- /plataforma/auditor/** y /api/auditor/**

ESTADO ACTUAL (según ITIL v4 / ITSM) DE LO QUE TE TOCA:
- identidades: CRUD de usuarios y perfiles, permisos por perfil, envío de credenciales y
  desbloqueo de cuentas. FALTA: MFA, políticas de contraseña/caducidad, ciclo de vida de
  cuentas (joiner/mover/leaver), recertificación periódica de accesos y SSO.
- organizacion: CRUD de departamentos (TI y empresa), técnicos, colaboradores,
  autorizaciones y ausencias. FALTA: organigrama, horarios/turnos, matriz de habilidades
  y capacidad por equipo.
- auditor: panel de auditoría, cumplimiento de cambios y SoD, recertificación de accesos,
  evidencia, muestreo, bajas y auditoría de CMDB. FALTA: inmutabilidad formal de evidencia
  (hash/append-only), marcos configurables (ISO), hallazgos con plan de acción y exportables.

REGLAS DEL PROYECTO (obligatorias):
1. La lógica vive en src/modules/<modulo>/. Las rutas de src/app solo montan el módulo.
2. NO toques módulos de otros integrantes ni el núcleo (tickets, incidentes, solicitudes,
   cambios, problemas, seguridad, plataforma). Nota: el módulo "seguridad" (login, JWT,
   sesiones) NO es tuyo; tú tienes "identidades" (usuarios/perfiles/credenciales). Si
   necesitas algo de seguridad, impórtalo por su contrato "@/modules/seguridad".
3. Si necesitas algo de otro módulo, impórtalo SOLO por su contrato "@/modules/<modulo>".
   Nunca rutas profundas.
4. La lógica transversal se importa de "@/shared/lib/*". Los guards de API se importan de
   "@/shared/lib/api-auth" (sesionConCapacidad / autorizarApi). NO crees guards propios.
5. Envuelve errores de dominio con ErrorDominio y responde con respuestaError.
6. Antes de cerrar un cambio: "npx tsc --noEmit" y "npm run build" en verde.
7. Rama de trabajo: feature/junior-identidades-organizacion-auditor. Integra a las ramas
   protegidas (main, feature/alexis-problemas-conocimiento, prueba-conexion, verify-junior).

ENTREGABLES (en orden: identidades → organizacion → auditor):
- Identidades: políticas de contraseña/caducidad y ciclo de vida de cuenta (alta/baja).
- Organización: horarios/turnos y capacidad por equipo.
- Auditoría: evidencia con hash/append-only y hallazgos con plan de acción y seguimiento.

Para cada entrega: servicios en services/, controladores en api/ (o api/admin/), vistas en
views/ (o config/), rutas de src/app, contrato de index.ts y verificación tsc + build.
Explica qué control/cláusula (ITIL v4 / ISO 20000 / ISO 27001) cubre cada cambio.
```

---

## Anexo — Cómo verificar que sigues sin cruces

Antes de abrir un PR, ejecuta la verificación de acoplamiento (debe dar **0 imports
profundos entre módulos**) y deja `tsc` + `build` en verde:

```powershell
npx tsc --noEmit
npm run build
```

Si al trabajar tu módulo descubres que necesitas algo de otro, **no lo importes por ruta
profunda**: pide que se amplíe el contrato (`index.ts`) del módulo dueño, o léelo por SQL
en tu propio servicio. Cualquier módulo con cruces (`tickets`, `incidentes`, `solicitudes`,
`cambios`, `problemas`, `seguridad`, `plataforma`) queda bajo responsabilidad del núcleo.
