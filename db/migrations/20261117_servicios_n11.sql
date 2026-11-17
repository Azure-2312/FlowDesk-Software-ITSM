-- ============================================================================
-- MIGRACIÓN FASE 10: CATÁLOGO DE SERVICIOS Y MATRIZ DE PRIORIDAD/SLA ÚNICOS (N11)
-- ============================================================================

BEGIN;

-- 1. Actualizar sobrevivientes de #21163 «Catálogo de Servicios»
UPDATE opciones_menu
SET orden = 1, nombre = 'Catálogo de servicios', url_menu = '/plataforma/servicios/catalogo'
WHERE id_opcion_menu = 21164;

UPDATE opciones_menu
SET orden = 2, nombre = 'Objetivos SLA y matriz de prioridad', url_menu = '/plataforma/servicios/configuracion/sla'
WHERE id_opcion_menu = 21167;

-- 2. Eliminar opciones fusionadas: #21165, #21166, #21168, #21169, #21237, #21248
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu IN (21165, 21166, 21168, 21169, 21237, 21248);
DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu IN (21165, 21166, 21168, 21169, 21237, 21248);
DELETE FROM opciones_menu WHERE id_opcion_menu IN (21165, 21166, 21168, 21169, 21237, 21248);

-- 3. Permisos de pantalla en opciones_menu_perfiles
-- #21163 (Raíz Catálogo de Servicios): 1, 2, 3, 4, 5
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21163, p.id_perfil
FROM (VALUES (1), (2), (3), (4), (5)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21164 (Catálogo de servicios): 1, 2, 3, 4, 5
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21164, p.id_perfil
FROM (VALUES (1), (2), (3), (4), (5)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21167 (Objetivos SLA y matriz de prioridad): 1
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21167, p.id_perfil
FROM (VALUES (1)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- 4. Permisos por vista (opciones_menu_vistas_perfiles)
-- #21164 Catálogo de servicios:
-- Admin (1): explorar, administrar-incidentes, administrar-solicitudes, crear, categorias
-- Tecnico (2): explorar (R5: sin acceso administrativo)
-- Solicitante (3): explorar (R5: absorbe #21237 y #21248 sin privilegios de admin)
-- Supervisor (4): explorar
-- Gestor de Area (5): explorar (R5: absorbe #21248)
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21164;
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
  (21164, 'explorar', 1),
  (21164, 'administrar-incidentes', 1),
  (21164, 'administrar-solicitudes', 1),
  (21164, 'crear', 1),
  (21164, 'categorias', 1),
  (21164, 'explorar', 2),
  (21164, 'explorar', 3),
  (21164, 'explorar', 4),
  (21164, 'explorar', 5);

-- #21167 Objetivos SLA y matriz de prioridad:
-- Admin (1): tiempos, matriz
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21167;
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
  (21167, 'tiempos', 1),
  (21167, 'matriz', 1);

COMMIT;
