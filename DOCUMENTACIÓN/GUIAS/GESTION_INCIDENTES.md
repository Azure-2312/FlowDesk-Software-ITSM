# Gestión de Incidentes

> **Objetivo (ITIL 4):** restablecer el servicio normal **lo antes posible** y reducir el impacto en el negocio.
> Un incidente es una **interrupción no planificada** o una **degradación** de un servicio: algo que funcionaba y dejó de hacerlo.
> La gestión de incidentes **no busca la causa raíz**; eso le corresponde a Gestión de Problemas.

En FlowDesk el incidente es un **ticket de tipo 1** (prefijo `INC`). Comparte tabla, estados y SLA con las solicitudes, y además tiene su extensión `ticket_incidente` (vínculo con problema e incidente mayor).

---

## 1. Archivos principales

```
src/modules/tickets/services/ticketsService.ts        ← crear ticket, bandejas, prioridad
src/modules/tickets/services/ticketDetalleService.ts  ← transiciones, asignación, pausa, reapertura
src/modules/tickets/services/mesaTomaService.ts       ← "tomar" un ticket de la cola del grupo
src/modules/tickets/[id]/VistaTicketsDetalle.tsx      ← detalle y botones (incluye "Escalar a Problema")
src/modules/incidentes/services/incidentesMayoresService.ts ← incidentes mayores (bandeja, declaración y sala de crisis)
src/shared/lib/incidente-mayor.ts                     ← reglas únicas del incidente mayor (estados, activo, severidad)
src/shared/lib/reglas-ticket.ts / sla-sql.ts          ← reglas únicas: en atención, por asignar, SLA
```

**Tablas:** `ticket`, `ticket_incidente` (`id_problema`, `es_incidente_mayor`), `comentario_ticket` (bitácora), `incidente_mayor`.

---

## 2. Flujo normal

```
 Registro ─▶ Clasificación y prioridad ─▶ ABIERTO ─▶ ASIGNADO ─▶ EN PROCESO ─▶ RESUELTO ─▶ CERRADO
                                             │                     │   ▲            │
                                             │                     ▼   │            └─▶ reapertura (≤ 48 h) ─▶ EN PROCESO
                                             │                  EN ESPERA (reloj SLA pausado)
                                             └──────────────▶ CANCELADO (solo Supervisor)
```

### 2.1 Registro
Lo registra el **usuario** desde el portal (canal `PORTAL_WEB`) o el **personal de soporte** a nombre de otro usuario (perfiles Administrador, Técnico, Supervisor y Gestor de Cambios). `crearTicket()` exige:

- Título (5 a 150 caracteres) y descripción (15 a 5 000 caracteres).
- Tipo, categoría, impacto y urgencia. La categoría debe corresponder al tipo.
- Servicio del catálogo (opcional). Si se elige, debe coincidir con el tipo y la categoría.
- Adjuntos validados (máximo 5 MB cada uno).

### 2.2 Clasificación y prioridad
La **prioridad no la elige el usuario**: se calcula con la matriz **Impacto × Urgencia** (configurable en Servicios → Configuración SLA → Matriz):

| Impacto \ Urgencia | Alta | Media | Baja |
|---|---|---|---|
| **Alto** | P1 Crítica | P2 Alta | P3 Media |
| **Medio** | P2 Alta | P3 Media | P4 Baja |
| **Bajo** | P3 Media | P4 Baja | P4 Baja |

Cada prioridad define su SLA. Si el **servicio** tiene SLA propio, ese tiene prioridad sobre el de la tabla.

| Prioridad | Primera respuesta | Resolución |
|---|---|---|
| P1 Crítica | 1 h | 4 h |
| P2 Alta | 2 h | 8 h |
| P3 Media | 4 h | 24 h |
| P4 Baja | 8 h | 72 h |

