# ESQUEMA DE MENÚS Y FUNCIONALIDADES POR PERFIL — FlowDesk ITSM

> **Versión:** 2.0 · **Fecha:** 2026-10-15 · **Base:** `ARQUITECTURA_Y_JERARQUIA_SRC.md` (lo que ya existe) más lo que debe existir para que cada perfil tenga su propia vista.
> **Perfiles (10):** Administrador · Técnico · Solicitante · Supervisor · Gestor de Área · Auditor · Aprobador · Gestor de Cambios · Gestor de Activos y Configuración · Gestor de Problemas.
>
> **Arquitectura de referencia (actualizada):** este documento ya está alineado con la **arquitectura modular vigente**. Las rutas de Next.js en `src/app` son **delgadas**: cada `page.tsx` solo renderiza la vista del módulo y cada `api/**/route.ts` solo reexporta el controlador del módulo. La lógica operativa vive en `src/modules/<feature>/` (vistas en `views/` o por sección, controladores en `api/`, servicios en `services/`) y lo transversal en `src/shared/lib` y `src/shared/components`. Las páginas y rutas de API de perfiles aún no implementados se listan como «Archivos por crear» con su ruta delgada en `src/app/...`; su lógica irá en `src/modules/<feature>/api/` y `src/modules/<feature>/services/`.

---

## 1. Cómo leer este documento

**Numeración jerárquica.** Cada perfil tiene su propio árbol que empieza en `1`. El número refleja la profundidad: `1` grupo del menú · `1.1` opción del menú · `1.1.1` subopción o ventana interna · `1.1.1.1` funcionalidad concreta, y así hasta el sexto nivel (`1.1.1.1.1.1`) cuando hace falta. Ejemplo: `2.1.3` = tercer elemento dentro de la opción 2.1 del segundo grupo.

**Estados de cada opción.**
| Estado | Significado |
|---|---|
| `EXISTE` | El archivo ya está en el repositorio y cubre lo que el perfil necesita. |
| `ADAPTAR` | El archivo existe pero hay que ampliarlo para este perfil: nuevos permisos, otro alcance de datos, otro presentador o nuevas acciones. |
| `NUEVO` | No existe; se debe crear (los archivos se listan en «Archivos por crear»). |

**Campos de cada opción.** *Ruta* (URL, sin el prefijo interno `plataforma`), *Función* (qué hace el perfil ahí), *Archivos existentes* (rutas relativas a la raíz del repositorio, validadas contra el árbol actual) y *Archivos por crear*.

**Reglas de navegación que aplican a todos los perfiles.**
1. **Un ítem de menú = una pantalla.** Ninguna página repite en su parte superior botones o pestañas que ya son ítems del menú (por ejemplo, «Catálogo de incidentes» y «Catálogo de solicitudes» se alternan solo desde el menú lateral).
2. Las **ventanas internas** (componentes `Pestana*.tsx`, selector `?vista=`) se permiten solo para secciones que no están en el menú.
3. Los íconos son de línea, con botones cuadrados de 32 px en las filas de tabla; los campos validan en tiempo real y solo muestran errores.

---

## 2. Decisiones de organización (recomendadas)

1. **Espacio propio por rol para lo que es exclusivo de ese rol.** Los paneles, bandejas y herramientas de cada perfil viven en `/<perfil>/...` (por ejemplo `/supervisor/panel`, `/gestor-cambios/evaluacion`), igual que el Técnico ya usa `/tecnico/...`.
2. **Páginas de dominio compartidas cuando el dato es el mismo.** El detalle del ticket (`/tickets/[id]`), de la RFC (`/cambios/gestion/[id]`), del problema (`/problemas/[id]`) y del activo (`/activos/inventario`) son únicos; **lo que cambia es el presentador por rol** (`src/modules/tickets/presentadores/`, carpeta ya prevista en la arquitectura modular) y los permisos que se verifican en el servidor.
3. **Páginas de gobierno existentes se conservan** (`/tickets/gestion/*`, `/cambios/gestion/*`): las comparten Supervisor, Gestor de Área, Auditor y Aprobador según permisos, sin duplicar archivos.
4. **Cada perfil tiene una página de inicio** (`/<perfil>/panel`). `/dashboard` pasa a ser un redirector que envía al panel del perfil activo.
5. **Reutilizar, no copiar.** Las configuraciones de cambios, problemas y activos se editan solo en `/admin/...`; los gestores acceden a la misma pantalla con permisos limitados (`config.cambios.calendario`, `config.activos.catalogos`).
6. **Convención de módulos (arquitectura modular).** Las rutas de Next.js en `src/app` son delgadas: `page.tsx` solo renderiza la vista del módulo y `api/**/route.ts` solo reexporta el controlador. Todo servicio nuevo sigue el patrón `<modulo>Service.ts`, `<modulo>Validaciones.ts` y `<modulo>Types.ts` dentro de `src/modules/<feature>/services/` (o en la raíz del módulo, como en `src/modules/seguridad/`), y su controlador en `src/modules/<feature>/api/<modulo>Controller.ts`. Lo transversal se ubica en `src/shared/lib` y `src/shared/components`.
7. **Elementos comunes del encabezado** para todos los perfiles: selector de perfil (existe), búsqueda global `Ctrl+K` (nuevo), campana de notificaciones (nuevo) y menú de usuario con «Mi cuenta» (existe).

---

## 3. Resumen por perfil
| # | Perfil | Inicio | Presentador de ticket | Opciones | Existen | Por adaptar | Nuevas |
|---|---|---|---|---|---|---|---|
| 1 | Administrador | `/admin` | VistaTicketAdministrador (existe) | 139 | 123 | 9 | 7 |
| 2 | Técnico | `/tecnico/panel` | VistaTicketOperador (existe) | 48 | 45 | 1 | 2 |
| 3 | Solicitante | `/tickets` | VistaTicketConsumidor (existe) | 24 | 9 | 5 | 10 |
| 4 | Supervisor | `/supervisor/panel` | VistaTicketSupervisor (existe) | 56 | 27 | 6 | 23 |
| 5 | Gestor de Área | `/gestor-area/panel` | VistaTicketGobernanza (existe) y PresentadorGestorArea (nuevo) | 29 | 11 | 3 | 15 |
| 6 | Auditor | `/auditor/panel` | VistaTicketGobernanza (existe) y PresentadorAuditor (nuevo, solo lectura) | 30 | 3 | 13 | 14 |
| 7 | Aprobador | `/aprobador/panel` | VistaTicketGobernanza (existe) y PresentadorAprobador (nuevo) | 19 | 4 | 3 | 12 |
| 8 | Gestor de Cambios | `/gestor-cambios/panel` | PresentadorRfcEvaluador (nuevo) | 27 | 6 | 7 | 14 |
| 9 | Gestor de Activos y Configuración | `/gestor-activos/panel` | PresentadorActivoGestor (nuevo) | 35 | 9 | 8 | 18 |
| 10 | Gestor de Problemas | `/gestor-problemas/panel` | PresentadorProblemaGestor (nuevo) | 18 | 4 | 1 | 13 |

### Matriz perfil × módulo
| Módulo | Admin | Técnico | Solicit. | Superv. | G. Área | Auditor | Aprob. | G. Cambios | G. Activos | G. Problemas |
|---|---|---|---|---|---|---|---|---|---|---|
| Incidentes y solicitudes | Consulta | Opera | Crea y sigue | Despacha | Aprueba y consulta | Lectura | Aprueba solicitudes | — | — | — |
| SLA | Configura | Monitorea | Ve tiempo | Gestiona | Ve percibido | Audita | — | — | — | Objetivos |
| Problemas y KEDB | Consulta | Registra y aplica | — | Supervisa | — | Lectura | Aprueba cierre mayor | — | — | Gestiona |
| Cambios | Configura | Solicita e implementa | Ve avisos | Aprueba técnico | Aprueba negocio | Audita | Autoriza y dictamina | Gestiona | Aplica a CMDB | Vincula RFC |
| Activos y CMDB | Configura | Consulta y mantiene | Sus activos | Aprueba bajas | Activos del área | Audita | Aprueba bajas | Consulta | Gestiona | Consulta |
| Conocimiento | Gobierna | Crea y consume | Consume | Revisa | Consume | Lectura | — | — | — | Genera |
| Reportes | Todos | Propios | — | Del equipo | Del área | Evidencias | De decisiones | De cambios | De activos | De problemas |

---


## PERFIL 1 — Administrador

- **Rol:** Gobierno y configuración del sistema ITSM: define formularios, flujos, SLA, perfiles, menú, catálogos y retención. Publica la configuración con versionado y auditoría.
- **Alcance de datos:** Toda la configuración. Consulta global de la operación; no opera tickets ni aprueba (segregación de funciones).
- **Inicio:** `/admin` · **Presentador de ticket:** VistaTicketAdministrador (existe)
- **Permisos de referencia:** Permisos `config.*` (editar y publicar); `*.ver` de todos los módulos.
- **Opciones:** 139 (existen 123, por adaptar 9, nuevas 7).

### 1 Configuración  `EXISTE`
Grupo de configuración del sistema; solo el Administrador edita y publica.
- Ruta: `/admin`
- Archivos existentes: `src/app/plataforma/admin/page.tsx`
- **1.1** Identidades y accesos — `EXISTE`
  - Ruta: `/admin`
  - Función: Usuarios, perfiles y estructura del menú.
  - **1.1.1** Gestión de usuarios — `EXISTE`
    - Ruta: `/admin/usuarios`
    - Función: Alta, edición, bloqueo y desbloqueo de usuarios; asignación de perfiles múltiples; envío de credenciales.
    - Archivos existentes: `src/app/plataforma/admin/usuarios/page.tsx`, `src/app/api/usuarios/route.ts`, `src/app/api/usuarios/[id]/route.ts`, `src/app/api/usuarios/[id]/desbloquear/route.ts`, `src/app/api/usuarios/enviar-credenciales/route.ts`
    - **1.1.1.1** Alta y edición con validación de documento (DNI, RUC, CE, pasaporte) — `ADAPTAR`
      - Función: El tipo de documento cambia el validador del número en tiempo real.
      - Archivos existentes: `src/shared/lib/validaciones.ts`
    - **1.1.1.2** Bloqueo, desbloqueo y envío de credenciales — `EXISTE`
  - **1.1.2** Perfiles y permisos — `EXISTE`
    - Ruta: `/admin/perfiles`
    - Función: Matriz de permisos por perfil.
    - Archivos existentes: `src/app/plataforma/admin/perfiles/page.tsx`, `src/app/api/perfiles/route.ts`, `src/app/api/perfiles/[id]/route.ts`
    - **1.1.2.1** Perfiles del sistema (los 10) y permisos por acción — `ADAPTAR`
      - Función: Incorporar el perfil Gestor de Problemas y los permisos de las secciones de los Prompts 1 a 4.
      - Archivos existentes: `src/shared/lib/capacidades.ts`
  - **1.1.3** Estructura del menú — `EXISTE`
    - Ruta: `/admin/menu`
    - Función: Orden, visibilidad y bloqueo de ítems por perfil.
    - Archivos existentes: `src/app/plataforma/admin/menu/page.tsx`, `src/app/api/menu/admin/route.ts`, `src/app/api/menu/admin/[id]/route.ts`, `src/shared/lib/menu.ts`
    - **1.1.3.1** Carga de los menús de los 10 perfiles — `EXISTE`
      - Función: Script idempotente que siembra el menú de cada perfil según este esquema (árbol por perfil, con rango de IDs propio `10000 + id_perfil * 1000` y `bloqueado = true` en las opciones cuya página aún no existe).
      - Archivos existentes: `src/shared/lib/scripts/migrar_menu_tecnico.ts`, `src/shared/lib/scripts/migrar_menu_perfiles.ts`
- **1.2** Catálogo de servicios y SLAs — `EXISTE`
  - Ruta: `/admin/servicios`
  - Función: Servicios de incidentes y de solicitudes, categorías y objetivos de tiempo.
  - Archivos existentes: `src/app/plataforma/admin/servicios/page.tsx`
  - **1.2.1** Servicios de incidentes — `EXISTE`
    - Ruta: `/admin/servicios?tipo=1`
    - Función: Listado y edición de servicios de incidente.
    - Archivos existentes: `src/app/plataforma/admin/servicios/page.tsx`, `src/app/api/servicios/route.ts`, `src/app/api/servicios/[id]/route.ts`
  - **1.2.2** Servicios de solicitudes — `EXISTE`
    - Ruta: `/admin/servicios?tipo=2`
    - Función: Listado, edición y flujo de aprobación por servicio.
    - Archivos existentes: `src/app/plataforma/admin/servicios/page.tsx`, `src/app/api/servicios/[id]/workflow/route.ts`
  - **1.2.3** Crear servicio — `EXISTE`
    - Ruta: `/admin/servicios?vista=crear`
    - Función: Formulario oficial de servicio con validaciones en tiempo real.
    - Archivos existentes: `src/app/plataforma/admin/servicios/[id]/formulario/page.tsx`, `src/modules/servicios/admin/servicios/[id]/formulario/ui.tsx`
  - **1.2.4** Configuración de categorías — `EXISTE`
    - Ruta: `/admin/servicios?vista=categorias`
    - Función: CRUD de categorías con unicidad de nombre y código.
    - Archivos existentes: `src/modules/servicios/admin/servicios/GestionCategorias.tsx`, `src/app/api/admin/categorias/route.ts`, `src/app/api/admin/categorias/[id]/route.ts`
  - **1.2.5** Objetivos SLA — `EXISTE`
    - Ruta: `/admin/servicios/sla`
    - Función: Matriz institucional de tiempos por prioridad y matriz impacto × urgencia.
    - Archivos existentes: `src/app/plataforma/admin/servicios/sla/page.tsx`, `src/modules/servicios/admin/servicios/sla/components/MatrizPrioridadSla.tsx`, `src/modules/servicios/admin/servicios/ConfiguracionObjetivosSla.tsx`, `src/app/api/admin/sla/route.ts`, `src/app/api/admin/sla/matriz/route.ts`
