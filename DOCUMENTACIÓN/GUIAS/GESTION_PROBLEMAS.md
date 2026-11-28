# Gestión de Problemas

> **Objetivo (ITIL 4):** reducir la probabilidad y el impacto de los incidentes **identificando sus causas reales** y gestionando los *workarounds* y los **errores conocidos**.
> - Un **problema** es la **causa**, conocida o no, de uno o varios incidentes.
> - Un **error conocido** es un problema ya analizado, con la causa identificada y, normalmente, un *workaround*.
> - El incidente se ocupa de **apagar el fuego**; el problema, de **evitar que vuelva a encenderse**.

---

## 1. Archivos principales

```
src/modules/problemas/services/
├── problemaService.ts          ← crear, listar, actualizar, vincular incidentes, publicar en KEDB
├── gestionProblemasService.ts  ← panel, asignación, candidatos, análisis RCA, mayores, RFC y artículos derivados, OLA
├── cierreProblemaService.ts    ← autorización del cierre de problemas mayores (riesgo residual)
├── relacionesUmbralService.ts  ← reglas de detección de candidatos (no crean problemas)
└── relacionesService.ts        ← configuración de relaciones con incidentes, cambios, KEDB y CMDB
src/modules/tickets/[id]/VistaTicketsDetalle.tsx ← botón "Escalar a Problema" en el incidente
```

**Tablas:** `problema`, `problema_incidente` (incidentes vinculados), `problema_analisis` (5 porqués, Ishikawa, línea de tiempo), `error_conocido` (KEDB), `problema_cierre_aprobacion`, `problema_regla_umbral`. Los catálogos de métodos, orígenes y motivos se configuran.

---

## 2. Estados

| Id | Estado | Significado |
|---|---|---|
| 1 | **Registrado** | Problema identificado, pendiente de investigación |
| 2 | **En investigación** | Se analiza la causa raíz |
| 3 | **Causa raíz identificada** | Se conoce el porqué |
| 4 | **Error conocido (KEDB)** | Causa y *workaround* documentados y publicados |
| 5 | **Resuelto** | Se aplicó la solución definitiva, normalmente con un cambio |
| 6 | **Cerrado** | Se verificó que los incidentes no se repiten |

```
REGISTRADO ─▶ EN INVESTIGACIÓN ─▶ CAUSA RAÍZ IDENTIFICADA ─▶ ERROR CONOCIDO (KEDB) ─▶ RESUELTO ─▶ CERRADO
     │                                                              ▲
     └── si al registrarlo ya trae causa raíz o workaround ─────────┘  (nace como Error conocido)
```

---

## 3. Cómo nace un problema (orígenes)

### 3.1 Reactivo: desde un incidente
En el detalle del incidente, el botón **"Escalar a Problema"** (ver Gestión de Incidentes §4.3):
- `crearProblema()` con `id_ticket_origen` genera `PRB-AAAA-NNNN`.
- El problema queda en el **mismo grupo resolutor** que el incidente; el sistema lo exige.
- Vincula el incidente en `problema_incidente` y `ticket_incidente.id_problema`.

### 3.2 Proactivo: candidatos por patrones
**Gestión de Problemas → Candidatos** agrupa los incidentes recientes según las **reglas de detección** (Problemas → Configuración → Umbral de recurrencia). Cada regla define:

| Campo | Ejemplo |
|---|---|
| Agrupar por | Servicio, categoría, CI o código de resolución |
| Umbral | 3 incidentes o más |
| Ventana | En las últimas 24 horas |
| Prioridad mínima | Solo P1, P2 o superior, o todas |

Reglas de ejemplo:
- 3 incidentes del mismo servicio en 24 h;
- 5 incidentes del mismo CI en 7 días;
- cualquier incidente crítico (P1) en un servicio.

**Las reglas no crean problemas por sí solas.** El Gestor de Problemas revisa cada candidato y, si hay un patrón real, usa **"Convertir en problema"** (`convertirCandidato`): se crea el problema y se **vinculan todos esos incidentes** de una vez.

Detalles de la detección:
- Los incidentes **ya vinculados** a un problema no vuelven a proponerse.
- Los incidentes **sin el dato** de agrupación (sin servicio, sin CI…) no forman candidato.
- Ver las reglas exige `PROBLEMAS_CONFIG_VER`. Crearlas o modificarlas exige `PROBLEMAS_CONFIGURAR` (Administrador y Gestor de Problemas).

Las pestañas **Recurrentes** muestran el ranking de servicios, categorías o CI con más incidentes.

### 3.3 Registro directo
El **Gestor de Problemas** (o el Administrador) lo registra al detectar un riesgo sin incidentes previos. Por ejemplo, un aviso de un fabricante sobre una falla en un firmware.

