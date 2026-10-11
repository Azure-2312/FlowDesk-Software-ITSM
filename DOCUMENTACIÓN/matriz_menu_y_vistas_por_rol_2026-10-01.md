# Matriz de menú, vistas y acciones por perfil

**Fecha:** 1 de octubre de 2026  
**Fuente de verdad:** roles de `perfiles`, menú activo de `opciones_menu` y relación `opciones_menu_perfiles`.  
**Recuento sincronizado:** 67 opciones activas; 9 perfiles; 170 asignaciones activas.  
**Regla de seguridad:** el menú mejora la navegación; API y páginas deben validar perfil activo, titularidad, asignación, departamento, estado del registro y permiso de acción.

## 1. Responsabilidades y menú visible

| ID / perfil | Opciones que debe tener en el menú | Límites principales |
|---|---|---|
| **1 Administrador** | Configuración primero: IAM, catálogo/SLA, configuración de procesos, organización/soporte, modelo de activos/CMDB, comunicaciones, conocimiento, auditoría/seguridad; luego Reportes y Analítica. | Sin colas operativas ni voto/aprobación por ser administrador. Si la persona atiende o aprueba, debe usar otro perfil asignado y quedar auditada. El nuevo árbol está en migración gradual. |
| **2 Técnico** | Mesa: portal de autoayuda, registrar solicitud, guías, operación/soporte, asignados, pendientes, tickets de área, resueltos, incidentes y solicitudes; Gestión de Cambios: crear RFC, calendario e historial; Activos/CMDB: inventario y topología; Operación: eventos y resiliencia; Problemas: registro y KEDB. | No tiene centro de asignación, todas las bandejas ni módulos administrativos. No reasigna a compañeros ni ve registros fuera de su ámbito. |
| **3 Solicitante** | Mesa/Portal: catálogo, registrar solicitud, mis solicitudes y guías. El reporte de incidentes está dentro del catálogo público. | No ve Gestión de Problemas, Gestión de Cambios, Eventos, Resiliencia, Proveedores, colas o notas internas. Solo consulta sus propios registros. |
| **4 Supervisor** | Mesa: pendientes, resueltos, despacho, monitoreo de técnicos, tickets de los departamentos de TI que supervisa, incidentes y solicitudes; Gestión de Cambios: operación/calendario/historial; Reportes; Eventos, Resiliencia y Problemas/KEDB. | Puede asignar y coordinar tickets y técnicos dentro de sus grupos de TI configurados. No cambia IAM, estructura global de departamentos, política RFC, catálogo global ni dictámenes CAB. |
| **5 Gestor de Área** | Portal: catálogo, crear solicitud y mis solicitudes; gobernanza de área: aprobaciones y tickets departamentales; Reportes/indicadores. | Solo decisiones asignadas y registros de su departamento. No recibe planes técnicos de continuidad o recuperación; una vista ejecutiva de servicios requiere asociar cada servicio a su área para filtrar la información. |
| **6 Auditor** | Mesa/auditoría forense y tickets de consulta; Cambios/historial; HAM/CMDB/SAM/modelos CI; reportes; catálogo de servicios en lectura; seguridad y auditoría integral; eventos, resiliencia, problemas/KEDB y proveedores. | Modo lectura. No cambia registros, aprueba, asigna, comenta o altera evidencia. El endpoint también debe omitir secretos/adjuntos no autorizados. |
| **7 Aprobador CAB** | Cambios: operación RFC, calendario, historial, CAB/dictamen; lectura de topología CI; contexto de eventos, resiliencia, problemas/KEDB y proveedores para analizar riesgo. | Vota RFC asignadas y sin conflicto de interés. No edita RFC ni gestiona catálogos, eventos o proveedores. |
| **8 Gestor de Cambios** | Cambios: registrar RFC, calendario, historial y CAB; lectura de topología CI; Operación: eventos/resiliencia; Problemas/KEDB; proveedores/contratos. | Prepara, evalúa, coordina, agenda y cierra/PIR; no vota su propio cambio. No reasigna tickets de soporte ni modifica activos. |
| **9 Gestor de Activos y Configuración** | Cambios/calendario para coordinación; Activos: inventario, CMDB, SAM y modelo CI; Operación: eventos/resiliencia; Problemas/KEDB en consulta; Proveedores y contratos TI. | Mantiene CI/activos y registro de proveedores conforme a API. Consulta problemas y errores conocidos para evaluar impacto en CI, sin cambiar el expediente. No atiende tickets ni decide CAB. |

### Menú del solicitante

El menú lateral del solicitante se limita a cuatro hojas dentro del portal: catálogo (111), registrar solicitud (112), mis solicitudes (113) y guías de autoayuda (114). No se asigna el nodo de gestión de problemas (700/710/720) ni el de cambios (200). La solicitud de servicio o el reporte de un incidente puede iniciar desde el catálogo, pero eso no convierte cada práctica de TI en una oferta visible al usuario.

## 2. Vistas y acciones del expediente de ticket

