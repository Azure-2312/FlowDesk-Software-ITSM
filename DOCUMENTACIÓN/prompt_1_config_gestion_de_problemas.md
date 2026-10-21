# PROMPT 1 de 3 — Configuración del administrador: GESTIÓN DE PROBLEMAS

> **Pantallas que se implementan (menú del Administrador, raíz `Problemas`):** `Configuración de formulario` (`/plataforma/admin/procesos/problemas/formulario`) · `Flujo de investigación y seguimiento` (`/plataforma/admin/procesos/problemas/flujo`) · `Relación con incidentes, errores conocidos y conocimiento` (`/plataforma/admin/procesos/problemas/relaciones`).
> **Módulo dueño y único perímetro de trabajo:** `src/modules/problemas` (ver sección 0A). **Prompts hermanos (se entregan por separado):** Prompt 2 = Cambios (módulo `cambios`) · Prompt 3 = Activos y CMDB (módulos `activos` y `cmdb`).
> **Idioma de la interfaz:** español. **Código, tablas y endpoints:** nombres en español `snake_case` salvo convención técnica.
> **Stack real del proyecto:** Next.js 14.2 (App Router), React 18, TypeScript 5.5 y PostgreSQL en Supabase accedido con el pool `pg` de `@/shared/lib/db`. Arquitectura **vertical slice**: toda la lógica de un dominio vive en `src/modules/<modulo>/`; `src/app` solo contiene cascarones delgados.
> **Documentos normativos (se adjuntan junto con este prompt):** `ARQUITECTURA_Y_CODIGO.md` (diseño técnico, contratos, guardas, modelo de datos) y `MENUS_Y_PERFILES.md` (árbol de menú, perfiles y SoD). Precedencia: el **código y la base vigentes** mandan sobre conteos y nombres; esos dos documentos mandan sobre diseño técnico y menú; este prompt manda sobre el contenido funcional de las tres pantallas.
> **Versión del documento:** 3.0 (adaptada a la arquitectura modular vigente al 2026-10-21; el contenido funcional de la v2.0 se conserva).

### Qué cambió respecto de la v2.0 (solo estructura; el contenido funcional no cambia)
| v2.0 (arquitectura anterior) | v3.0 (arquitectura vigente) |
|---|---|
| Menú numerado `1 Configuración > 1.3 > 1.3.3` | La raíz **Configuración ya no existe**. Las tres pantallas viven bajo la raíz **Problemas** del menú del Administrador. Las referencias `1.x.x` a otras pantallas se sustituyen por su **nombre y ruta** (sección 2.1). |
| Rutas `/admin/...`, `/problemas/...`, `/tecnico/...` | Rutas canónicas `/plataforma/...` (los alias sin `/plataforma` son reescrituras de `next.config.js`, no destinos). |
| Código en `src/lib`, `src/components`, `src/modules/admin` | `src/modules/problemas` (dominio), `src/shared` (infraestructura transversal) y cascarones en `src/app`. |
| Cookie `sesion_tickets`, JWT manual | Cookie `sesion`; guardas compartidas `sesionConCapacidad` / `exigirCapacidadPagina` y capacidades `dominio:acción`. |
| Permisos `config.problemas.*`, `problemas.*` | Capacidades `problemas:config:*`, `problemas:*`, `kedb:*` (sección 9). |
| Se creaba el perfil Gestor de Problemas y se tocaban otras pantallas | El perfil **ya existe** (id 10). **Este prompt solo toca el módulo `problemas`**; lo que requiere otros módulos se entrega como solicitud (sección 16). |

---

## 0. Instrucciones para la IA que implementará esto

**Rol:** eres un arquitecto/desarrollador senior de software ITSM. Vas a construir el área de configuración del *administrador* para el proceso de Gestión de Problemas de FlowDesk, un sistema ITSM que ya tiene Incidentes, Solicitudes de servicio, Cambios, Activos y CMDB.

**Reglas obligatorias:**

1. Implementa **exactamente** lo descrito. Si algo no está especificado, **no lo inventes**: antes de escribir código, devuelve el informe de la Etapa 0 con las "Preguntas abiertas" (sección 14) y espera respuesta.
2. **No cambies la estructura ni los nombres del menú.** No se crean, mueven ni renombran opciones de `opciones_menu` / `opciones_menu_perfiles` (pertenecen al módulo `plataforma`). Las tres pantallas ya existen en el menú del Administrador.
3. **Nada hardcodeado:** todo lo que aquí se llama "configurable" se guarda en base de datos y se lee en tiempo de ejecución. Los valores de fábrica (sección 10) se cargan como datos semilla.
4. Todas las pantallas siguen el **patrón común de la sección 3** (borrador, publicación, versionado, auditoría, permisos).
5. **Reutiliza lo que ya existe; no crees duplicados.** Existen (ubícalos en la Etapa 0): el editor de formularios y el **creador de campos personalizados** (módulo `tickets`), la **matriz impacto × urgencia → prioridad** y la **matriz institucional de tiempos por prioridad** (módulo `servicios`), `calcularPrioridadITIL` (contrato de `tickets`), el motor de SLA con calendarios hábiles, el catálogo de servicios, los perfiles (módulo `identidades`), los técnicos y grupos (módulo `organizacion`) y la CMDB (módulo `cmdb`). Consúmelos **solo por contrato** (`@/modules/<modulo>` o `@/modules/<modulo>/ui`); no los copies ni los modifiques.
6. Para cada pantalla entrega, en este orden: (a) modelo de datos, (b) API, (c) interfaz, (d) validaciones, (e) permisos, (f) auditoría, (g) pruebas. **Pruebas:** el proyecto no tiene suite automatizada; entrega las reglas críticas como funciones puras verificables y un checklist de humo por perfil (panel + 3 pantallas + 1 detalle). No agregues un framework de pruebas sin aprobación (pregunta abierta 4).
7. Trabaja por etapas y detente al final de cada una para validación: **Etapa 0** = reconocimiento del código y la base de datos (sección 14, **obligatoria antes de escribir código**), **Etapa A** = pantalla `formulario` (1.3.3.1), **Etapa B** = `flujo` (1.3.3.2), **Etapa C** = `relaciones` (1.3.3.3). Al cerrar cada etapa ejecuta los *quality gates*: `npx tsc --noEmit` sin errores, `npm run build` sin errores, migraciones aplicadas en base limpia y en base existente, y humo de las rutas afectadas.
8. **Si falta un dato en la base de datos y pertenece al módulo `problemas`, agrégalo.** Todo cambio de esquema va en `db/migrations/YYYYMMDD_descripcion.sql` (idempotente, fecha igual o posterior a la última migración existente; no se edita una migración aplicada) y se refleja en `db/seed.sql` si hay catálogos o datos maestros. Si el dato pertenece a **otro** módulo (por ejemplo una columna de `ticket_incidente`, `servicio_catalogo` o `elemento_configuracion`), **no lo agregues**: regístralo como solicitud (sección 16).
9. Sigue las convenciones del repositorio: tablas y columnas en `snake_case`; baja lógica con `estado_registro boolean`; auditoría por columnas (`usuario_creacion`, `fecha_creacion`, `usuario_modificacion`, `fecha_modificacion`); extensibilidad por `campos_adicionales jsonb`; FK como `id_*`. No se eliminan datos históricos por conveniencia.
10. Las pantallas de este prompt **ya existen parcialmente** (ver 2.3). **No las reconstruyas desde cero**: audítalas contra este documento, corrige diferencias, completa lo que falta y conserva datos y contratos de API existentes.
11. **Arquitectura de código (obligatoria):**
    - `page.tsx` y `route.ts` en `src/app` son **cascarones**: la página valida con `exigirCapacidadPagina(...)` y monta una vista del módulo; el `route.ts` declara `dynamic = "force-dynamic"`, `revalidate = 0` y reexporta el controlador. Sin SQL, sin reglas de negocio.
    - Controlador (`src/modules/problemas/**/api/*Controller.ts`): autoriza con `sesionConCapacidad(CAPACIDADES.X)`, valida la forma del request, delega en el servicio y traduce errores con `respuestaError`. **Prohibido** crear guardas propias (`guardia.ts` o equivalentes) y **prohibido** verificar el JWT a mano.
    - Servicio (`.../services/*`): contiene la regla de dominio y el SQL parametrizado (`query` de `@/shared/lib/db`); lanza `ErrorDominio`; no conoce `NextRequest` ni `NextResponse`.
    - Las vistas cliente reciben datos o contexto; no acceden a la base.
    - Los validadores son funciones puras compartidas por el formulario y el controlador (ver 3C).
12. Cumple en **todas** las pantallas las secciones **3A** (navegación sin duplicar el menú), **3B** (íconos y botones) y **3C** (validaciones en tiempo real, solo errores).
13. **Autorización en tres capas:** página (`exigirCapacidadPagina`), API (`sesionConCapacidad`) y servicio (alcance y segregación de funciones). El middleware solo comprueba que exista la cookie `sesion`; **no autoriza**. El servidor no confía en el cliente: SoD, SLA, transiciones y permisos se validan siempre en el servicio.
14. **SLA:** reutiliza el motor de SLA existente (calendarios hábiles, matriz Urgencia × Impacto); no crees otro. Etapa 0 indica en qué módulo vive (antes estaba en `src/lib/sla.ts`).
15. **Commits y ramas:** trabaja en la rama del módulo (`feature/alexis-problemas-conocimiento`); commits `tipo(problemas): descripción` en español, imperativo, sin emojis (`feat`, `fix`, `refactor`, `docs`, `chore`, `test`); no mezcles refactor masivo con funcionalidad.

---

## 0A. Perímetro del módulo (qué puedes tocar y qué no)

**Regla de oro:** trabajas **dentro de `src/modules/problemas`**: puedes crear carpetas y archivos, modificarlos y eliminarlos. **No puedes** crear módulos nuevos en `src/modules/`, **dividir `problemas` en dos módulos**, ni modificar otro módulo.

| Zona | Permiso |
|---|---|
| `src/modules/problemas/**` | **Total** (crear, modificar, eliminar; incluida la carpeta nueva `configuracion/` y `docs/`). |
| Cascarones: `src/app/plataforma/admin/procesos/problemas/**/page.tsx` y `src/app/api/admin/problemas/**/route.ts` | Solo montar/reexportar lo del módulo. Conserva las rutas y los contratos de API existentes. |
| `db/migrations/` y `db/seed.sql` | Solo tablas y datos del módulo (`problema*`, `error_conocido*`, `problema_config_*`). |
| `src/modules/<otro>/**` (`tickets`, `incidentes`, `solicitudes`, `cambios`, `servicios`, `cmdb`, `activos`, `organizacion`, `identidades`, `plataforma`, `conocimiento`, `reportes`, `perfiles`, …) | **Prohibido modificar.** Se consumen por contrato (`index.ts` / `ui.ts`) o, si falta algo, por **solicitud** (sección 16). |
| `src/shared/**`, `src/middleware.ts`, `next.config.js`, `package.json`, tablas `opciones_menu*` | **Prohibido modificar.** Lo que falte se pide en la sección 16. |

