# Índice Maestro de Documentación — FlowDesk ITSM

Documentación técnica, funcional y de gobierno del sistema **FlowDesk ITSM**, alineada con **ITIL 4**, **ISO/IEC 20000-1:2018**, **ISO/IEC 27001:2022**, **ISO/IEC 19770-1** y **COBIT 2019**.

> **Vigencia:** 2026-10-20. La documentación se consolidó en ocho documentos canónicos; los documentos anteriores se retiraron y su histórico permanece en Git.

---

## 1. Documentos canónicos

| # | Documento | Para qué sirve | Contenido principal |
| :-: | :--- | :--- | :--- |
| 1 | [ARQUITECTURA_Y_CODIGO.md](ARQUITECTURA_Y_CODIGO.md) | Entender cómo está construido el sistema. | Stack, principios, 18 módulos, contratos, rutas, guardas, RBAC, modelo C, API/UI, fases, calidad y deuda técnica. |
| 2 | [MENUS_Y_PERFILES.md](MENUS_Y_PERFILES.md) | Entender qué ve y qué puede hacer cada perfil. | 10 perfiles, SoD, catálogo único `opciones_menu`, árbol actual por perfil, rutas, cobertura ITIL/ISO/COBIT y roadmap. |
| 3 | [REQUERIMIENTOS.md](REQUERIMIENTOS.md) | Saber qué debe hacer el sistema. | RF-01 a RF-44, RNF, RN-01 a RN-41 y criterios de aceptación. |
| 4 | [HISTORIAS_DE_USUARIO.md](HISTORIAS_DE_USUARIO.md) | Trabajar el backlog y validar escenarios. | Épicas, HU generales y detalle de Administrador y Solicitante en Gherkin. |
| 5 | [TRAZABILIDAD.md](TRAZABILIDAD.md) | Auditar cobertura y cambios. | Matriz funcionalidad ↔ HU ↔ RF ↔ RN ↔ estado de implementación. |
| 6 | [PLAN_EQUIPO_Y_SCRUM.md](PLAN_EQUIPO_Y_SCRUM.md) | Coordinar al equipo y el proceso. | Roles, propiedad de módulos, reglas de dependencia, Git, sprints, DoR/DoD y plantillas. |
| 7 | [PROMPTS_CONFIGURACION_ADMIN.md](PROMPTS_CONFIGURACION_ADMIN.md) | Implementar pantallas de configuración. | Reglas comunes de UI/validación/versionado y especificaciones de Problemas, Cambios y Activos/CMDB. |
| 8 | [CATALOGO_SERVICIOS_DATOS.md](CATALOGO_SERVICIOS_DATOS.md) | Cargar el catálogo de servicios. | 30 servicios de referencia (14 de solicitud y 16 de incidente) y JSON de carga. |

---

## 2. Ruta de lectura recomendada

### Para incorporarse al proyecto

1. [README raíz](../README.md) — inicio rápido y estado.
2. [ARQUITECTURA_Y_CODIGO.md](ARQUITECTURA_Y_CODIGO.md) — cómo está organizado el código.
3. [MENUS_Y_PERFILES.md](MENUS_Y_PERFILES.md) — qué ve cada perfil.
4. [PLAN_EQUIPO_Y_SCRUM.md](PLAN_EQUIPO_Y_SCRUM.md) — cómo se trabaja y se entrega.

### Para implementar o revisar funcionalidad

1. [REQUERIMIENTOS.md](REQUERIMIENTOS.md) — qué se pide.
2. [HISTORIAS_DE_USUARIO.md](HISTORIAS_DE_USUARIO.md) — cómo se acepta.
3. [TRAZABILIDAD.md](TRAZABILIDAD.md) — qué falta y qué se afecta.
4. [ARQUITECTURA_Y_CODIGO.md](ARQUITECTURA_Y_CODIGO.md) — dónde va y qué contrato usa.

### Para configuración administrativa

1. [MENUS_Y_PERFILES.md](MENUS_Y_PERFILES.md) — menú y visibilidad.
2. [PROMPTS_CONFIGURACION_ADMIN.md](PROMPTS_CONFIGURACION_ADMIN.md) — pantallas y validaciones.
3. [CATALOGO_SERVICIOS_DATOS.md](CATALOGO_SERVICIOS_DATOS.md) — datos de catálogo.

---

## 3. Estado del sistema al 2026-10-20

| Indicador | Valor |
| :--- | ---: |
| Perfiles oficiales | 10 |
| Módulos de dominio | 18 |
| Opciones de menú activas | 233 |
| Filas de visibilidad | 396 |
| Route handlers | 207 |
| Páginas bajo `src/app/plataforma` | 227 |
| Tablas base en `public` | 126 |
| Vistas | 1 (`vista_ticket`) |

Hitos cerrados:

- **Fase 1:** modelo C de tickets (`ticket` + `ticket_incidente` + `ticket_solicitud` + `vista_ticket`).
- **Fase 2:** módulos Incidentes y Solicitudes separados, con menú y fichas propias.
- **Fase 3:** catálogos centralizados en `servicios`.
- **Fase 4:** nueve reportes centralizados en `reportes`.

---

## 4. Reglas de mantenimiento documental

1. Un tema tiene un solo documento canónico; no se crean copias por perfil ni por fase.
2. Los cambios de arquitectura, rutas, menú, perfiles o reglas se actualizan en el mismo commit que el código.
3. Las migraciones históricas no se reescriben: el estado final se documenta en las migraciones nuevas y en `db/seed.sql`.
4. Toda ruta nueva debe indicar su guarda (capacidad o menú) y su alias de compatibilidad si existe.
5. Antes de cerrar una entrega: `npx tsc --noEmit`, `npm run build` y revisión de enlaces internos.
6. Los documentos retirados no se restauran; se consulta el historial Git si hace falta trazabilidad.

---

## 5. Fuentes de verdad

| Tema | Fuente |
| :--- | :--- |
| Código y contratos | `src/modules/`, `src/shared/`, `src/app/` |
| Base de datos | `db/schema.sql`, `db/migrations/`, base PostgreSQL viva |
| Menú | `opciones_menu` y `opciones_menu_perfiles`; `src/shared/lib/menu.ts` |
| Seguridad | `src/shared/lib/auth.ts`, `capacidades.ts`, `api-auth.ts`, `page-auth.ts` |
| Rutas y alias | `src/app/`, `next.config.js` |
| Calidad | `npx tsc --noEmit`, `npm run build`, smoke por perfil |

---

*Índice maestro de la documentación de FlowDesk ITSM. Si un documento contradice el código o la base viva, prevalece el código/base y el documento debe corregirse en la misma entrega.*
