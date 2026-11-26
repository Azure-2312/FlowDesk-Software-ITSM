-- Pestaña "Umbral de recurrencia" en Problemas → Configuración (auditoría 2026-11-25).
-- Se otorga a todo perfil que ya tenga la pestaña "campos" de esa pantalla.
-- (El Administrador ve todas las vistas registradas sin necesidad de esta fila.)
INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro)
SELECT v.id_opcion_menu, v.id_perfil, 'umbral', true
  FROM opciones_menu_vistas_perfiles v
  JOIN opciones_menu o ON o.id_opcion_menu = v.id_opcion_menu
 WHERE o.url_menu = '/plataforma/problemas/configuracion'
   AND v.vista = 'campos' AND v.estado_registro = true
   AND NOT EXISTS (
     SELECT 1 FROM opciones_menu_vistas_perfiles x
      WHERE x.id_opcion_menu = v.id_opcion_menu AND x.id_perfil = v.id_perfil AND x.vista = 'umbral'
   );
