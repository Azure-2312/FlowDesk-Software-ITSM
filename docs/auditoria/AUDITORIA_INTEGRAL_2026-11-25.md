# Auditoría integral de FlowDesk (ITSM · ITIL v4)

**Fecha:** 2026-11-25 · **Rama:** `reestructuracion-menu` (commit `0742ed2`) · **Alcance:** `src/` (918 archivos, ~91 000 líneas TS/TSX), `scripts/`, `db/`, `docs/`, `DOCUMENTACIÓN/`.

**Método:** análisis estático con el AST de TypeScript (grafo de imports desde las rutas de Next.js, auditoría de botones, tablas y filas flex), cruce de las claves de configuración entre las pantallas de administración y las de uso, y `tsc --noEmit` (0 errores). La app **no se ejecutó**: la `DATABASE_URL` de `.env.local` apunta a Supabase (producción) y las pantallas piden login real. Los hallazgos visuales vienen del código y conviene revisarlos en el navegador.

Severidad: 🔴 crítico (rompe la funcionalidad o la seguridad) · 🟠 alto (incoherencia visible para el usuario) · 🟡 medio (deuda técnica o estándar) · ⚪ bajo.

---

## 1. Resumen ejecutivo: los 12 hallazgos más importantes

| # | Sev. | Hallazgo | Dónde |
|---|---|---|---|
| 1 | 🔴 | **Credenciales de la BD de producción (Supabase) escritas en el código** y subidas a GitHub. | `scripts/sync_local_to_supabase.js:10`, `scripts/aplicar_nuevo_orden_menu.js:4`, `scripts/test_menu_profiles.js:4` |
| 2 | 🔴 | **El formulario por servicio (`esquema_formulario`) se configura y se valida en el servidor, pero el formulario de creación nunca lo muestra.** Si un campo se marca obligatorio, el usuario no lo ve y el registro falla con "Completa el campo obligatorio". | Config: `servicios/config/servicios/[id]/formulario/ui.tsx` · Valida: `tickets/services/ticketsService.ts:420` · Crea: `tickets/gestion/crear/VistaTicketsGestionCrear.tsx` (no lo lee) |
| 3 | 🔴 | **La pestaña "Reglas operativas" de Incidentes y Solicitudes no tiene efecto.** Guarda `vistas_ticket_perfil` y `flujo_estados_acciones`, pero ningún otro archivo del sistema lee esas claves. | `tickets/config/vistas/ConfiguracionVistasTickets.tsx:98-99` |
| 4 | 🔴 | **La matriz de prioridad configurable no se usa al crear tickets.** El admin la edita en BD (`matriz_prioridad_institucional`), pero cliente y servidor usan matrices fijas en el código, y los SLA de la vista de creación también están fijos (4/8/24/72 h). | `ticketsService.ts:19-33`, `VistaTicketsGestionCrear.tsx:69-81` |
| 5 | 🟠 | **El formulario de Mesa (incidentes/solicitudes) solo respeta en parte lo configurado.** Los 13 campos "de sistema" se dibujan con etiquetas, orden, secciones y ancho fijos: lo que configura el admin no cambia nada en ellos. | `VistaTicketsGestionCrear.tsx:357-375` y `1154-1260` |
| 6 | 🟠 | **El formulario de Problemas ignora toda su configuración.** `VistaProblemasCrear` no consulta ninguna API de configuración y sus listas (impacto, urgencia, método RCA) están fijas en el código. | `problemas/views/VistaProblemasCrear.tsx:258-303` |
| 7 | 🟠 | **Siguen existiendo vistas previas y simuladores** que dibujan su propia copia del formulario o del ticket, distinta de la que ve el usuario. | §3 |
| 8 | 🟠 | **Hay dos implementaciones del detalle de ticket.** La página usa `VistaTicketsDetalle` (2049 líneas) y el modal de las tablas usa `ModalDetalleTicket` + 12 presentadores, así que el mismo ticket se ve distinto según desde dónde se abra. | §4.3 |
| 9 | 🟠 | **296 clases estilo Tailwind se usan sin estar definidas** (Tailwind no está instalado). No aplican ningún estilo, y de ahí sale gran parte de los componentes "pegados" sin espacio. | §5.3 |
| 10 | 🟡 | **Código muerto:** 68 archivos (~16 000 líneas) que ninguna ruta alcanza, ~6 000 líneas de pestañas inaccesibles y 6 endpoints "simular" huérfanos. | §4 |
| 11 | 🟡 | **Regla "icono O texto":** 32 botones la incumplen en la app y 13 más en `/panel`. | §5.1 |
| 12 | 🟡 | `/plataforma/tickets/[id]` no tiene guard de página, mientras que sus equivalentes sí lo tienen. | `src/app/plataforma/tickets/[id]/page.tsx` |

---

## 2. Cómo está construido el sistema

- **Stack:** Next.js 14 (App Router) + React 18 + PostgreSQL (`pg`, sin ORM) + JWT en cookie. No hay librería de UI ni Tailwind: el estilo viene de `src/app/globals.css` (2 523 líneas) y de **9 758 objetos `style={{…}}` inline**.
- **Capas:**
  - `src/app/plataforma/**/page.tsx` (77 páginas): son "cascarones" que validan acceso (`exigirMenuPagina`, `exigirVistaPagina`, `exigirCapacidadPagina`) y montan una vista del módulo.
  - `src/app/api/**/route.ts` (220 rutas): solo reexportan controladores de `src/modules/<modulo>/api`.
  - `src/modules/<modulo>/{api,services,views,config,components}`: 16 módulos ITIL (tickets, incidentes, solicitudes, problemas, cambios, activos, cmdb, conocimiento, servicios/SLA, organización, identidades, seguridad, plataforma, operación, reportes, proveedores).
  - `src/shared/lib`: autenticación, menú, vistas por perfil (`vistas.ts`), SLA, validaciones y BD.
