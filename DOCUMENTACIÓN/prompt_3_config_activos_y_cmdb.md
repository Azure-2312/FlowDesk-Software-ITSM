# PROMPT 3 de 3 — Configuración del administrador: ACTIVOS Y CMDB

> **Rama del menú que se implementa:** `1 Configuración > 1.5 Activos y configuración`
> **Prompts hermanos:** Prompt 1 = Gestión de problemas (1.3.4) · Prompt 2 = Gestión de cambios (1.3.3).
> **Idioma de la interfaz:** español. **Código, tablas y endpoints:** nombres en español snake_case salvo convención técnica.
> **Stack real del proyecto:** Next.js (frontend + backend) y PostgreSQL alojado en Supabase. Tienes acceso completo al código, la base de datos, el frontend y el backend.
> **Versión del documento:** 1.0 (incorpora los hechos confirmados: el formulario de Incidentes ya ofrece un selector "Elemento CMDB" con ítems bajo custodia del usuario; existe un creador de campos; perfiles reales; no existen calendarios ni datos de ubicaciones).

---

## 0. Instrucciones para la IA que implementará esto

**Rol:** eres un arquitecto/desarrollador senior de software ITSM. Vas a construir el área de configuración del *administrador* para Gestión de Activos de TI (HAM/SAM) y Gestión de la Configuración (CMDB) de un sistema ITSM que ya tiene Incidentes y Solicitudes de servicio.

**Importante:** los activos **no son tickets**. Son registros de inventario con ciclo de vida. Lo que sí es ticket es, por ejemplo, la *solicitud de adquisición* (una solicitud de servicio) y los incidentes, problemas y cambios que se vinculan al activo.

**Reglas obligatorias:**

1. Implementa **exactamente** lo descrito. Si algo no está especificado, **no lo inventes**: antes de escribir código, devuelve una lista numerada de "Preguntas abiertas" (ver sección 15) y espera respuesta.
2. **No cambies la numeración ni los nombres del menú.** En este prompt no hay renombres.
3. **Nada hardcodeado:** todo lo "configurable" se guarda en base de datos y se lee en tiempo de ejecución. Los valores de fábrica (sección 11) se cargan como datos semilla.
4. Todas las pantallas siguen el **patrón común de la sección 3** (borrador, publicación, versionado, auditoría, permisos). Si los Prompts 1 o 2 ya se implementaron, **reutiliza el mismo componente de pantalla de configuración**.
5. **Reutiliza lo que ya existe; no crees duplicados** (sección 12): la estructura de datos que hoy alimenta el selector "Elemento CMDB" del formulario de Incidentes (**es la base que se extiende, no se reemplaza ni se duplica**), el editor de formulario y el **creador de campos** (se extienden a las entidades `activo`, `licencia` y `contrato`), la matriz de prioridad, el catálogo de servicios, los departamentos, los perfiles, el sistema de notificaciones y, si ya existen, el constructor de reglas y el motor de estados de los Prompts 1 y 2.
6. Para cada pantalla entrega, en este orden: (a) modelo de datos, (b) API, (c) interfaz, (d) validaciones, (e) permisos, (f) auditoría, (g) pruebas.
7. Trabaja por etapas y detente al final de cada una para validación: **Etapa 0** = reconocimiento del código y la base de datos (sección 15, **obligatoria antes de escribir código**), **Etapa A** = 1.5.1, **Etapa B** = 1.5.2, **Etapa C** = 1.5.3, **Etapa D** = 1.5.4. *Dependencias entre etapas:* el formulario de activo (Etapa A) necesita un ciclo de vida mínimo para el estado inicial (carga el ciclo de fábrica ya en la Etapa A) y muestra la sección CMDB con relaciones en modo provisional hasta la Etapa D.
8. **Si falta un dato en la base de datos, agrégalo** (sección 13), con migraciones SQL versionadas, idempotentes y políticas RLS de Supabase coherentes con las de las tablas de configuración existentes. **La migración de datos existentes no debe romper Incidentes** (el selector "Elemento CMDB" debe seguir funcionando igual).
9. Sigue las convenciones ya presentes en el repositorio (carpetas, estilo de API, componentes de UI, manejo de errores, tareas programadas).
10. **Integridad:** las reglas críticas (transiciones permitidas, campos obligatorios por transición, unicidad de serie/código/hostname, un solo custodio vigente, integridad de relaciones, atributos protegidos, cumplimiento de licencias) **se validan en el backend o en la base de datos**, no solo en la interfaz.
11. **Un solo registro maestro por elemento:** "activo" y "CI" son dos *vistas* del mismo registro (un activo inventariable puede ser CI; un servicio o aplicación puede ser CI sin ser un activo con costo). No crees dos tablas que dupliquen el mismo elemento.
12. **Datos sensibles** (claves de licencia, contraseñas de equipos si existieran, números de contrato confidenciales): cifrados en reposo (por ejemplo `pgcrypto` o Supabase Vault), enmascarados en la interfaz, visibles solo a perfiles autorizados, y cada revelación queda auditada.
13. Fechas como `timestamptz` en UTC, mostradas en la zona horaria del sistema (parámetro configurable; si no existe, créalo).

---

## 1. Marco normativo y de buenas prácticas

El diseño debe respetar:

| Referencia | Qué se toma de ella |
|---|---|
| **ITIL 4 – IT Asset Management** | Registro y control del ciclo de vida completo del activo (planificar, adquirir, desplegar, operar, mantener, retirar), propiedad y custodia, control financiero y de cumplimiento (licencias, contratos, garantías). |
| **ITIL 4 – Service Configuration Management** | CMDB con información exacta y confiable de los CI y sus relaciones; control de cambios sobre la CMDB; verificación y auditoría; líneas base. |
| **ITIL 4 – Prácticas relacionadas** | Change Enablement (la CMDB se actualiza por cambios autorizados), Incident y Problem Management (activos como contexto), Supplier Management (contratos y proveedores), Service Request Management (adquisición), Knowledge Management. |
| **ITIL 4 – Principios rectores** | Enfocarse en el valor, empezar donde se está, progresar iterativamente, colaborar, pensar y trabajar de forma holística, mantenerlo simple, optimizar y automatizar. (Aplicación: pocos atributos obligatorios, plantillas por tipo, automatización de alertas y asignaciones.) |
| **ISO/IEC 20000-1:2018, 8.2.5 (Gestión de activos) y 8.2.6 (Gestión de la configuración)** | Identificación y registro de activos incluidos los de licencia y contratos; control de acceso y cumplimiento de licencias; información de configuración con línea base; trazabilidad entre CI y cambios. |
| **ISO/IEC 19770-1 (ITAM) y buenas prácticas SAM** | Inventario de licencias frente a derechos adquiridos, cumplimiento y ciclo de vida del software. |
| **ISO/IEC 27001:2022 (controles A.5.9, A.5.10, A.5.11, A.7.14, A.8.10, A.5.32)** | Inventario de activos asociados a la información, uso aceptable, devolución de activos, reutilización o eliminación segura de equipos, borrado de información, derechos de propiedad intelectual (licencias). |
| **COBIT 2019 – BAI09 (Managed Assets) y BAI10 (Managed Configuration)** | Inventario, optimización del uso de activos, gestión de licencias, configuración como base de control. |
| **Gobierno y auditoría (buena práctica)** | Trazabilidad completa e inmutable de asignaciones, transiciones, bajas y cambios en la CMDB; toda modificación de configuración queda auditada (quién, cuándo, antes, después, motivo). |

**Definiciones que deben respetarse en todo el sistema:**
- **Activo de TI:** elemento con valor para la organización que se inventaría y controla (hardware, software, licencias, equipos de red, etc.).
- **Elemento de configuración (CI):** cualquier componente que debe gestionarse para entregar un servicio de TI. Todo CI tiene atributos y relaciones. No todo CI es un activo con costo (ej. un servicio o una aplicación).
- **CMDB:** conjunto de CI, sus atributos y relaciones.
- **Línea base:** instantánea aprobada de CI y relaciones en un momento dado.
- **Ciclo de vida:** conjunto de estados y transiciones por las que pasa un activo desde que se solicita hasta que se da de baja.
- **Custodio:** persona responsable del uso y cuidado de un activo asignado.
- **Licencia (derecho de uso):** autorización para usar software bajo una métrica (usuario, dispositivo, núcleo, etc.); se controla frente a su consumo.
- **Cumplimiento (compliance):** consumo de licencias dentro de los derechos adquiridos.
- **Criticidad:** importancia del CI para el negocio; se usa para evaluar impacto y riesgo en incidentes, problemas y cambios.
- **Exactitud de la CMDB:** grado en que los datos reflejan la realidad.
- **Disposición:** destino final de un activo dado de baja (venta, donación, reciclaje, devolución).

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
  1.3.3 Gestión de cambios              (Prompt 2)
   1.3.3.1 Configuración de formulario
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
 1.5 Activos y configuración            <-- SE IMPLEMENTA EN ESTE PROMPT
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

### 2.2 Convención de numeración interna
- `1.5.1`, `1.5.2`, `1.5.3`, `1.5.4` son **ítems de menú = pantallas**.
- Los puntos `1.5.1.1`, `1.5.1.2`, etc. son **pestañas (tabs) dentro de la pantalla**. Cada pestaña lleva en su título el número (ej. "1.5.1.4 Configuración de formulario del activo").

| Pantalla (ítem de menú) | Pestañas |
|---|---|
| **1.5.1 Tipos, modelos y atributos de activos** | 1.5.1.1 Jerarquía de clases y tipos · 1.5.1.2 Fabricantes y modelos · 1.5.1.3 Atributos por tipo · 1.5.1.4 Configuración de formulario del activo · 1.5.1.5 Código de activo y etiquetas · 1.5.1.6 Ubicaciones · 1.5.1.7 Listas y catálogos auxiliares · 1.5.1.8 Ficha del activo y listado · 1.5.1.9 Importación masiva e inventario físico |
| **1.5.2 Ciclos de vida y reglas de transición** | 1.5.2.1 Ciclos de vida y estados · 1.5.2.2 Transiciones y reglas · 1.5.2.3 Asignación, custodia y devolución · 1.5.2.4 Adquisición y recepción · 1.5.2.5 Mantenimiento y fin de vida · 1.5.2.6 Baja y disposición |
| **1.5.3 Licencias y contratos** | 1.5.3.1 Tipos de licencia y métricas · 1.5.3.2 Tipos de contrato y proveedores · 1.5.3.3 Configuración de formulario de licencia y contrato · 1.5.3.4 Cumplimiento y sobreuso · 1.5.3.5 Alertas de vencimiento y garantía · 1.5.3.6 Renovación |
| **1.5.4 Tipos de elementos de configuración y relaciones de CMDB** | 1.5.4.1 Clases de CI · 1.5.4.2 Tipos de relación · 1.5.4.3 Criticidad y entornos · 1.5.4.4 Reglas de integridad · 1.5.4.5 Fuentes de datos y atributos protegidos · 1.5.4.6 Auditoría de CMDB y líneas base |

### 2.3 Pantallas operativas que esta configuración gobierna (ya aparecen en el menú general)
`7 Activos y CMDB > 7.1 Inventario de activos (HAM) · 7.2 Mapa de topología CMDB · 7.3 Licencias de software (SAM) · 7.4 Modelado de clases CI` y `8 Proveedores y Contratos TI`.
- **1.5.4 es la fuente de verdad** de las clases y relaciones; `7.4 Modelado de clases CI` es su **visualización** (diagrama de solo lectura con enlace de vuelta a 1.5.4.1), no una segunda configuración.
- Los registros de licencias se mantienen en `7.3` y los de contratos y proveedores en `8`; sus campos, reglas y alertas se configuran en 1.5.3.
- Las secciones 4 y 5 describen lo que deben mostrar el formulario y la ficha. Si alguna pantalla operativa aún no existe, aplica la pregunta 1 de la sección 15.

---

## 3. Patrón común de TODAS las pantallas de configuración

Aplica a cada pantalla y pestaña de este documento. **No se repite abajo**; solo se indican los botones y reglas *adicionales* de cada pestaña.

### 3.1 Estructura visual
1. **Breadcrumb:** `Configuración > Activos y configuración > <pantalla> > <pestaña>`.
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

## 4. ESPECIFICACIÓN DE LOS FORMULARIOS (lo que ve el usuario)

Los activos **no son tickets**: no tienen prioridad ni SLA; tienen **estado de ciclo de vida**. Esta sección define la **versión de fábrica** de tres formularios: activo (4.1), licencia (4.2) y contrato (4.3). Las secciones 6 a 9 definen cómo el administrador los modifica.

### 4.1 Formulario de activo / CI

**Quién lo usa:** perfil **Gestor de Activos y Configuración** y **Administrador** (permiso `activos.crear`). El perfil **Técnico** puede editar solo los atributos técnicos (`activos.editar_tecnico`).
**Dónde:** `7 Activos y CMDB > 7.1 Inventario de activos (HAM) > [+ Nuevo activo]`; también desde la recepción de una solicitud de adquisición (1.5.2.4) y desde la importación masiva (1.5.1.9).
**Disposición:** una página con **secciones plegables**; a la derecha, panel fijo "Resumen" con código, estado, **porcentaje de completitud** de datos y advertencias de calidad (campos recomendados vacíos).

