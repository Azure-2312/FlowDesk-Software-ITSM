-- Reorganización jerárquica y orden estricto de opciones de menú para Administrador (ITSM).
-- Soporta hasta 5 niveles en la jerarquía institucional.

ALTER TABLE opciones_menu ALTER COLUMN nombre TYPE VARCHAR(120);
ALTER TABLE opciones_menu ALTER COLUMN url_menu TYPE VARCHAR(120);
ALTER TABLE opciones_menu DROP CONSTRAINT IF EXISTS opciones_menu_nivel_check;
ALTER TABLE opciones_menu ADD CONSTRAINT opciones_menu_nivel_check CHECK (nivel >= 1 AND nivel <= 5);

-- Inserción / Actualización de opciones de menú
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  -- Nivel 1
  (500, 'Configuración', '/admin', 'Consola central de configuración y gobernanza de la plataforma', NULL, 1, 1, true),
  (400, 'Reportes y Analítica', '/tickets/reportes', 'Consola de métricas, indicadores y tableros', NULL, 1, 2, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 2 bajo Configuración (500)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (510, 'Identidades y accesos', '/admin/usuarios', 'Gestión de usuarios, credenciales, perfiles y menú', 500, 2, 1, true),
  (520, 'Catálogo de servicios y SLAs', '/admin/servicios', 'Portafolio de servicios, categorías, audiencias y SLAs', 500, 2, 2, true),
  (5300, 'Configuración de procesos', '/admin/tickets-formularios', 'Parametrización de incidentes, solicitudes, cambios y problemas', 500, 2, 3, true),
  (5400, 'Organización y soporte', '/admin/departamentos', 'Departamentos de negocio, grupos resolutores TI y especialistas', 500, 2, 4, true),
  (5500, 'Activos y configuración', '/activos/inventario', 'Gestión de hardware, software, CMDB y ciclos de vida', 500, 2, 5, true),
  (5600, 'Comunicaciones y notificaciones', '/admin/notificaciones', 'Plantillas de correo, canales y reglas de disparo', 500, 2, 6, true),
  (5700, 'Gobierno del conocimiento', '/admin/conocimiento-config', 'KCS, categorías, responsables y reglas editoriales', 500, 2, 7, true),
  (5800, 'Auditoría, seguridad y retención', '/admin/auditoria-sistema', 'Bitácoras inmutables, seguridad ISO 27001 y purga', 500, 2, 8, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 3 bajo Identidades y accesos (510)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (511, 'Gestión de usuarios', '/admin/usuarios', 'Mantenimiento de colaboradores y credenciales', 510, 3, 1, true),
  (512, 'Perfiles y permisos', '/admin/perfiles', 'Matriz de roles y atribuciones institucionales', 510, 3, 2, true),
  (513, 'Estructura del menú', '/admin/menu', 'Jerarquía de navegación y permisos de visualización', 510, 3, 3, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 3 bajo Catálogo de servicios y SLAs (520)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (521, 'Servicios de incidentes', '/admin/servicios?tipo=1', 'Ofertas y acuerdos para restauración de fallas', 520, 3, 1, true),
  (522, 'Servicios de solicitudes', '/admin/servicios?tipo=2', 'Peticiones de servicio estándar, accesos y trámites', 520, 3, 2, true),
  (523, 'Categorías y ofertas publicadas', '/admin/servicios', 'Catálogo general de categorías y servicios', 520, 3, 3, true),
  (524, 'Acceso por perfil o criterio de audiencia', '/admin/portal-autoservicio', 'Distribución de servicios visibles por perfil', 520, 3, 4, true),
  (525, 'Objetivos SLA', '/admin/servicios', 'Metas de respuesta y resolución por servicio', 520, 3, 5, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 3 bajo Configuración de procesos (5300)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (5310, 'Incidentes', '/admin/tickets-formularios?tipo=incidente', 'Configuración de proceso de gestión de incidentes', 5300, 3, 1, true),
  (5320, 'Solicitudes de servicio', '/admin/tickets-formularios?tipo=solicitud', 'Configuración de proceso de solicitudes de servicio', 5300, 3, 2, true),
  (5330, 'Gestión de cambios', '/admin/rfc', 'Configuración de proceso de habilitación del cambio', 5300, 3, 3, true),
  (5340, 'Gestión de problemas', '/problemas', 'Configuración de proceso de gestión de problemas', 5300, 3, 4, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 4 bajo Incidentes (5310)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (5311, 'Formularios y campos', '/admin/tickets-formularios?tipo=incidente', 'Campos obligatorios y visibles para incidentes', 5310, 4, 1, true),
  (5312, 'Vistas previas por usuario/perfil', '/admin/tickets-vistas?tipo=incidente', 'Políticas de visibilidad y acceso a secciones de incidentes', 5310, 4, 2, true),
  (5313, 'Flujo de estados y acciones', '/admin/tickets-vistas?seccion=estados', 'Matriz de transición y estados de incidentes', 5310, 4, 3, true),
  (5314, 'Reglas de notificación', '/admin/notificaciones?proceso=incidente', 'Disparo de alertas por eventos de incidentes', 5310, 4, 4, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 4 bajo Solicitudes de servicio (5320)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (5321, 'Formularios y campos', '/admin/tickets-formularios?tipo=solicitud', 'Campos requeridos y específicos para solicitudes', 5320, 4, 1, true),
  (5322, 'Vistas previas por usuario/perfil', '/admin/tickets-vistas?tipo=solicitud', 'Políticas de visibilidad por rol para solicitudes', 5320, 4, 2, true),
  (5323, 'Flujo de atención y aprobaciones', '/admin/servicios', 'Compuertas de aprobación y workflows de solicitudes', 5320, 4, 3, true),
  (5324, 'Reglas de notificación', '/admin/notificaciones?proceso=solicitud', 'Disparo de alertas en hitos de solicitudes', 5320, 4, 4, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 4 bajo Gestión de cambios (5330)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (5331, 'Formulario RFC', '/admin/rfc', 'Campos personalizados y estructura de la solicitud RFC', 5330, 4, 1, true),
  (5332, 'Tipos de cambio y requisitos', '/admin/rfc?seccion=requisitos', 'Reglas base: CI obligatorio, rollback y ventana', 5330, 4, 2, true),
  (5333, 'Flujo de evaluación, autorización y revisión posterior', '/admin/rfc?seccion=aprobaciones', 'Circuitos de aprobación CAB, ECAB y PIR', 5330, 4, 3, true),
  (5334, 'Notificaciones y calendario de cambios', '/cambios/gestion/calendario', 'Calendario corporativo de ventanas y avisos', 5330, 4, 4, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 4 bajo Gestión de problemas (5340)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (5341, 'Formularios', '/problemas', 'Registro de expedientes de problemas e investigación', 5340, 4, 1, true),
  (5342, 'Flujo de investigación y seguimiento', '/problemas', 'Ciclo de vida, causa raíz y workarounds', 5340, 4, 2, true),
  (5343, 'Relación con incidentes, errores conocidos y conocimiento', '/problemas/kedb', 'Vinculación a la KEDB y repositorio de soluciones', 5340, 4, 3, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 3 bajo Organización y soporte (5400)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (5401, 'Departamentos empresariales', '/admin/departamentos-empresa', 'Estructura departamental de la organización cliente', 5400, 3, 1, true),
  (5402, 'Departamentos y grupos resolutores de TI', '/admin/departamentos', 'Grupos técnicos de soporte y resolución', 5400, 3, 2, true),
  (5403, 'Técnicos y niveles de soporte', '/admin/tecnicos', 'Especialistas técnicos, niveles N1..N3 y capacidades WIP', 5400, 3, 3, true),
  (5404, 'Supervisores', '/admin/departamentos', 'Designación y alcance de supervisores de soporte', 5400, 3, 4, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 3 bajo Activos y configuración (5500)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (5501, 'Tipos, modelos y atributos de activos', '/activos/inventario', 'Catálogo de tipos y modelos con atributos y depreciación', 5500, 3, 1, true),
  (5502, 'Ciclos de vida y reglas de transición', '/activos/inventario', 'Estados autorizados, transiciones y custodia inmutable', 5500, 3, 2, true),
  (5503, 'Licencias y contratos', '/activos/licencias', 'Inventario y asignación de licencias de software (SAM)', 5500, 3, 3, true),
  (5504, 'Tipos de elementos de configuración y relaciones de CMDB', '/activos/cmdb/tipos', 'Modelado de clases CI y relaciones topológicas', 5500, 3, 4, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 3 bajo Comunicaciones y notificaciones (5600)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (5601, 'Plantillas de correo y otros canales', '/admin/notificaciones', 'Diseño de plantillas HTML para comunicaciones del servicio', 5600, 3, 1, true),
  (5602, 'Configuración de conexiones de correo y canales externos', '/admin/notificaciones', 'Canales y parámetros de envío de mensajes', 5600, 3, 2, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 3 bajo Gobierno del conocimiento (5700)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (5701, 'Categorías, responsables y reglas de publicación/revisión', '/admin/conocimiento-config', 'KCS, ciclo editorial, versionado y retiro de artículos', 5700, 3, 1, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 3 bajo Auditoría, seguridad y retención (5800)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (5801, 'Auditoría de cambios', '/admin/auditoria-sistema', 'Bitácora inmutable de modificaciones en el sistema', 5800, 3, 1, true),
  (5802, 'Registros de seguridad y autenticación', '/admin/seguridad-logs', 'Monitoreo de accesos, IPs y bloqueos ISO 27001', 5800, 3, 2, true),
  (5803, 'Retención y mantenimiento de datos', '/admin/mantenimiento-datos', 'Optimización, archivado y purga segura de registros', 5800, 3, 3, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Nivel 2 bajo Reportes y Analítica (400)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (410, 'Indicadores operativos y SLA', '/tickets/reportes', 'Métricas consolidadas de atención y cumplimiento', 400, 2, 1, true),
  (420, 'Tableros', '/admin/reportes-disenador', 'Diseñador y visualizador de dashboards ejecutivos', 400, 2, 2, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Actualización exclusiva de opciones para el perfil 1 (Administrador)
DELETE FROM opciones_menu_perfiles WHERE id_perfil = 1;

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
VALUES
  -- Raíces
  (500, 1, 1, true),
  (400, 1, 2, true),
  
  -- Nivel 2 bajo Configuración (500)
  (510, 1, 1, true),
  (520, 1, 2, true),
  (5300, 1, 3, true),
  (5400, 1, 4, true),
  (5500, 1, 5, true),
  (5600, 1, 6, true),
  (5700, 1, 7, true),
  (5800, 1, 8, true),

  -- Nivel 3 bajo Identidades y accesos (510)
  (511, 1, 1, true),
  (512, 1, 2, true),
  (513, 1, 3, true),

  -- Nivel 3 bajo Catálogo de servicios y SLAs (520)
  (521, 1, 1, true),
  (522, 1, 2, true),
  (523, 1, 3, true),
  (524, 1, 4, true),
  (525, 1, 5, true),

  -- Nivel 3 bajo Configuración de procesos (5300)
  (5310, 1, 1, true),
  (5320, 1, 2, true),
  (5330, 1, 3, true),
  (5340, 1, 4, true),

  -- Nivel 4 bajo Incidentes (5310)
  (5311, 1, 1, true),
  (5312, 1, 2, true),
  (5313, 1, 3, true),
  (5314, 1, 4, true),

  -- Nivel 4 bajo Solicitudes de servicio (5320)
  (5321, 1, 1, true),
  (5322, 1, 2, true),
  (5323, 1, 3, true),
  (5324, 1, 4, true),

  -- Nivel 4 bajo Gestión de cambios (5330)
  (5331, 1, 1, true),
  (5332, 1, 2, true),
  (5333, 1, 3, true),
  (5334, 1, 4, true),

  -- Nivel 4 bajo Gestión de problemas (5340)
  (5341, 1, 1, true),
  (5342, 1, 2, true),
  (5343, 1, 3, true),

  -- Nivel 3 bajo Organización y soporte (5400)
  (5401, 1, 1, true),
  (5402, 1, 2, true),
  (5403, 1, 3, true),
  (5404, 1, 4, true),

  -- Nivel 3 bajo Activos y configuración (5500)
  (5501, 1, 1, true),
  (5502, 1, 2, true),
  (5503, 1, 3, true),
  (5504, 1, 4, true),

  -- Nivel 3 bajo Comunicaciones y notificaciones (5600)
  (5601, 1, 1, true),
  (5602, 1, 2, true),

  -- Nivel 3 bajo Gobierno del conocimiento (5700)
  (5701, 1, 1, true),

  -- Nivel 3 bajo Auditoría, seguridad y retención (5800)
  (5801, 1, 1, true),
  (5802, 1, 2, true),
  (5803, 1, 3, true),

  -- Nivel 2 bajo Reportes y Analítica (400)
  (410, 1, 1, true),
  (420, 1, 2, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE
SET orden = EXCLUDED.orden,
    estado_registro = true;
