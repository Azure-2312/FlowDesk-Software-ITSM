# Gestión de Cambios (Habilitación de Cambios)

> **Objetivo (ITIL 4, "Change Enablement"):** que los cambios en servicios e infraestructura se hagan con **éxito**, evaluando bien el **riesgo**, autorizándolos y programándolos sin frenar al negocio.
> Un **cambio** es agregar, modificar o retirar cualquier cosa que pueda afectar a los servicios: un servidor, una configuración, un software o una red.
> El documento que lo pide es la **RFC** (Request for Change, solicitud de cambio).

---

## 1. Archivos principales

```
src/modules/cambios/services/
├── cambiosService.ts            ← crear RFC (reglas por tipo), listar por vista
├── cambioDetalleService.ts      ← detalle, votación CAB con quórum, ciclo de vida y PIR
├── cambiosGestionService.ts     ← evaluar, enviar a autorización, programar, ejecutar, extender ventana, PIR
├── aprobacionesService.ts       ← decisión del Aprobador (aprobado, con condiciones, observado, rechazado)
├── aprobacionNegocioService.ts  ← aprobación de negocio del Gestor de Área afectado
├── ecabService.ts               ← comité de emergencia (ECAB)
├── modelosEstandarService.ts    ← modelos de cambio estándar preautorizados
├── conflictosService.ts         ← choques de ventanas y capacidad
└── cuestionarioRiesgoService.ts ← cuestionario de riesgo
src/modules/cambios/gestion/     ← pantallas: crear, todos, CAB, calendario, detalle
src/modules/cambios/config/      ← formulario, tipos, matriz de autoridad, calendario (feriados, congelamientos, ventanas)
```

**Tablas:** `cambio` (`tipo_cambio`, ventana, planes, `id_ci_afectado`, `id_problema_origen`, `id_incidente_origen`, `id_solicitud_origen`, `resultado_pir`, `incidentes_inducidos`), `cambio_aprobacion` (votos y decisiones), `ecab_decision`, `cambio_modelo_estandar`, `cambio_enterado`.

---

## 2. Estados

| Id | Estado | Significado |
|---|---|---|
| 1 | **Registrado** | RFC creada; falta evaluarla (caso típico: RFC derivada de un problema) |
| 2 | **Evaluación CAB** | En el circuito de autorización (CAB, ECAB o negocio) |
| 3 | **Aprobado** | Autorizado para programarse |
| 4 | **En planificación** | Programado: ventana y responsable definidos |
| 5 | **En ejecución** | Se está implementando |
| 6 | **Exitoso** | Implementado correctamente |
| 7 | **Fallido** | Falló o se hizo *rollback* |
| 8 | **Cancelado** | Rechazado en la autorización o cancelado |

```
REGISTRADO ─▶ EVALUACIÓN CAB ─┬─▶ APROBADO ─▶ EN PLANIFICACIÓN ─▶ EN EJECUCIÓN ─┬─▶ EXITOSO ─┐
                              │                                                 └─▶ FALLIDO ─┴─▶ PIR (revisión)
                              └─▶ CANCELADO (rechazado)
```

---

## 3. Los tres tipos de cambio

| | **Estándar** | **Normal** | **Emergencia** |
|---|---|---|---|
| Qué es | Repetitivo, de bajo riesgo y documentado | Cualquier cambio que no es estándar ni urgente | Hay que hacerlo **ya** para restablecer un servicio |
| Autoriza | **Preautorizado** por el modelo | **CAB** (votación por mayoría) | **ECAB** (comité de emergencia) |
| Estado al crearlo | **Aprobado (3)** directamente | Evaluación CAB (2) | Evaluación CAB (2) |
| Exige | Elegir un **modelo estándar** y confirmar **toda** su lista de elegibilidad | Justificación, plan de implementación, **rollback**, **pruebas**, **criterios de éxito**, entorno y motivo | **Incidente de origen** (obligatorio), quién lo autorizó y por qué medio, y la justificación de la urgencia |
| Prioridad | P4, impacto bajo | Según impacto y urgencia | Alta o crítica |
| Ejemplo | Instalar el software autorizado en una PC | Migrar el servidor de correo | Parchear un servidor caído por una vulnerabilidad |

En emergencias, los planes pueden quedar como **"Pendiente de regularización post-emergencia"** y completarse después.

### Validaciones comunes al crear cualquier RFC (`crearCambio`)
- La **ventana** (inicio y fin) es obligatoria, no puede empezar en el pasado, el fin debe ser posterior al inicio y no puede superar la **duración máxima** configurada (24 h por defecto).
- El **CI afectado** es obligatorio y debe existir y estar activo en la **CMDB**.
- **No puede solaparse** con otro cambio activo (estados 3, 4 o 5) sobre el **mismo CI** en la misma ventana (409).
- Si **interrumpe un servicio**, hay que indicar cuál, del catálogo.
- Las RFC de emergencia pueden **deshabilitarse** por configuración.

---

## 4. Flujo completo de un cambio normal

### 4.1 Registro
El solicitante (Gestor de Cambios, Técnico, Supervisor…) llena el formulario. Las RFC creadas desde un problema nacen en **Registrado**, y las del formulario entran directo a **Evaluación CAB**.

### 4.2 Evaluación
El **Gestor de Cambios** asigna un **evaluador técnico** (`asignarEvaluador`), revisa el riesgo (cuestionario de riesgo, nivel de riesgo) y **envía a autorización** (`enviarAAutorizacion`: Registrado → Evaluación CAB).

### 4.3 Autorización
Hay varios caminos según el tipo de cambio y a quién afecta:

| Quién | Cómo decide | Efecto |
|---|---|---|
| **CAB** (perfil Aprobador CAB, 7) | Cada miembro **vota**. **Quórum = mitad + 1** de los miembros activos | Mayoría APROBADO → **Aprobado (3)**. Mayoría RECHAZADO → **Cancelado (8)** |
| **Aprobador** | APROBADO, **APROBADO CON CONDICIONES**, OBSERVADO o RECHAZADO (el comentario es obligatorio) | Aprobado → 3. Rechazado → 8. Observado: queda en evaluación |
| **Gestor de Área afectado** (negocio) | Aprueba si el cambio afecta a su área (por el solicitante o el incidente de origen) | Aprobado → 3. Rechazado → 8 |
| **ECAB** (emergencias) | Un único dictamen, con condiciones y plazo en horas | Aprobado → 3. Rechazado → 8 |

**Segregación de funciones (SoD):** el **solicitante** ni el **responsable** pueden aprobar o votar su propio cambio. Además, cada persona vota **una sola vez**.

### 4.4 Programación
`programarCambio` (Aprobado → **En planificación**): se fija la ventana definitiva y el **responsable de implementación**.

- El **calendario de cambios** muestra los cambios aprobados, programados y en ejecución.
- La configuración del calendario controla **feriados**, **periodos de congelamiento** (no se hacen cambios, por ejemplo, en el cierre contable), **ventanas de mantenimiento** y **conflictos de capacidad**.
- Los técnicos afectados confirman que están **enterados** del cambio (`cambio_enterado`), y se pueden publicar **avisos de mantenimiento** a los usuarios.

### 4.5 Ejecución
- El Gestor de Cambios lo pasa a **En ejecución** (4 → 5).
- Si se necesita más tiempo, se **extiende la ventana** con un motivo; queda en la auditoría como `EXTENSION_VENTANA`.
- Al terminar se registra el resultado (`resolverEjecucion`):
  - **EXITOSO** → estado 6;
  - **FALLIDO** o **ROLLBACK** → estado 7, y queda en la auditoría como `CAMBIO_FALLIDO` o `ROLLBACK`.

### 4.6 Revisión post-implementación (PIR)
Aplica a todo cambio **Exitoso o Fallido**:
- Se registra el **resultado de la PIR** (mínimo 10 caracteres): qué salió bien, qué falló y qué se aprende.
- Se registra el número de **incidentes inducidos** por el cambio.
- El plazo es de **5 días** tras el cierre. El panel muestra las **PIR vencidas**.

---

## 5. Escalamientos: de dónde vienen y a dónde van los cambios

### 5.1 Problema → Cambio (el origen más común de un cambio normal)
La causa raíz de un problema se elimina con una RFC:
- **Gestión de Problemas → Cambios derivados** crea la RFC con `id_problema_origen` (tipo NORMAL, estado Registrado).
- Al implementarse con éxito, el problema puede pasar a **Resuelto** y luego a **Cerrado**.

### 5.2 Incidente → Cambio de emergencia
Si restablecer un servicio exige modificar la infraestructura de inmediato:
- La RFC de **EMERGENCIA** exige el **incidente de origen** (`id_incidente_origen`).
- La decide el **ECAB**, y la documentación se regulariza después.
- La RFC normal también puede indicar un incidente de origen de forma opcional.

### 5.3 Solicitud → Cambio estándar o normal
Cuando cumplir una solicitud exige tocar producción (por ejemplo, abrir un puerto del firewall):
- Desde el detalle de la solicitud, **"Solicitar cambio"** abre el formulario con la solicitud de origen ya elegida (`id_solicitud_origen`).
- Si existe un **modelo estándar**, se usa un **cambio estándar**, que ya nace aprobado. Si no, se registra un **cambio normal**.
- La solicitud debe estar en atención y ya autorizada por el jefe del área.
- La bitácora de la solicitud registra la RFC. Ambos detalles muestran el vínculo: "Cambio: RFC-…" en la solicitud y "Solicitud Origen" en la pestaña Relacionados del cambio.
- Un cambio de **emergencia** no se origina en una solicitud: siempre nace de un incidente.

### 5.4 Cambio → Incidente (cuando el cambio sale mal)
Un cambio **Fallido** o con *rollback* puede generar incidentes. En la PIR se registra **cuántos** indujo (`incidentes_inducidos`). FlowDesk no vincula cada incidente con el cambio que lo causó.

### 5.5 Cambio → Problema
Si un cambio falla repetidamente o induce varios incidentes, eso justifica abrir un **problema** para investigar por qué (por ejemplo, un procedimiento mal diseñado).

---

## 6. Mapa general entre las cuatro gestiones

```
                    ┌────────────────────┐
                    │     SOLICITUD      │───── "Solicitar cambio" ──────────┐
                    └────────────────────┘                                   ▼
┌──────────────┐  recurrente / causa       ┌──────────────┐  causa raíz  ┌──────────────┐
│  INCIDENTE   │─────── desconocida ──────▶│   PROBLEMA   │─────────────▶│    CAMBIO    │
│              │◀── workaround (KEDB) ─────│              │   (RFC)      │    (RFC)     │
│              │─── restablecer ya ────────────────────────────────────▶│  EMERGENCIA  │
│              │◀── cambio fallido (incidentes inducidos) ──────────────│              │
└──────┬───────┘                           └──────┬───────┘              └──────────────┘
       │ impacto crítico                          │ conocimiento
       ▼                                          ▼
 INCIDENTE MAYOR                          ARTÍCULO KB (borrador)
```
