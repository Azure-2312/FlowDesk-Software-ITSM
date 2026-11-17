-- ============================================================================
-- MIGRACIÓN FASE 3: MI TRABAJO Y MI CUENTA (N3 - INICIO, N4 - APROBACIONES)
-- ============================================================================

-- 1. Actualizar opción #21022 a «Inicio» (/plataforma/inicio, padre #21001, orden 1)
UPDATE opciones_menu 
SET nombre = 'Inicio', 
    url_menu = '/plataforma/inicio', 
    id_padre = 21001, 
    orden = 1 
WHERE id_opcion_menu = 21022;

-- 2. Reordenar opción #21020 «Mis tareas» (padre #21001, orden 2)
UPDATE opciones_menu 
SET id_padre = 21001, 
    orden = 2 
WHERE id_opcion_menu = 21020;

-- 3. Actualizar y mover #21249 a «Mis aprobaciones» (/plataforma/aprobaciones, padre #21001, orden 3)
UPDATE opciones_menu 
SET nombre = 'Mis aprobaciones', 
    url_menu = '/plataforma/aprobaciones', 
    id_padre = 21001, 
    orden = 3 
WHERE id_opcion_menu = 21249;

-- 4. Reordenar y mover #21004 «Delegaciones» (padre #21001, orden 4)
UPDATE opciones_menu 
SET id_padre = 21001, 
    orden = 4 
WHERE id_opcion_menu = 21004;

-- 5. Reordenar #21265 «Notificaciones» (padre #21001, orden 5)
UPDATE opciones_menu 
SET id_padre = 21001, 
    orden = 5 
WHERE id_opcion_menu = 21265;

-- 6. Conceder #21022 (Inicio) a TODOS los 10 perfiles en opciones_menu_perfiles (REC-PER + D-01)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
SELECT 21022, p.id_perfil, true
FROM perfiles p
WHERE p.estado_registro = true
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;

-- 7. Conceder #21249 (Mis aprobaciones) a los perfiles correspondientes (1, 4, 5, 7)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
VALUES 
  (21249, 1, true),
  (21249, 4, true),
  (21249, 5, true),
  (21249, 7, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;

-- 8. Conceder #21004 (Delegaciones) a los perfiles correspondientes (1, 5, 7)
INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
VALUES 
  (21004, 1, true),
  (21004, 5, true),
  (21004, 7, true)
ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;

-- 9. Registrar permisos de vistas granulares (N1) en opciones_menu_vistas_perfiles
-- 9.1 Vistas para #21022 (/plataforma/inicio)
-- Perfil 1 (Administrador): todas las 10 vistas
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES 
  (21022, 1, 'administrador'),
  (21022, 1, 'solicitante'),
  (21022, 1, 'tecnico'),
  (21022, 1, 'supervisor'),
  (21022, 1, 'aprobador'),
  (21022, 1, 'area'),
  (21022, 1, 'gestion-activos'),
  (21022, 1, 'gestion-cambios'),
  (21022, 1, 'gestion-problemas'),
  (21022, 1, 'auditor')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- Perfiles operativos específicos (REC-PER + D-01)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES 
  (21022, 2, 'tecnico'),          (21022, 2, 'solicitante'),
  (21022, 3, 'solicitante'),
  (21022, 4, 'supervisor'),       (21022, 4, 'tecnico'),        (21022, 4, 'solicitante'),
  (21022, 5, 'area'),             (21022, 5, 'solicitante'),
  (21022, 6, 'auditor'),          (21022, 6, 'solicitante'),
  (21022, 7, 'aprobador'),        (21022, 7, 'solicitante'),
  (21022, 8, 'gestion-cambios'),  (21022, 8, 'solicitante'),
  (21022, 9, 'gestion-activos'),  (21022, 9, 'solicitante'),
  (21022, 10, 'gestion-problemas'),(21022, 10, 'solicitante')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- 9.2 Vistas para #21249 (/plataforma/aprobaciones)
-- Vistas posibles: 'pendientes', 'historial', 'historial-area'
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista)
VALUES 
  (21249, 1, 'pendientes'), (21249, 1, 'historial'), (21249, 1, 'historial-area'),
  (21249, 4, 'pendientes'),
  (21249, 5, 'pendientes'), (21249, 5, 'historial-area'),
  (21249, 7, 'pendientes'), (21249, 7, 'historial')
ON CONFLICT (id_opcion_menu, id_perfil, vista) DO NOTHING;

-- 10. Eliminar permisos y filas de las 23 opciones eliminadas/absorbidas
DELETE FROM opciones_menu_perfiles 
WHERE id_opcion_menu IN (
  21002, 21003, 21005, 21006, 21007, 21008, 21009, 21010,
  21011, 21012, 21013, 21014, 21015, 21016, 21017, 21018,
  21019, 21021, 21061, 21088, 21089, 21121, 21183
);

DELETE FROM opciones_menu 
WHERE id_opcion_menu IN (
  21002, 21003, 21005, 21006, 21007, 21008, 21009, 21010,
  21011, 21012, 21013, 21014, 21015, 21016, 21017, 21018,
  21019, 21021, 21061, 21088, 21089, 21121, 21183
);
