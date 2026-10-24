# Plan de Equipo, Propiedad de Módulos y Metodología Scrum
**Proyecto:** FlowDesk ITSM — Sistema de Gestión de Tickets y Servicios de TI  
**Versión:** 2.0 (documento canónico)  
**Fecha:** 2026-10-19  
**Ámbito:** equipo, propiedad de módulos, aislamiento, Git, Scrum, plantillas, prompts y criterios de verificación.  
**Sustituye a:** `DOCUMENTACIÓN/DISTRIBUCION_EQUIPO_Y_METODOLOGIA_SCRUM.md` y `DOCUMENTACIÓN/PLAN_TRABAJO_5_INTEGRANTES_MODULOS_LIBRES.md`.

> Este documento operacionaliza la arquitectura y los requisitos. Ante una duda de propiedad, ramas o ceremonias, manda este plan; ante una duda de arquitectura, contrato o ruta, manda `ARQUITECTURA_Y_CODIGO.md`; para menú y perfiles, manda `MENUS_Y_PERFILES.md`.

---

## 1. Propósito y documentos de referencia
### 1.1. Qué resuelve
1. Define **quién es dueño de cada módulo, ruta, API, migración y documento**.
2. Fija reglas de **aislamiento** para que cinco personas trabajen en paralelo sin colisiones.
3. Establece el **flujo Git y los quality gates** obligatorios.
4. Describe **sprints, ceremonias y plantillas** con evidencia Scrum.
5. Entrega **prompts para asistentes de IA** alineados con el repositorio real.
6. Define **criterios de aceptación y verificación** reutilizables en cada PR.

No sustituye el detalle funcional de HU, RF, RN o trazabilidad; no autoriza cambios al contrato del núcleo sin revisión; no convierte una consola de rol en dueña de lógica de dominio.

### 1.2. Jerarquía documental
| Nivel | Documento | Uso |
| :--- | :--- | :--- |
| 1. Arquitectura | `ARQUITECTURA_Y_CODIGO.md` | Estructura, contratos, decisiones técnicas, mapa de código. |
| 2. Organización | `PLAN_EQUIPO_Y_SCRUM.md` | Propiedad, aislamiento, Git, Scrum y aceptación. |
| 3. Navegación | `MENUS_Y_PERFILES.md` | Menú, perfiles, visibilidad y rutas publicadas. |
| 4. Requisitos | `REQUERIMIENTOS.md`, `HISTORIAS_DE_USUARIO.md` | Qué debe hacer el sistema y cómo se acepta. |
| 5. Trazabilidad | `TRAZABILIDAD.md` | HU ↔ RF ↔ RN ↔ módulo ↔ ruta ↔ evidencia. |
| 6. Configuración | `PROMPTS_CONFIGURACION_ADMIN.md` | Guiones de configuración administrativa. |
| 7. Datos | `CATALOGO_SERVICIOS_DATOS.md` | Catálogo de servicios y datos maestros. |
Si hay contradicción: **arquitectura > este plan > documento funcional**. Se resuelve en refinamiento y se corrige en el mismo sprint.

### 1.3. Paquete documental canónico
| Documento canónico | Contenido | Estado y referencia |
| :--- | :--- | :--- |
| `ARQUITECTURA_Y_CODIGO.md` | Módulos, contratos, rutas y capas. | Vigente (v1.0, 2026-10-19); sustituye a `DOCUMENTACION_COMPLETA_ARQUITECTURA_Y_CODIGO.md` y `ARQUITECTURA_MODULAR_Y_CONTRATOS.md`. |
| `MENUS_Y_PERFILES.md` | Menú, perfiles, `opciones_menu`. | Vigente (2026-10-20); sustituye a `ESQUEMA_MENUS_POR_PERFIL.md`. |
| `REQUERIMIENTOS.md` | RF, RNF y RN. | `requerimientos_funcionales.md`, `requerimientos_no_funcionales.md`, `reglas_de_negocio.md` |
| `HISTORIAS_DE_USUARIO.md` | HU y criterios de aceptación. | `historias_de_usuario.md` |
| `TRAZABILIDAD.md` | Matriz bidireccional y evidencia. | `matriz_trazabilidad_funciones_hu_rf_rn.md` |
| `PROMPTS_CONFIGURACION_ADMIN.md` | Configuración de catálogos, menús y procesos. | `prompt_1_config_gestion_de_problemas.md`, `prompt_2_config_gestion_de_cambios.md`, `prompt_3_config_activos_y_cmdb.md` |
| `CATALOGO_SERVICIOS_DATOS.md` | Servicios, categorías y datos semilla. | `carga_servicios_catalogo_30.md` |
**Regla:** si un nombre canónico aún no existe físicamente, se referencia el documento actual; no se crea una copia paralela.

---

## 2. Estado real del repositorio al 2026-10-19
### 2.1. Arquitectura vigente
FlowDesk es **Next.js 14 (App Router) + TypeScript + PostgreSQL**, organizado por dominio:

```text
src/
├── app/                 # Cascarones delgados: páginas y route handlers
│   ├── api/             # APIs; reexportan controladores de módulos
│   └── plataforma/      # Rutas publicadas
├── modules/             # Lógica de dominio, UI y controladores
│   └── <modulo>/
│       ├── index.ts     # Contrato de servidor
│       ├── ui.ts        # Contrato de UI (solo si expone cliente)
│       ├── services/    # Reglas de negocio y acceso a datos
│       ├── api/         # Controladores HTTP
│       ├── views/       # Pantallas
│       └── components/  # Componentes del dominio
└── shared/              # DB, auth, capacidades, guards, errores, UI común
```

Principios no negociables: `src/app` no contiene lógica; la lógica vive en `src/modules/<modulo>/`; `shared` nunca importa módulos; cada módulo expone contrato público; las consolas de rol delegan el dominio.

### 2.2. Los 17 módulos actuales
| # | Módulo | Archivos* | Contrato | Dominio | Dueño |
| --: | :--- | --: | :--- | :--- | :--- |
| 1 | `tickets` | 52 | `index.ts` + `ui.ts` | Núcleo ITSM congelado y configuración de formularios/vistas de ticket. | Miguel |
| 2 | `incidentes` | 12 | `index.ts` | Incidentes, mayores y sala de crisis. | Miguel |
| 3 | `solicitudes` | 6 | `index.ts` | Solicitudes de servicio y su ciclo. | Miguel |
| 4 | `cambios` | 134 | `index.ts` | RFC, CAB/ECAB, evaluación, calendario, PIR, plantillas. | Nain |
| 5 | `problemas` | 94 | `index.ts` | Problemas, RCA, KEDB, configuración del proceso. | Alexis |
| 6 | `seguridad` | 36 | `index.ts` | Login, JWT, sesiones, captcha, recuperación. | Junior |
| 7 | `plataforma` | 29 | `index.ts` | Salud, mantenimiento, logs, auditoría, menú, notificaciones y parámetros. | Miguel |
| 8 | `perfiles` | 135 | Subcarpetas por rol | Consolas de rol: solo UI y alcance del perfil. | Compartido por subcarpeta |
| 9 | `servicios` | 33 | `index.ts` + `ui.ts` | Catálogo, categorías, SLA, matriz de prioridad y workflow. | Lourdes |
| 10 | `operacion` | 34 | `index.ts` | Eventos operativos y resiliencia. | Miguel |
| 11 | `activos` | 94 | `index.ts` | ITAM/SAM: inventario, licencias, contratos, bajas. | Lourdes |
| 12 | `cmdb` | 34 | `index.ts` | SACM: CIs, relaciones, líneas base, exactitud, análisis. | Nain |
| 13 | `proveedores` | 6 | `index.ts` | Proveedores y contratos. | Junior |
| 14 | `identidades` | 22 | `index.ts` | Usuarios, perfiles RBAC, credenciales. | Junior |
| 15 | `organizacion` | 32 | `index.ts` | Departamentos, técnicos, colaboradores, ausencias. | Junior |
| 16 | `conocimiento` | 29 | `index.ts` | Base de conocimiento, configuración editorial y flujo editorial. | Alexis |
| 17 | `reportes` | 24 | `index.ts` + `ui.ts` | 9 reportes centralizados e indicadores. | Miguel |
\* Conteo referencial al 2026-10-19; dimensiona, no reparte carga.

