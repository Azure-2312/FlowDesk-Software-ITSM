# PROMPT 1 de 3 — Configuración del administrador: GESTIÓN DE PROBLEMAS

> **Rama del menú que se implementa:** `1 Configuración > 1.3 Configuración de procesos > 1.3.4 Gestión de problemas`

---

## 0. Instrucciones para la IA que implementará esto

**Rol:** eres un arquitecto/desarrollador senior de software ITSM. Vas a construir el área de configuración del *administrador* para el proceso de Gestión de Problemas de un sistema ITSM que ya tiene Incidentes y Solicitudes de servicio.

**Reglas obligatorias:**

1. Implementa **exactamente** lo descrito. Si algo no está especificado, **no lo inventes**: antes de escribir código, devuelve una lista numerada de "Preguntas abiertas" (ver sección 14) y espera respuesta.
2. **No cambies la numeración ni los nombres del menú**, salvo el renombre indicado en la sección 2.
3. **Nada hardcodeado:** todo lo que aquí se llama "configurable" se guarda en base de datos y se lee en tiempo de ejecución. Los valores de fábrica (sección 10) se cargan como datos semilla.
4. Todas las pantallas siguen el **patrón común de la sección 3** (borrador, publicación, versionado, auditoría, permisos).
5. **Reutiliza lo que ya existe; no crees duplicados.** El sistema ya tiene (ver sección 11): la configuración de formulario de Incidentes (1.3.1.1) y su **creador de campos personalizados**, la **matriz impacto × urgencia → prioridad** usada al crear incidentes, la **matriz institucional de tiempos por prioridad** (1.2.4), el catálogo de servicios, los perfiles y la CMDB. Ubica cada pieza en el código (Etapa 0), extiéndela para la entidad `problema` y solo crea componentes nuevos cuando no exista nada reutilizable.
6. Para cada pantalla entrega, en este orden: (a) modelo de datos, (b) API, (c) interfaz, (d) validaciones, (e) permisos, (f) auditoría, (g) pruebas.
7. Trabaja por etapas y detente al final de cada una para validación: **Etapa 0** = reconocimiento del código y la base de datos (sección 14, **obligatoria antes de escribir código**), **Etapa A** = 1.3.4.1, **Etapa B** = 1.3.4.2, **Etapa C** = 1.3.4.3.
8. **Si falta un dato en la base de datos, agrégalo.** La lista de lo que debe verificarse y, si no existe, crearse está en la sección 12. Todo cambio de esquema va en migraciones SQL versionadas, idempotentes, con políticas RLS de Supabase coherentes con las de las tablas de configuración existentes.
9. Sigue las convenciones ya presentes en el repositorio (estructura de carpetas, estilo de API, componentes de UI, manejo de errores, tareas programadas).

---

## 1. Marco normativo y de buenas prácticas

El diseño debe respetar:

| Referencia | Qué se toma de ella |
|---|---|
| **ITIL 4 – Práctica "Problem Management"** | Tres actividades: *identificación de problemas*, *control de problemas* (análisis de causa raíz, workaround) y *control de errores* (error conocido, solución permanente, vía Change Enablement). |
| **ITIL 4 – Prácticas relacionadas** | Incident Management, Change Enablement, Knowledge Management, Service Configuration Management, Service Level Management, Continual Improvement. |
| **ITIL 4 – Principios rectores** | Enfocarse en el valor, empezar donde se está, progresar iterativamente, colaborar, pensar y trabajar de forma holística, mantenerlo simple, optimizar y automatizar. (Aplicación práctica: valores de fábrica listos para usar, pocos campos obligatorios, automatización por reglas.) |
| **ISO/IEC 20000-1:2018, cláusula 8.6.3** | Gestión de problemas: identificar, registrar, clasificar, priorizar, investigar, mantener errores conocidos, escalar, cerrar con evidencia y retroalimentar a otros procesos. |
| **COBIT 2019 – DSS03 (Managed Problems)** | Trazabilidad, análisis de tendencias, revisión de problemas mayores. |
| **Trazabilidad general (buena práctica de gobierno)** | Todo cambio de configuración queda auditado (quién, cuándo, antes, después, motivo). |

**Definiciones que deben respetarse en todo el sistema:**
- **Problema:** causa subyacente, real o potencial, de uno o más incidentes.
- **Error conocido:** problema con causa raíz documentada **y/o** un workaround publicado.
- **Workaround:** solución temporal que reduce o elimina el impacto sin resolver la causa.
- **KEDB:** base de datos de errores conocidos.
- **Problema mayor:** problema que cumple los criterios configurables de la sección 1.3.4.2 (pestaña "Problemas mayores") y exige revisión formal.

---

## 2. Ubicación en el menú

### 2.1 Menú de administrador (referencia completa, no modificar)

```
1 Configuración
 1.1 Identidades y accesos
  1.1.1 Gestión de usuarios
  1.1.2 Perfiles y permisos
  1.1.3 Estructura del menú
 1.2 Catálogo de servicios y SLAs
  1.2.1 Servicios de incidentes
  1.2.2 Servicios de solicitudes
  1.2.3 Crear servicio
  1.2.4 Objetivos SLA
 1.3 Configuración de procesos
  1.3.1 Incidentes
   1.3.1.1 Configuración de formulario
   1.3.1.2 Flujo de estados y acciones
  1.3.2 Solicitudes de servicio
   1.3.2.1 Configuración de formulario
   1.3.2.2 Flujo de atención y aprobaciones
  1.3.3 Gestión de cambios
   1.3.3.1 Formulario RFC
   1.3.3.2 Tipos de cambio y requisitos
   1.3.3.3 Flujo de evaluación, autorización y revisión posterior
   1.3.3.4 Notificaciones y calendario de cambios
  1.3.4 Gestión de problemas            <-- SE IMPLEMENTA EN ESTE PROMPT
   1.3.4.1 Configuración de formulario   (renombrado; antes "Formularios")
   1.3.4.2 Flujo de investigación y seguimiento
   1.3.4.3 Relación con incidentes, errores conocidos y conocimiento
 1.4 Organización y soporte
  1.4.1 Departamentos empresariales
  1.4.2 Departamentos y grupos resolutores de TI
  1.4.3 Técnicos y niveles de soporte
  1.4.4 Supervisores
 1.5 Activos y configuración
  1.5.1 Tipos, modelos y atributos de activos
  1.5.2 Ciclos de vida y reglas de transición
  1.5.3 Licencias y contratos
  1.5.4 Tipos de elementos de configuración y relaciones de CMDB
 1.6 Comunicaciones y notificaciones
  1.6.1 Plantillas de correo y otros canales
  1.6.2 Configuración de contacto
 1.7 Gobierno del conocimiento
  1.7.1 Categorías, responsables y reglas de publicación/revisión
 1.8 Auditoría, seguridad y retención
  1.8.1 Auditoría de cambios
  1.8.2 Registros de seguridad y autenticación
  1.8.3 Retención y mantenimiento de datos
2 Reportes y Analítica
 2.1 Indicadores operativos y SLA
 2.2 Tableros
```

### 2.2 Cambio de nombre
`1.3.4.1` pasa de **"Formularios"** a **"Configuración de formulario"**. Actualiza el menú, la ruta (breadcrumb) y los permisos asociados.

### 2.3 Convención de numeración interna
- `1.3.4.1`, `1.3.4.2`, `1.3.4.3` son **ítems de menú = pantallas**.
- Los puntos `1.3.4.1.1`, `1.3.4.1.2`, etc. son **pestañas (tabs) dentro de la pantalla**. Cada pestaña lleva en su título el número (ej. "1.3.4.1.1 Campos").

| Pantalla (ítem de menú) | Pestañas |
|---|---|
| **1.3.4.1 Configuración de formulario** | 1.3.4.1.1 Campos · 1.3.4.1.2 Campos personalizados · 1.3.4.1.3 Listas y catálogos · 1.3.4.1.4 Matriz de prioridad · 1.3.4.1.5 Plantillas de problema · 1.3.4.1.6 Vista del ticket |
| **1.3.4.2 Flujo de investigación y seguimiento** | 1.3.4.2.1 Estados · 1.3.4.2.2 Transiciones y acciones · 1.3.4.2.3 Asignación automática · 1.3.4.2.4 Objetivos de tiempo · 1.3.4.2.5 Escalamiento · 1.3.4.2.6 Reapertura · 1.3.4.2.7 Tareas predefinidas · 1.3.4.2.8 Problemas mayores |
| **1.3.4.3 Relación con incidentes, errores conocidos y conocimiento** | 1.3.4.3.1 Creación automática por umbral · 1.3.4.3.2 Incidentes vinculados · 1.3.4.3.3 Errores conocidos (KEDB) · 1.3.4.3.4 Cambios (RFC) · 1.3.4.3.5 Conocimiento · 1.3.4.3.6 CI y servicios |

---

## 3. Patrón común de TODAS las pantallas de configuración

Aplica a cada pantalla y pestaña de este documento. **No se repite abajo**; solo se indican los botones y reglas *adicionales* de cada pestaña.

### 3.1 Estructura visual
1. **Breadcrumb:** `Configuración > Configuración de procesos > Gestión de problemas > <pantalla> > <pestaña>`.
2. **Encabezado:** título, descripción de una línea (qué configura y qué efecto tiene), y un **indicador de estado de la configuración**:
   - `Publicada vN` (verde) = no hay cambios pendientes.
   - `Borrador con cambios sin publicar` (ámbar) = hay diferencias respecto a la versión publicada.
   - Debajo: "Última modificación por *usuario* el *fecha-hora*".
3. **Barra de acciones fija (sticky) al pie** con estos botones, en este orden:

| Botón | Estilo | Comportamiento |
|---|---|---|
| **Guardar borrador** | Secundario | Guarda cambios sin afectar el sistema en producción. Habilitado solo si hay cambios. Toast "Borrador guardado". |
| **Vista previa** | Secundario | Abre modal/panel que muestra cómo quedará (el formulario, el ticket o el flujo) con datos de ejemplo. Permite el selector "Probar como perfil: [lista]". Solo lectura. |
| **Publicar…** | Primario | Abre el modal de publicación (3.2). Deshabilitado si hay errores de validación o no hay cambios. |
| **Descartar cambios** | Texto/peligro | Modal de confirmación "Se perderán los cambios del borrador. ¿Continuar?" [Descartar] [Cancelar]. Vuelve a la última versión publicada. |
| **Restaurar valores de fábrica** | Texto | Modal que explica qué se restaura (solo esta pestaña) y exige escribir la palabra `RESTAURAR` para habilitar el botón. Carga en borrador, no publica. |
| **Historial de versiones** | Texto | Abre panel lateral con la lista de versiones (3.3). |
| **Exportar** / **Importar** | Texto | Exportar la configuración de la pestaña a JSON firmado con versión de esquema. Importar valida esquema y carga en borrador mostrando diferencias; nunca publica automáticamente. |

4. **Advertencia de salida:** si hay cambios sin guardar y el usuario navega fuera, mostrar "Tienes cambios sin guardar" con [Guardar borrador y salir] [Salir sin guardar] [Cancelar].
5. **Estados de pantalla:** cargando (skeleton), vacío (mensaje + botón de acción principal), error (mensaje + [Reintentar]).
6. **Bloqueo de edición concurrente:** si otro administrador está editando la misma pestaña, mostrar banner "En edición por *usuario* desde *hora*" y poner la pantalla en solo lectura. El bloqueo expira a los 15 min de inactividad. Botón [Solicitar control] disponible para el perfil Administrador.
7. Las pantallas son **solo escritorio** (≥1280 px). Todo arrastrar-y-soltar debe tener alternativa por teclado (botones ↑ ↓ y atajos).

### 3.2 Modal de publicación
- Muestra **resumen de diferencias (diff)**: elementos agregados (verde), modificados (ámbar, con valor anterior → nuevo) y eliminados (rojo).
- Muestra **análisis de impacto**: "Esta publicación afecta a N tickets abiertos" cuando aplique (ver 3.4).
- Campo **Motivo del cambio** (obligatorio, mín. 10 caracteres).
- Casilla "He revisado el impacto" (obligatoria si el impacto alcanza tickets abiertos).
- Botones: [Confirmar publicación] [Cancelar].
- Al confirmar: se crea nueva versión inmutable `vN+1`, se aplica de inmediato, se emite evento `configuracion.publicada` y se registra en auditoría.

### 3.3 Versionado
Cada versión guarda: número, fecha-hora, autor, motivo, snapshot completo (JSON) y diff contra la anterior. Desde el panel de historial:
- [Ver] → vista de solo lectura de esa versión.
- [Comparar con actual] → diff lado a lado.
- [Restaurar esta versión] → carga esa versión como borrador (no publica).
- Las versiones **no se editan ni se borran** (la retención se rige por 1.8.3).

