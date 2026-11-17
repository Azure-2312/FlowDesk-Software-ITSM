-- ============================================================================
-- MIGRACIÓN FASE 7: ACTIVOS (N8)
-- ============================================================================
-- 1. Re-parent y reordenamiento de las 8 opciones supervivientes bajo #21110
-- 2. Eliminación de las 25 opciones eliminadas / fusionadas
-- 3. Re-parenting temporal de #21153 hacia #21133 (CMDB) antes de borrar #21148
-- 4. Actualización de opciones_menu_perfiles para unir perfiles de opciones fusionadas
-- 5. Inserción de permisos de vistas N1 en opciones_menu_vistas_perfiles
-- ============================================================================

BEGIN;

-- 0. Re-parenting de #21153 a #21133 (CMDB) para evitar FK violation al borrar #21148
UPDATE opciones_menu
SET id_padre = 21133
WHERE id_opcion_menu = 21153;

-- 1. Actualizar el sub-agrupador #21110 «Activos»
UPDATE opciones_menu
SET nombre = 'Activos',
    url_menu = '',
    orden = 1,
    id_padre = 21109
WHERE id_opcion_menu = 21110;

-- 2. Re-parentar y reordenar las 8 pantallas supervivientes bajo #21110
-- 1. #21114 Inventario de activos (/plataforma/activos/inventario)
UPDATE opciones_menu
SET id_padre = 21110,
    orden = 1,
    url_menu = '/plataforma/activos/inventario',
    nombre = 'Inventario de activos'
WHERE id_opcion_menu = 21114;

-- 2. #21118 Mis activos (/plataforma/activos/mis-activos)
UPDATE opciones_menu
SET id_padre = 21110,
    orden = 2,
    url_menu = '/plataforma/activos/mis-activos',
    nombre = 'Mis activos'
WHERE id_opcion_menu = 21118;

-- 3. #21112 Asignación, custodia y actas (/plataforma/activos/asignaciones)
UPDATE opciones_menu
SET id_padre = 21110,
    orden = 3,
    url_menu = '/plataforma/activos/asignaciones',
    nombre = 'Asignación, custodia y actas'
WHERE id_opcion_menu = 21112;

-- 4. #21126 Mantenimiento y garantías (/plataforma/activos/mantenimiento)
UPDATE opciones_menu
SET id_padre = 21110,
    orden = 4,
    url_menu = '/plataforma/activos/mantenimiento',
    nombre = 'Mantenimiento y garantías'
WHERE id_opcion_menu = 21126;

-- 5. #21132 Licencias de software (/plataforma/activos/licencias)
UPDATE opciones_menu
SET id_padre = 21110,
    orden = 5,
    url_menu = '/plataforma/activos/licencias',
    nombre = 'Licencias de software'
WHERE id_opcion_menu = 21132;

-- 6. #21144 Contratos y proveedores (/plataforma/activos/contratos)
UPDATE opciones_menu
SET id_padre = 21110,
    orden = 6,
    url_menu = '/plataforma/activos/contratos',
    nombre = 'Contratos y proveedores'
WHERE id_opcion_menu = 21144;

-- 7. #21123 Bajas de activos (/plataforma/activos/bajas)
UPDATE opciones_menu
SET id_padre = 21110,
    orden = 7,
    url_menu = '/plataforma/activos/bajas',
    nombre = 'Bajas de activos'
WHERE id_opcion_menu = 21123;

-- 8. #21154 Configuración de activos (/plataforma/activos/configuracion)
UPDATE opciones_menu
SET id_padre = 21110,
    orden = 8,
    url_menu = '/plataforma/activos/configuracion',
    nombre = 'Configuración de activos'
WHERE id_opcion_menu = 21154;

-- 3. Eliminar relaciones de permisos y vistas de las 25 opciones eliminadas
DELETE FROM opciones_menu_vistas_perfiles
WHERE id_opcion_menu IN (
  21111, 21113, 21115, 21116, 21117, 21119, 21120, 21122, 21124, 21125,
  21127, 21128, 21129, 21130, 21131, 21143, 21145, 21146, 21147, 21148,
  21149, 21150, 21151, 21152, 21155
);

DELETE FROM opciones_menu_perfiles
WHERE id_opcion_menu IN (
  21111, 21113, 21115, 21116, 21117, 21119, 21120, 21122, 21124, 21125,
  21127, 21128, 21129, 21130, 21131, 21143, 21145, 21146, 21147, 21148,
  21149, 21150, 21151, 21152, 21155
);

-- 4. Eliminar las 25 opciones de opciones_menu
DELETE FROM opciones_menu
WHERE id_opcion_menu IN (
  21111, 21113, 21115, 21116, 21117, 21119, 21120, 21122, 21124, 21125,
  21127, 21128, 21129, 21130, 21131, 21143, 21145, 21146, 21147, 21148,
  21149, 21150, 21151, 21152, 21155
);