**Sección A — Identificación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas y comportamiento |
|---|---|---|---|---|---|
| A1 | Código del activo | `codigo` | Texto de solo lectura | Automático | Se genera al guardar según el formato de 1.5.1.5. Único. No se reutiliza. |
| A2 | Nombre / hostname | `nombre` | Texto | Sí | 3–80 caracteres. Si el tipo exige hostname único, se valida en servidor. |
| A3 | Clase y tipo | `clase_id`, `tipo_id` | Listas en cascada (Clase → Tipo) | Sí | Determina atributos técnicos, ciclo de vida, formato de código y campos obligatorios. No editable después de crear si hay tickets, licencias o relaciones asociadas (se ofrece el asistente "Reclasificar" con motivo). |
| A4 | Fabricante | `fabricante_id` | Lista con búsqueda (catálogo 1.5.1.2) | Según tipo | |
| A5 | Modelo | `modelo_id` | Lista dependiente del fabricante y el tipo | Sí si el tipo lo exige | Al elegir el modelo se **prellenan** atributos técnicos, garantía estándar y vida útil (editables). |
| A6 | Número de serie | `numero_serie` | Texto | Según tipo | Único por fabricante. Advertencia de duplicado con enlace. |
| A7 | Estado del ciclo de vida | `estado_id` | Lista (solo al crear) / insignia | Sí | Al crear: solo estados iniciales del ciclo del tipo. Después, **solo cambia mediante transiciones** (1.5.2.2); en edición se muestra como insignia de solo lectura. |
| A8 | Descripción | `descripcion` | Texto | No | |
| A9 | Etiquetas | `etiquetas` | Chips libres | No | Máx. 10; sugerencias de las ya usadas. |

**Sección B — Asignación y ubicación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| B1 | Tipo de asignación | `tipo_asignacion` | Lista (Personal, Compartido o departamental, Préstamo temporal, A ubicación o servicio) | Sí si estado = Asignado | Catálogo de 1.5.2.3. |
| B2 | Usuario asignado / custodio | `custodio_id` | Lista con búsqueda de usuarios | Sí si el tipo de asignación es Personal o Préstamo | **Un solo custodio vigente.** Este campo es el que usa el selector "Elemento CMDB" de Incidentes para listar los ítems bajo custodia del usuario. |
| B3 | Departamento | `departamento_id` | Lista (1.4.1) | Según tipo | Se sugiere el del custodio. |
| B4 | Ubicación | `ubicacion_id` | Selector en árbol (Sede > Edificio > Piso > Oficina…) | Según tipo | Catálogo 1.5.1.6. Muestra la ruta completa. |
| B5 | Fecha de asignación | `fecha_asignacion` | Fecha | Automática | La fija la transición *Asignar*; editable solo con motivo. |
| B6 | Centro de costo | `centro_costo_id` | Lista | No | Catálogo 1.5.1.7. |

**Sección C — Adquisición y finanzas**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| C1 | Proveedor | `proveedor_id` | Lista (módulo 8) | Según tipo | |
| C2 | Tipo de adquisición | `tipo_adquisicion` | Lista (Compra, Arrendamiento, Donación, Comodato, Otro) | No | |
| C3 | Orden de compra | `orden_compra` | Texto | Según estado (obligatorio al pasar a *Ordenado*) | |
| C4 | Factura | `factura` | Texto + adjunto | No | |
| C5 | Ticket de solicitud de origen | `ticket_origen` | Buscador de solicitudes de servicio | No | Se llena automáticamente cuando el activo nace de una solicitud de adquisición; vínculo bidireccional. |
| C6 | Fecha de compra | `fecha_compra` | Fecha | No | No posterior a la fecha de recepción. |
| C7 | Costo y moneda | `costo`, `moneda` | Decimal ≥ 0 + lista | No | Moneda de catálogo 1.5.1.7. |
| C8 | Fecha de recepción | `fecha_recepcion` | Fecha | Automática al recibir | |
| C9 | Inicio y fin de garantía | `garantia_inicio`, `garantia_fin` | Fechas | No | El fin se calcula con la garantía estándar del modelo y se puede editar. Fin ≥ inicio. |
| C10 | Contrato de mantenimiento | `contrato_id` | Lista de contratos vigentes | No | |
| C11 | Valor residual | `valor_residual` | Decimal | No | |

**Sección D — Ciclo de vida**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| D1 | Fecha de ingreso | `fecha_ingreso` | Fecha | Automática | |
| D2 | Puesta en producción | `fecha_produccion` | Fecha | No | |
| D3 | Vida útil estimada (meses) y fecha de fin de vida | `vida_util_meses`, `fecha_fin_vida` | Número + fecha calculada | No | Se prellena desde el modelo; la fecha se calcula desde la puesta en producción o recepción. |
| D4 | Fecha y motivo de baja | `fecha_baja`, `motivo_baja_id` | Solo lectura | Se completan en la transición de baja | |

**Sección E — Atributos técnicos (dinámica según el tipo)**
Se genera con los atributos definidos en 1.5.1.3. Ejemplos de fábrica: *Hardware:* procesador, RAM, disco, sistema operativo, dirección IP, dirección MAC. *Software/licencia:* versión, edición, tipo de licencia, cantidad total y en uso, fecha de vencimiento, clave (sensible). *Red:* puertos, firmware, VLAN. Los atributos marcados "sensibles" se muestran enmascarados con botón **[Mostrar]** (requiere permiso y queda auditado).

**Sección F — CMDB**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| F1 | ¿Es elemento de configuración? | `es_ci` | Casilla | Sí | Valor por defecto según la clase (1.5.4.1). |
| F2 | Criticidad | `criticidad_id` | Lista | Sí si es CI | Catálogo 1.5.4.3. Se muestra también la **criticidad efectiva** (si la regla de herencia está activa). |
| F3 | Entorno | `entorno_id` | Lista | Sí si es CI | Producción, Preproducción, Pruebas, Desarrollo, Contingencia. |
| F4 | Servicios que soporta | `servicios` | Selector múltiple (catálogo 1.2) | Según clase | |
| F5 | Responsable técnico | `responsable_tecnico_id` | Usuario | Según clase | |
| F6 | Responsable de negocio | `responsable_negocio_id` | Usuario o departamento | Según clase | |
| F7 | Relaciones con otros CI | `relaciones` | Subtabla editable (tipo de relación, CI destino, comentario) | Según clase | Solo se ofrecen los tipos de relación permitidos entre las clases (1.5.4.2); se valida que no cree ciclos prohibidos. |
| F8 | Fuente del dato | `fuente_dato` | Solo lectura | Automática | Manual, Importación, Cambio (RFC), etc. |

**Sección G — Otros**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| G1 | Notas | `notas` | Texto enriquecido | No | |
| G2 | Adjuntos | `adjuntos` | Arrastrar-y-soltar con **tipo de documento** (Factura, Garantía, Acta de entrega, Manual, Foto, Otro) | No | Límites según 1.8.3 (fábrica 25 MB por archivo). |
| G3 | Última verificación física | `fecha_ultima_verificacion` | Solo lectura | Automática | La actualizan los conteos de inventario. |

**Campos automáticos (panel lateral):** `id`, `creado_por`, `fecha_creacion`, `modificado_por`, `fecha_modificacion`, `completitud` (%).

**Botones del formulario:** **[Guardar]** (primario) · **[Guardar y crear otro]** · **[Guardar y asignar…]** (abre la transición *Asignar*) · **[Duplicar activo]** (copia atributos, limpia código, serie, hostname, IP y MAC) · **[Imprimir etiqueta]** (tras guardar) · **[Cancelar]**.

**Validaciones (también en servidor):** obligatorios según clase/tipo/estado; unicidad de código, serie (por fabricante), hostname e IP (si el atributo está marcado único); formato de IP/MAC; garantía fin ≥ inicio; fecha de compra ≤ recepción; custodio obligatorio si hay asignación; ubicación en una ubicación activa; no se permite elegir un estado distinto del inicial al crear; si hay `relaciones`, ambos extremos deben existir y estar activos.

### 4.2 Formulario de licencia (SAM)

**Dónde:** `7.3 Licencias de software (SAM) > [+ Nueva licencia]`. **Usan:** Gestor de Activos y Configuración, Administrador.

| Sección | Campos |
|---|---|
| **Identificación** | Código de licencia (automático) · Nombre del producto * · Fabricante/editor * · Versión y edición · Tipo de licencia * (1.5.3.1) · Métrica de licenciamiento * (usuario, dispositivo, núcleo, instancia, sitio…) |
| **Derechos y consumo** | Cantidad adquirida * · Cantidad en uso (calculada) · Disponibles (calculada) · Estado de cumplimiento (calculado: Cumple / En riesgo / Sobreuso / Vencida) · Instalaciones o usos permitidos · Clave o serial (**sensible**) |
| **Vigencia** | Fecha de adquisición · Inicio · Vencimiento (obligatorio si el tipo vence) · Soporte incluido hasta · Renovación automática (sí/no) · Preaviso de renovación (días) |
| **Adquisición y finanzas** | Proveedor · Orden de compra · Factura · Costo y moneda · Contrato asociado · Ticket de solicitud de origen |
| **Responsabilidad** | Responsable de la licencia · Departamento propietario · Notas |
| **Asignaciones** | Subtabla: asignado a (usuario / activo / servicio), cantidad, fecha, quién asignó, estado (Activa / Liberada). Botones **[Asignar]** · **[Liberar]** · **[Reasignar]**. |
| **Adjuntos** | Prueba de adquisición, EULA, certificado. |

### 4.3 Formulario de contrato

**Dónde:** `8 Proveedores y Contratos TI > [+ Nuevo contrato]`. **Usan:** Gestor de Activos y Configuración, Administrador (los Gestores de Área ven los de su departamento).

| Sección | Campos |
|---|---|
| **Identificación** | Número de contrato * · Título * · Tipo de contrato * (1.5.3.2) · Proveedor * · Estado (Borrador, Vigente, Por vencer, Vencido, Renovado, Terminado) |
| **Vigencia** | Fecha de inicio * · Fecha de fin * · Renovación automática (sí/no) · Preaviso de no renovación (días) · Fecha límite de decisión (calculada) |
| **Económico** | Monto total y/o periódico · Moneda · Periodicidad de pago · Orden de compra |
| **Alcance** | Descripción · Activos cubiertos (múltiple) · Licencias cubiertas (múltiple) · Servicios cubiertos (múltiple) |
| **Niveles de servicio del proveedor** | Tiempos de respuesta y resolución por severidad (tabla), cláusulas de penalidad (texto) |
| **Responsabilidad** | Responsable del contrato · Departamento · Contacto del proveedor (nombre, correo, teléfono) |
| **Adjuntos y notas** | Contrato firmado, anexos, notas |

---

## 5. ESPECIFICACIÓN DE LA FICHA DEL ACTIVO (lo que ve el usuario)

**Ruta:** `7.1 Inventario de activos (HAM) > (fila) <código del activo>`, y desde cualquier enlace a un activo. Un CI lógico (servicio, aplicación) abre la misma ficha adaptada a su clase.
**Layout:** cabecera fija + barra de acciones + pestañas + panel lateral.

### 5.1 Cabecera fija
**Código**, **nombre**, **insignia de estado** (color del catálogo), **clase / tipo**, **fabricante y modelo**, **criticidad** (insignia), **entorno**, **custodio** (con avatar), **ubicación** (ruta corta), **indicador de garantía** (Vigente / Por vencer en N días / Vencida / Sin garantía), **indicador de fin de vida** (si aplica) y **completitud de datos** (%). Etiquetas cuando apliquen: `Problema abierto`, `Error conocido`, `RFC programada`, `En mantenimiento`, `Sin custodio`, `No verificado hace N días`.

### 5.2 Barra de acciones
Los botones de **transición** se generan dinámicamente desde 1.5.2.2 según el estado, el tipo y el perfil (ej. [Asignar], [Transferir], [Devolver], [Enviar a reparación], [Retirar], [Reportar pérdida o robo], [Solicitar baja]). Siempre presentes según permisos: **[Editar]**, **[Duplicar]**, **[Imprimir etiqueta]**, **[Crear incidente sobre este activo]**, **[Crear RFC sobre este activo]**, **[Ver en mapa CMDB]**, **[Exportar PDF]** y el menú **[⋯]** (*Copiar enlace*, *Reclasificar*, *Fusionar duplicado*). Los botones sin permiso o con requisitos pendientes aparecen deshabilitados con tooltip que explica el motivo.

### 5.3 Panel lateral (resumen)
Estado y tiempo en el estado actual · Custodio y desde cuándo · Servicios que soporta · Nº de CI dependientes · Tickets abiertos (incidentes, problemas, RFC) · Contrato de mantenimiento · Licencias asignadas (nº) · Próximo mantenimiento · Próxima verificación física · Alertas activas (garantía, vencimientos, calidad de datos).

### 5.4 Pestañas

**5.4.1 General** — Identificación, adquisición y finanzas (con el ticket de origen enlazado), ciclo de vida y fechas clave. Campos financieros visibles solo para perfiles con `activos.ver_financiero`.
**5.4.2 Atributos técnicos** — Atributos del tipo agrupados por sección; los sensibles enmascarados; los protegidos (1.5.4.5) con ícono 🔒 y la indicación "Se modifica mediante RFC".
**5.4.3 Asignación y ubicación** — Asignación actual (custodio, tipo, desde, acta de entrega y su aceptación) + **historial de asignaciones** (custodio, desde, hasta, tipo, motivo, quien asignó, condición al devolver). Ubicación actual y su historial de movimientos.
**5.4.4 CMDB y relaciones** — Tabla de relaciones (tipo directo e inverso, CI relacionado, clase, criticidad, estado) con [Agregar relación] y [Quitar] (motivo); **mini-mapa** de relaciones a 1 nivel con zoom; bloque **"Impacto"**: servicios que soporta y CI que dependen de este (hasta la profundidad configurada); bloque **"Criticidad efectiva"**.
**5.4.5 Tickets asociados** — Incidentes, problemas, RFC y solicitudes vinculados, con filtros por tipo y estado, contadores de abiertos y cerrados, fecha del último incidente y gráfico mensual de incidentes del activo.
**5.4.6 Mantenimiento y garantía** — Plan de mantenimiento preventivo (próxima fecha), historial de mantenimientos (fecha, tipo, proveedor, ticket, costo, resultado), garantía (inicio, fin, proveedor) y contratos de cobertura.
**5.4.7 Software y licencias** — Para hardware: licencias asignadas y software relacionado; para licencias: asignaciones.
**5.4.8 Documentos** — Adjuntos por tipo de documento, con versión y quién subió.
**5.4.9 Verificación e inventario** — Historial de conteos físicos (fecha, campaña, resultado: Encontrado / No encontrado / Ubicación distinta / Dañado, verificado por).
**5.4.10 Comentarios y bitácora** — Línea de tiempo con filtros (*Todo · Comentarios · Cambios de estado · Asignaciones · Sistema*); los comentarios se anulan con motivo, no se borran.
**5.4.11 Historial / auditoría** — Tabla inmutable de cambios de campo (fecha-hora, usuario, campo, valor anterior y nuevo, comentario, origen: manual / importación / RFC). Solo con `activos.auditoria.ver`.

