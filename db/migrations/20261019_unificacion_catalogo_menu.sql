-- Unificacion del catalogo de menu: 1 fila por pantalla + visibilidad N:M por perfil.
-- 227 opciones (36 carpetas + 191 pantallas), ids 21001+ en orden de arbol.
-- Regla de carpetas: una carpeta con un solo hijo no existe; la opcion sube un nivel.
-- La visibilidad de cada carpeta es la union de la de sus descendientes.
-- Ver DOCUMENTACION/UNIFICACION_CATALOGO_MENU.md.

BEGIN;

CREATE TABLE IF NOT EXISTS opciones_menu_bak_20261018 AS SELECT * FROM opciones_menu;
CREATE TABLE IF NOT EXISTS opciones_menu_perfiles_bak_20261018 AS SELECT * FROM opciones_menu_perfiles;

DELETE FROM opciones_menu_perfiles;
DELETE FROM opciones_menu;

INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21001, 'Mi trabajo', '', '', NULL, 1, 1, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21002, 'Aprobaciones', '', '', 21001, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21003, 'Delegación de aprobaciones', '/plataforma/perfiles/gestor-area/aprobaciones/delegacion', 'Delegar por ausencia a un suplente del área.', 21002, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21004, 'Delegaciones', '/plataforma/perfiles/aprobador/delegaciones', 'Delegar por ausencia a un suplente con vigencia.', 21002, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21005, 'Historial de aprobaciones de mi área', '/plataforma/perfiles/gestor-area/aprobaciones/historial', '', 21002, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21006, 'Historial de aprobaciones y dictámenes', '/plataforma/perfiles/aprobador/historial', '', 21002, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21007, 'Panel de activos y CMDB', '/gestor-activos/panel', 'Garantías por vencer, actas pendientes, sobreuso de licencias, inexactitudes y campañas activas.', 21001, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21008, 'Equipo', '', '', 21001, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21009, 'Ausencias y guardias del equipo', '/plataforma/perfiles/supervisor/equipo/ausencias', 'Registrar y editar ausencias de mi equipo; las usa la asignación automática.', 21008, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21010, 'Vistas y respuestas compartidas', '/plataforma/perfiles/supervisor/equipo/vistas', 'Vistas guardadas y respuestas predefinidas del grupo.', 21008, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21011, 'Panel de auditoría', '/plataforma/perfiles/auditor/panel', 'Hallazgos, cumplimiento y muestras pendientes (solo lectura).', 21001, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21012, 'Panel de gestión de cambios', '/plataforma/perfiles/gestor-cambios/panel', 'Inicio: RFC por evaluar, autorizaciones pendientes, cambios de hoy, conflictos y PIR vencidas.', 21001, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21013, 'Panel de gestión de problemas', '/gestor-problemas/panel', 'Problemas abiertos, sin asignar, por vencer, mayores y errores conocidos por revisar.', 21001, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21014, 'Panel de supervisión', '/plataforma/perfiles/supervisor/panel', 'Página de inicio del supervisor: estado del equipo en un vistazo.', 21001, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21015, 'Panel del aprobador', '/plataforma/perfiles/aprobador/panel', 'Pendientes por vencer, reuniones del comité y decisiones recientes.', 21001, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21016, 'Panel del área', '/plataforma/perfiles/gestor-area/panel', 'Inicio del jefe de área (no TI).', 21001, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21017, 'Panel del técnico', '/plataforma/perfiles/tecnico/panel', 'Qué atender ahora: indicadores, tickets urgentes, agenda, avisos y carga.', 21001, 2, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21018, 'Mi agenda y disponibilidad', '/plataforma/perfiles/tecnico/agenda', 'Calendario personal y estado Disponible / Ocupado / No disponible.', 21001, 2, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21019, 'Mi desempeño', '/plataforma/perfiles/tecnico/desempeno', 'Indicadores propios y agregados del grupo.', 21001, 2, 10, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21020, 'Mis tareas', '/plataforma/perfiles/tecnico/tareas', 'Tareas de tickets, problemas, cambios, mantenimientos y recordatorios personales.', 21001, 2, 11, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21021, 'Panel de administración', '/plataforma/perfiles/administrador/panel', 'Estado global de la mesa de servicio, los cambios, las identidades y los accesos.', 21001, 2, 12, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21022, 'Panel del solicitante', '/plataforma/perfiles/solicitante/panel', 'Mis tickets, mis activos asignados y las guías disponibles.', 21001, 2, 13, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21023, 'Mesa de Servicio', '', '', NULL, 1, 2, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21024, 'Gestión', '', '', 21023, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21025, 'Asignados', '/tickets/gestion/asignados', '', 21024, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21026, 'Bandeja de pendientes', '/tickets/gestion/bandeja', '', 21024, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21027, 'Centro de asignación', '/tickets/gestion/asignar', 'Asignar y reasignar tickets del área técnica.', 21024, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21028, 'Colaboradores de mi área', '/tickets/gestion/colaboradores', '', 21024, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21029, 'Historial de resueltos', '/tickets/gestion/resueltos', '', 21024, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21030, 'Incidentes', '/tickets/gestion/incidentes', '', 21024, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21031, 'Mis tickets', '/tickets/gestion/mios', '', 21024, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21032, 'Registrar ticket para un usuario', '/tickets/gestion/crear', 'Crear tickets a nombre de un colaborador de su departamento.', 21024, 3, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21033, 'Solicitudes de servicio', '/tickets/gestion/solicitudes', '', 21024, 3, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21034, 'Tickets de mi departamento', '/tickets/gestion/departamento', 'Solo los del departamento; vista de Gobernanza sin acciones técnicas.', 21024, 3, 10, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21035, 'Todos los tickets', '/tickets/gestion/todos', '', 21024, 3, 11, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21036, 'Mi mesa', '', '', 21023, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21037, 'Bandeja de mi grupo', '/plataforma/perfiles/tecnico/mesa/pendientes', 'Cola sin asignar de mis grupos; tomar de forma atómica.', 21036, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21038, 'Búsqueda avanzada', '/plataforma/perfiles/tecnico/mesa/buscar', '', 21036, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21039, 'Historial de mis tickets', '/plataforma/perfiles/tecnico/mesa/historial', '', 21036, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21040, 'Incidente mayor (sala de crisis)', '/plataforma/perfiles/tecnico/mesa/incidente-mayor', 'Vista de coordinación cuando el Supervisor declara un incidente mayor: línea de tiempo, tareas y comunicados.', 21036, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21041, 'Mis tickets asignados', '/plataforma/perfiles/tecnico/mesa/asignados', 'Cola personal con SLA y acciones rápidas.', 21036, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21042, 'Registrar ticket para un usuario', '/plataforma/perfiles/tecnico/mesa/registrar', 'Registro por teléfono, chat o presencial, con resolución en primer contacto.', 21036, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21043, 'Tickets de mi área técnica', '/plataforma/perfiles/tecnico/mesa/area', 'Consulta de todo el departamento de TI y ofrecer ayuda.', 21036, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21044, 'SLA', '', '', 21023, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21045, 'Escalamientos y riesgos de SLA', '/plataforma/perfiles/supervisor/sla/escalamientos', 'Tickets escalados jerárquicamente y en riesgo; permite intervenir.', 21044, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21046, 'Incumplimientos y causas', '/plataforma/perfiles/supervisor/sla/incumplimientos', 'Análisis de tickets vencidos por servicio, técnico y causa.', 21044, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21047, 'Objetivos de tiempo vigentes', '/plataforma/perfiles/tecnico/sla/objetivos', 'Se reutiliza en modo consulta.', 21044, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21048, 'Semáforo de SLA de mi cola', '/plataforma/perfiles/tecnico/sla/semaforo', '', 21044, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21049, 'Semáforo de SLA del grupo', '/plataforma/perfiles/supervisor/sla/semaforo', 'Misma vista que el técnico con alcance de todo el grupo.', 21044, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21050, 'Catálogo', '', '', 21023, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21051, 'Catálogo de incidentes', '/tickets/catalogo?tipo=incidente', 'Categorías y servicios para reportar fallas; sin botones superiores que repitan el menú.', 21050, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21052, 'Catálogo de servicios', '/tickets/catalogo', 'Elegir el servicio en el catálogo y completar el formulario dinámico de incidente o solicitud.', 21050, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21053, 'Catálogo de solicitudes de servicio', '/tickets/catalogo?tipo=solicitud', 'Categorías y servicios para pedir requerimientos; muestra si requiere aprobación.', 21050, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21054, 'Mis tickets', '/tickets', 'Lista de los propios con estado y tiempo restante.', 21050, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21055, 'Aprobaciones de solicitudes', '/tickets/gestion/aprobaciones', 'Solicitudes que requieren aprobación de jefatura.', 21023, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21056, 'Auditoría de tickets', '/tickets/gestion/auditoria', '', 21023, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21057, 'Incidentes mayores', '/plataforma/perfiles/supervisor/incidentes-mayores', 'Declarar, coordinar, comunicar y cerrar incidentes mayores.', 21023, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21058, 'Avisos de servicio', '/avisos/mantenimientos', 'Mantenimientos programados con interrupción que afectan a mi área, tomados del calendario de cambios.', 21023, 2, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21059, 'Cambios', '', '', NULL, 1, 3, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21060, 'Mis cambios', '', '', 21059, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21061, 'Aprobaciones técnicas de RFC', '/plataforma/perfiles/supervisor/cambios/aprobaciones', 'Etapa Técnica de las RFC del grupo implementador; segregación de funciones.', 21060, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21062, 'Calendario de mis cambios', '/plataforma/perfiles/tecnico/cambios/calendario', '', 21060, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21063, 'Cambios con interrupción para mi área', '/plataforma/perfiles/gestor-area/cambios/impacto', '', 21060, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21064, 'Cambios por implementar', '/plataforma/perfiles/tecnico/cambios/implementacion', 'Consola de implementación: Go/No-Go, bitácora, rollback y resultado.', 21060, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21065, 'Cambios que afectan a mi equipo', '/plataforma/perfiles/supervisor/cambios/impacto', 'Misma lógica del técnico con alcance de grupo.', 21060, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21066, 'Cambios que afectan mis servicios', '/plataforma/perfiles/tecnico/cambios/impacto', '', 21060, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21067, 'Historial de mis cambios', '/plataforma/perfiles/tecnico/cambios/historial', '', 21060, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21068, 'Mis cambios', '/plataforma/perfiles/tecnico/cambios/mis-cambios', '', 21060, 3, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21069, 'Programación de implementaciones del equipo', '/plataforma/perfiles/supervisor/cambios/programar', 'Programar y reprogramar dentro de ventanas permitidas.', 21060, 3, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21070, 'Registrar solicitud RFC', '/plataforma/perfiles/tecnico/cambios/nuevo', '', 21060, 3, 10, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21071, 'Calendario de cambios', '/cambios/gestion/calendario', '', 21059, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21072, 'Gestión', '', '', 21059, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21073, 'Bandeja de RFC por evaluar', '/plataforma/perfiles/gestor-cambios/evaluacion', 'Asignar evaluador, calcular riesgo, revisar conflictos y enviar a autorización.', 21072, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21074, 'Conflictos y capacidad', '/plataforma/perfiles/gestor-cambios/conflictos', 'Solapamientos, congelamientos, feriados y máximos simultáneos.', 21072, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21075, 'Modelos de cambio estándar', '/plataforma/perfiles/gestor-cambios/modelos', 'Consulta y propuesta de modelos, métricas de éxito y suspensiones.', 21072, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21076, 'Programación de cambios autorizados', '/plataforma/perfiles/gestor-cambios/programacion', '', 21072, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21077, 'Revisión post-implementación', '/plataforma/perfiles/gestor-cambios/pir', 'PIR pendientes y vencidas; incidentes causados; lecciones aprendidas.', 21072, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21078, 'Seguimiento de ejecución', '/plataforma/perfiles/gestor-cambios/ejecucion', 'Tablero en vivo de cambios en ejecución, extensiones de ventana y rollbacks.', 21072, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21079, 'Seguimiento de etapas de aprobación', '/plataforma/perfiles/gestor-cambios/autorizaciones', 'Etapas pendientes, plazos, recordatorios y escalamiento.', 21072, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21080, 'Historial de cambios', '/cambios/gestion/todos', '', 21059, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21081, 'CAB', '', '', 21059, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21082, 'Agenda y actas', '/plataforma/perfiles/aprobador/cab/agenda', '', 21081, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21083, 'Comité de emergencia (ECAB)', '/plataforma/perfiles/aprobador/cab/emergencia', 'Decisión rápida con plazo y revisión retroactiva.', 21081, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21084, 'Convocatoria, agenda y actas', '/plataforma/perfiles/gestor-cambios/cab/agenda', 'Genera agenda con corte, convoca reuniones extraordinarias y emite el acta.', 21081, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21085, 'Dictamen colegiado (CAB)', '/cambios/gestion/cab', 'Quórum, votación, voto de calidad, exclusión por conflicto de interés.', 21081, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21086, 'Solicitar un cambio', '/cambios/gestion/crear', 'Formulario del Prompt 2 con validación de calendario y análisis de impacto.', 21059, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21087, 'Aprobaciones', '', '', 21059, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21088, 'Aprobación de negocio de cambios', '/plataforma/perfiles/gestor-area/cambios/aprobaciones', 'Etapa Negocio de las RFC que afectan a mi departamento.', 21087, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21089, 'Aprobaciones de cambios', '/plataforma/perfiles/aprobador/cambios', 'Etapas Dirección y excepciones: aprobar, aprobar con condiciones, rechazar, pedir información o delegar.', 21087, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21090, 'Modelos de cambio estándar', '/plataforma/perfiles/aprobador/cambios/modelos', '', 21087, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21091, 'Problemas', '', '', NULL, 1, 4, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21092, 'Análisis de causa raíz', '/gestor-problemas/analisis', 'Herramientas de 5 porqués, Ishikawa y línea de tiempo.', 21091, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21093, 'Asignación de problemas', '/plataforma/perfiles/supervisor/problemas/asignar', 'Reparte problemas sin responsable mientras no exista el Gestor de Problemas.', 21091, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21094, 'Bandeja y asignación', '/gestor-problemas/asignacion', 'Asignar responsables, grupos y prioridad.', 21091, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21095, 'Candidatos a problema', '/gestor-problemas/candidatos', 'Sugerencias de las reglas de umbral con alcance global.', 21091, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21096, 'Candidatos de mi grupo', '/plataforma/perfiles/tecnico/problemas/candidatos', '', 21091, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21097, 'Conocimiento derivado', '/gestor-problemas/conocimiento', 'Artículos generados y pendientes por problema.', 21091, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21098, 'Consultar KEDB', '/plataforma/perfiles/tecnico/problemas/errores-conocidos', '', 21091, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21099, 'Errores conocidos (KEDB)', '/problemas/kedb', 'Publicar, retirar y revisar periódicamente.', 21091, 2, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21100, 'Incidentes recurrentes', '/gestor-problemas/recurrentes', 'Agrupación por servicio, CI, categoría y código de resolución.', 21091, 2, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21101, 'Objetivos de tiempo', '/gestor-problemas/objetivos', 'Consulta de los objetivos internos de problemas.', 21091, 2, 10, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21102, 'Problemas asignados a mí', '/plataforma/perfiles/tecnico/problemas/asignados', '', 21091, 2, 11, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21103, 'Problemas de mi grupo', '/plataforma/perfiles/tecnico/problemas/grupo', '', 21091, 2, 12, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21104, 'Problemas mayores y revisión', '/gestor-problemas/mayores', '', 21091, 2, 13, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21105, 'Registrar problema', '/plataforma/perfiles/tecnico/problemas/nuevo', '', 21091, 2, 14, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21106, 'Registro de problemas', '/problemas', '', 21091, 2, 15, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21107, 'Riesgo aceptado y cierre de problemas mayores', '/plataforma/perfiles/aprobador/problemas', '', 21091, 2, 16, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21108, 'Solicitudes de cambio derivadas', '/gestor-problemas/cambios', 'RFC vinculadas a problemas y su estado.', 21091, 2, 17, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21109, 'Activos y CMDB', '', '', NULL, 1, 5, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21110, 'Inventario', '', '', 21109, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21111, 'Activos de mi área', '/plataforma/perfiles/gestor-area/activos', 'Lectura de activos por colaborador, sin datos financieros sensibles.', 21110, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21112, 'Asignación, custodia y actas', '/gestor-activos/asignaciones', 'Asignar, transferir, devolver; actas y aceptación del custodio.', 21110, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21113, 'Importación masiva', '/gestor-activos/importacion', 'Validación en seco, mapeo de columnas y reversión.', 21110, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21114, 'Inventario de activos', '/activos/inventario', '', 21110, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21115, 'Inventario físico (campañas)', '/gestor-activos/inventario-fisico', 'Crear campañas, revisar discrepancias y cerrar con acta (el conteo en campo lo hace el técnico).', 21110, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21116, 'Inventario físico en campo', '/plataforma/perfiles/tecnico/activos/conteos', 'Conteo con escaneo desde teléfono.', 21110, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21117, 'Inventario técnico', '/plataforma/perfiles/tecnico/activos/inventario', '', 21110, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21118, 'Mis activos', '/activos/mis-activos', 'Activos que el usuario tiene en custodia.', 21110, 3, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21119, 'Recepción de adquisiciones', '/gestor-activos/recepcion', 'Recepción por lote con series, garantía y vínculo a la solicitud de origen.', 21110, 3, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21120, 'Bajas y disposición', '', '', 21109, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21121, 'Aprobación de bajas de mi área', '/plataforma/perfiles/supervisor/activos/bajas', 'Aprueba o rechaza bajas solicitadas por técnicos.', 21120, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21122, 'Consulta de bajas', '/plataforma/perfiles/auditor/activos/bajas', 'Actas de baja, borrado seguro y destino final.', 21120, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21123, 'Gestión de bajas', '/gestor-activos/bajas', 'Solicitudes de baja, borrado seguro, acta y destino final.', 21120, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21124, 'Bajas y renovaciones por monto', '/plataforma/perfiles/aprobador/activos', '', 21120, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21125, 'Mantenimiento', '', '', 21109, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21126, 'Mantenimiento y garantías', '/gestor-activos/mantenimiento', '', 21125, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21127, 'Mantenimiento y reparaciones', '/plataforma/perfiles/tecnico/activos/mantenimiento', '', 21125, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21128, 'Licencias', '', '', 21109, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21129, 'Catálogo de software autorizado', '/gestor-activos/licencias/catalogo-software', '', 21128, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21130, 'Consultar licencias', '/plataforma/perfiles/tecnico/activos/licencias', '', 21128, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21131, 'Cumplimiento y sobreuso', '/gestor-activos/licencias/cumplimiento', '', 21128, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21132, 'Licencias de software', '/activos/licencias', '', 21128, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21133, 'CMDB', '', '', 21109, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21134, 'Actualizaciones de CMDB desde cambios', '/gestor-activos/cmdb/actualizaciones', 'Aplica a la CMDB lo propuesto en las RFC cerradas.', 21133, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21135, 'Análisis e impacto', '/activos/cmdb/analisis', 'Topología de dependencias, impacto en fallas y reconciliación Activo ↔ CI.', 21133, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21136, 'Calidad y auditoría de CMDB', '/gestor-activos/cmdb/auditoria', '', 21133, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21137, 'Inexactitudes reportadas', '/gestor-activos/cmdb/inexactitudes', 'Tareas generadas por técnicos.', 21133, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21138, 'Líneas base', '/gestor-activos/cmdb/lineas-base', '', 21133, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21139, 'Mapa de topología', '/activos/cmdb', '', 21133, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21140, 'Mapa de topología CMDB', '/plataforma/perfiles/tecnico/activos/mapa', '', 21133, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21141, 'Modelado de clases CI', '/activos/cmdb/tipos', '', 21133, 3, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21142, 'Resultados de auditorías de CMDB', '/plataforma/perfiles/auditor/cmdb/resultados', '', 21133, 3, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21143, 'Proveedores y contratos', '', '', 21109, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21144, 'Contratos y cobertura', '/gestor-activos/contratos', '', 21143, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21145, 'Licencias y contratos de mi departamento', '/plataforma/perfiles/gestor-area/contratos', '', 21143, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21146, 'Proveedores', '/proveedores', 'Proveedores con validación de RUC y contacto.', 21143, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21147, 'Renovaciones y vencimientos', '/gestor-activos/renovaciones', 'Genera solicitudes de renovación y registra el historial.', 21143, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21148, 'Catálogos', '', '', 21109, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21149, 'Ciclos de vida y reglas de transición', '/admin/activos-config/ciclos-vida-transiciones', '', 21148, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21150, 'Fabricantes y modelos', '/admin/activos-config/tipos-modelos-atributos?vista=fabricantes', '', 21148, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21151, 'Licencias y contratos', '/admin/activos-config/licencias-contratos', '', 21148, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21152, 'Listas auxiliares', '/admin/activos-config/tipos-modelos-atributos?vista=catalogos', '', 21148, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21153, 'Tipos de elementos de configuración y relaciones de CMDB', '/admin/activos-config/cmdb-relaciones', '', 21148, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21154, 'Tipos, modelos y atributos', '/admin/activos-config/tipos-modelos-atributos', 'Clases, fabricantes, atributos, formulario, códigos, ubicaciones, listas, ficha e importación.', 21148, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21155, 'Ubicaciones', '/admin/activos-config/tipos-modelos-atributos?vista=ubicaciones', '', 21148, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21156, 'Conocimiento', '', '', NULL, 1, 6, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21157, 'Base de conocimiento', '/conocimiento', 'Buscador por texto, categoría y servicio.', 21156, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21158, 'Consultar base de conocimiento', '/plataforma/perfiles/tecnico/conocimiento/base', '', 21156, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21159, 'Crear artículo', '/plataforma/perfiles/tecnico/conocimiento/nuevo', '', 21156, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21160, 'Mis artículos', '/plataforma/perfiles/tecnico/conocimiento/mis-articulos', '', 21156, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21161, 'Revisión y publicación de artículos', '/plataforma/perfiles/supervisor/conocimiento/revisiones', 'Revisa artículos del equipo cuando es revisor de la categoría.', 21156, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21162, 'Revisiones pendientes', '/plataforma/perfiles/tecnico/conocimiento/revisiones', '', 21156, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21163, 'Catálogo de Servicios', '', '', NULL, 1, 7, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21164, 'Catálogo de servicios', '/plataforma/perfiles/tecnico/catalogo', '', 21163, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21165, 'Configuración de categorías', '/admin/servicios?vista=categorias', 'CRUD de categorías con unicidad de nombre y código.', 21163, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21166, 'Crear servicio', '/admin/servicios?vista=crear', 'Formulario oficial de servicio con validaciones en tiempo real.', 21163, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21167, 'Objetivos SLA', '/admin/servicios/sla', 'Matriz institucional de tiempos por prioridad y matriz impacto × urgencia.', 21163, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21168, 'Servicios de incidentes', '/admin/servicios?tipo=1', 'Listado y edición de servicios de incidente.', 21163, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21169, 'Servicios de solicitudes', '/admin/servicios?tipo=2', 'Listado, edición y flujo de aprobación por servicio.', 21163, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21170, 'Operación', '', '', NULL, 1, 8, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21171, 'Disponibilidad, capacidad y continuidad', '/operacion/resiliencia', 'Indicadores de resiliencia de los servicios del área.', 21170, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21172, 'Eventos y alertas', '/operacion/eventos', 'Eventos de monitoreo; permite convertir un evento en incidente.', 21170, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21173, 'Eventos y resiliencia', '/operacion', '', 21170, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21174, 'Reportes', '', '', NULL, 1, 9, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21175, 'Indicadores operativos y SLA', '/tickets/reportes', 'Indicadores globales de SLA, volumen y satisfacción.', 21174, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21176, 'Informes de auditoría', '/plataforma/perfiles/auditor/informes', 'Hallazgos, recomendaciones y seguimiento.', 21174, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21177, 'Productividad individual', '/plataforma/perfiles/supervisor/reportes/productividad', 'Resueltos, tiempos, reabiertos y satisfacción por técnico (uso de gestión, no punitivo).', 21174, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21178, 'Reportes de activos', '/gestor-activos/reportes', 'Inventario, antigüedad, costos, garantías, cumplimiento y exactitud de CMDB.', 21174, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21179, 'Reportes de cambios', '/plataforma/perfiles/gestor-cambios/reportes', 'Tasa de éxito, emergencias, tiempos de ciclo, incidentes causados y cumplimiento de ventana.', 21174, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21180, 'Reportes de decisiones', '/plataforma/perfiles/aprobador/reportes', 'Tiempo de respuesta y tasas de aprobación y rechazo.', 21174, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21181, 'Reportes de problemas', '/gestor-problemas/reportes', 'Tiempo hasta causa raíz, recurrencia, problemas mayores y uso de errores conocidos.', 21174, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21182, 'Reportes del área', '/plataforma/perfiles/gestor-area/reportes', 'Tickets por servicio, SLA percibido, satisfacción y costo referencial consumido.', 21174, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21183, 'Tableros', '/admin/reportes-disenador', 'Diseñador de tableros.', 21174, 2, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21184, 'Configuración', '', '', NULL, 1, 10, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21185, 'Mesa de Servicio', '', '', 21184, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21186, 'Flujo de atención y aprobaciones', '/admin/tickets-vistas?seccion=estados&tipo=solicitud', 'Estados, tareas y etapas de aprobación.', 21185, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21187, 'Flujo de estados y acciones', '/admin/tickets-vistas?seccion=estados&tipo=incidente', 'Estados, transiciones y acciones por rol.', 21185, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21188, 'Formulario de incidentes', '/admin/tickets-formularios?tipo=incidente', 'Campos, orden y obligatoriedad del formulario de incidente.', 21185, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21189, 'Formulario de solicitudes', '/admin/tickets-formularios?tipo=solicitud', 'Formulario de solicitud.', 21185, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21190, 'Cambios', '', '', 21184, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21191, 'Configuración de formulario', '/admin/procesos/cambios/formulario', 'Formulario de RFC configurable; unificar los modales con los de problemas.', 21190, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21192, 'Feriados', '/admin/procesos/cambios/notificaciones-calendario?vista=feriados', '', 21190, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21193, 'Flujo de evaluación, autorización y revisión posterior', '/admin/procesos/cambios/flujo-evaluacion', 'Estados, transiciones, etapas, comités, plazos, tareas, cierre y PIR; unificar `Iconos.tsx`.', 21190, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21194, 'Notificaciones de cambios', '/admin/procesos/cambios/notificaciones-calendario', 'Eventos, ventanas, congelamientos, feriados, conflictos y presentación; el Gestor de Cambios edita solo las ventanas, congelamientos y feriados.', 21190, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21195, 'Períodos de congelamiento', '/admin/procesos/cambios/notificaciones-calendario?vista=congelamiento', '', 21190, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21196, 'Tipos de cambio y requisitos', '/admin/procesos/cambios/tipos-requisitos', 'Tipos, autoridad, modelos estándar y clasificación.', 21190, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21197, 'Ventanas de mantenimiento', '/admin/procesos/cambios/notificaciones-calendario?vista=ventanas', 'Edición permitida por el permiso `config.cambios.calendario`.', 21190, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21198, 'Problemas', '', '', 21184, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21199, 'Configuración de formulario', '/admin/procesos/problemas/formulario', 'Formulario configurable de problemas con versionado.', 21198, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21200, 'Flujo de investigación y seguimiento', '/admin/procesos/problemas/flujo', 'Estados, transiciones, asignación, objetivos, escalamiento, reapertura, tareas y problemas mayores.', 21198, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21201, 'Relación con incidentes, errores conocidos y conocimiento', '/admin/procesos/problemas/relaciones', 'Umbrales, vínculos, KEDB, RFC, conocimiento y CI.', 21198, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21202, 'Categorías, responsables y reglas de publicación y revisión', '/admin/conocimiento-config', '', 21184, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21203, 'Organización', '', '', 21184, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21204, 'Departamentos empresariales', '/admin/departamentos-empresa', 'Áreas de negocio (finanzas, legal, ventas, marketing) y su Gestor de Área.', 21203, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21205, 'Departamentos y grupos resolutores de TI', '/admin/departamentos', 'Áreas técnicas y grupos resolutores.', 21203, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21206, 'Supervisores', '/admin/departamentos?vista=supervisores', 'Asignación de supervisores a áreas técnicas.', 21203, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21207, 'Técnicos y niveles de soporte', '/admin/tecnicos', 'Técnicos, niveles N1/N2/N3 y ausencias.', 21203, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21208, 'Identidades', '', '', 21184, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21209, 'Gestión de usuarios', '/admin/usuarios', 'Alta, edición, bloqueo y desbloqueo de usuarios; asignación de perfiles múltiples; envío de credenciales.', 21208, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21210, 'Perfiles y permisos', '/admin/perfiles', 'Matriz de permisos por perfil.', 21208, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21211, 'Menú y notificaciones', '', '', 21184, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21212, 'Configuración de contacto', '/admin/notificaciones?seccion=contacto', 'Remitente, SMTP y datos de contacto de la mesa.', 21211, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21213, 'Estructura del menú', '/admin/menu', 'Orden, visibilidad y bloqueo de ítems por perfil.', 21211, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21214, 'Plantillas de correo y otros canales', '/admin/notificaciones?seccion=plantillas', 'Plantillas y reglas de notificación por evento.', 21211, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21215, 'Plataforma', '', '', NULL, 1, 11, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21216, 'Cumplimiento', '', '', 21215, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21217, 'Cambios sin autorización o fuera de ventana', '/plataforma/perfiles/auditor/cumplimiento/cambios', '', 21216, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21218, 'Muestreo de auditoría', '/plataforma/perfiles/auditor/muestreo', 'Selecciona muestras aleatorias de tickets, cambios y bajas para revisión.', 21216, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21219, 'Segregación de funciones', '/plataforma/perfiles/auditor/cumplimiento/sod', 'Detecta aprobaciones del mismo usuario, autoaprobaciones y excepciones.', 21216, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21220, 'Auditoría de cambios de configuración', '/admin/auditoria-sistema', 'Registro inmutable de cambios de configuración (antes y después).', 21215, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21221, 'Registros de seguridad y autenticación', '/admin/seguridad-logs', '', 21215, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21222, 'Recertificación de accesos', '/plataforma/perfiles/auditor/accesos/recertificacion', 'Revisión periódica de usuarios y perfiles con confirmación o retiro.', 21215, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21223, 'Retención y mantenimiento de datos', '/admin/mantenimiento-datos', '', 21215, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21224, 'Salud del sistema', '/admin/salud-sistema', 'Estado técnico del sistema para el Administrador.', 21215, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21225, 'Mi cuenta', '', '', NULL, 1, 12, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21226, 'Mi perfil y seguridad', '/mi-cuenta', 'Ver y editar datos permitidos, cambiar contraseña y ver sesiones.', 21225, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21227, 'Preferencias de notificación', '/mi-cuenta/notificaciones', 'Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.', 21225, 2, 2, true, NULL, NULL, NULL, NULL, false, false);

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro) VALUES
  (21001, 1, 1, true),
  (21001, 2, 1, true),
  (21001, 3, 1, true),
  (21001, 4, 1, true),
  (21001, 5, 1, true),
  (21001, 6, 1, true),
  (21001, 7, 1, true),
  (21001, 8, 1, true),
  (21001, 9, 1, true),
  (21001, 10, 1, true),
  (21002, 5, 1, true),
  (21002, 7, 1, true),
  (21003, 5, 1, true),
  (21004, 7, 1, true),
  (21005, 5, 1, true),
  (21006, 7, 1, true),
  (21007, 9, 1, true),
  (21008, 4, 1, true),
  (21009, 4, 1, true),
  (21010, 4, 1, true),
  (21011, 6, 1, true),
  (21012, 8, 1, true),
  (21013, 10, 1, true),
  (21014, 4, 1, true),
  (21015, 7, 1, true),
  (21016, 5, 1, true),
  (21017, 2, 1, true),
  (21018, 2, 1, true),
  (21019, 2, 1, true),
  (21020, 2, 1, true),
  (21021, 1, 1, true),
  (21022, 3, 1, true),
  (21023, 1, 1, true),
  (21023, 2, 1, true),
  (21023, 3, 1, true),
  (21023, 4, 1, true),
  (21023, 5, 1, true),
  (21023, 6, 1, true),
  (21023, 7, 1, true),
  (21024, 1, 1, true),
  (21024, 4, 1, true),
  (21024, 5, 1, true),
  (21024, 6, 1, true),
  (21025, 4, 1, true),
  (21026, 4, 1, true),
  (21027, 4, 1, true),
  (21028, 5, 1, true),
  (21029, 4, 1, true),
  (21030, 4, 1, true),
  (21031, 4, 1, true),
  (21032, 4, 1, true),
  (21032, 5, 1, true),
  (21033, 4, 1, true),
  (21034, 5, 1, true),
  (21035, 1, 1, true),
  (21035, 4, 1, true),
  (21035, 6, 1, true),
  (21036, 2, 1, true),
  (21037, 2, 1, true),
  (21038, 2, 1, true),
  (21039, 2, 1, true),
  (21040, 2, 1, true),
  (21041, 2, 1, true),
  (21042, 2, 1, true),
  (21043, 2, 1, true),
  (21044, 2, 1, true),
  (21044, 4, 1, true),
  (21045, 4, 1, true),
  (21046, 4, 1, true),
  (21047, 2, 1, true),
  (21047, 4, 1, true),
  (21048, 2, 1, true),
  (21049, 4, 1, true),
  (21050, 3, 1, true),
  (21050, 5, 1, true),
  (21051, 3, 1, true),
  (21052, 3, 1, true),
  (21052, 5, 1, true),
  (21053, 3, 1, true),
  (21054, 3, 1, true),
  (21055, 5, 1, true),
  (21055, 7, 1, true),
  (21056, 1, 1, true),
  (21056, 4, 1, true),
  (21056, 6, 1, true),
  (21057, 4, 1, true),
  (21058, 3, 1, true),
  (21059, 1, 1, true),
  (21059, 2, 1, true),
  (21059, 4, 1, true),
  (21059, 5, 1, true),
  (21059, 6, 1, true),
  (21059, 7, 1, true),
  (21059, 8, 1, true),
  (21060, 2, 1, true),
  (21060, 4, 1, true),
  (21060, 5, 1, true),
  (21061, 4, 1, true),
  (21062, 2, 1, true),
  (21063, 5, 1, true),
  (21064, 2, 1, true),
  (21065, 4, 1, true),
  (21066, 2, 1, true),
  (21067, 2, 1, true),
  (21068, 2, 1, true),
  (21069, 4, 1, true),
  (21070, 2, 1, true),
  (21071, 4, 1, true),
  (21071, 5, 1, true),
  (21071, 7, 1, true),
  (21071, 8, 1, true),
  (21072, 8, 1, true),
  (21073, 8, 1, true),
  (21074, 8, 1, true),
  (21075, 8, 1, true),
  (21076, 8, 1, true),
  (21077, 8, 1, true),
  (21078, 8, 1, true),
  (21079, 8, 1, true),
  (21080, 1, 1, true),
  (21080, 6, 1, true),
  (21080, 8, 1, true),
  (21081, 7, 1, true),
  (21081, 8, 1, true),
  (21082, 7, 1, true),
  (21083, 7, 1, true),
  (21084, 8, 1, true),
  (21085, 7, 1, true),
  (21085, 8, 1, true),
  (21086, 5, 1, true),
  (21086, 8, 1, true),
  (21087, 5, 1, true),
  (21087, 7, 1, true),
  (21088, 5, 1, true),
  (21089, 7, 1, true),
  (21090, 7, 1, true),
  (21091, 1, 1, true),
  (21091, 2, 1, true),
  (21091, 4, 1, true),
  (21091, 6, 1, true),
  (21091, 7, 1, true),
  (21091, 10, 1, true),
  (21092, 10, 1, true),
  (21093, 4, 1, true),
  (21094, 10, 1, true),
  (21095, 10, 1, true),
  (21096, 2, 1, true),
  (21097, 10, 1, true),
  (21098, 2, 1, true),
  (21099, 4, 1, true),
  (21099, 10, 1, true),
  (21100, 10, 1, true),
  (21101, 10, 1, true),
  (21102, 2, 1, true),
  (21103, 2, 1, true),
  (21104, 10, 1, true),
  (21105, 2, 1, true),
  (21106, 1, 1, true),
  (21106, 4, 1, true),
  (21106, 6, 1, true),
  (21106, 10, 1, true),
  (21107, 7, 1, true),
  (21108, 10, 1, true),
  (21109, 1, 1, true),
  (21109, 2, 1, true),
  (21109, 3, 1, true),
  (21109, 4, 1, true),
  (21109, 5, 1, true),
  (21109, 6, 1, true),
  (21109, 7, 1, true),
  (21109, 9, 1, true),
  (21110, 1, 1, true),
  (21110, 2, 1, true),
  (21110, 3, 1, true),
  (21110, 4, 1, true),
  (21110, 5, 1, true),
  (21110, 6, 1, true),
  (21110, 9, 1, true),
  (21111, 5, 1, true),
  (21112, 9, 1, true),
  (21113, 9, 1, true),
  (21114, 1, 1, true),
  (21114, 4, 1, true),
  (21114, 6, 1, true),
  (21114, 9, 1, true),
  (21115, 9, 1, true),
  (21116, 2, 1, true),
  (21117, 2, 1, true),
  (21118, 3, 1, true),
  (21119, 9, 1, true),
  (21120, 4, 1, true),
  (21120, 6, 1, true),
  (21120, 7, 1, true),
  (21120, 9, 1, true),
  (21121, 4, 1, true),
  (21122, 6, 1, true),
  (21123, 9, 1, true),
  (21124, 7, 1, true),
  (21125, 2, 1, true),
  (21125, 9, 1, true),
  (21126, 9, 1, true),
  (21127, 2, 1, true),
  (21128, 2, 1, true),
  (21128, 4, 1, true),
  (21128, 6, 1, true),
  (21128, 9, 1, true),
  (21129, 9, 1, true),
  (21130, 2, 1, true),
  (21131, 9, 1, true),
  (21132, 4, 1, true),
  (21132, 6, 1, true),
  (21133, 2, 1, true),
  (21133, 6, 1, true),
  (21133, 9, 1, true),
  (21134, 9, 1, true),
  (21135, 9, 1, true),
  (21136, 9, 1, true),
  (21137, 9, 1, true),
  (21138, 9, 1, true),
  (21139, 9, 1, true),
  (21140, 2, 1, true),
  (21141, 9, 1, true),
  (21142, 6, 1, true),
  (21143, 5, 1, true),
  (21143, 9, 1, true),
  (21144, 9, 1, true),
  (21145, 5, 1, true),
  (21146, 9, 1, true),
  (21147, 9, 1, true),
  (21148, 1, 1, true),
  (21148, 9, 1, true),
  (21149, 1, 1, true),
  (21150, 9, 1, true),
  (21151, 1, 1, true),
  (21152, 9, 1, true),
  (21153, 1, 1, true),
  (21154, 1, 1, true),
  (21155, 9, 1, true),
  (21156, 2, 1, true),
  (21156, 3, 1, true),
  (21156, 4, 1, true),
  (21156, 5, 1, true),
  (21157, 3, 1, true),
  (21157, 4, 1, true),
  (21157, 5, 1, true),
  (21158, 2, 1, true),
  (21159, 2, 1, true),
  (21160, 2, 1, true),
  (21161, 4, 1, true),
  (21162, 2, 1, true),
  (21163, 1, 1, true),
  (21163, 2, 1, true),
  (21164, 2, 1, true),
  (21165, 1, 1, true),
  (21166, 1, 1, true),
  (21167, 1, 1, true),
  (21168, 1, 1, true),
  (21169, 1, 1, true),
  (21170, 1, 1, true),
  (21170, 4, 1, true),
  (21171, 4, 1, true),
  (21172, 4, 1, true),
  (21173, 1, 1, true),
  (21174, 1, 1, true),
  (21174, 4, 1, true),
  (21174, 5, 1, true),
  (21174, 6, 1, true),
  (21174, 7, 1, true),
  (21174, 8, 1, true),
  (21174, 9, 1, true),
  (21174, 10, 1, true),
  (21175, 1, 1, true),
  (21175, 4, 1, true),
  (21175, 6, 1, true),
  (21176, 6, 1, true),
  (21177, 4, 1, true),
  (21178, 9, 1, true),
  (21179, 8, 1, true),
  (21180, 7, 1, true),
  (21181, 10, 1, true),
  (21182, 5, 1, true),
  (21183, 1, 1, true),
  (21183, 6, 1, true),
  (21184, 1, 1, true),
  (21184, 6, 1, true),
  (21184, 8, 1, true),
  (21185, 1, 1, true),
  (21186, 1, 1, true),
  (21187, 1, 1, true),
  (21188, 1, 1, true),
  (21189, 1, 1, true),
  (21190, 1, 1, true),
  (21190, 8, 1, true),
  (21191, 1, 1, true),
  (21192, 8, 1, true),
  (21193, 1, 1, true),
  (21194, 1, 1, true),
  (21195, 8, 1, true),
  (21196, 1, 1, true),
  (21197, 8, 1, true),
  (21198, 1, 1, true),
  (21199, 1, 1, true),
  (21200, 1, 1, true),
  (21201, 1, 1, true),
  (21202, 1, 1, true),
  (21203, 1, 1, true),
  (21204, 1, 1, true),
  (21205, 1, 1, true),
  (21206, 1, 1, true),
  (21207, 1, 1, true),
  (21208, 1, 1, true),
  (21208, 6, 1, true),
  (21209, 1, 1, true),
  (21210, 1, 1, true),
  (21210, 6, 1, true),
  (21211, 1, 1, true),
  (21212, 1, 1, true),
  (21213, 1, 1, true),
  (21214, 1, 1, true),
  (21215, 1, 1, true),
  (21215, 6, 1, true),
  (21216, 6, 1, true),
  (21217, 6, 1, true),
  (21218, 6, 1, true),
  (21219, 6, 1, true),
  (21220, 1, 1, true),
  (21220, 6, 1, true),
  (21221, 1, 1, true),
  (21221, 6, 1, true),
  (21222, 6, 1, true),
  (21223, 1, 1, true),
  (21223, 6, 1, true),
  (21224, 1, 1, true),
  (21225, 1, 1, true),
  (21225, 2, 1, true),
  (21225, 3, 1, true),
  (21225, 4, 1, true),
  (21225, 5, 1, true),
  (21225, 6, 1, true),
  (21225, 7, 1, true),
  (21225, 8, 1, true),
  (21225, 9, 1, true),
  (21225, 10, 1, true),
  (21226, 1, 1, true),
  (21226, 2, 1, true),
  (21226, 3, 1, true),
  (21226, 4, 1, true),
  (21226, 5, 1, true),
  (21226, 6, 1, true),
  (21226, 7, 1, true),
  (21226, 8, 1, true),
  (21226, 9, 1, true),
  (21226, 10, 1, true),
  (21227, 1, 1, true),
  (21227, 2, 1, true),
  (21227, 3, 1, true),
  (21227, 4, 1, true),
  (21227, 5, 1, true),
  (21227, 6, 1, true),
  (21227, 7, 1, true),
  (21227, 8, 1, true),
  (21227, 9, 1, true),
  (21227, 10, 1, true);

COMMIT;

-- Opciones: 227 | visibilidad: 363 filas