**Cómo se consume a otros módulos:** solo `@/modules/<modulo>` o `@/modules/<modulo>/ui`. Prohibido importar `services/`, `api/`, `views/` o `components/` de otro módulo. Para datos de otro dominio se permite SQL de **lectura acotada** dentro de un servicio propio, nunca importar sus repositorios. El grafo de dependencias debe seguir acíclico.

**Cómo se expone lo que otros módulos necesitan:** agrega a `src/modules/problemas/index.ts` (servidor) y, solo si hay UI que otro módulo deba montar, a `src/modules/problemas/ui.ts` (cliente, sin acceso a DB). Cambiar un contrato es cambiar una API interna: documenta el cambio.

**Solicitudes a otros módulos:** cuando algo requiera tocar un módulo ajeno, no lo implementes: regístralo en `src/modules/problemas/docs/SOLICITUDES_A_OTROS_MODULOS.md` (formato de la sección 16: id, módulo destino, qué se necesita, contrato propuesto, comportamiento mientras no exista) y continúa con la **degradación definida** para ese caso. Las solicitudes ya conocidas están en la sección 16.

**Estructura sugerida dentro del módulo** (si la Etapa 0 encuentra una equivalente ya existente, úsala; no dupliques):

```
src/modules/problemas/
├── index.ts                       # contrato de servidor
├── ui.ts                          # contrato de UI (solo si otro módulo monta algo, p. ej. BloqueObjetivosProblemas)
├── configuracion/                 # carpeta nueva de esta entrega
│   ├── compartido/                # BarraAccionesComun, Modal*, Boton, BotonIcono, borrador/publicación/versionado/bloqueo
│   ├── validaciones/              # problemaValidaciones.ts (validadores del catálogo 3C que no existan en shared)
│   ├── formulario/                # 1.3.3.1 → components/ (Pestana*), services/, api/, types.ts
│   ├── flujo/                     # 1.3.3.2 → components/, services/, api/, types.ts
│   ├── relaciones/                # 1.3.3.3 → components/, services/, api/, types.ts
│   └── motor/                     # prioridad, asignación, escalamiento, umbral, relojes, tareas programadas
└── docs/                          # INFORME_ETAPA_0.md y SOLICITUDES_A_OTROS_MODULOS.md
```

**Ejemplo de cascarones** (los únicos archivos que escribes fuera del módulo):

```tsx
// src/app/plataforma/admin/procesos/problemas/formulario/page.tsx
export default async function PaginaProblemasFormulario() {
  const { sesion } = exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_CONFIG_VER);
  return <VistaProblemasFormulario sesion={sesion} />;   // importada desde el propio módulo problemas
}

// src/app/api/admin/problemas/configuracion/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;
export { GET, PUT } from "@/modules/problemas/configuracion/formulario/api/configuracionController";
```

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

## 2. Ubicación en el menú y estructura de archivos (arquitectura vigente)

### 2.1 Menú vigente del Administrador (referencia; fuente `MENUS_Y_PERFILES.md` §5, **sin numeración**)

El menú es un catálogo único (`opciones_menu` + visibilidad N:M en `opciones_menu_perfiles`) servido por `src/shared/lib/menu.ts`. Una carpeta tiene `url_menu = ''`; una pantalla tiene URL. **Problemas es una raíz del catálogo** (carpeta) y estas tres pantallas son sus hijas:

```
Problemas  (carpeta, perfil Administrador)
 ├─ Registro de problemas ............................................ /plataforma/problemas                                   (operativa; no se implementa aquí)
 ├─ Configuración de formulario ..................................... /plataforma/admin/procesos/problemas/formulario        <-- SE IMPLEMENTA
 ├─ Flujo de investigación y seguimiento ............................ /plataforma/admin/procesos/problemas/flujo             <-- SE IMPLEMENTA
 └─ Relación con incidentes, errores conocidos y conocimiento ....... /plataforma/admin/procesos/problemas/relaciones        <-- SE IMPLEMENTA
```

**Pantallas de otros módulos que este prompt referencia** (se consumen por contrato; **no se modifican**):

| Nombre en el menú | Ruta canónica | Módulo dueño | Qué se toma de ella |
|---|---|---|---|
| Incidentes › Configuración del formulario | `/plataforma/incidentes/configuracion` | `tickets` (+ `incidentes`) | Editor de formularios y creador de campos personalizados. |
| Incidentes › Flujo de estados y acciones | `/plataforma/admin/tickets-vistas?seccion=estados&tipo=incidente` | `tickets` | Motor de estados y transiciones (referencia de diseño). |
| Catálogo de Servicios › Objetivos SLA | `/plataforma/admin/servicios/sla` | `servicios` | Matriz impacto × urgencia, matriz institucional de tiempos por prioridad. |
| Catálogo de Servicios › Configuración de categorías / Crear servicio | `/plataforma/admin/servicios?vista=categorias` · `?vista=crear` | `servicios` | Servicios activos y su criticidad. |
| Organización › Departamentos y grupos resolutores de TI | `/plataforma/admin/departamentos` | `organizacion` | Grupos resolutores. |
| Organización › Técnicos y niveles de soporte | `/plataforma/admin/tecnicos` | `organizacion` | Técnicos, niveles y ausencias. |
| Plataforma › Identidades › Perfiles y permisos | `/plataforma/admin/perfiles` | `identidades` | Perfiles y capacidades. |
| Plataforma › Menú y notificaciones › Plantillas de correo y otros canales / Configuración de contacto | `/plataforma/admin/notificaciones?seccion=plantillas` · `?seccion=contacto` | `plataforma` | Plantillas y canales de los eventos de dominio. |
| Plataforma › Auditoría de cambios de configuración | `/plataforma/admin/auditoria-sistema` | `plataforma` | Registro de toda acción de configuración. |
| Plataforma › Retención y mantenimiento de datos | `/plataforma/admin/mantenimiento-datos` | `plataforma` | Límites de adjuntos, caducidad de borradores y retención. |
| Conocimiento › Categorías, responsables y reglas de publicación y revisión | `/plataforma/admin/conocimiento-config` | `conocimiento` | Categorías y flujo editorial de artículos. |
| Activos y CMDB › Catálogos (ciclos de vida; tipos de CI y relaciones) | `/plataforma/admin/activos-config/ciclos-vida-transiciones` · `/plataforma/admin/activos-config/cmdb-relaciones` | `activos` / `cmdb` | Reglas de baja, clases y criticidad de CI. |
| Cambios › Configuración de formulario / Flujo / Tipos / Notificaciones | `/plataforma/admin/procesos/cambios/*` | `cambios` (Prompt 2) | Origen = Problema en la RFC y sincronización de estados. |
| Reportes › Reportes de problemas · Tableros | `/plataforma/reportes/problemas` · `/plataforma/reportes/tableros` | `reportes` | Consumen las métricas de la sección 10 (no se modifican aquí). |

### 2.2 Identificadores internos de este documento

El menú ya no está numerado. Los códigos `1.3.3.1`, `1.3.3.2` y `1.3.3.3` (y sus derivados `1.3.3.1.1`, …) se conservan **solo como identificadores de este documento** para citar pantallas y ventanas internas; **no son numeración del menú**. Cada pantalla es un ítem de menú con su `page.tsx` (cascarón); las ventanas internas son componentes `Pestana*.tsx` que **no repiten** ningún ítem del menú (sección 3A).

| Pantalla (ítem de menú) | Ruta canónica | Ventanas internas (componentes `Pestana*.tsx`) | Modales y cajones |
|---|---|---|---|
| **1.3.3.1 Configuración de formulario** | `/plataforma/admin/procesos/problemas/formulario` | 1.3.3.1.1 Campos (`PestanaCampos`, con cajón "Agregar campo" y panel de propiedades) · 1.3.3.1.2 Campos personalizados (`PestanaCamposPersonalizados`) · 1.3.3.1.3 Listas y catálogos (`PestanaListasCatalogos`) · 1.3.3.1.4 Matriz de prioridad (`PestanaPrioridad`) · 1.3.3.1.5 Plantillas de problema (`PestanaPlantillas`) · 1.3.3.1.6 Vista del ticket (`PestanaVistaTicket`) | `ModalVistaPrevia` · `ModalPublicacion` · `ModalHistorialVersiones` · `ModalRestaurarFabrica` · barra `BarraAccionesComun` |
| **1.3.3.2 Flujo de investigación y seguimiento** | `/plataforma/admin/procesos/problemas/flujo` | 1.3.3.2.1 Estados (`PestanaEstados`) · 1.3.3.2.2 Transiciones y acciones (`PestanaTransiciones`) · 1.3.3.2.3 Asignación automática (`PestanaAsignacion`) · 1.3.3.2.4 Objetivos de tiempo (`PestanaObjetivosTiempo`) · 1.3.3.2.5 Escalamiento (`PestanaEscalamiento`) · 1.3.3.2.6 Reapertura (`PestanaReapertura`) · 1.3.3.2.7 Tareas predefinidas (`PestanaTareas`) · 1.3.3.2.8 Problemas mayores (`PestanaMayores`) | Los mismos modales de publicación, historial y restauración |
| **1.3.3.3 Relación con incidentes, errores conocidos y conocimiento** | `/plataforma/admin/procesos/problemas/relaciones` | 1.3.3.3.1 Creación automática por umbral (`PestanaUmbral`) · 1.3.3.3.2 Incidentes vinculados (`PestanaIncidentesVinculados`) · 1.3.3.3.3 Errores conocidos (`PestanaKedb`) · 1.3.3.3.4 Cambios (RFC) (`PestanaRfc`) · 1.3.3.3.5 Conocimiento (`PestanaConocimiento`) · 1.3.3.3.6 CI y servicios (`PestanaCmdb`) | Los mismos modales |

**Ubicación del código de cada pantalla (sugerida):** `src/modules/problemas/configuracion/<formulario|flujo|relaciones>/components/` para las `Pestana*.tsx`; servicios en `.../services/`; controladores en `.../api/`; modales y barra comunes en `src/modules/problemas/configuracion/compartido/`.

### 2.3 Estado actual de la implementación (punto de partida; verifícalo en la Etapa 0)

El código de estas pantallas nació en `src/app/plataforma/admin/procesos/problemas/*/components/` y la migración hacia `src/modules/` está en curso: **la Etapa 0 confirma dónde está hoy cada archivo**. Lo que ya existía (según el inventario previo):

