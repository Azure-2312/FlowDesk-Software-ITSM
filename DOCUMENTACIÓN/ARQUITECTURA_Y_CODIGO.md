# Arquitectura y Código — FlowDesk ITSM

**Proyecto:** FlowDesk ITSM — Sistema de Gestión de Tickets y Servicios de TI  
**Versión:** 1.0 (documento canónico)  
**Fecha de corte:** 2026-10-20  
**Ámbito:** arquitectura modular, contratos, rutas, seguridad, modelo de datos, patrones de implementación, fases, calidad y despliegue.  
**Sustituye a:** `ARQUITECTURA_MODULAR_Y_CONTRATOS.md`, `ESQUEMA_ARQUITECTURA_MODULAR_DETALLADO.md`, `PROPUESTAS_ARQUITECTURA_Y_ESTRUCTURA.md`, `ARQUITECTURA_Y_JERARQUIA_SRC.md` y `DOCUMENTACION_COMPLETA_ARQUITECTURA_Y_CODIGO.md`.

> Este documento describe el repositorio real al 2026-10-20, no una propuesta. Los documentos sustituidos se conservan como histórico y no deben usarse para conteos, rutas ni contratos. Para menú y perfiles, el documento canónico complementario es `MENUS_Y_PERFILES.md`; para propiedad de módulos y Scrum, `PLAN_EQUIPO_Y_SCRUM.md`.

---
## 1. Propósito y cómo leer este documento

### 1.1. Qué resuelve

1. Explica cómo está organizado el código y por qué.
2. Fija los contratos públicos de cada módulo y las reglas de dependencia.
3. Ubica las rutas canónicas, las guardas de página y las guardas de API.
4. Documenta el modelo de datos vigente, incluido el Modelo C de tickets.
5. Resume las fases 2, 3 y 4 que separaron incidentes/solicitudes, centralizaron catálogos y reportes.
6. Define los quality gates y el flujo de migraciones/despliegue.
7. Deja explícita la deuda técnica para que no se confunda con diseño deseado.

No es un diccionario exhaustivo de las 207 rutas de API ni de las 126 tablas. Esos inventarios viven en el código, en la base de datos y en los anexos históricos indicados en la sección 14.

### 1.2. Regla de precedencia

Si hay contradicción entre documentos:

1. **Código y base de datos vigentes** mandan sobre conteos y nombres.
2. **Este documento** manda sobre diseño técnico y contratos.
3. **`PLAN_EQUIPO_Y_SCRUM.md`** manda sobre propiedad, ramas y ceremonias.
4. **`MENUS_Y_PERFILES.md`** manda sobre árbol de menú, visibilidad y perfiles.
5. Los documentos históricos solo aportan contexto; no son normativos.

### 1.3. Convenciones

- Las rutas internas se escriben completas: `/plataforma/...`.
- Los alias públicos sin `/plataforma` son reescrituras de `next.config.js`, no rutas canónicas.
- “Pantalla” es una opción de menú con `url_menu` no vacía.
- “Carpeta” es una opción con `url_menu = ''`.
- Los nombres de tablas y columnas se conservan en `snake_case`, tal como existen en PostgreSQL.
- Los conteos son referenciales a la fecha de corte y se verifican con las consultas del anexo.

---
## 2. Visión, alcance y stack

### 2.1. Visión
FlowDesk es un ITSM académico y operativo que cubre el ciclo de vida del servicio: incidentes, solicitudes, problemas, cambios, activos, CMDB, conocimiento, catálogo, SLA, operación, seguridad, identidades, organización y reportes. La arquitectura busca que cinco personas trabajen en paralelo sin colisiones, con dominios aislados y contratos explícitos.

### 2.2. Stack vigente

| Componente | Versión / elección | Uso |
| :--- | :--- | :--- |
| Framework | Next.js `14.2.35` (App Router) | Páginas, layouts, route handlers y reescrituras. |
| UI | React `18.3.1` | Componentes de servidor y cliente. |
| Lenguaje | TypeScript `5.5.4` | Tipado estricto del dominio y de los contratos. |
| Base de datos | PostgreSQL (Supabase, conexión por pooler) | Persistencia relacional y vista plana de tickets. |
| Driver | `pg` `^8.12.0` | Pool y consultas parametrizadas. |
| Autenticación | JWT + cookie `sesion` | Sesión de 8 horas y pre-sesión de 5 minutos. |
| Contraseñas | `bcryptjs` (10 rondas) | Hash y verificación. |
| Correo | `nodemailer` | Recuperación de clave y notificaciones. |
| Estilos | Utilidades y componentes propios | Sin framework CSS adicional declarado. |

### 2.3. Variables de entorno

| Variable | Obligatoria | Uso |
| :--- | :---: | :--- |
| `DATABASE_URL` | Sí | Cadena PostgreSQL. En local se lee desde `.env.local`. |
| `JWT_SECRET` | Sí | Firma de JWT; el código exige al menos 32 caracteres. |
| `GMAIL_USER` | Para correo | Cuenta remitente. |
| `GMAIL_APP_PASSWORD` | Para correo | Clave de aplicación. |

No se commitean `.env`, `.env.local`, credenciales ni `node_modules`.

### 2.4. Métricas del repositorio

| Métrica | Valor al 2026-10-20 | Fuente |
| :--- | ---: | :--- |
| Módulos de dominio | 18 | `src/modules/` |
| Archivos dentro de módulos | 658 | Conteo recursivo |
| Archivos TypeScript/TSX en `src` | 1.215 | Conteo recursivo |
| Route handlers en `src/app/api` | 207 | `route.ts` |
| Controladores `*Controller.ts` | 205 | `src/modules/**/api` |
| Páginas bajo `src/app/plataforma` | 227 | `page.tsx` |
| Páginas totales bajo `src/app` | 229 | `page.tsx` |
| Tablas base en `public` | 126 | `information_schema.tables` |
| Vistas en `public` | 1 (`vista_ticket`) | `information_schema.views` |
| Migraciones SQL | 37 | `db/migrations/` |
| Opciones de menú activas | 233 | `opciones_menu` |
| Filas de visibilidad activas | 396 | `opciones_menu_perfiles` |
| Raíces del menú | 12 | `id_padre IS NULL` |
| Perfiles | 10 | `perfiles` |

**Nota:** las 126 tablas incluyen cuatro tablas de respaldo del menú (`opciones_menu_bak_20261018`, `opciones_menu_bak_20261020`, `opciones_menu_perfiles_bak_20261018`, `opciones_menu_perfiles_bak_20261020`). El dominio funcional vivo son 122 tablas más la vista.

---
## 3. Principios de arquitectura

### 3.1. Vertical slice con carpetas por dominio

Cada funcionalidad vive completa en `src/modules/<modulo>/`: servicios, controladores, vistas, componentes y tipos. No se organiza por capas globales (`controllers/`, `services/`, `repositories/`) porque eso obliga a tocar varias carpetas para un solo cambio y aumenta los conflictos entre integrantes.

La decisión se evaluó frente a Clean Architecture y arquitectura en capas; se eligió vertical slice por la menor coordinación entre cinco personas, los cambios localizados, la revisión por dominio y los contratos explícitos en lugar de imports cruzados.

### 3.2. `src/app` es delgado
`src/app` contiene cascarones:

