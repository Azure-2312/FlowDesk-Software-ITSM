# PROMPT 2 de 3 — Configuración del administrador: GESTIÓN DE CAMBIOS (RFC)

> **Rama del menú que se implementa:** `1 Configuración > 1.3 Configuración de procesos > 1.3.3 Gestión de cambios`


---

## 0. Instrucciones para la IA que implementará esto

**Rol:** eres un arquitecto/desarrollador senior de software ITSM. Vas a construir el área de configuración del *administrador* para el proceso de Gestión de Cambios (Change Enablement) de un sistema ITSM que ya tiene Incidentes y Solicitudes de servicio.

**Reglas obligatorias:**

1. Implementa **exactamente** lo descrito. Si algo no está especificado, **no lo inventes**: antes de escribir código, devuelve una lista numerada de "Preguntas abiertas" (ver sección 15) y espera respuesta.
2. **No cambies la numeración ni los nombres del menú**, salvo el renombre indicado en la sección 2.2.
3. **Nada hardcodeado:** todo lo que aquí se llama "configurable" se guarda en base de datos y se lee en tiempo de ejecución. Los valores de fábrica (sección 11) se cargan como datos semilla.
4. Todas las pantallas siguen el **patrón común de la sección 3** (borrador, publicación, versionado, auditoría, permisos). Si el Prompt 1 (Gestión de problemas) ya se implementó, **reutiliza ese mismo componente de pantalla de configuración**; no lo vuelvas a construir.
5. **Reutiliza lo que ya existe; no crees duplicados** (ver sección 12): el editor de formulario de Incidentes (1.3.1.1) y su **creador de campos personalizados**, la **matriz impacto × urgencia → prioridad** que usa Incidentes, el catálogo de servicios, los perfiles, la CMDB y, si ya existen por el Prompt 1, el constructor de reglas condicionales, el motor de estados y el componente de borrador/publicación. Ubica cada pieza en el código (Etapa 0), extiéndela para la entidad `cambio` y crea componentes nuevos solo cuando no exista nada reutilizable.
6. Para cada pantalla entrega, en este orden: (a) modelo de datos, (b) API, (c) interfaz, (d) validaciones, (e) permisos, (f) auditoría, (g) pruebas.
7. Trabaja por etapas y detente al final de cada una para validación: **Etapa 0** = reconocimiento del código y la base de datos (sección 15, **obligatoria antes de escribir código**), **Etapa A** = 1.3.3.1, **Etapa B** = 1.3.3.2, **Etapa C** = 1.3.3.3, **Etapa D** = 1.3.3.4. *Nota de dependencia:* el formulario (Etapa A) muestra un aviso de conflictos de calendario que se implementa completo en la Etapa D; en la Etapa A deja la interfaz del aviso y un servicio provisional que devuelve "sin conflictos".
8. **Si falta un dato en la base de datos, agrégalo.** La lista de lo que debe verificarse y, si no existe, crearse está en la sección 13. Todo cambio de esquema va en migraciones SQL versionadas, idempotentes, con políticas RLS de Supabase coherentes con las de las tablas de configuración existentes.
9. Sigue las convenciones ya presentes en el repositorio (estructura de carpetas, estilo de API, componentes de UI, manejo de errores, tareas programadas).
10. **Integridad del proceso:** toda regla de negocio crítica (segregación de funciones, quórum y reglas de decisión, períodos de congelamiento, transiciones permitidas, campos obligatorios por transición, bloqueo de ejecución sin autorización) **se valida en el backend o la base de datos**, no solo en la interfaz. La interfaz solo la refleja.
11. **Fechas y horas:** se guardan como `timestamptz` en UTC y se muestran en la zona horaria del sistema (parámetro configurable; si no existe, créalo, sección 13). Las ventanas recurrentes se interpretan en esa zona horaria.

---

## 1. Marco normativo y de buenas prácticas

El diseño debe respetar:

| Referencia | Qué se toma de ella |
|---|---|
| **ITIL 4 – Práctica "Change Enablement"** | Maximizar el número de cambios exitosos asegurando que los riesgos se evalúen adecuadamente, se autoricen y se gestione el calendario. Tres tipos de cambio (estándar, normal, emergencia), **autoridad de cambio** delegada según riesgo, **modelos de cambio**, calendario de cambios y revisión posterior. |
| **ITIL 4 – Prácticas relacionadas** | Service Configuration Management (impacto y actualización de la CMDB), Release/Deployment Management, Incident y Problem Management (origen y consecuencias de los cambios), Risk Management, Knowledge Management, Continual Improvement. |
| **ITIL 4 – Principios rectores** | Enfocarse en el valor, empezar donde se está, progresar iterativamente, colaborar, pensar y trabajar de forma holística, mantenerlo simple, optimizar y automatizar. (Aplicación: cambios estándar preaprobados para lo rutinario, controles más estrictos solo donde el riesgo lo exige.) |
| **ISO/IEC 20000-1:2018, cláusula 8.5.1 (Gestión del cambio)** | Registrar y clasificar, evaluar riesgo e impacto, autorizar, planificar, implementar, revisar y cerrar; los cambios se evalúan considerando su efecto en el servicio y en la CMDB; registro de cambios de emergencia; revisión de la eficacia de los cambios. |
| **ISO/IEC 20000-1:2018, 8.5.2 y 8.5.3** | Diseño/desarrollo y transición de servicios nuevos o modificados (los cambios mayores pueden requerir este tratamiento; fuera del alcance de las pantallas de este prompt, pero el origen "Proyecto" debe poder registrarse). |
| **COBIT 2019 – BAI06 (Managed IT Changes) y BAI07** | Autorización formal, segregación de funciones, cambios de emergencia con aprobación retroactiva, seguimiento y reporte de cambios, aceptación y transición. |
| **Gobierno y auditoría (buena práctica)** | Trazabilidad completa e inmutable: quién solicitó, evaluó, aprobó, implementó y revisó; todo cambio de configuración queda auditado (quién, cuándo, antes, después, motivo). |

**Definiciones que deben respetarse en todo el sistema:**
- **Cambio:** adición, modificación o eliminación de cualquier elemento que pueda afectar a los servicios de TI.
- **RFC (Request for Change):** solicitud formal de cambio; en este sistema el registro de RFC *es* el ticket de cambio y conserva el mismo ID durante todo su ciclo.
- **Cambio estándar:** de bajo riesgo, bien conocido, documentado y **preautorizado** mediante un *modelo de cambio*.
- **Cambio normal:** requiere evaluación y autorización por la autoridad de cambio correspondiente según su riesgo.
- **Cambio de emergencia:** debe implementarse lo antes posible para restablecer o proteger un servicio; sigue un proceso acelerado con autorización del comité de emergencia y **revisión posterior obligatoria**.
- **Autoridad de cambio:** persona o grupo con facultad para autorizar un cambio (supervisor, Gestor de Cambios, CAB, dirección).
- **CAB (Change Advisory Board):** comité asesor que evalúa y recomienda/autoriza cambios de riesgo alto. **ECAB:** comité de emergencia, de composición reducida.
- **Modelo de cambio:** enfoque predefinido y repetible para un tipo concreto de cambio (pasos, responsables, plazos, checklists, autoridad).
- **Calendario de cambios:** vista consolidada de cambios programados, ventanas de mantenimiento, congelamientos y feriados.
- **Ventana de mantenimiento:** intervalo en que se permiten cambios con posible afectación. **Período de congelamiento:** intervalo en que se restringen cambios.
- **Plan de rollback:** pasos para revertir el cambio si falla.
- **PIR (Post-Implementation Review):** revisión posterior para confirmar si el cambio logró sus objetivos y recoger lecciones aprendidas.

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
  1.3.3 Gestión de cambios             <-- SE IMPLEMENTA EN ESTE PROMPT
   1.3.3.1 Configuración de formulario   (renombrado; antes "Formulario RFC")
   1.3.3.2 Tipos de cambio y requisitos
   1.3.3.3 Flujo de evaluación, autorización y revisión posterior
   1.3.3.4 Notificaciones y calendario de cambios
  1.3.4 Gestión de problemas            (Prompt 1)
   1.3.4.1 Configuración de formulario
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
`1.3.3.1` pasa de **"Formulario RFC"** a **"Configuración de formulario"**, para ser coherente con 1.3.1.1, 1.3.2.1 y 1.3.4.1. Actualiza el menú, la ruta (breadcrumb) y los permisos asociados. Los demás nombres de 1.3.3 no cambian.

### 2.3 Convención de numeración interna
- `1.3.3.1`, `1.3.3.2`, `1.3.3.3`, `1.3.3.4` son **ítems de menú = pantallas**.
- Los puntos `1.3.3.1.1`, `1.3.3.1.2`, etc. son **pestañas (tabs) dentro de la pantalla**. Cada pestaña lleva en su título el número (ej. "1.3.3.1.1 Campos").

| Pantalla (ítem de menú) | Pestañas |
|---|---|
| **1.3.3.1 Configuración de formulario** | 1.3.3.1.1 Campos · 1.3.3.1.2 Campos personalizados · 1.3.3.1.3 Listas y catálogos · 1.3.3.1.4 Cuestionario de riesgo · 1.3.3.1.5 Prioridad (matriz compartida) · 1.3.3.1.6 Plantillas de RFC · 1.3.3.1.7 Vista del ticket |
| **1.3.3.2 Tipos de cambio y requisitos** | 1.3.3.2.1 Tipos de cambio · 1.3.3.2.2 Matriz de autoridad · 1.3.3.2.3 Modelos de cambio estándar · 1.3.3.2.4 Reglas de clasificación |
| **1.3.3.3 Flujo de evaluación, autorización y revisión posterior** | 1.3.3.3.1 Estados · 1.3.3.3.2 Transiciones y acciones · 1.3.3.3.3 Etapas de aprobación y reglas de decisión · 1.3.3.3.4 Comités (CAB y emergencia) · 1.3.3.3.5 Plazos y escalamiento · 1.3.3.3.6 Tareas y checklists · 1.3.3.3.7 Implementación y cierre · 1.3.3.3.8 Revisión post-implementación |
| **1.3.3.4 Notificaciones y calendario de cambios** | 1.3.3.4.1 Notificaciones · 1.3.3.4.2 Ventanas de mantenimiento · 1.3.3.4.3 Períodos de congelamiento · 1.3.3.4.4 Feriados y días no laborables · 1.3.3.4.5 Conflictos y capacidad · 1.3.3.4.6 Presentación del calendario |

### 2.4 Pantallas operativas que esta configuración gobierna (ya existen en el menú general)
`5 Gestión de Cambios > 5.1 Operación y Solicitudes RFC > 5.1.1 Registrar solicitud RFC · 5.1.2 Calendario de ventanas · 5.1.3 Historial consolidado` y `5.2 Comité Asesor CAB > 5.2.1 Dictamen colegiado CAB`.
Las secciones 4 y 5 de este documento describen lo que deben mostrar el formulario y el ticket de RFC. Si alguna de estas pantallas operativas aún no existe, aplica la pregunta 1 de la sección 15.

---

## 3. Patrón común de TODAS las pantallas de configuración

Aplica a cada pantalla y pestaña de este documento. **No se repite abajo**; solo se indican los botones y reglas *adicionales* de cada pestaña.

### 3.1 Estructura visual
1. **Breadcrumb:** `Configuración > Configuración de procesos > Gestión de cambios > <pantalla> > <pestaña>`.
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
Por cada pantalla existen tres permisos: `ver`, `editar` (guardar borrador) y `publicar`. Detalle en la sección 10.

### 3.7 Validaciones generales
- Mensajes de error junto al campo (rojo) y resumen al inicio de la pestaña con enlaces a cada error.
- Nombres, etiquetas y códigos: sin espacios iniciales/finales, único dentro de su lista, sin caracteres de control. Códigos: `^[a-z][a-z0-9_]{2,39}$`, inmutables tras la primera publicación.
- Toda eliminación pide confirmación y, si el elemento está en uso, se ofrece **Desactivar** en lugar de eliminar.


---

## 4. ESPECIFICACIÓN DEL FORMULARIO DE REGISTRO DE RFC (lo que ve el usuario)

Esta sección define la **versión de fábrica** del formulario. Las secciones 6 a 9 definen cómo el administrador la modifica.

**Quién lo usa:** perfiles **Técnico**, **Supervisor**, **Gestor de Área** (solo cambios Normales sobre su área), **Gestor de Cambios**, **Gestor de Activos y Configuración**, **Gestor de Problemas** y **Administrador** (permiso `cambios.crear`). El tipo *Emergencia* exige además `cambios.crear_emergencia`. Los perfiles Solicitante, Aprobador y Auditor **no** registran RFC.
**Dónde:** `5 Gestión de Cambios > 5.1 Operación y Solicitudes RFC > 5.1.1 Registrar solicitud RFC`. También desde otros tickets mediante botones **[Crear RFC desde este problema]**, **[Crear RFC desde este incidente]** y **[Crear RFC desde este activo]**, que abren este formulario con Origen, ticket vinculado, servicio, CI y categoría prellenados (el mapeo desde problemas se define en el Prompt 1, pestaña 1.3.4.3.4).
**Disposición:** una sola página con **secciones plegables**, todas abiertas al inicio. Arriba a la derecha: selector **[Usar plantilla ▾]** (1.3.3.1.6). A la derecha, panel fijo "Resumen y validación" con el tipo, la prioridad, el nivel de riesgo, la autoridad que corresponderá aprobar y el estado de validación del calendario.

### 4.1 Secciones y campos

**Sección A — Identificación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas y comportamiento |
|---|---|---|---|---|---|
| A1 | Título | `titulo` | Texto de una línea | Sí | 10–150 caracteres, contador visible. Al escribir, muestra hasta 5 **RFC abiertas similares** (mismo CI o texto similar) con enlace. |
| A2 | Tipo de cambio | `tipo_cambio` | Lista (Estándar / Normal / Emergencia) con descripción de cada una en tooltip | Sí | Solo muestra los tipos que el perfil puede solicitar (1.3.3.2.1). Al cambiarlo se reevalúan campos obligatorios, secciones visibles (A3, G), anticipación mínima y autoridad. Las reglas de 1.3.3.2.4 pueden reclasificar el tipo y se informa con un aviso. |
| A3 | Modelo de cambio estándar | `modelo_id` | Lista con búsqueda | Sí **si** Tipo = Estándar; si no, oculto | Solo modelos en estado *Aprobado*, vigentes y aplicables al servicio/CI. Al elegirlo: prellena los campos del modelo (los marcados "bloqueados" quedan en solo lectura), muestra la **lista de elegibilidad** (casillas que el solicitante debe marcar para confirmar que el cambio cumple el modelo) y muestra su riesgo fijo. |
| A4 | Categoría | `categoria_id` | Lista en cascada (Categoría → Subcategoría) | Sí | Catálogo en 1.3.3.1.3. Puede prellenar grupo implementador y plantilla. |
| A5 | Origen | `origen` | Lista | Sí | Valores de fábrica en sección 11. |
| A6 | Ticket de origen | `ticket_origen` | Buscador de tickets (problema, incidente, solicitud de servicio, otra RFC) | Sí **si** el origen lo exige (catálogo); si no, opcional | Muestra ID, tipo, título y estado. Se guarda el vínculo bidireccional. |