- **Navegación:** el menú sale de la BD (`opciones_menu` por perfil) y cada pantalla con pestañas se registra en `shared/lib/vistas.ts`.
- **Incidentes y Solicitudes** comparten el módulo `tickets` (mismos controladores, `tipoFijo` 1/2).
- **Configuración de formularios:** hay **un mecanismo distinto por módulo**:
  - Mesa: la clave JSON `formularios_solicitante_config`.
  - Cambios: `/api/cambios/configuracion/formulario/configuracion` con versionado por pestaña.
  - Problemas: `/api/problemas/configuracion/configuracion?ambito=`.
  - Servicios: la columna `esquema_formulario`.
  - Campos personalizados: `campo_personalizado`.

  Esta falta de un "motor de formularios" único es la causa raíz de casi todas las incoherencias de la sección 3.

---

## 3. Homogeneidad: lo que se configura frente a lo que ve el usuario

### 3.1 Formulario de Incidentes y Solicitudes (Mesa de Servicio)

| Aspecto | Configuración (`PestanaCamposMesa`) | Formulario real (`VistaTicketsGestionCrear`) | ¿Coincide? |
|---|---|---|---|
| Secciones (A, B, C, D) y su orden | Se guardan en `secciones_incidente` / `secciones_solicitud` | Se ignoran: el layout está escrito a mano | ❌ |
| Etiquetas de campos de sistema | Editables (p. ej. "Justificación Operativa / Motivo del Requerimiento") | Fijas ("Justificación Institucional *", "Nivel de Urgencia *") | ❌ |
| `visible` / `obligatorio` de campos de sistema | Editables | Se ignoran: los 13 códigos de `CAMPOS_SISTEMA_EXCLUIDOS` siempre se dibujan | ❌ |
| `ancho` (completo / 1/2) | Editable | Se ignora | ❌ |
| `placeholder` / `ayuda` | Editables | Se ignoran en los campos de sistema | ❌ |
| Campo `fecha_limite` (solicitud) | Código `fecha_limite` | El nativo usa `fecha_limite_deseada`. Como `fecha_limite` no está en la lista de excluidos, **también se dibuja como campo dinámico: el usuario ve dos campos de fecha límite** y los valores se guardan con claves distintas | ❌ bug |
| `prioridad_minima` de campos personalizados | La config lo guarda en `prioridad_minima` (y fuerza 5 al fusionar) | La creación lo lee de `cp.propiedades?.prioridad_minima` | ⚠️ son dos fuentes |
| `en_nombre_de_otro` | `prioridad_minima: 4` | Se habilita igual si `esPersonalTI` (perfiles fijos `[1,2,4,5,8]`) | ⚠️ |
| Matriz de prioridad y SLA | Configurables en `/servicios/configuracion/sla` (pestaña matriz) | Fijas en el cliente (`deducirPrioridad`) y en el servidor (`MATRIZ_PRIORIDAD_ITIL`) | ❌ |
| Formato heredado "campos planos" | — | Hay un fallback a `camposConfig.incidente/solicitud` de una fase anterior (`VistaTicketsGestionCrear.tsx:401-420`) | 🗑️ legado |

**Recomendación:** crear un único `RenderizadorFormulario` (en `shared/components/formulario`) que reciba la misma estructura de secciones y campos y que usen **las dos**: la pantalla de creación y, si se mantiene, la de configuración. Los campos de sistema pasarían a ser campos con `tipo` especial (`selector_servicio`, `matriz_prioridad`, etc.) que el renderizador sabe dibujar, en vez de estar escritos a mano.

### 3.2 Formulario por servicio del catálogo — 🔴
- Se configura en `/plataforma/servicios/configuracion/[id]/formulario` (columna `esquema_formulario`, con vista previa propia).
- El servidor lo exige (`ticketsService.ts:420-430`).
- `VistaTicketsGestionCrear` **no lo carga ni lo dibuja**: no aparece ninguna referencia a `esquema_formulario` ni a `.clave`.

### 3.3 Formulario de Problemas — 🟠
- Configuración: `/plataforma/problemas/configuracion` (campos, listas).
- Creación: `VistaProblemasCrear.tsx` solo llama a `/api/problemas` y `/api/problemas?kedb=true`. Impacto, urgencia y método RCA son `<option>` fijos. **Nada de lo configurado llega al usuario.**

### 3.4 Formulario de Cambios — 🟡
- La creación sí usa catálogos, cuestionario de riesgo, campos personalizados y modelos estándar.
- No usa la configuración de la pestaña "campos" (`formulario/configuracion?pestana=campos`): visibilidad, orden y etiquetas.

### 3.5 Vistas del ticket por perfil — 🔴
- `ConfiguracionVistasTickets` (pestaña "Reglas operativas") guarda qué componentes ve cada perfil o usuario y tiene un "Simulador en Vivo".
- El detalle real (`VistaTicketsDetalle` y `ModalDetalleTicket`) decide la vista por arquetipos fijos en el código (`ticket-detail/tipos.ts → resolverArquetipoVista`). **Ninguno lee `vistas_ticket_perfil`.**

### 3.6 Vistas previas y simuladores que siguen vivos

| Archivo | Qué hace | Problema |
|---|---|---|
| `tickets/config/formulario/components/PestanaCamposMesa.tsx:355-366, 584-1400` | "Simulador en vivo": formulario + ticket simulado, nivel simulado, SLA simulado | ~800 líneas de HTML propio que **no** es el formulario real; el grid `minmax(380px) + minmax(360px)` se desborda por debajo de ~780 px |
| `tickets/config/vistas/ConfiguracionVistasTickets.tsx:760-780` | "Vista Previa Exacta: así observa el ticket…" | Simula un detalle que no existe |
| `servicios/config/servicios/[id]/formulario/ui.tsx:364-420` | "Vista previa del Portal de Autoservicio" | Muestra campos que el portal real no dibuja (§3.2) |
| `problemas/config/formulario/components/PestanaPlantillas.tsx:277, 507` | Subpestaña "4. Vista previa de la plantilla" | Además, la pestaña no es accesible (§4.2) |
| `cambios/config/formulario/components/PestanaVistaTicket.tsx`, `problemas/.../PestanaVistaTicket.tsx` | "Diseño del ticket" | No son accesibles desde ninguna ruta |
| `cambios/config/notificaciones-calendario/components/PestanaVentanasMantenimiento.tsx:134, 484` | "Vista previa en calendario" | Es un calendario, no un simulador: **puede quedarse** |
| `conocimiento/configuracion/articulos/[id]/editar/page.tsx:30` | Vista previa del artículo | Es legítima (editor de contenido): **puede quedarse** |