### 2.3. Contratos públicos
| Módulo | Servidor | UI | Observación |
| :--- | :--- | :--- | :--- |
| `tickets` | `@/modules/tickets` | `@/modules/tickets/ui` | Núcleo congelado; cambio requiere revisión de Miguel. |
| `servicios` | `@/modules/servicios` | `@/modules/servicios/ui` | Catálogo global y catálogo técnico. |
| `reportes` | `@/modules/reportes` | `@/modules/reportes/ui` | Las 9 vistas de reportes. |
| Resto | `@/modules/<modulo>` | Solo si se expone cliente | No inventar UI pública sin necesidad. |
El contrato de `tickets` incluye `listarTickets`, `crearTicket`, `obtenerDetalleTicket`, `actualizarTicket`, `listarCatalogosTickets`, `crearComentarioTicket`, `tomarTicketDeMesa`, `calcularPrioridadITIL`, los handlers `ticketsGet`/`ticketsPost`, `ticketDetalleGet`/`ticketDetallePatch`, `ticketComentariosPost`, y en UI `TablaTickets`, `PresentadorRfcAprobador` y `PresentadorProblemaGestor`.

### 2.4. Fases estructurales que cambiaron el reparto
| Fase | Cambio | Migración | Consecuencia |
| :--- | :--- | :--- | :--- |
| Modelo C | Ticket base + extensiones 1:1 | `20261019_modelo_c_ticket.sql` | `tickets` es el núcleo; incidentes y solicitudes son vistas especializadas. |
| Fase 2 | Separación de Incidentes y Solicitudes con rutas, pantallas y catálogo. | `20261020_fase2_modulos_incidentes_solicitudes.sql` | `incidentes` y `solicitudes` son frentes actuales, no “módulos libres”. |
| Fase 3 | Catálogos movidos a `servicios`. | `20261021_fase3_catalogo_servicios.sql` | Las rutas de catálogo montan `@/modules/servicios/ui`. |
| Fase 4 | 9 reportes centralizados en `reportes`. | `20261022_fase4_modulo_reportes.sql` | Rutas legadas redirigen a `/plataforma/reportes/*`; no se duplican reportes. |
### 2.5. Mapa actual de rutas y dueño
| Prefijo de ruta | Dueño | API asociada |
| :--- | :--- | :--- |
| `/plataforma/tickets/**`, `/tickets/[id]`, `/tickets/gestion/*` | Miguel | `/api/tickets`, `/api/incidentes`, `/api/solicitudes` |
| `/plataforma/incidentes/**` (bandeja, asignados, mios, departamento, resueltos, crear, catálogo, configuración, mayores, `[id]`) | Miguel | `/api/incidentes` |
| `/plataforma/solicitudes/**` (bandeja, asignados, mios, departamento, resueltos, crear, catálogo, configuración, aprobaciones, `[id]`) | Miguel | `/api/solicitudes` |
| `/plataforma/servicios/catalogo`, `/admin/servicios/**` | Miguel | `/api/servicios`, `/api/admin/sla`, `/api/admin/sla/matriz` |
| `/plataforma/operacion/**` | Miguel | `/api/operacion` |
| `/plataforma/perfiles/supervisor/**`, `/aprobador/**`, `/administrador/**` | Miguel | `/api/perfiles/supervisor`, `/api/perfiles/aprobador` |
| `/plataforma/admin/menu`, `/notificaciones`, `/tickets-formularios`, `/tickets-vistas`, `/conocimiento-config` | Lourdes | `/api/menu`, `/api/admin/categorias`, `/api/admin/configuracion` |
| `/plataforma/perfiles/tecnico/**`, `/gestor-area/**`, `/solicitante/**` | Lourdes | `/api/perfiles/tecnico`, `/api/perfiles/gestor-area` |
| `/plataforma/problemas/**`, `/gestor-problemas/**`, `/admin/procesos/problemas/**` | Alexis | `/api/problemas` |
| `/plataforma/conocimiento/**` | Alexis | `/api/conocimiento`, `/api/admin/conocimiento` |
| `/plataforma/reportes/**` (9 pantallas), `/dashboard` | Alexis | `/api/reportes/indicadores` |
| `/plataforma/cambios/**`, `/admin/procesos/cambios/**` | Nain | `/api/cambios` |
| `/plataforma/activos/**`, `/gestor-activos/**`, `/admin/activos-config/**` | Nain | `/api/activos`, `/api/gestor-activos`, `/api/admin/activos-config` |
| `/plataforma/activos/cmdb/**`, `/gestor-activos/cmdb/**` | Nain | `/api/cmdb` |
| `/plataforma/proveedores` | Nain | `/api/proveedores` |
| `/plataforma/perfiles/gestor-cambios/**` | Nain | `/api/perfiles/gestor-cambios` |
| `/plataforma/admin/usuarios`, `/admin/perfiles` | Junior | `/api/usuarios`, `/api/identidades/perfiles` |
| `/plataforma/admin/departamentos*`, `/admin/tecnicos` | Junior | `/api/departamentos-ti`, `/api/departamentos-empresa`, `/api/tecnicos` |
| `/plataforma/perfiles/auditor/**` | Junior | `/api/perfiles/auditor` |
### 2.6. Correcciones respecto a los documentos anteriores
1. `incidentes`, `solicitudes`, `servicios` y `reportes` dejan de ser “módulos libres”: son frentes actuales con dueño y contrato.
2. El catálogo no pertenece a incidentes/solicitudes: su lógica vive en `servicios`; esas rutas solo montan.
3. Los 9 reportes viven en `reportes`; las pantallas legadas redirigen.
4. Las rutas de rol no tienen alias: se usa `/plataforma/perfiles/<rol>/*`.
5. La ficha RBAC vive en `identidades` (`/admin/perfiles`, `/api/identidades/perfiles`), no en `perfiles`.
6. `cmdb` es módulo independiente; se une a `activos` por dato (`elemento_configuracion.id_activo`), no por código.
7. Son **17 módulos**; no se agregan sin decisión de arquitectura.

---

## 3. Equipo y roles Scrum
### 3.1. Composición
| Integrante | Rol Scrum | Rol técnico | Dominio principal | Rama de trabajo |
| :--- | :--- | :--- | :--- | :--- |
| **Miguel** | Scrum Master + Tech Lead | Arquitecto y desarrollador del núcleo | `tickets`, `incidentes`, `solicitudes`, `plataforma`, `operacion`, `reportes`; `shared/lib` | `feature/miguel-nucleo-servicios-sla` |
| **Lourdes (Lu)** | Product Owner | Oferta de servicios y recursos TI | `servicios`, `activos`; `perfiles/tecnico`, `perfiles/gestor-area`, `perfiles/solicitante`; `shared/components` | `feature/lourdes-config-tecnico` |
| **Alexis (Darhien)** | Developer | Diagnóstico, conocimiento y KCS | `problemas`, `conocimiento` | `feature/alexis-problemas-conocimiento` |
| **Nain** | Developer | Cambio, infraestructura y CMDB | `cambios`, `cmdb`, `perfiles/gestor-cambios` | `feature/nain-cambios-activos-cmdb` |
| **Junior** | Developer | Ciberseguridad, IAM, organización y terceros | `seguridad`, `identidades`, `organizacion`, `proveedores`, `perfiles/auditor` | `feature/junior-identidades-organizacion-auditor` |
Los cinco son Developers; Scrum Master y Product Owner son responsabilidades adicionales, no jerarquías.

### 3.2. Responsabilidades
| Rol | Responsabilidades | No puede |
| :--- | :--- | :--- |
| **Scrum Master (Miguel)** | Facilitar ceremonias, eliminar impedimentos, cuidar Git, proteger quality gates y coordinar las 4 ramas. | Decidir solo el alcance ni cambiar prioridades del PO. |
| **Product Owner (Lourdes)** | Mantener backlog priorizado, aclarar HU/criterios, validar experiencia y aceptar entregas. | Cambiar arquitectura sin acuerdo del Tech Lead. |
| **Developers** | Diseñar, implementar, verificar y documentar su dominio; revisar PR; mantener su rama sincronizada. | Editar módulos ajenos, duplicar guards o saltarse `tsc`/`build`. |
| **Tech Lead (Miguel)** | Aprobar contratos del núcleo, migraciones, `shared/lib` y decisiones transversales. | Convertirse en cuello de botella; delega revisiones por dominio. |
### 3.3. Capacidad y equilibrio
El reparto es por **dominio**, no por archivos. Nain concentra la mayor superficie (`cambios` + `activos` + `cmdb` + `proveedores` + consola). Medidas: Miguel absorbe `incidentes`/`solicitudes` como núcleo operativo; Alexis asume `problemas`/`reportes`; Lourdes y Junior sostienen frentes más acotados. Si Nain se bloquea, **no se reparte su módulo**: se asigna apoyo por PR con propiedad intacta. Nadie toma trabajo ajeno sin acuerdo en planning y registro en acta.

