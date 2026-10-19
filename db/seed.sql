-- ============================================================
-- DATOS DE PRUEBA (SEED)
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

-- ---------- Perfiles ----------
INSERT INTO perfiles (id_perfil, nombre, descripcion, estado_registro) VALUES
(1, 'Administrador', 'Acceso total al sistema', true),
(2, 'Tecnico',       'Atiende y resuelve tickets asignados', true),
(3, 'Solicitante',   'Crea tickets y hace seguimiento a los suyos', true),
(4, 'Supervisor',    'Supervisa la operacion de tickets (ver todos, reasignar, reportes) sin configurar el sistema', true),
(5, 'Gestor de Area', 'Aprueba requerimientos y supervisa el servicio recibido por su departamento', true),
(6, 'Auditor',       'Consulta integral de auditoría, logs de seguridad y reportes de cumplimiento sin modificar datos', true),
(7, 'Aprobador',     'Autoridad de Cambio (CAB): evalúa impacto y autoriza solicitudes de cambio (RFC)', true),
(8, 'Gestor de Cambios', 'Change Manager: coordina el calendario de cambios y las ventanas de mantenimiento', true),
(9, 'Gestor de Activos y Configuracion', 'IT Asset & Configuration Manager: custodia el inventario de hardware, software y la CMDB', true)
ON CONFLICT (id_perfil) DO UPDATE 
SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, estado_registro = true;

-- ---------- Usuario administrador de prueba ----------
-- correo: apazamiguel88@gmail.com   clave: admin123  (guardada ya hasheada con bcrypt)
INSERT INTO usuario (dni, nombres, apellido_paterno, apellido_materno, celular, correo_electronico, clave, estado_registro)
VALUES ('00000001', 'Admin', 'Sistema', 'Prueba', '999999999', 'apazamiguel88@gmail.com',
        '$2b$10$3kQ0mHEC.2SfidxNgEyFD.4AcGMCsU16HdS4rd0QidqSr5qnQsfRm', true)
ON CONFLICT (correo_electronico) DO NOTHING;

-- El admin de prueba tiene los 9 perfiles a la vez, para poder probar
-- la pantalla de "elige tu perfil" al iniciar sesión con todos los roles.
INSERT INTO usuario_perfiles (id_usuario, id_perfil, estado_registro)
VALUES (1, 1, true), (1, 2, true), (1, 3, true), (1, 4, true), (1, 5, true), (1, 6, true), (1, 7, true), (1, 8, true), (1, 9, true)
ON CONFLICT (id_usuario, id_perfil) DO UPDATE SET estado_registro = true;