### 5.5 Reglas de visibilidad
Cada pestaña tiene "visible para clases/tipos" y "visible para perfiles" (1.5.1.8). De fábrica: *Software y licencias* solo para hardware y licencias; *CMDB y relaciones* solo si `es_ci`; *Mantenimiento* solo para clases con mantenimiento; *Financiero* solo para perfiles autorizados.

---

## 6. PANTALLA 1.5.1 — TIPOS, MODELOS Y ATRIBUTOS DE ACTIVOS

**Propósito:** definir qué clases de activos existen, qué atributos tiene cada tipo, qué se captura en el formulario, cómo se codifican y dónde se ubican.
**Reutilización obligatoria:** el editor de formulario y el creador de campos de Incidentes se extienden a las entidades `activo`, `licencia` y `contrato`; la estructura que hoy alimenta el selector "Elemento CMDB" se extiende, no se reemplaza.

---

### 6.1 Pestaña 1.5.1.1 — Jerarquía de clases y tipos

**Qué se configura:** la jerarquía **Clase > Tipo** (y el modelo, 1.5.1.2, como tercer nivel) que clasifica todo el inventario.

**Layout:** a la izquierda, árbol de clases y tipos (con buscador y contador de activos por nodo); a la derecha, panel de propiedades del nodo seleccionado.

**Botones del árbol:** `[+ Clase]` · `[+ Tipo]` (dentro de la clase seleccionada) · `[Mover]` (reparentar) · `[Duplicar]` · `[Desactivar/Activar]` · `[Eliminar]` · `[Expandir/Contraer todo]`.

**Propiedades de una clase o tipo:**

| Propiedad | Control | Detalle |
|---|---|---|
| Nombre | Texto 3–60 | Único dentro de su nivel. |
| Código | Texto | Inmutable; se usa como prefijo sugerido del código de activo. |
| Descripción, ícono, color | | Ícono y color se muestran en listados y mapa. |
| Activo | Interruptor | |
| **¿Es inventariable?** | Interruptor | Si es sí, sus registros son activos con ciclo de vida, custodia y datos financieros. Si es no (ej. Servicio, Aplicación), son solo CI lógicos. |
| **¿Es CI por defecto?** | Interruptor | Valor inicial de `es_ci` en el formulario (editable por registro salvo que 1.5.4.1 lo bloquee). |
| ¿Se asigna a un custodio? | Interruptor | Habilita la transición *Asignar*. |
| ¿Tiene ubicación física? | Interruptor | |
| ¿Exige modelo? / ¿Exige número de serie? / ¿Exige hostname único? | Interruptores | Alimentan las validaciones del formulario. |
| ¿Tiene mantenimiento? / ¿Tiene garantía? / ¿Tiene almacenamiento de datos? | Interruptores | *Almacenamiento de datos* exige **borrado seguro** en la baja (1.5.2.6). |
| Ciclo de vida | Lista (1.5.2.1) | Un ciclo por clase o tipo; el tipo hereda el de su clase si no define uno. |
| Plantilla de atributos | Enlace a 1.5.1.3 | Los atributos se heredan de la clase al tipo. |
| Prefijo de código | Texto (2–5 mayúsculas) | Ver 1.5.1.5. |
| Vida útil estándar (meses) y garantía estándar (meses) | Números | Valor por defecto si el modelo no los define. |
| Se muestra en el selector de Incidentes | Interruptor | Si es sí, los activos de este tipo bajo custodia del usuario aparecen en el selector "Elemento CMDB" del formulario de Incidentes. |

**Reglas:** máximo 3 niveles (clase > tipo > modelo); no se elimina un nodo con activos, hijos, modelos o atributos propios en uso (solo se desactiva); no se mueve un nodo a uno de sus descendientes; un tipo no puede contradecir a su clase en "Es inventariable"; se debe conservar al menos una clase activa.

### 6.2 Pestaña 1.5.1.2 — Fabricantes y modelos

**Catálogo de fabricantes** (tabla): Nombre · Sitio web · Contacto de soporte (correo, teléfono) · Activo · Nº de modelos · Nº de activos. Botones `[+ Fabricante]` `[Editar]` `[Desactivar]` `[Eliminar]` (solo sin modelos) `[Fusionar…]` `[Importar CSV]` `[Exportar CSV]`.

**Catálogo de modelos** (tabla): Fabricante · Tipo · Nombre del modelo · Número de parte · Garantía estándar (meses) · Vida útil (meses) · Fecha de fin de venta (EOL) · Fecha de fin de soporte (EOS) · Activo · Nº de activos. Filtros por fabricante, tipo y estado.

**Editor de modelo:** fabricante * · tipo * · nombre * (único por fabricante y tipo) · número de parte · descripción · **valores prellenados de atributos técnicos** (el mismo formulario de atributos del tipo, con cada uno opcional) · garantía estándar · vida útil · EOL y EOS · imagen · documentos (manual, ficha técnica) · activo.

**Reglas:** el modelo hereda los atributos del tipo; al cambiar valores prellenados **no se modifican los activos ya creados** (casilla opcional "Aplicar a activos existentes con el atributo vacío"); un modelo con activos no se elimina; fusionar reasigna los activos y desactiva el origen con confirmación y conteo.

### 6.3 Pestaña 1.5.1.3 — Atributos por tipo

**Qué se configura:** el esquema de atributos técnicos (sección E del formulario) de cada clase y tipo.

**Layout:** árbol de clases/tipos a la izquierda; a la derecha, tabla de atributos del nodo seleccionado (los heredados aparecen en gris con el nombre de su origen y no se editan aquí).

**Tabla de atributos:** Orden · Etiqueta · Código · Tipo de dato · Obligatorio · Único · Heredado de · Visible en listado · Filtrable · Sensible · Activo. Botones `[+ Nuevo atributo]` `[Editar]` `[Duplicar]` `[Desactivar]` `[Eliminar]` (solo sin valores guardados) `[Reordenar]` `[Copiar atributos de otro tipo]`.

**Asistente / editor de atributo:**

| Propiedad | Control | Detalle |
|---|---|---|
| Etiqueta (3–60) y código | Texto | Código inmutable, único por tipo. |
| **Tipo de dato** | Lista | Texto corto · Texto largo · Entero · Decimal · Fecha · Fecha y hora · Sí/No · Lista (una opción) · Selección múltiple · Dirección IP · Dirección MAC · URL · Usuario · CI (referencia) · Proveedor (referencia) · Archivo. **No cambia tras publicarse.** |
| Unidad | Texto | Ej. GB, MHz, meses. |
| Obligatorio | Siempre / Según estado (ej. al pasar a *En stock*) / No | |
| Único | Interruptor + alcance (global / por tipo / por modelo) | Se valida en servidor (hostname, IP). |
| Valor por defecto | Control del tipo | |
| Validaciones | Longitud, rango, expresión regular con mensaje y [Probar expresión], formato IP/MAC | |
| Opciones (listas) | Editor: valor, etiqueta, color, orden, activo | Valores en uso solo se desactivan. |
| Sección de la ficha | Lista | Define su agrupación en la pestaña "Atributos técnicos". |
| Visible en listado / Filtrable / Buscable | Interruptores | Alimentan `7.1`. |
| **Sensible** | Interruptor | Cifra en reposo, enmascara en la interfaz, exige permiso `activos.ver_sensible` para revelar y audita cada revelación. |
| **Protegido** | Interruptor | Su edición directa depende de 1.5.4.5. |
| **Aparece en el selector de Incidentes** | Interruptor | Muestra el atributo como dato secundario en el selector "Elemento CMDB". |
| **Cuenta para completitud** | Interruptor | Entra en el porcentaje de calidad de datos. |
| Heredable | Interruptor | Si es sí, los tipos hijos lo reciben. |

**Reglas:** máximo 60 atributos por tipo; no se puede cambiar el tipo de dato ni el código de un atributo con valores; un atributo desactivado deja de pedirse pero conserva datos; los atributos de fábrica 🔒 (ver sección 11) no se eliminan.

### 6.4 Pestaña 1.5.1.4 — Configuración de formulario del activo

**Qué se configura:** los campos del formulario de la sección 4.1 (visible, obligatorio, orden, sección, ancho) y cómo cambian por clase o tipo.

**Selector superior:** `Formulario: [Alta/edición de activo ▾]` · `Aplicar a: [Todos los tipos ▾ | Clase | Tipo]` (permite **sobrescribir** la configuración base para una clase o tipo; lo heredado aparece tenue con el botón [Restablecer a base]).

**Layout de tres columnas** (igual a la pestaña de campos de los Prompts 1 y 2): biblioteca de campos (estándar, personalizados, de sistema), lienzo con secciones A–G arrastrables y panel de propiedades.

**Propiedades de un campo:** etiqueta · ayuda · marcador · visible · **obligatorio: Siempre / Según clase o tipo / Según estado / Condicional / No** · solo lectura · valor por defecto · sección · ancho · visible y editable para perfiles · validaciones · reglas condicionales (constructor `CUANDO … ENTONCES …`, hasta 5 condiciones y 10 reglas por campo, con [Probar regla] y detección de ciclos).

**Matriz de obligatoriedad por estado:** tabla campo × estado (Optional / Obligatorio) para exigir datos al avanzar en el ciclo (ej. número de serie y ubicación obligatorios desde *En stock*; custodio y fecha de asignación desde *Asignado*). Se vincula con 1.5.2.2 (campos obligatorios por transición); si hay conflicto prevalece lo más estricto.

**Campos bloqueados (🔒) — no se ocultan:** *Código, Nombre, Clase y tipo, Estado*. Se pueden renombrar y mover.
**Reglas de consistencia:** oculto no puede ser obligatorio; un atributo técnico obligatorio por tipo no puede ocultarse en el formulario de ese tipo; los campos que usan reglas de otras pantallas (custodio para el selector de Incidentes, criticidad y entorno para Problemas y Cambios) no pueden quitarse si la clase es CI; mínimo 8 campos visibles.
**Campos personalizados:** se crean con el creador existente, agregando las entidades `activo`, `licencia` y `contrato`; límite de fábrica 40 por entidad; el asistente de 5 pasos es el de los otros módulos y permite elegir **clases y tipos a los que aplica**.
**Botones:** `[Vista previa del formulario]` (selector "Probar como: tipo y perfil") · `[Copiar configuración de otro tipo]` · `[Restaurar valores de fábrica]` · patrón común.

### 6.5 Pestaña 1.5.1.5 — Código de activo y etiquetas

**Formato del código:**
- **Constructor de formato** con fichas arrastrables: `{PREFIJO_TIPO}` · `{PREFIJO_CLASE}` · `{AAAA}` · `{AA}` · `{MM}` · `{SEDE}` (código de la sede) · `{CORRELATIVO:n}` (n dígitos, 3–10) · texto fijo · separador (`-`, `_`, ninguno). Vista previa en vivo ("LAP-2026-000123").
- **Alcance del correlativo:** global · por clase · por tipo · por año. **Reinicio:** nunca / anual.
- **Reglas:** el código es único y **no se reutiliza ni siquiera tras la baja**; los cambios de formato **no alteran** códigos existentes (solo los nuevos); el prefijo se define por tipo en 1.5.1.1; la secuencia se asigna en una transacción para evitar saltos y duplicados.
- Botones: `[Probar formato]` (genera 5 códigos de ejemplo sin consumir secuencia) y `[Ver secuencias]` (solo lectura).

**Etiquetas físicas:**
- **Símbolo:** código QR · código de barras (Code 128) · ambos.
- **Contenido del QR:** enlace a la ficha (`/activos/{codigo}`) o solo el código (selector).
- **Plantilla de etiqueta:** tamaño (selector de medidas estándar y personalizado), campos a imprimir (logo, código, nombre, tipo, fecha de ingreso, ubicación), tipografía y orientación; editor visual simple con vista previa.
- Botones: `[Vista previa de etiqueta]` · `[Imprimir lote de prueba]` (genera PDF).
- Una vez creada, la etiqueta se reimprime desde la ficha o por lote desde `7.1`.

### 6.6 Pestaña 1.5.1.6 — Ubicaciones

**Qué se configura:** el catálogo jerárquico de ubicaciones físicas (hoy no existe y es necesario para los activos).

**Layout:** árbol a la izquierda (con buscador y contador de activos) y panel de propiedades a la derecha; alternativa de vista **Tabla**.

**Niveles configurables** (catálogo editable, de fábrica): Sede > Edificio > Piso > Ambiente (oficina, sala, almacén) > Rack/Posición (opcional). Profundidad máxima 6.

**Propiedades:** nombre * · código * (único en su nivel) · tipo de nivel * · dirección (sedes) · responsable (usuario) · departamento asociado · capacidad (en racks: unidades U) · coordenadas o plano (opcional, adjunto) · notas · activo.
**Botones:** `[+ Ubicación]` (hija de la seleccionada) · `[+ Ubicación raíz]` · `[Editar]` · `[Mover]` (reparentar, con vista de impacto en activos) · `[Desactivar]` · `[Eliminar]` (solo sin activos ni hijos) · `[Importar CSV]` (plantilla con ruta completa) · `[Exportar CSV]`.
**Reglas:** una ubicación inactiva no se ofrece en formularios pero se muestra en activos antiguos; mover una ubicación mueve todos sus activos lógicamente y queda en el historial; códigos únicos; ruta completa calculada automáticamente.

### 6.7 Pestaña 1.5.1.7 — Listas y catálogos auxiliares