### 3.4. Reglas de decisión
| Decisión | Quién decide | Cómo |
| :--- | :--- | :--- |
| Nueva funcionalidad | Dueño + PO | Historia priorizada y criterio de aceptación. |
| Cambio de contrato | Tech Lead | PR pequeño, justificación y consumidores actualizados. |
| Migración | Tech Lead + dueño del dato | Número libre, `seed` sincronizado y revisión. |
| Menú | Lourdes + Tech Lead | Migración + `opciones_menu` + `opciones_menu_perfiles` + verificación. |
| Arquitectura | Tech Lead | Documento actualizado antes del código. |
| Conflicto entre módulos | Tech Lead | Por contrato o por dato, nunca por importación profunda. |
---

## 4. Propiedad de módulos, consolas y rutas
Cada carpeta tiene **un dueño exclusivo**. “Dueño” significa que decide el diseño interno, revisa PR y responde por calidad; nadie más edita sin su revisión. Los cambios cruzados se piden por PR.

### 4.1. Criterios de propiedad
La tabla 2.2 ya fija dueño, dominio y contrato. Las reglas específicas se resumen así: el **núcleo congelado** (`tickets`) exige revisión de Miguel; los **dominios de proceso** (`cambios`, `problemas`, `activos`, `cmdb`, etc.) son dueños de su lógica y las consolas solo los consumen; las **consolas de rol** (`perfiles/<rol>`) solo resuelven alcance y UI; `shared` es transversal y no pertenece a ningún dominio funcional.

### 4.2. Consolas de rol (`src/modules/perfiles/`)
| Consola | Dueño | Ruta | Dominio delegado |
| :--- | :--- | :--- | :--- |
| `perfiles/administrador` | Miguel | `/plataforma/perfiles/administrador/panel` | `identidades`, `plataforma`, `organizacion`, `tickets`, `servicios`, `conocimiento` |
| `perfiles/supervisor` | Miguel | `/plataforma/perfiles/supervisor/*` | `cambios`, `activos`, `problemas`, `tickets`, `reportes` |
| `perfiles/aprobador` | Miguel | `/plataforma/perfiles/aprobador/*` | `cambios`, `activos`, `problemas`, `reportes` |
| `perfiles/tecnico` | Lourdes | `/plataforma/perfiles/tecnico/*` | `tickets`, `cambios`, `incidentes`, `problemas`, `activos`, `cmdb`, `servicios` |
| `perfiles/gestor-area` | Lourdes | `/plataforma/perfiles/gestor-area/*` | `cambios`, `activos`, `reportes` |
| `perfiles/solicitante` | Lourdes | `/plataforma/perfiles/solicitante/panel` | `tickets`, `solicitudes`, `incidentes`, `conocimiento` |
| `perfiles/gestor-cambios` | Nain | `/plataforma/perfiles/gestor-cambios/*` | `cambios`, `cmdb`, `reportes` |
| `perfiles/auditor` | Junior | `/plataforma/perfiles/auditor/*` | `cmdb`, `activos`, `cambios`, `identidades`, `reportes` |
Si una consola necesita una regla nueva, se implementa en el módulo de dominio y se expone por contrato. La consola solo resuelve alcance y pinta.

Los perfiles **Gestor de Activos** y **Gestor de Problemas** no viven en `src/modules/perfiles/`: se sirven en `/plataforma/gestor-activos/**` (Nain) y `/plataforma/gestor-problemas/**` (Alexis), y consumen los contratos de `activos`/`cmdb` y `problemas`, respectivamente. Con ellos se completan los 10 perfiles oficiales.

### 4.3. Ficha por integrante
**Miguel — núcleo, servicios, operación y consolas de supervisión**  
Módulos: `tickets`, `incidentes`, `solicitudes`, `seguridad`, `plataforma`, `servicios`, `operacion`, `perfiles/supervisor`, `perfiles/aprobador`, `perfiles/administrador`; `shared/lib`. Rutas: `/plataforma/tickets/**`, `/incidentes/**`, `/solicitudes/**`, `/servicios/catalogo`, `/admin/servicios/**`, `/operacion/**`, `/perfiles/supervisor/**`, `/perfiles/aprobador/**`, `/perfiles/administrador/panel`. APIs: `/api/tickets`, `/api/incidentes`, `/api/solicitudes`, `/api/servicios`, `/api/admin/sla`, `/api/operacion`, `/api/perfiles/supervisor`, `/api/perfiles/aprobador`. Entregables: contrato de `tickets`, SLA/OLA, catálogo, operación y estabilidad de `shared/lib`.

**Lourdes — configuración de plataforma, consolas técnica/área/solicitante y UI compartida**  
Módulos: configuración en `plataforma`, `tickets`, `servicios` y `conocimiento`; `perfiles/tecnico`, `perfiles/gestor-area`, `perfiles/solicitante`; `shared/components`. Rutas: `/plataforma/admin/menu`, `/plataforma/admin/notificaciones`, `/plataforma/admin/tickets-formularios`, `/plataforma/admin/tickets-vistas`, `/plataforma/admin/conocimiento-config`, `/plataforma/admin/procesos/incidentes`, `/plataforma/admin/procesos/solicitudes`, `/plataforma/perfiles/tecnico/**`, `/plataforma/perfiles/gestor-area/**`, `/plataforma/perfiles/solicitante/panel`. APIs: `/api/menu`, `/api/admin/categorias`, `/api/admin/configuracion`, `/api/admin/notificaciones/reglas`, `/api/perfiles/tecnico`, `/api/perfiles/gestor-area`. Regla: el catálogo se consume desde `servicios/ui`; no se reimplementa.

**Alexis — problemas, conocimiento y reportes**  
Módulos: `problemas`, `conocimiento`, `reportes`. Rutas: `/plataforma/problemas/**`, `/gestor-problemas/**`, `/admin/procesos/problemas/**`, `/conocimiento/**`, `/admin/conocimiento-config`, `/reportes/**`, `/dashboard`. APIs: `/api/problemas`, `/api/conocimiento`, `/api/admin/conocimiento`, `/api/reportes/indicadores`. Regla: KPIs con SQL propio o servicios de indicadores; no imports profundos de `tickets`, `cambios` o `activos`. Los 9 reportes no se duplican.

**Nain — cambios, activos, CMDB, proveedores y consola de cambios**  
Módulos: `cambios`, `activos`, `cmdb`, `proveedores`, `perfiles/gestor-cambios`. Rutas: `/plataforma/cambios/**`, `/cambios/gestion/**`, `/admin/procesos/cambios/**`, `/activos/**`, `/gestor-activos/**`, `/admin/activos-config/**`, `/activos/cmdb/**`, `/gestor-activos/cmdb/**`, `/proveedores`, `/perfiles/gestor-cambios/**`. APIs: `/api/cambios`, `/api/activos`, `/api/gestor-activos`, `/api/admin/activos-config`, `/api/cmdb`, `/api/proveedores`, `/api/perfiles/gestor-cambios`. Regla: umbral de monto en `shared/lib/parametros`; Activo↔CI por dato; consola sin lógica de dominio.

**Junior — identidades, organización y consola de auditoría**  
Módulos: `identidades`, `organizacion`, `perfiles/auditor`. Rutas: `/plataforma/admin/usuarios`, `/admin/perfiles`, `/admin/departamentos`, `/admin/departamentos-empresa`, `/admin/tecnicos`, `/perfiles/auditor/**`. APIs: `/api/usuarios`, `/api/identidades/perfiles`, `/api/departamentos-ti`, `/api/departamentos-empresa`, `/api/tecnicos`, `/api/admin/tecnicos/ausencias`, `/api/perfiles/auditor`. Regla: `seguridad` no es suya; la auditoría CMDB vive en `cmdb` y las bajas en `activos`.

