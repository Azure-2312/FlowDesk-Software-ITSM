# PROMPT 4 — MENÚ Y FUNCIONALIDADES DEL PERFIL TÉCNICO

> **Alcance:** diseñar e implementar el menú lateral del perfil **Técnico** (personal de soporte de TI) y el contenido, botones y reglas de cada opción, alineado con ITIL 4 e ISO/IEC 20000-1.
> **Relación con los prompts anteriores:** Prompt 1 = Problemas · Prompt 2 = Cambios · Prompt 3 = Activos y CMDB (todos son configuración del administrador). Este prompt es la **cara operativa del Técnico** que consume esas configuraciones.
> **Idioma de la interfaz:** español. **Código, tablas y endpoints:** nombres en español snake_case salvo convención técnica.
> **Stack real del proyecto:** Next.js (frontend + backend) y PostgreSQL alojado en Supabase. Tienes acceso completo al código, la base de datos, el frontend y el backend.
> **Versión del documento:** 1.0

---

## 0. Instrucciones para la IA que implementará esto

**Rol:** eres un arquitecto/desarrollador senior de software ITSM. Vas a construir el menú y las pantallas operativas del perfil **Técnico** de un sistema ITSM que ya tiene Incidentes, Solicitudes de servicio, perfil de Administrador con menú de configuración y perfil de Solicitante con menú de autoservicio.

**Reglas obligatorias:**

1. Implementa **exactamente** lo descrito. Si algo no está especificado, **no lo inventes**: antes de escribir código, devuelve una lista numerada de "Preguntas abiertas" (sección 14) y espera respuesta.
2. **El menú es dato, no código.** El menú del Técnico se carga desde la estructura que administra `1.1.3 Estructura del menú` del perfil Administrador (tabla de ítems de menú, jerarquía, rutas, permisos requeridos, orden, ícono, visibilidad). Si esa tabla ya existe, **extiéndela y carga el menú del Técnico como datos semilla**; si el menú del Solicitante o del Administrador está en código fijo, repórtalo en la Etapa 0 y propón la migración sin romper esos menús.
3. **Reutiliza lo existente; no dupliques.** Ya existen: el componente de menú lateral (título "Sistema de tickets", selector de perfil, grupos plegables, ítem activo resaltado en azul), las pantallas de ticket de Incidentes y Solicitudes, el catálogo de servicios, la matriz de prioridad, el motor de SLA, el sistema de notificaciones, el formulario y el creador de campos. Ubícalos en la Etapa 0 y extiéndelos.
4. **Un solo espacio de trabajo de ticket** para todos los perfiles internos: la pantalla de detalle del ticket es compartida; lo que cambia es lo que cada perfil ve y puede hacer según sus permisos. No crees una pantalla de ticket aparte para el Técnico si ya existe una.
5. **Los botones de acción de un ticket se generan desde la configuración del administrador** (transiciones de `1.3.1.2` y `1.3.2.2` para incidentes y solicitudes; las de los Prompts 1, 2 y 3 para problemas, cambios y activos). **No hardcodees estados ni transiciones.** Este documento describe el comportamiento de fábrica esperado.
6. **Seguridad en servidor:** toda restricción de visibilidad y de acción (qué tickets ve, quién puede tomar, escalar, resolver, aprobar, ver datos financieros o sensibles) se aplica en backend y en políticas RLS de Supabase, no solo ocultando botones.
7. **Todo lo que el Técnico hace queda auditado** (quién, cuándo, qué, valor anterior y nuevo) en la misma auditoría que usa el resto del sistema (`1.8.1`).
8. Trabaja por etapas y detente al final de cada una: **Etapa 0** reconocimiento (sección 14, obligatoria antes de codificar) · **Etapa A** estructura del menú, cascarón global y componentes de lista (secciones 3 a 5) · **Etapa B** Mesa de Servicio, espacio de trabajo del ticket y SLA (M2, M3) · **Etapa C** Mi trabajo (M1) · **Etapa D** Problemas y Conocimiento (M4, M7) · **Etapa E** Cambios (M5) · **Etapa F** Activos y CMDB y Catálogo (M6, M8).
9. **Si falta un dato en la base de datos, agrégalo** (sección 11) con migraciones SQL versionadas, idempotentes y políticas RLS coherentes con las existentes.
10. Las pantallas son **escritorio primero** (≥1280 px) y deben ser utilizables en tableta (≥768 px). **Las excepciones móviles** son el panel (lectura), la agenda y el **Inventario físico en campo (M6.4)**, que debe ser *mobile-first*.
11. Fechas como `timestamptz` en UTC, mostradas en la zona horaria del sistema. Accesibilidad: navegación por teclado, contraste suficiente, etiquetas ARIA en tablas, modales y menús.
12. **Vistas en tiempo real:** usa Supabase Realtime (o el mecanismo ya presente) para contadores del menú, bandejas y avisos, sin recargar la página.

---

## 1. Marco normativo y de buenas prácticas

| Referencia | Qué se toma de ella |
|---|---|
| **ITIL 4 – Service Desk** | Punto único de contacto: registro de tickets en nombre del usuario, canal de contacto, resolución en primer contacto, comunicación al usuario. |
| **ITIL 4 – Incident Management** | Registro, diagnóstico, escalamiento funcional y jerárquico, colaboración (*swarming*), resolución, restauración del servicio lo antes posible, incidente mayor. |
| **ITIL 4 – Service Request Management** | Atención por flujo predefinido, tareas de cumplimiento, aprobaciones, entrega. |
| **ITIL 4 – Problem Management** | Identificación de problemas a partir de incidentes recurrentes, uso de errores conocidos y workarounds. |
| **ITIL 4 – Change Enablement** | Solicitud de cambios, implementación según plan, ventana y rollback; coordinación con el calendario; registro de resultados. |
| **ITIL 4 – IT Asset Management y Service Configuration Management** | Consulta y mantenimiento técnico de activos y CI, cuentas de custodia, mapa de relaciones, reporte de inexactitudes. |
| **ITIL 4 – Knowledge Management** | Consultar, aplicar y aportar conocimiento; ciclo de vida del artículo; retroalimentación de utilidad. |
| **ITIL 4 – Service Level Management** | Visibilidad del SLA en cada ticket, semáforo de riesgo, gestión proactiva de vencimientos. |
| **ITIL 4 – Continual Improvement** | Indicadores personales y del grupo, lecciones aprendidas, aportes de conocimiento. |
| **ITIL 4 – Principios rectores** | Enfocarse en el valor, empezar donde se está, progresar iterativamente, colaborar y promover la visibilidad, pensar y trabajar de forma holística, mantenerlo simple y práctico, optimizar y automatizar. (Aplicación: panel centrado en "qué atender ahora", sugerencias automáticas de conocimiento, acciones en un clic.) |
| **ISO/IEC 20000-1:2018, 8.6.1, 8.6.2, 8.6.3, 8.5.1, 8.2.5, 8.2.6** | Gestión de incidentes, solicitudes de servicio, problemas, cambios, activos y configuración. |
| **COBIT 2019 – DSS02, DSS03, BAI06, BAI08, BAI09, BAI10** | Incidentes y solicitudes, problemas, cambios, conocimiento, activos y configuración. |
| **Seguridad de la información (ISO/IEC 27001:2022)** | Mínimo privilegio, trazabilidad de acciones, protección de datos sensibles, uso aceptable de activos. |

**Definiciones que deben respetarse:**
- **Técnico:** persona de TI que atiende, diagnostica y resuelve tickets, ejecuta cambios y mantiene activos. Pertenece a uno o más **grupos resolutores** (`1.4.2`) y tiene un **nivel de soporte** (`1.4.3`).
- **Nivel de soporte:** N1 (mesa de servicio / primer contacto), N2 (soporte especializado), N3 (expertos / ingeniería). Los nombres y la cantidad son los definidos en `1.4.3`; este documento usa N1/N2/N3 como referencia.
- **Cola o bandeja:** conjunto de tickets sin asignar de un grupo resolutor.
- **Escalamiento funcional:** pasar el ticket a un grupo o nivel con mayor especialización. **Escalamiento jerárquico:** informar o involucrar a la jefatura.
- **Swarming (colaboración):** varios técnicos trabajan juntos en un ticket sin transferirlo.
- **Workaround:** solución temporal. **Error conocido:** problema con causa o workaround documentados.
- **FCR (First Contact Resolution):** ticket resuelto en el primer contacto.
- **Área técnica:** el departamento de TI al que pertenecen los grupos resolutores del técnico.

---

## 2. Hechos confirmados del sistema (no los vuelvas a preguntar)

| Tema | Lo confirmado |
|---|---|
| Perfiles | Administrador · Técnico · Solicitante · Supervisor (de las áreas de TI) · Gestor de Área (jefes de áreas que no son de TI: finanzas, legal, ventas, marketing, etc.) · Auditor · Aprobador (facultado por el CAB para aprobar cambios) · Gestor de Cambios · Gestor de Activos y Configuración · Gestor de Problemas (a futuro; si aún no existe, sus funciones las ejecutan Supervisor y Técnico según los prompts 1 a 3). |
| Procesos de ITSM que abarca el sistema | Incidentes · Solicitudes de servicio · Cambios · Activos (y CMDB) · SLA · Conocimiento · Problemas. **No** se incluyen en este menú eventos y monitoreo, disponibilidad/capacidad/continuidad, ni proveedores como módulos del Técnico. |
| Interfaz | Barra lateral oscura con título "Sistema de tickets", **selector de perfil** en la parte superior derecha del título (muestra "Solicitante", "Administrador", etc.), grupos plegables con flecha, subítems con ítem activo resaltado en azul. |
| Menú del Solicitante (imagen) | Mesa de Servicio (Crear ticket, Mis tickets) · Catálogo de Servicios (Catálogo de incidentes, Catálogo de solicitudes de servicio) · Gestión de Conocimiento. |
| Menú del Administrador | Configuración (Identidades y accesos, Catálogo de servicios y SLAs, Configuración de procesos, Organización y soporte, Activos y configuración, Comunicaciones y notificaciones, Gobierno del conocimiento, Auditoría, seguridad y retención) y Reportes y Analítica. Las rutas siguen el patrón `/admin/...`, con `/tickets/reportes` para indicadores. |
| Matriz de prioridad | Existe; P1 Crítica, P2 Alta, P3 Media, P4 Baja; niveles de impacto y urgencia Alta/Media/Baja. |
| 1.2.4 Objetivos SLA | Matriz Institucional de Tiempos por Prioridad: primera respuesta y resolución total en horas (P1 1/4, P2 2/8, P3 4/24, P4 8/72). El tiempo efectivo de un ticket lo da su prioridad. |
| Selector de CI en Incidentes | Lista los activos bajo custodia del usuario. |
| Formulario y creador de campos | Existen para Incidentes y Solicitudes. |
| Prompts 1 a 3 | Definen las pantallas y datos de Problemas, Cambios y Activos/CMDB que este menú consume (formularios, tickets, permisos del Técnico). **Si algún prompt aún no se ha implementado, las opciones del menú que dependan de él se cargan pero quedan ocultas por una bandera de módulo** (sección 3.4). |
| Datos que no existan | Se agregan a la base de datos mediante migraciones. |

---

## 3. Menú del Técnico

### 3.1 Árbol completo

La numeración `M` identifica opciones del menú del Técnico (no confundir con la numeración `1.x` de Configuración). Las rutas son **propuestas**: alinéalas con las existentes en la Etapa 0 manteniendo el patrón del proyecto. Los ticket y demás registros usan **rutas compartidas** entre perfiles (`/tickets/[id]`, `/problemas/[id]`, `/cambios/[id]`, `/activos/[codigo]`, `/conocimiento/[id]`); el contenido se adapta al permiso.

