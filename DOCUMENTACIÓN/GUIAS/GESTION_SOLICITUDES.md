# Gestión de Solicitudes de Servicio

> **Objetivo (ITIL 4, "Service Request Management"):** atender las **peticiones predefinidas** de los usuarios de forma eficiente y predecible.
> Una solicitud **no es una falla**: es algo que el usuario **pide** y que ya está previsto en el catálogo. Por ejemplo, un equipo nuevo, una licencia de Adobe, un acceso a una carpeta o la baja de un colaborador.

En FlowDesk la solicitud es un **ticket de tipo 2** (prefijo `REQ`). Comparte estados, SLA y bandejas con los incidentes, y además tiene su extensión `ticket_solicitud` con la **compuerta de aprobación** (`estado_aprobacion`, `id_paso_actual`).

---

## 1. Archivos principales

```
src/modules/tickets/services/ticketsService.ts        ← crear (aprobación y workflow según el servicio)
src/modules/tickets/services/ticketDetalleService.ts  ← aprobar o rechazar desde el detalle, transiciones, cambios vinculados
src/modules/cambios/services/cambiosService.ts        ← RFC con solicitud de origen (validarSolicitudOrigen)
src/modules/solicitudes/api/aprobacionesController.ts ← bandeja de aprobaciones del jefe de área
src/modules/servicios/services/servicioService.ts     ← catálogo de servicios (formulario, SLA, workflow)
src/shared/lib/reglas-ticket.ts                       ← ticketEsperaAprobacion, ticketPorAsignar
```

**Tablas:** `ticket`, `ticket_solicitud`, `ticket_aprobacion` (registro de cada decisión), `servicio_catalogo`, `servicio_workflow_paso`.

---

## 2. El catálogo de servicios es la base

Cada servicio del catálogo (por ejemplo, `SRV-SOL-ACC-006`) define:

| Atributo | Para qué sirve |
|---|---|
| Tipo y categoría | El servicio solo puede usarse con su tipo y categoría |
| **Grupo resolutor** | A qué grupo de TI llega la solicitud |
| **¿Requiere aprobación?** | Si la tiene, la solicitud nace "pendiente de aprobación" |
| **Pasos de workflow** | Etapas de atención; la solicitud empieza en el primer paso |
| **SLA propio** | Horas de respuesta y de resolución (reemplaza a las de la prioridad) |
| **Formulario** | Campos adicionales, obligatorios o en lista (por ejemplo, "modelo de laptop") |

---

## 3. Flujo normal

```
                        ┌─ no requiere aprobación ─────────────────────────────┐
 Registro desde el      │                                                      ▼
 catálogo ──────────────┤                                         ABIERTO / ASIGNADO ─▶ EN PROCESO ─▶ RESUELTO ─▶ CERRADO
                        │                                              ▲
                        └─ requiere aprobación ─▶ PENDIENTE_APROBACION ┤
                                                   (jefe del área)     │ APROBADO → pasa a TI
                                                                       └ RECHAZADO → CANCELADO (con motivo)
```

### 3.1 Registro
El usuario elige un **servicio del catálogo** y completa su formulario. `crearTicket()`:

1. Valida el título, la descripción, la clasificación y los **campos obligatorios** del formulario del servicio.
2. Calcula la **prioridad** con la matriz Impacto × Urgencia, la misma que en incidentes.
3. Toma el **SLA del servicio** si existe; si no, el de la prioridad.
4. Si el servicio **requiere aprobación**, la deja en `estado_aprobacion = PENDIENTE_APROBACION`. Si no, en `NO_APLICA`.
5. Ubica la solicitud en el **primer paso del workflow** del servicio.
6. La envía al **grupo resolutor del servicio**.

### 3.2 Aprobación (compuerta de negocio)
- La resuelve el **Gestor de Área** (jefe del área del solicitante), que tiene la capacidad `SOLICITUDES_APROBAR`, desde su **bandeja de aprobaciones** o desde el detalle del ticket.
- **Controles de segregación de funciones (SoD):**
  - El solicitante **no puede aprobar su propia solicitud** (RN-32).
  - El Gestor de Área **solo aprueba solicitudes de su propia área** (RN-33).
  - Para **rechazar** hay que dar un motivo de al menos 5 caracteres.
- La decisión se ejecuta de forma **atómica**:
  - registro en `ticket_aprobacion` (quién, cuándo, en qué paso y por qué);
  - actualización de `ticket_solicitud.estado_aprobacion`;
  - cambio de estado del ticket: **APROBADO → Asignado** (lista para TI) y **RECHAZADO → Cancelado**;
  - nota de trazabilidad en la bitácora del ticket.

**Mientras espera la aprobación**, la solicitud **todavía no es trabajo de TI**:
- No cuenta como "por asignar".
- No se puede tomar, asignar ni atender.
- Su SLA no se marca como vencido.