- `page.tsx`: valida sesión/guarda, monta una vista del módulo.
- `route.ts`: declara `dynamic`, `revalidate` y reexporta el controlador del módulo.
- `layout.tsx`: composición visual y navegación.

No contiene reglas de negocio, SQL de dominio ni validaciones de proceso. Si una página necesita lógica, se implementa en el módulo y se expone por contrato.

### 3.3. Contratos públicos

Cada módulo expone lo que otros necesitan, no todo:

| Archivo | Entorno | Contenido |
| :--- | :--- | :--- |
| `index.ts` | Servidor | Servicios, tipos y handlers reutilizables. |
| `ui.ts` | Cliente | Solo componentes de UI; no importa DB ni controladores. |

Reglas:

1. Un módulo consumidor importa `@/modules/<modulo>` o `@/modules/<modulo>/ui`.
2. Prohibido importar `services/`, `api/`, `views/` o `components/` de otro módulo.
3. Cambiar un contrato es cambiar una API interna: se actualizan todos los consumidores en el mismo PR.
4. No se publican tipos internos solo para evitar errores de TypeScript; se corrige el diseño.
5. Los cascarones de `src/app` pueden montar vistas/controladores de su propio módulo; eso no autoriza a un módulo de dominio a importar rutas profundas de otro.

### 3.4. `shared` es transversal y hoja

`src/shared` contiene infraestructura reutilizable:

| Ruta | Responsabilidad |
| :--- | :--- |
| `shared/lib/db.ts` | Pool PostgreSQL y `query` parametrizado. |
| `shared/lib/auth.ts` | JWT, cookies, bcrypt y pre-sesión. |
| `shared/lib/capacidades.ts` | Catálogo RBAC `dominio:acción` y puente perfil → capacidades. |
| `shared/lib/api-auth.ts` | Guardas de API: `sesionConCapacidad`, `autorizarApi`, `obtenerSesionDeRequest`. |
| `shared/lib/page-auth.ts` | Guardas de página: `exigirCapacidadPagina`, `exigirMenuPagina`. |
| `shared/lib/menu.ts` | Carga, árbol, colapso y comprobación de URLs. |
| `shared/lib/errores.ts` | `ErrorDominio` y `respuestaError`. |
| `shared/lib/parametros.ts` | Constantes transversales, como el umbral de monto. |

**Regla inversa:** `shared` nunca importa `src/modules`. Se verificó que no existe ningún import de `@/modules/*` dentro de `src/shared`.

### 3.5. Reglas de dependencia

| Situación | Permitido | Prohibido |
| :--- | :--- | :--- |
| Consumir otro módulo | `@/modules/<modulo>` | `@/modules/<modulo>/services/...` |
| Consumir UI | `@/modules/<modulo>/ui` si existe | Importar una vista no publicada |
| Transversal | `@/shared/lib/*`, `@/shared/components/*` | `shared` importando módulos |
| Núcleo `tickets` | `@/modules/tickets` y `/ui` | Cualquier ruta profunda externa |
| Catálogo | `@/modules/servicios/ui` | Copiar catálogo en incidentes/solicitudes |
| Reportes | `@/modules/reportes/ui` | Crear reportes en otros módulos |
| Datos de otro dominio | SQL de lectura acotado en el servicio propio | Importar repositorios internos |
| Consolas de rol | Contratos de dominio y `shared/components` | Lógica de dominio propia |

El grafo debe ser acíclico. Si aparece un ciclo, se resuelve por dato, evento o servicio compartido; no por importación cruzada.

---
## 4. Mapa de los 18 módulos

| # | Módulo | Archivos | Contrato | Dominio | Dueño |
| --: | :--- | --: | :--- | :--- | :--- |
| 1 | `tickets` | 48 | `index.ts` + `ui.ts` | Núcleo ITSM: ticket base, comentarios, colas, detalle. | Miguel |
| 2 | `incidentes` | 12 | `index.ts` | Incidentes, mayores y sala de crisis. | Miguel |
| 3 | `solicitudes` | 6 | `index.ts` | Solicitudes de servicio y su ciclo. | Miguel |
| 4 | `cambios` | 96 | `index.ts` | RFC, CAB/ECAB, evaluación, calendario, PIR, plantillas. | Nain |
| 5 | `problemas` | 85 | `index.ts` | Problemas, RCA, KEDB y configuración del proceso. | Alexis |
| 6 | `seguridad` | 24 | `index.ts` | Login, JWT, sesiones, captcha y recuperación. | Miguel |
| 7 | `plataforma` | 18 | `index.ts` | Salud, mantenimiento, logs y auditoría de sistema. | Miguel |
| 8 | `perfiles` | 135 | Subcarpetas por rol | Consolas de rol: solo UI y alcance del perfil. | Compartido por subcarpeta |
| 9 | `servicios` | 19 | `index.ts` + `ui.ts` | Catálogo, SLA, matriz de prioridad y workflow. | Miguel |
| 10 | `operacion` | 10 | `index.ts` | Eventos operativos y resiliencia. | Miguel |
| 11 | `activos` | 80 | `index.ts` | ITAM/SAM: inventario, licencias, contratos y bajas. | Nain |
| 12 | `cmdb` | 31 | `index.ts` | SACM: CIs, relaciones, líneas base, exactitud y análisis. | Nain |
| 13 | `proveedores` | 6 | `index.ts` | Proveedores y contratos. | Nain |
| 14 | `identidades` | 15 | `index.ts` | Usuarios, perfiles RBAC y credenciales. | Junior |
| 15 | `organizacion` | 22 | `index.ts` | Departamentos, técnicos, colaboradores y ausencias. | Junior |
| 16 | `configuracion` | 24 | `index.ts` | Menú, categorías, formularios/vistas y parámetros. | Lourdes |
| 17 | `conocimiento` | 13 | `index.ts` | Base de conocimiento y flujo editorial. | Alexis |
| 18 | `reportes` | 14 | `index.ts` + `ui.ts` | 9 reportes centralizados e indicadores. | Alexis |

Los conteos dimensionan la superficie; no reparten carga ni autorizan a editar módulos ajenos.

### 4.1. Contratos concretos

| Módulo | Contrato de servidor | Contrato de UI |
| :--- | :--- | :--- |
| `tickets` | `listarTickets`, `crearTicket`, `obtenerDetalleTicket`, `actualizarTicket`, `listarCatalogosTickets`, `crearComentarioTicket`, `tomarTicketDeMesa`, `calcularPrioridadITIL`, `ticketsGet`, `ticketsPost`, `ticketDetalleGet`, `ticketDetallePatch`, `ticketComentariosPost` | `TablaTickets`, `PresentadorRfcAprobador`, `PresentadorProblemaGestor` |
| `servicios` | Servicios, workflow, SLA y matriz de prioridad | `VistaCatalogoServicios`, `VistaTecnicoCatalogo` |
| `reportes` | `obtenerIndicadores`, `ContextoIndicadores` | Las 9 vistas de reportes |

El resto expone servicios y tipos propios; solo publica UI si otro módulo la necesita. `incidentes` y `solicitudes` publican validaciones y servicios, no una UI pública.

### 4.2. Núcleo congelado `tickets`

`tickets` es la espina dorsal. Cualquier cambio requiere revisión del Tech Lead.