**Sección B — Justificación y descripción**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| B1 | Motivo / justificación de negocio | `motivo` | Texto enriquecido | Sí | Mín. 30 caracteres. Ayuda: "Por qué es necesario y qué problema u objetivo atiende". |
| B2 | Descripción del cambio | `descripcion` | Texto enriquecido | Sí | Mín. 50 caracteres. **Texto guía de fondo:** qué se modifica, en qué sistema o equipo, cómo se hará a grandes rasgos y qué resultado se espera. |
| B3 | Beneficio esperado | `beneficio` | Texto | No | |
| B4 | Consecuencia de no realizar el cambio | `consecuencia_no_hacer` | Texto | No | Alimenta la evaluación de riesgo. |

**Sección C — Alcance**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| C1 | Servicio(s) afectado(s) | `servicios` | Selector múltiple (catálogo 1.2) | Sí | Solo servicios activos. |
| C2 | Activos / CI afectados | `ci_afectados` | Selector múltiple (CMDB) | Sí | Muestra código, nombre, clase, criticidad y entorno. Filtrado por defecto por los servicios elegidos (casilla "Ver todos"). No admite CI en estado *Dado de baja*. Botón **[Analizar impacto]**: lista los CI dependientes según las relaciones de la CMDB (hasta el nivel configurado en 1.3.3.4.5) y permite agregarlos con un clic. |
| C3 | Entorno | `entorno` | Lista (Producción, Preproducción, Pruebas, Desarrollo) | Sí | Si hay CI de varios entornos, se toma el más crítico. |
| C4 | Áreas / departamentos afectados | `areas_afectadas` | Selector múltiple (1.4.1) | No | Define a quién se comunica la interrupción y qué Gestor de Área puede ser aprobador. |
| C5 | Usuarios afectados (estimado) | `usuarios_afectados` | Número entero ≥ 0 | No | Alimenta el cuestionario de riesgo. |

**Sección D — Evaluación inicial**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| D1 | Impacto | `impacto` | Lista (mismos niveles que Incidentes: Alta / Media / Baja) con tooltip | Sí | Niveles leídos de la matriz compartida. |
| D2 | Urgencia | `urgencia` | Lista (Alta / Media / Baja) con tooltip | Sí | Ídem. |
| D3 | Prioridad | `prioridad` | Insignia de solo lectura | Calculado | **Misma matriz impacto × urgencia que usa Incidentes** (P1 a P4). Prioridad manual solo si 1.3.3.1.5 lo permite, con justificación. |
| D4 | Cuestionario de riesgo | `riesgo_respuestas` | Bloque de preguntas con opciones | Sí para Normal y Emergencia (abreviado); no para Estándar | Preguntas de 1.3.3.1.4. Las que se responden automáticamente desde otros campos (usuarios afectados, interrupción, entorno, criticidad, antecedentes) aparecen en solo lectura con la insignia "Automática" y su fuente. |
| D5 | Nivel de riesgo | `riesgo_nivel` / `riesgo_puntaje` | Insignia + puntaje, solo lectura | Calculado | Se recalcula al instante. Si el modelo estándar fija el riesgo, muestra el riesgo del modelo. |

**Sección E — Programación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| E1 | Inicio propuesto | `fecha_inicio` | Fecha y hora | Sí | Debe cumplir la **anticipación mínima** del tipo (1.3.3.2.1). Emergencia: sin mínimo. |
| E2 | Fin propuesto | `fecha_fin` | Fecha y hora | Sí | Posterior al inicio; duración máxima configurable en 1.3.3.4.5. |
| E3 | ¿Requiere interrupción del servicio? | `requiere_interrupcion` | Sí / No | Sí | |
| E4 | Duración estimada de la interrupción | `duracion_interrupcion` | Número + unidad (min/h) | Sí **si** E3 = Sí | Alimenta el cuestionario de riesgo y la comunicación a usuarios. |
| E5 | Ventana de mantenimiento | `ventana_id` | Lista de ventanas aplicables | No (o Sí según el tipo) | Se sugieren las ventanas que contienen el rango elegido. |
| E6 | Validación de calendario | — | Panel de solo lectura | Calculado | Muestra con semáforo: anticipación mínima, dentro de ventana, período de congelamiento, feriado, conflictos con otras RFC (lista con enlaces), y capacidad. Botón **[Revisar calendario]** abre un modal con vista de calendario y la lista de **próximos huecos libres** sugeridos. Los bloqueos impiden enviar; las advertencias no. |

**Sección F — Planes y responsables**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| F1 | Plan de implementación | `plan_implementacion` | Texto enriquecido + tabla opcional de pasos (orden, paso, responsable, duración estimada) | Sí (Normal y Emergencia; en Estándar viene del modelo) | Los pasos de la tabla se convierten en tareas al programar (1.3.3.3.6). |
| F2 | Plan de pruebas | `plan_pruebas` | Texto enriquecido | Según tipo (1.3.3.2.1) | |
| F3 | Plan de rollback | `plan_rollback` | Texto enriquecido + campo `tiempo_rollback` (min/h) | Sí (Normal y Emergencia) | Ayuda: pasos para revertir, punto de no retorno, quién decide revertir. |
| F4 | Criterios de éxito | `criterios_exito` | Lista de ítems (texto, agregar/quitar) | Según tipo | Se usan en la revisión post-implementación. |
| F5 | Plan de comunicación | `plan_comunicacion` | Texto + casilla "Notificar a usuarios afectados" | No | La casilla activa el comunicado automático de 1.3.3.4.1. |
| F6 | Grupo implementador | `grupo_implementador_id` | Lista (1.4.2) | Sí | |
| F7 | Responsable de la implementación | `implementador_id` | Lista con búsqueda (técnicos del grupo, 1.4.3) | Según tipo (1.3.3.2.1) | Muestra la carga de cambios programados de cada técnico. No puede ser el aprobador de ninguna etapa de esta RFC (segregación). |

**Sección G — Emergencia** (visible solo si Tipo = Emergencia)

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| G1 | Justificación de emergencia | `justificacion_emergencia` | Texto enriquecido | Sí | Mín. 30 caracteres. |
| G2 | Incidente o problema que la motiva | `ticket_emergencia` | Buscador de tickets | Sí (configurable) | |
| G3 | Consecuencia si no se actúa de inmediato | `consecuencia_emergencia` | Texto | Sí | |
| G4 | Registro retroactivo | `retroactivo` | Casilla | No | Visible solo con permiso `cambios.documentar_retroactivo`. Al marcarla aparecen: `fecha_inicio_real`, `fecha_fin_real`, `resultado`, `autorizado_verbalmente_por` (usuario) y `medio_autorizacion` (lista). La RFC se registra directamente como *Implementado* y queda pendiente de autorización retroactiva y de revisión (1.3.3.3). |

**Sección H — Evidencias**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| H1 | Evidencias (adjuntos) | `adjuntos` | Arrastrar-y-soltar + [Seleccionar archivos] | No | Tipos y tamaño máximo según 1.8.3 (valor de fábrica: 25 MB por archivo, 10 archivos; bloquear ejecutables). |

**Campos automáticos (panel lateral "Datos del registro"):** `id` (formato `RFC-000001`, secuencia sin saltos), `solicitante_id`, `fecha_solicitud`, `estado` inicial = *Solicitado*, `canal` (manual / desde problema / desde incidente / desde activo / desde plantilla).

### 4.2 Botones del formulario
- **[Enviar RFC]** (primario): valida, crea la RFC, muestra "RFC-xxxxxx enviada" y redirige al ticket.
- **[Enviar y crear otra]**: igual, conservando plantilla y categoría.
- **[Guardar como borrador]**: guarda sin validar; el borrador solo lo ve su autor en "Mis borradores" y caduca a los 30 días (configurable en 1.8.3).
- **[Revisar calendario]**: abre el modal descrito en E6.
- **[Cancelar]**: pide confirmación si hay datos.

### 4.3 Validaciones al enviar (todas también en servidor)
- Todos los obligatorios completos (según tipo y reglas condicionales); errores listados arriba con enfoque al primero.
- Fecha de fin posterior a la de inicio; anticipación mínima cumplida (o, si no se cumple, la RFC solo puede enviarse como Emergencia con justificación, si el perfil tiene permiso).
- Sin **bloqueos de calendario** (congelamiento bloqueante, capacidad excedida, conflicto bloqueante) salvo que el perfil tenga `cambios.excepcion_conflicto` y registre motivo.
- Ningún CI en estado *Dado de baja*.
- Advertencia no bloqueante de posible duplicado (misma combinación de CI con ventanas solapadas): "Posible duplicado: RFC-xxxxxx" con [Ver] [Enviar de todos modos].
- Tipo Estándar: modelo elegido, lista de elegibilidad completa y CI/servicio dentro del alcance del modelo.

---

## 5. ESPECIFICACIÓN DEL TICKET DE RFC YA CREADO (lo que ve el usuario)

**Ruta:** `5 Gestión de Cambios > 5.1 Operación y Solicitudes RFC > 5.1.3 Historial consolidado > (fila) RFC-xxxxxx` y desde cualquier enlace a la RFC.
**Layout:** cabecera fija + barra de acciones + pestañas + panel lateral derecho.

### 5.1 Cabecera fija
Siempre visible: **ID**, **título**, **insignia de tipo** (color por tipo), **insignia de estado**, **insignia de prioridad**, **insignia de riesgo** (con puntaje al pasar el cursor), **solicitante**, **ventana programada** (inicio – fin en la zona horaria del sistema, con duración), **etapa de aprobación actual** (ej. "Etapa 2 de 3: CAB"), **indicadores de plazo** (medidores de "Evaluación" y "Autorización" con porcentaje consumido y color verde/ámbar/rojo/en pausa), y **etiquetas** cuando apliquen: `Emergencia`, `Retroactivo`, `Conflicto`, `En congelamiento`, `Fuera de ventana`, `Con condiciones`, `Reprogramado`, `Fallido`, `Revertido`, `Modelo estándar: <nombre>`.

### 5.2 Barra de acciones
Los botones se generan **dinámicamente** desde las transiciones de 1.3.3.3.2 válidas para el estado, el tipo y el perfil (ej. [Iniciar evaluación], [Enviar a autorización], [Programar], [Reprogramar], [Iniciar implementación], [Registrar resultado], [Iniciar revisión], [Cerrar], [Cancelar]). Si es el aprobador de la etapa vigente aparecen además **[Aprobar]**, **[Aprobar con condiciones]**, **[Rechazar]**, **[Solicitar información]** y **[Delegar]**. Siempre presentes según permisos: **[Reasignar implementador]**, **[Editar]**, **[Vincular ticket]**, **[Añadir tarea]**, **[Seguir / Dejar de seguir]** y el menú **[⋯]** con *Imprimir/PDF*, *Copiar enlace*, *Exportar ICS de la ventana*, *Duplicar como nueva RFC*, *Convertir tipo* (solo `cambios.reclasificar_tipo`). Los botones sin permiso o con requisitos pendientes se muestran deshabilitados con tooltip que explica el motivo.

### 5.3 Panel lateral derecho (resumen)
Tipo y modelo · Categoría · Servicios (nº y nombres) · CI afectados (nº y criticidad máxima) · Entorno · Prioridad y riesgo · Origen y ticket de origen · Implementador y grupo · Aprobador(es) pendiente(s) y plazo · Reunión de CAB (fecha y hora, si aplica) · Interrupción estimada · Áreas afectadas · Seguidores · Próximo hito (qué y cuándo).

### 5.4 Pestañas

**5.4.1 Solicitud**
Todo lo registrado en el formulario (sección 4), agrupado por las mismas secciones, con **[Editar]** por sección (según estado y permisos) y historial de versiones del texto de cada plan. Si el tipo es Emergencia, incluye la sección de emergencia. Adjuntos con [Descargar], [Vista previa], [Eliminar] (con permiso).

**5.4.2 Evaluación**
- *Prioridad:* impacto, urgencia, prioridad (y justificación si fue manual).
- *Riesgo:* cada pregunta del cuestionario con la respuesta, su puntaje y la fuente (manual/automática); puntaje total y nivel; botón **[Ajustar nivel de riesgo]** (solo evaluador con permiso: exige nuevo nivel y justificación; queda el valor calculado y el ajustado).
- *Análisis de impacto en la CMDB:* CI directamente afectados y CI dependientes (con criticidad y servicios que soportan), servicios potencialmente afectados y áreas.
- *Conflictos detectados:* tabla con tipo de conflicto (otro cambio, congelamiento, feriado, fuera de ventana, capacidad), severidad, elemento en conflicto con enlace, y estado (pendiente / resuelto / excepción concedida por *usuario* con motivo).
- *Evaluación técnica:* evaluador asignado, fecha, comentarios técnicos (texto enriquecido), recursos requeridos, costo estimado (opcional), recomendación (Favorable / Favorable con condiciones / Desfavorable).

**5.4.3 Aprobaciones**
- Tabla por **etapa**: orden, nombre de la etapa, aprobador(es) o comité, regla de decisión, plazo y tiempo restante, estado (Pendiente / En curso / Aprobada / Rechazada / Aprobada con condiciones / Omitida), decisión, decidido por, fecha-hora, comentario, condiciones.
- Cada fila se expande para ver votos individuales (si la etapa es colegiada), delegaciones y recordatorios enviados.
- *Bloque CAB/ECAB:* fecha y hora de la reunión, asistentes y quórum, votos (a favor / en contra / abstenciones), dictamen, condiciones y enlace a `5.2.1 Dictamen colegiado CAB`.
- *Condiciones pendientes:* lista de condiciones impuestas con responsable y casilla de cumplimiento (deben cumplirse antes de iniciar la implementación).
- Para el aprobador vigente: botones [Aprobar] [Aprobar con condiciones] [Rechazar] [Solicitar información] [Delegar] con modales según 1.3.3.3.3.

**5.4.4 Planificación**
- *Ventana aprobada:* inicio y fin, ventana de mantenimiento asociada, historial de reprogramaciones (fecha anterior → nueva, motivo, quién).
- *Equipo:* implementador, grupo, participantes adicionales.
- *Tareas:* tabla con título, fase (Pre-implementación / Implementación / Validación / Post-implementación), responsable, vencimiento, estado, obligatoria, bloqueo de transición; botones [Añadir tarea] [Aplicar paquete].
- *Dependencias:* RFC o tareas que deben completarse antes (bloquea / es bloqueada por).
- *Checklist Go/No-Go:* ítems configurados (1.3.3.3.6) con casilla, responsable y evidencia; decisión final **Go / No-Go** con quién y cuándo.
- *Comunicación:* hitos de comunicación programados (a quién, cuándo, plantilla, estado de envío).

**5.4.5 Implementación**
- *Real:* inicio real, fin real, duración, interrupción real del servicio (minutos).
- *Bitácora de ejecución:* línea de tiempo paso a paso (hora, paso, responsable, resultado, nota), con botón **[Registrar paso]**.
- *Resultado:* Exitoso / Parcial / Fallido / Rollback ejecutado / Cancelado en ejecución (catálogo 1.3.3.1.3), notas.
- *Rollback:* ¿se ejecutó?, motivo, hora de decisión, hora de término, resultado.
- *Fallo:* causa del fallo (catálogo), incidentes generados (vinculados), problema creado (si aplica).
- *Actualización de CMDB:* lista de cambios a aplicar en los CI (CI, atributo, valor actual, valor nuevo, estado: Pendiente / Aplicado / No aplica) con botón **[Aplicar a la CMDB]**.

**5.4.6 Revisión post-implementación**
Visible desde *Implementado*. Preguntas de la plantilla de 1.3.3.3.8 con respuestas; resultado de cada criterio de éxito; incidentes causados por el cambio (detectados automáticamente en la ventana de observación y agregables manualmente); desviaciones respecto al plan; costo real vs. estimado; lecciones aprendidas; acciones de mejora (tabla: acción, responsable, fecha, estado); confirmación de CMDB actualizada y de conocimiento publicado; revisor, fecha y **calificación** (Exitoso / Con observaciones / Fallido).