---

## 4. Código basura, legado y duplicado

### 4.1 Archivos que ninguna ruta alcanza (68 archivos, ~16 000 líneas)
Se pueden eliminar tras una verificación rápida:

- **Presentadores duplicados de ticket** (son copias exactas; solo cambian los imports): `tickets/presentadores/PresentadorAdmin.tsx`, `PresentadorConsumidor.tsx`, `PresentadorGobierno.tsx`, `PresentadorOperador.tsx`, `PresentadorSupervisor.tsx` y `tickets/presentadores/index.ts`. Sus gemelos vivos están en `tickets/ticket-detail/presentadores/VistaTicket*.tsx`.
- **Flujo de evaluación de Cambios** (UI completa sin ruta): `cambios/config/flujo-evaluacion/**` (8 archivos, ~4 400 líneas).
- **Flujo y relaciones de Problemas** (sin ruta): `problemas/config/flujo/**` (9 archivos, ~3 350 líneas) y `problemas/config/relaciones/**` (7 archivos, ~2 600 líneas).
- **Vistas de Problemas sin uso:** `ProblemasWorkspace.tsx`, `VistaProblemas.tsx`, `VistaAprobacionesProblemas.tsx`, `VistaAsignacionProblemas.tsx`, `VistaCambiosProblemas.tsx`, `VistaConocimientoProblemas.tsx`, `VistaMayoresProblemas.tsx`, `VistaProblemasGrupo.tsx`, `VistaRecurrentesProblemas.tsx`.
- **Conocimiento:** `VistaHelpCenter`, `VistaMetricasKcs`, `WidgetTicketDeflection`, `ModalVincularArticuloTicket`, `config/plantillas`, `config/politicas-acceso`, `config/salud-kcs`, `config/workflow-editorial` y `api/config/*Controller.ts` (3).
- **Otros:**
  - `cambios/views/VistaModelosCambio.tsx`, `incidentes/views/VistaIncidentes.tsx` y `organizacion/services/disponibilidadService.ts`.
  - **`src/shared/types/index.ts`** (654 líneas): copia de `src/types/index.ts`.
  - **Páginas dentro de `modules`:** `servicios/config/servicios/sla/page.tsx` (usa una prop `pestañaInicial` que ya no existe) y `servicios/config/servicios/[id]/formulario/page.tsx`. La página real vive en `src/app`.
  - Barriles `index.ts` / `ui.ts` sin importadores en cambios, conocimiento, identidades, organización, plataforma, problemas, proveedores, reportes, servicios y solicitudes.

> Antes de borrar los flujos de Cambios y Problemas hay que decidir si se van a exponer en el menú o se eliminan con sus APIs y servicios. Hoy existe la configuración en BD, pero ningún administrador puede editarla.

### 4.2 Pestañas inaccesibles dentro de archivos vivos (~6 000 líneas)
`VistaFormularioCambio`, `VistaTiposRequisitos` y `VistaFormularioProblemas` siempre se montan con `pestanaFija`, así que sus otras pestañas nunca se ven. Además, **todas se montan ocultas con `display:none` y hacen sus fetch** aunque no se vean, lo que cuesta rendimiento:

- **Cambios:** `campos_personalizados`, `prioridad`, `plantillas`, `vista_ticket` (`PestanaCamposPersonalizados` 656, `PestanaPlantillas` 851, `PestanaVistaTicket` 546, `PestanaPrioridad`).
- **Tipos y requisitos:** `tipos`, `modelos_estandar`, `reglas_clasificacion` (1 041 + 937 + 477 líneas).
- **Problemas:** `campos_personalizados`, `matriz_prioridad`, `plantillas`, `vista_ticket` (631 + 554 + 323…).

### 4.3 Duplicación que conviene unificar
| Duplicado | Detalle |
|---|---|
| Detalle de ticket | `VistaTicketsDetalle.tsx` (página, 2 049 líneas) frente a `ModalDetalleTicket.tsx` + presentadores (modal). Conviene dejar una sola composición. |
| Pestañas de configuración Cambios ↔ Problemas | `PestanaCamposPersonalizados` (solo 141 líneas difieren de ~640), `PestanaCampos`, `PestanaPlantillas`, `PestanaVistaTicket` |
| Matriz de prioridad | `servicios/services/matrizSlaService.ts` ≈ `problemas/services/matrizPrioridadService.ts` (misma tabla y lógica) + 2 matrices fijas en tickets |
| Rutas | `/api-clientes` reexporta `/panel`; `/plataforma/servicios/configuracion/sla` frente a `servicios/config/servicios/sla/page.tsx` (muerta) |
| Lógica de "a qué bandeja volver" por perfil | Repetida en `incidentes/crear`, `solicitudes/crear`, `incidentes/[id]` y `solicitudes/[id]`. Hay **76 comparaciones `idPerfil === N`** con números mágicos y no existe ninguna constante `PERFILES` en `shared/lib/constants.ts`. |
| Limpieza de "(Opcional)" | El mismo `replace(/\s*\(Opcional\)\s*/gi…)` aparece 6 veces entre la config y la creación: es un parche de datos heredados que debería migrarse una vez en la BD. |
| `searchParams` | Unas páginas hacen `await searchParams` (patrón de Next 15) y otras no. Conviene un solo patrón. |

### 4.4 Endpoints de API huérfanos
- **6 endpoints "simular"** que quedaron sin UI al eliminar los simuladores. Se pueden borrar junto con sus controladores y servicios `*Simular*`:
  - `cambios/configuracion/flujo-evaluacion/simular-{escalamiento,etapas,quorum}`
  - `matriz-autoridad/simular`
  - `notificaciones-calendario/simular-conflictos`
  - `reglas-clasificacion/simular`