- Incidentes y solicitudes **no reimplementan** máquina de estados, comentarios, prioridad ni detalle.
- Reutilizan el contrato y especializan por `id_tipo_ticket`.
- Prohibido crear una segunda tabla base de tickets, un segundo servicio de prioridad o un segundo flujo de comentarios.
- Los cambios de modelo van por migración y se reflejan en `tickets`, no en cada frente.

### 4.3. Consolas de rol

Las consolas viven en `src/modules/perfiles/<rol>/`. No son módulos de dominio: solo resuelven alcance, composición y navegación.

| Consola | Ruta canónica | Dominio delegado |
| :--- | :--- | :--- |
| `administrador` | `/plataforma/perfiles/administrador/panel` | `identidades`, `plataforma`, `configuracion` |
| `supervisor` | `/plataforma/perfiles/supervisor/*` | `cambios`, `activos`, `problemas`, `tickets`, `reportes` |
| `aprobador` | `/plataforma/perfiles/aprobador/*` | `cambios`, `activos`, `problemas` |
| `tecnico` | `/plataforma/perfiles/tecnico/*` | `tickets`, `cambios`, `incidentes`, `problemas`, `activos`, `cmdb`, `servicios` |
| `gestor-area` | `/plataforma/perfiles/gestor-area/*` | `cambios`, `activos`, `reportes` |
| `solicitante` | `/plataforma/perfiles/solicitante/panel` | `tickets`, `solicitudes`, `incidentes`, `conocimiento` |
| `gestor-cambios` | `/plataforma/perfiles/gestor-cambios/*` | `cambios`, `cmdb`, `reportes` |
| `auditor` | `/plataforma/perfiles/auditor/*` | `cmdb`, `activos`, `cambios`, `identidades`, `reportes` |

Regla: si una consola necesita una regla nueva, se implementa en el módulo de dominio y se expone por contrato. La consola solo pinta y aplica alcance. Los perfiles 9 y 10 no usan `perfiles/<rol>`: operan en los árboles `/plataforma/gestor-activos/**` y `/plataforma/gestor-problemas/**`, montando las vistas de `activos`/`cmdb` y `problemas`.

### 4.4. CMDB separada de activos (Opción B)

`cmdb` es un módulo independiente de `activos` (ITAM). El puente es de datos, no de código:

```text
elemento_configuracion.id_activo  ->  activo.id_activo
```

Consecuencias:

- `cmdb` expone topología, impacto, reconciliación Activo ↔ CI, líneas base, inexactitudes y auditoría.
- `activos` consulta tablas CMDB por SQL para sus KPIs; no importa el módulo `cmdb`.
- No se crea un módulo `analitica` ni se duplica la CMDB dentro de activos.

---
## 5. Rutas canónicas y guardas

### 5.1. Mapa general

| Prefijo | Módulo dueño | API principal |
| :--- | :--- | :--- |
| `/plataforma/tickets/**` | `tickets` | `/api/tickets` |
| `/plataforma/incidentes/**` | `incidentes` + `tickets` | `/api/incidentes` |
| `/plataforma/solicitudes/**` | `solicitudes` + `tickets` | `/api/solicitudes` |
| `/plataforma/servicios/catalogo` | `servicios` | `/api/servicios` |
| `/plataforma/cambios/**` | `cambios` | `/api/cambios` |
| `/plataforma/problemas/**` | `problemas` | `/api/problemas` |
| `/plataforma/gestor-problemas/**` | `problemas` | `/api/gestor-problemas` |
| `/plataforma/activos/**` | `activos` | `/api/activos` |
| `/plataforma/gestor-activos/**` | `activos` + `cmdb` | `/api/gestor-activos`, `/api/activos`, `/api/activos/cmdb` |
| `/plataforma/activos/cmdb/**` | `cmdb` | `/api/activos/cmdb`, `/api/admin/cmdb` |
| `/plataforma/proveedores` | `proveedores` | `/api/proveedores` |
| `/plataforma/conocimiento/**` | `conocimiento` | `/api/conocimiento` |
| `/plataforma/reportes/**` | `reportes` | `/api/reportes/indicadores` |
| `/plataforma/operacion/**` | `operacion` | `/api/operacion` |
| `/plataforma/admin/**` | `configuracion`, `identidades`, `organizacion`, `plataforma` | `/api/admin/**`, `/api/usuarios`, `/api/identidades/perfiles` |
| `/plataforma/perfiles/<rol>/**` | `perfiles/<rol>` | `/api/perfiles/<rol>` |
| `/plataforma/mi-cuenta/**` | `seguridad` | `/api/mi-cuenta` |
| `/plataforma/avisos/mantenimientos` | `plataforma` | `/api/avisos` |
| `/plataforma/dashboard` | `reportes` / consolas | — (redirige a la consola del perfil) |

### 5.2. Fase 2: incidentes y solicitudes separados

La Fase 2 separó la Mesa de Servicio en dos frentes con rutas propias, menú propio y fichas de detalle propias.

| Pantalla | Ruta de incidente | Ruta de solicitud |
| :--- | :--- | :--- |
| Todas | `/plataforma/incidentes` | `/plataforma/solicitudes` |
| Bandeja | `/plataforma/incidentes/bandeja` | `/plataforma/solicitudes/bandeja` |
| Míos | `/plataforma/incidentes/mios` | `/plataforma/solicitudes/mios` |
| Asignados | `/plataforma/incidentes/asignados` | `/plataforma/solicitudes/asignados` |
| Departamento | `/plataforma/incidentes/departamento` | `/plataforma/solicitudes/departamento` |
| Resueltos | `/plataforma/incidentes/resueltos` | `/plataforma/solicitudes/resueltos` |
| Crear | `/plataforma/incidentes/crear` | `/plataforma/solicitudes/crear` |
| Catálogo | `/plataforma/incidentes/catalogo` | `/plataforma/solicitudes/catalogo` |
| Configuración | `/plataforma/incidentes/configuracion` | `/plataforma/solicitudes/configuracion` |
| Específica | `/plataforma/incidentes/mayores` | `/plataforma/solicitudes/aprobaciones` |
| Detalle | `/plataforma/incidentes/[id]` | `/plataforma/solicitudes/[id]` |

Ambas fichas de detalle montan `VistaTicketsDetalle` con `apiBase` distinto y `tipoEsperado` 1 o 2. No son una segunda pantalla de tickets: reutilizan el detalle del núcleo.

El menú las representa como dos carpetas dentro de **Mesa de Servicio**: `Incidentes` y `Solicitudes`. Su configuración vive en **Configuración → Mesa de Servicio → Incidentes/Solicitudes**, con el formulario y el flujo en un cuarto nivel. Las páginas usan `exigirMenuPagina`; las fichas de detalle usan `exigirMenuPagina` con `{ prefijo: true }`.

### 5.3. Fase 3: catálogos centralizados en servicios

| Ruta | Componente | Comportamiento |
| :--- | :--- | :--- |
| `/plataforma/servicios/catalogo` | `VistaTecnicoCatalogo` | Catálogo de consulta del técnico. |
| `/plataforma/incidentes/catalogo` | `VistaCatalogoServicios` con `tipoFijo={1}` | Filtra servicios de incidentes y crea en `/plataforma/incidentes/crear`. |
| `/plataforma/solicitudes/catalogo` | `VistaCatalogoServicios` con `tipoFijo={2}` | Filtra servicios de solicitudes y crea en `/plataforma/solicitudes/crear`. |

