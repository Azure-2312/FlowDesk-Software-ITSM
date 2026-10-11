BEGIN;

INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (590, 'Configuración de Activos y CMDB', '/activos/cmdb/tipos', 'Modelos y clases de configuración tecnológica', 500, 2, 9, true),
  (591, 'Clases de elementos de configuración', '/activos/cmdb/tipos', 'Definición administrativa de clases y atributos CMDB', 590, 3, 1, true)
ON CONFLICT (id_opcion_menu) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  url_menu = EXCLUDED.url_menu,
  descripcion = EXCLUDED.descripcion,
  id_padre = EXCLUDED.id_padre,
  nivel = EXCLUDED.nivel,
  orden = EXCLUDED.orden,
  estado_registro = true;

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
VALUES (590, 1, 9, true), (591, 1, 1, true)
ON CONFLICT (id_opcion_menu, id_perfil)
DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

SELECT setval('opciones_menu_id_opcion_menu_seq', (SELECT MAX(id_opcion_menu) FROM opciones_menu));

COMMIT;
