-- Saneamiento y Diferenciación Exhaustiva de URLs en opciones_menu (Fase B).
-- Erradica colisiones de URLs en toda la jerarquía de 9 perfiles ITSM.

ALTER TABLE opciones_menu ALTER COLUMN url_menu TYPE VARCHAR(255);

-- 1. Desactivar opciones legadas y huérfanas sin perfiles asignados
UPDATE opciones_menu
SET estado_registro = false
WHERE id_opcion_menu IN (533, 550, 551, 552, 560, 561, 572, 573, 580, 581, 582, 5200);

-- 2. Diferenciación de URLs en Catálogo de Servicios y SLAs (520)
UPDATE opciones_menu SET url_menu = '/admin/servicios' WHERE id_opcion_menu = 520;
UPDATE opciones_menu SET url_menu = '/admin/servicios?tipo=1' WHERE id_opcion_menu = 521;
UPDATE opciones_menu SET url_menu = '/admin/servicios?tipo=2' WHERE id_opcion_menu = 522;
UPDATE opciones_menu SET url_menu = '/admin/servicios?vista=categorias' WHERE id_opcion_menu = 523;
UPDATE opciones_menu SET url_menu = '/admin/portal-autoservicio' WHERE id_opcion_menu = 524;
UPDATE opciones_menu SET url_menu = '/admin/servicios?vista=sla' WHERE id_opcion_menu = 525;
UPDATE opciones_menu SET url_menu = '/admin/servicios?vista=flujo' WHERE id_opcion_menu = 5323;

-- 3. Diferenciación de URLs en Configuración de Procesos (5300)
UPDATE opciones_menu SET url_menu = '/admin/procesos' WHERE id_opcion_menu = 5300;
UPDATE opciones_menu SET url_menu = '/admin/procesos/incidentes' WHERE id_opcion_menu = 5310;
UPDATE opciones_menu SET url_menu = '/admin/tickets-formularios?tipo=incidente' WHERE id_opcion_menu = 5311;
UPDATE opciones_menu SET url_menu = '/admin/tickets-vistas?tipo=incidente' WHERE id_opcion_menu = 5312;
UPDATE opciones_menu SET url_menu = '/admin/tickets-vistas?seccion=estados' WHERE id_opcion_menu = 5313;
UPDATE opciones_menu SET url_menu = '/admin/notificaciones?proceso=incidente' WHERE id_opcion_menu = 5314;

UPDATE opciones_menu SET url_menu = '/admin/procesos/solicitudes' WHERE id_opcion_menu = 5320;
UPDATE opciones_menu SET url_menu = '/admin/tickets-formularios?tipo=solicitud' WHERE id_opcion_menu = 5321;
UPDATE opciones_menu SET url_menu = '/admin/tickets-vistas?tipo=solicitud' WHERE id_opcion_menu = 5322;
UPDATE opciones_menu SET url_menu = '/admin/notificaciones?proceso=solicitud' WHERE id_opcion_menu = 5324;

UPDATE opciones_menu SET url_menu = '/admin/procesos/cambios' WHERE id_opcion_menu = 5330;
UPDATE opciones_menu SET url_menu = '/admin/rfc?seccion=formulario' WHERE id_opcion_menu = 5331;
UPDATE opciones_menu SET url_menu = '/admin/rfc?seccion=requisitos' WHERE id_opcion_menu = 5332;
UPDATE opciones_menu SET url_menu = '/admin/rfc?seccion=aprobaciones' WHERE id_opcion_menu = 5333;
UPDATE opciones_menu SET url_menu = '/cambios/gestion/calendario' WHERE id_opcion_menu = 5334;

UPDATE opciones_menu SET url_menu = '/admin/procesos/problemas' WHERE id_opcion_menu = 5340;
UPDATE opciones_menu SET url_menu = '/admin/tickets-formularios?tipo=problema' WHERE id_opcion_menu = 5341;
UPDATE opciones_menu SET url_menu = '/problemas?vista=investigacion' WHERE id_opcion_menu = 5342;
UPDATE opciones_menu SET url_menu = '/problemas/kedb?origen=admin' WHERE id_opcion_menu = 5343;

-- 4. Diferenciación de URLs en Organización y Soporte (5400 y 530)
UPDATE opciones_menu SET url_menu = '/admin/organizacion' WHERE id_opcion_menu = 5400;
UPDATE opciones_menu SET url_menu = '/admin/departamentos-empresa' WHERE id_opcion_menu = 5401;
UPDATE opciones_menu SET url_menu = '/admin/departamentos' WHERE id_opcion_menu = 5402;
UPDATE opciones_menu SET url_menu = '/admin/tecnicos' WHERE id_opcion_menu = 5403;
UPDATE opciones_menu SET url_menu = '/admin/departamentos?vista=supervisores' WHERE id_opcion_menu = 5404;

UPDATE opciones_menu SET url_menu = '/supervisor/organizacion' WHERE id_opcion_menu = 530;
UPDATE opciones_menu SET url_menu = '/supervisor/departamentos-ti' WHERE id_opcion_menu = 531;
UPDATE opciones_menu SET url_menu = '/tecnicos/monitoreo' WHERE id_opcion_menu = 532;