- Hay ~50 rutas más sin `fetch` literal en el front (p. ej. `/api/cmdb/{auditoria,inexactitudes,lineas-base,resultados,tipos}`, `/api/seguridad/{evidencia,muestreo,historial}`, `/api/reportes/{disenador,decisiones,gerenciales}`, `/api/organizacion/equipo/{turnos,ausencias,vistas}`). Algunas se llaman con URL dinámica (p. ej. `apiBase`), así que **hay que revisarlas una por una** antes de borrar. `/api/v1/*` es la API externa y se mantiene.

### 4.5 Carpetas y archivos basura fuera de `src`
| Ruta | Qué es | Acción sugerida |
|---|---|---|
| `scripts/` (130 archivos, 1,2 MB) | Scripts de una sola vez: `update_page_*.js` (generaban páginas), `check_*`, `inspect_*`, `apply_fase*_migration`, `test_*_fase*` | Conservar solo los de `package.json` (`test_e2e_lifecycle`, `test_api_clientes`, `seed_api_clientes`, `protect_audit_log`) y `db.js`. Mover el resto a un zip fuera del repo o borrarlo. |
| `scripts/dist/` | Salida compilada versionada (`vistas.js`) | Borrar |
| `docs/reestructuracion/respaldo/backup_pre_reestructuracion.sql` (2 MB) | Volcado de la BD versionado en GitHub (incluye `cola_correo` con destinatarios y otros datos) | Sacarlo del repo |
| `docs/reestructuracion/` (30 informes por fase + CSV) y `src/modules/*/docs/INFORME_ETAPA_0.md` | Bitácora histórica; documentan rutas `/plataforma/admin/procesos/...` que ya no existen | Archivar en un único `docs/historico/` |
| `db/archive/migrations_historicas.zip` | Migraciones viejas | Basta con `db/01-03` para restaurar: archivar fuera del repo |
| 187 comentarios "FASE N / N5 - FASE 4 / legado" | Ruido histórico en el código | Limpiar al tocar cada archivo |

---

## 5. Estandarización de UI

### 5.1 Regla "un botón tiene icono **o** texto, nunca ambos"
De 948 botones: 842 solo texto ✅, 61 solo icono ✅ (7 sin `title`/`aria-label`) y **45 con icono y texto ❌**:

- `tickets/ticket-detail/secciones/BarraAccionesOperativas.tsx:64, 81, 98, 110, 126, 143, 157, 180`: SVG + "Iniciar atención", "Pausar", "Resolver ticket", "Reanudar", "Cerrar conformidad", "Reabrir (48h)".
- `tickets/ticket-detail/secciones/TarjetaAprobacionSod.tsx:87, 105`: SVG + "Rechazar/Aprobar solicitud".
- `tickets/ticket-detail/presentadores/VistaTicketConsumidor.tsx:132`: SVG + "Confirmar conformidad y cerrar ticket".
- `tickets/ticket-detail/secciones/ControlesDespacho.tsx:43`, `tickets/[id]/VistaTicketsDetalle.tsx:898`.
- `activos/views/VistaLicenciasActivos.tsx:537` ("+ Registrar licencia" con SVG), `activos/views/VistaInventarioActivos.tsx:1214`.
- `shared/components/layout/BotonLogout.tsx:15` (SVG + "Cerrar sesión"), `shared/components/layout/SelectorPerfil.tsx:69`.
- **Flechas como icono** (← / →) junto a texto:
  - `cambios/config/formulario/components/PestanaCamposPersonalizados.tsx:613, 624`
  - `problemas/config/formulario/components/PestanaCamposPersonalizados.tsx:588, 599`
  - `cambios/config/formulario/components/PestanaCatalogos.tsx:401`
  - `cambios/config/tipos-requisitos/components/PestanaTiposCambio.tsx:847`
  - `cmdb/views/VistaActivosMapa.tsx:415` ("↺ Reset")
  - `conocimiento/views/VistaConocimientoDetalle.tsx:123`
  - `identidades/config/perfiles/VistaPerfiles.tsx:397`, `identidades/config/permisos/VistaConfigPermisos.tsx:145`
  - `organizacion/config/tecnicos/VistaTecnicos.tsx:353, 530`
  - `plataforma/views/VistaNotificacionesInApp.tsx:319, 331`
- `src/app/panel/page.tsx`: 13 botones con emoji + texto (🩺 /health, 🔑…).

**Propuesta:** un único componente `<Boton variante="primario|secundario|peligro|mini" icono={…} etiqueta="…" />` que admita **o** `icono` (con `aria-label` obligatorio) **o** `etiqueta`, nunca los dos, para que la regla la garantice el propio componente. Hoy existe `BotonIcono` (13 usos), pero no hay un botón de texto común.

### 5.2 Cuatro formas distintas de dar estilo a un botón
- 150 botones solo con `className`, 368 solo con `style` inline y 430 con `className` + `style` (el inline sobrescribe el estilo global, como en `VistaCambiosGestionCab.tsx:223`).
- Hay nombres de clase sinónimos: `boton-primario` (167) frente a `boton-principal` (5), y `boton-peligro` / `boton-accion-peligro` / `boton-mini-peligro`.
- **0 variables CSS** (`--color-…`) y **146 colores hex distintos** en TSX: los azules, grises y radios varían de una pantalla a otra.
- **33 modales hechos a mano** (`position: fixed`) en lugar de un `<Modal>` común, y **165 `alert()` / `confirm()` nativos** junto a otros mensajes con banners propios.
- Las pestañas internas se implementan a mano en cada pantalla de configuración, mientras que la navegación usa `PestanasVista`: hay dos estilos de pestaña en la misma página (p. ej. `VistaConfiguracionFormularioMesa`).

