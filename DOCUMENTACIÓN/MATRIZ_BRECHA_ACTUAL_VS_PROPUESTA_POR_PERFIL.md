# MATRIZ COMPARATIVA DE BRECHA: SOFTWARE ACTUAL VS. ESQUEMA DE MENUS Y FUNCIONALIDADES POR PERFIL

## Informacion del Documento y Metadatos Tecnicos

- **Proyecto:** FlowDesk - Sistema de Gestion de Tickets y Servicios de TI (ITSM - ITIL 4)
- **Documento de Referencia de la Propuesta:** `DOCUMENTACION/ESQUEMA_MENUS_POR_PERFIL.md` (Version 1.0, 2026-10-14).
- **Base Real del Software:** Codigo fuente activo en `src/app/`, `src/modules/`, `src/lib/`, `src/components/`, `src/shared/` y base de datos relacional PostgreSQL (`database/schema.sql`).
- **Objetivo de este Documento:** Proporcionar una matriz analitica y exhaustiva **perfil por perfil (10 perfiles oficiales)** que contraste la situacion real del software frente a la propuesta arquitectonica del documento de esquemas de menus, identificando con precision:
  1. Que funcionalidades e interfaces **ya existen en el software actual y coinciden con la propuesta**.
  2. Que elementos **estan propuestos pero aun no existen en el software (pendientes por construir)**.
  3. Que componentes, rutas y APIs **existen actualmente en el software pero no forman parte de la propuesta oficial (rutas legacy, excedentes o en proceso de retiro)**.
  4. El **porcentaje cuantitativo de avance (% Hecho)** y el diagnostico del esfuerzo de adaptacion requerido.

---

## 1. Convencion y Escala de Medicion de Estado

Para cada funcionalidad y opcion de menu en las matrices se aplican las siguientes categorias cuantitativas y cualitativas:

| Estado en el Software | Porcentaje de Avance | Criterio de Medicion Tecnico |
| :--- | :--- | :--- |
| **COMPLETO (EXISTE)** | **100%** | La pagina (`page.tsx`), componentes de UI, APIs backend (`route.ts`) y tablas en PostgreSQL existen y estan plenamente operativos. |
| **ALTO AVANCE (ADAPTAR)** | **75% - 90%** | La pagina y la mayoria de APIs existen, pero se requiere adaptar permisos RBAC, ajustar el alcance de datos al perfil o desacoplar modales y presentadores. |
| **PARCIAL / BACKEND SOLO** | **40% - 60%** | Existen las rutas API o tablas en base de datos, pero la interfaz visual especifica del perfil o componente de presentador aun no ha sido construido. |
| **NO IMPLEMENTADO (NUEVO)** | **0%** | No existe ni la ruta en `src/app/`, ni la interfaz de usuario, ni los servicios dedicados para ese perfil; debe construirse desde cero. |
| **NO EN PROPUESTA (EXTRA / LEGACY)** | **100% (En Codigo)** | Rutas y paginas activas en el repositorio que no figuran en el arbol del perfil en `ESQUEMA_MENUS_POR_PERFIL.md` o que han sido catalogadas para consolidacion o retiro. |

---

## 2. Resumen Ejecutivo Global: Balance por Perfil (10 Perfiles)

| # | Perfil ITSM | Total Opciones Propuestas | Completas (100%) | Por Adaptar (75%-90%) | Parciales / Backend (40%-60%) | Pendientes (0%) | No en Propuesta (Extra / Legacy) | % Cobertura Promedio |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **Administrador** | 139 | 121 | 11 | 2 | 5 | 3 rutas | 91.2% |
| **2** | **Tecnico** | 48 | 44 | 2 | 0 | 2 | 2 rutas | 92.5% |
| **3** | **Solicitante** | 24 | 9 | 5 | 0 | 10 | 2 rutas | 54.2% |
| **4** | **Supervisor** | 56 | 27 | 6 | 0 | 23 | 3 rutas | 55.4% |
| **5** | **Gestor de Area** | 29 | 11 | 3 | 0 | 15 | 1 ruta | 44.8% |
| **6** | **Auditor** | 30 | 3 | 13 | 0 | 14 | 1 ruta | 32.5% |
| **7** | **Aprobador** | 19 | 4 | 3 | 0 | 12 | 1 ruta | 31.6% |
| **8** | **Gestor de Cambios** | 27 | 6 | 7 | 0 | 14 | 1 ruta | 37.0% |
| **9** | **Gestor de Activos y Config.** | 35 | 9 | 8 | 0 | 18 | 1 ruta | 38.6% |
| **10** | **Gestor de Problemas** | 18 | 4 | 1 | 0 | 13 | 1 ruta | 29.2% |
| **TOTAL** | **Consolidado del Sistema** | **425** | **238** | **59** | **2** | **126** | **16 rutas** | **58.7%** |

---

## 3. Matrices Detalladas por Perfil

---

### MATRIZ PERFIL 1 — ADMINISTRADOR

- **Rol y Alcance:** Gobierno, parametrizacion, catalogos, seguridad, SLA, flujos ITIL y retencion. Consulta global de la operacion sin operar tickets ni auto-aprobar (SoD).
- **Inicio Propuesto:** `/admin`
- **Presentador de Ticket:** `VistaTicketAdministrador.tsx` (Existe).