```
[Nivel 1] M1 Mi trabajo (/tecnico)
  |-- [Nivel 2] M1.1 Panel del técnico (/tecnico/panel)                        <- página de inicio del perfil
  |-- [Nivel 2] M1.2 Mis tareas (/tecnico/tareas)
  |-- [Nivel 2] M1.3 Mi agenda y disponibilidad (/tecnico/agenda)
  |-- [Nivel 2] M1.4 Mi desempeño (/tecnico/desempeno)

[Nivel 1] M2 Mesa de Servicio (/tecnico/mesa)
  |-- [Nivel 2] M2.1 Mis tickets asignados (/tecnico/mesa/asignados)
  |-- [Nivel 2] M2.2 Bandeja de pendientes (/tecnico/mesa/pendientes)
  |-- [Nivel 2] M2.3 Tickets de mi área técnica (/tecnico/mesa/area)
  |-- [Nivel 2] M2.4 Registrar ticket para un usuario (/tecnico/mesa/registrar)
  |-- [Nivel 2] M2.5 Búsqueda avanzada (/tecnico/mesa/buscar)
  |-- [Nivel 2] M2.6 Historial de resueltos (/tecnico/mesa/historial)

[Nivel 1] M3 Seguimiento de SLA (/tecnico/sla)
  |-- [Nivel 2] M3.1 Semáforo de SLA de mi cola (/tecnico/sla/semaforo)
  |-- [Nivel 2] M3.2 Objetivos de tiempo vigentes (/tecnico/sla/objetivos)

[Nivel 1] M4 Gestión de Problemas (/tecnico/problemas)
  |-- [Nivel 2] M4.1 Problemas asignados a mí (/tecnico/problemas/asignados)
  |-- [Nivel 2] M4.2 Problemas de mi grupo (/tecnico/problemas/grupo)
  |-- [Nivel 2] M4.3 Registrar problema (/tecnico/problemas/nuevo)
  |-- [Nivel 2] M4.4 Candidatos a problema (/tecnico/problemas/candidatos)
  |-- [Nivel 2] M4.5 Errores conocidos (KEDB) (/tecnico/problemas/errores-conocidos)

[Nivel 1] M5 Gestión de Cambios (/tecnico/cambios)
  |-- [Nivel 2] M5.1 Mis cambios (/tecnico/cambios/mis-cambios)
  |-- [Nivel 2] M5.2 Registrar solicitud RFC (/tecnico/cambios/nuevo)
  |-- [Nivel 2] M5.3 Cambios por implementar (/tecnico/cambios/implementacion)
  |-- [Nivel 2] M5.4 Calendario de cambios (/tecnico/cambios/calendario)
  |-- [Nivel 2] M5.5 Cambios que afectan mis servicios (/tecnico/cambios/impacto)
  |-- [Nivel 2] M5.6 Historial de cambios (/tecnico/cambios/historial)

[Nivel 1] M6 Activos y CMDB (/tecnico/activos)
  |-- [Nivel 2] M6.1 Inventario de activos (/tecnico/activos/inventario)
  |-- [Nivel 2] M6.2 Mapa de topología CMDB (/tecnico/activos/mapa)
  |-- [Nivel 2] M6.3 Mantenimiento y reparaciones (/tecnico/activos/mantenimiento)
  |-- [Nivel 2] M6.4 Inventario físico en campo (/tecnico/activos/conteos)
  |-- [Nivel 2] M6.5 Licencias de software (consulta) (/tecnico/activos/licencias)

[Nivel 1] M7 Gestión del Conocimiento (/tecnico/conocimiento)
  |-- [Nivel 2] M7.1 Base de conocimiento (/tecnico/conocimiento/base)
  |-- [Nivel 2] M7.2 Mis artículos (/tecnico/conocimiento/mis-articulos)
  |-- [Nivel 2] M7.3 Crear artículo (/tecnico/conocimiento/nuevo)
  |-- [Nivel 2] M7.4 Revisiones pendientes (/tecnico/conocimiento/revisiones)   <- condicional

[Nivel 1] M8 Catálogo de servicios (consulta) (/tecnico/catalogo)                <- ítem sin subítems
```

### 3.2 Reglas de organización del menú
- Orden de grupos de fábrica: M1 → M8, de lo más frecuente a lo menos frecuente (ITIL 4: *keep it simple*). El Administrador puede reordenar, renombrar y ocultar ítems en `1.1.3`, pero **no puede quitar** los ítems marcados 🔒: M1.1, M2.1, M2.2, M7.1.
- El grupo de nivel 1 se despliega al hacer clic y recuerda su estado (abierto/cerrado) por usuario. El grupo que contiene la ruta actual se abre automáticamente.
- M8 es un ítem de nivel 1 sin hijos (igual que "Gestión de Conocimiento" en el menú del Solicitante).
- La barra lateral se puede **colapsar a íconos** (botón en la parte inferior) y recuerda el estado.
- **Selector de perfil** (parte superior, junto al título): visible solo si el usuario tiene más de un perfil; al cambiar de perfil se recarga el menú correspondiente y se vuelve a la página de inicio de ese perfil.

### 3.3 Contadores (badges) en el menú
Cada ítem puede mostrar un número a la derecha; se actualiza en tiempo real. Si es 0, no se muestra (salvo configuración). Colores: gris (informativo), ámbar (atención), rojo (vencido/crítico).

| Ítem | Contador | Color |
|---|---|---|
| M2.1 Mis tickets asignados | Tickets abiertos asignados a mí | Gris; rojo si alguno está vencido |
| M2.2 Bandeja de pendientes | Tickets sin asignar en mis grupos | Ámbar; rojo si hay P1/P2 sin asignar |
| M2.3 Tickets de mi área técnica | — (sin contador) | — |
| M3.1 Semáforo | Tickets en riesgo + vencidos de mi cola | Ámbar / rojo |
| M1.2 Mis tareas | Tareas vencidas + de hoy | Ámbar; rojo si vencidas |
| M4.1 Problemas asignados a mí | Problemas abiertos asignados | Gris |
| M4.4 Candidatos a problema | Sugerencias nuevas sin atender | Ámbar |
| M5.3 Cambios por implementar | RFC en Programado/En ejecución asignadas a mí en los próximos 7 días | Ámbar; rojo si hay una en ejecución |
| M5.1 Mis cambios | RFC con acción pendiente mía (información solicitada) | Ámbar |
| M5.5 Cambios que afectan mis servicios | Cambios nuevos sin "enterado" | Ámbar |
| M6.3 Mantenimiento y reparaciones | Mantenimientos vencidos o por vencer en 7 días | Ámbar / rojo |
| M6.4 Inventario físico en campo | Campañas activas asignadas a mí | Ámbar |
| M7.2 Mis artículos | Artículos devueltos a corrección | Ámbar |
| M7.4 Revisiones pendientes | Revisiones asignadas a mí | Ámbar |

Los contadores se calculan en servidor (consultas agregadas con caché corta de 10 s y/o suscripción en tiempo real) y respetan las mismas restricciones de visibilidad que las listas.

### 3.4 Visibilidad condicional de ítems
Un ítem se muestra solo si **todas** las condiciones se cumplen:
1. El usuario tiene el permiso requerido (columna "Permiso").
2. El módulo asociado está activo (bandera de módulo: `modulo_problemas`, `modulo_cambios`, `modulo_activos`, `modulo_conocimiento`). Si el módulo no está implementado o activado, el ítem y su grupo no aparecen.
3. La condición de nivel de soporte (si aplica).
4. El Administrador no lo ocultó en `1.1.3`.

| Ítem | Permiso requerido | Módulo | Condición adicional |
|---|---|---|---|
| M1.* | `tecnico.panel` | — | — |
| M2.1, M2.2 | `tickets.ver_propios`, `tickets.ver_grupo` | — | — |
| M2.3 | `tickets.ver_area` | — | — |
| M2.4 | `tickets.crear_por_usuario` | — | Por defecto N1, N2, N3 |
| M2.5 | `tickets.buscar` | — | — |
| M2.6 | `tickets.ver_propios` | — | — |
| M3.* | `sla.ver` | — | — |
| M4.1, M4.2 | `problemas.ver` | `modulo_problemas` | — |
| M4.3 | `problemas.crear` | `modulo_problemas` | — |
| M4.4 | `problemas.crear` | `modulo_problemas` | Por defecto N2 y N3 (configurable) |
| M4.5 | `kedb.ver` | `modulo_problemas` | — |
| M5.1, M5.6 | `cambios.ver` | `modulo_cambios` | — |
| M5.2 | `cambios.crear` | `modulo_cambios` | — |
| M5.3 | `cambios.implementar` | `modulo_cambios` | Solo si el técnico tiene o ha tenido RFC asignadas (si no, se oculta) |
| M5.4 | `calendario_cambios.ver` | `modulo_cambios` | — |
| M5.5 | `cambios.ver` | `modulo_cambios` | — |
| M6.1, M6.2, M6.5 | `activos.ver`, `cmdb.ver`, `licencias.ver` | `modulo_activos` | — |
| M6.3 | `activos.editar_tecnico` | `modulo_activos` | — |
| M6.4 | `activos.conteo` | `modulo_activos` | Solo si hay campañas asignadas o activas |
| M7.1, M7.2, M7.3 | `conocimiento.ver`, `conocimiento.crear` | `modulo_conocimiento` | — |
| M7.4 | `conocimiento.revisar` | `modulo_conocimiento` | Solo si es revisor designado en `1.7.1` |
| M8 | `catalogo.ver` | — | — |

### 3.5 Estructura de datos del menú (semilla)
Cada ítem se almacena con: `id`, `padre_id`, `codigo` (ej. `M2.1`), `etiqueta`, `ruta`, `icono`, `orden`, `permiso_requerido`, `modulo_requerido`, `condicion_nivel` (jsonb: nivel mínimo o máximo), `perfiles` (lista), `contador_clave` (identificador de la consulta de contador), `bloqueado` (🔒), `visible`, `abierto_por_defecto`. El menú del Técnico se carga con migración idempotente a partir del árbol 3.1.

---

## 4. Elementos globales de la interfaz del Técnico

### 4.1 Barra superior (siempre visible)
| Elemento | Qué hace |
|---|---|
| **Búsqueda global** (`Ctrl+K` / `/`) | Abre una paleta de comandos: escribe un ID (`INC-…`, `SOL-…`, `PRB-…`, `RFC-…`, código de activo, `KB-…`), un título, un nombre de usuario o un hostname/serie; muestra resultados agrupados (Tickets, Problemas, Cambios, Activos, Usuarios, Artículos) con atajo para abrir con `Enter`. Respeta permisos. Recuerda las 5 últimas búsquedas. |
| **Creación rápida (+)** | Menú desplegable: *Registrar ticket para un usuario*, *Registrar problema*, *Registrar RFC*, *Crear artículo*, *Recordatorio personal*. Solo muestra lo que el perfil puede crear. |
| **Indicador de disponibilidad** | Chip con el estado actual (**Disponible · Ocupado · No disponible**), clic para cambiarlo (ver M1.3). |
| **Notificaciones (campana)** | Panel con las últimas 50 notificaciones agrupadas por día, contador de no leídas, botones **[Marcar todas como leídas]**, **[Ir a preferencias]**, filtro por tipo (Tickets, SLA, Cambios, Problemas, Conocimiento, Activos, Menciones). Cada notificación abre su objeto y se marca como leída. |
| **Ayuda y atajos (?)** | Lista de atajos de teclado, enlace a guías y a la versión del sistema. |
| **Menú de usuario** | *Mi perfil*, *Mis preferencias de notificación* (4.3), *Mis respuestas predefinidas* (6.5), *Tema claro/oscuro*, *Cambiar contraseña* (si aplica), *Cerrar sesión*. |

### 4.2 Atajos de teclado de fábrica
`Ctrl+K` búsqueda global · `G` luego `P` panel · `G` luego `A` asignados · `G` luego `Q` pendientes · `N` nuevo ticket para usuario · `T` tomar el ticket abierto · `R` responder al usuario · `.` nota interna · `E` escalar · `S` resolver · `?` ayuda de atajos · `Esc` cierra paneles y modales. Se desactivan mientras se escribe en un campo de texto.

### 4.3 Preferencias de notificación del Técnico
Pantalla `Mi cuenta > Mis preferencias de notificación`: tabla de **eventos** (sección 9) × **canales** (en la aplicación, correo y los canales de `1.6`), con interruptores. Los eventos marcados "obligatorios" (P1/P2 sin asignar, SLA vencido, cambio en ejecución asignado, incidente mayor) no se pueden silenciar. Opciones: **resumen diario (digest)** para eventos de baja urgencia, **horas de silencio** (excepto obligatorios), sonido en la aplicación (sí/no) y botón **[Enviar notificación de prueba]**.

### 4.4 Presencia y bloqueo de edición
- Cada ticket muestra avatares de quienes lo están viendo ("María y 1 más lo están viendo").
- Si dos técnicos editan el mismo campo, el segundo recibe un aviso de conflicto con opciones **[Ver cambios]**, **[Sobrescribir]**, **[Descartar el mío]**.
- Al escribir un comentario, se avisa si alguien más está escribiendo una respuesta pública.

---

## 5. Patrón común de las bandejas y listas

Aplica a M2.1, M2.2, M2.3, M2.6, M3.1, M4.1, M4.2, M5.1, M5.3, M5.5, M5.6, M6.1, M6.3, M7.2 y listas análogas. Cada pantalla solo indica sus diferencias.

### 5.1 Estructura
1. **Encabezado:** título, descripción de una línea y contador de resultados ("42 tickets").
2. **Pestañas / chips de segmento:** filtros rápidos exclusivos de la pantalla (ej. Todos · Incidentes · Solicitudes).
3. **Barra de filtros:** buscador de texto, filtros avanzados (botón **[Filtros]** abre panel lateral), **vistas guardadas** (selector), **[Columnas]**, **[Densidad]** (cómoda/compacta), **[Actualizar]**, **[Exportar]** (si hay permiso `tickets.exportar`).
4. **Tabla** con selección múltiple, ordenamiento por columna, columnas redimensionables y reordenables, **paginación o desplazamiento virtual** (500+ filas sin degradar), indicador de ticket **no leído** (negrita y punto azul) y de **actividad nueva** desde mi última visita.
5. **Barra de acciones masivas** (aparece al seleccionar filas, ver 5.3).
6. **Pie:** tamaño de página (25/50/100), total, hora de última actualización y botón **[Pausar actualización en vivo]**.

### 5.2 Columnas estándar de tickets (incidentes y solicitudes)
ID (enlace) · Tipo (ícono: incidente / solicitud) · Título · Solicitante (nombre y departamento) · Servicio · Prioridad (insignia P1–P4 con color) · Estado (insignia) · Grupo · Técnico asignado · **SLA** (barra con tiempo restante, color verde/ámbar/rojo/pausa, y el objetivo más próximo: primera respuesta o resolución) · Creado · Última actividad · Etiquetas. El usuario elige, ordena y guarda sus columnas.