### 5.3 Clases Tailwind que no existen — 🟠 causa directa de componentes pegados
El código usa utilidades de Tailwind, pero Tailwind **no está instalado**. `globals.css` define a mano solo algunas. **Hay 296 clases usadas que no están definidas**, así que el navegador las ignora:
- Las más usadas: `py-2.5` (142), `block` (100), `py-1.5` (84), `mb-1` (77), `dark:*` (≈300 usos en total, que no hacen nada), `text-[11px]` (53), `px-2.5` (44), `pt-2` (38), `py-3.5` (33), `divide-y` (25), `pt-4` (24), `space-y-6` (22), `hover:*`, `focus:ring-*`, `truncate`…
- Ejemplo visible: en **todas** las páginas de configuración, el contenedor de pestañas usa `px-6 pt-4`, pero `pt-4` no existe, así que las pestañas quedan pegadas al borde superior.
- Archivos más afectados (clases sin efecto):
  - `activos/.../PestanaCatalogosAuxiliares.tsx` (235)
  - `app/.../articulos/[id]/historial/page.tsx` (176)
  - `cmdb/.../PestanaClasesCI.tsx` (106)
  - `.../articulos/[id]/editar/page.tsx` (99)
  - `problemas/.../PestanaListasCatalogos.tsx` (85)
  - `cmdb/.../PestanaTiposRelacion.tsx` (81)

**Decisión necesaria:** o se instala Tailwind (lo que da sentido a las ~2 000 clases existentes y permite quitar estilos inline), o se reemplazan esas clases por las clases propias de `globals.css`. Mezclar los tres sistemas, como ahora, es lo que impide la homogeneidad.

---

## 6. Desbordes y espaciado
- **49 de 151 tablas** no tienen contenedor con scroll horizontal (ni `TablaDobleScroll` ni `overflowX`), así que en pantallas estrechas se desbordan. Peores casos:
  - `reportes/views/VistaInformeSupervision.tsx` (9 tablas)
  - `problemas/views/VistaProblemasEquipoTrabajo.tsx` (3)
  - `cambios/views/VistaCambiosEquipoTrabajo.tsx`, `servicios/views/VistaIncumplimientosSla.tsx`, `activos/.../PestanaFabricantesModelos.tsx` (2 cada uno)
  - `tickets/gestion/mios`, `VistaSlaObjetivos`, `VistaEscalamientosSla`, `VistaAuditoriaSistema`, `VistaPanelTecnico`, `VistaPanelSupervisor`, `VistaIncidentesMayores`…
- **Grids con columnas mínimas rígidas** que obligan a hacer scroll horizontal o salen del contenedor por debajo de ~800 px:
  - `PestanaCamposMesa.tsx:584` (`minmax(380px,1fr) minmax(360px,1fr)`)
  - `servicios/.../[id]/formulario/ui.tsx:122` (`minmax(440px,1fr)`)
  - `VistaPanelAdministrador.tsx:291, 424` (`minmax(420px,1fr)`)
  - `VistaCambiosTodosEquipos.tsx:135` y `VistaProblemasTodosEquipos.tsx:135` (`minmax(380px)`)
  - Columnas laterales fijas de 300-360 px en `PestanaUbicaciones`, `PestanaClasesTipos`, `PestanaCatalogos`, `PestanaTiposCambio`, `VistaActivosMapa`, `VistaCambiosImplementacion` y `VistaCambiosGestionDetalle`.
- **Modales con ancho fijo** sin `maxWidth`: `PestanaVentanasMantenimiento.tsx:277` (700) y `:487` (800), `PestanaPeriodosCongelamiento.tsx:309` (680), `PestanaFeriados.tsx:358, 467` (560). Además, 41 elementos tienen `minWidth ≥ 600`.
- **22 filas de 3-5 botones** en `display:flex` sin `flexWrap`: los botones se salen por la derecha o se comprimen. Por ejemplo:
  - `PestanaReglasClasificacion.tsx:289` (5) y `PestanaMatrizAutoridad.tsx:292` (4)
  - `VistaCambiosMisCambios.tsx:99` (4)
  - `VistaConfiguracionFormularioMesa.tsx:103`, `GestionCategorias.tsx:773, 1002`, `VistaKedb.tsx:230`, `VistaPanelTecnico.tsx:478` y `VistaInventarioActivos.tsx:420`

---

## 7. Seguridad e inconsistencias de acceso
1. 🔴 **Credenciales de Supabase en texto plano dentro del repositorio** (3 scripts; además, el repo tiene remoto en GitHub). Hay que **rotar la contraseña de la BD ya**, quitar las credenciales del código (usar solo `process.env.DATABASE_URL`) y limpiar el historial (`git filter-repo`) si el repo es o fue público.
2. 🔴 **Volcado SQL de 2 MB versionado** (`docs/reestructuracion/respaldo/`), con datos reales de correo y usuarios.
3. 🟡 `/plataforma/tickets/[id]/page.tsx` no llama a `exigirMenuPagina` (sus equivalentes de incidentes y solicitudes sí). El middleware solo comprueba que exista la cookie.
4. 🟡 `/panel` y `/api-clientes` quedan fuera del `matcher` del middleware y traen datos de prueba precargados (DNI, nombre y correo ficticios). Conviene decidir si deben ser públicos.
5. ⚪ Los perfiles se identifican por número fijo (1-10) en 76 lugares: si cambia un ID en la BD, la lógica falla sin avisar.

---

## 8. Calidad de código
- ✅ `tsc --noEmit` compila sin errores, con `strict: true`.
- ⚠️ 1 136 `any` (sobre todo en las respuestas de `fetch`), y no hay configuración de ESLint aunque `npm run lint` exista.
- ⚠️ Archivos gigantes que mezclan datos, lógica y UI:
  - `servicios/config/servicios/page.tsx` (2 293, y además es un "page.tsx" dentro de `modules`)
  - `VistaTicketsDetalle.tsx` (2 049) y `VistaCambiosGestionCrear.tsx` (1 816)
  - `PestanaCamposMesa.tsx` (1 734, de las que ~800 son el simulador) y `VistaTicketsGestionCrear.tsx` (1 634)
- ⚠️ Valores por defecto de negocio escritos en componentes cliente: SLA 4/8/24/72, niveles VIP…Estándar (duplicados en `PestanaCamposMesa` y `VistaTicketsGestionCrear`), opciones de categorías y servicios de ejemplo en la config por defecto.

---

## 9. Plan de acción recomendado (en orden)