-- ---------- Catalogo unico de menu: raices por modulo + visibilidad por perfil ----------
-- Una fila por pantalla; quien la ve se define solo en opciones_menu_perfiles.
-- Incluye la Fase 2: modulos Incidentes y Solicitudes dentro de Mesa de Servicio.
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21001', 'Mi trabajo', '', '', NULL, '1', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'true');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21002', 'Aprobaciones', '', '', '21001', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21003', 'Delegación de aprobaciones', '/plataforma/perfiles/gestor-area/aprobaciones/delegacion', 'Delegar por ausencia a un suplente del área.', '21002', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21004', 'Delegaciones', '/plataforma/perfiles/aprobador/delegaciones', 'Delegar por ausencia a un suplente con vigencia.', '21002', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21005', 'Historial de aprobaciones de mi área', '/plataforma/perfiles/gestor-area/aprobaciones/historial', '', '21002', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21006', 'Historial de aprobaciones y dictámenes', '/plataforma/perfiles/aprobador/historial', '', '21002', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21007', 'Panel de activos y CMDB', '/gestor-activos/panel', 'Garantías por vencer, actas pendientes, sobreuso de licencias, inexactitudes y campañas activas.', '21001', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21008', 'Equipo', '', '', '21001', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21009', 'Ausencias y guardias del equipo', '/plataforma/perfiles/supervisor/equipo/ausencias', 'Registrar y editar ausencias de mi equipo; las usa la asignación automática.', '21008', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21010', 'Vistas y respuestas compartidas', '/plataforma/perfiles/supervisor/equipo/vistas', 'Vistas guardadas y respuestas predefinidas del grupo.', '21008', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21011', 'Panel de auditoría', '/plataforma/perfiles/auditor/panel', 'Hallazgos, cumplimiento y muestras pendientes (solo lectura).', '21001', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21012', 'Panel de gestión de cambios', '/plataforma/perfiles/gestor-cambios/panel', 'Inicio: RFC por evaluar, autorizaciones pendientes, cambios de hoy, conflictos y PIR vencidas.', '21001', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21013', 'Panel de gestión de problemas', '/gestor-problemas/panel', 'Problemas abiertos, sin asignar, por vencer, mayores y errores conocidos por revisar.', '21001', '2', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21014', 'Panel de supervisión', '/plataforma/perfiles/supervisor/panel', 'Página de inicio del supervisor: estado del equipo en un vistazo.', '21001', '2', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21015', 'Panel del aprobador', '/plataforma/perfiles/aprobador/panel', 'Pendientes por vencer, reuniones del comité y decisiones recientes.', '21001', '2', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21016', 'Panel del área', '/plataforma/perfiles/gestor-area/panel', 'Inicio del jefe de área (no TI).', '21001', '2', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21017', 'Panel del técnico', '/plataforma/perfiles/tecnico/panel', 'Qué atender ahora: indicadores, tickets urgentes, agenda, avisos y carga.', '21001', '2', '8', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21018', 'Mi agenda y disponibilidad', '/plataforma/perfiles/tecnico/agenda', 'Calendario personal y estado Disponible / Ocupado / No disponible.', '21001', '2', '9', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21019', 'Mi desempeño', '/plataforma/perfiles/tecnico/desempeno', 'Indicadores propios y agregados del grupo.', '21001', '2', '10', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21020', 'Mis tareas', '/plataforma/perfiles/tecnico/tareas', 'Tareas de tickets, problemas, cambios, mantenimientos y recordatorios personales.', '21001', '2', '11', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21021', 'Panel de administración', '/plataforma/perfiles/administrador/panel', 'Estado global de la mesa de servicio, los cambios, las identidades y los accesos.', '21001', '2', '12', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21022', 'Panel del solicitante', '/plataforma/perfiles/solicitante/panel', 'Mis tickets, mis activos asignados y las guías disponibles.', '21001', '2', '13', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21023', 'Mesa de Servicio', '', '', NULL, '1', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21024', 'Operacion de la mesa', '', 'Operaciones transversales que consumen informacion de incidentes y solicitudes.', '21023', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21044', 'SLA', '', 'Gestion de niveles de servicio.', '21023', '2', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21045', 'Escalamientos y riesgos de SLA', '/plataforma/perfiles/supervisor/sla/escalamientos', 'Tickets escalados jerárquicamente y en riesgo; permite intervenir.', '21044', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21046', 'Incumplimientos y causas', '/plataforma/perfiles/supervisor/sla/incumplimientos', 'Análisis de tickets vencidos por servicio, técnico y causa.', '21044', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21047', 'Objetivos de tiempo vigentes', '/plataforma/perfiles/tecnico/sla/objetivos', 'Se reutiliza en modo consulta.', '21044', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21048', 'Semaforo de SLA de mi cola', '/plataforma/perfiles/tecnico/sla/semaforo', '', '21044', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21049', 'Semaforo de SLA del grupo', '/plataforma/perfiles/supervisor/sla/semaforo', 'Misma vista que el técnico con alcance de todo el grupo.', '21044', '3', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21059', 'Cambios', '', '', NULL, '1', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'true');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21060', 'Mis cambios', '', '', '21059', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21061', 'Aprobaciones técnicas de RFC', '/plataforma/perfiles/supervisor/cambios/aprobaciones', 'Etapa Técnica de las RFC del grupo implementador; segregación de funciones.', '21060', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21062', 'Calendario de mis cambios', '/plataforma/perfiles/tecnico/cambios/calendario', '', '21060', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21063', 'Cambios con interrupción para mi área', '/plataforma/perfiles/gestor-area/cambios/impacto', '', '21060', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21064', 'Cambios por implementar', '/plataforma/perfiles/tecnico/cambios/implementacion', 'Consola de implementación: Go/No-Go, bitácora, rollback y resultado.', '21060', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21065', 'Cambios que afectan a mi equipo', '/plataforma/perfiles/supervisor/cambios/impacto', 'Misma lógica del técnico con alcance de grupo.', '21060', '3', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21066', 'Cambios que afectan mis servicios', '/plataforma/perfiles/tecnico/cambios/impacto', '', '21060', '3', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21067', 'Historial de mis cambios', '/plataforma/perfiles/tecnico/cambios/historial', '', '21060', '3', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21068', 'Mis cambios', '/plataforma/perfiles/tecnico/cambios/mis-cambios', '', '21060', '3', '8', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21069', 'Programación de implementaciones del equipo', '/plataforma/perfiles/supervisor/cambios/programar', 'Programar y reprogramar dentro de ventanas permitidas.', '21060', '3', '9', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21070', 'Registrar solicitud RFC', '/plataforma/perfiles/tecnico/cambios/nuevo', '', '21060', '3', '10', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21071', 'Calendario de cambios', '/cambios/gestion/calendario', '', '21059', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21072', 'Gestión', '', '', '21059', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21073', 'Bandeja de RFC por evaluar', '/plataforma/perfiles/gestor-cambios/evaluacion', 'Asignar evaluador, calcular riesgo, revisar conflictos y enviar a autorización.', '21072', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21074', 'Conflictos y capacidad', '/plataforma/perfiles/gestor-cambios/conflictos', 'Solapamientos, congelamientos, feriados y máximos simultáneos.', '21072', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21075', 'Modelos de cambio estándar', '/plataforma/perfiles/gestor-cambios/modelos', 'Consulta y propuesta de modelos, métricas de éxito y suspensiones.', '21072', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21076', 'Programación de cambios autorizados', '/plataforma/perfiles/gestor-cambios/programacion', '', '21072', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21077', 'Revisión post-implementación', '/plataforma/perfiles/gestor-cambios/pir', 'PIR pendientes y vencidas; incidentes causados; lecciones aprendidas.', '21072', '3', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21078', 'Seguimiento de ejecución', '/plataforma/perfiles/gestor-cambios/ejecucion', 'Tablero en vivo de cambios en ejecución, extensiones de ventana y rollbacks.', '21072', '3', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21079', 'Seguimiento de etapas de aprobación', '/plataforma/perfiles/gestor-cambios/autorizaciones', 'Etapas pendientes, plazos, recordatorios y escalamiento.', '21072', '3', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21080', 'Historial de cambios', '/cambios/gestion/todos', '', '21059', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21081', 'CAB', '', '', '21059', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21082', 'Agenda y actas', '/plataforma/perfiles/aprobador/cab/agenda', '', '21081', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21083', 'Comité de emergencia (ECAB)', '/plataforma/perfiles/aprobador/cab/emergencia', 'Decisión rápida con plazo y revisión retroactiva.', '21081', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21084', 'Convocatoria, agenda y actas', '/plataforma/perfiles/gestor-cambios/cab/agenda', 'Genera agenda con corte, convoca reuniones extraordinarias y emite el acta.', '21081', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21085', 'Dictamen colegiado (CAB)', '/cambios/gestion/cab', 'Quórum, votación, voto de calidad, exclusión por conflicto de interés.', '21081', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21086', 'Solicitar un cambio', '/cambios/gestion/crear', 'Formulario del Prompt 2 con validación de calendario y análisis de impacto.', '21059', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21087', 'Aprobaciones', '', '', '21059', '2', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21088', 'Aprobación de negocio de cambios', '/plataforma/perfiles/gestor-area/cambios/aprobaciones', 'Etapa Negocio de las RFC que afectan a mi departamento.', '21087', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21089', 'Aprobaciones de cambios', '/plataforma/perfiles/aprobador/cambios', 'Etapas Dirección y excepciones: aprobar, aprobar con condiciones, rechazar, pedir información o delegar.', '21087', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21090', 'Modelos de cambio estándar', '/plataforma/perfiles/aprobador/cambios/modelos', '', '21087', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21091', 'Problemas', '', '', NULL, '1', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'true');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21092', 'Análisis de causa raíz', '/gestor-problemas/analisis', 'Herramientas de 5 porqués, Ishikawa y línea de tiempo.', '21091', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21093', 'Asignación de problemas', '/plataforma/perfiles/supervisor/problemas/asignar', 'Reparte problemas sin responsable mientras no exista el Gestor de Problemas.', '21091', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21094', 'Bandeja y asignación', '/gestor-problemas/asignacion', 'Asignar responsables, grupos y prioridad.', '21091', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21095', 'Candidatos a problema', '/gestor-problemas/candidatos', 'Sugerencias de las reglas de umbral con alcance global.', '21091', '2', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21096', 'Candidatos de mi grupo', '/plataforma/perfiles/tecnico/problemas/candidatos', '', '21091', '2', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21097', 'Conocimiento derivado', '/gestor-problemas/conocimiento', 'Artículos generados y pendientes por problema.', '21091', '2', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21098', 'Consultar KEDB', '/plataforma/perfiles/tecnico/problemas/errores-conocidos', '', '21091', '2', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21099', 'Errores conocidos (KEDB)', '/problemas/kedb', 'Publicar, retirar y revisar periódicamente.', '21091', '2', '8', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21100', 'Incidentes recurrentes', '/gestor-problemas/recurrentes', 'Agrupación por servicio, CI, categoría y código de resolución.', '21091', '2', '9', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21101', 'Objetivos de tiempo', '/gestor-problemas/objetivos', 'Consulta de los objetivos internos de problemas.', '21091', '2', '10', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21102', 'Problemas asignados a mí', '/plataforma/perfiles/tecnico/problemas/asignados', '', '21091', '2', '11', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21103', 'Problemas de mi grupo', '/plataforma/perfiles/tecnico/problemas/grupo', '', '21091', '2', '12', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21104', 'Problemas mayores y revisión', '/gestor-problemas/mayores', '', '21091', '2', '13', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21105', 'Registrar problema', '/plataforma/perfiles/tecnico/problemas/nuevo', '', '21091', '2', '14', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21106', 'Registro de problemas', '/problemas', '', '21091', '2', '15', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21107', 'Riesgo aceptado y cierre de problemas mayores', '/plataforma/perfiles/aprobador/problemas', '', '21091', '2', '16', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21108', 'Solicitudes de cambio derivadas', '/gestor-problemas/cambios', 'RFC vinculadas a problemas y su estado.', '21091', '2', '17', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21109', 'Activos y CMDB', '', '', NULL, '1', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'true');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21110', 'Inventario', '', '', '21109', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21111', 'Activos de mi área', '/plataforma/perfiles/gestor-area/activos', 'Lectura de activos por colaborador, sin datos financieros sensibles.', '21110', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21112', 'Asignación, custodia y actas', '/gestor-activos/asignaciones', 'Asignar, transferir, devolver; actas y aceptación del custodio.', '21110', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21113', 'Importación masiva', '/gestor-activos/importacion', 'Validación en seco, mapeo de columnas y reversión.', '21110', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21114', 'Inventario de activos', '/activos/inventario', '', '21110', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21115', 'Inventario físico (campañas)', '/gestor-activos/inventario-fisico', 'Crear campañas, revisar discrepancias y cerrar con acta (el conteo en campo lo hace el técnico).', '21110', '3', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21116', 'Inventario físico en campo', '/plataforma/perfiles/tecnico/activos/conteos', 'Conteo con escaneo desde teléfono.', '21110', '3', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21117', 'Inventario técnico', '/plataforma/perfiles/tecnico/activos/inventario', '', '21110', '3', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21118', 'Mis activos', '/activos/mis-activos', 'Activos que el usuario tiene en custodia.', '21110', '3', '8', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21119', 'Recepción de adquisiciones', '/gestor-activos/recepcion', 'Recepción por lote con series, garantía y vínculo a la solicitud de origen.', '21110', '3', '9', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21120', 'Bajas y disposición', '', '', '21109', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21121', 'Aprobación de bajas de mi área', '/plataforma/perfiles/supervisor/activos/bajas', 'Aprueba o rechaza bajas solicitadas por técnicos.', '21120', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21122', 'Consulta de bajas', '/plataforma/perfiles/auditor/activos/bajas', 'Actas de baja, borrado seguro y destino final.', '21120', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21123', 'Gestión de bajas', '/gestor-activos/bajas', 'Solicitudes de baja, borrado seguro, acta y destino final.', '21120', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21124', 'Bajas y renovaciones por monto', '/plataforma/perfiles/aprobador/activos', '', '21120', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21125', 'Mantenimiento', '', '', '21109', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21126', 'Mantenimiento y garantías', '/gestor-activos/mantenimiento', '', '21125', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21127', 'Mantenimiento y reparaciones', '/plataforma/perfiles/tecnico/activos/mantenimiento', '', '21125', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21128', 'Licencias', '', '', '21109', '2', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21129', 'Catálogo de software autorizado', '/gestor-activos/licencias/catalogo-software', '', '21128', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21130', 'Consultar licencias', '/plataforma/perfiles/tecnico/activos/licencias', '', '21128', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21131', 'Cumplimiento y sobreuso', '/gestor-activos/licencias/cumplimiento', '', '21128', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21132', 'Licencias de software', '/activos/licencias', '', '21128', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21133', 'CMDB', '', '', '21109', '2', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21134', 'Actualizaciones de CMDB desde cambios', '/gestor-activos/cmdb/actualizaciones', 'Aplica a la CMDB lo propuesto en las RFC cerradas.', '21133', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21135', 'Análisis e impacto', '/activos/cmdb/analisis', 'Topología de dependencias, impacto en fallas y reconciliación Activo ↔ CI.', '21133', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21136', 'Calidad y auditoría de CMDB', '/gestor-activos/cmdb/auditoria', '', '21133', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21137', 'Inexactitudes reportadas', '/gestor-activos/cmdb/inexactitudes', 'Tareas generadas por técnicos.', '21133', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21138', 'Líneas base', '/gestor-activos/cmdb/lineas-base', '', '21133', '3', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21139', 'Mapa de topología', '/activos/cmdb', '', '21133', '3', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21140', 'Mapa de topología CMDB', '/plataforma/perfiles/tecnico/activos/mapa', '', '21133', '3', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21141', 'Modelado de clases CI', '/activos/cmdb/tipos', '', '21133', '3', '8', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21142', 'Resultados de auditorías de CMDB', '/plataforma/perfiles/auditor/cmdb/resultados', '', '21133', '3', '9', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21143', 'Proveedores y contratos', '', '', '21109', '2', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21144', 'Contratos y cobertura', '/gestor-activos/contratos', '', '21143', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21145', 'Licencias y contratos de mi departamento', '/plataforma/perfiles/gestor-area/contratos', '', '21143', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21146', 'Proveedores', '/proveedores', 'Proveedores con validación de RUC y contacto.', '21143', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21147', 'Renovaciones y vencimientos', '/gestor-activos/renovaciones', 'Genera solicitudes de renovación y registra el historial.', '21143', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21148', 'Catálogos', '', '', '21109', '2', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21149', 'Ciclos de vida y reglas de transición', '/admin/activos-config/ciclos-vida-transiciones', '', '21148', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21150', 'Fabricantes y modelos', '/admin/activos-config/tipos-modelos-atributos?vista=fabricantes', '', '21148', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21151', 'Licencias y contratos', '/admin/activos-config/licencias-contratos', '', '21148', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21152', 'Listas auxiliares', '/admin/activos-config/tipos-modelos-atributos?vista=catalogos', '', '21148', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21153', 'Tipos de elementos de configuración y relaciones de CMDB', '/admin/activos-config/cmdb-relaciones', '', '21148', '3', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21154', 'Tipos, modelos y atributos', '/admin/activos-config/tipos-modelos-atributos', 'Clases, fabricantes, atributos, formulario, códigos, ubicaciones, listas, ficha e importación.', '21148', '3', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21155', 'Ubicaciones', '/admin/activos-config/tipos-modelos-atributos?vista=ubicaciones', '', '21148', '3', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21156', 'Conocimiento', '', '', NULL, '1', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'true');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21157', 'Base de conocimiento', '/conocimiento', 'Buscador por texto, categoría y servicio.', '21156', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21158', 'Consultar base de conocimiento', '/plataforma/perfiles/tecnico/conocimiento/base', '', '21156', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21159', 'Crear artículo', '/plataforma/perfiles/tecnico/conocimiento/nuevo', '', '21156', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21160', 'Mis artículos', '/plataforma/perfiles/tecnico/conocimiento/mis-articulos', '', '21156', '2', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21161', 'Revisión y publicación de artículos', '/plataforma/perfiles/supervisor/conocimiento/revisiones', 'Revisa artículos del equipo cuando es revisor de la categoría.', '21156', '2', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21162', 'Revisiones pendientes', '/plataforma/perfiles/tecnico/conocimiento/revisiones', '', '21156', '2', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21163', 'Catálogo de Servicios', '', '', NULL, '1', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'true');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21164', 'Catálogo de servicios', '/plataforma/servicios/catalogo', '', '21163', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21165', 'Configuración de categorías', '/admin/servicios?vista=categorias', 'CRUD de categorías con unicidad de nombre y código.', '21163', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21166', 'Crear servicio', '/admin/servicios?vista=crear', 'Formulario oficial de servicio con validaciones en tiempo real.', '21163', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21167', 'Objetivos SLA', '/admin/servicios/sla', 'Matriz institucional de tiempos por prioridad y matriz impacto × urgencia.', '21163', '2', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21168', 'Servicios de incidentes', '/admin/servicios?tipo=1', 'Listado y edición de servicios de incidente.', '21163', '2', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21169', 'Servicios de solicitudes', '/admin/servicios?tipo=2', 'Listado, edición y flujo de aprobación por servicio.', '21163', '2', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21170', 'Operación', '', '', NULL, '1', '8', 'true', NULL, NULL, NULL, NULL, 'false', 'true');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21171', 'Disponibilidad, capacidad y continuidad', '/operacion/resiliencia', 'Indicadores de resiliencia de los servicios del área.', '21170', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21172', 'Eventos y alertas', '/operacion/eventos', 'Eventos de monitoreo; permite convertir un evento en incidente.', '21170', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21173', 'Eventos y resiliencia', '/operacion', '', '21170', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21174', 'Reportes', '', '', NULL, '1', '9', 'true', NULL, NULL, NULL, NULL, 'false', 'true');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21175', 'Indicadores operativos y SLA', '/plataforma/reportes/operativos', 'Indicadores globales de SLA, volumen y satisfacción.', '21174', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21176', 'Informes de auditoría', '/plataforma/reportes/auditoria', 'Hallazgos, recomendaciones y seguimiento.', '21174', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21177', 'Productividad individual', '/plataforma/reportes/productividad', 'Resueltos, tiempos, reabiertos y satisfacción por técnico (uso de gestión, no punitivo).', '21174', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21178', 'Reportes de activos', '/plataforma/reportes/activos', 'Inventario, antigüedad, costos, garantías, cumplimiento y exactitud de CMDB.', '21174', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21179', 'Reportes de cambios', '/plataforma/reportes/cambios', 'Tasa de éxito, emergencias, tiempos de ciclo, incidentes causados y cumplimiento de ventana.', '21174', '2', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21180', 'Reportes de decisiones', '/plataforma/reportes/decisiones', 'Tiempo de respuesta y tasas de aprobación y rechazo.', '21174', '2', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21181', 'Reportes de problemas', '/plataforma/reportes/problemas', 'Tiempo hasta causa raíz, recurrencia, problemas mayores y uso de errores conocidos.', '21174', '2', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21182', 'Reportes del área', '/plataforma/reportes/area', 'Tickets por servicio, SLA percibido, satisfacción y costo referencial consumido.', '21174', '2', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21183', 'Tableros', '/plataforma/reportes/tableros', 'Diseñador de tableros.', '21174', '2', '8', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21184', 'Configuración', '', '', NULL, '1', '10', 'true', NULL, NULL, NULL, NULL, 'false', 'true');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21185', 'Mesa de Servicio', '', '', '21184', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21186', 'Flujo de atención y aprobaciones', '/admin/tickets-vistas?seccion=estados&tipo=solicitud', 'Estados, tareas y etapas de aprobación.', '21185', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21187', 'Flujo de estados y acciones', '/admin/tickets-vistas?seccion=estados&tipo=incidente', 'Estados, transiciones y acciones por rol.', '21185', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21190', 'Cambios', '', '', '21184', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21191', 'Configuración de formulario', '/admin/procesos/cambios/formulario', 'Formulario de RFC configurable; unificar los modales con los de problemas.', '21190', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21192', 'Feriados', '/admin/procesos/cambios/notificaciones-calendario?vista=feriados', '', '21190', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21193', 'Flujo de evaluación, autorización y revisión posterior', '/admin/procesos/cambios/flujo-evaluacion', 'Estados, transiciones, etapas, comités, plazos, tareas, cierre y PIR; unificar `Iconos.tsx`.', '21190', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21194', 'Notificaciones de cambios', '/admin/procesos/cambios/notificaciones-calendario', 'Eventos, ventanas, congelamientos, feriados, conflictos y presentación; el Gestor de Cambios edita solo las ventanas, congelamientos y feriados.', '21190', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21195', 'Períodos de congelamiento', '/admin/procesos/cambios/notificaciones-calendario?vista=congelamiento', '', '21190', '3', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21196', 'Tipos de cambio y requisitos', '/admin/procesos/cambios/tipos-requisitos', 'Tipos, autoridad, modelos estándar y clasificación.', '21190', '3', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21197', 'Ventanas de mantenimiento', '/admin/procesos/cambios/notificaciones-calendario?vista=ventanas', 'Edición permitida por el permiso `config.cambios.calendario`.', '21190', '3', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21198', 'Problemas', '', '', '21184', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21199', 'Configuración de formulario', '/admin/procesos/problemas/formulario', 'Formulario configurable de problemas con versionado.', '21198', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21200', 'Flujo de investigación y seguimiento', '/admin/procesos/problemas/flujo', 'Estados, transiciones, asignación, objetivos, escalamiento, reapertura, tareas y problemas mayores.', '21198', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21201', 'Relación con incidentes, errores conocidos y conocimiento', '/admin/procesos/problemas/relaciones', 'Umbrales, vínculos, KEDB, RFC, conocimiento y CI.', '21198', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21202', 'Categorías, responsables y reglas de publicación y revisión', '/admin/conocimiento-config', '', '21184', '2', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21203', 'Organización', '', '', '21184', '2', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21204', 'Departamentos empresariales', '/admin/departamentos-empresa', 'Áreas de negocio (finanzas, legal, ventas, marketing) y su Gestor de Área.', '21203', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21205', 'Departamentos y grupos resolutores de TI', '/admin/departamentos', 'Áreas técnicas y grupos resolutores.', '21203', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21206', 'Supervisores', '/admin/departamentos?vista=supervisores', 'Asignación de supervisores a áreas técnicas.', '21203', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21207', 'Técnicos y niveles de soporte', '/admin/tecnicos', 'Técnicos, niveles N1/N2/N3 y ausencias.', '21203', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21208', 'Identidades', '', '', '21184', '2', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21209', 'Gestión de usuarios', '/admin/usuarios', 'Alta, edición, bloqueo y desbloqueo de usuarios; asignación de perfiles múltiples; envío de credenciales.', '21208', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21210', 'Perfiles y permisos', '/admin/perfiles', 'Matriz de permisos por perfil.', '21208', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21211', 'Menú y notificaciones', '', '', '21184', '2', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21212', 'Configuración de contacto', '/admin/notificaciones?seccion=contacto', 'Remitente, SMTP y datos de contacto de la mesa.', '21211', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21213', 'Estructura del menú', '/admin/menu', 'Orden, visibilidad y bloqueo de ítems por perfil.', '21211', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21214', 'Plantillas de correo y otros canales', '/admin/notificaciones?seccion=plantillas', 'Plantillas y reglas de notificación por evento.', '21211', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21215', 'Plataforma', '', '', NULL, '1', '11', 'true', NULL, NULL, NULL, NULL, 'false', 'true');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21216', 'Cumplimiento', '', '', '21215', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21217', 'Cambios sin autorización o fuera de ventana', '/plataforma/perfiles/auditor/cumplimiento/cambios', '', '21216', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21218', 'Muestreo de auditoría', '/plataforma/perfiles/auditor/muestreo', 'Selecciona muestras aleatorias de tickets, cambios y bajas para revisión.', '21216', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21219', 'Segregación de funciones', '/plataforma/perfiles/auditor/cumplimiento/sod', 'Detecta aprobaciones del mismo usuario, autoaprobaciones y excepciones.', '21216', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21220', 'Auditoría de cambios de configuración', '/admin/auditoria-sistema', 'Registro inmutable de cambios de configuración (antes y después).', '21215', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21221', 'Registros de seguridad y autenticación', '/admin/seguridad-logs', '', '21215', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21222', 'Recertificación de accesos', '/plataforma/perfiles/auditor/accesos/recertificacion', 'Revisión periódica de usuarios y perfiles con confirmación o retiro.', '21215', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21223', 'Retención y mantenimiento de datos', '/admin/mantenimiento-datos', '', '21215', '2', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21224', 'Salud del sistema', '/admin/salud-sistema', 'Estado técnico del sistema para el Administrador.', '21215', '2', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21225', 'Mi cuenta', '', '', NULL, '1', '12', 'true', NULL, NULL, NULL, NULL, 'false', 'true');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21226', 'Mi perfil y seguridad', '/mi-cuenta', 'Ver y editar datos permitidos, cambiar contraseña y ver sesiones.', '21225', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21227', 'Preferencias de notificación', '/mi-cuenta/notificaciones', 'Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.', '21225', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21228', 'Incidentes', '', 'Practica de Gestion de Incidentes: restablecer la operacion normal del servicio.', '21023', '2', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21229', 'Solicitudes', '', 'Practica de Gestion de Solicitudes de Servicio: peticiones estandar del catalogo.', '21023', '2', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21230', 'Todos los incidentes', '/plataforma/incidentes', 'Consola integral de incidentes.', '21228', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21231', 'Mis incidentes', '/plataforma/incidentes/mios', 'Incidentes reportados por mi.', '21228', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21232', 'Incidentes asignados a mi', '/plataforma/incidentes/asignados', 'Incidentes bajo mi responsabilidad tecnica.', '21228', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21233', 'Bandeja de incidentes', '/plataforma/incidentes/bandeja', 'Incidentes pendientes de diagnostico y asignacion.', '21228', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21234', 'Incidentes resueltos', '/plataforma/incidentes/resueltos', 'Historial de incidentes cerrados.', '21228', '3', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21235', 'Incidentes de mi departamento', '/plataforma/incidentes/departamento', 'Incidentes que afectan a mi unidad.', '21228', '3', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21236', 'Registrar incidente', '/plataforma/incidentes/crear', 'Reportar una interrupcion o degradacion del servicio.', '21228', '3', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21237', 'Catalogo de incidentes', '/plataforma/incidentes/catalogo', 'Servicios publicados para reportar fallas.', '21228', '3', '8', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21238', 'Incidentes mayores', '/plataforma/incidentes/mayores', 'Gestion de incidentes mayores y sala de crisis.', '21228', '3', '9', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21239', 'Sala de crisis (incidente mayor)', '/plataforma/perfiles/tecnico/mesa/incidente-mayor', 'Mesa de trabajo del incidente mayor.', '21228', '3', '10', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21240', 'Configuracion del formulario de incidentes', '/plataforma/incidentes/configuracion', 'Campos y reglas del reporte de incidentes.', '21228', '3', '11', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21241', 'Todas las solicitudes', '/plataforma/solicitudes', 'Consola integral de solicitudes.', '21229', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21242', 'Mis solicitudes', '/plataforma/solicitudes/mios', 'Solicitudes registradas por mi.', '21229', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21243', 'Solicitudes asignadas a mi', '/plataforma/solicitudes/asignados', 'Solicitudes bajo mi responsabilidad tecnica.', '21229', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21244', 'Bandeja de solicitudes', '/plataforma/solicitudes/bandeja', 'Solicitudes pendientes de atencion.', '21229', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21245', 'Solicitudes resueltas', '/plataforma/solicitudes/resueltos', 'Historial de solicitudes atendidas.', '21229', '3', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21246', 'Solicitudes de mi departamento', '/plataforma/solicitudes/departamento', 'Solicitudes de los colaboradores de mi unidad.', '21229', '3', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21247', 'Registrar solicitud', '/plataforma/solicitudes/crear', 'Pedir un servicio publicado en el catalogo.', '21229', '3', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21248', 'Catalogo de solicitudes', '/plataforma/solicitudes/catalogo', 'Servicios y entregables disponibles para solicitar.', '21229', '3', '8', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21249', 'Aprobaciones de solicitudes', '/plataforma/solicitudes/aprobaciones', 'Dictamen de las solicitudes que requieren aprobacion.', '21229', '3', '9', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21250', 'Configuracion del formulario de solicitudes', '/plataforma/solicitudes/configuracion', 'Campos y reglas del requerimiento de servicios.', '21229', '3', '10', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21251', 'Centro de asignacion', '/plataforma/tickets/gestion/asignar', 'Asignar tecnicos a incidentes y solicitudes.', '21024', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21252', 'Colaboradores de mi area', '/plataforma/tickets/gestion/colaboradores', 'Autorizaciones de los colaboradores de mi unidad.', '21024', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21253', 'Bandeja consolidada de pendientes', '/plataforma/tickets/gestion/bandeja', 'Pendientes de ambos modulos sin asignar.', '21024', '3', '3', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21254', 'Historial consolidado de resueltos', '/plataforma/tickets/gestion/resueltos', 'Incidentes y solicitudes resueltos.', '21024', '3', '4', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21255', 'Tickets de mi departamento', '/plataforma/tickets/gestion/departamento', 'Vista consolidada de mi unidad.', '21024', '3', '5', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21256', 'Todos los tickets', '/plataforma/tickets/gestion/todos', 'Consola global de la mesa de servicio.', '21024', '3', '6', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21257', 'Registrar ticket para un usuario', '/plataforma/tickets/gestion/crear', 'Alta asistida en nombre de otro usuario.', '21024', '3', '7', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21258', 'Auditoria de tickets', '/plataforma/tickets/gestion/auditoria', 'Inspeccion de solo lectura de la mesa de servicio.', '21024', '3', '8', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21259', 'Avisos de servicio', '/plataforma/avisos/mantenimientos', 'Mantenimientos programados y avisos.', '21024', '3', '9', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21260', 'Busqueda avanzada de tickets', '/plataforma/perfiles/tecnico/mesa/buscar', 'Busqueda avanzada del tecnico.', '21024', '3', '10', 'true', NULL, NULL, NULL, NULL, 'false', 'false');
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, permiso_requerido, modulo_requerido, condicion_nivel, contador_clave, bloqueado, abierto_por_defecto) VALUES ('21261', 'Historial de mis tickets', '/plataforma/tickets/gestion/mios', 'Tickets que registre a lo largo del tiempo.', '21024', '3', '11', 'true', NULL, NULL, NULL, NULL, 'false', 'false');

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
  (21024, 2, 1, true),
  (21024, 3, 1, true),
  (21024, 4, 1, true),
  (21024, 5, 1, true),
  (21024, 6, 1, true),
  (21044, 2, 1, true),
  (21044, 4, 1, true),
  (21045, 4, 1, true),
  (21046, 4, 1, true),
  (21047, 2, 1, true),
  (21047, 4, 1, true),
  (21048, 2, 1, true),
  (21049, 4, 1, true),
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
  (21227, 10, 1, true),
  (21228, 1, 1, true),
  (21228, 2, 1, true),
  (21228, 3, 1, true),
  (21228, 4, 1, true),
  (21228, 5, 1, true),
  (21228, 6, 1, true),
  (21229, 1, 1, true),
  (21229, 2, 1, true),
  (21229, 3, 1, true),
  (21229, 4, 1, true),
  (21229, 5, 1, true),
  (21229, 6, 1, true),
  (21229, 7, 1, true),
  (21230, 1, 1, true),
  (21230, 4, 1, true),
  (21230, 6, 1, true),
  (21231, 3, 1, true),
  (21231, 5, 1, true),
  (21232, 2, 1, true),
  (21233, 2, 1, true),
  (21233, 4, 1, true),
  (21234, 2, 1, true),
  (21234, 4, 1, true),
  (21234, 6, 1, true),
  (21235, 5, 1, true),
  (21236, 2, 1, true),
  (21236, 3, 1, true),
  (21237, 3, 1, true),
  (21238, 4, 1, true),
  (21239, 2, 1, true),
  (21240, 1, 1, true),
  (21241, 1, 1, true),
  (21241, 4, 1, true),
  (21241, 6, 1, true),
  (21242, 3, 1, true),
  (21242, 5, 1, true),
  (21242, 7, 1, true),
  (21243, 2, 1, true),
  (21244, 2, 1, true),
  (21244, 4, 1, true),
  (21245, 2, 1, true),
  (21245, 4, 1, true),
  (21245, 6, 1, true),
  (21246, 5, 1, true),
  (21247, 2, 1, true),
  (21247, 3, 1, true),
  (21248, 3, 1, true),
  (21248, 5, 1, true),
  (21249, 5, 1, true),
  (21250, 1, 1, true),
  (21251, 4, 1, true),
  (21252, 5, 1, true),
  (21253, 4, 1, true),
  (21254, 4, 1, true),
  (21254, 6, 1, true),
  (21255, 5, 1, true),
  (21256, 1, 1, true),
  (21256, 4, 1, true),
  (21256, 6, 1, true),
  (21257, 4, 1, true),
  (21257, 5, 1, true),
  (21258, 1, 1, true),
  (21258, 4, 1, true),
  (21258, 6, 1, true),
  (21259, 3, 1, true),
  (21260, 2, 1, true),
  (21261, 2, 1, true);

