# Informe de Ejecución — Fase 4: Mesa de Servicio (Incidentes, Solicitudes, Asignación, SLA)

**Fecha:** 17 de noviembre de 2026  
**Rama:** `reestructuracion-menu`  
**Commit:** `reestructuracion(F4): mesa de servicio (incidentes, solicitudes, asignacion, sla)`

---

## 1. Resumen Ejecutivo
Se ejecutó la Fase 4 del plan integral de reestructuración del menú, implementando la unificación y reordenamiento del módulo neurálgico **Mesa de Servicio** (#21023). Se consolidaron múltiples bandejas redundantes en pantallas de listado canónicas con pestañas de vistas basadas en la infraestructura N1, se eliminó la variante no fijada en alta de tickets absorbiendo el registro para terceros en selector autorizado (N5), se fusionó la sala de crisis colaborativa dentro de incidentes mayores, se simplificaron las configuraciones a dos vistas operativas esenciales (`campos`, `reglas`), se ascendieron el Centro de asignación (#21251) y el Monitor de SLA (#21045) a la raíz del módulo, y se retiraron 27 filas obsoletas en base de datos junto con la totalidad de sus archivos y rutas huérfanas.

---

## 2. Tabla de Criterios de Aceptación y Resultados (Esperado vs. Real)

| # | Criterio de Aceptación | Esperado | Real | Estado |
|---|---|---|---|:---:|
| **E4.1** | Árbol de «Mesa de Servicio» (#21023) | Idéntico a la jerarquía del Anexo B: sub-agrupador Incidentes (#21228, 6 pantallas), sub-agrupador Solicitudes (#21229, 5 pantallas), Centro de asignación (#21251) y Monitor de SLA (#21045). | Verificado en BD: 4 hijos directos en #21023; 6 hijos ordenados en #21228; 5 hijos ordenados en #21229. | **CONFORME** |
| **E4.2** | 27 filas de menú eliminadas | Eliminación de #21024, #21044, #21046–#21049, #21230, #21232, #21234, #21235, #21241, #21243, #21245, #21246, #21239, #21186, #21187, #21252–#21261. | 0 registros en `opciones_menu` y `opciones_menu_perfiles` para los 27 IDs. | **CONFORME** |
| **E4.3** | Cero referencias a URLs viejas | 0 referencias residuales en `src` a las 26 rutas eliminadas/fusionadas de estos bloques. | Escaneo exhaustivo en todo `src` arrojó **0 resultados**. | **CONFORME** |
| **E4.4** | Soporte de vistas en `TablaTickets` | `TablaTickets` soporta exactamente las 6 vistas canónicas: `{mios, bandeja, asignados, departamento, resueltos, todos}`. Eliminadas ramas obsoletas y agregada apertura profunda por `?abrir=<id>`. | Tipo de prop `vista` restringido a las 6 vistas exactas; soporte reactivo para `?abrir=<id>` implementado. | **CONFORME** |
| **E4.5** | Prueba de permisos efectiva | Un técnico o usuario sin capacidad `todos` no puede ver la pestaña ni consultar `/api/tickets?vista=todos`. Los auditores mantienen modo solo lectura en `ModalDetalleTicket`. | Verificado en `ticketsController.ts` (`403 Forbidden` garantizado por `CAPACIDAD_POR_VISTA`), `vistas.ts` (resolución segura de vistas permitidas por perfil) y `ModalDetalleTicket.tsx` (arquetipo `AUDITORIA_FORENSE`). | **CONFORME** |
| **E4.6** | Compilación y tests verdes | `tsc --noEmit` y `npm run build` sin errores; suite `scripts/test_mesa_servicio_n5.js` aprobada al 100 %. | `tsc --noEmit` exitoso (0 errores). `npm run build` completado exitosamente. Suite `scripts/test_mesa_servicio_n5.js` con 100 % de tests verdes. | **CONFORME** |
| **E4.7** | Documentación de la fase | `docs/reestructuracion/informe-fase-4.md` | Presente documento. | **CONFORME** |

---

## 3. Inventario de Modificaciones Físicas

### 3.1 Archivos Creados
1. `db/migrations/20261117_mesa_servicio_n5.sql`: Migración DDL/DML que reordena y reubica opciones bajo #21023, puebla `opciones_menu_vistas_perfiles` para las 6 pantallas compuestas, garantiza permisos de acceso en `opciones_menu_perfiles` y elimina las 27 filas obsoletas.
2. `src/app/plataforma/servicios/sla/page.tsx`: Pantalla oficial de Monitor de SLA con pestañas de vistas (`riesgo`, `incumplimientos`, `objetivos`, `mi-cola`, `grupo`).
3. `scripts/test_mesa_servicio_n5.js`: Suite automatizada de verificación de la Fase 4.

### 3.2 Archivos y Directorios Eliminados Físicamente
1. `src/app/plataforma/incidentes/page.tsx` (#21230)
2. `src/app/plataforma/incidentes/asignados/` (#21232)
3. `src/app/plataforma/incidentes/resueltos/` (#21234)
4. `src/app/plataforma/incidentes/departamento/` (#21235)
5. `src/app/plataforma/tickets/gestion/auditoria/` (#21258)
6. `src/app/plataforma/solicitudes/page.tsx` (#21241)
7. `src/app/plataforma/solicitudes/asignados/` (#21243)
8. `src/app/plataforma/solicitudes/resueltos/` (#21245)
9. `src/app/plataforma/solicitudes/departamento/` (#21246)
10. `src/app/plataforma/tickets/gestion/crear/` (#21257)
11. `src/app/plataforma/incidentes/sala-crisis/` (#21239)
12. `src/app/plataforma/incidentes/configuracion/flujo/` (#21187)
13. `src/app/plataforma/solicitudes/configuracion/flujo/` (#21186)
14. `src/app/plataforma/tickets/gestion/colaboradores/` (#21252)
15. `src/app/plataforma/tickets/gestion/bandeja/` (#21253)
16. `src/app/plataforma/tickets/gestion/resueltos/` (#21254)
17. `src/app/plataforma/tickets/gestion/departamento/` (#21255)
18. `src/app/plataforma/tickets/gestion/todos/` (#21256)
19. `src/app/plataforma/avisos/` (#21259)
20. `src/app/plataforma/tickets/mesa/buscar/` (#21260)
21. `src/app/plataforma/tickets/mesa/registrar/`
22. `src/app/plataforma/tickets/gestion/mios/` (#21261)
23. `src/app/plataforma/servicios/sla/escalamientos/` (#21045 viejo)
24. `src/app/plataforma/servicios/sla/incumplimientos/` (#21046)
25. `src/app/plataforma/servicios/sla/objetivos/` (#21047)
26. `src/app/plataforma/servicios/sla/semaforo-cola/` (#21048)
27. `src/app/plataforma/servicios/sla/semaforo-grupo/` (#21049)

### 3.3 Archivos Modificados
- `src/app/plataforma/incidentes/bandeja/page.tsx`: Conectado a `exigirVistaPagina` con `PestanasVista` y paso dinámico de la vista activa a `TablaTickets`.
- `src/app/plataforma/solicitudes/bandeja/page.tsx`: Conectado a `exigirVistaPagina` con `PestanasVista` y paso dinámico de la vista activa a `TablaTickets`.
- `src/app/plataforma/incidentes/mayores/page.tsx`: Conectado a `exigirVistaPagina` con soporte de vistas `listado` y `sala-crisis`.
- `src/modules/incidentes/views/VistaIncidentesMayores.tsx`: Añadido enlace directo a la sala de crisis con deep linking (`?vista=sala-crisis&abrir=<id>`).
- `src/app/plataforma/incidentes/configuracion/page.tsx`: Conectado a `exigirVistaPagina` con vistas `campos` y `reglas`.
- `src/app/plataforma/solicitudes/configuracion/page.tsx`: Conectado a `exigirVistaPagina` con vistas `campos` y `reglas`.
- `src/modules/servicios/views/VistaSlaSemaforo.tsx`: Añadido soporte para propiedad `alcanceInicial?: "mios" | "area"`.
- `src/modules/tickets/components/TablaTickets.tsx`: Reducido el tipo `vista` a las 6 canónicas, añadido efecto reactivo para deep linking `?abrir=<id>`.
- `src/modules/tickets/services/ticketsService.ts`: Retirada rama huérfana `auditoria`.
- `src/modules/tickets/gestion/crear/VistaTicketsGestionCrear.tsx`: Eliminada la variante `!tipoFijo` y el bloque de selección de tipo global; selector de solicitante condicionado a perfiles autorizados (1, 2, 4, 5, 8).
- `src/app/plataforma/incidentes/crear/page.tsx` y `src/app/plataforma/solicitudes/crear/page.tsx`: Rutas de retorno (`rutaLista`) actualizadas a las nuevas URLs canónicas con vistas.
- `src/app/plataforma/incidentes/[id]/page.tsx` y `src/app/plataforma/solicitudes/[id]/page.tsx`: Enlaces de retorno dirigidos a las bandejas con vistas.
- `src/app/plataforma/tickets/page.tsx`: Redirecciones de tickets apuntando a bandejas con vista canónica.
- `src/modules/operacion/paneles/gestor-area/VistaPanelArea.tsx`: Enlace a tickets de departamento actualizado a `/plataforma/incidentes/bandeja?vista=departamento`.
- `src/modules/operacion/paneles/solicitante/VistaPanelSolicitante.tsx`: Enlace de registro de tickets actualizado a `/plataforma/incidentes/crear`.

---

## 4. Estado de la Base de Datos

### 4.1 Raíz «Mesa de Servicio» (#21023)
```
id_opcion_menu | orden |        nombre         |               url_menu                
----------------+-------+-----------------------+---------------------------------------
         21228 |     1 | Incidentes            | 
         21229 |     2 | Solicitudes           | 
         21251 |     3 | Centro de asignacion  | /plataforma/tickets/gestion/asignar
         21045 |     4 | Monitor de SLA        | /plataforma/servicios/sla
```

### 4.2 Sub-agrupador «Incidentes» (#21228)
```
id_opcion_menu | orden |           nombre            |               url_menu                
----------------+-------+-----------------------------+---------------------------------------
         21236 |     1 | Registrar incidente         | /plataforma/incidentes/crear
         21231 |     2 | Mis incidentes              | /plataforma/incidentes/mios
         21233 |     3 | Bandeja de incidentes       | /plataforma/incidentes/bandeja
         21237 |     4 | Catalogo de incidentes      | /plataforma/incidentes/catalogo
         21238 |     5 | Incidentes mayores          | /plataforma/incidentes/mayores
         21240 |     6 | Configuración de incidentes | /plataforma/incidentes/configuracion
```

### 4.3 Sub-agrupador «Solicitudes» (#21229)
```
id_opcion_menu | orden |            nombre            |               url_menu                
----------------+-------+------------------------------+---------------------------------------
         21247 |     1 | Registrar solicitud          | /plataforma/solicitudes/crear
         21242 |     2 | Mis solicitudes              | /plataforma/solicitudes/mios
         21244 |     3 | Bandeja de solicitudes       | /plataforma/solicitudes/bandeja
         21248 |     4 | Catalogo de solicitudes      | /plataforma/solicitudes/catalogo
         21250 |     5 | Configuración de solicitudes | /plataforma/solicitudes/configuracion
```

---

## 5. Conclusión
La Fase 4 se encuentra completada al 100 % con estricta adherencia a las reglas R1 a R14, eliminando las 27 filas obsoletas, conservando los permisos efectivos sin escalada (R5), sin shims temporales ni archivos puente (R2 y R4) y con compilación y tests verdes (R8).
