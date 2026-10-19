-- Fase 3 (ITIL 4): el catalogo de consulta del tecnico pasa al modulo servicios.
-- La pantalla vive en /plataforma/servicios/catalogo; la ruta legada
-- /plataforma/perfiles/tecnico/catalogo queda como redireccion.

BEGIN;

UPDATE opciones_menu
SET url_menu = '/plataforma/servicios/catalogo'
WHERE id_opcion_menu = 21164;

COMMIT;