### 5.3 Acciones masivas (con selección múltiple)
| Botón | Qué hace | Condición |
|---|---|---|
| **[Tomar]** | Se asigna a sí mismo los seleccionados (de a uno con comprobación atómica; los ya tomados se omiten y se informa cuántos). | `tickets.tomar` |
| **[Asignar a…]** | Modal: técnico o grupo + motivo opcional. | `tickets.reasignar` |
| **[Cambiar estado]** | Solo transiciones válidas para todos los seleccionados y con campos obligatorios simples. | Permiso de la transición |
| **[Agregar etiqueta]** | Etiqueta libre o del catálogo. | |
| **[Comentar]** | Comentario interno o público común (con confirmación de cantidad). | |
| **[Fusionar]** | Habilitado con 2 o más del mismo solicitante o servicio: elige el principal. | `tickets.fusionar` |
| **[Exportar selección]** | CSV/XLSX con las columnas visibles. | `tickets.exportar` |
Todas las acciones masivas muestran un modal de confirmación con el número de elementos y generan un registro por ticket en la auditoría. Máximo 100 elementos por acción masiva.

### 5.4 Filtros disponibles (panel lateral)
Tipo · Estado (múltiple) · Prioridad (múltiple) · Servicio · Categoría · Grupo · Técnico · Solicitante · Departamento del solicitante · Canal de contacto · SLA (*En riesgo*, *Vencido*, *En pausa*, *Dentro de objetivo*) · Fecha de creación (rango y relativa) · Antigüedad (> N horas/días) · Sin actualizar desde (> N horas) · Con CI vinculado · Con problema/RFC vinculado · Con artículo vinculado · Reabiertos · Etiquetas · Colaboro en… · Sigo… Los filtros se combinan con AND; dentro de un filtro múltiple, con OR. Botón **[Limpiar filtros]**.

### 5.5 Vistas guardadas
Cada usuario puede **guardar** la combinación de filtros, columnas, orden y densidad con un nombre (**[Guardar vista]**), **renombrar**, **duplicar**, **marcar como predeterminada** y **eliminar**. Los perfiles con `tickets.vistas_compartidas` (Supervisor) pueden publicar vistas compartidas que los técnicos ven pero no editan. Vistas de fábrica en la sección 10.

### 5.6 Tiempo real, orden y estados vacíos
- **Orden por defecto en bandejas de trabajo:** primero los **vencidos**, luego **en riesgo**, luego prioridad (P1→P4) y, a igualdad, el más antiguo.
- Nuevos tickets que cumplen el filtro aparecen arriba con un resaltado de 5 s y un aviso "N tickets nuevos [Mostrar]" si el usuario ya hizo scroll. La actualización en vivo se puede pausar.
- **Estado vacío:** ilustración simple y mensaje contextual ("No tienes tickets asignados. ¡Revisa la bandeja de pendientes!") con botón de acción relacionada.
- **Error de carga:** mensaje y **[Reintentar]**. **Carga:** esqueleto de tabla.

---

## 6. ESPACIO DE TRABAJO DEL TICKET (incidentes y solicitudes) — vista del Técnico

**Ruta:** `/tickets/[id]` (compartida). Es la pantalla donde el Técnico pasa la mayor parte del tiempo. Se abre desde cualquier lista, desde la búsqueda global y desde los avisos. Lo que sigue define lo que ve y puede hacer el Técnico; el Solicitante, el Supervisor y otros perfiles ven subconjuntos o ampliaciones según permisos.

### 6.1 Cabecera fija
- **ID** (botón para copiar), **título** (editable en línea con permiso), insignias de **tipo**, **estado** y **prioridad**.
- **Medidores de SLA** (dos): *Primera respuesta* y *Resolución*, cada uno con barra, tiempo restante (o vencido hace…), objetivo (horas de la matriz de `1.2.4`) y estado (en curso / en pausa / cumplido / vencido). Al pasar el cursor muestra la hora límite y el historial de pausas.
- **Etiquetas de situación:** `VIP` (si el solicitante lo es), `Incidente mayor` (o `Propuesto como mayor`), `Reabierto`, `Escalado`, `En espera: <motivo>`, `Problema vinculado`, `Cambio vinculado`, `Error conocido aplicable`.
- **Asignación:** técnico (avatar y nombre) y grupo; botón de edición rápida.
- **Seguir** (campana): activa o desactiva las notificaciones del ticket para mí; **presencia** (quién lo está viendo).

### 6.2 Barra de acciones (botones y para qué sirven)
Los botones marcados con ⚙ se generan desde las transiciones configuradas; los demás son fijos. Un botón sin permiso o con requisitos pendientes aparece **deshabilitado con tooltip** que explica el motivo (ej. "Falta registrar la solución").

| Botón | Qué hace | Detalle y reglas |
|---|---|---|
| **[Tomar ticket]** | Me asigna el ticket (autoasignación). | Visible si está sin asignar y soy miembro del grupo resolutor. Comprobación atómica: si otro técnico lo tomó antes, muestra "Ya fue tomado por X". Respeta el límite de tickets abiertos por técnico (advertencia o bloqueo según parámetro, sección 14). Si el estado es *Nuevo*, la transición automática lo pasa a *Asignado*. |
| ⚙ **[Iniciar atención]** | Cambia el estado a *En atención* y registra la hora. | Puede contar como primera respuesta según la regla del motor de SLA (se verifica en la Etapa 0). |
| **[Responder al usuario]** | Lleva el foco al editor de **respuesta pública** de la pestaña Comunicación. | El primer comentario público cuenta para el SLA de primera respuesta si así lo define el motor. |
| **[Nota interna]** | Foco en el editor de **nota interna** (no visible para el Solicitante). | |
| ⚙ **[Poner en espera]** | Pausa la atención. | Modal: **motivo** (catálogo: Esperando información del usuario · Esperando a un proveedor · Esperando aprobación · Esperando ventana de cambio · Esperando repuesto o licencia · Otro), fecha de reanudación (opcional), mensaje al usuario (con plantilla). Pausa el reloj del SLA según el motivo configurado. |
| ⚙ **[Solicitar información]** | Atajo de *Poner en espera → Esperando información del usuario*. | Redacta con plantilla, envía respuesta pública y programa **recordatorios automáticos** (a las 24 h y 48 h) y **cierre automático por falta de respuesta** tras N días (parámetro). Cuando el usuario responde, el ticket vuelve solo a *En atención* y notifica al técnico. |
| **[Reasignar]** | Cambia técnico y/o grupo. | Modal: destino (técnico del mismo grupo o grupo), **motivo obligatorio**, nota para el receptor. Con `tickets.reasignar`. |
| **[Escalar]** | Escalamiento funcional o jerárquico. | Modal con dos pestañas — **Funcional:** grupo/nivel destino (N2/N3 u otro grupo), motivo del catálogo (Requiere mayor especialización · Requiere acceso o permisos · Fuera de mi alcance · Requiere proveedor · Otro), **resumen de lo intentado** (obligatorio, mín. 30 caracteres), ¿seguir colaborando? (sí/no); **Jerárquico:** notifica al Supervisor del grupo con motivo (riesgo de SLA, cliente VIP, impacto), sin reasignar. Registra el escalamiento en la línea de tiempo y notifica. |
| **[Solicitar ayuda]** | Colaboración (*swarming*). | Modal: elegir técnicos o grupo, mensaje. Los invitados quedan como **colaboradores** (pueden comentar, registrar tiempo y completar tareas, sin cambiar la asignación) y reciben notificación. Se listan en el panel lateral. |
| ⚙ **[Resolver]** | Registra la solución. | Modal obligatorio (6.2.1). |
| ⚙ **[Cerrar]** | Cierra el ticket. | Solo si el parámetro lo permite al Técnico; normalmente el cierre es automático tras la confirmación del usuario o el plazo configurado. |
| ⚙ **[Reabrir]** | Reabre un ticket resuelto/cerrado dentro de la ventana permitida. | Motivo obligatorio. Mantiene el técnico anterior o aplica asignación automática según configuración. Marca etiqueta `Reabierto` y cuenta para el KPI. |
| **[Fusionar con…]** | Une este ticket duplicado a otro principal. | Buscador del ticket principal; mueve comentarios y adjuntos, enlaza ambos, cierra el duplicado con código "Duplicado" y notifica a los solicitantes. Solo si tienen el mismo solicitante o servicio, o con `tickets.fusionar`. |
| **[Crear problema]** | Abre el formulario de problema (Prompt 1, sección 4) con este incidente vinculado y servicio, CI y categoría prellenados. | Con `problemas.crear`; solo en incidentes. |
| **[Crear RFC]** | Abre el formulario de RFC (Prompt 2, sección 4) con Origen = Incidente y datos prellenados. | Con `cambios.crear`. |
| **[Crear solicitud relacionada]** | Registra una solicitud de servicio para el mismo solicitante (ej. reemplazo de equipo). | |
| **[Vincular…]** | Vincula ticket, problema, RFC, artículo de conocimiento o CI. | Buscador con previsualización. |
| **[Proponer incidente mayor]** | Notifica a los Supervisores para que declaren un incidente mayor. | Visible en incidentes P1/P2 o que cumplan los criterios configurables. Queda como etiqueta `Propuesto como mayor`. Solo el Supervisor declara. |
| **[Cambiar prioridad]** | Modifica impacto y/o urgencia. | Exige justificación (mín. 15 caracteres) y `tickets.cambiar_prioridad`; recalcula prioridad con la matriz y los objetivos de SLA; queda en historial. |
| **[Recategorizar]** | Cambia servicio/categoría. | Advierte si cambiará el grupo resolutor o el formulario dinámico. |
| **[⋯]** | *Copiar enlace · Imprimir/PDF · Exportar · Duplicar como nuevo · Ver historial de SLA*. | |

#### 6.2.1 Modal de resolución (incidente)
Campos: **Código de resolución** * (catálogo existente; si no existe, créalo con valores: Solución definitiva, Workaround aplicado, Instrucción al usuario, Reinicio o reconfiguración, Reemplazo de hardware, Acceso o permiso otorgado, No reproducible, Duplicado, Cancelado por el usuario, Otro) · **Solución aplicada** * (texto enriquecido, mín. 20 caracteres, con plantillas) · **Causa** (opcional) · **CI afectado** (selector; obligatorio si el servicio lo exige) · **Artículo aplicado** (buscador de conocimiento) · casilla **"Crear artículo a partir de este ticket"** (abre el editor con datos prellenados) · casilla **"Esto requiere un problema"** (abre el formulario de problema) · casilla **"Esto requiere un cambio"** (abre el formulario de RFC) · **Tiempo invertido** (si el registro de tiempo está activo) · **Mensaje al usuario** (plantilla editable, se envía como respuesta pública) · botones **[Resolver]** y **[Cancelar]**. El ticket pasa a *Resuelto*, detiene el reloj de resolución, notifica al solicitante y espera su confirmación.

#### 6.2.2 Resolución de solicitudes
Para solicitudes el botón es **[Marcar como cumplida]**: campos *Resultado de la entrega* *, *Activo entregado* (selector de activo; vincula y puede disparar la transición *Asignar* si el servicio está configurado para ello), *Fecha de entrega*, *Observaciones* y *Mensaje al usuario*. Exige que todas las **tareas de cumplimiento obligatorias** estén completas.

### 6.3 Pestañas
**Detalle** — Campos del formulario que llenó el solicitante (incluidos dinámicos), descripción, evidencias adjuntas (vista previa de imágenes, PDF y logs; descarga), servicio y SLA asociado, impacto, urgencia y prioridad (y su justificación si fue manual), canal de contacto, quién lo registró (si fue un técnico en nombre del usuario). Edición en línea por sección con permiso.

**Comunicación** — Línea de tiempo unificada con filtros *Todo · Respuestas públicas · Notas internas · Estados · Escalamientos · Sistema*. **Editor** con selector de modo (**Respuesta pública** / **Nota interna**; la respuesta pública se distingue con borde de color y un aviso "El solicitante recibirá un correo"), formato enriquecido, adjuntos con arrastrar-y-soltar o pegar imagen, menciones `@usuario` (notifica y agrega como seguidor), selector de **respuestas predefinidas** (6.5) con variables, botón **[Insertar enlace a artículo]**, botones **[Enviar]**, **[Enviar y poner en espera]**, **[Enviar y resolver]**, **autoguardado de borrador** cada 15 s, **deshacer envío** durante 10 s en respuestas públicas y vista previa de cómo lo verá el usuario. Los comentarios no se borran, se **anulan** con motivo.

**Tareas** — Subtareas y checklist (para solicitudes: las tareas de cumplimiento definidas por el flujo). Columnas: tarea, responsable, grupo, vencimiento, estado, obligatoria, bloquea transición. Botones **[Añadir tarea]**, **[Completar]**, **[Reasignar]**. Las tareas obligatorias pendientes bloquean *Resolver / Marcar como cumplida*.

**Aprobaciones** (solo solicitudes con aprobación) — Tabla de etapas (aprobador, regla, plazo, estado, decisión, fecha, comentario). Botón **[Recordar al aprobador]** (envía recordatorio, máx. 1 cada 24 h, queda registrado). Solo lectura de decisiones: el Técnico no aprueba.

**Relacionados** — Tickets vinculados (tipos: duplicado de, relacionado, causado por, padre/hijo), problema, RFC (origen o causada por el cambio), artículos de conocimiento y errores conocidos. Botones **[Vincular]** y **[Desvincular]** (motivo).

**Activos / CI** — CI afectados del ticket (código, nombre, clase, criticidad, estado, custodio) con **[Agregar CI]**. Tres bloques de contexto por cada CI: **"Cambios recientes en este CI"** (RFC cerradas en los últimos N días —parámetro, fábrica 30— y programadas), **"Incidentes previos de este CI"** (últimos 10) y **"Problemas abiertos y errores conocidos"**. Botones **[Abrir ficha]**, **[Ver en mapa]**, **[Reportar inexactitud de CMDB]** (crea tarea para el Gestor de Activos y Configuración).