- **1.3** Configuración de procesos — `EXISTE`
  - Ruta: `/admin/procesos`
  - Función: Formularios, flujos y reglas por proceso ITIL.
  - **1.3.1** Incidentes — `EXISTE`
    - **1.3.1.1** Configuración de formulario — `EXISTE`
      - Ruta: `/admin/tickets-formularios?tipo=incidente`
      - Función: Campos, orden y obligatoriedad del formulario de incidente.
      - Archivos existentes: `src/app/plataforma/admin/tickets-formularios/page.tsx`, `src/app/api/admin/configuracion/route.ts`
    - **1.3.1.2** Flujo de estados y acciones — `EXISTE`
      - Ruta: `/admin/tickets-vistas?seccion=estados&tipo=incidente`
      - Función: Estados, transiciones y acciones por rol.
      - Archivos existentes: `src/app/plataforma/admin/tickets-vistas/page.tsx`
  - **1.3.2** Solicitudes de servicio — `EXISTE`
    - **1.3.2.1** Configuración de formulario — `EXISTE`
      - Ruta: `/admin/tickets-formularios?tipo=solicitud`
      - Función: Formulario de solicitud.
      - Archivos existentes: `src/app/plataforma/admin/tickets-formularios/page.tsx`
    - **1.3.2.2** Flujo de atención y aprobaciones — `EXISTE`
      - Ruta: `/admin/tickets-vistas?seccion=estados&tipo=solicitud`
      - Función: Estados, tareas y etapas de aprobación.
      - Archivos existentes: `src/app/plataforma/admin/tickets-vistas/page.tsx`
  - **1.3.3** Gestión de problemas — `EXISTE`
    - Ruta: `/admin/procesos/problemas`
    - Función: Prompt 1.
    - Archivos existentes: `src/app/plataforma/admin/procesos/problemas/page.tsx`
    - **1.3.3.1** Configuración de formulario — `ADAPTAR`
      - Ruta: `/admin/procesos/problemas/formulario`
      - Función: Formulario configurable de problemas con versionado.
      - Archivos existentes: `src/app/plataforma/admin/procesos/problemas/formulario/page.tsx`, `src/modules/problemas/config/formulario/components/BarraAccionesComun.tsx`, `src/modules/problemas/config/formulario/components/ModalVistaPrevia.tsx`, `src/modules/problemas/config/formulario/components/ModalPublicacion.tsx`, `src/modules/problemas/config/formulario/components/ModalHistorialVersiones.tsx`, `src/modules/problemas/config/formulario/components/ModalRestaurarFabrica.tsx`
      - **1.3.3.1.1** Campos — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/formulario/components/PestanaCampos.tsx`
      - **1.3.3.1.2** Campos personalizados — `NUEVO`
        - Función: API admin/problemas/campos-personalizados ya existe.
        - Archivos por crear: `src/modules/problemas/config/formulario/components/PestanaCamposPersonalizados.tsx`
      - **1.3.3.1.3** Listas y catálogos — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/formulario/components/PestanaListasCatalogos.tsx`
      - **1.3.3.1.4** Matriz de prioridad (compartida) — `NUEVO`
        - Función: API admin/problemas/matriz-prioridad ya existe.
        - Archivos por crear: `src/modules/problemas/config/formulario/components/PestanaPrioridad.tsx`
      - **1.3.3.1.5** Plantillas de problema — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/formulario/components/PestanaPlantillas.tsx`
      - **1.3.3.1.6** Vista del ticket — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/formulario/components/PestanaVistaTicket.tsx`
    - **1.3.3.2** Flujo de investigación y seguimiento — `EXISTE`
      - Ruta: `/admin/procesos/problemas/flujo`
      - Función: Estados, transiciones, asignación, objetivos, escalamiento, reapertura, tareas y problemas mayores.
      - Archivos existentes: `src/app/plataforma/admin/procesos/problemas/flujo/page.tsx`
      - **1.3.3.2.1** Estados — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/flujo/components/PestanaEstados.tsx`
      - **1.3.3.2.2** Transiciones y acciones — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/flujo/components/PestanaTransiciones.tsx`
      - **1.3.3.2.3** Asignación automática — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/flujo/components/PestanaAsignacion.tsx`
      - **1.3.3.2.4** Objetivos de tiempo — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/flujo/components/PestanaObjetivosTiempo.tsx`
      - **1.3.3.2.5** Escalamiento — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/flujo/components/PestanaEscalamiento.tsx`
      - **1.3.3.2.6** Reapertura — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/flujo/components/PestanaReapertura.tsx`
      - **1.3.3.2.7** Tareas predefinidas — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/flujo/components/PestanaTareas.tsx`
      - **1.3.3.2.8** Problemas mayores — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/flujo/components/PestanaMayores.tsx`
    - **1.3.3.3** Relación con incidentes, errores conocidos y conocimiento — `EXISTE`
      - Ruta: `/admin/procesos/problemas/relaciones`
      - Función: Umbrales, vínculos, KEDB, RFC, conocimiento y CI.
      - Archivos existentes: `src/app/plataforma/admin/procesos/problemas/relaciones/page.tsx`
      - **1.3.3.3.1** Creación automática por umbral — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/relaciones/components/PestanaUmbral.tsx`
      - **1.3.3.3.2** Incidentes vinculados — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/relaciones/components/PestanaIncidentesVinculados.tsx`
      - **1.3.3.3.3** Errores conocidos (KEDB) — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/relaciones/components/PestanaKedb.tsx`
      - **1.3.3.3.4** Cambios (RFC) — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/relaciones/components/PestanaRfc.tsx`
      - **1.3.3.3.5** Conocimiento — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/relaciones/components/PestanaConocimiento.tsx`
      - **1.3.3.3.6** CI y servicios — `EXISTE`
        - Archivos existentes: `src/modules/problemas/config/relaciones/components/PestanaCmdb.tsx`
  - **1.3.4** Gestión de cambios — `EXISTE`
    - Ruta: `/admin/procesos/cambios`
    - Función: Prompt 2.
    - Archivos existentes: `src/app/plataforma/admin/procesos/cambios/page.tsx`
    - **1.3.4.1** Configuración de formulario — `ADAPTAR`
      - Ruta: `/admin/procesos/cambios/formulario`
      - Función: Formulario de RFC configurable; unificar los modales con los de problemas.
      - Archivos existentes: `src/app/plataforma/admin/procesos/cambios/formulario/page.tsx`, `src/modules/cambios/config/formulario/components/BarraAccionesComun.tsx`, `src/modules/cambios/config/formulario/components/ModalVistaPrevia.tsx`, `src/modules/cambios/config/formulario/components/ModalPublicacion.tsx`, `src/modules/cambios/config/formulario/components/ModalHistorialVersiones.tsx`, `src/modules/cambios/config/formulario/components/ModalRestaurarFabrica.tsx`
      - **1.3.4.1.1** Campos — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/formulario/components/PestanaCampos.tsx`
      - **1.3.4.1.2** Campos personalizados — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/formulario/components/PestanaCamposPersonalizados.tsx`
      - **1.3.4.1.3** Listas y catálogos — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/formulario/components/PestanaCatalogos.tsx`
      - **1.3.4.1.4** Cuestionario de riesgo — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/formulario/components/PestanaCuestionarioRiesgo.tsx`
      - **1.3.4.1.5** Prioridad (matriz compartida) — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/formulario/components/PestanaPrioridad.tsx`
      - **1.3.4.1.6** Plantillas de RFC — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/formulario/components/PestanaPlantillas.tsx`
      - **1.3.4.1.7** Vista del ticket — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/formulario/components/PestanaVistaTicket.tsx`
    - **1.3.4.2** Tipos de cambio y requisitos — `EXISTE`
      - Ruta: `/admin/procesos/cambios/tipos-requisitos`
      - Función: Tipos, autoridad, modelos estándar y clasificación.
      - Archivos existentes: `src/app/plataforma/admin/procesos/cambios/tipos-requisitos/page.tsx`
      - **1.3.4.2.1** Tipos de cambio — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/tipos-requisitos/components/PestanaTiposCambio.tsx`
      - **1.3.4.2.2** Matriz de autoridad — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/tipos-requisitos/components/PestanaMatrizAutoridad.tsx`
      - **1.3.4.2.3** Modelos de cambio estándar — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/tipos-requisitos/components/PestanaModelosEstandar.tsx`
      - **1.3.4.2.4** Reglas de clasificación — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/tipos-requisitos/components/PestanaReglasClasificacion.tsx`
    - **1.3.4.3** Flujo de evaluación, autorización y revisión posterior — `ADAPTAR`
      - Ruta: `/admin/procesos/cambios/flujo-evaluacion`
      - Función: Estados, transiciones, etapas, comités, plazos, tareas, cierre y PIR; unificar `Iconos.tsx`.
      - Archivos existentes: `src/app/plataforma/admin/procesos/cambios/flujo-evaluacion/page.tsx`, `src/modules/cambios/config/flujo-evaluacion/components/Iconos.tsx`
      - **1.3.4.3.1** Estados — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/flujo-evaluacion/components/PestanaEstados.tsx`
      - **1.3.4.3.2** Transiciones y acciones — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/flujo-evaluacion/components/PestanaTransiciones.tsx`
      - **1.3.4.3.3** Etapas de aprobación — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/flujo-evaluacion/components/PestanaEtapasAprobacion.tsx`
      - **1.3.4.3.4** Comités (CAB y emergencia) — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/flujo-evaluacion/components/PestanaComites.tsx`
      - **1.3.4.3.5** Plazos y escalamiento — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/flujo-evaluacion/components/PestanaPlazosEscalamiento.tsx`
      - **1.3.4.3.6** Tareas y checklists — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/flujo-evaluacion/components/PestanaTareasChecklists.tsx`
      - **1.3.4.3.7** Implementación y cierre — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/flujo-evaluacion/components/PestanaImplementacionCierre.tsx`
      - **1.3.4.3.8** Revisión post-implementación — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/flujo-evaluacion/components/PestanaPir.tsx`
    - **1.3.4.4** Notificaciones y calendario de cambios — `ADAPTAR`
      - Ruta: `/admin/procesos/cambios/notificaciones-calendario`
      - Función: Eventos, ventanas, congelamientos, feriados, conflictos y presentación; el Gestor de Cambios edita solo las ventanas, congelamientos y feriados.
      - Archivos existentes: `src/app/plataforma/admin/procesos/cambios/notificaciones-calendario/page.tsx`, `src/modules/cambios/config/notificaciones-calendario/components/Iconos.tsx`
      - **1.3.4.4.1** Notificaciones — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/notificaciones-calendario/components/PestanaNotificaciones.tsx`
      - **1.3.4.4.2** Ventanas de mantenimiento — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/notificaciones-calendario/components/PestanaVentanasMantenimiento.tsx`
      - **1.3.4.4.3** Períodos de congelamiento — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/notificaciones-calendario/components/PestanaPeriodosCongelamiento.tsx`
      - **1.3.4.4.4** Feriados — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/notificaciones-calendario/components/PestanaFeriados.tsx`
      - **1.3.4.4.5** Conflictos y capacidad — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/notificaciones-calendario/components/PestanaConflictosCapacidad.tsx`
      - **1.3.4.4.6** Presentación del calendario — `EXISTE`
        - Archivos existentes: `src/modules/cambios/config/notificaciones-calendario/components/PestanaPresentacionCalendario.tsx`
- **1.4** Organización y soporte — `EXISTE`
  - Ruta: `/admin/organizacion`
  - **1.4.1** Departamentos empresariales — `EXISTE`
    - Ruta: `/admin/departamentos-empresa`
    - Función: Áreas de negocio (finanzas, legal, ventas, marketing) y su Gestor de Área.
    - Archivos existentes: `src/app/plataforma/admin/departamentos-empresa/page.tsx`, `src/app/api/departamentos-empresa/route.ts`, `src/app/api/departamentos-empresa/[id]/route.ts`
  - **1.4.2** Departamentos y grupos resolutores de TI — `EXISTE`
    - Ruta: `/admin/departamentos`
    - Función: Áreas técnicas y grupos resolutores.
    - Archivos existentes: `src/app/plataforma/admin/departamentos/page.tsx`, `src/app/api/departamentos-ti/route.ts`, `src/app/api/departamentos-ti/[id]/route.ts`
  - **1.4.3** Técnicos y niveles de soporte — `EXISTE`
    - Ruta: `/admin/tecnicos`
    - Función: Técnicos, niveles N1/N2/N3 y ausencias.
    - Archivos existentes: `src/app/plataforma/admin/tecnicos/page.tsx`, `src/app/api/tecnicos/route.ts`, `src/app/api/tecnicos/[id]/route.ts`, `src/app/api/admin/tecnicos/ausencias/route.ts`
  - **1.4.4** Supervisores — `EXISTE`
    - Ruta: `/admin/departamentos?vista=supervisores`
    - Función: Asignación de supervisores a áreas técnicas.
    - Archivos existentes: `src/app/plataforma/admin/departamentos/page.tsx`
- **1.5** Activos y configuración — `EXISTE`
  - Ruta: `/admin/activos-config/tipos-modelos-atributos`
  - Función: Prompt 3.
  - **1.5.1** Tipos, modelos y atributos de activos — `EXISTE`
    - Ruta: `/admin/activos-config/tipos-modelos-atributos`
    - Función: Clases, fabricantes, atributos, formulario, códigos, ubicaciones, listas, ficha e importación.
    - Archivos existentes: `src/app/plataforma/admin/activos-config/tipos-modelos-atributos/page.tsx`, `src/app/api/admin/activos-config/tipos-modelos-atributos/configuracion/route.ts`
    - **1.5.1.1** Jerarquía de clases y tipos — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaClasesTipos.tsx`
    - **1.5.1.2** Fabricantes y modelos — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaFabricantesModelos.tsx`
    - **1.5.1.3** Atributos por tipo — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaAtributosTipo.tsx`
    - **1.5.1.4** Configuración de formulario del activo — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaFormularioActivo.tsx`
    - **1.5.1.5** Código de activo y etiquetas — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaCodigoEtiquetas.tsx`
    - **1.5.1.6** Ubicaciones — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaUbicaciones.tsx`
    - **1.5.1.7** Listas y catálogos auxiliares — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaCatalogosAuxiliares.tsx`
    - **1.5.1.8** Ficha del activo y listado — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaFichaListado.tsx`
    - **1.5.1.9** Importación masiva e inventario físico — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaImportacionInventario.tsx`
  - **1.5.2** Ciclos de vida y reglas de transición — `EXISTE`
    - Ruta: `/admin/activos-config/ciclos-vida-transiciones`
    - Archivos existentes: `src/app/plataforma/admin/activos-config/ciclos-vida-transiciones/page.tsx`, `src/app/api/admin/activos-config/ciclos-vida-transiciones/configuracion/route.ts`
    - **1.5.2.1** Ciclos de vida y estados — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/ciclos-vida-transiciones/components/PestanaCiclosEstados.tsx`
    - **1.5.2.2** Transiciones y reglas — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/ciclos-vida-transiciones/components/PestanaTransicionesReglas.tsx`
    - **1.5.2.3** Asignación, custodia y devolución — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/ciclos-vida-transiciones/components/PestanaAsignacionCustodia.tsx`
    - **1.5.2.4** Adquisición y recepción — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/ciclos-vida-transiciones/components/PestanaAdquisicionRecepcion.tsx`
    - **1.5.2.5** Mantenimiento y fin de vida — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/ciclos-vida-transiciones/components/PestanaMantenimientoFinVida.tsx`
    - **1.5.2.6** Baja y disposición — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/ciclos-vida-transiciones/components/PestanaBajaDisposicion.tsx`
  - **1.5.3** Licencias y contratos — `EXISTE`
    - Ruta: `/admin/activos-config/licencias-contratos`
    - Archivos existentes: `src/app/plataforma/admin/activos-config/licencias-contratos/page.tsx`, `src/app/api/admin/activos-config/licencias-contratos/configuracion/route.ts`
    - **1.5.3.1** Tipos de licencia y métricas — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/licencias-contratos/components/PestanaTiposLicencia.tsx`
    - **1.5.3.2** Tipos de contrato y proveedores — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/licencias-contratos/components/PestanaTiposContrato.tsx`
    - **1.5.3.3** Formulario de licencia y contrato — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/licencias-contratos/components/PestanaFormularioLicenciaContrato.tsx`
    - **1.5.3.4** Cumplimiento y sobreuso — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/licencias-contratos/components/PestanaCumplimientoSobreuso.tsx`
    - **1.5.3.5** Alertas de vencimiento y garantía — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/licencias-contratos/components/PestanaAlertasVencimiento.tsx`
    - **1.5.3.6** Renovación — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/licencias-contratos/components/PestanaRenovacion.tsx`
  - **1.5.4** Tipos de elementos de configuración y relaciones de CMDB — `EXISTE`
    - Ruta: `/admin/activos-config/cmdb-relaciones`
    - Archivos existentes: `src/app/plataforma/admin/activos-config/cmdb-relaciones/page.tsx`, `src/app/api/admin/activos-config/cmdb-relaciones/configuracion/route.ts`, `src/app/api/admin/cmdb/tipos/route.ts`
    - **1.5.4.1** Clases de CI — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/cmdb-relaciones/components/PestanaClasesCI.tsx`
    - **1.5.4.2** Tipos de relación — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/cmdb-relaciones/components/PestanaTiposRelacion.tsx`
    - **1.5.4.3** Criticidad y entornos — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/cmdb-relaciones/components/PestanaCriticidadEntornos.tsx`
    - **1.5.4.4** Reglas de integridad — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/cmdb-relaciones/components/PestanaReglasIntegridad.tsx`
    - **1.5.4.5** Fuentes de datos y atributos protegidos — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/cmdb-relaciones/components/PestanaFuentesAtributosProtegidos.tsx`
    - **1.5.4.6** Auditoría de CMDB y líneas base — `EXISTE`
      - Archivos existentes: `src/modules/activos/config/cmdb-relaciones/components/PestanaAuditoriaLineasBase.tsx`
- **1.6** Comunicaciones y notificaciones — `EXISTE`
  - Ruta: `/admin/comunicaciones`
  - **1.6.1** Plantillas de correo y otros canales — `EXISTE`
    - Ruta: `/admin/notificaciones?seccion=plantillas`
    - Función: Plantillas y reglas de notificación por evento.
    - Archivos existentes: `src/app/plataforma/admin/notificaciones/page.tsx`, `src/app/api/admin/notificaciones/reglas/route.ts`, `src/shared/lib/email.ts`, `src/shared/lib/correo-util.ts`
  - **1.6.2** Configuración de contacto — `EXISTE`
    - Ruta: `/admin/notificaciones?seccion=contacto`
    - Función: Remitente, SMTP y datos de contacto de la mesa.
    - Archivos existentes: `src/app/plataforma/admin/notificaciones/page.tsx`, `src/app/api/admin/configuracion/route.ts`
- **1.7** Gobierno del conocimiento — `EXISTE`
  - Ruta: `/admin/conocimiento`
  - **1.7.1** Categorías, responsables y reglas de publicación y revisión — `EXISTE`
    - Ruta: `/admin/conocimiento-config`
    - Archivos existentes: `src/app/plataforma/admin/conocimiento-config/page.tsx`, `src/app/api/admin/conocimiento/route.ts`, `src/app/api/admin/conocimiento/[id]/route.ts`, `src/app/api/admin/conocimiento/categorias/route.ts`, `src/app/api/admin/conocimiento/politicas/route.ts`
- **1.8** Auditoría, seguridad y retención — `EXISTE`
  - Ruta: `/admin/auditoria`
  - **1.8.1** Auditoría de cambios — `EXISTE`
    - Ruta: `/admin/auditoria-sistema`
    - Función: Registro inmutable de cambios de configuración (antes y después).
    - Archivos existentes: `src/app/plataforma/admin/auditoria-sistema/page.tsx`, `src/app/api/admin/auditoria-sistema/route.ts`
  - **1.8.2** Registros de seguridad y autenticación — `EXISTE`
    - Ruta: `/admin/seguridad-logs`
    - Archivos existentes: `src/app/plataforma/admin/seguridad-logs/page.tsx`, `src/app/api/admin/logs/route.ts`, `src/shared/lib/security.ts`
  - **1.8.3** Retención y mantenimiento de datos — `EXISTE`
    - Ruta: `/admin/mantenimiento-datos`
    - Archivos existentes: `src/app/plataforma/admin/mantenimiento-datos/page.tsx`, `src/app/api/admin/mantenimiento-datos/route.ts`

### 2 Reportes y analítica  `EXISTE`
- Ruta: `/reportes`
- **2.1** Indicadores operativos y SLA — `EXISTE`
  - Ruta: `/tickets/reportes`
  - Función: Indicadores globales de SLA, volumen y satisfacción.
  - Archivos existentes: `src/app/plataforma/tickets/reportes/page.tsx`, `src/app/api/reportes/indicadores/route.ts`
- **2.2** Tableros — `EXISTE`
  - Ruta: `/admin/reportes-disenador`
  - Función: Diseñador de tableros.
  - Archivos existentes: `src/app/plataforma/admin/reportes-disenador/page.tsx`, `src/app/api/admin/reportes-disenador/route.ts`

### 3 Supervisión global  `ADAPTAR`
Acceso de solo consulta a toda la operación (el Administrador no opera tickets por defecto; ve con VistaTicketAdministrador).
- Ruta: `/tickets/gestion`
- Archivos existentes: `src/app/plataforma/tickets/gestion/page.tsx`
- **3.1** Todos los tickets — `EXISTE`
  - Ruta: `/tickets/gestion/todos`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/todos/page.tsx`, `src/modules/tickets/ticket-detail/presentadores/VistaTicketAdministrador.tsx`
