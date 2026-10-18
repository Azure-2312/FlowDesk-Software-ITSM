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

-- ---------- Menú de opciones: 3 niveles (ITIL v4 / ISO 20000 / ISO 27001) ----------
-- Módulo 1: Mesa de Servicio (100)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro) VALUES
(100, 'Mesa de Servicio', '/tickets', 'Gestión integral de incidentes y requerimientos ITIL v4', NULL, 1, 1, true),

-- Nivel 2 bajo Mesa de Servicio
(110, 'Portal de Autoservicio', '/tickets/catalogo', 'Portal corporativo para usuarios y requerimientos', 100, 2, 1, true),
(120, 'Operación y Soporte', '/tickets/gestion/bandeja', 'Bandejas operativas y resolución de incidentes', 100, 2, 2, true),
(130, 'Supervisión y Despacho', '/tickets/gestion/asignar', 'Gobierno operativo y balanceo de carga', 100, 2, 3, true),
(140, 'Gobernanza de Área', '/tickets/gestion/aprobaciones', 'Autorización de solicitudes y supervisión departamental', 100, 2, 4, true),

-- Nivel 3 bajo Portal de Autoservicio (110)
(111, 'Catálogo de servicios', '/tickets/catalogo', 'Portal de solicitud de prestaciones TI estandarizadas', 110, 3, 1, true),
(112, 'Registrar solicitud', '/tickets/gestion/crear', 'Registrar un nuevo ticket o incidente', 110, 3, 2, true),
(113, 'Mis solicitudes', '/tickets/gestion/mios', 'Seguimiento de mis requerimientos registrados', 110, 3, 3, true),
(114, 'Guías de autoayuda', '/tickets/gestion/ayuda', 'Procedimientos y soluciones de autoservicio', 110, 3, 4, true),

-- Nivel 3 bajo Operación y Soporte (120)
(121, 'Mis tickets asignados', '/tickets/gestion/asignados', 'Cola de trabajo personal del especialista técnico', 120, 3, 1, true),
(122, 'Bandeja de pendientes', '/tickets/gestion/bandeja', 'Tickets sin asignar disponibles para atención (Pull)', 120, 3, 2, true),
(123, 'Tickets de mi área técnica', '/tickets/gestion/departamento', 'Requerimientos asociados al departamento de TI', 120, 3, 3, true),
(124, 'Historial de resueltos', '/tickets/gestion/resueltos', 'Registro de tickets con solución aplicada', 120, 3, 4, true),

-- Nivel 3 bajo Supervisión y Despacho (130)
(131, 'Centro de asignación', '/tickets/gestion/asignar', 'Despacho y asignación equilibrada a técnicos', 130, 3, 1, true),
(132, 'Monitoreo de técnicos', '/tickets/gestion/tecnicos', 'Supervisión de disponibilidad y capacidad WIP', 130, 3, 2, true),
(133, 'Todos los tickets', '/tickets/gestion/todos', 'Visibilidad omnicanal de todos los tickets del sistema', 130, 3, 3, true),
(134, 'Auditoría forense', '/tickets/gestion/auditoria', 'Trazabilidad de ciclo de vida y cumplimiento de SLA', 130, 3, 4, true),

-- Nivel 3 bajo Gobernanza de Área (140)
(141, 'Mis aprobaciones', '/tickets/gestion/aprobaciones', 'Autorización de solicitudes con impacto de recursos', 140, 3, 1, true),
(142, 'Tickets de mi departamento', '/tickets/gestion/departamento', 'Monitoreo de tickets abiertos por el personal del área', 140, 3, 2, true),

-- Módulo 2: Gestión de Cambios (200)
(200, 'Gestión de Cambios', '/cambios', 'Habilitación del cambio y gestión de riesgos ITIL v4', NULL, 1, 5, true),

-- Nivel 2 bajo Gestión de Cambios
(210, 'Operación y Solicitudes RFC', '/cambios/gestion', 'Peticiones de cambio formalizadas y calendario', 200, 2, 1, true),
(220, 'Comité Asesor CAB', '/cambios/gestion/cab', 'Change Advisory Board y evaluación colegiada de riesgos', 200, 2, 2, true),

