# PROMPT 2 de 3 — Configuración del administrador: GESTIÓN DE CAMBIOS (RFC)

> **Rama del menú que se implementa:** `1 Configuración > 1.3 Configuración de procesos > 1.3.4 Gestión de cambios`
> **Prompts hermanos:** Prompt 1 = Gestión de problemas (1.3.3) · Prompt 3 = Activos y CMDB (1.5), se entrega por separado.
> **Idioma de la interfaz:** español. **Código, tablas y endpoints:** nombres en español snake_case salvo convención técnica.
> **Stack real del proyecto:** Next.js 14 con App Router (frontend + backend) y PostgreSQL (alojado en Supabase y accedido con el pool `pg` de `src/lib/db.ts`). Tienes acceso completo al código, la base de datos, el frontend y el backend.
> **Versión del documento:** 2.0 (actualizada a la arquitectura FlowDesk: numeración y rutas reales, reglas de navegación sin duplicar el menú, sistema de íconos y validaciones en todos los campos).

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
7. Trabaja por etapas y detente al final de cada una para validación: **Etapa 0** = reconocimiento del código y la base de datos (sección 15, **obligatoria antes de escribir código**), **Etapa A** = 1.3.4.1, **Etapa B** = 1.3.4.2, **Etapa C** = 1.3.4.3, **Etapa D** = 1.3.4.4. *Nota de dependencia:* el formulario (Etapa A) muestra un aviso de conflictos de calendario que se implementa completo en la Etapa D; en la Etapa A deja la interfaz del aviso y un servicio provisional que devuelve "sin conflictos".
8. **Si falta un dato en la base de datos, agrégalo.** La lista de lo que debe verificarse y, si no existe, crearse está en la sección 13. Todo cambio de esquema va en migraciones SQL versionadas e idempotentes, con autorización en cada Route Handler (cookie `sesion_tickets`, JWT y perfil activo, como el resto de `src/app/api/`) y consultas parametrizadas con `src/lib/db.ts`.
9. Sigue las convenciones ya presentes en el repositorio (estructura de carpetas, estilo de API, componentes de UI, manejo de errores, tareas programadas).
10. **Integridad del proceso:** toda regla de negocio crítica (segregación de funciones, quórum y reglas de decisión, períodos de congelamiento, transiciones permitidas, campos obligatorios por transición, bloqueo de ejecución sin autorización) **se valida en el backend o la base de datos**, no solo en la interfaz. La interfaz solo la refleja.
11. **Fechas y horas:** se guardan como `timestamptz` en UTC y se muestran en la zona horaria del sistema (parámetro configurable; si no existe, créalo, sección 13). Las ventanas recurrentes se interpretan en esa zona horaria.

**Reglas adicionales de esta versión (arquitectura FlowDesk, interfaz y validaciones):**

12. Las pantallas de este prompt **ya existen** casi por completo (ver 2.3). **No las reconstruyas desde cero**: audítalas contra este documento, corrige diferencias, completa lo que falta y conserva datos y contratos de API existentes.
13. Respeta la arquitectura: pantallas en `src/app/plataforma/...` (las rutas URL no llevan `plataforma`), Route Handlers en `src/app/api/...`, validadores en `src/lib/validaciones.ts`, dominio en `src/modules/...` y componentes compartidos en `src/shared/...`. **El código nuevo va en `modules`/`shared`**; no se crean más copias locales de componentes.
14. Cumple en **todas** las pantallas las secciones **3A** (navegación sin duplicar el menú), **3B** (íconos y botones) y **3C** (validaciones en tiempo real, solo errores).
15. **Autorización:** cada Route Handler verifica la cookie `sesion_tickets` (JWT) y el **perfil activo**, como el resto de `src/app/api/`; consultas SQL parametrizadas con `query()` / `queryRow()` de `src/lib/db.ts`. Las reglas críticas (segregación de funciones, quórum, congelamientos, transiciones) siguen validándose en el servidor.
16. **SLA y calendarios:** `src/lib/sla.ts` ya calcula con **calendarios hábiles**. Reutiliza su tabla de feriados y su convención de horas; las pestañas de feriados, ventanas y congelamiento no deben crear estructuras paralelas.

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

## 2. Ubicación en el menú y estructura de archivos (arquitectura FlowDesk)