| Pantalla | Ya existe | Falta o hay que corregir |
|---|---|---|
| `/plataforma/admin/procesos/problemas/page.tsx` (página padre) | Página del grupo | **No es ítem de menú** (Problemas es carpeta sin URL). Si existe, que **redirija** a `/formulario`; no la elimines (compatibilidad). No debe mostrar pestañas ni enlaces que repitan el menú. |
| `1.3.3.1` formulario | `page.tsx`, `BarraAccionesComun`, `ModalHistorialVersiones`, `ModalPublicacion`, `ModalRestaurarFabrica`, `ModalVistaPrevia`, `PestanaCampos`, `PestanaListasCatalogos`, `PestanaPlantillas`, `PestanaVistaTicket`. API: `/api/admin/problemas/{configuracion,campos-personalizados,catalogos,matriz-prioridad,plantillas}` | **Faltan** las ventanas `PestanaCamposPersonalizados` y `PestanaPrioridad` (sus APIs ya existen). Llevar los componentes comunes a `configuracion/compartido/` (3A.2.6). Convertir `page.tsx` y `route.ts` en cascarones. |
| `1.3.3.2` flujo | `page.tsx` y las 8 ventanas `Pestana*`. API: `/api/admin/problemas/flujo/{asignacion,escalamiento,estados,mayores,objetivos,reapertura,tareas,transiciones}` | Auditar contra la sección 7; agregar validaciones (3C) y íconos (3B); cascarones. |
| `1.3.3.3` relaciones | `page.tsx` y las 6 ventanas `Pestana*`. API: `/api/admin/problemas/relaciones`, `.../relaciones/kedb`, `.../relaciones/umbral` | Auditar contra la sección 8; agregar validaciones e íconos; cascarones. |

### 2.4 Pantallas operativas que consumen esta configuración (no se implementan aquí)

| Perfil / zona | Pantalla | Ruta canónica |
|---|---|---|
| Administrador, Supervisor, Auditor, Aprobador, Técnico, Gestor de Problemas | Registro de problemas | `/plataforma/problemas` |
| Idem | Errores conocidos (KEDB) | `/plataforma/problemas/kedb` |
| Idem | Detalle del problema (se autoriza por prefijo, sin fila propia de menú) | `/plataforma/problemas/[id]` (presentador `PresentadorProblemaGestor` de `@/modules/tickets/ui`) |
| Técnico | Candidatos de mi grupo · Consultar KEDB · Asignados a mí · De mi grupo · Registrar problema | `/plataforma/perfiles/tecnico/problemas/{candidatos,errores-conocidos,asignados,grupo,nuevo}` |
| Supervisor | Asignación de problemas | `/plataforma/perfiles/supervisor/problemas/asignar` |
| Aprobador | Riesgo aceptado y cierre de problemas mayores | `/plataforma/perfiles/aprobador/problemas` |
| Gestor de Problemas (perfil 10) | Panel · Análisis de causa raíz · Bandeja y asignación · Candidatos · Conocimiento derivado · Incidentes recurrentes · Objetivos de tiempo · Mayores y revisión · RFC derivadas | `/plataforma/gestor-problemas/{panel,analisis,asignacion,candidatos,conocimiento,recurrentes,objetivos,mayores,cambios}` |
| Reportes | Reportes de problemas | `/plataforma/reportes/problemas` (módulo `reportes`) |
| API de operación | Problemas y gestor | `/api/problemas`, `/api/gestor-problemas` |

Las secciones 4 y 5 de este documento describen lo que esas pantallas deben mostrar; si algo difiere de lo implementado, aplica la pregunta 1 de la sección 14. Esas pantallas pertenecen al mismo módulo `problemas` pero **no son parte de esta entrega**: solo deben leer la configuración publicada a través de los servicios que construyas.

---

## 3. Patrón común de TODAS las pantallas de configuración

Aplica a cada pantalla y pestaña de este documento. **No se repite abajo**; solo se indican los botones y reglas *adicionales* de cada pestaña.

### 3.1 Estructura visual
1. **Breadcrumb:** `Problemas > <pantalla> > <ventana interna>` (la raíz `Configuración` ya no existe en el menú).
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
- Las versiones **no se editan ni se borran** (la retención se rige por *Retención y mantenimiento de datos*).

### 3.4 Efecto de la configuración sobre tickets existentes
Regla general (aplicar salvo que la pestaña indique otra cosa):
- Los cambios de **formulario** (campos, obligatoriedad) aplican a tickets **nuevos** y a la edición de tickets en estados no finales. Un campo que pasa a obligatorio **no invalida** tickets ya existentes; solo se exige al editarlos o al ejecutar una transición que lo requiera.
- Un campo que se **oculta** conserva sus datos en base de datos (nunca se borran); solo deja de mostrarse y puede reactivarse.
- Los cambios de **flujo** (estados/transiciones) aplican a todos los tickets abiertos; si un estado en uso se desactiva, la publicación se bloquea con el mensaje "El estado X tiene N tickets; reasígnalos a otro estado" y un asistente de migración (selector de estado destino + botón [Migrar y continuar ⟨ArrowRightLeft⟩]).
- Los valores de listas en uso **no se eliminan**, solo se desactivan.

### 3.5 Auditoría (conecta con *Auditoría de cambios de configuración*, `/plataforma/admin/auditoria-sistema`)
Cada guardado de borrador, publicación, restauración, importación y descarte genera un registro: usuario, IP, fecha-hora UTC, pantalla/pestaña, entidad, valor anterior, valor nuevo, motivo (si lo hay), versión resultante. Los registros son de solo lectura. Se escriben mediante el servicio de auditoría de `@/modules/plataforma` (solicitud S-6); si aún no existe, se guardan en la tabla de auditoría propia del módulo y se exponen para su lectura.

### 3.6 Permisos (conecta con *Perfiles y permisos*; capacidades `dominio:acción`)
Por cada pantalla existen tres niveles de capacidad: `ver`, `editar` (guardar borrador) y `publicar`. Detalle en la sección 9.

### 3.7 Validaciones generales
- Mensajes de error junto al campo (rojo) y resumen al inicio de la pestaña con enlaces a cada error.
- Nombres, etiquetas y códigos: sin espacios iniciales/finales, único dentro de su lista, sin caracteres de control. Códigos: `^[a-z][a-z0-9_]{2,39}$`, inmutables tras la primera publicación.
- Toda eliminación pide confirmación y, si el elemento está en uso, se ofrece **Desactivar** en lugar de eliminar.

---

## 3A. REGLAS DE INTERFAZ OBLIGATORIAS (navegación, ventanas internas y accesibilidad)

Estas reglas aplican a **todas** las pantallas de este prompt y prevalecen sobre cualquier descripción anterior que las contradiga.

### 3A.1 Un ítem de menú = una pantalla (prohibido duplicar el menú dentro de la página)
1. **Prohibido** repetir ítems del menú lateral como pestañas, botones segmentados, chips o enlaces en la parte superior de una página. *Ejemplo del error que se debe evitar:* entrar a "Catálogo de incidentes" y ver arriba los botones "Catálogo de incidentes | Catálogo de solicitudes" cuando ambos ya son opciones del menú. Para cambiar de pantalla se usa el menú.
2. Antes de implementar o modificar una pantalla, **compara** sus pestañas internas con el árbol de menú real (`src/shared/lib/menu.ts`, las tablas `opciones_menu` y `opciones_menu_perfiles` y el árbol de `MENUS_Y_PERFILES.md` §5). Si una pestaña coincide en nombre o función con un ítem de menú, **elimínala** de la página.
3. El título de la página, el breadcrumb y el ítem activo del menú coinciden siempre. El botón "Volver" solo existe en pantallas que **no** son ítem de menú (detalle o edición, por ejemplo `/plataforma/admin/servicios/[id]/formulario`).

### 3A.2 Ventanas internas (permitidas y recomendadas)
1. Una pantalla **sí** puede tener varias **ventanas internas intercambiables** cuando son secciones o herramientas de esa misma pantalla que **no existen** como ítem de menú (ejemplo: en un formulario configurable, las ventanas "Configuración de campos", "Agregar campo" y "Vista previa").
2. Cada ventana interna es un componente `Pestana*.tsx` dentro de `src/modules/problemas/configuracion/<pantalla>/components/` (convención del proyecto). La barra de ventanas internas tiene **estilo propio** (subrayado o segmentado pequeño, `role="tablist"`), claramente distinto del menú lateral.
3. La ventana activa se guarda en el parámetro de consulta `?vista=<codigo>` para poder compartir el enlace y volver con el botón del navegador. **Cambiar de ventana interna no cambia el ítem activo del menú.**
4. Las acciones puntuales (vista previa, publicar, historial de versiones, restaurar valores de fábrica, confirmaciones) usan **modales o cajones laterales** (`ModalVistaPrevia`, `ModalPublicacion`, `ModalHistorialVersiones`, `ModalRestaurarFabrica`), nunca ventanas internas.
5. Los **selectores de contexto** (por ejemplo "Formulario: Registro / Edición", "Aplicar a: tipo") son **listas desplegables** que filtran los datos de la ventana; no se presentan como pestañas.
6. Los componentes comunes de las pantallas de configuración (`BarraAccionesComun`, `ModalPublicacion`, `ModalHistorialVersiones`, `ModalRestaurarFabrica`, `ModalVistaPrevia`) hoy están **duplicados** (en `problemas/formulario/components/` y en `cambios/formulario/components/`). **Dentro de `problemas`**, unifícalos en **una sola copia** en `src/modules/problemas/configuracion/compartido/` y haz que las tres pantallas la importen; elimina las copias locales de problemas. **No edites los de `cambios` ni `activos`**: la promoción a `src/shared/components/ui/` y la unificación entre módulos se pide al Tech Lead (S-10). Si `shared` ya los publica, impórtalos desde allí y no crees copia.

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
- Verifica con qué librería están dibujados los íconos actuales. Si el proyecto ya usa `lucide-react`, úsala. Si ya existe un módulo compartido de íconos en `src/shared/components/ui/` (por ejemplo `Iconos.tsx`), impórtalo. Si no existe ninguno, crea **un único módulo** `src/modules/problemas/configuracion/compartido/Iconos.tsx` con los SVG de los nombres de la tabla 3B.4, con el mismo estilo (su promoción a `shared` se pide en S-10).
- **Unifica dentro de `problemas`** los archivos `Iconos.tsx` locales duplicados y elimina las copias. **No edites** los `Iconos.tsx` de `cambios` (`flujo-evaluacion` y `notificaciones-calendario`) ni de otros módulos: su unificación es la solicitud S-10.
- Si `BotonIcono` y `Boton` ya existen en `src/shared/components/ui/`, úsalos. Si no, créalos en `configuracion/compartido/`: `BotonIcono` (props: `icono`, `etiqueta`, `variante: 'normal' | 'peligro'`, `onClick`, `disabled`) y `Boton` (props: `variante`, `icono?`, `children`), para que ninguna pantalla dibuje botones con estilos propios.

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
3. **Solo se muestran errores.** No hay mensajes, íconos ni bordes de éxito (sin check verde). El error usa el componente `AlertaCampo` (`AlertaCampo`, ubicado en `src/shared/components/ui/AlertaCampo.tsx` (la Etapa 0 confirma la ruta): `role="alert"`, texto `#b91c1c`, fondo `#fef2f2`, borde `#fecaca`) y borde rojo en el campo con `aria-invalid="true"` y `aria-describedby`.
4. **Un solo mensaje por campo** (el más específico), breve, en español, que diga qué corregir ("Ingresa 8 dígitos numéricos"), sin tecnicismos.
5. **Restricción de entrada:** los campos numéricos y de identificación filtran caracteres inválidos al teclear y al pegar (`inputMode`, `maxLength`, máscara) y normalizan el valor (recortar espacios, colapsar espacios múltiples, mayúsculas donde corresponda). Si se pega contenido inválido, se limpia y se muestra el mensaje.
6. **Campos dependientes:** el valor de un selector controla el validador del campo siguiente. Ejemplo obligatorio: **Tipo de documento = DNI / RUC / Carné de extranjería / Pasaporte** → el campo "Número de documento" cambia de inmediato su `maxLength`, `inputMode`, máscara y validador (V-DNI, V-RUC, V-CE, V-PAS). Al cambiar el selector, el número se revalida; si ya no es válido se marca el error (o se limpia, según la regla del campo).
7. **Misma lógica en cliente y servidor:** los validadores existentes viven en la librería compartida de validaciones (antes `src/lib/validaciones.ts`; la Etapa 0 la ubica) y los que falten o sean específicos de problemas se crean en `src/modules/problemas/configuracion/validaciones/` (sin tocar `shared`), son funciones puras que devuelven `{ valido: boolean, mensaje?: string }` y se importan tanto en el formulario como en el controlador (`*Controller.ts`). El servidor responde `400` con `{ campo, mensaje }` y la interfaz lo pinta en el campo correspondiente.
8. **Botón primario:** mientras exista algún error de formato visible, queda deshabilitado (`aria-disabled`) con tooltip "Corrige los campos marcados". Los obligatorios vacíos no lo deshabilitan: al hacer clic se muestran los errores y se enfoca el primero.
9. **Unicidad (nombre, código, serie, hostname):** validación asíncrona con *debounce* de 400 ms contra el servidor; mientras consulta, el campo muestra un indicador discreto de carga **sin** mensaje; si hay duplicado, error ("Ya existe un registro con ese código").
10. **Coherencia entre campos:** fecha inicio < fecha fin, SLA primera respuesta < SLA resolución, mínimo ≤ máximo, etc. El error se muestra en el campo que debe corregirse.
11. **Sanitización:** eliminar etiquetas HTML y caracteres de control del texto simple; el texto enriquecido se sanea con lista blanca; consultas siempre parametrizadas; apoyarse en las utilidades de saneamiento existentes (antes `src/lib/security.ts`; la Etapa 0 las ubica).
12. **Adjuntos:** tipos y tamaño según *Retención y mantenimiento de datos* (fábrica: 25 MB por archivo, 10 archivos, ejecutables bloqueados); el error indica el archivo y el motivo.

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