### 4.4. Propiedad compartida
| Carpeta | Responsable | Regla |
| :--- | :--- | :--- |
| `src/shared/lib/**` | Miguel | PR obligatorio; no duplicar guards, DB ni utilidades. |
| `src/shared/components/**` | Lourdes | Componentes reutilizables; no copias locales. |
| `src/shared/types/**` | Miguel | Tipos globales; los de dominio viven en su módulo. |
| `src/app/api/**` | Dueño del módulo | Solo monta el controlador; sin lógica. |
| `db/migrations/**` | Miguel + dueño del dato | Numeración, seed y revisión. |
| `db/seed.sql` | Miguel + dueños | Refleja catálogos, menú y datos maestros. |
| `opciones_menu` / `opciones_menu_perfiles` | Lourdes + Miguel | Ver sección 5.7. |
---

## 5. Reglas de aislamiento y dependencias
### 5.1. Permitido y prohibido
| Situación | Permitido | Prohibido |
| :--- | :--- | :--- |
| Consumir otro módulo | `import { x } from "@/modules/<modulo>"` | `@/modules/<modulo>/services/...` o `/components/...` |
| Consumir UI | `@/modules/<modulo>/ui` si existe | Importar una vista/componente no publicado |
| Transversal | `@/shared/lib/*`, `@/shared/components/*`, `@/shared/types` | `shared` importando `modules` |
| `tickets` | `@/modules/tickets` y `/ui` | Cualquier ruta profunda |
| `servicios` | `@/modules/servicios` y `/ui` | Copiar catálogo o duplicar lógica |
| `reportes` | `@/modules/reportes` y `/ui` | Crear reportes en otro módulo |
| Datos de otro dominio | SQL de lectura acotado en el servicio propio | Importar repositorios internos |
| Dependencia | Grafo acíclico hacia contratos estables | Ciclos o `perfiles` como proveedor de dominio |
### 5.2. Contratos `index.ts` y `ui.ts`
1. `index.ts` es el contrato de servidor: servicios, tipos y handlers.
2. `ui.ts` es el contrato de cliente: solo componentes; no importa DB, controladores ni lógica de servidor.
3. Un módulo expone lo que otros necesitan, no todo. Si falta algo, se amplía el contrato con revisión del dueño.
4. Cambiar un contrato es cambio de API interna: se actualizan todos los consumidores en el mismo PR.
5. No se publican tipos internos solo para evitar errores de TypeScript; se corrige el diseño.

### 5.3. Núcleo congelado `tickets`
- Dueño: Miguel; revisión obligatoria.
- Consumidores: `incidentes`, `solicitudes`, `cambios`, `problemas`, consolas y `src/app`.
- Incidentes y solicitudes **no reimplementan** máquina de estados, comentarios, prioridad ni detalle; reutilizan el contrato y especializan por tipo.
- Prohibido: segunda tabla base de tickets, segundo servicio de prioridad o segundo flujo de comentarios.
- Los cambios de modelo van por migración y se reflejan en `tickets`, no en cada frente.

### 5.4. Capa transversal `shared`
- `db.ts`: pool y acceso PostgreSQL; `auth.ts`: JWT, cookies y sesión; `capacidades.ts`: RBAC semántico (`dominio:acción`).
- `api-auth.ts`: **único** guard de APIs (`sesionConCapacidad`, `autorizarApi`, `obtenerSesionDeRequest`).
- `page-auth.ts`: guards de páginas; `errores.ts`: `ErrorDominio` y `respuestaError`; `parametros.ts`: constantes como `UMBRAL_MONTO_APROBACION`.
- **Prohibido** crear `api/guardia.ts`, `api/guardiaGestor.ts` o equivalentes. Si un endpoint necesita sesión + capacidad, importa el guard compartido.

### 5.5. Errores y validaciones
Los errores de dominio se envuelven con `ErrorDominio`; las APIs responden con `respuestaError` y códigos 400/401/403/404/409/500. Las validaciones viven en el módulo dueño; no se confía en el cliente. No se exponen SQL, rutas internas ni datos personales. SoD, SLA, aprobaciones y transiciones se validan en servidor.

### 5.6. Datos, migraciones y seed
1. Migración nueva en `db/migrations/YYYYMMDD_descripcion.sql`; no se edita una aplicada.
2. `db/seed.sql` se actualiza en el mismo cambio si hay catálogos, menús, perfiles o datos maestros.
3. La numeración vigente llega a `20261022_fase4_modulo_reportes.sql`; el siguiente usa el número libre (p. ej. `20261023_...`).
4. Se prueba en base limpia y en base existente; se anuncia en daily para evitar colisiones.
5. No se eliminan datos históricos por conveniencia.

### 5.7. Menú: `opciones_menu` y `opciones_menu_perfiles`
`opciones_menu` es el catálogo maestro; `opciones_menu_perfiles` solo guarda visibilidad. `url_menu = ''` significa carpeta; un valor significa página. No se agregan URLs duplicadas ni rutas sin página. Toda ruta nueva actualiza catálogo, perfiles y seed; toda ruta eliminada se retira de ambos. Las rutas legadas redirigen; no se mantienen dos pantallas para lo mismo.

```sql
-- Duplicados de URL
SELECT url_menu, COUNT(*) AS repeticiones
FROM opciones_menu WHERE url_menu <> ''
GROUP BY url_menu HAVING COUNT(*) > 1;

-- Opciones sin perfil (informativo; puede ser decisión consciente)
SELECT o.id_opcion, o.nombre, o.url_menu
FROM opciones_menu o
LEFT JOIN opciones_menu_perfiles p ON p.id_opcion = o.id_opcion
WHERE o.activo = true AND p.id_opcion IS NULL;
```

### 5.8. Matriz de dependencias permitidas
| Módulo | Puede consumir | No debe consumir |
| :--- | :--- | :--- |
| `tickets` | `shared`, `servicios` (catálogo por contrato) | `perfiles`, `incidentes`, `solicitudes` |
| `incidentes` | `tickets`, `shared`, `servicios` | `perfiles`, rutas internas de `tickets` |
| `solicitudes` | `tickets`, `shared`, `servicios` | `perfiles`, rutas internas de `tickets` |
| `cambios` | `shared`, `cmdb` (por contrato), `servicios` | `perfiles`, `activos` por ruta profunda |
| `problemas` | `shared`, `tickets`, `conocimiento` | `perfiles`, `cambios` por ruta profunda |
| `perfiles/*` | Contratos de dominio, `shared/components` | Lógica de dominio propia |
| `servicios` | `shared`, `tickets` (lectura por contrato) | `perfiles`, `reportes` |
| `activos` | `shared`, `organizacion` (por contrato) | `cmdb` por código (usar dato) |
| `cmdb` | `shared`, `activos` (por dato) | `perfiles` |
| `reportes` | `shared`; SQL de lectura acotado | Rutas profundas de dominios |
| `identidades` | `shared`, `seguridad` | `perfiles` |
| `organizacion` | `shared` | `identidades` por ruta profunda |
| `proveedores` | `shared` | `activos` por ruta profunda |
Si una dependencia genera ciclo, se resuelve por dato, evento o servicio compartido, no por importación cruzada.

### 5.9. Deuda técnica conocida
Algunos cascarones de `src/app` aún importan vistas por ruta profunda (por ejemplo, páginas de `activos` o `cambios`). Es deuda heredada: **no se amplía** y se corrige al tocar esa ruta. Un PR que agregue una ruta profunda nueva se rechaza aunque compile.

---

## 6. Flujo Git y calidad
### 6.1. Ramas
| Rama | Tipo | Uso |
| :--- | :--- | :--- |
| `main` | Protegida | Integración estable; solo Miguel integra PR revisados. |
| `feature/alexis-problemas-conocimiento` | Protegida | Integración del frente de Alexis. |
| `prueba-conexion` | Protegida | Validación de conexión/despliegue. |
| `verify-junior` | Protegida | Verificación del frente de Junior. |
| `feature/<integrante>-<frente>` | Trabajo | Rama corta por funcionalidad; se integra por PR. |
Nombres de referencia: `feature/miguel-nucleo-servicios-sla`, `feature/lourdes-config-tecnico`, `feature/alexis-problemas-conocimiento`, `feature/nain-cambios-activos-cmdb`, `feature/junior-identidades-organizacion-auditor`. No se crean ramas por archivo ni por tarea trivial; una rama tiene un objetivo verificable y dura lo mínimo.

