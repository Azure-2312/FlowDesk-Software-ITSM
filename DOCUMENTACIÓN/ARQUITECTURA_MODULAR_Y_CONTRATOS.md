# Arquitectura Modular, Contratos y Propiedad de Carpetas (FlowDesk)

**Documento normativo de la arquitectura modular.** Define que cada modulo vive
en su propia carpeta, se trabaja de forma independiente y solo se comunica con
los demas a traves de un contrato publico. Aplica a los 5 integrantes del equipo.

Complementa a `DISTRIBUCION_EQUIPO_Y_METODOLOGIA_SCRUM.md` (plan Scrum) y a
`ESQUEMA_MENUS_POR_PERFIL.md` (menus). Ante cualquier duda de "puedo importar
esto?", manda este documento.

---

## 1. Principios

1. **Aislamiento por carpeta.** La logica de cada funcionalidad vive en
   `src/modules/<modulo>/`. Las rutas de Next.js en `src/app` son cascarones
   delgados (`page.tsx` / `route.ts`) que reexportan o montan el modulo.
2. **Un contrato por modulo.** Cada modulo expone un unico punto de entrada
   (`index.ts`). Los demas modulos importan **solo** desde ahi.
3. **Trabajo independiente.** Un integrante puede editar su modulo completo sin
   tocar el de otro. Si necesita algo de otro modulo, usa su contrato; si el
   contrato no lo expone, se lo pide al dueno.
4. **Grafo aciclico.** El grafo de dependencias entre modulos nunca tiene ciclos
   ni dependencias invertidas (p. ej. `incidentes -> supervisor`).

---

## 2. Reglas del nucleo compartido (aplican a todos)

### 2.1 Modulo `tickets` = nucleo congelado

`tickets` (incidentes, solicitudes, cambios, problemas y tickets generales)
es la espina dorsal del sistema. Su contrato tiene **dos puntos de entrada**,
segun el entorno:

- **Servidor:** `@/modules/tickets`
  - Servicios: `listarTickets`, `crearTicket`, `obtenerDetalleTicket`,
    `actualizarTicket`, `listarCatalogosTickets`, `crearComentarioTicket`, etc.
  - Handlers reutilizables (con alias):
    `ticketsGet`/`ticketsPost`, `ticketDetalleGet`/`ticketDetallePatch`,
    `ticketComentariosPost`.
- **Cliente (UI):** `@/modules/tickets/ui`
  - `TablaTickets`, `PresentadorRfcAprobador`, `PresentadorProblemaGestor`.

> Nunca importes de `@/modules/tickets/...` con ruta profunda. Usa el contrato.

Cualquier cambio al contrato de `tickets` requiere revision del Tech Lead
(Miguel), porque afecta a incidentes, solicitudes, cambios y problemas.

### 2.2 `src/shared/**` = capa transversal

- **Quien puede importar shared:** cualquier modulo.
- **Quien NO puede ser importado por shared:** ningun modulo. `shared` nunca
  depende de `src/modules`.
- Contenido:
  - `shared/lib`: `db`, `auth` (JWT), `capacidades` (RBAC), `api-auth` (guards),
    `errores`, `validaciones`, `configuracionModulo`, utilidades.
  - `shared/components/admin`: UI de configuracion generica
    (`BarraAccionesComun`, `ModalPublicacion`, `ModalHistorialVersiones`,
    `ModalRestaurarFabrica`, `ModalVistaPrevia`).

### 2.3 Autenticacion de APIs: prohibido duplicar guards

- El guard de endpoints vive **una sola vez** en `shared/lib/api-auth.ts`:
  - `sesionConCapacidad(capacidad)` -> `{ sesion, error }` (uso en route handlers).
  - `autorizarApi(req, capacidad)` y `obtenerSesionDeRequest(req)`.
- **Prohibido** crear `api/guardia.ts` / `api/guardiaGestor.ts` por modulo. Si un
  controlador necesita validar sesion + capacidad, importa de
  `@/shared/lib/api-auth`.

### 2.4 Regla de importacion entre modulos

```ts
// CORRECTO
import { listarCmdb } from "@/modules/cmdb";
import { TablaTickets } from "@/modules/tickets/ui";

// INCORRECTO (ruta profunda hacia otro modulo)
import { listarCmdb } from "@/modules/cmdb/services/cmdbService";
```

Dentro del propio modulo si se permiten rutas relativas (`./services/...`) o el
alias del propio modulo.

---

## 3. Mapa de modulos y contratos

**18 modulos** bajo `src/modules/`: **7 de nucleo** (con cruces, los trabaja el
responsable del nucleo), **10 libres** (sin cruces, repartidos entre el equipo) y **1
modulo de consolas de rol** (`perfiles`).

### Nucleo (con cruces; propiedad del responsable del nucleo)