-- Nivel 3 bajo Operación y Solicitudes RFC (210)
(211, 'Registrar solicitud RFC', '/cambios/gestion/crear', 'Formulario con plan de trabajo, pruebas y rollback', 210, 3, 1, true),
(212, 'Calendario de ventanas', '/cambios/gestion/calendario', 'Ventanas de mantenimiento y periodos de congelamiento (freeze)', 210, 3, 2, true),
(213, 'Historial consolidado', '/cambios/gestion/todos', 'Auditoría integral de cambios y revisiones PIR', 210, 3, 3, true),

-- Nivel 3 bajo Comité Asesor CAB (220)
(221, 'Dictamen colegiado CAB', '/cambios/gestion/cab', 'Sesiones de votación y aprobación técnica de cambios', 220, 3, 1, true),

-- Módulo 3: Activos de TI y CMDB (300)
(300, 'Activos y CMDB', '/activos', 'Gestión de activos tecnológicos y mapa de configuración', NULL, 1, 8, true),

-- Nivel 2 bajo Activos y CMDB
(310, 'Inventario de activos (HAM)', '/activos/inventario', 'Control patrimonial de hardware, estaciones y servidores', 300, 2, 1, true),
(320, 'Mapa de topología CMDB', '/activos/cmdb', 'Elementos de configuración CI y dependencias de servicio', 300, 2, 2, true),
(330, 'Licencias de software (SAM)', '/activos/licencias', 'Gestión de licencias, suscripciones y garantías', 300, 2, 3, true),

-- Módulo 4: Reportes y Analítica (400)
(400, 'Reportes y Analítica', '/tickets/reportes', 'Indicadores clave de desempeño y métricas SLA', NULL, 1, 2, true),
(600, 'Operación y gobierno de servicios', '/operacion', 'Eventos, resiliencia y terceros de servicios TI', NULL, 1, 7, true),
(700, 'Gestión de problemas', '/problemas', 'Análisis de causa raíz y errores conocidos', NULL, 1, 4, true),
(800, 'Proveedores y contratos TI', '/proveedores', 'Relaciones, contratos y desempeño de proveedores de TI', NULL, 1, 6, true),

-- Nivel 2 bajo Reportes y Analítica
(410, 'Indicadores y SLAs', '/tickets/reportes', 'Métricas de tiempo medio (MTTA/MTTR), cumplimiento SLA y CSAT', 400, 2, 1, true),
(572, 'Diseñador de dashboards', '/admin/reportes-disenador', 'Diseño de tableros e indicadores', 400, 2, 2, true),

-- Módulo 5: Administración del Sistema (500)
(500, 'Configuración', '/admin', 'Configuración funcional y técnica del sistema', NULL, 1, 1, true),

-- Nivel 2 bajo Administración
(510, 'Identidades y Accesos (IAM)', '/admin/usuarios', 'Administración de usuarios corporativos y roles RBAC', 500, 2, 1, true),
(520, 'Gobierno del Portafolio', '/admin/servicios', 'Parámetros de catálogo, SLAs y plantillas de captura', 500, 2, 2, true),
(540, 'Seguridad ISO 27001', '/admin/seguridad-logs', 'Trazabilidad de seguridad de la información ISO 27001', 500, 2, 4, true),

-- Nivel 3 bajo Identidades y Accesos (510)
(511, 'Gestión de usuarios', '/admin/usuarios', 'Altas, bajas y mantenimiento de usuarios del sistema', 510, 3, 1, true),
(512, 'Perfiles y permisos', '/admin/perfiles', 'Matriz de control de acceso basada en roles (RBAC)', 510, 3, 2, true),
(513, 'Estructura del menú', '/admin/menu', 'Configuración de jerarquías y visibilidad de opciones', 510, 3, 3, true),

-- Nivel 3 bajo Gobierno del Portafolio (520)
(521, 'Catálogo de servicios y SLAs', '/admin/servicios', 'Definición de servicios corporativos y acuerdos SLA', 520, 3, 1, true),
(522, 'Configurador de esquemas RFC', '/admin/rfc', 'Plantillas RFC, campos obligatorios y perfiles solicitantes permitidos', 520, 3, 2, true),