**Quién lo usa:** perfiles **Técnico**, **Gestor de Problemas** y **Supervisor** (capacidad `problemas:crear`). El **Administrador** configura pero no registra (SoD), y los perfiles Solicitante, Gestor de Área, Auditor y Aprobador **no** registran problemas.
**Dónde:** menú `Problemas › Registro de problemas` (`/plataforma/problemas`) → botón [+ Nuevo problema ⟨Plus⟩]; el Técnico lo hace desde `Problemas › Registrar problema` (`/plataforma/perfiles/tecnico/problemas/nuevo`). También desde un incidente (el botón lo monta el módulo `incidentes`, solicitud S-4; `problemas` expone el servicio de creación): botón **[Crear problema desde este incidente ⟨FilePlus⟩]**, que abre este formulario con Origen = *Incidente(s)*, el incidente ya vinculado, y el servicio, los CI y la categoría prellenados desde el incidente.
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
| B1 | Servicio afectado | `servicio_id` | Lista con búsqueda (Catálogo de Servicios) | Sí | Solo servicios activos. Si hay incidentes vinculados con un único servicio, se prellena y se puede cambiar. |
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
| D1 | Grupo resolutor | `grupo_id` | Lista (grupos de *Departamentos y grupos resolutores de TI*) | Sí | Prellenado por reglas de asignación automática (1.3.3.2.3); editable si el perfil lo permite. |
| D2 | Responsable | `responsable_id` | Lista con búsqueda (técnicos del grupo, *Técnicos y niveles de soporte*) | No al crear | Si queda vacío, el problema se crea en estado *Nuevo* sin responsable y aparece en la bandeja del grupo. Muestra carga actual (tickets abiertos) junto a cada nombre. |

**Sección E — Mitigación**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| E1 | Workaround conocido | `workaround` | Texto enriquecido | No | Si se completa, aparece la casilla "Publicar como error conocido al registrar" (solo con permiso `kedb:publicar`). |

**Sección F — Adjuntos**

| # | Etiqueta | Código | Control | Obligatorio | Reglas |
|---|---|---|---|---|---|
| F1 | Evidencias (adjuntos) | `adjuntos` | Zona arrastrar-y-soltar + botón [Seleccionar archivos ⟨FileUp⟩] | No | Tipos permitidos y tamaño máximo configurables en *Retención y mantenimiento de datos* (valor de fábrica: 25 MB por archivo, 10 archivos; bloquear ejecutables). Muestra nombre, tamaño, barra de progreso y [Quitar ⟨Trash2⟩]. |

**Campos automáticos (no editables; se muestran en un panel lateral "Datos del registro")**
`id` (formato `PRB-000001`, secuencia sin saltos), `registrado_por`, `fecha_registro`, `estado` inicial = *Nuevo*, `origen_canal` (manual / desde incidente / regla automática).

### 4.2 Botones del formulario
- **[Registrar problema ⟨FilePlus⟩]** (primario): valida, crea el ticket, muestra toast "Problema PRB-xxxxxx registrado" y redirige a la vista del ticket.
- **[Registrar y crear otro ⟨FilePlus⟩]**: igual, pero limpia el formulario conservando la plantilla.
- **[Guardar como borrador ⟨Save⟩]**: guarda sin validar obligatorios; el borrador solo lo ve su autor en "Mis borradores" y caduca a los 30 días (configurable en *Retención y mantenimiento de datos*).
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

**Ruta:** `Problemas › Registro de problemas` (`/plataforma/problemas`) › (fila) PRB-xxxxxx → `/plataforma/problemas/[id]` (se autoriza por prefijo; no es opción de menú).
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

**Reutilización obligatoria:** la configuración de formulario de Incidentes (`Incidentes › Configuración del formulario`, módulo `tickets`, núcleo congelado) ya permite configurar campos y tiene un creador de campos. Esta pantalla debe construirse **sobre ese mismo editor, consumido por contrato** (`@/modules/tickets/ui`) para que soporte la entidad `problema` (y, más adelante, `cambio` y `activo`), **no copiándolo ni editando `tickets`**. Lo que ese editor ya haga igual a lo descrito aquí no se reimplementa. Lo que falte se reparte así: lo propio del patrón de configuración de problemas (borrador/publicación, versionado, bloqueo concurrente, importación/exportación, reglas condicionales de problemas) se implementa en `configuracion/compartido/`; lo que exija **cambiar el editor compartido** se solicita en **S-1** para que `tickets` lo adopte **sin cambiar el comportamiento actual de Incidentes**. Mientras tanto se aplica la degradación de S-1 (adaptador, sin copias).

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
| Visible para perfiles | Selector múltiple de perfiles (*Perfiles y permisos*) | Vacío = todos. |
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
   - Archivo: tipos y tamaño máximo (no superior al límite global de *Retención y mantenimiento de datos*).
   - Referencia a CI: clases permitidas.
4. **Ubicación y comportamiento:** formulario(s) donde aparece (Registro / Edición), sección, obligatorio (sí/no/condicional), pestaña de la vista del ticket donde se muestra, visible/editable por perfiles, **Incluir en búsqueda**, **Incluir en reportes y filtros** (se expone a `Reportes de problemas` y `Tableros`), **Incluir en auditoría** (siempre activado, no se puede desmarcar).
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

**Hecho confirmado:** el sistema **ya tiene** una matriz impacto × urgencia → prioridad (P1 Crítica, P2 Alta, P3 Media, P4 Baja) que se usa al crear incidentes. Los niveles de impacto y de urgencia son **Alta / Media / Baja**. Su edición está en la pantalla `Objetivos SLA` (`/plataforma/admin/servicios/sla`, módulo `servicios`; antes `MatrizPrioridadSla.tsx` y API `/api/admin/sla/matriz`) y el cálculo se consume con `calcularPrioridadITIL` (contrato de `tickets`); confírmalo en la **Etapa 0** y documenta cómo se consume desde `problemas`. **Prohibido crear una segunda matriz o un segundo servicio de prioridad paralelos como comportamiento por defecto.**

**Qué hace esta pestaña:**

1. **Matriz vigente (solo lectura por defecto):** cuadrícula impacto × urgencia con la prioridad de cada celda y sus colores, rotulada "Matriz compartida con Incidentes". Debajo, tabla de prioridades (código, nombre, color) tal como están definidas hoy.
2. **Enlace `[Editar matriz compartida → ⟨ArrowUpRight⟩]`:** lleva a la pantalla donde hoy se edita esa matriz. Si hoy la matriz está fija en código y no tiene pantalla de edición, repórtalo en el informe de la Etapa 0 y propón migrarla a una tabla de base de datos con su pantalla; **no lo implementes sin mi aprobación (sería una solicitud al módulo `servicios`)**.
3. **Interruptor `Usar matriz propia para problemas`** (apagado por defecto; **sujeto a la pregunta abierta 1**: se implementa como tabla de anulación de lectura de celda dentro de `problemas`, sin motor de prioridad paralelo). Al encenderlo, un modal pide confirmación ("Los problemas dejarán de usar la matriz de Incidentes"), copia la matriz actual como punto de partida y habilita la edición de la cuadrícula solo para problemas. Si se apaga de nuevo, vuelve a leerse la matriz compartida (la matriz propia se conserva como borrador archivado).
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

Las pestañas **Detalle**, **Comentarios y bitácora** e **Historial / auditoría** no pueden ocultarse. La pestaña **Historial / auditoría** solo puede mostrarse a perfiles con permiso `problemas:auditoria:ver`.

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
| Perfiles autorizados | Selector múltiple (*Perfiles y permisos*) | Además: casillas "Responsable del ticket", "Miembros del grupo resolutor", "Supervisor del grupo". |
| Condiciones previas | Constructor de reglas (igual al de 6.1) | Ej.: "no hay tareas obligatorias pendientes". Si no se cumplen, el botón se deshabilita y el tooltip muestra el motivo. |
| Campos obligatorios en esta transición | Selector múltiple de campos y bloques (causa raíz, workaround, solución permanente, RFC vinculada, código de cierre, etc.) | Al ejecutar, se abre un modal con solo esos campos para completar. |
| Comentario | Ninguno / Opcional / Obligatorio + visibilidad (interno/público) | |
| Confirmación | Interruptor + texto del mensaje | Modal "¿Seguro…?" [Confirmar ⟨CircleCheck⟩] [Cancelar ⟨X⟩]. |
| Requiere aprobación | Interruptor + aprobador (rol/usuario/supervisor del grupo) + plazo | El ticket queda "Pendiente de aprobación" hasta que se aprueba o rechaza (con motivo). |
| Apariencia del botón | Color, ícono, orden | |
| Automatizaciones al ejecutar | Lista ordenable (ver abajo) | |
| Activa | Interruptor | |

