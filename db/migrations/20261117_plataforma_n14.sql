-- Migración Fase 13: Plataforma (#21215)
-- Estado final: 3 pantallas planas (#21209, #21210, #21220)
-- 11 opciones eliminadas: #21208, #21211, #21213, #21216, #21217, #21218, #21219, #21221, #21222, #21223, #21224

BEGIN;

-- 1. Actualizar las 3 pantallas hijas de Plataforma (#21215)
UPDATE opciones_menu
SET id_padre = 21215,
    orden = 1,
    nombre = 'Gestión de usuarios',
    url_menu = '/plataforma/seguridad/usuarios'
WHERE id_opcion_menu = 21209;

UPDATE opciones_menu
SET id_padre = 21215,
    orden = 2,
    nombre = 'Perfiles y permisos',
    url_menu = '/plataforma/seguridad/perfiles'
WHERE id_opcion_menu = 21210;

UPDATE opciones_menu
SET id_padre = 21215,
    orden = 3,
    nombre = 'Auditoría y accesos',
    url_menu = '/plataforma/seguridad/auditoria-sistema'
WHERE id_opcion_menu = 21220;

-- 2. Eliminar referencias de las 11 opciones en opciones_menu_vistas_perfiles
DELETE FROM opciones_menu_vistas_perfiles
WHERE id_opcion_menu IN (21208, 21211, 21213, 21216, 21217, 21218, 21219, 21221, 21222, 21223, 21224);

-- 3. Eliminar referencias de las 11 opciones en opciones_menu_perfiles
DELETE FROM opciones_menu_perfiles
WHERE id_opcion_menu IN (21208, 21211, 21213, 21216, 21217, 21218, 21219, 21221, 21222, 21223, 21224);

-- 4. Eliminar las 11 opciones de opciones_menu
DELETE FROM opciones_menu
WHERE id_opcion_menu IN (21208, 21211, 21213, 21216, 21217, 21218, 21219, 21221, 21222, 21223, 21224);

-- 5. Asegurar permisos de pantalla en opciones_menu_perfiles
-- Raíz #21215: Admin (1), Auditor (6)
INSERT INTO opciones_menu_perfiles (id_perfil, id_opcion_menu)
SELECT 1, 21215 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu_perfiles WHERE id_perfil = 1 AND id_opcion_menu = 21215);

INSERT INTO opciones_menu_perfiles (id_perfil, id_opcion_menu)
SELECT 6, 21215 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu_perfiles WHERE id_perfil = 6 AND id_opcion_menu = 21215);

-- #21209: Admin (1)
INSERT INTO opciones_menu_perfiles (id_perfil, id_opcion_menu)
SELECT 1, 21209 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu_perfiles WHERE id_perfil = 1 AND id_opcion_menu = 21209);

-- #21210: Admin (1), Auditor (6)
INSERT INTO opciones_menu_perfiles (id_perfil, id_opcion_menu)
SELECT 1, 21210 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu_perfiles WHERE id_perfil = 1 AND id_opcion_menu = 21210);

INSERT INTO opciones_menu_perfiles (id_perfil, id_opcion_menu)
SELECT 6, 21210 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu_perfiles WHERE id_perfil = 6 AND id_opcion_menu = 21210);

-- #21220: Admin (1), Auditor (6)
INSERT INTO opciones_menu_perfiles (id_perfil, id_opcion_menu)
SELECT 1, 21220 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu_perfiles WHERE id_perfil = 1 AND id_opcion_menu = 21220);

INSERT INTO opciones_menu_perfiles (id_perfil, id_opcion_menu)
SELECT 6, 21220 WHERE NOT EXISTS (SELECT 1 FROM opciones_menu_perfiles WHERE id_perfil = 6 AND id_opcion_menu = 21220);

-- 6. Configurar vistas para #21220 en opciones_menu_vistas_perfiles
-- Vistas: configuracion (hereda de 21220), accesos (hereda de 21221)
-- Perfil 1 (Admin) y Perfil 6 (Auditor)
INSERT INTO opciones_menu_vistas_perfiles (id_perfil, id_opcion_menu, vista)
VALUES
  (1, 21220, 'configuracion'),
  (1, 21220, 'accesos'),
  (6, 21220, 'configuracion'),
  (6, 21220, 'accesos')
ON CONFLICT DO NOTHING;

COMMIT;
