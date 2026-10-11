-- Ajusta permisos persistentes para las instalaciones existentes.
-- Ejecutar una vez después de desplegar la versión que separa los perfiles 7, 8 y 9.

BEGIN;

-- Gestor de Cambios (8): cambios/RFC y lectura de CMDB para evaluación de impacto.
UPDATE opciones_menu_perfiles
SET estado_registro = false
WHERE id_perfil = 8;

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT id_opcion_menu, 8, orden, true
FROM opciones_menu
WHERE id_opcion_menu IN (200, 210, 211, 212, 213, 220, 221, 300, 320)
ON CONFLICT (id_opcion_menu, id_perfil)
DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

-- Gestor de Activos y Configuración (9): inventario, licencias, CMDB y relaciones.
UPDATE opciones_menu_perfiles
SET estado_registro = false
WHERE id_perfil = 9;

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT id_opcion_menu, 9, orden, true
FROM opciones_menu
WHERE id_opcion_menu IN (300, 310, 320, 330)
ON CONFLICT (id_opcion_menu, id_perfil)
DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

-- Impide votos duplicados del mismo integrante CAB para una misma RFC.
CREATE UNIQUE INDEX IF NOT EXISTS uq_cambio_aprobador_voto_activo
ON cambio_aprobacion (id_cambio, id_usuario_aprobador)
WHERE estado_registro = true;

COMMIT;
