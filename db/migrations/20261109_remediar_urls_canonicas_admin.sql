-- Remediación de URLs canónicas del Administrador y módulos globales

BEGIN;

-- 1. Panel de Administración
UPDATE opciones_menu SET url_menu = '/plataforma/operacion/paneles/administrador' WHERE id_opcion_menu = 21021;

-- 2. Activos y CMDB -> Catálogos
UPDATE opciones_menu SET url_menu = '/plataforma/activos/configuracion/ciclos-vida-transiciones' WHERE id_opcion_menu = 21149;
UPDATE opciones_menu SET url_menu = '/plataforma/activos/configuracion/tipos-modelos-atributos?vista=fabricantes' WHERE id_opcion_menu = 21150;
UPDATE opciones_menu SET url_menu = '/plataforma/activos/configuracion/licencias-contratos' WHERE id_opcion_menu = 21151;
UPDATE opciones_menu SET url_menu = '/plataforma/activos/configuracion/tipos-modelos-atributos?vista=catalogos' WHERE id_opcion_menu = 21152;
UPDATE opciones_menu SET url_menu = '/plataforma/activos/configuracion/cmdb-relaciones' WHERE id_opcion_menu = 21153;
UPDATE opciones_menu SET url_menu = '/plataforma/activos/configuracion/tipos-modelos-atributos' WHERE id_opcion_menu = 21154;
UPDATE opciones_menu SET url_menu = '/plataforma/activos/configuracion/tipos-modelos-atributos?vista=ubicaciones' WHERE id_opcion_menu = 21155;

-- 3. Conocimiento
UPDATE opciones_menu SET url_menu = '/plataforma/conocimiento/configuracion' WHERE id_opcion_menu = 21202;

-- 4. Catálogo de Servicios
UPDATE opciones_menu SET url_menu = '/plataforma/servicios/configuracion/categorias' WHERE id_opcion_menu = 21165;
UPDATE opciones_menu SET url_menu = '/plataforma/servicios/configuracion/crear' WHERE id_opcion_menu = 21166;
UPDATE opciones_menu SET url_menu = '/plataforma/servicios/configuracion/sla' WHERE id_opcion_menu = 21167;
UPDATE opciones_menu SET url_menu = '/plataforma/servicios/configuracion/incidentes' WHERE id_opcion_menu = 21168;
UPDATE opciones_menu SET url_menu = '/plataforma/servicios/configuracion/solicitudes' WHERE id_opcion_menu = 21169;

-- 5. Organización
UPDATE opciones_menu SET url_menu = '/plataforma/organizacion/departamentos-empresa' WHERE id_opcion_menu = 21204;
UPDATE opciones_menu SET url_menu = '/plataforma/organizacion/departamentos' WHERE id_opcion_menu = 21205;
UPDATE opciones_menu SET url_menu = '/plataforma/organizacion/departamentos/supervisores' WHERE id_opcion_menu = 21206;
UPDATE opciones_menu SET url_menu = '/plataforma/organizacion/tecnicos' WHERE id_opcion_menu = 21207;

-- 6. Plataforma / Seguridad / Operación
UPDATE opciones_menu SET url_menu = '/plataforma/seguridad/usuarios' WHERE id_opcion_menu = 21209;
UPDATE opciones_menu SET url_menu = '/plataforma/seguridad/perfiles' WHERE id_opcion_menu = 21210;
UPDATE opciones_menu SET url_menu = '/plataforma/operacion/notificaciones' WHERE id_opcion_menu = 21212;
UPDATE opciones_menu SET url_menu = '/plataforma/operacion/menu' WHERE id_opcion_menu = 21213;
UPDATE opciones_menu SET url_menu = '/plataforma/operacion/notificaciones' WHERE id_opcion_menu = 21214;
UPDATE opciones_menu SET url_menu = '/plataforma/seguridad/auditoria-sistema' WHERE id_opcion_menu = 21220;
UPDATE opciones_menu SET url_menu = '/plataforma/seguridad/seguridad-logs' WHERE id_opcion_menu = 21221;
UPDATE opciones_menu SET url_menu = '/plataforma/operacion/mantenimiento-datos' WHERE id_opcion_menu = 21223;
UPDATE opciones_menu SET url_menu = '/plataforma/operacion/salud-sistema' WHERE id_opcion_menu = 21224;

-- 7. Mesa de Servicio (Incidentes y Solicitudes flujos)
UPDATE opciones_menu SET url_menu = '/plataforma/incidentes/configuracion/flujo' WHERE id_opcion_menu = 21187;
UPDATE opciones_menu SET url_menu = '/plataforma/solicitudes/configuracion/flujo' WHERE id_opcion_menu = 21186;

-- 8. Mi cuenta
UPDATE opciones_menu SET url_menu = '/plataforma/mi-cuenta/perfil' WHERE id_opcion_menu = 21226;

-- 9. Columna nivel_prioridad en usuario (si no existe)
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS nivel_prioridad SMALLINT DEFAULT 5;

COMMIT;