- **3.2** Auditoría forense de tickets — `EXISTE`
  - Ruta: `/tickets/gestion/auditoria`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/auditoria/page.tsx`
- **3.3** Cambios (consulta global) — `EXISTE`
  - Ruta: `/cambios/gestion/todos`
  - Archivos existentes: `src/app/plataforma/cambios/gestion/todos/page.tsx`
- **3.4** Problemas (consulta global) — `EXISTE`
  - Ruta: `/problemas`
  - Archivos existentes: `src/app/plataforma/problemas/page.tsx`
- **3.5** Inventario y CMDB (consulta global) — `EXISTE`
  - Ruta: `/activos/inventario`
  - Archivos existentes: `src/app/plataforma/activos/inventario/page.tsx`
- **3.6** Eventos y resiliencia (consulta) — `EXISTE`
  - Ruta: `/operacion`
  - Archivos existentes: `src/app/plataforma/operacion/page.tsx`, `src/app/plataforma/operacion/eventos/page.tsx`, `src/app/plataforma/operacion/resiliencia/page.tsx`

### 4 Salud del sistema  `NUEVO`
Estado técnico del sistema para el Administrador.
- Ruta: `/admin/salud-sistema`
- Archivos por crear: `src/app/plataforma/admin/salud-sistema/page.tsx`, `src/app/api/admin/salud-sistema/route.ts`
- **4.1** Estado de la base de datos y servicios — `NUEVO`
  - Función: Conexión, latencia y detección de la base pausada.
  - Archivos existentes: `src/shared/lib/db.ts`
  - Archivos por crear: `src/modules/administracion/services/saludService.ts`
- **4.2** Tareas programadas — `NUEVO`
  - Función: Última ejecución y resultado de los jobs (recordatorios, escalamientos, alertas).
  - Archivos por crear: `src/app/api/admin/salud-sistema/tareas/route.ts`
- **4.3** Cola de correo y notificaciones — `NUEVO`
  - Función: Envíos pendientes, fallidos y reintento.
  - Archivos existentes: `src/shared/lib/email.ts`
  - Archivos por crear: `src/app/api/admin/salud-sistema/correo/route.ts`

### 5 Mi cuenta  `ADAPTAR`
Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.
- Ruta: `/mi-cuenta`
- Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`, `src/app/api/mi-cuenta/route.ts`
- **5.1** Mi perfil y seguridad — `EXISTE`
  - Ruta: `/mi-cuenta`
  - Función: Ver y editar datos permitidos, cambiar contraseña y ver sesiones.
  - Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`
- **5.2** Preferencias de notificación — `NUEVO`
  - Ruta: `/mi-cuenta/notificaciones`
  - Función: Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.
  - Archivos por crear: `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`, `src/app/api/mi-cuenta/notificaciones/route.ts`

---

## PERFIL 2 — Técnico

- **Rol:** Resolutor de primer, segundo y tercer nivel: atiende incidentes y solicitudes, registra problemas, implementa cambios y mantiene activos (Prompt 4).
- **Alcance de datos:** Tickets propios, de sus grupos resolutores y, en consulta, de su área técnica. Sin datos financieros ni claves.
- **Inicio:** `/tecnico/panel` · **Presentador de ticket:** VistaTicketOperador (existe)
- **Permisos de referencia:** Permisos del Prompt 4 (sección 8), restringidos por nivel de soporte N1/N2/N3.
- **Opciones:** 48 (existen 45, por adaptar 1, nuevas 2).

### 1 Mi trabajo  `EXISTE`
Espacio personal del técnico (Prompt 4, M1).
- Ruta: `/tecnico`
- Archivos existentes: `src/app/plataforma/tecnico/page.tsx`
- **1.1** Panel del técnico — `EXISTE`
  - Ruta: `/tecnico/panel`
  - Función: Qué atender ahora: indicadores, tickets urgentes, agenda, avisos y carga.
  - Archivos existentes: `src/app/plataforma/tecnico/panel/page.tsx`, `src/app/api/tecnico/contadores/route.ts`
  - **1.1.1** Indicadores y atender ahora — `EXISTE` — Asignados, sin asignar, por vencer, vencidos, en espera y resueltos hoy.
  - **1.1.2** Avisos y menciones — `EXISTE`
  - **1.1.3** Personalizar panel — `EXISTE` — Mostrar, ocultar y reordenar widgets.
- **1.2** Mis tareas — `EXISTE`
  - Ruta: `/tecnico/tareas`
  - Función: Tareas de tickets, problemas, cambios, mantenimientos y recordatorios personales.
  - Archivos existentes: `src/app/plataforma/tecnico/tareas/page.tsx`, `src/app/api/tecnico/recordatorios/route.ts`
- **1.3** Mi agenda y disponibilidad — `EXISTE`
  - Ruta: `/tecnico/agenda`
  - Función: Calendario personal y estado Disponible / Ocupado / No disponible.
  - Archivos existentes: `src/app/plataforma/tecnico/agenda/page.tsx`
- **1.4** Mi desempeño — `EXISTE`
  - Ruta: `/tecnico/desempeno`
  - Función: Indicadores propios y agregados del grupo.
  - Archivos existentes: `src/app/plataforma/tecnico/desempeno/page.tsx`

### 2 Mesa de Servicio  `EXISTE`
- Ruta: `/tecnico/mesa`
- **2.1** Mis tickets asignados — `EXISTE`
  - Ruta: `/tecnico/mesa/asignados`
  - Función: Cola personal con SLA y acciones rápidas.
  - Archivos existentes: `src/app/plataforma/tecnico/mesa/asignados/page.tsx`, `src/modules/tickets/components/TablaTickets.tsx`
  - **2.1.1** Detalle del ticket (vista Operador) — `EXISTE`
    - Ruta: `/tickets/[id]`
    - Función: Tomar, atender, esperar, escalar, resolver, vincular problema o RFC.
    - Archivos existentes: `src/app/plataforma/tickets/[id]/page.tsx`, `src/modules/tickets/ticket-detail/presentadores/VistaTicketOperador.tsx`, `src/modules/tickets/ticket-detail/secciones/BarraAccionesOperativas.tsx`, `src/modules/tickets/ticket-detail/secciones/CockpitTemporizadorSla.tsx`, `src/modules/tickets/ticket-detail/secciones/StreamChatPublico.tsx`, `src/modules/tickets/ticket-detail/secciones/StreamNotasInternas.tsx`, `src/modules/tickets/ticket-detail/secciones/PanelInfraestructuraCi.tsx`
- **2.2** Bandeja de pendientes — `EXISTE`
  - Ruta: `/tecnico/mesa/pendientes`
  - Función: Cola sin asignar de mis grupos; tomar de forma atómica.
  - Archivos existentes: `src/app/plataforma/tecnico/mesa/pendientes/page.tsx`, `src/app/api/tecnico/mesa/tomar/route.ts`
- **2.3** Tickets de mi área técnica — `EXISTE`
  - Ruta: `/tecnico/mesa/area`
  - Función: Consulta de todo el departamento de TI y ofrecer ayuda.
  - Archivos existentes: `src/app/plataforma/tecnico/mesa/area/page.tsx`
- **2.4** Registrar ticket para un usuario — `EXISTE`
  - Ruta: `/tecnico/mesa/registrar`
  - Función: Registro por teléfono, chat o presencial, con resolución en primer contacto.
  - Archivos existentes: `src/app/plataforma/tecnico/mesa/registrar/page.tsx`, `src/app/api/tecnico/usuarios/route.ts`
- **2.5** Búsqueda avanzada — `EXISTE`
  - Ruta: `/tecnico/mesa/buscar`
  - Archivos existentes: `src/app/plataforma/tecnico/mesa/buscar/page.tsx`
- **2.6** Historial de resueltos — `EXISTE`
  - Ruta: `/tecnico/mesa/historial`
  - Archivos existentes: `src/app/plataforma/tecnico/mesa/historial/page.tsx`
- **2.7** Incidente mayor (sala de crisis) — `NUEVO`
  - Ruta: `/tecnico/mesa/incidente-mayor`
  - Función: Vista de coordinación cuando el Supervisor declara un incidente mayor: línea de tiempo, tareas y comunicados.
  - Archivos por crear: `src/app/plataforma/tecnico/mesa/incidente-mayor/page.tsx`, `src/app/api/tecnico/incidente-mayor/route.ts`

### 3 Seguimiento de SLA  `EXISTE`
- Ruta: `/tecnico/sla`
- **3.1** Semáforo de SLA de mi cola — `EXISTE`
  - Ruta: `/tecnico/sla/semaforo`
  - Archivos existentes: `src/app/plataforma/tecnico/sla/semaforo/page.tsx`, `src/shared/lib/sla.ts`
- **3.2** Objetivos de tiempo vigentes — `EXISTE`
  - Ruta: `/tecnico/sla/objetivos`
  - Archivos existentes: `src/app/plataforma/tecnico/sla/objetivos/page.tsx`

### 4 Gestión de Problemas  `EXISTE`
- Ruta: `/tecnico/problemas`
- **4.1** Problemas asignados a mí — `EXISTE`
  - Ruta: `/tecnico/problemas/asignados`
  - Archivos existentes: `src/app/plataforma/tecnico/problemas/asignados/page.tsx`, `src/modules/problemas/components/ProblemasWorkspace.tsx`
- **4.2** Problemas de mi grupo — `EXISTE`
  - Ruta: `/tecnico/problemas/grupo`
  - Archivos existentes: `src/app/plataforma/tecnico/problemas/grupo/page.tsx`
- **4.3** Registrar problema — `EXISTE`
  - Ruta: `/tecnico/problemas/nuevo`
  - Archivos existentes: `src/app/plataforma/tecnico/problemas/nuevo/page.tsx`
- **4.4** Candidatos a problema — `EXISTE`
  - Ruta: `/tecnico/problemas/candidatos`
  - Archivos existentes: `src/app/plataforma/tecnico/problemas/candidatos/page.tsx`
- **4.5** Errores conocidos (KEDB) — `EXISTE`
  - Ruta: `/tecnico/problemas/errores-conocidos`
  - Archivos existentes: `src/app/plataforma/tecnico/problemas/errores-conocidos/page.tsx`

### 5 Gestión de Cambios  `EXISTE`
- Ruta: `/tecnico/cambios`
- **5.1** Mis cambios — `EXISTE`
  - Ruta: `/tecnico/cambios/mis-cambios`
  - Archivos existentes: `src/app/plataforma/tecnico/cambios/mis-cambios/page.tsx`
- **5.2** Registrar solicitud RFC — `EXISTE`
  - Ruta: `/tecnico/cambios/nuevo`
  - Archivos existentes: `src/app/plataforma/tecnico/cambios/nuevo/page.tsx`
- **5.3** Cambios por implementar — `EXISTE`
  - Ruta: `/tecnico/cambios/implementacion`
  - Función: Consola de implementación: Go/No-Go, bitácora, rollback y resultado.
  - Archivos existentes: `src/app/plataforma/tecnico/cambios/implementacion/page.tsx`
- **5.4** Calendario de cambios — `EXISTE`
  - Ruta: `/tecnico/cambios/calendario`
  - Archivos existentes: `src/app/plataforma/tecnico/cambios/calendario/page.tsx`
- **5.5** Cambios que afectan mis servicios — `EXISTE`
  - Ruta: `/tecnico/cambios/impacto`
  - Archivos existentes: `src/app/plataforma/tecnico/cambios/impacto/page.tsx`, `src/app/api/tecnico/cambios/enterado/route.ts`
- **5.6** Historial de cambios — `EXISTE`
  - Ruta: `/tecnico/cambios/historial`
  - Archivos existentes: `src/app/plataforma/tecnico/cambios/historial/page.tsx`

### 6 Activos y CMDB  `EXISTE`
- Ruta: `/tecnico/activos`
- **6.1** Inventario de activos — `EXISTE`
  - Ruta: `/tecnico/activos/inventario`
  - Archivos existentes: `src/app/plataforma/tecnico/activos/inventario/page.tsx`
- **6.2** Mapa de topología CMDB — `EXISTE`
  - Ruta: `/tecnico/activos/mapa`
  - Archivos existentes: `src/app/plataforma/tecnico/activos/mapa/page.tsx`
- **6.3** Mantenimiento y reparaciones — `EXISTE`
  - Ruta: `/tecnico/activos/mantenimiento`
  - Archivos existentes: `src/app/plataforma/tecnico/activos/mantenimiento/page.tsx`
- **6.4** Inventario físico en campo — `EXISTE`
  - Ruta: `/tecnico/activos/conteos`
  - Función: Conteo con escaneo desde teléfono.
  - Archivos existentes: `src/app/plataforma/tecnico/activos/conteos/page.tsx`
- **6.5** Licencias de software (consulta) — `EXISTE`
  - Ruta: `/tecnico/activos/licencias`
  - Archivos existentes: `src/app/plataforma/tecnico/activos/licencias/page.tsx`

### 7 Gestión del Conocimiento  `EXISTE`
- Ruta: `/tecnico/conocimiento`
- **7.1** Base de conocimiento — `EXISTE`
  - Ruta: `/tecnico/conocimiento/base`
  - Archivos existentes: `src/app/plataforma/tecnico/conocimiento/base/page.tsx`, `src/app/api/conocimiento/route.ts`, `src/app/api/conocimiento/[id]/route.ts`
- **7.2** Mis artículos — `EXISTE`
  - Ruta: `/tecnico/conocimiento/mis-articulos`
  - Archivos existentes: `src/app/plataforma/tecnico/conocimiento/mis-articulos/page.tsx`
- **7.3** Crear artículo — `EXISTE`
  - Ruta: `/tecnico/conocimiento/nuevo`
  - Archivos existentes: `src/app/plataforma/tecnico/conocimiento/nuevo/page.tsx`
- **7.4** Revisiones pendientes — `EXISTE`
  - Ruta: `/tecnico/conocimiento/revisiones`
  - Archivos existentes: `src/app/plataforma/tecnico/conocimiento/revisiones/page.tsx`

### 8 Catálogo de servicios (consulta)  `EXISTE`
- Ruta: `/tecnico/catalogo`
- Archivos existentes: `src/app/plataforma/tecnico/catalogo/page.tsx`

### 9 Mi cuenta  `ADAPTAR`
Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.
- Ruta: `/mi-cuenta`
- Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`, `src/app/api/mi-cuenta/route.ts`
- **9.1** Mi perfil y seguridad — `EXISTE`
  - Ruta: `/mi-cuenta`
  - Función: Ver y editar datos permitidos, cambiar contraseña y ver sesiones.
  - Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`
- **9.2** Preferencias de notificación — `NUEVO`
  - Ruta: `/mi-cuenta/notificaciones`
  - Función: Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.
  - Archivos por crear: `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`, `src/app/api/mi-cuenta/notificaciones/route.ts`

---

## PERFIL 3 — Solicitante

- **Rol:** Usuario final: reporta incidentes, pide servicios, consulta conocimiento y custodia activos.
- **Alcance de datos:** Solo sus tickets y los activos que tiene en custodia.
- **Inicio:** `/tickets` · **Presentador de ticket:** VistaTicketConsumidor (existe)
- **Permisos de referencia:** Crear y ver tickets propios; aceptar actas; calificar la atención.
- **Opciones:** 24 (existen 9, por adaptar 5, nuevas 10).

### 1 Mesa de Servicio  `EXISTE`
Autoservicio: crear tickets y seguir los propios.
- Ruta: `/tickets`
- Archivos existentes: `src/app/plataforma/tickets/page.tsx`
- **1.1** Crear ticket — `ADAPTAR`
  - Ruta: `/tickets/catalogo`
  - Función: Elegir el servicio en el catálogo y completar el formulario dinámico de incidente o solicitud.
  - Archivos existentes: `src/app/plataforma/tickets/catalogo/page.tsx`, `src/app/plataforma/incidentes/page.tsx`, `src/app/plataforma/solicitudes/page.tsx`, `src/app/api/incidentes/route.ts`, `src/app/api/solicitudes/route.ts`, `src/app/api/tickets/catalogos/route.ts`
  - **1.1.1** Formulario dinámico con texto guía — `EXISTE`
    - Archivos existentes: `src/shared/lib/validaciones.ts`
  - **1.1.2** Adjuntar evidencias — `EXISTE`
  - **1.1.3** Sugerencia de artículos antes de enviar — `NUEVO`
    - Función: Deflexión: muestra artículos públicos relacionados al escribir el título.
    - Archivos por crear: `src/app/api/conocimiento/sugerencias/route.ts`
- **1.2** Mis tickets — `EXISTE`
  - Ruta: `/tickets`
  - Función: Lista de los propios con estado y tiempo restante.
  - Archivos existentes: `src/app/plataforma/tickets/page.tsx`, `src/modules/tickets/components/TablaTickets.tsx`, `src/modules/tickets/components/ModalDetalleTicket.tsx`, `src/app/api/tickets/route.ts`, `src/app/api/tickets/[id]/route.ts`
  - **1.2.1** Detalle y seguimiento — `EXISTE`
    - Ruta: `/tickets/[id]`
    - Función: Progreso por etapas y datos que el solicitante puede ver.
    - Archivos existentes: `src/app/plataforma/tickets/[id]/page.tsx`, `src/modules/tickets/ticket-detail/presentadores/VistaTicketConsumidor.tsx`, `src/modules/tickets/ticket-detail/secciones/StepperProgresoConsumidor.tsx`
  - **1.2.2** Comunicación con el técnico — `EXISTE`
    - Archivos existentes: `src/modules/tickets/ticket-detail/secciones/StreamChatPublico.tsx`, `src/app/api/tickets/[id]/comentarios/route.ts`
  - **1.2.3** Calificar la atención — `EXISTE`
    - Archivos existentes: `src/modules/tickets/ticket-detail/secciones/TarjetaCalificacionCsat.tsx`
  - **1.2.4** Reabrir o cancelar — `ADAPTAR` — Dentro de la ventana permitida y con motivo.

### 2 Catálogo de Servicios  `EXISTE`
- Ruta: `/tickets/catalogo`
- **2.1** Catálogo de incidentes — `ADAPTAR`
  - Ruta: `/tickets/catalogo?tipo=incidente`
  - Función: Categorías y servicios para reportar fallas; sin botones superiores que repitan el menú.
  - Archivos existentes: `src/app/plataforma/tickets/catalogo/page.tsx`, `src/app/api/servicios/route.ts`
- **2.2** Catálogo de solicitudes de servicio — `ADAPTAR`
  - Ruta: `/tickets/catalogo?tipo=solicitud`
  - Función: Categorías y servicios para pedir requerimientos; muestra si requiere aprobación.
  - Archivos existentes: `src/app/plataforma/tickets/catalogo/page.tsx`

### 3 Gestión de Conocimiento  `NUEVO`
Guías de autoayuda: solo artículos públicos publicados.
- Ruta: `/conocimiento`
- Archivos existentes: `src/app/api/conocimiento/route.ts`, `src/app/api/conocimiento/[id]/route.ts`
- Archivos por crear: `src/app/plataforma/conocimiento/page.tsx`, `src/app/plataforma/conocimiento/[id]/page.tsx`
- **3.1** Buscar y leer artículos — `NUEVO`
  - Ruta: `/conocimiento`
  - Función: Buscador por texto, categoría y servicio.
  - Archivos por crear: `src/modules/conocimiento/services/conocimientoService.ts`
- **3.2** Valorar la utilidad — `NUEVO`
  - Archivos por crear: `src/app/api/conocimiento/[id]/feedback/route.ts`

### 4 Mis activos  `NUEVO`
Activos que el usuario tiene en custodia.
- Ruta: `/activos/mis-activos`
- Archivos por crear: `src/app/plataforma/activos/mis-activos/page.tsx`, `src/app/api/activos/mis-activos/route.ts`
- **4.1** Activos bajo mi custodia — `NUEVO` — Lista con estado, ubicación y garantía.
- **4.2** Aceptar actas de entrega y devolución — `NUEVO`
  - Función: Aceptación digital de la política de uso.
  - Archivos por crear: `src/app/api/activos/mis-activos/aceptar/route.ts`
- **4.3** Reportar un problema con un activo — `NUEVO` — Crea un incidente con el CI preseleccionado.

### 5 Avisos de servicio  `NUEVO`
Mantenimientos programados con interrupción que afectan a mi área, tomados del calendario de cambios.
- Ruta: `/avisos/mantenimientos`
- Archivos por crear: `src/app/plataforma/avisos/mantenimientos/page.tsx`, `src/app/api/avisos/mantenimientos/route.ts`

### 6 Mi cuenta  `ADAPTAR`
Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.
- Ruta: `/mi-cuenta`
- Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`, `src/app/api/mi-cuenta/route.ts`
- **6.1** Mi perfil y seguridad — `EXISTE`
  - Ruta: `/mi-cuenta`
  - Función: Ver y editar datos permitidos, cambiar contraseña y ver sesiones.
  - Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`
- **6.2** Preferencias de notificación — `NUEVO`
  - Ruta: `/mi-cuenta/notificaciones`
  - Función: Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.
  - Archivos por crear: `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`, `src/app/api/mi-cuenta/notificaciones/route.ts`

---

## PERFIL 4 — Supervisor

- **Rol:** Jefatura de las áreas técnicas de TI: despacha, monitorea al equipo, vigila el SLA, declara incidentes mayores y aprueba lo técnico.
- **Alcance de datos:** Todos los tickets, problemas y cambios de su área técnica y su equipo.
- **Inicio:** `/supervisor/panel` · **Presentador de ticket:** VistaTicketSupervisor (existe)
- **Permisos de referencia:** `tickets.reasignar`, `tickets.vistas_compartidas`, aprobación técnica de RFC y de bajas de activos.
- **Opciones:** 56 (existen 27, por adaptar 6, nuevas 23).

### 1 Panel de supervisión  `NUEVO`
Página de inicio del supervisor: estado del equipo en un vistazo.
- Ruta: `/supervisor/panel`
- Archivos existentes: `src/app/plataforma/dashboard/page.tsx`
- Archivos por crear: `src/app/plataforma/supervisor/panel/page.tsx`, `src/app/api/supervisor/panel/route.ts`, `src/modules/supervisor/services/supervisionService.ts`
- **1.1** Indicadores del equipo — `NUEVO` — SLA del grupo, backlog, sin asignar, vencidos, escalados, CSAT y reabiertos.
- **1.2** Alertas y riesgos — `NUEVO` — Incidentes mayores, P1/P2 sin asignar, técnicos sobrecargados y aprobaciones vencidas.
- **1.3** Accesos rápidos — `NUEVO` — Asignar, ver monitoreo, declarar incidente mayor.

### 2 Supervisión y despacho  `EXISTE`
- Ruta: `/tickets/gestion`
- Archivos existentes: `src/app/plataforma/tickets/gestion/page.tsx`
- **2.1** Centro de asignación — `EXISTE`
  - Ruta: `/tickets/gestion/asignar`
  - Función: Asignar y reasignar tickets del área técnica.
  - Archivos existentes: `src/app/plataforma/tickets/gestion/asignar/page.tsx`, `src/modules/tickets/ticket-detail/secciones/ControlesDespacho.tsx`
  - **2.1.1** Cola sin asignar — `EXISTE`
  - **2.1.2** Asignación manual y masiva — `ADAPTAR` — Selección múltiple con motivo y notificación al técnico.
  - **2.1.3** Reasignación forzada con motivo — `EXISTE`
  - **2.1.4** Consulta de reglas de asignación automática — `ADAPTAR` — Solo lectura con enlace a la configuración.
- **2.2** Monitoreo de técnicos — `EXISTE`
  - Ruta: `/tickets/gestion/tecnicos`
  - Función: Carga, disponibilidad y desempeño del equipo.
  - Archivos existentes: `src/app/plataforma/tickets/gestion/tecnicos/page.tsx`, `src/app/api/tecnicos/route.ts`
  - **2.2.1** Carga y disponibilidad — `EXISTE`
  - **2.2.2** Ausencias y guardias del equipo — `NUEVO`
    - Ruta: `/supervisor/equipo/ausencias`
    - Función: Registrar y editar ausencias de mi equipo; las usa la asignación automática.
    - Archivos existentes: `src/app/api/admin/tecnicos/ausencias/route.ts`
    - Archivos por crear: `src/app/plataforma/supervisor/equipo/ausencias/page.tsx`, `src/app/api/supervisor/ausencias/route.ts`
- **2.3** Todos los tickets de mi área técnica — `EXISTE`
  - Ruta: `/tickets/gestion/todos`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/todos/page.tsx`, `src/modules/tickets/ticket-detail/presentadores/VistaTicketSupervisor.tsx`
