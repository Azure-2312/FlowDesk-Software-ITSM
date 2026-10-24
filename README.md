# FlowDesk ITSM — Sistema de Gestión de Servicios de TI

Plataforma ITSM alineada con **ITIL 4**, **ISO/IEC 20000-1**, **ISO/IEC 27001**, **ISO/IEC 19770-1** y **COBIT 2019**.

Construida con **Next.js 14 (App Router)**, **TypeScript 5 en modo estricto**, **React 18** y **PostgreSQL 15 (Supabase)** mediante el driver `pg` y un pool de conexiones.

---

## 1. Estado actual

| Indicador | Valor |
| :--- | ---: |
| Perfiles oficiales | 10 |
| Módulos de dominio | 17 |
| Opciones de menú activas | 230 |
| Filas de visibilidad del menú | 393 |
| Route handlers en `src/app/api` | 209 |
| Páginas bajo `src/app/plataforma` | 312 |
| Tablas base en `public` | 132 |
| Vistas | 1 (`vista_ticket`) |

Arquitectura modular canónica y unificación de rutas:

- **Paneles de control unificados por perfil:** `/plataforma/operacion/paneles/<rol>` para los 10 roles del sistema.
- **Incidentes:** `/plataforma/incidentes/*`
- **Solicitudes:** `/plataforma/solicitudes/*`
- **Catálogos de servicios:** `/plataforma/servicios/catalogo`, `/plataforma/incidentes/catalogo` y `/plataforma/solicitudes/catalogo`
- **Separación de Activos y CMDB:** Activos (`/plataforma/activos/*`) y CMDB (`/plataforma/cmdb/*`) operan de forma independiente y coordinada.
- **Gestión de Turnos y Disponibilidad:** `/plataforma/organizacion/turnos-ausencias` para administración institucional de turnos, guardias 24x7 y reemplazo técnico.
- **Reportes Gerenciales:** `/plataforma/reportes/gerenciales` con KPIs consolidados de SLA, tiempos de resolución MTTR y exportación CSV.
- **Trazabilidad y Bloqueo de Conflictos:** Validación de existencia de CI, registro de auditoría en `cmdb_actualizacion` y prevención de solapamientos horarios en `src/modules/cambios`.

---

## 2. Inicio rápido

```bash
npm install
# Crear .env.local con DATABASE_URL y JWT_SECRET (mínimo 32 caracteres)
npm run dev
```

Abrir `http://localhost:3000`.

### Verificación de calidad y pruebas

```bash
# Verificación estática estricta de TypeScript
npx tsc --noEmit

# Compilación de producción
npm run build

# Suite oficial de pruebas dinámicas E2E (30 pruebas ITIL 4)
node scripts/test_e2e_lifecycle.js
```

Todos los comandos deben quedar en verde. Los cambios de base de datos se aplican desde `db/migrations/` y se reflejan en `db/seed.sql`.

---

## 3. Arquitectura en una imagen

```text
src/app/                  Cascarones delgados: page.tsx, layout.tsx, route.ts
src/modules/<dominio>/    Lógica completa por dominio (servicios, API, vistas, UI)
  index.ts                Contrato de servidor
  ui.ts                   Contrato de UI (cuando aplica)
src/shared/               Infraestructura transversal: db, auth, RBAC, menú, errores
db/                       schema.sql, seed.sql y migraciones incrementales
```

Reglas principales:

1. `src/app` no contiene reglas de negocio ni SQL de dominio.
2. Un módulo solo consume a otro por `@/modules/<modulo>` o `@/modules/<modulo>/ui`.
3. `src/shared` nunca importa módulos.
4. `tickets` es el núcleo congelado; Incidentes y Solicitudes lo extienden con el modelo C (`ticket` + `ticket_incidente` + `ticket_solicitud`).
5. Las guardas de API y de página se reutilizan desde `src/shared/lib`; no se duplican.
6. Todos los tableros de aterrizaje por rol convergen canónicamente en `/plataforma/operacion/paneles/<rol>`.

El detalle completo está en **[Arquitectura y Código](./DOCUMENTACIÓN/ARQUITECTURA_Y_CODIGO.md)**.

---

## 4. Documentación

Toda la documentación vive en **[`DOCUMENTACIÓN/`](./DOCUMENTACIÓN/)**. El índice maestro es **[`DOCUMENTACIÓN/README.md`](./DOCUMENTACIÓN/README.md)**.

| Documento | Contenido |
| :--- | :--- |
| [Arquitectura y Código](./DOCUMENTACIÓN/ARQUITECTURA_Y_CODIGO.md) | Módulos, contratos, rutas, seguridad, modelo de datos, fases y calidad. |
| [Menús y Perfiles](./DOCUMENTACIÓN/MENUS_Y_PERFILES.md) | 10 perfiles, SoD, catálogo único de menú, árbol por perfil y cobertura. |
| [Requerimientos](./DOCUMENTACIÓN/REQUERIMIENTOS.md) | RF, RNF y reglas de negocio. |
| [Historias de Usuario](./DOCUMENTACIÓN/HISTORIAS_DE_USUARIO.md) | Épicas, HU y criterios de aceptación. |
| [Trazabilidad](./DOCUMENTACIÓN/TRAZABILIDAD.md) | Matriz funcionalidad ↔ HU ↔ RF ↔ RN. |
| [Plan de Equipo y Scrum](./DOCUMENTACIÓN/PLAN_EQUIPO_Y_SCRUM.md) | Equipo, propiedad de módulos, Git, sprints y calidad. |
| [Catálogo de Servicios](./DOCUMENTACIÓN/CATALOGO_SERVICIOS_DATOS.md) | Datos de los 30 servicios de referencia. |

---

## 5. Perfiles

1. **Administrador:** Gobierno, seguridad RBAC, configuración de catálogos y plataformas.
2. **Técnico:** Resolutor N1/N2/N3 de incidentes, solicitudes, tareas de cambio y problemas.
3. **Solicitante:** Autoservicio de requerimientos, reporte de incidentes y consulta KCS.
4. **Supervisor:** Capacidad de soporte, monitoreo de SLA, asignación y turnos.
5. **Gestor de Área:** Dictamen de requerimientos de negocio, activos y cambios de área.
6. **Auditor:** Inspección read-only, matriz de segregación de funciones SoD y logs forenses.
7. **Aprobador (CAB):** Evaluación colegiada de RFCs y dictamen de cambios mayores.
8. **Gestor de Cambios:** Planificación, detección de solapamientos, ventanas e impacto CMDB.
9. **Gestor de Activos:** Ciclo de vida ITAM, contratos, proveedores y semáforo SAM de licencias.
10. **Gestor de Problemas:** Análisis causa raíz (RCA), errores conocidos (KEDB) y problemas mayores.

La visibilidad de cada perfil se controla con `opciones_menu_perfiles`; la autorización de APIs y páginas se valida con capacidades y guardas centralizadas.

---

## 6. Flujo de trabajo

- Ramas principales sincronizadas: `main`, `feature/alexis-problemas-conocimiento`, `prueba-conexion` y `verify-junior`.
- Cada cambio debe pasar `npx tsc --noEmit`, `npm run build` y la suite E2E antes del commit.
- Los cambios de menú se aplican por migración y se sincronizan con `db/seed.sql`.
- Después de cada entrega se actualizan las ramas de integración y se publica en los remotos.

---

**FlowDesk ITSM** — Sistema de Gestión de Servicios de TI.
