-- Elimina del catálogo de menú (gen-1) las filas cuyas rutas NO existen como
-- página y cuya función ya está cubierta por las opciones por perfil (gen-2).
--
-- Contexto: la migración 20261010_saneamiento_colisiones_urls_menu.sql reapuntó
-- estas filas del catálogo antiguo a rutas por rol (/supervisor/..., /auditor/...,
-- /tecnicos/monitoreo) para desempatar URLs con las nuevas filas de /admin.
-- Esas páginas nunca se construyeron y su contenido real vive en las opciones
-- por perfil:
--
--   531  Departamentos de TI     -> 11028  /admin/departamentos      (Administrador)
--   532  Especialistas técnicos  -> 11029  /admin/tecnicos           (Administrador)
--   541  Registros de seguridad  -> 11043  /admin/seguridad-logs     (Administrador)
--                                   16009  /admin/seguridad-logs     (Auditor)
--   571  Auditoría integral      -> 11042  /admin/auditoria-sistema  (Administrador)
--                                   16008  /admin/auditoria-sistema  (Auditor)
--   710  Registro de problemas   -> 20002  /problemas                (Gestor de Problemas)
--                                   14023  /problemas                (Supervisor)
--
-- Las filas 530 y 570 son las carpetas padre (se quedan sin hijos) y 533 / 573
-- sus hermanas ya desactivadas: se eliminan en bloque para no dejar huérfanos.
-- Ninguna de las 9 filas tiene filas en opciones_menu_perfiles (verificado).

-- 1. Desvincular de perfiles (por si quedaran asignaciones, activas o no).
DELETE FROM opciones_menu_perfiles
WHERE id_opcion_menu IN (530, 531, 532, 533, 570, 541, 571, 573, 710);

-- 2. Eliminar las opciones del catálogo gen-1.
DELETE FROM opciones_menu
WHERE id_opcion_menu IN (530, 531, 532, 533, 570, 541, 571, 573, 710);

-- Reversa (solo si hubiera que reconstruir el catálogo gen-1):
-- INSERT INTO opciones_menu
--   (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, bloqueado, abierto_por_defecto)
-- VALUES
--   (530, 'Estructura organizacional y soporte', '/plataforma/perfiles/supervisor/organizacion', 'Estructura organizativa y capacidad resolutora', 500, 2, 3, true,  false, false),
--   (531, 'Departamentos de TI',                 '/plataforma/perfiles/supervisor/departamentos-ti', 'Áreas organizacionales y unidades resolutoras', 530, 3, 1, true,  false, false),
--   (532, 'Especialistas técnicos',              '/tecnicos/monitoreo', 'Niveles de soporte L1/L2/L3 y capacidad WIP', 530, 3, 2, true,  false, false),
--   (533, 'Departamentos empresariales',         '/admin/departamentos-empresa', 'Unidades organizativas configurables de cada cliente', 530, 3, 3, false, false, false),
--   (570, 'Auditoría y registros',               '/plataforma/perfiles/auditor/registros', 'Consulta de auditoría operativa, seguridad y mantenimiento de registros', 500, 2, 7, true,  false, false),
--   (541, 'Registros de seguridad',              '/plataforma/perfiles/auditor/seguridad-logs', 'Accesos, intentos fallidos y bloqueos', 570, 3, 2, true,  false, false),
--   (571, 'Auditoría integral',                  '/plataforma/perfiles/auditor/auditoria-integral', 'Trazabilidad integral del sistema', 570, 3, 1, true,  false, false),
--   (573, 'Mantenimiento de datos',              '/admin/mantenimiento-datos', 'Retención, depuración y mantenimiento de datos', 570, 3, 3, false, false, false),
--   (710, 'Registro de problemas',               '/problemas/gestion/todos', 'Investigación y seguimiento de problemas ITSM', 700, 2, 1, true,  false, false);
