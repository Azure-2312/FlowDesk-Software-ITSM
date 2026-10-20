# Prompts de Configuración Administrativa — Problemas, Cambios y Activos/CMDB

> **Versión:** 2.0 · **Fecha:** 2026-10-19 · **Estado:** vigente.
> **Alcance:** especificaciones de las pantallas de configuración de los procesos de Problemas, Cambios (RFC) y Activos/CMDB, con las reglas comunes de interfaz, iconografía, validación, versionado, auditoría y permisos.
> **Uso:** la Parte I contiene las reglas comunes y el proceso de Problemas. Las Partes II y III reutilizan esas reglas y solo agregan lo específico de Cambios y Activos/CMDB. Los números de sección 4+ conservan la numeración del prompt original.

Este documento reemplaza a `prompt_1_config_gestion_de_problemas.md`, `prompt_2_config_gestion_de_cambios.md` y `prompt_3_config_activos_y_cmdb.md`. Se eliminó la repetición de los apartados comunes 0 a 3C.

---

## Parte I — Reglas comunes y Gestión de Problemas

> **Rama del menú que se implementa:** `1 Configuración > 1.3 Configuración de procesos > 1.3.3 Gestión de problemas`
> **Procesos relacionados en este documento:** Parte II = Gestión de cambios (1.3.4) · Parte III = Activos y CMDB (1.5).
> **Idioma de la interfaz:** español. **Código, tablas y endpoints:** nombres en español snake_case salvo convención técnica.
> **Stack real del proyecto:** Next.js 14 con App Router (frontend + backend) y PostgreSQL (alojado en Supabase y accedido con el pool `pg` de `src/shared/lib/db.ts`). Tienes acceso completo al código, la base de datos, el frontend y el backend.
> **Versión del documento:** 2.0 (actualizada a la arquitectura FlowDesk: numeración y rutas reales, reglas de navegación sin duplicar el menú, sistema de íconos y validaciones en todos los campos).

---

## 0. Instrucciones para la IA que implementará esto

**Rol:** eres un arquitecto/desarrollador senior de software ITSM. Vas a construir el área de configuración del *administrador* para el proceso de Gestión de Problemas de un sistema ITSM que ya tiene Incidentes y Solicitudes de servicio.

**Reglas obligatorias:**

1. Implementa **exactamente** lo descrito. Si algo no está especificado, **no lo inventes**: antes de escribir código, devuelve una lista numerada de "Preguntas abiertas" (ver sección 14) y espera respuesta.
2. **No cambies la numeración ni los nombres del menú**, salvo el renombre indicado en la sección 2.
3. **Nada hardcodeado:** todo lo que aquí se llama "configurable" se guarda en base de datos y se lee en tiempo de ejecución. Los valores de fábrica (sección 10) se cargan como datos semilla.
4. Todas las pantallas siguen el **patrón común de la sección 3** (borrador, publicación, versionado, auditoría, permisos).
5. **Reutiliza lo que ya existe; no crees duplicados.** El sistema ya tiene (ver sección 11): la configuración de formulario de Incidentes (1.3.1.1) y su **creador de campos personalizados**, la **matriz impacto × urgencia → prioridad** usada al crear incidentes, la **matriz institucional de tiempos por prioridad** (1.2.5), el catálogo de servicios, los perfiles y la CMDB. Ubica cada pieza en el código (Etapa 0), extiéndela para la entidad `problema` y solo crea componentes nuevos cuando no exista nada reutilizable.
6. Para cada pantalla entrega, en este orden: (a) modelo de datos, (b) API, (c) interfaz, (d) validaciones, (e) permisos, (f) auditoría, (g) pruebas.
7. Trabaja por etapas y detente al final de cada una para validación: **Etapa 0** = reconocimiento del código y la base de datos (sección 14, **obligatoria antes de escribir código**), **Etapa A** = 1.3.3.1, **Etapa B** = 1.3.3.2, **Etapa C** = 1.3.3.3.
8. **Si falta un dato en la base de datos, agrégalo.** La lista de lo que debe verificarse y, si no existe, crearse está en la sección 12. Todo cambio de esquema va en migraciones SQL versionadas e idempotentes, con autorización en cada Route Handler (cookie `sesion`, JWT y perfil activo, como el resto de `src/app/api/`) y consultas parametrizadas con `src/shared/lib/db.ts`.
9. Sigue las convenciones ya presentes en el repositorio (estructura de carpetas, estilo de API, componentes de UI, manejo de errores, tareas programadas).

**Reglas adicionales de esta versión (arquitectura FlowDesk, interfaz y validaciones):**

10. Las pantallas de este prompt **ya existen parcialmente** (ver 2.3). **No las reconstruyas desde cero**: audítalas contra este documento, corrige diferencias, completa lo que falta y conserva datos y contratos de API existentes.
11. Respeta la arquitectura del repositorio: pantallas en `src/app/plataforma/...` (las rutas URL no llevan el prefijo `plataforma`), Route Handlers en `src/app/api/...`, validadores en `src/shared/lib/validaciones.ts`, lógica de dominio en `src/modules/...` y componentes compartidos en `src/shared/...`. La migración de `src/lib` y `src/components` hacia `src/modules` y `src/shared` está en curso: **el código nuevo va en `modules`/`shared`** y no se crean más copias locales de componentes.
12. Cumple en **todas** las pantallas las secciones **3A** (navegación sin duplicar el menú), **3B** (íconos y botones) y **3C** (validaciones en tiempo real, solo errores).
13. **Autorización:** cada Route Handler verifica la cookie `sesion` (JWT) y el **perfil activo** (el usuario puede conmutarlo con `/api/auth/cambiar-perfil`), como el resto de `src/app/api/`. Las consultas son SQL parametrizado con `query()` / `queryRow()` de `src/shared/lib/db.ts`.
14. **SLA:** `src/shared/lib/sla.ts` ya calcula fechas límite con la matriz Urgencia × Impacto y **calendarios hábiles**; reutilízalo, no crees otro motor.

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
- **Problema mayor:** problema que cumple los criterios configurables de la sección 1.3.3.2 (pestaña "Problemas mayores") y exige revisión formal.

---

## 2. Ubicación en el menú y estructura de archivos (arquitectura FlowDesk)

### 2.1 Menú de administrador (referencia; ya se sirve desde `/api/menu` y `src/shared/lib/menu.ts`)

```
1 Configuración (/admin)
 1.1 Identidades y accesos
  1.1.1 Gestión de usuarios (/admin/usuarios)
  1.1.2 Perfiles y permisos (/admin/perfiles)
  1.1.3 Estructura del menú (/admin/menu)
 1.2 Catálogo de servicios y SLAs (/admin/servicios)
  1.2.1 Servicios de incidentes (/admin/servicios?tipo=1)
  1.2.2 Servicios de solicitudes (/admin/servicios?tipo=2)
  1.2.3 Crear servicio (/admin/servicios?vista=crear)
  1.2.4 Configuración de categorías (componente GestionCategorias; ruta a confirmar en la Etapa 0)
  1.2.5 Objetivos SLA (/admin/servicios/sla)
 1.3 Configuración de procesos (/admin/procesos)
  1.3.1 Incidentes
   1.3.1.1 Configuración de formulario (/admin/tickets-formularios?tipo=incidente)
   1.3.1.2 Flujo de estados y acciones (/admin/tickets-vistas?seccion=estados&tipo=incidente)
  1.3.2 Solicitudes de servicio
   1.3.2.1 Configuración de formulario (/admin/tickets-formularios?tipo=solicitud)
   1.3.2.2 Flujo de atención y aprobaciones (/admin/tickets-vistas?seccion=estados&tipo=solicitud)
  1.3.3 Gestión de problemas (/admin/procesos/problemas)            <-- SE IMPLEMENTA EN ESTE PROMPT
   1.3.3.1 Configuración de formulario (/admin/procesos/problemas/formulario)
   1.3.3.2 Flujo de investigación y seguimiento (/admin/procesos/problemas/flujo)
   1.3.3.3 Relación con incidentes, errores conocidos y conocimiento (/admin/procesos/problemas/relaciones)
  1.3.4 Gestión de cambios (/admin/procesos/cambios)
   1.3.4.1 Configuración de formulario (/admin/procesos/cambios/formulario)
   1.3.4.2 Tipos de cambio y requisitos (/admin/procesos/cambios/tipos-requisitos)
   1.3.4.3 Flujo de evaluación, autorización y revisión posterior (/admin/procesos/cambios/flujo-evaluacion)
   1.3.4.4 Notificaciones y calendario de cambios (/admin/procesos/cambios/notificaciones-calendario)
 1.4 Organización y soporte (/admin/organizacion)
  1.4.1 Departamentos empresariales (/admin/departamentos-empresa)
  1.4.2 Departamentos y grupos resolutores de TI (/admin/departamentos)
  1.4.3 Técnicos y niveles de soporte (/admin/tecnicos)
  1.4.4 Supervisores (/admin/departamentos?vista=supervisores)
 1.5 Activos y configuración (/admin/activos-config/tipos-modelos-atributos)
  1.5.1 Tipos, modelos y atributos de activos (/admin/activos-config/tipos-modelos-atributos)
  1.5.2 Ciclos de vida y reglas de transición (/admin/activos-config/ciclos-vida-transiciones)
  1.5.3 Licencias y contratos (/admin/activos-config/licencias-contratos)
  1.5.4 Tipos de elementos de configuración y relaciones de CMDB (/admin/activos-config/cmdb-relaciones)
 1.6 Comunicaciones y notificaciones (/admin/comunicaciones)
  1.6.1 Plantillas de correo y otros canales (/admin/notificaciones?seccion=plantillas)
  1.6.2 Configuración de contacto (/admin/notificaciones?seccion=contacto)
 1.7 Gobierno del conocimiento (/admin/conocimiento)
  1.7.1 Categorías, responsables y reglas de publicación/revisión (/admin/conocimiento-config)
 1.8 Auditoría, seguridad y retención (/admin/auditoria)
  1.8.1 Auditoría de cambios (/admin/auditoria-sistema)
  1.8.2 Registros de seguridad y autenticación (/admin/seguridad-logs)
  1.8.3 Retención y mantenimiento de datos (/admin/mantenimiento-datos)
2 Reportes y Analítica
 2.1 Indicadores operativos y SLA (/plataforma/reportes/operativos)
 2.2 Tableros (/plataforma/reportes/tableros)
```

Cambios respecto de versiones anteriores de este prompt: **(a)** Gestión de problemas es ahora `1.3.3` y Gestión de cambios `1.3.4`; **(b)** aparece el ítem nuevo `1.2.4 Configuración de categorías` y por eso **Objetivos SLA pasa a ser `1.2.5`**; **(c)** `1.3.3.1` ya se llama "Configuración de formulario".

### 2.2 Convención de numeración interna
- `1.3.3.1`, `1.3.3.2` y `1.3.3.3` son **ítems de menú = pantallas** (cada una con su `page.tsx`).
- Los puntos `1.3.3.1.1`, `1.3.3.1.2`, etc. son **ventanas internas** de esa pantalla (componentes `Pestana*.tsx`), cumpliendo la sección 3A: **ninguna ventana interna repite un ítem del menú**.

| Pantalla (ítem de menú) | Ruta | Ventanas internas (componentes `Pestana*.tsx`) | Modales y cajones |
|---|---|---|---|
| **1.3.3.1 Configuración de formulario** | `/admin/procesos/problemas/formulario` | 1.3.3.1.1 Campos (`PestanaCampos`, con cajón "Agregar campo" y panel de propiedades) · 1.3.3.1.2 Campos personalizados (`PestanaCamposPersonalizados`) · 1.3.3.1.3 Listas y catálogos (`PestanaListasCatalogos`) · 1.3.3.1.4 Matriz de prioridad (`PestanaPrioridad`) · 1.3.3.1.5 Plantillas de problema (`PestanaPlantillas`) · 1.3.3.1.6 Vista del ticket (`PestanaVistaTicket`) | `ModalVistaPrevia` · `ModalPublicacion` · `ModalHistorialVersiones` · `ModalRestaurarFabrica` · barra `BarraAccionesComun` |
| **1.3.3.2 Flujo de investigación y seguimiento** | `/admin/procesos/problemas/flujo` | 1.3.3.2.1 Estados (`PestanaEstados`) · 1.3.3.2.2 Transiciones y acciones (`PestanaTransiciones`) · 1.3.3.2.3 Asignación automática (`PestanaAsignacion`) · 1.3.3.2.4 Objetivos de tiempo (`PestanaObjetivosTiempo`) · 1.3.3.2.5 Escalamiento (`PestanaEscalamiento`) · 1.3.3.2.6 Reapertura (`PestanaReapertura`) · 1.3.3.2.7 Tareas predefinidas (`PestanaTareas`) · 1.3.3.2.8 Problemas mayores (`PestanaMayores`) | Los mismos modales de publicación, historial y restauración |
| **1.3.3.3 Relación con incidentes, errores conocidos y conocimiento** | `/admin/procesos/problemas/relaciones` | 1.3.3.3.1 Creación automática por umbral (`PestanaUmbral`) · 1.3.3.3.2 Incidentes vinculados (`PestanaIncidentesVinculados`) · 1.3.3.3.3 Errores conocidos (`PestanaKedb`) · 1.3.3.3.4 Cambios (RFC) (`PestanaRfc`) · 1.3.3.3.5 Conocimiento (`PestanaConocimiento`) · 1.3.3.3.6 CI y servicios (`PestanaCmdb`) | Los mismos modales |

### 2.3 Estado actual de la implementación (según el árbol de archivos del repositorio)
| Pantalla | Ya existe | Falta o hay que corregir |
|---|---|---|
| `/admin/procesos/problemas/page.tsx` | Página padre del grupo | Verificar que solo enlace a las tres pantallas hijas (sin pestañas que repitan el menú). |
| `1.3.3.1` formulario | `page.tsx`, `BarraAccionesComun`, `ModalHistorialVersiones`, `ModalPublicacion`, `ModalRestaurarFabrica`, `ModalVistaPrevia`, `PestanaCampos`, `PestanaListasCatalogos`, `PestanaPlantillas`, `PestanaVistaTicket`. API: `/api/admin/problemas/{configuracion,campos-personalizados,catalogos,matriz-prioridad,plantillas}` | **Faltan** las ventanas `PestanaCamposPersonalizados` y `PestanaPrioridad` (sus APIs ya existen). Unificar los modales y la barra con los de `cambios/formulario` (3A.2.6). |
| `1.3.3.2` flujo | `page.tsx` y las 8 ventanas `Pestana*`. API: `/api/admin/problemas/flujo/{asignacion,escalamiento,estados,mayores,objetivos,reapertura,tareas,transiciones}` | Auditar contra la sección 7; agregar validaciones (3C) y íconos (3B). |
| `1.3.3.3` relaciones | `page.tsx` y las 6 ventanas `Pestana*`. API: `/api/admin/problemas/relaciones`, `.../relaciones/kedb`, `.../relaciones/umbral` | Auditar contra la sección 8; agregar validaciones e íconos. |

### 2.4 Pantallas operativas que consumen esta configuración
| Menú general | Ruta | Archivos |
|---|---|---|
| 4.1 Registro de problemas | `/problemas` | `src/app/plataforma/problemas/page.tsx` y `src/modules/problemas/components/ProblemasWorkspace.tsx` |
| 4.2 Errores conocidos (KEDB) | `/problemas/kedb` | `src/app/plataforma/problemas/kedb/page.tsx` |
| Técnico M4.1 a M4.5 | `/plataforma/perfiles/tecnico/problemas/{asignados,grupo,nuevo,candidatos,errores-conocidos}` | `src/app/plataforma/perfiles/tecnico/problemas/*` |
| API de operación | `/api/problemas` | `src/app/api/problemas/*` |
Las secciones 4 y 5 de este documento describen lo que esas pantallas deben mostrar; si algo difiere, aplica la pregunta 1 de la sección 14.

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
| **Guardar borrador** ⟨Save⟩ | Secundario | Guarda cambios sin afectar el sistema en producción. Habilitado solo si hay cambios. Toast "Borrador guardado". |
| **Vista previa** ⟨Eye⟩ | Secundario | Abre modal/panel que muestra cómo quedará (el formulario, el ticket o el flujo) con datos de ejemplo. Permite el selector "Probar como perfil: [lista]". Solo lectura. |
| **Publicar…** ⟨CloudUpload⟩ | Primario | Abre el modal de publicación (3.2). Deshabilitado si hay errores de validación o no hay cambios. |
| **Descartar cambios** ⟨Undo2⟩ | Texto/peligro | Modal de confirmación "Se perderán los cambios del borrador. ¿Continuar?" [Descartar ⟨X⟩] [Cancelar ⟨X⟩]. Vuelve a la última versión publicada. |
| **Restaurar valores de fábrica** ⟨RotateCcw⟩ | Texto | Modal que explica qué se restaura (solo esta pestaña) y exige escribir la palabra `RESTAURAR` para habilitar el botón. Carga en borrador, no publica. |
| **Historial de versiones** ⟨History⟩ | Texto | Abre panel lateral con la lista de versiones (3.3). |
| **Exportar** ⟨FileDown⟩ / **Importar** ⟨FileUp⟩ | Texto | Exportar la configuración de la pestaña a JSON firmado con versión de esquema. Importar valida esquema y carga en borrador mostrando diferencias; nunca publica automáticamente. |

4. **Advertencia de salida:** si hay cambios sin guardar y el usuario navega fuera, mostrar "Tienes cambios sin guardar" con [Guardar borrador y salir ⟨Save⟩] [Salir sin guardar ⟨LogOut⟩] [Cancelar ⟨X⟩].
5. **Estados de pantalla:** cargando (skeleton), vacío (mensaje + botón de acción principal), error (mensaje + [Reintentar ⟨RefreshCw⟩]).
6. **Bloqueo de edición concurrente:** si otro administrador está editando la misma pestaña, mostrar banner "En edición por *usuario* desde *hora*" y poner la pantalla en solo lectura. El bloqueo expira a los 15 min de inactividad. Botón [Solicitar control ⟨Send⟩] disponible para el perfil Administrador.
7. Las pantallas son **solo escritorio** (≥1280 px). Todo arrastrar-y-soltar debe tener alternativa por teclado (botones ↑ ↓ y atajos).

### 3.2 Modal de publicación
- Muestra **resumen de diferencias (diff)**: elementos agregados (verde), modificados (ámbar, con valor anterior → nuevo) y eliminados (rojo).
- Muestra **análisis de impacto**: "Esta publicación afecta a N tickets abiertos" cuando aplique (ver 3.4).
- Campo **Motivo del cambio** (obligatorio, mín. 10 caracteres).
- Casilla "He revisado el impacto" (obligatoria si el impacto alcanza tickets abiertos).
- Botones: [Confirmar publicación ⟨CloudUpload⟩] [Cancelar ⟨X⟩].
- Al confirmar: se crea nueva versión inmutable `vN+1`, se aplica de inmediato, se emite evento `configuracion.publicada` y se registra en auditoría.

### 3.3 Versionado
Cada versión guarda: número, fecha-hora, autor, motivo, snapshot completo (JSON) y diff contra la anterior. Desde el panel de historial:
- [Ver ⟨FileText⟩] → vista de solo lectura de esa versión.
- [Comparar con actual ⟨GitCompare⟩] → diff lado a lado.
- [Restaurar esta versión ⟨RotateCcw⟩] → carga esa versión como borrador (no publica).
- Las versiones **no se editan ni se borran** (la retención se rige por 1.8.3).

### 3.4 Efecto de la configuración sobre tickets existentes
Regla general (aplicar salvo que la pestaña indique otra cosa):
- Los cambios de **formulario** (campos, obligatoriedad) aplican a tickets **nuevos** y a la edición de tickets en estados no finales. Un campo que pasa a obligatorio **no invalida** tickets ya existentes; solo se exige al editarlos o al ejecutar una transición que lo requiera.
- Un campo que se **oculta** conserva sus datos en base de datos (nunca se borran); solo deja de mostrarse y puede reactivarse.
- Los cambios de **flujo** (estados/transiciones) aplican a todos los tickets abiertos; si un estado en uso se desactiva, la publicación se bloquea con el mensaje "El estado X tiene N tickets; reasígnalos a otro estado" y un asistente de migración (selector de estado destino + botón [Migrar y continuar ⟨ArrowRightLeft⟩]).
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

## 3A. REGLAS DE INTERFAZ OBLIGATORIAS (navegación, ventanas internas y accesibilidad)

Estas reglas aplican a **todas** las pantallas de este prompt y prevalecen sobre cualquier descripción anterior que las contradiga.

### 3A.1 Un ítem de menú = una pantalla (prohibido duplicar el menú dentro de la página)
1. **Prohibido** repetir ítems del menú lateral como pestañas, botones segmentados, chips o enlaces en la parte superior de una página. *Ejemplo del error que se debe evitar:* entrar a "Catálogo de incidentes" y ver arriba los botones "Catálogo de incidentes | Catálogo de solicitudes" cuando ambos ya son opciones del menú. Para cambiar de pantalla se usa el menú.
2. Antes de implementar o modificar una pantalla, **compara** sus pestañas internas con el árbol de menú real (`src/shared/lib/menu.ts` y la tabla de menú que alimenta `/api/menu`). Si una pestaña coincide en nombre o función con un ítem de menú, **elimínala** de la página.
3. El título de la página, el breadcrumb y el ítem activo del menú coinciden siempre. El botón "Volver" solo existe en pantallas que **no** son ítem de menú (detalle o edición, por ejemplo `/admin/servicios/[id]/formulario`).

### 3A.2 Ventanas internas (permitidas y recomendadas)
1. Una pantalla **sí** puede tener varias **ventanas internas intercambiables** cuando son secciones o herramientas de esa misma pantalla que **no existen** como ítem de menú (ejemplo: en un formulario configurable, las ventanas "Configuración de campos", "Agregar campo" y "Vista previa").
2. Cada ventana interna es un componente `Pestana*.tsx` dentro de la carpeta `components/` de la página (convención ya usada en el proyecto). La barra de ventanas internas tiene **estilo propio** (subrayado o segmentado pequeño, `role="tablist"`), claramente distinto del menú lateral.
3. La ventana activa se guarda en el parámetro de consulta `?vista=<codigo>` para poder compartir el enlace y volver con el botón del navegador. **Cambiar de ventana interna no cambia el ítem activo del menú.**
4. Las acciones puntuales (vista previa, publicar, historial de versiones, restaurar valores de fábrica, confirmaciones) usan **modales o cajones laterales** (`ModalVistaPrevia`, `ModalPublicacion`, `ModalHistorialVersiones`, `ModalRestaurarFabrica`), nunca ventanas internas.
5. Los **selectores de contexto** (por ejemplo "Formulario: Registro / Edición", "Aplicar a: tipo") son **listas desplegables** que filtran los datos de la ventana; no se presentan como pestañas.
6. Los componentes comunes de las pantallas de configuración (`BarraAccionesComun`, `ModalPublicacion`, `ModalHistorialVersiones`, `ModalRestaurarFabrica`, `ModalVistaPrevia`) hoy están **duplicados** en `procesos/problemas/formulario/components/` y `procesos/cambios/formulario/components/`. **Unifícalos** en un único lugar compartido (`src/shared/components/ui/` o `src/shared/components/admin/`) y haz que ambos módulos y el de activos los importen.

### 3A.3 Estados, accesibilidad y comportamiento
- Todo listado y toda ventana interna tienen estados de **carga** (esqueleto), **vacío** (mensaje y acción sugerida) y **error** (mensaje y botón "Reintentar").
- Navegación por teclado completa (Tab, Shift+Tab, Enter, Esc); orden de tabulación = orden visual; foco visible; foco atrapado dentro de modales y devuelto al botón que los abrió; Esc cierra modales.
- Roles ARIA: `tablist/tab/tabpanel` en ventanas internas, `dialog` en modales, `alert` en errores (ver 3C), `aria-label` en todo botón de solo ícono.
- Diseño de escritorio primero (≥1280 px), utilizable en tableta (≥768 px). Las tablas anchas se desplazan dentro de su propio contenedor, nunca la página completa.
- Colores y tipografía: los ya definidos en `globals.css` y en las pantallas existentes (barra lateral oscura, contenido claro, azul `#2563eb` como acento principal). No introducir otra paleta.
---

## 3B. SISTEMA DE ÍCONOS Y BOTONES (estilo formal ya usado en el sistema)

### 3B.1 Estilo visual (tomado de las pantallas existentes, p. ej. la tabla de servicios)
- **Familia única de íconos de línea** (*outline*), trazo uniforme de 1,5–1,75 px, extremos y esquinas redondeadas, 16×16 px, estilo **Lucide/Feather**. Prohibido mezclar con emojis, íconos rellenos o multicolor.
- **Botón de acción en filas de tabla (solo ícono):** cuadrado de **32×32 px**, borde de 1 px gris claro (`#e5e7eb`), radio de 8 px, fondo blanco, ícono gris oscuro (`#374151`). Al pasar el cursor: fondo `#f9fafb`. Con foco: anillo azul de 2 px. Cada botón lleva `title` (tooltip con el nombre de la acción) y `aria-label`.
- **Variante de peligro** (desactivar, eliminar, rechazar): ícono rojo (`#dc2626`), borde rojo claro (`#fecaca`), fondo `#fef2f2` al pasar el cursor.
- **Botones con texto:** *primario* azul sólido (`#2563eb`) con texto blanco (como "Registrar Servicio"); *secundario* fondo blanco, borde gris, texto oscuro (como "Cancelar"); *peligro* borde y texto rojos; *enlace* texto azul sin borde. Un ícono opcional de 16 px a la izquierda, con 8 px de separación.
- **Insignias de estado:** píldora con fondo suave y texto del mismo matiz (por ejemplo "Activo" en verde suave; "Pre-aprobado" en azul).
- Cada acción usa **siempre el mismo ícono** en todo el sistema. Los íconos de acciones frecuentes de fila son: ver detalle (`FileText`), editar (`SquarePen`), ver lista o detalle de elementos (`List`) y desactivar (`Ban`, en rojo).

### 3B.2 Notación de este documento
Junto a cada botón verás `⟨NombreIcono⟩`: es el **nombre del ícono** (nomenclatura Lucide) que debe llevar, por ejemplo `[Guardar borrador ⟨Save⟩]`. El texto entre corchetes es la etiqueta. Si el botón es de fila de tabla, se muestra **solo el ícono** con tooltip; si es botón de barra o formulario, ícono + texto.

### 3B.3 Implementación
- Verifica con qué librería están dibujados los íconos actuales. Si el proyecto ya usa `lucide-react`, úsala. Si no, crea **un único módulo compartido** `src/shared/components/ui/Iconos.tsx` (o `src/shared/components/ui/Iconos.tsx`) con los SVG de los nombres de la tabla 3B.4, con el mismo estilo.
- **Unifica** los archivos `Iconos.tsx` locales de `admin/procesos/cambios/flujo-evaluacion/components/` y `admin/procesos/cambios/notificaciones-calendario/components/` en ese módulo y elimina las copias.
- Crea un componente `BotonIcono` (props: `icono`, `etiqueta`, `variante: 'normal' | 'peligro'`, `onClick`, `disabled`) y un componente `Boton` (props: `variante`, `icono?`, `children`) para que ninguna pantalla dibuje botones con estilos propios.

### 3B.4 Catálogo de acciones → ícono
| Acción | Ícono | Variante |
|---|---|---|
| Nuevo / Agregar / Añadir / Crear | `Plus` | primario o secundario |
| Registrar / Enviar solicitud | `FilePlus` / `Send` | primario |
| Guardar / Guardar borrador | `Save` | primario / secundario |
| Publicar / Confirmar publicación | `CloudUpload` | primario |
| Cancelar / Cerrar ventana / Descartar | `X` | secundario |
| Atrás / Siguiente | `ArrowLeft` / `ArrowRight` | secundario |
| Ver detalle / Abrir / Ver ficha | `FileText` | fila |
| Editar / Renombrar / Cambiar | `SquarePen` | fila |
| Ver lista de elementos / Ver uso | `List` | fila |
| Duplicar / Copiar configuración | `Copy` | fila |
| Eliminar / Quitar | `Trash2` | peligro |
| Desactivar / Suspender / Retirar | `Ban` | peligro |
| Activar / Reanudar / Iniciar | `Play` / `CircleCheck` | fila |
| Vista previa / Mostrar | `Eye` | secundario |
| Ocultar | `EyeOff` | fila |
| Descartar cambios / Deshacer | `Undo2` | secundario |
| Restaurar valores de fábrica / Reabrir | `RotateCcw` | secundario |
| Historial de versiones / Ver historial | `History` | secundario |
| Importar (archivo) | `FileUp` | secundario |
| Exportar / Descargar | `FileDown` / `Download` | secundario |
| Reordenar | `ArrowUpDown` | fila |
| Expandir todo / Contraer todo | `ChevronsUpDown` / `ChevronsDownUp` | secundario |
| Mover | `MoveRight` | fila |
| Buscar | `Search` | campo |
| Filtros | `SlidersHorizontal` | secundario |
| Columnas | `Columns3` | secundario |
| Actualizar / Reintentar | `RefreshCw` | secundario |
| Limpiar | `Eraser` | secundario |
| Simulador / Probar / Simular | `FlaskConical` | secundario |
| Vincular / Desvincular | `Link2` / `Unlink` | fila |
| Copiar enlace | `Link` | fila |
| Imprimir etiqueta / Imprimir | `Printer` | fila |
| Adjuntar / Seleccionar archivos | `Paperclip` / `Upload` | secundario |
| Aprobar / Resolver / Completar | `CircleCheck` | primario |
| Rechazar | `CircleX` | peligro |
| Solicitar información | `CircleHelp` | secundario |
| Delegar / Reasignar / Transferir | `ArrowRightLeft` | secundario |
| Asignar / Tomar | `UserPlus` | secundario |
| Escalar | `TrendingUp` | secundario |
| Poner en espera | `Pause` | secundario |
| Programar / Reprogramar / Calendario | `CalendarClock` / `Calendar` | secundario |
| Ver en mapa / Analizar impacto | `Network` | secundario |
| Fusionar | `Merge` | secundario |
| Seguir / Dejar de seguir | `Bell` / `BellOff` | fila |
| Advertencia / información | `TriangleAlert` / `Info` | insignia |
| Candado (campo bloqueado) | `Lock` | insignia |
---

## 3C. REGLAS DE VALIDACIÓN (obligatorias para TODO dato que el usuario escribe o elige)

### 3C.1 Principios
1. **Todo campo tiene definidos**: tipo de dato, formato, longitud o rango, obligatoriedad y mensaje de error. No existe ningún campo de entrada sin validación (incluidos los de pantallas de configuración, editores, modales y filtros).
2. **Validación en tiempo real:** el formato, la longitud, el rango y los caracteres se validan **mientras se escribe**. La obligatoriedad se evalúa al **salir del campo** (blur) y al **intentar enviar**; nunca al abrir un formulario vacío.
3. **Solo se muestran errores.** No hay mensajes, íconos ni bordes de éxito (sin check verde). El error usa el componente `AlertaCampo` (`src/shared/components/ui/AlertaCampo.tsx`: `role="alert"`, texto `#b91c1c`, fondo `#fef2f2`, borde `#fecaca`) y borde rojo en el campo con `aria-invalid="true"` y `aria-describedby`.
4. **Un solo mensaje por campo** (el más específico), breve, en español, que diga qué corregir ("Ingresa 8 dígitos numéricos"), sin tecnicismos.
5. **Restricción de entrada:** los campos numéricos y de identificación filtran caracteres inválidos al teclear y al pegar (`inputMode`, `maxLength`, máscara) y normalizan el valor (recortar espacios, colapsar espacios múltiples, mayúsculas donde corresponda). Si se pega contenido inválido, se limpia y se muestra el mensaje.
6. **Campos dependientes:** el valor de un selector controla el validador del campo siguiente. Ejemplo obligatorio: **Tipo de documento = DNI / RUC / Carné de extranjería / Pasaporte** → el campo "Número de documento" cambia de inmediato su `maxLength`, `inputMode`, máscara y validador (V-DNI, V-RUC, V-CE, V-PAS). Al cambiar el selector, el número se revalida; si ya no es válido se marca el error (o se limpia, según la regla del campo).
7. **Misma lógica en cliente y servidor:** todos los validadores viven en `src/shared/lib/validaciones.ts` (y los específicos de módulo en `src/modules/<dominio>/<modulo>Validaciones.ts`), son funciones puras que devuelven `{ valido: boolean, mensaje?: string }` y se importan tanto en el formulario como en el Route Handler. El servidor responde `400` con `{ campo, mensaje }` y la interfaz lo pinta en el campo correspondiente.
8. **Botón primario:** mientras exista algún error de formato visible, queda deshabilitado (`aria-disabled`) con tooltip "Corrige los campos marcados". Los obligatorios vacíos no lo deshabilitan: al hacer clic se muestran los errores y se enfoca el primero.
9. **Unicidad (nombre, código, serie, hostname):** validación asíncrona con *debounce* de 400 ms contra el servidor; mientras consulta, el campo muestra un indicador discreto de carga **sin** mensaje; si hay duplicado, error ("Ya existe un registro con ese código").
10. **Coherencia entre campos:** fecha inicio < fecha fin, SLA primera respuesta < SLA resolución, mínimo ≤ máximo, etc. El error se muestra en el campo que debe corregirse.
11. **Sanitización:** eliminar etiquetas HTML y caracteres de control del texto simple; el texto enriquecido se sanea con lista blanca; consultas siempre parametrizadas; apoyarse en `src/shared/lib/security.ts`.
12. **Adjuntos:** tipos y tamaño según 1.8.3 (fábrica: 25 MB por archivo, 10 archivos, ejecutables bloqueados); el error indica el archivo y el motivo.