-- ============================================================
-- CATÁLOGOS ITIL 4 Y DATOS DE PRUEBA
-- ============================================================

-- Tipos de Ticket (Incidente vs Solicitud)
INSERT INTO tipo_ticket (id_tipo_ticket, codigo, nombre, descripcion, prefijo_codigo) VALUES
(1, 'INCIDENTE', 'Incidente', 'Interrupción no planificada o reducción en la calidad de un servicio de TI', 'INC'),
(2, 'SOLICITUD', 'Solicitud de Servicio', 'Petición formal de un usuario para la provisión de un recurso o servicio estándar', 'REQ');

-- Impacto (Alcance del impacto organizacional)
INSERT INTO impacto_ticket (id_impacto, nivel, nombre, descripcion) VALUES
(1, 1, 'Bajo', 'Afecta a un solo usuario o no interrumpe el flujo de trabajo'),
(2, 2, 'Medio', 'Afecta a un departamento, equipo de trabajo o proceso operativo secundario'),
(3, 3, 'Alto', 'Afecta a toda la organización, clientes externos o servicio crítico de negocio');

-- Urgencia (Velocidad requerida para la solución)
INSERT INTO urgencia_ticket (id_urgencia, nivel, nombre, descripcion) VALUES
(1, 1, 'Baja', 'La actividad puede postergarse sin impacto operativo apreciable'),
(2, 2, 'Media', 'El trabajo se realiza con lentitud o existen soluciones alternativas temporales'),
(3, 3, 'Alta', 'La actividad productiva está totalmente paralizada y no existe alternativa');

