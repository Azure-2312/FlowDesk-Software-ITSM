# Índice Maestro de Documentación — FlowDesk ITSM

Documentación técnica, funcional y de gobierno del sistema **FlowDesk ITSM**, alineada con **ITIL 4**, **ISO/IEC 20000-1:2018**, **ISO/IEC 27001:2022**, **ISO/IEC 19770-1** y **COBIT 2019**.

> **Vigencia:** 2026-10-24. La documentación se consolida en documentos canónicos vigentes. Todos los informes temporales y especificaciones obsoletas han sido depurados del repositorio.

---

## 1. Documentos Canónicos

| # | Documento | Para qué sirve | Contenido Principal |
| :-: | :--- | :--- | :--- |
| 1 | [README raíz](../README.md) | Visión ejecutiva, qué es, para qué sirve e inicio rápido. | Qué es FlowDesk, qué problemas resuelve, marcos normativos, 10 perfiles RBAC, 17 módulos, flujos operativos end-to-end con diagramas, stack, instalación, quality gates y distribución de responsabilidades. |
| 2 | [ARQUITECTURA_Y_CODIGO.md](ARQUITECTURA_Y_CODIGO.md) | Entender a fondo cómo está construido el sistema y cada carpeta. | Principios de Vertical Slice, contratos públicos (`index.ts` / `ui.ts`), regla de hoja en `shared`, cascarones delgados en `app`, desglose exhaustivo de los 17 módulos, mapa de rutas, modelo relacional C, seguridad JWT/RBAC, calidad y directivas para IAs. |
| 3 | [MENUS_Y_PERFILES.md](MENUS_Y_PERFILES.md) | Entender qué ve y qué puede hacer cada perfil. | 10 perfiles oficiales, matriz SoD, catálogo único de 230 opciones `opciones_menu`, 393 filas de visibilidad, árbol colapsable por perfil y cobertura de estándares ITIL/ISO/COBIT. |
| 4 | [REQUERIMIENTOS.md](REQUERIMIENTOS.md) | Saber qué debe hacer el sistema formalmente. | Requerimientos Funcionales (RF-01 a RF-44), Requerimientos No Funcionales (RNF) y Reglas de Negocio (RN-01 a RN-48) con validaciones de servidor. |
| 5 | [HISTORIAS_DE_USUARIO.md](HISTORIAS_DE_USUARIO.md) | Trabajar el backlog ágil y validar escenarios de aceptación. | 35 historias estructuradas (Sprint 1: 15, Sprint 2: 10, Product Backlog: 10) con tarjetas de metadatos, Como/Deseo/Para y criterios en formato Given-When-Then. |
| 6 | [TRAZABILIDAD.md](TRAZABILIDAD.md) | Auditar cobertura y trazabilidad entre artefactos. | Matriz bidireccional Funcionalidad ↔ HU ↔ RF ↔ RN ↔ Rutas ↔ Evidencia de implementación (97.96% de cobertura operativa). |
| 7 | [PLAN_EQUIPO_Y_SCRUM.md](PLAN_EQUIPO_Y_SCRUM.md) | Coordinar al equipo ágil y el flujo de Git. | Roles Scrum, propiedad rebalanceada de los 17 módulos, aislamiento entre ramas, ceremonias, DoR/DoD, plantillas de Daily y Quality Gates. |
| 8 | [CATALOGO_SERVICIOS_DATOS.md](CATALOGO_SERVICIOS_DATOS.md) | Cargar el catálogo oficial de servicios. | 30 servicios de referencia precargados (14 de solicitud y 16 de incidente) con SLAs, categorías y estructuras JSON de datos maestros. |
| 9 | [BITACORA_DAILY_SCRUM.xlsx](BITACORA_DAILY_SCRUM.xlsx) | Evidencia de seguimiento ágil del Sprint 2. | Libro Excel con 5 hojas (`Miguel`, `Lourdes`, `Alexis`, `Junior`, `Nain`) cubriendo 12 días continuos (12/10 al 23/10) respondiendo las 3 preguntas del Daily Scrum. |
| 10| [Historia de Usuario trello.txt](Historia%20de%20Usuario%20trello.txt) | Importación directa a tableros Trello. | Formato texto plano (Notepad) con las 35 historias de usuario adaptadas a los módulos y perfiles vigentes. |
| 11| [ASIGNACION_*.md](ASIGNACION_MIGUEL.md) | Especificaciones de trabajo por integrante. | Fronteras modulares y alcance técnico específico por desarrollador ([Miguel](ASIGNACION_MIGUEL.md), [Lourdes](ASIGNACION_LOURDES.md), [Alexis / Darhien](ASIGNACION_ALEXIS.md), [Junior](ASIGNACION_JUNIOR.md), [Nain](ASIGNACION_NAIN.md)). |