- **2.4** Escalamientos y riesgos de SLA — `NUEVO`
  - Ruta: `/supervisor/sla/escalamientos`
  - Función: Tickets escalados jerárquicamente y en riesgo; permite intervenir.
  - Archivos existentes: `src/shared/lib/sla.ts`
  - Archivos por crear: `src/app/plataforma/supervisor/sla/escalamientos/page.tsx`, `src/app/api/supervisor/sla/escalamientos/route.ts`
- **2.5** Incidentes mayores — `NUEVO`
  - Ruta: `/supervisor/incidentes-mayores`
  - Función: Declarar, coordinar, comunicar y cerrar incidentes mayores.
  - Archivos por crear: `src/app/plataforma/supervisor/incidentes-mayores/page.tsx`, `src/app/api/supervisor/incidentes-mayores/route.ts`, `src/modules/incidentes/services/incidentesMayoresService.ts`

### 3 Gestión de tickets  `EXISTE`
- Ruta: `/tickets/gestion`
- **3.1** Incidentes — `EXISTE`
  - Ruta: `/tickets/gestion/incidentes`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/incidentes/page.tsx`
- **3.2** Solicitudes de servicio — `EXISTE`
  - Ruta: `/tickets/gestion/solicitudes`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/solicitudes/page.tsx`