**Fase 0 — Urgente (hoy)**
1. Rotar la contraseña de Supabase y eliminar las cadenas de conexión de `scripts/`.
2. Sacar `backup_pre_reestructuracion.sql` del repo y añadir `*.sql` de respaldo y `scripts/dist/` a `.gitignore`.

**Fase 1 — Homogeneidad funcional**
3. Mostrar el `esquema_formulario` del servicio seleccionado en `VistaTicketsGestionCrear` (bug crítico §3.2).
4. Hacer que cliente y servidor calculen prioridad y SLA desde `matriz_prioridad_institucional` y los objetivos SLA, y unificar `matrizSlaService` con `matrizPrioridadService`.
5. Corregir el campo duplicado `fecha_limite` / `fecha_limite_deseada`.
6. Crear un **renderizador de formulario único** y usarlo en Mesa, Problemas y Cambios. Eliminar los simuladores de `PestanaCamposMesa`, `ConfiguracionVistasTickets` y la vista previa del portal de servicios.
7. Decidir qué hacer con "Reglas operativas" (vistas del ticket por perfil): conectarlas a `VistaTicketsDetalle` o eliminarlas.
8. Unificar el detalle de ticket (página y modal) en una sola composición de presentadores.

**Fase 2 — Limpieza**
9. Borrar los 68 archivos inalcanzables (§4.1), las pestañas inaccesibles (§4.2) o exponerlas, los 6 endpoints `simular` y los scripts de una sola vez.
10. Centralizar `PERFILES` y la lógica de "ruta de retorno por perfil" en `shared/lib`.

**Fase 3 — Estandarización visual**
11. Decidir entre Tailwind y CSS propio, y crear tokens (`:root { --color-primario … }`).
12. Componentes comunes: `Boton` (icono **o** texto), `Modal`, `Tabla` (siempre con scroll), `Pestanas` y `Aviso` (que sustituya a `alert` / `confirm`).
13. Corregir los 45 botones con icono y texto, las 49 tablas sin scroll, las 22 filas de botones sin `flexWrap` y los grids o modales rígidos.

---

## 10. Verificación en vivo (app ejecutada en local)

Entorno: `npm run dev` contra una BD **local** `flowdesk_auditoria` (no producción), sesión con el admin de prueba del seed (9 perfiles), captcha y `X-Frame-Options` relajados **solo en desarrollo** mediante `.env.development.local`. Se midieron 127 pantallas/pestañas a 1366 px y 768 px en el navegador real.

### 10.1 Restauración de BD rota — 🔴 nuevo
- `db/01_schema_completo.sql` **no restaura**: referencia 112 secuencias (`nextval(...)`) que nunca crea, y crea 2 FKs (`fk_servicio_categoria_tipo`, `fk_ticket_categoria_tipo`) antes del índice único que necesitan.
- `db/03_seed_data.sql` trae el **menú anterior a la reestructuración**: no incluye `/plataforma/inicio` y apunta a decenas de rutas que ya no existen → tras restaurar, el admin cae en **403** al iniciar sesión. La única copia válida del menú está en Supabase.

### 10.2 Homogeneidad configurado ↔ usuario (prueba de ida y vuelta)
Se guardó la configuración como admin con "trazadores" y se abrió `/solicitudes/crear` como Solicitante:

| Cambio hecho por el admin | ¿Llega al usuario? |
|---|---|
| Etiqueta del campo dinámico `modalidad_acceso` | ✅ Sí |
| Etiqueta de `justificacion` (campo de sistema) | ❌ No |
| Placeholder de `titulo` | ❌ No |
| Ocultar `tipo_activo_cmdb` | ❌ No (sigue visible) |
| Invertir el orden de secciones | ❌ No |
| Campo obligatorio en el formulario del servicio | ❌ No se muestra **y el envío falla con 400** "Completa el campo obligatorio…" |
| — | ❌ "Fecha Límite Deseada" aparece **dos veces** |

Además: con perfil activo **Solicitante** aparece "Autoasignarme este ticket para atención técnica", porque `esPersonalTI` se calcula con *todos* los perfiles asignados al usuario y no con el perfil activo.

### 10.3 Permisos con dos fuentes de verdad — 🟠 nuevo
El menú/vistas (BD) permite al Administrador pestañas cuyo API responde "No autorizado para esta operación" porque `CAPACIDADES_POR_PERFIL` (fijo en `shared/lib/capacidades.ts`) no lo permite: Gestión de cambios (4 vistas), PIR, Calendario/Programación, CAB agenda/emergencia, Activos → Mantenimiento, Inventario → Asignaciones/Importar, Reportes de cambios/problemas, Políticas de conocimiento, Categorías del catálogo. Si se pide por URL una vista no permitida, el servidor cae a la vista por defecto pero el cliente consulta la vista pedida y muestra "No tienes permiso para consultar esta bandeja".

### 10.4 Desbordes medidos en el navegador (768 px, con menú lateral abierto)
- **Tablas cortadas sin scroll** (columnas inaccesibles) por `.contenedor-tabla { overflow: hidden }` (`globals.css:557`): CMDB → CIs (+666 px), Activos → Inventario todos (+521), Solicitudes/Incidentes → Reglas (+478/+423), Cambios → Riesgo (+427), Conocimiento → Políticas (+184).
- **Página completa con scroll horizontal** (`.app-area-principal`): Reportes → Supervisión (+572), Activos → Configuración tipos (+405), Incidentes/Solicitudes → Configuración de campos (+325; el simulador queda fuera), Licencias → Consulta (+283), Inventario operativo (+275), Conocimiento → Mis artículos (+167), CAB → Miembros (+118).
- Barra de pestañas `PestanasVista` con scroll oculto en casi todas las pantallas de 768 px (hasta +491 px en Configuración de cambios): las pestañas finales no se ven.
- Botones con texto cortado: Problemas → Configuración → Listas (7 botones).
- 1366 px: sin desbordes; los botones icono+texto confirmados en vivo coinciden con §5.1 (más la página 403, CAB → Miembros, CMDB → Análisis y Topología).

---

## 11. Ejecución de fases y diagnósticos

