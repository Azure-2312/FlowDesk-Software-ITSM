-- Agrega "Análisis e impacto" dentro de la carpeta CMDB (id 19017) del
-- perfil Gestor de Activos y Configuración (perfil 9).
-- Da acceso a la vista de topología, análisis de impacto y reconciliación
-- Activo ↔ CI (src/modules/cmdb/views/VistaCmdbAnalisis.tsx).

-- 1. Opción de menú (nivel 2, hija de CMDB).
INSERT INTO opciones_menu (
  id_opcion_menu, id_padre, orden, nivel, nombre, url_menu, descripcion,
  bloqueado, abierto_por_defecto, estado_registro
)
VALUES (
  19032, 19017, 7, 2, 'Análisis e impacto', '/activos/cmdb/analisis',
  'Topología de dependencias, impacto en fallas y reconciliación Activo ↔ CI.',
  false, false, true
)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET id_padre = EXCLUDED.id_padre,
    orden = EXCLUDED.orden,
    nivel = EXCLUDED.nivel,
    nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    bloqueado = EXCLUDED.bloqueado,
    abierto_por_defecto = EXCLUDED.abierto_por_defecto,
    estado_registro = true;

-- 2. Asignación al perfil 9 (Gestor de Activos y Configuración).
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
VALUES (19032, 9, 99, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE
SET orden = EXCLUDED.orden,
    estado_registro = true;