### 6.2. Rutina diaria antes de programar
```bash
git checkout main
git pull origin main
git checkout <tu-rama>
git merge main
npx tsc --noEmit
```

Los conflictos se resuelven en tu rama, no en `main`, y se avisa al dueño del archivo afectado.

### 6.3. Convención de commits
| Tipo | Uso | Ejemplo |
| :--- | :--- | :--- |
| `feat(<modulo>)` | Funcionalidad nueva | `feat(servicios): agrega ciclo de vida` |
| `fix(<modulo>)` | Corrección | `fix(tickets): valida transición a resuelto` |
| `refactor(<modulo>)` | Reestructuración | `refactor(reportes): centraliza vistas` |
| `docs(<tema>)` | Documentación | `docs(equipo): actualiza plan y rutas` |
| `chore(<tema>)` | Mantenimiento | `chore(seed): sincroniza catálogo` |
| `test(<modulo>)` | Pruebas | `test(cambios): cubre PIR obligatorio` |
Mensaje en español, sin emojis, imperativo, alcance entre paréntesis y una idea por commit. No se mezcla refactor masivo con funcionalidad.

### 6.4. Flujo de PR
1. Rama sincronizada con `main`.
2. `npx tsc --noEmit` y `npm run build` en verde.
3. Diff revisado: solo archivos propios o cambios acordados.
4. PR con plantilla (sección 8.4).
5. Revisa el dueño; si toca `shared/lib` o `tickets`, revisa Miguel.
6. Se corrige en la misma rama; no se fuerza push sobre `main`.
7. Merge no destructivo y propagación a las 4 ramas.

### 6.5. Propagación a las 4 ramas
```bash
git checkout main
git pull origin main
git merge --no-ff feature/<rama>
git push origin main

git checkout feature/alexis-problemas-conocimiento
git merge main && git push origin feature/alexis-problemas-conocimiento

git checkout prueba-conexion
git merge main && git push origin prueba-conexion

git checkout verify-junior
git merge main && git push origin verify-junior
```

**Criterio:** ninguna de las 4 ramas queda atrás. Si una falla al compilar tras el merge, se detiene la propagación y se corrige antes de continuar.

### 6.6. Quality gates
| Gate | Comando | Criterio |
| :--- | :--- | :--- |
| Tipado | `npx tsc --noEmit` | 0 errores. |
| Build | `npm run build` | Compila y genera rutas sin errores. |
| Contratos | Revisión | Sin imports profundos nuevos entre módulos. |
| Guards | Búsqueda/revisión | Sin guards duplicados. |
| Datos | Base limpia | Migración aplica y seed carga. |
| Menú | Consultas 5.7 | Sin URLs duplicadas ni opciones rotas. |
| Regresión | Smoke | Rutas del frente responden sin bucles. |
No se acepta “compila en mi máquina” como evidencia; el PR incluye salida o captura.

### 6.7. Reglas de convivencia en Git
1. No `push` directo a `main` salvo la integración de Miguel.
2. No `push --force` a ramas protegidas.
3. No se commitean `.env`, credenciales, `node_modules`, `.next` ni temporales.
4. No se borran archivos de otro dueño para “limpiar”.
5. No se resuelve un conflicto aceptando todo de una rama sin revisar.
6. Un cambio que toca dos dominios se parte en dos PR o se acuerda uno conjunto.
7. Migración y seed se revisan antes de commitear; un error afecta a todos.

---

## 7. Plan de sprints y ceremonias
### 7.1. Cadencia
| Ceremonia | Cuándo | Duración | Salida |
| :--- | :--- | :--- | :--- |
| Sprint Planning | Inicio | 60–90 min | Sprint Goal, backlog comprometido, responsables. |
| Daily Scrum | Cada día | 15 min | Avance, plan, impedimentos. |
| Refinamiento | Mitad | 30–45 min | HU listas (DoR), dudas, riesgos. |
| Sprint Review | Fin | 45 min | Demo de rutas y evidencia. |
| Retrospectiva | Fin | 30–45 min | 2–3 acciones con dueño y fecha. |
Sprints de **una semana** para integración frecuente y propagación a las 4 ramas. Si la carga académica lo exige, se acuerda uno de dos semanas en planning; no se extiende sin decisión.

### 7.2. Historial y estado
| Sprint | Objetivo | Estado |
| :--- | :--- | :--- |
| Sprint 1 | Cimientos: Next.js, PostgreSQL, login, RBAC, layout y catálogos base. | Cerrado |
| Sprint 2 | Operación central: tickets, colas, comentarios, formularios, activos y conocimiento. | Cerrado |
| Sprint 3 | Gobierno ITIL: SLA, aprobaciones SoD, problemas/RCA, cambios/CAB, auditoría. | Cerrado |
| Sprint 4 | Calidad: CSAT, reapertura, PIR, exportación, pruebas integrales. | Cerrado |
| Sprint 5 | Consolidación modular: fases 2–4, contratos, rutas y reportes centralizados. | **Actual** |
| Sprint 6 | Endurecimiento funcional por dominio y regresión completa. | Planificado |
| Sprint 7 | Cierre académico: documentación, demo, defensa y congelamiento. | Planificado |
### 7.3. Sprint 5 — Consolidación modular (actual)
**Sprint Goal:** dejar el repositorio coherente tras separar incidentes/solicitudes, mover catálogos a `servicios` y centralizar reportes, sin romper menú, seed ni contratos.

| Integrante | Compromiso | Evidencia |
| :--- | :--- | :--- |
| Miguel | Verificar contrato `tickets`, rutas de incidentes/solicitudes, catálogo en `servicios`, SLA y consolas de supervisión/aprobador. | `tsc` + `build`; smoke; PR de contrato. |
| Lourdes | Ajustar configuración y consolas técnica/área para consumir `servicios/ui` y `reportes/ui`. | Formularios guardan; consolas cargan; sin imports profundos nuevos. |
| Alexis | Consolidar los 9 reportes, verificar redirecciones legadas y KPIs en `reportes`. | 9 rutas responden; legadas redirigen; sin reportes duplicados. |
| Nain | Verificar cambios/activos/CMDB/proveedores y consola de gestor de cambios. | RFC/CAB/PIR y CMDB sin regresiones. |
| Junior | Verificar identidades/organización/auditoría y ficha RBAC en `identidades`. | Altas/bajas lógicas, perfiles y consola auditora operativas. |
**Entregable:** ramas sincronizadas, menú y seed consistentes, matriz de rutas verificadas.

### 7.4. Sprint 6 — Endurecimiento funcional
| Frente | Objetivo | Criterio |
| :--- | :--- | :--- |
| `servicios` | Ciclo de vida, OLA, catálogo por perfil y SLA. | Servicio borrador→activo→retiro; SLA y matriz aplican. |
| `incidentes` / `solicitudes` | Colas, prioridad, aprobaciones y cierre. | Transiciones válidas; SoD; sin tablas paralelas. |
| `cambios` | CAB/ECAB, freeze, colisiones, PIR y modelos estándar. | RFC normal no se agenda en freeze; PIR obligatorio. |
| `problemas` | RCA, KEDB, vínculo con incidentes y workaround. | Problema no cierra sin RCA/workaround. |
| `conocimiento` | Búsqueda, votos, revisión y vencimiento. | Artículo no publicado no visible al solicitante. |
| `reportes` | KPIs, filtros, exportación y tableros por perfil. | Reporte exporta y coincide con la fuente. |
| `activos` / `cmdb` | ITAM, licencias, bajas, topología e impacto. | Activo/CI vinculado; impacto visible. |
| `identidades` / `organizacion` | Ciclo de cuenta, recertificación, turnos y capacidad. | Baja lógica; recertificación evidenciada. |
| `plataforma` / `tickets` | Versionado/publicación de formularios y reglas. | Publicar no rompe tickets existentes. |
### 7.5. Sprint 7 — Cierre
1. Regresión completa de rutas por perfil.
2. Migraciones en base limpia y base existente.
3. Menú y seed contra `MENUS_Y_PERFILES.md`.
4. `TRAZABILIDAD.md` con evidencia.
5. Demo guiada: solicitante → técnico → supervisor → gestor de cambios → auditor.
6. Congelamiento de cambios no críticos y defensa.

