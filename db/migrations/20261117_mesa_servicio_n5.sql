-- ============================================================================
-- MIGRACIÓN DDL / DML: FASE 4 — MESA DE SERVICIO (N5)
-- ============================================================================
-- 1. Reordena hijos de Incidentes (#21228) y Solicitudes (#21229)
-- 2. Eleva Centro de asignación (#21251) y Monitor de SLA (#21045) a raíz #21023
-- 3. Asigna permisos de vistas N1 en opciones_menu_vistas_perfiles
-- 4. Garantiza acceso de perfiles a las opciones sobrevivientes en opciones_menu_perfiles
-- 5. Elimina 27 filas obsoletas de opciones_menu_perfiles y opciones_menu
-- ============================================================================

BEGIN;

-- 1. Actualización de opciones que ascienden a la raíz Mesa de Servicio (#21023)
UPDATE opciones_menu
SET id_padre = 21023, orden = 3
WHERE id_opcion_menu = 21251;

UPDATE opciones_menu
SET id_padre = 21023, orden = 4, nombre = 'Monitor de SLA', url_menu = '/plataforma/servicios/sla'
WHERE id_opcion_menu = 21045;

-- 2. Reordenamiento y renombramiento de Incidentes (#21228)
UPDATE opciones_menu SET orden = 1 WHERE id_opcion_menu = 21236; -- Registrar incidente
UPDATE opciones_menu SET orden = 2 WHERE id_opcion_menu = 21231; -- Mis incidentes
UPDATE opciones_menu SET orden = 3 WHERE id_opcion_menu = 21233; -- Bandeja de incidentes
UPDATE opciones_menu SET orden = 4 WHERE id_opcion_menu = 21237; -- Catálogo de incidentes (hasta F10)
UPDATE opciones_menu SET orden = 5 WHERE id_opcion_menu = 21238; -- Incidentes mayores
UPDATE opciones_menu SET orden = 6, nombre = 'Configuración de incidentes' WHERE id_opcion_menu = 21240;

-- 3. Reordenamiento y renombramiento de Solicitudes (#21229)
UPDATE opciones_menu SET orden = 1 WHERE id_opcion_menu = 21247; -- Registrar solicitud
UPDATE opciones_menu SET orden = 2 WHERE id_opcion_menu = 21242; -- Mis solicitudes
UPDATE opciones_menu SET orden = 3 WHERE id_opcion_menu = 21244; -- Bandeja de solicitudes
UPDATE opciones_menu SET orden = 4 WHERE id_opcion_menu = 21248; -- Catálogo de solicitudes (hasta F10)
UPDATE opciones_menu SET orden = 5, nombre = 'Configuración de solicitudes' WHERE id_opcion_menu = 21250;

-- 4. Permisos de opciones en opciones_menu_perfiles para opciones fusionadas (REC-PER)
-- #21233 Bandeja de incidentes: perfiles 1, 2, 4, 5, 6
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
SELECT 21233, p.id, true
FROM (VALUES (1), (2), (4), (5), (6)) AS p(id)
WHERE NOT EXISTS (
  SELECT 1 FROM opciones_menu_perfiles WHERE id_opcion_menu = 21233 AND id_perfil = p.id
);

-- #21244 Bandeja de solicitudes: perfiles 1, 2, 4, 5, 6
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
SELECT 21244, p.id, true
FROM (VALUES (1), (2), (4), (5), (6)) AS p(id)
WHERE NOT EXISTS (
  SELECT 1 FROM opciones_menu_perfiles WHERE id_opcion_menu = 21244 AND id_perfil = p.id
);

-- #21238 Incidentes mayores: perfiles 1, 2, 4
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
SELECT 21238, p.id, true
FROM (VALUES (1), (2), (4)) AS p(id)
WHERE NOT EXISTS (
  SELECT 1 FROM opciones_menu_perfiles WHERE id_opcion_menu = 21238 AND id_perfil = p.id
);

-- #21240 Configuración de incidentes: perfil 1
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
SELECT 21240, 1, true
WHERE NOT EXISTS (
  SELECT 1 FROM opciones_menu_perfiles WHERE id_opcion_menu = 21240 AND id_perfil = 1
);

-- #21250 Configuración de solicitudes: perfil 1
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
SELECT 21250, 1, true
WHERE NOT EXISTS (
  SELECT 1 FROM opciones_menu_perfiles WHERE id_opcion_menu = 21250 AND id_perfil = 1
);

-- #21045 Monitor de SLA: perfiles 1, 2, 4
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
SELECT 21045, p.id, true
FROM (VALUES (1), (2), (4)) AS p(id)
WHERE NOT EXISTS (
  SELECT 1 FROM opciones_menu_perfiles WHERE id_opcion_menu = 21045 AND id_perfil = p.id
);

-- 5. Poblamiento de vistas autorizadas en opciones_menu_vistas_perfiles (N1)

-- 5.1 #21233 Bandeja de incidentes
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro) VALUES
  (21233, 2, 'bandeja', true),
  (21233, 4, 'bandeja', true),
  (21233, 2, 'asignados', true),
  (21233, 5, 'departamento', true),
  (21233, 2, 'resueltos', true),
  (21233, 4, 'resueltos', true),
  (21233, 6, 'resueltos', true),
  (21233, 1, 'todos', true),
  (21233, 4, 'todos', true),
  (21233, 6, 'todos', true)
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true;

-- 5.2 #21244 Bandeja de solicitudes
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro) VALUES
  (21244, 2, 'bandeja', true),
  (21244, 4, 'bandeja', true),
  (21244, 2, 'asignados', true),
  (21244, 5, 'departamento', true),
  (21244, 2, 'resueltos', true),
  (21244, 4, 'resueltos', true),
  (21244, 6, 'resueltos', true),
  (21244, 1, 'todos', true),
  (21244, 4, 'todos', true),
  (21244, 6, 'todos', true)
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true;

-- 5.3 #21238 Incidentes mayores
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro) VALUES
  (21238, 1, 'listado', true),
  (21238, 4, 'listado', true),
  (21238, 1, 'sala-crisis', true),
  (21238, 2, 'sala-crisis', true)
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true;

-- 5.4 #21240 Configuración de incidentes
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro) VALUES
  (21240, 1, 'campos', true),
  (21240, 1, 'reglas', true)
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true;

-- 5.5 #21250 Configuración de solicitudes
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro) VALUES
  (21250, 1, 'campos', true),
  (21250, 1, 'reglas', true)
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true;