**5.4.7 Relacionados**
Problemas, incidentes (origen, causados por el cambio), solicitudes de servicio, otras RFC (tipos: "bloquea a", "es bloqueada por", "duplicada de", "relacionada"), artículos de conocimiento. Botones **[Vincular]** y **[Desvincular]** (motivo).

**5.4.8 Activos / CI afectados**
Tabla: código, nombre, clase, criticidad, entorno, servicios que soporta, origen del vínculo (manual / análisis de impacto), estado del CI. Botones [Agregar CI], [Quitar], [Ver en mapa CMDB] (abre `7.2 Mapa de topología CMDB` centrado en el CI).

**5.4.9 Comentarios y bitácora**
Línea de tiempo unificada con filtros *Todo · Comentarios internos · Comentarios públicos · Cambios de estado · Aprobaciones · Sistema*. Editor con menciones `@usuario`, adjuntos y visibilidad (Interno / Visible para el solicitante). Los comentarios no se borran, se **anulan** con motivo.

**5.4.10 Historial / auditoría**
Tabla inmutable: fecha-hora, usuario, acción, campo, valor anterior, valor nuevo, comentario. Filtros por usuario, acción y fechas. Botón [Exportar CSV]. Solo con permiso `cambios.auditoria.ver`.

### 5.5 Reglas de visibilidad por estado
Cada pestaña tiene "visible desde el estado X" y "editable en los estados Y" (1.3.3.1.7). Valores de fábrica: *Evaluación* visible desde *En evaluación*; *Aprobaciones* desde *En autorización*; *Planificación* desde *Autorizado*; *Implementación* desde *Programado*; *Revisión post-implementación* desde *Implementado*; ningún campo de planes editable desde *En ejecución*, y ninguno en estados finales.

---

## 6. PANTALLA 1.3.3.1 — CONFIGURACIÓN DE FORMULARIO

**Propósito:** que el administrador controle qué se captura al solicitar un cambio, cómo se mide el riesgo y qué se muestra en el ticket, sin tocar código.
**Pestañas:** 1.3.3.1.1 a 1.3.3.1.7. Todas siguen el patrón de la sección 3.
**Reutilización obligatoria:** la configuración de formulario de Incidentes (1.3.1.1) ya permite configurar campos y tiene un creador de campos. Esta pantalla **extiende ese mismo editor** para la entidad `cambio` (si el Prompt 1 ya lo extendió para `problema`, usa esa misma extensión). Lo que el editor ya haga no se reimplementa; lo que falte se agrega al componente compartido **sin cambiar el comportamiento actual de Incidentes**.

---

### 6.1 Pestaña 1.3.3.1.1 — Campos (visibles, obligatorios y orden)

**Qué se configura:** para cada campo del formulario de la sección 4: si es visible, su obligatoriedad (incluida la que depende del tipo de cambio), sección, posición, ancho, perfiles y reglas condicionales.

**Selector superior:** `Formulario: [Solicitud de RFC ▾]` con opciones *Solicitud de RFC* (alta) y *Edición de RFC* (campos editables dentro del ticket); botón **[Copiar configuración del otro formulario]**.

**Layout de tres columnas:**

| Columna | Contenido |
|---|---|
| **Izquierda — Biblioteca de campos** (280 px) | Buscador. Grupos plegables: *Campos estándar*, *Campos personalizados*, *Campos del sistema* (informativos). Un campo ya colocado aparece en gris con ✓; los ocultos, con ojo tachado. Clic en un campo no colocado → [Agregar al formulario]. |
| **Centro — Lienzo** | Secciones como tarjetas plegables (A. Identificación … H. Evidencias). Cada fila: asa de arrastre `⋮⋮`, etiqueta, código en gris, chip de tipo, interruptor **Visible**, selector rápido **Obligatorio**, 🔒 si es bloqueado, ⚙ propiedades, ⎘ duplicar y 🗑 eliminar (solo personalizados). |
| **Derecha — Propiedades** (360 px) | Se llena al seleccionar una fila. |

**Barra de herramientas del lienzo:** `[+ Agregar sección]` `[Expandir todo]` `[Contraer todo]` `[Mostrar solo obligatorios]` `[Mostrar solo ocultos]` y contador "N campos visibles · M obligatorios".

**Acciones sobre secciones:** renombrar, color/ícono, mover (arrastre o ↑↓), ocultar sección (oculta sus campos), eliminar (solo vacía), visible para perfiles. **La Sección G (Emergencia) es condicional por sistema:** solo se muestra con Tipo = Emergencia y no puede mostrarse en otros tipos.

**Propiedades de un campo (panel derecho):**

| Propiedad | Control | Detalle |
|---|---|---|
| Código interno | Texto de solo lectura | Inmutable. |
| Etiqueta | Texto 3–60 | |
| Texto de ayuda | Texto hasta 250 | Ícono ⓘ con tooltip. |
| Marcador (placeholder) | Texto hasta 80 | Controles de texto. |
| Visible | Interruptor | Oculto conserva datos. |
| **Obligatorio** | Selector de 4 opciones: **Siempre** · **Según tipo de cambio** (se define por tipo en 1.3.3.2.1, pestaña de requisitos) · **Condicional** (constructor de reglas) · **No** | La obligatoriedad *por transición* se configura en 1.3.3.3.2. |
| Solo lectura | Interruptor | Requiere valor por defecto o cálculo. |
| Valor por defecto | Control del tipo del campo | Variables `{usuario_actual}`, `{fecha_actual}`, `{grupo_del_usuario}`. |
| Sección, Ancho | Lista; 1/3 · 1/2 · 2/3 · completo | |
| Visible para perfiles / Editable por perfiles | Selector múltiple (1.1.2) | Vacío = todos. |
| Validaciones | Longitud, rango, expresión regular con mensaje propio y botón [Probar expresión] | |
| Reglas condicionales | Constructor (abajo) | |

**Constructor de reglas condicionales:** `CUANDO [campo] [operador] [valor] (Y/O …) ENTONCES [acción]`; hasta 5 condiciones y 10 reglas por campo; operadores *igual, distinto, vacío, no vacío, contiene, es uno de, mayor que, menor que*; acciones *Mostrar, Ocultar, Hacer obligatorio, Hacer opcional, Solo lectura, Filtrar opciones, Establecer valor*; botón **[Probar regla]**; detección de ciclos (error "Regla circular"). Reglas de fábrica: (1) `Tipo de cambio = Estándar` → mostrar *Modelo de cambio estándar*; (2) `Origen` con "requiere ticket" → *Ticket de origen* obligatorio; (3) `¿Requiere interrupción? = Sí` → *Duración de la interrupción* obligatoria; (4) `Tipo = Emergencia` → mostrar Sección G.

**Campos bloqueados (🔒) — no se pueden ocultar:** *Título, Tipo de cambio, Motivo, Descripción, Servicio(s) afectado(s), Activos/CI afectados, Impacto, Urgencia, Inicio y fin propuestos, Plan de implementación, Plan de rollback, Grupo implementador*. Se pueden renombrar y mover. Su obligatoriedad mínima normativa (sección 7.1) tampoco puede bajarse en tipos Normal y Emergencia. Los campos del sistema (ID, solicitante, fechas, estado) no son editables.

**Reordenamiento:** arrastrar (indicador azul del destino); alternativa por teclado `Alt+↑/↓` (dentro de la sección) y `Alt+←/→` (entre secciones); el orden define también el orden de tabulación; botón **[Ordenar sección alfabéticamente]**.

**Reglas de consistencia (al guardar borrador y al publicar):**
1. Un campo oculto no puede ser obligatorio.
2. Si A es obligatorio condicional según B, B debe ser visible.
3. Un campo con obligatoriedad "Según tipo de cambio" debe tener su fila en la matriz de 1.3.3.2.1 (se crea automáticamente con valor *Opcional*).
4. Mínimo 1 sección y 8 campos visibles; máximo 50 campos visibles (aviso al superarse).
5. No pueden existir campos huérfanos.
6. Los campos que alimentan reglas del sistema (fechas, CI, servicios, interrupción, usuarios afectados, entorno) no pueden quitarse del formulario si una pregunta del cuestionario de riesgo los usa como fuente automática (1.3.3.1.4); el error indica qué pregunta los usa.

**Mensajes de ejemplo:**
- `Error: "Plan de rollback" es un campo bloqueado y no puede ocultarse.`
- `Error: "Usuarios afectados" alimenta la pregunta 2 del cuestionario de riesgo y no puede ocultarse.`
- `Aviso: 2 campos obligatorios nuevos no tienen valor en 41 RFC abiertas; solo se exigirán al editarlas.`

---

### 6.2 Pestaña 1.3.3.1.2 — Campos personalizados

**Reutilización obligatoria:** usa el creador de campos personalizados existente y su misma tabla de definición, agregando `cambio` como entidad destino. Si el creador ya cubre tipos o propiedades de este asistente, se conserva su comportamiento y se agregan solo los que falten.

**Vista de lista:** Nombre · Código · Tipo · Estado · Usado en N RFC · Aplica a tipos de cambio · Creado por · Fecha. Búsqueda y filtros. Límite de fábrica **30 campos** (configurable hasta 60). Botones: `[+ Nuevo campo personalizado]`; por fila `[Editar]` `[Duplicar]` `[Desactivar/Activar]` `[Eliminar]` (solo con 0 usos; con usos, solo desactivar).

**Asistente (5 pasos; [Atrás] [Siguiente] [Cancelar] y [Crear campo] al final):**
1. **Tipo:** texto corto · texto largo · entero · decimal · fecha · fecha y hora · sí/no · lista · selección múltiple · casillas · usuario · URL · archivo · referencia a CI · referencia a ticket.
2. **Identificación:** etiqueta (3–60), código (prefijo `cf_`, único, inmutable), ayuda.
3. **Propiedades según tipo:** longitudes, rangos, unidad, opciones (valor, etiqueta, color, orden, activo), valor por defecto, tipos de archivo.
4. **Ubicación y comportamiento:** formulario(s), sección, **tipos de cambio a los que aplica (Estándar / Normal / Emergencia)**, obligatorio (sí/no/según tipo/condicional), pestaña de la vista del ticket, perfiles que lo ven y editan, incluir en búsqueda, incluir en reportes, incluir en auditoría (siempre activo).
5. **Resumen:** vista previa del control y resumen.

**Regla:** el tipo de dato no se cambia tras crear el campo.

---

### 6.3 Pestaña 1.3.3.1.3 — Listas y catálogos

**Layout:** a la izquierda la lista de catálogos; a la derecha la tabla del catálogo elegido.

| Catálogo | Estructura | Atributos propios de cada valor |
|---|---|---|
| **Categorías de cambio** | Árbol de 2 niveles | Tipo de cambio sugerido · Grupo implementador por defecto · Plantilla por defecto · Servicio asociado (opcional). |
| **Orígenes** | Lista plana | ¿Requiere ticket de origen? (sí/no) · Tipos de ticket permitidos · ¿Es origen reactivo o proactivo? |
| **Entornos** | Lista plana | Peso de riesgo (0–5) · ¿Es productivo? (sí/no). |
| **Resultados de implementación** | Lista plana (🔒 los 5 de fábrica) | ¿Cuenta como éxito? · ¿Exige causa de fallo? · ¿Exige revisión post-implementación? · ¿Dispara acciones de fallo (1.3.3.3.7)? |
| **Códigos de cierre** | Lista plana | ¿Exige PIR completa? · ¿Exige CMDB actualizada? · ¿Cuenta como cambio exitoso en KPI? · ¿Exige aprobación de supervisor? |
| **Motivos de rechazo** | Lista plana | ¿Permite reenviar? (sí/no) · Texto sugerido al solicitante. |
| **Motivos de cancelación** | Lista plana | ¿Requiere aprobación? |
| **Motivos de aplazamiento / reprogramación** | Lista plana | ¿Exige nueva autorización? (sí/no/si cambia más de N horas). |
| **Causas de fallo** | Lista plana | ¿Sugiere crear problema? (sí/no). |
| **Tipos de dependencia entre RFC** | Lista plana (🔒) | Bloquea (sí/no) · Inverso (nombre del vínculo opuesto). |
| **Medios de autorización de emergencia** | Lista plana | ¿Exige evidencia adjunta? |

**Atributos comunes:** Orden · Código (inmutable) · Nombre · Descripción · Color · Activo · Sistema (🔒) · Usos.

**Botones:** `[+ Nuevo valor]` (en categorías: `[+ Categoría]` `[+ Subcategoría]`) · por fila `[Editar]` `[Activar/Desactivar]` `[Eliminar]` · `[Reordenar]` · `[Importar CSV]` (plantilla descargable, vista previa con errores por fila) · `[Exportar CSV]` · `[Fusionar…]` (reasigna y desactiva el origen, con confirmación y número de registros).

**Reglas:** valores 🔒 se renombran y recolorean pero no se eliminan ni desactivan; un valor en uso solo se desactiva; nombre único por nivel, código único por catálogo; cada catálogo conserva al menos 1 valor activo; categorías máximo 2 niveles.

---

### 6.4 Pestaña 1.3.3.1.4 — Cuestionario de riesgo

**Qué se configura:** cómo se calcula el nivel de riesgo de una RFC (ITIL 4 y COBIT BAI06: evaluación de riesgo antes de autorizar), con un cuestionario ponderado y umbrales.

**Bloque 1 — Preguntas** (tabla ordenable): Orden · Pregunta · Peso (multiplicador, por defecto 1) · Fuente de respuesta · Aplica a tipos (Estándar/Normal/Emergencia) · Obligatoria · Activa.
Editor de pregunta (modal): texto (5–200) · ayuda · **fuente de respuesta**: *Manual* / *Automática desde un campo del formulario* (selector de campo y tabla de correspondencia valor → opción) / *Automática desde datos del sistema* (criticidad máxima de los CI/servicios, antecedentes de RFC fallidas en los mismos CI en los últimos N meses, modelo estándar usado) · **opciones de respuesta** (tabla: texto, puntaje 0–10, marca **"Eleva el riesgo a nivel mínimo X"**, orden) · si se permite "No sé" (con puntaje por defecto) · condiciones de aparición (constructor).
Botones: `[+ Nueva pregunta]` `[Duplicar]` `[Desactivar]` `[Eliminar]` (solo si nunca se respondió) `[Reordenar]`.

**Bloque 2 — Niveles de riesgo y umbrales:** tabla con Nivel (Bajo / Medio / Alto / Crítico, renombrables, mínimo 3 y máximo 5), color, rango de puntaje (desde–hasta; la herramienta valida que cubran de 0 al máximo posible sin huecos ni solapes), descripción. Se muestra el **puntaje máximo posible** calculado.

**Bloque 3 — Reglas especiales:**
- `Aplicar la regla de elevación`: si una respuesta marcada con "Eleva el riesgo" se elige, el nivel final no puede ser menor que el indicado, aunque el puntaje sea menor.
- `Permitir ajuste manual del nivel de riesgo` (interruptor) → perfiles autorizados (evaluador) y justificación obligatoria (mín. 15 caracteres); el sistema conserva el nivel calculado y el ajustado.
- `Riesgo fijo para cambios estándar`: el nivel lo da el modelo (1.3.3.2.3).
- `Cuestionario abreviado para Emergencia`: las preguntas marcadas "Aplica a Emergencia" son las únicas obligatorias; el resto se responde después.

**Botones:** `[Simulador]` (panel donde el admin responde el cuestionario y ve puntaje, nivel y regla de elevación aplicada) · `[Restaurar cuestionario de fábrica]` · patrón común.

