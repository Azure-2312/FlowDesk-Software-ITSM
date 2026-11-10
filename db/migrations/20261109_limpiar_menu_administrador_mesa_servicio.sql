-- ============================================================================
-- Migración: Limpiar opciones operativas de visualización de tickets del perfil Administrador
-- El Administrador se enfoca en configuración y gobernanza, no en gestión operativa de tickets.
-- ============================================================================

UPDATE opciones_menu_perfiles 
SET estado_registro = false 
WHERE id_perfil = 1 AND id_opcion_menu IN (
  21230, -- 'Todos los incidentes' (/plataforma/incidentes)
  21241, -- 'Todas las solicitudes' (/plataforma/solicitudes)
  21256  -- 'Todos los tickets' (/plataforma/tickets/gestion/todos)
);