(135, 'Incidentes', '/incidentes', 'Módulo independiente de registro y gestión de incidentes', NULL, 1, 2, true),
(136, 'Solicitudes de Servicio', '/solicitudes', 'Módulo independiente de atención de solicitudes de servicio', NULL, 1, 3, true),
(143, 'Colaboradores de mi área', '/tickets/gestion/colaboradores', 'Colaboradores de la unidad empresarial del Gestor de Área', 140, 3, 3, true),
(340, 'Modelado de clases CI', '/activos/cmdb/tipos', 'Configuración del modelo de elementos de configuración', 300, 2, 4, true),
(550, 'Diseño de formularios y vistas', '/admin/tickets-vistas', 'Configuración de formularios y vistas de trabajo', 500, 2, 5, true),
(560, 'Comunicaciones y notificaciones', '/admin/notificaciones', 'Canales y plantillas de comunicación del sistema', 500, 2, 6, true),
(580, 'Experiencia y conocimiento', '/admin/portal-autoservicio', 'Configuración administrativa del portal y conocimiento', 500, 2, 8, true),
(590, 'Configuración de Activos y CMDB', '/activos/cmdb/tipos', 'Modelos y clases de configuración tecnológica', 500, 2, 9, true),
(551, 'Vistas de ticket por perfil', '/admin/tickets-vistas', 'Configuración de vistas por perfil', 550, 3, 1, true),
(552, 'Constructor de formularios', '/admin/tickets-formularios', 'Configuración de formularios', 550, 3, 2, true),
(561, 'Plantillas de correo y canales', '/admin/notificaciones', 'Plantillas y canales de notificación', 560, 3, 1, true),
(581, 'Configuración del portal', '/admin/portal-autoservicio', 'Gestión administrativa de la experiencia del portal', 580, 3, 1, true),
(582, 'Gobierno del conocimiento', '/admin/conocimiento-config', 'Revisión y publicación de artículos de conocimiento', 580, 3, 2, true),
(591, 'Clases de elementos de configuración', '/activos/cmdb/tipos', 'Definición administrativa de clases y atributos CMDB', 590, 3, 1, true),
(610, 'Eventos y alertas', '/operacion/eventos', 'Registro y triage de eventos vinculados a CI e incidentes', 600, 2, 1, true),
(620, 'Disponibilidad, capacidad y continuidad', '/operacion/resiliencia', 'Objetivos de servicio, resiliencia y pruebas de continuidad', 600, 2, 2, true),
(720, 'Errores conocidos (KEDB)', '/problemas/kedb', 'Consulta de errores conocidos y workarounds', 700, 2, 2, true)
ON CONFLICT (id_opcion_menu) DO UPDATE SET 
  nombre = EXCLUDED.nombre, 
  url_menu = EXCLUDED.url_menu, 
  descripcion = EXCLUDED.descripcion, 
  id_padre = EXCLUDED.id_padre, 
  nivel = EXCLUDED.nivel, 
  orden = EXCLUDED.orden, 
  estado_registro = true;

DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu=540;
DELETE FROM opciones_menu WHERE id_opcion_menu=540;
DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu IN (137,138);
DELETE FROM opciones_menu WHERE id_opcion_menu IN (137,138);

SELECT setval('opciones_menu_id_opcion_menu_seq', (SELECT MAX(id_opcion_menu) FROM opciones_menu));

-- ---------- Mapeo de permisos por perfil (Segregación SoD / ITIL 4 / ISO 27001) ----------
-- Administrador (id_perfil: 1)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT id_opcion_menu, 1, orden, true FROM opciones_menu
WHERE id_opcion_menu IN (
  100, 130, 133,
  200, 210, 212, 213,
  300, 310, 320, 330,
  400, 410,
  500, 510, 511, 512, 513, 520, 521, 522
)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

-- Tecnico (id_perfil: 2)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT id_opcion_menu, 2, orden, true FROM opciones_menu 
WHERE id_opcion_menu IN (
  100, 110, 112, 114,
  120, 121, 122, 123, 124,
  200, 210, 211, 212, 213,
  300, 310, 320
)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

-- Solicitante (id_perfil: 3)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT id_opcion_menu, 3, orden, true FROM opciones_menu 
WHERE id_opcion_menu IN (
  100, 110, 111, 112, 113, 114
)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

-- Supervisor (id_perfil: 4)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT id_opcion_menu, 4, orden, true FROM opciones_menu 
WHERE id_opcion_menu IN (
  100, 120, 122, 124,
  130, 131, 132, 133, 134,
  200, 210, 212, 213,
  400, 410,
  500
)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