La lógica y las pantallas viven en `src/modules/servicios/catalogo` y `src/modules/servicios/catalogo-tecnico`. Incidentes y solicitudes solo montan el contrato `@/modules/servicios/ui`. La ruta legada `/plataforma/perfiles/tecnico/catalogo` quedó como redirección.

### 5.4. Fase 4: 9 reportes centralizados

| Ruta | Vista | Uso principal |
| :--- | :--- | :--- |
| `/plataforma/reportes/operativos` | `VistaReportesOperativos` | Operación y SLA. |
| `/plataforma/reportes/auditoria` | `VistaInformesAuditoria` | Auditoría y cumplimiento. |
| `/plataforma/reportes/productividad` | `VistaProductividad` | Productividad individual y de grupo. |
| `/plataforma/reportes/activos` | `VistaReportesActivos` | Inventario, licencias y CMDB. |
| `/plataforma/reportes/cambios` | `VistaReportesCambios` | RFC, calendario y PIR. |
| `/plataforma/reportes/decisiones` | `VistaReportesAprobador` | Decisiones y comités. |
| `/plataforma/reportes/problemas` | `VistaReportesProblemas` | Problemas, KEDB y RCA. |
| `/plataforma/reportes/area` | `VistaReportesArea` | Servicio recibido por área. |
| `/plataforma/reportes/tableros` | `VistaReportesDisenador` | Tableros y composición. |

Las nueve vistas de reporte (más `VistaDashboard`) viven en `src/modules/reportes/views`. Las rutas legadas redirigen; no se mantienen dos pantallas para el mismo reporte. `/plataforma/tickets/reportes` va a `/plataforma/reportes/operativos` y `/plataforma/admin/reportes-disenador` a `/plataforma/reportes/tableros`.

### 5.5. Alias públicos

`next.config.js` reescribe rutas sin `/plataforma`:

`/dashboard`, `/admin/*`, `/tickets/*`, `/incidentes/*`, `/solicitudes/*`, `/servicios/*`, `/reportes/*`, `/cambios/*`, `/problemas/*`, `/activos/*`, `/mi-cuenta/*`, `/operacion/*`, `/proveedores/*`, `/gestor-activos/*`, `/gestor-problemas/*`, `/avisos/*` y `/conocimiento/*`.

Las consolas de rol **no tienen alias**: se usan las rutas físicas `/plataforma/perfiles/<rol>/...`. La ruta canónica siempre es la que lleva `/plataforma`; el alias es compatibilidad, no destino. Algunas redirecciones internas todavía apuntan a alias; se consideran deuda (ver sección 13).

### 5.6. Middleware

`src/middleware.ts` solo comprueba la **presencia** de la cookie `sesion` y redirige a `/login` si falta. Protege estos prefijos:

`/plataforma`, `/dashboard`, `/tickets`, `/admin`, `/mi-cuenta`, `/cambios`, `/activos`, `/incidentes`, `/solicitudes`, `/gestor-activos`, `/gestor-problemas`, `/avisos`, `/conocimiento`.

El middleware **no autoriza por capacidad ni por menú**. La autorización real ocurre en:

- la página, con `exigirCapacidadPagina` o `exigirMenuPagina`;
- la API, con `sesionConCapacidad` o el guard equivalente;
- el servicio, con validaciones de alcance y segregación de funciones.

Una cookie presente pero inválida no pasa la verificación JWT de la página/API; el middleware solo evita llegar sin cookie.

### 5.7. Cobertura de guardas de página

| Guarda | Páginas que la invocan | Usuarios |
| :--- | ---: | :--- |
| `exigirCapacidadPagina` | 82 | Páginas de dominio con capacidad `dominio:acción`. |
| `exigirMenuPagina` | 32 | Incidentes, solicitudes, reportes, catálogo y fichas de detalle. |
| `exigirPerfilPagina` | 0 | Deprecada; no se usa en páginas. |
| Sin guarda de página | 113 de 227 | Cascarones que delegan en API o deuda por revisar. |

La cobertura no es total: hay páginas legadas de `/plataforma/tickets/**` que montan componentes cliente y confían en la guarda de la API. Es deuda, no el patrón recomendado.

---
## 6. Seguridad, perfiles y RBAC

### 6.1. Autenticación

Flujo:

1. `POST /api/auth/login` valida correo, contraseña, captcha y dominio.
2. Solo se permite `@systemticket.pe`, con una excepción puntual autorizada en código.
3. `bcryptjs` compara la clave contra el hash (10 rondas).
4. Si el usuario tiene varios perfiles, se emite una **pre-sesión** de 5 minutos para elegir perfil.
5. Al elegir, se emite el JWT de sesión y se guarda en la cookie `sesion`.
6. La sesión dura 8 horas.

Cookie:

| Atributo | Valor |
| :--- | :--- |
| Nombre | `sesion` |
| `httpOnly` | `true` |
| `sameSite` | `lax` |
| `secure` | `true` en producción o si el request es HTTPS |
| `path` | `/` |
| `maxAge` | `8 * 60 * 60` |

Bloqueo:

- 3 intentos fallidos → bloqueo definitivo.
- El desbloqueo es presencial por soporte; no hay autodesbloqueo.
- Se registra en auditoría el bloqueo automático.

Política de clave: mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.

### 6.2. RBAC por capacidades

Las capacidades tienen formato `dominio:acción` y viven en `src/shared/lib/capacidades.ts`. Hay 71 capacidades declaradas.

| Grupo | Capacidades | Ejemplos |
| :--- | ---: | :--- |
| `tickets` | 13 | `tickets:ver`, `tickets:atender`, `tickets:vista:bandeja` |
| `cambios` | 9 | `cambios:ver`, `cambios:aprobar`, `cambios:config:publicar` |
| `admin` | 9 | `admin:usuarios`, `admin:menu`, `admin:reportes` |
| Problemas y KEDB | 7 | `problemas:gestionar`, `problemas:config:ver`, `kedb:ver` |
| `operacion` | 5 | `operacion:eventos:ver`, `operacion:resiliencia:ver` |
| Resto | 28 | `incidentes:*`, `solicitudes:*`, `activos:*`, `cmdb:*`, `licencias:*`, `reportes:*`, `auditoria:ver` |

Mientras no exista una tabla `perfil_capacidades`, `CAPACIDADES_POR_PERFIL` actúa como puente y replica el comportamiento vigente. Esto permite migrar a base de datos sin tocar a los consumidores.

### 6.3. Los 10 perfiles

| ID | Nombre en BD | Nombre editorial | Filas de menú | Enfoque |
| --: | :--- | :--- | ---: | :--- |
| 1 | `Administrador` | Administrador | 69 | Gobierno y configuración de la plataforma. |
| 2 | `Tecnico` | Técnico | 57 | Resolución N1/N2/N3, activos en campo y conocimiento. |
| 3 | `Solicitante` | Solicitante | 21 | Solo sus tickets, activos en custodia y conocimiento publicado. |
| 4 | `Supervisor` | Supervisor | 56 | Coordinación de mesa, SLA, calidad y aprobación técnica. |
| 5 | `Gestor de Area` | Gestor de Área | 37 | Validación de solicitudes y cambios de su área. |
| 6 | `Auditor` | Auditor | 45 | Lectura global y cumplimiento; no escribe. |
| 7 | `Aprobador` | Aprobador | 27 | CAB/ECAB, riesgo y decisiones por monto. |
| 8 | `Gestor de Cambios` | Gestor de Cambios | 27 | Coordinación del ciclo RFC. |
| 9 | `Gestor de Activos y Configuracion` | Gestor de Activos y Configuración | 37 | HAM, SAM, CMDB, contratos y proveedores. |
| 10 | `Gestor de Problemas` | Gestor de Problemas | 18 | Problemas, RCA, KEDB y RFC derivadas. |