### 7.6. Definition of Ready (DoR)
Una historia entra al sprint solo si tiene HU/RF/RN y criterio verificable; dueño, ruta y API definidos; decisión sobre migración/seed/menú; dependencias de contrato acordadas; tamaño estimable; y prioridad del PO.

### 7.7. Definition of Done (DoD)
1. Código en la rama del dueño y contratos respetados.
2. `npx tsc --noEmit` y `npm run build` en verde.
3. Ruta funciona con el perfil correspondiente, sin errores de consola.
4. Reglas críticas validadas en servidor.
5. Sin imports profundos nuevos ni guards duplicados.
6. Migración y seed sincronizados, si aplica.
7. Menú y visibilidad por perfil actualizados, si aplica.
8. PR revisado por el dueño o el Tech Lead.
9. Evidencia en acta o `TRAZABILIDAD.md`.
10. Las 4 ramas protegidas sincronizadas.

### 7.8. Estimación y seguimiento
Se estima por tamaño relativo (S/M/L) y riesgo, no por horas ficticias. Un ítem L se divide antes del sprint. Tablero: Backlog, Listo, En curso, En revisión, Hecho. Se mide ítems completados, PR integrados, rutas verificadas y bloqueos; no se inventan velocidades. WIP máximo: 2 ítems por persona.

---

## 8. Plantillas de trabajo
### 8.1. Daily Scrum
| Fecha y sprint | Duración | Participantes | Facilitador |
| :--- | :--- | :--- | :--- |
| | 15 min | Miguel, Lourdes, Alexis, Nain, Junior | Miguel (o quien rote) |

| Integrante | 1. ¿Qué hice desde el último daily? | 2. ¿Qué haré hoy? | 3. ¿Impedimentos? |
| :--- | :--- | :--- | :--- |
| Miguel | | | |
| Lourdes | | | |
| Alexis | | | |
| Nain | | | |
| Junior | | | |

Regla: mencionar módulo, ruta o HU/RN; nada de “avancé”. El impedimento se registra con dueño y fecha.

### 8.2. Ejemplo de acta (2026-10-19)
- **Sprint:** 5 — Consolidación modular. **Duración:** 14 min. **Participantes:** Miguel, Lourdes, Alexis, Nain, Junior.

| Integrante | ¿Qué hice? | ¿Qué haré hoy? | Impedimentos |
| :--- | :--- | :--- | :--- |
| Miguel | Verifiqué contrato de `tickets` y rutas de incidentes/solicitudes tras fase 2. | Revisar que `servicios` sea la única fuente del catálogo. | Ninguno. |
| Lourdes | Revisé formularios y consolas técnica/área. | Consumir `servicios/ui` y `reportes/ui` sin imports profundos. | Confirmar contrato de reportes con Alexis. |
| Alexis | Revisé las 9 pantallas de `reportes` y redirecciones legadas. | Validar que ninguna consola duplique reportes. | Ninguno. |
| Nain | Revisé consola de gestor de cambios y dependencia de `cambios`. | Validar RFC/CAB/PIR y CMDB sin imports profundos. | Ninguno. |
| Junior | Revisé identidades, organización y consola de auditoría. | Verificar ficha RBAC en `identidades`. | Ninguno. |

### 8.3. Retrospectiva
| Bloque | Pregunta | Acciones |
| :--- | :--- | :--- |
| Start | ¿Qué empezar? | |
| Stop | ¿Qué dejar? | |
| Continue | ¿Qué mantener? | |
| Riesgos | ¿Qué puede romper el próximo sprint? | |

| Acción | Dueño | Fecha | Evidencia |
| :--- | :--- | :--- | :--- |
| | | | |

Máximo 3 acciones. Si no tiene dueño ni fecha, no existe.

### 8.4. Plantilla de PR
```text
Título: feat(<modulo>): <descripción corta>

## Qué cambia
- ...

## Módulos y rutas afectadas
- Módulo:
- Rutas:
- API:

## Verificación
- [ ] npx tsc --noEmit
- [ ] npm run build
- [ ] Smoke de rutas
- [ ] Sin imports profundos nuevos
- [ ] Sin guards duplicados
- [ ] Migración + seed (si aplica)
- [ ] Menú actualizado (si aplica)

## Riesgos y rollback
- ...

## Evidencia
- ...
```

---

## 9. Prompts para asistentes de IA
### 9.1. Reglas comunes
Todos los prompts comparten: leer este plan y el documento canónico del dominio; lógica en `src/modules`; `src/app` solo monta; no editar módulos ajenos; importar solo por contrato; usar `shared/lib/api-auth`; usar `ErrorDominio`/`respuestaError`; actualizar migración, seed y menú; verificar `tsc` y `build`; español, sin emojis ni `any` innecesario; cambios pequeños con práctica ITIL/ISO explicada.

### 9.2. Miguel
```text
Actúa como Tech Lead del núcleo de FlowDesk ITSM (Next.js 14 + TypeScript + PostgreSQL).
Lee PLAN_EQUIPO_Y_SCRUM.md, ARQUITECTURA_Y_CODIGO.md, MENUS_Y_PERFILES.md,
REQUERIMIENTOS.md, HISTORIAS_DE_USUARIO.md y TRAZABILIDAD.md.
Responsable: tickets (núcleo congelado), incidentes, solicitudes, seguridad, plataforma,
servicios, operacion, perfiles/supervisor, perfiles/aprobador, perfiles/administrador y shared/lib.
Rutas: /plataforma/tickets/**, /incidentes/**, /solicitudes/**, /servicios/catalogo,
/admin/servicios/**, /operacion/**, /perfiles/supervisor/**, /perfiles/aprobador/**.
APIs: /api/tickets, /api/incidentes, /api/solicitudes, /api/servicios, /api/admin/sla,
/api/operacion, /api/perfiles/supervisor, /api/perfiles/aprobador.
Reglas: 1) no dupliques el ciclo base de tickets; 2) no cambies su contrato sin actualizar
consumidores; 3) el catálogo es de servicios; 4) usa @/shared/lib/api-auth, no crees guards;
5) no toques módulos ajenos; 6) migración + seed + menú; 7) verifica tsc y build.
Entrega: objetivo, rutas/contratos, migración/seed/menú, verificación y riesgos.
```

### 9.3. Lourdes
```text
Actúa como líder de frontend de FlowDesk ITSM (Next.js 14 + TypeScript + PostgreSQL).
Lee PLAN_EQUIPO_Y_SCRUM.md, ARQUITECTURA_Y_CODIGO.md, MENUS_Y_PERFILES.md,
REQUERIMIENTOS.md, HISTORIAS_DE_USUARIO.md, PROMPTS_CONFIGURACION_ADMIN.md y CATALOGO_SERVICIOS_DATOS.md.
Responsable: configuracion, perfiles/tecnico, perfiles/gestor-area, perfiles/solicitante y shared/components.
Rutas: /plataforma/admin/menu, /notificaciones, /tickets-formularios, /tickets-vistas,
/conocimiento-config, /admin/procesos/incidentes, /admin/procesos/solicitudes,
/perfiles/tecnico/**, /perfiles/gestor-area/**, /perfiles/solicitante/panel.
APIs: /api/menu, /api/admin/categorias, /api/admin/configuracion,
/api/admin/notificaciones/reglas, /api/perfiles/tecnico, /api/perfiles/gestor-area.
Reglas: 1) catálogo por @/modules/servicios/ui; 2) reportes por @/modules/reportes/ui;
3) consolas solo alcance y UI; 4) reutiliza @/shared/components/admin; 5) no toques
tickets/incidentes/solicitudes/cambios/problemas/activos/cmdb; 6) menú + seed coherentes;
7) verifica tsc y build.
Entrega: pantalla/consola, rutas, contratos consumidos, verificación y riesgos de UX.
```

### 9.4. Alexis
```text
Actúa como desarrollador de Problemas, Conocimiento y Medición (CSI) de FlowDesk ITSM
(Next.js 14 + TypeScript + PostgreSQL).
Lee PLAN_EQUIPO_Y_SCRUM.md, ARQUITECTURA_Y_CODIGO.md, REQUERIMIENTOS.md,
HISTORIAS_DE_USUARIO.md, TRAZABILIDAD.md y MENUS_Y_PERFILES.md.
Responsable: problemas, conocimiento y reportes.
Rutas: /plataforma/problemas/**, /problemas/kedb, /gestor-problemas/**,
/admin/procesos/problemas/**, /plataforma/conocimiento/**, /admin/conocimiento-config,
/plataforma/reportes/**, /plataforma/dashboard.
APIs: /api/problemas, /api/conocimiento, /api/admin/conocimiento, /api/reportes/indicadores.
Reglas: 1) RCA/KEDB en problemas; 2) los 9 reportes viven en reportes y las legadas redirigen;
3) KPIs con SQL acotado, sin rutas profundas; 4) flujo editorial completo; 5) no toques
módulos ajenos ni el núcleo; 6) migración + seed + menú; 7) verifica tsc y build.
Entrega: práctica ITIL/ISO, rutas, consultas/KPIs, verificación y riesgos.
```