| Catálogo | Atributos propios |
|---|---|
| **Condición física** (Nuevo, Bueno, Regular, Malo) | Color; ¿exige informe técnico si es "Malo"? |
| **Monedas** | Código ISO, símbolo, moneda por defecto del sistema. |
| **Centros de costo** (reutiliza el existente; si no existe, se crea) | Código, nombre, departamento. |
| **Tipos de adquisición** (Compra, Arrendamiento, Donación, Comodato, Otro) | ¿Exige contrato? ¿Exige fecha de fin (arrendamiento/comodato)? |
| **Tipos de documento adjunto** (Factura, Garantía, Acta de entrega, Manual, Foto, Otro) | ¿Obligatorio en ciertas transiciones? |
| **Etiquetas sugeridas** | Nombre, color. |
| **Motivos de reclasificación y de fusión** | Texto. |

Atributos comunes: Orden · Código · Nombre · Descripción · Color · Activo · Sistema (🔒) · Usos. Botones: `[+ Nuevo valor]` `[Editar]` `[Activar/Desactivar]` `[Eliminar]` `[Reordenar]` `[Importar CSV]` `[Exportar CSV]` `[Fusionar…]`. Reglas: los valores en uso solo se desactivan; los 🔒 no se eliminan; un catálogo conserva al menos un valor activo.

### 6.8 Pestaña 1.5.1.8 — Ficha del activo y listado

**Bloque 1 — Cabecera (hasta 10 elementos):** lista ordenable de los elementos de 5.1; código, nombre y estado son fijos.
**Bloque 2 — Pestañas de la ficha:** una fila por pestaña de 5.4 con: orden · nombre (3–30) · visible · **visible para clases/tipos** · **visible para perfiles** · **visible en estados** · **[Configurar campos…]** (visible, orden, etiqueta y solo lectura de los campos de la pestaña). *General* e *Historial / auditoría* no se ocultan; *Historial* y el bloque financiero dependen de permisos.
**Bloque 3 — Panel lateral (5.3):** elementos visibles y orden.
**Bloque 4 — Acciones:** botones visibles y los que van en el menú [⋯].
**Bloque 5 — Listado de inventario (`7.1`):** columnas disponibles y por defecto (arrastrar a "Visibles"), orden por defecto, filtros rápidos (estado, clase, tipo, ubicación, custodio, departamento, criticidad, garantía por vencer, sin custodio, sin verificar), densidad, tamaño de página, **vistas guardadas** de fábrica (Todos · Mis activos · En stock · En reparación · Garantía por vencer · Sin custodio · Pendientes de baja) y quién puede crear vistas compartidas.
**Botones:** `[Vista previa con activo real]` · `[Vista previa con ejemplo]` · patrón común.

### 6.9 Pestaña 1.5.1.9 — Importación masiva e inventario físico

**A. Perfiles de importación** (tabla): Nombre · Tipo de activo · Modo · Clave de coincidencia · Última ejecución. Editor de perfil:
- **Plantilla** descargable (CSV/XLSX) generada desde los campos del tipo, con listas de valores válidos.
- **Mapeo de columnas** (columna del archivo → campo/atributo) guardable.
- **Modo:** *Solo crear* · *Solo actualizar* · *Crear y actualizar*.
- **Clave de coincidencia:** código · número de serie · hostname · combinación (selector).
- **Límite de filas** por archivo (fábrica 5000) y de tamaño.
- **Validación en seco obligatoria:** muestra filas válidas, con advertencia y con error (descargable) antes de confirmar.
- **Duplicados:** omitir / actualizar / error.
- **Estado inicial** de los activos creados (de los estados iniciales del ciclo).
- **Reversión:** botón `[Deshacer importación]` disponible N horas (fábrica 24) si ningún activo importado fue modificado después.
- **Historial de importaciones:** fecha, usuario, archivo, resultado, enlace al informe de errores.
- Los activos importados quedan con `fuente_dato = Importación`.

**B. Campañas de inventario físico (conteos):** parámetros de fábrica de una campaña:
- **Periodicidad** (única, trimestral, semestral, anual) y recordatorio previo.
- **Alcance:** sedes, clases/tipos, criticidad, departamentos o muestreo (% aleatorio).
- **Método:** escaneo QR/código de barras en el momento · lista de verificación manual.
- **Resultados posibles** (catálogo 🔒): Encontrado · Encontrado en otra ubicación · No encontrado · Dañado · Sobrante (no registrado).
- **Tolerancias y acciones automáticas:** actualizar ubicación al encontrar en otra · marcar `No verificado` · tras N campañas sin hallarlo cambiar a estado *Perdido o robado* (transición con motivo) y abrir incidente de seguridad (selector de servicio) · crear activo provisional para sobrantes.
- **Responsables y cierre:** quién puede crear, ejecutar y cerrar una campaña; cierre exige revisar discrepancias; genera **acta de inventario** (plantilla editable) en PDF.
- Botones: `[+ Nueva plantilla de campaña]` `[Editar]` `[Duplicar]` `[Desactivar]` + patrón común.

---

## 7. PANTALLA 1.5.2 — CICLOS DE VIDA Y REGLAS DE TRANSICIÓN

**Propósito:** definir los estados por los que pasa un activo y cuándo, cómo y con qué requisitos puede pasar de uno a otro (ITIL 4 IT Asset Management; ISO/IEC 20000-1 8.2.5; ISO/IEC 27001 A.5.11 y A.7.14).
**Principio:** los activos **no son tickets**. Sus transiciones tienen requisitos, aprobaciones y automatizaciones, pero no prioridad ni SLA.

### 7.1 Pestaña 1.5.2.1 — Ciclos de vida y estados

**Layout:** a la izquierda, lista de **ciclos de vida** (cada clase o tipo usa uno, 1.5.1.1); a la derecha, la tabla de estados del ciclo seleccionado.

**Botones de ciclos:** `[+ Nuevo ciclo]` · `[Duplicar]` · `[Renombrar]` · `[Eliminar]` (solo si ninguna clase/tipo lo usa). Cada ciclo muestra qué clases y tipos lo usan.

**Tabla de estados (ordenable):**

| Columna | Detalle |
|---|---|
| Orden / Nombre / Código | Único / inmutable. |
| **Tipo de estado** | **Planificado** · **Disponible** · **En uso** · **En mantenimiento** · **Inactivo** · **Final**. |
| Color | |
| ¿Es estado inicial? | Exactamente uno por ciclo (puede haber otro "inicial alterno" para ingreso directo). |
| ¿Cuenta como existencia en inventario? | Sí/No (ej. *Dado de baja* no cuenta). |
| ¿Asignable? | Sí/No (permite la transición *Asignar*). |
| ¿Cuenta como CI activo en la CMDB? | Sí/No (los CI inactivos no participan en el análisis de impacto de nuevos tickets). |
| ¿Se puede registrar un incidente? | Sí/No. |
| ¿Se puede incluir en una RFC? | Sí/No. |
| ¿Requiere ubicación? / ¿Requiere custodio? | Sí/No (se usa como obligatoriedad por estado en 1.5.1.4). |
| ¿Permite edición de datos? | Sí / Solo atributos técnicos / No. |
| Sistema (🔒) / Activo | |

**Botones:** `[+ Nuevo estado]` · por fila `[Editar]` `[Activar/Desactivar]` `[Eliminar]` · `[Reordenar]` · patrón común.
**Reglas:** exactamente 1 estado inicial por ciclo, al menos 1 *En uso* o *Disponible* y 1 *Final*; los estados 🔒 no se eliminan ni cambian de tipo; un estado con activos no se desactiva sin asistente de migración (3.4); un estado *Final* no tiene transiciones de salida salvo configuración explícita de reactivación con permiso.
**Ciclos de fábrica:** sección 11.

### 7.2 Pestaña 1.5.2.2 — Transiciones y reglas

**Vistas:** *Matriz* (origen × destino), *Diagrama* (grafo de solo lectura con zoom y [Exportar PNG]) y *Lista*. Selector de ciclo arriba.

**Editor de transición (modal / panel lateral):**

| Propiedad | Control | Detalle |
|---|---|---|
| Nombre de la acción | Texto 3–30 | Texto del botón en la ficha. |
| Estado(s) origen / destino | Selector múltiple / lista | |
| Aplica a (clases o tipos) | Selector múltiple | Vacío = todo el ciclo. |
| Perfiles autorizados | Selector múltiple | Más casillas contextuales: *Custodio actual*, *Responsable técnico del CI*, *Supervisor del departamento*. |
| **Condiciones previas** | Constructor de reglas | Ej.: "sin incidentes abiertos", "sin RFC programadas o en ejecución", "sin asignación vigente", "sin licencias asignadas", "sin relaciones activas con CI críticos", "garantía vigente". Si no se cumplen, el botón se deshabilita con tooltip. |
| **Campos obligatorios** | Selector múltiple | Se piden en un modal al ejecutar (ej. motivo y fecha para la baja). |
| Comentario | Ninguno / Opcional / Obligatorio | |
| **Requiere aprobación** | Interruptor + etapas | Etapa = perfil (Supervisor, Aprobador, Gestor de Activos y Configuración) o rol contextual; regla *Cualquiera / Todos*; plazo en horas; se pueden definir **umbrales por costo o criticidad** (ej. más de X de valor o criticidad Crítica exige además al perfil Aprobador). El solicitante no puede aprobar su propia solicitud. |
| Confirmación | Interruptor + texto | |
| Documento generado | Plantilla (acta de entrega, acta de devolución, acta de baja) o ninguna | Se genera PDF y se adjunta al activo. |
| Automatizaciones | Lista ordenable (abajo) | |
| Apariencia del botón | Color, ícono, orden | |

**Automatizaciones disponibles:** registrar custodio y fecha de asignación · cerrar la asignación vigente en el historial · generar acta · solicitar aceptación del custodio · actualizar ubicación · liberar licencias asignadas al activo · marcar los CI relacionados como "afectados" y notificar · desactivar el CI en la CMDB (conservando el historial) · cancelar mantenimientos programados · calcular y guardar fin de garantía y de vida útil · crear incidente (pérdida/robo) · crear tarea de seguimiento · enviar notificación (plantilla 1.6.1) · actualizar la fecha de última verificación.

**Reglas de validación (antes de publicar):** todo estado no final tiene salida; todos los estados son alcanzables desde el inicial; desde cualquier estado hay camino a un final; **la transición hacia el estado final de baja exige motivo, fecha y la aprobación configurada**; las transiciones que dejan el activo sin custodio no pueden coexistir con "asignable = No" y custodio obligatorio; no pueden existir dos transiciones idénticas para el mismo perfil y condiciones.

### 7.3 Pestaña 1.5.2.3 — Asignación, custodia y devolución

**Tipos de asignación** (catálogo editable; de fábrica Personal, Compartido o departamental, Préstamo temporal, A ubicación o servicio): ¿exige custodio persona? · ¿exige fecha de devolución prevista? · ¿exige aceptación? · duración máxima.
**Reglas de custodia (interruptores y valores):**
- **Un solo custodio vigente por activo** (siempre activo; no se desactiva).
- Máximo de activos por usuario y por tipo (tabla opcional; ej. 1 portátil por usuario) con acción al exceder: *Bloquear* / *Advertir*.
- **Aceptación del custodio:** exigir aceptación digital en la plataforma tras la asignación (sí/no), plazo en días, recordatorios, y qué pasa si no acepta (escalar al Supervisor / revertir asignación).
- **Plantilla del acta de entrega y devolución** (editor con variables: `{codigo}`, `{nombre}`, `{serie}`, `{custodio}`, `{fecha}`, `{accesorios}`, `{condiciones_uso}`); incluye **política de uso aceptable** (texto editable que el custodio acepta, ISO 27001 A.5.10).
- **Checklist de devolución** configurable (estado físico, accesorios, cargador, borrado o respaldo de datos, retiro de credenciales) con ítems obligatorios y evidencia.
- **Préstamos:** recordatorios antes del vencimiento (días) y alerta de préstamo vencido a custodio y Supervisor.
- **Transferencia entre usuarios:** permitida (sí/no), con o sin aprobación y con acta.
- **Cuando un usuario deja la organización, cambia de departamento o se desactiva:** acción configurable — *Notificar al Gestor de Activos y Configuración con lista de activos pendientes* (por defecto) · *Crear tarea de devolución* · *Bloquear la baja del usuario hasta devolver* (solo advertencia si 1.1 no lo soporta; repórtalo en la Etapa 0).
- **Historial de asignaciones inmutable** (siempre activo).
- **Vínculo con Incidentes:** el selector "Elemento CMDB" del formulario de Incidentes lista los activos cuyo `custodio_id` es el usuario y cuyo estado permite incidentes. Esta pestaña muestra ese comportamiento como dato informativo y permite activar *Incluir también activos compartidos de su departamento* (sí/no).

### 7.4 Pestaña 1.5.2.4 — Adquisición y recepción

**Principio:** la adquisición se inicia con una **solicitud de servicio** (ticket) con aprobaciones; la **compra** la ejecuta el área administrativa o de compras fuera del ITSM, y el ticket solo registra los datos de la orden. Al llegar el equipo, TI **crea el activo** y lo vincula al ticket.

