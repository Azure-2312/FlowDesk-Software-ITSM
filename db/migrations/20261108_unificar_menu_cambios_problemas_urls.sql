-- Migración para unificar URLs canónicas de Cambios y Problemas en opciones_menu

BEGIN;

-- Módulo Cambios: actualización de URLs a rutas físicas Next.js
UPDATE opciones_menu
SET url_menu = '/plataforma/cambios/configuracion/formulario'
WHERE id_opcion_menu = 21191;

UPDATE opciones_menu
SET url_menu = '/plataforma/cambios/configuracion/flujo-evaluacion'
WHERE id_opcion_menu = 21193;

UPDATE opciones_menu
SET url_menu = '/plataforma/cambios/configuracion/tipos-requisitos'
WHERE id_opcion_menu = 21196;

UPDATE opciones_menu
SET url_menu = '/plataforma/cambios/configuracion/notificaciones-calendario'
WHERE id_opcion_menu = 21194;

UPDATE opciones_menu
SET url_menu = '/plataforma/cambios/configuracion/notificaciones-calendario?vista=feriados'
WHERE id_opcion_menu = 21192;

UPDATE opciones_menu
SET url_menu = '/plataforma/cambios/configuracion/notificaciones-calendario?vista=congelamiento'
WHERE id_opcion_menu = 21195;

UPDATE opciones_menu
SET url_menu = '/plataforma/cambios/configuracion/notificaciones-calendario?vista=ventanas'
WHERE id_opcion_menu = 21197;

-- Módulo Problemas: actualización de URLs a rutas físicas Next.js
UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/configuracion/formulario'
WHERE id_opcion_menu = 21199;

UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/configuracion/flujo'
WHERE id_opcion_menu = 21200;

UPDATE opciones_menu
SET url_menu = '/plataforma/problemas/configuracion/relaciones'
WHERE id_opcion_menu = 21201;

COMMIT;
