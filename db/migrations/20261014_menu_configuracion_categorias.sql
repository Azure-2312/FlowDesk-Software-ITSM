-- Inclusión de la opción "Configuración de categorías" en el menú de navegación bajo Catálogo de servicios y SLAs (520)

INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES (527, 'Configuración de categorías', '/admin/servicios?vista=categorias', 'Gestión, clasificación y SLA base de categorías del catálogo', 520, 3, 4, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

UPDATE opciones_menu SET orden = 1, nivel = 3 WHERE id_opcion_menu = 521;
UPDATE opciones_menu SET orden = 2, nivel = 3 WHERE id_opcion_menu = 522;
UPDATE opciones_menu SET orden = 3, nivel = 3 WHERE id_opcion_menu = 526;
UPDATE opciones_menu SET orden = 4, nivel = 3 WHERE id_opcion_menu = 527;
UPDATE opciones_menu SET orden = 5, nivel = 3 WHERE id_opcion_menu = 525;

-- Asignación de permisos al Administrador (Perfil 1)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
VALUES (527, 1, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