**Tiempo** (si el registro de tiempo está activo) — Lista de registros (técnico, fecha, minutos, tipo de actividad —Diagnóstico, Intervención, Comunicación, Espera de terceros—, nota) y **[Registrar tiempo]** (minutos u hh:mm). Cronómetro opcional **[Iniciar / Detener]** visible en la cabecera.

**SLA** — Detalle de cada reloj: objetivo, hora de inicio, tiempo consumido, pausas (motivo, inicio, fin, duración) y hitos; alertas disparadas (umbrales).

**Historial / auditoría** — Cambios de campo y de estado (fecha-hora, usuario, antes, después, comentario). Inmutable.

### 6.4 Panel lateral derecho
1. **Solicitante:** foto/iniciales, nombre, departamento, cargo, ubicación, correo, teléfono (con botón **[Copiar]**), etiqueta VIP, **activos bajo su custodia** (lista corta con enlace), **tickets abiertos** y **últimos 5 tickets** (enlaces). Botón **[Ver perfil]**.
2. **Sugerencias automáticas:** *Artículos relacionados* y *Errores conocidos aplicables* (por servicio, categoría, CI y palabras clave del título/descripción, con porcentaje de coincidencia). Botones por tarjeta: **[Ver]**, **[Insertar en respuesta]**, **[Aplicar workaround]** (agrega nota interna con el workaround, vincula el error conocido y aumenta su contador de uso), **[No es útil]**.
3. **Tickets similares recientes** (últimos 7 días, mismo servicio/CI).
4. **Colaboradores** y **seguidores** con botones para agregar o quitar.
5. **Checklist de diagnóstico** (si el servicio la define): lista marcable.
6. **Etiquetas:** agregar o quitar.

### 6.5 Respuestas predefinidas
Pantalla `Mi cuenta > Mis respuestas predefinidas` y selector en el editor. Cada respuesta tiene: nombre, atajo (`/saludo`), contenido con variables (`{solicitante}`, `{ticket_id}`, `{servicio}`, `{tecnico}`, `{fecha}`), modo por defecto (pública/interna), ámbito (**Personal** o **De mi grupo**), activa. Botones **[+ Nueva]**, **[Editar]**, **[Duplicar]**, **[Eliminar]**. Las de grupo las crea el Supervisor (`tickets.vistas_compartidas`) y los técnicos las usan sin editarlas. Se insertan escribiendo `/` en el editor.

### 6.6 Diferencias entre incidente y solicitud en el espacio de trabajo
| Aspecto | Incidente | Solicitud de servicio |
|---|---|---|
| Objetivo | Restaurar el servicio lo antes posible | Cumplir lo pedido según el flujo definido |
| Acciones propias | Proponer incidente mayor, crear problema, aplicar workaround | Tareas de cumplimiento, recordar aprobación, entrega y vínculo con el activo entregado |
| Pestaña Aprobaciones | No aplica | Visible si el servicio tiene aprobaciones |
| Resolución | Código de resolución y solución | Resultado de entrega |
| Estados | Los de `1.3.1.2` | Los de `1.3.2.2` |

### 6.7 Reglas transversales del ticket
- **Visibilidad:** el Técnico ve los tickets asignados a él, los de sus grupos (cola y asignados a compañeros) y, con `tickets.ver_area`, los de su área técnica en modo consulta.
- **Datos sensibles:** nunca se muestran claves de licencias ni datos financieros de activos al Técnico.
- **Cambio de estado:** solo mediante transiciones configuradas; se validan en servidor.
- **SLA:** los relojes los gestiona el motor de SLA existente; la interfaz solo los muestra. Los estados y motivos de espera definen las pausas.
- **Concurrencia:** presencia y detección de conflicto de edición (4.4).
- **Notificaciones:** cada acción dispara los eventos de la sección 9.

---

## 7. ESPECIFICACIÓN POR OPCIÓN DEL MENÚ

### 7.1 M1 — Mi trabajo

#### M1.1 Panel del técnico (`/tecnico/panel`) 🔒 página de inicio
**Propósito (ITIL 4: *focus on value*, visibilidad):** responder en 5 segundos "¿qué debo atender ahora?".
**Contenido (widgets, en cuadrícula de 12 columnas):**
1. **Banner de incidente mayor** (solo si hay uno activo que afecta a mis servicios): fondo rojo, título, hora de declaración, botón **[Abrir]**.
2. **Tarjetas de indicadores** (clic = abre la lista filtrada): *Asignados a mí* · *Sin asignar en mis grupos* · *Por vencer (SLA en riesgo)* · *Vencidos* · *En espera* · *Resueltos hoy* · *Tareas para hoy* · *Cambios que implemento (7 días)*. Cada tarjeta muestra el número, la variación frente a ayer y un color de estado.
3. **"Atender ahora":** tabla de los 10 tickets más urgentes (vencidos → en riesgo → prioridad → antigüedad) entre mis asignados y la cola de mi grupo, con SLA, y botones por fila **[Abrir]**, **[Tomar]** (si está sin asignar), **[Comentar rápido]** (popover con editor de nota/respuesta).
4. **Mi agenda de hoy:** línea de tiempo con tareas con hora, ventanas de cambio en las que participo y recordatorios; botón **[Ir a mi agenda]**.
5. **Avisos:** feed priorizado de *menciones*, *respuestas de usuarios en tickets en espera*, *tickets reabiertos*, *tickets escalados a mí*, *nuevos errores conocidos de mi área*, *cambios próximos que afectan a mis servicios (48 h)*, *artículos devueltos a corrección*, *revisiones asignadas*. Cada aviso: ícono, texto, tiempo, botón de acción; **[Marcar todo como leído]**.
6. **Mi carga:** barra comparando mis tickets abiertos con el promedio del grupo (sin nombres de compañeros) y el límite configurado.
7. **Mi tendencia (7 días):** gráfico de resueltos por día y % de cumplimiento de SLA.
8. **Accesos rápidos:** botones **[Registrar ticket para un usuario]**, **[Buscar ticket]**, **[Buscar en conocimiento]**, **[Mi agenda]**.
**Botones del encabezado:** **[Actualizar]** · **[Personalizar panel]** (cajón lateral para mostrar/ocultar y reordenar widgets, elegir intervalo de actualización —en vivo/30 s/1 min/manual— y densidad; **[Restablecer]**) · **[Disponibilidad ▾]** (Disponible/Ocupado/No disponible).
**Reglas:** los widgets de problemas, cambios, activos y conocimiento solo aparecen si el módulo está activo y hay permiso; el panel funciona en tableta; los datos se actualizan en tiempo real.

#### M1.2 Mis tareas (`/tecnico/tareas`)
**Propósito:** lista única de todo lo que tengo pendiente, venga de donde venga.
**Fuentes:** tareas de solicitudes, de incidentes, de problemas (investigación), de cambios (pre-implementación, implementación, validación, post-implementación), mantenimientos preventivos, campañas de inventario, revisiones de conocimiento y **recordatorios personales**.
**Segmentos:** Hoy · Esta semana · Vencidas · Sin fecha · Completadas (últimos 30 días).
**Columnas:** Tarea · Origen (tipo e ID con enlace) · Fase · Vence · Estado · Obligatoria/bloquea (ícono) · Prioridad heredada.
**Filtros:** origen, estado, fecha, obligatoria, grupo.
**Botones:**
| Botón | Qué hace |
|---|---|
| **[Iniciar]** | Cambia a *En curso* y registra hora (y arranca el cronómetro si el tiempo está activo). |
| **[Completar]** | Modal: nota, evidencia adjunta (obligatoria si la tarea lo exige), tiempo. Marca hecha; si era la última obligatoria, avisa que el origen puede avanzar. |
| **[Posponer]** | Cambia el vencimiento con motivo; no disponible en tareas obligatorias que bloquean una transición con ventana definida. |
| **[Reasignar]** | Con `tareas.reasignar`; motivo. |
| **[Abrir origen]** | Va al ticket/problema/RFC/activo. |
| **[+ Recordatorio personal]** | Título, fecha y hora, repetición (ninguna/diaria/semanal), vínculo opcional a un objeto; privado, no visible para otros. |
| **Casilla de checklist** | Marca ítems internos de la tarea. |
Acciones masivas: **[Completar seleccionadas]**, **[Posponer seleccionadas]** (con motivo común).

#### M1.3 Mi agenda y disponibilidad (`/tecnico/agenda`)
**Propósito:** planificar el día y comunicar disponibilidad.
**Calendario** (vistas Día / Semana / Mes / Agenda): capas activables — *Mis cambios y ventanas*, *Tareas con vencimiento*, *Mantenimientos preventivos*, *Campañas de inventario*, *Revisiones de conocimiento*, *Mis recordatorios*, *Mis ausencias* (las registradas en `1.4.3`, solo lectura). Cada evento abre un cajón con detalle y botones **[Abrir]**, **[Completar]** (si es tarea) y **[Reprogramar]** (solo recordatorios). Aviso **"Conflicto de agenda"** si dos ventanas de cambio asignadas a mí se solapan.
**Botones:** **[Hoy]** · **[‹] [›]** · **[+ Recordatorio]** · **[Exportar mi agenda (ICS)]** · **[Cambiar disponibilidad]**.
**Disponibilidad:** tres estados — **Disponible** (recibe asignaciones automáticas), **Ocupado** (solo asignaciones automáticas de prioridad P1/P2), **No disponible** (excluido de la asignación automática). Al elegir *Ocupado* o *No disponible* se pide **duración** (30 min, 1 h, 2 h, hasta fin del día, personalizada) y motivo opcional; al vencer vuelve a *Disponible* y avisa. La asignación automática (`1.3.4.2.3` y la de incidentes) debe consultar este estado y las ausencias de `tecnico_ausencias`. Los tickets ya asignados no se reasignan solos; si pasa a *No disponible* con tickets P1/P2 abiertos, el sistema sugiere **[Reasignar mis tickets críticos]**.
**Ausencias:** vista de solo lectura de mis ausencias registradas por el Supervisor, con indicación del suplente.

#### M1.4 Mi desempeño (`/tecnico/desempeno`)
**Propósito (ITIL 4: *continual improvement*):** autogestión; no es una herramienta punitiva.
**Pestañas:** **Mis indicadores** · **Mi grupo** (visible con `reportes.grupo.ver`; muestra agregados sin datos individuales de otros técnicos).
**Selector de periodo:** Hoy · 7 días · 30 días · Trimestre · Personalizado.
**Indicadores (tarjetas con objetivo, valor y tendencia):** tickets resueltos · cumplimiento de SLA de primera respuesta (%) · cumplimiento de SLA de resolución (%) · tiempo medio de resolución · % reabiertos · **FCR** (% resuelto en primer contacto) · satisfacción promedio (CSAT) con los comentarios más recientes · escalamientos realizados y recibidos · tickets resueltos con artículo de conocimiento · artículos aportados/publicados · cambios implementados y % exitosos · tareas completadas a tiempo (%). Cada tarjeta compara contra el objetivo del servicio/grupo y el promedio del grupo.
**Gráficos:** resueltos por día, distribución por servicio y prioridad, tiempo de resolución vs. objetivo.
**Botones:** **[Ver tickets de este indicador]** (detalle que abre la lista filtrada) · **[Exportar mi informe]** (PDF/CSV) · **[Cambiar periodo]**.
**Reglas:** el Técnico solo ve sus propios datos y agregados del grupo; el Supervisor tiene reportes individuales en su propio menú (fuera de alcance).

### 7.2 M2 — Mesa de Servicio

#### M2.1 Mis tickets asignados (`/tecnico/mesa/asignados`) 🔒
**Filtro base:** técnico asignado = yo, estados abiertos (excluye Resuelto/Cerrado/Cancelado).
**Segmentos:** Todos · Incidentes · Solicitudes · En espera · Colaboro en… · Sigo….
**Botón principal:** **[Atender siguiente]** abre el ticket más urgente (vencido → en riesgo → prioridad → antigüedad) y lo pasa a *En atención* si cumple la regla.
**Acciones por fila:** **[Abrir]**, **[Responder]** (popover), **[Poner en espera]**, **[Escalar]**, **[Resolver]**. Más acciones masivas de 5.3.
**Vistas de fábrica:** *Críticos P1/P2* · *Por vencer hoy* · *Esperando respuesta del usuario* · *Reabiertos* · *Sin actualizar > 24 h* · *Mis solicitudes con tareas pendientes*.

#### M2.2 Bandeja de pendientes (`/tecnico/mesa/pendientes`) 🔒
**Filtro base:** tickets sin técnico asignado de los grupos de los que soy miembro, en estados iniciales, y cuyo nivel requerido ≤ mi nivel.
**Segmentos:** Todos · Incidentes · Solicitudes · P1/P2 · Escalados a mi grupo.
**Comportamiento:** al ser un modelo de *tirar* (pull), el técnico elige qué tomar; los tickets P1/P2 sin asignar se resaltan y suenan según preferencias. Si el servicio tiene asignación automática, esta bandeja solo muestra los que quedaron sin asignar.
**Botones:** **[Tomar]** (fila y masivo; atómico), **[Asignar a…]** (con `tickets.reasignar`), **[Vista previa]** (cajón lateral con resumen del ticket sin abrirlo, sin marcar como leído), **[Abrir]**.
**Reglas:** al tomar un ticket se verifica el límite de tickets abiertos por técnico; no se muestran tickets de niveles superiores al propio; un ticket tomado desaparece para los demás en tiempo real.