### 2.3 Enrutamiento y asignación
- El ticket entra al **grupo resolutor del servicio**, o a la **Mesa de Ayuda (N1)** si no tiene servicio. El usuario no elige el grupo técnico.
- Formas de asignarlo:
  - **Tomarlo**: un técnico lo toma de la cola de su grupo (`tomarTicketDeMesa`). La operación es atómica: si dos lo intentan a la vez, solo uno lo consigue.
  - **Asignarlo**: el Supervisor o el Administrador lo asigna desde el **Centro de asignación**. Se valida la **carga máxima** del técnico (RN-16).
  - **Autoasignarse** al registrarlo, si quien lo registra es soporte.
- Al asignar un técnico por primera vez, el ticket pasa de **Abierto → Asignado**.

### 2.4 Diagnóstico y atención
- Al pasar a **En proceso** se marca la **primera respuesta** (cumplimiento del SLA de respuesta).
- El técnico deja notas públicas o internas en la bitácora (`comentario_ticket`).
- Si se **vincula un error conocido** o un artículo de conocimiento, el técnico aplica el *workaround* documentado (ver §4.3).

### 2.5 En espera (pausa del SLA)
Exige un **motivo de pausa**:
- Pendiente de información del solicitante
- En espera de repuesto o hardware
- En espera de proveedor o soporte externo
- En espera de autorización o visto bueno

Mientras está en espera **el reloj del SLA se detiene**. Al reanudarse, el tiempo pausado se suma al límite (`tiempo_pausado_minutos`).

### 2.6 Resolución, cierre y reapertura
- **Resuelto:** el técnico registra la solución aplicada y la categoría de resolución, y se evalúa el SLA (`sla_cumplido`).
- **Cerrado:** el **solicitante confirma** el cierre. También puede calificar la atención con **CSAT** (1 a 5 estrellas).
- **Reapertura:** solo desde **Resuelto**, dentro de la ventana configurada (**48 h** por defecto) y con un motivo de al menos 8 caracteres. Vuelve a **En proceso** y suma `conteo_reaperturas`.
- Un ticket **Cerrado** ya no se reabre: hay que registrar uno nuevo.

### 2.7 Quién puede mover cada estado

| Desde | Técnico | Supervisor | Solicitante |
|---|---|---|---|
| Abierto | En proceso | Asignado, En proceso, Cancelado | — |
| Asignado | En proceso | En proceso, Cancelado | — |
| En proceso | En espera, Resuelto | En espera, Resuelto, Cancelado | — |
| En espera | En proceso | En proceso, Cancelado | — |
| Resuelto | — | — | Cerrado (confirmar) o reabrir |

---

## 3. Reglas comunes (iguales en todos los perfiles)

| Regla | Definición |
|---|---|
| **En atención** | Estado Abierto, Asignado, En proceso o En espera |
| **Por asignar** | En atención y sin técnico |
| **SLA vencido** | En atención y con el límite efectivo superado (límite + tiempo en pausa) |
| **Por vencer** | Le queda menos del 25 % del tiempo |

Estas reglas viven en `sla-sql.ts` (para SQL) y `reglas-ticket.ts` (para pantallas), así que los paneles, las bandejas y los reportes cuentan lo mismo.

---

## 4. Escalamientos desde un incidente

### 4.1 Escalamiento funcional y jerárquico (dentro de Incidentes)
- **Funcional:** el **Supervisor** cambia el **grupo resolutor** (`id_departamento`) cuando el ticket necesita otra especialidad. Por ejemplo, de N1 Mesa de Ayuda a N2 Redes.
- **Jerárquico:** el panel de Supervisión muestra los tickets **vencidos o por vencer** (pestaña Escalamientos) para que el Supervisor reasigne, priorice o intervenga.

### 4.2 Incidente → Incidente mayor
Cuando el impacto es crítico y generalizado (por ejemplo, la caída de un servidor que afecta a toda una sede):

- **Quién lo declara:** el **Supervisor** o el **Administrador**, con el botón **"Declarar incidente mayor"** del detalle del incidente (el formulario llega con el incidente ya elegido) o desde **Incidentes mayores → Declarar incidente**.
- **Qué se registra** (`declararIncidenteMayor`):
  - severidad **P1 o P2**;
  - **incidente de origen** (opcional): debe ser un incidente en atención, y no puede estar ya en otro incidente mayor activo;
  - **problema vinculado** (opcional);
  - sala virtual e involucrados.

  Recibe el código `IM-AAAA-NNNN`. El incidente de origen queda marcado como incidente mayor y su bitácora registra la declaración.
