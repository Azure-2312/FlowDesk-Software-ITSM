-- Reportes gerenciales (HU-13, HU-27): indicadores consolidados de SLA,
-- tiempos de atencion, satisfaccion y desgloses por departamento, prioridad,
-- estado y mes. Se publica como una pantalla mas del modulo Reportes.

BEGIN;

INSERT INTO opciones_menu (
  id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden,
  estado_registro, permiso_requerido, modulo_requerido, condicion_nivel,
  contador_clave, bloqueado, abierto_por_defecto
) VALUES (
  21265, 'Reportes gerenciales', '/plataforma/reportes/gerenciales',
  'Indicadores consolidados de SLA, tiempos de atencion, satisfaccion y desgloses por area.',
  21174, 2, 9, true, NULL, NULL, NULL, NULL, false, false
);

-- Administrador, supervisor, gestor de area y auditor: perfiles con la
-- capacidad reportes:ver que necesitan la vista consolidada.
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro) VALUES
  (21265, 1, 1, true),
  (21265, 4, 1, true),
  (21265, 5, 1, true),
  (21265, 6, 1, true);

COMMIT;
