BEGIN;
UPDATE opciones_menu SET nombre='Auditoría y registros',descripcion='Consulta de auditoría operativa, seguridad y mantenimiento de registros' WHERE id_opcion_menu=570;
UPDATE opciones_menu SET id_padre=570,nivel=3,orden=2,nombre='Registros de seguridad',descripcion='Accesos, intentos fallidos y bloqueos' WHERE id_opcion_menu=541;
DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu=540;
DELETE FROM opciones_menu WHERE id_opcion_menu=540;
INSERT INTO opciones_menu_perfiles(id_opcion_menu,id_perfil,orden,estado_registro) VALUES(570,1,1,true),(570,6,1,true),(541,1,2,true),(541,6,2,true)
ON CONFLICT(id_opcion_menu,id_perfil) DO UPDATE SET estado_registro=true,orden=EXCLUDED.orden;
INSERT INTO opciones_menu_perfiles(id_opcion_menu,id_perfil,orden,estado_registro) VALUES(135,1,2,true),(136,1,3,true)
ON CONFLICT(id_opcion_menu,id_perfil) DO UPDATE SET estado_registro=true,orden=EXCLUDED.orden;
UPDATE opciones_menu SET orden=1 WHERE id_opcion_menu=571;
UPDATE opciones_menu SET orden=3 WHERE id_opcion_menu=573;
COMMIT;