-- Prioridades calculadas y tiempos SLA
INSERT INTO prioridad_ticket (id_prioridad, codigo, nombre, nivel, tiempo_resolucion_horas, tiempo_primera_respuesta_hrs, color) VALUES
(1, 'P1', 'Crítica', 1, 4, 1, '#dc2626'),
(2, 'P2', 'Alta',    2, 8, 2, '#ea580c'),
(3, 'P3', 'Media',   3, 24, 4, '#d97706'),
(4, 'P4', 'Baja',    4, 72, 8, '#2563eb');

-- Estados del ciclo de vida ITIL 4
INSERT INTO estado_ticket (id_estado, codigo, nombre, orden, es_terminal, pausa_sla, color) VALUES
(1, 'ABIERTO',     'Abierto',      1, false, false, '#3b82f6'),
(2, 'ASIGNADO',    'Asignado',     2, false, false, '#6366f1'),
(3, 'EN_PROCESO',  'En proceso',   3, false, false, '#f59e0b'),
(4, 'EN_ESPERA',   'En espera',    4, false, true,  '#f97316'),
(5, 'RESUELTO',    'Resuelto',     5, false, false, '#10b981'),
(6, 'CERRADO',     'Cerrado',      6, true,  false, '#047857'),
(7, 'CANCELADO',   'Cancelado',    7, true,  false, '#6b7280');

-- Motivos de Espera (Pending Reasons)
INSERT INTO motivo_espera_ticket (id_motivo_espera, nombre, descripcion) VALUES
(1, 'Pendiente de información del solicitante', 'Se solicitó información adicional o pruebas al usuario'),
(2, 'En espera de repuesto o hardware', 'Se requiere reemplazo físico de componentes en trámite logístico'),
(3, 'En espera de proveedor o soporte externo', 'Derivado a garantía o soporte especializado de fabricante'),
(4, 'En espera de autorización o visto bueno', 'Requiere aprobación de jefatura o área de seguridad');

-- Categorías vinculadas a Tipo
INSERT INTO categoria_ticket (id_categoria,id_tipo_ticket,nombre,descripcion,codigo_corto,sla_default_respuesta,sla_default_resolucion,estado_registro) VALUES
(1,1,'Hardware y Equipos','Fallas en laptops, computadoras de escritorio, monitores o periféricos','HW',2,8,true),
(2,1,'Redes y Conectividad','Cortes de red cableada, señal Wi-Fi inestable o problemas con la VPN','RED',1,4,true),
(3,1,'Software y Aplicaciones','Errores del sistema de tickets, fallas de correo o cuelgues del ERP','SW',2,8,true),
(4,2,'Usuarios y Accesos','Creación de usuarios, permisos de carpetas compartidas o reseteo de claves','ACC',2,8,true),
(5,2,'Equipamiento Nuevo','Solicitud de mouse, teclado adicional, adaptador o estación de trabajo','HW',4,48,true),
(6,2,'Instalación de Software','Instalación de herramientas ofimáticas, licencias o utilitarios autorizados','SW',4,24,true),
(7,1,'Seguridad de la Información','Phishing, malware, acceso sospechoso y otros incidentes de seguridad','SEC',1,2,true),
(8,2,'Redes y Comunicaciones','Solicitudes de conectividad, puntos de red y telefonía','RED',4,24,true),
(9,2,'Datos y Copias de Seguridad','Restauración de archivos y solicitudes de recuperación de datos','BKP',4,24,true),
(10,2,'Cambios RFC (legado)','Categoría histórica; los cambios se gestionan en el módulo de Cambios','RFC',8,24,false)
ON CONFLICT (id_categoria) DO UPDATE SET id_tipo_ticket=EXCLUDED.id_tipo_ticket,nombre=EXCLUDED.nombre,descripcion=EXCLUDED.descripcion,codigo_corto=EXCLUDED.codigo_corto,sla_default_respuesta=EXCLUDED.sla_default_respuesta,sla_default_resolucion=EXCLUDED.sla_default_resolucion,estado_registro=EXCLUDED.estado_registro;

