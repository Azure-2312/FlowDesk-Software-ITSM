# Informe de Ejecución — Fase 5: Cambios (Habilitación de Cambios)

**Fecha:** 17 de noviembre de 2026  
**Rama:** `reestructuracion-menu`  
**Commit:** `reestructuracion(F5): cambios (habilitacion de cambios)`

---

## 1. Resumen Ejecutivo
Se ejecutó la Fase 5 del plan de reestructuración del menú, transformando la raíz **Cambios** (#21059) en una estructura plana y simplificada de exactamente **8 pantallas canónicas** sin sub-agrupadores intermedios, alineada con las prácticas ITIL 4 de *Change Enablement*. Se unificó el alta de RFC absorbiendo el formulario duplicado (#21086), se concentraron los múltiples informes de impacto y alcances de Mis cambios (#21068) en 6 vistas controladas sin escalación de privilegios (R5), se consolidaron el calendario de ventanas y la programación en una sola pantalla (#21071), se unificó la consola de gestión (#21073) en 4 vistas correspondientes al ciclo de vida del cambio, se concentró la gobernanza de CAB/ECAB (#21082) en 4 vistas incluyendo quórum y miembros trasladados de la configuración del flujo, se fusionó la consulta y administración de modelos estándar (#21090), se conservó la revisión post-implementación (PIR #21077), y se simplificaron las 25 pestañas dispersas de configuración a exactamente 5 vistas operativas (#21191). Se eliminaron 27 filas obsoletas en base de datos y se suprimieron físicamente todas las páginas y carpetas obsoletas sin dejar redirecciones de obsolescencia (R1, R2).

---

## 2. Tabla de Criterios de Aceptación y Resultados (Esperado vs. Real)

| # | Criterio de Aceptación | Esperado | Real | Estado |
|---|---|---|---|:---:|
| **E5.1** | 8 hijos planos en «Cambios» (#21059) | Exactamente 8 pantallas directas bajo #21059 en el orden especificado: Solicitar cambio (#21070), Mis cambios (#21068), Gestión de cambios (#21073), CAB y ECAB (#21082), Calendario de cambios (#21071), Modelos de cambio estándar (#21090), Revisión post-implementación (#21077), Configuración de cambios (#21191). | Verificado en BD: 8 hijos planos bajo #21059 con orden 1..8 exacto y URLs canónicas. | **CONFORME** |
| **E5.2** | 27 filas de menú eliminadas | Eliminación de #21060, #21062–#21067, #21069, #21072, #21074–#21076, #21078–#21081, #21083–#21087, #21192–#21197. | 0 registros en `opciones_menu`, `opciones_menu_perfiles` y `opciones_menu_vistas_perfiles` para los 27 IDs. | **CONFORME** |
| **E5.3** | Cero referencias a URLs viejas | 0 referencias residuales en `src` a las 23 URLs eliminadas/fusionadas de Cambios. | Escaneo exhaustivo en todo `src` arrojó **0 resultados**. Enlaces actualizados en paneles, fichas y tablas. | **CONFORME** |
| **E5.4** | Preservación de privilegios (R5) | Los perfiles conservan acceso únicamente a sus alcances legítimos: Perfil 5 (Gestor de Área) solo accede a `afectan-area`; Perfil 4 (Supervisor) solo a `afectan-equipo`; Perfil 6 (Auditor) solo a `historial` en gestión; Perfil 7 (Aprobador) no accede a `miembros`. | Verificado en `opciones_menu_vistas_perfiles` y en la suite `scripts/test_cambios_fase5.js`. | **CONFORME** |
| **E5.5** | Cero redirecciones de obsolescencia (R2) | Páginas eliminadas responden 404, sin shims con `redirect()`. | Eliminados los shims previos de `gestion/page.tsx` y `configuracion/page.tsx`; 0 `redirect(` en páginas de cambios. | **CONFORME** |
| **E5.6** | Pestañas de configuración | 5 vistas en #21191 (`campos`, `listas`, `riesgo`, `autoridad`, `calendario`) + `miembros` en CAB (#21082). | Implementado en `src/app/plataforma/cambios/configuracion/page.tsx` y `src/app/plataforma/cambios/cab/page.tsx`. | **CONFORME** |
| **E5.7** | Compilación y tests verdes | `tsc --noEmit` y `npm run build` sin errores; suite `scripts/test_cambios_fase5.js` aprobada al 100 %. | Suite `scripts/test_cambios_fase5.js` con 100 % de tests verdes; typecheck y build verificados. | **CONFORME** |
| **E5.8** | Documentación de la fase | `docs/reestructuracion/informe-fase-5.md` | Presente documento. | **CONFORME** |

---

## 3. Inventario de Modificaciones Físicas

### 3.1 Archivos Creados
1. `db/migrations/20261117_cambios_n6.sql`: Migración DDL/DML que aplana la raíz #21059 a 8 opciones, puebla `opciones_menu_vistas_perfiles` para las 6 pantallas compuestas, garantiza permisos en `opciones_menu_perfiles` y elimina las 27 filas obsoletas.
2. `src/modules/cambios/views/cab/VistaCabMiembros.tsx`: Componente contenedor para la vista `miembros` de CAB/ECAB, conectando con la API de configuración de comités y gestión de quórum.
3. `scripts/test_cambios_fase5.js`: Suite automatizada de verificación de la Fase 5.

### 3.2 Archivos y Directorios Eliminados Físicamente
1. `src/app/plataforma/cambios/gestion/crear/` (#21086 absorbido en #21070)
2. `src/app/plataforma/cambios/gestion/evaluacion/` (#21073 absorbido en vista `por-evaluar`)
3. `src/app/plataforma/cambios/gestion/autorizaciones/` (#21079 absorbido en vista `aprobacion`)
4. `src/app/plataforma/cambios/gestion/ejecucion/` (#21078 absorbido en vista `ejecucion`)
5. `src/app/plataforma/cambios/gestion/todos/` (#21080 absorbido en vista `historial`)
6. `src/app/plataforma/cambios/gestion/conflictos/` (#21074 eliminado, integrado en expediente)
7. `src/app/plataforma/cambios/gestion/modelos/` (#21075 absorbido en vista `administracion`)
8. `src/app/plataforma/cambios/gestion/cab/` (#21085 absorbido en vista `dictamen`)
9. `src/app/plataforma/cambios/gestion/cab-agenda/` (ruta duplicada absorbida en vista `agenda`)
10. `src/app/plataforma/cambios/cab/agenda/` (#21082/#21084 absorbidos en vista `agenda`)
11. `src/app/plataforma/cambios/cab/emergencia/` (#21083 absorbido en vista `emergencia`)
12. `src/app/plataforma/cambios/configuracion/formulario/` (#21191 absorbido en `/configuracion`)
13. `src/app/plataforma/cambios/configuracion/flujo-evaluacion/` (#21193 UI retirada, miembros trasladados a CAB)
14. `src/app/plataforma/cambios/configuracion/tipos-requisitos/` (#21196 absorbido en vista `autoridad`)
15. `src/app/plataforma/cambios/configuracion/notificaciones-calendario/` (#21192, #21194, #21195, #21197 absorbidos en vista `calendario`)
16. `src/app/plataforma/cambios/implementacion/` (#21064 absorbido en vista `por-implementar`)
17. `src/app/plataforma/cambios/impacto/interrupciones/` (#21063 absorbido en vista `afectan-area`)
18. `src/app/plataforma/cambios/impacto/equipo/` (#21065 absorbido en vista `afectan-equipo`)
19. `src/app/plataforma/cambios/impacto/servicios/` (#21066 absorbido en vista `afectan-servicios`)
20. `src/app/plataforma/cambios/historial/` (#21067 absorbido en vista `historial`)
21. `src/app/plataforma/cambios/calendario/` (#21062 absorbido en vista `calendario`)
22. `src/app/plataforma/cambios/programacion/` (#21069 absorbido en vista `programacion`)
23. `src/app/plataforma/cambios/gestion/programacion/` (#21076 absorbido en vista `programacion`)

### 3.3 Archivos Modificados
- `src/app/plataforma/cambios/mis-cambios/page.tsx`: Conectado a `exigirVistaPagina` con `PestanasVista` y soporte de 6 vistas: `en-tramite`, `por-implementar`, `afectan-area`, `afectan-equipo`, `afectan-servicios`, `historial`.
- `src/app/plataforma/cambios/gestion/calendario/page.tsx`: Conectado a `exigirVistaPagina` con `PestanasVista` y soporte de 2 vistas: `calendario` y `programacion`.
- `src/app/plataforma/cambios/gestion/page.tsx`: Reemplazada la redirección de obsolescencia por la consola multvista de gestión de cambios con 4 vistas: `por-evaluar`, `aprobacion`, `ejecucion`, `historial`.
- `src/app/plataforma/cambios/cab/page.tsx`: Conectado a `exigirVistaPagina` con `PestanasVista` y soporte de 4 vistas: `agenda`, `emergencia`, `dictamen`, `miembros`.
- `src/app/plataforma/cambios/modelos/page.tsx`: Conectado a `exigirVistaPagina` con `PestanasVista` y soporte de 2 vistas: `consulta` y `administracion`.
- `src/app/plataforma/cambios/gestion/pir/page.tsx`: Protegido con `exigirMenuPagina("/plataforma/cambios/gestion/pir")`.
- `src/app/plataforma/cambios/configuracion/page.tsx`: Reemplazada la redirección por pantalla multvista con 5 vistas: `campos`, `listas`, `riesgo`, `autoridad`, `calendario`.
- `src/modules/cambios/views/VistaCambiosImpacto.tsx`: Soporte para prop `tipoImpacto` ("equipo" vs. "servicios") con encabezados dinámicos.
- `src/modules/cambios/config/formulario/VistaFormularioCambio.tsx`: Soporte para prop `pestanaFija` ocultando las pestañas internas obsoletas.
- `src/modules/cambios/config/tipos-requisitos/VistaTiposRequisitos.tsx`: Soporte para prop `pestanaFija` ("matriz_autoridad").
- `src/modules/cambios/config/notificaciones-calendario/VistaNotificacionesCalendario.tsx`: Restringidas las pestañas visibles a ventanas, periodos de congelamiento y feriados.
- `src/modules/cambios/gestion/[id]/VistaCambiosGestionDetalle.tsx`: Enlaces de retorno y referencias a CAB actualizados a las nuevas rutas y vistas canónicas.
- `src/modules/cambios/gestion/crear/VistaCambiosGestionCrear.tsx`: Redirecciones post-creación y cancelaciones dirigidas a `/plataforma/cambios/gestion?vista=historial`.
- `src/modules/cambios/gestion/calendario/VistaCambiosGestionCalendario.tsx`: Enlaces actualizados a `/plataforma/cambios/nuevo` y `/plataforma/cambios/gestion?vista=historial`.
- `src/modules/cambios/gestion/todos/VistaCambiosGestionTodos.tsx`: Enlaces de alta actualizados a `/plataforma/cambios/nuevo`.
- `src/modules/cambios/views/VistaCambios.tsx`: Enlaces actualizados a rutas canónicas.
- `src/modules/tickets/components/TablaTickets.tsx`: Enlace de ficha de RFC actualizado a `/plataforma/cambios/gestion?vista=historial`.
- `src/modules/operacion/paneles/gestor-cambios/VistaPanelGestion.tsx`: Enlaces rápidos dirigidos a las vistas canónicas correspondientes.
- `src/modules/operacion/paneles/aprobador/VistaPanelAprobador.tsx`: Enlaces de agenda CAB actualizados a `/plataforma/cambios/cab`.
- `src/app/plataforma/admin/[...slug]/page.tsx`: Enrutamiento administrativo legado actualizado a las nuevas vistas canónicas de cambios.

---

## 4. Estado Final de la Raíz «Cambios» (#21059)

```
id_opcion_menu | orden |             nombre             |                 url_menu                 
----------------+-------+--------------------------------+------------------------------------------
         21070 |     1 | Solicitar cambio               | /plataforma/cambios/nuevo
         21068 |     2 | Mis cambios                    | /plataforma/cambios/mis-cambios
         21073 |     3 | Gestión de cambios             | /plataforma/cambios/gestion
         21082 |     4 | CAB y ECAB                     | /plataforma/cambios/cab
         21071 |     5 | Calendario de cambios          | /plataforma/cambios/gestion/calendario
         21090 |     6 | Modelos de cambio estándar     | /plataforma/cambios/modelos
         21077 |     7 | Revisión post-implementación   | /plataforma/cambios/gestion/pir
         21191 |     8 | Configuración de cambios       | /plataforma/cambios/configuracion
```

Total opciones bajo #21059: exactamente 8 opciones planas.
Total opciones eliminadas: 27 opciones.
Total vistas relacionales en `opciones_menu_vistas_perfiles`: 23 configuraciones.