#### M2.3 Tickets de mi área técnica (`/tecnico/mesa/area`)
**Propósito:** conciencia situacional y colaboración (ITIL 4: *collaborate and promote visibility*).
**Filtro base:** todos los tickets de los grupos del departamento de TI al que pertenezco.
**Modo:** consulta; las acciones se limitan a **[Abrir]**, **[Ofrecer ayuda]** (envía notificación al asignado y, si acepta, queda como colaborador), **[Tomar]** (solo si está sin asignar y soy miembro del grupo) y **[Seguir]**.
**Filtros adicionales:** grupo, técnico, nivel, prioridad. Requiere `tickets.ver_area`.

#### M2.4 Registrar ticket para un usuario (`/tecnico/mesa/registrar`)
**Propósito (ITIL 4 Service Desk):** registrar lo que un usuario reporta por teléfono, chat o de forma presencial.
**Paso 1 — Identificar al solicitante:** buscador por nombre, correo, usuario o número de empleado; al seleccionarlo se muestra la **tarjeta del solicitante** (departamento, ubicación, VIP, activos bajo su custodia, tickets abiertos). **[Cambiar solicitante]**.
**Paso 2 — Datos del contacto:** *Canal* * (Teléfono, Presencial, Chat, Correo, Otro) · *Tipo* * (Incidente / Solicitud) · *Servicio* * (del catálogo, con buscador; muestra grupo resolutor y objetivos).
**Paso 3 — Formulario del servicio:** el formulario dinámico configurado en `1.3.1.1` / `1.3.2.1` (los mismos campos que ve el Solicitante), con texto guía y selector de CI entre los activos del solicitante (más "Todos").
**Panel lateral dinámico:** al escribir título/descripción muestra **artículos y errores conocidos relacionados** y **tickets abiertos similares** del mismo usuario o servicio (aviso de posible duplicado con [Ver] y [Es el mismo: agregar comentario a ese ticket]).
**Opciones:** *Asignarme el ticket* (activo por defecto) · *Notificar al solicitante* (activo) · *Resolver en el primer contacto* (si se activa, muestra los campos de resolución del modal 6.2.1 y crea el ticket directamente en *Resuelto*, marcándolo FCR).
**Botones:** **[Registrar]** (primario) · **[Registrar y abrir]** · **[Registrar y crear otro]** · **[Guardar borrador]** · **[Limpiar]**.
**Validaciones:** obligatorios según formulario, servicio activo, solicitante activo. El ticket guarda `creado_por` (técnico) y `solicitante` (usuario) y `canal`.

#### M2.5 Búsqueda avanzada (`/tecnico/mesa/buscar`)
**Propósito:** encontrar cualquier registro con criterios combinados.
**Alcance (selector):** Tickets · Problemas · Cambios · Activos · Conocimiento.
**Constructor de consulta:** texto libre (ID, título, descripción, comentarios, solución) con operadores *contiene / frase exacta / excluye*; filtros de 5.4 más los propios del alcance; **[+ Agregar condición]** (campo · operador · valor, con AND/OR); **[Buscar similares a…]** (ingresa un ID y busca por semejanza).
**Resultados:** tabla con las columnas del alcance, orden, paginación y vista previa lateral.
**Botones:** **[Buscar]** · **[Limpiar]** · **[Guardar búsqueda]** (con nombre; aparece en un selector "Mis búsquedas") · **[Exportar]** (con permiso) · **[Compartir enlace]** (genera URL con los criterios).

#### M2.6 Historial de resueltos (`/tecnico/mesa/historial`)
**Filtro base:** tickets resueltos o cerrados por mí; interruptor **"Incluir los de mi grupo"** (con `tickets.ver_grupo`).
**Columnas adicionales:** Código de resolución · Tiempo de resolución · ¿Cumplió SLA? · Satisfacción.
**Botones por fila:** **[Abrir]**, **[Reabrir]** (si está en ventana y con permiso), **[Crear artículo desde este ticket]**, **[Ver encuesta de satisfacción]**.
**Filtros:** rango de fechas, servicio, código de resolución, SLA cumplido/incumplido, con satisfacción baja (≤ 2).

### 7.3 M3 — Seguimiento de SLA

#### M3.1 Semáforo de SLA de mi cola (`/tecnico/sla/semaforo`)
**Propósito (ITIL 4 Service Level Management):** gestionar proactivamente los vencimientos.
**Tablero Kanban de solo vista** con cuatro columnas: **Vencidos** (rojo) · **En riesgo** (ámbar; consumo ≥ umbral de riesgo) · **En curso** (verde) · **En pausa** (gris). Cada tarjeta: ID, título, prioridad, servicio, técnico, tiempo restante, objetivo próximo. Cabecera con totales y **porcentaje de cumplimiento del día**.
**Alcance (selector):** Mis tickets · Mi grupo · Mi área técnica (según permisos).
**Botones por tarjeta:** **[Abrir]** · **[Comentar]** · **[Escalar]** · **[Solicitar ayuda]**. Botón general **[Actualizar]** y **[Ver como lista]**.
**Reglas:** el umbral de riesgo es el configurado en el motor de SLA; no se pueden arrastrar tarjetas (el tablero no cambia estados).

#### M3.2 Objetivos de tiempo vigentes (`/tecnico/sla/objetivos`)
**Propósito:** consultar qué tiempos aplican.
**Contenido (solo lectura):** (1) **Matriz Institucional de Tiempos por Prioridad** de `1.2.4` (nivel, prioridad, primera respuesta, resolución total, descripción operativa); (2) **objetivos internos de Problemas** (si el módulo está activo); (3) **plazos de evaluación y aprobación de Cambios** (si el módulo está activo); (4) convención de cómputo de horas del motor de SLA.
**Calculadora:** elige prioridad y fecha-hora de creación → muestra las fechas límite de primera respuesta y de resolución.
**Botones:** **[Descargar PDF]** · **[Copiar tabla]**.

### 7.4 M4 — Gestión de Problemas
*Las pantallas de detalle, formularios y estados son los del Prompt 1 (secciones 4 y 5). Aquí se define solo lo propio del Técnico. Si el perfil Gestor de Problemas aún no existe, el Técnico no asigna problemas (lo hace el Supervisor).*

#### M4.1 Problemas asignados a mí (`/tecnico/problemas/asignados`)
**Filtro base:** problemas abiertos con responsable = yo.
**Columnas:** ID · Título · Estado · Prioridad · Servicio · Incidentes vinculados (nº) · Objetivo de diagnóstico y de resolución (medidores) · Etiquetas (`Error conocido`, `Problema mayor`, `Con RFC pendiente`) · Última actualización.
**Botones por fila:** **[Abrir]** y los botones de transición del estado (ej. **[Iniciar análisis]**, **[Registrar causa raíz]**, **[Publicar error conocido]**, **[Solicitar cambio]**, **[Resolver]**) según el flujo de `1.3.4.2`. **[Poner en espera]** con motivo.
**Vistas de fábrica:** *Por vencer diagnóstico* · *Esperando RFC* · *Con error conocido sin artículo* · *Problemas mayores*.

#### M4.2 Problemas de mi grupo (`/tecnico/problemas/grupo`)
**Filtro base:** problemas cuyo grupo resolutor es uno de mis grupos (asignados o no).
**Botones:** **[Abrir]**, **[Seguir]**, **[Ofrecer ayuda]** (notifica al responsable) y **[Tomar]** (solo con el permiso `problemas.tomar`, desactivado por defecto: los problemas los asigna el Supervisor o el Gestor de Problemas).
**Uso:** conocer qué problemas hay abiertos sobre los servicios que atiendo y vincular incidentes nuevos.

#### M4.3 Registrar problema (`/tecnico/problemas/nuevo`)
Usa el **formulario de registro del Prompt 1 (sección 4)** tal como lo configure el administrador. Particularidades del Técnico:
- Acceso rápido desde un incidente con **[Crear problema]** (precarga origen, incidentes, servicio, CI, categoría).
- Muestra el aviso de **posibles duplicados** antes de enviar.
- Botones: **[Registrar problema]** · **[Registrar y crear otro]** · **[Guardar como borrador]** · **[Cancelar]**.

#### M4.4 Candidatos a problema (`/tecnico/problemas/candidatos`)
**Propósito (ITIL 4: identificación proactiva de problemas):** detectar incidentes recurrentes.
**Pestaña "Sugerencias":** grupos de incidentes detectados por las reglas de umbral del Prompt 1 (`1.3.4.3.1`) en modo *Solo sugerir*, y por una agrupación periódica estándar (misma categoría/CI/servicio con N o más incidentes en la ventana). Cada tarjeta: criterio de agrupación (ej. "5 incidentes · Servicio Correo · CI SRV-012 · 7 días"), nº de incidentes, prioridad máxima, lista desplegable de incidentes, ¿ya existe un problema abierto relacionado?
**Botones por tarjeta:** **[Crear problema con estos incidentes]** (abre el formulario precargado con todos vinculados) · **[Vincular a un problema existente]** (buscador) · **[Ver incidentes]** · **[Descartar sugerencia]** (motivo obligatorio del catálogo: Causa conocida y resuelta · Coincidencia casual · Ya gestionado · Otro; queda registrado y no vuelve a sugerirse el mismo grupo durante N días).
**Pestaña "Explorar":** herramienta de análisis manual: elige *Agrupar por* (servicio, categoría, CI, clase de CI, código de resolución), ventana de tiempo y mínimo de incidentes; muestra el ranking y permite los mismos botones. Botón **[Exportar]**.

#### M4.5 Errores conocidos — KEDB (`/tecnico/problemas/errores-conocidos`)
**Propósito:** consultar y aplicar workarounds documentados.
**Lista:** ID `KE-…` · Título · Servicio/CI · Estado (solo se muestran *Publicados* a técnicos; los *Borrador* y *En revisión* a su autor) · Audiencia · Aplicado en (nº de incidentes) · Última revisión. Buscador por texto y síntomas; filtros por servicio, categoría, CI y estado.
**Detalle (cajón o pantalla):** síntomas, causa (si se conoce), **workaround paso a paso**, solución definitiva prevista y problema asociado (enlace), RFC asociada y su estado, artículos relacionados, historial de revisiones.
**Botones:** **[Copiar workaround]** · **[Aplicar a un ticket]** (selector de ticket abierto: agrega una nota interna con el workaround, vincula el error conocido y suma 1 al contador de uso) · **[Funcionó]** / **[No funcionó]** (retroalimentación con comentario opcional; "No funcionó" notifica al responsable del error conocido) · **[Sugerir corrección]** (comentario al responsable) · **[Ver problema]** · **[Seguir]**.

### 7.5 M5 — Gestión de Cambios
*Formularios, tickets, estados y reglas son los del Prompt 2 (secciones 4 y 5, y 8). El Técnico puede solicitar RFC, implementar las asignadas y consultar el calendario; no evalúa, no aprueba ni dictamina.*

#### M5.1 Mis cambios (`/tecnico/cambios/mis-cambios`)
**Segmentos:** Solicitados por mí · A implementar · Con tareas asignadas · Que sigo.
**Columnas:** ID · Título · Tipo (color) · Estado · Prioridad · Riesgo · Ventana (inicio–fin) · Etapa de aprobación actual · Mi rol (Solicitante / Implementador / Equipo / Tareas).
**Resaltado:** RFC con **información solicitada** (estado *En pausa*) aparecen arriba con el botón **[Responder información]**.
**Botones por fila:** **[Abrir]** · **[Editar]** (en *Solicitado* y *En evaluación*, y solo mis RFC) · **[Responder información]** · **[Cancelar]** (mis RFC, antes de *En autorización*, con motivo) · **[Reenviar con cambios]** (si fue rechazada y el motivo lo permite) · **[Duplicar como nueva RFC]**.

#### M5.2 Registrar solicitud RFC (`/tecnico/cambios/nuevo`)
Usa el **formulario de RFC del Prompt 2 (sección 4)**. Particularidades:
- Tipos visibles según permisos: **Estándar** (con modelo), **Normal**, **Emergencia** (con `cambios.crear_emergencia`).
- Panel derecho "Resumen y validación" con prioridad, riesgo, autoridad que aprobará y **validación de calendario** en vivo (anticipación mínima, ventana, congelamiento, feriado, conflictos, capacidad). Botón **[Revisar calendario]** con próximos huecos libres.
- **[Analizar impacto]** (CI dependientes de la CMDB).
- Botones: **[Enviar RFC]** · **[Enviar y crear otra]** · **[Guardar como borrador]** · **[Usar plantilla ▾]** · **[Cancelar]**.
- Para Emergencia: Sección G visible; el sistema avisa que se convocará al comité de emergencia de inmediato.