### 3C.2 Catálogo de validadores (ID, tipo de dato, regla exacta y mensaje)
| ID | Tipo de dato | Regla | Mensaje de error |
|---|---|---|---|
| V-NOMBRE | Texto corto | Recortado, 3–60 caracteres, letras, números, espacios y `.,-_()/&`; sin espacios dobles. | "Ingresa entre 3 y 60 caracteres válidos." |
| V-TITULO | Texto corto | 10–150 caracteres, sin saltos de línea, no solo números. | "El título debe tener entre 10 y 150 caracteres." |
| V-NOMBRE80 | Texto corto | 5–80 caracteres (plantillas, modelos, reglas). | "Ingresa entre 5 y 80 caracteres." |
| V-TEXTO(min,max) | Texto simple | Longitud entre *min* y *max* tras recortar. | "Ingresa entre {min} y {max} caracteres." |
| V-RICO(min,max) | Texto enriquecido | Longitud del texto plano entre *min* y *max*; HTML saneado. | "El texto debe tener entre {min} y {max} caracteres." |
| V-CODIGO | Código técnico | `^[a-z][a-z0-9_]{2,39}$`; inmutable tras publicar. | "Usa minúsculas, números y guion bajo (3 a 40), iniciando con letra." |
| V-CODIGO-MAY | Código visible | `^[A-Z0-9][A-Z0-9-]{1,19}$`. | "Usa mayúsculas, números o guion (2 a 20)." |
| V-PREFIJO | Prefijo | `^[A-Z]{2,5}$`. | "Ingresa de 2 a 5 letras mayúsculas." |
| V-ENTERO(min,max) | Entero | Solo dígitos (signo opcional si min<0), valor entre *min* y *max*. | "Ingresa un número entero entre {min} y {max}." |
| V-DECIMAL(min,max,dec) | Decimal | Punto decimal, hasta *dec* decimales, entre *min* y *max*. | "Ingresa un número entre {min} y {max} (máx. {dec} decimales)." |
| V-MONTO | Monto S/. | Decimal ≥ 0, 2 decimales, ≤ 9 999 999,99. | "Ingresa un monto válido (hasta 2 decimales)." |
| V-PORC | Porcentaje | Entero o decimal de 0 a 100. | "Ingresa un porcentaje entre 0 y 100." |
| V-HORAS | Horas | Entero de 1 a 8760. | "Ingresa horas enteras entre 1 y 8760." |
| V-DIAS | Días | Entero de 0 a 3650. | "Ingresa días enteros entre 0 y 3650." |
| V-MESES | Meses | Entero de 1 a 600. | "Ingresa meses enteros entre 1 y 600." |
| V-MIN | Minutos | Entero de 1 a 1440. | "Ingresa minutos enteros entre 1 y 1440." |
| V-ORDEN | Orden | Entero ≥ 1, único dentro de su lista. | "Ingresa un orden entero mayor que 0." |
| V-FECHA | Fecha | `AAAA-MM-DD` válida, año 2000–2100; el rango permitido (pasadas/futuras) lo fija el campo. | "Ingresa una fecha válida." |
| V-FECHAHORA | Fecha y hora | Fecha válida + `HH:mm` 00:00–23:59, en zona horaria del sistema. | "Ingresa una fecha y hora válidas." |
| V-HORA | Hora | `^([01]\d\|2[0-3]):[0-5]\d$`. | "Ingresa la hora en formato HH:mm." |
| V-RANGO-FECHAS | Rango | Inicio < fin (o ≤ según campo). | "La fecha de fin debe ser posterior a la de inicio." |
| V-CORREO | Correo | RFC 5322 práctico, ≤ 254 caracteres, sin espacios, en minúsculas. | "Ingresa un correo válido (ej. nombre@empresa.com)." |
| V-TEL-MOVIL | Celular | Exactamente 9 dígitos, inicia en 9. | "Ingresa 9 dígitos que inicien con 9." |
| V-TEL-FIJO | Teléfono fijo | Código de ciudad (1 a 3 dígitos) + 6 o 7 dígitos; solo números. | "Ingresa un teléfono fijo válido con código de ciudad." |
| V-TEL-INTL | Teléfono internacional | `+` y 8–15 dígitos (E.164). | "Ingresa el número con código de país (ej. +51987654321)." |
| V-DNI | DNI | Exactamente 8 dígitos numéricos, no todos ceros. | "El DNI debe tener 8 dígitos numéricos." |
| V-RUC | RUC | 11 dígitos numéricos; inicia con 10, 15, 16, 17 o 20; dígito verificador correcto (pesos 5-4-3-2-7-6-5-4-3-2, módulo 11: resto → 11 − resto; 10 → 0; 11 → 1). | "El RUC debe tener 11 dígitos y un dígito verificador válido." |
| V-CE | Carné de extranjería | 9–12 caracteres alfanuméricos en mayúsculas. | "Ingresa de 9 a 12 caracteres alfanuméricos." |
| V-PAS | Pasaporte | 6–12 caracteres alfanuméricos en mayúsculas. | "Ingresa de 6 a 12 caracteres alfanuméricos." |
| V-DOC(tipo) | Documento (dependiente) | Aplica V-DNI, V-RUC, V-CE o V-PAS según el selector "Tipo de documento". | Mensaje del validador elegido. |
| V-URL | URL | `https://` obligatorio, dominio válido, ≤ 2048 caracteres. | "Ingresa una URL válida que empiece con https://." |
| V-IPV4 | IP v4 | Cuatro octetos 0–255 separados por punto. | "Ingresa una dirección IPv4 válida." |
| V-IPV6 | IP v6 | Formato IPv6 válido. | "Ingresa una dirección IPv6 válida." |
| V-MAC | MAC | `^([0-9A-F]{2}[:-]){5}[0-9A-F]{2}$` (mayúsculas). | "Ingresa una MAC válida (AA:BB:CC:DD:EE:FF)." |
| V-HOST | Hostname | RFC 1123: letras, números y guion, 1–63 por etiqueta, sin iniciar/terminar con guion. | "Ingresa un nombre de equipo válido." |
| V-SERIE | N.º de serie | 4–50 caracteres alfanuméricos, guion y punto, en mayúsculas. | "Ingresa de 4 a 50 caracteres alfanuméricos." |
| V-IMEI | IMEI | 15 dígitos y dígito de control Luhn. | "Ingresa un IMEI válido de 15 dígitos." |
| V-PUERTO | Puerto | Entero 1–65535. | "Ingresa un puerto entre 1 y 65535." |
| V-VLAN | VLAN | Entero 1–4094. | "Ingresa una VLAN entre 1 y 4094." |
| V-HEX | Color | `^#[0-9A-Fa-f]{6}$`. | "Ingresa un color hexadecimal (ej. #2563eb)." |
| V-REGEX | Expresión regular | Compila sin error, ≤ 200 caracteres, sin cuantificadores anidados catastróficos. | "La expresión regular no es válida." |
| V-LISTA | Lista (una opción) | Valor ∈ opciones **activas** del catálogo. | "Selecciona una opción de la lista." |
| V-MULTI(min,max) | Selección múltiple | Entre *min* y *max* valores, sin repetidos, todos activos. | "Selecciona entre {min} y {max} opciones." |
| V-REF | Referencia | El registro existe, está activo y cumple el alcance del campo. | "Selecciona un registro válido." |
| V-ARCHIVO | Archivo | Extensión y tipo MIME permitidos, tamaño ≤ límite, ejecutables bloqueados. | "El archivo {nombre} no es válido: {motivo}." |
| V-UNICO(tabla,campo) | Unicidad | No existe otro registro (insensible a mayúsculas y tildes) en el mismo ámbito. | "Ya existe un registro con ese valor." |
| V-OBLIG | Obligatorio | No vacío tras recortar. | "Este campo es obligatorio." |
| V-JUSTIF | Justificación | Texto 15–500 caracteres. | "Explica el motivo en 15 a 500 caracteres." |
| V-VERSION | Versión de software | `^\d+(\.\d+){0,3}([-+][A-Za-z0-9.]+)?$`. | "Ingresa una versión válida (ej. 2.4.1)." |

### 3C.3 Cómo se documenta la validación en cada formulario de este prompt
- En las secciones de formularios de usuario se incluye la tabla **"Validaciones de los campos"** (campo, tipo de dato, regla exacta, mensaje).
- En cada pantalla de configuración se incluye la tabla **"Validaciones de la pantalla"** (propiedad, tipo de dato, validadores). Los mensajes de los validadores del catálogo 3C.2 se reutilizan.
- Cualquier campo nuevo que se agregue durante la implementación **debe** declarar su validador antes de aprobarse.

---

## 4. ESPECIFICACIÓN DEL FORMULARIO DE REGISTRO DE PROBLEMA (lo que ve el usuario)

Esta sección define la **versión de fábrica** del formulario. La sección 6 define cómo el administrador la modifica.

**Quién lo usa:** perfiles **Técnico**, **Gestor de Problemas**, **Supervisor** y **Administrador** (permiso `problemas.crear`). Los perfiles Solicitante, Gestor de Área, Auditor y Aprobador **no** registran problemas.
**Dónde:** menú `4 Gestión de Problemas > 4.1 Registro de problemas > botón [+ Nuevo problema ⟨Plus⟩]`. También desde un incidente: botón **[Crear problema desde este incidente ⟨FilePlus⟩]**, que abre este formulario con Origen = *Incidente(s)*, el incidente ya vinculado, y el servicio, los CI y la categoría prellenados desde el incidente.
**Disposición:** una sola página con **secciones plegables**, todas abiertas al inicio. Arriba, a la derecha, el selector **[Usar plantilla ▾]** (ver 1.3.3.1.5).

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
| B2 | Activos / CI afectados | `ci_afectados` | Selector múltiple (CMDB) | No | Filtrado por defecto por el servicio elegido (casilla "Ver todos los CI"). A diferencia del formulario de Incidentes (que solo lista ítems bajo custodia del usuario), aquí se listan **todos** los CI de la CMDB (hardware, software y periféricos). Muestra código, nombre, clase y criticidad. Se sugieren los CI de los incidentes vinculados con botón [Agregar sugeridos ⟨Plus⟩]. |
| B3 | Categoría | `categoria_id` | Lista en cascada (Categoría → Subcategoría) | Sí | Catálogo editable (1.3.3.1.3). Al elegir categoría puede prellenar grupo resolutor (si la categoría tiene grupo por defecto). |

**Sección C — Clasificación y priorización**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| C1 | Impacto | `impacto` | Lista con **los mismos niveles que usa hoy Incidentes (Alta / Media / Baja)**, con descripción de cada nivel en tooltip | Sí | Los niveles se leen de la matriz compartida (1.3.3.1.4); no se redefinen aquí. |
| C2 | Urgencia | `urgencia` | Lista (Alta/Media/Baja) con tooltip | Sí | Ídem. |
| C3 | Prioridad | `prioridad` | Insignia de solo lectura con color | Calculado | Se recalcula al instante con **la misma matriz impacto × urgencia que usa Incidentes** (P1 a P4), salvo que el admin active una matriz propia para problemas (1.3.3.1.4). Si la configuración permite prioridad manual, aparece el enlace [Cambiar manualmente ⟨SquarePen⟩] que exige justificación. |

**Panel informativo de la Sección C (a la derecha, solo lectura):** equivalente al "panel de SLAs asociados" del formulario de Incidentes. Al calcularse la prioridad, muestra los objetivos de tiempo del problema para esa prioridad (primera respuesta, diagnóstico y resolución, en horas, tomados de 1.3.3.2.4) y la descripción operativa del nivel.

**Sección D — Asignación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| D1 | Grupo resolutor | `grupo_id` | Lista (grupos de 1.4.2) | Sí | Prellenado por reglas de asignación automática (1.3.3.2.3); editable si el perfil lo permite. |
| D2 | Responsable | `responsable_id` | Lista con búsqueda (técnicos del grupo, 1.4.3) | No al crear | Si queda vacío, el problema se crea en estado *Nuevo* sin responsable y aparece en la bandeja del grupo. Muestra carga actual (tickets abiertos) junto a cada nombre. |

**Sección E — Mitigación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| E1 | Workaround conocido | `workaround` | Texto enriquecido | No | Si se completa, aparece la casilla "Publicar como error conocido al registrar" (solo con permiso `kedb.publicar`). |

**Sección F — Adjuntos**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| F1 | Evidencias (adjuntos) | `adjuntos` | Zona arrastrar-y-soltar + botón [Seleccionar archivos ⟨FileUp⟩] | No | Tipos permitidos y tamaño máximo configurables en 1.8.3 (valor de fábrica: 25 MB por archivo, 10 archivos; bloquear ejecutables). Muestra nombre, tamaño, barra de progreso y [Quitar ⟨Trash2⟩]. |

**Campos automáticos (no editables; se muestran en un panel lateral "Datos del registro")**
`id` (formato `PRB-000001`, secuencia sin saltos), `registrado_por`, `fecha_registro`, `estado` inicial = *Nuevo*, `origen_canal` (manual / desde incidente / regla automática).

### 4.2 Botones del formulario
- **[Registrar problema ⟨FilePlus⟩]** (primario): valida, crea el ticket, muestra toast "Problema PRB-xxxxxx registrado" y redirige a la vista del ticket.
- **[Registrar y crear otro ⟨FilePlus⟩]**: igual, pero limpia el formulario conservando la plantilla.
- **[Guardar como borrador ⟨Save⟩]**: guarda sin validar obligatorios; el borrador solo lo ve su autor en "Mis borradores" y caduca a los 30 días (configurable en 1.8.3).
- **[Cancelar ⟨X⟩]**: pide confirmación si hay datos.

### 4.3 Validaciones al registrar
- Todos los obligatorios completos; los errores se listan arriba y se enfoca el primero.
- Si hay problema abierto con el mismo título normalizado y el mismo servicio, mostrar advertencia no bloqueante "Posible duplicado: PRB-xxxxxx" con [Ver ⟨FileText⟩] [Registrar de todos modos ⟨FilePlus⟩].
- Ningún incidente puede estar vinculado a otro problema abierto, salvo que la configuración 1.3.3.3.2 lo permita.


### 4.4 Validaciones de los campos del formulario de registro (cumple 3C)

| Campo | Tipo de dato | Regla exacta (validador) | Mensaje de error |
|---|---|---|---|
| Título (`titulo`) | Texto corto | V-TITULO (10–150), recortado, sin saltos de línea | El título debe tener entre 10 y 150 caracteres. |
| Descripción / síntomas (`descripcion`) | Texto enriquecido | V-RICO(30,10000), HTML saneado | Describe los síntomas en al menos 30 caracteres. |
| Origen (`origen`) | Lista | V-OBLIG + V-LISTA (catálogo *Orígenes* activo) | Selecciona el origen del problema. |
| Incidentes relacionados (`incidentes_vinculados`) | Selección múltiple de referencias | V-MULTI(0,200); **mínimo 1 si Origen = Incidente(s)**; cada incidente existe, su estado está permitido (1.3.3.3.2) y no está vinculado a otro problema abierto (salvo que se permita) | Vincula al menos un incidente. / El incidente {ID} ya está vinculado a otro problema. |
| Servicio afectado (`servicio_id`) | Referencia | V-OBLIG + V-REF (servicio activo del catálogo) | Selecciona un servicio activo. |
| Activos / CI afectados (`ci_afectados`) | Selección múltiple de referencias | V-MULTI(0,100); CI activos; si la regla 1.3.3.3.6 lo exige, el CI soporta el servicio elegido | Selecciona CI activos (máximo 100). |
| Categoría y subcategoría (`categoria_id`) | Lista en cascada | V-OBLIG + V-LISTA; la subcategoría pertenece a la categoría | Selecciona categoría y subcategoría. |
| Impacto (`impacto`) | Lista | V-OBLIG + V-LISTA (niveles de la matriz compartida: Alta, Media, Baja) | Selecciona el impacto. |
| Urgencia (`urgencia`) | Lista | V-OBLIG + V-LISTA (Alta, Media, Baja) | Selecciona la urgencia. |
| Prioridad (`prioridad`) | Calculado, solo lectura | Se deriva de la matriz; si se cambia manualmente: V-JUSTIF y perfil autorizado | Explica el motivo del cambio de prioridad (15 a 500 caracteres). |
| Grupo resolutor (`grupo_id`) | Referencia | V-OBLIG + V-REF (grupo de TI activo) | Selecciona el grupo resolutor. |
| Responsable (`responsable_id`) | Referencia | V-REF (técnico activo y **miembro del grupo elegido**); opcional | El responsable debe pertenecer al grupo seleccionado. |
| Workaround (`workaround`) | Texto enriquecido | V-RICO(0,5000); si se marca «Publicar como error conocido»: V-RICO(20,5000) | El workaround debe tener al menos 20 caracteres para publicarlo. |
| Adjuntos (`adjuntos`) | Archivos | V-ARCHIVO: máx. 10 archivos de 25 MB, ejecutables bloqueados | El archivo {nombre} no es válido: {motivo}. |
| Plantilla (selector) | Lista | V-LISTA (plantillas activas visibles para el perfil); opcional | Selecciona una plantilla válida. |

---

## 5. ESPECIFICACIÓN DEL TICKET DE PROBLEMA YA CREADO (lo que ve el usuario)

**Ruta:** `4 Gestión de Problemas > 4.1 Registro de problemas > (fila) PRB-xxxxxx`.
**Layout:** cabecera fija arriba + barra de acciones + pestañas a la izquierda/arriba + panel lateral derecho de resumen.

### 5.1 Cabecera fija
Muestra siempre: **ID**, **título**, **insignia de estado** (con color), **insignia de prioridad**, **responsable** (avatar + nombre, clic para reasignar si hay permiso), **grupo resolutor**, **fecha de registro**, **tiempo abierto** (ej. "3 d 4 h", se detiene al cerrar), **indicadores de objetivos de tiempo** (dos medidores: "Diagnóstico" y "Resolución", con porcentaje consumido y color verde/ámbar/rojo/en pausa), y las **etiquetas**: `Problema mayor`, `Error conocido`, `Reabierto`, `Con RFC pendiente` cuando apliquen.

### 5.2 Barra de acciones
Los botones se generan **dinámicamente** desde las transiciones configuradas en 1.3.3.2.2 para el estado actual y el perfil del usuario (ej. [Iniciar análisis ⟨Play⟩], [Registrar causa raíz ⟨FilePlus⟩], [Publicar error conocido ⟨CloudUpload⟩], [Solicitar cambio ⟨Send⟩], [Resolver ⟨CircleCheck⟩], [Cerrar ⟨X⟩], [Poner en espera ⟨Pause⟩], [Cancelar ⟨X⟩]). Siempre presentes, según permisos: **[Reasignar ⟨ArrowRightLeft⟩]**, **[Editar ⟨SquarePen⟩]**, **[Vincular incidente ⟨Link2⟩]**, **[Crear RFC ⟨FilePlus⟩]**, **[Añadir tarea ⟨Plus⟩]**, **[Seguir/Dejar de seguir ⟨Bell⟩]**, menú **[⋯]** con *Imprimir/PDF*, *Copiar enlace*, *Duplicar como nuevo*. Si el usuario no tiene permiso o faltan requisitos, el botón se muestra deshabilitado con tooltip que explica el motivo.

### 5.3 Panel lateral derecho (resumen)
Solicitante/registrado por · Servicio · Categoría · Impacto/Urgencia · Origen · Nº de incidentes vinculados · Nº de CI afectados · RFC asociada (ID + estado) · Error conocido (ID + estado) · Seguidores · Próximo vencimiento (fecha-hora y qué objetivo).

### 5.4 Pestañas

**5.4.1 Detalle**
Descripción / síntomas (texto enriquecido), origen, categoría y subcategoría, servicio, impacto, urgencia, prioridad (y, si fue manual, la justificación), campos personalizados, adjuntos (lista con nombre, tamaño, autor, fecha, [Descargar ⟨FileDown⟩], [Vista previa ⟨Eye⟩], [Eliminar ⟨Trash2⟩] con permiso). Botón **[Editar ⟨SquarePen⟩]** habilita edición en línea por sección con [Guardar ⟨Save⟩] / [Cancelar ⟨X⟩].

**5.4.2 Incidentes relacionados**
Contador total y desglose por estado (abiertos / resueltos / cerrados). Tabla: ID, título, estado, prioridad, servicio, CI, fecha de apertura, tipo de vínculo, vinculado por/fecha. Botones: **[Vincular incidente ⟨Link2⟩]** (modal de búsqueda con selección múltiple), **[Desvincular ⟨Unlink⟩]** (motivo obligatorio), exportar CSV. Mini-gráfico de **incidentes por semana** para ver tendencia.

**5.4.3 Investigación y causa raíz**
Campos: *Método de análisis* (lista), *Resumen del análisis* (texto enriquecido), *Causa raíz* (texto enriquecido), *Categoría de causa raíz* (lista), *Fecha-hora de identificación* (automática al registrar, editable con motivo), *Identificada por*, *Evidencias* (adjuntos), *Diagrama* (adjunto o editor simple de 5 porqués: 5 filas "¿Por qué?" encadenadas). Historial de versiones de la causa raíz (cada edición queda registrada). Botón **[Registrar causa raíz ⟨FilePlus⟩]** (transición).

**5.4.4 Workaround**
Campos: descripción paso a paso, alcance ("aplica a"), limitaciones, esfuerzo/tiempo de aplicación, fecha de publicación, publicado por, estado (*Vigente* / *Retirado*), contador "Aplicado en N incidentes". Botones **[Publicar workaround ⟨CloudUpload⟩]**, **[Retirar workaround ⟨Ban⟩]** (motivo).

**5.4.5 Error conocido**
Si existe registro en KEDB: ID `KE-xxxxxx`, estado, audiencia, fecha de publicación, próxima revisión, enlace [Abrir en KEDB ⟨FileText⟩]. Si no existe: mensaje "Aún no es un error conocido" y botón **[Promover a error conocido ⟨MoveRight⟩]** (valida los requisitos de 1.3.3.3.3 y lista los que faltan).

**5.4.6 Solución permanente**
Descripción de la solución propuesta, responsable, fecha estimada, esfuerzo y costo estimado (opcionales), **RFC asociadas** (tabla: ID, tipo, estado, ventana, resultado) con botones **[Crear RFC desde este problema ⟨FilePlus⟩]** y **[Vincular RFC existente ⟨Link2⟩]**, y el campo *Decisión*: "Resolver con cambio" / "Resolver sin cambio" / "Aceptar riesgo (no resolver)" (esta última exige justificación y aprobación según 1.3.3.2.2).

**5.4.7 Activos / CI afectados**
Tabla: código, nombre, clase, criticidad, entorno, servicio que soporta, origen del vínculo (manual / heredado de incidente). Botones **[Agregar CI ⟨Plus⟩]**, **[Quitar ⟨Trash2⟩]**, **[Ver en mapa CMDB ⟨Network⟩]** (abre 7.2 filtrado por el CI). Resalta CI de criticidad alta.

**5.4.8 Tareas**
Lista con: título, tipo, responsable, grupo, fecha de vencimiento, estado (Pendiente / En curso / Hecha / Cancelada), obligatoria (sí/no), % de avance de checklist. Botones **[Añadir tarea ⟨Plus⟩]**, **[Aplicar paquete de tareas ⟨CircleCheck⟩]**, marcar hecha, reasignar. Las tareas obligatorias pendientes bloquean las transiciones que las requieran (ver 1.3.3.2.7).

**5.4.9 Comentarios y bitácora**
Línea de tiempo unificada con filtros: *Todo* · *Comentarios internos* · *Comentarios públicos* · *Cambios de estado* · *Sistema*. Editor con menciones `@usuario`, adjuntos, y selector **Visibilidad: Interno / Visible para solicitantes de los incidentes vinculados**. Cada entrada: autor, fecha-hora, tipo. Los comentarios no se borran; se pueden **anular** con motivo (queda marca "anulado").

**5.4.10 Conocimiento**
Lista de artículos vinculados (ID, título, tipo, estado, autor, revisor, última revisión), botón **[Generar borrador de artículo ⟨FilePlus⟩]** (usa la plantilla de 1.3.3.3.5) y **[Vincular artículo existente ⟨Link2⟩]**.

**5.4.11 Cierre**
Visible desde el estado *Resuelto*. Campos: código de cierre, resumen de cierre, fecha-hora de resolución y de cierre, solución aplicada, confirmación de acciones sobre incidentes vinculados, **Revisión del problema** (lecciones aprendidas, qué funcionó, qué mejorar, acciones preventivas con responsable y fecha; obligatoria si es problema mayor), aprobación de cierre (si aplica).

**5.4.12 Historial / auditoría**
Tabla inmutable: fecha-hora, usuario, acción, campo, valor anterior, valor nuevo, comentario. Filtros por usuario, tipo de acción y rango de fechas. Botón **[Exportar CSV ⟨FileDown⟩]**.

### 5.5 Reglas de visibilidad por estado
Cada pestaña tiene configuración de "visible desde el estado X" y "editable en los estados Y" (ver 1.3.3.1.6). Valores de fábrica: *Cierre* visible desde *Resuelto*; *Error conocido* y *Solución permanente* visibles siempre; ningún campo de investigación editable en estados finales.

---

## 6. PANTALLA 1.3.3.1 — CONFIGURACIÓN DE FORMULARIO

**Propósito:** que el administrador controle qué se captura al registrar un problema, qué se muestra en el ticket y con qué catálogos y reglas, sin tocar código (ITIL 4: *start where you are*, *keep it simple*).
**Pestañas:** 1.3.3.1.1 a 1.3.3.1.6. Todas siguen el patrón de la sección 3.

**Reutilización obligatoria:** la configuración de formulario de Incidentes (1.3.1.1) ya permite configurar campos y tiene un creador de campos. Esta pantalla debe construirse **extendiendo ese mismo editor** para que soporte la entidad `problema` (y, más adelante, `cambio` y `activo`), no copiándolo. Lo que ese editor ya haga igual a lo descrito aquí no se reimplementa; lo que falte (reglas condicionales, versionado de borrador/publicación, bloqueo concurrente, etc.) se agrega al componente compartido de modo que Incidentes también pueda aprovecharlo, **sin cambiar el comportamiento actual de Incidentes**.

---

### 6.1 Pestaña 1.3.3.1.1 — Campos (visibles, obligatorios y orden)

**Qué se configura:** para cada campo del formulario de registro (sección 4): si es visible, si es obligatorio, en qué sección y posición va, cuánto ancho ocupa, para qué perfiles aplica, y qué reglas condicionales lo gobiernan.

**Selector superior:** `Formulario: [Registro de problema ▾]`. Opciones: *Registro de problema* (alta) y *Edición de problema* (campos editables dentro del ticket). Cada uno se configura por separado, con botón **[Copiar configuración del otro formulario ⟨Copy⟩]**.

**Layout de tres columnas:**

| Columna | Contenido |
|---|---|
| **Izquierda — Biblioteca de campos** (ancho 280 px) | Buscador. Grupos plegables: *Campos estándar*, *Campos personalizados*, *Campos del sistema* (solo informativos). Un campo ya colocado en el lienzo aparece en gris con ✓. Los ocultos aparecen con ícono de ojo tachado. Clic en un campo no colocado → botón [Agregar al formulario ⟨Plus⟩]. |
| **Centro — Lienzo** | Secciones como tarjetas plegables (A. Identificación, B. Alcance, …). Cada fila de campo muestra: asa de arrastre `⋮⋮`, etiqueta, código en gris, chip de tipo, **interruptor Visible**, **interruptor Obligatorio**, ícono 🔒 si es campo bloqueado, ícono ⚙ (abre propiedades), ícono ⎘ duplicar (solo personalizados), ícono 🗑 (solo personalizados). |
| **Derecha — Propiedades del campo** (ancho 360 px) | Se llena al seleccionar una fila (ver tabla de propiedades). |

**Barra de herramientas del lienzo:** `[+ Agregar sección ⟨Plus⟩]` `[Expandir todo ⟨ChevronsUpDown⟩]` `[Contraer todo ⟨ChevronsUpDown⟩]` `[Mostrar solo obligatorios ⟨Eye⟩]` `[Mostrar solo ocultos ⟨Eye⟩]` y un contador "N campos visibles · M obligatorios".

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
| Obligatorio | Selector de 3 opciones: **Siempre** / **Condicional (definir regla)** / **No** | "Condicional" abre el constructor de reglas. La obligatoriedad *por transición* se configura en 1.3.3.2.2, no aquí. |
| Solo lectura | Interruptor | Requiere valor por defecto o regla de cálculo; si no, no se puede activar. |
| Valor por defecto | Control del mismo tipo del campo | Opcional. Admite variables: `{usuario_actual}`, `{fecha_actual}`, `{grupo_del_usuario}`. |
| Sección | Lista | Mueve el campo a otra sección. |
| Ancho | Selector: 1/3 · 1/2 · 2/3 · completo | |
| Visible para perfiles | Selector múltiple de perfiles (1.1.2) | Vacío = todos. |
| Editable por perfiles | Selector múltiple | Vacío = todos los que ven el campo. |
| Validaciones | Según tipo: mín./máx. de longitud, rango numérico, expresión regular (con mensaje de error propio, y botón [Probar expresión ⟨FlaskConical⟩] que acepta un texto de prueba) | |
| Reglas condicionales | Constructor (ver abajo) | |

**Constructor de reglas condicionales:**
- Estructura: `CUANDO [campo] [operador] [valor] (Y/O …) ENTONCES [acción]`.
- Hasta **5 condiciones** por regla y **10 reglas** por campo.
- Operadores: *es igual a*, *es distinto de*, *está vacío*, *no está vacío*, *contiene*, *es uno de*, *mayor que*, *menor que*.
- Acciones: *Mostrar*, *Ocultar*, *Hacer obligatorio*, *Hacer opcional*, *Hacer solo lectura*, *Filtrar opciones a [lista de valores]*, *Establecer valor [x]*.
- Botón **[Probar regla ⟨FlaskConical⟩]**: panel con los campos involucrados donde el admin ingresa valores y ve el resultado.
- Detección de **ciclos** (A depende de B y B de A) → error "Regla circular" y se bloquea el guardado.
- Reglas de fábrica: (1) `Origen = Incidente(s)` → *Incidentes relacionados* visible y obligatorio; en otro caso, opcional. (2) `Workaround no está vacío` → mostrar casilla "Publicar como error conocido".

**Campos bloqueados (🔒):** *Título*, *Descripción*, *Servicio afectado*, *Impacto*, *Urgencia* **no se pueden ocultar ni hacer opcionales** (son el mínimo exigido para registrar y priorizar según ITIL/ISO 20000). Sí se pueden renombrar, moverse y cambiar su texto de ayuda. Los campos del sistema (ID, fechas, estado, registrado por) se muestran en gris y no son editables.

**Reordenamiento:**
- Arrastrar fila (asa `⋮⋮`) dentro de la sección o entre secciones; indicador azul de dónde caerá.
- Alternativa por teclado: seleccionar fila + `Alt+↑` / `Alt+↓`; para cambiar de sección `Alt+←` / `Alt+→`.
- El orden se guarda como entero consecutivo por sección y define también el orden de tabulación.
- Botón **[Ordenar sección alfabéticamente ⟨ArrowUpDown⟩]** (con confirmación).

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

### 6.2 Pestaña 1.3.3.1.2 — Campos personalizados

**Qué se configura:** campos adicionales propios de la organización que no existen de fábrica (ejemplos: "Número de contrato del proveedor", "Costo estimado de la solución", "Referencia del ticket del proveedor").

**Reutilización obligatoria:** ya existe un creador de campos personalizados. Debe usarse el mismo componente y la misma tabla de definición de campos, agregando la entidad `problema` como destino. Si el creador existente ya cubre alguno de los tipos o propiedades de este asistente, se conserva su comportamiento; se agregan solo los que falten.

**Vista de lista (tabla):** Nombre · Código · Tipo · Estado (Activo/Inactivo) · Usado en N tickets · Aparece en (formularios/vista) · Creado por · Fecha. Búsqueda, filtro por tipo y estado, orden por columna. Límite de fábrica: **30 campos personalizados** (configurable por el admin hasta 60; mostrar contador "12 / 30").

**Botones de la tabla:** `[+ Nuevo campo personalizado ⟨Plus⟩]` · por fila: `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Desactivar/Activar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]`.
- **Eliminar** solo está disponible si el campo tiene **0 usos**; si tiene usos, solo [Desactivar ⟨Ban⟩] (el dato se conserva).
- **Desactivar** quita el campo de formularios y vista pero conserva los datos.

**Asistente "Nuevo campo personalizado" (5 pasos, botones [Atrás ⟨ArrowLeft⟩] [Siguiente ⟨ArrowRight⟩] [Cancelar ⟨X⟩]; en el último [Crear campo ⟨FilePlus⟩]):**

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
5. **Resumen:** vista previa del control tal como lo verá el usuario + resumen de propiedades. Botón **[Crear campo ⟨FilePlus⟩]**.

**Reglas:** el tipo **no se puede cambiar** una vez creado el campo (se debe crear otro y migrar). Las opciones de una lista en uso solo se desactivan. Los cambios de etiqueta, ayuda, color y orden de opciones sí son libres.

---

### 6.3 Pestaña 1.3.3.1.3 — Listas y catálogos

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

**Botones:** `[+ Nuevo valor ⟨Plus⟩]` (en categorías: `[+ Nueva categoría ⟨Plus⟩]` y `[+ Subcategoría ⟨Plus⟩]`) · por fila `[Editar ⟨SquarePen⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` · `[Reordenar ⟨ArrowUpDown⟩]` (modo arrastre con botones [Guardar orden ⟨Save⟩] [Cancelar ⟨X⟩]) · `[Importar CSV ⟨FileUp⟩]` (plantilla descargable; muestra vista previa con errores por fila antes de confirmar) · `[Exportar CSV ⟨FileDown⟩]` · `[Fusionar… ⟨Merge⟩]` (elige valor origen y destino; reasigna todos los tickets y desactiva el origen; pide confirmación con el número de tickets afectados).

**Reglas:**
- Los valores 🔒 **se pueden renombrar y recolorear, pero no eliminar ni desactivar** (los usa la lógica del sistema; ej. el origen "Incidente(s)").
- Valor en uso → no eliminable, solo desactivable. Un valor inactivo no aparece en formularios nuevos pero sí se muestra en tickets antiguos.
- El nombre debe ser único dentro de su nivel; el código, único en el catálogo.
- Cada catálogo debe conservar al menos 1 valor activo.
- Categorías: máximo 2 niveles; no se puede eliminar una categoría con subcategorías.
- Para **Códigos de cierre**: no se permite que "Requiere RFC cerrada con éxito" y "Cuenta como resuelto con éxito = no" coexistan con "Requiere solución permanente = no" (incoherente; mostrar error).

---

### 6.4 Pestaña 1.3.3.1.4 — Matriz de prioridad (compartida con Incidentes)

**Hecho confirmado:** el sistema **ya tiene** una matriz impacto × urgencia → prioridad (P1 Crítica, P2 Alta, P3 Media, P4 Baja) que se usa al crear incidentes. Los niveles de impacto y de urgencia son **Alta / Media / Baja**. Según el árbol de archivos, su edición está en `1.2.5 Objetivos SLA` (`/admin/servicios/sla`, `MatrizPrioridadSla.tsx`, API `/api/admin/sla/matriz`) y el cálculo en `src/shared/lib/sla.ts`; confírmalo en la **Etapa 0** y documenta cómo se consume. **Prohibido crear una segunda matriz paralela como comportamiento por defecto.**

**Qué hace esta pestaña:**

1. **Matriz vigente (solo lectura por defecto):** cuadrícula impacto × urgencia con la prioridad de cada celda y sus colores, rotulada "Matriz compartida con Incidentes". Debajo, tabla de prioridades (código, nombre, color) tal como están definidas hoy.
2. **Enlace `[Editar matriz compartida → ⟨ArrowUpRight⟩]`:** lleva a la pantalla donde hoy se edita esa matriz. Si hoy la matriz está fija en código y no tiene pantalla de edición, repórtalo en el informe de la Etapa 0 y propón migrarla a una tabla de base de datos con su pantalla; **no lo implementes sin mi aprobación**.
3. **Interruptor `Usar matriz propia para problemas`** (apagado por defecto). Al encenderlo, un modal pide confirmación ("Los problemas dejarán de usar la matriz de Incidentes"), copia la matriz actual como punto de partida y habilita la edición de la cuadrícula solo para problemas. Si se apaga de nuevo, vuelve a leerse la matriz compartida (la matriz propia se conserva como borrador archivado).
4. **Textos de ayuda por nivel (tooltips):** tabla editable con los textos que se muestran al elegir Impacto y Urgencia en el formulario de problemas (ej. "Alta: afecta a un servicio crítico o a más de 100 usuarios"). Cambiar estos textos **no altera** los niveles ni la matriz.
5. **Opciones propias del módulo:**
   - `Permitir prioridad manual` (interruptor) → define **perfiles autorizados** y exige justificación (mín. 15 caracteres) que queda en la bitácora.
   - `Recalcular prioridad cuando cambie impacto o urgencia` (interruptor, activo por defecto).
6. **Botones:** `[Simulador ⟨FlaskConical⟩]` (elige impacto y urgencia y muestra la prioridad resultante con la matriz que realmente aplica a problemas) · `[Ver dónde se usa ⟨FileText⟩]` (lista de procesos y pantallas que consumen la matriz) · patrón común. **No hay botón "Restaurar valores de fábrica" para la matriz compartida**; con matriz propia activa, `[Restaurar a la matriz compartida ⟨RotateCcw⟩]`.

**Reglas:**
- Con matriz propia activa, todas las celdas deben tener prioridad y toda prioridad debe aparecer al menos una vez; si no, no se puede publicar.
- Si se publica un cambio de matriz propia y hay problemas abiertos, el modal ofrece la casilla **"Recalcular prioridad de los N problemas abiertos"** (ejecución asíncrona con barra de progreso; las prioridades manuales **no** se tocan).
- Los cambios en la matriz **compartida** se hacen en su pantalla original; al publicarse, los problemas con matriz compartida los toman sin migración.
- Los nombres de prioridad (P1 Crítica, P2 Alta, P3 Media, P4 Baja) y sus colores se leen siempre de la tabla de prioridades existente.

---

### 6.5 Pestaña 1.3.3.1.5 — Plantillas de problema

**Qué se configura:** plantillas que prellenan el formulario de registro y crean tareas automáticamente (ITIL 4: *optimize and automate*).

**Lista:** Nombre · Descripción · Activa · Se aplica a (categoría) · Visible para (perfiles) · Veces usada · Última modificación. Botones: `[+ Nueva plantilla ⟨Plus⟩]` · por fila `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` (solo si nunca se usó; si no, desactivar).

**Editor de plantilla (pantalla completa con pestañas internas):**
1. **General:** Nombre (único, 5–80), Descripción, Activa, Categoría a la que se sugiere (opcional), Visible para perfiles.
2. **Valores prellenados:** reproduce el formulario de la sección 4 con cada campo editable y, junto a cada uno, un interruptor **"Bloquear para que el usuario no lo cambie"**. Solo se prellenan campos visibles en el formulario vigente.
3. **Tareas incluidas:** selector múltiple tomado del catálogo de tareas (1.3.3.2.7) o paquete completo, con orden y offset de vencimiento.
4. **Vista previa:** muestra el formulario ya con la plantilla aplicada.

**Comportamiento en el formulario de registro:** al elegir plantilla, los campos se llenan; si el usuario ya había escrito algo, se pregunta "¿Reemplazar los valores existentes? [Reemplazar ⟨ArrowRightLeft⟩] [Mantener los míos ⟨Check⟩]".

**Plantillas de fábrica:** ver sección 10.

---

### 6.6 Pestaña 1.3.3.1.6 — Vista del ticket

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
| Campos de la pestaña | Botón **[Configurar campos… ⟨Settings2⟩]** (abre panel con la lista de campos de esa pestaña: visible, orden, etiqueta, solo lectura) |

Las pestañas **Detalle**, **Comentarios y bitácora** e **Historial / auditoría** no pueden ocultarse. La pestaña **Historial / auditoría** solo puede mostrarse a perfiles con permiso `problemas.auditoria.ver`.

**Bloque 3 — Panel lateral:** lista de elementos del resumen (sección 5.3) con visible y orden.

**Bloque 4 — Barra de acciones:** orden de los botones fijos y qué botones van directamente y cuáles bajo el menú [⋯] (arrastrar entre dos listas: "Visibles" y "En menú ⋯"). Los botones de transición se gestionan en 1.3.3.2.2.

**Botones adicionales:** `[Vista previa con ticket real ⟨Eye⟩]` (selector de un problema existente para ver cómo se vería) · `[Vista previa con ejemplo ⟨Eye⟩]`.