- **3.3** Mis tickets — `EXISTE`
  - Ruta: `/tickets/gestion/mios`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/mios/page.tsx`
- **3.4** Asignados — `EXISTE`
  - Ruta: `/tickets/gestion/asignados`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/asignados/page.tsx`
- **3.5** Bandeja de pendientes — `EXISTE`
  - Ruta: `/tickets/gestion/bandeja`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/bandeja/page.tsx`
- **3.6** Historial de resueltos — `EXISTE`
  - Ruta: `/tickets/gestion/resueltos`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/resueltos/page.tsx`
- **3.7** Registrar ticket para un usuario — `EXISTE`
  - Ruta: `/tickets/gestion/crear`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/crear/page.tsx`
- **3.8** Auditoría de mi área — `ADAPTAR`
  - Ruta: `/tickets/gestion/auditoria`
  - Función: Línea de tiempo de tickets limitada a mi área.
  - Archivos existentes: `src/app/plataforma/tickets/gestion/auditoria/page.tsx`

### 4 Seguimiento de SLA  `NUEVO`
- Ruta: `/supervisor/sla`
- **4.1** Semáforo de SLA del grupo — `NUEVO`
  - Ruta: `/supervisor/sla/semaforo`
  - Función: Misma vista que el técnico con alcance de todo el grupo.
  - Archivos existentes: `src/app/plataforma/tecnico/sla/semaforo/page.tsx`
  - Archivos por crear: `src/app/plataforma/supervisor/sla/semaforo/page.tsx`
- **4.2** Objetivos de tiempo vigentes — `ADAPTAR`
  - Ruta: `/tecnico/sla/objetivos`
  - Función: Se reutiliza en modo consulta.
  - Archivos existentes: `src/app/plataforma/tecnico/sla/objetivos/page.tsx`
- **4.3** Incumplimientos y causas — `NUEVO`
  - Ruta: `/supervisor/sla/incumplimientos`
  - Función: Análisis de tickets vencidos por servicio, técnico y causa.
  - Archivos por crear: `src/app/plataforma/supervisor/sla/incumplimientos/page.tsx`, `src/app/api/supervisor/sla/incumplimientos/route.ts`

### 5 Gestión de Problemas  `EXISTE`
- Ruta: `/problemas`
- **5.1** Registro de problemas — `EXISTE`
  - Ruta: `/problemas`
  - Archivos existentes: `src/app/plataforma/problemas/page.tsx`, `src/modules/problemas/components/ProblemasWorkspace.tsx`, `src/app/api/problemas/route.ts`, `src/app/api/problemas/[id]/route.ts`
- **5.2** Asignación de problemas — `NUEVO`
  - Ruta: `/supervisor/problemas/asignar`
  - Función: Reparte problemas sin responsable mientras no exista el Gestor de Problemas.
  - Archivos por crear: `src/app/plataforma/supervisor/problemas/asignar/page.tsx`
- **5.3** Errores conocidos — `EXISTE`
  - Ruta: `/problemas/kedb`
  - Archivos existentes: `src/app/plataforma/problemas/kedb/page.tsx`

### 6 Gestión de Cambios  `EXISTE`
- Ruta: `/cambios/gestion`
- **6.1** Aprobaciones técnicas de RFC — `NUEVO`
  - Ruta: `/supervisor/cambios/aprobaciones`
  - Función: Etapa Técnica de las RFC del grupo implementador; segregación de funciones.
  - Archivos existentes: `src/modules/tickets/ticket-detail/secciones/TarjetaAprobacionSod.tsx`
  - Archivos por crear: `src/app/plataforma/supervisor/cambios/aprobaciones/page.tsx`, `src/app/api/supervisor/cambios/aprobaciones/route.ts`
- **6.2** Calendario de cambios — `EXISTE`
  - Ruta: `/cambios/gestion/calendario`
  - Archivos existentes: `src/app/plataforma/cambios/gestion/calendario/page.tsx`
- **6.3** Cambios que afectan a mi equipo — `NUEVO`
  - Ruta: `/supervisor/cambios/impacto`
  - Función: Misma lógica del técnico con alcance de grupo.
  - Archivos existentes: `src/app/plataforma/tecnico/cambios/impacto/page.tsx`
  - Archivos por crear: `src/app/plataforma/supervisor/cambios/impacto/page.tsx`
- **6.4** Programación de implementaciones del equipo — `NUEVO`
  - Ruta: `/supervisor/cambios/programar`
  - Función: Programar y reprogramar dentro de ventanas permitidas.
  - Archivos por crear: `src/app/plataforma/supervisor/cambios/programar/page.tsx`

### 7 Activos  `EXISTE`
- Ruta: `/activos`
- **7.1** Inventario (consulta) — `EXISTE`
  - Ruta: `/activos/inventario`
  - Archivos existentes: `src/app/plataforma/activos/inventario/page.tsx`
- **7.2** Aprobación de bajas de mi área — `NUEVO`
  - Ruta: `/supervisor/activos/bajas`
  - Función: Aprueba o rechaza bajas solicitadas por técnicos.
  - Archivos por crear: `src/app/plataforma/supervisor/activos/bajas/page.tsx`, `src/app/api/supervisor/activos/bajas/route.ts`
- **7.3** Licencias (consulta) — `EXISTE`
  - Ruta: `/activos/licencias`
  - Archivos existentes: `src/app/plataforma/activos/licencias/page.tsx`

### 8 Gestión del Conocimiento  `NUEVO`
- Ruta: `/conocimiento`
- **8.1** Base de conocimiento — `NUEVO`
  - Ruta: `/conocimiento`
  - Archivos por crear: `src/app/plataforma/conocimiento/page.tsx`
- **8.2** Revisión y publicación de artículos — `NUEVO`
  - Ruta: `/supervisor/conocimiento/revisiones`
  - Función: Revisa artículos del equipo cuando es revisor de la categoría.
  - Archivos existentes: `src/app/plataforma/tecnico/conocimiento/revisiones/page.tsx`
  - Archivos por crear: `src/app/plataforma/supervisor/conocimiento/revisiones/page.tsx`

### 9 Reportes del equipo  `NUEVO`
- Ruta: `/supervisor/reportes`
- **9.1** Indicadores operativos y SLA — `ADAPTAR`
  - Ruta: `/tickets/reportes`
  - Función: Con alcance de mi área técnica.
  - Archivos existentes: `src/app/plataforma/tickets/reportes/page.tsx`, `src/app/api/reportes/indicadores/route.ts`
- **9.2** Productividad individual — `NUEVO`
  - Ruta: `/supervisor/reportes/productividad`
  - Función: Resueltos, tiempos, reabiertos y satisfacción por técnico (uso de gestión, no punitivo).
  - Archivos por crear: `src/app/plataforma/supervisor/reportes/productividad/page.tsx`, `src/app/api/supervisor/reportes/productividad/route.ts`

### 10 Mi equipo  `NUEVO`
- Ruta: `/supervisor/equipo`
- **10.1** Vistas y respuestas compartidas — `NUEVO`
  - Ruta: `/supervisor/equipo/vistas`
  - Función: Vistas guardadas y respuestas predefinidas del grupo.
  - Archivos por crear: `src/app/plataforma/supervisor/equipo/vistas/page.tsx`, `src/app/api/supervisor/equipo/vistas/route.ts`

### 11 Operación de servicios  `EXISTE`
- Ruta: `/operacion`
- Archivos existentes: `src/app/plataforma/operacion/page.tsx`
- **11.1** Eventos y alertas — `EXISTE`
  - Ruta: `/operacion/eventos`
  - Función: Eventos de monitoreo; permite convertir un evento en incidente.
  - Archivos existentes: `src/app/plataforma/operacion/eventos/page.tsx`, `src/app/api/operacion/eventos/route.ts`, `src/app/api/operacion/eventos/[id]/route.ts`
- **11.2** Disponibilidad, capacidad y continuidad — `EXISTE`
  - Ruta: `/operacion/resiliencia`
  - Función: Indicadores de resiliencia de los servicios del área.
  - Archivos existentes: `src/app/plataforma/operacion/resiliencia/page.tsx`, `src/app/api/operacion/resiliencia/route.ts`

### 12 Mi cuenta  `ADAPTAR`
Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.
- Ruta: `/mi-cuenta`
- Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`, `src/app/api/mi-cuenta/route.ts`
- **12.1** Mi perfil y seguridad — `EXISTE`
  - Ruta: `/mi-cuenta`
  - Función: Ver y editar datos permitidos, cambiar contraseña y ver sesiones.
  - Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`
- **12.2** Preferencias de notificación — `NUEVO`
  - Ruta: `/mi-cuenta/notificaciones`
  - Función: Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.
  - Archivos por crear: `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`, `src/app/api/mi-cuenta/notificaciones/route.ts`

---

## PERFIL 5 — Gestor de Área

- **Rol:** Jefe de un área de negocio que no es de TI (finanzas, legal, ventas, marketing): aprueba solicitudes de su gente, conoce cambios que lo afectan y pide servicios para su área.
- **Alcance de datos:** Tickets, colaboradores, activos y contratos de su departamento.
- **Inicio:** `/gestor-area/panel` · **Presentador de ticket:** VistaTicketGobernanza (existe) y PresentadorGestorArea (nuevo)
- **Permisos de referencia:** Aprobación de solicitudes y etapa Negocio de las RFC; creación de RFC Normales.
- **Opciones:** 29 (existen 11, por adaptar 3, nuevas 15).

### 1 Panel del área  `NUEVO`
Inicio del jefe de área (no TI).
- Ruta: `/gestor-area/panel`
- Archivos existentes: `src/app/plataforma/dashboard/page.tsx`
- Archivos por crear: `src/app/plataforma/gestor-area/panel/page.tsx`, `src/app/api/gestor-area/panel/route.ts`, `src/modules/gestor-area/services/areaService.ts`
- **1.1** Aprobaciones pendientes y vencidas — `NUEVO`
- **1.2** Tickets del área por estado y SLA — `NUEVO`
- **1.3** Cambios próximos que afectan a mi área — `NUEVO`

### 2 Mesa de servicio del área  `EXISTE`
- Ruta: `/tickets/gestion`
- **2.1** Registrar ticket para el área — `EXISTE`
  - Ruta: `/tickets/gestion/crear`
  - Función: Crear tickets a nombre de un colaborador de su departamento.
  - Archivos existentes: `src/app/plataforma/tickets/gestion/crear/page.tsx`
- **2.2** Tickets de mi departamento — `EXISTE`
  - Ruta: `/tickets/gestion/departamento`
  - Función: Solo los del departamento; vista de Gobernanza sin acciones técnicas.
  - Archivos existentes: `src/app/plataforma/tickets/gestion/departamento/page.tsx`
  - **2.2.1** Detalle del ticket (vista Gobernanza) — `EXISTE`
    - Ruta: `/tickets/[id]`
    - Función: Presentador propio del jefe de área con contexto de departamento.
    - Archivos existentes: `src/modules/tickets/ticket-detail/presentadores/VistaTicketGobernanza.tsx`
    - Archivos por crear: `src/modules/tickets/presentadores/PresentadorGestorArea.tsx`
- **2.3** Colaboradores de mi área — `EXISTE`
  - Ruta: `/tickets/gestion/colaboradores`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/colaboradores/page.tsx`, `src/app/api/area/colaboradores/route.ts`
  - **2.3.1** Tickets por colaborador — `ADAPTAR`
  - **2.3.2** Autorizar servicios restringidos a colaboradores — `NUEVO`
    - Archivos por crear: `src/app/api/area/colaboradores/autorizaciones/route.ts`

