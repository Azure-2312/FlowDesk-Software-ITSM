-- ============================================================================
-- MIGRACIÓN FASE 12: ORGANIZACIÓN (N13)
-- ============================================================================

BEGIN;

-- 1. Actualizar sobrevivientes de #21264 «Organización»
UPDATE opciones_menu
SET orden = 1, nombre = 'Departamentos empresariales', url_menu = '/plataforma/organizacion/departamentos-empresa'
WHERE id_opcion_menu = 21204;

UPDATE opciones_menu
SET orden = 2, nombre = 'Grupos y técnicos de TI', url_menu = '/plataforma/organizacion/grupos-ti'
WHERE id_opcion_menu = 21205;

-- 2. Eliminar opciones fusionadas: #21206, #21207
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu IN (21206, 21207);
DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu IN (21206, 21207);
DELETE FROM opciones_menu WHERE id_opcion_menu IN (21206, 21207);

-- 3. Permisos de pantalla en opciones_menu_perfiles
-- #21264 (Raíz Organización): 1
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21264, p.id_perfil
FROM (VALUES (1)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21204 (Departamentos empresariales): 1
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21204, p.id_perfil
FROM (VALUES (1)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21205 (Grupos y técnicos de TI): 1
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21205, p.id_perfil
FROM (VALUES (1)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- 4. Permisos por vista (opciones_menu_vistas_perfiles)
-- #21205 Grupos y técnicos de TI:
-- Admin (1): grupos, tecnicos, supervisores
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21205;
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
  (21205, 'grupos', 1),
  (21205, 'tecnicos', 1),
  (21205, 'supervisores', 1);

COMMIT;