### 6.7 Validaciones de la pantalla 1.3.3.1 (cumple 3C)

| Propiedad / campo | Ventana interna | Tipo de dato | Validadores y regla |
|---|---|---|---|
| Etiqueta del campo | 1.3.3.1.1 Campos | Texto corto | V-NOMBRE (3–60) |
| Texto de ayuda | 1.3.3.1.1 | Texto simple | V-TEXTO(0,250) |
| Marcador (placeholder) | 1.3.3.1.1 | Texto simple | V-TEXTO(0,80) |
| Valor por defecto | 1.3.3.1.1 | Según el tipo del campo | El validador del propio campo (sección 4.4); variables permitidas `{usuario_actual}`, `{fecha_actual}`, `{grupo_del_usuario}` |
| Longitud mínima y máxima de un campo | 1.3.3.1.1 | Enteros | V-ENTERO(0,10000); mínimo ≤ máximo |
| Expresión regular y su mensaje | 1.3.3.1.1 | Texto | V-REGEX; mensaje V-TEXTO(5,150); el botón de prueba exige un texto de muestra V-TEXTO(0,200) |
| Ancho, sección, perfiles visibles/editables | 1.3.3.1.1 | Lista / selección múltiple | V-LISTA; V-MULTI(0,20) |
| Reglas condicionales | 1.3.3.1.1 | Constructor | Máximo 5 condiciones por regla y 10 reglas por campo; el valor comparado usa el validador del campo comparado; sin referencias circulares |
| Nombre de sección | 1.3.3.1.1 | Texto corto | V-NOMBRE; único dentro del formulario |
| Etiqueta y código del campo personalizado | 1.3.3.1.2 | Texto / código | V-NOMBRE; V-CODIGO + V-UNICO (prefijo `cf_`); máximo 30 campos |
| Opciones de lista (valor y etiqueta) | 1.3.3.1.2 | Texto | V-NOMBRE; únicas dentro del campo; mínimo 2 |
| Rango numérico / decimales / unidad | 1.3.3.1.2 | Enteros y texto | V-DECIMAL; mínimo ≤ máximo; decimales V-ENTERO(0,6); unidad V-TEXTO(0,15) |
| Tamaño máximo de archivo del campo | 1.3.3.1.2 | Entero (MB) | V-ENTERO(1,25) |
| Nombre y código de un valor de catálogo | 1.3.3.1.3 Listas y catálogos | Texto / código | V-NOMBRE + V-UNICO; V-CODIGO + V-UNICO |
| Descripción, color y orden de un valor | 1.3.3.1.3 | Texto / color / entero | V-TEXTO(0,250); V-HEX; V-ORDEN |
| Archivo de importación de catálogo | 1.3.3.1.3 | Archivo CSV | V-ARCHIVO (.csv, UTF-8, ≤ 5 MB, ≤ 2000 filas); errores por fila |
| Textos de ayuda de impacto y urgencia | 1.3.3.1.4 Matriz de prioridad | Texto | V-TEXTO(0,250) |
| Celdas de la matriz propia | 1.3.3.1.4 | Lista | V-OBLIG + V-LISTA; todas las celdas llenas y cada prioridad usada al menos una vez |
| Perfiles autorizados a prioridad manual | 1.3.3.1.4 | Selección múltiple | V-MULTI(1,20) si la opción está activa |
| Nombre y descripción de plantilla | 1.3.3.1.5 Plantillas | Texto | V-NOMBRE80 + V-UNICO; V-TEXTO(0,250) |
| Valores prellenados de plantilla | 1.3.3.1.5 | Según el campo | El validador del campo correspondiente (sección 4.4) |
| Nombre de pestaña y orden (vista del ticket) | 1.3.3.1.6 Vista del ticket | Texto / entero | V-TEXTO(3,30); V-ORDEN |
| Motivo de publicación | Modal de publicación | Texto | V-TEXTO(10,500) |
| Archivo de importación de configuración | Barra de acciones | Archivo JSON | V-ARCHIVO (.json, ≤ 2 MB) y versión de esquema soportada |
| Palabra de confirmación «RESTAURAR» | Modal de restauración | Texto | Debe coincidir exactamente con `RESTAURAR` |

---

## 7. PANTALLA 1.3.3.2 — FLUJO DE INVESTIGACIÓN Y SEGUIMIENTO

**Propósito:** definir el ciclo de vida del problema (ITIL 4: identificación → control del problema → control de errores) y las reglas que lo gobiernan.

### 7.1 Pestaña 1.3.3.2.1 — Estados

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

**Botones:** `[+ Nuevo estado ⟨Plus⟩]` · por fila `[Editar ⟨SquarePen⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` · `[Reordenar ⟨ArrowUpDown⟩]` · patrón común.

**Reglas:**
- Debe existir exactamente **1 estado Inicial**, al menos **1 Resuelto** y **1 Final**.
- Los estados 🔒 (*Nuevo*, *Resuelto*, *Cerrado*, *Cancelado*) no se eliminan ni se cambian de tipo; sí se pueden renombrar y recolorear.
- No se puede eliminar un estado con tickets (ver 3.4).
- *Error conocido* no es 🔒, pero si se desactiva, la promoción a KEDB sigue funcionando pero ya no cambia el estado del problema (solo activa la etiqueta).

**Estados de fábrica** (ver tabla en sección 10).

### 7.2 Pestaña 1.3.3.2.2 — Transiciones y acciones

**Qué se configura:** de qué estado a cuál se puede pasar, con qué botón, quién puede, qué se exige y qué ocurre automáticamente.

**Dos vistas (conmutador arriba):**
1. **Matriz:** filas = estado origen, columnas = estado destino. Celdas con ✓ si existe transición; clic en la celda crea/edita. Celdas diagonales bloqueadas.
2. **Diagrama:** grafo generado automáticamente (solo lectura, con zoom y botón [Exportar PNG ⟨FileDown⟩]). Estados como nodos con su color; transiciones como flechas con el nombre de la acción.

**Lista de transiciones (debajo):** Nombre de la acción · Origen → Destino · Roles · Campos requeridos · Automatizaciones · Activa. Botones `[+ Nueva transición ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Desactivar ⟨Ban⟩]` `[Eliminar ⟨Trash2⟩]`.

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
| Confirmación | Interruptor + texto del mensaje | Modal "¿Seguro…?" [Confirmar ⟨CircleCheck⟩] [Cancelar ⟨X⟩]. |
| Requiere aprobación | Interruptor + aprobador (rol/usuario/supervisor del grupo) + plazo | El ticket queda "Pendiente de aprobación" hasta que se aprueba o rechaza (con motivo). |
| Apariencia del botón | Color, ícono, orden | |
| Automatizaciones al ejecutar | Lista ordenable (ver abajo) | |
| Activa | Interruptor | |

**Automatizaciones disponibles:** asignar responsable (aplica reglas de 1.3.3.2.3) · notificar (selecciona evento/plantilla de 1.6.1 y destinatarios) · crear tareas (paquete) · registrar fecha-hora en un campo · crear registro KEDB · crear RFC prellenada · actualizar incidentes vinculados (según 1.3.3.3.2) · generar borrador de artículo (1.3.3.3.5) · detener/pausar/reanudar relojes · incrementar contador · marcar etiqueta.

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
| Resolver (por RFC) | Pendiente de cambio → Resuelto | Automática cuando la RFC pasa a *Implementado/Cerrado con éxito*; manual como respaldo | Cumple las reglas de 1.3.3.3.4. |
| Devolver a análisis | Pendiente de cambio → En análisis | Automática si la RFC es rechazada, falla o se cancela; manual como respaldo | Crea tarea "Revisar solución alternativa". Notifica al responsable. |
| Cerrar | Resuelto → Cerrado | Responsable, Gestor de Problemas, supervisor | Exige código de cierre, resumen, revisión (si es mayor), confirmación de incidentes (1.3.3.3.2). También automática N días después de *Resuelto* (configurable, valor de fábrica 5 días). |
| Reabrir | Resuelto / Cerrado → En análisis | Según 1.3.3.2.6 | Exige motivo. |
| Cancelar | Cualquier estado abierto → Cancelado | Gestor de Problemas, supervisor | Exige motivo de cancelación. Si hay incidentes vinculados, se desvinculan o se mantienen según elección. |

### 7.3 Pestaña 1.3.3.2.3 — Asignación automática

**Qué se configura:** a qué grupo y técnico se asigna un problema al registrarse o al cambiar de estado.

**Lista de reglas (orden = prioridad, arrastrar para cambiar):** Orden · Nombre · Condiciones (resumen) · Acción (resumen) · Activa · Veces aplicada. Botones `[+ Nueva regla ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]`. Interruptor global **"Detener en la primera regla que coincida"** (activo por defecto).

**Editor de regla:**
- **Nombre**, **Activa**.
- **Cuándo se evalúa:** al registrar · al cambiar de categoría · al cambiar de prioridad · al entrar en un estado (selector).
- **Condiciones** (constructor): categoría/subcategoría, servicio, clase de CI, criticidad de CI, prioridad, origen, horario (dentro/fuera de horario laboral), etiqueta.
- **Acción — Grupo destino:** lista de grupos (1.4.2).
- **Acción — Estrategia dentro del grupo:** *Dejar sin responsable (bandeja del grupo)* · *Round-robin* · *Menor carga (menos tickets abiertos)* · *Por nivel de soporte mínimo* (selector de nivel 1.4.3) · *Técnico fijo* (selector).
- **Considerar disponibilidad:** interruptor. Omite a los técnicos con una **ausencia vigente** registrada en la tabla `tecnico_ausencias` (sección 12; hoy no existe ningún dato de turnos o ausencias, por lo que debe crearse junto con una sección mínima "Ausencias" en `1.4.3 Técnicos y niveles de soporte`: técnico, desde, hasta, motivo, con botones `[+ Registrar ausencia ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Eliminar ⟨Trash2⟩]`). No se modelan turnos en esta etapa.
- **Fallback:** grupo/técnico alternativo si no hay candidatos.
- **Notificar al asignar:** interruptor + plantilla.

**Panel "Simulador de asignación":** el admin ingresa categoría, servicio, prioridad y origen, y el sistema muestra la regla que coincide, el grupo y la estrategia.

**Regla de fábrica:** "Todos los problemas → grupo definido por la categoría; si no hay, grupo 'Gestión de Problemas'; sin responsable; notificar al grupo."

**Validación:** debe existir al menos una regla activa sin condiciones (regla comodín) al final de la lista, o el sistema avisa "Algunos problemas podrían quedar sin grupo".

### 7.4 Pestaña 1.3.3.2.4 — Objetivos de tiempo

**Contexto confirmado:** `1.2.5 Objetivos SLA` contiene hoy la **"Matriz Institucional de Tiempos por Prioridad"** con las columnas *Nivel · Prioridad · Primera Respuesta (Horas) · Resolución Total (Horas) · Equivalencia / Descripción Operativa* (P1 Crítica 1 h/4 h, P2 Alta 2 h/8 h, P3 Media 4 h/24 h, P4 Baja 8 h/72 h). El tiempo que aplica a un ticket lo determina su **prioridad**. Esta pestaña sigue exactamente esa lógica para problemas. **No modifiques la matriz de Incidentes y Solicitudes ni el SLA que cada servicio tenga configurado.**

**Qué se configura:** metas internas de tiempo (OLA) por prioridad para problemas. *Nota ITIL:* los problemas no suelen tener SLA con el cliente; son objetivos internos de gestión.

**Cuadrícula (filas = P1 Crítica, P2 Alta, P3 Media, P4 Baja; unidad única: horas):**

| Columna | Detalle |
|---|---|
| Nivel y Prioridad | De solo lectura, leídos de la tabla de prioridades existente. |
| Primera respuesta (horas) | Tiempo máximo hasta que el problema tiene responsable y entra en *En análisis*. |
| Diagnóstico (horas) | Tiempo máximo hasta registrar la causa raíz **o** publicar un workaround (lo primero que ocurra). |
| Resolución total (horas) | Tiempo máximo hasta *Resuelto*. |
| Equivalencia / descripción operativa | Texto editable propio de problemas (ej. "P1: problema que causa incidentes de interrupción total recurrentes"). |

**Cómputo del tiempo:** usa los **calendarios hábiles de `src/shared/lib/sla.ts`** (documéntalo en la pestaña como texto informativo). **No se crea un módulo de calendarios paralelo: se reutilizan los calendarios hábiles de `src/shared/lib/sla.ts`.** Los relojes se pausan, corren o se detienen según la configuración de cada estado (7.1).

**Otras opciones:** umbrales de alerta (por defecto 50 %, 75 %, 90 %; hasta 5) y `[Vista previa de medidores ⟨Eye⟩]` (cómo se verán los dos medidores de la cabecera del ticket).
**Botones:** `[Restaurar valores sugeridos ⟨RotateCcw⟩]` + patrón común.

**Valores sugeridos de fábrica (horas):**

| Prioridad | Primera respuesta | Diagnóstico | Resolución total |
|---|---|---|---|
| P1 Crítica | 4 | 72 | 240 |
| P2 Alta | 8 | 120 | 480 |
| P3 Media | 24 | 240 | 960 |
| P4 Baja | 72 | 480 | 1440 |

**Integración con 1.2.5:** debajo de la matriz existente de `1.2.5 Objetivos SLA`, agrega un **bloque de solo lectura "Objetivos internos de Problemas"** con estos mismos valores y un enlace `[Editar en Gestión de problemas → ⟨ArrowUpRight⟩]` que apunta a esta pestaña. Fuente única de verdad: esta pestaña.

**Validaciones:** valores enteros > 0; Primera respuesta ≤ Diagnóstico ≤ Resolución total en cada fila; los valores no pueden disminuir al bajar de prioridad (P1 ≤ P2 ≤ P3 ≤ P4) en cada columna (aviso, no bloqueo).

### 7.5 Pestaña 1.3.3.2.5 — Escalamiento

**Qué se configura:** qué ocurre cuando un objetivo de tiempo se acerca o se vence.

**Lista de reglas:** Nombre · Objetivo (Asignación/Inicio/Diagnóstico/Resolución) · Prioridades · Umbral · Acciones · Activa.

**Editor de regla:**
- **Objetivo** al que aplica y **prioridades**.
- **Umbral:** porcentaje del tiempo consumido (50/75/90/100/…) o "Vencido +N horas".
- **Cómputo del tiempo:** el mismo del motor de SLA existente (no configurable aquí).
- **Acciones (una o varias):** notificar a (responsable, supervisor del grupo, Gestor de Problemas, grupo, usuario concreto, dirección TI) con plantilla · **escalamiento funcional** (reasignar a grupo/nivel superior) · **escalamiento jerárquico** (notificar al nivel jerárquico siguiente) · subir prioridad un nivel · agregar etiqueta `En riesgo`/`Vencido` · agregar comentario del sistema · crear tarea de seguimiento.
- **Repetición:** repetir cada N horas hasta M veces.
- **Se detiene cuando:** el ticket cambia de estado, el objetivo se cumple, o el reloj se pausa.

**Botón `[Simular escalamiento ⟨FlaskConical⟩]`:** el admin elige prioridad y tiempo consumido y ve las acciones que se dispararían.
**Regla de fábrica:** 75 % → notificar al responsable; 90 % → notificar al supervisor; 100 % → etiqueta *Vencido* + notificar al Gestor de Problemas + dirección TI en P1/P2.

### 7.6 Pestaña 1.3.3.2.6 — Reapertura

**Qué se configura:** cuándo y cómo puede reabrirse un problema resuelto o cerrado.

**Controles:**
- `Permitir reapertura` (interruptor).
- **Ventana:** días desde *Resuelto* y desde *Cerrado* (valores de fábrica: 30 y 15).
- **Perfiles autorizados** por estado (resuelto / cerrado).
- **Estado destino** (por defecto *En análisis*).
- **Motivo obligatorio** (interruptor) y lista de motivos de reapertura (catálogo propio: "El incidente reaparece", "La solución no funcionó", "Cambio revertido", "Otro").
- **Máximo de reaperturas:** número (valor de fábrica 2). Al superarlo, el botón se reemplaza por **[Crear nuevo problema relacionado ⟨FilePlus⟩]**.
- **Relojes:** *Reiniciar* / *Continuar donde quedaron*.
- **Asignación:** *Mantener responsable* / *Aplicar reglas de asignación*.
- **Efecto en incidentes vinculados:** *Nada* / *Notificar a responsables*.
- **Marcar etiqueta `Reabierto` y contabilizar para KPI** (siempre activo).

### 7.7 Pestaña 1.3.3.2.7 — Tareas predefinidas

**Qué se configura:** catálogo de tareas de investigación y paquetes de tareas que se crean automáticamente.

**Sección A — Catálogo de tareas** (tabla): Nombre · Tipo (Investigación / Revisión de logs / Prueba en laboratorio / Contacto con proveedor / Documentación / Validación) · Grupo o rol responsable · Duración estimada · Obligatoria · Activa. Botones `[+ Nueva tarea ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Desactivar ⟨Ban⟩]` `[Eliminar ⟨Trash2⟩]`.
Editor: Nombre · Descripción · Tipo · Responsable (rol, grupo, "responsable del problema") · Duración estimada · **Vence a +N horas/días desde la creación** · **Obligatoria** (sí/no) · **Bloquea la transición** (selector de transición; no se puede ejecutar mientras la tarea esté pendiente) · **Checklist** (lista de ítems) · **Dependencia** (finaliza-para-iniciar con otra tarea).

**Sección B — Paquetes de tareas** (tabla): Nombre · Tareas incluidas · Se aplica cuando (categoría, prioridad, plantilla, estado de entrada) · Activo. Editor: arrastrar tareas del catálogo, definir orden y dependencias, y la regla de aplicación automática. Botón `[Probar paquete ⟨FlaskConical⟩]` muestra qué tareas se crearían para un caso de ejemplo.

**Paquetes de fábrica:** ver sección 10.

### 7.8 Pestaña 1.3.3.2.8 — Problemas mayores y revisión obligatoria

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

**Botones:** `[+ Agregar criterio ⟨Plus⟩]` `[+ Agregar pregunta ⟨Plus⟩]` `[Probar criterios ⟨FlaskConical⟩]` (aplica los criterios a los problemas existentes y muestra cuáles serían mayores) + patrón común.


### 7.9 Validaciones de la pantalla 1.3.3.2 (cumple 3C)

| Propiedad / campo | Ventana interna | Tipo de dato | Validadores y regla |
|---|---|---|---|
| Nombre y código de estado | 1.3.3.2.1 Estados | Texto / código | V-TEXTO(3,30) + V-UNICO; V-CODIGO + V-UNICO |
| Color y descripción de estado | 1.3.3.2.1 | Color / texto | V-HEX; V-TEXTO(0,150) |
| Tipo de estado y relojes | 1.3.3.2.1 | Listas | V-LISTA; exactamente 1 estado Inicial, ≥ 1 Resuelto y ≥ 1 Final |
| Nombre de la acción (botón) | 1.3.3.2.2 Transiciones | Texto | V-TEXTO(3,30) |
| Estados de origen y destino | 1.3.3.2.2 | Selección / referencia | V-MULTI(1,20); V-REF; origen ≠ destino |
| Perfiles autorizados | 1.3.3.2.2 | Selección múltiple | V-MULTI(1,20) |
| Texto de confirmación | 1.3.3.2.2 | Texto | V-TEXTO(5,250) |
| Plazo de aprobación de una transición | 1.3.3.2.2 | Entero (horas) | V-HORAS |
| Nombre de regla de asignación | 1.3.3.2.3 Asignación | Texto | V-NOMBRE80 + V-UNICO |
| Grupo destino y fallback | 1.3.3.2.3 | Referencia | V-OBLIG + V-REF (grupo activo); fallback ≠ grupo destino |
| Técnico fijo | 1.3.3.2.3 | Referencia | V-REF (técnico activo del grupo) |
| Tiempos de asignación, inicio, diagnóstico y resolución (por prioridad) | 1.3.3.2.4 Objetivos de tiempo | Entero (horas) | V-HORAS en cada celda; **primera respuesta < diagnóstico ≤ resolución**; valores crecientes de P1 a P4 (aviso) |
| Umbrales de alerta | 1.3.3.2.4 | Lista de enteros (%) | V-PORC entero 1–100, estrictamente crecientes, máximo 5 |
| Umbral de escalamiento | 1.3.3.2.5 Escalamiento | Entero (%) u horas | V-ENTERO(1,300) %, o «vencido + N» con V-HORAS |
| Repetición cada N horas y máximo de veces | 1.3.3.2.5 | Enteros | V-ENTERO(1,168); V-ENTERO(1,20) |
| Destinatarios del escalamiento | 1.3.3.2.5 | Selección múltiple | V-MULTI(1,20) |
| Ventana de reapertura (resuelto y cerrado) | 1.3.3.2.6 Reapertura | Enteros (días) | V-DIAS (0–365) |
| Máximo de reaperturas | 1.3.3.2.6 | Entero | V-ENTERO(0,10) |
| Motivos de reapertura | 1.3.3.2.6 | Texto | V-NOMBRE + V-UNICO |
| Nombre y descripción de tarea | 1.3.3.2.7 Tareas | Texto | V-TEXTO(3,80); V-TEXTO(0,500) |
| Duración estimada y vencimiento relativo | 1.3.3.2.7 | Enteros | V-ENTERO(1,10080) minutos; V-ENTERO(-720,720) horas |
| Ítems del checklist | 1.3.3.2.7 | Texto | V-TEXTO(3,150), máximo 30 |
| Criterios de problema mayor (N incidentes, horas de indisponibilidad) | 1.3.3.2.8 Mayores | Enteros | V-ENTERO(2,10000); V-HORAS; máximo 6 criterios |
| Plazo de revisión posterior | 1.3.3.2.8 | Entero (días) | V-ENTERO(1,90) |
| Preguntas de la plantilla de revisión | 1.3.3.2.8 | Texto | V-TEXTO(5,200) + V-UNICO; máximo 20 |

---

## 8. PANTALLA 1.3.3.3 — RELACIÓN CON INCIDENTES, ERRORES CONOCIDOS Y CONOCIMIENTO

**Propósito:** integrar Gestión de Problemas con Incidentes, KEDB, Cambios, Conocimiento y CMDB (ITIL 4: *think and work holistically*).

### 8.1 Pestaña 1.3.3.3.1 — Creación automática de problemas por umbral

**Qué se configura:** reglas que detectan incidentes recurrentes y crean (o sugieren) problemas de forma proactiva.

**Lista de reglas:** Nombre · Agrupa por · Umbral y ventana · Acción · Activa · Última ejecución · Problemas generados. Botones `[+ Nueva regla ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Pausar/Activar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` `[Ver ejecuciones ⟨History⟩]` (registro de cuándo se evaluó, qué grupos se detectaron y qué se hizo).

**Editor de regla:**
- **Alcance de incidentes:** estados incluidos (abiertos/resueltos/cerrados), prioridad mínima, servicios o categorías incluidos/excluidos.
- **Agrupar por:** Servicio · Categoría de incidente · CI · Clase de CI · Código de resolución · Texto similar (palabras clave; sensibilidad Baja/Media/Alta).
- **Umbral:** número de incidentes ≥ N, dentro de una **ventana móvil** de X horas/días.
- **Acción:** *Crear problema automáticamente* o *Solo sugerir* (notifica al Gestor de Problemas con botón [Crear problema ⟨FilePlus⟩] en la notificación).
- **Si crea:** plantilla a usar · prioridad (*máxima de los incidentes* o *fija*) · grupo (por regla de 1.3.3.2.3) · vincular todos los incidentes del grupo.
- **Evitar duplicados:** si ya hay un problema abierto con el mismo criterio de agrupación, **vincular los nuevos incidentes a ese problema** en lugar de crear otro (activo por defecto).
- **Enfriamiento:** no volver a disparar la misma regla para el mismo grupo durante N horas.
- **Notificaciones:** destinatarios y plantilla.

**Botón `[Simular regla ⟨FlaskConical⟩]`:** analiza los últimos 30/60/90 días y muestra una tabla de los grupos de incidentes que habrían disparado la regla, cuántos problemas se habrían creado y cuáles ya existían. Es obligatorio simular antes de activar una regla nueva (el sistema avisa si no se hizo, no bloquea).

**Reglas de fábrica (inactivas hasta que el admin las active):**
1. ≥ 5 incidentes de la misma categoría **y** mismo CI en 7 días → crear problema.
2. ≥ 3 incidentes del mismo servicio en 24 h → sugerir.
3. Todo incidente marcado como mayor → crear problema obligatoriamente.

### 8.2 Pestaña 1.3.3.3.2 — Incidentes vinculados

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
 - **C) Resolución asistida (por defecto):** al cerrar el problema se muestra un modal con la lista de incidentes abiertos vinculados, casillas para elegir cuáles resolver, y botones [Resolver seleccionados ⟨CircleCheck⟩] [Omitir ⟨X⟩].
- **Opción adicional:** *Exigir que ningún incidente abierto quede sin decisión para poder cerrar el problema* (activo por defecto).

**Botón `[Vista previa del texto de nota y notificación ⟨Eye⟩]`** + patrón común.

### 8.3 Pestaña 1.3.3.3.3 — Errores conocidos (KEDB)

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
- Botón **`[Probar coincidencia ⟨FlaskConical⟩]`**: el admin escribe un texto de incidente de ejemplo y ve qué errores conocidos se sugerirían y su puntaje.

**Bloque 5 — Campos del registro KE:** botón **[Configurar campos del KE… ⟨Settings2⟩]** que abre el mismo editor de la pestaña 1.3.3.1.1 aplicado al formulario del error conocido (campos de fábrica: ID, título, síntomas, causa, workaround, solución definitiva, CI/servicios, audiencia, estado, responsable, próxima revisión, problema origen).

### 8.4 Pestaña 1.3.3.3.4 — Cambios (RFC)

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

### 8.5 Pestaña 1.3.3.3.5 — Conocimiento

**Qué se configura:** cómo se genera conocimiento a partir de problemas (ITIL 4: *Knowledge Management*), coordinado con 1.7.1.

**Controles:**
- **Cuándo generar borrador de artículo:** casillas — al publicar error conocido · al resolver · al cerrar · solo manual.
- **Tipo de artículo por evento:** Error conocido (workaround) / Solución definitiva / Guía de resolución.
- **Plantilla del artículo:** editor con secciones y **mapeo de campos del problema**: `Síntomas` ← descripción · `Causa` ← causa raíz · `Workaround` ← workaround · `Solución` ← solución permanente · `Servicios/CI afectados` ← lista · `Referencia` ← enlace al problema · `Palabras clave` ← categoría + servicio. Botones `[Insertar variable ⟨Braces⟩]` `[Vista previa con problema real ⟨Eye⟩]`.
- **Audiencia y categoría del artículo:** por defecto según el error conocido; categoría de 1.7.1.
- **Responsable de revisión:** *Autor del problema*, *Responsable de la categoría de conocimiento* (según 1.7.1) o *Perfil concreto*.
- **¿Es obligatorio un artículo para cerrar el problema?** (interruptor). Excepciones por código de cierre (casillas).
- **Estado inicial del borrador:** *Borrador* (no editable aquí si 1.7.1 define otro).
- **Enlace:** los artículos aparecen en la pestaña "Conocimiento" del ticket y los incidentes resueltos con el workaround quedan asociados al artículo.

### 8.6 Pestaña 1.3.3.3.6 — CI y servicios (CMDB)

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


### 8.7 Validaciones de la pantalla 1.3.3.3 (cumple 3C)

| Propiedad / campo | Ventana interna | Tipo de dato | Validadores y regla |
|---|---|---|---|
| Nombre de regla de umbral | 1.3.3.3.1 Creación por umbral | Texto | V-NOMBRE80 + V-UNICO |
| Número de incidentes y ventana móvil | 1.3.3.3.1 | Enteros | V-ENTERO(2,1000); V-HORAS (hasta 8760) |
| Enfriamiento | 1.3.3.3.1 | Entero (horas) | V-ENTERO(0,720) |
| Prioridad mínima y criterio de agrupación | 1.3.3.3.1 | Listas | V-LISTA |
| Máximo de incidentes por problema | 1.3.3.3.2 Incidentes vinculados | Entero | V-ENTERO(1,5000) |
| Texto de la nota y de la notificación | 1.3.3.3.2 | Texto enriquecido | V-RICO(10,1000); variables permitidas `{problema_id}`, `{solucion}`; las demás se rechazan |
| Código de resolución masiva | 1.3.3.3.2 | Lista | V-LISTA (catálogo de resolución de incidentes) |
| Revisión periódica y recordatorio de un error conocido | 1.3.3.3.3 Errores conocidos | Enteros | V-MESES (1–60); V-DIAS (1–90) |
| Umbral de coincidencia y máximo de sugerencias | 1.3.3.3.3 | Enteros | V-PORC (1–100); V-ENTERO(1,20) |
| Pesos de criterios de coincidencia | 1.3.3.3.3 | Enteros | V-ENTERO(1,5) |
| Máximo de RFC por problema y días de verificación | 1.3.3.3.4 Cambios (RFC) | Enteros | V-ENTERO(1,20); V-DIAS (1–90) |
| Mapeo de prellenado de la RFC | 1.3.3.3.4 | Listas | V-LISTA; cada campo origen se asigna a un único destino |
| Plantilla del artículo (secciones y variables) | 1.3.3.3.5 Conocimiento | Texto | V-NOMBRE por sección; variables válidas del problema |
| Máximo de CI por problema | 1.3.3.3.6 CI y servicios | Entero | V-ENTERO(1,1000) |
| Criticidad mínima | 1.3.3.3.6 | Lista | V-LISTA (criticidades de 1.5.4.3) |

---

## 9. Perfiles y permisos

**Perfiles existentes hoy (1.1.2):** Administrador · Técnico · Solicitante · Supervisor · Gestor de Área · Auditor · Aprobador · Gestor de Cambios · Gestor de Activos y Configuración.

**Perfil nuevo que debes crear (migración semilla):** **Gestor de Problemas** (rol que ITIL 4 prevé para coordinar identificación, control del problema y control de errores). Todas las referencias a "Gestor de Problemas" en este documento apuntan a este perfil.

Por cada pantalla de configuración existen tres permisos: `ver`, `editar` (guardar borrador) y `publicar`. Un usuario con `editar` pero sin `publicar` guarda borradores; otro con `publicar` los revisa y publica (separación de funciones). Las transiciones de 1.3.3.2.2 pueden restringir aún más, nunca ampliar, lo que otorgan estos permisos.

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

### 11.0 Hechos de arquitectura (ver `ARQUITECTURA_Y_CODIGO.md`)
- **Framework:** Next.js 14 (App Router). Las pantallas viven en `src/app/plataforma/` (grupo de rutas protegido con barra lateral `Menu.tsx` y selector de perfil `SelectorPerfilActivo.tsx`); la API en `src/app/api/` (119 endpoints).
- **Sesión:** cookie `sesion` validada por `src/middleware.ts`; JWT en `src/shared/lib/auth.ts`; perfil activo conmutable en caliente.
- **Menú:** `/api/menu` + `src/shared/lib/menu.ts` (`construirArbolMenu()`); `Menu.tsx` pinta el árbol que el perfil activo tiene autorizado.
- **Base de datos:** pool `pg` en `src/shared/lib/db.ts` (PostgreSQL en Supabase); sin acceso directo desde el cliente.
- **Validaciones:** `src/shared/lib/validaciones.ts` (DNI, RUC, nombres, correos RFC 5322, códigos, SLAs, adjuntos; retorna `{ valido, mensaje? }`) y `src/shared/components/ui/AlertaCampo.tsx` (solo errores en rojo, `role="alert"`).
- **SLA y matriz de prioridad:** `src/shared/lib/sla.ts`; edición en `1.2.5 Objetivos SLA` (`/admin/servicios/sla`, componente `MatrizPrioridadSla.tsx`, API `/api/admin/sla/matriz`). Es la ubicación probable de la matriz impacto × urgencia compartida; confírmalo en la Etapa 0.
- **Categorías de servicios:** módulo `src/modules/admin/categorias/` y componente `GestionCategorias.tsx` (validación de unicidad de nombre y código; regla "SLA respuesta < SLA resolución").
- **Tickets:** el detalle `/tickets/[id]` usa presentadores por rol (`VistaTicketAdministrador`, `...Consumidor`, `...Gobernanza`, `...Operador`, `...Supervisor`) y secciones (`CockpitTemporizadorSla`, `StreamChatPublico`, `StreamNotasInternas`, `PanelInfraestructuraCi`, `TarjetaAprobacionSod`, `TarjetaCalificacionCsat`).
- **Problemas:** `src/modules/problemas/components/ProblemasWorkspace.tsx`, `/problemas`, `/problemas/kedb`.
- **Héredado a revisar:** `/admin/rfc` y `src/modules/cambios/components/ConfiguracionRfc.tsx` (configuración antigua de RFC) conviven con `/admin/procesos/cambios`.


| Tema | Lo confirmado |
|---|---|
| Stack | Next.js 14 (App Router) y PostgreSQL en Supabase (pool `pg` de `src/shared/lib/db.ts`). Tienes acceso completo al código, la base de datos, el frontend y el backend. |
| Matriz impacto × urgencia | Existe, calcula P1 a P4 al crear incidentes. Ubicación probable: `1.2.5 Objetivos SLA` (`/admin/servicios/sla`, `MatrizPrioridadSla.tsx`, API `/api/admin/sla/matriz`) y cálculo en `src/shared/lib/sla.ts`; confírmalo en la Etapa 0. Niveles: Alta / Media / Baja. |
| 1.2.5 Objetivos SLA | Contiene solo la "Matriz Institucional de Tiempos por Prioridad" (horas de primera respuesta y resolución total por prioridad). |
| SLA por servicio | Cada servicio de incidentes/solicitudes conserva su propio SLA editable, pero el tiempo efectivo de un ticket lo da su prioridad. **No tocar en este prompt** (queda pendiente de revisión por separado). |
| Formulario de Incidentes | Servicio del catálogo y panel de SLAs asociados · Título · Descripción con texto guía · Urgencia · Impacto · Prioridad calculada (matriz ITIL 4, P1–P4) · Elemento CMDB (opcional, solo ítems bajo custodia del usuario) · Campos adicionales visibles para la prioridad simulada · Carga fija de evidencias. |
| Creador de campos | Existe; se pueden agregar campos al formulario de Incidentes. Se reutiliza para problemas. |
| Calendarios y feriados | `src/shared/lib/sla.ts` ya usa calendarios hábiles; se reutiliza su tabla de feriados y no se crea nada nuevo en este prompt. |
| Turnos y ausencias de técnicos | **No existen datos.** Se crea `tecnico_ausencias` (sección 12). |
| Perfiles | Administrador, Técnico, Solicitante, Supervisor, Gestor de Área, Auditor, Aprobador, Gestor de Cambios, Gestor de Activos y Configuración. **Falta** Gestor de Problemas (se crea). |
| Datos que no existan | Se agregan a la base de datos mediante migraciones (sección 12). |

**Dependencias con otros módulos:**

| Con | Dependencia |
|---|---|
| 1.1.2 Perfiles y permisos | Crear perfil Gestor de Problemas y registrar los permisos de la sección 9. |
| 1.2 Catálogo de servicios y 1.2.5 | Lista de servicios; bloque de solo lectura "Objetivos internos de Problemas" en 1.2.5. |
| 1.3.1 Incidentes | Botón "Crear problema desde incidente", banner de vínculo, coincidencia de errores conocidos, resolución masiva/asistida, matriz compartida, editor de formulario y creador de campos. |
| 1.3.4 Gestión de cambios (Prompt 2) | Origen = Problema en la RFC; sincronización de estados (8.4). |
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

1. El menú muestra `1.3.3.1 Configuración de formulario`, `1.3.3.2` y `1.3.3.3` con las pestañas numeradas de la sección 2.3.
2. Todas las pestañas usan el patrón común (borrador, vista previa, publicar con diff y motivo, versionado, restauración, importación/exportación, bloqueo concurrente).
3. El editor de formulario y el creador de campos de problemas son **el mismo componente** que usa Incidentes, extendido; Incidentes sigue funcionando igual que antes.
4. Un administrador puede ocultar un campo no bloqueado, publicar, y el campo desaparece del formulario de registro sin perder datos de tickets existentes.
5. Un campo bloqueado (Título, Descripción, Servicio, Impacto, Urgencia) **no** puede ocultarse ni hacerse opcional.
6. Una regla condicional "Origen = Incidente(s) → Incidentes relacionados obligatorio" funciona en el formulario real.
7. Con `Usar matriz propia para problemas` apagado, un problema con cierto impacto y urgencia recibe **exactamente la misma prioridad** que un incidente con esos valores. No existe una segunda copia de la matriz.
8. Con matriz propia encendida y publicada, el recálculo de problemas abiertos respeta las prioridades manuales.
9. El panel de objetivos de tiempo del formulario muestra los valores de 1.3.3.2.4 para la prioridad calculada, y `1.2.5` muestra el bloque de solo lectura de Problemas sin alterar la matriz de Incidentes y Solicitudes.
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
25. Ninguna ventana interna de las pantallas 1.3.3.x repite un ítem del menú; las ventanas internas existentes están en `?vista=` y no alteran el ítem activo del menú (3A).
26. Los botones y las acciones de fila usan los íconos de 3B.4, con tooltip y `aria-label`, y el estilo de botones de la sección 3B.1.
27. Todos los campos de los formularios y de las pantallas de configuración tienen validación en tiempo real con los validadores de 3C; **no aparece ningún indicador de éxito**; los errores usan `AlertaCampo`.
28. Cambiar el valor de un selector que gobierna otro campo (por ejemplo tipo de documento) cambia al instante el validador, la máscara y el `maxLength` del campo dependiente.
29. El servidor repite las mismas validaciones y devuelve `400` con `{ campo, mensaje }`, que la interfaz muestra en el campo.
30. Los modales y la barra de acciones comunes existen una sola vez y los usan los módulos de problemas, cambios y activos; los `Iconos.tsx` duplicados fueron unificados.