**Cuestionario de fábrica:** sección 11.

**Reglas:** cada pregunta activa debe tener ≥2 opciones; una pregunta automática debe tener su fuente válida y visible; no se puede desactivar una pregunta si dejaría el máximo posible por debajo del umbral del nivel Alto; cambios publicados no recalculan RFC cerradas; para RFC abiertas el modal de publicación ofrece la casilla "Recalcular riesgo de las N RFC abiertas" (no toca ajustes manuales).

---

### 6.5 Pestaña 1.3.3.1.5 — Prioridad (matriz compartida)

**Hecho confirmado:** el sistema ya tiene la matriz impacto × urgencia → prioridad (P1 Crítica, P2 Alta, P3 Media, P4 Baja), con niveles Alta/Media/Baja, usada al crear incidentes. Ubicación en el código: desconocida (Etapa 0). **Prohibido crear una matriz paralela como comportamiento por defecto.**

1. **Matriz vigente** de solo lectura rotulada "Matriz compartida con Incidentes" (y con Problemas si el Prompt 1 está implementado), más tabla de prioridades.
2. **Enlace `[Editar matriz compartida →]`** a su pantalla de edición actual. Si la matriz está fija en código sin pantalla, repórtalo en la Etapa 0 y propón migrarla a una tabla; no lo implementes sin aprobación.
3. **Interruptor `Usar matriz propia para cambios`** (apagado por defecto): copia la matriz actual y habilita su edición solo para cambios, con confirmación; al apagarlo vuelve a la compartida.
4. **Textos de ayuda por nivel** (tooltips) propios de cambios, editables; no alteran niveles ni matriz.
5. **Opciones:** `Permitir prioridad manual` (perfiles y justificación ≥15 caracteres) · `Recalcular prioridad al cambiar impacto o urgencia` (activo).
6. **Aclaración ITIL (se muestra en la pantalla):** la **prioridad** (impacto × urgencia) y el **riesgo** (cuestionario) son dimensiones independientes; la autoridad de aprobación se decide por tipo y riesgo (1.3.3.2.2).
7. **Botones:** `[Simulador]` · `[Ver dónde se usa]` · patrón común. Con matriz propia: `[Restaurar a la matriz compartida]`.

**Reglas:** con matriz propia, todas las celdas llenas y cada prioridad usada al menos una vez; recálculo opcional de RFC abiertas sin tocar prioridades manuales.

---

### 6.6 Pestaña 1.3.3.1.6 — Plantillas de RFC

**Qué se configura:** plantillas que prellenan el formulario. *No son modelos de cambio estándar:* la plantilla solo prellena datos y no concede autorización; el modelo (1.3.3.2.3) sí concede preautorización.

**Lista:** Nombre · Descripción · Activa · Tipo de cambio · Categoría · Visible para · Veces usada · Última modificación. Botones: `[+ Nueva plantilla]`; por fila `[Editar]` `[Duplicar]` `[Activar/Desactivar]` `[Eliminar]` (solo si nunca se usó).

**Editor (pestañas internas):**
1. **General:** nombre (5–80, único), descripción, activa, tipo de cambio y categoría sugeridos, perfiles que pueden usarla.
2. **Valores prellenados:** el formulario completo, con un interruptor **"Bloquear para que el usuario no lo cambie"** por campo. Solo se prellenan campos visibles.
3. **Pasos y tareas:** tabla de pasos del plan de implementación y paquete de tareas (1.3.3.3.6) con orden y offsets de vencimiento.
4. **Vista previa.**

**Comportamiento:** al elegir plantilla se llenan los campos; si el usuario ya escribió algo, se pregunta [Reemplazar] [Mantener los míos]. Plantillas de fábrica: sección 11.

---

### 6.7 Pestaña 1.3.3.1.7 — Vista del ticket

**Bloque 1 — Cabecera (hasta 10 elementos):** lista ordenable (sección 5.1); ID, título, tipo, estado y prioridad son fijos.
**Bloque 2 — Pestañas:** una fila por pestaña de la sección 5.4 con: orden · nombre (3–30) · visible · visible para perfiles · **visible desde el estado** · **editable en los estados** · **[Configurar campos…]** (visible, orden, etiqueta y solo lectura de cada campo de esa pestaña). *Solicitud*, *Comentarios y bitácora* e *Historial / auditoría* no pueden ocultarse; *Historial* solo con `cambios.auditoria.ver`.
**Bloque 3 — Panel lateral (5.3):** elementos visibles y orden.
**Bloque 4 — Barra de acciones:** arrastrar botones entre "Visibles" y "En menú ⋯". Los botones de transición y de aprobación se gestionan en 1.3.3.3.
**Botones:** `[Vista previa con RFC real]` (elige una existente) · `[Vista previa con ejemplo]` · patrón común.

---

## 7. PANTALLA 1.3.3.2 — TIPOS DE CAMBIO Y REQUISITOS

**Propósito:** definir cómo se comporta cada tipo de cambio (ITIL 4: estándar, normal, emergencia), quién autoriza según el riesgo y qué modelos preautorizados existen.

### 7.1 Pestaña 1.3.3.2.1 — Tipos de cambio

**Layout:** a la izquierda, tres tarjetas (Estándar, Normal, Emergencia) con color, ícono y resumen; a la derecha, el panel de configuración del tipo seleccionado con secciones plegables.

**Sección 1 — Identidad:** Nombre (renombrable), código (🔒 `estandar`, `normal`, `emergencia`), descripción (aparece como tooltip en el formulario), color, ícono. Los tres tipos **no se pueden eliminar ni desactivar**.

**Sección 2 — Quién puede solicitar:** perfiles (selector múltiple) y casilla "Exigir permiso especial `cambios.crear_emergencia`" (solo Emergencia, no se puede quitar).

**Sección 3 — Tiempos:**
- **Anticipación mínima** entre la solicitud y el inicio propuesto (horas): Estándar 24 · Normal 72 · Emergencia 0.
- **Duración máxima de la ventana** propuesta (horas).
- **Corte de agenda del CAB:** horas antes de la reunión hasta las cuales una RFC entra a esa agenda (aplica a Normal).
- **Caducidad de la autorización:** días después de la fecha de inicio aprobada tras los cuales, si no se inició, la autorización caduca y la RFC vuelve a *Autorizado* para reprogramar (Normal 7 · Estándar 30 · Emergencia 1).

**Sección 4 — Requisitos de campos (matriz):** tabla con una fila por campo del formulario y tres columnas (Estándar / Normal / Emergencia), cada celda con un selector **Oculto · Opcional · Obligatorio**. Reglas:
- Solo aparecen los campos cuya obligatoriedad base es "Según tipo de cambio" (1.3.3.1.1) y los campos personalizados con esa opción.
- **Mínimo normativo bloqueado (celdas con 🔒 en Obligatorio):** para Normal y Emergencia, siempre obligatorios: *Título, Descripción, Motivo, Servicio, CI, Impacto, Urgencia, Fechas propuestas, Plan de implementación, Plan de rollback, Grupo implementador*; para Emergencia además *Justificación de emergencia* y *Consecuencia*. Para Estándar, el contenido proviene del modelo y se exige que el modelo los complete.
- Botones: `[Copiar columna de…]` (copiar la configuración de un tipo a otro) y `[Restaurar matriz de fábrica]`.

**Sección 5 — Calendario y ventanas:** 
- *Política de ventana:* **Solo dentro de ventanas de mantenimiento** / **Puede salir de ventana con una etapa de aprobación adicional** / **Libre**. Fábrica: Estándar = dentro de ventana, Normal = puede salir con aprobación adicional, Emergencia = libre.
- *Períodos de congelamiento:* **Bloquear** / **Permitir con excepción aprobada (etapa "Excepción de congelamiento")** / **Ignorar**. Fábrica: Estándar = bloquear, Normal = excepción, Emergencia = excepción con ECAB.
- *Feriados:* **Bloquear** / **Advertir** / **Ignorar**.

**Sección 6 — Autorización:** muestra de solo lectura la secuencia de etapas resultante por nivel de riesgo (tomada de 1.3.3.2.2) con enlace `[Editar en Matriz de autoridad →]`.

**Sección 7 — Revisión post-implementación:** *Obligatoria siempre* / *Solo si el resultado no es exitoso o hubo incidentes asociados* / *Opcional* / *Por muestreo (% configurable)*. Fábrica: Normal = siempre, Emergencia = siempre, Estándar = solo si falla (más muestreo 10 %).

**Sección 8 — Documentación retroactiva (solo Emergencia):** permitir registro retroactivo (sí/no), plazo máximo para completar la documentación (horas, fábrica 24) y obligatoriedad de autorización retroactiva por ECAB/CAB.

**Sección 9 — Integración con ejecución:** exigir implementador asignado antes de programar (sí/no) · exigir plan de comunicación cuando hay interrupción (sí/no) · exigir checklist Go/No-Go completa para iniciar (sí/no, fábrica sí).

**Botones:** `[Restaurar tipo a valores de fábrica]` + patrón común.
**Validaciones:** Emergencia no puede tener anticipación mayor que Normal; Estándar no puede tener "Libre" en ventana si se exige modelo; todo valor numérico entero ≥ 0.

### 7.2 Pestaña 1.3.3.2.2 — Matriz de autoridad

**Qué se configura:** qué **etapas de aprobación** (catálogo de 1.3.3.3.3) se exigen según tipo, nivel de riesgo y otros criterios (ITIL 4: delegar la autoridad de cambio al nivel apropiado).

**Lista de reglas (orden = prioridad; gana la primera que coincida):** Orden · Nombre · Condiciones (resumen) · Etapas resultantes (chips ordenados, p. ej. `Técnica → Negocio → CAB`) · Activa. Botones `[+ Nueva regla]` `[Editar]` `[Duplicar]` `[Activar/Desactivar]` `[Eliminar]`, arrastre para reordenar, `[Simulador]`.

**Editor de regla:**
- **Nombre**, **Activa**.
- **Condiciones** (constructor): tipo de cambio · nivel de riesgo (uno o varios) · prioridad · criticidad máxima de CI o servicio · entorno · categoría · ¿requiere interrupción? · ¿duración de interrupción mayor que X? · ¿fuera de ventana? · ¿dentro de congelamiento? · número de CI afectados mayor que N · origen.
- **Etapas resultantes:** lista ordenable tomada del catálogo de etapas; por cada etapa se puede cambiar el **modo** respecto de la anterior (*Secuencial* o *En paralelo*) y marcarla **Opcional si…** (condición).
- **Sin aprobación (preautorizado):** opción válida solo para tipo Estándar con modelo aprobado y riesgo fijo Bajo.

**Simulador:** el admin elige tipo, riesgo, criticidad, entorno, etc., y ve la regla que coincide y la secuencia de etapas.

**Reglas de validación:** debe existir una regla comodín final; Emergencia nunca puede resolverse con "Sin aprobación"; toda regla debe llevar al menos una etapa salvo la preautorizada; segregación de funciones: el sistema avisa si una etapa solo puede ser satisfecha por el solicitante (ver 1.3.3.3.3).

**Reglas de fábrica:**
| # | Condiciones | Etapas |
|---|---|---|
| 1 | Estándar, riesgo Bajo, modelo aprobado | Sin aprobación (autorización por modelo) |
| 2 | Estándar con riesgo distinto de Bajo | Se reclasifica a Normal (1.3.3.2.4) |
| 3 | Emergencia (cualquier riesgo) | ECAB; después, revisión retroactiva por CAB |
| 4 | Normal, riesgo Bajo | Técnica → Gestor de Cambios |
| 5 | Normal, riesgo Medio | Técnica → Negocio → Gestor de Cambios |
| 6 | Normal, riesgo Alto | Técnica → Negocio → CAB |
| 7 | Normal, riesgo Crítico | Técnica → Negocio → CAB → Dirección |
| 8 | Comodín | CAB |

### 7.3 Pestaña 1.3.3.2.3 — Modelos de cambio estándar

**Qué se configura:** el catálogo de cambios estándar preautorizados (ITIL 4: modelos de cambio).

**Lista:** Nombre · Código · Categoría · Estado del modelo (Borrador / En revisión / Aprobado / Suspendido / Retirado) · Vigencia · Propietario · Veces usado · % éxito · Última revisión. Filtros por estado y categoría. Botones: `[+ Nuevo modelo]`; por fila `[Editar]` `[Duplicar]` `[Enviar a revisión]` `[Aprobar]` `[Suspender]` `[Retirar]` `[Ver uso]` (RFC que lo usaron).

**Editor de modelo (pantalla completa con pestañas internas):**
1. **General:** nombre (5–80, único), código, descripción, categoría, propietario (usuario), vigencia desde–hasta, estado (solo cambia por botones de flujo).
2. **Alcance:** servicios o clases de CI a los que aplica (selector múltiple) y entornos permitidos.
3. **Riesgo y autoridad:** nivel de riesgo fijo (típicamente Bajo), si se **autoriza automáticamente** o requiere una aprobación mínima (selector de etapa), y a quién se notifica al registrarse.
4. **Elegibilidad:** lista de casillas que el solicitante debe confirmar (texto de cada una, obligatoria).
5. **Contenido prellenado:** descripción, motivo, plan de implementación (con pasos), plan de pruebas, plan de rollback, criterios de éxito, duración típica; cada campo con interruptor "Bloqueado".
6. **Programación:** ventanas permitidas, anticipación propia (sustituye a la del tipo si es menor), **límite de frecuencia** (máximo N por CI por día/semana y N globales por día).
7. **Tareas:** paquete de tareas y checklist (1.3.3.3.6).
8. **Control de calidad automático:** *suspender el modelo si la tasa de fallo ≥ X % o ≥ N fallos en los últimos M días* (interruptor y valores; fábrica 10 % / 2 fallos / 90 días); al suspenderse, las nuevas solicitudes con ese modelo se reclasifican a Normal y se notifica al propietario y al Gestor de Cambios.
9. **Revisión periódica:** cada N meses (fábrica 6) con recordatorio; si vence sin revisión pasa a *En revisión*.

**Flujo del modelo:** Borrador → En revisión (lo envía el propietario) → Aprobado (lo aprueba el Gestor de Cambios y, si así se configura, el CAB) → Suspendido/Retirado. Solo los modelos *Aprobados* y vigentes aparecen en el formulario. Cada modelo guarda versiones; una modificación de un modelo aprobado crea una versión nueva que vuelve a pasar por aprobación (las RFC existentes conservan la versión con la que se crearon).

**Estadísticas del modelo:** veces usado, éxito/fallo, incidentes asociados, último uso (panel de solo lectura).

**Reglas:** un modelo no puede aprobarse con campos obligatorios de su tipo (Estándar) vacíos, sin plan de rollback ni sin elegibilidad; el riesgo fijo no puede ser superior al máximo permitido para estándar (configurable en 1.3.3.2.4, fábrica: Bajo).

### 7.4 Pestaña 1.3.3.2.4 — Reglas de clasificación

**Qué se configura:** reglas automáticas que reclasifican el tipo, elevan la autoridad, bloquean o advierten (ITIL 4: *keep it simple* en lo de bajo riesgo y control en lo de alto riesgo).

**Lista de reglas (orden = prioridad):** Orden · Nombre · Cuándo se evalúa · Condiciones · Acciones · Activa · Veces aplicada. Botones `[+ Nueva regla]` `[Editar]` `[Duplicar]` `[Activar/Desactivar]` `[Eliminar]` `[Simulador]`. Interruptor global "Aplicar todas las reglas que coincidan" / "Detener en la primera".