### 3.4 Efecto de la configuración sobre tickets existentes
Regla general (aplicar salvo que la pestaña indique otra cosa):
- Los cambios de **formulario** (campos, obligatoriedad) aplican a tickets **nuevos** y a la edición de tickets en estados no finales. Un campo que pasa a obligatorio **no invalida** tickets ya existentes; solo se exige al editarlos o al ejecutar una transición que lo requiera.
- Un campo que se **oculta** conserva sus datos en base de datos (nunca se borran); solo deja de mostrarse y puede reactivarse.
- Los cambios de **flujo** (estados/transiciones) aplican a todos los tickets abiertos; si un estado en uso se desactiva, la publicación se bloquea con el mensaje "El estado X tiene N tickets; reasígnalos a otro estado" y un asistente de migración (selector de estado destino + botón [Migrar y continuar]).
- Los valores de listas en uso **no se eliminan**, solo se desactivan.

### 3.5 Auditoría (conecta con 1.8.1)
Cada guardado de borrador, publicación, restauración, importación y descarte genera un registro: usuario, IP, fecha-hora UTC, pantalla/pestaña, entidad, valor anterior, valor nuevo, motivo (si lo hay), versión resultante. Los registros son de solo lectura.

### 3.6 Permisos (conecta con 1.1.2)
Por cada pantalla existen tres permisos: `ver`, `editar` (guardar borrador) y `publicar`. Detalle en la sección 9.

### 3.7 Validaciones generales
- Mensajes de error junto al campo (rojo) y resumen al inicio de la pestaña con enlaces a cada error.
- Nombres, etiquetas y códigos: sin espacios iniciales/finales, único dentro de su lista, sin caracteres de control. Códigos: `^[a-z][a-z0-9_]{2,39}$`, inmutables tras la primera publicación.
- Toda eliminación pide confirmación y, si el elemento está en uso, se ofrece **Desactivar** en lugar de eliminar.

---

## 4. ESPECIFICACIÓN DEL FORMULARIO DE REGISTRO DE PROBLEMA (lo que ve el usuario)

Esta sección define la **versión de fábrica** del formulario. La sección 6 define cómo el administrador la modifica.

**Quién lo usa:** perfiles **Técnico**, **Gestor de Problemas**, **Supervisor** y **Administrador** (permiso `problemas.crear`). Los perfiles Solicitante, Gestor de Área, Auditor y Aprobador **no** registran problemas.
**Dónde:** menú `4 Gestión de Problemas > 4.1 Registro de problemas > botón [+ Nuevo problema]`. También desde un incidente: botón **[Crear problema desde este incidente]**, que abre este formulario con Origen = *Incidente(s)*, el incidente ya vinculado, y el servicio, los CI y la categoría prellenados desde el incidente.
**Disposición:** una sola página con **secciones plegables**, todas abiertas al inicio. Arriba, a la derecha, el selector **[Usar plantilla ▾]** (ver 1.3.4.1.5).

### 4.1 Secciones y campos

**Sección A — Identificación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas y comportamiento |
|---|---|---|---|---|---|
| A1 | Título | `titulo` | Texto de una línea | Sí | 10–150 caracteres. Contador visible. Al escribir, muestra hasta 5 **problemas abiertos similares** (coincidencia de texto) para evitar duplicados, con enlace para abrirlos en pestaña nueva. |
| A2 | Descripción / síntomas observados | `descripcion` | Texto enriquecido (negrita, listas, código, enlaces, imágenes pegadas) | Sí | Mín. 30 caracteres, máx. 10 000. Con **texto de fondo guía** (placeholder) en el mismo estilo que ya usa el formulario de Incidentes, adaptado a problemas: frecuencia de la falla, pasos previos o cómo reproducirla, hora y duración de las ocurrencias, mensaje o código de error, y a quién afecta. |
| A3 | Origen | `origen` | Lista desplegable | Sí | Valores de fábrica en sección 10. Al cambiarlo se disparan reglas condicionales (A4 y otras). |
| A4 | Incidentes relacionados | `incidentes_vinculados` | Selector múltiple con búsqueda | Sí **si** Origen = Incidente(s); si no, opcional | Búsqueda por ID, título o CI. Cada resultado muestra ID, título, estado, prioridad y servicio. Máx. 200. Chips removibles. Contador "N incidentes vinculados". Si Origen = Detección proactiva/Tendencias/Proveedor puede quedar vacío. |

**Sección B — Alcance**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| B1 | Servicio afectado | `servicio_id` | Lista con búsqueda (catálogo 1.2) | Sí | Solo servicios activos. Si hay incidentes vinculados con un único servicio, se prellena y se puede cambiar. |
| B2 | Activos / CI afectados | `ci_afectados` | Selector múltiple (CMDB) | No | Filtrado por defecto por el servicio elegido (casilla "Ver todos los CI"). A diferencia del formulario de Incidentes (que solo lista ítems bajo custodia del usuario), aquí se listan **todos** los CI de la CMDB (hardware, software y periféricos). Muestra código, nombre, clase y criticidad. Se sugieren los CI de los incidentes vinculados con botón [Agregar sugeridos]. |
| B3 | Categoría | `categoria_id` | Lista en cascada (Categoría → Subcategoría) | Sí | Catálogo editable (1.3.4.1.3). Al elegir categoría puede prellenar grupo resolutor (si la categoría tiene grupo por defecto). |

**Sección C — Clasificación y priorización**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| C1 | Impacto | `impacto` | Lista con **los mismos niveles que usa hoy Incidentes (Alta / Media / Baja)**, con descripción de cada nivel en tooltip | Sí | Los niveles se leen de la matriz compartida (1.3.4.1.4); no se redefinen aquí. |
| C2 | Urgencia | `urgencia` | Lista (Alta/Media/Baja) con tooltip | Sí | Ídem. |
| C3 | Prioridad | `prioridad` | Insignia de solo lectura con color | Calculado | Se recalcula al instante con **la misma matriz impacto × urgencia que usa Incidentes** (P1 a P4), salvo que el admin active una matriz propia para problemas (1.3.4.1.4). Si la configuración permite prioridad manual, aparece el enlace [Cambiar manualmente] que exige justificación. |

**Panel informativo de la Sección C (a la derecha, solo lectura):** equivalente al "panel de SLAs asociados" del formulario de Incidentes. Al calcularse la prioridad, muestra los objetivos de tiempo del problema para esa prioridad (primera respuesta, diagnóstico y resolución, en horas, tomados de 1.3.4.2.4) y la descripción operativa del nivel.

**Sección D — Asignación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| D1 | Grupo resolutor | `grupo_id` | Lista (grupos de 1.4.2) | Sí | Prellenado por reglas de asignación automática (1.3.4.2.3); editable si el perfil lo permite. |
| D2 | Responsable | `responsable_id` | Lista con búsqueda (técnicos del grupo, 1.4.3) | No al crear | Si queda vacío, el problema se crea en estado *Nuevo* sin responsable y aparece en la bandeja del grupo. Muestra carga actual (tickets abiertos) junto a cada nombre. |

**Sección E — Mitigación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| E1 | Workaround conocido | `workaround` | Texto enriquecido | No | Si se completa, aparece la casilla "Publicar como error conocido al registrar" (solo con permiso `kedb.publicar`). |

**Sección F — Adjuntos**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| F1 | Evidencias (adjuntos) | `adjuntos` | Zona arrastrar-y-soltar + botón [Seleccionar archivos] | No | Tipos permitidos y tamaño máximo configurables en 1.8.3 (valor de fábrica: 25 MB por archivo, 10 archivos; bloquear ejecutables). Muestra nombre, tamaño, barra de progreso y [Quitar]. |

**Campos automáticos (no editables; se muestran en un panel lateral "Datos del registro")**
`id` (formato `PRB-000001`, secuencia sin saltos), `registrado_por`, `fecha_registro`, `estado` inicial = *Nuevo*, `origen_canal` (manual / desde incidente / regla automática).

### 4.2 Botones del formulario
- **[Registrar problema]** (primario): valida, crea el ticket, muestra toast "Problema PRB-xxxxxx registrado" y redirige a la vista del ticket.
- **[Registrar y crear otro]**: igual, pero limpia el formulario conservando la plantilla.
- **[Guardar como borrador]**: guarda sin validar obligatorios; el borrador solo lo ve su autor en "Mis borradores" y caduca a los 30 días (configurable en 1.8.3).
- **[Cancelar]**: pide confirmación si hay datos.

### 4.3 Validaciones al registrar
- Todos los obligatorios completos; los errores se listan arriba y se enfoca el primero.
- Si hay problema abierto con el mismo título normalizado y el mismo servicio, mostrar advertencia no bloqueante "Posible duplicado: PRB-xxxxxx" con [Ver] [Registrar de todos modos].
- Ningún incidente puede estar vinculado a otro problema abierto, salvo que la configuración 1.3.4.3.2 lo permita.

---

## 5. ESPECIFICACIÓN DEL TICKET DE PROBLEMA YA CREADO (lo que ve el usuario)

**Ruta:** `4 Gestión de Problemas > 4.1 Registro de problemas > (fila) PRB-xxxxxx`.
**Layout:** cabecera fija arriba + barra de acciones + pestañas a la izquierda/arriba + panel lateral derecho de resumen.

### 5.1 Cabecera fija
Muestra siempre: **ID**, **título**, **insignia de estado** (con color), **insignia de prioridad**, **responsable** (avatar + nombre, clic para reasignar si hay permiso), **grupo resolutor**, **fecha de registro**, **tiempo abierto** (ej. "3 d 4 h", se detiene al cerrar), **indicadores de objetivos de tiempo** (dos medidores: "Diagnóstico" y "Resolución", con porcentaje consumido y color verde/ámbar/rojo/en pausa), y las **etiquetas**: `Problema mayor`, `Error conocido`, `Reabierto`, `Con RFC pendiente` cuando apliquen.

### 5.2 Barra de acciones
Los botones se generan **dinámicamente** desde las transiciones configuradas en 1.3.4.2.2 para el estado actual y el perfil del usuario (ej. [Iniciar análisis], [Registrar causa raíz], [Publicar error conocido], [Solicitar cambio], [Resolver], [Cerrar], [Poner en espera], [Cancelar]). Siempre presentes, según permisos: **[Reasignar]**, **[Editar]**, **[Vincular incidente]**, **[Crear RFC]**, **[Añadir tarea]**, **[Seguir/Dejar de seguir]**, menú **[⋯]** con *Imprimir/PDF*, *Copiar enlace*, *Duplicar como nuevo*. Si el usuario no tiene permiso o faltan requisitos, el botón se muestra deshabilitado con tooltip que explica el motivo.

### 5.3 Panel lateral derecho (resumen)
Solicitante/registrado por · Servicio · Categoría · Impacto/Urgencia · Origen · Nº de incidentes vinculados · Nº de CI afectados · RFC asociada (ID + estado) · Error conocido (ID + estado) · Seguidores · Próximo vencimiento (fecha-hora y qué objetivo).

### 5.4 Pestañas

**5.4.1 Detalle**
Descripción / síntomas (texto enriquecido), origen, categoría y subcategoría, servicio, impacto, urgencia, prioridad (y, si fue manual, la justificación), campos personalizados, adjuntos (lista con nombre, tamaño, autor, fecha, [Descargar], [Vista previa], [Eliminar] con permiso). Botón **[Editar]** habilita edición en línea por sección con [Guardar] / [Cancelar].

**5.4.2 Incidentes relacionados**
Contador total y desglose por estado (abiertos / resueltos / cerrados). Tabla: ID, título, estado, prioridad, servicio, CI, fecha de apertura, tipo de vínculo, vinculado por/fecha. Botones: **[Vincular incidente]** (modal de búsqueda con selección múltiple), **[Desvincular]** (motivo obligatorio), exportar CSV. Mini-gráfico de **incidentes por semana** para ver tendencia.

**5.4.3 Investigación y causa raíz**
Campos: *Método de análisis* (lista), *Resumen del análisis* (texto enriquecido), *Causa raíz* (texto enriquecido), *Categoría de causa raíz* (lista), *Fecha-hora de identificación* (automática al registrar, editable con motivo), *Identificada por*, *Evidencias* (adjuntos), *Diagrama* (adjunto o editor simple de 5 porqués: 5 filas "¿Por qué?" encadenadas). Historial de versiones de la causa raíz (cada edición queda registrada). Botón **[Registrar causa raíz]** (transición).