### 2.1 Menú de administrador (referencia; ya se sirve desde `/api/menu` y `src/lib/menu.ts`)

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
  1.3.3 Gestión de problemas (/admin/procesos/problemas)
   1.3.3.1 Configuración de formulario (/admin/procesos/problemas/formulario)
   1.3.3.2 Flujo de investigación y seguimiento (/admin/procesos/problemas/flujo)
   1.3.3.3 Relación con incidentes, errores conocidos y conocimiento (/admin/procesos/problemas/relaciones)
  1.3.4 Gestión de cambios (/admin/procesos/cambios)            <-- SE IMPLEMENTA EN ESTE PROMPT
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
 2.1 Indicadores operativos y SLA (/tickets/reportes)
 2.2 Tableros (/admin/reportes-disenador)
```

Cambios respecto de versiones anteriores de este prompt: **(a)** Gestión de cambios es ahora `1.3.4` y Gestión de problemas `1.3.3`; **(b)** aparece `1.2.4 Configuración de categorías`, por lo que **Objetivos SLA pasa a ser `1.2.5`**; **(c)** `1.3.4.1` se llama "Configuración de formulario".

### 2.2 Convención de numeración interna
- `1.3.4.1` a `1.3.4.4` son **ítems de menú = pantallas** (cada una con su `page.tsx`).
- Los puntos `1.3.4.1.1`, `1.3.4.1.2`, etc. son **ventanas internas** de esa pantalla (componentes `Pestana*.tsx`). Cumplen la sección 3A: **ninguna ventana interna repite un ítem del menú**.

| Pantalla (ítem de menú) | Ruta | Ventanas internas (componentes `Pestana*.tsx`) | Modales y cajones |
|---|---|---|---|
| **1.3.4.1 Configuración de formulario** | `/admin/procesos/cambios/formulario` | 1.3.4.1.1 Campos (`PestanaCampos`, con cajón "Agregar campo" y panel de propiedades) · 1.3.4.1.2 Campos personalizados (`PestanaCamposPersonalizados`) · 1.3.4.1.3 Listas y catálogos (`PestanaCatalogos`) · 1.3.4.1.4 Cuestionario de riesgo (`PestanaCuestionarioRiesgo`) · 1.3.4.1.5 Prioridad (`PestanaPrioridad`) · 1.3.4.1.6 Plantillas de RFC (`PestanaPlantillas`) · 1.3.4.1.7 Vista del ticket (`PestanaVistaTicket`) | `ModalVistaPrevia` · `ModalPublicacion` · `ModalHistorialVersiones` · `ModalRestaurarFabrica` · `BarraAccionesComun` |
| **1.3.4.2 Tipos de cambio y requisitos** | `/admin/procesos/cambios/tipos-requisitos` | 1.3.4.2.1 Tipos de cambio (`PestanaTiposCambio`) · 1.3.4.2.2 Matriz de autoridad (`PestanaMatrizAutoridad`) · 1.3.4.2.3 Modelos de cambio estándar (`PestanaModelosEstandar`) · 1.3.4.2.4 Reglas de clasificación (`PestanaReglasClasificacion`) | Modales comunes |
| **1.3.4.3 Flujo de evaluación, autorización y revisión posterior** | `/admin/procesos/cambios/flujo-evaluacion` | 1.3.4.3.1 Estados (`PestanaEstados`) · 1.3.4.3.2 Transiciones y acciones (`PestanaTransiciones`) · 1.3.4.3.3 Etapas de aprobación (`PestanaEtapasAprobacion`) · 1.3.4.3.4 Comités (`PestanaComites`) · 1.3.4.3.5 Plazos y escalamiento (`PestanaPlazosEscalamiento`) · 1.3.4.3.6 Tareas y checklists (`PestanaTareasChecklists`) · 1.3.4.3.7 Implementación y cierre (`PestanaImplementacionCierre`) · 1.3.4.3.8 Revisión post-implementación (`PestanaPir`) | Modales comunes |
| **1.3.4.4 Notificaciones y calendario de cambios** | `/admin/procesos/cambios/notificaciones-calendario` | 1.3.4.4.1 Notificaciones (`PestanaNotificaciones`) · 1.3.4.4.2 Ventanas de mantenimiento (`PestanaVentanasMantenimiento`) · 1.3.4.4.3 Períodos de congelamiento (`PestanaPeriodosCongelamiento`) · 1.3.4.4.4 Feriados (`PestanaFeriados`) · 1.3.4.4.5 Conflictos y capacidad (`PestanaConflictosCapacidad`) · 1.3.4.4.6 Presentación del calendario (`PestanaPresentacionCalendario`) | Modales comunes |

### 2.3 Estado actual de la implementación (según el árbol de archivos del repositorio)
| Pantalla | Ya existe | Falta o hay que corregir |
|---|---|---|
| `/admin/procesos/cambios/page.tsx` | Página padre del grupo | Verificar que no repita los 4 ítems del menú como pestañas o botones superiores. |
| `1.3.4.1` formulario | `page.tsx`, `BarraAccionesComun`, los 4 modales y las 7 ventanas `Pestana*`. API: `/api/admin/cambios/{formulario/configuracion,campos-personalizados,catalogos,cuestionario-riesgo,plantillas}` | Mover los modales y la barra a la ubicación compartida (3A.2.6); auditar contra la sección 6; validaciones e íconos. |
| `1.3.4.2` tipos y requisitos | `page.tsx` y las 4 ventanas. API: `/api/admin/cambios/{tipos-requisitos/configuracion,matriz-autoridad,matriz-autoridad/simular,modelos-estandar,reglas-clasificacion,reglas-clasificacion/simular}` | Auditar contra la sección 7; validaciones e íconos. |
| `1.3.4.3` flujo | `page.tsx`, 8 ventanas e `Iconos.tsx` local. API: `/api/admin/cambios/flujo-evaluacion/{configuracion,simular-escalamiento,simular-etapas,simular-quorum,validar-flujo}` | **Eliminar `Iconos.tsx` local** y usar el módulo compartido de íconos (3B.3); auditar contra la sección 8. |
| `1.3.4.4` notificaciones y calendario | `page.tsx`, 6 ventanas e `Iconos.tsx` local. API: `/api/admin/cambios/notificaciones-calendario/{configuracion,congelamiento,congelamiento/csv,feriados,feriados/csv,simular-conflictos}` | **Eliminar `Iconos.tsx` local**; reutilizar la tabla de feriados que ya lee `src/lib/sla.ts` (ver 12.0); auditar contra la sección 9. |
| Heredado | `/admin/rfc/page.tsx`, `/api/admin/rfc-config`, `src/components/itsm/ConfiguracionRfc.tsx` | Decidir en la Etapa 0 si se **migran y retiran** (recomendado) para que exista una única configuración de RFC. |

### 2.4 Pantallas operativas que consumen esta configuración
| Menú general | Ruta | Archivos |
|---|---|---|
| 5.1.1 Registrar solicitud RFC | `/cambios/gestion/crear` | `src/app/plataforma/cambios/gestion/crear/page.tsx` |
| 5.1.2 Calendario de ventanas | `/cambios/gestion/calendario` | `.../gestion/calendario/page.tsx` |
| 5.1.3 Historial consolidado | `/cambios/gestion/todos` | `.../gestion/todos/page.tsx` |
| 5.2.1 Dictamen colegiado CAB | `/cambios/gestion/cab` | `.../gestion/cab/page.tsx` |
| Ticket de RFC | `/cambios/gestion/[id]` | `.../gestion/[id]/page.tsx` |
| Técnico M5.1 a M5.6 | `/tecnico/cambios/{mis-cambios,nuevo,implementacion,calendario,impacto,historial}` | `src/app/plataforma/tecnico/cambios/*` |
| API de operación | `/api/cambios`, `/api/cambios/[id]` | `src/app/api/cambios/*` |
Las secciones 4 y 5 describen lo que esas pantallas deben mostrar; si algo difiere, aplica la pregunta 1 de la sección 15.

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
Por cada pantalla existen tres permisos: `ver`, `editar` (guardar borrador) y `publicar`. Detalle en la sección 10.

### 3.7 Validaciones generales
- Mensajes de error junto al campo (rojo) y resumen al inicio de la pestaña con enlaces a cada error.
- Nombres, etiquetas y códigos: sin espacios iniciales/finales, único dentro de su lista, sin caracteres de control. Códigos: `^[a-z][a-z0-9_]{2,39}$`, inmutables tras la primera publicación.
- Toda eliminación pide confirmación y, si el elemento está en uso, se ofrece **Desactivar** en lugar de eliminar.


---

## 3A. REGLAS DE INTERFAZ OBLIGATORIAS (navegación, ventanas internas y accesibilidad)

Estas reglas aplican a **todas** las pantallas de este prompt y prevalecen sobre cualquier descripción anterior que las contradiga.

### 3A.1 Un ítem de menú = una pantalla (prohibido duplicar el menú dentro de la página)
1. **Prohibido** repetir ítems del menú lateral como pestañas, botones segmentados, chips o enlaces en la parte superior de una página. *Ejemplo del error que se debe evitar:* entrar a "Catálogo de incidentes" y ver arriba los botones "Catálogo de incidentes | Catálogo de solicitudes" cuando ambos ya son opciones del menú. Para cambiar de pantalla se usa el menú.
2. Antes de implementar o modificar una pantalla, **compara** sus pestañas internas con el árbol de menú real (`src/lib/menu.ts` y la tabla de menú que alimenta `/api/menu`). Si una pestaña coincide en nombre o función con un ítem de menú, **elimínala** de la página.
3. El título de la página, el breadcrumb y el ítem activo del menú coinciden siempre. El botón "Volver" solo existe en pantallas que **no** son ítem de menú (detalle o edición, por ejemplo `/admin/servicios/[id]/formulario`).

### 3A.2 Ventanas internas (permitidas y recomendadas)
1. Una pantalla **sí** puede tener varias **ventanas internas intercambiables** cuando son secciones o herramientas de esa misma pantalla que **no existen** como ítem de menú (ejemplo: en un formulario configurable, las ventanas "Configuración de campos", "Agregar campo" y "Vista previa").
2. Cada ventana interna es un componente `Pestana*.tsx` dentro de la carpeta `components/` de la página (convención ya usada en el proyecto). La barra de ventanas internas tiene **estilo propio** (subrayado o segmentado pequeño, `role="tablist"`), claramente distinto del menú lateral.
3. La ventana activa se guarda en el parámetro de consulta `?vista=<codigo>` para poder compartir el enlace y volver con el botón del navegador. **Cambiar de ventana interna no cambia el ítem activo del menú.**
4. Las acciones puntuales (vista previa, publicar, historial de versiones, restaurar valores de fábrica, confirmaciones) usan **modales o cajones laterales** (`ModalVistaPrevia`, `ModalPublicacion`, `ModalHistorialVersiones`, `ModalRestaurarFabrica`), nunca ventanas internas.
5. Los **selectores de contexto** (por ejemplo "Formulario: Registro / Edición", "Aplicar a: tipo") son **listas desplegables** que filtran los datos de la ventana; no se presentan como pestañas.
6. Los componentes comunes de las pantallas de configuración (`BarraAccionesComun`, `ModalPublicacion`, `ModalHistorialVersiones`, `ModalRestaurarFabrica`, `ModalVistaPrevia`) hoy están **duplicados** en `procesos/problemas/formulario/components/` y `procesos/cambios/formulario/components/`. **Unifícalos** en un único lugar compartido (`src/shared/components/ui/` o `src/components/admin/`) y haz que ambos módulos y el de activos los importen.

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
- Verifica con qué librería están dibujados los íconos actuales. Si el proyecto ya usa `lucide-react`, úsala. Si no, crea **un único módulo compartido** `src/shared/components/ui/Iconos.tsx` (o `src/components/ui/Iconos.tsx`) con los SVG de los nombres de la tabla 3B.4, con el mismo estilo.
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
3. **Solo se muestran errores.** No hay mensajes, íconos ni bordes de éxito (sin check verde). El error usa el componente `AlertaCampo` (`src/components/ui/AlertaCampo.tsx`: `role="alert"`, texto `#b91c1c`, fondo `#fef2f2`, borde `#fecaca`) y borde rojo en el campo con `aria-invalid="true"` y `aria-describedby`.
4. **Un solo mensaje por campo** (el más específico), breve, en español, que diga qué corregir ("Ingresa 8 dígitos numéricos"), sin tecnicismos.
5. **Restricción de entrada:** los campos numéricos y de identificación filtran caracteres inválidos al teclear y al pegar (`inputMode`, `maxLength`, máscara) y normalizan el valor (recortar espacios, colapsar espacios múltiples, mayúsculas donde corresponda). Si se pega contenido inválido, se limpia y se muestra el mensaje.
6. **Campos dependientes:** el valor de un selector controla el validador del campo siguiente. Ejemplo obligatorio: **Tipo de documento = DNI / RUC / Carné de extranjería / Pasaporte** → el campo "Número de documento" cambia de inmediato su `maxLength`, `inputMode`, máscara y validador (V-DNI, V-RUC, V-CE, V-PAS). Al cambiar el selector, el número se revalida; si ya no es válido se marca el error (o se limpia, según la regla del campo).
7. **Misma lógica en cliente y servidor:** todos los validadores viven en `src/lib/validaciones.ts` (y los específicos de módulo en `src/modules/<dominio>/<modulo>Validaciones.ts`), son funciones puras que devuelven `{ valido: boolean, mensaje?: string }` y se importan tanto en el formulario como en el Route Handler. El servidor responde `400` con `{ campo, mensaje }` y la interfaz lo pinta en el campo correspondiente.
8. **Botón primario:** mientras exista algún error de formato visible, queda deshabilitado (`aria-disabled`) con tooltip "Corrige los campos marcados". Los obligatorios vacíos no lo deshabilitan: al hacer clic se muestran los errores y se enfoca el primero.
9. **Unicidad (nombre, código, serie, hostname):** validación asíncrona con *debounce* de 400 ms contra el servidor; mientras consulta, el campo muestra un indicador discreto de carga **sin** mensaje; si hay duplicado, error ("Ya existe un registro con ese código").
10. **Coherencia entre campos:** fecha inicio < fecha fin, SLA primera respuesta < SLA resolución, mínimo ≤ máximo, etc. El error se muestra en el campo que debe corregirse.
11. **Sanitización:** eliminar etiquetas HTML y caracteres de control del texto simple; el texto enriquecido se sanea con lista blanca; consultas siempre parametrizadas; apoyarse en `src/lib/security.ts`.
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

**Hecho confirmado:** el sistema ya tiene la matriz impacto × urgencia → prioridad (P1 Crítica, P2 Alta, P3 Media, P4 Baja), con niveles Alta/Media/Baja, usada al crear incidentes. Ubicación probable: `1.2.5 Objetivos SLA` (`/admin/servicios/sla`, `MatrizPrioridadSla.tsx`, API `/api/admin/sla/matriz`) y cálculo en `src/lib/sla.ts`; confírmala en la Etapa 0. **Prohibido crear una matriz paralela como comportamiento por defecto.**

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

**Cómputo del tiempo:** los calendarios hábiles de `src/lib/sla.ts`. No se crea un calendario laboral nuevo aquí (los feriados de 1.3.4.4.4 solo se usan para el calendario de cambios).

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
**Nota:** `src/lib/sla.ts` ya usa calendarios hábiles; verifica en la Etapa 0 qué tabla de feriados lee y reutilízala. La tabla de feriados es la que ya lee el motor de SLA (se reutiliza); solo se crean, si faltan, las tablas de ventanas de mantenimiento y de períodos de congelamiento (`ventanas_mantenimiento`, `periodos_congelamiento`; sección 13). No modifiques el motor de SLA existente.

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

### 12.0 Hechos de arquitectura (de `ARQUITECTURA_Y_JERARQUIA_SRC.md`)
- **Framework:** Next.js 14 (App Router); pantallas en `src/app/plataforma/`, API en `src/app/api/`. Sesión con cookie `sesion_tickets` (JWT) y perfil activo conmutable (`/api/auth/cambiar-perfil`). Menú dinámico desde `/api/menu` + `src/lib/menu.ts`.
- **Base de datos:** pool `pg` de `src/lib/db.ts`; sin acceso directo desde el cliente.
- **Validaciones:** `src/lib/validaciones.ts` y `src/components/ui/AlertaCampo.tsx` (solo errores en rojo).
- **SLA:** `src/lib/sla.ts` (matriz Urgencia × Impacto y **calendarios hábiles**); edición en `1.2.5 Objetivos SLA` (`/admin/servicios/sla`, `MatrizPrioridadSla.tsx`, `/api/admin/sla/matriz`), ubicación probable de la matriz compartida.
- **Cambios:** pantallas operativas bajo `/cambios/gestion/*`; configuración bajo `/admin/procesos/cambios/*`; componentes `Iconos.tsx` duplicados en `flujo-evaluacion` y `notificaciones-calendario`; modales comunes duplicados con los de problemas.
- **Heredado:** `/admin/rfc` y `ConfiguracionRfc.tsx` (configuración antigua de RFC).
- **Ticket de incidente:** presentadores por rol y secciones como `TarjetaAprobacionSod` (segregación de funciones en aprobaciones), `CockpitTemporizadorSla`, `PanelInfraestructuraCi`; reutiliza esos patrones en el ticket de RFC.


| Tema | Lo confirmado |
|---|---|
| Stack | Next.js 14 (App Router) y PostgreSQL en Supabase (pool `pg` de `src/lib/db.ts`); acceso completo al código, base de datos, frontend y backend. |
| Matriz impacto × urgencia | Existe y se usa al crear incidentes (P1–P4; niveles Alta/Media/Baja). Ubicación probable: `1.2.5 Objetivos SLA` (`/admin/servicios/sla`, `MatrizPrioridadSla.tsx`, API `/api/admin/sla/matriz`) y cálculo en `src/lib/sla.ts`; confírmalo en la Etapa 0. Los cambios la reutilizan. |
| 1.2.5 Objetivos SLA | Solo tiene la "Matriz Institucional de Tiempos por Prioridad" (primera respuesta y resolución en horas). Los plazos de cambios (8.5) **no** se registran ahí. |
| Formulario de Incidentes y creador de campos | Existen; se extienden a la entidad `cambio`. |
| Perfiles | Administrador, Técnico, Solicitante, Supervisor, Gestor de Área, Auditor, Aprobador, Gestor de Cambios, Gestor de Activos y Configuración. (Gestor de Problemas lo crea el Prompt 1.) |
| Calendarios, feriados, ventanas, congelamientos | `src/lib/sla.ts` ya usa **calendarios hábiles**; verifica qué tablas de horario y feriados lee. Las pestañas `PestanaFeriados`, `PestanaVentanasMantenimiento` y `PestanaPeriodosCongelamiento` ya existen: **reutiliza la tabla de feriados del motor de SLA** y crea solo lo que falte (ventanas y congelamientos). |
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

**13.4 Tablas de calendario (reutiliza lo existente de `src/lib/sla.ts` y crea solo lo que falte):**
- Feriados: usa la tabla que ya lee `src/lib/sla.ts`; si no existe, crea `calendario_feriados` (fecha o rango, nombre, tipo, alcance, recurrente anual, activo).
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
26. Los feriados usan la misma tabla que lee `src/lib/sla.ts`; las ventanas y los congelamientos existen y no alteran el motor de SLA.
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

**Punto de partida de la Etapa 0 (según el árbol de archivos):** el informe debe incluir una **tabla de diferencias** entre este documento y lo ya implementado en `/admin/procesos/cambios/*` (2.2 y 2.3): por cada ventana interna indica existe / falta / incompleta, qué validadores (3C) e íconos (3B) le faltan y qué elementos duplican ítems del menú (3A). Indica además qué calendario y qué feriados usa realmente `src/lib/sla.ts` y si `/admin/rfc` puede retirarse.

**Antes de escribir código**, revisa el repositorio y la base de datos y entrégame un **informe** (sin modificar nada) con:

1. **Matriz de prioridad:** dónde está, cómo se consume, si tiene pantalla de edición.
2. **Motor de SLA:** dónde está y si cuenta horas corridas u hábiles; cómo se pausan y reanudan relojes.
3. **Componentes reutilizables:** editor de formulario de 1.3.1.1, creador de campos, constructor de reglas, motor de estados de Incidentes, componente de borrador/publicación/versionado (si el Prompt 1 ya lo creó), sistema de notificaciones (1.6) y si admite destinatarios dinámicos y plantillas por evento, jobs programados, componentes de UI (tablas, modales, calendario, arrastrar-y-soltar).
4. **Perfiles y permisos:** cómo se almacenan y verifican en `src/middleware.ts`, `src/lib/menu.ts`, `src/lib/page-auth.ts` y los Route Handlers.
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
