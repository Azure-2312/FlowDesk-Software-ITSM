# Plan de Asignación y Especificación Técnica — Nain (Gestión de Cambios y CMDB)

> **Documento de especificación técnica y de desarrollo para el asistente IA.**
> **Responsable:** Nain
> **Módulos Asignados (100% Independientes y Aislados):**
> 1. [src/modules/cambios](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/cambios) (Habilitación del Cambio ITIL 4 Change Enablement, Solicitudes de Cambio RFC, Matriz de Autoridad CAB/ECAB, Calendario, Ventanas y Congelamiento)
> 2. [src/modules/cmdb](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/cmdb) (Gestión de Configuración del Servicio SACM ITIL 4, Elementos de Configuración CIs, Topología de Dependencias, Análisis de Impacto y Líneas Base)
> 
> **Frontera de Trabajo Estricta:**
> - Nain **NO** interviene en el módulo de activos (`src/modules/activos`), el cual fue reasignado a Lourdes dentro del bloque de aprovisionamiento y recursos TI.
> - Nain **NO** interviene en proveedores (`src/modules/proveedores`) ni modifica consolas de perfiles (`src/modules/perfiles/*`).
> - Todo su código, backend, controladores, vistas y configuración se circunscriben estrictamente a `cambios` y `cmdb`.

---

## 1. Visión Arquitectónica y Principios de Diseño

### 1.1 Principio de Correspondencia Menú-Directorio (Modularidad Estricta)
Cada opción de menú en el árbol lateral nace directamente de una subcarpeta o archivo dedicado:
- En `src/modules/cambios`:
  - 8 submódulos en `config/`: `flujo-evaluacion/`, `formulario/`, `matriz-autoridad/`, `modelos-estandar/`, `notificaciones-calendario/`, `plantillas/`, `reglas-clasificacion/`, `tipos-requisitos/`.
  - Vistas operativas: `VistaCab.tsx`, `VistaCalendarioCambios.tsx`, `VistaCambios.tsx`, `VistaCambiosEmergencia.tsx`.
- En `src/modules/cmdb`:
  - Configuración modular en `src/modules/cmdb/config/cmdb-relaciones/`, separada por clases de CI, tipos de relación, reglas de integridad referencial y auditoría de líneas base.
  - Vistas: `VistaCmdbCi.tsx`, `VistaCmdbRelaciones.tsx`, `VistaCmdbLineasBase.tsx`, `VistaCmdbTopologia.tsx`.

### 1.2 Mecanismo de Sincronización Multi-Perfil en Tiempo Real
La dupla Cambios-CMDB es el núcleo de estabilidad tecnológica de la empresa:
1. **Detección Automática de Conflictos y Congelamientos (Freeze) en Calendario:**
   - Cuando el Gestor de Cambios define una ventana de mantenimiento o un congelamiento institucional en `src/modules/cambios`:
     - El motor de notificaciones alerta en tiempo real a los técnicos que intenten crear una RFC que coincida con ese rango de fechas.
     - En la consola del **Gestor de Área**, se actualiza de inmediato el cronograma de indisponibilidad programada.
2. **Impacto en Cascada CMDB ante Cambios de Producción:**
   - Al registrar una RFC sobre un servidor o base de datos en `src/modules/cambios`:
     - El sistema consulta a `src/modules/cmdb` para calcular el árbol de dependencias hacia arriba (Upstream).
     - La tarjeta del CAB (`VistaCab.tsx`) despliega la lista consolidada de CIs y servicios en riesgo antes de la votación.

---

## 2. Inventario Exhaustivo Actual y Estado de Situación

### 2.1 Módulo: Gestión de Cambios — `src/modules/cambios`

| Ruta del Archivo / Carpeta | Tipo de Elemento | Estado Actual | Evaluación Técnica frente a ITIL 4 |
| :--- | :--- | :--- | :--- |
| `src/modules/cambios/config/flujo-evaluacion/VistaFlujoEvaluacion.tsx` | Vista Config | 100% avanzado | Definición de etapas, quórum de aprobación, temporizadores de evaluación y escalamiento. |
| `src/modules/cambios/config/formulario/VistaFormularioCambios.tsx` | Vista Config | 100% avanzado | Diseñador del formulario de RFC con campos condicionales y previsualización. |
| `src/modules/cambios/config/matriz-autoridad/VistaMatrizAutoridad.tsx` | Vista Config | 100% avanzado | Matriz de autoridad (Estándar, Menor, Normal, Emergencia) según riesgo e impacto. |
| `src/modules/cambios/config/modelos-estandar/VistaModelosEstandar.tsx` | Vista Config | 100% avanzado | Catálogo de cambios preaprobados con planes de trabajo y rollback predefinidos. |
| `src/modules/cambios/config/notificaciones-calendario/VistaNotificacionesCalendario.tsx` | Vista Config | 100% avanzado | Gestión de ventanas de mantenimiento, feriados, blackout periods y alertas. |
| `src/modules/cambios/views/VistaCab.tsx` | Consola CAB | 100% avanzado | Panel de votación colegiada del Change Advisory Board con registro de quórum. |
| `src/modules/cambios/views/VistaCalendarioCambios.tsx` | Vista Calendario | 100% avanzado | Calendario visual interactivo con ventanas de mantenimiento y marcas de congelamiento. |
| `src/modules/cambios/views/VistaCambios.tsx` | Vista Master | 100% avanzado | Listado integral de cambios con filtros facetados por tipo, estado y riesgo. |

### 2.2 Módulo: Gestión de Configuración (CMDB) — `src/modules/cmdb`

| Ruta del Archivo / Carpeta | Tipo de Elemento | Estado Actual | Evaluación Técnica frente a ITIL 4 SACM |
| :--- | :--- | :--- | :--- |
| `src/modules/cmdb/views/VistaCmdbCi.tsx` | Vista Master | 100% avanzado | Inventario de Elementos de Configuración (CIs) con criticidad, entorno y versión. |
| `src/modules/cmdb/views/VistaCmdbRelaciones.tsx` | Vista Relaciones | 100% avanzado | Mapa de relaciones lógicas y físicas (Depende de, Conectado a, Aloja a). |
| `src/modules/cmdb/views/VistaCmdbLineasBase.tsx` | Vista Auditoría | 100% avanzado | Comparativa de líneas base autorizadas contra la infraestructura real. |
| `src/modules/cmdb/views/VistaCmdbTopologia.tsx` | Vista Gráfica | 100% avanzado | Visualizador interactivo del grafo de dependencias y análisis de impacto en cascada. |
| `src/modules/cmdb/config/cmdb-relaciones/VistaConfigRelaciones.tsx` | Vista Config | 100% avanzado | Definición de tipos de aristas y reglas de integridad para evitar bucles cíclicos. |

---

## 3. Instrucciones Específicas de Ejecución
1. Concentrarse exclusivamente en `src/modules/cambios` y `src/modules/cmdb`. No editar archivos ajenos.
2. Garantizar que toda RFC normal valide contra el calendario de freeze antes de permitir la programación.
3. Asegurar que las relaciones CMDB eviten ciclos infinitos mediante validación algorítmica.
4. Compilar con `npm run build` manteniendo cero errores TypeScript y cero emojis.