---

## 14. Etapa 0 — Reconocimiento obligatorio y preguntas abiertas

**Punto de partida de la Etapa 0 (según el árbol de archivos):** el informe debe incluir una **tabla de diferencias** entre este documento y lo ya implementado en `/admin/procesos/problemas/*` (secciones 2.2 y 2.3), listando por cada ventana interna: existe / falta / incompleta, qué validadores (3C) y qué íconos (3B) le faltan, y qué elementos duplican ítems del menú (3A).

**Antes de escribir cualquier código**, revisa el repositorio y la base de datos y entrégame un **informe** (sin modificar nada) con:

1. **Matriz de prioridad:** dónde está (archivo/tabla/función), cómo se consume al crear incidentes, y si tiene pantalla de edición.
2. **Motor de SLA:** dónde está, y si cuenta horas corridas u hábiles. Cómo se pausan y reanudan los relojes hoy.
3. **Componentes reutilizables:** editor de formulario de 1.3.1.1, creador de campos, constructor de condiciones o reglas (si hay), motor de estados de 1.3.1.2, sistema de notificaciones (1.6), jobs programados, y componentes de UI (tablas, modales, arrastrar-y-soltar, selectores).
4. **Perfiles y permisos:** cómo se almacenan y cómo se verifican en `src/middleware.ts`, `src/shared/lib/menu.ts`, `src/shared/lib/page-auth.ts` y los Route Handlers.
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


---

## Parte II — Gestión de Cambios (RFC)

### Contexto específico (apartados 2.3 y 2.4 del prompt original)

### 2.3 Estado actual de la implementación (según el árbol de archivos del repositorio)
| Pantalla | Ya existe | Falta o hay que corregir |
|---|---|---|
| `/admin/procesos/cambios/page.tsx` | Página padre del grupo | Verificar que no repita los 4 ítems del menú como pestañas o botones superiores. |
| `1.3.4.1` formulario | `page.tsx`, `BarraAccionesComun`, los 4 modales y las 7 ventanas `Pestana*`. API: `/api/admin/cambios/{formulario/configuracion,campos-personalizados,catalogos,cuestionario-riesgo,plantillas}` | Mover los modales y la barra a la ubicación compartida (3A.2.6); auditar contra la sección 6; validaciones e íconos. |
| `1.3.4.2` tipos y requisitos | `page.tsx` y las 4 ventanas. API: `/api/admin/cambios/{tipos-requisitos/configuracion,matriz-autoridad,matriz-autoridad/simular,modelos-estandar,reglas-clasificacion,reglas-clasificacion/simular}` | Auditar contra la sección 7; validaciones e íconos. |
| `1.3.4.3` flujo | `page.tsx`, 8 ventanas e `Iconos.tsx` local. API: `/api/admin/cambios/flujo-evaluacion/{configuracion,simular-escalamiento,simular-etapas,simular-quorum,validar-flujo}` | **Eliminar `Iconos.tsx` local** y usar el módulo compartido de íconos (3B.3); auditar contra la sección 8. |
| `1.3.4.4` notificaciones y calendario | `page.tsx`, 6 ventanas e `Iconos.tsx` local. API: `/api/admin/cambios/notificaciones-calendario/{configuracion,congelamiento,congelamiento/csv,feriados,feriados/csv,simular-conflictos}` | **Eliminar `Iconos.tsx` local**; reutilizar la tabla de feriados que ya lee `src/shared/lib/sla.ts` (ver 12.0); auditar contra la sección 9. |
| Heredado | `/admin/rfc/page.tsx`, `/api/admin/rfc-config`, `src/modules/cambios/components/ConfiguracionRfc.tsx` | Decidir en la Etapa 0 si se **migran y retiran** (recomendado) para que exista una única configuración de RFC. |

### 2.4 Pantallas operativas que consumen esta configuración
| Menú general | Ruta | Archivos |
|---|---|---|
| 5.1.1 Registrar solicitud RFC | `/cambios/gestion/crear` | `src/app/plataforma/cambios/gestion/crear/page.tsx` |
| 5.1.2 Calendario de ventanas | `/cambios/gestion/calendario` | `.../gestion/calendario/page.tsx` |
| 5.1.3 Historial consolidado | `/cambios/gestion/todos` | `.../gestion/todos/page.tsx` |
| 5.2.1 Dictamen colegiado CAB | `/cambios/gestion/cab` | `.../gestion/cab/page.tsx` |
| Ticket de RFC | `/cambios/gestion/[id]` | `.../gestion/[id]/page.tsx` |
| Técnico M5.1 a M5.6 | `/plataforma/perfiles/tecnico/cambios/{mis-cambios,nuevo,implementacion,calendario,impacto,historial}` | `src/app/plataforma/perfiles/tecnico/cambios/*` |
| API de operación | `/api/cambios`, `/api/cambios/[id]` | `src/app/api/cambios/*` |
Las secciones 4 y 5 describen lo que esas pantallas deben mostrar; si algo difiere, aplica la pregunta 1 de la sección 15.

---

## 4. ESPECIFICACIÓN DEL FORMULARIO DE REGISTRO DE RFC (lo que ve el usuario)

Esta sección define la **versión de fábrica** del formulario. Las secciones 6 a 9 definen cómo el administrador la modifica.

**Quién lo usa:** perfiles **Técnico**, **Supervisor**, **Gestor de Área** (solo cambios Normales sobre su área), **Gestor de Cambios**, **Gestor de Activos y Configuración**, **Gestor de Problemas** y **Administrador** (permiso `cambios.crear`). El tipo *Emergencia* exige además `cambios.crear_emergencia`. Los perfiles Solicitante, Aprobador y Auditor **no** registran RFC.
**Dónde:** `5 Gestión de Cambios > 5.1 Operación y Solicitudes RFC > 5.1.1 Registrar solicitud RFC`. También desde otros tickets mediante botones **[Crear RFC desde este problema ⟨FilePlus⟩]**, **[Crear RFC desde este incidente ⟨FilePlus⟩]** y **[Crear RFC desde este activo ⟨FilePlus⟩]**, que abren este formulario con Origen, ticket vinculado, servicio, CI y categoría prellenados (el mapeo desde problemas se define en el Prompt 1, pestaña 1.3.3.3.4).
**Disposición:** una sola página con **secciones plegables**, todas abiertas al inicio. Arriba a la derecha: selector **[Usar plantilla ▾]** (1.3.4.1.6). A la derecha, panel fijo "Resumen y validación" con el tipo, la prioridad, el nivel de riesgo, la autoridad que corresponderá aprobar y el estado de validación del calendario.

### 4.1 Secciones y campos

**Sección A — Identificación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas y comportamiento |
|---|---|---|---|---|---|
| A1 | Título | `titulo` | Texto de una línea | Sí | 10–150 caracteres, contador visible. Al escribir, muestra hasta 5 **RFC abiertas similares** (mismo CI o texto similar) con enlace. |
| A2 | Tipo de cambio | `tipo_cambio` | Lista (Estándar / Normal / Emergencia) con descripción de cada una en tooltip | Sí | Solo muestra los tipos que el perfil puede solicitar (1.3.4.2.1). Al cambiarlo se reevalúan campos obligatorios, secciones visibles (A3, G), anticipación mínima y autoridad. Las reglas de 1.3.4.2.4 pueden reclasificar el tipo y se informa con un aviso. |
| A3 | Modelo de cambio estándar | `modelo_id` | Lista con búsqueda | Sí **si** Tipo = Estándar; si no, oculto | Solo modelos en estado *Aprobado*, vigentes y aplicables al servicio/CI. Al elegirlo: prellena los campos del modelo (los marcados "bloqueados" quedan en solo lectura), muestra la **lista de elegibilidad** (casillas que el solicitante debe marcar para confirmar que el cambio cumple el modelo) y muestra su riesgo fijo. |
| A4 | Categoría | `categoria_id` | Lista en cascada (Categoría → Subcategoría) | Sí | Catálogo en 1.3.4.1.3. Puede prellenar grupo implementador y plantilla. |
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
| C2 | Activos / CI afectados | `ci_afectados` | Selector múltiple (CMDB) | Sí | Muestra código, nombre, clase, criticidad y entorno. Filtrado por defecto por los servicios elegidos (casilla "Ver todos"). No admite CI en estado *Dado de baja*. Botón **[Analizar impacto ⟨Network⟩]**: lista los CI dependientes según las relaciones de la CMDB (hasta el nivel configurado en 1.3.4.4.5) y permite agregarlos con un clic. |
| C3 | Entorno | `entorno` | Lista (Producción, Preproducción, Pruebas, Desarrollo) | Sí | Si hay CI de varios entornos, se toma el más crítico. |
| C4 | Áreas / departamentos afectados | `areas_afectadas` | Selector múltiple (1.4.1) | No | Define a quién se comunica la interrupción y qué Gestor de Área puede ser aprobador. |
| C5 | Usuarios afectados (estimado) | `usuarios_afectados` | Número entero ≥ 0 | No | Alimenta el cuestionario de riesgo. |

**Sección D — Evaluación inicial**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| D1 | Impacto | `impacto` | Lista (mismos niveles que Incidentes: Alta / Media / Baja) con tooltip | Sí | Niveles leídos de la matriz compartida. |
| D2 | Urgencia | `urgencia` | Lista (Alta / Media / Baja) con tooltip | Sí | Ídem. |
| D3 | Prioridad | `prioridad` | Insignia de solo lectura | Calculado | **Misma matriz impacto × urgencia que usa Incidentes** (P1 a P4). Prioridad manual solo si 1.3.4.1.5 lo permite, con justificación. |
| D4 | Cuestionario de riesgo | `riesgo_respuestas` | Bloque de preguntas con opciones | Sí para Normal y Emergencia (abreviado); no para Estándar | Preguntas de 1.3.4.1.4. Las que se responden automáticamente desde otros campos (usuarios afectados, interrupción, entorno, criticidad, antecedentes) aparecen en solo lectura con la insignia "Automática" y su fuente. |
| D5 | Nivel de riesgo | `riesgo_nivel` / `riesgo_puntaje` | Insignia + puntaje, solo lectura | Calculado | Se recalcula al instante. Si el modelo estándar fija el riesgo, muestra el riesgo del modelo. |

**Sección E — Programación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| E1 | Inicio propuesto | `fecha_inicio` | Fecha y hora | Sí | Debe cumplir la **anticipación mínima** del tipo (1.3.4.2.1). Emergencia: sin mínimo. |
| E2 | Fin propuesto | `fecha_fin` | Fecha y hora | Sí | Posterior al inicio; duración máxima configurable en 1.3.4.4.5. |
| E3 | ¿Requiere interrupción del servicio? | `requiere_interrupcion` | Sí / No | Sí | |
| E4 | Duración estimada de la interrupción | `duracion_interrupcion` | Número + unidad (min/h) | Sí **si** E3 = Sí | Alimenta el cuestionario de riesgo y la comunicación a usuarios. |
| E5 | Ventana de mantenimiento | `ventana_id` | Lista de ventanas aplicables | No (o Sí según el tipo) | Se sugieren las ventanas que contienen el rango elegido. |
| E6 | Validación de calendario | — | Panel de solo lectura | Calculado | Muestra con semáforo: anticipación mínima, dentro de ventana, período de congelamiento, feriado, conflictos con otras RFC (lista con enlaces), y capacidad. Botón **[Revisar calendario ⟨CalendarClock⟩]** abre un modal con vista de calendario y la lista de **próximos huecos libres** sugeridos. Los bloqueos impiden enviar; las advertencias no. |

**Sección F — Planes y responsables**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| F1 | Plan de implementación | `plan_implementacion` | Texto enriquecido + tabla opcional de pasos (orden, paso, responsable, duración estimada) | Sí (Normal y Emergencia; en Estándar viene del modelo) | Los pasos de la tabla se convierten en tareas al programar (1.3.4.3.6). |
| F2 | Plan de pruebas | `plan_pruebas` | Texto enriquecido | Según tipo (1.3.4.2.1) | |
| F3 | Plan de rollback | `plan_rollback` | Texto enriquecido + campo `tiempo_rollback` (min/h) | Sí (Normal y Emergencia) | Ayuda: pasos para revertir, punto de no retorno, quién decide revertir. |
| F4 | Criterios de éxito | `criterios_exito` | Lista de ítems (texto, agregar/quitar) | Según tipo | Se usan en la revisión post-implementación. |
| F5 | Plan de comunicación | `plan_comunicacion` | Texto + casilla "Notificar a usuarios afectados" | No | La casilla activa el comunicado automático de 1.3.4.4.1. |
| F6 | Grupo implementador | `grupo_implementador_id` | Lista (1.4.2) | Sí | |
| F7 | Responsable de la implementación | `implementador_id` | Lista con búsqueda (técnicos del grupo, 1.4.3) | Según tipo (1.3.4.2.1) | Muestra la carga de cambios programados de cada técnico. No puede ser el aprobador de ninguna etapa de esta RFC (segregación). |

**Sección G — Emergencia** (visible solo si Tipo = Emergencia)

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| G1 | Justificación de emergencia | `justificacion_emergencia` | Texto enriquecido | Sí | Mín. 30 caracteres. |
| G2 | Incidente o problema que la motiva | `ticket_emergencia` | Buscador de tickets | Sí (configurable) | |
| G3 | Consecuencia si no se actúa de inmediato | `consecuencia_emergencia` | Texto | Sí | |
| G4 | Registro retroactivo | `retroactivo` | Casilla | No | Visible solo con permiso `cambios.documentar_retroactivo`. Al marcarla aparecen: `fecha_inicio_real`, `fecha_fin_real`, `resultado`, `autorizado_verbalmente_por` (usuario) y `medio_autorizacion` (lista). La RFC se registra directamente como *Implementado* y queda pendiente de autorización retroactiva y de revisión (1.3.4.3). |

**Sección H — Evidencias**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| H1 | Evidencias (adjuntos) | `adjuntos` | Arrastrar-y-soltar + [Seleccionar archivos ⟨FileUp⟩] | No | Tipos y tamaño máximo según 1.8.3 (valor de fábrica: 25 MB por archivo, 10 archivos; bloquear ejecutables). |

**Campos automáticos (panel lateral "Datos del registro"):** `id` (formato `RFC-000001`, secuencia sin saltos), `solicitante_id`, `fecha_solicitud`, `estado` inicial = *Solicitado*, `canal` (manual / desde problema / desde incidente / desde activo / desde plantilla).

### 4.2 Botones del formulario
- **[Enviar RFC ⟨Send⟩]** (primario): valida, crea la RFC, muestra "RFC-xxxxxx enviada" y redirige al ticket.
- **[Enviar y crear otra ⟨FilePlus⟩]**: igual, conservando plantilla y categoría.
- **[Guardar como borrador ⟨Save⟩]**: guarda sin validar; el borrador solo lo ve su autor en "Mis borradores" y caduca a los 30 días (configurable en 1.8.3).
- **[Revisar calendario ⟨CalendarClock⟩]**: abre el modal descrito en E6.
- **[Cancelar ⟨X⟩]**: pide confirmación si hay datos.

### 4.3 Validaciones al enviar (todas también en servidor)
- Todos los obligatorios completos (según tipo y reglas condicionales); errores listados arriba con enfoque al primero.
- Fecha de fin posterior a la de inicio; anticipación mínima cumplida (o, si no se cumple, la RFC solo puede enviarse como Emergencia con justificación, si el perfil tiene permiso).
- Sin **bloqueos de calendario** (congelamiento bloqueante, capacidad excedida, conflicto bloqueante) salvo que el perfil tenga `cambios.excepcion_conflicto` y registre motivo.
- Ningún CI en estado *Dado de baja*.
- Advertencia no bloqueante de posible duplicado (misma combinación de CI con ventanas solapadas): "Posible duplicado: RFC-xxxxxx" con [Ver ⟨FileText⟩] [Enviar de todos modos ⟨Send⟩].
- Tipo Estándar: modelo elegido, lista de elegibilidad completa y CI/servicio dentro del alcance del modelo.


### 4.4 Validaciones de los campos del formulario de registro de RFC (cumple 3C)

| Campo | Tipo de dato | Regla exacta (validador) | Mensaje de error |
|---|---|---|---|
| Título (`titulo`) | Texto corto | V-TITULO (10–150) | El título debe tener entre 10 y 150 caracteres. |
| Tipo de cambio (`tipo_cambio`) | Lista | V-OBLIG + V-LISTA (solo tipos que el perfil puede solicitar) | Selecciona el tipo de cambio. |
| Modelo estándar (`modelo_id`) | Referencia | **Obligatorio si Tipo = Estándar**; V-REF a modelo *Aprobado*, vigente y aplicable al servicio/CI | Selecciona un modelo estándar vigente. |
| Lista de elegibilidad del modelo | Casillas | Todas las casillas obligatorias marcadas | Confirma todos los criterios de elegibilidad del modelo. |
| Categoría (`categoria_id`) | Lista en cascada | V-OBLIG + V-LISTA | Selecciona categoría y subcategoría. |
| Origen (`origen`) | Lista | V-OBLIG + V-LISTA | Selecciona el origen del cambio. |
| Ticket de origen (`ticket_origen`) | Referencia | V-REF; **obligatorio si el origen lo exige**; tipo de ticket permitido por el origen | Selecciona el ticket que origina el cambio. |
| Motivo (`motivo`) | Texto enriquecido | V-RICO(30,5000) | Explica la justificación en al menos 30 caracteres. |
| Descripción (`descripcion`) | Texto enriquecido | V-RICO(50,10000) | Describe el cambio en al menos 50 caracteres. |
| Beneficio esperado (`beneficio`) | Texto simple | V-TEXTO(0,1000) | Máximo 1000 caracteres. |
| Consecuencia de no hacerlo (`consecuencia_no_hacer`) | Texto simple | V-TEXTO(0,1000) | Máximo 1000 caracteres. |
| Servicios afectados (`servicios`) | Selección múltiple | V-MULTI(1,20) servicios activos | Selecciona al menos un servicio afectado. |
| Activos / CI afectados (`ci_afectados`) | Selección múltiple | V-MULTI(1,200); CI no en estado *Dado de baja* ni *Retirado* | Selecciona al menos un CI activo. |
| Entorno (`entorno`) | Lista | V-OBLIG + V-LISTA | Selecciona el entorno. |
| Áreas afectadas (`areas_afectadas`) | Selección múltiple | V-MULTI(0,30) departamentos activos | Selecciona departamentos válidos. |
| Usuarios afectados (`usuarios_afectados`) | Entero | V-ENTERO(0,1000000) | Ingresa un número entero entre 0 y 1 000 000. |
| Impacto (`impacto`) y urgencia (`urgencia`) | Listas | V-OBLIG + V-LISTA (niveles de la matriz compartida) | Selecciona el impacto. / Selecciona la urgencia. |
| Prioridad (`prioridad`) | Calculado | Si es manual: V-JUSTIF + perfil autorizado | Explica el motivo (15 a 500 caracteres). |
| Respuestas del cuestionario de riesgo | Opciones únicas | Cada pregunta obligatoria con una opción válida; las automáticas no se editan | Responde la pregunta {n}. |
| Ajuste manual del nivel de riesgo | Lista + texto | Lista de niveles + V-JUSTIF; solo perfiles autorizados | Explica el ajuste del riesgo (15 a 500 caracteres). |
| Inicio propuesto (`fecha_inicio`) | Fecha y hora | V-FECHAHORA; ≥ ahora + **anticipación mínima del tipo** (Emergencia: sin mínimo) | El inicio debe ser al menos {horas} h después de ahora. |
| Fin propuesto (`fecha_fin`) | Fecha y hora | V-FECHAHORA; V-RANGO-FECHAS (> inicio); duración ≤ máximo del tipo | El fin debe ser posterior al inicio y no superar {horas} h. |
| ¿Requiere interrupción? (`requiere_interrupcion`) | Sí / No | V-OBLIG | Indica si el cambio interrumpe el servicio. |
| Duración de la interrupción (`duracion_interrupcion`) | Entero (minutos) | **Obligatorio si Sí**; V-ENTERO(1,10080); ≤ duración de la ventana | Ingresa la duración en minutos (1 a 10 080). |
| Ventana de mantenimiento (`ventana_id`) | Referencia | V-REF a ventana activa que contenga el rango; obligatoria según el tipo | Elige una ventana que contenga el horario propuesto. |
| Plan de implementación (`plan_implementacion`) | Texto enriquecido + tabla | V-RICO(30,10000) obligatorio en Normal y Emergencia; pasos: texto V-TEXTO(3,250), responsable V-REF, duración V-MIN | Describe el plan de implementación (mín. 30 caracteres). |
| Plan de pruebas (`plan_pruebas`) | Texto enriquecido | V-RICO(0,10000); obligatorio según el tipo | Describe las pruebas a realizar. |
| Plan de rollback (`plan_rollback`) y tiempo | Texto enriquecido + entero | V-RICO(30,10000) obligatorio en Normal y Emergencia; tiempo V-ENTERO(1,10080) minutos | Describe cómo revertir el cambio (mín. 30 caracteres). |
| Criterios de éxito (`criterios_exito`) | Lista de textos | Cada ítem V-TEXTO(3,200); máximo 20; sin repetidos; obligatorio según el tipo | Agrega al menos un criterio de éxito. |
| Plan de comunicación (`plan_comunicacion`) | Texto simple | V-TEXTO(0,2000) | Máximo 2000 caracteres. |
| Grupo implementador (`grupo_implementador_id`) | Referencia | V-OBLIG + V-REF (grupo de TI activo) | Selecciona el grupo implementador. |
| Responsable de implementación (`implementador_id`) | Referencia | V-REF (técnico activo del grupo); **no puede ser aprobador de la misma RFC** | El implementador no puede aprobar esta RFC. |
| Justificación de emergencia (`justificacion_emergencia`) | Texto enriquecido | Obligatorio si Tipo = Emergencia; V-RICO(30,3000) | Justifica la emergencia (mín. 30 caracteres). |
| Ticket que motiva la emergencia (`ticket_emergencia`) | Referencia | Obligatorio si Tipo = Emergencia (configurable); V-REF incidente o problema | Selecciona el incidente o problema que motiva la emergencia. |
| Consecuencia si no se actúa (`consecuencia_emergencia`) | Texto simple | Obligatorio si Emergencia; V-TEXTO(10,1000) | Describe la consecuencia de no actuar de inmediato. |
| Registro retroactivo: inicio y fin reales | Fecha y hora | V-FECHAHORA; ≤ ahora; fin > inicio; solo con permiso `cambios.documentar_retroactivo` | Las fechas reales no pueden ser futuras. |
| Resultado y medio de autorización | Lista | V-LISTA (resultados y medios de autorización de emergencia) | Selecciona una opción. |
| Autorizado verbalmente por | Referencia | V-REF usuario activo distinto del solicitante | Selecciona quién autorizó. |
| Adjuntos (`adjuntos`) | Archivos | V-ARCHIVO (máx. 10 × 25 MB; ejecutables bloqueados) | El archivo {nombre} no es válido: {motivo}. |

---

## 5. ESPECIFICACIÓN DEL TICKET DE RFC YA CREADO (lo que ve el usuario)

**Ruta:** `5 Gestión de Cambios > 5.1 Operación y Solicitudes RFC > 5.1.3 Historial consolidado > (fila) RFC-xxxxxx` y desde cualquier enlace a la RFC.
**Layout:** cabecera fija + barra de acciones + pestañas + panel lateral derecho.

### 5.1 Cabecera fija
Siempre visible: **ID**, **título**, **insignia de tipo** (color por tipo), **insignia de estado**, **insignia de prioridad**, **insignia de riesgo** (con puntaje al pasar el cursor), **solicitante**, **ventana programada** (inicio – fin en la zona horaria del sistema, con duración), **etapa de aprobación actual** (ej. "Etapa 2 de 3: CAB"), **indicadores de plazo** (medidores de "Evaluación" y "Autorización" con porcentaje consumido y color verde/ámbar/rojo/en pausa), y **etiquetas** cuando apliquen: `Emergencia`, `Retroactivo`, `Conflicto`, `En congelamiento`, `Fuera de ventana`, `Con condiciones`, `Reprogramado`, `Fallido`, `Revertido`, `Modelo estándar: <nombre>`.

### 5.2 Barra de acciones
Los botones se generan **dinámicamente** desde las transiciones de 1.3.4.3.2 válidas para el estado, el tipo y el perfil (ej. [Iniciar evaluación ⟨Play⟩], [Enviar a autorización ⟨Send⟩], [Programar ⟨CalendarClock⟩], [Reprogramar ⟨CalendarClock⟩], [Iniciar implementación ⟨Play⟩], [Registrar resultado ⟨FilePlus⟩], [Iniciar revisión ⟨Play⟩], [Cerrar ⟨X⟩], [Cancelar ⟨X⟩]). Si es el aprobador de la etapa vigente aparecen además **[Aprobar ⟨FlaskConical⟩]**, **[Aprobar con condiciones ⟨FlaskConical⟩]**, **[Rechazar ⟨CircleX⟩]**, **[Solicitar información ⟨CircleHelp⟩]** y **[Delegar ⟨ArrowRightLeft⟩]**. Siempre presentes según permisos: **[Reasignar implementador ⟨ArrowRightLeft⟩]**, **[Editar ⟨SquarePen⟩]**, **[Vincular ticket ⟨Link2⟩]**, **[Añadir tarea ⟨Plus⟩]**, **[Seguir / Dejar de seguir ⟨Bell⟩]** y el menú **[⋯]** con *Imprimir/PDF*, *Copiar enlace*, *Exportar ICS de la ventana*, *Duplicar como nueva RFC*, *Convertir tipo* (solo `cambios.reclasificar_tipo`). Los botones sin permiso o con requisitos pendientes se muestran deshabilitados con tooltip que explica el motivo.

### 5.3 Panel lateral derecho (resumen)
Tipo y modelo · Categoría · Servicios (nº y nombres) · CI afectados (nº y criticidad máxima) · Entorno · Prioridad y riesgo · Origen y ticket de origen · Implementador y grupo · Aprobador(es) pendiente(s) y plazo · Reunión de CAB (fecha y hora, si aplica) · Interrupción estimada · Áreas afectadas · Seguidores · Próximo hito (qué y cuándo).

### 5.4 Pestañas

**5.4.1 Solicitud**
Todo lo registrado en el formulario (sección 4), agrupado por las mismas secciones, con **[Editar ⟨SquarePen⟩]** por sección (según estado y permisos) y historial de versiones del texto de cada plan. Si el tipo es Emergencia, incluye la sección de emergencia. Adjuntos con [Descargar ⟨FileDown⟩], [Vista previa ⟨Eye⟩], [Eliminar ⟨Trash2⟩] (con permiso).

**5.4.2 Evaluación**
- *Prioridad:* impacto, urgencia, prioridad (y justificación si fue manual).
- *Riesgo:* cada pregunta del cuestionario con la respuesta, su puntaje y la fuente (manual/automática); puntaje total y nivel; botón **[Ajustar nivel de riesgo ⟨SquarePen⟩]** (solo evaluador con permiso: exige nuevo nivel y justificación; queda el valor calculado y el ajustado).
- *Análisis de impacto en la CMDB:* CI directamente afectados y CI dependientes (con criticidad y servicios que soportan), servicios potencialmente afectados y áreas.
- *Conflictos detectados:* tabla con tipo de conflicto (otro cambio, congelamiento, feriado, fuera de ventana, capacidad), severidad, elemento en conflicto con enlace, y estado (pendiente / resuelto / excepción concedida por *usuario* con motivo).
- *Evaluación técnica:* evaluador asignado, fecha, comentarios técnicos (texto enriquecido), recursos requeridos, costo estimado (opcional), recomendación (Favorable / Favorable con condiciones / Desfavorable).

**5.4.3 Aprobaciones**
- Tabla por **etapa**: orden, nombre de la etapa, aprobador(es) o comité, regla de decisión, plazo y tiempo restante, estado (Pendiente / En curso / Aprobada / Rechazada / Aprobada con condiciones / Omitida), decisión, decidido por, fecha-hora, comentario, condiciones.
- Cada fila se expande para ver votos individuales (si la etapa es colegiada), delegaciones y recordatorios enviados.
- *Bloque CAB/ECAB:* fecha y hora de la reunión, asistentes y quórum, votos (a favor / en contra / abstenciones), dictamen, condiciones y enlace a `5.2.1 Dictamen colegiado CAB`.
- *Condiciones pendientes:* lista de condiciones impuestas con responsable y casilla de cumplimiento (deben cumplirse antes de iniciar la implementación).
- Para el aprobador vigente: botones [Aprobar ⟨FlaskConical⟩] [Aprobar con condiciones ⟨FlaskConical⟩] [Rechazar ⟨CircleX⟩] [Solicitar información ⟨CircleHelp⟩] [Delegar ⟨ArrowRightLeft⟩] con modales según 1.3.4.3.3.

**5.4.4 Planificación**
- *Ventana aprobada:* inicio y fin, ventana de mantenimiento asociada, historial de reprogramaciones (fecha anterior → nueva, motivo, quién).
- *Equipo:* implementador, grupo, participantes adicionales.
- *Tareas:* tabla con título, fase (Pre-implementación / Implementación / Validación / Post-implementación), responsable, vencimiento, estado, obligatoria, bloqueo de transición; botones [Añadir tarea ⟨Plus⟩] [Aplicar paquete ⟨CircleCheck⟩].
- *Dependencias:* RFC o tareas que deben completarse antes (bloquea / es bloqueada por).
- *Checklist Go/No-Go:* ítems configurados (1.3.4.3.6) con casilla, responsable y evidencia; decisión final **Go / No-Go** con quién y cuándo.
- *Comunicación:* hitos de comunicación programados (a quién, cuándo, plantilla, estado de envío).

**5.4.5 Implementación**
- *Real:* inicio real, fin real, duración, interrupción real del servicio (minutos).
- *Bitácora de ejecución:* línea de tiempo paso a paso (hora, paso, responsable, resultado, nota), con botón **[Registrar paso ⟨FilePlus⟩]**.
- *Resultado:* Exitoso / Parcial / Fallido / Rollback ejecutado / Cancelado en ejecución (catálogo 1.3.4.1.3), notas.
- *Rollback:* ¿se ejecutó?, motivo, hora de decisión, hora de término, resultado.
- *Fallo:* causa del fallo (catálogo), incidentes generados (vinculados), problema creado (si aplica).
- *Actualización de CMDB:* lista de cambios a aplicar en los CI (CI, atributo, valor actual, valor nuevo, estado: Pendiente / Aplicado / No aplica) con botón **[Aplicar a la CMDB ⟨CircleCheck⟩]**.

**5.4.6 Revisión post-implementación**
Visible desde *Implementado*. Preguntas de la plantilla de 1.3.4.3.8 con respuestas; resultado de cada criterio de éxito; incidentes causados por el cambio (detectados automáticamente en la ventana de observación y agregables manualmente); desviaciones respecto al plan; costo real vs. estimado; lecciones aprendidas; acciones de mejora (tabla: acción, responsable, fecha, estado); confirmación de CMDB actualizada y de conocimiento publicado; revisor, fecha y **calificación** (Exitoso / Con observaciones / Fallido).

**5.4.7 Relacionados**
Problemas, incidentes (origen, causados por el cambio), solicitudes de servicio, otras RFC (tipos: "bloquea a", "es bloqueada por", "duplicada de", "relacionada"), artículos de conocimiento. Botones **[Vincular ⟨Link2⟩]** y **[Desvincular ⟨Unlink⟩]** (motivo).

**5.4.8 Activos / CI afectados**
Tabla: código, nombre, clase, criticidad, entorno, servicios que soporta, origen del vínculo (manual / análisis de impacto), estado del CI. Botones [Agregar CI ⟨Plus⟩], [Quitar ⟨Trash2⟩], [Ver en mapa CMDB ⟨Network⟩] (abre `7.2 Mapa de topología CMDB` centrado en el CI).

**5.4.9 Comentarios y bitácora**
Línea de tiempo unificada con filtros *Todo · Comentarios internos · Comentarios públicos · Cambios de estado · Aprobaciones · Sistema*. Editor con menciones `@usuario`, adjuntos y visibilidad (Interno / Visible para el solicitante). Los comentarios no se borran, se **anulan** con motivo.

**5.4.10 Historial / auditoría**
Tabla inmutable: fecha-hora, usuario, acción, campo, valor anterior, valor nuevo, comentario. Filtros por usuario, acción y fechas. Botón [Exportar CSV ⟨FileDown⟩]. Solo con permiso `cambios.auditoria.ver`.

### 5.5 Reglas de visibilidad por estado
Cada pestaña tiene "visible desde el estado X" y "editable en los estados Y" (1.3.4.1.7). Valores de fábrica: *Evaluación* visible desde *En evaluación*; *Aprobaciones* desde *En autorización*; *Planificación* desde *Autorizado*; *Implementación* desde *Programado*; *Revisión post-implementación* desde *Implementado*; ningún campo de planes editable desde *En ejecución*, y ninguno en estados finales.

---

## 6. PANTALLA 1.3.4.1 — CONFIGURACIÓN DE FORMULARIO

**Propósito:** que el administrador controle qué se captura al solicitar un cambio, cómo se mide el riesgo y qué se muestra en el ticket, sin tocar código.
**Pestañas:** 1.3.4.1.1 a 1.3.4.1.7. Todas siguen el patrón de la sección 3.
**Reutilización obligatoria:** la configuración de formulario de Incidentes (1.3.1.1) ya permite configurar campos y tiene un creador de campos. Esta pantalla **extiende ese mismo editor** para la entidad `cambio` (si el Prompt 1 ya lo extendió para `problema`, usa esa misma extensión). Lo que el editor ya haga no se reimplementa; lo que falte se agrega al componente compartido **sin cambiar el comportamiento actual de Incidentes**.

---

### 6.1 Pestaña 1.3.4.1.1 — Campos (visibles, obligatorios y orden)

**Qué se configura:** para cada campo del formulario de la sección 4: si es visible, su obligatoriedad (incluida la que depende del tipo de cambio), sección, posición, ancho, perfiles y reglas condicionales.

**Selector superior:** `Formulario: [Solicitud de RFC ▾]` con opciones *Solicitud de RFC* (alta) y *Edición de RFC* (campos editables dentro del ticket); botón **[Copiar configuración del otro formulario ⟨Copy⟩]**.

**Layout de tres columnas:**

| Columna | Contenido |
|---|---|
| **Izquierda — Biblioteca de campos** (280 px) | Buscador. Grupos plegables: *Campos estándar*, *Campos personalizados*, *Campos del sistema* (informativos). Un campo ya colocado aparece en gris con ✓; los ocultos, con ojo tachado. Clic en un campo no colocado → [Agregar al formulario ⟨Plus⟩]. |
| **Centro — Lienzo** | Secciones como tarjetas plegables (A. Identificación … H. Evidencias). Cada fila: asa de arrastre `⋮⋮`, etiqueta, código en gris, chip de tipo, interruptor **Visible**, selector rápido **Obligatorio**, 🔒 si es bloqueado, ⚙ propiedades, ⎘ duplicar y 🗑 eliminar (solo personalizados). |
| **Derecha — Propiedades** (360 px) | Se llena al seleccionar una fila. |

**Barra de herramientas del lienzo:** `[+ Agregar sección ⟨Plus⟩]` `[Expandir todo ⟨ChevronsUpDown⟩]` `[Contraer todo ⟨ChevronsUpDown⟩]` `[Mostrar solo obligatorios ⟨Eye⟩]` `[Mostrar solo ocultos ⟨Eye⟩]` y contador "N campos visibles · M obligatorios".

**Acciones sobre secciones:** renombrar, color/ícono, mover (arrastre o ↑↓), ocultar sección (oculta sus campos), eliminar (solo vacía), visible para perfiles. **La Sección G (Emergencia) es condicional por sistema:** solo se muestra con Tipo = Emergencia y no puede mostrarse en otros tipos.

**Propiedades de un campo (panel derecho):**