### 9.5. Nain
```text
Actúa como desarrollador de Change Enablement, ITAM/SAM, CMDB y Proveedores de FlowDesk ITSM
(Next.js 14 + TypeScript + PostgreSQL).
Lee PLAN_EQUIPO_Y_SCRUM.md, ARQUITECTURA_Y_CODIGO.md, REQUERIMIENTOS.md,
HISTORIAS_DE_USUARIO.md, TRAZABILIDAD.md y MENUS_Y_PERFILES.md.
Responsable: cambios, activos, cmdb, proveedores y perfiles/gestor-cambios.
Rutas: /plataforma/cambios/**, /cambios/gestion/**, /admin/procesos/cambios/**,
/plataforma/activos/**, /gestor-activos/**, /admin/activos-config/**, /activos/cmdb/**,
/gestor-activos/cmdb/**, /plataforma/proveedores, /plataforma/perfiles/gestor-cambios/**.
APIs: /api/cambios, /api/activos, /api/gestor-activos, /api/admin/activos-config,
/api/cmdb, /api/proveedores, /api/perfiles/gestor-cambios.
Reglas: 1) consola de cambios sin lógica de dominio; 2) Activo↔CI por dato;
3) umbral de monto en @/shared/lib/parametros; 4) no dupliques aprobaciones;
5) no toques tickets/incidentes/solicitudes/problemas/seguridad; 6) migración + seed + menú;
7) verifica tsc y build.
Entrega: flujo RFC/CAB/PIR o ITAM/CMDB, rutas, datos, verificación y riesgos.
```

### 9.6. Junior
```text
Actúa como desarrollador de IAM, Organización y Auditoría de FlowDesk ITSM
(Next.js 14 + TypeScript + PostgreSQL).
Lee PLAN_EQUIPO_Y_SCRUM.md, ARQUITECTURA_Y_CODIGO.md, REQUERIMIENTOS.md,
HISTORIAS_DE_USUARIO.md, TRAZABILIDAD.md y MENUS_Y_PERFILES.md.
Responsable: identidades, organizacion y perfiles/auditor.
Rutas: /plataforma/admin/usuarios, /admin/perfiles, /admin/departamentos,
/admin/departamentos-empresa, /admin/tecnicos, /plataforma/perfiles/auditor/**.
APIs: /api/usuarios, /api/identidades/perfiles, /api/departamentos-ti,
/api/departamentos-empresa, /api/tecnicos, /api/admin/tecnicos/ausencias, /api/perfiles/auditor.
Reglas: 1) seguridad no es tuya, consume su contrato; 2) ficha RBAC en identidades;
3) auditoría CMDB en cmdb y bajas en activos; 4) baja lógica sin borrar historial;
5) no toques módulos ajenos ni el núcleo; 6) migración + seed + menú; 7) verifica tsc y build.
Entrega: control/cláusula ISO, rutas, datos, verificación y riesgos.
```

---

## 10. Criterios de aceptación y verificación
### 10.1. Criterios funcionales y de arquitectura
| ID | Criterio | Evidencia |
| :--- | :--- | :--- |
| CA-01 | Cumple HU y RN asociadas. | Guion de prueba + acta/captura. |
| CA-02 | Estados y transiciones válidos, validados en servidor. | Prueba de transición inválida rechazada. |
| CA-03 | Permisos por perfil/capacidad respetados. | Prueba autorizado/no autorizado. |
| CA-04 | Datos guardados y recuperados sin pérdida. | Consulta SQL o recarga. |
| CA-05 | Errores útiles, sin datos internos. | Prueba de validación fallida. |
| CA-06 | Ruta no rompe menú ni navegación. | Smoke por perfil. |
| AR-01 | Lógica en `src/modules`, no en `src/app`. | Diff revisado. |
| AR-02 | Sin imports profundos nuevos. | Revisión/búsqueda. |
| AR-03 | Contrato `index.ts`/`ui.ts` correcto. | Diff revisado. |
| AR-04 | Sin guards ni utilidades duplicadas. | Búsqueda. |
| AR-05 | `shared` no importa módulos. | Búsqueda en `src/shared`. |
| AR-06 | Sin ciclos de dependencia. | Revisión de imports. |
### 10.2. Criterios de datos, seguridad y menú
| ID | Criterio | Evidencia |
| :--- | :--- | :--- |
| DA-01 | Migración nueva, no editada, número libre. | Archivo en `db/migrations`. |
| DA-02 | `seed.sql` sincronizado. | Diff y base limpia. |
| DA-03 | Migración funciona en base existente. | Prueba de actualización. |
| DA-04 | No se borran datos históricos por conveniencia. | Revisión de `DELETE`/`DROP`. |
| DA-05 | Catálogos y menú sin duplicados. | Consultas 5.7. |
| SE-01 | Endpoint con `sesionConCapacidad`/`autorizarApi`. | Código + 401/403. |
| SE-02 | No se confía en perfil del cliente. | Revisión de controlador. |
| SE-03 | Sin secretos, SQL ni rutas internas en errores. | Revisión. |
| SE-04 | SoD y aprobaciones en servidor. | Autoaprobación rechazada. |
| SE-05 | Sin credenciales ni `.env` en el diff. | Revisión. |
| ME-01 | Ruta nueva en `opciones_menu`. | SQL. |
| ME-02 | Perfil correcto en `opciones_menu_perfiles`. | SQL. |
| ME-03 | Sin URLs duplicadas ni opciones sin página. | SQL. |
| ME-04 | Carpetas con `url_menu = ''`. | SQL. |
| ME-05 | Seed reproduce el menú en base limpia. | Carga + smoke. |
### 10.3. Aceptación por frente
| Frente | Criterio mínimo |
| :--- | :--- |
| `tickets` / `incidentes` / `solicitudes` | Bandeja, detalle, comentarios, transiciones, prioridad y permisos; sin tablas ni flujos duplicados. |
| `servicios` | Catálogo, SLA, matriz y workflow coherentes; catálogo único. |
| `cambios` | RFC, CAB/ECAB, calendario/freeze y PIR con reglas de servidor. |
| `problemas` | Problema vinculado a incidentes, RCA, KEDB y workaround. |
| `conocimiento` | Flujo editorial y visibilidad por estado. |
| `reportes` | 9 rutas activas, legadas redirigen, KPIs consistentes. |
| `activos` / `cmdb` | Inventario, licencias, bajas, topología e impacto. |
| `identidades` / `organizacion` | Usuarios, perfiles, departamentos, técnicos y baja lógica. |
| `plataforma` / `tickets` | Menú, formularios, vistas, notificaciones y reglas sin romper tickets existentes. |
### 10.4. Checklist y smoke
```text
[ ] npx tsc --noEmit
[ ] npm run build
[ ] Smoke de ruta principal y de error
[ ] Prueba con perfil autorizado y no autorizado
[ ] Sin imports profundos nuevos
[ ] Sin guards duplicados
[ ] Migración + seed + menú (si aplica)
[ ] Sin secretos ni temporales
[ ] Evidencia en el PR
```

| Perfil | Ruta mínima |
| :--- | :--- |
| Administrador | `/plataforma/admin/menu`, `/admin/usuarios`, `/admin/servicios` |
| Técnico | `/plataforma/perfiles/tecnico/panel`, `/incidentes/asignados`, `/solicitudes/asignados` |
| Solicitante | `/plataforma/perfiles/solicitante/panel`, `/solicitudes/mios`, `/servicios/catalogo` |
| Supervisor | `/plataforma/perfiles/supervisor/panel`, `/perfiles/supervisor/sla/semaforo` |
| Gestor de área | `/plataforma/perfiles/gestor-area/panel`, `/perfiles/gestor-area/aprobaciones/historial` |
| Auditor | `/plataforma/perfiles/auditor/panel`, `/perfiles/auditor/informes` |
| Aprobador | `/plataforma/perfiles/aprobador/panel`, `/perfiles/aprobador/cab/agenda` |
| Gestor de cambios | `/plataforma/perfiles/gestor-cambios/panel`, `/cambios/gestion/calendario` |
| Gestor de activos | `/plataforma/gestor-activos/panel`, `/activos/cmdb/analisis` |
| Gestor de problemas | `/plataforma/gestor-problemas/panel`, `/problemas/kedb` |
---