### 3 Aprobaciones  `EXISTE`
- Ruta: `/tickets/gestion/aprobaciones`
- **3.1** Mis aprobaciones de solicitudes — `EXISTE`
  - Ruta: `/tickets/gestion/aprobaciones`
  - Función: Solicitudes que requieren aprobación de jefatura.
  - Archivos existentes: `src/app/plataforma/tickets/gestion/aprobaciones/page.tsx`, `src/modules/tickets/ticket-detail/secciones/TarjetaAprobacionSod.tsx`
- **3.2** Aprobación de negocio de cambios — `NUEVO`
  - Ruta: `/gestor-area/cambios/aprobaciones`
  - Función: Etapa Negocio de las RFC que afectan a mi departamento.
  - Archivos por crear: `src/app/plataforma/gestor-area/cambios/aprobaciones/page.tsx`, `src/app/api/gestor-area/cambios/aprobaciones/route.ts`
- **3.3** Historial de mis decisiones — `NUEVO`
  - Ruta: `/gestor-area/aprobaciones/historial`
  - Archivos por crear: `src/app/plataforma/gestor-area/aprobaciones/historial/page.tsx`
- **3.4** Delegación de aprobaciones — `NUEVO`
  - Ruta: `/gestor-area/aprobaciones/delegacion`
  - Función: Delegar por ausencia a un suplente del área.
  - Archivos por crear: `src/app/plataforma/gestor-area/aprobaciones/delegacion/page.tsx`, `src/app/api/gestor-area/aprobaciones/delegacion/route.ts`

### 4 Catálogo de servicios (consulta)  `EXISTE`
- Ruta: `/tickets/catalogo`
- Archivos existentes: `src/app/plataforma/tickets/catalogo/page.tsx`

### 5 Cambios que afectan a mi área  `EXISTE`
- Ruta: `/cambios/gestion`
- **5.1** Calendario de mantenimientos — `EXISTE`
  - Ruta: `/cambios/gestion/calendario`
  - Archivos existentes: `src/app/plataforma/cambios/gestion/calendario/page.tsx`
- **5.2** Cambios con interrupción para mi área — `NUEVO`
  - Ruta: `/gestor-area/cambios/impacto`
  - Archivos por crear: `src/app/plataforma/gestor-area/cambios/impacto/page.tsx`, `src/app/api/gestor-area/cambios/impacto/route.ts`
- **5.3** Solicitar un cambio de negocio — `ADAPTAR`
  - Ruta: `/cambios/gestion/crear`
  - Función: Solo tipo Normal.
  - Archivos existentes: `src/app/plataforma/cambios/gestion/crear/page.tsx`

### 6 Activos y contratos del área  `NUEVO`
- Ruta: `/gestor-area/activos`
- **6.1** Activos de mi área — `NUEVO`
  - Ruta: `/gestor-area/activos`
  - Función: Lectura de activos por colaborador, sin datos financieros sensibles.
  - Archivos por crear: `src/app/plataforma/gestor-area/activos/page.tsx`, `src/app/api/gestor-area/activos/route.ts`
- **6.2** Licencias y contratos de mi departamento — `NUEVO`
  - Ruta: `/gestor-area/contratos`
  - Archivos por crear: `src/app/plataforma/gestor-area/contratos/page.tsx`, `src/app/api/gestor-area/contratos/route.ts`

### 7 Reportes del área  `NUEVO`
Tickets por servicio, SLA percibido, satisfacción y costo referencial consumido.
- Ruta: `/gestor-area/reportes`
- Archivos por crear: `src/app/plataforma/gestor-area/reportes/page.tsx`, `src/app/api/gestor-area/reportes/route.ts`

### 8 Gestión de Conocimiento  `NUEVO`
- Ruta: `/conocimiento`
- Archivos por crear: `src/app/plataforma/conocimiento/page.tsx`

### 9 Mi cuenta  `ADAPTAR`
Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.
- Ruta: `/mi-cuenta`
- Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`, `src/app/api/mi-cuenta/route.ts`
- **9.1** Mi perfil y seguridad — `EXISTE`
  - Ruta: `/mi-cuenta`
  - Función: Ver y editar datos permitidos, cambiar contraseña y ver sesiones.
  - Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`
- **9.2** Preferencias de notificación — `NUEVO`
  - Ruta: `/mi-cuenta/notificaciones`
  - Función: Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.
  - Archivos por crear: `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`, `src/app/api/mi-cuenta/notificaciones/route.ts`

---

## PERFIL 6 — Auditor

- **Rol:** Verifica el cumplimiento: trazabilidad, segregación de funciones, cambios autorizados, licencias y calidad de la CMDB. No modifica nada.
- **Alcance de datos:** Lectura transversal de toda la operación y de la auditoría del sistema.
- **Inicio:** `/auditor/panel` · **Presentador de ticket:** VistaTicketGobernanza (existe) y PresentadorAuditor (nuevo, solo lectura)
- **Permisos de referencia:** Permisos `*.auditoria.ver` y `*.ver` en solo lectura.
- **Opciones:** 30 (existen 3, por adaptar 13, nuevas 14).

### 1 Panel de auditoría  `NUEVO`
Hallazgos, cumplimiento y muestras pendientes (solo lectura).
- Ruta: `/auditor/panel`
- Archivos existentes: `src/app/plataforma/dashboard/page.tsx`
- Archivos por crear: `src/app/plataforma/auditor/panel/page.tsx`, `src/app/api/auditor/panel/route.ts`, `src/modules/auditor/services/auditoriaService.ts`

### 2 Auditoría de tickets  `EXISTE`
- Ruta: `/tickets/gestion`
- **2.1** Todos los tickets (solo lectura) — `ADAPTAR`
  - Ruta: `/tickets/gestion/todos`
  - Función: Presentador sin acciones, con línea de tiempo y evidencias.
  - Archivos existentes: `src/app/plataforma/tickets/gestion/todos/page.tsx`, `src/modules/tickets/ticket-detail/presentadores/VistaTicketGobernanza.tsx`
  - Archivos por crear: `src/modules/tickets/presentadores/PresentadorAuditor.tsx`
- **2.2** Auditoría forense — `EXISTE`
  - Ruta: `/tickets/gestion/auditoria`
  - Función: Línea de tiempo inmutable por ticket, usuario, CI o fecha.
  - Archivos existentes: `src/app/plataforma/tickets/gestion/auditoria/page.tsx`
  - **2.2.1** Exportar evidencia firmada — `NUEVO`
    - Función: PDF o CSV con huella (hash) y fecha de exportación.
    - Archivos por crear: `src/app/api/auditor/evidencia/route.ts`
- **2.3** Segregación de funciones — `NUEVO`
  - Ruta: `/auditor/cumplimiento/sod`
  - Función: Detecta aprobaciones del mismo usuario, autoaprobaciones y excepciones.
  - Archivos existentes: `src/modules/tickets/ticket-detail/secciones/TarjetaAprobacionSod.tsx`
  - Archivos por crear: `src/app/plataforma/auditor/cumplimiento/sod/page.tsx`, `src/app/api/auditor/cumplimiento/sod/route.ts`
- **2.4** Muestreo de auditoría — `NUEVO`
  - Ruta: `/auditor/muestreo`
  - Función: Selecciona muestras aleatorias de tickets, cambios y bajas para revisión.
  - Archivos por crear: `src/app/plataforma/auditor/muestreo/page.tsx`, `src/app/api/auditor/muestreo/route.ts`

### 3 Auditoría del sistema  `NUEVO`
- Ruta: `/auditor/sistema`
- **3.1** Auditoría de cambios de configuración — `ADAPTAR`
  - Ruta: `/admin/auditoria-sistema`
  - Función: Autorizar al perfil Auditor en solo lectura.
  - Archivos existentes: `src/app/plataforma/admin/auditoria-sistema/page.tsx`
- **3.2** Registros de seguridad y autenticación — `ADAPTAR`
  - Ruta: `/admin/seguridad-logs`
  - Función: Solo lectura.
  - Archivos existentes: `src/app/plataforma/admin/seguridad-logs/page.tsx`
- **3.3** Retención y mantenimiento de datos — `ADAPTAR`
  - Ruta: `/admin/mantenimiento-datos`
  - Función: Solo lectura.
  - Archivos existentes: `src/app/plataforma/admin/mantenimiento-datos/page.tsx`
- **3.4** Perfiles y permisos (lectura) — `ADAPTAR`
  - Ruta: `/admin/perfiles`
  - Función: Solo lectura.
  - Archivos existentes: `src/app/plataforma/admin/perfiles/page.tsx`
- **3.5** Recertificación de accesos — `NUEVO`
  - Ruta: `/auditor/accesos/recertificacion`
  - Función: Revisión periódica de usuarios y perfiles con confirmación o retiro.
  - Archivos por crear: `src/app/plataforma/auditor/accesos/recertificacion/page.tsx`, `src/app/api/auditor/accesos/recertificacion/route.ts`

### 4 Cumplimiento de procesos  `NUEVO`
- Ruta: `/auditor/cumplimiento`
- **4.1** Cambios: historial, emergencias y revisiones — `ADAPTAR`
  - Ruta: `/cambios/gestion/todos`
  - Archivos existentes: `src/app/plataforma/cambios/gestion/todos/page.tsx`
- **4.2** Cambios sin autorización o fuera de ventana — `NUEVO`
  - Ruta: `/auditor/cumplimiento/cambios`
  - Archivos por crear: `src/app/plataforma/auditor/cumplimiento/cambios/page.tsx`, `src/app/api/auditor/cumplimiento/cambios/route.ts`
- **4.3** Problemas y errores conocidos — `ADAPTAR`
  - Ruta: `/problemas`
  - Archivos existentes: `src/app/plataforma/problemas/page.tsx`, `src/app/plataforma/problemas/kedb/page.tsx`
- **4.4** Cumplimiento de SLA — `ADAPTAR`
  - Ruta: `/tickets/reportes`
  - Archivos existentes: `src/app/plataforma/tickets/reportes/page.tsx`

### 5 Activos y licencias  `NUEVO`
- Ruta: `/auditor/activos`
- **5.1** Inventario (lectura) — `ADAPTAR`
  - Ruta: `/activos/inventario`
  - Archivos existentes: `src/app/plataforma/activos/inventario/page.tsx`
- **5.2** Cumplimiento de licencias — `ADAPTAR`
  - Ruta: `/activos/licencias`
  - Archivos existentes: `src/app/plataforma/activos/licencias/page.tsx`
- **5.3** Resultados de auditorías de CMDB — `NUEVO`
  - Ruta: `/auditor/cmdb/resultados`
  - Archivos por crear: `src/app/plataforma/auditor/cmdb/resultados/page.tsx`, `src/app/api/auditor/cmdb/resultados/route.ts`
- **5.4** Bajas y disposición — `NUEVO`
  - Ruta: `/auditor/activos/bajas`
  - Función: Actas de baja, borrado seguro y destino final.
  - Archivos por crear: `src/app/plataforma/auditor/activos/bajas/page.tsx`, `src/app/api/auditor/activos/bajas/route.ts`

### 6 Reportes y evidencias  `NUEVO`
- Ruta: `/auditor/informes`
- **6.1** Indicadores operativos y SLA — `ADAPTAR`
  - Ruta: `/tickets/reportes`
  - Archivos existentes: `src/app/plataforma/tickets/reportes/page.tsx`
- **6.2** Tableros (lectura) — `ADAPTAR`
  - Ruta: `/admin/reportes-disenador`
  - Archivos existentes: `src/app/plataforma/admin/reportes-disenador/page.tsx`
- **6.3** Informes de auditoría — `NUEVO`
  - Ruta: `/auditor/informes`
  - Función: Hallazgos, recomendaciones y seguimiento.
  - Archivos por crear: `src/app/plataforma/auditor/informes/page.tsx`, `src/app/api/auditor/informes/route.ts`

### 7 Mi cuenta  `ADAPTAR`
Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.
- Ruta: `/mi-cuenta`
- Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`, `src/app/api/mi-cuenta/route.ts`
- **7.1** Mi perfil y seguridad — `EXISTE`
  - Ruta: `/mi-cuenta`
  - Función: Ver y editar datos permitidos, cambiar contraseña y ver sesiones.
  - Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`
- **7.2** Preferencias de notificación — `NUEVO`
  - Ruta: `/mi-cuenta/notificaciones`
  - Función: Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.
  - Archivos por crear: `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`, `src/app/api/mi-cuenta/notificaciones/route.ts`

---

## PERFIL 7 — Aprobador

- **Rol:** Persona facultada por el CAB para autorizar cambios y otras decisiones por monto o riesgo.
- **Alcance de datos:** Solo lo que debe decidir y el historial de sus decisiones.
- **Inicio:** `/aprobador/panel` · **Presentador de ticket:** VistaTicketGobernanza (existe) y PresentadorAprobador (nuevo)
- **Permisos de referencia:** `cambios.aprobar`, `cambios.dictaminar_cab`, `problemas.aprobar`, `contratos.aprobar_renovacion`.
- **Opciones:** 19 (existen 4, por adaptar 3, nuevas 12).

### 1 Panel del aprobador  `NUEVO`
Pendientes por vencer, reuniones del comité y decisiones recientes.
- Ruta: `/aprobador/panel`
- Archivos existentes: `src/app/plataforma/dashboard/page.tsx`
- Archivos por crear: `src/app/plataforma/aprobador/panel/page.tsx`, `src/app/api/aprobador/panel/route.ts`, `src/modules/cambios/services/aprobacionesService.ts`

### 2 Aprobaciones pendientes  `NUEVO`
- Ruta: `/aprobador/aprobaciones`
- **2.1** Aprobaciones de cambios — `NUEVO`
  - Ruta: `/aprobador/cambios`
  - Función: Etapas Dirección y excepciones: aprobar, aprobar con condiciones, rechazar, pedir información o delegar.
  - Archivos existentes: `src/modules/tickets/ticket-detail/secciones/TarjetaAprobacionSod.tsx`
  - Archivos por crear: `src/app/plataforma/aprobador/cambios/page.tsx`, `src/app/api/aprobador/cambios/route.ts`
- **2.2** Aprobaciones de solicitudes de servicio — `EXISTE`
  - Ruta: `/tickets/gestion/aprobaciones`
  - Archivos existentes: `src/app/plataforma/tickets/gestion/aprobaciones/page.tsx`
- **2.3** Modelos de cambio estándar — `NUEVO`
  - Ruta: `/aprobador/cambios/modelos`
  - Archivos por crear: `src/app/plataforma/aprobador/cambios/modelos/page.tsx`
- **2.4** Bajas y renovaciones por monto — `NUEVO`
  - Ruta: `/aprobador/activos`
  - Archivos por crear: `src/app/plataforma/aprobador/activos/page.tsx`, `src/app/api/aprobador/activos/route.ts`