-- Catálogo de Servicios Corporativos (ITIL 4: Service Catalogue Management)
INSERT INTO servicio_catalogo (id_servicio, codigo_servicio, id_tipo_ticket, id_categoria, nombre, descripcion_comercial, entregable, requiere_aprobacion, sla_horas_resolucion, sla_horas_respuesta, costo_referencial, icono, estado_registro) VALUES
(1, 'SRV-SOL-ACC-001', 2, 4, 'Accesos y Privilegios en Sistemas Corporativos', 'Habilitación, modificación de roles o asignación de permisos especiales en plataformas core de negocio (SAP, Oracle ERP, Salesforce o VPN corporativa).', 'Usuario y perfil de permisos habilitado en el sistema solicitado bajo políticas SOX y principio de menor privilegio.', true, 8, 2, 0.00, 'llave', true),
(2, 'SRV-SOL-ACC-002', 2, 4, 'Desactivación Inmediata de Accesos por Cese Laboral (Offboarding TI)', 'Bloqueo urgente e integral de cuentas en Directorio Activo, correo y accesos corporativos ante la desvinculación formal de un colaborador.', 'Cuentas bloqueadas, tokens OAuth revocados, buzón reasignado y certificado formal de revocación emitido para auditoría SOX/ISO 27001.', false, 2, 1, 0.00, 'seguridad', true),
(3, 'SRV-SOL-ACC-003', 2, 4, 'Accesos Temporales para Terceros, Contratistas o Consultores', 'Creación de credenciales con caducidad automática y acceso VPN restringido para proveedores de servicios o consultores externos.', 'Credencial temporal con fecha de expiración fijada en Active Directory y regla de firewall hacia el servidor autorizado.', true, 4, 2, 0.00, 'llave', true),
(4, 'SRV-SOL-ACC-004', 2, 4, 'Creación de Buzones Compartidos y Listas de Distribución', 'Aprovisionamiento de buzones departamentales (ej. facturacion@empresa.com) y grupos de correo con permisos delegados.', 'Buzón compartido activo en Exchange Online con delegación Send-As y sincronización en clientes Outlook.', true, 12, 4, 0.00, 'correo', true),
(5, 'SRV-SOL-HW-001', 2, 5, 'Asignación de Laptop o Estación de Trabajo Nueva', 'Entrega de laptop corporativa o estación de trabajo para puestos nuevos o requerimientos operativos con cargo a centro de costos.', 'Equipo configurado con imagen corporativa (SOE), antivirus, cifrado BitLocker y acta formal de entrega patrimonial en CMDB.', true, 48, 4, 1200.00, 'laptop', true),
(6, 'SRV-SOL-HW-002', 2, 5, 'Renovación Tecnológica por Obsolescencia de Equipo (3-4 años)', 'Sustitución planificada de computadora portátil o de escritorio que ha alcanzado el límite de su ciclo de vida útil.', 'Laptop moderna de línea corporativa con perfil de usuario migrado íntegramente y equipo antiguo retirado en CMDB.', true, 72, 8, 1200.00, 'laptop', true),
(7, 'SRV-SOL-HW-003', 2, 5, 'Préstamo de Equipo de Cómputo de Contingencia (Pool de Resguardo)', 'Asignación temporal y urgente de laptop del pool de contingencia mientras el equipo titular se encuentra en garantía o reparación.', 'Laptop operativa entregada en menos de 4 horas hábiles bajo acta de préstamo temporal con fecha pactada de retorno.', false, 4, 1, 0.00, 'laptop', true),
(8, 'SRV-SOL-HW-004', 2, 5, 'Asignación de Accesorios Periféricos y Ergonomía', 'Dotación de monitores secundarios de 24 pulgadas, docking stations, teclados, mouse o diademas telefónicas para teletrabajo.', 'Periférico instalado y probado en el puesto de trabajo del colaborador registrado en el inventario menor de TI.', false, 24, 4, 150.00, 'monitor', true),
(9, 'SRV-SOL-SW-001', 2, 6, 'Instalación y Licenciamiento de Software Especializado', 'Aprovisionamiento de licencias nominales de herramientas profesionales de pago (Power BI Pro, AutoCAD, Adobe Creative Cloud).', 'Software instalado desatendidamente y activado con licencia oficial de la empresa registrada en el portal del fabricante.', true, 24, 2, 350.00, 'software', true),
(10, 'SRV-SOL-SW-002', 2, 6, 'Aprovisionamiento de Licencias de Colaboración Cloud (M365 / Zoom)', 'Asignación de planes corporativos cloud para reuniones masivas, telefonía IP integrada o buzones de alta capacidad.', 'Suscripción asignada en Azure AD / Tenant empresarial con manual de uso para el usuario.', false, 12, 2, 0.00, 'nube', true),
(11, 'SRV-SOL-BKP-001', 2, 9, 'Restauración de Archivos y Copias de Seguridad (Restore Backup)', 'Recuperación de documentos, carpetas compartidas o bases de datos dañadas desde el sistema corporativo de copias de respaldo.', 'Archivos recuperados íntegramente desde la fecha requerida y validados en el repositorio seguro.', true, 8, 2, 0.00, 'backup', true),
(12, 'SRV-INC-RED-001', 1, 2, 'Incidente de Conectividad de Red y Telefonía IP en Sede', 'Diagnóstico y resolución ante cortes de internet en sedes, lentitud de enlace o fallas de extensiones telefónicas IP.', 'Conectividad de red restablecida a velocidades nominales, puerto de switch reparado o teléfono IP funcional.', false, 4, 1, 0.00, 'red', true),
(13, 'SRV-SOL-RED-001', 2, 8, 'Habilitación de Punto de Red Físico o Ampliación Wi-Fi', 'Tendido de cableado estructurado Cat 6A certificado o instalación de Access Point para cobertura inalámbrica corporativa.', 'Toma de red ponchada y certificada conectada al switch de borde con asignación de VLAN corporativa.', true, 24, 4, 200.00, 'cable', true),
(14, 'SRV-SOL-RED-002', 2, 8, 'Asignación y Configuración de Telefonía Móvil Corporativa', 'Entrega de smartphone corporativo con enrolamiento en plataforma MDM para cargos con constante movilidad de negocio.', 'Teléfono móvil configurado con directivas de seguridad corporativa, chip de datos y firma de custodia.', true, 48, 4, 800.00, 'telefono', true),
(15, 'SRV-SOL-ACC-005', 2, 4, 'Restablecimiento de Credenciales y Doble Factor (MFA)', 'Desbloqueo de cuentas bloqueadas por intentos fallidos o reinicialización de token de autenticación multifactor.', 'Cuenta reactivada y contraseña temporal segura forzando cambio obligatorio en el siguiente inicio de sesión.', false, 1, 1, 0.00, 'seguridad', true),
(16, 'SRV-INC-SEC-001', 1, 7, 'Reporte de Incidente de Seguridad / Correo Malicioso (Phishing)', 'Notificación urgente ante recepción de correos con enlaces maliciosos, suplantación de identidad o sospecha de ransomware.', 'Remoción del correo de todos los buzones, bloqueo de IP/dominio atacante en firewall y análisis forense del equipo.', false, 1, 1, 0.00, 'escudo', true),
(17, 'SRV-SOL-RED-003', 2, 8, 'Solicitud de Excepción de Navegación o Desbloqueo en Firewall Web', 'Petición formal para habilitar el acceso a un dominio web específico retenido por las políticas del proxy perimetral.', 'Excepción configurada en el firewall con análisis previo de reputación y autorización del Oficial de Seguridad.', true, 8, 2, 0.00, 'candado', true),
(18, 'SRV-SOL-HW-005', 2, 5, 'Habilitación Integral de Puesto Digital para Nuevos Ingresos (Onboarding)', 'Preparación integral de todo el entorno tecnológico necesario para que un nuevo colaborador trabaje desde su primer día.', 'Kit tecnológico de bienvenida completo: cuenta de dominio, correo, laptop configurada, anexo e inducción.', false, 48, 2, 0.00, 'onboarding', true),
(19, 'SRV-SOL-RFC-001', 2, 10, 'Solicitud de Cambio Estándar de Infraestructura (Change Enablement)', 'Programación de ventana de mantenimiento para tareas pre-aprobadas y de bajo riesgo en servidores y plataformas de TI.', 'Cambio ejecutado en horario no hábil con plan de rollback disponible y validación de salud de los servicios de negocio.', false, 24, 4, 0.00, 'cambio', false),
(20, 'SRV-SOL-RFC-002', 2, 10, 'Solicitud de Cambio Normal Mayor con Aprobación del Comité CAB', 'Petición de modificación significativa en sistemas productivos que requiere análisis colegiado de riesgos y autorización del CAB.', 'Pase a producción evaluado y autorizado formalmente por el Change Advisory Board (CAB) con monitoreo post-implementación.', true, 72, 8, 0.00, 'cab', false),
(21, 'SRV-INC-SW-001', 1, 3, 'Apertura de Investigación de Problema de Causa Raíz (Problem Management)', 'Diagnóstico técnico profundo ante fallas o caídas recurrentes para erradicar la causa raíz y publicar soluciones temporales.', 'Causa raíz identificada, solución temporal registrada en la base de errores conocidos (KEDB) y tickets hijos resueltos.', false, 96, 8, 0.00, 'problema', false),
(22, 'SRV-SOL-HW-006', 2, 5, 'Gestión de Garantía de Hardware y Reemplazo con Fabricante', 'Escalamiento de falla física hacia el fabricante oficial (Lenovo, Dell, Cisco) bajo contrato de soporte y garantía vigente.', 'Componente dañado reemplazado en sede por el técnico certificado del fabricante y serie actualizada en CMDB.', false, 72, 4, 0.00, 'contrato', true),
(23, 'SRV-SOL-HW-007', 2, 5, 'Baja Patrimonial y Disposición Segura de Activos de TI (Disposal NIST)', 'Desincorporación contable de computadoras o servidores obsoletos y destrucción criptográfica segura de datos confidenciales.', 'Certificado de borrado seguro de datos bajo estándar NIST 800-88, baja en CMDB y entrega a operador RAEE certificado.', true, 48, 8, 0.00, 'reciclaje', true);

SELECT setval('servicio_catalogo_id_servicio_seq', (SELECT MAX(id_servicio) FROM servicio_catalogo));