| Propiedad | Control | Detalle |
|---|---|---|
| Código interno | Texto de solo lectura | Inmutable. |
| Etiqueta | Texto 3–60 | |
| Texto de ayuda | Texto hasta 250 | Ícono ⓘ con tooltip. |
| Marcador (placeholder) | Texto hasta 80 | Controles de texto. |
| Visible | Interruptor | Oculto conserva datos. |
| **Obligatorio** | Selector de 4 opciones: **Siempre** · **Según tipo de cambio** (se define por tipo en 1.3.4.2.1, pestaña de requisitos) · **Condicional** (constructor de reglas) · **No** | La obligatoriedad *por transición* se configura en 1.3.4.3.2. |
| Solo lectura | Interruptor | Requiere valor por defecto o cálculo. |
| Valor por defecto | Control del tipo del campo | Variables `{usuario_actual}`, `{fecha_actual}`, `{grupo_del_usuario}`. |
| Sección, Ancho | Lista; 1/3 · 1/2 · 2/3 · completo | |
| Visible para perfiles / Editable por perfiles | Selector múltiple (1.1.2) | Vacío = todos. |
| Validaciones | Longitud, rango, expresión regular con mensaje propio y botón [Probar expresión ⟨FlaskConical⟩] | |
| Reglas condicionales | Constructor (abajo) | |

**Constructor de reglas condicionales:** `CUANDO [campo] [operador] [valor] (Y/O …) ENTONCES [acción]`; hasta 5 condiciones y 10 reglas por campo; operadores *igual, distinto, vacío, no vacío, contiene, es uno de, mayor que, menor que*; acciones *Mostrar, Ocultar, Hacer obligatorio, Hacer opcional, Solo lectura, Filtrar opciones, Establecer valor*; botón **[Probar regla ⟨FlaskConical⟩]**; detección de ciclos (error "Regla circular"). Reglas de fábrica: (1) `Tipo de cambio = Estándar` → mostrar *Modelo de cambio estándar*; (2) `Origen` con "requiere ticket" → *Ticket de origen* obligatorio; (3) `¿Requiere interrupción? = Sí` → *Duración de la interrupción* obligatoria; (4) `Tipo = Emergencia` → mostrar Sección G.

**Campos bloqueados (🔒) — no se pueden ocultar:** *Título, Tipo de cambio, Motivo, Descripción, Servicio(s) afectado(s), Activos/CI afectados, Impacto, Urgencia, Inicio y fin propuestos, Plan de implementación, Plan de rollback, Grupo implementador*. Se pueden renombrar y mover. Su obligatoriedad mínima normativa (sección 7.1) tampoco puede bajarse en tipos Normal y Emergencia. Los campos del sistema (ID, solicitante, fechas, estado) no son editables.

**Reordenamiento:** arrastrar (indicador azul del destino); alternativa por teclado `Alt+↑/↓` (dentro de la sección) y `Alt+←/→` (entre secciones); el orden define también el orden de tabulación; botón **[Ordenar sección alfabéticamente ⟨ArrowUpDown⟩]**.

**Reglas de consistencia (al guardar borrador y al publicar):**
1. Un campo oculto no puede ser obligatorio.
2. Si A es obligatorio condicional según B, B debe ser visible.
3. Un campo con obligatoriedad "Según tipo de cambio" debe tener su fila en la matriz de 1.3.4.2.1 (se crea automáticamente con valor *Opcional*).
4. Mínimo 1 sección y 8 campos visibles; máximo 50 campos visibles (aviso al superarse).
5. No pueden existir campos huérfanos.
6. Los campos que alimentan reglas del sistema (fechas, CI, servicios, interrupción, usuarios afectados, entorno) no pueden quitarse del formulario si una pregunta del cuestionario de riesgo los usa como fuente automática (1.3.4.1.4); el error indica qué pregunta los usa.

**Mensajes de ejemplo:**
- `Error: "Plan de rollback" es un campo bloqueado y no puede ocultarse.`
- `Error: "Usuarios afectados" alimenta la pregunta 2 del cuestionario de riesgo y no puede ocultarse.`
- `Aviso: 2 campos obligatorios nuevos no tienen valor en 41 RFC abiertas; solo se exigirán al editarlas.`

---

### 6.2 Pestaña 1.3.4.1.2 — Campos personalizados

**Reutilización obligatoria:** usa el creador de campos personalizados existente y su misma tabla de definición, agregando `cambio` como entidad destino. Si el creador ya cubre tipos o propiedades de este asistente, se conserva su comportamiento y se agregan solo los que falten.

**Vista de lista:** Nombre · Código · Tipo · Estado · Usado en N RFC · Aplica a tipos de cambio · Creado por · Fecha. Búsqueda y filtros. Límite de fábrica **30 campos** (configurable hasta 60). Botones: `[+ Nuevo campo personalizado ⟨Plus⟩]`; por fila `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Desactivar/Activar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` (solo con 0 usos; con usos, solo desactivar).

**Asistente (5 pasos; [Atrás ⟨ArrowLeft⟩] [Siguiente ⟨ArrowRight⟩] [Cancelar ⟨X⟩] y [Crear campo ⟨FilePlus⟩] al final):**
1. **Tipo:** texto corto · texto largo · entero · decimal · fecha · fecha y hora · sí/no · lista · selección múltiple · casillas · usuario · URL · archivo · referencia a CI · referencia a ticket.
2. **Identificación:** etiqueta (3–60), código (prefijo `cf_`, único, inmutable), ayuda.
3. **Propiedades según tipo:** longitudes, rangos, unidad, opciones (valor, etiqueta, color, orden, activo), valor por defecto, tipos de archivo.
4. **Ubicación y comportamiento:** formulario(s), sección, **tipos de cambio a los que aplica (Estándar / Normal / Emergencia)**, obligatorio (sí/no/según tipo/condicional), pestaña de la vista del ticket, perfiles que lo ven y editan, incluir en búsqueda, incluir en reportes, incluir en auditoría (siempre activo).
5. **Resumen:** vista previa del control y resumen.

**Regla:** el tipo de dato no se cambia tras crear el campo.

---

### 6.3 Pestaña 1.3.4.1.3 — Listas y catálogos

**Layout:** a la izquierda la lista de catálogos; a la derecha la tabla del catálogo elegido.

| Catálogo | Estructura | Atributos propios de cada valor |
|---|---|---|
| **Categorías de cambio** | Árbol de 2 niveles | Tipo de cambio sugerido · Grupo implementador por defecto · Plantilla por defecto · Servicio asociado (opcional). |
| **Orígenes** | Lista plana | ¿Requiere ticket de origen? (sí/no) · Tipos de ticket permitidos · ¿Es origen reactivo o proactivo? |
| **Entornos** | Lista plana | Peso de riesgo (0–5) · ¿Es productivo? (sí/no). |
| **Resultados de implementación** | Lista plana (🔒 los 5 de fábrica) | ¿Cuenta como éxito? · ¿Exige causa de fallo? · ¿Exige revisión post-implementación? · ¿Dispara acciones de fallo (1.3.4.3.7)? |
| **Códigos de cierre** | Lista plana | ¿Exige PIR completa? · ¿Exige CMDB actualizada? · ¿Cuenta como cambio exitoso en KPI? · ¿Exige aprobación de supervisor? |
| **Motivos de rechazo** | Lista plana | ¿Permite reenviar? (sí/no) · Texto sugerido al solicitante. |
| **Motivos de cancelación** | Lista plana | ¿Requiere aprobación? |
| **Motivos de aplazamiento / reprogramación** | Lista plana | ¿Exige nueva autorización? (sí/no/si cambia más de N horas). |
| **Causas de fallo** | Lista plana | ¿Sugiere crear problema? (sí/no). |
| **Tipos de dependencia entre RFC** | Lista plana (🔒) | Bloquea (sí/no) · Inverso (nombre del vínculo opuesto). |
| **Medios de autorización de emergencia** | Lista plana | ¿Exige evidencia adjunta? |

**Atributos comunes:** Orden · Código (inmutable) · Nombre · Descripción · Color · Activo · Sistema (🔒) · Usos.

**Botones:** `[+ Nuevo valor ⟨Plus⟩]` (en categorías: `[+ Categoría ⟨Plus⟩]` `[+ Subcategoría ⟨Plus⟩]`) · por fila `[Editar ⟨SquarePen⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` · `[Reordenar ⟨ArrowUpDown⟩]` · `[Importar CSV ⟨FileUp⟩]` (plantilla descargable, vista previa con errores por fila) · `[Exportar CSV ⟨FileDown⟩]` · `[Fusionar… ⟨Merge⟩]` (reasigna y desactiva el origen, con confirmación y número de registros).

**Reglas:** valores 🔒 se renombran y recolorean pero no se eliminan ni desactivan; un valor en uso solo se desactiva; nombre único por nivel, código único por catálogo; cada catálogo conserva al menos 1 valor activo; categorías máximo 2 niveles.

---

### 6.4 Pestaña 1.3.4.1.4 — Cuestionario de riesgo

**Qué se configura:** cómo se calcula el nivel de riesgo de una RFC (ITIL 4 y COBIT BAI06: evaluación de riesgo antes de autorizar), con un cuestionario ponderado y umbrales.

**Bloque 1 — Preguntas** (tabla ordenable): Orden · Pregunta · Peso (multiplicador, por defecto 1) · Fuente de respuesta · Aplica a tipos (Estándar/Normal/Emergencia) · Obligatoria · Activa.
Editor de pregunta (modal): texto (5–200) · ayuda · **fuente de respuesta**: *Manual* / *Automática desde un campo del formulario* (selector de campo y tabla de correspondencia valor → opción) / *Automática desde datos del sistema* (criticidad máxima de los CI/servicios, antecedentes de RFC fallidas en los mismos CI en los últimos N meses, modelo estándar usado) · **opciones de respuesta** (tabla: texto, puntaje 0–10, marca **"Eleva el riesgo a nivel mínimo X"**, orden) · si se permite "No sé" (con puntaje por defecto) · condiciones de aparición (constructor).
Botones: `[+ Nueva pregunta ⟨Plus⟩]` `[Duplicar ⟨Copy⟩]` `[Desactivar ⟨Ban⟩]` `[Eliminar ⟨Trash2⟩]` (solo si nunca se respondió) `[Reordenar ⟨ArrowUpDown⟩]`.

**Bloque 2 — Niveles de riesgo y umbrales:** tabla con Nivel (Bajo / Medio / Alto / Crítico, renombrables, mínimo 3 y máximo 5), color, rango de puntaje (desde–hasta; la herramienta valida que cubran de 0 al máximo posible sin huecos ni solapes), descripción. Se muestra el **puntaje máximo posible** calculado.

**Bloque 3 — Reglas especiales:**
- `Aplicar la regla de elevación`: si una respuesta marcada con "Eleva el riesgo" se elige, el nivel final no puede ser menor que el indicado, aunque el puntaje sea menor.
- `Permitir ajuste manual del nivel de riesgo` (interruptor) → perfiles autorizados (evaluador) y justificación obligatoria (mín. 15 caracteres); el sistema conserva el nivel calculado y el ajustado.
- `Riesgo fijo para cambios estándar`: el nivel lo da el modelo (1.3.4.2.3).
- `Cuestionario abreviado para Emergencia`: las preguntas marcadas "Aplica a Emergencia" son las únicas obligatorias; el resto se responde después.

**Botones:** `[Simulador ⟨FlaskConical⟩]` (panel donde el admin responde el cuestionario y ve puntaje, nivel y regla de elevación aplicada) · `[Restaurar cuestionario de fábrica ⟨RotateCcw⟩]` · patrón común.

**Cuestionario de fábrica:** sección 11.

**Reglas:** cada pregunta activa debe tener ≥2 opciones; una pregunta automática debe tener su fuente válida y visible; no se puede desactivar una pregunta si dejaría el máximo posible por debajo del umbral del nivel Alto; cambios publicados no recalculan RFC cerradas; para RFC abiertas el modal de publicación ofrece la casilla "Recalcular riesgo de las N RFC abiertas" (no toca ajustes manuales).

---

### 6.5 Pestaña 1.3.4.1.5 — Prioridad (matriz compartida)

**Hecho confirmado:** el sistema ya tiene la matriz impacto × urgencia → prioridad (P1 Crítica, P2 Alta, P3 Media, P4 Baja), con niveles Alta/Media/Baja, usada al crear incidentes. Ubicación probable: `1.2.5 Objetivos SLA` (`/admin/servicios/sla`, `MatrizPrioridadSla.tsx`, API `/api/admin/sla/matriz`) y cálculo en `src/shared/lib/sla.ts`; confírmala en la Etapa 0. **Prohibido crear una matriz paralela como comportamiento por defecto.**

1. **Matriz vigente** de solo lectura rotulada "Matriz compartida con Incidentes" (y con Problemas si el Prompt 1 está implementado), más tabla de prioridades.
2. **Enlace `[Editar matriz compartida → ⟨ArrowUpRight⟩]`** a su pantalla de edición actual. Si la matriz está fija en código sin pantalla, repórtalo en la Etapa 0 y propón migrarla a una tabla; no lo implementes sin aprobación.
3. **Interruptor `Usar matriz propia para cambios`** (apagado por defecto): copia la matriz actual y habilita su edición solo para cambios, con confirmación; al apagarlo vuelve a la compartida.
4. **Textos de ayuda por nivel** (tooltips) propios de cambios, editables; no alteran niveles ni matriz.
5. **Opciones:** `Permitir prioridad manual` (perfiles y justificación ≥15 caracteres) · `Recalcular prioridad al cambiar impacto o urgencia` (activo).
6. **Aclaración ITIL (se muestra en la pantalla):** la **prioridad** (impacto × urgencia) y el **riesgo** (cuestionario) son dimensiones independientes; la autoridad de aprobación se decide por tipo y riesgo (1.3.4.2.2).
7. **Botones:** `[Simulador ⟨FlaskConical⟩]` · `[Ver dónde se usa ⟨FileText⟩]` · patrón común. Con matriz propia: `[Restaurar a la matriz compartida ⟨RotateCcw⟩]`.

**Reglas:** con matriz propia, todas las celdas llenas y cada prioridad usada al menos una vez; recálculo opcional de RFC abiertas sin tocar prioridades manuales.

---

### 6.6 Pestaña 1.3.4.1.6 — Plantillas de RFC

**Qué se configura:** plantillas que prellenan el formulario. *No son modelos de cambio estándar:* la plantilla solo prellena datos y no concede autorización; el modelo (1.3.4.2.3) sí concede preautorización.

**Lista:** Nombre · Descripción · Activa · Tipo de cambio · Categoría · Visible para · Veces usada · Última modificación. Botones: `[+ Nueva plantilla ⟨Plus⟩]`; por fila `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` (solo si nunca se usó).

**Editor (pestañas internas):**
1. **General:** nombre (5–80, único), descripción, activa, tipo de cambio y categoría sugeridos, perfiles que pueden usarla.
2. **Valores prellenados:** el formulario completo, con un interruptor **"Bloquear para que el usuario no lo cambie"** por campo. Solo se prellenan campos visibles.
3. **Pasos y tareas:** tabla de pasos del plan de implementación y paquete de tareas (1.3.4.3.6) con orden y offsets de vencimiento.
4. **Vista previa.**

**Comportamiento:** al elegir plantilla se llenan los campos; si el usuario ya escribió algo, se pregunta [Reemplazar ⟨ArrowRightLeft⟩] [Mantener los míos ⟨Check⟩]. Plantillas de fábrica: sección 11.

---

### 6.7 Pestaña 1.3.4.1.7 — Vista del ticket

**Bloque 1 — Cabecera (hasta 10 elementos):** lista ordenable (sección 5.1); ID, título, tipo, estado y prioridad son fijos.
**Bloque 2 — Pestañas:** una fila por pestaña de la sección 5.4 con: orden · nombre (3–30) · visible · visible para perfiles · **visible desde el estado** · **editable en los estados** · **[Configurar campos… ⟨Settings2⟩]** (visible, orden, etiqueta y solo lectura de cada campo de esa pestaña). *Solicitud*, *Comentarios y bitácora* e *Historial / auditoría* no pueden ocultarse; *Historial* solo con `cambios.auditoria.ver`.
**Bloque 3 — Panel lateral (5.3):** elementos visibles y orden.
**Bloque 4 — Barra de acciones:** arrastrar botones entre "Visibles" y "En menú ⋯". Los botones de transición y de aprobación se gestionan en 1.3.4.3.
**Botones:** `[Vista previa con RFC real ⟨Eye⟩]` (elige una existente) · `[Vista previa con ejemplo ⟨Eye⟩]` · patrón común.


### 6.8 Validaciones de la pantalla 1.3.4.1 (cumple 3C)

| Propiedad / campo | Ventana interna | Tipo de dato | Validadores y regla |
|---|---|---|---|
| Etiqueta, ayuda, marcador y valor por defecto de un campo | 1.3.4.1.1 Campos | Texto | V-NOMBRE (3–60); V-TEXTO(0,250); V-TEXTO(0,80); validador del propio campo |
| Longitudes mínima y máxima; expresión regular y mensaje | 1.3.4.1.1 | Enteros / texto | V-ENTERO(0,10000) con mínimo ≤ máximo; V-REGEX; mensaje V-TEXTO(5,150) |
| Obligatoriedad «según tipo de cambio» | 1.3.4.1.1 | Lista | V-LISTA; exige fila en la matriz de 1.3.4.2.1; los mínimos normativos no se pueden bajar |
| Reglas condicionales | 1.3.4.1.1 | Constructor | Máx. 5 condiciones y 10 reglas por campo; valor comparado con el validador del campo; sin ciclos |
| Etiqueta y código de campo personalizado | 1.3.4.1.2 Campos personalizados | Texto / código | V-NOMBRE; V-CODIGO + V-UNICO (prefijo `cf_`); máximo 30 |
| Opciones, rango, decimales, unidad y tamaño de archivo | 1.3.4.1.2 | Texto / enteros | V-NOMBRE único; mínimo ≤ máximo; V-ENTERO(0,6); V-TEXTO(0,15); V-ENTERO(1,25) |
| Tipos de cambio a los que aplica el campo | 1.3.4.1.2 | Casillas | Al menos un tipo marcado |
| Nombre, código, descripción, color, orden de un valor | 1.3.4.1.3 Listas y catálogos | Texto | V-NOMBRE + V-UNICO; V-CODIGO + V-UNICO; V-TEXTO(0,250); V-HEX; V-ORDEN |
| Peso de riesgo del entorno | 1.3.4.1.3 | Entero | V-ENTERO(0,5) |
| Archivo CSV de catálogo | 1.3.4.1.3 | Archivo | V-ARCHIVO (.csv, UTF-8, ≤ 5 MB, ≤ 2000 filas) |
| Texto, ayuda y peso de una pregunta de riesgo | 1.3.4.1.4 Cuestionario de riesgo | Texto / decimal | V-TEXTO(5,200); V-TEXTO(0,250); V-DECIMAL(0.1,10,1) |
| Texto de cada opción y su puntaje | 1.3.4.1.4 | Texto / entero | V-NOMBRE; V-ENTERO(0,10); mínimo 2 opciones por pregunta |
| Niveles de riesgo y rangos | 1.3.4.1.4 | Texto / enteros | V-NOMBRE (3–20) único; rangos enteros contiguos que cubren de 0 al máximo, sin huecos ni solapes; 3 a 5 niveles |
| Nivel mínimo por elevación | 1.3.4.1.4 | Lista | V-LISTA (niveles definidos) |
| Fuente de respuesta automática | 1.3.4.1.4 | Lista | V-LISTA; el campo fuente debe estar visible en el formulario |
| Textos de ayuda de impacto/urgencia y matriz propia | 1.3.4.1.5 Prioridad | Texto / listas | V-TEXTO(0,250); celdas V-OBLIG + V-LISTA |
| Perfiles de prioridad manual | 1.3.4.1.5 | Selección múltiple | V-MULTI(1,20) si está activo |
| Nombre y descripción de plantilla | 1.3.4.1.6 Plantillas | Texto | V-NOMBRE80 + V-UNICO; V-TEXTO(0,250) |
| Pasos y tareas de plantilla | 1.3.4.1.6 | Texto / referencias | V-TEXTO(3,250); V-MULTI |
| Nombre de pestaña, orden y estados de visibilidad | 1.3.4.1.7 Vista del ticket | Texto / selección | V-TEXTO(3,30); V-ORDEN; V-MULTI |
| Motivo de publicación; archivo JSON; palabra RESTAURAR | Modales y barra | Texto / archivo | V-TEXTO(10,500); V-ARCHIVO (.json ≤ 2 MB); coincidencia exacta con `RESTAURAR` |

---

## 7. PANTALLA 1.3.4.2 — TIPOS DE CAMBIO Y REQUISITOS

**Propósito:** definir cómo se comporta cada tipo de cambio (ITIL 4: estándar, normal, emergencia), quién autoriza según el riesgo y qué modelos preautorizados existen.

### 7.1 Pestaña 1.3.4.2.1 — Tipos de cambio

**Layout:** a la izquierda, tres tarjetas (Estándar, Normal, Emergencia) con color, ícono y resumen; a la derecha, el panel de configuración del tipo seleccionado con secciones plegables.

**Sección 1 — Identidad:** Nombre (renombrable), código (🔒 `estandar`, `normal`, `emergencia`), descripción (aparece como tooltip en el formulario), color, ícono. Los tres tipos **no se pueden eliminar ni desactivar**.

**Sección 2 — Quién puede solicitar:** perfiles (selector múltiple) y casilla "Exigir permiso especial `cambios.crear_emergencia`" (solo Emergencia, no se puede quitar).

**Sección 3 — Tiempos:**
- **Anticipación mínima** entre la solicitud y el inicio propuesto (horas): Estándar 24 · Normal 72 · Emergencia 0.
- **Duración máxima de la ventana** propuesta (horas).
- **Corte de agenda del CAB:** horas antes de la reunión hasta las cuales una RFC entra a esa agenda (aplica a Normal).
- **Caducidad de la autorización:** días después de la fecha de inicio aprobada tras los cuales, si no se inició, la autorización caduca y la RFC vuelve a *Autorizado* para reprogramar (Normal 7 · Estándar 30 · Emergencia 1).

**Sección 4 — Requisitos de campos (matriz):** tabla con una fila por campo del formulario y tres columnas (Estándar / Normal / Emergencia), cada celda con un selector **Oculto · Opcional · Obligatorio**. Reglas:
- Solo aparecen los campos cuya obligatoriedad base es "Según tipo de cambio" (1.3.4.1.1) y los campos personalizados con esa opción.
- **Mínimo normativo bloqueado (celdas con 🔒 en Obligatorio):** para Normal y Emergencia, siempre obligatorios: *Título, Descripción, Motivo, Servicio, CI, Impacto, Urgencia, Fechas propuestas, Plan de implementación, Plan de rollback, Grupo implementador*; para Emergencia además *Justificación de emergencia* y *Consecuencia*. Para Estándar, el contenido proviene del modelo y se exige que el modelo los complete.
- Botones: `[Copiar columna de… ⟨Copy⟩]` (copiar la configuración de un tipo a otro) y `[Restaurar matriz de fábrica ⟨RotateCcw⟩]`.

**Sección 5 — Calendario y ventanas:** 
- *Política de ventana:* **Solo dentro de ventanas de mantenimiento** / **Puede salir de ventana con una etapa de aprobación adicional** / **Libre**. Fábrica: Estándar = dentro de ventana, Normal = puede salir con aprobación adicional, Emergencia = libre.
- *Períodos de congelamiento:* **Bloquear** / **Permitir con excepción aprobada (etapa "Excepción de congelamiento")** / **Ignorar**. Fábrica: Estándar = bloquear, Normal = excepción, Emergencia = excepción con ECAB.
- *Feriados:* **Bloquear** / **Advertir** / **Ignorar**.

**Sección 6 — Autorización:** muestra de solo lectura la secuencia de etapas resultante por nivel de riesgo (tomada de 1.3.4.2.2) con enlace `[Editar en Matriz de autoridad → ⟨ArrowUpRight⟩]`.

**Sección 7 — Revisión post-implementación:** *Obligatoria siempre* / *Solo si el resultado no es exitoso o hubo incidentes asociados* / *Opcional* / *Por muestreo (% configurable)*. Fábrica: Normal = siempre, Emergencia = siempre, Estándar = solo si falla (más muestreo 10 %).

**Sección 8 — Documentación retroactiva (solo Emergencia):** permitir registro retroactivo (sí/no), plazo máximo para completar la documentación (horas, fábrica 24) y obligatoriedad de autorización retroactiva por ECAB/CAB.

**Sección 9 — Integración con ejecución:** exigir implementador asignado antes de programar (sí/no) · exigir plan de comunicación cuando hay interrupción (sí/no) · exigir checklist Go/No-Go completa para iniciar (sí/no, fábrica sí).

**Botones:** `[Restaurar tipo a valores de fábrica ⟨RotateCcw⟩]` + patrón común.
**Validaciones:** Emergencia no puede tener anticipación mayor que Normal; Estándar no puede tener "Libre" en ventana si se exige modelo; todo valor numérico entero ≥ 0.

### 7.2 Pestaña 1.3.4.2.2 — Matriz de autoridad

**Qué se configura:** qué **etapas de aprobación** (catálogo de 1.3.4.3.3) se exigen según tipo, nivel de riesgo y otros criterios (ITIL 4: delegar la autoridad de cambio al nivel apropiado).

**Lista de reglas (orden = prioridad; gana la primera que coincida):** Orden · Nombre · Condiciones (resumen) · Etapas resultantes (chips ordenados, p. ej. `Técnica → Negocio → CAB`) · Activa. Botones `[+ Nueva regla ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]`, arrastre para reordenar, `[Simulador ⟨FlaskConical⟩]`.

**Editor de regla:**
- **Nombre**, **Activa**.
- **Condiciones** (constructor): tipo de cambio · nivel de riesgo (uno o varios) · prioridad · criticidad máxima de CI o servicio · entorno · categoría · ¿requiere interrupción? · ¿duración de interrupción mayor que X? · ¿fuera de ventana? · ¿dentro de congelamiento? · número de CI afectados mayor que N · origen.
- **Etapas resultantes:** lista ordenable tomada del catálogo de etapas; por cada etapa se puede cambiar el **modo** respecto de la anterior (*Secuencial* o *En paralelo*) y marcarla **Opcional si…** (condición).
- **Sin aprobación (preautorizado):** opción válida solo para tipo Estándar con modelo aprobado y riesgo fijo Bajo.

**Simulador:** el admin elige tipo, riesgo, criticidad, entorno, etc., y ve la regla que coincide y la secuencia de etapas.

**Reglas de validación:** debe existir una regla comodín final; Emergencia nunca puede resolverse con "Sin aprobación"; toda regla debe llevar al menos una etapa salvo la preautorizada; segregación de funciones: el sistema avisa si una etapa solo puede ser satisfecha por el solicitante (ver 1.3.4.3.3).

**Reglas de fábrica:**
| # | Condiciones | Etapas |
|---|---|---|
| 1 | Estándar, riesgo Bajo, modelo aprobado | Sin aprobación (autorización por modelo) |
| 2 | Estándar con riesgo distinto de Bajo | Se reclasifica a Normal (1.3.4.2.4) |
| 3 | Emergencia (cualquier riesgo) | ECAB; después, revisión retroactiva por CAB |
| 4 | Normal, riesgo Bajo | Técnica → Gestor de Cambios |
| 5 | Normal, riesgo Medio | Técnica → Negocio → Gestor de Cambios |
| 6 | Normal, riesgo Alto | Técnica → Negocio → CAB |
| 7 | Normal, riesgo Crítico | Técnica → Negocio → CAB → Dirección |
| 8 | Comodín | CAB |

### 7.3 Pestaña 1.3.4.2.3 — Modelos de cambio estándar

**Qué se configura:** el catálogo de cambios estándar preautorizados (ITIL 4: modelos de cambio).

**Lista:** Nombre · Código · Categoría · Estado del modelo (Borrador / En revisión / Aprobado / Suspendido / Retirado) · Vigencia · Propietario · Veces usado · % éxito · Última revisión. Filtros por estado y categoría. Botones: `[+ Nuevo modelo ⟨Plus⟩]`; por fila `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Enviar a revisión ⟨Send⟩]` `[Aprobar ⟨FlaskConical⟩]` `[Suspender ⟨Ban⟩]` `[Retirar ⟨Ban⟩]` `[Ver uso ⟨FileText⟩]` (RFC que lo usaron).

**Editor de modelo (pantalla completa con pestañas internas):**
1. **General:** nombre (5–80, único), código, descripción, categoría, propietario (usuario), vigencia desde–hasta, estado (solo cambia por botones de flujo).
2. **Alcance:** servicios o clases de CI a los que aplica (selector múltiple) y entornos permitidos.
3. **Riesgo y autoridad:** nivel de riesgo fijo (típicamente Bajo), si se **autoriza automáticamente** o requiere una aprobación mínima (selector de etapa), y a quién se notifica al registrarse.
4. **Elegibilidad:** lista de casillas que el solicitante debe confirmar (texto de cada una, obligatoria).
5. **Contenido prellenado:** descripción, motivo, plan de implementación (con pasos), plan de pruebas, plan de rollback, criterios de éxito, duración típica; cada campo con interruptor "Bloqueado".
6. **Programación:** ventanas permitidas, anticipación propia (sustituye a la del tipo si es menor), **límite de frecuencia** (máximo N por CI por día/semana y N globales por día).
7. **Tareas:** paquete de tareas y checklist (1.3.4.3.6).
8. **Control de calidad automático:** *suspender el modelo si la tasa de fallo ≥ X % o ≥ N fallos en los últimos M días* (interruptor y valores; fábrica 10 % / 2 fallos / 90 días); al suspenderse, las nuevas solicitudes con ese modelo se reclasifican a Normal y se notifica al propietario y al Gestor de Cambios.
9. **Revisión periódica:** cada N meses (fábrica 6) con recordatorio; si vence sin revisión pasa a *En revisión*.

**Flujo del modelo:** Borrador → En revisión (lo envía el propietario) → Aprobado (lo aprueba el Gestor de Cambios y, si así se configura, el CAB) → Suspendido/Retirado. Solo los modelos *Aprobados* y vigentes aparecen en el formulario. Cada modelo guarda versiones; una modificación de un modelo aprobado crea una versión nueva que vuelve a pasar por aprobación (las RFC existentes conservan la versión con la que se crearon).

**Estadísticas del modelo:** veces usado, éxito/fallo, incidentes asociados, último uso (panel de solo lectura).

**Reglas:** un modelo no puede aprobarse con campos obligatorios de su tipo (Estándar) vacíos, sin plan de rollback ni sin elegibilidad; el riesgo fijo no puede ser superior al máximo permitido para estándar (configurable en 1.3.4.2.4, fábrica: Bajo).

### 7.4 Pestaña 1.3.4.2.4 — Reglas de clasificación

**Qué se configura:** reglas automáticas que reclasifican el tipo, elevan la autoridad, bloquean o advierten (ITIL 4: *keep it simple* en lo de bajo riesgo y control en lo de alto riesgo).

**Lista de reglas (orden = prioridad):** Orden · Nombre · Cuándo se evalúa · Condiciones · Acciones · Activa · Veces aplicada. Botones `[+ Nueva regla ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` `[Simulador ⟨FlaskConical⟩]`. Interruptor global "Aplicar todas las reglas que coincidan" / "Detener en la primera".

**Editor:**
- **Cuándo se evalúa:** al enviar · al cambiar tipo · al cambiar riesgo · al cambiar fechas · al agregar CI.
- **Condiciones:** mismos campos que el constructor de 1.3.4.2.2 más: *modelo estándar usado*, *fuera de anticipación mínima*, *CI con criticidad ≥ X*, *servicio crítico*.
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


### 7.5 Validaciones de la pantalla 1.3.4.2 (cumple 3C)

| Propiedad / campo | Ventana interna | Tipo de dato | Validadores y regla |
|---|---|---|---|
| Nombre, descripción, color e ícono de un tipo | 1.3.4.2.1 Tipos de cambio | Texto | V-NOMBRE; V-TEXTO(0,250); V-HEX; ícono del catálogo |
| Anticipación mínima | 1.3.4.2.1 | Entero (horas) | V-ENTERO(0,8760); Emergencia ≤ Normal |
| Duración máxima de la ventana | 1.3.4.2.1 | Entero (horas) | V-HORAS (1–720) |
| Corte de agenda del CAB | 1.3.4.2.1 | Entero (horas) | V-ENTERO(0,720) |
| Caducidad de la autorización | 1.3.4.2.1 | Entero (días) | V-DIAS (0–365) |
| Plazo de documentación retroactiva | 1.3.4.2.1 | Entero (horas) | V-HORAS (1–168) |
| Porcentaje de muestreo de PIR | 1.3.4.2.1 | Porcentaje | V-PORC |
| Matriz de requisitos (Oculto / Opcional / Obligatorio) | 1.3.4.2.1 | Lista por celda | V-LISTA; las celdas con candado no se pueden bajar de Obligatorio |
| Nombre de regla de autoridad | 1.3.4.2.2 Matriz de autoridad | Texto | V-NOMBRE80 + V-UNICO |
| Umbrales (n.º de CI, duración de interrupción) | 1.3.4.2.2 | Enteros | V-ENTERO(1,1000); V-MIN |
| Etapas resultantes | 1.3.4.2.2 | Lista ordenada | V-MULTI(1,10); debe existir una regla comodín final |
| Nombre y código de modelo estándar | 1.3.4.2.3 Modelos | Texto | V-NOMBRE80 + V-UNICO; V-CODIGO + V-UNICO |
| Vigencia desde / hasta | 1.3.4.2.3 | Fechas | V-FECHA; V-RANGO-FECHAS |
| Límite de frecuencia por CI y global | 1.3.4.2.3 | Enteros | V-ENTERO(1,1000) |
| Umbral de suspensión: tasa de fallo, fallos y período | 1.3.4.2.3 | Porcentaje / enteros | V-PORC (1–100); V-ENTERO(1,100); V-DIAS (1–365) |
| Revisión periódica del modelo | 1.3.4.2.3 | Entero (meses) | V-MESES (1–60) |
| Ítems de elegibilidad | 1.3.4.2.3 | Texto | V-TEXTO(5,200); máximo 15 |
| Contenido prellenado del modelo | 1.3.4.2.3 | Texto enriquecido | V-RICO según el campo; el riesgo fijo no excede el máximo permitido |
| Nombre de regla de clasificación y mensaje al usuario | 1.3.4.2.4 Reglas de clasificación | Texto | V-NOMBRE80 + V-UNICO; V-TEXTO(5,250) |
| Condiciones numéricas y acciones | 1.3.4.2.4 | Enteros / listas | V-ENTERO; V-LISTA; sin acciones contradictorias |

---

## 8. PANTALLA 1.3.4.3 — FLUJO DE EVALUACIÓN, AUTORIZACIÓN Y REVISIÓN POSTERIOR

**Propósito:** definir el ciclo de vida del cambio (registro → evaluación → autorización → programación → implementación → revisión → cierre) y las reglas de control que lo gobiernan.

### 8.1 Pestaña 1.3.4.3.1 — Estados

**Tabla de estados (ordenable):**

| Columna | Detalle |
|---|---|
| Orden | Orden en filtros y selectores. |
| Nombre / Código | Único / inmutable. |
| Tipo | **Inicial** (exactamente 1) · **En evaluación** · **En autorización** · **Autorizado** · **Programado** · **En ejecución** · **Implementado** · **En pausa** · **Final**. |
| Color | Para insignias y calendario. |
| Reloj aplicable | **Evaluación** · **Autorización** · **Ninguno** (cuál de los plazos de 1.3.4.3.5 corre en ese estado) y si **corre / pausa / detiene**. |
| ¿Cuenta como abierto? | Sí/No. |
| ¿Permite editar la solicitud? | Sí / Solo comentarios y tareas / No. |
| ¿Aparece en el calendario? | Sí/No (los *Programado* y *En ejecución* siempre). |
| Aplica a tipos | Estándar / Normal / Emergencia (casillas). |
| Sistema (🔒) / Activo | |

**Botones:** `[+ Nuevo estado ⟨Plus⟩]` · por fila `[Editar ⟨SquarePen⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` · `[Reordenar ⟨ArrowUpDown⟩]` · patrón común.

**Reglas:** exactamente 1 estado Inicial, al menos 1 *Implementado* y 1 *Final*; los estados 🔒 (*Solicitado, Autorizado, Programado, En ejecución, Implementado, Cerrado, Rechazado, Cancelado*) no se eliminan ni cambian de tipo (sí se renombran y recolorean); un estado con tickets no se desactiva sin asistente de migración (3.4).
**Estados de fábrica:** sección 11.

### 8.2 Pestaña 1.3.4.3.2 — Transiciones y acciones

