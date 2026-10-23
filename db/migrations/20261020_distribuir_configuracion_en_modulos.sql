-- Elimina la raiz Configuracion y distribuye sus opciones en los modulos
-- duenos de cada pantalla. No cambia URLs ni carpetas fisicas.
--
-- Destinos:
--   Mesa de Servicio > Incidentes / Solicitudes  (formulario y flujo)
--   Cambios                                      (formulario, flujo, tipos, calendario)
--   Problemas                                    (formulario, flujo, relaciones)
--   Conocimiento                                 (categorias y reglas editoriales)
--   Organizacion                                 (nueva raiz de dominio)
--   Plataforma                                   (identidades, menu y notificaciones)
--
-- La visibilidad de las pantallas movidas no cambia. Solo se agrega la
-- visibilidad del Administrador para la nueva raiz Organizacion y para la
-- raiz Conocimiento, que antes no estaba asignada al perfil 1.

BEGIN;

-- Nueva raiz de dominio para la configuracion organizacional.
INSERT INTO opciones_menu (
  id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden,
  estado_registro, permiso_requerido, modulo_requerido, condicion_nivel,
  contador_clave, bloqueado, abierto_por_defecto
) VALUES (
  '21264', 'Organización', '', 'Departamentos, grupos resolutores, supervisores y técnicos.', NULL, '1', '10',
  'true', NULL, NULL, NULL, NULL, 'false', 'false'
)
ON CONFLICT (id_opcion_menu) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  url_menu = EXCLUDED.url_menu,
  descripcion = EXCLUDED.descripcion,
  id_padre = EXCLUDED.id_padre,
  nivel = EXCLUDED.nivel,
  orden = EXCLUDED.orden,
  estado_registro = EXCLUDED.estado_registro;

-- Mesa de Servicio: la configuracion vuelve al modulo que la usa.
UPDATE opciones_menu
SET id_padre = '21228', nivel = '3', orden = '11'
WHERE id_opcion_menu = '21240'; -- Configuracion del formulario de Incidentes

UPDATE opciones_menu
SET id_padre = '21228', nivel = '3', orden = '12'
WHERE id_opcion_menu = '21187'; -- Flujo de estados y acciones de Incidentes

UPDATE opciones_menu
SET id_padre = '21229', nivel = '3', orden = '10'
WHERE id_opcion_menu = '21250'; -- Configuracion del formulario de Solicitudes

UPDATE opciones_menu
SET id_padre = '21229', nivel = '3', orden = '11'
WHERE id_opcion_menu = '21186'; -- Flujo de atencion y aprobaciones de Solicitudes

-- Cambios: formulario, flujo, tipos, notificaciones y calendario.
UPDATE opciones_menu
SET id_padre = '21059', nivel = '2', orden = '5'
WHERE id_opcion_menu = '21191'; -- Configuracion de formulario

UPDATE opciones_menu
SET id_padre = '21059', nivel = '2', orden = '6'
WHERE id_opcion_menu = '21193'; -- Flujo de evaluacion, autorizacion y revision posterior

UPDATE opciones_menu
SET id_padre = '21059', nivel = '2', orden = '7'
WHERE id_opcion_menu = '21196'; -- Tipos de cambio y requisitos

UPDATE opciones_menu
SET id_padre = '21059', nivel = '2', orden = '8'
WHERE id_opcion_menu = '21194'; -- Notificaciones de cambios

UPDATE opciones_menu
SET id_padre = '21059', nivel = '2', orden = '9'
WHERE id_opcion_menu = '21192'; -- Feriados

UPDATE opciones_menu
SET id_padre = '21059', nivel = '2', orden = '10'
WHERE id_opcion_menu = '21195'; -- Periodos de congelamiento

UPDATE opciones_menu
SET id_padre = '21059', nivel = '2', orden = '11'
WHERE id_opcion_menu = '21197'; -- Ventanas de mantenimiento

-- Problemas: formulario, flujo y relaciones.
UPDATE opciones_menu
SET id_padre = '21091', nivel = '2', orden = '18'
WHERE id_opcion_menu = '21199'; -- Configuracion de formulario

UPDATE opciones_menu
SET id_padre = '21091', nivel = '2', orden = '19'
WHERE id_opcion_menu = '21200'; -- Flujo de investigacion y seguimiento

UPDATE opciones_menu
SET id_padre = '21091', nivel = '2', orden = '20'
WHERE id_opcion_menu = '21201'; -- Relaciones con incidentes, KEDB y conocimiento

-- Conocimiento: categorias y reglas editoriales.
UPDATE opciones_menu
SET id_padre = '21156', nivel = '2', orden = '7'
WHERE id_opcion_menu = '21202';

-- Organizacion: las cuatro pantallas pasan a colgar de la nueva raiz.
UPDATE opciones_menu
SET id_padre = '21264', nivel = '2', orden = '1'
WHERE id_opcion_menu = '21204'; -- Departamentos empresariales

UPDATE opciones_menu
SET id_padre = '21264', nivel = '2', orden = '2'
WHERE id_opcion_menu = '21205'; -- Departamentos y grupos resolutores de TI

UPDATE opciones_menu
SET id_padre = '21264', nivel = '2', orden = '3'
WHERE id_opcion_menu = '21206'; -- Supervisores

UPDATE opciones_menu
SET id_padre = '21264', nivel = '2', orden = '4'
WHERE id_opcion_menu = '21207'; -- Tecnicos y niveles de soporte

-- Plataforma: identidades, menu y notificaciones.
UPDATE opciones_menu
SET id_padre = '21215', nivel = '2', orden = '5'
WHERE id_opcion_menu = '21208'; -- Identidades

UPDATE opciones_menu
SET id_padre = '21215', nivel = '2', orden = '6'
WHERE id_opcion_menu = '21211'; -- Menu y notificaciones

-- Visibilidad nueva: raiz Organizacion y raiz Conocimiento para el perfil 1.
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro) VALUES
  ('21264', 1, 1, true),
  ('21156', 1, 1, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET
  orden = EXCLUDED.orden,
  estado_registro = EXCLUDED.estado_registro;

-- Retirar la visibilidad de las carpetas que desaparecen.
DELETE FROM opciones_menu_perfiles
WHERE id_opcion_menu IN ('21184', '21185', '21190', '21198', '21203', '21262', '21263');

-- Retirar las carpetas vacias. Las pantallas ya fueron reubicadas.
DELETE FROM opciones_menu
WHERE id_opcion_menu IN ('21184', '21185', '21190', '21198', '21203', '21262', '21263');

COMMIT;