Los nombres de BD se conservan sin tildes porque así están en `perfiles`; los nombres editoriales son los que usa la documentación funcional.

### 6.4. Segregación de funciones (SoD)

| Regla | Implicación |
| :--- | :--- |
| Configurar, operar y aprobar son funciones distintas | El Administrador parametriza; el Técnico resuelve; ninguno dictamina su propia solicitud o cambio. |
| Quien custodia activos no compra | El Gestor de Activos mantiene inventario; no autoriza adquisiciones. |
| El Auditor no escribe | Acceso de lectura estricta. |
| El Aprobador y el Gestor de Cambios se autoexcluyen | No votan cambios donde participan; el Gestor coordina, no sustituye al CAB. |
| Editar y publicar son distintos | Un usuario guarda borrador; otro publica. |

### 6.5. Guardas de API

El mecanismo normativo vive en `src/shared/lib/api-auth.ts`:

```ts
const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
if (error) return error;
```

También existen:

- `autorizarApi(req, capacidad)`, que devuelve la sesión o una respuesta 401/403;
- `obtenerSesionDeRequest(req)`, para lectura puntual.

Prohibido crear `api/guardia.ts`, `api/guardiaGestor.ts` o equivalentes por módulo. Si un endpoint necesita sesión y capacidad, importa el guard compartido.

Estado actual:

| Patrón | Controladores |
| :--- | ---: |
| Usan `sesionConCapacidad` | 78 |
| Verifican JWT manualmente con `verificarTokenSesion` | 100 |
| No usan ninguno de los dos | 27 |
| **Total** | **205** |

Además, 2 controladores (`proveedores` y selección de perfil) comparan IDs de perfil directamente; pueden solaparse con las filas anteriores y deben migrarse a capacidades cuando se toque ese código. Los 27 sin guarda incluyen controladores de autenticación o endpoints que no requieren sesión; no todos son deuda. Los 100 manuales sí son deuda de migración gradual.

### 6.6. Cabeceras de seguridad

`next.config.js` aplica a todas las respuestas:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

No hay CSP configurada. Si se agrega, debe probarse contra Next.js y las fuentes de estilos/scripts usadas.

---
## 7. Modelo de datos

### 7.1. Panorama

La base `public` tiene 126 tablas base y 1 vista. Es un modelo relacional normalizado, con nombres en `snake_case`, claves enteras y auditoría por columnas.

Convenciones frecuentes:

- `estado_registro boolean` para baja lógica;
- `usuario_creacion`, `fecha_creacion`, `usuario_modificacion`, `fecha_modificacion`;
- `estado_*` como catálogo o texto controlado;
- `campos_adicionales jsonb` para extensibilidad por formulario;
- `id_*` como FK entera;
- catálogos separados (`tipo_ticket`, `estado_ticket`, `prioridad_ticket`, etc.).

No se eliminan datos históricos por conveniencia. Las bajas son lógicas salvo procesos específicos (por ejemplo, disposición de activos).

### 7.2. Modelo C de tickets

El Modelo C reemplazó la tabla única con columnas opcionales por una tabla base más extensiones 1:1.

```text
ticket (ciclo de vida compartido)
├── ticket_incidente (1:1 para id_tipo_ticket = 1)
└── ticket_solicitud (1:1 para id_tipo_ticket = 2)
```

| Tabla | Rol | Columnas clave |
| :--- | :--- | :--- |
| `ticket` | Núcleo compartido | `id_ticket`, `codigo_ticket`, `id_tipo_ticket`, estado, prioridad, SLA, solicitante, asignado, servicio, CI, CSAT, reaperturas, `campos_adicionales`. |
| `ticket_incidente` | Extensión de incidente | `id_ticket` PK/FK, `id_problema`, `es_incidente_mayor`, `causado_por_cambio_id`. |
| `ticket_solicitud` | Extensión de solicitud | `id_ticket` PK/FK, `estado_aprobacion` (default `NO_APLICA`), `id_paso_actual` FK a `servicio_workflow_paso`. |
| `vista_ticket` | Vista plana | `ticket.*` + columnas de ambas extensiones con `LEFT JOIN`. |

Reglas:

1. `ticket` conserva el ciclo de vida, SLA, comentarios, prioridad y detalle.
2. `ticket_incidente` guarda solo lo exclusivo del incidente.
3. `ticket_solicitud` guarda solo lo exclusivo de la solicitud.
4. `vista_ticket` devuelve la forma plana anterior para no cambiar la API.
5. El trigger `trg_ticket_subtipo` crea la extensión correcta al insertar/actualizar `id_tipo_ticket` y elimina la contraria.
6. Una fila de `ticket` nunca debe tener las dos extensiones.

La migración `db/migrations/20261019_modelo_c_ticket.sql` creó las extensiones, hizo backfill, eliminó las columnas duplicadas de `ticket`, creó la vista y el trigger.

### 7.3. Tablas clave

