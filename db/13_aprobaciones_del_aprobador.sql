-- ============================================================================
-- 13 · Pantallas del Aprobador: cierre de problemas mayores y renovaciones
-- ----------------------------------------------------------------------------
-- 1. Nueva opción "Cierre de problemas mayores" (#21278) en Problemas, para el
--    Aprobador y el Administrador: autoriza (o devuelve) el cierre de los
--    problemas mayores que el Gestor de Problemas dejó en "Resuelto".
-- 2. Nueva pestaña "Renovaciones de licencias" en Activos → Centro de
--    aprobaciones (#21275), solo para el Aprobador (el Administrador ve todas
--    las pestañas sin necesitar filas).
--
-- Requiere db/12 (que ya da al Aprobador el Centro de aprobaciones de activos).
-- Puede ejecutarse más de una vez (no duplica).
-- ============================================================================

-- 1. Opción de menú --------------------------------------------------------
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
SELECT 21278, 'Cierre de problemas mayores', '/plataforma/problemas/mayores',
       'Autoriza el cierre de problemas mayores aceptando el riesgo residual',
       (SELECT id_padre FROM opciones_menu WHERE url_menu = '/plataforma/problemas/todos' LIMIT 1),
       2,
       COALESCE((SELECT MAX(orden) + 1 FROM opciones_menu
                  WHERE id_padre = (SELECT id_padre FROM opciones_menu WHERE url_menu = '/plataforma/problemas/todos' LIMIT 1)), 1),
       true
 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/plataforma/problemas/mayores');

SELECT setval('opciones_menu_id_opcion_menu_seq', GREATEST((SELECT MAX(id_opcion_menu) FROM opciones_menu), 1));

-- Perfiles: la opción y toda su cadena de menús padre
WITH RECURSIVE cadena AS (
  SELECT id_opcion_menu, id_padre FROM opciones_menu WHERE url_menu = '/plataforma/problemas/mayores'
  UNION
  SELECT o.id_opcion_menu, o.id_padre FROM opciones_menu o JOIN cadena c ON o.id_opcion_menu = c.id_padre
)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT c.id_opcion_menu, p.id_perfil,
       COALESCE((SELECT MAX(orden) FROM opciones_menu_perfiles x WHERE x.id_opcion_menu = c.id_opcion_menu), 1), true
  FROM cadena c CROSS JOIN (VALUES (1), (7)) AS p(id_perfil)
 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu_perfiles x WHERE x.id_opcion_menu = c.id_opcion_menu AND x.id_perfil = p.id_perfil);

UPDATE opciones_menu_perfiles SET estado_registro = true
 WHERE id_opcion_menu = (SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = '/plataforma/problemas/mayores')
   AND id_perfil IN (1, 7);

-- 2. Pestaña de renovaciones para el Aprobador -------------------------------
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro, creado_en)
VALUES (21275, 7, 'renovaciones', true, now())
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true;

-- Verificación ------------------------------------------------------------------
SELECT om.id_opcion_menu, om.nombre, om.url_menu,
       string_agg(DISTINCT p.nombre, ', ') AS perfiles
  FROM opciones_menu om
  JOIN opciones_menu_perfiles omp ON omp.id_opcion_menu = om.id_opcion_menu AND omp.estado_registro
  JOIN perfiles p ON p.id_perfil = omp.id_perfil
 WHERE om.url_menu IN ('/plataforma/problemas/mayores', '/plataforma/activos/aprobaciones')
 GROUP BY om.id_opcion_menu, om.nombre, om.url_menu;

SELECT id_perfil, vista FROM opciones_menu_vistas_perfiles
 WHERE id_opcion_menu = 21275 AND estado_registro ORDER BY id_perfil, vista;
