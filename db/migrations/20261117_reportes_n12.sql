-- ============================================================================
-- MIGRACIÓN FASE 11: REPORTES (N12)
-- ============================================================================

BEGIN;

-- 1. Actualizar sobrevivientes de #21174 «Reportes»
UPDATE opciones_menu
SET orden = 1, nombre = 'Indicadores operativos y SLA', url_menu = '/plataforma/reportes/operativos'
WHERE id_opcion_menu = 21175;

UPDATE opciones_menu
SET orden = 2, nombre = 'Reportes de cambios y problemas', url_menu = '/plataforma/reportes/cambios'
WHERE id_opcion_menu = 21179;

UPDATE opciones_menu
SET orden = 3, nombre = 'Reportes de activos', url_menu = '/plataforma/reportes/activos'
WHERE id_opcion_menu = 21178;

UPDATE opciones_menu
SET orden = 4, nombre = 'Productividad individual', url_menu = '/plataforma/reportes/productividad'
WHERE id_opcion_menu = 21177;

-- 2. Eliminar opciones fusionadas o retiradas: #21176, #21180, #21181, #21182
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu IN (21176, 21180, 21181, 21182);
DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu IN (21176, 21180, 21181, 21182);
DELETE FROM opciones_menu WHERE id_opcion_menu IN (21176, 21180, 21181, 21182);

-- 3. Permisos de pantalla en opciones_menu_perfiles
-- #21174 (Raíz Reportes): 1, 4, 5, 6, 8, 9, 10
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21174, p.id_perfil
FROM (VALUES (1), (4), (5), (6), (8), (9), (10)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21175 (Indicadores operativos y SLA): 1, 4, 5, 6
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21175, p.id_perfil
FROM (VALUES (1), (4), (5), (6)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21179 (Reportes de cambios y problemas): 1, 8, 10
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21179, p.id_perfil
FROM (VALUES (1), (8), (10)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21178 (Reportes de activos): 1, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21178, p.id_perfil
FROM (VALUES (1), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21177 (Productividad individual): 1, 4
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21177, p.id_perfil
FROM (VALUES (1), (4)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- 4. Permisos por vista (opciones_menu_vistas_perfiles)
-- #21175 Indicadores operativos y SLA:
-- Admin (1): operativo, area
-- Supervisor (4): operativo, area
-- Auditor (6): operativo
-- Gestor de Área (5): area (R5: sin acceso a operativo institucional)
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21175;
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
  (21175, 'operativo', 1),
  (21175, 'area', 1),
  (21175, 'operativo', 4),
  (21175, 'area', 4),
  (21175, 'operativo', 6),
  (21175, 'area', 5);

-- #21179 Reportes de cambios y problemas:
-- Admin (1): cambios, problemas
-- Gestor de Cambios (8): cambios (R5: sin acceso a problemas)
-- Gestor de Problemas (10): problemas (R5: sin acceso a cambios)
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21179;
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
  (21179, 'cambios', 1),
  (21179, 'problemas', 1),
  (21179, 'cambios', 8),
  (21179, 'problemas', 10);

COMMIT;