| Dominio | Tabla | Función | Relación clave |
| :--- | :--- | :--- | :--- |
| Tickets | `ticket` | Ticket base y ciclo de vida. | `id_tipo_ticket`, `id_estado`, `id_prioridad`. |
| Tickets | `ticket_incidente` | Datos exclusivos de incidente. | `id_ticket` → `ticket`. |
| Tickets | `ticket_solicitud` | Datos exclusivos de solicitud. | `id_ticket` → `ticket`. |
| Tickets | `vista_ticket` | Vista plana compatible. | `LEFT JOIN` de las dos extensiones. |
| Tickets | `comentario_ticket` | Comentarios públicos/internos. | `id_ticket`. |
| Tickets | `ticket_aprobacion` | Decisiones por paso de workflow. | `id_ticket`, `id_paso_workflow`. |
| Tickets | `estado_ticket` | Estados y transiciones. | `id_estado`. |
| Catálogo | `servicio_catalogo` | Servicio, SLA, formulario y criticidad. | `id_tipo_ticket`, `id_categoria`. |
| Catálogo | `servicio_catalogo_perfiles` | Visibilidad del servicio por perfil. | `id_servicio`, `id_perfil`. |
| Catálogo | `servicio_workflow_paso` | Pasos de aprobación/flujo. | `id_servicio`. |
| Catálogo | `acuerdo_nivel_operativo` | OLA por departamento. | `id_departamento`. |
| Cambios | `cambio` | RFC y planes. | `id_ci_afectado`, `id_problema_origen`. |
| Cambios | `cambio_aprobacion` | Etapas y dictámenes. | `id_cambio`. |
| Cambios | `cab_reunion` | Agenda y actas CAB. | Fecha y cambios. |
| Cambios | `periodos_congelamiento` | Freeze de cambios. | Ventana temporal. |
| Problemas | `problema` | Registro, RCA y workaround. | `id_ci_afectado`, `id_estado`. |
| Problemas | `problema_incidente` | Vínculo problema ↔ incidente. | `id_problema`, `id_ticket`. |
| Problemas | `problema_analisis` | Análisis de causa. | `id_problema`. |
| Problemas | `error_conocido` | KEDB. | `id_problema`. |
| Activos | `activo` | Inventario ITAM. | `id_modelo`, custodio, departamento. |
| Activos | `licencia_software` | Licencias y cumplimiento. | Software autorizado. |
| Activos | `licencia_asignacion` | Asignación de licencias. | `id_licencia`, usuario/activo. |
| Activos | `contrato_ti` | Contratos y cobertura. | Proveedor. |
| CMDB | `elemento_configuracion` | CI y atributos. | `id_activo` → `activo`. |
| CMDB | `ci_relacion` | Topología entre CIs. | `id_ci_origen`, `id_ci_destino`. |
| CMDB | `cmdb_linea_base` | Líneas base. | CIs y fecha. |
| CMDB | `cmdb_inexactitud` | Calidad y reconciliación. | CI / activo. |
| Conocimiento | `articulo_conocimiento` | Artículos y estado editorial. | Autor, revisor, problema origen. |
| Identidad | `usuario` | Cuenta, clave, bloqueo y correo. | Departamento. |
| Identidad | `perfiles` | Catálogo de 10 perfiles. | `id_perfil`. |
| Identidad | `usuario_perfiles` | N:M usuario-perfil. | `id_usuario`, `id_perfil`. |
| Identidad | `departamento_ti` | Departamentos de TI. | Jefatura. |
| Configuración | `opciones_menu` | Catálogo maestro de menú. | `id_padre`, `url_menu`. |
| Configuración | `opciones_menu_perfiles` | Visibilidad N:M. | `id_opcion_menu`, `id_perfil`. |
| Configuración | `configuracion_sistema` | Parámetros globales. | Clave/valor. |
| Reportes | `informe_auditoria` | Informes y hallazgos. | Auditor. |

**Dónde está el resto:** las 126 tablas se consultan con `information_schema` o se leen en `db/migrations/`. No se copia el diccionario completo aquí para evitar que quede obsoleto.

### 7.4. Migraciones y seed

- Las migraciones viven en `db/migrations/YYYYMMDD_descripcion.sql`.
- No se edita una migración aplicada; se crea la siguiente.
- `db/seed.sql` debe reflejar catálogos, menú, perfiles y datos maestros.
- La secuencia vigente termina en `20261022_fase4_modulo_reportes.sql`; la siguiente usa el número libre.
- `db/schema.sql` es una base histórica incompleta (41 `CREATE TABLE`), no la fuente de verdad. La fuente es la base viva más las migraciones.
- Las migraciones del menú crean respaldos `opciones_menu_bak_*` y `opciones_menu_perfiles_bak_*` antes de reconstruir.

---
## 8. Patrones de API, servicio y UI

### 8.1. Route handler delgado

Un `route.ts` declara configuración y reexporta el controlador:

```ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

export { GET, POST } from "@/modules/tickets/api/ticketsController";
```

No valida reglas de negocio ni escribe SQL. Si el controlador necesita un guard, lo importa de `shared/lib/api-auth`.

### 8.2. Controlador

Patrón recomendado:

```ts
const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
if (error) return error;

const body = await req.json();
const data = await listarActivos(sesion, body);
return NextResponse.json(data);
```

Responsabilidades:

1. autorizar sesión y capacidad;
2. leer y validar forma del request;
3. delegar en el servicio;
4. traducir errores con `respuestaError`;
5. no exponer SQL, rutas internas ni datos personales.

Códigos usados: 400, 401, 403, 404, 409 y 500.

### 8.3. Servicio

El servicio contiene la regla de dominio y el acceso a datos:

- recibe un contexto (`idUsuario`, `idPerfil`, alcance);
- valida transiciones, SoD, SLA y permisos de datos;
- usa `query` de `shared/lib/db`;
- lanza `ErrorDominio` para errores esperables;
- no conoce `NextRequest` ni `NextResponse`.

### 8.4. Página y UI

Patrón de página:

```tsx
export default async function PaginaIncidentesBandeja() {
  await exigirMenuPagina("/plataforma/incidentes/bandeja");
  return <TablaTickets vista="bandeja" tipoInicial="1" tipoFijo="1" />;
}
```

Patrón de página con capacidad:

```tsx
export default async function PaginaActivos() {
  const { sesion } = exigirCapacidadPagina(CAPACIDADES.ACTIVOS_VER);
  return <VistaActivos sesion={sesion} />;
}
```

Reglas:

- el `page.tsx` no debe contener lógica de negocio;
- las vistas cliente reciben datos o contexto, no acceso a DB;
- los componentes compartidos viven en `shared/components` o en el `ui.ts` del módulo;
- no se duplican tablas, filtros ni formularios de otro dominio.

### 8.5. Errores

`ErrorDominio` encapsula mensaje y status. `respuestaError` normaliza la respuesta. Los errores no controlados se registran en servidor y se devuelve un mensaje genérico.

No se confía en validaciones del cliente. SoD, SLA, aprobaciones y transiciones se validan en servidor.

### 8.6. Deuda de patrón

Persisten 100 controladores con JWT manual, 2 comparaciones de ID de perfil, cascarones con imports profundos y 113 páginas sin guarda de página. Es deuda heredada: no se amplía y se corrige al tocar la ruta. Un PR que agregue una ruta profunda nueva entre módulos se rechaza aunque compile.

---
## 9. Menú y navegación

### 9.1. Modelo

| Tabla | Rol |
| :--- | :--- |
| `opciones_menu` | Catálogo maestro: una fila por pantalla o carpeta. |
| `opciones_menu_perfiles` | Visibilidad N:M: qué perfil ve qué opción. |

`url_menu = ''` significa carpeta; un valor significa página. No se agregan URLs duplicadas ni rutas sin página.

### 9.2. Conteos

| Indicador | Valor |
| :--- | ---: |
| Opciones activas | 233 |
| Carpetas | 38 |
| Pantallas | 195 |
| URLs de pantalla distintas | 195 |
| Raíces | 12 |
| Filas de visibilidad | 396 |
| Asignaciones pantalla-perfil | 260 |
| Asignaciones carpeta-perfil | 136 |
| Carpetas colapsadas por el sidebar | 50 |
| Entradas de primer nivel visibles | 69 |

### 9.3. Las 12 raíces

| Orden | Raíz | Contenido principal |
| --: | :--- | :--- |
| 1 | Mi trabajo | Paneles de rol, tareas, agenda, desempeño, equipo y aprobaciones. |
| 2 | Mesa de Servicio | Incidentes, solicitudes, operación transversal, SLA y avisos. |
| 3 | Cambios | RFC, calendario, CAB, aprobaciones, PIR e historial. |
| 4 | Problemas | Registro, análisis, KEDB, candidatos, mayores y RFC derivadas. |
| 5 | Activos y CMDB | Inventario, licencias, CMDB, mantenimiento, proveedores y catálogos. |
| 6 | Conocimiento | Base, artículos, creación, revisión y publicación. |
| 7 | Catálogo de Servicios | Catálogo de consulta y configuración de servicios/SLA. |
| 8 | Operación | Eventos, alertas, disponibilidad, capacidad y continuidad. |
| 9 | Reportes | Los 9 reportes corporativos. |
| 10 | Configuración | Formularios, flujos, organización, identidades, menú y notificaciones. |
| 11 | Plataforma | Auditoría, seguridad, retención, salud y cumplimiento. |
| 12 | Mi cuenta | Perfil, seguridad y preferencias de notificación. |