**Editor:**
- **Cuándo se evalúa:** al enviar · al cambiar tipo · al cambiar riesgo · al cambiar fechas · al agregar CI.
- **Condiciones:** mismos campos que el constructor de 1.3.3.2.2 más: *modelo estándar usado*, *fuera de anticipación mínima*, *CI con criticidad ≥ X*, *servicio crítico*.
- **Acciones:** *Reclasificar a tipo [X]* · *Sugerir tipo [X]* · *Agregar etapa de aprobación [Y]* · *Bloquear con mensaje* · *Advertir con mensaje* · *Exigir campo [Z]* · *Agregar etiqueta* · *Notificar a [roles]*.
- **Mensaje al usuario** (texto, 5–250) que explica por qué se aplicó.

**Parámetro adicional:** *Riesgo máximo permitido para un modelo estándar* (fábrica: Bajo).
**Conversión manual de tipo:** perfiles con `cambios.reclasificar_tipo`, motivo obligatorio, reinicia la evaluación y las etapas de aprobación y deja constancia en el historial.

**Reglas de fábrica:**
1. Estándar con riesgo > Bajo → reclasificar a Normal.
2. Estándar sobre CI de criticidad Alta o Crítica → reclasificar a Normal.
3. Normal con inicio antes de la anticipación mínima → bloquear con mensaje "Solicita el cambio como Emergencia o reprograma" (el botón de conversión a Emergencia queda disponible si el perfil tiene permiso).
4. Normal sobre CI productivo de criticidad alta fuera de ventana → agregar etapa "Excepción de ventana".
5. Cualquier tipo dentro de congelamiento según política → agregar etapa "Excepción de congelamiento".
6. Emergencia → etiqueta `Emergencia` y notificación inmediata al Gestor de Cambios.

---

## 8. PANTALLA 1.3.3.3 — FLUJO DE EVALUACIÓN, AUTORIZACIÓN Y REVISIÓN POSTERIOR

**Propósito:** definir el ciclo de vida del cambio (registro → evaluación → autorización → programación → implementación → revisión → cierre) y las reglas de control que lo gobiernan.

### 8.1 Pestaña 1.3.3.3.1 — Estados

**Tabla de estados (ordenable):**

| Columna | Detalle |
|---|---|
| Orden | Orden en filtros y selectores. |
| Nombre / Código | Único / inmutable. |
| Tipo | **Inicial** (exactamente 1) · **En evaluación** · **En autorización** · **Autorizado** · **Programado** · **En ejecución** · **Implementado** · **En pausa** · **Final**. |
| Color | Para insignias y calendario. |
| Reloj aplicable | **Evaluación** · **Autorización** · **Ninguno** (cuál de los plazos de 1.3.3.3.5 corre en ese estado) y si **corre / pausa / detiene**. |
| ¿Cuenta como abierto? | Sí/No. |
| ¿Permite editar la solicitud? | Sí / Solo comentarios y tareas / No. |
| ¿Aparece en el calendario? | Sí/No (los *Programado* y *En ejecución* siempre). |
| Aplica a tipos | Estándar / Normal / Emergencia (casillas). |
| Sistema (🔒) / Activo | |

**Botones:** `[+ Nuevo estado]` · por fila `[Editar]` `[Activar/Desactivar]` `[Eliminar]` · `[Reordenar]` · patrón común.

**Reglas:** exactamente 1 estado Inicial, al menos 1 *Implementado* y 1 *Final*; los estados 🔒 (*Solicitado, Autorizado, Programado, En ejecución, Implementado, Cerrado, Rechazado, Cancelado*) no se eliminan ni cambian de tipo (sí se renombran y recolorean); un estado con tickets no se desactiva sin asistente de migración (3.4).
**Estados de fábrica:** sección 11.

### 8.2 Pestaña 1.3.3.3.2 — Transiciones y acciones

**Vistas:** *Matriz* (filas = origen, columnas = destino, clic para crear/editar), *Diagrama* (grafo automático de solo lectura con zoom y [Exportar PNG], con filtro por tipo de cambio) y *Lista* (Acción · Origen → Destino · Aplica a tipos · Roles · Requisitos · Automatizaciones · Activa).

**Editor de transición (modal/panel lateral):**

| Propiedad | Control | Detalle |
|---|---|---|
| Nombre de la acción | Texto 3–30 | Texto del botón. |
| Estado(s) de origen / destino | Selector múltiple / lista | Destino especial **"Estado anterior"** para "Responder información". |
| **Aplica a tipos** | Casillas Estándar / Normal / Emergencia | Una misma acción puede existir con reglas distintas por tipo. |
| Perfiles autorizados | Selector múltiple | Más casillas contextuales: *Solicitante*, *Implementador*, *Evaluador asignado*, *Aprobador de la etapa vigente*, *Presidente del comité*, *Supervisor del grupo implementador*. |
| Condiciones previas | Constructor de reglas | Ej.: "sin conflictos bloqueantes", "todas las etapas aprobadas", "checklist Go/No-Go completa", "condiciones cumplidas", "dentro de ventana vigente", "sin congelamiento vigente". Si no se cumplen, botón deshabilitado con tooltip. |
| Campos obligatorios | Selector múltiple de campos y bloques | Se piden en un modal al ejecutar. |
| Comentario | Ninguno / Opcional / Obligatorio + visibilidad | |
| Confirmación | Interruptor + texto | |
| Apariencia | Color, ícono, orden | |
| Automatizaciones | Lista ordenable (abajo) | |
| Activa | Interruptor | |

**Automatizaciones disponibles:** asignar evaluador/implementador (reglas) · generar etapas de aprobación según la matriz de autoridad · notificar (evento y plantilla de 1.6.1) · crear tareas (paquete) · registrar fecha-hora en un campo · agendar en CAB/ECAB · reservar ventana en el calendario · validar calendario (conflictos) · pausar/reanudar relojes · crear incidente o problema (por fallo) · actualizar la CMDB · invalidar aprobaciones (ver 8.3) · marcar etiqueta · solicitar revisión.

**Reglas de validación del flujo (antes de publicar):** todo estado no final tiene una salida; todos los estados son alcanzables **para al menos un tipo**; desde todo estado existe un camino a un estado final **para cada tipo que lo use**; **ninguna transición hacia *En ejecución* puede carecer de las condiciones "todas las etapas aprobadas" y "sin congelamiento vigente" (salvo Emergencia con ECAB)**; toda transición a *Rechazado* y *Cancelado* exige motivo; toda transición a *Cerrado* exige código de cierre.

**Transiciones de fábrica:**

| Acción | Origen → Destino | Tipos | Roles | Requisitos y automatizaciones |
|---|---|---|---|---|
| Iniciar evaluación | Solicitado → En evaluación | Normal | Gestor de Cambios, Supervisor | Asigna evaluador. Inicia reloj de evaluación. |
| Autorizar por modelo | Solicitado → Autorizado | Estándar | Sistema | Solo si modelo aprobado y vigente, elegibilidad completa, riesgo Bajo, sin bloqueos de calendario. Registra "Autorizado por modelo". |
| Solicitar autorización de emergencia | Solicitado → En autorización | Emergencia | Sistema / Gestor de Cambios | Convoca al ECAB y notifica de inmediato. |
| Solicitar información | En evaluación / En autorización → En pausa | Todos | Evaluador, Aprobador de la etapa | Exige pregunta (comentario obligatorio). Pausa relojes. |
| Responder información | En pausa → Estado anterior | Todos | Solicitante | Exige respuesta. Reanuda relojes. |
| Enviar a autorización | En evaluación → En autorización | Normal | Evaluador | Exige riesgo evaluado, comentario técnico, recomendación y conflictos revisados. Genera las etapas de aprobación. |
| Aprobar etapa | (acción de aprobación) | Todos | Aprobador de la etapa | Ver 8.3. Cuando se aprueba la última etapa: En autorización → Autorizado (automática). |
| Rechazar | En autorización → Rechazado | Todos | Aprobador de la etapa | Exige motivo de rechazo del catálogo y comentario. |
| Reenviar con cambios | Rechazado → Solicitado | Todos | Solicitante | Solo si el motivo de rechazo permite reenvío; crea nueva versión y reinicia aprobaciones. |
| Programar | Autorizado → Programado | Todos | Gestor de Cambios, Supervisor, Implementador | Exige implementador, ventana válida (calendario sin bloqueos), tareas obligatorias creadas, plan de comunicación si hay interrupción. Reserva la ventana, crea tareas y comunicaciones programadas. |
| Reprogramar | Autorizado / Programado → Programado | Todos | Gestor de Cambios, Implementador | Exige motivo de aplazamiento y nueva ventana válida. Si el nuevo inicio difiere más de N horas (8.5) o cambia la ventana, invalida y reinicia las aprobaciones indicadas. |
| Iniciar implementación | Programado → En ejecución | Todos | Implementador | Exige: Go/No-Go = Go, condiciones de aprobación cumplidas, sin congelamiento vigente, estar dentro de la ventana (± tolerancia de 1.3.3.4.5). Registra inicio real. |
| Registrar resultado | En ejecución → Implementado | Todos | Implementador | Exige resultado, fin real, bitácora, interrupción real; si resultado = Fallido o Rollback exige causa de fallo y dispara las acciones de 8.7. |
| Documentar emergencia retroactiva | Solicitado → Implementado | Emergencia | Gestor de Cambios, Supervisor, Técnico con permiso | Solo con `cambios.documentar_retroactivo`; exige los campos de la Sección G; crea etapa de autorización retroactiva. |
| Iniciar revisión | Implementado → En revisión post-implementación | Todos | Gestor de Cambios, Supervisor / Automática | Automática N horas después de *Implementado* (8.8). |
| Completar revisión y cerrar | En revisión post-implementación → Cerrado | Todos | Revisor | Exige PIR completa (si aplica), código de cierre, CMDB confirmada (8.7). |
| Cerrar sin revisión | Implementado → Cerrado | Estándar y los que el tipo permita | Gestor de Cambios, Supervisor | Solo si el resultado es exitoso y el tipo no exige PIR. |
| Cancelar | Cualquier estado anterior a *En ejecución* → Cancelado | Todos | Solicitante (si aún no está *En autorización*), Gestor de Cambios, Administrador | Exige motivo. Libera la ventana y notifica. |

### 8.3 Pestaña 1.3.3.3.3 — Etapas de aprobación y reglas de decisión

**Catálogo de etapas** (tabla): Orden sugerido · Nombre · Código · Tipo de aprobador · Regla de decisión · Plazo · Activa. Botones `[+ Nueva etapa]` `[Editar]` `[Duplicar]` `[Desactivar]` `[Eliminar]` (solo si no está en uso en reglas ni RFC).

**Editor de etapa:**
- **Nombre y descripción.**
- **Tipo de aprobador:** *Perfil* (selector, p. ej. Aprobador, Gestor de Cambios) · *Usuario(s) concreto(s)* · *Rol contextual*: **Supervisor del grupo implementador** · **Gestor de Área del departamento afectado** (resuelve con las áreas de la RFC; si hay varias, cada área aporta un aprobador) · **Responsable del servicio afectado** (si el catálogo lo define) · **Gestor de Activos y Configuración** (cuando la RFC afecta CI de ciertas clases) · **Comité** (CAB o ECAB, 8.4).
- **Regla de decisión:** *Cualquiera* · *Todos* · *Mayoría simple* · *Mínimo N de M*. Para comités, la regla se toma de 8.4.
- **Plazo de respuesta** (horas) según prioridad y tipo (tabla pequeña) y acciones al vencer (8.5).
- **Acciones permitidas al aprobador:** Aprobar · Aprobar con condiciones · Rechazar (motivo del catálogo obligatorio) · Solicitar información · Delegar · Abstenerse (solo comités). Cada una activable.
- **Condiciones:** si se permite aprobar con condiciones, el texto de la condición es obligatorio, se convierte en ítem de la lista "Condiciones pendientes" (5.4.3) y **bloquea** *Iniciar implementación* hasta marcarse como cumplida por el responsable indicado.
- **Delegación:** permitida (sí/no); a quién (mismo perfil / lista); duración máxima; la persona delegada queda registrada.
- **Invalidar la aprobación si cambia:** casillas de campos críticos (fechas, CI, servicios, tipo, riesgo, plan de implementación, plan de rollback, ventana). Si cambia alguno, esta etapa y las posteriores vuelven a *Pendiente* y se notifica.
- **Omitir la etapa si:** condición opcional (ej. "no hay áreas afectadas").
- **Modo respecto de la etapa anterior:** secuencial o paralelo (lo decide la matriz de autoridad, aquí se define el valor por defecto).

**Segregación de funciones (interruptores globales, con valor de fábrica activo y no desactivables en producción sin permiso `config.cambios.flujo.publicar` y motivo reforzado):**
1. El **solicitante no puede aprobar** su propia RFC.
2. El **implementador no puede aprobar** la RFC que va a implementar.
3. Una misma persona **no puede aprobar dos etapas** de la misma RFC (salvo que sea la única elegible y se registre la excepción con motivo y aprobación de un superior).
4. Quien registra una emergencia retroactiva no puede dar la autorización retroactiva.
5. **Si una etapa no tiene aprobador elegible** (por ejemplo, el solicitante es el único Supervisor), pasa automáticamente al **aprobador de respaldo** configurado (perfil o usuario) y se registra.

**Botones:** `[Simulador de etapas]` (elegir tipo, riesgo, áreas, etc. y ver los aprobadores reales resueltos para cada etapa) + patrón común.

### 8.4 Pestaña 1.3.3.3.4 — Comités (CAB y comité de emergencia)

Dos paneles con la misma estructura: **CAB** y **ECAB**.

**Composición** (tabla): Usuario · Rol en el comité (**Presidente · Secretario · Miembro con voto · Consultor sin voto · Observador**) · Perfil de origen · Suplente (usuario) · Activo. Botones `[+ Agregar miembro]` `[Editar]` `[Quitar]`. Perfiles sugeridos: Gestor de Cambios (presidente), Aprobador, Supervisor, Gestor de Activos y Configuración (con voto); Auditor (observador sin voto); Gestor de Área (consultor/miembro cuando el cambio afecta su área). El sistema valida que haya exactamente 1 presidente activo y que el suplente no sea el mismo usuario.

**Reglas de decisión:**
- *Quórum:* número mínimo de miembros con voto presentes o votantes (CAB fábrica 3; ECAB fábrica 2) y obligación de que esté el presidente o su suplente.
- *Regla de aprobación:* **Mayoría simple · Mayoría calificada (2/3) · Unanimidad** (CAB fábrica mayoría simple; ECAB fábrica 2 de 3 convocados).
- *Empate:* **voto de calidad del presidente** / **aplazar**.
- *Voto asíncrono:* permitir votar sin reunión (sí/no) con plazo en horas; el sistema cierra la votación al alcanzar la regla o al vencer el plazo.
- *Opciones de dictamen:* Aprobar · Aprobar con condiciones · Rechazar · Aplazar · Solicitar más información (activables).
- *Abstenciones:* cuentan / no cuentan para el quórum.
- *Conflicto de interés:* el miembro que solicitó, implementa o pertenece al grupo implementador de la RFC **no vota** (se excluye automáticamente y se registra).

**Reuniones del CAB:** frecuencia (semanal/quincenal/mensual), día, hora, duración, lugar o enlace, **corte de agenda** (horas antes), generación automática de la agenda (RFC *En autorización* con etapa CAB pendiente, ordenadas por prioridad y fecha de inicio), recordatorio a miembros, plantilla de acta (texto con variables: fecha, asistentes, quórum, RFC tratadas, votos, dictamen, condiciones, observaciones) y generación de PDF. Botón `[Convocar reunión extraordinaria]`.

