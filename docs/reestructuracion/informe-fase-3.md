# Informe de Ejecución — Fase 3: Mi Trabajo y Mi Cuenta (N3 & N4)

**Fecha:** 17 de noviembre de 2026  
**Rama:** `reestructuracion-menu`  
**Commit:** `reestructuracion(F3): mi trabajo y mi cuenta`

---

## 1. Resumen Ejecutivo
Se ejecutó la Fase 3 del plan de reestructuración del menú, implementando las decisiones arquitectónicas **N3** (Inicio unificado) y **N4** (Mis aprobaciones centralizadas), dejando la raíz «Mi trabajo» (#21001) con exactamente 5 opciones canónicas en orden estricto 1..5, y la raíz «Mi cuenta» (#21225) con su única opción legítima (#21226 «Mi perfil y seguridad»).

En esta fase se ejecutaron los cinco bloques comprometidos:
1. **Bloque 3.1 (Inicio, N3):** Reemplazo de los 10 paneles de rol y «Tableros» (#21183) por una única pantalla canónica institucional `/plataforma/inicio` (#21022), renderizando las 10 vistas de rol existentes mediante `PestanasVista` y resolviendo la vista por defecto según el perfil activo (con D-01: solicitante como vista base universal). Se eliminaron físicamente las 10 rutas legadas bajo `/plataforma/operacion/paneles/*` y `/plataforma/reportes/tableros`.
2. **Bloque 3.2 (Mis aprobaciones, N4):** Unificación de las 8 bandejas dispersas y 2 historiales en la pantalla `/plataforma/aprobaciones` (#21249) con vistas `pendientes`, `historial` e `historial-area`. La bandeja de pendientes incorpora filtro por tipo (`?tipo=`) soportando solicitudes de servicio, cambios CAB, supervisión técnica, aprobación de área y bajas de activos.
3. **Bloque 3.3 (Delegaciones):** Fusión de la entrada duplicada `/plataforma/solicitudes/area/delegacion` (#21003) en la ruta canónica `/plataforma/seguridad/delegaciones` (#21004) protegida por `exigirMenuPagina`, conservando el acceso para perfiles 1, 5 y 7.
4. **Bloque 3.4 (Funciones personales/de equipo eliminadas):** Retiro definitivo (REC-ELI) de sub-agrupadores vacíos (#21002, #21008) y de las pantallas no requeridas: Ausencias y guardias (#21009), Vistas compartidas (#21010), Mi agenda (#21018) y Mi desempeño (#21019).
5. **Bloque 3.5 (Mis tareas y Mi cuenta):** Verificación de estabilidad y actualización de enlaces internos en Mis tareas (#21020) y Mi cuenta (#21225).

---

## 2. Tabla de Criterios de Aceptación y Resultados (Esperado vs. Real)

| # | Criterio de Aceptación | Esperado | Real | Estado |
|---|---|---|---|:---:|
| **E3.1** | Estructura de «Mi trabajo» (#21001) | Exactamente 5 hijos en orden 1..5: Inicio (#21022), Mis tareas (#21020), Mis aprobaciones (#21249), Delegaciones (#21004), Notificaciones (#21265). | Verificado en BD: 5 filas en orden 1 a 5 con padres correctos. | **CONFORME** |
| **E3.2** | 23 filas de menú eliminadas | Eliminación de #21002, #21003, #21005, #21006, #21007, #21008, #21009, #21010, #21011–#21017, #21018, #21019, #21021, #21061, #21088, #21089, #21121, #21183. | 0 registros presentes en `opciones_menu` y `opciones_menu_perfiles` para los 23 IDs. | **CONFORME** |
| **E3.3** | Cero referencias residuales | 0 referencias a `/plataforma/operacion/paneles`, `/solicitudes/area/`, `/seguridad/historial-aprobaciones` en `src`. | Escaneo exhaustivo arrojó **0 resultados**. | **CONFORME** |
| **E3.4** | Totales de aprobaciones idénticos (V-17) | Los totales pendientes por tipo coinciden con la línea base de BD para los usuarios de prueba. | Solicitudes: 21 (esperado 21). Cambios: 21 (esperado 21). Bajas: 0 (esperado 0). Coincidencia exacta al 100 %. | **CONFORME** |
| **E3.5** | Compilación y tests verdes | `tsc --noEmit` y `npm run build` sin errores; suite `scripts/test_mi_trabajo_n3_n4.js` aprobada. | `tsc --noEmit` exitoso (0 errores). `npm run build` exitoso (240 páginas). Test suite 6/6 aprobados. | **CONFORME** |
| **E3.6** | Documentación de la fase | `docs/reestructuracion/informe-fase-3.md` | Presente documento. | **CONFORME** |

---

## 3. Inventario de Modificaciones Físicas

### 3.1 Archivos Creados
1. `db/migrations/20261117_mi_trabajo_n3_n4.sql`: Migración DDL/DML que renombra y reubica #21022 («Inicio»), reordena #21020, mueve y renombra #21249 («Mis aprobaciones»), reubica #21004 («Delegaciones»), asigna permisos de vistas N1 en `opciones_menu_vistas_perfiles` y elimina las 23 filas de menú obsoletas.
2. `src/app/plataforma/inicio/page.tsx`: Pantalla institucional unificada de Inicio que renderiza dinámicamente los 10 paneles según el perfil activo o pestañas de vista si tiene más de uno.
3. `src/modules/plataforma/views/VistaAprobacionesUnificadas.tsx`: Vista client-side unificada de aprobaciones pendientes con contadores dinámicos por tipo (`solicitud`, `cambio`, `cambio-tecnica`, `cambio-negocio`, `baja`) y despacho a las acciones existentes.
4. `src/app/plataforma/aprobaciones/page.tsx`: Pantalla institucional de Mis aprobaciones con navegación por pestañas de vistas (`pendientes`, `historial`, `historial-area`).
5. `scripts/test_mi_trabajo_n3_n4.js`: Suite de pruebas automatizadas para verificación de la Fase 3.

### 3.2 Archivos y Directorios Eliminados Físicamente
1. `src/app/plataforma/operacion/paneles/administrador/page.tsx`
2. `src/app/plataforma/operacion/paneles/aprobador/page.tsx`
3. `src/app/plataforma/operacion/paneles/auditor/page.tsx`
4. `src/app/plataforma/operacion/paneles/gestor-activos/page.tsx`
5. `src/app/plataforma/operacion/paneles/gestor-area/page.tsx`
6. `src/app/plataforma/operacion/paneles/gestor-cambios/page.tsx`
7. `src/app/plataforma/operacion/paneles/gestor-problemas/page.tsx`
8. `src/app/plataforma/operacion/paneles/solicitante/page.tsx`
9. `src/app/plataforma/operacion/paneles/supervisor/page.tsx`
10. `src/app/plataforma/operacion/paneles/tecnico/page.tsx`
11. `src/app/plataforma/operacion/paneles/` (directorio completo)
12. `src/app/plataforma/reportes/tableros/page.tsx`
13. `src/app/plataforma/reportes/tableros/` (directorio)
14. `src/app/plataforma/reportes/disenador/page.tsx`
15. `src/app/plataforma/reportes/disenador/` (directorio)
16. `src/app/plataforma/dashboard/page.tsx`
17. `src/app/plataforma/dashboard/` (directorio)
18. `src/modules/reportes/views/VistaDashboard.tsx`
19. `src/app/plataforma/cambios/aprobaciones/tecnicas/page.tsx`
20. `src/app/plataforma/cambios/aprobaciones/negocio/page.tsx`
21. `src/app/plataforma/cambios/aprobaciones/page.tsx`
22. `src/app/plataforma/cambios/aprobaciones/` (directorio completo)
23. `src/app/plataforma/activos/bajas/aprobacion/page.tsx`
24. `src/app/plataforma/activos/bajas/aprobacion/` (directorio)
25. `src/app/plataforma/solicitudes/aprobaciones/page.tsx`
26. `src/app/plataforma/solicitudes/aprobaciones/` (directorio)
27. `src/app/plataforma/solicitudes/area/delegacion/page.tsx`
28. `src/app/plataforma/solicitudes/area/historial/page.tsx`
29. `src/app/plataforma/solicitudes/area/` (directorio completo)
30. `src/modules/solicitudes/views/VistaDelegacionAprobaciones.tsx`
31. `src/app/plataforma/seguridad/historial-aprobaciones/page.tsx`
32. `src/app/plataforma/seguridad/historial-aprobaciones/` (directorio)
33. `src/app/plataforma/tickets/gestion/aprobaciones/page.tsx`
34. `src/app/plataforma/tickets/gestion/aprobaciones/` (directorio)
35. `src/app/plataforma/operacion/equipo/ausencias/page.tsx`
36. `src/app/plataforma/operacion/equipo/vistas/page.tsx`
37. `src/app/plataforma/operacion/equipo/` (directorio)
38. `src/app/plataforma/operacion/agenda/page.tsx`
39. `src/app/plataforma/operacion/agenda/` (directorio)
40. `src/app/plataforma/operacion/desempeno/page.tsx`
41. `src/app/plataforma/operacion/desempeno/` (directorio)
42. `src/app/plataforma/tickets/desempeno/page.tsx`
43. `src/app/plataforma/tickets/desempeno/` (directorio)

### 3.3 Archivos Modificados
- `src/app/plataforma/layout.tsx`: Enlace del logotipo actualizado hacia `/plataforma/inicio`.
- `src/shared/components/layout/SelectorPerfil.tsx`: Redirección tras cambio de perfil actualizado a `/plataforma/inicio`.
- `src/modules/seguridad/views/VistaLogin.tsx`: Redirección post-autenticación exitosa dirigida a `/plataforma/inicio`.
- `src/app/403/page.tsx`, `src/app/not-found.tsx`, `src/app/plataforma/page.tsx`, `src/app/plataforma/admin/[...slug]/page.tsx`: Rutas de retorno al inicio apuntando a `/plataforma/inicio`.
- `src/app/plataforma/tickets/page.tsx`: Redirecciones de aprobadores dirigidas a `/plataforma/aprobaciones` y fallback institucional a `/plataforma/inicio`.
- `src/app/plataforma/solicitudes/[id]/page.tsx`: Ruta de retorno para el perfil aprobador actualizada a `/plataforma/aprobaciones`.
- `src/app/plataforma/seguridad/delegaciones/page.tsx`: Actualizado con guard institucional `exigirMenuPagina("/plataforma/seguridad/delegaciones")`.
- `src/modules/operacion/agenda/VistaTareasOperativas.tsx`: Enlace canónico de tareas corregido a `/plataforma/operacion/tareas`.
- `src/modules/operacion/paneles/gestor-area/VistaPanelArea.tsx`: Enlaces de aprobaciones actualizados a `/plataforma/aprobaciones?tipo=solicitud` y `?tipo=cambio-negocio`.
- `src/modules/operacion/paneles/supervisor/VistaPanelSupervisor.tsx`: Enlace de aprobaciones de cambio actualizado a `/plataforma/aprobaciones?tipo=cambio-tecnica`.
- `src/modules/reportes/views/VistaReportesOperativos.tsx`: Retirado enlace obsoleto hacia `/plataforma/reportes/tableros`.

---

## 4. Estado de la Base de Datos

### 4.1 Raíz «Mi trabajo» (#21001)
```
id_opcion_menu | orden |      nombre       |               url_menu                
----------------+-------+-------------------+---------------------------------------
         21022 |     1 | Inicio            | /plataforma/inicio
         21020 |     2 | Mis tareas        | /plataforma/operacion/tareas
         21249 |     3 | Mis aprobaciones  | /plataforma/aprobaciones
         21004 |     4 | Delegaciones      | /plataforma/seguridad/delegaciones
         21265 |     5 | Notificaciones    | /plataforma/notificaciones
```

### 4.2 Raíz «Mi cuenta» (#21225)
```
id_opcion_menu | orden |        nombre         |            url_menu            
----------------+-------+-----------------------+--------------------------------
         21226 |     1 | Mi perfil y seguridad | /plataforma/mi-cuenta/perfil
```

---

## 5. Conclusión
La Fase 3 se encuentra completada al 100 % con estricta adherencia a las reglas R1 a R14, sin shims temporales (R4), sin destrucción de datos (R6) y con compilación y tests completamente verdes (R8).