#### Tabla Comparativa: Propuesta vs. Software Actual
| Codigo | Seccion / Funcionalidad | Ruta URL | Estado Propuesta | Estado en Software | % Hecho | Archivos Reales en Software | Archivos por Crear / Adaptar | Observaciones de Brecha |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **1.1.1** | Gestion de usuarios | `/admin/usuarios` | EXISTE | COMPLETO | 100% | `src/app/plataforma/admin/usuarios/page.tsx`, `/api/usuarios`, `[id]`, `[id]/desbloquear`, `enviar-credenciales` | Ninguno | Alta, edicion, bloqueo, desbloqueo y credenciales operativos. |
| **1.1.1.1** | Validacion de documento (DNI, RUC, CE) | `/admin/usuarios` | ADAPTAR | ALTO AVANCE | 90% | `src/lib/validaciones.ts` | Ajustar validador regex por tipo documento | Validacion base existe en frontend; falta reforzar tiempo real. |
| **1.1.2** | Perfiles y permisos | `/admin/perfiles` | EXISTE | ALTO AVANCE | 85% | `src/app/plataforma/admin/perfiles/page.tsx`, `/api/perfiles`, `[id]` | `src/lib/permisos.ts` | CRUD y matriz visual existen; falta incluir formalmente los 10 perfiles. |
| **1.1.3** | Estructura del menu | `/admin/menu` | EXISTE | ALTO AVANCE | 80% | `src/app/plataforma/admin/menu/page.tsx`, `/api/menu/admin`, `src/lib/menu.ts` | `src/lib/scripts/migrar_menu_perfiles.ts` | Existe sembrado de tecnico (`migrar_menu_tecnico.ts`); falta generalizar a 10 perfiles. |
| **1.2.1** | Servicios de incidentes | `/admin/servicios?tipo=1` | EXISTE | COMPLETO | 100% | `src/app/plataforma/admin/servicios/page.tsx`, `/api/servicios`, `[id]` | Ninguno | Filtro por tipo de servicio operativo en base de datos y UI. |
| **1.2.2** | Servicios de solicitudes | `/admin/servicios?tipo=2` | EXISTE | COMPLETO | 95% | `src/app/plataforma/admin/servicios/page.tsx`, `/api/servicios/[id]/workflow` | Ninguno | Flujo de aprobacion por servicio funcional. |
| **1.2.3** | Crear y editar servicio | `/admin/servicios?vista=crear` | EXISTE | COMPLETO | 95% | `src/app/plataforma/admin/servicios/[id]/formulario/page.tsx`, `ui.tsx` | Ninguno | Formulario por pasos con validaciones activas. |
| **1.2.4** | Configuracion de categorias | `/admin/servicios?vista=categorias` | EXISTE | COMPLETO | 100% | `GestionCategorias.tsx`, `/api/admin/categorias`, `[id]` | Ninguno | Unicidad de nombre y codigo validada. |
| **1.2.5** | Objetivos SLA | `/admin/servicios/sla` | EXISTE | COMPLETO | 95% | `admin/servicios/sla/page.tsx`, `MatrizPrioridadSla.tsx`, `/api/admin/sla` | Ninguno | Matriz de prioridad Impacto x Urgencia y tiempos operativos. |
| **1.3.1** | Configuracion Incidentes | `/admin/tickets-formularios`, `tickets-vistas` | EXISTE | COMPLETO | 90% | `admin/tickets-formularios/page.tsx`, `admin/tickets-vistas/page.tsx` | Ninguno | Formulario y estados de incidentes administrables. |
| **1.3.2** | Configuracion Solicitudes | `/admin/tickets-formularios`, `tickets-vistas` | EXISTE | COMPLETO | 90% | `admin/tickets-formularios/page.tsx`, `admin/tickets-vistas/page.tsx` | Ninguno | Formularios dinamicos y etapas de aprobacion. |
| **1.3.3.1** | Formulario de Problemas | `/admin/procesos/problemas/formulario` | ADAPTAR | ALTO AVANCE | 85% | `admin/procesos/problemas/formulario/page.tsx` (5 modales, 4 pestanas) | Unificar modales duplicados | Modales duplicados con cambios; unificar en carpeta comun. |
| **1.3.3.1.2**| Campos personalizados Problemas | `/admin/procesos/problemas/formulario` | NUEVO | PARCIAL / BACKEND | 50% | `/api/admin/problemas/campos-personalizados` | `PestanaCamposPersonalizados.tsx` | El API existe y responde; falta construir la pestana en el frontend. |
| **1.3.3.1.4**| Matriz de prioridad Problemas | `/admin/procesos/problemas/formulario` | NUEVO | PARCIAL / BACKEND | 50% | `/api/admin/problemas/matriz-prioridad` | `PestanaPrioridad.tsx` | El API backend existe; falta el componente de interfaz grafica. |
| **1.3.3.2** | Flujo de Problemas | `/admin/procesos/problemas/flujo` | EXISTE | COMPLETO | 95% | `admin/procesos/problemas/flujo/page.tsx` (8 pestanas y 9 APIs) | Ninguno | Estados, transiciones, asignacion, tiempos, escalamiento y tareas. |
| **1.3.3.3** | Relaciones de Problemas | `/admin/procesos/problemas/relaciones` | EXISTE | COMPLETO | 95% | `admin/procesos/problemas/relaciones/page.tsx` (6 pestanas y 3 APIs) | Ninguno | Umbrales de recurrencia, incidentes vinculados, KEDB, RFC y CI. |
| **1.3.4.1** | Formulario de RFC | `/admin/procesos/cambios/formulario` | ADAPTAR | ALTO AVANCE | 95% | `admin/procesos/cambios/formulario/page.tsx` (7 pestanas) | Unificar `BarraAccionesComun.tsx` | Funcional; requiere unificar modales duplicados con problemas. |
| **1.3.4.2** | Tipos y requisitos de Cambios | `/admin/procesos/cambios/tipos-requisitos` | EXISTE | COMPLETO | 95% | `admin/procesos/cambios/tipos-requisitos/page.tsx` (4 pestanas) | Ninguno | Tipos, matriz de autoridad, modelos estandar y reglas de clasificacion. |
| **1.3.4.3** | Flujo evaluacion de Cambios | `/admin/procesos/cambios/flujo-evaluacion` | ADAPTAR | ALTO AVANCE | 95% | `admin/procesos/cambios/flujo-evaluacion/page.tsx` (8 pestanas) | Reemplazar `Iconos.tsx` local por shared | Completamente funcional; solo limpieza de iconos duplicados. |
| **1.3.4.4** | Notificaciones y calendario RFC | `/admin/procesos/cambios/notificaciones-calendario` | ADAPTAR | ALTO AVANCE | 95% | `admin/procesos/cambios/notificaciones-calendario/page.tsx` (6 pestanas) | Reemplazar `Iconos.tsx` local | Ventanas de mantenimiento, periodos de freeze, feriados y capacidad. |
| **1.4.1** | Departamentos empresariales | `/admin/departamentos-empresa` | EXISTE | COMPLETO | 100% | `admin/departamentos-empresa/page.tsx`, `/api/departamentos-empresa/*` | Ninguno | Areas de negocio y asignacion de Gestor de Area operativas. |
| **1.4.2** | Departamentos y grupos TI | `/admin/departamentos` | EXISTE | COMPLETO | 100% | `admin/departamentos/page.tsx`, `/api/departamentos-ti/*` | Ninguno | Grupos resolutores N1/N2/N3 operativos. |
| **1.4.3** | Tecnicos y niveles | `/admin/tecnicos` | EXISTE | COMPLETO | 95% | `admin/tecnicos/page.tsx`, `/api/tecnicos/*`, `/api/admin/tecnicos/ausencias` | Ninguno | Habilidades, turnos y registro de ausencias funcionales. |
| **1.4.4** | Supervisores de TI | `/admin/departamentos?vista=supervisores` | EXISTE | COMPLETO | 90% | `admin/departamentos/page.tsx` | Ninguno | Asignacion de supervisores por grupo tecnico. |
| **1.5.1** | Tipos, modelos y atributos Activos| `/admin/activos-config/tipos-modelos-atributos` | EXISTE | COMPLETO | 95% | `admin/activos-config/tipos-modelos-atributos/page.tsx` (9 pestanas) | Ninguno | Clases, atributos, fabricantes, formulario y listas auxiliares. |
| **1.5.2** | Ciclos de vida Activos | `/admin/activos-config/ciclos-vida-transiciones` | EXISTE | COMPLETO | 95% | `admin/activos-config/ciclos-vida-transiciones/page.tsx` (6 pestanas) | Ninguno | Estados, transiciones, custodia, mantenimiento y bajas. |
| **1.5.3** | Licencias y contratos | `/admin/activos-config/licencias-contratos` | EXISTE | COMPLETO | 95% | `admin/activos-config/licencias-contratos/page.tsx` (6 pestanas) | Ninguno | Tipos de licencia, contratos, sobreuso y alertas. |
| **1.5.4** | CMDB y relaciones de CI | `/admin/activos-config/cmdb-relaciones` | EXISTE | COMPLETO | 95% | `admin/activos-config/cmdb-relaciones/page.tsx` (6 pestanas) | Ninguno | Clases de CI, tipos de relacion, criticidad y reglas. |
| **1.6** | Comunicaciones y plantillas | `/admin/notificaciones` | EXISTE | COMPLETO | 90% | `admin/notificaciones/page.tsx`, `/api/admin/notificaciones/reglas` | Ninguno | Plantillas y servidor SMTP corporativo. |
| **1.7** | Gobierno del conocimiento | `/admin/conocimiento-config` | EXISTE | COMPLETO | 90% | `admin/conocimiento-config/page.tsx`, `/api/admin/conocimiento/*` | Ninguno | Categorias KB, revisores y politicas editoriales. |
| **1.8.1** | Auditoria de cambios sistema | `/admin/auditoria-sistema` | EXISTE | COMPLETO | 95% | `admin/auditoria-sistema/page.tsx`, `/api/admin/auditoria-sistema` | Ninguno | Registro inmutable de configuracion antes y despues. |
| **1.8.2** | Logs de seguridad y accesos | `/admin/seguridad-logs` | EXISTE | COMPLETO | 95% | `admin/seguridad-logs/page.tsx`, `/api/admin/logs` | Ninguno | Intentos de login fallidos, bloqueos y sesiones. |
| **1.8.3** | Retencion y mantenimiento | `/admin/mantenimiento-datos` | EXISTE | COMPLETO | 95% | `admin/mantenimiento-datos/page.tsx`, `/api/admin/mantenimiento-datos` | Ninguno | Politicas de purga y optimizacion de base de datos. |
| **2.1** | Indicadores operativos y SLA | `/tickets/reportes` | EXISTE | COMPLETO | 90% | `tickets/reportes/page.tsx`, `/api/reportes/indicadores` | Ninguno | Metricas globales de tickets, SLA y satisfaccion. |
| **2.2** | Disenador de tableros | `/admin/reportes-disenador` | EXISTE | COMPLETO | 90% | `admin/reportes-disenador/page.tsx`, `/api/admin/reportes-disenador` | Ninguno | Creacion de widgets y tableros analiticos. |
| **3.1-3.6** | Supervision global (solo lectura)| `/tickets/gestion/todos`, `/cambios`, `/problemas`, `/activos` | EXISTE | COMPLETO | 90% | Rutas operativas compartidas con presentador `VistaTicketAdministrador.tsx` | Ninguno | Permite auditar sin botones de ejecucion operativa. |
| **4.1-4.3** | Salud del sistema (DB, Jobs, Mail) | `/admin/salud-sistema` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/admin/salud-sistema/page.tsx`, `/api/admin/salud-sistema/route.ts` | Monitoreo en vivo de estado de BD, tareas cron y cola de email. |
| **5.2** | Preferencias de notificacion | `/mi-cuenta/notificaciones` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`, `/api/mi-cuenta/notificaciones/route.ts` | Matriz de eventos por canal y horarios de silencio. |

