-- Reorganiza la configuracion de la Mesa de Servicio en cuatro niveles:
-- Configuracion > Mesa de Servicio > Incidentes/Solicitudes > formulario y flujo.
--
-- No mueve carpetas fisicas ni cambia URLs: solo reubica las opciones de menu
-- existentes 21240, 21250, 21186 y 21187 bajo dos carpetas nuevas.
-- La visibilidad se mantiene en el perfil 1 (Administrador), igual que antes.

BEGIN;

INSERT INTO opciones_menu (
  id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden,
  estado_registro, permiso_requerido, modulo_requerido, condicion_nivel,
  contador_clave, bloqueado, abierto_por_defecto
) VALUES
  ('21262', 'Incidentes', '', 'Configuracion de formularios y flujos del modulo Incidentes.', '21185', '3', '1', 'true', NULL, NULL, NULL, NULL, 'false', 'false'),
  ('21263', 'Solicitudes', '', 'Configuracion de formularios y flujos del modulo Solicitudes.', '21185', '3', '2', 'true', NULL, NULL, NULL, NULL, 'false', 'false')
ON CONFLICT (id_opcion_menu) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  url_menu = EXCLUDED.url_menu,
  descripcion = EXCLUDED.descripcion,
  id_padre = EXCLUDED.id_padre,
  nivel = EXCLUDED.nivel,
  orden = EXCLUDED.orden,
  estado_registro = EXCLUDED.estado_registro;

UPDATE opciones_menu
SET nombre = 'Configuración del formulario',
    descripcion = 'Campos y reglas del reporte de incidentes.',
    id_padre = '21262',
    nivel = '4',
    orden = '1'
WHERE id_opcion_menu = '21240';

UPDATE opciones_menu
SET id_padre = '21262',
    nivel = '4',
    orden = '2'
WHERE id_opcion_menu = '21187';

UPDATE opciones_menu
SET nombre = 'Configuración del formulario',
    descripcion = 'Campos y reglas del requerimiento de servicios.',
    id_padre = '21263',
    nivel = '4',
    orden = '1'
WHERE id_opcion_menu = '21250';

UPDATE opciones_menu
SET id_padre = '21263',
    nivel = '4',
    orden = '2'
WHERE id_opcion_menu = '21186';

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro) VALUES
  ('21262', 1, 1, true),
  ('21263', 1, 1, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET
  orden = EXCLUDED.orden,
  estado_registro = EXCLUDED.estado_registro;

COMMIT;
