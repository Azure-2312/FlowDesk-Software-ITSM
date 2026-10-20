# FlowDesk ITSM — Sistema de Gestión de Servicios de TI

Plataforma ITSM alineada con **ITIL 4**, **ISO/IEC 20000-1**, **ISO/IEC 27001**, **ISO/IEC 19770-1** y **COBIT 2019**.

Construida con **Next.js 14 (App Router)**, **TypeScript 5 en modo estricto**, **React 18** y **PostgreSQL 15 (Supabase)** mediante el driver `pg` y un pool de conexiones.

---

## 1. Estado actual

| Indicador | Valor |
| :--- | ---: |
| Perfiles oficiales | 10 |
| Módulos de dominio | 17 |
| Opciones de menú activas | 227 |
| Filas de visibilidad del menú | 388 |
| Route handlers en `src/app/api` | 207 |
| Páginas bajo `src/app/plataforma` | 227 |
| Tablas base en `public` | 126 (incluye 4 respaldos del menú) |
| Vistas | 1 (`vista_ticket`) |

La separación por módulos está cerrada:

- **Incidentes:** `/plataforma/incidentes/*`
- **Solicitudes:** `/plataforma/solicitudes/*`
- **Catálogos de servicios:** `/plataforma/servicios/catalogo`, `/plataforma/incidentes/catalogo` y `/plataforma/solicitudes/catalogo`
- **Reportes:** `/plataforma/reportes/{operativos,auditoria,productividad,activos,cambios,decisiones,problemas,area,tableros}`

Las rutas anteriores de reportes y del catálogo del técnico se conservan como redirecciones de compatibilidad.

---

## 2. Inicio rápido

```bash
npm install
# Crear .env.local con DATABASE_URL y JWT_SECRET (mínimo 32 caracteres)
npm run dev
```

Abrir `http://localhost:3000`.

### Verificación antes de cada entrega

```bash
npx tsc --noEmit
npm run build
```

Ambos comandos deben quedar en verde. Los cambios de base de datos se aplican desde `db/migrations/` y se reflejan en `db/seed.sql` cuando corresponda.

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
| [Prompts de Configuración](./DOCUMENTACIÓN/PROMPTS_CONFIGURACION_ADMIN.md) | Especificaciones de Problemas, Cambios y Activos/CMDB. |
| [Catálogo de Servicios](./DOCUMENTACIÓN/CATALOGO_SERVICIOS_DATOS.md) | Datos de los 30 servicios de referencia. |

---

## 5. Perfiles

1. Administrador
2. Técnico
3. Solicitante
4. Supervisor
5. Gestor de Área
6. Auditor
7. Aprobador (CAB)
8. Gestor de Cambios
9. Gestor de Activos y Configuración
10. Gestor de Problemas

La visibilidad de cada perfil se controla con `opciones_menu_perfiles`; la autorización de APIs y páginas se valida con capacidades y guardas centralizadas.

---

## 6. Flujo de trabajo

- Ramas principales: `main`, `feature/alexis-problemas-conocimiento`, `prueba-conexion` y `verify-junior`.
- Cada cambio debe pasar `npx tsc --noEmit` y `npm run build` antes del commit.
- Los cambios de menú se aplican por migración y se sincronizan con `db/seed.sql`.
- Después de cada entrega se actualizan las ramas de integración y se publica en los remotos.

---

**FlowDesk ITSM** — Proyecto académico y operativo de mesa de servicio.