-- Pasos de Workflow Operativos por Servicio (ITIL 4: Service Request Workflows)
INSERT INTO servicio_workflow_paso (id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro) VALUES
-- SRV-ACC-01
(1, 1, 'SOLICITADO', 'Solicitud con justificación de negocio', 'SOLICITANTE', false, false, true),
(1, 2, 'PENDIENTE_APROBACION', 'Visto bueno de Jefatura de Área', 'JEFE_APROBADOR', true, true, true),
(1, 3, 'VALIDACION_SEGURIDAD', 'Verificación de no conflicto SoD', 'SEGURIDAD_TI', false, false, true),
(1, 4, 'APROVISIONAMIENTO', 'Creación y asignación de rol en el sistema', 'SISTEMAS_N3', false, false, true),
(1, 5, 'VERIFICACION_ENTREGA', 'Confirmación de acceso conforme por usuario', 'SOLICITANTE', false, false, true),
-- SRV-ACC-02
(2, 1, 'NOTIFICACION_RRHH', 'Recepción de expediente formal de cese', 'RECURSOS_HUMANOS', false, false, true),
(2, 2, 'BLOQUEO_INMEDIATO', 'Desactivación de AD y revocación de tokens', 'MESA_N1', false, false, true),
(2, 3, 'CONVERSION_BUZON', 'Conversión de correo y delegación a jefatura', 'SISTEMAS_N3', false, false, true),
(2, 4, 'AUDITORIA_REVOCACION', 'Certificación de revocación en ERP y VPN', 'SEGURIDAD_TI', false, false, true),
-- SRV-ACC-03
(3, 1, 'SOLICITADO', 'Ficha de consultor con fecha de fin de servicio', 'SOLICITANTE', false, false, true),
(3, 2, 'APROBACION_SPONSOR', 'Autorización de Gerencia responsable', 'JEFE_APROBADOR', true, true, true),
(3, 3, 'POLITICA_CADUCIDAD', 'Configuración de fecha de expiración en AD', 'SEGURIDAD_TI', false, false, true),
(3, 4, 'ENTREGA_CREDENCIAL', 'Envío seguro de credencial temporal cifrada', 'MESA_N1', false, false, true),
-- SRV-ACC-04
(4, 1, 'SOLICITADO', 'Petición de buzón y miembros con acceso', 'SOLICITANTE', false, false, true),
(4, 2, 'APROBACION_JEFATURA', 'Visto bueno de jefatura de área', 'JEFE_APROBADOR', true, true, true),
(4, 3, 'CREACION_EXCHANGE', 'Creación de buzón compartido en Exchange', 'SISTEMAS_N3', false, false, true),
(4, 4, 'VERIFICACION', 'Validación de sincronización en Outlook', 'SOLICITANTE', false, false, true),
-- SRV-HW-01
(5, 1, 'SOLICITADO', 'Solicitud de hardware con centro de costos', 'SOLICITANTE', false, false, true),
(5, 2, 'APROBACION_PRESUPUESTO', 'Aprobación presupuestal de Jefatura', 'JEFE_APROBADOR', true, true, true),
(5, 3, 'PREPARACION_STAGING', 'Clonación de SOE, antivirus y BitLocker', 'SOPORTE_N2', false, false, true),
(5, 4, 'REGISTRO_CMDB', 'Asociación de serie y placa patrimonial en CMDB', 'SOPORTE_N2', false, false, true),
(5, 5, 'ENTREGA_CONFORMIDAD', 'Firma de acta y entrega física del equipo', 'SOLICITANTE', false, false, true),
-- SRV-HW-02
(6, 1, 'SOLICITUD_RENOVACION', 'Petición indicando placa de equipo actual', 'SOLICITANTE', false, false, true),
(6, 2, 'VALIDACION_OBSOLESCENCIA', 'Verificación en CMDB de antigüedad > 36 meses', 'GESTOR_ACTIVOS_TI', false, false, true),
(6, 3, 'APROBACION_GERENCIA', 'Aprobación de renovación en presupuesto', 'JEFE_APROBADOR', true, true, true),
(6, 4, 'BACKUP_Y_MIGRACION', 'Migración transparente de perfil y datos', 'SOPORTE_N2', false, false, true),
(6, 5, 'CANJE_Y_ACTA', 'Entrega de nuevo portátil y retiro de antiguo', 'SOLICITANTE', false, false, true),
-- SRV-HW-03
(7, 1, 'SOLICITUD_CONTINGENCIA', 'Reporte de equipo titular averiado', 'SOLICITANTE', false, false, true),
(7, 2, 'ASIGNACION_POOL', 'Reserva de portátil en stock de contingencia', 'MESA_N1', false, false, true),
(7, 3, 'CONFIGURACION_EXPRESS', 'Carga de perfil básico y VPN', 'SOPORTE_N2', false, false, true),
(7, 4, 'FIRMA_PRESTAMO', 'Firma de cargo de préstamo temporal', 'SOLICITANTE', false, false, true),
-- SRV-HW-04
(8, 1, 'SOLICITUD_PERIFERICO', 'Petición de accesorio estándar de catálogo', 'SOLICITANTE', false, false, true),
(8, 2, 'DESPACHO_ALMACEN', 'Extracción de almacén y registro de salida', 'GESTOR_ACTIVOS_TI', false, false, true),
(8, 3, 'INSTALACION_SEDE', 'Conexión y prueba en escritorio del usuario', 'SOPORTE_N2', false, false, true),
-- SRV-SW-01
(9, 1, 'SOLICITADO', 'Petición de software con justificación', 'SOLICITANTE', false, false, true),
(9, 2, 'APROBACION_COSTO', 'Aprobación de costo por Gerencia de Área', 'JEFE_APROBADOR', true, true, true),
(9, 3, 'ASIGNACION_TENANT', 'Reserva de licencia en portal de fabricante', 'GESTOR_ACTIVOS_TI', false, false, true),
(9, 4, 'DESPLIEGUE_REMOTO', 'Instalación desatendida vía Endpoint Manager', 'SISTEMAS_N3', false, false, true),
(9, 5, 'VERIFICACION', 'Comprobación de ejecución por el usuario', 'SOLICITANTE', false, false, true),
-- SRV-SW-02
(10, 1, 'SOLICITUD_PLAN', 'Petición de licencia cloud corporativa', 'SOLICITANTE', false, false, true),
(10, 2, 'APROVISIONAMIENTO_CLOUD', 'Asignación de SKU en consola de administración', 'SISTEMAS_N3', false, false, true),
(10, 3, 'NOTIFICACION_INSTRUCCION', 'Envío de credenciales y guía rápida de uso', 'MESA_N1', false, false, true),
-- SRV-SW-03
(11, 1, 'SOLICITUD_RESTORE', 'Petición de restauración con ruta y fecha', 'SOLICITANTE', false, false, true),
(11, 2, 'APROBACION_SEGURIDAD', 'Autorización del custodio o dueño de datos', 'JEFE_APROBADOR', true, true, true),
(11, 3, 'EJECUCION_JOB_BACKUP', 'Extracción desde el software de backup', 'SISTEMAS_N3', false, false, true),
(11, 4, 'VALIDACION_INTEGRIDAD', 'Comprobación de lectura conforme del archivo', 'SOLICITANTE', false, false, true),
-- SRV-RED-01
(12, 1, 'REPORTADO', 'Reporte de falla indicando sede y puesto', 'SOLICITANTE', false, false, true),
(12, 2, 'TRIAJE_N1', 'Diagnóstico remoto de enlace y switch de acceso', 'MESA_N1', false, false, true),
(12, 3, 'INTERVENCION_SEDE', 'Reemplazo de patch cord o reconfiguración de puerto', 'SOPORTE_N2', false, false, true),
(12, 4, 'CERTIFICACION_ENLACE', 'Prueba de ping y latencia nominal', 'SOPORTE_N2', false, false, true),
(12, 5, 'RESOLUCION_CIERRE', 'Confirmación de navegación normal por usuario', 'SOLICITANTE', false, false, true),
-- SRV-RED-02
(13, 1, 'SOLICITUD_CABLEADO', 'Petición con plano o ubicación del punto', 'SOLICITANTE', false, false, true),
(13, 2, 'APROBACION_INFRAESTRUCTURA', 'Evaluación de capacidad y puertos en rack', 'JEFE_APROBADOR', true, true, true),
(13, 3, 'TENDIDO_Y_CERTIFICACION', 'Tiraje de cable Cat 6A y certificación Fluke', 'SOPORTE_N2', false, false, true),
(13, 4, 'HABILITACION_SWITCH', 'Asignación de VLAN en switch administrable', 'SISTEMAS_N3', false, false, true),
(13, 5, 'ENTREGA_CONFORME', 'Prueba de velocidad a 1 Gbps y cierre', 'SOLICITANTE', false, false, true),
-- SRV-RED-03
(14, 1, 'SOLICITUD_MOVIL', 'Justificación por rol comercial o gerencial', 'SOLICITANTE', false, false, true),
(14, 2, 'APROBACION_GERENCIA', 'Aprobación del canon mensual de telefonía', 'JEFE_APROBADOR', true, true, true),
(14, 3, 'ENROLAMIENTO_MDM', 'Cifrado y contenedor seguro de datos en MDM', 'SISTEMAS_N3', false, false, true),
(14, 4, 'ENTREGA_TERMINAL', 'Firma de acta de custodia y entrega de equipo', 'SOPORTE_N2', false, false, true),
-- SRV-SEC-01
(15, 1, 'SOLICITADO', 'Petición con canal secundario de identidad', 'SOLICITANTE', false, false, true),
(15, 2, 'DESAFIO_IDENTIDAD', 'Validación de identidad anti-suplantación', 'MESA_N1', false, false, true),
(15, 3, 'EJECUCION_RESET', 'Desbloqueo en AD con cambio forzado al login', 'MESA_N1', false, false, true),
(15, 4, 'CONFIRMACION_CIERRE', 'Inicio de sesión exitoso por el usuario', 'SOLICITANTE', false, false, true),
-- SRV-SEC-02
(16, 1, 'REPORTE_AMENAZA', 'Reenvío de correo sospechoso o alerta EDR', 'SOLICITANTE', false, false, true),
(16, 2, 'TRIAJE_INMEDIATO', 'Análisis de cabeceras y sandbox de seguridad', 'SEGURIDAD_TI', false, false, true),
(16, 3, 'CONTENCION_Y_PURGA', 'Aislamiento de endpoint y purga en buzones', 'SEGURIDAD_TI', false, false, true),
(16, 4, 'BLOQUEO_INDICADORES', 'Bloqueo de IP y dominio atacante en firewall', 'SISTEMAS_N3', false, false, true),
(16, 5, 'INFORME_CIERRE', 'Emisión de reporte de incidente de seguridad', 'SEGURIDAD_TI', false, false, true),
-- SRV-SEC-03
(17, 1, 'SOLICITUD_DESBLOQUEO', 'URL requerida y justificación operativa', 'SOLICITANTE', false, false, true),
(17, 2, 'ANALISIS_REPUTACION', 'Inspección de reputación del sitio web', 'SEGURIDAD_TI', false, false, true),
(17, 3, 'APROBACION_CISO', 'Evaluación de riesgo por Oficial de Seguridad', 'JEFE_APROBADOR', true, true, true),
(17, 4, 'REGLA_FIREWALL', 'Aplicación de regla en proxy perimetral', 'SISTEMAS_N3', false, false, true),
(17, 5, 'VERIFICACION_ACCESO', 'Comprobación de acceso conforme al sitio', 'SOLICITANTE', false, false, true),
-- SRV-ONB-01
(18, 1, 'SOLICITUD_RRHH', 'Ficha de alta con fecha de ingreso', 'RECURSOS_HUMANOS', false, false, true),
(18, 2, 'TAREA_IDENTIDAD', 'Creación de cuenta de dominio y correo', 'SISTEMAS_N3', false, false, true),
(18, 3, 'TAREA_HARDWARE', 'Configuración física de laptop y accesorios', 'SOPORTE_N2', false, false, true),
(18, 4, 'TAREA_COMUNICACIONES', 'Habilitación de anexo IP y acceso a VPN', 'SOPORTE_N2', false, false, true),
(18, 5, 'CONTROL_CALIDAD', 'Consolidación por Supervisor de Service Desk', 'SUPERVISOR_TI', false, false, true),
(18, 6, 'ENTREGA_DIA1', 'Entrega física de equipo e inducción', 'SOPORTE_N2', false, false, true),
-- SRV-CHG-01
(19, 1, 'REGISTRO_RFC_ESTANDAR', 'Registro de cambio estándar pre-aprobado', 'SISTEMAS_N3', false, false, true),
(19, 2, 'NOTIFICACION_USUARIOS', 'Aviso de ventana de mantenimiento planificada', 'MESA_N1', false, false, true),
(19, 3, 'EJECUCION_VENTANA', 'Aplicación de cambio en horario nocturno', 'SISTEMAS_N3', false, false, true),
(19, 4, 'PRUEBAS_POST_CAMBIO', 'Verificación de operatividad de servicios', 'SISTEMAS_N3', false, false, true),
(19, 5, 'CIERRE_RFC', 'Registro de resultados en bitácora de cambios', 'SUPERVISOR_TI', false, false, true),
-- SRV-CHG-02
(20, 1, 'SOLICITUD_RFC_MAYOR', 'Documento de cambio con plan de rollback', 'SISTEMAS_N3', false, false, true),
(20, 2, 'SESION_EVALUACION_CAB', 'Revisión colegiada del Comité Asesor (CAB)', 'JEFE_APROBADOR', true, true, true),
(20, 3, 'AUTORIZACION_CAMBIO', 'Firma formal de autorización de pase a producción', 'SUPERVISOR_TI', false, false, true),
(20, 4, 'DESPLIEGUE_PRODUCCION', 'Ejecución coordinada del pase a producción', 'SISTEMAS_N3', false, false, true),
(20, 5, 'REVISION_PIR', 'Revisión post-implementación de incidentes', 'AUDITOR', false, false, true),
-- SRV-PRB-01
(21, 1, 'APERTURA_PROBLEMA', 'Identificación de incidentes repetitivos', 'SUPERVISOR_TI', false, false, true),
(21, 2, 'ANALISIS_CAUSA_RAIZ', 'Investigación con técnica 5 Porqués / Ishikawa', 'SISTEMAS_N3', false, false, true),
(21, 3, 'PUBLICACION_WORKAROUND', 'Documentación de solución temporal en KEDB', 'SISTEMAS_N3', false, false, true),
(21, 4, 'PROPUESTA_CAMBIO', 'Generación de RFC para solución definitiva', 'SISTEMAS_N3', false, false, true),
(21, 5, 'CIERRE_MASIVO', 'Cierre masivo de incidentes vinculados', 'SUPERVISOR_TI', false, false, true),
-- SRV-CNT-01
(22, 1, 'DIAGNOSTICO_FALLA', 'Comprobación de daño físico de hardware', 'SOPORTE_N2', false, false, true),
(22, 2, 'APERTURA_CASO_PROVEEDOR', 'Registro de caso en portal del fabricante', 'SOPORTE_N2', false, false, true),
(22, 3, 'ESPERA_REPUESTO', 'Ticket en espera de proveedor externo', 'SOPORTE_N2', false, true, true),
(22, 4, 'INTERVENCION_TECNICO', 'Reemplazo físico de componente en sede', 'SOPORTE_N2', false, false, true),
(22, 5, 'PRUEBA_Y_CIERRE', 'Diagnóstico satisfactorio y actualización CMDB', 'SOPORTE_N2', false, false, true),
-- SRV-AST-01
(23, 1, 'SOLICITUD_BAJA', 'Ficha técnica de equipo dañado u obsoleto', 'GESTOR_ACTIVOS_TI', false, false, true),
(23, 2, 'APROBACION_CONTABLE', 'Autorización de desincorporación patrimonial', 'JEFE_APROBADOR', true, true, true),
(23, 3, 'BORRADO_SEGURO_NIST', 'Destrucción criptográfica de datos NIST 800-88', 'SEGURIDAD_TI', false, false, true),
(23, 4, 'CERTIFICADO_Y_CMDB', 'Emisión de certificado y baja de activo en CMDB', 'GESTOR_ACTIVOS_TI', false, false, true),
(23, 5, 'DISPOSICION_RAEE', 'Entrega a operador de reciclaje ambiental', 'SOPORTE_N2', false, false, true);

