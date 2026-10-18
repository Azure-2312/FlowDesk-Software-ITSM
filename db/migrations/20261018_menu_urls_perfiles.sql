-- Quita los alias raiz de las consolas de rol. Hasta ahora las paginas se
-- servian con los alias /tecnico, /supervisor, /gestor-area, /aprobador,
-- /auditor y /gestor-cambios (rewrites de next.config.js). Esos alias se
-- eliminaron: las consolas se sirven con la URL de su carpeta fisica,
-- /plataforma/perfiles/<rol>/...
--
-- La unica columna de la base que guarda URLs de navegacion es
-- opciones_menu.url_menu, por lo que este es el unico cambio de datos.
-- NO se tocan perfiles, usuario_perfiles, opciones_menu_perfiles ni
-- servicio_catalogo_perfiles: los id_perfil siguen siendo los mismos y cada
-- usuario conserva su relacion con su perfil en usuario_perfiles.

UPDATE opciones_menu
SET url_menu = '/plataforma/perfiles' || url_menu
WHERE url_menu ~ '^/(tecnico|supervisor|gestor-area|aprobador|auditor|gestor-cambios)(/|$)';

-- Reversa (por si hubiera que volver a los alias raiz):
--
-- UPDATE opciones_menu
-- SET url_menu = regexp_replace(
--       url_menu,
--       '^/plataforma/perfiles/(tecnico|supervisor|gestor-area|aprobador|auditor|gestor-cambios)',
--       '/\1'
--     )
-- WHERE url_menu ~ '^/plataforma/perfiles/(tecnico|supervisor|gestor-area|aprobador|auditor|gestor-cambios)(/|$)';