**Automatizaciones disponibles:** asignar responsable (aplica reglas de 1.3.3.2.3) · notificar (selecciona evento/plantilla de *Plantillas de correo y otros canales* y destinatarios) · crear tareas (paquete) · registrar fecha-hora en un campo · crear registro KEDB · crear RFC prellenada · actualizar incidentes vinculados (según 1.3.3.3.2) · generar borrador de artículo (1.3.3.3.5) · detener/pausar/reanudar relojes · incrementar contador · marcar etiqueta.

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
- **Acción — Grupo destino:** lista de grupos (*Departamentos y grupos resolutores de TI*).
- **Acción — Estrategia dentro del grupo:** *Dejar sin responsable (bandeja del grupo)* · *Round-robin* · *Menor carga (menos tickets abiertos)* · *Por nivel de soporte mínimo* (selector de nivel *Técnicos y niveles de soporte*) · *Técnico fijo* (selector).
- **Considerar disponibilidad:** interruptor. Omite a los técnicos con una **ausencia vigente**, consultada al módulo `organizacion` por contrato (`esTecnicoDisponible`, solicitud S-5). La tabla de ausencias **pertenece a `organizacion` y no se crea aquí**. Mientras S-5 no esté atendida, el interruptor aparece deshabilitado con el aviso "Requiere el registro de ausencias". No se modelan turnos en esta etapa.
- **Fallback:** grupo/técnico alternativo si no hay candidatos.
- **Notificar al asignar:** interruptor + plantilla.

**Panel "Simulador de asignación":** el admin ingresa categoría, servicio, prioridad y origen, y el sistema muestra la regla que coincide, el grupo y la estrategia.

**Regla de fábrica:** "Todos los problemas → grupo definido por la categoría; si no hay, grupo 'Gestión de Problemas'; sin responsable; notificar al grupo."

**Validación:** debe existir al menos una regla activa sin condiciones (regla comodín) al final de la lista, o el sistema avisa "Algunos problemas podrían quedar sin grupo".

### 7.4 Pestaña 1.3.3.2.4 — Objetivos de tiempo

**Contexto confirmado:** la pantalla `Objetivos SLA` (`/plataforma/admin/servicios/sla`, módulo `servicios`) contiene hoy la **"Matriz Institucional de Tiempos por Prioridad"** con las columnas *Nivel · Prioridad · Primera Respuesta (Horas) · Resolución Total (Horas) · Equivalencia / Descripción Operativa* (P1 Crítica 1 h/4 h, P2 Alta 2 h/8 h, P3 Media 4 h/24 h, P4 Baja 8 h/72 h). El tiempo que aplica a un ticket lo determina su **prioridad**. Esta pestaña sigue exactamente esa lógica para problemas. **No modifiques la matriz de Incidentes y Solicitudes ni el SLA que cada servicio tenga configurado.**

**Qué se configura:** metas internas de tiempo (OLA) por prioridad para problemas. *Nota ITIL:* los problemas no suelen tener SLA con el cliente; son objetivos internos de gestión.

**Cuadrícula (filas = P1 Crítica, P2 Alta, P3 Media, P4 Baja; unidad única: horas):**

| Columna | Detalle |
|---|---|
| Nivel y Prioridad | De solo lectura, leídos de la tabla de prioridades existente. |
| Primera respuesta (horas) | Tiempo máximo hasta que el problema tiene responsable y entra en *En análisis*. |
| Diagnóstico (horas) | Tiempo máximo hasta registrar la causa raíz **o** publicar un workaround (lo primero que ocurra). |
| Resolución total (horas) | Tiempo máximo hasta *Resuelto*. |
| Equivalencia / descripción operativa | Texto editable propio de problemas (ej. "P1: problema que causa incidentes de interrupción total recurrentes"). |

**Cómputo del tiempo:** usa los **calendarios hábiles del motor de SLA existente** (antes `src/lib/sla.ts`; la Etapa 0 indica su módulo actual; documéntalo en la pestaña como texto informativo). **No se crea un módulo de calendarios paralelo: se reutilizan los calendarios hábiles del motor de SLA existente.** Los relojes se pausan, corren o se detienen según la configuración de cada estado (7.1).

**Otras opciones:** umbrales de alerta (por defecto 50 %, 75 %, 90 %; hasta 5) y `[Vista previa de medidores ⟨Eye⟩]` (cómo se verán los dos medidores de la cabecera del ticket).
**Botones:** `[Restaurar valores sugeridos ⟨RotateCcw⟩]` + patrón común.

**Valores sugeridos de fábrica (horas):**

| Prioridad | Primera respuesta | Diagnóstico | Resolución total |
|---|---|---|---|
| P1 Crítica | 4 | 72 | 240 |
| P2 Alta | 8 | 120 | 480 |
| P3 Media | 24 | 240 | 960 |
| P4 Baja | 72 | 480 | 1440 |

**Integración con `Objetivos SLA`:** el módulo `problemas` **exporta** en `src/modules/problemas/ui.ts` el componente de solo lectura `BloqueObjetivosProblemas` ("Objetivos internos de Problemas") con estos mismos valores y un enlace `[Editar en Configuración de problemas → ⟨ArrowUpRight⟩]` hacia `/plataforma/admin/procesos/problemas/flujo?vista=objetivos`. **Montarlo debajo de la matriz existente de `Objetivos SLA` es la solicitud S-3** (pantalla del módulo `servicios`; no se edita aquí). Fuente única de verdad: esta pestaña.

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

**Frontera del módulo (obligatoria en toda esta sección):** aquí **solo se configura** la relación y se **expone el contrato** (servicios en `@/modules/problemas`: configuración publicada, creación de problema desde incidente, sugerencia de errores conocidos, creación de RFC, borrador de conocimiento). Todo lo que "se muestra en el incidente / en el CI / en la RFC / en el artículo" lo pinta el **módulo dueño** leyendo esa configuración por contrato (solicitudes S-4, S-7, S-8 y S-9); este prompt **no edita** esos módulos. Cada ventana debe indicar en un aviso discreto si su efecto en el módulo destino aún no está activo.

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

**Bloque 3 — Audiencia (casillas):** Mesa de servicio · Técnicos de todos los grupos · Técnicos del grupo resolutor · Autoservicio (consola del Solicitante). Se puede definir audiencia distinta por categoría.

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

**Qué se configura:** cómo se genera conocimiento a partir de problemas (ITIL 4: *Knowledge Management*), coordinado con la configuración de Conocimiento (`/plataforma/admin/conocimiento-config`).

**Controles:**
- **Cuándo generar borrador de artículo:** casillas — al publicar error conocido · al resolver · al cerrar · solo manual.
- **Tipo de artículo por evento:** Error conocido (workaround) / Solución definitiva / Guía de resolución.
- **Plantilla del artículo:** editor con secciones y **mapeo de campos del problema**: `Síntomas` ← descripción · `Causa` ← causa raíz · `Workaround` ← workaround · `Solución` ← solución permanente · `Servicios/CI afectados` ← lista · `Referencia` ← enlace al problema · `Palabras clave` ← categoría + servicio. Botones `[Insertar variable ⟨Braces⟩]` `[Vista previa con problema real ⟨Eye⟩]`.
- **Audiencia y categoría del artículo:** por defecto según el error conocido; categoría de la configuración de Conocimiento.
- **Responsable de revisión:** *Autor del problema*, *Responsable de la categoría de conocimiento* (según la configuración de Conocimiento) o *Perfil concreto*.
- **¿Es obligatorio un artículo para cerrar el problema?** (interruptor). Excepciones por código de cierre (casillas).
- **Estado inicial del borrador:** *Borrador* (no editable aquí si la configuración de Conocimiento define otro).
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
- **Servicios:** si el servicio afectado está marcado crítico en el Catálogo de Servicios, activar automáticamente el criterio de problema mayor (enlaza con 7.8).
- **Al retirar/dar de baja un CI** con problemas abiertos: *Avisar al responsable* / *Bloquear la baja* (el bloqueo se aplica desde *Ciclos de vida y reglas de transición*, módulo `activos`; solicitud S-8).


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
| Criticidad mínima | 1.3.3.3.6 | Lista | V-LISTA (criticidades de *Tipos de elementos de configuración y relaciones de CMDB*) |

---

## 9. Perfiles y permisos

**Perfiles existentes (10, catálogo `perfiles`; nombres de BD sin tildes):** 1 Administrador · 2 Tecnico · 3 Solicitante · 4 Supervisor · 5 Gestor de Area · 6 Auditor · 7 Aprobador · 8 Gestor de Cambios · 9 Gestor de Activos y Configuracion · 10 **Gestor de Problemas**.

El perfil **Gestor de Problemas ya existe** (id 10, consola `/plataforma/gestor-problemas/*`). **No lo crees.** Todas las referencias a "Gestor de Problemas" apuntan a ese perfil.

**Modelo de autorización vigente:** RBAC por **capacidades** `dominio:acción` declaradas en `src/shared/lib/capacidades.ts`, con el puente `CAPACIDADES_POR_PERFIL` (todavía no existe `perfil_capacidades`). La **visibilidad de pantallas** la fija el menú (`opciones_menu_perfiles`); las páginas se protegen con `exigirCapacidadPagina` o `exigirMenuPagina`, y la API con `sesionConCapacidad`.

**Capacidades ya declaradas para este dominio** (Etapa 0 las lista todas; se conocen): `problemas:gestionar`, `problemas:config:ver`, `kedb:ver`. El grupo "Problemas y KEDB" tiene 7. **Las que falten se piden en la solicitud S-2** (sección 16): este prompt **no modifica `src/shared`**.

Por cada pantalla de configuración existen tres niveles: `ver`, `editar` (guardar borrador) y `publicar`. Un usuario con `editar` pero sin `publicar` guarda borradores; otro con `publicar` los revisa y publica (separación de funciones, `MENUS_Y_PERFILES.md` §2.1 punto 9). Las transiciones de 1.3.3.2.2 pueden restringir aún más, nunca ampliar, lo que otorgan estas capacidades. Si `cambios` resolvió la granularidad por pantalla (`cambios:config:*`), sigue el mismo criterio; la Etapa 0 lo confirma.

**Frontera de acceso a las pantallas de configuración:** los tres ítems de configuración existen **solo en el menú del Administrador**. Las capacidades `...config:ver` de otros perfiles habilitan únicamente la **lectura de la configuración publicada** (por API o por las consolas operativas), no una pantalla de configuración. Dar pantalla de configuración a otro perfil exige que el módulo `plataforma` añada la visibilidad en el menú (no es parte de esta entrega).

