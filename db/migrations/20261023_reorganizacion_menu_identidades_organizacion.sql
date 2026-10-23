-- Reorganizacion del menu para las pantallas de identidades y organizacion.
--
-- El refactor unificado movio las rutas de /admin/* a /plataforma/seguridad/*
-- y /plataforma/organizacion/*, y actualizo db/seed.sql. Esta migracion lleva
-- ese mismo estado a las bases existentes sin obligar a recrearlas.

BEGIN;

-- Raiz del modulo Organizacion.
INSERT INTO opciones_menu (
  id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden,
  estado_registro, permiso_requerido, modulo_requerido, condicion_nivel,
  contador_clave, bloqueado, abierto_por_defecto
) VALUES (
  21264, 'Organización', '', 'Departamentos, grupos resolutores, supervisores y técnicos.',
  NULL, 1, 10, true, NULL, NULL, NULL, NULL, false, false
)
ON CONFLICT (id_opcion_menu) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  url_menu = EXCLUDED.url_menu,
  descripcion = EXCLUDED.descripcion,
  id_padre = EXCLUDED.id_padre,
  nivel = EXCLUDED.nivel,
  orden = EXCLUDED.orden,
  estado_registro = EXCLUDED.estado_registro;

-- Pantallas de organizacion colgando de la nueva raiz.
INSERT INTO opciones_menu (
  id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden,
  estado_registro, permiso_requerido, modulo_requerido, condicion_nivel,
  contador_clave, bloqueado, abierto_por_defecto
) VALUES
  (21204, 'Departamentos empresariales', '/plataforma/organizacion/departamentos-empresa', 'Áreas de negocio (finanzas, legal, ventas, marketing) y su Gestor de Área.', 21264, 2, 1, true, NULL, NULL, NULL, NULL, false, false),
  (21205, 'Grupos resolutores de TI', '/plataforma/organizacion/departamentos', 'Áreas técnicas y grupos resolutores.', 21264, 2, 2, true, NULL, NULL, NULL, NULL, false, false),
  (21206, 'Supervisores', '/plataforma/organizacion/departamentos/supervisores', 'Asignación de supervisores a áreas técnicas.', 21264, 2, 3, true, NULL, NULL, NULL, NULL, false, false),
  (21207, 'Técnicos y niveles de soporte', '/plataforma/organizacion/tecnicos', 'Técnicos, niveles N1/N2/N3 y ausencias.', 21264, 2, 4, true, NULL, NULL, NULL, NULL, false, false)
ON CONFLICT (id_opcion_menu) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  url_menu = EXCLUDED.url_menu,
  descripcion = EXCLUDED.descripcion,
  id_padre = EXCLUDED.id_padre,
  nivel = EXCLUDED.nivel,
  orden = EXCLUDED.orden,
  estado_registro = EXCLUDED.estado_registro;

-- Identidades pasa a colgar de Plataforma (21215).
INSERT INTO opciones_menu (
  id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden,
  estado_registro, permiso_requerido, modulo_requerido, condicion_nivel,
  contador_clave, bloqueado, abierto_por_defecto
) VALUES (
  21208, 'Identidades', '', '', 21215, 2, 5, true, NULL, NULL, NULL, NULL, false, false
)
ON CONFLICT (id_opcion_menu) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  url_menu = EXCLUDED.url_menu,
  descripcion = EXCLUDED.descripcion,
  id_padre = EXCLUDED.id_padre,
  nivel = EXCLUDED.nivel,
  orden = EXCLUDED.orden,
  estado_registro = EXCLUDED.estado_registro;

-- Pantallas de identidades y consola auditora.
INSERT INTO opciones_menu (
  id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden,
  estado_registro, permiso_requerido, modulo_requerido, condicion_nivel,
  contador_clave, bloqueado, abierto_por_defecto
) VALUES
  (21209, 'Gestión de usuarios', '/plataforma/seguridad/usuarios', 'Alta, edición, bloqueo y desbloqueo de usuarios; asignación de perfiles múltiples; envío de credenciales.', 21208, 3, 1, true, NULL, NULL, NULL, NULL, false, false),
  (21210, 'Perfiles y permisos', '/plataforma/seguridad/perfiles', 'Matriz de permisos por perfil.', 21208, 3, 2, true, NULL, NULL, NULL, NULL, false, false),
  (21220, 'Auditoría de cambios', '/plataforma/seguridad/auditoria-sistema', 'Registro inmutable de cambios de configuración (antes y después).', 21215, 2, 1, true, NULL, NULL, NULL, NULL, false, false),
  (21221, 'Registros de seguridad', '/plataforma/seguridad/seguridad-logs', '', 21215, 2, 2, true, NULL, NULL, NULL, NULL, false, false),
  (21222, 'Recertificación de accesos', '/plataforma/seguridad/accesos/recertificacion', 'Revisión periódica de usuarios y perfiles con confirmación o retiro.', 21215, 2, 2, true, NULL, NULL, NULL, NULL, false, false)
ON CONFLICT (id_opcion_menu) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  url_menu = EXCLUDED.url_menu,
  descripcion = EXCLUDED.descripcion,
  id_padre = EXCLUDED.id_padre,
  nivel = EXCLUDED.nivel,
  orden = EXCLUDED.orden,
  estado_registro = EXCLUDED.estado_registro;

-- El Administrador debe ver la nueva raiz de Organizacion y sus pantallas.
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
VALUES
  (21264, 1, 1, true),
  (21204, 1, 1, true),
  (21205, 1, 1, true),
  (21206, 1, 1, true),
  (21207, 1, 1, true),
  (21209, 1, 1, true),
  (21210, 1, 1, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET
  orden = EXCLUDED.orden,
  estado_registro = true;

COMMIT;