**5.4.4 Workaround**
Campos: descripción paso a paso, alcance ("aplica a"), limitaciones, esfuerzo/tiempo de aplicación, fecha de publicación, publicado por, estado (*Vigente* / *Retirado*), contador "Aplicado en N incidentes". Botones **[Publicar workaround]**, **[Retirar workaround]** (motivo).

**5.4.5 Error conocido**
Si existe registro en KEDB: ID `KE-xxxxxx`, estado, audiencia, fecha de publicación, próxima revisión, enlace [Abrir en KEDB]. Si no existe: mensaje "Aún no es un error conocido" y botón **[Promover a error conocido]** (valida los requisitos de 1.3.4.3.3 y lista los que faltan).

**5.4.6 Solución permanente**
Descripción de la solución propuesta, responsable, fecha estimada, esfuerzo y costo estimado (opcionales), **RFC asociadas** (tabla: ID, tipo, estado, ventana, resultado) con botones **[Crear RFC desde este problema]** y **[Vincular RFC existente]**, y el campo *Decisión*: "Resolver con cambio" / "Resolver sin cambio" / "Aceptar riesgo (no resolver)" (esta última exige justificación y aprobación según 1.3.4.2.2).

**5.4.7 Activos / CI afectados**
Tabla: código, nombre, clase, criticidad, entorno, servicio que soporta, origen del vínculo (manual / heredado de incidente). Botones **[Agregar CI]**, **[Quitar]**, **[Ver en mapa CMDB]** (abre 7.2 filtrado por el CI). Resalta CI de criticidad alta.

**5.4.8 Tareas**
Lista con: título, tipo, responsable, grupo, fecha de vencimiento, estado (Pendiente / En curso / Hecha / Cancelada), obligatoria (sí/no), % de avance de checklist. Botones **[Añadir tarea]**, **[Aplicar paquete de tareas]**, marcar hecha, reasignar. Las tareas obligatorias pendientes bloquean las transiciones que las requieran (ver 1.3.4.2.7).

**5.4.9 Comentarios y bitácora**
Línea de tiempo unificada con filtros: *Todo* · *Comentarios internos* · *Comentarios públicos* · *Cambios de estado* · *Sistema*. Editor con menciones `@usuario`, adjuntos, y selector **Visibilidad: Interno / Visible para solicitantes de los incidentes vinculados**. Cada entrada: autor, fecha-hora, tipo. Los comentarios no se borran; se pueden **anular** con motivo (queda marca "anulado").

**5.4.10 Conocimiento**
Lista de artículos vinculados (ID, título, tipo, estado, autor, revisor, última revisión), botón **[Generar borrador de artículo]** (usa la plantilla de 1.3.4.3.5) y **[Vincular artículo existente]**.

**5.4.11 Cierre**
Visible desde el estado *Resuelto*. Campos: código de cierre, resumen de cierre, fecha-hora de resolución y de cierre, solución aplicada, confirmación de acciones sobre incidentes vinculados, **Revisión del problema** (lecciones aprendidas, qué funcionó, qué mejorar, acciones preventivas con responsable y fecha; obligatoria si es problema mayor), aprobación de cierre (si aplica).

**5.4.12 Historial / auditoría**
Tabla inmutable: fecha-hora, usuario, acción, campo, valor anterior, valor nuevo, comentario. Filtros por usuario, tipo de acción y rango de fechas. Botón **[Exportar CSV]**.

### 5.5 Reglas de visibilidad por estado
Cada pestaña tiene configuración de "visible desde el estado X" y "editable en los estados Y" (ver 1.3.4.1.6). Valores de fábrica: *Cierre* visible desde *Resuelto*; *Error conocido* y *Solución permanente* visibles siempre; ningún campo de investigación editable en estados finales.

---

## 6. PANTALLA 1.3.4.1 — CONFIGURACIÓN DE FORMULARIO

**Propósito:** que el administrador controle qué se captura al registrar un problema, qué se muestra en el ticket y con qué catálogos y reglas, sin tocar código (ITIL 4: *start where you are*, *keep it simple*).
**Pestañas:** 1.3.4.1.1 a 1.3.4.1.6. Todas siguen el patrón de la sección 3.

**Reutilización obligatoria:** la configuración de formulario de Incidentes (1.3.1.1) ya permite configurar campos y tiene un creador de campos. Esta pantalla debe construirse **extendiendo ese mismo editor** para que soporte la entidad `problema` (y, más adelante, `cambio` y `activo`), no copiándolo. Lo que ese editor ya haga igual a lo descrito aquí no se reimplementa; lo que falte (reglas condicionales, versionado de borrador/publicación, bloqueo concurrente, etc.) se agrega al componente compartido de modo que Incidentes también pueda aprovecharlo, **sin cambiar el comportamiento actual de Incidentes**.

---

### 6.1 Pestaña 1.3.4.1.1 — Campos (visibles, obligatorios y orden)

**Qué se configura:** para cada campo del formulario de registro (sección 4): si es visible, si es obligatorio, en qué sección y posición va, cuánto ancho ocupa, para qué perfiles aplica, y qué reglas condicionales lo gobiernan.

**Selector superior:** `Formulario: [Registro de problema ▾]`. Opciones: *Registro de problema* (alta) y *Edición de problema* (campos editables dentro del ticket). Cada uno se configura por separado, con botón **[Copiar configuración del otro formulario]**.

**Layout de tres columnas:**

| Columna | Contenido |
|---|---|
| **Izquierda — Biblioteca de campos** (ancho 280 px) | Buscador. Grupos plegables: *Campos estándar*, *Campos personalizados*, *Campos del sistema* (solo informativos). Un campo ya colocado en el lienzo aparece en gris con ✓. Los ocultos aparecen con ícono de ojo tachado. Clic en un campo no colocado → botón [Agregar al formulario]. |
| **Centro — Lienzo** | Secciones como tarjetas plegables (A. Identificación, B. Alcance, …). Cada fila de campo muestra: asa de arrastre `⋮⋮`, etiqueta, código en gris, chip de tipo, **interruptor Visible**, **interruptor Obligatorio**, ícono 🔒 si es campo bloqueado, ícono ⚙ (abre propiedades), ícono ⎘ duplicar (solo personalizados), ícono 🗑 (solo personalizados). |
| **Derecha — Propiedades del campo** (ancho 360 px) | Se llena al seleccionar una fila (ver tabla de propiedades). |

**Barra de herramientas del lienzo:** `[+ Agregar sección]` `[Expandir todo]` `[Contraer todo]` `[Mostrar solo obligatorios]` `[Mostrar solo ocultos]` y un contador "N campos visibles · M obligatorios".

**Acciones sobre secciones:** renombrar (clic en el título), cambiar color/ícono, mover con arrastre o ↑↓, **ocultar sección** (oculta todos sus campos), eliminar (solo si está vacía; si no, mover campos primero), definir **visible para perfiles**.

**Propiedades de un campo (panel derecho):**

| Propiedad | Control | Detalle |
|---|---|---|
| Código interno | Texto de solo lectura | No cambia nunca. |
| Etiqueta | Texto, 3–60 caracteres | Lo que ve el usuario. |
| Texto de ayuda | Texto, hasta 250 caracteres | Se muestra como ícono ⓘ con tooltip. |
| Marcador (placeholder) | Texto, hasta 80 caracteres | Solo para controles de texto. |
| Tipo de control | Solo lectura en estándar | En personalizados se define al crearlos. |
| Visible | Interruptor | Si se apaga, el campo se oculta en el formulario (los datos se conservan). |
| Obligatorio | Selector de 3 opciones: **Siempre** / **Condicional (definir regla)** / **No** | "Condicional" abre el constructor de reglas. La obligatoriedad *por transición* se configura en 1.3.4.2.2, no aquí. |
| Solo lectura | Interruptor | Requiere valor por defecto o regla de cálculo; si no, no se puede activar. |
| Valor por defecto | Control del mismo tipo del campo | Opcional. Admite variables: `{usuario_actual}`, `{fecha_actual}`, `{grupo_del_usuario}`. |
| Sección | Lista | Mueve el campo a otra sección. |
| Ancho | Selector: 1/3 · 1/2 · 2/3 · completo | |
| Visible para perfiles | Selector múltiple de perfiles (1.1.2) | Vacío = todos. |
| Editable por perfiles | Selector múltiple | Vacío = todos los que ven el campo. |
| Validaciones | Según tipo: mín./máx. de longitud, rango numérico, expresión regular (con mensaje de error propio, y botón [Probar expresión] que acepta un texto de prueba) | |
| Reglas condicionales | Constructor (ver abajo) | |

**Constructor de reglas condicionales:**
- Estructura: `CUANDO [campo] [operador] [valor] (Y/O …) ENTONCES [acción]`.
- Hasta **5 condiciones** por regla y **10 reglas** por campo.
- Operadores: *es igual a*, *es distinto de*, *está vacío*, *no está vacío*, *contiene*, *es uno de*, *mayor que*, *menor que*.
- Acciones: *Mostrar*, *Ocultar*, *Hacer obligatorio*, *Hacer opcional*, *Hacer solo lectura*, *Filtrar opciones a [lista de valores]*, *Establecer valor [x]*.
- Botón **[Probar regla]**: panel con los campos involucrados donde el admin ingresa valores y ve el resultado.
- Detección de **ciclos** (A depende de B y B de A) → error "Regla circular" y se bloquea el guardado.
- Reglas de fábrica: (1) `Origen = Incidente(s)` → *Incidentes relacionados* visible y obligatorio; en otro caso, opcional. (2) `Workaround no está vacío` → mostrar casilla "Publicar como error conocido".

**Campos bloqueados (🔒):** *Título*, *Descripción*, *Servicio afectado*, *Impacto*, *Urgencia* **no se pueden ocultar ni hacer opcionales** (son el mínimo exigido para registrar y priorizar según ITIL/ISO 20000). Sí se pueden renombrar, moverse y cambiar su texto de ayuda. Los campos del sistema (ID, fechas, estado, registrado por) se muestran en gris y no son editables.

**Reordenamiento:**
- Arrastrar fila (asa `⋮⋮`) dentro de la sección o entre secciones; indicador azul de dónde caerá.
- Alternativa por teclado: seleccionar fila + `Alt+↑` / `Alt+↓`; para cambiar de sección `Alt+←` / `Alt+→`.
- El orden se guarda como entero consecutivo por sección y define también el orden de tabulación.
- Botón **[Ordenar sección alfabéticamente]** (con confirmación).

**Reglas de consistencia (se validan al guardar borrador y al publicar):**
1. Un campo oculto no puede ser obligatorio (se muestra error en la fila).
2. Un campo obligatorio no puede tener ancho "1/3" si su etiqueta supera 30 caracteres (aviso, no bloqueo).
3. Si un campo A es *Obligatorio condicional* según B, B debe ser visible.
4. El formulario debe tener al menos 1 sección y 5 campos visibles.
5. No pueden quedar campos huérfanos (sin sección).
6. Máximo 40 campos visibles por formulario (aviso de usabilidad al superarse, no bloqueo).

**Mensajes de ejemplo:**
- `Error: "Servicio afectado" es un campo bloqueado y no puede ocultarse.`
- `Error: El campo "Incidentes relacionados" está oculto pero tiene regla que lo hace obligatorio.`
- `Aviso: 3 campos obligatorios nuevos no tienen valor en 128 tickets abiertos; solo se exigirán al editarlos.`

---

### 6.2 Pestaña 1.3.4.1.2 — Campos personalizados

**Qué se configura:** campos adicionales propios de la organización que no existen de fábrica (ejemplos: "Número de contrato del proveedor", "Costo estimado de la solución", "Referencia del ticket del proveedor").

**Reutilización obligatoria:** ya existe un creador de campos personalizados. Debe usarse el mismo componente y la misma tabla de definición de campos, agregando la entidad `problema` como destino. Si el creador existente ya cubre alguno de los tipos o propiedades de este asistente, se conserva su comportamiento; se agregan solo los que falten.

**Vista de lista (tabla):** Nombre · Código · Tipo · Estado (Activo/Inactivo) · Usado en N tickets · Aparece en (formularios/vista) · Creado por · Fecha. Búsqueda, filtro por tipo y estado, orden por columna. Límite de fábrica: **30 campos personalizados** (configurable por el admin hasta 60; mostrar contador "12 / 30").

**Botones de la tabla:** `[+ Nuevo campo personalizado]` · por fila: `[Editar]` `[Duplicar]` `[Desactivar/Activar]` `[Eliminar]`.
- **Eliminar** solo está disponible si el campo tiene **0 usos**; si tiene usos, solo [Desactivar] (el dato se conserva).
- **Desactivar** quita el campo de formularios y vista pero conserva los datos.