-- Gestor de Area (id_perfil: 5)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT id_opcion_menu, 5, orden, true FROM opciones_menu 
WHERE id_opcion_menu IN (
  100, 110, 111, 112, 113,
  140, 141, 142,
  400, 410
)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

-- Auditor (id_perfil: 6)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT id_opcion_menu, 6, orden, true FROM opciones_menu 
WHERE id_opcion_menu IN (
  100, 130, 134,
  200, 210, 213,
  300, 310, 330,
  400, 410,
  500, 520, 521
)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

-- Aprobador / CAB (id_perfil: 7)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT id_opcion_menu, 7, orden, true FROM opciones_menu
WHERE id_opcion_menu IN (
  200, 210, 212, 213,
  220, 221,
  300, 320
)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

-- Gestor de Cambios (id_perfil: 8)
UPDATE opciones_menu_perfiles SET estado_registro = false WHERE id_perfil = 8;
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT id_opcion_menu, 8, orden, true FROM opciones_menu
WHERE id_opcion_menu IN (
  200, 210, 211, 212, 213,
  220, 221,
  300, 320
)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

-- Gestor de Activos y Configuracion (id_perfil: 9)
UPDATE opciones_menu_perfiles SET estado_registro = false WHERE id_perfil = 9;
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT id_opcion_menu, 9, orden, true FROM opciones_menu
WHERE id_opcion_menu IN (
  300, 310, 320, 330
)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

-- Matriz consolidada de los nueve perfiles. Se limpia el mapeo seed anterior para
-- impedir que una ejecución repetida conserve permisos obsoletos.
DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu IN (
100,110,111,112,113,114,120,121,122,123,124,130,131,132,133,134,135,136,137,138,140,141,142,
200,210,211,212,213,220,221,300,310,320,330,340,400,410,500,510,511,512,513,520,521,522,
550,551,552,560,561,572,580,581,582,590,591,600,610,620,700,720,800
);
WITH matriz(id_opcion_menu,id_perfil) AS (VALUES
(100,2),(110,2),(112,2),(114,2),(120,2),(121,2),(122,2),(123,2),(124,2),(135,2),(136,2),(200,2),(210,2),(211,2),(212,2),(213,2),(300,2),(310,2),(320,2),(600,2),(610,2),(620,2),(700,2),(720,2),
(100,3),(110,3),(111,3),(112,3),(113,3),(114,3),
(100,4),(120,4),(122,4),(124,4),(130,4),(131,4),(132,4),(133,4),(134,4),(135,4),(136,4),(200,4),(210,4),(212,4),(213,4),(400,4),(410,4),(500,4),(600,4),(610,4),(620,4),(700,4),(720,4),
(100,5),(110,5),(111,5),(112,5),(113,5),(140,5),(141,5),(142,5),(143,5),(400,5),(410,5),
(100,6),(130,6),(133,6),(134,6),(200,6),(210,6),(213,6),(300,6),(310,6),(320,6),(330,6),(340,6),(400,6),(410,6),(500,6),(520,6),(521,6),(600,6),(610,6),(620,6),(700,6),(720,6),(800,6),
(200,7),(210,7),(212,7),(213,7),(220,7),(221,7),(300,7),(320,7),(600,7),(610,7),(620,7),(700,7),(720,7),(800,7),
(200,8),(210,8),(211,8),(212,8),(213,8),(220,8),(221,8),(300,8),(320,8),(600,8),(610,8),(620,8),(700,8),(720,8),(800,8),
(200,9),(210,9),(212,9),(213,9),(300,9),(310,9),(320,9),(330,9),(340,9),(600,9),(610,9),(620,9),(700,9),(720,9),(800,9),
(400,1),(410,1),(500,1),(510,1),(511,1),(512,1),(513,1),(520,1),(521,1),(522,1),(550,1),(551,1),(552,1),(560,1),(561,1),(572,1),(580,1),(581,1),(582,1),(590,1),(591,1)
)
INSERT INTO opciones_menu_perfiles (id_opcion_menu,id_perfil,orden,estado_registro)
SELECT id_opcion_menu,id_perfil,ROW_NUMBER() OVER (PARTITION BY id_perfil ORDER BY id_opcion_menu),true FROM matriz
ON CONFLICT (id_opcion_menu,id_perfil) DO UPDATE SET orden=EXCLUDED.orden,estado_registro=true;

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




