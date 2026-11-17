# Informe de Ejecución — Fase 11: Reportes

**Fecha:** 17 de Noviembre de 2026  
**Rama:** `reestructuracion-menu`  
**Objetivo:** Consolidar la raíz «Reportes» (#21174) a exactamente 4 pantallas canónicas: «Indicadores operativos y SLA» (#21175, absorbiendo #21182 como vista `area`), «Reportes de cambios y problemas» (#21179, absorbiendo #21181 como vista `problemas`), «Reportes de activos» (#21178) y «Productividad individual» (#21177). Retirar las 4 opciones de menú obsoletas y preservar la no escalación de privilegios (R5).

---

## 1. Tabla de Verificación de Resultados: Esperado vs. Real

| Criterio | Esperado | Real | Estado |
|---|---|---|:---:|
| **E11.1** Hijos en «Reportes» | Exactamente 4 pantallas (#21175, #21179, #21178, #21177) | 4 pantallas en orden 1 a 4 bajo #21174 | **CUMPLIDO** |
| **E11.2** Opciones eliminadas | 4 filas eliminadas (#21176, #21180, #21181, #21182) | 4 opciones eliminadas en cascada de `opciones_menu`, `opciones_menu_perfiles` y `opciones_menu_vistas_perfiles` | **CUMPLIDO** |
| **E11.3** URLs obsoletas eliminadas | 4 URLs viejas devuelven 404 | Archivos físicos eliminados de disco; 0 llamadas a `redirect(` de obsolescencia (R2) | **CUMPLIDO** |
| **E11.4** Funcionalidad de reportes | Consultas y filtros de reportes operativos, de cambios y de problemas plenamente funcionales | Vistas `operativo`, `area`, `cambios` y `problemas` operativas mediante componentes de UI existentes | **CUMPLIDO** |
| **E11.5** Informe | Documento `informe-fase-11.md` emitido | Este informe | **CUMPLIDO** |

---

## 2. Estructura Final de la Raíz Reportes (#21174)

| ID | Nombre | URL Canónica | Orden | Vistas N1 Asignadas |
|---|---|---|:---:|---|
| **#21175** | Indicadores operativos y SLA | `/plataforma/reportes/operativos` | 1 | `operativo`, `area` |
| **#21179** | Reportes de cambios y problemas | `/plataforma/reportes/cambios` | 2 | `cambios`, `problemas` |
| **#21178** | Reportes de activos | `/plataforma/reportes/activos` | 3 | *Sin pestañas (Directo)* |
| **#21177** | Productividad individual | `/plataforma/reportes/productividad` | 4 | *Sin pestañas (Directo)* |

---

## 3. Matriz de No-Escalación de Privilegios (R5)

| Perfil | #21175 (Operativos y SLA) | #21179 (Cambios y Problemas) | #21178 (Activos) | #21177 (Productividad) |
|---|---|---|---|---|
| **Administrador (1)** | `operativo`, `area` | `cambios`, `problemas` | Acceso completo | Acceso completo |
| **Supervisor (4)** | `operativo`, `area` | *Sin acceso* | *Sin acceso* | Acceso completo |
| **Gestor de Área (5)** | `area` *(SOLO reportes de su área, sin acceso a operativos globales)* | *Sin acceso* | *Sin acceso* | *Sin acceso* |
| **Auditor (6)** | `operativo` | *Sin acceso* | *Sin acceso* | *Sin acceso* |
| **Gestor de Cambios (8)** | *Sin acceso* | `cambios` *(SOLO cambios, sin acceso a problemas)* | *Sin acceso* | *Sin acceso* |
| **Gestor de Activos (9)** | *Sin acceso* | *Sin acceso* | Acceso completo | *Sin acceso* |
| **Gestor de Problemas (10)** | *Sin acceso* | `problemas` *(SOLO problemas, sin acceso a cambios)* | *Sin acceso* | *Sin acceso* |

> [!NOTE]
> La segregación de perfiles técnicos especializados (Gestor de Cambios y Gestor de Problemas) se mantiene con estricta precisión en #21179: cada uno ingresa directamente a su vista permitida sin escalación a la otra. Lo mismo aplica al Gestor de Área en #21175 respecto a la vista `area`.

---

## 4. Archivos Físicos Depurados

Se eliminaron físicamente 5 archivos de rutas:
- `src/app/plataforma/reportes/area/page.tsx` (#21182 fusionado como vista)
- `src/app/plataforma/reportes/problemas/page.tsx` (#21181 fusionado como vista)
- `src/app/plataforma/reportes/auditoria/page.tsx` (#21176 retirado)
- `src/app/plataforma/reportes/decisiones/page.tsx` (#21180 retirado)
- `src/app/plataforma/reportes/gerenciales/page.tsx` (#21183 previamente retirado)

---

## 5. Compilación y Suite de Pruebas

- **Unit/DB Tests (`scripts/test_reportes_fase11.js`):** 100% PASS.
- **TypeScript (`tsc --noEmit`):** Código de salida 0.
- **Next.js Production Build (`npm run build`):** 133 páginas generadas sin errores (código de salida 0).