> Corrección a §6: los modales de `PestanaFeriados`, `PestanaPeriodosCongelamiento` y `PestanaVentanasMantenimiento` ya tenían `maxWidth: "90vw"`; ese punto era un falso positivo.

### Fase 0 — Seguridad y restauración ✅
| Hecho | Diagnóstico |
|---|---|
| Credencial de Supabase eliminada de los 3 scripts (ahora solo `process.env`) | 0 coincidencias en archivos versionables |
| `backup_pre_reestructuracion.sql` y `scripts/dist/` fuera de git y en `.gitignore` (siguen en disco) | `git status` los marca como eliminados del índice |
| `db/01_schema_completo.sql`: 112 secuencias creadas al inicio; 2 FKs movidas al final | Restauración 01→04 en BD nueva: **0 errores** |
| `db/03_seed_data.sql`: bloque final que sincroniza todas las secuencias con los ids insertados | Crear problemas/artículos ya no falla con "llave duplicada" |
| `db/02_stored_procedures.sql`: `sp_registrar/actualizar_usuario_cliente` corregidos (`#variable_conflict use_column`, cast `LOWER()::VARCHAR`) | `npm run test:api-clientes`: **14/14** (antes 8/14) |
| Nuevo `scripts/exportar_menu_actual.js` → genera `db/04_menu_y_configuracion.sql` desde la BD real | Probado contra BD local |
| **Pendiente (usuario):** rotar la contraseña de Supabase; la credencial sigue en 3 commits del historial (borrarla exige reescribir historial + force-push). Ejecutar el exportador contra producción. | — |

### Fase 1 — Homogeneidad ✅ (con 2 decisiones pendientes)
| Hecho | Diagnóstico en vivo |
|---|---|
| `VistaTicketsGestionCrear` aplica etiqueta, placeholder, ayuda, visibilidad y obligatoriedad configuradas a los campos de sistema | Los 6 trazadores llegan al usuario |
| Muestra y valida los campos del **formulario del servicio** (`esquema_formulario`) | Solicitud con campo obligatorio del servicio se registra (antes: 400) |
| `fecha_limite` deja de duplicarse | Un solo campo de fecha |
| `esPersonalTI` usa el **perfil activo** | "Autoasignarme" ya no aparece al Solicitante |
| Prioridad desde `matriz_prioridad_institucional` en servidor (`resolverCodigoPrioridad`) y cliente (vía `/api/tickets/catalogos`) | Ambos usan la misma fuente; la constante queda solo como respaldo |
| Eliminados los simuladores: Mesa (−879 líneas), vistas de ticket (−288), vista previa del portal de servicios (−88) | Configuración de campos a 768 px ya no desborda la página (antes +325 px) |
| Problemas: "Método de análisis" sale del catálogo configurado | — |
| **Pendiente (decisión):** conectar o eliminar "Reglas operativas" (`vistas_ticket_perfil`, nadie la lee); unificar `VistaTicketsDetalle` y `ModalDetalleTicket` | — |

### Fase 2 — Limpieza ✅
| Hecho | Diagnóstico |
|---|---|
| Eliminados: 6 endpoints `simular-*` + 6 controladores + 6 servicios, 5 presentadores duplicados, `src/shared/types`, 2 `page.tsx` sueltos en `modules`, 12 barriles sin importadores, 125 scripts de un solo uso | Archivos versionados: 1 114 → 944; `tsc` 0 errores |
| Scripts conservados: `test_e2e_*`, `test/seed_api_clientes`, `protect_audit_log`, `exportar_menu_actual`; SSL condicional a `localhost` | API clientes 14/14 |
| `npm test` ya **no escribe en producción**: respeta `DATABASE_URL` del entorno antes que `.env.local` | El e2e depende de usuarios que solo existen en producción (ids fijos) — no es portable |
| **Pendiente (decisión):** 44 archivos (~13 500 líneas) de pantallas sin ruta: flujo de evaluación de cambios, flujo/relaciones de problemas, paneles de conocimiento, vistas antiguas de problemas | — |

### Fase 3 — Estandarización visual ✅
| Hecho | Diagnóstico |
|---|---|
| Regla icono **o** texto: codemod AST sobre `<button>` y enlaces `boton-*` (svg, componentes de `Iconos.tsx`, flechas/emoji) | Botones icono+texto: **45 → 0** reales (quedan 3 detecciones legítimas: botón solo-icono con condición, flecha del selector de perfil) |
| `BotonLogout`: icono solo en modo compacto, texto solo en modo normal | — |
| `.contenedor-tabla` con `overflow-x: auto` (antes `hidden`) | Ver §11.1 |
| `PestanasVista` con `flexWrap` en vez de scroll oculto | Ver §11.1 |
| 160 utilidades estilo Tailwind + clases semánticas sin definir (`boton-principal`, `boton-peligro`, `mensaje-exito/vacio/cargando`, `tabla-base/formal`, `sm:/md:/lg:`) agregadas a `globals.css` | Clases sin definir: 296 → 33 (animaciones y clases de impresión) |
| 22 filas de 3-5 botones con `flexWrap: "wrap"`; 102 grids `minmax(Npx,1fr)` → `minmax(min(Npx,100%),1fr)` | Ver §11.1 |
| **Pendiente (decisión):** instalar Tailwind o migrar a clases propias; componentes comunes `Boton`/`Modal`/`Tabla`; 165 `alert()/confirm()` nativos | — |

### 11.1 Diagnóstico final (después de las 4 fases)

| Indicador | Antes | Después |
|---|---|---|
| Restauración `db/01→03` en BD nueva | Falla (112 secuencias, 2 FKs, SP rotos, secuencias en 1) | **0 errores** |
| `npm run test:api-clientes` (BD local) | 8/14 | **14/14** |
| Credenciales de producción en archivos versionados | 3 | **0** (siguen en el historial de git) |
| Formulario configurado → formulario del usuario (6 trazadores) | 1/6 | **6/6** |
| Campo obligatorio del servicio | Invisible + error 400 | Visible y validado; solicitud creada |
| Botones icono + texto | 45 | **0** (3 detecciones legítimas) |
| Clases CSS usadas sin definir | 296 | **33** (animaciones/impresión) |
| Pestañas ocultas por scroll a 768 px | ~60 pantallas | **0** |
| Tablas con columnas recortadas sin scroll | 6 | **0** |
| Páginas que desbordan a 768 px | 10 | **3** (CAB → Miembros +78, Conocimiento → Mis artículos +167, KEDB +6) |
| Páginas que desbordan a 1366 px | 0 | 0 |
| Archivos versionados | 1 114 | 944 |
| Archivos sin ruta que los use | 68 (~16 000 líneas) | 44 (~13 500, pendientes de decisión) |
| `tsc --noEmit` | 0 errores | 0 errores |

