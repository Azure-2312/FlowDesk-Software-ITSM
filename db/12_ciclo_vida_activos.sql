-- ============================================================================
-- 12 · Ciclo de vida de activos: el Aprobador decide las bajas por monto
-- ----------------------------------------------------------------------------
-- Las bajas de activos que valen 2 000 o más las decide el Aprobador (perfil 7).
-- Hasta ahora ese perfil no tenía la pantalla "Centro de aprobaciones" de
-- activos (#21275) en su menú. Este script se la agrega, con sus menús padre y
-- sus pestañas "Pendientes" e "Historial".
--
-- El Gestor de Área y el Administrador ya la tenían. La bandeja muestra a
-- cada perfil solo las bajas que puede decidir.
-- Puede ejecutarse más de una vez (no duplica).
-- ============================================================================
WITH RECURSIVE cadena AS (
  SELECT id_opcion_menu, id_padre FROM opciones_menu WHERE id_opcion_menu = 21275
  UNION
  SELECT o.id_opcion_menu, o.id_padre FROM opciones_menu o JOIN cadena c ON o.id_opcion_menu = c.id_padre
)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT c.id_opcion_menu, 7, COALESCE((SELECT MAX(orden) FROM opciones_menu_perfiles x WHERE x.id_opcion_menu = c.id_opcion_menu), 1), true
  FROM cadena c
 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu_perfiles x WHERE x.id_opcion_menu = c.id_opcion_menu AND x.id_perfil = 7);

UPDATE opciones_menu_perfiles SET estado_registro = true WHERE id_opcion_menu = 21275 AND id_perfil = 7;

INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro, creado_en)
SELECT 21275, 7, v.vista, true, now()
  FROM (VALUES ('pendientes'), ('historial')) v(vista)
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true;

-- Verificación
SELECT om.nombre, string_agg(p.nombre, ', ' ORDER BY p.id_perfil) AS perfiles
  FROM opciones_menu_perfiles omp
  JOIN opciones_menu om ON om.id_opcion_menu = omp.id_opcion_menu
  JOIN perfiles p ON p.id_perfil = omp.id_perfil
 WHERE omp.id_opcion_menu = 21275 AND omp.estado_registro
 GROUP BY om.nombre;