**Asistente "Nuevo campo personalizado" (5 pasos, botones [Atrás] [Siguiente] [Cancelar]; en el último [Crear campo]):**

1. **Tipo:** Texto corto · Texto largo · Número entero · Número decimal · Fecha · Fecha y hora · Sí/No · Lista desplegable (una opción) · Selección múltiple · Casillas · Usuario · URL · Archivo · Referencia a CI · Referencia a ticket (incidente/problema/RFC).
2. **Identificación:** Etiqueta (3–60), Código (se sugiere a partir de la etiqueta, prefijo automático `cf_`, único, inmutable), Texto de ayuda.
3. **Propiedades según tipo:**
   - Texto: longitud mín./máx., expresión regular y mensaje.
   - Número: mín., máx., decimales, unidad (ej. USD, h, %).
   - Listas/selección: editor de opciones (valor, etiqueta, color, orden, activo), opción de "Permitir otro valor", valor por defecto.
   - Fecha: permitir pasadas/futuras, rango, valor por defecto (`hoy`).
   - Archivo: tipos y tamaño máximo (no superior al límite global de 1.8.3).
   - Referencia a CI: clases permitidas.
4. **Ubicación y comportamiento:** formulario(s) donde aparece (Registro / Edición), sección, obligatorio (sí/no/condicional), pestaña de la vista del ticket donde se muestra, visible/editable por perfiles, **Incluir en búsqueda**, **Incluir en reportes y filtros** (se expone a 2.1 y 2.2), **Incluir en auditoría** (siempre activado, no se puede desmarcar).
5. **Resumen:** vista previa del control tal como lo verá el usuario + resumen de propiedades. Botón **[Crear campo]**.

**Reglas:** el tipo **no se puede cambiar** una vez creado el campo (se debe crear otro y migrar). Las opciones de una lista en uso solo se desactivan. Los cambios de etiqueta, ayuda, color y orden de opciones sí son libres.

---

### 6.3 Pestaña 1.3.4.1.3 — Listas y catálogos

**Qué se configura:** los valores de todas las listas desplegables del módulo de problemas.

**Layout:** a la izquierda, lista de catálogos; a la derecha, la tabla del catálogo seleccionado.

**Catálogos:**

| Catálogo | Estructura | Atributos propios de cada valor (además de los comunes) |
|---|---|---|
| **Categorías de problema** | Árbol de 2 niveles (categoría → subcategoría) | Grupo resolutor por defecto · Responsable por defecto (opcional) · Servicio asociado (opcional) · Plantilla por defecto. Alimenta la asignación automática. |
| **Orígenes** | Lista plana | Requiere incidentes vinculados (sí/no) · ¿Es origen proactivo? (sí/no, para el KPI de gestión proactiva). |
| **Categorías de causa raíz** | Lista plana | ¿Sugiere abrir un cambio? (sí/no) · Descripción de ejemplo. |
| **Códigos de cierre** | Lista plana | Requiere solución permanente vinculada (sí/no) · Requiere RFC cerrada con éxito (sí/no) · Requiere error conocido vigente (sí/no) · Cuenta como "resuelto con éxito" en KPI (sí/no) · Requiere aprobación de supervisor (sí/no). |
| **Métodos de análisis** | Lista plana | Plantilla de ayuda (texto que se precarga en "Resumen del análisis"). |
| **Motivos de espera** | Lista plana | ¿Pausa el reloj de resolución? (sí/no) · Requiere fecha de reanudación (sí/no). |
| **Motivos de cancelación** | Lista plana | Requiere aprobación (sí/no). |

**Atributos comunes de cada valor:** Orden · Código (inmutable) · Nombre · Descripción · Color (selector hex con paleta de 12 colores accesibles) · Activo (interruptor) · Sistema (🔒, valor de fábrica) · Usos (nº de tickets que lo usan, clic abre la lista).

**Botones:** `[+ Nuevo valor]` (en categorías: `[+ Nueva categoría]` y `[+ Subcategoría]`) · por fila `[Editar]` `[Activar/Desactivar]` `[Eliminar]` · `[Reordenar]` (modo arrastre con botones [Guardar orden] [Cancelar]) · `[Importar CSV]` (plantilla descargable; muestra vista previa con errores por fila antes de confirmar) · `[Exportar CSV]` · `[Fusionar…]` (elige valor origen y destino; reasigna todos los tickets y desactiva el origen; pide confirmación con el número de tickets afectados).

**Reglas:**
- Los valores 🔒 **se pueden renombrar y recolorear, pero no eliminar ni desactivar** (los usa la lógica del sistema; ej. el origen "Incidente(s)").
- Valor en uso → no eliminable, solo desactivable. Un valor inactivo no aparece en formularios nuevos pero sí se muestra en tickets antiguos.
- El nombre debe ser único dentro de su nivel; el código, único en el catálogo.
- Cada catálogo debe conservar al menos 1 valor activo.
- Categorías: máximo 2 niveles; no se puede eliminar una categoría con subcategorías.
- Para **Códigos de cierre**: no se permite que "Requiere RFC cerrada con éxito" y "Cuenta como resuelto con éxito = no" coexistan con "Requiere solución permanente = no" (incoherente; mostrar error).

---

### 6.4 Pestaña 1.3.4.1.4 — Matriz de prioridad (compartida con Incidentes)

**Hecho confirmado:** el sistema **ya tiene** una matriz impacto × urgencia → prioridad (P1 Crítica, P2 Alta, P3 Media, P4 Baja) que se usa al crear incidentes. Los niveles de impacto y de urgencia son **Alta / Media / Baja**. No se sabe en qué parte del código vive: en la **Etapa 0** debes localizarla (tabla, constante o función) y documentar cómo se consume. **Prohibido crear una segunda matriz paralela como comportamiento por defecto.**

**Qué hace esta pestaña:**

1. **Matriz vigente (solo lectura por defecto):** cuadrícula impacto × urgencia con la prioridad de cada celda y sus colores, rotulada "Matriz compartida con Incidentes". Debajo, tabla de prioridades (código, nombre, color) tal como están definidas hoy.
2. **Enlace `[Editar matriz compartida →]`:** lleva a la pantalla donde hoy se edita esa matriz. Si hoy la matriz está fija en código y no tiene pantalla de edición, repórtalo en el informe de la Etapa 0 y propón migrarla a una tabla de base de datos con su pantalla; **no lo implementes sin mi aprobación**.
3. **Interruptor `Usar matriz propia para problemas`** (apagado por defecto). Al encenderlo, un modal pide confirmación ("Los problemas dejarán de usar la matriz de Incidentes"), copia la matriz actual como punto de partida y habilita la edición de la cuadrícula solo para problemas. Si se apaga de nuevo, vuelve a leerse la matriz compartida (la matriz propia se conserva como borrador archivado).
4. **Textos de ayuda por nivel (tooltips):** tabla editable con los textos que se muestran al elegir Impacto y Urgencia en el formulario de problemas (ej. "Alta: afecta a un servicio crítico o a más de 100 usuarios"). Cambiar estos textos **no altera** los niveles ni la matriz.
5. **Opciones propias del módulo:**
   - `Permitir prioridad manual` (interruptor) → define **perfiles autorizados** y exige justificación (mín. 15 caracteres) que queda en la bitácora.
   - `Recalcular prioridad cuando cambie impacto o urgencia` (interruptor, activo por defecto).
6. **Botones:** `[Simulador]` (elige impacto y urgencia y muestra la prioridad resultante con la matriz que realmente aplica a problemas) · `[Ver dónde se usa]` (lista de procesos y pantallas que consumen la matriz) · patrón común. **No hay botón "Restaurar valores de fábrica" para la matriz compartida**; con matriz propia activa, `[Restaurar a la matriz compartida]`.

**Reglas:**
- Con matriz propia activa, todas las celdas deben tener prioridad y toda prioridad debe aparecer al menos una vez; si no, no se puede publicar.
- Si se publica un cambio de matriz propia y hay problemas abiertos, el modal ofrece la casilla **"Recalcular prioridad de los N problemas abiertos"** (ejecución asíncrona con barra de progreso; las prioridades manuales **no** se tocan).
- Los cambios en la matriz **compartida** se hacen en su pantalla original; al publicarse, los problemas con matriz compartida los toman sin migración.
- Los nombres de prioridad (P1 Crítica, P2 Alta, P3 Media, P4 Baja) y sus colores se leen siempre de la tabla de prioridades existente.

---

### 6.5 Pestaña 1.3.4.1.5 — Plantillas de problema

**Qué se configura:** plantillas que prellenan el formulario de registro y crean tareas automáticamente (ITIL 4: *optimize and automate*).

**Lista:** Nombre · Descripción · Activa · Se aplica a (categoría) · Visible para (perfiles) · Veces usada · Última modificación. Botones: `[+ Nueva plantilla]` · por fila `[Editar]` `[Duplicar]` `[Activar/Desactivar]` `[Eliminar]` (solo si nunca se usó; si no, desactivar).

**Editor de plantilla (pantalla completa con pestañas internas):**
1. **General:** Nombre (único, 5–80), Descripción, Activa, Categoría a la que se sugiere (opcional), Visible para perfiles.
2. **Valores prellenados:** reproduce el formulario de la sección 4 con cada campo editable y, junto a cada uno, un interruptor **"Bloquear para que el usuario no lo cambie"**. Solo se prellenan campos visibles en el formulario vigente.
3. **Tareas incluidas:** selector múltiple tomado del catálogo de tareas (1.3.4.2.7) o paquete completo, con orden y offset de vencimiento.
4. **Vista previa:** muestra el formulario ya con la plantilla aplicada.

**Comportamiento en el formulario de registro:** al elegir plantilla, los campos se llenan; si el usuario ya había escrito algo, se pregunta "¿Reemplazar los valores existentes? [Reemplazar] [Mantener los míos]".

**Plantillas de fábrica:** ver sección 10.

---

### 6.6 Pestaña 1.3.4.1.6 — Vista del ticket

**Qué se configura:** qué pestañas, secciones y campos se muestran en el ticket de problema ya creado (sección 5), en qué estados y para quién.

**Bloque 1 — Cabecera (hasta 8 elementos):** lista ordenable de los elementos de la cabecera (sección 5.1). Cada elemento: nombre, visible, orden. Los elementos ID, título, estado y prioridad son fijos.

**Bloque 2 — Pestañas:** tabla con una fila por pestaña de la sección 5.4:

| Columna | Control |
|---|---|
| Orden | Arrastrar / ↑↓ |
| Pestaña | Nombre editable (3–30 caracteres) |
| Visible | Interruptor |
| Visible para perfiles | Selector múltiple |
| Visible desde el estado | Lista de estados (o "Siempre") |
| Editable en estados | Selector múltiple de estados |
| Campos de la pestaña | Botón **[Configurar campos…]** (abre panel con la lista de campos de esa pestaña: visible, orden, etiqueta, solo lectura) |

Las pestañas **Detalle**, **Comentarios y bitácora** e **Historial / auditoría** no pueden ocultarse. La pestaña **Historial / auditoría** solo puede mostrarse a perfiles con permiso `problemas.auditoria.ver`.

**Bloque 3 — Panel lateral:** lista de elementos del resumen (sección 5.3) con visible y orden.

**Bloque 4 — Barra de acciones:** orden de los botones fijos y qué botones van directamente y cuáles bajo el menú [⋯] (arrastrar entre dos listas: "Visibles" y "En menú ⋯"). Los botones de transición se gestionan en 1.3.4.2.2.

**Botones adicionales:** `[Vista previa con ticket real]` (selector de un problema existente para ver cómo se vería) · `[Vista previa con ejemplo]`.

---

## 7. PANTALLA 1.3.4.2 — FLUJO DE INVESTIGACIÓN Y SEGUIMIENTO

**Propósito:** definir el ciclo de vida del problema (ITIL 4: identificación → control del problema → control de errores) y las reglas que lo gobiernan.

### 7.1 Pestaña 1.3.4.2.1 — Estados

**Qué se configura:** los estados que puede tener un problema y cómo afectan a los relojes de tiempo.

**Tabla de estados (ordenable):**

| Columna | Detalle |
|---|---|
| Orden | Define el orden de aparición en filtros y selectores. |
| Nombre | Único, 3–30 caracteres. |
| Código | Inmutable. |
| Tipo | **Inicial** (exactamente 1) · **En curso** · **En pausa** · **Resuelto** · **Final**. |
| Color | Para insignias. |
| Reloj "Diagnóstico" | Corre / Pausado / Detenido. |
| Reloj "Resolución" | Corre / Pausado / Detenido. |
| ¿Cuenta como abierto? | Sí/No (afecta contadores y filtros). |
| ¿Permite edición? | Sí / Solo comentarios / No. |
| Descripción | Texto corto que aparece como tooltip. |
| Sistema (🔒) | Estados de fábrica requeridos por la lógica. |
| Activo | Interruptor. |