**ECAB:** miembros mínimos convocados, **plazo máximo de decisión** por prioridad (horas), canal de convocatoria inmediata (notificación y correo), forma de **registrar decisión verbal** (campos: quién, medio, hora) y **obligación de revisión retroactiva** por el CAB en la siguiente reunión (sí/no, fábrica sí).

**Delegados por ausencia:** al convocar o votar, si un miembro tiene una ausencia vigente (tabla `tecnico_ausencias` si ya existe; si no existe, ver sección 13) o no responde en el plazo, interviene su suplente automáticamente.

**Datos que alimentan `5.2.1 Dictamen colegiado CAB`:** composición vigente, agenda, votos por miembro, dictamen, condiciones y acta.

**Botones:** `[Probar quórum]` (simula quién puede votar una RFC dada) + patrón común.

### 8.5 Pestaña 1.3.3.3.5 — Plazos y escalamiento

**Tabla de plazos** (filas = prioridades P1–P4; unidad: horas; columnas por tipo si se desea con el selector "Ver por tipo: Todos/Estándar/Normal/Emergencia"):

| Columna | Detalle |
|---|---|
| Primera respuesta | Hasta iniciar la evaluación (o convocar el ECAB en Emergencia). |
| Evaluación | Hasta enviar a autorización. |
| Autorización total | Desde *En autorización* hasta *Autorizado*. |
| Plazo por etapa | Valor por defecto si la etapa no define el suyo (8.3). |

**Parámetros adicionales:** horas de diferencia a partir de las cuales una reprogramación **exige reautorización** (fábrica 24); tolerancia para iniciar la implementación fuera de la hora propuesta (minutos); vigencia de una autorización (ver 7.1, sección 3).

**Cómputo del tiempo:** el mismo del motor de SLA existente (horas corridas u hábiles; se verifica en la Etapa 0). No se crea un calendario laboral nuevo aquí (los feriados de 1.3.3.4.4 solo se usan para el calendario de cambios).

**Reglas de escalamiento** (lista y editor): Objetivo (Primera respuesta / Evaluación / Autorización / Etapa específica) · Prioridades · Umbral (porcentaje de plazo o "vencido +N horas") · Acciones: notificar a (solicitante, evaluador, aprobador pendiente, Gestor de Cambios, Supervisor, grupo, dirección) · reasignar al **suplente** · reasignar al **superior jerárquico** · subir prioridad · etiqueta `En riesgo` / `Vencido` · comentario del sistema · repetir cada N horas hasta M veces · detener cuando cambie el estado. **Nunca existe la acción "aprobar automáticamente" por vencimiento** (no es configurable).
Botón `[Simular escalamiento]`.
**Fábrica:** 75 % → recordar al aprobador; 90 % → notificar al suplente y al Gestor de Cambios; 100 % → etiqueta *Vencido* + escalar al superior; en Emergencia, a los 30 minutos sin decisión del ECAB → notificar a dirección.

### 8.6 Pestaña 1.3.3.3.6 — Tareas y checklists

**Sección A — Catálogo de tareas** (tabla): Nombre · Fase (**Pre-implementación · Implementación · Validación · Post-implementación**) · Tipo · Responsable (rol/grupo/"implementador") · Duración · Obligatoria · Activa. Editor: nombre, descripción, fase, responsable, duración, **vence a ±N horas respecto del inicio de la ventana** (offset positivo o negativo), obligatoria, **bloquea la transición** (selector), checklist interno, dependencia (finaliza-para-iniciar). Botones `[+ Nueva tarea]` `[Editar]` `[Duplicar]` `[Desactivar]` `[Eliminar]`.

**Sección B — Paquetes de tareas** (tabla): Nombre · Tareas · Se aplica cuando (tipo, categoría, riesgo, modelo, plantilla, estado de entrada) · Activo. Editor: arrastrar tareas del catálogo, orden y dependencias. `[Probar paquete]`.

**Sección C — Checklist Go/No-Go** (editable): lista de ítems con texto, obligatorio, responsable, evidencia requerida (sí/no) y tipos de cambio a los que aplica. De fábrica: sección 11. Configuración del resultado: *Go* solo si todos los ítems obligatorios están marcados; *No-Go* exige motivo y devuelve la RFC a *Autorizado* para reprogramar.

**Sección D — Conversión del plan en tareas:** interruptor "Convertir los pasos del plan de implementación en tareas al programar" (activo) y fase por defecto de esas tareas.

### 8.7 Pestaña 1.3.3.3.7 — Implementación y cierre

**Bloque 1 — Resultado y bitácora:** campos exigidos al registrar resultado según el catálogo (6.3); obligatoriedad de bitácora de ejecución (sí/no); tolerancia de inicio y fin respecto a la ventana; exigir motivo si la ejecución supera la ventana.

**Bloque 2 — Acciones automáticas por resultado** (tabla: resultado → acciones, cada una activable):
- *Fallido / Rollback ejecutado:* exigir causa de fallo · crear **incidente** vinculado (plantilla, prioridad heredada) · crear **problema** (plantilla del Prompt 1 si existe) cuando la causa de fallo lo sugiere · notificar a Gestor de Cambios, Supervisor y responsables de servicios · etiquetar la RFC y los CI · **suspender el modelo estándar** si aplica (7.3) · forzar PIR obligatoria.
- *Parcial:* exigir descripción de lo pendiente y crear RFC de seguimiento (opcional).
- *Exitoso:* programar PIR según el tipo.

**Bloque 3 — Actualización de CMDB (ITIL 4: Service Configuration Management):**
- `Exigir plan de actualización de CMDB` (lista de cambios sobre CI: CI, atributo, valor nuevo) antes de *Programar* (sí/no, fábrica sí cuando el cambio modifica atributos).
- `Aplicar automáticamente a la CMDB al registrar resultado Exitoso` (sí/no, fábrica no: la aplica el Gestor de Activos y Configuración con **[Aplicar a la CMDB]**).
- `Bloquear el cierre si hay actualizaciones de CMDB pendientes` (sí).
- Notificar al Gestor de Activos y Configuración cuando haya actualizaciones pendientes.

**Bloque 4 — Cierre:** exigir código de cierre (catálogo) · exigir resumen · cierre automático N días después de *Implementado* si el tipo no exige PIR (fábrica 5) · reglas de reapertura: no se reabre una RFC cerrada (se crea otra vinculada); excepción por el Gestor de Cambios dentro de N días con motivo.
**Botones:** `[Vista previa de modales]` + patrón común.

### 8.8 Pestaña 1.3.3.3.8 — Revisión post-implementación (PIR)

**Cuándo es obligatoria:** se rige por el tipo (7.1), el resultado, el riesgo ≥ X y las reglas de muestreo; esta pestaña muestra la tabla consolidada tipo × resultado × riesgo → obligatoria (sí/no) y la edita.
**Parámetros:** plazo para completarla (días tras *Implementado*, fábrica 5) · quién revisa (Gestor de Cambios / Supervisor / perfil concreto; **nunca el implementador**) · **ventana de observación de incidentes** (horas tras el fin real, fábrica 72) para detectar automáticamente los incidentes creados sobre los CI afectados · calificaciones (Exitoso / Con observaciones / Fallido) · bloqueo del cierre hasta completar la PIR (sí).
**Plantilla de preguntas (editable):** lista con texto, tipo de respuesta (texto, sí/no, lista, escala), obligatoriedad y tipos a los que aplica. `[+ Agregar pregunta]` `[Reordenar]` `[Desactivar]`. Fábrica: sección 11.
**Acciones de mejora:** crear tareas de seguimiento con responsable y fecha (activo); exportar informe PDF.
**Botones:** `[Vista previa de la PIR]` + patrón común.

---

## 9. PANTALLA 1.3.3.4 — NOTIFICACIONES Y CALENDARIO DE CAMBIOS

**Propósito:** definir quién se entera de qué y cuándo, y gobernar el calendario de cambios (ventanas, congelamientos, feriados, conflictos y capacidad).
**Nota:** hoy no existen calendarios ni feriados en el sistema. Las tablas de las pestañas 9.2 a 9.4 son **nuevas y compartidas** (`calendario_feriados`, `ventanas_mantenimiento`, `periodos_congelamiento`; sección 13) para que otros módulos puedan reutilizarlas. No modifiques el motor de SLA existente.

### 9.1 Pestaña 1.3.3.4.1 — Notificaciones

**Cuadrícula:** una fila por **evento** y las columnas: Evento · Activo · Canal(es) (según los canales de 1.6.1) · Destinatarios · Plantilla (selector de 1.6.1) · Condiciones (tipo, riesgo, prioridad) · Anticipación (si aplica). Botón `[Editar]` por fila, `[Enviar prueba]` y `[Vista previa]`.

**Eventos:** `rfc.solicitada` · `rfc.evaluacion_iniciada` · `rfc.informacion_solicitada` · `rfc.informacion_respondida` · `rfc.enviada_a_autorizacion` · `rfc.etapa_pendiente` (al aprobador) · `rfc.etapa_aprobada` · `rfc.aprobada` · `rfc.aprobada_con_condiciones` · `rfc.rechazada` · `rfc.reenviada` · `cab.convocado` (agenda) · `cab.dictamen_emitido` · `ecab.convocado` · `rfc.programada` · `rfc.reprogramada` · `rfc.recordatorio_previo` (T-48 h, T-24 h, T-1 h; configurables) · `rfc.implementacion_iniciada` · `rfc.resultado_registrado` · `rfc.fallida` · `rfc.rollback_ejecutado` · `rfc.pir_pendiente` · `rfc.cerrada` · `rfc.cancelada` · `rfc.conflicto_detectado` · `rfc.emergencia_registrada` · `rfc.aprobacion_proxima_a_vencer` · `rfc.aprobacion_vencida` · `rfc.autorizacion_caducada` · `modelo_estandar.suspendido` · `congelamiento.proximo` · `ventana.proxima`.

**Destinatarios disponibles:** solicitante · implementador · equipo implementador · evaluador · aprobadores de la etapa · miembros del comité · Gestor de Cambios · Supervisor del grupo · responsables de los servicios afectados · Gestores de Área de las áreas afectadas · Gestor de Activos y Configuración (CMDB) · **usuarios de las áreas afectadas** (comunicado de interrupción) · seguidores · usuarios o perfiles concretos.

**Comunicado de interrupción a usuarios:** interruptor, plantilla, momentos de envío (fábrica T-48 h y T-2 h) y audiencia (áreas afectadas de la RFC); se genera solo si `requiere_interrupcion = Sí` y la RFC está *Programada*.
**Opciones:** agrupar avisos en resumen diario (digest) para eventos de baja urgencia · horas de silencio (excepto emergencias) · no notificar al propio autor de la acción.
**Regla:** los eventos de Emergencia y de fallo no pueden desactivarse para el Gestor de Cambios.

### 9.2 Pestaña 1.3.3.4.2 — Ventanas de mantenimiento

**Lista:** Nombre · Recurrencia · Horario · Aplica a · Tipos permitidos · Capacidad · Vigencia · Activa. Botones `[+ Nueva ventana]` `[Editar]` `[Duplicar]` `[Activar/Desactivar]` `[Eliminar]`, vista previa en calendario.

**Editor:**
- **Nombre**, **código**, **descripción**.
- **Recurrencia:** *Única (fecha)* · *Diaria* · *Semanal (días)* · *Mensual (n-ésimo día de semana o día del mes)* · *Anual*.
- **Hora de inicio y fin** (soporta cruce de medianoche), en la zona horaria del sistema.
- **Vigencia** (desde–hasta) y excepciones (fechas puntuales en que no aplica).
- **Aplica a:** toda la organización / servicios concretos / clases de CI / entornos / departamentos.
- **Tipos de cambio permitidos** (casillas).
- **Capacidad:** máximo de cambios simultáneos en la ventana y máximo acumulado por ventana.
- **¿Permite interrupción del servicio?** (sí/no) y **¿se permite en feriados?** (sí/no).
- **Color** para el calendario.

**Validaciones:** inicio ≠ fin; recurrencia coherente; vigencia válida; nombre único.

### 9.3 Pestaña 1.3.3.4.3 — Períodos de congelamiento

**Lista:** Nombre · Motivo · Inicio–Fin · Alcance · Severidad · Recurrencia · Activo. Botones `[+ Nuevo período]` `[Editar]` `[Duplicar]` `[Activar/Desactivar]` `[Eliminar]` `[Importar CSV]` `[Exportar CSV]`.
**Editor:** nombre; motivo (lista editable: cierre contable, campaña, fin de año, evento institucional, auditoría, otro) y descripción; inicio y fin (fecha y hora) o recurrencia anual (mes/día); **alcance** (toda la organización / servicios / CI / departamentos); **severidad**: *Bloqueo total* (solo Emergencia con ECAB) · *Bloqueo con excepción* (requiere la etapa "Excepción de congelamiento") · *Advertencia*; **tipos exentos**; aviso anticipado a Gestor de Cambios y solicitantes (días antes); color.
**Efecto:** el formulario (E6), `Programar` e `Iniciar implementación` consultan estos períodos en el servidor.

### 9.4 Pestaña 1.3.3.4.4 — Feriados y días no laborables

**Lista:** Fecha · Nombre · Tipo (nacional/institucional/otro) · Alcance (toda la organización/sede) · Recurrente anual · Activo. Botones `[+ Nuevo feriado]` `[Editar]` `[Eliminar]` `[Importar CSV]` (plantilla descargable con vista previa de errores) `[Exportar CSV]`. Soporta rangos de fechas.
**Política:** *Bloquear / Advertir / Ignorar* cambios en feriados (valor por tipo en 7.1) y fin de semana (sí/no, definible como "días no laborables" de la semana).
**Nota:** la tabla es compartida y queda disponible para otros procesos.

### 9.5 Pestaña 1.3.3.4.5 — Conflictos y capacidad

**Reglas de detección** (tabla; cada una con *Activa* y *Severidad* **Bloquear / Advertir / Ignorar**, configurable por tipo de cambio):

| Conflicto | Descripción | Parámetros |
|---|---|---|
| Mismo CI | Otra RFC programada sobre el mismo CI con ventanas solapadas | Colchón en minutos entre cambios (fábrica 60) |
| Mismo servicio | Otra RFC sobre el mismo servicio | Solo si el servicio es crítico (sí/no) |
| CI relacionados | RFC sobre CI dependientes según relaciones de la CMDB | Profundidad de relaciones 1–3 (fábrica 1); tipos de relación a considerar |
| Mismo implementador | El implementador tiene otra RFC en horario solapado | |
| Fuera de ventana | Rango fuera de las ventanas aplicables | |
| Congelamiento | Dentro de un período de congelamiento | Según severidad del período |
| Feriado / fin de semana | | Según 9.4 |
| Capacidad | Excede el máximo de cambios simultáneos | Máximos: **global** (fábrica 5), **por servicio crítico** (2), **por CI** (1), **por ventana** (de la ventana), **por día** (10) |

**Otros parámetros:** duración máxima de una RFC (horas) · tolerancia de inicio (minutos) · quién puede conceder **excepción de conflicto** (perfil con `cambios.excepcion_conflicto`; exige motivo y queda en la bitácora y en la pestaña Evaluación).
**Cuándo se ejecuta:** al enviar, al editar fechas/CI, al programar, al iniciar la implementación y en un **proceso programado** (cada hora) que reevalúa las RFC futuras y notifica si aparece un conflicto nuevo.
**Botón `[Simulador]`:** elegir fecha, hora, duración, servicio y CI; muestra conflictos y huecos libres. El cálculo de solapamientos se hace con rangos de tiempo en la base de datos (ver 13.5).