-- Departamentos y Especialidades de TI (ITIL 4: Tiered Support Organizations)
INSERT INTO departamento_ti (id_departamento, codigo, nombre, descripcion, id_supervisor, tiempo_ola_horas, tiempo_ola_critico_hrs, estado_registro) VALUES
(1, 'DEP-N1-MESA', 'Mesa de Ayuda y Triaje (Nivel 1)', 'Punto único de contacto (SPOC) para recepción, diagnóstico inicial, reseteo de claves y soporte en primer contacto.', 1, 4, 1, true),
(2, 'DEP-N2-CAMPO', 'Soporte en Sitio y Hardware (Nivel 2)', 'Atención técnica presencial en sedes, configuración y entrega de laptops, periféricos y mantenimiento físico.', 1, 24, 4, true),
(3, 'DEP-REDES', 'Redes, Conectividad y Telefonía IP', 'Gestión de infraestructura de telecomunicaciones, switches, Access Points, cableado estructurado y telefonía corporativa.', 1, 12, 2, true),
(4, 'DEP-N3-SIST', 'Sistemas, Infraestructura y Cloud (Nivel 3)', 'Administración de servidores Windows/Linux, Active Directory, bases de datos SQL, ERP/CRM corporativos y nube.', 1, 12, 4, true),
(5, 'DEP-SEC', 'Ciberseguridad y Gestión de Identidades', 'Oficialía de seguridad de la información, análisis SoD, respuesta a incidentes de malware, phishing y reglas de firewall.', 1, 4, 1, true);

SELECT setval('departamento_ti_id_departamento_seq', (SELECT MAX(id_departamento) FROM departamento_ti));

-- Acuerdos de Nivel Operativo entre Equipos Internos (ITIL 4: OLA)
INSERT INTO acuerdo_nivel_operativo (id_departamento, codigo_acuerdo, nombre_acuerdo, tipo_compromiso, tiempo_maximo_horas, tiempo_alerta_horas, descripcion) VALUES
(1, 'OLA-MESA-01', 'Triaje y Asignación Inicial N1', 'TRIAJE_INICIAL', 1, 1, 'Tiempo máximo para clasificar, verificar pertinencia y asignar o resolver casos de primer contacto'),
(1, 'OLA-MESA-02', 'Resolución de Autoservicio y Accesos N1', 'ATENCION_ESTANDAR', 4, 3, 'Reseteo asistido de claves, orientación en autoayuda y consultas estándar'),
(2, 'OLA-CAMPO-01', 'Atención de Falla Presencial Crítica N2', 'ATENCION_CRITICA', 4, 3, 'Diagnóstico presencial urgente y entrega de equipo de contingencia temporal'),
(2, 'OLA-CAMPO-02', 'Staging y Entrega de Hardware Nuevo N2', 'ATENCION_ESTANDAR', 24, 18, 'Clonación de imagen SOE, cifrado BitLocker y firma de acta patrimonial'),
(3, 'OLA-RED-01', 'Restablecimiento de Conectividad Crítica', 'ATENCION_CRITICA', 2, 1, 'Diagnóstico y recuperación de corte de enlace o access point de sede'),
(3, 'OLA-RED-02', 'Habilitación de Puntos y Telefonía IP', 'ATENCION_ESTANDAR', 12, 9, 'Tendido de cableado, parcheo en rack y aprovisionamiento de extensión telefónica'),
(4, 'OLA-SIST-01', 'Recuperación de Servicios e Infraestructura N3', 'ATENCION_CRITICA', 4, 3, 'Atención a caídas de bases de datos, máquinas virtuales o servicios de dominio'),
(4, 'OLA-SIST-02', 'Aprovisionamiento de Usuarios y Licencias N3', 'ATENCION_ESTANDAR', 12, 9, 'Creación de usuarios en Active Directory, ERP corporativo y buzones departamentales'),
(5, 'OLA-SEC-01', 'Contención Inmediata de Incidentes de Seguridad', 'ATENCION_CRITICA', 1, 1, 'Aislamiento de terminales infectados, bloqueo perimetral de IP y análisis forense'),
(5, 'OLA-SEC-02', 'Evaluación de Privilegios y Excepciones Web', 'ATENCION_ESTANDAR', 4, 3, 'Análisis de segregación de funciones (SoD) y revisión de solicitudes de navegación')
ON CONFLICT (codigo_acuerdo) DO NOTHING;

-- Detalle Operativo de Técnicos (Niveles N1/N2/N3 y Límites de Capacidad WIP)
INSERT INTO tecnico_detalle (id_usuario, id_departamento, nivel_soporte, capacidad_maxima_tickets, estado_operativo, especialidad_principal, estado_registro) VALUES
(1, 1, 2, 8, 'DISPONIBLE', 'Soporte General e Identidades corporativas', true)
ON CONFLICT (id_usuario) DO NOTHING;

-- ============================================================
-- BLOQUE 9: DATOS DE PRUEBA ITIL v4 / ISO 20000 / ISO 27001
-- ============================================================

INSERT INTO activo (id_activo, codigo_patrimonial, numero_serie, tipo_activo, marca, modelo, id_departamento, id_usuario_custodio, estado_activo, fecha_adquisicion, fecha_fin_garantia, costo_compra, usuario_creacion)
VALUES 
(1, 'ACT-SRV-001', 'SRV-DL380-9921', 'SERVIDOR', 'HPE', 'ProLiant DL380 Gen10', 4, 1, 'EN_OPERACION', '2024-01-15', '2027-01-15', 8500.00, 1),
(2, 'ACT-SRV-002', 'SRV-R740-4412', 'SERVIDOR', 'Dell', 'PowerEdge R740', 4, 1, 'EN_OPERACION', '2024-03-10', '2027-03-10', 7900.00, 1),
(3, 'ACT-SW-001', 'SW-CISCO-3850', 'SWITCH', 'Cisco', 'Catalyst 3850 48P', 3, 1, 'EN_OPERACION', '2023-06-20', '2026-06-20', 3200.00, 1),
(4, 'ACT-LAP-101', 'LAP-LENOVO-X1', 'LAPTOP', 'Lenovo', 'ThinkPad X1 Carbon Gen 11', 2, 1, 'EN_OPERACION', '2024-05-02', '2027-05-02', 1850.00, 1),
(5, 'ACT-LAP-102', 'LAP-DELL-5430', 'LAPTOP', 'Dell', 'Latitude 5430', 2, 1, 'EN_STOCK', '2024-08-11', '2027-08-11', 1400.00, 1)
ON CONFLICT (codigo_patrimonial) DO NOTHING;