Esta regla es la misma en todos los perfiles (`ticketEsperaAprobacion` / `sqlEsperaAprobacion`).

### 3.3 Atención (cumplimiento)
A partir de aquí es igual que un incidente:
- El técnico **toma** la solicitud o el Supervisor la **asigna**, respetando la carga máxima del técnico.
- Pasa a **En proceso** (se marca la primera respuesta), y puede ir a **En espera** con un motivo, lo que pausa el SLA.
- El Supervisor puede mover la solicitud por los **pasos del workflow** del servicio.

### 3.4 Resolución y cierre
- **Resuelto:** el técnico registra lo entregado.
- **Cerrado:** el solicitante confirma y puede calificar con **CSAT**.
- **Reapertura:** dentro de las 48 h siguientes a la resolución, con un motivo.

---

## 4. Variaciones habituales

| Variación | Cómo se maneja |
|---|---|
| Servicio sin aprobación (por ejemplo, restablecer una contraseña) | Va directo a TI |
| Servicio con aprobación (por ejemplo, una licencia de software con costo) | El jefe del área aprueba primero |
| Aprobación rechazada | La solicitud termina **Cancelada** con el motivo; el usuario puede registrar otra |
| Falta información del usuario | **En espera**, motivo "Pendiente de información del solicitante" (SLA pausado) |
| Falta stock o hay que comprar | **En espera**, motivo "repuesto o hardware" o "proveedor"; la compra puede terminar en un comprobante electrónico y un activo nuevo |
| Registrada por soporte a nombre de otro | El personal de soporte elige al solicitante real |
| Ya no se necesita | El Supervisor la **cancela** con motivo |

---

## 5. Escalamientos desde una solicitud

### 5.1 Escalamiento funcional y jerárquico
Igual que en incidentes:
- **Funcional:** el Supervisor la cambia al grupo resolutor adecuado.
- **Jerárquico:** si se vence o está por vencer, aparece en **Escalamientos** del panel de Supervisión.

### 5.2 Solicitud → Cambio
Si cumplir la solicitud **implica modificar la infraestructura o un servicio en producción** (por ejemplo, abrir un puerto en el firewall o instalar software en un servidor compartido), eso ya no es una simple solicitud: requiere **Gestión de Cambios**.

**Cómo se registra:**
- En el detalle de la solicitud, el botón **"Solicitar cambio"**. Lo ven el Administrador, el Técnico y el Gestor de Cambios, mientras la solicitud está en atención y ya no espera la aprobación del jefe.
- Abre el formulario de RFC con la **solicitud de origen ya elegida**. También se puede elegir desde el formulario de cambios, en "Vincular con Incidente, Problema o Solicitud".

**Qué tipo de cambio:**
- Si la tarea es **repetitiva, de bajo riesgo y está documentada**, se usa un **Cambio Estándar** a partir de un **modelo preautorizado**. No pasa por el CAB: nace directamente **Aprobado**.
- Si **no** existe un modelo estándar, se registra un **Cambio Normal**, que pasa por evaluación y por el CAB.

**Qué valida el sistema** (`crearCambio`): el ticket de origen debe ser una **solicitud**, estar **en atención** y **no esperar aprobación** (ni haber sido rechazada).

**Qué queda registrado:**
- La RFC guarda `id_solicitud_origen`.
- La bitácora de la solicitud anota *"Se registró la solicitud de cambio RFC-… para atender esta solicitud"*.
- El detalle de la solicitud muestra la insignia **"Cambio: RFC-…"**, que enlaza al cambio, y el detalle del cambio muestra la **solicitud de origen** en la pestaña Relacionados.

**Mientras el cambio se aprueba e implementa**, el técnico puede poner la solicitud **En espera** (motivo "En espera de autorización o visto bueno") para pausar su SLA. Cuando el cambio termina con éxito, resuelve la solicitud.

### 5.3 Solicitud → Incidente
Si, al atender la solicitud, el técnico descubre que algo **está fallando** (por ejemplo, el equipo que se iba a configurar tiene el disco dañado), eso es un **incidente** y se registra aparte. La solicitud no se convierte en incidente: son dos registros distintos, con su propio SLA.

### 5.4 Solicitud → Problema
No escala de forma directa. Si **muchas solicitudes** revelan una falla de fondo (por ejemplo, desbloqueos de cuenta repetidos por un error de sincronización), esa falla se trata como incidente o como problema.

---

## 6. Diferencia clave con un incidente

| | Incidente | Solicitud |
|---|---|---|
| Origen | Algo **dejó de funcionar** | El usuario **pide algo** previsto en el catálogo |
| Aprobación | Nunca | Según el servicio |
| Urgencia | Restablecer el servicio | Cumplir en el plazo acordado |
| Puede escalar a | Incidente mayor, Problema, Cambio de emergencia | Cambio (estándar o normal) |