### 9.6 Pestaña 1.3.3.4.6 — Presentación del calendario

**Qué se configura:** cómo se muestra `5.1.2 Calendario de ventanas`.
- **Colores:** por tipo de cambio, por estado o por nivel de riesgo (selector de criterio y paleta editable).
- **Vistas disponibles y por defecto:** Mes · Semana · Día · Agenda (lista) · Línea de tiempo por servicio.
- **Capas visibles por defecto** (casillas): RFC programadas y en ejecución · ventanas de mantenimiento · períodos de congelamiento · feriados · reuniones de CAB.
- **Filtros por defecto:** tipo, servicio, categoría, riesgo, área, implementador.
- **Contenido del tooltip y de la tarjeta:** campos a mostrar (ID, título, tipo, estado, riesgo, ventana, implementador, servicios).
- **Quién ve qué:** capas y datos visibles por perfil (ej. un perfil sin acceso a la RFC solo ve "Mantenimiento programado" con servicio y horario).
- **Recordatorios previos:** tiempos (T-48 h, T-24 h, T-1 h) — se usan también en 9.1.
- **Exportación ICS:** permitir suscripción por enlace con token (sí/no), qué capas incluye y caducidad del token.
- **Densidad y primer día de la semana.**
**Botones:** `[Vista previa]` + patrón común.

---

## 10. Perfiles y permisos

**Perfiles existentes (1.1.2):** Administrador · Técnico · Solicitante · Supervisor · Gestor de Área · Auditor · Aprobador · Gestor de Cambios · Gestor de Activos y Configuración. (Si el Prompt 1 ya creó **Gestor de Problemas**, también existe.) **No se crean perfiles nuevos en este prompt.**

Por cada pantalla de configuración hay tres permisos: `ver`, `editar` (guardar borrador) y `publicar`. Un usuario con `editar` sin `publicar` guarda borradores; otro con `publicar` los revisa y publica. Las transiciones y etapas pueden restringir más, nunca ampliar, lo que otorgan estos permisos.

**Columnas:** ADM = Administrador · TEC = Técnico · SOL = Solicitante · SUP = Supervisor · GAR = Gestor de Área · AUD = Auditor · APR = Aprobador · GCA = Gestor de Cambios · GAC = Gestor de Activos y Configuración · GPR = Gestor de Problemas (si existe).

| Permiso | ADM | TEC | SOL | SUP | GAR | AUD | APR | GCA | GAC | GPR |
|---|---|---|---|---|---|---|---|---|---|---|
| `config.cambios.formulario.ver` / `.tipos.ver` / `.flujo.ver` / `.calendario.ver` | ✔ | — | — | ✔ | — | ✔ | — | ✔ | — | — |
| `config.cambios.formulario.editar` / `.tipos.editar` / `.flujo.editar` | ✔ | — | — | — | — | — | — | — | — | — |
| `config.cambios.formulario.publicar` / `.tipos.publicar` / `.flujo.publicar` | ✔ | — | — | — | — | — | — | — | — | — |
| `config.cambios.calendario.editar` / `.publicar` (solo 1.3.3.4.2 a 1.3.3.4.4) | ✔ | — | — | — | — | — | — | ✔ | — | — |
| `config.cambios.importar_exportar` / `.restaurar_fabrica` | ✔ | — | — | — | — | — | — | — | — | — |
| `cambios.crear` | ✔ | ✔ | — | ✔ | ✔ (solo Normal) | — | — | ✔ | ✔ | ✔ |
| `cambios.crear_emergencia` | ✔ | ✔ | — | ✔ | — | — | — | ✔ | — | ✔ |
| `cambios.ver` | ✔ (todas) | ✔ (su grupo y las que implementa) | — | ✔ (todas) | ✔ (las que afectan su área) | ✔ (todas, solo lectura) | ✔ (las que debe aprobar) | ✔ (todas) | ✔ (las que afectan CI) | ✔ (las vinculadas a problemas) |
| `cambios.editar` | ✔ | ✔ (propias, en Solicitado y En evaluación; y tareas asignadas) | — | ✔ | — | — | — | ✔ | — | — |
| `cambios.evaluar` | ✔ | — | — | ✔ | — | — | — | ✔ | ✔ (impacto en CMDB) | — |
| `cambios.aprobar` (acciones de etapa) | — | — | — | ✔ | ✔ | — | ✔ | ✔ | — | — |
| `cambios.dictaminar_cab` | — | — | — | ✔ | — | — | ✔ | ✔ | ✔ | — |
| `cambios.programar` | ✔ | — | — | ✔ | — | — | — | ✔ | — | — |
| `cambios.implementar` (iniciar y registrar resultado) | ✔ | ✔ | — | ✔ | — | — | — | ✔ | ✔ (cambios de activos) | — |
| `cambios.revisar_pir` | ✔ | — | — | ✔ | — | — | — | ✔ | — | — |
| `cambios.cerrar` | ✔ | — | — | ✔ | — | — | — | ✔ | — | — |
| `cambios.cancelar` | ✔ | — | ✔ (propias, antes de En autorización) | ✔ | — | — | — | ✔ | — | — |
| `cambios.reclasificar_tipo` | — | — | — | — | — | — | — | ✔ | — | — |
| `cambios.excepcion_conflicto` | — | — | — | — | — | — | — | ✔ | — | — |
| `cambios.documentar_retroactivo` | ✔ | ✔ | — | ✔ | — | — | — | ✔ | — | — |
| `cambios.prioridad_manual` / `cambios.ajustar_riesgo` | — | — | — | ✔ | — | — | — | ✔ | — | — |
| `cambios.aplicar_cmdb` | — | — | — | — | — | — | — | — | ✔ | — |
| `cambios.auditoria.ver` | ✔ | — | — | ✔ | — | ✔ | — | ✔ | — | — |
| `modelos_estandar.ver` | ✔ | ✔ | — | ✔ | — | ✔ | — | ✔ | ✔ | — |
| `modelos_estandar.editar` | ✔ | — | — | — | — | — | — | ✔ | — | — |
| `modelos_estandar.aprobar` | — | — | — | — | — | — | ✔ | ✔ | — | — |
| `calendario_cambios.ver` (5.1.2) | ✔ | ✔ | — | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |

**Notas:** el Administrador **no aprueba ni dictamina** por defecto (segregación de funciones). Pertenecer a un comité (CAB/ECAB) se define en 1.3.3.3.4 y no equivale a un perfil. Los perfiles se resuelven con el mecanismo de permisos ya existente en el proyecto; si ese mecanismo no maneja permisos por acción, repórtalo en la Etapa 0.

---

## 11. Datos semilla (valores de fábrica)

**Orígenes:** Problema (exige ticket) · Incidente (exige ticket) · Solicitud de servicio (exige ticket) · Mejora · Proyecto · Requisito normativo o de auditoría · Mantenimiento preventivo · Parche o actualización del fabricante · Otro.

**Categorías de cambio (categoría > subcategoría):** Hardware (Servidores, Equipos de usuario, Almacenamiento, Periféricos) · Software y aplicaciones (Aplicación de negocio, Sistema operativo, Base de datos, Ofimática) · Red y comunicaciones (LAN/WLAN, WAN/Internet, Telefonía, VPN) · Infraestructura (Virtualización, Centro de datos, Respaldo, Energía y climatización) · Seguridad (Accesos y permisos, Firewall, Certificados, Parches de seguridad) · Procesos y documentación · Proveedor o tercero · Otros.

**Entornos:** Producción (peso 3, productivo) · Preproducción (2) · Pruebas (1) · Desarrollo (0).

**Resultados de implementación (🔒):**
| Resultado | Éxito | Exige causa de fallo | Exige PIR | Acciones de fallo |
|---|---|---|---|---|
| Exitoso | Sí | No | Según tipo | No |
| Parcial | No | No | Sí | No |
| Fallido | No | Sí | Sí | Sí |
| Rollback ejecutado | No | Sí | Sí | Sí |
| Cancelado en ejecución | No | Sí | Sí | No |

**Códigos de cierre:** Implementado con éxito · Implementado con observaciones · Implementado parcialmente · Fallido – revertido · Fallido – sin reversión · Cancelado antes de ejecutar · Rechazado · Emergencia documentada.
**Motivos de rechazo:** Riesgo no aceptable · Información insuficiente · Plan de rollback inadecuado · Conflicto con otros cambios o calendario · Sin justificación de negocio · Fuera de alcance o autoridad · Duplicado.
**Motivos de aplazamiento:** Cambio de prioridades del negocio · Conflicto de calendario · Recurso no disponible · Dependencia no cumplida · Falla en pruebas previas · Solicitud del negocio · Período de congelamiento.
**Causas de fallo:** Error en el plan · Plan incompleto · Error humano durante la ejecución · Falla de hardware · Defecto de software · Dependencia no identificada · Pruebas insuficientes · Falla de proveedor · Condición ambiental · Otra.
**Tipos de dependencia (🔒):** Bloquea a / Es bloqueada por · Relacionada · Duplicada de / Duplicada por · Seguimiento de / Tiene seguimiento.
**Medios de autorización de emergencia:** Llamada telefónica · Mensajería instantánea · Correo · Presencial · Otro.

**Tipos de cambio (🔒):** Estándar (anticipación 24 h; ventana: dentro; congelamiento: bloquear; PIR: solo si falla + muestreo 10 %) · Normal (72 h; puede salir de ventana con aprobación; congelamiento: excepción; PIR: siempre) · Emergencia (0 h; libre; congelamiento: excepción con ECAB; PIR: siempre; retroactivo permitido, 24 h).

**Estados de fábrica:**
| Orden | Estado | Tipo | Reloj | ¿Abierto? | Editable | Tipos | 🔒 |
|---|---|---|---|---|---|---|---|
| 1 | Solicitado | Inicial | Evaluación (corre) | Sí | Sí | Todos | Sí |
| 2 | En evaluación | En evaluación | Evaluación (corre) | Sí | Sí | Normal | |
| 3 | En pausa | En pausa | Pausa de ambos | Sí | Solo comentarios | Todos | |
| 4 | En autorización | En autorización | Autorización (corre) | Sí | Solo comentarios y tareas | Todos | |
| 5 | Autorizado | Autorizado | Ninguno | Sí | Solo comentarios y tareas | Todos | Sí |
| 6 | Programado | Programado | Ninguno | Sí | Solo comentarios y tareas | Todos | Sí |
| 7 | En ejecución | En ejecución | Ninguno | Sí | Solo comentarios y bitácora | Todos | Sí |
| 8 | Implementado | Implementado | Ninguno | Sí | Solo comentarios | Todos | Sí |
| 9 | En revisión post-implementación | Implementado | Ninguno | Sí | Solo la revisión | Todos | |
| 10 | Cerrado | Final | Ninguno | No | No | Todos | Sí |
| 11 | Rechazado | Final | Ninguno | No | No | Todos | Sí |
| 12 | Cancelado | Final | Ninguno | No | No | Todos | Sí |

**Etapas de aprobación (catálogo):**
| Etapa | Aprobador | Regla | Plazo |
|---|---|---|---|
| Técnica | Supervisor del grupo implementador | Cualquiera | 24 h |
| Negocio | Gestor de Área del departamento afectado (uno por área) | Todos | 48 h |
| Gestor de Cambios | Perfil Gestor de Cambios | Cualquiera | 24 h |
| CAB | Comité CAB | Según comité | 168 h |
| ECAB | Comité de emergencia | Según comité | 2 h |
| Dirección | Perfil Aprobador | Cualquiera | 48 h |
| Excepción de ventana | Perfil Aprobador | Cualquiera | 24 h |
| Excepción de congelamiento | Perfil Aprobador | Cualquiera | 24 h |
| Autorización retroactiva | Comité CAB | Según comité | 24 h |
| Autorización por modelo | Sistema | Automática | — |

**Cuestionario de riesgo de fábrica** (puntaje máximo 44; niveles: **Bajo 0–10 · Medio 11–20 · Alto 21–32 · Crítico 33–44**):
| # | Pregunta (fuente) | Opciones y puntaje | Elevación |
|---|---|---|---|
| 1 | ¿Afecta a servicios críticos? (auto: criticidad de servicios y CI) | Ninguno 0 · Un servicio crítico 3 · Varios 5 | Varios → mínimo **Alto** |
| 2 | Usuarios afectados (auto: `usuarios_afectados`) | <10: 0 · 10–100: 1 · 101–1000: 3 · >1000: 5 | |
| 3 | Interrupción del servicio (auto: E3/E4) | Ninguna 0 · ≤1 h: 1 · 1–4 h: 3 · >4 h: 5 | |
| 4 | Complejidad técnica (manual) | Baja 1 · Media 3 · Alta 5 | |
| 5 | Experiencia previa (manual; auto si hay modelo) | Rutinario con modelo 0 · Probado en pruebas 1 · Primera vez 4 | |
| 6 | Plan de rollback (manual) | Probado 0 · Documentado sin probar 2 · No existe o incompleto 5 | No existe → mínimo **Alto** |
| 7 | Dependencias (manual) | Ninguna 0 · Internas 2 · Externas o de proveedor 4 | |
| 8 | Entorno (auto) | Desarrollo 0 · Pruebas 1 · Preproducción 2 · Producción 3 | |
| 9 | Programación (auto: validación de calendario) | Dentro de ventana 0 · Fuera de ventana 4 | Fuera → mínimo **Medio** |
| 10 | Antecedentes de fallos en los mismos CI en 6 meses (auto) | Ninguno 0 · 1 fallo 2 · Más de 1: 4 | Más de 1 → mínimo **Medio** |
*Cuestionario abreviado para Emergencia:* preguntas 1, 2, 3, 6 y 8.

**Reglas de clasificación y matriz de autoridad:** las tablas de 7.2 y 7.4.

**Modelos de cambio estándar (todos en estado *Borrador*; el admin debe completarlos y aprobarlos):** Reinicio programado de servidor de aplicaciones · Renovación de certificado digital · Instalación o actualización de software autorizado en estación de usuario · Aplicación de parche de seguridad validado en estaciones de usuario.

**Plantillas de RFC:** Emergencia por incidente crítico (Tipo Emergencia, Origen Incidente) · Actualización de software en servidor · Cambio de configuración de red · Alta de servidor o equipo en producción.

**Comités:** CAB sin miembros (el admin debe asignarlos): quórum 3, mayoría simple, voto de calidad del presidente, reunión semanal, corte de agenda 24 h antes. ECAB: quórum 2, regla 2 de 3 convocados, plazo de decisión P1: 2 h / P2: 4 h / P3: 8 h / P4: 24 h, revisión retroactiva por CAB obligatoria.

**Ventanas de mantenimiento (de ejemplo, *inactivas* hasta que el admin las revise):** Noche entre semana (lun–jue 22:00–05:00; Estándar y Normal) · Fin de semana (sáb 22:00 – dom 06:00; permite interrupción) · Ventana mensual de parches (2.º sábado del mes 22:00–06:00).

**Checklist Go/No-Go:** Aprobaciones completas y condiciones cumplidas · Respaldo verificado · Plan de rollback revisado y recursos disponibles · Ventana confirmada sin conflictos · Implementador y equipo disponibles · Usuarios afectados notificados (si hay interrupción) · Pruebas previas validadas (Normal y Emergencia) · Contactos de escalamiento disponibles · Accesos y credenciales disponibles.