-- 5. Asegurar accesos a nivel de pantalla en opciones_menu_perfiles
-- Sub-agrupador #21110 (Activos): perfiles 1, 2, 3, 4, 5, 6, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21110, p.id_perfil
FROM (VALUES (1), (2), (3), (4), (5), (6), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21114 Inventario: perfiles 1, 2, 4, 5, 6, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21114, p.id_perfil
FROM (VALUES (1), (2), (4), (5), (6), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21118 Mis activos: perfil 1, 3
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21118, p.id_perfil
FROM (VALUES (1), (3)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21112 Asignaciones: perfil 1, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21112, p.id_perfil
FROM (VALUES (1), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21126 Mantenimiento: perfil 1, 2, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21126, p.id_perfil
FROM (VALUES (1), (2), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21132 Licencias: perfil 1, 2, 4, 6, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21132, p.id_perfil
FROM (VALUES (1), (2), (4), (6), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21144 Contratos: perfil 1, 5, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21144, p.id_perfil
FROM (VALUES (1), (5), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21123 Bajas: perfil 1, 6, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21123, p.id_perfil
FROM (VALUES (1), (6), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- #21154 Configuración: perfil 1, 9
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil)
SELECT 21154, p.id_perfil
FROM (VALUES (1), (9)) AS p(id_perfil)
ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING;

-- 6. Insertar permisos granulares de vistas (N1) en opciones_menu_vistas_perfiles
-- Limpiar registros previos de estas pantallas para poblar estado limpio
DELETE FROM opciones_menu_vistas_perfiles
WHERE id_opcion_menu IN (21114, 21126, 21132, 21144, 21123, 21154);

-- #21114 Inventario de activos: todos, mi-area, operativo, importar
-- Admin (1): todos, mi-area, operativo, importar
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
(21114, 'todos', 1),
(21114, 'mi-area', 1),
(21114, 'operativo', 1),
(21114, 'importar', 1),
-- Tecnico (2): solo operativo
(21114, 'operativo', 2),
-- Supervisor (4): todos
(21114, 'todos', 4),
-- Gestor de Area (5): solo mi-area
(21114, 'mi-area', 5),
-- Auditor (6): todos
(21114, 'todos', 6),
-- Gestor de Activos (9): todos, importar
(21114, 'todos', 9),
(21114, 'importar', 9);

-- #21126 Mantenimiento y garantías: garantias, reparaciones
-- Admin (1): garantias, reparaciones
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
(21126, 'garantias', 1),
(21126, 'reparaciones', 1),
-- Tecnico (2): reparaciones
(21126, 'reparaciones', 2),
-- Gestor de Activos (9): garantias
(21126, 'garantias', 9);

-- #21132 Licencias de software: licencias, consulta, catalogo-software
-- Admin (1): licencias, consulta, catalogo-software
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
(21132, 'licencias', 1),
(21132, 'consulta', 1),
(21132, 'catalogo-software', 1),
-- Tecnico (2): consulta
(21132, 'consulta', 2),
-- Supervisor (4): licencias
(21132, 'licencias', 4),
-- Auditor (6): licencias
(21132, 'licencias', 6),
-- Gestor de Activos (9): catalogo-software
(21132, 'catalogo-software', 9);

-- #21144 Contratos y proveedores: contratos, mi-area, renovaciones, proveedores
-- Admin (1): contratos, mi-area, renovaciones, proveedores
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
(21144, 'contratos', 1),
(21144, 'mi-area', 1),
(21144, 'renovaciones', 1),
(21144, 'proveedores', 1),
-- Gestor de Area (5): mi-area
(21144, 'mi-area', 5),
-- Gestor de Activos (9): contratos, renovaciones, proveedores
(21144, 'contratos', 9),
(21144, 'renovaciones', 9),
(21144, 'proveedores', 9);

-- #21123 Bajas de activos: gestion, consulta
-- Admin (1): gestion, consulta
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
(21123, 'gestion', 1),
(21123, 'consulta', 1),
-- Auditor (6): consulta
(21123, 'consulta', 6),
-- Gestor de Activos (9): gestion
(21123, 'gestion', 9);

-- #21154 Configuración de activos: tipos-atributos, fabricantes-modelos, ubicaciones, listas
-- Admin (1): tipos-atributos, fabricantes-modelos, ubicaciones, listas
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, vista, id_perfil) VALUES
(21154, 'tipos-atributos', 1),
(21154, 'fabricantes-modelos', 1),
(21154, 'ubicaciones', 1),
(21154, 'listas', 1),
-- Gestor de Activos (9): fabricantes-modelos, ubicaciones, listas
(21154, 'fabricantes-modelos', 9),
(21154, 'ubicaciones', 9),
(21154, 'listas', 9);

COMMIT;