### 9.4. Construcción del árbol

`src/shared/lib/menu.ts` carga opciones por perfil activo (o por todos los perfiles del usuario), filtra `estado_registro = true`, construye el árbol por `id_padre`, ordena por `orden`, colapsa carpetas de un solo hijo visible en cascada y elimina carpetas vacías. El colapso se aplica al árbol de cada perfil, no al catálogo: el catálogo sigue siendo uno solo.

### 9.5. El menú también autoriza

`exigirMenuPagina(url)` obtiene el menú del usuario y verifica que la URL exista. Con `{ prefijo: true }` autoriza cualquier pantalla bajo la ruta, lo que sirve para fichas de detalle que no son opción de menú.

Esto permite que la visibilidad del menú sea la política de acceso de las páginas de incidentes, solicitudes, reportes y catálogo. No reemplaza la guarda de API: un endpoint sigue validando capacidad y alcance.

---
## 10. Fases de implementación

| Fase | Cambio | Migración | Consecuencia |
| :--- | :--- | :--- | :--- |
| Antecedente | Catálogo único de menú y visibilidad N:M. | `20261019_unificacion_catalogo_menu.sql` | Una pantalla existe una vez; los perfiles solo cambian visibilidad. |
| Modelo C | Ticket base + extensiones 1:1. | `20261019_modelo_c_ticket.sql` | `tickets` es el núcleo; incidentes y solicitudes son vistas especializadas. |
| Fase 2 | Separación de Incidentes y Solicitudes. | `20261020_fase2_modulos_incidentes_solicitudes.sql` | Rutas, menú, fichas y catálogo propios; 231 opciones y 394 visibilidades. |
| Fase 3 | Catálogos movidos a `servicios`. | `20261021_fase3_catalogo_servicios.sql` | Las rutas de catálogo montan `servicios/ui`; incidentes/solicitudes filtran por tipo. |
| Fase 4 | 9 reportes centralizados en `reportes`. | `20261022_fase4_modulo_reportes.sql` | Rutas legadas redirigen; no se duplican reportes. |
| Ajuste de menú | Configuración de Mesa de Servicio en cuatro niveles. | `20261020_configuracion_mesa_servicio_niveles.sql` | 233 opciones y 396 visibilidades; las pantallas operativas no se mueven. |

---
## 11. Calidad, migraciones y despliegue

### 11.1. Quality gates

| Gate | Comando / evidencia | Criterio |
| :--- | :--- | :--- |
| Tipado | `npx tsc --noEmit` | 0 errores. |
| Build | `npm run build` | Compila y genera rutas sin errores. |
| Contratos | Revisión de diff | Sin imports profundos nuevos entre módulos. |
| Guardas | Búsqueda/revisión | Sin guardas duplicadas. |
| Datos | Base limpia y base existente | Migración aplica y seed carga. |
| Menú | Consultas de duplicados/huérfanos | Sin URLs duplicadas ni opciones rotas. |
| Regresión | Smoke por perfil | Rutas del frente responden sin bucles. |

No se acepta “compila en mi máquina” como evidencia. El PR incluye salida o captura.

### 11.2. Commits y PR

Formato: `tipo(modulo): descripción` en español, imperativo, sin emojis.