-- 5.6 #21045 Monitor de SLA
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro) VALUES
  (21045, 1, 'riesgo', true),
  (21045, 4, 'riesgo', true),
  (21045, 1, 'incumplimientos', true),
  (21045, 4, 'incumplimientos', true),
  (21045, 1, 'objetivos', true),
  (21045, 2, 'objetivos', true),
  (21045, 4, 'objetivos', true),
  (21045, 1, 'mi-cola', true),
  (21045, 2, 'mi-cola', true),
  (21045, 1, 'grupo', true),
  (21045, 4, 'grupo', true)
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true;

-- 6. Eliminación de las 27 filas obsoletas en opciones_menu_perfiles y opciones_menu
DELETE FROM opciones_menu_perfiles
WHERE id_opcion_menu IN (
  21024, 21044, 21046, 21047, 21048, 21049,
  21230, 21232, 21234, 21235,
  21241, 21243, 21245, 21246,
  21239,
  21186, 21187,
  21252, 21253, 21254, 21255, 21256, 21257, 21258, 21259, 21260, 21261
);

DELETE FROM opciones_menu
WHERE id_opcion_menu IN (
  21024, 21044, 21046, 21047, 21048, 21049,
  21230, 21232, 21234, 21235,
  21241, 21243, 21245, 21246,
  21239,
  21186, 21187,
  21252, 21253, 21254, 21255, 21256, 21257, 21258, 21259, 21260, 21261
);

COMMIT;
