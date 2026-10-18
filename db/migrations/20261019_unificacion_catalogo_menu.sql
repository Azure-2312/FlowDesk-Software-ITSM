-- Unificacion del catalogo de menu: 1 fila por pantalla + visibilidad por perfil.
-- Generado a partir de la base al 2026-10-18. Ver DOCUMENTACION/UNIFICACION_CATALOGO_MENU.md.
-- Raices por modulo, subcarpetas por seccion, ids nuevos (21000+).

BEGIN;

CREATE TABLE IF NOT EXISTS opciones_menu_bak_20261018 AS SELECT * FROM opciones_menu;
CREATE TABLE IF NOT EXISTS opciones_menu_perfiles_bak_20261018 AS SELECT * FROM opciones_menu_perfiles;

DELETE FROM opciones_menu_perfiles;
DELETE FROM opciones_menu;

INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21001, 'Mi trabajo', '', '', NULL, 1, 1, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21002, 'Aprobaciones', '', '', 21001, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21003, 'Equipo', '', '', 21001, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21004, 'Mesa de Servicio', '', '', NULL, 1, 2, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21005, 'Gestión', '', '', 21004, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21006, 'Mi mesa', '', '', 21004, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21007, 'SLA', '', '', 21004, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21008, 'Catálogo', '', '', 21004, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21009, 'Aprobaciones', '', '', 21004, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21010, 'Auditoría', '', '', 21004, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21011, 'Incidentes mayores', '', '', 21004, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21012, 'Avisos', '', '', 21004, 2, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21013, 'Cambios', '', '', NULL, 1, 3, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21014, 'Mis cambios', '', '', 21013, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21015, 'Gestión', '', '', 21013, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21016, 'CAB', '', '', 21013, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21017, 'Aprobaciones', '', '', 21013, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21018, 'Problemas', '', '', NULL, 1, 4, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21019, 'Activos y CMDB', '', '', NULL, 1, 5, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21020, 'Inventario', '', '', 21019, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21021, 'Bajas y disposición', '', '', 21019, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21022, 'Mantenimiento', '', '', 21019, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21023, 'Licencias', '', '', 21019, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21024, 'CMDB', '', '', 21019, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21025, 'Proveedores y contratos', '', '', 21019, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21026, 'Catálogos', '', '', 21019, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21027, 'Conocimiento', '', '', NULL, 1, 6, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21028, 'Catálogo de Servicios', '', '', NULL, 1, 7, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21029, 'Operación', '', '', NULL, 1, 8, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21030, 'Reportes', '', '', NULL, 1, 9, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21031, 'Auditoría', '', '', 21030, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21032, 'Configuración', '', '', NULL, 1, 10, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21033, 'Mesa de Servicio', '', '', 21032, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21034, 'Cambios', '', '', 21032, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21035, 'Problemas', '', '', 21032, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21036, 'Conocimiento', '', '', 21032, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21037, 'Organización', '', '', 21032, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21038, 'Identidades', '', '', 21032, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21039, 'Menú y notificaciones', '', '', 21032, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21040, 'Plataforma', '', '', NULL, 1, 11, true, NULL, NULL, NULL, NULL, false, true);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21041, 'Cumplimiento', '', '', 21040, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21042, 'Accesos', '', '', 21040, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21043, 'Mi cuenta', '', '', NULL, 1, 12, true, NULL, NULL, NULL, NULL, false, true);

INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21044, 'Panel de activos y CMDB', '/gestor-activos/panel', 'Garantías por vencer, actas pendientes, sobreuso de licencias, inexactitudes y campañas activas.', 21001, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21045, 'Panel de auditoría', '/plataforma/perfiles/auditor/panel', 'Hallazgos, cumplimiento y muestras pendientes (solo lectura).', 21001, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21046, 'Panel de gestión de cambios', '/plataforma/perfiles/gestor-cambios/panel', 'Inicio: RFC por evaluar, autorizaciones pendientes, cambios de hoy, conflictos y PIR vencidas.', 21001, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21047, 'Panel de gestión de problemas', '/gestor-problemas/panel', 'Problemas abiertos, sin asignar, por vencer, mayores y errores conocidos por revisar.', 21001, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21048, 'Panel de supervisión', '/plataforma/perfiles/supervisor/panel', 'Página de inicio del supervisor: estado del equipo en un vistazo.', 21001, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21049, 'Panel del aprobador', '/plataforma/perfiles/aprobador/panel', 'Pendientes por vencer, reuniones del comité y decisiones recientes.', 21001, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21050, 'Panel del área', '/plataforma/perfiles/gestor-area/panel', 'Inicio del jefe de área (no TI).', 21001, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21051, 'Panel del técnico', '/plataforma/perfiles/tecnico/panel', 'Qué atender ahora: indicadores, tickets urgentes, agenda, avisos y carga.', 21001, 2, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21052, 'Mi agenda y disponibilidad', '/plataforma/perfiles/tecnico/agenda', 'Calendario personal y estado Disponible / Ocupado / No disponible.', 21001, 2, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21053, 'Mi desempeño', '/plataforma/perfiles/tecnico/desempeno', 'Indicadores propios y agregados del grupo.', 21001, 2, 10, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21054, 'Mis tareas', '/plataforma/perfiles/tecnico/tareas', 'Tareas de tickets, problemas, cambios, mantenimientos y recordatorios personales.', 21001, 2, 11, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21055, 'Delegación de aprobaciones', '/plataforma/perfiles/gestor-area/aprobaciones/delegacion', 'Delegar por ausencia a un suplente del área.', 21002, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21056, 'Delegaciones', '/plataforma/perfiles/aprobador/delegaciones', 'Delegar por ausencia a un suplente con vigencia.', 21002, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21057, 'Historial de mis decisiones', '/plataforma/perfiles/gestor-area/aprobaciones/historial', '', 21002, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21058, 'Historial de mis decisiones', '/plataforma/perfiles/aprobador/historial', '', 21002, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21059, 'Ausencias y guardias del equipo', '/plataforma/perfiles/supervisor/equipo/ausencias', 'Registrar y editar ausencias de mi equipo; las usa la asignación automática.', 21003, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21060, 'Vistas y respuestas compartidas', '/plataforma/perfiles/supervisor/equipo/vistas', 'Vistas guardadas y respuestas predefinidas del grupo.', 21003, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21061, 'Asignados', '/tickets/gestion/asignados', '', 21005, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21062, 'Bandeja de pendientes', '/tickets/gestion/bandeja', '', 21005, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21063, 'Centro de asignación', '/tickets/gestion/asignar', 'Asignar y reasignar tickets del área técnica.', 21005, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21064, 'Colaboradores de mi área', '/tickets/gestion/colaboradores', '', 21005, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21065, 'Historial de resueltos', '/tickets/gestion/resueltos', '', 21005, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21066, 'Incidentes', '/tickets/gestion/incidentes', '', 21005, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21067, 'Mis tickets', '/tickets/gestion/mios', '', 21005, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21068, 'Registrar ticket para un usuario', '/tickets/gestion/crear', 'Crear tickets a nombre de un colaborador de su departamento.', 21005, 3, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21069, 'Solicitudes de servicio', '/tickets/gestion/solicitudes', '', 21005, 3, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21070, 'Tickets de mi departamento', '/tickets/gestion/departamento', 'Solo los del departamento; vista de Gobernanza sin acciones técnicas.', 21005, 3, 10, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21071, 'Todos los tickets', '/tickets/gestion/todos', '', 21005, 3, 11, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21072, 'Bandeja de mi grupo', '/plataforma/perfiles/tecnico/mesa/pendientes', 'Cola sin asignar de mis grupos; tomar de forma atómica.', 21006, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21073, 'Búsqueda avanzada', '/plataforma/perfiles/tecnico/mesa/buscar', '', 21006, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21074, 'Historial de mis tickets', '/plataforma/perfiles/tecnico/mesa/historial', '', 21006, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21075, 'Incidente mayor (sala de crisis)', '/plataforma/perfiles/tecnico/mesa/incidente-mayor', 'Vista de coordinación cuando el Supervisor declara un incidente mayor: línea de tiempo, tareas y comunicados.', 21006, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21076, 'Mis tickets asignados', '/plataforma/perfiles/tecnico/mesa/asignados', 'Cola personal con SLA y acciones rápidas.', 21006, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21077, 'Registrar ticket para un usuario', '/plataforma/perfiles/tecnico/mesa/registrar', 'Registro por teléfono, chat o presencial, con resolución en primer contacto.', 21006, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21078, 'Tickets de mi área técnica', '/plataforma/perfiles/tecnico/mesa/area', 'Consulta de todo el departamento de TI y ofrecer ayuda.', 21006, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21079, 'Escalamientos y riesgos de SLA', '/plataforma/perfiles/supervisor/sla/escalamientos', 'Tickets escalados jerárquicamente y en riesgo; permite intervenir.', 21007, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21080, 'Incumplimientos y causas', '/plataforma/perfiles/supervisor/sla/incumplimientos', 'Análisis de tickets vencidos por servicio, técnico y causa.', 21007, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21081, 'Objetivos de tiempo vigentes', '/plataforma/perfiles/tecnico/sla/objetivos', 'Se reutiliza en modo consulta.', 21007, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21082, 'Semáforo de SLA de mi cola', '/plataforma/perfiles/tecnico/sla/semaforo', '', 21007, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21083, 'Semáforo de SLA del grupo', '/plataforma/perfiles/supervisor/sla/semaforo', 'Misma vista que el técnico con alcance de todo el grupo.', 21007, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21084, 'Catálogo de incidentes', '/tickets/catalogo?tipo=incidente', 'Categorías y servicios para reportar fallas; sin botones superiores que repitan el menú.', 21008, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21085, 'Catálogo de servicios', '/tickets/catalogo', 'Elegir el servicio en el catálogo y completar el formulario dinámico de incidente o solicitud.', 21008, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21086, 'Catálogo de solicitudes de servicio', '/tickets/catalogo?tipo=solicitud', 'Categorías y servicios para pedir requerimientos; muestra si requiere aprobación.', 21008, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21087, 'Mis tickets', '/tickets', 'Lista de los propios con estado y tiempo restante.', 21008, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21088, 'Aprobaciones de solicitudes', '/tickets/gestion/aprobaciones', 'Solicitudes que requieren aprobación de jefatura.', 21009, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21089, 'Auditoría de tickets', '/tickets/gestion/auditoria', '', 21010, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21090, 'Incidentes mayores', '/plataforma/perfiles/supervisor/incidentes-mayores', 'Declarar, coordinar, comunicar y cerrar incidentes mayores.', 21011, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21091, 'Avisos de servicio', '/avisos/mantenimientos', 'Mantenimientos programados con interrupción que afectan a mi área, tomados del calendario de cambios.', 21012, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21092, 'Calendario de cambios', '/cambios/gestion/calendario', '', 21013, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21093, 'Historial de cambios', '/cambios/gestion/todos', '', 21013, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21094, 'Solicitar un cambio', '/cambios/gestion/crear', 'Formulario del Prompt 2 con validación de calendario y análisis de impacto.', 21013, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21095, 'Aprobaciones técnicas de RFC', '/plataforma/perfiles/supervisor/cambios/aprobaciones', 'Etapa Técnica de las RFC del grupo implementador; segregación de funciones.', 21014, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21096, 'Calendario de mis cambios', '/plataforma/perfiles/tecnico/cambios/calendario', '', 21014, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21097, 'Cambios con interrupción para mi área', '/plataforma/perfiles/gestor-area/cambios/impacto', '', 21014, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21098, 'Cambios por implementar', '/plataforma/perfiles/tecnico/cambios/implementacion', 'Consola de implementación: Go/No-Go, bitácora, rollback y resultado.', 21014, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21099, 'Cambios que afectan a mi equipo', '/plataforma/perfiles/supervisor/cambios/impacto', 'Misma lógica del técnico con alcance de grupo.', 21014, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21100, 'Cambios que afectan mis servicios', '/plataforma/perfiles/tecnico/cambios/impacto', '', 21014, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21101, 'Historial de mis cambios', '/plataforma/perfiles/tecnico/cambios/historial', '', 21014, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21102, 'Mis cambios', '/plataforma/perfiles/tecnico/cambios/mis-cambios', '', 21014, 3, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21103, 'Programación de implementaciones del equipo', '/plataforma/perfiles/supervisor/cambios/programar', 'Programar y reprogramar dentro de ventanas permitidas.', 21014, 3, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21104, 'Registrar solicitud RFC', '/plataforma/perfiles/tecnico/cambios/nuevo', '', 21014, 3, 10, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21105, 'Bandeja de RFC por evaluar', '/plataforma/perfiles/gestor-cambios/evaluacion', 'Asignar evaluador, calcular riesgo, revisar conflictos y enviar a autorización.', 21015, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21106, 'Conflictos y capacidad', '/plataforma/perfiles/gestor-cambios/conflictos', 'Solapamientos, congelamientos, feriados y máximos simultáneos.', 21015, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21107, 'Modelos de cambio estándar', '/plataforma/perfiles/gestor-cambios/modelos', 'Consulta y propuesta de modelos, métricas de éxito y suspensiones.', 21015, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21108, 'Programación de cambios autorizados', '/plataforma/perfiles/gestor-cambios/programacion', '', 21015, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21109, 'Revisión post-implementación', '/plataforma/perfiles/gestor-cambios/pir', 'PIR pendientes y vencidas; incidentes causados; lecciones aprendidas.', 21015, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21110, 'Seguimiento de ejecución', '/plataforma/perfiles/gestor-cambios/ejecucion', 'Tablero en vivo de cambios en ejecución, extensiones de ventana y rollbacks.', 21015, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21111, 'Seguimiento de etapas de aprobación', '/plataforma/perfiles/gestor-cambios/autorizaciones', 'Etapas pendientes, plazos, recordatorios y escalamiento.', 21015, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21112, 'Agenda y actas', '/plataforma/perfiles/aprobador/cab/agenda', '', 21016, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21113, 'Comité de emergencia (ECAB)', '/plataforma/perfiles/aprobador/cab/emergencia', 'Decisión rápida con plazo y revisión retroactiva.', 21016, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21114, 'Convocatoria, agenda y actas', '/plataforma/perfiles/gestor-cambios/cab/agenda', 'Genera agenda con corte, convoca reuniones extraordinarias y emite el acta.', 21016, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21115, 'Dictamen colegiado (CAB)', '/cambios/gestion/cab', 'Quórum, votación, voto de calidad, exclusión por conflicto de interés.', 21016, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21116, 'Aprobación de negocio de cambios', '/plataforma/perfiles/gestor-area/cambios/aprobaciones', 'Etapa Negocio de las RFC que afectan a mi departamento.', 21017, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21117, 'Aprobaciones de cambios', '/plataforma/perfiles/aprobador/cambios', 'Etapas Dirección y excepciones: aprobar, aprobar con condiciones, rechazar, pedir información o delegar.', 21017, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21118, 'Modelos de cambio estándar', '/plataforma/perfiles/aprobador/cambios/modelos', '', 21017, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21119, 'Análisis de causa raíz', '/gestor-problemas/analisis', 'Herramientas de 5 porqués, Ishikawa y línea de tiempo.', 21018, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21120, 'Asignación de problemas', '/plataforma/perfiles/supervisor/problemas/asignar', 'Reparte problemas sin responsable mientras no exista el Gestor de Problemas.', 21018, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21121, 'Bandeja y asignación', '/gestor-problemas/asignacion', 'Asignar responsables, grupos y prioridad.', 21018, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21122, 'Candidatos a problema', '/gestor-problemas/candidatos', 'Sugerencias de las reglas de umbral con alcance global.', 21018, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21123, 'Candidatos de mi grupo', '/plataforma/perfiles/tecnico/problemas/candidatos', '', 21018, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21124, 'Conocimiento derivado', '/gestor-problemas/conocimiento', 'Artículos generados y pendientes por problema.', 21018, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21125, 'Consultar KEDB', '/plataforma/perfiles/tecnico/problemas/errores-conocidos', '', 21018, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21126, 'Errores conocidos (KEDB)', '/problemas/kedb', 'Publicar, retirar y revisar periódicamente.', 21018, 2, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21127, 'Incidentes recurrentes', '/gestor-problemas/recurrentes', 'Agrupación por servicio, CI, categoría y código de resolución.', 21018, 2, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21128, 'Objetivos de tiempo', '/gestor-problemas/objetivos', 'Consulta de los objetivos internos de problemas.', 21018, 2, 10, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21129, 'Problemas asignados a mí', '/plataforma/perfiles/tecnico/problemas/asignados', '', 21018, 2, 11, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21130, 'Problemas de mi grupo', '/plataforma/perfiles/tecnico/problemas/grupo', '', 21018, 2, 12, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21131, 'Problemas mayores y revisión', '/gestor-problemas/mayores', '', 21018, 2, 13, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21132, 'Registrar problema', '/plataforma/perfiles/tecnico/problemas/nuevo', '', 21018, 2, 14, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21133, 'Registro de problemas', '/problemas', '', 21018, 2, 15, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21134, 'Riesgo aceptado y cierre de problemas mayores', '/plataforma/perfiles/aprobador/problemas', '', 21018, 2, 16, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21135, 'Solicitudes de cambio derivadas', '/gestor-problemas/cambios', 'RFC vinculadas a problemas y su estado.', 21018, 2, 17, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21136, 'Activos de mi área', '/plataforma/perfiles/gestor-area/activos', 'Lectura de activos por colaborador, sin datos financieros sensibles.', 21020, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21137, 'Asignación, custodia y actas', '/gestor-activos/asignaciones', 'Asignar, transferir, devolver; actas y aceptación del custodio.', 21020, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21138, 'Importación masiva', '/gestor-activos/importacion', 'Validación en seco, mapeo de columnas y reversión.', 21020, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21139, 'Inventario de activos', '/activos/inventario', '', 21020, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21140, 'Inventario físico (campañas)', '/gestor-activos/inventario-fisico', 'Crear campañas, revisar discrepancias y cerrar con acta (el conteo en campo lo hace el técnico).', 21020, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21141, 'Inventario físico en campo', '/plataforma/perfiles/tecnico/activos/conteos', 'Conteo con escaneo desde teléfono.', 21020, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21142, 'Inventario técnico', '/plataforma/perfiles/tecnico/activos/inventario', '', 21020, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21143, 'Mis activos', '/activos/mis-activos', 'Activos que el usuario tiene en custodia.', 21020, 3, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21144, 'Recepción de adquisiciones', '/gestor-activos/recepcion', 'Recepción por lote con series, garantía y vínculo a la solicitud de origen.', 21020, 3, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21145, 'Aprobación de bajas de mi área', '/plataforma/perfiles/supervisor/activos/bajas', 'Aprueba o rechaza bajas solicitadas por técnicos.', 21021, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21146, 'Bajas y disposición', '/plataforma/perfiles/auditor/activos/bajas', 'Actas de baja, borrado seguro y destino final.', 21021, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21147, 'Bajas y disposición', '/gestor-activos/bajas', 'Solicitudes de baja, borrado seguro, acta y destino final.', 21021, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21148, 'Bajas y renovaciones por monto', '/plataforma/perfiles/aprobador/activos', '', 21021, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21149, 'Mantenimiento y garantías', '/gestor-activos/mantenimiento', '', 21022, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21150, 'Mantenimiento y reparaciones', '/plataforma/perfiles/tecnico/activos/mantenimiento', '', 21022, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21151, 'Catálogo de software autorizado', '/gestor-activos/licencias/catalogo-software', '', 21023, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21152, 'Consultar licencias', '/plataforma/perfiles/tecnico/activos/licencias', '', 21023, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21153, 'Cumplimiento y sobreuso', '/gestor-activos/licencias/cumplimiento', '', 21023, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21154, 'Licencias de software', '/activos/licencias', '', 21023, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21155, 'Actualizaciones de CMDB desde cambios', '/gestor-activos/cmdb/actualizaciones', 'Aplica a la CMDB lo propuesto en las RFC cerradas.', 21024, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21156, 'Análisis e impacto', '/activos/cmdb/analisis', 'Topología de dependencias, impacto en fallas y reconciliación Activo ↔ CI.', 21024, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21157, 'Calidad y auditoría de CMDB', '/gestor-activos/cmdb/auditoria', '', 21024, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21158, 'Inexactitudes reportadas', '/gestor-activos/cmdb/inexactitudes', 'Tareas generadas por técnicos.', 21024, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21159, 'Líneas base', '/gestor-activos/cmdb/lineas-base', '', 21024, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21160, 'Mapa de topología', '/activos/cmdb', '', 21024, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21161, 'Mapa de topología CMDB', '/plataforma/perfiles/tecnico/activos/mapa', '', 21024, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21162, 'Modelado de clases CI', '/activos/cmdb/tipos', '', 21024, 3, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21163, 'Resultados de auditorías de CMDB', '/plataforma/perfiles/auditor/cmdb/resultados', '', 21024, 3, 9, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21164, 'Contratos y cobertura', '/gestor-activos/contratos', '', 21025, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21165, 'Licencias y contratos de mi departamento', '/plataforma/perfiles/gestor-area/contratos', '', 21025, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21166, 'Proveedores', '/proveedores', 'Proveedores con validación de RUC y contacto.', 21025, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21167, 'Renovaciones y vencimientos', '/gestor-activos/renovaciones', 'Genera solicitudes de renovación y registra el historial.', 21025, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21168, 'Ciclos de vida y reglas de transición', '/admin/activos-config/ciclos-vida-transiciones', '', 21026, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21169, 'Fabricantes y modelos', '/admin/activos-config/tipos-modelos-atributos?vista=fabricantes', '', 21026, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21170, 'Licencias y contratos', '/admin/activos-config/licencias-contratos', '', 21026, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21171, 'Listas auxiliares', '/admin/activos-config/tipos-modelos-atributos?vista=catalogos', '', 21026, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21172, 'Tipos de elementos de configuración y relaciones de CMDB', '/admin/activos-config/cmdb-relaciones', '', 21026, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21173, 'Tipos, modelos y atributos', '/admin/activos-config/tipos-modelos-atributos', 'Clases, fabricantes, atributos, formulario, códigos, ubicaciones, listas, ficha e importación.', 21026, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21174, 'Ubicaciones', '/admin/activos-config/tipos-modelos-atributos?vista=ubicaciones', '', 21026, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21175, 'Base de conocimiento', '/conocimiento', 'Buscador por texto, categoría y servicio.', 21027, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21176, 'Consultar base de conocimiento', '/plataforma/perfiles/tecnico/conocimiento/base', '', 21027, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21177, 'Crear artículo', '/plataforma/perfiles/tecnico/conocimiento/nuevo', '', 21027, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21178, 'Mis artículos', '/plataforma/perfiles/tecnico/conocimiento/mis-articulos', '', 21027, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21179, 'Revisión y publicación de artículos', '/plataforma/perfiles/supervisor/conocimiento/revisiones', 'Revisa artículos del equipo cuando es revisor de la categoría.', 21027, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21180, 'Revisiones pendientes', '/plataforma/perfiles/tecnico/conocimiento/revisiones', '', 21027, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21181, 'Catálogo de servicios', '/plataforma/perfiles/tecnico/catalogo', '', 21028, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21182, 'Configuración de categorías', '/admin/servicios?vista=categorias', 'CRUD de categorías con unicidad de nombre y código.', 21028, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21183, 'Crear servicio', '/admin/servicios?vista=crear', 'Formulario oficial de servicio con validaciones en tiempo real.', 21028, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21184, 'Objetivos SLA', '/admin/servicios/sla', 'Matriz institucional de tiempos por prioridad y matriz impacto × urgencia.', 21028, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21185, 'Servicios de incidentes', '/admin/servicios?tipo=1', 'Listado y edición de servicios de incidente.', 21028, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21186, 'Servicios de solicitudes', '/admin/servicios?tipo=2', 'Listado, edición y flujo de aprobación por servicio.', 21028, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21187, 'Disponibilidad, capacidad y continuidad', '/operacion/resiliencia', 'Indicadores de resiliencia de los servicios del área.', 21029, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21188, 'Eventos y alertas', '/operacion/eventos', 'Eventos de monitoreo; permite convertir un evento en incidente.', 21029, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21189, 'Eventos y resiliencia', '/operacion', '', 21029, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21190, 'Indicadores operativos y SLA', '/tickets/reportes', 'Indicadores globales de SLA, volumen y satisfacción.', 21030, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21191, 'Productividad individual', '/plataforma/perfiles/supervisor/reportes/productividad', 'Resueltos, tiempos, reabiertos y satisfacción por técnico (uso de gestión, no punitivo).', 21030, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21192, 'Reportes de activos', '/gestor-activos/reportes', 'Inventario, antigüedad, costos, garantías, cumplimiento y exactitud de CMDB.', 21030, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21193, 'Reportes de cambios', '/plataforma/perfiles/gestor-cambios/reportes', 'Tasa de éxito, emergencias, tiempos de ciclo, incidentes causados y cumplimiento de ventana.', 21030, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21194, 'Reportes de decisiones', '/plataforma/perfiles/aprobador/reportes', 'Tiempo de respuesta y tasas de aprobación y rechazo.', 21030, 2, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21195, 'Reportes de problemas', '/gestor-problemas/reportes', 'Tiempo hasta causa raíz, recurrencia, problemas mayores y uso de errores conocidos.', 21030, 2, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21196, 'Reportes del área', '/plataforma/perfiles/gestor-area/reportes', 'Tickets por servicio, SLA percibido, satisfacción y costo referencial consumido.', 21030, 2, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21197, 'Tableros', '/admin/reportes-disenador', 'Diseñador de tableros.', 21030, 2, 8, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21198, 'Informes de auditoría', '/plataforma/perfiles/auditor/informes', 'Hallazgos, recomendaciones y seguimiento.', 21031, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21199, 'Flujo de atención y aprobaciones', '/admin/tickets-vistas?seccion=estados&tipo=solicitud', 'Estados, tareas y etapas de aprobación.', 21033, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21200, 'Flujo de estados y acciones', '/admin/tickets-vistas?seccion=estados&tipo=incidente', 'Estados, transiciones y acciones por rol.', 21033, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21201, 'Formulario de incidentes', '/admin/tickets-formularios?tipo=incidente', 'Campos, orden y obligatoriedad del formulario de incidente.', 21033, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21202, 'Formulario de solicitudes', '/admin/tickets-formularios?tipo=solicitud', 'Formulario de solicitud.', 21033, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21203, 'Configuración de formulario', '/admin/procesos/cambios/formulario', 'Formulario de RFC configurable; unificar los modales con los de problemas.', 21034, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21204, 'Feriados', '/admin/procesos/cambios/notificaciones-calendario?vista=feriados', '', 21034, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21205, 'Flujo de evaluación, autorización y revisión posterior', '/admin/procesos/cambios/flujo-evaluacion', 'Estados, transiciones, etapas, comités, plazos, tareas, cierre y PIR; unificar `Iconos.tsx`.', 21034, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21206, 'Notificaciones y calendario de cambios', '/admin/procesos/cambios/notificaciones-calendario', 'Eventos, ventanas, congelamientos, feriados, conflictos y presentación; el Gestor de Cambios edita solo las ventanas, congelamientos y feriados.', 21034, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21207, 'Períodos de congelamiento', '/admin/procesos/cambios/notificaciones-calendario?vista=congelamiento', '', 21034, 3, 5, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21208, 'Tipos de cambio y requisitos', '/admin/procesos/cambios/tipos-requisitos', 'Tipos, autoridad, modelos estándar y clasificación.', 21034, 3, 6, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21209, 'Ventanas de mantenimiento', '/admin/procesos/cambios/notificaciones-calendario?vista=ventanas', 'Edición permitida por el permiso `config.cambios.calendario`.', 21034, 3, 7, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21210, 'Configuración de formulario', '/admin/procesos/problemas/formulario', 'Formulario configurable de problemas con versionado.', 21035, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21211, 'Flujo de investigación y seguimiento', '/admin/procesos/problemas/flujo', 'Estados, transiciones, asignación, objetivos, escalamiento, reapertura, tareas y problemas mayores.', 21035, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21212, 'Relación con incidentes, errores conocidos y conocimiento', '/admin/procesos/problemas/relaciones', 'Umbrales, vínculos, KEDB, RFC, conocimiento y CI.', 21035, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21213, 'Categorías, responsables y reglas de publicación y revisión', '/admin/conocimiento-config', '', 21036, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21214, 'Departamentos empresariales', '/admin/departamentos-empresa', 'Áreas de negocio (finanzas, legal, ventas, marketing) y su Gestor de Área.', 21037, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21215, 'Departamentos y grupos resolutores de TI', '/admin/departamentos', 'Áreas técnicas y grupos resolutores.', 21037, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21216, 'Supervisores', '/admin/departamentos?vista=supervisores', 'Asignación de supervisores a áreas técnicas.', 21037, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21217, 'Técnicos y niveles de soporte', '/admin/tecnicos', 'Técnicos, niveles N1/N2/N3 y ausencias.', 21037, 3, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21218, 'Gestión de usuarios', '/admin/usuarios', 'Alta, edición, bloqueo y desbloqueo de usuarios; asignación de perfiles múltiples; envío de credenciales.', 21038, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21219, 'Perfiles y permisos', '/admin/perfiles', 'Matriz de permisos por perfil.', 21038, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21220, 'Configuración de contacto', '/admin/notificaciones?seccion=contacto', 'Remitente, SMTP y datos de contacto de la mesa.', 21039, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21221, 'Estructura del menú', '/admin/menu', 'Orden, visibilidad y bloqueo de ítems por perfil.', 21039, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21222, 'Plantillas de correo y otros canales', '/admin/notificaciones?seccion=plantillas', 'Plantillas y reglas de notificación por evento.', 21039, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21223, 'Auditoría de cambios de configuración', '/admin/auditoria-sistema', 'Registro inmutable de cambios de configuración (antes y después).', 21040, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21224, 'Registros de seguridad y autenticación', '/admin/seguridad-logs', '', 21040, 2, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21225, 'Retención y mantenimiento de datos', '/admin/mantenimiento-datos', '', 21040, 2, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21226, 'Salud del sistema', '/admin/salud-sistema', 'Estado técnico del sistema para el Administrador.', 21040, 2, 4, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21227, 'Cambios sin autorización o fuera de ventana', '/plataforma/perfiles/auditor/cumplimiento/cambios', '', 21041, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21228, 'Muestreo de auditoría', '/plataforma/perfiles/auditor/muestreo', 'Selecciona muestras aleatorias de tickets, cambios y bajas para revisión.', 21041, 3, 2, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21229, 'Segregación de funciones', '/plataforma/perfiles/auditor/cumplimiento/sod', 'Detecta aprobaciones del mismo usuario, autoaprobaciones y excepciones.', 21041, 3, 3, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21230, 'Recertificación de accesos', '/plataforma/perfiles/auditor/accesos/recertificacion', 'Revisión periódica de usuarios y perfiles con confirmación o retiro.', 21042, 3, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21231, 'Mi perfil y seguridad', '/mi-cuenta', 'Ver y editar datos permitidos, cambiar contraseña y ver sesiones.', 21043, 2, 1, true, NULL, NULL, NULL, NULL, false, false);
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES (21232, 'Preferencias de notificación', '/mi-cuenta/notificaciones', 'Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.', 21043, 2, 2, true, NULL, NULL, NULL, NULL, false, false);

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro) VALUES
  (21001, 9, 1, true),
  (21001, 6, 1, true),
  (21001, 8, 1, true),
  (21001, 10, 1, true),
  (21001, 4, 1, true),
  (21001, 7, 1, true),
  (21001, 5, 1, true),
  (21001, 2, 1, true),
  (21002, 5, 1, true),
  (21002, 7, 1, true),
  (21003, 4, 1, true),
  (21005, 4, 1, true),
  (21005, 5, 1, true),
  (21005, 1, 1, true),
  (21005, 6, 1, true),
  (21006, 2, 1, true),
  (21007, 4, 1, true),
  (21007, 2, 1, true),
  (21008, 3, 1, true),
  (21008, 5, 1, true),
  (21009, 5, 1, true),
  (21009, 7, 1, true),
  (21010, 1, 1, true),
  (21010, 4, 1, true),
  (21010, 6, 1, true),
  (21011, 4, 1, true),
  (21012, 3, 1, true),
  (21013, 4, 1, true),
  (21013, 5, 1, true),
  (21013, 7, 1, true),
  (21013, 8, 1, true),
  (21013, 1, 1, true),
  (21013, 6, 1, true),
  (21014, 4, 1, true),
  (21014, 2, 1, true),
  (21014, 5, 1, true),
  (21015, 8, 1, true),
  (21016, 7, 1, true),
  (21016, 8, 1, true),
  (21017, 5, 1, true),
  (21017, 7, 1, true),
  (21018, 10, 1, true),
  (21018, 4, 1, true),
  (21018, 2, 1, true),
  (21018, 1, 1, true),
  (21018, 6, 1, true),
  (21018, 7, 1, true),
  (21020, 5, 1, true),
  (21020, 9, 1, true),
  (21020, 1, 1, true),
  (21020, 4, 1, true),
  (21020, 6, 1, true),
  (21020, 2, 1, true),
  (21020, 3, 1, true),
  (21021, 4, 1, true),
  (21021, 6, 1, true),
  (21021, 9, 1, true),
  (21021, 7, 1, true),
  (21022, 9, 1, true),
  (21022, 2, 1, true),
  (21023, 9, 1, true),
  (21023, 2, 1, true),
  (21023, 4, 1, true),
  (21023, 6, 1, true),
  (21024, 9, 1, true),
  (21024, 2, 1, true),
  (21024, 6, 1, true),
  (21025, 9, 1, true),
  (21025, 5, 1, true),
  (21026, 1, 1, true),
  (21026, 9, 1, true),
  (21027, 3, 1, true),
  (21027, 4, 1, true),
  (21027, 5, 1, true),
  (21027, 2, 1, true),
  (21028, 2, 1, true),
  (21028, 1, 1, true),
  (21029, 4, 1, true),
  (21029, 1, 1, true),
  (21030, 1, 1, true),
  (21030, 4, 1, true),
  (21030, 6, 1, true),
  (21030, 9, 1, true),
  (21030, 8, 1, true),
  (21030, 7, 1, true),
  (21030, 10, 1, true),
  (21030, 5, 1, true),
  (21031, 6, 1, true),
  (21033, 1, 1, true),
  (21034, 1, 1, true),
  (21034, 8, 1, true),
  (21035, 1, 1, true),
  (21036, 1, 1, true),
  (21037, 1, 1, true),
  (21038, 1, 1, true),
  (21038, 6, 1, true),
  (21039, 1, 1, true),
  (21040, 1, 1, true),
  (21040, 6, 1, true),
  (21041, 6, 1, true),
  (21042, 6, 1, true),
  (21043, 1, 1, true),
  (21043, 2, 1, true),
  (21043, 3, 1, true),
  (21043, 4, 1, true),
  (21043, 5, 1, true),
  (21043, 6, 1, true),
  (21043, 7, 1, true),
  (21043, 8, 1, true),
  (21043, 9, 1, true),
  (21043, 10, 1, true),
  (21044, 9, 1, true),
  (21045, 6, 1, true),
  (21046, 8, 1, true),
  (21047, 10, 1, true),
  (21048, 4, 1, true),
  (21049, 7, 1, true),
  (21050, 5, 1, true),
  (21051, 2, 1, true),
  (21052, 2, 1, true),
  (21053, 2, 1, true),
  (21054, 2, 1, true),
  (21055, 5, 1, true),
  (21056, 7, 1, true),
  (21057, 5, 1, true),
  (21058, 7, 1, true),
  (21059, 4, 1, true),
  (21060, 4, 1, true),
  (21061, 4, 1, true),
  (21062, 4, 1, true),
  (21063, 4, 1, true),
  (21064, 5, 1, true),
  (21065, 4, 1, true),
  (21066, 4, 1, true),
  (21067, 4, 1, true),
  (21068, 4, 1, true),
  (21068, 5, 1, true),
  (21069, 4, 1, true),
  (21070, 5, 1, true),
  (21071, 1, 1, true),
  (21071, 4, 1, true),
  (21071, 6, 1, true),
  (21072, 2, 1, true),
  (21073, 2, 1, true),
  (21074, 2, 1, true),
  (21075, 2, 1, true),
  (21076, 2, 1, true),
  (21077, 2, 1, true),
  (21078, 2, 1, true),
  (21079, 4, 1, true),
  (21080, 4, 1, true),
  (21081, 4, 1, true),
  (21081, 2, 1, true),
  (21082, 2, 1, true),
  (21083, 4, 1, true),
  (21084, 3, 1, true),
  (21085, 3, 1, true),
  (21085, 5, 1, true),
  (21086, 3, 1, true),
  (21087, 3, 1, true),
  (21088, 5, 1, true),
  (21088, 7, 1, true),
  (21089, 1, 1, true),
  (21089, 4, 1, true),
  (21089, 6, 1, true),
  (21090, 4, 1, true),
  (21091, 3, 1, true),
  (21092, 4, 1, true),
  (21092, 5, 1, true),
  (21092, 7, 1, true),
  (21092, 8, 1, true),
  (21093, 1, 1, true),
  (21093, 6, 1, true),
  (21093, 8, 1, true),
  (21094, 5, 1, true),
  (21094, 8, 1, true),
  (21095, 4, 1, true),
  (21096, 2, 1, true),
  (21097, 5, 1, true),
  (21098, 2, 1, true),
  (21099, 4, 1, true),
  (21100, 2, 1, true),
  (21101, 2, 1, true),
  (21102, 2, 1, true),
  (21103, 4, 1, true),
  (21104, 2, 1, true),
  (21105, 8, 1, true),
  (21106, 8, 1, true),
  (21107, 8, 1, true),
  (21108, 8, 1, true),
  (21109, 8, 1, true),
  (21110, 8, 1, true),
  (21111, 8, 1, true),
  (21112, 7, 1, true),
  (21113, 7, 1, true),
  (21114, 8, 1, true),
  (21115, 7, 1, true),
  (21115, 8, 1, true),
  (21116, 5, 1, true),
  (21117, 7, 1, true),
  (21118, 7, 1, true),
  (21119, 10, 1, true),
  (21120, 4, 1, true),
  (21121, 10, 1, true),
  (21122, 10, 1, true),
  (21123, 2, 1, true),
  (21124, 10, 1, true),
  (21125, 2, 1, true),
  (21126, 4, 1, true),
  (21126, 10, 1, true),
  (21127, 10, 1, true),
  (21128, 10, 1, true),
  (21129, 2, 1, true),
  (21130, 2, 1, true),
  (21131, 10, 1, true),
  (21132, 2, 1, true),
  (21133, 1, 1, true),
  (21133, 4, 1, true),
  (21133, 6, 1, true),
  (21133, 10, 1, true),
  (21134, 7, 1, true),
  (21135, 10, 1, true),
  (21136, 5, 1, true),
  (21137, 9, 1, true),
  (21138, 9, 1, true),
  (21139, 1, 1, true),
  (21139, 4, 1, true),
  (21139, 6, 1, true),
  (21139, 9, 1, true),
  (21140, 9, 1, true),
  (21141, 2, 1, true),
  (21142, 2, 1, true),
  (21143, 3, 1, true),
  (21144, 9, 1, true),
  (21145, 4, 1, true),
  (21146, 6, 1, true),
  (21147, 9, 1, true),
  (21148, 7, 1, true),
  (21149, 9, 1, true),
  (21150, 2, 1, true),
  (21151, 9, 1, true),
  (21152, 2, 1, true),
  (21153, 9, 1, true),
  (21154, 4, 1, true),
  (21154, 6, 1, true),
  (21155, 9, 1, true),
  (21156, 9, 1, true),
  (21157, 9, 1, true),
  (21158, 9, 1, true),
  (21159, 9, 1, true),
  (21160, 9, 1, true),
  (21161, 2, 1, true),
  (21162, 9, 1, true),
  (21163, 6, 1, true),
  (21164, 9, 1, true),
  (21165, 5, 1, true),
  (21166, 9, 1, true),
  (21167, 9, 1, true),
  (21168, 1, 1, true),
  (21169, 9, 1, true),
  (21170, 1, 1, true),
  (21171, 9, 1, true),
  (21172, 1, 1, true),
  (21173, 1, 1, true),
  (21174, 9, 1, true),
  (21175, 3, 1, true),
  (21175, 4, 1, true),
  (21175, 5, 1, true),
  (21176, 2, 1, true),
  (21177, 2, 1, true),
  (21178, 2, 1, true),
  (21179, 4, 1, true),
  (21180, 2, 1, true),
  (21181, 2, 1, true),
  (21182, 1, 1, true),
  (21183, 1, 1, true),
  (21184, 1, 1, true),
  (21185, 1, 1, true),
  (21186, 1, 1, true),
  (21187, 4, 1, true),
  (21188, 4, 1, true),
  (21189, 1, 1, true),
  (21190, 1, 1, true),
  (21190, 4, 1, true),
  (21190, 6, 1, true),
  (21191, 4, 1, true),
  (21192, 9, 1, true),
  (21193, 8, 1, true),
  (21194, 7, 1, true),
  (21195, 10, 1, true),
  (21196, 5, 1, true),
  (21197, 1, 1, true),
  (21197, 6, 1, true),
  (21198, 6, 1, true),
  (21199, 1, 1, true),
  (21200, 1, 1, true),
  (21201, 1, 1, true),
  (21202, 1, 1, true),
  (21203, 1, 1, true),
  (21204, 8, 1, true),
  (21205, 1, 1, true),
  (21206, 1, 1, true),
  (21207, 8, 1, true),
  (21208, 1, 1, true),
  (21209, 8, 1, true),
  (21210, 1, 1, true),
  (21211, 1, 1, true),
  (21212, 1, 1, true),
  (21213, 1, 1, true),
  (21214, 1, 1, true),
  (21215, 1, 1, true),
  (21216, 1, 1, true),
  (21217, 1, 1, true),
  (21218, 1, 1, true),
  (21219, 1, 1, true),
  (21219, 6, 1, true),
  (21220, 1, 1, true),
  (21221, 1, 1, true),
  (21222, 1, 1, true),
  (21223, 1, 1, true),
  (21223, 6, 1, true),
  (21224, 1, 1, true),
  (21224, 6, 1, true),
  (21225, 1, 1, true),
  (21225, 6, 1, true),
  (21226, 1, 1, true),
  (21227, 6, 1, true),
  (21228, 6, 1, true),
  (21229, 6, 1, true),
  (21230, 6, 1, true),
  (21231, 1, 1, true),
  (21231, 2, 1, true),
  (21231, 3, 1, true),
  (21231, 4, 1, true),
  (21231, 5, 1, true),
  (21231, 6, 1, true),
  (21231, 7, 1, true),
  (21231, 8, 1, true),
  (21231, 9, 1, true),
  (21231, 10, 1, true),
  (21232, 1, 1, true),
  (21232, 2, 1, true),
  (21232, 3, 1, true),
  (21232, 4, 1, true),
  (21232, 5, 1, true),
  (21232, 6, 1, true),
  (21232, 7, 1, true),
  (21232, 8, 1, true),
  (21232, 9, 1, true),
  (21232, 10, 1, true);

COMMIT;

-- Opciones tras la migracion: 232 | visibilidad: 350 filas