**Matriz de capacidades de fábrica** (✔ = concedido; — = no). Columnas: ADM = Administrador · TEC = Técnico · SOL = Solicitante · SUP = Supervisor · GAR = Gestor de Área · AUD = Auditor · APR = Aprobador · GCA = Gestor de Cambios · GAC = Gestor de Activos y Configuración · GPR = Gestor de Problemas.

| Capacidad | ADM | TEC | SOL | SUP | GAR | AUD | APR | GCA | GAC | GPR |
|---|---|---|---|---|---|---|---|---|---|---|
| `problemas:config:ver` (formulario / flujo / relaciones) | ✔ | — | — | ✔ | — | ✔ | — | — | — | ✔ |
| `problemas:config:editar` | ✔ | — | — | — | — | — | — | — | — | — |
| `problemas:config:publicar` | ✔ | — | — | — | — | — | — | — | — | — |
| `problemas:config:importar-exportar` | ✔ | — | — | — | — | — | — | — | — | — |
| `problemas:config:restaurar` | ✔ | — | — | — | — | — | — | — | — | — |
| `problemas:crear` | — | ✔ | — | ✔ | — | — | — | — | — | ✔ |
| `problemas:ver` | ✔ (todos) | ✔ (su grupo y asignados) | — | ✔ (todos) | — | ✔ (todos, solo lectura) | ✔ (los que le piden aprobar) | ✔ (los vinculados a RFC) | ✔ (los que afectan CI) | ✔ (todos) |
| `problemas:editar` | — | ✔ (asignados) | — | ✔ | — | — | — | — | — | ✔ |
| `problemas:asignar` | — | — | — | ✔ | — | — | — | — | — | ✔ |
| `problemas:cerrar` | — | — | — | ✔ | — | — | — | — | — | ✔ |
| `problemas:reabrir` / `problemas:cancelar` | — | — | — | ✔ | — | — | — | — | — | ✔ |
| `problemas:prioridad-manual` | — | — | — | ✔ | — | — | — | — | — | ✔ |
| `problemas:aprobar` (riesgo aceptado, cierre de problema mayor) | — | — | — | — | — | — | ✔ | — | — | — |
| `problemas:rfc-crear` | — | ✔ (asignados) | — | ✔ | — | — | — | — | — | ✔ |
| `problemas:auditoria:ver` | ✔ | — | — | ✔ | — | ✔ | — | — | — | ✔ |
| `kedb:ver` | ✔ | ✔ | ✔ (solo si la audiencia incluye Autoservicio) | ✔ | — | ✔ | — | ✔ | ✔ | ✔ |
| `kedb:publicar` | — | — | — | — | — | — | — | — | — | ✔ |

**Notas:**
- **Ajustes frente a la v2.0 por la segregación de funciones vigente** (`MENUS_Y_PERFILES.md` §2.1): el **Administrador configura y consulta, pero no opera** (sin `crear`, `editar`, `asignar`, `cerrar`, `rfc-crear`, `kedb:publicar`); el cierre de un problema mayor y la aceptación de riesgo los dicta el **Aprobador** (el Gestor de Problemas **no** acepta su propio riesgo mayor). Si la matriz real del código (`CAPACIDADES_POR_PERFIL`) difiere, repórtalo en la Etapa 0 en lugar de sobrescribirla.
- El Auditor es de **solo lectura**: nunca recibe capacidades de escritura.
- El perfil **Gestor de Área** no tiene acceso a este módulo por defecto.
- Mapeo con lo existente: `problemas:gestionar` cubre hoy las capacidades operativas de `problemas:*`; la Etapa 0 indica qué parte de la matriz ya está cubierta y qué entra en la solicitud S-2.

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

**Eventos de dominio que este módulo emite (para plantillas y canales de *Plantillas de correo y otros canales*):**
`problema.registrado`, `problema.asignado`, `problema.reasignado`, `problema.estado_cambiado`, `problema.causa_raiz_identificada`, `problema.error_conocido_publicado`, `problema.cambio_solicitado`, `problema.objetivo_en_riesgo`, `problema.objetivo_vencido`, `problema.escalado`, `problema.resuelto`, `problema.cerrado`, `problema.reabierto`, `problema.cancelado`, `problema.revision_pendiente`, `problema.mayor_detectado`, `kedb.publicado`, `kedb.revision_proxima`, `kedb.retirado`, `configuracion.publicada`.

**Métricas que los datos deben permitir (para `Reportes de problemas` y `Tableros`):** problemas abiertos por estado/prioridad/categoría · tiempo medio hasta diagnóstico y hasta resolución · % de problemas con causa raíz identificada · % con workaround publicado · problemas proactivos vs reactivos · incidentes recurrentes asociados a problemas abiertos · incidentes evitados tras resolución · errores conocidos vigentes y su uso · % de objetivos cumplidos · reaperturas · problemas mayores y % con revisión completada.

---

## 11. Hechos confirmados del sistema existente (no los vuelvas a preguntar)

### 11.0 Hechos de arquitectura (de `ARQUITECTURA_Y_CODIGO.md` y `MENUS_Y_PERFILES.md`, vigentes al 2026-10-20/21)
- **Framework y alcance:** Next.js 14.2 (App Router), React 18, TypeScript 5.5. 17 módulos en `src/modules/`, 207 route handlers en `src/app/api`, 227 páginas bajo `src/app/plataforma`, 126 tablas base y 1 vista (`vista_ticket`) en `public`, 38 migraciones.
- **Vertical slice:** cada funcionalidad vive completa en `src/modules/<modulo>/` (servicios, controladores, vistas, componentes, tipos). `src/app` es delgado (cascarones). Contratos públicos: `index.ts` (servidor) y `ui.ts` (cliente). Prohibidos los imports profundos entre módulos; `shared` es hoja y nunca importa módulos.
- **Módulo `problemas`:** 85 archivos; contrato `index.ts`; dominio "Problemas, RCA, KEDB y configuración del proceso"; dueño Alexis. Rutas: `/plataforma/problemas/**`, `/plataforma/gestor-problemas/**`; API `/api/problemas`, `/api/gestor-problemas` y la de configuración `/api/admin/problemas/*`.
- **Sesión:** JWT en cookie `sesion` (`httpOnly`, 8 h); pre-sesión de 5 min para elegir perfil cuando el usuario tiene varios. `src/middleware.ts` solo comprueba que la cookie exista.
- **Guardas:** `src/shared/lib/api-auth.ts` (`sesionConCapacidad`, `autorizarApi`, `obtenerSesionDeRequest`) y `src/shared/lib/page-auth.ts` (`exigirCapacidadPagina`, `exigirMenuPagina`). Errores: `ErrorDominio` y `respuestaError` (`src/shared/lib/errores.ts`).
- **Base de datos:** pool `pg` y `query` parametrizado en `src/shared/lib/db.ts` (PostgreSQL en Supabase, pooler con SSL). Sin acceso desde el cliente.
- **Menú:** catálogo único `opciones_menu` + visibilidad N:M `opciones_menu_perfiles`; árbol en `src/shared/lib/menu.ts`; doce raíces (entre ellas **Problemas**); el menú también autoriza páginas. El Administrador gestiona la estructura en `/plataforma/admin/menu`.
- **Modelo C de tickets:** `ticket` (núcleo) + `ticket_incidente` (`id_problema`, `es_incidente_mayor`, `causado_por_cambio_id`) + `ticket_solicitud`, más `vista_ticket`. El núcleo `tickets` está **congelado**: cualquier cambio requiere revisión del Tech Lead; está prohibido un segundo servicio de prioridad.
- **Tablas del dominio ya existentes** (verifica estructura en la Etapa 0): `problema` (`id_ci_afectado`, `id_estado`), `problema_incidente`, `problema_analisis`, `error_conocido`; además `cambio.id_problema_origen`, `articulo_conocimiento` (problema de origen), `servicio_catalogo` (con criticidad) y `elemento_configuracion` (CI).
- **Validaciones y componentes de UI transversales:** antes en `src/lib/validaciones.ts`, `src/lib/security.ts` y `src/components/ui/AlertaCampo.tsx`; con la migración están en `src/shared/` o en módulos. **Etapa 0 los ubica.** Si un validador del catálogo 3C no existe, créalo **dentro del módulo** (`configuracion/validaciones/`), no en `shared`.
- **SLA y matriz de prioridad:** módulo `servicios` ("Catálogo, categorías, SLA, matriz de prioridad y workflow"); edición en `Objetivos SLA` (`/plataforma/admin/servicios/sla`, antes componente `MatrizPrioridadSla.tsx`, API `/api/admin/sla/matriz`); cálculo de prioridad vía `calcularPrioridadITIL` (contrato de `tickets`). El motor de SLA con calendarios hábiles se ubica en la Etapa 0 (antes `src/lib/sla.ts`).
- **Detalle de ticket:** presentadores por rol y secciones (`CockpitTemporizadorSla`, `StreamChatPublico`, `StreamNotasInternas`, `PanelInfraestructuraCi`, `TarjetaAprobacionSod`, `TarjetaCalificacionCsat`); el detalle de problema usa `PresentadorProblemaGestor` (contrato `@/modules/tickets/ui`).
- **Heredado a revisar:** la configuración antigua de RFC (`/admin/rfc`, `ConfiguracionRfc.tsx`) puede convivir con `/plataforma/admin/procesos/cambios/*`; pertenece a `cambios`, no se toca aquí.
- **Deuda técnica conocida:** 100 controladores con JWT manual, 113 páginas sin guarda de página, `db/schema.sql` incompleto (la fuente de verdad es la base viva + migraciones + seed). **No amplíes la deuda**: tu código nuevo usa las guardas compartidas.

| Tema | Lo confirmado |
|---|---|
| Matriz impacto × urgencia | Existe y calcula P1 a P4 al crear incidentes; vive en el módulo `servicios` (pantalla `Objetivos SLA`) y se consume con `calcularPrioridadITIL`. Niveles: Alta / Media / Baja. Confirma archivo y tabla en la Etapa 0. |
| Objetivos SLA | Contiene la "Matriz Institucional de Tiempos por Prioridad" (horas de primera respuesta y resolución total por prioridad). |
| SLA por servicio | Cada servicio de incidentes/solicitudes conserva su propio SLA editable, pero el tiempo efectivo de un ticket lo da su prioridad. **No tocar en este prompt.** |
| Formulario de Incidentes | Servicio del catálogo y panel de SLAs asociados · Título · Descripción con texto guía · Urgencia · Impacto · Prioridad calculada (matriz ITIL 4, P1–P4) · Elemento CMDB (opcional, solo ítems bajo custodia del usuario) · Campos adicionales · Carga fija de evidencias. |
| Creador de campos | Existe (módulo `tickets`); se pueden agregar campos al formulario de Incidentes. Se reutiliza para problemas **por contrato** (solicitud S-1 si no está publicado). |
| Calendarios y feriados | El motor de SLA ya usa calendarios hábiles; se reutiliza su tabla de feriados y no se crea nada nuevo. |
| Turnos y ausencias de técnicos | El módulo `organizacion` declara "ausencias" en su dominio. **Verifica en la Etapa 0** si existe `tecnico_ausencias` o equivalente; si no existe, solicitud S-5. |
| Perfil Gestor de Problemas | **Existe** (id 10) con consola en `/plataforma/gestor-problemas/*`. |
| Datos del módulo que no existan | Se agregan con migraciones (sección 12). Los de otros módulos se solicitan (sección 16). |

