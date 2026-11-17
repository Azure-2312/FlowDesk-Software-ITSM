-- ============================================================================
-- MIGRACIÓN: Saneamiento Integral y Desacoplamiento de Roles - Módulo Problemas
-- FECHA: 2026-11-16
-- DESCRIPCIÓN:
-- 1. Sincroniza y canoniza todas las URLs de pantallas del módulo de Problemas
--    hacia rutas agnósticas de perfiles directamente bajo /plataforma/problemas/*.
-- 2. Erradica la subcarpeta artificial /gestion/ (relicto del perfil Gestor).
-- 3. Resuelve colisiones entre candidatos, mayores y aprobaciones.
-- ============================================================================

BEGIN;

-- 1. Análisis de causa raíz
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/analisis'
WHERE id_opcion_menu = 21092;

-- 2. Bandeja y asignación de problemas
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/asignacion',
    nombre = 'Bandeja y asignación'
WHERE id_opcion_menu IN (21093, 21094);

-- 3. Candidatos a problema
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/candidatos',
    nombre = 'Candidatos a problema'
WHERE id_opcion_menu IN (21095, 21096);

-- 4. Conocimiento derivado
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/conocimiento'
WHERE id_opcion_menu = 21097;

-- 5. Errores conocidos (KEDB)
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/kedb',
    nombre = 'Errores conocidos (KEDB)'
WHERE id_opcion_menu IN (21098, 21099);

-- 6. Incidentes recurrentes
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/recurrentes'
WHERE id_opcion_menu = 21100;

-- 7. Objetivos de tiempo
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/objetivos'
WHERE id_opcion_menu = 21101;

-- 8. Problemas asignados a mí
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/asignados'
WHERE id_opcion_menu = 21102;

-- 9. Problemas de mi grupo
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/grupo'
WHERE id_opcion_menu = 21103;

-- 10. Problemas mayores y comités PIR
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/mayores',
    nombre = 'Problemas mayores y comités'
WHERE id_opcion_menu = 21104;

-- 11. Riesgo aceptado y aprobación de cierre
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/aprobaciones',
    nombre = 'Aprobación de riesgo y cierre'
WHERE id_opcion_menu = 21107;

-- 12. Solicitudes de cambio derivadas
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/cambios'
WHERE id_opcion_menu = 21108;

-- 13. Panel de gestión de problemas
UPDATE opciones_menu
SET url_menu = '/plataforma/operacion/paneles/gestor-problemas'
WHERE id_opcion_menu = 21013;

COMMIT;