-- 5. Diferenciación de URLs en Activos y Configuración (5500 y 300)
UPDATE opciones_menu SET url_menu = '/admin/activos-config' WHERE id_opcion_menu = 5500;
UPDATE opciones_menu SET url_menu = '/activos/inventario?seccion=tipos' WHERE id_opcion_menu = 5501;
UPDATE opciones_menu SET url_menu = '/activos/inventario?seccion=ciclo-vida' WHERE id_opcion_menu = 5502;
UPDATE opciones_menu SET url_menu = '/activos/licencias?vista=contratos' WHERE id_opcion_menu = 5503;
UPDATE opciones_menu SET url_menu = '/activos/cmdb/tipos' WHERE id_opcion_menu = 5504;

UPDATE opciones_menu SET url_menu = '/activos' WHERE id_opcion_menu = 300;
UPDATE opciones_menu SET url_menu = '/activos/inventario' WHERE id_opcion_menu = 310;
UPDATE opciones_menu SET url_menu = '/activos/cmdb' WHERE id_opcion_menu = 320;
UPDATE opciones_menu SET url_menu = '/activos/licencias' WHERE id_opcion_menu = 330;

-- 6. Diferenciación de URLs en Comunicaciones y Notificaciones (5600)
UPDATE opciones_menu SET url_menu = '/admin/comunicaciones' WHERE id_opcion_menu = 5600;
UPDATE opciones_menu SET url_menu = '/admin/notificaciones?seccion=plantillas' WHERE id_opcion_menu = 5601;
UPDATE opciones_menu SET url_menu = '/admin/notificaciones?seccion=canales' WHERE id_opcion_menu = 5602;

-- 7. Diferenciación de URLs en Gobierno del Conocimiento (5700)
UPDATE opciones_menu SET url_menu = '/admin/conocimiento' WHERE id_opcion_menu = 5700;
UPDATE opciones_menu SET url_menu = '/admin/conocimiento-config' WHERE id_opcion_menu = 5701;

-- 8. Diferenciación de URLs en Auditoría, Seguridad y Retención (5800 y 570/540)
UPDATE opciones_menu SET url_menu = '/admin/auditoria' WHERE id_opcion_menu = 5800;
UPDATE opciones_menu SET url_menu = '/admin/auditoria-sistema' WHERE id_opcion_menu = 5801;
UPDATE opciones_menu SET url_menu = '/admin/seguridad-logs' WHERE id_opcion_menu = 5802;
UPDATE opciones_menu SET url_menu = '/admin/mantenimiento-datos' WHERE id_opcion_menu = 5803;

UPDATE opciones_menu SET url_menu = '/auditor/registros' WHERE id_opcion_menu = 570;
UPDATE opciones_menu SET url_menu = '/auditor/auditoria-integral' WHERE id_opcion_menu = 571;
UPDATE opciones_menu SET url_menu = '/auditor/seguridad-logs' WHERE id_opcion_menu = 541;

-- 9. Diferenciación de URLs en Reportes y Analítica (400)
UPDATE opciones_menu SET url_menu = '/reportes' WHERE id_opcion_menu = 400;
UPDATE opciones_menu SET url_menu = '/tickets/reportes' WHERE id_opcion_menu = 410;
UPDATE opciones_menu SET url_menu = '/admin/reportes-disenador' WHERE id_opcion_menu = 420;

-- 10. Diferenciación de URLs en Carpetas de Operación y Soporte (100)
UPDATE opciones_menu SET url_menu = '/tickets/portal' WHERE id_opcion_menu = 110;
UPDATE opciones_menu SET url_menu = '/soporte' WHERE id_opcion_menu = 120;
UPDATE opciones_menu SET url_menu = '/supervisor' WHERE id_opcion_menu = 130;
UPDATE opciones_menu SET url_menu = '/area' WHERE id_opcion_menu = 140;

-- 11. Segregación estricta de Tickets de Departamento
UPDATE opciones_menu SET url_menu = '/tickets/gestion/departamento?tipo=tecnico' WHERE id_opcion_menu = 123;
UPDATE opciones_menu SET url_menu = '/tickets/gestion/departamento?tipo=area' WHERE id_opcion_menu = 142;

-- 12. Diferenciación de URLs en Gestión de Cambios (200)
UPDATE opciones_menu SET url_menu = '/cambios/cab' WHERE id_opcion_menu = 220;
UPDATE opciones_menu SET url_menu = '/cambios/gestion/cab' WHERE id_opcion_menu = 221;

-- 13. Diferenciación de URLs en Problemas (700)
UPDATE opciones_menu SET url_menu = '/problemas' WHERE id_opcion_menu = 700;
UPDATE opciones_menu SET url_menu = '/problemas/gestion/todos' WHERE id_opcion_menu = 710;
UPDATE opciones_menu SET url_menu = '/problemas/kedb' WHERE id_opcion_menu = 720;

-- 14. Limpieza final de últimas colisiones
UPDATE opciones_menu SET estado_registro = false WHERE id_opcion_menu IN (590, 591);
UPDATE opciones_menu SET url_menu = '/admin/identidades' WHERE id_opcion_menu = 510;
UPDATE opciones_menu SET url_menu = '/cambios/gestion/calendario?modo=admin' WHERE id_opcion_menu = 5334;
UPDATE opciones_menu SET url_menu = '/activos/cmdb/tipos?modo=admin' WHERE id_opcion_menu = 5504;