**Botones:** `[+ Nuevo estado]` · por fila `[Editar]` `[Activar/Desactivar]` `[Eliminar]` · `[Reordenar]` · patrón común.

**Reglas:**
- Debe existir exactamente **1 estado Inicial**, al menos **1 Resuelto** y **1 Final**.
- Los estados 🔒 (*Nuevo*, *Resuelto*, *Cerrado*, *Cancelado*) no se eliminan ni se cambian de tipo; sí se pueden renombrar y recolorear.
- No se puede eliminar un estado con tickets (ver 3.4).
- *Error conocido* no es 🔒, pero si se desactiva, la promoción a KEDB sigue funcionando pero ya no cambia el estado del problema (solo activa la etiqueta).

**Estados de fábrica** (ver tabla en sección 10).

### 7.2 Pestaña 1.3.4.2.2 — Transiciones y acciones

**Qué se configura:** de qué estado a cuál se puede pasar, con qué botón, quién puede, qué se exige y qué ocurre automáticamente.

**Dos vistas (conmutador arriba):**
1. **Matriz:** filas = estado origen, columnas = estado destino. Celdas con ✓ si existe transición; clic en la celda crea/edita. Celdas diagonales bloqueadas.
2. **Diagrama:** grafo generado automáticamente (solo lectura, con zoom y botón [Exportar PNG]). Estados como nodos con su color; transiciones como flechas con el nombre de la acción.

**Lista de transiciones (debajo):** Nombre de la acción · Origen → Destino · Roles · Campos requeridos · Automatizaciones · Activa. Botones `[+ Nueva transición]` `[Editar]` `[Duplicar]` `[Desactivar]` `[Eliminar]`.

**Editor de transición (modal grande o panel lateral):**

| Propiedad | Control | Detalle |
|---|---|---|
| Nombre de la acción | Texto (3–30) | Texto del botón en el ticket (ej. "Iniciar análisis"). |
| Estado(s) de origen | Selector múltiple | Permite una misma acción desde varios estados. |
| Estado de destino | Lista (uno) | |
| Perfiles autorizados | Selector múltiple (1.1.2) | Además: casillas "Responsable del ticket", "Miembros del grupo resolutor", "Supervisor del grupo". |
| Condiciones previas | Constructor de reglas (igual al de 6.1) | Ej.: "no hay tareas obligatorias pendientes". Si no se cumplen, el botón se deshabilita y el tooltip muestra el motivo. |
| Campos obligatorios en esta transición | Selector múltiple de campos y bloques (causa raíz, workaround, solución permanente, RFC vinculada, código de cierre, etc.) | Al ejecutar, se abre un modal con solo esos campos para completar. |
| Comentario | Ninguno / Opcional / Obligatorio + visibilidad (interno/público) | |
| Confirmación | Interruptor + texto del mensaje | Modal "¿Seguro…?" [Confirmar] [Cancelar]. |
| Requiere aprobación | Interruptor + aprobador (rol/usuario/supervisor del grupo) + plazo | El ticket queda "Pendiente de aprobación" hasta que se aprueba o rechaza (con motivo). |
| Apariencia del botón | Color, ícono, orden | |
| Automatizaciones al ejecutar | Lista ordenable (ver abajo) | |
| Activa | Interruptor | |

**Automatizaciones disponibles:** asignar responsable (aplica reglas de 1.3.4.2.3) · notificar (selecciona evento/plantilla de 1.6.1 y destinatarios) · crear tareas (paquete) · registrar fecha-hora en un campo · crear registro KEDB · crear RFC prellenada · actualizar incidentes vinculados (según 1.3.4.3.2) · generar borrador de artículo (1.3.4.3.5) · detener/pausar/reanudar relojes · incrementar contador · marcar etiqueta.

**Reglas de validación del flujo (se ejecutan antes de publicar; si fallan, se lista cada error con enlace):**
1. Todo estado no final tiene al menos 1 transición de salida.
2. Todos los estados son alcanzables desde el inicial.
3. Desde todo estado existe un camino a un estado final.
4. No hay dos transiciones con el mismo origen, destino y rol sin condiciones diferenciadoras.
5. Toda transición hacia *Cancelado* exige motivo.
6. Toda transición hacia *Cerrado* exige código de cierre y resumen.

**Transiciones de fábrica:**

| Acción | Origen → Destino | Roles | Requisitos y automatizaciones |
|---|---|---|---|
| Iniciar análisis | Nuevo → En análisis | Gestor de Problemas, técnico del grupo | Exige responsable y grupo. Inicia reloj de diagnóstico si no corre. |
| Poner en espera | En análisis → En espera | Responsable | Exige motivo de espera y fecha de reanudación. Pausa relojes según el motivo. |
| Reanudar | En espera → En análisis | Responsable, supervisor | Reanuda relojes. También automática al llegar la fecha de reanudación. |
| Registrar causa raíz | En análisis → Causa raíz identificada | Responsable | Exige método, causa raíz, categoría de causa, fecha-hora. Detiene reloj de diagnóstico. |
| Publicar error conocido | En análisis / Causa raíz identificada → Error conocido | Responsable, Gestor de Problemas | Exige workaround. Crea registro KEDB en *Borrador* o *Publicado* según permiso. Genera borrador de artículo. Notifica a mesa de servicio. |
| Solicitar cambio | Causa raíz identificada / Error conocido → Pendiente de cambio | Responsable | Exige solución permanente descrita. Crea RFC prellenada o vincula una existente. |
| Resolver sin cambio | Causa raíz identificada / Error conocido → Resuelto | Responsable | Exige solución aplicada y decisión "Resolver sin cambio" o "Aceptar riesgo" (esta última requiere aprobación del supervisor). |
| Resolver (por RFC) | Pendiente de cambio → Resuelto | Automática cuando la RFC pasa a *Implementado/Cerrado con éxito*; manual como respaldo | Cumple las reglas de 1.3.4.3.4. |
| Devolver a análisis | Pendiente de cambio → En análisis | Automática si la RFC es rechazada, falla o se cancela; manual como respaldo | Crea tarea "Revisar solución alternativa". Notifica al responsable. |
| Cerrar | Resuelto → Cerrado | Responsable, Gestor de Problemas, supervisor | Exige código de cierre, resumen, revisión (si es mayor), confirmación de incidentes (1.3.4.3.2). También automática N días después de *Resuelto* (configurable, valor de fábrica 5 días). |
| Reabrir | Resuelto / Cerrado → En análisis | Según 1.3.4.2.6 | Exige motivo. |
| Cancelar | Cualquier estado abierto → Cancelado | Gestor de Problemas, supervisor | Exige motivo de cancelación. Si hay incidentes vinculados, se desvinculan o se mantienen según elección. |

### 7.3 Pestaña 1.3.4.2.3 — Asignación automática

**Qué se configura:** a qué grupo y técnico se asigna un problema al registrarse o al cambiar de estado.

**Lista de reglas (orden = prioridad, arrastrar para cambiar):** Orden · Nombre · Condiciones (resumen) · Acción (resumen) · Activa · Veces aplicada. Botones `[+ Nueva regla]` `[Editar]` `[Duplicar]` `[Activar/Desactivar]` `[Eliminar]`. Interruptor global **"Detener en la primera regla que coincida"** (activo por defecto).

**Editor de regla:**
- **Nombre**, **Activa**.
- **Cuándo se evalúa:** al registrar · al cambiar de categoría · al cambiar de prioridad · al entrar en un estado (selector).
- **Condiciones** (constructor): categoría/subcategoría, servicio, clase de CI, criticidad de CI, prioridad, origen, horario (dentro/fuera de horario laboral), etiqueta.
- **Acción — Grupo destino:** lista de grupos (1.4.2).
- **Acción — Estrategia dentro del grupo:** *Dejar sin responsable (bandeja del grupo)* · *Round-robin* · *Menor carga (menos tickets abiertos)* · *Por nivel de soporte mínimo* (selector de nivel 1.4.3) · *Técnico fijo* (selector).
- **Considerar disponibilidad:** interruptor. Omite a los técnicos con una **ausencia vigente** registrada en la tabla `tecnico_ausencias` (sección 12; hoy no existe ningún dato de turnos o ausencias, por lo que debe crearse junto con una sección mínima "Ausencias" en `1.4.3 Técnicos y niveles de soporte`: técnico, desde, hasta, motivo, con botones `[+ Registrar ausencia]` `[Editar]` `[Eliminar]`). No se modelan turnos en esta etapa.
- **Fallback:** grupo/técnico alternativo si no hay candidatos.
- **Notificar al asignar:** interruptor + plantilla.

**Panel "Simulador de asignación":** el admin ingresa categoría, servicio, prioridad y origen, y el sistema muestra la regla que coincide, el grupo y la estrategia.

**Regla de fábrica:** "Todos los problemas → grupo definido por la categoría; si no hay, grupo 'Gestión de Problemas'; sin responsable; notificar al grupo."

**Validación:** debe existir al menos una regla activa sin condiciones (regla comodín) al final de la lista, o el sistema avisa "Algunos problemas podrían quedar sin grupo".

### 7.4 Pestaña 1.3.4.2.4 — Objetivos de tiempo

**Contexto confirmado:** `1.2.4 Objetivos SLA` contiene hoy la **"Matriz Institucional de Tiempos por Prioridad"** con las columnas *Nivel · Prioridad · Primera Respuesta (Horas) · Resolución Total (Horas) · Equivalencia / Descripción Operativa* (P1 Crítica 1 h/4 h, P2 Alta 2 h/8 h, P3 Media 4 h/24 h, P4 Baja 8 h/72 h). El tiempo que aplica a un ticket lo determina su **prioridad**. Esta pestaña sigue exactamente esa lógica para problemas. **No modifiques la matriz de Incidentes y Solicitudes ni el SLA que cada servicio tenga configurado.**

**Qué se configura:** metas internas de tiempo (OLA) por prioridad para problemas. *Nota ITIL:* los problemas no suelen tener SLA con el cliente; son objetivos internos de gestión.

**Cuadrícula (filas = P1 Crítica, P2 Alta, P3 Media, P4 Baja; unidad única: horas):**

| Columna | Detalle |
|---|---|
| Nivel y Prioridad | De solo lectura, leídos de la tabla de prioridades existente. |
| Primera respuesta (horas) | Tiempo máximo hasta que el problema tiene responsable y entra en *En análisis*. |
| Diagnóstico (horas) | Tiempo máximo hasta registrar la causa raíz **o** publicar un workaround (lo primero que ocurra). |
| Resolución total (horas) | Tiempo máximo hasta *Resuelto*. |
| Equivalencia / descripción operativa | Texto editable propio de problemas (ej. "P1: problema que causa incidentes de interrupción total recurrentes"). |

**Cómputo del tiempo:** usa **la misma convención del motor de SLA ya implementado** (horas corridas u hábiles, la que esté en el código; verifícalo en la Etapa 0 y documéntalo en la pestaña como texto informativo). **No se crea un módulo de calendarios ni de feriados en este prompt.** Los relojes se pausan, corren o se detienen según la configuración de cada estado (7.1).

**Otras opciones:** umbrales de alerta (por defecto 50 %, 75 %, 90 %; hasta 5) y `[Vista previa de medidores]` (cómo se verán los dos medidores de la cabecera del ticket).
**Botones:** `[Restaurar valores sugeridos]` + patrón común.

**Valores sugeridos de fábrica (horas):**

| Prioridad | Primera respuesta | Diagnóstico | Resolución total |
|---|---|---|---|
| P1 Crítica | 4 | 72 | 240 |
| P2 Alta | 8 | 120 | 480 |
| P3 Media | 24 | 240 | 960 |
| P4 Baja | 72 | 480 | 1440 |

**Integración con 1.2.4:** debajo de la matriz existente de `1.2.4 Objetivos SLA`, agrega un **bloque de solo lectura "Objetivos internos de Problemas"** con estos mismos valores y un enlace `[Editar en Gestión de problemas →]` que apunta a esta pestaña. Fuente única de verdad: esta pestaña.

**Validaciones:** valores enteros > 0; Primera respuesta ≤ Diagnóstico ≤ Resolución total en cada fila; los valores no pueden disminuir al bajar de prioridad (P1 ≤ P2 ≤ P3 ≤ P4) en cada columna (aviso, no bloqueo).

### 7.5 Pestaña 1.3.4.2.5 — Escalamiento

**Qué se configura:** qué ocurre cuando un objetivo de tiempo se acerca o se vence.