Tipos: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`.

Un PR debe:

1. estar sincronizado con `main`;
2. tener `tsc` y `build` en verde;
3. tocar solo archivos propios o cambios acordados;
4. actualizar contrato, migración, seed y menú si aplica;
5. ser revisado por el dueño o el Tech Lead;
6. no mezclar refactor masivo con funcionalidad.

### 11.3. Propagación

Después de integrar en `main`, se propaga a:

- `prueba-conexion`
- `verify-junior`
- `feature/alexis-problemas-conocimiento`

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

Ninguna de las cuatro ramas queda atrás. Si una falla al compilar tras el merge, se detiene la propagación y se corrige.

### 11.4. Migraciones

1. Crear `db/migrations/YYYYMMDD_descripcion.sql`.
2. Probar en base limpia y en base existente.
3. Actualizar `db/seed.sql` si hay catálogos, menú, perfiles o datos maestros.
4. Anunciar en daily para evitar colisiones de numeración.
5. No editar migraciones aplicadas.
6. No borrar datos históricos por conveniencia.

La secuencia actual tiene 37 migraciones. La última por fecha es `20261022_fase4_modulo_reportes.sql`; el ajuste de menú se agregó en `20261020_configuracion_mesa_servicio_niveles.sql`.

### 11.5. Despliegue

El artefacto es una aplicación Next.js. El build requiere `DATABASE_URL` y `JWT_SECRET`; el correo requiere `GMAIL_USER` y `GMAIL_APP_PASSWORD`. La conexión a Supabase usa el pooler y SSL.

Antes de desplegar:

- `npx tsc --noEmit`;
- `npm run build`;
- migraciones aplicadas;
- seed sincronizado si es entorno nuevo;
- smoke de login, dashboard, una bandeja, un detalle, un reporte y una consola de rol.

No hay suite automatizada de pruebas en `package.json`; el gate es tipado, build, revisión y smoke. Es una brecha de calidad, no una autorización para omitir verificación manual.

---
## 12. Decisiones de arquitectura e historial

| Decisión | Alternativa descartada | Razón | Consecuencia |
| :--- | :--- | :--- | :--- |
| Vertical slice por dominio | Clean Architecture / capas globales | Menos coordinación entre cinco personas y cambios localizados. | Carpetas por módulo con servicios, API, vistas y componentes. |
| `src/app` delgado | Lógica en páginas y route handlers | Evita duplicación y permite reutilizar contratos. | Páginas y rutas solo montan. |
| Contratos `index.ts`/`ui.ts` | Imports directos a cualquier archivo | Aísla módulos y reduce acoplamiento. | Cambiar contrato exige PR coordinado. |
| `shared` hoja | `shared` importando módulos | Evita dependencias invertidas y ciclos. | Infraestructura reutilizable sin dominio. |
| `tickets` congelado | Un módulo por tipo con lógica propia | Evita tres máquinas de estado y tres flujos de comentarios. | Incidentes/solicitudes especializan por tipo. |
| Modelo C | Tabla única con columnas opcionales | Separa lo común de lo exclusivo sin romper la API. | `ticket` + extensiones + `vista_ticket` + trigger. |
| CMDB separada (Opción B) | CMDB dentro de activos | SACM e ITAM tienen ciclos y equipos distintos. | Puente por `elemento_configuracion.id_activo`. |
| Consolas en `perfiles/<rol>` | Módulos de rol de primer nivel | El rol es UI/alcance, no dominio. | La lógica se delega a módulos de dominio. |
| Menú único con visibilidad N:M | Un menú por perfil | Evita duplicar pantallas y rutas. | `opciones_menu` + `opciones_menu_perfiles`. |
| Guarda central de API | Guardas por módulo | Evita divergencia y agujeros. | `shared/lib/api-auth.ts` es normativo. |
| Rutas canónicas `/plataforma/...` | Alias como rutas principales | Coherencia con la carpeta física y el menú. | `next.config.js` solo reescribe alias. |
| 9 reportes en `reportes` | Reportes dispersos por dominio | Un solo lugar para vistas, filtros y exportación. | Rutas legadas redirigen. |

### 12.1. Historial resumido

| Fecha | Cambio |
| :--- | :--- |
| 2026-10 | Núcleo: guarda `sesionConCapacidad`, contrato `tickets` congelado, CMDB separada y división de `administracion`. |
| 2026-10 | Consolas y menú: regla inversa a `perfiles/<rol>`, rutas sin alias, limpieza legacy y catálogo único N:M. |
| 2026-10 | Datos: Modelo C con `ticket` + extensiones + `vista_ticket`. |
| 2026-10 | Fases 2, 3 y 4: incidentes/solicitudes, catálogos en `servicios` y 9 reportes en `reportes`. |

---
## 13. Deuda técnica y hoja de ruta

| Deuda | Evidencia | Riesgo | Acción |
| :--- | :--- | :--- | :--- |
| 100 controladores con JWT manual | `verificarTokenSesion` en `*Controller.ts` | Divergencia de reglas y olvidos de capacidad. | Migrar a `sesionConCapacidad` al tocar cada controlador. |
| 2 controladores comparan IDs de perfil | `proveedores`, selección de perfil | RBAC rígido y difícil de auditar. | Reemplazar por capacidades. |
| 113 páginas sin guarda de página | 114 de 227 con guarda | Acceso directo a shells sin política de página. | Revisar por prefijo; añadir `exigirMenuPagina` o `exigirCapacidadPagina`. |
| Imports profundos en cascarones | `src/app` importa vistas/controladores internos | Acoplamiento a estructura interna. | No ampliar; migrar a contratos al tocar la ruta. |
| `db/schema.sql` incompleto | 41 tablas vs 126 | Un entorno nuevo queda incompleto si se usa solo ese archivo. | Usar migraciones + seed; actualizar o retirar el esquema histórico. |
| Capacidades en código | No existe `perfil_capacidades` | Cambiar permisos exige despliegue. | Crear tabla y consultar desde `resolverCapacidades`. |
| Sin suite automatizada | `package.json` sin script de test | Regresiones detectadas tarde. | Agregar pruebas de servicios críticos y smoke automatizado. |
| Respaldos de menú en `public` | 4 tablas `*_bak_*` | Ruido en el modelo y conteos. | Validar y mover a esquema de respaldo o eliminar. |
| Nombres de menú sin tildes y órdenes repetidos | Catálogo actual | Inconsistencia visual, no funcional. | Normalizar en una migración de calidad. |
| Alias legados | `next.config.js`; redirecciones internas a `/admin/...`, `/cambios/...`, `/operacion/...` y `/gestor-activos/panel` | Deuda de compatibilidad y destinos incoherentes. | Retirar alias y usar rutas `/plataforma/...` en redirecciones. |

### 13.1. Prioridades sugeridas

1. Cerrar la migración de guardas de API en los módulos que se toquen.
2. Revisar páginas sin guarda en `/plataforma/tickets/**` y consolas.
3. Llevar capacidades a base de datos.
4. Sustituir imports profundos de cascarones por contratos.
5. Agregar pruebas de humo y de reglas críticas (SLA, SoD, Modelo C, menú).
6. Limpiar respaldos de menú y alias cuando el equipo lo apruebe.

---
## 14. Anexo: verificación, fuentes y mantenimiento

### 14.1. Consultas de verificación
```sql
-- 126 tablas base
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 233 opciones, 38 carpetas, 195 páginas, 12 raíces
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE url_menu = '') AS carpetas,
       COUNT(*) FILTER (WHERE url_menu <> '') AS paginas,
       COUNT(*) FILTER (WHERE id_padre IS NULL) AS raices
FROM opciones_menu WHERE estado_registro = true;

-- 396 visibilidades
SELECT COUNT(*) FROM opciones_menu_perfiles WHERE estado_registro = true;
```

```powershell
(Get-ChildItem src\app\api -Recurse -Filter route.ts).Count
(Get-ChildItem src\app\plataforma -Recurse -Filter page.tsx).Count
(Get-ChildItem src\app -Recurse -Filter page.tsx).Count
```

### 14.2. Fuentes usadas

| Fuente | Uso |
| :--- | :--- |
| `src/modules/**`, `src/app/api/**`, `src/app/plataforma/**` | Módulos, contratos, 207 route handlers y 227 páginas. |
| `src/shared/lib/{capacidades,api-auth,page-auth,menu,auth}.ts` | Perfiles, capacidades, guardas, menú y JWT. |
| `src/middleware.ts` y `next.config.js` | Protección por cookie, cabeceras y alias. |
| `db/migrations/20261019_modelo_c_ticket.sql` | Modelo C, vista y trigger. |
| `db/migrations/20261020_fase2_modulos_incidentes_solicitudes.sql` | Catálogo base de Incidentes y Solicitudes. |
| `db/migrations/20261020_configuracion_mesa_servicio_niveles.sql` | Reorganización de la configuración y conteos vigentes 233/396. |
| `db/migrations/20261021_fase3_catalogo_servicios.sql` | Catálogo en `servicios`. |
| `db/migrations/20261022_fase4_modulo_reportes.sql` | 9 rutas de reportes. |
| Base PostgreSQL viva | 126 tablas, 1 vista, 10 perfiles, menú y visibilidad. |
| `DOCUMENTACIÓN/PLAN_EQUIPO_Y_SCRUM.md` | Propiedad, fases, dependencias, quality gates y ramas. |
| `DOCUMENTACIÓN/MENUS_Y_PERFILES.md` | Perfiles, 12 raíces, colapso y conteos de menú. |
| Documentos de origen (retirados) | `ARQUITECTURA_MODULAR_Y_CONTRATOS.md`, `PROPUESTAS_ARQUITECTURA_Y_ESTRUCTURA.md`, `ESQUEMA_ARQUITECTURA_MODULAR_DETALLADO.md`, `ARQUITECTURA_Y_JERARQUIA_SRC.md` y `DOCUMENTACION_COMPLETA_ARQUITECTURA_Y_CODIGO.md`; su contenido útil se sintetizó aquí y el histórico queda en Git. |

### 14.3. Detalle exhaustivo y mantenimiento

- **126 tablas:** `information_schema` de la base viva y `db/migrations/`.
- **207 endpoints:** árbol de `src/app/api` y controladores en `src/modules/**/api`.
- **227 páginas:** árbol de `src/app/plataforma`.
- **Menú completo:** `MENUS_Y_PERFILES.md` y las tablas `opciones_menu` / `opciones_menu_perfiles` de la base viva.
- **Histórico de arquitectura:** los documentos anteriores se retiraron en la consolidación del 2026-10-19; su contenido queda en el historial Git y aquí se conserva la síntesis vigente.

Actualizar este documento cuando cambie un módulo, un contrato, una ruta canónica, el modelo de tickets, una fase estructural, el mecanismo de guardas/perfiles o el flujo de calidad. La revisión mínima es `npx tsc --noEmit`, `npm run build`, consultas de menú y smoke de las rutas afectadas.

---
**Fin del documento.**
