-- ============================================================================
-- MIGRACIÓN: Fase 6 — Problemas
-- FECHA: 2026-11-17
-- DESCRIPCIÓN:
-- Reestructura la raíz «Problemas» (#21091) a exactamente 5 pantallas:
-- 1. #21105 Registrar problema (/plataforma/problemas/crear)
-- 2. #21093 Bandeja de problemas (/plataforma/problemas/bandeja) [4 vistas]
-- 3. #21095 Candidatos a problema (/plataforma/problemas/candidatos) [2 vistas]
-- 4. #21098 Errores conocidos (/plataforma/problemas/kedb)
-- 5. #21199 Configuración de problemas (/plataforma/problemas/configuracion) [2 vistas]
--
-- Agrega vista 'problemas' a #21045 (Monitor de SLA).
-- Elimina 15 filas obsoletas/fusionadas (#21092, #21094, #21096, #21097, #21099,
-- #21100, #21101, #21102, #21103, #21104, #21106, #21107, #21108, #21200, #21201).
-- ============================================================================

BEGIN;

-- 1. Actualizar las 5 opciones sobrevivientes bajo #21091
UPDATE opciones_menu SET 
  id_padre = 21091,
  nombre = 'Registrar problema',
  url_menu = '/plataforma/problemas/crear',
  orden = 1,
  nivel = 2
WHERE id_opcion_menu = 21105;

UPDATE opciones_menu SET 
  id_padre = 21091,
  nombre = 'Bandeja de problemas',
  url_menu = '/plataforma/problemas/bandeja',
  orden = 2,
  nivel = 2
WHERE id_opcion_menu = 21093;

UPDATE opciones_menu SET 
  id_padre = 21091,
  nombre = 'Candidatos a problema',
  url_menu = '/plataforma/problemas/candidatos',
  orden = 3,
  nivel = 2
WHERE id_opcion_menu = 21095;

UPDATE opciones_menu SET 
  id_padre = 21091,
  nombre = 'Errores conocidos',
  url_menu = '/plataforma/problemas/kedb',
  orden = 4,
  nivel = 2
WHERE id_opcion_menu = 21098;

UPDATE opciones_menu SET 
  id_padre = 21091,
  nombre = 'Configuración de problemas',
  url_menu = '/plataforma/problemas/configuracion',
  orden = 5,
  nivel = 2
WHERE id_opcion_menu = 21199;

-- 2. Permisos de vistas (N1) en opciones_menu_vistas_perfiles
-- #21093 Bandeja de problemas (vistas: sin-asignar, asignados, grupo, historial)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES
  (21093, 1, 'sin-asignar'),
  (21093, 4, 'sin-asignar'),
  (21093, 10, 'sin-asignar'),
  (21093, 1, 'asignados'),
  (21093, 2, 'asignados'),
  (21093, 10, 'asignados'),
  (21093, 1, 'grupo'),
  (21093, 2, 'grupo'),
  (21093, 10, 'grupo'),
  (21093, 1, 'historial'),
  (21093, 4, 'historial'),
  (21093, 6, 'historial'),
  (21093, 10, 'historial')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- #21095 Candidatos a problema (vistas: propuestos, recurrentes)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES
  (21095, 1, 'propuestos'),
  (21095, 2, 'propuestos'),
  (21095, 10, 'propuestos'),
  (21095, 1, 'recurrentes'),
  (21095, 10, 'recurrentes')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- #21199 Configuración de problemas (vistas: campos, listas)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES
  (21199, 1, 'campos'),
  (21199, 10, 'campos'),
  (21199, 1, 'listas'),
  (21199, 10, 'listas')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- #21045 Monitor de SLA (vista problemas)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES
  (21045, 1, 'problemas'),
  (21045, 10, 'problemas')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- 3. Asegurar permisos en opciones_menu_perfiles para las pantallas sobrevivientes
-- #21105: perfiles 1, 2, 10
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21105, 1), (21105, 2), (21105, 10)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21093: perfiles 1, 2, 4, 6, 10
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21093, 1), (21093, 2), (21093, 4), (21093, 6), (21093, 10)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21095: perfiles 1, 2, 10
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21095, 1), (21095, 2), (21095, 10)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21098: perfiles 1, 2, 4, 10
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21098, 1), (21098, 2), (21098, 4), (21098, 10)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21199: perfiles 1, 10
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21199, 1), (21199, 10)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21045: perfil 10
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21045, 10)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21091: perfiles 1, 2, 4, 6, 10
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21091, 1), (21091, 2), (21091, 4), (21091, 6), (21091, 10)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- 4. Eliminar las 15 opciones eliminadas / fusionadas
DELETE FROM opciones_menu_vistas_perfiles 
WHERE id_opcion_menu IN (
  21092, 21094, 21096, 21097, 21099, 21100, 21101, 21102, 21103, 21104, 
  21106, 21107, 21108, 21200, 21201
);

DELETE FROM opciones_menu_perfiles 
WHERE id_opcion_menu IN (
  21092, 21094, 21096, 21097, 21099, 21100, 21101, 21102, 21103, 21104, 
  21106, 21107, 21108, 21200, 21201
);

DELETE FROM opciones_menu 
WHERE id_opcion_menu IN (
  21092, 21094, 21096, 21097, 21099, 21100, 21101, 21102, 21103, 21104, 
  21106, 21107, 21108, 21200, 21201
);

COMMIT;
