# Informe de Cierre — Fase 0: Línea Base y Descubrimiento

## Resumen Ejecutivo
Fase de descubrimiento y establecimiento de la línea base completada exitosamente. Se capturaron las métricas exactas del sistema antes de la reestructuración, se respaldó la base de datos completa (131 tablas), se creó el punto de retorno (`pre-reestructuracion-menu` en la rama `reestructuracion-menu`), y se generaron todos los inventarios y análisis de dependencias sin modificar una sola línea de código en `src/`.

---

## Tabla de Verificación de Resultados Esperados (Fase 0)

| Código | Verificación Requerida | Esperado | Real | Estado | Evidencia |
|---|---|---|---|:---:|---|
| **E0.1** | Rama y Tag creados | Rama `reestructuracion-menu` y tag `pre-reestructuracion-menu` | Rama `reestructuracion-menu` activa, tag `pre-reestructuracion-menu` fijado | ✔ | `git branch` & `git tag -l` |
| **E0.2** | Salud de la línea base | tsc verde, build verde, fallos de test conocidos | tsc: 0 errores. Build: 268 rutas OK. Tests: 25/30 y 19/25 (fallos previos por payload RFC documentados) | ✔ | `npx tsc --noEmit` & `npm run build` |
| **E0.3** | Inventario de rutas | Todas las rutas de `src/app` en CSV | 463 archivos de rutas inventariados con sus guards y componentes | ✔ | `docs/reestructuracion/00-rutas-antes.csv` |
| **E0.4** | Inventario de menú y permisos | 227 IDs conciliados con el manual | 227 IDs activos en BD (12 raíces, 20 sub-agrupadores, 195 pantallas) | ✔ | `SELECT count(*) FROM opciones_menu` = 227 |
| **E0.5** | Matriz de acceso ANTES | 10 perfiles × 227 IDs | 2,270 combinaciones evaluadas en matriz | ✔ | `docs/reestructuracion/matriz-acceso-antes.csv` |
| **E0.6** | Inventarios de ref y redirect | Conteo total de referencias y redirecciones | 2,108 referencias a URLs; 89 llamadas de redirección/push | ✔ | `referencias-antes.csv`, `redirecciones-antes.csv` |
| **E0.7** | Análisis de dependencias | Cada función de `ELIMINAR` analizada | Matriz completa de dependencias cruzadas (ausencias, respuestas, SoD, KEDB, etc.) | ✔ | `docs/reestructuracion/dependencias-eliminacion.md` |
| **E0.8** | Decisiones 0.10 | 6 decisiones de arquitectura registradas | Caso A en CIs, N6 necesario, retiro de correo, post-login a inicio, Camino B en N1 | ✔ | `docs/reestructuracion/00-decisiones.md` |
| **E0.9** | Código `src/` intacto | 0 archivos modificados en `src/` | `git diff --stat` vacío en `src/` | ✔ | `git status` |