| Modulo | Dominio de negocio | Contrato |
| :--- | :--- | :--- |
| `tickets` | Nucleo ITSM: tickets, catalogos, comentarios | `index.ts` (servidor) + `ui.ts` (cliente) |
| `incidentes` | Gestion de incidentes e incidentes mayores | `index.ts` |
| `solicitudes` | Gestion de solicitudes de servicio | `index.ts` |
| `cambios` | Habilitacion del cambio (RFC), CAB/ECAB, aprobaciones | `index.ts` |
| `problemas` | Gestion de problemas / KEDB | `index.ts` |
| `seguridad` | Autenticacion, sesiones, RBAC | `index.ts` |
| `plataforma` | Salud, mantenimiento de datos, logs, auditoria, reportes | `index.ts` |

### Consolas de rol (UI por perfil)

| Modulo | Dominio de negocio | Contrato |
| :--- | :--- | :--- |
| `perfiles` | Consolas de los perfiles/roles (`tecnico`, `supervisor`, `gestor-area`, `aprobador`, `auditor`, `gestor-cambios`) | subcarpetas por rol (cada una con su `api/`, `services/`, `views/`) |

### Libres (sin cruces; repartidos entre el equipo)

| Modulo | Dominio de negocio | Contrato |
| :--- | :--- | :--- |
| `servicios` | Catalogo de servicios y SLA | `index.ts` |
| `operacion` | Operacion de servicios, eventos y resiliencia | `index.ts` |
| `activos` | ITAM: inventario, licencias, contratos, bajas/aprobaciones | `index.ts` |
| `cmdb` | SACM: CIs, relaciones, calidad de CMDB, analisis, auditoria | `index.ts` |
| `proveedores` | Proveedores y contratos | `index.ts` |
| `identidades` | Usuarios, perfiles y credenciales | `index.ts` |
| `organizacion` | Departamentos, tecnicos, colaboradores, ausencias | `index.ts` |
| `configuracion` | Menu, categorias, formularios/flujos, parametros | `index.ts` |
| `conocimiento` | Base de conocimiento | `index.ts` |
| `reportes` | Reportes gerenciales y BI | `index.ts` |

### 3.1 Nota sobre la CMDB (Opcion B)

La **CMDB es un modulo propio (`cmdb`)**, independiente de `activos` (ITAM).
Se apoya en los activos con un puente de datos (sin acoplar codigo):

```
elemento_configuracion.id_activo  ->  activo.id_activo
```

- `cmdb` expone topologia, analisis de impacto, reconciliacion Activo <-> CI,
  lineas base, inexactitudes y auditoria.
- `activos` (ITAM) consulta las tablas CMDB por SQL para sus KPIs; no importa
  codigo del modulo `cmdb`.

### 3.2 Regla inversa: las consolas de rol viven en `perfiles`

Los antiguos modulos de rol (`tecnico`, `supervisor`, `gestor-area`, `aprobador`,
`auditor`, `gestor-cambios`) **dejan de ser modulos de primer nivel**. Ahora:

1. **La logica de dominio** que vivia dentro de una consola de rol se mueve a su
   modulo de dominio (el rol solo conserva su UI y su alcance). Ejemplos:
   - El portal del **Gestor de Cambios** delego su logica a `cambios`.
   - El portal del **Aprobador** reparte su logica entre `cambios`, `activos` y
     `problemas` (bajas/renovaciones por monto y cierre de problemas mayores).
   - La consola del **Supervisor** delega aprobacion tecnica y reprogramacion a
     `cambios`, y la resolucion de bajas a `activos`.
   - La consola del **Tecnico** delega la toma de ticket a `tickets`, el acuse de
     cambio a `cambios` y la sala de crisis a `incidentes`.
   - La consola del **Auditor** delega la auditoria de CMDB a `cmdb` y la
     disposicion de bajas a `activos`.
2. Las **consolas** se consolidan en **un solo modulo** `src/modules/perfiles/`,
   con una subcarpeta por perfil (`perfiles/<rol>/`). Cada consola conserva solo
   su `views/`, sus `api/` y la logica que **de verdad es de rol** (alcance por
   area/departamento, tableros, recordatorios personales, recursos de equipo,
   informes de auditoria, etc.).

Consecuencia: el modulo `perfiles` **no** debe contener reglas de dominio ni
importar rutas profundas de otros modulos; consume los contratos
`@/modules/<dominio>`. Si una consola necesita cambiar logica de dominio, se pide
al dueno de ese modulo de dominio (los del nucleo o los libres asignados).

La constante transversal de aprobaciones por monto
(`UMBRAL_MONTO_APROBACION`) vive en `src/shared/lib/parametros.ts` para no acoplar
`cambios` con `activos`.

---

## 4. Propiedad de carpetas por integrante

Cada integrante es **dueno exclusivo** de sus carpetas. Nadie mas las edita; los
cambios cruzados se piden por Pull Request.