## 11. Riesgos y acuerdos
### 11.1. Riesgos
| Riesgo | Prob. | Impacto | Mitigación |
| :--- | :---: | :---: | :--- |
| Nain concentra demasiada superficie. | Alta | Alto | Apoyo por PR, priorización del PO, no ampliar alcance sin planning. |
| Deriva del contrato `tickets`. | Media | Alto | Revisión de Miguel; consumidores actualizados en el mismo PR. |
| Imports profundos nuevos. | Media | Alto | Checklist; rechazo aunque compile. |
| Guards duplicados. | Media | Medio | Usar `shared/lib/api-auth`; búsqueda en revisión. |
| Colisión de migraciones/seed. | Media | Alto | Reserva de número, revisión y base limpia. |
| Menú roto por rutas nuevas. | Media | Alto | Migración + catálogo + perfiles + consultas. |
| Ramas protegidas desincronizadas. | Alta | Medio | Propagación obligatoria a las 4 ramas. |
| Duplicación de reportes/catálogos. | Media | Medio | Fuente única: `reportes` y `servicios`; legadas redirigen. |
| Consolas acumulan lógica de dominio. | Media | Alto | Regla inversa; PR rechazado si duplica dominio. |
| Retraso por dependencia entre módulos. | Media | Medio | Acordar contrato en refinamiento; desbloquear por dato/servicio. |
| Pérdida de evidencia para la defensa. | Baja | Medio | `TRAZABILIDAD.md` y actas al día. |
### 11.2. Acuerdos
| Acuerdo | Detalle |
| :--- | :--- |
| Propiedad | Cada uno edita su módulo; cambios cruzados por PR. |
| Revisión | Dueño revisa su dominio; Miguel revisa `tickets` y `shared/lib`. |
| Plazo de revisión | Máximo 24 horas hábiles; si no, se escala en daily. |
| Bloqueo | Si supera 30 minutos, se pide ayuda; no se queda en silencio. |
| Integración | Nada con `tsc` o `build` en rojo. |
| Ramas | `main` y las 3 protegidas siempre sincronizadas. |
| Migraciones | Se reservan y anuncian; nunca se edita una aplicada. |
| Menú | Toda ruta nueva actualiza catálogo, perfiles y seed. |
| Documentación | El cambio relevante se refleja en el documento canónico. |
| Lenguaje | Español, sin emojis, mensajes claros y sin culpar a personas. |
| Alcance | No se agrega funcionalidad “de paso”; va al backlog. |
| Cierre | Solo se cierra lo que cumple DoD y tiene evidencia. |
### 11.3. Escalamiento
1. Impedimento técnico de módulo: dueño del módulo.
2. Contrato o dependencia cruzada: Tech Lead.
3. Prioridad o alcance: Product Owner.
4. Conflicto de propiedad: Tech Lead + dueños implicados, en daily o refinamiento.
5. Riesgo de entrega: retrospectiva y ajuste del sprint; no se oculta.

El control de cambios de este documento es: PR + actualización de `TRAZABILIDAD.md`; los cambios de contrato se reflejan en `ARQUITECTURA_Y_CODIGO.md` antes o en el mismo PR.

---

## 12. Anexos
### A. Migración de rutas antiguas a actuales
| Ruta anterior | Ruta actual | Nota |
| :--- | :--- | :--- |
| `/plataforma/catalogo` | `/plataforma/servicios/catalogo` | Catálogo global; también filtrado por tipo. |
| `/plataforma/tickets/nuevo` | `/plataforma/incidentes/crear` o `/plataforma/solicitudes/crear` | Agente usa `/plataforma/tickets/gestion/crear`. |
| `/plataforma/tickets/gestion/incidentes` | `/plataforma/incidentes` | Redirección vigente. |
| `/plataforma/tickets/gestion/solicitudes` | `/plataforma/solicitudes` | Redirección vigente. |
| `/plataforma/tickets/reportes` | `/plataforma/reportes/operativos` | Redirección vigente. |
| `/plataforma/admin/reportes-disenador` | `/plataforma/reportes/tableros` | Redirección vigente. |
| `/plataforma/reportes` | `/plataforma/reportes/tableros` u `/operativos` | No hay índice único. |
| `/plataforma/usuarios` | `/plataforma/admin/usuarios` | Identidades. |
| `/plataforma/perfiles` (RBAC) | `/plataforma/admin/perfiles` | Ficha en `identidades`. |
| `/plataforma/departamentos` | `/plataforma/admin/departamentos` | Organización. |
| `/plataforma/tecnicos` | `/plataforma/admin/tecnicos` | Organización. |
| `/plataforma/auditoria` | `/plataforma/admin/auditoria-sistema` y `/perfiles/auditor/panel` | Sistema vs. consola auditora. |
| `/plataforma/encuestas` | Sin ruta equivalente | CSAT en el detalle/cierre (`TarjetaCalificacionCsat`). |
| `/tecnico/*`, `/supervisor/*`, `/gestor-area/*`, `/aprobador/*`, `/auditor/*`, `/gestor-cambios/*` | `/plataforma/perfiles/<rol>/*` | Alias eliminados. |
| `/incidentes/*`, `/solicitudes/*` | `/plataforma/incidentes/*`, `/plataforma/solicitudes/*` | La ruta canónica incluye `/plataforma`. |
### B. Qué se conservó de cada documento anterior
| Fuente | Aporte conservado | Actualización |
| :--- | :--- | :--- |
| `DISTRIBUCION_EQUIPO_Y_METODOLOGIA_SCRUM.md` | Equipo de 5, roles Scrum, HU/RF/RN, ceremonias, daily y prompts. | Rutas nuevas, módulos actuales, fases 2–4, contratos y verificación. |
| `PLAN_TRABAJO_5_INTEGRANTES_MODULOS_LIBRES.md` | Propiedad por módulo, regla inversa, reglas de contrato, estado ITIL y prompts. | `incidentes`, `solicitudes`, `servicios` y `reportes` dejan de ser “libres”. |
| `ARQUITECTURA_MODULAR_Y_CONTRATOS.md` | Aislamiento, `tickets` congelado, `shared`, guards y flujo Git. | Se resume y se enlaza; no se duplica. |
### C. Comandos útiles
```bash
git checkout main && git pull origin main
git checkout <tu-rama> && git merge main
npx tsc --noEmit
npm run build
git add . && git commit -m "feat(<modulo>): <descripcion>"
git push origin <tu-rama>
```

```powershell
# Revisión manual de imports profundos hacia módulos
Get-ChildItem src -Recurse -Include *.ts,*.tsx |
  Select-String -Pattern '@/modules/[a-z-]+/(services|components|views|api)/'
```

### D. Marco de referencia y evidencia
El proyecto se evalúa con **ITIL 4**, **ISO/IEC 20000-1**, **ISO/IEC 27001**, **ISO/IEC 19770-1** y **COBIT 2019**. Este plan no certifica: organiza el trabajo para evidenciar cada entrega.

| Marco | Evidencia |
| :--- | :--- |
| ITIL 4 | Incidentes, solicitudes, problemas, cambios, conocimiento, catálogo, SLA, activos y CMDB. |
| ISO/IEC 20000-1 | Gestión del servicio, cambios, configuración, capacidad y mejora. |
| ISO/IEC 27001 | Control de acceso, RBAC, logs, auditoría y evidencia. |
| ISO/IEC 19770-1 | Gestión de activos de software y licencias. |
| COBIT 2019 | Gobierno, roles, SoD, métricas y trazabilidad. |
**Evidencia mínima por sprint:** acta de planning, actas de daily, demo de review, retrospectiva, PR integrados y `TRAZABILIDAD.md` actualizado.

---

**Fin del documento.** Cualquier cambio de equipo, módulo, ruta o contrato se refleja aquí y en `TRAZABILIDAD.md`; no se mantienen versiones paralelas.