**Lista de reglas:** Nombre · Objetivo (Asignación/Inicio/Diagnóstico/Resolución) · Prioridades · Umbral · Acciones · Activa.

**Editor de regla:**
- **Objetivo** al que aplica y **prioridades**.
- **Umbral:** porcentaje del tiempo consumido (50/75/90/100/…) o "Vencido +N horas".
- **Cómputo del tiempo:** el mismo del motor de SLA existente (no configurable aquí).
- **Acciones (una o varias):** notificar a (responsable, supervisor del grupo, Gestor de Problemas, grupo, usuario concreto, dirección TI) con plantilla · **escalamiento funcional** (reasignar a grupo/nivel superior) · **escalamiento jerárquico** (notificar al nivel jerárquico siguiente) · subir prioridad un nivel · agregar etiqueta `En riesgo`/`Vencido` · agregar comentario del sistema · crear tarea de seguimiento.
- **Repetición:** repetir cada N horas hasta M veces.
- **Se detiene cuando:** el ticket cambia de estado, el objetivo se cumple, o el reloj se pausa.

**Botón `[Simular escalamiento]`:** el admin elige prioridad y tiempo consumido y ve las acciones que se dispararían.
**Regla de fábrica:** 75 % → notificar al responsable; 90 % → notificar al supervisor; 100 % → etiqueta *Vencido* + notificar al Gestor de Problemas + dirección TI en P1/P2.

### 7.6 Pestaña 1.3.4.2.6 — Reapertura

**Qué se configura:** cuándo y cómo puede reabrirse un problema resuelto o cerrado.

**Controles:**
- `Permitir reapertura` (interruptor).
- **Ventana:** días desde *Resuelto* y desde *Cerrado* (valores de fábrica: 30 y 15).
- **Perfiles autorizados** por estado (resuelto / cerrado).
- **Estado destino** (por defecto *En análisis*).
- **Motivo obligatorio** (interruptor) y lista de motivos de reapertura (catálogo propio: "El incidente reaparece", "La solución no funcionó", "Cambio revertido", "Otro").
- **Máximo de reaperturas:** número (valor de fábrica 2). Al superarlo, el botón se reemplaza por **[Crear nuevo problema relacionado]**.
- **Relojes:** *Reiniciar* / *Continuar donde quedaron*.
- **Asignación:** *Mantener responsable* / *Aplicar reglas de asignación*.
- **Efecto en incidentes vinculados:** *Nada* / *Notificar a responsables*.
- **Marcar etiqueta `Reabierto` y contabilizar para KPI** (siempre activo).

### 7.7 Pestaña 1.3.4.2.7 — Tareas predefinidas

**Qué se configura:** catálogo de tareas de investigación y paquetes de tareas que se crean automáticamente.

**Sección A — Catálogo de tareas** (tabla): Nombre · Tipo (Investigación / Revisión de logs / Prueba en laboratorio / Contacto con proveedor / Documentación / Validación) · Grupo o rol responsable · Duración estimada · Obligatoria · Activa. Botones `[+ Nueva tarea]` `[Editar]` `[Duplicar]` `[Desactivar]` `[Eliminar]`.
Editor: Nombre · Descripción · Tipo · Responsable (rol, grupo, "responsable del problema") · Duración estimada · **Vence a +N horas/días desde la creación** · **Obligatoria** (sí/no) · **Bloquea la transición** (selector de transición; no se puede ejecutar mientras la tarea esté pendiente) · **Checklist** (lista de ítems) · **Dependencia** (finaliza-para-iniciar con otra tarea).

**Sección B — Paquetes de tareas** (tabla): Nombre · Tareas incluidas · Se aplica cuando (categoría, prioridad, plantilla, estado de entrada) · Activo. Editor: arrastrar tareas del catálogo, definir orden y dependencias, y la regla de aplicación automática. Botón `[Probar paquete]` muestra qué tareas se crearían para un caso de ejemplo.

**Paquetes de fábrica:** ver sección 10.

### 7.8 Pestaña 1.3.4.2.8 — Problemas mayores y revisión obligatoria

**Qué se configura:** cuándo un problema se considera mayor y qué revisión formal exige (ITIL 4: revisión post-problema y *continual improvement*).

**Criterios de problema mayor (constructor, cualquiera de ellos activa la marca; hasta 6 criterios):** prioridad ∈ [P1…] · nº de incidentes vinculados ≥ N · servicio con criticidad ≥ X · CI de criticidad alta afectado · duración acumulada de indisponibilidad ≥ N h · marcado manualmente por supervisor.

**Efectos de ser mayor (interruptores):**
- Aplicar paquete de tareas "Problema mayor".
- Exigir **revisión del problema** antes de cerrar (bloquea la transición *Cerrar*).
- **Plazo de la revisión:** N días después de *Resuelto* (valor de fábrica 10).
- **Participantes obligatorios** (roles).
- **Aprobación de cierre** por (perfil Supervisor o perfil Aprobador).
- Notificar a dirección TI al detectarlo y al cerrarlo.
- Generar informe automático (PDF) con cronología, causa raíz, impacto y acciones.

**Plantilla de revisión del problema (editable):** lista de preguntas/secciones con tipo (texto, sí/no, lista) y obligatoriedad. De fábrica: ¿Qué ocurrió y cuál fue el impacto? · Cronología · Causa raíz confirmada · ¿Qué funcionó bien? · ¿Qué debe mejorar? · Acciones preventivas (tabla: acción, responsable, fecha) · ¿Se actualizó la CMDB? · ¿Se publicó conocimiento? · Lecciones aprendidas.

**Botones:** `[+ Agregar criterio]` `[+ Agregar pregunta]` `[Probar criterios]` (aplica los criterios a los problemas existentes y muestra cuáles serían mayores) + patrón común.

---

## 8. PANTALLA 1.3.4.3 — RELACIÓN CON INCIDENTES, ERRORES CONOCIDOS Y CONOCIMIENTO

**Propósito:** integrar Gestión de Problemas con Incidentes, KEDB, Cambios, Conocimiento y CMDB (ITIL 4: *think and work holistically*).

### 8.1 Pestaña 1.3.4.3.1 — Creación automática de problemas por umbral

**Qué se configura:** reglas que detectan incidentes recurrentes y crean (o sugieren) problemas de forma proactiva.

**Lista de reglas:** Nombre · Agrupa por · Umbral y ventana · Acción · Activa · Última ejecución · Problemas generados. Botones `[+ Nueva regla]` `[Editar]` `[Duplicar]` `[Pausar/Activar]` `[Eliminar]` `[Ver ejecuciones]` (registro de cuándo se evaluó, qué grupos se detectaron y qué se hizo).

**Editor de regla:**
- **Alcance de incidentes:** estados incluidos (abiertos/resueltos/cerrados), prioridad mínima, servicios o categorías incluidos/excluidos.
- **Agrupar por:** Servicio · Categoría de incidente · CI · Clase de CI · Código de resolución · Texto similar (palabras clave; sensibilidad Baja/Media/Alta).
- **Umbral:** número de incidentes ≥ N, dentro de una **ventana móvil** de X horas/días.
- **Acción:** *Crear problema automáticamente* o *Solo sugerir* (notifica al Gestor de Problemas con botón [Crear problema] en la notificación).
- **Si crea:** plantilla a usar · prioridad (*máxima de los incidentes* o *fija*) · grupo (por regla de 1.3.4.2.3) · vincular todos los incidentes del grupo.
- **Evitar duplicados:** si ya hay un problema abierto con el mismo criterio de agrupación, **vincular los nuevos incidentes a ese problema** en lugar de crear otro (activo por defecto).
- **Enfriamiento:** no volver a disparar la misma regla para el mismo grupo durante N horas.
- **Notificaciones:** destinatarios y plantilla.

**Botón `[Simular regla]`:** analiza los últimos 30/60/90 días y muestra una tabla de los grupos de incidentes que habrían disparado la regla, cuántos problemas se habrían creado y cuáles ya existían. Es obligatorio simular antes de activar una regla nueva (el sistema avisa si no se hizo, no bloquea).

**Reglas de fábrica (inactivas hasta que el admin las active):**
1. ≥ 5 incidentes de la misma categoría **y** mismo CI en 7 días → crear problema.
2. ≥ 3 incidentes del mismo servicio en 24 h → sugerir.
3. Todo incidente marcado como mayor → crear problema obligatoriamente.

### 8.2 Pestaña 1.3.4.3.2 — Incidentes vinculados

**Qué se configura:** reglas de vinculación y qué ocurre con los incidentes al avanzar o cerrar el problema.

**Bloque 1 — Vinculación:**
- **Tipos de vínculo** (catálogo): *Causado por el problema*, *Relacionado*, *Posible causa* (editable).
- **Estados de incidente que pueden vincularse** (selector múltiple).
- **Máximo de incidentes por problema** (valor de fábrica 500).
- **¿Un incidente puede vincularse a más de un problema abierto?** (No por defecto).
- **Herencia al vincular:** copiar servicio / CI / categoría del incidente al problema si el campo está vacío (interruptores por campo).
- **Desvincular:** perfiles autorizados y motivo obligatorio.

**Bloque 2 — Visibilidad en el incidente:**
- Mostrar en el incidente un **banner** "Vinculado al problema PRB-xxxxxx" (interruptor).
- Mostrar el **workaround** vigente en el incidente (interruptor + si se muestra a la mesa de servicio, a técnicos y/o al solicitante).
- Sugerir el problema/error conocido al registrar un incidente nuevo (ver 8.3).

**Bloque 3 — Al llegar a *Error conocido*:**
- Acción sobre incidentes abiertos vinculados: *Agregar nota con el workaround* (activo) · *Notificar a los responsables* · *Nada*.

**Bloque 4 — Al llegar a *Resuelto* o *Cerrado*:** selector de política (una sola):
 - **A) No tocar los incidentes.**
 - **B) Resolución masiva automática:** resolver los incidentes abiertos vinculados con el **código de resolución** elegido (lista), nota estándar (editable con variables `{problema_id}`, `{solucion}`) y notificar a los solicitantes con la plantilla elegida.
 - **C) Resolución asistida (por defecto):** al cerrar el problema se muestra un modal con la lista de incidentes abiertos vinculados, casillas para elegir cuáles resolver, y botones [Resolver seleccionados] [Omitir].
- **Opción adicional:** *Exigir que ningún incidente abierto quede sin decisión para poder cerrar el problema* (activo por defecto).

**Botón `[Vista previa del texto de nota y notificación]`** + patrón común.

### 8.3 Pestaña 1.3.4.3.3 — Errores conocidos (KEDB)

**Qué se configura:** requisitos para registrar un error conocido, su ciclo de vida, quién lo ve y cómo se sugiere durante el registro de incidentes.

**Bloque 1 — Requisitos de promoción (casillas, todas configurables):** Workaround descrito (activo por defecto) · Síntomas descritos · Servicio y/o CI afectado · Causa raíz conocida (desactivado por defecto: ITIL admite error conocido con workaround aunque la causa no esté aclarada) · Instrucciones paso a paso · Aprobación del Gestor de Problemas (selector de perfil).

**Bloque 2 — Ciclo de vida del registro KE:**
- Estados: *Borrador* → *En revisión* → *Publicado* → *Retirado* (renombrables; los 4 son requeridos).
- **Publicación directa** permitida para perfiles (selector).
- **Revisión periódica:** cada N meses (valor de fábrica 6) con recordatorio X días antes al responsable; si no se revisa, pasa a *En revisión* automáticamente (interruptor).
- **Retiro automático** al cerrar el problema con código de cierre que implique solución permanente (interruptor).

**Bloque 3 — Audiencia (casillas):** Mesa de servicio · Técnicos de todos los grupos · Técnicos del grupo resolutor · Autoservicio (portal 1.1). Se puede definir audiencia distinta por categoría.

**Bloque 4 — Coincidencia en el registro de incidentes:**
- `Sugerir errores conocidos al registrar un incidente` (interruptor).
- **Criterios de coincidencia** (casillas con peso 1–5): servicio, categoría, CI, clase de CI, palabras clave del título, palabras clave de la descripción.
- **Umbral mínimo de coincidencia** (0–100 %) y **máximo de sugerencias** (valor de fábrica 5).
- **Contador de uso:** cada vez que un técnico aplica el workaround en un incidente, se incrementa "Aplicado en N incidentes" (visible en 5.4.4).
- Botón **`[Probar coincidencia]`**: el admin escribe un texto de incidente de ejemplo y ve qué errores conocidos se sugerirían y su puntaje.

