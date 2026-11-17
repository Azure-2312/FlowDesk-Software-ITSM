-- ============================================================================
-- MIGRACIÓN: Fase 5 — Cambios (Habilitación de cambios)
-- FECHA: 2026-11-17
-- DESCRIPCIÓN:
-- Reestructura la raíz «Cambios» (#21059) a exactamente 8 opciones planas:
-- 1. #21070 Solicitar cambio (/plataforma/cambios/nuevo)
-- 2. #21068 Mis cambios (/plataforma/cambios/mis-cambios) [6 vistas]
-- 3. #21073 Gestión de cambios (/plataforma/cambios/gestion) [4 vistas]
-- 4. #21082 CAB y ECAB (/plataforma/cambios/cab) [4 vistas]
-- 5. #21071 Calendario de cambios (/plataforma/cambios/gestion/calendario) [2 vistas]
-- 6. #21090 Modelos de cambio estándar (/plataforma/cambios/modelos) [2 vistas]
-- 7. #21077 Revisión post-implementación (/plataforma/cambios/gestion/pir)
-- 8. #21191 Configuración de cambios (/plataforma/cambios/configuracion) [5 vistas]
--
-- Elimina 27 filas obsoletas/fusionadas (#21060, #21062–#21067, #21069, #21072,
-- #21074–#21076, #21078–#21081, #21083–#21087, #21192–#21197)
-- y puebla opciones_menu_vistas_perfiles preservando permisos (R5).
-- ============================================================================

BEGIN;

-- 1. Actualizar las 8 opciones sobrevivientes bajo #21059
UPDATE opciones_menu SET 
  id_padre = 21059,
  nombre = 'Solicitar cambio',
  url_menu = '/plataforma/cambios/nuevo',
  orden = 1,
  nivel = 2
WHERE id_opcion_menu = 21070;

UPDATE opciones_menu SET 
  id_padre = 21059,
  nombre = 'Mis cambios',
  url_menu = '/plataforma/cambios/mis-cambios',
  orden = 2,
  nivel = 2
WHERE id_opcion_menu = 21068;

UPDATE opciones_menu SET 
  id_padre = 21059,
  nombre = 'Gestión de cambios',
  url_menu = '/plataforma/cambios/gestion',
  orden = 3,
  nivel = 2
WHERE id_opcion_menu = 21073;

UPDATE opciones_menu SET 
  id_padre = 21059,
  nombre = 'CAB y ECAB',
  url_menu = '/plataforma/cambios/cab',
  orden = 4,
  nivel = 2
WHERE id_opcion_menu = 21082;

UPDATE opciones_menu SET 
  id_padre = 21059,
  nombre = 'Calendario de cambios',
  url_menu = '/plataforma/cambios/gestion/calendario',
  orden = 5,
  nivel = 2
WHERE id_opcion_menu = 21071;

UPDATE opciones_menu SET 
  id_padre = 21059,
  nombre = 'Modelos de cambio estándar',
  url_menu = '/plataforma/cambios/modelos',
  orden = 6,
  nivel = 2
WHERE id_opcion_menu = 21090;

UPDATE opciones_menu SET 
  id_padre = 21059,
  nombre = 'Revisión post-implementación',
  url_menu = '/plataforma/cambios/gestion/pir',
  orden = 7,
  nivel = 2
WHERE id_opcion_menu = 21077;

UPDATE opciones_menu SET 
  id_padre = 21059,
  nombre = 'Configuración de cambios',
  url_menu = '/plataforma/cambios/configuracion',
  orden = 8,
  nivel = 2
WHERE id_opcion_menu = 21191;

-- 2. Permisos de vistas (N1) en opciones_menu_vistas_perfiles
-- #21068 Mis cambios (vistas: en-tramite, por-implementar, afectan-area, afectan-equipo, afectan-servicios, historial)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES
  (21068, 1, 'en-tramite'),
  (21068, 2, 'en-tramite'),
  (21068, 8, 'en-tramite'),
  (21068, 1, 'por-implementar'),
  (21068, 2, 'por-implementar'),
  (21068, 1, 'afectan-area'),
  (21068, 5, 'afectan-area'),
  (21068, 1, 'afectan-equipo'),
  (21068, 4, 'afectan-equipo'),
  (21068, 1, 'afectan-servicios'),
  (21068, 2, 'afectan-servicios'),
  (21068, 1, 'historial'),
  (21068, 2, 'historial')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- #21073 Gestión de cambios (vistas: por-evaluar, aprobacion, ejecucion, historial)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES
  (21073, 1, 'por-evaluar'),
  (21073, 8, 'por-evaluar'),
  (21073, 1, 'aprobacion'),
  (21073, 8, 'aprobacion'),
  (21073, 1, 'ejecucion'),
  (21073, 8, 'ejecucion'),
  (21073, 1, 'historial'),
  (21073, 6, 'historial'),
  (21073, 8, 'historial')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- #21082 CAB y ECAB (vistas: agenda, emergencia, dictamen, miembros)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES
  (21082, 1, 'agenda'),
  (21082, 7, 'agenda'),
  (21082, 8, 'agenda'),
  (21082, 1, 'emergencia'),
  (21082, 7, 'emergencia'),
  (21082, 8, 'emergencia'),
  (21082, 1, 'dictamen'),
  (21082, 7, 'dictamen'),
  (21082, 8, 'dictamen'),
  (21082, 1, 'miembros'),
  (21082, 8, 'miembros')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- #21071 Calendario de cambios (vistas: calendario, programacion)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES
  (21071, 1, 'calendario'),
  (21071, 2, 'calendario'),
  (21071, 4, 'calendario'),
  (21071, 5, 'calendario'),
  (21071, 7, 'calendario'),
  (21071, 8, 'calendario'),
  (21071, 1, 'programacion'),
  (21071, 4, 'programacion'),
  (21071, 8, 'programacion')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- #21090 Modelos de cambio estándar (vistas: consulta, administracion)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES
  (21090, 1, 'consulta'),
  (21090, 2, 'consulta'),
  (21090, 7, 'consulta'),
  (21090, 8, 'consulta'),
  (21090, 1, 'administracion'),
  (21090, 8, 'administracion')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- #21191 Configuración de cambios (vistas: campos, listas, riesgo, autoridad, calendario)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES
  (21191, 1, 'campos'),
  (21191, 8, 'campos'),
  (21191, 1, 'listas'),
  (21191, 8, 'listas'),
  (21191, 1, 'riesgo'),
  (21191, 8, 'riesgo'),
  (21191, 1, 'autoridad'),
  (21191, 8, 'autoridad'),
  (21191, 1, 'calendario'),
  (21191, 8, 'calendario')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- 3. Asegurar permisos en opciones_menu_perfiles para las pantallas sobrevivientes
-- #21070: perfiles 1, 2, 5, 8
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21070, 1), (21070, 2), (21070, 5), (21070, 8)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21068: perfiles 1, 2, 4, 5, 8
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21068, 1), (21068, 2), (21068, 4), (21068, 5), (21068, 8)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21073: perfiles 1, 6, 8
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21073, 1), (21073, 6), (21073, 8)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21082: perfiles 1, 7, 8
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21082, 1), (21082, 7), (21082, 8)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21071: perfiles 1, 2, 4, 5, 7, 8
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21071, 1), (21071, 2), (21071, 4), (21071, 5), (21071, 7), (21071, 8)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21090: perfiles 1, 2, 7, 8
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21090, 1), (21090, 2), (21090, 7), (21090, 8)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21077: perfiles 1, 8
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21077, 1), (21077, 8)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21191: perfiles 1, 8
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21191, 1), (21191, 8)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21059: perfiles 1, 2, 4, 5, 6, 7, 8
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
VALUES (21059, 1), (21059, 2), (21059, 4), (21059, 5), (21059, 6), (21059, 7), (21059, 8)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- 4. Eliminar las 27 opciones eliminadas / fusionadas
DELETE FROM opciones_menu_vistas_perfiles 
WHERE id_opcion_menu IN (
  21060, 21062, 21063, 21064, 21065, 21066, 21067, 21069, 21072, 21074, 
  21075, 21076, 21078, 21079, 21080, 21081, 21083, 21084, 21085, 21086, 
  21087, 21192, 21193, 21194, 21195, 21196, 21197
);

DELETE FROM opciones_menu_perfiles 
WHERE id_opcion_menu IN (
  21060, 21062, 21063, 21064, 21065, 21066, 21067, 21069, 21072, 21074, 
  21075, 21076, 21078, 21079, 21080, 21081, 21083, 21084, 21085, 21086, 
  21087, 21192, 21193, 21194, 21195, 21196, 21197
);

DELETE FROM opciones_menu 
WHERE id_opcion_menu IN (
  21060, 21062, 21063, 21064, 21065, 21066, 21067, 21069, 21072, 21074, 
  21075, 21076, 21078, 21079, 21080, 21081, 21083, 21084, 21085, 21086, 
  21087, 21192, 21193, 21194, 21195, 21196, 21197
);

COMMIT;
