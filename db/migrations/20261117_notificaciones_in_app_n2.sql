-- ============================================================================
-- MIGRACIÓN: Notificaciones In-App y Retiro de Canales Externos (N2 - Fase 2)
-- FECHA: 2026-11-17
-- DESCRIPCIÓN:
-- 1. Crea la tabla notificaciones para el centro de notificaciones in-app.
-- 2. Agrega la columna debe_cambiar_clave a usuario (N6).
-- 3. Inserta la opción de menú #21265 «Notificaciones» concedida a todos los perfiles.
-- 4. Elimina las opciones de menú #21212, #21214 y #21227.
-- ============================================================================

BEGIN;

-- 1. Tabla de Notificaciones In-App
CREATE TABLE IF NOT EXISTS notificaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  evento VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  entidad_tipo VARCHAR(50) NOT NULL,
  entidad_id INT,
  url_destino VARCHAR(255) NOT NULL,
  leida BOOLEAN DEFAULT false NOT NULL,
  creada_en TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  leida_en TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_leida 
ON notificaciones(usuario_id, leida, creada_en DESC);

-- 2. Credencial temporal con cambio obligatorio (N6)
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS debe_cambiar_clave BOOLEAN DEFAULT false NOT NULL;

-- 3. Inserción de la nueva opción de menú «Notificaciones» (#21265)
INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, id_padre, nivel, orden, estado_registro, descripcion)
VALUES (21265, 'Notificaciones', '/plataforma/notificaciones', 21001, 2, 5, true, 'Centro unificado de notificaciones in-app del sistema')
ON CONFLICT (id_opcion_menu) DO UPDATE
SET nombre = EXCLUDED.nombre,
    url_menu = EXCLUDED.url_menu,
    id_padre = EXCLUDED.id_padre,
    nivel = EXCLUDED.nivel,
    orden = EXCLUDED.orden,
    estado_registro = true;

-- Concesión de Notificaciones (#21265) a los 10 perfiles oficiales
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
SELECT 21265, id_perfil, 5, true
FROM perfiles
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;

-- 4. Eliminación de las 3 opciones de canales externos obsoletos:
-- #21212 Configuración de contacto
-- #21214 Plantillas de correo y otros canales
-- #21227 Preferencias de notificación
DELETE FROM opciones_menu_perfiles
WHERE id_opcion_menu IN (21212, 21214, 21227);

DELETE FROM opciones_menu
WHERE id_opcion_menu IN (21212, 21214, 21227);

COMMIT;