**Vistas:** *Matriz* (filas = origen, columnas = destino, clic para crear/editar), *Diagrama* (grafo automático de solo lectura con zoom y [Exportar PNG ⟨FileDown⟩], con filtro por tipo de cambio) y *Lista* (Acción · Origen → Destino · Aplica a tipos · Roles · Requisitos · Automatizaciones · Activa).

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
| Iniciar implementación | Programado → En ejecución | Todos | Implementador | Exige: Go/No-Go = Go, condiciones de aprobación cumplidas, sin congelamiento vigente, estar dentro de la ventana (± tolerancia de 1.3.4.4.5). Registra inicio real. |
| Registrar resultado | En ejecución → Implementado | Todos | Implementador | Exige resultado, fin real, bitácora, interrupción real; si resultado = Fallido o Rollback exige causa de fallo y dispara las acciones de 8.7. |
| Documentar emergencia retroactiva | Solicitado → Implementado | Emergencia | Gestor de Cambios, Supervisor, Técnico con permiso | Solo con `cambios.documentar_retroactivo`; exige los campos de la Sección G; crea etapa de autorización retroactiva. |
| Iniciar revisión | Implementado → En revisión post-implementación | Todos | Gestor de Cambios, Supervisor / Automática | Automática N horas después de *Implementado* (8.8). |
| Completar revisión y cerrar | En revisión post-implementación → Cerrado | Todos | Revisor | Exige PIR completa (si aplica), código de cierre, CMDB confirmada (8.7). |
| Cerrar sin revisión | Implementado → Cerrado | Estándar y los que el tipo permita | Gestor de Cambios, Supervisor | Solo si el resultado es exitoso y el tipo no exige PIR. |
| Cancelar | Cualquier estado anterior a *En ejecución* → Cancelado | Todos | Solicitante (si aún no está *En autorización*), Gestor de Cambios, Administrador | Exige motivo. Libera la ventana y notifica. |

### 8.3 Pestaña 1.3.4.3.3 — Etapas de aprobación y reglas de decisión

**Catálogo de etapas** (tabla): Orden sugerido · Nombre · Código · Tipo de aprobador · Regla de decisión · Plazo · Activa. Botones `[+ Nueva etapa ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Desactivar ⟨Ban⟩]` `[Eliminar ⟨Trash2⟩]` (solo si no está en uso en reglas ni RFC).

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

**Botones:** `[Simulador de etapas ⟨FlaskConical⟩]` (elegir tipo, riesgo, áreas, etc. y ver los aprobadores reales resueltos para cada etapa) + patrón común.

### 8.4 Pestaña 1.3.4.3.4 — Comités (CAB y comité de emergencia)

Dos paneles con la misma estructura: **CAB** y **ECAB**.

**Composición** (tabla): Usuario · Rol en el comité (**Presidente · Secretario · Miembro con voto · Consultor sin voto · Observador**) · Perfil de origen · Suplente (usuario) · Activo. Botones `[+ Agregar miembro ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Quitar ⟨Trash2⟩]`. Perfiles sugeridos: Gestor de Cambios (presidente), Aprobador, Supervisor, Gestor de Activos y Configuración (con voto); Auditor (observador sin voto); Gestor de Área (consultor/miembro cuando el cambio afecta su área). El sistema valida que haya exactamente 1 presidente activo y que el suplente no sea el mismo usuario.

**Reglas de decisión:**
- *Quórum:* número mínimo de miembros con voto presentes o votantes (CAB fábrica 3; ECAB fábrica 2) y obligación de que esté el presidente o su suplente.
- *Regla de aprobación:* **Mayoría simple · Mayoría calificada (2/3) · Unanimidad** (CAB fábrica mayoría simple; ECAB fábrica 2 de 3 convocados).
- *Empate:* **voto de calidad del presidente** / **aplazar**.
- *Voto asíncrono:* permitir votar sin reunión (sí/no) con plazo en horas; el sistema cierra la votación al alcanzar la regla o al vencer el plazo.
- *Opciones de dictamen:* Aprobar · Aprobar con condiciones · Rechazar · Aplazar · Solicitar más información (activables).
- *Abstenciones:* cuentan / no cuentan para el quórum.
- *Conflicto de interés:* el miembro que solicitó, implementa o pertenece al grupo implementador de la RFC **no vota** (se excluye automáticamente y se registra).

**Reuniones del CAB:** frecuencia (semanal/quincenal/mensual), día, hora, duración, lugar o enlace, **corte de agenda** (horas antes), generación automática de la agenda (RFC *En autorización* con etapa CAB pendiente, ordenadas por prioridad y fecha de inicio), recordatorio a miembros, plantilla de acta (texto con variables: fecha, asistentes, quórum, RFC tratadas, votos, dictamen, condiciones, observaciones) y generación de PDF. Botón `[Convocar reunión extraordinaria ⟨CalendarClock⟩]`.

**ECAB:** miembros mínimos convocados, **plazo máximo de decisión** por prioridad (horas), canal de convocatoria inmediata (notificación y correo), forma de **registrar decisión verbal** (campos: quién, medio, hora) y **obligación de revisión retroactiva** por el CAB en la siguiente reunión (sí/no, fábrica sí).

**Delegados por ausencia:** al convocar o votar, si un miembro tiene una ausencia vigente (tabla `tecnico_ausencias` si ya existe; si no existe, ver sección 13) o no responde en el plazo, interviene su suplente automáticamente.

**Datos que alimentan `5.2.1 Dictamen colegiado CAB`:** composición vigente, agenda, votos por miembro, dictamen, condiciones y acta.

**Botones:** `[Probar quórum ⟨FlaskConical⟩]` (simula quién puede votar una RFC dada) + patrón común.

### 8.5 Pestaña 1.3.4.3.5 — Plazos y escalamiento

**Tabla de plazos** (filas = prioridades P1–P4; unidad: horas; columnas por tipo si se desea con el selector "Ver por tipo: Todos/Estándar/Normal/Emergencia"):

| Columna | Detalle |
|---|---|
| Primera respuesta | Hasta iniciar la evaluación (o convocar el ECAB en Emergencia). |
| Evaluación | Hasta enviar a autorización. |
| Autorización total | Desde *En autorización* hasta *Autorizado*. |
| Plazo por etapa | Valor por defecto si la etapa no define el suyo (8.3). |

**Parámetros adicionales:** horas de diferencia a partir de las cuales una reprogramación **exige reautorización** (fábrica 24); tolerancia para iniciar la implementación fuera de la hora propuesta (minutos); vigencia de una autorización (ver 7.1, sección 3).

**Cómputo del tiempo:** los calendarios hábiles de `src/shared/lib/sla.ts`. No se crea un calendario laboral nuevo aquí (los feriados de 1.3.4.4.4 solo se usan para el calendario de cambios).

**Reglas de escalamiento** (lista y editor): Objetivo (Primera respuesta / Evaluación / Autorización / Etapa específica) · Prioridades · Umbral (porcentaje de plazo o "vencido +N horas") · Acciones: notificar a (solicitante, evaluador, aprobador pendiente, Gestor de Cambios, Supervisor, grupo, dirección) · reasignar al **suplente** · reasignar al **superior jerárquico** · subir prioridad · etiqueta `En riesgo` / `Vencido` · comentario del sistema · repetir cada N horas hasta M veces · detener cuando cambie el estado. **Nunca existe la acción "aprobar automáticamente" por vencimiento** (no es configurable).
Botón `[Simular escalamiento ⟨FlaskConical⟩]`.
**Fábrica:** 75 % → recordar al aprobador; 90 % → notificar al suplente y al Gestor de Cambios; 100 % → etiqueta *Vencido* + escalar al superior; en Emergencia, a los 30 minutos sin decisión del ECAB → notificar a dirección.

### 8.6 Pestaña 1.3.4.3.6 — Tareas y checklists

**Sección A — Catálogo de tareas** (tabla): Nombre · Fase (**Pre-implementación · Implementación · Validación · Post-implementación**) · Tipo · Responsable (rol/grupo/"implementador") · Duración · Obligatoria · Activa. Editor: nombre, descripción, fase, responsable, duración, **vence a ±N horas respecto del inicio de la ventana** (offset positivo o negativo), obligatoria, **bloquea la transición** (selector), checklist interno, dependencia (finaliza-para-iniciar). Botones `[+ Nueva tarea ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Desactivar ⟨Ban⟩]` `[Eliminar ⟨Trash2⟩]`.

**Sección B — Paquetes de tareas** (tabla): Nombre · Tareas · Se aplica cuando (tipo, categoría, riesgo, modelo, plantilla, estado de entrada) · Activo. Editor: arrastrar tareas del catálogo, orden y dependencias. `[Probar paquete ⟨FlaskConical⟩]`.

**Sección C — Checklist Go/No-Go** (editable): lista de ítems con texto, obligatorio, responsable, evidencia requerida (sí/no) y tipos de cambio a los que aplica. De fábrica: sección 11. Configuración del resultado: *Go* solo si todos los ítems obligatorios están marcados; *No-Go* exige motivo y devuelve la RFC a *Autorizado* para reprogramar.

**Sección D — Conversión del plan en tareas:** interruptor "Convertir los pasos del plan de implementación en tareas al programar" (activo) y fase por defecto de esas tareas.

### 8.7 Pestaña 1.3.4.3.7 — Implementación y cierre

**Bloque 1 — Resultado y bitácora:** campos exigidos al registrar resultado según el catálogo (6.3); obligatoriedad de bitácora de ejecución (sí/no); tolerancia de inicio y fin respecto a la ventana; exigir motivo si la ejecución supera la ventana.

**Bloque 2 — Acciones automáticas por resultado** (tabla: resultado → acciones, cada una activable):
- *Fallido / Rollback ejecutado:* exigir causa de fallo · crear **incidente** vinculado (plantilla, prioridad heredada) · crear **problema** (plantilla del Prompt 1 si existe) cuando la causa de fallo lo sugiere · notificar a Gestor de Cambios, Supervisor y responsables de servicios · etiquetar la RFC y los CI · **suspender el modelo estándar** si aplica (7.3) · forzar PIR obligatoria.
- *Parcial:* exigir descripción de lo pendiente y crear RFC de seguimiento (opcional).
- *Exitoso:* programar PIR según el tipo.

**Bloque 3 — Actualización de CMDB (ITIL 4: Service Configuration Management):**
- `Exigir plan de actualización de CMDB` (lista de cambios sobre CI: CI, atributo, valor nuevo) antes de *Programar* (sí/no, fábrica sí cuando el cambio modifica atributos).
- `Aplicar automáticamente a la CMDB al registrar resultado Exitoso` (sí/no, fábrica no: la aplica el Gestor de Activos y Configuración con **[Aplicar a la CMDB ⟨CircleCheck⟩]**).
- `Bloquear el cierre si hay actualizaciones de CMDB pendientes` (sí).
- Notificar al Gestor de Activos y Configuración cuando haya actualizaciones pendientes.

**Bloque 4 — Cierre:** exigir código de cierre (catálogo) · exigir resumen · cierre automático N días después de *Implementado* si el tipo no exige PIR (fábrica 5) · reglas de reapertura: no se reabre una RFC cerrada (se crea otra vinculada); excepción por el Gestor de Cambios dentro de N días con motivo.
**Botones:** `[Vista previa de modales ⟨Eye⟩]` + patrón común.

### 8.8 Pestaña 1.3.4.3.8 — Revisión post-implementación (PIR)

**Cuándo es obligatoria:** se rige por el tipo (7.1), el resultado, el riesgo ≥ X y las reglas de muestreo; esta pestaña muestra la tabla consolidada tipo × resultado × riesgo → obligatoria (sí/no) y la edita.
**Parámetros:** plazo para completarla (días tras *Implementado*, fábrica 5) · quién revisa (Gestor de Cambios / Supervisor / perfil concreto; **nunca el implementador**) · **ventana de observación de incidentes** (horas tras el fin real, fábrica 72) para detectar automáticamente los incidentes creados sobre los CI afectados · calificaciones (Exitoso / Con observaciones / Fallido) · bloqueo del cierre hasta completar la PIR (sí).
**Plantilla de preguntas (editable):** lista con texto, tipo de respuesta (texto, sí/no, lista, escala), obligatoriedad y tipos a los que aplica. `[+ Agregar pregunta ⟨Plus⟩]` `[Reordenar ⟨ArrowUpDown⟩]` `[Desactivar ⟨Ban⟩]`. Fábrica: sección 11.
**Acciones de mejora:** crear tareas de seguimiento con responsable y fecha (activo); exportar informe PDF.
**Botones:** `[Vista previa de la PIR ⟨Eye⟩]` + patrón común.


### 8.9 Validaciones de la pantalla 1.3.4.3 (cumple 3C)

| Propiedad / campo | Ventana interna | Tipo de dato | Validadores y regla |
|---|---|---|---|
| Nombre, código, color y descripción de estado | 1.3.4.3.1 Estados | Texto | V-TEXTO(3,30) + V-UNICO; V-CODIGO; V-HEX; V-TEXTO(0,150) |
| Tipo, relojes y tipos de cambio que lo usan | 1.3.4.3.1 | Listas / casillas | V-LISTA; 1 estado Inicial, ≥ 1 Implementado y ≥ 1 Final; al menos un tipo marcado |
| Nombre de acción, estados origen/destino, perfiles | 1.3.4.3.2 Transiciones | Texto / selección | V-TEXTO(3,30); V-MULTI(1,20); V-REF; V-MULTI(1,20) |
| Condiciones previas, campos obligatorios, texto de confirmación | 1.3.4.3.2 | Constructor / texto | Constructor sin ciclos; V-TEXTO(5,250) |
| Nombre, código y descripción de etapa | 1.3.4.3.3 Etapas | Texto | V-NOMBRE + V-UNICO; V-CODIGO; V-TEXTO(0,250) |
| Plazo de respuesta de la etapa | 1.3.4.3.3 | Entero (horas) | V-HORAS (1–720) |
| Regla «mínimo N de M» | 1.3.4.3.3 | Enteros | V-ENTERO(1,M) con N ≤ M |
| Duración máxima de delegación | 1.3.4.3.3 | Entero (días) | V-ENTERO(1,90) |
| Aprobador de respaldo | 1.3.4.3.3 | Referencia | V-REF (perfil o usuario activo, distinto del solicitante por defecto) |
| Miembros y rol en el comité; suplente | 1.3.4.3.4 Comités | Referencias | V-REF; exactamente 1 presidente activo; suplente ≠ titular |
| Quórum | 1.3.4.3.4 | Entero | V-ENTERO(1,N) con N = miembros con voto |
| Plazo del voto asíncrono | 1.3.4.3.4 | Entero (horas) | V-HORAS (1–168) |
| Frecuencia, día y hora de reunión; duración | 1.3.4.3.4 | Listas / hora / entero | V-LISTA; V-HORA; V-MIN (15–480) |
| Lugar o enlace de reunión | 1.3.4.3.4 | Texto / URL | V-TEXTO(3,150) o V-URL |
| Plantilla de acta | 1.3.4.3.4 | Texto enriquecido | V-RICO(20,5000) con variables válidas |
| Plazos por prioridad (primera respuesta, evaluación, autorización, por etapa) | 1.3.4.3.5 Plazos y escalamiento | Enteros (horas) | V-HORAS por celda; primera respuesta ≤ evaluación ≤ autorización |
| Horas para exigir reautorización; tolerancia de inicio | 1.3.4.3.5 | Entero | V-HORAS; V-MIN (0–240) |
| Umbral, repetición y máximo de veces del escalamiento | 1.3.4.3.5 | Enteros | V-ENTERO(1,300) %; V-ENTERO(1,168); V-ENTERO(1,20) |
| Nombre, descripción, fase y duración de tarea | 1.3.4.3.6 Tareas y checklists | Texto / lista / entero | V-TEXTO(3,80); V-TEXTO(0,500); V-LISTA; V-MIN |
| Vencimiento relativo al inicio de la ventana | 1.3.4.3.6 | Entero (horas) | V-ENTERO(-720,720) |
| Ítems Go/No-Go | 1.3.4.3.6 | Texto | V-TEXTO(3,150); máximo 30 |
| Tolerancia de ventana; cierre automático | 1.3.4.3.7 Implementación y cierre | Enteros | V-MIN (0–240); V-DIAS (1–30) |
| Años de retención del registro | 1.3.4.3.7 | Entero | V-ENTERO(1,30) |
| Plazo para completar la PIR; ventana de observación | 1.3.4.3.8 PIR | Enteros | V-DIAS (1–30); V-HORAS (1–720) |
| Preguntas de la PIR | 1.3.4.3.8 | Texto | V-TEXTO(5,200) + V-UNICO; máximo 20 |

---

## 9. PANTALLA 1.3.4.4 — NOTIFICACIONES Y CALENDARIO DE CAMBIOS

**Propósito:** definir quién se entera de qué y cuándo, y gobernar el calendario de cambios (ventanas, congelamientos, feriados, conflictos y capacidad).
**Nota:** `src/shared/lib/sla.ts` ya usa calendarios hábiles; verifica en la Etapa 0 qué tabla de feriados lee y reutilízala. La tabla de feriados es la que ya lee el motor de SLA (se reutiliza); solo se crean, si faltan, las tablas de ventanas de mantenimiento y de períodos de congelamiento (`ventanas_mantenimiento`, `periodos_congelamiento`; sección 13). No modifiques el motor de SLA existente.

### 9.1 Pestaña 1.3.4.4.1 — Notificaciones

**Cuadrícula:** una fila por **evento** y las columnas: Evento · Activo · Canal(es) (según los canales de 1.6.1) · Destinatarios · Plantilla (selector de 1.6.1) · Condiciones (tipo, riesgo, prioridad) · Anticipación (si aplica). Botón `[Editar ⟨SquarePen⟩]` por fila, `[Enviar prueba ⟨FlaskConical⟩]` y `[Vista previa ⟨Eye⟩]`.

**Eventos:** `rfc.solicitada` · `rfc.evaluacion_iniciada` · `rfc.informacion_solicitada` · `rfc.informacion_respondida` · `rfc.enviada_a_autorizacion` · `rfc.etapa_pendiente` (al aprobador) · `rfc.etapa_aprobada` · `rfc.aprobada` · `rfc.aprobada_con_condiciones` · `rfc.rechazada` · `rfc.reenviada` · `cab.convocado` (agenda) · `cab.dictamen_emitido` · `ecab.convocado` · `rfc.programada` · `rfc.reprogramada` · `rfc.recordatorio_previo` (T-48 h, T-24 h, T-1 h; configurables) · `rfc.implementacion_iniciada` · `rfc.resultado_registrado` · `rfc.fallida` · `rfc.rollback_ejecutado` · `rfc.pir_pendiente` · `rfc.cerrada` · `rfc.cancelada` · `rfc.conflicto_detectado` · `rfc.emergencia_registrada` · `rfc.aprobacion_proxima_a_vencer` · `rfc.aprobacion_vencida` · `rfc.autorizacion_caducada` · `modelo_estandar.suspendido` · `congelamiento.proximo` · `ventana.proxima`.

**Destinatarios disponibles:** solicitante · implementador · equipo implementador · evaluador · aprobadores de la etapa · miembros del comité · Gestor de Cambios · Supervisor del grupo · responsables de los servicios afectados · Gestores de Área de las áreas afectadas · Gestor de Activos y Configuración (CMDB) · **usuarios de las áreas afectadas** (comunicado de interrupción) · seguidores · usuarios o perfiles concretos.

**Comunicado de interrupción a usuarios:** interruptor, plantilla, momentos de envío (fábrica T-48 h y T-2 h) y audiencia (áreas afectadas de la RFC); se genera solo si `requiere_interrupcion = Sí` y la RFC está *Programada*.
**Opciones:** agrupar avisos en resumen diario (digest) para eventos de baja urgencia · horas de silencio (excepto emergencias) · no notificar al propio autor de la acción.
**Regla:** los eventos de Emergencia y de fallo no pueden desactivarse para el Gestor de Cambios.

### 9.2 Pestaña 1.3.4.4.2 — Ventanas de mantenimiento

**Lista:** Nombre · Recurrencia · Horario · Aplica a · Tipos permitidos · Capacidad · Vigencia · Activa. Botones `[+ Nueva ventana ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]`, vista previa en calendario.

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

### 9.3 Pestaña 1.3.4.4.3 — Períodos de congelamiento

**Lista:** Nombre · Motivo · Inicio–Fin · Alcance · Severidad · Recurrencia · Activo. Botones `[+ Nuevo período ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` `[Importar CSV ⟨FileUp⟩]` `[Exportar CSV ⟨FileDown⟩]`.
**Editor:** nombre; motivo (lista editable: cierre contable, campaña, fin de año, evento institucional, auditoría, otro) y descripción; inicio y fin (fecha y hora) o recurrencia anual (mes/día); **alcance** (toda la organización / servicios / CI / departamentos); **severidad**: *Bloqueo total* (solo Emergencia con ECAB) · *Bloqueo con excepción* (requiere la etapa "Excepción de congelamiento") · *Advertencia*; **tipos exentos**; aviso anticipado a Gestor de Cambios y solicitantes (días antes); color.
**Efecto:** el formulario (E6), `Programar` e `Iniciar implementación` consultan estos períodos en el servidor.

### 9.4 Pestaña 1.3.4.4.4 — Feriados y días no laborables

**Lista:** Fecha · Nombre · Tipo (nacional/institucional/otro) · Alcance (toda la organización/sede) · Recurrente anual · Activo. Botones `[+ Nuevo feriado ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Eliminar ⟨Trash2⟩]` `[Importar CSV ⟨FileUp⟩]` (plantilla descargable con vista previa de errores) `[Exportar CSV ⟨FileDown⟩]`. Soporta rangos de fechas.
**Política:** *Bloquear / Advertir / Ignorar* cambios en feriados (valor por tipo en 7.1) y fin de semana (sí/no, definible como "días no laborables" de la semana).
**Nota:** la tabla es compartida y queda disponible para otros procesos.

### 9.5 Pestaña 1.3.4.4.5 — Conflictos y capacidad

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
**Botón `[Simulador ⟨FlaskConical⟩]`:** elegir fecha, hora, duración, servicio y CI; muestra conflictos y huecos libres. El cálculo de solapamientos se hace con rangos de tiempo en la base de datos (ver 13.5).

### 9.6 Pestaña 1.3.4.4.6 — Presentación del calendario

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
**Botones:** `[Vista previa ⟨Eye⟩]` + patrón común.


### 9.7 Validaciones de la pantalla 1.3.4.4 (cumple 3C)

| Propiedad / campo | Ventana interna | Tipo de dato | Validadores y regla |
|---|---|---|---|
| Anticipaciones de recordatorio | 1.3.4.4.1 Notificaciones | Lista de enteros (horas) | V-ENTERO(1,720), sin repetidos, orden descendente, máximo 6 |
| Plantilla, canales y destinatarios | 1.3.4.4.1 | Referencias | V-REF; V-MULTI(1,20) |
| Horas de silencio | 1.3.4.4.1 | Horas | V-HORA; inicio ≠ fin |
| Momentos del comunicado de interrupción | 1.3.4.4.1 | Lista de enteros (horas) | V-ENTERO(1,720), máximo 4 |
| Nombre y código de ventana | 1.3.4.4.2 Ventanas | Texto | V-NOMBRE80 + V-UNICO; V-CODIGO |
| Hora de inicio y fin | 1.3.4.4.2 | Horas | V-HORA; inicio ≠ fin (se permite cruzar la medianoche) |
| Días de la semana / día del mes | 1.3.4.4.2 | Selección | V-MULTI(1,7); V-ENTERO(1,31) |
| Vigencia y excepciones | 1.3.4.4.2 | Fechas | V-FECHA; V-RANGO-FECHAS |
| Capacidad por ventana | 1.3.4.4.2 | Entero | V-ENTERO(1,100) |
| Nombre, motivo y descripción del congelamiento | 1.3.4.4.3 Congelamiento | Texto | V-NOMBRE80; V-LISTA; V-TEXTO(0,250) |
| Inicio y fin del período | 1.3.4.4.3 | Fecha y hora | V-FECHAHORA; V-RANGO-FECHAS |
| Recurrencia anual (mes y día) | 1.3.4.4.3 | Listas | V-LISTA; día válido para el mes |
| Aviso anticipado | 1.3.4.4.3 | Entero (días) | V-ENTERO(0,90) |
| Archivo CSV de congelamientos | 1.3.4.4.3 | Archivo | V-ARCHIVO (.csv, ≤ 5 MB, ≤ 2000 filas) |
| Fecha y nombre de feriado | 1.3.4.4.4 Feriados | Fecha / texto | V-FECHA única por alcance; V-NOMBRE |
| Rango de feriado | 1.3.4.4.4 | Fechas | V-RANGO-FECHAS (fin ≥ inicio) |
| Archivo CSV de feriados | 1.3.4.4.4 | Archivo | V-ARCHIVO (.csv, ≤ 5 MB) |
| Colchón entre cambios | 1.3.4.4.5 Conflictos y capacidad | Entero (min) | V-ENTERO(0,1440) |
| Máximos simultáneos (global, por servicio, por CI, por día) | 1.3.4.4.5 | Enteros | V-ENTERO(1,100) |
| Profundidad de relaciones | 1.3.4.4.5 | Entero | V-ENTERO(1,3) |
| Duración máxima de una RFC | 1.3.4.4.5 | Entero (horas) | V-HORAS (1–720) |
| Colores del calendario | 1.3.4.4.6 Presentación | Color | V-HEX |
| Caducidad del token ICS | 1.3.4.4.6 | Entero (días) | V-ENTERO(1,365) |
| Recordatorios previos | 1.3.4.4.6 | Lista de enteros (horas) | V-ENTERO(1,720), sin repetidos |

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
| `config.cambios.calendario.editar` / `.publicar` (solo 1.3.4.4.2 a 1.3.4.4.4) | ✔ | — | — | — | — | — | — | ✔ | — | — |
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

**Notas:** el Administrador **no aprueba ni dictamina** por defecto (segregación de funciones). Pertenecer a un comité (CAB/ECAB) se define en 1.3.4.3.4 y no equivale a un perfil. Los perfiles se resuelven con el mecanismo de permisos ya existente en el proyecto; si ese mecanismo no maneja permisos por acción, repórtalo en la Etapa 0.

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

### 12.0 Hechos de arquitectura (ver `ARQUITECTURA_Y_CODIGO.md`)
- **Framework:** Next.js 14 (App Router); pantallas en `src/app/plataforma/`, API en `src/app/api/`. Sesión con cookie `sesion` (JWT) y perfil activo conmutable (`/api/auth/cambiar-perfil`). Menú dinámico desde `/api/menu` + `src/shared/lib/menu.ts`.
- **Base de datos:** pool `pg` de `src/shared/lib/db.ts`; sin acceso directo desde el cliente.
- **Validaciones:** `src/shared/lib/validaciones.ts` y `src/shared/components/ui/AlertaCampo.tsx` (solo errores en rojo).
- **SLA:** `src/shared/lib/sla.ts` (matriz Urgencia × Impacto y **calendarios hábiles**); edición en `1.2.5 Objetivos SLA` (`/admin/servicios/sla`, `MatrizPrioridadSla.tsx`, `/api/admin/sla/matriz`), ubicación probable de la matriz compartida.
- **Cambios:** pantallas operativas bajo `/cambios/gestion/*`; configuración bajo `/admin/procesos/cambios/*`; componentes `Iconos.tsx` duplicados en `flujo-evaluacion` y `notificaciones-calendario`; modales comunes duplicados con los de problemas.
- **Heredado:** `/admin/rfc` y `ConfiguracionRfc.tsx` (configuración antigua de RFC).
- **Ticket de incidente:** presentadores por rol y secciones como `TarjetaAprobacionSod` (segregación de funciones en aprobaciones), `CockpitTemporizadorSla`, `PanelInfraestructuraCi`; reutiliza esos patrones en el ticket de RFC.


| Tema | Lo confirmado |
|---|---|
| Stack | Next.js 14 (App Router) y PostgreSQL en Supabase (pool `pg` de `src/shared/lib/db.ts`); acceso completo al código, base de datos, frontend y backend. |
| Matriz impacto × urgencia | Existe y se usa al crear incidentes (P1–P4; niveles Alta/Media/Baja). Ubicación probable: `1.2.5 Objetivos SLA` (`/admin/servicios/sla`, `MatrizPrioridadSla.tsx`, API `/api/admin/sla/matriz`) y cálculo en `src/shared/lib/sla.ts`; confírmalo en la Etapa 0. Los cambios la reutilizan. |
| 1.2.5 Objetivos SLA | Solo tiene la "Matriz Institucional de Tiempos por Prioridad" (primera respuesta y resolución en horas). Los plazos de cambios (8.5) **no** se registran ahí. |
| Formulario de Incidentes y creador de campos | Existen; se extienden a la entidad `cambio`. |
| Perfiles | Administrador, Técnico, Solicitante, Supervisor, Gestor de Área, Auditor, Aprobador, Gestor de Cambios, Gestor de Activos y Configuración. (Gestor de Problemas lo crea el Prompt 1.) |
| Calendarios, feriados, ventanas, congelamientos | `src/shared/lib/sla.ts` ya usa **calendarios hábiles**; verifica qué tablas de horario y feriados lee. Las pestañas `PestanaFeriados`, `PestanaVentanasMantenimiento` y `PestanaPeriodosCongelamiento` ya existen: **reutiliza la tabla de feriados del motor de SLA** y crea solo lo que falte (ventanas y congelamientos). |
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

**13.3 Seguridad:** permisos de la sección 10 como datos semilla. Las tablas de historial, votos y auditoría no admiten UPDATE ni DELETE (triggers de base de datos y ausencia de endpoints de edición).

**13.4 Tablas de calendario (reutiliza lo existente de `src/shared/lib/sla.ts` y crea solo lo que falte):**
- Feriados: usa la tabla que ya lee `src/shared/lib/sla.ts`; si no existe, crea `calendario_feriados` (fecha o rango, nombre, tipo, alcance, recurrente anual, activo).
- `ventanas_mantenimiento` (recurrencia —regla tipo iCal o campos estructurados—, inicio/fin, cruce de medianoche, vigencia, excepciones, alcance, tipos permitidos, capacidad, permite interrupción).
- `periodos_congelamiento` (inicio, fin o recurrencia anual, alcance, severidad, tipos exentos, aviso anticipado).
- Parámetro de **zona horaria del sistema** (verifica si ya existe en la configuración; si no, créalo).

**13.5 Rangos de tiempo y conflictos:** en `cambios` guarda la ventana propuesta/aprobada/real como columnas `tstzrange` con **índice GiST** para detectar solapamientos con el operador `&&`; considera `btree_gist` si hay combinaciones con igualdad. Los conflictos son advertencias/bloqueos de negocio, **no** restricciones de exclusión de la base de datos.

**13.6 Columnas que probablemente falten (verifica y agrega):** servicio: criticidad (`es_critico` o nivel) y, opcionalmente, `responsable_servicio_id` · CI: `clase`, `criticidad`, `estado` y relaciones entre CI (coordinar con el Prompt 3) · incidente: referencia a la RFC que lo causó (`causado_por_cambio_id` o tabla puente) · entidad `cambio` en la definición de campos personalizados · `tecnico_ausencias` (si no existe) · bandera de "es incidente de emergencia" si se usa en 1.3.4.4.

**13.7 Búsqueda:** índices de texto completo en español (`to_tsvector('spanish', …)` y `pg_trgm`) para detectar RFC similares.

**13.8 Tareas programadas** (usa el mecanismo de jobs existente; si no hay, propón —sin implementar sin aprobación— `pg_cron`, Edge Functions de Supabase o cron de Next.js): recordatorios previos a la ventana · recordatorios y escalamiento de aprobaciones · caducidad de autorizaciones · generación de agenda de CAB y recordatorios · cierre de votaciones asíncronas · reevaluación periódica de conflictos · comunicados de interrupción · inicio automático de PIR y alerta de PIR vencidas · revisión periódica y suspensión de modelos estándar · cierre automático · aviso de períodos de congelamiento próximos.

**13.9 Semillas:** todo lo de la sección 11 mediante migración idempotente.

---

## 14. Criterios de aceptación

1. El menú muestra `1.3.4.1 Configuración de formulario`, `1.3.4.2`, `1.3.4.3` y `1.3.4.4` con las pestañas numeradas de la sección 2.3.
2. Todas las pestañas usan el patrón común (borrador, vista previa, publicación con diff y motivo, versionado, restauración, importación/exportación, bloqueo concurrente).
3. El editor de formulario y el creador de campos de cambios son **el mismo componente** que usa Incidentes, extendido; Incidentes sigue funcionando igual.
4. Un campo bloqueado (Título, Tipo, Motivo, Descripción, Servicio, CI, Impacto, Urgencia, Fechas, Plan de implementación, Plan de rollback, Grupo implementador) no puede ocultarse; el mínimo normativo de Normal y Emergencia no puede bajarse.
5. La obligatoriedad "Según tipo de cambio" se resuelve con la matriz de 1.3.4.2.1 y el formulario cambia al elegir otro tipo.
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
26. Los feriados usan la misma tabla que lee `src/shared/lib/sla.ts`; las ventanas y los congelamientos existen y no alteran el motor de SLA.
27. Toda acción de configuración queda en `1.8.1 Auditoría de cambios` con usuario, antes/después y motivo; los historiales de RFC y votos son inmutables.
28. Los permisos de la sección 10 se cumplen; `editar` sin `publicar` no habilita el botón Publicar; el Administrador no puede aprobar ni dictaminar.
29. El formulario y el ticket reflejan exactamente las secciones 4 y 5 con los valores de fábrica.
30. La zona horaria del sistema se respeta en ventanas recurrentes, recordatorios y calendario.
31. Ninguna ventana interna de las pantallas 1.3.4.x repite un ítem del menú; las ventanas internas existentes están en `?vista=` y no alteran el ítem activo del menú (3A).
32. Los botones y las acciones de fila usan los íconos de 3B.4, con tooltip y `aria-label`, y el estilo de botones de la sección 3B.1.
33. Todos los campos de los formularios y de las pantallas de configuración tienen validación en tiempo real con los validadores de 3C; **no aparece ningún indicador de éxito**; los errores usan `AlertaCampo`.
34. Cambiar el valor de un selector que gobierna otro campo (por ejemplo tipo de documento) cambia al instante el validador, la máscara y el `maxLength` del campo dependiente.
35. El servidor repite las mismas validaciones y devuelve `400` con `{ campo, mensaje }`, que la interfaz muestra en el campo.
36. Los modales y la barra de acciones comunes existen una sola vez y los usan los módulos de problemas, cambios y activos; los `Iconos.tsx` duplicados fueron unificados.

---

## 15. Etapa 0 — Reconocimiento obligatorio y preguntas abiertas

**Punto de partida de la Etapa 0 (según el árbol de archivos):** el informe debe incluir una **tabla de diferencias** entre este documento y lo ya implementado en `/admin/procesos/cambios/*` (2.2 y 2.3): por cada ventana interna indica existe / falta / incompleta, qué validadores (3C) e íconos (3B) le faltan y qué elementos duplican ítems del menú (3A). Indica además qué calendario y qué feriados usa realmente `src/shared/lib/sla.ts` y si `/admin/rfc` puede retirarse.

**Antes de escribir código**, revisa el repositorio y la base de datos y entrégame un **informe** (sin modificar nada) con:

1. **Matriz de prioridad:** dónde está, cómo se consume, si tiene pantalla de edición.
2. **Motor de SLA:** dónde está y si cuenta horas corridas u hábiles; cómo se pausan y reanudan relojes.
3. **Componentes reutilizables:** editor de formulario de 1.3.1.1, creador de campos, constructor de reglas, motor de estados de Incidentes, componente de borrador/publicación/versionado (si el Prompt 1 ya lo creó), sistema de notificaciones (1.6) y si admite destinatarios dinámicos y plantillas por evento, jobs programados, componentes de UI (tablas, modales, calendario, arrastrar-y-soltar).
4. **Perfiles y permisos:** cómo se almacenan y verifican en `src/middleware.ts`, `src/shared/lib/menu.ts`, `src/shared/lib/page-auth.ts` y los Route Handlers.
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
Gestión de problemas → Prompt 1 · Activos y CMDB (clases, relaciones, ciclos de vida) → Prompt 3 · Bandejas, tableros y reportes del módulo · Modificar el SLA por servicio o la matriz de 1.2.5 · Integraciones con herramientas externas de despliegue (CI/CD) o monitoreo · Gestión de proyectos y de liberaciones (release/deployment) más allá del origen "Proyecto".

---

## Parte III — Activos y CMDB

### Contexto específico (apartados 2.3 y 2.4 del prompt original)

### 2.3 Estado actual de la implementación (según el árbol de archivos del repositorio)
| Pantalla | Ya existe | Falta o hay que corregir |
|---|---|---|
| `/admin/activos-config/page.tsx` | Página padre | Debe redirigir al primer hijo; no repetir los 4 ítems del menú como pestañas. |
| `1.5.1` | `page.tsx` y las 9 ventanas | Auditar contra la sección 6; validaciones (3C), íconos (3B). |
| `1.5.2` | `page.tsx` y las 6 ventanas | Auditar contra la sección 7. |
| `1.5.3` | `page.tsx` y las 6 ventanas | Auditar contra la sección 8. |
| `1.5.4` | `page.tsx` y las 6 ventanas | Auditar contra la sección 9. |
| API de configuración | `/api/admin/activos-config/{tipos-modelos-atributos,ciclos-vida-transiciones,licencias-contratos,cmdb-relaciones}/configuracion` y `/api/admin/cmdb/tipos` | Verificar versionado (borrador/publicación) y auditoría. |
| Modales y barra comunes | Existen en `problemas/formulario` y `cambios/formulario` | Importarlos desde la ubicación compartida (3A.2.6). |