#### M5.3 Cambios por implementar (`/tecnico/cambios/implementacion`)
**Propósito:** ejecutar cambios autorizados siguiendo plan, ventana y rollback.
**Lista:** RFC en *Autorizado*, *Programado* o *En ejecución* donde soy implementador o parte del equipo. Columnas: ID · Título · Estado · Ventana (cuenta regresiva) · Riesgo · Checklist Go/No-Go (n/total) · Tareas (n/total) · Condiciones pendientes (n).
**Consola de implementación (al abrir una RFC; tres paneles):**
- **Izquierda — Preparación:** *Condiciones de aprobación pendientes* (lista con casilla de cumplido y responsable), *Checklist Go/No-Go* (ítems, evidencia, quién y cuándo), decisión **Go / No-Go**, validación de calendario.
- **Centro — Ejecución:** tareas por fase (Pre-implementación · Implementación · Validación · Post-implementación) con botones **[Iniciar]** y **[Completar]**; **bitácora de ejecución** (hora, paso, resultado, nota) con **[Registrar paso]**; cronómetro de la ventana (tiempo transcurrido y restante, alertas a T-15 min del fin).
- **Derecha — Referencia:** plan de implementación, plan de pruebas, **plan de rollback** (con tiempo estimado) y contactos de escalamiento; áreas y usuarios afectados; CI afectados con enlace a su ficha.
**Botones de la consola:**
| Botón | Qué hace | Condiciones |
|---|---|---|
| **[Registrar Go / No-Go]** | Registra la decisión con comentario. *No-Go* exige motivo y devuelve la RFC a *Autorizado* para reprogramar. | Checklist obligatoria completa. |
| **[Iniciar implementación]** | Cambia a *En ejecución*, registra inicio real y arranca el cronómetro. | Todas las etapas aprobadas, condiciones cumplidas, Go registrado, **sin congelamiento vigente** y dentro de la ventana ± tolerancia (validado en servidor). |
| **[Registrar paso]** | Agrega entrada a la bitácora (hora automática). | RFC *En ejecución*. |
| **[Registrar incidente durante el cambio]** | Crea un incidente vinculado a la RFC, con servicio y CI prellenados. | |
| **[Solicitar extensión de ventana]** | Envía solicitud al Gestor de Cambios con motivo y duración adicional; se queda en espera de respuesta (no extiende por sí misma). | |
| **[Ejecutar rollback]** | Registra la decisión de revertir (motivo, hora), muestra el plan de rollback paso a paso y arranca el cronómetro de reversión. | RFC *En ejecución*. |
| **[Registrar resultado]** | Modal: resultado (Exitoso / Parcial / Fallido / Rollback ejecutado / Cancelado en ejecución), fin real, interrupción real (min), causa de fallo (si aplica), notas. Cambia a *Implementado* y dispara las acciones por resultado del administrador. | Pasos mínimos registrados si la configuración lo exige. |
| **[Proponer actualización de CMDB]** | Agrega filas (CI, atributo, valor nuevo) a la tabla de actualizaciones con estado *Propuesta*; el Gestor de Activos y Configuración las aplica. | |
Si la RFC aún no está programada, el botón **[Programar]** no existe para el Técnico (lo hace el Gestor de Cambios o el Supervisor); se muestra "Pendiente de programación por Gestión de Cambios".

#### M5.4 Calendario de cambios (`/tecnico/cambios/calendario`)
**Propósito:** coordinar y evitar sorpresas.
**Vistas:** Mes · Semana · Día · Agenda · Línea de tiempo por servicio. **Capas:** RFC programadas y en ejecución, ventanas de mantenimiento, períodos de congelamiento, feriados, reuniones del CAB (solo informativas). **Colores** según la configuración de `1.3.3.4.6`. Mis RFC (implementador/solicitante) con borde destacado.
**Filtros:** tipo, servicio, categoría, riesgo, área, implementador, solo mis servicios.
**Interacción:** clic en un evento abre un cajón con resumen y **[Abrir RFC]**; **[Exportar ICS]**; **[Suscribirme al calendario]** (enlace con token si está permitido). Solo lectura (no se programa desde aquí).
**Reglas:** el Técnico ve solo lo que su perfil permite (si no tiene acceso a la RFC, ve "Mantenimiento programado" con servicio y horario).

#### M5.5 Cambios que afectan mis servicios (`/tecnico/cambios/impacto`)
**Propósito (ITIL 4: coordinación entre prácticas):** que soporte conozca cambios que pueden generar incidentes.
**Filtro base:** RFC en *Autorizado*, *Programado* o *En ejecución*, con ventana en los próximos N días (selector: 3/7/14/30; fábrica 14), cuyos servicios o CI coinciden con los servicios que atiende mi grupo (o con los CI que están bajo su responsabilidad técnica).
**Columnas:** ID · Título · Ventana · Servicios y CI · ¿Interrupción? y duración · Riesgo · Enterado (✔ / pendiente).
**Botones por fila:** **[Abrir]** · **[Enterado]** (confirma que lo leí; queda registrado y quita el contador del menú) · **[Observación técnica]** (comentario marcado que llega al Gestor de Cambios y al implementador) · **[Suscribirme]**.
**Botón general:** **[Marcar todos como enterados]**.

#### M5.6 Historial de cambios (`/tecnico/cambios/historial`)
**Propósito:** responder "¿qué cambió antes de este incidente?".
**Contenido:** RFC cerradas, rechazadas y canceladas (solo lectura). **Buscador por CI o servicio** y filtro rápido **"Cambios en los N días previos a una fecha"** (ingresa fecha y CI → lista los cambios sobre ese CI y relacionados antes de esa fecha).
**Columnas:** ID · Título · Tipo · Resultado · Ventana real · Servicios/CI · Implementador · Incidentes causados.
**Botones:** **[Abrir]** · **[Crear incidente relacionado a este cambio]** · **[Exportar]**.

### 7.6 M6 — Activos y CMDB
*Formularios, ficha, ciclos de vida y reglas son los del Prompt 3 (secciones 4, 5 y 7). El Técnico consulta, edita atributos técnicos, registra mantenimientos y reparaciones y colabora en el inventario físico; no crea activos, no los asigna ni los da de baja (solo solicita la baja).*

#### M6.1 Inventario de activos (`/tecnico/activos/inventario`)
**Columnas:** Código · Nombre · Clase/Tipo · Modelo · Estado · Custodio · Departamento · Ubicación · Criticidad · Garantía (indicador) · Etiquetas (`Problema abierto`, `RFC programada`, `En mantenimiento`).
**Filtros:** clase, tipo, estado, custodio, departamento, ubicación, criticidad, entorno, garantía por vencer, sin custodio, servicio que soporta, texto (código, serie, hostname, IP).
**Búsqueda por usuario:** campo **[Buscar activos de un usuario]** que lista lo que el usuario tiene a su cargo (útil durante la atención).
**Cajón de vista rápida (clic en fila):** resumen de la ficha con pestañas cortas (General, Atributos, Tickets).
**Botones:**
| Botón | Qué hace | Condición |
|---|---|---|
| **[Abrir ficha]** | Ficha completa del Prompt 3 (sección 5), sin financieros ni claves. | |
| **[Editar atributos técnicos]** | Edita solo los atributos técnicos no protegidos del tipo. Los **protegidos** muestran 🔒 "Se modifica mediante RFC" con el botón **[Proponer RFC]**. | `activos.editar_tecnico` |
| **[Crear incidente]** | Incidente con el CI preseleccionado. | |
| **[Crear RFC]** | RFC con el CI preseleccionado (Origen = Mejora/Mantenimiento). | `cambios.crear` |
| **[Registrar mantenimiento]** | Modal: tipo, fecha, proveedor, ticket relacionado, resultado, observaciones. | |
| **[Enviar a reparación] / [Retornar de reparación]** | Transiciones del ciclo de vida si `1.5.2.2` las autoriza al Técnico (motivo, proveedor o taller, ticket relacionado). | Permiso de la transición |
| **[Solicitar baja]** | Inicia la transición de baja con motivo e informe técnico; queda pendiente de aprobación. | `activos.solicitar_baja` |
| **[Reportar inexactitud de CMDB]** | Crea una tarea para el Gestor de Activos y Configuración con el activo, el campo y lo observado. | |
| **[Exportar]** | CSV de la vista (sin datos financieros). | `activos.exportar` |
**No existen** los botones *Nuevo activo*, *Asignar*, *Transferir*, *Importar*, *Dar de baja*.

#### M6.2 Mapa de topología CMDB (`/tecnico/activos/mapa`)
**Propósito:** entender dependencias y el alcance de una falla.
**Controles:** buscador de CI (centro del mapa) · deslizador de **profundidad** (1–5) · filtros por clase, criticidad, entorno, tipos de relación · **colorear por** (criticidad / estado / tickets abiertos) · **[Vista de lista]** · **[Centrar]** · **[Exportar imagen]**.
**Interacción:** arrastrar y zoom; clic en un nodo abre el **panel lateral** con ficha resumen, **análisis de impacto** ("Si este CI falla afecta a: servicios X, Y; CI dependientes: …"), tickets abiertos, RFC próximas y botones **[Abrir ficha]**, **[Crear incidente]**, **[Crear RFC]**, **[Reportar inexactitud]**.
**Reglas:** solo lectura de relaciones; la edición de relaciones es del Gestor de Activos y Configuración.

#### M6.3 Mantenimiento y reparaciones (`/tecnico/activos/mantenimiento`)
**Pestañas:** **Preventivo pendiente** (según los planes de `1.5.2.5`: activo, plan, fecha límite, estado) · **En reparación** (activos en ese estado) · **Historial**.
**Botones:** **[Registrar mantenimiento]** · **[Iniciar]** / **[Completar]** (marca el mantenimiento preventivo con checklist, resultado, tiempo y costo opcional) · **[Crear RFC estándar]** (si el plan lo define así) · **[Retornar de reparación]** · **[Abrir ficha]**.
**Reglas:** completar un preventivo reprograma el siguiente según la frecuencia; vencido en rojo; los preventivos del plan generan además una tarea en M1.2.

#### M6.4 Inventario físico en campo (`/tecnico/activos/conteos`) — *mobile-first*
**Lista de campañas** asignadas a mí (nombre, alcance, avance %, vence). Botón **[Iniciar / Continuar conteo]**.
**Pantalla de conteo (diseñada para teléfono):** cabecera con contadores (Encontrados · Pendientes · Discrepancias), **botón grande de escaneo** (cámara: QR / código de barras) o campo de código manual, lista del alcance con filtro por ubicación.
**Al escanear un código:** muestra la tarjeta del activo (nombre, tipo, ubicación esperada, custodio) y botones grandes: **[Encontrado]** · **[Encontrado en otra ubicación]** (selector de ubicación en árbol; actualiza al cerrar) · **[Dañado]** (nota y foto) · **[No encontrado]** (nota). Si el código no existe: **[Registrar sobrante]** (formulario mínimo: foto, descripción, ubicación, número de serie).
**Botones generales:** **[Pausar]** (guarda y sale) · **[Enviar avance]** · **[Finalizar mi parte]** (muestra resumen de discrepancias). La campaña la cierra el Gestor de Activos y Configuración.
**Reglas:** tolerancia a conexión intermitente (guarda localmente y sincroniza; indicador de sincronización); un activo contado dos veces muestra advertencia; todo conteo registra técnico, fecha-hora y resultado.

#### M6.5 Licencias de software — consulta (`/tecnico/activos/licencias`)
**Columnas:** Producto · Tipo · Cantidad adquirida · En uso · Disponibles · Cumplimiento (Cumple / En riesgo / Sobreuso / Vencida) · Vencimiento · Responsable.
**Filtros:** estado de cumplimiento, producto, vencimiento próximo, departamento.
**Cajón de detalle:** asignaciones (usuario / activo), contrato asociado. **Nunca** muestra claves ni costos.
**Botones:** **[Abrir]** · **[Buscar licencias de un activo o usuario]** · **[Crear incidente sobre esta licencia]**. Sin acciones de asignación ni edición.

### 7.7 M7 — Gestión del Conocimiento

#### M7.1 Base de conocimiento (`/tecnico/conocimiento/base`) 🔒
**Búsqueda:** campo con texto libre y sugerencias mientras se escribe; filtros por categoría (de `1.7.1`), tipo (Error conocido · Solución · Procedimiento · Guía), servicio, CI o tipo de activo, audiencia (Interno / Público), etiquetas, fecha de última revisión. Orden por relevancia, más usados, mejor valorados o más recientes.
**Resultado:** tarjeta con título, resumen, tipo, categoría, valoración (útil %), veces usado y última revisión.
**Vista del artículo:** contenido formateado, metadatos (autor, revisor, versión, vigencia), artículos relacionados, **tickets donde se aplicó**, historial de versiones (diferencias).
**Botones:** **[Insertar en ticket]** (selector de ticket abierto; agrega un enlace o un extracto a una respuesta pública o nota) · **[Copiar enlace]** · **[Útil]** / **[No útil]** (con comentario opcional) · **[Sugerir corrección]** (comentario dirigido al responsable de la categoría) · **[Seguir]** (avisa cambios) · **[Favorito]** · **[Imprimir / PDF]**.
**Reglas:** el Técnico ve artículos internos y públicos publicados; los borradores y en revisión solo su autor y los revisores.

#### M7.2 Mis artículos (`/tecnico/conocimiento/mis-articulos`)
**Estados:** Borrador · En revisión · Devuelto · Publicado · Por revisar (vencido) · Archivado.
**Columnas:** Título · Estado · Categoría · Última modificación · Revisor · Comentarios del revisor (indicador) · Valoración y usos.
**Botones por fila:** **[Editar]** · **[Enviar a revisión]** · **[Retirar de revisión]** · **[Ver comentarios del revisor]** · **[Duplicar]** · **[Actualizar versión]** (crea una nueva versión de un artículo publicado, que vuelve a revisión) · **[Archivar]** (si es el autor y la política lo permite).

