# Análisis de Dependencias de Funciones a Eliminar (Fase 0.9)

Este análisis detalla los componentes, rutas, controladores, tablas y capacidades de cada función cuya eliminación está instruida en el prompt maestro (Anexo A: acción `ELIMINAR` y pestañas depuradas).

---

## 1. Módulo Mi Trabajo y Mi Cuenta
### #21002 (Sub-agrupador Aprobaciones) y #21008 (Sub-agrupador Equipo)
- **UI:** Nodos padre en `opciones_menu`.
- **Dependencias:** Sus hijos funcionales son fusionados en «Mis aprobaciones» o eliminados. Al quedar sin hijos, los sub-agrupadores se eliminan de `opciones_menu`.
- **Riesgo:** Ninguno.

### #21009 Ausencias y guardias del equipo (`/plataforma/operacion/equipo/ausencias`)
- **UI:** `src/app/plataforma/operacion/equipo/ausencias/page.tsx`, `VistaAusenciasGuardias.tsx`.
- **Backend:** `src/modules/operacion/services/ausenciasService.ts`, tabla `tecnico_ausencias`.
- **Verificación de dependencias:** ¿El motor de asignación automática de tickets lee ausencias? El motor actual en `src/modules/tickets/services/ticketsGestionService.ts` asigna basado en carga de trabajo y disponibilidad inmediata por departamento, sin bloqueo por `tecnico_ausencias` (0 registros en BD).
- **Acción:** Se elimina la UI de gestión (`page.tsx` y vistas). La tabla `tecnico_ausencias` se conserva en BD (R6).

### #21010 Vistas y respuestas compartidas (`/plataforma/operacion/equipo/vistas`)
- **UI:** `src/app/plataforma/operacion/equipo/vistas/page.tsx`, `VistaVistasRespuestas.tsx`.
- **Backend:** `respuestas_predefinidas` (0 registros en BD).
- **Verificación:** `ModalDetalleTicket` permite comentarios directos sin depender de la UI de gestión de plantillas compartidas.
- **Acción:** Se elimina la pantalla de configuración y rutas huérfanas.

