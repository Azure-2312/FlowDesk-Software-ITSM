BEGIN;

-- El Administrador configura la plataforma; no recibe colas operativas por defecto.
DELETE FROM opciones_menu_perfiles
WHERE id_perfil = 1
  AND id_opcion_menu IN (100,110,111,112,113,114,120,121,122,123,124,130,131,132,133,134,
    135,136,140,141,142,143,200,210,211,212,213,220,221,300,310,320,330,340,
    600,610,620,700,710,720,800);

-- Prioriza la configuración administrativa; los informes quedan como acceso independiente.
UPDATE opciones_menu SET orden = 1 WHERE id_opcion_menu = 500;
UPDATE opciones_menu SET orden = 2 WHERE id_opcion_menu = 400;

COMMIT;
