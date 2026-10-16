-- Agrupa los procesos de incidentes y solicitudes bajo sus propias carpetas,
-- alineando "Configuración de procesos" con la estructura de "Gestión de problemas"
-- y "Gestión de cambios" (perfil Administrador).

-- 1. Carpetas contenedoras nuevas (nivel 3) bajo "Configuración de procesos" (11012).
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
VALUES
  (11059, 'Gestión de incidentes', '/admin/procesos/incidentes', 'Configuración del proceso de gestión de incidentes.', 11012, 3, 1, true),
  (11060, 'Gestión de solicitudes', '/admin/procesos/solicitudes', 'Configuración del proceso de gestión de solicitudes de servicio.', 11012, 3, 2, true)
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    descripcion = EXCLUDED.descripcion,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- 2. Reubicar las opciones internas bajo sus carpetas (nivel 4).
UPDATE opciones_menu SET id_padre = 11059, nivel = 4, orden = 1 WHERE id_opcion_menu = 11013;
UPDATE opciones_menu SET id_padre = 11059, nivel = 4, orden = 2 WHERE id_opcion_menu = 11014;
UPDATE opciones_menu SET id_padre = 11060, nivel = 4, orden = 1 WHERE id_opcion_menu = 11015;
UPDATE opciones_menu SET id_padre = 11060, nivel = 4, orden = 2 WHERE id_opcion_menu = 11016;

-- 3. Reordenar los procesos restantes al mismo nivel.
UPDATE opciones_menu SET orden = 3 WHERE id_opcion_menu = 11017; -- Gestión de problemas
UPDATE opciones_menu SET orden = 4 WHERE id_opcion_menu = 11021; -- Gestión de cambios

-- 4. Asignar las carpetas nuevas al Administrador (Perfil 1).
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
VALUES (11059, 1, true), (11060, 1, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