- **2.5** Riesgo aceptado y cierre de problemas mayores — `NUEVO`
  - Ruta: `/aprobador/problemas`
  - Archivos por crear: `src/app/plataforma/aprobador/problemas/page.tsx`, `src/app/api/aprobador/problemas/route.ts`

### 3 Comité asesor de cambios (CAB)  `EXISTE`
- Ruta: `/cambios/gestion/cab`
- **3.1** Dictamen colegiado — `ADAPTAR`
  - Ruta: `/cambios/gestion/cab`
  - Función: Quórum, votación, voto de calidad, exclusión por conflicto de interés.
  - Archivos existentes: `src/app/plataforma/cambios/gestion/cab/page.tsx`
- **3.2** Agenda y actas — `NUEVO`
  - Ruta: `/aprobador/cab/agenda`
  - Archivos por crear: `src/app/plataforma/aprobador/cab/agenda/page.tsx`, `src/app/api/aprobador/cab/agenda/route.ts`
- **3.3** Comité de emergencia (ECAB) — `NUEVO`
  - Ruta: `/aprobador/cab/emergencia`
  - Función: Decisión rápida con plazo y revisión retroactiva.
  - Archivos por crear: `src/app/plataforma/aprobador/cab/emergencia/page.tsx`, `src/app/api/aprobador/cab/emergencia/route.ts`

### 4 Calendario de cambios  `EXISTE`
- Ruta: `/cambios/gestion/calendario`
- Archivos existentes: `src/app/plataforma/cambios/gestion/calendario/page.tsx`

### 5 Detalle de RFC  `ADAPTAR`
Presentador con evaluación, riesgo, plan, rollback y botones de decisión.
- Ruta: `/cambios/gestion/[id]`
- Archivos existentes: `src/app/plataforma/cambios/gestion/[id]/page.tsx`
- Archivos por crear: `src/modules/tickets/presentadores/PresentadorRfcAprobador.tsx`

### 6 Historial de mis decisiones  `NUEVO`
- Ruta: `/aprobador/historial`
- Archivos por crear: `src/app/plataforma/aprobador/historial/page.tsx`, `src/app/api/aprobador/historial/route.ts`

### 7 Delegaciones  `NUEVO`
Delegar por ausencia a un suplente con vigencia.
- Ruta: `/aprobador/delegaciones`
- Archivos por crear: `src/app/plataforma/aprobador/delegaciones/page.tsx`, `src/app/api/aprobador/delegaciones/route.ts`

### 8 Reportes de decisiones  `NUEVO`
Tiempo de respuesta y tasas de aprobación y rechazo.
- Ruta: `/aprobador/reportes`
- Archivos por crear: `src/app/plataforma/aprobador/reportes/page.tsx`

### 9 Mi cuenta  `ADAPTAR`
Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.
- Ruta: `/mi-cuenta`
- Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`, `src/app/api/mi-cuenta/route.ts`
- **9.1** Mi perfil y seguridad — `EXISTE`
  - Ruta: `/mi-cuenta`
  - Función: Ver y editar datos permitidos, cambiar contraseña y ver sesiones.
  - Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`
- **9.2** Preferencias de notificación — `NUEVO`
  - Ruta: `/mi-cuenta/notificaciones`
  - Función: Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.
  - Archivos por crear: `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`, `src/app/api/mi-cuenta/notificaciones/route.ts`

---

## PERFIL 8 — Gestor de Cambios

- **Rol:** Responsable del proceso de cambios (Change Enablement): evalúa, coordina autorizaciones, programa, preside el CAB y revisa los resultados.
- **Alcance de datos:** Todas las RFC, el calendario y las reglas de calendario.
- **Inicio:** `/gestor-cambios/panel` · **Presentador de ticket:** PresentadorRfcEvaluador (nuevo)
- **Permisos de referencia:** `cambios.evaluar`, `cambios.programar`, `cambios.cerrar`, `cambios.reclasificar_tipo`, `config.cambios.calendario`.
- **Opciones:** 27 (existen 6, por adaptar 7, nuevas 14).

### 1 Panel de gestión de cambios  `NUEVO`
Inicio: RFC por evaluar, autorizaciones pendientes, cambios de hoy, conflictos y PIR vencidas.
- Ruta: `/gestor-cambios/panel`
- Archivos existentes: `src/app/plataforma/dashboard/page.tsx`
- Archivos por crear: `src/app/plataforma/gestor-cambios/panel/page.tsx`, `src/app/api/gestor-cambios/panel/route.ts`, `src/modules/cambios/services/cambiosService.ts`

### 2 Solicitudes de cambio (RFC)  `EXISTE`
- Ruta: `/cambios/gestion`
- Archivos existentes: `src/app/plataforma/cambios/page.tsx`, `src/app/plataforma/cambios/gestion/page.tsx`
- **2.1** Registrar solicitud RFC — `EXISTE`
  - Ruta: `/cambios/gestion/crear`
  - Función: Formulario del Prompt 2 con validación de calendario y análisis de impacto.
  - Archivos existentes: `src/app/plataforma/cambios/gestion/crear/page.tsx`, `src/app/api/cambios/route.ts`
- **2.2** Bandeja de RFC por evaluar — `NUEVO`
  - Ruta: `/gestor-cambios/evaluacion`
  - Función: Asignar evaluador, calcular riesgo, revisar conflictos y enviar a autorización.
  - Archivos por crear: `src/app/plataforma/gestor-cambios/evaluacion/page.tsx`, `src/app/api/gestor-cambios/evaluacion/route.ts`
- **2.3** Historial consolidado — `EXISTE`
  - Ruta: `/cambios/gestion/todos`
  - Archivos existentes: `src/app/plataforma/cambios/gestion/todos/page.tsx`
- **2.4** Detalle de RFC — `ADAPTAR`
  - Ruta: `/cambios/gestion/[id]`
  - Función: Presentador del evaluador: reclasificar tipo, ajustar riesgo, programar, cerrar.
  - Archivos existentes: `src/app/plataforma/cambios/gestion/[id]/page.tsx`, `src/app/api/cambios/[id]/route.ts`
  - Archivos por crear: `src/modules/tickets/presentadores/PresentadorRfcEvaluador.tsx`

### 3 Evaluación y autorización  `NUEVO`
- Ruta: `/gestor-cambios/autorizaciones`
- **3.1** Seguimiento de etapas de aprobación — `NUEVO`
  - Ruta: `/gestor-cambios/autorizaciones`
  - Función: Etapas pendientes, plazos, recordatorios y escalamiento.
  - Archivos por crear: `src/app/plataforma/gestor-cambios/autorizaciones/page.tsx`, `src/app/api/gestor-cambios/autorizaciones/route.ts`
- **3.2** Reclasificación y excepciones — `NUEVO`
  - Función: Reclasificar el tipo, conceder excepción de conflicto o de congelamiento con motivo.
  - Archivos por crear: `src/app/api/gestor-cambios/excepciones/route.ts`

### 4 Programación e implementación  `NUEVO`
- Ruta: `/gestor-cambios/programacion`
- **4.1** Calendario de ventanas — `EXISTE`
  - Ruta: `/cambios/gestion/calendario`
  - Archivos existentes: `src/app/plataforma/cambios/gestion/calendario/page.tsx`
- **4.2** Programación de cambios autorizados — `NUEVO`
  - Ruta: `/gestor-cambios/programacion`
  - Archivos por crear: `src/app/plataforma/gestor-cambios/programacion/page.tsx`, `src/app/api/gestor-cambios/programacion/route.ts`
- **4.3** Conflictos y capacidad — `NUEVO`
  - Ruta: `/gestor-cambios/conflictos`
  - Función: Solapamientos, congelamientos, feriados y máximos simultáneos.
  - Archivos por crear: `src/app/plataforma/gestor-cambios/conflictos/page.tsx`, `src/app/api/gestor-cambios/conflictos/route.ts`, `src/modules/cambios/services/conflictosService.ts`
- **4.4** Seguimiento de ejecución — `NUEVO`
  - Ruta: `/gestor-cambios/ejecucion`
  - Función: Tablero en vivo de cambios en ejecución, extensiones de ventana y rollbacks.
  - Archivos por crear: `src/app/plataforma/gestor-cambios/ejecucion/page.tsx`, `src/app/api/gestor-cambios/ejecucion/route.ts`

### 5 Comité asesor de cambios (CAB)  `EXISTE`
- Ruta: `/cambios/gestion/cab`
- **5.1** Dictamen colegiado (presidencia) — `ADAPTAR`
  - Ruta: `/cambios/gestion/cab`
  - Archivos existentes: `src/app/plataforma/cambios/gestion/cab/page.tsx`
- **5.2** Convocatoria, agenda y actas — `NUEVO`
  - Ruta: `/gestor-cambios/cab/agenda`
  - Función: Genera agenda con corte, convoca reuniones extraordinarias y emite el acta.
  - Archivos por crear: `src/app/plataforma/gestor-cambios/cab/agenda/page.tsx`, `src/app/api/gestor-cambios/cab/agenda/route.ts`

### 6 Revisión post-implementación  `NUEVO`
PIR pendientes y vencidas; incidentes causados; lecciones aprendidas.
- Ruta: `/gestor-cambios/pir`
- Archivos por crear: `src/app/plataforma/gestor-cambios/pir/page.tsx`, `src/app/api/gestor-cambios/pir/route.ts`

### 7 Modelos de cambio estándar  `NUEVO`
Consulta y propuesta de modelos, métricas de éxito y suspensiones.
- Ruta: `/gestor-cambios/modelos`
- Archivos por crear: `src/app/plataforma/gestor-cambios/modelos/page.tsx`, `src/app/api/gestor-cambios/modelos/route.ts`

### 8 Reglas de calendario  `ADAPTAR`
- Ruta: `/gestor-cambios/calendario-reglas`
- **8.1** Ventanas de mantenimiento — `ADAPTAR`
  - Ruta: `/admin/procesos/cambios/notificaciones-calendario?vista=ventanas`
  - Función: Edición permitida por el permiso `config.cambios.calendario`.
  - Archivos existentes: `src/modules/cambios/config/notificaciones-calendario/components/PestanaVentanasMantenimiento.tsx`
- **8.2** Períodos de congelamiento — `ADAPTAR`
  - Ruta: `/admin/procesos/cambios/notificaciones-calendario?vista=congelamiento`
  - Archivos existentes: `src/modules/cambios/config/notificaciones-calendario/components/PestanaPeriodosCongelamiento.tsx`
- **8.3** Feriados — `ADAPTAR`
  - Ruta: `/admin/procesos/cambios/notificaciones-calendario?vista=feriados`
  - Archivos existentes: `src/modules/cambios/config/notificaciones-calendario/components/PestanaFeriados.tsx`

### 9 Reportes de cambios  `NUEVO`
Tasa de éxito, emergencias, tiempos de ciclo, incidentes causados y cumplimiento de ventana.
- Ruta: `/gestor-cambios/reportes`
- Archivos por crear: `src/app/plataforma/gestor-cambios/reportes/page.tsx`, `src/app/api/gestor-cambios/reportes/route.ts`

### 10 Mi cuenta  `ADAPTAR`
Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.
- Ruta: `/mi-cuenta`
- Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`, `src/app/api/mi-cuenta/route.ts`
- **10.1** Mi perfil y seguridad — `EXISTE`
  - Ruta: `/mi-cuenta`
  - Función: Ver y editar datos permitidos, cambiar contraseña y ver sesiones.
  - Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`
- **10.2** Preferencias de notificación — `NUEVO`
  - Ruta: `/mi-cuenta/notificaciones`
  - Función: Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.
  - Archivos por crear: `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`, `src/app/api/mi-cuenta/notificaciones/route.ts`

---

## PERFIL 9 — Gestor de Activos y Configuración

- **Rol:** Responsable del inventario, las licencias, los contratos y la CMDB: custodia, ciclo de vida, cumplimiento y exactitud de la configuración.
- **Alcance de datos:** Todos los activos, licencias, contratos, proveedores y relaciones de CI.
- **Inicio:** `/gestor-activos/panel` · **Presentador de ticket:** PresentadorActivoGestor (nuevo)
- **Permisos de referencia:** `activos.crear/editar/asignar`, `licencias.editar`, `contratos.editar`, `cmdb.relaciones.editar`, `config.activos.catalogos`.
- **Opciones:** 35 (existen 9, por adaptar 8, nuevas 18).

### 1 Panel de activos y CMDB  `NUEVO`
Garantías por vencer, actas pendientes, sobreuso de licencias, inexactitudes y campañas activas.
- Ruta: `/gestor-activos/panel`
- Archivos existentes: `src/app/plataforma/dashboard/page.tsx`
- Archivos por crear: `src/app/plataforma/gestor-activos/panel/page.tsx`, `src/app/api/gestor-activos/panel/route.ts`, `src/modules/activos/services/activosService.ts`

### 2 Inventario de activos (HAM)  `EXISTE`
- Ruta: `/activos/inventario`
- Archivos existentes: `src/app/plataforma/activos/page.tsx`, `src/app/plataforma/activos/inventario/page.tsx`, `src/app/api/activos/route.ts`, `src/app/api/activos/[id]/historial/route.ts`, `src/app/api/activos/tipos/route.ts`, `src/app/api/activos/modelos/route.ts`
- **2.1** Listado y ficha del activo — `ADAPTAR`
  - Ruta: `/activos/inventario`
  - Función: Ficha con atributos, relaciones, tickets, mantenimiento y auditoría.
  - Archivos existentes: `src/app/plataforma/activos/inventario/page.tsx`
  - Archivos por crear: `src/modules/tickets/presentadores/PresentadorActivoGestor.tsx`
- **2.2** Alta y edición con validaciones — `ADAPTAR`
  - Función: Formulario del Prompt 3 con IP, MAC, serie, hostname e IMEI.
  - Archivos existentes: `src/shared/lib/validaciones.ts`
  - Archivos por crear: `src/modules/activos/activosValidaciones.ts`
- **2.3** Importación masiva — `NUEVO`
  - Ruta: `/gestor-activos/importacion`
  - Función: Validación en seco, mapeo de columnas y reversión.
  - Archivos por crear: `src/app/plataforma/gestor-activos/importacion/page.tsx`, `src/app/api/gestor-activos/importacion/route.ts`
- **2.4** Etiquetas e impresión — `NUEVO`
  - Archivos por crear: `src/app/api/gestor-activos/etiquetas/route.ts`
- **2.5** Recepción de adquisiciones — `NUEVO`
  - Ruta: `/gestor-activos/recepcion`
  - Función: Recepción por lote con series, garantía y vínculo a la solicitud de origen.
  - Archivos por crear: `src/app/plataforma/gestor-activos/recepcion/page.tsx`, `src/app/api/gestor-activos/recepcion/route.ts`