**Plantilla de PIR:** ¿Se lograron los objetivos del cambio? (sí/parcial/no) · Resultado de cada criterio de éxito · ¿Se ejecutó dentro de la ventana? · Desviaciones respecto al plan · Incidentes causados por el cambio (automático + manual) · ¿Se usó rollback y por qué? · ¿El riesgo evaluado fue adecuado? (menor/adecuado/mayor) · ¿Fue correcta la comunicación a usuarios? · Costo real vs. estimado · ¿Se actualizó la CMDB? · ¿Se publicó conocimiento? · Lecciones aprendidas · Acciones de mejora (acción, responsable, fecha).

**Paquetes de tareas:** *Cambio normal:* Pre (verificar respaldo, notificar usuarios, confirmar disponibilidad del equipo) · Implementación (ejecutar plan) · Validación (pruebas de validación, verificar monitoreo) · Post (actualizar CMDB, comunicar finalización, documentar). *Emergencia:* registrar autorización, ejecutar, validar, documentar retroactivamente, revisión por CAB. *Estándar:* las del modelo.

**Eventos de dominio que se emiten:** todos los de la lista de 9.1 más `configuracion.publicada`.

**Métricas que los datos deben permitir (2.1 y 2.2):** % de cambios exitosos, fallidos y revertidos · cambios por tipo, categoría, servicio y riesgo · % de emergencias · cambios sin autorización previa (debe ser 0) · tiempo de ciclo (solicitud → autorizado → implementado → cerrado) · incidentes causados por cambios · cumplimiento de ventana · conflictos detectados y excepciones concedidas · cumplimiento de plazos de aprobación · % de PIR completas a tiempo · tasa de éxito por modelo estándar · reprogramaciones por RFC · backlog por estado.

---

## 12. Hechos confirmados del sistema existente (no los vuelvas a preguntar)

| Tema | Lo confirmado |
|---|---|
| Stack | Next.js y PostgreSQL en Supabase; acceso completo al código, base de datos, frontend y backend. |
| Matriz impacto × urgencia | Existe y se usa al crear incidentes (P1–P4; niveles Alta/Media/Baja). Ubicación en el código: **desconocida** (Etapa 0). Los cambios la reutilizan. |
| 1.2.4 Objetivos SLA | Solo tiene la "Matriz Institucional de Tiempos por Prioridad" (primera respuesta y resolución en horas). Los plazos de cambios (8.5) **no** se registran ahí. |
| Formulario de Incidentes y creador de campos | Existen; se extienden a la entidad `cambio`. |
| Perfiles | Administrador, Técnico, Solicitante, Supervisor, Gestor de Área, Auditor, Aprobador, Gestor de Cambios, Gestor de Activos y Configuración. (Gestor de Problemas lo crea el Prompt 1.) |
| Calendarios, feriados, ventanas, congelamientos | **No existen.** Se crean aquí como tablas compartidas (sección 13). |
| Turnos y ausencias de técnicos | No existían; el Prompt 1 crea `tecnico_ausencias`. Si no se ha ejecutado, créala según la sección 13. |
| Menú operativo de cambios | `5.1.1`, `5.1.2`, `5.1.3`, `5.2.1` aparecen en el menú; su estado de implementación se verifica en la Etapa 0. |
| CMDB | Existe el menú `7 Activos y CMDB`; clases y relaciones se definen en el Prompt 3. Hasta entonces, usa lo que exista y repórtalo. |
| Datos que no existan | Se agregan a la base de datos mediante migraciones. |

**Dependencias con otros módulos:**

| Con | Dependencia |
|---|---|
| Prompt 1 (Problemas) | Origen = Problema, mapeo de prellenado de la RFC, estados sincronizados, componente de configuración compartido, constructor de reglas. |
| Prompt 3 (Activos/CMDB) | Criticidad y clase de CI, relaciones de CMDB para el análisis de impacto, actualización de CMDB al cerrar, estado de CI. |
| 1.1.2 | Registrar los permisos de la sección 10. |
| 1.2 Catálogo de servicios | Lista de servicios, criticidad, responsable del servicio (si existe). |
| 1.3.1 Incidentes | Botón "Crear RFC desde este incidente", incidentes causados por cambios, matriz compartida. |
| 1.4 | Departamentos (áreas afectadas), grupos, técnicos y niveles, suplentes. |
| 1.6 Comunicaciones | Plantillas y canales para los eventos de la sección 9.1. |
| 1.7 Conocimiento | Artículos vinculados a RFC y modelos. |
| 1.8 Auditoría y retención | Registro de cambios de configuración y límites de adjuntos/borradores. |
| 2 Reportes | Métricas de la sección 11. |

---

## 13. Cambios de base de datos requeridos

Principio: **verifica primero si existe (Etapa 0); si no existe, créalo con migración.** No dupliques.

**13.1 Tablas de configuración del módulo** (diseño libre, convenciones del proyecto): versiones de configuración por pantalla/pestaña (ámbito, versión, estado, snapshot `jsonb`, autor, motivo, fechas) · catálogos de 6.3 · definición del cuestionario de riesgo (preguntas, opciones, puntajes, fuentes, niveles y umbrales) · tipos de cambio y su matriz de requisitos · reglas de autoridad y de clasificación · modelos de cambio estándar (con versiones y estadísticas) · estados, transiciones y automatizaciones · catálogo de etapas de aprobación · comités (miembros, reglas, reuniones) · plazos y reglas de escalamiento · tareas, paquetes y checklists (Go/No-Go y PIR) · acciones por resultado y parámetros de CMDB/cierre · eventos de notificación y sus destinatarios · parámetros de calendario y de conflictos · plantillas de RFC.

**13.2 Tablas operativas de la RFC** (verificar si algo ya existe): `cambios` (secuencia `RFC-000001` sin saltos) · servicios y CI afectados (con origen del vínculo) · respuestas del cuestionario de riesgo (valor, puntaje, fuente) y ajuste manual · etapas de aprobación por RFC (estado, decisión, fecha, comentario, condiciones, delegación) · condiciones pendientes · votos de comité (**solo INSERT**) y actas · reuniones y agendas · tareas · checklist Go/No-Go (respuestas) · bitácora de ejecución · actualizaciones de CMDB planificadas/aplicadas · PIR y acciones de mejora · relaciones con otros tickets · conflictos detectados y excepciones · comentarios · adjuntos · historial/auditoría (**solo INSERT**).

**13.3 Seguridad:** permisos de la sección 10 como datos semilla. Las tablas de historial, votos y auditoría no admiten UPDATE ni DELETE (políticas RLS y/o triggers).

**13.4 Tablas nuevas y compartidas de calendario:**
- `calendario_feriados` (fecha o rango, nombre, tipo, alcance, recurrente anual, activo).
- `ventanas_mantenimiento` (recurrencia —regla tipo iCal o campos estructurados—, inicio/fin, cruce de medianoche, vigencia, excepciones, alcance, tipos permitidos, capacidad, permite interrupción).
- `periodos_congelamiento` (inicio, fin o recurrencia anual, alcance, severidad, tipos exentos, aviso anticipado).
- Parámetro de **zona horaria del sistema** (verifica si ya existe en la configuración; si no, créalo).

**13.5 Rangos de tiempo y conflictos:** en `cambios` guarda la ventana propuesta/aprobada/real como columnas `tstzrange` con **índice GiST** para detectar solapamientos con el operador `&&`; considera `btree_gist` si hay combinaciones con igualdad. Los conflictos son advertencias/bloqueos de negocio, **no** restricciones de exclusión de la base de datos.

**13.6 Columnas que probablemente falten (verifica y agrega):** servicio: criticidad (`es_critico` o nivel) y, opcionalmente, `responsable_servicio_id` · CI: `clase`, `criticidad`, `estado` y relaciones entre CI (coordinar con el Prompt 3) · incidente: referencia a la RFC que lo causó (`causado_por_cambio_id` o tabla puente) · entidad `cambio` en la definición de campos personalizados · `tecnico_ausencias` (si no existe) · bandera de "es incidente de emergencia" si se usa en 1.3.3.4.

**13.7 Búsqueda:** índices de texto completo en español (`to_tsvector('spanish', …)` y `pg_trgm`) para detectar RFC similares.

**13.8 Tareas programadas** (usa el mecanismo de jobs existente; si no hay, propón —sin implementar sin aprobación— `pg_cron`, Edge Functions de Supabase o cron de Next.js): recordatorios previos a la ventana · recordatorios y escalamiento de aprobaciones · caducidad de autorizaciones · generación de agenda de CAB y recordatorios · cierre de votaciones asíncronas · reevaluación periódica de conflictos · comunicados de interrupción · inicio automático de PIR y alerta de PIR vencidas · revisión periódica y suspensión de modelos estándar · cierre automático · aviso de períodos de congelamiento próximos.

**13.9 Semillas:** todo lo de la sección 11 mediante migración idempotente.

---

## 14. Criterios de aceptación

1. El menú muestra `1.3.3.1 Configuración de formulario`, `1.3.3.2`, `1.3.3.3` y `1.3.3.4` con las pestañas numeradas de la sección 2.3.
2. Todas las pestañas usan el patrón común (borrador, vista previa, publicación con diff y motivo, versionado, restauración, importación/exportación, bloqueo concurrente).
3. El editor de formulario y el creador de campos de cambios son **el mismo componente** que usa Incidentes, extendido; Incidentes sigue funcionando igual.
4. Un campo bloqueado (Título, Tipo, Motivo, Descripción, Servicio, CI, Impacto, Urgencia, Fechas, Plan de implementación, Plan de rollback, Grupo implementador) no puede ocultarse; el mínimo normativo de Normal y Emergencia no puede bajarse.
5. La obligatoriedad "Según tipo de cambio" se resuelve con la matriz de 1.3.3.2.1 y el formulario cambia al elegir otro tipo.
6. Una RFC de tipo Estándar solo puede registrarse con un modelo aprobado, vigente y aplicable, y con la elegibilidad completa.
7. Con `Usar matriz propia para cambios` apagado, una RFC con cierto impacto y urgencia recibe **exactamente la misma prioridad** que un incidente con esos valores; no existe una segunda copia de la matriz.
8. El cuestionario de riesgo calcula puntaje y nivel, aplica reglas de elevación, responde automáticamente las preguntas con fuente de sistema y el simulador coincide con el resultado real.
9. La matriz de autoridad genera las etapas de aprobación correctas por tipo y riesgo; el simulador resuelve aprobadores reales.
10. Un estándar con riesgo mayor que Bajo se reclasifica a Normal y se informa al usuario.
11. **Segregación de funciones en servidor:** el solicitante no aprueba su RFC; el implementador no aprueba; una persona no aprueba dos etapas; un intento mediante la API directa es rechazado.
12. No es posible pasar a *En ejecución* sin etapas aprobadas, condiciones cumplidas, Go/No-Go = Go y sin congelamiento vigente (excepto Emergencia autorizada por ECAB); se verifica por API y no solo por interfaz.
13. Una aprobación se invalida y se reinicia cuando cambia un campo marcado como crítico.
14. El CAB aplica quórum, regla de decisión, voto de calidad, exclusión por conflicto de interés y voto asíncrono con plazo; los votos no son modificables.
15. Una Emergencia convoca al ECAB, permite registro retroactivo solo con permiso, exige autorización retroactiva y revisión posterior del CAB.
16. El validador de flujo bloquea la publicación si hay estados inalcanzables, sin salida o sin camino a un final para algún tipo.
17. Un estado con tickets no puede desactivarse sin asistente de migración.
18. Los conflictos (mismo CI, servicio, relacionados, implementador, fuera de ventana, congelamiento, feriado, capacidad) se detectan al enviar, programar y por proceso periódico, con la severidad configurada; las excepciones requieren permiso y motivo.
19. Un período de congelamiento con severidad *Bloqueo total* impide programar para todos excepto Emergencia con ECAB.
20. El comunicado de interrupción se envía a los usuarios de las áreas afectadas en los momentos configurados.
21. Un resultado Fallido o con Rollback exige causa de fallo, crea el incidente configurado, fuerza la PIR y puede suspender el modelo estándar.
22. No se puede cerrar una RFC con actualizaciones de CMDB pendientes ni con PIR obligatoria incompleta.
23. La PIR detecta automáticamente los incidentes creados sobre los CI afectados dentro de la ventana de observación.
24. Un modelo estándar se suspende automáticamente al superar el umbral de fallos y sus nuevas solicitudes se reclasifican a Normal.
25. Los plazos de aprobación escalan según la configuración y **nunca** se aprueba automáticamente por vencimiento.
26. Las tablas de calendario (feriados, ventanas, congelamientos) existen, son compartidas y no alteran el motor de SLA.
27. Toda acción de configuración queda en `1.8.1 Auditoría de cambios` con usuario, antes/después y motivo; los historiales de RFC y votos son inmutables.
28. Los permisos de la sección 10 se cumplen; `editar` sin `publicar` no habilita el botón Publicar; el Administrador no puede aprobar ni dictaminar.
29. El formulario y el ticket reflejan exactamente las secciones 4 y 5 con los valores de fábrica.
30. La zona horaria del sistema se respeta en ventanas recurrentes, recordatorios y calendario.

---

## 15. Etapa 0 — Reconocimiento obligatorio y preguntas abiertas

**Antes de escribir código**, revisa el repositorio y la base de datos y entrégame un **informe** (sin modificar nada) con:

1. **Matriz de prioridad:** dónde está, cómo se consume, si tiene pantalla de edición.
2. **Motor de SLA:** dónde está y si cuenta horas corridas u hábiles; cómo se pausan y reanudan relojes.
3. **Componentes reutilizables:** editor de formulario de 1.3.1.1, creador de campos, constructor de reglas, motor de estados de Incidentes, componente de borrador/publicación/versionado (si el Prompt 1 ya lo creó), sistema de notificaciones (1.6) y si admite destinatarios dinámicos y plantillas por evento, jobs programados, componentes de UI (tablas, modales, calendario, arrastrar-y-soltar).
4. **Perfiles y permisos:** cómo se almacenan y verifican en frontend, backend y RLS.
5. **Tablas existentes** de servicios, departamentos, grupos, técnicos, niveles, incidentes, CMDB (clases y relaciones), conocimiento y auditoría.
6. **Estado del módulo operativo de cambios:** qué existe ya de `5.1.1`, el ticket de RFC, `5.1.2`, `5.1.3` y `5.2.1`.
7. **Qué de la sección 13 ya existe y qué falta**, con el plan de migraciones.
8. **Riesgos o conflictos** detectados.

Después **detente y espera mi aprobación** para iniciar la Etapa A.

**Preguntas abiertas que quedan** (responde lo que puedas con el código; pregúntame solo lo que no puedas determinar):
1. Si las pantallas operativas (`5.1.1`, ticket de RFC, `5.1.2`, `5.2.1`) no existen: ¿construyes versiones mínimas, dirigidas por la configuración y fieles a las secciones 4 y 5, al final de cada etapa para poder probarla? **Propuesta por defecto: sí.**
2. Si la matriz impacto × urgencia está fija en código sin pantalla de edición: ¿apruebo migrarla a una tabla con pantalla?
3. ¿Los servicios del catálogo tienen un campo de criticidad o de responsable? (determina si se crean en 13.6).
4. ¿La CMDB actual tiene relaciones entre CI utilizables para el análisis de impacto? Si no, el análisis queda deshabilitado con aviso hasta que se ejecute el Prompt 3.

---

## 16. Fuera de alcance de este prompt
Gestión de problemas → Prompt 1 · Activos y CMDB (clases, relaciones, ciclos de vida) → Prompt 3 · Bandejas, tableros y reportes del módulo · Modificar el SLA por servicio o la matriz de 1.2.4 · Integraciones con herramientas externas de despliegue (CI/CD) o monitoreo · Gestión de proyectos y de liberaciones (release/deployment) más allá del origen "Proyecto".