INSERT INTO elemento_configuracion (id_ci, id_activo, codigo_ci, nombre, tipo_ci, ambiente, ip_principal, version_software, criticidad, id_departamento_soporte, usuario_creacion)
VALUES
(1, 1, 'CI-SRV-APP-01', 'Servidor de Aplicaciones Core Node.js', 'SERVIDOR_LOGICO', 'PRODUCCION', '10.0.1.15', 'Ubuntu 22.04 LTS / Node 20', 'CRITICA', 4, 1),
(2, 2, 'CI-SRV-DB-01', 'Cluster Base de Datos PostgreSQL Produccion', 'BASE_DATOS', 'PRODUCCION', '10.0.1.20', 'PostgreSQL 16.2', 'CRITICA', 4, 1),
(3, 3, 'CI-NET-SW-CORE', 'Switch de Core y Distribucion Principal Piso 2', 'NODO_RED', 'PRODUCCION', '10.0.0.1', 'Cisco IOS-XE 16.9', 'ALTA', 3, 1),
(4, NULL, 'CI-APP-PORTAL', 'Portal Corporativo del Sistema de Tickets', 'APLICACION', 'PRODUCCION', '10.0.1.50', 'v2.4.0-itil', 'CRITICA', 4, 1)
ON CONFLICT (codigo_ci) DO NOTHING;

INSERT INTO ci_relacion (id_ci_padre, id_ci_hijo, tipo_relacion)
VALUES
(4, 1, 'DEPENDE_DE'),
(1, 2, 'DEPENDE_DE'),
(1, 3, 'CONECTADO_CON')
ON CONFLICT (id_ci_padre, id_ci_hijo) DO NOTHING;

INSERT INTO licencia_software (id_licencia, nombre_software, fabricante, clave_licencia, tipo_licencia, cantidad_adquirida, cantidad_en_uso, fecha_vencimiento, costo_anual, usuario_creacion)
VALUES
(1, 'Microsoft 365 E5 Corporativo', 'Microsoft Corporation', 'M365-E5-8841-CORP', 'SUSCRIPCION_ANUAL', 250, 185, '2026-12-31', 45000.00, 1),
(2, 'Oracle Database Enterprise Edition', 'Oracle Corporation', 'ORA-EE-9912-LIC', 'PERPETUA', 4, 4, '2028-06-30', 28000.00, 1),
(3, 'CrowdStrike Falcon Endpoint Security', 'CrowdStrike Inc.', 'CS-FLC-7712-ENT', 'SUSCRIPCION_ANUAL', 300, 240, '2026-11-15', 18500.00, 1),
(4, 'AutoCAD 2026 Enterprise', 'Autodesk', 'ACAD-2026-3312', 'SUSCRIPCION_ANUAL', 20, 19, '2026-10-31', 9200.00, 1)
ON CONFLICT (id_licencia) DO NOTHING;

INSERT INTO problema (id_problema, codigo_problema, titulo, descripcion, id_impacto, id_urgencia, id_prioridad, id_estado, causa_raiz, metodo_analisis, workaround, es_error_conocido, id_ci_afectado, id_usuario_asignado, id_departamento, usuario_creacion)
VALUES 
(1, 'PRB-2026-0001', 'Microcortes aleatorios y desconexion en VPN corporativa SSL', 'Multiples colaboradores de diversas sedes reportan desconexiones de la VPN cada 45 minutos durante llamadas y transferencias.', 3, 3, 1, 3, 'Saturacion de conexiones simultaneas por asignacion insuficiente de pool de memoria en el Gateway perimetral.', '5_WHYS', 'Reiniciar el servicio openvpn-daemon en el nodo secundario y derivar usuarios al Gateway B.', true, 3, 1, 3, 1),
(2, 'PRB-2026-0002', 'Lentitud y cuelgues recurrentes en reportes financieros del ERP', 'El módulo de consolidación contable se congela al emitir balances mensuales afectando a Gerencia de Finanzas.', 2, 2, 2, 4, 'Consultas de indices secuenciales sin cache en tablas de auditoria con mas de 5 millones de registros.', 'ISHIKAWA', 'Ejecutar VACUUM ANALYZE manual y restringir el rango de fechas de consulta a 6 meses.', true, 2, 1, 4, 1)
ON CONFLICT (codigo_problema) DO NOTHING;

INSERT INTO error_conocido (id_error_conocido, id_problema, codigo_kedb, titulo, sintomas, workaround, solucion_definitiva)
VALUES
(1, 1, 'KEDB-001', 'Fallo por Keepalive Timeout en VPN SSL Corporativa', 'El cliente VPN muestra "Connection Reset by Peer" y se desconecta de las carpetas de red.', 'Conectarse temporalmente mediante la URL de contingencia vpn-backup.empresa.com.', 'Actualizar el firmware del Firewall perimetral a la version 7.4.2 con ampliacion de buffer.'),
(2, 2, 'KEDB-002', 'Saturacion de memoria compartida en reportes ERP', 'El navegador responde con error HTTP 504 Gateway Timeout al generar reportes de mas de 1000 paginas.', 'Descargar el reporte en formato CSV plano en lugar de PDF previsualizado.', 'Crear indices cubrientes en PostgreSQL sobre fecha_movimiento y id_cuenta_contable.')
ON CONFLICT (codigo_kedb) DO NOTHING;

INSERT INTO cambio (id_cambio, codigo_cambio, titulo, descripcion, tipo_cambio, id_impacto, id_urgencia, id_prioridad, id_estado, justificacion, plan_implementacion, plan_rollback, plan_pruebas, ventana_inicio, ventana_fin, id_ci_afectado, id_problema_origen, id_usuario_solicitante, id_usuario_responsable, usuario_creacion)
VALUES
(1, 'RFC-2026-0001', 'Actualizacion de firmware en Firewall perimetral Fortinet v7.4.2', 'Aplicacion de parche de seguridad critico para solucionar vulnerabilidad CVE-2026 y corregir microcortes de VPN.', 'NORMAL', 2, 2, 2, 3, 'Mitigar vulnerabilidades y solucionar el Problema PRB-2026-0001.', '1. Generar backup completo de configuracion. 2. Instalar imagen firmware v7.4.2. 3. Reiniciar nodo pasivo primero y verificar failover.', 'Restaurar imagen anterior v7.2.8 desde el slot de recuperacion secundaria en caso de falla de trafico.', 'Validar tuneles IPsec activos y pruebas de conexion remota con 5 usuarios de prueba.', '2026-10-04 23:00:00-05', '2026-10-05 03:00:00-05', 3, 1, 1, 1, 1),
(2, 'RFC-2026-0002', 'Optimizacion de indices e incremento de memoria en PostgreSQL', 'Creacion de indices concurrentes sobre tablas financieras y ajuste de shared_buffers a 16GB.', 'NORMAL', 2, 1, 3, 2, 'Solucion definitiva para el Problema PRB-2026-0002 de lentitud en reportes.', '1. Tomar snapshot de volumen EBS. 2. Ejecutar script CREATE INDEX CONCURRENTLY. 3. Reiniciar servicio postgresql en ventana.', 'DROP INDEX CONCURRENTLY y restaurar postgresql.conf a configuracion previa.', 'Ejecucion de consulta de prueba y verificacion de tiempo de respuesta < 2 segundos.', '2026-10-11 22:00:00-05', '2026-10-12 01:00:00-05', 2, 2, 1, 1, 1)
ON CONFLICT (codigo_cambio) DO NOTHING;

INSERT INTO cambio_aprobacion (id_cambio_aprobacion, id_cambio, id_usuario_aprobador, decision, comentario)
VALUES
(1, 1, 1, 'APROBADO', 'Aprobado formalmente por comite CAB tras revision del plan de contingencia.')
ON CONFLICT (id_cambio_aprobacion) DO NOTHING;

INSERT INTO articulo_conocimiento (id_articulo, codigo_articulo, titulo, contenido_markdown, id_categoria, estado_editorial, id_autor, id_revisor, visitas, utilidad_positiva)
VALUES 
(1, 'ART-2026-001', 'Guia de Conexion y Solucion de Problemas con la VPN Corporativa', '1. Abre la aplicacion VPN en tu estacion de trabajo. 2. Ingresa credenciales institucionales y confirma 2FA. En caso de microcortes, conectarse a vpn-backup.empresa.com.', 2, 'PUBLICADO', 1, 1, 342, 48),
(2, 'ART-2026-002', 'Procedimiento para Solicitud y Reemplazo de Baterias o Cargadores', 'Registra el requerimiento en el Catalogo de Servicios bajo SRV-HW-02 especificando el codigo patrimonial y acude al Area de Soporte en Sitio Piso 2.', 1, 'PUBLICADO', 1, 1, 198, 27),
(3, 'ART-2026-003', 'Configuracion de Impresoras Multifuncionales de Red por Departamento', 'Rutas de impresion de red: Piso 2 Finanzas, Piso 3 Operaciones, Piso 4 TI. Presiona Win + R, escribe la ruta del servidor de impresion y presiona Enter.', 1, 'PUBLICADO', 1, 1, 510, 89)
ON CONFLICT (codigo_articulo) DO NOTHING;

SELECT setval(pg_get_serial_sequence('activo', 'id_activo'), coalesce((SELECT max(id_activo) FROM activo), 1));
SELECT setval(pg_get_serial_sequence('elemento_configuracion', 'id_ci'), coalesce((SELECT max(id_ci) FROM elemento_configuracion), 1));
SELECT setval(pg_get_serial_sequence('licencia_software', 'id_licencia'), coalesce((SELECT max(id_licencia) FROM licencia_software), 1));
SELECT setval(pg_get_serial_sequence('problema', 'id_problema'), coalesce((SELECT max(id_problema) FROM problema), 1));
SELECT setval(pg_get_serial_sequence('error_conocido', 'id_error_conocido'), coalesce((SELECT max(id_error_conocido) FROM error_conocido), 1));
SELECT setval(pg_get_serial_sequence('cambio', 'id_cambio'), coalesce((SELECT max(id_cambio) FROM cambio), 1));
SELECT setval(pg_get_serial_sequence('cambio_aprobacion', 'id_cambio_aprobacion'), coalesce((SELECT max(id_cambio_aprobacion) FROM cambio_aprobacion), 1));
SELECT setval(pg_get_serial_sequence('articulo_conocimiento', 'id_articulo'), coalesce((SELECT max(id_articulo) FROM articulo_conocimiento), 1));




