-- ============================================================================
-- MIGRACIÓN: Desacoplamiento de nombres de roles en rutas de menú
-- FECHA: 2026-11-16
-- DESCRIPCIÓN:
-- Actualiza la opción de menú de inventario operativo (antes "Inventario técnico")
-- para ser agnóstica de rol y congruente con el principio de control de acceso dinámico.
-- ============================================================================

UPDATE opciones_menu
SET url_menu = '/plataforma/activos/inventario-operativo',
    nombre = 'Inventario operativo'
WHERE id_opcion_menu = 21117;
