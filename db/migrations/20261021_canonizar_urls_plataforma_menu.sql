-- Canonización de URLs del menú para reflejar su ruta física real en Next.js (/plataforma/...)
-- Respalda tablas del catálogo y actualiza 81 URLs con alias hacia su ruta canónica /plataforma/

BEGIN;

DROP TABLE IF EXISTS opciones_menu_bak_20261021;
CREATE TABLE opciones_menu_bak_20261021 AS SELECT * FROM opciones_menu;

DROP TABLE IF EXISTS opciones_menu_perfiles_bak_20261021;
CREATE TABLE opciones_menu_perfiles_bak_20261021 AS SELECT * FROM opciones_menu_perfiles;

UPDATE opciones_menu
SET url_menu = '/plataforma' || CASE WHEN url_menu LIKE '/%' THEN url_menu ELSE '/' || url_menu END
WHERE url_menu IS NOT NULL AND url_menu != '' AND url_menu NOT LIKE '/plataforma/%';

COMMIT;