**Bloque 5 — Campos del registro KE:** botón **[Configurar campos del KE…]** que abre el mismo editor de la pestaña 1.3.4.1.1 aplicado al formulario del error conocido (campos de fábrica: ID, título, síntomas, causa, workaround, solución definitiva, CI/servicios, audiencia, estado, responsable, próxima revisión, problema origen).

### 8.4 Pestaña 1.3.4.3.4 — Cambios (RFC)

**Qué se configura:** cómo se enlaza el problema con Gestión de Cambios (ITIL 4: *Change Enablement*).

**Controles:**
- `Exigir RFC cuando la solución permanente requiere cambio` (activo): impide pasar a *Pendiente de cambio* sin RFC vinculada.
- `Permitir varias RFC por problema` + máximo (valor de fábrica 5).
- **Tipo de cambio sugerido por defecto** (Normal / Estándar / Emergencia) y **regla**: si la prioridad del problema es P1 y existe riesgo de recurrencia, sugerir *Emergencia*.
- **Mapeo de prellenado de la RFC** (tabla Origen → Destino editable): `Título` → Título · `Descripción` → Motivo/justificación · `Solución permanente` → Descripción del cambio · `Servicio` → Servicio afectado · `CI afectados` → Activos/CI afectados · `Prioridad` → Urgencia sugerida · `Problema` → Origen = *Problema* con vínculo.
- **Condiciones para resolver el problema:** `Exigir que todas las RFC estén en estado Implementado/Cerrado con éxito` (activo).
- **Si la RFC es rechazada / falla / se cancela:** volver el problema a *Causa raíz identificada* o *En análisis* (selector) · crear tarea (plantilla de título) · notificar a (roles).
- **Si el cambio se implementa con éxito:** pasar automáticamente a *Resuelto* (interruptor) y ejecutar el verificador "Confirmar que no ha recurrido": tarea de verificación a N días (valor de fábrica 7).
- **Sincronización:** mostrar el estado de las RFC en la pestaña "Solución permanente" en tiempo real (siempre activo).

### 8.5 Pestaña 1.3.4.3.5 — Conocimiento

**Qué se configura:** cómo se genera conocimiento a partir de problemas (ITIL 4: *Knowledge Management*), coordinado con 1.7.1.

**Controles:**
- **Cuándo generar borrador de artículo:** casillas — al publicar error conocido · al resolver · al cerrar · solo manual.
- **Tipo de artículo por evento:** Error conocido (workaround) / Solución definitiva / Guía de resolución.
- **Plantilla del artículo:** editor con secciones y **mapeo de campos del problema**: `Síntomas` ← descripción · `Causa` ← causa raíz · `Workaround` ← workaround · `Solución` ← solución permanente · `Servicios/CI afectados` ← lista · `Referencia` ← enlace al problema · `Palabras clave` ← categoría + servicio. Botones `[Insertar variable]` `[Vista previa con problema real]`.
- **Audiencia y categoría del artículo:** por defecto según el error conocido; categoría de 1.7.1.
- **Responsable de revisión:** *Autor del problema*, *Responsable de la categoría de conocimiento* (según 1.7.1) o *Perfil concreto*.
- **¿Es obligatorio un artículo para cerrar el problema?** (interruptor). Excepciones por código de cierre (casillas).
- **Estado inicial del borrador:** *Borrador* (no editable aquí si 1.7.1 define otro).
- **Enlace:** los artículos aparecen en la pestaña "Conocimiento" del ticket y los incidentes resueltos con el workaround quedan asociados al artículo.

### 8.6 Pestaña 1.3.4.3.6 — CI y servicios (CMDB)

**Qué se configura:** cómo se relaciona el problema con la CMDB y el catálogo de servicios (ITIL 4: *Service Configuration Management*).

**Controles:**
- **Herencia de CI:** copiar a la lista de CI del problema los CI de los incidentes vinculados (interruptor) y marcarlos con origen "heredado".
- **Validar relación CI–servicio:** exigir que cada CI seleccionado soporte el servicio afectado (opciones: *Bloquear* / *Avisar* / *No validar*).
- **Clases de CI permitidas** (selector múltiple; vacío = todas).
- **Máximo de CI por problema** (valor de fábrica 100).
- **Marca visible en la CMDB:** mostrar en el CI los indicadores `Problema abierto` y `Error conocido vigente` (interruptores) con enlace al ticket (aparecen en 7.1/7.2).
- **Reglas por criticidad:** si algún CI afectado tiene criticidad ≥ X, **sugerir** Impacto = Alto (nunca fuerza el valor; muestra aviso en el formulario).
- **Servicios:** si el servicio afectado está marcado crítico en 1.2, activar automáticamente el criterio de problema mayor (enlaza con 7.8).
- **Al retirar/dar de baja un CI** con problemas abiertos: *Avisar al responsable* / *Bloquear la baja* (el bloqueo se aplica desde 1.5.2).

---

## 9. Perfiles y permisos

**Perfiles existentes hoy (1.1.2):** Administrador · Técnico · Solicitante · Supervisor · Gestor de Área · Auditor · Aprobador · Gestor de Cambios · Gestor de Activos y Configuración.

**Perfil nuevo que debes crear (migración semilla):** **Gestor de Problemas** (rol que ITIL 4 prevé para coordinar identificación, control del problema y control de errores). Todas las referencias a "Gestor de Problemas" en este documento apuntan a este perfil.

Por cada pantalla de configuración existen tres permisos: `ver`, `editar` (guardar borrador) y `publicar`. Un usuario con `editar` pero sin `publicar` guarda borradores; otro con `publicar` los revisa y publica (separación de funciones). Las transiciones de 1.3.4.2.2 pueden restringir aún más, nunca ampliar, lo que otorgan estos permisos.

**Matriz de permisos de fábrica** (✔ = concedido; — = no). Columnas: ADM = Administrador · TEC = Técnico · SOL = Solicitante · SUP = Supervisor · GAR = Gestor de Área · AUD = Auditor · APR = Aprobador · GCA = Gestor de Cambios · GAC = Gestor de Activos y Configuración · GPR = Gestor de Problemas (nuevo).

| Permiso | ADM | TEC | SOL | SUP | GAR | AUD | APR | GCA | GAC | GPR |
|---|---|---|---|---|---|---|---|---|---|---|
| `config.problemas.formulario.ver` / `.flujo.ver` / `.relaciones.ver` | ✔ | — | — | ✔ | — | ✔ | — | — | — | ✔ |
| `config.problemas.*.editar` | ✔ | — | — | — | — | — | — | — | — | — |
| `config.problemas.*.publicar` | ✔ | — | — | — | — | — | — | — | — | — |
| `config.problemas.importar_exportar` | ✔ | — | — | — | — | — | — | — | — | — |
| `config.problemas.restaurar_fabrica` | ✔ | — | — | — | — | — | — | — | — | — |
| `problemas.crear` | ✔ | ✔ | — | ✔ | — | — | — | — | — | ✔ |
| `problemas.ver` | ✔ (todos) | ✔ (su grupo y asignados) | — | ✔ (todos) | — | ✔ (todos, solo lectura) | ✔ (los que le piden aprobar) | ✔ (los vinculados a RFC) | ✔ (los que afectan CI) | ✔ (todos) |
| `problemas.editar` | ✔ | ✔ (asignados) | — | ✔ | — | — | — | — | — | ✔ |
| `problemas.asignar` | ✔ | — | — | ✔ | — | — | — | — | — | ✔ |
| `problemas.cerrar` | ✔ | — | — | ✔ | — | — | — | — | — | ✔ |
| `problemas.reabrir` / `problemas.cancelar` | ✔ | — | — | ✔ | — | — | — | — | — | ✔ |
| `problemas.prioridad_manual` | ✔ | — | — | ✔ | — | — | — | — | — | ✔ |
| `problemas.aprobar` (riesgo aceptado, cierre de problema mayor) | ✔ | — | — | ✔ | — | — | ✔ | — | — | — |
| `problemas.rfc.crear` | ✔ | ✔ (asignados) | — | ✔ | — | — | — | — | — | ✔ |
| `problemas.auditoria.ver` | ✔ | — | — | ✔ | — | ✔ | — | — | — | ✔ |
| `kedb.ver` | ✔ | ✔ | ✔ (solo si la audiencia incluye Autoservicio) | ✔ | — | ✔ | — | ✔ | ✔ | ✔ |
| `kedb.publicar` | ✔ | — | — | — | — | — | — | — | — | ✔ |

Notas: el perfil **Gestor de Área** no tiene acceso a este módulo por defecto (se puede otorgar desde 1.1.2). Los perfiles se resuelven con el mecanismo de permisos que ya usa el proyecto; si ese mecanismo no maneja permisos por acción, repórtalo en la Etapa 0.

---

## 10. Datos semilla (valores de fábrica)

**Orígenes:** Incidente(s) recurrente(s) 🔒 · Incidente mayor 🔒 · Detección proactiva 🔒 · Análisis de tendencias 🔒 · Notificación de proveedor 🔒 · Evento de monitoreo (alerta).

**Categorías de problema (categoría > subcategoría):** Hardware (Equipos de usuario, Servidores, Periféricos, Almacenamiento) · Software y aplicaciones (Aplicación de negocio, Sistema operativo, Productividad/Ofimática) · Red y comunicaciones (LAN/WLAN, WAN/Internet, Telefonía, VPN) · Infraestructura (Virtualización, Centro de datos, Respaldo) · Base de datos · Seguridad (Accesos, Malware, Configuración) · Procesos y procedimientos · Proveedor/Tercero · Usuarios y capacitación · Otros.

**Categorías de causa raíz:** Fallo de hardware · Defecto de software · Error de configuración · Cambio mal implementado · Capacidad insuficiente · Error humano / falta de capacitación · Proceso deficiente o inexistente · Falla de proveedor o tercero · Incidente de seguridad · Factor ambiental (energía, climatización) · Obsolescencia · Causa no determinada.

**Métodos de análisis:** 5 porqués · Diagrama de Ishikawa · Árbol de fallas · Kepner-Tregoe · Análisis cronológico · Análisis de cambios recientes · Análisis de Pareto · Otro.

**Códigos de cierre:**
| Código | Solución permanente | RFC cerrada | KE vigente | Cuenta como éxito |
|---|---|---|---|---|
| Resuelto con cambio | Sí | Sí | No | Sí |
| Resuelto sin cambio | Sí | No | No | Sí |
| Cerrado con error conocido aceptado | No | No | Sí | No |
| Cerrado – no reproducible | No | No | No | No |
| Cerrado – duplicado | No | No | No | No |
| Cerrado – responsabilidad de tercero | No | No | No | No |
| Cerrado – riesgo aceptado (requiere aprobación) | No | No | No | No |

**Motivos de espera:** Esperando al proveedor · Esperando ventana de mantenimiento · Esperando información del usuario · Esperando repuesto o licencia · Esperando recurrencia para recolectar evidencia.
**Motivos de cancelación:** Registrado por error · Duplicado · Ya no aplica · Fusionado con otro problema.

**Estados:**
| Orden | Estado | Tipo | Reloj diagnóstico | Reloj resolución | ¿Abierto? | 🔒 |
|---|---|---|---|---|---|---|
| 1 | Nuevo | Inicial | Corre | Corre | Sí | Sí |
| 2 | En análisis | En curso | Corre | Corre | Sí | |
| 3 | En espera | En pausa | Pausado | Pausado | Sí | |
| 4 | Causa raíz identificada | En curso | Detenido | Corre | Sí | |
| 5 | Error conocido | En curso | Detenido | Corre | Sí | |
| 6 | Pendiente de cambio | En curso | Detenido | Pausado | Sí | |
| 7 | Resuelto | Resuelto | Detenido | Detenido | Sí | Sí |
| 8 | Cerrado | Final | Detenido | Detenido | No | Sí |
| 9 | Cancelado | Final | Detenido | Detenido | No | Sí |

**Plantillas de problema:** (1) *Problema recurrente de incidentes* (Origen = Incidente(s), paquete "Investigación estándar"). (2) *Problema proactivo – tendencia* (Origen = Análisis de tendencias). (3) *Problema de proveedor* (Origen = Notificación de proveedor, tarea "Contactar al proveedor").

**Paquetes de tareas de fábrica:**
- *Investigación estándar:* Recopilar y revisar logs → Reproducir el fallo en laboratorio → Revisar cambios recientes en los CI afectados → Aplicar método de análisis → Documentar causa raíz → Validar workaround.
- *Problema mayor:* lo anterior + Convocar sesión de análisis (obligatoria) + Informe ejecutivo + Revisión del problema (obligatoria, bloquea *Cerrar*).
- *Cierre:* Verificar que no hay recurrencia (a N días) → Actualizar CMDB → Publicar/actualizar conocimiento.