- **2.6** Asignación, custodia y actas — `NUEVO`
  - Ruta: `/gestor-activos/asignaciones`
  - Función: Asignar, transferir, devolver; actas y aceptación del custodio.
  - Archivos por crear: `src/app/plataforma/gestor-activos/asignaciones/page.tsx`, `src/app/api/gestor-activos/asignaciones/route.ts`
- **2.7** Mantenimiento y garantías — `NUEVO`
  - Ruta: `/gestor-activos/mantenimiento`
  - Archivos por crear: `src/app/plataforma/gestor-activos/mantenimiento/page.tsx`, `src/app/api/gestor-activos/mantenimiento/route.ts`
- **2.8** Bajas y disposición — `NUEVO`
  - Ruta: `/gestor-activos/bajas`
  - Función: Solicitudes de baja, borrado seguro, acta y destino final.
  - Archivos por crear: `src/app/plataforma/gestor-activos/bajas/page.tsx`, `src/app/api/gestor-activos/bajas/route.ts`
- **2.9** Inventario físico (campañas) — `NUEVO`
  - Ruta: `/gestor-activos/inventario-fisico`
  - Función: Crear campañas, revisar discrepancias y cerrar con acta (el conteo en campo lo hace el técnico).
  - Archivos por crear: `src/app/plataforma/gestor-activos/inventario-fisico/page.tsx`, `src/app/api/gestor-activos/inventario-fisico/route.ts`

### 3 Licencias de software (SAM)  `EXISTE`
- Ruta: `/activos/licencias`
- Archivos existentes: `src/app/plataforma/activos/licencias/page.tsx`, `src/app/api/activos/licencias/route.ts`, `src/app/api/activos/licencias/asignaciones/route.ts`
- **3.1** Licencias y asignaciones — `EXISTE`
- **3.2** Cumplimiento y sobreuso — `NUEVO`
  - Ruta: `/gestor-activos/licencias/cumplimiento`
  - Archivos por crear: `src/app/plataforma/gestor-activos/licencias/cumplimiento/page.tsx`, `src/app/api/gestor-activos/licencias/cumplimiento/route.ts`
- **3.3** Catálogo de software autorizado — `NUEVO`
  - Ruta: `/gestor-activos/licencias/catalogo-software`
  - Archivos por crear: `src/app/plataforma/gestor-activos/licencias/catalogo-software/page.tsx`

### 4 Proveedores y contratos  `EXISTE`
- Ruta: `/proveedores`
- **4.1** Proveedores — `EXISTE`
  - Ruta: `/proveedores`
  - Función: Proveedores con validación de RUC y contacto.
  - Archivos existentes: `src/app/plataforma/proveedores/page.tsx`, `src/modules/proveedores/components/ProveedoresWorkspace.tsx`, `src/app/api/proveedores/route.ts`, `src/app/api/proveedores/[id]/route.ts`
- **4.2** Contratos y cobertura — `NUEVO`
  - Ruta: `/gestor-activos/contratos`
  - Archivos por crear: `src/app/plataforma/gestor-activos/contratos/page.tsx`, `src/app/api/gestor-activos/contratos/route.ts`
- **4.3** Renovaciones y vencimientos — `NUEVO`
  - Ruta: `/gestor-activos/renovaciones`
  - Función: Genera solicitudes de renovación y registra el historial.
  - Archivos por crear: `src/app/plataforma/gestor-activos/renovaciones/page.tsx`, `src/app/api/gestor-activos/renovaciones/route.ts`

### 5 CMDB  `EXISTE`
- Ruta: `/activos/cmdb`
- **5.1** Mapa de topología — `EXISTE`
  - Ruta: `/activos/cmdb`
  - Archivos existentes: `src/app/plataforma/activos/cmdb/page.tsx`, `src/app/api/activos/cmdb/route.ts`
- **5.2** Relaciones entre CI — `ADAPTAR`
  - Función: Edición con matriz de clases permitidas.
  - Archivos existentes: `src/app/api/activos/cmdb/relaciones/route.ts`
- **5.3** Modelado de clases CI — `EXISTE`
  - Ruta: `/activos/cmdb/tipos`
  - Archivos existentes: `src/app/plataforma/activos/cmdb/tipos/page.tsx`, `src/app/api/admin/cmdb/tipos/route.ts`
- **5.4** Actualizaciones de CMDB desde cambios — `NUEVO`
  - Ruta: `/gestor-activos/cmdb/actualizaciones`
  - Función: Aplica a la CMDB lo propuesto en las RFC cerradas.
  - Archivos por crear: `src/app/plataforma/gestor-activos/cmdb/actualizaciones/page.tsx`, `src/app/api/gestor-activos/cmdb/actualizaciones/route.ts`
- **5.5** Calidad y auditoría de CMDB — `NUEVO`
  - Ruta: `/gestor-activos/cmdb/auditoria`
  - Archivos por crear: `src/app/plataforma/gestor-activos/cmdb/auditoria/page.tsx`, `src/app/api/gestor-activos/cmdb/auditoria/route.ts`
- **5.6** Líneas base — `NUEVO`
  - Ruta: `/gestor-activos/cmdb/lineas-base`
  - Archivos por crear: `src/app/plataforma/gestor-activos/cmdb/lineas-base/page.tsx`, `src/app/api/gestor-activos/cmdb/lineas-base/route.ts`
- **5.7** Inexactitudes reportadas — `NUEVO`
  - Ruta: `/gestor-activos/cmdb/inexactitudes`
  - Función: Tareas generadas por técnicos.
  - Archivos por crear: `src/app/plataforma/gestor-activos/cmdb/inexactitudes/page.tsx`, `src/app/api/gestor-activos/cmdb/inexactitudes/route.ts`

### 6 Catálogos de activos  `ADAPTAR`
- Ruta: `/gestor-activos/catalogos`
- **6.1** Fabricantes y modelos — `ADAPTAR`
  - Ruta: `/admin/activos-config/tipos-modelos-atributos?vista=fabricantes`
  - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaFabricantesModelos.tsx`
- **6.2** Ubicaciones — `ADAPTAR`
  - Ruta: `/admin/activos-config/tipos-modelos-atributos?vista=ubicaciones`
  - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaUbicaciones.tsx`
- **6.3** Listas auxiliares — `ADAPTAR`
  - Ruta: `/admin/activos-config/tipos-modelos-atributos?vista=catalogos`
  - Archivos existentes: `src/modules/activos/config/tipos-modelos-atributos/components/PestanaCatalogosAuxiliares.tsx`

### 7 Reportes de activos  `NUEVO`
Inventario, antigüedad, costos, garantías, cumplimiento y exactitud de CMDB.
- Ruta: `/gestor-activos/reportes`
- Archivos por crear: `src/app/plataforma/gestor-activos/reportes/page.tsx`, `src/app/api/gestor-activos/reportes/route.ts`

### 8 Mi cuenta  `ADAPTAR`
Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.
- Ruta: `/mi-cuenta`
- Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`, `src/app/api/mi-cuenta/route.ts`
- **8.1** Mi perfil y seguridad — `EXISTE`
  - Ruta: `/mi-cuenta`
  - Función: Ver y editar datos permitidos, cambiar contraseña y ver sesiones.
  - Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`
- **8.2** Preferencias de notificación — `NUEVO`
  - Ruta: `/mi-cuenta/notificaciones`
  - Función: Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.
  - Archivos por crear: `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`, `src/app/api/mi-cuenta/notificaciones/route.ts`

---

## PERFIL 10 — Gestor de Problemas

- **Rol:** Responsable de la gestión de problemas: identificación proactiva, análisis de causa raíz, errores conocidos y mejora continua.
- **Alcance de datos:** Todos los problemas, errores conocidos e incidentes vinculados.
- **Inicio:** `/gestor-problemas/panel` · **Presentador de ticket:** PresentadorProblemaGestor (nuevo)
- **Permisos de referencia:** `problemas.crear/editar/asignar/cerrar`, `kedb.publicar`, `problemas.prioridad_manual`.
- **Opciones:** 18 (existen 4, por adaptar 1, nuevas 13).

### 1 Panel de gestión de problemas  `NUEVO`
Problemas abiertos, sin asignar, por vencer, mayores y errores conocidos por revisar.
- Ruta: `/gestor-problemas/panel`
- Archivos existentes: `src/app/plataforma/dashboard/page.tsx`
- Archivos por crear: `src/app/plataforma/gestor-problemas/panel/page.tsx`, `src/app/api/gestor-problemas/panel/route.ts`, `src/modules/problemas/services/problemaService.ts`

### 2 Registro de problemas  `EXISTE`
- Ruta: `/problemas`
- Archivos existentes: `src/app/plataforma/problemas/page.tsx`, `src/modules/problemas/components/ProblemasWorkspace.tsx`, `src/app/api/problemas/route.ts`, `src/app/api/problemas/[id]/route.ts`
- **2.1** Registrar problema — `EXISTE`
  - Función: Formulario del Prompt 1 con detección de duplicados.
  - Archivos existentes: `src/shared/lib/validaciones.ts`
- **2.2** Detalle del problema — `NUEVO`
  - Ruta: `/problemas/[id]`
  - Función: Investigación, causa raíz, workaround, solución, RFC y cierre.
  - Archivos por crear: `src/app/plataforma/problemas/[id]/page.tsx`, `src/modules/tickets/presentadores/PresentadorProblemaGestor.tsx`

### 3 Bandeja y asignación  `NUEVO`
Asignar responsables, grupos y prioridad.
- Ruta: `/gestor-problemas/asignacion`
- Archivos por crear: `src/app/plataforma/gestor-problemas/asignacion/page.tsx`, `src/app/api/gestor-problemas/asignacion/route.ts`

### 4 Identificación proactiva  `NUEVO`
- Ruta: `/gestor-problemas/candidatos`
- **4.1** Candidatos a problema — `NUEVO`
  - Ruta: `/gestor-problemas/candidatos`
  - Función: Sugerencias de las reglas de umbral con alcance global.
  - Archivos existentes: `src/app/plataforma/tecnico/problemas/candidatos/page.tsx`
  - Archivos por crear: `src/app/plataforma/gestor-problemas/candidatos/page.tsx`
- **4.2** Incidentes recurrentes — `NUEVO`
  - Ruta: `/gestor-problemas/recurrentes`
  - Función: Agrupación por servicio, CI, categoría y código de resolución.
  - Archivos por crear: `src/app/plataforma/gestor-problemas/recurrentes/page.tsx`, `src/app/api/gestor-problemas/recurrentes/route.ts`

### 5 Análisis de causa raíz  `NUEVO`
Herramientas de 5 porqués, Ishikawa y línea de tiempo.
- Ruta: `/gestor-problemas/analisis`
- Archivos por crear: `src/app/plataforma/gestor-problemas/analisis/page.tsx`, `src/app/api/gestor-problemas/analisis/route.ts`

### 6 Errores conocidos (KEDB)  `EXISTE`
Publicar, retirar y revisar periódicamente.
- Ruta: `/problemas/kedb`
- Archivos existentes: `src/app/plataforma/problemas/kedb/page.tsx`

### 7 Problemas mayores y revisión  `NUEVO`
- Ruta: `/gestor-problemas/mayores`
- Archivos por crear: `src/app/plataforma/gestor-problemas/mayores/page.tsx`, `src/app/api/gestor-problemas/mayores/route.ts`

### 8 Solicitudes de cambio derivadas  `NUEVO`
RFC vinculadas a problemas y su estado.
- Ruta: `/gestor-problemas/cambios`
- Archivos por crear: `src/app/plataforma/gestor-problemas/cambios/page.tsx`, `src/app/api/gestor-problemas/cambios/route.ts`

### 9 Conocimiento derivado  `NUEVO`
Artículos generados y pendientes por problema.
- Ruta: `/gestor-problemas/conocimiento`
- Archivos por crear: `src/app/plataforma/gestor-problemas/conocimiento/page.tsx`

### 10 Objetivos de tiempo  `NUEVO`
Consulta de los objetivos internos de problemas.
- Ruta: `/gestor-problemas/objetivos`
- Archivos por crear: `src/app/plataforma/gestor-problemas/objetivos/page.tsx`

### 11 Reportes de problemas  `NUEVO`
Tiempo hasta causa raíz, recurrencia, problemas mayores y uso de errores conocidos.
- Ruta: `/gestor-problemas/reportes`
- Archivos por crear: `src/app/plataforma/gestor-problemas/reportes/page.tsx`, `src/app/api/gestor-problemas/reportes/route.ts`

### 12 Mi cuenta  `ADAPTAR`
Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.
- Ruta: `/mi-cuenta`
- Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`, `src/app/api/mi-cuenta/route.ts`
- **12.1** Mi perfil y seguridad — `EXISTE`
  - Ruta: `/mi-cuenta`
  - Función: Ver y editar datos permitidos, cambiar contraseña y ver sesiones.
  - Archivos existentes: `src/app/plataforma/mi-cuenta/page.tsx`
- **12.2** Preferencias de notificación — `NUEVO`
  - Ruta: `/mi-cuenta/notificaciones`
  - Función: Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.
  - Archivos por crear: `src/app/plataforma/mi-cuenta/notificaciones/page.tsx`, `src/app/api/mi-cuenta/notificaciones/route.ts`

---

## 4. Consolidaciones y retiros recomendados
| Elemento | Situación actual | Acción |
|---|---|---|
| Modales y barra de acciones de configuración | Duplicados en `problemas/formulario/components` y `cambios/formulario/components` | Unificar en `src/shared/components/admin/` y que importen los tres módulos (problemas, cambios, activos). |
| `Iconos.tsx` locales | Uno en `cambios/flujo-evaluacion/components` y otro en `cambios/notificaciones-calendario/components` | Reemplazar por `src/shared/components/ui/Iconos.tsx` y borrar las copias. |
| Configuración antigua de RFC | `/admin/rfc`, `/api/admin/rfc-config`, `src/modules/cambios/components/ConfiguracionRfc.tsx` | Migrar sus datos a `/admin/procesos/cambios` y retirarla. |
| Carpetas vacías | `tickets/gestion/cambios/` y `tickets/gestion/problemas/` sin `page.tsx` | Eliminar o convertir en redirecciones a `/cambios/gestion` y `/problemas`. |
| `/dashboard` | Página única para todos | Convertir en redirector al panel del perfil activo. |
| Ventanas faltantes de problemas | Faltan `PestanaCamposPersonalizados` y `PestanaPrioridad` | Crearlas (sus APIs ya existen). |
| Páginas de admin que el Auditor debe ver | `auditoria-sistema`, `seguridad-logs`, `mantenimiento-datos`, `perfiles`, `reportes-disenador` | Autorizar al perfil Auditor en solo lectura mediante `src/shared/lib/page-auth.ts`. |