#### Funcionalidades en el Software que NO estan en la Propuesta (o en Retiro / Legacy)
1. `src/app/plataforma/admin/rfc/page.tsx` y `/api/admin/rfc-config/route.ts`: Modulo legacy de configuracion de RFC. Esta 100% construido y operativo en el software actual, pero en la propuesta se estipula retirarlo y migrar sus parametros a `/admin/procesos/cambios`.
2. `src/app/plataforma/admin/page.tsx`: Pagina introductoria generica de bienvenida que no figura en la jerarquia oficial (la propuesta estipula redirigir `/admin` a `/admin/usuarios` o dashboard administrativo).

---

### MATRIZ PERFIL 2 — TECNICO

- **Rol y Alcance:** Resolutor de soporte N1/N2/N3: atiende tickets, registra problemas, implementa cambios autorizados, realiza conteo de activos y redacta articulos de conocimiento.
- **Inicio Propuesto:** `/tecnico/panel`
- **Presentador de Ticket:** `VistaTicketOperador.tsx` (Existe).

#### Tabla Comparativa: Propuesta vs. Software Actual
| Codigo | Seccion / Funcionalidad | Ruta URL | Estado Propuesta | Estado en Software | % Hecho | Archivos Reales en Software | Archivos por Crear / Adaptar | Observaciones de Brecha |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **1.1** | Panel del tecnico | `/tecnico/panel` | EXISTE | COMPLETO | 100% | `src/app/plataforma/perfiles/tecnico/panel/page.tsx`, `/api/perfiles/tecnico/contadores` | Ninguno | Contadores de asignados, vencidos, urgentes y widgets. |
| **1.2** | Mis tareas personales | `/tecnico/tareas` | EXISTE | COMPLETO | 90% | `src/app/plataforma/perfiles/tecnico/tareas/page.tsx`, `/api/perfiles/tecnico/recordatorios` | Ninguno | Tareas operativas de tickets y recordatorios personales. |
| **1.3** | Mi agenda y disponibilidad | `/tecnico/agenda` | EXISTE | COMPLETO | 90% | `src/app/plataforma/perfiles/tecnico/agenda/page.tsx` | Ninguno | Calendario de guardias y conmutador Disponible/Ocupado. |
| **1.4** | Mi desempeno | `/tecnico/desempeno` | EXISTE | COMPLETO | 90% | `src/app/plataforma/perfiles/tecnico/desempeno/page.tsx` | Ninguno | Indicadores personales de MTTR, CSAT y volumen resuelto. |
| **2.1** | Mis tickets asignados | `/tecnico/mesa/asignados` | EXISTE | COMPLETO | 100% | `src/app/plataforma/perfiles/tecnico/mesa/asignados/page.tsx`, `VistaTicketOperador.tsx` | Ninguno | Cola individual con semaforizacion SLA y acciones rapidas. |
| **2.2** | Bandeja de pendientes (cola libre) | `/tecnico/mesa/pendientes` | EXISTE | COMPLETO | 100% | `src/app/plataforma/perfiles/tecnico/mesa/pendientes/page.tsx`, `/api/perfiles/tecnico/mesa/tomar` | Ninguno | Permite auto-asignarse tickets sin tecnico de forma atomica. |
| **2.3** | Tickets de mi area tecnica | `/tecnico/mesa/area` | EXISTE | COMPLETO | 90% | `src/app/plataforma/perfiles/tecnico/mesa/area/page.tsx` | Ninguno | Visibilidad de tickets del grupo para brindar asistencia. |
| **2.4** | Registrar ticket para usuario | `/tecnico/mesa/registrar` | EXISTE | COMPLETO | 95% | `src/app/plataforma/perfiles/tecnico/mesa/registrar/page.tsx`, `/api/perfiles/tecnico/usuarios` | Ninguno | Registro directo por telefono o presencial con resolucion primer contacto. |
| **2.5** | Busqueda avanzada | `/tecnico/mesa/buscar` | EXISTE | COMPLETO | 90% | `src/app/plataforma/perfiles/tecnico/mesa/buscar/page.tsx` | Ninguno | Buscador multicriterio en tickets y expedientes. |
| **2.6** | Historial de resueltos | `/tecnico/mesa/historial` | EXISTE | COMPLETO | 90% | `src/app/plataforma/perfiles/tecnico/mesa/historial/page.tsx` | Ninguno | Consulta de tickets culminados por el tecnico. |
| **2.7** | Incidente mayor (sala de crisis) | `/tecnico/mesa/incidente-mayor` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/tecnico/mesa/incidente-mayor/page.tsx`, `/api/perfiles/tecnico/incidente-mayor` | Sala de coordinacion tecnica ante caidas criticas P1. |
| **3.1-3.2** | Semaforo y objetivos SLA | `/tecnico/sla/semaforo`, `objetivos` | EXISTE | COMPLETO | 95% | `src/app/plataforma/perfiles/tecnico/sla/semaforo/page.tsx`, `objetivos/page.tsx`, `src/lib/sla.ts` | Ninguno | Monitoreo del reloj de respuesta y resolucion en tiempo real. |
| **4.1-4.5** | Gestion de Problemas y KEDB | `/tecnico/problemas/*` | EXISTE | COMPLETO | 90% | 5 paginas en `src/app/plataforma/perfiles/tecnico/problemas/` (`asignados`, `grupo`, `nuevo`, `candidatos`, `errores-conocidos`) | Ninguno | Reporte de problemas, deteccion de candidatos y consulta de KEDB. |
| **5.1-5.6** | Gestion de Cambios (RFC) | `/tecnico/cambios/*` | EXISTE | COMPLETO | 90% | 6 paginas en `src/app/plataforma/perfiles/tecnico/cambios/` (`mis-cambios`, `nuevo`, `implementacion`, `calendario`, `impacto`, `historial`) | Ninguno | Solicitud RFC, consola de ejecucion Go/No-Go y calendario. |
| **6.1-6.5** | Activos, CMDB y Conteo en campo | `/tecnico/activos/*` | EXISTE | COMPLETO | 90% | 5 paginas en `src/app/plataforma/perfiles/tecnico/activos/` (`inventario`, `mapa`, `mantenimiento`, `conteos`, `licencias`) | Ninguno | Inventario operativo, escaneo de activos en campo y CMDB. |
| **7.1-7.4** | Base de Conocimiento | `/tecnico/conocimiento/*` | EXISTE | COMPLETO | 90% | 4 paginas en `src/app/plataforma/perfiles/tecnico/conocimiento/` (`base`, `mis-articulos`, `nuevo`, `revisiones`) | Ninguno | Redaccion y consulta de articulos tecnicos y soluciones. |
| **8** | Catalogo de servicios (consulta) | `/tecnico/catalogo` | EXISTE | COMPLETO | 100% | `src/app/plataforma/perfiles/tecnico/catalogo/page.tsx` | Ninguno | Vista rapida de especificaciones y SLAs de servicios. |
| **9.1** | Mi perfil y seguridad | `/mi-cuenta` | EXISTE | COMPLETO | 100% | `src/app/plataforma/mi-cuenta/page.tsx`, `/api/mi-cuenta` | Ninguno | Cambio de clave y datos de contacto. |
| **9.2** | Preferencias de notificacion | `/mi-cuenta/notificaciones` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/mi-cuenta/notificaciones/page.tsx` | Configurar avisos de nuevos tickets asignados y menciones. |

#### Funcionalidades en el Software que NO estan en la Propuesta
1. `src/app/plataforma/perfiles/tecnico/page.tsx`: Pagina landing de redireccion general del tecnico (la propuesta estipula como inicio unico y directo `/tecnico/panel`).

---

### MATRIZ PERFIL 3 — SOLICITANTE

- **Rol y Alcance:** Usuario final o cliente interno: genera tickets de incidente y solicitudes, consulta autoayuda, custodia activos y califica el servicio recibido.
- **Inicio Propuesto:** `/tickets`
- **Presentador de Ticket:** `VistaTicketConsumidor.tsx` (Existe).

#### Tabla Comparativa: Propuesta vs. Software Actual
| Codigo | Seccion / Funcionalidad | Ruta URL | Estado Propuesta | Estado en Software | % Hecho | Archivos Reales en Software | Archivos por Crear / Adaptar | Observaciones de Brecha |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **1.1** | Crear ticket desde catalogo | `/tickets/catalogo` | ADAPTAR | ALTO AVANCE | 85% | `src/app/plataforma/tickets/catalogo/page.tsx`, `incidentes/page.tsx`, `solicitudes/page.tsx` | Integrar wizard unificado | Formularios dinamicos funcionales; falta unificar wizard sin botones redundantes. |
| **1.1.3** | Sugerencia de autoayuda (Deflexion) | `/tickets/catalogo` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/api/conocimiento/sugerencias/route.ts` | Sugerir articulos KB en tiempo real al escribir el titulo para evitar crear tickets. |
| **1.2** | Mis tickets creados | `/tickets` | EXISTE | COMPLETO | 90% | `src/app/plataforma/tickets/page.tsx`, `TablaTickets.tsx`, `/api/tickets` | Ninguno | Bandeja personal con estados y temporizador SLA restante. |
| **1.2.1** | Seguimiento por etapas (Timeline) | `/tickets/[id]` | EXISTE | COMPLETO | 90% | `tickets/[id]/page.tsx`, `VistaTicketConsumidor.tsx`, `StepperProgresoConsumidor.tsx` | Ninguno | Barra de progreso visual amigable para el usuario. |
| **1.2.2** | Chat con el tecnico | `/tickets/[id]` | EXISTE | COMPLETO | 95% | `StreamChatPublico.tsx`, `/api/tickets/[id]/comentarios` | Ninguno | Mensajes publicos y archivos adjuntos de evidencia. |
| **1.2.3** | Calificar atencion (CSAT) | `/tickets/[id]` | EXISTE | ALTO AVANCE | 85% | `TarjetaCalificacionCsat.tsx` | Validar regla RN-27 | Evaluacion de 1 a 5 estrellas; falta exigir comentario en 1 y 2 estrellas. |
| **1.2.4** | Reabrir ticket resuelto | `/tickets/[id]` | ADAPTAR | ALTO AVANCE | 75% | `tickets/[id]/page.tsx` | Validar ventana de 5 dias habiles | Boton existe; falta validar formalmente el plazo de expiracion de reapertura. |
| **2.1-2.2** | Catalogo de servicios (Filtros) | `/tickets/catalogo?tipo=...` | ADAPTAR | ALTO AVANCE | 85% | `tickets/catalogo/page.tsx` | Quitar botones redundantes en UI | Funciona mediante query params; falta limpiar botones superiores duplicados. |
| **3.1-3.2** | Portal de Autoayuda (Knowledge) | `/conocimiento` | NUEVO | NO IMPLEMENTADO | 0% | `/api/conocimiento` (API base) | `src/app/plataforma/conocimiento/page.tsx`, `[id]/page.tsx`, `[id]/feedback` | Vista de consulta publica de articulos KB con votacion Util/No Util. |
| **4.1-4.3** | Mis activos en custodia | `/activos/mis-activos` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/activos/mis-activos/page.tsx`, `/api/activos/mis-activos/*` | Listado de computadoras/celulares asignados, firma de actas digitales y reporte de fallas. |
| **5** | Avisos de mantenimiento programado | `/avisos/mantenimientos` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/avisos/mantenimientos/page.tsx`, `/api/avisos/mantenimientos` | Notificar suspensiones de servicio que afecten su departamento. |
| **6.1-6.2** | Mi perfil y notificaciones | `/mi-cuenta` | ADAPTAR | ALTO AVANCE | 80% | `mi-cuenta/page.tsx` | `mi-cuenta/notificaciones/page.tsx` | Datos personales operativos; falta modulo de preferencias de notificacion. |

#### Funcionalidades en el Software que NO estan en la Propuesta
1. `src/app/plataforma/incidentes/page.tsx` y `solicitudes/page.tsx`: Existen como rutas aisladas que duplican la logica de `/tickets/catalogo`. La propuesta las consolida bajo el catalogo interactivo.

---

### MATRIZ PERFIL 4 — SUPERVISOR

- **Rol y Alcance:** Jefatura operativa de TI: despacho, asignacion manual/masiva, balanceo de carga, monitoreo de SLA, intervencion en P1 y aprobacion tecnica.
- **Inicio Propuesto:** `/supervisor/panel`
- **Presentador de Ticket:** `VistaTicketSupervisor.tsx` (Existe).

#### Tabla Comparativa: Propuesta vs. Software Actual
| Codigo | Seccion / Funcionalidad | Ruta URL | Estado Propuesta | Estado en Software | % Hecho | Archivos Reales en Software | Archivos por Crear / Adaptar | Observaciones de Brecha |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **1.1-1.3** | Panel de supervision gerencial | `/supervisor/panel` | NUEVO | NO IMPLEMENTADO | 0% | Actualmente usa `/dashboard` | `src/app/plataforma/perfiles/supervisor/panel/page.tsx`, `/api/perfiles/supervisor/panel` | Dashboard con backlog del grupo, tecnicos sobrecargados y riesgos P1. |
| **2.1** | Centro de asignacion y despacho | `/tickets/gestion/asignar` | EXISTE | COMPLETO | 90% | `src/app/plataforma/tickets/gestion/asignar/page.tsx`, `ControlesDespacho.tsx` | Ninguno | Asignacion manual y reasignacion con sustento obligatorio. |
| **2.2** | Monitoreo de tecnicos del equipo | `/tickets/gestion/tecnicos` | EXISTE | COMPLETO | 90% | `src/app/plataforma/tickets/gestion/tecnicos/page.tsx`, `/api/tecnicos` | Ninguno | Visualizador de carga de trabajo, disponibilidad y colas activas. |
| **2.2.2** | Ausencias del equipo de soporte | `/supervisor/equipo/ausencias` | NUEVO | NO IMPLEMENTADO | 0% | `/api/admin/tecnicos/ausencias` (Existe en admin) | `src/app/plataforma/perfiles/supervisor/equipo/ausencias/page.tsx` | Registrar vacaciones y licencias para pausar asignaciones automaticas. |
| **2.3** | Todos los tickets del area tecnica | `/tickets/gestion/todos` | EXISTE | COMPLETO | 90% | `tickets/gestion/todos/page.tsx`, `VistaTicketSupervisor.tsx` | Ninguno | Vista global con controles de reasignacion forzada y auditoria. |
| **2.4** | Escalamientos y riesgo de SLA | `/supervisor/sla/escalamientos` | NUEVO | NO IMPLEMENTADO | 0% | `src/lib/sla.ts` (Calculo existe) | `src/app/plataforma/perfiles/supervisor/sla/escalamientos/page.tsx` | Bandeja de tickets con consumo >= 75% del SLA y escalados a segundo nivel. |
| **2.5** | Declaracion de Incidente Mayor | `/supervisor/incidentes-mayores` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/supervisor/incidentes-mayores/page.tsx`, `/api/perfiles/supervisor/incidentes-mayores` | Protocolo P1: declaracion, comunicados y comite de crisis. |
| **3.1-3.7** | Bandejas operativas de gestion | `/tickets/gestion/*` | EXISTE | COMPLETO | 90% | 7 paginas en `tickets/gestion/` (`incidentes`, `solicitudes`, `mios`, `asignados`, `bandeja`, `resueltos`, `crear`) | Ninguno | Bandejas especializadas plenamente operativas. |
| **3.8** | Auditoria de tickets del area | `/tickets/gestion/auditoria` | ADAPTAR | ALTO AVANCE | 85% | `tickets/gestion/auditoria/page.tsx` | Filtrar solo al departamento tecnico | Limitar los registros de auditoria forense a las colas de su equipo. |
| **4.1-4.3** | Semaforo grupal e incumplimientos | `/supervisor/sla/*` | NUEVO | NO IMPLEMENTADO | 0% | `src/app/plataforma/perfiles/tecnico/sla/*` (Existe para tecnico) | `src/app/plataforma/perfiles/supervisor/sla/semaforo/page.tsx`, `incumplimientos/page.tsx` | Semaforo global del area y analisis causa-raiz de tickets vencidos. |
| **5.1-5.3** | Problemas y Errores Conocidos | `/problemas`, `/problemas/kedb` | EXISTE | COMPLETO | 85% | `problemas/page.tsx`, `problemas/kedb/page.tsx`, `ProblemasWorkspace.tsx` | `supervisor/problemas/asignar/page.tsx` | Registro y consulta operativos; falta pantalla de reparto de problemas. |
| **6.1-6.4** | Cambios tecnicos y calendario | `/cambios/gestion/calendario` | EXISTE | PARCIAL | 50% | `cambios/gestion/calendario/page.tsx`, `TarjetaAprobacionSod.tsx` | `supervisor/cambios/aprobaciones/page.tsx`, `impacto/page.tsx`, `programar/page.tsx` | Calendario existe; faltan vistas de aprobacion tecnica de RFC y reprogramacion. |
| **7.1-7.3** | Activos e inventario | `/activos/inventario`, `licencias` | EXISTE | ALTO AVANCE | 80% | `activos/inventario/page.tsx`, `activos/licencias/page.tsx` | `supervisor/activos/bajas/page.tsx` | Consulta operativa; falta formulario de aprobacion de bajas de equipos. |
| **8.1-8.2** | Revision editorial de articulos KB | `/supervisor/conocimiento/*` | NUEVO | NO IMPLEMENTADO | 0% | `tecnico/conocimiento/revisiones` (Existe en tecnico) | `src/app/plataforma/perfiles/supervisor/conocimiento/revisiones/page.tsx` | Aprobar articulos tecnicos para publicacion institucional. |
| **9.1** | Indicadores operativos y SLA | `/tickets/reportes` | ADAPTAR | ALTO AVANCE | 85% | `tickets/reportes/page.tsx`, `/api/reportes/indicadores` | Filtrar por grupo de soporte | Adaptar filtros para restringir los graficos a su departamento. |
| **9.2** | Productividad individual | `/supervisor/reportes/productividad`| NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/supervisor/reportes/productividad/page.tsx` | Metricas de resolucion por tecnico para gestion de turnos y cargas. |
| **10.1** | Vistas y respuestas compartidas | `/supervisor/equipo/vistas` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/supervisor/equipo/vistas/page.tsx` | Plantillas de respuesta rapida compartidas para los tecnicos. |
| **11.1-11.2**| Eventos y resiliencia de servicios | `/operacion/eventos`, `resiliencia` | EXISTE | COMPLETO | 90% | `operacion/eventos/page.tsx`, `operacion/resiliencia/page.tsx` | Ninguno | Monitoreo de alertas operativas y conversion a incidentes. |

#### Funcionalidades en el Software que NO estan en la Propuesta
1. `src/app/plataforma/tickets/gestion/page.tsx`: Hub centralizado de enlaces que en la propuesta se distribuye en opciones del menu lateral.
2. `src/app/plataforma/tickets/gestion/colaboradores/page.tsx` y `departamento/page.tsx`: Estan alojadas en el menu generico de tickets pero pertenecen funcionalmente al Gestor de Area.

---

### MATRIZ PERFIL 5 — GESTOR DE AREA

- **Rol y Alcance:** Jefe de area de negocio (Finanzas, Legal, RRHH, Ventas): autoriza solicitudes de servicio con impacto de recursos, vigila cambios que afectan su proceso y administra a sus colaboradores.
- **Inicio Propuesto:** `/gestor-area/panel`
- **Presentador de Ticket:** `VistaTicketGobernanza.tsx` / `PresentadorGestorArea.tsx`.

#### Tabla Comparativa: Propuesta vs. Software Actual
| Codigo | Seccion / Funcionalidad | Ruta URL | Estado Propuesta | Estado en Software | % Hecho | Archivos Reales en Software | Archivos por Crear / Adaptar | Observaciones de Brecha |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **1.1-1.3** | Panel del area de negocio | `/gestor-area/panel` | NUEVO | NO IMPLEMENTADO | 0% | Actualmente usa `/dashboard` | `src/app/plataforma/perfiles/gestor-area/panel/page.tsx`, `/api/perfiles/gestor-area/panel` | Aprobaciones pendientes, tickets de su personal y cambios con interrupcion. |
| **2.1** | Registrar ticket para el personal | `/tickets/gestion/crear` | EXISTE | COMPLETO | 90% | `src/app/plataforma/tickets/gestion/crear/page.tsx` | Ninguno | Apertura formal de requerimientos a nombre de un subalterno. |
| **2.2** | Tickets de mi departamento | `/tickets/gestion/departamento` | EXISTE | COMPLETO | 90% | `src/app/plataforma/tickets/gestion/departamento/page.tsx`, `VistaTicketGobernanza.tsx` | `PresentadorGestorArea.tsx` | Vista exclusiva de tickets de su departamento; falta presentador personalizado. |
| **2.3** | Colaboradores de mi area | `/tickets/gestion/colaboradores` | EXISTE | COMPLETO | 90% | `src/app/plataforma/tickets/gestion/colaboradores/page.tsx`, `/api/area/colaboradores` | `autorizaciones/route.ts` | Directorio de empleados de su area; falta autorizacion de accesos restringidos. |
| **3.1** | Aprobaciones de solicitudes | `/tickets/gestion/aprobaciones` | EXISTE | COMPLETO | 90% | `tickets/gestion/aprobaciones/page.tsx`, `TarjetaAprobacionSod.tsx` | Ninguno | Aprobacion/Rechazo de solicitudes con Segregacion SoD (RN-28). |
| **3.2** | Aprobacion de negocio de Cambios | `/gestor-area/cambios/aprobaciones` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/gestor-area/cambios/aprobaciones/page.tsx` | Dictamen de impacto de negocio para RFC que tocan sus sistemas. |
| **3.3-3.4** | Historial y delegacion de firmas | `/gestor-area/aprobaciones/*` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/gestor-area/aprobaciones/historial`, `delegacion` | Bitacora de aprobaciones pasadas y delegacion a suplente en ausencias. |
| **4** | Catalogo de servicios (consulta) | `/tickets/catalogo` | EXISTE | COMPLETO | 85% | `tickets/catalogo/page.tsx` | Ninguno | Consulta de costos, alcances y requisitos de servicios corporativos. |
| **5.1** | Calendario de mantenimientos | `/cambios/gestion/calendario` | EXISTE | COMPLETO | 90% | `cambios/gestion/calendario/page.tsx` | Ninguno | Ver fechas de congelamiento y ventanas tecnicas programadas. |
| **5.2** | Cambios con interrupcion al area | `/gestor-area/cambios/impacto` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/gestor-area/cambios/impacto/page.tsx` | Alertas tempranas de indisponibilidad de sistemas de su area. |
| **5.3** | Solicitar cambio Normal | `/cambios/gestion/crear` | ADAPTAR | ALTO AVANCE | 85% | `cambios/gestion/crear/page.tsx` | Restringir solo a tipo Normal | Permitirle proponer mejoras a sistemas sin exponer cambios de emergencia. |
| **6.1-6.2** | Activos y contratos del area | `/gestor-area/activos`, `contratos` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/gestor-area/activos/page.tsx`, `contratos/page.tsx` | Lectura de equipos asignados a sus colaboradores y garantias vigentes. |
| **7** | Reportes analiticos del area | `/gestor-area/reportes` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/gestor-area/reportes/page.tsx` | Volumen de soporte por empleado, SLA percibido y satisfaccion CSAT. |
| **8** | Base de conocimiento institucional| `/conocimiento` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/conocimiento/page.tsx` | Consulta de manuales y politicas corporativas. |

#### Funcionalidades en el Software que NO estan en la Propuesta
1. Acceso residual a vistas tecnicas: Actualmente el perfil Gestor de Area puede visualizar opciones tecnicas en `/tickets/gestion` si el middleware no restringe explicitamente subrutas operativas.

---

### MATRIZ PERFIL 6 — AUDITOR

- **Rol y Alcance:** Control interno, cumplimiento normativo (ISO 20000 / ISO 27001), segregacion SoD, inalterabilidad de bitacoras y verificacion de licencias. Solo lectura estricta.
- **Inicio Propuesto:** `/auditor/panel`
- **Presentador de Ticket:** `VistaTicketGobernanza.tsx` / `PresentadorAuditor.tsx` (Solo lectura).

#### Tabla Comparativa: Propuesta vs. Software Actual
| Codigo | Seccion / Funcionalidad | Ruta URL | Estado Propuesta | Estado en Software | % Hecho | Archivos Reales en Software | Archivos por Crear / Adaptar | Observaciones de Brecha |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **1** | Panel de control de auditoria | `/auditor/panel` | NUEVO | NO IMPLEMENTADO | 0% | Actualmente usa `/dashboard` | `src/app/plataforma/perfiles/auditor/panel/page.tsx`, `/api/perfiles/auditor/panel` | Tablero de cumplimiento normativo, hallazgos y desvios de SLA. |
| **2.1** | Todos los tickets (lectura estricta)| `/tickets/gestion/todos` | ADAPTAR | ALTO AVANCE | 85% | `tickets/gestion/todos/page.tsx`, `VistaTicketGobernanza.tsx` | `PresentadorAuditor.tsx` | La vista existe; falta retirar botones de accion y aplicar presentador ciego. |
| **2.2** | Auditoria forense de tickets | `/tickets/gestion/auditoria` | EXISTE | COMPLETO | 90% | `tickets/gestion/auditoria/page.tsx` | `src/app/api/perfiles/auditor/evidencia/route.ts` | Bitacora inmutable existe; falta exportacion formal con hash criptografico. |
| **2.3** | Segregacion de funciones (SoD) | `/auditor/cumplimiento/sod` | NUEVO | NO IMPLEMENTADO | 0% | `TarjetaAprobacionSod.tsx` (Regla existe) | `src/app/plataforma/perfiles/auditor/cumplimiento/sod/page.tsx` | Consola que detecta intentos de auto-aprobacion o conflictos de interes. |
| **2.4** | Muestreo aleatorio de auditoria | `/auditor/muestreo` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/auditor/muestreo/page.tsx` | Extraccion aleatoria de expedientes para control de calidad. |
| **3.1-3.4** | Auditoria de configuracion y logs | `/admin/auditoria-sistema`, `seguridad-logs`, `perfiles` | ADAPTAR | ALTO AVANCE | 75% | Paginas existen en `src/app/plataforma/admin/*` | Autorizar rol Auditor en `src/lib/page-auth.ts` | Las pantallas ya estan construidas en Admin; solo falta autorizar lectura al Auditor. |
| **3.5** | Recertificacion periodica accesos | `/auditor/accesos/recertificacion` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/auditor/accesos/recertificacion/page.tsx` | Campana semestral de revalidacion de perfiles y usuarios activos. |
| **4.1-4.4** | Cumplimiento de Cambios y SLA | `/cambios/gestion/todos`, `/tickets/reportes` | ADAPTAR | ALTO AVANCE | 80% | `cambios/gestion/todos/page.tsx`, `tickets/reportes/page.tsx` | `auditor/cumplimiento/cambios/page.tsx` | Historiales existen; falta tablero de cambios sin autorizacion previa. |
| **5.1-5.4** | Auditoria de Activos y CMDB | `/activos/inventario`, `licencias` | ADAPTAR | ALTO AVANCE | 75% | `activos/inventario/page.tsx`, `activos/licencias/page.tsx` | `auditor/cmdb/resultados/page.tsx`, `auditor/activos/bajas/page.tsx` | Inventario existe; faltan actas de baja formal y discrepancias CMDB. |
| **6.1-6.3** | Informes oficiales de auditoria | `/auditor/informes` | NUEVO | NO IMPLEMENTADO | 0% | `admin/reportes-disenador/page.tsx` (Existe en admin) | `src/app/plataforma/perfiles/auditor/informes/page.tsx` | Registro de hallazgos, dictamenes y seguimiento de no conformidades. |

#### Funcionalidades en el Software que NO estan en la Propuesta
1. Redireccion a dashboard operativo: Al ingresar al software, el auditor ve el dashboard tecnico general con metricas de atencion en lugar de indicadores de gobierno y cumplimiento.

---

### MATRIZ PERFIL 7 — APROBADOR

- **Rol y Alcance:** Miembro del Comite Asesor de Cambios (CAB), directores o gerentes con potestad de autorizar cambios mayores, presupuestos y solicitudes excepcionales.
- **Inicio Propuesto:** `/aprobador/panel`
- **Presentador de Ticket:** `VistaTicketGobernanza.tsx` / `PresentadorAprobador.tsx`.

#### Tabla Comparativa: Propuesta vs. Software Actual
| Codigo | Seccion / Funcionalidad | Ruta URL | Estado Propuesta | Estado en Software | % Hecho | Archivos Reales en Software | Archivos por Crear / Adaptar | Observaciones de Brecha |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **1** | Panel ejecutivo de aprobaciones | `/aprobador/panel` | NUEVO | NO IMPLEMENTADO | 0% | Actualmente usa `/dashboard` | `src/app/plataforma/perfiles/aprobador/panel/page.tsx`, `/api/perfiles/aprobador/panel` | Consolidado urgente de decisiones pendientes con fecha limite. |
| **2.1** | Aprobaciones de Cambios (RFC) | `/aprobador/cambios` | NUEVO | NO IMPLEMENTADO | 0% | `TarjetaAprobacionSod.tsx` (Componente existe) | `src/app/plataforma/perfiles/aprobador/cambios/page.tsx` | Evaluacion de RFC en etapas Direccion y Excepcion con voto individual. |
| **2.2** | Aprobaciones de solicitudes | `/tickets/gestion/aprobaciones` | EXISTE | COMPLETO | 90% | `tickets/gestion/aprobaciones/page.tsx` | Ninguno | Bandeja operativa de solicitudes de servicio lista para firmar. |
| **2.3-2.5** | Modelos estandar, Bajas y Problemas| `/aprobador/cambios/modelos`, `activos`, `problemas` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | Carpetas en `src/app/plataforma/perfiles/aprobador/*` | Aprobacion de plantillas pre-aprobadas, bajas patrimoniales y cierres P1. |
| **3.1** | Dictamen colegiado del CAB | `/cambios/gestion/cab` | ADAPTAR | ALTO AVANCE | 85% | `src/app/plataforma/cambios/gestion/cab/page.tsx` | Adaptar votacion y quorum formal | Panel CAB funcional; falta formalizar registro de quorum y desempate. |
| **3.2-3.3** | Agenda del CAB y Comite ECAB | `/aprobador/cab/agenda`, `emergencia` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/aprobador/cab/agenda`, `emergencia` | Calendario de sesiones ordinarias y mesa express para cambios de emergencia. |
| **4** | Calendario de cambios corporativo | `/cambios/gestion/calendario` | EXISTE | COMPLETO | 90% | `cambios/gestion/calendario/page.tsx` | Ninguno | Visualizacion de ventanas de mantenimiento aprobadas. |
| **5** | Detalle de RFC (Vista Decisor) | `/cambios/gestion/[id]` | ADAPTAR | ALTO AVANCE | 85% | `cambios/gestion/[id]/page.tsx` | `PresentadorRfcAprobador.tsx` | Vista con plan de rollback, riesgos y botones de dictamen. |
| **6-8** | Historial, delegaciones y reportes | `/aprobador/historial`, `delegaciones`, `reportes` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/aprobador/*` | Trazabilidad de votos emitidos, nombramiento de suplente y metricas. |

#### Funcionalidades en el Software que NO estan en la Propuesta
1. Falta de hub unificado: El aprobador actualmente debe navegar por separado a `/tickets/gestion/aprobaciones` para tickets y a `/cambios/gestion/cab` para cambios, sin una vista que consolide ambas firmas.

---

### MATRIZ PERFIL 8 — GESTOR DE CAMBIOS (CHANGE MANAGER)

- **Rol y Alcance:** Lider del proceso de Habilitacion del Cambio (ITIL Change Enablement): evaluacion de riesgo, revision de conflictos, presidencia del CAB, programacion y PIR.
- **Inicio Propuesto:** `/gestor-cambios/panel`
- **Presentador de Ticket:** `PresentadorRfcEvaluador.tsx` (Nuevo).

#### Tabla Comparativa: Propuesta vs. Software Actual
| Codigo | Seccion / Funcionalidad | Ruta URL | Estado Propuesta | Estado en Software | % Hecho | Archivos Reales en Software | Archivos por Crear / Adaptar | Observaciones de Brecha |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **1** | Panel de gestion de cambios | `/gestor-cambios/panel` | NUEVO | NO IMPLEMENTADO | 0% | Actualmente usa `/dashboard` | `src/app/plataforma/perfiles/gestor-cambios/panel/page.tsx`, `/api/perfiles/gestor-cambios/panel` | RFC por evaluar, cambios agendados para hoy, solapamientos y PIR pendientes. |
| **2.1** | Registrar solicitud RFC | `/cambios/gestion/crear` | EXISTE | COMPLETO | 90% | `src/app/plataforma/cambios/gestion/crear/page.tsx`, `/api/cambios` | Ninguno | Formulario completo con plan de rollback y analisis de riesgo. |
| **2.2** | Bandeja de RFC por evaluar | `/gestor-cambios/evaluacion` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/gestor-cambios/evaluacion/page.tsx` | Asignar evaluador tecnico, medir impacto y despachar al comite CAB. |
| **2.3** | Historial consolidado de cambios | `/cambios/gestion/todos` | EXISTE | COMPLETO | 90% | `cambios/gestion/todos/page.tsx` | Ninguno | Repositorio historico de todas las RFC ejecutadas y canceladas. |
| **2.4** | Detalle de RFC (Presentador Gestor)| `/cambios/gestion/[id]` | ADAPTAR | ALTO AVANCE | 85% | `cambios/gestion/[id]/page.tsx`, `/api/cambios/[id]` | `PresentadorRfcEvaluador.tsx` | Permitir al gestor reclasificar tipo, recalcular riesgo y autorizar pase. |
| **3.1-3.2** | Seguimiento de etapas y excepciones| `/gestor-cambios/autorizaciones` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `gestor-cambios/autorizaciones/page.tsx`, `/api/perfiles/gestor-cambios/excepciones` | Trazabilidad del circuito de firmas y aprobacion excepcional de freeze. |
| **4.1** | Calendario de ventanas tecnicas | `/cambios/gestion/calendario` | EXISTE | COMPLETO | 90% | `cambios/gestion/calendario/page.tsx` | Ninguno | Calendario mensual y semanal con estados de cambios. |
| **4.2-4.4** | Programacion, conflictos y ejecucion| `/gestor-cambios/programacion`, `conflictos`, `ejecucion` | NUEVO | NO IMPLEMENTADO | 0% | `admin/procesos/cambios/...` (Logica existe en admin) | `src/app/plataforma/perfiles/gestor-cambios/*` | Deteccion automatica de solapamientos entre CIs y tablero Go/No-Go en vivo. |
| **5.1-5.2** | Presidencia del CAB y actas | `/cambios/gestion/cab`, `agenda` | ADAPTAR | ALTO AVANCE | 80% | `cambios/gestion/cab/page.tsx` | `gestor-cambios/cab/agenda/page.tsx` | Presidir comite CAB, cerrar votaciones y emitir acta final. |
| **6** | Revision post-implementacion (PIR) | `/gestor-cambios/pir` | NUEVO | NO IMPLEMENTADO | 0% | `PestanaPir.tsx` (Existe en admin) | `src/app/plataforma/perfiles/gestor-cambios/pir/page.tsx` | Cierre formal de cambios evaluando si fueron exitosos o requirieron rollback. |
| **7** | Modelos de cambio estandar | `/gestor-cambios/modelos` | NUEVO | NO IMPLEMENTADO | 0% | `PestanaModelosEstandar.tsx` (Existe en admin) | `src/app/plataforma/perfiles/gestor-cambios/modelos/page.tsx` | Administracion y propuesta de plantillas de bajo riesgo pre-aprobadas. |
| **8.1-8.3** | Reglas de calendario (Ventanas/Freeze)| `/gestor-cambios/calendario-reglas` | ADAPTAR | ALTO AVANCE | 80% | Pestanas en `admin/procesos/cambios/notificaciones-calendario/` | Habilitar acceso directo al Gestor de Cambios | Permitir configurar fechas de congelamiento y ventanas sin ser Admin general. |
| **9** | Reportes de cambios y KPIs | `/gestor-cambios/reportes` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/perfiles/gestor-cambios/reportes/page.tsx` | Tasa de exito, cambios de emergencia y adherencia a ventanas. |

#### Funcionalidades en el Software que NO estan en la Propuesta
1. `src/app/plataforma/cambios/page.tsx`: Pantalla landing intermedia que no forma parte del esquema oficial.

---

### MATRIZ PERFIL 9 — GESTOR DE ACTIVOS Y CONFIGURACION (SACM / ITAM)

- **Rol y Alcance:** Responsable del ciclo de vida de hardware (HAM), software y licencias (SAM), topologia de relaciones en la CMDB y contratos con proveedores.
- **Inicio Propuesto:** `/gestor-activos/panel`
- **Presentador de Ticket:** `PresentadorActivoGestor.tsx` (Nuevo).

#### Tabla Comparativa: Propuesta vs. Software Actual
| Codigo | Seccion / Funcionalidad | Ruta URL | Estado Propuesta | Estado en Software | % Hecho | Archivos Reales en Software | Archivos por Crear / Adaptar | Observaciones de Brecha |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **1** | Panel de activos y CMDB | `/gestor-activos/panel` | NUEVO | NO IMPLEMENTADO | 0% | Actualmente usa `/dashboard` | `src/app/plataforma/gestor-activos/panel/page.tsx`, `/api/gestor-activos/panel` | Metricas de garantias proximas a vencer, licencias sobreutilizadas y salud CMDB. |
| **2.1** | Inventario de activos y ficha | `/activos/inventario` | ADAPTAR | ALTO AVANCE | 85% | `activos/inventario/page.tsx`, `/api/activos`, `tipos`, `modelos`, `[id]/historial` | `PresentadorActivoGestor.tsx` | Inventario existe; falta vista especializada de ficha tecnica y custodia. |
| **2.2** | Alta y edicion de activos | `/activos/inventario` | ADAPTAR | ALTO AVANCE | 80% | `src/lib/validaciones.ts` | `activosValidaciones.ts` | Validaciones base operativas; falta validar mascaras de MAC, IP y serie. |
| **2.3-2.9** | Importacion, Actas, Bajas y Campanas| `/gestor-activos/*` | NUEVO | NO IMPLEMENTADO | 0% | Pestanas existen en `admin/activos-config/*` | Vistas en `src/app/plataforma/gestor-activos/*` | Carga masiva por Excel, generacion de actas de entrega y campana anual de conteo. |
| **3.1** | Licencias de software y asignaciones| `/activos/licencias` | EXISTE | COMPLETO | 85% | `activos/licencias/page.tsx`, `/api/activos/licencias/*` | Ninguno | Control de licencias y asociacion a usuarios o computadoras. |
| **3.2-3.3** | Cumplimiento SAM y Catalogo | `/gestor-activos/licencias/*` | NUEVO | NO IMPLEMENTADO | 0% | `PestanaCumplimientoSobreuso.tsx` (Existe en admin) | `gestor-activos/licencias/cumplimiento`, `catalogo-software` | Deteccion automatica de sobreuso de licencias y software permitido. |
| **4.1** | Directorio de proveedores | `/proveedores` | EXISTE | COMPLETO | 85% | `proveedores/page.tsx`, `ProveedoresWorkspace.tsx`, `/api/proveedores` | Ninguno | Registro corporativo de proveedores con validacion de RUC y contactos. |
| **4.2-4.3** | Contratos de soporte y renovaciones | `/gestor-activos/contratos` | NUEVO | NO IMPLEMENTADO | 0% | `PestanaTiposContrato.tsx` (Existe en admin) | `gestor-activos/contratos/page.tsx`, `renovaciones/page.tsx` | Control de SLAs de terceros, polizas de seguro y fechas de caducidad. |
| **5.1** | Mapa de topologia CMDB | `/activos/cmdb` | EXISTE | COMPLETO | 85% | `activos/cmdb/page.tsx`, `/api/activos/cmdb` | Ninguno | Grafo visual de relaciones entre Elementos de Configuracion (CI). |
| **5.2** | Relaciones entre CI | `/activos/cmdb` | ADAPTAR | ALTO AVANCE | 80% | `/api/activos/cmdb/relaciones/route.ts` | Editor de matriz de relaciones | Backend operativo; falta UI para conectar dependencias (padre/hijo). |
| **5.3** | Modelado de clases CI | `/activos/cmdb/tipos` | EXISTE | COMPLETO | 85% | `activos/cmdb/tipos/page.tsx`, `/api/admin/cmdb/tipos` | Ninguno | Gestion de tipos de CI (Servidores, Switches, BD, Apps). |
| **5.4-5.7** | Actualizaciones CMDB y Lineas base | `/gestor-activos/cmdb/*` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | Vistas en `src/app/plataforma/gestor-activos/cmdb/*` | Aplicar cambios cerrados a la CMDB, auditorias de exactitud e inexactitudes. |
| **6.1-6.3** | Catalogos de activos (Fabricantes)| `/gestor-activos/catalogos` | ADAPTAR | ALTO AVANCE | 80% | Pestanas en `admin/activos-config/tipos-modelos-atributos/` | Permitir acceso con permiso `config.activos.catalogos` | Editar fabricantes y ubicaciones fisicas sin requerir rol Administrador. |
| **7** | Reportes de activos y CMDB | `/gestor-activos/reportes` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/gestor-activos/reportes/page.tsx` | Envejecimiento de parque informatico, garantias y costos patrimoniales. |

#### Funcionalidades en el Software que NO estan en la Propuesta
1. `src/app/plataforma/activos/page.tsx`: Landing generico no alineado al arbol propuesto.

---

### MATRIZ PERFIL 10 — GESTOR DE PROBLEMAS (PROBLEM MANAGER)

- **Rol y Alcance:** Lider del proceso de Gestion de Problemas: analisis de causa raiz (RCA), mantenimiento de la Base de Errores Conocidos (KEDB), identificacion proactiva y erradicacion de incidentes recurrentes.
- **Inicio Propuesto:** `/gestor-problemas/panel`
- **Presentador de Ticket:** `PresentadorProblemaGestor.tsx` (Nuevo).

#### Tabla Comparativa: Propuesta vs. Software Actual
| Codigo | Seccion / Funcionalidad | Ruta URL | Estado Propuesta | Estado en Software | % Hecho | Archivos Reales en Software | Archivos por Crear / Adaptar | Observaciones de Brecha |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **1** | Panel de gestion de problemas | `/gestor-problemas/panel` | NUEVO | NO IMPLEMENTADO | 0% | Actualmente usa `/dashboard` | `src/app/plataforma/gestor-problemas/panel/page.tsx`, `/api/gestor-problemas/panel` | Problemas abiertos, KEDB pendientes de revision e incidentes recurrentes. |
| **2.1** | Registrar problema | `/problemas` | EXISTE | COMPLETO | 85% | `problemas/page.tsx`, `ProblemasWorkspace.tsx`, `/api/problemas` | `src/lib/validaciones.ts` | Formulario basico existe; falta deteccion automatica de problemas duplicados. |
| **2.2** | Detalle integral del problema | `/problemas/[id]` | NUEVO | NO IMPLEMENTADO | 0% | Actualmente usa modal | `src/app/plataforma/problemas/[id]/page.tsx`, `PresentadorProblemaGestor.tsx` | Expediente dedicado con RCA, workaround, incidentes asociados y boton RFC. |
| **3** | Bandeja y asignacion de problemas | `/gestor-problemas/asignacion` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/gestor-problemas/asignacion/page.tsx` | Asignar investigadores y tecnicos especialistas N2/N3 a problemas. |
| **4.1** | Candidatos a problema | `/gestor-problemas/candidatos` | NUEVO | NO IMPLEMENTADO | 0% | `tecnico/problemas/candidatos` (Existe en tecnico) | `src/app/plataforma/gestor-problemas/candidatos/page.tsx` | Deteccion automatica basada en los umbrales configurados en admin. |
| **4.2** | Analisis de incidentes recurrentes | `/gestor-problemas/recurrentes` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/gestor-problemas/recurrentes/page.tsx` | Agrupacion por categoria, CI y servicio para descubrir causas comunes. |
| **5** | Herramientas de Causa Raiz (RCA) | `/gestor-problemas/analisis` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/gestor-problemas/analisis/page.tsx` | Formulario interactivo de los 5 Porques, Diagrama de Ishikawa y linea de tiempo. |
| **6** | Base de Errores Conocidos (KEDB) | `/problemas/kedb` | EXISTE | COMPLETO | 85% | `src/app/plataforma/problemas/kedb/page.tsx` | Ninguno | Repositorio formal de errores con solucion temporal (Workaround) documentada. |
| **7** | Problemas mayores y revision | `/gestor-problemas/mayores` | NUEVO | NO IMPLEMENTADO | 0% | `PestanaMayores.tsx` (Existe en admin) | `src/app/plataforma/gestor-problemas/mayores/page.tsx` | Comite de analisis de incidentes criticos P1 para evitar repeticion. |
| **8** | RFC derivadas de problemas | `/gestor-problemas/cambios` | NUEVO | NO IMPLEMENTADO | 0% | `PestanaRfc.tsx` (Existe en admin) | `src/app/plataforma/gestor-problemas/cambios/page.tsx` | Vincular y monitorear cambios estructurales que solucionan la causa raiz. |
| **9** | Conocimiento derivado | `/gestor-problemas/conocimiento` | NUEVO | NO IMPLEMENTADO | 0% | `PestanaConocimiento.tsx` (Existe en admin) | `src/app/plataforma/gestor-problemas/conocimiento/page.tsx` | Boton directo para publicar un Workaround de KEDB hacia la Base de Conocimiento. |
| **10** | Objetivos internos de tiempo | `/gestor-problemas/objetivos` | NUEVO | NO IMPLEMENTADO | 0% | `PestanaObjetivosTiempo.tsx` (Existe en admin) | `src/app/plataforma/gestor-problemas/objetivos/page.tsx` | Metas de tiempo maximo para diagnostico de causa raiz y publicacion KEDB. |
| **11** | Reportes analiticos de problemas | `/gestor-problemas/reportes` | NUEVO | NO IMPLEMENTADO | 0% | Ninguno | `src/app/plataforma/gestor-problemas/reportes/page.tsx` | Tiempos medios de diagnostico (MTTRCA), recurrencia y ahorro generado. |

#### Funcionalidades en el Software que NO estan en la Propuesta
1. Pantallas y modales sueltos: Actualmente los problemas se consultan en `/problemas` mediante una sola vista y modales flotantes, sin separacion de roles ni expediente individual por URL.

---

## 4. Consolidaciones Tecnicas y Plan de Retiro de Componentes Fuera de la Propuesta

A partir de la confrontacion directa del codigo fuente actual contra el esquema propuesto, se identifican las siguientes acciones estructurales inmediatas:

| Componente / Ruta Actual | Diagnostico Actual en Software | Accion Arquitectonica Requerida |
| :--- | :--- | :--- |
| **`/admin/rfc` y `/api/admin/rfc-config`** | Pantalla antigua de configuracion de RFC previa a la arquitectura modular. | **Retirar.** Su funcionalidad ya fue migrada a `admin/procesos/cambios/*`. |
| **Modales duplicados en Procesos** | `BarraAccionesComun`, `ModalVistaPrevia`, `ModalPublicacion` existen duplicados en `admin/procesos/problemas/formulario/components` y en `admin/procesos/cambios/formulario/components`. | **Unificar.** Trasladar a `src/shared/components/admin/` e importar desde ambos modulos. |
| **`Iconos.tsx` locales duplicados** | Duplicados en `admin/procesos/cambios/flujo-evaluacion/` y `notificaciones-calendario/`. | **Unificar.** Reemplazar por `src/shared/components/ui/Iconos.tsx` y eliminar archivos redundantes. |
| **`/dashboard` como pagina comun** | Todos los perfiles caen en la misma vista generica `/dashboard/page.tsx`. | **Convertir en Redirector.** Segun el perfil activo en sesion JWT, redirigir a `/<perfil>/panel`. |
| **Autorizaciones del Auditor en Admin** | `auditoria-sistema`, `seguridad-logs`, `mantenimiento-datos` estan bloqueadas por el guard RBAC solo a Administrador. | **Abrir Lectura al Auditor.** Agregar el rol `Auditor` en `src/lib/page-auth.ts` para modo solo lectura. |
| **`/incidentes` y `/solicitudes` sueltos** | Rutas independientes en `src/app/plataforma/` que duplican la creacion del catalogo. | **Consolidar.** Redirigir a `/tickets/catalogo?tipo=incidente` y `/tickets/catalogo?tipo=solicitud`. |
| **Falta de Presentadores por Perfil** | Actualmente solo existen `VistaTicketAdministrador`, `VistaTicketOperador`, `VistaTicketSupervisor`, `VistaTicketConsumidor` y `VistaTicketGobernanza`. | **Crear Presentadores Especializados.** Implementar `PresentadorAuditor.tsx`, `PresentadorGestorArea.tsx`, `PresentadorAprobador.tsx`, `PresentadorRfcEvaluador.tsx`, `PresentadorActivoGestor.tsx` y `PresentadorProblemaGestor.tsx`. |