**Eventos de dominio que este módulo emite (para plantillas y canales de 1.6.1):**
`problema.registrado`, `problema.asignado`, `problema.reasignado`, `problema.estado_cambiado`, `problema.causa_raiz_identificada`, `problema.error_conocido_publicado`, `problema.cambio_solicitado`, `problema.objetivo_en_riesgo`, `problema.objetivo_vencido`, `problema.escalado`, `problema.resuelto`, `problema.cerrado`, `problema.reabierto`, `problema.cancelado`, `problema.revision_pendiente`, `problema.mayor_detectado`, `kedb.publicado`, `kedb.revision_proxima`, `kedb.retirado`, `configuracion.publicada`.

**Métricas que los datos deben permitir (para 2.1 y 2.2):** problemas abiertos por estado/prioridad/categoría · tiempo medio hasta diagnóstico y hasta resolución · % de problemas con causa raíz identificada · % con workaround publicado · problemas proactivos vs reactivos · incidentes recurrentes asociados a problemas abiertos · incidentes evitados tras resolución · errores conocidos vigentes y su uso · % de objetivos cumplidos · reaperturas · problemas mayores y % con revisión completada.

---

## 11. Hechos confirmados del sistema existente (no los vuelvas a preguntar)

| Tema | Lo confirmado |
|---|---|
| Stack | Next.js y PostgreSQL en Supabase. Tienes acceso completo al código, la base de datos, el frontend y el backend. |
| Matriz impacto × urgencia | Existe, calcula P1 a P4 al crear incidentes. Ubicación en el código: **desconocida** (localizar en Etapa 0). Niveles: Alta / Media / Baja. |
| 1.2.4 Objetivos SLA | Contiene solo la "Matriz Institucional de Tiempos por Prioridad" (horas de primera respuesta y resolución total por prioridad). |
| SLA por servicio | Cada servicio de incidentes/solicitudes conserva su propio SLA editable, pero el tiempo efectivo de un ticket lo da su prioridad. **No tocar en este prompt** (queda pendiente de revisión por separado). |
| Formulario de Incidentes | Servicio del catálogo y panel de SLAs asociados · Título · Descripción con texto guía · Urgencia · Impacto · Prioridad calculada (matriz ITIL 4, P1–P4) · Elemento CMDB (opcional, solo ítems bajo custodia del usuario) · Campos adicionales visibles para la prioridad simulada · Carga fija de evidencias. |
| Creador de campos | Existe; se pueden agregar campos al formulario de Incidentes. Se reutiliza para problemas. |
| Calendarios y feriados | **No existen.** No se crean en este prompt; se usa la convención de cómputo del motor de SLA actual. |
| Turnos y ausencias de técnicos | **No existen datos.** Se crea `tecnico_ausencias` (sección 12). |
| Perfiles | Administrador, Técnico, Solicitante, Supervisor, Gestor de Área, Auditor, Aprobador, Gestor de Cambios, Gestor de Activos y Configuración. **Falta** Gestor de Problemas (se crea). |
| Datos que no existan | Se agregan a la base de datos mediante migraciones (sección 12). |

**Dependencias con otros módulos:**

| Con | Dependencia |
|---|---|
| 1.1.2 Perfiles y permisos | Crear perfil Gestor de Problemas y registrar los permisos de la sección 9. |
| 1.2 Catálogo de servicios y 1.2.4 | Lista de servicios; bloque de solo lectura "Objetivos internos de Problemas" en 1.2.4. |
| 1.3.1 Incidentes | Botón "Crear problema desde incidente", banner de vínculo, coincidencia de errores conocidos, resolución masiva/asistida, matriz compartida, editor de formulario y creador de campos. |
| 1.3.3 Gestión de cambios (Prompt 2) | Origen = Problema en la RFC; sincronización de estados (8.4). |
| 1.4.2 / 1.4.3 | Grupos resolutores, técnicos, niveles de soporte; nueva sección "Ausencias". |
| 1.5 / CMDB (Prompt 3) | Selector de CI, criticidad, marcas de problema/error conocido en el CI. |
| 1.6 Comunicaciones | Plantillas para los eventos de dominio de la sección 10. |
| 1.7 Conocimiento | Plantilla y flujo de revisión de artículos. |
| 1.8 Auditoría y retención | Registro de cambios de configuración y límites de adjuntos/borradores. |
| 2 Reportes | Métricas de la sección 10. |

---

## 12. Cambios de base de datos requeridos

Principio: **verifica primero si existe (Etapa 0); si no existe, créalo mediante migración.** No dupliques tablas o columnas que ya estén.

**12.1 Tablas de configuración del módulo** (diseño libre, siguiendo las convenciones del proyecto):
- Versiones de configuración por pantalla/pestaña: ámbito, número de versión, estado (borrador/publicada), snapshot `jsonb`, autor, motivo, fechas.
- Catálogos: categorías de problema (2 niveles), orígenes, categorías de causa raíz, códigos de cierre, métodos de análisis, motivos de espera, de cancelación y de reapertura, con los atributos de 6.3.
- Flujo: estados, transiciones, automatizaciones de transición.
- Reglas: asignación automática, escalamiento, creación por umbral (más su registro de ejecuciones).
- Tareas y paquetes de tareas; plantillas de problema; criterios de problema mayor y plantilla de revisión.
- Parámetros de KEDB, vínculo con RFC, conocimiento y CI/servicios (8.3 a 8.6).
- Objetivos de tiempo de problemas (7.4).

**12.2 Tablas operativas del problema** (verificar si ya existe algo): `problemas` (con secuencia `PRB-000001`), vínculo problema–incidente (con tipo de vínculo, quién y cuándo), problema–CI, problema–RFC, tareas, comentarios/bitácora, historial de cambios, adjuntos, revisión del problema, y `errores_conocidos` (secuencia `KE-000001`).

**12.3 Seguridad y personas:** perfil **Gestor de Problemas** y todos los permisos de la sección 9 como datos semilla; tabla **`tecnico_ausencias`** (`id`, `tecnico_id`, `desde`, `hasta`, `motivo`, `creado_por`, `creado_en`) con la sección mínima de UI en 1.4.3.

**12.4 Columnas que probablemente falten (verifica y agrega):**
- Servicio: marca de criticidad (`es_critico` o nivel de criticidad) — usada en 7.8 y 8.6.
- CI: `clase` y `criticidad` (coordinar con el Prompt 3 para no duplicar).
- Incidente: `es_incidente_mayor`, `codigo_resolucion`, y la referencia al problema (columna o tabla puente).
- Entidad `problema` en la definición de campos personalizados.
- Registro de eventos de dominio de la sección 10 (outbox o mecanismo de eventos ya existente).

**12.5 Búsqueda y rendimiento:** índices en incidentes por (servicio, categoría, CI, fecha de creación) para las reglas de umbral; búsqueda de texto completo en español y similitud (`to_tsvector('spanish', …)`, `pg_trgm`) para detectar duplicados al registrar problemas y para sugerir errores conocidos.

**12.6 Datos semilla:** todo lo de la sección 10, cargado con migración idempotente (reejecutarla no duplica registros).

**12.7 Tareas programadas:** evaluación de reglas de umbral, escalamientos, revisión periódica de KEDB, reanudación de problemas en espera, cierre automático tras *Resuelto*. Usa el mecanismo de jobs que ya exista en el proyecto; si no existe ninguno, propón (no implementes sin aprobación) `pg_cron` de Supabase, Edge Functions o cron de Next.js.

---

## 13. Criterios de aceptación

1. El menú muestra `1.3.4.1 Configuración de formulario`, `1.3.4.2` y `1.3.4.3` con las pestañas numeradas de la sección 2.3.
2. Todas las pestañas usan el patrón común (borrador, vista previa, publicar con diff y motivo, versionado, restauración, importación/exportación, bloqueo concurrente).
3. El editor de formulario y el creador de campos de problemas son **el mismo componente** que usa Incidentes, extendido; Incidentes sigue funcionando igual que antes.
4. Un administrador puede ocultar un campo no bloqueado, publicar, y el campo desaparece del formulario de registro sin perder datos de tickets existentes.
5. Un campo bloqueado (Título, Descripción, Servicio, Impacto, Urgencia) **no** puede ocultarse ni hacerse opcional.
6. Una regla condicional "Origen = Incidente(s) → Incidentes relacionados obligatorio" funciona en el formulario real.
7. Con `Usar matriz propia para problemas` apagado, un problema con cierto impacto y urgencia recibe **exactamente la misma prioridad** que un incidente con esos valores. No existe una segunda copia de la matriz.
8. Con matriz propia encendida y publicada, el recálculo de problemas abiertos respeta las prioridades manuales.
9. El panel de objetivos de tiempo del formulario muestra los valores de 1.3.4.2.4 para la prioridad calculada, y `1.2.4` muestra el bloque de solo lectura de Problemas sin alterar la matriz de Incidentes y Solicitudes.
10. Un valor de lista en uso no puede eliminarse, solo desactivarse; los valores 🔒 no pueden eliminarse.
11. Un estado con tickets no puede desactivarse sin asistente de migración.
12. El validador de flujo bloquea la publicación si hay estados inalcanzables, sin salida, o sin camino a un final.
13. Una transición con campos obligatorios abre el modal correcto y no permite ejecutar sin completarlos.
14. La asignación automática aplica la primera regla que coincide; el simulador reproduce el resultado real; la opción de disponibilidad omite a los técnicos con ausencia vigente.
15. Los relojes de diagnóstico y resolución se pausan o corren según cada estado y usan la misma convención de cómputo que el motor de SLA existente.
16. Una regla de umbral simulada muestra los grupos de incidentes detectados antes de activarse.
17. Al cerrar un problema con política "Resolución asistida", se muestra la lista de incidentes abiertos vinculados y se exige una decisión.
18. Promover a error conocido valida los requisitos configurados y lista lo que falta.
19. Un problema con RFC rechazada vuelve al estado configurado y se crea la tarea indicada.
20. Un problema mayor no puede cerrarse sin completar la revisión cuando así se configuró.
21. Toda acción de configuración queda en `1.8.1 Auditoría de cambios` con usuario, antes/después y motivo.
22. Existe el perfil **Gestor de Problemas** y la matriz de permisos de la sección 9 se cumple; un usuario con `editar` pero sin `publicar` no ve habilitado el botón Publicar.
23. Existe `tecnico_ausencias` con su sección mínima en 1.4.3.
24. El formulario de registro y el ticket reflejan exactamente las secciones 4 y 5 con los valores de fábrica.

---

## 14. Etapa 0 — Reconocimiento obligatorio y preguntas abiertas

**Antes de escribir cualquier código**, revisa el repositorio y la base de datos y entrégame un **informe** (sin modificar nada) con:

1. **Matriz de prioridad:** dónde está (archivo/tabla/función), cómo se consume al crear incidentes, y si tiene pantalla de edición.
2. **Motor de SLA:** dónde está, y si cuenta horas corridas u hábiles. Cómo se pausan y reanudan los relojes hoy.
3. **Componentes reutilizables:** editor de formulario de 1.3.1.1, creador de campos, constructor de condiciones o reglas (si hay), motor de estados de 1.3.1.2, sistema de notificaciones (1.6), jobs programados, y componentes de UI (tablas, modales, arrastrar-y-soltar, selectores).
4. **Perfiles y permisos:** cómo se almacenan y cómo se verifican en frontend, backend y RLS.
5. **Tablas existentes** de servicios, usuarios, técnicos, grupos, niveles de soporte, incidentes, CMDB, errores conocidos, conocimiento y auditoría.
6. **Qué de la sección 12 ya existe y qué falta**, con el plan de migraciones propuesto.
7. **Riesgos o conflictos** detectados (por ejemplo, componentes que dependan de comportamientos que esta spec cambia).

Después **detente y espera mi aprobación** para iniciar la Etapa A.

**Preguntas abiertas que quedan** (responde con lo que encuentres en el código; pregúntame solo lo que no puedas determinar):
1. Si la matriz impacto × urgencia está fija en código y sin pantalla de edición: ¿apruebo migrarla a una tabla con pantalla de edición?
2. ¿Cómo se identifica hoy un "incidente mayor" (si es que existe el concepto)?
3. ¿El motor de SLA de incidentes admite pausas por estado? (Determina cómo reutilizarlo para los dos relojes de problemas.)

---

## 15. Fuera de alcance de este prompt
Gestión de cambios (RFC) y sus formularios → Prompt 2 · Activos/CMDB → Prompt 3 · Pantallas operativas del módulo (bandejas, tableros, reportes) · Modificar los SLA por servicio de incidentes y solicitudes · Calendarios y feriados · Integraciones externas de monitoreo (solo se prevé el origen "Evento de monitoreo").
