-- ============================================================================
-- MIGRACIÓN FASE 8: CMDB (GESTIÓN DE CONFIGURACIÓN - N9)
-- ============================================================================
-- 1. Insertar opción nueva #21266 «CIs» (/plataforma/cmdb/cis)
-- 2. Actualizar #21133 «CMDB» como sub-agrupador (orden 2, padre 21109)
-- 3. Actualizar los 3 hijos sobrevivientes: #21139 (orden 2), #21135 (orden 3), #21141 (orden 4)
-- 4. Eliminar las 7 opciones de menú eliminadas / fusionadas
-- 5. Poblar opciones_menu_perfiles y opciones_menu_vistas_perfiles
-- ============================================================================

BEGIN;

-- 1. Actualizar el sub-agrupador #21133 «CMDB»
UPDATE opciones_menu
SET nombre = 'CMDB',
    url_menu = '',
    orden = 2,
    id_padre = 21109
WHERE id_opcion_menu = 21133;

-- 2. Insertar opción #21266 «CIs»
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, orden, id_padre, nivel, estado_registro)
VALUES (21266, 'CIs', '/plataforma/cmdb/cis', 1, 21133, 3, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    orden = EXCLUDED.orden,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    estado_registro = EXCLUDED.estado_registro;

-- 3. Actualizar #21139: Topología y relaciones (/plataforma/cmdb/topologia)
UPDATE opciones_menu
SET nombre = 'Topología y relaciones',
    url_menu = '/plataforma/cmdb/topologia',
    orden = 2,
    id_padre = 21133
WHERE id_opcion_menu = 21139;

-- 4. Actualizar #21135: Análisis de impacto (/plataforma/cmdb/analisis)
UPDATE opciones_menu
SET nombre = 'Análisis de impacto',
    url_menu = '/plataforma/cmdb/analisis',
    orden = 3,
    id_padre = 21133
WHERE id_opcion_menu = 21135;

-- 5. Actualizar #21141: Configuración de CMDB (/plataforma/cmdb/configuracion)
UPDATE opciones_menu
SET nombre = 'Configuración de CMDB',
    url_menu = '/plataforma/cmdb/configuracion',
    orden = 4,
    id_padre = 21133
WHERE id_opcion_menu = 21141;

-- 6. Eliminar permisos de las 7 opciones eliminadas
DELETE FROM opciones_menu_vistas_perfiles
WHERE id_opcion_menu IN (21134, 21136, 21137, 21138, 21140, 21142, 21153);

DELETE FROM opciones_menu_perfiles
WHERE id_opcion_menu IN (21134, 21136, 21137, 21138, 21140, 21142, 21153);

-- 7. Eliminar las 7 opciones de opciones_menu
DELETE FROM opciones_menu
WHERE id_opcion_menu IN (21134, 21136, 21137, 21138, 21140, 21142, 21153);

-- 8. Permisos de pantalla en opciones_menu_perfiles
-- #21133 (CMDB): perfiles 1, 2, 6, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21133, p.id_perfil
FROM (VALUES (1), (2), (6), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21266 (CIs): unión de perfiles que tenían #21135, #21139 o #21141 (1, 2, 6, 9)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21266, p.id_perfil
FROM (VALUES (1), (2), (6), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21139 (Topología y relaciones): perfiles 1, 2, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21139, p.id_perfil
FROM (VALUES (1), (2), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21135 (Análisis de impacto): perfiles 1, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21135, p.id_perfil
FROM (VALUES (1), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21141 (Configuración de CMDB): perfiles 1, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21141, p.id_perfil
FROM (VALUES (1), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- 9. Vistas N1 en opciones_menu_vistas_perfiles para #21141
DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21141;

-- Admin (1): clases, relaciones
-- Gestor de Activos (9): clases (heredado de #21141)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
(21141, 'clases', 1),
(21141, 'relaciones', 1),
(21141, 'clases', 9);

COMMIT;