#### M7.3 Crear artículo (`/tecnico/conocimiento/nuevo`)
**Entrada:** vacío, por **plantilla** (Error conocido, Solución, Procedimiento, Guía) o **a partir de un ticket / problema** (prellena síntomas, causa, solución, workaround, servicio, CI y enlace de origen, según el mapeo del Prompt 1 `1.3.4.3.5`).
**Formulario:** título * · resumen * · tipo * · categoría * (de `1.7.1`) · servicio(s) · tipo de activo/CI · audiencia * (Interno / Público) · palabras clave · **síntomas** · **causa** · **solución / pasos** (lista numerada con adjuntos y capturas) · **workaround** · enlaces a artículos relacionados · ticket de origen · vigencia / fecha de revisión sugerida.
**Detección de duplicados:** al escribir el título muestra artículos similares con **[Ver]** y **[Actualizar este en su lugar]**.
**Botones:** **[Guardar borrador]** (autoguardado cada 30 s) · **[Vista previa]** (como lo verá cada audiencia) · **[Enviar a revisión]** · **[Cancelar]**. La publicación depende de las reglas de `1.7.1` (el autor no publica su propio artículo salvo permiso).

#### M7.4 Revisiones pendientes (`/tecnico/conocimiento/revisiones`) — condicional
**Visible solo** si el Técnico es revisor designado en `1.7.1`.
**Lista:** artículos asignados para revisar: título, autor, categoría, versión, fecha de envío, plazo.
**Pantalla de revisión:** el artículo con **diferencias contra la versión anterior**, comentarios en línea y lista de verificación (exactitud técnica, claridad, audiencia, sin datos sensibles, clasificación correcta).
**Botones:** **[Aprobar y publicar]** · **[Devolver con comentarios]** (obligatorios) · **[Rechazar]** (motivo) · **[Reasignar revisión]** (si la regla lo permite).

### 7.8 M8 — Catálogo de servicios (consulta) (`/tecnico/catalogo`)
**Propósito (ITIL 4: catálogo como fuente de verdad):** clasificar correctamente y conocer qué se ofrece.
**Pestañas:** **Servicios de incidentes** · **Servicios de solicitudes** (mismas categorías que ve el Solicitante).
**Navegación:** árbol de categorías a la izquierda, lista de servicios a la derecha, buscador.
**Ficha del servicio (cajón):** descripción, tiempos aplicables según prioridad, grupo resolutor, niveles que lo atienden, vista previa del formulario, requisitos y aprobaciones (solicitudes), guías de autoayuda y artículos relacionados.
**Botones:** **[Registrar ticket con este servicio]** (abre M2.4 con el servicio elegido) · **[Ver artículos]** · **[Copiar enlace]**.
**Reglas:** solo lectura; la edición del catálogo es de `1.2` (Administrador).

---

## 8. Permisos del perfil Técnico

El perfil **Técnico** otorga el *máximo* de permisos; el **nivel de soporte** (`1.4.3`) puede **restringir, nunca ampliar** (condición `nivel` en el permiso). ✔ = concedido · — = no concedido. Los permisos de Problemas, Cambios y Activos son los definidos en los Prompts 1, 2 y 3; aquí se listan los que usa este menú.

### 8.1 Tickets (incidentes y solicitudes) y transversales

| Permiso | N1 | N2 | N3 | Notas |
|---|---|---|---|---|
| `tecnico.panel` | ✔ | ✔ | ✔ | Acceso al perfil. |
| `tickets.ver_propios` | ✔ | ✔ | ✔ | Los asignados a mí. |
| `tickets.ver_grupo` | ✔ | ✔ | ✔ | Cola y tickets de mis grupos. |
| `tickets.ver_area` | ✔ | ✔ | ✔ | Modo consulta. |
| `tickets.tomar` | ✔ | ✔ | ✔ | Solo en tickets de mis grupos y nivel ≤ el mío. |
| `tickets.reasignar` | — | ✔ | ✔ | N1 escala; no reasigna directamente entre grupos. |
| `tickets.escalar` | ✔ | ✔ | ✔ | Funcional y jerárquico. |
| `tickets.colaborar` (solicitar/ofrecer ayuda) | ✔ | ✔ | ✔ | |
| `tickets.comentar_publico` / `tickets.comentar_interno` | ✔ | ✔ | ✔ | |
| `tickets.resolver` | ✔ | ✔ | ✔ | Con los campos obligatorios. |
| `tickets.cerrar` | — | — | — | El cierre es automático; el Supervisor puede cerrar. Configurable. |
| `tickets.reabrir` | ✔ | ✔ | ✔ | Dentro de la ventana de reapertura. |
| `tickets.cambiar_categoria` | ✔ | ✔ | ✔ | |
| `tickets.cambiar_prioridad` | — | ✔ | ✔ | Con justificación. |
| `tickets.fusionar` | — | ✔ | ✔ | Con el mismo solicitante o servicio, cualquier nivel puede fusionar. |
| `tickets.crear_por_usuario` | ✔ | ✔ | ✔ | M2.4. |
| `tickets.proponer_incidente_mayor` | ✔ | ✔ | ✔ | Solo propone. |
| `tickets.registrar_tiempo` | ✔ | ✔ | ✔ | Si el registro de tiempo está activo. |
| `tickets.buscar` | ✔ | ✔ | ✔ | |
| `tickets.exportar` | — | ✔ | ✔ | Máximo 5000 filas por exportación. |
| `tickets.vistas_compartidas` | — | — | — | Solo Supervisor. |
| `tareas.reasignar` | — | ✔ | ✔ | |
| `sla.ver` | ✔ | ✔ | ✔ | |
| `reportes.grupo.ver` | ✔ | ✔ | ✔ | Agregados sin datos individuales de compañeros. |
| `catalogo.ver` | ✔ | ✔ | ✔ | |

### 8.2 Problemas, cambios, activos y conocimiento (resumen; detalle en los Prompts 1 a 3)

| Permiso | N1 | N2 | N3 | Notas |
|---|---|---|---|---|
| `problemas.ver` | ✔ | ✔ | ✔ | Su grupo y asignados. |
| `problemas.crear` | ✔ | ✔ | ✔ | N1 normalmente deriva a N2; la restricción se configura. |
| `problemas.editar` | ✔ | ✔ | ✔ | Solo los asignados. |
| `problemas.tomar` | — | — | — | Desactivado por defecto. |
| `kedb.ver` | ✔ | ✔ | ✔ | Solo publicados. |
| `cambios.ver` | ✔ | ✔ | ✔ | Su grupo y los que implementa. |
| `cambios.crear` | ✔ | ✔ | ✔ | Normal y Estándar. |
| `cambios.crear_emergencia` | — | ✔ | ✔ | |
| `cambios.editar` | ✔ | ✔ | ✔ | Propias en *Solicitado* y *En evaluación*, y tareas. |
| `cambios.implementar` | ✔ | ✔ | ✔ | Solo las asignadas. |
| `cambios.documentar_retroactivo` | — | ✔ | ✔ | |
| `calendario_cambios.ver` | ✔ | ✔ | ✔ | |
| `activos.ver` / `cmdb.ver` / `licencias.ver` | ✔ | ✔ | ✔ | Sin financieros ni claves. |
| `activos.editar_tecnico` | — | ✔ | ✔ | Atributos no protegidos. |
| `activos.solicitar_baja` | — | ✔ | ✔ | |
| `activos.conteo` | ✔ | ✔ | ✔ | |
| `activos.exportar` | — | ✔ | ✔ | Sin datos financieros. |
| `conocimiento.ver` / `conocimiento.crear` | ✔ | ✔ | ✔ | |
| `conocimiento.revisar` | por designación | por designación | por designación | Según `1.7.1`. |

**Prohibido para el Técnico en todos los niveles (se valida en servidor):** aprobar etapas de RFC, dictaminar en el CAB, evaluar riesgo de RFC, programar RFC, crear/asignar/dar de baja activos, ver datos financieros y claves, editar la configuración, ver la auditoría global, aprobar sus propias solicitudes.

---

## 9. Eventos de notificación que recibe el Técnico

Cada evento usa las plantillas y canales de `1.6`. Los **obligatorios** no se pueden silenciar. Canales por defecto: **APP** (en la aplicación) y **MAIL** (correo).

| Evento | Se dispara cuando | Canales | Obligatorio |
|---|---|---|---|
| `ticket.asignado_a_mi` | Me asignan un ticket (automático o manual) | APP, MAIL | Sí |
| `ticket.nuevo_en_cola` | Llega un ticket a la cola de mi grupo | APP | No (P1/P2: Sí) |
| `ticket.p1_p2_sin_asignar` | Un P1/P2 lleva más de N min sin asignar | APP, MAIL | Sí |
| `ticket.respuesta_usuario` | El solicitante responde un ticket mío | APP, MAIL | Sí |
| `ticket.mencion` | Me mencionan con `@` | APP | No |
| `ticket.escalado_a_mi` | Me escalan un ticket o a mi grupo | APP, MAIL | Sí |
| `ticket.reasignado_desde_mi` | Reasignan un ticket mío | APP | No |
| `ticket.reabierto` | Reabren un ticket que resolví | APP, MAIL | Sí |
| `ticket.ayuda_solicitada` | Me piden colaborar | APP | No |
| `ticket.sla_75` / `ticket.sla_90` | Consumo del SLA llega a los umbrales | APP (90: + MAIL) | 90: Sí |
| `ticket.sla_vencido` | Se venció un objetivo | APP, MAIL | Sí |
| `ticket.recordatorio_espera` | Se cumple la fecha de reanudación de un ticket en espera | APP | No |
| `ticket.cierre_automatico_proximo` | Un ticket en espera se cerrará por falta de respuesta | APP | No |
| `incidente_mayor.declarado` | Se declara un incidente mayor | APP, MAIL | Sí |
| `tarea.asignada` / `tarea.por_vencer` / `tarea.vencida` | Tareas | APP | Vencida: Sí |
| `problema.asignado` / `problema.objetivo_en_riesgo` | Problemas | APP, MAIL | Asignado: Sí |
| `kedb.publicado_en_mi_area` | Nuevo error conocido para mis servicios | APP | No |
| `rfc.asignada_como_implementador` | Me asignan una RFC | APP, MAIL | Sí |
| `rfc.programada` / `rfc.reprogramada` | La ventana se programa o cambia | APP, MAIL | Sí |
| `rfc.recordatorio_previo` | T-24 h y T-1 h de mi ventana | APP, MAIL | Sí |
| `rfc.en_ejecucion_alerta_fin_ventana` | T-15 min del fin de mi ventana en ejecución | APP | Sí |
| `rfc.informacion_solicitada` | Piden información sobre mi RFC | APP, MAIL | Sí |
| `rfc.rechazada` / `rfc.aprobada` / `rfc.cancelada` | Resultado de mi RFC | APP, MAIL | No |
| `rfc.afecta_mis_servicios` | Nueva RFC programada que afecta mis servicios | APP | No |
| `activo.mantenimiento_proximo` | Preventivo a N días | APP | No |
| `inventario.campania_asignada` | Me asignan un conteo | APP, MAIL | No |
| `conocimiento.articulo_devuelto` / `.aprobado` / `.revision_asignada` | Flujo de artículos | APP | Devuelto: No |
| `sistema.mantenimiento_planificado` | Aviso general | APP | No |

---

## 10. Datos semilla (valores de fábrica)

**Menú del Técnico:** el árbol de 3.1 con los permisos, módulos y contadores de 3.3 y 3.4; ítems 🔒 M1.1, M2.1, M2.2, M7.1; página de inicio = M1.1.

**Vistas guardadas de fábrica (compartidas, no editables):**
- *M2.1:* Críticos P1/P2 · Por vencer hoy · Esperando respuesta del usuario · Reabiertos · Sin actualizar > 24 h · Mis solicitudes con tareas pendientes.
- *M2.2:* Todos · P1/P2 sin asignar · Escalados a mi grupo · Incidentes · Solicitudes.
- *M2.6:* Resueltos hoy · Últimos 7 días · Con satisfacción baja.
- *M4.1:* Por vencer diagnóstico · Esperando RFC · Con error conocido sin artículo · Problemas mayores.
- *M5.1:* Solicitados por mí · A implementar · Con información pendiente.
- *M6.1:* Mis activos de trabajo · Sin custodio · Garantía por vencer · En reparación · Con problema abierto.

**Widgets del panel (todos activos por defecto):** banner de incidente mayor · tarjetas de indicadores · atender ahora · mi agenda de hoy · avisos · mi carga · mi tendencia · accesos rápidos.

**Catálogos:**
- *Motivos de espera:* Esperando información del usuario · Esperando a un proveedor · Esperando aprobación · Esperando ventana de cambio · Esperando repuesto o licencia · Otro (cada uno con "¿pausa el SLA?": sí para los dos primeros, configurable).
- *Motivos de escalamiento funcional:* Requiere mayor especialización · Requiere acceso o permisos · Fuera de mi alcance · Requiere proveedor · Otro.
- *Motivos de escalamiento jerárquico:* Riesgo de incumplir SLA · Cliente VIP · Alto impacto · Falta de respuesta · Otro.
- *Códigos de resolución de incidentes (si no existen):* Solución definitiva · Workaround aplicado · Instrucción al usuario · Reinicio o reconfiguración · Reemplazo de hardware · Acceso o permiso otorgado · No reproducible · Duplicado · Cancelado por el usuario · Otro.
- *Tipos de actividad de tiempo:* Diagnóstico · Intervención · Comunicación · Espera de terceros.
- *Motivos de descarte de candidato a problema:* Causa conocida y resuelta · Coincidencia casual · Ya gestionado · Otro.
- *Canales de contacto:* Teléfono · Presencial · Chat · Correo · Otro.

**Respuestas predefinidas de grupo (de fábrica):** Saludo inicial · Solicitud de información adicional · Ticket en espera · Ticket resuelto (confirmación) · Escalamiento informado al usuario · Recordatorio de respuesta pendiente · Cierre por falta de respuesta.