**Configuración:**
- **Servicios de solicitud que generan activos** (tabla): servicio del catálogo (`1.2.2`, ej. "Solicitud de equipo nuevo") · tipo de activo que genera · cantidad por solicitud (fija / campo del formulario) · **mapeo de campos** (campo de la solicitud → campo del activo: justificación, departamento solicitante, custodio previsto, ubicación prevista, especificaciones). Botones `[+ Vincular servicio]` `[Editar]` `[Quitar]`.
- **Registro previo del activo:** al aprobarse la solicitud, ¿crear el activo en estado *Solicitado*? (sí/no, fábrica sí) y quién lo hace (automático / Gestor de Activos y Configuración).
- **Datos de compra** exigidos al pasar a *Ordenado*: orden de compra *, proveedor *, fecha de pedido *, monto estimado, fecha estimada de entrega (campos configurables).
- **Recepción:** acción **[Registrar recepción]** con formulario por lote: tabla de unidades (modelo, número de serie, hostname, ubicación, atributos clave) con **ingreso rápido por escaneo** o pegado de listado; la cantidad recibida puede ser menor (recepción parcial) con seguimiento de pendientes. Reglas: número de serie obligatorio según tipo, detección de duplicados, **cálculo automático de garantía** (fecha de recepción + garantía estándar del modelo) y de vida útil, asignación automática de código, impresión de etiquetas por lote, adjuntar guía de remisión y factura.
- **Estado tras la recepción:** *En stock* (o *Asignado* directamente si la solicitud indica custodio y el servicio lo permite).
- **Cierre automático del ticket de origen:** al recibir todas las unidades, la solicitud pasa a *Resuelta* con un comentario automático (sí/no).
- **Ingreso directo sin solicitud:** permitido (sí/no) a los perfiles indicados; exige motivo.
- **Recepción de software o licencias:** se registra en `7.3` y se asocia a la solicitud de origen.

### 7.5 Pestaña 1.5.2.5 — Mantenimiento y fin de vida

**Tipos de mantenimiento** (catálogo: Preventivo, Correctivo, Calibración o certificación, Actualización): ¿genera ticket? · ¿puede ser RFC estándar?
**Planes de mantenimiento preventivo** (tabla): Nombre · Aplica a (clase/tipo/modelo/criticidad) · Frecuencia (días/meses/horas de uso) · Tareas (checklist) · Responsable (grupo de 1.4.2) · **Acción al vencer el plazo**: *Crear solicitud de servicio* / *Crear RFC estándar con el modelo* (selector de modelo de cambio del Prompt 2) / *Solo notificar* · Anticipación (días) · Activo. Botones `[+ Nuevo plan]` `[Editar]` `[Duplicar]` `[Desactivar]` `[Simular próximos 12 meses]`.
**Estado durante el mantenimiento:** estado al que pasa (ej. *En reparación*), si se mantiene el custodio, y si se suspenden alertas de garantía.
**Garantía:** cálculo de fechas (inicio = recepción / compra / puesta en producción) y qué hacer al vencer (notificar, sugerir contrato de mantenimiento, sugerir reemplazo). Las alertas se configuran en 1.5.3.5.
**Fin de vida útil y obsolescencia:** política con meses de anticipación para alertar (fábrica 6), acción sugerida (*Planificar reemplazo*, *Retirar*), uso de EOL/EOS del modelo, y opción de pasar automáticamente a un estado "Obsoleto" (si el ciclo lo tiene) o solo etiquetar.
**Historial de mantenimientos:** campos exigidos al registrar (fecha, tipo, proveedor, ticket relacionado, costo, resultado, observaciones) y quién puede registrarlos.

### 7.6 Pestaña 1.5.2.6 — Baja y disposición

**Motivos de baja** (catálogo; de fábrica: Obsolescencia, Daño irreparable, Pérdida, Robo, Venta, Donación, Devolución al proveedor o fin de arrendamiento, Reciclaje): para cada motivo — ¿exige aprobación? · etapas · ¿exige informe técnico? · ¿exige número de denuncia/reporte? (pérdida/robo) · ¿exige incidente de seguridad vinculado? · ¿exige acta? · ¿exige borrado seguro? · destino de disposición permitido.
**Destinos de disposición** (catálogo: Venta, Donación, Reciclaje, Devolución al proveedor, Destrucción certificada, Reutilización interna): ¿exige datos del receptor? · ¿exige monto de venta? · ¿exige certificado?
**Borrado seguro de datos (ISO 27001 A.7.14 y A.8.10):** para tipos con almacenamiento de datos, exigir antes de la baja o disposición: método de borrado (catálogo: sobrescritura, borrado criptográfico, desmagnetización, destrucción física) · fecha · responsable · **evidencia o certificado adjunto** (obligatorio, configurable).
**Reglas de aprobación:** tabla por motivo, rango de costo y criticidad → etapas (Supervisor / Aprobador / Gestor de Activos y Configuración); el solicitante no aprueba su propia baja.
**Bloqueos de integridad:** no se puede dar de baja un activo con **RFC abierta o programada, incidentes abiertos, asignación vigente o relaciones activas con CI que dependan de él** (cada bloqueo configurable como *Bloquear* o *Advertir*, y excepción con permiso y motivo).
**Efectos automáticos:** liberar licencias · cerrar asignación · desactivar el CI en la CMDB conservando historial y relaciones históricas · cancelar mantenimientos · notificar a responsables de servicios dependientes · generar **acta de baja** (plantilla con variables) · registrar valor residual o monto de venta.
**Retención:** el registro de un activo dado de baja **nunca se elimina físicamente**; se conserva N años (valor en 1.8.3; fábrica 7). Botones: `[Vista previa del acta]` + patrón común.

---

## 8. PANTALLA 1.5.3 — LICENCIAS Y CONTRATOS

**Propósito:** definir los tipos, formularios, reglas de cumplimiento, alertas y renovaciones de licencias de software (SAM) y contratos de proveedores (ITIL 4 Supplier Management; ISO/IEC 19770-1; ISO/IEC 27001 A.5.32).

### 8.1 Pestaña 1.5.3.1 — Tipos de licencia y métricas

**Tabla de tipos de licencia:** Nombre · Código · Métrica · ¿Vence? · ¿Requiere clave? · ¿Reasignable? · ¿Requiere contrato? · Activo · Nº de licencias. Botones `[+ Nuevo tipo]` `[Editar]` `[Desactivar]` `[Eliminar]` `[Reordenar]`.
**Editor de tipo:**
- Nombre, descripción.
- **Métrica de consumo** (catálogo editable): Usuario nominal · Usuario concurrente · Dispositivo · Núcleo o procesador · Servidor/instancia · Sitio o corporativa · Sin límite (libre/open source).
- **¿Vence?** (perpetua = no) y si exige **soporte con fecha de fin**.
- **¿Requiere clave o serial?** (sensible).
- **¿Permite reasignación?** (sí/no) y tiempo mínimo entre reasignaciones.
- **¿Permite derechos de degradación (downgrade) o múltiples instalaciones?** (campo informativo).
- **Cálculo de consumo:** cómo se cuenta "en uso" — por asignaciones activas registradas (valor de fábrica) y factor de conversión opcional (ej. 1 núcleo físico = 0,5 licencias).
- **¿Aplica control de cumplimiento?** (sí/no).
**Catálogo de software** (opcional pero recomendado): producto, editor, versiones, categoría y **condición de autorización** — *Autorizado · Restringido (requiere aprobación) · Prohibido* — que usa 8.4 y el inventario de software instalado.

### 8.2 Pestaña 1.5.3.2 — Tipos de contrato y proveedores

**Tipos de contrato** (de fábrica: Mantenimiento, Soporte, Arrendamiento o leasing, Licenciamiento, Servicios gestionados, Telecomunicaciones o enlaces, Garantía extendida, SLA con proveedor, Otro). Por tipo: ¿tiene monto recurrente? · ¿admite renovación automática? · ¿exige niveles de servicio? · ¿vincula activos/licencias/servicios? · ¿exige aprobación para crearlo? y etapas · preaviso de no renovación por defecto (días) · plantilla de campos obligatorios.
**Catálogos de proveedores:** categorías de proveedor (Fabricante, Distribuidor, Servicios, Telecom, Consultoría…) · estados del proveedor (Activo, En evaluación, Suspendido, Bloqueado) con efecto (un proveedor Bloqueado no puede seleccionarse en nuevos contratos u órdenes) · criticidad del proveedor · campos de evaluación (opcional: calificación 1–5 y fecha de última evaluación).
Los registros de proveedores y contratos se gestionan en `8`; aquí solo se configuran sus catálogos y reglas.
**Botones:** `[+ Nuevo tipo]` `[Editar]` `[Desactivar]` `[Eliminar]` (si no está en uso) `[Importar CSV]` + patrón común.

### 8.3 Pestaña 1.5.3.3 — Configuración de formulario de licencia y contrato

**Selector:** `Formulario: [Licencia ▾ | Contrato ▾]`. Usa **el mismo editor de formulario** de 1.5.1.4 aplicado a las secciones de 4.2 y 4.3: visible, obligatorio (Siempre / Según tipo de licencia o contrato / Según estado / Condicional / No), orden, sección, ancho, perfiles, validaciones y reglas condicionales; campos personalizados con el creador existente (entidades `licencia` y `contrato`).
**Campos bloqueados (🔒):** Licencia — *Nombre del producto, Tipo de licencia, Métrica, Cantidad adquirida*; Contrato — *Número, Título, Tipo, Proveedor, Fecha de inicio, Fecha de fin*.
**Reglas de consistencia:** fecha de vencimiento obligatoria si el tipo vence; monto obligatorio si el tipo de contrato es recurrente; clave marcada sensible no puede mostrarse en listados.
**Botones:** `[Vista previa]` · `[Restaurar valores de fábrica]` · patrón común.

### 8.4 Pestaña 1.5.3.4 — Cumplimiento y sobreuso

**Estado de cumplimiento** (cálculo automático por licencia): **Cumple** (uso < umbral de riesgo) · **En riesgo** (uso ≥ umbral de riesgo) · **Sobreuso** (uso > cantidad adquirida) · **Vencida** · **Sin datos**.
**Parámetros:**
- **Umbral de riesgo** (% de uso; fábrica 90).
- **Al intentar asignar por encima de lo adquirido:** *Bloquear* (bloqueo duro) · *Permitir con aprobación* (etapa configurable) · *Permitir y alertar*. Fábrica: bloquear.
- **Alertas de sobreuso:** destinatarios, frecuencia de repetición y escalamiento si no se regulariza en N días.
- **Reclamación automática de licencias:** liberar la asignación cuando el activo pasa a *Retirado/Dado de baja* o el usuario se desactiva (sí/no).
- **Software no autorizado:** si el catálogo marca un producto como *Prohibido* o *Restringido* y aparece asignado/instalado sin aprobación → alerta al Gestor de Activos y Configuración, etiqueta en el activo y tarea de regularización.
- **Licencias sin asignar:** reporte de licencias disponibles sin uso hace N días (sugerencia de optimización).
**Botones:** `[Simular cumplimiento]` (muestra el estado de cada licencia con los parámetros propuestos antes de publicar) + patrón común.

### 8.5 Pestaña 1.5.3.5 — Alertas de vencimiento y garantía

**Cuadrícula única de alertas** (una fila por entidad):

| Entidad | Fecha base | Anticipaciones de fábrica (días antes) | Destinatarios de fábrica |
|---|---|---|---|
| Licencia | Vencimiento | 90, 60, 30, 15, 7, 0 | Responsable de la licencia, Gestor de Activos y Configuración |
| Soporte de licencia | Fin de soporte | 60, 30, 7 | Ídem |
| Contrato | Fecha de fin y fecha límite de no renovación | 120, 90, 60, 30, 15, 0 | Responsable del contrato, Gestor de Activos y Configuración, Gestor de Área |
| Garantía de activo | Fin de garantía | 60, 30, 7 | Gestor de Activos y Configuración, custodio (opcional) |
| Fin de vida del modelo (EOL/EOS) | EOL/EOS | 180, 90 | Gestor de Activos y Configuración |
| Fin de vida del activo | Fecha de fin de vida | 180, 90, 30 | Gestor de Activos y Configuración |
| Préstamo de activo | Devolución prevista | 3, 1, 0 y +1, +7 | Custodio, Supervisor |
| Revisión de CMDB / conteo | Fecha programada | 14, 3 | Responsable de la campaña |

Por fila se edita: activo (sí/no) · anticipaciones (lista de días, positivos antes y negativos después del vencimiento) · destinatarios (perfiles, roles contextuales —responsable, custodio, Gestor de Área del departamento dueño—, usuarios) · canal y plantilla (1.6.1) · condiciones (monto, criticidad, tipo) · repetición · **escalamiento** si no hay acción en N días · opción de **posponer (snooze)** y quién puede hacerlo.
**Panel "Próximos vencimientos":** vista previa de los 90 días siguientes con la configuración propuesta. Botones: `[Enviar alerta de prueba]` `[Restaurar valores de fábrica]` + patrón común.

### 8.6 Pestaña 1.5.3.6 — Renovación

**Reglas:**
- **Estados de renovación** (🔒 de fábrica): Pendiente · En gestión · Renovado · No renovar · Vencido sin renovar.
- **Generación de la solicitud de renovación:** N días antes del vencimiento (por licencia/contrato, valor por tipo) se crea automáticamente una **solicitud de servicio** (selector del servicio, ej. "Renovación de licencia o contrato") con datos prellenados (producto, proveedor, vigencia, monto, cantidad, responsable) y se asigna al responsable.
- **Renovación automática del contrato:** si está marcada, el sistema **no renueva por sí mismo**; avisa antes del límite de no renovación y registra la decisión.
- **Aprobación de renovación:** etapas por rango de monto (tabla: desde–hasta → perfil Supervisor / Aprobador / dirección); el solicitante no aprueba.
- **Registrar la renovación:** campos exigidos (nueva vigencia, nuevo monto, cantidad, número de contrato u orden, adjunto); la vigencia anterior queda en el **historial de renovaciones**.
- **Motivos de no renovación** (catálogo editable) y acciones asociadas (planificar reemplazo, liberar asignaciones, retirar software).
- **Qué ocurre al vencer sin renovar:** licencia → estado *Vencida* y alerta de uso no autorizado; contrato → *Vencido* y alerta de pérdida de cobertura sobre sus activos; opción de bloquear nuevas asignaciones de esa licencia.
**Botones:** `[Vista previa de la solicitud generada]` + patrón común.

---

## 9. PANTALLA 1.5.4 — TIPOS DE ELEMENTOS DE CONFIGURACIÓN Y RELACIONES DE CMDB

**Propósito:** definir qué es un CI, cómo se relacionan los CI entre sí, cuán críticos son, qué reglas protegen la exactitud de la CMDB y cómo se audita (ITIL 4 Service Configuration Management; ISO/IEC 20000-1 8.2.6; COBIT BAI10).

