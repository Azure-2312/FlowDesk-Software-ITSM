-- ============================================================================
-- MIGRACIÓN FASE 9: GESTIÓN DEL CONOCIMIENTO (N10)
-- ============================================================================

BEGIN;

-- 1. Actualizar sobrevivientes de #21156 «Conocimiento»
UPDATE opciones_menu
SET orden = 1, nombre = 'Base de conocimiento', url_menu = '/plataforma/conocimiento/base'
WHERE id_opcion_menu = 21157;

UPDATE opciones_menu
SET orden = 2, nombre = 'Crear artículo', url_menu = '/plataforma/conocimiento/crear'
WHERE id_opcion_menu = 21159;

UPDATE opciones_menu
SET orden = 3, nombre = 'Mis artículos', url_menu = '/plataforma/conocimiento/mis-articulos'
WHERE id_opcion_menu = 21160;

UPDATE opciones_menu
SET orden = 4, nombre = 'Revisión y publicación', url_menu = '/plataforma/conocimiento/publicacion'
WHERE id_opcion_menu = 21161;

UPDATE opciones_menu
SET orden = 5, nombre = 'Configuración de conocimiento', url_menu = '/plataforma/conocimiento/configuracion'
WHERE id_opcion_menu = 21202;

-- 2. Eliminar opciones fusionadas o duplicadas: #21158 (duplicado de base), #21162 (fusionado en #21161)
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu IN (21158, 21162);
DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu IN (21158, 21162);
DELETE FROM opciones_menu WHERE id_opcion_menu IN (21158, 21162);

-- 3. Permisos de pantalla en opciones_menu_perfiles
-- #21156 (Raíz Conocimiento): 1 (Admin), 2 (Tecnico), 3 (Solicitante), 4 (Supervisor), 5 (Gestor de Area)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21156, p.id_perfil
FROM (VALUES (1), (2), (3), (4), (5)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21157 (Base de conocimiento): 1, 2, 3, 4, 5
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21157, p.id_perfil
FROM (VALUES (1), (2), (3), (4), (5)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21159 (Crear artículo): 1, 2
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21159, p.id_perfil
FROM (VALUES (1), (2)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21160 (Mis artículos): 1, 2
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21160, p.id_perfil
FROM (VALUES (1), (2)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21161 (Revisión y publicación): 1, 2, 4
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21161, p.id_perfil
FROM (VALUES (1), (2), (4)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21202 (Configuración de conocimiento): 1
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21202, p.id_perfil
FROM (VALUES (1)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- 4. Permisos por vista (opciones_menu_vistas_perfiles)
-- #21161 Revisión y publicación:
-- Admin (1): publicacion, pendientes
-- Supervisor (4): publicacion, pendientes
-- Técnico (2): pendientes (R5: SIN publicacion)
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21161;
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
  (21161, 'publicacion', 1),
  (21161, 'pendientes', 1),
  (21161, 'publicacion', 4),
  (21161, 'pendientes', 4),
  (21161, 'pendientes', 2);

-- #21202 Configuración de conocimiento:
-- Admin (1): articulos, politicas
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21202;
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
  (21202, 'articulos', 1),
  (21202, 'politicas', 1);

COMMIT;