**Quién puede registrar y para qué grupo:**

| Perfil | Alcance |
|---|---|
| Administrador / Gestor de Problemas | Cualquier grupo de TI |
| Supervisor | Solo los grupos que supervisa |
| Técnico | Solo su grupo resolutor |

---

## 4. Investigación y diagnóstico

1. **Asignación:** el responsable (`asignarProblema`) y el grupo resolutor.
2. **Vinculación de más incidentes:** solo de su mismo grupo, para medir el impacto acumulado.
3. **Análisis de causa raíz** (`guardarAnalisis`) con el método elegido:
   - **5 porqués**: preguntar "¿por qué?" hasta llegar a la causa;
   - **Ishikawa** (espina de pescado): personas, procesos, tecnología, entorno…;
   - **Línea de tiempo**: reconstruir la secuencia de eventos.

   La **conclusión** se guarda como `causa_raiz` del problema.
4. **Workaround:** solución temporal que permite restablecer el servicio mientras no exista la definitiva.

---

## 5. Error conocido (KEDB)

Cuando hay causa y *workaround*, se **publica en la KEDB** (`publicar_en_kedb` en `actualizarProblema`):

```ts
INSERT INTO error_conocido (id_problema, codigo_kedb, titulo, sintomas, workaround, solucion_definitiva)
-- código KEDB-NNN; el problema pasa a estado 4 y es_error_conocido = true
```

**Para qué sirve:** cuando llega un incidente con los mismos síntomas, el técnico **encuentra el error conocido y aplica el *workaround*** sin investigar de nuevo. Eso reduce el tiempo de resolución.

---

## 6. Solución definitiva y cierre

- La solución definitiva casi siempre **modifica la infraestructura**, así que pasa por **Gestión de Cambios** (§7.1).
- Una vez implementado el cambio y verificado que los incidentes no se repiten, el problema pasa a **Resuelto** y luego a **Cerrado**.
- **Problemas mayores** (impacto **alto** o prioridad **crítica**): su cierre necesita la **autorización formal** de un aprobador (`resolverProblema`):
  - **APROBADO**: es obligatorio describir el **riesgo residual aceptado**, y el problema pasa a su estado final;
  - **RECHAZADO**: el problema sigue abierto.

  Cada decisión queda en `problema_cierre_aprobacion`.
- **Objetivos de tiempo (OLA):** plazos internos para diagnosticar y resolver según la prioridad, configurables y medidos en los reportes.

---

## 7. Escalamientos desde un problema

### 7.1 Problema → Cambio (RFC)
Es el escalamiento natural: la causa raíz se elimina **modificando** algo.

- Desde **Gestión de Problemas → Cambios derivados** (`crearCambioDesdeProblema`):
  - se crea una RFC `RFC-AAAA-NNNN` de tipo **NORMAL** (por defecto) con `id_problema_origen`;
  - nace en estado **Registrado**;
  - el Gestor de Cambios la evalúa, completa sus planes y la envía al CAB.
- También se puede crear desde el formulario de cambios eligiendo el **problema de origen**.
- La pantalla lista los problemas abiertos que **aún no tienen RFC**, para que no se olviden.

### 7.2 Problema → Conocimiento
Desde **Conocimiento derivado** (`crearArticuloDesdeProblema`) se crea un artículo `KB-AAAA-NNNN` en estado **BORRADOR**, con `id_problema_origen`. Esto aplica a problemas que ya son error conocido, están resueltos o están cerrados. Así el *workaround* o la solución llegan también a los usuarios y a la Mesa de Ayuda.

### 7.3 Problema ↔ Incidente mayor
El incidente mayor se gestiona **solo desde Incidentes** (una única implementación, código `IM-…`). Al declararlo, o después desde su expediente, se le puede **vincular el problema** que investiga la causa. La sala de crisis muestra entonces los incidentes asociados a ese problema. El panel de Problemas cuenta los incidentes mayores **activos** (abiertos o mitigados) con la misma regla que el panel de Supervisión.

### 7.4 Problema → Incidentes (retorno)
El error conocido y la solución vuelven a Incidentes: los incidentes vinculados se resuelven con el *workaround* o quedan resueltos de forma definitiva cuando se implementa el cambio.

---

## 8. Resumen visual

```
  Incidentes repetidos ──┐
  "Escalar a Problema" ──┼──▶ PROBLEMA ──▶ Análisis RCA ──▶ ERROR CONOCIDO (KEDB) ──▶ workaround a Incidentes
  Registro proactivo ────┘        │                               │
                                  │                               └──▶ Artículo de conocimiento (KB)
                                  └──▶ RFC (Cambio normal) ──▶ implementación ──▶ PROBLEMA RESUELTO / CERRADO
```