### 9.1 Pestaña 1.5.4.1 — Clases de CI

**Qué se configura:** qué clases de la jerarquía de 1.5.1.1 son CI y qué exige la CMDB de cada una; creación de clases de CI **lógicas** (no inventariables).

**Tabla de clases** (todas las de 1.5.1.1 más las lógicas): Clase / tipo · ¿Es CI? · ¿Inventariable? · Atributos CMDB obligatorios · Relaciones mínimas · Nº de CI · Activa. Botones: `[+ Clase de CI lógica]` (crea una clase con `inventariable = No`, p. ej. Servicio de negocio, Servicio de TI, Aplicación, Base de datos, Máquina virtual) · `[Editar]` · `[Desactivar]` · `[Ver diagrama de clases]` (modelo de solo lectura, el mismo de `7.4`).

**Propiedades de una clase en la CMDB (panel de edición):**

| Propiedad | Control | Detalle |
|---|---|---|
| ¿Es CI? | Interruptor | Si es sí, sus registros participan en relaciones, impacto, auditorías y tickets. |
| ¿Es CI por defecto en cada registro? | Interruptor + "Permitir que el registro lo cambie" | |
| **Atributos CMDB obligatorios** | Casillas: Criticidad · Entorno · Responsable técnico · Responsable de negocio · Servicios que soporta · Ubicación | Alimentan el formulario (4.1, sección F) y la completitud. |
| **Relaciones mínimas** | Lista de reglas (ej. "Toda *Aplicación* debe tener una relación *Se ejecuta en*") | Sirve para detectar CI incompletos (1.5.4.6). |
| ¿Participa en el análisis de impacto? | Interruptor | |
| ¿Se muestra en el mapa de topología (`7.2`)? | Interruptor + ícono y color | |
| ¿Se ofrece en el selector de Incidentes, Problemas y Cambios? | Tres interruptores | |
| Auditoría | Frecuencia propia de auditoría (1.5.4.6) | |

**Reglas:** una clase con CI no se elimina; no se puede dejar de ser CI una clase con relaciones activas sin el asistente de retiro; una clase lógica no puede tener ciclo de vida de hardware; los nombres de las clases lógicas se comparten con el catálogo de clases de 1.5.1.1 (una sola jerarquía).

### 9.2 Pestaña 1.5.4.2 — Tipos de relación

**Tabla de tipos de relación:** Nombre directo · Nombre inverso · Código · Dirección del impacto · ¿Propaga criticidad? · Cardinalidad · Color/estilo de línea · Activo. Botones `[+ Nuevo tipo de relación]` `[Editar]` `[Desactivar]` `[Eliminar]` (solo sin relaciones) `[Ver matriz de clases permitidas]`.

**Editor de tipo de relación:**
- **Nombre directo** (ej. "Depende de") y **nombre inverso** (ej. "Es requerido por"); la relación se muestra con el nombre que corresponda según el CI desde el que se mire.
- **Dirección del impacto:** *El fallo del origen impacta al destino* · *El fallo del destino impacta al origen* · *Bidireccional* · *Ninguna*. (Alimenta el análisis de impacto de Cambios y Problemas.)
- **¿Propaga criticidad?** (sí/no): si es sí, aplica la regla de criticidad efectiva de 1.5.4.3.
- **Cardinalidad:** 1:1 · 1:N · N:N.
- **¿Permite ciclos?** (no por defecto; solo para tipos simétricos como "Conectado a").
- **Estilo en el mapa:** color, grosor, línea continua/discontinua, flecha.
- **Descripción** (texto de ayuda en el formulario).

**Matriz de clases permitidas (obligatoria para cada tipo):** cuadrícula *clase origen × clase destino* con casillas; un tipo de relación solo puede crearse entre las parejas marcadas. Botones `[Marcar todo]` `[Limpiar]` `[Copiar de otro tipo]`. Una relación entre clases no permitidas se rechaza en servidor.
**Relaciones obligatorias por clase:** se definen en 1.5.4.1 y se muestran aquí en modo lectura por tipo de relación.
**Botones:** `[Simulador]` (elegir dos CI hipotéticos y ver qué relaciones serían válidas y cómo propagarían el impacto) + patrón común.
**Reglas:** los tipos de fábrica 🔒 no se eliminan; el nombre directo y el inverso no pueden coincidir salvo tipos simétricos; no se desactiva un tipo con relaciones activas sin asistente de migración (reasignar a otro tipo).

### 9.3 Pestaña 1.5.4.3 — Criticidad y entornos

**Niveles de criticidad** (tabla, mínimo 3 y máximo 5; de fábrica 4): Nivel · Código · Peso numérico · Color · Descripción · Criterios (impacto en el negocio, tiempo objetivo de recuperación RTO y punto objetivo de recuperación RPO como texto/horas, opcionales) · Activo.
**Uso de la criticidad (informativo, con enlace a cada pantalla):** Problemas (impacto sugerido y criterio de problema mayor), Cambios (matriz de autoridad y cuestionario de riesgo), Incidentes (prioridad sugerida opcional).
**Criticidad efectiva:**
- `Calcular la criticidad efectiva` (interruptor): criticidad efectiva = la **mayor** entre la propia del CI y la de los servicios que soporta (y, opcionalmente, la de los CI que dependen de él hasta la profundidad N según relaciones que propagan criticidad).
- Profundidad máxima de propagación (1–5; fábrica 2).
- Dónde se muestra y cuál se usa en otras pantallas (efectiva / propia).
- `Recalcular ahora` (proceso asíncrono con barra de progreso) y recálculo automático al cambiar relaciones, servicios o criticidades.
**Entornos:** catálogo (de fábrica: Producción, Preproducción, Pruebas, Desarrollo, Contingencia / recuperación ante desastres) con atributos: *peso de riesgo (0–5)*, *¿es productivo?*, color, activo. **El catálogo de entornos es único y compartido con el Prompt 2 (catálogo "Entornos" de 1.3.3.1.3)**: si ya existe, reutilízalo y agrégale "Contingencia"; si no, créalo aquí con esos atributos.
**Botones:** `[+ Nivel]` `[Editar]` `[Desactivar]` `[Reordenar]` `[Restaurar valores de fábrica]` + patrón común.
**Reglas:** los pesos deben ser distintos y crecientes; no se elimina un nivel o entorno en uso; los niveles 🔒 pueden renombrarse pero no eliminarse; si cambia la cantidad de niveles de criticidad, el asistente pide mapear los valores existentes.

### 9.4 Pestaña 1.5.4.4 — Reglas de integridad

Tabla de reglas con **Activa** y **Severidad** (*Bloquear / Advertir*) por regla; las marcadas 🔒 no pueden pasar a "Advertir".

| # | Regla | Parámetros |
|---|---|---|
| 1 🔒 | **No eliminar un CI con relaciones activas** (solo retirarlo: se conservan sus relaciones históricas). | |
| 2 🔒 | **Una relación solo puede crearse entre clases permitidas** (matriz de 9.2). | |
| 3 | **Sin ciclos** en tipos de relación no simétricos. | Profundidad máxima de verificación. |
| 4 | **Relación duplicada** (mismo origen, destino y tipo vigentes) no permitida. | |
| 5 | **CI retirado o dado de baja** no puede ser origen ni destino de nuevas relaciones, ni seleccionarse en nuevos incidentes, problemas o RFC. | Excepción con permiso y motivo. |
| 6 | **Alerta a dependientes** cuando un CI pasa a *Retirado* o *En mantenimiento*: notificar a los responsables de los CI que dependen de él. | Profundidad y destinatarios. |
| 7 | **CI huérfano:** CI de una clase con relaciones mínimas obligatorias sin ninguna relación. | Plazo de gracia (días) tras crearse. |
| 8 | **Unicidad:** hostname, dirección IP, número de serie por fabricante, código (según atributos marcados únicos). | |
| 9 | **Atributos CMDB obligatorios** por clase (9.1) completos para CI en estado *Activo*. | Plazo de gracia. |
| 10 | **Coherencia criticidad–servicio:** un CI no puede tener criticidad propia inferior a la de un servicio *crítico* que soporta sin justificación. | Aviso con motivo obligatorio para continuar. |
| 11 | **Responsable obligatorio:** todo CI en producción debe tener responsable técnico. | |
| 12 | **Máximo de relaciones por CI** (control de calidad). | Fábrica 200 (aviso). |

**Botones:** `[Ejecutar verificación ahora]` (recorre la CMDB y lista las violaciones, sin modificar nada) · `[Exportar resultados]` + patrón común.

### 9.5 Pestaña 1.5.4.5 — Fuentes de datos y atributos protegidos

**Objetivo (ITIL 4: los cambios en la CMDB se controlan):** evitar que los datos de CI críticos se modifiquen sin trazabilidad.

**Fuentes de datos** (catálogo 🔒): *Manual* · *Importación* · *Cambio (RFC)* · *Integración externa* (reservada para el futuro). Cada modificación registra su fuente.
**Atributos protegidos** (tabla): Clase/tipo · Atributo o campo (selector) · Entorno al que aplica (ej. solo Producción) · Criticidad mínima · **Política de edición directa**:
- *Libre* (sin restricción).
- *Solo mediante RFC* (el cambio solo puede aplicarse con el botón **[Aplicar a la CMDB]** de una RFC vinculada y cerrada con éxito, Prompt 2).
- *Excepción permitida* (el Gestor de Activos y Configuración puede editar directamente con **motivo obligatorio**; queda marcada como "modificación fuera de cambio" y se reporta).
**Prioridad de fuentes por atributo** (para reconciliación): orden de confianza (ej. Cambio > Importación > Manual).
**Reglas de reconciliación:** si una importación intenta cambiar un atributo protegido, se omite y se reporta en el informe de la importación.
**Botones:** `[+ Agregar atributo protegido]` `[Editar]` `[Quitar]` `[Simulador]` (elegir CI y campo y ver qué política aplicaría) + patrón común.
**Valores de fábrica:** protegidos con política *Solo mediante RFC* en Producción y criticidad ≥ Alta: *versión de software, sistema operativo, firmware, dirección IP, rol y relaciones*; con *Excepción permitida* los demás atributos técnicos de CI en producción.

### 9.6 Pestaña 1.5.4.6 — Auditoría de CMDB y líneas base

**A. Verificación de exactitud (auditorías):**
- **Plantillas de auditoría** (tabla): Nombre · Alcance (clases, criticidad, entorno, servicio) · Frecuencia (única, mensual, trimestral, semestral, anual) · Método (**revisión de calidad de datos** automática + **verificación manual** de una muestra %) · Responsable · Activa.
- **Indicadores de calidad** (editable): *% de CI con todos los atributos CMDB obligatorios* · *% con responsable* · *% con relaciones mínimas* · *% verificados físicamente en el período* · *% de discrepancias en la muestra* · *CI huérfanos* · *modificaciones fuera de cambio*. **Objetivo de exactitud** por indicador (fábrica 95 %) y semáforo.
- **Resultado de una auditoría:** lista de hallazgos (CI, tipo de hallazgo, severidad, responsable de corregir, fecha límite, estado); acciones: *Crear tarea*, *Crear solicitud de servicio*, *Marcar como aceptado*; informe en PDF; cierre con aprobación.
- Botones: `[+ Nueva plantilla de auditoría]` `[Editar]` `[Duplicar]` `[Desactivar]` `[Ejecutar ahora]`.

**B. Líneas base:**
- **Plantillas de línea base:** nombre · alcance (global / servicio / clase / criticidad) · qué incluye (CI, atributos, relaciones, licencias asociadas) · retención (meses; fábrica 24).
- **Creación:** *Manual* · *Programada* (frecuencia) · *Automática al autorizar una RFC* con riesgo ≥ X o criticidad ≥ Y sobre los CI afectados (activo en fábrica con riesgo Alto o Crítico, integración con el Prompt 2) · *Automática tras cerrar* la RFC (para comparar).
- **Comparación:** `[Comparar con el estado actual]` y `[Comparar dos líneas base]` (diferencias de atributos y relaciones, exportables).
- **Restauración:** solo informativa (no revierte datos); la reversión real se hace mediante cambios.
- Botones: `[+ Nueva plantilla]` `[Editar]` `[Eliminar]` (si no tiene líneas base) + patrón común.

---

## 10. Perfiles y permisos

**Perfiles existentes (1.1.2):** Administrador · Técnico · Solicitante · Supervisor · Gestor de Área · Auditor · Aprobador · Gestor de Cambios · Gestor de Activos y Configuración. (Si ya existe Gestor de Problemas por el Prompt 1, se incluye en la columna GPR.) **No se crean perfiles nuevos en este prompt.**

Por cada pantalla de configuración hay tres permisos: `ver`, `editar` (guardar borrador) y `publicar`. Un usuario con `editar` pero sin `publicar` guarda borradores; otro con `publicar` los revisa y publica.

**Columnas:** ADM = Administrador · TEC = Técnico · SOL = Solicitante · SUP = Supervisor · GAR = Gestor de Área · AUD = Auditor · APR = Aprobador · GCA = Gestor de Cambios · GAC = Gestor de Activos y Configuración · GPR = Gestor de Problemas (si existe).