**Parámetros (valor de fábrica):** límite de tickets abiertos por técnico = 15 (advertencia) · recordatorios de "solicitar información" a las 24 h y 48 h · cierre por falta de respuesta = 5 días · ventana de reapertura = 5 días tras *Resuelto* · "Cambios recientes en el CI" = 30 días · "Cambios que afectan mis servicios" = 14 días · satisfacción baja ≤ 2 · registro de tiempo = **desactivado** · intervalo de actualización del panel = en vivo · caché de contadores = 10 s · máximo de acciones masivas = 100 · exportación máxima = 5000 filas.

---

## 11. Cambios de base de datos requeridos

Principio: **verifica primero si existe (Etapa 0); si no existe, créalo con migración.** No dupliques.

- **Menú:** extiende la tabla de ítems de menú con `permiso_requerido`, `modulo_requerido`, `condicion_nivel`, `contador_clave`, `bloqueado`, `abierto_por_defecto`; tabla de **estado de menú por usuario** (grupos abiertos, barra colapsada); banderas de módulo (`modulo_problemas`, `modulo_cambios`, `modulo_activos`, `modulo_conocimiento`).
- **Preferencias de usuario:** panel (widgets, orden, intervalo, densidad), **vistas guardadas** (ámbito, filtros `jsonb`, columnas, orden, compartida, predeterminada), **búsquedas guardadas**, **preferencias de notificación** (evento × canal, digest, horas de silencio), **respuestas predefinidas** (personal/de grupo), **recordatorios personales**.
- **Disponibilidad:** `tecnico_disponibilidad` (técnico, estado, desde, hasta, motivo) y consulta de `tecnico_ausencias` (Prompt 1).
- **Tickets:** `ticket_colaboradores`, `ticket_seguidores`, `ticket_escalamientos` (tipo, origen, destino, motivo, resumen), `ticket_fusiones`, `ticket_tiempos` (si se activa), `ticket_lecturas` (último visto por usuario para el indicador de no leído), `ticket_canal_contacto` (columna `canal` y `creado_por` distinto de `solicitante_id`), `ticket_incidente_mayor_propuesta`.
- **Conocimiento y errores conocidos:** `kedb_usos` (error conocido, ticket, técnico, resultado *funcionó / no funcionó*, fecha) y `articulo_feedback` (útil/no útil, comentario), `articulo_seguidores`.
- **Problemas:** `candidatos_problema_descartados` (grupo de incidentes, técnico, motivo, hasta cuándo no se vuelve a sugerir).
- **Cambios:** `cambio_enterado` (RFC, técnico, fecha), `cambio_observaciones_tecnicas`, `cambio_go_nogo` y bitácora de ejecución (si no existen por el Prompt 2).
- **Activos:** `cmdb_reportes_inexactitud` (activo, campo, observación, reportado por, estado, tarea creada), resultados de conteo (Prompt 3) y registro de sobrantes.
- **Contadores:** vistas o funciones agregadas por usuario con índices en (asignado, estado, grupo, vencimiento de SLA) para que los contadores respondan en < 200 ms; si hay volumen alto, vistas materializadas o contadores en caché.
- **Tiempo real:** canales de Supabase Realtime por grupo resolutor y por usuario; RLS para que los canales respeten visibilidad.
- **Búsqueda:** índices de texto completo en español y similitud (`pg_trgm`) sobre títulos, descripciones y comentarios; catálogos de sugerencias de conocimiento por similitud.
- **Seguridad:** políticas RLS que implementen `ver_propios`, `ver_grupo` y `ver_area`; vistas que excluyan columnas financieras y sensibles para el Técnico.
- **Tareas programadas** (usa el mecanismo existente; si no hay, propón —sin implementar— `pg_cron`, Edge Functions o cron de Next.js): recordatorios de espera y cierre por falta de respuesta, restablecimiento de disponibilidad, alertas de fin de ventana, sugerencias de candidatos a problema, recordatorios de tareas y de mantenimiento.
- **Semillas:** todo lo de la sección 10 mediante migración idempotente.

---

## 12. Dependencias con la configuración del Administrador

| Pantalla de configuración | Lo que consume el menú del Técnico |
|---|---|
| `1.1.2 Perfiles y permisos` | Permisos de la sección 8 y condición de nivel de soporte. |
| `1.1.3 Estructura del menú` | Carga, orden, ocultamiento y bloqueo (🔒) de los ítems de 3.1. |
| `1.2 Catálogo de servicios y SLAs` | Servicios, grupos resolutores, matriz de tiempos (1.2.4), objetivos para M3.2 y M8. |
| `1.3.1 / 1.3.2 Incidentes y Solicitudes` | Formularios, estados, transiciones y acciones (botones de 6.2), motivos de espera, códigos de resolución, aprobaciones. |
| `1.3.3 Cambios` | Formulario RFC, tipos, flujo, calendario y notificaciones (M5). |
| `1.3.4 Problemas` | Formulario, flujo, reglas de umbral, KEDB y conocimiento (M4). |
| `1.4 Organización y soporte` | Grupos resolutores, técnicos y niveles, supervisores y ausencias. |
| `1.5 Activos y configuración` | Clases, atributos protegidos, ciclos de vida, mantenimientos y campañas (M6). |
| `1.6 Comunicaciones` | Plantillas y canales para los eventos de la sección 9. |
| `1.7 Gobierno del conocimiento` | Categorías, responsables, revisión y publicación (M7). |
| `1.8 Auditoría` | Registro de todas las acciones del Técnico; límites de adjuntos y retención. |
| `2 Reportes` | Fuente de datos de los indicadores de M1.4. |

---

## 13. Criterios de aceptación

1. Un usuario con perfil Técnico ve exactamente el menú de 3.1 (según permisos, módulos y nivel), con el mismo componente visual de los otros perfiles, y la página de inicio es el Panel.
2. El menú se carga desde datos administrables en `1.1.3`; los ítems 🔒 no se pueden quitar; ocultar un ítem no deja su pantalla accesible a quien no tenga permiso por URL directa (se valida en servidor).
3. Los contadores del menú son correctos, respetan la visibilidad y se actualizan en tiempo real.
4. El selector de perfil aparece solo si el usuario tiene más de un perfil y cambia el menú sin recargar la sesión.
5. Un Técnico solo puede ver tickets propios, de sus grupos y (con permiso) de su área, también por API y Realtime; un intento de acceder a otro ticket recibe 403/404.
6. **Tomar** un ticket es atómico: si dos técnicos lo intentan a la vez, solo uno lo obtiene y el otro recibe el mensaje.
7. Los botones del ticket se generan desde las transiciones de `1.3.1.2` y `1.3.2.2`; al cambiar la configuración, los botones cambian sin cambiar código.
8. Poner en espera pausa el SLA según el motivo; reanudar lo reanuda; los medidores del ticket y del semáforo reflejan el motor de SLA existente.
9. Escalar (funcional y jerárquico), solicitar ayuda, fusionar, reabrir y proponer incidente mayor funcionan, notifican y quedan en la línea de tiempo y la auditoría.
10. Resolver exige código de resolución y solución; permite crear artículo, problema o RFC desde el mismo modal con datos prellenados.
11. El panel muestra los widgets con datos reales, es personalizable por usuario y se actualiza en vivo.
12. Registrar un ticket para un usuario (M2.4) guarda `creado_por`, `solicitante` y `canal`, sugiere conocimiento y detecta duplicados, y permite resolver en el primer contacto.
13. Las vistas guardadas, columnas y filtros se guardan por usuario; las compartidas del Supervisor no son editables por el Técnico.
14. Las acciones masivas respetan permisos y el máximo de 100, y registran una auditoría por ticket.
15. M4.4 muestra sugerencias de incidentes recurrentes y permite crear un problema con los incidentes vinculados o descartar con motivo.
16. Aplicar un workaround desde M4.5 agrega la nota, vincula el error conocido e incrementa su contador de uso.
17. La consola de implementación (M5.3) impide iniciar sin aprobaciones, condiciones, Go y sin congelamiento (validado en servidor) y registra bitácora, rollback y resultado.
18. El Técnico no ve botones ni endpoints de aprobar, evaluar, dictaminar ni programar RFC.
19. El calendario de cambios respeta lo configurado en `1.3.3.4.6` y los permisos del perfil.
20. El Técnico no ve costos, valores residuales ni claves de licencia, ni por interfaz ni por API; los atributos protegidos solo se modifican mediante RFC.
21. El conteo en campo funciona en un teléfono: escaneo, resultados, sobrantes, sincronización tolerante a pérdida de conexión y finalización de la parte del técnico.
22. La base de conocimiento permite buscar, insertar en tickets, valorar y sugerir correcciones; los artículos del Técnico siguen el flujo de revisión de `1.7.1`.
23. Las preferencias de notificación respetan los eventos obligatorios y las horas de silencio.
24. La disponibilidad (Disponible/Ocupado/No disponible) y las ausencias son consideradas por la asignación automática.
25. Presencia y detección de conflicto de edición funcionan en el espacio de trabajo del ticket.
26. Toda acción queda auditada (usuario, hora, antes, después); las bitácoras son inmutables.
27. Los atajos de teclado y la búsqueda global (`Ctrl+K`) funcionan y respetan permisos.
28. Las listas con 500+ filas no degradan el rendimiento (desplazamiento virtual o paginación).
29. Los módulos no implementados (problemas, cambios, activos, conocimiento) ocultan sus ítems sin errores.
30. Los menús del Solicitante y del Administrador siguen funcionando exactamente igual que antes.

---

## 14. Etapa 0 — Reconocimiento obligatorio y preguntas abiertas

**Antes de escribir código**, revisa el repositorio y la base de datos y entrégame un **informe** (sin modificar nada) con:

1. **Menú actual:** cómo se construyen hoy los menús del Solicitante y del Administrador (componente, datos o código fijo), cómo funciona el selector de perfil y qué tabla usa `1.1.3 Estructura del menú`.
2. **Pantallas existentes del Técnico:** rutas y componentes que ya existan para listas de tickets, bandejas, detalle de ticket, registro de ticket y búsqueda, y si el detalle de ticket está compartido entre perfiles.
3. **Modelo de ticket:** tablas de incidentes y solicitudes (o tabla unificada), estados, transiciones configurables (`1.3.1.2`, `1.3.2.2`), asignación, comentarios públicos/internos, adjuntos, tareas, vínculos.
4. **Motor de SLA:** dónde está, cómo cuenta las horas (corridas/hábiles), cómo pausa y qué cuenta como primera respuesta.
5. **Asignación automática y grupos:** cómo se asignan hoy los tickets, cómo se guarda el nivel de soporte del técnico (`1.4.3`) y los grupos (`1.4.2`).
6. **Permisos:** mecanismo (tablas, funciones, RLS) y si soporta permisos por acción y la condición de nivel.
7. **Notificaciones y tiempo real:** sistema de notificaciones (`1.6`), eventos y plantillas disponibles, y uso actual de Supabase Realtime.
8. **Estado de los Prompts 1, 2 y 3:** qué módulos y pantallas existen ya (problemas, cambios, activos, conocimiento) para fijar las banderas de módulo.
9. **Conocimiento:** módulo actual de artículos, categorías y flujo de revisión.
10. **Qué de la sección 11 ya existe y qué falta**, con plan de migraciones.
11. **Riesgos o conflictos** detectados (por ejemplo, rutas que cambian o pantallas duplicadas).

Después **detente y espera mi aprobación** para iniciar la Etapa A.

**Preguntas abiertas que quedan** (responde lo que puedas con el código; pregúntame solo lo que no puedas determinar):
1. ¿Reorganizo las pantallas de Técnico que ya existan bajo las rutas `/tecnico/...` con redirecciones desde las antiguas, o mantengo las rutas actuales y solo cambio el menú? **Propuesta por defecto: mantener las rutas actuales de detalle compartido (`/tickets/[id]`) y crear `/tecnico/...` para las listas nuevas, con redirecciones.**
2. ¿Dónde se guardan hoy los parámetros globales del sistema (límite de tickets por técnico, días de cierre automático, registro de tiempo)? Si no hay una pantalla para ellos, ¿creo una tabla de parámetros con valores de fábrica y la dejo **sin pantalla** hasta definirla con el Administrador (se edita por base de datos o por una futura opción de `1.1`)? **Propuesta por defecto: sí.**
3. ¿Se activan desde el inicio las capacidades opcionales **respuestas predefinidas**, **disponibilidad** y **registro de tiempo**? **Propuesta por defecto:** respuestas predefinidas y disponibilidad sí; registro de tiempo desactivado (bandera).
4. ¿Existe ya el concepto de **incidente mayor**? Si no, la acción *Proponer incidente mayor* crea solo la etiqueta y la notificación a Supervisores hasta que se defina el proceso.
5. ¿Existe una encuesta de satisfacción (CSAT) de tickets? Si no, M1.4 oculta esos indicadores.
6. ¿La app necesita funcionar como PWA para el conteo en campo (instalable, caché offline)? **Propuesta por defecto: PWA solo para M6.4.**

---

## 15. Fuera de alcance de este prompt
Menús de los demás perfiles (Supervisor, Gestor de Área, Auditor, Aprobador, Gestor de Cambios, Gestor de Activos y Configuración, Gestor de Problemas, Solicitante) · Pantallas de configuración del Administrador (Prompts 1 a 3) · Eventos y monitoreo, disponibilidad/capacidad/continuidad y proveedores como módulos del Técnico · Reportes individuales de otros técnicos y evaluación de desempeño por jefatura · Integraciones externas (telefonía, chat, correo entrante) más allá del registro del canal de contacto · Aplicación móvil nativa.
