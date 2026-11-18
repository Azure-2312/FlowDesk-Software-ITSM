# Mapa de URLs Antiguas → Nuevas (Anexo D)

Este documento registra la equivalencia entre las URLs previas a la reestructuración y su estado o destino final en el sistema.

- **Eliminada (404):** La ruta deja de existir en disco y devuelve 404 (Not Found). Queda estrictamente prohibida cualquier redirección por obsolescencia (Regla R2).
- **Fusionada:** El contenido o funcionalidad se integra como una vista con permiso propio (`?vista=...`) dentro de una pantalla sobreviviente. La URL antigua devuelve 404.
- **Renombrada:** Misma pantalla bajo una URL canónica más descriptiva. La URL antigua devuelve 404.

---

## Tabla de Mapeo de URLs

| URL Antigua | Qué Pasa | URL Nueva / Destino Canónico |
|---|---|---|
| `/plataforma/solicitudes/area/delegacion` | Fusionada | `/plataforma/seguridad/delegaciones` |
| `/plataforma/solicitudes/area/historial` | Fusionada | `/plataforma/aprobaciones?vista=historial-area` |
| `/plataforma/seguridad/historial-aprobaciones` | Fusionada | `/plataforma/aprobaciones?vista=historial` |
| `/plataforma/operacion/paneles/gestor-activos` | Fusionada | `/plataforma/inicio?vista=gestion-activos` |
| `/plataforma/operacion/equipo/ausencias` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/equipo/vistas` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/paneles/auditor` | Fusionada | `/plataforma/inicio?vista=auditor` |
| `/plataforma/operacion/paneles/gestor-cambios` | Fusionada | `/plataforma/inicio?vista=gestion-cambios` |
| `/plataforma/operacion/paneles/gestor-problemas` | Fusionada | `/plataforma/inicio?vista=gestion-problemas` |
| `/plataforma/operacion/paneles/supervisor` | Fusionada | `/plataforma/inicio?vista=supervisor` |
| `/plataforma/operacion/paneles/aprobador` | Fusionada | `/plataforma/inicio?vista=aprobador` |
| `/plataforma/reportes/area` | Fusionada | `/plataforma/reportes/operativos?vista=area` |
| `/plataforma/reportes/tableros` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/solicitudes/configuracion/flujo` | Fusionada | `/plataforma/solicitudes/configuracion?vista=reglas` |
| `/plataforma/incidentes/configuracion/flujo` | Fusionada | `/plataforma/incidentes/configuracion?vista=reglas` |
| `/plataforma/cambios/configuracion/formulario` | Renombrada | `/plataforma/cambios/configuracion` |
| `/plataforma/cambios/configuracion/notificaciones-calendario` | Fusionada | `/plataforma/cambios/configuracion?vista=calendario` |
| `/plataforma/cambios/configuracion/flujo-evaluacion` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/cambios/configuracion/tipos-requisitos` | Fusionada | `/plataforma/cambios/configuracion?vista=autoridad` |
| `/plataforma/problemas/configuracion/formulario` | Renombrada | `/plataforma/problemas/configuracion` |
| `/plataforma/problemas/configuracion/flujo` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/problemas/configuracion/relaciones` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/organizacion/departamentos` | Renombrada | `/plataforma/organizacion/grupos-ti` |
| `/plataforma/organizacion/departamentos/supervisores` | Fusionada | `/plataforma/organizacion/grupos-ti?vista=supervisores` |
| `/plataforma/organizacion/tecnicos` | Fusionada | `/plataforma/organizacion/grupos-ti?vista=tecnicos` |
| `/plataforma/operacion/notificaciones/contacto` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/menu` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/notificaciones/plantillas` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/seguridad/cumplimiento/cambios` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/seguridad/muestreo` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/seguridad/cumplimiento/sod` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/seguridad/seguridad-logs` | Fusionada | `/plataforma/seguridad/auditoria-sistema?vista=accesos` |
| `/plataforma/seguridad/accesos/recertificacion` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/mantenimiento-datos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/operacion/salud-sistema` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/mi-cuenta/notificaciones` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/incidentes` | Fusionada | `/plataforma/incidentes/bandeja?vista=todos` |
| `/plataforma/incidentes/asignados` | Fusionada | `/plataforma/incidentes/bandeja?vista=asignados` |
| `/plataforma/incidentes/resueltos` | Fusionada | `/plataforma/incidentes/bandeja?vista=resueltos` |
| `/plataforma/incidentes/departamento` | Fusionada | `/plataforma/incidentes/bandeja?vista=departamento` |
| `/plataforma/incidentes/catalogo` | Fusionada | `/plataforma/servicios/catalogo?vista=explorar&tipo=incidente` |
| `/plataforma/incidentes/sala-crisis` | Fusionada | `/plataforma/incidentes/mayores?vista=sala-crisis` |
| `/plataforma/solicitudes` | Fusionada | `/plataforma/solicitudes/bandeja?vista=todos` |
| `/plataforma/solicitudes/asignados` | Fusionada | `/plataforma/solicitudes/bandeja?vista=asignados` |
| `/plataforma/solicitudes/resueltos` | Fusionada | `/plataforma/solicitudes/bandeja?vista=resueltos` |
| `/plataforma/solicitudes/departamento` | Fusionada | `/plataforma/solicitudes/bandeja?vista=departamento` |
| `/plataforma/solicitudes/catalogo` | Fusionada | `/plataforma/servicios/catalogo?vista=explorar&tipo=solicitud` |
| `/plataforma/solicitudes/aprobaciones` | Renombrada | `/plataforma/aprobaciones` |
| `/plataforma/tickets/gestion/colaboradores` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/bandeja` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/resueltos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/departamento` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/todos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/crear` | Fusionada | `/plataforma/incidentes/crear` |
| `/plataforma/tickets/gestion/auditoria` | Fusionada | `/plataforma/incidentes/bandeja?vista=todos` |
| `/plataforma/avisos/mantenimientos` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/mesa/buscar` | Eliminada (404) | ELIMINADA (404) |
| `/plataforma/tickets/gestion/mios` | Eliminada (404) | ELIMINADA (404) |
