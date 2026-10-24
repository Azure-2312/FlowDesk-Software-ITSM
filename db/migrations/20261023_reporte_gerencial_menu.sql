-- Reportes gerenciales (HU-27): indicadores consolidados de SLA,
-- tiempos de atencion, satisfaccion y desgloses por departamento, prioridad,
-- estado y mes. Se publica como una pantalla mas del modulo Reportes.

BEGIN;

INSERT INTO opciones_menu (
  id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden,
  estado_registro, permiso_requerido, modulo_requerido, condicion_nivel,
  contador_clave, bloqueado, abierto_por_defecto
) VALUES (
  21267, 'Reportes gerenciales', '/plataforma/reportes/gerenciales',
  'Indicadores consolidados de SLA, tiempos de atencion, satisfaccion y desgloses por area.',
  21174, 2, 9, true, NULL, NULL, NULL, NULL, false, false
)
ON CONFLICT (id_opcion_menu) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  url_menu = EXCLUDED.url_menu,
  descripcion = EXCLUDED.descripcion,
  id_padre = EXCLUDED.id_padre,
  nivel = EXCLUDED.nivel,
  orden = EXCLUDED.orden,
  estado_registro = EXCLUDED.estado_registro;

-- Administrador, supervisor, gestor de area y auditor: perfiles con la
-- capacidad reportes:ver que necesitan la vista consolidada.
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro) VALUES
  (21267, 1, 1, true),
  (21267, 4, 1, true),
  (21267, 5, 1, true),
  (21267, 6, 1, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET
  orden = EXCLUDED.orden,
  estado_registro = true;

COMMIT;