- **Estados:** **ABIERTO** (servicio caído) → **MITIGADO** (servicio restablecido, en observación) → **CERRADO**. Desde MITIGADO se puede volver a ABIERTO si la falla reaparece. Un incidente mayor **cerrado ya no se modifica**.
- **Activo** = ABIERTO o MITIGADO. Es la regla única que cuentan todos los paneles (Supervisión y Problemas), definida en `incidente-mayor.ts`.
- **Comunicados:** se publican desde la bandeja o desde la **sala de crisis**, con fecha y autor. Los técnicos pueden publicarlos desde la sala de crisis.
- Hay **una sola API** (`/api/tickets/incidentes-mayores`) para la bandeja, la declaración y la sala de crisis.
- La sala de crisis muestra el ticket de origen y los incidentes del problema vinculado.

### 4.3 Incidente → Problema
**Cuándo:** el incidente es **recurrente**, no se conoce su causa, o su impacto justifica investigar.

**Cómo (manual):** en el detalle del incidente, el botón **"Escalar a Problema"**. Lo pueden usar el Administrador, el Técnico, el Supervisor o el técnico asignado, mientras el incidente no esté cerrado ni cancelado.

```ts
// VistaTicketsDetalle.tsx → POST /api/problemas
{ titulo: "Problema: <título del incidente>",
  descripcion: "Investigación de causa raíz derivada del incidente #INC-...",
  id_ticket_origen: <id del incidente> }
```

- `crearProblema()` crea el problema `PRB-AAAA-NNNN` en el **mismo grupo resolutor** y vincula el incidente en `problema_incidente` y en `ticket_incidente.id_problema`.
- Después, el detalle del incidente muestra el enlace **"Problema: PRB-…"**.
- **Importante:** el incidente **sigue su curso**. Se puede resolver con un *workaround* aunque el problema siga en investigación.

**Cómo (proactivo):** Gestión de Problemas detecta **candidatos** agrupando incidentes repetidos por servicio, categoría, CI o código de resolución, según las **reglas de detección** (por ejemplo, 3 incidentes del mismo servicio en 24 h). Las reglas **no crean problemas solas**: el Gestor de Problemas revisa cada candidato y, si corresponde, lo convierte en problema vinculando todos esos incidentes.

**Retorno:** cuando el problema publica un **error conocido (KEDB)**, los técnicos usan su *workaround* para resolver más rápido los incidentes futuros.

### 4.4 Incidente → Cambio de emergencia
Si restablecer el servicio **exige modificar** la infraestructura (un parche, un cambio de configuración o un reemplazo):

- Se registra una **RFC de EMERGENCIA**.
- El sistema **obliga** a asociarla al **incidente de origen** (`id_incidente_origen`) y a indicar quién la autorizó y por qué medio.
- La evalúa el **ECAB** (comité de emergencia), y la documentación completa se regulariza después.

### 4.5 Cambio → Incidente (relación inversa)
Un cambio fallido puede **provocar** incidentes. En la **revisión post-implementación (PIR)** del cambio se registra cuántos incidentes indujo (`incidentes_inducidos`). FlowDesk no vincula cada incidente con el cambio que lo causó.

---

## 5. Resumen visual de escalamientos

```
                 ┌──────────────────────┐
                 │   INCIDENTE (INC)    │
                 └──┬──────┬──────┬─────┘
     impacto crítico│      │      │ requiere modificar infraestructura
                    ▼      │      ▼
         INCIDENTE MAYOR   │   CAMBIO DE EMERGENCIA (RFC, ECAB)
                           │ recurrente / causa desconocida
                           ▼
                     PROBLEMA (PRB) ──▶ Error conocido (KEDB) ──▶ workaround para nuevos incidentes
                           │
                           └──▶ Cambio normal (RFC) para la solución definitiva
```