**Dependencias con otros módulos** (todas por contrato o solicitud; ninguna implica editar el módulo ajeno):

| Con (módulo · pantalla) | Dependencia | Detalle en |
|---|---|---|
| `identidades` · Perfiles y permisos | Capacidades de la sección 9. | S-2 |
| `servicios` · Catálogo de Servicios y Objetivos SLA | Lista de servicios y su criticidad; matriz de prioridad; bloque de solo lectura "Objetivos internos de Problemas" en `Objetivos SLA`. | S-3 |
| `tickets` / `incidentes` · Incidentes | Botón "Crear problema desde incidente", banner de vínculo, coincidencia de errores conocidos, resolución asistida, editor de formulario y creador de campos. | S-1, S-4 |
| `cambios` · Cambios (Prompt 2) | Origen = Problema en la RFC; sincronización de estados (8.4). | S-7 |
| `organizacion` · Departamentos y grupos / Técnicos | Grupos resolutores, técnicos, niveles de soporte, ausencias. | S-5 |
| `cmdb` / `activos` · Activos y CMDB (Prompt 3) | Selector de CI, clase y criticidad, marcas `Problema abierto` / `Error conocido vigente`, bloqueo de baja. | S-8 |
| `plataforma` · Notificaciones, Auditoría, Retención | Plantillas y canales de los eventos de la sección 10; registro de cambios de configuración; límites de adjuntos y borradores. | S-6 |
| `conocimiento` · Conocimiento | Plantilla y flujo de revisión de artículos derivados. | S-9 |
| `reportes` · Reportes de problemas | Métricas de la sección 10 (el módulo `reportes` las lee de las tablas del módulo). | — |

---

## 12. Cambios de base de datos requeridos

Principio: **verifica primero si existe (Etapa 0); si no existe y pertenece al módulo `problemas`, créalo mediante migración.** No dupliques tablas o columnas ya existentes ni toques tablas de otros módulos.

**12.1 Tablas de configuración del módulo** (prefijo sugerido `problema_config_*`; convenciones de la sección 0, regla 9):
- Versiones de configuración por pantalla/pestaña: ámbito, número de versión, estado (borrador/publicada), snapshot `jsonb`, autor, motivo, fechas.
- Catálogos: categorías de problema (2 niveles), orígenes, categorías de causa raíz, códigos de cierre, métodos de análisis, motivos de espera, de cancelación y de reapertura, con los atributos de 6.3.
- Flujo: estados, transiciones, automatizaciones de transición.
- Reglas: asignación automática, escalamiento, creación por umbral (más su registro de ejecuciones).
- Tareas y paquetes de tareas; plantillas de problema; criterios de problema mayor y plantilla de revisión.
- Parámetros de KEDB, vínculo con RFC, conocimiento y CI/servicios (8.3 a 8.6).
- Objetivos de tiempo de problemas (7.4).
- Bloqueo de edición concurrente (por pantalla/pestaña, con expiración a los 15 min).

**12.2 Tablas operativas del problema** (ya existen `problema`, `problema_incidente`, `problema_analisis`, `error_conocido`; **auditarlas y completarlas**, no recrearlas): secuencia `PRB-000001` sin saltos, vínculo problema–incidente (tipo de vínculo, quién y cuándo), problema–CI, problema–RFC, tareas, comentarios/bitácora, historial de cambios, adjuntos, revisión del problema y secuencia de errores conocidos (`KE-000001`). Todo lo que ya exista se conserva con sus datos.

**12.3 Seguridad y personas:** las capacidades de la sección 9 se declaran en `src/shared/lib/capacidades.ts` (**solicitud S-2**, no se edita aquí); el perfil Gestor de Problemas ya existe. Las **ausencias de técnicos** pertenecen a `organizacion` (**solicitud S-5**): este módulo solo las consulta por contrato. Con ausencias no disponibles, la opción "Considerar disponibilidad" (7.3) queda **deshabilitada con el aviso "Requiere el registro de ausencias"**.

**12.4 Columnas de otros módulos que probablemente falten (verifica y, si faltan, solicítalas; no las agregues):**
- `servicio_catalogo`: marca/nivel de criticidad (usado en 7.8 y 8.6) — parece existir; confirmar.
- `elemento_configuracion`: `clase` y `criticidad` (coordinar con el Prompt 3).
- `ticket_incidente`: `id_problema` y `es_incidente_mayor` **existen** (Modelo C); verificar `codigo_resolucion`. Referencia incidente–problema múltiple vía `problema_incidente`.
- Entidad `problema` en la definición de campos personalizados (módulo `tickets`; S-1).
- Registro de eventos de dominio (outbox o mecanismo existente en `plataforma`; S-6).

**12.5 Búsqueda y rendimiento:** índices en `ticket`/`vista_ticket` por (servicio, categoría, CI, fecha de creación) para las reglas de umbral **solo si son consultas del módulo y la tabla es de lectura acotada**; si el índice requiere tocar el esquema de `tickets`, solicítalo (S-4). Búsqueda de texto completo en español y similitud (`to_tsvector('spanish', …)`, `pg_trgm`) para detectar duplicados al registrar problemas y para sugerir errores conocidos (índices sobre tablas del propio módulo).

**12.6 Datos semilla:** todo lo de la sección 10, cargado con migración idempotente (reejecutarla no duplica registros) y reflejado en `db/seed.sql`.

**12.7 Tareas programadas:** evaluación de reglas de umbral, escalamientos, revisión periódica de KEDB, reanudación de problemas en espera, cierre automático tras *Resuelto*. Usa el mecanismo de jobs que ya exista en el proyecto (la Etapa 0 lo busca; puede estar en `plataforma` u `operacion`); si no existe ninguno, propón (no implementes sin aprobación) `pg_cron` de Supabase, Edge Functions o cron de Next.js. La lógica del job vive en `configuracion/motor/`; el disparador, si es de infraestructura, se solicita.

---

## 13. Criterios de aceptación

1. El menú del Administrador conserva, bajo la raíz **Problemas**, las tres pantallas de configuración con las ventanas internas de la sección 2.2; **no se crearon, movieron ni renombraron opciones de menú**.
2. Todas las pestañas usan el patrón común (borrador, vista previa, publicar con diff y motivo, versionado, restauración, importación/exportación, bloqueo concurrente).
3. El editor de formulario y el creador de campos de problemas **son el mismo componente que usa Incidentes** cuando `tickets` lo publica por contrato (S-1); si aún no está publicado, existe un adaptador documentado, **sin copias** del editor dentro de `problemas`. Incidentes sigue funcionando igual que antes.
4. Un administrador puede ocultar un campo no bloqueado, publicar, y el campo desaparece del formulario de registro sin perder datos de tickets existentes.
5. Un campo bloqueado (Título, Descripción, Servicio, Impacto, Urgencia) **no** puede ocultarse ni hacerse opcional.
6. Una regla condicional "Origen = Incidente(s) → Incidentes relacionados obligatorio" funciona en el formulario real.
7. Con `Usar matriz propia para problemas` apagado, un problema con cierto impacto y urgencia recibe **exactamente la misma prioridad** que un incidente con esos valores (se calcula con el servicio compartido, no con una copia). No existe una segunda copia de la matriz.
8. Con matriz propia encendida y publicada (sujeta a la pregunta abierta 1), el recálculo de problemas abiertos respeta las prioridades manuales.
9. El panel de objetivos de tiempo del formulario muestra los valores de 1.3.3.2.4 para la prioridad calculada, y el módulo expone `BloqueObjetivosProblemas` (en `ui.ts`) listo para montarse en `Objetivos SLA` (S-3) sin alterar la matriz de Incidentes y Solicitudes.
10. Un valor de lista en uso no puede eliminarse, solo desactivarse; los valores 🔒 no pueden eliminarse.
11. Un estado con tickets no puede desactivarse sin asistente de migración.
12. El validador de flujo bloquea la publicación si hay estados inalcanzables, sin salida, o sin camino a un final.
13. Una transición con campos obligatorios abre el modal correcto y no permite ejecutar sin completarlos.
14. La asignación automática aplica la primera regla que coincide; el simulador reproduce el resultado real; la opción de disponibilidad omite a los técnicos con ausencia vigente (o queda deshabilitada con aviso si S-5 no está atendida).
15. Los relojes de diagnóstico y resolución se pausan o corren según cada estado y usan la misma convención de cómputo que el motor de SLA existente.
16. Una regla de umbral simulada muestra los grupos de incidentes detectados antes de activarse.
17. Al cerrar un problema con política "Resolución asistida", se muestra la lista de incidentes abiertos vinculados y se exige una decisión (la interfaz sobre el incidente la aporta S-4; el servicio y el contrato existen en `problemas`).
18. Promover a error conocido valida los requisitos configurados y lista lo que falta.
19. Un problema con RFC rechazada vuelve al estado configurado y se crea la tarea indicada.
20. Un problema mayor no puede cerrarse sin completar la revisión cuando así se configuró.
21. Toda acción de configuración queda en `Plataforma › Auditoría de cambios de configuración` (`/plataforma/admin/auditoria-sistema`) con usuario, antes/después y motivo.
22. Las capacidades de la sección 9 están declaradas (S-2) y se cumplen; un usuario con `problemas:config:editar` pero sin `problemas:config:publicar` no ve habilitado el botón Publicar. El Administrador no tiene capacidades operativas (SoD).
23. Las ausencias de técnicos se consumen del módulo `organizacion` por contrato (S-5); el módulo `problemas` no crea ni modifica esa tabla.
24. El formulario de registro y el ticket reflejan exactamente las secciones 4 y 5 con los valores de fábrica.
25. Ninguna ventana interna de las pantallas 1.3.3.x repite un ítem del menú; las ventanas internas existentes están en `?vista=` y no alteran el ítem activo del menú (3A). La página padre `/plataforma/admin/procesos/problemas` redirige a `/formulario`.
26. Los botones y las acciones de fila usan los íconos de 3B.4, con tooltip y `aria-label`, y el estilo de botones de la sección 3B.1.
27. Todos los campos de los formularios y de las pantallas de configuración tienen validación en tiempo real con los validadores de 3C; **no aparece ningún indicador de éxito**; los errores usan `AlertaCampo`.
28. Cambiar el valor de un selector que gobierna otro campo (por ejemplo tipo de documento) cambia al instante el validador, la máscara y el `maxLength` del campo dependiente.
29. El servidor repite las mismas validaciones y devuelve `400` con `{ campo, mensaje }`, que la interfaz muestra en el campo.
30. Los modales y la barra de acciones comunes existen **una sola vez dentro de `problemas`** (`configuracion/compartido/`); se eliminaron las copias duplicadas dentro del módulo. La promoción a `shared/components` y la unificación con `cambios` y `activos` se solicita al Tech Lead (S-10).
31. **Perímetro:** el diff de la entrega solo toca `src/modules/problemas/**`, los cascarones de `src/app/plataforma/admin/procesos/problemas/**` y `src/app/api/admin/problemas/**`, y `db/migrations/` + `db/seed.sql` (tablas del módulo). No hay ediciones en otros módulos, en `src/shared`, en `middleware.ts`, en `next.config.js` ni en el menú.
32. **Contratos:** no hay imports profundos hacia otros módulos; los controladores usan `sesionConCapacidad`; los `page.tsx` usan `exigirCapacidadPagina`; no existe ninguna guarda propia ni verificación manual de JWT en código nuevo.
33. **Calidad:** `npx tsc --noEmit` y `npm run build` sin errores; migraciones idempotentes aplicadas en base limpia y en base existente; seed cargado; humo por perfil sin 404/403 no deliberados; todas las solicitudes pendientes quedan en `docs/SOLICITUDES_A_OTROS_MODULOS.md`.