| Permiso | ADM | TEC | SOL | SUP | GAR | AUD | APR | GCA | GAC | GPR |
|---|---|---|---|---|---|---|---|---|---|---|
| `config.activos.{tipos,ciclos,licencias,cmdb}.ver` | ✔ | — | — | ✔ | — | ✔ | — | — | ✔ | — |
| `config.activos.{tipos,ciclos,licencias,cmdb}.editar` / `.publicar` | ✔ | — | — | — | — | — | — | — | — | — |
| `config.activos.catalogos.editar` / `.publicar` (solo fabricantes y modelos 1.5.1.2, ubicaciones 1.5.1.6 y listas auxiliares 1.5.1.7) | ✔ | — | — | — | — | — | — | — | ✔ | — |
| `config.activos.importar_exportar` / `.restaurar_fabrica` | ✔ | — | — | — | — | — | — | — | — | — |
| `activos.ver` | ✔ (todos) | ✔ (todos, lectura) | ✔ (solo los que tiene en custodia) | ✔ (todos) | ✔ (los de su departamento) | ✔ (todos, lectura) | ✔ (los que debe aprobar) | ✔ (todos, lectura) | ✔ | ✔ (lectura) |
| `activos.ver_financiero` | ✔ | — | — | ✔ | — | ✔ | ✔ (los que aprueba) | — | ✔ | — |
| `activos.ver_sensible` (revelar claves) | ✔ | — | — | — | — | — | — | — | ✔ | — |
| `activos.crear` / `activos.editar` | ✔ | — | — | — | — | — | — | — | ✔ | — |
| `activos.editar_tecnico` | ✔ | ✔ | — | — | — | — | — | — | ✔ | — |
| `activos.asignar` / `activos.recibir` | ✔ | — | — | — | — | — | — | — | ✔ | — |
| `activos.solicitar_baja` | ✔ | ✔ | — | ✔ | — | — | — | — | ✔ | — |
| `activos.aprobar_transicion` (etapas de aprobación) | — | — | — | ✔ | — | — | ✔ | — | ✔ (etapa técnica) | — |
| `activos.importar` | ✔ | — | — | — | — | — | — | — | ✔ | — |
| `activos.conteo` (ejecutar inventario) | ✔ | ✔ | — | — | — | — | — | — | ✔ | — |
| `activos.auditoria.ver` | ✔ | — | — | ✔ | — | ✔ | — | — | ✔ | — |
| `licencias.ver` | ✔ | ✔ (sin clave) | — | ✔ | ✔ (su departamento) | ✔ | — | — | ✔ | — |
| `licencias.editar` / `licencias.asignar` | ✔ | — | — | — | — | — | — | — | ✔ | — |
| `contratos.ver` | ✔ | — | — | ✔ | ✔ (su departamento) | ✔ | ✔ | — | ✔ | — |
| `contratos.editar` | ✔ | — | — | — | — | — | — | — | ✔ | — |
| `contratos.aprobar_renovacion` | — | — | — | ✔ | — | — | ✔ | — | — | — |
| `cmdb.ver` | ✔ | ✔ | — | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| `cmdb.relaciones.editar` | ✔ | — | — | — | — | — | — | — | ✔ | — |
| `cmdb.atributos_protegidos.editar` (excepción con motivo) | — | — | — | — | — | — | — | — | ✔ | — |
| `cmdb.auditoria.ejecutar` | ✔ | — | — | — | — | — | — | — | ✔ | — |
| `cmdb.auditoria.ver_resultados` | ✔ | — | — | ✔ | — | ✔ | — | ✔ | ✔ | — |
| `cmdb.lineas_base.crear` / `.comparar` | ✔ | — | — | — | — | — | — | ✔ (comparar) | ✔ | — |

**Notas:** el solicitante de una transición no puede aprobarla (segregación de funciones). El perfil Solicitante solo ve los activos bajo su custodia y puede aceptar actas de entrega. Los perfiles se resuelven con el mecanismo de permisos existente; si no maneja permisos por acción, repórtalo en la Etapa 0.

---

## 11. Datos semilla (valores de fábrica)

**Clases y tipos (🔒 las clases):**
- **Hardware** (inventariable, CI): Computadora de escritorio · Portátil · Servidor físico · Monitor · Impresora y multifuncional · Dispositivo móvil (teléfono, tablet) · Periférico · Almacenamiento (NAS, SAN, discos externos) · Proyector y audiovisual · UPS y energía.
- **Red** (inventariable, CI): Switch · Router · Punto de acceso · Firewall · Balanceador · Telefonía IP.
- **Infraestructura física** (inventariable, CI): Rack y gabinete.
- **Software** (CI lógico, no inventariable): Sistema operativo · Aplicación de negocio · Software de escritorio · Middleware.
- **Base de datos** (CI lógico): Instancia de base de datos.
- **Infraestructura virtual** (CI lógico): Máquina virtual · Clúster o contenedor · Hipervisor.
- **Servicios** (CI lógico): Servicio de negocio · Servicio de TI.
Fabricantes y modelos: **vacíos** (se cargan por importación).

**Atributos de fábrica:** *Hardware:* hostname (texto, único), sistema operativo (lista), procesador, RAM (GB), almacenamiento (GB), dirección IP (IP, único), dirección MAC (MAC, único). *Dispositivo móvil:* IMEI (único), número de línea. *Impresora:* tipo de impresión, dirección IP. *Servidor:* roles, hipervisor, número de procesadores. *Red:* número de puertos, firmware, VLAN, capa (L2/L3), dirección IP, dirección MAC. *Software:* versión, edición, tipo de instalación. *Base de datos:* motor, versión, puerto. *Máquina virtual:* hipervisor, vCPU, RAM, almacenamiento. Marcados *sensibles*: ninguno de estos; la clave de licencia es sensible por definición.

**Ciclos de vida:**
- **"Hardware inventariable"** — Estados: Solicitado (inicial, Planificado) · Ordenado (Planificado) · En stock (Disponible, asignable, inicial alterno para ingreso directo) · Asignado (En uso) · En préstamo (En uso) · En reparación (En mantenimiento) · Retirado (Inactivo) · Perdido o robado (Inactivo) · Dado de baja (Final) · Cancelado (Final).
- **"Elemento lógico"** — Estados: Planificado (inicial) · En implementación · Activo (En uso) · En mantenimiento · Retirado (Final).

**Transiciones del ciclo "Hardware inventariable":**
| Acción | Origen → Destino | Requisitos y automatizaciones |
|---|---|---|
| Registrar pedido | Solicitado → Ordenado | Orden de compra, proveedor, fecha. |
| Registrar recepción | Ordenado → En stock | Serie según tipo, ubicación; garantía y vida útil calculadas; etiqueta. |
| Ingreso directo | (inicial alterno) → En stock | Motivo; permiso especial. |
| Asignar | En stock → Asignado | Custodio, tipo de asignación, fecha; acta y aceptación. |
| Prestar | En stock → En préstamo | Custodio, fecha de devolución prevista. |
| Transferir | Asignado → Asignado | Nuevo custodio; acta; aprobación opcional. |
| Devolver | Asignado / En préstamo → En stock | Checklist de devolución, condición física; cierra asignación. |
| Enviar a reparación | En stock / Asignado → En reparación | Motivo, proveedor o taller, ticket relacionado. |
| Retornar de reparación | En reparación → En stock | Resultado; actualiza historial de mantenimientos. |
| Retirar de servicio | En stock / Asignado → Retirado | Motivo; borrado seguro si aplica; libera licencias. |
| Reportar pérdida o robo | Asignado / En stock / En préstamo → Perdido o robado | Número de denuncia; crea incidente de seguridad; libera licencias. |
| Recuperar | Perdido o robado → En stock | Motivo y verificación. |
| Solicitar baja → Dar de baja | Retirado / Perdido o robado / En reparación (irreparable) → Dado de baja | Motivo, fecha, informe técnico, borrado seguro, aprobación, acta de baja; desactiva el CI. |
| Cancelar pedido | Solicitado / Ordenado → Cancelado | Motivo. |

**Tipos de asignación:** Personal · Compartido o departamental · Préstamo temporal · A ubicación o servicio.
**Checklist de devolución:** Estado físico revisado · Accesorios y cargador devueltos · Datos respaldados o borrados · Credenciales y accesos retirados · Etiqueta intacta.
**Motivos de baja, destinos de disposición y métodos de borrado:** los de 7.6.
**Condición física:** Nuevo · Bueno · Regular · Malo. **Tipos de adquisición:** Compra · Arrendamiento · Donación · Comodato · Otro. **Tipos de documento:** Factura · Garantía · Acta de entrega · Manual · Foto · Otro.

**Tipos de licencia:** Perpetua por dispositivo · Perpetua por usuario · Suscripción anual por usuario · Suscripción mensual por usuario · Concurrente · Por núcleo · Por servidor · Corporativa o de sitio · Código abierto (libre) · OEM.
**Tipos de contrato:** Mantenimiento · Soporte · Arrendamiento o leasing · Licenciamiento · Servicios gestionados · Telecomunicaciones o enlaces · Garantía extendida · SLA con proveedor · Otro.
**Categorías de proveedor:** Fabricante · Distribuidor · Servicios · Telecomunicaciones · Consultoría. **Estados de proveedor:** Activo · En evaluación · Suspendido · Bloqueado.
**Estados de renovación:** Pendiente · En gestión · Renovado · No renovar · Vencido sin renovar.
**Alertas:** las de la tabla de 8.5.

**Tipos de relación (🔒)** — *Dirección del impacto:* "Destino→Origen" significa que el fallo del destino impacta al origen.
| Directo / Inverso | Dirección del impacto | Propaga criticidad |
|---|---|---|
| Depende de / Es requerido por | Destino→Origen | Sí |
| Se ejecuta en / Hospeda | Destino→Origen | Sí |
| Instalado en / Contiene | Destino→Origen | Sí |
| Conectado a / Conectado a (simétrica) | Bidireccional | No |
| Es parte de / Se compone de | Origen→Destino | Sí |
| Usa / Es usado por | Destino→Origen | Sí |
| Alimentado por / Alimenta | Destino→Origen | Sí |
| Respaldado por / Respalda a | Ninguna | No |
| Soporta a / Es soportado por (CI → servicio) | Origen→Destino | Sí |
**Matriz de clases permitidas de fábrica:** Aplicación/Base de datos/Máquina virtual → *Se ejecuta en* → Servidor físico, Máquina virtual, Clúster o contenedor, Hipervisor · Software → *Instalado en* → Computadora, Portátil, Servidor, Máquina virtual · Cualquier CI → *Soporta a* → Servicio de TI / Servicio de negocio · Servicio de negocio → *Depende de* → Servicio de TI · Servicio de TI → *Depende de* → Aplicación, Base de datos, Red, Servidor · Equipos de red entre sí → *Conectado a* · Servidor, Almacenamiento, Red → *Alimentado por* → UPS · Rack → *Contiene* → Servidor, Red, Almacenamiento, UPS · Servidor/Almacenamiento → *Respaldado por* → Almacenamiento.

**Criticidad:** Crítica (peso 4; interrupción detiene operaciones críticas; RTO ≤ 1 h) · Alta (3; RTO ≤ 4 h) · Media (2; RTO ≤ 24 h) · Baja (1; RTO > 24 h). **Criticidad efectiva:** activada, profundidad 2.
**Entornos:** Producción (peso 3, productivo) · Preproducción (2) · Pruebas (1) · Desarrollo (0) · Contingencia (2, productivo en emergencia).
**Reglas de integridad:** las de la tabla 9.4 (activas; las 🔒 en *Bloquear*; las demás en *Advertir*).
**Atributos protegidos:** los de 9.5.
**Auditoría y líneas base:** auditoría trimestral de CI de criticidad Crítica y Alta; auditoría anual del resto; objetivo de exactitud 95 %; línea base automática al autorizar RFC de riesgo Alto o Crítico.
**Ubicaciones:** vacío (el admin crea la estructura); niveles: Sede, Edificio, Piso, Ambiente, Rack/Posición.
**Formato de código:** `{PREFIJO_TIPO}-{AAAA}-{CORRELATIVO:6}` (ej. `LAP-2026-000123`), correlativo por tipo, sin reinicio.
**Etiqueta:** QR con enlace a la ficha, 50×25 mm (editable), con logo, código y nombre.

**Eventos de dominio que se emiten:** `activo.creado`, `activo.estado_cambiado`, `activo.asignado`, `activo.aceptacion_pendiente`, `activo.devuelto`, `activo.transferido`, `activo.baja_solicitada`, `activo.baja_aprobada`, `activo.dado_de_baja`, `activo.perdido_o_robado`, `activo.garantia_por_vencer`, `activo.fin_vida_proximo`, `activo.mantenimiento_proximo`, `activo.prestamo_por_vencer`, `activo.prestamo_vencido`, `activo.no_encontrado`, `licencia.asignada`, `licencia.sobreuso`, `licencia.en_riesgo`, `licencia.por_vencer`, `licencia.vencida`, `software.no_autorizado_detectado`, `contrato.por_vencer`, `contrato.vencido`, `renovacion.iniciada`, `renovacion.completada`, `cmdb.relacion_creada`, `cmdb.relacion_eliminada`, `cmdb.ci_retirado`, `cmdb.atributo_protegido_modificado`, `cmdb.violacion_integridad`, `cmdb.auditoria_completada`, `cmdb.linea_base_creada`, `inventario.campania_iniciada`, `inventario.campania_cerrada`, `importacion.completada`, `configuracion.publicada`.

**Métricas que los datos deben permitir (2.1 y 2.2):** inventario por estado, clase, tipo y ubicación · % de activos asignados y sin custodio · antigüedad de la flota y activos próximos al fin de vida · garantías por vencer · costo total por clase y departamento · activos perdidos o dados de baja por período · cumplimiento de licencias (cumple / en riesgo / sobreuso) y ahorro por licencias sin uso · contratos y licencias por vencer · exactitud y completitud de la CMDB · CI huérfanos · modificaciones fuera de cambio · incidentes por tipo y modelo de activo · resultados de conteos físicos · tiempo promedio de recepción y de devolución.

---

## 12. Hechos confirmados del sistema existente (no los vuelvas a preguntar)

