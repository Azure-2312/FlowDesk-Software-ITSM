-- ============================================================================
-- MIGRACIÓN: Ajuste de Opciones de Menú para Administrador y Módulo de Problemas
-- ============================================================================
-- 1. Elimina 'Historial de cambios' (21080) y 'Registro de problemas' (21106)
--    del menú del perfil Administrador (id_perfil = 1).
-- 2. Renombra la opción 21106 de 'Registro de problemas' a 'Historial de problemas'
--    con URL canónica '/plataforma/problemas/historial'.
-- 3. Actualiza la opción 21105 'Registrar problema' a '/plataforma/problemas/crear'
--    y la asigna al perfil Gestor de Problemas (id_perfil = 10).
-- ============================================================================

-- 1. Desasignar opciones operativas del Administrador
DELETE FROM opciones_menu_perfiles 
WHERE id_perfil = 1 AND id_opcion_menu IN (21080, 21106);

-- 2. Renombrar y actualizar URL del Historial de problemas
UPDATE opciones_menu 
SET nombre = 'Historial de problemas',
    url_menu = '/plataforma/problemas/historial',
    descripcion = 'Historial y bitácora completa de problemas, estados, causas raíz y soluciones temporales (workarounds).'
WHERE id_opcion_menu = 21106;

-- 3. Actualizar URL de Registrar problema
UPDATE opciones_menu 
SET url_menu = '/plataforma/problemas/crear'
WHERE id_opcion_menu = 21105;

-- 4. Asignar 'Registrar problema' al Gestor de Problemas
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
VALUES (21105, 10, 14, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