---

## 2. Ruta de Lectura Recomendada

### Para incorporarse al proyecto (Nuevos Desarrolladores o Modelos de IA)
1. **[README raíz](../README.md):** Inicio rápido, qué es, qué problema resuelve y cómo funciona el sistema.
2. **[ARQUITECTURA_Y_CODIGO.md](ARQUITECTURA_Y_CODIGO.md):** Principios arquitectónicos, contratos, desglose de carpetas y modelo de datos.
3. **[MENUS_Y_PERFILES.md](MENUS_Y_PERFILES.md):** Qué ve y qué atribuciones tiene cada uno de los 10 perfiles.
4. **[PLAN_EQUIPO_Y_SCRUM.md](PLAN_EQUIPO_Y_SCRUM.md):** Flujo de trabajo, Git, asignaciones modulares y Quality Gates.

### Para implementar o revisar funcionalidad
1. **[REQUERIMIENTOS.md](REQUERIMIENTOS.md):** Qué se solicita y qué reglas de negocio aplican.
2. **[HISTORIAS_DE_USUARIO.md](HISTORIAS_DE_USUARIO.md):** Criterios de aceptación estructurados en Given-When-Then.
3. **[TRAZABILIDAD.md](TRAZABILIDAD.md):** Matriz de impacto y relaciones con otros módulos.
4. **[ARQUITECTURA_Y_CODIGO.md](ARQUITECTURA_Y_CODIGO.md):** Dónde ubicar el código y qué contrato de módulo consumir.

---

## 3. Estado Cuantitativo del Sistema al 2026-10-24

| Indicador Técnico | Valor Verificado |
| :--- | ---: |
| **Perfiles Oficiales RBAC** | **10** |
| **Módulos de Dominio Independientes** | **17** |
| **Opciones de Menú Activas** | **230** |
| **Filas de Visibilidad en Menú** | **393** |
| **Route Handlers en `src/app/api`** | **209** |
| **Páginas bajo `src/app/plataforma`** | **312** |
| **Total de Páginas Compiladas** | **335** |
| **Tablas Base en Esquema Público** | **132** |
| **Vistas Relacionales** | **1** (`vista_ticket`) |
| **Suite de Pruebas E2E ITIL 4** | **30 / 30 aprobadas (100%)** |

Hitos cerrados:
- **Paneles unificados por perfil:** Todos los dashboards residen canónicamente en `/plataforma/operacion/paneles/<rol>`.
- **Separación de Activos y CMDB:** Módulos independientes en `src/modules/activos` y `src/modules/cmdb`.
- **Rebalanceo Modular:** Lourdes asume `servicios` + `activos`; Junior asume `seguridad` + `identidades` + `organizacion` + `proveedores`; Nain se enfoca en `cambios` + `cmdb`; Alexis en `problemas` + `conocimiento`; y Miguel en `tickets` + `incidentes` + `solicitudes` + `reportes` + `operacion` + `plataforma`.
- **Suite E2E ITIL 4:** 30/30 pruebas dinámicas aprobadas con 100% de éxito en ejecución.

---

## 4. Fuentes de Verdad

| Tema | Fuente Normativa |
| :--- | :--- |
| **Código y Contratos** | `src/modules/**/index.ts`, `src/modules/**/ui.ts`, `src/shared/` |
| **Persistencia** | `db/migrations/`, `db/seed.sql`, Base de Datos PostgreSQL viva |
| **Menú y Navegación** | Tablas `opciones_menu` y `opciones_menu_perfiles`; `src/shared/lib/menu.ts` |
| **Seguridad y RBAC** | `src/shared/lib/auth.ts`, `capacidades.ts`, `api-auth.ts`, `page-auth.ts` |
| **Enrutamiento y Middleware**| `src/app/`, `src/middleware.ts`, `next.config.js` |
| **Quality Gates** | `npx tsc --noEmit`, `npm run build`, `scripts/test_e2e_lifecycle.js` |