| Tema | Lo confirmado |
|---|---|
| Stack | Next.js y PostgreSQL en Supabase; acceso completo al código, base de datos, frontend y backend. |
| Selector "Elemento CMDB" en Incidentes | Existe: lista ítems tecnológicos de hardware, software y periféricos **bajo custodia del usuario** (opcional). Por tanto **ya hay una estructura de datos de CI/activos con custodio**. Ubícala en la Etapa 0: es la base que se extiende. |
| Formulario de Incidentes y creador de campos | Existen; se extienden a las entidades `activo`, `licencia` y `contrato`. |
| Matriz de prioridad | Existe para incidentes (P1–P4). No interviene aquí, salvo la criticidad como dato de apoyo. |
| Perfiles | Administrador, Técnico, Solicitante, Supervisor, Gestor de Área, Auditor, Aprobador, Gestor de Cambios, Gestor de Activos y Configuración. |
| Ubicaciones físicas | **No existen datos.** Se crea el catálogo jerárquico (1.5.1.6). |
| Calendarios y feriados | No existen (los crea el Prompt 2 como tablas compartidas). Este prompt no los necesita. |
| Menú operativo | `7.1`, `7.2`, `7.3`, `7.4` y `8` aparecen en el menú; su estado de implementación se verifica en la Etapa 0. |
| Adquisición | Es una **solicitud de servicio**; la compra la hace el área administrativa y el ticket solo registra los datos de la orden. |
| Datos que no existan | Se agregan a la base de datos mediante migraciones (sección 13). |

**Dependencias con otros módulos:**

| Con | Dependencia |
|---|---|
| Prompt 1 (Problemas) | Criticidad y clase de CI; marcas `Problema abierto` y `Error conocido` en la ficha; selector de CI. |
| Prompt 2 (Cambios) | Relaciones y criticidad para el análisis de impacto; atributos protegidos y **[Aplicar a la CMDB]**; líneas base automáticas; catálogo compartido de entornos; mantenimiento preventivo como RFC estándar. |
| 1.1.2 | Registrar los permisos de la sección 10. |
| 1.2 Catálogo de servicios | Servicios soportados por CI; servicios de solicitud que generan activos y renovaciones. |
| 1.3.1 Incidentes | Selector de CI, `custodio_id`, incidentes de seguridad por pérdida o robo. |
| 1.4 | Departamentos, grupos, usuarios (desactivación de usuarios con activos asignados). |
| 1.6 Comunicaciones | Plantillas y canales para alertas y notificaciones. |
| 1.8 Auditoría y retención | Retención de activos dados de baja, límites de adjuntos, auditoría de configuración. |
| 2 Reportes | Métricas de la sección 11. |

---

## 13. Cambios de base de datos requeridos

Principio: **verifica primero si existe (Etapa 0); si no existe, créalo con migración.** No dupliques. **Extiende la estructura que alimenta hoy el selector de Incidentes** y conserva sus identificadores para que ese selector no se rompa.

**13.1 Tablas de configuración del módulo** (diseño libre, convenciones del proyecto): versiones de configuración por pantalla/pestaña (ámbito, versión, estado, snapshot `jsonb`, autor, motivo, fechas) · jerarquía de clases y tipos con propiedades · fabricantes y modelos · definición de atributos (tipo, reglas, sensibles, protegidos) · configuración de formulario por entidad y por clase/tipo · formatos y secuencias de código · plantillas de etiqueta y de documentos (actas) · ubicaciones · catálogos auxiliares · ciclos de vida, estados, transiciones y sus etapas de aprobación · reglas de asignación, adquisición, mantenimiento y baja · tipos de licencia y de contrato, catálogo de software, reglas de cumplimiento y alertas, reglas de renovación · tipos de relación y matriz de clases permitidas · criticidades y entornos · reglas de integridad, atributos protegidos y fuentes · plantillas de auditoría y de líneas base · perfiles de importación y plantillas de campañas de inventario.

**13.2 Tablas operativas** (verificar qué existe): registro maestro de CI/activos (activo y CI son vistas del mismo registro) con `atributos` en `jsonb` (índice GIN) y una tabla auxiliar de **valores únicos** (`atributo_id`, `valor`, `ci_id`, con índice único) para los atributos marcados como únicos · valores sensibles cifrados · **historial de asignaciones** (índice único parcial que garantiza **un solo custodio vigente**, p. ej. `WHERE hasta IS NULL`) · actas y aceptaciones · movimientos de ubicación · mantenimientos y planes · licencias y asignaciones · contratos y cobertura (activos, licencias, servicios) · proveedores (verificar si existe en el módulo 8) · renovaciones · **relaciones entre CI** (origen, destino, tipo, vigencia desde–hasta, CHECK origen ≠ destino, único para relaciones vigentes) · líneas base y sus elementos (snapshot) · auditorías de CMDB y hallazgos · campañas de inventario y conteos · importaciones y errores · adjuntos (almacenamiento en Supabase Storage con metadatos) · historial/auditoría de cambios de campo (**solo INSERT**).

**13.3 Seguridad:** permisos de la sección 10 como datos semilla; políticas RLS por perfil (el Solicitante solo ve los activos de los que es custodio; el Gestor de Área, los de su departamento); tablas de historial inmutables (sin UPDATE/DELETE); cifrado de datos sensibles y auditoría de revelación.

**13.4 Jerarquías:** ubicaciones y clases como árbol (por ejemplo con `ltree` o columna `ruta` materializada con CTE recursivas) para consultas por subárbol.

**13.5 Columnas y estructuras que probablemente falten (verifica y agrega):** `custodio_id`, `estado_id`, `clase_id`, `tipo_id`, `modelo_id`, `ubicacion_id`, `criticidad_id`, `entorno_id`, responsables, fechas de garantía y vida útil, `es_ci`, `fuente_dato`, completitud · criticidad efectiva calculada (columna o vista materializada) · en incidentes: referencia al CI (ya existe) · `centro_costo`, `moneda` (verificar) · zona horaria del sistema (parámetro).

**13.6 Rendimiento:** índices en (clase, tipo, estado), custodio, ubicación, número de serie, hostname, IP; búsqueda de texto completo en español y similitud (`pg_trgm`) sobre nombre, código y serie; recorrido de relaciones con CTE recursivas con límite de profundidad.

**13.7 Generación de documentos y etiquetas:** verifica qué librería de PDF y de generación de QR/códigos de barras usa o puede usar el proyecto (actas, etiquetas, informes); si no hay ninguna, propón una (sin instalarla hasta que lo apruebe).

**13.8 Tareas programadas** (usa el mecanismo de jobs existente; si no hay, propón —sin implementar sin aprobación— `pg_cron`, Edge Functions de Supabase o cron de Next.js): alertas de vencimiento y garantía · cálculo de cumplimiento de licencias · generación de solicitudes de renovación · mantenimiento preventivo · préstamos por vencer y vencidos · recordatorios de aceptación de actas · recálculo de criticidad efectiva · auditorías y líneas base programadas · recordatorios y cierres de campañas de inventario · verificación de integridad.

**13.9 Migración de datos existentes:** mapea los registros actuales (los que usa el selector de Incidentes) a las nuevas estructuras sin pérdida: clase y tipo por defecto, estado inicial equivalente, custodio conservado. Genera códigos para los que no tengan. Entrega un **informe de migración** (registros migrados, con advertencias de calidad y rechazados) y la prueba de que el selector de Incidentes devuelve el mismo resultado antes y después.

**13.10 Semillas:** todo lo de la sección 11 mediante migración idempotente.

---

## 14. Criterios de aceptación

1. El menú muestra `1.5.1` a `1.5.4` con las pestañas numeradas de la sección 2.2, sin cambiar nombres ni numeración.
2. Todas las pestañas usan el patrón común (borrador, vista previa, publicación con diff y motivo, versionado, restauración, importación/exportación, bloqueo concurrente).
3. El editor de formulario y el creador de campos son **los mismos componentes** que usan Incidentes, extendidos a `activo`, `licencia` y `contrato`.
4. **El selector "Elemento CMDB" de Incidentes devuelve exactamente los mismos activos que antes de la migración** para cada usuario y sigue filtrando por custodia.
5. Existe un **único registro maestro** por elemento; no hay tablas duplicadas de activos y CI.
6. Crear un tipo nuevo con sus atributos hace que el formulario muestre automáticamente esa sección; los atributos obligatorios, únicos y sensibles se validan en servidor.
7. Los atributos sensibles se cifran, se enmascaran y cada revelación queda auditada; un perfil sin `activos.ver_sensible` no puede obtenerlos ni por API.
8. El código del activo respeta el formato configurado, es único, sin saltos ni reutilización, y los cambios de formato no alteran códigos existentes.
9. Se pueden crear ubicaciones jerárquicas, mover una con sus activos, e importarlas por CSV; una ubicación con activos no se elimina.
10. El estado de un activo solo cambia mediante transiciones; las condiciones, campos obligatorios, aprobaciones y automatizaciones se aplican en servidor.
11. El validador de ciclos de vida bloquea la publicación con estados inalcanzables, sin salida o sin camino a un final.
12. **Un activo tiene un solo custodio vigente** (garantizado por la base de datos); el historial de asignaciones es inmutable.
13. La asignación genera el acta, solicita la aceptación al custodio y gestiona recordatorios y escalamiento.
14. Una solicitud de adquisición de un servicio configurado puede generar el registro previo del activo; la recepción por lote crea los activos con garantía, vida útil, código y etiquetas calculados y vincula el ticket de origen.
15. No se puede dar de baja un activo con bloqueos de integridad (RFC abiertas, incidentes abiertos, asignación vigente, relaciones críticas) salvo excepción con permiso y motivo; la baja exige aprobación, borrado seguro (cuando aplica) y acta.
16. Los registros dados de baja no se eliminan y respetan la retención de 1.8.3.
17. La importación masiva exige validación en seco, respeta atributos protegidos y se puede deshacer dentro del plazo configurado.
18. Las campañas de inventario registran resultados por activo, actualizan la verificación y aplican las acciones automáticas configuradas.
19. El cálculo de cumplimiento de licencias muestra Cumple / En riesgo / Sobreuso / Vencida; el sobreuso bloquea, pide aprobación o alerta según la configuración.
20. Las alertas de vencimiento (licencias, contratos, garantías, fin de vida, préstamos) se envían en las anticipaciones configuradas y escalan si no hay acción.
21. La renovación genera la solicitud de servicio configurada, aplica aprobación por monto y conserva el historial de renovaciones.
22. Los tipos de relación solo permiten parejas de clases autorizadas; las relaciones duplicadas, los ciclos prohibidos y los CI retirados como extremo se rechazan en servidor.
23. La criticidad efectiva se calcula según la regla configurada y se actualiza al cambiar relaciones, servicios o criticidades.
24. Un atributo protegido en un CI de producción solo se modifica mediante RFC (Prompt 2) o por excepción con motivo, que queda marcada como "modificación fuera de cambio".
25. Las auditorías de CMDB calculan los indicadores, generan hallazgos y se pueden cerrar con aprobación; las líneas base se crean (manual, programada o automática por RFC) y se pueden comparar.
26. El catálogo de entornos es único y compartido con el Prompt 2.
27. `7.4 Modelado de clases CI` refleja el modelo de 1.5.4.1 en solo lectura.
28. Toda acción de configuración queda en `1.8.1 Auditoría de cambios` con usuario, antes/después y motivo; los historiales son inmutables.
29. Los permisos de la sección 10 se cumplen; `editar` sin `publicar` no habilita Publicar; el Solicitante solo ve sus activos.
30. El formulario y la ficha reflejan exactamente las secciones 4 y 5 con los valores de fábrica.

---

## 15. Etapa 0 — Reconocimiento obligatorio y preguntas abiertas

**Antes de escribir cualquier código**, revisa el repositorio y la base de datos y entrégame un **informe** (sin modificar nada) con:

1. **Estructura actual de CI/activos:** la tabla o tablas que alimentan el selector "Elemento CMDB" de Incidentes (columnas, relaciones, número de registros, calidad de datos), y el código del selector.
2. **Componentes reutilizables:** editor de formulario y creador de campos de Incidentes, constructor de reglas, motor de estados/flujo (Prompts 1 y 2 si ya existen), componente de borrador/publicación/versionado, sistema de notificaciones (1.6) y soporte de destinatarios dinámicos y plantillas, jobs programados, componentes de UI (árboles, tablas, modales, arrastrar-y-soltar, diagramas/grafos para el mapa).
3. **Perfiles y permisos:** cómo se almacenan y verifican en frontend, backend y RLS.
4. **Tablas existentes** de proveedores, contratos, licencias, departamentos, usuarios, servicios, centros de costo y catálogos de entorno y criticidad (compartidos con los Prompts 1 y 2).
5. **Estado del módulo operativo:** qué existe de `7.1`, `7.2`, `7.3`, `7.4` y `8`.
6. **Capacidades técnicas:** librerías de PDF, QR/códigos de barras, almacenamiento de archivos (Supabase Storage), cifrado de datos sensibles disponible, y hooks de desactivación de usuarios.
7. **Qué de la sección 13 ya existe y qué falta**, con el plan de migraciones y el plan de migración de datos (13.9).
8. **Riesgos o conflictos** detectados.

Después **detente y espera mi aprobación** para iniciar la Etapa A.

**Preguntas abiertas que quedan** (responde lo que puedas con el código; pregúntame solo lo que no puedas determinar):
1. Si las pantallas operativas (`7.1`, `7.2`, `7.3`, `7.4`, `8`) no existen: ¿construyes versiones mínimas, dirigidas por la configuración y fieles a las secciones 4 y 5, al final de cada etapa para poder probarla? **Propuesta por defecto: sí.**
2. Si no hay librería de PDF ni de QR: ¿apruebo la que propongas?
3. ¿Existe una tabla de proveedores y contratos en el módulo `8`? Si no, ¿apruebo crear las tablas mínimas descritas en 13.2?
4. ¿Cómo se desactiva hoy un usuario y existe algún punto de extensión (hook) para avisar de activos pendientes de devolución?

---

## 16. Fuera de alcance de este prompt
Gestión de problemas → Prompt 1 · Gestión de cambios → Prompt 2 · Descubrimiento automático de activos y agentes de inventario de software · Integración con sistemas contables o ERP (depreciación, activos fijos) · Gestión de compras y órdenes de compra (solo se registran los datos de la orden) · Bandejas, tableros y reportes del módulo · Modificar el SLA por servicio de incidentes y solicitudes.