| Perfil | Qué datos ve | Acciones propias | Acciones que deben ocultarse/rechazarse |
|---|---|---|---|
| Solicitante | Expedientes propios; descripción, servicio/categoría, prioridad visible, estado, historial público y adjuntos autorizados. | Crear; aportar información; responder a una solicitud de información; cancelar o confirmar según estado; calificar al cierre si está habilitado. | Notas internas, tickets ajenos, asignación, edición técnica o aprobación. |
| Técnico | Tickets asignados o visibles a su equipo; diagnóstico, CI, actividad operativa, adjuntos autorizados. | Reconocer/atender, actualizar campos operativos permitidos, agregar nota interna, pedir información, registrar solución y resolver. | Reasignar a otra persona, editar SLA/configuración, acceder a otras áreas o aprobar su propio cambio. |
| Supervisor | Colas de su alcance, asignación, carga, escalamiento, prioridad y datos técnicos requeridos. | Asignar/reasignar dentro de su ámbito, escalar, cambiar prioridad/cola según política, supervisar y reabrir si procede. | Configuración global o acceso irrestricto fuera de su ámbito. |
| Gestor de Área | Solicitudes de su departamento, decisiones de aprobación y estado de servicio. | Aprobar/rechazar cuando tiene una tarea asignada; comentario de decisión y consulta de indicadores. | Notas internas técnicas, reasignación, edición de diagnóstico y aprobación no asignada. |
| Auditor | Registro/historial/evidencias permitidas en modo lectura. | Buscar, filtrar y generar exportes autorizados. | Todo cambio de estado/campo, asignación, comentario operativo o borrado. |
| Aprobador CAB | RFC asignada, impacto, CI/servicios relacionados, riesgo, pruebas, rollback y dictámenes previos pertinentes. | Emitir voto/dictamen de su RFC asignada; abstenerse si hay conflicto. | Editar campos de preparación, aprobar fuera de asignación, votar el RFC propio si también lo creó/gestiona. |
| Gestor de Cambios | RFC, riesgos, calendario, aprobaciones CAB, despliegue/resultados y revisión posterior. | Crear/editar RFC antes de cierre, coordinar ventanas, pedir aprobación, registrar resultado y PIR. | Emitir voto CAB del mismo RFC; asignar tickets de soporte. |
| Gestor de Activos y Configuración | Activo/CI, relaciones, licencias, proveedor y relaciones de servicio. | Mantener activos/CI/licencias/proveedores dentro de permisos explícitos; asociar CI a registros. | Cambiar estado operativo del ticket o aprobar CAB por tener permiso sobre el CI. |
| Administrador | Datos de configuración; detalle de ticket solo si activa otro rol con autorización. | Mantener perfiles, menús, formularios, catálogo/SLA y esquema RFC según privilegios de administración. | Acceso implícito a notas internas, cambio operativo o voto CAB. |

La API de tickets ya separa campos/transiciones por perfil y valida titular/relación en los flujos principales. Las vistas del Administrador y los perfiles operativos son distintas; el botón de asignación se reserva al Supervisor, con autoasignación técnica únicamente donde la política del flujo lo permita. Si la interfaz oculta una acción, la API debe seguir rechazándola cuando se invoque directamente.

## 3. Vista por módulo compartido

- **Catálogo de servicios:** solicitante ve ofertas publicadas disponibles y acciones de crear; Técnico/Gestor de Área lo consultan para solicitar servicios; Administrador configura servicios, formularios, audiencias y SLA; Auditor solo inspecciona. Problemas/cambios no son categorías del catálogo de solicitante.
- **Incidentes/solicitudes:** solicitante ve sus propios registros; Técnico trabaja lo asignado/equipo; Supervisor despacha y supervisa; Gestor de Área aprueba/consulta ámbito departamental; Auditor inspecciona evidencia. La ficha muestra acciones según estado más perfil.
- **Cambios:** Gestor de Cambios registra/prepara/coordina; CAB decide; Técnico puede proponer un RFC si está permitido por el esquema; Supervisor consulta calendario/operación según alcance; Auditor y Gestor de Activos ven datos relacionados en lectura. Administrador configura el formulario/esquema, no decide RFC individuales.
- **Problemas/KEDB:** Técnico investiga y usa workarounds; Supervisor prioriza/coordina; roles de cambios/activos/auditoría consultan contexto; solicitante no ve el módulo. KEDB debe distinguir información pública aprobada de notas internas; la publicación necesita gobierno editorial.
- **Eventos:** Supervisor registra y clasifica evento manual; Técnico puede reconocer/actualizar/vincular según endpoint; Auditor y roles técnicos relacionados consultan. No se afirma captura desde herramientas de monitoreo.
- **Disponibilidad/capacidad/continuidad:** Supervisor mantiene la ficha operativa; Auditor, CAB, Gestor de Cambios y Activos consultan contexto. El Gestor de Área no ve planes técnicos mientras no exista alcance de servicio por departamento. Medición y evidencia se cargan manualmente.
- **Proveedores:** Gestor de Activos y Configuración crea/actualiza; Auditor, CAB y Gestor de Cambios consultan; las otras áreas no reciben una lista global por defecto.
- **Administración:** Administrador configura; perfiles operativos no heredan privilegios administrativos por tener botones visibles en otra vista.

## 4. Comprobaciones pendientes para darlo por cerrado

1. Iniciar sesión con cada uno de los nueve perfiles y comparar el menú renderizado con la sección 1.
2. Abrir un ticket propio, ajeno, asignado y de otro departamento con los perfiles pertinentes. Confirmar los datos y botones de la sección 2.
3. Intentar por API una acción prohibida (por ejemplo Técnico reasignando; Solicitante leyendo ticket ajeno; CAB editando RFC; Auditor haciendo PATCH) y confirmar respuesta 403.
4. Confirmar que los gestores de cambios no pueden votar su propio RFC y que las API de eventos/proveedores/resiliencia conservan los límites del rol.
5. Si se agrega vista de resiliencia al Gestor de Área, implementar primero la relación servicio-área y filtrar tanto los registros como el selector de servicios.

La navegación ya está sincronizada con la base y el código. Esta matriz define el comportamiento esperado; la inspección visual con las credenciales reales de todos los perfiles sigue siendo una validación pendiente, no una conformidad normativa certificada.