---

## 14. Etapa 0 — Reconocimiento obligatorio y preguntas abiertas

**Punto de partida de la Etapa 0:** el informe debe incluir una **tabla de diferencias** entre este documento y lo ya implementado en `/plataforma/admin/procesos/problemas/*` y `src/modules/problemas` (secciones 2.2 y 2.3), listando por cada ventana interna: existe / falta / incompleta, qué validadores (3C) y qué íconos (3B) le faltan, qué elementos duplican ítems del menú (3A) y **dónde está cada archivo hoy** (¿ya en `src/modules/problemas` o todavía en `src/app`/`src/lib`/`src/components`?).

**Antes de escribir cualquier código**, revisa el repositorio y la base de datos y entrégame un **informe** (sin modificar nada), guardado en `src/modules/problemas/docs/INFORME_ETAPA_0.md` y resumido en el chat, con:

1. **Estructura actual de `src/modules/problemas`:** carpetas, `index.ts` (qué exporta), si existe `ui.ts`, controladores y servicios existentes, y dónde cabe la carpeta `configuracion/` (o la equivalente ya existente).
2. **Matriz de prioridad:** dónde está (archivo/tabla/función), cómo se consume `calcularPrioridadITIL` al crear incidentes, qué contrato de `servicios`/`tickets` permite usarla desde `problemas` y si admite una matriz alternativa por parámetro.
3. **Motor de SLA:** en qué módulo está, si cuenta horas corridas u hábiles, y cómo se pausan y reanudan los relojes hoy.
4. **Componentes reutilizables y su visibilidad de contrato:** editor de formulario y creador de campos de Incidentes (¿publicados en `@/modules/tickets/ui`?), constructor de condiciones o reglas (si hay), motor de estados de `Flujo de estados y acciones`, sistema de notificaciones y emisión de eventos de `plataforma`, jobs programados, y componentes de UI compartidos (`AlertaCampo`, `Iconos`, `Boton`, tablas, modales, arrastrar-y-soltar, selectores) con su ruta real en `src/shared`.
5. **Capacidades y perfiles:** lista completa de capacidades del dominio en `src/shared/lib/capacidades.ts`, cómo `CAPACIDADES_POR_PERFIL` asigna el dominio a los 10 perfiles, qué guardas usan hoy los controladores de `problemas` (`sesionConCapacidad` vs `verificarTokenSesion`) y la **lista exacta de capacidades que faltan** para la sección 9 (diff propuesto para S-2).
6. **Tablas existentes** de servicios, usuarios, técnicos, grupos, niveles de soporte, ausencias, incidentes (Modelo C), CMDB, errores conocidos, conocimiento y auditoría, con las columnas relevantes.
7. **Qué de la sección 12 ya existe y qué falta**, con el plan de migraciones propuesto (número de migración posterior a la última existente).
8. **Solicitudes S-1 a S-10 (sección 16):** para cada una, si ya está atendida, parcialmente atendida o pendiente, y la **degradación** que aplicarás mientras tanto.
9. **Riesgos o conflictos** detectados (por ejemplo, componentes que dependan de comportamientos que esta spec cambia, imports profundos existentes en `src/app` hacia vistas del módulo, o rutas legadas con alias).

Después **detente y espera mi aprobación** para iniciar la Etapa A.

**Preguntas abiertas que quedan** (responde con lo que encuentres en el código; pregúntame solo lo que no puedas determinar):
1. **Matriz propia de problemas:** la arquitectura prohíbe un segundo servicio de prioridad y `calcularPrioridadITIL` pertenece al núcleo congelado `tickets`. ¿Se aprueba que `Usar matriz propia para problemas` opere como una **tabla de anulación del propio módulo** (solo lectura de celda impacto × urgencia, sin motor paralelo), o se pospone esa opción hasta que `tickets`/`servicios` acepten una matriz por parámetro? Si la matriz compartida está fija en código y sin pantalla de edición, ¿apruebo proponer su migración a tabla al módulo `servicios`?
2. ¿Cómo se identifica hoy un "incidente mayor" para los criterios de problema mayor? (`ticket_incidente.es_incidente_mayor` existe; confirmar el flujo de la sala de crisis.)
3. ¿El motor de SLA admite pausas por estado? (Determina cómo reutilizarlo para los dos relojes de problemas.)
4. ¿Se aprueba agregar una suite de pruebas mínima (por ejemplo para SLA, SoD y reglas de configuración) o las pruebas se limitan a funciones puras y checklist de humo?

---

## 15. Fuera de alcance de este prompt
Cambios (RFC) y sus formularios → Prompt 2 · Activos/CMDB → Prompt 3 · Pantallas operativas del módulo (bandejas, consolas de Técnico, Supervisor, Aprobador y Gestor de Problemas, tableros) y reportes (`/plataforma/reportes/problemas`) · Cualquier cambio en otro módulo (se solicita; sección 16) · Cambios al menú o a la visibilidad por perfil · Modificar los SLA por servicio de incidentes y solicitudes · Calendarios y feriados · Integraciones externas de monitoreo (solo se prevé el origen "Evento de monitoreo") · Migración de capacidades a la tabla `perfil_capacidades`.

---

## 16. Solicitudes a otros módulos (el módulo `problemas` no las implementa)

Formato de cada solicitud en `src/modules/problemas/docs/SOLICITUDES_A_OTROS_MODULOS.md`: **id · módulo destino (dueño) · qué se necesita · contrato propuesto · comportamiento mientras no exista**. El módulo `problemas` entrega su parte (servicio, contrato, componente) y deja el consumo a cargo del módulo destino.

| Id | Módulo destino (dueño) | Qué se necesita | Contrato propuesto | Mientras no exista (degradación) |
|---|---|---|---|---|
| S-1 | `tickets` (Miguel; núcleo congelado, aprueba el Tech Lead) | Publicar el editor de formularios y el creador de campos personalizados con soporte para la entidad `problema` (más adelante `cambio` y `activo`). | `@/modules/tickets/ui` (componente reutilizable) + servicio de definición de campos. | `problemas` define un **adaptador** (`CamposAdaptador`) con la interfaz que consumirá el editor y no copia el editor; las ventanas Campos y Campos personalizados quedan marcadas "pendiente de S-1" salvo lo ya existente. |
| S-2 | `shared` (Tech Lead) | Declarar en `src/shared/lib/capacidades.ts` las capacidades de la sección 9 y actualizar `CAPACIDADES_POR_PERFIL`. | Constantes `CAPACIDADES.PROBLEMAS_*` y `KEDB_*`. | **Bloqueante para la Etapa A** (la separación editar/publicar es criterio de aceptación): se aprueba junto con la Etapa 0. |
| S-3 | `servicios` (Miguel) | Montar `BloqueObjetivosProblemas` debajo de la matriz en `Objetivos SLA`; permitir que la resolución de prioridad acepte una matriz alternativa (si se aprueba la pregunta 1). | `@/modules/problemas/ui` (bloque) · parámetro opcional en el servicio de prioridad. | El bloque existe y se prueba aislado; la matriz propia queda detrás de la decisión de la pregunta 1. |
| S-4 | `incidentes` / `tickets` (Miguel) | En el incidente: botón "Crear problema desde este incidente", banner "Vinculado al problema PRB-xxxxxx", mostrar el workaround, sugerir errores conocidos al registrar, resolución asistida de incidentes vinculados; columna `codigo_resolucion` e índices de umbral si faltan. | Servicios en `@/modules/problemas` (`crearProblemaDesdeIncidente`, `obtenerConfiguracionPublicada`, `sugerirErroresConocidos`). | La configuración se guarda y se expone; el comportamiento visible en el incidente no aparece hasta que el módulo destino lo monte. |
| S-5 | `organizacion` (Junior) | Ausencias de técnicos (`tecnico_ausencias` o equivalente) con su sección en `Técnicos y niveles de soporte`; función de disponibilidad. | `@/modules/organizacion` (`esTecnicoDisponible(idTecnico, fecha)`). | "Considerar disponibilidad" deshabilitada con aviso. |
| S-6 | `plataforma` (Miguel) | Emisión de eventos y plantillas para `problema.*` y `kedb.*`; registro en `Auditoría de cambios de configuración`; parámetros de adjuntos y caducidad de borradores. | Servicios de eventos, auditoría y parámetros de `@/modules/plataforma`. | Si no hay mecanismo de eventos, el módulo registra los eventos en una tabla propia `problema_config_evento` (outbox mínimo) y no envía notificaciones. |
| S-7 | `cambios` (Nain) | Origen = Problema en la RFC y sincronización de estados (crear RFC prellenada, devolver el problema si la RFC se rechaza o falla). | `@/modules/cambios` (`crearRfcDesdeProblema`) y eventos de estado. | Se guarda la configuración (8.4); la creación y sincronización automáticas no se activan. |
| S-8 | `cmdb` / `activos` (Nain) | Marcas `Problema abierto` y `Error conocido vigente` en el CI, clase y criticidad del CI, bloqueo de baja con problemas abiertos. | `@/modules/cmdb` (consulta de CI) y hook de baja de `@/modules/activos`. | Solo lectura de CI por SQL acotado; sin marcas ni bloqueo. |
| S-9 | `conocimiento` (Alexis) | Plantilla y flujo de revisión de artículos derivados de problemas. | `@/modules/conocimiento` (`crearBorradorDesdeProblema`). | Se guarda la configuración (8.5); no se crea el borrador automáticamente. |
| S-10 | Tech Lead / `shared` | Promover `BarraAccionesComun`, `Modal*`, `Boton`, `BotonIcono` a `src/shared/components/ui` y unificar con `cambios` y `activos`; unificar `Iconos.tsx` duplicados. | `@/shared/components/ui`. | Una única copia dentro de `problemas/configuracion/compartido/`. |