### 2.4 Pantallas operativas que consumen esta configuración
| Menú general | Ruta | Archivos |
|---|---|---|
| 7.1 Inventario de activos (HAM) | `/activos/inventario` | `src/app/plataforma/activos/inventario/page.tsx` |
| 7.2 Mapa de topología CMDB | `/activos/cmdb` | `.../activos/cmdb/page.tsx` |
| 7.3 Licencias de software (SAM) | `/activos/licencias` | `.../activos/licencias/page.tsx` |
| 7.4 Modelado de clases CI | `/activos/cmdb/tipos` | `.../activos/cmdb/tipos/page.tsx` |
| 8 Proveedores y Contratos TI | `/proveedores` | `src/app/plataforma/proveedores/*` |
| Técnico M6.1 a M6.5 | `/plataforma/perfiles/tecnico/activos/{inventario,mapa,mantenimiento,conteos,licencias}` | `src/app/plataforma/perfiles/tecnico/activos/*` |
| API de operación | `/api/activos/*` | `src/app/api/activos/*` |
Las secciones 4 y 5 describen lo que esas pantallas deben mostrar; si algo difiere, aplica la pregunta 1 de la sección 15.

---

## 4. ESPECIFICACIÓN DE LOS FORMULARIOS (lo que ve el usuario)

Los activos **no son tickets**: no tienen prioridad ni SLA; tienen **estado de ciclo de vida**. Esta sección define la **versión de fábrica** de tres formularios: activo (4.1), licencia (4.2) y contrato (4.3). Las secciones 6 a 9 definen cómo el administrador los modifica.

### 4.1 Formulario de activo / CI

**Quién lo usa:** perfil **Gestor de Activos y Configuración** y **Administrador** (permiso `activos.crear`). El perfil **Técnico** puede editar solo los atributos técnicos (`activos.editar_tecnico`).
**Dónde:** `7 Activos y CMDB > 7.1 Inventario de activos (HAM) > [+ Nuevo activo ⟨Plus⟩]`; también desde la recepción de una solicitud de adquisición (1.5.2.4) y desde la importación masiva (1.5.1.9).
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
Se genera con los atributos definidos en 1.5.1.3. Ejemplos de fábrica: *Hardware:* procesador, RAM, disco, sistema operativo, dirección IP, dirección MAC. *Software/licencia:* versión, edición, tipo de licencia, cantidad total y en uso, fecha de vencimiento, clave (sensible). *Red:* puertos, firmware, VLAN. Los atributos marcados "sensibles" se muestran enmascarados con botón **[Mostrar ⟨Eye⟩]** (requiere permiso y queda auditado).

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

**Botones del formulario:** **[Guardar ⟨Save⟩]** (primario) · **[Guardar y crear otro ⟨Save⟩]** · **[Guardar y asignar… ⟨Save⟩]** (abre la transición *Asignar*) · **[Duplicar activo ⟨Copy⟩]** (copia atributos, limpia código, serie, hostname, IP y MAC) · **[Imprimir etiqueta ⟨Printer⟩]** (tras guardar) · **[Cancelar ⟨X⟩]**.

**Validaciones (también en servidor):** obligatorios según clase/tipo/estado; unicidad de código, serie (por fabricante), hostname e IP (si el atributo está marcado único); formato de IP/MAC; garantía fin ≥ inicio; fecha de compra ≤ recepción; custodio obligatorio si hay asignación; ubicación en una ubicación activa; no se permite elegir un estado distinto del inicial al crear; si hay `relaciones`, ambos extremos deben existir y estar activos.

### 4.2 Formulario de licencia (SAM)

**Dónde:** `7.3 Licencias de software (SAM) > [+ Nueva licencia ⟨Plus⟩]`. **Usan:** Gestor de Activos y Configuración, Administrador.

| Sección | Campos |
|---|---|
| **Identificación** | Código de licencia (automático) · Nombre del producto * · Fabricante/editor * · Versión y edición · Tipo de licencia * (1.5.3.1) · Métrica de licenciamiento * (usuario, dispositivo, núcleo, instancia, sitio…) |
| **Derechos y consumo** | Cantidad adquirida * · Cantidad en uso (calculada) · Disponibles (calculada) · Estado de cumplimiento (calculado: Cumple / En riesgo / Sobreuso / Vencida) · Instalaciones o usos permitidos · Clave o serial (**sensible**) |
| **Vigencia** | Fecha de adquisición · Inicio · Vencimiento (obligatorio si el tipo vence) · Soporte incluido hasta · Renovación automática (sí/no) · Preaviso de renovación (días) |
| **Adquisición y finanzas** | Proveedor · Orden de compra · Factura · Costo y moneda · Contrato asociado · Ticket de solicitud de origen |
| **Responsabilidad** | Responsable de la licencia · Departamento propietario · Notas |
| **Asignaciones** | Subtabla: asignado a (usuario / activo / servicio), cantidad, fecha, quién asignó, estado (Activa / Liberada). Botones **[Asignar ⟨UserPlus⟩]** · **[Liberar ⟨Unlink⟩]** · **[Reasignar ⟨ArrowRightLeft⟩]**. |
| **Adjuntos** | Prueba de adquisición, EULA, certificado. |

### 4.3 Formulario de contrato

**Dónde:** `8 Proveedores y Contratos TI > [+ Nuevo contrato ⟨Plus⟩]`. **Usan:** Gestor de Activos y Configuración, Administrador (los Gestores de Área ven los de su departamento).

| Sección | Campos |
|---|---|
| **Identificación** | Número de contrato * · Título * · Tipo de contrato * (1.5.3.2) · Proveedor * · Estado (Borrador, Vigente, Por vencer, Vencido, Renovado, Terminado) |
| **Vigencia** | Fecha de inicio * · Fecha de fin * · Renovación automática (sí/no) · Preaviso de no renovación (días) · Fecha límite de decisión (calculada) |
| **Económico** | Monto total y/o periódico · Moneda · Periodicidad de pago · Orden de compra |
| **Alcance** | Descripción · Activos cubiertos (múltiple) · Licencias cubiertas (múltiple) · Servicios cubiertos (múltiple) |
| **Niveles de servicio del proveedor** | Tiempos de respuesta y resolución por severidad (tabla), cláusulas de penalidad (texto) |
| **Responsabilidad** | Responsable del contrato · Departamento · Contacto del proveedor (nombre, correo, teléfono) |
| **Adjuntos y notas** | Contrato firmado, anexos, notas |


### 4.4 Validaciones de los campos de los formularios (cumple 3C)

#### 4.4.1 Formulario de activo / CI
| Campo | Tipo de dato | Regla exacta (validador) | Mensaje de error |
|---|---|---|---|
| Código (`codigo`) | Código automático | Solo lectura; formato de 1.5.1.5; único, sin reutilización | — |
| Nombre / hostname (`nombre`) | Texto corto o hostname | V-OBLIG; si el tipo exige hostname: V-HOST + V-UNICO; si no: V-NOMBRE (3–80) | Ingresa un nombre de equipo válido. / Ya existe un activo con ese hostname. |
| Clase y tipo (`clase_id`, `tipo_id`) | Listas en cascada | V-OBLIG + V-LISTA; el tipo pertenece a la clase | Selecciona clase y tipo. |
| Fabricante (`fabricante_id`) | Lista | V-LISTA activo; obligatorio según el tipo | Selecciona el fabricante. |
| Modelo (`modelo_id`) | Lista dependiente | V-LISTA; pertenece al fabricante y al tipo; obligatorio si el tipo lo exige | Selecciona un modelo del fabricante. |
| N.º de serie (`numero_serie`) | Texto | V-SERIE (4–50) + unicidad por fabricante | Ingresa de 4 a 50 caracteres alfanuméricos. / Esa serie ya está registrada. |
| Estado (`estado_id`) | Lista / insignia | Al crear: solo estados iniciales del ciclo; después, solo por transiciones | Selecciona un estado inicial válido. |
| Descripción (`descripcion`) | Texto simple | V-TEXTO(0,500) | Máximo 500 caracteres. |
| Etiquetas (`etiquetas`) | Chips | Cada etiqueta V-TEXTO(2,30), sin repetidos, máximo 10 | Máximo 10 etiquetas de 2 a 30 caracteres. |
| Tipo de asignación (`tipo_asignacion`) | Lista | V-LISTA; obligatorio si el estado es Asignado | Selecciona el tipo de asignación. |
| Custodio (`custodio_id`) | Referencia | V-REF usuario activo; **obligatorio** si la asignación es Personal o Préstamo; un solo custodio vigente | Selecciona el usuario custodio. |
| Departamento (`departamento_id`) | Referencia | V-REF departamento activo | Selecciona un departamento válido. |
| Ubicación (`ubicacion_id`) | Referencia en árbol | V-REF ubicación **activa**; obligatoria según el tipo/estado | Selecciona una ubicación activa. |
| Fecha de asignación (`fecha_asignacion`) | Fecha | V-FECHA; ≤ hoy; ≥ fecha de recepción | La fecha no puede ser futura ni anterior a la recepción. |
| Centro de costo (`centro_costo_id`) | Lista | V-LISTA | Selecciona un centro de costo válido. |
| Proveedor (`proveedor_id`) | Referencia | V-REF proveedor con estado distinto de Bloqueado | Selecciona un proveedor habilitado. |
| Tipo de adquisición (`tipo_adquisicion`) | Lista | V-LISTA | Selecciona el tipo de adquisición. |
| Orden de compra (`orden_compra`) | Texto | `^[A-Za-z0-9][A-Za-z0-9/-]{2,29}$`; **obligatorio al pasar a Ordenado** | Ingresa de 3 a 30 caracteres (letras, números, guion o /). |
| Factura (`factura`) | Texto + archivo | `^[A-Za-z0-9][A-Za-z0-9/-]{2,29}$`; adjunto V-ARCHIVO (PDF o imagen ≤ 25 MB) | Ingresa un número de factura válido. |
| Ticket de origen (`ticket_origen`) | Referencia | V-REF a solicitud de servicio existente | Selecciona una solicitud válida. |
| Fecha de compra (`fecha_compra`) | Fecha | V-FECHA; ≤ hoy; ≤ fecha de recepción | La compra no puede ser futura ni posterior a la recepción. |
| Costo y moneda (`costo`, `moneda`) | Monto + lista | V-MONTO; moneda V-LISTA; la moneda es obligatoria si hay costo | Ingresa un monto válido (hasta 2 decimales). |
| Fecha de recepción (`fecha_recepcion`) | Fecha | V-FECHA; ≤ hoy; ≥ fecha de compra | La recepción no puede ser futura. |
| Inicio y fin de garantía | Fechas | V-FECHA; fin ≥ inicio | La garantía debe terminar después de iniciar. |
| Contrato de mantenimiento (`contrato_id`) | Referencia | V-REF contrato vigente que cubra el tipo | Selecciona un contrato vigente. |
| Valor residual (`valor_residual`) | Monto | V-MONTO; ≤ costo | El valor residual no puede superar el costo. |
| Puesta en producción (`fecha_produccion`) | Fecha | V-FECHA; ≥ fecha de recepción | La fecha no puede ser anterior a la recepción. |
| Vida útil (`vida_util_meses`) | Entero | V-MESES (1–600) | Ingresa meses enteros entre 1 y 600. |
| Atributo: dirección IP | IP v4 o v6 | V-IPV4 o V-IPV6 según el atributo; única si está marcada | Ingresa una dirección IP válida. / Esa IP ya está asignada. |
| Atributo: dirección MAC | MAC | V-MAC; única | Ingresa una MAC válida (AA:BB:CC:DD:EE:FF). |
| Atributo: RAM y almacenamiento (GB) | Entero | V-ENTERO(1,1048576) | Ingresa GB enteros mayores que 0. |
| Atributo: IMEI | IMEI | V-IMEI; único | Ingresa un IMEI válido de 15 dígitos. |
| Atributo: puertos, VLAN, puerto de servicio | Entero | V-ENTERO(1,512); V-VLAN; V-PUERTO | Ingresa un valor dentro del rango permitido. |
| Atributo: versión, firmware, edición | Texto | V-VERSION | Ingresa una versión válida (ej. 2.4.1). |
| Atributos de lista o personalizados | Según definición | El validador definido en 1.5.1.3 (tipo, rango, regex, único) | Mensaje definido en la regla. |
| ¿Es CI? (`es_ci`) | Casilla | V-OBLIG; si la clase lo bloquea, no editable | — |
| Criticidad y entorno (`criticidad_id`, `entorno_id`) | Listas | V-OBLIG + V-LISTA cuando es CI | Selecciona la criticidad. / Selecciona el entorno. |
| Servicios que soporta (`servicios`) | Selección múltiple | V-MULTI(0,50) servicios activos; obligatorio según la clase | Selecciona los servicios que soporta. |
| Responsables técnico y de negocio | Referencias | V-REF usuario activo; obligatorios según la clase | Selecciona un responsable. |
| Relaciones (`relaciones`) | Subtabla | Tipo V-LISTA permitido entre las clases; destino V-REF activo ≠ el propio CI; sin duplicados ni ciclos prohibidos | La relación no está permitida entre estas clases. |
| Notas (`notas`) | Texto enriquecido | V-RICO(0,5000) | Máximo 5000 caracteres. |
| Adjuntos y tipo de documento | Archivos + lista | V-ARCHIVO; tipo de documento V-LISTA obligatorio por archivo | Selecciona el tipo de documento del archivo. |

#### 4.4.2 Formulario de licencia
| Campo | Tipo de dato | Regla exacta (validador) | Mensaje de error |
|---|---|---|---|
| Nombre del producto | Texto corto | V-NOMBRE80 (2–100) + V-UNICO por editor y versión | Ingresa el nombre del producto. |
| Editor / fabricante | Lista | V-OBLIG + V-LISTA | Selecciona el editor. |
| Versión y edición | Texto | V-VERSION; edición V-TEXTO(0,40) | Ingresa una versión válida (ej. 2.4.1). |
| Tipo de licencia y métrica | Listas | V-OBLIG + V-LISTA | Selecciona el tipo y la métrica. |
| Cantidad adquirida | Entero | V-ENTERO(1,1000000) | Ingresa una cantidad entera mayor que 0. |
| Clave o serial (sensible) | Texto | V-TEXTO(5,200); se guarda cifrada | Ingresa una clave de 5 a 200 caracteres. |
| Fecha de adquisición, inicio y vencimiento | Fechas | V-FECHA; adquisición ≤ inicio < vencimiento; **vencimiento obligatorio si el tipo vence** | El vencimiento debe ser posterior al inicio. |
| Soporte hasta | Fecha | V-FECHA ≥ inicio | El soporte no puede terminar antes del inicio. |
| Preaviso de renovación | Entero (días) | V-DIAS (0–365) | Ingresa días enteros entre 0 y 365. |
| Orden de compra y factura | Texto | `^[A-Za-z0-9][A-Za-z0-9/-]{2,29}$` | Ingresa de 3 a 30 caracteres válidos. |
| Costo y moneda | Monto + lista | V-MONTO; moneda V-LISTA | Ingresa un monto válido (hasta 2 decimales). |
| Responsable y departamento propietario | Referencias | V-REF activos | Selecciona un responsable. |
| Asignación: destino y cantidad | Referencia + entero | V-REF (usuario, activo o servicio); V-ENTERO(1, disponibles); si excede, aplica la regla de 1.5.3.4 (bloquear, aprobar o alertar) | No hay licencias disponibles para esta asignación. |

#### 4.4.3 Formulario de contrato y datos de contacto
| Campo | Tipo de dato | Regla exacta (validador) | Mensaje de error |
|---|---|---|---|
| Número de contrato | Texto | `^[A-Za-z0-9][A-Za-z0-9/-]{2,29}$` + V-UNICO | Ingresa de 3 a 30 caracteres válidos. / Ya existe ese número. |
| Título | Texto corto | V-TEXTO(5,150) | Ingresa un título de 5 a 150 caracteres. |
| Tipo de contrato y proveedor | Listas | V-OBLIG + V-LISTA; proveedor distinto de Bloqueado | Selecciona un proveedor habilitado. |
| Fecha de inicio y de fin | Fechas | V-FECHA; fin > inicio | La fecha de fin debe ser posterior a la de inicio. |
| Preaviso de no renovación | Entero (días) | V-DIAS (0–365); el límite calculado no puede ser anterior al inicio | Ingresa días enteros entre 0 y 365. |
| Monto total y periódico | Monto | V-MONTO; **obligatorio si el tipo es recurrente** | Ingresa un monto válido (hasta 2 decimales). |
| Moneda y periodicidad | Listas | V-LISTA | Selecciona moneda y periodicidad. |
| Niveles de servicio del proveedor | Enteros (horas) | V-HORAS; respuesta < resolución | La respuesta debe ser menor que la resolución. |
| Responsable y departamento | Referencias | V-REF activos | Selecciona un responsable. |
| Contacto del proveedor: nombre | Texto | V-NOMBRE (3–80) | Ingresa el nombre del contacto. |
| Contacto del proveedor: correo | Correo | V-CORREO | Ingresa un correo válido (ej. nombre@empresa.com). |
| Contacto del proveedor: teléfono | Selector «Tipo de teléfono» + número | Celular → V-TEL-MOVIL; Fijo → V-TEL-FIJO; Internacional → V-TEL-INTL (el selector cambia el validador y la máscara al instante) | Ingresa 9 dígitos que inicien con 9. (según el tipo elegido) |
| Proveedor: tipo y número de documento | Selector «Tipo de documento» + número | DNI → V-DNI (8 dígitos); RUC → V-RUC (11 dígitos con dígito verificador); CE → V-CE; Pasaporte → V-PAS; el selector cambia `maxLength`, `inputMode` y validador | El RUC debe tener 11 dígitos y un dígito verificador válido. (según el tipo elegido) |
| Activos, licencias y servicios cubiertos | Selección múltiple | V-MULTI(0,500) | Selecciona elementos válidos. |
| Cláusulas de penalidad | Texto | V-TEXTO(0,2000) | Máximo 2000 caracteres. |

---

## 5. ESPECIFICACIÓN DE LA FICHA DEL ACTIVO (lo que ve el usuario)

**Ruta:** `7.1 Inventario de activos (HAM) > (fila) <código del activo>`, y desde cualquier enlace a un activo. Un CI lógico (servicio, aplicación) abre la misma ficha adaptada a su clase.
**Layout:** cabecera fija + barra de acciones + pestañas + panel lateral.

### 5.1 Cabecera fija
**Código**, **nombre**, **insignia de estado** (color del catálogo), **clase / tipo**, **fabricante y modelo**, **criticidad** (insignia), **entorno**, **custodio** (con avatar), **ubicación** (ruta corta), **indicador de garantía** (Vigente / Por vencer en N días / Vencida / Sin garantía), **indicador de fin de vida** (si aplica) y **completitud de datos** (%). Etiquetas cuando apliquen: `Problema abierto`, `Error conocido`, `RFC programada`, `En mantenimiento`, `Sin custodio`, `No verificado hace N días`.

### 5.2 Barra de acciones
Los botones de **transición** se generan dinámicamente desde 1.5.2.2 según el estado, el tipo y el perfil (ej. [Asignar ⟨UserPlus⟩], [Transferir ⟨ArrowRightLeft⟩], [Devolver ⟨ArrowRightLeft⟩], [Enviar a reparación ⟨Send⟩], [Retirar ⟨Ban⟩], [Reportar pérdida o robo ⟨TriangleAlert⟩], [Solicitar baja ⟨Send⟩]). Siempre presentes según permisos: **[Editar ⟨SquarePen⟩]**, **[Duplicar ⟨Copy⟩]**, **[Imprimir etiqueta ⟨Printer⟩]**, **[Crear incidente sobre este activo ⟨FilePlus⟩]**, **[Crear RFC sobre este activo ⟨FilePlus⟩]**, **[Ver en mapa CMDB ⟨Network⟩]**, **[Exportar PDF ⟨FileDown⟩]** y el menú **[⋯]** (*Copiar enlace*, *Reclasificar*, *Fusionar duplicado*). Los botones sin permiso o con requisitos pendientes aparecen deshabilitados con tooltip que explica el motivo.

### 5.3 Panel lateral (resumen)
Estado y tiempo en el estado actual · Custodio y desde cuándo · Servicios que soporta · Nº de CI dependientes · Tickets abiertos (incidentes, problemas, RFC) · Contrato de mantenimiento · Licencias asignadas (nº) · Próximo mantenimiento · Próxima verificación física · Alertas activas (garantía, vencimientos, calidad de datos).

### 5.4 Pestañas

**5.4.1 General** — Identificación, adquisición y finanzas (con el ticket de origen enlazado), ciclo de vida y fechas clave. Campos financieros visibles solo para perfiles con `activos.ver_financiero`.
**5.4.2 Atributos técnicos** — Atributos del tipo agrupados por sección; los sensibles enmascarados; los protegidos (1.5.4.5) con ícono 🔒 y la indicación "Se modifica mediante RFC".
**5.4.3 Asignación y ubicación** — Asignación actual (custodio, tipo, desde, acta de entrega y su aceptación) + **historial de asignaciones** (custodio, desde, hasta, tipo, motivo, quien asignó, condición al devolver). Ubicación actual y su historial de movimientos.
**5.4.4 CMDB y relaciones** — Tabla de relaciones (tipo directo e inverso, CI relacionado, clase, criticidad, estado) con [Agregar relación ⟨Plus⟩] y [Quitar ⟨Trash2⟩] (motivo); **mini-mapa** de relaciones a 1 nivel con zoom; bloque **"Impacto"**: servicios que soporta y CI que dependen de este (hasta la profundidad configurada); bloque **"Criticidad efectiva"**.
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

**Botones del árbol:** `[+ Clase ⟨Plus⟩]` · `[+ Tipo ⟨Plus⟩]` (dentro de la clase seleccionada) · `[Mover ⟨MoveRight⟩]` (reparentar) · `[Duplicar ⟨Copy⟩]` · `[Desactivar/Activar ⟨Power⟩]` · `[Eliminar ⟨Trash2⟩]` · `[Expandir/Contraer todo ⟨ChevronsUpDown⟩]`.

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

**Catálogo de fabricantes** (tabla): Nombre · Sitio web · Contacto de soporte (correo, teléfono) · Activo · Nº de modelos · Nº de activos. Botones `[+ Fabricante ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Desactivar ⟨Ban⟩]` `[Eliminar ⟨Trash2⟩]` (solo sin modelos) `[Fusionar… ⟨Merge⟩]` `[Importar CSV ⟨FileUp⟩]` `[Exportar CSV ⟨FileDown⟩]`.

**Catálogo de modelos** (tabla): Fabricante · Tipo · Nombre del modelo · Número de parte · Garantía estándar (meses) · Vida útil (meses) · Fecha de fin de venta (EOL) · Fecha de fin de soporte (EOS) · Activo · Nº de activos. Filtros por fabricante, tipo y estado.

**Editor de modelo:** fabricante * · tipo * · nombre * (único por fabricante y tipo) · número de parte · descripción · **valores prellenados de atributos técnicos** (el mismo formulario de atributos del tipo, con cada uno opcional) · garantía estándar · vida útil · EOL y EOS · imagen · documentos (manual, ficha técnica) · activo.

**Reglas:** el modelo hereda los atributos del tipo; al cambiar valores prellenados **no se modifican los activos ya creados** (casilla opcional "Aplicar a activos existentes con el atributo vacío"); un modelo con activos no se elimina; fusionar reasigna los activos y desactiva el origen con confirmación y conteo.

### 6.3 Pestaña 1.5.1.3 — Atributos por tipo

**Qué se configura:** el esquema de atributos técnicos (sección E del formulario) de cada clase y tipo.

**Layout:** árbol de clases/tipos a la izquierda; a la derecha, tabla de atributos del nodo seleccionado (los heredados aparecen en gris con el nombre de su origen y no se editan aquí).

**Tabla de atributos:** Orden · Etiqueta · Código · Tipo de dato · Obligatorio · Único · Heredado de · Visible en listado · Filtrable · Sensible · Activo. Botones `[+ Nuevo atributo ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Desactivar ⟨Ban⟩]` `[Eliminar ⟨Trash2⟩]` (solo sin valores guardados) `[Reordenar ⟨ArrowUpDown⟩]` `[Copiar atributos de otro tipo ⟨Copy⟩]`.

**Asistente / editor de atributo:**

| Propiedad | Control | Detalle |
|---|---|---|
| Etiqueta (3–60) y código | Texto | Código inmutable, único por tipo. |
| **Tipo de dato** | Lista | Texto corto · Texto largo · Entero · Decimal · Fecha · Fecha y hora · Sí/No · Lista (una opción) · Selección múltiple · Dirección IP · Dirección MAC · URL · Usuario · CI (referencia) · Proveedor (referencia) · Archivo. **No cambia tras publicarse.** |
| Unidad | Texto | Ej. GB, MHz, meses. |
| Obligatorio | Siempre / Según estado (ej. al pasar a *En stock*) / No | |
| Único | Interruptor + alcance (global / por tipo / por modelo) | Se valida en servidor (hostname, IP). |
| Valor por defecto | Control del tipo | |
| Validaciones | Longitud, rango, expresión regular con mensaje y [Probar expresión ⟨FlaskConical⟩], formato IP/MAC | |
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

**Selector superior:** `Formulario: [Alta/edición de activo ▾]` · `Aplicar a: [Todos los tipos ▾ | Clase | Tipo]` (permite **sobrescribir** la configuración base para una clase o tipo; lo heredado aparece tenue con el botón [Restablecer a base ⟨RotateCcw⟩]).

**Layout de tres columnas** (igual a la pestaña de campos de los Prompts 1 y 2): biblioteca de campos (estándar, personalizados, de sistema), lienzo con secciones A–G arrastrables y panel de propiedades.

**Propiedades de un campo:** etiqueta · ayuda · marcador · visible · **obligatorio: Siempre / Según clase o tipo / Según estado / Condicional / No** · solo lectura · valor por defecto · sección · ancho · visible y editable para perfiles · validaciones · reglas condicionales (constructor `CUANDO … ENTONCES …`, hasta 5 condiciones y 10 reglas por campo, con [Probar regla ⟨FlaskConical⟩] y detección de ciclos).

**Matriz de obligatoriedad por estado:** tabla campo × estado (Optional / Obligatorio) para exigir datos al avanzar en el ciclo (ej. número de serie y ubicación obligatorios desde *En stock*; custodio y fecha de asignación desde *Asignado*). Se vincula con 1.5.2.2 (campos obligatorios por transición); si hay conflicto prevalece lo más estricto.

**Campos bloqueados (🔒) — no se ocultan:** *Código, Nombre, Clase y tipo, Estado*. Se pueden renombrar y mover.
**Reglas de consistencia:** oculto no puede ser obligatorio; un atributo técnico obligatorio por tipo no puede ocultarse en el formulario de ese tipo; los campos que usan reglas de otras pantallas (custodio para el selector de Incidentes, criticidad y entorno para Problemas y Cambios) no pueden quitarse si la clase es CI; mínimo 8 campos visibles.
**Campos personalizados:** se crean con el creador existente, agregando las entidades `activo`, `licencia` y `contrato`; límite de fábrica 40 por entidad; el asistente de 5 pasos es el de los otros módulos y permite elegir **clases y tipos a los que aplica**.
**Botones:** `[Vista previa del formulario ⟨Eye⟩]` (selector "Probar como: tipo y perfil") · `[Copiar configuración de otro tipo ⟨Copy⟩]` · `[Restaurar valores de fábrica ⟨RotateCcw⟩]` · patrón común.

### 6.5 Pestaña 1.5.1.5 — Código de activo y etiquetas

**Formato del código:**
- **Constructor de formato** con fichas arrastrables: `{PREFIJO_TIPO}` · `{PREFIJO_CLASE}` · `{AAAA}` · `{AA}` · `{MM}` · `{SEDE}` (código de la sede) · `{CORRELATIVO:n}` (n dígitos, 3–10) · texto fijo · separador (`-`, `_`, ninguno). Vista previa en vivo ("LAP-2026-000123").
- **Alcance del correlativo:** global · por clase · por tipo · por año. **Reinicio:** nunca / anual.
- **Reglas:** el código es único y **no se reutiliza ni siquiera tras la baja**; los cambios de formato **no alteran** códigos existentes (solo los nuevos); el prefijo se define por tipo en 1.5.1.1; la secuencia se asigna en una transacción para evitar saltos y duplicados.
- Botones: `[Probar formato ⟨FlaskConical⟩]` (genera 5 códigos de ejemplo sin consumir secuencia) y `[Ver secuencias ⟨FileText⟩]` (solo lectura).

**Etiquetas físicas:**
- **Símbolo:** código QR · código de barras (Code 128) · ambos.
- **Contenido del QR:** enlace a la ficha (`/activos/{codigo}`) o solo el código (selector).
- **Plantilla de etiqueta:** tamaño (selector de medidas estándar y personalizado), campos a imprimir (logo, código, nombre, tipo, fecha de ingreso, ubicación), tipografía y orientación; editor visual simple con vista previa.
- Botones: `[Vista previa de etiqueta ⟨Eye⟩]` · `[Imprimir lote de prueba ⟨FlaskConical⟩]` (genera PDF).
- Una vez creada, la etiqueta se reimprime desde la ficha o por lote desde `7.1`.

### 6.6 Pestaña 1.5.1.6 — Ubicaciones

**Qué se configura:** el catálogo jerárquico de ubicaciones físicas (hoy no existe y es necesario para los activos).

**Layout:** árbol a la izquierda (con buscador y contador de activos) y panel de propiedades a la derecha; alternativa de vista **Tabla**.

**Niveles configurables** (catálogo editable, de fábrica): Sede > Edificio > Piso > Ambiente (oficina, sala, almacén) > Rack/Posición (opcional). Profundidad máxima 6.

**Propiedades:** nombre * · código * (único en su nivel) · tipo de nivel * · dirección (sedes) · responsable (usuario) · departamento asociado · capacidad (en racks: unidades U) · coordenadas o plano (opcional, adjunto) · notas · activo.
**Botones:** `[+ Ubicación ⟨Plus⟩]` (hija de la seleccionada) · `[+ Ubicación raíz ⟨Plus⟩]` · `[Editar ⟨SquarePen⟩]` · `[Mover ⟨MoveRight⟩]` (reparentar, con vista de impacto en activos) · `[Desactivar ⟨Ban⟩]` · `[Eliminar ⟨Trash2⟩]` (solo sin activos ni hijos) · `[Importar CSV ⟨FileUp⟩]` (plantilla con ruta completa) · `[Exportar CSV ⟨FileDown⟩]`.
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

Atributos comunes: Orden · Código · Nombre · Descripción · Color · Activo · Sistema (🔒) · Usos. Botones: `[+ Nuevo valor ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` `[Reordenar ⟨ArrowUpDown⟩]` `[Importar CSV ⟨FileUp⟩]` `[Exportar CSV ⟨FileDown⟩]` `[Fusionar… ⟨Merge⟩]`. Reglas: los valores en uso solo se desactivan; los 🔒 no se eliminan; un catálogo conserva al menos un valor activo.

### 6.8 Pestaña 1.5.1.8 — Ficha del activo y listado

**Bloque 1 — Cabecera (hasta 10 elementos):** lista ordenable de los elementos de 5.1; código, nombre y estado son fijos.
**Bloque 2 — Pestañas de la ficha:** una fila por pestaña de 5.4 con: orden · nombre (3–30) · visible · **visible para clases/tipos** · **visible para perfiles** · **visible en estados** · **[Configurar campos… ⟨Settings2⟩]** (visible, orden, etiqueta y solo lectura de los campos de la pestaña). *General* e *Historial / auditoría* no se ocultan; *Historial* y el bloque financiero dependen de permisos.
**Bloque 3 — Panel lateral (5.3):** elementos visibles y orden.
**Bloque 4 — Acciones:** botones visibles y los que van en el menú [⋯].
**Bloque 5 — Listado de inventario (`7.1`):** columnas disponibles y por defecto (arrastrar a "Visibles"), orden por defecto, filtros rápidos (estado, clase, tipo, ubicación, custodio, departamento, criticidad, garantía por vencer, sin custodio, sin verificar), densidad, tamaño de página, **vistas guardadas** de fábrica (Todos · Mis activos · En stock · En reparación · Garantía por vencer · Sin custodio · Pendientes de baja) y quién puede crear vistas compartidas.
**Botones:** `[Vista previa con activo real ⟨Eye⟩]` · `[Vista previa con ejemplo ⟨Eye⟩]` · patrón común.

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
- **Reversión:** botón `[Deshacer importación ⟨Undo2⟩]` disponible N horas (fábrica 24) si ningún activo importado fue modificado después.
- **Historial de importaciones:** fecha, usuario, archivo, resultado, enlace al informe de errores.
- Los activos importados quedan con `fuente_dato = Importación`.

**B. Campañas de inventario físico (conteos):** parámetros de fábrica de una campaña:
- **Periodicidad** (única, trimestral, semestral, anual) y recordatorio previo.
- **Alcance:** sedes, clases/tipos, criticidad, departamentos o muestreo (% aleatorio).
- **Método:** escaneo QR/código de barras en el momento · lista de verificación manual.
- **Resultados posibles** (catálogo 🔒): Encontrado · Encontrado en otra ubicación · No encontrado · Dañado · Sobrante (no registrado).
- **Tolerancias y acciones automáticas:** actualizar ubicación al encontrar en otra · marcar `No verificado` · tras N campañas sin hallarlo cambiar a estado *Perdido o robado* (transición con motivo) y abrir incidente de seguridad (selector de servicio) · crear activo provisional para sobrantes.
- **Responsables y cierre:** quién puede crear, ejecutar y cerrar una campaña; cierre exige revisar discrepancias; genera **acta de inventario** (plantilla editable) en PDF.
- Botones: `[+ Nueva plantilla de campaña ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Desactivar ⟨Ban⟩]` + patrón común.


### 6.10 Validaciones de la pantalla 1.5.1 (cumple 3C)

| Propiedad / campo | Ventana interna | Tipo de dato | Validadores y regla |
|---|---|---|---|
| Nombre, código y prefijo de clase o tipo | 1.5.1.1 Jerarquía | Texto / código | V-NOMBRE único en su nivel; V-CODIGO-MAY; V-PREFIJO |
| Vida útil y garantía estándar | 1.5.1.1 | Enteros (meses) | V-MESES; V-ENTERO(0,240) |
| Ciclo de vida, color e ícono | 1.5.1.1 | Lista / color | V-LISTA; V-HEX; ícono del catálogo 3B |
| Fabricante: nombre, sitio web, correo y teléfono | 1.5.1.2 Fabricantes y modelos | Texto / URL / correo / teléfono | V-NOMBRE (2–80) + V-UNICO; V-URL; V-CORREO; selector de tipo de teléfono + V-TEL-* |
| Modelo: nombre y número de parte | 1.5.1.2 | Texto | V-NOMBRE único por fabricante y tipo; `^[A-Z0-9][A-Z0-9._/-]{1,49}$` |
| Garantía, vida útil, EOL y EOS del modelo | 1.5.1.2 | Enteros / fechas | V-ENTERO(0,240); V-MESES; V-FECHA; EOS ≥ EOL |
| Imagen y documentos del modelo | 1.5.1.2 | Archivos | V-ARCHIVO (imagen ≤ 2 MB; documentos ≤ 25 MB) |
| Etiqueta, código y tipo de dato del atributo | 1.5.1.3 Atributos | Texto / código / lista | V-NOMBRE; V-CODIGO único por tipo; tipo de dato inmutable tras publicar |
| Unidad, rango, regex, valor por defecto, opciones | 1.5.1.3 | Texto / números | V-TEXTO(0,15); mínimo ≤ máximo; V-REGEX; validador del tipo de dato; opciones únicas |
| Límite de atributos por tipo | 1.5.1.3 | Entero | Máximo 60 |
| Propiedades de campos del formulario (etiqueta, ayuda, marcador, regla) | 1.5.1.4 Formulario del activo | Texto | V-NOMBRE; V-TEXTO(0,250); V-TEXTO(0,80); constructor sin ciclos |
| Matriz de obligatoriedad por estado | 1.5.1.4 | Lista por celda | V-LISTA; un campo oculto no puede ser obligatorio |
| Formato del código: fichas, texto fijo, correlativo | 1.5.1.5 Código y etiquetas | Constructor | Fichas válidas; texto fijo `^[A-Z0-9_-]{0,10}$`; correlativo V-ENTERO(3,10) dígitos; debe incluir un correlativo |
| Tamaño de etiqueta (ancho y alto en mm) | 1.5.1.5 | Enteros | V-ENTERO(10,200) |
| Contenido del QR y campos a imprimir | 1.5.1.5 | Listas | V-LISTA; V-MULTI(1,8) |
| Ubicación: nombre, código, tipo de nivel | 1.5.1.6 Ubicaciones | Texto / lista | V-NOMBRE (2–80); V-CODIGO-MAY único en su nivel; V-LISTA |
| Ubicación: dirección, capacidad en U, responsable | 1.5.1.6 | Texto / entero / referencia | V-TEXTO(0,200); V-ENTERO(1,60) solo en racks; V-REF |
| Profundidad del árbol y archivo CSV | 1.5.1.6 | Entero / archivo | Máx. 6 niveles; V-ARCHIVO (.csv ≤ 5 MB) |
| Catálogos: nombre, código, color; moneda ISO y símbolo; centro de costo | 1.5.1.7 Catálogos auxiliares | Texto | V-NOMBRE + V-UNICO; V-CODIGO-MAY; V-HEX; moneda `^[A-Z]{3}$`; símbolo V-TEXTO(1,5) |
| Nombre de pestaña, orden, tamaño de página, vistas guardadas | 1.5.1.8 Ficha y listado | Texto / lista | V-TEXTO(3,30); V-ORDEN; V-LISTA (25, 50, 100); V-NOMBRE80 único por usuario |
| Archivo de importación | 1.5.1.9 Importación | Archivo | V-ARCHIVO (.csv o .xlsx ≤ 10 MB, ≤ 5000 filas) |
| Límite de filas y horas de reversión | 1.5.1.9 | Enteros | V-ENTERO(100,5000); V-HORAS (1–168) |
| Clave de coincidencia y mapeo de columnas | 1.5.1.9 | Listas | V-LISTA; cada columna se asigna a un único campo |
| Campaña de inventario: nombre, periodicidad, alcance | 1.5.1.9 | Texto / listas | V-NOMBRE80; V-LISTA; V-MULTI |
| Muestreo y campañas sin hallazgo para marcar como perdido | 1.5.1.9 | Enteros | V-PORC (1–100); V-ENTERO(1,12) |
| Motivo de publicación; JSON; palabra RESTAURAR | Modales y barra | Texto / archivo | V-TEXTO(10,500); V-ARCHIVO (.json ≤ 2 MB); coincidencia exacta con `RESTAURAR` |

