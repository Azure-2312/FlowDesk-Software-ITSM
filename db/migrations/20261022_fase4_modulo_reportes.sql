-- Fase 4 (ITIL 4): todos los reportes, de cualquier perfil o dominio, pasan
-- al modulo reportes. Las rutas anteriores quedan como redirecciones.

BEGIN;

UPDATE opciones_menu SET url_menu = '/plataforma/reportes/operativos'   WHERE id_opcion_menu = 21175;
UPDATE opciones_menu SET url_menu = '/plataforma/reportes/auditoria'    WHERE id_opcion_menu = 21176;
UPDATE opciones_menu SET url_menu = '/plataforma/reportes/productividad' WHERE id_opcion_menu = 21177;
UPDATE opciones_menu SET url_menu = '/plataforma/reportes/activos'      WHERE id_opcion_menu = 21178;
UPDATE opciones_menu SET url_menu = '/plataforma/reportes/cambios'      WHERE id_opcion_menu = 21179;
UPDATE opciones_menu SET url_menu = '/plataforma/reportes/decisiones'   WHERE id_opcion_menu = 21180;
UPDATE opciones_menu SET url_menu = '/plataforma/reportes/problemas'    WHERE id_opcion_menu = 21181;
UPDATE opciones_menu SET url_menu = '/plataforma/reportes/area'         WHERE id_opcion_menu = 21182;
UPDATE opciones_menu SET url_menu = '/plataforma/reportes/tableros'     WHERE id_opcion_menu = 21183;

COMMIT;