Entorno temporal retirado: captcha y `X-Frame-Options` restaurados a su código original, `.env.development.local` eliminado y servidor detenido. Queda la BD local `flowdesk_auditoria` (PostgreSQL local, sin efecto en producción) y `.claude/launch.json` para volver a levantar la app.

### 11.2 Pendientes que requieren tu decisión
1. **Rotar la contraseña de Supabase** y decidir si se reescribe el historial de git (force-push).
2. Ejecutar `DATABASE_URL="<producción>" node scripts/exportar_menu_actual.js` para versionar el menú vigente en `db/04_menu_y_configuracion.sql`.
3. "Reglas operativas" (vistas del ticket por perfil): conectarlas al detalle del ticket o eliminarlas.
4. Unificar el detalle de ticket (página `VistaTicketsDetalle` y modal `ModalDetalleTicket` + presentadores).
5. Alinear permisos: menú/vistas en BD frente a `CAPACIDADES_POR_PERFIL` en código (§10.3).
6. Exponer o eliminar las 44 pantallas sin ruta (§4.1).
7. Tailwind o CSS propio; componentes comunes `Boton`, `Modal`, `Tabla`, `Aviso` (165 `alert/confirm`).
8. Los 3 desbordes restantes a 768 px.

---

## 12. Segunda ronda: pendientes resueltos

| # | Pendiente | Qué se hizo | Verificación |
|---|---|---|---|
| 1 | Contraseña en GitHub | Historial reescrito (se quitaron de los 403 commits los 4 scripts que la contenían) y *force-push* de las 10 ramas. Etiquetas locales `pre/post-reestructuracion-menu` re-apuntadas; objetos viejos purgados. Respaldo completo en un `.bundle` | 0 commits con la clave en GitHub y en `.git` local. **Los PR #1–#4 (`refs/pull/*`) los conserva GitHub** y solo su soporte puede purgarlos |
| 2 | Exportar menú vigente | `scripts/exportar_menu_actual.js` ejecutado contra producción (solo lectura) → `db/04_menu_y_configuracion.sql` (79 opciones, 263 permisos, 250 vistas, 9 configuraciones). Se corrigió el exportador para columnas `jsonb` | Carga en BD local: 0 errores |
| 3 | Conectar "Reglas operativas" | Nuevo `src/modules/tickets/reglasVistaTicket.ts`: única fuente para claves, valores por defecto y resolución usuario → perfil → defecto. Lo usan la pantalla de configuración, la ficha del ticket **y la API** (tipo de ticket permitido y notas internas). `horas_reapertura` y `exigir_solucion_al_resolver` ya no están fijos en código | Con la configuración real: Solicitante y Aprobador sin notas internas, CMDB, SLA ni acciones; Auditor ve todo en solo lectura; Admin con acciones |
| 4 | Detalle único ITIL v4 | La página es la ficha única (ciclo de estados, compuerta SoD, acciones, escalamiento a Problema, CSAT). Se le fusionó el **cronómetro SLA** del modal; las transiciones quedan solo para Admin/Técnico/Supervisor (Auditor = solo lectura). Eliminados `ModalDetalleTicket` + 10 presentadores + 6 secciones; tablas y centros de aprobación navegan a la ficha (`rutas.ts`). El Aprobador ya puede abrir las solicitudes que dictamina (antes 403) y `/plataforma/tickets/[id]` tiene guard | API 200 para perfiles 1, 3, 6 y 7 |
| 5 | Permisos del admin | `CAPACIDADES_POR_PERFIL[ADMINISTRADOR] = TODAS` (había capacidades faltantes y `SERVICIOS_CONFIGURAR` comentada por error); el guard de páginas deja pasar al admin | 128 pantallas/pestañas: **0 "No autorizado"** (antes 14) |
| 6 | 44 pantallas sin ruta | Analizadas una a una por su uso real. **Se conservan y exponen**: reglas de umbral de recurrencia (las usa la detección de candidatos) como pestaña "Umbral de recurrencia" (`db/05_vista_umbral_problemas.sql` da el permiso a otros perfiles) y el widget de deflexión KCS, ahora en el formulario de registro. **Se eliminan**: flujo de evaluación de cambios (salvo comités, que usa CAB → Miembros), flujo y relaciones de problemas, 8 vistas antiguas de problemas, paneles de conocimiento duplicados o rotos (llamaban APIs inexistentes) | 0 archivos sin ruta |
| 7 | CSS propio | Sin Tailwind: 138 clases `dark:*` sin efecto eliminadas y las 26 clases propias que faltaban definidas en `globals.css` | 0 clases sin definir |
| 8 | Desbordes | 15 tablas en tarjetas con `overflow:hidden` → `overflowX:auto`; 17 vistas con envoltorio propio → `vista-contenedor`; reglas responsive ampliadas (hijos de `main`, filas `.flex`, control segmentado) | 768 px: **0 pantallas desbordan** (antes 10). 1366 px: 0, salvo ~7 px de barra interna en Supervisión |

Pendiente de tu lado: avisar al equipo que **vuelva a clonar** (o haga `git fetch` + `git reset --hard origin/<rama>`); si alguien sube su copia vieja, la contraseña vuelve al historial. Ejecutar `db/05_vista_umbral_problemas.sql` en producción para que el Gestor de Problemas vea la pestaña nueva.

---

*Generado con análisis estático; los scripts usados (grafo de imports, auditoría AST de botones y layout) se pueden volver a ejecutar para medir el avance de la limpieza.*
