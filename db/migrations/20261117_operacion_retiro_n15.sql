-- Migración Fase 14: Retiro de la raíz «Operación» (#21170)
-- Elimina #21170 (raíz Operación) y sus 3 hijos: #21171, #21172, #21173
-- Deja exactamente 11 raíces en opciones_menu

BEGIN;

-- 1. Eliminar referencias en opciones_menu_vistas_perfiles
DELETE FROM opciones_menu_vistas_perfiles
WHERE id_opcion_menu IN (21170, 21171, 21172, 21173);

-- 2. Eliminar referencias en opciones_menu_perfiles
DELETE FROM opciones_menu_perfiles
WHERE id_opcion_menu IN (21170, 21171, 21172, 21173);

-- 3. Eliminar hijos primero por integridad referencial
DELETE FROM opciones_menu
WHERE id_opcion_menu IN (21171, 21172, 21173);

-- 4. Eliminar la raíz #21170
DELETE FROM opciones_menu
WHERE id_opcion_menu = 21170;

COMMIT;