### #21018 Mi agenda y disponibilidad (`/plataforma/operacion/agenda`) & #21019 Mi desempeño (`/plataforma/operacion/desempeno`)
- **UI:** Páginas bajo `/plataforma/operacion/` y vistas personales.
- **Dependencias:** Desempeño queda cubierto institucionalmente por «Productividad individual» en Reportes (#21177).
- **Acción:** Eliminación limpia de UI y rutas asociadas.

---

## 2. Módulo Mesa de Servicio
### #21024 (Sub-agrupador Operación de la mesa) & #21044 (Sub-agrupador SLA)
- **UI:** Nodos padre vacíos o con único hijo.
- **Acción:** Centro de asignación (#21251) y Monitor de SLA (#21045) ascienden a la raíz Mesa de Servicio (#21023). Se eliminan los dos nodos agrupadores.

### #21252 Colaboradores de mi área (`/plataforma/tickets/gestion/colaboradores`)
- **UI:** `src/app/plataforma/tickets/gestion/colaboradores/page.tsx`.
- **Backend:** Capacidades `colaborador_autorizacion` (0 registros en BD).
- **Acción:** La delegación se centraliza en «Delegaciones» (#21004) y la gobernanza en «Perfiles y Permisos». Se retira la pantalla.

### #21253 a #21256 y #21261 (Vistas consolidadas redundantes de tickets)
- **UI:** Páginas `/plataforma/tickets/gestion/{bandeja, resueltos, departamento, todos, mios}`.
- **Dependencias:** Eran exposiciones redundantes de `TablaTickets`. Las bandejas de incidentes (#21233) y solicitudes (#21244) ya cubren estas consultas segmentadas por tipo.
- **Acción crítica en `TablaTickets`:** El conjunto de valores de la propiedad `vista` debe restringirse exactamente a `{mios, bandeja, asignados, departamento, resueltos, todos}`. Se erradican ramas huérfanas como `consolidada` o `historial-propio`.

### #21259 Avisos de servicio (`/plataforma/avisos/mantenimientos`)
- **UI:** `src/app/plataforma/avisos/mantenimientos/page.tsx`.
- **Dependencias:** Duplica lo gestionado y presentado por el Calendario de cambios.
- **Acción:** Eliminación de página y botones huérfanos de emisión de avisos externos.

### #21260 Búsqueda avanzada de tickets (`/plataforma/tickets/mesa/buscar`)
- **UI:** Página puente que realizaba redirección prohibida hacia asignados.
- **Acción:** Erradicación de la ruta y de la redirección de obsolescencia (R2).

---

## 3. Módulo Cambios
### #21060, #21072, #21081, #21087 (Sub-agrupadores vacíos)
- **Acción:** Eliminación de los 4 sub-agrupadores en BD. La raíz Cambios (#21059) queda plana con 8 pantallas directas.

### #21074 Conflictos y capacidad (`/plataforma/cambios/gestion/conflictos`)
- **UI:** `src/app/plataforma/cambios/gestion/conflictos/page.tsx`.
- **Backend:** El motor algorítmico de detección de conflictos reside en `src/modules/cambios/services/` y se ejecuta dentro del Expediente 360° del Cambio.
- **Acción:** Se conserva el motor y la pestaña dentro del expediente del cambio. Se elimina la pantalla de menú huérfana.

### #21193 Flujo de evaluación & #21194 Notificaciones de cambios
- **UI:** Páginas y pestañas de configuración.
- **Acción:** Los estados, transiciones y etapas quedan sembrados en la base de datos (convención sobre configuración). Los miembros y quórum del CAB se trasladan a la pantalla CAB y ECAB (#21082, vista `miembros`). Las notificaciones por correo/ICS se sustituyen por notificaciones in-app (N2).

---

## 4. Módulo Problemas
### #21097 Conocimiento derivado (`/plataforma/problemas/conocimiento`)
- **UI:** Pantalla que duplicaba el listado de artículos ya accesibles desde el expediente del problema.
- **Acción:** Eliminación de la ruta. El botón «Crear artículo KCS» en el expediente del problema se mantiene.

### #21104 Problemas mayores y comités PIR (`/plataforma/problemas/mayores`)
- **Acción:** Eliminación de la pantalla de menú.

### #21107 Aprobación de riesgo y cierre (`/plataforma/problemas/aprobaciones`)
- **Acción:** Eliminación de la bandeja externa. La transición de aceptación de riesgo se ejecuta como acción protegida con capacidad dentro del expediente del problema.

### #21108 Solicitudes de cambio derivadas (`/plataforma/problemas/cambios`)
- **Acción:** Eliminación de la pantalla externa; el expediente del problema ya cuenta con la pestaña nativa de RFCs vinculadas.

### #21200 Flujo y #21201 Relaciones (Configuración de problemas)
- **Acción:** Supresión de las interfaces de edición. Los flujos y reglas automáticas permanecen sembrados.

### Técnica de Ishikawa en Causa Raíz
- **Acción:** Se retiran componentes de diagrama de Ishikawa huérfanos. Se mantienen exclusivamente 5 Porqués, Línea de tiempo y Conclusión.

---

## 5. Módulo Activos y CMDB
### #21115 Campañas de inventario físico & #21116 Inventario físico en campo & #21119 Recepción de adquisiciones
- **Acción:** Supresión de pantallas operativas de terreno y compras no contempladas en el alcance ITIL esencial.

### #21124 Bajas por monto & #21131 Cumplimiento y sobreuso de licencias
- **Acción:** Se retiran. El cumplimiento por agentes en red queda descartado por falta de infraestructura de descubrimiento en este release.

### #21134 Actualizaciones desde cambios, #21136 Calidad/Auditoría, #21137 Inexactitudes, #21138 Líneas base, #21142 Resultados auditoría
- **Acción:** Eliminación de pantallas de auditoría de CMDB. La sincronización automática de CIs tras el cierre de cambios se conserva intacta en el backend.

### #21149 Ciclos de vida & #21151 Tipos y alertas de contratos
- **Acción:** Supresión de pantallas de configuración. Valores sembrados fijos.

---

## 6. Módulo Operación (#21170)
### #21170 Raíz Operación, #21171 Resiliencia, #21172 Eventos y alertas, #21173 Eventos y resiliencia
- **Acción:** Eliminación completa de la raíz y sus 3 pantallas. Se deshabilitan o purgan controladores de ingesta de eventos externos que no tengan consumidores vivos.

---

## 7. Módulo Reportes y Plataforma
### #21176 Informes de auditoría, #21180 Reportes de decisiones, #21183 Tableros
- **Acción:** Eliminación de pantallas accesorias y de la redirección obsoleta de Tableros.

### #21212 Configuración de contacto, #21214 Plantillas de correo, #21227 Preferencias de notificación
- **Acción:** Eliminación radical de pantallas de correo y canales externos; sustitución integral por la campana y centro de notificaciones in-app (N2).

### #21213 Estructura del menú, #21217 a #21219 Cumplimiento/SoD/Muestreo, #21222 a #21224 Salud del sistema/Retención
- **Acción:** Eliminación de pantallas de utilidades de desarrollo y auditoría avanzada. Las reglas de negocio (e.g. SoD en aprobaciones) continúan vigentes en los servicios del backend.
