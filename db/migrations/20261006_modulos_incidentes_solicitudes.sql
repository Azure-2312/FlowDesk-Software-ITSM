BEGIN;

-- Incidentes y solicitudes son módulos de primer nivel. El almacenamiento
-- compartido en ticket se conserva; las APIs dedicadas fijan el tipo.
UPDATE opciones_menu
SET url_menu = '/incidentes', nombre = 'Incidentes',
    descripcion = 'Módulo independiente de registro y gestión de incidentes'
WHERE id_opcion_menu = 135;

UPDATE opciones_menu
SET url_menu = '/solicitudes', nombre = 'Solicitudes de Servicio',
    descripcion = 'Módulo independiente de atención de solicitudes de servicio'
WHERE id_opcion_menu = 136;

-- Solo roles operativos de TI acceden a estas colas; el solicitante usa
-- el catálogo y su vista personal, y el administrador configura procesos.
DELETE FROM opciones_menu_perfiles
WHERE id_opcion_menu IN (135, 136)
  AND id_perfil NOT IN (2, 4);

INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
VALUES (135, 2, 1, true), (136, 2, 2, true), (135, 4, 1, true), (136, 4, 2, true)
ON CONFLICT (id_opcion_menu, id_perfil)
DO UPDATE SET orden = EXCLUDED.orden, estado_registro = true;

COMMIT;