| Integrante | Dominio | Modulos (`src/modules/...`) | Rutas (`src/app/...`) |
| :--- | :--- | :--- | :--- |
| **Nucleo** (responsable del nucleo) | Nucleo ITSM con cruces + seguridad | `tickets`, `incidentes`, `solicitudes`, `cambios`, `problemas`, `seguridad`, `plataforma` | `/tickets`, `/incidentes`, `/solicitudes`, `/cambios`, `/problemas`, `/login`, `/mi-cuenta`, `/plataforma/admin/*` del nucleo |
| **Miguel** (Tech Lead) | Servicios, operacion, SLA y aprobaciones | `servicios`, `operacion`, `perfiles/supervisor`, `perfiles/aprobador` (+ `shared/lib`) | `/plataforma/admin/servicios/*`, `/plataforma/operacion/*`, `/plataforma/supervisor/*`, `/plataforma/aprobador/*` |
| **Lourdes (Lu)** | Configuracion, consola tecnica y consola de area | `configuracion`, `perfiles/tecnico`, `perfiles/gestor-area` (+ `shared/components`) | `/plataforma/admin/menu`, `/plataforma/admin/notificaciones`, `/plataforma/admin/tickets-*`, `/plataforma/tecnico/*`, `/plataforma/gestor-area/*` |
| **Alexis** | Conocimiento y mejora continua | `conocimiento`, `reportes` | `/plataforma/conocimiento*`, `/plataforma/dashboard` |
| **Nain** | Activos, CMDB, proveedores y consola de cambios | `activos`, `cmdb`, `proveedores`, `perfiles/gestor-cambios` | `/plataforma/activos/*`, `/plataforma/gestor-activos/*`, `/plataforma/admin/activos-config/*`, `/plataforma/gestor-cambios/*`, `/plataforma/proveedores` |
| **Junior** | IAM, organizacion y auditoria | `identidades`, `organizacion`, `perfiles/auditor` | `/plataforma/admin/usuarios`, `/plataforma/admin/perfiles`, `/plataforma/admin/departamentos*`, `/plataforma/admin/tecnicos`, `/plataforma/auditor/*` |

### 4.1 Consolas huerfanas: asignacion de territorio

Las carpetas de rutas `/gestor-activos/*` y `/gestor-problemas/*` **no son
modulos**: son cascarones de `src/app` que montan vistas que ya viven en los
modulos correspondientes. Se asignan a sus duenos:

| Carpeta de rutas (`src/app/plataforma/...`) | Dueno | Vistas que monta |
| :--- | :--- | :--- |
| `/gestor-activos/*` | **Nain** | `@/modules/activos/views/*`, `@/modules/cmdb/views/*` |
| `/gestor-cambios/*` | **Nain** | `@/modules/perfiles/gestor-cambios/*` |
| `/gestor-problemas/*` | **Nucleo** | `@/modules/problemas/views/*` |
| `/supervisor/*`, `/gestor-area/*`, `/tecnico/*`, `/aprobador/*`, `/auditor/*` | segun tabla sec. 4 | `@/modules/perfiles/<rol>/views/*` |

Regla: si hay que cambiar la logica de una consola, se cambia en el **modulo**
(nunca en la ruta). La ruta solo se toca para cambiar el montaje.

### 4.2 Carpetas compartidas (sin dueno unico)

- `src/shared/lib/**` -> mantiene **Miguel** (nucleo). Cambios por PR.
- `src/shared/components/**` -> mantiene **Lourdes** (UI).
- `src/app/api/**` -> cada ruta pertenece al modulo que reexporta.

---

## 5. Flujo Git y control de calidad

- Ramas: `main`, `feature/alexis-problemas-conocimiento`, `prueba-conexion`,
  `verify-junior` (mas la rama de trabajo de cada integrante).
- Antes de commitear codigo: `npx tsc --noEmit` y `npm run build` en verde.
- Tras cada cambio de migracion: merge y push a las 4 ramas.
- Migraciones de base de datos en `db/migrations/` (numeradas por fecha).

---

## 6. Historico de cambios estructurales

| Fecha | Cambio |
| :--- | :--- |
| 2026-10 | Guard `sesionConCapacidad` centralizado en `shared/lib/api-auth`; se eliminan 7 guards duplicados. |
| 2026-10 | Contrato del nucleo `tickets` congelado (`index.ts` + `ui.ts`); los consumidores dejan de usar rutas profundas. |
| 2026-10 | CMDB extraida de `activos` a su propio modulo `cmdb` (Opcion B); se elimina el modulo vacio `analitica`. |
| 2026-10 | `administracion` se parte en `identidades`, `organizacion`, `configuracion` y `plataforma`. |
| 2026-10 | Nuevo analisis de CMDB: topologia, impacto, reconciliacion Activo <-> CI e historial (`/activos/cmdb/analisis`). |
| 2026-10 | **Regla inversa**: los 6 modulos de rol se consolidan en `src/modules/perfiles/<rol>/` (un solo modulo `perfiles`); su logica de dominio se reparte a `cambios`, `activos`, `problemas`, `tickets`, `incidentes` y `cmdb`. |