---

## 7. PANTALLA 1.5.2 — CICLOS DE VIDA Y REGLAS DE TRANSICIÓN

**Propósito:** definir los estados por los que pasa un activo y cuándo, cómo y con qué requisitos puede pasar de uno a otro (ITIL 4 IT Asset Management; ISO/IEC 20000-1 8.2.5; ISO/IEC 27001 A.5.11 y A.7.14).
**Principio:** los activos **no son tickets**. Sus transiciones tienen requisitos, aprobaciones y automatizaciones, pero no prioridad ni SLA.

### 7.1 Pestaña 1.5.2.1 — Ciclos de vida y estados

**Layout:** a la izquierda, lista de **ciclos de vida** (cada clase o tipo usa uno, 1.5.1.1); a la derecha, la tabla de estados del ciclo seleccionado.

**Botones de ciclos:** `[+ Nuevo ciclo ⟨Plus⟩]` · `[Duplicar ⟨Copy⟩]` · `[Renombrar ⟨SquarePen⟩]` · `[Eliminar ⟨Trash2⟩]` (solo si ninguna clase/tipo lo usa). Cada ciclo muestra qué clases y tipos lo usan.

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

**Botones:** `[+ Nuevo estado ⟨Plus⟩]` · por fila `[Editar ⟨SquarePen⟩]` `[Activar/Desactivar ⟨Power⟩]` `[Eliminar ⟨Trash2⟩]` · `[Reordenar ⟨ArrowUpDown⟩]` · patrón común.
**Reglas:** exactamente 1 estado inicial por ciclo, al menos 1 *En uso* o *Disponible* y 1 *Final*; los estados 🔒 no se eliminan ni cambian de tipo; un estado con activos no se desactiva sin asistente de migración (3.4); un estado *Final* no tiene transiciones de salida salvo configuración explícita de reactivación con permiso.
**Ciclos de fábrica:** sección 11.

### 7.2 Pestaña 1.5.2.2 — Transiciones y reglas

**Vistas:** *Matriz* (origen × destino), *Diagrama* (grafo de solo lectura con zoom y [Exportar PNG ⟨FileDown⟩]) y *Lista*. Selector de ciclo arriba.

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
- **Servicios de solicitud que generan activos** (tabla): servicio del catálogo (`1.2.2`, ej. "Solicitud de equipo nuevo") · tipo de activo que genera · cantidad por solicitud (fija / campo del formulario) · **mapeo de campos** (campo de la solicitud → campo del activo: justificación, departamento solicitante, custodio previsto, ubicación prevista, especificaciones). Botones `[+ Vincular servicio ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Quitar ⟨Trash2⟩]`.
- **Registro previo del activo:** al aprobarse la solicitud, ¿crear el activo en estado *Solicitado*? (sí/no, fábrica sí) y quién lo hace (automático / Gestor de Activos y Configuración).
- **Datos de compra** exigidos al pasar a *Ordenado*: orden de compra *, proveedor *, fecha de pedido *, monto estimado, fecha estimada de entrega (campos configurables).
- **Recepción:** acción **[Registrar recepción ⟨FilePlus⟩]** con formulario por lote: tabla de unidades (modelo, número de serie, hostname, ubicación, atributos clave) con **ingreso rápido por escaneo** o pegado de listado; la cantidad recibida puede ser menor (recepción parcial) con seguimiento de pendientes. Reglas: número de serie obligatorio según tipo, detección de duplicados, **cálculo automático de garantía** (fecha de recepción + garantía estándar del modelo) y de vida útil, asignación automática de código, impresión de etiquetas por lote, adjuntar guía de remisión y factura.
- **Estado tras la recepción:** *En stock* (o *Asignado* directamente si la solicitud indica custodio y el servicio lo permite).
- **Cierre automático del ticket de origen:** al recibir todas las unidades, la solicitud pasa a *Resuelta* con un comentario automático (sí/no).
- **Ingreso directo sin solicitud:** permitido (sí/no) a los perfiles indicados; exige motivo.
- **Recepción de software o licencias:** se registra en `7.3` y se asocia a la solicitud de origen.

### 7.5 Pestaña 1.5.2.5 — Mantenimiento y fin de vida

**Tipos de mantenimiento** (catálogo: Preventivo, Correctivo, Calibración o certificación, Actualización): ¿genera ticket? · ¿puede ser RFC estándar?
**Planes de mantenimiento preventivo** (tabla): Nombre · Aplica a (clase/tipo/modelo/criticidad) · Frecuencia (días/meses/horas de uso) · Tareas (checklist) · Responsable (grupo de 1.4.2) · **Acción al vencer el plazo**: *Crear solicitud de servicio* / *Crear RFC estándar con el modelo* (selector de modelo de cambio del Prompt 2) / *Solo notificar* · Anticipación (días) · Activo. Botones `[+ Nuevo plan ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Desactivar ⟨Ban⟩]` `[Simular próximos 12 meses ⟨FlaskConical⟩]`.
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
**Retención:** el registro de un activo dado de baja **nunca se elimina físicamente**; se conserva N años (valor en 1.8.3; fábrica 7). Botones: `[Vista previa del acta ⟨Eye⟩]` + patrón común.


### 7.7 Validaciones de la pantalla 1.5.2 (cumple 3C)

| Propiedad / campo | Ventana interna | Tipo de dato | Validadores y regla |
|---|---|---|---|
| Nombre de ciclo de vida | 1.5.2.1 Ciclos y estados | Texto | V-NOMBRE80 + V-UNICO |
| Estado: nombre, código, color, tipo, banderas | 1.5.2.1 | Texto / listas | V-TEXTO(3,30) + V-UNICO; V-CODIGO; V-HEX; V-LISTA; 1 estado inicial por ciclo |
| Nombre de acción de transición | 1.5.2.2 Transiciones | Texto | V-TEXTO(3,30) |
| Estados origen y destino; perfiles; clases aplicables | 1.5.2.2 | Selección | V-MULTI(1,20); V-REF; origen ≠ destino |
| Plazo de aprobación y umbrales por costo | 1.5.2.2 | Entero / montos | V-HORAS; V-MONTO crecientes y sin solapes |
| Plantilla de documento generado | 1.5.2.2 | Referencia | V-REF a plantilla activa |
| Máximo de activos por usuario y por tipo | 1.5.2.3 Asignación | Entero | V-ENTERO(1,50) |
| Plazo de aceptación y recordatorios | 1.5.2.3 | Enteros | V-DIAS (1–30); V-ENTERO(1,10) |
| Duración máxima y aviso de préstamo | 1.5.2.3 | Enteros (días) | V-DIAS (1–365); V-DIAS (0–30) |
| Plantilla del acta | 1.5.2.3 | Texto enriquecido | V-RICO(50,5000); solo variables válidas (`{codigo}`, `{nombre}`, `{serie}`, `{custodio}`, `{fecha}`, `{accesorios}`, `{condiciones_uso}`) |
| Ítems del checklist de devolución | 1.5.2.3 | Texto | V-TEXTO(3,100), máximo 15 |
| Cantidad por solicitud y mapeo de campos | 1.5.2.4 Adquisición | Entero / listas | V-ENTERO(1,1000); V-LISTA; cada campo origen a un destino |
| Datos de compra: orden de compra, proveedor, fechas | 1.5.2.4 | Texto / referencia / fechas | `^[A-Za-z0-9][A-Za-z0-9/-]{2,29}$`; V-REF; entrega estimada ≥ pedido |
| Recepción: serie, hostname, ubicación por unidad | 1.5.2.4 | Texto / referencia | V-SERIE + unicidad; V-HOST; V-REF ubicación activa; cantidad recibida ≤ pedida |
| Plan de mantenimiento: nombre y frecuencia | 1.5.2.5 Mantenimiento | Texto / entero + lista | V-NOMBRE80; V-ENTERO(1,120) con unidad (días/meses) |
| Anticipación y tareas del plan | 1.5.2.5 | Entero / texto | V-DIAS (0–90); V-TEXTO(3,150) |
| Alerta de fin de vida | 1.5.2.5 | Entero (meses) | V-MESES (1–60) |
| Motivo de baja, destino y método de borrado | 1.5.2.6 Baja y disposición | Texto / listas | V-NOMBRE + V-UNICO; V-LISTA |
| Datos del receptor de la disposición: tipo de documento y número | 1.5.2.6 | Selector + texto | DNI → V-DNI; RUC → V-RUC; CE → V-CE; Pasaporte → V-PAS (el selector cambia el validador al instante) |
| Receptor: nombre o razón social y dirección | 1.5.2.6 | Texto | V-NOMBRE (3–120); V-TEXTO(0,200) |
| Monto de venta y valor residual | 1.5.2.6 | Monto | V-MONTO |
| N.º de denuncia o reporte (pérdida/robo) | 1.5.2.6 | Texto | `^[A-Za-z0-9][A-Za-z0-9/-]{2,29}$` |
| Fecha del borrado seguro | 1.5.2.6 | Fecha | V-FECHA ≤ hoy |
| Etapas de aprobación de la baja | 1.5.2.6 | Lista ordenada | V-MULTI(1,5); el solicitante no puede ser aprobador |
| Años de retención | 1.5.2.6 | Entero | V-ENTERO(1,30) |

---

## 8. PANTALLA 1.5.3 — LICENCIAS Y CONTRATOS

**Propósito:** definir los tipos, formularios, reglas de cumplimiento, alertas y renovaciones de licencias de software (SAM) y contratos de proveedores (ITIL 4 Supplier Management; ISO/IEC 19770-1; ISO/IEC 27001 A.5.32).

### 8.1 Pestaña 1.5.3.1 — Tipos de licencia y métricas

**Tabla de tipos de licencia:** Nombre · Código · Métrica · ¿Vence? · ¿Requiere clave? · ¿Reasignable? · ¿Requiere contrato? · Activo · Nº de licencias. Botones `[+ Nuevo tipo ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Desactivar ⟨Ban⟩]` `[Eliminar ⟨Trash2⟩]` `[Reordenar ⟨ArrowUpDown⟩]`.
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
**Botones:** `[+ Nuevo tipo ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Desactivar ⟨Ban⟩]` `[Eliminar ⟨Trash2⟩]` (si no está en uso) `[Importar CSV ⟨FileUp⟩]` + patrón común.

### 8.3 Pestaña 1.5.3.3 — Configuración de formulario de licencia y contrato

**Selector:** `Formulario: [Licencia ▾ | Contrato ▾]`. Usa **el mismo editor de formulario** de 1.5.1.4 aplicado a las secciones de 4.2 y 4.3: visible, obligatorio (Siempre / Según tipo de licencia o contrato / Según estado / Condicional / No), orden, sección, ancho, perfiles, validaciones y reglas condicionales; campos personalizados con el creador existente (entidades `licencia` y `contrato`).
**Campos bloqueados (🔒):** Licencia — *Nombre del producto, Tipo de licencia, Métrica, Cantidad adquirida*; Contrato — *Número, Título, Tipo, Proveedor, Fecha de inicio, Fecha de fin*.
**Reglas de consistencia:** fecha de vencimiento obligatoria si el tipo vence; monto obligatorio si el tipo de contrato es recurrente; clave marcada sensible no puede mostrarse en listados.
**Botones:** `[Vista previa ⟨Eye⟩]` · `[Restaurar valores de fábrica ⟨RotateCcw⟩]` · patrón común.

### 8.4 Pestaña 1.5.3.4 — Cumplimiento y sobreuso

**Estado de cumplimiento** (cálculo automático por licencia): **Cumple** (uso < umbral de riesgo) · **En riesgo** (uso ≥ umbral de riesgo) · **Sobreuso** (uso > cantidad adquirida) · **Vencida** · **Sin datos**.
**Parámetros:**
- **Umbral de riesgo** (% de uso; fábrica 90).
- **Al intentar asignar por encima de lo adquirido:** *Bloquear* (bloqueo duro) · *Permitir con aprobación* (etapa configurable) · *Permitir y alertar*. Fábrica: bloquear.
- **Alertas de sobreuso:** destinatarios, frecuencia de repetición y escalamiento si no se regulariza en N días.
- **Reclamación automática de licencias:** liberar la asignación cuando el activo pasa a *Retirado/Dado de baja* o el usuario se desactiva (sí/no).
- **Software no autorizado:** si el catálogo marca un producto como *Prohibido* o *Restringido* y aparece asignado/instalado sin aprobación → alerta al Gestor de Activos y Configuración, etiqueta en el activo y tarea de regularización.
- **Licencias sin asignar:** reporte de licencias disponibles sin uso hace N días (sugerencia de optimización).
**Botones:** `[Simular cumplimiento ⟨FlaskConical⟩]` (muestra el estado de cada licencia con los parámetros propuestos antes de publicar) + patrón común.

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
**Panel "Próximos vencimientos":** vista previa de los 90 días siguientes con la configuración propuesta. Botones: `[Enviar alerta de prueba ⟨FlaskConical⟩]` `[Restaurar valores de fábrica ⟨RotateCcw⟩]` + patrón común.

### 8.6 Pestaña 1.5.3.6 — Renovación

**Reglas:**
- **Estados de renovación** (🔒 de fábrica): Pendiente · En gestión · Renovado · No renovar · Vencido sin renovar.
- **Generación de la solicitud de renovación:** N días antes del vencimiento (por licencia/contrato, valor por tipo) se crea automáticamente una **solicitud de servicio** (selector del servicio, ej. "Renovación de licencia o contrato") con datos prellenados (producto, proveedor, vigencia, monto, cantidad, responsable) y se asigna al responsable.
- **Renovación automática del contrato:** si está marcada, el sistema **no renueva por sí mismo**; avisa antes del límite de no renovación y registra la decisión.
- **Aprobación de renovación:** etapas por rango de monto (tabla: desde–hasta → perfil Supervisor / Aprobador / dirección); el solicitante no aprueba.
- **Registrar la renovación:** campos exigidos (nueva vigencia, nuevo monto, cantidad, número de contrato u orden, adjunto); la vigencia anterior queda en el **historial de renovaciones**.
- **Motivos de no renovación** (catálogo editable) y acciones asociadas (planificar reemplazo, liberar asignaciones, retirar software).
- **Qué ocurre al vencer sin renovar:** licencia → estado *Vencida* y alerta de uso no autorizado; contrato → *Vencido* y alerta de pérdida de cobertura sobre sus activos; opción de bloquear nuevas asignaciones de esa licencia.
**Botones:** `[Vista previa de la solicitud generada ⟨Eye⟩]` + patrón común.


### 8.7 Validaciones de la pantalla 1.5.3 (cumple 3C)

| Propiedad / campo | Ventana interna | Tipo de dato | Validadores y regla |
|---|---|---|---|
| Nombre del tipo de licencia | 1.5.3.1 Tipos de licencia | Texto | V-NOMBRE + V-UNICO |
| Factor de conversión | 1.5.3.1 | Decimal | V-DECIMAL(0.01,100,2) |
| Tiempo mínimo entre reasignaciones | 1.5.3.1 | Entero (días) | V-DIAS (0–365) |
| Catálogo de software: producto, editor, condición | 1.5.3.1 | Texto / lista | V-NOMBRE80; V-NOMBRE; V-LISTA (Autorizado, Restringido, Prohibido) |
| Nombre del tipo de contrato | 1.5.3.2 Tipos de contrato | Texto | V-NOMBRE + V-UNICO |
| Preaviso de no renovación por defecto | 1.5.3.2 | Entero (días) | V-DIAS (0–365) |
| Categorías y estados de proveedor; calificación | 1.5.3.2 | Texto / entero | V-NOMBRE + V-UNICO; V-ENTERO(1,5) |
| Propiedades de campos de licencia y contrato | 1.5.3.3 Formularios | Texto | V-NOMBRE; V-TEXTO(0,250); constructor de reglas sin ciclos |
| Umbral de riesgo de uso | 1.5.3.4 Cumplimiento | Porcentaje | V-PORC (1–99) |
| Plazo de regularización del sobreuso | 1.5.3.4 | Entero (días) | V-ENTERO(1,90) |
| Días sin uso para sugerir optimización | 1.5.3.4 | Entero (días) | V-DIAS (1–365) |
| Anticipaciones de alerta por entidad | 1.5.3.5 Alertas | Lista de enteros (días) | V-ENTERO(-365,365), sin repetidos, máximo 8 |
| Destinatarios y plantilla | 1.5.3.5 | Referencias | V-MULTI(1,20); V-REF |
| Días de escalamiento y de posposición (snooze) | 1.5.3.5 | Enteros | V-ENTERO(1,90); V-DIAS (1–30) |
| Días antes del vencimiento para generar la renovación | 1.5.3.6 Renovación | Entero | V-DIAS (1–365) |
| Tramos de monto para aprobación | 1.5.3.6 | Montos | V-MONTO; tramos contiguos y sin solapes; el último sin tope |
| Registro de renovación: vigencia, monto, cantidad, N.º de contrato | 1.5.3.6 | Fechas / monto / enteros / texto | V-RANGO-FECHAS; V-MONTO; V-ENTERO(1,1000000); `^[A-Za-z0-9][A-Za-z0-9/-]{2,29}$` |
| Motivos de no renovación | 1.5.3.6 | Texto | V-NOMBRE + V-UNICO |

---

## 9. PANTALLA 1.5.4 — TIPOS DE ELEMENTOS DE CONFIGURACIÓN Y RELACIONES DE CMDB

**Propósito:** definir qué es un CI, cómo se relacionan los CI entre sí, cuán críticos son, qué reglas protegen la exactitud de la CMDB y cómo se audita (ITIL 4 Service Configuration Management; ISO/IEC 20000-1 8.2.6; COBIT BAI10).

### 9.1 Pestaña 1.5.4.1 — Clases de CI

**Qué se configura:** qué clases de la jerarquía de 1.5.1.1 son CI y qué exige la CMDB de cada una; creación de clases de CI **lógicas** (no inventariables).

**Tabla de clases** (todas las de 1.5.1.1 más las lógicas): Clase / tipo · ¿Es CI? · ¿Inventariable? · Atributos CMDB obligatorios · Relaciones mínimas · Nº de CI · Activa. Botones: `[+ Clase de CI lógica ⟨Plus⟩]` (crea una clase con `inventariable = No`, p. ej. Servicio de negocio, Servicio de TI, Aplicación, Base de datos, Máquina virtual) · `[Editar ⟨SquarePen⟩]` · `[Desactivar ⟨Ban⟩]` · `[Ver diagrama de clases ⟨Network⟩]` (modelo de solo lectura, el mismo de `7.4`).

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

**Tabla de tipos de relación:** Nombre directo · Nombre inverso · Código · Dirección del impacto · ¿Propaga criticidad? · Cardinalidad · Color/estilo de línea · Activo. Botones `[+ Nuevo tipo de relación ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Desactivar ⟨Ban⟩]` `[Eliminar ⟨Trash2⟩]` (solo sin relaciones) `[Ver matriz de clases permitidas ⟨FileText⟩]`.

**Editor de tipo de relación:**
- **Nombre directo** (ej. "Depende de") y **nombre inverso** (ej. "Es requerido por"); la relación se muestra con el nombre que corresponda según el CI desde el que se mire.
- **Dirección del impacto:** *El fallo del origen impacta al destino* · *El fallo del destino impacta al origen* · *Bidireccional* · *Ninguna*. (Alimenta el análisis de impacto de Cambios y Problemas.)
- **¿Propaga criticidad?** (sí/no): si es sí, aplica la regla de criticidad efectiva de 1.5.4.3.
- **Cardinalidad:** 1:1 · 1:N · N:N.
- **¿Permite ciclos?** (no por defecto; solo para tipos simétricos como "Conectado a").
- **Estilo en el mapa:** color, grosor, línea continua/discontinua, flecha.
- **Descripción** (texto de ayuda en el formulario).

**Matriz de clases permitidas (obligatoria para cada tipo):** cuadrícula *clase origen × clase destino* con casillas; un tipo de relación solo puede crearse entre las parejas marcadas. Botones `[Marcar todo ⟨CircleCheck⟩]` `[Limpiar ⟨Eraser⟩]` `[Copiar de otro tipo ⟨Copy⟩]`. Una relación entre clases no permitidas se rechaza en servidor.
**Relaciones obligatorias por clase:** se definen en 1.5.4.1 y se muestran aquí en modo lectura por tipo de relación.
**Botones:** `[Simulador ⟨FlaskConical⟩]` (elegir dos CI hipotéticos y ver qué relaciones serían válidas y cómo propagarían el impacto) + patrón común.
**Reglas:** los tipos de fábrica 🔒 no se eliminan; el nombre directo y el inverso no pueden coincidir salvo tipos simétricos; no se desactiva un tipo con relaciones activas sin asistente de migración (reasignar a otro tipo).

### 9.3 Pestaña 1.5.4.3 — Criticidad y entornos

**Niveles de criticidad** (tabla, mínimo 3 y máximo 5; de fábrica 4): Nivel · Código · Peso numérico · Color · Descripción · Criterios (impacto en el negocio, tiempo objetivo de recuperación RTO y punto objetivo de recuperación RPO como texto/horas, opcionales) · Activo.
**Uso de la criticidad (informativo, con enlace a cada pantalla):** Problemas (impacto sugerido y criterio de problema mayor), Cambios (matriz de autoridad y cuestionario de riesgo), Incidentes (prioridad sugerida opcional).
**Criticidad efectiva:**
- `Calcular la criticidad efectiva` (interruptor): criticidad efectiva = la **mayor** entre la propia del CI y la de los servicios que soporta (y, opcionalmente, la de los CI que dependen de él hasta la profundidad N según relaciones que propagan criticidad).
- Profundidad máxima de propagación (1–5; fábrica 2).
- Dónde se muestra y cuál se usa en otras pantallas (efectiva / propia).
- `Recalcular ahora` (proceso asíncrono con barra de progreso) y recálculo automático al cambiar relaciones, servicios o criticidades.
**Entornos:** catálogo (de fábrica: Producción, Preproducción, Pruebas, Desarrollo, Contingencia / recuperación ante desastres) con atributos: *peso de riesgo (0–5)*, *¿es productivo?*, color, activo. **El catálogo de entornos es único y compartido con el Prompt 2 (catálogo "Entornos" de 1.3.4.1.3)**: si ya existe, reutilízalo y agrégale "Contingencia"; si no, créalo aquí con esos atributos.
**Botones:** `[+ Nivel ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Desactivar ⟨Ban⟩]` `[Reordenar ⟨ArrowUpDown⟩]` `[Restaurar valores de fábrica ⟨RotateCcw⟩]` + patrón común.
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

**Botones:** `[Ejecutar verificación ahora ⟨FlaskConical⟩]` (recorre la CMDB y lista las violaciones, sin modificar nada) · `[Exportar resultados ⟨FileDown⟩]` + patrón común.

### 9.5 Pestaña 1.5.4.5 — Fuentes de datos y atributos protegidos

**Objetivo (ITIL 4: los cambios en la CMDB se controlan):** evitar que los datos de CI críticos se modifiquen sin trazabilidad.

**Fuentes de datos** (catálogo 🔒): *Manual* · *Importación* · *Cambio (RFC)* · *Integración externa* (reservada para el futuro). Cada modificación registra su fuente.
**Atributos protegidos** (tabla): Clase/tipo · Atributo o campo (selector) · Entorno al que aplica (ej. solo Producción) · Criticidad mínima · **Política de edición directa**:
- *Libre* (sin restricción).
- *Solo mediante RFC* (el cambio solo puede aplicarse con el botón **[Aplicar a la CMDB ⟨CircleCheck⟩]** de una RFC vinculada y cerrada con éxito, Prompt 2).
- *Excepción permitida* (el Gestor de Activos y Configuración puede editar directamente con **motivo obligatorio**; queda marcada como "modificación fuera de cambio" y se reporta).
**Prioridad de fuentes por atributo** (para reconciliación): orden de confianza (ej. Cambio > Importación > Manual).
**Reglas de reconciliación:** si una importación intenta cambiar un atributo protegido, se omite y se reporta en el informe de la importación.
**Botones:** `[+ Agregar atributo protegido ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Quitar ⟨Trash2⟩]` `[Simulador ⟨FlaskConical⟩]` (elegir CI y campo y ver qué política aplicaría) + patrón común.
**Valores de fábrica:** protegidos con política *Solo mediante RFC* en Producción y criticidad ≥ Alta: *versión de software, sistema operativo, firmware, dirección IP, rol y relaciones*; con *Excepción permitida* los demás atributos técnicos de CI en producción.

### 9.6 Pestaña 1.5.4.6 — Auditoría de CMDB y líneas base

**A. Verificación de exactitud (auditorías):**
- **Plantillas de auditoría** (tabla): Nombre · Alcance (clases, criticidad, entorno, servicio) · Frecuencia (única, mensual, trimestral, semestral, anual) · Método (**revisión de calidad de datos** automática + **verificación manual** de una muestra %) · Responsable · Activa.
- **Indicadores de calidad** (editable): *% de CI con todos los atributos CMDB obligatorios* · *% con responsable* · *% con relaciones mínimas* · *% verificados físicamente en el período* · *% de discrepancias en la muestra* · *CI huérfanos* · *modificaciones fuera de cambio*. **Objetivo de exactitud** por indicador (fábrica 95 %) y semáforo.
- **Resultado de una auditoría:** lista de hallazgos (CI, tipo de hallazgo, severidad, responsable de corregir, fecha límite, estado); acciones: *Crear tarea*, *Crear solicitud de servicio*, *Marcar como aceptado*; informe en PDF; cierre con aprobación.
- Botones: `[+ Nueva plantilla de auditoría ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Duplicar ⟨Copy⟩]` `[Desactivar ⟨Ban⟩]` `[Ejecutar ahora ⟨Play⟩]`.

**B. Líneas base:**
- **Plantillas de línea base:** nombre · alcance (global / servicio / clase / criticidad) · qué incluye (CI, atributos, relaciones, licencias asociadas) · retención (meses; fábrica 24).
- **Creación:** *Manual* · *Programada* (frecuencia) · *Automática al autorizar una RFC* con riesgo ≥ X o criticidad ≥ Y sobre los CI afectados (activo en fábrica con riesgo Alto o Crítico, integración con el Prompt 2) · *Automática tras cerrar* la RFC (para comparar).
- **Comparación:** `[Comparar con el estado actual ⟨GitCompare⟩]` y `[Comparar dos líneas base ⟨GitCompare⟩]` (diferencias de atributos y relaciones, exportables).
- **Restauración:** solo informativa (no revierte datos); la reversión real se hace mediante cambios.
- Botones: `[+ Nueva plantilla ⟨Plus⟩]` `[Editar ⟨SquarePen⟩]` `[Eliminar ⟨Trash2⟩]` (si no tiene líneas base) + patrón común.


### 9.7 Validaciones de la pantalla 1.5.4 (cumple 3C)

| Propiedad / campo | Ventana interna | Tipo de dato | Validadores y regla |
|---|---|---|---|
| Nombre y código de clase lógica de CI | 1.5.4.1 Clases de CI | Texto | V-NOMBRE + V-UNICO; V-CODIGO-MAY |
| Atributos CMDB obligatorios y relaciones mínimas | 1.5.4.1 | Casillas / reglas | V-MULTI; la regla debe usar tipos de relación permitidos |
| Nombre directo e inverso de relación | 1.5.4.2 Tipos de relación | Texto | V-NOMBRE (3–40); distintos entre sí salvo relación simétrica |
| Código del tipo de relación | 1.5.4.2 | Código | V-CODIGO + V-UNICO |
| Dirección del impacto y cardinalidad | 1.5.4.2 | Listas | V-LISTA |
| Color y grosor de línea | 1.5.4.2 | Color / entero | V-HEX; V-ENTERO(1,6) |
| Matriz de clases permitidas | 1.5.4.2 | Casillas | Al menos una pareja marcada por tipo |
| Nivel de criticidad: nombre, peso, color, criterios | 1.5.4.3 Criticidad y entornos | Texto / entero | V-NOMBRE (3–20) único; V-ENTERO(1,10) distinto y creciente; V-HEX; V-TEXTO(0,250) |
| RTO y RPO (horas) | 1.5.4.3 | Decimal | V-DECIMAL(0,720,1) |
| Profundidad de propagación | 1.5.4.3 | Entero | V-ENTERO(1,5) |
| Entorno: nombre, peso, productivo | 1.5.4.3 | Texto / entero | V-NOMBRE + V-UNICO; V-ENTERO(0,5) |
| Severidad de cada regla; plazos de gracia | 1.5.4.4 Reglas de integridad | Lista / entero | V-LISTA (Bloquear/Advertir; las 🔒 no admiten Advertir); V-DIAS (0–365) |
| Máximo de relaciones por CI; profundidad de verificación | 1.5.4.4 | Enteros | V-ENTERO(1,1000); V-ENTERO(1,10) |
| Atributo protegido: clase, campo, política | 1.5.4.5 Fuentes y protegidos | Listas | V-LISTA; no duplicar combinación clase + campo + entorno |
| Orden de prioridad de fuentes | 1.5.4.5 | Lista ordenada | V-MULTI; sin repetidos |
| Plantilla de auditoría: nombre, alcance, frecuencia, responsable | 1.5.4.6 Auditoría y líneas base | Texto / listas | V-NOMBRE80 + V-UNICO; V-MULTI; V-LISTA; V-REF |
| Muestreo y objetivo de exactitud | 1.5.4.6 | Porcentajes | V-PORC (1–100); V-PORC (50–100) |
| Plantilla de línea base: nombre, alcance, retención | 1.5.4.6 | Texto / entero | V-NOMBRE80 + V-UNICO; V-MULTI; V-MESES (1–120) |
| Riesgo mínimo para línea base automática | 1.5.4.6 | Lista | V-LISTA (niveles de riesgo de 1.3.4.1.4) |

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

### 12.0 Hechos de arquitectura (ver `ARQUITECTURA_Y_CODIGO.md`)
- **Framework:** Next.js 14 (App Router); pantallas en `src/app/plataforma/`, API en `src/app/api/`. Sesión con cookie `sesion` (JWT) y perfil activo conmutable. Menú dinámico desde `/api/menu` + `src/shared/lib/menu.ts`.
- **Base de datos:** pool `pg` de `src/shared/lib/db.ts`; sin acceso directo desde el cliente.
- **Validaciones:** `src/shared/lib/validaciones.ts` (DNI, RUC, correos, códigos, etc.) y `AlertaCampo` (solo errores en rojo).
- **Activos y CMDB:** configuración en `/admin/activos-config/*` (4 pantallas con 27 ventanas), operación en `/activos/{inventario,cmdb,cmdb/tipos,licencias}` y `/proveedores`; el Técnico en `/plataforma/perfiles/tecnico/activos/*`. API en `/api/activos/*` y `/api/admin/cmdb/tipos`.
- **Selector de CI en Incidentes:** los ítems bajo custodia del usuario; no debe romperse.
- **SLA:** `src/shared/lib/sla.ts` (calendarios hábiles); los cambios del Prompt 2 reutilizan su tabla de feriados.
- **Ticket de incidente:** `PanelInfraestructuraCi` muestra el CI afectado: debe leer de la misma estructura de CI/activos que esta configuración extiende.


| Tema | Lo confirmado |
|---|---|
| Stack | Next.js 14 (App Router) y PostgreSQL en Supabase (pool `pg` de `src/shared/lib/db.ts`); acceso completo al código, base de datos, frontend y backend. |
| Selector "Elemento CMDB" en Incidentes | Existe: lista ítems tecnológicos de hardware, software y periféricos **bajo custodia del usuario** (opcional). Por tanto **ya hay una estructura de datos de CI/activos con custodio**. Ubícala en la Etapa 0: es la base que se extiende. |
| Formulario de Incidentes y creador de campos | Existen; se extienden a las entidades `activo`, `licencia` y `contrato`. |
| Matriz de prioridad | Existe para incidentes (P1–P4). No interviene aquí, salvo la criticidad como dato de apoyo. |
| Perfiles | Administrador, Técnico, Solicitante, Supervisor, Gestor de Área, Auditor, Aprobador, Gestor de Cambios, Gestor de Activos y Configuración. |
| Ubicaciones físicas | **No existen datos.** Se crea el catálogo jerárquico (1.5.1.6). |
| Calendarios y feriados | `src/shared/lib/sla.ts` usa calendarios hábiles y el Prompt 2 reutiliza su tabla de feriados. Este prompt no los necesita. |
| Menú operativo | `7.1`, `7.2`, `7.3`, `7.4` y `8` aparecen en el menú; su estado de implementación se verifica en la Etapa 0. |
| Adquisición | Es una **solicitud de servicio**; la compra la hace el área administrativa y el ticket solo registra los datos de la orden. |
| Datos que no existan | Se agregan a la base de datos mediante migraciones (sección 13). |

**Dependencias con otros módulos:**

| Con | Dependencia |
|---|---|
| Prompt 1 (Problemas) | Criticidad y clase de CI; marcas `Problema abierto` y `Error conocido` en la ficha; selector de CI. |
| Prompt 2 (Cambios) | Relaciones y criticidad para el análisis de impacto; atributos protegidos y **[Aplicar a la CMDB ⟨CircleCheck⟩]**; líneas base automáticas; catálogo compartido de entornos; mantenimiento preventivo como RFC estándar. |
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

**13.3 Seguridad:** permisos de la sección 10 como datos semilla; filtros por perfil aplicados en el servidor (Route Handlers) (el Solicitante solo ve los activos de los que es custodio; el Gestor de Área, los de su departamento); tablas de historial inmutables (sin UPDATE/DELETE); cifrado de datos sensibles y auditoría de revelación.

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
31. Ninguna ventana interna de las pantallas 1.5.x repite un ítem del menú; las ventanas internas existentes están en `?vista=` y no alteran el ítem activo del menú (3A).
32. Los botones y las acciones de fila usan los íconos de 3B.4, con tooltip y `aria-label`, y el estilo de botones de la sección 3B.1.
33. Todos los campos de los formularios y de las pantallas de configuración tienen validación en tiempo real con los validadores de 3C; **no aparece ningún indicador de éxito**; los errores usan `AlertaCampo`.
34. Cambiar el valor de un selector que gobierna otro campo (por ejemplo tipo de documento) cambia al instante el validador, la máscara y el `maxLength` del campo dependiente.
35. El servidor repite las mismas validaciones y devuelve `400` con `{ campo, mensaje }`, que la interfaz muestra en el campo.
36. Los modales y la barra de acciones comunes existen una sola vez y los usan los módulos de problemas, cambios y activos; los `Iconos.tsx` duplicados fueron unificados.

---

## 15. Etapa 0 — Reconocimiento obligatorio y preguntas abiertas

**Punto de partida de la Etapa 0 (según el árbol de archivos):** el informe debe incluir una **tabla de diferencias** entre este documento y lo ya implementado en `/admin/activos-config/*` y `/activos/*` (2.2 a 2.4): por cada ventana interna indica existe / falta / incompleta, qué validadores (3C) e íconos (3B) le faltan y qué elementos duplican ítems del menú (3A). Verifica además cómo `PanelInfraestructuraCi` y el selector de CI de Incidentes leen los activos.

**Antes de escribir cualquier código**, revisa el repositorio y la base de datos y entrégame un **informe** (sin modificar nada) con:

1. **Estructura actual de CI/activos:** la tabla o tablas que alimentan el selector "Elemento CMDB" de Incidentes (columnas, relaciones, número de registros, calidad de datos), y el código del selector.
2. **Componentes reutilizables:** editor de formulario y creador de campos de Incidentes, constructor de reglas, motor de estados/flujo (Prompts 1 y 2 si ya existen), componente de borrador/publicación/versionado, sistema de notificaciones (1.6) y soporte de destinatarios dinámicos y plantillas, jobs programados, componentes de UI (árboles, tablas, modales, arrastrar-y-soltar, diagramas/grafos para el mapa).
3. **Perfiles y permisos:** cómo se almacenan y verifican en `src/middleware.ts`, `src/shared/lib/menu.ts`, `src/shared/lib/page-auth.ts` y los Route Handlers.
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
