# Informe de Ejecución — Fase 7: Activos

**Fecha:** 17 de Noviembre de 2026  
**Rama:** `reestructuracion-menu`  
**Objetivo:** Consolidar el sub-agrupador «Activos» (#21110) reduciendo de 33 a exactamente 8 pantallas activas, eliminando 5 sub-agrupadores obsoletos (#21120, #21125, #21128, #21143, #21148), fusionando vistas con control N1 sin escalamiento de privilegios (R5), y erradicando pantallas no ITIL 4 de inventario físico en campo y compras.

---

## 1. Tabla de Verificación de Resultados: Esperado vs. Real

| Criterio | Esperado | Real | Estado |
|---|---|---|:---:|
| **E7.1** Hijos en «Activos» | Exactamente 8 pantallas según Anexo B (#21114, #21118, #21112, #21126, #21132, #21144, #21123, #21154) | 8 pantallas en orden 1 a 8 bajo #21110 | **CUMPLIDO** |
| **E7.2** Opciones eliminadas | 25 opciones de menú eliminadas (#21111, #21113, #21115, #21116, #21117, #21119, #21120, #21122, #21124, #21125, #21127, #21128, #21129, #21130, #21131, #21143, #21145, #21146, #21147, #21148, #21149, #21150, #21151, #21152, #21155) | 25 opciones eliminadas de `opciones_menu` y cascada de permisos | **CUMPLIDO** |
| **E7.3** Referencias a URLs viejas | 0 referencias a rutas eliminadas bajo `/plataforma/activos/` | 0 referencias activas; actualizadas a rutas canónicas y parámetros `?vista=` | **CUMPLIDO** |
| **E7.4** No-escalación `mi-area` | Quien tenía `mi-area` (Gestor de Área) no obtiene acceso a `todos` | Verificado: Gestor de Área solo accede a `mi-area` en inventario y contratos | **CUMPLIDO** |
| **E7.5** Ciclo de vida | Alta de activo genera código patrimonial; asignación, custodia, mantenimiento y baja operativos | Esquema de codificación patrimonial sembrado operativo; vistas integradas | **CUMPLIDO** |
| **E7.6** Build y Tests | Tests N1/Fase 7 verdes, TypeScript código 0, Build Next.js exitoso | Suite 100% PASS, `tsc --noEmit` código 0, build sin errores | **CUMPLIDO** |
| **E7.7** Informe | Documento `informe-fase-7.md` emitido | Este informe | **CUMPLIDO** |

---

## 2. Estructura Final del Sub-agrupador Activos (#21110)

| ID | Nombre | URL Canónica | Orden | Vistas N1 Asignadas |
|---|---|---|:---:|---|
| **#21114** | Inventario de activos | `/plataforma/activos/inventario` | 1 | `todos`, `mi-area`, `operativo`, `importar` |
| **#21118** | Mis activos | `/plataforma/activos/mis-activos` | 2 | *Sin pestañas (Autoservicio)* |
| **#21112** | Asignación, custodia y actas | `/plataforma/activos/asignaciones` | 3 | *Sin pestañas (Directo)* |
| **#21126** | Mantenimiento y garantías | `/plataforma/activos/mantenimiento` | 4 | `garantias`, `reparaciones` |
| **#21132** | Licencias de software | `/plataforma/activos/licencias` | 5 | `licencias`, `consulta`, `catalogo-software` |
| **#21144** | Contratos y proveedores | `/plataforma/activos/contratos` | 6 | `contratos`, `mi-area`, `renovaciones`, `proveedores` |
| **#21123** | Bajas de activos | `/plataforma/activos/bajas` | 7 | `gestion`, `consulta` |
| **#21154** | Configuración de activos | `/plataforma/activos/configuracion` | 8 | `tipos-atributos`, `fabricantes-modelos`, `ubicaciones`, `listas` |

Nota sobre CMDB (#21133):
- #21133 permanece bajo #21109 con sus opciones intactas para su reestructuración en la Fase 8.
- #21153 (`cmdb-relaciones`) fue re-parentado a #21133 para su consolidación en Fase 8.

---

## 3. Matriz de No-Escalación de Privilegios (R5)

| Perfil | #21114 (Inventario) | #21126 (Mantenimiento) | #21132 (Licencias) | #21144 (Contratos) | #21123 (Bajas) | #21154 (Configuración) |
|---|---|---|---|---|---|---|
| **Administrador (1)** | `todos`, `mi-area`, `operativo`, `importar` | `garantias`, `reparaciones` | `licencias`, `consulta`, `catalogo-software` | `contratos`, `mi-area`, `renovaciones`, `proveedores` | `gestion`, `consulta` | `tipos-atributos`, `fabricantes-modelos`, `ubicaciones`, `listas` |
| **Técnico (2)** | `operativo` | `reparaciones` | `consulta` | *Sin acceso* | *Sin acceso* | *Sin acceso* |
| **Supervisor (4)** | `todos` | *Sin acceso* | `licencias` | *Sin acceso* | *Sin acceso* | *Sin acceso* |
| **Gestor Área (5)** | `mi-area` | *Sin acceso* | *Sin acceso* | `mi-area` | *Sin acceso* | *Sin acceso* |
| **Auditor (6)** | `todos` | *Sin acceso* | `licencias` | *Sin acceso* | `consulta` | *Sin acceso* |
| **Gestor Activos (9)** | `todos`, `importar` | `garantias` | `catalogo-software` | `contratos`, `renovaciones`, `proveedores` | `gestion` | `fabricantes-modelos`, `ubicaciones`, `listas` |

---

## 4. Archivos Físicos Depurados

Se eliminaron físicamente 25 páginas/directorios de rutas obsoletas:
- `src/app/plataforma/activos/area/`
- `src/app/plataforma/activos/bajas/consulta/`
- `src/app/plataforma/activos/bajas/renovaciones/`
- `src/app/plataforma/activos/cmdb/` (y su subruta `analisis/`)
- `src/app/plataforma/activos/configuracion/ciclos-vida-transiciones/`
- `src/app/plataforma/activos/configuracion/cmdb-relaciones/`
- `src/app/plataforma/activos/configuracion/licencias-contratos/`
- `src/app/plataforma/activos/configuracion/tipos-modelos-atributos/` (y subrutas `catalogos/`, `fabricantes/`, `ubicaciones/`)
- `src/app/plataforma/activos/conteos/`
- `src/app/plataforma/activos/contratos-area/`
- `src/app/plataforma/activos/importacion/`
- `src/app/plataforma/activos/inventario-fisico/`
- `src/app/plataforma/activos/inventario-operativo/`
- `src/app/plataforma/activos/licencias/catalogo-software/`
- `src/app/plataforma/activos/licencias/consulta/`
- `src/app/plataforma/activos/licencias/cumplimiento/`
- `src/app/plataforma/activos/proveedores/`
- `src/app/plataforma/activos/recepcion/`
- `src/app/plataforma/activos/renovaciones/`
- `src/app/plataforma/activos/reparaciones/`
- `src/app/plataforma/activos/reportes/`

R2 verificado: 0 llamadas a `redirect(` de obsolescencia.
